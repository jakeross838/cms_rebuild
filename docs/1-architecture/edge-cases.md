# RossOS Edge Case Handling

**Purpose:** Design decisions for uncommon but critical business, financial, and legal scenarios that the platform must handle gracefully.

**Applies to:** All modules across all 6 build phases. Each edge case references the entities, tables, and workflows defined in `system-architecture.md`.

**Principle:** The system never deletes data. Every edge case workflow produces an auditable paper trail. When in doubt, the system captures more context rather than less — construction disputes are won with documentation.

---

## Table of Contents

- [A. Business Edge Cases (GAP-599 through GAP-620)](#a-business-edge-cases)
  - [A1. Client Bankruptcy Mid-Construction (GAP-599)](#a1-client-bankruptcy-mid-construction-gap-599)
  - [A2. Builder Acquires Another Builder's Project (GAP-600)](#a2-builder-acquires-another-builders-project-gap-600)
  - [A3. Subcontractor Termination Mid-Scope (GAP-601)](#a3-subcontractor-termination-mid-scope-gap-601)
  - [A4. Project Paused for Extended Period (GAP-602)](#a4-project-paused-for-extended-period-gap-602)
  - [A5. Property Sold During Construction (GAP-603)](#a5-property-sold-during-construction-gap-603)
  - [A6. Architect Fired Mid-Project (GAP-604)](#a6-architect-fired-mid-project-gap-604)
  - [A7. Client Divorce During Construction (GAP-605)](#a7-client-divorce-during-construction-gap-605)
  - [A8. Builder Key Employee Death or Incapacitation (GAP-606)](#a8-builder-key-employee-death-or-incapacitation-gap-606)
  - [A9. Material Supplier Bankruptcy (GAP-607)](#a9-material-supplier-bankruptcy-gap-607)
  - [A10. Building Department Changes Requirements (GAP-608)](#a10-building-department-changes-requirements-gap-608)
  - [A11. Adjacent Property Owner Lawsuit (GAP-609)](#a11-adjacent-property-owner-lawsuit-gap-609)
  - [A12. Client Self-Performing Work (GAP-610)](#a12-client-self-performing-work-gap-610)
  - [A13. Project Featured in Media (GAP-611)](#a13-project-featured-in-media-gap-611)
  - [A14. Builder Expands into Light Commercial (GAP-612)](#a14-builder-expands-into-light-commercial-gap-612)
  - [A15. Natural Disaster Damages Project (GAP-613)](#a15-natural-disaster-damages-project-gap-613)
  - [A16. Pandemic Work Stoppage (GAP-614)](#a16-pandemic-work-stoppage-gap-614)
  - [A17. Builder Sells the Business (GAP-615)](#a17-builder-sells-the-business-gap-615)
  - [A18. Multiple Builders on Same Subdivision (GAP-616)](#a18-multiple-builders-on-same-subdivision-gap-616)
  - [A19. ADU Alongside Main Home (GAP-617)](#a19-adu-alongside-main-home-gap-617)
  - [A20. Joint Venture Between Builders (GAP-618)](#a20-joint-venture-between-builders-gap-618)
  - [A21. Building Code Edition Change Mid-Year (GAP-619)](#a21-building-code-edition-change-mid-year-gap-619)
  - [A22. Construction Manager / Owner's Rep Access (GAP-620)](#a22-construction-manager--owners-rep-access-gap-620)
- [B. Legal Edge Cases (GAP-797 through GAP-805)](#b-legal-edge-cases)
  - [B1. Mechanic's Lien Documentation by State (GAP-797)](#b1-mechanics-lien-documentation-by-state-gap-797)
  - [B2. Discovery and Litigation Hold (GAP-798)](#b2-discovery-and-litigation-hold-gap-798)
  - [B3. OSHA Citation Documentation and Response (GAP-799)](#b3-osha-citation-documentation-and-response-gap-799)
  - [B4. Construction Defect Claim Workflows (GAP-800)](#b4-construction-defect-claim-workflows-gap-800)
  - [B5. Warranty Claim Dispute Resolution (GAP-801)](#b5-warranty-claim-dispute-resolution-gap-801)
  - [B6. Expert Witness Documentation Support (GAP-802)](#b6-expert-witness-documentation-support-gap-802)
  - [B7. Non-Compete and Non-Solicitation Tracking (GAP-803)](#b7-non-compete-and-non-solicitation-tracking-gap-803)
  - [B8. Contract Interpretation Disputes (GAP-804)](#b8-contract-interpretation-disputes-gap-804)
  - [B9. Government Audit Preparation (GAP-805)](#b9-government-audit-preparation-gap-805)

---

## A. Business Edge Cases

---

### A1. Client Bankruptcy Mid-Construction (GAP-599)

**Trigger:** Builder learns that the client (homeowner or entity) has filed for bankruptcy (Chapter 7, 11, or 13) or has become insolvent while construction is underway.

**What the system does:**

1. **Job status transition.** The builder sets the job status to `on_hold` and selects a new hold reason of `client_bankruptcy` from a predefined list. The system records the hold date, the bankruptcy type, the case number (if known), and the court jurisdiction as structured fields on a `job_holds` record.

2. **Automatic financial freeze.** When the hold reason is `client_bankruptcy`, the system blocks the following actions on the job until the hold is lifted:
   - Creating new purchase orders.
   - Approving new invoices for payment.
   - Submitting new draws.
   - Creating new change orders.
   - A banner appears on every job page: "This project is on legal hold due to client bankruptcy. Financial transactions are frozen."

3. **Lien filing documentation workflow.** The system launches a guided lien filing checklist (see also GAP-797 for state-specific rules). This checklist captures:
   - Amount owed to date (pulled automatically from draws submitted minus draws paid).
   - Amount of retainage held.
   - List of all unpaid invoices with vendor names and amounts.
   - Last date of work performed (pulled from the most recent daily log entry).
   - Property legal description (from the job record or entered manually).
   - The system generates a **Lien Rights Summary PDF** containing all of the above, formatted for attorney review.

4. **Partial billing snapshot.** The system creates an immutable snapshot of the budget at the moment of hold. This snapshot records:
   - Every budget line's original amount, revised amount, committed amount, invoiced amount, and paid amount.
   - All draws issued, with their statuses and payment dates.
   - All outstanding purchase order commitments.
   - This snapshot is stored as a `job_financial_snapshot` record with `snapshot_type = 'bankruptcy_hold'` and cannot be edited after creation.

5. **Vendor notification drafts.** The system generates draft notification emails to all vendors with open POs or unpaid invoices on the job, informing them that the project is on hold. The builder reviews and sends these manually.

6. **Project close-out path.** If the project will not resume, the builder transitions from `on_hold` to `cancelled`. The system runs the standard close-out checklist but adds bankruptcy-specific items:
   - Final lien waiver status for all vendors.
   - Proof-of-claim documentation (uploaded as a file).
   - Final cost accounting report exported as PDF.
   - Retainage disposition (released, applied to debt, or held pending court order).

**Data captured:**
- `job_holds` record: `job_id`, `hold_type = 'client_bankruptcy'`, `bankruptcy_type`, `case_number`, `court`, `hold_date`, `notes`, `created_by`.
- `job_financial_snapshots` record: full JSON of budget state at hold date.
- Activity log entries for every status change and financial freeze action.
- All uploaded legal documents (proof of claim, attorney correspondence) stored in a system folder `/Legal/Bankruptcy/`.

---

### A2. Builder Acquires Another Builder's Project (GAP-600)

**Trigger:** A builder on the RossOS platform takes over a construction project that was started by a different builder (who may or may not be on the platform). The acquiring builder needs to onboard the project mid-stream with existing financial history, schedule progress, and documentation.

**What the system does:**

1. **Mid-stream project import wizard.** Under Jobs > Create New Job, the builder selects "Import Existing Project" instead of "Start New." This wizard collects:
   - Project name, address, client information.
   - Original contract amount and contract type.
   - Acquisition date (when the builder took over).
   - Previous builder name (for record-keeping, not linked to any platform account).

2. **Budget baseline import.** The wizard presents two options:
   - **Manual entry:** The builder enters each budget line with its cost code, original amount, amount already spent by the prior builder, and remaining amount.
   - **Spreadsheet import:** The builder uploads a CSV or Excel file with columns mapped to: cost code, description, original budget, prior spent, remaining budget. The AI normalization layer matches cost codes to the company's cost code library and flags unmatched codes for manual resolution.

3. **Historical financial records.** The system creates a `prior_builder_baseline` record on the job that stores:
   - Total amount previously billed to the client.
   - Total amount previously paid to subcontractors.
   - Retainage currently held.
   - Any outstanding change orders from the prior builder (entered as historical COs with status `prior_builder`).
   - These amounts appear on budget reports as "Prior Builder" line items, clearly separated from the acquiring builder's costs.

4. **Document import.** The wizard prompts for upload of:
   - Existing contract and any amendments.
   - Prior builder's most recent draw/pay application.
   - Current plans and specifications.
   - Permit documentation.
   - Existing daily logs or progress photos (bulk upload).
   All files are organized into system folders with a `[Prior Builder]` prefix.

5. **Schedule reconstruction.** The builder creates a new schedule starting from the acquisition date. Tasks completed before acquisition are entered with status `completed` and flagged as `prior_builder_work = true`. The schedule view shows a vertical dashed line at the acquisition date to visually separate prior and current work.

6. **Draw continuity.** The first draw created by the acquiring builder uses the prior builder's draw history as the "previous completed" baseline. The system pre-fills the G702 "Original Contract Sum," "Net Change by Change Orders," and "Total Completed and Stored to Date" fields from the imported baseline so the AIA format remains continuous.

7. **Client portal transition.** If the client already had portal access with a prior system, the builder creates a new portal user for the client. The portal shows the full project timeline, clearly noting the builder transition date.

**Data captured:**
- `jobs` record with `acquisition_date`, `prior_builder_name`, `is_mid_stream_acquisition = true`.
- `prior_builder_baseline` record: `prior_billed`, `prior_paid`, `prior_retainage`, `baseline_budget_json`.
- All imported documents in `/Documents/Prior Builder/`.
- Activity log: "Project imported as mid-stream acquisition from [prior builder name]."

---

### A3. Subcontractor Termination Mid-Scope (GAP-601)

**Trigger:** The builder decides to terminate a subcontractor who has partially completed their contracted scope. This could be for cause (poor workmanship, schedule delays, safety violations) or for convenience.

**What the system does:**

1. **Vendor termination action.** On the vendor's record within the job context, the builder selects "Terminate from Job." A modal collects:
   - Termination type: `for_cause` or `for_convenience`.
   - Termination reason (free text with suggested options: poor workmanship, schedule non-compliance, safety violation, financial default, abandonment).
   - Effective date.
   - Whether a cure notice was sent (checkbox + date sent + upload of cure notice document).

2. **Scope assessment.** The system presents all tasks assigned to this vendor on the job, each with its current percent complete. The builder reviews and confirms:
   - Which tasks are fully complete.
   - Which tasks are partially complete (with adjusted percent complete).
   - Which tasks have not been started.
   The system saves this as a `vendor_termination_scope_assessment`.

3. **Financial reconciliation.** The system generates a termination financial summary:
   - Total contract/PO value for this vendor on this job.
   - Total invoiced to date.
   - Total paid to date.
   - Retainage held.
   - Value of work accepted (based on the scope assessment).
   - Back-charges or liquidated damages (entered by builder).
   - Net amount owed or owed back.
   This summary is saved as a record and can be exported as a PDF for the termination file.

4. **Purchase order closure.** All open POs for the terminated vendor on this job are set to status `terminated`. The system records the original PO total, amount invoiced against the PO, and the remaining uncommitted amount. The uncommitted amounts are released back to the budget lines, updating `committed_amount` on each affected `budget_line`.

5. **Replacement vendor workflow.** The system prompts: "Assign a replacement vendor?" If yes:
   - The builder selects or creates a new vendor.
   - The system creates new tasks by cloning the incomplete/not-started tasks from the terminated vendor, pre-assigned to the replacement vendor.
   - New POs can be created for the replacement vendor with the remaining scope amounts as a starting point.
   - The schedule is automatically updated: tasks assigned to the replacement vendor start after the termination date, and downstream dependent tasks shift accordingly. The system calculates and displays the schedule impact in days.

6. **Cost reconciliation.** The system creates a change order (or a set of line items on an existing CO) capturing the cost impact:
   - Difference between terminated vendor's remaining scope cost and replacement vendor's quoted cost.
   - Mobilization/demobilization costs.
   - Back-charges assessed.
   - Schedule delay damages (if applicable).

7. **Documentation.** The system creates a `/Legal/Vendor Termination/[Vendor Name]/` folder and prompts for upload of:
   - Termination letter.
   - Cure notice and proof of delivery.
   - Photos of work in place at termination.
   - Any correspondence.

**Data captured:**
- `vendor_terminations` record: `vendor_id`, `job_id`, `termination_type`, `reason`, `effective_date`, `cure_notice_sent`, `cure_notice_date`, `scope_assessment_json`, `financial_summary_json`, `replacement_vendor_id`.
- Updated `tasks`: terminated vendor's tasks marked `reassigned`, new tasks created for replacement.
- Updated `budget_lines`: committed amounts adjusted.
- Change order lines for cost delta.
- Activity log entries for every step.

---

### A4. Project Paused for Extended Period (GAP-602)

**Trigger:** A project is placed on hold for an extended duration (weeks to months or longer). Reasons include financing issues, permit delays, client personal circumstances, environmental holds, or external factors. The builder needs to suspend operations, manage vendor commitments, and eventually restart.

**What the system does:**

1. **Job hold with reason.** The builder sets job status to `on_hold` and selects a hold reason: `financing`, `permit_delay`, `client_request`, `environmental`, `legal`, `weather_seasonal`, `pandemic`, or `other`. The system records the hold start date and estimated resume date (if known).

2. **Vendor contract suspension notices.** The system identifies all vendors with:
   - Open purchase orders (status `sent` or `acknowledged`).
   - Active tasks (status `in_progress` or `not_started` with start dates within 60 days).
   The system generates a batch of suspension notification drafts, one per vendor, pre-populated with the vendor name, PO numbers, affected tasks, and hold reason. The builder reviews, edits, and sends. Each PO is updated to status `suspended` with the suspension date recorded.

3. **Permit tracking.** The system flags all permits associated with the job (stored as files with `entity_type = 'permit'` or in the `/Permits/` folder). For each permit, the builder enters:
   - Permit number.
   - Expiration date.
   - Whether an extension has been filed.
   - Extension deadline.
   The system creates reminder notifications 30, 14, and 7 days before each permit expiration, warning that the permit will lapse if the project does not resume or an extension is not filed.

4. **Schedule freeze and restart.** When the job is placed on hold:
   - All in-progress and future tasks are frozen. Their dates are preserved as `original_start_date` and `original_end_date`.
   - When the builder resumes the project, the system asks for the new restart date and calculates the offset in calendar days between the original planned restart and the actual restart.
   - The system shifts all frozen task dates forward by the offset, preserving relative sequencing and dependencies.
   - Tasks that were in-progress at the time of hold resume from their recorded percent complete.

5. **Cost escalation recalculation.** Upon restart, the system presents a "Cost Escalation Review" screen showing:
   - Each budget line with its original estimated unit cost.
   - A field for the builder to enter the updated unit cost (reflecting material price increases during the hold).
   - The system calculates the escalation delta per line and in total.
   - If the total escalation exceeds a configurable threshold (default: 5% of remaining budget), the system prompts the builder to create a change order to document the increase.
   - The escalation amounts are tagged as `reason = 'cost_escalation_hold'` on the change order lines.

6. **Site condition documentation.** When placing the project on hold, the system prompts the builder to create a "Hold Commencement" daily log entry documenting:
   - Current site conditions.
   - Weatherproofing and securing measures taken.
   - Photos of work in place.
   When restarting, the system prompts for a "Restart Assessment" daily log entry to document any deterioration, vandalism, or weather damage that occurred during the hold.

**Data captured:**
- `job_holds` record: `hold_type`, `hold_reason`, `hold_start_date`, `estimated_resume_date`, `actual_resume_date`, `hold_duration_days`.
- `purchase_orders` updated: status `suspended`, `suspension_date`.
- Permit records with expiration tracking.
- `tasks` with `original_start_date`, `original_end_date` preserved.
- Cost escalation change order with tagged line items.
- Daily log entries for hold commencement and restart assessment.

---

### A5. Property Sold During Construction (GAP-603)

**Trigger:** The property under construction is sold to a new owner while the project is still in progress. The contract must be assigned (or a new contract executed), the new owner needs portal access, and all documentation must be transferred cleanly.

**What the system does:**

1. **Property transfer initiation.** On the job detail page, the builder selects "Record Property Transfer" from the actions menu. A form collects:
   - Transfer date (closing date).
   - New owner name, email, phone.
   - Whether the new owner is an existing client in the system.
   - Whether the existing contract is being assigned or a new contract will be executed.

2. **Client record management.**
   - If the new owner is not in the system, a new `clients` record is created.
   - The job's `client_id` is updated to point to the new owner.
   - The previous owner's `client_id` is preserved in a `job_client_history` record: `job_id`, `client_id`, `role = 'original_owner'`, `start_date`, `end_date = transfer_date`.
   - Both clients remain accessible on the job for historical reference.

3. **Contract documentation.**
   - If the contract is being assigned, the system prompts for upload of the assignment agreement and any consent documents. The existing contract record is updated with `assigned_to_client_id` and `assignment_date`. The original contract remains in the system.
   - If a new contract is being executed, the builder creates a new contract record linked to the job, and the old contract is marked `status = 'superseded'`.
   - Any contract-linked selections, allowances, or change orders carry forward to the new owner automatically.

4. **Portal access transition.**
   - Portal access for the previous owner is deactivated (the `portal_users` record is set to `is_active = false`).
   - A new portal invitation is sent to the new owner's email.
   - The new owner's portal shows the full project history from inception, not just from the transfer date, so they have complete visibility into work performed.

5. **Financial continuity.**
   - All prior draws remain in the system with the original client name for audit purposes.
   - Future draws are issued to the new client.
   - The system adds a note on the next draw: "Client changed effective [transfer date]. Prior draws issued to [original client name]."
   - Retainage calculations continue uninterrupted across the transfer.

6. **Closing documentation folder.** The system creates a `/Documents/Property Transfer/` folder and prompts the builder to upload:
   - Settlement statement / HUD-1 (relevant construction portions).
   - Assignment of contract (if applicable).
   - New owner identification.
   - Updated insurance certificates naming new owner as additional insured.
   - Title transfer confirmation.

**Data captured:**
- `job_client_history` record linking both old and new clients to the job with date ranges.
- Updated `jobs.client_id` to new owner.
- Contract records (assigned or superseded).
- Portal user deactivation/creation.
- All transfer documents in the property transfer folder.
- Activity log: "Property transferred from [old client] to [new client] on [date]."

---

### A6. Architect Fired Mid-Project (GAP-604)

**Trigger:** The builder or client terminates the architect's engagement while the project has approved plans and construction is underway. A new architect must be onboarded, plans may need revision, and responsibility for design decisions must be clearly documented.

**What the system does:**

1. **Architect as a vendor record.** Architects are stored as vendors with `trade = 'Architect'`. The builder marks the current architect vendor as terminated from the job using the vendor termination workflow (see GAP-601), selecting `termination_type = 'for_convenience'` or `for_cause` as appropriate.

2. **Plan version control.** All architectural plans are stored as files with `entity_type = 'plan'`. When the architect is terminated:
   - The system marks all current plan files as `plan_status = 'terminal_architect'` — meaning these are the last plans produced by the outgoing architect.
   - A snapshot of all current plan versions is created and stored as an immutable record.
   - The system logs: "Plans by [Architect Name] frozen at version [X] as of [termination date]."

3. **New architect onboarding.** The builder creates or selects a new vendor with `trade = 'Architect'` and assigns them to the job. The system presents a "Design Transition Checklist":
   - [ ] New architect has received all current plan sets (system provides download link to the plan folder).
   - [ ] New architect has received the current specifications.
   - [ ] New architect has reviewed all approved change orders affecting design.
   - [ ] New architect has visited the site.
   - [ ] New architect has provided a scope of services and fee proposal.
   - [ ] Professional liability insurance certificate uploaded.
   - [ ] New architect agreement executed and uploaded.

4. **Plan revision management.** When the new architect submits revised plans:
   - The system creates new file versions linked to the previous versions, maintaining the full version chain.
   - The revision is tagged with `revision_architect_id` so the system can report which architect authored each revision.
   - If the revision changes scope, the builder is prompted to create a change order documenting the design change cost impact.

5. **Responsibility timeline.** The system maintains a clear record of which architect was responsible for the design during which period:
   - Architect A: project start through termination date.
   - Architect B: termination date forward.
   - This timeline is available as a report and is referenced in warranty and defect claim workflows (see GAP-800).

6. **RFI re-routing.** Any open RFIs (Requests for Information) assigned to the terminated architect are flagged for reassignment. The builder bulk-reassigns them to the new architect. Closed RFIs remain attributed to the original architect for the record.

**Data captured:**
- Vendor termination record for old architect.
- Plan version snapshots at termination.
- Design transition checklist completion status.
- New vendor assignment with start date.
- Architect responsibility timeline on the job (via `job_vendor_assignments` with date ranges).
- RFI reassignment log.

---

### A7. Client Divorce During Construction (GAP-605)

**Trigger:** The client couple going through a divorce during an active construction project. This creates dual communication requirements, potential conflict over design decisions, and legal sensitivity around financial matters.

**What the system does:**

1. **Dual-client configuration.** The builder updates the job to have two client contacts instead of one. The system supports multiple `portal_users` per `client` record, but in a divorce scenario, the builder may need to split the single client record into two separate client records (one per spouse), each linked to the job via `job_client_history` with `role = 'co_owner_a'` and `role = 'co_owner_b'`.

2. **Communication protocol flag.** The job receives a `communication_protocol` flag set to `dual_party`. When this flag is active:
   - All emails, portal notifications, and draw submissions generated by the system are sent to both parties simultaneously.
   - The system adds a notice to all outgoing communications: "This communication is being sent to all parties of record on this project."
   - The builder can configure whether both parties must approve change orders and draws, or whether either party's approval is sufficient. This setting is stored on the job: `approval_mode = 'both_required'` or `'either_sufficient'`.

3. **Decision authority documentation.** The system prompts the builder to upload:
   - Any court order or mediation agreement specifying decision authority.
   - Attorney contact information for each party.
   - Written authorization from both parties (or the court) designating who can approve expenditures and design changes.
   These documents are stored in a `/Legal/Client Communication Protocol/` folder on the job.

4. **Selection and change order dual-approval.** If `approval_mode = 'both_required'`:
   - Selections sent to the portal require approval from both portal users before the status changes to `approved`.
   - Change orders sent for client approval show approval status per party: "Party A: Approved, Party B: Pending."
   - Draws require both signatures before being marked as client-approved.

5. **Financial sensitivity.** The system does not display cost breakdowns or builder margin information in any portal view (this is standard), but the builder can further restrict portal visibility to show only:
   - Progress photos.
   - Schedule status.
   - Selections requiring decisions.
   - Draws requiring approval (totals only, no cost code detail).
   This restricted mode is configured per-job under portal settings.

6. **Communication log.** Every email, portal message, and notification sent is logged in `activity_logs` with the recipient(s) noted. This provides a complete record of who was informed of what and when, which is critical if the divorce becomes contentious regarding construction decisions.

**Data captured:**
- `job_communication_protocol` record: `protocol_type = 'dual_party'`, `approval_mode`, `party_a_client_id`, `party_b_client_id`, `attorney_a_contact`, `attorney_b_contact`.
- Dual portal user records.
- Per-party approval status on change orders, draws, and selections.
- All legal documents (court orders, authorizations) in the legal folder.
- Complete communication audit log.

---

### A8. Builder Key Employee Death or Incapacitation (GAP-606)

**Trigger:** A key employee of the building company (the owner, a project manager, superintendent, or estimator) dies or becomes incapacitated and can no longer contribute to the business. All project knowledge and documentation must be accessible to the remaining team and any successor.

**What the system does:**

1. **Complete documentation by design.** This edge case is primarily handled by the system's core architecture: every decision, communication, financial transaction, and piece of project documentation is stored digitally with full audit trails. The system is the institutional memory. However, specific features support continuity:

2. **User access transfer.** An admin-level user (or the company owner) can:
   - Deactivate the incapacitated employee's user account.
   - Reassign all of their job assignments to one or more other users in bulk. The system presents a list of all jobs where the employee is assigned, with their role on each, and lets the admin select a replacement per job.
   - All notifications, approval queues, and task assignments previously routed to the deactivated user are redirected to the replacement(s).

3. **Knowledge export for specific user.** The system can generate a "User Contribution Report" that shows everything a specific user has touched:
   - All daily logs they authored.
   - All invoices they approved.
   - All change orders they created.
   - All files they uploaded.
   - All activity log entries attributed to them.
   This report helps the successor understand the context of decisions made by the departing employee.

4. **Emergency contact and succession fields.** In company settings, the system stores:
   - Business succession contact (name, email, phone, relationship).
   - Attorney/legal representative for the company.
   - These contacts can be granted temporary read-only access to the platform if the company owner is the one incapacitated. This requires a secondary admin to initiate.

5. **Comprehensive business documentation export.** If the entire company needs to be handed off (e.g., the sole proprietor dies), the system supports a full data export (see also GAP-615):
   - All jobs with complete financial histories.
   - All vendor and client contact information.
   - All documents and photos.
   - All contracts and change orders.
   - All schedule data.
   - Exported as a structured ZIP archive with a manifest file explaining the contents.

6. **Client communication.** The system can generate draft notification emails to all active clients informing them of a transition. The template includes:
   - The new point of contact for their project.
   - Assurance that all project documentation is maintained.
   - Updated contact information.

**Data captured:**
- User deactivation timestamp and reason.
- Job reassignment records: `old_user_id`, `new_user_id`, `job_id`, `reassignment_date`, `reason = 'employee_incapacitation'`.
- User contribution report (generated on demand).
- Company succession contact information in `company_settings`.
- Activity log: "User [name] deactivated. All assignments transferred to [replacement names]."

---

### A9. Material Supplier Bankruptcy (GAP-607)

**Trigger:** A material supplier (vendor) who has received deposits or has outstanding orders goes bankrupt or ceases operations. The builder needs to track deposit recovery, source replacement materials, assess schedule impact, and manage substitution approvals.

**What the system does:**

1. **Vendor status update.** The builder marks the vendor record as `status = 'bankrupt'` or `status = 'defunct'`. This flags the vendor across all jobs and prevents new POs from being created for this vendor. A warning banner appears on the vendor detail page and on every job where this vendor has active commitments.

2. **Deposit recovery tracking.** The system creates a `vendor_recovery_claim` record for each job affected:
   - Total deposits paid (sum of all paid invoices with `payment_type = 'deposit'` for this vendor on this job).
   - Insurance claim filed (yes/no, claim number, insurance carrier).
   - Bankruptcy proof-of-claim filed (yes/no, claim number, filing date).
   - Amount recovered to date.
   - Expected recovery (builder's estimate).
   - Status: `pending`, `filed`, `partial_recovery`, `full_recovery`, `written_off`.
   The dashboard shows a "Pending Recoveries" widget summing all outstanding claims.

3. **Outstanding order identification.** The system automatically identifies all open purchase orders for the bankrupt vendor across all jobs. For each PO, it shows:
   - Items ordered but not yet delivered.
   - Estimated value of undelivered items.
   - Whether any partial deliveries were received.
   Each PO is set to status `vendor_default`.

4. **Alternative sourcing workflow.** For each affected PO, the builder can:
   - Create a "Replacement Sourcing" record that links the original PO to a new PO with a different vendor.
   - Enter quotes from alternative suppliers.
   - Compare original cost to replacement cost.
   - If the replacement costs more, the system prompts to create a change order for the cost difference (if the increase will be passed to the client) or a budget adjustment (if the builder absorbs it).

5. **Substitution approval workflow.** If the replacement material is not identical to the original specification:
   - The builder creates a substitution request record: original material spec, proposed substitute, reason for substitution, cost difference.
   - If client approval is required (for selections or specified items), the substitution request is sent to the client portal for review and approval.
   - If architect approval is required, the builder tracks approval status externally and uploads the approval documentation.
   - Approved substitutions are linked to the relevant budget lines and selections.

6. **Schedule impact assessment.** The system calculates the delivery delay:
   - Original expected delivery date (from the original PO).
   - New expected delivery date (from the replacement PO or builder estimate).
   - Delta in days.
   - Tasks dependent on the material delivery are highlighted, and the system shows the cascading schedule impact. The builder can accept the schedule shift, which updates all affected task dates.

**Data captured:**
- Vendor record updated: `status = 'bankrupt'`, `bankruptcy_date`.
- `vendor_recovery_claims` per job: deposit amounts, claim numbers, recovery status.
- PO status changes to `vendor_default`.
- Replacement POs linked to originals.
- Substitution request records with approval chain.
- Schedule impact calculations.
- All correspondence and legal filings in `/Legal/Vendor Default/[Vendor Name]/`.

---

### A10. Building Department Changes Requirements (GAP-608)

**Trigger:** The local building department adopts a new code, issues a new interpretation, or changes specific requirements that affect an in-progress project. This may require plan revisions, additional inspections, and additional costs.

**What the system does:**

1. **Regulatory change record.** The builder creates a `regulatory_change` record on the job:
   - Issuing authority (building department name).
   - Date of notification.
   - Effective date of the change.
   - Description of the new requirement.
   - Affected building systems or trades (e.g., electrical, plumbing, structural).
   - Citation or code reference (e.g., "2024 IRC Section 314.2").
   - Upload of the official notice or bulletin.

2. **Impact assessment.** The system prompts the builder to document:
   - Which existing approved plan sheets are affected.
   - Whether plan revisions are required (and by whom — architect, engineer, etc.).
   - Whether additional permits or inspections are required.
   - Whether work already completed must be modified (rework).
   - Estimated additional cost.
   - Estimated schedule impact in days.

3. **Cost tracking.** The builder creates a change order with `source = 'regulatory_change'` linking back to the regulatory change record. The change order lines capture:
   - Cost of plan revisions.
   - Cost of additional materials or labor.
   - Cost of rework (if work in place must be modified).
   - Additional permit fees.
   - These are tagged as `regulatory` so they can be reported separately from client-requested changes.

4. **Plan revision cycle.** The system tracks the plan revision workflow:
   - Revision requested from architect/engineer (task created, assigned to architect vendor).
   - Revised plans received (new file version uploaded).
   - Revised plans submitted to building department (task status update).
   - Revised plans approved (task completed, approval documentation uploaded).
   - Each step is tracked with dates so the builder can document the delay caused by the regulatory change.

5. **Client communication.** If the regulatory change results in additional cost or schedule delay, the system generates a draft client notification explaining:
   - What changed and why (beyond the builder's control).
   - Impact on cost (referencing the change order).
   - Impact on schedule.
   - The notification is sent via the portal and/or email.

**Data captured:**
- `regulatory_changes` record: `job_id`, `authority`, `notification_date`, `effective_date`, `description`, `code_reference`, `affected_systems`, `impact_assessment_json`.
- Change order with `source = 'regulatory_change'` and tagged line items.
- Plan file versions with revision notes.
- Task records for the plan revision cycle.
- Client notification in communication log.
- Official notice document in `/Documents/Regulatory/`.

---

### A11. Adjacent Property Owner Lawsuit (GAP-609)

**Trigger:** An adjacent property owner files a lawsuit or complaint to stop construction (e.g., easement dispute, noise complaint, property line dispute, environmental claim). The project may need to be paused, and all communications with the complainant must be restricted and documented.

**What the system does:**

1. **Legal hold on the job.** The builder sets the job to `on_hold` with hold reason `legal_dispute`. This triggers the same financial freeze as GAP-599 (no new POs, no new draws) unless the builder explicitly overrides it (the dispute may not require a full financial freeze — the builder chooses which restrictions to apply).

2. **Communication restriction flag.** The job receives a `legal_communication_restriction` flag. When active:
   - A prominent red banner appears on the job: "LEGAL HOLD: All communications regarding this project must be reviewed by legal counsel before sending. Do not discuss the dispute with any party outside the company."
   - The system does not prevent communication but ensures every notification, portal message, and email includes a logged acknowledgment that the user saw the restriction.

3. **Legal matter record.** The builder creates a `legal_matter` record on the job:
   - Opposing party name and contact.
   - Attorney for opposing party.
   - Builder's attorney name and contact.
   - Case number and court/venue.
   - Nature of the claim (easement, noise, property line, environmental, other).
   - Date filed.
   - Current status: `filed`, `discovery`, `mediation`, `trial`, `settled`, `dismissed`.

4. **Project pause workflow.** If the court orders a stop-work:
   - The system follows the extended pause workflow (GAP-602) for vendor notifications, schedule freeze, and permit tracking.
   - Additionally, the system creates a "Stop Work Documentation" daily log entry capturing: site conditions at stop-work, photos, any work that must be left in a safe/stable condition.

5. **Legal document management.** The system creates a `/Legal/Dispute - [Opposing Party]/` folder for:
   - Complaint/petition filed.
   - Builder's response.
   - Court orders.
   - Correspondence between attorneys.
   - Survey/boundary documentation.
   - Expert reports.
   - Settlement agreements.
   These files are restricted to users with `admin` or `owner` role on the company.

6. **Cost tracking.** Legal costs are tracked as a specific cost code (builder configures, e.g., "01-80-00 Legal Fees"). The system creates a budget line for this cost code if one does not exist. All attorney invoices are allocated to this code so the builder can see the total legal cost impact on the job.

**Data captured:**
- `job_holds` record with `hold_reason = 'legal_dispute'`.
- `legal_matters` record: opposing party, attorneys, case details, status history.
- Communication restriction flag and acknowledgment logs.
- Legal documents in access-restricted folder.
- Legal cost tracking via dedicated cost code and budget line.
- Daily log entry documenting site conditions at stop-work.

---

### A12. Client Self-Performing Work (GAP-610)

**Trigger:** The client (homeowner) wants to perform some of the construction work themselves — for example, painting, landscaping, tile installation, or other finish work. This creates scope boundary issues, insurance concerns, quality standards, and warranty exclusions.

**What the system does:**

1. **Owner-builder scope designation.** On the job budget, the builder marks specific budget lines as `scope_performer = 'owner'`. These lines are visually distinguished in the budget view with a different background color and an "Owner" badge. The builder enters:
   - Description of the owner-performed scope.
   - Whether the builder is providing materials (owner labor only) or the owner is providing both labor and materials.
   - Budget amount (if the owner is doing the work, this may be $0 for labor or reflect material costs only).

2. **Insurance requirements.** The system presents a checklist:
   - [ ] Owner has been notified in writing of insurance requirements.
   - [ ] Owner has provided proof of homeowner's insurance adequate for self-performed work.
   - [ ] Builder's insurance carrier has been notified of owner-performed scope.
   - [ ] Liability waiver signed by owner for self-performed work.
   All documents are uploaded and stored in `/Documents/Owner-Performed Work/`.

3. **Quality acceptance workflow.** When the owner completes their self-performed work, the builder creates an "Owner Work Inspection" record:
   - Date of inspection.
   - Scope item inspected.
   - Inspection result: `accepted`, `accepted_with_conditions`, `rejected`.
   - If `accepted_with_conditions`, the builder lists the conditions that must be met.
   - If `rejected`, the builder documents deficiencies and the owner must correct before the builder continues adjacent work.
   - Photos of the owner's work are attached.
   - The owner signs off (via portal or physical signature uploaded) acknowledging the inspection result.

4. **Warranty exclusions.** The system automatically generates warranty exclusion language for owner-performed scope. When the project reaches closeout and warranties are created:
   - Owner-performed scope items are excluded from the builder's warranty.
   - The warranty document includes a section: "Excluded Scope (Owner-Performed)" listing each item.
   - The system stores each warranty exclusion as a `warranty_exclusion` record linked to the job.

5. **Schedule coordination.** Owner-performed tasks are created in the schedule with `performer_type = 'owner'`. These tasks:
   - Appear in a different color on the Gantt chart.
   - Can have dependencies with builder-performed tasks (e.g., owner painting cannot start until builder completes drywall finishing).
   - The builder can set a deadline for the owner to complete their work; if the deadline passes, the system creates a notification.
   - If the owner's delay affects the critical path, the system calculates and displays the schedule impact.

6. **Financial tracking.** Owner-performed scope appears on draws with $0 or materials-only amounts. The G702/G703 report includes these lines with a note indicating owner-performed work. The owner's work does not count toward the builder's completed percentage for margin calculations.

**Data captured:**
- Budget lines with `scope_performer = 'owner'` flag.
- Insurance checklist completion and uploaded documents.
- `owner_work_inspections` records: inspection date, result, conditions, photos, owner sign-off.
- `warranty_exclusions` records per excluded scope item.
- Schedule tasks with `performer_type = 'owner'` and associated deadlines.
- Draw lines reflecting owner-performed scope appropriately.

---

### A13. Project Featured in Media (GAP-611)

**Trigger:** A project is selected to appear in a television show, magazine, website, or other media outlet. The builder needs to manage photo approvals, NDAs, and site visit logistics within the system.

**What the system does:**

1. **Media project flag.** The builder sets a `media_featured` flag on the job. This adds a "Media" tab to the job detail page. The tab contains:
   - Media outlet name and contact person.
   - Publication/air date (if known).
   - Type of coverage: `tv_show`, `magazine`, `website`, `social_media`, `book`, `other`.

2. **Photo approval workflow.** When the media flag is active:
   - All photos on the job gain an additional status field: `media_approved`, `media_restricted`, or `not_reviewed`.
   - The builder (or a designated user) reviews photos and marks which ones are approved for media use.
   - A filtered gallery view shows only media-approved photos, which can be exported as a ZIP or shared via a time-limited link.
   - Photos marked `media_restricted` are hidden from any shared galleries or portal views.

3. **NDA management.** The system tracks NDAs related to media coverage:
   - NDA with media outlet (uploaded document, expiration date).
   - NDAs with subcontractors who may appear in coverage (tracked per vendor on the job).
   - NDA with client (if the client's identity is to be protected).
   Each NDA record includes: `party_name`, `signed_date`, `expiration_date`, `document_url`, `nda_type` (`media_outlet`, `vendor`, `client`).

4. **Site visit scheduling.** The system supports scheduling media site visits as a special task type:
   - Task type: `media_visit`.
   - Fields: media outlet, number of visitors, equipment requirements, areas of access, areas restricted.
   - The task is visible to the superintendent and PM.
   - A checklist is generated for the visit: clean site, safety equipment for visitors, restricted areas marked, crew notified.

5. **Client approval.** If client approval is required for media participation, the system sends an approval request through the portal. The client reviews the media outlet, coverage type, and any sample images, then approves or declines. The approval is logged.

**Data captured:**
- `job_media_features` record: outlet, contact, coverage type, dates.
- Photo `media_approval_status` per photo.
- NDA records with parties, dates, and uploaded documents.
- Media visit task records with checklists.
- Client approval record (if applicable).

---

### A14. Builder Expands into Light Commercial (GAP-612)

**Trigger:** A builder who has been doing residential work begins taking on light commercial projects (small retail, office tenant improvements, small multi-family). These projects have different contract requirements, may require prevailing wage compliance, bonding, and different reporting.

**What the system does:**

1. **Project type classification.** The job record includes a `project_type` field: `residential_new`, `residential_remodel`, `residential_addition`, `commercial_tenant_improvement`, `commercial_new`, `commercial_remodel`, `multi_family`, `mixed_use`. The project type drives which features and fields are visible on the job.

2. **Contract type support.** Commercial projects commonly use contract types beyond the residential standard. The system supports:
   - `fixed_price` (lump sum).
   - `cost_plus` (cost plus fee — common in residential).
   - `gmp` (guaranteed maximum price — common in commercial).
   - `time_and_materials`.
   - `unit_price`.
   The contract type affects how draws are calculated, how change orders modify the contract sum, and how the G702 is formatted.

3. **Prevailing wage tracking.** When `project_type` is commercial and the builder enables prevailing wage on the job:
   - The daily log labor entries include additional fields: `wage_classification`, `hourly_rate`, `fringe_rate`.
   - The system validates entered rates against a configurable prevailing wage table (uploaded by the builder as a reference document).
   - Certified payroll reports can be generated per pay period, listing all workers, hours, classifications, and rates.
   - The system flags any labor entries where the entered rate is below the prevailing wage minimum for the classification.

4. **Bonding and insurance tracking.** The job record includes fields for:
   - Performance bond: `required` (yes/no), `bond_amount`, `surety_company`, `bond_number`, `expiration_date`.
   - Payment bond: same fields.
   - Builder's risk insurance specific to the project.
   - Each vendor on the job can have bonding requirements tracked.
   - The system sends notifications 30 days before any bond or insurance expiration.

5. **Reporting differences.** Commercial projects may require:
   - AIA G702/G703 draws with more detailed cost breakdowns (by cost code within each division).
   - Schedule of values (SOV) as a standalone document.
   - Monthly progress reports with schedule narrative.
   - Subcontractor payment certification.
   The system generates these reports when the project type is commercial.

6. **Cost code expansion.** Commercial projects often use more detailed CSI cost code divisions. The system allows the builder to import extended cost code libraries (full CSI MasterFormat) in addition to the condensed residential set. Cost codes are per-company, so the builder can maintain both residential and commercial code sets and select the appropriate set per job.

**Data captured:**
- `jobs.project_type` set to commercial variant.
- `jobs.contract_type` with commercial options.
- `jobs.prevailing_wage_required` flag.
- Prevailing wage labor entries with classification and rate fields.
- Bond and insurance records on the job.
- Extended cost code library.
- Commercial-format reports and SOV documents.

---

### A15. Natural Disaster Damages Project (GAP-613)

**Trigger:** A natural disaster (hurricane, tornado, earthquake, wildfire, flood) damages a construction project that is in progress. The builder must document the damage, file insurance claims, determine reconstruction scope, rebuild the schedule, and communicate with the client.

**What the system does:**

1. **Disaster event record.** The builder creates a `disaster_event` record on the job:
   - Event type: `hurricane`, `tornado`, `earthquake`, `wildfire`, `flood`, `ice_storm`, `other`.
   - Event date.
   - Description of damage.
   - Estimated damage cost (preliminary).
   - Whether a state of emergency has been declared.
   - FEMA declaration number (if applicable).

2. **Damage documentation.** The system creates a "Disaster Damage Assessment" daily log entry type with expanded fields:
   - Room-by-room or system-by-system damage description.
   - Bulk photo upload with location tagging.
   - Video upload capability.
   - Weather data auto-captured for the event date (from the weather integration).
   - The system generates a timestamped PDF of the damage assessment for insurance purposes.

3. **Insurance claim workflow.** The system creates an `insurance_claim` record:
   - Insurance carrier name and policy number (pulled from job or company settings).
   - Claim number (assigned by carrier).
   - Adjuster name and contact information.
   - Claim status: `filed`, `adjuster_assigned`, `inspected`, `estimate_received`, `negotiating`, `settled`, `paid`, `disputed`.
   - Carrier's damage estimate (uploaded document and amount).
   - Builder's damage estimate (linked to a system-generated scope of repair).
   - Difference between carrier and builder estimates.
   - Settlement amount and date.

4. **Reconstruction scope.** The builder creates a repair estimate using the standard estimating workflow but tagged as `estimate_type = 'disaster_repair'`. This estimate:
   - References the original budget lines for affected areas.
   - Separates repair work (restoring to pre-disaster condition) from new work (continuing the original scope).
   - Can be exported and submitted to the insurance carrier.
   - When the insurance claim settles, the estimate is converted to budget lines for the repair scope.

5. **Schedule rebuild.** The system handles the schedule impact:
   - All in-progress and future tasks are frozen at the disaster date.
   - New tasks are created for the repair/reconstruction scope.
   - Repair tasks are scheduled first, followed by the remaining original scope tasks.
   - The system calculates the total schedule delay and updates the target completion date.
   - A "Disaster Recovery Schedule" view shows the three phases: pre-disaster work (completed), repair work, and remaining original scope.

6. **Financial tracking.** The system creates separate budget categories for tracking:
   - Insurance receivable (expected insurance proceeds).
   - Insurance payment received (actual proceeds).
   - Repair costs (actual costs incurred for disaster repair).
   - The difference between insurance proceeds and repair costs is tracked as an adjustment.
   - Original project budget and the disaster repair budget are shown separately but on the same job, so the total project cost is always visible.

7. **Client communication.** The system generates a client notification with:
   - Description of the event and damage.
   - Current project status.
   - Insurance claim status.
   - Estimated timeline for repair and project completion.
   - This notification is available in the portal with photo attachments.

**Data captured:**
- `disaster_events` record: event type, date, description, estimated damage.
- Damage assessment daily log with photos and videos.
- `insurance_claims` record: carrier, claim number, adjuster, status history, settlement amount.
- Repair estimate with `estimate_type = 'disaster_repair'`.
- Repair budget lines separate from original budget.
- Rebuilt schedule with disaster recovery phases.
- Insurance receivable/payment financial records.
- Client notification and communication log.

---

### A16. Pandemic Work Stoppage (GAP-614)

**Trigger:** A pandemic, epidemic, or public health emergency causes a government-ordered work stoppage or imposes restrictions on construction activity. This is a specific case of force majeure that affects multiple jobs simultaneously.

**What the system does:**

1. **Company-wide force majeure declaration.** Unlike single-job holds, a pandemic affects all jobs. The system supports a company-level `force_majeure_event` record:
   - Event type: `pandemic`, `government_order`, `civil_unrest`, `other`.
   - Event name (e.g., "COVID-19 Work Stoppage").
   - Start date.
   - End date (set when restrictions are lifted).
   - Governing jurisdiction and order number.
   - Upload of the government order document.
   - Affected jobs: `all`, or a selected subset.

2. **Bulk job hold.** When the force majeure event is created, the system places all affected jobs on hold simultaneously:
   - Each job gets a `job_hold` record with `hold_reason = 'force_majeure'` and `force_majeure_event_id`.
   - The hold workflow (GAP-602) applies to each job: schedule freeze, vendor notification drafts.
   - But because this is bulk, the system generates a single vendor notification per vendor (not per job), listing all of the vendor's affected jobs.

3. **Vendor payment pause.** The system supports a bulk payment pause:
   - All invoices in `approved` status across affected jobs are set to `payment_paused`.
   - The builder can selectively un-pause specific invoices (e.g., for essential suppliers or completed work).
   - When the force majeure ends, the builder can bulk un-pause all invoices.

4. **Schedule extension calculation.** When the force majeure event end date is set:
   - The system calculates the total hold duration in calendar days.
   - For each affected job, all frozen tasks are shifted forward by the hold duration.
   - Contract target completion dates are extended by the same duration.
   - The system generates a "Force Majeure Schedule Extension" report per job, documenting the original dates, hold duration, and new dates. This report serves as documentation for contract disputes about schedule extensions.

5. **Remote management features.** During a pandemic hold where site access is restricted but management continues:
   - The system's full functionality remains available (it is cloud-based).
   - The builder can continue to process invoices, manage selections with clients via the portal, update budgets, and prepare for restart.
   - Daily logs can be created with `log_type = 'remote_observation'` for drive-by inspections or camera-based monitoring.

6. **Restart protocol.** When the force majeure ends:
   - The builder sets the event end date.
   - The system presents a "Restart Readiness Checklist" per job:
     - [ ] Site inspected for condition after hold period.
     - [ ] All subcontractors confirmed available to restart.
     - [ ] Updated insurance certificates collected from all vendors.
     - [ ] Health and safety protocols updated (if pandemic-related).
     - [ ] Permits valid or extensions obtained.
     - [ ] Material availability confirmed.
   - The builder completes the checklist per job, then lifts the hold, which unfreezes the schedule.

**Data captured:**
- `force_majeure_events` record: company-wide, with event details and affected job list.
- `job_holds` per job linked to the force majeure event.
- Vendor notification records (one per vendor, listing all affected jobs).
- Invoice `payment_paused` status records.
- Schedule extension reports per job.
- Restart checklists per job.
- Government order document uploaded.

---

### A17. Builder Sells the Business (GAP-615)

**Trigger:** A builder decides to sell their construction company. The buyer needs a comprehensive export of all business data for due diligence, and potentially, the platform account itself needs to be transferred.

**What the system does:**

1. **Business data export.** Under Company Settings > Data Management, an admin can initiate a "Full Business Export." This produces a structured export containing:

   **Financial data:**
   - All jobs with complete budget, invoice, draw, PO, and change order histories.
   - Company P&L data for all available periods.
   - Cash flow records.
   - Profitability reports per job.
   - Aging reports (AR and AP).
   - QuickBooks sync history and entity mappings.

   **Operational data:**
   - All estimates, proposals, and contracts.
   - All schedules and task histories.
   - All daily logs with labor and weather data.
   - All punch lists and warranty records.
   - All inspection records.

   **Directory data:**
   - Complete vendor directory with contact info, trade classifications, insurance records, and performance scores.
   - Complete client directory with contact info and project history.
   - Employee/user list with roles and certifications (excluding passwords).

   **Documents:**
   - All uploaded files organized by job and folder structure.
   - All photos with captions and metadata.
   - All generated PDFs (contracts, draws, proposals).

   **System data:**
   - Company settings and configuration.
   - Cost code library.
   - Custom templates (estimate templates, proposal templates).
   - Activity logs (full audit trail).

2. **Export format.** The export is structured as:
   - A ZIP archive containing:
     - `/data/` — JSON files for each entity type, with relationships preserved via IDs.
     - `/documents/` — All files organized by job, then by folder.
     - `/reports/` — Pre-generated PDF reports (P&L, job summaries, etc.).
     - `manifest.json` — Index of all contents with record counts and date ranges.
     - `schema.json` — Description of all data fields and relationships.
   - The export can be generated for a specific date range or for all time.
   - Sensitive data (passwords, API keys, tokens) is excluded.

3. **Account transfer.** If the buyer will continue using RossOS:
   - The company `owner` role is transferred to the buyer's email via a two-step verification process (current owner initiates, new owner accepts via email).
   - All data remains in place on the platform.
   - The previous owner's user account is downgraded to `read_only` or deactivated.
   - Billing/subscription is transferred to the new owner.

4. **Data retention after sale.** If the seller wants to retain read-only access after the sale (common for warranty period obligations):
   - The seller's user account remains active with `read_only` access for a configurable period (default: 24 months).
   - After the retention period, the account is deactivated.

**Data captured:**
- Export request record: `requested_by`, `requested_at`, `export_type = 'full_business'`, `date_range`, `status`, `download_url`.
- Account transfer record: `from_user_id`, `to_user_id`, `transfer_date`, `verified_at`.
- Activity log: "Full business export generated" and "Company ownership transferred."

---

### A18. Multiple Builders on Same Subdivision (GAP-616)

**Trigger:** Multiple builders who are each separate companies on the RossOS platform are building homes in the same subdivision. They share common infrastructure costs (roads, utilities, common areas) and may need to coordinate on HOA formation.

**What the system does:**

1. **Subdivision entity.** The system introduces a `subdivision` entity that exists above the job level:
   - `subdivision_name`, `address`, `city`, `state`, `zip`.
   - `total_lots`, `developed_lots`.
   - `developer_company_id` (the land developer, if on the platform — may be one of the builders or a separate entity).
   - Each job (home) can be linked to a `subdivision_id`.

2. **Shared cost tracking.** Within a subdivision, certain costs are shared among builders (road construction, utility main lines, stormwater management, common area landscaping). The system handles this via:
   - A `subdivision_shared_budget` that is separate from any individual job budget.
   - Each builder linked to the subdivision has a `cost_share_percentage` or `cost_share_per_lot` allocation.
   - When the developer invoices builders for their share of common costs, each builder creates an invoice on their own job allocated to a shared-infrastructure cost code (e.g., "01-50-00 Subdivision Infrastructure").
   - The subdivision budget view (visible to the developer if on the platform) shows the total shared budget, each builder's allocation, and amounts billed/paid.

3. **Cross-builder visibility.** Builders in the same subdivision do NOT see each other's job data (multi-tenancy is enforced). However:
   - If a builder also serves as the developer, they see their own subdivision-level data.
   - The developer can share subdivision-level schedule milestones (road completion dates, utility dates) with all builders via a read-only "subdivision bulletin" mechanism.
   - This is implemented as a `subdivision_bulletins` table with `subdivision_id`, `title`, `content`, `posted_by`, `posted_at`. Builders linked to the subdivision see these bulletins on their dashboard.

4. **HOA formation tracking.** The system includes an "HOA Formation" checklist on the subdivision record:
   - [ ] HOA governing documents drafted.
   - [ ] HOA registered with state.
   - [ ] Common areas identified and surveyed.
   - [ ] Common area budgets established.
   - [ ] Transition plan from developer control to homeowner control documented.
   - [ ] Each lot's HOA dues assessment calculated and documented.
   Each checklist item has a status, responsible party, and document upload slot.

5. **Common area budget.** The developer creates a separate budget for common areas (clubhouse, pool, parks, retention ponds). This budget is tracked at the subdivision level, not on any individual job. The budget includes long-term maintenance cost estimates that will be transferred to the HOA.

**Data captured:**
- `subdivisions` record: name, location, lots, developer.
- `subdivision_builders` join table: `subdivision_id`, `company_id`, `lot_numbers`, `cost_share_allocation`.
- `subdivision_shared_budgets` with line items for shared infrastructure.
- `subdivision_bulletins` for cross-builder communication.
- HOA formation checklist records.
- Common area budget and cost tracking.

---

### A19. ADU Alongside Main Home (GAP-617)

**Trigger:** A client is building an Accessory Dwelling Unit (ADU) — a guest house, in-law suite, or detached garage apartment — alongside the construction of a main home (or as an addition to an existing home). The question is whether the ADU is a separate project or part of the same project.

**What the system does:**

1. **Decision framework.** The system supports both approaches, and the builder chooses based on their contracting structure:

   **Option A — Single Job, Multiple Scopes:** The ADU is part of the same job. The budget includes ADU-specific lines tagged with `scope_area = 'ADU'`. This is appropriate when:
   - The ADU is covered under the same contract as the main home.
   - Shared vendors and cost codes apply.
   - A single draw covers both structures.
   - One permit covers the entire project.

   **Option B — Linked Jobs:** The ADU is a separate job linked to the main home job via a `job_links` table: `parent_job_id`, `child_job_id`, `link_type = 'adu'`. This is appropriate when:
   - The ADU has its own contract (perhaps with a different price or contract type).
   - Separate permits are required.
   - Separate draws are issued.
   - The ADU may be completed on a different timeline.

2. **Scope area tagging (Option A).** When a single job contains multiple structures, the system supports `scope_area` tags on:
   - Budget lines: `scope_area = 'Main Home'` or `scope_area = 'ADU'`.
   - Tasks: each task is tagged with its scope area.
   - Photos: can be tagged by scope area for organization.
   - The budget view can be filtered by scope area to see costs for just the main home or just the ADU.
   - Draws can include or exclude scope areas (e.g., if the lender only finances the main home, the draw excludes ADU lines).

3. **Linked job views (Option B).** When the ADU is a separate job:
   - The main home job detail page shows a "Related Projects" section listing the ADU job with a direct link.
   - The ADU job page shows a "Related Projects" section listing the main home.
   - Reports can be run across linked jobs to see combined totals.
   - The client portal shows both projects on a single dashboard with a toggle between them.
   - Shared vendors appear on both jobs independently (they are separate POs, invoices, etc.).

4. **Permit and inspection separation.** Regardless of the approach chosen, the system tracks permits per structure. If the ADU requires its own permit:
   - A separate permit record is created (either on the same job with `scope_area = 'ADU'` or on the linked job).
   - Inspection schedules are tracked independently per permit.

**Data captured:**
- `jobs.scope_areas` JSON array listing defined scope areas (e.g., `['Main Home', 'ADU']`).
- Budget lines, tasks, and photos tagged with `scope_area`.
- `job_links` table for linked jobs: `parent_job_id`, `child_job_id`, `link_type`.
- Separate permit records per structure.

---

### A20. Joint Venture Between Builders (GAP-618)

**Trigger:** Two builders (both potentially on the RossOS platform) form a joint venture (JV) to build a project together. They need to share project data, split costs and revenue, and maintain separate company records.

**What the system does:**

1. **Joint venture entity.** The system supports creating a `joint_venture` record:
   - JV name (e.g., "Smith-Jones Custom Homes JV").
   - `partner_a_company_id` and `partner_b_company_id` (references to companies on the platform, if applicable).
   - Revenue split: percentage or formula.
   - Cost responsibility: which partner pays which cost codes, or shared equally, or by agreed allocation.
   - JV agreement document (uploaded).

2. **JV project ownership.** The JV project (job) is owned by one company (the "managing partner"). The other company is a participant. The system handles this as:
   - The job is created under the managing partner's company account.
   - A `job_jv_access` record grants the partner company read access (and optionally write access for specific modules) to the job.
   - When a user from the partner company logs in, they see the JV job in their job list with a "JV" badge, even though it belongs to another company.
   - This is a controlled exception to the standard multi-tenancy isolation, scoped to specific jobs.

3. **Cost splitting.** The system tracks cost allocation between JV partners:
   - Each invoice and PO is tagged with `cost_responsibility`: `partner_a`, `partner_b`, or `shared`.
   - Shared costs are split according to the JV agreement percentage.
   - A "JV Reconciliation Report" shows each partner's share of costs paid, revenue received, and the net settlement between them.
   - This report is generated monthly or on demand.

4. **Revenue splitting.** When draws are paid by the client:
   - The system allocates the revenue between partners according to the revenue split.
   - Each partner's share is tracked as a receivable.
   - The JV reconciliation report includes revenue distributions.

5. **Data sharing controls.** The managing partner configures what the participating partner can see:
   - Budget and financial data: full, summary only, or none.
   - Schedule and daily logs: full or none.
   - Documents: full, selected folders only, or none.
   - Vendor details: full or none (may contain competitive information).
   These permissions are stored on the `job_jv_access` record.

6. **Separate financial reporting.** Each partner can generate financial reports for the JV job that reflect only their share of costs and revenue. The JV job's P&L appears on each partner's company-wide P&L proportional to their participation.

**Data captured:**
- `joint_ventures` record: JV name, partner companies, revenue split, cost allocation rules, JV agreement document.
- `job_jv_access` record: `job_id`, `partner_company_id`, `access_permissions_json`.
- Invoice/PO `cost_responsibility` tag.
- JV reconciliation records: monthly snapshots of cost/revenue allocation.
- Activity log: all access by JV partner users is logged with `access_context = 'jv_access'`.

---

### A21. Building Code Edition Change Mid-Year (GAP-619)

**Trigger:** A local jurisdiction adopts a new edition of the building code (e.g., transition from 2021 IRC to 2024 IRC) that takes effect on a specific date. Active projects may or may not be grandfathered under the old code, depending on their permit status.

**What the system does:**

1. **Code edition tracking.** The system maintains a `building_codes` reference table at the company level:
   - `code_name` (e.g., "International Residential Code").
   - `edition` (e.g., "2021", "2024").
   - `jurisdiction` (e.g., "Sarasota County, FL").
   - `effective_date`.
   - `adoption_date` (when the jurisdiction adopted it).
   - `amendments_url` (link to local amendments).

2. **Job code edition assignment.** Each job has a `code_edition_id` linking to the applicable building code edition. This is typically determined by the permit date — projects permitted under the old edition are usually grandfathered.

3. **Automatic flagging of affected projects.** When a builder adds a new code edition with an effective date, the system scans all active jobs in the relevant jurisdiction (matching `jobs.state` and optionally `jobs.city`) and flags:
   - Jobs with permits issued before the effective date: **GRANDFATHERED** — no action needed, marked with `code_status = 'grandfathered'`.
   - Jobs without permits that are in pre-construction: **NEW CODE APPLIES** — flagged with `code_status = 'new_code_required'`.
   - Jobs with permits but requesting significant scope changes (change orders that affect structural, mechanical, or electrical systems): **REVIEW REQUIRED** — flagged with `code_status = 'review_required'` because the scope change may trigger a requirement to comply with the new code.

4. **Notification and checklist.** For each flagged job:
   - The PM receives a notification: "Building code edition has changed in [jurisdiction]. Review required for [job name]."
   - The system presents a checklist:
     - [ ] Confirmed permit status and grandfathering applicability.
     - [ ] Reviewed new code requirements relevant to remaining scope.
     - [ ] Consulted with building department on transition rules.
     - [ ] Updated plans if required.
     - [ ] Updated cost estimates for any code-driven changes.

5. **Cost impact tracking.** If the new code requires changes, the builder creates a change order with `source = 'code_change'`. The system tracks aggregate cost impact across all affected jobs so the builder can see the total financial effect of the code transition.

6. **Reporting.** A "Code Compliance Status" report shows:
   - All active jobs grouped by applicable code edition.
   - Flagged jobs requiring review.
   - Change orders generated from code changes with total cost impact.

**Data captured:**
- `building_codes` reference records: code name, edition, jurisdiction, effective date.
- `jobs.code_edition_id` assignment.
- `jobs.code_status`: `grandfathered`, `new_code_required`, `review_required`, `compliant`.
- Code review checklists per job.
- Change orders with `source = 'code_change'`.
- Notifications to PMs for affected projects.

---

### A22. Construction Manager / Owner's Rep Access (GAP-620)

**Trigger:** The builder hires or the client employs a construction manager (CM) or owner's representative (owner's rep) who needs oversight access to the project but is not an employee of the building company and is not the client.

**What the system does:**

1. **External collaborator role.** The system introduces a `collaborator` user type that is distinct from both company employees and portal users:
   - The collaborator is invited by the builder via email.
   - The invitation specifies which job(s) the collaborator can access.
   - The collaborator creates a RossOS account (if they do not already have one) and can access only the jobs they have been invited to.

2. **Granular access permissions.** The builder configures what the collaborator can see and do per job:
   - **Budget:** Full detail, summary only, or no access.
   - **Schedule:** View only, or view + comment.
   - **Daily logs:** View only, or view + add entries.
   - **Documents:** View all, view selected folders, or no access.
   - **Photos:** View all, or view selected albums.
   - **Invoices:** View only, or no access.
   - **Draws:** View only, view + approve (for owner's rep who approves on behalf of client), or no access.
   - **Change orders:** View only, view + approve, or no access.
   - **Reports:** Downloadable, or no access.

3. **Approval authority.** If the collaborator is an owner's rep with approval authority:
   - The builder configures `approval_authority = true` on the collaborator's access record for specific actions (draw approval, change order approval, selection approval).
   - When the owner's rep approves a draw or CO through the system, it is recorded as a valid client-side approval.
   - The approval record shows `approved_by_type = 'owners_rep'` and the collaborator's name.

4. **Access expiration.** The collaborator's access can have an expiration date (e.g., end of project). Access automatically deactivates after the expiration date. The builder can also revoke access at any time.

5. **Activity visibility.** The builder can see all actions taken by the collaborator:
   - What pages they viewed and when.
   - What documents they downloaded.
   - What approvals they issued.
   - What comments they left.
   This activity is logged in `activity_logs` with `user_type = 'collaborator'`.

6. **Multiple collaborators.** A job can have multiple collaborators with different permission sets (e.g., the owner's rep, a lender's inspector, a consultant). Each has independent access configuration.

**Data captured:**
- `collaborators` record: `user_id` (from collaborator's account), `email`, `name`, `company_name`, `role_title` (e.g., "Owner's Representative", "Construction Manager", "Lender Inspector").
- `job_collaborator_access` record: `job_id`, `collaborator_id`, `permissions_json`, `approval_authority`, `access_start_date`, `access_expiration_date`, `invited_by`.
- Activity log entries for all collaborator actions.
- Approval records with `approved_by_type = 'collaborator'`.

---

## B. Legal Edge Cases

---

### B1. Mechanic's Lien Documentation by State (GAP-797)

**Trigger:** A builder or subcontractor needs to file a mechanic's lien (also called a construction lien or materialman's lien) to secure payment for work performed. Lien laws vary significantly by state — deadlines, notice requirements, and filing procedures are different everywhere.

**What the system does:**

1. **State lien law reference database.** The system maintains a `lien_law_rules` reference table seeded with rules for all 50 US states. Each record contains:
   - `state_code` (e.g., "FL", "CA", "TX").
   - `preliminary_notice_required` (boolean).
   - `preliminary_notice_deadline_days` (days from first furnishing).
   - `notice_of_commencement_required` (boolean).
   - `lien_filing_deadline_days` (days from last furnishing or completion).
   - `lien_enforcement_deadline_days` (days from lien recording to file suit).
   - `notice_to_owner_required` (boolean).
   - `sworn_statement_required` (boolean).
   - `bond_claim_alternative` (boolean, for bonded projects).
   - `retainage_rules` (text summary).
   - `last_updated` (date, to track when rules were last verified).
   - This database is NOT legal advice — the system includes a disclaimer: "This information is for reference only. Consult a construction attorney licensed in your state for legal advice."

2. **Project lien timeline.** For each job, based on the job's state, the system automatically calculates key lien-related deadlines:
   - **Preliminary notice deadline:** [X] days from job start date (if required by state).
   - **Notice of commencement recording date:** tracked if the state requires it.
   - **Last date of work:** pulled from the most recent daily log entry or manually set.
   - **Lien filing deadline:** calculated from the last date of work per state rules.
   - These deadlines appear in a "Lien Rights" section on the job detail page and generate notifications 30, 14, and 7 days before each deadline.

3. **Preliminary notice tracking.** For states that require preliminary notices (e.g., California 20-day preliminary notice):
   - The system prompts the builder to send preliminary notices to all required parties (owner, general contractor, lender) within the deadline.
   - Each notice is tracked: `recipient`, `sent_date`, `delivery_method` (certified mail, hand delivery, email), `delivery_confirmation` (tracking number or signed receipt uploaded).
   - The system flags if a notice was sent late (after the deadline) — the builder's lien rights may be limited.

4. **Lien waiver management.** The system generates and tracks lien waivers as part of the draw process:
   - **Conditional waiver upon progress payment:** generated when a draw is submitted.
   - **Unconditional waiver upon progress payment:** generated when a draw is paid.
   - **Conditional waiver upon final payment:** generated for the final draw.
   - **Unconditional waiver upon final payment:** generated when the final draw is paid.
   - Each waiver uses state-specific statutory forms where applicable (e.g., California Civil Code 8132-8138).
   - Waivers are tracked per vendor per draw: `vendor_id`, `draw_id`, `waiver_type`, `amount`, `signed_date`, `document_url`.

5. **Lien filing documentation package.** If the builder needs to file a lien, the system generates a documentation package:
   - Property legal description (from job record).
   - Owner name and address.
   - Description of work performed.
   - Total contract amount and amount unpaid.
   - Dates of first and last work.
   - All preliminary notices sent (with proof of delivery).
   - All draws submitted and their payment status.
   - All lien waivers received from subcontractors.
   - This package is exported as a PDF for the builder's attorney to prepare the actual lien filing.

**Data captured:**
- `lien_law_rules` reference table (50 states).
- Per-job lien timeline with calculated deadlines.
- `preliminary_notices` records: recipient, sent date, delivery method, confirmation.
- `lien_waivers` records: vendor, draw, waiver type, amount, signed date, document.
- Lien filing documentation package (generated PDF).
- Notifications for upcoming deadlines.

---

### B2. Discovery and Litigation Hold (GAP-798)

**Trigger:** The builder's attorney issues a litigation hold (also called a legal hold or preservation order) requiring that all documents related to a specific project, vendor, or time period be preserved and not deleted, modified, or destroyed. This commonly occurs when the builder is a party to a lawsuit or anticipates litigation.

**What the system does:**

1. **Litigation hold record.** An admin creates a `litigation_hold` record in the system:
   - Hold name (e.g., "Smith Residence Defect Claim").
   - Attorney issuing the hold (name, firm, contact).
   - Scope of the hold: which jobs, which date range, which entity types (invoices, daily logs, photos, emails, etc.).
   - Hold start date.
   - Hold end date (set when the hold is lifted, typically after litigation concludes).
   - Legal matter reference (linked to a `legal_matter` record if one exists).

2. **Data preservation enforcement.** When a litigation hold is active:
   - **Soft delete is blocked:** Any entity within the hold scope cannot be archived (soft deleted). If a user attempts to archive a record within scope, the system displays: "This record is subject to a litigation hold and cannot be archived. Contact [attorney name] with questions."
   - **Edit tracking intensified:** All edits to records within scope are preserved with full before/after snapshots in `activity_logs`. The standard activity log captures changes, but under litigation hold, the system also captures the complete record state as a JSON snapshot before and after each edit.
   - **File deletion blocked:** Files within scope cannot be deleted from storage.

3. **Custodian notification.** The system identifies all users who have created or modified records within the hold scope (the "custodians") and generates a notification to each:
   - "A litigation hold has been placed on [job name]. You must preserve all documents and records related to this project. Do not delete, modify, or destroy any relevant records. Contact [attorney name] with questions."
   - Each custodian must acknowledge the hold notification. The acknowledgment is recorded: `user_id`, `acknowledged_at`, `hold_id`.

4. **Data export for discovery.** The system supports a "Litigation Export" that produces:
   - All records within the hold scope, exported as structured JSON with metadata.
   - All files within scope, exported with original filenames and metadata (upload date, uploader, version history).
   - All activity log entries for records within scope, showing the complete change history.
   - All communications (portal messages, email logs) within scope.
   - The export includes a chain of custody document: export date, exported by, scope parameters, record count.
   - The export is formatted for attorney review and can be produced in common eDiscovery formats.

5. **Hold monitoring dashboard.** Under Company Settings > Legal, a "Litigation Holds" page shows:
   - All active holds with their scope and custodians.
   - Any attempted deletions or modifications that were blocked.
   - Custodian acknowledgment status.
   - Export history.

6. **Hold release.** When the attorney authorizes lifting the hold:
   - The admin sets the hold end date.
   - All blocked actions are re-enabled.
   - The system retains the hold record and all associated audit data permanently (the hold record itself is never deleted).

**Data captured:**
- `litigation_holds` record: name, attorney, scope, start/end dates, legal matter link.
- `litigation_hold_custodians` records: user, acknowledgment status.
- Enhanced `activity_logs` with full record snapshots for in-scope records.
- Blocked action log: attempted deletions/archives that were prevented.
- Discovery exports with chain of custody documentation.

---

### B3. OSHA Citation Documentation and Response (GAP-799)

**Trigger:** The builder receives an OSHA citation for a safety violation on a job site. The builder must document the citation, track the response, implement corrective actions, and potentially contest the citation.

**What the system does:**

1. **OSHA citation record.** The builder creates an `osha_citation` record on the job:
   - Citation number.
   - Inspection date.
   - Inspector name and OSHA area office.
   - Violation type: `other_than_serious`, `serious`, `willful`, `repeat`, `failure_to_abate`.
   - Violation description.
   - Cited standard (e.g., "29 CFR 1926.501(b)(1)").
   - Proposed penalty amount.
   - Abatement deadline.
   - Status: `received`, `response_in_progress`, `contested`, `settled`, `abated`, `paid`.

2. **Response workflow.** The system tracks the builder's response with deadlines:
   - **15 working days** from receipt to file a Notice of Contest (if the builder wants to contest). The system calculates this deadline and creates a notification at 10 days, 5 days, and 2 days remaining.
   - **Informal conference** option: the builder can request an informal conference with the OSHA area director. Tracked with date, attendees, and outcome.
   - **Formal contest:** if filed, the system tracks the OSHRC (Occupational Safety and Health Review Commission) case number, hearing date, and resolution.

3. **Corrective action tracking.** For each citation, the builder documents corrective actions:
   - Description of the corrective action taken.
   - Date implemented.
   - Responsible person.
   - Photos documenting the correction (before and after).
   - Updated safety procedures (uploaded documents).
   - Training conducted (attendees, date, topic).
   - The system generates an "Abatement Certification" document that the builder submits to OSHA, listing all corrective actions and their implementation dates.

4. **Cost tracking.** Citation-related costs are tracked via a dedicated cost code (e.g., "01-90-00 Safety/OSHA"):
   - Penalty amount paid.
   - Legal fees for contesting.
   - Cost of corrective measures (equipment, training, engineering controls).
   - The total OSHA cost per job is visible on the job financial summary.

5. **Company-wide safety dashboard.** Under Company Settings > Safety, a dashboard shows:
   - All OSHA citations across all jobs, with status and deadlines.
   - Citation history and trends.
   - Total penalties assessed and paid.
   - Abatement completion rates.
   - This helps the builder identify systemic safety issues.

6. **Insurance notification.** The system prompts the builder to notify their insurance carrier when a citation is received (some policies require prompt notification). The notification is tracked: date sent, carrier contact, acknowledgment received.

**Data captured:**
- `osha_citations` record: all citation details, status history, deadlines.
- `osha_corrective_actions` records: action description, implementation date, photos, training records.
- Abatement certification document.
- Legal/penalty costs via dedicated cost code.
- Insurance notification record.
- Activity log entries for all status changes.

---

### B4. Construction Defect Claim Workflows (GAP-800)

**Trigger:** A client (or subsequent property owner) files a construction defect claim against the builder. Defect claims are governed by state-specific statutes (notice and repair acts, statutes of limitation, statutes of repose) and require careful documentation.

**What the system does:**

1. **State defect law reference.** The system maintains a `defect_law_rules` reference table:
   - `state_code`.
   - `notice_and_repair_act` (boolean — does the state have one?).
   - `notice_period_days` (days the owner must give the builder to inspect and offer repair).
   - `statute_of_limitations_years` (years from completion to file a defect claim).
   - `statute_of_repose_years` (absolute outer limit, regardless of discovery).
   - `right_to_repair_process` (text summary of the state's required process).
   - Disclaimer: "Reference only. Consult a construction attorney."

2. **Defect claim record.** The builder creates a `defect_claim` record:
   - Claimant name and contact (may be original client or subsequent owner).
   - Attorney for claimant (if represented).
   - Builder's attorney.
   - Date of claim notice received.
   - Property address and job reference (linked to the original job, if it exists in the system).
   - Description of alleged defects (free text, with ability to categorize: structural, waterproofing, mechanical, electrical, finish, site/drainage).
   - Estimated exposure (dollar amount).
   - Status: `notice_received`, `inspection_scheduled`, `inspection_completed`, `repair_offered`, `repair_accepted`, `repair_completed`, `litigation`, `settled`, `dismissed`.

3. **Right-to-repair workflow.** In states with notice-and-repair statutes, the system guides the builder through the required process:
   - **Step 1 — Acknowledge notice:** The system calculates the response deadline and creates tasks.
   - **Step 2 — Schedule inspection:** The builder schedules a site inspection within the statutory period. Task created with deadline.
   - **Step 3 — Document inspection:** The builder creates an inspection report with photos, moisture readings, and observations. This is stored as a structured record, not just a file upload.
   - **Step 4 — Offer to repair:** The builder generates a written repair offer specifying scope, timeline, and cost responsibility. The offer is tracked with sent date and response.
   - **Step 5 — Perform repair (if accepted):** Repair work is tracked as tasks with photos, vendor assignments, and costs.
   - **Step 6 — Close claim:** If the repair is accepted and completed, the claim is closed with final documentation.

4. **Historical project documentation retrieval.** The system links the defect claim to the original job record (if it exists) and provides one-click access to:
   - All daily logs from the construction period, filtered by the affected trade or area.
   - All photos from the construction period, filtered by location.
   - All inspection records.
   - All vendor/subcontractor assignments for the affected scope.
   - All change orders that modified the affected scope.
   - All warranties for the affected systems.
   - This historical context is critical for defense preparation.

5. **Subcontractor tender.** If the alleged defect falls within a subcontractor's scope, the builder can "tender" the claim to the subcontractor (formally request that the sub's insurance defend the claim). The system tracks:
   - Which vendors were tendered.
   - Date of tender letter (uploaded).
   - Vendor's insurance carrier response.
   - Whether the vendor's carrier accepted or denied the tender.

6. **Cost tracking.** Defect claim costs are tracked separately:
   - Legal defense fees.
   - Expert witness fees.
   - Inspection and testing costs.
   - Repair costs (if the builder repairs).
   - Settlement payments.
   - Insurance deductible.
   - Insurance recovery.
   These are tracked on a cost code specific to the defect claim (e.g., "01-95-00 Defect Claims").

**Data captured:**
- `defect_claims` record: claimant, attorneys, alleged defects, status history, exposure estimate.
- Right-to-repair workflow steps with deadlines and completion status.
- Inspection reports with photos and measurements.
- Repair offer records.
- Vendor tender records with insurance carrier responses.
- All legal, expert, and repair costs.
- Links to original job documentation.

---

### B5. Warranty Claim Dispute Resolution (GAP-801)

**Trigger:** A client submits a warranty claim that the builder disputes — either because the item is not covered, the warranty period has expired, or the client's actions caused the damage (e.g., improper maintenance, unauthorized modifications).

**What the system does:**

1. **Warranty claim intake.** The client submits a warranty claim through the portal (or the builder creates one from a phone/email request):
   - Description of the issue.
   - Location in the home.
   - Date issue was first noticed.
   - Photos of the issue.
   - The system automatically checks: is this item within the warranty period? Which warranty record covers it? Which vendor's warranty applies?

2. **Warranty coverage determination.** The system presents the builder with the warranty assessment:
   - **Covered:** The item is within warranty period and within scope. The builder proceeds with standard warranty repair.
   - **Potentially excluded:** The system flags potential exclusions:
     - Item is in the warranty exclusions list (see GAP-610 for owner-performed work).
     - Warranty period has expired (system shows expiration date and days past expiration).
     - Item may be a maintenance issue, not a defect (system shows the warranty terms distinguishing defect from maintenance).
   - The builder selects the determination: `covered`, `excluded_expired`, `excluded_owner_caused`, `excluded_maintenance`, `excluded_not_defect`, `under_review`.

3. **Dispute documentation.** If the claim is disputed, the builder documents the reason:
   - Written explanation of why the claim is denied or excluded.
   - Reference to specific warranty language (uploaded warranty document with relevant section highlighted).
   - Photos or inspection findings supporting the denial.
   - The system generates a "Warranty Claim Response" letter that the builder can send to the client.

4. **Escalation path.** If the client disagrees with the builder's determination:
   - The system tracks the dispute status: `initial_denial`, `client_appealed`, `inspection_scheduled`, `third_party_review`, `resolved_covered`, `resolved_denied`, `resolved_compromised`.
   - The builder can schedule a joint inspection and record findings.
   - If a third-party inspector or mediator is involved, their report is uploaded and linked.
   - If a compromise is reached (e.g., builder covers labor, client covers materials), the terms are documented.

5. **Resolution and cost tracking.** The final resolution is recorded:
   - Work performed (if any), tracked as warranty tasks with costs.
   - Who bore the cost (builder, vendor, client, insurance, shared).
   - Client sign-off on resolution (collected via portal or uploaded signed document).
   - Total cost of the warranty claim.
   - The warranty record is updated with the claim history.

6. **Warranty claim analytics.** The system tracks warranty claims across all jobs:
   - Claims by type (plumbing, electrical, structural, finish, etc.).
   - Claims by vendor (which subs generate the most warranty callbacks).
   - Claims by cost (total warranty cost per job, per vendor, per category).
   - Dispute rate (percentage of claims disputed vs. accepted).
   - This data feeds into vendor performance scores (Module 22).

**Data captured:**
- `warranty_claims` record: client, issue description, date noticed, photos, warranty reference, coverage determination, dispute status, resolution.
- Warranty claim response letters (generated documents).
- Inspection and third-party review records.
- Resolution terms and client sign-off.
- Cost records for warranty work.
- Analytics aggregations per vendor, category, and job.

---

### B6. Expert Witness Documentation Support (GAP-802)

**Trigger:** The builder's attorney requests comprehensive project documentation to support expert witness testimony in a construction dispute, defect claim, or other litigation.

**What the system does:**

1. **Expert documentation package.** The system generates a structured documentation package for expert review. The builder (or admin) selects a job and chooses "Generate Expert Witness Package." The package includes:

   **Project overview:**
   - Project summary: name, address, contract amount, start date, completion date, project type.
   - Contract documents and all amendments/change orders.
   - Complete budget with original, revised, and actual amounts.

   **Construction timeline:**
   - Chronological list of all daily logs with full text, weather data, and labor records.
   - All photos sorted by date with captions and location tags.
   - Complete schedule with planned vs. actual dates for every task.
   - All milestone dates (permit, inspection, completion).

   **Financial records:**
   - All invoices with vendor names, amounts, dates, and cost code allocations.
   - All purchase orders with line items.
   - All draws with G702/G703 forms.
   - All change orders with scope descriptions, costs, and approval history.
   - All lien waivers collected.

   **Quality and compliance:**
   - All inspection records and results.
   - All punch list items with photos and resolution status.
   - All RFI threads with questions and responses.
   - All warranties issued.

   **Personnel:**
   - All vendors/subcontractors assigned to the job with trade and scope.
   - All company employees assigned to the job with roles.
   - Insurance certificates for all vendors.

2. **Package format.** The export is delivered as:
   - A structured ZIP archive with folders for each category.
   - An index document (PDF) listing every item in the package with page numbers and descriptions.
   - A timeline document (PDF) showing all events in chronological order.
   - All documents are Bates-numbered (sequentially numbered for legal reference) using a configurable prefix (e.g., "ROSS-00001").

3. **Chain of custody.** The system records:
   - Who generated the package and when.
   - What records were included (by record count and date range).
   - A hash (SHA-256) of the package contents for integrity verification.
   - Who the package was sent to (attorney, expert name).

4. **Selective export.** The attorney may request only specific categories of documents. The builder can select which sections to include in the package and filter by date range, vendor, cost code, or other criteria.

5. **Supplemental responses.** If the expert requests additional documents after receiving the initial package, the builder can generate a supplemental export. The system tracks all supplemental exports linked to the original package for a complete chain.

**Data captured:**
- `expert_packages` record: job, requested by, generated by, generated at, scope, record count, hash, recipient.
- Bates number registry: which numbers were assigned to which documents.
- Chain of custody log.
- Supplemental export records linked to the original.

---

### B7. Non-Compete and Non-Solicitation Tracking (GAP-803)

**Trigger:** The builder has non-compete and/or non-solicitation agreements with employees, subcontractors, or business partners. The system needs to track these agreements, their terms, and their expiration dates to help the builder monitor compliance.

**What the system does:**

1. **Restrictive covenant records.** The builder creates `restrictive_covenant` records linked to the relevant entity:
   - **Entity type:** `employee` (user), `vendor`, or `partner`.
   - **Entity reference:** `user_id`, `vendor_id`, or free-text partner name.
   - **Covenant type:** `non_compete`, `non_solicitation`, `non_disclosure`, `non_circumvention`.
   - **Terms:**
     - Duration (months or years from termination of relationship).
     - Geographic scope (e.g., "within 50 miles of Sarasota, FL" or "state of Florida").
     - Restricted activities (free text describing what is restricted).
     - Effective date (typically the date of the agreement).
     - Trigger date (typically the date the relationship ends — this is set when the employee leaves or the vendor relationship ends).
     - Expiration date (calculated: trigger date + duration).
   - **Agreement document:** uploaded PDF of the signed agreement.

2. **Departure tracking.** When an employee is deactivated or a vendor relationship is terminated:
   - The system checks if there are any active restrictive covenants for that entity.
   - If yes, the system sets the trigger date to the departure/termination date and calculates the expiration date.
   - A notification is sent to the admin: "[Employee/Vendor name] has departed and has active restrictive covenants. Covenants expire on [date]."

3. **Monitoring dashboard.** Under Company Settings > Legal, a "Restrictive Covenants" page shows:
   - All active covenants with entity name, type, and expiration date.
   - Covenants expiring within the next 90 days.
   - Expired covenants (for historical record).
   - Filter by entity type, covenant type, and status.

4. **Compliance alerts.** The system does not actively monitor whether a former employee or vendor is violating the covenant (that would require external surveillance), but it does:
   - Send reminder notifications to the admin at configurable intervals (e.g., monthly) during the restriction period.
   - Allow the builder to log suspected violations with notes and evidence (screenshots, reports from others).
   - Track any enforcement actions taken (cease-and-desist letter sent, lawsuit filed) as linked records.

5. **Vendor bidding cross-reference.** When a new vendor is being considered for a job, the system can check if the vendor's contact persons match any active non-solicitation restrictions. This is a name/email comparison, not a guarantee, but it flags potential issues.

**Data captured:**
- `restrictive_covenants` record: entity type, entity reference, covenant type, duration, geographic scope, restricted activities, effective date, trigger date, expiration date, agreement document.
- Departure trigger events.
- Suspected violation log entries.
- Enforcement action records.
- Notifications and reminders.

---

### B8. Contract Interpretation Disputes (GAP-804)

**Trigger:** A dispute arises between the builder and client (or builder and subcontractor) over the interpretation of a contract clause. Both parties interpret the same language differently, and the disagreement affects scope, cost, or schedule.

**What the system does:**

1. **Dispute record.** The builder creates a `contract_dispute` record:
   - Disputing parties (builder vs. client, builder vs. vendor, or client vs. vendor with builder involved).
   - Contract reference (linked to the `contracts` record in the system).
   - Disputed clause (free text of the exact contract language in question).
   - Builder's interpretation (what the builder believes the clause means).
   - Opposing party's interpretation (what the other party claims the clause means).
   - Financial impact: how much money is at stake.
   - Schedule impact: how many days are at stake.
   - Status: `identified`, `discussion`, `mediation`, `arbitration`, `litigation`, `resolved`.

2. **Supporting documentation assembly.** The system helps the builder assemble evidence supporting their interpretation:
   - **Contract context:** The full contract document is available, with the ability to highlight and annotate the disputed clause and related clauses.
   - **Negotiation history:** If the contract was negotiated through the system (proposals, counterproposals), the history shows the evolution of the clause.
   - **Course of dealing:** The system retrieves examples of how the clause was applied in practice — e.g., if the dispute is about what "substantial completion" means, the system shows all daily logs, inspection records, and photos around the completion period.
   - **Industry standards:** The builder can upload reference documents (AIA commentary, trade association publications) that support their interpretation.

3. **Communication log.** All communications related to the dispute are logged:
   - Emails and letters (uploaded with dates and recipients).
   - Meeting notes (entered as structured records: date, attendees, topics discussed, outcomes).
   - Phone call summaries (date, duration, participants, summary).
   - All communications are tagged with `dispute_id` for retrieval.

4. **Resolution tracking.** The resolution process is tracked step by step:
   - **Direct negotiation:** Builder and opposing party discuss. Meeting records stored.
   - **Mediation:** If mediation is attempted, the system records: mediator name, mediation date, outcome (settled, impasse).
   - **Arbitration:** Case number, arbitrator, hearing date, award.
   - **Litigation:** Court, case number, attorney, key dates (see GAP-798 for litigation hold).
   - **Settlement:** Terms of settlement, settlement amount, document uploaded.

5. **Financial resolution.** When the dispute is resolved:
   - If the resolution changes the contract amount, a change order is created.
   - If the resolution changes the schedule, the schedule is updated with the adjustment.
   - The total cost of the dispute (legal fees, settlement, delay costs) is tracked.
   - The dispute record is marked as resolved with the resolution terms.

**Data captured:**
- `contract_disputes` record: parties, contract reference, disputed clause, interpretations, financial/schedule impact, status history.
- Supporting documentation links (contract, negotiation history, course of dealing evidence).
- Communication log entries tagged to the dispute.
- Resolution records (mediation, arbitration, litigation, settlement).
- Financial impact: change orders and legal costs.

---

### B9. Government Audit Preparation (GAP-805)

**Trigger:** The builder is notified of a government audit — this could be a tax audit (IRS or state), a prevailing wage audit (Department of Labor), a safety audit (OSHA), a licensing board audit, or a regulatory compliance audit. The builder needs to rapidly assemble comprehensive documentation.

**What the system does:**

1. **Audit record.** The builder creates a `government_audit` record:
   - Auditing agency (IRS, state revenue department, DOL, OSHA, licensing board, local building authority, other).
   - Audit type: `tax`, `prevailing_wage`, `safety`, `licensing`, `regulatory`, `financial`, `other`.
   - Notification date.
   - Audit period (date range being audited).
   - Auditor name and contact.
   - Builder's representative (internal contact and/or attorney/CPA).
   - Status: `notified`, `preparation`, `in_progress`, `response_submitted`, `additional_info_requested`, `closed_no_action`, `closed_with_findings`, `appealing`.

2. **Automated document assembly by audit type.**

   **Tax audit (IRS/State):**
   - All invoices within the audit period, sorted by vendor and date.
   - All draws (revenue) within the audit period, sorted by job and date.
   - All purchase orders and payments.
   - Vendor W-9s and 1099 information.
   - QuickBooks sync records (if integrated) for reconciliation.
   - Job cost reports per job for the audit period.
   - Cash flow reports.
   - P&L for the audit period.

   **Prevailing wage audit (DOL):**
   - All daily logs with labor entries within the audit period for affected jobs.
   - Certified payroll records (if generated per GAP-612).
   - Worker classifications and hourly rates.
   - Subcontractor certified payroll submissions.
   - Payroll records (uploaded or linked from payroll system).
   - Fringe benefit documentation.

   **Safety audit (OSHA):**
   - All daily logs with safety notes within the audit period.
   - Safety training records.
   - Incident reports.
   - OSHA citation history and abatement records (see GAP-799).
   - Safety equipment purchase records.
   - Toolbox talk records.

   **Licensing audit:**
   - All active jobs with contract amounts.
   - License numbers and renewal dates.
   - Insurance certificates (GL, WC, builder's risk).
   - Bond documentation.
   - Continuing education records.

3. **Export and preparation workspace.** The system creates a dedicated workspace for audit preparation:
   - A checklist of all documents requested by the auditor (entered by the builder).
   - Status tracking per checklist item: `not_started`, `in_progress`, `ready`, `submitted`.
   - A staging area where the builder assembles documents before submission.
   - The ability to generate a complete export package (similar to GAP-802 expert witness package) filtered to the audit scope.

4. **Response tracking.** During the audit:
   - The builder logs all interactions with the auditor: date, method (in-person, phone, email, letter), summary, documents requested/provided.
   - Additional information requests are tracked with deadlines.
   - All documents submitted to the auditor are logged with submission date and delivery method.

5. **Findings and resolution.** When the audit concludes:
   - Audit findings are recorded: finding description, amount in question, builder's response, resolution.
   - If penalties or additional taxes are assessed, the amounts are tracked.
   - If the builder appeals, the appeal process is tracked with deadlines and status.
   - Corrective actions (if required) are tracked as tasks with deadlines.

6. **Audit readiness score.** The system provides an ongoing "Audit Readiness" assessment on the company dashboard:
   - Are all vendor W-9s on file? (percentage complete).
   - Are all insurance certificates current? (expiration tracking).
   - Are daily logs being completed consistently? (completion rate).
   - Are lien waivers collected on all draws? (percentage complete).
   - This is not triggered by an audit but helps the builder stay prepared.

**Data captured:**
- `government_audits` record: agency, type, period, auditor, representative, status history.
- Audit preparation checklist items with status.
- Interaction log entries with the auditor.
- Documents submitted log with dates and methods.
- Findings and resolution records.
- Appeal tracking (if applicable).
- Corrective action tasks.
- Ongoing audit readiness metrics.

---

## Implementation Notes

### Database Tables Required

The following new tables or table extensions are referenced in this document and will need to be created as part of the relevant module implementations:

| Table | Referenced In | Module |
|-------|--------------|--------|
| `job_holds` | GAP-599, 602, 609, 614 | Core Data Model (03) |
| `job_financial_snapshots` | GAP-599 | Budget & Cost Tracking (09) |
| `job_client_history` | GAP-603, 605 | Core Data Model (03) |
| `job_links` | GAP-617 | Core Data Model (03) |
| `job_collaborator_access` | GAP-620 | Auth & Access Control (01) |
| `collaborators` | GAP-620 | Auth & Access Control (01) |
| `vendor_terminations` | GAP-601 | Vendor Management (10) |
| `vendor_recovery_claims` | GAP-607 | Vendor Management (10) |
| `regulatory_changes` | GAP-608 | Permitting & Inspections (32) |
| `legal_matters` | GAP-609, 798 | Safety & Compliance (33) |
| `litigation_holds` | GAP-798 | Safety & Compliance (33) |
| `litigation_hold_custodians` | GAP-798 | Safety & Compliance (33) |
| `disaster_events` | GAP-613 | Core Data Model (03) |
| `insurance_claims` | GAP-613 | Core Data Model (03) |
| `force_majeure_events` | GAP-614 | Core Data Model (03) |
| `subdivisions` | GAP-616 | Core Data Model (03) |
| `subdivision_builders` | GAP-616 | Core Data Model (03) |
| `subdivision_shared_budgets` | GAP-616 | Budget & Cost Tracking (09) |
| `joint_ventures` | GAP-618 | Core Data Model (03) |
| `job_jv_access` | GAP-618 | Auth & Access Control (01) |
| `building_codes` | GAP-619 | Permitting & Inspections (32) |
| `lien_law_rules` | GAP-797 | Lien Waivers (14) |
| `preliminary_notices` | GAP-797 | Lien Waivers (14) |
| `lien_waivers` | GAP-797 | Lien Waivers (14) |
| `osha_citations` | GAP-799 | Safety & Compliance (33) |
| `osha_corrective_actions` | GAP-799 | Safety & Compliance (33) |
| `defect_claims` | GAP-800 | Warranty & Home Care (31) |
| `warranty_claims` | GAP-801 | Warranty & Home Care (31) |
| `warranty_exclusions` | GAP-610 | Warranty & Home Care (31) |
| `expert_packages` | GAP-802 | Safety & Compliance (33) |
| `restrictive_covenants` | GAP-803 | HR & Workforce (34) |
| `contract_disputes` | GAP-804 | Contracts & E-Signature (38) |
| `government_audits` | GAP-805 | Safety & Compliance (33) |
| `job_media_features` | GAP-611 | Core Data Model (03) |
| `owner_work_inspections` | GAP-610 | Punch List & Quality (28) |

### Cross-References Between Edge Cases

Several edge cases share workflows or depend on each other:

- **GAP-599 (Client Bankruptcy)** uses the lien workflow from **GAP-797** and the financial snapshot mechanism shared with **GAP-602 (Project Pause)**.
- **GAP-602 (Project Pause)** and **GAP-614 (Pandemic)** share the schedule freeze/restart mechanism. GAP-614 adds bulk operations across multiple jobs.
- **GAP-609 (Lawsuit)** may trigger **GAP-798 (Litigation Hold)**.
- **GAP-601 (Sub Termination)** and **GAP-607 (Supplier Bankruptcy)** both involve vendor financial reconciliation and replacement workflows.
- **GAP-610 (Client Self-Perform)** creates warranty exclusions that are referenced in **GAP-801 (Warranty Disputes)**.
- **GAP-613 (Natural Disaster)** and **GAP-614 (Pandemic)** are both force majeure events but differ in scope (single job vs. company-wide).
- **GAP-800 (Defect Claims)** may require **GAP-802 (Expert Witness)** documentation and may trigger **GAP-798 (Litigation Hold)**.

### Priority

These edge cases do not need to be implemented in Phase 1 or 2. Most belong to Phases 4-6 when the corresponding modules (Safety & Compliance, Warranty & Home Care, HR & Workforce, Contracts & E-Signature) are built. However, the foundational data structures -- `job_holds`, `job_client_history`, `job_links`, and `collaborators` -- should be created in Phase 1 (Core Data Model) so that they are available when the edge case workflows are built later.

---

*Document created: 2026-02-13*
*Covers: GAP-599 through GAP-620 (Business), GAP-797 through GAP-805 (Legal)*
*Total edge cases specified: 31*
