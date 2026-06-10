import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getDb } from "#/server/db";
import { getServerEnv } from "#/server/env";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        try {
          console.log("NODE_ENV =", process.env.NODE_ENV);
          console.log("BETTER_AUTH_URL =", process.env.BETTER_AUTH_URL);
          console.log("DATABASE_URL exists =", !!process.env.DATABASE_URL);

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
