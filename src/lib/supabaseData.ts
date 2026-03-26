import type { AssetCategory, AssetRecord, SanitizedUser, UserAccount } from "@/types";
import { getSupabaseAdmin } from "@/lib/supabase";

type DbUserRow = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
};

type DbSessionRow = {
  id: string;
  user_id: string;
  created_at: string;
  expires_at: string;
};

type DbAssetRow = {
  id: string;
  name: string;
  category: AssetCategory;
  src: string;
  tags: string[] | null;
  uploaded_by: string;
  created_at: string;
};

type DbSessionInsert = {
  id: string;
  user_id: string;
  created_at: string;
  expires_at: string;
};

type DbAssetInsert = {
  id: string;
  name: string;
  category: AssetCategory;
  src: string;
  tags: string[];
  uploaded_by: string;
  created_at: string;
};

export function mapUserRowToAccount(row: DbUserRow): UserAccount {
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    name: row.name,
    role: row.role
  };
}

export function sanitizeUser(user: UserAccount): SanitizedUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}

export async function findUserByCredentials(
  email: string,
  password: string
): Promise<UserAccount | null> {
  const supabaseAdmin = getSupabaseAdmin() as any;
  const { data, error } = await supabaseAdmin
    .from("app_users")
    .select("id,email,password,name,role")
    .eq("email", email)
    .eq("password", password)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase app_users query failed: ${error.message}`);
  }
  if (!data) return null;
  return mapUserRowToAccount(data);
}

export async function findUserById(id: string): Promise<UserAccount | null> {
  const supabaseAdmin = getSupabaseAdmin() as any;
  const { data, error } = await supabaseAdmin
    .from("app_users")
    .select("id,email,password,name,role")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase user-by-id query failed: ${error.message}`);
  }
  if (!data) return null;
  return mapUserRowToAccount(data);
}

export async function createSessionRecord(input: {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}) {
  const supabaseAdmin = getSupabaseAdmin() as any;
  const payload = [
    {
      id: input.id,
      user_id: input.userId,
      created_at: input.createdAt,
      expires_at: input.expiresAt
    }
  ];
  const { error } = await supabaseAdmin.from("app_sessions").upsert(payload, {
    onConflict: "id"
  });

  if (error) {
    throw new Error(`Supabase session upsert failed: ${error.message}`);
  }
}

export async function deleteSessionsForUser(userId: string) {
  const supabaseAdmin = getSupabaseAdmin() as any;
  const { error } = await supabaseAdmin.from("app_sessions").delete().eq("user_id", userId);
  if (error) {
    throw new Error(`Supabase session delete by user failed: ${error.message}`);
  }
}

export async function deleteSessionById(id: string) {
  const supabaseAdmin = getSupabaseAdmin() as any;
  const { error } = await supabaseAdmin.from("app_sessions").delete().eq("id", id);
  if (error) {
    throw new Error(`Supabase session delete failed: ${error.message}`);
  }
}

export async function findSessionById(id: string) {
  const supabaseAdmin = getSupabaseAdmin() as any;
  const { data, error } = await supabaseAdmin
    .from("app_sessions")
    .select("id,user_id,created_at,expires_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase session query failed: ${error.message}`);
  }
  return data;
}

export async function listAssets(category?: AssetCategory): Promise<AssetRecord[]> {
  const supabaseAdmin = getSupabaseAdmin() as any;
  let query = supabaseAdmin
    .from("assets")
    .select("id,name,category,src,tags,uploaded_by,created_at")
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Supabase assets query failed: ${error.message}`);
  }

  return (data ?? []).map((row: DbAssetRow) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    src: row.src,
    tags: row.tags ?? [],
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at
  }));
}

export async function insertAssets(records: AssetRecord[]) {
  if (records.length === 0) return [];
  const supabaseAdmin = getSupabaseAdmin() as any;

  const payload: DbAssetInsert[] = records.map((record) => ({
      id: record.id,
      name: record.name,
      category: record.category,
      src: record.src,
      tags: record.tags,
      uploaded_by: record.uploadedBy,
      created_at: record.createdAt
    }));

  const { error } = await supabaseAdmin.from("assets").insert(payload);

  if (error) {
    throw new Error(`Supabase assets insert failed: ${error.message}`);
  }

  return records;
}
