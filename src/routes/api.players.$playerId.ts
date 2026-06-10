import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { handleApi } from "#/server/api-utils";
import { getDb } from "#/server/db";
import { getPlayerDetail } from "#/server/services/players";

export const Route = createFileRoute("/api/players/$playerId")({
  server: {
    handlers: {
      GET: ({ params }) =>
        handleApi(async () => {
          const store = await getDb();
          return json(await getPlayerDetail(store, params.playerId));
        }),
    },
  },
});
