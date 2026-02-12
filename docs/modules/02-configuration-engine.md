# Module 2: Configuration Engine

**Phase:** 1 - Foundation
**Status:** TODO
**Last Updated:** 2026-02-11

---

## Overview

The Configuration Engine is what transforms this platform from "internal software for Ross Built" into "a SaaS product any custom home builder can use." Every workflow, terminology, numbering convention, approval chain, cost code structure, and required field is a configuration setting -- not hardcoded logic.

Configuration follows a hierarchy: **Platform Defaults -> Company (Tenant) -> Project -> User Preferences**. A new tenant gets sensible defaults on day one but can customize everything over time. The engine must be powerful enough for a 50-person operation with complex workflows, yet simple enough that a one-man builder is not overwhelmed by setup.

This module is the second to be built (after Auth) because nearly every downstream module reads from it to determine tenant-specific behavior.

---

## Gap Items Addressed

### Section 1: Configuration & Customization Engine (GAP-016 through GAP-035)

| Gap ID | Description | Sub-topic |
|--------|-------------|-----------|
| GAP-016 | Every workflow must be configurable — who approves what, at what thresholds, in what order | Workflow Engine |
| GAP-017 | Custom cost code hierarchies (CSI, custom, hybrid) | Cost Code Config |
| GAP-018 | Job phases and naming conventions differ per builder | Phase Structure Config |
| GAP-019 | Terminology customization per tenant ("trade partner" vs "subcontractor" vs "vendor") | Terminology Engine |
| GAP-020 | Document templates (proposals, contracts, COs, draw requests) fully customizable | Template Config |
| GAP-021 | Configurable numbering schemes (CO-001 vs 2024-AMI-CO-001) | Numbering Engine |
| GAP-022 | Approval workflows differ — 3-level approval vs. owner-clicks-approve | Approval Workflow Config |
| GAP-023 | Custom fields on any entity (projects, vendors, clients, line items) | Custom Fields Engine |
| GAP-024 | Custom dropdown values per tenant (project types, client sources, defect categories) | Custom Dropdowns |
| GAP-025 | Custom report templates per tenant | Report Config |
| GAP-026 | Custom dashboard layouts per tenant | Dashboard Config |
| GAP-027 | Configuration changes mid-project (cost code restructure — do existing projects remap?) | Config Migration |
| GAP-028 | Default values per field (default markup = 18%, default retainage = 10%) | Default Values |
| GAP-029 | Configurable required fields per tenant | Field Requirements |
| GAP-030 | Conditional logic ("If project type = renovation, require asbestos survey field") | Conditional Rules |
| GAP-031 | Configuration versioning — rollback a workflow change that broke things | Config Versioning |
| GAP-032 | Clone another tenant's configuration as a starting template | Config Templates |
| GAP-033 | Out-of-the-box configuration for a new customer — works day 1 | Default Config Set |
| GAP-034 | Complexity budget — setup should not take 40 hours | Progressive Disclosure |
| GAP-035 | Self-service configuration vs. managed setup | Config UX Design |

### Section 1: Related SaaS Architecture Items

| Gap ID | Description | Sub-topic |
|--------|-------------|-----------|
| GAP-003 | Tenant-level feature flags (Builder A has estimating, Builder B doesn't) | Feature Flags |
| GAP-009 | Tenant-specific customizations beyond core product | Extensibility |

---

## Detailed Requirements

### 1. Configuration Hierarchy

All configuration follows a four-level hierarchy with inheritance and override:

```
Level 1: Platform Defaults (set by us, applies to all tenants)
    |
Level 2: Company / Tenant (set by builder admin, overrides platform)
    |
Level 3: Project (set by PM, overrides company for that project)
    |
Level 4: User Preferences (set by individual user, display/UX only)
```

**Resolution logic:** When any module needs a config value, it checks User -> Project -> Company -> Platform, returning the first non-null value. This is implemented as a utility function `resolveConfig(key, { userId, projectId, builderId })` available to all server-side code.

**Caching:** Configuration is cached in Redis per tenant with a 5-minute TTL. Cache is invalidated on any config write. Client-side config is loaded on login and refreshed periodically.

### 2. Workflow Engine (GAP-016, GAP-022)

Workflows define the state machine for key business objects. Each entity type (change order, invoice, purchase order, draw request, selection) has a configurable workflow.

**Workflow definition structure:**
```json
{
  "entity_type": "change_order",
  "states": ["draft", "pending_review", "approved", "rejected", "voided"],
  "initial_state": "draft",
  "transitions": [
    {
      "from": "draft",
      "to": "pending_review",
      "action": "submit",
      "required_role": "project_manager",
      "conditions": []
    },
    {
      "from": "pending_review",
      "to": "approved",
      "action": "approve",
      "required_role": "builder_admin",
      "conditions": [
        { "field": "amount", "operator": "<=", "value": "$threshold_1" },
        { "type": "approval_chain", "approvers": ["pm", "owner"] }
      ]
    }
  ],
  "notifications": [
    { "on_transition": "draft->pending_review", "notify": ["assigned_approver"], "template": "co_submitted" }
  ]
}
```

**Approval thresholds (GAP-022):** Configurable dollar thresholds that determine approval requirements:
- Under $500: PM can approve
- $500 - $5,000: PM approves, owner notified
- Over $5,000: Owner approval required
- Thresholds are fully configurable per tenant. Some tenants will have zero thresholds (owner approves everything). Some will have multi-level chains.

### 3. Cost Code Configuration (GAP-017)

Builders use wildly different cost code systems:
- **CSI MasterFormat** (standard 6-digit codes like 03 30 00 for Concrete)
- **Custom flat list** (simple numbered list: 100 = Foundation, 200 = Framing)
- **Hybrid hierarchical** (Division > Category > Line Item, builder-defined)

**Configuration approach:**
- Cost codes are stored in a tree structure with unlimited nesting depth
- Each node has: code, name, description, parent_id, sort_order, is_active
- A tenant can start from a template (CSI, NAHB, or blank) and modify from there (GAP-032)
- Cost codes can be imported from CSV
- Inactive cost codes are hidden from new entries but preserved on historical data

**Mid-project changes (GAP-027):** When a builder restructures cost codes:
- Existing project data retains original code references (immutable snapshot)
- A mapping table records old_code -> new_code for reporting continuity
- New entries on existing projects use the new codes
- Builder is warned before restructuring and can preview impact

### 4. Phase Structure Configuration (GAP-018)

Each builder defines their own project phase structure:
- Ross Built: "Preconstruction, Foundation, Framing, MEP Rough, Insulation, Drywall, Finishes, Landscaping, Punch, Close"
- Another builder: "Design, Permits, Sitework, Shell, Interior, Final"

**Implementation:**
- Phases are an ordered list per tenant with: name, display_color, default_duration_days, sort_order
- Projects can override the tenant phase list (add/remove/rename phases for that project)
- Phases drive schedule templates, progress tracking, and draw request line items
- Phase templates can be cloned between tenants (GAP-032)

### 5. Terminology Engine (GAP-019)

A mapping table of platform terms to tenant-preferred terms:

| Platform Term (Key) | Ross Built | Builder B | Builder C |
|---|---|---|---|
| subcontractor | Trade Partner | Subcontractor | Vendor |
| change_order | Change Order | CO | Variation |
| punch_list | Punch List | Deficiency List | Snag List |
| draw_request | Draw Request | Payment Application | Progress Claim |
| daily_log | Daily Log | Field Report | Site Diary |

**Implementation:**
- `terminology_overrides` table: `(builder_id, term_key, display_value)`
- Client loads all overrides on login into a translation function `t(key)`
- Server uses overrides for generated documents and notifications
- Default terms used when no override exists
- ~50 configurable terms initially, expandable

### 6. Numbering Engine (GAP-021)

Configurable numbering patterns for all document types:

**Pattern syntax:** `{PREFIX}-{YEAR}-{PROJECT_CODE}-{SEQ:4}`

| Token | Description | Example |
|---|---|---|
| `{PREFIX}` | Fixed text | CO, INV, PO |
| `{YEAR}` | Current year (2 or 4 digit) | 2026, 26 |
| `{PROJECT_CODE}` | Project short code | AMI, OAK |
| `{SEQ:N}` | Auto-increment, zero-padded to N digits | 001, 0001 |
| `{MONTH}` | Current month | 02 |
| `{BUILDER_CODE}` | Tenant short code | RB |

**Examples:**
- Simple: `CO-{SEQ:3}` -> CO-001, CO-002
- Detailed: `{YEAR}-{PROJECT_CODE}-CO-{SEQ:4}` -> 2026-AMI-CO-0001
- Per-project sequences reset or continue globally (configurable)

**Sequence management:** Atomic counter per entity type per scope (global or per-project) stored in `numbering_sequences` table. Uses `SELECT ... FOR UPDATE` to prevent duplicates.

### 7. Custom Fields Engine (GAP-023, GAP-024)

Builders can add custom fields to any major entity without database migrations.

**Supported field types:**
- Text (single line, multi-line)
- Number (integer, decimal, currency)
- Date / DateTime
- Dropdown (single select, multi-select) (GAP-024)
- Checkbox / Toggle
- File attachment
- Lookup (reference to another entity)
- Calculated (formula based on other fields)

**Custom field definition:**
```json
{
  "entity_type": "project",
  "field_key": "lot_size_sqft",
  "label": "Lot Size (sq ft)",
  "field_type": "number",
  "required": false,
  "default_value": null,
  "validation": { "min": 0, "max": 1000000 },
  "show_on_list": true,
  "sort_order": 10,
  "conditional_visibility": null
}
```

**Storage:** Custom field values stored in a `custom_field_values` table using an EAV (Entity-Attribute-Value) pattern:
- `(id, builder_id, entity_type, entity_id, field_definition_id, value_text, value_number, value_date, value_json)`
- Indexed for efficient querying
- Reportable and filterable just like native fields

**Conditional logic (GAP-030):** Rules that show/hide/require fields based on other field values:
```json
{
  "field_key": "asbestos_survey_date",
  "visible_when": { "field": "project_type", "operator": "equals", "value": "renovation" },
  "required_when": { "field": "project_type", "operator": "equals", "value": "renovation" }
}
```

### 8. Required Fields Configuration (GAP-029)

Each tenant configures which fields are required on each entity type:
- Stored in `field_requirements` table: `(builder_id, entity_type, field_key, is_required, required_when_condition)`
- Applied during API validation (Zod schemas are dynamically extended with tenant requirements)
- Conditional requirements supported via the conditional logic engine (GAP-030)

### 9. Default Values (GAP-028)

Configurable default values per tenant:
- `(builder_id, entity_type, field_key, default_value, default_type)`
- `default_type`: 'static' (always 18%), 'formula' (project.total * 0.10), 'lookup' (from another field), 'current_user', 'current_date'
- Applied when creating new entities (client and server)
- Overridable per project

### 10. Feature Flags (GAP-003)

Tenant-level feature toggles tied to subscription plan:
- `(builder_id, feature_key, enabled, plan_required, override_reason)`
- Features: estimating, selections, warranty, client_portal, vendor_portal, api_access, custom_reports, sso, advanced_permissions
- Some features are plan-gated (cannot be enabled without upgrading)
- Some are admin-toggled (builder can enable/disable within their plan)
- Platform admin can override any flag (e.g., for beta testing)

### 11. Configuration Versioning (GAP-031)

Every configuration change is versioned:
- `config_versions` table stores snapshots of configuration state
- Each version has: timestamp, changed_by, change_description, diff_json
- Rollback restores a previous version's values
- Maximum 50 versions retained per config section (older versions archived)
- Critical for debugging when a builder says "something changed and now X is broken"

### 12. Configuration Templates (GAP-032, GAP-033)

**Industry templates** (GAP-033 -- out-of-the-box config):
- "Custom Home Builder - Standard" (Ross Built's config as the starting template)
- "Production Builder" (higher volume, simpler workflows)
- "Remodeler" (different phases, smaller scope)
- "Custom Home Builder - Luxury" (more detailed selections, higher approval thresholds)

**Template cloning (GAP-032):**
- Platform admin can promote any tenant's config to a template
- New tenants select a template during onboarding
- Templates include: cost codes, phases, workflows, terminology, numbering, default values, required fields, custom fields
- Templates do NOT include: actual project data, contacts, financials

### 13. Progressive Disclosure (GAP-034, GAP-035)

To avoid the "40 hours of setup" problem:
- **Quick Start Wizard** (5 minutes): Company name, logo, timezone, # of employees (determines recommended plan)
- **Guided Setup** (30-60 minutes): Cost codes (pick template or import), phases, key defaults (markup, retainage), invite first users
- **Advanced Configuration** (ongoing): Custom fields, workflow tweaks, conditional logic, numbering patterns
- Each configuration section shows "Recommended" defaults that work for most builders
- Configuration completeness score on the admin dashboard ("Your setup is 65% complete")
- "Configure as you go" -- most settings can be changed at any time

---

## Database Tables

```
-- Central configuration store
tenant_configs (
  id UUID PK,
  builder_id UUID FK -> builders,
  config_section VARCHAR,  -- 'general', 'workflows', 'numbering', 'defaults', etc.
  config_key VARCHAR,
  config_value JSONB,
  project_id UUID FK -> projects NULL,  -- NULL = company-level
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  updated_by UUID FK -> platform_users,
  UNIQUE(builder_id, config_section, config_key, project_id)
)

-- Workflow definitions
workflow_definitions (
  id UUID PK,
  builder_id UUID FK -> builders,
  entity_type VARCHAR,
  name VARCHAR,
  states JSONB,
  transitions JSONB,
  notifications JSONB,
  is_active BOOLEAN DEFAULT true,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(builder_id, entity_type, name)
)

-- Cost code tree
cost_codes (
  id UUID PK,
  builder_id UUID FK -> builders,
  parent_id UUID FK -> cost_codes NULL,
  code VARCHAR,
  name VARCHAR,
  description TEXT,
  sort_order INT,
  is_active BOOLEAN DEFAULT true,
  depth INT,  -- 0 = division, 1 = category, 2 = line item
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
)

-- Cost code remapping (GAP-027)
cost_code_mappings (
  id UUID PK,
  builder_id UUID FK -> builders,
  old_code_id UUID FK -> cost_codes,
  new_code_id UUID FK -> cost_codes,
  effective_date DATE,
  created_at TIMESTAMPTZ
)

-- Project phases template
phase_templates (
  id UUID PK,
  builder_id UUID FK -> builders,
  name VARCHAR,
  phases JSONB,  -- ordered array of { name, color, default_duration_days }
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Terminology overrides
terminology_overrides (
  id UUID PK,
  builder_id UUID FK -> builders,
  term_key VARCHAR,
  display_value VARCHAR,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(builder_id, term_key)
)

-- Numbering patterns
numbering_patterns (
  id UUID PK,
  builder_id UUID FK -> builders,
  entity_type VARCHAR,
  pattern VARCHAR,
  scope ENUM('global', 'per_project'),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(builder_id, entity_type)
)

-- Numbering sequence counters
numbering_sequences (
  id UUID PK,
  builder_id UUID FK -> builders,
  entity_type VARCHAR,
  project_id UUID FK -> projects NULL,  -- NULL for global scope
  current_value INT DEFAULT 0,
  UNIQUE(builder_id, entity_type, project_id)
)

-- Custom field definitions
custom_field_definitions (
  id UUID PK,
  builder_id UUID FK -> builders,
  entity_type VARCHAR,
  field_key VARCHAR,
  label VARCHAR,
  field_type VARCHAR,
  options JSONB,  -- for dropdowns: [{ value, label }]
  validation JSONB,
  default_value JSONB,
  is_required BOOLEAN DEFAULT false,
  conditional_visibility JSONB,
  conditional_required JSONB,
  show_on_list BOOLEAN DEFAULT false,
  show_on_detail BOOLEAN DEFAULT true,
  sort_order INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(builder_id, entity_type, field_key)
)

-- Custom field values (EAV)
custom_field_values (
  id UUID PK,
  builder_id UUID FK -> builders,
  entity_type VARCHAR,
  entity_id UUID,
  field_definition_id UUID FK -> custom_field_definitions,
  value_text TEXT,
  value_number NUMERIC,
  value_date TIMESTAMPTZ,
  value_json JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(entity_type, entity_id, field_definition_id)
)

-- Field requirement overrides
field_requirements (
  id UUID PK,
  builder_id UUID FK -> builders,
  entity_type VARCHAR,
  field_key VARCHAR,
  is_required BOOLEAN,
  required_when JSONB,  -- conditional requirement
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(builder_id, entity_type, field_key)
)

-- Feature flags
feature_flags (
  id UUID PK,
  builder_id UUID FK -> builders,
  feature_key VARCHAR,
  enabled BOOLEAN DEFAULT false,
  plan_required VARCHAR,
  override_reason TEXT,
  overridden_by UUID FK -> platform_users,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(builder_id, feature_key)
)

-- Configuration version history (GAP-031)
config_versions (
  id UUID PK,
  builder_id UUID FK -> builders,
  config_section VARCHAR,
  version_number INT,
  snapshot JSONB,  -- full config state at this version
  diff JSONB,  -- what changed from previous version
  changed_by UUID FK -> platform_users,
  change_description TEXT,
  created_at TIMESTAMPTZ
)

-- Configuration templates (GAP-032)
config_templates (
  id UUID PK,
  name VARCHAR,
  description TEXT,
  template_type VARCHAR,  -- 'custom_home', 'production', 'remodeler', 'luxury'
  config_snapshot JSONB,  -- full config set
  is_active BOOLEAN DEFAULT true,
  source_builder_id UUID FK -> builders NULL,  -- if promoted from a tenant
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- User-level preferences (Level 4)
user_preferences (
  id UUID PK,
  user_id UUID FK -> platform_users,
  builder_id UUID FK -> builders,
  preference_key VARCHAR,
  preference_value JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, builder_id, preference_key)
)
```

---

## API Endpoints

```
-- Configuration CRUD
GET    /api/v1/config/:section                  -- get all config for a section
GET    /api/v1/config/:section/:key             -- get specific config value
PUT    /api/v1/config/:section/:key             -- set config value
GET    /api/v1/config/resolved/:section/:key    -- get resolved value (with hierarchy)

-- Workflows (GAP-016, GAP-022)
GET    /api/v1/workflows                        -- list workflow definitions
GET    /api/v1/workflows/:entityType            -- get workflow for entity type
PUT    /api/v1/workflows/:entityType            -- update workflow definition
POST   /api/v1/workflows/:entityType/validate   -- validate workflow definition

-- Cost Codes (GAP-017)
GET    /api/v1/cost-codes                       -- get cost code tree
POST   /api/v1/cost-codes                       -- create cost code
PATCH  /api/v1/cost-codes/:id                   -- update cost code
DELETE /api/v1/cost-codes/:id                    -- deactivate cost code
POST   /api/v1/cost-codes/import                -- import from CSV
POST   /api/v1/cost-codes/remap                 -- create code mapping (GAP-027)

-- Phases (GAP-018)
GET    /api/v1/phase-templates                  -- list phase templates
POST   /api/v1/phase-templates                  -- create phase template
PUT    /api/v1/phase-templates/:id              -- update phase template

-- Terminology (GAP-019)
GET    /api/v1/terminology                      -- get all terminology overrides
PUT    /api/v1/terminology                      -- batch update terminology

-- Numbering (GAP-021)
GET    /api/v1/numbering                        -- get all numbering patterns
PUT    /api/v1/numbering/:entityType            -- set numbering pattern
POST   /api/v1/numbering/:entityType/preview    -- preview next number

-- Custom Fields (GAP-023, GAP-024)
GET    /api/v1/custom-fields/:entityType        -- list custom fields for entity
POST   /api/v1/custom-fields/:entityType        -- create custom field
PATCH  /api/v1/custom-fields/:id                -- update custom field
DELETE /api/v1/custom-fields/:id                 -- deactivate custom field

-- Field Requirements (GAP-029)
GET    /api/v1/field-requirements/:entityType   -- get requirements for entity
PUT    /api/v1/field-requirements/:entityType   -- batch update requirements

-- Feature Flags (GAP-003)
GET    /api/v1/features                         -- list feature flags
PATCH  /api/v1/features/:featureKey             -- toggle feature (admin only)

-- Configuration Versioning (GAP-031)
GET    /api/v1/config-versions/:section         -- list versions for section
POST   /api/v1/config-versions/:section/rollback/:versionId  -- rollback to version

-- Templates (GAP-032)
GET    /api/v1/config-templates                 -- list available templates
POST   /api/v1/config-templates/apply/:id       -- apply template to current tenant

-- User Preferences
GET    /api/v1/preferences                      -- get current user preferences
PUT    /api/v1/preferences/:key                 -- set preference
```

---

## Dependencies

- **Module 1: Auth & Access** -- tenant context required for all config reads/writes
- **Redis** -- configuration caching layer
- **PostgreSQL** -- all config persisted with RLS on `builder_id`

---

## Open Questions

1. **GAP-027 (Mid-project changes):** Should cost code remapping be automatic (system infers mappings) or manual (builder maps each old code to new code)? Recommend manual with suggestions.
2. **GAP-030 (Conditional logic):** How complex should conditional rules get? Simple field=value, or full boolean expressions with AND/OR/NOT? Recommend starting with simple conditions and expanding.
3. **GAP-025, GAP-026 (Custom reports/dashboards):** These are referenced here but will be fully spec'd in the Reporting module. Configuration Engine provides the storage and API; Reporting module provides the UI.
4. **GAP-034 (Complexity budget):** Should we enforce a maximum number of custom fields per entity type? (e.g., 50 max) This prevents performance issues and UI clutter.
5. **EAV performance:** Custom field values in EAV pattern can be slow for complex queries. Should we consider a hybrid approach with JSONB columns on core tables for frequently queried custom fields?
6. **GAP-020 (Document templates):** Template customization is deep -- HTML/CSS editor? Drag-and-drop builder? Merge field insertion? This likely needs its own sub-module. Defer detailed design to Document Management module spec.
