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
