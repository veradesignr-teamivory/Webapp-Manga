import { NextResponse } from "next/server";

import { createSession } from "@/lib/auth";
import { createUserAccount, findUserByEmail } from "@/lib/supabaseData";

type SignupBody = {
  name?: string;
  email?: string;
  password?: string;
};

function isSupabaseConfigError(message: string) {
  return message.includes("Missing required environment variable");
}

export async function POST(request: Request) {
  let body: SignupBody;
  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (name.length < 2) {
    return NextResponse.json({ error: "Name must be at least 2 characters." }, { status: 400 });
  }

  if (!email.includes("@") || email.length < 5) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const user = await createUserAccount({
      name,
      email,
      password,
      role: "user"
    });

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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed.";
    const isConfigError = isSupabaseConfigError(message);
    const isDuplicate = message.includes("duplicate key value") || message.includes("already exists");
    return NextResponse.json(
      {
        error: isConfigError
          ? "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local, then restart dev server."
          : isDuplicate
            ? "An account with this email already exists."
            : message
      },
      { status: isConfigError ? 503 : isDuplicate ? 409 : 500 }
    );
  }
}
