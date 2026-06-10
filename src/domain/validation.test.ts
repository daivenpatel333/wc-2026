import { describe, expect, it } from "vite-plus/test";
import type { FantasyPosition, Region } from "./types";
import { FORMATIONS, ROSTER_SIZE, validateRoster, type RosterEntry } from "./validation";

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;

const REGION_ROTATION: Region[] = [
  "North/Central America & Caribbean",
  "South America",
  "Europe",
  "Asia",
  "Africa",
];

const FORMATION_1335: FantasyPosition[] = [
  "GK",
  "DEF",
  "DEF",
  "DEF",
  "MID",
  "MID",
  "MID",
  "FWD",
  "FWD",
  "FWD",
  "FWD",
  "FWD",
];

function buildRoster(overrides: Partial<RosterEntry>[] = []): RosterEntry[] {
  const roster: RosterEntry[] = GROUPS.map((group, index) => ({
    playerId: `player-${index}`,
    position: FORMATION_1335[index],
    worldCupGroup: group,
    region: REGION_ROTATION[index % REGION_ROTATION.length],
  }));
  for (const [index, override] of overrides.entries()) {
    roster[index] = { ...roster[index], ...override };
  }
  return roster;
}

const CONTEXT = { groups: GROUPS };

describe("validateRoster", () => {
  it("accepts a full 1-3-3-5 roster covering every group and region", () => {
    const result = validateRoster(buildRoster(), CONTEXT);
    expect(result.issues).toEqual([]);
    expect(result.valid).toBe(true);
    expect(result.formationId).toBe("1-3-3-5");
  });

  it("accepts the 1-3-4-4 formation", () => {
    const roster = buildRoster();
    roster[11] = { ...roster[11], position: "MID" };
    const result = validateRoster(roster, CONTEXT);
    expect(result.valid).toBe(true);
    expect(result.formationId).toBe("1-3-4-4");
  });

  it("reports the exact roster-size message", () => {
    const result = validateRoster(buildRoster().slice(0, 10), CONTEXT);
    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "ROSTER_SIZE",
        message: "Select exactly 12 players. You currently have 10.",
      }),
    );
  });

  it("flags a missing group with a specific message", () => {
    const roster = buildRoster([{}, {}, {}, {}, {}, { worldCupGroup: "E" }]);
    const result = validateRoster(roster, CONTEXT);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "GROUP_MISSING", message: "Group F is missing a player." }),
    );
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "GROUP_OVERFLOW",
        message: "Only one player can be selected from Group E.",
      }),
    );
  });

  it("flags a missing region", () => {
    const roster = buildRoster().map((entry) =>
      entry.region === "Africa" ? { ...entry, region: "Europe" as Region } : entry,
    );
    const result = validateRoster(roster, CONTEXT);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "REGION_MISSING",
        message: "Add at least one player from Africa.",
      }),
    );
  });

  it("describes an invalid formation with current counts and valid choices", () => {
    const roster = buildRoster();
    roster[4] = { ...roster[4], position: "DEF" };
    roster[11] = { ...roster[11], position: "MID" };
    const result = validateRoster(roster, CONTEXT);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "INVALID_FORMATION",
        message: "Current formation is 1 GK, 4 DEF, 3 MID, 4 FWD. Choose 1-3-3-5 or 1-3-4-4.",
      }),
    );
  });

  it("rejects duplicate players", () => {
    const roster = buildRoster([{}, { playerId: "player-0" }]);
    const result = validateRoster(roster, CONTEXT);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "DUPLICATE_PLAYER" }));
  });

  it("derives groups from the provided tournament context", () => {
    const smallContext = { groups: ["A", "B", "C"] };
    const roster: RosterEntry[] = [
      { playerId: "p1", position: "GK", worldCupGroup: "A", region: "Europe" },
      { playerId: "p2", position: "DEF", worldCupGroup: "B", region: "Africa" },
      { playerId: "p3", position: "DEF", worldCupGroup: "C", region: "Asia" },
      { playerId: "p4", position: "DEF", worldCupGroup: "Z", region: "South America" },
    ];
    const result = validateRoster(roster, smallContext);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "UNKNOWN_GROUP", subject: "Z" }),
    );
    expect(result.issues.filter((issue) => issue.code === "GROUP_MISSING")).toHaveLength(0);
  });

  it("exposes group, region, and position tallies for UI checklists", () => {
    const result = validateRoster(buildRoster().slice(0, 3), CONTEXT);
    expect(result.groupCounts.get("A")).toBe(1);
    expect(result.groupCounts.get("L")).toBe(0);
    expect(result.positionCounts).toEqual({ GK: 1, DEF: 2, MID: 0, FWD: 0 });
  });
});

describe("formations", () => {
  it("defines exactly the two product formations summing to roster size", () => {
    expect(FORMATIONS.map((formation) => formation.id)).toEqual(["1-3-3-5", "1-3-4-4"]);
    for (const formation of FORMATIONS) {
      const total = Object.values(formation.counts).reduce((sum, count) => sum + count, 0);
      expect(total).toBe(ROSTER_SIZE);
    }
  });
});
