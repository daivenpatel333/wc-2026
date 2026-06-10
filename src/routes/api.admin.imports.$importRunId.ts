import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { handleApi } from "#/server/api-utils";
import { requireAdmin } from "#/server/auth/guard";
import { getDb } from "#/server/db";
import { getImportRunDetail } from "#/server/services/imports";

export const Route = createFileRoute("/api/admin/imports/$importRunId")({
  server: {
    handlers: {
      GET: ({ request, params }) =>
        handleApi(async () => {
          await requireAdmin(request.headers);
          const store = await getDb();
          return json(await getImportRunDetail(store, params.importRunId));
        }),
    },
  },
});
