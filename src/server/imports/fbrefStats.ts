import type { DataStore } from "#/server/db/store";
import { writeCacheArtifact } from "./cache";
import { fbrefStatsFixture } from "./fixtures/fbref-stats";
import { withImportRun, type ImportOutcome } from "./importLogger";

/**
 * Import per-player tournament statistics. Rows that cannot be matched to an
 * imported player are logged as warnings and skipped; cached fantasy points
 * are recalculated by the scores service after the run completes.
 */
function loadSource() {
  return fbrefStatsFixture;
}

export async function importFbrefStats(store: DataStore): Promise<ImportOutcome> {
  return withImportRun(store, "fbref_stats", async (context) => {
    const source = loadSource();
    context.setRawCachePath(
      await writeCacheArtifact("fbref-stats", { sourceUrl: source.sourceUrl, content: source }),
    );
    const sourceUpdatedAt = new Date().toISOString();

    for (const row of source.rows) {
      context.counts.seen += 1;

      const country = await store.getCountryByName(row.countryName);
      if (country === null) {
        await context.warn(
          `${row.countryName}/${row.playerName}`,
          `Stats row references country "${row.countryName}" which is not in tournament data.`,
        );
        continue;
      }

      const candidates = await store.listPlayers({
        countryId: country.id,
        q: row.playerName,
        includeInactive: true,
      });
      const player = candidates.find(
        (candidate) => candidate.name.toLowerCase() === row.playerName.toLowerCase(),
      );
      if (player === undefined) {
        await context.warn(
          `${row.countryName}/${row.playerName}`,
          `Stats row could not be matched to an imported player.`,
        );
        continue;
      }

      const existing = await store.getStatsForPlayer(player.id);
      const { created } = await store.upsertStats({
        playerId: player.id,
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
        statsSource: "fbref:fixture-sample",
        sourceUpdatedAt,
        fantasyPoints: existing?.fantasyPoints ?? 0,
        calculatedAt: existing?.calculatedAt ?? sourceUpdatedAt,
      });
      if (created) {
        context.counts.created += 1;
      } else {
        context.counts.updated += 1;
      }
    }
  });
}
