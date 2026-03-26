import { LoginCard } from "@/components/LoginCard";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getSessionUser();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="auth-layout">
      <LoginCard />
    </main>
  );
}
