# Dev1 Diagnostic — 401 on /api/sites

## Date: 2026-03-26

## Root Cause Analysis

### Problem
POST /api/sites returns 401 because `getAuthenticatedUser()` fails at the Prisma DB query step, catches the error, and originally returned null (causing 401).

### Findings

1. **Prisma generate not running on Vercel build**
   - `package.json` build script was just `next build` without `prisma generate`
   - This means the Prisma Client was not regenerated with the current schema on deployment
   - **Fix**: Added `prisma generate` to build script and `postinstall` hook

2. **Vercel env vars had trailing `\n` characters**
   - Multiple env vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GEMINI_API_KEY, JWT_SECRET, SITE_URL) contained trailing newlines
   - This can break URL parsing and authentication
   - **Fix**: Re-set all affected env vars without trailing newlines

3. **DIRECT_URL on Vercel was wrong**
   - Was set to session-mode pooler (pooler.supabase.com:5432) instead of direct connection
   - Not critical for runtime (only DATABASE_URL matters) but wrong for migrations
   - **Fix**: Updated to correct session-mode pooler URL

4. **Database tables exist and RLS is off**
   - All Prisma schema tables confirmed present in Supabase
   - Row Level Security disabled on all tables (not blocking Prisma)
   - DATABASE_URL correctly uses pgbouncer pooler on port 6543

5. **Fallback already in auth.ts**
   - A fallback was already deployed that returns Supabase auth user info if Prisma fails
   - This prevents 401 but means DB features (plan limits, etc.) won't work until Prisma connects

## Changes Made

| File | Change |
|------|--------|
| `app/package.json` | Added `prisma generate` to build script + `postinstall` hook |
| `app/src/lib/prisma.ts` | Added error-level logging in production for diagnostics |
| `app/src/app/api/sites/route.ts` | Wrapped all Prisma calls in try/catch, returns 500 with details instead of crashing |
| `app/src/app/api/debug/db/route.ts` | New debug endpoint to test DB connection, tables, and env vars |
| Vercel env vars | Fixed trailing newlines on 5 env vars, corrected DIRECT_URL |

## Debug Endpoint

`GET /api/debug/db` returns:
- Whether DATABASE_URL and DIRECT_URL are set
- Connection test result (SELECT NOW())
- List of public tables
- User count

## Next Steps

- DevOps should redeploy to pick up the build script fix and env var changes
- After deploy, test `/api/debug/db` to confirm Prisma connects
- Test the full flow: signup -> login -> create site
