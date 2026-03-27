"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@mangamake.dev");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    let payload: { error?: string; redirectTo?: string } = {};
    try {
      payload = (await response.json()) as { error?: string; redirectTo?: string };
    } catch {
      payload = {};
    }

    setPending(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to sign in.");
      return;
    }

    router.push(payload.redirectTo || "/editor");
    router.refresh();
  };

  return (
    <div className="login-card">
      <div className="badge">MangaMake Studio</div>
      <h2 className="title">Welcome back</h2>
      <p className="subtitle">
        Sign in as admin to upload assets in bulk, or as user to build manga pages.
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
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
          placeholder="********"
          required
        />

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" disabled={pending}>
          {pending ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="demo-accounts">
        <p>Demo accounts</p>
        <ul>
          <li>admin@mangamake.dev / admin123</li>
          <li>user@mangamake.dev / user123</li>
        </ul>
      </div>
    </div>
  );
}
