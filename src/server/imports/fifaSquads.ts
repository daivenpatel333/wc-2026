import { normalizePosition } from "#/domain/positions";
import type { DataStore } from "#/server/db/store";
import { writeCacheArtifact } from "./cache";
import { fifaSquadsFixture } from "./fixtures/fifa-squads";
import { withImportRun, type ImportOutcome } from "./importLogger";

/**
 * Import squad players from the FIFA squad list snapshot. Players whose source
 * position cannot be normalized are recorded as import errors and excluded
 * from the selectable pool.
 */
function loadSource() {
  return fifaSquadsFixture;
}

export async function importFifaSquads(store: DataStore): Promise<ImportOutcome> {
  return withImportRun(store, "fifa_squads", async (context) => {
    const source = loadSource();
    context.setRawCachePath(
      await writeCacheArtifact("fifa-squads", { sourceUrl: source.sourceUrl, content: source }),
    );

    for (const squad of source.squads) {
      const country = await store.getCountryByName(squad.countryName);
      if (country === null) {
        await context.error(
          squad.countryName,
          `Squad country "${squad.countryName}" is not part of the imported tournament countries. Run the FIFA groups import first.`,
        );
        continue;
      }

      for (const player of squad.players) {
        context.counts.seen += 1;
        if (player.name.trim() === "") {
          await context.error(squad.countryName, "Squad row is missing a player name.");
          continue;
        }
        const position = normalizePosition(player.position);
        if (position === null) {
          await context.error(
            `${squad.countryName}/${player.name}`,
            `Position "${player.position}" cannot be normalized to GK/DEF/MID/FWD; player excluded until resolved.`,
          );
          continue;
        }
        const { created } = await store.upsertPlayer({
          name: player.name.trim(),
          countryId: country.id,
          position,
          sourcePosition: player.position,
          sourcePlayerId: null,
          shirtNumber: player.shirt,
          active: true,
        });
        if (created) {
          context.counts.created += 1;
        } else {
          context.counts.updated += 1;
        }
      }
    }
  });
}
