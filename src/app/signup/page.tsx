import { SignupCard } from "@/components/SignupCard";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const session = await getSessionUser();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="auth-layout">
      <SignupCard />
    </main>
  );
}
