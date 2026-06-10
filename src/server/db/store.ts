import type {
  AdminAuditLog,
  Country,
  FantasyPosition,
  ImportError,
  ImportRun,
  Player,
  PlayerStats,
  Region,
  RosterSnapshotEntry,
  ScoreAdjustment,
  SelectablePlayer,
  Team,
} from "#/domain/types";

/**
 * Repository contract shared by the in-memory development store and the
 * PostgreSQL store. Services and importers only ever talk to this interface,
 * so swapping persistence never touches business rules.
 */

export interface CountryUpsert {
  name: string;
  fifaCode: string | null;
  worldCupGroup: string;
  region: Region;
  confederation: Country["confederation"];
}

export interface PlayerUpsert {
  name: string;
  countryId: string;
  position: FantasyPosition;
  sourcePosition: string | null;
  sourcePlayerId: string | null;
  shirtNumber: number | null;
  active: boolean;
}

export interface PlayerFilters {
  q?: string;
  countryId?: string;
  group?: string;
  region?: Region;
  position?: FantasyPosition;
  includeInactive?: boolean;
}

export interface StatsUpsert extends PlayerStats {
  fantasyPoints: number;
  calculatedAt: string;
}

export interface StoredPlayerStats extends StatsUpsert {
  id: string;
}

export interface TeamCreate {
  teamName: string;
  userName: string;
  playerIds: string[];
  validationSnapshot: RosterSnapshotEntry[];
  totalPoints: number;
}

export interface TeamUpdate {
  teamName?: string;
  userName?: string;
  playerIds?: string[];
  validationSnapshot?: RosterSnapshotEntry[];
  totalPoints?: number;
  manualPointsAdjustment?: number;
  lockedAt?: string | null;
}

export interface EditTokenRecord {
  id: string;
  teamId: string;
  tokenHash: string;
  expiresAt: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface ImportRunFinish {
  status: ImportRun["status"];
  recordsSeen: number;
  recordsCreated: number;
  recordsUpdated: number;
  errorMessage: string | null;
  rawCachePath: string | null;
}

export interface UpsertResult<T> {
  record: T;
  created: boolean;
}

export interface DataStore {
  // Countries
  upsertCountry(input: CountryUpsert): Promise<UpsertResult<Country>>;
  listCountries(): Promise<Country[]>;
  getCountry(id: string): Promise<Country | null>;
  getCountryByName(name: string): Promise<Country | null>;

  // Players
  upsertPlayer(input: PlayerUpsert): Promise<UpsertResult<Player>>;
  listPlayers(filters?: PlayerFilters): Promise<SelectablePlayer[]>;
  getPlayer(id: string): Promise<Player | null>;
  getPlayersByIds(ids: readonly string[]): Promise<Player[]>;
  setPlayerActive(id: string, active: boolean): Promise<void>;

  // Stats
  upsertStats(input: StatsUpsert): Promise<UpsertResult<StoredPlayerStats>>;
  getStatsForPlayer(playerId: string): Promise<StoredPlayerStats | null>;
  listStats(): Promise<StoredPlayerStats[]>;
  setCachedFantasyPoints(
    playerId: string,
    fantasyPoints: number,
    calculatedAt: string,
  ): Promise<void>;

  // Teams
  createTeam(input: TeamCreate): Promise<Team>;
  getTeam(id: string): Promise<Team | null>;
  listTeams(): Promise<Team[]>;
  updateTeam(id: string, update: TeamUpdate): Promise<Team | null>;
  deleteTeam(id: string): Promise<boolean>;
  getTeamPlayerIds(teamId: string): Promise<string[]>;

  // Edit tokens
  createEditToken(teamId: string, tokenHash: string, expiresAt: string): Promise<EditTokenRecord>;
  findEditToken(teamId: string, tokenHash: string): Promise<EditTokenRecord | null>;
  touchEditToken(id: string, lastUsedAt: string): Promise<void>;

  // Score adjustments
  addAdjustment(input: Omit<ScoreAdjustment, "id" | "createdAt">): Promise<ScoreAdjustment>;
  listAdjustments(targetType: "player" | "team", targetId: string): Promise<ScoreAdjustment[]>;
  listAllAdjustments(): Promise<ScoreAdjustment[]>;

  // Import runs
  createImportRun(source: ImportRun["source"]): Promise<ImportRun>;
  finishImportRun(id: string, finish: ImportRunFinish): Promise<void>;
  addImportError(input: Omit<ImportError, "id" | "createdAt">): Promise<ImportError>;
  listImportRuns(): Promise<ImportRun[]>;
  getImportRun(id: string): Promise<{ run: ImportRun; errors: ImportError[] } | null>;

  // Admin audit log
  addAuditLog(input: Omit<AdminAuditLog, "id" | "createdAt">): Promise<AdminAuditLog>;
  listAuditLogs(limit?: number): Promise<AdminAuditLog[]>;
}
