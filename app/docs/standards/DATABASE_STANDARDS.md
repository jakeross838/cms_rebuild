# Database Standards

> Every query, every table, every policy must be designed for multi-tenant scale.

## Table of Contents
- [Multi-Tenant Architecture](#multi-tenant-architecture)
- [Table Design](#table-design)
- [Naming Conventions](#naming-conventions)
- [Column Standards](#column-standards)
- [Indexes](#indexes)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Migrations](#migrations)
- [Query Patterns](#query-patterns)
- [Performance Guidelines](#performance-guidelines)

---

## Multi-Tenant Architecture

### Core Principle
**Every table that contains tenant data MUST have a `company_id` column.**

```sql
-- ✅ CORRECT - Every tenant table has company_id
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  -- ...
);

-- ❌ WRONG - Missing company_id
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  -- ...
);
```

### Table Categories

| Category | Has company_id | Example |
|----------|---------------|---------|
| Tenant Data | Yes | jobs, invoices, clients |
| User Data | Yes | users (via company membership) |
| System Data | No | migrations, system_config |
| Lookup Data | No | states, countries, job_types |

---

## Table Design

### Standard Table Template
```sql
CREATE TABLE table_name (
  -- Primary key (always UUID)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tenant isolation (required for tenant tables)
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Business columns
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',

  -- Optional relationships
  parent_id UUID REFERENCES parent_table(id) ON DELETE SET NULL,

  -- Metadata columns (always include these)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),

  -- Soft delete (optional, use when needed)
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'archived'))
);

-- Always add updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Always enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Junction Tables
```sql
-- Many-to-many relationships
CREATE TABLE job_users (
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES users(id),

  PRIMARY KEY (job_id, user_id)
);

-- Note: Junction tables inherit company_id checking through foreign keys
-- but may need their own RLS policies
```

---

## Naming Conventions

### Tables
```sql
-- ✅ CORRECT: lowercase, snake_case, plural
CREATE TABLE users ( );
CREATE TABLE job_line_items ( );
CREATE TABLE invoice_payments ( );

-- ❌ WRONG
CREATE TABLE User ( );           -- PascalCase
CREATE TABLE jobLineItems ( );   -- camelCase
CREATE TABLE job ( );            -- singular
CREATE TABLE tbl_jobs ( );       -- prefix
```

### Columns
```sql
-- ✅ CORRECT: lowercase, snake_case
company_id UUID
created_at TIMESTAMPTZ
is_active BOOLEAN
total_amount NUMERIC

-- ❌ WRONG
companyId UUID        -- camelCase
CreatedAt TIMESTAMPTZ -- PascalCase
isactive BOOLEAN      -- no separator
```

### Foreign Keys
```sql
-- Pattern: referenced_table_singular + _id
company_id   -- References companies(id)
user_id      -- References users(id)
job_id       -- References jobs(id)
parent_job_id -- Self-reference to jobs(id)

-- For multiple references to same table, add context
created_by UUID REFERENCES users(id)  -- User who created
approved_by UUID REFERENCES users(id) -- User who approved
```

### Indexes
```sql
-- Pattern: idx_table_column(s)
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_company_status ON jobs(company_id, status);

-- Unique indexes
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- Partial indexes
CREATE INDEX idx_jobs_active ON jobs(company_id) WHERE status = 'active';
```

### Constraints
```sql
-- Check constraints: chk_table_description
CONSTRAINT chk_jobs_valid_status CHECK (status IN ('draft', 'active', 'complete'))
CONSTRAINT chk_invoices_positive_amount CHECK (amount > 0)

-- Unique constraints: uq_table_columns
CONSTRAINT uq_users_company_email UNIQUE (company_id, email)

-- Foreign key constraints (named automatically or)
CONSTRAINT fk_jobs_company FOREIGN KEY (company_id) REFERENCES companies(id)
```

### Functions and Triggers
```sql
-- Functions: verb_noun or get/set prefix
CREATE FUNCTION get_current_company_id() RETURNS UUID
CREATE FUNCTION update_updated_at() RETURNS TRIGGER
CREATE FUNCTION calculate_job_total(job_id UUID) RETURNS NUMERIC

-- Triggers: trg_table_action
CREATE TRIGGER trg_jobs_update_timestamp
CREATE TRIGGER trg_audit_log_insert
```

---

## Column Standards

### Required Columns for All Tenant Tables
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
```

### Common Column Patterns

| Column Type | SQL Type | Example |
|-------------|----------|---------|
| Primary Key | `UUID DEFAULT gen_random_uuid()` | `id` |
| Foreign Key | `UUID REFERENCES table(id)` | `job_id` |
| Money | `NUMERIC(12,2)` | `amount`, `total` |
| Percentage | `NUMERIC(5,2)` | `tax_rate`, `margin` |
| Status | `TEXT` with CHECK | `status` |
| Boolean | `BOOLEAN DEFAULT false` | `is_active` |
| Short Text | `TEXT` | `name`, `title` |
| Long Text | `TEXT` | `description`, `notes` |
| Email | `TEXT` with CHECK | `email` |
| Phone | `TEXT` | `phone` |
| Date | `DATE` | `due_date` |
| Timestamp | `TIMESTAMPTZ` | `created_at` |
| JSON | `JSONB` | `metadata`, `settings` |

### Money Columns
```sql
-- Always use NUMERIC for money, never FLOAT
amount NUMERIC(12,2) NOT NULL DEFAULT 0
tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0
total_amount NUMERIC(12,2) GENERATED ALWAYS AS (amount + tax_amount) STORED

-- Store in dollars (not cents) for readability
-- Use 2 decimal places for standard currency
-- Use 4 decimal places for unit prices that need precision
unit_price NUMERIC(12,4) NOT NULL
```

### Status Columns
```sql
-- Always use TEXT with CHECK constraint
status TEXT NOT NULL DEFAULT 'draft'
  CONSTRAINT chk_valid_status CHECK (status IN (
    'draft',
    'pending',
    'approved',
    'rejected',
    'complete'
  ))

-- Consider using a lookup table for complex statuses
CREATE TABLE job_statuses (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT,
  sort_order INT
);
```

### JSONB Columns
```sql
-- Use for flexible/optional data, not core fields
metadata JSONB DEFAULT '{}'::jsonb

-- Always set a default
settings JSONB NOT NULL DEFAULT '{
  "notifications": true,
  "timezone": "America/New_York"
}'::jsonb

-- Create indexes for frequently queried JSON paths
CREATE INDEX idx_jobs_metadata_type ON jobs ((metadata->>'type'));
```

---

## Indexes

### Index Strategy
```sql
-- 1. ALWAYS index foreign keys
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_client_id ON jobs(client_id);

-- 2. ALWAYS index columns used in WHERE clauses
CREATE INDEX idx_jobs_status ON jobs(status);

-- 3. Use compound indexes for common query patterns
-- Order columns: equality conditions first, then range/sort
CREATE INDEX idx_jobs_company_status_created
  ON jobs(company_id, status, created_at DESC);

-- 4. Use partial indexes for filtered queries
CREATE INDEX idx_jobs_active
  ON jobs(company_id, created_at DESC)
  WHERE status = 'active' AND deleted_at IS NULL;

-- 5. Use covering indexes for read-heavy queries
CREATE INDEX idx_invoices_list
  ON invoices(company_id, status, due_date)
  INCLUDE (number, client_id, amount);
```

### Full-Text Search
```sql
-- Add search vector column
ALTER TABLE jobs ADD COLUMN search_vector tsvector;

-- Create index
CREATE INDEX idx_jobs_search ON jobs USING gin(search_vector);

-- Update trigger
CREATE FUNCTION update_job_search_vector() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.address, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_jobs_search_vector
  BEFORE INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_job_search_vector();
```

---

## Row Level Security (RLS)

### RLS is Mandatory
```sql
-- ALWAYS enable RLS on tenant tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- ALWAYS force RLS for table owners too
ALTER TABLE jobs FORCE ROW LEVEL SECURITY;
```

### Standard Policy Pattern
```sql
-- Helper function (create once)
CREATE OR REPLACE FUNCTION get_current_company_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (current_setting('app.current_company_id', true))::uuid,
    (SELECT company_id FROM users WHERE id = auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Standard tenant isolation policy
CREATE POLICY tenant_isolation ON jobs
  FOR ALL
  USING (company_id = get_current_company_id())
  WITH CHECK (company_id = get_current_company_id());
```

### Role-Based Policies
```sql
-- Helper function for role checking
CREATE OR REPLACE FUNCTION user_has_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = ANY(required_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Admin-only policy
CREATE POLICY admin_only ON sensitive_table
  FOR ALL
  USING (
    company_id = get_current_company_id()
    AND user_has_role(ARRAY['admin'])
  );

-- Read for all, write for admins/managers
CREATE POLICY read_all ON jobs
  FOR SELECT
  USING (company_id = get_current_company_id());

CREATE POLICY write_managers ON jobs
  FOR INSERT UPDATE DELETE
  USING (
    company_id = get_current_company_id()
    AND user_has_role(ARRAY['admin', 'manager'])
  );
```

### Service Role Bypass
```sql
-- For background jobs that need to bypass RLS
-- Use service role key (never expose to client)

-- In application code:
const supabase = createClient(url, serviceRoleKey);
// This client bypasses RLS - use carefully
```

---

## Migrations

### Migration File Naming
```
supabase/migrations/
├── 20240101000000_initial_schema.sql
├── 20240115000000_add_jobs_table.sql
├── 20240115000001_add_jobs_indexes.sql
├── 20240120000000_add_invoices.sql
└── 20240201000000_add_rls_policies.sql

-- Pattern: YYYYMMDDHHMMSS_description.sql
-- Use 000000 for time portion unless multiple migrations same day
```

### Migration Structure
```sql
-- migrations/20240115000000_add_jobs_table.sql

-- Description of what this migration does
-- Related ticket: ROSS-123

-- 1. Create tables
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create indexes
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- 3. Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 4. Create policies
CREATE POLICY tenant_isolation ON jobs
  FOR ALL
  USING (company_id = get_current_company_id())
  WITH CHECK (company_id = get_current_company_id());

-- 5. Create triggers
CREATE TRIGGER set_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 6. Add comments
COMMENT ON TABLE jobs IS 'Construction jobs/projects';
COMMENT ON COLUMN jobs.status IS 'Job status: draft, active, complete, archived';
```

### Migration Rules

1. **Never modify existing migrations** - Create new migrations instead
2. **Always test locally first** - Run against local/dev before production
3. **Make migrations reversible when possible** - Include rollback SQL
4. **One logical change per migration** - Don't bundle unrelated changes
5. **Always include RLS** - Enable RLS in same migration as table creation

### Rollback Pattern
```sql
-- migrations/20240115000000_add_jobs_table.sql

-- UP (main migration)
CREATE TABLE jobs ( ... );

-- DOWN (rollback - store in comments or separate file)
-- To rollback: DROP TABLE jobs CASCADE;
```

---

## Query Patterns

### Always Filter by company_id
```typescript
// ✅ CORRECT
const { data } = await supabase
  .from('jobs')
  .select('*')
  .eq('company_id', companyId)
  .eq('status', 'active');

// ❌ WRONG - Missing company_id filter
// Even with RLS, explicit filtering is clearer and faster
const { data } = await supabase
  .from('jobs')
  .select('*')
  .eq('status', 'active');
```

### Use Pagination
```typescript
// ✅ CORRECT - Always paginate lists
const { data, count } = await supabase
  .from('jobs')
  .select('*', { count: 'exact' })
  .eq('company_id', companyId)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);

// ❌ WRONG - Unbounded query
const { data } = await supabase
  .from('jobs')
  .select('*');
```

### Select Only Needed Columns
```typescript
// ✅ CORRECT - Select specific columns
const { data } = await supabase
  .from('jobs')
  .select('id, name, status, client:clients(id, name)')
  .eq('company_id', companyId);

// ❌ WRONG - Select everything
const { data } = await supabase
  .from('jobs')
  .select('*');
```

### Use Transactions for Multi-Table Operations
```typescript
// ✅ CORRECT - Use RPC for transactions
const { data, error } = await supabase.rpc('create_job_with_items', {
  p_company_id: companyId,
  p_job_data: jobData,
  p_line_items: lineItems,
});

// Database function
CREATE OR REPLACE FUNCTION create_job_with_items(
  p_company_id UUID,
  p_job_data JSONB,
  p_line_items JSONB
) RETURNS jobs AS $$
DECLARE
  v_job jobs;
BEGIN
  -- Insert job
  INSERT INTO jobs (company_id, name, ...)
  VALUES (p_company_id, p_job_data->>'name', ...)
  RETURNING * INTO v_job;

  -- Insert line items
  INSERT INTO job_line_items (job_id, company_id, ...)
  SELECT v_job.id, p_company_id, ...
  FROM jsonb_array_elements(p_line_items);

  RETURN v_job;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Performance Guidelines

### Query Performance Checklist
- [ ] Query filters by `company_id` first
- [ ] All WHERE columns have indexes
- [ ] Using pagination (no unbounded queries)
- [ ] Selecting only needed columns
- [ ] Using appropriate index hints if needed

### Monitoring Slow Queries
```sql
-- Enable query logging for slow queries (> 1 second)
ALTER DATABASE postgres SET log_min_duration_statement = '1000';

-- Check for missing indexes
SELECT
  schemaname, tablename,
  seq_scan, seq_tup_read,
  idx_scan, idx_tup_fetch
FROM pg_stat_user_tables
WHERE seq_scan > idx_scan
ORDER BY seq_tup_read DESC;
```

### Index Usage Check
```sql
-- Check if indexes are being used
SELECT
  indexrelname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```
