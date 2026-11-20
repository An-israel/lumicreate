import { CONTENT_TYPES } from "@/lib/constants";
import { PRODUCT_CATEGORIES } from "@/lib/productCategories";
import { ContentType, ProductTier } from "@/types/database";

/** Spreadsheet columns, in template order. Only the first three are required. */
export const IMPORT_COLUMNS = [
  "name",
  "price_naira",
  "tier",
  "category",
  "description",
  "original_price_naira",
  "content_types",
  "in_stock",
  "is_package",
  "image_url",
  "gallery_image_urls",
  "specs",
  "supplier_name",
  "supplier_url",
  "supplier_product_id",
  "supplier_sku_id",
  "cost_price_naira",
  "notes",
] as const;

export const TEMPLATE_ROWS: Record<string, string>[] = [
  {
    name: "18-inch LED Ring Light with Phone Holder",
    price_naira: "28000",
    tier: "basic",
    category: "key-lights",
    description: "Soft, even light for faces. Three colour modes and ten brightness levels.",
    original_price_naira: "35000",
    content_types: "tiktok; youtube",
    in_stock: "yes",
    is_package: "no",
    image_url: "https://example.com/ring-light.jpg",
    gallery_image_urls: "https://example.com/ring-light-2.jpg | https://example.com/ring-light-3.jpg",
    specs: "Light Type: LED ring | Power: 18W | Colour Temperature: 3200K–5600K | In the Box: Light, stand, phone holder, remote",
    supplier_name: "AliExpress",
    supplier_url: "https://www.aliexpress.com/item/1005001234567890.html",
    supplier_product_id: "",
    supplier_sku_id: "",
    cost_price_naira: "17500",
    notes: "Ships in about 15 days",
  },
  {
    name: "USB Condenser Microphone with Boom Arm",
    price_naira: "65000",
    tier: "premium",
    category: "microphones",
    description: "Plug-and-play studio sound for podcasts and voice-overs.",
    original_price_naira: "",
    content_types: "podcast; youtube; live_streaming",
    in_stock: "yes",
    is_package: "no",
    image_url: "",
    gallery_image_urls: "",
    specs: "Type: Condenser | Connection: USB-C | Polar Pattern: Cardioid",
    supplier_name: "Alibaba",
    supplier_url: "",
    supplier_product_id: "",
    supplier_sku_id: "",
    cost_price_naira: "41000",
    notes: "",
  },
];

export interface ImportedProduct {
  name: string;
  price_naira: number;
  original_price_naira: number | null;
  tier: ProductTier;
  category: string | null;
  description: string | null;
  content_types: ContentType[];
  in_stock: boolean;
  is_package: boolean;
  image_url: string | null;
  image_urls: string[];
  specifications: Record<string, string>;
}

export interface ImportedSourcing {
  supplier_name: string | null;
  supplier_url: string | null;
  supplier_product_id: string | null;
  supplier_sku_id: string | null;
  cost_price_naira: number | null;
  notes: string | null;
}

export interface ParsedRow {
  /** Spreadsheet row number as the user sees it (header is row 1) */
  rowNumber: number;
  product: ImportedProduct | null;
  sourcing: ImportedSourcing | null;
  errors: string[];
  warnings: string[];
}

const TIERS: ProductTier[] = ["basic", "premium", "diamond"];
const TIER_ALIASES: Record<string, ProductTier> = {
  basic: "basic",
  budget: "basic",
  entry: "basic",
  premium: "premium",
  mid: "premium",
  "mid-range": "premium",
  diamond: "diamond",
  pro: "diamond",
  professional: "diamond",
};

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim());

/** Normalise header names: "Price (₦)" → "price", "Supplier URL" → "supplier_url" */
export const normaliseHeader = (header: string) =>
  header
    .trim()
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const HEADER_ALIASES: Record<string, string> = {
  price: "price_naira",
  selling_price: "price_naira",
  original_price: "original_price_naira",
  compare_at_price: "original_price_naira",
  cost: "cost_price_naira",
  cost_price: "cost_price_naira",
  landed_cost: "cost_price_naira",
  grade: "tier",
  image: "image_url",
  main_image: "image_url",
  gallery: "gallery_image_urls",
  images: "gallery_image_urls",
  specifications: "specs",
  supplier: "supplier_name",
  supplier_link: "supplier_url",
  link: "supplier_url",
  content_type: "content_types",
  good_for: "content_types",
  package: "is_package",
  stock: "in_stock",
};

export const mapHeader = (header: string) => {
  const normalised = normaliseHeader(header);
  return HEADER_ALIASES[normalised] || normalised;
};

const parseMoney = (raw: string, field: string, errors: string[]): number | null => {
  if (!raw) return null;
  const number = Number(raw.replace(/[₦,\s]/g, "").replace(/^ngn/i, ""));
  if (!Number.isFinite(number) || number < 0) {
    errors.push(`${field} "${raw}" is not a number`);
    return null;
  }
  return Math.round(number);
};

const parseBoolean = (raw: string, fallback: boolean) => {
  if (!raw) return fallback;
  return ["yes", "y", "true", "1"].includes(raw.toLowerCase());
};

const splitList = (raw: string, separator: RegExp) =>
  raw
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);

const isHttpUrl = (value: string) => /^https?:\/\/\S+$/i.test(value);

/** Pulls the numeric item ID out of an AliExpress product link. */
export const extractAliExpressId = (url: string) => url.match(/aliexpress\.[a-z.]+\/item\/(\d+)\.html/i)?.[1] || null;

const findCategory = (raw: string) => {
  const value = raw.toLowerCase();
  return PRODUCT_CATEGORIES.find(
    (category) => category.id === value || category.label.toLowerCase() === value
  )?.id;
};

const findContentType = (raw: string) => {
  const value = raw.toLowerCase().replace(/[\s-]+/g, "_");
  const aliases: Record<string, string> = { reels: "tiktok", instagram: "tiktok", streaming: "live_streaming", live: "live_streaming" };
  const id = aliases[value] || value;
  return CONTENT_TYPES.find((type) => type.id === id || type.label.toLowerCase().replace(/\s+/g, "_") === id)?.id as
    | ContentType
    | undefined;
};

/** Validate and convert one spreadsheet row (keys already mapped with mapHeader). */
export const parseRow = (row: Record<string, unknown>, rowNumber: number): ParsedRow => {
  const get = (key: string) => clean(row[key]);
  const errors: string[] = [];
  const warnings: string[] = [];

  const name = get("name");
  if (!name) errors.push("name is missing");

  const price = parseMoney(get("price_naira"), "price_naira", errors);
  if (price === null && !errors.some((e) => e.startsWith("price_naira"))) errors.push("price_naira is missing");
  if (price === 0) errors.push("price_naira must be more than 0");

  const originalPrice = parseMoney(get("original_price_naira"), "original_price_naira", errors);
  if (originalPrice !== null && price !== null && originalPrice <= price) {
    warnings.push("original price is not higher than the price, so no Sale badge will show");
  }

  const tierRaw = get("tier").toLowerCase();
  const tier = TIER_ALIASES[tierRaw];
  if (!tierRaw) errors.push("tier is missing (basic, premium or diamond)");
  else if (!tier) errors.push(`tier "${get("tier")}" must be one of ${TIERS.join(", ")}`);

  const categoryRaw = get("category");
  const category = categoryRaw ? findCategory(categoryRaw) : null;
  if (categoryRaw && !category) {
    warnings.push(`unknown category "${categoryRaw}", so it will be placed automatically from the name`);
  }

  const contentTypes: ContentType[] = [];
  for (const raw of splitList(get("content_types"), /[;,|]/)) {
    const type = findContentType(raw);
    if (type) {
      if (!contentTypes.includes(type)) contentTypes.push(type);
    } else {
      warnings.push(`unknown content type "${raw}" ignored`);
    }
  }

  const imageUrl = get("image_url");
  if (imageUrl && !isHttpUrl(imageUrl)) errors.push("image_url must be a full https:// link");

  const gallery = splitList(get("gallery_image_urls"), /\s*\|\s*|\n/);
  const badGallery = gallery.filter((url) => !isHttpUrl(url));
  if (badGallery.length) errors.push(`${badGallery.length} gallery link(s) are not full https:// links`);

  const specifications: Record<string, string> = {};
  for (const pair of splitList(get("specs"), /\s*\|\s*|\n/)) {
    const index = pair.indexOf(":");
    if (index <= 0) {
      warnings.push(`spec "${pair}" ignored: use "Name: value"`);
      continue;
    }
    specifications[pair.slice(0, index).trim()] = pair.slice(index + 1).trim();
  }

  const supplierUrl = get("supplier_url");
  if (supplierUrl && !isHttpUrl(supplierUrl)) errors.push("supplier_url must be a full https:// link");
  const supplierProductId = get("supplier_product_id") || (supplierUrl ? extractAliExpressId(supplierUrl) : null);

  const costPrice = parseMoney(get("cost_price_naira"), "cost_price_naira", errors);
  if (costPrice !== null && price !== null && costPrice >= price) {
    warnings.push("cost is not lower than the selling price, so there's no margin");
  }

  if (!imageUrl && gallery.length === 0) warnings.push("no photos");

  if (errors.length > 0) {
    return { rowNumber, product: null, sourcing: null, errors, warnings };
  }

  const product: ImportedProduct = {
    name,
    price_naira: price!,
    original_price_naira: originalPrice !== null && originalPrice > price! ? originalPrice : null,
    tier: tier!,
    category: category || null,
    description: get("description") || null,
    content_types: contentTypes.length ? contentTypes : ["general"],
    in_stock: parseBoolean(get("in_stock"), true),
    is_package: parseBoolean(get("is_package"), false),
    image_url: imageUrl || gallery[0] || null,
    image_urls: imageUrl ? gallery : gallery.slice(1),
    specifications,
  };

  const sourcing: ImportedSourcing = {
    supplier_name: get("supplier_name") || null,
    supplier_url: supplierUrl || null,
    supplier_product_id: supplierProductId,
    supplier_sku_id: get("supplier_sku_id") || null,
    cost_price_naira: costPrice,
    notes: get("notes") || null,
  };
  const hasSourcing = Object.values(sourcing).some((value) => value !== null);

  return { rowNumber, product, sourcing: hasSourcing ? sourcing : null, errors, warnings };
};
