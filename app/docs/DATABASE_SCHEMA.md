# RossOS Complete Database Schema

> **Purpose**: Definitive source of truth for ALL database tables, columns, constraints, indexes, and RLS policies.
>
> **Usage**: Reference this document when creating migrations. Every table here MUST be created.

---

## Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ROSSOS DATABASE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PHASE 1: FOUNDATION          PHASE 1.5: MIGRATION    PHASE 2: FINANCIAL    │
│  ─────────────────────        ──────────────────      ──────────────────    │
│  companies                    migrations              cost_codes            │
│  users                        migration_batches       budgets               │
│  user_roles                   migration_staging       budget_line_items     │
│  clients                      migration_mappings      invoices              │
│  contacts                     migration_cost_codes    invoice_line_items    │
│  addresses                    migration_id_maps       change_orders         │
│  jobs                                                 change_order_items    │
│  job_phases                                           draws                 │
│  job_team_members                                     draw_line_items       │
│  notes                                                payments              │
│  tags                                                 payment_allocations   │
│  entity_tags                                                                │
│  activity_log                                                               │
│                                                                              │
│  PHASE 3: FIELD/SCHEDULE      PHASE 4: SELECTIONS     PHASE 5: VENDORS      │
│  ─────────────────────        ──────────────────      ──────────────────    │
│  schedule_templates           selection_categories    vendors               │
│  schedule_items               selections              vendor_contacts       │
│  schedule_dependencies        selection_options       vendor_categories     │
│  daily_logs                   selection_approvals     vendor_documents      │
│  daily_log_entries            allowances              vendor_ratings        │
│  daily_log_crews              allowance_usage         bid_packages          │
│  photos                       specifications          bids                  │
│  photo_tags                                           bid_items             │
│  inspections                                          contracts             │
│  inspection_items                                     contract_items        │
│  punch_lists                                          contract_changes      │
│  punch_list_items                                     insurance_policies    │
│  safety_observations                                  lien_waivers          │
│  safety_incidents                                     safety_agreements     │
│                                                                              │
│  PHASE 6: CLIENT PORTAL       PHASE 7: REPORTS        PHASE 8: DOCUMENTS    │
│  ─────────────────────        ──────────────────      ──────────────────    │
│  client_portal_settings       saved_reports           documents             │
│  client_portal_access         report_schedules        document_versions     │
│  client_notifications         dashboard_widgets       document_folders      │
│  approval_requests            kpi_definitions         document_permissions  │
│                               kpi_snapshots           rfis                  │
│                                                       rfi_responses         │
│                                                       submittals            │
│                                                       submittal_reviews     │
│                                                       messages              │
│                                                       message_threads       │
│                                                       message_recipients    │
│                                                       notifications         │
│                                                                              │
│  INFRASTRUCTURE (Exists)                                                     │
│  ──────────────────────                                                     │
│  job_queue                                                                  │
│  audit_log                                                                  │
│  api_metrics                                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Multi-Tenancy Pattern

**EVERY tenant table MUST have:**
```sql
company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE
```

**EVERY tenant table MUST have RLS:**
```sql
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "{table_name}_tenant_isolation" ON {table_name}
    FOR ALL
    USING (company_id = get_current_company_id());

CREATE POLICY "{table_name}_tenant_insert" ON {table_name}
    FOR INSERT
    WITH CHECK (company_id = get_current_company_id());
```

**EVERY tenant table MUST have index:**
```sql
CREATE INDEX idx_{table_name}_company_id ON {table_name}(company_id);
```

---

## Phase 1: Foundation & Core Data

### companies
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    legal_name TEXT,
    dba_name TEXT,

    -- Contact
    email TEXT,
    phone TEXT,
    website TEXT,

    -- Address
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'US',

    -- Business Info
    tax_id TEXT,                          -- EIN
    license_number TEXT,
    license_state TEXT,
    license_expiry DATE,

    -- Settings
    timezone TEXT DEFAULT 'America/New_York',
    date_format TEXT DEFAULT 'MM/DD/YYYY',
    currency TEXT DEFAULT 'USD',
    fiscal_year_start INT DEFAULT 1,      -- Month (1-12)

    -- Branding
    logo_url TEXT,
    primary_color TEXT DEFAULT '#2563eb',

    -- Subscription
    plan TEXT DEFAULT 'trial',            -- trial, starter, professional, enterprise
    plan_started_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,

    -- Metadata
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS on companies - handled by user's company_id
CREATE INDEX idx_companies_name ON companies(name);
```

### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    auth_id UUID UNIQUE,                  -- Supabase Auth user ID

    -- Identity
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,

    -- Role & Access
    role TEXT NOT NULL DEFAULT 'viewer',  -- owner, admin, pm, field, viewer
    is_active BOOLEAN DEFAULT true,
    invited_at TIMESTAMPTZ,
    invited_by UUID REFERENCES users(id),
    accepted_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,

    -- Preferences
    timezone TEXT,                        -- Override company timezone
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',

    -- Metadata
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, email)
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_tenant_isolation" ON users
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_id ON users(auth_id);
```

### user_roles (permissions matrix)
```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                   -- Custom role name
    base_role TEXT NOT NULL,              -- owner, admin, pm, field, viewer

    -- Permissions (granular overrides)
    permissions JSONB DEFAULT '{}',
    /*
    {
        "jobs": {"create": true, "read": true, "update": true, "delete": false},
        "budgets": {"create": true, "read": true, "update": true, "delete": false},
        "invoices": {"create": true, "read": true, "update": false, "delete": false, "approve": false},
        ...
    }
    */

    is_system BOOLEAN DEFAULT false,      -- System roles can't be deleted
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, name)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_tenant_isolation" ON user_roles
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_user_roles_company_id ON user_roles(company_id);
```

### clients
```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Type
    client_type TEXT DEFAULT 'individual', -- individual, couple, company, trust

    -- For individuals/couples
    first_name TEXT,
    last_name TEXT,
    spouse_first_name TEXT,
    spouse_last_name TEXT,

    -- For companies/trusts
    company_name TEXT,

    -- Display (computed or override)
    display_name TEXT NOT NULL,

    -- Contact
    email TEXT,
    phone TEXT,
    secondary_phone TEXT,
    preferred_contact TEXT DEFAULT 'email', -- email, phone, text

    -- Status
    status TEXT DEFAULT 'active',         -- prospect, active, completed, inactive
    source TEXT,                          -- referral, website, advertisement, etc.
    referred_by UUID REFERENCES clients(id),

    -- Notes
    internal_notes TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_tenant_isolation" ON clients
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_clients_company_id ON clients(company_id);
CREATE INDEX idx_clients_display_name ON clients(display_name);
CREATE INDEX idx_clients_status ON clients(status);
```

### contacts
```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Polymorphic relationship
    entity_type TEXT NOT NULL,            -- client, vendor, job, user
    entity_id UUID NOT NULL,

    -- Contact Info
    contact_type TEXT NOT NULL,           -- primary, billing, site, emergency, spouse
    first_name TEXT NOT NULL,
    last_name TEXT,
    title TEXT,                           -- Mr., Mrs., Dr., etc.
    job_title TEXT,                       -- Role at company

    -- Communication
    email TEXT,
    phone TEXT,
    phone_type TEXT DEFAULT 'mobile',     -- mobile, work, home
    secondary_phone TEXT,
    secondary_phone_type TEXT,

    -- Preferences
    preferred_contact TEXT DEFAULT 'email',
    do_not_contact BOOLEAN DEFAULT false,

    -- Notes
    notes TEXT,

    -- Metadata
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_tenant_isolation" ON contacts
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_entity ON contacts(entity_type, entity_id);
```

### addresses
```sql
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Polymorphic relationship
    entity_type TEXT NOT NULL,            -- client, vendor, job, company
    entity_id UUID NOT NULL,

    -- Address Type
    address_type TEXT NOT NULL,           -- primary, mailing, billing, job_site, property

    -- Address Fields
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'US',
    county TEXT,

    -- Geo
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Property Details (for job sites)
    lot_number TEXT,
    block_number TEXT,
    subdivision TEXT,
    parcel_id TEXT,                       -- Tax parcel number

    -- Metadata
    is_primary BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,              -- Address verification timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "addresses_tenant_isolation" ON addresses
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_addresses_company_id ON addresses(company_id);
CREATE INDEX idx_addresses_entity ON addresses(entity_type, entity_id);
```

### jobs
```sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id),

    -- Identification
    job_number TEXT NOT NULL,             -- Company's internal job number
    name TEXT NOT NULL,                   -- Project name
    description TEXT,

    -- Type & Category
    project_type TEXT,                    -- new_construction, renovation, addition, etc.
    building_type TEXT,                   -- single_family, multi_family, commercial

    -- Status
    status TEXT DEFAULT 'planning',       -- lead, planning, pre_construction, active, on_hold, completed, cancelled
    status_changed_at TIMESTAMPTZ,

    -- Dates
    estimated_start_date DATE,
    actual_start_date DATE,
    estimated_end_date DATE,
    actual_end_date DATE,

    -- Financials (Summary - details in budget tables)
    contract_amount DECIMAL(15, 2) DEFAULT 0,
    revised_contract_amount DECIMAL(15, 2) DEFAULT 0,  -- After COs

    -- Specs
    square_footage INT,
    lot_size DECIMAL(10, 2),              -- Acres or SF
    lot_size_unit TEXT DEFAULT 'acres',
    stories INT DEFAULT 1,
    bedrooms INT,
    bathrooms DECIMAL(3, 1),
    garages INT,

    -- Location (denormalized from address for quick access)
    address_line1 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,

    -- Construction Details
    permit_number TEXT,
    permit_date DATE,
    certificate_of_occupancy_date DATE,

    -- Relationships
    primary_pm_id UUID REFERENCES users(id),
    superintendent_id UUID REFERENCES users(id),

    -- Settings
    settings JSONB DEFAULT '{}',

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, job_number)
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jobs_tenant_isolation" ON jobs
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_job_number ON jobs(job_number);
```

### job_phases
```sql
CREATE TABLE job_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    -- Phase Info
    name TEXT NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,

    -- Status
    status TEXT DEFAULT 'pending',        -- pending, in_progress, completed, skipped

    -- Dates
    estimated_start_date DATE,
    actual_start_date DATE,
    estimated_end_date DATE,
    actual_end_date DATE,

    -- Progress
    percent_complete DECIMAL(5, 2) DEFAULT 0,

    -- Financial
    budget_amount DECIMAL(15, 2) DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE job_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_phases_tenant_isolation" ON job_phases
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_job_phases_company_id ON job_phases(company_id);
CREATE INDEX idx_job_phases_job_id ON job_phases(job_id);
```

### job_team_members
```sql
CREATE TABLE job_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Role on this job
    role TEXT NOT NULL,                   -- pm, superintendent, assistant_pm, estimator, etc.

    -- Access
    can_view_financials BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT true,

    -- Dates
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    removed_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(job_id, user_id)
);

ALTER TABLE job_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_team_members_tenant_isolation" ON job_team_members
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_job_team_members_company_id ON job_team_members(company_id);
CREATE INDEX idx_job_team_members_job_id ON job_team_members(job_id);
CREATE INDEX idx_job_team_members_user_id ON job_team_members(user_id);
```

### notes
```sql
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Polymorphic relationship
    entity_type TEXT NOT NULL,            -- job, client, vendor, invoice, etc.
    entity_id UUID NOT NULL,

    -- Content
    content TEXT NOT NULL,

    -- Type
    note_type TEXT DEFAULT 'general',     -- general, meeting, phone_call, site_visit, internal

    -- Visibility
    is_internal BOOLEAN DEFAULT true,     -- Internal vs client-visible
    is_pinned BOOLEAN DEFAULT false,

    -- Author
    created_by UUID NOT NULL REFERENCES users(id),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_tenant_isolation" ON notes
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_notes_company_id ON notes(company_id);
CREATE INDEX idx_notes_entity ON notes(entity_type, entity_id);
```

### tags
```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    color TEXT DEFAULT '#6b7280',         -- Hex color

    -- Scope
    entity_types TEXT[] DEFAULT '{}',     -- Which entity types can use this tag

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, name)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tags_tenant_isolation" ON tags
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_tags_company_id ON tags(company_id);
```

### entity_tags
```sql
CREATE TABLE entity_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,

    -- Polymorphic relationship
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    UNIQUE(tag_id, entity_type, entity_id)
);

ALTER TABLE entity_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entity_tags_tenant_isolation" ON entity_tags
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_entity_tags_company_id ON entity_tags(company_id);
CREATE INDEX idx_entity_tags_entity ON entity_tags(entity_type, entity_id);
```

### activity_log
```sql
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Who
    user_id UUID REFERENCES users(id),

    -- What
    action TEXT NOT NULL,                 -- created, updated, deleted, viewed, approved, etc.
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    entity_name TEXT,                     -- Denormalized for display

    -- Details
    changes JSONB,                        -- Before/after for updates
    metadata JSONB,

    -- When
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_log_tenant_isolation" ON activity_log
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_activity_log_company_id ON activity_log(company_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);
```

---

## Phase 1.5: Migration System

### migrations
```sql
CREATE TABLE migrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Source
    source_system TEXT NOT NULL,          -- buildertrend, coconstruct, quickbooks, procore, excel
    source_version TEXT,

    -- Status
    status TEXT DEFAULT 'pending',        -- pending, uploading, parsing, mapping, validating, importing, completed, failed, rolled_back

    -- Progress
    current_step TEXT,
    progress_percent INT DEFAULT 0,

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Configuration
    config JSONB DEFAULT '{}',            -- Source-specific settings
    options JSONB DEFAULT '{}',           -- Import options (historical, active, etc.)

    -- Results
    statistics JSONB DEFAULT '{}',        -- Counts by entity type
    error_log JSONB DEFAULT '[]',
    warnings JSONB DEFAULT '[]',

    -- User
    created_by UUID NOT NULL REFERENCES users(id),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE migrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "migrations_tenant_isolation" ON migrations
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_migrations_company_id ON migrations(company_id);
CREATE INDEX idx_migrations_status ON migrations(status);
```

### migration_batches
```sql
CREATE TABLE migration_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_id UUID NOT NULL REFERENCES migrations(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Batch Info
    batch_number INT NOT NULL,
    entity_type TEXT NOT NULL,            -- jobs, clients, invoices, etc.

    -- Status
    status TEXT DEFAULT 'pending',        -- pending, processing, completed, failed

    -- Progress
    total_records INT DEFAULT 0,
    processed_records INT DEFAULT 0,
    success_count INT DEFAULT 0,
    error_count INT DEFAULT 0,

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Errors
    errors JSONB DEFAULT '[]',

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE migration_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "migration_batches_tenant_isolation" ON migration_batches
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_migration_batches_migration_id ON migration_batches(migration_id);
CREATE INDEX idx_migration_batches_company_id ON migration_batches(company_id);
```

### migration_staging
```sql
CREATE TABLE migration_staging (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_id UUID NOT NULL REFERENCES migrations(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES migration_batches(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Source Data
    entity_type TEXT NOT NULL,
    source_id TEXT,                       -- ID from source system
    source_data JSONB NOT NULL,           -- Raw data from source

    -- Transformation
    transformed_data JSONB,               -- After mapping

    -- Target
    target_id UUID,                       -- ID after import

    -- Status
    status TEXT DEFAULT 'pending',        -- pending, transformed, validated, imported, skipped, error

    -- Validation
    validation_errors JSONB DEFAULT '[]',
    validation_warnings JSONB DEFAULT '[]',

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE migration_staging ENABLE ROW LEVEL SECURITY;

CREATE POLICY "migration_staging_tenant_isolation" ON migration_staging
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_migration_staging_migration_id ON migration_staging(migration_id);
CREATE INDEX idx_migration_staging_company_id ON migration_staging(company_id);
CREATE INDEX idx_migration_staging_entity_type ON migration_staging(entity_type);
CREATE INDEX idx_migration_staging_status ON migration_staging(status);
```

### migration_field_mappings
```sql
CREATE TABLE migration_field_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Mapping Scope
    source_system TEXT NOT NULL,
    entity_type TEXT NOT NULL,

    -- Field Mapping
    source_field TEXT NOT NULL,
    target_field TEXT NOT NULL,

    -- Transformation
    transform_type TEXT,                  -- direct, lookup, format, calculate
    transform_config JSONB,               -- Transformation parameters

    -- Flags
    is_required BOOLEAN DEFAULT false,
    is_custom BOOLEAN DEFAULT false,      -- User-created vs system default

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, source_system, entity_type, source_field)
);

ALTER TABLE migration_field_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "migration_field_mappings_tenant_isolation" ON migration_field_mappings
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_migration_field_mappings_company_id ON migration_field_mappings(company_id);
```

### migration_cost_code_mappings
```sql
CREATE TABLE migration_cost_code_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_id UUID NOT NULL REFERENCES migrations(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Source
    source_code TEXT NOT NULL,
    source_name TEXT,
    source_parent TEXT,

    -- Target
    target_cost_code_id UUID REFERENCES cost_codes(id),

    -- Matching
    match_type TEXT,                      -- exact, fuzzy, manual, created
    confidence_score DECIMAL(3, 2),

    -- Status
    status TEXT DEFAULT 'pending',        -- pending, matched, reviewed, confirmed
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE migration_cost_code_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "migration_cost_code_mappings_tenant_isolation" ON migration_cost_code_mappings
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_migration_cost_code_mappings_migration_id ON migration_cost_code_mappings(migration_id);
CREATE INDEX idx_migration_cost_code_mappings_company_id ON migration_cost_code_mappings(company_id);
```

### migration_id_mappings
```sql
CREATE TABLE migration_id_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_id UUID NOT NULL REFERENCES migrations(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Mapping
    entity_type TEXT NOT NULL,
    source_id TEXT NOT NULL,
    target_id UUID NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(migration_id, entity_type, source_id)
);

ALTER TABLE migration_id_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "migration_id_mappings_tenant_isolation" ON migration_id_mappings
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_migration_id_mappings_migration_id ON migration_id_mappings(migration_id);
CREATE INDEX idx_migration_id_mappings_company_id ON migration_id_mappings(company_id);
CREATE INDEX idx_migration_id_mappings_lookup ON migration_id_mappings(migration_id, entity_type, source_id);
```

---

## Phase 2: Financial Management

### cost_codes
```sql
CREATE TABLE cost_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Identification
    code TEXT NOT NULL,                   -- e.g., "03-100"
    name TEXT NOT NULL,                   -- e.g., "Concrete Foundation"
    description TEXT,

    -- Hierarchy
    parent_id UUID REFERENCES cost_codes(id),
    level INT DEFAULT 0,                  -- 0 = top level
    sort_order INT DEFAULT 0,

    -- Type
    cost_type TEXT DEFAULT 'direct',      -- direct, indirect, overhead, labor, material, equipment

    -- Defaults
    default_unit TEXT,                    -- SF, LF, EA, HR, etc.
    default_unit_cost DECIMAL(15, 4),

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,      -- System codes can't be deleted

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, code)
);

ALTER TABLE cost_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cost_codes_tenant_isolation" ON cost_codes
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_cost_codes_company_id ON cost_codes(company_id);
CREATE INDEX idx_cost_codes_parent_id ON cost_codes(parent_id);
CREATE INDEX idx_cost_codes_code ON cost_codes(code);
```

### budgets
```sql
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    -- Budget Info
    name TEXT DEFAULT 'Primary Budget',
    description TEXT,
    version INT DEFAULT 1,

    -- Type
    budget_type TEXT DEFAULT 'construction', -- construction, owner, internal

    -- Status
    status TEXT DEFAULT 'draft',          -- draft, active, locked, archived
    locked_at TIMESTAMPTZ,
    locked_by UUID REFERENCES users(id),

    -- Totals (calculated from line items)
    total_estimated DECIMAL(15, 2) DEFAULT 0,
    total_committed DECIMAL(15, 2) DEFAULT 0,
    total_actual DECIMAL(15, 2) DEFAULT 0,
    total_projected DECIMAL(15, 2) DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(job_id, budget_type, version)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budgets_tenant_isolation" ON budgets
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_budgets_company_id ON budgets(company_id);
CREATE INDEX idx_budgets_job_id ON budgets(job_id);
```

### budget_line_items
```sql
CREATE TABLE budget_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    cost_code_id UUID REFERENCES cost_codes(id),
    job_phase_id UUID REFERENCES job_phases(id),

    -- Line Item Info
    description TEXT,
    sort_order INT DEFAULT 0,

    -- Quantities
    quantity DECIMAL(15, 4),
    unit TEXT,
    unit_cost DECIMAL(15, 4),

    -- Amounts
    estimated_amount DECIMAL(15, 2) DEFAULT 0,
    committed_amount DECIMAL(15, 2) DEFAULT 0,    -- From contracts/POs
    actual_amount DECIMAL(15, 2) DEFAULT 0,       -- From invoices
    projected_amount DECIMAL(15, 2),              -- Override or calculated

    -- Variance
    variance_amount DECIMAL(15, 2) GENERATED ALWAYS AS (estimated_amount - COALESCE(projected_amount, actual_amount)) STORED,

    -- Notes
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE budget_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budget_line_items_tenant_isolation" ON budget_line_items
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_budget_line_items_company_id ON budget_line_items(company_id);
CREATE INDEX idx_budget_line_items_budget_id ON budget_line_items(budget_id);
CREATE INDEX idx_budget_line_items_cost_code_id ON budget_line_items(cost_code_id);
```

### invoices
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id),
    contract_id UUID REFERENCES contracts(id),

    -- Identification
    invoice_number TEXT NOT NULL,
    vendor_invoice_number TEXT,           -- Vendor's invoice number

    -- Type
    invoice_type TEXT DEFAULT 'standard', -- standard, retainage, back_charge, credit

    -- Dates
    invoice_date DATE NOT NULL,
    received_date DATE,
    due_date DATE,

    -- Amounts
    subtotal DECIMAL(15, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) DEFAULT 0,
    retainage_amount DECIMAL(15, 2) DEFAULT 0,
    net_amount DECIMAL(15, 2) DEFAULT 0,  -- Total - Retainage
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    balance_due DECIMAL(15, 2) GENERATED ALWAYS AS (net_amount - paid_amount) STORED,

    -- Status
    status TEXT DEFAULT 'pending',        -- draft, pending, approved, rejected, paid, void
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    rejected_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES users(id),
    rejection_reason TEXT,

    -- Workflow
    requires_approval BOOLEAN DEFAULT true,
    approval_threshold DECIMAL(15, 2),    -- Amount that requires additional approval

    -- Notes
    description TEXT,
    internal_notes TEXT,

    -- Attachments
    attachment_urls TEXT[],

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, invoice_number)
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_tenant_isolation" ON invoices
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_job_id ON invoices(job_id);
CREATE INDEX idx_invoices_vendor_id ON invoices(vendor_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
```

### invoice_line_items
```sql
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    cost_code_id UUID REFERENCES cost_codes(id),
    budget_line_item_id UUID REFERENCES budget_line_items(id),
    job_phase_id UUID REFERENCES job_phases(id),

    -- Line Item
    description TEXT,
    sort_order INT DEFAULT 0,

    -- Quantities
    quantity DECIMAL(15, 4),
    unit TEXT,
    unit_cost DECIMAL(15, 4),

    -- Amounts
    amount DECIMAL(15, 2) NOT NULL,
    tax_amount DECIMAL(15, 2) DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_line_items_tenant_isolation" ON invoice_line_items
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_invoice_line_items_company_id ON invoice_line_items(company_id);
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_line_items_cost_code_id ON invoice_line_items(cost_code_id);
```

### change_orders
```sql
CREATE TABLE change_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    -- Identification
    co_number TEXT NOT NULL,              -- e.g., "CO-001"
    title TEXT NOT NULL,
    description TEXT,

    -- Type
    co_type TEXT DEFAULT 'owner',         -- owner, field_condition, design_change, allowance, internal
    initiated_by TEXT,                    -- client, builder, architect, field

    -- Amounts
    amount DECIMAL(15, 2) DEFAULT 0,
    markup_percent DECIMAL(5, 2),
    markup_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) DEFAULT 0,

    -- Schedule Impact
    schedule_impact_days INT DEFAULT 0,

    -- Status
    status TEXT DEFAULT 'draft',          -- draft, pending_approval, approved, rejected, void
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    client_approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,

    -- Signatures
    client_signature_url TEXT,
    builder_signature_url TEXT,

    -- Attachments
    attachment_urls TEXT[],

    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(job_id, co_number)
);

ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "change_orders_tenant_isolation" ON change_orders
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_change_orders_company_id ON change_orders(company_id);
CREATE INDEX idx_change_orders_job_id ON change_orders(job_id);
CREATE INDEX idx_change_orders_status ON change_orders(status);
```

### change_order_items
```sql
CREATE TABLE change_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    change_order_id UUID NOT NULL REFERENCES change_orders(id) ON DELETE CASCADE,
    cost_code_id UUID REFERENCES cost_codes(id),

    -- Line Item
    description TEXT NOT NULL,
    sort_order INT DEFAULT 0,

    -- Quantities
    quantity DECIMAL(15, 4),
    unit TEXT,
    unit_cost DECIMAL(15, 4),

    -- Amounts
    amount DECIMAL(15, 2) NOT NULL,

    -- Type
    item_type TEXT DEFAULT 'add',         -- add, deduct, no_change

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE change_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "change_order_items_tenant_isolation" ON change_order_items
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_change_order_items_company_id ON change_order_items(company_id);
CREATE INDEX idx_change_order_items_change_order_id ON change_order_items(change_order_id);
```

### draws
```sql
CREATE TABLE draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    -- Identification
    draw_number INT NOT NULL,
    title TEXT,

    -- Period
    period_start DATE,
    period_end DATE,

    -- Amounts
    scheduled_value DECIMAL(15, 2) DEFAULT 0,    -- Total contract value
    previous_applications DECIMAL(15, 2) DEFAULT 0,
    this_application DECIMAL(15, 2) DEFAULT 0,
    materials_stored DECIMAL(15, 2) DEFAULT 0,
    total_completed DECIMAL(15, 2) DEFAULT 0,
    retainage_percent DECIMAL(5, 2) DEFAULT 10,
    retainage_amount DECIMAL(15, 2) DEFAULT 0,
    total_earned_less_retainage DECIMAL(15, 2) DEFAULT 0,
    previous_payments DECIMAL(15, 2) DEFAULT 0,
    current_payment_due DECIMAL(15, 2) DEFAULT 0,
    balance_to_finish DECIMAL(15, 2) DEFAULT 0,

    -- Status
    status TEXT DEFAULT 'draft',          -- draft, submitted, approved, paid, rejected
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    paid_at TIMESTAMPTZ,

    -- Lender Info (if construction loan)
    lender_name TEXT,
    loan_number TEXT,

    -- Documents
    g702_url TEXT,                        -- Generated G702 PDF
    g703_url TEXT,                        -- Generated G703 PDF

    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(job_id, draw_number)
);

ALTER TABLE draws ENABLE ROW LEVEL SECURITY;

CREATE POLICY "draws_tenant_isolation" ON draws
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_draws_company_id ON draws(company_id);
CREATE INDEX idx_draws_job_id ON draws(job_id);
CREATE INDEX idx_draws_status ON draws(status);
```

### draw_line_items
```sql
CREATE TABLE draw_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
    cost_code_id UUID REFERENCES cost_codes(id),
    budget_line_item_id UUID REFERENCES budget_line_items(id),

    -- AIA G703 Fields
    item_number TEXT,
    description TEXT NOT NULL,
    scheduled_value DECIMAL(15, 2) DEFAULT 0,
    previous_applications DECIMAL(15, 2) DEFAULT 0,
    this_period DECIMAL(15, 2) DEFAULT 0,
    materials_stored DECIMAL(15, 2) DEFAULT 0,
    total_completed DECIMAL(15, 2) DEFAULT 0,
    percent_complete DECIMAL(5, 2) DEFAULT 0,
    balance_to_finish DECIMAL(15, 2) DEFAULT 0,
    retainage DECIMAL(15, 2) DEFAULT 0,

    -- Sort
    sort_order INT DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE draw_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "draw_line_items_tenant_isolation" ON draw_line_items
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_draw_line_items_company_id ON draw_line_items(company_id);
CREATE INDEX idx_draw_line_items_draw_id ON draw_line_items(draw_id);
```

### payments
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id),
    vendor_id UUID REFERENCES vendors(id),

    -- Type
    payment_type TEXT NOT NULL,           -- vendor, draw, refund

    -- Identification
    payment_number TEXT,
    check_number TEXT,
    reference TEXT,

    -- Dates
    payment_date DATE NOT NULL,

    -- Amount
    amount DECIMAL(15, 2) NOT NULL,

    -- Method
    payment_method TEXT,                  -- check, ach, wire, credit_card, cash

    -- Bank Info
    bank_account TEXT,

    -- Status
    status TEXT DEFAULT 'pending',        -- pending, cleared, void
    cleared_date DATE,

    -- Notes
    memo TEXT,

    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_tenant_isolation" ON payments
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_payments_company_id ON payments(company_id);
CREATE INDEX idx_payments_job_id ON payments(job_id);
CREATE INDEX idx_payments_vendor_id ON payments(vendor_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
```

### payment_allocations
```sql
CREATE TABLE payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id),
    draw_id UUID REFERENCES draws(id),

    -- Allocation
    amount DECIMAL(15, 2) NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payment_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_allocations_tenant_isolation" ON payment_allocations
    FOR ALL USING (company_id = get_current_company_id());

CREATE INDEX idx_payment_allocations_company_id ON payment_allocations(company_id);
CREATE INDEX idx_payment_allocations_payment_id ON payment_allocations(payment_id);
CREATE INDEX idx_payment_allocations_invoice_id ON payment_allocations(invoice_id);
```

---

## Phases 3-8: Continued in SCHEMA_EXTENDED.md

> **Note**: Due to size, remaining schemas are in `docs/DATABASE_SCHEMA_EXTENDED.md`
> This includes: Schedule, Daily Logs, Photos, Selections, Vendors, Contracts, Documents, RFIs, etc.

---

## Helper Functions

### get_current_company_id()
```sql
CREATE OR REPLACE FUNCTION get_current_company_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_company_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;
```

### set_current_company_id()
```sql
CREATE OR REPLACE FUNCTION set_current_company_id(company_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_company_id', company_id::TEXT, false);
END;
$$ LANGUAGE plpgsql;
```

### update_updated_at()
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON {table_name}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

---

## Migration Order

Tables must be created in this order due to foreign key dependencies:

```
1. companies
2. users, user_roles
3. clients, vendors
4. contacts, addresses
5. tags, cost_codes
6. jobs, job_phases, job_team_members
7. entity_tags, notes, activity_log
8. budgets, budget_line_items
9. contracts, contract_items
10. invoices, invoice_line_items
11. change_orders, change_order_items
12. draws, draw_line_items
13. payments, payment_allocations
14. migrations, migration_* tables
15. (Phase 3+) schedule_*, daily_logs, photos, etc.
```

---

*Last Updated: 2024-02-12*
*Version: 1.0*
