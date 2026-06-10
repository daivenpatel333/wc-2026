/**
 * Server-side configuration. Reads environment variables once with safe
 * development defaults; production values come from Railway service variables.
 */
console.log("ENV LOADING");
const DEFAULT_TOURNAMENT_LOCK_AT = "2026-06-11T19:00:00Z";

/** Development-only credentials. Never use in production. */
export const DEV_ADMIN_EMAIL = "admin@wc2026.local";
export const DEV_ADMIN_PASSWORD = "WC2026Admin!";
const DEV_AUTH_SECRET = "wc2026-dev-secret-do-not-use-in-production";

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value === undefined || value.trim() === "" ? undefined : value.trim();
}

export interface ServerEnv {
  databaseUrl: string | undefined;
  tournamentLockAt: Date;
  allowPublicSubmissions: boolean;
  adminEmail: string;
  adminPassword: string;
  adminName: string;
  betterAuthSecret: string;
  betterAuthUrl: string | undefined;
  importCacheDir: string;
  isProduction: boolean;
  usesDevAdminCredentials: boolean;
}

let cached: ServerEnv | null = null;

/** Test-only: clear the memoized env so tests can vary process.env. */
export function resetServerEnvCache(): void {
  cached = null;
}

export function getServerEnv(): ServerEnv {
  if (cached !== null) {
    return cached;
  }

  const isProduction = process.env.NODE_ENV === "production";
  const databaseUrl = readEnv("DATABASE_URL");
  const adminEmailRaw = readEnv("ADMIN_EMAIL");
  const adminPasswordRaw = readEnv("ADMIN_PASSWORD");
  const betterAuthSecretRaw = readEnv("BETTER_AUTH_SECRET");
  const betterAuthUrl = readEnv("BETTER_AUTH_URL");

  // Refuse to boot production on committed development fallbacks; a warning
  // is not enough when the dev credentials are public in the repo.
  if (isProduction) {
    const missing = [
      ["DATABASE_URL", databaseUrl],
      ["ADMIN_EMAIL", adminEmailRaw],
      ["ADMIN_PASSWORD", adminPasswordRaw],
      ["BETTER_AUTH_SECRET", betterAuthSecretRaw],
    ]
      .filter(([, value]) => value === undefined)
      .map(([name]) => name);
    if (missing.length > 0) {
      throw new Error(
        `[wc2026] Refusing to start in production without ${missing.join(", ")}. ` +
          "Set them as Railway service variables (see .env.example).",
      );
    }
  }

  const lockRaw = readEnv("TOURNAMENT_LOCK_AT") ?? DEFAULT_TOURNAMENT_LOCK_AT;
  const lockParsed = new Date(lockRaw);
  const tournamentLockAt = Number.isNaN(lockParsed.getTime())
    ? new Date(DEFAULT_TOURNAMENT_LOCK_AT)
    : lockParsed;

  const adminEmail = adminEmailRaw ?? DEV_ADMIN_EMAIL;
  const adminPassword = adminPasswordRaw ?? DEV_ADMIN_PASSWORD;
  const betterAuthSecret = betterAuthSecretRaw ?? DEV_AUTH_SECRET;
  const usesDevAdminCredentials =
    adminEmail === DEV_ADMIN_EMAIL || adminPassword === DEV_ADMIN_PASSWORD;

  if (isProduction && usesDevAdminCredentials) {
    throw new Error(
      "[wc2026] Refusing to start in production with development admin credentials. " +
        "Set unique ADMIN_EMAIL and ADMIN_PASSWORD service variables.",
    );
  }
  if (isProduction && betterAuthSecret === DEV_AUTH_SECRET) {
    throw new Error(
      "[wc2026] Refusing to start in production with the committed development auth secret. " +
        "Set BETTER_AUTH_SECRET to a unique secret value.",
    );
  }

  cached = {
    databaseUrl,
    tournamentLockAt,
    allowPublicSubmissions: (readEnv("ALLOW_PUBLIC_SUBMISSIONS") ?? "true") !== "false",
    adminEmail,
    adminPassword,
    adminName: readEnv("ADMIN_NAME") ?? "Tournament Admin",
    betterAuthSecret,
    betterAuthUrl,
    importCacheDir: readEnv("IMPORT_CACHE_DIR") ?? ".data-cache",
    isProduction,
    usesDevAdminCredentials,
  };
  return cached;
}

export function isTournamentLocked(now: Date = new Date()): boolean {
  return now.getTime() >= getServerEnv().tournamentLockAt.getTime();
}
