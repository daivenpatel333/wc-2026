import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { handleApi, readJsonBody } from "#/server/api-utils";
import { requireAdmin } from "#/server/auth/guard";
import { getDb } from "#/server/db";
import { addScoreAdjustment } from "#/server/services/scores";

export const Route = createFileRoute("/api/admin/scores/teams/$teamId")({
  server: {
    handlers: {
      PATCH: ({ request, params }) =>
        handleApi(async () => {
          const admin = await requireAdmin(request.headers);
          const body = await readJsonBody(request);
          const store = await getDb();
          const adjustment = await addScoreAdjustment(store, {
            targetType: "team",
            targetId: params.teamId,
            points: typeof body.points === "number" ? body.points : Number.NaN,
            reason: typeof body.reason === "string" ? body.reason : null,
            adminId: admin.userId,
          });
          return json({ adjustment });
        }),
    },
  },
});
