-- ===================================================================
-- OneUnited Bank — Supabase PostgreSQL Migration
-- SAFE TO RE-RUN: Uses IF EXISTS checks to avoid errors
-- ===================================================================

-- Check if we need to migrate from old schema (unionId -> supabase_uid)
DO $$
BEGIN
    -- If old users table with unionId exists, drop everything and start fresh
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'unionId'
    ) THEN
        RAISE NOTICE 'Old schema detected (unionId). Dropping all tables...';
        
        DROP TABLE IF EXISTS kyc_submissions CASCADE;
        DROP TABLE IF EXISTS transactions CASCADE;
        DROP TABLE IF EXISTS bank_accounts CASCADE;
        DROP TABLE IF EXISTS admin_users CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
        
        DROP TYPE IF EXISTS kyc_status_2 CASCADE;
        DROP TYPE IF EXISTS id_type CASCADE;
        DROP TYPE IF EXISTS transaction_status CASCADE;
        DROP TYPE IF EXISTS transaction_type CASCADE;
        DROP TYPE IF EXISTS account_type CASCADE;
        DROP TYPE IF EXISTS kyc_status CASCADE;
        DROP TYPE IF EXISTS role CASCADE;
        
        DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
    END IF;
END $$;

-- ===================================================================
-- Drop tables if they exist (with IF EXISTS to prevent errors)
-- ===================================================================
DROP TABLE IF EXISTS kyc_submissions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop enums
DROP TYPE IF EXISTS kyc_status_2 CASCADE;
DROP TYPE IF EXISTS id_type CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS account_type CASCADE;
DROP TYPE IF EXISTS kyc_status CASCADE;
DROP TYPE IF EXISTS role CASCADE;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- ===================================================================
-- Create Enums
-- ===================================================================
CREATE TYPE role AS ENUM ('user', 'admin', 'manager');
CREATE TYPE kyc_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE account_type AS ENUM ('checking', 'savings');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'transfer', 'payment');
CREATE TYPE transaction_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
CREATE TYPE id_type AS ENUM ('passport', 'drivers_license', 'national_id');
CREATE TYPE kyc_status_2 AS ENUM ('pending', 'approved', 'rejected');

-- ===================================================================
-- Table: users
-- ===================================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    supabase_uid UUID NOT NULL UNIQUE,
    email VARCHAR(320) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    avatar TEXT,
    role role NOT NULL DEFAULT 'user',
    kyc_status kyc_status NOT NULL DEFAULT 'unverified',
    kyc_submitted_at TIMESTAMPTZ,
    kyc_verified_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_sign_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- Table: admin_users
-- ===================================================================
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    supabase_uid UUID NOT NULL UNIQUE,
    email VARCHAR(320),
    name VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- Table: bank_accounts
-- ===================================================================
CREATE TABLE bank_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    account_type account_type NOT NULL DEFAULT 'checking',
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- Table: transactions
-- ===================================================================
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    from_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE SET NULL,
    to_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE SET NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    description TEXT,
    status transaction_status NOT NULL DEFAULT 'pending',
    category VARCHAR(100),
    processed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- Table: kyc_submissions
-- ===================================================================
CREATE TABLE kyc_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id_type id_type NOT NULL,
    id_number VARCHAR(100) NOT NULL,
    id_front_image TEXT,
    id_back_image TEXT,
    selfie_image TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100),
    status kyc_status_2 NOT NULL DEFAULT 'pending',
    admin_note TEXT,
    reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- Indexes
-- ===================================================================
CREATE INDEX IF NOT EXISTS idx_users_supabase_uid ON users(supabase_uid);
CREATE INDEX IF NOT EXISTS idx_admin_users_supabase_uid ON admin_users(supabase_uid);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_submissions(status);

-- ===================================================================
-- Enable Row Level Security
-- ===================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_submissions ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- RLS Policies (PERMISSIVE for authenticated users)
-- ===================================================================

-- users: authenticated users can INSERT (sign up creates profile)
DROP POLICY IF EXISTS "allow_auth_insert" ON users;
CREATE POLICY "allow_auth_insert" ON users
    FOR INSERT TO authenticated WITH CHECK (true);

-- users: anyone can SELECT
DROP POLICY IF EXISTS "allow_select" ON users;
CREATE POLICY "allow_select" ON users
    FOR SELECT USING (true);

-- users: users can UPDATE their own row
DROP POLICY IF EXISTS "allow_own_update" ON users;
CREATE POLICY "allow_own_update" ON users
    FOR UPDATE TO authenticated USING (supabase_uid = auth.uid()) WITH CHECK (supabase_uid = auth.uid());

-- admin_users: anyone can SELECT
DROP POLICY IF EXISTS "allow_admin_select" ON admin_users;
CREATE POLICY "allow_admin_select" ON admin_users
    FOR SELECT USING (true);

-- admin_users: authenticated can INSERT/UPDATE
DROP POLICY IF EXISTS "allow_admin_write" ON admin_users;
CREATE POLICY "allow_admin_write" ON admin_users
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- bank_accounts: anyone can SELECT
DROP POLICY IF EXISTS "allow_account_select" ON bank_accounts;
CREATE POLICY "allow_account_select" ON bank_accounts
    FOR SELECT USING (true);

-- bank_accounts: authenticated can INSERT
DROP POLICY IF EXISTS "allow_account_insert" ON bank_accounts;
CREATE POLICY "allow_account_insert" ON bank_accounts
    FOR INSERT TO authenticated WITH CHECK (true);

-- bank_accounts: authenticated can UPDATE
DROP POLICY IF EXISTS "allow_account_update" ON bank_accounts;
CREATE POLICY "allow_account_update" ON bank_accounts
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- transactions: anyone can SELECT
DROP POLICY IF EXISTS "allow_tx_select" ON transactions;
CREATE POLICY "allow_tx_select" ON transactions
    FOR SELECT USING (true);

-- transactions: authenticated can INSERT
DROP POLICY IF EXISTS "allow_tx_insert" ON transactions;
CREATE POLICY "allow_tx_insert" ON transactions
    FOR INSERT TO authenticated WITH CHECK (true);

-- transactions: authenticated can UPDATE
DROP POLICY IF EXISTS "allow_tx_update" ON transactions;
CREATE POLICY "allow_tx_update" ON transactions
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- kyc_submissions: anyone can SELECT
DROP POLICY IF EXISTS "allow_kyc_select" ON kyc_submissions;
CREATE POLICY "allow_kyc_select" ON kyc_submissions
    FOR SELECT USING (true);

-- kyc_submissions: authenticated can INSERT
DROP POLICY IF EXISTS "allow_kyc_insert" ON kyc_submissions;
CREATE POLICY "allow_kyc_insert" ON kyc_submissions
    FOR INSERT TO authenticated WITH CHECK (true);

-- ===================================================================
-- Seed Data
-- ===================================================================

-- Demo users
INSERT INTO users (supabase_uid, email, name, role, kyc_status, is_active)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'demo@example.com', 'Demo User', 'user', 'verified', true),
    ('00000000-0000-0000-0000-000000000002', 'jane@example.com', 'Jane Smith', 'user', 'verified', true)
ON CONFLICT (supabase_uid) DO NOTHING;

-- Demo bank accounts
DO $$
DECLARE demo_id INTEGER;
BEGIN
    SELECT id INTO demo_id FROM users WHERE supabase_uid = '00000000-0000-0000-0000-000000000001';
    IF demo_id IS NOT NULL THEN
        INSERT INTO bank_accounts (user_id, account_number, account_type, balance, currency)
        VALUES 
            (demo_id, '1U' || EXTRACT(EPOCH FROM NOW())::bigint || 'CHK1', 'checking', 5420.50, 'USD'),
            (demo_id, '1U' || (EXTRACT(EPOCH FROM NOW())::bigint + 1) || 'SAV1', 'savings', 12750.00, 'USD')
        ON CONFLICT (account_number) DO NOTHING;
    END IF;
END $$;

-- Demo transactions
DO $$
DECLARE demo_id INTEGER; checking_id INTEGER;
BEGIN
    SELECT id INTO demo_id FROM users WHERE supabase_uid = '00000000-0000-0000-0000-000000000001';
    SELECT id INTO checking_id FROM bank_accounts WHERE account_number LIKE '%CHK1';
    IF demo_id IS NOT NULL AND checking_id IS NOT NULL THEN
        INSERT INTO transactions (user_id, to_account_id, type, amount, description, status, category)
        VALUES 
            (demo_id, checking_id, 'deposit', 1000.00, 'Initial deposit', 'completed', 'deposit'),
            (demo_id, checking_id, 'deposit', 2500.00, 'Salary payment', 'completed', 'salary'),
            (demo_id, checking_id, 'withdrawal', 150.00, 'ATM Withdrawal', 'completed', 'cash'),
            (demo_id, checking_id, 'payment', 89.99, 'Electric Bill', 'completed', 'utilities'),
            (demo_id, checking_id, 'payment', 45.00, 'Grocery Store', 'completed', 'groceries')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Success message
SELECT 'Migration complete! Tables created with RLS policies.' as status;
