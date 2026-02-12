# Multi-Tenancy Design

## Proven Patterns from v1

### getBuilderId Pattern (Proven)
- `getBuilderId(req)` extracts builder_id from authenticated user, throws 401 if missing
- `createBuilderQuery(tableName)` factory returns query helpers: .select(), .insert(), .update(), .softDelete(), .getById(), .exists()
- All queries auto-filter by builder_id AND deleted_at IS NULL
- Every route MUST call getBuilderId(req) first
- Soft delete is default (use includeSoftDeleted: true to override)
- 28+ routes already secured with this pattern in v1

---

## Gap Coverage Index

This document addresses the following gap analysis items:

| Section | Gap Items | Topic |
|---------|-----------|-------|
| 1: SaaS Architecture | GAP-001 through GAP-015 | Core Multi-Tenancy |
| 6: Data Isolation & Privacy | GAP-155 through GAP-169 | Data Security & Privacy |
| 41: Multi-Entity & Scaling | GAP-574 through GAP-580 | Complex Builder Structures |
| 42: Geographic Variability | GAP-581 through GAP-590 | Regional & National Platform |
| 43: Disaster Recovery | GAP-591 through GAP-598 | Business Continuity |

Every gap item is referenced by its number (e.g., GAP-001) and given a decision, approach, or "DECISION NEEDED" designation.

---

## 1. Overview

Ross Built CMS uses a **shared database with company_id scoping and Row Level Security (RLS)** approach to multi-tenancy. All tenant data resides in a single Supabase (PostgreSQL) database. Every data-bearing table includes a `company_id` foreign key referencing the `companies` table, which serves as the multi-tenant root. RLS policies enforced at the database level ensure that users can only access data belonging to their own company, regardless of how queries are constructed at the application layer.

**GAP-001: Shared tables with tenant_id filtering vs. separate databases per customer.**

**Decision:** Shared tables with `company_id` filtering plus PostgreSQL Row Level Security. This is the correct choice for our scale (hundreds to low thousands of tenants) because:
- Lower infrastructure cost (one database to operate)
- Simpler deployments and migrations (one schema to update)
- Cross-tenant analytics possible for benchmarking (GAP-007)
- Supabase natively supports RLS, making enforcement automatic

The tradeoff is that per-tenant backup/restore is more complex (see GAP-011). If a future enterprise customer requires physical data isolation, we can offer a dedicated Supabase project as a premium tier add-on (see Section 10: Enterprise Isolation).

---

## 2. Multi-Tenant Root: The Companies Table

The `companies` table is the root of the tenant hierarchy. Each company represents a distinct builder organization. All other entities are either directly owned by a company (via `company_id`) or indirectly owned through a chain of foreign keys that ultimately resolves to a company.

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  legal_name TEXT,
  tax_id_encrypted TEXT,              -- EIN, encrypted at rest

  -- Contact
  email TEXT,
  phone TEXT,
  website TEXT,

  -- Address
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'US',

  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  secondary_color TEXT,

  -- Settings
  settings JSONB DEFAULT '{
    "invoice_approval_threshold": 25000,
    "retainage_default_percent": 10,
    "fiscal_year_start_month": 1,
    "timezone": "America/Chicago",
    "date_format": "MM/DD/YYYY",
    "currency": "USD"
  }',

  -- Multi-Entity Hierarchy (GAP-006, GAP-574 through GAP-580)
  parent_company_id UUID REFERENCES companies(id),  -- NULL = top-level tenant
  entity_type TEXT DEFAULT 'primary'
    CHECK (entity_type IN ('primary', 'division', 'subsidiary', 'brand', 'franchise')),
  shared_vendor_pool BOOLEAN DEFAULT false,          -- Share vendors with parent

  -- Data Residency (GAP-014, GAP-168)
  data_region TEXT DEFAULT 'us-east',
  data_residency_requirement TEXT,                   -- NULL, 'us-only', 'region-specific'

  -- Subscription
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  subscription_lapsed_at TIMESTAMPTZ,               -- GAP-004: tracks when subscription lapsed
  grace_period_ends_at TIMESTAMPTZ,                 -- GAP-004: end of grace period
  read_only_mode BOOLEAN DEFAULT false,             -- GAP-004: read-only when lapsed

  -- Feature Flags (GAP-003)
  enabled_modules JSONB DEFAULT '["core"]',         -- Array of enabled module slugs
  feature_flags JSONB DEFAULT '{}',                 -- Per-tenant feature overrides

  -- Platform Limits (GAP-010, GAP-015)
  max_users INTEGER,                                -- NULL = unlimited (plan-based)
  max_projects INTEGER,                             -- NULL = unlimited (plan-based)
  max_storage_gb INTEGER DEFAULT 10,
  rate_limit_rpm INTEGER DEFAULT 600,               -- Requests per minute

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ                            -- Soft delete for data retention (GAP-005, GAP-169)
);

CREATE INDEX idx_companies_parent ON companies(parent_company_id);
```

---

## 3. Tenant Scoping Rules

### 3.1 Direct company_id Scoping

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

### 3.2 Indirect Scoping (via Job or Parent Entity)

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

### 3.3 User-Scoped Tables

Some tables are scoped to an individual user rather than directly to a company. The user itself belongs to a company, so isolation is maintained transitively:

| Table | Scoped Through |
|-------|---------------|
| `notifications` | `users.company_id` (via `user_id`) |
| `portal_users` | `clients.company_id` (via `client_id`) |
| `vendor_portal_users` | `vendors.company_id` (via `vendor_id`) |

---

## 4. Row Level Security (RLS)

### 4.1 Core RLS Functions

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

### 4.2 Companies Table Policies

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

**Multi-entity extension (GAP-006, GAP-574):** For companies with `parent_company_id`, the parent company's owner can also view (but not modify) child company data. This is accomplished with an additional policy:

```sql
-- Parent company owners can view child company data
CREATE POLICY "Parent owners can view child companies" ON companies
  FOR SELECT USING (
    parent_company_id = get_current_company_id()
    AND user_has_role(ARRAY['owner'])
  );
```

### 4.3 Jobs Table Policies

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

### 4.4 General company_id Isolation Pattern

The same pattern applies to all tables with a direct `company_id` column:

```sql
CREATE POLICY "Users can only see their company data"
ON {table_name} FOR ALL
USING (company_id = get_current_company_id());
```

For role-restricted destructive operations:

```sql
CREATE POLICY "Only admins can delete"
ON {table_name} FOR DELETE
USING (
  company_id = get_current_company_id()
  AND user_has_role(ARRAY['owner', 'admin'])
);
```

### 4.5 Role Hierarchy

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

## 5. API-Level Tenant Scoping

### 5.1 Authentication

- All API routes (except authentication endpoints) require a valid JWT.
- Supabase handles JWT validation.
- The JWT contains `user_metadata.company_id` and `user_metadata.role`.

### 5.2 Query Scoping

Every API query against a directly-scoped table must include a `company_id` filter. Even though RLS provides a safety net at the database level, the application layer should also filter by `company_id` to avoid relying solely on database-level enforcement.

For indirectly-scoped tables, queries must join through the parent chain to ensure the request is scoped to the correct company.

### 5.3 API Security

- All API routes require valid JWT (except auth routes).
- Supabase handles JWT validation.
- Additional authorization checks are applied for sensitive operations (e.g., approval workflows, deletion).
- Rate limiting is applied on AI and file upload endpoints.
- Per-tenant rate limiting enforced (GAP-015): `companies.rate_limit_rpm` controls max requests per minute per tenant.

### 5.4 Tenant-Level Rate Limiting (GAP-015)

**Decision:** Per-tenant rate limiting is enforced at the API gateway layer using a sliding window counter keyed on `company_id`. The default is 600 RPM (requests per minute), adjustable per tenant via `companies.rate_limit_rpm`. Higher-tier plans receive higher limits.

Implementation approach:
1. Middleware extracts `company_id` from JWT.
2. Redis counter tracks request count per company per 60-second window.
3. If count exceeds `rate_limit_rpm`, return HTTP 429 with `Retry-After` header.
4. AI endpoints and file upload endpoints have separate, lower limits (e.g., 60 RPM for AI, 120 RPM for file uploads).

---

## 6. Multi-User Tenancy (GAP-002)

**GAP-002: Can a single user belong to multiple tenant accounts?**

**Decision:** Yes. A user (identified by email/auth identity) can be associated with multiple companies. The implementation:

```sql
CREATE TABLE user_company_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);
```

**Behavior:**
- On login, if the user has multiple memberships, they are presented with a company selector.
- The selected company is embedded in the JWT as `user_metadata.company_id` and `user_metadata.role`.
- Switching companies requires a token refresh (new JWT with different `company_id`).
- This supports: builders who own multiple companies, consultants who work with multiple builders, employees who transition between builders (GAP-158).

**GAP-158: Employees who move between builders.** When a PM leaves Builder A and joins Builder B, their user account at Builder A is deactivated (`is_active = false` in `user_company_memberships`). No data carries over. A new membership is created for Builder B. The user's auth identity (email) remains the same, but their JWT will only ever contain one `company_id` at a time.

---

## 7. Feature Flags and Module Access (GAP-003)

**GAP-003: How do you handle tenant-level feature flags?**

**Decision:** Two-layer feature flag system:

1. **Module-level access** controlled by `companies.enabled_modules` (JSONB array). Modules correspond to subscription tier features:

```json
// Free tier
["core"]

// Professional tier
["core", "estimating", "selections", "scheduling", "daily_logs", "portal"]

// Enterprise tier
["core", "estimating", "selections", "scheduling", "daily_logs", "portal",
 "ai_engine", "warranty", "custom_fields", "api_access", "advanced_reporting"]
```

2. **Granular feature flags** controlled by `companies.feature_flags` (JSONB object) for A/B testing, beta features, and per-tenant overrides:

```json
{
  "beta_gantt_chart": true,
  "new_invoice_ui": false,
  "ai_cost_prediction": true
}
```

**Enforcement:**
- Server-side: Middleware checks `enabled_modules` before allowing access to module-specific API routes. Returns HTTP 403 with upgrade prompt.
- Client-side: Module visibility in navigation controlled by `enabled_modules` from the config payload. Hidden modules show a locked state with upgrade CTA.
- Feature flags checked via `hasFeature(flag)` utility on both client and server.

---

## 8. Subscription Lifecycle (GAP-004)

**GAP-004: What happens when a tenant's subscription lapses?**

**Decision:** Three-phase approach:

| Phase | Duration | Behavior |
|-------|----------|----------|
| Grace Period | 14 days after lapse | Full access. Banner warning on every page. Email reminders on day 1, 7, 12. |
| Read-Only Mode | Days 15-90 | `read_only_mode = true`. Users can log in, view data, export data. Cannot create, update, or delete anything. Banner explains the restriction. |
| Locked Out | Day 91+ | Users cannot log in. Data retained for 180 additional days (total 270 days from lapse). After 270 days, data deletion process begins with 30-day final notice. |

**Implementation:**
- `subscription_lapsed_at` records when the subscription lapsed.
- `grace_period_ends_at` = `subscription_lapsed_at + 14 days`.
- `read_only_mode` set to `true` by a daily cron job when grace period expires.
- Middleware checks `read_only_mode` on all mutating endpoints (POST, PUT, PATCH, DELETE) and returns HTTP 402 with reactivation instructions.
- Nightly job checks for companies past 270 days and initiates the deletion workflow (see GAP-005).

---

## 9. Tenant Data Deletion and Export (GAP-005, GAP-012, GAP-165)

### 9.1 Data Deletion Requests (GAP-005)

**GAP-005: How do you handle tenant data deletion requests (GDPR, CCPA)?**

**Decision:** Full tenant data deletion is supported via a multi-step process:

1. **Request:** Owner submits deletion request via Settings > Account > Delete Company.
2. **Confirmation:** Require re-authentication + type company name to confirm.
3. **Cooling-off period:** 30 days. Request can be cancelled during this period.
4. **Execution:** After 30 days, a background job:
   - Exports all data to a downloadable archive (see GAP-012) and emails download link.
   - Soft-deletes the company record (`deleted_at` timestamp set).
   - After 7 more days, hard-deletes all company data via `ON DELETE CASCADE`.
   - Purges all files from Supabase Storage in the company's storage prefix.
   - Removes all cache entries for the company.
   - Writes an immutable audit log entry: "Company {id} data deletion completed at {timestamp}".

**GAP-169: Data retention after cancellation.** Data is retained for 270 days after subscription lapse (see Section 8). After voluntary deletion request, 37-day cooling-off and cleanup period.

### 9.2 Full Data Export (GAP-012, GAP-165)

**GAP-012: Can tenants export ALL their data at any time?**

**Decision:** Yes. Full data export is available to owners at any time, including during read-only mode.

**Export format:**
- ZIP archive containing:
  - CSV files for every table (one CSV per table)
  - JSON manifest with schema definitions
  - All uploaded files and photos (organized by project)
  - Document templates
  - Configuration settings
  - Activity/audit logs

**Endpoint:** `POST /api/settings/export` (owner only). Returns a background job ID. When complete, emails the download link (signed URL, valid for 72 hours).

**GAP-165: "Show me everything you store about my company."** The export endpoint fulfills this requirement. For GDPR-specific subject access requests about individual users, a separate endpoint `POST /api/settings/export-user/:userId` exports all data associated with a specific user within the company.

---

## 10. Tenant Provisioning (GAP-008, GAP-033)

**GAP-008: What's the tenant provisioning workflow?**

**Decision:** When a new customer signs up:

1. **Company record created** with defaults from the selected plan.
2. **Owner user created** and linked to company.
3. **Default data seeded:**
   - Standard CSI cost code structure (16 divisions) as a starting point.
   - Default status workflows for all entity types.
   - Default approval chain: single-step owner approval.
   - Platform-provided document templates (proposal, contract, CO, draw request).
   - Default notification settings.
4. **Sample project created** (optional, can be dismissed): "Sample Custom Home" with example budget, schedule, and a few sample invoices/POs to demonstrate the system.
5. **Onboarding wizard launched:** Walks through company info, branding, basic settings, first real project creation.

**GAP-033: Out-of-box configuration.** The default configuration must work for day 1 without any customization. A one-person builder should be able to sign up, skip the wizard, create a project, and start entering invoices within 15 minutes. Advanced configuration (approval chains, custom workflows, terminology) is always optional and can be done later.

---

## 11. Data Migration from Other Platforms (GAP-013)

**GAP-013: How do you handle tenant data migration FROM another platform?**

**Decision:** Multi-tier import strategy:

| Import Source | Approach | Self-Service? |
|--------------|----------|---------------|
| CSV/Excel | Direct upload with column mapping UI | Yes |
| QuickBooks Online | API integration, automated sync | Yes |
| QuickBooks Desktop | IIF/CSV export, mapped import | Partially |
| Buildertrend | CSV export + mapping templates we provide | Partially |
| CoConstruct | CSV export + mapping templates we provide | Partially |
| Procore | API integration (enterprise tier) | No (managed) |
| Google Sheets | CSV export, or Google Sheets API | Yes |

**Implementation:**
- Import wizard with column mapping UI for CSV/Excel.
- Pre-built mapping templates for known platforms (Buildertrend, CoConstruct field names to our field names).
- Validation pass before commit: report errors, allow user to fix or skip.
- Background processing for large imports with progress tracking.
- Reconciliation report after import showing source counts vs. imported counts.
- Idempotent imports: re-running an import updates existing records rather than creating duplicates (matched on natural keys like vendor name + tax ID, or job number).

---

## 12. Multi-Entity Support (GAP-006, GAP-574 through GAP-580)

This section addresses builders with complex organizational structures.

### 12.1 Entity Hierarchy Model

**GAP-006: Can tenants have sub-tenants?**

**Decision:** Yes. The `companies` table supports a parent-child hierarchy via `parent_company_id`. A top-level company can have child companies representing divisions, subsidiaries, or brands.

```
Ross Built LLC (primary)
  |
  +-- Ross Built Custom Homes (division)
  |
  +-- Ross Development LLC (subsidiary)
  |
  +-- Luxury Living by Ross (brand)
```

**Entity types** (stored in `companies.entity_type`):

| Type | Description | Example |
|------|-------------|---------|
| `primary` | Top-level tenant, the billing entity | Ross Built LLC |
| `division` | Operational division within the primary | Custom Homes Division, Remodeling Division |
| `subsidiary` | Separate legal entity, related ownership | Ross Development LLC |
| `brand` | Marketing brand, same legal entity | Luxury Living by Ross |
| `franchise` | Independent operator using parent's templates/branding | Ross Built - Dallas |

### 12.2 Data Sharing Between Entities

**GAP-574: Builder with multiple LLCs.** Each LLC is a separate company record with its own `company_id`. Data isolation is maintained by default. Cross-entity data sharing is opt-in:

| Data Type | Sharing Behavior | Configuration |
|-----------|-----------------|---------------|
| Vendors | Optionally shared via `shared_vendor_pool` flag | Parent sets `shared_vendor_pool = true` on child |
| Cost Codes | Inherited from parent, overridable per child | Child can add/modify but starts with parent's codes |
| Document Templates | Inherited from parent, overridable per child | Child can use parent's or create own |
| Configuration | Inherited from parent, overridable per child | Follows config hierarchy (see configuration-engine.md) |
| Users | Can belong to multiple entities via `user_company_memberships` | User switches between entities |
| Financial Data | Never shared between entities by default | Cross-entity reporting requires parent-level permission |
| Projects | Always scoped to one entity | Cannot span entities |
| Clients | Optionally shared (same client, different projects) | `shared_client_pool` setting |

**GAP-575: Builder with construction company AND real estate company.** Modeled as two child companies under one parent. Separate data, shared vendor pool optional. Cross-entity referral tracking via a `referrals` table linking leads between entities.

**GAP-576: Builder with multiple offices.** Each office can be a `division` entity. Different teams, different vendor relationships, but shared reporting at the parent level. Users with the `pm` role in one division cannot see another division's data unless they have memberships in both.

**GAP-577: Different brand names.** Each brand is a `brand` entity type. Different branding (logo, colors, portal appearance), same underlying company. Client portal shows brand-specific branding.

### 12.3 Mergers and Acquisitions (GAP-578)

**GAP-578: How do you handle mergers/acquisitions?**

**DECISION NEEDED:** This is a complex, rare scenario that requires manual intervention. Proposed approach:

1. **Phase 1:** Acquired company becomes a child entity under the acquiring company. Data remains separate but parent-level reporting becomes available.
2. **Phase 2 (optional):** Data migration job merges entities: re-parents all records from acquired company to parent company. This is irreversible and requires:
   - Vendor deduplication (matching by tax ID, name)
   - Cost code mapping (acquired company's codes mapped to parent's)
   - User membership transfer
   - File storage path migration

This would be a managed service (not self-service) due to complexity and risk.

### 12.4 Franchise Model (GAP-579)

**GAP-579: Franchise models.**

**Decision:** Franchise support uses the parent-child hierarchy with `entity_type = 'franchise'`. The franchisor (parent) provides:
- Document templates (locked, franchisee cannot modify)
- Branding guidelines (logo, colors)
- Standard cost code structure
- Standard workflows and approval chains
- Training materials

The franchisee (child) operates independently:
- Own projects, clients, vendors, users
- Own financial data (not visible to franchisor by default)
- Can customize non-locked settings

Franchisor has access to aggregated reporting across all franchisees (see Section 13: Cross-Tenant Benchmarking) but cannot see individual transaction details unless the franchisee grants access.

### 12.5 Company Growth Path (GAP-580)

**GAP-580: Builders transitioning from small to large.**

**Decision:** The platform scales with the builder through subscription tiers:

| Builder Size | Typical Needs | Platform Response |
|-------------|---------------|-------------------|
| 1-person, $2M/yr | Basic invoicing, daily logs, client portal | Free or Starter tier, simple UI mode |
| 3-5 person, $5-15M/yr | Full PM features, scheduling, selections | Professional tier |
| 10-20 person, $15-50M/yr | Multi-project, approval workflows, reporting | Business tier |
| 50+ person, $50M+/yr | Multi-division, custom integrations, API | Enterprise tier |

Key design principle: Features unlock as the builder grows. Nothing forces a platform change. A builder who started as a one-person operation and grows to 50 people stays on the same platform with the same data.

---

## 13. Cross-Tenant Benchmarking (GAP-007, GAP-166)

**GAP-007: How do you handle cross-tenant data for anonymous benchmarking?**

**Decision:** Opt-in anonymous benchmarking. Builders who opt in contribute anonymized data to a platform-wide analytics pool.

### 13.1 Data Anonymization (GAP-166)

**GAP-166: Data anonymization for analytics.**

All benchmarking data is anonymized before aggregation:
- No company names, project names, client names, or vendor names
- All financial figures normalized to percentages (e.g., "electrical as % of total budget" rather than absolute dollar amounts)
- Minimum anonymity set: data is only included in benchmarks if at least 10 companies contribute to that metric in that region/category
- Region granularity: state-level (not city or zip) to prevent re-identification

### 13.2 Benchmarking Data Points

```sql
-- Materialized view refreshed nightly, anonymized
CREATE MATERIALIZED VIEW benchmark_data AS
SELECT
  -- No identifying information
  c.state AS region,
  j.project_type,
  j.square_footage_range,  -- Bucketed: '2000-3000', '3000-4000', etc.

  -- Anonymized metrics
  AVG(cost_per_sqft) AS avg_cost_per_sqft,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cost_per_sqft) AS median_cost_per_sqft,
  AVG(electrical_pct) AS avg_electrical_pct,
  AVG(plumbing_pct) AS avg_plumbing_pct,
  -- ... more metrics

  COUNT(DISTINCT company_id) AS sample_size  -- Must be >= 10
FROM anonymized_project_metrics
GROUP BY region, project_type, square_footage_range
HAVING COUNT(DISTINCT company_id) >= 10;
```

### 13.3 Benchmarking API

Tenants who opt in can query benchmarks:

```
GET /api/benchmarks?region=TX&project_type=custom_home&sqft_range=3000-4000
```

Response: "Your average electrical cost (12.3% of budget) is 1.8% above the platform median (10.5%) for custom homes in Texas in the 3000-4000 sqft range (based on 47 projects)."

---

## 14. Data Isolation and Privacy (GAP-155 through GAP-169)

### 14.1 Tenant Isolation Testing (GAP-155)

**GAP-155: How do you ensure Builder A cannot see Builder B's data?**

**Decision:** Multi-layered defense:

1. **Database layer:** RLS policies on every table (see Section 4). These are the primary enforcement mechanism and cannot be bypassed by application bugs.
2. **Application layer:** Every API query includes `company_id` filter. This is defense-in-depth; even if an application bug omits the filter, RLS catches it.
3. **Testing:** Automated isolation tests run in CI:
   - Create two test companies (A and B) with data in each.
   - Authenticate as Company A user.
   - Attempt to query every table and verify zero rows from Company B are returned.
   - Attempt to update/delete Company B records and verify rejection.
   - Run for every table in the schema.
4. **Penetration testing:** Annual third-party pen test (see GAP-161).
5. **Monitoring:** Alerts on any query that returns data from a different `company_id` than the JWT (should never happen with RLS, but monitor anyway).

### 14.2 Shared Vendors (GAP-156)

**GAP-156: Builder A and Builder B both use the same plumber.**

**Decision:** Each builder has their own `vendors` record for that plumber. There is no cross-tenant vendor identity. Even if the plumber's name and tax ID are identical across two tenants, they are separate records with separate pricing, performance data, and history. This is the simplest approach that guarantees isolation.

**Future enhancement (low priority):** A platform-level vendor directory that vendors can claim, providing a single login to see all builders they work with. This would be a vendor-side feature, not a builder-side data sharing feature. Each builder's vendor record remains independent.

### 14.3 Competitive Data Protection (GAP-157)

**GAP-157: How do you handle competitively sensitive data?**

**Decision:** All pricing, markup percentages, vendor relationships, and financial data are strictly tenant-isolated. There is no feature, API, or admin tool that allows viewing another tenant's financial data. Even platform administrators cannot browse tenant financial data without explicit authorization (see GAP-164).

### 14.4 Vendor Multi-Tenant Portal (GAP-159)

**GAP-159: Vendors who work for multiple builders on the platform.**

**Decision:** A vendor can have separate `vendor_portal_users` records for each builder they work with. Each portal login shows only that builder's scope. If the vendor uses the same email for multiple builders, they see a builder selector on login (similar to multi-company users, GAP-002).

```sql
-- Vendor portal user can be linked to same email across builders
CREATE TABLE vendor_portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  -- ... auth fields
  -- No UNIQUE on email alone -- same email can exist for different vendors/companies
  UNIQUE(vendor_id, email)
);
```

### 14.5 Encryption (GAP-160)

**GAP-160: Data encryption at rest and in transit.**

**Decision:**
- **In transit:** All connections use TLS 1.2+ (enforced by Supabase and the application server). HSTS headers are set. No unencrypted connections are accepted.
- **At rest:** Supabase encrypts all data at rest using AES-256. This is handled at the infrastructure level.
- **Sensitive fields:** Certain fields (tax IDs, banking information, SSNs if collected) are additionally encrypted at the application level using envelope encryption with per-tenant keys stored in a secrets manager.

### 14.6 Security Auditing (GAP-161, GAP-162)

**GAP-161: Penetration testing and security audits.**

**Decision:** Annual third-party penetration test. Automated security scanning (dependency vulnerabilities, OWASP top 10) runs in CI on every commit.

**GAP-162: SOC 2 compliance.**

**DECISION NEEDED:** SOC 2 Type II certification is expensive and time-consuming. Recommendation: target SOC 2 Type II for Year 2 when enterprise customers are being pursued. For Year 1, document security practices and maintain an internal controls framework that aligns with SOC 2 requirements so the audit process is faster when initiated.

### 14.7 Data Breach Notification (GAP-163)

**GAP-163: Data breach notification.**

**Decision:** Maintain a breach response plan that includes:
- Detection: Automated monitoring for unusual data access patterns.
- Containment: Ability to revoke all JWTs for a company or the entire platform.
- Notification: Template-based notification system. California requires 72-hour notification. Other states vary. The platform will notify all affected tenants within 48 hours.
- Documentation: Full audit trail of the breach timeline, scope, and remediation.

### 14.8 Platform Admin Data Access (GAP-164)

**GAP-164: Your employees shouldn't browse customer data without reason.**

**Decision:** Platform admin access to tenant data requires:
1. A support ticket or documented business reason.
2. Explicit "impersonation" mode that is logged to an immutable audit trail.
3. Time-limited session (max 1 hour, must re-authorize).
4. Customer is optionally notified when their data is accessed by platform staff (configurable per tenant -- enterprise customers can require this).

```sql
CREATE TABLE platform_admin_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  target_company_id UUID NOT NULL REFERENCES companies(id),
  reason TEXT NOT NULL,
  ticket_id TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  actions_taken JSONB DEFAULT '[]'
);
```

### 14.9 Legal Requests (GAP-167)

**GAP-167: How do you handle subpoena or legal requests for customer data?**

**Decision:** Legal process:
1. Validate the legal request (subpoena, court order, etc.) with legal counsel.
2. Notify the affected tenant (unless prohibited by the order, e.g., gag order).
3. Produce only the data specified in the request (minimum necessary).
4. Use the data export system (GAP-012) to generate the export, filtered to the relevant scope.
5. Log the request and response in the legal hold system.

### 14.10 Data Residency (GAP-014, GAP-168)

**GAP-014: Some customers may require data stored in specific geographic regions.**
**GAP-168: Government projects may require US-only data storage.**

**Decision:** Supabase projects can be provisioned in specific AWS regions. For the initial launch, all data is stored in `us-east-1` (N. Virginia).

For customers requiring specific data residency:
- **US-only requirement (most common):** Already satisfied by default.
- **Specific region requirement (rare, enterprise):** Deploy a dedicated Supabase project in the required region. This is an enterprise-tier feature with a price premium.
- `companies.data_region` tracks where the company's data resides.
- `companies.data_residency_requirement` documents the contractual requirement.

**Future:** If the platform expands internationally, implement a routing layer that directs API calls to the correct regional database based on the company's `data_region`.

---

## 15. Per-Tenant Backup and Restore (GAP-011)

**GAP-011: Tenant-level backup and restore.**

**Decision:** Since all tenants share one database, per-tenant restore is not a simple "restore from backup." The approach:

1. **Platform-level backups:** Supabase provides automatic daily backups and point-in-time recovery for the entire database.
2. **Per-tenant logical export:** The full data export (GAP-012) can be run at any time. Tenants can schedule automatic weekly exports (stored in their Supabase Storage bucket, retained for 90 days).
3. **Per-tenant restore:** If a tenant needs to revert to a previous state:
   - Use the logical export from the desired point in time.
   - Create a staging environment with the exported data.
   - Tenant reviews and confirms the restore.
   - Import the data back, replacing current records (within a transaction).
4. **Enterprise option:** Dedicated Supabase project allows standard database-level point-in-time recovery per-tenant.

**DECISION NEEDED:** Should automatic weekly exports be a paid feature or available to all tiers?

---

## 16. Concurrent Users and Load Testing (GAP-010)

**GAP-010: Maximum concurrent users per tenant and per platform.**

**Decision:**

| Metric | Target |
|--------|--------|
| Max concurrent users per tenant | No hard limit; soft limit based on plan |
| Max concurrent users platform-wide | 10,000 (Year 1), 50,000 (Year 3) |
| API response time (p95) | < 200ms for read operations |
| API response time (p99) | < 500ms for write operations |
| SSE connections per tenant | Max 50 (configurable per plan) |
| File upload concurrency per tenant | 5 simultaneous uploads |

**Load testing:**
- Before each major release, run load tests simulating peak usage: Monday morning (high login volume), end-of-month (heavy invoicing and draw processing), and mid-project (heavy daily log and photo upload activity).
- Use k6 or Artillery for automated load testing in CI/CD pipeline.
- Alert on p95 response time exceeding 500ms.

---

## 17. File and Storage Access

### 17.1 File Scoping

The `files` table carries a direct `company_id` column. Files are stored in Supabase Storage with paths that encode the company context:

```
storage/{company_id}/{job_id}/files/{file_id}/{filename}
storage/{company_id}/company-files/{file_id}/{filename}
```

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

### 17.2 Photo Scoping

Photos are scoped through `job_id`, which in turn is scoped to a company:

```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT,
  portal_visible BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES users(id)
);
```

### 17.3 Portal Visibility

Files, photos, and folders have a `portal_visible` flag that controls whether the asset is visible to client portal users. Portal users are scoped through the `clients` table, which itself is scoped by `company_id`. This means portal users can only see assets marked as portal-visible within their own company's jobs.

### 17.4 Supabase Storage Policies

Storage buckets use policies scoped by `company_id` extracted from the storage path:

```sql
-- Storage policy: users can only access files in their company's path
CREATE POLICY "Company file access" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project-files'
    AND (storage.foldername(name))[1] = get_current_company_id()::TEXT
  );
```

---

## 18. Per-Tenant Configuration

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

See `configuration-engine.md` for the full configuration system design.

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

## 19. Geographic and Regional Variability (GAP-036 through GAP-050, GAP-581 through GAP-590)

Regional variability is a core requirement for a national SaaS platform. Every jurisdiction-dependent feature must be configurable per tenant AND per project (since a builder may work in multiple jurisdictions).

### 19.1 Regional Configuration Architecture

Regional configuration is stored at three levels:

```
Level 3 (most specific):  Project jurisdiction overrides (jobs.settings.jurisdiction)
                             |
Level 2:                  Company default jurisdiction (companies.settings.default_jurisdiction)
                             |
Level 1 (least specific): Platform jurisdiction database (platform-maintained)
```

#### Jurisdiction Database

```sql
CREATE TABLE jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Location hierarchy
  state TEXT NOT NULL,
  county TEXT,
  municipality TEXT,

  -- Unique identifier
  fips_code TEXT,                      -- Federal Information Processing Standards code

  -- Tax Rules (GAP-036, GAP-049)
  sales_tax_rate DECIMAL(6,4),
  tax_applies_to_materials BOOLEAN DEFAULT true,
  tax_applies_to_labor BOOLEAN DEFAULT false,
  tax_applies_to_equipment BOOLEAN DEFAULT false,
  construction_use_tax_rate DECIMAL(6,4),

  -- Lien Law (GAP-037, GAP-050)
  lien_law_reference JSONB,           -- { "preliminary_notice_days": 20, "lien_deadline_days": 90, ... }
  lien_waiver_forms JSONB,            -- References to state-specific form templates
  mechanics_lien_statutory_form TEXT,  -- Reference to statutory form template

  -- Building Codes (GAP-038, GAP-581)
  building_code_edition TEXT,         -- e.g., "2021 IRC", "2018 IBC"
  energy_code TEXT,                   -- (GAP-588) e.g., "2021 IECC Climate Zone 4"
  climate_zone TEXT,                  -- IECC climate zone
  seismic_design_category TEXT,       -- (GAP-590) A through F
  wind_speed_design INTEGER,          -- mph
  flood_zone TEXT,
  wildfire_risk_zone TEXT,            -- (GAP-589) WUI zone classification

  -- Permits (GAP-039, GAP-582)
  permit_process_notes TEXT,
  permit_submission_type TEXT,        -- 'online', 'in-person', 'combined'
  typical_permit_timeline_days INTEGER,

  -- Insurance (GAP-040)
  min_gl_coverage INTEGER,            -- Minimum general liability
  min_wc_coverage INTEGER,            -- Minimum workers comp
  required_endorsements JSONB,

  -- Labor (GAP-044, GAP-585)
  prevailing_wage_required BOOLEAN DEFAULT false,
  labor_shortage_index DECIMAL(3,1),  -- 1-10 scale, platform-maintained

  -- Work Rules (GAP-046)
  construction_start_hour INTEGER DEFAULT 7,
  construction_end_hour INTEGER DEFAULT 19,
  weekend_work_allowed BOOLEAN DEFAULT true,
  noise_ordinance_notes TEXT,

  -- Environment (GAP-047)
  environmental_regulations JSONB,    -- Coastal, wetlands, endangered species notes

  -- Licensing (GAP-048)
  contractor_license_required BOOLEAN DEFAULT true,
  license_types JSONB,                -- Required license types for this jurisdiction

  -- Foundation Types (GAP-587)
  common_foundation_types JSONB,      -- ['slab', 'crawlspace', 'basement', 'piling']

  -- Holidays (GAP-045)
  local_holidays JSONB,               -- Additional local holidays beyond federal

  -- Metadata
  last_verified_at TIMESTAMPTZ,
  source TEXT,                        -- Where this data came from
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jurisdictions_state ON jurisdictions(state);
CREATE INDEX idx_jurisdictions_location ON jurisdictions(state, county, municipality);
```

### 19.2 Tax Rules (GAP-036, GAP-049)

**GAP-036: Tax rules vary by state, county, and municipality.**
**GAP-049: Sales tax rules for construction vary by state.**

**Decision:** Tax configuration follows the jurisdiction hierarchy:

1. Platform provides the `jurisdictions` table with base tax rates for all US states and major counties/municipalities.
2. Builders can override tax rates at the company level and project level.
3. The configuration engine resolves: project override > company override > jurisdiction table > zero.
4. Tax applicability (materials, labor, equipment) is configurable per jurisdiction and per company.

### 19.3 Lien Law and Mechanic's Liens (GAP-037, GAP-050)

**GAP-037: Lien law varies by state.**
**GAP-050: Mechanic's lien procedures and statutory forms vary by state.**

**Decision:** State-specific lien law data is maintained in the `jurisdictions` table and the document templates system:

- `jurisdictions.lien_law_reference` stores structured lien law data (notice deadlines, filing deadlines, waiver types).
- State-specific lien waiver form templates are stored in `document_templates` with `template_type = 'lien_waiver'` and a `jurisdiction_state` attribute.
- The system auto-selects the correct form based on the project's jurisdiction.
- Deadline tracking: When a project is created with a jurisdiction, the system calculates lien-related deadlines and creates notification triggers.

### 19.4 Building Codes and Inspections (GAP-038, GAP-581, GAP-588, GAP-589, GAP-590)

**GAP-038: Building codes vary by jurisdiction.**
**GAP-581: Building codes differ by state and jurisdiction.**
**GAP-588: Energy code requirements vary by climate zone.**
**GAP-589: Wildfire zone construction requirements.**
**GAP-590: High-seismic zone requirements.**

**Decision:** Building code data is maintained in the `jurisdictions` table. The platform provides:

1. A reference database of building code editions and climate zones.
2. Configurable inspection checklists per jurisdiction (stored in `company_config` with `config_domain = 'inspections'`).
3. Code-specific checklist items that auto-populate based on the project's jurisdiction.
4. Builders can customize checklists for their specific jurisdiction's interpretation.

**DECISION NEEDED:** How frequently should the platform update building code data? Who maintains it? Options:
- (A) Platform team maintains it manually (labor-intensive but accurate).
- (B) Community-maintained with platform review (like a wiki).
- (C) Partnership with a building code data provider (most scalable).

### 19.5 Permits (GAP-039, GAP-582)

**GAP-039: Permit types and processes vary by municipality.**
**GAP-582: Permit processes vary by municipality.**

**Decision:** Permit configuration is per-jurisdiction and per-company:

- `jurisdictions` provides baseline permit process info (online vs. in-person, typical timeline).
- Each builder configures their own permit workflows in `company_config` with `config_domain = 'permits'`.
- Permit types are fully configurable per company (some builders track 5 permit types, others track 20).
- The platform provides a library of common permit types that builders can adopt or modify.

### 19.6 Insurance Requirements (GAP-040)

**GAP-040: Insurance requirements vary by state.**

**Decision:** Insurance minimums are tracked in the `jurisdictions` table. The vendor compliance module uses these to flag vendors whose insurance does not meet jurisdiction requirements. Builders can set stricter requirements at the company level.

### 19.7 Contract Law (GAP-041)

**GAP-041: Contract law varies by state. Template contracts must have state-specific language.**

**Decision:** Document templates (stored in `document_templates`) can be tagged with applicable jurisdictions. The platform provides state-specific contract clause libraries:

```sql
CREATE TABLE contract_clauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  -- NULL company_id = platform-provided clause

  jurisdiction_state TEXT,           -- NULL = all states
  clause_type TEXT NOT NULL,         -- 'dispute_resolution', 'lien_waiver', 'warranty', etc.
  title TEXT NOT NULL,
  body_html TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false, -- Required by law in this jurisdiction

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 19.8 Weather and Climate (GAP-042, GAP-583, GAP-586)

**GAP-042: Weather patterns vary by region. Scheduling intelligence must account for regional climate.**
**GAP-583: Weather data for all US regions.**
**GAP-586: Natural disaster considerations by region.**

**Decision:** Weather integration via a single API provider (e.g., OpenWeatherMap or Visual Crossing):

- Current weather displayed on daily logs (auto-populated based on project location).
- Historical weather patterns used by the scheduling AI to predict weather delays.
- Regional climate profiles stored in `jurisdictions` (typical rain days per month, freeze risk months, hurricane season).
- Natural disaster risk levels stored in `jurisdictions` for risk assessment displays.

### 19.9 Material and Labor Markets (GAP-043, GAP-044, GAP-584, GAP-585)

**GAP-043: Material pricing varies by region.**
**GAP-044: Labor rates vary by region.**
**GAP-584: Material availability by region.**
**GAP-585: Regional labor market conditions.**

**Decision:** Regional cost intelligence feeds into the benchmarking system (Section 13):

- Material and labor cost benchmarks are region-adjusted when displayed.
- Builders opt into sharing anonymized cost data for regional benchmarks.
- The AI engine uses regional data when generating estimates.
- Material availability data is not maintained by the platform (too volatile); instead, the platform integrates with supplier APIs where available.

**DECISION NEEDED:** Should the platform maintain a regional cost index, or rely entirely on crowd-sourced tenant data? A platform-maintained index would be more accurate in early days when tenant data is sparse.

### 19.10 Foundation Types (GAP-587)

**GAP-587: Building on different foundation types.**

**Decision:** Foundation type is a configurable field on the `jobs` table (already exists as part of project details). The `jurisdictions` table stores common foundation types for the region, which pre-populates the dropdown when creating a project. Cost code templates include region-appropriate foundation line items.

---

## 20. Disaster Recovery and Business Continuity (GAP-591 through GAP-598)

### 20.1 Recovery Objectives (GAP-591, GAP-592)

**GAP-591: RPO (Recovery Point Objective).**
**GAP-592: RTO (Recovery Time Objective).**

**Decision:**

| Objective | Target | Mechanism |
|-----------|--------|-----------|
| RPO | < 1 hour | Supabase continuous archiving (WAL-based). Point-in-time recovery to any second within retention window. |
| RTO | < 2 hours | Automated failover to standby replica. Manual intervention for full database restore. |

### 20.2 Geographic Redundancy (GAP-593)

**GAP-593: Geographic redundancy and failover.**

**Decision:** Supabase Pro plan includes automated backups. For production:
- Primary database in `us-east-1`.
- Read replica in `us-west-2` (for read scaling and geographic redundancy).
- Supabase handles automated failover for database-level failures.
- Application servers deployed in multiple availability zones.
- CDN (Cloudflare or similar) for static assets with automatic failover.

### 20.3 DR Testing (GAP-594)

**GAP-594: Disaster recovery testing frequency.**

**Decision:** Quarterly DR drills:
- Q1: Full database restore test (verify RPO/RTO targets met).
- Q2: Application failover test (simulate primary region failure).
- Q3: Data export/import test (verify full tenant export can be reimported).
- Q4: Communication test (verify status page, email notifications, and escalation procedures work).

### 20.4 Outage Communication (GAP-595)

**GAP-595: Communication during platform outages.**

**Decision:** Multi-channel communication:
- **Status page** (e.g., statuspage.io): Real-time status of all platform components.
- **In-app banner:** If the app is partially available, display degraded service notice.
- **Email notification:** Sent to all company owners when platform-wide outage occurs.
- **SMS notification (enterprise tier):** Critical outage alerts via SMS to designated contacts.

### 20.5 Platform Survival (GAP-596)

**GAP-596: If your company goes under, can builders get their data?**

**Decision:** Data portability guarantees:
- Full data export available at any time (GAP-012).
- Terms of service include a "data escrow" clause: in the event of company dissolution, tenant data is maintained for 90 days and export links are sent to all company owners.
- Open data format: exports use standard CSV/JSON, not proprietary formats.
- **DECISION NEEDED:** Should we implement a formal data escrow arrangement with a third party for enterprise customers?

### 20.6 Rollback Procedures (GAP-597)

**GAP-597: How fast can you revert a bad release?**

**Decision:**
- Application deployments use blue-green deployment strategy. Rollback to previous version takes < 5 minutes.
- Database migrations are designed to be reversible. Each migration includes an `up` and `down` script.
- Feature flags allow disabling a problematic feature without a full rollback.
- Target: detect and rollback a bad release within 30 minutes of deployment.

### 20.7 Backup Strategy (GAP-598)

**GAP-598: Incremental vs. full backups.**

**Decision:** Supabase handles backup strategy at the infrastructure level:
- Continuous WAL archiving (effectively continuous incremental backup).
- Daily full snapshots.
- Point-in-time recovery available within the retention window (7 days on Pro plan, 30 days on Enterprise).
- Tenant-level logical exports (see GAP-011) supplement infrastructure backups.

---

## 21. Data Isolation Verification

### 21.1 Index Strategy

All tables with `company_id` have a dedicated index for efficient tenant-scoped queries:

- Pattern: `idx_{table}_company` on `{table}(company_id)`
- Composite indexes include `company_id` as the leading column for status/filter queries (e.g., `idx_jobs_status` on `jobs(company_id, status)`)
- Unique constraints that are per-tenant include `company_id` (e.g., `UNIQUE(company_id, code)` on `cost_codes`)

### 21.2 Foreign Key Cascades

All `company_id` foreign keys use `ON DELETE CASCADE`, ensuring that if a company is deleted, all associated data is automatically removed.

### 21.3 Verification Approach

Before launching each phase, the following must be verified:

1. **RLS policies tested** -- Confirm that queries from one company cannot return data from another.
2. **Data integrity** -- All relationships work correctly within a tenant boundary.
3. **Complete workflow** -- End-to-end user flows function within a single tenant context.
4. **Performance** -- List pages with tenant-scoped queries load quickly due to proper indexing.

### 21.4 Client Portal Isolation

Client portal users are authenticated separately from main application users. A portal user is linked to a `client`, which is linked to a `company`. Portal users can only see:

- Jobs associated with their client record
- Photos, files, and documents marked as `portal_visible`
- Draw requests for their jobs
- Selections assigned to their jobs

### 21.5 Vendor Portal Isolation

Vendor portal users are linked to a `vendor`, which is linked to a `company`. They access only bid packages, purchase orders, and other data associated with their vendor record within that company.

---

## 22. Enterprise Isolation Options

For enterprise customers who require physical data isolation beyond shared-database RLS:

| Option | Description | Premium |
|--------|-------------|---------|
| Dedicated Supabase project | Separate database instance, same application | Yes |
| Dedicated application instance | Separate app + database | Yes, significant |
| VPN/private link | Network-level isolation for API access | Yes |
| Custom data region | Database in a specific AWS region | Yes |
| BYOK encryption | Customer-managed encryption keys | Yes |

These are Year 2+ features for enterprise tier only.

---

## 23. Naming Conventions Supporting Multi-Tenancy

| Convention | Example | Purpose |
|------------|---------|---------|
| All tables use `snake_case` | `cost_codes`, `purchase_orders` | Consistency |
| Primary keys are `id` (UUID) | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` | Globally unique, no tenant-prefix needed |
| Foreign keys are `{entity}_id` | `company_id`, `job_id`, `vendor_id` | Clear ownership chain |
| Timestamps use `_at` suffix | `created_at`, `updated_at` | Consistent metadata |
| Boolean flags use `is_` or `has_` prefix | `is_active`, `is_1099` | Clear semantics |

---

## Gap Item Coverage Summary

| Gap Item | Section | Status |
|----------|---------|--------|
| GAP-001 | Section 1 | Decided: Shared database with RLS |
| GAP-002 | Section 6 | Decided: Multi-company memberships |
| GAP-003 | Section 7 | Decided: Module flags + feature flags |
| GAP-004 | Section 8 | Decided: Grace period -> read-only -> lockout |
| GAP-005 | Section 9.1 | Decided: 30-day cooling-off, then hard delete |
| GAP-006 | Section 12 | Decided: Parent-child company hierarchy |
| GAP-007 | Section 13 | Decided: Opt-in anonymous benchmarking |
| GAP-008 | Section 10 | Decided: Automated provisioning + seed data |
| GAP-009 | Section 10 | See configuration-engine.md (custom fields, workflows, reports) |
| GAP-010 | Section 16 | Decided: Targets defined, load testing plan |
| GAP-011 | Section 15 | Decided: Logical exports + enterprise PITR |
| GAP-012 | Section 9.2 | Decided: Full ZIP export on demand |
| GAP-013 | Section 11 | Decided: Multi-tier import strategy |
| GAP-014 | Section 14.10 | Decided: US-only default, regional for enterprise |
| GAP-015 | Section 5.4 | Decided: Per-tenant rate limiting via Redis |
| GAP-016 through GAP-035 | -- | See configuration-engine.md |
| GAP-036 | Section 19.2 | Decided: Jurisdiction-based tax config |
| GAP-037 | Section 19.3 | Decided: State-specific lien law data |
| GAP-038 | Section 19.4 | Decided: Jurisdiction building code DB |
| GAP-039 | Section 19.5 | Decided: Per-jurisdiction permit config |
| GAP-040 | Section 19.6 | Decided: Jurisdiction insurance minimums |
| GAP-041 | Section 19.7 | Decided: State-specific contract clauses |
| GAP-042 | Section 19.8 | Decided: Weather API integration |
| GAP-043 | Section 19.9 | Decided: Regional cost benchmarks |
| GAP-044 | Section 19.9 | Decided: Regional labor benchmarks |
| GAP-045 | Section 19.1 | Decided: Local holidays in jurisdiction DB |
| GAP-046 | Section 19.1 | Decided: Work hours in jurisdiction DB |
| GAP-047 | Section 19.1 | Decided: Environmental regs in jurisdiction DB |
| GAP-048 | Section 19.1 | Decided: Licensing in jurisdiction DB |
| GAP-049 | Section 19.2 | Decided: Construction-specific tax rules |
| GAP-050 | Section 19.3 | Decided: State-specific statutory forms |
| GAP-155 | Section 14.1 | Decided: Multi-layer testing + monitoring |
| GAP-156 | Section 14.2 | Decided: Separate vendor records per tenant |
| GAP-157 | Section 14.3 | Decided: Strict financial data isolation |
| GAP-158 | Section 6 | Decided: Deactivate old membership, create new |
| GAP-159 | Section 14.4 | Decided: Per-builder vendor portal login |
| GAP-160 | Section 14.5 | Decided: TLS 1.2+ in transit, AES-256 at rest |
| GAP-161 | Section 14.6 | Decided: Annual pen test + CI scanning |
| GAP-162 | Section 14.6 | DECISION NEEDED: SOC 2 timeline |
| GAP-163 | Section 14.7 | Decided: Breach response plan |
| GAP-164 | Section 14.8 | Decided: Audited impersonation mode |
| GAP-165 | Section 9.2 | Decided: Full data export + per-user export |
| GAP-166 | Section 13.1 | Decided: Anonymized with min 10 contributors |
| GAP-167 | Section 14.9 | Decided: Legal process with tenant notification |
| GAP-168 | Section 14.10 | Decided: US-only default, regional for enterprise |
| GAP-169 | Section 9.1 | Decided: 270 days post-lapse, 37 days post-delete |
| GAP-574 | Section 12.2 | Decided: Separate company records per LLC |
| GAP-575 | Section 12.2 | Decided: Child companies with cross-referral |
| GAP-576 | Section 12.2 | Decided: Division entity type |
| GAP-577 | Section 12.2 | Decided: Brand entity type |
| GAP-578 | Section 12.3 | DECISION NEEDED: M&A data merge process |
| GAP-579 | Section 12.4 | Decided: Franchise hierarchy model |
| GAP-580 | Section 12.5 | Decided: Tier-based growth path |
| GAP-581 | Section 19.4 | Decided: Jurisdiction building code DB |
| GAP-582 | Section 19.5 | Decided: Per-jurisdiction permit config |
| GAP-583 | Section 19.8 | Decided: Single weather API integration |
| GAP-584 | Section 19.9 | Decided: Supplier API integration (future) |
| GAP-585 | Section 19.9 | Decided: Regional labor data in jurisdiction DB |
| GAP-586 | Section 19.8 | Decided: Risk levels in jurisdiction DB |
| GAP-587 | Section 19.10 | Decided: Foundation type per jurisdiction |
| GAP-588 | Section 19.4 | Decided: Climate zone in jurisdiction DB |
| GAP-589 | Section 19.4 | Decided: WUI zone in jurisdiction DB |
| GAP-590 | Section 19.4 | Decided: Seismic category in jurisdiction DB |
| GAP-591 | Section 20.1 | Decided: RPO < 1 hour |
| GAP-592 | Section 20.1 | Decided: RTO < 2 hours |
| GAP-593 | Section 20.2 | Decided: Multi-region with read replica |
| GAP-594 | Section 20.3 | Decided: Quarterly DR drills |
| GAP-595 | Section 20.4 | Decided: Multi-channel outage communication |
| GAP-596 | Section 20.5 | Decided: Data portability guarantee |
| GAP-597 | Section 20.6 | Decided: Blue-green deployment, < 30 min rollback |
| GAP-598 | Section 20.7 | Decided: Continuous WAL + daily snapshots |

### Items Requiring Decisions

| Gap Item | Question | Section |
|----------|----------|---------|
| GAP-162 | When to pursue SOC 2 Type II certification? | 14.6 |
| GAP-578 | How to handle M&A data merge (managed service details)? | 12.3 |
| GAP-581/038 | Who maintains the building code database? | 19.4 |
| GAP-011 | Should automatic weekly exports be free or paid? | 15 |
| GAP-043/044 | Platform-maintained cost index vs. crowd-sourced only? | 19.9 |
| GAP-596 | Formal third-party data escrow for enterprise? | 20.5 |

---

*Document Version: 2.0*
*Created: 2026-02-11*
*Last Updated: 2026-02-11*
*Status: Comprehensive design covering all multi-tenancy, data isolation, multi-entity, geographic variability, and disaster recovery gap items.*
*Sources: data-model.md, system-architecture.md, gap-analysis-expanded.md (Sections 1, 6, 41-43)*
