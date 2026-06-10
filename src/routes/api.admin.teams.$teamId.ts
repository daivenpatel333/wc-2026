import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { handleApi, readJsonBody } from "#/server/api-utils";
import { requireAdmin } from "#/server/auth/guard";
import { getDb } from "#/server/db";
import { adminDeleteTeam, adminUpdateTeam } from "#/server/services/adminTeams";

export const Route = createFileRoute("/api/admin/teams/$teamId")({
  server: {
    handlers: {
      PATCH: ({ request, params }) =>
        handleApi(async () => {
          const admin = await requireAdmin(request.headers);
          const body = await readJsonBody(request);
          const store = await getDb();
          const team = await adminUpdateTeam(store, admin.userId, params.teamId, {
            ...(typeof body.teamName === "string" ? { teamName: body.teamName } : {}),
            ...(typeof body.userName === "string" ? { userName: body.userName } : {}),
            ...(typeof body.locked === "boolean" ? { locked: body.locked } : {}),
          });
          return json({ team });
        }),
      DELETE: ({ request, params }) =>
        handleApi(async () => {
          const admin = await requireAdmin(request.headers);
          const store = await getDb();
          await adminDeleteTeam(store, admin.userId, params.teamId);
          return json({ deleted: true });
        }),
    },
  },
});
