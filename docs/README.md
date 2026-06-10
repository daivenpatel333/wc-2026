# Project Docs

This folder is intentionally small. Code, tests, schemas, migrations, fixtures, and checked-in
assets are the source of truth for implemented behavior. Markdown should help engineers find and
operate the code, not duplicate the product or API contract.

## Start Here

- [Root README](../README.md): local startup, commands, app surfaces, and technical map.
- [Railway deployment](./deployment.md): production setup runbook for the first Railway deploy.

## Code Ownership Map

| Question                        | Source of truth                                                      |
| ------------------------------- | -------------------------------------------------------------------- |
| Roster rules and validation     | `src/domain/validation.ts`, `src/domain/validation.test.ts`          |
| Scoring rules and calculations  | `src/domain/scoring.ts`, `src/domain/scoring.test.ts`                |
| Region buckets and mapping      | `src/domain/regions.ts`                                              |
| Position normalization          | `src/domain/positions.ts`, `src/domain/positions.test.ts`            |
| Leaderboard ranking             | `src/domain/leaderboard.ts`, `src/domain/leaderboard.test.ts`        |
| Public/admin pages              | `src/routes/*.tsx`, `src/components/`                                |
| API behavior                    | `src/routes/api.*.ts`, `src/server/api-utils.ts`                     |
| Team submission and edit tokens | `src/server/services/teams.ts`, `src/server/services/teams.test.ts`  |
| Admin mutations and audit logs  | `src/server/services/adminTeams.ts`, `src/server/services/scores.ts` |
| Persistence contract and schema | `src/server/db/store.ts`, `src/server/db/schema.ts`, migrations      |
| Runtime configuration           | `.env.example`, `src/server/env.ts`                                  |
| Auth and admin bootstrap        | `src/server/auth/`, `src/routes/api.auth.$.ts`                       |
| Imports, fixtures, and cache    | `src/server/imports/`, `src/server/services/imports.ts`              |
| Build and validation tooling    | `package.json`, `vite.config.ts`, `nixpacks.toml`                    |

## Documentation Rule

When behavior changes, update code and tests first. Update Markdown only when it helps a future
engineer discover the source file, deploy the app, or run an operational process.
