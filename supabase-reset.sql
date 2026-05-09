-- ===================================================================
-- OneUnited Bank — RESET SCRIPT
-- Run this first to drop all old tables, then run supabase-migration.sql
-- ===================================================================

-- Drop tables in reverse dependency order (to avoid FK constraint errors)
DROP TABLE IF EXISTS kyc_submissions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom enum types
DROP TYPE IF EXISTS kyc_status_2 CASCADE;
DROP TYPE IF EXISTS id_type CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS account_type CASCADE;
DROP TYPE IF EXISTS kyc_status CASCADE;
DROP TYPE IF EXISTS role CASCADE;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Done! Now run supabase-migration.sql to create fresh tables
