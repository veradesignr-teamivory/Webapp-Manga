import { LoginCard } from "@/components/LoginCard";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSessionUser();
  if (session) {
    redirect("/dashboard");
  }

  const params = searchParams ? await searchParams : undefined;
  const urlError = params?.error;

  return (
    <main className="auth-layout">
      <LoginCard errorMessage={urlError} />
    </main>
  );
}
