import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { LeaderboardPlayer } from "#/domain/types";
import { formatPoints } from "#/lib/format";
import PositionBadge from "#/components/ui/PositionBadge";
import ScoreBreakdown from "#/components/ui/ScoreBreakdown";

const POSITION_ORDER = { GK: 0, DEF: 1, MID: 2, FWD: 3 } as const;

/**
 * Roster listing with per-player expandable score breakdowns — the
 * leaderboard "how was this score built" requirement.
 */
export default function RosterTable({ players }: { players: LeaderboardPlayer[] }) {
  const [openPlayerId, setOpenPlayerId] = useState<string | null>(null);
  const sorted = [...players].sort((a, b) =>
    POSITION_ORDER[a.position] === POSITION_ORDER[b.position]
      ? b.score.totalPoints - a.score.totalPoints
      : POSITION_ORDER[a.position] - POSITION_ORDER[b.position],
  );

  return (
    <ul className="m-0 list-none p-0">
      {sorted.map((player) => {
        const open = openPlayerId === player.playerId;
        return (
          <li key={player.playerId} className="border-b border-[var(--line)] last:border-b-0">
            <button
              type="button"
              onClick={() => setOpenPlayerId(open ? null : player.playerId)}
              aria-expanded={open}
              className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-3 py-2.5 text-left text-[var(--ink)] transition hover:bg-[var(--volt-soft)]"
            >
              <PositionBadge position={player.position} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {player.playerName}
                  {!player.active ? (
                    <span className="ml-2 text-[0.68rem] font-normal text-[var(--danger)]">
                      inactive
                    </span>
                  ) : null}
                </span>
                <span className="kicker block">
                  {player.countryName} · Group {player.worldCupGroup}
                </span>
              </span>
              <span className="points text-base">{formatPoints(player.score.totalPoints)}</span>
              <ChevronDown
                size={15}
                aria-hidden="true"
                className={`text-[var(--ink-faint)] transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
            {open ? (
              <div className="border-t border-dashed border-[var(--line)] bg-[var(--panel-strong)] px-4 py-3">
                <ScoreBreakdown score={player.score} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
