import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Globe2, LandPlot, Link2, Users } from "lucide-react";
import { REGIONS } from "#/domain/regions";
import { SCORING_RULES } from "#/domain/scoring";
import { formatSignedPoints } from "#/lib/format";

export const Route = createFileRoute("/about")({
  component: HowToPlayPage,
});

const RULE_CARDS = [
  {
    icon: Users,
    title: "Twelve players",
    body: "Your roster is exactly 12 — no bench, no transfers, no captain armbands. Every pick plays.",
  },
  {
    icon: LandPlot,
    title: "One per group",
    body: "Exactly one player from each of the 12 World Cup groups. You can't stack a single group, no matter how good it looks.",
  },
  {
    icon: Globe2,
    title: "Every region",
    body: `At least one player from each region: ${REGIONS.join(", ")}.`,
  },
  {
    icon: CalendarClock,
    title: "One legal formation",
    body: "1 GK with either 3-3-5 or 3-4-4 in front. The builder shows your live shape on the pitch.",
  },
] as const;

function HowToPlayPage() {
  return (
    <main className="page-wrap px-4 pt-10 pb-8">
      <header className="rise-in mb-8">
        <p className="kicker m-0">The rules of the programme</p>
        <h1 className="display m-0 mt-2 text-[clamp(2.6rem,7vw,4.6rem)]">How to Play</h1>
        <p className="m-0 mt-3 max-w-2xl text-[0.95rem] text-[var(--ink-soft)]">
          The Twelve is a one-shot fantasy contest for the 2026 World Cup. Build a roster before
          kickoff, then watch it score from real match statistics for the rest of the tournament.
        </p>
      </header>

      <section aria-label="Roster rules" className="rise-in-1 mb-10 grid gap-4 sm:grid-cols-2">
        {RULE_CARDS.map((rule) => (
          <article key={rule.title} className="card p-5">
            <rule.icon size={20} aria-hidden="true" className="text-[var(--pitch)]" />
            <h2 className="display m-0 mt-3 text-2xl tracking-wide">{rule.title}</h2>
            <p className="m-0 mt-1.5 text-sm text-[var(--ink-soft)]">{rule.body}</p>
          </article>
        ))}
      </section>

      <section aria-labelledby="scoring-title" className="rise-in-2 mb-10">
        <h2 id="scoring-title" className="display m-0 text-3xl tracking-wide">
          Scoring
        </h2>
        <p className="m-0 mt-1.5 mb-4 max-w-2xl text-sm text-[var(--ink-soft)]">
          Points come straight from imported match statistics. Clean sheets only count after 60
          minutes played; goalkeeper categories only apply to goalkeepers.
        </p>
        <div className="table-shell">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Statistic</th>
                <th scope="col" className="num">
                  Points
                </th>
                <th scope="col">Who it applies to</th>
              </tr>
            </thead>
            <tbody>
              {SCORING_RULES.map((rule) => (
                <tr key={rule.label}>
                  <td className="font-semibold">{rule.label}</td>
                  <td className={`num points ${rule.pointValue < 0 ? "text-[var(--danger)]" : ""}`}>
                    {formatSignedPoints(rule.pointValue)}
                  </td>
                  <td className="text-[var(--ink-soft)]">
                    {rule.positions === undefined
                      ? "All players"
                      : rule.positions.join(", ") +
                        (rule.requiresMinutes === true ? " · 60+ minutes played" : "")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="edits-title" className="rise-in-3 mb-10 grid gap-4 sm:grid-cols-2">
        <article className="card ticket p-5">
          <Link2 size={20} aria-hidden="true" className="text-[var(--pitch)]" />
          <h2 id="edits-title" className="display m-0 mt-3 text-2xl tracking-wide">
            Your edit link
          </h2>
          <p className="m-0 mt-1.5 text-sm text-[var(--ink-soft)]">
            Submitting a team gives you a private, unguessable edit link — shown exactly once. It's
            the only way to change your roster, and it stops working at kickoff. No account, no
            password, nothing to forget (except the link — don't lose the link).
          </p>
        </article>
        <article className="card ticket p-5">
          <CalendarClock size={20} aria-hidden="true" className="text-[var(--pitch)]" />
          <h2 className="display m-0 mt-3 text-2xl tracking-wide">Key date</h2>
          <p className="m-0 mt-1.5 text-sm text-[var(--ink-soft)]">
            Rosters lock at the opening kickoff:{" "}
            <strong className="mono">11 June 2026, 19:00 UTC</strong>. After that, the leaderboard
            does the talking — scores refresh as match statistics are imported.
          </p>
        </article>
      </section>

      <div className="rise-in-3 flex flex-wrap gap-2">
        <Link to="/" className="btn btn-volt">
          Start building
        </Link>
        <Link to="/leaderboard" className="btn btn-ghost">
          See the standings
        </Link>
      </div>
    </main>
  );
}
