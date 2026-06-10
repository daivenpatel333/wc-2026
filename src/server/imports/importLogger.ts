import type { ImportRun } from "#/domain/types";
import type { DataStore } from "#/server/db/store";

export interface ImportContext {
  runId: string;
  counts: { seen: number; created: number; updated: number };
  warn(entityRef: string | null, message: string): Promise<void>;
  error(entityRef: string | null, message: string): Promise<void>;
  setRawCachePath(path: string | null): void;
}

export interface ImportOutcome {
  run: ImportRun;
}

/**
 * Wrap one import job with run logging: creates the pending run row, tracks
 * counts and per-record errors, and finalizes the status — `success` when
 * clean, `partial` when record-level warnings/errors occurred, `failed` when
 * the job itself threw.
 */
export async function withImportRun(
  store: DataStore,
  source: ImportRun["source"],
  job: (context: ImportContext) => Promise<void>,
): Promise<ImportOutcome> {
  const run = await store.createImportRun(source);
  let warningCount = 0;
  let errorCount = 0;
  let rawCachePath: string | null = null;

  const context: ImportContext = {
    runId: run.id,
    counts: { seen: 0, created: 0, updated: 0 },
    async warn(entityRef, message) {
      warningCount += 1;
      await store.addImportError({ importRunId: run.id, severity: "warning", entityRef, message });
    },
    async error(entityRef, message) {
      errorCount += 1;
      await store.addImportError({ importRunId: run.id, severity: "error", entityRef, message });
    },
    setRawCachePath(path) {
      rawCachePath = path;
    },
  };

  try {
    await job(context);
    const issueCount = warningCount + errorCount;
    await store.finishImportRun(run.id, {
      status: issueCount > 0 ? "partial" : "success",
      recordsSeen: context.counts.seen,
      recordsCreated: context.counts.created,
      recordsUpdated: context.counts.updated,
      errorMessage:
        issueCount > 0
          ? `${warningCount} warning(s), ${errorCount} error(s); see import errors.`
          : null,
      rawCachePath,
    });
  } catch (error) {
    await store.finishImportRun(run.id, {
      status: "failed",
      recordsSeen: context.counts.seen,
      recordsCreated: context.counts.created,
      recordsUpdated: context.counts.updated,
      errorMessage: error instanceof Error ? error.message : String(error),
      rawCachePath,
    });
  }

  const finished = await store.getImportRun(run.id);
  return { run: finished?.run ?? run };
}
