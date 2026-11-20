import { supabase } from "@/integrations/supabase/client";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024;

/** Upload a local image file to the product-images bucket and return its public URL. */
export const uploadProductImage = async (file: File): Promise<string> => {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image`);
  if (file.size > MAX_BYTES) throw new Error(`${file.name} is larger than 5MB`);

  const ext = file.name.split(".").pop() || "jpg";
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
};

const isOwnStorageUrl = (url: string) => url.includes(`/storage/v1/object/public/${BUCKET}/`);

/**
 * Copy images hosted elsewhere (e.g. a supplier's site) into our own storage,
 * so they keep working if the supplier removes or changes them.
 * Returns the new URLs in the same order; URLs that fail keep their original value
 * and are listed in `failed`.
 */
export const copyImagesToStorage = async (urls: string[]): Promise<{ urls: string[]; failed: string[] }> => {
  const external = Array.from(new Set(urls.filter((url) => url && !isOwnStorageUrl(url))));
  if (external.length === 0) return { urls, failed: [] };

  const { data, error } = await supabase.functions.invoke("import-product-images", {
    body: { urls: external },
  });
  if (error) throw error;

  const mapped: Record<string, string> = data?.images || {};
  return {
    urls: urls.map((url) => mapped[url] || url),
    failed: external.filter((url) => !mapped[url]),
  };
};
