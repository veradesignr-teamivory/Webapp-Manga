import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { AppData, UserAccount } from "@/types";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "db.json");

function ensureDataDir() {
  mkdirSync(dataDir, { recursive: true });
}

function createSeedData(): AppData {
  return {
    users: [
      {
        id: "u-admin",
        email: "admin@mangamake.dev",
        password: "admin123",
        name: "Admin",
        role: "admin"
      },
      {
        id: "u-user",
        email: "user@mangamake.dev",
        password: "user123",
        name: "Creator",
        role: "user"
      }
    ],
    sessions: [],
    assets: []
  };
}

function writeData(data: AppData) {
  ensureDataDir();
  writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
}

export function readData(): AppData {
  ensureDataDir();
  if (!existsSync(dbPath)) {
    const seed = createSeedData();
    writeData(seed);
    return seed;
  }

  try {
    const fileContent = readFileSync(dbPath, "utf-8");
    const parsed = JSON.parse(fileContent) as AppData;
    if (
      !Array.isArray(parsed.users) ||
      !Array.isArray(parsed.sessions) ||
      !Array.isArray(parsed.assets)
    ) {
      throw new Error("Invalid data shape");
    }
    return parsed;
  } catch {
    const seed = createSeedData();
    writeData(seed);
    return seed;
  }
}

export function mutateData(mutator: (current: AppData) => AppData): AppData {
  const current = readData();
  const next = mutator(current);
  writeData(next);
  return next;
}

export function findUserByCredentials(email: string, password: string): UserAccount | null {
  const db = readData();
  return db.users.find((user) => user.email === email && user.password === password) ?? null;
}

export function findUserById(id: string): UserAccount | null {
  const db = readData();
  return db.users.find((user) => user.id === id) ?? null;
}

export function sanitizeUser(user: UserAccount) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}

