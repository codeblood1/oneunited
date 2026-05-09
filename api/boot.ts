import { createServer } from "node:http";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { HttpBindings } from "@hono/node-server";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// tRPC endpoint
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

const server = createServer(async (req, res) => {
  const response = await app.fetch(req as unknown as Request, {
    req,
    res,
  } as any);
  (res as any).webResponse = response;
});

const PORT = Number(process.env.PORT || 3000);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export { app };
