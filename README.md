# MangaMake Web App

MangaMake is a dark-themed manga editor web application with role-based access:

- **Admin users** can bulk-upload sketches and sprites (and other categories) in batches.
- **Regular users** can browse uploaded assets and place them on the editor canvas.

## Stack

- Next.js (App Router)
- TypeScript
- Cookie-based session auth
- Supabase Postgres (`@supabase/supabase-js`)

## Demo Credentials

- **Admin**
  - Email: `admin@mangamake.dev`
  - Password: `admin123`
- **User**
  - Email: `user@mangamake.dev`
  - Password: `user123`

## Getting Started

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

### Supabase setup

1. Create a Supabase project.
2. In Supabase SQL editor, run:
   - `supabase/schema.sql`
3. Add environment variables in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://<your-project-ref>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
```

4. Run app:

```bash
npm run dev
```

## Main Routes

- `/` Landing page
- `/login` Authentication
- `/dashboard` Role-aware redirect
- `/admin` Admin bulk upload center
- `/editor` User editor workspace

## API Routes

- `POST /api/auth/login` login with `{ email, password }`
- `POST /api/auth/logout` clear session
- `GET /api/auth/me` return current signed-in user
- `GET /api/assets` list assets (optionally `?type=<category>`)
- `POST /api/admin/assets/bulk` admin-only bulk upload

## Database Schema (Supabase)

Tables:

- `app_users` (id, email, password, name, role, created_at)
- `app_sessions` (id, user_id, created_at, expires_at)
- `assets` (id, name, category, tags, src, uploaded_by, created_at)

Seed users inserted by `supabase/schema.sql`:

- `admin@mangamake.dev` / `admin123`
- `user@mangamake.dev` / `user123`

## Admin Bulk Upload Flow

1. Sign in as admin.
2. Open `/admin`.
3. Pick an asset category (focus: **Sprites** and **Sketches** for admin workflows).
4. Select multiple image files and click **Mass Upload**.
5. Assets are immediately available in `/editor` for users.
