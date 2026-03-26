import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

import {
  createSessionRecord,
  deleteSessionById,
  deleteSessionsForUser,
  findUserByCredentials,
  findUserById,
  findSessionById,
  sanitizeUser
} from "@/lib/supabaseData";
import type { SanitizedUser, UserAccount, UserRole } from "@/types";

export const SESSION_COOKIE = "manga_session";
const DAY_IN_SECONDS = 60 * 60 * 24;

export async function validateCredentials(email: string, password: string): Promise<UserAccount | null> {
  return await findUserByCredentials(email, password);
}

export async function createSession(userId: string) {
  const sessionId = randomUUID();
  const now = Date.now();
  const createdAt = new Date(now).toISOString();
  const expiresAt = new Date(now + DAY_IN_SECONDS * 1000).toISOString();
  await deleteSessionsForUser(userId);
  await createSessionRecord({
    id: sessionId,
    userId,
    createdAt,
    expiresAt
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: DAY_IN_SECONDS,
    path: "/"
  });
}

export async function clearSession() {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await deleteSessionById(sessionId);
  }
  store.delete(SESSION_COOKIE);
}

export async function getSessionUser() {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await findSessionById(sessionId);
  if (!session || new Date(session.expires_at).getTime() < Date.now()) {
    await deleteSessionById(sessionId);
    return null;
  }

  const user = await findUserById(session.user_id);
  if (!user) {
    await deleteSessionById(sessionId);
    return null;
  }

  return sanitizeUser(user);
}

export async function getCurrentSession(): Promise<SanitizedUser | null> {
  return getSessionUser();
}

export async function requireRole(role: UserRole) {
  const user = await getSessionUser();
  if (!user) return null;
  return user.role === role ? user : null;
}
