import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronDown, DatabaseZap, Play } from "lucide-react";
import { useState } from "react";
import type { ImportError, ImportRun } from "#/domain/types";
import { formatDateTime } from "#/lib/format";
import type { ImportSource } from "#/server/services/imports";
import { adminImportDetailFn, adminImportsFn, adminRunImportFn } from "#/server/fns";

export const Route = createFileRoute("/admin/imports")({
  loader: () => adminImportsFn(),
  component: AdminImportsPage,
});

const IMPORT_ACTIONS: Array<{ source: ImportSource; label: string; detail: string }> = [
  {
    source: "fifa_groups",
    label: "FIFA groups & countries",
    detail: "Tournament structure and region mapping",
  },
  {
    source: "fifa_squads",
    label: "FIFA squads",
    detail: "Players, shirt numbers, normalized positions",
  },
  {
    source: "fbref_stats",
    label: "FBref statistics",
    detail: "Match stats + full score recalculation",
  },
  { source: "all", label: "Run everything", detail: "All three, in dependency order" },
];

function statusTone(status: ImportRun["status"]): string {
  switch (status) {
    case "success":
      return "chip-volt";
    case "failed":
      return "!border-[var(--danger)] !text-[var(--danger)]";
    case "partial":
      return "!border-[var(--gold)] !text-[var(--gold)]";
    default:
      return "";
  }
}

function RunRow({ run }: { run: ImportRun }) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<ImportError[] | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && errors === null) {
      setDetailError(null);
      void adminImportDetailFn({ data: { importRunId: run.id } })
        .then((response) => {
          if (response.ok) {
            setErrors(response.data.errors);
          } else {
            setDetailError(response.message);
          }
        })
        .catch(() => setDetailError("Could not load the record-level log."));
    }
  }

  return (
    <li className="border-b border-[var(--line)] last:border-b-0">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer flex-wrap items-center gap-3 border-0 bg-transparent px-4 py-3 text-left text-[var(--ink)] transition hover:bg-[var(--volt-soft)]"
      >
        <span className="mono min-w-28 text-sm font-bold">{run.source}</span>
        <span className={`chip ${statusTone(run.status)}`}>{run.status}</span>
        <span className="mono text-[0.74rem] text-[var(--ink-faint)]">
          {formatDateTime(run.startedAt)}
        </span>
        <span className="mono ml-auto text-[0.74rem] text-[var(--ink-soft)]">
          seen {run.recordsSeen} · new {run.recordsCreated} · upd {run.recordsUpdated}
        </span>
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`text-[var(--ink-faint)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="border-t border-dashed border-[var(--line)] bg-[var(--panel-strong)] px-4 py-3 text-sm">
          {run.errorMessage !== null ? (
            <p className="m-0 mb-2 font-semibold text-[var(--danger)]">{run.errorMessage}</p>
          ) : null}
          {run.rawCachePath !== null ? (
            <p className="m-0 mb-2 text-[0.74rem] text-[var(--ink-faint)]">
              Raw artifact: <span className="mono">{run.rawCachePath}</span>
            </p>
          ) : null}
          {detailError !== null ? (
            <p className="m-0 font-semibold text-[var(--danger)]">{detailError}</p>
          ) : errors === null ? (
            <p className="m-0 text-[var(--ink-faint)]">Loading record-level log…</p>
          ) : errors.length === 0 ? (
            <p className="m-0 text-[var(--ink-faint)]">No record-level warnings or errors.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {errors.map((error) => (
                <li key={error.id} className="flex gap-2">
                  <span
                    className={`mono shrink-0 text-[0.68rem] font-bold uppercase ${
                      error.severity === "error" ? "text-[var(--danger)]" : "text-[var(--gold)]"
                    }`}
                  >
                    {error.severity}
                  </span>
                  {error.entityRef !== null ? (
                    <span className="mono shrink-0 text-[0.74rem] text-[var(--ink-faint)]">
                      {error.entityRef}
                    </span>
                  ) : null}
                  <span className="text-[var(--ink-soft)]">{error.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </li>
  );
}

function AdminImportsPage() {
  const runs = Route.useLoaderData();
  const router = useRouter();
  const [runningSource, setRunningSource] = useState<ImportSource | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function trigger(source: ImportSource) {
    setRunningSource(source);
    setNotice(null);
    void adminRunImportFn({ data: { source } })
      .then((response) => {
        if (response.ok) {
          const summary = response.data.runs
            .map((run) => `${run.source}: ${run.status}`)
            .join(" · ");
          setNotice(`Import finished — ${summary}`);
          void router.invalidate();
        } else {
          setNotice(response.message);
        }
      })
      .finally(() => setRunningSource(null));
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="display m-0 text-3xl tracking-wide">Imports</h1>
        <p className="m-0 mt-1 max-w-2xl text-sm text-[var(--ink-soft)]">
          Each run caches its raw source artifact, logs per-record warnings and errors, and is safe
          to repeat — imports are idempotent upserts.
        </p>
      </header>

      {notice !== null ? (
        <p className="alert alert-ok m-0" role="status">
          {notice}
        </p>
      ) : null}

      <section aria-label="Run imports" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {IMPORT_ACTIONS.map((action) => (
          <div key={action.source} className="card flex flex-col gap-2 p-4">
            <DatabaseZap size={17} aria-hidden="true" className="text-[var(--pitch)]" />
            <h2 className="m-0 text-sm font-bold">{action.label}</h2>
            <p className="m-0 flex-1 text-[0.76rem] text-[var(--ink-soft)]">{action.detail}</p>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={runningSource !== null}
              onClick={() => trigger(action.source)}
            >
              <Play size={12} aria-hidden="true" />
              {runningSource === action.source ? "Running…" : "Run"}
            </button>
          </div>
        ))}
      </section>

      <section aria-labelledby="runs-title" className="card overflow-hidden">
        <h2 id="runs-title" className="kicker m-0 border-b border-[var(--line)] px-4 py-3">
          Import history
        </h2>
        {runs.length === 0 ? (
          <p className="m-0 p-5 text-sm text-[var(--ink-faint)]">No import runs recorded.</p>
        ) : (
          <ul className="m-0 list-none p-0">
            {runs.map((run) => (
              <RunRow key={run.id} run={run} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
