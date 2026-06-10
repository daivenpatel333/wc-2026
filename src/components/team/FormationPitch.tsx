import type { FantasyPosition, Formation } from "#/domain/types";
import { shortPlayerName } from "#/lib/format";

export interface PitchPlayer {
  playerId: string;
  playerName: string;
  position: FantasyPosition;
  countryName: string;
  countryFifaCode?: string | null;
  shirtNumber?: number | null;
}

interface FormationPitchProps {
  players: PitchPlayer[];
  formation: Formation;
  onRemove?: (playerId: string) => void;
  caption?: string;
}

const ROW_Y: Record<FantasyPosition, number> = { FWD: 96, MID: 218, DEF: 338, GK: 452 };
const ROW_ORDER: FantasyPosition[] = ["FWD", "MID", "DEF", "GK"];
const CHALK = "rgba(244, 250, 238, 0.55)";
const TOKEN_FILL = "rgba(247, 251, 242, 0.97)";

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/**
 * The matchday signature: a chalk-lined pitch rendering the roster as a
 * formation, attacking upward. Empty slots show as dashed chalk circles so
 * builders can see exactly what is missing.
 */
export default function FormationPitch({
  players,
  formation,
  onRemove,
  caption,
}: FormationPitchProps) {
  const byPosition = new Map<FantasyPosition, PitchPlayer[]>();
  for (const position of ROW_ORDER) {
    byPosition.set(
      position,
      players.filter((player) => player.position === position),
    );
  }

  return (
    <figure className="m-0">
      <div className="pitch-surface">
        {/* role="img" would flatten the interactive remove buttons away from
            assistive tech, so it only applies to the read-only pitch. */}
        <svg
          viewBox="0 0 420 520"
          role={onRemove === undefined ? "img" : undefined}
          aria-label={`Formation ${formation.label} with ${players.length} of 12 players placed`}
          className="block w-full"
        >
          {/* chalk markings */}
          <g fill="none" stroke={CHALK} strokeWidth="2">
            <rect x="14" y="14" width="392" height="492" rx="2" />
            <line x1="14" y1="260" x2="406" y2="260" />
            <circle cx="210" cy="260" r="52" />
            <circle cx="210" cy="260" r="2.5" fill={CHALK} />
            {/* top (opponent) box */}
            <rect x="100" y="14" width="220" height="64" />
            <rect x="155" y="14" width="110" height="26" />
            <path d="M 162 78 A 52 52 0 0 0 258 78" />
            {/* bottom (our) box */}
            <rect x="100" y="442" width="220" height="64" />
            <rect x="155" y="480" width="110" height="26" />
            <path d="M 162 442 A 52 52 0 0 1 258 442" />
          </g>

          {ROW_ORDER.map((position) => {
            const rowPlayers = byPosition.get(position) ?? [];
            const slotCount = Math.max(formation.counts[position], rowPlayers.length);
            const spacing = Math.min(96, 380 / slotCount);
            const y = ROW_Y[position];

            return Array.from({ length: slotCount }, (_, index) => {
              const x = 210 + (index - (slotCount - 1) / 2) * spacing;
              const player = rowPlayers[index];

              if (player === undefined) {
                return (
                  <g key={`${position}-empty-${index}`} opacity="0.75">
                    <circle
                      cx={x}
                      cy={y}
                      r="24"
                      fill="rgba(0,0,0,0.12)"
                      stroke={CHALK}
                      strokeWidth="1.6"
                      strokeDasharray="5 5"
                    />
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="700"
                      fill={CHALK}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {position}
                    </text>
                  </g>
                );
              }

              const removable = onRemove !== undefined;
              return (
                <g
                  key={player.playerId}
                  className={removable ? "pitch-token" : undefined}
                  role={removable ? "button" : undefined}
                  tabIndex={removable ? 0 : undefined}
                  aria-label={
                    removable
                      ? `Remove ${player.playerName} (${player.countryName})`
                      : `${player.playerName} (${player.countryName})`
                  }
                  onClick={removable ? () => onRemove(player.playerId) : undefined}
                  onKeyDown={
                    removable
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onRemove(player.playerId);
                          }
                        }
                      : undefined
                  }
                >
                  <title>{removable ? `Remove ${player.playerName}` : player.playerName}</title>
                  <circle
                    cx={x}
                    cy={y}
                    r="24"
                    fill={TOKEN_FILL}
                    stroke="var(--volt)"
                    strokeWidth="2.5"
                  />
                  <text
                    x={x}
                    y={y + 6}
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="800"
                    fill="#15240f"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {player.shirtNumber ?? player.position}
                  </text>
                  {removable ? (
                    <g aria-hidden="true">
                      <circle cx={x + 19} cy={y - 19} r="7.5" fill="rgba(20, 30, 22, 0.85)" />
                      <path
                        d={`M ${x + 16.4} ${y - 21.6} l 5.2 5.2 M ${x + 21.6} ${y - 21.6} l -5.2 5.2`}
                        stroke="rgba(247,251,242,0.95)"
                        strokeWidth="1.6"
                      />
                    </g>
                  ) : null}
                  <text
                    x={x}
                    y={y + 40}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight="700"
                    fill="rgba(247,251,242,0.95)"
                  >
                    {truncate(shortPlayerName(player.playerName), 16)}
                  </text>
                  <text
                    x={x}
                    y={y + 52}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="600"
                    letterSpacing="1.5"
                    fill="rgba(247,251,242,0.88)"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {player.countryFifaCode ?? truncate(player.countryName, 3).toUpperCase()}
                  </text>
                </g>
              );
            });
          })}
        </svg>
      </div>
      {caption !== undefined ? (
        <figcaption className="kicker mt-2 text-center">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
