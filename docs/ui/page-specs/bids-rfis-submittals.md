# View Plan: Bids, RFIs & Submittals

## Views Covered
1. Bid Package List - /jobs/:id/bids
2. Bid Package Detail - /jobs/:id/bids/:bidPackageId
3. Bid Comparison View - Compare multiple vendor bids
4. RFI List - /jobs/:id/rfis
5. RFI Detail - /jobs/:id/rfis/:rfiId
6. RFI Create/Edit - Create and manage RFIs
7. Submittal List - /jobs/:id/submittals
8. Submittal Detail - /jobs/:id/submittals/:submittalId  
9. Submittal Create/Edit - Create and manage submittals
10. Document Intelligence Hub - AI document processing

---

## Bid Workflow
Draft Package -> Invite Vendors -> Receive Bids -> Compare & Score -> Award -> Create PO

## RFI Workflow  
Draft -> Sent -> Under Review -> Response Received -> Closed/Distributed

## Submittal Workflow
Draft -> Submitted -> Under Review -> Approved/Revise/Rejected -> Released

---

## AI Enhancements
- Bid scoring based on price, vendor history, and lead time
- Auto-suggest RFI answers from similar past RFIs
- Document classification and matching
- Smart due date reminders

## Procore Integration
- Bidirectional RFI sync
- Submittal status sync
- Document sharing

---

## Gap Items Addressed

### From Section 21: RFI Management (Items 403-410)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 403 | RFI workflows must be configurable (who creates, reviews, routes, responds) | RFI workflow (Draft -> Sent -> Under Review -> Response -> Closed); Requires: configurable approval chain per builder |
| 404 | RFI templates by trade (pre-loaded common RFIs) | Requires: RFI template library with trade-specific templates (e.g., "confirm header size at opening XYZ") |
| 405 | RFI response tracking (days open, ball-in-court, overdue alerts, configurable SLA) | Requires: SLA timer per RFI, ball-in-court indicator, and overdue alert configuration |
| 406 | RFI cost/schedule impact tracking | Requires: cost impact and schedule impact fields on each RFI, linked to change order and schedule modules |
| 407 | RFI distribution (auto-send to architect, CC client, log for record) | Requires: configurable distribution list per RFI with auto-send and read-receipt tracking |
| 408 | Linking RFIs to specific plan locations (markup on plans) | Requires: plan markup integration — click on a plan location to create or link an RFI |
| 409 | RFI numbering (configurable per builder — sequential, prefixed by project) | Requires: builder-configurable numbering format in Settings (e.g., "RFI-{project}-{seq}") |
| 410 | RFI resolution tracking (answered satisfactorily? Led to a CO?) | Requires: resolution status field and automatic CO creation workflow when RFI has cost impact |

### From Section 20: Purchasing & Procurement (Bid-Related)
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 613-626 | Purchasing workflows | Bid award -> PO creation flow must be seamless with auto-populated PO from winning bid |

### From Section 45: Per-Page Feature Requirements (Items 692-707 — Invoice/Billing)
| Gap # | Description | Relevance to Bids |
|-------|-------------|-------------------|
| 700 | Duplicate detection alerts | Bid responses should detect duplicate submissions from same vendor |
| 704 | Link to PO and contract for comparison | Awarded bids must link forward to generated POs and contracts |

### From Section 19: Vendor & Subcontractor Management
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 593-612 | Vendor management | Bid invitations must pull from vendor database with insurance/license status checks before inviting |

### From Section 15: Document Management (Items 326-340)
| Gap # | Description | Relevance to Submittals |
|-------|-------------|------------------------|
| 334 | Document approval workflows (submittals: vendor submits -> builder reviews -> architect approves) | Submittal workflow covers this; Requires: multi-step approval with architect as final approver |
| 335 | Controlled document distribution (new revision -> auto-send to all parties, confirm receipt) | Requires: distribution tracking with read receipts for submittal revisions |

### From Competitive Parity (Section 51)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 886 | Buildertrend: Bid requests to vendors | Bid Package workflow covers this |
| 893 | Procore: Drawing management with version control and markup | Procore Integration section addresses sync |
| 894 | Procore: Submittal management | Submittal workflow and Procore sync cover this |
| 868 | Vendor bid received -> AI parses line items -> compares to estimate -> recommendation | AI Enhancement: "Bid scoring based on price, vendor history, and lead time" |
| 869 | RFI -> architect -> cost impact -> CO -> budget/schedule update | Requires: full chain automation from RFI response to CO creation |

### From Edge Cases (Sections 44, 46)
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 601 | Sub fired mid-scope — rebid remaining work | Bid packages must support partial-scope re-bid when a vendor is replaced mid-project |
| 604 | Architect fired mid-project — RFI routing changes | RFI distribution must support changing the architect/respondent mid-project without losing history |
| 607 | Material supplier goes bankrupt — alternative sourcing | Bid system should support emergency rebid for alternative suppliers |
| 804 | Contract interpretation disputes | RFI records serve as evidence; must have complete audit trail and immutable submission timestamps |

---

## Revision History
| Date | Change |
|------|--------|
| 2026-02-11 | Added Gap Items Addressed section from gap analysis sections 15, 19-21, 44-48, 51 |
| Initial | Created from view planning |
