import type { FantasyPosition } from "./types";

export const FANTASY_POSITIONS: readonly FantasyPosition[] = ["GK", "DEF", "MID", "FWD"];

export const POSITION_LABELS: Record<FantasyPosition, string> = {
  GK: "Goalkeeper",
  DEF: "Defender",
  MID: "Midfielder",
  FWD: "Forward",
};

const POSITION_ALIASES: Record<string, FantasyPosition> = {
  gk: "GK",
  goalkeeper: "GK",
  goalie: "GK",
  keeper: "GK",
  portero: "GK",
  def: "DEF",
  df: "DEF",
  d: "DEF",
  defender: "DEF",
  defence: "DEF",
  defense: "DEF",
  back: "DEF",
  fullback: "DEF",
  "full-back": "DEF",
  wingback: "DEF",
  "wing-back": "DEF",
  centreback: "DEF",
  "centre-back": "DEF",
  "center-back": "DEF",
  cb: "DEF",
  lb: "DEF",
  rb: "DEF",
  mid: "MID",
  mf: "MID",
  m: "MID",
  midfielder: "MID",
  midfield: "MID",
  cm: "MID",
  dm: "MID",
  cdm: "MID",
  cam: "MID",
  am: "MID",
  "defensive midfielder": "MID",
  "attacking midfielder": "MID",
  fwd: "FWD",
  fw: "FWD",
  f: "FWD",
  forward: "FWD",
  striker: "FWD",
  st: "FWD",
  cf: "FWD",
  winger: "FWD",
  lw: "FWD",
  rw: "FWD",
  attacker: "FWD",
};

/**
 * Normalize a raw imported position label into one of the four fantasy
 * positions. Returns null when the label cannot be mapped; importers must
 * flag those records instead of guessing.
 */
export function normalizePosition(raw: string): FantasyPosition | null {
  const cleaned = raw.trim().toLowerCase();
  if (cleaned.length === 0) {
    return null;
  }
  return POSITION_ALIASES[cleaned] ?? null;
}

export function isFantasyPosition(value: string): value is FantasyPosition {
  return (FANTASY_POSITIONS as readonly string[]).includes(value);
}
