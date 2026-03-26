import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  redirect(session.role === "admin" ? "/admin" : "/editor");
}
