# Module 23: Material & Labor Price Intelligence

**Phase:** 4 - Intelligence
**Status:** TODO
**Priority:** High (estimating accuracy enabler, direct cost savings)

---

## Overview

A price tracking and intelligence system that monitors material costs and subcontractor labor pricing over time, detects pricing anomalies, compares supplier pricing, forecasts cost escalation, optimizes purchasing decisions, and quantifies actual savings. Feeds directly into the estimating engine to improve cost accuracy and alerts builders to significant market changes that affect their project budgets.

The system layers on top of the existing invoice extraction pipeline. After line items are extracted, they flow into the pricing database. It combines internal procurement data (actual prices paid by the builder) with optional external market data to create a comprehensive pricing database that gets smarter with every purchase order, invoice, and vendor quote processed.

### The Problem (Real Example)

**Molinari Job — Ipe Decking Order**

| Vendor | Quote | vs. Budget |
|--------|-------|------------|
| Kimal Lumber *(ordered)* | $22,347 | +$7,497 (50% over) |
| Island Lumber | $15,617 | +$767 |
| **Advantage Lumber** | $13,758 | **-$1,092 under budget** |

**$8,589 left on the table** — on one line item, one job.

**What went wrong:**
1. PM called usual vendor (Kimal)
2. "Got another quote" from Island (still high)
3. Ordered without checking budget or other options
4. Discovered after material was on site

**What this system does:**
1. PM enters PO → system checks price database
2. Alert: "Advantage has this for $4.85/LF vs $7.89/LF"
3. Alert: "This exceeds budget by $7,497"
4. PM must acknowledge or switch before order goes out

### Estimated ROI

- 10 homes/year @ $2M avg = $20M revenue
- 40% materials = $8M material spend → 3-5% optimization = **$240K-$400K annual savings**
- 35% labor = $7M labor spend → 2% better buyouts = **$140K annual savings**
- **Combined potential: $380K-$540K annually**

---

## Gap Items Addressed

| Gap # | Description | Section |
|-------|-------------|---------|
| 387 | Vendor rate sheets (standing pricing agreements auto-populate POs) | Supplier Pricing |
| 491 | AI per-tenant vs. cross-tenant learning (with permission) | Data Strategy |
| 492 | AI model: shared with per-builder fine-tuning | Data Strategy |
| 493 | AI accuracy transparency (confidence based on data points) | Confidence Scoring |
| 494 | AI cold-start with industry benchmarks + regional data | Cold Start |
| 496 | AI data requirements communicated to user | Data Transparency |
| 497 | User feedback loop for wrong AI recommendations | Learning Loop |
| 501 | AI suggestions vs. AI automation (configurable per builder) | Automation Level |
| 502 | AI anomaly detection across platform | Anomaly Detection |
| 503 | AI transparency ("why did you recommend this?") | Explainability |

---

## Detailed Requirements

### 1. Material Category System (Organic Growth)

**Do not pre-define categories.** Categories and subcategories emerge as invoices/quotes are processed.

When AI encounters a new item, it suggests:
- **Category:** lumber, decking, trim, roofing, siding, electrical, plumbing, hardware, etc.
- **Subcategory:** composite, ipe, pvc, hardie, framing, baseboard, etc.
- **Manufacturer:** Trex, Azek, TimberTech, GAF, etc.
- **Product Line:** Transcend, Select, Timberline, etc.

Human confirms or adjusts. Catalog grows naturally from real purchases.

**Example Flow:**
```
Invoice line item: "TREX TRANSCEND 1X6X16 SPICED RUM"
        ↓
AI suggests:
  Category: decking
  Subcategory: composite
  Manufacturer: Trex
  Product Line: Transcend
  Standard Name: Trex Transcend 1x6x16 Spiced Rum
  Unit: each
  Dimensions: {length_in: 192, width_in: 5.5, thickness_in: 1}
        ↓
Human confirms → Master item created
        ↓
Next invoice with same item → Auto-matches
```

### 2. Unit Conversion System

Vendors quote differently — the system must normalize for comparison:
- Plywood: $45/sheet vs $1.40/sf
- Decking: $4.85/lf vs $8.50/sf
- Lumber: $8.50/each vs $0.85/bf

Dimensions stored on master items enable auto-calculation of all unit prices:
- Sheet goods: $/sheet ↔ $/sf
- Linear: $/each ↔ $/lf
- Decking/siding: $/lf ↔ $/sf
- Board feet: $/each ↔ $/bf
- Roofing: $/bundle ↔ $/square ↔ $/sf

UI provides a unit toggle so users can view any category in their preferred unit.

### 3. Item Normalization (AI + Human Hybrid)

Same item, different vendor descriptions:
- Island Lumber: `"2X4 8' SPF STUD"`
- 84 Lumber: `"2x4x8 Stud Grade SPF"`
- Home Depot: `"2 in. x 4 in. x 96 in. Stud"`
- Lowe's: `"2x4 STUD 8FT"`

**Matching algorithm (three-tier):**
1. **Cached exact match** — Check vendor_item_aliases for this vendor + description (confidence >= 0.95 → auto-match)
2. **Fuzzy match** — Compare against all known aliases for this vendor (score > 0.9 → auto-match)
3. **AI classification** — Claude classifies against existing master items, suggesting match or new item creation

Items with confidence < 0.85 are queued for human review. After ~500 confirmed mappings, AI accuracy should exceed 90%.

**Bootstrap strategy:**
1. Seed master catalog with ~200 common construction items
2. Process 3-6 months of historical invoices through AI classification
3. Build review queue UI for human confirmation
4. Accuracy improves organically as data accumulates

### 4. Material Price Tracking Over Time

- Every invoice and PO processed captures: material item, quantity, unit price, vendor, date, and project location
- Prices normalized by unit of measure ($/BF for lumber, $/SF for tile, $/LF for pipe)
- Historical price database builds automatically from builder's own transaction data
- Price timeline visualization showing cost trajectory per material over 3, 6, 12, 24 months
- Support for commodity-level prices (framing lumber, concrete, copper, steel rebar) and product-specific prices (specific tile SKU, specific fixture model)
- Special/promotional pricing detected and flagged (clearance, sale, credit) — excluded from comparison model unless user overrides

#### Edge Cases & What-If Scenarios

1. **One-time deep discount skewing historical averages.** When a builder receives a one-time negotiated discount (bulk purchase, promotional pricing, overstock clearance), the anomalously low price must not corrupt the pricing model. The system must allow users to flag individual transactions as "non-representative" and exclude them from model training. Excluded transactions remain visible in the price history timeline (marked with a tag) but are not factored into averages, trend calculations, or forecast models.

2. **New disruptive material entering the market.** When a previously unknown material appears in invoices or bids (e.g., a new composite product replacing traditional lumber), the system must support adding it to the material catalog on-the-fly. New materials start with zero historical data and receive platform-wide or regional benchmark pricing (if available) as a cold-start baseline. The system must prompt the user to confirm the material category and unit of measure so it is tracked correctly from the first transaction.

3. **Data quality validation to prevent model corruption.** The system must enforce validation rules on every price data point: unit price within configurable plausibility range per category (reject $0.50/BF lumber when average is $5.00/BF), quantity and unit internally consistent, duplicate invoice line items detected and deduplicated. Failed validations are quarantined for human review rather than silently ingested.

### 5. Price Anomaly Detection

- When an invoice or bid is received, compare unit price against:
  - This builder's historical average for this material
  - This vendor's historical pricing for this material
  - Platform-wide average (anonymized, if opted in)
  - Recent market trend direction
- Anomalies flagged with severity levels (Gap 502):
  - **Info**: Price is 10-20% above/below historical average
  - **Warning**: Price is 20-50% above/below historical average
  - **Alert**: Price is 50%+ above historical average or significantly below (possible error or quality concern)
- Each flag includes an explanation: "This price is 35% above your 6-month average of $X/unit for this material from this vendor" (Gap 503)
- Users can dismiss flags with a reason ("new product tier," "market increase," "negotiated bulk discount") which feeds the learning model (Gap 497)

### 6. Supplier Price Comparison

- For any material, show comparison of prices from all vendors who have supplied it
- Comparison includes: current price, historical average, last-quoted price, lead time, and quality notes
- Side-by-side vendor comparison for a specific material or bill of materials
- Price-to-quality ratio: vendors with higher prices but better quality scores (from Module 22) flagged as "premium" rather than "expensive"
- Support for vendor rate sheets: pre-negotiated pricing agreements that auto-populate PO line items and serve as the baseline for comparison (Gap 387)
- Tiered/quantity-break pricing supported (standard, bulk_100+, pallet)

### 7. Confidence Scoring

Every price data point and comparison carries a confidence score (0-100) based on:
- **Data points** (max 40 pts): More invoices/quotes = higher confidence
- **Recency** (max 30 pts): Data within 30 days = 30pts, 90 days = 20pts, 180 days = 10pts
- **Invoice weight** (max 20 pts): Actual purchases weighted higher than quotes
- **Stability** (max 10 pts): Low variance = more confidence

Human-readable strength labels:
- **Strong** (80+): Multiple recent invoices, stable pricing
- **Moderate** (50-79): Some data, reasonably recent
- **Weak** (25-49): Limited data or aging
- **Very Weak** (<25): Minimal data, proceed with caution

Warning flags: stale_data (>90 days), single_source (1 data point), quotes_only (no invoices)

### 8. Quote Ingestion (Bootstrap Mode)

To bootstrap the database quickly before invoices accumulate:
1. Request comprehensive quotes from each vendor
2. Upload/drag quote PDFs, Excel, or CSV into the system
3. AI extracts line items, matches to master catalog
4. Human reviews and confirms unmatched items
5. Immediately have comparison data

**Quote processing flow:** Upload → Select vendor → AI extract line items → Match to master catalog → Human review unmatched → Prices saved to history (source_type = 'quote')

### 9. PO Alert & Budget Gate System

When a PO is created or modified:
1. **Price check**: Compare PO line item prices against best known prices — alert if overpaying
2. **Budget check**: Compare PO total against remaining budget for that cost code — alert if over budget
3. **Required action**: PM must acknowledge alerts or switch vendors before PO approval

```
PO REVIEW REQUIRED:
- OVER BUDGET: Decking (6100)
  Budget: $14,850 | Committed: $11,200 | This Order: $8,500 | Over by: $4,850 (33%)
- BETTER PRICE AVAILABLE: Ipe 5/4x6
  Kimal: $7.89/LF → Advantage: $4.85/LF (Save $1,520)
  [Switch Vendor]  [Override with Reason]  [Cancel]
```

### 10. Material List Optimizer

Given a list of materials needed for a task or project:
1. Find best price per item across all known vendors
2. Calculate optimal vendor split (which items from which vendor)
3. Apply waste factors per material category (configurable per builder)
4. Factor in delivery costs and minimum order thresholds
5. Filter by lead time if a "need by" date is specified
6. Show overall confidence score and flag weak-data items
7. Generate POs per vendor from optimized list

**Waste factors** (builder-configurable defaults):
- Framing lumber: 5%, Studs: 3%, Drywall: 10%, Tile: 15%
- Flooring: 10%, Roofing shingles: 10%, Siding: 12%, Trim: 15%

### 11. Savings Tracking

After every invoice is processed, the system calculates:
- **Actual spend**: What was paid (vendor × unit price × quantity)
- **Optimal spend**: What the best available price was at time of purchase
- **Savings/overpayment**: Difference, attributed per line item

Tracked per job, per vendor, per material category, and per time period.

Dashboard shows:
- Total savings YTD, savings rate (%), savings by job, savings by category
- Top missed savings ("buy from different vendor next time")
- Vendor spend ranking with negotiation insights

### 12. Spend Analytics

Leverage spend data for vendor negotiations:
- Annual spend by vendor with year-over-year comparison
- Spend concentration analysis (% of total with each vendor)
- Category spend breakdown per vendor
- AI-generated negotiation insights: "You spent $487K with Island in 2025. Consider requesting: volume discount (2-5%), extended payment terms (Net 45), free delivery."

### 13. Cost Escalation Forecasting

- Based on historical price trends, project forward expected material costs
- Models: linear trend, seasonal adjustment, market-informed (future with commodity indices)
- Forecast confidence interval: optimistic, expected, pessimistic
- Budget impact projection: "If current trends continue, framing materials on Project X will cost $Y more than estimated"
- Configurable forecast horizon: 3, 6, or 12 months

### 14. Regional Pricing Variations

- Prices tagged with geographic context (project zip code or builder metro area)
- Regional price indices: compare builder's prices against regional averages
- Cross-region analysis for builders operating in multiple markets
- Regional data supports AI cold-start: new builders get regional benchmarks before their own data accumulates (Gap 494)

### 15. AI Data Strategy

- **Per-tenant learning**: Each builder's price data trains their own pricing model (Gap 491)
- **Cross-tenant learning**: With explicit opt-in, anonymized data contributes to platform-wide model. Builder data never individually identifiable (Gap 491, 492)
- **Cold-start**: New builders receive suggestions from platform-wide model weighted by region and project type. Blend shifts toward per-tenant data as it accumulates (Gap 494)
- **Data transparency**: System communicates what data is needed: "Price intelligence for [Electrical] is based on 3 invoices. 10+ invoices needed for high-confidence suggestions" (Gap 496)
- **Feedback loop**: User corrections/dismissals captured and used to improve future suggestions (Gap 497)

### 16. Automation Levels

Configurable per builder (Gap 501):
- **Suggestion mode**: AI provides price suggestions in estimating; user accepts, modifies, or ignores
- **Auto-fill mode**: AI auto-populates unit prices in new estimates; user reviews and adjusts
- **Alert-only mode**: AI monitors prices but only flags anomalies; no proactive suggestions

Each builder configures preferred mode per material category or globally.

### 17. Explainability

Every AI-generated price suggestion includes (Gap 503):
- Data sources used (how many invoices, which vendors, time period)
- Confidence level (low/medium/high) with clear criteria
- Comparison to alternatives: "Vendor A is 12% below average; Vendor B quoted 8% above"
- Regional context: "This is 5% above regional average for [metro area]"
- "Why this price?" expandable detail on any AI suggestion

---

## Subcontractor Labor Pricing Intelligence

### The Challenge

Labor is harder than materials because:

| Factor | Materials | Labor |
|--------|-----------|-------|
| Unit comparison | Apples to apples | Scope varies wildly |
| Inclusions | N/A | Material? Cleanup? Permits? |
| Quality factor | Brand/grade | Workmanship, reliability |
| Complexity | Same 2x4 everywhere | Simple vs. complex installs |

### Trade Categories (Organic Growth)

Same approach as materials. Trades and work types emerge as quotes are entered:
- **Trade:** plumbing, electrical, framing, HVAC, roofing, etc.
- **Work Type:** rough, trim, complete, etc.
- **Scope Inclusions:** what's included (checkboxes)
- **Scope Exclusions:** what's NOT included

### Scope Tracking

The key to comparing labor quotes is tracking what's included. Each quote captures a scope fingerprint:
- Inclusions checklist (labor, rough material, fixtures, final connections, cleanup, permit)
- Exclusions checklist
- Material included flag with allowance amount
- Job metrics: SF, LF, unit count (fixtures, openings, devices)
- Complexity: simple, standard, complex, custom

Scope templates per trade/work type provide defaults that users confirm or adjust.

### Labor Price Normalization

To compare quotes with different scope:
1. **Extract material portion** if included (using trade-specific material ratios: plumbing rough 35%, electrical rough 30%, HVAC rough 25%, etc.)
2. **Calculate per-SF**, per-LF, and per-unit prices from labor-only amount
3. **Apply complexity adjustment** (simple: 0.85x, standard: 1.0x, complex: 1.25x, custom: 1.50x)
4. **Generate scope hash** for accurate comparison (only compare quotes with matching scope fingerprints)

### Labor Comparison Engine

For a given trade/work type/scope, the system:
1. Retrieves all matching labor price history (normalized to labor-only, per-SF)
2. Calculates market stats: low, high, median, average, data point count
3. Scores each sub using **value score** (0-100) balancing:
   - Price score (40 pts max) — lower is better relative to average
   - Quality score (30 pts max) — from post-job ratings
   - Schedule score (20 pts max) — on-time performance
   - Callback penalty (up to -10 pts)
   - Preferred sub bonus (+5 pts)
4. Recommends top 3 value-scored subs

### Sub Performance Tracking

After every job, track per subcontractor:
- Contract vs. actual amount (including change orders)
- Schedule performance (planned vs. actual start/complete)
- Quality metrics: punch list items, callbacks
- Ratings (1-5): quality, schedule, communication, cleanup
- All metrics feed back into the comparison engine for future recommendations

---

## Integration with Estimating

Both material and labor pricing databases become the estimating source of truth:

**Materials:** Pull current best prices (not guesses), show price ranges based on vendor spread, use confidence scores to flag uncertain pricing, auto-update estimates when prices shift

**Labor:** Pull $/sf or $/unit by trade based on actual bids, factor complexity into estimates, show range from low performer to preferred subs

**Estimate Accuracy Tracking:** After project completion, compare estimated vs. actual costs per cost code to improve future estimates

---

## Database Tables

### Material Pricing Tables

```sql
-- MASTER ITEM CATALOG
-- Normalized items with standard naming
master_items
  id UUID PK, builder_id, category TEXT, subcategory TEXT,
  standard_name TEXT, standard_unit TEXT,
  dimensions JSONB,  -- {length_in, width_in, thickness_in, sf_coverage, bundles_per_square}
  keywords TEXT[],   -- for full-text search
  manufacturer TEXT, product_line TEXT,
  created_at, updated_at

-- VENDOR ITEM ALIASES
-- Maps vendor-specific descriptions to master items
vendor_item_aliases
  id UUID PK, master_item_id FK, vendor_id FK,
  vendor_description TEXT, vendor_sku TEXT,
  match_method TEXT (manual|ai_confirmed|ai_suggested),
  confidence DECIMAL(3,2),
  confirmed_by, confirmed_at, created_at,
  UNIQUE(vendor_id, vendor_description)

-- PRICE HISTORY
-- Every price point from invoices, quotes, or manual entry
price_history
  id UUID PK, builder_id,
  master_item_id FK, vendor_id FK,
  invoice_id FK (null if quote), invoice_line_item_id,
  quote_id FK (null if invoice),
  source_type TEXT (invoice|quote|manual),
  unit_price DECIMAL(12,4), quantity DECIMAL(12,4),
  extended_price DECIMAL(12,2), unit TEXT,
  qty_break_tier TEXT (standard|bulk_100+|pallet),
  lead_days INTEGER, in_stock BOOLEAN,
  job_id, price_date DATE,
  is_special_pricing BOOLEAN DEFAULT FALSE,
  expiration_date DATE, notes TEXT,
  captured_at TIMESTAMPTZ

-- VENDOR QUOTES
-- Uploaded quote documents
vendor_quotes
  id UUID PK, builder_id, vendor_id FK,
  file_name TEXT, file_path TEXT,
  quote_date DATE, expiration_date DATE, quote_number TEXT,
  sales_rep TEXT, status TEXT (pending|processing|completed|failed),
  items_extracted INTEGER DEFAULT 0,
  uploaded_by, uploaded_at, processed_at, notes TEXT

-- PRICE CONFIDENCE
-- Data strength per item/vendor combination
price_confidence
  id UUID PK, master_item_id FK, vendor_id FK,
  invoice_count INTEGER, quote_count INTEGER, manual_count INTEGER,
  total_data_points INTEGER GENERATED,
  oldest_price_date DATE, newest_price_date DATE, avg_age_days INTEGER,
  price_variance DECIMAL(5,2), price_trend TEXT (stable|rising|falling),
  confidence_score INTEGER GENERATED (0-100),
  updated_at, UNIQUE(master_item_id, vendor_id)

-- CURRENT PRICES (Materialized View)
-- Most recent price per item per vendor
current_prices (materialized view)
  master_item_id, vendor_id, unit_price, unit, price_date,
  qty_break_tier, standard_name, category, vendor_name, vendor_short

-- PURCHASE DECISIONS
-- Tracks what was bought vs. optimal choice
purchase_decisions
  id UUID PK, builder_id,
  invoice_id FK, master_item_id FK,
  actual_vendor_id FK, actual_unit_price, quantity, actual_extended,
  optimal_vendor_id FK, optimal_unit_price, optimal_extended,
  savings_amount DECIMAL(12,2), savings_percent DECIMAL(5,2),
  decision_reason TEXT (delivery_timing|relationship|availability|unknown),
  job_id, purchase_date DATE, created_at

-- SAVINGS SUMMARY (Materialized View)
savings_summary (materialized view)
  month, job_id, line_items, total_spent, optimal_spend,
  total_savings, avg_savings_percent, optimized_items, overpaid_items

-- WASTE FACTORS
waste_factors
  id UUID PK, builder_id,
  category TEXT, subcategory TEXT,
  default_waste_percent DECIMAL(5,2),
  min_waste_percent, max_waste_percent, notes TEXT,
  UNIQUE(builder_id, category, subcategory)

-- VENDOR SPEND ANALYTICS (Materialized View)
vendor_spend_analytics (materialized view)
  vendor_id, vendor_name, year, category, total_spend, job_count
```

### Labor Pricing Tables

```sql
-- LABOR QUOTES
labor_quotes
  id UUID PK, builder_id,
  subcontractor_id FK, job_id,
  trade TEXT, work_type TEXT, description TEXT,
  quote_amount DECIMAL(12,2), quote_unit TEXT,
  unit_quantity DECIMAL(12,2),
  scope_inclusions TEXT[], scope_exclusions TEXT[],
  material_included BOOLEAN, material_allowance DECIMAL(12,2),
  price_per_sf DECIMAL(12,4), price_per_lf DECIMAL(12,4),
  price_per_unit DECIMAL(12,4), labor_only_amount DECIMAL(12,2),
  quote_date DATE, valid_until DATE,
  job_sf DECIMAL(12,2), job_lf DECIMAL(12,2), unit_count INTEGER,
  complexity TEXT (simple|standard|complex|custom),
  status TEXT (pending|accepted|declined|expired),
  quote_source TEXT (solicited|unsolicited|negotiated),
  competing_quotes UUID[], created_at

-- LABOR PRICE HISTORY
-- Normalized labor prices for comparison
labor_price_history
  id UUID PK, builder_id,
  subcontractor_id FK, labor_quote_id FK, job_id,
  trade TEXT, work_type TEXT, complexity TEXT,
  price_per_sf DECIMAL(12,4), price_per_lf DECIMAL(12,4),
  price_per_unit DECIMAL(12,4),
  total_sf, total_lf, unit_count INTEGER, unit_type TEXT,
  scope_hash TEXT, material_included BOOLEAN,
  source_type TEXT (quote|actual|budget),
  price_date DATE, created_at

-- SCOPE TEMPLATES
scope_templates
  id UUID PK, builder_id,
  trade TEXT, work_type TEXT,
  typical_inclusions TEXT[], typical_exclusions TEXT[],
  typical_unit TEXT, price_range_low DECIMAL(12,4),
  price_range_high DECIMAL(12,4), price_range_unit TEXT,
  simple_multiplier DECIMAL(4,2) DEFAULT 0.85,
  standard_multiplier DECIMAL(4,2) DEFAULT 1.00,
  complex_multiplier DECIMAL(4,2) DEFAULT 1.25,
  custom_multiplier DECIMAL(4,2) DEFAULT 1.50,
  updated_at

-- SUB JOB PERFORMANCE
sub_job_performance
  id UUID PK, builder_id,
  subcontractor_id FK, job_id, labor_quote_id FK,
  contract_amount, final_amount, change_order_amount,
  scheduled_start DATE, actual_start DATE,
  scheduled_complete DATE, actual_complete DATE,
  punch_list_items INTEGER, callbacks INTEGER,
  quality_rating INTEGER (1-5), schedule_rating INTEGER (1-5),
  communication_rating INTEGER (1-5), cleanup_rating INTEGER (1-5),
  notes TEXT, created_at

-- ESTIMATE ACCURACY
estimate_accuracy
  id UUID PK, builder_id, job_id, cost_code TEXT,
  estimated_material DECIMAL(12,2), estimated_labor DECIMAL(12,2),
  actual_material DECIMAL(12,2), actual_labor DECIMAL(12,2),
  material_variance_pct DECIMAL(5,2), labor_variance_pct DECIMAL(5,2),
  complexity TEXT, notes TEXT
```

### Existing Tables (from other modules, referenced here)

```
v2_material_catalog, v2_vendor_rate_sheets, v2_rate_sheet_items,
v2_price_anomalies, v2_price_forecasts, v2_price_feedback,
v2_regional_price_indices, v2_price_intelligence_config
```

---

## API Endpoints

```
# Material Catalog
GET    /api/v2/materials                             # List builder's material catalog
POST   /api/v2/materials                             # Add material to catalog
PUT    /api/v2/materials/:id                         # Update material
GET    /api/v2/materials/:id/price-history            # Price history for a material
GET    /api/v2/materials/search                      # Search master items (keywords, category)

# Price Tracking & Comparison
GET    /api/v2/prices/trends                         # Price trends (material, vendor, date range)
GET    /api/v2/prices/compare                        # Supplier price comparison for a material
GET    /api/v2/prices/compare/confidence             # Comparison with confidence indicators
GET    /api/v2/prices/regional                       # Regional price data
GET    /api/v2/prices/best/:masterItemId             # Best current price across vendors

# Quote Ingestion
POST   /api/v2/quotes/upload                         # Upload vendor quote (PDF/Excel/CSV)
GET    /api/v2/quotes                                # List uploaded quotes
GET    /api/v2/quotes/:id                            # Quote detail with extracted items
POST   /api/v2/quotes/:id/confirm                    # Confirm extracted items
POST   /api/v2/prices/manual                         # Add manual price entry

# Rate Sheets
GET    /api/v2/vendors/:id/rate-sheets               # List vendor's rate sheets
POST   /api/v2/vendors/:id/rate-sheets               # Upload/create rate sheet
GET    /api/v2/rate-sheets/:id                       # Get rate sheet with items
PUT    /api/v2/rate-sheets/:id                       # Update rate sheet

# Anomaly Detection
GET    /api/v2/prices/anomalies                      # List all open anomalies
GET    /api/v2/prices/anomalies/:id                  # Anomaly detail with explanation
PUT    /api/v2/prices/anomalies/:id/dismiss          # Dismiss with reason
POST   /api/v2/prices/check                          # Check a price against historical data

# PO Alert / Budget Gate
POST   /api/v2/prices/po-review                      # Check PO lines against prices + budget
GET    /api/v2/prices/po-review/:poId                # Get review results for a PO

# Material List Optimizer
POST   /api/v2/prices/optimize                       # Optimize a material list across vendors
POST   /api/v2/prices/optimize/with-waste            # Optimize with waste factors applied
GET    /api/v2/prices/waste-factors                   # Get waste factor defaults
PUT    /api/v2/prices/waste-factors                   # Update waste factors

# Forecasting
GET    /api/v2/prices/forecast/:materialId           # Price forecast for a material
GET    /api/v2/prices/forecast/budget-impact/:projectId  # Forecast impact on project budget

# Savings Tracking
GET    /api/v2/prices/savings                        # Savings summary (period, job, category)
GET    /api/v2/prices/savings/missed                  # Top missed savings opportunities
GET    /api/v2/prices/savings/by-vendor               # Savings breakdown by vendor

# Spend Analytics
GET    /api/v2/prices/spend                          # Vendor spend analytics
GET    /api/v2/prices/spend/:vendorId                # Detailed spend for one vendor
GET    /api/v2/prices/spend/negotiation-insights     # AI-generated negotiation suggestions

# AI Suggestions & Feedback
POST   /api/v2/prices/suggest                        # AI price suggestion for estimate lines
POST   /api/v2/prices/feedback                       # Submit feedback on AI suggestion
GET    /api/v2/prices/explain/:suggestionId          # Detailed explanation of a suggestion

# Item Review Queue
GET    /api/v2/prices/review-queue                   # Items needing human confirmation
POST   /api/v2/prices/review-queue/:id/confirm       # Confirm AI match
POST   /api/v2/prices/review-queue/:id/create-new    # Create new master item

# Labor Pricing
GET    /api/v2/labor/quotes                          # List labor quotes
POST   /api/v2/labor/quotes                          # Add labor quote with scope
GET    /api/v2/labor/compare                         # Compare subs for a trade/scope
GET    /api/v2/labor/market-stats                    # Market stats for trade/work type
POST   /api/v2/labor/normalize                       # Normalize a labor quote
GET    /api/v2/labor/scope-templates                 # Get scope templates by trade
GET    /api/v2/labor/sub-performance/:subId          # Sub performance history
POST   /api/v2/labor/sub-performance                 # Record post-job performance

# Configuration
GET    /api/v2/price-intelligence/config             # Builder's settings
PUT    /api/v2/price-intelligence/config             # Update settings
GET    /api/v2/price-intelligence/data-status        # Data sufficiency per category
GET    /api/v2/price-intelligence/confidence-dashboard  # Overall data strength
```

---

## UI Components

### Material Price Intelligence

| Component | Description |
|-----------|-------------|
| `PriceBrowser` | Browse material catalog with per-vendor pricing, unit toggle, confidence meters |
| `PriceCell` | Individual price with confidence indicator and warning badges |
| `ConfidenceMeter` | Visual strength indicator (0-100 score with color) |
| `WarningBadge` | Stale data, single source, quotes-only indicators |
| `PriceTrendChart` | Line chart showing material price over time with trend line |
| `SupplierComparisonTable` | Side-by-side vendor pricing with quality scores |
| `AnomalyAlertCard` | Flagged price with deviation %, explanation, dismiss action |
| `AnomalyDashboard` | All open anomalies sorted by severity |
| `QuoteUploader` | Drag/drop quote PDF/Excel/CSV with vendor selection |
| `QuoteReviewTable` | Review AI-extracted items — auto-matched vs. needs review |
| `ItemMatcher` | Match unrecognized items to master catalog or create new |
| `ManualPriceEntry` | Quick form for phone quotes or ad-hoc pricing |
| `MaterialOptimizer` | Input material list → optimized vendor split with waste factors |
| `POReviewAlert` | Budget gate + price check alert on PO creation |
| `SavingsDashboard` | Total savings, savings by job/vendor/category, missed savings |
| `SpendAnalytics` | Vendor spend ranking, concentration analysis, negotiation insights |
| `ConfidenceDashboard` | Overall data strength: strong/weak/stale coverage by category and vendor |
| `ForecastChart` | Price forecast with confidence interval (fan chart) |
| `BudgetImpactProjection` | Forecasted cost impact on active project budgets |
| `RateSheetManager` | View and edit vendor rate sheets |
| `RegionalPriceMap` | Map visualization showing price variation by region |
| `DataSufficiencyIndicator` | Per-category data availability and confidence |
| `AIExplanationPanel` | Expandable detail for how AI arrived at a suggestion |
| `PriceFeedbackForm` | Accept/modify/reject AI suggestion with reason capture |
| `PriceIntelligenceSettings` | Builder config: automation level, thresholds, opt-in |
| `MaterialPriceWidget` | Inline widget in estimating module for current intelligence |
| `CommodityIndexTracker` | Dashboard for commodity price indices |
| `MobileQuickCheck` | Field-optimized price lookup for PMs on-site |

### Labor Pricing

| Component | Description |
|-----------|-------------|
| `LaborBuyout` | Sub comparison by trade/scope with value scores and recommendations |
| `LaborQuoteIntake` | Quote entry with scope checklist, complexity, job metrics |
| `MarketStats` | Low/avg/high/median pricing for a trade/work type |
| `SubPerformanceCard` | Per-sub performance history: ratings, callbacks, schedule |
| `ScopeChecklist` | Configurable inclusion/exclusion checklist per trade |
| `ValueScore` | Visual 0-100 score combining price + performance |
| `TradeSelect` / `WorkTypeSelect` | Hierarchical trade/work type selection |

---

## Implementation Roadmap

### Week 0: Bootstrap
- Request comprehensive material quotes from 5-8 vendors (template email provided in spec)
- Collect and organize quote documents for processing

### Weeks 1-2: Foundation
- Create all database tables in Supabase
- Seed master_items with ~200 common construction items
- Build basic AI item normalizer

### Weeks 3-4: Data Pipeline
- Integrate with existing invoice extraction pipeline
- Build line-item → master-item matching flow
- Create human review queue for low-confidence matches
- Process 3-6 months of historical invoices

### Weeks 5-6: Comparison Engine
- Build current_prices materialized view + refresh logic
- Create price comparison API
- Build material list optimizer
- Test with real takeoffs

### Weeks 7-8: Savings & Alerts
- Implement purchase decision capture on every invoice
- Build PO review / budget gate system
- Create savings dashboard UI
- Backfill historical purchase decisions

### Weeks 9-10: Labor Intelligence
- Build labor quote intake with scope tracking
- Implement labor price normalization
- Build sub comparison engine
- Create labor buyout UI

### Weeks 11-12: Analytics & Polish
- Spend analytics dashboard
- Confidence dashboard
- Forecasting models
- Client-facing savings reports
- Mobile quick-check UI

---

## Success Metrics

### Material Pricing
| Metric | Target |
|--------|--------|
| Master item coverage | 95%+ of spend matched |
| AI match accuracy | 90%+ after 500 confirmations |
| Price data freshness | <30 days average age |
| Realized savings rate | 3-5% of material spend |
| Over-budget POs caught | 100% flagged before approval |

### Labor Pricing
| Metric | Target |
|--------|--------|
| Trade coverage | All 20+ trades with 3+ data points |
| Quotes per buyout | 3+ before awarding |
| Scope accuracy | 90%+ inclusions correctly captured |
| Sub performance tracking | 100% of jobs have post-completion ratings |
| Labor cost variance | <5% from estimate |

---

## Dependencies

- **Module 11/13: Invoice Processing** — invoice data feeds material price tracking
- **Module 18: Purchase Orders** — PO data feeds price tracking; PO alert system
- **Module 20: Estimating Engine** — primary consumer of price suggestions
- **Module 10: Contact/Vendor Management** — vendor records for supplier comparison
- **Module 22: Vendor Performance** — quality scores for price-to-quality ratio
- **Module 9: Budget & Cost Tracking** — budget data for PO budget gate
- **Module 26: Bid Management** — labor quotes feed labor pricing
- **External data sources** (future) — commodity indices, supplier APIs

---

## Open Questions

1. What external commodity data sources should be integrated for V2? (RS Means, commodity futures, supplier APIs)
2. How frequently should price forecasts be recalculated — daily, weekly, or on-demand only?
3. For cross-tenant benchmarking, what is the minimum anonymity threshold (e.g., at least 5 builders contributing before a regional average is published)?
4. Should the material list optimizer auto-generate POs, or just recommend the split?
5. How should we handle vendor-specific delivery fees in the optimizer (free delivery above threshold, flat fee, per-mile)?
6. Should labor pricing intelligence be a separate module or stay within Module 23?
7. What is the retention policy for price history data? (Recommend: indefinite for trend analysis)
