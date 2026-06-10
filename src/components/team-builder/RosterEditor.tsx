import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Formation, SelectablePlayer } from "#/domain/types";
import { FORMATIONS, ROSTER_SIZE, validateRoster } from "#/domain/validation";
import type { BuilderData } from "#/server/fns";
import PlayerPool, { EMPTY_FILTERS, type PoolFilters } from "./PlayerPool";
import RosterPanel from "./RosterPanel";

export interface RosterEditorContext {
  selected: SelectablePlayer[];
  playerIds: string[];
  valid: boolean;
}

interface RosterEditorProps {
  data: BuilderData;
  initialSelected?: SelectablePlayer[];
  /** Renders the action area (submit / save) under the roster panel. */
  renderAction: (context: RosterEditorContext) => ReactNode;
}

function inferFormation(selected: SelectablePlayer[]): Formation {
  const matched = FORMATIONS.find((formation) =>
    (Object.entries(formation.counts) as Array<[SelectablePlayer["position"], number]>).every(
      ([position, count]) =>
        selected.filter((player) => player.position === position).length === count,
    ),
  );
  return matched ?? FORMATIONS[0];
}

/**
 * Shared roster building surface: player pool on one side, the pitch +
 * checklist on the other. Used by both the public builder and the
 * edit-by-token flow so behavior never diverges.
 */
export default function RosterEditor({ data, initialSelected, renderAction }: RosterEditorProps) {
  const [selected, setSelected] = useState<SelectablePlayer[]>(initialSelected ?? []);
  const [formation, setFormation] = useState<Formation>(() =>
    inferFormation(initialSelected ?? []),
  );
  const [filters, setFilters] = useState<PoolFilters>(EMPTY_FILTERS);

  const groupLabels = useMemo(() => data.groups.map((group) => group.label), [data.groups]);
  const selectedIds = useMemo(() => new Set(selected.map((player) => player.id)), [selected]);

  const validation = useMemo(
    () =>
      validateRoster(
        selected.map((player) => ({
          playerId: player.id,
          position: player.position,
          worldCupGroup: player.worldCupGroup,
          region: player.region,
        })),
        { groups: groupLabels },
      ),
    [selected, groupLabels],
  );

  // When the assembled roster matches the *other* legal formation, follow it:
  // a complete valid XII should never show phantom "missing player" slots
  // just because the toggle still points at the previous target.
  useEffect(() => {
    if (validation.formationId !== null && validation.formationId !== formation.id) {
      const matched = FORMATIONS.find((candidate) => candidate.id === validation.formationId);
      if (matched !== undefined) {
        setFormation(matched);
      }
    }
  }, [validation.formationId, formation.id]);

  function addPlayer(player: SelectablePlayer) {
    setSelected((current) =>
      current.length >= ROSTER_SIZE || current.some((entry) => entry.id === player.id)
        ? current
        : [...current, player],
    );
  }

  function removePlayer(playerId: string) {
    setSelected((current) => current.filter((entry) => entry.id !== playerId));
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,430px)]">
      <div id="player-pool" className="rise-in-1 order-2 min-w-0 scroll-mt-20 lg:order-1">
        <PlayerPool
          groups={data.groups}
          players={data.players}
          filters={filters}
          onFiltersChange={setFilters}
          selectedIds={selectedIds}
          groupCounts={validation.groupCounts}
          rosterFull={selected.length >= ROSTER_SIZE}
          onAdd={addPlayer}
          onRemove={removePlayer}
        />
      </div>

      <div
        id="your-xii"
        className="rise-in-2 order-1 flex flex-col gap-4 lg:sticky lg:top-20 lg:order-2"
      >
        <RosterPanel
          selected={selected}
          formation={formation}
          onFormationChange={setFormation}
          validation={validation}
          groups={groupLabels}
          onRemove={removePlayer}
        />
        {renderAction({
          selected,
          playerIds: selected.map((player) => player.id),
          valid: validation.valid,
        })}
      </div>
    </div>
  );
}
