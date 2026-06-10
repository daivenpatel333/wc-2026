import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Calculator, SlidersHorizontal } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { formatDateTime, formatPoints, formatSignedPoints } from "#/lib/format";
import { adminAdjustScoreFn, adminRecalculateFn, adminScoresFn } from "#/server/fns";

export const Route = createFileRoute("/admin/scores")({
  loader: () => adminScoresFn(),
  component: AdminScoresPage,
});

const PAGE_SIZE = 60;

function AdjustForm({
  targetType,
  targetId,
  targetLabel,
  onDone,
}: {
  targetType: "player" | "team";
  targetId: string;
  targetLabel: string;
  onDone: () => void;
}) {
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-wrap items-end gap-3 border-t border-dashed border-[var(--line)] bg-[var(--panel-strong)] px-4 py-3"
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = Number.parseFloat(points);
        setPending(true);
        setError(null);
        void adminAdjustScoreFn({
          data: { targetType, targetId, points: parsed, reason: reason.trim() || null },
        })
          .then((response) => {
            if (response.ok) {
              onDone();
            } else {
              setError(response.message);
            }
          })
          .finally(() => setPending(false));
      }}
    >
      <p className="kicker m-0 w-full">Additive adjustment for {targetLabel}</p>
      <div className="w-28">
        <label className="field-label" htmlFor={`points-${targetId}`}>
          Points (±)
        </label>
        <input
          id={`points-${targetId}`}
          className="field-input mono"
          type="number"
          step="0.5"
          value={points}
          onChange={(event) => setPoints(event.target.value)}
          required
        />
      </div>
      <div className="min-w-52 flex-1">
        <label className="field-label" htmlFor={`reason-${targetId}`}>
          Reason
        </label>
        <input
          id={`reason-${targetId}`}
          className="field-input"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="e.g. stat correction for matchday 2"
        />
      </div>
      <button type="submit" className="btn btn-volt btn-sm" disabled={pending}>
        {pending ? "Applying…" : "Apply"}
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onDone}>
        Cancel
      </button>
      {error !== null ? (
        <p className="alert m-0 w-full" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function AdminScoresPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [adjustingPlayerId, setAdjustingPlayerId] = useState<string | null>(null);
  const [adjustingTeamId, setAdjustingTeamId] = useState<string | null>(null);
  const [recalcPending, setRecalcPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const filteredPlayers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows =
      q === ""
        ? data.players
        : data.players.filter(
            (row) =>
              row.playerName.toLowerCase().includes(q) || row.countryName.toLowerCase().includes(q),
          );
    return rows.slice(0, PAGE_SIZE);
  }, [data.players, query]);

  function refresh() {
    setAdjustingPlayerId(null);
    setAdjustingTeamId(null);
    void router.invalidate();
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="display m-0 flex-1 text-3xl tracking-wide">Scores</h1>
        <button
          type="button"
          className="btn btn-volt"
          disabled={recalcPending}
          onClick={() => {
            setRecalcPending(true);
            setNotice(null);
            void adminRecalculateFn()
              .then((response) => {
                if (response.ok) {
                  setNotice(
                    `Recalculated ${response.data.playersRecalculated} players and ${response.data.teamsRecalculated} teams.`,
                  );
                  refresh();
                } else {
                  setNotice(response.message);
                }
              })
              .finally(() => setRecalcPending(false));
          }}
        >
          <Calculator size={15} aria-hidden="true" />
          {recalcPending ? "Recalculating…" : "Recalculate all scores"}
        </button>
      </header>

      {notice !== null ? (
        <p className="alert alert-ok m-0" role="status">
          {notice}
        </p>
      ) : null}

      <section aria-labelledby="team-adj-title" className="card overflow-hidden">
        <h2 id="team-adj-title" className="kicker m-0 border-b border-[var(--line)] px-4 py-3">
          Team adjustments
        </h2>
        <ul className="m-0 list-none p-0">
          {data.teams.map((team) => (
            <li key={team.id} className="border-b border-[var(--line)] last:border-b-0">
              <div className="flex items-center gap-3 px-4 py-2.5">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {team.teamName}
                  <span className="ml-2 font-normal text-[var(--ink-faint)]">{team.userName}</span>
                </span>
                {team.manualPointsAdjustment !== 0 ? (
                  <span className="chip" title="Current total adjustment">
                    adj {formatSignedPoints(team.manualPointsAdjustment)}
                  </span>
                ) : null}
                <span className="points">{formatPoints(team.totalPoints)}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setAdjustingTeamId(adjustingTeamId === team.id ? null : team.id)}
                  aria-expanded={adjustingTeamId === team.id}
                >
                  <SlidersHorizontal size={13} aria-hidden="true" />
                  Adjust
                </button>
              </div>
              {adjustingTeamId === team.id ? (
                <AdjustForm
                  targetType="team"
                  targetId={team.id}
                  targetLabel={team.teamName}
                  onDone={refresh}
                />
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="player-scores-title" className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] px-4 py-3">
          <h2 id="player-scores-title" className="kicker m-0 flex-1">
            Player scores · top {PAGE_SIZE} shown
          </h2>
          <input
            type="search"
            className="field-input max-w-60"
            placeholder="Search player or country…"
            aria-label="Search player scores"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="table-shell rounded-none border-0">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Player</th>
                <th scope="col">Pos</th>
                <th scope="col" className="num">
                  Base
                </th>
                <th scope="col" className="num">
                  Bonus
                </th>
                <th scope="col" className="num">
                  Adj
                </th>
                <th scope="col" className="num">
                  Total
                </th>
                <th scope="col" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((row) => (
                <Fragment key={row.playerId}>
                  <tr>
                    <td>
                      <span className="font-semibold">{row.playerName}</span>
                      <span className="ml-2 text-[var(--ink-faint)]">
                        {row.countryName} · {row.worldCupGroup}
                      </span>
                    </td>
                    <td className="mono">{row.position}</td>
                    <td className="num">{formatPoints(row.score.basePoints)}</td>
                    <td className="num">{formatPoints(row.score.bonusPoints)}</td>
                    <td className="num">
                      {row.score.adjustmentPoints === 0
                        ? "—"
                        : formatSignedPoints(row.score.adjustmentPoints)}
                    </td>
                    <td className="num points">{formatPoints(row.score.totalPoints)}</td>
                    <td className="num">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() =>
                          setAdjustingPlayerId(
                            adjustingPlayerId === row.playerId ? null : row.playerId,
                          )
                        }
                        aria-expanded={adjustingPlayerId === row.playerId}
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                  {adjustingPlayerId === row.playerId ? (
                    <tr>
                      <td colSpan={7} className="!p-0">
                        <AdjustForm
                          targetType="player"
                          targetId={row.playerId}
                          targetLabel={row.playerName}
                          onDone={refresh}
                        />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="adj-log-title" className="card overflow-hidden">
        <h2 id="adj-log-title" className="kicker m-0 border-b border-[var(--line)] px-4 py-3">
          Adjustment log
        </h2>
        {data.adjustments.length === 0 ? (
          <p className="m-0 p-5 text-sm text-[var(--ink-faint)]">No adjustments recorded.</p>
        ) : (
          <ul className="m-0 list-none p-0">
            {[...data.adjustments].reverse().map((adjustment) => (
              <li
                key={adjustment.id}
                className="flex items-baseline gap-3 border-b border-[var(--line)] px-4 py-2.5 text-sm last:border-b-0"
              >
                <span className="mono shrink-0 text-[0.7rem] text-[var(--ink-faint)]">
                  {formatDateTime(adjustment.createdAt)}
                </span>
                <span className="mono">{adjustment.targetType}</span>
                <span className="points">{formatSignedPoints(adjustment.points)}</span>
                <span className="truncate text-[var(--ink-soft)]">
                  {adjustment.reason ?? "no reason given"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
