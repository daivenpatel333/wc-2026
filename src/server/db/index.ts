import { getServerEnv } from "#/server/env";
import { createMemoryStore } from "./memory-store";
import { seedStore } from "./seed";
import type { DataStore } from "./store";

let storePromise: Promise<DataStore> | null = null;

/**
 * Resolve the application data store. With DATABASE_URL set, the PostgreSQL
 * store backs the app (Railway production); otherwise the fixture-seeded
 * in-memory store keeps local development zero-setup.
 */
export function getDb(): Promise<DataStore> {
  storePromise ??= initStore();
  return storePromise;
}

async function initStore(): Promise<DataStore> {
  const env = getServerEnv();
  if (env.databaseUrl !== undefined) {
    const { createPgStore } = await import("./pg-store");
    const store = await createPgStore(env.databaseUrl);
    if (!env.isProduction) {
      await seedStore(store);
    }
    return store;
  }
  const store = createMemoryStore();
  await seedStore(store);
  return store;
}
