import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { Lock, LockOpen, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { Team } from "#/domain/types";
import { formatDateTime, formatPoints } from "#/lib/format";
import { adminDeleteTeamFn, adminUpdateTeamFn } from "#/server/fns";
import { adminTeamsFn } from "#/server/fns";

export const Route = createFileRoute("/admin/teams")({
  loader: () => adminTeamsFn(),
  component: AdminTeamsPage,
});

function EditRow({ team, onDone }: { team: Team; onDone: () => void }) {
  const [teamName, setTeamName] = useState(team.teamName);
  const [userName, setUserName] = useState(team.userName);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-wrap items-end gap-3 border-t border-dashed border-[var(--line)] bg-[var(--panel-strong)] px-4 py-3"
      onSubmit={(event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        void adminUpdateTeamFn({ data: { teamId: team.id, teamName, userName } })
          .then((response) => {
            if (response.ok) {
              onDone();
            } else {
              setError(response.message);
            }
          })
          .finally(() => setPending(false));
      }}
    >
      <div className="min-w-44 flex-1">
        <label className="field-label" htmlFor={`team-name-${team.id}`}>
          Team name
        </label>
        <input
          id={`team-name-${team.id}`}
          className="field-input"
          value={teamName}
          onChange={(event) => setTeamName(event.target.value)}
          maxLength={60}
          required
        />
      </div>
      <div className="min-w-44 flex-1">
        <label className="field-label" htmlFor={`user-name-${team.id}`}>
          User name
        </label>
        <input
          id={`user-name-${team.id}`}
          className="field-input"
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
          maxLength={60}
          required
        />
      </div>
      <button type="submit" className="btn btn-volt btn-sm" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onDone}>
        <X size={13} aria-hidden="true" />
        Cancel
      </button>
      {error !== null ? (
        <p className="alert m-0 w-full" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function AdminTeamsPage() {
  const teams = Route.useLoaderData();
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    setEditingId(null);
    void router.invalidate();
  }

  async function toggleLock(team: Team) {
    setBusyId(team.id);
    setError(null);
    try {
      const response = await adminUpdateTeamFn({
        data: { teamId: team.id, locked: team.lockedAt === null },
      });
      if (!response.ok) {
        setError(response.message);
      }
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusyId(null);
      refresh();
    }
  }

  async function remove(team: Team) {
    if (!window.confirm(`Delete "${team.teamName}" by ${team.userName}? This cannot be undone.`)) {
      return;
    }
    setBusyId(team.id);
    setError(null);
    try {
      const response = await adminDeleteTeamFn({ data: { teamId: team.id } });
      if (!response.ok) {
        setError(response.message);
      }
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusyId(null);
      refresh();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-baseline justify-between">
        <h1 className="display m-0 text-3xl tracking-wide">Teams</h1>
        <span className="kicker">{teams.length} submitted</span>
      </header>

      {error !== null ? (
        <p className="alert m-0" role="alert">
          {error}
        </p>
      ) : null}

      <div className="card overflow-hidden">
        {teams.length === 0 ? (
          <p className="m-0 p-6 text-sm text-[var(--ink-faint)]">No teams submitted yet.</p>
        ) : (
          <ul className="m-0 list-none p-0">
            {teams.map((team) => (
              <li key={team.id} className="border-b border-[var(--line)] last:border-b-0">
                <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/teams/$teamId"
                      params={{ teamId: team.id }}
                      className="display block truncate text-xl tracking-wide hover:text-[var(--pitch)]"
                    >
                      {team.teamName}
                    </Link>
                    <span className="kicker">
                      {team.userName} · {formatDateTime(team.createdAt)}
                    </span>
                  </div>
                  {team.lockedAt !== null ? (
                    <span className="chip">
                      <Lock size={12} aria-hidden="true" />
                      locked
                    </span>
                  ) : null}
                  <span className="points text-xl">{formatPoints(team.totalPoints)}</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditingId(editingId === team.id ? null : team.id)}
                      aria-label={`Edit ${team.teamName}`}
                      aria-expanded={editingId === team.id}
                    >
                      <Pencil size={13} aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => void toggleLock(team)}
                      disabled={busyId === team.id}
                      aria-label={
                        team.lockedAt === null ? `Lock ${team.teamName}` : `Unlock ${team.teamName}`
                      }
                    >
                      {team.lockedAt === null ? (
                        <Lock size={13} aria-hidden="true" />
                      ) : (
                        <LockOpen size={13} aria-hidden="true" />
                      )}
                      {team.lockedAt === null ? "Lock" : "Unlock"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => void remove(team)}
                      disabled={busyId === team.id}
                      aria-label={`Delete ${team.teamName}`}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </div>
                {editingId === team.id ? <EditRow team={team} onDone={refresh} /> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
