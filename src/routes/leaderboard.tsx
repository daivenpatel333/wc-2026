import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Trophy } from "lucide-react";
import { useState } from "react";
import type { LeaderboardTeam } from "#/domain/types";
import { formatDateTime, formatPoints, formatSignedPoints } from "#/lib/format";
import RosterTable from "#/components/team/RosterTable";
import { fetchLeaderboardFn } from "#/server/fns";

const DEFAULT_PAGE_SIZE = 50;

export const Route = createFileRoute("/leaderboard")({
  validateSearch: (search: Record<string, unknown>): { limit?: number } => {
    const limit = Number(search.limit);
    return Number.isFinite(limit) && limit > DEFAULT_PAGE_SIZE ? { limit: Math.floor(limit) } : {};
  },
  loaderDeps: ({ search }) => ({ limit: search.limit ?? DEFAULT_PAGE_SIZE }),
  loader: ({ deps }) => fetchLeaderboardFn({ data: { limit: deps.limit } }),
  component: LeaderboardPage,
});

function rankTone(rank: number): string {
  if (rank === 1) {
    return "bg-[var(--gold-soft)] text-[var(--gold)] border-[var(--gold)]";
  }
  if (rank === 2 || rank === 3) {
    return "border-[var(--line-strong)] text-[var(--ink)]";
  }
  return "border-transparent text-[var(--ink-faint)]";
}

function LeaderboardRow({ entry }: { entry: LeaderboardTeam }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="card-flat overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-4 py-3 text-left text-[var(--ink)] transition hover:bg-[var(--volt-soft)] sm:gap-5"
      >
        <span
          className={`mono flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-sm font-bold ${rankTone(entry.rank)}`}
          aria-label={`Rank ${entry.rank}`}
        >
          {entry.rank === 1 ? <Trophy size={16} aria-hidden="true" /> : entry.rank}
        </span>
        <span className="min-w-0 flex-1">
          <span className="display block truncate text-xl tracking-wide sm:text-2xl">
            {entry.team.teamName}
          </span>
          <span className="kicker block">
            {entry.team.userName} · submitted {formatDateTime(entry.team.createdAt)}
            {entry.team.lockedAt !== null ? " · locked" : ""}
          </span>
        </span>
        {entry.adjustmentPoints !== 0 ? (
          <span
            className="chip hidden sm:inline-flex"
            title={`Includes admin adjustment of ${formatSignedPoints(entry.adjustmentPoints)}`}
          >
            adj {formatSignedPoints(entry.adjustmentPoints)}
          </span>
        ) : null}
        <span className="points text-2xl sm:text-3xl">{formatPoints(entry.totalPoints)}</span>
        <ChevronDown
          size={17}
          aria-hidden="true"
          className={`shrink-0 text-[var(--ink-faint)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="border-t border-dashed border-[var(--line-strong)]">
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <h3 className="kicker m-0">Full roster · tap a player for the breakdown</h3>
            <Link
              to="/teams/$teamId"
              params={{ teamId: entry.team.id }}
              className="nav-link is-active"
            >
              Team page →
            </Link>
          </div>
          <RosterTable players={entry.players} />
        </div>
      ) : null}
    </li>
  );
}

function LeaderboardPage() {
  const page = Route.useLoaderData();

  return (
    <main className="page-wrap px-4 pt-10 pb-8">
      <header className="rise-in mb-7">
        <p className="kicker m-0">Live standings · sorted by total fantasy points</p>
        <h1 className="display m-0 mt-2 text-[clamp(2.6rem,7vw,4.6rem)]">The Table</h1>
        <p className="m-0 mt-2 max-w-xl text-sm text-[var(--ink-soft)]">
          {page.totalTeams === 0
            ? "No teams yet — be the first on the sheet."
            : `${page.totalTeams} team${page.totalTeams === 1 ? "" : "s"} in the running. Ties go to the earlier submission.`}
        </p>
      </header>

      {page.entries.length === 0 ? (
        <div className="card rise-in-1 flex flex-col items-start gap-3 p-8">
          <p className="m-0 text-[var(--ink-soft)]">
            The table is empty. Build your twelve and claim first place by default — a tactic no
            pundit can criticize.
          </p>
          <Link to="/" className="btn btn-volt">
            Open the team builder
          </Link>
        </div>
      ) : (
        <>
          <ol className="rise-in-1 m-0 flex list-none flex-col gap-3 p-0">
            {page.entries.map((entry) => (
              <LeaderboardRow key={entry.team.id} entry={entry} />
            ))}
          </ol>
          {page.entries.length < page.totalTeams ? (
            <div className="mt-4 flex justify-center">
              <Link
                to="/leaderboard"
                search={{ limit: page.entries.length + DEFAULT_PAGE_SIZE }}
                className="btn btn-ghost"
              >
                Show more teams ({page.entries.length} of {page.totalTeams})
              </Link>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
