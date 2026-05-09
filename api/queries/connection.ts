import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

// For queries (no prepared statements caching needed for serverless)
const client = postgres(env.databaseUrl, {
  prepare: false,
  max: 10, // connection pool size
});

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}

// Graceful shutdown
declare const process: { on: (event: string, callback: () => void) => void };
if (typeof process !== "undefined") {
  process.on("SIGTERM", () => client.end());
  process.on("SIGINT", () => client.end());
}
