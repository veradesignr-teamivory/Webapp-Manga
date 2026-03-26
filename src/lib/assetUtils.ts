import type { AssetCategory } from "@/types";

export function deriveTagsFromFilename(filename: string): string[] {
  const clean = filename.replace(/\.[^/.]+$/, "");
  return clean
    .split(/[\s._-]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5);
}
