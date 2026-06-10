import type { ImportError, ImportRun } from "#/domain/types";
import type { DataStore } from "#/server/db/store";
import { importFbrefStats } from "#/server/imports/fbrefStats";
import { importFifaGroups } from "#/server/imports/fifaGroups";
import { importFifaSquads } from "#/server/imports/fifaSquads";
import { AppError } from "./errors";
import { recalculateAllScores } from "./scores";

export type ImportSource = ImportRun["source"] | "all";

const IMPORT_ORDER: ImportRun["source"][] = ["fifa_groups", "fifa_squads", "fbref_stats"];

const IMPORTERS: Record<ImportRun["source"], (store: DataStore) => Promise<{ run: ImportRun }>> = {
  fifa_groups: importFifaGroups,
  fifa_squads: importFifaSquads,
  fbref_stats: importFbrefStats,
};

export function isImportSource(value: string): value is ImportSource {
  return value === "all" || (IMPORT_ORDER as string[]).includes(value);
}

/**
 * Run one import job (or all three in dependency order). Stats imports are
 * followed by a full score recalculation so leaderboard totals stay in sync.
 * Triggered runs are audited when an admin id is provided; the seed pipeline
 * passes none.
 */
export async function runImport(
  store: DataStore,
  requestedSource: string,
  adminId: string | null,
): Promise<ImportRun[]> {
  if (!isImportSource(requestedSource)) {
    throw new AppError("UNKNOWN_IMPORT_SOURCE", `Unknown import source "${requestedSource}".`);
  }
  const source: ImportSource = requestedSource;

  if (adminId !== null) {
    await store.addAuditLog({
      adminUserId: adminId,
      action: "import.trigger",
      targetType: "import",
      targetId: source,
      metadata: null,
    });
  }

  const sources = source === "all" ? IMPORT_ORDER : [source];
  const runs: ImportRun[] = [];
  for (const current of sources) {
    const outcome = await IMPORTERS[current](store);
    runs.push(outcome.run);
  }

  // Stats obviously require recalculation, but so do squad re-imports: a
  // corrected position changes GK/DEF bonus eligibility for cached scores.
  if (sources.includes("fbref_stats") || sources.includes("fifa_squads")) {
    await recalculateAllScores(store);
  }
  return runs;
}

export async function listImportRuns(store: DataStore): Promise<ImportRun[]> {
  return store.listImportRuns();
}

export async function getImportRunDetail(
  store: DataStore,
  importRunId: string,
): Promise<{ run: ImportRun; errors: ImportError[] }> {
  const detail = await store.getImportRun(importRunId);
  if (detail === null) {
    throw new AppError("IMPORT_RUN_NOT_FOUND", "Import run not found.", { status: 404 });
  }
  return detail;
}
