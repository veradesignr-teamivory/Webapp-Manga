import { NextResponse } from "next/server";

import { createSession, validateCredentials } from "@/lib/auth";

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
  const user = validateCredentials(email, password);

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
    redirectTo: user.role === "admin" ? "/admin" : "/editor"
  });
}
