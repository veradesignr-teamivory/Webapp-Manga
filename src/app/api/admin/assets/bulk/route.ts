import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { getCurrentSession } from "@/lib/auth";
import { deriveTagsFromFilename } from "@/lib/assetUtils";
import { insertAssets } from "@/lib/supabaseData";
import { isAssetCategory } from "@/lib/constants";
import type { AssetRecord, AssetCategory } from "@/types";

type IncomingFile = {
  name?: string;
  dataUrl?: string;
  tags?: string[];
};

type Body = {
  category?: AssetCategory;
  files?: IncomingFile[];
};

export async function POST(request: Request) {
  const user = await getCurrentSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const queryCategory = url.searchParams.get("category");
  const body = (await request.json()) as Body;
  const rawCategory = body.category ?? queryCategory ?? "poses";
  const category: AssetCategory = isAssetCategory(rawCategory) ? rawCategory : "poses";
  const files = Array.isArray(body.files) ? body.files : [];

  if (files.length === 0) {
    return NextResponse.json(
      { error: "At least one file is required." },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const newAssets: AssetRecord[] = [];

  for (const file of files) {
    const name = String(file.name ?? "").trim();
    const src = String(file.dataUrl ?? "").trim();
    if (!name || !src) continue;

    const tags = Array.isArray(file.tags) && file.tags.length > 0
      ? file.tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean)
      : deriveTagsFromFilename(name);

    newAssets.push({
      id: randomUUID(),
      name,
      category,
      src,
      tags,
      uploadedBy: user.id,
      createdAt: now
    });
  }

  if (newAssets.length === 0) {
    return NextResponse.json(
      { error: "No valid files provided." },
      { status: 400 }
    );
  }

  const inserted = await insertAssets(newAssets);

  return NextResponse.json({
    inserted: inserted.length,
    assets: inserted
  });
}
