import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getDb } from "#/server/db";
import { getServerEnv } from "#/server/env";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const store = await getDb();
          const countries = await store.listCountries();
          return json({
            ok: true,
            store: getServerEnv().databaseUrl === undefined ? "memory" : "postgres",
            countries: countries.length,
          });
        } catch (error) {
          console.error("[health] check failed:", error);
          return json({ ok: false }, { status: 503 });
        }
      },
    },
  },
});
