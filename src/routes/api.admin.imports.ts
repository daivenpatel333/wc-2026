import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { handleApi } from "#/server/api-utils";
import { requireAdmin } from "#/server/auth/guard";
import { getDb } from "#/server/db";
import { listImportRuns } from "#/server/services/imports";

export const Route = createFileRoute("/api/admin/imports")({
  server: {
    handlers: {
      GET: ({ request }) =>
        handleApi(async () => {
          await requireAdmin(request.headers);
          const store = await getDb();
          return json({ runs: await listImportRuns(store) });
        }),
    },
  },
});
