import { fifaSquadsFixture } from "./fifa-squads";

/**
 * Development sample of FBref-style match statistics.
 *
 * The real tournament has not produced stats at seed time, so this fixture
 * derives a deterministic, clearly-labeled sample stat line for every squad
 * player. It exists to exercise scoring, leaderboard sorting, and breakdown
 * displays end to end; a live fbref_stats import replaces it in production.
 */

export interface FbrefStatsRow {
  playerName: string;
  countryName: string;
  position: string;
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
}

export interface FbrefStatsFixture {
  sourceUrl: string;
  note: string;
  rows: FbrefStatsRow[];
}

/** Small deterministic hash so sample stats are stable across runs. */
function hashString(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick(seed: number, salt: number, max: number): number {
  return hashString(`${seed}:${salt}`) % (max + 1);
}

function isGoalkeeper(position: string): boolean {
  const normalized = position.trim().toLowerCase();
  return normalized === "gk" || normalized === "goalkeeper";
}

function isDefender(position: string): boolean {
  const normalized = position.trim().toLowerCase();
  return normalized === "df" || normalized.includes("def") || normalized.includes("back");
}

function buildRows(): FbrefStatsRow[] {
  const rows: FbrefStatsRow[] = [];
  for (const squad of fifaSquadsFixture.squads) {
    for (const player of squad.players) {
      const seed = hashString(`${squad.countryName}|${player.name}`);
      const goalkeeper = isGoalkeeper(player.position);
      const defender = isDefender(player.position);
      const attacker = !goalkeeper && !defender;
      const minutesPlayed = 45 + pick(seed, 1, 225); // 45..270 across three group games

      rows.push({
        playerName: player.name,
        countryName: squad.countryName,
        position: player.position,
        goals: attacker ? pick(seed, 2, 3) : defender ? pick(seed, 2, 1) : 0,
        assists: goalkeeper ? 0 : pick(seed, 3, 2),
        shots: goalkeeper ? 0 : pick(seed, 4, attacker ? 9 : 4),
        tacklesWon: goalkeeper ? 0 : pick(seed, 5, defender ? 8 : 5),
        interceptions: goalkeeper ? pick(seed, 6, 1) : pick(seed, 6, defender ? 7 : 4),
        yellowCards: pick(seed, 7, 10) > 8 ? 1 : 0,
        redCards: pick(seed, 8, 40) > 39 ? 1 : 0,
        penaltyMisses: attacker && pick(seed, 9, 20) > 19 ? 1 : 0,
        minutesPlayed,
        saves: goalkeeper ? 3 + pick(seed, 10, 9) : 0,
        goalsAgainst: goalkeeper ? pick(seed, 11, 4) : 0,
        cleanSheets: minutesPlayed >= 60 ? pick(seed, 12, goalkeeper || defender ? 2 : 1) : 0,
        penaltySaves: goalkeeper && pick(seed, 13, 10) > 9 ? 1 : 0,
      });
    }
  }
  return rows;
}

export const fbrefStatsFixture: FbrefStatsFixture = {
  sourceUrl: "https://fbref.com/en/",
  note: "Deterministic development sample derived from the squad fixture; replaced by live FBref imports once the tournament produces real statistics.",
  rows: buildRows(),
};
