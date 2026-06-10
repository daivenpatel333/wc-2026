# Agent Instructions

Keep this file limited to durable project facts. For task-specific behavior, read the relevant code, tests, docs, and local patterns before changing files. These instructions are mirrored in `AGENTS.md` and `CLAUDE.md`; keep both files in sync when changing durable instructions.

## Agent Autonomy

- Read the relevant code, tests, docs, fixtures, and existing patterns before changing files.
- Be critical. Push back when a request creates scope drift, weak architecture, brittle behavior, or conflicts with current implementation evidence.
- Avoid sprawl. Prefer existing patterns, shared domain types, and reusable services over duplicate functions or one-off helpers.
- Do not silently resolve major open product or architecture decisions. Surface the decision, state the smallest reversible assumption if one is needed, and continue only when the assumption keeps future options open.

## Source Of Truth

- Code, tests, schemas, fixtures, and checked-in assets are authoritative for implemented behavior.
- Docs under `docs/` are lightweight guides and runbooks. Start with `docs/README.md` to find the code-owned source for a behavior.
- Markdown does not own product, API, scoring, auth, database, or architecture truth. Keep those facts in code, tests, schemas, migrations, fixtures, and checked-in assets.
- When code and docs disagree, trust the implemented behavior for what the app currently does, then update the docs as supporting navigation if needed.
- When there is no implementation yet, discover the nearest relevant code pattern or docs note, then keep the build small and easy to revise.
- Sibling projects such as `cupid` and `dungeon-idle-2` are references only. Use them for patterns and examples, not as automatic product truth.

## Product Baseline

- This is a FIFA World Cup 2026 fantasy team platform.
- Primary surfaces are the public team builder, public leaderboard, public team detail/edit flow, and secure admin dashboard.
- Public users submit `team_name`, `user_name`, and a 12-player roster. Public accounts are deferred for MVP.
- Submitted teams can be edited through unguessable edit links until tournament lock. Store only token hashes server-side.
- Tournament lock is `2026-06-11T19:00:00Z` unless a product change updates the code/configuration.
- Core roster rules are exactly 12 players, exactly 1 player per imported World Cup group, at least 1 player from each required region bucket, and one valid formation: `1-3-3-5` or `1-3-4-4`.
- The leaderboard is public by default. Treat submitted `user_name` as intentional display text, not private account identity.

## Stack

- Use the current TanStack Start app as the full-stack foundation.
- Use TanStack Router for routes, React 19 for UI, TypeScript for app/server/domain/test code, Tailwind CSS v4 for styling, Nitro for the server runtime integration, Vitest for tests, and Vite Plus through the global `vp` CLI.
- Railway is the deployment baseline. Production persistence should be Railway PostgreSQL through `DATABASE_URL`.
- Better Auth is the planned admin authentication system inside the TanStack Start app.
- Do not add a separate Express, Flask, FastAPI, Firebase, Convex, or WorkOS backend for MVP unless product direction changes.
- Do not add a component library for MVP. Build local React components with Tailwind v4 and project design tokens.
- Do not add `.js` or `.jsx` application files. Use `.ts` and `.tsx` for application, server, domain, and test code.

## Toolchain

- Use Vite Plus first: `vp install`, `vp run dev`, `vp dev`, `vp check`, `vp test`, `vp build`, and `vp preview`.
- Use package scripts only where there is no direct `vp` equivalent, and run them through Vite Plus when possible, for example `vp run generate-routes`.
- The repo's default dev script runs on port 3000: `vp run dev`.
- Check `vite.config.ts` tasks and `package.json` scripts for validation commands before assuming the right command.
- If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

## Architecture

- Let the existing codebase define the architecture before adding new conventions.
- Keep TanStack route components focused on route loading, composition, and UI orchestration. Move reusable business behavior out of presentation components.
- Keep fantasy rules in typed domain modules such as `src/domain/validation.ts`, `src/domain/scoring.ts`, `src/domain/regions.ts`, and `src/domain/positions.ts`.
- Server-side validation must mirror client-side validation for roster size, groups, regions, formation, team lock, and edit-token permissions.
- Keep API route handlers thin. Put business rules in domain services and persistence in repositories or a small data access layer.
- Use `src/server/db/` for database client, schema, migrations, and repositories. The current implementation uses Drizzle for PostgreSQL; verify local patterns before adding or changing database code.
- Keep import jobs isolated under `src/server/imports/` or an equivalent server-only area. Admin routes may trigger jobs, but parsing, validation, caching, and persistence should be testable without UI.
- `src/routeTree.gen.ts` is generated by TanStack Router tooling. Do not hand-edit it except as generated output; run `vp run generate-routes` after route-file changes when needed.
- Use the `#/*` or `@/*` path aliases for imports from `src` when that improves clarity.
- Keep types explicit and narrow. Avoid `any` and `as any`; if an escape hatch is unavoidable, keep it local and explain why.
- Add abstractions only when they remove real duplication, clarify ownership, or match an established local pattern.

## Data Imports And Scoring

- FIFA and FBref sources are volatile external dependencies. Importers should tolerate layout changes, missing data, partial failures, and source-specific identifiers.
- Do not hard-code the 2026 group labels into roster validation. Derive groups from imported or fixture tournament data.
- Preserve submission-time validation snapshots for selected players: group, country, region, and fantasy position.
- Use live imported stats for scoring, but do not retroactively invalidate submitted teams unless an explicit admin repair flow does it.
- Cache raw import artifacts before parsing where permitted, and write import logs with status, counts, warnings, errors, and cache references.
- Scoring must be deterministic and test-covered. Keep additive score adjustments auditable and do not replace calculated scores unless operations requirements change.
- Before production use, verify current source URLs, markup, file formats, and terms for FIFA and FBref data collection.

## Auth And Security

- Admin authentication belongs inside this app through Better Auth and Railway PostgreSQL.
- Development credentials from `.env.example` and `src/server/env.ts` are development-only. Production admin bootstrap must use environment variables such as `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `DATABASE_URL`.
- Never hard-code production secrets or production admin passwords.
- Hash public edit tokens before storage. Expire edit tokens no later than tournament lock.
- Guard all admin routes and `/api/admin/*` endpoints on the server.
- Log every admin mutation in an audit table, including team edits/deletes/locks, score adjustments, recalculations, import triggers, and admin role changes.
- Rate-limit public team creation/edit-token attempts and admin login attempts when implementing production hardening.

## UI Work

- Follow existing UI conventions before adding new ones. The current scaffold styles are a starting point, not the final product design.
- Use Tailwind v4 utilities through `className` for normal UI work.
- Avoid inline CSS styles unless a specific dynamic value cannot be represented cleanly with existing utilities or CSS variables.
- Add global CSS in `src/styles.css` only for design tokens, base styling, or shared patterns used across multiple components.
- Enabled clickable UI elements should have an explicit pointer affordance. Disabled controls should have a disabled-state cursor and a clear blocked state where practical.
- Build responsive desktop, tablet, and mobile layouts. Preserve dark mode behavior when changing shared styles.
- Use accessible forms, labels, validation messages, keyboard interactions, focus states, and color contrast.
- Use `lucide-react` for common icons already covered by the dependency instead of hand-rolling icons.

## Browser Testing

- Use browser automation for UI regressions when behavior needs interactive or visual verification.
- Start the local app with `vp run dev` when a dev server is needed and one is not already running.
- Test meaningful public and admin surfaces at desktop and mobile widths for layout, interaction, validation, and dark mode regressions.
- Keep browser artifacts, screenshots, traces, logs, and temporary test files out of the repository root.

## Verification

- Run `vp check` after code changes.
- Run `vp test` when a change touches domain rules, scoring, validation, server routes, database access, imports, auth, or user-facing workflows.
- Run `vp build` when a change touches runtime behavior, deployment behavior, routing, server code, or production-facing configuration.
- For docs-only changes, review relevant links and cross-doc references touched by the edit.
- Fix failing checks instead of dismissing them as unrelated unless the user says there is parallel work.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
