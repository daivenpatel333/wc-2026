import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { emptyStats, scorePlayer, scoreTeam } from "#/domain/scoring";
import { validateRoster } from "#/domain/validation";
import type { LeaderboardPlayer, Player, RosterSnapshotEntry, Team } from "#/domain/types";
import { getServerEnv, isTournamentLocked } from "#/server/env";
import type { DataStore } from "#/server/db/store";
import { AppError } from "./errors";
import { getGroupLabels } from "./tournament";

const NAME_MAX_LENGTH = 60;

export interface SubmitTeamInput {
  teamName: unknown;
  userName: unknown;
  playerIds: unknown;
}

export interface SubmitTeamResult {
  team: Team;
  /** Raw edit token, returned exactly once. Only its hash is stored. */
  editToken: string;
  editPath: string;
}

export interface TeamDetail {
  team: Team;
  players: LeaderboardPlayer[];
  calculatedPoints: number;
  adjustmentPoints: number;
  totalPoints: number;
  locked: boolean;
}

export function hashEditToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function cleanName(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError("INVALID_NAME", `${field} is required.`);
  }
  const trimmed = value.trim();
  if (trimmed.length > NAME_MAX_LENGTH) {
    throw new AppError("INVALID_NAME", `${field} must be ${NAME_MAX_LENGTH} characters or fewer.`);
  }
  return trimmed;
}

function cleanPlayerIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new AppError("INVALID_BODY", "playerIds must be an array of player ids.");
  }
  return value.map((id) => {
    if (typeof id !== "string" || id.trim() === "") {
      throw new AppError("INVALID_BODY", "playerIds must contain only non-empty strings.");
    }
    return id.trim();
  });
}

function assertSubmissionsOpen(): void {
  const env = getServerEnv();
  if (!env.allowPublicSubmissions) {
    throw new AppError("SUBMISSIONS_DISABLED", "Public submissions are currently disabled.", {
      status: 403,
    });
  }
  if (isTournamentLocked()) {
    throw new AppError(
      "TOURNAMENT_LOCKED",
      "The tournament has started; team submissions and edits are locked.",
      { status: 403 },
    );
  }
}

async function buildSnapshot(
  store: DataStore,
  playerIds: readonly string[],
): Promise<{ players: Player[]; snapshot: RosterSnapshotEntry[] }> {
  const unique = [...new Set(playerIds)];
  if (unique.length !== playerIds.length) {
    throw new AppError("ROSTER_INVALID", "Each player can only be selected once.", {
      details: {
        issues: [{ code: "DUPLICATE_PLAYER", message: "Each player can only be selected once." }],
      },
    });
  }

  const players = await store.getPlayersByIds(playerIds);
  if (players.length !== playerIds.length) {
    throw new AppError("UNKNOWN_PLAYER", "One or more selected players do not exist.");
  }

  const countries = await Promise.all(players.map((player) => store.getCountry(player.countryId)));
  const snapshot: RosterSnapshotEntry[] = [];
  for (const [index, player] of players.entries()) {
    if (!player.active) {
      throw new AppError(
        "INACTIVE_PLAYER",
        `${player.name} is not currently selectable. Remove them from your roster.`,
      );
    }
    const country = countries[index];
    if (country === null) {
      throw new AppError("UNKNOWN_PLAYER", `${player.name} has no tournament country data.`);
    }
    snapshot.push({
      playerId: player.id,
      playerName: player.name,
      position: player.position,
      countryId: country.id,
      countryName: country.name,
      worldCupGroup: country.worldCupGroup,
      region: country.region,
    });
  }
  return { players, snapshot };
}

async function assertRosterValid(store: DataStore, snapshot: RosterSnapshotEntry[]): Promise<void> {
  const groups = await getGroupLabels(store);
  const result = validateRoster(snapshot, { groups });
  if (!result.valid) {
    throw new AppError("ROSTER_INVALID", result.issues[0]?.message ?? "Roster is invalid.", {
      details: { issues: result.issues },
    });
  }
}

async function calculateTeamPoints(
  store: DataStore,
  teamId: string | null,
  playerIds: readonly string[],
): Promise<number> {
  const [playerStats, teamAdjustments] = await Promise.all([
    Promise.all(playerIds.map((playerId) => store.getStatsForPlayer(playerId))),
    teamId === null ? Promise.resolve([]) : store.listAdjustments("team", teamId),
  ]);
  const totals = playerStats.map((stats) => stats?.fantasyPoints ?? 0);
  return scoreTeam(totals, teamAdjustments).totalPoints;
}

export async function submitTeam(
  store: DataStore,
  input: SubmitTeamInput,
): Promise<SubmitTeamResult> {
  assertSubmissionsOpen();
  const teamName = cleanName(input.teamName, "Team name");
  const userName = cleanName(input.userName, "Your name");
  const playerIds = cleanPlayerIds(input.playerIds);

  const { snapshot } = await buildSnapshot(store, playerIds);
  await assertRosterValid(store, snapshot);

  const totalPoints = await calculateTeamPoints(store, null, playerIds);
  const team = await store.createTeam({
    teamName,
    userName,
    playerIds,
    validationSnapshot: snapshot,
    totalPoints,
  });

  const editToken = randomBytes(32).toString("base64url");
  await store.createEditToken(
    team.id,
    hashEditToken(editToken),
    getServerEnv().tournamentLockAt.toISOString(),
  );

  return { team, editToken, editPath: `/teams/${team.id}/edit?token=${editToken}` };
}

export async function verifyEditToken(
  store: DataStore,
  teamId: string,
  token: string,
): Promise<Team> {
  const team = await store.getTeam(teamId);
  if (team === null) {
    throw new AppError("TEAM_NOT_FOUND", "Team not found.", { status: 404 });
  }
  if (token.trim() === "") {
    throw new AppError("INVALID_EDIT_TOKEN", "This edit link is not valid.", { status: 403 });
  }

  const presented = hashEditToken(token.trim());
  const record = await store.findEditToken(teamId, presented);
  const valid =
    record !== null &&
    timingSafeEqual(Buffer.from(record.tokenHash, "hex"), Buffer.from(presented, "hex"));
  if (!valid || record === null) {
    throw new AppError("INVALID_EDIT_TOKEN", "This edit link is not valid.", { status: 403 });
  }
  if (Date.now() >= Date.parse(record.expiresAt) || isTournamentLocked()) {
    throw new AppError(
      "TOURNAMENT_LOCKED",
      "The tournament has started; this edit link has expired.",
      { status: 403 },
    );
  }
  if (team.lockedAt !== null) {
    throw new AppError("TEAM_LOCKED", "This team has been locked by an administrator.", {
      status: 403,
    });
  }

  await store.touchEditToken(record.id, new Date().toISOString());
  return team;
}

export interface EditTeamInput {
  teamName?: unknown;
  userName?: unknown;
  playerIds?: unknown;
}

export async function editTeam(
  store: DataStore,
  teamId: string,
  token: string,
  input: EditTeamInput,
): Promise<Team> {
  assertSubmissionsOpen();
  await verifyEditToken(store, teamId, token);

  const update: Parameters<DataStore["updateTeam"]>[1] = {};
  if (input.teamName !== undefined) {
    update.teamName = cleanName(input.teamName, "Team name");
  }
  if (input.userName !== undefined) {
    update.userName = cleanName(input.userName, "Your name");
  }
  if (input.playerIds !== undefined) {
    const playerIds = cleanPlayerIds(input.playerIds);
    const { snapshot } = await buildSnapshot(store, playerIds);
    await assertRosterValid(store, snapshot);
    update.playerIds = playerIds;
    update.validationSnapshot = snapshot;
    update.totalPoints = await calculateTeamPoints(store, teamId, playerIds);
  }

  const team = await store.updateTeam(teamId, update);
  if (team === null) {
    throw new AppError("TEAM_NOT_FOUND", "Team not found.", { status: 404 });
  }
  return team;
}

export async function getTeamDetail(store: DataStore, teamId: string): Promise<TeamDetail> {
  const team = await store.getTeam(teamId);
  if (team === null) {
    throw new AppError("TEAM_NOT_FOUND", "Team not found.", { status: 404 });
  }

  const players = await Promise.all(
    team.validationSnapshot.map(async (entry): Promise<LeaderboardPlayer> => {
      const [player, country, stats, adjustments] = await Promise.all([
        store.getPlayer(entry.playerId),
        store.getCountry(entry.countryId),
        store.getStatsForPlayer(entry.playerId),
        store.listAdjustments("player", entry.playerId),
      ]);
      return {
        ...entry,
        score: scorePlayer(
          stats ?? emptyStats(entry.playerId),
          player?.position ?? entry.position,
          adjustments,
        ),
        active: player?.active ?? false,
        shirtNumber: player?.shirtNumber ?? null,
        countryFifaCode: country?.fifaCode ?? null,
      };
    }),
  );

  const teamAdjustments = await store.listAdjustments("team", teamId);
  const result = scoreTeam(
    players.map((player) => player.score.totalPoints),
    teamAdjustments,
  );

  return {
    team,
    players,
    calculatedPoints: result.calculatedPoints,
    adjustmentPoints: result.adjustmentPoints,
    totalPoints: result.totalPoints,
    locked: team.lockedAt !== null || isTournamentLocked(),
  };
}
