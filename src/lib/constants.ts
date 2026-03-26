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

const CATEGORY_EMPTY_LABELS: Record<AssetCategory, string> = {
  poses: "No poses yet",
  backgrounds: "No backgrounds yet",
  "energy-beams": "No energy beams yet",
  explosions: "No explosions yet",
  effects: "No effects yet",
  "speech-bubbles": "No speech bubbles yet",
  sprites: "No sprites yet",
  sketches: "No sketches yet"
};

export const SIDEBAR_ORDER: AssetCategory[] = [...ASSET_CATEGORIES];

export const STUDIO_CATEGORY_ORDER: AssetCategory[] = [
  "poses",
  "backgrounds",
  "energy-beams",
  "explosions",
  "effects",
  "speech-bubbles"
];

export const BULK_UPLOAD_CATEGORIES: AssetCategory[] = [...ASSET_CATEGORIES];

export const FILTER_OPTIONS = ["others"] as const;

export const ASSET_CATEGORY_SET = new Set<AssetCategory>(ASSET_CATEGORIES);

export function isAssetCategory(value: string): value is AssetCategory {
  return ASSET_CATEGORY_SET.has(value as AssetCategory);
}

export function getCategoryLabel(category: AssetCategory): string {
  return ASSET_LABELS[category];
}

export function categoryToSidebarLabel(category: AssetCategory): string {
  if (category === "energy-beams") {
    return "Energy Beams";
  }
  if (category === "speech-bubbles") {
    return "Speech Bubles";
  }
  return ASSET_LABELS[category];
}

export function getCategoryEmptyLabel(category: AssetCategory): string {
  return CATEGORY_EMPTY_LABELS[category];
}
