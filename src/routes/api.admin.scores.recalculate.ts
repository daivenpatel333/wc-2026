import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { handleApi } from "#/server/api-utils";
import { requireAdmin } from "#/server/auth/guard";
import { getDb } from "#/server/db";
import { recalculateAllScores } from "#/server/services/scores";

export const Route = createFileRoute("/api/admin/scores/recalculate")({
  server: {
    handlers: {
      POST: ({ request }) =>
        handleApi(async () => {
          const admin = await requireAdmin(request.headers);
          const store = await getDb();
          const result = await recalculateAllScores(store);
          await store.addAuditLog({
            adminUserId: admin.userId,
            action: "score.recalculate",
            targetType: null,
            targetId: null,
            metadata: { ...result },
          });
          return json(result);
        }),
    },
  },
});
