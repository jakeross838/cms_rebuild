# Module 14: Lien Waiver Management

**Phase:** 3 - Financial Power
**Status:** TODO
**Last Updated:** 2026-02-11

---

## Overview

Manages the creation, tracking, collection, and compliance enforcement of lien waivers from subcontractors and suppliers. Lien waivers are legally required documents that vary significantly by state -- the system must generate state-specific statutory forms where required and support custom forms for states without statutory requirements. Lien waiver collection is tightly integrated with the payment workflow (Module 11) and draw request assembly (Module 15). The system enforces configurable compliance rules that can block payments until waivers are received, and provides a vendor-facing portal for waiver submission.

---

## Gap Items Addressed

| Gap # | Description | How Addressed |
|-------|-------------|---------------|
| 351 | State-specific statutory lien waiver forms | Form template library covering all 50 states with statutory forms |
| 352 | States with no statutory forms (builder-specific) | Custom form builder and upload for non-statutory states |
| 353 | Conditional vs. unconditional waiver tracking by state | Waiver type engine: conditional/unconditional paired with state rules |
| 354 | Sub-tier lien waiver tracking (sub's supplier waivers) | Multi-tier waiver tracking: prime sub, sub-tier vendors, suppliers |
| 355 | Notice to Owner / Preliminary Notice requirements | Preliminary notice tracking with state-specific deadline calculations |
| 356 | Mechanic's lien filing deadlines by state | Deadline engine with state rules and configurable alert lead times |
| 357 | Lien release/satisfaction documentation | Release tracking with document storage and recording status |
| 358 | Electronic vs. wet signature requirements | Signature method tracking per jurisdiction; e-sign where legal |
| 285 | Retainage varying by contract (related to waiver release) | Waiver tied to retainage release workflow |
| 289 | Contract closeout checklist including final lien waiver | Final waiver as required closeout item linked to project completion |
| 348 | Conditional payment rules (lien waiver required before payment) | Compliance gate: configurable payment hold until waiver received |

---

## Detailed Requirements

### 1. State-Specific Form Library

- Pre-loaded statutory lien waiver forms for all states that have them:
  - **California:** 4 statutory forms (conditional progress, unconditional progress, conditional final, unconditional final)
  - **Florida:** Statutory waiver form with required language
  - **Texas:** Statutory forms with specific requirements for residential vs. commercial
  - **Michigan, Georgia, Arizona, etc.:** Each state's required forms
- States without statutory forms: builder uploads their own template or uses platform default
- Form templates are versioned -- when a state updates its statute, new form version is published
- Platform legal team maintains form library; builders notified of updates
- Builder can customize non-statutory portions of forms (company info, additional terms)
- Form output formats: PDF (fillable and flat), print-ready

### 2. Waiver Types and Classification

- **By Condition:**
  - Conditional (payment not yet received; waiver effective upon payment clearing)
  - Unconditional (payment received; waiver immediately effective)
- **By Payment Stage:**
  - Progress payment (partial work completed)
  - Final payment (all work on contract completed)
- Matrix of 4 types: Conditional Progress, Unconditional Progress, Conditional Final, Unconditional Final
- System auto-determines waiver type based on:
  - Payment status (pre-payment = conditional; post-payment = unconditional)
  - Invoice type (progress invoice = progress waiver; final invoice = final waiver)
- Builder can override type selection when needed

### 3. Automated Waiver Requests

- Trigger waiver request automatically on:
  - Invoice approval (request conditional waiver before payment)
  - Payment issuance (request unconditional waiver after payment)
  - Draw request preparation (request all outstanding waivers for draw package)
  - Configurable: builder chooses which trigger(s) to activate
- Waiver request delivery channels:
  - Email to vendor with pre-filled waiver attached (PDF)
  - Vendor portal link for online completion
  - SMS notification with link
- Request includes: waiver form, payment amount, through-date, project info
- Automatic reminder schedule: configurable (3 days, 7 days, 14 days after request)
- Escalation: after N reminders, alert PM or hold future payments

### 4. Vendor Portal for Waiver Submission

- Vendor receives link to submit waiver without needing a full platform account
- Vendor portal actions:
  - View pre-filled waiver with all details
  - E-sign directly in browser (where legally permitted)
  - Upload signed waiver (photo or PDF) for wet-signature jurisdictions
  - Submit for multiple outstanding waivers in one session
- Vendor dashboard showing:
  - Outstanding waiver requests
  - Previously submitted waivers
  - Payment history tied to waivers
- Mobile-optimized for field submission (take photo of signed waiver)

### 5. Multi-Tier Waiver Tracking

- **Tier 1:** Prime subcontractor/vendor (direct contract with builder)
- **Tier 2:** Sub-subcontractors and suppliers (sub's vendors)
- Builder-configurable: require sub-tier waivers or not
- When required:
  - Sub must list their sub-tier vendors on each project
  - System tracks waivers needed from each tier
  - Sub can upload sub-tier waivers through vendor portal
  - Draw package includes all tiers
- Sub-tier waiver checklist: must be complete before final payment to prime sub

### 6. Preliminary Notice / Notice to Owner Tracking

- State-specific preliminary notice requirements:
  - Which parties must send (sub, supplier, laborer)
  - Deadline from first furnishing (20 days in California, varies by state)
  - Required recipients (owner, lender, general contractor)
  - Required content and format
- Notice tracking per vendor per project:
  - Notice sent date
  - Delivery confirmation
  - Expiration/renewal requirements
- Alert system: "Vendor X has not filed preliminary notice -- lien rights may be invalid"
- Some states do not require preliminary notice -- system must handle this gracefully

### 7. Mechanic's Lien Deadline Tracking

- State-specific lien filing deadlines calculated from:
  - Last date of work/furnishing
  - Date of project completion
  - Date of notice of completion filing
- Configurable alert lead times: 30 days, 14 days, 7 days before deadline
- Dashboard showing approaching deadlines across all projects
- Historical tracking: which vendors have lien rights, which have waived them
- Notice of Completion filing tracking (triggers shorter lien deadline in many states)

### 8. Compliance Enforcement

- Payment hold rules configurable per builder:
  - **Strict:** No payment issued without current waiver on file
  - **Warn:** Payment allowed but warning displayed; logged for audit
  - **None:** No waiver enforcement (builder's choice)
- Compliance checks at multiple points:
  - Invoice approval: is waiver on file for prior payment?
  - Payment issuance: is conditional waiver received?
  - Draw request assembly: are all vendor waivers collected?
  - Project closeout: are all final waivers on file?
- Compliance dashboard: red/yellow/green status per vendor per project
- Compliance report for draw packages showing waiver status for every vendor

### 9. Lien Release and Satisfaction

- Track lien releases when a mechanic's lien has been filed:
  - Lien filing details (date, amount, recording info)
  - Release/satisfaction document tracking
  - Release recording confirmation
- Bond-related waiver handling (when a bond is posted in lieu of lien)
- Title company integration (future): automated lien search verification

### 10. Signature Handling

- E-signature integration for jurisdictions where electronic signatures are legally valid
- Wet signature workflow for jurisdictions requiring original signatures:
  - Generate and send form for printing
  - Vendor uploads photo/scan of signed form
  - Builder can mark "original received" for physical tracking
- Notarization tracking for states requiring notarized waivers
- Signature verification: system stores signer name, date, IP address (for e-sign)

---

## Database Tables

```
v2_lien_waiver_templates
  id, builder_id (null for platform-managed), state_code,
  waiver_type (conditional_progress|unconditional_progress|conditional_final|unconditional_final),
  is_statutory, template_name, template_content (html/pdf template),
  version, effective_date, superseded_by,
  created_at, updated_at

v2_lien_waivers
  id, builder_id, project_id, vendor_id, contract_id,
  invoice_id, payment_id,
  template_id, waiver_type,
  through_date, amount, payment_amount,
  status (draft|requested|submitted|approved|rejected|void),
  request_sent_at, request_channel (email|portal|sms),
  submitted_at, approved_by, approved_at,
  signature_type (electronic|wet|notarized),
  signature_data (jsonb), signed_document_url,
  reminders_sent, next_reminder_at,
  tier (prime|sub_tier), parent_vendor_id,
  notes, created_by, created_at, updated_at

v2_preliminary_notices
  id, builder_id, project_id, vendor_id,
  state_code, notice_type, required_by_state,
  sent_date, delivery_method, delivery_confirmation,
  deadline_date, expiration_date,
  status (pending|sent|confirmed|expired|not_required),
  document_url, created_at, updated_at

v2_lien_deadlines
  id, builder_id, project_id, vendor_id,
  state_code, last_work_date, completion_date,
  notice_of_completion_date, filing_deadline,
  lien_filed, lien_amount, lien_filing_date,
  lien_recording_info, release_status (none|filed|released|bonded),
  release_document_url, release_date,
  created_at, updated_at

v2_waiver_compliance_rules
  id, builder_id, enforcement_level (strict|warn|none),
  require_sub_tier, reminder_schedule (jsonb),
  escalation_after_days, block_payment, block_draw,
  require_preliminary_notice,
  created_at, updated_at

v2_waiver_state_rules
  id, state_code, has_statutory_form,
  preliminary_notice_required, preliminary_notice_days,
  lien_deadline_from_last_work, lien_deadline_from_completion,
  lien_deadline_from_noc, allows_electronic_signature,
  requires_notarization, special_rules (jsonb),
  last_reviewed, created_at, updated_at

v2_sub_tier_vendors
  id, builder_id, project_id, prime_vendor_id,
  sub_vendor_name, sub_vendor_contact,
  scope_description, waiver_required,
  created_at, updated_at
```

---

## API Endpoints

```
# Lien Waiver CRUD
GET    /api/v2/lien-waivers                # List with filters (project, vendor, status, type)
GET    /api/v2/lien-waivers/:id            # Waiver detail
POST   /api/v2/lien-waivers                # Create waiver (manual)
PUT    /api/v2/lien-waivers/:id            # Update waiver
POST   /api/v2/lien-waivers/:id/void       # Void a waiver

# Waiver Requests
POST   /api/v2/lien-waivers/request        # Send waiver request to vendor
POST   /api/v2/lien-waivers/request/batch  # Batch request for draw package
POST   /api/v2/lien-waivers/:id/remind     # Send reminder

# Vendor Portal (unauthenticated with token)
GET    /api/v2/portal/waivers/:token       # Vendor views waiver request
POST   /api/v2/portal/waivers/:token/sign  # E-sign submission
POST   /api/v2/portal/waivers/:token/upload # Upload signed document

# Waiver Review (builder staff)
POST   /api/v2/lien-waivers/:id/approve    # Approve submitted waiver
POST   /api/v2/lien-waivers/:id/reject     # Reject with reason

# Preliminary Notices
GET    /api/v2/preliminary-notices          # List notices
POST   /api/v2/preliminary-notices          # Create/track notice
PUT    /api/v2/preliminary-notices/:id      # Update notice

# Lien Deadlines
GET    /api/v2/lien-deadlines              # Dashboard of approaching deadlines
GET    /api/v2/lien-deadlines/:projectId   # Project-specific deadlines

# Compliance
GET    /api/v2/lien-waivers/compliance     # Compliance dashboard data
GET    /api/v2/lien-waivers/compliance/:projectId # Per-project compliance
GET    /api/v2/lien-waivers/draw-package/:projectId # Waiver status for draw assembly

# Templates
GET    /api/v2/lien-waivers/templates      # Available templates (state-filtered)
POST   /api/v2/lien-waivers/templates      # Upload custom template
GET    /api/v2/lien-waivers/state-rules/:state # State-specific rules

# Configuration
GET    /api/v2/settings/waiver-compliance  # Get compliance rules
PUT    /api/v2/settings/waiver-compliance  # Update compliance rules

# Sub-Tier Vendors
GET    /api/v2/projects/:id/sub-tier-vendors # List sub-tier vendors
POST   /api/v2/projects/:id/sub-tier-vendors # Add sub-tier vendor
```

---

## UI Components

| Component | Description |
|-----------|-------------|
| WaiverDashboard | Overview of all waivers across projects: outstanding, submitted, approved; compliance status |
| WaiverRequestForm | Form to generate and send waiver request with template selection and vendor picker |
| WaiverTracker | Per-project waiver status grid: vendors as rows, waiver types as columns, status color-coded |
| ComplianceStatusBar | Red/yellow/green indicator showing waiver compliance per project or per vendor |
| DrawPackageWaiverChecklist | Checklist of all waivers needed for a draw request with collection status |
| StateRulesViewer | Reference panel showing lien waiver rules for selected state |
| TemplateEditor | View and customize waiver templates; preview generated PDF |
| VendorWaiverPortal | Public-facing portal for vendors to view, sign, and submit waivers |
| PreliminaryNoticeTracker | List of preliminary notices with deadlines and sent/confirmed status |
| LienDeadlineCalendar | Calendar view of approaching mechanic's lien deadlines with alerts |
| SubTierVendorManager | Interface for tracking sub-tier vendors and their waiver status |
| WaiverComplianceConfig | Builder settings for enforcement level, reminders, and blocking rules |
| BulkWaiverRequestModal | Select multiple vendors and send waiver requests for an upcoming draw |
| SignedWaiverViewer | Display signed waiver document with approval/reject actions |

---

## Dependencies

- **Module 10:** Contact/Vendor Management (vendor contact info for sending requests)
- **Module 11:** Basic Invoicing (payment linkage, payment hold enforcement)
- **Module 15:** Draw Requests (waiver package assembly for draws)
- **Module 6:** Document Storage (signed waiver file storage)
- **Module 1:** Auth & Access (vendor portal token-based access)
- **External:** E-signature provider (DocuSign, HelloSign, or built-in simple e-sign)
- **External:** State lien law database (maintained by platform legal team)

---

## Open Questions

1. Should the platform provide its own built-in e-signature capability, or integrate with DocuSign/HelloSign? Built-in is simpler but may lack legal weight in some jurisdictions.
2. How frequently should state lien law rules be reviewed and updated? Suggest annual review with legislative session monitoring.
3. Should sub-tier waiver tracking be mandatory or optional? Most builders only track Tier 1; requiring Tier 2 adds significant vendor management overhead.
4. How do we handle waivers for vendors who refuse to use the portal and only submit paper? Manual upload workflow with "received via mail" flag.
5. Should the system support lien waiver bonds (surety bonds posted in lieu of lien release)?
6. How do we handle projects that span multiple states (rare in residential, possible in commercial crossover)?
7. Should the system track lien waiver requirements for the builder's own lien rights (as a general contractor)?
