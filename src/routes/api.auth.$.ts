import { createFileRoute } from "@tanstack/react-router";
import { auth, ensureAdminBootstrapped } from "#/server/auth/auth";

async function handleAuth(request: Request): Promise<Response> {
  await ensureAdminBootstrapped();
  return auth.handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuth(request),
      POST: ({ request }) => handleAuth(request),
    },
  },
});
