import { REGIONS } from "./regions";
import type {
  Formation,
  FantasyPosition,
  PositionCounts,
  Region,
  RosterSnapshotEntry,
  RosterValidationResult,
  ValidationIssue,
} from "./types";

export const ROSTER_SIZE = 12;

export const FORMATIONS: readonly Formation[] = [
  { id: "1-3-3-5", label: "1-3-3-5", counts: { GK: 1, DEF: 3, MID: 3, FWD: 5 } },
  { id: "1-3-4-4", label: "1-3-4-4", counts: { GK: 1, DEF: 3, MID: 4, FWD: 4 } },
];

/** The roster fields validation needs; satisfied by snapshots and live players. */
export type RosterEntry = Pick<
  RosterSnapshotEntry,
  "playerId" | "position" | "worldCupGroup" | "region"
>;

export interface RosterRuleContext {
  /** Group labels derived from imported tournament data — never hard-coded. */
  groups: readonly string[];
}

export function countPositions(roster: readonly RosterEntry[]): PositionCounts {
  const counts: PositionCounts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const entry of roster) {
    counts[entry.position] += 1;
  }
  return counts;
}

export function describeFormation(counts: PositionCounts): string {
  return `${counts.GK} GK, ${counts.DEF} DEF, ${counts.MID} MID, ${counts.FWD} FWD`;
}

export function matchFormation(counts: PositionCounts): Formation | null {
  return (
    FORMATIONS.find((formation) =>
      (Object.keys(formation.counts) as FantasyPosition[]).every(
        (position) => formation.counts[position] === counts[position],
      ),
    ) ?? null
  );
}

const FORMATION_CHOICES = FORMATIONS.map((formation) => formation.label).join(" or ");

/**
 * Validate a roster against every fantasy rule: exact size, one player per
 * imported World Cup group, region bucket coverage, and a legal formation.
 *
 * The same function runs in the browser (live checklist) and on the server
 * (submission/edit), so the two can never drift apart.
 */
export function validateRoster(
  roster: readonly RosterEntry[],
  context: RosterRuleContext,
): RosterValidationResult {
  const issues: ValidationIssue[] = [];

  const seen = new Set<string>();
  for (const entry of roster) {
    if (seen.has(entry.playerId)) {
      issues.push({
        code: "DUPLICATE_PLAYER",
        message: "Each player can only be selected once.",
        subject: entry.playerId,
      });
    }
    seen.add(entry.playerId);
  }

  if (roster.length !== ROSTER_SIZE) {
    issues.push({
      code: "ROSTER_SIZE",
      message: `Select exactly ${ROSTER_SIZE} players. You currently have ${roster.length}.`,
    });
  }

  const groupCounts = new Map<string, number>();
  for (const group of context.groups) {
    groupCounts.set(group, 0);
  }
  for (const entry of roster) {
    if (!groupCounts.has(entry.worldCupGroup)) {
      issues.push({
        code: "UNKNOWN_GROUP",
        message: `Group ${entry.worldCupGroup} is not part of the imported tournament data.`,
        subject: entry.worldCupGroup,
      });
      continue;
    }
    groupCounts.set(entry.worldCupGroup, (groupCounts.get(entry.worldCupGroup) ?? 0) + 1);
  }
  for (const group of context.groups) {
    const count = groupCounts.get(group) ?? 0;
    if (count === 0) {
      issues.push({
        code: "GROUP_MISSING",
        message: `Group ${group} is missing a player.`,
        subject: group,
      });
    } else if (count > 1) {
      issues.push({
        code: "GROUP_OVERFLOW",
        message: `Only one player can be selected from Group ${group}.`,
        subject: group,
      });
    }
  }

  const regionCounts = new Map<Region, number>();
  for (const region of REGIONS) {
    regionCounts.set(region, 0);
  }
  for (const entry of roster) {
    regionCounts.set(entry.region, (regionCounts.get(entry.region) ?? 0) + 1);
  }
  for (const region of REGIONS) {
    if ((regionCounts.get(region) ?? 0) === 0) {
      issues.push({
        code: "REGION_MISSING",
        message: `Add at least one player from ${region === "North/Central America & Caribbean" ? "North/Central America & the Caribbean" : region}.`,
        subject: region,
      });
    }
  }

  const positionCounts = countPositions(roster);
  const formation = matchFormation(positionCounts);
  if (formation === null) {
    issues.push({
      code: "INVALID_FORMATION",
      message: `Current formation is ${describeFormation(positionCounts)}. Choose ${FORMATION_CHOICES}.`,
    });
  }

  return {
    valid: issues.length === 0,
    issues,
    positionCounts,
    formationId: formation?.id ?? null,
    groupCounts,
    regionCounts,
  };
}
