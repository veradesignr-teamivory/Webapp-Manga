import type { AssetCategory } from "@/types";

export const ASSET_CATEGORIES: AssetCategory[] = [
  "poses",
  "backgrounds",
  "energy-beams",
  "explosions",
  "effects",
  "speech-bubbles",
  "sprites",
  "sketches"
];

export const ASSET_LABELS: Record<AssetCategory, string> = {
  poses: "Poses",
  backgrounds: "Backgrounds",
  "energy-beams": "Energy Beams",
  explosions: "Explosions",
  effects: "Effects",
  "speech-bubbles": "Speech Bubbles",
  sprites: "Sprites",
  sketches: "Sketches"
};

export const SIDEBAR_ORDER: AssetCategory[] = [...ASSET_CATEGORIES];

export const BULK_UPLOAD_CATEGORIES: AssetCategory[] = ["sprites", "sketches"];

export const ASSET_CATEGORY_SET = new Set<AssetCategory>(ASSET_CATEGORIES);

export function isAssetCategory(value: string): value is AssetCategory {
  return ASSET_CATEGORY_SET.has(value as AssetCategory);
}

export function getCategoryLabel(category: AssetCategory): string {
  return ASSET_LABELS[category];
}
