import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { handleApi } from "#/server/api-utils";
import { requireAdmin } from "#/server/auth/guard";
import { getDb } from "#/server/db";
import { listPlayerScores } from "#/server/services/scores";

export const Route = createFileRoute("/api/admin/scores/players")({
  server: {
    handlers: {
      GET: ({ request }) =>
        handleApi(async () => {
          await requireAdmin(request.headers);
          const store = await getDb();
          return json({ players: await listPlayerScores(store) });
        }),
    },
  },
});
