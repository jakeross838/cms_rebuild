# RossOS Database Schema - Phases 3-8

> **Continuation of**: `docs/DATABASE_SCHEMA.md`
>
> **Phases Covered**: 3 (Field/Schedule), 4 (Selections), 5 (Vendors), 6 (Portal), 7 (Reports), 8 (Documents)

---

## Phase 3: Field Operations & Schedule

### schedule_templates
```sql
CREATE TABLE schedule_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    description TEXT,
    project_type TEXT,                    -- What type of project this template is for

    -- Template Data
    items JSONB NOT NULL DEFAULT '[]',    -- Array of template items with relative days

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, name)
);

ALTER TABLE schedule_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule_templates_tenant" ON schedule_templates FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_schedule_templates_company_id ON schedule_templates(company_id);
```

### schedule_items
```sql
CREATE TABLE schedule_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    job_phase_id UUID REFERENCES job_phases(id),

    -- Item Info
    name TEXT NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,

    -- Type
    item_type TEXT DEFAULT 'task',        -- task, milestone, phase

    -- Dates
    planned_start DATE,
    planned_end DATE,
    actual_start DATE,
    actual_end DATE,
    duration_days INT,

    -- Status
    status TEXT DEFAULT 'not_started',    -- not_started, in_progress, completed, delayed, on_hold

    -- Progress
    percent_complete DECIMAL(5, 2) DEFAULT 0,

    -- Critical Path
    is_critical BOOLEAN DEFAULT false,
    total_float INT DEFAULT 0,            -- Days of float

    -- Assignment
    assigned_vendor_id UUID REFERENCES vendors(id),
    assigned_user_id UUID REFERENCES users(id),

    -- Notes
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule_items_tenant" ON schedule_items FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_schedule_items_company_id ON schedule_items(company_id);
CREATE INDEX idx_schedule_items_job_id ON schedule_items(job_id);
CREATE INDEX idx_schedule_items_status ON schedule_items(status);
```

### schedule_dependencies
```sql
CREATE TABLE schedule_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    predecessor_id UUID NOT NULL REFERENCES schedule_items(id) ON DELETE CASCADE,
    successor_id UUID NOT NULL REFERENCES schedule_items(id) ON DELETE CASCADE,

    -- Dependency Type
    dependency_type TEXT DEFAULT 'FS',    -- FS (Finish-Start), SS, FF, SF
    lag_days INT DEFAULT 0,               -- Offset in days

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(predecessor_id, successor_id)
);

ALTER TABLE schedule_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule_dependencies_tenant" ON schedule_dependencies FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_schedule_dependencies_predecessor ON schedule_dependencies(predecessor_id);
CREATE INDEX idx_schedule_dependencies_successor ON schedule_dependencies(successor_id);
```

### daily_logs
```sql
CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    -- Date
    log_date DATE NOT NULL,

    -- Weather
    weather_condition TEXT,               -- sunny, cloudy, rain, etc.
    temperature_high INT,
    temperature_low INT,
    precipitation DECIMAL(5, 2),          -- inches
    wind_speed INT,
    weather_notes TEXT,
    weather_source TEXT,                  -- manual, api

    -- Work Summary
    work_performed TEXT,
    delays TEXT,
    safety_notes TEXT,

    -- Status
    status TEXT DEFAULT 'draft',          -- draft, submitted, approved
    submitted_at TIMESTAMPTZ,
    submitted_by UUID REFERENCES users(id),

    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(job_id, log_date)
);

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_logs_tenant" ON daily_logs FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_daily_logs_company_id ON daily_logs(company_id);
CREATE INDEX idx_daily_logs_job_id ON daily_logs(job_id);
CREATE INDEX idx_daily_logs_log_date ON daily_logs(log_date DESC);
```

### daily_log_entries
```sql
CREATE TABLE daily_log_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    daily_log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,

    -- Entry Type
    entry_type TEXT NOT NULL,             -- work, delivery, visitor, equipment, note

    -- Content
    description TEXT NOT NULL,
    time_logged TIME,

    -- Related Entities
    vendor_id UUID REFERENCES vendors(id),
    schedule_item_id UUID REFERENCES schedule_items(id),

    -- Metadata
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE daily_log_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_log_entries_tenant" ON daily_log_entries FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_daily_log_entries_daily_log_id ON daily_log_entries(daily_log_id);
```

### daily_log_crews
```sql
CREATE TABLE daily_log_crews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    daily_log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,

    vendor_id UUID REFERENCES vendors(id),
    trade TEXT,
    worker_count INT DEFAULT 0,
    hours_worked DECIMAL(4, 2),
    work_description TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE daily_log_crews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_log_crews_tenant" ON daily_log_crews FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_daily_log_crews_daily_log_id ON daily_log_crews(daily_log_id);
```

### photos
```sql
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    -- File Info
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_name TEXT,
    file_size INT,
    mime_type TEXT,

    -- Photo Details
    title TEXT,
    description TEXT,
    taken_at TIMESTAMPTZ,

    -- Location
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_name TEXT,

    -- Categorization
    phase TEXT,
    area TEXT,

    -- Related Entities
    daily_log_id UUID REFERENCES daily_logs(id),
    inspection_id UUID REFERENCES inspections(id),
    punch_list_item_id UUID REFERENCES punch_list_items(id),

    -- Metadata
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos_tenant" ON photos FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_photos_company_id ON photos(company_id);
CREATE INDEX idx_photos_job_id ON photos(job_id);
CREATE INDEX idx_photos_taken_at ON photos(taken_at DESC);
```

### photo_tags
```sql
CREATE TABLE photo_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,

    tag TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(photo_id, tag)
);

ALTER TABLE photo_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photo_tags_tenant" ON photo_tags FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_photo_tags_photo_id ON photo_tags(photo_id);
CREATE INDEX idx_photo_tags_tag ON photo_tags(tag);
```

### inspections
```sql
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    -- Inspection Info
    inspection_type TEXT NOT NULL,        -- building, electrical, plumbing, etc.
    name TEXT NOT NULL,
    description TEXT,

    -- Scheduling
    scheduled_date DATE,
    scheduled_time TIME,
    actual_date DATE,

    -- Result
    status TEXT DEFAULT 'scheduled',      -- scheduled, passed, failed, cancelled
    result_notes TEXT,
    inspector_name TEXT,
    permit_number TEXT,

    -- Related
    schedule_item_id UUID REFERENCES schedule_items(id),

    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inspections_tenant" ON inspections FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_inspections_company_id ON inspections(company_id);
CREATE INDEX idx_inspections_job_id ON inspections(job_id);
CREATE INDEX idx_inspections_scheduled_date ON inspections(scheduled_date);
```

### inspection_items
```sql
CREATE TABLE inspection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,

    item_text TEXT NOT NULL,
    is_checked BOOLEAN DEFAULT false,
    notes TEXT,
    sort_order INT DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inspection_items_tenant" ON inspection_items FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_inspection_items_inspection_id ON inspection_items(inspection_id);
```

### punch_lists
```sql
CREATE TABLE punch_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    description TEXT,
    punch_type TEXT DEFAULT 'standard',   -- pre_drywall, pre_paint, final, warranty

    -- Status
    status TEXT DEFAULT 'open',           -- open, in_progress, completed

    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE punch_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "punch_lists_tenant" ON punch_lists FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_punch_lists_company_id ON punch_lists(company_id);
CREATE INDEX idx_punch_lists_job_id ON punch_lists(job_id);
```

### punch_list_items
```sql
CREATE TABLE punch_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    punch_list_id UUID NOT NULL REFERENCES punch_lists(id) ON DELETE CASCADE,

    -- Item Info
    description TEXT NOT NULL,
    location TEXT,
    area TEXT,

    -- Status
    status TEXT DEFAULT 'open',           -- open, in_progress, completed, not_applicable
    priority TEXT DEFAULT 'normal',       -- low, normal, high, critical

    -- Assignment
    assigned_vendor_id UUID REFERENCES vendors(id),
    assigned_user_id UUID REFERENCES users(id),

    -- Dates
    due_date DATE,
    completed_date DATE,
    completed_by UUID REFERENCES users(id),

    -- Photos
    photo_ids UUID[],

    -- Notes
    notes TEXT,

    -- Metadata
    sort_order INT DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE punch_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "punch_list_items_tenant" ON punch_list_items FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_punch_list_items_punch_list_id ON punch_list_items(punch_list_id);
CREATE INDEX idx_punch_list_items_status ON punch_list_items(status);
```

### safety_observations
```sql
CREATE TABLE safety_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    observation_date DATE NOT NULL,
    observation_type TEXT,                -- positive, hazard, near_miss
    description TEXT NOT NULL,
    location TEXT,
    corrective_action TEXT,

    -- Related
    vendor_id UUID REFERENCES vendors(id),
    photo_ids UUID[],

    -- Status
    status TEXT DEFAULT 'open',           -- open, addressed, closed

    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE safety_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "safety_observations_tenant" ON safety_observations FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_safety_observations_job_id ON safety_observations(job_id);
```

### safety_incidents
```sql
CREATE TABLE safety_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    incident_date DATE NOT NULL,
    incident_time TIME,
    incident_type TEXT NOT NULL,          -- injury, property_damage, near_miss, first_aid
    severity TEXT,                        -- minor, moderate, serious, fatal

    description TEXT NOT NULL,
    location TEXT,
    weather_conditions TEXT,

    -- People Involved
    injured_party_name TEXT,
    injured_party_company TEXT,
    witness_names TEXT[],

    -- Response
    first_aid_provided BOOLEAN DEFAULT false,
    medical_treatment_required BOOLEAN DEFAULT false,
    emergency_services_called BOOLEAN DEFAULT false,

    -- Investigation
    root_cause TEXT,
    corrective_actions TEXT,
    preventive_measures TEXT,

    -- Reporting
    osha_reportable BOOLEAN DEFAULT false,
    reported_to_osha BOOLEAN DEFAULT false,
    insurance_claim_filed BOOLEAN DEFAULT false,

    -- Photos
    photo_ids UUID[],

    -- Status
    status TEXT DEFAULT 'open',           -- open, investigating, closed

    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE safety_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "safety_incidents_tenant" ON safety_incidents FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_safety_incidents_job_id ON safety_incidents(job_id);
CREATE INDEX idx_safety_incidents_incident_date ON safety_incidents(incident_date DESC);
```

---

## Phase 4: Selections & Design

### selection_categories
```sql
CREATE TABLE selection_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, name)
);

ALTER TABLE selection_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "selection_categories_tenant" ON selection_categories FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_selection_categories_company_id ON selection_categories(company_id);
```

### selections
```sql
CREATE TABLE selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    category_id UUID REFERENCES selection_categories(id),

    name TEXT NOT NULL,
    description TEXT,
    room_area TEXT,

    -- Deadline
    deadline DATE,
    is_overdue BOOLEAN GENERATED ALWAYS AS (deadline < CURRENT_DATE AND status NOT IN ('approved', 'ordered')) STORED,

    -- Budget
    allowance_amount DECIMAL(15, 2),
    selected_amount DECIMAL(15, 2),
    variance DECIMAL(15, 2) GENERATED ALWAYS AS (COALESCE(selected_amount, 0) - COALESCE(allowance_amount, 0)) STORED,

    -- Status
    status TEXT DEFAULT 'pending',        -- pending, submitted, approved, ordered, installed
    requires_change_order BOOLEAN DEFAULT false,
    change_order_id UUID REFERENCES change_orders(id),

    -- Lead Time
    lead_time_days INT,
    order_by_date DATE,

    -- Approval
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE selections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "selections_tenant" ON selections FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_selections_company_id ON selections(company_id);
CREATE INDEX idx_selections_job_id ON selections(job_id);
CREATE INDEX idx_selections_status ON selections(status);
CREATE INDEX idx_selections_deadline ON selections(deadline);
```

### selection_options
```sql
CREATE TABLE selection_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    selection_id UUID NOT NULL REFERENCES selections(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    description TEXT,

    -- Product Info
    manufacturer TEXT,
    model_number TEXT,
    color_finish TEXT,
    dimensions TEXT,

    -- Pricing
    price DECIMAL(15, 2),
    price_unit TEXT,                      -- each, SF, LF, etc.

    -- Lead Time
    lead_time_days INT,

    -- Status
    is_selected BOOLEAN DEFAULT false,

    -- Images
    image_urls TEXT[],
    spec_sheet_url TEXT,

    -- Metadata
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE selection_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "selection_options_tenant" ON selection_options FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_selection_options_selection_id ON selection_options(selection_id);
```

### selection_approvals
```sql
CREATE TABLE selection_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    selection_id UUID NOT NULL REFERENCES selections(id) ON DELETE CASCADE,

    -- Approval
    approved_by_client BOOLEAN,
    client_name TEXT,
    approved_at TIMESTAMPTZ,
    signature_url TEXT,

    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE selection_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "selection_approvals_tenant" ON selection_approvals FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_selection_approvals_selection_id ON selection_approvals(selection_id);
```

### allowances
```sql
CREATE TABLE allowances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    cost_code_id UUID REFERENCES cost_codes(id),

    name TEXT NOT NULL,
    description TEXT,
    category TEXT,

    -- Budget
    budget_amount DECIMAL(15, 2) NOT NULL,
    used_amount DECIMAL(15, 2) DEFAULT 0,
    remaining_amount DECIMAL(15, 2) GENERATED ALWAYS AS (budget_amount - used_amount) STORED,

    -- Status
    status TEXT DEFAULT 'open',           -- open, reconciled

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE allowances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allowances_tenant" ON allowances FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_allowances_company_id ON allowances(company_id);
CREATE INDEX idx_allowances_job_id ON allowances(job_id);
```

### allowance_usage
```sql
CREATE TABLE allowance_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    allowance_id UUID NOT NULL REFERENCES allowances(id) ON DELETE CASCADE,

    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    usage_date DATE,

    -- Related
    selection_id UUID REFERENCES selections(id),
    invoice_id UUID REFERENCES invoices(id),

    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE allowance_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allowance_usage_tenant" ON allowance_usage FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_allowance_usage_allowance_id ON allowance_usage(allowance_id);
```

### specifications
```sql
CREATE TABLE specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    category TEXT,
    room_area TEXT,
    item_name TEXT NOT NULL,

    -- Specification Details
    manufacturer TEXT,
    model_number TEXT,
    color_finish TEXT,
    dimensions TEXT,
    material TEXT,

    -- Source
    specified_by TEXT,                    -- architect, designer, client, builder
    selection_id UUID REFERENCES selections(id),

    -- Documents
    spec_sheet_url TEXT,
    image_urls TEXT[],

    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE specifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "specifications_tenant" ON specifications FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_specifications_job_id ON specifications(job_id);
```

---

## Phase 5: Vendors & Subcontractors

### vendors
```sql
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Basic Info
    name TEXT NOT NULL,
    dba_name TEXT,
    vendor_type TEXT DEFAULT 'subcontractor', -- subcontractor, supplier, consultant

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

    -- Business Info
    tax_id TEXT,
    license_number TEXT,
    license_state TEXT,
    license_expiry DATE,

    -- Categories/Trades
    trade_categories TEXT[],

    -- Ratings
    overall_rating DECIMAL(3, 2),
    reliability_rating DECIMAL(3, 2),
    quality_rating DECIMAL(3, 2),
    pricing_rating DECIMAL(3, 2),

    -- Status
    status TEXT DEFAULT 'active',         -- active, inactive, blacklisted
    is_preferred BOOLEAN DEFAULT false,

    -- Payment Info
    payment_terms TEXT,
    default_retainage_percent DECIMAL(5, 2) DEFAULT 10,

    -- Notes
    internal_notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors_tenant" ON vendors FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_vendors_company_id ON vendors(company_id);
CREATE INDEX idx_vendors_name ON vendors(name);
CREATE INDEX idx_vendors_status ON vendors(status);
```

### vendor_contacts
```sql
CREATE TABLE vendor_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

    first_name TEXT NOT NULL,
    last_name TEXT,
    title TEXT,
    email TEXT,
    phone TEXT,
    is_primary BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vendor_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendor_contacts_tenant" ON vendor_contacts FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_vendor_contacts_vendor_id ON vendor_contacts(vendor_id);
```

### vendor_categories
```sql
CREATE TABLE vendor_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES vendor_categories(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, name)
);

ALTER TABLE vendor_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendor_categories_tenant" ON vendor_categories FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_vendor_categories_company_id ON vendor_categories(company_id);
```

### vendor_documents
```sql
CREATE TABLE vendor_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

    document_type TEXT NOT NULL,          -- insurance_coi, w9, license, contract, other
    document_name TEXT,
    file_url TEXT NOT NULL,

    -- Expiration
    effective_date DATE,
    expiration_date DATE,
    is_expired BOOLEAN GENERATED ALWAYS AS (expiration_date < CURRENT_DATE) STORED,

    -- Insurance Specific
    insurance_type TEXT,                  -- general_liability, workers_comp, auto, umbrella
    coverage_amount DECIMAL(15, 2),
    policy_number TEXT,
    carrier_name TEXT,

    -- Status
    status TEXT DEFAULT 'active',         -- active, expired, pending_review

    -- Alerts
    alert_days_before INT DEFAULT 30,

    -- Metadata
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vendor_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendor_documents_tenant" ON vendor_documents FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_vendor_documents_vendor_id ON vendor_documents(vendor_id);
CREATE INDEX idx_vendor_documents_expiration_date ON vendor_documents(expiration_date);
```

### vendor_ratings
```sql
CREATE TABLE vendor_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id),

    -- Ratings (1-5)
    reliability_rating INT CHECK (reliability_rating BETWEEN 1 AND 5),
    quality_rating INT CHECK (quality_rating BETWEEN 1 AND 5),
    pricing_rating INT CHECK (pricing_rating BETWEEN 1 AND 5),
    communication_rating INT CHECK (communication_rating BETWEEN 1 AND 5),
    safety_rating INT CHECK (safety_rating BETWEEN 1 AND 5),

    overall_rating DECIMAL(3, 2),
    comments TEXT,

    rated_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vendor_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendor_ratings_tenant" ON vendor_ratings FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_vendor_ratings_vendor_id ON vendor_ratings(vendor_id);
```

### bid_packages
```sql
CREATE TABLE bid_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    description TEXT,
    trade_category TEXT,

    -- Scope
    scope_of_work TEXT,
    inclusions TEXT,
    exclusions TEXT,

    -- Dates
    issue_date DATE,
    due_date DATE,

    -- Status
    status TEXT DEFAULT 'draft',          -- draft, issued, closed, awarded

    -- Attachments
    drawing_ids UUID[],
    spec_ids UUID[],

    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bid_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bid_packages_tenant" ON bid_packages FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_bid_packages_job_id ON bid_packages(job_id);
```

### bids
```sql
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    bid_package_id UUID NOT NULL REFERENCES bid_packages(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id),

    -- Bid Info
    bid_amount DECIMAL(15, 2),
    bid_date DATE,

    -- Breakdown
    labor_amount DECIMAL(15, 2),
    material_amount DECIMAL(15, 2),
    equipment_amount DECIMAL(15, 2),

    -- Qualifications
    qualifications TEXT,
    exclusions TEXT,
    alternates TEXT,

    -- Duration
    estimated_duration_days INT,

    -- Status
    status TEXT DEFAULT 'received',       -- invited, received, under_review, selected, rejected

    -- Documents
    bid_document_url TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bids_tenant" ON bids FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_bids_bid_package_id ON bids(bid_package_id);
CREATE INDEX idx_bids_vendor_id ON bids(vendor_id);
```

### contracts
```sql
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    bid_id UUID REFERENCES bids(id),

    -- Contract Info
    contract_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,

    -- Type
    contract_type TEXT DEFAULT 'subcontract', -- subcontract, purchase_order, service

    -- Dates
    execution_date DATE,
    start_date DATE,
    end_date DATE,

    -- Amounts
    original_amount DECIMAL(15, 2) NOT NULL,
    revised_amount DECIMAL(15, 2),
    retainage_percent DECIMAL(5, 2) DEFAULT 10,

    -- Status
    status TEXT DEFAULT 'draft',          -- draft, pending_signature, executed, completed, terminated

    -- Signatures
    builder_signed_at TIMESTAMPTZ,
    builder_signed_by UUID REFERENCES users(id),
    vendor_signed_at TIMESTAMPTZ,
    vendor_signer_name TEXT,

    -- Documents
    contract_document_url TEXT,

    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, contract_number)
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contracts_tenant" ON contracts FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_contracts_company_id ON contracts(company_id);
CREATE INDEX idx_contracts_job_id ON contracts(job_id);
CREATE INDEX idx_contracts_vendor_id ON contracts(vendor_id);
```

### contract_items
```sql
CREATE TABLE contract_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    cost_code_id UUID REFERENCES cost_codes(id),

    description TEXT NOT NULL,
    quantity DECIMAL(15, 4),
    unit TEXT,
    unit_price DECIMAL(15, 4),
    amount DECIMAL(15, 2) NOT NULL,

    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contract_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contract_items_tenant" ON contract_items FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_contract_items_contract_id ON contract_items(contract_id);
```

### insurance_policies
```sql
CREATE TABLE insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

    policy_type TEXT NOT NULL,            -- general_liability, workers_comp, auto, umbrella, professional
    policy_number TEXT,
    carrier_name TEXT,

    -- Coverage
    coverage_amount DECIMAL(15, 2),
    per_occurrence_limit DECIMAL(15, 2),
    aggregate_limit DECIMAL(15, 2),

    -- Dates
    effective_date DATE,
    expiration_date DATE,
    is_expired BOOLEAN GENERATED ALWAYS AS (expiration_date < CURRENT_DATE) STORED,

    -- Certificate
    certificate_url TEXT,
    certificate_holder TEXT,
    additional_insured BOOLEAN DEFAULT false,

    -- Status
    status TEXT DEFAULT 'active',         -- active, expired, pending

    -- Alerts
    days_until_expiry INT GENERATED ALWAYS AS (expiration_date - CURRENT_DATE) STORED,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insurance_policies_tenant" ON insurance_policies FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_insurance_policies_vendor_id ON insurance_policies(vendor_id);
CREATE INDEX idx_insurance_policies_expiration_date ON insurance_policies(expiration_date);
```

### lien_waivers
```sql
CREATE TABLE lien_waivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    contract_id UUID REFERENCES contracts(id),
    payment_id UUID REFERENCES payments(id),

    -- Waiver Info
    waiver_type TEXT NOT NULL,            -- conditional_progress, unconditional_progress, conditional_final, unconditional_final
    waiver_date DATE NOT NULL,

    -- Amounts
    through_date DATE,
    amount DECIMAL(15, 2),

    -- Document
    document_url TEXT,
    signed BOOLEAN DEFAULT false,
    signed_date DATE,
    signer_name TEXT,

    -- Status
    status TEXT DEFAULT 'pending',        -- pending, received, verified

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lien_waivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lien_waivers_tenant" ON lien_waivers FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_lien_waivers_job_id ON lien_waivers(job_id);
CREATE INDEX idx_lien_waivers_vendor_id ON lien_waivers(vendor_id);
CREATE INDEX idx_lien_waivers_payment_id ON lien_waivers(payment_id);
```

### safety_agreements
```sql
CREATE TABLE safety_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

    agreement_type TEXT DEFAULT 'standard', -- standard, project_specific
    job_id UUID REFERENCES jobs(id),

    signed BOOLEAN DEFAULT false,
    signed_date DATE,
    signer_name TEXT,
    document_url TEXT,

    expiration_date DATE,
    is_expired BOOLEAN GENERATED ALWAYS AS (expiration_date IS NOT NULL AND expiration_date < CURRENT_DATE) STORED,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE safety_agreements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "safety_agreements_tenant" ON safety_agreements FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_safety_agreements_vendor_id ON safety_agreements(vendor_id);
```

---

## Phase 6: Client Portal

### client_portal_settings
```sql
CREATE TABLE client_portal_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    -- Access Control
    portal_enabled BOOLEAN DEFAULT true,
    password_required BOOLEAN DEFAULT true,
    access_code TEXT,

    -- Feature Visibility
    show_budget BOOLEAN DEFAULT true,
    show_budget_details BOOLEAN DEFAULT false,
    show_schedule BOOLEAN DEFAULT true,
    show_photos BOOLEAN DEFAULT true,
    show_documents BOOLEAN DEFAULT false,
    show_selections BOOLEAN DEFAULT true,
    show_change_orders BOOLEAN DEFAULT true,
    show_daily_logs BOOLEAN DEFAULT false,
    show_messages BOOLEAN DEFAULT true,

    -- Notification Preferences
    email_on_update BOOLEAN DEFAULT true,
    email_on_milestone BOOLEAN DEFAULT true,
    email_on_photo BOOLEAN DEFAULT false,
    email_on_selection_due BOOLEAN DEFAULT true,
    email_on_change_order BOOLEAN DEFAULT true,

    -- Branding
    custom_header TEXT,
    custom_footer TEXT,
    welcome_message TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(job_id)
);

ALTER TABLE client_portal_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client_portal_settings_tenant" ON client_portal_settings FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_client_portal_settings_job_id ON client_portal_settings(job_id);
```

### client_portal_access
```sql
CREATE TABLE client_portal_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- Access Info
    email TEXT NOT NULL,
    name TEXT,
    access_level TEXT DEFAULT 'viewer',        -- viewer, approver

    -- Authentication
    password_hash TEXT,
    last_login_at TIMESTAMPTZ,
    login_count INT DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT true,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,

    -- Token for password reset
    reset_token TEXT,
    reset_token_expires TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(job_id, email)
);

ALTER TABLE client_portal_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client_portal_access_tenant" ON client_portal_access FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_client_portal_access_job_id ON client_portal_access(job_id);
CREATE INDEX idx_client_portal_access_email ON client_portal_access(email);
```

### client_notifications
```sql
CREATE TABLE client_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    portal_access_id UUID REFERENCES client_portal_access(id) ON DELETE CASCADE,

    -- Notification Content
    notification_type TEXT NOT NULL,           -- milestone, photo, selection, change_order, message, update
    title TEXT NOT NULL,
    message TEXT,

    -- Reference
    entity_type TEXT,
    entity_id UUID,
    link_url TEXT,

    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,

    -- Email
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE client_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client_notifications_tenant" ON client_notifications FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_client_notifications_portal_access_id ON client_notifications(portal_access_id);
CREATE INDEX idx_client_notifications_created_at ON client_notifications(created_at DESC);
CREATE INDEX idx_client_notifications_is_read ON client_notifications(is_read) WHERE is_read = false;
```

### approval_requests
```sql
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    -- Request Type
    approval_type TEXT NOT NULL,               -- change_order, selection, draw, document

    -- Reference
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,

    -- Request Info
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(15, 2),

    -- Status
    status TEXT DEFAULT 'pending',             -- pending, approved, rejected, expired
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    -- Response
    responded_by TEXT,                         -- Name of person who responded
    responded_via TEXT,                        -- portal, email, signature
    response_notes TEXT,

    -- Signature
    signature_url TEXT,
    signature_ip TEXT,
    signature_timestamp TIMESTAMPTZ,

    -- Reminders
    reminder_count INT DEFAULT 0,
    last_reminder_at TIMESTAMPTZ,

    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approval_requests_tenant" ON approval_requests FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_approval_requests_job_id ON approval_requests(job_id);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);
CREATE INDEX idx_approval_requests_entity ON approval_requests(entity_type, entity_id);
```

---

## Phase 7: Reports & Analytics

### saved_reports
```sql
CREATE TABLE saved_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Report Info
    name TEXT NOT NULL,
    description TEXT,
    report_type TEXT NOT NULL,                 -- job_financial, budget_variance, portfolio, wip, cash_flow, custom

    -- Configuration
    parameters JSONB NOT NULL DEFAULT '{}',    -- Report parameters (date range, job filters, etc.)
    columns JSONB,                             -- Column configuration for tables
    chart_config JSONB,                        -- Chart configuration

    -- Scope
    job_id UUID REFERENCES jobs(id),           -- NULL for portfolio-wide reports

    -- Sharing
    is_shared BOOLEAN DEFAULT false,
    shared_with UUID[],                        -- User IDs

    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_reports_tenant" ON saved_reports FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_saved_reports_company_id ON saved_reports(company_id);
CREATE INDEX idx_saved_reports_created_by ON saved_reports(created_by);
```

### report_schedules
```sql
CREATE TABLE report_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    saved_report_id UUID NOT NULL REFERENCES saved_reports(id) ON DELETE CASCADE,

    -- Schedule
    frequency TEXT NOT NULL,                   -- daily, weekly, monthly, quarterly
    day_of_week INT,                           -- 0-6 for weekly
    day_of_month INT,                          -- 1-31 for monthly
    time_of_day TIME DEFAULT '09:00:00',

    -- Recipients
    recipient_emails TEXT[] NOT NULL,
    recipient_user_ids UUID[],

    -- Format
    output_format TEXT DEFAULT 'pdf',          -- pdf, excel, both

    -- Status
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    last_run_status TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "report_schedules_tenant" ON report_schedules FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_report_schedules_next_run ON report_schedules(next_run_at) WHERE is_active = true;
```

### dashboard_widgets
```sql
CREATE TABLE dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Widget Info
    widget_type TEXT NOT NULL,                 -- kpi, chart, table, calendar, list
    title TEXT NOT NULL,

    -- Configuration
    config JSONB NOT NULL DEFAULT '{}',        -- Widget-specific configuration
    data_source TEXT NOT NULL,                 -- jobs, budgets, invoices, schedule, etc.
    filters JSONB,                             -- Data filters

    -- Position
    dashboard_id TEXT DEFAULT 'main',          -- Which dashboard this belongs to
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    width INT DEFAULT 1,
    height INT DEFAULT 1,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dashboard_widgets_tenant" ON dashboard_widgets FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_dashboard_widgets_user_id ON dashboard_widgets(user_id);
```

### kpi_definitions
```sql
CREATE TABLE kpi_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- KPI Info
    name TEXT NOT NULL,
    code TEXT NOT NULL,                        -- Unique code for the KPI
    description TEXT,
    category TEXT,                             -- financial, operational, quality, safety

    -- Calculation
    formula TEXT,                              -- Formula description
    data_source TEXT,                          -- Source table/view
    calculation_query TEXT,                    -- SQL or calculation logic

    -- Display
    unit TEXT,                                 -- %, $, days, count
    decimal_places INT DEFAULT 2,
    display_format TEXT,                       -- currency, percentage, number

    -- Targets
    target_value DECIMAL(15, 4),
    warning_threshold DECIMAL(15, 4),
    critical_threshold DECIMAL(15, 4),
    higher_is_better BOOLEAN DEFAULT true,

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,           -- System-defined vs custom

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, code)
);

ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kpi_definitions_tenant" ON kpi_definitions FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_kpi_definitions_company_id ON kpi_definitions(company_id);
```

### kpi_snapshots
```sql
CREATE TABLE kpi_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    kpi_definition_id UUID NOT NULL REFERENCES kpi_definitions(id) ON DELETE CASCADE,

    -- Scope
    job_id UUID REFERENCES jobs(id),           -- NULL for company-wide

    -- Value
    snapshot_date DATE NOT NULL,
    value DECIMAL(15, 4),
    previous_value DECIMAL(15, 4),
    change_percent DECIMAL(8, 4),

    -- Status
    status TEXT,                               -- good, warning, critical

    -- Details
    details JSONB,                             -- Additional context

    -- Metadata
    calculated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(kpi_definition_id, job_id, snapshot_date)
);

ALTER TABLE kpi_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kpi_snapshots_tenant" ON kpi_snapshots FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_kpi_snapshots_kpi_definition ON kpi_snapshots(kpi_definition_id);
CREATE INDEX idx_kpi_snapshots_snapshot_date ON kpi_snapshots(snapshot_date DESC);
CREATE INDEX idx_kpi_snapshots_job_id ON kpi_snapshots(job_id) WHERE job_id IS NOT NULL;
```

---

## Phase 8: Documents & Communication

### documents
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,

    -- File Info
    name TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_size INT,
    mime_type TEXT,
    file_extension TEXT,

    -- Organization
    folder_id UUID REFERENCES document_folders(id),
    document_type TEXT,                        -- contract, drawing, spec, submittal, photo, other

    -- Versioning
    version INT DEFAULT 1,
    is_current_version BOOLEAN DEFAULT true,
    parent_document_id UUID REFERENCES documents(id),

    -- Status
    status TEXT DEFAULT 'active',              -- active, archived, deleted

    -- Access
    is_public BOOLEAN DEFAULT false,           -- Visible to clients

    -- Metadata
    tags TEXT[],
    custom_fields JSONB,

    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_tenant" ON documents FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_documents_company_id ON documents(company_id);
CREATE INDEX idx_documents_job_id ON documents(job_id);
CREATE INDEX idx_documents_folder_id ON documents(folder_id);
CREATE INDEX idx_documents_name ON documents(name);
```

### document_versions
```sql
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

    version_number INT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INT,

    -- Change Info
    change_notes TEXT,

    -- Metadata
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(document_id, version_number)
);

ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "document_versions_tenant" ON document_versions FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
```

### document_folders
```sql
CREATE TABLE document_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES document_folders(id),

    -- Path for efficient queries
    path TEXT,                                 -- Materialized path like /folder1/folder2/
    depth INT DEFAULT 0,

    sort_order INT DEFAULT 0,

    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, job_id, parent_id, name)
);

ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "document_folders_tenant" ON document_folders FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_document_folders_job_id ON document_folders(job_id);
CREATE INDEX idx_document_folders_parent_id ON document_folders(parent_id);
```

### document_permissions
```sql
CREATE TABLE document_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Target
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES document_folders(id) ON DELETE CASCADE,

    -- Permission Grantee
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT,                                 -- Or grant to a role

    -- Permissions
    can_view BOOLEAN DEFAULT true,
    can_download BOOLEAN DEFAULT true,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_share BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CHECK (document_id IS NOT NULL OR folder_id IS NOT NULL),
    CHECK (user_id IS NOT NULL OR role IS NOT NULL)
);

ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "document_permissions_tenant" ON document_permissions FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_document_permissions_document_id ON document_permissions(document_id);
CREATE INDEX idx_document_permissions_folder_id ON document_permissions(folder_id);
CREATE INDEX idx_document_permissions_user_id ON document_permissions(user_id);
```

### rfis
```sql
CREATE TABLE rfis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    -- RFI Info
    rfi_number TEXT NOT NULL,
    subject TEXT NOT NULL,
    question TEXT NOT NULL,

    -- Context
    spec_section TEXT,
    drawing_reference TEXT,
    location TEXT,

    -- Routing
    sent_to_type TEXT,                         -- architect, engineer, client, other
    sent_to_name TEXT,
    sent_to_email TEXT,
    sent_to_vendor_id UUID REFERENCES vendors(id),

    -- Dates
    date_sent DATE,
    date_required DATE,
    date_received DATE,

    -- Status
    status TEXT DEFAULT 'draft',               -- draft, sent, responded, closed
    priority TEXT DEFAULT 'normal',            -- low, normal, high, critical

    -- Response
    answer TEXT,
    answered_by TEXT,
    answered_at TIMESTAMPTZ,

    -- Impact
    cost_impact DECIMAL(15, 2),
    schedule_impact_days INT,
    change_order_required BOOLEAN DEFAULT false,
    change_order_id UUID REFERENCES change_orders(id),

    -- Documents
    attachment_ids UUID[],

    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, job_id, rfi_number)
);

ALTER TABLE rfis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rfis_tenant" ON rfis FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_rfis_company_id ON rfis(company_id);
CREATE INDEX idx_rfis_job_id ON rfis(job_id);
CREATE INDEX idx_rfis_status ON rfis(status);
```

### rfi_responses
```sql
CREATE TABLE rfi_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    rfi_id UUID NOT NULL REFERENCES rfis(id) ON DELETE CASCADE,

    response_type TEXT DEFAULT 'response',     -- response, clarification, follow_up
    response_text TEXT NOT NULL,
    responded_by TEXT,
    responded_at TIMESTAMPTZ DEFAULT NOW(),

    attachment_ids UUID[],

    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rfi_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rfi_responses_tenant" ON rfi_responses FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_rfi_responses_rfi_id ON rfi_responses(rfi_id);
```

### submittals
```sql
CREATE TABLE submittals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    -- Submittal Info
    submittal_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,

    -- Specification
    spec_section TEXT,
    spec_paragraph TEXT,

    -- Source
    vendor_id UUID REFERENCES vendors(id),
    manufacturer TEXT,
    product_name TEXT,

    -- Review Info
    sent_to_type TEXT,                         -- architect, engineer
    sent_to_name TEXT,

    -- Dates
    date_submitted DATE,
    date_required DATE,
    date_returned DATE,

    -- Status
    status TEXT DEFAULT 'draft',               -- draft, submitted, under_review, approved, approved_as_noted, revise_resubmit, rejected
    review_notes TEXT,
    review_by TEXT,
    reviewed_at TIMESTAMPTZ,

    -- Copies Required
    copies_required INT DEFAULT 3,

    -- Documents
    document_ids UUID[],

    -- Schedule Impact
    lead_time_days INT,
    scheduled_delivery DATE,

    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, job_id, submittal_number)
);

ALTER TABLE submittals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "submittals_tenant" ON submittals FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_submittals_job_id ON submittals(job_id);
CREATE INDEX idx_submittals_status ON submittals(status);
CREATE INDEX idx_submittals_vendor_id ON submittals(vendor_id);
```

### submittal_reviews
```sql
CREATE TABLE submittal_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    submittal_id UUID NOT NULL REFERENCES submittals(id) ON DELETE CASCADE,

    review_round INT DEFAULT 1,
    status TEXT NOT NULL,                      -- approved, approved_as_noted, revise_resubmit, rejected
    reviewer_name TEXT,
    review_notes TEXT,
    reviewed_at TIMESTAMPTZ DEFAULT NOW(),

    document_ids UUID[],                       -- Marked-up documents

    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE submittal_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "submittal_reviews_tenant" ON submittal_reviews FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_submittal_reviews_submittal_id ON submittal_reviews(submittal_id);
```

### message_threads
```sql
CREATE TABLE message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Thread Info
    subject TEXT NOT NULL,
    thread_type TEXT DEFAULT 'general',        -- general, job, rfi, submittal, change_order

    -- Related Entity
    job_id UUID REFERENCES jobs(id),
    entity_type TEXT,
    entity_id UUID,

    -- Status
    is_archived BOOLEAN DEFAULT false,

    -- Last Activity
    last_message_at TIMESTAMPTZ,
    message_count INT DEFAULT 0,

    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "message_threads_tenant" ON message_threads FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_message_threads_company_id ON message_threads(company_id);
CREATE INDEX idx_message_threads_job_id ON message_threads(job_id);
CREATE INDEX idx_message_threads_last_message ON message_threads(last_message_at DESC);
```

### messages
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,

    -- Message Content
    body TEXT NOT NULL,
    body_html TEXT,

    -- Sender
    sender_id UUID REFERENCES users(id),
    sender_name TEXT,
    sender_email TEXT,
    is_system_message BOOLEAN DEFAULT false,

    -- Attachments
    attachment_ids UUID[],

    -- Status
    is_deleted BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_tenant" ON messages FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

### message_recipients
```sql
CREATE TABLE message_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,

    -- Recipient
    user_id UUID REFERENCES users(id),
    email TEXT,
    name TEXT,
    recipient_type TEXT DEFAULT 'to',          -- to, cc, bcc

    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    last_read_message_id UUID REFERENCES messages(id),

    -- Notifications
    email_notifications BOOLEAN DEFAULT true,
    is_muted BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(thread_id, user_id),
    UNIQUE(thread_id, email)
);

ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "message_recipients_tenant" ON message_recipients FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_message_recipients_thread_id ON message_recipients(thread_id);
CREATE INDEX idx_message_recipients_user_id ON message_recipients(user_id);
```

### notifications
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Notification Content
    notification_type TEXT NOT NULL,           -- task_assigned, approval_needed, deadline, message, mention, system
    title TEXT NOT NULL,
    body TEXT,

    -- Priority
    priority TEXT DEFAULT 'normal',            -- low, normal, high, urgent

    -- Reference
    entity_type TEXT,
    entity_id UUID,
    job_id UUID REFERENCES jobs(id),
    link_url TEXT,

    -- Action
    action_type TEXT,                          -- view, approve, respond
    action_label TEXT,

    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    is_dismissed BOOLEAN DEFAULT false,
    dismissed_at TIMESTAMPTZ,

    -- Delivery
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMPTZ,
    push_sent BOOLEAN DEFAULT false,
    push_sent_at TIMESTAMPTZ,

    -- Expiration
    expires_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_tenant" ON notifications FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_job_id ON notifications(job_id);
```

### notification_preferences
```sql
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Preferences by Type
    preferences JSONB NOT NULL DEFAULT '{
        "task_assigned": {"in_app": true, "email": true, "push": true},
        "approval_needed": {"in_app": true, "email": true, "push": true},
        "deadline": {"in_app": true, "email": true, "push": false},
        "message": {"in_app": true, "email": false, "push": true},
        "mention": {"in_app": true, "email": true, "push": true},
        "system": {"in_app": true, "email": false, "push": false}
    }',

    -- Quiet Hours
    quiet_hours_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    quiet_hours_timezone TEXT DEFAULT 'America/New_York',

    -- Email Digest
    email_digest_enabled BOOLEAN DEFAULT false,
    email_digest_frequency TEXT DEFAULT 'daily', -- daily, weekly

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id)
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notification_preferences_tenant" ON notification_preferences FOR ALL USING (company_id = get_current_company_id());
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
```

---

## Helper Functions

### update_updated_at
```sql
-- Already created in Phase 1, but ensure it exists
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Triggers for all tables with updated_at
```sql
-- Apply to all tables with updated_at column
-- Example pattern:
CREATE TRIGGER update_schedule_items_updated_at
    BEFORE UPDATE ON schedule_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Repeat for: daily_logs, photos, inspections, punch_lists, punch_list_items,
-- safety_observations, safety_incidents, selections, selection_options,
-- allowances, vendors, vendor_documents, vendor_ratings, bid_packages, bids,
-- contracts, insurance_policies, lien_waivers, client_portal_settings,
-- client_portal_access, approval_requests, saved_reports, report_schedules,
-- dashboard_widgets, kpi_definitions, documents, rfis, submittals,
-- message_threads, messages, message_recipients, notifications,
-- notification_preferences
```

---

## Schema Summary

| Phase | Tables | Key Features |
|-------|--------|--------------|
| 3 | 14 | Schedule, daily logs, photos, inspections, punch lists, safety |
| 4 | 7 | Selection categories, selections, options, approvals, allowances, specs |
| 5 | 14 | Vendors, contacts, documents, ratings, bids, contracts, insurance, waivers |
| 6 | 4 | Portal settings, access, notifications, approval requests |
| 7 | 5 | Saved reports, schedules, dashboards, KPI definitions, snapshots |
| 8 | 12 | Documents, folders, versions, permissions, RFIs, submittals, messages, notifications |

**Total Tables (Phases 3-8): 56**
**Total Tables (All Phases): ~85**

---

*Last Updated: 2024-02-12*
*Version: 2.0 - Complete schemas for all phases*
