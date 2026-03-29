import Link from "next/link";
type LoginCardProps = {
  errorMessage?: string;
};

export function LoginCard({ errorMessage }: LoginCardProps) {

  return (
    <div className="login-card">
      <div className="badge">MangaMake Studio</div>
      <h2 className="title">Welcome back</h2>
      <p className="subtitle">
        Sign in as admin to upload assets in bulk, or as user to build manga pages.
      </p>
      <form action="/api/auth/login" method="post">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          defaultValue="admin@mangamake.dev"
          placeholder="you@example.com"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          defaultValue="admin123"
          placeholder="********"
          required
        />

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        <button type="submit">Sign In</button>
      </form>

      <div className="demo-accounts">
        <p>Demo accounts</p>
        <ul>
          <li>admin@mangamake.dev / admin123</li>
          <li>user@mangamake.dev / user123</li>
        </ul>
      </div>
      <p className="auth-link">
        New here? <Link href="/signup">Create an account</Link>
      </p>
    </div>
  );
}
