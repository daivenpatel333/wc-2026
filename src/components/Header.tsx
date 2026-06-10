import { Link } from "@tanstack/react-router";
import { ShieldHalf } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="site-header px-4">
      <nav
        aria-label="Main"
        className="page-wrap-wide flex flex-wrap items-center gap-x-5 gap-y-2 py-3"
      >
        <Link to="/" className="group flex flex-shrink-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="display flex h-9 w-9 items-center justify-center rounded-md bg-[var(--volt)] text-lg text-[var(--volt-ink)] shadow-[0_8px_20px_-8px_var(--volt-strong)] transition group-hover:-rotate-3"
          >
            XII
          </span>
          <span className="leading-none">
            <span className="display block text-xl tracking-wide">The Twelve</span>
            <span className="kicker block pt-1">WC 2026 Fantasy Programme</span>
          </span>
        </Link>

        <div className="order-3 flex w-full items-center gap-x-5 gap-y-1 overflow-x-auto pb-1 sm:order-none sm:ml-6 sm:w-auto sm:pb-0">
          <Link
            to="/"
            className="nav-link"
            activeOptions={{ exact: true }}
            activeProps={{ className: "nav-link is-active" }}
          >
            Team Builder
          </Link>
          <Link
            to="/leaderboard"
            className="nav-link"
            activeProps={{ className: "nav-link is-active" }}
          >
            Leaderboard
          </Link>
          <Link to="/about" className="nav-link" activeProps={{ className: "nav-link is-active" }}>
            How to Play
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/admin"
            aria-label="Admin dashboard"
            title="Admin dashboard"
            className="rounded-md p-2 text-[var(--ink-faint)] transition hover:bg-[var(--panel-strong)] hover:text-[var(--ink)]"
          >
            <ShieldHalf size={16} aria-hidden="true" />
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
