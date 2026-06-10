import { regionForConfederation } from "#/domain/regions";
import type { DataStore } from "#/server/db/store";
import { writeCacheArtifact } from "./cache";
import { fifaGroupsFixture } from "./fixtures/fifa-groups";
import { withImportRun, type ImportOutcome } from "./importLogger";

/**
 * Import World Cup groups and countries. The checked-in fixture snapshot is
 * the manual fallback source; a live FIFA fetch can replace `loadSource` once
 * markup and terms are re-verified.
 */
function loadSource() {
  return fifaGroupsFixture;
}

export async function importFifaGroups(store: DataStore): Promise<ImportOutcome> {
  return withImportRun(store, "fifa_groups", async (context) => {
    const source = loadSource();
    context.setRawCachePath(
      await writeCacheArtifact("fifa-groups", { sourceUrl: source.sourceUrl, content: source }),
    );

    for (const group of source.groups) {
      for (const country of group.countries) {
        context.counts.seen += 1;
        if (country.name.trim() === "") {
          await context.error(country.fifaCode, "Country record is missing a name.");
          continue;
        }
        const region = regionForConfederation(country.confederation);
        const { created } = await store.upsertCountry({
          name: country.name.trim(),
          fifaCode: country.fifaCode || null,
          worldCupGroup: group.label,
          region,
          confederation: country.confederation,
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
