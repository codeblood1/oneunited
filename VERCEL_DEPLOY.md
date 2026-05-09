# OneUnited Bank — Vercel + Supabase Deployment Guide

## Prerequisites

- A [Vercel](https://vercel.com) account
- A [Supabase](https://supabase.com) account (free tier works)
- Your code pushed to a GitHub repository

---

## Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. **Get your project URL and keys:**
   - Go to Project Settings > API
   - Copy `Project URL` → this is your `SUPABASE_URL`
   - Copy `anon public` key → this is your `SUPABASE_ANON_KEY`
   - Copy `service_role secret` key → this is your `SUPABASE_SERVICE_ROLE_KEY`

3. **Get your database connection string:**
   - Go to Project Settings > Database
   - Under "Connection String", select "URI"
   - Copy the connection string and replace `[YOUR-PASSWORD]` with your database password

4. **Update your `.env` file:**
   ```env
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
   DATABASE_URL=postgresql://postgres.your-project-ref:[password]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```

5. **Sync the database schema:**
   ```bash
   npm run db:push
   ```

---

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. In the project settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/public`
   - **Install Command:** `npm install`

4. Add all environment variables from your `.env` file:
   | Key | Value |
   |-----|-------|
   | `APP_ID` | From Kimi portal |
   | `APP_SECRET` | From Kimi portal |
   | `OWNER_UNION_ID` | From `.env` |
   | `KIMI_AUTH_URL` | `https://auth.kimi.com` |
   | `KIMI_OPEN_URL` | `https://open.kimi.com` |
   | `DATABASE_URL` | Supabase connection string |
   | `SUPABASE_URL` | Your Supabase project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
   | `NODE_ENV` | `production` |

5. Click **Deploy**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (run from project root)
vercel --prod

# Follow the prompts to configure your project
```

---

## Step 3: Configure OAuth Callback

After deployment, update your Kimi app callback URL:

1. Go to [agent.kimi.com](https://agent.kimi.com)
2. Select your app
3. Set the **OAuth Callback URL** to:
   ```
   https://your-vercel-domain.vercel.app/api/oauth/callback
   ```

---

## Step 4: Verify Deployment

1. Visit your deployed URL
2. Click "Get Started" to test login
3. Complete OAuth flow
4. Verify you land on the Dashboard
5. Test banking features (accounts, transfers, etc.)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "404 Not Found" on `/login` | The `vercel.json` rewrite rules handle this. Make sure the file is committed. |
| "Database connection refused" | Check `DATABASE_URL` is correct. Supabase connection strings use port `6543` for pooler. |
| "OAuth callback fails" | Ensure `VITE_KIMI_AUTH_URL` and `VITE_APP_ID` match your Kimi app config. |
| "Build fails" | Run `npm run build` locally first to catch errors before deploying. |
| "Blank page after login" | Check browser console for CORS errors. Verify API URL is correct. |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| Backend | Hono + tRPC 11.x |
| Database | Supabase (PostgreSQL) + Drizzle ORM |
| Auth | Kimi OAuth 2.0 + JWT Sessions |
| Deployment | Vercel (Static + Serverless) |
