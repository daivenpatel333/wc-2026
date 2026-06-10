import { Link, createFileRoute } from "@tanstack/react-router";
import { Save, ShieldAlert } from "lucide-react";
import { useState } from "react";
import type { SelectablePlayer, Team } from "#/domain/types";
import RosterEditor from "#/components/team-builder/RosterEditor";
import {
  editTeamFn,
  fetchBuilderData,
  verifyEditAccessFn,
  type ActionFailure,
  type BuilderData,
} from "#/server/fns";

export const Route = createFileRoute("/teams/$teamId/edit")({
  validateSearch: (search: Record<string, unknown>): { token: string } => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  loaderDeps: ({ search }) => ({ token: search.token }),
  loader: async ({ params, deps }) => {
    const builder = await fetchBuilderData();
    const access = await verifyEditAccessFn({
      data: { teamId: params.teamId, token: deps.token },
    });
    return { builder, access };
  },
  component: TeamEditPage,
});

/** Rebuild the selected-player list from the submission snapshot. */
function snapshotToSelection(team: Team, builder: BuilderData): SelectablePlayer[] {
  const byId = new Map(builder.players.map((player) => [player.id, player]));
  return team.validationSnapshot.map((entry) => {
    const live = byId.get(entry.playerId);
    if (live !== undefined) {
      return live;
    }
    return {
      id: entry.playerId,
      name: entry.playerName,
      position: entry.position,
      countryId: entry.countryId,
      countryName: entry.countryName,
      countryFifaCode: null,
      worldCupGroup: entry.worldCupGroup,
      region: entry.region,
      shirtNumber: null,
      fantasyPoints: 0,
    };
  });
}

function TeamEditPage() {
  const { builder, access } = Route.useLoaderData();
  const { token } = Route.useSearch();
  const { teamId } = Route.useParams();

  if (!access.ok) {
    return (
      <main className="page-wrap px-4 pt-14 pb-8">
        <div className="card rise-in flex flex-col items-start gap-3 p-8">
          <div className="flex items-center gap-2 text-[var(--danger)]">
            <ShieldAlert size={20} aria-hidden="true" />
            <h1 className="display m-0 text-3xl">Can't open the editor</h1>
          </div>
          <p className="m-0 text-sm text-[var(--ink-soft)]">{access.message}</p>
          <Link to="/teams/$teamId" params={{ teamId }} className="btn btn-ghost">
            View the team instead
          </Link>
        </div>
      </main>
    );
  }

  return <Editor builder={builder} team={access.data.team} token={token} />;
}

function Editor({ builder, team, token }: { builder: BuilderData; team: Team; token: string }) {
  const [teamName, setTeamName] = useState(team.teamName);
  const [userName, setUserName] = useState(team.userName);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<ActionFailure | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <main className="page-wrap-wide px-4 pt-10 pb-8">
      <header className="rise-in mb-7">
        <p className="kicker m-0">Private editor · changes allowed until kickoff</p>
        <h1 className="display m-0 mt-2 text-[clamp(2.4rem,6vw,4rem)]">
          Retooling {team.teamName}
        </h1>
      </header>

      <RosterEditor
        data={builder}
        initialSelected={snapshotToSelection(team, builder)}
        renderAction={({ playerIds, valid }) => (
          <form
            className="card ticket flex flex-col gap-3 p-5"
            onSubmit={(event) => {
              event.preventDefault();
              setSaving(true);
              setFailure(null);
              setSaved(false);
              void editTeamFn({
                data: { teamId: team.id, token, teamName, userName, playerIds },
              })
                .then((response) => {
                  if (response.ok) {
                    setSaved(true);
                  } else {
                    setFailure(response);
                  }
                })
                .catch(() => {
                  setFailure({
                    ok: false,
                    code: "NETWORK",
                    message: "Could not reach the server.",
                  });
                })
                .finally(() => setSaving(false));
            }}
          >
            <h2 className="display m-0 text-2xl tracking-wide">Save changes</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="edit-team-name">
                  Team name
                </label>
                <input
                  id="edit-team-name"
                  className="field-input"
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  maxLength={60}
                  required
                />
              </div>
              <div>
                <label className="field-label" htmlFor="edit-user-name">
                  Your name
                </label>
                <input
                  id="edit-user-name"
                  className="field-input"
                  value={userName}
                  onChange={(event) => setUserName(event.target.value)}
                  maxLength={60}
                  required
                />
              </div>
            </div>
            {failure !== null ? (
              <p className="alert m-0" role="alert">
                {failure.message}
              </p>
            ) : null}
            {saved ? (
              <p className="alert alert-ok m-0" role="status">
                Saved! Your updated XII is live.{" "}
                <Link to="/teams/$teamId" params={{ teamId: team.id }} className="underline">
                  View the team page
                </Link>
                .
              </p>
            ) : null}
            <button type="submit" className="btn btn-volt" disabled={!valid || saving}>
              <Save size={15} aria-hidden="true" />
              {saving ? "Saving…" : "Save roster"}
            </button>
            {!valid ? (
              <p className="m-0 text-center text-[0.74rem] text-[var(--ink-faint)]">
                The checklist must pass before changes can be saved.
              </p>
            ) : null}
          </form>
        )}
      />
    </main>
  );
}
