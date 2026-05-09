// ============================================================
// tRPC Context — Supabase Auth version
// Extracts the Supabase JWT from headers and verifies it
// ============================================================

import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { verifySupabaseToken } from "./lib/supabase-server";
import { findUserBySupabaseUid } from "./queries/users";

export type TrpcContext = Awaited<ReturnType<typeof createContext>>;

export async function createContext(opts: CreateHTTPContextOptions) {
  const req = opts.req;

  // Extract Bearer token from Authorization header
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  let user = null;

  if (token) {
    const supabaseUser = await verifySupabaseToken(token);
    if (supabaseUser) {
      user = await findUserBySupabaseUid(supabaseUser.id);
    }
  }

  return { user, req };
}
