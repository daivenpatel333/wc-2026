import { Link } from "@tanstack/react-router";
import { Copy, Lock, PartyPopper, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SubmitTeamResult } from "#/server/services/teams";
import { submitTeamFn, type ActionFailure } from "#/server/fns";

interface SubmitSectionProps {
  playerIds: string[];
  valid: boolean;
  submissionsOpen: boolean;
  locked: boolean;
}

/**
 * Team name / user name capture and submission. On success the unguessable
 * edit link is revealed exactly once — only its hash lives server-side.
 */
export default function SubmitSection({
  playerIds,
  valid,
  submissionsOpen,
  locked,
}: SubmitSectionProps) {
  const [teamName, setTeamName] = useState("");
  const [userName, setUserName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<ActionFailure | null>(null);
  const [result, setResult] = useState<SubmitTeamResult | null>(null);
  const [copied, setCopied] = useState(false);
  const successHeadingRef = useRef<HTMLHeadingElement | null>(null);

  // The submit button unmounts on success, so move focus to the success
  // heading — otherwise keyboard/screen-reader users are dropped on <body>
  // at the exact moment the one-time edit link appears.
  useEffect(() => {
    if (result !== null) {
      successHeadingRef.current?.focus();
    }
  }, [result]);

  if (result !== null) {
    const editUrl =
      typeof window === "undefined"
        ? result.editPath
        : `${window.location.origin}${result.editPath}`;
    return (
      <div className="card ticket flex flex-col gap-3 p-5" aria-live="polite">
        <div className="flex items-center gap-2.5">
          <PartyPopper size={20} aria-hidden="true" className="text-[var(--volt-strong)]" />
          <h2
            ref={successHeadingRef}
            tabIndex={-1}
            className="display m-0 text-2xl tracking-wide outline-none"
          >
            You're on the team sheet!
          </h2>
        </div>
        <p className="m-0 text-sm text-[var(--ink-soft)]">
          <strong>{result.team.teamName}</strong> has been submitted. Keep this private edit link —
          it is shown only once and lets you change your roster until kickoff:
        </p>
        <div className="flex items-stretch gap-2">
          <code className="mono flex-1 overflow-x-auto rounded-lg border border-[var(--line-strong)] bg-[var(--panel-strong)] px-3 py-2 text-[0.72rem] break-all whitespace-normal">
            {editUrl}
          </code>
          <button
            type="button"
            className="btn btn-ghost shrink-0"
            onClick={() => {
              void navigator.clipboard.writeText(editUrl).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            }}
          >
            <Copy size={14} aria-hidden="true" />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="mt-1 flex flex-wrap gap-2">
          <Link to="/teams/$teamId" params={{ teamId: result.team.id }} className="btn btn-volt">
            View your team
          </Link>
          <Link to="/leaderboard" className="btn btn-ghost">
            See the leaderboard
          </Link>
        </div>
      </div>
    );
  }

  if (!submissionsOpen) {
    return (
      <div className="card flex items-center gap-3 p-5 text-sm text-[var(--ink-soft)]">
        <Lock size={16} aria-hidden="true" />
        {locked
          ? "The tournament has kicked off — submissions are locked. Enjoy the matches!"
          : "Public submissions are currently disabled."}
      </div>
    );
  }

  return (
    <form
      className="card ticket flex flex-col gap-3 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitting(true);
        setFailure(null);
        void submitTeamFn({ data: { teamName, userName, playerIds } })
          .then((response) => {
            if (response.ok) {
              setResult(response.data);
            } else {
              setFailure(response);
            }
          })
          .catch(() => {
            setFailure({ ok: false, code: "NETWORK", message: "Could not reach the server." });
          })
          .finally(() => setSubmitting(false));
      }}
    >
      <h2 className="display m-0 text-2xl tracking-wide">Submit your XII</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="team-name">
            Team name
          </label>
          <input
            id="team-name"
            className="field-input"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            placeholder="Volt Strikers"
            maxLength={60}
            required
          />
        </div>
        <div>
          <label className="field-label" htmlFor="user-name">
            Your name
          </label>
          <input
            id="user-name"
            className="field-input"
            value={userName}
            onChange={(event) => setUserName(event.target.value)}
            placeholder="Shown on the leaderboard"
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
      <button
        type="submit"
        className="btn btn-volt"
        disabled={!valid || submitting || teamName.trim() === "" || userName.trim() === ""}
      >
        <Send size={15} aria-hidden="true" />
        {submitting ? "Submitting…" : "Submit team"}
      </button>
      {!valid ? (
        <p className="m-0 text-center text-[0.74rem] text-[var(--ink-faint)]">
          Complete every rule on the checklist to unlock submission.
        </p>
      ) : null}
    </form>
  );
}
