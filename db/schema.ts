import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  boolean,
  integer,
  uuid,
} from "drizzle-orm/pg-core";

// PostgreSQL enums
export const roleEnum = pgEnum("role", ["user", "admin", "manager"]);
export const kycStatusEnum = pgEnum("kyc_status", ["unverified", "pending", "verified", "rejected"]);
export const accountTypeEnum = pgEnum("account_type", ["checking", "savings"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["deposit", "withdrawal", "transfer", "payment"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "approved", "rejected", "completed"]);
export const idTypeEnum = pgEnum("id_type", ["passport", "drivers_license", "national_id"]);
export const kycStatusEnum2 = pgEnum("kyc_status_2", ["pending", "approved", "rejected"]);

// ============================================================
// Table: users — Linked to Supabase Auth via supabaseUid
// ============================================================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  supabaseUid: uuid("supabase_uid").notNull().unique(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  avatar: text("avatar"),
  role: roleEnum("role").default("user").notNull(),
  kycStatus: kycStatusEnum("kyc_status").default("unverified").notNull(),
  kycSubmittedAt: timestamp("kyc_submitted_at", { withTimezone: true }),
  kycVerifiedAt: timestamp("kyc_verified_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// Table: admin_users — Managed from Supabase dashboard
// ============================================================
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  supabaseUid: uuid("supabase_uid").notNull().unique(),
  email: varchar("email", { length: 320 }),
  name: varchar("name", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// Table: bank_accounts
// ============================================================
export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accountNumber: varchar("account_number", { length: 20 }).notNull().unique(),
  accountType: accountTypeEnum("account_type").default("checking").notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// Table: transactions
// ============================================================
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  fromAccountId: integer("from_account_id"),
  toAccountId: integer("to_account_id"),
  userId: integer("user_id").notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  description: text("description"),
  status: transactionStatusEnum("status").default("pending").notNull(),
  category: varchar("category", { length: 100 }),
  processedBy: integer("processed_by"),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// Table: kyc_submissions
// ============================================================
export const kycSubmissions = pgTable("kyc_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  idType: idTypeEnum("id_type").notNull(),
  idNumber: varchar("id_number", { length: 100 }).notNull(),
  idFrontImage: text("id_front_image"),
  idBackImage: text("id_back_image"),
  selfieImage: text("selfie_image"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  zipCode: varchar("zip_code", { length: 20 }),
  country: varchar("country", { length: 100 }),
  status: kycStatusEnum2("status").default("pending").notNull(),
  adminNote: text("admin_note"),
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = typeof bankAccounts.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export type KycSubmission = typeof kycSubmissions.$inferSelect;
export type InsertKycSubmission = typeof kycSubmissions.$inferInsert;
