import { isFantasyPosition } from "#/domain/positions";
import { isRegion } from "#/domain/regions";
import type { PlayerScore, SelectablePlayer } from "#/domain/types";
import type { DataStore, PlayerFilters } from "#/server/db/store";
import { AppError } from "./errors";
import { getPlayerScore } from "./scores";

export interface PlayerListQuery {
  q?: string;
  country?: string;
  group?: string;
  region?: string;
  position?: string;
}

export function parsePlayerFilters(query: PlayerListQuery): PlayerFilters {
  const filters: PlayerFilters = {};
  if (query.q !== undefined && query.q.trim() !== "") {
    filters.q = query.q.trim();
  }
  if (query.country !== undefined && query.country.trim() !== "") {
    filters.countryId = query.country.trim();
  }
  if (query.group !== undefined && query.group.trim() !== "") {
    filters.group = query.group.trim();
  }
  if (query.region !== undefined && query.region.trim() !== "") {
    if (!isRegion(query.region)) {
      throw new AppError("INVALID_REGION", `Unknown region "${query.region}".`);
    }
    filters.region = query.region;
  }
  if (query.position !== undefined && query.position.trim() !== "") {
    const position = query.position.trim().toUpperCase();
    if (!isFantasyPosition(position)) {
      throw new AppError("INVALID_POSITION", `Unknown position "${query.position}".`);
    }
    filters.position = position;
  }
  return filters;
}

export async function listSelectablePlayers(
  store: DataStore,
  query: PlayerListQuery = {},
): Promise<SelectablePlayer[]> {
  return store.listPlayers(parsePlayerFilters(query));
}

export interface PlayerDetail {
  player: SelectablePlayer;
  score: PlayerScore;
}

export async function getPlayerDetail(store: DataStore, playerId: string): Promise<PlayerDetail> {
  const players = await store.listPlayers({ includeInactive: true });
  const player = players.find((candidate) => candidate.id === playerId);
  if (player === undefined) {
    throw new AppError("PLAYER_NOT_FOUND", "Player not found.", { status: 404 });
  }
  return { player, score: await getPlayerScore(store, playerId) };
}
