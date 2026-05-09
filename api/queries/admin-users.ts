import { eq, and } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertAdminUser } from "@db/schema";
import { getDb } from "./connection";

export async function findAdminBySupabaseUid(supabaseUid: string) {
  const rows = await getDb()
    .select()
    .from(schema.adminUsers)
    .where(
      and(
        eq(schema.adminUsers.supabaseUid, supabaseUid),
        eq(schema.adminUsers.isActive, true)
      )
    )
    .limit(1);
  return rows.at(0);
}

export async function findAllActiveAdmins() {
  return getDb()
    .select()
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.isActive, true))
    .orderBy(schema.adminUsers.createdAt);
}

export async function createAdminUser(data: InsertAdminUser) {
  return getDb()
    .insert(schema.adminUsers)
    .values(data)
    .onConflictDoNothing({ target: schema.adminUsers.supabaseUid });
}

export async function deactivateAdminUser(supabaseUid: string) {
  return getDb()
    .update(schema.adminUsers)
    .set({ isActive: false })
    .where(eq(schema.adminUsers.supabaseUid, supabaseUid));
}

export async function upsertAdminUser(data: InsertAdminUser) {
  return getDb()
    .insert(schema.adminUsers)
    .values(data)
    .onConflictDoUpdate({
      target: schema.adminUsers.supabaseUid,
      set: { ...data, isActive: true },
    });
}
