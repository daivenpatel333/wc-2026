export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        return json({
          ok: true,
          timestamp: Date.now(),
        });
      },
    },
  },
});