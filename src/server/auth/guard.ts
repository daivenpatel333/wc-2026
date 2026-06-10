import { AppError } from "#/server/services/errors";
import { auth, ensureAdminBootstrapped } from "./auth";

export interface AdminSession {
  userId: string;
  email: string;
  name: string;
}

/**
 * Server-side guard for admin pages and /api/admin/* handlers. Requires a
 * Better Auth session whose user carries the admin role; anything else is a
 * 401 without leaking whether the account exists.
 */
export async function requireAdmin(headers: Headers): Promise<AdminSession> {
  await ensureAdminBootstrapped();
  const session = await auth.api.getSession({ headers });
  if (session === null) {
    throw new AppError("UNAUTHORIZED", "Admin authentication required.", { status: 401 });
  }
  const role = (session.user as { role?: string | null }).role;
  if (role !== "admin") {
    throw new AppError("UNAUTHORIZED", "Admin authentication required.", { status: 401 });
  }
  return { userId: session.user.id, email: session.user.email, name: session.user.name };
}

export async function getAdminSession(headers: Headers): Promise<AdminSession | null> {
  try {
    return await requireAdmin(headers);
  } catch {
    return null;
  }
}
