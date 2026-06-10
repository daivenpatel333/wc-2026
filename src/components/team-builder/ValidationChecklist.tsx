import { Check, X } from "lucide-react";
import { REGIONS, REGION_SHORT_LABELS } from "#/domain/regions";
import type { RosterValidationResult } from "#/domain/types";
import { ROSTER_SIZE, describeFormation } from "#/domain/validation";

interface ValidationChecklistProps {
  result: RosterValidationResult;
  groups: readonly string[];
  rosterCount: number;
}

function RuleIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <Check size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--ok)]" />
  ) : (
    <X size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--ink-faint)]" />
  );
}

/**
 * Live rule checklist mirroring server-side validation exactly — both run
 * the same validateRoster() from the domain layer.
 */
export default function ValidationChecklist({
  result,
  groups,
  rosterCount,
}: ValidationChecklistProps) {
  const sizeOk = rosterCount === ROSTER_SIZE;
  const groupsOk = !result.issues.some(
    (issue) => issue.code === "GROUP_MISSING" || issue.code === "GROUP_OVERFLOW",
  );
  const regionsOk = !result.issues.some((issue) => issue.code === "REGION_MISSING");
  const formationOk = result.formationId !== null;

  return (
    <div aria-live="polite">
      <div className="rule-row" data-testid="rule-size">
        <RuleIcon ok={sizeOk} />
        <div className="flex-1">
          <span className={sizeOk ? "rule-ok font-semibold" : "font-semibold"}>
            Exactly {ROSTER_SIZE} players
          </span>
          <span className="points float-right">
            {rosterCount}/{ROSTER_SIZE}
          </span>
        </div>
      </div>

      <div className="rule-row" data-testid="rule-groups">
        <RuleIcon ok={groupsOk && rosterCount > 0} />
        <div className="flex-1">
          <span className={groupsOk && rosterCount > 0 ? "rule-ok font-semibold" : "font-semibold"}>
            One player per group
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1" aria-hidden="true">
            {groups.map((group) => {
              const count = result.groupCounts.get(group) ?? 0;
              const state =
                count === 1
                  ? "border-transparent bg-[var(--volt)] text-[var(--volt-ink)]"
                  : count > 1
                    ? "border-transparent bg-[var(--danger)] text-[var(--paper)]"
                    : "border-[var(--line)] text-[var(--ink-faint)]";
              return (
                <span
                  key={group}
                  className={`mono flex h-5.5 w-5.5 items-center justify-center rounded border text-[0.68rem] font-bold ${state}`}
                  title={`Group ${group}: ${count} selected`}
                >
                  {group}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rule-row" data-testid="rule-regions">
        <RuleIcon ok={regionsOk && rosterCount > 0} />
        <div className="flex-1">
          <span
            className={regionsOk && rosterCount > 0 ? "rule-ok font-semibold" : "font-semibold"}
          >
            Every region represented
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {REGIONS.map((region) => {
              const covered = (result.regionCounts.get(region) ?? 0) > 0;
              return (
                <span
                  key={region}
                  className={`chip ${covered ? "chip-volt" : ""} !py-0.5 !text-[0.66rem]`}
                  title={`${region}: ${result.regionCounts.get(region) ?? 0} selected`}
                >
                  {covered ? "✓ " : ""}
                  {REGION_SHORT_LABELS[region]}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rule-row" data-testid="rule-formation">
        <RuleIcon ok={formationOk} />
        <div className="flex-1">
          <span className={formationOk ? "rule-ok font-semibold" : "font-semibold"}>
            Formation 1-3-3-5 or 1-3-4-4
          </span>
          <span className="mono float-right text-[0.7rem] text-[var(--ink-faint)]">
            {describeFormation(result.positionCounts)}
          </span>
        </div>
      </div>

      {result.issues.length > 0 && rosterCount > 0 ? (
        <ul className="m-0 mt-3 flex list-none flex-col gap-1 p-0 text-[0.78rem] text-[var(--ink-soft)]">
          {result.issues.slice(0, 4).map((issue) => (
            <li key={`${issue.code}-${issue.subject ?? ""}`} className="flex gap-1.5">
              <span aria-hidden="true" className="text-[var(--danger)]">
                •
              </span>
              {issue.message}
            </li>
          ))}
          {result.issues.length > 4 ? (
            <li className="text-[var(--ink-faint)]">…and {result.issues.length - 4} more.</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
