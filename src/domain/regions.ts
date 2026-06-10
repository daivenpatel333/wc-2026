import type { Confederation, Region } from "./types";

/**
 * Product region buckets. Every roster must contain at least one player from
 * each bucket. The list is intentionally not a FIFA confederation list.
 */
export const REGIONS: readonly Region[] = [
  "North/Central America & Caribbean",
  "South America",
  "Europe",
  "Asia",
  "Africa",
];

export const REGION_SHORT_LABELS: Record<Region, string> = {
  "North/Central America & Caribbean": "N/C America & Caribbean",
  "South America": "South America",
  Europe: "Europe",
  Asia: "Asia",
  Africa: "Africa",
};

/**
 * Deterministic confederation-to-bucket mapping. CONCACAF maps to the
 * North/Central America & Caribbean bucket per the accepted product decision.
 * OFC (e.g. New Zealand) is pooled into the Asia bucket so qualified OFC
 * nations stay selectable while the product keeps exactly five buckets; this
 * is a reversible product assumption, change it here if the product decides
 * otherwise.
 */
const REGION_BY_CONFEDERATION: Record<Confederation, Region> = {
  CONCACAF: "North/Central America & Caribbean",
  CONMEBOL: "South America",
  UEFA: "Europe",
  AFC: "Asia",
  OFC: "Asia",
  CAF: "Africa",
};

export function regionForConfederation(confederation: Confederation): Region {
  return REGION_BY_CONFEDERATION[confederation];
}

export function isRegion(value: string): value is Region {
  return (REGIONS as readonly string[]).includes(value);
}
