"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SIDEBAR_ORDER, BULK_UPLOAD_CATEGORIES, getCategoryLabel } from "@/lib/constants";
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
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleAssets = useMemo(() => {
    return assets.filter((asset) => asset.category === activeCategory);
  }, [assets, activeCategory]);

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
    <AppShell projectName={projectName} userName={userName} role={role} showAdmin={false}>
      <div className="editor-root">
        <aside className="left-navigation card">
          <div className="brand">Admin Upload</div>
          <nav>
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
                  {getCategoryLabel(category)}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="library card">
          <h2>{getCategoryLabel(activeCategory)}</h2>
          <p className="muted">Admins can bulk upload sketches and sprites from this panel.</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="text-input"
            onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Mass Upload"}
          </button>
          <p className="muted">{selectedFiles.length} file(s) selected</p>
          {error ? <p className="error">{error}</p> : null}
          {message ? <p className="muted">{message}</p> : null}

          <div className="asset-grid">
            {visibleAssets.map((asset) => (
              <article key={asset.id} className="asset-card">
                <img src={asset.src} alt={asset.name} />
                <strong>{asset.name}</strong>
                <small>{asset.tags.join(", ") || "untagged"}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="canvas-area">
          <header className="editor-top card">
            <div className="project-name">Asset Catalog</div>
          </header>
          <div className="canvas-board card">
            <div className="empty-state">Bulk upload new sketch/sprite files, then users can place them in Editor.</div>
          </div>
        </section>

        <aside className="right-tools card">
          <div className="tool-header">Admin</div>
          <div className="tool-group">
            <p>Permissions</p>
            <small>Bulk upload enabled</small>
            <small>Asset moderation enabled</small>
          </div>
        </aside>
      </div>
    </AppShell>
  );
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
