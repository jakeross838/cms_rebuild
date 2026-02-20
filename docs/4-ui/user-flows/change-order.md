# User Flow: Change Order

> **Status: TODO -- Detailed flow not yet documented**

## Overview

This flow describes how a change to the original scope of work is requested, priced, approved by the client, and propagated across the contract, budget, schedule, and financial documents.

## High-Level Steps

1. **Client requests change** -- The client requests a modification to the project scope, either verbally, via the client portal, or through formal correspondence.
2. **RFI created if needed** -- If the change request requires clarification, an RFI is issued to the architect, engineer, or client to gather necessary details.
3. **Cost impact calculated** -- The cost of the change is estimated, including material costs, labor costs, and builder markup/overhead.
4. **Schedule impact calculated** -- The effect on the project timeline is assessed, identifying any delays or acceleration needed.
5. **Change order drafted** -- A formal change order document is created with scope description, cost breakdown, and schedule adjustment.
6. **Client reviews in portal** -- The change order is shared with the client through the client portal for review.
7. **Client approves with e-signature** -- The client electronically signs the change order to authorize the work and cost adjustment.
8. **Contract updated** -- The original contract value is adjusted to reflect the approved change order amount.
9. **Budget updated** -- Project budget line items are updated to incorporate the new or modified cost codes from the change order.
10. **Schedule updated** -- The project schedule is revised to account for any timeline changes from the approved change order.
11. **POs revised** -- Existing purchase orders are amended, or new POs are issued for additional materials and subcontractor work.
12. **Draw schedule adjusted** -- The draw request schedule is updated to reflect the new contract value and changed line items.

## Connections to Other Modules

- **RFIs** -- Change requests may trigger RFIs for scope clarification before pricing.
- **Client Portal** -- The client reviews and e-signs change orders through the portal.
- **Contract** -- The original contract value is adjusted with each approved change order.
- **Budget** -- Budget line items are added or modified to reflect change order costs.
- **Schedule** -- Task durations and dependencies are updated based on schedule impact.
- **Purchase Orders** -- New or revised POs are created for change order scope.
- **Draw Requests** -- The draw schedule reflects the updated contract value.
- **Notifications** -- Alerts sent when COs are pending review, approved, or rejected.

## Pages Involved

| Page Spec | Role in Flow |
|-----------|-------------|
| `pos-draws-cos` | Draft, track, and manage change orders; update POs and draw schedules |
| `client-portal` | Client reviews and e-signs change orders |
| `job-budget` | View and update budget impact from approved change orders |
| `schedule-logs-photos` | Assess and apply schedule impacts from change orders |
