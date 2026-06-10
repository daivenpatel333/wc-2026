import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type {
  AdminAuditLog,
  ImportError,
  ImportRun,
  JsonObject,
  SelectablePlayer,
  Team,
  TournamentGroup,
} from "#/domain/types";
import { getAdminSession, requireAdmin } from "#/server/auth/guard";
import { getDb } from "#/server/db";
import { getServerEnv, isTournamentLocked } from "#/server/env";
import { adminDeleteTeam, adminUpdateTeam } from "#/server/services/adminTeams";
import { isAppError } from "#/server/services/errors";
import { getImportRunDetail, runImport, type ImportSource } from "#/server/services/imports";
import {
  getLeaderboard,
  getTeamRanking,
  type LeaderboardPage,
} from "#/server/services/leaderboard";
import {
  addScoreAdjustment,
  listPlayerScores,
  recalculateAllScores,
} from "#/server/services/scores";
import {
  editTeam,
  submitTeam,
  verifyEditToken,
  type SubmitTeamResult,
  type TeamDetail,
} from "#/server/services/teams";
import { getTournamentGroups } from "#/server/services/tournament";

/**
 * Server functions backing route loaders and UI mutations. They call the
 * same domain services as the REST API, so client behavior and the public
 * contract can never diverge. Mutations return a discriminated result so
 * the UI can render the documented error codes/messages.
 */

export interface ActionFailure {
  ok: false;
  code: string;
  message: string;
  details?: JsonObject;
}

export type ActionResult<T> = ({ ok: true } & T) | ActionFailure;

async function asActionResult<T>(work: () => Promise<T>): Promise<ActionResult<{ data: T }>> {
  try {
    return { ok: true, data: await work() };
  } catch (error) {
    if (isAppError(error)) {
      return {
        ok: false,
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
      };
    }
    console.error("[server-fn] unhandled error:", error);
    return { ok: false, code: "INTERNAL_ERROR", message: "Something went wrong." };
  }
}

export interface BuilderData {
  groups: TournamentGroup[];
  players: SelectablePlayer[];
  lockAt: string;
  locked: boolean;
  submissionsOpen: boolean;
}

export const fetchBuilderData = createServerFn({ method: "GET" }).handler(
  async (): Promise<BuilderData> => {
    const store = await getDb();
    const env = getServerEnv();
    const [groups, players] = await Promise.all([getTournamentGroups(store), store.listPlayers()]);
    return {
      groups,
      players,
      lockAt: env.tournamentLockAt.toISOString(),
      locked: isTournamentLocked(),
      submissionsOpen: env.allowPublicSubmissions && !isTournamentLocked(),
    };
  },
);

export const submitTeamFn = createServerFn({ method: "POST" })
  .validator((data: { teamName: string; userName: string; playerIds: string[] }) => data)
  .handler(async ({ data }): Promise<ActionResult<{ data: SubmitTeamResult }>> => {
    const store = await getDb();
    return asActionResult(() => submitTeam(store, data));
  });

export const fetchLeaderboardFn = createServerFn({ method: "GET" })
  .validator((data: { limit?: number; offset?: number } | undefined) => data ?? {})
  .handler(async ({ data }): Promise<LeaderboardPage> => {
    const store = await getDb();
    return getLeaderboard(store, data);
  });

export interface TeamPageData {
  detail: TeamDetail;
  rank: number;
  totalTeams: number;
}

export const fetchTeamPageFn = createServerFn({ method: "GET" })
  .validator((data: { teamId: string }) => data)
  .handler(async ({ data }): Promise<ActionResult<{ data: TeamPageData }>> => {
    const store = await getDb();
    return asActionResult(async () => {
      const [ranking, teams] = await Promise.all([
        getTeamRanking(store, data.teamId),
        store.listTeams(),
      ]);
      const detail: TeamDetail = {
        team: ranking.team,
        players: ranking.players,
        calculatedPoints: ranking.calculatedPoints,
        adjustmentPoints: ranking.adjustmentPoints,
        totalPoints: ranking.totalPoints,
        locked: ranking.team.lockedAt !== null || isTournamentLocked(),
      };
      return { detail, rank: ranking.rank, totalTeams: teams.length };
    });
  });

export const verifyEditAccessFn = createServerFn({ method: "POST" })
  .validator((data: { teamId: string; token: string }) => data)
  .handler(async ({ data }): Promise<ActionResult<{ data: { team: Team } }>> => {
    const store = await getDb();
    return asActionResult(async () => ({
      team: await verifyEditToken(store, data.teamId, data.token),
    }));
  });

export const editTeamFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      teamId: string;
      token: string;
      teamName?: string;
      userName?: string;
      playerIds?: string[];
    }) => data,
  )
  .handler(async ({ data }): Promise<ActionResult<{ data: { team: Team } }>> => {
    const store = await getDb();
    const { teamId, token, ...patch } = data;
    return asActionResult(async () => ({ team: await editTeam(store, teamId, token, patch) }));
  });

/* Admin server functions. Every handler re-checks the session server-side. */

export const adminSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  return getAdminSession(getRequest().headers);
});

export interface AdminOverview {
  teams: number;
  players: number;
  countries: number;
  lastImport: ImportRun | null;
  auditLogs: AdminAuditLog[];
  lockAt: string;
  locked: boolean;
}

export const adminOverviewFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminOverview> => {
    await requireAdmin(getRequest().headers);
    const store = await getDb();
    const runs = await store.listImportRuns();
    const env = getServerEnv();
    const [teams, players, countries, auditLogs] = await Promise.all([
      store.listTeams(),
      store.listPlayers({ includeInactive: true }),
      store.listCountries(),
      store.listAuditLogs(12),
    ]);
    return {
      teams: teams.length,
      players: players.length,
      countries: countries.length,
      lastImport: runs[0] ?? null,
      auditLogs,
      lockAt: env.tournamentLockAt.toISOString(),
      locked: isTournamentLocked(),
    };
  },
);

export const adminTeamsFn = createServerFn({ method: "GET" }).handler(async (): Promise<Team[]> => {
  await requireAdmin(getRequest().headers);
  const store = await getDb();
  return store.listTeams();
});

export const adminUpdateTeamFn = createServerFn({ method: "POST" })
  .validator(
    (data: { teamId: string; teamName?: string; userName?: string; locked?: boolean }) => data,
  )
  .handler(async ({ data }): Promise<ActionResult<{ data: { team: Team } }>> => {
    const admin = await requireAdmin(getRequest().headers);
    const store = await getDb();
    const { teamId, ...update } = data;
    return asActionResult(async () => ({
      team: await adminUpdateTeam(store, admin.userId, teamId, update),
    }));
  });

export const adminDeleteTeamFn = createServerFn({ method: "POST" })
  .validator((data: { teamId: string }) => data)
  .handler(async ({ data }): Promise<ActionResult<{ data: { deleted: boolean } }>> => {
    const admin = await requireAdmin(getRequest().headers);
    const store = await getDb();
    return asActionResult(async () => {
      await adminDeleteTeam(store, admin.userId, data.teamId);
      return { deleted: true };
    });
  });

export const adminScoresFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin(getRequest().headers);
  const store = await getDb();
  return {
    players: await listPlayerScores(store),
    teams: await store.listTeams(),
    adjustments: await store.listAllAdjustments(),
  };
});

export const adminAdjustScoreFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      targetType: "player" | "team";
      targetId: string;
      points: number;
      reason: string | null;
    }) => data,
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin(getRequest().headers);
    const store = await getDb();
    return asActionResult(() => addScoreAdjustment(store, { ...data, adminId: admin.userId }));
  });

export const adminRecalculateFn = createServerFn({ method: "POST" }).handler(async () => {
  const admin = await requireAdmin(getRequest().headers);
  const store = await getDb();
  return asActionResult(async () => {
    const result = await recalculateAllScores(store);
    await store.addAuditLog({
      adminUserId: admin.userId,
      action: "score.recalculate",
      targetType: null,
      targetId: null,
      metadata: { ...result },
    });
    return result;
  });
});

export const adminImportsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ImportRun[]> => {
    await requireAdmin(getRequest().headers);
    const store = await getDb();
    return store.listImportRuns();
  },
);

export const adminImportDetailFn = createServerFn({ method: "GET" })
  .validator((data: { importRunId: string }) => data)
  .handler(
    async ({
      data,
    }): Promise<ActionResult<{ data: { run: ImportRun; errors: ImportError[] } }>> => {
      await requireAdmin(getRequest().headers);
      const store = await getDb();
      return asActionResult(() => getImportRunDetail(store, data.importRunId));
    },
  );

export const adminRunImportFn = createServerFn({ method: "POST" })
  .validator((data: { source: ImportSource }) => data)
  .handler(async ({ data }): Promise<ActionResult<{ data: { runs: ImportRun[] } }>> => {
    const admin = await requireAdmin(getRequest().headers);
    const store = await getDb();
    return asActionResult(async () => ({
      runs: await runImport(store, data.source, admin.userId),
    }));
  });
