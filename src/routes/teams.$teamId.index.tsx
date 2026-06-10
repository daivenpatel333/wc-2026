import { Link, createFileRoute } from "@tanstack/react-router";
import { Lock, Pencil } from "lucide-react";
import { FORMATIONS } from "#/domain/validation";
import type { LeaderboardPlayer } from "#/domain/types";
import { formatDateTime, formatPoints, formatSignedPoints } from "#/lib/format";
import FormationPitch from "#/components/team/FormationPitch";
import RosterTable from "#/components/team/RosterTable";
import { fetchTeamPageFn } from "#/server/fns";

export const Route = createFileRoute("/teams/$teamId/")({
  loader: ({ params }) => fetchTeamPageFn({ data: { teamId: params.teamId } }),
  component: TeamDetailPage,
});

function inferFormation(players: LeaderboardPlayer[]) {
  return (
    FORMATIONS.find((formation) =>
      (Object.entries(formation.counts) as Array<[LeaderboardPlayer["position"], number]>).every(
        ([position, count]) =>
          players.filter((player) => player.position === position).length === count,
      ),
    ) ?? FORMATIONS[0]
  );
}

function TeamDetailPage() {
  const result = Route.useLoaderData();

  if (!result.ok) {
    return (
      <main className="page-wrap px-4 pt-14 pb-8">
        <div className="card rise-in flex flex-col items-start gap-3 p-8">
          <h1 className="display m-0 text-3xl">Team not found</h1>
          <p className="m-0 text-sm text-[var(--ink-soft)]">
            This team may have been removed, or the link is wrong.
          </p>
          <Link to="/leaderboard" className="btn btn-ghost">
            Back to the leaderboard
          </Link>
        </div>
      </main>
    );
  }

  const { detail, rank, totalTeams } = result.data;
  const formation = inferFormation(detail.players);

  return (
    <main className="page-wrap px-4 pt-10 pb-8">
      <header className="rise-in mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip chip-volt">
            Rank #{rank} of {totalTeams}
          </span>
          <span className="chip">Formation {formation.label}</span>
          {detail.locked ? (
            <span className="chip">
              <Lock size={12} aria-hidden="true" />
              {detail.team.lockedAt !== null ? "Locked by admin" : "Tournament locked"}
            </span>
          ) : null}
        </div>
        <h1 className="display m-0 mt-3 text-[clamp(2.6rem,7vw,4.6rem)]">{detail.team.teamName}</h1>
        <p className="kicker m-0 mt-1.5">
          Managed by {detail.team.userName} · submitted {formatDateTime(detail.team.createdAt)}
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
        <div className="rise-in-1 flex flex-col gap-4">
          <FormationPitch players={detail.players} formation={formation} />
          <div className="card flex flex-col gap-2 p-4">
            <div className="flex items-baseline justify-between">
              <span className="kicker">Calculated points</span>
              <span className="points text-lg">{formatPoints(detail.calculatedPoints)}</span>
            </div>
            {detail.adjustmentPoints !== 0 ? (
              <div className="flex items-baseline justify-between text-[var(--gold)]">
                <span className="kicker !text-[var(--gold)]">Admin adjustments</span>
                <span className="points text-lg">
                  {formatSignedPoints(detail.adjustmentPoints)}
                </span>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between border-t border-dashed border-[var(--line-strong)] pt-2">
              <span className="font-bold">Total</span>
              <span className="points text-3xl">{formatPoints(detail.totalPoints)}</span>
            </div>
          </div>
          {!detail.locked ? (
            <p className="card-flat m-0 flex items-center gap-2 p-3 text-[0.78rem] text-[var(--ink-soft)]">
              <Pencil size={13} aria-hidden="true" className="shrink-0" />
              Roster changes are made through the private edit link from your submission, until
              kickoff.
            </p>
          ) : null}
        </div>

        <section
          aria-label="Roster and score breakdowns"
          className="card rise-in-2 overflow-hidden"
        >
          <h2 className="kicker m-0 border-b border-[var(--line)] px-4 py-3">
            Roster · tap a player for the full breakdown
          </h2>
          <RosterTable players={detail.players} />
        </section>
      </div>
    </main>
  );
}
