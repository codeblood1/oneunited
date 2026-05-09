// ============================================================
// Vercel Serverless Function Entry Point
// This file is the API handler for /api/* routes on Vercel.
// It creates a Hono app with tRPC routes and exports it as a
// serverless function handler.
// ============================================================

import { Hono } from "hono";
import { handle } from "hono/vercel";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

// Create the Hono app
const app = new Hono().basePath("/api");

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// tRPC endpoint — all tRPC requests come through here
app.use("/trpc/*", async (c) => {
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
app.get("/health", (c) => c.json({ ok: true, ts: Date.now() }));

// Export as Vercel serverless handler
export default handle(app);

// Also export for edge runtime support
export const config = {
  runtime: "nodejs",
};
