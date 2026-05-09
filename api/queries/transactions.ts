import { eq, and, desc, sql, like, or } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertTransaction } from "@db/schema";
import { getDb } from "./connection";

export async function findTransactionsByUserId(userId: number, limit?: number) {
  let query = getDb()
    .select()
    .from(schema.transactions)
    .where(eq(schema.transactions.userId, userId))
    .orderBy(desc(schema.transactions.createdAt));
  
  if (limit) query = query.limit(limit);
  return query;
}

export async function findTransactionsByAccountId(accountId: number, limit?: number) {
  let query = getDb()
    .select()
    .from(schema.transactions)
    .where(
      or(
        eq(schema.transactions.fromAccountId, accountId),
        eq(schema.transactions.toAccountId, accountId)
      )
    )
    .orderBy(desc(schema.transactions.createdAt));
  
  if (limit) query = query.limit(limit);
  return query;
}

export async function findTransactionById(id: number) {
  const rows = await getDb()
    .select()
    .from(schema.transactions)
    .where(eq(schema.transactions.id, id))
    .limit(1);
  return rows.at(0);
}

export async function createTransaction(data: InsertTransaction) {
  const result = await getDb()
    .insert(schema.transactions)
    .values(data);
  return result;
}

export async function updateTransactionStatus(
  id: number,
  status: string,
  processedBy?: number,
  note?: string
) {
  const updateData: Record<string, unknown> = { status };
  if (processedBy) updateData.processedBy = processedBy;
  if (note) updateData.description = note;
  updateData.processedAt = new Date();

  return getDb()
    .update(schema.transactions)
    .set(updateData)
    .where(eq(schema.transactions.id, id));
}

export async function findAllTransactions(
  filters?: { status?: string; limit?: number; offset?: number }
) {
  let query = getDb()
    .select()
    .from(schema.transactions)
    .orderBy(desc(schema.transactions.createdAt));

  if (filters?.status) {
    query = query.where(eq(schema.transactions.status, filters.status)) as typeof query;
  }
  if (filters?.limit) query = query.limit(filters.limit);
  if (filters?.offset) query = query.offset(filters.offset);

  return query;
}

export async function getTransactionStats() {
  const totalResult = await getDb()
    .select({ count: sql<number>`count(*)` })
    .from(schema.transactions);
  
  const pendingResult = await getDb()
    .select({ count: sql<number>`count(*)` })
    .from(schema.transactions)
    .where(eq(schema.transactions.status, "pending"));

  return {
    total: totalResult[0]?.count ?? 0,
    pending: pendingResult[0]?.count ?? 0,
  };
}
