import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set!");
    process.exit(1);
  }

  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  const db = drizzle(client, { schema });

  // Check if we already have users
  const existingUsers = await db.select().from(schema.users).limit(1);
  if (existingUsers.length > 0) {
    console.log("Database already has data. Skipping seed.");
    await client.end();
    return;
  }

  console.log("Creating seed data...");

  // ============================================================
  // 1. Seed admin_users table — placeholder admin
  // ============================================================
  await db.insert(schema.adminUsers).values([
    {
      supabaseUid: "00000000-0000-0000-0000-000000000000",
      email: "admin@oneunited.bank",
      name: "Admin User",
      isActive: true,
    },
  ]).onConflictDoNothing();
  console.log("Added placeholder admin to admin_users table.");

  // ============================================================
  // 2. Seed users table
  // ============================================================
  await db.insert(schema.users).values([
    {
      supabaseUid: "00000000-0000-0000-0000-000000000000",
      email: "admin@oneunited.bank",
      name: "Admin User",
      role: "user",
      kycStatus: "verified",
      isActive: true,
    },
    {
      supabaseUid: "11111111-1111-1111-1111-111111111111",
      email: "demo@example.com",
      name: "Demo User",
      role: "user",
      kycStatus: "verified",
      isActive: true,
    },
  ]).onConflictDoNothing();
  console.log("Created seed users.");

  // ============================================================
  // 3. Create demo bank accounts
  // ============================================================
  const demoUser = await db.select().from(schema.users).where(eq(schema.users.supabaseUid, "11111111-1111-1111-1111-111111111111")).limit(1);

  if (demoUser[0]) {
    await db.insert(schema.bankAccounts).values([
      {
        userId: demoUser[0].id,
        accountNumber: "1U" + Date.now().toString(36).toUpperCase().slice(0, 8) + "CHK1",
        accountType: "checking" as const,
        balance: "5420.50",
        currency: "USD",
      },
      {
        userId: demoUser[0].id,
        accountNumber: "1U" + (Date.now() + 1).toString(36).toUpperCase().slice(0, 8) + "SAV1",
        accountType: "savings" as const,
        balance: "12750.00",
        currency: "USD",
      },
    ]).onConflictDoNothing();
    console.log("Created demo accounts.");

    // ============================================================
    // 4. Seed demo transactions
    // ============================================================
    const accounts = await db.select().from(schema.bankAccounts).where(eq(schema.bankAccounts.userId, demoUser[0].id));
    const checkingAccount = accounts.find((a) => a.accountType === "checking");

    if (checkingAccount) {
      await db.insert(schema.transactions).values([
        { userId: demoUser[0].id, toAccountId: checkingAccount.id, type: "deposit", amount: "1000.00", description: "Initial deposit", status: "completed", category: "deposit" },
        { userId: demoUser[0].id, toAccountId: checkingAccount.id, type: "deposit", amount: "2500.00", description: "Salary payment", status: "completed", category: "salary" },
        { userId: demoUser[0].id, fromAccountId: checkingAccount.id, type: "withdrawal", amount: "150.00", description: "ATM Withdrawal", status: "completed", category: "cash" },
        { userId: demoUser[0].id, fromAccountId: checkingAccount.id, type: "payment", amount: "89.99", description: "Electric Bill", status: "completed", category: "utilities" },
        { userId: demoUser[0].id, fromAccountId: checkingAccount.id, type: "payment", amount: "45.00", description: "Grocery Store", status: "completed", category: "groceries" },
      ]).onConflictDoNothing();
      console.log("Created demo transactions.");
    }
  }

  console.log("Seed complete!");
  console.log("");
  console.log("=== NEXT STEPS ===");
  console.log("1. Sign up with email/password on /login page");
  console.log("2. You'll land on /dashboard as a regular user");
  console.log("3. Find your supabase_uid in Supabase Table Editor > users table");
  console.log("4. Add your supabase_uid to admin_users table (set is_active = true)");
  console.log("5. Refresh page -> you will be admin");
  console.log("");
  console.log("=== OR USE SQL ===");
  console.log("SELECT supabase_uid, email FROM users WHERE email = 'your@email.com';");
  console.log("INSERT INTO admin_users (supabase_uid, email, name, is_active)");
  console.log("VALUES ('YOUR-SUPABASE-UID', 'your@email.com', 'Your Name', true);");
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
