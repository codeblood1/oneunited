import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import {
  findKycByUserId,
  findKycById,
  createKycSubmission,
  updateKycStatus,
  findAllKycSubmissions,
} from "./queries/kyc";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

export const kycRouter = createRouter({
  getStatus: authedQuery.query(async ({ ctx }) => {
    const submission = await findKycByUserId(ctx.user.id);
    return {
      status: ctx.user.kycStatus,
      submission: submission || null,
    };
  }),

  submit: authedQuery
    .input(
      z.object({
        idType: z.enum(["passport", "drivers_license", "national_id"]),
        idNumber: z.string().min(1).max(100),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.kycStatus === "verified") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "KYC already verified" });
      }
      if (ctx.user.kycStatus === "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "KYC submission already pending" });
      }

      await createKycSubmission({
        userId: ctx.user.id,
        idType: input.idType,
        idNumber: input.idNumber,
        address: input.address,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        country: input.country,
        status: "pending",
      });

      await getDb()
        .update(users)
        .set({ kycStatus: "pending", kycSubmittedAt: new Date() })
        .where(eq(users.id, ctx.user.id));

      return { success: true, message: "KYC submitted for review" };
    }),

  adminList: authedQuery
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      return findAllKycSubmissions({
        status: input?.status,
        limit: input?.limit || 50,
        offset: input?.offset,
      });
    }),

  adminUpdate: authedQuery
    .input(
      z.object({
        kycId: z.number(),
        status: z.enum(["approved", "rejected"]),
        adminNote: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const kyc = await findKycById(input.kycId);
      if (!kyc) {
        throw new TRPCError({ code: "NOT_FOUND", message: "KYC submission not found" });
      }

      await updateKycStatus(input.kycId, input.status, ctx.user.id, input.adminNote);

      const kycStatus = input.status === "approved" ? "verified" : "rejected";
      await getDb()
        .update(users)
        .set({ kycStatus, kycVerifiedAt: input.status === "approved" ? new Date() : null })
        .where(eq(users.id, kyc.userId));

      return { success: true, message: `KYC ${input.status}` };
    }),
});
