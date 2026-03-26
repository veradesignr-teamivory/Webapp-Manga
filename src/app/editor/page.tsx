"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SIDEBAR_ORDER, getCategoryLabel } from "@/lib/constants";
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
    >
      <div className="editor-root">
        <aside className="left-navigation card">
          <div className="brand">Poses</div>
          <nav>
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
          </nav>
        </aside>

        <section className="library card">
          <h2>{getCategoryLabel(selectedCategory)}</h2>
          <input
            className="text-input"
            placeholder={`Search ${getCategoryLabel(selectedCategory).toLowerCase()}...`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <p className="muted">
            {filteredLibrary.length > 0
              ? `${filteredLibrary.length} asset(s) available`
              : `No ${getCategoryLabel(selectedCategory).toLowerCase()} yet`}
          </p>

          <div className="asset-grid">
            {filteredLibrary.map((asset) => (
              <button
                key={asset.id}
                type="button"
                className="asset-card"
                onClick={() => addAssetToCanvas(asset)}
              >
                <img src={asset.src} alt={asset.name} />
                <strong>{asset.name}</strong>
                <small>{asset.tags.join(", ") || "untagged"}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="canvas-area">
          <header className="editor-top card">
            <div className="project-name">{projectName}</div>
            <div className="top-actions">
              <button type="button" className="ghost-button" onClick={() => setZoom((v) => Math.max(25, v - 10))}>
                -
              </button>
              <span>{zoom}%</span>
              <button type="button" className="ghost-button" onClick={() => setZoom((v) => Math.min(300, v + 10))}>
                +
              </button>
              <a href="/dashboard" className="link-button">
                Dashboard
              </a>
            </div>
          </header>

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
          </div>
        </section>

        <aside className="right-tools card">
          <div className="tool-header">Tools</div>
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
            <small>{canvasAssets.length} element(s)</small>
          </div>
          <div className="tool-group">
            <p>Signed in as</p>
            <strong>{userName}</strong>
          </div>
          {loading ? <small>Loading assets...</small> : null}
          {error ? <small className="error">{error}</small> : null}
        </aside>
      </div>
    </AppShell>
  );
}
