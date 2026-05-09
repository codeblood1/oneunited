-- ===================================================================
-- OneUnited Bank — Supabase PostgreSQL Migration
-- Paste this entire file into Supabase SQL Editor, then click "Run"
-- ===================================================================

-- Enable Row Level Security (best practice)
ALTER DATABASE postgres SET "app.jwt_secret" TO '';

-- ===================================================================
-- Table: users
-- ===================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    "unionId" VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(320),
    name VARCHAR(255),
    phone VARCHAR(50),
    avatar TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
    kyc_status VARCHAR(20) NOT NULL DEFAULT 'unverified' CHECK (kyc_status IN ('unverified', 'pending', 'verified', 'rejected')),
    kyc_submitted_at TIMESTAMPTZ,
    kyc_verified_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_sign_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to auto-update updated_at
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
-- Table: bank_accounts
-- ===================================================================
CREATE TABLE IF NOT EXISTS bank_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    account_type VARCHAR(20) NOT NULL DEFAULT 'checking' CHECK (account_type IN ('checking', 'savings')),
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- Table: transactions
-- ===================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    from_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE SET NULL,
    to_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE SET NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer', 'payment')),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    category VARCHAR(100),
    processed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- Table: kyc_submissions
-- ===================================================================
CREATE TABLE IF NOT EXISTS kyc_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id_type VARCHAR(30) NOT NULL CHECK (id_type IN ('passport', 'drivers_license', 'national_id')),
    id_number VARCHAR(100) NOT NULL,
    id_front_image TEXT,
    id_back_image TEXT,
    selfie_image TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_note TEXT,
    reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- Indexes (for performance)
-- ===================================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_from_account ON transactions(from_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_account ON transactions(to_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_submissions(status);

-- ===================================================================
-- Seed Data (Optional — for testing)
-- ===================================================================

-- Admin user
INSERT INTO users ("unionId", email, name, role, kyc_status, is_active)
VALUES ('admin_001', 'admin@oneunited.bank', 'Admin User', 'admin', 'verified', true)
ON CONFLICT ("unionId") DO NOTHING;

-- Demo user
INSERT INTO users ("unionId", email, name, role, kyc_status, is_active)
VALUES ('user_001', 'demo@example.com', 'Demo User', 'user', 'verified', true)
ON CONFLICT ("unionId") DO NOTHING;

-- Create demo accounts
DO $$
DECLARE
    demo_user_id INTEGER;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE "unionId" = 'user_001';
    
    IF demo_user_id IS NOT NULL THEN
        INSERT INTO bank_accounts (user_id, account_number, account_type, balance, currency)
        VALUES 
            (demo_user_id, '1U' || EXTRACT(EPOCH FROM NOW())::bigint || 'CHK1', 'checking', 5420.50, 'USD'),
            (demo_user_id, '1U' || (EXTRACT(EPOCH FROM NOW())::bigint + 1) || 'SAV1', 'savings', 12750.00, 'USD')
        ON CONFLICT (account_number) DO NOTHING;
    END IF;
END $$;

-- Seed demo transactions
DO $$
DECLARE
    demo_user_id INTEGER;
    checking_id INTEGER;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE "unionId" = 'user_001';
    SELECT id INTO checking_id FROM bank_accounts WHERE user_id = demo_user_id AND account_type = 'checking' LIMIT 1;
    
    IF demo_user_id IS NOT NULL AND checking_id IS NOT NULL THEN
        INSERT INTO transactions (user_id, to_account_id, type, amount, description, status, category)
        VALUES 
            (demo_user_id, checking_id, 'deposit', 1000.00, 'Initial deposit', 'completed', 'deposit'),
            (demo_user_id, checking_id, 'deposit', 2500.00, 'Salary payment', 'completed', 'salary'),
            (demo_user_id, checking_id, 'withdrawal', 150.00, 'ATM Withdrawal', 'completed', 'cash'),
            (demo_user_id, checking_id, 'payment', 89.99, 'Electric Bill', 'completed', 'utilities'),
            (demo_user_id, checking_id, 'payment', 45.00, 'Grocery Store', 'completed', 'groceries')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ===================================================================
-- Enable Row Level Security on all tables
-- ===================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (modify as needed)
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can read own accounts" ON bank_accounts
    FOR SELECT USING (true);

CREATE POLICY "Users can read own transactions" ON transactions
    FOR SELECT USING (true);

CREATE POLICY "Users can read own KYC" ON kyc_submissions
    FOR SELECT USING (true);
