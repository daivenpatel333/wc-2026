import type { Team } from "#/domain/types";
import type { DataStore } from "#/server/db/store";
import { AppError } from "./errors";

export interface AdminTeamUpdate {
  teamName?: string;
  userName?: string;
  locked?: boolean;
}

/**
 * Admin team management. Every mutation writes an admin_audit_logs row with
 * before/after metadata.
 */
export async function adminUpdateTeam(
  store: DataStore,
  adminId: string,
  teamId: string,
  update: AdminTeamUpdate,
): Promise<Team> {
  const before = await store.getTeam(teamId);
  if (before === null) {
    throw new AppError("TEAM_NOT_FOUND", "Team not found.", { status: 404 });
  }

  const teamName = update.teamName?.trim();
  const userName = update.userName?.trim();
  if (teamName === "") {
    throw new AppError("INVALID_NAME", "Team name cannot be empty.");
  }
  if (userName === "") {
    throw new AppError("INVALID_NAME", "User name cannot be empty.");
  }

  const updated = await store.updateTeam(teamId, {
    ...(teamName === undefined ? {} : { teamName }),
    ...(userName === undefined ? {} : { userName }),
    ...(update.locked === undefined
      ? {}
      : { lockedAt: update.locked ? new Date().toISOString() : null }),
  });
  if (updated === null) {
    throw new AppError("TEAM_NOT_FOUND", "Team not found.", { status: 404 });
  }

  await store.addAuditLog({
    adminUserId: adminId,
    action:
      update.locked === undefined ? "team.update" : update.locked ? "team.lock" : "team.unlock",
    targetType: "team",
    targetId: teamId,
    metadata: {
      before: { teamName: before.teamName, userName: before.userName, lockedAt: before.lockedAt },
      after: { teamName: updated.teamName, userName: updated.userName, lockedAt: updated.lockedAt },
    },
  });
  return updated;
}

export async function adminDeleteTeam(
  store: DataStore,
  adminId: string,
  teamId: string,
): Promise<void> {
  const team = await store.getTeam(teamId);
  if (team === null) {
    throw new AppError("TEAM_NOT_FOUND", "Team not found.", { status: 404 });
  }
  await store.deleteTeam(teamId);
  await store.addAuditLog({
    adminUserId: adminId,
    action: "team.delete",
    targetType: "team",
    targetId: teamId,
    metadata: { teamName: team.teamName, userName: team.userName },
  });
}
