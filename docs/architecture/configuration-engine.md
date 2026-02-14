# Configuration Engine Design

## Gap Coverage Index

This document addresses the following gap analysis items:

| Section | Gap Items | Topic |
|---------|-----------|-------|
| 1: SaaS Architecture | GAP-016 through GAP-035 | Configuration & Customization Engine |
| 1: SaaS Architecture | GAP-036 through GAP-050 | Regional Variability (configuration aspects) |
| 6: Data Isolation & Privacy | GAP-155 through GAP-169 | Privacy-relevant configuration |
| 41: Multi-Entity & Scaling | GAP-574 through GAP-580 | Multi-entity configuration inheritance |
| 42: Geographic Variability | GAP-581 through GAP-590 | Regional configuration (detailed in Section 14) |
| 43: Regulatory, Tax & Insurance | GAP-547 through GAP-557 | Tax, payroll, insurance compliance (Section 15) |

Every gap item is referenced by its number (e.g., GAP-016) and given a decision, approach, or "DECISION NEEDED" designation. Items primarily addressed in `multi-tenancy-design.md` are cross-referenced rather than duplicated.

---

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

**GAP-016: How is the configuration UI designed?**

Settings are resolved through a five-level hierarchy. When a setting is requested, the engine walks from most-specific to least-specific and returns the first defined value:

```
Level 5 (most specific):  User Preferences
                             |
Level 4:                  Project Overrides
                             |
Level 3:                  Company Settings
                             |
Level 2:                  Parent Company Settings (multi-entity inheritance, GAP-006, GAP-574-580)
                             |
Level 1 (least specific): Platform Defaults
```

### 3.1 Level 1 -- Platform Defaults

Hardcoded in the application source as a frozen default configuration object. These are the values that apply when no company, project, or user override exists. They represent sensible defaults for a new builder who has not customized anything.

**Storage:** Application code constant (`server/config/platform-defaults.js`).

**GAP-033: Out-of-box configuration.** Platform defaults represent the "works on day 1" experience. A builder who signs up and creates a project without touching any settings gets these values. They are designed for a typical US custom home builder building 5-20 homes/year.

**GAP-034: Complexity budget.** The platform defaults mean that ZERO configuration is required for basic operation. Configuration is progressive: builders discover and adjust settings as they encounter values they want to change. The Settings UI is organized into levels (Basic, Advanced, Expert) so that small builders are not overwhelmed.

**Examples:**
- Default retainage percent: `10`
- Default date format: `MM/DD/YYYY`
- Default invoice approval required: `true`
- Default PO numbering format: `PO-{SEQUENCE}`
- Default cost code structure: CSI 16-division
- Default approval chain: owner-only (single step)
- Default terminology: canonical names (vendor, job, invoice, etc.)

### 3.2 Level 2 -- Parent Company Settings (GAP-006, GAP-574 through GAP-580)

For companies in a multi-entity hierarchy (see `multi-tenancy-design.md` Section 12), child entities inherit settings from their parent company. This allows a parent company to set standards that all divisions/subsidiaries/brands follow, while still allowing per-entity overrides.

**Storage:** Resolved dynamically by following the `parent_company_id` chain up to the top-level company.

**Inheritance rules:**
- A child company inherits all settings from its parent unless explicitly overridden.
- A parent company can mark specific settings as "locked" (not overridable by children). This supports the franchise model (GAP-579) where the franchisor controls branding and certain workflows.
- Inheritance depth is limited to 3 levels (parent -> child -> grandchild) to prevent complexity.

```typescript
// Configuration resolution with multi-entity hierarchy
function getConfig(key: string, context: ConfigContext): ConfigValue {
  // Level 5: User preferences
  if (context.userId) {
    const userPref = getUserPreference(context.userId, key);
    if (userPref !== undefined) return userPref;
  }

  // Level 4: Project overrides
  if (context.projectId) {
    const projectOverride = getProjectSetting(context.projectId, key);
    if (projectOverride !== undefined) return projectOverride;
  }

  // Level 3: Company settings
  const companySetting = getCompanySetting(context.companyId, key);
  if (companySetting !== undefined) return companySetting;

  // Level 2: Parent company settings (walk up hierarchy)
  let parentId = getParentCompanyId(context.companyId);
  while (parentId) {
    const parentSetting = getCompanySetting(parentId, key);
    if (parentSetting !== undefined) return parentSetting;
    parentId = getParentCompanyId(parentId);
  }

  // Level 1: Platform defaults
  return getPlatformDefault(key);
}
```

### 3.3 Level 3 -- Company Settings

Per-builder settings stored in the database. This is where the majority of configuration lives. Every builder can customize behavior for their entire organization without affecting any other tenant.

**Storage:** `companies.settings` JSONB column (existing) plus the `company_config` table for structured/typed settings (new, see Section 7).

### 3.4 Level 4 -- Project Overrides

Per-project overrides that differ from the company default. Not every setting is overridable at the project level -- only those that make sense (e.g., retainage percent, tax rate, approval thresholds, jurisdiction).

**Storage:** `jobs.settings` JSONB column (already exists in data-model.md as `settings JSONB DEFAULT '{}'`).

### 3.5 Level 5 -- User Preferences

Individual user presentation and notification preferences. These never affect business logic -- only how information is displayed and how the user is notified.

**Storage:** `users.preferences` JSONB column (already exists in data-model.md).

---

## 4. Complete List of Configurable Items

Derived from Blueprint Rule 1 and the full gap analysis. Items are grouped by domain. Each item references the gap analysis question it answers.

### 4.1 Cost Code Structures (GAP-017)

**GAP-017: Cost code structures vary wildly between builders. How do you handle custom cost code hierarchies?**

**Decision:** The `cost_codes` table already supports hierarchical codes via `parent_id`. The configuration engine adds:

| Setting | Type | Overridable At | Gap Ref | Status |
|---------|------|---------------|---------|--------|
| Cost code hierarchy format (flat, 2-level, 3-level) | enum | Company | GAP-017 | Designed (cost_codes table supports parent_id hierarchy) |
| Default code format (CSI `03-30-00` vs custom `100.10`) | string pattern | Company | GAP-017 | TODO: Validation pattern needs to be configurable |
| Default divisions/categories | seed data | Company | GAP-017 | Designed (is_default flag on cost_codes) |
| Category labels (labor, material, subcontractor, equipment, other) | string[] | Company | GAP-017 | TODO: Currently hardcoded as CHECK constraint |
| Allow cost codes per project vs company-wide only | boolean | Company | GAP-017 | TODO |

**Approach:** Builders choose from three starting points during onboarding:
1. **CSI MasterFormat** -- Standard 16/50-division format. Most common for larger builders.
2. **Simplified** -- A 20-category flat list designed for smaller builders. Easy to understand.
3. **Import** -- Upload their existing cost code structure from CSV/Excel.
4. **Blank** -- Start from scratch and build their own.

After initial setup, codes can be added, modified, renamed, or reorganized at any time. The system tracks which projects use which codes to prevent breaking deletions.

**GAP-027: Configuration changes mid-project (cost code restructuring).** When a builder restructures cost codes, existing projects retain their original mappings. A migration tool allows remapping: "Old Code 100.10 -> New Code 03-30-00." The migration creates a `cost_code_migrations` log so the change is auditable and reversible.

### 4.2 Approval Workflows (GAP-016, GAP-022)

**GAP-016: Every workflow must be configurable.**
**GAP-022: Approval workflows differ between builders.**

**Decision:** Approval workflows are fully configurable per company, per entity type. The default is single-step owner approval (simplest case). Builders can add steps, set thresholds, and define parallel vs. sequential approval.

| Setting | Type | Overridable At | Gap Ref | Status |
|---------|------|---------------|---------|--------|
| Invoice approval threshold | currency | Company, Project | GAP-022 | Designed |
| Invoice approval chain (roles in sequence) | ordered role[] | Company | GAP-022 | TODO |
| PO approval required above amount | currency | Company | GAP-022 | TODO |
| PO approval chain | ordered role[] | Company | GAP-022 | TODO |
| Change order approval chain | ordered role[] | Company | GAP-022 | TODO |
| Change order client approval required | boolean | Company | GAP-022 | TODO |
| Draw approval chain | ordered role[] | Company | GAP-022 | TODO |
| Estimate approval before sending | boolean | Company | GAP-022 | TODO |
| Auto-approve invoices below amount | currency | Company | GAP-022 | TODO |
| Require lien waiver before payment | boolean | Company, Project | GAP-037 | Designed |

See Section 9 for the workflow engine design that executes these configurations.

### 4.3 Required Fields (GAP-029)

**GAP-029: Can tenants configure required fields?**

**Decision:** Yes. Per-entity required field configuration is stored in `company_config`.

| Setting | Type | Overridable At | Gap Ref | Status |
|---------|------|---------------|---------|--------|
| Required fields per entity | field_name[] per entity | Company | GAP-029 | TODO |
| Required photos on daily log submission | boolean | Company | GAP-029 | TODO |
| Required weather on daily log | boolean | Company | GAP-029 | TODO |
| Cost code required on invoice allocation | boolean | Company | GAP-029 | TODO |
| PO required before invoice can be approved | boolean | Company | GAP-029 | TODO |

**Implementation:** Each entity type has a `required_fields` configuration in `company_config`:

```json
{
  "config_domain": "required_fields",
  "config_key": "daily_log",
  "config_value": {
    "standard_fields": {
      "weather": true,
      "temperature": false,
      "photos": true,
      "min_photos": 1,
      "crew_count": true,
      "summary": true
    },
    "custom_fields": ["lot_number"]  // References custom field definitions
  }
}
```

The form rendering engine reads this configuration and marks fields as required accordingly. The API validates required fields before accepting submissions.

### 4.4 Terminology (GAP-019)

**GAP-019: Can terminology be customized per tenant?**

**Decision:** Yes. Terminology customization is a first-class feature.

| Setting | Type | Overridable At | Gap Ref | Status |
|---------|------|---------------|---------|--------|
| "Vendor" vs "Subcontractor" vs "Trade Partner" | string | Company | GAP-019 | TODO |
| "Job" vs "Project" | string | Company | GAP-019 | TODO |
| "Invoice" vs "Bill" | string | Company | GAP-019 | TODO |
| "Draw" vs "Pay Application" vs "Progress Billing" | string | Company | GAP-019 | TODO |
| "Daily Log" vs "Field Report" vs "Daily Report" | string | Company | GAP-019 | TODO |
| "Change Order" vs "Variation" vs "Modification" | string | Company | GAP-019 | TODO |
| "Punch List" vs "Deficiency List" vs "Snag List" | string | Company | GAP-019 | TODO |

**Implementation approach:** A `terminology` object in company settings maps canonical keys to display strings. The UI reads these at render time. Platform defaults use the canonical names. API always uses canonical names (terminology is UI-only, not API-level).

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

The frontend wraps all entity labels in a `t(key)` function:

```typescript
// client/src/lib/terminology.ts
export function t(key: string): string {
  const overrides = useConfig().terminology || {};
  return overrides[key] || CANONICAL_NAMES[key] || key;
}

// Usage in components
<h1>{t('vendor')} List</h1>  // Renders "Trade Partner List" if configured
```

### 4.5 Job Phases (GAP-018)

**GAP-018: Job phases and naming conventions differ. How do you let each builder define their own phase structure?**

**Decision:** Fully configurable per company. The default phase structure is provided by platform defaults, but builders can rename, reorder, add, or remove phases.

| Setting | Type | Overridable At | Gap Ref | Status |
|---------|------|---------------|---------|--------|
| Project phases (names and order) | ordered string[] | Company | GAP-018 | TODO |
| Phase transition rules | state machine | Company | GAP-018 | TODO |
| Default phase for new projects | string | Company | GAP-018 | Designed |

**Default phases (platform defaults):**
1. Pre-Construction
2. Permitting
3. Foundation
4. Framing
5. Rough-In
6. Exterior
7. Interior
8. Finishes
9. Punch List
10. Close-Out

**Implementation:** Currently hardcoded as a CHECK constraint on `jobs.status`. This will be migrated to a configurable status workflow (see Section 9.3).

### 4.6 Document Templates (GAP-020)

**GAP-020: Document templates must be fully customizable per tenant.**

**Decision:** Yes. Every document the system generates (proposals, contracts, change orders, draw requests, daily log reports, client updates) uses a template that can be customized per company.

| Setting | Type | Overridable At | Gap Ref | Status |
|---------|------|---------------|---------|--------|
| Proposal template(s) | HTML/template | Company | GAP-020 | TODO |
| Contract template(s) with clause library | HTML/template | Company | GAP-020 | TODO |
| Purchase order template | HTML/template | Company | GAP-020 | TODO |
| Change order template | HTML/template | Company | GAP-020 | TODO |
| Draw request / G702 template | HTML/template | Company | GAP-020 | TODO |
| Daily log report template | HTML/template | Company | GAP-020 | TODO |
| Client update email template | HTML/template | Company | GAP-020 | TODO |
| Company logo for generated documents | image URL | Company | GAP-020 | Designed |
| Company color for branding | hex color | Company | GAP-020 | Designed |

See Section 7.3 for the `document_templates` table design.

### 4.7 Numbering Formats (GAP-021)

**GAP-021: Configurable numbering schemes.**

**Decision:** Yes. Every entity with a number has a configurable format.

| Setting | Type | Overridable At | Gap Ref | Status |
|---------|------|---------------|---------|--------|
| Job number format | template string | Company | GAP-021 | TODO |
| Invoice number format | template string | Company | GAP-021 | TODO |
| PO number format | template string | Company | GAP-021 | TODO |
| Change order number format | template string | Company | GAP-021 | TODO |
| Draw number format | template string | Company | GAP-021 | TODO |
| Estimate number format | template string | Company | GAP-021 | TODO |
| RFI number format | template string | Company | GAP-021 | TODO |
| Submittal number format | template string | Company | GAP-021 | TODO |
| Sequence reset frequency | enum | Company | GAP-021 | TODO |
| Starting sequence number | integer | Company | GAP-021 | TODO |

See Section 10 for the numbering engine design.

### 4.8 Custom Fields (GAP-023, GAP-024)

**GAP-023: What custom fields can tenants create?**
**GAP-024: Can tenants create custom dropdown values?**

**Decision:** Yes. Tenants can create custom fields on any major entity (jobs, vendors, clients, invoices, purchase orders, change orders, estimates, daily logs, tasks, punch items). Custom fields support: text, number, currency, date, boolean, single-select dropdown, multi-select dropdown, email, phone, URL, and textarea types.

Custom dropdown values are fully tenant-controlled. The `custom_field_definitions` table (see Section 8.2) stores the `options` array for select and multi-select fields.

See Section 8 for the full custom fields design.

### 4.9 Custom Reports and Dashboards (GAP-025, GAP-026)

**GAP-025: Can tenants create custom report templates?**

**Decision:** Phased approach:
- **Phase 1 (launch):** Platform provides a library of pre-built reports. Builders cannot create fully custom report templates but can configure parameters (date range, project filter, grouping, etc.) and save report configurations.
- **Phase 2 (post-launch):** Report builder UI allowing drag-and-drop report creation from available data fields.

**GAP-026: Can tenants configure their own dashboard layouts?**

**Decision:** Yes. Dashboard widgets are configurable per user (Level 5) with company-level defaults per role (Level 3).

| Setting | Type | Overridable At | Gap Ref | Status |
|---------|------|---------------|---------|--------|
| Dashboard layout / widget arrangement | widget config[] | User | GAP-026 | TODO |
| Default dashboard for each role | widget config[] | Company | GAP-026 | TODO |
| Available widget types | enum[] | Platform | GAP-026 | TODO |
| Widget refresh interval | seconds | Company | GAP-026 | TODO |

### 4.10 Default Values (GAP-028)

**GAP-028: Can tenants set default values per field?**

**Decision:** Yes. Default values are configurable at the company level and (for some fields) the project level.

| Setting | Type | Overridable At | Gap Ref | Status |
|---------|------|---------------|---------|--------|
| Default markup type (percent vs fixed) | enum | Company | GAP-028 | Designed |
| Default markup percentage | decimal | Company | GAP-028 | Designed |
| Default retainage percent | decimal | Company, Project | GAP-028 | Designed |
| Default tax rate | decimal | Company, Project | GAP-036 | TODO |
| Default contingency percent | decimal | Company | GAP-028 | Designed |
| Overhead percentage | decimal | Company | GAP-028 | TODO |
| Markup applies to labor | boolean | Company | GAP-028 | TODO |
| Markup applies to materials | boolean | Company | GAP-028 | TODO |
| Markup applies to subcontractor costs | boolean | Company | GAP-028 | TODO |
| Cost-plus fee structure | enum | Company, Project | GAP-028 | Partially designed |

**Implementation:** Default values are stored in `companies.settings` under domain-specific keys:

```json
{
  "defaults": {
    "markup_type": "percent",
    "markup_value": 18,
    "retainage_percent": 10,
    "contingency_percent": 5,
    "overhead_percent": 8,
    "markup_applies_to": {
      "labor": true,
      "materials": true,
      "subcontractor": false,
      "equipment": true
    }
  }
}
```

### 4.11 Conditional Logic (GAP-030)

**GAP-030: Can tenants create conditional logic? ("If project type = renovation, require asbestos survey field")**

**Decision:** Limited conditional logic is supported through a rules engine in `company_config`. Full BPM-style rules are out of scope for v1.

**Phase 1 (launch):** Condition types supported:
- **Field visibility rules:** "Show field X when field Y has value Z."
- **Required field rules:** "Require field X when field Y has value Z."
- **Default value rules:** "Set field X default to Z when field Y has value W."

```json
{
  "config_domain": "conditional_rules",
  "config_key": "job",
  "config_value": {
    "rules": [
      {
        "id": "renovation-asbestos",
        "condition": { "field": "project_type", "operator": "equals", "value": "renovation" },
        "action": { "type": "require_field", "target_field": "asbestos_survey", "value": true }
      },
      {
        "id": "commercial-bond",
        "condition": { "field": "project_type", "operator": "equals", "value": "commercial" },
        "action": { "type": "show_field", "target_field": "bond_number", "value": true }
      }
    ]
  }
}
```

**Phase 2 (post-launch):** Visual rules builder UI with more operators (greater than, less than, contains, in list) and multiple conditions (AND/OR).

### 4.12 Configuration Versioning (GAP-031)

**GAP-031: How do you handle configuration versioning?**

**Decision:** All configuration changes are versioned in an audit trail.

```sql
CREATE TABLE config_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- What changed
  config_domain TEXT NOT NULL,
  config_key TEXT NOT NULL,
  previous_value JSONB,
  new_value JSONB,

  -- Who changed it
  changed_by UUID NOT NULL REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Rollback support
  is_rolled_back BOOLEAN DEFAULT false,
  rolled_back_at TIMESTAMPTZ,
  rolled_back_by UUID REFERENCES users(id)
);

CREATE INDEX idx_config_audit_company ON config_audit_log(company_id);
CREATE INDEX idx_config_audit_domain ON config_audit_log(company_id, config_domain, config_key);
```

**Rollback behavior:**
- Owners/admins can view the configuration change history for any domain.
- Any change can be rolled back to a previous version with one click.
- Rollback creates a new audit entry (it is itself a configuration change), so the audit trail is always append-only.
- Active entities in mid-workflow (e.g., an invoice mid-approval when the approval chain is changed) continue using the workflow configuration that was in effect when the workflow started. New entities use the updated configuration.

### 4.13 Configuration Templates (GAP-032)

**GAP-032: Can tenants clone another tenant's configuration as a starting template?**

**Decision:** Not directly (tenant isolation prevents one tenant from seeing another's configuration). Instead:

1. **Platform-provided templates:** The platform offers curated configuration templates for common builder types:
   - "Small Custom Builder (1-5 homes/year)" -- Simplified settings, single-step approval.
   - "Mid-Size Custom Builder (5-20 homes/year)" -- Standard settings, multi-step approval.
   - "Large Production Builder (20+ homes/year)" -- Complex settings, division support.
   - "Remodeler" -- Renovation-focused settings, different phase structure.

2. **Self-service template cloning:** A builder can export their own configuration as a template and import it into another company they own (useful for multi-entity setups, GAP-574).

3. **Industry best practice templates** curated by the platform team based on anonymized usage patterns across tenants.

### 4.14 Configuration Self-Service (GAP-035)

**GAP-035: Can configuration be done by the builder, or does it require your team?**

**Decision:** All configuration is self-service. The Settings UI is designed for non-technical users (builders, office managers).

**Self-service design principles:**
- **Progressive disclosure:** Settings are organized into Basic, Advanced, and Expert levels. New builders only see Basic settings.
- **Contextual help:** Every setting has a "?" tooltip explaining what it does and when to change it.
- **Preview:** Where possible, show a preview of the effect (e.g., "Your PO numbers will look like: PO-2026-0001").
- **Undo:** Every change can be reverted (see GAP-031).
- **Guided setup:** For complex configurations (approval workflows), provide a wizard rather than a raw form.
- **Sensible defaults:** Every setting has a default that works. Configuration is always optional.

**Managed setup option (paid):** For builders who want help, offer a "Concierge Setup" service where the platform team configures the account based on a questionnaire. This is a professional services offering, not a product feature.

### 4.15 Tax Rates (GAP-036, GAP-049)

**GAP-036: Tax rules vary by state, county, and municipality.**
**GAP-049: Sales tax rules for construction vary by state.**

(Primary documentation in `multi-tenancy-design.md` Section 19.2)

| Setting | Type | Overridable At | Gap Ref | Status |
|---------|------|---------------|---------|--------|
| Default sales tax rate | decimal | Company, Project | GAP-036 | TODO |
| Tax rate by jurisdiction/county | map | Company | GAP-036 | TODO |
| Tax applies to labor | boolean | Company | GAP-049 | TODO |
| Tax applies to materials | boolean | Company | GAP-049 | TODO |
| Tax applies to equipment | boolean | Company | GAP-049 | TODO |

**Implementation:** Tax configuration is resolved from the jurisdiction database first, then company overrides, then project overrides. The `jurisdictions` table (defined in `multi-tenancy-design.md` Section 19.1) provides base rates. Builders can override rates for their own jurisdictions.

### 4.16 Lien Waiver Forms (GAP-037, GAP-050)

**GAP-037: Lien law varies by state.**
**GAP-050: Mechanic's lien procedures and statutory forms vary by state.**

(Primary documentation in `multi-tenancy-design.md` Section 19.3)

| Setting | Type | Overridable At | Gap Ref | Status |
|---------|------|---------------|---------|--------|
| State for lien waiver forms | state code | Company, Project | GAP-037 | TODO |
| Lien waiver form templates by state | file references | Platform, Company | GAP-037 | TODO |
| Conditional vs unconditional threshold | currency | Company | GAP-037 | TODO |
| Auto-request lien waiver on payment | boolean | Company | GAP-037 | TODO |
| Lien waiver required before draw inclusion | boolean | Company | GAP-037 | Partially designed |

### 4.17 Notification Triggers

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| Notify PM when invoice assigned | boolean | Company, User | Partially designed |
| Notify owner when invoice exceeds threshold | boolean | Company | TODO |
| Notify vendor when PO sent | boolean | Company | TODO |
| Notify client when draw submitted | boolean | Company | TODO |
| Notify team when daily log submitted | boolean | Company | TODO |
| Notify PM when task overdue | boolean | Company | TODO |
| Notify on insurance/license expiration (days before) | integer | Company | TODO |
| Notification channels per event (email, push, in-app) | channel[] per event | Company, User | Partially designed |
| Daily digest vs real-time notifications | enum | User | TODO |

### 4.18 Portal Content and Access

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| Client portal enabled | boolean | Company | Designed |
| Portal shows budget details | boolean | Company, Project | TODO |
| Portal shows schedule | boolean | Company, Project | TODO |
| Portal shows daily logs | boolean | Company, Project | TODO |
| Portal shows photos | boolean | Company, Project | Designed |
| Portal shows invoices/financial detail | boolean | Company, Project | TODO |
| Portal allows selection approval | boolean | Company | TODO |
| Portal allows change order approval | boolean | Company | TODO |
| Portal allows draw approval | boolean | Company | TODO |
| Portal allows messaging | boolean | Company | TODO |
| Portal branding (logo, colors, custom domain) | mixed | Company | Partially designed |
| Vendor portal enabled | boolean | Company | TODO |
| Vendor portal access levels | config object | Company | TODO |

### 4.19 Report Templates

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| Available report types | enum[] | Platform, Company | TODO |
| Report scheduling (daily, weekly, monthly) | cron-like | Company | TODO |
| Report recipients | user/email[] per report | Company | TODO |
| Report branding | template config | Company | TODO |
| Custom report definitions | report config | Company | TODO |

### 4.20 Status Labels and Workflows

| Setting | Type | Overridable At | Status |
|---------|------|---------------|--------|
| Invoice statuses (names, colors, order) | status config[] | Company | TODO |
| PO statuses | status config[] | Company | TODO |
| Task statuses | status config[] | Company | TODO |
| Lead pipeline stages | status config[] | Company | TODO |
| Change order statuses | status config[] | Company | TODO |
| Status transition rules per entity | state machine | Company | TODO |

See Section 9.3 for the status machine executor design.

### 4.21 Regional Configuration Items (GAP-038 through GAP-050, GAP-581 through GAP-590)

Regional settings are configurable per jurisdiction and per project. The platform provides baseline values from the `jurisdictions` table; builders override as needed.

| Setting | Gap Ref | Jurisdiction Table Field | Company Override? | Project Override? |
|---------|---------|------------------------|-------------------|-------------------|
| Building code edition | GAP-038, GAP-581 | `building_code_edition` | No (factual) | Yes (note) |
| Energy code / climate zone | GAP-588 | `energy_code`, `climate_zone` | No (factual) | Yes (note) |
| Seismic design category | GAP-590 | `seismic_design_category` | No (factual) | No |
| Wildfire zone classification | GAP-589 | `wildfire_risk_zone` | No (factual) | Yes |
| Permit process type | GAP-039, GAP-582 | `permit_submission_type` | Yes | Yes |
| Insurance minimums | GAP-040 | `min_gl_coverage`, etc. | Yes (stricter only) | No |
| Contract law / state clauses | GAP-041 | N/A (clause library) | Yes | Yes |
| Weather / climate data | GAP-042, GAP-583 | Via weather API | No | No |
| Material pricing region | GAP-043, GAP-584 | Via benchmarks | No | No |
| Labor rate region | GAP-044, GAP-585 | `labor_shortage_index` | No | No |
| Local holidays | GAP-045 | `local_holidays` | Yes (add more) | No |
| Work hour restrictions | GAP-046 | `construction_start_hour`, etc. | Yes | Yes |
| Environmental regulations | GAP-047 | `environmental_regulations` | Yes (add notes) | Yes |
| Licensing requirements | GAP-048 | `license_types` | No (factual) | No |
| Foundation types | GAP-587 | `common_foundation_types` | Yes | Yes |
| Natural disaster risk | GAP-586 | Multiple fields | No (factual) | No |

**Design principle for regional data:** Platform-maintained factual data (building codes, seismic zones) is not overridable by tenants -- it is reference data. Configuration that depends on builder preference within a jurisdiction (permit workflow, insurance above minimums, work hours) is overridable.

---

## 5. Configuration Engine Runtime Behavior

### 5.1 Fetching a Setting

When any part of the application needs a configuration value, it calls the configuration engine with a key and optional context:

```typescript
interface ConfigContext {
  companyId: string;
  projectId?: string;
  userId?: string;
}

function getConfig(key: string, context: ConfigContext): ConfigValue {
  // Level 5: User preferences (display/notification only)
  if (context.userId) {
    const userPref = getUserPreference(context.userId, key);
    if (userPref !== undefined) return userPref;
  }

  // Level 4: Project overrides
  if (context.projectId) {
    const projectOverride = getProjectSetting(context.projectId, key);
    if (projectOverride !== undefined) return projectOverride;
  }

  // Level 3: Company settings
  const companySetting = getCompanySetting(context.companyId, key);
  if (companySetting !== undefined) return companySetting;

  // Level 2: Parent company settings (multi-entity hierarchy)
  let parentId = getParentCompanyId(context.companyId);
  while (parentId) {
    const parentSetting = getCompanySetting(parentId, key);
    if (parentSetting !== undefined) return parentSetting;
    parentId = getParentCompanyId(parentId);
  }

  // Level 1: Platform defaults
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
6. **Parent company settings** are cached independently (same TTL). Cache invalidation on parent propagates to all children.

**Cross-process cache invalidation:** Use Supabase Realtime (already in the stack) to broadcast cache invalidation events when settings change. Each server process listens for `company_config` table changes and invalidates its local cache for the affected `company_id`.

### 5.3 Client-Side Access

The frontend needs access to configuration values to render correctly (terminology, required fields, available statuses, etc.). The approach:

1. On login, the API returns a `config` payload with the resolved company settings merged with platform defaults (hierarchy already resolved server-side).
2. This is stored in React context (`ConfigProvider`) and accessible via a `useConfig(key)` hook.
3. Project-specific overrides are fetched when a project is loaded and merged into the context for that project's scope.
4. User preferences are part of the auth context (already loaded at login).

```typescript
// client/src/lib/config.ts
const { config } = useConfig();
const vendorLabel = config.terminology?.vendor || 'Vendor';
const requireLienWaiver = config.lien_waiver_required ?? true;
```

### 5.4 Settings Validation

All configuration values must be validated before persistence. The engine uses Zod schemas to validate each setting key:

```typescript
const settingsSchema = z.object({
  invoice_approval_threshold: z.number().positive().optional(),
  retainage_default_percent: z.number().min(0).max(100).optional(),
  timezone: z.string().optional(),
  date_format: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).optional(),
  currency: z.enum(['USD', 'CAD']).optional(),
  terminology: z.record(z.string()).optional(),
  defaults: z.object({
    markup_type: z.enum(['percent', 'fixed']).optional(),
    markup_value: z.number().min(0).optional(),
    retainage_percent: z.number().min(0).max(100).optional(),
    // ... all other default value keys
  }).optional(),
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
| `GET /api/settings/schema` | GET | Get the settings schema (for dynamic form generation in the UI) |
| `GET /api/settings/audit-log` | GET | Get configuration change history (GAP-031) |
| `POST /api/settings/rollback/:auditLogId` | POST | Rollback a configuration change (GAP-031) |
| `GET /api/settings/templates` | GET | List available configuration templates (GAP-032) |
| `POST /api/settings/apply-template/:templateId` | POST | Apply a configuration template (GAP-032) |
| `POST /api/settings/export` | POST | Export company configuration as template (GAP-032) |
| `GET /api/jobs/:id/settings` | GET | Get project-level overrides |
| `PATCH /api/jobs/:id/settings` | PATCH | Update project-level overrides |
| `PATCH /api/users/me/preferences` | PATCH | Update user preferences |

### 6.2 Settings UI

**GAP-016: How is the configuration UI designed?**

The Settings page (`/settings/company`) organizes settings into tabs/sections that mirror the domains in Section 4. Settings are presented in three tiers:

**Basic Settings (visible by default):**
- General (company name, timezone, date format, currency, fiscal year)
- Branding (logo, colors)
- Terminology (rename entities)

**Advanced Settings (expanded on request):**
- Financial (approval thresholds, retainage, tax rates, markup defaults)
- Numbering (format patterns for jobs, POs, COs, etc.)
- Notifications (triggers and channels)
- Portal (client and vendor portal settings)
- Lien Waivers (state, forms, thresholds)
- Required Fields (per entity type)

**Expert Settings (expanded on request, with "Are you sure?" confirmation):**
- Workflows (approval chains, status sequences, transition rules)
- Custom Fields Management
- Document Templates
- Conditional Rules (GAP-030)
- Integration Settings

Each settings section includes:
- Current value vs. platform default indicator
- "Reset to default" button per field
- Preview of the effect where applicable
- Help text explaining the setting
- Link to relevant documentation

---

## 7. Database Schema for Settings Storage

### 7.1 Existing Tables (Already in Data Model)

```sql
-- companies.settings -- company-wide configuration (Level 3)
-- Already defined in data-model.md

-- jobs.settings -- project-level overrides (Level 4)
-- Already defined: settings JSONB DEFAULT '{}'

-- users.preferences -- user display/notification preferences (Level 5)
-- Already defined with default notification and theme values
```

### 7.2 New: Structured Configuration Table

For configuration that benefits from structured storage, queryability, and audit history:

```sql
CREATE TABLE company_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Configuration identity
  config_domain TEXT NOT NULL,         -- 'approval_workflow', 'status_workflow',
                                       -- 'numbering', 'notification_rules',
                                       -- 'required_fields', 'conditional_rules',
                                       -- 'portal', 'inspections', 'permits'
  config_key TEXT NOT NULL,            -- 'invoice_approval_chain', 'po_statuses', etc.

  -- Value
  config_value JSONB NOT NULL,         -- The configuration payload

  -- Locking (for multi-entity inheritance, GAP-579)
  is_locked BOOLEAN DEFAULT false,     -- If true, child entities cannot override
  locked_by_company_id UUID REFERENCES companies(id),  -- Which parent locked it

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
// Approval workflow for invoices (GAP-022)
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

// Status workflow for invoices (Section 9.3)
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

// Numbering format for POs (GAP-021)
{
  "config_domain": "numbering",
  "config_key": "purchase_order",
  "config_value": {
    "format": "PO-{YEAR}-{SEQUENCE:4}",
    "reset_annually": true,
    "next_sequence": 1
  }
}

// Required fields for daily logs (GAP-029)
{
  "config_domain": "required_fields",
  "config_key": "daily_log",
  "config_value": {
    "standard_fields": {
      "weather": true,
      "temperature": false,
      "photos": true,
      "min_photos": 1,
      "crew_count": true,
      "summary": true
    },
    "custom_fields": ["lot_number"]
  }
}

// Conditional rules for jobs (GAP-030)
{
  "config_domain": "conditional_rules",
  "config_key": "job",
  "config_value": {
    "rules": [
      {
        "id": "renovation-asbestos",
        "condition": { "field": "project_type", "operator": "equals", "value": "renovation" },
        "action": { "type": "require_field", "target_field": "asbestos_survey", "value": true }
      }
    ]
  }
}
```

### 7.3 New: Document Templates Table (GAP-020)

```sql
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

  -- Jurisdiction (for state-specific templates, GAP-041)
  jurisdiction_state TEXT,              -- NULL = all states

  -- Template content
  content_html TEXT NOT NULL,           -- HTML template with Handlebars placeholders
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
CREATE INDEX idx_doc_templates_jurisdiction ON document_templates(jurisdiction_state);
```

### 7.4 Terminology Overrides (GAP-019)

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

## 8. Custom Fields (GAP-023, GAP-024)

Builders need the ability to add their own fields to standard forms without code changes. This is a high-value feature for configuration-over-code.

### 8.1 Use Cases

- A builder wants to track "Lot Number" on every job.
- A builder wants a "Payment Method" dropdown on invoices with company-specific options.
- A builder wants to capture "Crew Size" on daily logs as a required numeric field.
- A builder wants "Warranty Type" on vendors (e.g., "1-year", "2-year", "lifetime").

### 8.2 Custom Field Definitions Table

```sql
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
  field_type TEXT NOT NULL
    CHECK (field_type IN (
      'text', 'number', 'currency',
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

  -- Options (for select / multi_select) (GAP-024)
  options JSONB,                        -- e.g., ["1-year", "2-year", "lifetime"]

  -- Display
  placeholder TEXT,
  help_text TEXT,
  section TEXT,                         -- Which form section to display in
  sort_order INTEGER DEFAULT 0,
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

The general approach:
1. When a form loads, fetch the custom field definitions for that entity type.
2. Render the custom fields in the appropriate form section, sorted by `sort_order`.
3. Apply validation rules from the field definition (required, min/max, pattern).
4. On save, submit custom field values alongside standard entity data.
5. In list views, custom fields marked `show_in_list` appear as additional columns.
6. In portal views, custom fields marked `show_in_portal` are visible.

---

## 9. Workflow Engine (Approval Chains and Status Machines)

### 9.1 Overview

Several configurable items in Section 4 involve workflow behavior:
- Approval chains (who must approve in what order) -- GAP-016, GAP-022
- Status transitions (which statuses can follow which) -- GAP-018
- Notification triggers (what events fire notifications to whom)
- Conditional logic (what rules apply based on field values) -- GAP-030

These are driven by configuration stored in `company_config`, not by code branching on hardcoded status values.

### 9.2 Approval Chain Execution (GAP-022)

**Approach:**

1. When an entity enters an approval state (e.g., invoice moves to `pm_pending`), the engine reads the approval chain configuration for that entity type from `company_config` (`config_domain = 'approval_workflow'`).
2. The engine determines the current step based on the entity's state and finds the next required approver role.
3. If the entity's amount is below a step's threshold, that step is skipped.
4. The engine creates a notification for the appropriate user(s) with that role.
5. When all steps are complete, the entity transitions to `approved`.

**Edge cases:**
- **No user with the required role:** Skip the step and log a warning. The company admin should be notified that a workflow step has no assignable user.
- **Chain modified mid-approval (GAP-027, GAP-031):** Entities already in a workflow continue using the chain configuration that was active when the workflow started. This is enforced by snapshotting the workflow configuration into the entity's approval record when the workflow begins.
- **Parallel approval:** Multiple roles can be configured to approve at the same step (e.g., PM AND accountant must both approve). The step completes when all required roles have approved.

```sql
-- Track approval progress per entity
CREATE TABLE approval_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Snapshot of the workflow config when approval started
  workflow_snapshot JSONB NOT NULL,

  -- Current state
  current_step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'approved', 'rejected', 'cancelled')),

  -- History
  approvals JSONB DEFAULT '[]',        -- Array of { step, role, user_id, action, timestamp, notes }

  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  UNIQUE(entity_type, entity_id)
);
```

### 9.3 Status Machine Executor (GAP-018)

**Approach:**

1. Status workflows are defined as state machines in `company_config` (`config_domain = 'status_workflow'`).
2. Before any status transition, the engine checks the `transitions` map to verify the transition is valid.
3. Invalid transitions are rejected with a clear error: "Cannot transition {entity_type} from '{current_status}' to '{requested_status}'."
4. Each transition can optionally trigger side effects (notifications, field requirements, etc.) -- also configurable.

**Implementation plan:**
- **Phase C (from migration path):** Relax or remove CHECK constraints on status columns, replacing them with application-level validation against the configurable status workflows.
- The `status_workflow` configuration includes the list of valid statuses, their display labels, colors, and allowed transitions.
- The engine validates transitions server-side. The client uses the same configuration to show only valid next-status options in the UI.

### 9.4 Conditional Rules Executor (GAP-030)

The conditional rules engine evaluates rules defined in `company_config` (`config_domain = 'conditional_rules'`) when:
1. A form is rendered (client-side: determine field visibility and requirements).
2. An entity is saved (server-side: validate that conditionally required fields are present).

**Supported operators (Phase 1):**
- `equals`, `not_equals`
- `in` (value is one of a list)
- `is_empty`, `is_not_empty`

**Supported actions (Phase 1):**
- `require_field` -- Make a field required
- `show_field` -- Make a field visible
- `hide_field` -- Hide a field
- `set_default` -- Set a default value

---

## 10. Numbering Engine (GAP-021)

### 10.1 Overview

Every entity with a number (jobs, POs, COs, invoices, estimates, RFIs, submittals, draws) needs a configurable numbering format. The format is a template string with tokens:

| Token | Meaning | Example |
|-------|---------|---------|
| `{YEAR}` | Current 4-digit year | `2026` |
| `{YY}` | Current 2-digit year | `26` |
| `{SEQUENCE}` | Auto-incrementing number | `1`, `2`, `3` |
| `{SEQUENCE:N}` | Zero-padded to N digits | `001`, `002` |
| `{JOB}` | Job number | `2026-015` |
| `{PREFIX}` | Company-configured prefix | `PRJ`, `BC` |
| `{MONTH}` | Current 2-digit month | `02` |

**Example formats:**
- `PO-{SEQUENCE:4}` -> `PO-0001`
- `{YEAR}-{PREFIX}-CO-{SEQUENCE:3}` -> `2026-PRJ-CO-001`
- `{JOB}-INV-{SEQUENCE}` -> `2026-015-INV-1`

### 10.2 Sequence Tracking

```sql
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

### 10.3 Thread-Safe Sequence Increment

Sequence generation must be atomic to prevent duplicate numbers under concurrent access:

```sql
-- Atomic increment and return
CREATE OR REPLACE FUNCTION next_sequence(
  p_company_id UUID,
  p_entity_type TEXT,
  p_scope_id UUID DEFAULT NULL,
  p_period TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_next INTEGER;
BEGIN
  INSERT INTO number_sequences (company_id, entity_type, scope_id, period, current_value)
  VALUES (p_company_id, p_entity_type, p_scope_id, p_period, 1)
  ON CONFLICT (company_id, entity_type, scope_id, period)
  DO UPDATE SET current_value = number_sequences.current_value + 1
  RETURNING current_value INTO v_next;

  RETURN v_next;
END;
$$ LANGUAGE plpgsql;
```

This uses PostgreSQL's `INSERT ... ON CONFLICT ... DO UPDATE ... RETURNING` which is atomic and handles concurrent access without advisory locks.

---

## 11. Multi-Entity Configuration Inheritance (GAP-574 through GAP-580)

Multi-entity hierarchy is documented in `multi-tenancy-design.md` Section 12. This section covers the configuration-specific aspects.

### 11.1 Inheritance Behavior

When a child entity (division, subsidiary, brand, franchise) is created:

1. **Initial state:** All `company_config` rows from the parent are copied to the child. The child starts with identical configuration.
2. **Ongoing inheritance:** When the child has no override for a key, the config engine walks up the hierarchy (see Section 3.2).
3. **Override behavior:** The child can create its own `company_config` row for any key, which takes precedence over the parent's value.
4. **Locked settings (GAP-579):** The parent can mark settings as `is_locked = true`. Locked settings cannot be overridden by child entities. The UI shows locked settings as read-only with an explanation: "This setting is controlled by {parent company name}."

### 11.2 Configuration UI for Multi-Entity

When a user with access to multiple entities views settings:
- A dropdown at the top selects which entity's settings to view/edit.
- Settings inherited from a parent are shown in a lighter color with an "Inherited from {parent}" label.
- Inherited settings can be overridden (unless locked) by clicking an "Override" button.
- Overridden settings show a "Reset to inherited" option.

### 11.3 Cross-Entity Reporting Configuration (GAP-574, GAP-575)

Parent companies can configure cross-entity reporting:

```json
{
  "config_domain": "reporting",
  "config_key": "cross_entity",
  "config_value": {
    "enabled": true,
    "child_entities": ["child-uuid-1", "child-uuid-2"],
    "allowed_reports": [
      "revenue_summary",
      "project_status_overview",
      "vendor_spend_analysis"
    ],
    "data_aggregation": "summary"  // 'summary' (totals only) or 'detailed' (line items)
  }
}
```

---

## 12. Migration Path

### 12.1 From Current State

The current system has:
- `companies.settings` JSONB with 6 keys
- `jobs.settings` JSONB (empty default)
- `users.preferences` JSONB with notification and theme settings
- Hardcoded CHECK constraints for statuses on ~15 tables
- Hardcoded approval logic in invoice routes

### 12.2 Migration Steps

1. **Phase A (Non-breaking):** Create the new tables (`company_config`, `custom_field_definitions`, `custom_field_values`, `document_templates`, `number_sequences`, `config_audit_log`, `approval_records`). No existing code changes required.

2. **Phase B (Gradual):** Add a configuration engine service (`server/core/config-engine.js`) that reads from `companies.settings` and `company_config`, with platform defaults as fallback. Migrate existing hardcoded values to use `getConfig()` calls one route/module at a time.

3. **Phase C (Status workflows):** Relax or remove CHECK constraints on status columns, replacing them with application-level validation against the configurable status workflows. This allows builders to customize status labels and transitions.

4. **Phase D (UI):** Build the Settings pages for each configuration domain. Build the custom fields UI. Build the template editor.

5. **Phase E (Multi-entity):** Add parent-child hierarchy support to the config resolution engine. Build the multi-entity settings UI.

---

## 13. Open Questions and Decisions Needed

### Items Requiring Decisions

| Gap Item | Question | Recommended Answer |
|----------|----------|--------------------|
| GAP-025 | Custom report builder scope for v1? | Pre-built reports with configurable parameters; full builder in v2 |
| GAP-027 | Cost code restructuring mid-project -- auto-remap or manual? | Manual with migration tool; auto-remap too risky |
| GAP-030 | How complex should conditional logic be in v1? | Simple field-level conditions; no complex logic trees |
| GAP-031 | How long to retain configuration audit history? | Forever (it is small data) |
| GAP-034 | What is the complexity budget (max setup time)? | Target: useful in 15 minutes, fully configured in 2 hours |

### Critical Design Decisions Already Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Configuration hierarchy depth | 5 levels (user > project > company > parent > platform) | Covers multi-entity and per-project overrides |
| Terminology scope | UI-only, not API | Prevents breaking changes; API is canonical |
| Custom field storage | Separate table (not JSONB on entity) | Full queryability and reporting |
| Status workflow approach | Application-level validation | Allows per-tenant customization |
| Numbering sequence safety | PostgreSQL INSERT ON CONFLICT RETURNING | Atomic without advisory locks |
| Config locking for franchises | `is_locked` flag on `company_config` | Franchisor control without code changes |
| Config change rollback | Audit log with reverse-apply | Append-only history, safe rollback |

### Implementation TODOs (Summary)

- [ ] Create `company_config` table and migration
- [ ] Create `custom_field_definitions` and `custom_field_values` tables
- [ ] Create `document_templates` table
- [ ] Create `number_sequences` table
- [ ] Create `config_audit_log` table
- [ ] Create `approval_records` table
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
- [ ] Implement cross-process cache invalidation via Supabase Realtime
- [ ] Add audit logging for all configuration changes
- [ ] Build configuration template library (GAP-032, GAP-033)
- [ ] Build multi-entity configuration inheritance (GAP-574+)
- [ ] Build conditional rules engine (GAP-030)
- [ ] Write tests for config resolution hierarchy (including multi-entity)
- [ ] Write tests for custom field CRUD and validation
- [ ] Write tests for numbering engine sequence generation
- [ ] Write tests for approval chain execution
- [ ] Write tests for status machine validation
- [ ] Write tests for conditional rules evaluation

---

## Gap Item Coverage Summary

| Gap Item | Section | Status |
|----------|---------|--------|
| GAP-016 | Sections 3, 6.2 | Decided: 5-level hierarchy, tiered Settings UI |
| GAP-017 | Section 4.1 | Decided: Configurable cost code hierarchy, four starting templates |
| GAP-018 | Sections 4.5, 9.3 | Decided: Configurable phases, status machine executor |
| GAP-019 | Sections 4.4, 7.4 | Decided: Terminology map in settings, UI-only scope |
| GAP-020 | Sections 4.6, 7.3 | Decided: Handlebars templates, per-company + per-jurisdiction |
| GAP-021 | Sections 4.7, 10 | Decided: Token-based format strings, atomic sequences |
| GAP-022 | Sections 4.2, 9.2 | Decided: Configurable multi-step approval chains |
| GAP-023 | Section 8 | Decided: Custom fields on all major entities |
| GAP-024 | Section 8.2 | Decided: Custom dropdowns via options JSONB |
| GAP-025 | Section 4.9 | Decided: Pre-built reports v1, report builder v2 |
| GAP-026 | Section 4.9 | Decided: Per-user widget layout, per-role defaults |
| GAP-027 | Section 4.1 | Decided: Manual migration tool with audit trail |
| GAP-028 | Section 4.10 | Decided: Default values configurable in settings |
| GAP-029 | Section 4.3 | Decided: Per-entity required field configuration |
| GAP-030 | Section 4.11 | Decided: Limited conditional logic v1, visual builder v2 |
| GAP-031 | Section 4.12 | Decided: Audit log + rollback support |
| GAP-032 | Section 4.13 | Decided: Platform templates, self-export/import |
| GAP-033 | Section 3.1 | Decided: Zero-config works on day 1 |
| GAP-034 | Section 3.1 | Decided: Progressive disclosure, tiered settings |
| GAP-035 | Section 4.14 | Decided: Self-service with optional concierge |
| GAP-036 | Section 4.15 | Decided: Jurisdiction DB + company/project overrides |
| GAP-037 | Section 4.16 | Decided: State-specific forms + deadline tracking |
| GAP-038 | Section 4.21 | Decided: Jurisdiction building code DB |
| GAP-039 | Section 4.21 | Decided: Per-jurisdiction permit config |
| GAP-040 | Section 4.21 | Decided: Insurance minimums in jurisdiction DB |
| GAP-041 | Section 4.21 | Decided: State-specific contract clause library |
| GAP-042 | Section 4.21 | Decided: Weather API integration |
| GAP-043 | Section 4.21 | Decided: Regional cost benchmarks |
| GAP-044 | Section 4.21 | Decided: Regional labor benchmarks |
| GAP-045 | Section 4.21 | Decided: Local holidays in jurisdiction DB |
| GAP-046 | Section 4.21 | Decided: Work hours in jurisdiction DB |
| GAP-047 | Section 4.21 | Decided: Environmental regs in jurisdiction DB |
| GAP-048 | Section 4.21 | Decided: Licensing in jurisdiction DB |
| GAP-049 | Section 4.15 | Decided: Construction-specific tax rules |
| GAP-050 | Section 4.16 | Decided: State-specific statutory forms |
| GAP-574 | Section 11 | Decided: Config inheritance via parent-child hierarchy |
| GAP-575 | Section 11.3 | Decided: Cross-entity reporting configuration |
| GAP-576 | Section 11 | Decided: Division-level config overrides |
| GAP-577 | Section 11 | Decided: Brand-level branding overrides |
| GAP-578 | Section 11 | See multi-tenancy-design.md Section 12.3 |
| GAP-579 | Section 11.1 | Decided: Locked settings for franchise model |
| GAP-580 | Section 11 | See multi-tenancy-design.md Section 12.5 |
| GAP-547 | Section 15.1 | Decided: Three-tier tax config with per-category applicability |
| GAP-548 | Section 15.2 | Decided: Per-project tax from jurisdiction; multi-state reporting |
| GAP-549 | Section 15.3 | Decided: TaxJar/Avalara API with cache; fallback to jurisdictions table |
| GAP-550 | Section 15.4 | Decided: Per-project/client exemption records with certificate storage |
| GAP-551 | Section 15.5 | Decided: Track vendor payments; generate 1099-NEC summaries |
| GAP-552 | Section 15.6 | Decided: Not a payroll system; integrate with ADP/Gusto/QBO Payroll |
| GAP-553 | Section 15.7 | Decided: Jurisdiction insurance requirements; vendor compliance checking |
| GAP-554 | Section 15.8 | Decided: Per-state WC requirements; vendor certificate tracking |
| GAP-555 | Section 15.9 | Decided: Per-project Builder's Risk with coverage adequacy checks |
| GAP-556 | Section 15.10 | Decided: Per-project additional insured requirements; vendor verification |
| GAP-557 | Section 15.11 | Decided: Auto-generated insurance audit report from platform data |
| GAP-581 | Section 14.1 | Decided: Tiered data sourcing with annual professional review |
| GAP-582 | Section 14.2 | Decided: Builder-configurable permit workflows; 200 metro templates |
| GAP-583 | Section 14.3 | Decided: Visual Crossing API; three use cases with caching |
| GAP-584 | Section 14.4 | Decided: No platform DB; vendor-reported lead times + AI prediction |
| GAP-585 | Section 14.5 | Decided: Platform labor shortage index + builder-sourced rate data |
| GAP-586 | Section 14.6 | Decided: Risk profile display from jurisdiction data; insurance prompts |
| GAP-587 | Section 14.7 | Decided: Foundation type per project; region-informed defaults |
| GAP-588 | Section 14.8 | Decided: Climate zone drives insulation specs, inspection checklists |
| GAP-589 | Section 14.9 | Decided: WUI classification drives compliance checklists and material flags |
| GAP-590 | Section 14.10 | Decided: SDC drives structural costs, inspections, and engineering prompts |
| GAP-581-590 | Section 4.21 | Summary: Regional config via jurisdiction DB (details in Section 14) |

---

## 14. Regional Variability (GAP-581 through GAP-590) -- Detailed Implementation

This section provides concrete implementation details for the regional variability gap items introduced in Section 4.21. Where Section 4.21 defines which settings are regional and how they map to the jurisdictions table, this section specifies the data sourcing strategy, update procedures, API behavior, and user-facing experience for each regional concern.

---

### 14.1 Building Code Database Maintenance (GAP-581)

**Question:** Building codes differ by state and jurisdiction. How do you maintain a database of code requirements?

**Decision: Tiered data sourcing with annual professional review.**

The platform does NOT attempt to be an authoritative building code reference. Instead, it provides a "good enough for project planning" reference database that helps builders select the correct code edition for their jurisdiction and auto-populates inspection checklists.

**Data sourcing strategy:**

| Data Type | Source | Update Frequency | Responsibility |
|-----------|--------|-----------------|---------------|
| ICC code editions by state | ICC website + manual research | Annually (codes update on 3-year cycle) | Platform team |
| State adoption status | ICC/state DOB websites | Semi-annually | Platform team |
| Local amendments | Builder-reported + verified | As reported | Community + platform review |
| Inspection checklists per code | Platform-authored, builder-customizable | At code edition changes | Platform team + builder overrides |

**Implementation:**

```sql
-- Building code reference table (platform-maintained, not tenant-scoped)
CREATE TABLE building_code_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  code_family TEXT NOT NULL,              -- 'IRC', 'IBC', 'IECC', 'NEC', 'UPC', 'IMC'
  edition_year INTEGER NOT NULL,          -- 2018, 2021, 2024
  state TEXT NOT NULL,                    -- State that adopted this edition
  effective_date DATE,                    -- When the state adopted it

  -- Amendments
  has_local_amendments BOOLEAN DEFAULT false,
  amendment_notes TEXT,                   -- Summary of key local differences
  amendment_url TEXT,                     -- Link to official amendment document

  -- Inspection checklists (platform-provided templates)
  inspection_checklist_template_id UUID REFERENCES document_templates(id),

  -- Metadata
  last_verified_at TIMESTAMPTZ,
  verified_by TEXT,                       -- 'platform_team', 'community', 'builder_reported'
  source_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(code_family, edition_year, state)
);
```

**How builders use it:**

1. When creating a project, the builder selects the project address (state + county + municipality).
2. The system looks up the jurisdiction's `building_code_edition` (e.g., "2021 IRC") from the `jurisdictions` table.
3. The matching `building_code_references` row provides the inspection checklist template.
4. The builder can accept the auto-populated checklist or customize it for their specific project.
5. If the builder discovers the platform's code edition is wrong for their jurisdiction, they submit a correction via a "Report incorrect data" link. Platform team reviews and updates.

**What the platform explicitly does NOT do:**
- Provide full code text (that is copyrighted by ICC)
- Interpret code requirements for specific building designs
- Guarantee code data accuracy (disclaimer in ToS)
- Replace the builder's responsibility to verify codes with their local AHJ (Authority Having Jurisdiction)

---

### 14.2 Municipality-Specific Permit Processes (GAP-582)

**Question:** Permit processes vary by municipality. How do you handle that?

**Decision: Builder-configurable permit workflows with platform-provided templates for common jurisdictions.**

The platform cannot maintain permit process data for every US municipality (there are 19,000+). Instead, it provides:

1. **Permit workflow templates** for the 200 largest metro areas (covering ~80% of new construction by volume).
2. **A builder-configurable permit tracker** for any jurisdiction, even those without a platform-provided template.
3. **Community-contributed permit process notes** that builders in the same jurisdiction can opt to share.

**Permit tracking data model:**

```sql
-- Per-project permit tracking (tenant-scoped)
CREATE TABLE permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Permit details
  permit_type TEXT NOT NULL,              -- 'building', 'electrical', 'plumbing', 'mechanical',
                                          -- 'grading', 'fire', 'environmental', 'demo', 'other'
  permit_number TEXT,
  jurisdiction_name TEXT,                 -- "City of Dallas Building Dept"
  jurisdiction_contact TEXT,              -- Phone/email for the permit office

  -- Process tracking
  application_date DATE,
  submitted_date DATE,
  review_status TEXT DEFAULT 'not_started'
    CHECK (review_status IN ('not_started', 'preparing', 'submitted', 'in_review',
                              'corrections_needed', 'approved', 'issued', 'expired', 'closed')),
  approved_date DATE,
  issued_date DATE,
  expiration_date DATE,

  -- Cost
  permit_fee DECIMAL(12,2),
  impact_fee DECIMAL(12,2),

  -- Submission details
  submission_type TEXT,                   -- 'online', 'in_person', 'mail'
  portal_url TEXT,                        -- URL for online permit portal
  required_documents JSONB DEFAULT '[]',  -- ['site_plan', 'structural_drawings', 'energy_calc']

  -- Notes
  notes TEXT,
  inspector_name TEXT,
  inspector_phone TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_permits_company ON permits(company_id);
CREATE INDEX idx_permits_job ON permits(job_id);
CREATE INDEX idx_permits_status ON permits(company_id, review_status);
```

**Jurisdiction permit templates** (platform-maintained, not tenant-scoped):

```sql
CREATE TABLE permit_process_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  jurisdiction_state TEXT NOT NULL,
  jurisdiction_municipality TEXT NOT NULL,

  -- Process info
  permit_portal_url TEXT,
  submission_type TEXT,                   -- 'online', 'in_person', 'combined'
  typical_review_days INTEGER,
  typical_total_days INTEGER,            -- From application to issuance

  -- Required documents by permit type
  required_documents JSONB,              -- { "building": ["site_plan", "floor_plans", ...], ... }

  -- Fee schedule
  fee_schedule JSONB,                    -- { "building": { "base": 500, "per_sqft": 0.25 }, ... }

  -- Tips
  process_notes TEXT,                    -- "Submit plans on Tuesdays for fastest turnaround"
  common_correction_items TEXT[],        -- Known things they flag in review

  last_verified_at TIMESTAMPTZ,
  source TEXT,                           -- 'platform_team', 'builder_contributed'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(jurisdiction_state, jurisdiction_municipality)
);
```

**User experience:** When a builder creates a permit record and enters the jurisdiction, the system checks for a matching `permit_process_templates` row. If found, it pre-populates the submission type, portal URL, typical timeline, and required document checklist. The builder can modify any pre-populated value.

---

### 14.3 Weather Data for All US Regions (GAP-583)

**Question:** How do you handle weather data for all US regions?

**Decision: Single weather API integration (Visual Crossing) with three data use cases.**

**API selection rationale:** Visual Crossing provides historical, current, and forecast weather data via a single REST API. Pricing is per-request with a generous free tier (1,000 requests/day). Alternative: OpenWeatherMap (comparable, slightly cheaper at scale). The integration is behind an abstraction layer so the provider can be swapped.

**Three weather data use cases:**

| Use Case | Data Source | Update Frequency | Consumer |
|----------|-----------|-----------------|----------|
| **Daily log auto-fill** | Current conditions at project address | On daily log creation (1 API call per log) | Daily Logs module (Module 08) |
| **Schedule weather overlay** | 14-day forecast at project address | Daily refresh per active project | Scheduling module (Module 07) |
| **Historical weather analysis** | Past weather for date range + location | On-demand for reporting | Schedule Intelligence (Module 25), Reporting |

**Implementation:**

```typescript
// server/integrations/weather.ts

interface WeatherService {
  getCurrentConditions(lat: number, lng: number): Promise<WeatherData>;
  getForecast(lat: number, lng: number, days: number): Promise<ForecastData[]>;
  getHistorical(lat: number, lng: number, startDate: string, endDate: string): Promise<WeatherData[]>;
}

interface WeatherData {
  date: string;
  tempHigh: number;          // Fahrenheit
  tempLow: number;
  conditions: string;        // 'clear', 'partly_cloudy', 'rain', 'snow', 'thunderstorm', etc.
  precipChance: number;      // 0-100
  precipAmount: number;      // inches
  windSpeed: number;         // mph
  humidity: number;          // 0-100
  isWorkable: boolean;       // Platform-computed: temp > 32 AND precipChance < 70 AND windSpeed < 35
}
```

**Caching strategy:**
- Current conditions cached for 30 minutes per project location (rounded to 0.1 degree lat/lng).
- Forecasts cached for 6 hours.
- Historical data cached indefinitely (past weather does not change).
- Redis key pattern: `weather:{lat}:{lng}:{type}:{date}`.

**Cost controls:**
- Weather API calls are rate-limited to 500/day per tenant (covers ~100 active projects with headroom).
- Historical lookups are batched (one call per date range, not per day).
- Geocoding (address to lat/lng) is done once per project and cached on the `jobs` table: `latitude DECIMAL(9,6)`, `longitude DECIMAL(9,6)`.

---

### 14.4 Material Availability by Region (GAP-584)

**Question:** What about material availability by region?

**Decision: The platform does NOT maintain a material availability database.** Material availability is too volatile (changes weekly with supply chain conditions) and too granular (depends on specific suppliers, not regions) for a platform-maintained dataset to be useful.

**What the platform does instead:**

1. **Vendor-reported lead times:** The vendor management module (Module 10) tracks historical lead times per vendor per material category. Over time, this builds a per-builder picture of material availability in their market.

2. **AI-powered lead time estimates:** The AI engine (Module 25) uses the builder's historical PO-to-delivery data to predict lead times for new orders. These predictions are regional by nature because each builder works with local suppliers.

3. **Schedule impact flags:** When a scheduled task depends on materials with historically long lead times (>4 weeks), the scheduling module flags this as a risk and suggests ordering earlier.

4. **Community benchmarks (future):** Builders who opt into benchmarking contribute anonymized lead time data. The platform aggregates this by region and material category (e.g., "Average window lead time in Texas: 8 weeks, based on 23 builders"). This is a Phase 2 feature requiring sufficient data volume.

**Supplier API integrations (future roadmap):**

| Supplier Type | Integration | Timeline |
|--------------|-------------|----------|
| Lumber yards (84 Lumber, etc.) | Inventory/pricing API | Post-launch, if API available |
| Window/door manufacturers | Lead time API | Post-launch, if API available |
| Appliance distributors | Availability API | Post-launch, if API available |

These integrations are speculative and depend on supplier willingness to provide APIs. The platform is designed to work fully without them.

---

### 14.5 Regional Labor Market Conditions (GAP-585)

**Question:** How do you handle regional labor market conditions?

**Decision: Platform-maintained labor shortage index plus builder-sourced rate data.**

**Labor shortage index** (stored in `jurisdictions.labor_shortage_index`):
- Scale: 1.0 (abundant labor) to 10.0 (severe shortage)
- Updated quarterly by the platform team using BLS data, NAHB surveys, and industry reports
- Used by the scheduling AI to adjust timeline estimates (higher shortage index = longer task durations)

**Builder-sourced labor rate data:**
- Each builder tracks their own labor costs via cost codes (labor line items on budgets and invoices)
- The benchmarking system (Section 13 of multi-tenancy-design.md) aggregates anonymized labor costs by region
- Builders who opt in can see "Your framing labor cost ($18.50/sqft) vs. regional median ($16.20/sqft)" comparisons

**What the platform does NOT do:**
- Maintain a database of prevailing wage rates by trade (this is the builder's responsibility; rates are entered per their own agreements)
- Provide labor sourcing or staffing services
- Track union vs. non-union labor markets (this is configuration the builder sets in their own cost structure)

**Prevailing wage flag:** The `jurisdictions` table includes `prevailing_wage_required BOOLEAN`. When a project is in a prevailing-wage jurisdiction, the platform displays a warning banner on the project and prompts the builder to verify their labor rates meet prevailing wage requirements. The platform does NOT enforce prevailing wage rates because they vary by trade and are updated frequently by the DOL.

---

### 14.6 Natural Disaster Considerations (GAP-586)

**Question:** What about natural disaster considerations by region?

**Decision: Risk profile display and insurance/compliance prompts, not predictive disaster modeling.**

The `jurisdictions` table stores static risk classifications:

| Risk Type | Field | Values | Source |
|-----------|-------|--------|--------|
| Hurricane | `wind_speed_design` | Integer (mph) | ASCE 7 wind speed maps |
| Flood | `flood_zone` | FEMA zone codes ('A', 'AE', 'V', 'X', etc.) | FEMA NFIP maps |
| Wildfire | `wildfire_risk_zone` | WUI classification ('WUI', 'non-WUI', 'moderate', 'high', 'very_high') | State fire agency maps |
| Seismic | `seismic_design_category` | 'A' through 'F' | USGS/ASCE 7 |
| Tornado | `environmental_regulations` JSONB | Tornado alley flag + design wind speed | FEMA/NOAA |

**How the platform uses this data:**

1. **Project creation:** When a project address is entered, the system looks up the jurisdiction and displays a "Risk Profile" card showing applicable natural hazard risks. This is informational -- it helps the builder and their insurance agent understand what coverage is needed.

2. **Insurance compliance:** If the project is in a flood zone, the platform flags that flood insurance may be required and adds a compliance checklist item. If in a wildfire zone, it flags WUI construction requirements.

3. **Cost estimation:** The estimating engine (Module 20) adjusts cost estimates based on risk zone. Projects in seismic category D-F include foundation and framing cost premiums. Projects in wind zones >130 mph include hurricane-rated window and roofing costs.

4. **Construction requirements prompts:** Based on the risk profile, the platform suggests relevant inspection checklist items (e.g., "Hurricane strap inspection" for high-wind zones, "Defensible space inspection" for wildfire zones).

---

### 14.7 Foundation Types by Region (GAP-587)

**Question:** How do you handle building on different foundation types?

**Decision: Foundation type is a project-level field with region-informed defaults and cost code templates.**

**Implementation:**

The `jobs` table includes:
```sql
ALTER TABLE jobs ADD COLUMN foundation_type TEXT
  CHECK (foundation_type IN (
    'slab_on_grade', 'crawlspace', 'full_basement', 'daylight_basement',
    'piling', 'pier_and_beam', 'post_tension_slab', 'helical_pier',
    'raft', 'strip_footing', 'other'
  ));
```

The `jurisdictions.common_foundation_types` JSONB field stores the typical foundation types for that region:
```json
// Texas (Dallas area)
["slab_on_grade", "post_tension_slab", "pier_and_beam"]

// Minnesota
["full_basement", "daylight_basement"]

// Coastal Florida
["piling", "slab_on_grade"]

// Appalachia
["crawlspace", "full_basement"]
```

**User experience:**
1. When creating a project, the foundation type dropdown is pre-sorted to show the region's common types first.
2. The estimating engine (Module 20) uses foundation type to select the appropriate cost assembly (a slab estimate is very different from a full basement estimate).
3. The inspection checklist auto-includes foundation-specific inspections (e.g., "Post-tension cable inspection" for post-tension slabs, "Moisture barrier inspection" for crawlspaces).
4. Budget templates include foundation-type-specific cost codes (e.g., "03-30-00 Cast-in-Place Concrete" for slabs vs. "31-63-00 Bored Piles" for pier foundations).

---

### 14.8 Energy Code by Climate Zone (GAP-588)

**Question:** What about energy code requirements that vary by climate zone?

**Decision: Climate zone and energy code edition tracked per jurisdiction, with compliance checklist integration.**

The IECC (International Energy Conservation Code) divides the US into 8 climate zones. Each zone has different insulation, window, and HVAC efficiency requirements.

**Data stored in `jurisdictions`:**
- `climate_zone TEXT` -- '1' through '8' (with moisture designations: '4A', '4B', '4C', etc.)
- `energy_code TEXT` -- e.g., '2021 IECC', '2018 IECC', 'Title 24' (California)

**How the platform uses this:**

1. **Estimating:** The estimating engine adjusts insulation specs and costs based on climate zone. Zone 1 (Miami) needs R-13 walls; Zone 7 (Minnesota) needs R-21 walls. These affect material quantities and costs.

2. **Inspection checklists:** Energy code compliance inspections are auto-generated based on the project's climate zone: insulation inspection, blower door test, duct leakage test, HERS rating (if required by jurisdiction).

3. **Selections module:** The selections module (Module 21) flags when a client selects a window or HVAC system that does not meet the project's energy code requirements (e.g., selecting a single-pane window in Climate Zone 5).

4. **Documentation:** The platform provides a printable "Energy Code Compliance Summary" per project that lists the applicable requirements and how the project meets them. This is a builder convenience feature, not a code official document.

**California exception:** California uses Title 24 instead of IECC. The platform handles this by allowing `energy_code = 'Title 24 2022'` as a valid value and providing California-specific compliance checklists.

---

### 14.9 Wildfire Zone Construction (GAP-589)

**Question:** How do you handle builders who work in wildfire zones?

**Decision: WUI (Wildland-Urban Interface) classification drives compliance checklists and material requirements.**

**Data:** `jurisdictions.wildfire_risk_zone` stores the WUI classification. This is sourced from state fire agency maps (CalFire in California, equivalent agencies in other states).

**Platform behavior when a project is in a wildfire zone:**

1. **Project flag:** A prominent "WUI Zone" badge appears on the project dashboard with the risk level (moderate, high, very high).

2. **Compliance checklist:** Auto-generated checklist items for WUI construction:
   - Defensible space clearance (30-foot and 100-foot zones)
   - Class A fire-rated roofing material
   - Ember-resistant vents
   - Non-combustible exterior siding or ignition-resistant materials
   - Tempered glass or multi-pane windows
   - Fire-resistant landscaping plan

3. **Material selections:** The selections module flags non-compliant materials. If a client selects wood siding in a "very high" WUI zone, the system shows a warning: "Wood siding may not meet WUI requirements in this zone. Consider fiber cement or stucco."

4. **Insurance prompt:** The system adds an insurance compliance item: "Verify that Builder's Risk policy includes wildfire coverage for WUI zone project."

5. **Inspection items:** WUI-specific inspections are added to the project's inspection schedule: defensible space inspection, fire-resistive construction inspection, ventilation screening inspection.

---

### 14.10 High-Seismic Zone Construction (GAP-590)

**Question:** What about builders in high-seismic zones?

**Decision: Seismic Design Category (SDC) from `jurisdictions.seismic_design_category` drives structural requirements and cost adjustments.**

**Seismic Design Categories:**

| Category | Risk Level | Typical Areas | Platform Impact |
|----------|-----------|---------------|----------------|
| A | Very low | Central US, most of East Coast | No special requirements |
| B | Low | Most of Eastern US | Minor requirements |
| C | Moderate | Pacific Northwest (some areas) | Moderate structural requirements |
| D | High | Most of California, Pacific NW | Significant structural requirements |
| E | Very high | Near major fault lines | Maximum structural requirements |
| F | Near-fault | Within 1km of known active fault | Maximum + site-specific study required |

**Platform behavior for SDC D, E, or F:**

1. **Project flag:** "Seismic Zone D/E/F" badge on project dashboard.

2. **Cost adjustments:** The estimating engine applies a seismic cost multiplier to structural line items:
   - SDC D: +8-15% on foundation and framing
   - SDC E: +15-25% on foundation and framing
   - SDC F: +25-40% on foundation and framing + geotechnical study line item

3. **Inspection checklist additions:**
   - Special inspection: structural steel connections
   - Special inspection: concrete placement
   - Special inspection: masonry
   - Holdown and anchor bolt inspection
   - Shear wall nailing inspection
   - Moment frame connection inspection (if applicable)

4. **Structural engineering prompt:** For SDC D+ projects, the system prompts: "Projects in Seismic Design Category D or higher typically require engineered structural plans. Have structural engineering plans been completed?" with a checklist item.

5. **Foundation type influence:** SDC D+ jurisdictions typically show "post_tension_slab" or "reinforced_slab" as preferred foundation types rather than "slab_on_grade."

---

## 15. Regulatory, Tax & Insurance (GAP-547 through GAP-557)

This section specifies how the platform handles the complex intersection of construction, tax law, and insurance requirements that vary by state, by project, and by builder structure.

---

### 15.1 Sales Tax on Construction by State (GAP-547)

**Question:** Sales tax on construction varies by state. How do you handle it?

**Decision: Three-tier tax configuration (jurisdiction default, company override, project override) with per-category tax applicability.**

Construction sales tax is not a single rate. It varies along three dimensions:
1. **Rate:** Varies by state, county, and municipality
2. **What is taxed:** Some states tax materials only; others tax labor; some tax the total contract
3. **Who pays:** In some states, the builder pays use tax on materials; in others, the client pays sales tax on the finished structure

**Tax configuration schema:**

```json
// Stored in companies.settings.tax or company_config
{
  "config_domain": "tax",
  "config_key": "sales_tax_defaults",
  "config_value": {
    "default_rate": 8.25,                    // Percent, from jurisdiction or manual entry
    "tax_model": "materials_only",           // 'materials_only', 'labor_and_materials',
                                              // 'total_contract', 'use_tax'
    "applies_to": {
      "materials": true,
      "labor": false,
      "equipment_rental": false,
      "subcontractor": false,
      "overhead_and_profit": false
    },
    "exempt_categories": [                   // Cost code categories exempt from tax
      "permits_and_fees",
      "insurance",
      "engineering"
    ],
    "auto_calculate_on_invoices": true,      // Show tax as a line item on invoices
    "auto_calculate_on_estimates": true,     // Include tax estimate in proposals
    "tax_included_in_subcontractor_bids": true  // Subs already include tax in their prices
  }
}
```

**State tax model defaults** (platform-maintained, builder-overridable):

| State | Tax Model | Rate Range | Materials | Labor | Notes |
|-------|-----------|-----------|-----------|-------|-------|
| TX | Materials only | 6.25-8.25% | Yes | No | Builder pays use tax on materials purchased |
| CA | Materials + fixture labor | 7.25-10.75% | Yes | Partial | Tax applies to "fixtures" installation labor |
| FL | Materials only | 6.0-7.5% | Yes | No | Some counties exempt residential construction |
| NY | Materials + some labor | 4.0-8.875% | Yes | Partial | Capital improvements exempt from labor tax |
| WA | Total contract | 0% sales + B&O tax | N/A | N/A | Washington uses Business & Occupation tax instead |

The platform pre-populates the tax model based on the builder's primary state but always allows override because local interpretations vary.

---

### 15.2 Multi-State Builders (GAP-548)

**Question:** What about builders who operate in multiple states?

**Decision: Tax configuration is per-project, not per-company. Each project inherits its tax settings from its jurisdiction, which may differ from the builder's home state.**

**Implementation:**

When a builder creates a project in a different state than their home office:

1. The system detects that the project state differs from the company's state.
2. The project's `jobs.settings.tax` is auto-populated from the `jurisdictions` table for the project's location.
3. A notification alerts the builder: "This project is in [State]. Tax rules differ from your home state. Review tax settings for this project."
4. The builder reviews and confirms or adjusts the tax settings.

**Multi-state tax reporting:**

The platform generates tax reports grouped by jurisdiction:

```
Tax Summary Report — Q1 2026
------------------------------------------
Texas Projects (3 projects):
  Materials tax collected:    $47,200
  Tax rate applied:           8.25%

Colorado Projects (1 project):
  Materials tax collected:    $12,800
  Labor tax collected:         $3,200
  Tax rate applied:           7.65%

Total tax liability:          $63,200
```

**State registration prompts:** When a builder creates their first project in a new state, the platform displays a warning: "You are creating a project in [State] for the first time. You may need to register for a sales tax permit in this state. Consult your accountant." This is informational only -- the platform does not track state tax registrations.

---

### 15.3 Tax Rate Lookups by Address (GAP-549)

**Question:** How do you handle tax rate lookups by address?

**Decision: Integration with a tax rate API (TaxJar or Avalara) for address-level tax rate resolution, with fallback to the jurisdictions table.**

**Implementation:**

```typescript
// server/integrations/tax-rate.ts

interface TaxRateService {
  getRateByAddress(address: string, city: string, state: string, zip: string): Promise<TaxRateResult>;
}

interface TaxRateResult {
  combinedRate: number;          // Total rate (state + county + city + special)
  stateRate: number;
  countyRate: number;
  cityRate: number;
  specialRate: number;           // Special taxing districts
  freightTaxable: boolean;
  jurisdiction: string;          // Human-readable jurisdiction name
}
```

**Rate resolution order:**
1. **Project-level override:** If the builder has manually set a tax rate on this project, use it. (Builder knows best.)
2. **Tax API lookup:** If the project has a valid address, query the tax rate API. Cache the result for 30 days (tax rates change infrequently).
3. **Jurisdictions table:** Fall back to the `jurisdictions.sales_tax_rate` for the project's state/county.
4. **Company default:** Fall back to the company's default tax rate.
5. **Zero:** If nothing is configured, tax is zero (the builder must configure it).

**Cost management:** Tax API calls are expensive at scale. To control costs:
- Cache tax rates per ZIP code for 30 days.
- Batch lookups: when a builder creates multiple projects in the same area, one API call covers all.
- Only call the API when a project is created or its address changes, not on every invoice.
- Free tier builders use the jurisdictions table (no API calls). Paid tier builders get API-backed rates.

---

### 15.4 Tax Exemption Management (GAP-550)

**Question:** What about tax exemption management?

**Decision: Per-project and per-client tax exemption tracking with certificate storage.**

**Scenarios where tax exemptions apply:**
- Government projects (federal, state, local government clients are tax-exempt)
- Non-profit projects (churches, hospitals, schools)
- Resale exemptions (builder purchasing materials for resale in some states)
- Enterprise zone exemptions (some jurisdictions offer tax breaks for construction in designated areas)

**Data model:**

```sql
CREATE TABLE tax_exemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Scope: applies to a client, a project, or company-wide
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  -- If both NULL, applies to all projects (e.g., resale exemption)

  -- Exemption details
  exemption_type TEXT NOT NULL CHECK (exemption_type IN (
    'government', 'nonprofit', 'resale', 'enterprise_zone',
    'agricultural', 'manufacturing', 'other'
  )),
  exemption_number TEXT,                -- Certificate or exemption number
  issuing_state TEXT,

  -- Validity
  effective_date DATE NOT NULL,
  expiration_date DATE,                 -- NULL = no expiration

  -- Certificate document
  certificate_file_id UUID REFERENCES files(id),

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tax_exemptions_company ON tax_exemptions(company_id);
CREATE INDEX idx_tax_exemptions_job ON tax_exemptions(job_id);
CREATE INDEX idx_tax_exemptions_client ON tax_exemptions(client_id);
```

**Runtime behavior:**
- When calculating tax on an invoice or estimate, the system checks for applicable exemptions on the project and client.
- If an exemption exists and is active, tax is reduced to zero (or the exempt portion is excluded).
- Invoices and estimates show the exemption reference (e.g., "Tax exempt: Certificate #EX-12345, State of Texas").
- Expiring exemptions trigger a notification 30 days before expiration: "Tax exemption certificate for [Client] expires on [Date]. Obtain renewed certificate."

---

### 15.5 1099 Reporting (GAP-551)

**Question:** How do you handle 1099 reporting that varies by builder?

**Decision: Platform tracks vendor payment totals and generates 1099-NEC data; builder or their accountant files via QuickBooks or tax software.**

**Implementation:**

The `vendors` table already includes `is_1099 BOOLEAN` and `tax_id_encrypted TEXT`. The platform adds:

```sql
-- Annual 1099 summary (materialized from invoice/payment data)
CREATE TABLE vendor_1099_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,

  -- Payment totals
  total_payments DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_1099_reportable DECIMAL(14,2) NOT NULL DEFAULT 0,

  -- Vendor info snapshot (at time of generation)
  vendor_name TEXT NOT NULL,
  vendor_tax_id_encrypted TEXT,
  vendor_address TEXT,
  vendor_city TEXT,
  vendor_state TEXT,
  vendor_zip TEXT,

  -- Status
  is_1099_required BOOLEAN GENERATED ALWAYS AS (total_1099_reportable >= 600) STORED,
  filing_status TEXT DEFAULT 'pending'
    CHECK (filing_status IN ('pending', 'generated', 'filed', 'corrected')),

  -- Export tracking
  exported_at TIMESTAMPTZ,
  exported_format TEXT,                  -- 'csv', 'quickbooks', 'efile'

  UNIQUE(company_id, vendor_id, tax_year)
);

CREATE INDEX idx_1099_company_year ON vendor_1099_summaries(company_id, tax_year);
```

**1099 generation workflow (annual, triggered in January):**

1. The system calculates total payments per vendor for the prior tax year by summing all `invoices` with `status = 'paid'` grouped by `vendor_id`.
2. Only vendors with `is_1099 = true` are included.
3. Only payments >= $600 in the aggregate are flagged as 1099-reportable.
4. Materials-only payments are excluded in some configurations (configurable: `company_config.config_domain = '1099'`, `config_key = 'include_materials'`).
5. The builder reviews the summary report, corrects any vendor addresses or tax IDs, and exports.

**Export formats:**
- CSV for manual filing or import into tax software
- QuickBooks sync (if QBO integration is active, 1099 data maps to QBO's 1099 tracking)
- IRS FIRE e-file format (future -- requires IRS TCC registration)

**What the platform does NOT do:**
- File 1099s on behalf of the builder (too much legal liability)
- Provide tax advice on whether a payment is 1099-reportable
- Validate TIN (Taxpayer Identification Number) against IRS databases (future: TIN matching API integration)

---

### 15.6 Payroll Tax for W-2 Employees (GAP-552)

**Question:** What about payroll tax for builders with W-2 employees?

**Decision: RossOS is NOT a payroll system. Payroll tax is handled by integration with dedicated payroll providers.**

**Rationale:** Payroll processing involves withholding calculations, quarterly filings (Form 941), state unemployment tax (SUTA rates vary by employer), workers' comp premium calculations, garnishment processing, and benefit deductions. This is a specialized domain with strict compliance requirements. Building a payroll engine would be a multi-year effort that distracts from the core construction management mission.

**What the platform provides:**

1. **Time entry data** (Module 34: HR & Workforce): Employees log hours via the daily log or time tracking module. This data is the input to payroll.

2. **Payroll integration exports:** Time entry data is exported in formats compatible with major payroll providers:
   - **ADP**: CSV import format matching ADP's time import template
   - **Gusto**: API integration (Gusto provides a public API)
   - **QuickBooks Payroll**: Via the QuickBooks integration (Module 16)
   - **Paychex**: CSV import format
   - **Generic CSV**: For any other payroll provider

3. **Labor cost tracking:** After payroll is processed in the external system, the builder imports the payroll cost data back into RossOS for job costing. This can be automated via QuickBooks sync or manually entered.

4. **Burdened labor rate calculation:** The platform stores the builder's burdened labor rate (base pay + payroll taxes + benefits + workers' comp) as a configurable cost per hour per role. This is used for estimating and job costing, not for actual payroll processing.

```json
{
  "config_domain": "labor_rates",
  "config_key": "burdened_rates",
  "config_value": {
    "rates": [
      { "role": "carpenter", "base_rate": 32.00, "burden_multiplier": 1.35, "burdened_rate": 43.20 },
      { "role": "laborer", "base_rate": 22.00, "burden_multiplier": 1.35, "burdened_rate": 29.70 },
      { "role": "electrician", "base_rate": 45.00, "burden_multiplier": 1.40, "burdened_rate": 63.00 },
      { "role": "superintendent", "base_rate": 55.00, "burden_multiplier": 1.30, "burdened_rate": 71.50 }
    ],
    "burden_includes": {
      "fica": 7.65,
      "futa": 0.6,
      "suta": 2.7,
      "workers_comp": 8.5,
      "health_insurance": 6.0,
      "retirement": 3.0,
      "pto": 4.5
    }
  }
}
```

---

### 15.7 Insurance Requirements by State (GAP-553)

**Question:** Insurance requirements vary by state. How do you handle it?

**Decision: The platform tracks insurance requirements per jurisdiction and validates vendor compliance against those requirements.**

**State insurance requirements** (stored in `jurisdictions` table):

```sql
-- Already defined in jurisdictions table:
-- min_gl_coverage INTEGER           -- Minimum general liability ($)
-- min_wc_coverage INTEGER           -- Minimum workers' comp
-- required_endorsements JSONB       -- Required policy endorsements
```

**Extended insurance configuration per jurisdiction:**

```json
// jurisdictions.required_endorsements example for California
{
  "general_liability": {
    "min_per_occurrence": 1000000,
    "min_aggregate": 2000000,
    "required_endorsements": [
      "CG 20 10 - Additional Insured",
      "CG 20 37 - Additional Insured (Completed Operations)"
    ]
  },
  "workers_compensation": {
    "required": true,
    "state_fund_available": true,
    "exemption_available_below_employees": 0   // No exemption in CA
  },
  "auto_liability": {
    "min_combined_single_limit": 1000000
  },
  "contractors_license_bond": {
    "required": true,
    "min_amount": 25000
  }
}
```

**Vendor compliance tracking:**

The vendor management module (Module 10) already tracks insurance certificates per vendor. The platform enhances this with jurisdiction-aware compliance checking:

1. When a vendor is added to a project, the system checks the vendor's insurance against the project's jurisdiction requirements.
2. If the vendor's GL coverage is below the jurisdiction minimum, a compliance warning appears: "Vendor [Name] has $500,000 GL coverage. The minimum for [Jurisdiction] is $1,000,000."
3. If the vendor's workers' comp certificate is expired or missing, the system blocks PO creation (configurable -- some builders enforce this strictly, others treat it as a warning).
4. The builder can set company-level insurance minimums that are higher than the jurisdiction requirements (e.g., "All vendors must carry $2M GL regardless of state minimum").

---

### 15.8 Workers' Compensation Requirements (GAP-554)

**Question:** What about workers' compensation requirements by state?

**Decision: Per-state WC requirements tracked in the jurisdictions table, with vendor certificate tracking and expiration alerts.**

**State WC variation points:**

| Variation | Examples | How Platform Handles |
|-----------|---------|---------------------|
| WC required vs. optional | TX: optional for most; CA: always required | `jurisdictions.required_endorsements.workers_compensation.required` |
| Employee count threshold | FL: required at 1+ construction employees; AL: required at 5+ | `jurisdictions.required_endorsements.workers_compensation.exemption_available_below_employees` |
| State fund vs. private | OH, WA, WY: state fund only; most states: private market | Informational display only |
| Experience mod rating | All states; affects premium calculation | Tracked on `vendors` table as `experience_mod_rate DECIMAL(4,2)` |
| Monopolistic states | OH, ND, WA, WY: must use state fund | Informational flag |

**Vendor WC tracking:**

```sql
-- Already on the vendors insurance tracking (Module 10)
-- This extends the vendor_insurance table concept

CREATE TABLE vendor_insurance_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Certificate details
  certificate_type TEXT NOT NULL CHECK (certificate_type IN (
    'general_liability', 'workers_compensation', 'auto_liability',
    'umbrella', 'professional_liability', 'pollution_liability',
    'builders_risk', 'inland_marine', 'other'
  )),
  carrier_name TEXT,
  policy_number TEXT,

  -- Coverage
  per_occurrence_limit DECIMAL(14,2),
  aggregate_limit DECIMAL(14,2),

  -- Validity
  effective_date DATE NOT NULL,
  expiration_date DATE NOT NULL,

  -- Additional insured
  additional_insured BOOLEAN DEFAULT false,
  additional_insured_endorsement TEXT,    -- Endorsement number

  -- WC-specific
  experience_mod_rate DECIMAL(4,2),      -- For WC certificates

  -- Certificate document
  certificate_file_id UUID REFERENCES files(id),

  -- Compliance status (computed)
  is_compliant BOOLEAN DEFAULT true,
  compliance_notes TEXT,

  -- Alerts
  expiration_alert_sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_insurance_company ON vendor_insurance_certificates(company_id);
CREATE INDEX idx_vendor_insurance_vendor ON vendor_insurance_certificates(vendor_id);
CREATE INDEX idx_vendor_insurance_expiration ON vendor_insurance_certificates(expiration_date);
```

**Expiration alert workflow:**
1. Nightly job scans for certificates expiring within 30 days.
2. Sends notification to the builder's designated insurance contact (usually office staff).
3. At 14 days, sends a reminder.
4. At 0 days (expired), marks the vendor as "insurance lapsed" and optionally blocks new PO creation for that vendor (configurable per company).

---

### 15.9 Builder's Risk Insurance per Project (GAP-555)

**Question:** How do you handle Builder's Risk insurance tracking per project?

**Decision: Per-project insurance tracking with coverage verification and expiration management.**

Builder's Risk insurance is a project-specific policy that covers the structure during construction. It is typically purchased per project and expires at completion or a fixed date.

**Data model:**

```sql
CREATE TABLE project_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Policy details
  policy_type TEXT NOT NULL CHECK (policy_type IN (
    'builders_risk', 'general_liability_project_specific',
    'pollution', 'wrap_up', 'ocip', 'ccip', 'other'
  )),
  carrier_name TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  agent_name TEXT,
  agent_phone TEXT,
  agent_email TEXT,

  -- Coverage
  coverage_amount DECIMAL(14,2) NOT NULL,   -- Total insured value
  deductible DECIMAL(14,2),
  premium DECIMAL(14,2),

  -- Coverage details
  covers_theft BOOLEAN DEFAULT true,
  covers_flood BOOLEAN DEFAULT false,
  covers_earthquake BOOLEAN DEFAULT false,
  covers_wind BOOLEAN DEFAULT true,
  covers_soft_costs BOOLEAN DEFAULT false,   -- Architect fees, permits during delay

  -- Validity
  effective_date DATE NOT NULL,
  expiration_date DATE NOT NULL,

  -- Coverage should match or exceed project value
  project_value_at_inception DECIMAL(14,2),

  -- Status
  status TEXT DEFAULT 'active'
    CHECK (status IN ('pending', 'active', 'expired', 'cancelled', 'claimed')),

  -- Document
  policy_file_id UUID REFERENCES files(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_insurance_company ON project_insurance(company_id);
CREATE INDEX idx_project_insurance_job ON project_insurance(job_id);
CREATE INDEX idx_project_insurance_expiration ON project_insurance(expiration_date);
```

**Platform behavior:**

1. **Project creation prompt:** When a new project is created with a contract value exceeding $100,000 (configurable threshold), the system prompts: "Do you have Builder's Risk insurance for this project?"

2. **Coverage adequacy check:** If the project's current budget exceeds the Builder's Risk coverage amount, a warning appears: "Project budget ($1.2M) exceeds Builder's Risk coverage ($1.0M). Consider increasing coverage."

3. **Change order impact:** When a change order increases the project value, the system checks if the new value exceeds coverage and alerts if so.

4. **Expiration tracking:** Builder's Risk policies typically expire 12 months after effective date. The system alerts at 60, 30, and 14 days before expiration. If the project is not yet complete at expiration, the builder needs to extend the policy.

5. **Lender requirement:** If the project has a construction loan, the lender typically requires Builder's Risk. The system tracks this as a lender compliance requirement alongside the draw request process (Module 15).

---

### 15.10 Additional Insured Endorsements (GAP-556)

**Question:** What about tracking additional insured endorsements?

**Decision: Additional insured status is tracked per vendor insurance certificate, per project, with automated verification.**

**Why this matters:** General contractors require their subcontractors to name them as "additional insured" on the sub's GL policy. This protects the GC if the sub causes damage or injury. Lenders often require the same. Managing this across dozens of vendors and multiple projects is a major administrative burden.

**Implementation:**

The `vendor_insurance_certificates` table (Section 15.8) already includes `additional_insured BOOLEAN` and `additional_insured_endorsement TEXT`. The platform adds project-level additional insured tracking:

```sql
CREATE TABLE additional_insured_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Who needs to be named as additional insured
  insured_entity_name TEXT NOT NULL,        -- "Ross Built LLC" or "First National Bank"
  insured_entity_type TEXT NOT NULL CHECK (insured_entity_type IN (
    'builder', 'lender', 'owner', 'architect', 'other'
  )),

  -- Requirements
  required_endorsements TEXT[] NOT NULL DEFAULT ARRAY['CG 20 10', 'CG 20 37'],
  min_coverage_per_occurrence DECIMAL(14,2),
  min_coverage_aggregate DECIMAL(14,2),

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_requirements_job ON additional_insured_requirements(job_id);
```

**Vendor compliance workflow:**

1. When a vendor is assigned to a project (via PO or bid award), the system checks the vendor's insurance certificates.
2. For each `additional_insured_requirements` row on the project, the system verifies that the vendor has a certificate naming that entity as additional insured.
3. If the endorsement is missing, a compliance task is created: "Request additional insured endorsement from [Vendor] naming [Entity] for project [Project]."
4. The vendor portal (Module 30) allows vendors to upload updated certificates directly.
5. When a new certificate is uploaded, the system re-checks compliance and clears the task if requirements are met.

**Compliance dashboard:**

The insurance compliance dashboard (accessible from project settings) shows:

```
Project: Custom Home - 123 Oak Lane
Additional Insured Requirements:
  [x] Ross Built LLC — 14/14 vendors compliant
  [x] First National Bank — 14/14 vendors compliant

Vendor Compliance Status:
  [x] ABC Plumbing — GL current, WC current, AI endorsements verified
  [x] XYZ Electric — GL current, WC current, AI endorsements verified
  [!] 123 Framing — WC expires in 12 days
  [x] ... (11 more vendors)
```

---

### 15.11 Annual Insurance Audit Data Preparation (GAP-557)

**Question:** How do you handle the annual insurance audit data preparation?

**Decision: Platform generates a pre-formatted insurance audit report from project and payroll data, reducing a week-long manual process to hours.**

**What an insurance audit requires:** Each year, the builder's insurance carrier audits the prior year to determine the actual premium owed (vs. the estimated premium paid). The auditor needs:

1. **Total payroll by employee classification** (carpenters, laborers, supervisors, etc.)
2. **Total subcontractor payments** (separated by insured vs. uninsured subs)
3. **Total revenue by project type** (new construction vs. remodel, residential vs. commercial)
4. **Certificate of insurance status for all subs** (insured subs are excluded from the builder's WC premium calculation)

**Insurance audit report generator:**

```typescript
// server/reports/insurance-audit.ts

interface InsuranceAuditReport {
  auditPeriod: { start: string; end: string };

  // Payroll summary by classification
  payrollByClassification: {
    classCode: string;          // NCCI class code: '5403' (carpentry), '5651' (roofing), etc.
    description: string;
    totalPayroll: number;
    employeeCount: number;
  }[];

  // Subcontractor payments
  subcontractorPayments: {
    vendorName: string;
    totalPaid: number;
    hasValidGL: boolean;
    hasValidWC: boolean;
    isInsured: boolean;         // Has both valid GL and WC
  }[];

  // Revenue by project type
  revenueByProjectType: {
    projectType: string;        // 'custom_home', 'remodel', 'commercial', etc.
    totalRevenue: number;
    projectCount: number;
  }[];

  // Summary
  totalInsuredSubPayments: number;     // Excluded from premium calc
  totalUninsuredSubPayments: number;   // Included in premium calc
  totalPayroll: number;
  totalRevenue: number;
}
```

**Data sources within the platform:**

| Audit Data Need | Platform Source |
|----------------|---------------|
| Payroll by classification | Time entries (Module 34) + employee classification field |
| Subcontractor payments | Invoices with `status = 'paid'` grouped by vendor, filtered by `vendor.is_1099 = true` |
| Sub insurance status | `vendor_insurance_certificates` -- check if GL and WC were valid during the audit period |
| Revenue by project type | Jobs with `project_type` field + total invoiced to client (draws) |

**Workflow:**

1. Builder navigates to Reports > Insurance Audit.
2. Selects the audit period (typically the prior policy year).
3. Platform generates the report pulling from all relevant data.
4. Builder reviews, makes corrections (e.g., reclassify an employee, note that a sub was insured but certificate was not uploaded).
5. Exports as PDF + Excel for the insurance auditor.

**What the builder still needs to do manually:**
- Verify NCCI classification codes for employees (the platform stores them but the builder must confirm accuracy)
- Provide W-2 documentation (from their payroll provider)
- Handle disputes with the auditor on classifications or coverage determinations
- Provide the actual insurance policy documents

**Configuration:**

```json
{
  "config_domain": "insurance_audit",
  "config_key": "settings",
  "config_value": {
    "employee_classifications": [
      { "role": "carpenter", "ncci_code": "5403", "description": "Carpentry" },
      { "role": "laborer", "ncci_code": "5437", "description": "Framing" },
      { "role": "superintendent", "ncci_code": "5606", "description": "Contractor Executive Supervisor" },
      { "role": "office", "ncci_code": "8810", "description": "Clerical" }
    ],
    "policy_year_start_month": 3,         // Some policies are not calendar year
    "sub_threshold_for_inclusion": 0,     // Include all subs, or only those paid > threshold
    "auto_generate_reminder_days": 30     // Remind builder N days before audit typically occurs
  }
}
```

---

### 15.12 Regulatory/Tax/Insurance Gap Coverage Summary

| Gap Item | Section | Decision Summary |
|----------|---------|-----------------|
| GAP-547 | 15.1 | Three-tier tax config (jurisdiction, company, project) with per-category applicability |
| GAP-548 | 15.2 | Per-project tax settings auto-populated from project jurisdiction; multi-state reporting |
| GAP-549 | 15.3 | TaxJar/Avalara API integration with cache; fallback to jurisdictions table |
| GAP-550 | 15.4 | Per-project and per-client exemption records with certificate storage and expiration alerts |
| GAP-551 | 15.5 | Track vendor payments, generate 1099-NEC summaries; builder files via QBO or tax software |
| GAP-552 | 15.6 | Not a payroll system; integrates with ADP/Gusto/QBO Payroll; tracks burdened labor rates |
| GAP-553 | 15.7 | Jurisdiction insurance requirements in DB; vendor compliance checking against minimums |
| GAP-554 | 15.8 | Per-state WC requirements; vendor certificate tracking with expiration alerts |
| GAP-555 | 15.9 | Per-project Builder's Risk tracking with coverage adequacy checks and expiration alerts |
| GAP-556 | 15.10 | Per-project additional insured requirements; vendor compliance verification per endorsement |
| GAP-557 | 15.11 | Auto-generated insurance audit report from platform data; payroll, sub payments, revenue |

---

*Document Version: 2.1*
*Created: 2026-02-11*
*Last Updated: 2026-02-13*
*Status: Comprehensive design covering all configuration, customization, workflow, regional variability, multi-entity configuration, regulatory, tax, and insurance gap items. Sections 14-15 add detailed implementation specifications for all regional variability items (GAP-581 through GAP-590) and all regulatory/tax/insurance items (GAP-547 through GAP-557).*
*Sources: data-model.md, system-architecture.md, claude-code-blueprint.md (Rules 1 and 6), gap-analysis-expanded.md (Sections 1, 6, 41-43)*
