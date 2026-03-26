import { NextResponse } from "next/server";

import { listAssets } from "@/lib/supabaseData";
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

  try {
    const assets = await listAssets(queryType === "all" ? undefined : queryType);
    return NextResponse.json({ assets });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not fetch assets.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
