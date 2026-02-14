-- ============================================================================
-- RossOS Development Seed Data
-- Deterministic UUIDs for reliable development & testing
-- ============================================================================

-- ============================================================================
-- COMPANIES
-- ============================================================================

INSERT INTO companies (id, name, legal_name, email, phone, address, city, state, zip, settings) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Ross Custom Homes', 'Ross Custom Homes LLC', 'info@rosscustomhomes.com', '(512) 555-0100', '1234 Builder Blvd', 'Austin', 'TX', '78701',
   '{"invoice_approval_threshold": 25000, "retainage_default_percent": 10, "fiscal_year_start_month": 1, "timezone": "America/Chicago", "date_format": "MM/DD/YYYY", "currency": "USD", "permissions_mode": "open"}'::jsonb),
  ('a0000000-0000-0000-0000-000000000002', 'Summit Construction', 'Summit Construction Inc', 'info@summitconstruction.com', '(303) 555-0200', '5678 Mountain View Dr', 'Denver', 'CO', '80202',
   '{"invoice_approval_threshold": 50000, "retainage_default_percent": 10, "fiscal_year_start_month": 1, "timezone": "America/Denver", "date_format": "MM/DD/YYYY", "currency": "USD", "permissions_mode": "standard"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SYSTEM ROLES (7 per company)
-- ============================================================================

-- Company 1 roles
INSERT INTO roles (id, company_id, name, description, base_role, is_system) VALUES
  ('b0000000-0000-0000-0001-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Owner', 'Full platform access including billing', 'owner', true),
  ('b0000000-0000-0000-0001-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Admin', 'Full access except billing', 'admin', true),
  ('b0000000-0000-0000-0001-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Project Manager', 'Manage projects, budgets, and team', 'pm', true),
  ('b0000000-0000-0000-0001-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Superintendent', 'Field leadership and daily logs', 'superintendent', true),
  ('b0000000-0000-0000-0001-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Office', 'Accounting, scheduling, office tasks', 'office', true),
  ('b0000000-0000-0000-0001-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Field', 'Daily logs, photos, time entries', 'field', true),
  ('b0000000-0000-0000-0001-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Read Only', 'View-only access', 'read_only', true)
ON CONFLICT (company_id, name) DO NOTHING;

-- Company 2 roles
INSERT INTO roles (id, company_id, name, description, base_role, is_system) VALUES
  ('b0000000-0000-0000-0002-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Owner', 'Full platform access including billing', 'owner', true),
  ('b0000000-0000-0000-0002-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Admin', 'Full access except billing', 'admin', true),
  ('b0000000-0000-0000-0002-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Project Manager', 'Manage projects, budgets, and team', 'pm', true),
  ('b0000000-0000-0000-0002-000000000004', 'a0000000-0000-0000-0000-000000000002', 'Superintendent', 'Field leadership and daily logs', 'superintendent', true),
  ('b0000000-0000-0000-0002-000000000005', 'a0000000-0000-0000-0000-000000000002', 'Office', 'Accounting, scheduling, office tasks', 'office', true),
  ('b0000000-0000-0000-0002-000000000006', 'a0000000-0000-0000-0000-000000000002', 'Field', 'Daily logs, photos, time entries', 'field', true),
  ('b0000000-0000-0000-0002-000000000007', 'a0000000-0000-0000-0000-000000000002', 'Read Only', 'View-only access', 'read_only', true)
ON CONFLICT (company_id, name) DO NOTHING;

-- ============================================================================
-- USERS (auth.users must be created via Supabase Auth API or Dashboard)
-- These inserts assume matching auth.users entries exist
-- ============================================================================

-- Note: In development, create these auth users via Supabase Dashboard or CLI:
-- supabase auth users create --email owner@rosscustomhomes.com --password Test1234!
-- Then the following public.users rows link to them.

-- Company 1 users (IDs will need to match auth.users)
-- INSERT INTO users (id, company_id, email, name, role, phone) VALUES
--   ('c0000000-0000-0000-0001-000000000001', 'a0000000-0000-0000-0000-000000000001', 'owner@rosscustomhomes.com', 'Jake Ross', 'owner', '(512) 555-0101'),
--   ('c0000000-0000-0000-0001-000000000002', 'a0000000-0000-0000-0000-000000000001', 'admin@rosscustomhomes.com', 'Sarah Admin', 'admin', '(512) 555-0102'),
--   ('c0000000-0000-0000-0001-000000000003', 'a0000000-0000-0000-0000-000000000001', 'pm@rosscustomhomes.com', 'Mike Peterson', 'pm', '(512) 555-0103'),
--   ('c0000000-0000-0000-0001-000000000004', 'a0000000-0000-0000-0000-000000000001', 'super@rosscustomhomes.com', 'Tom Builder', 'superintendent', '(512) 555-0104'),
--   ('c0000000-0000-0000-0001-000000000005', 'a0000000-0000-0000-0000-000000000001', 'office@rosscustomhomes.com', 'Lisa Office', 'office', '(512) 555-0105'),
--   ('c0000000-0000-0000-0001-000000000006', 'a0000000-0000-0000-0000-000000000001', 'field@rosscustomhomes.com', 'Dave Field', 'field', '(512) 555-0106'),
--   ('c0000000-0000-0000-0001-000000000007', 'a0000000-0000-0000-0000-000000000001', 'readonly@rosscustomhomes.com', 'View Only', 'read_only', NULL)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CLIENTS
-- ============================================================================

INSERT INTO clients (id, company_id, name, email, phone, address, city, state, zip) VALUES
  ('d0000000-0000-0000-0001-000000000001', 'a0000000-0000-0000-0000-000000000001', 'John & Jane Smith', 'smith@email.com', '(512) 555-0201', '456 Oak Lane', 'Austin', 'TX', '78702'),
  ('d0000000-0000-0000-0001-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Robert Johnson', 'rjohnson@email.com', '(512) 555-0202', '789 Elm Street', 'Austin', 'TX', '78703'),
  ('d0000000-0000-0000-0001-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Williams Family Trust', 'williams@email.com', '(512) 555-0203', '321 Pine Ave', 'Lakeway', 'TX', '78734')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- JOBS
-- ============================================================================

INSERT INTO jobs (id, company_id, client_id, name, job_number, address, city, state, zip, status, contract_type, contract_amount, start_date, target_completion) VALUES
  ('e0000000-0000-0000-0001-000000000001', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0001-000000000001', 'Smith Residence', 'RCH-2025-001', '456 Oak Lane', 'Austin', 'TX', '78702', 'active', 'fixed_price', 850000.00, '2025-03-01', '2026-01-15'),
  ('e0000000-0000-0000-0001-000000000002', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0001-000000000002', 'Johnson Addition', 'RCH-2025-002', '789 Elm Street', 'Austin', 'TX', '78703', 'pre_construction', 'cost_plus', 320000.00, '2025-06-01', '2025-12-01'),
  ('e0000000-0000-0000-0001-000000000003', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0001-000000000003', 'Williams Lake House', 'RCH-2025-003', '100 Lakeshore Dr', 'Lakeway', 'TX', '78734', 'active', 'fixed_price', 1200000.00, '2025-01-15', '2026-06-30')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- COST CODES
-- ============================================================================

INSERT INTO cost_codes (id, company_id, code, division, name, category, is_default) VALUES
  ('f0000000-0000-0000-0001-000000000001', 'a0000000-0000-0000-0000-000000000001', '01-000', '01', 'General Conditions', 'other', true),
  ('f0000000-0000-0000-0001-000000000002', 'a0000000-0000-0000-0000-000000000001', '02-000', '02', 'Site Work', 'subcontractor', true),
  ('f0000000-0000-0000-0001-000000000003', 'a0000000-0000-0000-0000-000000000001', '03-000', '03', 'Concrete', 'subcontractor', true),
  ('f0000000-0000-0000-0001-000000000004', 'a0000000-0000-0000-0000-000000000001', '04-000', '04', 'Masonry', 'subcontractor', true),
  ('f0000000-0000-0000-0001-000000000005', 'a0000000-0000-0000-0000-000000000001', '05-000', '05', 'Metals / Steel', 'material', true),
  ('f0000000-0000-0000-0001-000000000006', 'a0000000-0000-0000-0000-000000000001', '06-000', '06', 'Wood & Plastics', 'material', true),
  ('f0000000-0000-0000-0001-000000000007', 'a0000000-0000-0000-0000-000000000001', '07-000', '07', 'Thermal & Moisture Protection', 'subcontractor', true),
  ('f0000000-0000-0000-0001-000000000008', 'a0000000-0000-0000-0000-000000000001', '08-000', '08', 'Doors & Windows', 'material', true),
  ('f0000000-0000-0000-0001-000000000009', 'a0000000-0000-0000-0000-000000000001', '09-000', '09', 'Finishes', 'subcontractor', true),
  ('f0000000-0000-0000-0001-000000000010', 'a0000000-0000-0000-0000-000000000001', '15-000', '15', 'Mechanical / Plumbing', 'subcontractor', true),
  ('f0000000-0000-0000-0001-000000000011', 'a0000000-0000-0000-0000-000000000001', '16-000', '16', 'Electrical', 'subcontractor', true)
ON CONFLICT (company_id, code) DO NOTHING;

-- ============================================================================
-- VENDORS
-- ============================================================================

INSERT INTO vendors (id, company_id, name, trade, email, phone, payment_terms) VALUES
  ('g0000000-0000-0000-0001-000000000001', 'a0000000-0000-0000-0000-000000000001', 'ABC Concrete', 'Concrete', 'billing@abcconcrete.com', '(512) 555-0301', 'Net 30'),
  ('g0000000-0000-0000-0001-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Elite Electrical', 'Electrical', 'billing@eliteelectric.com', '(512) 555-0302', 'Net 30'),
  ('g0000000-0000-0000-0001-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Premium Plumbing', 'Plumbing', 'billing@premiumplumbing.com', '(512) 555-0303', 'Net 45'),
  ('g0000000-0000-0000-0001-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Austin Lumber Supply', 'Lumber', 'orders@austinlumber.com', '(512) 555-0304', 'Net 30'),
  ('g0000000-0000-0000-0001-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Hill Country HVAC', 'HVAC', 'service@hchvac.com', '(512) 555-0305', 'Net 30')
ON CONFLICT (id) DO NOTHING;
