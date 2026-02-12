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

### Contract Types & Compliance
- **Cost-Plus:** Contract amount = actual costs + agreed markup/fee. Track: audit rights, documentation requirements, fee cap if applicable.
- **Guaranteed Maximum Price (GMP):** Track: GMP amount, savings split terms (e.g., 50/50 above X%), cost-to-complete projections against GMP ceiling.
- **Fixed-Price / Lump-Sum:** Track: scope boundaries, included/excluded items, conditions for price adjustment.
- **Time-and-Materials (T&M):** Track: labor rates, material markup, not-to-exceed cap if applicable, hourly documentation requirements.
- **Hybrid:** Combination types (e.g., fixed-price with allowances, cost-plus with GMP cap). Track per the applicable rules.
- Contract type metadata drives financial tracking rules in Module 19.
- Compliance checklist per contract type: what documentation is required throughout the project.

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

## Open Questions

1. Should the platform provide legally reviewed contract templates, or only blank template tools? (Liability concern)
2. How do we keep state-specific legal requirements current? Annual legal review cycle? Community contributions?
3. Should native e-signature be a priority, or is DocuSign integration sufficient for V1?
4. How do we handle contract templates that reference AIA document numbers? (AIA copyright considerations)
5. Should the clause library support conditional logic (if X then include clause Y)?
6. How do we handle contracts in languages other than English? (Spanish-language contracts for some markets)
7. What is the retention period for signed contracts? Indefinite? Configurable per builder?
