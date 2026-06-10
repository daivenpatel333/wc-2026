/**
 * Shared domain types for the World Cup 2026 fantasy platform.
 *
 * These types are the contract between the database layer, server services,
 * API handlers, and UI. Validation snapshots (group/country/region/position)
 * are captured at submission time so later source-data changes do not
 * retroactively invalidate teams.
 */

/**
 * JSON-safe value types. Server-function payloads and audit metadata must be
 * expressible as JSON (TanStack Start validates serializability of server
 * function results at the type level — `unknown` is rejected).
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue | undefined };

export type JsonObject = { [key: string]: JsonValue | undefined };

export type FantasyPosition = "GK" | "DEF" | "MID" | "FWD";

export type Confederation = "UEFA" | "CONMEBOL" | "CONCACAF" | "AFC" | "CAF" | "OFC";

export type Region =
  | "North/Central America & Caribbean"
  | "South America"
  | "Europe"
  | "Asia"
  | "Africa";

export interface Country {
  id: string;
  name: string;
  fifaCode: string | null;
  /** Imported World Cup group label, e.g. "A". Never hard-code the set of labels. */
  worldCupGroup: string;
  region: Region;
  confederation: Confederation | null;
}

export interface Player {
  id: string;
  sourcePlayerId: string | null;
  name: string;
  countryId: string;
  position: FantasyPosition;
  /** Raw imported position label, e.g. "Goalkeeper" or "DF". */
  sourcePosition: string | null;
  shirtNumber: number | null;
  active: boolean;
}

/** A player joined with the country fields the fantasy rules care about. */
export interface SelectablePlayer {
  id: string;
  name: string;
  position: FantasyPosition;
  countryId: string;
  countryName: string;
  countryFifaCode: string | null;
  worldCupGroup: string;
  region: Region;
  shirtNumber: number | null;
  fantasyPoints: number;
}

/** Submission-time validation snapshot stored per rostered player. */
export interface RosterSnapshotEntry {
  playerId: string;
  playerName: string;
  position: FantasyPosition;
  countryId: string;
  countryName: string;
  worldCupGroup: string;
  region: Region;
}

export interface Formation {
  id: string;
  label: string;
  counts: Record<FantasyPosition, number>;
}

export type PositionCounts = Record<FantasyPosition, number>;

export type ValidationIssueCode =
  | "ROSTER_SIZE"
  | "DUPLICATE_PLAYER"
  | "GROUP_MISSING"
  | "GROUP_OVERFLOW"
  | "REGION_MISSING"
  | "UNMAPPED_REGION"
  | "INVALID_FORMATION"
  | "UNKNOWN_GROUP";

/** Type alias (not interface) so issue lists stay assignable to JsonValue. */
export type ValidationIssue = {
  code: ValidationIssueCode;
  message: string;
  /** Group label or region name the issue refers to, when applicable. */
  subject?: string;
};

export interface RosterValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  positionCounts: PositionCounts;
  /** Matched formation id when the formation rule passes. */
  formationId: string | null;
  /** Group label -> number of selected players from that group. */
  groupCounts: Map<string, number>;
  /** Region -> number of selected players from that region. */
  regionCounts: Map<Region, number>;
}

export interface PlayerStats {
  playerId: string;
  goals: number;
  assists: number;
  shots: number;
  tacklesWon: number;
  interceptions: number;
  yellowCards: number;
  redCards: number;
  penaltyMisses: number;
  minutesPlayed: number;
  saves: number;
  goalsAgainst: number;
  cleanSheets: number;
  penaltySaves: number;
  statsSource: string;
  sourceUpdatedAt: string | null;
}

export interface ScoreBreakdownEntry {
  statistic: string;
  label: string;
  statValue: number;
  pointValue: number;
  points: number;
}

export interface PlayerScore {
  playerId: string;
  entries: ScoreBreakdownEntry[];
  basePoints: number;
  bonusPoints: number;
  adjustmentPoints: number;
  totalPoints: number;
}

export interface ScoreAdjustment {
  id: string;
  targetType: "player" | "team";
  targetId: string;
  points: number;
  reason: string | null;
  adminId: string;
  createdAt: string;
}

export interface Team {
  id: string;
  teamName: string;
  userName: string;
  totalPoints: number;
  manualPointsAdjustment: number;
  lockedAt: string | null;
  validationSnapshot: RosterSnapshotEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardPlayer extends RosterSnapshotEntry {
  score: PlayerScore;
  active: boolean;
  /** Live display extras (not part of the validation snapshot). */
  shirtNumber: number | null;
  countryFifaCode: string | null;
}

export interface LeaderboardTeam {
  rank: number;
  team: Team;
  players: LeaderboardPlayer[];
  calculatedPoints: number;
  adjustmentPoints: number;
  totalPoints: number;
}

export interface ImportRun {
  id: string;
  source: "fifa_groups" | "fifa_squads" | "fbref_stats";
  status: "pending" | "success" | "failed" | "partial";
  startedAt: string;
  finishedAt: string | null;
  recordsSeen: number;
  recordsCreated: number;
  recordsUpdated: number;
  errorMessage: string | null;
  rawCachePath: string | null;
}

export interface ImportError {
  id: string;
  importRunId: string;
  severity: "warning" | "error";
  entityRef: string | null;
  message: string;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminUserId: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: JsonObject | null;
  createdAt: string;
}

export interface TournamentGroup {
  label: string;
  countries: Country[];
}
