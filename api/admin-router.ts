import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import {
  getDashboardStats,
  findAllUsers,
  updateUser,
} from "./queries/admin";
import {
  findAllTransactions,
  findTransactionById,
  updateTransactionStatus,
  getTransactionStats,
} from "./queries/transactions";
import {
  findAllAccounts,
} from "./queries/accounts";
import { findAccountById, updateBalance } from "./queries/accounts";

function requireAdmin(ctx: { user: { role: string } }) {
  if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
}

export const adminRouter = createRouter({
  getStats: authedQuery.query(async ({ ctx }) => {
    requireAdmin(ctx);
    return getDashboardStats();
  }),

  listUsers: authedQuery
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(["user", "admin", "manager"]).optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx);
      return findAllUsers({
        search: input?.search,
        role: input?.role,
        limit: input?.limit || 50,
        offset: input?.offset,
      });
    }),

  updateUser: authedQuery
    .input(
      z.object({
        userId: z.number(),
        isActive: z.boolean().optional(),
        role: z.enum(["user", "admin", "manager"]).optional(),
        kycStatus: z.enum(["unverified", "pending", "verified", "rejected"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const { userId, ...data } = input;
      await updateUser(userId, data);
      return { success: true };
    }),

  listTransactions: authedQuery
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected", "completed"]).optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx);
      return findAllTransactions({
        status: input?.status,
        limit: input?.limit || 50,
        offset: input?.offset,
      });
    }),

  updateTransaction: authedQuery
    .input(
      z.object({
        transactionId: z.number(),
        status: z.enum(["approved", "rejected"]),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);

      const tx = await findTransactionById(input.transactionId);
      if (!tx) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found" });
      }
      if (tx.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Transaction already processed" });
      }

      if (input.status === "approved" && tx.type === "transfer") {
        const fromAccount = tx.fromAccountId ? await findAccountById(tx.fromAccountId) : null;
        const toAccount = tx.toAccountId ? await findAccountById(tx.toAccountId) : null;

        if (fromAccount && toAccount) {
          const amount = parseFloat(tx.amount as string);
          const fromBalance = parseFloat(fromAccount.balance as string);
          const toBalance = parseFloat(toAccount.balance as string);

          if (fromBalance < amount) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient funds in source account" });
          }

          await updateBalance(fromAccount.id, (fromBalance - amount).toFixed(2));
          await updateBalance(toAccount.id, (toBalance + amount).toFixed(2));
        }
      }

      await updateTransactionStatus(input.transactionId, "completed", ctx.user.id, input.note);

      return { success: true, message: `Transaction ${input.status}` };
    }),

  rejectTransaction: authedQuery
    .input(
      z.object({
        transactionId: z.number(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);

      const tx = await findTransactionById(input.transactionId);
      if (!tx) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found" });
      }
      if (tx.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Transaction already processed" });
      }

      await updateTransactionStatus(input.transactionId, "rejected", ctx.user.id, input.note);

      return { success: true, message: "Transaction rejected" };
    }),

  listAccounts: authedQuery
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx);
      return findAllAccounts(input?.limit || 50, input?.offset);
    }),

  transactionStats: authedQuery.query(async ({ ctx }) => {
    requireAdmin(ctx);
    return getTransactionStats();
  }),
});
