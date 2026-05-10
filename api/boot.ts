import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

// ============================================================
// Create Hono app
// ============================================================
const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// tRPC endpoint — handles ALL API requests
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
    onError: env.isProduction
      ? undefined
      : ({ path, error }) => console.error(`[tRPC] ${path}:`, error.message),
  });
});

// Health check
app.get("/api/health", (c) => c.json({ ok: true, ts: Date.now() }));

// 404 for unmatched API routes
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

// ============================================================
// Production: Serve static files + start Node.js server
// ============================================================
if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const PORT = Number(process.env.PORT || 3000);
  serve({ fetch: app.fetch, port: PORT }, (info) => {
    console.log(`Server running at http://localhost:${info.port}`);
  });
}

export default app;
