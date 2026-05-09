import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";

export async function findUserBySupabaseUid(supabaseUid: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.supabaseUid, supabaseUid))
    .limit(1);
  return rows.at(0);
}

export async function findUserById(id: number) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return rows.at(0);
}

export async function createUser(data: InsertUser) {
  await getDb()
    .insert(schema.users)
    .values(data)
    .onConflictDoNothing();
}

export async function upsertUser(data: InsertUser) {
  await getDb()
    .insert(schema.users)
    .values(data)
    .onConflictDoUpdate({
      target: schema.users.supabaseUid,
      set: {
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        lastSignInAt: new Date(),
      },
    });
}
