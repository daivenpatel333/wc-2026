import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { LogOut, ShieldHalf } from "lucide-react";
import { authClient } from "#/lib/auth-client";
import { adminSessionFn } from "#/server/fns";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const admin = await adminSessionFn();
    const onLoginPage = location.pathname.startsWith("/admin/login");
    if (admin === null && !onLoginPage) {
      throw redirect({ to: "/admin/login" });
    }
    if (admin !== null && onLoginPage) {
      throw redirect({ to: "/admin" });
    }
    return { admin };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { admin } = Route.useRouteContext();
  const router = useRouter();
  const navigate = useNavigate();

  if (admin === null) {
    return <Outlet />;
  }

  return (
    <main className="page-wrap-wide px-4 pt-8 pb-8">
      <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-[var(--line)] pb-4">
        <p className="display m-0 flex items-center gap-2 text-2xl tracking-wide">
          <ShieldHalf size={20} aria-hidden="true" className="text-[var(--pitch)]" />
          Control Room
        </p>
        <nav aria-label="Admin" className="flex items-center gap-4 overflow-x-auto">
          <Link
            to="/admin"
            className="nav-link"
            activeOptions={{ exact: true }}
            activeProps={{ className: "nav-link is-active" }}
          >
            Overview
          </Link>
          <Link
            to="/admin/teams"
            className="nav-link"
            activeProps={{ className: "nav-link is-active" }}
          >
            Teams
          </Link>
          <Link
            to="/admin/scores"
            className="nav-link"
            activeProps={{ className: "nav-link is-active" }}
          >
            Scores
          </Link>
          <Link
            to="/admin/imports"
            className="nav-link"
            activeProps={{ className: "nav-link is-active" }}
          >
            Imports
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="kicker">{admin.email}</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              void authClient.signOut().then(() => {
                void router.invalidate();
                void navigate({ to: "/admin/login" });
              });
            }}
          >
            <LogOut size={13} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
      <Outlet />
    </main>
  );
}
