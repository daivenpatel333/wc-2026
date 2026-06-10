import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { handleApi } from "#/server/api-utils";
import { getDb } from "#/server/db";
import { getTeamRanking } from "#/server/services/leaderboard";

export const Route = createFileRoute("/api/leaderboard/$teamId")({
  server: {
    handlers: {
      GET: ({ params }) =>
        handleApi(async () => {
          const store = await getDb();
          return json(await getTeamRanking(store, params.teamId));
        }),
    },
  },
});
