import { emptyStats, scorePlayer, scoreTeam } from "#/domain/scoring";
import type { PlayerScore, ScoreAdjustment } from "#/domain/types";
import type { DataStore } from "#/server/db/store";
import { AppError } from "./errors";

export interface PlayerScoreRow {
  playerId: string;
  playerName: string;
  countryName: string;
  worldCupGroup: string;
  position: string;
  score: PlayerScore;
  minutesPlayed: number;
  statsSource: string;
}

/**
 * Recalculate cached fantasy points for every player with stats, then every
 * team total. Deterministic: same stats + adjustments always produce the
 * same totals.
 */
export async function recalculateAllScores(
  store: DataStore,
): Promise<{ playersRecalculated: number; teamsRecalculated: number }> {
  const calculatedAt = new Date().toISOString();
  const allAdjustments = await store.listAllAdjustments();
  const playerAdjustments = new Map<string, ScoreAdjustment[]>();
  const teamAdjustments = new Map<string, ScoreAdjustment[]>();
  for (const adjustment of allAdjustments) {
    const bucket = adjustment.targetType === "player" ? playerAdjustments : teamAdjustments;
    const list = bucket.get(adjustment.targetId) ?? [];
    list.push(adjustment);
    bucket.set(adjustment.targetId, list);
  }

  // Recalculate every player with stats AND every player carrying an
  // adjustment but no stats row yet (e.g. adjusted before the stats import
  // matched them) — otherwise adjustments would never reach cached totals.
  const allStats = await store.listStats();
  const statsByPlayer = new Map(allStats.map((stats) => [stats.playerId, stats]));
  const playerIds = new Set([...statsByPlayer.keys(), ...playerAdjustments.keys()]);

  let playersRecalculated = 0;
  for (const playerId of playerIds) {
    const player = await store.getPlayer(playerId);
    if (player === null) {
      continue;
    }
    const stats = statsByPlayer.get(playerId);
    const score = scorePlayer(
      stats ?? emptyStats(playerId),
      player.position,
      playerAdjustments.get(playerId) ?? [],
    );
    if (stats !== undefined) {
      await store.setCachedFantasyPoints(playerId, score.totalPoints, calculatedAt);
    } else {
      // Create the cache row so team totals (which read cached points) see
      // the adjustment; statsSource marks it as adjustment-only.
      await store.upsertStats({
        ...emptyStats(playerId),
        statsSource: "none:adjustment-only",
        fantasyPoints: score.totalPoints,
        calculatedAt,
      });
    }
    playersRecalculated += 1;
  }

  let teamsRecalculated = 0;
  for (const team of await store.listTeams()) {
    const playerIds = await store.getTeamPlayerIds(team.id);
    const totals = (
      await Promise.all(playerIds.map((playerId) => store.getStatsForPlayer(playerId)))
    ).map((stats) => stats?.fantasyPoints ?? 0);
    const result = scoreTeam(totals, teamAdjustments.get(team.id) ?? []);
    await store.updateTeam(team.id, {
      totalPoints: result.totalPoints,
      manualPointsAdjustment: result.adjustmentPoints,
    });
    teamsRecalculated += 1;
  }

  return { playersRecalculated, teamsRecalculated };
}

export async function getPlayerScore(store: DataStore, playerId: string): Promise<PlayerScore> {
  const player = await store.getPlayer(playerId);
  if (player === null) {
    throw new AppError("PLAYER_NOT_FOUND", "Player not found.", { status: 404 });
  }
  const stats = (await store.getStatsForPlayer(playerId)) ?? emptyStats(playerId);
  const adjustments = await store.listAdjustments("player", playerId);
  return scorePlayer(stats, player.position, adjustments);
}

export async function listPlayerScores(store: DataStore): Promise<PlayerScoreRow[]> {
  const [players, allStats, allAdjustments] = await Promise.all([
    store.listPlayers({ includeInactive: true }),
    store.listStats(),
    store.listAllAdjustments(),
  ]);
  const statsByPlayer = new Map(allStats.map((stats) => [stats.playerId, stats]));
  const byPlayer = new Map<string, ScoreAdjustment[]>();
  for (const adjustment of allAdjustments) {
    if (adjustment.targetType === "player") {
      const list = byPlayer.get(adjustment.targetId) ?? [];
      list.push(adjustment);
      byPlayer.set(adjustment.targetId, list);
    }
  }

  const rows: PlayerScoreRow[] = [];
  for (const player of players) {
    const stats = statsByPlayer.get(player.id) ?? {
      ...emptyStats(player.id),
      fantasyPoints: 0,
      calculatedAt: "",
      id: "",
    };
    rows.push({
      playerId: player.id,
      playerName: player.name,
      countryName: player.countryName,
      worldCupGroup: player.worldCupGroup,
      position: player.position,
      score: scorePlayer(stats, player.position, byPlayer.get(player.id) ?? []),
      minutesPlayed: stats.minutesPlayed,
      statsSource: stats.statsSource,
    });
  }
  return rows.sort((a, b) => b.score.totalPoints - a.score.totalPoints);
}

export async function addScoreAdjustment(
  store: DataStore,
  input: {
    targetType: "player" | "team";
    targetId: string;
    points: number;
    reason: string | null;
    adminId: string;
  },
): Promise<ScoreAdjustment> {
  if (!Number.isFinite(input.points) || input.points === 0) {
    throw new AppError("INVALID_ADJUSTMENT", "Adjustment points must be a non-zero number.");
  }
  if (input.targetType === "player") {
    const player = await store.getPlayer(input.targetId);
    if (player === null) {
      throw new AppError("PLAYER_NOT_FOUND", "Player not found.", { status: 404 });
    }
  } else {
    const team = await store.getTeam(input.targetId);
    if (team === null) {
      throw new AppError("TEAM_NOT_FOUND", "Team not found.", { status: 404 });
    }
  }

  const adjustment = await store.addAdjustment(input);
  await store.addAuditLog({
    adminUserId: input.adminId,
    action: input.targetType === "player" ? "score.adjust_player" : "score.adjust_team",
    targetType: input.targetType,
    targetId: input.targetId,
    metadata: { points: input.points, reason: input.reason },
  });
  await recalculateAllScores(store);
  return adjustment;
}
