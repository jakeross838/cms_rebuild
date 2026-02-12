# Module 15: Draw Request Generation

**Phase:** 3 - Financial Power
**Status:** TODO
**Last Updated:** 2026-02-11

---

## Overview

Generates, manages, and tracks draw requests (payment applications) submitted to lenders or owners for construction financing disbursement. Supports the industry-standard AIA G702/G703 format as well as custom and lender-specific formats. Draw requests are assembled from approved invoices, tracked against a schedule of values, and packaged with required supporting documentation including lien waivers, progress photos, and inspection reports. The system handles the full draw lifecycle from preparation through submission, lender review, approval, and disbursement reconciliation.

---

## Proven Patterns from v1

The following patterns have been validated in the production v1 CMS application and should be carried forward into the rebuild.

### Draw Composition (Proven)
- v2_draw_invoices links invoices to draws
- v2_draw_allocations mirrors invoice allocations
- When invoice → in_draw: create link, copy allocations, update draw total

### CO Billing Overlap Detection (Proven)
Warns if CO has both:
- Manual v2_job_co_draw_billings (client-billed CO work)
- Invoice allocations (vendor-invoiced CO work)
Prevents double-counting

### Draw Allocation Validation (Proven)
- Compares draw allocations to source invoice allocations
- Detects drift by cost code
- Returns mismatches for reconciliation

---

## Gap Items Addressed

| Gap # | Description | How Addressed |
|-------|-------------|---------------|
| 441 | Draw request format configurable (AIA G702/G703 not universal) | Multiple format templates: AIA standard, custom, lender-specific |
| 442 | Supporting documentation requirements configurable per builder/lender | Configurable document checklist per lender with auto-assembly |
| 443 | Draw requests for different contract types (fixed-price, cost-plus) | Contract-type-aware billing calculations (% complete vs. actual cost) |
| 444 | Stored materials billing | Stored materials line item with on-site verification workflow |
| 445 | Draw request routing (generate, PM review, Director approve, send) | Multi-step approval workflow before submission to lender |
| 446 | Automated draw request generation from schedule progress | Auto-calculate recommended billing based on schedule % and approved invoices |
| 447 | Multiple lenders with different requirements on same project | Per-lender configuration with separate draw schedules and format requirements |
| 448 | Draw request reconciliation (approved vs. disbursed amounts) | Disbursement tracking with variance analysis and reconciliation |
| 434 | WIP schedule calculation methods (Section 24) | Percentage-of-completion and cost-to-cost methods supported |
| 285 | Retainage tracking (Section 12) | Retainage calculated per draw line, tracked cumulatively, release workflow |
| 346 | Progress vs. final billing (Section 16) | Progress draw vs. final draw with different requirements and retainage release |

---

## Detailed Requirements

### 1. Schedule of Values (SOV) Management

- SOV created at project start, typically from contract or budget breakdown
- SOV structure:
  - Line item number
  - Description of work
  - Scheduled value (contract amount for this scope)
  - Previous applications (cumulative prior billing)
  - Current application (this draw's billing)
  - Materials presently stored
  - Total completed and stored to date
  - Percentage complete
  - Balance to finish
  - Retainage
- SOV import from budget/estimate (Module 9) or manual entry
- SOV can be modified (with approval) via change orders -- new lines added, amounts adjusted
- SOV version history tracking (original vs. current with all change orders)
- Builder-configurable SOV detail level (some lenders want 20 lines, some want 200)
- Multiple SOVs per project when multiple lenders or funding sources exist

### 2. AIA G702/G703 Format

- **G703 (Continuation Sheet):** Schedule of values with columns matching AIA standard
  - Item Number, Description of Work, Scheduled Value, Work Completed (Previous/This Period), Materials Stored, Total Completed, %, Balance, Retainage
- **G702 (Application and Certificate for Payment):**
  - Header: project info, contractor info, architect info, contract details
  - Summary: original contract sum, net change by COs, current contract sum
  - Application: total completed, retainage, total earned less retainage, previous certificates, current payment due
  - Contractor certification and notarization block
  - Architect certification block
- Auto-populated from SOV and approved invoices
- PDF generation matching standard AIA layout
- Support for AIA digital submissions (where lenders accept electronic format)

### 3. Custom and Lender-Specific Formats

- Template engine supporting custom draw formats beyond AIA
- Lender-specific template library:
  - Each lender may have their own form requirements
  - Builder configures which template to use per lender per project
  - System stores multiple lender templates
- Custom template builder (admin tool):
  - Define columns, headers, footers, summary calculations
  - Map data fields to template positions
  - Add lender-specific fields (loan number, inspector name, etc.)
- Common custom format requirements:
  - Different column ordering
  - Additional columns (unit quantities, unit costs)
  - Lender logo and branding on forms
  - Custom certification language
  - Different retainage calculation display

### 4. Draw Assembly from Approved Invoices

- System links approved invoices to SOV line items
- Auto-calculation of current period billing:
  - Sum of approved invoices per SOV line since last draw
  - Or manual entry of percent complete per line (builder preference)
  - Or combination: invoice-backed lines plus % complete lines
- Builder reviews and adjusts before submission:
  - May bill more than invoices received (work completed but not yet invoiced)
  - May bill less than invoices (strategic billing decisions)
  - System flags discrepancies for review
- Invoice-to-SOV mapping report showing which invoices support each draw line
- Undrawn invoice tracking: approved invoices not yet included in any draw

### 5. Supporting Document Package

- Configurable document checklist per lender:

| Document Type | Configurable | Auto-Attached |
|---------------|-------------|---------------|
| Lien waivers (all vendors) | Required/Optional/NA | From Module 14 |
| Progress photos | Required/Optional/NA | From Module 29/Photos |
| Inspection reports | Required/Optional/NA | From Module 28 |
| Insurance certificates (all vendors) | Required/Optional/NA | From Module 10 |
| Permit status | Required/Optional/NA | From Module 28 |
| Change order log | Required/Optional/NA | From Module 17 |
| Invoice backup | Required/Optional/NA | From Module 11 |
| Daily log summaries | Required/Optional/NA | From Module 14 |
| Custom documents | Required/Optional/NA | Manual upload |

- Auto-assembly: system collects required documents from other modules
- Completeness check: flag missing required documents before submission
- Package output: single combined PDF or zip file with organized folders
- Cover letter template configurable per builder and per lender

### 6. Retainage Tracking

- Retainage percentage configurable:
  - Project-level default (e.g., 10%)
  - Line-item override (e.g., 5% for certain trades)
  - Reduction at milestone (e.g., 10% until 50% complete, then 5%)
  - Per-lender rules
- Retainage calculated automatically per draw
- Cumulative retainage tracking across all draws
- Retainage release workflow:
  - Substantial completion triggers retainage release request
  - Separate approval chain for retainage release
  - Partial retainage release (release 50% at substantial completion, remainder at final)
  - Final lien waivers required before retainage release (links to Module 14)
- Retainage reporting: withheld by line, by project, cumulative

### 7. Draw Request Approval Workflow

- Internal approval before external submission:
  - PM prepares draw
  - PM reviews and submits for internal approval
  - Director/Controller reviews financials
  - Owner/Principal final approval (configurable)
  - Draw submitted to lender
- Approval actions: Approve, Reject (with notes), Request Revision
- Approval history and audit trail
- Email notification at each approval step
- Deadline tracking: "draw must be submitted by 15th of month per lender agreement"

### 8. Lender Interaction Tracking

- Draw submission tracking:
  - Submitted date, submission method (portal, email, physical)
  - Lender inspector assignment and inspection scheduling
  - Inspector visit date and result
  - Lender review notes and requested revisions
  - Lender approval date and approved amount
  - Disbursement date and actual amount received
- Multiple lenders per project:
  - Each lender has separate SOV, draw schedule, and format
  - Primary construction lender vs. mezzanine vs. owner funding
  - Draws can be sequenced: primary lender first, then owner for remainder
- Lender contact management (inspector, draw reviewer, loan officer)

### 9. Draw Schedule Management

- Draw schedule defines planned submission dates
- Monthly, milestone-based, or custom frequency
- Calendar view showing upcoming draw dates across all projects
- Preparation timeline: "Start preparing 10 days before submission date"
- Automated reminders: "Draw #6 for Project X due in 5 days -- 3 lien waivers outstanding"
- Historical draw schedule vs. actual submission dates
- Cash flow impact: expected disbursement dates for cash flow forecasting

### 10. Automated Draw Generation

- System can auto-calculate recommended billing:
  - Based on schedule progress (% complete by phase from scheduling module)
  - Based on approved invoices since last draw
  - Based on field-entered % complete per SOV line
- Auto-generated draft draw for PM review:
  - Pre-filled SOV with recommended current period values
  - Flagged items: schedule says 50% but only 30% billed -- review needed
  - Cost-to-date vs. billed-to-date variance analysis
- Builder configures auto-generation: enabled/disabled, trigger (monthly date, manual)

### 11. Draw Request Reconciliation

- Track variance between:
  - Applied amount (what builder requested)
  - Approved amount (what lender approved)
  - Disbursed amount (what builder actually received)
- Reconciliation for each line item and total
- Common variance reasons: inspector found less completion, stored materials not accepted, documentation missing
- Reconciliation history per draw
- Cumulative reconciliation across all draws: total applied vs. total received
- Impact analysis: shortfall affects cash flow -- flag for financial dashboard

### 12. Progress Photos for Draws

- Link progress photos to specific SOV line items
- "Draw Photo Package" -- curated selection of photos demonstrating work completion
- Before/during/after sequences by SOV line
- Photo annotations: overlay text indicating scope area
- Photo date verification (EXIF data) to confirm recency
- Inspector-requested photo follow-ups tracked

---

## Database Tables

```
v2_draw_schedules_of_values
  id, builder_id, project_id, lender_id,
  version, is_current, change_order_id (if modified by CO),
  created_by, created_at, updated_at

v2_sov_line_items
  id, builder_id, sov_id, line_number, description,
  scheduled_value, cost_code_id,
  retainage_pct, retainage_pct_after_threshold,
  threshold_pct (e.g., reduce retainage after 50%),
  sort_order, created_at, updated_at

v2_draw_requests
  id, builder_id, project_id, sov_id, lender_id,
  draw_number, application_date, period_from, period_to,
  contract_sum_original, net_change_orders, contract_sum_current,
  total_completed_stored, total_retainage,
  total_earned_less_retainage, less_previous_certificates,
  current_payment_due,
  status (draft|internal_review|approved_internal|submitted|lender_review|
          revision_requested|approved|disbursed|rejected),
  format_template_id,
  submitted_at, submitted_method (portal|email|physical),
  lender_approved_at, lender_approved_amount,
  disbursed_at, disbursed_amount,
  variance_notes,
  generated_pdf_url, supporting_docs_url,
  created_by, created_at, updated_at

v2_draw_line_items
  id, builder_id, draw_id, sov_line_id,
  previous_completed, previous_stored,
  current_completed, current_stored,
  total_completed_stored, percent_complete,
  balance_to_finish, retainage_amount,
  notes, created_at, updated_at

v2_draw_supporting_docs
  id, builder_id, draw_id, document_type,
  document_id (ref to source module), document_url,
  is_required, is_attached, attached_by, attached_at,
  created_at

v2_draw_approvals
  id, builder_id, draw_id, step_order,
  approver_id, action (pending|approved|rejected|revision_requested),
  notes, acted_at, created_at

v2_draw_format_templates
  id, builder_id, template_name,
  format_type (aia_g702|aia_g703|custom),
  template_config (jsonb), lender_id,
  is_default, created_at, updated_at

v2_draw_schedules
  id, builder_id, project_id, lender_id,
  frequency (monthly|milestone|custom),
  day_of_month, prep_lead_days,
  next_draw_date, notes,
  created_at, updated_at

v2_draw_lender_contacts
  id, builder_id, lender_id, project_id,
  role (inspector|reviewer|loan_officer),
  contact_name, email, phone,
  created_at, updated_at

v2_draw_reconciliation
  id, builder_id, draw_id, line_id (null for total),
  applied_amount, approved_amount, disbursed_amount,
  variance_amount, variance_reason,
  created_at, updated_at

v2_draw_photos
  id, builder_id, draw_id, sov_line_id,
  photo_id (ref to photos module), caption,
  photo_type (before|during|after|general),
  sort_order, created_at
```

---

## API Endpoints

```
# Schedule of Values
GET    /api/v2/projects/:id/sov            # Get current SOV
POST   /api/v2/projects/:id/sov            # Create SOV (from budget or manual)
PUT    /api/v2/projects/:id/sov            # Update SOV
POST   /api/v2/projects/:id/sov/import     # Import SOV from budget/estimate
GET    /api/v2/projects/:id/sov/history    # SOV version history

# Draw Requests
GET    /api/v2/draw-requests               # List all draws (filterable by project, status)
GET    /api/v2/draw-requests/:id           # Draw detail with line items
POST   /api/v2/draw-requests               # Create new draw (draft)
PUT    /api/v2/draw-requests/:id           # Update draw (draft or revision)
DELETE /api/v2/draw-requests/:id           # Delete draw (draft only)

# Draw Generation
POST   /api/v2/draw-requests/auto-generate # Auto-generate draft from invoices/schedule
GET    /api/v2/draw-requests/:id/calculate # Recalculate draw totals

# Draw Line Items
PUT    /api/v2/draw-requests/:id/lines/:lid # Update individual line item
POST   /api/v2/draw-requests/:id/lines/:lid/photos # Link photos to line item

# Approval Workflow
POST   /api/v2/draw-requests/:id/submit-internal   # Submit for internal approval
POST   /api/v2/draw-requests/:id/approve-internal   # Internal approval
POST   /api/v2/draw-requests/:id/reject-internal    # Internal rejection
POST   /api/v2/draw-requests/:id/submit-lender      # Mark as submitted to lender
POST   /api/v2/draw-requests/:id/lender-response    # Record lender response

# Supporting Documents
GET    /api/v2/draw-requests/:id/documents          # List required and attached docs
POST   /api/v2/draw-requests/:id/documents/assemble # Auto-assemble from other modules
POST   /api/v2/draw-requests/:id/documents/upload   # Upload additional doc
GET    /api/v2/draw-requests/:id/documents/check     # Completeness check

# PDF Generation
GET    /api/v2/draw-requests/:id/pdf       # Generate draw request PDF
GET    /api/v2/draw-requests/:id/package   # Generate full package (PDF + supporting docs)

# Reconciliation
POST   /api/v2/draw-requests/:id/reconcile          # Record disbursement and reconcile
GET    /api/v2/draw-requests/:id/reconciliation      # View reconciliation details

# Draw Schedule
GET    /api/v2/projects/:id/draw-schedule  # Get draw schedule
POST   /api/v2/projects/:id/draw-schedule  # Create/update draw schedule
GET    /api/v2/draw-schedules/upcoming     # All upcoming draws across projects

# Format Templates
GET    /api/v2/draw-requests/templates     # List available format templates
POST   /api/v2/draw-requests/templates     # Create custom template
PUT    /api/v2/draw-requests/templates/:id # Update template

# Retainage
GET    /api/v2/projects/:id/retainage      # Retainage summary for project
POST   /api/v2/draw-requests/:id/retainage-release # Request retainage release

# Lender Contacts
GET    /api/v2/projects/:id/lender-contacts # List lender contacts
POST   /api/v2/projects/:id/lender-contacts # Add lender contact
```

---

## UI Components

| Component | Description |
|-----------|-------------|
| SOVEditor | Spreadsheet-style editor for schedule of values with import/manual entry |
| DrawRequestForm | Form for creating/editing draw with SOV line items, amounts, and % complete |
| DrawRequestPDF | Preview of generated AIA G702/G703 or custom format before submission |
| DrawDashboard | Overview of all draws across projects: upcoming, in progress, submitted, disbursed |
| DrawApprovalFlow | Visual approval pipeline showing current step and history |
| SupportingDocsChecklist | Checklist of required documents with attachment status and auto-assemble button |
| DrawReconciliation | Side-by-side comparison: applied vs. approved vs. disbursed with variance notes |
| DrawScheduleCalendar | Calendar showing upcoming draw dates with preparation status indicators |
| RetainageTracker | Cumulative retainage dashboard with release workflow |
| DrawPhotoLinker | Interface for linking progress photos to specific SOV lines for draw package |
| LenderConfigPanel | Per-lender settings: format template, required documents, contact info |
| AutoDrawGenerator | Review auto-calculated billing recommendations with accept/adjust workflow |
| DrawHistoryTimeline | Chronological view of all draws on a project with status and amounts |
| DrawVarianceReport | Analysis of applied vs. received across all draws with trend visualization |
| FormatTemplateBuilder | Admin tool for creating custom draw request format templates |

---

## Dependencies

- **Module 9:** Budget & Cost Tracking (schedule of values source data, cost tracking)
- **Module 11:** Basic Invoicing (approved invoices for draw assembly, retainage data)
- **Module 14:** Lien Waivers (waiver package for supporting documents)
- **Module 6:** Document Storage (generated PDFs, supporting document storage)
- **Module 13:** Scheduling (percent complete data for auto-generation)
- **Module 17:** Change Orders (SOV modifications from approved change orders)
- **Module 28:** Permitting & Inspections (inspection reports for supporting docs)
- **Module 29:** Photos & Media (progress photos for draw package)

---

## Open Questions

1. Should the system support direct submission to lender portals via API (e.g., Buildfax, Land Gorilla)? This would be a significant integration effort but high value.
2. How do we handle draws for projects with no construction lender (owner-funded)? Same workflow but simpler, or a separate lightweight billing module?
3. Should the system support notarization of draw requests? Some lenders require notarized contractor certification.
4. How do we handle draws that span multiple months (work completed in January but draw submitted in February covering both months)?
5. Should the auto-generation engine account for over-billing and under-billing strategies that some builders use for cash flow management?
6. How do we handle the scenario where a lender requires their own proprietary software for draw submission? (The draw package is still useful but the SOV lives in two systems.)
7. Should stored materials require photographic evidence? Some lenders require photos of materials on site.
8. How do we handle cost-plus contracts where the draw is actual costs plus fee, not percent-of-contract-value? Different SOV structure needed.
