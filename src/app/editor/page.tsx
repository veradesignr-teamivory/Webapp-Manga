"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SIDEBAR_ORDER, getCategoryLabel, getCategoryEmptyLabel } from "@/lib/constants";
import type { AssetCategory, AssetRecord, EditorPlacedAsset, UserRole } from "@/types";

type AssetsResponse = {
  assets: AssetRecord[];
};

type AuthResponse = {
  user: {
    id: string;
    name: string;
    role: UserRole;
  };
};

export default function EditorPage() {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>("poses");
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [canvasAssets, setCanvasAssets] = useState<EditorPlacedAsset[]>([]);
  const [zoom, setZoom] = useState(100);
  const [projectName] = useState("Untitled Project");
  const [userName, setUserName] = useState("User");
  const [role, setRole] = useState<UserRole>("user");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [filterTag, setFilterTag] = useState("Others");
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      setError(null);
      try {
        const authRes = await fetch("/api/auth/me", { cache: "no-store" });
        if (!authRes.ok) {
          throw new Error("Could not load user");
        }
        const authJson = (await authRes.json()) as AuthResponse;
        setUserName(authJson.user.name);
        setRole(authJson.user.role);

        const assetRes = await fetch("/api/assets", { cache: "no-store" });
        if (!assetRes.ok) {
          throw new Error("Could not load assets");
        }
        const assetJson = (await assetRes.json()) as AssetsResponse;
        setAssets(assetJson.assets);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    void bootstrap();
  }, []);

  const filteredLibrary = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const byCategory = assets.filter((item) => item.category === selectedCategory);
    if (!normalized) {
      return byCategory;
    }
    return byCategory.filter((item) => {
      return (
        item.name.toLowerCase().includes(normalized) ||
        item.tags.some((tag) => tag.toLowerCase().includes(normalized))
      );
    });
  }, [assets, selectedCategory, search]);

  function addAssetToCanvas(asset: AssetRecord) {
    setCanvasAssets((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        assetId: asset.id,
        x: 54 + previous.length * 20,
        y: 170 + previous.length * 14,
        scale: 1
      }
    ]);
  }

  function currentAssetRecord(placed: EditorPlacedAsset) {
    return assets.find((asset) => asset.id === placed.assetId) ?? null;
  }

  return (
    <AppShell
      projectName={projectName}
      userName={userName}
      role={role}
      showAdmin={role === "admin"}
      editor
    >
      <div className="editor-root reference-layout">
        <aside className="left-navigation card">
          <button type="button" className="rail-utility active">
            Poses
          </button>
          <button type="button" className="rail-utility">
            Add Image
          </button>
          <button type="button" className="rail-utility">
            Vertical Flip
          </button>
          <button type="button" className="rail-utility">
            Horizontal Flip
          </button>
          <button type="button" className="rail-utility">
            Send Forward
          </button>
          <button type="button" className="rail-utility">
            Send Backward
          </button>
          <button type="button" className="rail-utility">
            Clear Drawing
          </button>
          <div className="rail-divider" />
          {SIDEBAR_ORDER.map((item) => {
            const active = selectedCategory === item;
            return (
              <button
                key={item}
                type="button"
                className={`sidebar-button ${active ? "active" : ""}`}
                onClick={() => setSelectedCategory(item)}
              >
                {getCategoryLabel(item)}
              </button>
            );
          })}
        </aside>

        <section className="library card">
          <h2>{getCategoryLabel(selectedCategory)}</h2>
          <input
            className="text-input"
            placeholder={`Search ${getCategoryLabel(selectedCategory).toLowerCase()}...`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="filters-row">
            <select
              className="text-input"
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
            >
              <option>All Categories</option>
              <option>Admin Upload</option>
              <option>Community</option>
            </select>
            <div className="filters-inline">
              <select
                className="text-input"
                value={filterTag}
                onChange={(event) => setFilterTag(event.target.value)}
              >
                <option>Others</option>
                <option>Action</option>
                <option>Combat</option>
              </select>
              <button type="button" className="btn btn-primary btn-compact">
                Mass Upload
              </button>
            </div>
          </div>
          <label className="select-toggle">
            <input
              type="checkbox"
              checked={isSelectMode}
              onChange={(event) => setIsSelectMode(event.target.checked)}
            />
            Select
          </label>
          {filteredLibrary.length === 0 ? (
            <div className="empty-panel">
              <div className="empty-upload-icon">⇧</div>
              <p>{getCategoryEmptyLabel(selectedCategory)}</p>
              <small>{`Upload your first ${getCategoryLabel(selectedCategory).slice(0, -1).toLowerCase()}`}</small>
            </div>
          ) : (
            <div className="asset-grid reference-grid">
              {filteredLibrary.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  className="asset-card"
                  onClick={() => addAssetToCanvas(asset)}
                >
                  <img src={asset.src} alt={asset.name} />
                  <strong>{asset.name}</strong>
                  <small>{asset.tags.join(" ") || "others"}</small>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="canvas-area">
          <div className="canvas-size-pill">1080 × 1920px · {zoom}%</div>
          <div className="canvas-board card">
            <div className="canvas-page" style={{ transform: `scale(${zoom / 100})` }}>
              {canvasAssets.map((placed) => {
                const item = currentAssetRecord(placed);
                if (!item) return null;
                return (
                  <img
                    key={placed.id}
                    src={item.src}
                    alt={item.name}
                    className="placed-asset"
                    style={{
                      left: placed.x,
                      top: placed.y,
                      transform: `scale(${placed.scale})`
                    }}
                  />
                );
              })}
            </div>
            {canvasAssets.length === 0 ? <div className="canvas-empty-line" /> : null}
          </div>
          <div className="canvas-zoom-controls">
            <button type="button" className="ghost-button" onClick={() => setZoom((v) => Math.max(25, v - 10))}>
              -
            </button>
            <span>{zoom}%</span>
            <button type="button" className="ghost-button" onClick={() => setZoom((v) => Math.min(300, v + 10))}>
              +
            </button>
          </div>
        </section>

        <aside className="right-tools card">
          <div className="tool-header">Tools</div>
          <div className="icon-tools">
            <button type="button">↶</button>
            <button type="button">↷</button>
            <button type="button">⌕</button>
            <button type="button">⌖</button>
          </div>
          <div className="tool-group">
            <p>Brush</p>
            <label>
              Size
              <input type="range" min={1} max={32} defaultValue={8} />
            </label>
            <label>
              Opacity
              <input type="range" min={1} max={100} defaultValue={100} />
            </label>
            <label>
              Flow
              <input type="range" min={1} max={100} defaultValue={80} />
            </label>
          </div>
          <div className="tool-group">
            <p>Layers</p>
            <small>{canvasAssets.length} element</small>
            <small>None selected</small>
          </div>
          <div className="tool-group">
            <p>Zoom</p>
            <small>{zoom}%</small>
            <small>{loading ? "Loading assets..." : "Ready"}</small>
            {error ? <small className="error">{error}</small> : null}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
