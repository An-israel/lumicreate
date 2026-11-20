import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Copies product images hosted elsewhere (e.g. supplier listings) into the
// product-images bucket so product pages don't depend on third-party links.
// Admin/staff only.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "product-images";
const MAX_URLS = 40;
const MAX_BYTES = 8 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 15_000;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

// Only public https hosts; refuse IP literals and internal names
const isAllowedUrl = (raw: string) => {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return false;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":")) return false;
    return host.includes(".");
  } catch {
    return false;
  }
};

const copyOne = async (
  admin: ReturnType<typeof createClient>,
  sourceUrl: string,
): Promise<string> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(sourceUrl, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LuminateImageImporter/1.0)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const contentType = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    const ext = EXTENSIONS[contentType];
    if (!ext) throw new Error(`not an image (${contentType || "unknown type"})`);

    const declared = Number(res.headers.get("content-length") || 0);
    if (declared > MAX_BYTES) throw new Error("image larger than 8MB");

    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength > MAX_BYTES) throw new Error("image larger than 8MB");

    const path = `imported/${crypto.randomUUID()}.${ext}`;
    const { error } = await admin.storage.from(BUCKET).upload(path, bytes, { contentType });
    if (error) throw error;

    return admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  } finally {
    clearTimeout(timer);
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1. Only signed-in admins or staff
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authError || !user) return json({ error: "Invalid authentication" }, 401);

    const admin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: allowed, error: roleError } = await admin.rpc("is_admin_or_staff", { _user_id: user.id });
    if (roleError || !allowed) return json({ error: "Admins and staff only" }, 403);

    // 2. Validate input
    const body = await req.json().catch(() => ({}));
    const urls: unknown = body?.urls;
    if (!Array.isArray(urls) || urls.length === 0) return json({ error: "Provide a list of image URLs" }, 400);
    if (urls.length > MAX_URLS) return json({ error: `At most ${MAX_URLS} images per request` }, 400);

    // 3. Copy each image; report failures without failing the whole batch
    const images: Record<string, string> = {};
    const failed: Record<string, string> = {};

    await Promise.all(
      Array.from(new Set(urls.map(String))).map(async (url) => {
        if (!isAllowedUrl(url)) {
          failed[url] = "only public https links are allowed";
          return;
        }
        try {
          images[url] = await copyOne(admin, url);
        } catch (error) {
          failed[url] = error instanceof Error ? error.message : String(error);
        }
      }),
    );

    return json({ images, failed });
  } catch (error) {
    console.error("import-product-images error:", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
};

serve(handler);
