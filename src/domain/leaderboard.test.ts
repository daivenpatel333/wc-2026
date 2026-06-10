import { describe, expect, it } from "vite-plus/test";
import { rankTeams } from "./leaderboard";

describe("rankTeams", () => {
  it("orders by total points descending", () => {
    const ranked = rankTeams([
      { id: "low", totalPoints: 10, createdAt: "2026-06-01T00:00:00.000Z" },
      { id: "high", totalPoints: 99, createdAt: "2026-06-02T00:00:00.000Z" },
      { id: "mid", totalPoints: 55, createdAt: "2026-06-03T00:00:00.000Z" },
    ]);
    expect(ranked.map((team) => team.id)).toEqual(["high", "mid", "low"]);
    expect(ranked.map((team) => team.rank)).toEqual([1, 2, 3]);
  });

  it("breaks ties by earliest submission first", () => {
    const ranked = rankTeams([
      { id: "later", totalPoints: 50, createdAt: "2026-06-05T12:00:00.000Z" },
      { id: "earlier", totalPoints: 50, createdAt: "2026-06-01T08:00:00.000Z" },
    ]);
    expect(ranked.map((team) => team.id)).toEqual(["earlier", "later"]);
  });

  it("does not mutate its input", () => {
    const input = [
      { id: "a", totalPoints: 1, createdAt: "2026-06-01T00:00:00.000Z" },
      { id: "b", totalPoints: 2, createdAt: "2026-06-01T00:00:00.000Z" },
    ];
    rankTeams(input);
    expect(input.map((team) => team.id)).toEqual(["a", "b"]);
  });
});
