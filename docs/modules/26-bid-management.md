# Module 26: Bid Management & Comparison

**Phase:** 4 - Intelligence
**Status:** TODO
**Priority:** High (core builder workflow)

---

## Overview

End-to-end bid solicitation, collection, comparison, and award management. Enables builders to create bid packages from project scope, distribute invitations to qualified vendors, collect structured bid responses, normalize and level bids for apples-to-apples comparison, and leverage AI to detect scope gaps and recommend awards. Integrates tightly with estimating (Module 20), vendor management (Module 10), and the vendor portal (Module 30) for a seamless bidding experience on both sides of the transaction.

---

## Gap Items Addressed

| Gap # | Description | Coverage |
|-------|-------------|----------|
| 257 | Different cost code systems (CSI, custom, hybrid) | Bid packages map to builder's cost code structure |
| 259 | Estimate templates by project type | Bid packages auto-populate from estimate templates |
| 268 | Handling estimates without bids yet (placeholders) | Track which budget lines still need bids |
| 269 | Scope exclusions in estimates | Scope inclusion/exclusion tracking in bid packages |
| 270 | Alternate/option pricing within estimates | Bid alternates and options supported per line |
| 271 | Estimate expiration | Bid validity period tracking and expiration alerts |
| 381 | Vendors on platform working for multiple builders | Vendor sees bids from multiple builders in their portal |
| 382 | Vendor self-registration | Vendors can register and be discoverable for bid invitations |
| 384 | Vendor prequalification workflows | Only prequalified vendors receive bid invitations |
| 385 | Vendor bid management through platform | Full bid lifecycle in-platform |
| 386 | Vendor payment terms | Bid responses include proposed payment terms |
| 387 | Vendor rate sheets | Standing pricing can pre-fill bid responses |
| 390 | Vendor performance benchmarks | Historical bid accuracy informs vendor scoring |
| 491 | AI per-tenant vs. cross-tenant learning | Cross-tenant bid intelligence (anonymized) |
| 498 | AI-powered data entry (upload bid, AI extracts) | AI bid document parsing |
| 502 | AI anomaly detection | Flag bid amounts that deviate significantly from expected range |
| 939 | Plan set distribution management — track which plan version went to which vendors, with read receipts | Plan distribution tracker with version control, delivery receipts, and superseded-plan alerts |

---

## Detailed Requirements

### 26.1 Bid Package Creation

Build structured bid packages from project scope, plans, and specifications.

- **Scope Definition:** Create bid packages by selecting cost code categories, line items, or custom scope descriptions from the project estimate or template.
- **Document Attachment:** Attach relevant drawings, specifications, and scope narratives to each bid package. Link to Document Storage (Module 6).
- **Multi-Trade Packages:** Support single-trade packages (e.g., "Framing") and bundled packages (e.g., "Rough MEP" covering plumbing, electrical, HVAC).
- **Bid Form Configuration:** Builder defines what information vendors must provide: lump sum, unit prices, line-item breakdown, alternates, payment terms, schedule requirements, exclusions.
- **Scope Inclusion/Exclusion Checklist:** Explicit checklist of what is and is not included in scope. Vendors acknowledge each item.
- **Template Library:** Save and reuse bid package templates by trade and project type. Builder-specific template libraries.

### Plan Set Distribution Management (Gap 939)
- Track which version of construction plans was sent to which vendors, with timestamps
- Read receipt tracking: confirm vendor received and opened the plan set
- Version control: when plans are revised, auto-notify all vendors who received the prior version
- Superseded plan alert: clearly flag that a newer plan version is available and the old version is no longer current
- Distribution log per plan set: who received it, when, via what channel, which version
- Prevent bidding on outdated plans: bid submission form validates against the latest plan version and warns if the vendor's bid references an older set

### 26.2 Bid Invitation and Tracking

Distribute bid packages to qualified vendors and track response status.

- **Vendor Selection:** Select vendors from the builder's approved vendor list. Filter by trade, prequalification status, geographic service area, past performance, and **FTQ (First-Time Quality) score** (Module 22). Display vendor's FTQ score and trend when selecting bidders.
- **Invitation Distribution:** Send bid invitations via platform notification, email, or both. Include bid package link, due date, and pre-bid meeting details.
- **Status Dashboard:** Track each invitation: Sent, Viewed, Acknowledged, Bid Submitted, Declined, No Response.
- **Due Date Management:** Configurable bid due dates with automated reminder notifications (7 days, 3 days, 1 day before due).
- **Pre-Bid Clarifications:** In-platform Q&A where vendors can ask questions and all invited vendors see answers (configurable: anonymous or attributed).
- **Bid Extension:** Allow due date extensions with notification to all bidders.

### 26.3 Bid Leveling and Normalization

Normalize bid responses for accurate comparison regardless of how vendors format their bids.

- **Structured Data Extraction:** Bids submitted through the vendor portal are already structured. For uploaded bid documents (PDF, Excel), AI extracts line items, quantities, and prices.
- **Normalization Engine:** Map vendor line items to the builder's cost code structure. Flag unmapped items for manual resolution.
- **Scope Leveling:** Compare what each vendor included vs. the bid package scope checklist. Highlight scope gaps, additions, and exclusions per bidder.
- **Unit Price Normalization:** Convert mixed pricing formats (lump sum, unit price, per-SF) to a common basis for comparison.
- **Alternate Tracking:** Track base bid + each alternate separately. Allow comparison with different alternate combinations.

### 26.4 AI Bid Comparison and Recommendations

Leverage AI to analyze bids, detect anomalies, and recommend award decisions.

- **Bid Comparison Matrix:** Auto-generated side-by-side comparison showing: price, scope coverage, proposed schedule, payment terms, exclusions, vendor composite score, and **FTQ score with trend indicator** (integrates with Module 22 vendor performance).
- **Anomaly Detection:** Flag bids that are significantly above or below the expected range based on historical data, estimate amounts, or peer bids.
- **Scope Gap Detection:** AI identifies scope items that no bidder or only one bidder included. Alerts builder to potential scope holes.
- **Award Recommendation:** Weighted scoring algorithm considering: price (configurable weight), vendor past performance, **FTQ score** (with quality trend), scope completeness, schedule compatibility, payment terms. Builder configures scoring weights. Vendors below FTQ threshold (configurable, default 75%) flagged with quality warning.
- **Historical Accuracy Tracking:** Track how actual project costs compared to winning bids. Feed back into vendor reliability scoring.

#### Edge Cases & What-If Scenarios

1. **Vendor submits a bid that is wildly different from others.** The anomaly detection feature must handle extreme outliers gracefully. Required behavior: (a) flag bids that deviate more than a configurable threshold (default: 30%) from the median of all submitted bids, (b) distinguish between "suspiciously low" (may indicate scope misunderstanding or buying the job) and "suspiciously high" (may indicate the vendor is not interested or has capacity constraints), (c) present the anomaly flag to the builder with context ("This bid is 45% below the next lowest -- review scope coverage carefully"), and (d) do not auto-reject anomalous bids -- always surface them for builder review with the relevant warnings.

2. **Vendor disputes the bid comparison.** When a vendor believes the bid comparison is unfair (e.g., their bid was normalized incorrectly, scope items were miscategorized, or their qualifications were not factored), there must be a dispute process. Required behavior: (a) vendors can submit a "bid clarification" through the portal referencing specific comparison items, (b) the builder receives the clarification and can adjust the normalized data with an audit trail, (c) the comparison matrix displays a "revised" indicator when adjustments have been made, and (d) all clarifications and adjustments are part of the permanent bid record.

3. **Bid normalization from different formats.** Vendors submit bids in different formats (lump sum, unit price, per-SF, hourly estimates), and the AI-powered normalization must be accurate enough to make comparisons meaningful. Required behavior: (a) the normalization engine converts all pricing to a common basis using the bid package's defined unit of measure, (b) when normalization requires assumptions (e.g., converting lump sum to per-SF requires a scope area), the system documents the assumptions used, (c) items that cannot be confidently normalized are flagged as "manual review required" rather than silently estimated, and (d) the builder can override any normalized value with the original vendor number and a note explaining the discrepancy.

### 26.5 Vendor Bid History

Maintain a searchable history of all bids received, enabling better vendor selection and pricing intelligence.

- **Vendor Bid Archive:** All bids stored permanently (or per retention policy). Searchable by vendor, trade, project type, date range, price range.
- **Price Trend Analysis:** Track vendor pricing trends over time. "This vendor's framing prices have increased 8% over the past 12 months."
- **Win Rate Tracking:** Track how often each vendor wins bids and at what price point relative to competitors.
- **Budget Validation:** When creating a new estimate, pull historical bid data to validate budget assumptions. "Your framing budget of $45/SF is 10% below the average bid you received last year."

---

## Database Tables

### bid_packages
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders (multi-tenant) |
| project_id | uuid | FK to projects |
| name | varchar(200) | Bid package name |
| description | text | Scope narrative |
| trade_category | varchar(100) | Primary trade |
| cost_codes | jsonb | Array of cost codes covered |
| scope_checklist | jsonb | Inclusion/exclusion checklist |
| bid_form_config | jsonb | Required response fields |
| due_date | timestamptz | Bid submission deadline |
| pre_bid_meeting_date | timestamptz | Optional pre-bid meeting |
| status | varchar(30) | draft, published, closed, awarded |
| template_id | uuid | FK to bid_package_templates (nullable) |
| created_by | uuid | FK to users |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last modification |

### bid_invitations
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders |
| bid_package_id | uuid | FK to bid_packages |
| vendor_id | uuid | FK to vendors |
| status | varchar(30) | sent, viewed, acknowledged, submitted, declined, no_response |
| sent_at | timestamptz | When invitation was sent |
| viewed_at | timestamptz | When vendor first viewed |
| responded_at | timestamptz | When vendor submitted/declined |
| decline_reason | text | Reason if declined |
| reminder_count | integer | Number of reminders sent |
| created_at | timestamptz | Record creation |

### bid_responses
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders |
| bid_package_id | uuid | FK to bid_packages |
| bid_invitation_id | uuid | FK to bid_invitations |
| vendor_id | uuid | FK to vendors |
| total_amount | decimal(14,2) | Total bid amount |
| line_items | jsonb | Structured line-item breakdown |
| alternates | jsonb | Alternate pricing options |
| exclusions | text | Vendor-stated exclusions |
| inclusions | text | Vendor-stated inclusions |
| proposed_schedule | jsonb | Proposed start/duration |
| payment_terms | varchar(100) | Proposed payment terms |
| validity_days | integer | How long bid is valid |
| attachments | jsonb | Array of document references |
| scope_checklist_responses | jsonb | Vendor responses to scope checklist |
| ai_extracted | boolean | Whether AI parsed from document |
| normalized_data | jsonb | Normalized comparison data |
| submitted_at | timestamptz | Submission timestamp |
| created_at | timestamptz | Record creation |

### bid_comparisons
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders |
| bid_package_id | uuid | FK to bid_packages |
| comparison_matrix | jsonb | Full comparison data |
| scope_gaps | jsonb | Detected scope gaps |
| anomalies | jsonb | Flagged anomalies |
| ai_recommendation | jsonb | AI scoring and recommendation |
| scoring_weights | jsonb | Builder-configured scoring weights |
| created_by | uuid | FK to users |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last modification |

### bid_awards
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders |
| bid_package_id | uuid | FK to bid_packages |
| bid_response_id | uuid | FK to bid_responses |
| vendor_id | uuid | FK to vendors |
| awarded_amount | decimal(14,2) | Final awarded amount |
| award_notes | text | Notes on award decision |
| notification_sent_at | timestamptz | When vendor was notified |
| vendor_accepted_at | timestamptz | When vendor accepted |
| contract_generated | boolean | Whether contract was auto-created |
| awarded_by | uuid | FK to users |
| created_at | timestamptz | Record creation |

### bid_package_templates
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders |
| name | varchar(200) | Template name |
| trade_category | varchar(100) | Trade |
| scope_template | jsonb | Default scope checklist |
| bid_form_config | jsonb | Default response fields |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last modification |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v2/projects/:id/bid-packages | Create a bid package |
| GET | /api/v2/projects/:id/bid-packages | List bid packages for a project |
| GET | /api/v2/bid-packages/:id | Get bid package detail |
| PUT | /api/v2/bid-packages/:id | Update bid package |
| POST | /api/v2/bid-packages/:id/publish | Publish and send invitations |
| POST | /api/v2/bid-packages/:id/invitations | Add vendor invitations |
| GET | /api/v2/bid-packages/:id/invitations | List all invitations and statuses |
| POST | /api/v2/bid-packages/:id/clarifications | Post a pre-bid clarification |
| GET | /api/v2/bid-packages/:id/clarifications | Get all clarifications |
| POST | /api/v2/bid-packages/:id/responses | Submit a bid response (vendor) |
| GET | /api/v2/bid-packages/:id/responses | List all bid responses |
| GET | /api/v2/bid-packages/:id/comparison | Get normalized bid comparison |
| POST | /api/v2/bid-packages/:id/comparison/generate | Generate AI comparison and recommendation |
| POST | /api/v2/bid-packages/:id/award | Award bid to vendor |
| GET | /api/v2/vendors/:id/bid-history | Get vendor's bid history |
| GET | /api/v2/bid-analytics/price-trends | Get price trend analytics by trade |
| GET | /api/v2/bid-package-templates | List bid package templates |
| POST | /api/v2/bid-package-templates | Create a bid package template |

---

## UI Components

- **Bid Package Builder** — Wizard for creating bid packages: select scope, attach documents, configure bid form, set due date.
- **Vendor Selection Panel** — Filterable vendor list with prequalification status, past performance scores, and trade tags.
- **Invitation Tracker** — Dashboard showing all invitations per bid package with real-time status indicators.
- **Pre-Bid Q&A Thread** — Threaded Q&A interface visible to all invited vendors (or configurable visibility).
- **Bid Comparison Matrix** — Side-by-side table with scope coverage indicators, price comparison, and anomaly flags.
- **Scope Gap Visualizer** — Checklist view highlighting which scope items each vendor covers, with gaps in red.
- **AI Recommendation Card** — Summary card showing AI-recommended vendor with scoring breakdown and confidence level.
- **Bid History Browser** — Searchable archive of all historical bids with trend charts and vendor win rates.
- **Award Workflow Modal** — Award confirmation with auto-generated notification to winner and decline notices to others.

---

## Dependencies

- **Module 10: Contact/Vendor Management** — Vendor directory, prequalification, and trade categorization
- **Module 20: Estimating Engine** — Scope definition and cost code structure for bid packages
- **Module 6: Document Storage** — Plan and specification attachments on bid packages
- **Module 5: Notification Engine** — Bid invitation, reminder, and award notifications
- **Module 30: Vendor Portal** — Vendor-facing bid submission interface
- **AI/ML Service** — Bid parsing, anomaly detection, and recommendation engine

---

## Open Questions

1. Should builders be able to see anonymized bid data from other builders on the platform for benchmarking? (Privacy implications.)
2. How do we handle reverse auctions where vendors can see and undercut each other? Is this desirable for custom home building?
3. What is the maximum file size for bid document uploads (plans, specs)? Proposed: 100MB per file, 500MB per bid package.
4. Should the AI bid parser support handwritten bid documents, or only typed/digital? (Phase 1: digital only.)
5. How do we handle joint bids from multiple vendors for the same scope?
6. Should bid packages support an "open bid" mode where any platform vendor can bid (not just invited)?
7. What is the retention period for bid data? (Proposed: indefinite for analytics, 7 years for compliance.)
