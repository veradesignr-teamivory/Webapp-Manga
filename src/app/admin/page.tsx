"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import {
  BULK_UPLOAD_CATEGORIES,
  FILTER_OPTIONS,
  SIDEBAR_ORDER,
  categoryToSidebarLabel,
  getCategoryLabel
} from "@/lib/constants";
import type { AssetCategory, AssetRecord } from "@/types";

type UploadPayload = {
  files: Array<{
    name: string;
    dataUrl: string;
    tags: string[];
  }>;
};

export default function AdminPage() {
  const router = useRouter();
  const [projectName] = useState("Admin Asset Studio");
  const [userName, setUserName] = useState("Admin");
  const [role, setRole] = useState<"admin" | "user">("admin");
  const [activeCategory, setActiveCategory] = useState<AssetCategory>("poses");
  const [filterOption, setFilterOption] = useState<(typeof FILTER_OPTIONS)[number]>("others");
  const [search, setSearch] = useState("");
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [zoom] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleAssets = useMemo(() => {
    const categoryAssets = assets.filter((asset) => asset.category === activeCategory);
    const normalized = search.trim().toLowerCase();
    if (!normalized) return categoryAssets;
    return categoryAssets.filter((asset) => {
      return (
        asset.name.toLowerCase().includes(normalized) ||
        asset.tags.some((tag) => tag.toLowerCase().includes(normalized))
      );
    });
  }, [assets, activeCategory, search]);

  useEffect(() => {
    async function bootstrap() {
      try {
        const authResponse = await fetch("/api/auth/me", { cache: "no-store" });
        if (!authResponse.ok) {
          throw new Error("Unauthorized");
        }
        const authBody = (await authResponse.json()) as {
          user: { name: string; role: "admin" | "user" };
        };
        if (authBody.user.role !== "admin") {
          router.replace("/editor");
          return;
        }
        setUserName(authBody.user.name);
        setRole(authBody.user.role);

        const response = await fetch("/api/assets", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to load assets.");
        }
        const payload = (await response.json()) as { assets: AssetRecord[] };
        setAssets(payload.assets);
      } catch {
        setError("Could not load existing assets.");
      }
    }
    void bootstrap();
  }, [router]);

  async function handleUpload() {
    if (selectedFiles.length === 0) {
      setError("Select at least one image.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsUploading(true);

    try {
      const payload: UploadPayload = {
        files: await Promise.all(
          selectedFiles.map(async (file) => ({
            name: file.name,
            dataUrl: await toDataUrl(file),
            tags: deriveTags(file.name)
          }))
        )
      };

      const response = await fetch("/api/admin/assets/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          category: activeCategory,
          files: payload.files
        })
      });

      const responseBody = (await response.json()) as {
        inserted?: number;
        assets?: AssetRecord[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(responseBody.error ?? "Upload failed.");
      }

      const inserted = responseBody.inserted ?? 0;
      const incoming = responseBody.assets ?? [];
      setAssets((current) => mergeAssets(current, incoming));
      setMessage(`Uploaded ${inserted} ${getCategoryLabel(activeCategory).toLowerCase()} asset(s).`);
      setSelectedFiles([]);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <AppShell projectName={projectName} userName={userName} role={role} showAdmin={true}>
      <div className="editor-root">
        <aside className="left-navigation reference-nav">
          {[
            "poses",
            "add-image",
            "vertical-flip",
            "horizontal-flip",
            "send-forward",
            "send-backward",
            "clear-drawing"
          ].map((action) => (
            <button key={action} type="button" className="rail-action">
              {formatRailActionLabel(action)}
            </button>
          ))}
          <div className="left-divider" />
          <nav className="category-stack">
            {SIDEBAR_ORDER.map((category) => {
              const active = category === activeCategory;
              const adminEnabled = BULK_UPLOAD_CATEGORIES.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  className={`sidebar-button ${active ? "active" : ""}`}
                  onClick={() => setActiveCategory(category)}
                  title={adminEnabled ? "Upload enabled" : "Visible for user usage"}
                >
                  {categoryToSidebarLabel(category)}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="library card">
          <h2>{getCategoryLabel(activeCategory)}</h2>
          <input
            className="text-input"
            placeholder={`Search ${getCategoryLabel(activeCategory).toLowerCase()}...`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="filter-row">
            <select className="text-input" defaultValue="all-categories">
              <option value="all-categories">All Categories</option>
            </select>
          </div>
          <div className="filter-row">
            <select
              className="text-input"
              value={filterOption}
              onChange={(event) => {
                setFilterOption(event.target.value as (typeof FILTER_OPTIONS)[number]);
              }}
            >
              {FILTER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-primary btn-mass-upload"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Mass Upload"}
            </button>
          </div>
          <label className="select-row">
            <input
              type="checkbox"
              checked={selectedAssetIds.length > 0 && selectedAssetIds.length === visibleAssets.length}
              onChange={(event) => {
                if (event.target.checked) {
                  setSelectedAssetIds(visibleAssets.map((asset) => asset.id));
                } else {
                  setSelectedAssetIds([]);
                }
              }}
            />
            <span>Select</span>
          </label>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="text-input"
            onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
          />
          <p className="muted">{selectedFiles.length} file(s) selected</p>
          {error ? <p className="error">{error}</p> : null}
          {message ? <p className="muted">{message}</p> : null}

          {visibleAssets.length > 0 ? (
            <div className="asset-grid reference-asset-grid">
              {visibleAssets.map((asset) => {
                const selected = selectedAssetIds.includes(asset.id);
                return (
                  <article
                    key={asset.id}
                    className={`asset-card ${selected ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedAssetIds((previous) =>
                        previous.includes(asset.id)
                          ? previous.filter((item) => item !== asset.id)
                          : [...previous, asset.id]
                      );
                    }}
                  >
                    <img src={asset.src} alt={asset.name} />
                    <strong>{asset.name}</strong>
                    <small>{asset.tags.join(", ") || "untagged"}</small>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="upload-empty">
              <div className="upload-icon">↑</div>
              <p>No {getCategoryLabel(activeCategory).toLowerCase()} yet</p>
              <small>Upload your first {getCategoryLabel(activeCategory).toLowerCase().replace(/s$/, "")}</small>
            </div>
          )}
        </section>

        <section className="canvas-area">
          <header className="editor-top reference-toolbar">
            <div className="resolution-pill">1080 × 1920px · {zoom}%</div>
          </header>
          <div className="canvas-board card">
            <div className="canvas-page">
              <div className="selected-placeholder" />
            </div>
          </div>
          <div className="zoom-controls">
            <button type="button" className="ghost-button">
              -
            </button>
            <span>{zoom}%</span>
            <button type="button" className="ghost-button">
              +
            </button>
          </div>
        </section>

        <aside className="right-tools reference-tools">
          <div className="tool-header">Admin</div>
          <div className="tool-icons">
            <button type="button">✎</button>
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
            <small>{visibleAssets.length} element(s)</small>
          </div>
          <div className="tool-group">
            <p>Zoom</p>
            <small>{zoom}%</small>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function formatRailActionLabel(action: string) {
  switch (action) {
    case "add-image":
      return "Add Image";
    case "vertical-flip":
      return "Vertical Flip";
    case "horizontal-flip":
      return "Horizontal Flip";
    case "send-forward":
      return "Send Forward";
    case "send-backward":
      return "Send Backward";
    case "clear-drawing":
      return "Clear Drawing";
    default:
      return "Poses";
  }
}

function deriveTags(filename: string): string[] {
  const clean = filename.replace(/\.[^/.]+$/, "");
  return clean
    .split(/[\s._-]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5);
}

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Could not read image."));
    };
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

function mergeAssets(existing: AssetRecord[], incoming: AssetRecord[]) {
  const map = new Map<string, AssetRecord>();
  for (const asset of existing) {
    map.set(asset.id, asset);
  }
  for (const asset of incoming) {
    map.set(asset.id, asset);
  }
  return Array.from(map.values());
}
