"use client";

import type { ReactNode } from "react";
import Link from "next/link";

type AppShellProps = {
  projectName: string;
  userName: string;
  role: "admin" | "user";
  showAdmin?: boolean;
  editor?: boolean;
  children: ReactNode;
};

export function AppShell({
  projectName,
  userName,
  role,
  showAdmin = false,
  editor = false,
  children
}: AppShellProps) {
  return (
    <div className="reference-shell">
      <header className="ref-topbar">
        <div className="ref-topbar-left">
          <Link href="/" className="ref-logo">
            MangaMake
          </Link>
          <nav className="ref-menu">
            <button type="button">File</button>
            <button type="button">Help</button>
          </nav>
        </div>
        <div className="ref-topbar-center">
          {projectName}
          {editor ? null : null}
        </div>
        <div className="ref-topbar-right">
          <button type="button" className="ref-pill ref-pill-primary">
            Export
          </button>
          {showAdmin ? (
            <Link href="/admin" className="ref-pill">
              Admin
            </Link>
          ) : null}
          <Link href="/dashboard" className="ref-pill">
            Dashboard
          </Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="ref-pill">
              Sign Out
            </button>
          </form>
          <span className="ref-user">
            {userName} · {role}
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}
