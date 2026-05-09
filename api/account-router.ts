import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import {
  findAccountsByUserId,
  findAccountById,
  findAccountByNumber,
  createAccount,
  generateAccountNumber,
  findAllAccounts,
} from "./queries/accounts";

export const accountRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    return findAccountsByUserId(userId);
  }),

  getById: authedQuery
    .input(z.object({ accountId: z.number() }))
    .query(async ({ ctx, input }) => {
      const account = await findAccountById(input.accountId);
      if (!account || account.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }
      return account;
    }),

  create: authedQuery
    .input(z.object({ accountType: z.enum(["checking", "savings"]) }))
    .mutation(async ({ ctx, input }) => {
      const existingAccounts = await findAccountsByUserId(ctx.user.id);
      const hasType = existingAccounts.find((a) => a.accountType === input.accountType);
      if (hasType) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `You already have a ${input.accountType} account`,
        });
      }

      const accountNumber = generateAccountNumber();
      await createAccount({
        userId: ctx.user.id,
        accountNumber,
        accountType: input.accountType,
        balance: "100.00",
        currency: "USD",
      });

      return findAccountsByUserId(ctx.user.id);
    }),

  balance: authedQuery
    .input(z.object({ accountId: z.number() }))
    .query(async ({ ctx, input }) => {
      const account = await findAccountById(input.accountId);
      if (!account || account.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }
      return { balance: account.balance, currency: account.currency };
    }),

  lookup: authedQuery
    .input(z.object({ accountNumber: z.string() }))
    .query(async ({ input }) => {
      const account = await findAccountByNumber(input.accountNumber);
      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }
      return { accountNumber: account.accountNumber, accountType: account.accountType };
    }),
});
