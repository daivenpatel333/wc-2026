import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { handleApi, queryParam } from "#/server/api-utils";
import { getDb } from "#/server/db";
import { getLeaderboard } from "#/server/services/leaderboard";

export const Route = createFileRoute("/api/leaderboard")({
  server: {
    handlers: {
      GET: ({ request }) =>
        handleApi(async () => {
          const store = await getDb();
          const limitRaw = queryParam(request, "limit");
          const offsetRaw = queryParam(request, "offset");
          const page = await getLeaderboard(store, {
            limit: limitRaw === undefined ? undefined : Number.parseInt(limitRaw, 10) || undefined,
            offset:
              offsetRaw === undefined ? undefined : Number.parseInt(offsetRaw, 10) || undefined,
          });
          return json(page);
        }),
    },
  },
});
