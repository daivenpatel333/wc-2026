import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { handleApi } from "#/server/api-utils";
import { requireAdmin } from "#/server/auth/guard";
import { getDb } from "#/server/db";
import { runImport } from "#/server/services/imports";

export const Route = createFileRoute("/api/admin/imports/fifa-groups")({
  server: {
    handlers: {
      POST: ({ request }) =>
        handleApi(async () => {
          const admin = await requireAdmin(request.headers);
          const store = await getDb();
          const runs = await runImport(store, "fifa_groups", admin.userId);
          return json({ runs });
        }),
    },
  },
});
