# Module 38: Contracts & E-Signature

**Phase:** 5 - Full Platform
**Status:** TODO
**Optional Module:** No -- core module for all builders

---

## Overview

Contract template management, clause library, state-specific language selection,
e-signature integration, and contract lifecycle tracking for all construction document
types. Supports the full range of residential construction contract types: cost-plus,
guaranteed maximum price (GMP), fixed-price/lump-sum, time-and-materials, and hybrid
structures. Covers owner contracts, subcontractor agreements, pre-construction agreements,
change orders, and vendor purchase orders that require signature.

Every builder uses different contract forms, different clause libraries, and different
approval workflows. This module provides a configurable template engine where builders
maintain their own library of contract templates and standard clauses, with platform-
provided starting templates for common scenarios. State-specific language inserts ensure
contracts comply with local requirements.

---

## Gap Items Addressed

| Gap # | Description | Resolution |
|-------|-------------|------------|
| 281 | Different builders use different contract forms; must support custom templates | Builder-managed template library with variable field placeholders |
| 282 | AIA contracts vs. custom vs. state-specific contracts | Template categorization by type; AIA format support; state-specific clause inserts |
| 283 | Contract clause libraries (standard clauses builders mix and match) | Clause library with tags, categories, and drag-and-drop clause assembly |
| 284 | Contract compliance tracking varies by type (cost-plus audit rights, GMP savings split, fixed-price scope) | Contract type metadata drives compliance tracking: audit provisions, savings split terms, scope boundaries |
| 285 | Retainage varies by builder, trade, and contract (10%, 5%, 0%) | Per-contract retainage configuration with trade-level overrides |
| 286 | Subcontract status tracking (sent, received, reviewed, countersigned, executed, insurance verified) | Multi-step subcontract workflow with status tracking and deadline alerts |
| 287 | Verbal change directives that need formalization | Change directive capture with "formalize" workflow linking to change order module |
| 288 | Warranty obligations per contract (structural, systems, finishes -- different terms) | Per-contract warranty term definitions feeding into Module 31 warranty tracking |
| 289 | Contract closeout checklist varies by builder | Configurable closeout checklist template per contract type |
| 290 | Client deposit tracking and application (jurisdiction-specific rules) | Deposit tracking with application log and jurisdiction-specific compliance rules |
| 949 | Contract milestone/draw schedule builder — link payments to construction milestones | Draw schedule builder linking contract payment milestones to construction schedule milestones |
| 950 | Financing coordination tracker — construction loan status, appraisal, lender requirements | Construction loan coordination with application status, appraisal tracking, and lender requirement checklist |
| 951 | Lender draw format manager — different lenders require different formats | Per-lender draw format templates with configurable fields and output formats |
| 952 | Title company coordination — title insurance, closing documents, earnest money, survey | Title company workflow tracking from title commitment through closing |
| 953 | Insurance setup checklist — Builder's Risk policy per project | Per-project Builder's Risk insurance tracking with policy details and expiration alerts |
| 954 | Notice to Owner management — NTO requirements by state, filing deadlines | State-specific NTO tracking with automated deadline calculation and filing status |
| 955 | Pre-construction meeting management — attendee list, agenda, minutes, kickoff docs | Pre-construction meeting workflow with template agenda, attendees, minutes, and action items |

---

## Detailed Requirements

### Contract Templates
- Template creation with WYSIWYG editor and variable field placeholders
- Variable fields: {{client_name}}, {{project_address}}, {{contract_amount}}, {{start_date}}, etc.
- Auto-populated variables from project and contact data
- Template versioning: track changes to templates over time
- Template categories: owner agreement, subcontract, pre-con agreement, purchase order, change order, amendment
- Template cloning: duplicate and modify existing templates
- Platform-provided starter templates for common contract types
- Template access control: who can create, edit, use templates
- PDF preview before sending for signature

#### Edge Cases & What-If Scenarios

1. **Legal review requirement for platform-provided templates.** If the platform provides contract templates, there is liability exposure if those templates contain errors or fail to comply with state-specific requirements. Required behavior:
   - **Two-tier template system:**
     - **Platform templates** -- reviewed by construction law attorneys, marked with "Reviewed by [firm] on [date]" badge and jurisdiction applicability. Platform carries responsibility for accuracy.
     - **Builder templates** -- user-created, marked with "Custom template -- not legally reviewed" disclaimer. Builder assumes responsibility.
   - **Disclaimer on all templates** -- every generated contract includes a footer: "This document was generated using [platform/custom] templates. Consult a licensed attorney in your jurisdiction before execution."
   - **Annual review cycle** -- platform templates are reviewed annually and after any relevant state law changes. Version history shows last review date.
   - **State coverage tracking** -- track which states each template has been reviewed for. Templates used in un-reviewed states show a warning.
   - **No legal advice** -- platform never characterizes template content as "legal advice." All help text uses "consult your attorney" language.

### Clause Library
- Clause categories: scope, payment terms, change orders, delays, warranties, insurance, indemnification, dispute resolution, termination
- Clause tagging: by contract type, by state, by project type
- Clause versioning: track edits to standard clauses
- Clause assembly: drag-and-drop clauses into a contract draft
- Conditional clauses: automatically include/exclude based on contract type or state
- Clause search: full-text search across clause library
- Builder-specific clauses and platform-provided standard clauses

### State-Specific Language
- State-specific clause variants for key provisions:
  - Mechanic's lien notice requirements
  - Right to cure / notice of defect
  - Retainage release rules
  - Warranty implied by law
  - Deposit and trust fund requirements
  - Prompt payment act provisions
  - Home solicitation / right to cancel
- Jurisdiction selector: when creating a contract, select the state to auto-include relevant language
- Jurisdiction database maintained by platform, updatable as laws change
- Builder can override platform defaults with their own attorney-reviewed language

#### Edge Cases & What-If Scenarios

1. **Builder operates in a state with unusual or highly specific contract requirements.** Some states have unique requirements (e.g., specific right-to-cancel language, mandatory arbitration clauses, deposit caps, or trust fund provisions) that generic templates do not cover. Required behavior: (a) the custom template engine must support fully custom clause insertion at any point in the contract, not just pre-defined placeholder locations, (b) the jurisdiction database flags states with known unusual requirements and presents a checklist of state-specific provisions when that state is selected, (c) builders can upload their own attorney-reviewed state-specific clauses and tag them to the jurisdiction for reuse, (d) the system warns when a contract is being created for a state that has no platform-reviewed clauses ("No platform-reviewed clauses available for [state] -- use builder-provided or consult attorney"), and (e) multi-state builders can maintain separate clause libraries per state with automatic selection based on project location.

### Contract Types & Compliance
- **Cost-Plus:** Contract amount = actual costs + agreed markup/fee. Track: audit rights, documentation requirements, fee cap if applicable.
- **Guaranteed Maximum Price (GMP):** Track: GMP amount, savings split terms (e.g., 50/50 above X%), cost-to-complete projections against GMP ceiling.
- **Fixed-Price / Lump-Sum:** Track: scope boundaries, included/excluded items, conditions for price adjustment.
- **Time-and-Materials (T&M):** Track: labor rates, material markup, not-to-exceed cap if applicable, hourly documentation requirements.
- **Hybrid:** Combination types (e.g., fixed-price with allowances, cost-plus with GMP cap). Track per the applicable rules.
- Contract type metadata drives financial tracking rules in Module 19.
- Compliance checklist per contract type: what documentation is required throughout the project.

#### Edge Cases & What-If Scenarios

1. **Financial terms integration between contract and financial modules.** The financial terms defined in the contract must be accurately reflected in the budget and billing systems. Required behavior: (a) when a contract is executed, the financial terms (contract amount, retainage %, payment schedule, markup rate, savings split) automatically create or update the corresponding budget structure in Module 9, (b) any discrepancy between contract terms and budget configuration triggers a reconciliation alert, (c) for cost-plus contracts, the markup rate from the contract automatically applies to all invoices processed through the billing system, (d) for GMP contracts, the budget module enforces the GMP ceiling and tracks proximity to the cap, and (e) contract financial term changes (via amendment) propagate to the financial modules with full audit trail and require PM acknowledgment.

### E-Signature Integration
- Primary integration: DocuSign API for industry-standard e-signature
- Secondary option: native e-signature for simple documents (lightweight, lower cost)
- Multi-party signature routing: define signing order (client first, then builder, then witness)
- Signature status tracking: sent, viewed, signed, declined, expired
- Automatic reminders for unsigned documents (configurable frequency)
- Signed document auto-storage in document management (Module 6)
- Audit trail: who signed, when, from what IP, with what device
- Bulk send: send the same contract to multiple parties (e.g., identical sub agreements to 15 trades)
- Signature field placement: builder defines where signatures, initials, and dates go on each template

### Subcontract Workflow
- Subcontract status pipeline: Draft -> Internal Review -> Sent to Sub -> Sub Review -> Countersigned -> Executed -> Insurance Verified -> Active
- Subcontract package: contract + scope of work + plans + specs + schedule (bundled for vendor)
- Vendor countersignature tracking with deadline
- Insurance verification gate: subcontract not "Active" until COI received and verified
- Subcontract amendment workflow for scope changes during project
- Subcontract closeout: final payment, lien waiver, warranty assignment

### Change Directives & Amendments
- Verbal change directive capture: description, date, who authorized, who received
- "Formalize" button: create change order from directive, linking to Module 17
- Amendment workflow: modification to existing contract terms (not scope -- that's a change order)
- Amendment tracking: what changed, effective date, signatures required

#### Edge Cases & What-If Scenarios

1. **Contract amendment impacts downstream systems.** When a contract is amended (not a change order -- a change to contract terms like payment schedule, retainage percentage, or warranty obligations), the system must handle cascading effects. Required behavior: (a) the amendment workflow identifies affected downstream systems (budget module, invoicing, warranty tracking, retainage calculations) and presents a checklist of required updates, (b) financial term changes (retainage %, payment terms, contract amount) automatically propagate to the budget and invoicing modules with an audit trail showing the amendment as the source, (c) warranty term amendments update the warranty module (Module 31) configuration for the affected project, (d) the system prevents conflicting amendments (e.g., two amendments changing the same term simultaneously), and (e) all parties who signed the original contract must sign the amendment for it to take effect.

### Warranty Obligations per Contract (Gap 288)

Each contract must define warranty obligations with terms that vary by aspect of construction. The system must track:
- **Warranty categories**: structural (foundation, framing), mechanical systems (HVAC, plumbing, electrical), building envelope (roofing, siding, windows), finishes (paint, flooring, tile, countertops), and appliances.
- **Per-category warranty terms**: duration (e.g., 10 years structural, 2 years systems, 1 year finishes), start date (substantial completion, final completion, or certificate of occupancy), and coverage scope (materials only, labor only, or both).
- **Subcontractor warranty pass-through**: track which warranty obligations are passed through to subcontractors vs. retained by the builder. Each subcontract can specify the sub's warranty terms separately from the owner contract.
- **Warranty term configuration**: builders define default warranty terms at the company level; per-contract overrides allow different terms for specific projects or contract types.
- **Warranty data feeds Module 31 (Warranty & Home Care)**: when a contract is executed, the warranty terms automatically populate the warranty tracking module for that project.
- **State-specific implied warranties**: some states imply warranties by law regardless of contract language (e.g., implied warranty of habitability). The jurisdiction database must flag applicable implied warranties so they appear in the warranty tracking even if not explicitly stated in the contract.

### Contract Closeout
- Configurable closeout checklist per contract type:
  - Final lien waiver (conditional and unconditional)
  - Warranty letter with terms
  - As-built documentation
  - O&M manuals
  - Final payment certification
  - Certificate of substantial completion
  - Retainage release
  - Key/access handover
- Closeout status tracking per checklist item
- Closeout completion gates: all items must be checked before final payment release

### Contract Milestone / Draw Schedule Builder (Gap 949)
- Link contract payment milestones to construction schedule milestones (Module 7 integration)
- Draw schedule templates: percentage-based (25/25/25/25), milestone-based (foundation, framing, dry-in, final), or hybrid
- Each draw milestone specifies: trigger event, percentage of contract, dollar amount, required documentation, inspection requirement
- Draw schedule visualization: timeline view showing when each draw is expected based on current construction schedule
- Auto-generate draw request packages when milestone is reached (photos, invoices, lien waivers)
- Lender-specific draw schedules: different draw breakdowns for different lenders, all mapped to the same underlying budget

### Financing Coordination Tracker (Gap 950)
- Construction loan application status tracking: application submitted, in underwriting, approved, closed, funded
- Appraisal management: appraiser contact, scheduled date, completed date, appraised value, conditions
- Lender requirements checklist: configurable list of documents and conditions required by each lender
- Lender contact management: loan officer, closer, inspector, draw administrator with contact info
- Loan terms tracking: loan amount, interest rate, term, draw frequency, inspection requirements
- Periodic lender inspection scheduling: track lender-required inspections (separate from building department inspections)

### Lender Draw Format Manager (Gap 951)
- Per-lender draw format templates: different lenders require different column layouts, cost code groupings, and supporting documentation
- Stored lender profiles: format requirements, submission method (email, portal, mail), contact info, typical turnaround time
- Draw request generation in lender-specific format from the common project budget data
- AIA G702/G703 format support as a standard output option
- Custom draw format builder for non-standard lender requirements
- Draw submission tracking: submitted date, approved date, funded date, funded amount, retainage held by lender

### Title Company Coordination (Gap 952)
- Title company contact management: title officer, closer, examiner with contact info
- Title commitment tracking: ordered date, received date, review status, exceptions
- Closing document checklist: configurable by transaction type
- Earnest money tracking: amount, held by whom, release conditions
- Survey requirement tracking: what survey type the title company requires and its status
- Title insurance policy tracking: commitment, premium, policy number, coverage amount

### Builder's Risk Insurance Setup (Gap 953)
- Per-project Builder's Risk policy tracking: policy number, carrier, coverage amount, deductible, premium
- Policy effective dates: start date (usually at groundbreaking), end date (usually at CO or occupancy)
- Coverage details: what is covered (structure, materials on site, materials in transit, theft, vandalism)
- Endorsements tracking: flood, earthquake, soft costs, additional named insureds
- Expiration alerts: notify PM and office when policy is approaching expiration (configurable lead time)
- Claims tracking: date of loss, description, claim number, adjuster contact, status, settlement

### Notice to Owner (NTO) Management (Gap 954)
- State-specific NTO requirements database: which states require NTOs, filing deadlines, form requirements
- Per-project NTO tracking: which vendors have filed NTOs, filing dates, service method, acknowledgment
- Automated deadline calculation: based on vendor first-work date and state-specific rules
- NTO status dashboard: across all projects, which NTOs are pending, filed, or past deadline
- Integration with lien waiver tracking: NTO status informs lien waiver requirements
- Vendor notification: alert vendors about their NTO filing obligations per state requirements

### Pre-Construction Meeting Management (Gap 955)
- Pre-construction meeting template: configurable agenda with standard topics (project overview, schedule, communication protocols, safety requirements, site logistics, vendor expectations, payment procedures)
- Attendee management: invite list from project contacts (client, architect, superintendent, key vendors)
- Meeting minutes with action items: auto-assign and track follow-up tasks from meeting decisions
- Project kickoff documentation package: compiled handout including project directory, schedule summary, site plan, communication protocols, emergency contacts
- Meeting notes auto-distributed to all attendees via email and portal notification
- Per-vendor pre-construction meetings: smaller scope meetings with individual trades before they start work

### Deposit & Retainage Tracking
- Client deposit tracking: amount, date received, trust account allocation
- Deposit application: how deposit is applied against first draws
- Jurisdiction-specific deposit rules (e.g., some states cap deposits at X%)
- Retainage configuration: percentage, by trade, by contract
- Retainage release schedule: at substantial completion, at final completion, split release
- Retainage tracking per subcontract and per owner contract

---

## Database Tables

```
contract_templates
  id, builder_id, name, category, contract_type, description,
  content_html, variable_fields, version, is_platform_provided,
  is_active, created_by, created_at, updated_at

contract_clauses
  id, builder_id, name, category, tags, content_html,
  state_applicability, contract_type_applicability,
  is_platform_provided, version, is_active, created_at

contracts
  id, builder_id, project_id, template_id, contract_type
  (cost_plus|gmp|fixed_price|t_and_m|hybrid),
  party_type (owner|subcontractor|vendor|precon),
  counterparty_id, counterparty_type,
  contract_number, title, amount, retainage_pct,
  start_date, end_date, status, signed_date,
  esign_envelope_id, esign_status,
  warranty_terms, deposit_amount, deposit_received_date,
  closeout_status, created_at, updated_at

contract_clauses_used
  id, contract_id, clause_id, sequence_order, content_override

contract_compliance
  id, contract_id, contract_type, requirement_name,
  description, status, due_date, completed_at, notes

contract_amendments
  id, contract_id, amendment_number, description,
  effective_date, esign_envelope_id, esign_status,
  signed_date, created_at

change_directives
  id, builder_id, project_id, contract_id, description,
  authorized_by, directed_to, directive_date,
  formalized, change_order_id, created_at

contract_closeout_items
  id, contract_id, checklist_item, status, completed_by,
  completed_at, document_url, notes

contract_deposits
  id, contract_id, amount, received_date, applied_amount,
  trust_account_ref, jurisdiction_compliant, notes

contract_retainage
  id, contract_id, vendor_id, total_retainage_held,
  released_amount, release_date, release_conditions, status

signature_routing
  id, contract_id, signer_name, signer_email, signer_role,
  sign_order, status, sent_at, signed_at, declined_at

state_legal_requirements
  id, state_code, requirement_type, description, statute_ref,
  clause_template, effective_date, is_active

draw_schedules
  id, contract_id, builder_id, project_id, lender_profile_id,
  schedule_type (percentage|milestone|hybrid), created_at

draw_milestones
  id, draw_schedule_id, milestone_name, trigger_event,
  percentage, amount, sequence_order, schedule_task_id,
  required_docs, inspection_required, status, completed_at

lender_profiles
  id, builder_id, lender_name, loan_officer_contact,
  draw_format_template, submission_method, typical_turnaround_days,
  inspection_requirements, notes, created_at

construction_loans
  id, builder_id, project_id, lender_profile_id,
  loan_amount, interest_rate, term_months, draw_frequency,
  application_status, approved_date, closed_date, funded_date,
  appraised_value, appraisal_date, notes, created_at

draw_requests
  id, construction_loan_id, draw_schedule_id, draw_milestone_id,
  request_number, amount_requested, amount_approved, amount_funded,
  submitted_date, approved_date, funded_date, retainage_held,
  lender_inspector, inspection_date, status, notes

title_coordination
  id, builder_id, project_id, title_company_name,
  title_officer_contact, commitment_ordered, commitment_received,
  exceptions, closing_date, earnest_money_amount, earnest_money_holder,
  policy_number, coverage_amount, premium, status

builders_risk_policies
  id, builder_id, project_id, carrier, policy_number,
  coverage_amount, deductible, premium, effective_date, expiration_date,
  endorsements, status, created_at

builders_risk_claims
  id, policy_id, loss_date, description, claim_number,
  adjuster_contact, status, settlement_amount, created_at

nto_tracking
  id, builder_id, project_id, vendor_id,
  state_code, nto_required, filing_deadline,
  filed_date, service_method, acknowledged, status

precon_meetings
  id, builder_id, project_id, meeting_type (project_kickoff|vendor_kickoff),
  scheduled_date, attendees, agenda, minutes, action_items,
  documentation_package_url, created_at
```

---

## API Endpoints

```
GET    /api/v2/contracts/templates                 # List templates
POST   /api/v2/contracts/templates                 # Create template
GET    /api/v2/contracts/templates/:id             # Template detail
PATCH  /api/v2/contracts/templates/:id             # Update template

GET    /api/v2/contracts/clauses                   # Clause library (filter by category, state, type)
POST   /api/v2/contracts/clauses                   # Create clause
PATCH  /api/v2/contracts/clauses/:id               # Update clause

GET    /api/v2/contracts                           # List contracts (filter by project, status, type)
POST   /api/v2/contracts                           # Create contract from template
GET    /api/v2/contracts/:id                       # Contract detail
PATCH  /api/v2/contracts/:id                       # Update contract
POST   /api/v2/contracts/:id/send-for-signature    # Send for e-signature
GET    /api/v2/contracts/:id/signature-status       # Check signature status
POST   /api/v2/contracts/:id/amendments            # Create amendment

GET    /api/v2/contracts/:id/closeout              # Closeout checklist status
PATCH  /api/v2/contracts/:id/closeout/:itemId      # Update closeout item

POST   /api/v2/change-directives                   # Log verbal change directive
POST   /api/v2/change-directives/:id/formalize     # Convert to change order

GET    /api/v2/contracts/:id/retainage             # Retainage tracking
POST   /api/v2/contracts/:id/retainage/release     # Release retainage

GET    /api/v2/contracts/:id/deposits              # Deposit tracking
POST   /api/v2/contracts/:id/deposits              # Record deposit

GET    /api/v2/contracts/state-requirements/:state  # State-specific legal requirements
GET    /api/v2/contracts/compliance/:id            # Compliance tracking for contract
```

---

## Dependencies

| Module | Relationship |
|--------|-------------|
| Module 3: Core Data Model | Project and contact context for contract generation |
| Module 6: Document Storage | Signed contract storage, closeout document management |
| Module 10: Contact/Vendor Management | Counterparty data for contract generation |
| Module 17: Change Order Management | Change directives formalized into change orders |
| Module 19: Financial Reporting | Contract type drives financial tracking rules |
| Module 31: Warranty & Home Care | Warranty terms per contract feed warranty module |
| Module 5: Notification Engine | Signature reminders, closeout deadline alerts |
| External: DocuSign | E-signature provider integration |

---

## Litigation & Dispute Tracking

Track and manage disputes with clients, subcontractors, or vendors through resolution.

- **Dispute Records:** Create dispute records linked to related contracts, change orders, invoices, and communications. Track counterparty, dispute type, amount in question, and status.
- **Legal Hold Flag:** Flag a dispute for legal hold, which preserves all related documents, emails, and records from deletion or modification.
- **Event Timeline:** Maintain a chronological timeline of events and correspondence related to each dispute, with document attachments at each entry.
- **Resolution Tracking:** Track dispute resolution outcome (settled, withdrawn, judgment, mediation, arbitration) with financial impact and terms.
- **Document Preservation:** Integration with document storage (Module 6) to tag and protect evidence documents associated with the dispute.

### Legal & Dispute Edge Cases

These scenarios address construction-specific legal situations that the contracts and dispute tracking system must handle. Each requires specific data structures, workflows, and compliance tracking.

1. **Mechanic's lien documentation by state (GAP-797).** Construction lien laws vary dramatically by state — different notice deadlines, filing requirements, and waiver forms. The system must: (a) maintain a jurisdiction database of mechanic's lien requirements (notice deadlines, preliminary notice requirements, filing deadlines, waiver form types), (b) auto-generate the correct lien waiver forms based on project state, (c) track lien notice deadlines per vendor per project and alert before deadlines expire, (d) support state-specific preliminary notice requirements (e.g., California 20-day preliminary notice, Florida Notice to Owner), and (e) provide a lien rights dashboard showing status for all vendors on a project. This integrates with Module 16 (Lien Waiver Management) and the state_legal_requirements table.

2. **Litigation hold / discovery preservation (GAP-798).** When a legal dispute arises, all project data must be preserved from deletion or modification. The system must: (a) allow an admin or owner to place a "litigation hold" on a project or specific entity (contract, vendor, date range), (b) when a litigation hold is active, block all soft-deletes, archiving, and data purges on affected records, (c) extend the litigation hold to all related records — if a project is on hold, all its invoices, daily logs, photos, emails, change orders, and contracts are also preserved, (d) log all access to litigation-held records in the audit trail, and (e) provide an export function for litigation-held data in a format suitable for legal discovery (chronological, with metadata). Litigation holds override all retention policies and automatic cleanup jobs.

3. **OSHA citation documentation and response tracking (GAP-799).** When a builder receives an OSHA citation, the system must support the response workflow: (a) log the citation with details (citation number, violation type, proposed penalty, abatement date), (b) link the citation to the relevant project, safety observations, daily logs, and responsible parties, (c) track the response process (informal conference, contest, settlement, abatement), (d) maintain a document folder for all citation-related correspondence, photos, and corrective actions, and (e) track abatement completion with photo documentation and deadline compliance. This integrates with Module 33 (Safety & Compliance).

4. **Construction defect claim workflows by state (GAP-800).** States have specific pre-litigation procedures for construction defect claims (e.g., Florida's Chapter 558 process, California's SB 800 Right to Repair Act). The system must: (a) detect the project's jurisdiction and present the applicable defect claim procedure, (b) track required notice periods and response deadlines per state statute, (c) manage the inspection and repair opportunity process (notice received -> inspection scheduled -> inspection completed -> repair offer made -> repair performed or claim proceeds), (d) document all inspections, repair attempts, and correspondence with timestamps and photos, and (e) calculate financial exposure per claim (repair cost, potential legal cost, insurance coverage). Link to warranty claims and punch list records for full defect history.

5. **Warranty claim dispute resolution documentation (GAP-801).** When a warranty claim is disputed (builder claims not covered, homeowner disagrees), the system must: (a) create a formal dispute record linked to the warranty claim, original contract warranty terms, and related communications, (b) present the specific warranty language from the executed contract for reference, (c) track the dispute resolution process (internal review -> mediation -> arbitration -> litigation), (d) maintain a timeline of all dispute events with document attachments, and (e) record the resolution outcome and financial impact. Integrates with Module 31 (Warranty & Home Care).

6. **Expert witness documentation support (GAP-802).** When a builder or their attorney needs organized project records for legal testimony or expert review, the system must: (a) generate a comprehensive project record export organized chronologically with: daily logs, photos (with timestamps and GPS), weather data, inspection records, change orders, RFIs, communications, and financial records, (b) produce chain-of-custody documentation for photos and documents (who uploaded, when, from what device, original metadata preserved), (c) support filtered exports (e.g., "all records related to the foundation work between March and June 2026"), and (d) export in standard legal production formats (PDF with Bates numbering, CSV index of all documents).

7. **Non-compete and non-solicitation tracking (GAP-803).** For employees and vendors with non-compete or non-solicitation agreements, the system must: (a) store the agreement terms (restricted activities, geographic scope, duration, start/end dates) linked to the contact or employee record, (b) track expiration dates and alert before agreements expire, (c) flag when a vendor or employee leaves and the restriction period begins, and (d) maintain a searchable log of all active restrictions. This is informational tracking only — the system does not enforce non-competes.

8. **Contract interpretation dispute support (GAP-804).** When a dispute arises over contract language interpretation, the system must: (a) provide quick access to the executed contract with the specific clause in question, (b) link related correspondence (emails, meeting notes, RFIs) that provide context for the parties' intent, (c) store the dispute record with the specific contract language at issue, each party's interpretation, and the resolution, and (d) maintain a precedent log so that resolved interpretation disputes can inform future contract drafting. This feeds the clause library — disputed clauses should be flagged for revision.

9. **Government audit preparation (GAP-805).** For prevailing wage audits, tax audits, or safety audits, the system must: (a) generate organized documentation packages by audit type — prevailing wage (certified payroll, time records, wage determinations), tax (1099s, payment records, W-9s), safety (training records, incident reports, inspection logs), (b) support date-range filtered exports with all supporting documentation, (c) produce reports in the format expected by the auditing agency (e.g., WH-347 for prevailing wage), and (d) maintain an audit history log showing what was produced, when, and for which audit. Integrates with Module 34 (HR & Workforce) for payroll/wage data and Module 33 (Safety & Compliance) for safety records.

## Unusual Business Scenarios — Contract Edge Cases

### Property Sold During Construction (GAP-603)
When the property being built on is sold to a new owner during construction, the system must support:
- **Contract assignment workflow:** Track the assignment of the construction contract from the original owner to the new owner. System generates an assignment agreement document from a template, capturing: original contract reference, assignment date, new owner information, and any modifications to terms.
- **New owner portal access:** Original client's portal access is revoked (or transitioned to read-only for records they need). New owner receives portal access with the full project history preserved.
- **Closing documentation:** System generates a comprehensive status package for the real estate closing: current project status, budget status, work completed, outstanding commitments, pending selections, permit status, and warranty information.
- **Financial transition:** All future draw requests, invoices, and payments are attributed to the new owner from the assignment date. Historical financial records retain the original owner's identity for audit.

### Adjacent Property Owner Lawsuit (GAP-609)
When an adjacent property owner sues to stop construction, the system must support:
- **Legal hold on project:** Project placed on legal hold — all documents, communications, daily logs, and photos are preserved and protected from modification or deletion. This leverages the litigation hold capability in the Litigation & Dispute Tracking section.
- **Communication restrictions:** System can flag specific external contacts as "litigation adverse party" — no direct communication through the platform. All communication must route through designated legal counsel.
- **Project pause workflow:** If the lawsuit results in a work stoppage, the system supports the extended pause workflow (see Module 7, GAP-602) with legal hold preservation layered on top.
- **Evidence package generation:** System can generate a comprehensive evidence package: daily logs showing construction activity, photos documenting site conditions, permits and approvals, noise/work hour compliance records, and all communications with the neighboring party.

### Client Self-Performs Work (GAP-610)
When a client wants to self-perform some construction work (owner-builder scope), the system must support:
- **Owner-builder scope tracking:** Designate specific budget lines and schedule tasks as "client self-perform." These items are tracked separately in the budget (no builder markup) and schedule (client responsible for completion).
- **Insurance requirements:** System flags client self-perform scope items and requires documentation of client's builder's risk insurance, liability coverage, and any required waivers. Compliance tracking applies to client as if they were a vendor.
- **Quality acceptance workflow:** Builder must formally accept client self-performed work before proceeding with dependent tasks. Acceptance creates a record documenting: scope inspected, condition accepted/rejected, deficiencies noted, and photos.
- **Warranty exclusions:** Client self-performed work is automatically excluded from the builder's warranty. The contract module generates warranty exclusion language referencing the specific self-performed scope items. These exclusions are visible in the warranty module (Module 31).
- **Schedule coordination:** Client self-perform tasks are on the project schedule but flagged as "client responsibility." System sends deadline reminders to the client via the portal and alerts the PM if client tasks are at risk of delaying dependent work.

### Pandemic / Force Majeure Work Stoppage (GAP-614)
When a pandemic, government order, or other force majeure event causes a work stoppage, the system must support:
- **Force majeure documentation:** Capture the force majeure event with: event type, effective date, government order reference (if applicable), expected duration, and scope of impact (full project stop vs. partial restrictions).
- **Vendor payment pause:** System supports bulk pausing of vendor payment schedules across all affected projects. Paused payments are tracked separately and resume on a configurable date. Vendors are notified through the portal.
- **Schedule extension documentation:** System generates time extension requests per contract, documenting: force majeure event, days of delay, impact on critical path, and supporting evidence (government orders, weather data, health department notices).
- **Remote management tools:** System emphasizes features that support remote project oversight: photo documentation from site walks (even without active work), vendor communication via portal, document review and approval workflows, and virtual meeting notes logging.
- **Multi-project impact:** Force majeure events are logged at the builder level (not just project level), automatically applying the work stoppage to all active projects. Individual projects can be exempted if work continues on some jobs.
- **Resumption workflow:** When the event ends, system provides a "return to work" checklist per project: site condition assessment, vendor re-mobilization confirmations, updated schedule, permit status verification, and safety protocol documentation.

---

## Open Questions

1. Should the platform provide legally reviewed contract templates, or only blank template tools? (Liability concern)
2. How do we keep state-specific legal requirements current? Annual legal review cycle? Community contributions?
3. Should native e-signature be a priority, or is DocuSign integration sufficient for V1?
4. How do we handle contract templates that reference AIA document numbers? (AIA copyright considerations)
5. Should the clause library support conditional logic (if X then include clause Y)?
6. How do we handle contracts in languages other than English? (Spanish-language contracts for some markets)
7. What is the retention period for signed contracts? Indefinite? Configurable per builder?

