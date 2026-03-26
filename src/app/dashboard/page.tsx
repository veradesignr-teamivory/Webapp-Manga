import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.role === "admin";

  return (
    <main className="dashboard">
      <section className="dashboard-card card">
        <div className="badge">{isAdmin ? "Admin Console" : "Creator Dashboard"}</div>
        <h1>Welcome, {session.name}</h1>
        <p>
          {isAdmin
            ? "Manage sketch/sprite libraries and bulk upload assets for artists."
            : "Continue building your manga panels with the latest uploaded assets."}
        </p>
        <div className="dashboard-actions">
          {isAdmin ? (
            <>
              <Link className="btn btn-primary" href="/admin">
                Open Admin Upload
              </Link>
              <Link className="btn-link" href="/editor">
                Open Editor Preview
              </Link>
            </>
          ) : (
            <Link className="btn btn-primary" href="/editor">
              Open Editor
            </Link>
          )}
          <form action="/api/auth/logout" method="post">
            <button className="logout-btn" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
