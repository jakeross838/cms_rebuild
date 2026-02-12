# RossOS Document Intelligence Architecture

## Overview

Every document that enters RossOS becomes a source of structured intelligence. This document defines:
1. What data we extract from each document type
2. How extracted data is stored and organized
3. How that data feeds other system modules
4. Confidence scoring and human review workflows

---

## Document Categories

### 1. Financial Documents
- Vendor Invoices
- Bids/Quotes
- AIA Pay Applications (G702/G703)
- Lien Waivers
- Contracts & Change Orders

### 2. Insurance & Compliance
- Certificates of Insurance (COIs)
- Permits
- Inspection Reports
- Licenses

### 3. Construction Documents
- Plans/Drawings (PDF/DWG)
- Specifications
- Engineering Reports
- Product Submittals

### 4. Project Documentation
- Daily Logs (voice/text)
- Photos
- RFIs
- Meeting Minutes

---

## 1. VENDOR INVOICES

### Extraction Fields

| Field | Type | Confidence Target | Extraction Method |
|-------|------|-------------------|-------------------|
| vendor_name | string | 95%+ | OCR + fuzzy match to vendor database |
| vendor_address | string | 90%+ | OCR + address parsing |
| invoice_number | string | 98%+ | OCR + pattern matching |
| invoice_date | date | 98%+ | OCR + date parsing |
| due_date | date | 95%+ | OCR or calculate from terms |
| payment_terms | string | 90%+ | OCR (Net 30, etc.) |
| total_amount | decimal | 99%+ | OCR + validation |
| subtotal | decimal | 95%+ | OCR |
| tax_amount | decimal | 95%+ | OCR or calculate |
| line_items[] | array | 85%+ | OCR + table extraction |
| - description | string | 85%+ | OCR |
| - quantity | decimal | 90%+ | OCR |
| - unit | string | 85%+ | OCR (ea, sf, lf, etc.) |
| - unit_price | decimal | 95%+ | OCR |
| - line_total | decimal | 95%+ | OCR or calculate |
| po_reference | string | 80%+ | OCR + pattern matching |
| job_reference | string | 75%+ | OCR + fuzzy match |
| remit_to_address | string | 90%+ | OCR |

### Storage Schema

```sql
-- Primary invoice record
CREATE TABLE extracted_invoices (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  vendor_id UUID REFERENCES vendors(id),
  job_id UUID REFERENCES jobs(id),
  po_id UUID REFERENCES purchase_orders(id),

  -- Extracted fields
  invoice_number TEXT,
  invoice_date DATE,
  due_date DATE,
  payment_terms TEXT,
  subtotal DECIMAL(12,2),
  tax_amount DECIMAL(12,2),
  total_amount DECIMAL(12,2),

  -- Matching metadata
  vendor_match_confidence DECIMAL(3,2),
  job_match_confidence DECIMAL(3,2),
  po_match_confidence DECIMAL(3,2),
  overall_confidence DECIMAL(3,2),

  -- Review status
  needs_review BOOLEAN DEFAULT true,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,

  -- Raw extraction
  raw_extraction JSONB,
  extraction_model TEXT,
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Line items
CREATE TABLE extracted_invoice_lines (
  id UUID PRIMARY KEY,
  extracted_invoice_id UUID REFERENCES extracted_invoices(id),
  line_number INTEGER,
  description TEXT,
  quantity DECIMAL(12,4),
  unit TEXT,
  unit_price DECIMAL(12,4),
  line_total DECIMAL(12,2),

  -- Cost code matching
  suggested_cost_code_id UUID REFERENCES cost_codes(id),
  cost_code_confidence DECIMAL(3,2),

  -- For price intelligence
  normalized_description TEXT,
  material_category TEXT,
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Data Flow to Other Modules

```
INVOICE EXTRACTION
       │
       ├──► VENDOR INTELLIGENCE
       │    - Price history per vendor
       │    - Invoice accuracy (vs PO amounts)
       │    - Payment term patterns
       │
       ├──► COST INTELLIGENCE
       │    - Unit prices by material/trade
       │    - Price trends over time
       │    - Regional pricing data
       │
       ├──► BUDGET MODULE
       │    - Actual costs vs budget
       │    - Cost code spending
       │    - Variance tracking
       │
       ├──► ACCOUNTS PAYABLE
       │    - Auto-create payable
       │    - Match to PO
       │    - Flag variances
       │
       └──► ESTIMATING FEEDBACK
            - Actual vs estimated prices
            - Improve future estimates
```

### Triggers & Automation

| Trigger | Action | Confidence Threshold |
|---------|--------|---------------------|
| Invoice uploaded | Extract all fields | N/A |
| Vendor matched | Link to vendor record | 90%+ auto, <90% review |
| PO matched | Compare to PO amounts | 85%+ auto |
| Line items extracted | Suggest cost codes | 80%+ auto-suggest |
| All fields extracted | Create AP entry | 95%+ overall auto |

---

## 2. BIDS & QUOTES

### Extraction Fields

| Field | Type | Confidence Target | Extraction Method |
|-------|------|-------------------|-------------------|
| vendor_name | string | 95%+ | OCR + vendor matching |
| bid_date | date | 95%+ | OCR + date parsing |
| valid_until | date | 85%+ | OCR or infer (30/60 days) |
| total_price | decimal | 99%+ | OCR + validation |
| scope_description | text | 80%+ | OCR + NLP summarization |
| scope_items[] | array | 75%+ | NLP extraction |
| exclusions[] | array | 85%+ | NLP extraction (critical!) |
| inclusions[] | array | 80%+ | NLP extraction |
| assumptions[] | array | 80%+ | NLP extraction |
| line_items[] | array | 85%+ | Table extraction |
| - item_description | string | 85%+ | OCR |
| - quantity | decimal | 90%+ | OCR |
| - unit | string | 85%+ | OCR |
| - unit_price | decimal | 95%+ | OCR |
| - line_total | decimal | 95%+ | OCR |
| payment_terms | string | 85%+ | OCR |
| lead_time | string | 80%+ | NLP extraction |
| warranty_info | string | 75%+ | NLP extraction |

### Storage Schema

```sql
-- Primary bid record
CREATE TABLE extracted_bids (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  bid_request_id UUID REFERENCES bid_requests(id),
  vendor_id UUID REFERENCES vendors(id),
  job_id UUID REFERENCES jobs(id),

  -- Extracted fields
  bid_date DATE,
  valid_until DATE,
  total_price DECIMAL(12,2),
  scope_summary TEXT,
  payment_terms TEXT,
  lead_time_days INTEGER,
  warranty_months INTEGER,

  -- Structured scope analysis
  inclusions JSONB,
  exclusions JSONB,
  assumptions JSONB,

  -- AI analysis
  scope_completeness_score DECIMAL(3,2),
  missing_scope_items JSONB,
  price_vs_historical DECIMAL(5,2), -- percentage variance

  -- Confidence
  overall_confidence DECIMAL(3,2),
  needs_review BOOLEAN DEFAULT true,

  raw_extraction JSONB,
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bid line items
CREATE TABLE extracted_bid_lines (
  id UUID PRIMARY KEY,
  extracted_bid_id UUID REFERENCES extracted_bids(id),
  description TEXT,
  quantity DECIMAL(12,4),
  unit TEXT,
  unit_price DECIMAL(12,4),
  line_total DECIMAL(12,2),

  -- Cost intelligence
  cost_code_id UUID REFERENCES cost_codes(id),
  historical_avg_price DECIMAL(12,4),
  price_variance_pct DECIMAL(5,2),

  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scope items (normalized for comparison)
CREATE TABLE bid_scope_items (
  id UUID PRIMARY KEY,
  extracted_bid_id UUID REFERENCES extracted_bids(id),
  scope_type TEXT, -- 'inclusion', 'exclusion', 'assumption'
  item_text TEXT,
  normalized_item TEXT, -- AI-normalized for comparison
  category TEXT, -- 'labor', 'material', 'permit', 'equipment', etc.
  is_standard BOOLEAN, -- Is this typically included?

  extracted_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Data Flow to Other Modules

```
BID EXTRACTION
       │
       ├──► BID COMPARISON
       │    - Side-by-side scope analysis
       │    - Leveled pricing (add missing items)
       │    - Exclusion highlighting
       │
       ├──► COST INTELLIGENCE
       │    - Unit prices by trade/vendor
       │    - ALL bid prices (not just winners)
       │    - Market rate tracking
       │
       ├──► VENDOR INTELLIGENCE
       │    - Bid responsiveness
       │    - Price competitiveness
       │    - Scope thoroughness
       │
       ├──► ESTIMATING
       │    - Budget validation
       │    - Assembly pricing updates
       │    - Similar job comparisons
       │
       └──► PURCHASE ORDERS
            - Auto-generate PO from awarded bid
            - Include all scope items
```

### AI Analysis on Extraction

```javascript
// Scope completeness check
const scopeAnalysis = {
  expectedItems: [
    "Labor",
    "Materials",
    "Permits",
    "Equipment/tools",
    "Cleanup/disposal",
    "Warranty"
  ],
  missingItems: ["Permits", "Cleanup"],
  completenessScore: 0.67,
  recommendation: "Ask vendor to clarify permit responsibility and cleanup"
};

// Price analysis
const priceAnalysis = {
  totalBid: 12450,
  historicalAverage: 11500,
  variancePercent: 8.26,
  marketRate: 11800,
  assessment: "Above market (+5.5%), investigate scope differences"
};
```

---

## 3. AIA PAY APPLICATIONS (G702/G703)

### Extraction Fields

| Field | Type | Confidence Target | Notes |
|-------|------|-------------------|-------|
| application_number | integer | 99%+ | From G702 header |
| period_to | date | 99%+ | Billing period end |
| contract_sum | decimal | 99%+ | Original + changes |
| total_completed | decimal | 99%+ | To date |
| retainage | decimal | 99%+ | Held back |
| current_payment_due | decimal | 99%+ | This draw |
| schedule_of_values[] | array | 90%+ | G703 line items |
| - item_number | string | 95%+ | SOV line # |
| - description | string | 90%+ | Work description |
| - scheduled_value | decimal | 95%+ | Contract amount |
| - previous_completed | decimal | 95%+ | Previous % |
| - this_period | decimal | 95%+ | Current % or $ |
| - stored_materials | decimal | 90%+ | Materials on site |
| - total_completed | decimal | 95%+ | To date |
| - balance_to_finish | decimal | 95%+ | Remaining |
| - retainage | decimal | 95%+ | Held |

### Storage Schema

```sql
CREATE TABLE extracted_pay_applications (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  job_id UUID REFERENCES jobs(id),
  vendor_id UUID REFERENCES vendors(id), -- if from sub

  application_number INTEGER,
  period_to DATE,

  original_contract_sum DECIMAL(12,2),
  change_orders_total DECIMAL(12,2),
  contract_sum DECIMAL(12,2),

  total_completed_to_date DECIMAL(12,2),
  total_completed_pct DECIMAL(5,2),
  retainage_pct DECIMAL(5,2),
  retainage_amount DECIMAL(12,2),

  previous_certificates DECIMAL(12,2),
  current_payment_due DECIMAL(12,2),

  -- Validation
  is_balanced BOOLEAN,
  discrepancies JSONB,

  overall_confidence DECIMAL(3,2),
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE extracted_sov_lines (
  id UUID PRIMARY KEY,
  pay_application_id UUID REFERENCES extracted_pay_applications(id),

  item_number TEXT,
  description TEXT,
  scheduled_value DECIMAL(12,2),

  previous_completed_pct DECIMAL(5,2),
  previous_completed_amt DECIMAL(12,2),

  this_period_pct DECIMAL(5,2),
  this_period_amt DECIMAL(12,2),

  stored_materials DECIMAL(12,2),

  total_completed_pct DECIMAL(5,2),
  total_completed_amt DECIMAL(12,2),

  balance_to_finish DECIMAL(12,2),
  retainage DECIMAL(12,2),

  -- Mapping
  cost_code_id UUID REFERENCES cost_codes(id),
  budget_line_id UUID REFERENCES budget_lines(id),

  extracted_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Data Flow

```
PAY APP EXTRACTION
       │
       ├──► DRAW MANAGEMENT
       │    - Verify % complete claims
       │    - Compare to field observations
       │    - Auto-populate draw request
       │
       ├──► BUDGET MODULE
       │    - Update committed costs
       │    - Track subcontractor progress
       │    - Forecast remaining costs
       │
       ├──► SCHEDULE MODULE
       │    - % complete by trade
       │    - Progress verification
       │
       └──► CASH FLOW
            - Payment timing
            - Retainage tracking
```

---

## 4. LIEN WAIVERS

### Extraction Fields

| Field | Type | Confidence Target | Notes |
|-------|------|-------------------|-------|
| waiver_type | enum | 95%+ | Conditional/Unconditional, Progress/Final |
| vendor_name | string | 95%+ | Claimant |
| claimant_signature | boolean | 99%+ | Was it signed? |
| signature_date | date | 95%+ | When signed |
| through_date | date | 95%+ | Work covered through |
| payment_amount | decimal | 95%+ | Amount being waived |
| job_address | string | 90%+ | Property address |
| owner_name | string | 85%+ | Property owner |
| notarized | boolean | 95%+ | Has notary stamp? |
| notary_date | date | 90%+ | If notarized |
| exceptions | text | 80%+ | Any exceptions noted |

### Storage Schema

```sql
CREATE TABLE extracted_lien_waivers (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  vendor_id UUID REFERENCES vendors(id),
  job_id UUID REFERENCES jobs(id),
  invoice_id UUID REFERENCES invoices(id),
  payment_id UUID REFERENCES payments(id),

  waiver_type TEXT, -- 'conditional_progress', 'unconditional_progress',
                    -- 'conditional_final', 'unconditional_final'

  claimant_name TEXT,
  is_signed BOOLEAN,
  signature_date DATE,
  through_date DATE,
  payment_amount DECIMAL(12,2),

  property_address TEXT,
  owner_name TEXT,

  is_notarized BOOLEAN,
  notary_date DATE,
  notary_name TEXT,

  exceptions_noted TEXT,
  has_exceptions BOOLEAN,

  -- Validation
  matches_payment_amount BOOLEAN,
  date_coverage_valid BOOLEAN,

  overall_confidence DECIMAL(3,2),
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Data Flow

```
LIEN WAIVER EXTRACTION
       │
       ├──► PAYMENT PROCESSING
       │    - Gate: no payment without valid waiver
       │    - Match waiver to payment amount
       │    - Track conditional → unconditional
       │
       ├──► DRAW MANAGEMENT
       │    - Collect all sub waivers for draw
       │    - Track missing waivers
       │    - Alert on expired/missing
       │
       ├──► COMPLIANCE DASHBOARD
       │    - Waiver coverage report
       │    - Gap identification
       │    - Risk scoring
       │
       └──► VENDOR INTELLIGENCE
            - Waiver submission timeliness
            - Exception patterns
```

---

## 5. CERTIFICATES OF INSURANCE (COIs)

### Extraction Fields

| Field | Type | Confidence Target | Notes |
|-------|------|-------------------|-------|
| insured_name | string | 95%+ | Vendor name |
| producer_name | string | 90%+ | Insurance agency |
| policy_number | string | 95%+ | For each coverage type |
| effective_date | date | 98%+ | Coverage start |
| expiration_date | date | 98%+ | Coverage end |
| general_liability_limit | decimal | 95%+ | Per occurrence |
| general_liability_aggregate | decimal | 95%+ | Total limit |
| auto_liability_limit | decimal | 95%+ | Combined single limit |
| umbrella_limit | decimal | 90%+ | Excess coverage |
| workers_comp_limit | decimal | 95%+ | Each accident |
| certificate_holder | string | 90%+ | Should be Builder Name |
| additional_insured | boolean | 95%+ | Are we listed? |
| additional_insured_text | text | 85%+ | Endorsement details |
| waiver_of_subrogation | boolean | 90%+ | WOS included? |

### Storage Schema

```sql
CREATE TABLE extracted_cois (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  vendor_id UUID REFERENCES vendors(id),

  insured_name TEXT,
  producer_name TEXT,
  producer_phone TEXT,

  effective_date DATE,
  expiration_date DATE,

  -- Coverage amounts
  gl_each_occurrence DECIMAL(12,2),
  gl_aggregate DECIMAL(12,2),
  gl_products_completed DECIMAL(12,2),
  gl_personal_injury DECIMAL(12,2),
  gl_policy_number TEXT,

  auto_combined_single DECIMAL(12,2),
  auto_policy_number TEXT,

  umbrella_each_occurrence DECIMAL(12,2),
  umbrella_aggregate DECIMAL(12,2),
  umbrella_policy_number TEXT,

  wc_each_accident DECIMAL(12,2),
  wc_disease_each DECIMAL(12,2),
  wc_disease_policy DECIMAL(12,2),
  wc_policy_number TEXT,

  -- Special endorsements
  certificate_holder TEXT,
  is_additional_insured BOOLEAN,
  has_waiver_of_subrogation BOOLEAN,

  -- Validation against requirements
  meets_gl_requirement BOOLEAN,
  meets_auto_requirement BOOLEAN,
  meets_umbrella_requirement BOOLEAN,
  meets_wc_requirement BOOLEAN,
  meets_additional_insured BOOLEAN,

  compliance_issues JSONB,
  overall_compliance BOOLEAN,

  -- Alert tracking
  expiration_alert_30_sent BOOLEAN,
  expiration_alert_14_sent BOOLEAN,
  expiration_alert_7_sent BOOLEAN,

  overall_confidence DECIMAL(3,2),
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Data Flow

```
COI EXTRACTION
       │
       ├──► VENDOR COMPLIANCE
       │    - Validate against requirements
       │    - Flag insufficient coverage
       │    - Track expiration dates
       │
       ├──► VENDOR INTELLIGENCE
       │    - Insurance reliability score
       │    - Renewal timeliness
       │    - Coverage quality
       │
       ├──► ALERTS & REMINDERS
       │    - 30/14/7 day expiration alerts
       │    - Notify vendor to renew
       │    - Block POs if expired
       │
       └──► JOB COMPLIANCE
            - All vendors on job have valid COI?
            - Draw documentation
            - Risk management
```

---

## 6. CONSTRUCTION PLANS (PDF/DWG)

### Extraction Fields

| Field | Type | Confidence Target | Notes |
|-------|------|-------------------|-------|
| sheet_number | string | 95%+ | A-1.0, S-2.1, etc. |
| sheet_title | string | 90%+ | "First Floor Plan" |
| discipline | enum | 95%+ | Architectural, Structural, MEP, etc. |
| revision_number | string | 90%+ | Current revision |
| revision_date | date | 90%+ | When revised |
| scale | string | 85%+ | 1/4" = 1'-0" |
| drawn_by | string | 80%+ | Initials |
| checked_by | string | 80%+ | Initials |
| project_name | string | 90%+ | From title block |
| project_address | string | 85%+ | From title block |
| square_footage | decimal | 75%+ | If noted |
| room_schedule | array | 70%+ | Room names/sizes |
| door_schedule | array | 75%+ | Door types/sizes |
| window_schedule | array | 75%+ | Window types/sizes |
| finish_schedule | array | 70%+ | Materials/finishes |
| structural_members | array | 70%+ | Beam sizes, etc. |
| notes | array | 80%+ | General notes |

### Storage Schema

```sql
CREATE TABLE extracted_plan_sheets (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  job_id UUID REFERENCES jobs(id),
  plan_set_id UUID, -- Groups sheets into sets

  sheet_number TEXT,
  sheet_title TEXT,
  discipline TEXT,

  revision_number TEXT,
  revision_date DATE,
  is_current BOOLEAN DEFAULT true,

  scale TEXT,
  drawn_by TEXT,
  checked_by TEXT,

  -- Title block info
  project_name TEXT,
  project_address TEXT,
  architect TEXT,
  engineer TEXT,

  -- AI-extracted quantities
  estimated_sf DECIMAL(10,2),
  room_count INTEGER,

  -- Extracted schedules (as JSONB for flexibility)
  room_schedule JSONB,
  door_schedule JSONB,
  window_schedule JSONB,
  finish_schedule JSONB,

  -- Extracted notes
  general_notes JSONB,

  -- For AI analysis
  has_been_analyzed BOOLEAN DEFAULT false,
  analysis_results JSONB,

  overall_confidence DECIMAL(3,2),
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Detailed schedule items
CREATE TABLE plan_schedule_items (
  id UUID PRIMARY KEY,
  plan_sheet_id UUID REFERENCES extracted_plan_sheets(id),
  schedule_type TEXT, -- 'door', 'window', 'room', 'finish'

  item_mark TEXT, -- D1, W2, etc.
  description TEXT,
  size TEXT,
  material TEXT,
  finish TEXT,
  manufacturer TEXT,
  model TEXT,
  quantity INTEGER,
  notes TEXT,

  -- For estimating
  cost_code_id UUID REFERENCES cost_codes(id),

  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revision tracking
CREATE TABLE plan_revisions (
  id UUID PRIMARY KEY,
  plan_set_id UUID,
  revision_number TEXT,
  revision_date DATE,
  description TEXT,
  sheets_affected TEXT[],

  -- AI analysis of changes
  change_summary TEXT,
  cost_impact_estimate DECIMAL(12,2),
  schedule_impact_days INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Data Flow

```
PLAN EXTRACTION
       │
       ├──► ESTIMATING
       │    - Pre-populate quantities
       │    - Door/window/room counts
       │    - SF calculations
       │    - Material schedules
       │
       ├──► SELECTIONS
       │    - Door styles needed
       │    - Window sizes for ordering
       │    - Finish allowances
       │
       ├──► RFIs
       │    - Auto-link RFI to sheet
       │    - Show relevant details
       │    - Track revision changes
       │
       ├──► CHANGE ORDERS
       │    - Compare revisions
       │    - Identify changes
       │    - Cost impact analysis
       │
       └──► DOCUMENT MANAGEMENT
            - Auto-organize by discipline
            - Version control
            - Supersede old revisions
```

---

## 7. DAILY LOGS (Voice & Text)

### Extraction Fields

| Field | Type | Confidence Target | Notes |
|-------|------|-------------------|-------|
| log_date | date | 99%+ | Date of work |
| weather | object | 95%+ | Temp, conditions, wind |
| work_performed[] | array | 85%+ | Activities completed |
| - description | string | 85%+ | What was done |
| - location | string | 80%+ | Where on site |
| - trade | string | 90%+ | Who did it |
| manpower[] | array | 90%+ | People on site |
| - vendor_name | string | 85%+ | Company |
| - count | integer | 95%+ | Number of workers |
| - hours | decimal | 90%+ | Hours worked |
| equipment[] | array | 80%+ | Equipment used |
| deliveries[] | array | 85%+ | Materials received |
| visitors[] | array | 80%+ | Inspectors, owners, etc. |
| issues[] | array | 85%+ | Problems encountered |
| - description | string | 85%+ | Issue details |
| - severity | enum | 80%+ | Low/Medium/High |
| - resolution | string | 75%+ | How resolved |
| delays[] | array | 90%+ | Any delays |
| - cause | string | 85%+ | Weather, material, etc. |
| - duration | string | 85%+ | How long |
| safety_incidents | boolean | 99%+ | Any incidents? |
| photos_referenced | array | 80%+ | Photos from that day |

### Storage Schema

```sql
CREATE TABLE extracted_daily_logs (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  job_id UUID REFERENCES jobs(id),
  submitted_by UUID REFERENCES users(id),

  log_date DATE,

  -- Weather
  weather_temp_high INTEGER,
  weather_temp_low INTEGER,
  weather_conditions TEXT,
  weather_wind TEXT,
  weather_precipitation TEXT,

  -- Summary
  work_summary TEXT,

  -- Flags
  has_safety_incident BOOLEAN DEFAULT false,
  has_delays BOOLEAN DEFAULT false,
  has_issues BOOLEAN DEFAULT false,

  -- Voice specific
  original_audio_url TEXT,
  transcription TEXT,
  transcription_confidence DECIMAL(3,2),

  -- AI-generated
  ai_summary TEXT,
  ai_sentiment TEXT, -- positive, neutral, concerning

  overall_confidence DECIMAL(3,2),
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_log_activities (
  id UUID PRIMARY KEY,
  daily_log_id UUID REFERENCES extracted_daily_logs(id),

  activity_type TEXT, -- 'work', 'delivery', 'inspection', 'visitor'
  description TEXT,
  location TEXT,

  -- If work
  trade TEXT,
  vendor_id UUID REFERENCES vendors(id),

  -- If delivery
  material_type TEXT,
  quantity TEXT,

  -- For schedule updates
  schedule_task_id UUID REFERENCES schedule_tasks(id),
  percent_complete DECIMAL(5,2),

  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_log_manpower (
  id UUID PRIMARY KEY,
  daily_log_id UUID REFERENCES extracted_daily_logs(id),

  vendor_id UUID REFERENCES vendors(id),
  vendor_name TEXT, -- If can't match
  worker_count INTEGER,
  hours_worked DECIMAL(4,1),

  -- For labor tracking
  trade TEXT,

  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_log_issues (
  id UUID PRIMARY KEY,
  daily_log_id UUID REFERENCES extracted_daily_logs(id),

  issue_type TEXT, -- 'safety', 'quality', 'delay', 'coordination', 'weather'
  description TEXT,
  severity TEXT, -- 'low', 'medium', 'high', 'critical'

  responsible_vendor_id UUID REFERENCES vendors(id),

  is_resolved BOOLEAN DEFAULT false,
  resolution TEXT,

  -- Impacts
  schedule_impact_days INTEGER,
  cost_impact DECIMAL(12,2),

  -- Follow-up
  requires_rfi BOOLEAN DEFAULT false,
  rfi_id UUID REFERENCES rfis(id),
  requires_change_order BOOLEAN DEFAULT false,
  change_order_id UUID REFERENCES change_orders(id),

  extracted_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Data Flow

```
DAILY LOG EXTRACTION
       │
       ├──► SCHEDULE MODULE
       │    - Auto-update task progress
       │    - Track delays
       │    - Weather documentation
       │
       ├──► VENDOR INTELLIGENCE
       │    - Manpower tracking
       │    - Attendance patterns
       │    - Issue attribution
       │
       ├──► LABOR INTELLIGENCE
       │    - Hours by trade
       │    - Productivity metrics
       │    - Crew size patterns
       │
       ├──► CLIENT PORTAL
       │    - AI-curated weekly summary
       │    - Progress narrative
       │    - Photo highlights
       │
       ├──► ISSUE TRACKING
       │    - Auto-create issues
       │    - Track resolution
       │    - Pattern detection
       │
       └──► PROJECT INTELLIGENCE
            - Build historical patterns
            - Improve future estimates
            - Learn durations by trade
```

---

## 8. PHOTOS

### Extraction Fields

| Field | Type | Confidence Target | Notes |
|-------|------|-------------------|-------|
| capture_date | datetime | 99%+ | EXIF data |
| gps_location | coords | 90%+ | EXIF if available |
| camera_device | string | 95%+ | EXIF data |
| scene_classification | string | 85%+ | AI vision: "framing", "electrical", etc. |
| quality_score | decimal | 90%+ | Blur, lighting, composition |
| contains_people | boolean | 95%+ | Workers in shot |
| contains_safety_issue | boolean | 75%+ | Missing PPE, hazards |
| construction_phase | string | 80%+ | Foundation, framing, etc. |
| room_location | string | 70%+ | Kitchen, master bath, etc. |
| trade_visible | string | 75%+ | Electrical, plumbing, etc. |
| milestone_significance | boolean | 80%+ | Is this a key milestone? |
| duplicate_of | uuid | 95%+ | Similar existing photo |

### Storage Schema

```sql
CREATE TABLE extracted_photos (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  job_id UUID REFERENCES jobs(id),
  daily_log_id UUID REFERENCES daily_logs(id),

  -- EXIF data
  captured_at TIMESTAMPTZ,
  gps_latitude DECIMAL(10,7),
  gps_longitude DECIMAL(10,7),
  camera_make TEXT,
  camera_model TEXT,

  -- AI classification
  scene_type TEXT, -- 'foundation', 'framing', 'rough_in', 'drywall', etc.
  construction_phase TEXT,
  room_location TEXT,
  trade_visible TEXT,

  -- Quality metrics
  quality_score DECIMAL(3,2), -- 0-1
  is_blurry BOOLEAN,
  has_good_lighting BOOLEAN,
  composition_score DECIMAL(3,2),

  -- Content detection
  contains_people BOOLEAN,
  people_count INTEGER,
  contains_safety_concern BOOLEAN,
  safety_concern_details TEXT,

  -- Organization
  is_milestone_photo BOOLEAN,
  suggested_caption TEXT,
  auto_tags TEXT[],

  -- Duplicate detection
  perceptual_hash TEXT,
  is_duplicate BOOLEAN DEFAULT false,
  duplicate_of_id UUID REFERENCES extracted_photos(id),

  -- Client portal
  is_client_visible BOOLEAN DEFAULT false,
  client_visibility_reason TEXT,

  overall_confidence DECIMAL(3,2),
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Data Flow

```
PHOTO EXTRACTION
       │
       ├──► DAILY LOGS
       │    - Auto-attach by date
       │    - Activity correlation
       │
       ├──► CLIENT PORTAL
       │    - Quality filtering
       │    - AI curation for client
       │    - Timeline organization
       │
       ├──► PROGRESS TRACKING
       │    - Visual % complete
       │    - Milestone documentation
       │
       ├──► DRAW DOCUMENTATION
       │    - Progress evidence
       │    - Completion verification
       │
       ├──► SAFETY MONITORING
       │    - PPE compliance
       │    - Hazard detection
       │
       └──► PROJECT INTELLIGENCE
            - Phase duration visuals
            - Quality patterns
```

---

## 9. PERMITS

### Extraction Fields

| Field | Type | Confidence Target | Notes |
|-------|------|-------------------|-------|
| permit_number | string | 98%+ | Official permit # |
| permit_type | enum | 95%+ | Building, electrical, plumbing, etc. |
| issued_date | date | 98%+ | When issued |
| expiration_date | date | 95%+ | When expires |
| jurisdiction | string | 90%+ | City/County |
| property_address | string | 95%+ | Job address |
| scope_of_work | text | 85%+ | Permitted work |
| valuation | decimal | 90%+ | Project value |
| fees_paid | decimal | 95%+ | Permit fees |
| contractor_of_record | string | 90%+ | Licensed contractor |
| license_number | string | 95%+ | Contractor license |
| inspections_required | array | 85%+ | Required inspections |
| conditions | array | 80%+ | Special conditions |
| status | enum | 95%+ | Active, expired, final |

### Storage Schema

```sql
CREATE TABLE extracted_permits (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  job_id UUID REFERENCES jobs(id),

  permit_number TEXT,
  permit_type TEXT,

  issued_date DATE,
  expiration_date DATE,

  jurisdiction TEXT,
  jurisdiction_phone TEXT,

  property_address TEXT,
  parcel_number TEXT,

  scope_of_work TEXT,
  project_valuation DECIMAL(12,2),
  fees_paid DECIMAL(10,2),

  contractor_name TEXT,
  contractor_license TEXT,

  -- Status
  status TEXT, -- 'active', 'expired', 'final', 'revoked'
  final_date DATE,

  -- Conditions
  special_conditions JSONB,

  overall_confidence DECIMAL(3,2),
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE permit_inspections_required (
  id UUID PRIMARY KEY,
  permit_id UUID REFERENCES extracted_permits(id),

  inspection_type TEXT,
  is_required BOOLEAN,
  is_completed BOOLEAN DEFAULT false,
  completed_date DATE,
  result TEXT,
  inspector_name TEXT,
  notes TEXT,

  -- Schedule integration
  schedule_task_id UUID REFERENCES schedule_tasks(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Data Flow

```
PERMIT EXTRACTION
       │
       ├──► SCHEDULE MODULE
       │    - Required inspections as tasks
       │    - Expiration tracking
       │    - Renewal reminders
       │
       ├──► COMPLIANCE DASHBOARD
       │    - Active permit tracking
       │    - Inspection status
       │    - Expiration alerts
       │
       ├──► JOB SETUP
       │    - Auto-populate permit info
       │    - Verify address match
       │
       └──► DRAW MANAGEMENT
            - Permit verification for draws
            - Inspection sign-off tracking
```

---

## 10. CONTRACTS & CHANGE ORDERS

### Extraction Fields

**Contract:**
| Field | Type | Confidence Target | Notes |
|-------|------|-------------------|-------|
| contract_type | enum | 95%+ | AIA, cost-plus, fixed, T&M |
| contract_date | date | 98%+ | Execution date |
| parties[] | array | 90%+ | Owner, contractor, etc. |
| contract_sum | decimal | 99%+ | Original amount |
| scope_of_work | text | 85%+ | Work description |
| payment_terms | text | 85%+ | How/when paid |
| retainage_percent | decimal | 95%+ | Held back % |
| start_date | date | 90%+ | Commencement |
| completion_date | date | 90%+ | Substantial completion |
| allowances[] | array | 85%+ | Named allowances |
| signatures[] | array | 95%+ | Who signed |

**Change Order:**
| Field | Type | Confidence Target | Notes |
|-------|------|-------------------|-------|
| co_number | integer | 99%+ | Sequential number |
| description | text | 90%+ | Change description |
| reason | enum | 85%+ | Owner request, unforeseen, etc. |
| cost_change | decimal | 99%+ | +/- amount |
| time_change | integer | 95%+ | Days added/removed |
| new_contract_sum | decimal | 99%+ | Updated total |
| new_completion_date | date | 95%+ | Updated date |
| signatures[] | array | 95%+ | Approvals |
| attachments_referenced | array | 80%+ | Supporting docs |

### Storage Schema

```sql
CREATE TABLE extracted_contracts (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  job_id UUID REFERENCES jobs(id),
  client_id UUID REFERENCES clients(id),

  contract_type TEXT,
  contract_date DATE,

  owner_name TEXT,
  owner_signature_date DATE,
  contractor_name TEXT,
  contractor_signature_date DATE,

  original_contract_sum DECIMAL(12,2),
  current_contract_sum DECIMAL(12,2), -- With COs

  scope_summary TEXT,

  payment_terms TEXT,
  retainage_percent DECIMAL(5,2),

  start_date DATE,
  original_completion_date DATE,
  current_completion_date DATE, -- With COs

  liquidated_damages_per_day DECIMAL(10,2),

  -- Allowances
  allowances JSONB,
  total_allowances DECIMAL(12,2),

  overall_confidence DECIMAL(3,2),
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE extracted_change_orders (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  contract_id UUID REFERENCES extracted_contracts(id),
  job_id UUID REFERENCES jobs(id),

  co_number INTEGER,
  co_date DATE,

  description TEXT,
  reason TEXT, -- 'owner_request', 'unforeseen', 'design_change', 'code_requirement'

  cost_change DECIMAL(12,2),
  time_change_days INTEGER,

  previous_contract_sum DECIMAL(12,2),
  new_contract_sum DECIMAL(12,2),

  previous_completion_date DATE,
  new_completion_date DATE,

  -- Line items
  line_items JSONB,

  -- Approval tracking
  owner_approved BOOLEAN,
  owner_signature_date DATE,
  contractor_approved BOOLEAN,
  contractor_signature_date DATE,

  -- Related documents
  related_rfi_ids UUID[],
  related_asi_ids UUID[],

  overall_confidence DECIMAL(3,2),
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contract_allowances (
  id UUID PRIMARY KEY,
  contract_id UUID REFERENCES extracted_contracts(id),
  job_id UUID REFERENCES jobs(id),

  allowance_name TEXT,
  allowance_amount DECIMAL(12,2),
  cost_code_id UUID REFERENCES cost_codes(id),

  amount_used DECIMAL(12,2) DEFAULT 0,
  remaining DECIMAL(12,2),

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Data Flow

```
CONTRACT EXTRACTION
       │
       ├──► JOB SETUP
       │    - Auto-populate job values
       │    - Set milestones from dates
       │    - Configure allowances
       │
       ├──► BUDGET MODULE
       │    - Contract sum as ceiling
       │    - Allowance tracking
       │    - Retainage calculation
       │
       ├──► DRAW MANAGEMENT
       │    - Payment terms for draws
       │    - Retainage enforcement
       │
       └──► CHANGE ORDER TRACKING
            - Running contract sum
            - Time extensions
            - Approval workflow

CHANGE ORDER EXTRACTION
       │
       ├──► CONTRACT UPDATES
       │    - Update contract sum
       │    - Update completion date
       │
       ├──► BUDGET MODULE
       │    - Add/remove budget
       │    - Adjust cost codes
       │
       ├──► SCHEDULE MODULE
       │    - Time extensions
       │    - Milestone adjustments
       │
       ├──► COST INTELLIGENCE
       │    - CO pricing patterns
       │    - Common change types
       │
       └──► CLIENT PORTAL
            - CO approval workflow
            - Signature capture
```

---

## Confidence Scoring & Review Workflow

### Confidence Levels

| Level | Score | Action |
|-------|-------|--------|
| High | 95%+ | Auto-process, no review needed |
| Medium | 80-95% | Auto-process with flag for spot-check |
| Low | 60-80% | Require human review before processing |
| Very Low | <60% | Manual entry required, AI assists |

### Review Queue

```sql
CREATE TABLE extraction_review_queue (
  id UUID PRIMARY KEY,

  document_id UUID REFERENCES documents(id),
  extraction_type TEXT, -- 'invoice', 'bid', 'coi', etc.
  extraction_id UUID, -- FK to specific extraction table

  confidence_score DECIMAL(3,2),
  review_reason TEXT, -- Why it needs review

  flagged_fields JSONB, -- Which fields are uncertain
  ai_suggestions JSONB, -- What AI thinks they should be

  -- Assignment
  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,

  -- Resolution
  status TEXT DEFAULT 'pending', -- 'pending', 'in_review', 'approved', 'rejected'
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  corrections_made JSONB,

  -- Learning
  was_ai_correct BOOLEAN,
  feedback_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Learning from Corrections

Every human correction feeds back to improve extraction:

```sql
CREATE TABLE extraction_corrections (
  id UUID PRIMARY KEY,

  extraction_type TEXT,
  field_name TEXT,

  original_value TEXT,
  corrected_value TEXT,

  document_type TEXT,
  vendor_id UUID REFERENCES vendors(id),

  -- For pattern learning
  context JSONB, -- Surrounding text, document features

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example: Learning vendor name variations
-- If we extract "ABC Elec" but user corrects to "ABC Electric LLC"
-- System learns this variation for future documents
```

---

## Storage Architecture

### Document Storage

```
/documents
  /jobs
    /{job_id}
      /invoices
        /{invoice_id}/
          original.pdf
          extracted.json
          preview.png
      /bids
      /contracts
      /change_orders
      /permits
      /cois
      /lien_waivers
      /plans
        /architectural
        /structural
        /mep
        /civil
      /photos
        /{date}
      /daily_logs
      /rfis
      /submittals
```

### Database Organization

```
DOCUMENT TYPES               EXTRACTED DATA                    INTELLIGENCE
─────────────────           ──────────────────                ─────────────────
documents                   extracted_invoices                cost_intelligence
├─ invoices                 ├─ vendor_id ───────────────────► vendor_intelligence
├─ bids                     ├─ job_id ──────────────────────► project_intelligence
├─ contracts                └─ line_items                     labor_intelligence
├─ permits                                                    schedule_intelligence
├─ cois                     extracted_bids                    estimating_intelligence
├─ lien_waivers             ├─ scope_items
├─ plans                    ├─ exclusions
├─ photos                   └─ price_analysis
├─ daily_logs
└─ rfis                     extracted_daily_logs
                            ├─ activities
                            ├─ manpower
                            └─ issues
```

---

## Implementation Priority

### Phase 1: Core Financial (Highest ROI)
1. **Invoice Extraction** - Immediate time savings
2. **Lien Waiver Extraction** - Compliance automation
3. **COI Extraction** - Insurance compliance

### Phase 2: Bidding & Vendors
4. **Bid Extraction** - Better bid comparison
5. **Pay Application Extraction** - Sub management

### Phase 3: Project Documentation
6. **Daily Log Voice-to-Text** - Field productivity
7. **Photo Classification** - Organization & portal
8. **Plan Parsing** - Estimating automation

### Phase 4: Advanced
9. **Contract Extraction** - Job setup automation
10. **Change Order Extraction** - Budget/schedule updates
11. **Permit Extraction** - Compliance automation

---

## Integration Points Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DOCUMENT INTELLIGENCE HUB                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INPUTS                           OUTPUTS                                   │
│  ───────                          ────────                                  │
│  • Invoices ──────────────────► Cost Intelligence                          │
│  • Bids ──────────────────────► Vendor Intelligence                        │
│  • Daily Logs ────────────────► Labor Intelligence                         │
│  • Plans ─────────────────────► Estimating Intelligence                    │
│  • Photos ────────────────────► Schedule Intelligence                      │
│  • Contracts ─────────────────► Project Intelligence                       │
│  • Permits ───────────────────► Client Intelligence                        │
│  • COIs ──────────────────────► Compliance Tracking                        │
│  • Lien Waivers ──────────────► Payment Automation                         │
│                                                                             │
│  CROSS-MODULE FLOWS:                                                        │
│  ────────────────────                                                       │
│  Invoice → Budget (actual costs) → Estimate Feedback (accuracy)            │
│  Bid → PO → Invoice → Payment → Lien Waiver (full cycle tracking)          │
│  Daily Log → Schedule (progress) → Client Portal (narrative)               │
│  Plan → Estimate (quantities) → Budget (baseline) → Variance Analysis      │
│  Photo → Daily Log → Client Portal (curated) → Draw (evidence)             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

This architecture ensures that **every document** that enters the system contributes to the collective intelligence, making the system smarter with every transaction.
