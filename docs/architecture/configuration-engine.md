# Configuration Engine Design

## 1. Purpose

The configuration engine is the central mechanism by which builder-specific settings are stored, inherited, overridden, and applied at runtime. It exists to enforce **Rule 1 ("Never Hardcode What Should Be Configurable")** and **Rule 6 ("Configuration Over Code")** from the Claude Code Blueprint: when a builder wants something to work differently, the answer is never "we need to deploy a code change" -- it is always "change this setting."

Every value written into this platform must first pass the test: *"Would a different builder want this to be different?"* If the answer is yes, the value lives in the configuration engine, not in code.

---

## 2. Existing Foundation: `companies.settings` JSONB

The data model already defines a `settings` JSONB column on the `companies` table with a handful of default values:

```sql
-- From data-model.md, companies table
settings JSONB DEFAULT '{
  "invoice_approval_threshold": 25000,
  "retainage_default_percent": 10,
  "fiscal_year_start_month": 1,
  "timezone": "America/Chicago",
  "date_format": "MM/DD/YYYY",
  "currency": "USD"
}'
```

This is a starting point but is insufficient for the full scope of configurable behavior the platform requires. The design below extends this into a layered, schema-validated configuration system.

---

## 3. Configuration Hierarchy

Settings are resolved through a four-level hierarchy. When a setting is requested, the engine walks from most-specific to least-specific and returns the first defined value:

```
Level 4 (most specific):  User Preferences
                             |
Level 3:                  Project Overrides
                             |
Level 2:                  Company Settings
                             |
Level 1 (least specific): Platform Defaults
```

### 3.1 Level 1 -- Platform Defaults

Hardcoded in the application source as a frozen default configuration object. These are the values that apply when no company, project, or user override exists. They represent sensible defaults for a new builder who has not customized anything.

**Storage:** Application code constant (`server/config/platform-defaults.js` or equivalent).

**Examples:**
- Default retainage percent: `10`
- Default date format: `MM/DD/YYYY`
- Default invoice approval required: `true`
- Default PO numbering format: `PO-{SEQUENCE}`
- Default cost code structure: CSI 16-division

### 3.2 Level 2 -- Company Settings

Per-builder settings stored in the database. This is where the majority of configuration lives. Every builder can customize behavior for their entire organization without affecting any other tenant.

**Storage:** `companies.settings` JSONB column (existing) plus the `company_config` table for structured/typed settings (new, see Section 7).

### 3.3 Level 3 -- Project Overrides

Per-project overrides that differ from the company default. Not every setting is overridable at the project level -- only those that make sense (e.g., retainage percent, tax rate, approval thresholds).

**Storage:** `jobs.settings` JSONB column (already exists in data-model.md as `settings JSONB DEFAULT '{}'`).

### 3.4 Level 4 -- User Preferences

Individual user presentation and notification preferences. These never affect business logic -- only how information is displayed and how the user is notified.

**Storage:** `users.preferences` JSONB column (already exists in data-model.md).

---

## 4. Complete List of Configurable Items

Derived from Blueprint Rule 1 and the full gap analysis. Items are grouped by domain.

### 4.1 Cost Code Structures

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| Cost code hierarchy format (flat, 2-level, 3-level) | enum | Company | Designed (cost_codes table supports parent_id hierarchy) |
| Default code format (CSI `03-30-00` vs custom `100.10`) | string pattern | Company | TODO: Validation pattern needs to be configurable |
| Default divisions/categories | seed data | Company | Designed (is_default flag on cost_codes) |
| Category labels (labor, material, subcontractor, equipment, other) | string[] | Company | TODO: Currently hardcoded as CHECK constraint |
| Allow cost codes per project vs company-wide only | boolean | Company | TODO |

### 4.2 Approval Workflows

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| Invoice approval threshold (amount requiring owner review) | currency | Company, Project | Designed (invoice_approval_threshold in companies.settings) |
| Invoice approval chain (roles in sequence) | ordered role[] | Company | TODO: Currently hardcoded as pm -> accountant -> owner |
| PO approval required above amount | currency | Company | TODO |
| PO approval chain | ordered role[] | Company | TODO |
| Change order approval chain | ordered role[] | Company | TODO |
| Change order client approval required | boolean | Company | TODO |
| Draw approval chain | ordered role[] | Company | TODO |
| Estimate approval before sending | boolean | Company | TODO |
| Auto-approve invoices below amount | currency | Company | TODO |
| Require lien waiver before payment | boolean | Company, Project | Designed (lien_waiver_required on invoices defaults to true) |

### 4.3 Required Fields

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| Required fields per entity (invoice, PO, daily log, etc.) | field_name[] per entity | Company | TODO: Need a required_fields map in settings |
| Required photos on daily log submission | boolean | Company | TODO |
| Required weather on daily log | boolean | Company | TODO |
| Cost code required on invoice allocation | boolean | Company | TODO |
| PO required before invoice can be approved | boolean | Company | TODO |

### 4.4 Terminology

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| "Vendor" vs "Subcontractor" vs "Trade Partner" | string | Company | TODO |
| "Job" vs "Project" | string | Company | TODO |
| "Invoice" vs "Bill" | string | Company | TODO |
| "Draw" vs "Pay Application" vs "Progress Billing" | string | Company | TODO |
| "Daily Log" vs "Field Report" vs "Daily Report" | string | Company | TODO |
| "Change Order" vs "Variation" vs "Modification" | string | Company | TODO |
| "Punch List" vs "Deficiency List" vs "Snag List" | string | Company | TODO |

**Implementation approach:** A `terminology` object in company settings maps canonical keys (e.g., `vendor`, `job`, `invoice`) to display strings. The UI reads these at render time. Platform defaults use the canonical names.

### 4.5 Numbering Formats

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| Job number format | template string | Company | TODO (e.g., `{YEAR}-{SEQUENCE}`, `{PREFIX}-{SEQUENCE}`) |
| Invoice number format | template string | Company | TODO |
| PO number format | template string | Company | TODO (currently just `po_number TEXT`) |
| Change order number format | template string | Company | TODO (e.g., `CO-{SEQUENCE}` vs `{YEAR}-{JOB}-CO-{SEQUENCE}`) |
| Draw number format | template string | Company | TODO |
| Estimate number format | template string | Company | TODO |
| RFI number format | template string | Company | TODO |
| Submittal number format | template string | Company | TODO |
| Sequence reset frequency (yearly, per-project, never) | enum | Company | TODO |
| Starting sequence number | integer | Company | TODO |

### 4.6 Tax Rates

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| Default sales tax rate | decimal | Company, Project | TODO (currently per-entity: estimates.tax_rate, PO.tax_rate) |
| Tax rate by jurisdiction/county | map | Company | TODO |
| Tax applies to labor | boolean | Company | TODO |
| Tax applies to materials | boolean | Company | TODO |
| Tax applies to equipment | boolean | Company | TODO |

### 4.7 Lien Waiver Forms

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| State for lien waiver forms | state code | Company, Project | TODO |
| Lien waiver form templates by state | file references | Platform, Company | TODO: Need a template storage mechanism |
| Conditional vs unconditional threshold | currency | Company | TODO |
| Auto-request lien waiver on payment | boolean | Company | TODO |
| Lien waiver required before draw inclusion | boolean | Company | Partially designed (lien_waiver_required on invoices) |

### 4.8 Markup Calculations

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| Default markup type (percent vs fixed) | enum | Company | Designed (estimates.markup_type) |
| Default markup percentage | decimal | Company | Designed (estimates.markup_value) |
| Markup applies to labor | boolean | Company | TODO |
| Markup applies to materials | boolean | Company | TODO |
| Markup applies to subcontractor costs | boolean | Company | TODO |
| Cost-plus fee structure (percent, fixed, tiered) | enum | Company, Project | Partially designed (jobs.cost_plus_markup) |
| Contingency default percent | decimal | Company | Designed (estimates.contingency_percent) |
| Overhead percentage (separate from markup) | decimal | Company | TODO |

### 4.9 Document Templates

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| Proposal template(s) | HTML/template | Company | TODO |
| Contract template(s) with clause library | HTML/template | Company | TODO |
| Purchase order template | HTML/template | Company | TODO |
| Change order template | HTML/template | Company | TODO |
| Draw request / G702 template | HTML/template | Company | TODO |
| Daily log report template | HTML/template | Company | TODO |
| Client update email template | HTML/template | Company | TODO |
| Company logo for generated documents | image URL | Company | Designed (companies.logo_url) |
| Company color for branding | hex color | Company | Designed (companies.primary_color) |

### 4.10 Notification Triggers

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| Notify PM when invoice assigned | boolean | Company, User | Partially designed (users.preferences.notifications) |
| Notify owner when invoice exceeds threshold | boolean | Company | TODO |
| Notify vendor when PO sent | boolean | Company | TODO |
| Notify client when draw submitted | boolean | Company | TODO |
| Notify team when daily log submitted | boolean | Company | TODO |
| Notify PM when task overdue | boolean | Company | TODO |
| Notify on insurance/license expiration (days before) | integer | Company | TODO |
| Notification channels per event (email, push, in-app) | channel[] per event | Company, User | Partially designed (users.preferences.notifications) |
| Daily digest vs real-time notifications | enum | User | TODO |

### 4.11 Portal Content and Access

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| Client portal enabled | boolean | Company | Designed (clients.portal_enabled) |
| Portal shows budget details | boolean | Company, Project | TODO |
| Portal shows schedule | boolean | Company, Project | TODO |
| Portal shows daily logs | boolean | Company, Project | TODO |
| Portal shows photos | boolean | Company, Project | Designed (photos.portal_visible) |
| Portal shows invoices/financial detail | boolean | Company, Project | TODO |
| Portal allows selection approval | boolean | Company | TODO |
| Portal allows change order approval | boolean | Company | TODO |
| Portal allows draw approval | boolean | Company | TODO |
| Portal allows messaging | boolean | Company | TODO |
| Portal branding (logo, colors, custom domain) | mixed | Company | Partially designed (logo_url, primary_color) |
| Vendor portal enabled | boolean | Company | TODO |
| Vendor portal access levels | config object | Company | TODO |

### 4.12 Dashboard Widgets

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| Dashboard layout / widget arrangement | widget config[] | User | TODO |
| Default dashboard for each role | widget config[] | Company | TODO |
| Available widget types | enum[] | Platform | TODO |
| Widget refresh interval | seconds | Company | TODO |

### 4.13 Report Templates

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| Available report types | enum[] | Platform, Company | TODO |
| Report scheduling (daily, weekly, monthly) | cron-like | Company | TODO |
| Report recipients | user/email[] per report | Company | TODO |
| Report branding | template config | Company | TODO |
| Custom report definitions | report config | Company | TODO |

### 4.14 Phase Names and Sequences

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| Project phases (names and order) | ordered string[] | Company | TODO (currently hardcoded in jobs.status CHECK constraint) |
| Phase transition rules (which phases can follow which) | state machine | Company | TODO |
| Default phase for new projects | string | Company | Designed (jobs.status defaults to 'pre_construction') |

### 4.15 Status Labels and Workflows

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| Invoice statuses (names, colors, order) | status config[] | Company | TODO (currently hardcoded CHECK constraint with 11 statuses) |
| PO statuses | status config[] | Company | TODO |
| Task statuses | status config[] | Company | TODO |
| Lead pipeline stages | status config[] | Company | TODO |
| Change order statuses | status config[] | Company | TODO |
| Status transition rules per entity | state machine | Company | TODO |

---

## 5. Configuration Engine Runtime Behavior

### 5.1 Fetching a Setting

When any part of the application needs a configuration value, it calls the configuration engine with a key and optional context:

```typescript
// Pseudocode — server-side
function getConfig(
  key: string,
  context: {
    companyId: string;
    projectId?: string;
    userId?: string;
  }
): ConfigValue {
  // 1. Check user preferences (Level 4) if userId provided
  if (context.userId) {
    const userPref = getUserPreference(context.userId, key);
    if (userPref !== undefined) return userPref;
  }

  // 2. Check project overrides (Level 3) if projectId provided
  if (context.projectId) {
    const projectOverride = getProjectSetting(context.projectId, key);
    if (projectOverride !== undefined) return projectOverride;
  }

  // 3. Check company settings (Level 2)
  const companySetting = getCompanySetting(context.companyId, key);
  if (companySetting !== undefined) return companySetting;

  // 4. Fall back to platform defaults (Level 1)
  return getPlatformDefault(key);
}
```

### 5.2 Caching Strategy

Configuration values are read frequently and change rarely. The engine should:

1. **Load company settings into memory** on first request per company per server process.
2. **Cache with a TTL of 5 minutes** (configurable). Any settings change writes to the database and invalidates the cache.
3. **Project-level overrides** are loaded on first access to that project and cached per-project.
4. **User preferences** are loaded at login and cached per-session.
5. **Platform defaults** are always in memory (they are code constants).

TODO: Determine whether to use Redis for cross-process cache invalidation or rely on per-process caches with TTL.

### 5.3 Client-Side Access

The frontend needs access to configuration values to render correctly (terminology, required fields, available statuses, etc.). The approach:

1. On login, the API returns a `config` payload with the resolved company settings merged with platform defaults.
2. This is stored in React context (`ConfigProvider`) and accessible via a `useConfig(key)` hook.
3. Project-specific overrides are fetched when a project is loaded and merged into the context for that project's scope.
4. User preferences are part of the auth context (already loaded at login).

```typescript
// Pseudocode — client-side
const { config } = useConfig();
const vendorLabel = config.terminology?.vendor || 'Vendor';
const requireLienWaiver = config.lien_waiver_required ?? true;
```

### 5.4 Settings Validation

All configuration values must be validated before persistence. The engine uses JSON Schema or Zod schemas to validate each setting key:

```typescript
// Example: validate that invoice_approval_threshold is a positive number
const settingsSchema = z.object({
  invoice_approval_threshold: z.number().positive().optional(),
  retainage_default_percent: z.number().min(0).max(100).optional(),
  timezone: z.string().optional(),
  date_format: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).optional(),
  currency: z.enum(['USD', 'CAD']).optional(),
  terminology: z.record(z.string()).optional(),
  // ... all other setting keys
});
```

Invalid values are rejected with a clear error message. The API never persists an invalid setting.

---

## 6. Settings Management API

### 6.1 Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `GET /api/settings` | GET | Get resolved settings for current company (merged with defaults) |
| `PATCH /api/settings` | PATCH | Update company-level settings (owner/admin only) |
| `GET /api/settings/defaults` | GET | Get platform defaults (for reference / reset) |
| `GET /api/jobs/:id/settings` | GET | Get project-level overrides |
| `PATCH /api/jobs/:id/settings` | PATCH | Update project-level overrides |
| `GET /api/settings/schema` | GET | Get the settings schema (for dynamic form generation in the UI) |
| `PATCH /api/users/me/preferences` | PATCH | Update user preferences |

### 6.2 Settings UI

The Settings page (`/settings/company`) should organize settings into tabs/sections that mirror the domains in Section 4:

- General (timezone, date format, currency, fiscal year)
- Financial (approval thresholds, retainage, tax rates, markup)
- Numbering (format patterns for jobs, POs, COs, etc.)
- Terminology (rename entities)
- Workflows (approval chains, required fields, status sequences)
- Notifications (triggers and channels)
- Documents (templates, branding)
- Portal (client and vendor portal settings)
- Lien Waivers (state, forms, thresholds)

TODO: Design the settings UI wireframes for each section.

---

## 7. Database Schema for Settings Storage

### 7.1 Existing Tables (Already in Data Model)

The following tables already have settings/preferences JSONB columns:

```sql
-- companies.settings — company-wide configuration (Level 2)
-- Already defined in data-model.md

-- jobs.settings — project-level overrides (Level 3)
-- Already defined: settings JSONB DEFAULT '{}'

-- users.preferences — user display/notification preferences (Level 4)
-- Already defined with default notification and theme values
```

### 7.2 New: Structured Configuration Table

For configuration that benefits from structured storage, queryability, and audit history (e.g., approval workflow definitions, status workflow definitions), a dedicated table is needed:

```sql
-- TODO: Create this table
CREATE TABLE company_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Configuration identity
  config_domain TEXT NOT NULL,         -- 'approval_workflow', 'status_workflow',
                                       -- 'numbering', 'notification_rules', etc.
  config_key TEXT NOT NULL,            -- 'invoice_approval_chain', 'po_statuses', etc.

  -- Value
  config_value JSONB NOT NULL,         -- The configuration payload

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),

  UNIQUE(company_id, config_domain, config_key)
);

CREATE INDEX idx_company_config_company ON company_config(company_id);
CREATE INDEX idx_company_config_domain ON company_config(company_id, config_domain);
```

**When to use `companies.settings` JSONB vs `company_config` table:**

| Use `companies.settings` JSONB | Use `company_config` table |
|--------------------------------|---------------------------|
| Simple key-value pairs | Complex nested structures |
| Rarely queried independently | Need to query/filter by config domain |
| Few dozen keys total | Potentially many configs per domain |
| Read-heavy, rarely written | Need audit trail of who changed what |

**Example `company_config` rows:**

```json
// Approval workflow for invoices
{
  "config_domain": "approval_workflow",
  "config_key": "invoice",
  "config_value": {
    "steps": [
      { "role": "pm", "required": true, "threshold": 0 },
      { "role": "accountant", "required": true, "threshold": 0 },
      { "role": "owner", "required": true, "threshold": 25000 }
    ],
    "auto_approve_below": 500
  }
}

// Status workflow for invoices
{
  "config_domain": "status_workflow",
  "config_key": "invoice",
  "config_value": {
    "statuses": [
      { "key": "processing", "label": "Processing", "color": "#6B7280" },
      { "key": "draft", "label": "Draft", "color": "#3B82F6" },
      { "key": "pm_pending", "label": "PM Review", "color": "#F59E0B" },
      { "key": "approved", "label": "Approved", "color": "#10B981" },
      { "key": "paid", "label": "Paid", "color": "#059669" },
      { "key": "rejected", "label": "Rejected", "color": "#EF4444" }
    ],
    "transitions": {
      "processing": ["draft", "needs_matching"],
      "draft": ["pm_pending", "rejected"],
      "pm_pending": ["accountant_pending", "rejected"],
      "accountant_pending": ["owner_pending", "approved", "rejected"],
      "owner_pending": ["approved", "rejected"],
      "approved": ["in_draw", "paid"],
      "rejected": ["draft"]
    }
  }
}

// Numbering format for POs
{
  "config_domain": "numbering",
  "config_key": "purchase_order",
  "config_value": {
    "format": "PO-{YEAR}-{SEQUENCE:4}",
    "reset_annually": true,
    "next_sequence": 1
  }
}
```

### 7.3 New: Document Templates Table

```sql
-- TODO: Create this table
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  -- NULL company_id = platform-provided default template

  -- Template identity
  template_type TEXT NOT NULL,          -- 'proposal', 'contract', 'purchase_order',
                                        -- 'change_order', 'draw_request', 'lien_waiver',
                                        -- 'daily_log_report', 'client_update'
  name TEXT NOT NULL,                   -- Display name
  description TEXT,

  -- Template content
  content_html TEXT NOT NULL,           -- HTML template with Handlebars/Mustache placeholders
  header_html TEXT,                     -- Optional header for multi-page docs
  footer_html TEXT,                     -- Optional footer

  -- Settings
  is_default BOOLEAN DEFAULT false,     -- Default template for this type
  page_size TEXT DEFAULT 'letter',      -- 'letter', 'a4', 'legal'
  orientation TEXT DEFAULT 'portrait',  -- 'portrait', 'landscape'

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_doc_templates_company ON document_templates(company_id);
CREATE INDEX idx_doc_templates_type ON document_templates(company_id, template_type);
```

### 7.4 New: Terminology Overrides

Terminology is stored in `companies.settings` as a simple key-value map:

```json
{
  "terminology": {
    "vendor": "Trade Partner",
    "job": "Project",
    "invoice": "Bill",
    "draw": "Pay Application",
    "daily_log": "Field Report",
    "change_order": "Change Directive",
    "punch_list": "Deficiency List"
  }
}
```

The frontend wraps all entity labels in a `t(key)` function that checks this map before falling back to defaults. This is simpler than a full i18n system but accomplishes the same goal for entity renaming.

---

## 8. Custom Fields

Builders need the ability to add their own fields to standard forms without code changes. This is a high-value feature for configuration-over-code.

### 8.1 Use Cases

- A builder wants to track "Lot Number" on every job.
- A builder wants a "Payment Method" dropdown on invoices with company-specific options.
- A builder wants to capture "Crew Size" on daily logs as a required numeric field.
- A builder wants "Warranty Type" on vendors (e.g., "1-year", "2-year", "lifetime").

### 8.2 Custom Field Definitions Table

```sql
-- TODO: Create this table
CREATE TABLE custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Target entity
  entity_type TEXT NOT NULL,            -- 'job', 'vendor', 'invoice', 'daily_log',
                                        -- 'client', 'purchase_order', 'change_order',
                                        -- 'estimate', 'task', 'punch_item'

  -- Field definition
  field_key TEXT NOT NULL,              -- Machine-readable key (e.g., 'lot_number')
  field_label TEXT NOT NULL,            -- Display label (e.g., 'Lot Number')
  field_type TEXT NOT NULL              -- 'text', 'number', 'currency', 'date',
    CHECK (field_type IN (              -- 'boolean', 'select', 'multi_select',
      'text', 'number', 'currency',     -- 'email', 'phone', 'url', 'textarea'
      'date', 'boolean', 'select',
      'multi_select', 'email', 'phone',
      'url', 'textarea'
    )),

  -- Validation
  is_required BOOLEAN DEFAULT false,
  min_value DECIMAL,                    -- For number/currency
  max_value DECIMAL,                    -- For number/currency
  max_length INTEGER,                   -- For text/textarea
  regex_pattern TEXT,                   -- Custom validation regex

  -- Options (for select / multi_select)
  options JSONB,                        -- e.g., ["1-year", "2-year", "lifetime"]

  -- Display
  placeholder TEXT,                     -- Input placeholder text
  help_text TEXT,                       -- Help text shown below field
  section TEXT,                         -- Which form section to display in
  sort_order INTEGER DEFAULT 0,         -- Display order within section
  show_in_list BOOLEAN DEFAULT false,   -- Show as column in list views
  show_in_portal BOOLEAN DEFAULT false, -- Visible in client/vendor portal

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, entity_type, field_key)
);

CREATE INDEX idx_custom_fields_company ON custom_field_definitions(company_id);
CREATE INDEX idx_custom_fields_entity ON custom_field_definitions(company_id, entity_type);
```

### 8.3 Custom Field Values Table

```sql
-- TODO: Create this table
CREATE TABLE custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  field_definition_id UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,

  -- Target record
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Value (stored as text, cast at read time based on field_type)
  value_text TEXT,
  value_number DECIMAL,
  value_date DATE,
  value_boolean BOOLEAN,
  value_json JSONB,                     -- For multi_select and complex values

  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),

  UNIQUE(field_definition_id, entity_id)
);

CREATE INDEX idx_custom_values_entity ON custom_field_values(entity_type, entity_id);
CREATE INDEX idx_custom_values_field ON custom_field_values(field_definition_id);
CREATE INDEX idx_custom_values_company ON custom_field_values(company_id);
```

### 8.4 Alternative: JSONB on Each Entity

A simpler alternative to a separate values table is to add a `custom_fields JSONB` column to every entity table that supports custom fields. This is faster for reads (no join needed) but harder to query across records by a custom field value.

**Recommendation:** Use the separate `custom_field_values` table for full queryability and reporting. If performance becomes a concern for common read paths, denormalize into a `custom_fields JSONB` column on the entity as a cache.

### 8.5 Custom Fields API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `GET /api/custom-fields/:entityType` | GET | List field definitions for an entity type |
| `POST /api/custom-fields` | POST | Create a custom field definition |
| `PATCH /api/custom-fields/:id` | PATCH | Update a field definition |
| `DELETE /api/custom-fields/:id` | DELETE | Deactivate a field (soft delete) |
| `GET /api/:entityType/:id/custom-fields` | GET | Get custom field values for a record |
| `PUT /api/:entityType/:id/custom-fields` | PUT | Set custom field values for a record |

### 8.6 Custom Fields UI Integration

TODO: Design how custom fields are rendered in forms.

The general approach:
1. When a form loads, fetch the custom field definitions for that entity type.
2. Render the custom fields in the appropriate form section, sorted by `sort_order`.
3. Apply validation rules from the field definition (required, min/max, pattern).
4. On save, submit custom field values alongside standard entity data.
5. In list views, custom fields marked `show_in_list` appear as additional columns.

---

## 9. Workflow Engine (Approval Chains and Status Machines)

TODO: This section needs detailed design.

### 9.1 Overview

Several configurable items in Section 4 involve workflow behavior:
- Approval chains (who must approve in what order)
- Status transitions (which statuses can follow which)
- Notification triggers (what events fire notifications to whom)

These should be driven by configuration stored in `company_config`, not by code branching on hardcoded status values.

### 9.2 Approval Chain Execution

High-level approach:
1. When an entity enters an approval state (e.g., invoice moves to `pm_pending`), the engine reads the approval chain configuration for that entity type.
2. The engine determines the current step based on the entity's state and finds the next required approver role.
3. If the amount is below a step's threshold, that step is skipped.
4. The engine creates a notification for the appropriate user(s) with that role.
5. When all steps are complete, the entity transitions to `approved`.

TODO: Define the data structures, state machine executor, and edge cases (what if no user has the required role? what if the chain is modified while an entity is mid-approval?).

### 9.3 Status Machine Executor

High-level approach:
1. Status workflows are defined as state machines in `company_config` (see Section 7.3 example).
2. Before any status transition, the engine checks the `transitions` map to verify the transition is valid.
3. Invalid transitions are rejected with a clear error.
4. Each transition can optionally trigger side effects (notifications, field requirements, etc.) -- also configurable.

TODO: Define the executor, side-effect registration, and rollback behavior.

---

## 10. Numbering Engine

TODO: This section needs detailed design.

### 10.1 Overview

Every entity with a number (jobs, POs, COs, invoices, estimates, RFIs, submittals, draws) needs a configurable numbering format. The format is a template string with tokens:

| Token | Meaning | Example |
|-------|---------|---------|
| `{YEAR}` | Current 4-digit year | `2026` |
| `{YY}` | Current 2-digit year | `26` |
| `{SEQUENCE}` | Auto-incrementing number | `1`, `2`, `3` |
| `{SEQUENCE:N}` | Zero-padded to N digits | `001`, `002` |
| `{JOB}` | Job number | `2026-015` |
| `{PREFIX}` | Company-configured prefix | `AMI`, `RB` |
| `{MONTH}` | Current 2-digit month | `02` |

**Example formats:**
- `PO-{SEQUENCE:4}` -> `PO-0001`
- `{YEAR}-{PREFIX}-CO-{SEQUENCE:3}` -> `2026-AMI-CO-001`
- `{JOB}-INV-{SEQUENCE}` -> `2026-015-INV-1`

### 10.2 Sequence Tracking

```sql
-- TODO: Create this table
CREATE TABLE number_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  entity_type TEXT NOT NULL,            -- 'job', 'purchase_order', 'change_order', etc.
  scope_id UUID,                        -- NULL for company-wide, job_id for per-project sequences
  period TEXT,                          -- NULL for never-reset, '2026' for annual reset

  current_value INTEGER NOT NULL DEFAULT 0,

  UNIQUE(company_id, entity_type, scope_id, period)
);
```

TODO: Design the thread-safe sequence increment mechanism (likely `UPDATE ... RETURNING` or advisory locks in PostgreSQL).

---

## 11. Migration Path

### 11.1 From Current State

The current system has:
- `companies.settings` JSONB with 6 keys
- `jobs.settings` JSONB (empty default)
- `users.preferences` JSONB with notification and theme settings
- Hardcoded CHECK constraints for statuses on ~15 tables
- Hardcoded approval logic in invoice routes

### 11.2 Migration Steps

1. **Phase A (Non-breaking):** Create the new tables (`company_config`, `custom_field_definitions`, `custom_field_values`, `document_templates`, `number_sequences`). No existing code changes required.

2. **Phase B (Gradual):** Add a configuration engine service (`server/core/config-engine.js`) that reads from `companies.settings` and `company_config`, with platform defaults as fallback. Migrate existing hardcoded values to use `getConfig()` calls one route/module at a time.

3. **Phase C (Status workflows):** Relax or remove CHECK constraints on status columns, replacing them with application-level validation against the configurable status workflows. This allows builders to customize status labels and transitions.

4. **Phase D (UI):** Build the Settings pages for each configuration domain. Build the custom fields UI. Build the template editor.

TODO: Estimate effort for each phase and assign to build phases.

---

## 12. Open Questions and TODOs

### Critical Design Decisions Needed

1. **CHECK constraint strategy:** Current tables use PostgreSQL CHECK constraints for status enums (e.g., `CHECK (status IN ('draft', 'approved', ...))`). If statuses become configurable, these constraints must be removed or changed to application-level validation. **Decision needed: when to make this migration?**

2. **Cost code category configurability:** The `cost_codes.category` column has a CHECK constraint limiting to `('labor', 'material', 'subcontractor', 'equipment', 'other')`. If builders want different categories, this constraint needs to be relaxed. **Decision needed: how flexible should categories be?**

3. **Terminology depth:** Should terminology changes propagate to API response keys (breaking change) or only affect display labels in the UI? **Recommendation: UI-only.** API always uses canonical names.

4. **Custom field performance:** At scale (1000+ records with 10+ custom fields each), the join to `custom_field_values` could be slow for list views. **Decision needed: when to implement the JSONB denormalization cache?**

5. **Template engine choice:** Document templates need a rendering engine (Handlebars, Mustache, Liquid, or custom). **Decision needed: which template engine?**

6. **Workflow engine scope:** Should the workflow engine be generic enough to handle arbitrary workflows (like a BPM engine), or purpose-built for the known workflow types (approvals, status transitions)? **Recommendation: purpose-built first, generalize later.**

### Implementation TODOs (Summary)

- [ ] Create `company_config` table and migration
- [ ] Create `custom_field_definitions` and `custom_field_values` tables
- [ ] Create `document_templates` table
- [ ] Create `number_sequences` table
- [ ] Build `server/core/config-engine.js` service
- [ ] Build `server/core/numbering-engine.js` service
- [ ] Build `server/core/workflow-engine.js` service (approval chains, status machines)
- [ ] Build Settings API endpoints
- [ ] Build Custom Fields API endpoints
- [ ] Build Settings UI pages (one per domain)
- [ ] Build Custom Fields management UI
- [ ] Build Document Template editor UI
- [ ] Define platform defaults for all configuration keys
- [ ] Define Zod validation schemas for all configuration values
- [ ] Add terminology wrapper (`t()` function) to frontend
- [ ] Migrate existing hardcoded approval logic to use workflow engine
- [ ] Migrate existing hardcoded status values to use status workflow engine
- [ ] Plan removal of CHECK constraints on status columns
- [ ] Add caching layer (in-memory + optional Redis) to config engine
- [ ] Add audit logging for all configuration changes
- [ ] Write tests for config resolution hierarchy
- [ ] Write tests for custom field CRUD and validation
- [ ] Write tests for numbering engine sequence generation
- [ ] Document configuration engine in developer guide

---

*Document Version: 1.0*
*Created: 2026-02-11*
*Status: Initial design. Many sections marked TODO require further detailed design before implementation.*
*Sources: data-model.md, system-architecture.md, claude-code-blueprint.md (Rules 1 and 6)*
