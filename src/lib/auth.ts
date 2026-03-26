import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

import { findUserByCredentials, mutateData, readData, sanitizeUser } from "@/lib/dataStore";
import type { SanitizedUser, UserAccount, UserRole } from "@/types";

export const SESSION_COOKIE = "manga_session";
const DAY_IN_SECONDS = 60 * 60 * 24;

export function validateCredentials(email: string, password: string): UserAccount | null {
  return findUserByCredentials(email, password);
}

export async function createSession(userId: string) {
  const sessionId = randomUUID();
  const now = Date.now();
  const createdAt = new Date(now).toISOString();
  const expiresAt = new Date(now + DAY_IN_SECONDS * 1000).toISOString();

  mutateData((db) => ({
    ...db,
    sessions: [
      ...db.sessions.filter((session) => session.userId !== userId),
      { id: sessionId, userId, createdAt, expiresAt }
    ]
  }));

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
    mutateData((db) => ({
      ...db,
      sessions: db.sessions.filter((session) => session.id !== sessionId)
    }));
  }
  store.delete(SESSION_COOKIE);
}

export async function getSessionUser() {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const db = readData();
  const session = db.sessions.find((candidate) => candidate.id === sessionId);
  if (!session || new Date(session.expiresAt).getTime() < Date.now()) {
    return null;
  }

  const user = db.users.find((candidate) => candidate.id === session.userId);
  return user ? sanitizeUser(user) : null;
}

export async function getCurrentSession(): Promise<SanitizedUser | null> {
  return getSessionUser();
}

export async function requireRole(role: UserRole) {
  const user = await getSessionUser();
  if (!user) return null;
  return user.role === role ? user : null;
}
