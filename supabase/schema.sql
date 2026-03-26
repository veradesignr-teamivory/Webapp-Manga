-- Enable extension for UUID generation
create extension if not exists pgcrypto;

-- Users table (app-level auth for this project)
create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password text not null,
  name text not null,
  role text not null check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

-- Sessions table used by cookie session IDs
create table if not exists public.app_sessions (
  id uuid primary key,
  user_id uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists idx_app_sessions_user_id on public.app_sessions(user_id);
create index if not exists idx_app_sessions_expires_at on public.app_sessions(expires_at);

-- Asset library table
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  tags text[] not null default '{}',
  src text not null,
  uploaded_by uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_assets_category on public.assets(category);
create index if not exists idx_assets_created_at on public.assets(created_at desc);

-- Optional seed accounts (safe upsert-like behavior by email)
insert into public.app_users (email, password, name, role)
values
  ('admin@mangamake.dev', 'admin123', 'Admin', 'admin'),
  ('user@mangamake.dev', 'user123', 'Creator', 'user')
on conflict (email) do update
set
  password = excluded.password,
  name = excluded.name,
  role = excluded.role;
