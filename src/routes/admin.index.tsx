import { Link, createFileRoute } from "@tanstack/react-router";
import { formatDateTime } from "#/lib/format";
import { adminOverviewFn } from "#/server/fns";

export const Route = createFileRoute("/admin/")({
  loader: () => adminOverviewFn(),
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const overview = Route.useLoaderData();

  const stats = [
    { label: "Submitted teams", value: overview.teams, to: "/admin/teams" as const },
    { label: "Players in pool", value: overview.players, to: "/admin/scores" as const },
    { label: "Countries", value: overview.countries, to: "/admin/imports" as const },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Key numbers" className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            className="card rise-in p-5 transition hover:-translate-y-0.5"
          >
            <p className="kicker m-0">{stat.label}</p>
            <p className="points m-0 mt-1 text-4xl">{stat.value}</p>
          </Link>
        ))}
      </section>

      <section className="grid items-start gap-4 lg:grid-cols-2">
        <div className="card rise-in-1 p-5">
          <h2 className="kicker m-0">Tournament status</h2>
          <p className="display m-0 mt-2 text-3xl tracking-wide">
            {overview.locked ? "Locked — matches underway" : "Open for submissions"}
          </p>
          <p className="m-0 mt-1 text-sm text-[var(--ink-soft)]">
            Lock time: <span className="mono">{formatDateTime(overview.lockAt)}</span>
          </p>
          <p className="m-0 mt-3 text-sm text-[var(--ink-soft)]">
            Last import:{" "}
            {overview.lastImport === null ? (
              "never"
            ) : (
              <>
                <span className="mono">{overview.lastImport.source}</span> ·{" "}
                {overview.lastImport.status} · {formatDateTime(overview.lastImport.startedAt)}
              </>
            )}
          </p>
        </div>

        <div className="card rise-in-2 overflow-hidden">
          <h2 className="kicker m-0 border-b border-[var(--line)] px-5 py-3">
            Recent admin activity
          </h2>
          {overview.auditLogs.length === 0 ? (
            <p className="m-0 p-5 text-sm text-[var(--ink-faint)]">No audited actions yet.</p>
          ) : (
            <ul className="m-0 list-none p-0">
              {overview.auditLogs.map((log) => (
                <li
                  key={log.id}
                  className="flex items-baseline gap-3 border-b border-[var(--line)] px-5 py-2.5 text-sm last:border-b-0"
                >
                  <span className="mono shrink-0 text-[0.7rem] text-[var(--ink-faint)]">
                    {formatDateTime(log.createdAt)}
                  </span>
                  <span className="font-semibold">{log.action}</span>
                  {log.targetId !== null ? (
                    <span className="truncate text-[var(--ink-faint)]">{log.targetId}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
