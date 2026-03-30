import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { ASSET_CATEGORIES, getCategoryLabel } from "@/lib/constants";
import { listAssets } from "@/lib/supabaseData";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.role === "admin";
  let loadError: string | null = null;
  let assets = [] as Array<{
    id: string;
    name: string;
    category: string;
    src: string;
    createdAt: string;
    tags: string[];
  }>;

  try {
    assets = await listAssets();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load assets.";
  }

  const categoryStats = ASSET_CATEGORIES.map((category) => ({
    category,
    label: getCategoryLabel(category),
    count: assets.filter((asset) => asset.category === category).length
  }));
  const totalAssets = assets.length;
  const populatedCategories = categoryStats.filter((item) => item.count > 0).length;
  const recentAssets = assets.slice(0, 5);
  const mostUsedCategory = categoryStats.reduce(
    (best, current) => (current.count > best.count ? current : best),
    categoryStats[0]
  );
  const lastUpload = assets[0]?.createdAt
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(assets[0].createdAt))
    : "No uploads yet";

  const actions = isAdmin
    ? [
        { label: "Open Admin Upload", href: "/admin", style: "primary" as const },
        { label: "Open Editor Preview", href: "/editor", style: "secondary" as const },
        { label: "View Public Landing", href: "/", style: "secondary" as const }
      ]
    : [
        { label: "Open Editor", href: "/editor", style: "primary" as const },
        { label: "Browse Asset Library", href: "/editor", style: "secondary" as const },
        { label: "Back to Home", href: "/", style: "secondary" as const }
      ];

  return (
    <main className="dashboard-hub">
      <section className="dashboard-top card">
        <div>
          <div className="badge">{isAdmin ? "Admin Console" : "Creator Dashboard"}</div>
          <h1>Welcome back, {session.name}</h1>
          <p>
            {isAdmin
              ? "Manage uploads, review category coverage, and keep your manga asset library production-ready."
              : "Jump into editing and explore the latest assets uploaded by your admin team."}
          </p>
        </div>
        <div className="dashboard-meta">
          <span>{session.email}</span>
          <strong>{session.role.toUpperCase()}</strong>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="card dashboard-panel">
          <h3>Quick Actions</h3>
          <div className="dashboard-action-grid">
            {actions.map((action) => (
              <Link
                key={action.label}
                className={`dashboard-action-tile ${action.style === "primary" ? "primary" : ""}`}
                href={action.href}
              >
                {action.label}
              </Link>
            ))}
            <form action="/api/auth/logout" method="post">
              <button className="dashboard-action-tile danger" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </article>

        <article className="card dashboard-panel">
          <h3>Library Snapshot</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span>Total Assets</span>
              <strong>{totalAssets}</strong>
            </div>
            <div className="stat-card">
              <span>Active Categories</span>
              <strong>{populatedCategories}</strong>
            </div>
            <div className="stat-card">
              <span>Top Category</span>
              <strong>{mostUsedCategory.count > 0 ? mostUsedCategory.label : "N/A"}</strong>
            </div>
            <div className="stat-card">
              <span>Last Upload</span>
              <strong>{lastUpload}</strong>
            </div>
          </div>
          {loadError ? <p className="error dashboard-error">{loadError}</p> : null}
        </article>

        <article className="card dashboard-panel">
          <h3>Category Coverage</h3>
          <ul className="category-list">
            {categoryStats.map((item) => (
              <li key={item.category}>
                <span>{item.label}</span>
                <strong>{item.count}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="card dashboard-panel">
          <h3>Recent Assets</h3>
          {recentAssets.length === 0 ? (
            <p className="empty-state">No assets yet. Upload your first pack to get started.</p>
          ) : (
            <ul className="recent-asset-list">
              {recentAssets.map((asset) => (
                <li key={asset.id}>
                  <img src={asset.src} alt={asset.name} />
                  <div>
                    <strong>{asset.name}</strong>
                    <span>{getCategoryLabel(asset.category as (typeof ASSET_CATEGORIES)[number])}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </main>
  );
}
