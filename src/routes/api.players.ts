import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { handleApi, queryParam } from "#/server/api-utils";
import { getDb } from "#/server/db";
import { listSelectablePlayers } from "#/server/services/players";

export const Route = createFileRoute("/api/players")({
  server: {
    handlers: {
      GET: ({ request }) =>
        handleApi(async () => {
          const store = await getDb();
          const players = await listSelectablePlayers(store, {
            q: queryParam(request, "q"),
            country: queryParam(request, "country"),
            group: queryParam(request, "group"),
            region: queryParam(request, "region"),
            position: queryParam(request, "position"),
          });
          return json({ players });
        }),
    },
  },
});
