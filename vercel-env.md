# Vercel Environment Variables Setup

You MUST set these environment variables in the Vercel dashboard BEFORE deploying.
Vite bakes env vars into the build at compile time — they cannot be added after.

## How to Set Environment Variables in Vercel

1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Click **Settings** tab (top)
4. Click **Environment Variables** (left sidebar)
5. Add each variable below (one by one)
6. After adding all → redeploy (Vercel will rebuild with the real values)

## Required Variables

### Frontend Variables (VITE_ prefix — baked into client bundle)

| Name | Value | Where to find |
|------|-------|---------------|
| `VITE_SUPABASE_URL` | `https://your-project-ref.supabase.co` | Supabase > Project Settings > API > Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Supabase > Project Settings > API > anon public |

### Backend Variables (server-side only)

| Name | Value | Where to find |
|------|-------|---------------|
| `DATABASE_URL` | `postgresql://postgres....` | Supabase > Project Settings > Database > Connection String > URI |
| `SUPABASE_URL` | Same as VITE_SUPABASE_URL | Same as above |
| `SUPABASE_ANON_KEY` | Same as VITE_SUPABASE_ANON_KEY | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Supabase > Project Settings > API > service_role secret |

### Example (replace with YOUR actual values):

```
VITE_SUPABASE_URL=https://abc123def.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3ZndpcGpmbmZ6d3d3dG11eGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNjc1MDAsImV4cCI6MjA1Njk0MzUwMH0.xxxxx
SUPABASE_URL=https://abc123def.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...same_as_above...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...service_role...
DATABASE_URL=postgresql://postgres.abc123def:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

## After Setting Variables

1. Click **Save** on each variable
2. Go to **Deployments** tab
3. Click the **...** menu on the latest deployment
4. Click **Redeploy** (this rebuilds with the new env vars)

## Common Mistakes

- **Using placeholder values** like `https://YOUR-PROJECT-REF.supabase.co` — this will crash
- **Forgetting VITE_ prefix** on frontend vars — Vite only exposes `VITE_*` vars to the browser
- **Adding env vars after deploy** — you must redeploy for Vite to pick them up
- **Wrong Anon Key** — make sure you use `anon public` not `service_role` for the frontend
