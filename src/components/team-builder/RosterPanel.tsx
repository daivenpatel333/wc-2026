import type { Formation, RosterValidationResult, SelectablePlayer } from "#/domain/types";
import { FORMATIONS } from "#/domain/validation";
import { formatPoints } from "#/lib/format";
import FormationPitch from "#/components/team/FormationPitch";
import ValidationChecklist from "./ValidationChecklist";

interface RosterPanelProps {
  selected: SelectablePlayer[];
  formation: Formation;
  onFormationChange: (formation: Formation) => void;
  validation: RosterValidationResult;
  groups: readonly string[];
  onRemove: (playerId: string) => void;
}

/**
 * The sticky roster side: target formation toggle, the chalk pitch, live
 * points, and the rule checklist.
 */
export default function RosterPanel({
  selected,
  formation,
  onFormationChange,
  validation,
  groups,
  onRemove,
}: RosterPanelProps) {
  const livePoints = selected.reduce((sum, player) => sum + player.fantasyPoints, 0);

  return (
    <div className="card ticket flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="display m-0 text-2xl tracking-wide">Your XII</h2>
        <div
          role="group"
          aria-label="Target formation"
          className="flex rounded-lg border border-[var(--line-strong)] p-0.5"
        >
          {FORMATIONS.map((option) => {
            const active = option.id === formation.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onFormationChange(option)}
                aria-pressed={active}
                className={`mono cursor-pointer rounded-md border-0 px-2.5 py-1.5 text-[0.7rem] font-bold tracking-wide transition ${
                  active
                    ? "bg-[var(--volt)] text-[var(--volt-ink)]"
                    : "bg-transparent text-[var(--ink-faint)] hover:text-[var(--ink)]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <FormationPitch
        players={selected.map((player) => ({
          playerId: player.id,
          playerName: player.name,
          position: player.position,
          countryName: player.countryName,
          countryFifaCode: player.countryFifaCode,
          shirtNumber: player.shirtNumber,
        }))}
        formation={formation}
        onRemove={onRemove}
        caption="Tap a token to remove a player"
      />

      <div className="flex items-baseline justify-between border-b border-dashed border-[var(--line-strong)] pb-3">
        <span className="kicker">Live fantasy points</span>
        <span className="points text-2xl">{formatPoints(livePoints)}</span>
      </div>

      <ValidationChecklist result={validation} groups={groups} rosterCount={selected.length} />
    </div>
  );
}
