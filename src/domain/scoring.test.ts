import { describe, expect, it } from "vite-plus/test";
import { CLEAN_SHEET_MINUTES, emptyStats, scorePlayer, scoreTeam } from "./scoring";
import type { PlayerStats, ScoreAdjustment } from "./types";

function stats(overrides: Partial<PlayerStats>): PlayerStats {
  return { ...emptyStats("p1"), ...overrides };
}

function adjustment(points: number): ScoreAdjustment {
  return {
    id: `adj-${points}`,
    targetType: "player",
    targetId: "p1",
    points,
    reason: "test",
    adminId: "admin-1",
    createdAt: "2026-06-09T00:00:00.000Z",
  };
}

describe("scorePlayer base stats", () => {
  it("scores goals at 10 points each for every position", () => {
    expect(scorePlayer(stats({ goals: 2 }), "FWD").totalPoints).toBe(20);
    expect(scorePlayer(stats({ goals: 2 }), "GK").totalPoints).toBe(20);
  });

  it("scores assists, shots, tackles, and interceptions", () => {
    const score = scorePlayer(
      stats({ assists: 2, shots: 3, tacklesWon: 4, interceptions: 6 }),
      "MID",
    );
    expect(score.totalPoints).toBe(2 * 6 + 3 * 0.5 + 4 * 1 + 6 * 0.5);
  });

  it("applies negative points for cards and penalty misses", () => {
    const score = scorePlayer(stats({ yellowCards: 2, redCards: 1, penaltyMisses: 1 }), "DEF");
    expect(score.totalPoints).toBe(2 * -1.5 + 1 * -3 + 1 * -5);
  });
});

describe("clean sheet rules", () => {
  it("gives defenders 4 points per clean sheet only at 60+ minutes", () => {
    const played = scorePlayer(
      stats({ cleanSheets: 2, minutesPlayed: CLEAN_SHEET_MINUTES }),
      "DEF",
    );
    expect(played.totalPoints).toBe(8);

    const benched = scorePlayer(
      stats({ cleanSheets: 2, minutesPlayed: CLEAN_SHEET_MINUTES - 1 }),
      "DEF",
    );
    expect(benched.totalPoints).toBe(0);
  });

  it("gives goalkeepers 5 points per clean sheet only at 60+ minutes", () => {
    expect(scorePlayer(stats({ cleanSheets: 1, minutesPlayed: 90 }), "GK").totalPoints).toBe(5);
    expect(scorePlayer(stats({ cleanSheets: 1, minutesPlayed: 45 }), "GK").totalPoints).toBe(0);
  });

  it("gives midfielders and forwards no clean sheet points", () => {
    expect(scorePlayer(stats({ cleanSheets: 3, minutesPlayed: 90 }), "MID").totalPoints).toBe(0);
    expect(scorePlayer(stats({ cleanSheets: 3, minutesPlayed: 90 }), "FWD").totalPoints).toBe(0);
  });
});

describe("goalkeeper-only categories", () => {
  it("scores saves, goals against, and penalty saves for goalkeepers", () => {
    const score = scorePlayer(stats({ saves: 4, goalsAgainst: 2, penaltySaves: 1 }), "GK");
    expect(score.totalPoints).toBe(4 * 2 + 2 * -2 + 1 * 3);
  });

  it("ignores goalkeeper categories for outfield players", () => {
    const score = scorePlayer(stats({ saves: 4, goalsAgainst: 2, penaltySaves: 1 }), "DEF");
    expect(score.totalPoints).toBe(0);
  });
});

describe("adjustments", () => {
  it("adds player adjustments while keeping the calculated portion visible", () => {
    const score = scorePlayer(stats({ goals: 1 }), "FWD", [adjustment(-2.5), adjustment(1)]);
    expect(score.basePoints).toBe(10);
    expect(score.adjustmentPoints).toBe(-1.5);
    expect(score.totalPoints).toBe(8.5);
  });

  it("sums team totals with additive team adjustments", () => {
    const team = scoreTeam([10, 5.5, -2], [adjustment(3)]);
    expect(team.calculatedPoints).toBe(13.5);
    expect(team.adjustmentPoints).toBe(3);
    expect(team.totalPoints).toBe(16.5);
  });
});

describe("breakdown entries", () => {
  it("exposes a per-statistic breakdown that sums to the calculated total", () => {
    const score = scorePlayer(
      stats({ goals: 1, shots: 5, yellowCards: 1, saves: 2, cleanSheets: 1, minutesPlayed: 90 }),
      "GK",
    );
    const summed = score.entries.reduce((sum, entry) => sum + entry.points, 0);
    expect(summed).toBe(score.basePoints + score.bonusPoints);
    expect(score.totalPoints).toBe(10 + 2.5 - 1.5 + 4 + 5);
  });

  it("is deterministic for identical inputs", () => {
    const input = stats({ goals: 3, assists: 1, shots: 7, minutesPlayed: 90, cleanSheets: 1 });
    expect(scorePlayer(input, "DEF")).toEqual(scorePlayer(input, "DEF"));
  });
});
