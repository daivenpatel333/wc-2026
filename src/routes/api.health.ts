import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getServerEnv } from "#/server/env";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const env = getServerEnv();

          return json({
            ok: true,
            status: "healthy",
            environment: process.env.NODE_ENV,
            database: env.databaseUrl ? "configured" : "memory",
            auth: {
              configured: !!env.betterAuthSecret,
            },
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error("[health] check failed:", error);

          return json(
            {
              ok: false,
              status: "unhealthy",
            },
            { status: 503 }
          );
        }
      },
    },
  },
});