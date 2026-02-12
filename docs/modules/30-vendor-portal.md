# Module 30: Vendor Portal

**Phase:** 5 - Full Platform
**Status:** TODO
**Priority:** High (reduces builder admin burden, key platform differentiator)

---

## Overview

Self-service portal for subcontractors and suppliers enabling bid response submission, schedule visibility for assigned tasks, purchase order and scope access, invoice submission, lien waiver submission with digital signature, daily work log submission, and COI/license document upload. The vendor portal reduces the builder's administrative burden by shifting data entry and document management to the vendors themselves, while giving vendors real-time visibility into their payment status and schedule. Vendors may work with multiple builders on the platform, accessing each builder's projects through a single login.

---

## Gap Items Addressed

| Gap # | Description | Coverage |
|-------|-------------|----------|
| 381 | Vendors on platform working for multiple builders | Single vendor account with multi-builder project access |
| 382 | Vendor self-registration (vendor signs up, builder approves) | Self-registration workflow with builder approval gate |
| 383 | Vendor compliance tracking (insurance, license, safety — configurable) | Compliance dashboard with document upload and expiration tracking |
| 384 | Vendor prequalification workflows (questionnaire, documents, approval) | Prequalification wizard with configurable requirements per builder |
| 385 | Vendor bid management through platform | Bid submission interface integrated with bid packages (Module 26) |
| 386 | Vendor payment terms (configurable per vendor per builder) | Payment terms display with terms-specific invoice submission |
| 387 | Vendor rate sheets (standing pricing agreements) | Rate sheet management auto-populating POs |
| 388 | Vendor communication preferences (email, portal, text — configurable) | Preference center for notification channel selection |
| 389 | Vendor blacklisting (builder-level, not platform-level) | Builder-specific vendor status does not affect other builder relationships |
| 390 | Vendor performance benchmarks (anonymous platform-wide data) | Opt-in benchmark display: "Your response time ranks in top 20%" |
| 391 | Vendor succession (key person leaves — data stays with company) | Company-level account with individual user management |
| 392 | Vendor contract templates (builder-configurable subcontract) | Contract review and e-signature through portal |
| 393 | Vendor onboarding to platform (guided first-time experience) | Step-by-step onboarding wizard for new vendor accounts |
| 394 | Vendor support (who helps when vendor has trouble?) | In-portal help system with builder-specific and platform-level support |

---

## Detailed Requirements

### 30.1 Bid Response Submission

Vendors receive, review, and respond to bid invitations through the portal.

- **Bid Invitation Inbox:** Vendor sees all pending bid invitations across all builders they work with, with due dates, project names, and scope summaries.
- **Bid Package Review:** Full access to bid package documents (drawings, specs, scope narrative) within the portal. Document viewer with zoom and markup tools.
- **Structured Bid Entry:** Fill in the builder's required bid form: line items, quantities, unit prices, lump sums, alternates, exclusions, proposed schedule, and payment terms.
- **Document Upload:** Attach supporting documents (detailed breakdown, product specs, subcontractor quotes) to the bid response.
- **Pre-Bid Q&A:** View and ask clarifying questions in the pre-bid Q&A thread. See responses from the builder.
- **Bid History:** Vendor sees their own bid history: submitted bids, awarded bids, and win/loss record per builder.
- **Rate Sheet Auto-Fill:** If vendor has a standing rate sheet with the builder, relevant prices auto-populate into the bid form.

### 30.2 Schedule Visibility for Assigned Tasks

Vendors see their upcoming and current work schedule across all projects.

- **My Schedule View:** Calendar view showing all tasks assigned to this vendor across all projects and builders. Day, week, and month views.
- **Task Detail:** Each task shows: project name, task description, planned start/end dates, dependencies (what must happen before vendor can start), location/address.
- **Availability Updates:** Vendor can mark dates as unavailable. Builder sees availability when scheduling.
- **Schedule Acknowledgment:** When a new task is scheduled, vendor receives notification and can acknowledge or request a reschedule with reason.
- **Two-Week Look-Ahead:** Focused view of the next two weeks with detailed daily task breakdown.
- **Conflict Flagging:** System alerts vendor when tasks from different builders overlap. Vendor can notify affected builders.

### 30.3 Purchase Order and Scope Access

Vendors access their POs and contracted scope of work.

- **PO Dashboard:** List of all purchase orders issued to this vendor, filterable by project, status, and date. Each PO shows: amount, line items, delivery date, status (issued, acknowledged, partially received, complete).
- **PO Acknowledgment:** Vendor acknowledges receipt of PO, confirming terms and delivery commitment.
- **Scope of Work:** Access to the contracted scope of work documents, drawings, and specifications relevant to vendor's trade.
- **PO Change Orders:** View PO revisions with highlighted changes from the original. Acknowledge revised terms.
- **Material Delivery Tracking:** For material POs, vendor can update delivery status and expected delivery date.

### 30.4 Invoice Submission

Vendors submit invoices digitally, reducing paper and data entry for the builder.

- **Invoice Creation:** Vendor creates invoice against a PO or contract. System enforces: invoice cannot exceed PO/contract amount, retainage is auto-calculated, previously invoiced amounts are tracked.
- **Line-Item Invoicing:** Invoice by line item against the PO breakdown. System validates quantities and amounts against contract.
- **Supporting Documents:** Attach required supporting documents: progress photos, delivery receipts, certified payroll, etc. Builder configures required attachments per invoice type.
- **Invoice Status Tracking:** Real-time visibility into invoice status: submitted, under review, approved, scheduled for payment, paid, rejected (with reason).
- **Payment History:** Full payment history showing all invoices, payment amounts, payment dates, retainage held, and retainage released.
- **Payment Terms Display:** Clear display of applicable payment terms (Net 30, 2/10 Net 30, etc.) with projected payment dates.

### 30.5 Lien Waiver Submission

Digital lien waiver execution integrated with the payment workflow.

- **Waiver Types:** Support conditional and unconditional lien waivers, progress and final waivers. State-specific statutory forms where required.
- **Auto-Generation:** System auto-generates the appropriate lien waiver type based on the payment stage and jurisdiction.
- **Digital Signature:** Vendor signs lien waiver digitally with legal e-signature. Signature stored with timestamp, IP address, and document hash.
- **Conditional Flow:** Conditional waiver generated upon payment request. Unconditional waiver generated upon payment receipt confirmation.
- **Waiver Status:** Track waiver status: pending signature, signed, verified by builder.
- **Compliance Gate:** Builder can configure: payment does not process until lien waiver is signed. System enforces this gate.

### 30.6 Daily Work Log Submission

Vendors document their daily work through the portal.

- **Daily Log Form:** Configurable per builder. Standard fields: date, project, crew size, hours worked, work performed, materials used, weather conditions observed.
- **Photo Documentation:** Attach daily progress photos. Builder can configure minimum photo requirement.
- **Safety Observations:** Optional safety-related observations field (near misses, hazards, compliance notes).
- **Delivery Log:** Log material deliveries received on-site with quantities and condition notes.
- **Time Entry:** If builder tracks vendor labor hours, vendors enter crew hours per task. Supports T&M billing workflow.
- **Log History:** Vendor sees their own daily log history, searchable and filterable.

### 30.7 COI, License, and Compliance Document Upload

Centralized compliance document management.

- **Document Types:** Certificate of Insurance (COI), business license, trade license, W-9, safety certifications, bonding certificate, workers' compensation certificate.
- **Expiration Tracking:** Each document has an expiration date. System alerts vendor 60, 30, and 7 days before expiration.
- **Auto-Alert to Builder:** Builder is notified when a vendor's compliance document expires or is about to expire.
- **Document Requirements:** Each builder configures which documents are required for their vendors. Vendor sees a checklist of required vs. uploaded documents.
- **Renewal Upload:** When uploading a renewal, the previous document is archived (not deleted) and the new document takes its place.
- **Prequalification Documents:** Additional documents required during prequalification (safety program, EMR letter, financial statements) uploaded here.
- **Compliance Dashboard:** Green/yellow/red compliance status per builder. Green = all current. Yellow = expiring within 30 days. Red = expired or missing.

### 30.8 Vendor Onboarding and Account Management

Guided experience for new vendors joining the platform.

- **Self-Registration:** Vendor visits registration link (provided by builder or on builder's website). Creates account with: company name, primary contact, email, phone, trades, service area.
- **Builder Approval Gate:** After registration, builder reviews and approves vendor. Vendor cannot access builder projects until approved.
- **Onboarding Wizard:** Step-by-step wizard: (1) Company profile, (2) Trade and service area, (3) Compliance documents, (4) Prequalification questionnaire (if required), (5) Communication preferences.
- **Multi-Builder Access:** Single vendor account works across all builders on the platform. Each builder relationship is independent (approval, compliance, performance).
- **Team Management:** Vendor company admin can add team members (foremen, office staff) with role-based access. Data belongs to the company, not individual users.
- **Profile Updates:** Vendor updates their profile (contact info, trades, service area, insurance) in one place, visible to all connected builders.

#### Edge Cases & What-If Scenarios

1. **Vendor works for multiple builders on the platform.** Data must be properly segregated so vendors never accidentally see another builder's information. Required behavior: (a) the vendor dashboard clearly displays a builder selector or grouped view showing projects organized by builder, (b) bid invitations, POs, invoices, and punch items are always displayed with the builder name prominently visible, (c) when submitting a bid or invoice, the system confirms the target builder before submission ("You are submitting to Builder X -- confirm?"), (d) compliance documents uploaded once are shared across all builder relationships (with builder consent), but performance scores, payment terms, and internal notes are strictly isolated per builder, and (e) the vendor's global schedule view shows tasks from all builders with color-coding by builder to prevent confusion.

2. **Vendor employee leaves the company.** The vendor admin must be able to manage team member departures without losing data. Required behavior: (a) vendor admin can deactivate a user account, which immediately revokes portal access but preserves all historical data (daily logs, photos, communications) attributed to that user, (b) deactivated users cannot be re-activated without vendor admin approval, (c) any in-progress items assigned to the departing employee are flagged for reassignment, (d) the system prompts the vendor admin to transfer any pending tasks or open items to another team member, and (e) if the departing employee was the sole admin, the system requires designation of a new admin before deactivation completes.

3. **Portal intuitiveness and self-service design.** The vendor portal must be intuitive enough that vendors can use it without training or builder support. Required behavior: (a) the onboarding wizard covers all essential setup in under 10 minutes, (b) contextual help tooltips are available on every major action, (c) the portal supports both English and Spanish for all UI elements and system messages, (d) the most common actions (submit invoice, view schedule, complete punch item) are accessible within 2 clicks from the dashboard, and (e) a guided "first-time" experience highlights key features when a vendor first logs into each section.

---

## Database Tables

### vendor_portal_accounts
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| company_name | varchar(200) | Vendor company name |
| primary_contact_name | varchar(200) | Primary contact |
| primary_email | varchar(255) | Login email |
| phone | varchar(20) | Company phone |
| trades | jsonb | Array of trade categories |
| service_area | jsonb | Geographic service area |
| registration_status | varchar(20) | pending, active, suspended |
| onboarding_completed | boolean | Whether onboarding wizard is done |
| platform_joined_at | timestamptz | When vendor joined platform |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last modification |

### vendor_builder_relationships
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| vendor_portal_id | uuid | FK to vendor_portal_accounts |
| builder_id | uuid | FK to builders |
| vendor_record_id | uuid | FK to builder's vendor record |
| status | varchar(20) | pending_approval, approved, suspended, blacklisted |
| approved_at | timestamptz | When builder approved |
| approved_by | uuid | FK to users |
| payment_terms | varchar(50) | Negotiated payment terms |
| compliance_status | varchar(10) | green, yellow, red |
| prequalification_status | varchar(20) | not_required, pending, approved, expired |
| notes | text | Builder's private notes about vendor |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last modification |

### vendor_portal_users
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| vendor_portal_id | uuid | FK to vendor_portal_accounts |
| user_id | uuid | FK to users (auth) |
| name | varchar(200) | User name |
| email | varchar(255) | User email |
| role | varchar(30) | admin, office_staff, foreman, field |
| is_primary | boolean | Is this the primary company contact |
| status | varchar(20) | active, deactivated |
| created_at | timestamptz | Record creation |

### vendor_compliance_documents
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| vendor_portal_id | uuid | FK to vendor_portal_accounts |
| document_type | varchar(50) | coi, business_license, trade_license, w9, safety_cert, bond, workers_comp |
| file_url | varchar(500) | Storage URL |
| file_name | varchar(200) | Original file name |
| issuing_authority | varchar(200) | Who issued the document |
| policy_number | varchar(100) | Policy/license number |
| coverage_amount | decimal(14,2) | Coverage amount (for insurance) |
| effective_date | date | Document effective date |
| expiration_date | date | Document expiration date |
| status | varchar(20) | current, expiring_soon, expired, archived |
| uploaded_at | timestamptz | Upload timestamp |
| uploaded_by | uuid | FK to users |
| archived_at | timestamptz | When superseded by renewal |
| created_at | timestamptz | Record creation |

### vendor_invoices
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| vendor_portal_id | uuid | FK to vendor_portal_accounts |
| builder_id | uuid | FK to builders |
| project_id | uuid | FK to projects |
| po_id | uuid | FK to purchase_orders (nullable) |
| contract_id | uuid | FK to contracts (nullable) |
| invoice_number | varchar(100) | Vendor's invoice number |
| amount | decimal(14,2) | Invoice amount |
| retainage_held | decimal(12,2) | Retainage amount auto-calculated |
| net_amount | decimal(14,2) | Amount after retainage |
| line_items | jsonb | Invoice line items |
| supporting_docs | jsonb | Attached documents |
| status | varchar(30) | draft, submitted, under_review, approved, scheduled, paid, rejected |
| rejection_reason | text | Why rejected (if applicable) |
| submitted_at | timestamptz | When submitted |
| reviewed_at | timestamptz | When reviewed |
| paid_at | timestamptz | When paid |
| payment_amount | decimal(14,2) | Actual payment amount |
| payment_reference | varchar(100) | Check/ACH reference number |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last modification |

### vendor_lien_waivers
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| vendor_portal_id | uuid | FK to vendor_portal_accounts |
| builder_id | uuid | FK to builders |
| project_id | uuid | FK to projects |
| invoice_id | uuid | FK to vendor_invoices |
| waiver_type | varchar(30) | conditional_progress, unconditional_progress, conditional_final, unconditional_final |
| amount | decimal(14,2) | Waiver amount |
| through_date | date | Period covered |
| document_url | varchar(500) | Generated waiver document URL |
| status | varchar(20) | pending_signature, signed, verified |
| signed_at | timestamptz | When vendor signed |
| signature_data | text | E-signature data |
| signature_ip | varchar(45) | IP at time of signature |
| verified_by | uuid | FK to users (builder team) |
| verified_at | timestamptz | When builder verified |
| created_at | timestamptz | Record creation |

### vendor_daily_logs
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| vendor_portal_id | uuid | FK to vendor_portal_accounts |
| builder_id | uuid | FK to builders |
| project_id | uuid | FK to projects |
| log_date | date | Date of work |
| crew_size | integer | Number of workers on site |
| hours_worked | decimal(4,1) | Total crew hours |
| work_performed | text | Description of work |
| materials_used | text | Materials consumed |
| weather_observed | varchar(100) | Weather conditions |
| safety_notes | text | Safety observations |
| photos | jsonb | Array of photo references |
| deliveries | jsonb | Materials received |
| time_entries | jsonb | Per-task hour breakdown |
| submitted_at | timestamptz | When submitted |
| created_at | timestamptz | Record creation |

### vendor_schedule_acknowledgments
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| vendor_portal_id | uuid | FK to vendor_portal_accounts |
| builder_id | uuid | FK to builders |
| task_id | uuid | FK to schedule tasks |
| status | varchar(20) | pending, acknowledged, reschedule_requested |
| reschedule_reason | text | Why vendor wants to reschedule |
| proposed_date | date | Vendor's proposed alternative date |
| acknowledged_at | timestamptz | When acknowledged |
| created_at | timestamptz | Record creation |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v2/vendor-portal/register | Vendor self-registration |
| GET | /api/v2/vendor-portal/profile | Get vendor company profile |
| PUT | /api/v2/vendor-portal/profile | Update vendor profile |
| GET | /api/v2/vendor-portal/builders | List builder relationships |
| GET | /api/v2/vendor-portal/team | List vendor team members |
| POST | /api/v2/vendor-portal/team | Add team member |
| PUT | /api/v2/vendor-portal/team/:id | Update team member |
| GET | /api/v2/vendor-portal/bids | List bid invitations across builders |
| GET | /api/v2/vendor-portal/bids/:id | Get bid package detail |
| POST | /api/v2/vendor-portal/bids/:id/respond | Submit bid response |
| GET | /api/v2/vendor-portal/bids/:id/clarifications | Get pre-bid Q&A |
| POST | /api/v2/vendor-portal/bids/:id/clarifications | Ask a question |
| GET | /api/v2/vendor-portal/schedule | Get all assigned tasks across projects |
| POST | /api/v2/vendor-portal/schedule/:taskId/acknowledge | Acknowledge or request reschedule |
| PUT | /api/v2/vendor-portal/availability | Update availability windows |
| GET | /api/v2/vendor-portal/purchase-orders | List POs across projects |
| GET | /api/v2/vendor-portal/purchase-orders/:id | Get PO detail |
| POST | /api/v2/vendor-portal/purchase-orders/:id/acknowledge | Acknowledge PO |
| GET | /api/v2/vendor-portal/invoices | List submitted invoices |
| POST | /api/v2/vendor-portal/invoices | Submit new invoice |
| GET | /api/v2/vendor-portal/invoices/:id | Get invoice detail and status |
| GET | /api/v2/vendor-portal/payments | Payment history |
| GET | /api/v2/vendor-portal/lien-waivers | List lien waivers |
| POST | /api/v2/vendor-portal/lien-waivers/:id/sign | Sign a lien waiver |
| POST | /api/v2/vendor-portal/daily-logs | Submit daily work log |
| GET | /api/v2/vendor-portal/daily-logs | List submitted logs |
| GET | /api/v2/vendor-portal/compliance | Compliance document status |
| POST | /api/v2/vendor-portal/compliance/upload | Upload compliance document |
| GET | /api/v2/vendor-portal/punch-items | List assigned punch items |
| POST | /api/v2/vendor-portal/punch-items/:id/complete | Mark punch item complete |
| GET | /api/v2/vendor-portal/notifications/preferences | Get notification preferences |
| PUT | /api/v2/vendor-portal/notifications/preferences | Update notification preferences |

---

## UI Components

- **Vendor Dashboard** — Overview: pending bid invitations, upcoming tasks, invoice statuses, compliance alerts, unread notifications.
- **Bid Invitation Center** — List of bid invitations with due dates, bid package review, and structured response form.
- **Schedule Calendar** — Multi-project calendar showing assigned tasks. Color-coded by builder/project. Day/week/month views.
- **PO Dashboard** — Purchase order list with status indicators, acknowledgment buttons, and delivery tracking.
- **Invoice Submission Form** — Against-PO invoice creation with line-item validation, retainage auto-calc, and document attachment.
- **Payment History Table** — All payments with date, amount, check/ACH reference, and retainage tracking.
- **Lien Waiver Signing Page** — Waiver document display with e-signature capture. Clear indication of waiver type and amount.
- **Daily Log Form** — Mobile-friendly daily log entry with photo capture, crew tracking, and work description.
- **Compliance Document Manager** — Checklist per builder showing required documents, expiration status, and upload interface.
- **Punch Item Viewer** — Assigned punch items with photos, floor plan pins, and completion workflow (photo upload + status change).
- **Onboarding Wizard** — Step-by-step setup: company info, trades, compliance documents, notification preferences.
- **Profile and Team Management** — Company profile editor and team member management with role assignment.
- **Notification Preference Center** — Per-event-type channel selection (email, push, portal, SMS).

---

## Dependencies

- **Module 1: Auth & Access** — Vendor role authentication and multi-builder access control
- **Module 10: Contact/Vendor Management** — Vendor records and builder-vendor relationships
- **Module 26: Bid Management** — Bid package data for bid response submission
- **Module 11: Basic Invoicing** — Invoice processing and payment tracking
- **Module 14: Lien Waivers** — Waiver generation and compliance tracking
- **Module 7: Scheduling** — Schedule task data for vendor task visibility
- **Module 20: Purchasing** — Purchase order data
- **Module 28: Punch List** — Punch item data for vendor completion workflow
- **Module 5: Notification Engine** — Multi-channel notification delivery
- **Module 8: Daily Logs** — Daily log data model and photo storage

---

## Open Questions

1. Should vendors be able to see their performance scores, or is that builder-internal data? (Proposed: opt-in by builder.)
2. How do we handle a vendor who disputes a back-charge from a punch item? (Proposed: dispute workflow in Phase 2.)
3. Should the vendor portal support offline mode for field workers with poor connectivity? (Critical for daily logs and punch completion.)
4. How do we handle vendor companies that merge or split? (Transfer data between vendor accounts.)
5. Should vendors be able to request payment advances or early payment through the portal?
6. What is the vendor's recourse if a builder is not paying on time? (Platform-level dispute resolution?)
7. Should the platform charge vendors for portal access, or is it free and funded by builder subscriptions?
8. How do we prevent a vendor from accidentally submitting a bid to the wrong builder?
