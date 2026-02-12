# Module 10: Vendor & Subcontractor Management

**Phase:** 2 - Construction Core
**Status:** TODO
**Last Updated:** 2026-02-11

---

## Overview

Centralized directory of subcontractors, suppliers, clients, and other contacts with trade assignments, compliance tracking, performance scoring, communication history, and preferred vendor lists. Supports the multi-tenant SaaS model where vendors may work for multiple builders on the platform, maintaining both a vendor-owned profile and builder-specific data (rates, performance, compliance status). Includes vendor self-registration and onboarding, prequalification workflows, bid management integration, and platform-wide anonymous benchmarking.

## Proven Patterns from v1

### Vendor Auto-Creation (Proven)
- findOrCreateVendor(): normalized company name search
- Creates vendor record if not found during AI invoice processing
- Trade type auto-detected from invoice description
- v1 has 20+ vendor endpoints

---

## Gap Items Addressed

| GAP # | Description | Priority |
|-------|-------------|----------|
| GAP-381 | Vendor profiles: builder-specific data vs. vendor's own profile (platform-wide) | High |
| GAP-382 | Vendor self-registration (vendor signs up, builder approves) | Medium |
| GAP-383 | Compliance tracking: insurance, license, safety -- configurable per builder | High |
| GAP-384 | Prequalification workflows (questionnaire, documents, approval) | Medium |
| GAP-385 | Bid management (invitation, submission, comparison through platform) | High |
| GAP-386 | Payment terms configurable per vendor per builder (Net 30, 2/10 Net 30) | Medium |
| GAP-387 | Rate sheets (standing pricing agreements auto-populate POs) | Medium |
| GAP-388 | Communication preferences per vendor (email, portal, text) | Low |
| GAP-389 | Vendor blacklisting (builder-level, not platform-level) | Medium |
| GAP-390 | Performance benchmarks (platform-wide anonymous data) | Low |
| GAP-391 | Vendor succession (key person leaves -- data stays with company) | Low |
| GAP-392 | Vendor contract templates (builder-configurable standard subcontract) | Medium |
| GAP-393 | Vendor onboarding to platform (first-time guided experience) | Medium |
| GAP-394 | Vendor support (who helps vendors with portal issues?) | Low |
| GAP-553 | State-specific insurance requirements (minimum coverage, endorsements) | Medium |
| GAP-554 | Workers' compensation requirements by state (class codes, EMR) | Medium |
| GAP-555 | Builder's Risk insurance tracking per project | Medium |
| GAP-556 | Additional insured endorsement tracking (auto-request from vendors) | Medium |
| GAP-557 | Annual insurance audit data preparation (payroll/sub costs by class code) | Low |
| 1060 | Monthly insurance certificate review — any vendor certs expiring this month across all vendors | Insurance expiration dashboard with monthly review workflow |
| 1061 | Monthly license renewal review — any licenses expiring for vendors or the builder | License expiration dashboard with proactive renewal alerts |

---

## Detailed Requirements

### 10.1 Dual-Layer Vendor Profiles (GAP-381, GAP-391)

Vendors on the platform have two layers of data:

**Vendor-Owned Profile** (platform-level):
- Company name, address, phone, email, website.
- Trade specialties (self-declared).
- Company contacts and key personnel.
- Insurance certificates (uploaded by vendor).
- Licenses and certifications.
- Service area / geographic coverage.
- This profile belongs to the vendor and persists if they work for multiple builders.
- Key person changes (GAP-391): when a contact leaves the vendor company, their historical records (emails, logs) remain with the company, not the person.

**Builder-Specific Data** (per builder-vendor relationship):
- Preferred status (preferred, approved, conditional, blacklisted).
- Builder's internal notes and rating.
- Custom trade assignments (builder may categorize differently than vendor self-declares).
- Payment terms (GAP-386): Net 30, Net 15, 2/10 Net 30, etc.
- Rate sheets (GAP-387): agreed pricing for common work items.
- Performance scores (quality, timeliness, communication, safety).
- Compliance status (per builder's requirements).
- Projects worked on for this builder.
- Communication history with this builder.

A vendor working for Builder A and Builder B sees only their own profile and each builder's portal. Builder A cannot see Builder B's notes or ratings.

#### Edge Cases & What-If Scenarios

1. **Dual-layer profile confusion.** The separation between vendor-owned (platform-level) and builder-specific data must be clearly communicated in the UI to avoid confusion. When a vendor updates their platform profile (e.g., company name, address, insurance), the change is visible to all connected builders. When a builder updates builder-specific data (e.g., preferred status, internal notes, trade assignments), that data is never visible to other builders or to the vendor. The system must display clear visual indicators distinguishing "Vendor Profile (shared)" fields from "Your Notes (private)" fields. If a vendor's self-declared trade specialty conflicts with a builder's trade assignment, both are displayed with a "differs from vendor profile" note.

### 10.2 Vendor Self-Registration & Onboarding (GAP-382, GAP-393)

**Self-Registration Flow** (GAP-382):
1. Builder sends invitation link or vendor finds registration page.
2. Vendor creates account: company info, primary contact, trade specialties.
3. Vendor uploads required documents (insurance, licenses).
4. Vendor completes prequalification questionnaire (if builder requires it).
5. Builder receives notification of new vendor registration.
6. Builder reviews and approves/rejects/requests more info.
7. Approved vendor receives access to builder's vendor portal.

**Onboarding Experience** (GAP-393):
- First-time vendors see a guided walkthrough of the portal.
- Explains: how to view/accept work orders, submit invoices, upload documents, check payment status.
- Progress bar showing onboarding completion.
- Builder can customize the onboarding message/instructions.

**Alternative**: builder creates vendor account manually (for vendors who won't self-register).

#### Edge Cases & What-If Scenarios

1. **Vendor refuses to use the portal (manual mode).** When a builder wants to work with a vendor who will not self-register or use the portal, the system must support a "manual" mode for that vendor relationship. In manual mode, the builder's team enters all data on the vendor's behalf: compliance documents, bid responses, invoice details, and daily log information. The vendor record is flagged as "builder-managed" with reduced automation (no vendor portal notifications, no self-service features). All downstream workflows (bid comparison, performance scoring, payment tracking) continue to work using the builder-entered data.

### 10.3 Compliance Tracking (GAP-383)

**Configurable compliance requirements per builder:**
- Each builder defines which documents/certifications are required for vendors.
- Standard compliance items:
  - General Liability Insurance (minimum coverage configurable, e.g., $1M/$2M).
  - Workers' Compensation Insurance.
  - Auto Insurance.
  - Trade-specific licenses (plumbing, electrical, HVAC, etc.).
  - Business license.
  - W-9 / Tax ID.
  - Safety certifications (OSHA 10/30).
  - Bonding (if required for specific trades).

**Tracking features:**
- Document upload with expiration date tracking.
- Automated alerts before expiration (30 days, 14 days, 7 days -- configurable).
- Compliance dashboard: green/yellow/red status per vendor.
- Non-compliant vendors blocked from receiving new work orders (configurable: hard block or warning).
- Certificate of Insurance (COI) verification: additional insured endorsement tracking.
- Compliance history: track all past certificates, not just current.

#### Edge Cases & What-If Scenarios

1. **Vendor compliance documents expire mid-project.** The system must have clear and escalating alerts for both the builder and the vendor when compliance documents (e.g., insurance, licenses) expire during an active project. Escalation ladder: (a) 30/14/7-day advance warnings to vendor and builder, (b) on expiration day, vendor status changes to "conditional" and a prominent banner appears on all vendor-related screens, (c) builder-configurable policy determines whether the vendor is blocked from new work orders immediately or after a grace period. Active work orders are not auto-cancelled, but the builder is notified to take action.

### 10.3a Insurance Compliance — State-Specific Requirements (GAP-553 through GAP-557)

Insurance requirements vary by state, and the platform must support the full range of builder insurance tracking needs beyond basic COI management.

- **State-specific insurance minimums** (GAP-553): insurance requirements (minimum coverage amounts, required endorsements, required policy types) vary by state. The system must store state-specific insurance requirement templates in the jurisdiction configuration database (Module 2, Section 14). When a vendor is added to a project, the system must validate their insurance against the requirements for the project's state, not just the builder's home-state defaults. Required insurance types may include: general liability, workers' compensation, auto liability, umbrella/excess, professional liability (for design trades), and pollution liability (for environmental trades). Minimum coverage amounts must be configurable per state and per builder (builder can require higher minimums than the state mandate).
- **Workers' compensation by state** (GAP-554): workers' comp requirements vary by state including class codes, experience modification rates (EMR), and rate structures. The system must track per vendor: workers' comp carrier, policy number, class codes, EMR rating, and expiration date. The system must support the common requirement that vendors provide a workers' comp waiver or exemption certificate if they are sole proprietors exempt from workers' comp in their state. EMR ratings should be factored into the vendor prequalification scoring (Section 10.4).
- **Builder's Risk insurance per project** (GAP-555): Builder's Risk insurance is project-specific (not vendor-specific) and covers the structure under construction. The system must track per project: Builder's Risk carrier, policy number, coverage limit, deductible, policy effective and expiration dates, and named insured parties. The system must alert the PM when a Builder's Risk policy is approaching expiration during active construction. Builder's Risk cost should be trackable as a project cost in the budget module.
- **Additional insured endorsement tracking** (GAP-556): builders routinely require vendors to name them as "additional insured" on the vendor's GL policy. The system must: track whether the builder has been named as additional insured on each vendor's policy, auto-request the endorsement as part of the vendor onboarding workflow, flag vendors whose COI does not include the additional insured endorsement, and store the endorsement document linked to the vendor's COI record. When a vendor's COI is renewed, the system must verify that the additional insured endorsement is present on the renewed certificate.
- **Annual insurance audit data** (GAP-557): builders undergo annual insurance audits that require detailed payroll and subcontractor cost data by class code. The system must auto-generate audit-ready reports containing: total payments to each subcontractor for the audit period, subcontractor class codes (from workers' comp tracking), employee payroll by class code (from Module 34 HR data), and project-level cost breakdowns by insurance class. This report must be exportable in CSV and PDF formats for the builder's insurance auditor.

#### Edge Cases & What-If Scenarios

1. **Vendor operates in a state where they are exempt from workers' comp.** Some states allow sole proprietors or partnerships without employees to opt out of workers' compensation insurance. When a vendor claims exemption, the system must require an uploaded exemption certificate or state-issued waiver document, track the exemption status with its expiration (some states require annual renewal of exemptions), and alert the builder that this vendor is exempt so the builder can assess the liability risk. If the vendor later adds employees, the exemption becomes invalid and the system must prompt for a new workers' comp policy.

### 10.3b Monthly Compliance Review Workflows (Gaps 1060, 1061)

**Monthly Insurance Certificate Review (Gap 1060):**
- Monthly report listing all vendor insurance certificates expiring within the next 30/60/90 days
- Cross-project view: show which active projects each expiring vendor is working on (impact assessment)
- Batch renewal request: send renewal reminders to multiple vendors in one action
- Auto-generated renewal request email with instructions for uploading updated certificate
- Compliance dashboard: month-over-month trend showing compliance rate improvement or deterioration
- Compliance gap report: vendors on active projects with expired or soon-to-expire certificates, sorted by urgency

**Monthly License Renewal Review (Gap 1061):**
- Monthly report listing all vendor and builder licenses expiring within the next 30/60/90 days
- License types tracked: general contractor, specialty trade, business license, professional license (architect, engineer)
- Builder's own license tracking: state contractor licenses, local business licenses, professional certifications
- Auto-alert to vendor when their license is approaching expiration
- License verification integration: link to state licensing database for real-time validation (where available, see Gap 1098)
- License history: track all past license numbers and renewal dates for audit trail

### 10.4 Prequalification Workflows (GAP-384)

- Builder creates a prequalification questionnaire (configurable questions):
  - Years in business, annual revenue, number of employees.
  - References (past projects, past builders).
  - Safety record (EMR rating, OSHA violations).
  - Financial stability (bonding capacity, credit references).
  - Equipment and capabilities.
- Vendor completes questionnaire during registration or on demand.
- Scoring: builder assigns weights to each criterion; system calculates a prequalification score.
- Approval workflow: score above threshold = auto-approve, below threshold = manual review.
- Prequalification renewal: configurable interval (annually, every 2 years).

### 10.5 Bid Management Integration (GAP-385)

- **Bid Invitation**: builder selects vendors by trade, sends bid package (plans, specs, scope description).
- **Bid Submission**: vendors submit bids through the portal with line items, total, qualifications, and schedule.
- **Bid Comparison**: side-by-side comparison of all bids for a scope item. Columns: vendor name, total, unit prices, qualifications, schedule, insurance status.
- **Bid Award**: builder awards bid to selected vendor; system generates draft subcontract.
- **Bid History**: track all bid invitations and responses per vendor for historical analysis.
- **Leveling**: bid leveling worksheet to normalize bids (ensure apples-to-apples comparison).

### 10.6 Payment Terms & Rate Sheets (GAP-386, GAP-387)

**Payment Terms** (GAP-386):
- Configurable per vendor per builder:
  - Net 30, Net 15, Net 45, Net 60.
  - Early payment discount: 2/10 Net 30 (2% discount if paid within 10 days).
  - Retainage: configurable % held until completion.
- Payment terms auto-populate on new POs and invoices for the vendor.
- Override capability per project or per invoice.

**Rate Sheets** (GAP-387):
- Standing pricing agreements between builder and vendor.
- Line items: work item description, unit, unit price, effective date, expiration date.
- When creating a PO for this vendor, rate sheet items auto-populate pricing.
- Rate sheet versioning: track price changes over time.
- Rate comparison: compare a vendor's current rates vs. historical rates vs. other vendors for the same work.

### 10.7 Performance Scoring

**Scoring dimensions:**
- **Quality**: defect rate, punch list items, rework frequency.
- **Timeliness**: on-time completion rate, schedule adherence.
- **Communication**: responsiveness to messages, document submission timeliness.
- **Safety**: incident rate, safety observation count, compliance with safety requirements.
- **Cost**: budget adherence, change order frequency, pricing competitiveness.

**Scoring methods:**
- Automatic: calculated from platform data (punch list counts, schedule variance, invoice timing).
- Manual: PM/superintendent rates vendor after project completion (1-5 stars per dimension).
- Combined: weighted average of automatic and manual scores.

**Display:**
- Vendor scorecard visible to builder's team.
- Trend line: performance over time (improving or declining).
- Configurable: builder chooses which dimensions matter most (weight configuration).

### 10.8 Communication History

- All communications with a vendor through the platform are logged:
  - Portal messages.
  - Email correspondence (if sent through platform).
  - SMS notifications.
  - Bid invitations and responses.
  - Work orders and confirmations.
  - Document requests and submissions.
- Communication timeline: chronological view of all interactions.
- Searchable by keyword, date range, communication type.
- Per-vendor and per-project communication views.

### 10.9 Preferred Vendor Lists & Blacklisting (GAP-389)

**Preferred Vendor Lists:**
- Builder maintains lists by trade: "Preferred Electricians," "Preferred Plumbers."
- Preferred vendors appear first in vendor selection dropdowns.
- Configurable criteria for preferred status (minimum performance score, compliance status, years as vendor).
- "Go-to" vendor per trade per region (for multi-location builders).

**Blacklisting** (GAP-389):
- Builder-level only: one builder's blacklisted vendor may be another builder's preferred vendor.
- Blacklisted vendors cannot receive new bid invitations or work orders from that builder.
- Blacklist reason documented (internal, not visible to vendor).
- Blacklist does not affect the vendor's platform account or relationships with other builders.
- Undo capability with audit trail.

### 10.10 Vendor Contract Templates (GAP-392)

- Builder configures standard subcontract templates.
- Templates include: scope of work (filled per project), insurance requirements, payment terms, retainage, warranty, dispute resolution, indemnification.
- Merge fields auto-populate from vendor profile and project data.
- Multiple templates per builder (different template for different trade types or contract sizes).
- E-signature integration for contract execution.

### 10.11 Platform-Wide Benchmarking (GAP-390)

- Anonymous, aggregated performance data across all platform vendors.
- Benchmarks available to builders (premium feature):
  - "This plumber's average quality score is in the 85th percentile for your region."
  - "Average electrical subcontract cost for your project size is $X/SF in your area."
  - "This vendor's on-time rate is above/below the platform average."
- Data is fully anonymized: no builder can see another builder's specific scores or vendor relationships.
- Opt-in: vendors can opt out of benchmarking data sharing.

### 10.12 Vendor Communication Preferences (GAP-388)

- Each vendor configures how they prefer to receive communications:
  - Email, portal notification, SMS, or combination.
  - Per communication type: bid invitations via email, schedule updates via SMS, invoicing via portal.
- Builder can override for urgent communications.
- Preferences stored at the vendor level but respected per builder relationship.

### 10.13 Subcontractor Termination Mid-Scope (GAP-601)

When a builder needs to fire a subcontractor during active work on a project, the system must support a complete contractor replacement workflow:
- **Termination documentation:** Capture the termination event with: reason (performance, safety, abandonment, insolvency, other), effective date, notice method (in-person, email, certified mail), and supporting evidence (photos, daily log entries, communication history, failed inspection records).
- **Scope reassignment:** The terminated vendor's remaining scope items are identified from their active POs, subcontract, and schedule tasks. System generates a "remaining scope" package that can be sent to replacement vendor candidates as a bid package.
- **Schedule impact analysis:** All schedule tasks assigned to the terminated vendor are flagged as "reassignment pending." The system calculates the schedule impact of the gap period (time between termination and replacement vendor mobilization) and surfaces it on the project dashboard.
- **Cost reconciliation:** System generates a financial summary of the terminated vendor relationship: total subcontract value, work completed (% and $), amounts invoiced, amounts paid, retainage held, and remaining contract value. Any overpayment relative to work completed is flagged for recovery.
- **Replacement vendor workflow:** System supports rapid re-bidding of the remaining scope: generate bid package from remaining scope, invite replacement vendors, compare bids, and award. The budget is updated to reflect the cost difference between original subcontract and replacement vendor.
- **Compliance cleanup:** System checks for outstanding lien waiver requirements from the terminated vendor and flags any compliance gaps that could create lien exposure.
- **Blacklist option:** Prompt builder to update the vendor's status (blacklist with documented reason per Section 10.9) and update performance scores.
- **Legal hold:** If termination may result in a dispute, the project and vendor relationship records can be placed on legal hold (no modifications or deletions).

### 10.14 Vendor Support Model (GAP-394)

- Tier 1: In-app help center with FAQs, video tutorials, and guided tours.
- Tier 2: Builder provides first-line support for their own vendors (builder knows their workflow).
- Tier 3: Platform support team handles technical issues (login problems, portal bugs).
- Support tickets: vendor can submit through portal; routed to builder first, escalated to platform if needed.
- Support documentation maintained in both English and Spanish (for field crews).

---

## Database Tables

### vendors
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| platform_user_id | UUID | FK -> users, nullable (if vendor has platform account) |
| company_name | VARCHAR(255) | |
| dba_name | VARCHAR(255) | Doing Business As |
| address_line1 | VARCHAR(255) | |
| address_line2 | VARCHAR(255) | |
| city | VARCHAR(100) | |
| state | VARCHAR(50) | |
| zip | VARCHAR(20) | |
| phone | VARCHAR(20) | |
| email | VARCHAR(255) | |
| website | VARCHAR(255) | |
| tax_id | VARCHAR(50) | Encrypted |
| entity_type | ENUM | 'sole_prop', 'llc', 'corp', 's_corp', 'partnership' |
| year_established | INTEGER | |
| employee_count | INTEGER | |
| service_area | JSONB | Geographic coverage |
| is_platform_registered | BOOLEAN | Vendor has their own account |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### vendor_contacts
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| vendor_id | UUID | FK -> vendors |
| first_name | VARCHAR(100) | |
| last_name | VARCHAR(100) | |
| title | VARCHAR(100) | |
| email | VARCHAR(255) | |
| phone | VARCHAR(20) | |
| is_primary | BOOLEAN | |
| is_active | BOOLEAN | Supports GAP-391 (person leaves, record remains) |
| deactivated_at | TIMESTAMPTZ | |

### vendor_trades
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| vendor_id | UUID | FK -> vendors |
| trade | VARCHAR(100) | Self-declared trade specialty |
| is_primary | BOOLEAN | |

### builder_vendor_relationships
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders, multi-tenant |
| vendor_id | UUID | FK -> vendors |
| status | ENUM | 'pending', 'approved', 'conditional', 'blacklisted', 'inactive' |
| preferred_status | ENUM | 'standard', 'preferred', 'go_to' |
| trade_assignments | JSONB | Builder-specific trade categorization |
| payment_terms | VARCHAR(50) | e.g., 'net_30', '2_10_net_30' |
| retainage_pct | DECIMAL(5,2) | Default retainage for this vendor |
| internal_notes | TEXT | Builder-only notes |
| blacklist_reason | TEXT | If blacklisted (GAP-389) |
| onboarded_at | TIMESTAMPTZ | When vendor completed onboarding |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### vendor_compliance_requirements
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| requirement_name | VARCHAR(255) | e.g., "General Liability Insurance" |
| requirement_type | ENUM | 'insurance', 'license', 'certification', 'document', 'other' |
| description | TEXT | |
| is_required | BOOLEAN | |
| minimum_coverage | DECIMAL(14,2) | For insurance requirements |
| applies_to_trades | JSONB | Which trades need this (null = all) |
| renewal_interval_months | INTEGER | How often must be renewed |
| alert_days_before_expiry | INTEGER | When to start alerting |

### vendor_compliance_records
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| vendor_id | UUID | FK -> vendors |
| requirement_id | UUID | FK -> vendor_compliance_requirements |
| status | ENUM | 'compliant', 'expiring_soon', 'expired', 'missing', 'waived' |
| document_path | VARCHAR(500) | Uploaded document |
| coverage_amount | DECIMAL(14,2) | For insurance |
| additional_insured | BOOLEAN | COI lists builder as additional insured |
| effective_date | DATE | |
| expiration_date | DATE | |
| verified_by | UUID | FK -> users |
| verified_at | TIMESTAMPTZ | |
| notes | TEXT | |

### vendor_rate_sheets
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| vendor_id | UUID | FK -> vendors |
| name | VARCHAR(255) | e.g., "2026 Electrical Rates" |
| effective_date | DATE | |
| expiration_date | DATE | |
| status | ENUM | 'active', 'expired', 'superseded' |
| created_at | TIMESTAMPTZ | |

### vendor_rate_sheet_items
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| rate_sheet_id | UUID | FK -> vendor_rate_sheets |
| description | VARCHAR(500) | Work item description |
| unit | VARCHAR(50) | EA, SF, LF, HR, etc. |
| unit_price | DECIMAL(12,4) | |
| cost_code_id | UUID | FK -> cost_codes, nullable |
| notes | TEXT | |

### vendor_performance_scores
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| vendor_id | UUID | FK -> vendors |
| project_id | UUID | FK -> projects, nullable (overall vs. per-project) |
| period | VARCHAR(20) | e.g., "2026-Q1" or "2026-02" |
| quality_score | DECIMAL(3,1) | 0.0-5.0 |
| timeliness_score | DECIMAL(3,1) | 0.0-5.0 |
| communication_score | DECIMAL(3,1) | 0.0-5.0 |
| safety_score | DECIMAL(3,1) | 0.0-5.0 |
| cost_score | DECIMAL(3,1) | 0.0-5.0 |
| overall_score | DECIMAL(3,1) | Weighted average |
| score_type | ENUM | 'auto', 'manual', 'combined' |
| scored_by | UUID | FK -> users, for manual scores |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |

### vendor_prequalifications
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| vendor_id | UUID | FK -> vendors |
| questionnaire_data | JSONB | Questions and answers |
| score | DECIMAL(5,2) | Computed from weighted answers |
| status | ENUM | 'pending', 'approved', 'rejected', 'expired' |
| approved_by | UUID | FK -> users |
| approved_at | TIMESTAMPTZ | |
| expires_at | DATE | |
| created_at | TIMESTAMPTZ | |

### vendor_communications
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| vendor_id | UUID | FK -> vendors |
| project_id | UUID | FK -> projects, nullable |
| channel | ENUM | 'portal', 'email', 'sms', 'phone', 'in_person' |
| direction | ENUM | 'outbound', 'inbound' |
| subject | VARCHAR(255) | |
| body | TEXT | |
| sent_by | UUID | FK -> users |
| sent_at | TIMESTAMPTZ | |
| related_entity_type | VARCHAR(50) | 'bid', 'invoice', 'work_order', etc. |
| related_entity_id | UUID | |

### bid_invitations
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| project_id | UUID | FK -> projects |
| scope_description | TEXT | |
| trade | VARCHAR(100) | |
| documents | JSONB | Attached plans, specs |
| due_date | DATE | Bid due date |
| status | ENUM | 'open', 'closed', 'awarded', 'cancelled' |
| created_by | UUID | FK -> users |
| created_at | TIMESTAMPTZ | |

### bid_responses
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| bid_invitation_id | UUID | FK -> bid_invitations |
| vendor_id | UUID | FK -> vendors |
| total_amount | DECIMAL(14,2) | |
| line_items | JSONB | Itemized bid |
| qualifications | TEXT | Vendor's qualifications/exclusions |
| proposed_schedule | TEXT | |
| documents | JSONB | Supporting documents |
| status | ENUM | 'submitted', 'under_review', 'awarded', 'rejected' |
| submitted_at | TIMESTAMPTZ | |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/vendors | List all vendors for builder (paginated, filterable) |
| GET | /api/vendors/:vendorId | Get vendor profile + builder relationship |
| POST | /api/vendors | Create vendor (manual entry) |
| PUT | /api/vendors/:vendorId | Update vendor profile |
| POST | /api/vendors/invite | Send vendor self-registration invitation |
| POST | /api/vendors/register | Vendor self-registration endpoint |
| PUT | /api/vendors/:vendorId/relationship | Update builder-vendor relationship (status, preferred, terms) |
| POST | /api/vendors/:vendorId/blacklist | Blacklist vendor with reason |
| POST | /api/vendors/:vendorId/unblacklist | Remove blacklist |
| GET | /api/vendors/:vendorId/compliance | Get compliance status |
| POST | /api/vendors/:vendorId/compliance | Upload compliance document |
| GET | /api/vendor-compliance/dashboard | Compliance summary dashboard |
| GET | /api/vendor-compliance/expiring | Expiring documents report |
| GET | /api/compliance-requirements | List builder's compliance requirements |
| POST | /api/compliance-requirements | Create compliance requirement |
| PUT | /api/compliance-requirements/:reqId | Update compliance requirement |
| GET | /api/vendors/:vendorId/rate-sheets | Get rate sheets |
| POST | /api/vendors/:vendorId/rate-sheets | Create rate sheet |
| PUT | /api/rate-sheets/:sheetId | Update rate sheet |
| GET | /api/vendors/:vendorId/performance | Get performance scores |
| POST | /api/vendors/:vendorId/performance | Submit manual performance review |
| GET | /api/vendor-performance/rankings | Ranked vendor list by trade |
| GET | /api/vendors/:vendorId/prequalification | Get prequalification status |
| POST | /api/vendors/:vendorId/prequalification | Submit prequalification |
| POST | /api/vendors/:vendorId/prequalification/approve | Approve prequalification |
| GET | /api/vendors/:vendorId/communications | Communication history |
| POST | /api/vendors/:vendorId/communications | Log communication |
| GET | /api/bid-invitations | List bid invitations |
| POST | /api/bid-invitations | Create bid invitation |
| GET | /api/bid-invitations/:bidId | Get bid invitation with responses |
| POST | /api/bid-invitations/:bidId/respond | Vendor submits bid response |
| GET | /api/bid-invitations/:bidId/compare | Bid comparison view |
| POST | /api/bid-invitations/:bidId/award/:vendorId | Award bid to vendor |
| GET | /api/vendor-benchmarks/:trade | Platform-wide anonymous benchmarks |
| GET | /api/vendors/import/csv | Import vendors from CSV |
| POST | /api/vendors/import/csv | Execute CSV import |
| GET | /api/vendor-contract-templates | List contract templates |
| POST | /api/vendor-contract-templates | Create contract template |
| POST | /api/vendors/:vendorId/generate-contract | Generate contract from template |

---

## UI Components

| Component | Description |
|-----------|-------------|
| VendorDirectory | Searchable, filterable vendor list with status badges |
| VendorProfileCard | Vendor detail view with tabs: profile, compliance, performance, history |
| VendorOnboardingWizard | Guided self-registration flow for new vendors |
| ComplianceDashboard | Green/yellow/red compliance matrix across all vendors |
| ComplianceUploader | Document upload with expiration date and coverage amount |
| ExpirationAlertList | Upcoming and overdue compliance expirations |
| RateSheetEditor | Grid for editing rate sheet line items |
| PerformanceScorecardView | Radar chart and trend lines for vendor scores |
| PerformanceReviewForm | PM/super manual scoring form after project |
| PrequalificationForm | Configurable questionnaire for vendor prequalification |
| BidInvitationBuilder | Create and send bid packages to selected vendors |
| BidComparisonTable | Side-by-side bid comparison with leveling tools |
| CommunicationTimeline | Chronological log of all vendor interactions |
| PreferredVendorList | Filterable list by trade with preferred/go-to indicators |
| BlacklistManager | View and manage blacklisted vendors with reasons |
| VendorContractGenerator | Merge field template to contract generation |
| VendorPortalShell | Vendor-facing portal layout (invoices, work orders, documents) |
| BenchmarkWidget | Anonymous platform-wide performance comparison |

---

## Dependencies

- **Module 3: Core Data Model** -- base contact tables, projects
- **Module 5: Notification Engine** -- compliance expiration alerts, bid notifications
- **Module 6: Document Storage** -- insurance certificates, license documents, bid packages
- **Module 7: Scheduling** -- vendor assignment to schedule tasks, resource calendar
- **Module 8: Daily Logs** -- vendor check-in/check-out, labor tracking
- **Module 9: Budget & Cost Tracking** -- rate sheets feed PO pricing, bid awards create commitments
- **Module 11: Basic Invoicing** -- vendor invoices, payment terms
- **Module 12: Contracts** -- subcontract generation from templates (GAP-392)
- **Module 17: Change Orders** -- vendor-related change orders
- **Module 20: Purchasing** -- PO creation using rate sheet pricing

---

## Open Questions

1. Should the vendor platform profile be a separate database entity from the builder-created vendor record, or the same record with a flag? (Separate is cleaner for multi-builder scenarios.)
2. How should vendor self-registration handle the case where the vendor already exists in a builder's system (created manually before vendor registered)?
3. For platform-wide benchmarking (GAP-390), what is the minimum data threshold before showing benchmarks? (Need enough vendors to anonymize properly -- suggest minimum 10 vendors per trade per region.)
4. Should bid management (GAP-385) support blind bidding (vendors cannot see other bids) and/or reverse auctions?
5. Who pays for vendor platform accounts -- the builder or the vendor? (Most construction platforms make vendor access free to drive adoption.)
6. Should vendor performance scores be visible to the vendor themselves? (Transparency vs. builder privacy.)
7. How should the system handle a vendor who disputes a performance score or blacklisting? (Grievance process.)
