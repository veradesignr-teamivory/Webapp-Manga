"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function SignupCard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isSupabaseConfigured =
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0;
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    let payload: { error?: string; redirectTo?: string } = {};
    try {
      payload = (await response.json()) as { error?: string; redirectTo?: string };
    } catch {
      payload = {};
    }

    setPending(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to sign up.");
      return;
    }

    router.push(payload.redirectTo || "/dashboard");
    router.refresh();
  };

  return (
    <div className="login-card">
      <div className="badge">MangaMake Studio</div>
      <h2 className="title">Create your account</h2>
      <p className="subtitle">
        New creators can sign up here, then start building manga pages immediately.
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          required
          minLength={6}
        />

        {error ? <p className="form-error">{error}</p> : null}
        {!isSupabaseConfigured ? (
          <p className="form-error">
            Supabase is not configured in this runtime. Set NEXT_PUBLIC_SUPABASE_URL and
            SUPABASE_SERVICE_ROLE_KEY, then restart <code>npm run dev</code>.
          </p>
        ) : null}

        <button type="submit" disabled={pending || !isSupabaseConfigured}>
          {pending ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <div className="demo-accounts">
        <p>
          Already have an account?{" "}
          <Link href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
