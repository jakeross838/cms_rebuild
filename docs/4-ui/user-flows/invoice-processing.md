# User Flow: Invoice Processing

> **Status: TODO -- Detailed flow not yet documented**

## Overview

This flow describes how vendor and subcontractor invoices are received, processed with AI assistance, matched to purchase orders, approved, and ultimately paid -- with budget and draw schedule impacts tracked throughout.

## High-Level Steps

1. **Invoice received** -- An invoice arrives via email forwarding, manual upload, or document scan (mobile camera).
2. **AI extracts data** -- The system uses AI/OCR to extract vendor name, invoice number, line items, amounts, and dates from the document.
3. **Auto-matches to PO/contract** -- Extracted data is matched against existing purchase orders or subcontractor contracts to link the invoice.
4. **Cost code suggested** -- The system suggests appropriate cost codes based on the matched PO, vendor history, and line item descriptions.
5. **Budget impact shown** -- A real-time budget impact summary displays how this invoice affects the project budget (committed vs. actual, remaining balance).
6. **Routed for approval** -- The invoice is routed to the appropriate approver(s) based on amount thresholds and project role assignments.
7. **Approved** -- The approver reviews and approves the invoice (or rejects with comments).
8. **Payment scheduled** -- The approved invoice is queued for payment based on payment terms and the next payment cycle.
9. **Lien waiver requested** -- A lien waiver request is automatically sent to the vendor/sub for the invoiced amount.
10. **Draw line item updated** -- The approved invoice amount is reflected in the current draw request as a billable cost.

## Connections to Other Modules

- **Purchase Orders** -- Invoices are matched against POs to verify amounts and ensure contract compliance.
- **Budget** -- Each approved invoice updates the project's actual costs and remaining budget by cost code.
- **Draw Requests** -- Approved invoices feed into draw request line items for lender reimbursement.
- **Payments** -- Payment scheduling and tracking for approved invoices.
- **Lien Waivers** -- Conditional and unconditional lien waivers are tracked per vendor per payment.
- **Notifications** -- Alerts for pending approvals, budget overages, and missing lien waivers.

## Pages Involved

| Page Spec | Role in Flow |
|-----------|-------------|
| `invoices` | Upload, view, match, and approve invoices |
| `job-budget` | View budget impact of invoiced amounts by cost code |
| `pos-draws-cos` | Link invoices to POs and update draw request line items |
| `payments` | Schedule and track payments for approved invoices |
