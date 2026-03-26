import { NextResponse } from "next/server";

import { readData } from "@/lib/dataStore";
import { ASSET_CATEGORIES } from "@/lib/constants";
import type { AssetCategory } from "@/types";

type AssetCategoryQuery = AssetCategory | "all";

const ALLOWED_TYPES: AssetCategoryQuery[] = ["all", ...ASSET_CATEGORIES];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryType = (searchParams.get("type") || "all") as AssetCategoryQuery;

  if (!ALLOWED_TYPES.includes(queryType)) {
    return NextResponse.json(
      { error: "Invalid asset type query." },
      { status: 400 }
    );
  }

  const db = readData();
  const assets =
    queryType === "all"
      ? db.assets
      : db.assets.filter((item) => item.category === queryType);

  return NextResponse.json({ assets });
}
