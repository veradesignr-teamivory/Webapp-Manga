import { NextResponse } from "next/server";

import { createSession } from "@/lib/auth";
import { findUserByCredentials } from "@/lib/supabaseData";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  let user;
  try {
    user = await findUserByCredentials(email, password);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed.";
    const isConfigError = message.includes("Missing required environment variable");
    return NextResponse.json(
      {
        error: isConfigError
          ? "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local, then restart dev server."
          : message
      },
      { status: isConfigError ? 503 : 500 }
    );
  }

  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  await createSession(user.id);
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    redirectTo: "/dashboard"
  });
}
