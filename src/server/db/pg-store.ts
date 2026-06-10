import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, ilike, inArray, sql, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type {
  AdminAuditLog,
  Country,
  ImportError,
  ImportRun,
  Player,
  Region,
  RosterSnapshotEntry,
  ScoreAdjustment,
  SelectablePlayer,
  Team,
} from "#/domain/types";
import * as schema from "./schema";
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

type Db = PostgresJsDatabase<typeof schema>;

function now(): string {
  return new Date().toISOString();
}

/**
 * Exact case-insensitive name match, mirroring the memory store's
 * trim+lowercase semantics. ILIKE is unsuitable for identity lookups: it
 * treats %/_ as wildcards and does not trim.
 */
function nameMatches(column: PgColumn, name: string): SQL {
  return sql`lower(trim(${column})) = ${name.trim().toLowerCase()}`;
}

type CountryRow = typeof schema.countries.$inferSelect;
type PlayerRow = typeof schema.players.$inferSelect;
type StatsRow = typeof schema.playerStats.$inferSelect;
type TeamRow = typeof schema.teams.$inferSelect;

function toCountry(row: CountryRow): Country {
  return {
    id: row.id,
    name: row.name,
    fifaCode: row.fifaCode,
    worldCupGroup: row.worldCupGroup,
    // Stored values are written exclusively through the importers, which
    // only persist valid Region/Confederation strings.
    region: row.region as Region,
    confederation: row.confederation as Country["confederation"],
  };
}

function toPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    sourcePlayerId: row.sourcePlayerId,
    name: row.playerName,
    countryId: row.countryId,
    position: row.position as Player["position"],
    sourcePosition: row.sourcePosition,
    shirtNumber: row.shirtNumber,
    active: row.active,
  };
}

function toStats(row: StatsRow): StoredPlayerStats {
  return {
    id: row.id,
    playerId: row.playerId,
    goals: row.goals,
    assists: row.assists,
    shots: row.shots,
    tacklesWon: row.tacklesWon,
    interceptions: row.interceptions,
    yellowCards: row.yellowCards,
    redCards: row.redCards,
    penaltyMisses: row.penaltyMisses,
    minutesPlayed: row.minutesPlayed,
    saves: row.saves,
    goalsAgainst: row.goalsAgainst,
    cleanSheets: row.cleanSheets,
    penaltySaves: row.penaltySaves,
    statsSource: row.statsSource,
    sourceUpdatedAt: row.sourceUpdatedAt,
    fantasyPoints: row.fantasyPoints,
    calculatedAt: row.calculatedAt,
  };
}

function toTeam(row: TeamRow, username: string): Team {
  return {
    id: row.id,
    teamName: row.teamName,
    userName: username,
    totalPoints: row.totalPoints,
    manualPointsAdjustment: row.manualPointsAdjustment,
    lockedAt: row.lockedAt,
    validationSnapshot: row.validationSnapshot as RosterSnapshotEntry[],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * PostgreSQL store for Railway production. Schema is applied via drizzle-kit
 * migrations (`pnpm db:migrate`); this store assumes the tables exist.
 */
export async function createPgStore(databaseUrl: string): Promise<DataStore> {
  const client = postgres(databaseUrl, { max: 10, prepare: false });
  const db: Db = drizzle(client, { schema });

  function toImportRun(row: typeof schema.importRuns.$inferSelect): ImportRun {
    return {
      id: row.id,
      source: row.source as ImportRun["source"],
      status: row.status as ImportRun["status"],
      startedAt: row.startedAt,
      finishedAt: row.finishedAt,
      recordsSeen: row.recordsSeen,
      recordsCreated: row.recordsCreated,
      recordsUpdated: row.recordsUpdated,
      errorMessage: row.errorMessage,
      rawCachePath: row.rawCachePath,
    };
  }

  async function getTeamRow(id: string): Promise<Team | null> {
    const rows = await db
      .select({ team: schema.teams, username: schema.users.username })
      .from(schema.teams)
      .innerJoin(schema.users, eq(schema.teams.userId, schema.users.id))
      .where(eq(schema.teams.id, id))
      .limit(1);
    const row = rows[0];
    return row === undefined ? null : toTeam(row.team, row.username);
  }

  return {
    async upsertCountry(input: CountryUpsert): Promise<UpsertResult<Country>> {
      const existing = await db
        .select()
        .from(schema.countries)
        .where(nameMatches(schema.countries.name, input.name))
        .limit(1);
      if (existing[0] !== undefined) {
        const [updated] = await db
          .update(schema.countries)
          .set({
            name: input.name,
            fifaCode: input.fifaCode,
            worldCupGroup: input.worldCupGroup,
            region: input.region,
            confederation: input.confederation,
            updatedAt: now(),
          })
          .where(eq(schema.countries.id, existing[0].id))
          .returning();
        return { record: toCountry(updated), created: false };
      }
      const [created] = await db
        .insert(schema.countries)
        .values({
          id: randomUUID(),
          name: input.name,
          fifaCode: input.fifaCode,
          worldCupGroup: input.worldCupGroup,
          region: input.region,
          confederation: input.confederation,
        })
        .returning();
      return { record: toCountry(created), created: true };
    },

    async listCountries(): Promise<Country[]> {
      const rows = await db
        .select()
        .from(schema.countries)
        .orderBy(asc(schema.countries.worldCupGroup), asc(schema.countries.name));
      return rows.map(toCountry);
    },

    async getCountry(id: string): Promise<Country | null> {
      const rows = await db
        .select()
        .from(schema.countries)
        .where(eq(schema.countries.id, id))
        .limit(1);
      return rows[0] === undefined ? null : toCountry(rows[0]);
    },

    async getCountryByName(name: string): Promise<Country | null> {
      const rows = await db
        .select()
        .from(schema.countries)
        .where(nameMatches(schema.countries.name, name))
        .limit(1);
      return rows[0] === undefined ? null : toCountry(rows[0]);
    },

    async upsertPlayer(input: PlayerUpsert): Promise<UpsertResult<Player>> {
      const existing = await db
        .select()
        .from(schema.players)
        .where(
          and(
            eq(schema.players.countryId, input.countryId),
            nameMatches(schema.players.playerName, input.name),
          ),
        )
        .limit(1);
      if (existing[0] !== undefined) {
        const [updated] = await db
          .update(schema.players)
          .set({
            playerName: input.name,
            position: input.position,
            sourcePosition: input.sourcePosition,
            sourcePlayerId: input.sourcePlayerId,
            shirtNumber: input.shirtNumber,
            active: input.active,
            updatedAt: now(),
          })
          .where(eq(schema.players.id, existing[0].id))
          .returning();
        return { record: toPlayer(updated), created: false };
      }
      const [created] = await db
        .insert(schema.players)
        .values({
          id: randomUUID(),
          playerName: input.name,
          countryId: input.countryId,
          position: input.position,
          sourcePosition: input.sourcePosition,
          sourcePlayerId: input.sourcePlayerId,
          shirtNumber: input.shirtNumber,
          active: input.active,
        })
        .returning();
      return { record: toPlayer(created), created: true };
    },

    async listPlayers(filters: PlayerFilters = {}): Promise<SelectablePlayer[]> {
      const conditions = [];
      if (filters.includeInactive !== true) {
        conditions.push(eq(schema.players.active, true));
      }
      if (filters.q !== undefined) {
        conditions.push(ilike(schema.players.playerName, `%${filters.q}%`));
      }
      if (filters.countryId !== undefined) {
        conditions.push(eq(schema.players.countryId, filters.countryId));
      }
      if (filters.group !== undefined) {
        conditions.push(eq(schema.countries.worldCupGroup, filters.group));
      }
      if (filters.region !== undefined) {
        conditions.push(eq(schema.countries.region, filters.region));
      }
      if (filters.position !== undefined) {
        conditions.push(eq(schema.players.position, filters.position));
      }

      const rows = await db
        .select({
          player: schema.players,
          country: schema.countries,
          fantasyPoints: schema.playerStats.fantasyPoints,
        })
        .from(schema.players)
        .innerJoin(schema.countries, eq(schema.players.countryId, schema.countries.id))
        .leftJoin(schema.playerStats, eq(schema.playerStats.playerId, schema.players.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(schema.players.playerName));

      return rows.map((row) => ({
        id: row.player.id,
        name: row.player.playerName,
        position: row.player.position as SelectablePlayer["position"],
        countryId: row.country.id,
        countryName: row.country.name,
        countryFifaCode: row.country.fifaCode,
        worldCupGroup: row.country.worldCupGroup,
        region: row.country.region as Region,
        shirtNumber: row.player.shirtNumber,
        fantasyPoints: row.fantasyPoints ?? 0,
      }));
    },

    async getPlayer(id: string): Promise<Player | null> {
      const rows = await db.select().from(schema.players).where(eq(schema.players.id, id)).limit(1);
      return rows[0] === undefined ? null : toPlayer(rows[0]);
    },

    async getPlayersByIds(ids: readonly string[]): Promise<Player[]> {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .select()
        .from(schema.players)
        .where(inArray(schema.players.id, [...ids]));
      const byId = new Map(rows.map((row) => [row.id, toPlayer(row)]));
      return ids
        .map((id) => byId.get(id))
        .filter((player): player is Player => player !== undefined);
    },

    async setPlayerActive(id: string, active: boolean): Promise<void> {
      await db
        .update(schema.players)
        .set({ active, updatedAt: now() })
        .where(eq(schema.players.id, id));
    },

    async upsertStats(input: StatsUpsert): Promise<UpsertResult<StoredPlayerStats>> {
      const { playerId, fantasyPoints, calculatedAt, statsSource, sourceUpdatedAt, ...numbers } =
        input;
      const existing = await db
        .select()
        .from(schema.playerStats)
        .where(eq(schema.playerStats.playerId, playerId))
        .limit(1);
      if (existing[0] !== undefined) {
        const [updated] = await db
          .update(schema.playerStats)
          .set({ ...numbers, fantasyPoints, calculatedAt, statsSource, sourceUpdatedAt })
          .where(eq(schema.playerStats.id, existing[0].id))
          .returning();
        return { record: toStats(updated), created: false };
      }
      const [created] = await db
        .insert(schema.playerStats)
        .values({
          id: randomUUID(),
          playerId,
          ...numbers,
          fantasyPoints,
          calculatedAt,
          statsSource,
          sourceUpdatedAt,
        })
        .returning();
      return { record: toStats(created), created: true };
    },

    async getStatsForPlayer(playerId: string): Promise<StoredPlayerStats | null> {
      const rows = await db
        .select()
        .from(schema.playerStats)
        .where(eq(schema.playerStats.playerId, playerId))
        .limit(1);
      return rows[0] === undefined ? null : toStats(rows[0]);
    },

    async listStats(): Promise<StoredPlayerStats[]> {
      const rows = await db.select().from(schema.playerStats);
      return rows.map(toStats);
    },

    async setCachedFantasyPoints(
      playerId: string,
      fantasyPoints: number,
      calculatedAt: string,
    ): Promise<void> {
      await db
        .update(schema.playerStats)
        .set({ fantasyPoints, calculatedAt })
        .where(eq(schema.playerStats.playerId, playerId));
    },

    async createTeam(input: TeamCreate): Promise<Team> {
      const userId = randomUUID();
      const teamId = randomUUID();
      await db.transaction(async (tx) => {
        await tx.insert(schema.users).values({ id: userId, username: input.userName });
        await tx.insert(schema.teams).values({
          id: teamId,
          teamName: input.teamName,
          userId,
          totalPoints: input.totalPoints,
          manualPointsAdjustment: 0,
          validationSnapshot: input.validationSnapshot,
        });
        if (input.playerIds.length > 0) {
          await tx
            .insert(schema.teamPlayers)
            .values(input.playerIds.map((playerId) => ({ id: randomUUID(), teamId, playerId })));
        }
      });
      const team = await getTeamRow(teamId);
      if (team === null) {
        throw new Error("Failed to create team");
      }
      return team;
    },

    async getTeam(id: string): Promise<Team | null> {
      return getTeamRow(id);
    },

    async listTeams(): Promise<Team[]> {
      const rows = await db
        .select({ team: schema.teams, username: schema.users.username })
        .from(schema.teams)
        .innerJoin(schema.users, eq(schema.teams.userId, schema.users.id))
        .orderBy(asc(schema.teams.createdAt));
      return rows.map((row) => toTeam(row.team, row.username));
    },

    async updateTeam(id: string, update: TeamUpdate): Promise<Team | null> {
      const existing = await db.select().from(schema.teams).where(eq(schema.teams.id, id)).limit(1);
      const row = existing[0];
      if (row === undefined) {
        return null;
      }
      await db.transaction(async (tx) => {
        if (update.userName !== undefined) {
          await tx
            .update(schema.users)
            .set({ username: update.userName, updatedAt: now() })
            .where(eq(schema.users.id, row.userId));
        }
        if (update.playerIds !== undefined) {
          await tx.delete(schema.teamPlayers).where(eq(schema.teamPlayers.teamId, id));
          if (update.playerIds.length > 0) {
            await tx
              .insert(schema.teamPlayers)
              .values(
                update.playerIds.map((playerId) => ({ id: randomUUID(), teamId: id, playerId })),
              );
          }
        }
        await tx
          .update(schema.teams)
          .set({
            ...(update.teamName === undefined ? {} : { teamName: update.teamName }),
            ...(update.totalPoints === undefined ? {} : { totalPoints: update.totalPoints }),
            ...(update.manualPointsAdjustment === undefined
              ? {}
              : { manualPointsAdjustment: update.manualPointsAdjustment }),
            ...(update.lockedAt === undefined ? {} : { lockedAt: update.lockedAt }),
            ...(update.validationSnapshot === undefined
              ? {}
              : { validationSnapshot: update.validationSnapshot }),
            updatedAt: now(),
          })
          .where(eq(schema.teams.id, id));
      });
      return getTeamRow(id);
    },

    async deleteTeam(id: string): Promise<boolean> {
      const existing = await db.select().from(schema.teams).where(eq(schema.teams.id, id)).limit(1);
      const row = existing[0];
      if (row === undefined) {
        return false;
      }
      await db.transaction(async (tx) => {
        await tx.delete(schema.teams).where(eq(schema.teams.id, id));
        await tx.delete(schema.users).where(eq(schema.users.id, row.userId));
      });
      return true;
    },

    async getTeamPlayerIds(teamId: string): Promise<string[]> {
      const rows = await db
        .select({ playerId: schema.teamPlayers.playerId })
        .from(schema.teamPlayers)
        .where(eq(schema.teamPlayers.teamId, teamId));
      return rows.map((row) => row.playerId);
    },

    async createEditToken(
      teamId: string,
      tokenHash: string,
      expiresAt: string,
    ): Promise<EditTokenRecord> {
      const [created] = await db
        .insert(schema.teamEditTokens)
        .values({ id: randomUUID(), teamId, tokenHash, expiresAt })
        .returning();
      return {
        id: created.id,
        teamId: created.teamId,
        tokenHash: created.tokenHash,
        expiresAt: created.expiresAt,
        lastUsedAt: created.lastUsedAt,
        createdAt: created.createdAt,
      };
    },

    async findEditToken(teamId: string, tokenHash: string): Promise<EditTokenRecord | null> {
      const rows = await db
        .select()
        .from(schema.teamEditTokens)
        .where(
          and(
            eq(schema.teamEditTokens.teamId, teamId),
            eq(schema.teamEditTokens.tokenHash, tokenHash),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row === undefined
        ? null
        : {
            id: row.id,
            teamId: row.teamId,
            tokenHash: row.tokenHash,
            expiresAt: row.expiresAt,
            lastUsedAt: row.lastUsedAt,
            createdAt: row.createdAt,
          };
    },

    async touchEditToken(id: string, lastUsedAt: string): Promise<void> {
      await db
        .update(schema.teamEditTokens)
        .set({ lastUsedAt })
        .where(eq(schema.teamEditTokens.id, id));
    },

    async addAdjustment(
      input: Omit<ScoreAdjustment, "id" | "createdAt">,
    ): Promise<ScoreAdjustment> {
      const [created] = await db
        .insert(schema.scoreAdjustments)
        .values({ id: randomUUID(), ...input })
        .returning();
      return {
        id: created.id,
        targetType: created.targetType as ScoreAdjustment["targetType"],
        targetId: created.targetId,
        points: created.points,
        reason: created.reason,
        adminId: created.adminId,
        createdAt: created.createdAt,
      };
    },

    async listAdjustments(
      targetType: "player" | "team",
      targetId: string,
    ): Promise<ScoreAdjustment[]> {
      const rows = await db
        .select()
        .from(schema.scoreAdjustments)
        .where(
          and(
            eq(schema.scoreAdjustments.targetType, targetType),
            eq(schema.scoreAdjustments.targetId, targetId),
          ),
        )
        .orderBy(asc(schema.scoreAdjustments.createdAt));
      return rows.map((row) => ({
        id: row.id,
        targetType: row.targetType as ScoreAdjustment["targetType"],
        targetId: row.targetId,
        points: row.points,
        reason: row.reason,
        adminId: row.adminId,
        createdAt: row.createdAt,
      }));
    },

    async listAllAdjustments(): Promise<ScoreAdjustment[]> {
      const rows = await db
        .select()
        .from(schema.scoreAdjustments)
        .orderBy(asc(schema.scoreAdjustments.createdAt));
      return rows.map((row) => ({
        id: row.id,
        targetType: row.targetType as ScoreAdjustment["targetType"],
        targetId: row.targetId,
        points: row.points,
        reason: row.reason,
        adminId: row.adminId,
        createdAt: row.createdAt,
      }));
    },

    async createImportRun(source: ImportRun["source"]): Promise<ImportRun> {
      const [created] = await db
        .insert(schema.importRuns)
        .values({ id: randomUUID(), source, status: "pending", startedAt: now() })
        .returning();
      return {
        id: created.id,
        source: created.source as ImportRun["source"],
        status: created.status as ImportRun["status"],
        startedAt: created.startedAt,
        finishedAt: created.finishedAt,
        recordsSeen: created.recordsSeen,
        recordsCreated: created.recordsCreated,
        recordsUpdated: created.recordsUpdated,
        errorMessage: created.errorMessage,
        rawCachePath: created.rawCachePath,
      };
    },

    async finishImportRun(id: string, finish: ImportRunFinish): Promise<void> {
      await db
        .update(schema.importRuns)
        .set({
          status: finish.status,
          recordsSeen: finish.recordsSeen,
          recordsCreated: finish.recordsCreated,
          recordsUpdated: finish.recordsUpdated,
          errorMessage: finish.errorMessage,
          rawCachePath: finish.rawCachePath,
          finishedAt: now(),
        })
        .where(eq(schema.importRuns.id, id));
    },

    async addImportError(input: Omit<ImportError, "id" | "createdAt">): Promise<ImportError> {
      const [created] = await db
        .insert(schema.importErrors)
        .values({ id: randomUUID(), ...input })
        .returning();
      return {
        id: created.id,
        importRunId: created.importRunId,
        severity: created.severity as ImportError["severity"],
        entityRef: created.entityRef,
        message: created.message,
        createdAt: created.createdAt,
      };
    },

    async listImportRuns(): Promise<ImportRun[]> {
      const rows = await db
        .select()
        .from(schema.importRuns)
        .orderBy(desc(schema.importRuns.startedAt));
      return rows.map(toImportRun);
    },

    async getImportRun(id: string): Promise<{ run: ImportRun; errors: ImportError[] } | null> {
      const runRows = await db
        .select()
        .from(schema.importRuns)
        .where(eq(schema.importRuns.id, id))
        .limit(1);
      if (runRows[0] === undefined) {
        return null;
      }
      const run = toImportRun(runRows[0]);
      const errorRows = await db
        .select()
        .from(schema.importErrors)
        .where(eq(schema.importErrors.importRunId, id))
        .orderBy(asc(schema.importErrors.createdAt));
      return {
        run,
        errors: errorRows.map((row) => ({
          id: row.id,
          importRunId: row.importRunId,
          severity: row.severity as ImportError["severity"],
          entityRef: row.entityRef,
          message: row.message,
          createdAt: row.createdAt,
        })),
      };
    },

    async addAuditLog(input: Omit<AdminAuditLog, "id" | "createdAt">): Promise<AdminAuditLog> {
      const [created] = await db
        .insert(schema.adminAuditLogs)
        .values({ id: randomUUID(), ...input })
        .returning();
      return {
        id: created.id,
        adminUserId: created.adminUserId,
        action: created.action,
        targetType: created.targetType,
        targetId: created.targetId,
        metadata: created.metadata as AdminAuditLog["metadata"],
        createdAt: created.createdAt,
      };
    },

    async listAuditLogs(limit = 100): Promise<AdminAuditLog[]> {
      const rows = await db
        .select()
        .from(schema.adminAuditLogs)
        .orderBy(desc(schema.adminAuditLogs.createdAt))
        .limit(limit);
      return rows.map((row) => ({
        id: row.id,
        adminUserId: row.adminUserId,
        action: row.action,
        targetType: row.targetType,
        targetId: row.targetId,
        metadata: row.metadata as AdminAuditLog["metadata"],
        createdAt: row.createdAt,
      }));
    },
  };
}
