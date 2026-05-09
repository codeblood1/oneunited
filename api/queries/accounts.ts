import { eq, and, desc } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertBankAccount } from "@db/schema";
import { getDb } from "./connection";

export async function findAccountsByUserId(userId: number) {
  return getDb()
    .select()
    .from(schema.bankAccounts)
    .where(eq(schema.bankAccounts.userId, userId))
    .orderBy(desc(schema.bankAccounts.createdAt));
}

export async function findAccountById(accountId: number) {
  const rows = await getDb()
    .select()
    .from(schema.bankAccounts)
    .where(eq(schema.bankAccounts.id, accountId))
    .limit(1);
  return rows.at(0);
}

export async function findAccountByNumber(accountNumber: string) {
  const rows = await getDb()
    .select()
    .from(schema.bankAccounts)
    .where(eq(schema.bankAccounts.accountNumber, accountNumber))
    .limit(1);
  return rows.at(0);
}

export async function createAccount(data: InsertBankAccount) {
  const result = await getDb()
    .insert(schema.bankAccounts)
    .values(data);
  return result;
}

export async function updateBalance(accountId: number, newBalance: string) {
  return getDb()
    .update(schema.bankAccounts)
    .set({ balance: newBalance })
    .where(eq(schema.bankAccounts.id, accountId));
}

export async function findAllAccounts(limit?: number, offset?: number) {
  let query = getDb()
    .select()
    .from(schema.bankAccounts)
    .orderBy(desc(schema.bankAccounts.createdAt));
  
  if (limit) query = query.limit(limit);
  if (offset) query = query.offset(offset);
  
  return query;
}

export function generateAccountNumber(): string {
  const prefix = "1U";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`.substring(0, 16);
}
