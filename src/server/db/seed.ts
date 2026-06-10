import type { FantasyPosition, Region, SelectablePlayer } from "#/domain/types";
import { FORMATIONS, validateRoster } from "#/domain/validation";
import { REGIONS } from "#/domain/regions";
import { runImport } from "#/server/services/imports";
import { recalculateAllScores } from "#/server/services/scores";
import type { DataStore } from "./store";

const SAMPLE_TEAMS: Array<{ teamName: string; userName: string; formationIndex: number }> = [
  { teamName: "Volt Strikers", userName: "Amara", formationIndex: 0 },
  { teamName: "Chalk Line Casuals", userName: "Diego", formationIndex: 1 },
  { teamName: "Stoppage Time Society", userName: "Yuki", formationIndex: 0 },
  { teamName: "The Gegenpressers", userName: "Lena", formationIndex: 1 },
  { teamName: "Route One Romantics", userName: "Kofi", formationIndex: 0 },
  { teamName: "Panenka Pirates", userName: "Marta", formationIndex: 1 },
];

/**
 * Greedily assemble a valid roster: one player per group, formation counts
 * respected, all region buckets covered. Rotation varies which group gets
 * first pick so sample teams differ.
 */
function buildSampleRoster(
  players: SelectablePlayer[],
  groups: string[],
  formationIndex: number,
  rotation: number,
): SelectablePlayer[] | null {
  const formation = FORMATIONS[formationIndex % FORMATIONS.length];
  const remaining: Record<FantasyPosition, number> = { ...formation.counts };
  const missingRegions = new Set<Region>(REGIONS);
  const byGroup = new Map<string, SelectablePlayer[]>();
  for (const player of players) {
    const list = byGroup.get(player.worldCupGroup) ?? [];
    list.push(player);
    byGroup.set(player.worldCupGroup, list);
  }

  const rotated = [...groups.slice(rotation), ...groups.slice(0, rotation)];
  const roster: SelectablePlayer[] = [];
  for (const group of rotated) {
    const candidates = (byGroup.get(group) ?? [])
      .filter((player) => remaining[player.position] > 0)
      .sort((a, b) =>
        b.fantasyPoints === a.fantasyPoints
          ? a.name.localeCompare(b.name)
          : b.fantasyPoints - a.fantasyPoints,
      );
    if (candidates.length === 0) {
      return null;
    }
    const regionPick = candidates.find((player) => missingRegions.has(player.region));
    const pick = regionPick ?? candidates[0];
    roster.push(pick);
    remaining[pick.position] -= 1;
    missingRegions.delete(pick.region);
  }
  return roster;
}

async function createSampleTeams(store: DataStore): Promise<void> {
  if ((await store.listTeams()).length > 0) {
    return;
  }
  const players = await store.listPlayers();
  const groups = [...new Set(players.map((player) => player.worldCupGroup))].sort();

  for (const [index, sample] of SAMPLE_TEAMS.entries()) {
    let roster: SelectablePlayer[] | null = null;
    for (let rotation = index; rotation < index + groups.length; rotation += 1) {
      const candidate = buildSampleRoster(
        players,
        groups,
        sample.formationIndex,
        rotation % groups.length,
      );
      if (
        candidate !== null &&
        validateRoster(
          candidate.map((player) => ({
            playerId: player.id,
            position: player.position,
            worldCupGroup: player.worldCupGroup,
            region: player.region,
          })),
          { groups },
        ).valid
      ) {
        roster = candidate;
        break;
      }
    }
    if (roster === null) {
      console.warn(`[seed] could not assemble a valid roster for ${sample.teamName}`);
      continue;
    }
    await store.createTeam({
      teamName: sample.teamName,
      userName: sample.userName,
      playerIds: roster.map((player) => player.id),
      validationSnapshot: roster.map((player) => ({
        playerId: player.id,
        playerName: player.name,
        position: player.position,
        countryId: player.countryId,
        countryName: player.countryName,
        worldCupGroup: player.worldCupGroup,
        region: player.region,
      })),
      totalPoints: 0,
    });
  }
  await recalculateAllScores(store);
}

/**
 * Seed an empty store by running the fixture-backed import pipeline in
 * dependency order, then creating sample submitted teams so the leaderboard
 * and admin surfaces have data to show.
 */
export async function seedStore(store: DataStore): Promise<void> {
  if ((await store.listCountries()).length > 0) {
    return;
  }
  await runImport(store, "all", null);
  await createSampleTeams(store);
}
