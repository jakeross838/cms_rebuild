# Module 27: RFI Management

**Phase:** 4 - Intelligence
**Status:** TODO
**Priority:** High (essential construction workflow)

---

## Overview

Full Request for Information (RFI) lifecycle management covering creation, routing, response tracking, and impact assessment. RFIs are a critical communication tool in construction, used to clarify design intent, resolve field conflicts, and document decisions. This module provides configurable workflows, plan markup integration, automated routing and escalation, deadline tracking with SLA enforcement, and cost/schedule impact assessment. Every RFI becomes part of the permanent project record for dispute resolution and institutional knowledge.

---

## Gap Items Addressed

| Gap # | Description | Coverage |
|-------|-------------|----------|
| 403 | RFI workflows must be configurable (who creates, reviews, routes, responds) | Full workflow engine with configurable roles and routing rules |
| 404 | RFI templates by trade (common RFIs pre-loaded) | Template library with trade-specific pre-built RFIs |
| 405 | RFI response tracking (days open, ball-in-court, overdue alerts, configurable SLA) | SLA engine with ball-in-court tracking and escalation |
| 406 | RFI cost/schedule impact tracking | Impact assessment fields with CO and schedule linkage |
| 407 | RFI distribution (auto-send to architect, CC client, log for record) | Configurable distribution lists per RFI type |
| 408 | Linking RFIs to specific plan locations (markup on plans) | Plan markup integration with pin-drop and annotation |
| 409 | RFI numbering (configurable per builder — sequential, prefixed, etc.) | Builder-configurable numbering scheme engine |
| 410 | RFI resolution tracking (answered satisfactorily? led to CO?) | Resolution status with CO linkage and satisfaction tracking |
| 505 | AI communication assistance (draft RFI responses) | AI-suggested RFI responses based on similar historical RFIs |

---

## Detailed Requirements

### 27.1 RFI Creation with Plan Markup Reference

Enable field and office staff to create well-documented RFIs with precise location references.

- **Rich Text Body:** RFI question supports rich text formatting, inline images, and file attachments.
- **Plan Markup Integration:** Select a drawing sheet, drop a pin at the location in question, and add markup annotations (circles, arrows, text callouts). Markup saved as an overlay on the drawing.
- **Spec Reference:** Link RFI to specific specification sections (e.g., "Section 06 10 00 — Rough Carpentry, 3.2.B").
- **Photo Attachment:** Attach field photos directly from mobile device camera. Photos tagged with GPS coordinates and timestamp.
- **RFI Templates:** Pre-built templates by trade (e.g., "Confirm header size," "Clarify finish material at location," "Resolve MEP conflict"). Templates include pre-filled fields that the user customizes.
- **Draft Mode:** RFIs can be saved as drafts for review before submission. Configurable: some builders require PM review before RFI goes to architect.
- **Numbering:** Auto-generated per builder's configured scheme. Examples: sequential (RFI-001), project-prefixed (2026-SMITH-RFI-001), trade-prefixed (ELEC-RFI-003).

### 27.2 Routing to Architect/Engineer/Owner

Configurable routing rules that get RFIs to the right person with the right urgency.

- **Default Routing Rules:** Builder configures default routing by RFI type or trade. Example: structural questions route to structural engineer; finish questions route to architect; owner preference questions route to client.
- **Distribution Lists:** Each RFI has a primary respondent (ball-in-court) and CC recipients. Configurable per builder.
- **External Recipients:** Route RFIs to external parties (architects, engineers, consultants) via email with a portal link for response. External parties do not need a full account — they get a secure response link.
- **Internal Review:** Configurable internal review step before external distribution. PM reviews field-created RFI before it goes to the architect.
- **Escalation Path:** If no response within configurable SLA, escalate to next level. Example: 3 days to architect, then auto-CC builder principal.
- **Forwarding:** Recipients can forward to another party with notes. Full routing history maintained.

### 27.3 Response Tracking with Deadlines

Track every RFI from creation to resolution with configurable SLAs and accountability.

- **SLA Configuration:** Builder sets default response SLA by RFI priority (critical: 24 hours, urgent: 3 days, standard: 7 days, low: 14 days). Overridable per RFI.
- **Ball-in-Court Tracking:** System always knows who is responsible for the next action. Dashboard shows "Your Action Required" for each user.
- **Status Workflow:** Draft -> Submitted -> Under Review -> Response Received -> Accepted / Rejected -> Closed. Configurable status names per builder.
- **Overdue Alerts:** Automated notifications at configurable intervals (1 day before due, on due date, 1 day overdue, 3 days overdue). Escalation after configurable overdue threshold.
- **Response Logging:** Responses captured with full text, attachments, and responder identity. Multiple responses supported (back-and-forth clarification).
- **Days Open Tracking:** Automatic calculation of days open, with optional "clock stop" for periods when additional information is requested from the submitter.

### 27.4 Cost and Schedule Impact Assessment

Link RFIs to their financial and schedule consequences.

- **Impact Assessment Fields:** Each RFI can include: estimated cost impact (positive/negative), estimated schedule impact (days of delay/acceleration), affected trades, affected schedule tasks.
- **Change Order Linkage:** When an RFI results in a scope change, create a change order directly from the RFI. CO references the originating RFI.
- **Schedule Linkage:** Link RFI to affected schedule tasks. If RFI resolution delays a task, the schedule impact auto-populates.
- **Cumulative Impact Dashboard:** Roll up all RFI cost and schedule impacts per project. "RFIs have added $47,200 and 12 days to this project."
- **No-Impact Tracking:** Explicitly track RFIs with no cost/schedule impact for the record. "Clarification only — no impact."

### 27.5 RFI Log and Reporting

Comprehensive RFI log with filtering, export, and analytics.

- **RFI Log:** Filterable list showing all project RFIs with: number, subject, status, priority, ball-in-court, date submitted, date due, date closed, days open, cost impact, schedule impact.
- **Filters:** By status, priority, trade, assigned to, date range, has cost impact, overdue only.
- **Export:** Export RFI log to PDF and Excel. PDF format suitable for owner/architect distribution.
- **Analytics:** RFI metrics per project: total count, average response time, overdue percentage, cost impact total, by-trade breakdown. Cross-project analytics for builder-level insights.
- **AI Insights:** "This project has 3x more electrical RFIs than similar projects — possible design quality issue."

---

## Database Tables

### rfis
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders (multi-tenant) |
| project_id | uuid | FK to projects |
| rfi_number | varchar(50) | Auto-generated per builder config |
| subject | varchar(300) | RFI subject line |
| question | text | Full RFI question (rich text/HTML) |
| priority | varchar(20) | critical, urgent, standard, low |
| status | varchar(30) | draft, submitted, under_review, response_received, accepted, rejected, closed |
| trade_category | varchar(100) | Related trade |
| spec_reference | varchar(200) | Specification section reference |
| plan_sheet_id | uuid | FK to documents (drawing sheet) |
| plan_markup | jsonb | Markup overlay data (pins, annotations) |
| submitted_by | uuid | FK to users |
| submitted_at | timestamptz | When submitted |
| due_date | timestamptz | Response due date |
| closed_at | timestamptz | When closed |
| days_open | integer | Calculated days open |
| cost_impact | decimal(12,2) | Estimated cost impact (nullable) |
| schedule_impact_days | integer | Estimated schedule impact (nullable) |
| change_order_id | uuid | FK to change_orders (nullable) |
| resolution_notes | text | Final resolution summary |
| resolution_satisfactory | boolean | Was resolution acceptable? |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last modification |

### rfi_routing
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| rfi_id | uuid | FK to rfis |
| builder_id | uuid | FK to builders |
| recipient_type | varchar(20) | primary, cc, escalation |
| recipient_user_id | uuid | FK to users (nullable, for internal) |
| recipient_email | varchar(255) | Email for external recipients |
| recipient_name | varchar(200) | Display name |
| recipient_role | varchar(100) | architect, engineer, owner, consultant |
| ball_in_court | boolean | Is this person currently responsible? |
| routed_at | timestamptz | When routed to this person |
| viewed_at | timestamptz | When recipient first viewed |
| responded_at | timestamptz | When recipient responded |
| forwarded_to | uuid | FK to rfi_routing if forwarded |

### rfi_responses
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| rfi_id | uuid | FK to rfis |
| builder_id | uuid | FK to builders |
| responder_user_id | uuid | FK to users (nullable) |
| responder_email | varchar(255) | For external responders |
| responder_name | varchar(200) | Display name |
| response_text | text | Response body (rich text/HTML) |
| attachments | jsonb | Array of document references |
| response_type | varchar(30) | answer, clarification_request, partial, forward |
| created_at | timestamptz | Response timestamp |

### rfi_templates
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders (nullable for platform defaults) |
| name | varchar(200) | Template name |
| trade_category | varchar(100) | Trade |
| subject_template | varchar(300) | Pre-filled subject |
| question_template | text | Pre-filled question body |
| default_priority | varchar(20) | Default priority |
| default_routing | jsonb | Default routing rules |
| usage_count | integer | Times used (for ranking) |
| created_at | timestamptz | Record creation |

### rfi_numbering_config
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders |
| pattern | varchar(100) | Numbering pattern (e.g., "{PROJECT}-RFI-{SEQ:3}") |
| next_sequence | jsonb | Per-project sequence counters |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last modification |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v2/projects/:id/rfis | Create a new RFI |
| GET | /api/v2/projects/:id/rfis | List RFIs with filters |
| GET | /api/v2/rfis/:id | Get RFI detail |
| PUT | /api/v2/rfis/:id | Update RFI |
| POST | /api/v2/rfis/:id/submit | Submit draft RFI for routing |
| POST | /api/v2/rfis/:id/route | Route or re-route an RFI |
| POST | /api/v2/rfis/:id/responses | Add a response to an RFI |
| PUT | /api/v2/rfis/:id/status | Update RFI status (accept/reject/close) |
| POST | /api/v2/rfis/:id/create-co | Create change order from RFI |
| GET | /api/v2/projects/:id/rfis/log | Get formatted RFI log for export |
| GET | /api/v2/projects/:id/rfis/analytics | Get RFI analytics for project |
| GET | /api/v2/rfis/my-action-required | Get all RFIs where current user has the ball |
| GET | /api/v2/rfi-templates | List RFI templates |
| POST | /api/v2/rfi-templates | Create RFI template |
| GET | /api/v2/rfis/:id/external/:token | External response link (no auth required, token-based) |
| POST | /api/v2/rfis/:id/external/:token/respond | External party submits response |

---

## UI Components

- **RFI Creation Form** — Rich form with text editor, plan markup tool, photo upload, template selector, and routing configuration.
- **Plan Markup Viewer** — Drawing viewer with pin-drop and annotation tools. Displays all RFI pins on a drawing sheet.
- **RFI Log Table** — Filterable, sortable table with inline status indicators, days-open badges, and overdue highlighting.
- **Ball-in-Court Dashboard** — User-centric view showing "My Action Required" RFIs with priority and due date sorting.
- **Response Thread** — Threaded conversation view showing all responses, clarifications, and routing history for an RFI.
- **Impact Summary Panel** — Per-RFI and per-project cumulative cost and schedule impact display.
- **RFI Analytics Dashboard** — Charts: RFIs by status, average response time trend, by-trade distribution, overdue rate, cost impact waterfall.
- **External Response Page** — Minimal, branded page that external parties (architects, engineers) use to respond via secure token link.
- **RFI Template Manager** — CRUD interface for managing RFI templates by trade with usage statistics.

---

## Dependencies

- **Module 3: Core Data Model** — Project context and phase information
- **Module 6: Document Storage** — Drawing sheets for markup, attachment storage
- **Module 5: Notification Engine** — Routing notifications, overdue alerts, escalation emails
- **Module 10: Contact/Vendor Management** — External party directory for routing
- **Module 17: Change Orders** — CO creation from RFI when scope change is identified
- **Module 7: Scheduling** — Schedule task linkage for impact assessment

---

## Open Questions

1. Should external parties (architects, engineers) be able to create RFIs, or only respond to them? (Proposed: respond only in Phase 1.)
2. How do we handle RFIs that span multiple trades or drawing sheets? (Proposed: allow multiple plan markups per RFI.)
3. What is the data retention requirement for closed RFIs? (Proposed: permanent — they are legal documents.)
4. Should AI auto-suggest responses by finding similar resolved RFIs across the builder's project history?
5. How do we handle RFIs on projects where there is no architect on record? (Direct to owner or builder principal?)
6. Should the system support "informational RFIs" that are not questions but rather notifications of field conditions?
7. What is the maximum attachment size per RFI? (Proposed: 50MB total per RFI, 25MB per individual file.)
