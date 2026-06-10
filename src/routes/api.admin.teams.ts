import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { handleApi } from "#/server/api-utils";
import { requireAdmin } from "#/server/auth/guard";
import { getDb } from "#/server/db";

export const Route = createFileRoute("/api/admin/teams")({
  server: {
    handlers: {
      GET: ({ request }) =>
        handleApi(async () => {
          await requireAdmin(request.headers);
          const store = await getDb();
          return json({ teams: await store.listTeams() });
        }),
    },
  },
});
