# Multi-Tenancy Design

## 1. Overview

Ross Built CMS uses a **shared database with company_id scoping and Row Level Security (RLS)** approach to multi-tenancy. All tenant data resides in a single Supabase (PostgreSQL) database. Every data-bearing table includes a `company_id` foreign key referencing the `companies` table, which serves as the multi-tenant root. RLS policies enforced at the database level ensure that users can only access data belonging to their own company, regardless of how queries are constructed at the application layer.

### Multi-Tenant Root: The Companies Table

The `companies` table is the root of the tenant hierarchy. Each company represents a distinct builder organization. All other entities are either directly owned by a company (via `company_id`) or indirectly owned through a chain of foreign keys that ultimately resolves to a company.

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  legal_name TEXT,

  -- Contact
  email TEXT,
  phone TEXT,
  website TEXT,

  -- Address
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,

  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',

  -- Settings
  settings JSONB DEFAULT '{
    "invoice_approval_threshold": 25000,
    "retainage_default_percent": 10,
    "fiscal_year_start_month": 1,
    "timezone": "America/Chicago",
    "date_format": "MM/DD/YYYY",
    "currency": "USD"
  }',

  -- Subscription
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. Tenant Scoping Rules

### 2.1 Direct company_id Scoping

The following tables carry a direct `company_id` column referencing `companies(id)` with `ON DELETE CASCADE`. Every query against these tables must filter by `company_id`:

| Table | Notes |
|-------|-------|
| `users` | Employee with system access; `company_id NOT NULL` |
| `cost_codes` | CSI division codes; unique per `(company_id, code)` |
| `vendors` | Subcontractors and material suppliers |
| `clients` | Homeowners/customers |
| `jobs` | Construction projects |
| `leads` | Potential projects/clients |
| `estimates` | Cost breakdowns for proposed work |
| `purchase_orders` | Commitments to vendors |
| `invoices` | Vendor bills |
| `todos` | Task items scoped to company |
| `comments` | Commentary on any entity |
| `message_threads` | Messaging threads |
| `activity_logs` | Audit trail |
| `time_entries` | Employee time tracking |
| `files` | Uploaded documents |
| `qb_connections` | QuickBooks OAuth; unique per company |
| `qb_entity_map` | CMS-to-QuickBooks ID mapping |
| `ai_vendor_aliases` | AI-learned vendor name aliases |
| `ai_cost_code_mappings` | AI-learned cost code keywords |
| `ai_processing_log` | AI processing history |
| `ai_insights` | AI-generated insights |

### 2.2 Indirect Scoping (via Job or Parent Entity)

Some tables do not carry their own `company_id` column but are indirectly scoped through a parent entity (typically `jobs`) that does carry `company_id`. These include:

| Table | Scoped Through |
|-------|---------------|
| `job_assignments` | `jobs.company_id` (via `job_id`) |
| `estimate_lines` | `estimates.company_id` (via `estimate_id`) |
| `proposals` | `estimates` / `jobs` (via `estimate_id` / `job_id`) |
| `contracts` | `jobs.company_id` (via `job_id`) |
| `selections` | `jobs.company_id` (via `job_id`) |
| `budgets` | `jobs.company_id` (via `job_id`) |
| `budget_lines` | `budgets` -> `jobs.company_id` (via `budget_id`) |
| `po_line_items` | `purchase_orders.company_id` (via `purchase_order_id`) |
| `invoice_allocations` | `invoices.company_id` (via `invoice_id`) |
| `draws` | `jobs.company_id` (via `job_id`) |
| `draw_lines` | `draws` -> `jobs.company_id` (via `draw_id`) |
| `change_orders` | `jobs.company_id` (via `job_id`) |
| `change_order_lines` | `change_orders` -> `jobs.company_id` (via `change_order_id`) |
| `tasks` | `jobs.company_id` (via `job_id`) |
| `task_dependencies` | `tasks` -> `jobs.company_id` (via `task_id`) |
| `daily_logs` | `jobs.company_id` (via `job_id`) |
| `daily_log_labor` | `daily_logs` -> `jobs.company_id` (via `daily_log_id`) |
| `photos` | `jobs.company_id` (via `job_id`) |
| `folders` | `jobs.company_id` (via `job_id`) |
| `bid_packages` | `jobs.company_id` (via `job_id`) |
| `bid_invitations` | `bid_packages` -> `jobs` (via `bid_package_id`) |
| `bid_responses` | `bid_invitations` -> `bid_packages` -> `jobs` (via chain) |
| `rfis` | `jobs.company_id` (via `job_id`) |
| `submittals` | `jobs.company_id` (via `job_id`) |
| `punch_lists` | `jobs.company_id` (via `job_id`) |
| `punch_items` | `punch_lists` -> `jobs.company_id` (via `punch_list_id`) |
| `punch_item_photos` | `punch_items` -> `punch_lists` -> `jobs` (via chain) |
| `final_docs` | `jobs.company_id` (via `job_id`) |
| `warranties` | `jobs.company_id` (via `job_id`) |
| `warranty_claims` | `warranties` -> `jobs.company_id` (via `warranty_id`) |
| `messages` | `message_threads.company_id` (via `thread_id`) |
| `message_participants` | `message_threads.company_id` (via `thread_id`) |

### 2.3 User-Scoped Tables

Some tables are scoped to an individual user rather than directly to a company. The user itself belongs to a company, so isolation is maintained transitively:

| Table | Scoped Through |
|-------|---------------|
| `notifications` | `users.company_id` (via `user_id`) |
| `portal_users` | `clients.company_id` (via `client_id`) |
| `vendor_portal_users` | `vendors.company_id` (via `vendor_id`) |

---

## 3. Row Level Security (RLS)

### 3.1 Core RLS Functions

Two helper functions are used by all RLS policies to determine the current user's company and role from the JWT:

```sql
-- Function to get current user's company_id
CREATE OR REPLACE FUNCTION get_current_company_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'company_id')::UUID;
$$ LANGUAGE SQL STABLE;

-- Function to check if user has role
CREATE OR REPLACE FUNCTION user_has_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = ANY(required_roles);
$$ LANGUAGE SQL STABLE;
```

### 3.2 Companies Table Policies

Users can only view their own company. Only owners can update company settings.

```sql
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company" ON companies
  FOR SELECT USING (id = get_current_company_id());

CREATE POLICY "Owners can update their company" ON companies
  FOR UPDATE USING (
    id = get_current_company_id()
    AND user_has_role(ARRAY['owner'])
  );
```

### 3.3 Jobs Table Policies

Users can view, create, and update jobs within their company. Only owners and admins can delete jobs.

```sql
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company jobs" ON jobs
  FOR SELECT USING (company_id = get_current_company_id());

CREATE POLICY "Users can create jobs" ON jobs
  FOR INSERT WITH CHECK (company_id = get_current_company_id());

CREATE POLICY "Users can update jobs" ON jobs
  FOR UPDATE USING (company_id = get_current_company_id());

CREATE POLICY "Admins can delete jobs" ON jobs
  FOR DELETE USING (
    company_id = get_current_company_id()
    AND user_has_role(ARRAY['owner', 'admin'])
  );
```

### 3.4 General company_id Isolation Pattern

The same pattern applies to all tables with a direct `company_id` column:

```sql
-- Company data isolation (general pattern for all company_id tables)
CREATE POLICY "Users can only see their company data"
ON {table_name} FOR ALL
USING (company_id = auth.jwt() -> 'user_metadata' ->> 'company_id');
```

For tables that reference the JWT directly (alternative form used in system-architecture.md):

```sql
CREATE POLICY "Users can only see their company data"
ON jobs FOR ALL
USING (company_id = auth.jwt() -> 'user_metadata' ->> 'company_id');
```

For role-restricted destructive operations:

```sql
CREATE POLICY "Only admins can delete"
ON jobs FOR DELETE
USING (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);
```

### 3.5 Role Hierarchy

The RLS policies reference the following user roles, listed in descending order of privilege:

| Role | Description |
|------|-------------|
| `owner` | Company owner; full access including company settings and deletion |
| `admin` | Administrator; full access including deletion |
| `accounting` | Accounting staff |
| `pm` | Project manager |
| `supervisor` | Field supervisor |
| `office` | Office staff |
| `field` | Field worker; most restricted access |

Roles are stored in `users.role` and embedded in the JWT under `user_metadata.role`.

---

## 4. API-Level Tenant Scoping

### 4.1 Authentication

- All API routes (except authentication endpoints) require a valid JWT.
- Supabase handles JWT validation.
- The JWT contains `user_metadata.company_id` and `user_metadata.role`.

### 4.2 Query Scoping

Every API query against a directly-scoped table must include a `company_id` filter. Even though RLS provides a safety net at the database level, the application layer should also filter by `company_id` to avoid relying solely on database-level enforcement.

For indirectly-scoped tables, queries must join through the parent chain to ensure the request is scoped to the correct company.

### 4.3 API Security

- All API routes require valid JWT (except auth routes).
- Supabase handles JWT validation.
- Additional authorization checks are applied for sensitive operations (e.g., approval workflows, deletion).
- Rate limiting is applied on AI and file upload endpoints.

---

## 5. File and Storage Access

### 5.1 File Scoping

The `files` table carries a direct `company_id` column. Files are stored in Supabase Storage with paths that encode the company context:

```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id),
  folder_id UUID REFERENCES folders(id),

  -- Storage
  storage_path TEXT NOT NULL,   -- Supabase storage path
  url TEXT,                     -- Cached signed URL
  thumbnail_url TEXT,

  -- Entity linking (optional)
  entity_type TEXT,             -- contract, submittal, rfi, vendor, etc.
  entity_id UUID,

  -- Sharing
  portal_visible BOOLEAN DEFAULT false,

  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id)
);
```

### 5.2 Photo Scoping

Photos are scoped through `job_id`, which in turn is scoped to a company:

```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  -- ...
  storage_path TEXT NOT NULL,
  url TEXT,
  -- Sharing
  portal_visible BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES users(id)
);
```

### 5.3 Portal Visibility

Files, photos, and folders have a `portal_visible` flag that controls whether the asset is visible to client portal users. Portal users are scoped through the `clients` table, which itself is scoped by `company_id`. This means portal users can only see assets marked as portal-visible within their own company's jobs.

---

## 6. Per-Tenant Configuration

The `companies.settings` JSONB column holds per-tenant configuration:

```json
{
  "invoice_approval_threshold": 25000,
  "retainage_default_percent": 10,
  "fiscal_year_start_month": 1,
  "timezone": "America/Chicago",
  "date_format": "MM/DD/YYYY",
  "currency": "USD"
}
```

| Setting | Description |
|---------|-------------|
| `invoice_approval_threshold` | Dollar amount above which invoices require owner approval |
| `retainage_default_percent` | Default retainage percentage for draws |
| `fiscal_year_start_month` | Month (1-12) when the company's fiscal year begins |
| `timezone` | Company timezone for date/time display |
| `date_format` | Date format preference |
| `currency` | Currency code |

Additional per-tenant configuration:

| Column | Description |
|--------|-------------|
| `subscription_tier` | Controls feature access (`free`, or paid tiers) |
| `subscription_status` | Whether the subscription is `active` |
| `trial_ends_at` | When the free trial expires |
| `primary_color` | Branding color for the company's UI |
| `logo_url` | Company logo for branded documents |

### Per-Tenant Integrations

QuickBooks connections are scoped one-per-company:

```sql
CREATE TABLE qb_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  -- OAuth tokens, sync settings, etc.
);
```

### Per-Tenant AI Learning

AI learning tables (vendor aliases, cost code mappings, processing logs, insights) all carry `company_id`, ensuring that one company's AI-learned patterns do not leak to another:

- `ai_vendor_aliases` -- vendor name corrections are per-company
- `ai_cost_code_mappings` -- keyword-to-cost-code associations are per-company
- `ai_processing_log` -- processing history is per-company
- `ai_insights` -- generated insights are per-company

---

## 7. Data Isolation Verification

### 7.1 Index Strategy

All tables with `company_id` have a dedicated index for efficient tenant-scoped queries:

- Pattern: `idx_{table}_company` on `{table}(company_id)`
- Composite indexes include `company_id` as the leading column for status/filter queries (e.g., `idx_jobs_status` on `jobs(company_id, status)`)
- Unique constraints that are per-tenant include `company_id` (e.g., `UNIQUE(company_id, code)` on `cost_codes`)

### 7.2 Foreign Key Cascades

All `company_id` foreign keys use `ON DELETE CASCADE`, ensuring that if a company is deleted, all associated data is automatically removed.

### 7.3 Verification Approach

Before launching each phase, the following must be verified:

1. **RLS policies tested** -- Confirm that queries from one company cannot return data from another.
2. **Data integrity** -- All relationships work correctly within a tenant boundary.
3. **Complete workflow** -- End-to-end user flows function within a single tenant context.
4. **Performance** -- List pages with tenant-scoped queries load quickly due to proper indexing.

### 7.4 Client Portal Isolation

Client portal users are authenticated separately from main application users. A portal user is linked to a `client`, which is linked to a `company`. Portal users can only see:

- Jobs associated with their client record
- Photos, files, and documents marked as `portal_visible`
- Draw requests for their jobs
- Selections assigned to their jobs

### 7.5 Vendor Portal Isolation

Vendor portal users are linked to a `vendor`, which is linked to a `company`. They access only bid packages, purchase orders, and other data associated with their vendor record within that company.

---

## 8. Naming Conventions Supporting Multi-Tenancy

| Convention | Example | Purpose |
|------------|---------|---------|
| All tables use `snake_case` | `cost_codes`, `purchase_orders` | Consistency |
| Primary keys are `id` (UUID) | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` | Globally unique, no tenant-prefix needed |
| Foreign keys are `{entity}_id` | `company_id`, `job_id`, `vendor_id` | Clear ownership chain |
| Timestamps use `_at` suffix | `created_at`, `updated_at` | Consistent metadata |
| Boolean flags use `is_` or `has_` prefix | `is_active`, `is_1099` | Clear semantics |

---

*Compiled from data-model.md and system-architecture.md.*
*This document consolidates all multi-tenancy, tenant isolation, RLS, and company_id scoping content from the existing architecture documentation.*
