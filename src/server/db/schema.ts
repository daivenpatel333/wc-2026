import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * PostgreSQL schema for Railway production. Application ids are generated
 * app-side with randomUUID so the memory and PostgreSQL stores behave
 * identically. Timestamps are ISO strings.
 */

const id = () => text("id").primaryKey();
const createdAt = () =>
  timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow();

export const users = pgTable(
  "users",
  {
    id: id(),
    username: text("username").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("users_username_idx").on(table.username)],
);

export const countries = pgTable(
  "countries",
  {
    id: id(),
    fifaCode: text("fifa_code"),
    name: text("name").notNull(),
    worldCupGroup: text("world_cup_group").notNull(),
    region: text("region").notNull(),
    confederation: text("confederation"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("countries_name_idx").on(table.name),
    index("countries_group_idx").on(table.worldCupGroup),
    index("countries_region_idx").on(table.region),
  ],
);

export const players = pgTable(
  "players",
  {
    id: id(),
    sourcePlayerId: text("source_player_id"),
    playerName: text("player_name").notNull(),
    countryId: text("country_id")
      .notNull()
      .references(() => countries.id, { onDelete: "cascade" }),
    position: text("position").notNull(),
    sourcePosition: text("source_position"),
    shirtNumber: integer("shirt_number"),
    active: boolean("active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("players_name_idx").on(table.playerName),
    index("players_country_idx").on(table.countryId),
    index("players_position_idx").on(table.position),
  ],
);

export const teams = pgTable(
  "teams",
  {
    id: id(),
    teamName: text("team_name").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    totalPoints: doublePrecision("total_points").notNull().default(0),
    manualPointsAdjustment: doublePrecision("manual_points_adjustment").notNull().default(0),
    lockedAt: timestamp("locked_at", { withTimezone: true, mode: "string" }),
    validationSnapshot: jsonb("validation_snapshot").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("teams_total_points_idx").on(table.totalPoints),
    index("teams_created_at_idx").on(table.createdAt),
  ],
);

export const teamPlayers = pgTable(
  "team_players",
  {
    id: id(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    playerId: text("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("team_players_unique_idx").on(table.teamId, table.playerId),
    index("team_players_team_idx").on(table.teamId),
    index("team_players_player_idx").on(table.playerId),
  ],
);

export const playerStats = pgTable(
  "player_stats",
  {
    id: id(),
    playerId: text("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    goals: doublePrecision("goals").notNull().default(0),
    assists: doublePrecision("assists").notNull().default(0),
    shots: doublePrecision("shots").notNull().default(0),
    tacklesWon: doublePrecision("tackles_won").notNull().default(0),
    interceptions: doublePrecision("interceptions").notNull().default(0),
    yellowCards: doublePrecision("yellow_cards").notNull().default(0),
    redCards: doublePrecision("red_cards").notNull().default(0),
    penaltyMisses: doublePrecision("penalty_misses").notNull().default(0),
    minutesPlayed: doublePrecision("minutes_played").notNull().default(0),
    saves: doublePrecision("saves").notNull().default(0),
    goalsAgainst: doublePrecision("goals_against").notNull().default(0),
    cleanSheets: doublePrecision("clean_sheets").notNull().default(0),
    penaltySaves: doublePrecision("penalty_saves").notNull().default(0),
    fantasyPoints: doublePrecision("fantasy_points").notNull().default(0),
    statsSource: text("stats_source").notNull(),
    sourceUpdatedAt: timestamp("source_updated_at", { withTimezone: true, mode: "string" }),
    calculatedAt: timestamp("calculated_at", { withTimezone: true, mode: "string" }).notNull(),
  },
  (table) => [uniqueIndex("player_stats_player_idx").on(table.playerId)],
);

export const scoreAdjustments = pgTable(
  "score_adjustments",
  {
    id: id(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    points: doublePrecision("points").notNull(),
    reason: text("reason"),
    adminId: text("admin_id").notNull(),
    createdAt: createdAt(),
  },
  (table) => [index("score_adjustments_target_idx").on(table.targetType, table.targetId)],
);

export const teamEditTokens = pgTable(
  "team_edit_tokens",
  {
    id: id(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true, mode: "string" }),
    createdAt: createdAt(),
  },
  (table) => [
    index("team_edit_tokens_team_idx").on(table.teamId),
    index("team_edit_tokens_hash_idx").on(table.tokenHash),
  ],
);

export const importRuns = pgTable(
  "import_runs",
  {
    id: id(),
    source: text("source").notNull(),
    status: text("status").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "string" }).notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true, mode: "string" }),
    recordsSeen: integer("records_seen").notNull().default(0),
    recordsCreated: integer("records_created").notNull().default(0),
    recordsUpdated: integer("records_updated").notNull().default(0),
    errorMessage: text("error_message"),
    rawCachePath: text("raw_cache_path"),
  },
  (table) => [index("import_runs_source_idx").on(table.source, table.startedAt)],
);

export const importErrors = pgTable(
  "import_errors",
  {
    id: id(),
    importRunId: text("import_run_id")
      .notNull()
      .references(() => importRuns.id, { onDelete: "cascade" }),
    severity: text("severity").notNull(),
    entityRef: text("entity_ref"),
    message: text("message").notNull(),
    createdAt: createdAt(),
  },
  (table) => [index("import_errors_run_idx").on(table.importRunId)],
);

export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id: id(),
    adminUserId: text("admin_user_id").notNull(),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    metadata: jsonb("metadata"),
    createdAt: createdAt(),
  },
  (table) => [index("admin_audit_logs_admin_idx").on(table.adminUserId, table.createdAt)],
);

/* Better Auth tables (email/password admin login with the admin plugin). */

export const authUsers = pgTable("auth_users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: id(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    impersonatedBy: text("impersonated_by"),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("auth_sessions_user_idx").on(table.userId)],
);

export const authAccounts = pgTable(
  "auth_accounts",
  {
    id: id(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("auth_accounts_user_idx").on(table.userId)],
);

export const authVerifications = pgTable("auth_verifications", {
  id: id(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});
