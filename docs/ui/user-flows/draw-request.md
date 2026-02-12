# User Flow: Draw Request

> **Status: TODO -- Detailed flow not yet documented**

## Overview

This flow describes how a builder assembles a draw request package from approved invoices and supporting documentation, submits it to the lender for reimbursement, and distributes funds upon approval.

## High-Level Steps

1. **Approved invoices accumulated** -- Invoices that have been approved and are eligible for the current draw period are gathered into the draw request.
2. **Lien waivers collected** -- Conditional and unconditional lien waivers from all vendors and subcontractors included in the draw are collected and verified.
3. **Progress photos gathered** -- Photos documenting the work completed during the draw period are selected and attached to the draw package.
4. **AIA G702/G703 formatted** -- The draw request is formatted into the industry-standard AIA G702 (Application and Certificate for Payment) and G703 (Continuation Sheet) documents.
5. **Builder reviews package** -- The builder/PM reviews the complete draw package for accuracy, ensuring all supporting documents are attached.
6. **Submitted to lender** -- The draw request package is submitted to the lender (or owner) for review and approval.
7. **Lender inspects** -- The lender conducts a site inspection (if required) to verify work completion matches the draw request.
8. **Draw funded** -- The lender approves and funds the draw request, depositing funds to the builder's account.
9. **Payments released** -- The builder disburses payments to vendors and subcontractors from the funded draw amount.

## Connections to Other Modules

- **Invoices** -- Approved invoices are the primary source of line items for each draw request.
- **Lien Waivers** -- Waivers must be collected before draw submission; tracked per vendor per draw period.
- **Photos** -- Progress photos from daily logs and field operations are attached as supporting documentation.
- **Budget** -- The draw request reflects the current budget status and percentage complete per cost code.
- **Payments** -- Once funded, payments are scheduled and released to vendors/subs.
- **Client Portal** -- Lenders or owners may review draw packages through the portal.
- **Notifications** -- Alerts for missing lien waivers, draw submission, lender approval, and funding.

## Pages Involved

| Page Spec | Role in Flow |
|-----------|-------------|
| `pos-draws-cos` | Create, format, and submit draw requests; track draw status |
| `invoices` | View and select approved invoices for inclusion in the draw |
| `payments` | Schedule and release payments from funded draw amounts |
| `job-budget` | Reference budget status and percentage complete for draw line items |
