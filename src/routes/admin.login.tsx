import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="page-wrap flex min-h-[60vh] items-center justify-center px-4 py-14">
      <form
        className="card ticket w-full max-w-sm rise-in flex flex-col gap-4 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          setPending(true);
          setError(null);
          void authClient.signIn
            .email({ email, password })
            .then((response) => {
              if (response.error) {
                setError("Sign-in failed. Check the email and password.");
                return;
              }
              void router.invalidate();
              void navigate({ to: "/admin" });
            })
            .catch(() => setError("Sign-in failed. Check the email and password."))
            .finally(() => setPending(false));
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--volt)] text-[var(--volt-ink)]">
            <KeyRound size={17} aria-hidden="true" />
          </span>
          <div>
            <h1 className="display m-0 text-2xl tracking-wide">Control Room</h1>
            <p className="kicker m-0">Admin access only</p>
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="admin-email">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            className="field-input"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div>
          <label className="field-label" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            className="field-input"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error !== null ? (
          <p className="alert m-0" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn-volt" disabled={pending}>
          {pending ? "Checking…" : "Sign in"}
        </button>

        {import.meta.env.DEV ? (
          <p className="m-0 text-center text-[0.72rem] text-[var(--ink-faint)]">
            Dev default: <span className="mono">admin@wc2026.local</span> /{" "}
            <span className="mono">WC2026Admin!</span>
          </p>
        ) : null}
      </form>
    </main>
  );
}
