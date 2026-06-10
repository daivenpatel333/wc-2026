# Railway Deployment

The app is not deployed yet. This runbook is for the engineer setting up the first Railway
environment.

## Preflight

Run these locally before deploying:

```bash
vp install
vp check
vp test
vp build
```

Review the code-owned deployment behavior before changing platform settings:

- `nixpacks.toml` installs with pnpm, builds with `pnpm run build`, and starts
  `node .output/server/index.mjs`.
- `src/server/env.ts` refuses production startup without required secrets and PostgreSQL.
- `drizzle.config.ts` applies migrations to `DATABASE_URL`.
- `src/server/db/index.ts` does not seed sample data in production.
- `src/routes/api.health.ts` powers the `/api/health` health check.

## Railway Setup

1. Create a Railway project and add this repo as the app service.
2. Add a Railway PostgreSQL service.
3. On the app service, add `DATABASE_URL` as a reference to the PostgreSQL service variable
   `DATABASE_URL`, for example `${{Postgres.DATABASE_URL}}`.
4. Generate a public domain for the app service, then set `BETTER_AUTH_URL` to that exact
   `https://...` URL. If a custom domain is used, set `BETTER_AUTH_URL` to the custom domain.
5. Configure the app service health check path as `/api/health`.
6. Configure a pre-deploy command: `pnpm run db:migrate`.
7. Deploy the app service.

Useful Railway references:

- [PostgreSQL](https://docs.railway.com/databases/postgresql)
- [Variables](https://docs.railway.com/variables)
- [Public networking](https://docs.railway.com/networking/public-networking)
- [Healthchecks](https://docs.railway.com/deployments/healthchecks)
- [Config as code](https://docs.railway.com/config-as-code/reference)

## Required Variables

Set these on the app service:

```text
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
ADMIN_EMAIL=<production admin email>
ADMIN_PASSWORD=<strong one-time bootstrap password>
ADMIN_NAME=<optional display name>
BETTER_AUTH_SECRET=<random 32+ byte secret>
BETTER_AUTH_URL=https://<railway-or-custom-domain>
TOURNAMENT_LOCK_AT=2026-06-11T19:00:00Z
ALLOW_PUBLIC_SUBMISSIONS=true
IMPORT_CACHE_DIR=.data-cache
```

Generate `BETTER_AUTH_SECRET` with a local command such as:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Production must not use the development admin credentials from `.env.example`.

## First Deploy Checklist

1. Confirm the pre-deploy migration step succeeds.
2. Open `https://<app-domain>/api/health`.
   Expected shape:

   ```json
   {
     "ok": true,
     "store": "postgres",
     "countries": 0
   }
   ```

   `countries` may be `0` before the first import run.

3. Open `/admin/login` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
4. Go to `/admin/imports` and run the `all` import. The current import pipeline uses checked-in
   fixtures; live FIFA/FBref fetching is not wired yet.
5. Recheck `/api/health`; `countries` should be greater than `0`.
6. Check `/`, `/leaderboard`, `/admin/teams`, `/admin/scores`, and `/admin/imports`.
7. If the smoke test needs public team creation after the configured tournament lock, use a
   temporary staging environment with a future `TOURNAMENT_LOCK_AT`. Do not move the production lock
   just to test submissions.

## Operations Notes

- Migrations are idempotent through Drizzle; keep `pnpm run db:migrate` as the Railway pre-deploy
  command unless the migration strategy changes.
- Admin bootstrap happens on auth-dependent requests. Rotating the bootstrap password after an admin
  already exists does not automatically change that user's password.
- The raw import cache is local to the running service filesystem. Treat PostgreSQL as the durable
  production state.
- Add rate limits, backup/restore steps, and live data collection approval before relying on this
  for tournament traffic.
