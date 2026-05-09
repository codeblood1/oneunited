import { relations } from "drizzle-orm";
import { users, bankAccounts, transactions, kycSubmissions, adminUsers } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(bankAccounts),
  transactions: many(transactions),
  kycSubmissions: many(kycSubmissions),
}));

export const adminUsersRelations = relations(adminUsers, () => ({}));

export const bankAccountsRelations = relations(bankAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [bankAccounts.userId],
    references: [users.id],
  }),
  sentTransactions: many(transactions, { relationName: "fromAccount" }),
  receivedTransactions: many(transactions, { relationName: "toAccount" }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  fromAccount: one(bankAccounts, {
    fields: [transactions.fromAccountId],
    references: [bankAccounts.id],
    relationName: "fromAccount",
  }),
  toAccount: one(bankAccounts, {
    fields: [transactions.toAccountId],
    references: [bankAccounts.id],
    relationName: "toAccount",
  }),
  processor: one(users, {
    fields: [transactions.processedBy],
    references: [users.id],
    relationName: "processor",
  }),
}));

export const kycSubmissionsRelations = relations(kycSubmissions, ({ one }) => ({
  user: one(users, {
    fields: [kycSubmissions.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [kycSubmissions.reviewedBy],
    references: [users.id],
    relationName: "reviewer",
  }),
}));
