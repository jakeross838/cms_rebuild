# Module 29: Full Client Portal

**Phase:** 5 - Full Platform
**Status:** TODO
**Priority:** High (premium differentiator, client-facing)

---

## Overview

Comprehensive client-facing portal providing real-time project visibility, financial transparency, selection management, approval workflows with e-signature, curated photo galleries, messaging, document access, and warranty request submission. The portal is fully branded per builder (white-labeled) and configurable so each builder controls exactly what their clients see. This module extends the basic client portal (Module 12) into a premium experience that becomes a competitive differentiator for builders.

---

## Gap Items Addressed

| Gap # | Description | Coverage |
|-------|-------------|----------|
| 421 | Client portal must be fully branded per builder (customizable layout) | White-label engine with logo, colors, fonts, layout configuration |
| 422 | Client portal content control (builder decides what client sees) | Granular permission matrix: per-module, per-project, per-data-type |
| 423 | Client portal for different project stages (precon, construction, warranty) | Stage-aware portal that adapts content based on project phase |
| 424 | Client portal notifications (configurable triggers) | Builder-configurable notification rules for client-facing events |
| 425 | Client approval workflows (selections, COs, draws — e-signature) | Multi-type approval engine with e-signature integration |
| 426 | Client photo gallery (curated progress photos, not raw daily log) | Curated gallery with builder-selected photos, not raw field photos |
| 427 | Client document access (configurable per builder) | Document visibility rules: auto-share, manual share, or hidden |
| 428 | Client messaging (in-portal vs. email vs. text — configurable) | Unified messaging with channel preference per builder/client |
| 429 | Logging external communication (client calls/texts instead of portal) | External communication logging for non-portal interactions |
| 430 | Client portal analytics (login frequency, feature usage, engagement) | Client engagement analytics dashboard for builder |
| 465 | Warranty as optional module | Warranty section in portal only visible when warranty module enabled |
| 466 | Warranty terms configurable per builder | Warranty request form respects builder's warranty term configuration |
| 467 | Warranty service request routing (builder-configurable) | Warranty requests route per builder's configured workflow |

---

## Detailed Requirements

### 29.1 Approval Workflows with E-Signature

Enable clients to review and approve selections, change orders, and draw requests directly in the portal.

- **Selection Approvals:** Client reviews pending selections (e.g., countertop material, light fixtures, flooring) with photos, specs, and pricing. Approve or request changes with comments.
- **Change Order Approvals:** Client reviews change order detail: scope description, cost impact, schedule impact. Approve with e-signature or reject with reason.
- **Draw/Payment Approvals:** Client reviews draw request with progress photos and line-item breakdown. Approve to authorize payment release.
- **E-Signature Integration:** Legal e-signature capture (typed name, drawn signature, or third-party integration like DocuSign/HelloSign). Signatures stored with timestamp, IP address, and document hash.
- **Approval History:** Complete audit trail of all approvals with timestamps, signatures, and any comments.
- **Batch Approvals:** Allow clients to approve multiple pending selections in a single session.
- **Configurable Approval Types:** Builder configures which items require client approval and which are informational only.

### 29.2 Selection Management Interface

Client-facing selection browsing, comparing, and approval experience.

- **Selection Dashboard:** All pending, approved, and available selections organized by category (flooring, lighting, plumbing fixtures, appliances, etc.).
- **Product Catalog:** Browse available options with photos, descriptions, specifications, and pricing. Allowance tracking: "Your budget for this category is $X. This selection costs $Y. Difference: +/-$Z."
- **Comparison View:** Side-by-side comparison of 2-3 options within a category.
- **Deadline Tracking:** Selections with deadlines show countdown. Overdue selections highlighted with impact warning.
- **Selection Mood Board:** Optional visual board where clients can save favorites before making final decisions.

### 29.3 Real-Time Budget and Schedule Visibility

Configurable financial and schedule transparency.

- **Budget Dashboard:** Client sees a builder-configured view of project finances. Configurable levels: (a) total contract amount only, (b) category-level breakdown, (c) line-item detail, (d) full cost-plus transparency.
- **Change Order Impact:** Visual tracker showing original contract, approved change orders, and current contract total.
- **Payment/Draw Schedule:** Timeline of past and upcoming payment milestones. Each draw shows: amount, date, status (requested, approved, paid).
- **Schedule Dashboard:** Simplified milestone view (not the full 500-task Gantt). Shows phase completion percentages, upcoming milestones, projected completion date.
- **Progress Indicator:** Overall project progress bar with phase-level breakdown.
- **Builder Controls:** Builder configures exactly which financial data points are visible to clients. Some builders want full transparency; others share only totals.

### 29.4 Photo Gallery

Curated progress photo experience for clients.

- **Curated Gallery:** Builder selects which photos from daily logs are "client-visible." Raw construction mess photos are filtered out.
- **Timeline View:** Photos organized chronologically with milestone markers. Clients can scrub through the build timeline.
- **Category Organization:** Photos tagged by phase, trade, or room. Clients can filter by category.
- **Before/After:** Automatically pair photos of the same area taken at different phases for dramatic before/after comparisons.
- **Download/Share:** Clients can download individual photos or entire galleries. Share links for family/friends to view.
- **Video Support:** Support video uploads (walkthrough videos, drone footage) alongside photos.
- **Notifications:** Client notified when new photos are added to their gallery.

### 29.5 Messaging and Communication

Centralized communication hub keeping all project communication in one place.

- **In-Portal Messaging:** Threaded messaging between client and builder team. Builder controls which team members participate.
- **Topic Threads:** Messages organized by topic (general, selections, change orders, schedule, etc.).
- **Notification Channels:** Configurable per builder and per client: in-portal only, in-portal + email, in-portal + email + SMS.
- **External Communication Logging:** When communication happens outside the portal (phone call, text message), team members can log a summary in the portal for the record.
- **Response Time Tracking:** Track builder response time to client messages. SLA alerting for unanswered messages.
- **Meeting Notes:** Post meeting summaries and decision logs to the portal. Client can acknowledge receipt.

### 29.6 Document Access

Controlled document sharing between builder and client.

- **Document Categories:** Contracts, permits, plans/drawings, specifications, inspection reports, warranty documents, insurance certificates, closing documents.
- **Visibility Rules:** Per builder configuration: auto-share (all documents of this type visible to client), manual share (team member chooses per document), or hidden (never visible to client).
- **Upload for Client:** Certain document types allow client upload (e.g., lot survey, HOA guidelines, insurance proof).
- **Version Control:** When a document is updated, client sees the latest version with "Updated" indicator.
- **Download and Print:** All shared documents downloadable. Print-friendly formatting for contracts and reports.

### 29.7 Warranty Request Submission

Post-closeout service request portal for warranty items.

- **Warranty Dashboard:** After closeout, the portal transitions to warranty mode. Shows warranty coverage terms, expiration dates by category.
- **Service Request Form:** Client submits warranty request with: category (plumbing, electrical, structural, cosmetic), description, photos, urgency level.
- **Request Tracking:** Client sees status of each warranty request: submitted, acknowledged, scheduled, in-progress, completed.
- **Scheduling:** Builder can offer available service windows; client selects preferred time.
- **History:** Full history of all warranty requests with resolution details.

### 29.8 Builder Branding

Each builder's client portal reflects their unique brand.

- **Logo and Colors:** Builder uploads logo and selects primary/secondary colors. All portal pages branded accordingly.
- **Custom Domain:** Optional custom domain (e.g., portal.rossbuilt.com) via CNAME configuration.
- **Welcome Message:** Configurable welcome message and builder contact information on login page.
- **Email Templates:** Client-facing emails use builder's branding, not platform branding.
- **Footer/Legal:** Builder configures footer text, privacy policy link, and terms of service.

---

## Database Tables

### client_portal_config
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders (multi-tenant) |
| branding | jsonb | Logo URL, colors, fonts, welcome message |
| custom_domain | varchar(200) | Custom portal domain (nullable) |
| feature_flags | jsonb | Which portal features are enabled |
| visibility_rules | jsonb | Per-module/data-type visibility configuration |
| notification_rules | jsonb | Which events trigger client notifications |
| approval_config | jsonb | Which item types require client approval |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last modification |

### client_approvals
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders |
| project_id | uuid | FK to projects |
| client_user_id | uuid | FK to users |
| approval_type | varchar(30) | selection, change_order, draw_request |
| reference_id | uuid | FK to the item being approved |
| status | varchar(20) | pending, approved, rejected, expired |
| requested_at | timestamptz | When approval was requested |
| responded_at | timestamptz | When client responded |
| signature_data | text | E-signature data (nullable) |
| signature_ip | varchar(45) | IP at time of signature |
| signature_hash | varchar(64) | Document hash at time of signature |
| comments | text | Client comments |
| created_at | timestamptz | Record creation |

### client_messages
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders |
| project_id | uuid | FK to projects |
| thread_id | uuid | FK to client_message_threads |
| sender_user_id | uuid | FK to users |
| sender_type | varchar(20) | client, builder_team |
| message_text | text | Message content |
| attachments | jsonb | Array of attachment references |
| is_external_log | boolean | Was this logged from external communication |
| external_channel | varchar(20) | phone, text, email (if external) |
| read_at | timestamptz | When recipient read the message |
| created_at | timestamptz | Record creation |

### client_message_threads
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders |
| project_id | uuid | FK to projects |
| topic | varchar(200) | Thread topic |
| category | varchar(50) | general, selections, change_orders, schedule, etc. |
| status | varchar(20) | active, archived |
| last_message_at | timestamptz | Timestamp of most recent message |
| created_at | timestamptz | Record creation |

### client_gallery_photos
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders |
| project_id | uuid | FK to projects |
| source_photo_id | uuid | FK to original photo in daily logs/photos module |
| caption | varchar(500) | Builder-written caption |
| category | varchar(100) | Phase, trade, or room tag |
| sort_order | integer | Display order within category |
| published_at | timestamptz | When made visible to client |
| published_by | uuid | FK to users |
| created_at | timestamptz | Record creation |

### warranty_requests
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders |
| project_id | uuid | FK to projects |
| client_user_id | uuid | FK to users |
| request_number | varchar(50) | Auto-generated |
| category | varchar(100) | Warranty category |
| description | text | Issue description |
| urgency | varchar(20) | emergency, urgent, standard |
| photos | jsonb | Array of photo references |
| status | varchar(30) | submitted, acknowledged, scheduled, in_progress, completed, closed |
| scheduled_date | timestamptz | Service appointment date |
| resolution_notes | text | How it was resolved |
| resolved_at | timestamptz | Resolution date |
| assigned_vendor_id | uuid | FK to vendors (nullable) |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last modification |

### client_engagement_analytics
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders |
| project_id | uuid | FK to projects |
| client_user_id | uuid | FK to users |
| event_type | varchar(50) | login, page_view, approval, message, photo_view, document_download |
| event_data | jsonb | Additional event context |
| created_at | timestamptz | Event timestamp |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v2/portal/config | Get portal branding and feature config |
| PUT | /api/v2/portal/config | Update portal configuration |
| GET | /api/v2/portal/projects/:id/dashboard | Get client dashboard data |
| GET | /api/v2/portal/projects/:id/budget | Get client-visible budget data |
| GET | /api/v2/portal/projects/:id/schedule | Get client-visible schedule milestones |
| GET | /api/v2/portal/projects/:id/approvals | Get pending approvals |
| POST | /api/v2/portal/approvals/:id/respond | Approve or reject with e-signature |
| GET | /api/v2/portal/projects/:id/selections | Get selections for client review |
| POST | /api/v2/portal/selections/:id/approve | Approve a selection |
| GET | /api/v2/portal/projects/:id/photos | Get curated photo gallery |
| GET | /api/v2/portal/projects/:id/documents | Get client-visible documents |
| POST | /api/v2/portal/projects/:id/documents | Client uploads a document |
| GET | /api/v2/portal/projects/:id/messages | Get message threads |
| POST | /api/v2/portal/projects/:id/messages | Send a message |
| POST | /api/v2/portal/projects/:id/messages/external-log | Log external communication |
| GET | /api/v2/portal/projects/:id/warranty | Get warranty dashboard |
| POST | /api/v2/portal/projects/:id/warranty/requests | Submit warranty request |
| GET | /api/v2/portal/projects/:id/warranty/requests | List warranty requests |
| POST | /api/v2/portal/projects/:id/punch-items | Client submits punch item |
| GET | /api/v2/portal/projects/:id/punch-items | Client views their punch items |
| GET | /api/v2/analytics/client-engagement/:projectId | Builder views client engagement data |
| POST | /api/v2/portal/projects/:id/photos/publish | Publish photos to client gallery |

---

## UI Components

- **Branded Login Page** — Builder-branded login with logo, colors, and welcome message.
- **Client Dashboard** — Overview with: progress bar, next milestone, pending approvals count, unread messages, recent photos.
- **Budget Viewer** — Configurable financial summary: contract total, change orders, payments made, balance remaining. Detail level per builder config.
- **Schedule Timeline** — Simplified milestone timeline with phase completion indicators and projected completion date.
- **Approval Center** — List of pending approvals with type indicators. Each opens a detail view with approve/reject buttons and e-signature capture.
- **Selection Gallery** — Visual grid of selection categories with pending/approved badges. Each category opens product options with comparison capability.
- **Photo Gallery** — Filterable photo grid with timeline scrubber. Lightbox view with navigation. Before/after pair display.
- **Message Center** — Threaded messaging interface with topic organization, attachment support, and read receipts.
- **Document Library** — Categorized document list with download buttons, version indicators, and upload capability for client documents.
- **Warranty Portal** — Post-closeout view with warranty terms, service request form with photo upload, and request status tracker.
- **Client Engagement Dashboard** — Builder-facing analytics: login frequency, page views by section, approval response times, message activity.

---

## Dependencies

- **Module 12: Basic Client Portal** — Foundation authentication and basic project view
- **Module 21: Selection Management** — Selection data and approval workflow
- **Module 17: Change Orders** — Change order data for approval workflow
- **Module 6: Document Storage** — Document sharing and photo storage
- **Module 5: Notification Engine** — Client notification delivery
- **Module 28: Punch List** — Client punch item submission
- **Module 27: Warranty & Home Care** — Warranty request handling (when enabled)
- **Module 4: White-Labeling** — Branding engine for per-builder customization

---

## Open Questions

1. Should the client portal be a separate SPA/app or a route within the main application? (Proposed: separate SPA for cleaner branding and lighter bundle.)
2. Is native mobile app required for clients, or is mobile-responsive web sufficient? (Proposed: responsive web for Phase 1, native app later.)
3. How do we handle multi-signer approvals? (e.g., both spouses must approve a change order.)
4. What is the legal validity of in-platform e-signatures? (May need DocuSign/HelloSign integration for high-value approvals.)
5. Should clients have the ability to invite other family members with view-only access?
6. How do we handle the transition from construction portal to warranty portal at project closeout?
7. What analytics data is GDPR/CCPA compliant to collect about client portal usage?
8. Should the portal support real-time video calling between client and builder? (Proposed: out of scope, use external tools.)
