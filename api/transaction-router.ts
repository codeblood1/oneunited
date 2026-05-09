import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import {
  findTransactionsByUserId,
  findTransactionsByAccountId,
  findTransactionById,
  createTransaction,
  updateTransactionStatus,
} from "./queries/transactions";
import {
  findAccountById,
  findAccountByNumber,
  updateBalance,
} from "./queries/accounts";

export const transactionRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        accountId: z.number().optional(),
        limit: z.number().min(1).max(100).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (input?.accountId) {
        return findTransactionsByAccountId(input.accountId, input.limit || 50);
      }
      return findTransactionsByUserId(ctx.user.id, input?.limit || 50);
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const tx = await findTransactionById(input.id);
      if (!tx || tx.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found" });
      }
      return tx;
    }),

  transfer: authedQuery
    .input(
      z.object({
        fromAccountId: z.number(),
        toAccountNumber: z.string(),
        amount: z.string().regex(/^\d+\.?\d{0,2}$/),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const fromAccount = await findAccountById(input.fromAccountId);
      if (!fromAccount || fromAccount.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Source account not found" });
      }

      const amount = parseFloat(input.amount);
      if (amount <= 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid amount" });
      }

      const currentBalance = parseFloat(fromAccount.balance as string);
      if (currentBalance < amount) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient funds" });
      }

      const toAccount = await findAccountByNumber(input.toAccountNumber);
      if (!toAccount) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Recipient account not found" });
      }
      if (toAccount.id === fromAccount.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot transfer to the same account" });
      }

      await createTransaction({
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        userId: ctx.user.id,
        type: "transfer",
        amount: input.amount,
        description: input.description || `Transfer to ${input.toAccountNumber}`,
        status: "pending",
        category: "transfer",
      });

      return { success: true, message: "Transfer submitted for approval" };
    }),

  deposit: authedQuery
    .input(
      z.object({
        accountId: z.number(),
        amount: z.string().regex(/^\d+\.?\d{0,2}$/),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const account = await findAccountById(input.accountId);
      if (!account || account.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }

      const amount = parseFloat(input.amount);
      if (amount <= 0 || amount > 10000) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Deposit amount must be between $0.01 and $10,000" });
      }

      const currentBalance = parseFloat(account.balance as string);
      const newBalance = (currentBalance + amount).toFixed(2);

      await updateBalance(account.id, newBalance);

      await createTransaction({
        toAccountId: account.id,
        userId: ctx.user.id,
        type: "deposit",
        amount: input.amount,
        description: input.description || "Deposit",
        status: "completed",
        category: "deposit",
      });

      return { success: true, message: "Deposit successful", newBalance };
    }),

  withdraw: authedQuery
    .input(
      z.object({
        accountId: z.number(),
        amount: z.string().regex(/^\d+\.?\d{0,2}$/),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const account = await findAccountById(input.accountId);
      if (!account || account.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }

      const amount = parseFloat(input.amount);
      if (amount <= 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid amount" });
      }

      const currentBalance = parseFloat(account.balance as string);
      if (currentBalance < amount) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient funds" });
      }

      const newBalance = (currentBalance - amount).toFixed(2);
      await updateBalance(account.id, newBalance);

      await createTransaction({
        fromAccountId: account.id,
        userId: ctx.user.id,
        type: "withdrawal",
        amount: input.amount,
        description: input.description || "Withdrawal",
        status: "completed",
        category: "withdrawal",
      });

      return { success: true, message: "Withdrawal successful", newBalance };
    }),
});
