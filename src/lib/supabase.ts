import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Database = {
  public: {
    Tables: {
      app_users: {
        Row: {
          id: string;
          email: string;
          password: string;
          name: string;
          role: "admin" | "user";
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password: string;
          name: string;
          role: "admin" | "user";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password?: string;
          name?: string;
          role?: "admin" | "user";
          created_at?: string;
        };
      };
      app_sessions: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          created_at: string;
          expires_at: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          expires_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          name: string;
          category: string;
          tags: string[];
          src: string;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          tags?: string[];
          src: string;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          tags?: string[];
          src?: string;
          uploaded_by?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      exec_sql: {
        Args: {
          sql_query: string;
        };
        Returns: unknown;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

function requireEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

let cachedClient: SupabaseClient<Database> | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getSupabaseAdmin() {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = requireEnv(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL"
  );
  const supabaseServiceRoleKey = requireEnv(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    "SUPABASE_SERVICE_ROLE_KEY"
  );

  cachedClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  return cachedClient;
}
