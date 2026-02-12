# Data Migration Strategy

> **Purpose**: Define a comprehensive, painless data migration system that removes friction for builders switching from competitors.
>
> **Business Impact**: This is the #1 barrier to customer acquisition. Nail this = massive competitive advantage.
>
> **Priority**: ELEVATED to P0 - Must be ready at MVP launch

---

## Executive Summary

Builders have years of historical data locked in their current systems. Switching software means:
- Losing historical project data and financials
- Re-entering vendor/client information
- Losing document organization
- Training on new systems while maintaining old data access

**Our Solution**: A seamless, automated migration system that:
1. Imports ALL historical data from major competitors
2. Maps data intelligently to our structure
3. Validates and cleans data during import
4. Allows parallel operation during transition
5. Provides white-glove migration service option

---

## Target Source Systems

### Tier 1: Primary Competitors (Must Support at Launch)

| System | Market Share | API Available | Export Options | Priority |
|--------|--------------|---------------|----------------|----------|
| **Buildertrend** | ~40% custom home | Limited | CSV, Reports | P0 |
| **CoConstruct** | ~25% custom home | Limited | CSV, Excel | P0 |
| **QuickBooks Online** | ~80% use for accounting | Full API | QBO API, IIF | P0 |
| **QuickBooks Desktop** | ~40% (older builders) | Limited | IIF, CSV | P0 |
| **Excel/CSV** | Universal fallback | N/A | Direct import | P0 |

### Tier 2: Secondary Systems (Phase 2)

| System | Market Share | API Available | Priority |
|--------|--------------|---------------|----------|
| **Procore** | Enterprise/commercial | Full API | P1 |
| **Sage 100 Contractor** | Mid-size builders | Limited | P1 |
| **Foundation Software** | Large builders | API available | P1 |
| **Xero** | Growing accounting | Full API | P1 |
| **JobTread** | Emerging competitor | Unknown | P2 |
| **Houzz Pro** | Design-build | Limited | P2 |

### Tier 3: Auxiliary Systems

| System | Data Type | Priority |
|--------|-----------|----------|
| **Microsoft Project** | Schedules | P1 |
| **Primavera P6** | Schedules | P2 |
| **Dropbox/Google Drive** | Documents/Photos | P1 |
| **Google Sheets** | Custom tracking | P0 |
| **Smartsheet** | Schedules/tracking | P2 |

---

## Data Types to Migrate

### Core Data (Required)

| Data Type | Source Fields | RossOS Target | Complexity |
|-----------|---------------|---------------|------------|
| **Companies** | Company info, settings | `companies` | Low |
| **Users** | Names, emails, roles | `users` | Low |
| **Clients** | Contact info, properties | `clients`, `contacts`, `addresses` | Medium |
| **Jobs/Projects** | Project details, status | `jobs`, `job_phases` | Medium |
| **Vendors/Subs** | Company, contacts, trades | `vendors`, `vendor_contacts` | Medium |
| **Cost Codes** | Chart of accounts | `cost_codes` | Medium |
| **Budgets** | Line items by cost code | `budgets`, `budget_line_items` | High |
| **Invoices** | AP invoices | `invoices`, `invoice_line_items` | High |
| **Change Orders** | COs with items | `change_orders`, `change_order_items` | High |
| **Draws/Pay Apps** | Owner billing | `draws`, `draw_line_items` | High |
| **Contracts** | Sub agreements | `contracts`, `contract_items` | Medium |

### Extended Data (Important)

| Data Type | Source | Target | Complexity |
|-----------|--------|--------|------------|
| **Schedules** | Tasks, dependencies | `schedule_items`, `schedule_dependencies` | High |
| **Daily Logs** | Field notes, weather | `daily_logs`, `daily_log_entries` | Medium |
| **Photos** | Project photos | `photos`, `photo_tags` | High (volume) |
| **Documents** | Files, folders | `documents`, `document_folders` | High (volume) |
| **Selections** | Client choices | `selections`, `selection_options` | Medium |
| **Punch Lists** | Deficiency items | `punch_lists`, `punch_list_items` | Low |
| **Insurance Certs** | COIs | `insurance_policies` | Low |
| **Lien Waivers** | Waiver records | `lien_waivers` | Low |

### Historical/Reporting Data

| Data Type | Purpose | Complexity |
|-----------|---------|------------|
| **Closed Projects** | Historical reporting, benchmarking | Medium |
| **Payment History** | AR/AP history | High |
| **Change Order History** | Trend analysis | Medium |
| **Communication Logs** | Audit trail | High |

---

## Migration Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MIGRATION SYSTEM ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │ Buildertrend │     │  CoConstruct │     │   Procore    │                │
│  │   Adapter    │     │    Adapter   │     │   Adapter    │                │
│  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘                │
│         │                    │                    │                         │
│         ▼                    ▼                    ▼                         │
│  ┌─────────────────────────────────────────────────────────┐               │
│  │              UNIVERSAL DATA TRANSFORMER                  │               │
│  │  • Field mapping    • Data validation    • Deduplication │               │
│  │  • Type conversion  • Relationship linking • Enrichment  │               │
│  └─────────────────────────────────────────────────────────┘               │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐               │
│  │                 STAGING DATABASE                         │               │
│  │  • Validate before commit  • Preview data  • Rollback   │               │
│  └─────────────────────────────────────────────────────────┘               │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐               │
│  │                 ROSSOS PRODUCTION                        │               │
│  │  • Final import  • Audit trail  • Notification          │               │
│  └─────────────────────────────────────────────────────────┘               │
│                                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │  QuickBooks  │     │    Excel     │     │   Documents  │                │
│  │   Adapter    │     │    Adapter   │     │   Adapter    │                │
│  └──────────────┘     └──────────────┘     └──────────────┘                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Database Schema for Migration

```sql
-- Migration tracking
CREATE TABLE migrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    source_system TEXT NOT NULL, -- 'buildertrend', 'coconstruct', etc.
    status TEXT DEFAULT 'pending', -- pending, in_progress, validating, completed, failed, rolled_back
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    config JSONB, -- Source-specific configuration
    statistics JSONB, -- Counts, timings, etc.
    error_log JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration batches (for large imports)
CREATE TABLE migration_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_id UUID REFERENCES migrations(id),
    batch_number INT NOT NULL,
    entity_type TEXT NOT NULL, -- 'jobs', 'invoices', etc.
    status TEXT DEFAULT 'pending',
    total_records INT,
    processed_records INT DEFAULT 0,
    error_count INT DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Staging tables for validation
CREATE TABLE migration_staging (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_id UUID REFERENCES migrations(id),
    batch_id UUID REFERENCES migration_batches(id),
    entity_type TEXT NOT NULL,
    source_id TEXT, -- ID from source system
    source_data JSONB NOT NULL, -- Raw data from source
    transformed_data JSONB, -- After transformation
    target_id UUID, -- ID after import to production
    status TEXT DEFAULT 'pending', -- pending, transformed, validated, imported, error
    validation_errors JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Field mapping configuration
CREATE TABLE migration_field_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    source_system TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    source_field TEXT NOT NULL,
    target_field TEXT NOT NULL,
    transform_function TEXT, -- Optional transformation
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, source_system, entity_type, source_field)
);

-- Cost code mapping (critical for financial data)
CREATE TABLE migration_cost_code_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_id UUID REFERENCES migrations(id),
    source_code TEXT NOT NULL,
    source_name TEXT,
    target_cost_code_id UUID REFERENCES cost_codes(id),
    auto_matched BOOLEAN DEFAULT false,
    confidence_score DECIMAL(3,2),
    reviewed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ID mapping (maintain relationships)
CREATE TABLE migration_id_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_id UUID REFERENCES migrations(id),
    entity_type TEXT NOT NULL,
    source_id TEXT NOT NULL,
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(migration_id, entity_type, source_id)
);
```

---

## Source-Specific Adapters

### Buildertrend Adapter

**Data Access Methods**:
1. **CSV Export** (Primary): User exports from Buildertrend reports
2. **API** (Limited): Some endpoints available with subscription
3. **Report Scraping** (Fallback): Parse PDF/Excel reports

**Export Instructions for Users**:
```
1. Go to Reports > Financial Reports > Export All Data
2. Select date range: "All Time"
3. Export format: CSV
4. Include: Projects, Budget, Invoices, Change Orders, Contacts
5. Upload the ZIP file to RossOS Migration Wizard
```

**Field Mappings**:
| Buildertrend Field | RossOS Field | Transform |
|--------------------|--------------|-----------|
| `Project Name` | `jobs.name` | Direct |
| `Project Address` | `addresses.street_address` | Parse |
| `Project Status` | `jobs.status` | Map values |
| `Budget Category` | `cost_codes.code` | Lookup/create |
| `Estimated Amount` | `budget_line_items.estimated_amount` | Direct |
| `Actual Amount` | `budget_line_items.actual_amount` | Direct |
| `Client Name` | `clients.name` | Dedupe check |
| `Vendor Name` | `vendors.name` | Dedupe check |

**Challenges & Solutions**:
| Challenge | Solution |
|-----------|----------|
| No direct API access | Guide users through export process |
| Cost codes don't match | AI-assisted mapping with review |
| Photos not in export | Separate Dropbox/Drive import |
| Custom fields | Store in JSONB metadata |

---

### CoConstruct Adapter

**Data Access Methods**:
1. **Data Export Tool**: Built-in export feature
2. **QuickBooks Sync**: If they sync to QB, import from there
3. **Manual CSV**: Report exports

**Field Mappings**:
| CoConstruct Field | RossOS Field | Transform |
|-------------------|--------------|-----------|
| `Project` | `jobs.name` | Direct |
| `Homeowner` | `clients.name` | Split first/last |
| `Selections` | `selections` | Category mapping |
| `Specs` | `specifications` | Parse |
| `Budget Items` | `budget_line_items` | Cost code mapping |
| `To-Dos` | `tasks` or `punch_list_items` | Context-based |

---

### QuickBooks Adapter

**Data Access Methods**:
1. **QBO API** (Online): Full OAuth2 integration
2. **IIF Import** (Desktop): Standard interchange format
3. **CSV Export**: Manual export option

**Integration Approach**:
```typescript
// QuickBooks Online OAuth2 Flow
interface QBOConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  realmId: string; // Company ID
}

// Data to sync
interface QBOImportOptions {
  vendors: boolean;      // Map to vendors table
  customers: boolean;    // Map to clients table
  invoices: boolean;     // Map to invoices (careful - AP vs AR)
  bills: boolean;        // Map to invoices (AP)
  accounts: boolean;     // Map to cost_codes
  classes: boolean;      // Map to job phases or cost codes
  items: boolean;        // Map to budget templates
}
```

**Two-Way Sync Consideration**:
- Initial import: QBO → RossOS
- Ongoing sync: RossOS → QBO for accounting
- Avoid duplicate entry

---

### Procore Adapter

**Data Access Methods**:
1. **Full REST API**: Well-documented, OAuth2
2. **Webhooks**: Real-time sync possible

**API Endpoints to Use**:
```
GET /rest/v1.0/projects
GET /rest/v1.0/projects/{id}/budgets
GET /rest/v1.0/projects/{id}/prime_contracts
GET /rest/v1.0/projects/{id}/change_orders
GET /rest/v1.0/projects/{id}/subcontractors
GET /rest/v1.0/projects/{id}/documents
GET /rest/v1.0/projects/{id}/daily_logs
GET /rest/v1.0/projects/{id}/rfis
GET /rest/v1.0/projects/{id}/submittals
```

---

### Universal Excel/CSV Adapter

**Template System**:
Provide downloadable Excel templates for manual data entry:

```
templates/
├── jobs_import_template.xlsx
├── clients_import_template.xlsx
├── vendors_import_template.xlsx
├── budget_import_template.xlsx
├── invoices_import_template.xlsx
├── schedule_import_template.xlsx
└── cost_codes_import_template.xlsx
```

**Smart Column Detection**:
- Fuzzy match column headers to expected fields
- AI-assisted mapping suggestions
- Preview and confirm before import

---

## Migration Wizard UI Flow

### Step 1: Source Selection
```
┌─────────────────────────────────────────────────────────────┐
│  Where is your data coming from?                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Buildertrend│  │ CoConstruct │  │   Procore   │        │
│  │     ○       │  │     ○       │  │     ○       │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  QuickBooks │  │ Excel/CSV   │  │    Other    │        │
│  │     ○       │  │     ○       │  │     ○       │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  [ ] I need help exporting my data (show instructions)      │
│                                                             │
│                              [Continue →]                   │
└─────────────────────────────────────────────────────────────┘
```

### Step 2: Data Upload / Connection
```
┌─────────────────────────────────────────────────────────────┐
│  Upload your Buildertrend export                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │     Drag & drop your export files here              │   │
│  │              or click to browse                     │   │
│  │                                                     │   │
│  │     Supported: .csv, .xlsx, .zip                    │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Files detected:                                            │
│  ✓ projects_export.csv (247 projects)                      │
│  ✓ budget_export.csv (3,241 line items)                    │
│  ✓ contacts_export.csv (892 contacts)                      │
│  ⚠ invoices_export.csv (parsing...)                        │
│                                                             │
│  [← Back]                        [Analyze Data →]          │
└─────────────────────────────────────────────────────────────┘
```

### Step 3: Data Mapping Review
```
┌─────────────────────────────────────────────────────────────┐
│  Review data mapping                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  COST CODE MAPPING                          [Auto-map all] │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Your Code    Your Name           RossOS Code  Match │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 01-100       General Conditions  01-GC       ✓ 98% │   │
│  │ 03-200       Concrete Foundation 03-CONC     ✓ 95% │   │
│  │ 06-100       Rough Carpentry     06-FRAM     ✓ 92% │   │
│  │ 09-250       Drywall            09-DRY      ✓ 97% │   │
│  │ CUSTOM-1     Pool Allowance      [Select...] ⚠ 0%  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  5 codes need manual review                                 │
│                                                             │
│  [← Back]                        [Continue →]              │
└─────────────────────────────────────────────────────────────┘
```

### Step 4: Validation & Preview
```
┌─────────────────────────────────────────────────────────────┐
│  Validation Results                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✓ 247 Projects ready to import                            │
│  ✓ 156 Clients ready to import (12 duplicates merged)      │
│  ✓ 89 Vendors ready to import                              │
│  ✓ 3,241 Budget line items ready                           │
│  ⚠ 23 Invoices need review (missing vendor match)          │
│  ✗ 3 Change Orders failed validation (see details)         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Preview: Johnson Residence                          │   │
│  │ Budget: $1,234,567 | Status: Active | 67% Complete │   │
│  │ Invoices: 45 | Change Orders: 8 | Draws: 5         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [ ] Import historical (closed) projects                    │
│  [x] Import active projects                                 │
│  [ ] Keep source system active during transition            │
│                                                             │
│  [← Back]       [Fix Issues]       [Start Import →]        │
└─────────────────────────────────────────────────────────────┘
```

### Step 5: Import Progress
```
┌─────────────────────────────────────────────────────────────┐
│  Import in Progress                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Overall Progress: ████████████░░░░░░░░ 62%                │
│                                                             │
│  ✓ Companies & Settings          Complete                  │
│  ✓ Users                         Complete (12 users)       │
│  ✓ Cost Codes                    Complete (156 codes)      │
│  ✓ Clients                       Complete (156 clients)    │
│  ✓ Vendors                       Complete (89 vendors)     │
│  ► Projects                      In Progress (167/247)     │
│  ○ Budgets                       Waiting                   │
│  ○ Invoices                      Waiting                   │
│  ○ Documents                     Waiting                   │
│                                                             │
│  Estimated time remaining: 12 minutes                       │
│                                                             │
│  [Cancel Import]                                            │
└─────────────────────────────────────────────────────────────┘
```

### Step 6: Completion & Verification
```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Migration Complete!                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Summary:                                                   │
│  • 247 Projects imported                                    │
│  • 156 Clients imported                                     │
│  • 89 Vendors imported                                      │
│  • $45.2M in budget data                                   │
│  • 2,341 Invoices                                          │
│  • 12,456 Documents & Photos                               │
│                                                             │
│  Recommended next steps:                                    │
│  1. Review your active projects →                          │
│  2. Verify financial totals match source system            │
│  3. Connect QuickBooks for ongoing sync →                  │
│  4. Invite your team members →                             │
│                                                             │
│  Questions? Our migration team is here to help.             │
│  📞 (555) 123-4567  |  📧 migration@rossos.com             │
│                                                             │
│  [Go to Dashboard]                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Migration Service Tiers

### Tier 1: Self-Service (Free)
- Migration wizard walkthrough
- Template downloads
- AI-assisted field mapping
- Email support
- Best for: Small builders, simple data

### Tier 2: Assisted Migration ($500)
- Everything in Tier 1
- 1-hour video call for setup
- Data validation review by our team
- Priority support during migration
- Best for: Mid-size builders, complex data

### Tier 3: White-Glove Migration ($2,000+)
- Everything in Tier 2
- Dedicated migration specialist
- We handle the entire process
- Custom field mapping
- Data cleanup and normalization
- Parallel operation support
- Training for your team
- Best for: Large builders, enterprise data

---

## Technical Implementation

### API Structure

```typescript
// Migration API endpoints
POST   /api/migrations                    // Start new migration
GET    /api/migrations/:id                // Get migration status
POST   /api/migrations/:id/upload         // Upload source files
POST   /api/migrations/:id/connect        // Connect to API (QB, Procore)
GET    /api/migrations/:id/mappings       // Get field mappings
PATCH  /api/migrations/:id/mappings       // Update field mappings
POST   /api/migrations/:id/validate       // Run validation
GET    /api/migrations/:id/preview        // Preview data
POST   /api/migrations/:id/execute        // Execute import
POST   /api/migrations/:id/rollback       // Rollback if needed
GET    /api/migrations/:id/report         // Get final report
```

### Background Job Processing

```typescript
// Migration jobs
interface MigrationJob {
  type: 'parse' | 'transform' | 'validate' | 'import' | 'rollback';
  migrationId: string;
  batchId?: string;
  entityType?: string;
  priority: 'high' | 'normal' | 'low';
}

// Process in order:
// 1. Parse source files → staging
// 2. Transform data → apply mappings
// 3. Validate → check constraints, duplicates
// 4. Import → insert to production
// 5. Verify → confirm counts match
```

### Rollback Strategy

```typescript
// Every migration creates a rollback point
interface RollbackPoint {
  migrationId: string;
  createdAt: Date;
  tables: {
    tableName: string;
    recordIds: string[];  // IDs that were inserted
  }[];
}

// Rollback deletes all inserted records
// Safe because we track every insert
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Self-service completion rate | > 80% |
| Average migration time (self-service) | < 2 hours |
| Data accuracy (financial totals match) | > 99.5% |
| Customer satisfaction with migration | > 4.5/5 |
| Migration-related support tickets | < 2 per migration |

---

## Roadmap Integration

### Priority Elevation

**Original**: Phase 15 (Post-MVP)
**New**: **Phase 1.5** - Must be ready before active customer acquisition

### Implementation Phases

#### Phase 1.5a: Core Migration Infrastructure
- Migration wizard UI
- Staging database and validation
- Universal CSV/Excel adapter
- Progress tracking and rollback

#### Phase 1.5b: Primary Adapters
- Buildertrend adapter
- CoConstruct adapter
- QuickBooks Online API integration
- QuickBooks Desktop IIF import

#### Phase 1.5c: Advanced Features
- Procore adapter
- AI-assisted field mapping
- Document/photo migration
- Two-way QuickBooks sync

---

## Competitive Advantage

| Competitor | Migration Support | Our Advantage |
|------------|-------------------|---------------|
| Buildertrend | Manual only | Automated import FROM them |
| CoConstruct | Limited export | We import their full data |
| Procore | Good API | We support more sources |
| JobTread | Unknown | Early mover advantage |

**Key Selling Points**:
1. "Bring ALL your data - projects, budgets, invoices, everything"
2. "Keep using QuickBooks - we sync automatically"
3. "Migration takes hours, not weeks"
4. "Your historical data for benchmarking and reporting"
5. "White-glove service available - we do it for you"

---

*Last Updated: 2024-02-12*
*Version: 1.0*
