import { Package, Mic, Lightbulb, Camera, Headphones, Sparkles, Sun, Layers, type LucideIcon } from "lucide-react";
import { Product } from "@/types/database";

export interface ProductCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  /** Used to place products that have no explicit category set */
  keywords: string[];
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: "microphones",
    label: "Microphones",
    icon: Mic,
    description: "From lavaliers to broadcast mics",
    keywords: ["microphone", "mic", "lavalier", "shotgun", "condenser", "dynamic", "wireless"],
  },
  {
    id: "key-lights",
    label: "Key Lights",
    icon: Sun,
    description: "Main light sources for your setup",
    keywords: ["key light", "ring light", "sl-60", "120d", "main light", "cob"],
  },
  {
    id: "fill-lights",
    label: "Fill Lights",
    icon: Lightbulb,
    description: "Secondary lighting for balance",
    keywords: ["fill", "secondary", "panel", "660"],
  },
  {
    id: "background-lights",
    label: "Background Lights",
    icon: Sparkles,
    description: "RGB and ambient lighting",
    keywords: ["background", "rgb", "strip", "tube", "ambient", "accent"],
  },
  {
    id: "rim-lights",
    label: "Rim Lights",
    icon: Layers,
    description: "Hair and separation lighting",
    keywords: ["rim", "hair", "separation", "sz150"],
  },
  {
    id: "stands-mounts",
    label: "Stands & Mounts",
    icon: Camera,
    description: "Tripods, C-stands, boom arms",
    keywords: ["tripod", "stand", "c-stand", "boom arm", "mount", "softbox"],
  },
  {
    id: "audio-gear",
    label: "Audio Gear",
    icon: Headphones,
    description: "Interfaces, headphones, accessories",
    keywords: ["interface", "headphones", "audio", "scarlett", "rodecaster", "focusrite", "mixer"],
  },
];

export const ALL_CATEGORY = {
  id: "all",
  label: "All Products",
  icon: Package,
  description: "Browse all individual equipment",
};

export const getCategoryLabel = (id: string | null | undefined) =>
  PRODUCT_CATEGORIES.find((category) => category.id === id)?.label;

/** Categories a product belongs to: its explicit category, else keyword matches. */
export const getProductCategories = (product: Product): string[] => {
  if (product.category) return [product.category];

  const specs = product.specifications as Record<string, string> | null;
  const haystack = [
    product.name,
    product.description || "",
    specs?.["Light Type"] || "",
    specs?.["Type"] || "",
  ]
    .join(" ")
    .toLowerCase();

  const matches = PRODUCT_CATEGORIES.filter((category) =>
    category.keywords.some((keyword) => haystack.includes(keyword))
  ).map((category) => category.id);

  return matches.length > 0 ? matches : ["other"];
};
