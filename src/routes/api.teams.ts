import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { handleApi, readJsonBody } from "#/server/api-utils";
import { getDb } from "#/server/db";
import { AppError } from "#/server/services/errors";
import { submitTeam } from "#/server/services/teams";

export const Route = createFileRoute("/api/teams")({
  server: {
    handlers: {
      POST: ({ request }) =>
        handleApi(async () => {
          const body = await readJsonBody(request);
          const playerIds = Array.isArray(body.playerIds)
            ? body.playerIds.filter((id): id is string => typeof id === "string")
            : null;
          if (playerIds === null) {
            throw new AppError("INVALID_BODY", "playerIds must be an array of player ids.");
          }
          const store = await getDb();
          const result = await submitTeam(store, {
            teamName: typeof body.teamName === "string" ? body.teamName : "",
            userName: typeof body.userName === "string" ? body.userName : "",
            playerIds,
          });
          return json(result, { status: 201 });
        }),
    },
  },
});
