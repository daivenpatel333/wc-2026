import { Check, Plus, Search } from "lucide-react";
import { useMemo } from "react";
import { FANTASY_POSITIONS } from "#/domain/positions";
import { REGIONS } from "#/domain/regions";
import type { SelectablePlayer, TournamentGroup } from "#/domain/types";
import { formatPoints } from "#/lib/format";
import PositionBadge from "#/components/ui/PositionBadge";

export interface PoolFilters {
  q: string;
  group: string;
  countryId: string;
  position: string;
  region: string;
}

export const EMPTY_FILTERS: PoolFilters = {
  q: "",
  group: "",
  countryId: "",
  position: "",
  region: "",
};

interface PlayerPoolProps {
  groups: TournamentGroup[];
  players: SelectablePlayer[];
  filters: PoolFilters;
  onFiltersChange: (filters: PoolFilters) => void;
  selectedIds: ReadonlySet<string>;
  groupCounts: ReadonlyMap<string, number>;
  rosterFull: boolean;
  onAdd: (player: SelectablePlayer) => void;
  onRemove: (playerId: string) => void;
}

export function filterPlayers(
  players: SelectablePlayer[],
  filters: PoolFilters,
): SelectablePlayer[] {
  const query = filters.q.trim().toLowerCase();
  return players.filter((player) => {
    if (query !== "" && !player.name.toLowerCase().includes(query)) {
      return false;
    }
    if (filters.group !== "" && player.worldCupGroup !== filters.group) {
      return false;
    }
    if (filters.countryId !== "" && player.countryId !== filters.countryId) {
      return false;
    }
    if (filters.position !== "" && player.position !== filters.position) {
      return false;
    }
    if (filters.region !== "" && player.region !== filters.region) {
      return false;
    }
    return true;
  });
}

/**
 * Browsable player pool: groups -> countries -> players, with search and
 * filter controls.
 */
export default function PlayerPool({
  groups,
  players,
  filters,
  onFiltersChange,
  selectedIds,
  groupCounts,
  rosterFull,
  onAdd,
  onRemove,
}: PlayerPoolProps) {
  const visible = useMemo(() => filterPlayers(players, filters), [players, filters]);

  const countryOptions = useMemo(() => {
    const relevant =
      filters.group === ""
        ? groups.flatMap((group) => group.countries)
        : (groups.find((group) => group.label === filters.group)?.countries ?? []);
    return [...relevant].sort((a, b) => a.name.localeCompare(b.name));
  }, [groups, filters.group]);

  const sections = useMemo(() => {
    const byGroup = new Map<string, Map<string, SelectablePlayer[]>>();
    for (const player of visible) {
      const countryMapForGroup = byGroup.get(player.worldCupGroup) ?? new Map();
      const list = countryMapForGroup.get(player.countryName) ?? [];
      list.push(player);
      countryMapForGroup.set(player.countryName, list);
      byGroup.set(player.worldCupGroup, countryMapForGroup);
    }
    return [...byGroup.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, countryMap]) => ({
        label,
        countries: [...countryMap.entries()].sort(([a], [b]) => a.localeCompare(b)),
      }));
  }, [visible]);

  function update(partial: Partial<PoolFilters>) {
    onFiltersChange({ ...filters, ...partial });
  }

  return (
    <section aria-label="Player pool" className="flex min-w-0 flex-col gap-4">
      <div className="card p-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))]">
          <div className="col-span-2 md:col-span-1">
            <label className="field-label" htmlFor="pool-search">
              Search players
            </label>
            <div className="relative">
              <Search
                size={15}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--ink-faint)]"
              />
              <input
                id="pool-search"
                type="search"
                className="field-input pl-9"
                placeholder="Name…"
                value={filters.q}
                onChange={(event) => update({ q: event.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="pool-group">
              Group
            </label>
            <select
              id="pool-group"
              className="field-select"
              value={filters.group}
              onChange={(event) => update({ group: event.target.value, countryId: "" })}
            >
              <option value="">All</option>
              {groups.map((group) => (
                <option key={group.label} value={group.label}>
                  Group {group.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="pool-country">
              Country
            </label>
            <select
              id="pool-country"
              className="field-select"
              value={filters.countryId}
              onChange={(event) => update({ countryId: event.target.value })}
            >
              <option value="">All</option>
              {countryOptions.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="pool-position">
              Position
            </label>
            <select
              id="pool-position"
              className="field-select"
              value={filters.position}
              onChange={(event) => update({ position: event.target.value })}
            >
              <option value="">All</option>
              {FANTASY_POSITIONS.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="pool-region">
              Region
            </label>
            <select
              id="pool-region"
              className="field-select"
              value={filters.region}
              onChange={(event) => update({ region: event.target.value })}
            >
              <option value="">All</option>
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="kicker m-0 mt-3" role="status">
          {visible.length} of {players.length} players shown
        </p>
      </div>

      {sections.length === 0 ? (
        <div className="card-flat p-8 text-center text-sm text-[var(--ink-soft)]">
          No players match these filters. Try clearing the search or widening a filter.
        </div>
      ) : (
        sections.map((section) => {
          const taken = (groupCounts.get(section.label) ?? 0) > 0;
          return (
            <section
              key={section.label}
              aria-label={`Group ${section.label}`}
              className="card-flat overflow-hidden"
            >
              <header className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--panel-strong)] px-4 py-2.5">
                <span className="group-tag" aria-hidden="true">
                  {section.label}
                </span>
                <h3 className="display m-0 text-lg tracking-wide">Group {section.label}</h3>
                <span className={`chip ml-auto ${taken ? "chip-volt" : ""}`}>
                  {taken ? "✓ pick made" : "needs 1 pick"}
                </span>
              </header>
              {section.countries.map(([countryName, countryPlayers]) => (
                <div key={countryName}>
                  <div className="flex items-baseline gap-2 border-b border-dashed border-[var(--line)] px-4 pt-3 pb-1.5">
                    <span className="mono text-[0.66rem] font-bold tracking-[0.18em] text-[var(--ink-faint)] uppercase">
                      {countryPlayers[0].countryFifaCode ?? ""}
                    </span>
                    <h4 className="m-0 text-sm font-bold">{countryName}</h4>
                    <span className="kicker">{countryPlayers[0].region}</span>
                  </div>
                  <ul className="m-0 list-none p-0">
                    {countryPlayers.map((player) => {
                      const selected = selectedIds.has(player.id);
                      return (
                        <li
                          key={player.id}
                          className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-2 last:border-b-0 hover:bg-[var(--volt-soft)]"
                        >
                          <PositionBadge position={player.position} />
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                            {player.name}
                            {player.shirtNumber !== null ? (
                              <span className="mono ml-1.5 text-[0.7rem] text-[var(--ink-faint)]">
                                #{player.shirtNumber}
                              </span>
                            ) : null}
                          </span>
                          <span className="points hidden text-sm sm:inline" title="Fantasy points">
                            {formatPoints(player.fantasyPoints)}
                          </span>
                          {selected ? (
                            <button
                              type="button"
                              className="btn btn-volt btn-sm"
                              onClick={() => onRemove(player.id)}
                              aria-label={`Remove ${player.name} from roster`}
                            >
                              <Check size={14} aria-hidden="true" />
                              In XII
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => onAdd(player)}
                              disabled={rosterFull}
                              aria-label={`Add ${player.name} to roster`}
                            >
                              <Plus size={14} aria-hidden="true" />
                              Add
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </section>
          );
        })
      )}
    </section>
  );
}
