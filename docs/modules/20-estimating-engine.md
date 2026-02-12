# Module 20: Estimating Engine with Intelligence

**Phase:** 4 - Intelligence
**Status:** TODO
**Priority:** Critical (revenue-enabling)

---

## Overview

A full-featured estimating and budgeting system that supports the wide variety of estimating approaches used by custom home builders. Supports assembly-based estimating, line-by-line takeoffs, unit-pricing models, and AI-assisted estimate generation from historical data and uploaded plans. Estimates convert directly into project budgets and client proposals. The system must be flexible enough to handle one-man shops that estimate on a napkin and 50-person firms that have dedicated estimators with 200-line cost code structures.

---

## Gap Items Addressed

| Gap # | Description | Section |
|-------|-------------|---------|
| 257 | Multi-format cost code support (CSI MasterFormat, custom, hybrid) | Estimate Structure |
| 258 | Builder-defined estimate hierarchy (Division > Code > Item vs. Phase > Trade > Item) | Estimate Structure |
| 259 | Estimate templates by project type, per builder | Estimate Structure |
| 260 | Assembly-based vs. line-by-line estimating support | Estimate Structure |
| 261 | Unit pricing model ($/SF for everything) | Estimate Structure |
| 262 | Configurable markup structures (flat %, tiered, per-line, built-in) | Estimate Structure |
| 263 | Configurable estimate detail levels (client summary vs. builder detail) | Estimate Structure |
| 264 | Estimate approval workflows that vary by builder | Estimate Structure |
| 265 | Estimate versioning with change comparison (V1, V2, V3) | Estimate Structure |
| 266 | Multi-level presentation (summary for client, detail for builder) | Estimate Structure |
| 267 | Contract type support (NTE, GMP, cost-plus with estimate) | Estimate Structure |
| 268 | Placeholder/allowance amounts for unbid work | Estimate Structure |
| 269 | Scope exclusion tracking (what is NOT included) | Estimate Structure |
| 270 | Alternate/option pricing within estimates | Estimate Structure |
| 271 | Estimate expiration with configurable validity period | Estimate Structure |
| 272 | Mid-project contract type changes (cost-plus to GMP) | Budget Tracking |
| 273 | Committed vs. budgeted vs. actual cost tracking | Budget Tracking |
| 274 | Cost-to-complete projections from spend rate | Budget Tracking |
| 275 | Earned value management | Budget Tracking |
| 276 | Configurable budget alerts per builder (80%, 95%, etc.) | Budget Tracking |
| 277 | Budget templates by project type | Budget Tracking |
| 278 | Minimal "actuals only" mode for non-budgeting builders | Budget Tracking |
| 279 | Contingency drawdown tracking with documentation | Budget Tracking |
| 280 | Budget format by audience (owner, PM, bank/AIA) | Budget Tracking |
| 493 | AI accuracy transparency with confidence scoring | AI Intelligence |
| 494 | AI cold-start using industry benchmarks | AI Intelligence |
| 496 | AI data requirements communicated to user | AI Intelligence |
| 499 | AI plan takeoffs (rooms, fixtures, areas) | AI Intelligence |
| 500 | AI schedule generation from estimate | AI Intelligence |
| 944 | Allowance strategy builder — set allowance amounts based on historical data for similar selections at this tier | AI-assisted allowance recommendations based on historical selection costs by finish tier and project type |
| 945 | Estimate presentation builder — client-facing estimate at configurable detail with builder branding | Branded estimate presentation generator with configurable detail level and PDF/web output |
| 946 | Pre-construction cost tracker — design fees, engineering, survey, geotech, permit fees, impact fees tracked separately | Pre-construction soft cost tracking separate from construction budget |
| 947 | Construction cost escalation calculator — estimate material/labor increases for delayed starts | Cost escalation projection tool using material and labor indices |

---

## Detailed Requirements

### 1. Estimate Structure & Hierarchy

- Builders define their own cost code structure: CSI MasterFormat, custom codes, or hybrid systems (Gap 257).
- Configurable hierarchy depth: some builders use Division > Cost Code > Line Item; others use Phase > Trade > Item (Gap 258).
- Each builder can create estimate templates by project type (e.g., "3,000 SF Ranch," "5,000 SF Two-Story") that pre-populate line items and assemblies (Gap 259).
- Hierarchical nodes are collapsible; subtotals roll up at each level.
- Cost codes are tenant-scoped: each `builder_id` manages their own code library.

### 2. Estimating Methods

- **Assembly-based estimating**: Pre-built "recipes" that group multiple line items. Example: "Exterior Wall Assembly" = framing labor + framing material + sheathing + housewrap + insulation. Assemblies are parameterized by quantity (e.g., linear feet of wall) and auto-calculate all child items (Gap 260).
- **Line-by-line estimating**: Traditional item-by-item entry with quantity, unit, unit cost, and total.
- **Unit pricing**: Entire scopes priced by $/SF, $/LF, or per-unit. System supports any unit of measure (Gap 261).
- **Hybrid**: Mix assembly and line items within the same estimate.

### 3. Markup & Margin Configuration

- Flat percentage on entire estimate, tiered by cost code category, per-line markup, or markup built into unit prices (Gap 262).
- Separate overhead and profit percentages if desired.
- Markup display is configurable: show to internal team only, never show on client-facing documents.
- Builder-defined rounding rules (round to nearest $100, $1,000, etc.).

### 4. Estimate Presentation & Detail Levels

- Client-facing summary view: aggregated categories (e.g., 10-15 line items) (Gap 263, 266).
- Builder detail view: full line-item breakdown (e.g., 200+ lines).
- Bank/lender view: AIA G702/G703 format.
- Each view is a presentation layer over the same underlying data.

### 5. Versioning & Comparison

- Full version history: V1, V2, V3, etc. with timestamps and change author (Gap 265).
- Side-by-side comparison showing added, removed, and changed line items with dollar deltas.
- Version notes explaining what changed and why.
- Any version can be restored as the active estimate.

### 6. Approval Workflows

- Configurable per builder: some require owner sign-off on all estimates; others let PMs send directly (Gap 264).
- Threshold-based routing: estimates over $X require additional approval.
- Digital approval with timestamp and audit trail.
- Email/in-app notification on approval request.

### 7. Contract Types & Special Pricing

- Support for Not-to-Exceed (NTE), Guaranteed Maximum Price (GMP), Cost-Plus with Estimate, and Fixed Price (Gap 267).
- Contract type drives downstream budget behavior (cost-plus shows actuals; GMP tracks against ceiling).
- Placeholder/allowance line items for work not yet bid, with visual indicator (Gap 268).
- Scope exclusions tracked as explicit line items with $0 value, clearly marked "EXCLUDED" (Gap 269).
- Alternate/option pricing: "If client chooses Option A = $50K; Option B = $75K" with toggle to show impact (Gap 270).
- Estimate expiration date with configurable validity period (30, 60, 90 days) and auto-alerts (Gap 271).

### 7a. Allowance Strategy Builder (Gap 944)

- AI-assisted allowance amount recommendations for unbid selections (e.g., fixtures, appliances, tile, countertops)
- Recommendations based on: builder's historical selection costs, project finish tier (builder/standard/semi-custom/luxury), project type, and region
- Allowance categories: plumbing fixtures, lighting fixtures, appliances, flooring, tile, countertops, cabinet hardware, landscaping, window treatments
- Per-category allowance display: recommended amount, range (low-high), confidence level, data points used
- Bulk allowance generation: populate all allowance line items at once for a given finish tier
- Client-facing allowance summary: clear display of what is covered by each allowance and what happens if selections exceed the allowance

### 7b. Estimate Presentation Builder (Gap 945)

- Branded estimate output with builder logo, colors, and contact information
- Configurable detail levels: executive summary (5-10 lines), category summary (15-25 lines), detailed breakdown (full line items)
- Section customization: choose which sections to include/exclude per presentation
- Cover page with project rendering or photo, project address, client name, date, and estimate validity period
- Output formats: interactive web view (shareable link), PDF download, print-optimized layout
- Configurable disclaimers, terms, and conditions appended to each presentation
- Comparison mode: present two scope options side-by-side for client decision-making

### 7c. Pre-Construction Cost Tracker (Gap 946)

- Separate tracking for soft costs incurred before construction starts: design fees, engineering fees, survey costs, geotechnical reports, permit fees, impact fees, utility connection fees, HOA submission fees
- Pre-con budget template with common soft cost categories, customizable per builder
- Pre-con costs tracked independently from the construction budget but roll into total project cost
- Invoice and payment tracking for pre-construction vendors (architect, engineer, surveyor)
- Pre-con cost report: summary of all soft costs with actual vs. estimated, linked to the pre-construction agreement (Module 36)
- Auto-carry pre-con actuals into the construction budget as a completed cost category when the project transitions to construction

### 7d. Construction Cost Escalation Calculator (Gap 947)

- Project material and labor cost escalation based on projected start date
- Escalation indices: builder can use national construction cost indices (RSMeans, ENR), regional indices, or custom escalation rates
- Per-category escalation: different rates for lumber, concrete, steel, labor, etc.
- Scenario modeling: "If we start in 3 months, estimated escalation is $X; if 6 months, $Y"
- Historical escalation data: track actual escalation vs. projected for continuous calibration
- Escalation auto-applied to estimates with future start dates; clearly disclosed as a separate line item
- Integration with AI pricing intelligence: actual price trend data supplements published indices

### 8. Estimate-to-Budget Conversion

- One-click conversion of approved estimate to project budget.
- Mapping rules from estimate line items to budget categories.
- Allowance items carry forward as budget allowances.
- Mid-project contract type change supported: re-map budget structure when converting from cost-plus to GMP (Gap 272).

### 9. Budget Tracking

- Three-column tracking: Budgeted | Committed (signed contracts + POs) | Actual (paid invoices) (Gap 273).
- Cost-to-complete projection: based on current spend rate and % complete, project final cost (Gap 274).
- Earned value metrics: CPI (Cost Performance Index), SPI (Schedule Performance Index), EAC (Estimate at Completion) (Gap 275).
- Configurable alert thresholds per builder (80%, 90%, 95% of budget line) with notification (Gap 276).
- Budget templates by project type, reusable across projects (Gap 277).
- "Actuals only" mode for builders who do not formally budget (Gap 278).
- Contingency line item with drawdown tracking, requiring documented reason for each draw (Gap 279).
- Multiple budget views by audience: Owner summary, PM detail, Bank AIA format (Gap 280).

#### Edge Cases & What-If Scenarios

1. **Material price changes dramatically after estimate creation but before approval.** The system must flag material price changes between estimate creation and approval. Required behavior:
   - **Price history per material** -- track unit price for each material/SKU across all POs and invoices, normalized to a standard unit.
   - **Anomaly detection** -- flag when a material's price changes by more than a configurable threshold (default: 10%) compared to the trailing 90-day average.
   - **Alert levels:**
     - **Info** (5-10% increase): logged, visible in price intelligence dashboard.
     - **Warning** (10-20% increase): notification to PM on PO approval.
     - **Alert** (>20% increase): blocks PO auto-approval, requires manual review.
   - **Cross-vendor comparison** -- when a vendor's price for material X exceeds the platform average (anonymized cross-tenant) by >15%, surface a "cheaper alternatives available" suggestion.
   - **Integration with Module 23 (Price Intelligence)** -- this feature feeds into and leverages the price intelligence engine; should not be a standalone implementation.

### 10. AI-Powered Estimating

- **Historical cost intelligence**: When creating a new estimate, AI suggests unit prices based on the builder's own completed projects, filtered by project type, region, and date range (Gap 493).
- **Confidence scoring**: Each AI suggestion shows the number of data points and a confidence level (high/medium/low) (Gap 493).
- **Cold-start**: New builders get industry benchmark data seeded by region until they have 10+ completed projects (Gap 494, 496).
- **Plan takeoff** (future): Upload architectural plans; AI identifies rooms, counts fixtures, calculates square footages, and generates a preliminary estimate (Gap 499).
- **Schedule generation**: From a completed estimate, AI suggests a construction schedule based on historical task durations for similar projects (Gap 500).

#### Edge Cases & What-If Scenarios

1. **Cold-start for completely new project types.** When a builder creates an estimate for a project type they have never built before (e.g., a production builder attempting their first custom home), the AI has no builder-specific historical data to draw from. The system must: (a) clearly indicate when suggestions are based on industry benchmarks rather than builder history, (b) provide a guided UX that walks the builder through the estimate with benchmark ranges and confidence intervals rather than point estimates, (c) allow the builder to tag similar-but-not-identical past projects to broaden the AI's reference pool, and (d) surface platform-wide anonymized data for the project type and region as a secondary reference.

2. **Estimating-to-scheduling integration robustness.** The connection between the estimating engine and the scheduling module (for AI-powered schedule generation) must handle different construction methodologies and project complexities. The schedule generation engine must: (a) support configurable construction methodology presets (stick-frame, ICF, steel-frame, modular) that affect task sequencing, (b) allow builder overrides on AI-generated task durations, (c) account for regional factors (weather patterns, permitting timelines, inspection cadence) in duration estimates, and (d) clearly communicate confidence levels on schedule suggestions, with lower confidence for novel project types.

### 11. Material Waste Factors

- **Configurable Waste Percentages:** Define waste factor per material type (e.g., 10% drywall, 15% tile, 5% lumber, 8% paint).
- **Auto-Applied to Estimates:** Waste percentages are automatically applied to quantity calculations when generating estimate line items.
- **Per-Project Adjustment:** Waste factors adjustable per project based on complexity, site conditions, or design difficulty.
- **Industry Defaults:** Platform provides industry-standard waste factor defaults; builders can customize and override at the tenant level.

### 12. Bid Comparison Tools

- Invite multiple vendors to bid on the same scope.
- Side-by-side bid comparison with normalized line items.
- Highlight low/high outliers.
- One-click selection of winning bid to populate estimate line.
- Historical bid tracking per vendor per scope.

### 13. Value Engineering Tracking

- Flag line items as "value engineering candidates."
- Track original spec, proposed alternative, and cost delta.
- VE log with running total of savings achieved.
- Client approval status per VE item.

---

## Database Tables

```
v2_cost_code_libraries
  id, builder_id, name, system_type (csi|custom|hybrid), is_default, created_at

v2_cost_codes
  id, builder_id, library_id, parent_id, code, description, unit, default_unit_cost, sort_order

v2_estimate_templates
  id, builder_id, name, project_type, description, is_active, created_at

v2_estimates
  id, builder_id, project_id, template_id, name, status (draft|pending_approval|approved|sent|expired|converted),
  contract_type (nte|gmp|cost_plus|fixed), version, parent_version_id,
  markup_type (flat|tiered|per_line|built_in), markup_pct, overhead_pct, profit_pct,
  valid_until, notes, created_by, approved_by, approved_at, created_at, updated_at

v2_estimate_sections
  id, estimate_id, parent_id, name, sort_order, subtotal

v2_estimate_line_items
  id, estimate_id, section_id, cost_code_id, assembly_id, description, item_type (line|allowance|exclusion|alternate),
  quantity, unit, unit_cost, markup_pct, total, alt_group, notes, sort_order, ai_suggested, ai_confidence

v2_assemblies
  id, builder_id, name, description, category, parameter_unit, is_active, created_at

v2_assembly_items
  id, assembly_id, cost_code_id, description, qty_per_unit, unit, unit_cost, sort_order

v2_estimate_versions
  id, estimate_id, version_number, snapshot_json, change_summary, created_by, created_at

v2_bid_invitations
  id, builder_id, estimate_id, vendor_id, scope_description, due_date, status (sent|received|declined|expired), created_at

v2_bid_responses
  id, invitation_id, vendor_id, total_amount, line_items_json, notes, submitted_at

v2_value_engineering
  id, estimate_id, line_item_id, original_spec, proposed_alternative, cost_delta,
  status (proposed|client_approved|client_rejected|implemented), notes, created_at

v2_budgets
  id, builder_id, project_id, estimate_id, name, status (active|closed), contract_type, created_at

v2_budget_lines
  id, budget_id, cost_code_id, description, budgeted_amount, committed_amount, actual_amount,
  is_contingency, alert_threshold_pct, sort_order

v2_budget_contingency_draws
  id, budget_line_id, amount, reason, documented_by, approved_by, created_at

v2_allowance_recommendations
  id, builder_id, category, finish_tier, recommended_amount,
  range_low, range_high, confidence, data_points, region, created_at

v2_precon_budgets
  id, builder_id, project_id, lead_id, precon_agreement_id,
  status (active|closed|rolled_into_construction), created_at

v2_precon_budget_lines
  id, precon_budget_id, category, description, estimated_amount,
  actual_amount, vendor_id, invoice_ids, notes, sort_order

v2_escalation_indices
  id, builder_id, index_name, index_source (rsmeans|enr|custom),
  category, rate_pct_annual, effective_date, created_at

v2_escalation_scenarios
  id, estimate_id, projected_start_date, total_escalation_amount,
  per_category_escalation, created_at
```

---

## API Endpoints

```
# Cost Code Libraries
GET    /api/v2/cost-codes                      # List builder's cost codes (tree)
POST   /api/v2/cost-codes                      # Create cost code
PUT    /api/v2/cost-codes/:id                   # Update cost code
DELETE /api/v2/cost-codes/:id                   # Delete cost code
POST   /api/v2/cost-codes/import                # Bulk import (CSV/CSI)

# Assemblies
GET    /api/v2/assemblies                       # List assemblies
POST   /api/v2/assemblies                       # Create assembly with items
PUT    /api/v2/assemblies/:id                   # Update assembly
DELETE /api/v2/assemblies/:id                   # Delete assembly

# Estimates
GET    /api/v2/estimates                        # List estimates (filterable by project, status)
POST   /api/v2/estimates                        # Create estimate (optionally from template)
GET    /api/v2/estimates/:id                    # Get estimate with line items
PUT    /api/v2/estimates/:id                    # Update estimate header
DELETE /api/v2/estimates/:id                    # Delete draft estimate
POST   /api/v2/estimates/:id/line-items         # Add line item or assembly
PUT    /api/v2/estimates/:id/line-items/:lid    # Update line item
DELETE /api/v2/estimates/:id/line-items/:lid    # Remove line item
POST   /api/v2/estimates/:id/versions           # Save version snapshot
GET    /api/v2/estimates/:id/versions           # List versions
GET    /api/v2/estimates/:id/versions/compare   # Compare two versions (?v1=X&v2=Y)
POST   /api/v2/estimates/:id/submit             # Submit for approval
POST   /api/v2/estimates/:id/approve            # Approve estimate
POST   /api/v2/estimates/:id/convert-to-budget  # Convert to budget
GET    /api/v2/estimates/:id/presentation/:view # Get formatted view (client|builder|bank)

# AI Estimating
POST   /api/v2/estimates/:id/ai/suggest-pricing # Get AI price suggestions for line items
POST   /api/v2/estimates/ai/from-plans          # Generate estimate from uploaded plans (future)
POST   /api/v2/estimates/:id/ai/schedule        # Generate schedule from estimate

# Bid Management
POST   /api/v2/bids/invite                     # Send bid invitation to vendors
GET    /api/v2/bids/invitations/:estimateId     # List invitations for an estimate
POST   /api/v2/bids/respond/:invitationId       # Vendor submits bid response
GET    /api/v2/bids/compare/:estimateId         # Side-by-side bid comparison

# Value Engineering
GET    /api/v2/estimates/:id/value-engineering   # List VE items
POST   /api/v2/estimates/:id/value-engineering   # Add VE item
PUT    /api/v2/value-engineering/:id             # Update VE item status

# Budgets
GET    /api/v2/budgets/:projectId               # Get project budget
PUT    /api/v2/budgets/:id/lines/:lineId        # Update budget line
GET    /api/v2/budgets/:id/tracking             # Budget vs. committed vs. actual
GET    /api/v2/budgets/:id/forecast             # Cost-to-complete projection
GET    /api/v2/budgets/:id/earned-value         # Earned value metrics
POST   /api/v2/budgets/:id/contingency/draw     # Record contingency draw
GET    /api/v2/budgets/:id/presentation/:view   # Formatted view (owner|pm|bank)

# Allowance Strategy
POST   /api/v2/estimates/:id/allowances/recommend  # Generate AI allowance recommendations
GET    /api/v2/allowance-benchmarks                 # Historical allowance data by category and tier

# Estimate Presentation
GET    /api/v2/estimates/:id/presentation/configure  # Get presentation config
PUT    /api/v2/estimates/:id/presentation/configure  # Set presentation options
GET    /api/v2/estimates/:id/presentation/pdf        # Generate branded PDF
GET    /api/v2/estimates/:id/presentation/web/:token # Shareable web presentation link

# Pre-Construction Costs
GET    /api/v2/projects/:id/precon-budget            # Get pre-construction budget
POST   /api/v2/projects/:id/precon-budget            # Create pre-construction budget
PUT    /api/v2/precon-budgets/:id/lines/:lineId      # Update pre-con budget line
POST   /api/v2/precon-budgets/:id/roll-to-construction  # Roll pre-con costs into construction budget

# Cost Escalation
POST   /api/v2/estimates/:id/escalation/calculate    # Calculate escalation for projected start date
GET    /api/v2/escalation-indices                     # List available escalation indices
PUT    /api/v2/escalation-indices/:id                 # Update custom escalation rate
```

---

## UI Components

| Component | Description |
|-----------|-------------|
| `EstimateList` | Filterable list of estimates by project, status, date |
| `EstimateEditor` | Hierarchical line-item editor with inline editing, drag-to-reorder |
| `AssemblyLibrary` | Browse, search, and manage assembly recipes |
| `AssemblyInserter` | Insert assembly into estimate with parameter input (e.g., "150 LF") |
| `CostCodePicker` | Searchable dropdown for cost code selection |
| `VersionCompare` | Side-by-side diff showing added/removed/changed lines |
| `MarkupConfigurator` | Builder settings for markup type, rates, rounding |
| `EstimatePresentation` | Read-only formatted views for client, builder, bank |
| `BidComparisonTable` | Normalized side-by-side vendor bid comparison |
| `BudgetDashboard` | Budget vs. committed vs. actual with progress bars and alerts |
| `CostToCompleteChart` | Projection chart showing spend curve and forecasted final cost |
| `EarnedValueChart` | CPI/SPI trend lines over project duration |
| `ContingencyTracker` | Visual remaining contingency with draw history |
| `ValueEngineeringLog` | Table of VE items with status and running savings total |
| `AIConfidenceBadge` | Shows data-point count and confidence level on AI suggestions |

---

## Dependencies

- **Module 3: Core Data Model** -- cost code definitions, project context
- **Module 9: Budget & Cost Tracking** -- budget conversion target, committed/actual feeds
- **Module 10: Contact/Vendor Management** -- vendor data for bid invitations
- **Module 23: Price Intelligence** -- AI pricing data feed, historical cost lookups
- **Module 7: Scheduling** -- schedule generation from estimate, earned value schedule data
- **Module 6: Document Storage** -- plan uploads for AI takeoff

---

## Open Questions

1. Should assembly libraries be shareable across builders on the platform (anonymized marketplace), or strictly per-tenant?
2. For AI plan takeoffs (Gap 499), what is the minimum viable scope for V1? Room identification + area calculation, or full fixture counting?
3. How granular should earned value tracking be -- per cost code, per phase, or per project only?
4. Should bid comparison include a "recommend" feature that auto-selects the best bid based on configurable criteria (lowest price, best value, preferred vendor)?
5. What is the migration path for builders importing estimates from Excel, Buildertrend, or CoConstruct?
6. How do we handle regional pricing adjustments -- by zip code, by metro area, or by state?

