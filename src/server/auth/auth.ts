import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { memoryAdapter, type MemoryDB } from "better-auth/adapters/memory";
import { admin } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "#/server/db/schema";
import { getServerEnv } from "#/server/env";

/**
 * Better Auth instance for admin authentication. Railway production uses the
 * PostgreSQL-backed Drizzle adapter through DATABASE_URL; local development
 * falls back to an in-memory adapter so the app runs with zero setup (sessions
 * reset on restart).
 */
function buildDatabase() {
  const env = getServerEnv();
  console.log("AUTH URL:", env.betterAuthUrl);
  if (env.databaseUrl !== undefined) {
    const client = postgres(env.databaseUrl, { max: 4, prepare: false });
    return drizzleAdapter(drizzle(client, { schema }), {
      provider: "pg",
      schema: {
        user: schema.authUsers,
        session: schema.authSessions,
        account: schema.authAccounts,
        verification: schema.authVerifications,
      },
    });
  }
  const memoryDb: MemoryDB = { user: [], session: [], account: [], verification: [] };
  return memoryAdapter(memoryDb);
}

const env = getServerEnv();

export const auth = betterAuth({
  database: buildDatabase(),
  secret: env.betterAuthSecret,
  // TEMP DEBUG: disable baseURL...(env.betterAuthUrl === undefined ? {} : { baseURL: env.betterAuthUrl }),
  emailAndPassword: {
    enabled: true,
    // No self-service accounts exist in this product; the only user is the
    // bootstrap admin created below through the internal adapter.
    disableSignUp: true,
  },
  plugins: [admin()],
});

let bootstrapPromise: Promise<void> | null = null;

/**
 * Ensure the bootstrap admin exists before any auth-dependent request is
 * served. Reads ADMIN_EMAIL / ADMIN_PASSWORD (development defaults from the
 * docs otherwise) and assigns the Better Auth admin role. A failed attempt
 * clears the memoized promise so the next request retries instead of
 * permanently locking out the admin.
 */
export function ensureAdminBootstrapped(): Promise<void> {
  bootstrapPromise ??= bootstrapAdmin().catch((error: unknown) => {
    bootstrapPromise = null;
    throw error;
  });
  return bootstrapPromise;
}

async function bootstrapAdmin(): Promise<void> {
  const context = await auth.$context;
  const existing = await context.internalAdapter.findUserByEmail(env.adminEmail);
  if (existing !== null) {
    return;
  }
  const user = await context.internalAdapter.createUser({
    email: env.adminEmail,
    name: env.adminName,
    emailVerified: true,
    role: "admin",
  });
  await context.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: await context.password.hash(env.adminPassword),
  });
  if (env.usesDevAdminCredentials && !env.isProduction) {
    console.info(`[wc2026] development admin ready: ${env.adminEmail}`);
  }
}
