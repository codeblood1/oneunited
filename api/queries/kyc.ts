import { eq, desc } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertKycSubmission } from "@db/schema";
import { getDb } from "./connection";

export async function findKycByUserId(userId: number) {
  const rows = await getDb()
    .select()
    .from(schema.kycSubmissions)
    .where(eq(schema.kycSubmissions.userId, userId))
    .orderBy(desc(schema.kycSubmissions.submittedAt))
    .limit(1);
  return rows.at(0);
}

export async function findKycById(id: number) {
  const rows = await getDb()
    .select()
    .from(schema.kycSubmissions)
    .where(eq(schema.kycSubmissions.id, id))
    .limit(1);
  return rows.at(0);
}

export async function createKycSubmission(data: InsertKycSubmission) {
  const result = await getDb()
    .insert(schema.kycSubmissions)
    .values(data);
  return result;
}

export async function updateKycStatus(
  id: number,
  status: string,
  reviewedBy: number,
  adminNote?: string
) {
  const updateData: Record<string, unknown> = { 
    status, 
    reviewedBy, 
    reviewedAt: new Date() 
  };
  if (adminNote) updateData.adminNote = adminNote;

  return getDb()
    .update(schema.kycSubmissions)
    .set(updateData)
    .where(eq(schema.kycSubmissions.id, id));
}

export async function findAllKycSubmissions(
  filters?: { status?: string; limit?: number; offset?: number }
) {
  let query = getDb()
    .select()
    .from(schema.kycSubmissions)
    .orderBy(desc(schema.kycSubmissions.submittedAt));

  if (filters?.status) {
    query = query.where(eq(schema.kycSubmissions.status, filters.status)) as typeof query;
  }
  if (filters?.limit) query = query.limit(filters.limit);
  if (filters?.offset) query = query.offset(filters.offset);

  return query;
}
