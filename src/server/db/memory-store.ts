import { randomUUID } from "node:crypto";
import type {
  AdminAuditLog,
  Country,
  ImportError,
  ImportRun,
  Player,
  ScoreAdjustment,
  SelectablePlayer,
  Team,
} from "#/domain/types";
import type {
  CountryUpsert,
  DataStore,
  EditTokenRecord,
  ImportRunFinish,
  PlayerFilters,
  PlayerUpsert,
  StatsUpsert,
  StoredPlayerStats,
  TeamCreate,
  TeamUpdate,
  UpsertResult,
} from "./store";

interface UserRow {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

interface TeamRow {
  id: string;
  teamName: string;
  userId: string;
  totalPoints: number;
  manualPointsAdjustment: number;
  lockedAt: string | null;
  validationSnapshot: Team["validationSnapshot"];
  createdAt: string;
  updatedAt: string;
}

interface TeamPlayerRow {
  teamId: string;
  playerId: string;
  createdAt: string;
}

function now(): string {
  return new Date().toISOString();
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * In-memory store used for development and tests when DATABASE_URL is not
 * configured. Implements the same DataStore contract as the PostgreSQL
 * store; data resets on process restart.
 */
export function createMemoryStore(): DataStore {
  const countries = new Map<string, Country>();
  const players = new Map<string, Player>();
  const stats = new Map<string, StoredPlayerStats>(); // keyed by playerId
  const users = new Map<string, UserRow>();
  const teams = new Map<string, TeamRow>();
  const teamPlayers: TeamPlayerRow[] = [];
  const editTokens = new Map<string, EditTokenRecord>();
  const adjustments: ScoreAdjustment[] = [];
  const importRuns = new Map<string, ImportRun>();
  const importErrors: ImportError[] = [];
  const auditLogs: AdminAuditLog[] = [];

  function toTeam(row: TeamRow): Team {
    const user = users.get(row.userId);
    return {
      id: row.id,
      teamName: row.teamName,
      userName: user?.username ?? "Unknown",
      totalPoints: row.totalPoints,
      manualPointsAdjustment: row.manualPointsAdjustment,
      lockedAt: row.lockedAt,
      validationSnapshot: row.validationSnapshot,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  function toSelectable(player: Player): SelectablePlayer | null {
    const country = countries.get(player.countryId);
    if (country === undefined) {
      return null;
    }
    return {
      id: player.id,
      name: player.name,
      position: player.position,
      countryId: country.id,
      countryName: country.name,
      countryFifaCode: country.fifaCode,
      worldCupGroup: country.worldCupGroup,
      region: country.region,
      shirtNumber: player.shirtNumber,
      fantasyPoints: stats.get(player.id)?.fantasyPoints ?? 0,
    };
  }

  return {
    async upsertCountry(input: CountryUpsert): Promise<UpsertResult<Country>> {
      const existing = [...countries.values()].find(
        (country) => normalize(country.name) === normalize(input.name),
      );
      if (existing !== undefined) {
        const updated: Country = { ...existing, ...input };
        countries.set(existing.id, updated);
        return { record: updated, created: false };
      }
      const record: Country = { id: randomUUID(), ...input };
      countries.set(record.id, record);
      return { record, created: true };
    },

    async listCountries(): Promise<Country[]> {
      return [...countries.values()].sort((a, b) =>
        a.worldCupGroup === b.worldCupGroup
          ? a.name.localeCompare(b.name)
          : a.worldCupGroup.localeCompare(b.worldCupGroup),
      );
    },

    async getCountry(id: string): Promise<Country | null> {
      return countries.get(id) ?? null;
    },

    async getCountryByName(name: string): Promise<Country | null> {
      return (
        [...countries.values()].find((country) => normalize(country.name) === normalize(name)) ??
        null
      );
    },

    async upsertPlayer(input: PlayerUpsert): Promise<UpsertResult<Player>> {
      const existing = [...players.values()].find(
        (player) =>
          player.countryId === input.countryId && normalize(player.name) === normalize(input.name),
      );
      if (existing !== undefined) {
        const updated: Player = { ...existing, ...input };
        players.set(existing.id, updated);
        return { record: updated, created: false };
      }
      const record: Player = { id: randomUUID(), ...input };
      players.set(record.id, record);
      return { record, created: true };
    },

    async listPlayers(filters: PlayerFilters = {}): Promise<SelectablePlayer[]> {
      const query = filters.q === undefined ? null : normalize(filters.q);
      const result: SelectablePlayer[] = [];
      for (const player of players.values()) {
        if (!player.active && filters.includeInactive !== true) {
          continue;
        }
        const selectable = toSelectable(player);
        if (selectable === null) {
          continue;
        }
        if (query !== null && !normalize(selectable.name).includes(query)) {
          continue;
        }
        if (filters.countryId !== undefined && selectable.countryId !== filters.countryId) {
          continue;
        }
        if (filters.group !== undefined && selectable.worldCupGroup !== filters.group) {
          continue;
        }
        if (filters.region !== undefined && selectable.region !== filters.region) {
          continue;
        }
        if (filters.position !== undefined && selectable.position !== filters.position) {
          continue;
        }
        result.push(selectable);
      }
      return result.sort((a, b) => a.name.localeCompare(b.name));
    },

    async getPlayer(id: string): Promise<Player | null> {
      return players.get(id) ?? null;
    },

    async getPlayersByIds(ids: readonly string[]): Promise<Player[]> {
      return ids
        .map((id) => players.get(id))
        .filter((player): player is Player => player !== undefined);
    },

    async setPlayerActive(id: string, active: boolean): Promise<void> {
      const player = players.get(id);
      if (player !== undefined) {
        players.set(id, { ...player, active });
      }
    },

    async upsertStats(input: StatsUpsert): Promise<UpsertResult<StoredPlayerStats>> {
      const existing = stats.get(input.playerId);
      if (existing !== undefined) {
        const updated: StoredPlayerStats = { ...existing, ...input };
        stats.set(input.playerId, updated);
        return { record: updated, created: false };
      }
      const record: StoredPlayerStats = { id: randomUUID(), ...input };
      stats.set(input.playerId, record);
      return { record, created: true };
    },

    async getStatsForPlayer(playerId: string): Promise<StoredPlayerStats | null> {
      return stats.get(playerId) ?? null;
    },

    async listStats(): Promise<StoredPlayerStats[]> {
      return [...stats.values()];
    },

    async setCachedFantasyPoints(
      playerId: string,
      fantasyPoints: number,
      calculatedAt: string,
    ): Promise<void> {
      const existing = stats.get(playerId);
      if (existing !== undefined) {
        stats.set(playerId, { ...existing, fantasyPoints, calculatedAt });
      }
    },

    async createTeam(input: TeamCreate): Promise<Team> {
      const timestamp = now();
      const user: UserRow = {
        id: randomUUID(),
        username: input.userName,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      users.set(user.id, user);

      const row: TeamRow = {
        id: randomUUID(),
        teamName: input.teamName,
        userId: user.id,
        totalPoints: input.totalPoints,
        manualPointsAdjustment: 0,
        lockedAt: null,
        validationSnapshot: input.validationSnapshot,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      teams.set(row.id, row);
      for (const playerId of input.playerIds) {
        teamPlayers.push({ teamId: row.id, playerId, createdAt: timestamp });
      }
      return toTeam(row);
    },

    async getTeam(id: string): Promise<Team | null> {
      const row = teams.get(id);
      return row === undefined ? null : toTeam(row);
    },

    async listTeams(): Promise<Team[]> {
      return [...teams.values()]
        .map(toTeam)
        .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    },

    async updateTeam(id: string, update: TeamUpdate): Promise<Team | null> {
      const row = teams.get(id);
      if (row === undefined) {
        return null;
      }
      const timestamp = now();
      if (update.userName !== undefined) {
        const user = users.get(row.userId);
        if (user !== undefined) {
          users.set(user.id, { ...user, username: update.userName, updatedAt: timestamp });
        }
      }
      if (update.playerIds !== undefined) {
        for (let index = teamPlayers.length - 1; index >= 0; index -= 1) {
          if (teamPlayers[index].teamId === id) {
            teamPlayers.splice(index, 1);
          }
        }
        for (const playerId of update.playerIds) {
          teamPlayers.push({ teamId: id, playerId, createdAt: timestamp });
        }
      }
      const updated: TeamRow = {
        ...row,
        teamName: update.teamName ?? row.teamName,
        totalPoints: update.totalPoints ?? row.totalPoints,
        manualPointsAdjustment: update.manualPointsAdjustment ?? row.manualPointsAdjustment,
        lockedAt: update.lockedAt !== undefined ? update.lockedAt : row.lockedAt,
        validationSnapshot: update.validationSnapshot ?? row.validationSnapshot,
        updatedAt: timestamp,
      };
      teams.set(id, updated);
      return toTeam(updated);
    },

    async deleteTeam(id: string): Promise<boolean> {
      const row = teams.get(id);
      if (row === undefined) {
        return false;
      }
      teams.delete(id);
      users.delete(row.userId);
      for (let index = teamPlayers.length - 1; index >= 0; index -= 1) {
        if (teamPlayers[index].teamId === id) {
          teamPlayers.splice(index, 1);
        }
      }
      for (const [tokenId, token] of editTokens) {
        if (token.teamId === id) {
          editTokens.delete(tokenId);
        }
      }
      return true;
    },

    async getTeamPlayerIds(teamId: string): Promise<string[]> {
      return teamPlayers.filter((entry) => entry.teamId === teamId).map((entry) => entry.playerId);
    },

    async createEditToken(
      teamId: string,
      tokenHash: string,
      expiresAt: string,
    ): Promise<EditTokenRecord> {
      const record: EditTokenRecord = {
        id: randomUUID(),
        teamId,
        tokenHash,
        expiresAt,
        lastUsedAt: null,
        createdAt: now(),
      };
      editTokens.set(record.id, record);
      return record;
    },

    async findEditToken(teamId: string, tokenHash: string): Promise<EditTokenRecord | null> {
      return (
        [...editTokens.values()].find(
          (token) => token.teamId === teamId && token.tokenHash === tokenHash,
        ) ?? null
      );
    },

    async touchEditToken(id: string, lastUsedAt: string): Promise<void> {
      const token = editTokens.get(id);
      if (token !== undefined) {
        editTokens.set(id, { ...token, lastUsedAt });
      }
    },

    async addAdjustment(
      input: Omit<ScoreAdjustment, "id" | "createdAt">,
    ): Promise<ScoreAdjustment> {
      const record: ScoreAdjustment = { id: randomUUID(), createdAt: now(), ...input };
      adjustments.push(record);
      return record;
    },

    async listAdjustments(
      targetType: "player" | "team",
      targetId: string,
    ): Promise<ScoreAdjustment[]> {
      return adjustments.filter(
        (adjustment) => adjustment.targetType === targetType && adjustment.targetId === targetId,
      );
    },

    async listAllAdjustments(): Promise<ScoreAdjustment[]> {
      return [...adjustments];
    },

    async createImportRun(source: ImportRun["source"]): Promise<ImportRun> {
      const record: ImportRun = {
        id: randomUUID(),
        source,
        status: "pending",
        startedAt: now(),
        finishedAt: null,
        recordsSeen: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        errorMessage: null,
        rawCachePath: null,
      };
      importRuns.set(record.id, record);
      return record;
    },

    async finishImportRun(id: string, finish: ImportRunFinish): Promise<void> {
      const run = importRuns.get(id);
      if (run !== undefined) {
        importRuns.set(id, { ...run, ...finish, finishedAt: now() });
      }
    },

    async addImportError(input: Omit<ImportError, "id" | "createdAt">): Promise<ImportError> {
      const record: ImportError = { id: randomUUID(), createdAt: now(), ...input };
      importErrors.push(record);
      return record;
    },

    async listImportRuns(): Promise<ImportRun[]> {
      return [...importRuns.values()].sort(
        (a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt),
      );
    },

    async getImportRun(id: string): Promise<{ run: ImportRun; errors: ImportError[] } | null> {
      const run = importRuns.get(id);
      if (run === undefined) {
        return null;
      }
      return { run, errors: importErrors.filter((error) => error.importRunId === id) };
    },

    async addAuditLog(input: Omit<AdminAuditLog, "id" | "createdAt">): Promise<AdminAuditLog> {
      const record: AdminAuditLog = { id: randomUUID(), createdAt: now(), ...input };
      auditLogs.push(record);
      return record;
    },

    async listAuditLogs(limit = 100): Promise<AdminAuditLog[]> {
      return [...auditLogs]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, limit);
    },
  };
}
