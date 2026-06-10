import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { formatCountdown } from "#/lib/format";
import RosterEditor from "#/components/team-builder/RosterEditor";
import SubmitSection from "#/components/team-builder/SubmitSection";
import { fetchBuilderData } from "#/server/fns";

export const Route = createFileRoute("/")({
  loader: () => fetchBuilderData(),
  component: TeamBuilderPage,
});

function TeamBuilderPage() {
  const data = Route.useLoaderData();
  // Countdown is client-only: computing it during SSR would hydrate against
  // a different clock and mismatch. The static lock date renders first.
  const [countdown, setCountdown] = useState<string | null>(null);
  useEffect(() => {
    const update = () => setCountdown(formatCountdown(data.lockAt));
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [data.lockAt]);

  return (
    <main className="page-wrap-wide px-4 pt-10 pb-8">
      <section className="rise-in relative mb-8 overflow-hidden">
        <p className="kicker m-0">Official unofficial fantasy programme · 48 nations · 12 groups</p>
        <h1 className="display m-0 mt-2 text-[clamp(2.8rem,8vw,5.5rem)]">
          Pick your <span className="text-[var(--pitch)]">twelve</span>.
        </h1>
        <p className="m-0 mt-3 max-w-2xl text-[0.95rem] text-[var(--ink-soft)]">
          One player from every World Cup group. Every region of the football world represented. One
          legal formation. Build it, name it, and defend it on the leaderboard all tournament long.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {data.locked ? (
            <span className="chip">
              <Timer size={13} aria-hidden="true" />
              Rosters are locked
            </span>
          ) : (
            <span className="chip chip-volt">
              <Timer size={13} aria-hidden="true" />
              {countdown !== null ? `Rosters lock in ${countdown}` : "Rosters lock at kickoff"}
            </span>
          )}
          <span className="chip">Formations: 1-3-3-5 · 1-3-4-4</span>
          <a
            href="#player-pool"
            className="chip transition hover:border-[var(--line-strong)] lg:hidden"
          >
            <ArrowDown size={13} aria-hidden="true" />
            Browse the player pool
          </a>
        </div>
      </section>

      <RosterEditor
        data={data}
        renderAction={({ playerIds, valid }) => (
          <SubmitSection
            playerIds={playerIds}
            valid={valid}
            submissionsOpen={data.submissionsOpen}
            locked={data.locked}
          />
        )}
      />
    </main>
  );
}
