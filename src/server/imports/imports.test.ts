import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, beforeEach, describe, expect, it } from "vite-plus/test";
import { REGIONS } from "#/domain/regions";
import { createMemoryStore } from "#/server/db/memory-store";
import type { DataStore } from "#/server/db/store";
import { resetServerEnvCache } from "#/server/env";
import { recalculateAllScores } from "#/server/services/scores";
import { importFbrefStats } from "./fbrefStats";
import { importFifaGroups } from "./fifaGroups";
import { importFifaSquads } from "./fifaSquads";
import { withImportRun } from "./importLogger";

let store: DataStore;

beforeAll(() => {
  process.env.IMPORT_CACHE_DIR = join(tmpdir(), "wc2026-test-cache");
  resetServerEnvCache();
});

beforeEach(() => {
  store = createMemoryStore();
});

describe("importFifaGroups", () => {
  it("imports 12 groups of 4 countries with regions mapped", async () => {
    const { run } = await importFifaGroups(store);
    expect(run.status).toBe("success");
    expect(run.recordsCreated).toBe(48);

    const countries = await store.listCountries();
    expect(countries).toHaveLength(48);
    const groups = new Set(countries.map((country) => country.worldCupGroup));
    expect(groups.size).toBe(12);
    for (const country of countries) {
      expect(REGIONS).toContain(country.region);
    }
  });

  it("is idempotent: re-running updates instead of duplicating", async () => {
    await importFifaGroups(store);
    const { run } = await importFifaGroups(store);
    expect(run.recordsCreated).toBe(0);
    expect(run.recordsUpdated).toBe(48);
    expect(await store.listCountries()).toHaveLength(48);
  });
});

describe("importFifaSquads", () => {
  it("fails records cleanly when countries are missing", async () => {
    const { run } = await importFifaSquads(store);
    expect(run.status).toBe("partial");
    expect(run.recordsCreated).toBe(0);
    const detail = await store.getImportRun(run.id);
    expect(detail?.errors.length).toBeGreaterThan(0);
  });

  it("imports players with normalized positions after groups exist", async () => {
    await importFifaGroups(store);
    const { run } = await importFifaSquads(store);
    expect(run.status).toBe("success");
    expect(run.recordsCreated).toBe(480);

    const players = await store.listPlayers();
    for (const player of players) {
      expect(["GK", "DEF", "MID", "FWD"]).toContain(player.position);
    }
  });
});

describe("importFbrefStats", () => {
  it("matches stats to players and supports score recalculation", async () => {
    await importFifaGroups(store);
    await importFifaSquads(store);
    const { run } = await importFbrefStats(store);
    expect(run.status).toBe("success");
    expect(run.recordsCreated).toBeGreaterThan(0);

    const { playersRecalculated } = await recalculateAllScores(store);
    expect(playersRecalculated).toBe(run.recordsCreated);

    const players = await store.listPlayers();
    const scored = players.filter((player) => player.fantasyPoints !== 0);
    expect(scored.length).toBeGreaterThan(players.length / 2);
  });
});

describe("withImportRun", () => {
  it("marks warning-only jobs as partial so data quality issues are visible", async () => {
    const { run } = await withImportRun(store, "fbref_stats", async (context) => {
      context.counts.seen = 1;
      await context.warn("row-1", "Stats row could not be matched to an imported player.");
    });

    expect(run.status).toBe("partial");
    expect(run.errorMessage).toContain("1 warning");

    const detail = await store.getImportRun(run.id);
    expect(detail?.errors).toMatchObject([
      {
        severity: "warning",
        entityRef: "row-1",
        message: "Stats row could not be matched to an imported player.",
      },
    ]);
  });
});
