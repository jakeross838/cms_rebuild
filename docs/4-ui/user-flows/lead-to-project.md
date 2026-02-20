# User Flow: Lead to Project Conversion

> **Status: TODO -- Detailed flow not yet documented**

## Overview

This flow describes the full lifecycle of converting an inbound lead into an active construction project, from initial inquiry through contract execution and project setup.

## High-Level Steps

1. **Website inquiry received** -- A potential client submits an inquiry through the website contact form or other intake channel.
2. **Lead captured** -- The system creates a new lead record with contact information and project details.
3. **Qualification scored** -- The lead is scored based on project fit, budget range, timeline, and location criteria.
4. **Preliminary estimate created** -- A rough-order-of-magnitude estimate is assembled based on initial project scope.
5. **Preconstruction agreement signed** -- A preconstruction services agreement is executed to formalize the design/estimating phase.
6. **Design iterations** -- The project goes through design revisions with the client, updating scope and cost as needed.
7. **Final estimate produced** -- A detailed, line-item estimate is finalized based on the completed design.
8. **Contract executed** -- The construction contract is generated from the estimate, reviewed, and signed by both parties.
9. **Project activated** -- The job record is created (or converted from the lead) and marked as active.
10. **Budget created from estimate** -- The approved estimate line items are imported into the project budget with cost codes.
11. **Schedule created** -- A project schedule is built from a template or created manually with milestones and tasks.

## Connections to Other Modules

- **Estimates & Proposals** -- The estimate created during preconstruction becomes the basis for the contract and project budget.
- **Client Portal** -- The client may review proposals and sign contracts through the portal.
- **Budget** -- The project budget is seeded directly from the final estimate line items.
- **Schedule** -- Schedule templates can be applied during project activation.
- **Notifications** -- Automated notifications are sent at key conversion milestones (qualification, contract sent, project activated).

## Pages Involved

| Page Spec | Role in Flow |
|-----------|-------------|
| `leads-pipeline` | View and manage leads through qualification stages |
| `lead-detail` | View/edit individual lead details and qualification scoring |
| `lead-create` | Capture new leads manually |
| `estimates-proposals-contracts` | Create estimates, generate proposals, and execute contracts |
| `job-create` | Create the new project (or convert from lead) |
| `job-detail` | View and manage the newly activated project |
