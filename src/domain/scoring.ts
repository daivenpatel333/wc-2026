import type {
  FantasyPosition,
  PlayerScore,
  PlayerStats,
  ScoreBreakdownEntry,
  ScoreAdjustment,
} from "./types";

/** Minutes a player must play for clean sheet points to count. */
export const CLEAN_SHEET_MINUTES = 60;

interface ScoringRule {
  statistic: keyof Omit<PlayerStats, "playerId" | "statsSource" | "sourceUpdatedAt">;
  label: string;
  pointValue: number;
  /** Restrict the rule to specific fantasy positions; undefined = everyone. */
  positions?: readonly FantasyPosition[];
  /** Zero out the stat unless the player reached CLEAN_SHEET_MINUTES. */
  requiresMinutes?: boolean;
}

/**
 * Fantasy scoring table. Order matters for display: base stats first, then
 * defender bonus, then goalkeeper bonus.
 */
export const SCORING_RULES: readonly ScoringRule[] = [
  { statistic: "goals", label: "Goals", pointValue: 10 },
  { statistic: "assists", label: "Assists", pointValue: 6 },
  { statistic: "shots", label: "Shots", pointValue: 0.5 },
  { statistic: "tacklesWon", label: "Tackles won", pointValue: 1 },
  { statistic: "interceptions", label: "Interceptions", pointValue: 0.5 },
  { statistic: "yellowCards", label: "Yellow cards", pointValue: -1.5 },
  { statistic: "redCards", label: "Red cards", pointValue: -3 },
  { statistic: "penaltyMisses", label: "Penalty misses", pointValue: -5 },
  {
    statistic: "cleanSheets",
    label: "Clean sheets (DEF)",
    pointValue: 4,
    positions: ["DEF"],
    requiresMinutes: true,
  },
  { statistic: "saves", label: "Saves", pointValue: 2, positions: ["GK"] },
  { statistic: "goalsAgainst", label: "Goals against", pointValue: -2, positions: ["GK"] },
  {
    statistic: "cleanSheets",
    label: "Clean sheets (GK)",
    pointValue: 5,
    positions: ["GK"],
    requiresMinutes: true,
  },
  { statistic: "penaltySaves", label: "Penalty saves", pointValue: 3, positions: ["GK"] },
];

const BASE_RULES = SCORING_RULES.filter((rule) => rule.positions === undefined);

export function emptyStats(playerId: string): PlayerStats {
  return {
    playerId,
    goals: 0,
    assists: 0,
    shots: 0,
    tacklesWon: 0,
    interceptions: 0,
    yellowCards: 0,
    redCards: 0,
    penaltyMisses: 0,
    minutesPlayed: 0,
    saves: 0,
    goalsAgainst: 0,
    cleanSheets: 0,
    penaltySaves: 0,
    statsSource: "none",
    sourceUpdatedAt: null,
  };
}

function roundPoints(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Deterministically score one player. Returns the full per-statistic
 * breakdown so the UI and audit views can show how the total was built.
 * Adjustments are additive per the accepted product decision; the calculated
 * portion stays inspectable next to the adjusted total.
 */
export function scorePlayer(
  stats: PlayerStats,
  position: FantasyPosition,
  adjustments: readonly ScoreAdjustment[] = [],
): PlayerScore {
  const entries: ScoreBreakdownEntry[] = [];
  let basePoints = 0;
  let bonusPoints = 0;

  for (const rule of SCORING_RULES) {
    if (rule.positions !== undefined && !rule.positions.includes(position)) {
      continue;
    }
    const rawValue = stats[rule.statistic];
    const eligibleValue =
      rule.requiresMinutes === true && stats.minutesPlayed < CLEAN_SHEET_MINUTES ? 0 : rawValue;
    const points = roundPoints(eligibleValue * rule.pointValue);
    entries.push({
      statistic: rule.statistic,
      label: rule.label,
      statValue: eligibleValue,
      pointValue: rule.pointValue,
      points,
    });
    if (BASE_RULES.includes(rule)) {
      basePoints += points;
    } else {
      bonusPoints += points;
    }
  }

  basePoints = roundPoints(basePoints);
  bonusPoints = roundPoints(bonusPoints);
  const adjustmentPoints = roundPoints(
    adjustments.reduce((sum, adjustment) => sum + adjustment.points, 0),
  );

  return {
    playerId: stats.playerId,
    entries,
    basePoints,
    bonusPoints,
    adjustmentPoints,
    totalPoints: roundPoints(basePoints + bonusPoints + adjustmentPoints),
  };
}

/**
 * Team total = sum of roster player totals + additive team adjustments.
 */
export function scoreTeam(
  playerTotals: readonly number[],
  teamAdjustments: readonly ScoreAdjustment[] = [],
): { calculatedPoints: number; adjustmentPoints: number; totalPoints: number } {
  const calculatedPoints = roundPoints(playerTotals.reduce((sum, points) => sum + points, 0));
  const adjustmentPoints = roundPoints(
    teamAdjustments.reduce((sum, adjustment) => sum + adjustment.points, 0),
  );
  return {
    calculatedPoints,
    adjustmentPoints,
    totalPoints: roundPoints(calculatedPoints + adjustmentPoints),
  };
}
