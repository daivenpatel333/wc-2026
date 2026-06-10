import { rankTeams } from "#/domain/leaderboard";
import type { LeaderboardTeam } from "#/domain/types";
import type { DataStore } from "#/server/db/store";
import { AppError } from "./errors";
import { getTeamDetail } from "./teams";

export interface LeaderboardQuery {
  limit?: number;
  offset?: number;
}

export interface LeaderboardPage {
  totalTeams: number;
  offset: number;
  entries: LeaderboardTeam[];
}

/**
 * Ranked leaderboard page. Ordering: total points descending, ties broken by
 * earliest submission. Each entry carries the full roster with per-player
 * score breakdowns for expandable rows.
 */
export async function getLeaderboard(
  store: DataStore,
  query: LeaderboardQuery = {},
): Promise<LeaderboardPage> {
  const limit = Math.min(Math.max(query.limit ?? 50, 1), 500);
  const offset = Math.max(query.offset ?? 0, 0);

  const teams = await store.listTeams();
  const ranked = rankTeams(teams);
  const page = ranked.slice(offset, offset + limit);

  const entries = await Promise.all(
    page.map(async (team): Promise<LeaderboardTeam> => {
      const detail = await getTeamDetail(store, team.id);
      return {
        rank: team.rank,
        team: detail.team,
        players: detail.players,
        calculatedPoints: detail.calculatedPoints,
        adjustmentPoints: detail.adjustmentPoints,
        totalPoints: detail.totalPoints,
      };
    }),
  );

  return { totalTeams: teams.length, offset, entries };
}

export async function getTeamRanking(store: DataStore, teamId: string): Promise<LeaderboardTeam> {
  const teams = await store.listTeams();
  const ranked = rankTeams(teams);
  const entry = ranked.find((team) => team.id === teamId);
  if (entry === undefined) {
    throw new AppError("TEAM_NOT_FOUND", "Team not found.", { status: 404 });
  }
  const detail = await getTeamDetail(store, teamId);
  return {
    rank: entry.rank,
    team: detail.team,
    players: detail.players,
    calculatedPoints: detail.calculatedPoints,
    adjustmentPoints: detail.adjustmentPoints,
    totalPoints: detail.totalPoints,
  };
}
