import { authRouter } from "./auth-router";
import { accountRouter } from "./account-router";
import { transactionRouter } from "./transaction-router";
import { kycRouter } from "./kyc-router";
import { adminRouter } from "./admin-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  account: accountRouter,
  transaction: transactionRouter,
  kyc: kycRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
