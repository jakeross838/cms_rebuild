# View Plan: Payments & Cash Flow

## Views Covered
1. Cash Flow Dashboard
2. Accounts Receivable
3. Accounts Payable
4. Payment Processing
5. Bank Reconciliation

---

## Purpose
Manage all financial flows:
- Track incoming payments (draws, client payments)
- Manage outgoing payments (vendor invoices)
- Cash flow forecasting
- Bank reconciliation

---

## 1. Cash Flow Dashboard
URL: /financial/cash-flow

Display:
- Current cash position
- 30/60/90 day forecast
- Upcoming payments due
- Expected draw receipts
- Cash flow graph

AI Enhancement:
- Predictive cash flow modeling
- Alert when cash tight
- Suggest payment timing

---

## 2. Accounts Receivable
URL: /financial/receivables

Features:
- Draw status tracking
- Client invoice aging
- Payment history
- Collection alerts
- Statement generation

Aging Buckets:
- Current
- 1-30 days
- 31-60 days
- 61-90 days
- 90+ days

---

## 3. Accounts Payable
URL: /financial/payables

Features:
- Invoice due dates
- Payment scheduling
- Bulk payment processing
- Early payment discounts
- Vendor payment history

---

## 4. Payment Processing
URL: /financial/payments/process

Workflow:
Select Invoices -> Review Total -> Approve -> Process -> Record

Features:
- Check printing
- ACH processing
- Payment confirmation
- Lien release tracking

---

## 5. Bank Reconciliation
URL: /financial/reconciliation

Features:
- Import bank statements
- Auto-match transactions
- Manual matching UI
- Reconciliation report
- Discrepancy resolution

AI Enhancement:
- Smart transaction matching
- Anomaly detection
- Category suggestions

---

## Database Schema

payments:
- id UUID
- company_id UUID
- type TEXT (incoming/outgoing)
- amount DECIMAL
- payment_method TEXT
- reference_number TEXT
- payment_date DATE
- entity_type TEXT (client/vendor)
- entity_id UUID
- invoices JSONB
- status TEXT
- bank_transaction_id UUID

bank_transactions:
- id UUID
- company_id UUID
- bank_account_id UUID
- transaction_date DATE
- amount DECIMAL
- description TEXT
- category TEXT
- reconciled BOOLEAN
- matched_payment_id UUID

---

## QuickBooks/Xero Sync
- Payment records sync bidirectionally
- Bank feeds integration
- Reconciliation status sync

---

## Gap Items Addressed

### Section 45 — Per-Page Feature Requirements (Invoice / Billing Page)
- **#692** Invoice queue — sorted by status (New, Pending Review, Approved, Paid, Disputed)
- **#693** AI-extracted data display with confidence indicators
- **#694** Side-by-side view — invoice image on left, extracted data on right
- **#695** One-click approval / rejection with required comment on rejection
- **#696** Cost code assignment with smart suggestions
- **#697** Budget impact preview — "approving this invoice will bring Electrical to 87% of budget"
- **#698** Batch approval capability
- **#699** Invoice history per vendor
- **#700** Duplicate detection alerts
- **#701** Payment status tracking — approved > scheduled > paid > cleared
- **#702** Lien waiver status indicator per invoice
- **#703** Retainage auto-calculation
- **#704** Link to PO and contract for comparison
- **#705** Aging report — invoices by days outstanding
- **#706** Payment run generation — select approved invoices for batch payment
- **#707** Export to accounting system button

### Section 16 — Invoice & Payment Processing
- **#341** Invoice approval workflows fully configurable (1-step, 2-step, 3-step, threshold-based routing)
- **#342** Invoice processing for different contract types (lump sum: % complete billing; T&M: verify hours/rates; unit price: verify quantities)
- **#343** Invoice coding for different cost code structures
- **#344** AI that learns per-tenant invoice patterns
- **#345** PO matching vs builders who don't use POs
- **#346** Progress billing vs final billing workflows
- **#347** Retainage calculation configurable by contract, vendor, project
- **#348** Conditional payment rules (no payment without current insurance + signed lien waiver — configurable)
- **#349** Invoice dispute tracking (dispute, communication, resolution)
- **#350** Batch payment recommendations

### Section 16 — Lien Waiver Management
- **#351** State-specific statutory lien waiver forms
- **#352** Builder-specific forms for states without statutory forms
- **#353** Conditional vs unconditional waiver tracking by state
- **#354** Sub-tier lien waiver tracking
- **#355** Notice to Owner / Preliminary Notice requirements by state
- **#356** Mechanic's lien filing deadline alerts by state
- **#357** Lien release/satisfaction documentation
- **#358** Electronic vs wet signature requirements for lien waivers

### Section 24 — Financial Management & Accounting
- **#431** Chart of accounts mapping configurable per builder
- **#433** Fiscal year configuration per builder
- **#435** Multiple bank accounts (operating, trust, payroll)
- **#439** Financial data "accountant-locked" (month-end close — no changes to prior period)
- **#441** Draw request format configurable (AIA G702/G703 or custom)
- **#443** Draw requests for different contract types
- **#445** Draw request routing (Generate > PM review > Director approve > send)
- **#446** Automated draw request generation based on schedule progress
- **#447** Multiple lenders with different draw requirements on same project
- **#448** Draw request reconciliation (approved vs actual disbursement)

### Section 47 — Financial Edge Cases
- **#806** Client overpayment — refund processing and tracking
- **#807** Vendor underpays a credit — collection and dispute tracking
- **#808** Unusual draw structures — configurable draw schedules
- **#809** Multiple funding sources (client, lender, investor)
- **#811** Escrow requirements for deposits (jurisdiction-specific)
- **#814** Progress billing when work complete but not inspected
- **#816** Bonus/penalty clauses — milestone tracking with financial calculation
- **#817** Liquidated damages — daily rate calculation past completion date
- **#818** Shared costs between projects — configurable allocation methods
- **#819** Year-end financial close processes
- **#822** Contingency drawdown authorization
- **#823** Budget contingency reallocation with documentation

---

## Additional Requirements from Gap Analysis

### Invoice Processing Enhancements
1. **AI-powered data extraction** (#693, #344): Side-by-side view showing scanned invoice image alongside AI-extracted data with confidence percentages; system learns vendor-specific patterns per tenant
2. **Budget impact preview** (#697): Before approving an invoice, show how it affects the budget line (current %, projected % after approval, warning if near/over budget)
3. **Duplicate detection** (#700): Alert when invoice amount, vendor, and date are similar to existing invoices; visual comparison tool
4. **Contract type awareness** (#342): Different invoice review screens per contract type — lump sum shows % complete, T&M shows rate/hour verification, unit price shows quantity verification
5. **Dispute workflow** (#349): Track dispute status per invoice with communication log, resolution notes, and outcome recording
6. **PO linking** (#704): Show linked PO next to invoice for line-by-line comparison; flag discrepancies

### Payment Processing Enhancements
1. **Conditional payment gates** (#348): Configurable pre-payment checklist (current insurance, signed lien waiver, completed W-9) that blocks payment until satisfied
2. **Batch payment runs** (#706): Select multiple approved invoices, generate payment batch, assign check numbers or ACH references, print/send
3. **Payment status pipeline** (#701): Visual pipeline showing invoice progression through approved > scheduled > paid > cleared > reconciled
4. **Multi-bank account support** (#435): Select which bank account to pay from; separate operating vs trust accounts
5. **Early payment discount tracking** (#386 related): Flag invoices eligible for early payment discounts (e.g., 2/10 Net 30) with savings calculation

### Lien Waiver Management
1. **State-specific form library** (#351, #352): Built-in library of statutory lien waiver forms by state; auto-select correct form based on project location
2. **Conditional/unconditional tracking** (#353): Track both conditional (before payment) and unconditional (after payment) waivers per draw per vendor
3. **Sub-tier tracking** (#354): Track lien waivers from vendors' subcontractors and suppliers
4. **Deadline alerting** (#356): Auto-calculate mechanic's lien filing deadlines by state and alert before they expire
5. **Notice to Owner** (#355): Track preliminary notice requirements and filing deadlines by state

### Draw Request Enhancements
1. **AIA G702/G703 format** (#441): Generate standard AIA format draw requests with schedule of values
2. **Multi-lender support** (#447): If project has multiple lenders, generate separate draw packages per lender's requirements
3. **Auto-generation** (#446): System recommends draw amounts based on schedule progress and completed work
4. **Reconciliation tracking** (#448): Track difference between requested draw and actual disbursement with notes

### Financial Controls
1. **Period locking** (#439, #819): Accountant can lock periods (month-end close) preventing changes to transactions in closed periods
2. **Multiple funding sources** (#809): Track payments from client, lender, and investor separately with allocation to project costs
3. **Escrow management** (#811): Track deposits held in escrow with jurisdiction-specific rules
4. **Contingency management** (#822, #823): Track contingency drawdown with required approvals and documentation for each use
5. **Cross-project cost allocation** (#818): Allocate shared costs (equipment rental, shared labor) across multiple projects with configurable methods (%, equal split, custom)

---

## Revision History
| Date | Change |
|------|--------|
| 2026-02-11 | Added Gap Items Addressed and Additional Requirements from gap analysis sections 16, 24, 45, and 47 |
| Initial | Created from batch planning |
