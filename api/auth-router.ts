import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { supabaseServer } from "./lib/supabase-server";
import { findUserBySupabaseUid, createUser } from "./queries/users";
import { findAdminBySupabaseUid } from "./queries/admin-users";

export const authRouter = createRouter({
  me: authedQuery.query(async ({ ctx }) => {
    const user = ctx.user;
    if (!user) return null;

    // Check admin_users table for admin status
    const adminRecord = await findAdminBySupabaseUid(user.supabaseUid);
    const isAdmin = !!adminRecord;

    return {
      id: user.id,
      supabaseUid: user.supabaseUid,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: isAdmin ? "admin" : user.role,
      kycStatus: user.kycStatus,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }),

  signUp: publicQuery
    .input(
      z.object({
        email: z.string().email("Invalid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        name: z.string().min(1, "Name is required").optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabaseServer.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: { name: input.name || input.email.split("@")[0] },
      });

      if (authError || !authData.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: authError?.message || "Failed to create account",
        });
      }

      // Create user profile in our database
      await createUser({
        supabaseUid: authData.user.id,
        email: input.email,
        name: input.name || input.email.split("@")[0],
        role: "user",
        kycStatus: "unverified",
        isActive: true,
      });

      // Return a session by signing in
      const { data: signInData, error: signInError } = await supabaseServer.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (signInError || !signInData.session) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Account created but sign-in failed. Please log in manually.",
        });
      }

      return {
        success: true,
        token: signInData.session.access_token,
        refreshToken: signInData.session.refresh_token,
        expiresAt: signInData.session.expires_at,
        user: {
          id: authData.user.id,
          email: input.email,
          name: input.name || input.email.split("@")[0],
        },
      };
    }),

  signIn: publicQuery
    .input(
      z.object({
        email: z.string().email("Invalid email"),
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async ({ input }) => {
      const { data, error } = await supabaseServer.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error || !data.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: error?.message || "Invalid email or password",
        });
      }

      // Ensure user exists in our database
      let user = await findUserBySupabaseUid(data.user.id);
      if (!user) {
        await createUser({
          supabaseUid: data.user.id,
          email: input.email,
          name: data.user.user_metadata?.name || input.email.split("@")[0],
          role: "user",
          kycStatus: "unverified",
          isActive: true,
        });
        user = await findUserBySupabaseUid(data.user.id);
      }

      return {
        success: true,
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
        user: {
          id: data.user.id,
          email: input.email,
          name: user?.name || data.user.user_metadata?.name || input.email,
        },
      };
    }),

  logout: publicQuery.mutation(async () => {
    // Client handles the actual sign-out; just return success
    return { success: true };
  }),
});
