import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, beforeEach, describe, expect, it } from "vite-plus/test";
import type { SelectablePlayer } from "#/domain/types";
import { FORMATIONS } from "#/domain/validation";
import { createMemoryStore } from "#/server/db/memory-store";
import type { DataStore } from "#/server/db/store";
import { resetServerEnvCache } from "#/server/env";
import { runImport } from "./imports";
import { AppError } from "./errors";
import { editTeam, getTeamDetail, hashEditToken, submitTeam, verifyEditToken } from "./teams";

let store: DataStore;

/** Greedy valid roster: one per group, 1-3-3-5, regions covered. */
async function pickValidRoster(dataStore: DataStore): Promise<SelectablePlayer[]> {
  const players = await dataStore.listPlayers();
  const groups = [...new Set(players.map((player) => player.worldCupGroup))].sort();
  const remaining = { ...FORMATIONS[0].counts };
  const missingRegions = new Set(players.map((player) => player.region));
  const roster: SelectablePlayer[] = [];
  for (const group of groups) {
    const candidates = players.filter(
      (player) => player.worldCupGroup === group && remaining[player.position] > 0,
    );
    const pick = candidates.find((player) => missingRegions.has(player.region)) ?? candidates[0];
    expect(pick).toBeDefined();
    roster.push(pick);
    remaining[pick.position] -= 1;
    missingRegions.delete(pick.region);
  }
  return roster;
}

beforeAll(() => {
  process.env.IMPORT_CACHE_DIR = join(tmpdir(), "wc2026-test-cache");
  process.env.TOURNAMENT_LOCK_AT = "2099-01-01T00:00:00Z";
  resetServerEnvCache();
});

beforeEach(async () => {
  store = createMemoryStore();
  await runImport(store, "all", null);
});

describe("submitTeam", () => {
  it("persists a valid roster with a snapshot and a hashed edit token", async () => {
    const roster = await pickValidRoster(store);
    const result = await submitTeam(store, {
      teamName: "Test FC",
      userName: "Tester",
      playerIds: roster.map((player) => player.id),
    });

    expect(result.team.teamName).toBe("Test FC");
    expect(result.team.validationSnapshot).toHaveLength(12);
    expect(result.editToken.length).toBeGreaterThanOrEqual(32);
    expect(result.editPath).toContain(result.team.id);

    // Only the hash is stored server-side.
    const record = await store.findEditToken(result.team.id, hashEditToken(result.editToken));
    expect(record).not.toBeNull();
    expect(record?.tokenHash).not.toBe(result.editToken);
  });

  it("rejects rosters that break the rules with documented issue payloads", async () => {
    const roster = await pickValidRoster(store);
    await expect(
      submitTeam(store, {
        teamName: "Short FC",
        userName: "Tester",
        playerIds: roster.slice(0, 11).map((player) => player.id),
      }),
    ).rejects.toMatchObject({ code: "ROSTER_INVALID" });
  });

  it("rejects unknown players and blank names", async () => {
    const roster = await pickValidRoster(store);
    await expect(
      submitTeam(store, { teamName: "", userName: "Tester", playerIds: roster.map((p) => p.id) }),
    ).rejects.toMatchObject({ code: "INVALID_NAME" });
    await expect(
      submitTeam(store, {
        teamName: "Ghost FC",
        userName: "Tester",
        playerIds: [...roster.slice(0, 11).map((p) => p.id), "nope"],
      }),
    ).rejects.toMatchObject({ code: "UNKNOWN_PLAYER" });
  });
});

describe("edit tokens", () => {
  it("allows edits with the real token and rejects bad tokens", async () => {
    const roster = await pickValidRoster(store);
    const { team, editToken } = await submitTeam(store, {
      teamName: "Editable FC",
      userName: "Tester",
      playerIds: roster.map((player) => player.id),
    });

    await expect(verifyEditToken(store, team.id, "wrong-token")).rejects.toMatchObject({
      code: "INVALID_EDIT_TOKEN",
    });

    const updated = await editTeam(store, team.id, editToken, { teamName: "Renamed FC" });
    expect(updated.teamName).toBe("Renamed FC");
  });

  it("blocks edits when an admin locks the team", async () => {
    const roster = await pickValidRoster(store);
    const { team, editToken } = await submitTeam(store, {
      teamName: "Locked FC",
      userName: "Tester",
      playerIds: roster.map((player) => player.id),
    });
    await store.updateTeam(team.id, { lockedAt: new Date().toISOString() });

    await expect(editTeam(store, team.id, editToken, { teamName: "Nope" })).rejects.toMatchObject({
      code: "TEAM_LOCKED",
    });
  });

  it("revalidates roster changes server-side", async () => {
    const roster = await pickValidRoster(store);
    const { team, editToken } = await submitTeam(store, {
      teamName: "Strict FC",
      userName: "Tester",
      playerIds: roster.map((player) => player.id),
    });

    // Swap one player for a second pick from the same group: breaks group rule.
    const players = await store.listPlayers();
    const duplicateGroupPlayer = players.find(
      (player) =>
        player.worldCupGroup === roster[0].worldCupGroup &&
        !roster.some((entry) => entry.id === player.id) &&
        player.position === roster[1].position,
    );
    expect(duplicateGroupPlayer).toBeDefined();
    const badIds = [
      roster[0].id,
      ...roster.slice(2).map((player) => player.id),
      duplicateGroupPlayer?.id ?? "",
    ];

    const error = await editTeam(store, team.id, editToken, { playerIds: badIds }).catch(
      (caught: unknown) => caught,
    );
    expect(error).toBeInstanceOf(AppError);
  });
});

describe("getTeamDetail", () => {
  it("returns per-player breakdowns that sum to the team total", async () => {
    const roster = await pickValidRoster(store);
    const { team } = await submitTeam(store, {
      teamName: "Sum FC",
      userName: "Tester",
      playerIds: roster.map((player) => player.id),
    });

    const detail = await getTeamDetail(store, team.id);
    expect(detail.players).toHaveLength(12);
    const summed = detail.players.reduce((sum, player) => sum + player.score.totalPoints, 0);
    expect(detail.calculatedPoints).toBeCloseTo(summed, 5);
    expect(detail.totalPoints).toBeCloseTo(detail.calculatedPoints + detail.adjustmentPoints, 5);
  });
});
