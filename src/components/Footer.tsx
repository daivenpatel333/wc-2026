import { Link } from "@tanstack/react-router";

export default function Footer() {
  return (
    <footer className="site-footer mt-20 px-4 pt-8 pb-10 text-[var(--ink-soft)]">
      <div className="page-wrap-wide flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="display m-0 text-2xl text-[var(--ink)]">The Twelve</p>
          <p className="m-0 mt-1 max-w-md text-sm">
            An unofficial FIFA World Cup 2026 fantasy programme. Twelve players, one per group,
            every region represented.
          </p>
        </div>
        <div className="flex flex-col gap-1 text-sm sm:items-end">
          <p className="kicker m-0">Rosters lock at first kickoff</p>
          <p className="mono m-0 text-[var(--ink)]">11 June 2026 · 19:00 UTC</p>
          <div className="mt-2 flex gap-4">
            <Link to="/leaderboard" className="nav-link">
              Standings
            </Link>
            <Link to="/about" className="nav-link">
              Rules
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
