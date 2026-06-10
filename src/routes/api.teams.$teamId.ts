import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { handleApi, queryParam, readJsonBody } from "#/server/api-utils";
import { getDb } from "#/server/db";
import { editTeam, getTeamDetail } from "#/server/services/teams";

export const Route = createFileRoute("/api/teams/$teamId")({
  server: {
    handlers: {
      GET: ({ params }) =>
        handleApi(async () => {
          const store = await getDb();
          return json(await getTeamDetail(store, params.teamId));
        }),
      PATCH: ({ request, params }) =>
        handleApi(async () => {
          const body = await readJsonBody(request);
          const token =
            request.headers.get("x-edit-token") ??
            (typeof body.editToken === "string" ? body.editToken : undefined) ??
            queryParam(request, "token") ??
            "";
          const store = await getDb();
          const team = await editTeam(store, params.teamId, token, {
            ...(typeof body.teamName === "string" ? { teamName: body.teamName } : {}),
            ...(typeof body.userName === "string" ? { userName: body.userName } : {}),
            ...(Array.isArray(body.playerIds)
              ? {
                  playerIds: body.playerIds.filter((id): id is string => typeof id === "string"),
                }
              : {}),
          });
          return json({ team });
        }),
    },
  },
});
