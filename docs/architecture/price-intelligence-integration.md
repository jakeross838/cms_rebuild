# Price Intelligence & Estimator Integration Architecture

**Created:** 2026-02-20
**Status:** Planning
**Source:** Live Price Database Project Integration

---

## Executive Summary

This document defines the integration of the Live Price Database (material pricing, public estimator, lead capture) into the CMS platform. The core philosophy is **circular data flow** — every transaction feeds the intelligence system, and the intelligence system improves every future transaction.

---

## Integration Philosophy: The Flywheel

```
                    ┌─────────────────────────────────────┐
                    │         PUBLIC ESTIMATOR            │
                    │   (Lead capture, instant pricing)   │
                    └──────────────┬──────────────────────┘
                                   │
                                   ▼
┌──────────────────┐      ┌─────────────────┐      ┌──────────────────┐
│  PRICE HISTORY   │◄─────│     LEADS       │─────►│   PROPOSALS      │
│  (Every quote,   │      │  (Full estimate │      │ (Estimate-based) │
│   invoice, PO)   │      │   snapshot)     │      │                  │
└────────┬─────────┘      └─────────────────┘      └────────┬─────────┘
         │                                                   │
         │                                                   ▼
         │                                          ┌──────────────────┐
         │                                          │    CONTRACTS     │
         │                                          │  (Signed scope)  │
         │                                          └────────┬─────────┘
         │                                                   │
         ▼                                                   ▼
┌──────────────────┐      ┌─────────────────┐      ┌──────────────────┐
│  AI ESTIMATES    │─────►│    PROJECTS     │◄─────│    BUDGETS       │
│  (Price-aware)   │      │  (Active jobs)  │      │ (From estimate)  │
└──────────────────┘      └────────┬────────┘      └──────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
           ┌────────────┐  ┌────────────┐  ┌────────────┐
           │ SELECTIONS │  │    POs     │  │  SCHEDULE  │
           │ (Client    │  │ (Vendor    │  │ (Timeline) │
           │  choices)  │  │  orders)   │  │            │
           └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
                 │               │               │
                 │               ▼               │
                 │        ┌────────────┐         │
                 │        │  INVOICES  │         │
                 │        │ (Actuals)  │         │
                 │        └─────┬──────┘         │
                 │              │                │
                 └──────────────┼────────────────┘
                                │
                                ▼
                    ┌─────────────────────────────┐
                    │      PRICE INTELLIGENCE     │
                    │  • Historical pricing       │
                    │  • Vendor comparison        │
                    │  • Estimate accuracy        │
                    │  • Timeline actuals         │
                    │  • Selection popularity     │
                    └──────────────┬──────────────┘
                                   │
                                   │ Feeds back into
                                   ▼
                    ┌─────────────────────────────┐
                    │      BETTER ESTIMATES       │
                    │  • More accurate pricing    │
                    │  • Smarter recommendations  │
                    │  • Predictive timelines     │
                    └─────────────────────────────┘
```

---

## Data Flow Details

### 1. Public Estimator → Lead Capture

The public estimator is a white-label, embeddable tool that:
- Captures homeowner project parameters (sqft, rooms, finish level, selections)
- Calculates instant estimates using `estimator_config` pricing
- Gates full results behind contact form (lead capture)
- Stores complete estimate snapshot in `estimator_leads`

**Data Captured:**
```typescript
interface EstimatorLead {
  // Contact
  contact_name: string
  contact_email: string
  contact_phone?: string
  contact_message?: string

  // Estimate Parameters
  estimate_params: {
    square_footage: number
    stories: number
    bedrooms: number
    bathrooms: number
    garage_spaces: number
    finish_level: 'builder' | 'standard' | 'premium' | 'luxury'

    // Room selections
    rooms: {
      room_type: string
      count: number
      selections: Record<string, string> // category → selection_id
    }[]

    // Feature selections
    features: {
      category: string
      selection: string
      tier: string
    }[]
  }

  // Calculated Results
  estimate_low: number
  estimate_high: number
  estimate_breakdown: {
    category: string
    display_name: string
    cost_low: number
    cost_high: number
    percentage: number
  }[]

  // Timeline Estimate
  estimated_duration_months: number
  estimated_start_window?: string
}
```

### 2. Lead → Proposal Flow

When a lead is qualified (Module 36), the system can auto-generate a proposal:

1. **Lead Qualification** (Module 36: Lead Pipeline CRM)
   - Lead status: `new` → `contacted` → `qualified` → `proposal_sent`
   - Builder reviews estimate parameters
   - Adjusts pricing/scope as needed

2. **Proposal Generation** (Module 38: Proposals)
   - One-click generate from lead's estimate snapshot
   - Pre-populated with: scope, pricing breakdown, finish level descriptions
   - Builder customizes terms, validity period, payment schedule
   - Client-facing presentation with branding

3. **Contract Conversion** (Module 38: Contracts)
   - Signed proposal → Contract
   - Contract → Project creation
   - Budget auto-populated from estimate

### 3. Selections ↔ Price Intelligence

Every selection made feeds the pricing database:

**Selection → Price History:**
```
Client selects "Quartz Countertop - Calacatta" at $85/sqft
    ↓
Selection confirmed → PO generated to vendor
    ↓
Invoice received → Actual price captured: $82/sqft
    ↓
Price history updated:
  - Material: Quartz Countertop - Calacatta
  - Vendor: ABC Stone
  - Quote price: $85/sqft
  - Actual price: $82/sqft
  - Variance: -3.5%
  - Job: Smith Residence
  - Date: 2026-02-20
```

**Price Intelligence → Selection Recommendations:**
```
Builder creating estimate for new project
    ↓
AI suggests allowance for "Countertops - Premium"
  - Historical average: $78-92/sqft
  - Recent trend: +2.3% (material cost rising)
  - Confidence: High (47 data points, 12 months)
  - Recommended allowance: $4,800 for 52 sqft
```

### 4. Timeline Intelligence

Every project completion feeds schedule predictions:

**Actuals → Timeline Database:**
```
Flooring installation completed
  - Scheduled: 5 days
  - Actual: 6 days
  - Material: Engineered Hardwood
  - Area: 2,400 sqft
  - Complexity: Standard
  - Vendor: ProFloor Inc
```

**Timeline Database → Estimates:**
```
New estimate for 2,800 sqft flooring
    ↓
AI predicts: 6-7 days
  - Based on: 23 similar installations
  - Factors: sqft, material type, complexity
  - Vendor performance: ProFloor avg +0.8 days
```

### 5. PO/Invoice → Price History

Every financial transaction feeds pricing:

```
Purchase Order created
  ↓
  Material: Trex Transcend 1x6x16 Spiced Rum
  Vendor: Island Lumber
  Quantity: 200 pcs
  Unit Price: $45.00
  ↓
Invoice received
  ↓
  Actual: $44.25/pc (2% discount applied)
  ↓
Price history entry created:
  - source_type: 'invoice'
  - confidence: high (actual transaction)
```

---

## Module Integration Map

### Modules That FEED Price Intelligence

| Module | Data Contributed |
|--------|------------------|
| **Module 13: Invoice AI** | Extracted line items → price history |
| **Module 18: Purchase Orders** | Committed prices → price tracking |
| **Module 21: Selections** | Selection costs → category averages |
| **Module 26: Bid Management** | Vendor bids → labor pricing |
| **Module 17: Change Orders** | Price changes → variance tracking |

### Modules That CONSUME Price Intelligence

| Module | Intelligence Used |
|--------|-------------------|
| **Module 20: Estimating** | AI pricing suggestions, allowance recommendations |
| **Module 21: Selections** | Option pricing, vendor comparison |
| **Module 18: Purchase Orders** | Price validation, better-price alerts |
| **Module 26: Bid Management** | Historical bid comparison, sub recommendations |
| **Module 38: Proposals** | Estimate pricing, presentation data |
| **Public Estimator** | Category pricing by finish level |

### Modules That Do BOTH

| Module | Feeds | Consumes |
|--------|-------|----------|
| **Module 9: Budget Tracking** | Actuals vs budget variance | Budget alerts, forecasting |
| **Module 10: Vendors** | Vendor performance data | Vendor recommendations |
| **Module 22: Vendor Performance** | FTQ scores, on-time delivery | Price-quality correlation |
| **Module 25: Schedule** | Actual durations | Duration predictions |

---

## Database Schema Integration

### New Tables (from Live Price DB)

```sql
-- ESTIMATOR CONFIGURATION
-- Pricing by category by finish level (admin-configurable)
estimator_config (
  id UUID PRIMARY KEY,
  builder_id UUID REFERENCES builders(id),
  category TEXT NOT NULL,
  finish_level TEXT NOT NULL, -- builder, standard, premium, luxury
  cost_per_sqft_low NUMERIC(10,2),
  cost_per_sqft_high NUMERIC(10,2),
  display_name TEXT,
  sort_order INT,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(builder_id, category, finish_level)
)

-- ESTIMATOR LEADS
-- Public estimator submissions with full snapshot
estimator_leads (
  id UUID PRIMARY KEY,
  builder_id UUID REFERENCES builders(id),
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  contact_message TEXT,
  estimate_params JSONB NOT NULL,
  estimate_low NUMERIC(14,2),
  estimate_high NUMERIC(14,2),
  estimate_breakdown JSONB NOT NULL,
  estimated_duration_months INT,
  source TEXT, -- website, referral, ad campaign
  utm_source TEXT,
  utm_campaign TEXT,
  status TEXT DEFAULT 'new', -- new, contacted, qualified, converted, archived
  converted_to_project_id UUID REFERENCES projects(id),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- MATERIAL CATALOG (Visual)
-- Product catalog with images for selections
catalog_items (
  id UUID PRIMARY KEY,
  builder_id UUID,  -- null = platform-wide
  category TEXT NOT NULL,
  subcategory TEXT,
  name TEXT NOT NULL,
  description TEXT,
  manufacturer TEXT,
  model_number TEXT,
  specifications JSONB,
  images TEXT[],  -- Storage paths
  spec_sheet_url TEXT,
  install_guide_url TEXT,
  price_range_low NUMERIC(12,2),
  price_range_high NUMERIC(12,2),
  price_unit TEXT, -- each, sqft, lf
  lead_time_days INT,
  is_active BOOLEAN DEFAULT true,
  popularity_score INT DEFAULT 0, -- Updated from selection frequency
  created_at TIMESTAMPTZ DEFAULT now()
)

-- CATALOG ITEM PRICING (Vendor-specific)
catalog_item_pricing (
  id UUID PRIMARY KEY,
  catalog_item_id UUID REFERENCES catalog_items(id),
  vendor_id UUID REFERENCES vendors(id),
  unit_price NUMERIC(12,4),
  price_unit TEXT,
  quantity_break_1 INT,
  quantity_break_1_price NUMERIC(12,4),
  quantity_break_2 INT,
  quantity_break_2_price NUMERIC(12,4),
  lead_time_days INT,
  last_quoted DATE,
  is_preferred BOOLEAN DEFAULT false,
  notes TEXT
)

-- TIMELINE ACTUALS
-- Historical duration data for predictions
timeline_actuals (
  id UUID PRIMARY KEY,
  builder_id UUID REFERENCES builders(id),
  project_id UUID REFERENCES projects(id),
  task_type TEXT NOT NULL, -- Category: framing, electrical_rough, flooring, etc.
  scheduled_days INT,
  actual_days INT,
  variance_days INT GENERATED ALWAYS AS (actual_days - scheduled_days) STORED,
  square_footage NUMERIC(10,2),
  unit_count INT, -- fixtures, openings, etc.
  complexity TEXT, -- simple, standard, complex
  vendor_id UUID REFERENCES vendors(id),
  weather_delay_days INT DEFAULT 0,
  notes TEXT,
  completed_at DATE,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- ESTIMATE ACCURACY TRACKING
-- Compare estimates to actuals for model improvement
estimate_accuracy (
  id UUID PRIMARY KEY,
  builder_id UUID REFERENCES builders(id),
  project_id UUID REFERENCES projects(id),
  cost_code TEXT,
  category TEXT,
  estimated_amount NUMERIC(12,2),
  actual_amount NUMERIC(12,2),
  variance_amount NUMERIC(12,2) GENERATED ALWAYS AS (actual_amount - estimated_amount) STORED,
  variance_percent NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN estimated_amount > 0
    THEN ((actual_amount - estimated_amount) / estimated_amount * 100)
    ELSE 0 END
  ) STORED,
  finish_level TEXT,
  project_type TEXT,
  notes TEXT,
  captured_at TIMESTAMPTZ DEFAULT now()
)
```

### Integration with Existing Tables

```sql
-- Add to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS
  source_lead_id UUID REFERENCES estimator_leads(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS
  original_estimate_snapshot JSONB;

-- Add to selections table
ALTER TABLE v2_selection_options ADD COLUMN IF NOT EXISTS
  catalog_item_id UUID REFERENCES catalog_items(id);
ALTER TABLE v2_selection_options ADD COLUMN IF NOT EXISTS
  price_source TEXT; -- manual, catalog, quote, invoice

-- Add to invoices/line_items
ALTER TABLE invoice_line_items ADD COLUMN IF NOT EXISTS
  catalog_item_id UUID REFERENCES catalog_items(id);
ALTER TABLE invoice_line_items ADD COLUMN IF NOT EXISTS
  price_captured BOOLEAN DEFAULT false;

-- Add to PO line items
ALTER TABLE po_line_items ADD COLUMN IF NOT EXISTS
  catalog_item_id UUID REFERENCES catalog_items(id);
ALTER TABLE po_line_items ADD COLUMN IF NOT EXISTS
  price_intelligence_check JSONB; -- Alert results at time of PO
```

---

## UI Components to Add/Update

### New Preview Pages

| Page | Purpose |
|------|---------|
| `price-intelligence-preview.tsx` | Main price intelligence dashboard |
| `public-estimator-preview.tsx` | Public estimator wizard flow |
| `catalog-preview.tsx` | Visual material/product catalog |
| `estimate-accuracy-preview.tsx` | Estimate vs actual tracking |

### Updated Preview Pages

| Page | Updates |
|------|---------|
| `leads-preview.tsx` | Add estimator lead fields, estimate snapshot display |
| `estimates-preview.tsx` | Add AI pricing suggestions, confidence indicators |
| `selections-preview.tsx` | Add catalog integration, price comparison |
| `purchase-orders-preview.tsx` | Add price intelligence alerts |
| `proposals-preview.tsx` | Add estimate-to-proposal flow |

---

## API Endpoints

### Public (No Auth)

```
GET  /api/public/estimator/config/:builderId    # Pricing config for estimator
POST /api/public/estimator/calculate            # Calculate estimate
POST /api/public/estimator/leads                # Submit lead
GET  /api/public/catalog/:builderId             # Public catalog browse
```

### Authenticated

```
# Estimator Admin
GET    /api/v2/estimator/config                 # Get pricing config
PUT    /api/v2/estimator/config                 # Update pricing config
GET    /api/v2/estimator/leads                  # List leads
GET    /api/v2/estimator/leads/:id              # Lead detail
PUT    /api/v2/estimator/leads/:id              # Update lead status
POST   /api/v2/estimator/leads/:id/convert      # Convert to project

# Catalog
GET    /api/v2/catalog                          # Browse catalog
POST   /api/v2/catalog                          # Add catalog item
PUT    /api/v2/catalog/:id                      # Update catalog item
GET    /api/v2/catalog/:id/pricing              # Vendor pricing for item
POST   /api/v2/catalog/import                   # Bulk import

# Price Intelligence (extends Module 23)
GET    /api/v2/prices/suggest                   # AI price suggestion
GET    /api/v2/prices/validate                  # Validate price against history
GET    /api/v2/prices/timeline-estimate         # Duration prediction

# Estimate Accuracy
GET    /api/v2/estimates/accuracy               # Accuracy metrics
POST   /api/v2/estimates/accuracy/capture       # Capture actuals
GET    /api/v2/estimates/accuracy/by-category   # Breakdown by category
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Create database migrations for new tables
- [ ] Port `estimator_config` seeding from Live Price DB
- [ ] Create `catalog_items` table with basic structure
- [ ] Add `estimator_leads` table

### Phase 2: Public Estimator (Week 3-4)
- [ ] Port EstimatorV2 components to cms_rebuild
- [ ] Create `/estimate` public route
- [ ] Implement lead capture flow
- [ ] Add lead → CRM integration (Module 36)

### Phase 3: Catalog Integration (Week 5-6)
- [ ] Build catalog management UI
- [ ] Integrate catalog with selections (Module 21)
- [ ] Add vendor pricing to catalog items
- [ ] Image upload and management

### Phase 4: Price Intelligence Hooks (Week 7-8)
- [ ] PO creation → price validation
- [ ] Invoice processing → price capture
- [ ] Selection confirmation → price recording
- [ ] AI suggestion endpoint

### Phase 5: Timeline Intelligence (Week 9-10)
- [ ] Task completion → timeline capture
- [ ] Duration prediction API
- [ ] Schedule integration
- [ ] Estimate timeline display

### Phase 6: Accuracy Tracking (Week 11-12)
- [ ] Project completion → accuracy capture
- [ ] Accuracy dashboard
- [ ] Model refinement based on actuals
- [ ] Feedback loop to estimator config

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lead conversion rate | 15%+ | Leads → Projects |
| Estimate accuracy | <10% variance | Estimated vs Actual |
| Price data freshness | <30 days avg | Latest price per item |
| Catalog coverage | 80%+ selections | Items with catalog entry |
| Timeline prediction accuracy | <15% variance | Predicted vs Actual duration |
| User adoption | 90%+ estimates use AI | AI suggestions accepted |

---

## Open Questions (Resolved)

| Question | Decision |
|----------|----------|
| Deployment model for estimator | Embedded in cms_rebuild + embeddable widget |
| Data architecture | Single Supabase project (migrate Live Price DB) |
| Lead-to-project flow | Create "prospect project" on qualification |
| Material catalog priority | Port immediately as foundation for Module 21 |
| Pricing database scope | Use Live Price DB as MVP, enhance per Module 23 spec |
| Timeline data | Capture with every task completion |

---

*Document created: 2026-02-20*
*Last updated: 2026-02-20*
