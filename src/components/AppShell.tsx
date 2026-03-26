"use client";

import type { ReactNode } from "react";
import Link from "next/link";

type AppShellProps = {
  projectName: string;
  userName: string;
  role: "admin" | "user";
  showAdmin?: boolean;
  children: ReactNode;
};

export function AppShell({
  projectName,
  userName,
  role,
  showAdmin = false,
  children
}: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="editor-header">
        <div className="editor-header-left">
          <div className="logo">MangaMake</div>
          <nav className="editor-header-nav">
            <a href="#">File</a>
            <a href="#">Help</a>
          </nav>
        </div>
        <div className="editor-header-center">{projectName}</div>
        <div className="editor-header-right">
          <button type="button" className="btn btn-primary">
            Export
          </button>
          {showAdmin ? (
            <Link href="/admin" className="btn btn-secondary">
              Admin
            </Link>
          ) : null}
          <Link href="/dashboard" className="btn btn-secondary">
            Dashboard
          </Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="btn btn-secondary">
              Sign Out
            </button>
          </form>
          <span className="user-chip">
            {userName} ({role})
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}
