# Module 22: Vendor Performance Scoring

**Phase:** 4 - Intelligence
**Status:** TODO
**Priority:** High (data-driven trade partner decisions)

---

## Overview

An automated scoring and analytics system that evaluates vendors and subcontractors across multiple performance dimensions: quality of work, schedule adherence, budget accuracy, communication responsiveness, and safety record. Aggregates data from punch lists, inspections, schedule tasks, invoices, RFIs, and daily logs to produce objective, data-driven vendor scorecards. Enables builders to make informed decisions when selecting trade partners, identify performance trends early, and maintain accountability across their vendor network. Scoring is per-builder (tenant-scoped) with optional anonymous platform-wide benchmarking.

---

## Gap Items Addressed

| Gap # | Description | Section |
|-------|-------------|---------|
| 381 | Vendor profiles managed per-builder vs. vendor's own profile | Vendor Data Model |
| 383 | Vendor compliance tracking (insurance, license, safety) | Compliance Scoring |
| 384 | Vendor prequalification workflows | Prequalification |
| 385 | Vendor bid management (invitation, submission, comparison) | Bid Performance |
| 389 | Vendor blacklisting (builder-level, not platform-level) | Status Management |
| 390 | Platform-wide anonymous vendor performance benchmarks | Benchmarking |
| 391 | Vendor succession (key person leaves, data stays with company) | Data Continuity |
| 708 | Vendor profile: contact info, addresses, key personnel | Profile Page |
| 709 | Insurance status with expiration countdown | Compliance |
| 710 | License status with verification link | Compliance |
| 711 | Performance scorecard visual dashboard | Profile Page |
| 712 | Job history with performance data per job | Profile Page |
| 713 | Financial summary (total spend, avg invoice, payment history) | Profile Page |
| 714 | Active contracts and POs | Profile Page |
| 715 | Open punch items across all jobs | Quality Metric |
| 716 | Schedule reliability metrics (on-time start %, on-time completion %) | Schedule Metric |
| 717 | Bid history (all bids submitted, won/lost, pricing trends) | Bid Performance |
| 718 | Communication log (recent messages, calls, emails) | Communication Metric |
| 719 | Document repository (COI, W-9, contracts, lien waivers) | Compliance |
| 720 | Internal notes and tags | Profile Page |
| 721 | Related vendors (subsidiary relationships) | Data Model |
| 722 | Capacity indicator (active jobs with this builder) | Profile Page |
| 723 | Quick actions (Create PO, Invite to Bid, Send Message, Schedule) | Profile Page |
| 1054 | Weekly vendor performance review — any vendors underperforming this week | Weekly underperformance alert with per-vendor action recommendations |

---

## Detailed Requirements

### 1. Scoring Algorithm

The vendor performance score is a weighted composite of five dimensions. Weights are configurable per builder (see Edge Cases below for configuration details).

**Quality Score (default weight: 30%)**
- Punch list item count per project relative to scope size.
- Punch list resolution time (average days to complete corrections).
- Inspection pass rate on first attempt.
- Warranty callback rate (callbacks attributed to this vendor within 12 months of completion).
- Client satisfaction ratings (if collected).
- **FTQ (First-Time Quality) Score**: Key quality metric calculated from Module 28 checklist results.
  - %FTQ = (First-pass inspections / Total inspections) x 100
  - FTQ score feeds directly into the Quality dimension (30% weight)
  - FTQ Thresholds:
    - **Excellent**: 95%+ (green badge, preferred vendor consideration)
    - **Good**: 85-94% (blue badge, meets expectations)
    - **Fair**: 70-84% (yellow badge, improvement needed)
    - **Poor**: <70% (red badge, probation consideration)

**Timeliness Score (default weight: 25%)**
- On-time start percentage: % of scheduled tasks where vendor started on the scheduled date (Gap 716).
- On-time completion percentage: % of tasks completed by the scheduled end date.
- Average days early/late across all tasks.
- Response time to schedule requests (time from builder request to vendor confirmation).

**Communication Score (default weight: 15%)**
- RFI response time: average days to respond to RFIs directed at this vendor.
- Message response time: average time to respond to portal messages.
- Daily log compliance: how often the vendor checks in or provides updates when expected.
- Proactive communication: frequency of vendor-initiated updates (Gap 718).

**Budget/Pricing Score (default weight: 20%)**
- Bid accuracy: original bid amount vs. final invoiced amount (excluding owner-initiated changes).
- Change order frequency: number of vendor-initiated COs per project.
- Invoice accuracy: percentage of invoices that match PO amounts without adjustment.
- Price competitiveness: vendor pricing relative to other bids for the same scope.

**Safety & Compliance Score (default weight: 10%)**
- Insurance currency: days with lapsed insurance in the scoring period (Gap 709).
- License validity: current license status and any lapses (Gap 710).
- Safety incident count from daily logs.
- OSHA violation history (if tracked).
- Required document submission timeliness (COI renewals, W-9 updates) (Gap 719).

### 2. Score Calculation

- Scores are calculated on a 0-100 scale per dimension, then weighted to produce a composite score.
- Rolling calculation window: configurable per builder (last 6 months, 12 months, 24 months, or all time).
- Minimum data threshold: vendor must have at least N completed tasks/projects before a score is generated (prevents unreliable scores from small samples).
- Scores recalculate nightly via a background job, or on-demand when a vendor profile is viewed.
- Score trend: track score changes over time to identify improving or declining vendors.

#### Edge Cases & What-If Scenarios

1. **Vendor performs well on some projects but poorly on others.** The system must support both per-project and overall performance scores. Per-project scores are displayed on the job history table (Section 3) and enable builders to assess whether poor performance was an anomaly or a pattern. The overall composite score uses the weighted rolling calculation, but the builder can drill down to see per-project breakdowns. If a vendor's per-project scores have high variance (standard deviation > configurable threshold), the system displays a "variable performance" indicator on their scorecard, alerting the builder that the overall score may not be representative.

2. **Builder's scoring criteria are biased.** The system should include guidance and best practices for setting up scoring weights to reduce bias. Required behavior: (a) provide default weight presets based on industry norms (see below), (b) display a "scoring health" indicator that warns if weights are heavily skewed (e.g., one dimension > 50%), (c) when a builder adjusts weights, show a preview of how the top 5 vendor rankings would change, and (d) include a help article explaining how each scoring dimension is calculated and what constitutes a fair weight distribution.

3. **Manual override allowance for automated scores.** Automated scoring is powerful, but builders must be able to add manual context that the data does not capture. Required behavior: (a) builders can add a manual adjustment of +/- 10 points to any vendor's composite score with a required written justification, (b) manual adjustments are displayed with a distinct badge so team members know the score has been overridden, (c) manual notes can be attached to any scoring dimension explaining context (e.g., "low timeliness score was due to material shortage, not vendor fault"), and (d) an audit log tracks all manual overrides with who, when, and why.

4. **Builder-configurable scoring weights.** Different builders prioritize different performance dimensions. Required behavior:
   - **Default weights** -- platform provides sensible defaults: Quality 25%, Timeliness 25%, Communication 15%, Budget 20%, Safety 15%.
   - **Builder customization** -- each builder can adjust weights via a slider interface in Settings > Vendor Scoring. Weights must sum to 100%.
   - **Weight presets** -- provide 3-4 presets:
     - **Balanced** (default): 25/25/15/20/15
     - **Quality-Focused**: 35/20/15/15/15
     - **Budget-Focused**: 15/25/10/35/15
     - **Safety-First**: 15/20/10/15/40
   - **Per-trade overrides (Phase 2)** -- allow different weights per trade (e.g., safety weighted higher for roofing/framing, quality weighted higher for finish carpentry).
   - **Score recalculation** -- changing weights triggers a background recalculation of all vendor composite scores for that builder. Historical snapshots are NOT recalculated (they reflect the weights at time of capture).

### 3. Historical Performance Data Aggregation

- **Job history**: Every project the vendor has worked on with per-job performance breakdown (Gap 712).
- **Financial summary**: Total lifetime spend, average invoice amount, payment terms compliance, total change orders (Gap 713).
- **Bid history**: All bids submitted, win/loss ratio, average bid accuracy, pricing trend over time (Gap 717).
- **Punch list history**: Total items, resolution rate, average resolution time (Gap 715).
- **Active workload**: Current contracts, POs, and scheduled tasks across all of this builder's projects (Gap 714, 722).

### 4. Vendor Ranking by Trade

- Rank vendors within each trade category (Framing, Electrical, Plumbing, HVAC, etc.).
- Ranking considers composite score, total projects, and recency of work.
- "Preferred vendor" designation: builder can flag top vendors per trade.
- "Probation" and "blacklisted" statuses at the builder level (not platform-wide) (Gap 389).
- Capacity-aware ranking: factor in vendor's current workload when recommending for new projects.

### 5. Warranty Callback Tracking

- When a warranty claim is logged, it is attributed to the responsible vendor based on the trade/scope.
- Callback rate: number of warranty callbacks per project, per vendor.
- Callback severity: minor (cosmetic), moderate (functional), major (structural/safety).
- Callback resolution time and cost.
- Warranty performance factors into the quality score.

### 6. Weekly Vendor Performance Review (Gap 1054)

- Weekly performance alert report: automatically identify vendors who underperformed this week across all active projects
- Underperformance criteria: missed scheduled start dates, late task completions, unresponsive to messages/RFIs, punch items created due to their work, safety observations logged
- Per-vendor summary: what happened this week, which projects are affected, recommended action
- Action options per vendor: send performance notice, schedule discussion, place on probation, reassign upcoming work
- Week-over-week trend: is this vendor's performance declining, or was this week an anomaly?
- Integration with daily log data: pull specific daily log entries that reference this vendor's work quality or schedule issues

### 7. Automated Performance Reports

- **Monthly vendor scorecard**: Auto-generated report showing all active vendors with scores, trends, and alerts.
- **Project completion vendor review**: At project closeout, auto-generate a per-vendor performance summary.
- **Compliance expiration report**: Vendors with insurance, license, or document expirations in the next 30/60/90 days.
- **Underperforming vendor alert**: Notification when a vendor's score drops below a configurable threshold.
- Reports delivered via email on a configurable schedule or on-demand.

### 8. Platform-Wide Benchmarking (Optional)

- With builder consent, vendor scores contribute to anonymous platform-wide benchmarks (Gap 390).
- Builders see: "This vendor's performance is in the top 20% for [trade] in [region]."
- Benchmarks are anonymized: no builder can see another builder's specific data.
- Vendors who work for multiple builders on the platform get a composite benchmark score.
- Builders can opt in or out of the benchmarking program.

### 9. Vendor Profile Page

- Unified profile view aggregating all vendor data (Gap 708-723):
  - Contact information, addresses, key personnel (Gap 708)
  - Visual performance scorecard with radar chart (Gap 711)
  - Job history table with per-job scores (Gap 712)
  - Financial summary cards (Gap 713)
  - Active contracts and POs list (Gap 714)
  - Open punch items across all jobs (Gap 715)
  - Bid history with win/loss and pricing trends (Gap 717)
  - Communication log (Gap 718)
  - Document repository: COI, W-9, contracts, lien waivers (Gap 719)
  - Internal notes and tags (Gap 720)
  - Related vendor entities / subsidiary relationships (Gap 721)
  - Capacity indicator showing active job count (Gap 722)
  - Quick action buttons: Create PO, Invite to Bid, Send Message, Schedule Meeting (Gap 723)

### 10. Vendor FTQ Dashboard

The Vendor FTQ Dashboard provides a comprehensive view of a vendor's quality performance based on First-Time Quality (FTQ) metrics from Module 28 checklist results.

**Dashboard Components:**

- **Current FTQ Score**: Large display showing current FTQ percentage with color-coded badge (Excellent/Good/Fair/Poor)
- **FTQ by Trade/Scope**: Breakdown of FTQ performance by the different work scopes the vendor performs
- **FTQ Trend Chart**: Line chart showing FTQ percentage over configurable time periods (30, 60, 90, 180, 365 days)
- **Peer Comparison**: Side-by-side comparison with other vendors in the same trade category
- **FTQ Rankings**: Where this vendor ranks among all vendors in their trade(s) based on FTQ score

**Calculation Details:**
- FTQ calculated from inspection checklists in Module 28
- First-pass inspection = checklist completed with all items passing on initial submission
- Rolling window configurable: 30, 60, 90, 180, or 365 days
- Minimum inspection count required before FTQ is displayed (configurable, default: 10)

**Display Logic:**
- If vendor has insufficient data, show "Insufficient Data" message with count needed
- If vendor is new (< 90 days), show "New Vendor" badge alongside FTQ
- Highlight significant changes (> 5% improvement or decline) from previous period

### 11. AI-Powered Quality Prediction

Leverages historical FTQ data and contextual factors to predict likely quality outcomes for future vendor assignments.

**Predicted FTQ Score:**
- AI model predicts FTQ percentage for upcoming work based on:
  - Historical FTQ performance with this builder
  - Performance on similar scope/trade work
  - Crew composition (if tracked)
  - Current workload/capacity
  - Seasonal patterns (e.g., winter framing quality)
  - Recent trend direction (improving vs. declining)

**Confidence Score:**
- Each prediction includes a confidence percentage (0-100%)
- Confidence based on:
  - Volume of historical data available
  - Consistency of past performance
  - Similarity of predicted work to historical work
  - Recency of data

**Risk Factors:**
- AI identifies specific risk factors that may impact quality:
  - "Vendor is over capacity (5 active jobs)"
  - "Recent FTQ decline of 12% over past 60 days"
  - "First time performing this scope for this builder"
  - "Crew changes detected (new lead assigned)"
  - "Historically lower FTQ on projects > $500K"

**Suggested Mitigations:**
- For each risk factor, AI provides actionable recommendations:
  - "Consider additional inspection checkpoints"
  - "Request dedicated crew assignment"
  - "Schedule pre-work quality review meeting"
  - "Increase inspection frequency for first 2 weeks"

**Alternative Vendor Suggestions:**
- When predicted FTQ is below threshold, suggest alternative vendors:
  - Show top 3 alternative vendors in same trade
  - Display their predicted FTQ and availability
  - Include cost comparison if bid data available

### 12. FTQ Integration with Bid Evaluation

Integrates FTQ quality metrics into the bid evaluation and vendor selection process.

**Bid List Display:**
- FTQ score badge displayed next to each vendor in bid comparison views
- Color-coded to quickly identify quality tier (green/blue/yellow/red)
- Tooltip shows FTQ breakdown: current %, trend, peer percentile

**Warning Badges:**
- Automatic warning badges for quality concerns:
  - "Low FTQ" badge for vendors below configurable threshold (default: 70%)
  - "Declining" badge for vendors with > 10% FTQ drop in past 90 days
  - "Variable Quality" badge for vendors with high FTQ standard deviation
  - "New Vendor" badge for vendors with < 10 inspections on file

**Trend Indicators:**
- Visual trend indicators on each vendor in bid list:
  - Up arrow (green): FTQ improved > 5% over past 90 days
  - Flat arrow (gray): FTQ stable (within +/- 5%)
  - Down arrow (red): FTQ declined > 5% over past 90 days

**Minimum FTQ Filter:**
- Bid list filter option: "Minimum FTQ Score"
- Allows builder to exclude vendors below a quality threshold from bid consideration
- Filter options: 95%, 90%, 85%, 80%, 70%, No minimum
- Filtered vendors shown in a collapsed "Below FTQ Threshold" section (not hidden entirely)

**Bid Scoring Integration:**
- When scoring bids, FTQ can be factored into overall bid ranking:
  - Configurable weight for FTQ in bid score (0-30%)
  - Default: 15% weight
  - Formula: Bid Score = (Price Score x price_weight) + (FTQ Score x ftq_weight) + (Other Factors x other_weights)

---

## Database Tables

```
v2_vendor_scores
  id, builder_id, vendor_id, quality_score, timeliness_score, communication_score,
  budget_score, safety_score, composite_score, data_point_count, calculation_window,
  calculated_at, created_at

v2_vendor_score_history
  id, vendor_score_id, composite_score, quality_score, timeliness_score,
  communication_score, budget_score, safety_score, snapshot_date

v2_vendor_score_config
  id, builder_id, quality_weight, timeliness_weight, communication_weight,
  budget_weight, safety_weight, calculation_window_months, min_data_points,
  alert_threshold, created_at, updated_at

v2_vendor_job_performance
  id, builder_id, vendor_id, project_id, trade, tasks_on_time, tasks_total,
  punch_items_count, punch_resolution_avg_days, inspection_pass_rate,
  bid_amount, final_amount, change_order_count, rating_notes, created_at

v2_vendor_compliance
  id, builder_id, vendor_id, compliance_type (insurance|license|w9|safety_cert|bond),
  document_id, issue_date, expiration_date, status (current|expiring_soon|expired|missing),
  verified_by, verified_at, notes, created_at

v2_vendor_warranty_callbacks
  id, builder_id, vendor_id, project_id, warranty_claim_id, severity (minor|moderate|major),
  description, resolution_cost, resolution_days, status (open|in_progress|resolved), created_at

v2_vendor_notes
  id, builder_id, vendor_id, author_id, body, tags, is_internal, created_at

v2_vendor_relationships
  id, builder_id, vendor_id, related_vendor_id, relationship_type (parent|subsidiary|dba|successor),
  notes, created_at

v2_vendor_status
  id, builder_id, vendor_id, status (active|preferred|probation|blacklisted|inactive),
  reason, changed_by, changed_at

v2_vendor_benchmarks
  vendor_id, trade, region, percentile_rank, benchmark_score, sample_size,
  calculated_at

-- FTQ-Specific Tables --

vendors (additional columns)
  ftq_score DECIMAL(5,2)             -- Current FTQ percentage (0-100)
  ftq_calculation_date TIMESTAMP     -- When FTQ was last calculated
  ftq_inspection_count INTEGER       -- Number of inspections in calculation window
  ftq_trend VARCHAR(20)              -- 'improving', 'stable', 'declining'
  ftq_trend_percentage DECIMAL(5,2)  -- Percentage change from previous period

v2_vendor_ftq_history
  id UUID PRIMARY KEY
  builder_id UUID NOT NULL           -- Tenant scope
  vendor_id UUID NOT NULL
  trade VARCHAR(100)                 -- Trade/scope for this FTQ calculation
  period_start DATE NOT NULL         -- Start of calculation period
  period_end DATE NOT NULL           -- End of calculation period
  total_inspections INTEGER          -- Total inspections in period
  first_pass_inspections INTEGER     -- Inspections passed on first attempt
  ftq_percentage DECIMAL(5,2)        -- Calculated FTQ (first_pass/total * 100)
  calculation_window INTEGER         -- Window in days (30, 60, 90, 180, 365)
  created_at TIMESTAMP DEFAULT NOW()
  UNIQUE(builder_id, vendor_id, trade, period_end, calculation_window)

v2_vendor_quality_predictions
  id UUID PRIMARY KEY
  builder_id UUID NOT NULL
  vendor_id UUID NOT NULL
  project_id UUID                    -- Optional: prediction for specific project
  trade VARCHAR(100)
  predicted_ftq DECIMAL(5,2)         -- AI predicted FTQ percentage
  confidence_score DECIMAL(5,2)      -- Confidence in prediction (0-100)
  risk_factors JSONB                 -- Array of identified risk factors
  suggested_mitigations JSONB        -- Array of suggested actions
  alternative_vendors JSONB          -- Array of suggested alternatives
  model_version VARCHAR(50)          -- AI model version used
  prediction_date TIMESTAMP
  actual_ftq DECIMAL(5,2)            -- Filled in after work completed (for model training)
  created_at TIMESTAMP DEFAULT NOW()
```

---

## API Endpoints

```
# Scores
GET    /api/v2/vendors/:id/score                    # Get current vendor score
GET    /api/v2/vendors/:id/score/history             # Score trend over time
GET    /api/v2/vendors/:id/score/breakdown           # Detailed dimension breakdown
PUT    /api/v2/vendor-score-config                   # Update builder's scoring weights

# Rankings
GET    /api/v2/vendors/rankings                      # Ranked vendor list (filterable by trade)
GET    /api/v2/vendors/rankings/:trade               # Top vendors for a specific trade

# Performance Data
GET    /api/v2/vendors/:id/job-history               # All projects with per-job performance
GET    /api/v2/vendors/:id/financial-summary          # Spend, invoice, payment data
GET    /api/v2/vendors/:id/bid-history               # All bids with win/loss and accuracy
GET    /api/v2/vendors/:id/punch-items               # Open punch items across all jobs
GET    /api/v2/vendors/:id/warranty-callbacks          # Warranty callback history

# Compliance
GET    /api/v2/vendors/:id/compliance                # All compliance documents and status
POST   /api/v2/vendors/:id/compliance                # Add compliance document
PUT    /api/v2/vendors/compliance/:compId            # Update compliance record
GET    /api/v2/vendors/compliance/expiring            # All vendors with upcoming expirations

# Status & Notes
PUT    /api/v2/vendors/:id/status                    # Update vendor status (preferred, probation, etc.)
GET    /api/v2/vendors/:id/notes                     # List internal notes
POST   /api/v2/vendors/:id/notes                     # Add internal note
GET    /api/v2/vendors/:id/relationships             # Related vendor entities

# Reports
GET    /api/v2/reports/vendor-scorecard              # Monthly scorecard report
GET    /api/v2/reports/vendor-compliance             # Compliance expiration report
GET    /api/v2/reports/vendor-project-review/:projectId  # Project closeout vendor review

# Benchmarks
GET    /api/v2/vendors/:id/benchmark                 # Platform-wide benchmark for this vendor
PUT    /api/v2/settings/benchmarking                 # Opt in/out of benchmarking program

# FTQ Endpoints
GET    /api/v2/vendors/:id/ftq                       # Get current FTQ score and details
GET    /api/v2/vendors/:id/ftq/history               # FTQ trend over time with configurable window
GET    /api/v2/vendors/:id/ftq/by-trade              # FTQ breakdown by trade/scope
GET    /api/v2/vendors/:id/ftq/prediction            # AI-predicted FTQ for upcoming work
GET    /api/v2/vendors/ftq/rankings                  # Vendor rankings by FTQ score (filterable by trade)
POST   /api/v2/vendors/:id/ftq/recalculate           # Trigger FTQ recalculation for a vendor
```

---

## UI Components

| Component | Description |
|-----------|-------------|
| `VendorScorecard` | Radar chart showing five dimension scores with composite |
| `ScoreTrendChart` | Line chart showing composite score over time |
| `VendorRankingTable` | Sortable table of vendors by trade with scores and status |
| `ComplianceDashboard` | Grid of compliance items with expiration countdowns and status colors |
| `JobHistoryTable` | Expandable table of projects with per-job performance metrics |
| `FinancialSummaryCards` | Cards showing total spend, avg invoice, payment compliance |
| `BidHistoryChart` | Chart showing bid accuracy and pricing trends over time |
| `PunchItemsList` | Vendor's open punch items across all projects |
| `WarrantyCallbackLog` | Table of warranty callbacks with severity and resolution data |
| `VendorStatusBadge` | Color-coded badge (active, preferred, probation, blacklisted) |
| `VendorCapacityIndicator` | Visual showing current active jobs for this vendor |
| `VendorNotesPanel` | Internal notes and tags with add/edit capability |
| `VendorRelationshipMap` | Visual showing parent/subsidiary/DBA relationships |
| `VendorQuickActions` | Action buttons: Create PO, Invite to Bid, Send Message |
| `ScoringWeightConfigurator` | Builder settings to adjust dimension weights |
| `ComplianceAlertBanner` | Alert bar showing vendors with expiring compliance documents |
| `VendorFTQDashboard` | Comprehensive FTQ quality dashboard with score, trends, and rankings |
| `FTQScoreBadge` | Color-coded FTQ badge (Excellent/Good/Fair/Poor) with percentage |
| `FTQTrendChart` | Line chart showing FTQ percentage over configurable time periods |
| `FTQByTradeBreakdown` | Table/chart showing FTQ performance broken down by trade/scope |
| `FTQPeerComparison` | Side-by-side comparison with peer vendors in same trade |
| `FTQRankingWidget` | Shows vendor's FTQ rank within their trade category |
| `QualityPredictionCard` | AI prediction display with predicted FTQ, confidence, and risks |
| `RiskFactorsList` | List of AI-identified quality risk factors with severity indicators |
| `MitigationSuggestions` | Actionable recommendations to address quality risks |
| `AlternativeVendorPanel` | Suggested alternative vendors when predicted FTQ is low |
| `BidFTQBadge` | FTQ badge displayed in bid comparison views |
| `BidQualityWarning` | Warning badges for quality concerns in bid evaluation |
| `BidTrendIndicator` | Visual trend arrow (up/flat/down) for FTQ changes |
| `MinimumFTQFilter` | Filter control to set minimum FTQ threshold for bid lists |
| `BidFTQScoreIntegration` | Display showing how FTQ factors into bid scoring |

---

## Dependencies

- **Module 10: Contact/Vendor Management** -- vendor master records, contact data
- **Module 7: Scheduling** -- schedule adherence data (planned vs. actual dates)
- **Module 9: Budget & Cost Tracking** -- bid accuracy (estimate vs. actual), invoice data
- **Module 28: Punch List & Quality** -- punch item counts, resolution times, inspection data, FTQ checklist results
- **Module 27: Warranty & Home Care** -- warranty callback data
- **Module 21: RFI Management** -- RFI response times
- **Module 14: Daily Logs** -- safety observations, vendor presence data
- **Module 6: Document Storage** -- compliance document storage

---

## Open Questions

1. What is the minimum number of data points (projects/tasks) required before a vendor score is displayed? Should this be per-dimension or composite only?
2. For platform-wide benchmarking (Gap 390), what is the minimum number of participating builders needed before benchmarks are meaningful? How is region defined (zip, metro, state)?
3. Should vendors be able to see their own performance scores? If so, which dimensions and at what level of detail?
4. How do we handle vendor succession (Gap 391) -- does the score transfer when a company is acquired or when a key person leaves? Is this manual or automated?
5. Should scoring weight presets be provided (e.g., "quality-focused," "budget-focused," "balanced") or always fully custom per builder?
6. How do we handle disputed scores -- can a vendor challenge a low rating on a specific project?
7. For FTQ predictions, what is the minimum number of historical jobs required before AI predictions are enabled for a vendor?
8. Should FTQ thresholds be configurable per builder, or should they be platform-wide standards?
9. How do we handle the case where a vendor's crew changes significantly -- should FTQ history be reset or weighted differently?
10. Should predicted FTQ factor into automated bid ranking, or remain advisory only?
