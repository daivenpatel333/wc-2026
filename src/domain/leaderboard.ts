/**
 * Leaderboard ordering: total fantasy points descending, ties broken by
 * earliest submission first. The comparator is exported so every surface
 * (public leaderboard, admin, API) ranks the same way.
 */

export interface RankableTeam {
  id: string;
  totalPoints: number;
  createdAt: string;
}

export function compareTeams(a: RankableTeam, b: RankableTeam): number {
  if (b.totalPoints !== a.totalPoints) {
    return b.totalPoints - a.totalPoints;
  }
  const createdDelta = Date.parse(a.createdAt) - Date.parse(b.createdAt);
  if (createdDelta !== 0) {
    return createdDelta;
  }
  return a.id.localeCompare(b.id);
}

export function rankTeams<T extends RankableTeam>(
  teams: readonly T[],
): Array<T & { rank: number }> {
  return [...teams].sort(compareTeams).map((team, index) => ({ ...team, rank: index + 1 }));
}
