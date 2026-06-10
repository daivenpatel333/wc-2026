import type { TournamentGroup } from "#/domain/types";
import type { DataStore } from "#/server/db/store";

/**
 * Tournament structure derived from imported data. Group labels are never
 * hard-coded; whatever the groups import produced is what validation and
 * the UI use.
 */
export async function getTournamentGroups(store: DataStore): Promise<TournamentGroup[]> {
  const countries = await store.listCountries();
  const byLabel = new Map<string, TournamentGroup>();
  for (const country of countries) {
    const group = byLabel.get(country.worldCupGroup) ?? {
      label: country.worldCupGroup,
      countries: [],
    };
    group.countries.push(country);
    byLabel.set(country.worldCupGroup, group);
  }
  return [...byLabel.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export async function getGroupLabels(store: DataStore): Promise<string[]> {
  const groups = await getTournamentGroups(store);
  return groups.map((group) => group.label);
}
