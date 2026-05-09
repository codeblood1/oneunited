import { eq, like, desc, sql, and, or } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";

export async function getDashboardStats() {
  const totalUsersResult = await getDb()
    .select({ count: sql<number>`count(*)` })
    .from(schema.users);

  const totalAccountsResult = await getDb()
    .select({ count: sql<number>`count(*)` })
    .from(schema.bankAccounts);

  const totalTransactionsResult = await getDb()
    .select({ count: sql<number>`count(*)` })
    .from(schema.transactions);

  const pendingTransactionsResult = await getDb()
    .select({ count: sql<number>`count(*)` })
    .from(schema.transactions)
    .where(eq(schema.transactions.status, "pending"));

  const pendingKycResult = await getDb()
    .select({ count: sql<number>`count(*)` })
    .from(schema.kycSubmissions)
    .where(eq(schema.kycSubmissions.status, "pending"));

  const totalBalanceResult = await getDb()
    .select({ total: sql<string>`COALESCE(SUM(balance), 0)` })
    .from(schema.bankAccounts);

  return {
    totalUsers: totalUsersResult[0]?.count ?? 0,
    totalAccounts: totalAccountsResult[0]?.count ?? 0,
    totalTransactions: totalTransactionsResult[0]?.count ?? 0,
    pendingTransactions: pendingTransactionsResult[0]?.count ?? 0,
    pendingKyc: pendingKycResult[0]?.count ?? 0,
    totalBalance: totalBalanceResult[0]?.total ?? "0",
  };
}

export async function findAllUsers(
  filters?: { search?: string; role?: string; limit?: number; offset?: number }
) {
  let query = getDb()
    .select()
    .from(schema.users)
    .orderBy(desc(schema.users.createdAt));

  const conditions = [];
  if (filters?.search) {
    conditions.push(
      or(
        like(schema.users.name, `%${filters.search}%`),
        like(schema.users.email, `%${filters.search}%`)
      )
    );
  }
  if (filters?.role) {
    conditions.push(eq(schema.users.role, filters.role));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  if (filters?.limit) query = query.limit(filters.limit);
  if (filters?.offset) query = query.offset(filters.offset);

  return query;
}

export async function updateUser(userId: number, data: { isActive?: boolean; role?: string; kycStatus?: string }) {
  const updateData: Record<string, unknown> = {};
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.role) updateData.role = data.role;
  if (data.kycStatus) updateData.kycStatus = data.kycStatus;

  return getDb()
    .update(schema.users)
    .set(updateData)
    .where(eq(schema.users.id, userId));
}
