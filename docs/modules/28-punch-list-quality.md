# Module 28: Punch List & Quality Checklists

**Phase:** 4 - Intelligence
**Status:** TODO
**Priority:** High (essential field/closeout workflow)

---

## Overview

Digital punch list management and quality inspection system covering the entire quality lifecycle from in-progress quality gates through final closeout punch resolution. Enables photo-documented punch items pinned to floor plan locations, vendor assignment with notification workflows, completion verification, trade-specific quality checklists, and warranty linkage for unresolved items. This module is a primary field tool used daily by superintendents, PMs, vendors, and clients.

---

## Gap Items Addressed

| Gap # | Description | Coverage |
|-------|-------------|----------|
| 411 | Punch list categories must be configurable (by room, trade, severity) | Multi-dimensional categorization: room/area, trade, severity, type |
| 412 | Punch list templates by project type (renovation vs. new construction) | Template library by project type and phase |
| 413 | Punch list assignment workflows (assign to vendor, vendor completes, builder verifies) | Full workflow engine: assign -> complete -> verify -> close |
| 414 | Punch list SLAs (must be resolved within X days — configurable) | Configurable SLAs by priority with escalation |
| 415 | Pre-punch / quality checklists during construction (ongoing quality gates) | Phase-based quality inspection checklists, not just final punch |
| 416 | Punch list integration with warranty (unresolved punch -> warranty item) | Automatic warranty item creation for items open at closeout |
| 417 | Punch list photo requirements (before, after, verification photos) | Mandatory photo stages: issue, repair, verification |
| 418 | Client punch list submission (client walks through and submits items via portal) | Client portal punch submission with guided interface |
| 419 | Vendor self-inspection checklists (vendor checks own work before requesting inspection) | Vendor self-inspection checklists required before builder inspection |
| 420 | Punch list cost tracking (who pays for each fix? back-charge to responsible vendor?) | Cost assignment and back-charge tracking per item |

---

## Detailed Requirements

### 28.1 Photo-Documented Punch Items

Every punch item is supported by photographic evidence through its entire lifecycle.

- **Issue Photo (Required):** At least one photo required when creating a punch item. Photo captured directly from mobile device with automatic GPS coordinates and timestamp metadata.
- **Annotation Tools:** Draw on photos to circle, arrow, or highlight the specific issue. Annotations saved as overlays.
- **Repair Photo (Required):** Vendor uploads photo showing completed repair. System validates that a photo was attached before allowing status change to "Completed."
- **Verification Photo (Optional/Configurable):** Builder or inspector takes verification photo confirming acceptable repair. Configurable: some builders require verification photos, others accept vendor photo as sufficient.
- **Photo Gallery:** Each punch item has a chronological photo gallery showing issue -> repair -> verification progression.
- **Batch Photo Upload:** Upload multiple photos and assign each to an existing or new punch item. Efficient for post-walkthrough processing.

### 28.2 Location Tagging on Floor Plans

Pin punch items to exact locations on floor plans for precise communication.

- **Floor Plan Integration:** Upload floor plans (PDF, image) per level/area of the project. Plans stored in Document Storage (Module 6).
- **Pin Drop:** Tap on floor plan to drop a pin at the exact location of the punch item. Pin color-coded by status (red = open, yellow = in progress, green = completed, blue = verified).
- **Cluster View:** When many pins overlap, cluster into a count badge that expands on zoom.
- **Room/Area Tagging:** Associate punch items with named rooms/areas (e.g., "Master Bathroom," "Kitchen," "Garage"). Room definitions configurable per project or from template.
- **Multi-Floor Navigation:** Swipe or tab between floor levels with pin counts per level.
- **Filtered Plan View:** Filter pins on floor plan by trade, status, vendor, priority, or date range.

### 28.3 Vendor Assignment and Notification

Route punch items to responsible vendors with clear accountability and notification.

- **Direct Assignment:** Assign punch item to a specific vendor. System identifies the original vendor for that scope from contract/PO data where possible.
- **Batch Assignment:** Select multiple punch items and assign to a vendor in bulk. Common for assigning all items in a trade after a walkthrough.
- **Notification on Assignment:** Vendor receives notification (email + push + portal) with punch item details, photos, location, and due date.
- **Vendor Acknowledgment:** Vendor acknowledges receipt and commits to a resolution date. Configurable: some builders require acknowledgment, others do not.
- **Vendor Portal View:** Vendors see their assigned punch items in their portal, filterable by project and status. Each item shows photos, location, and scope description.
- **Reassignment:** If vendor is unresponsive, reassign to a different vendor with full audit trail and back-charge notation.

### 28.4 Completion Verification Workflow

Multi-step workflow ensuring quality repairs are properly verified.

- **Status Workflow:** Open -> Assigned -> In Progress -> Completed (vendor) -> Verified (builder) -> Closed. Configurable status names per builder.
- **Vendor Self-Completion:** Vendor marks item as completed with required repair photo and optional notes.
- **Builder Verification:** Builder/superintendent verifies the repair on-site. Can accept (-> Closed) or reject (-> Assigned, with rejection reason and photo).
- **Rejection Loop:** Rejected items return to the vendor with rejection reason. Track rejection count per item. Configurable escalation after N rejections.
- **Bulk Verification:** During a walkthrough, verify multiple items in sequence with swipe-through interface.
- **Sign-Off:** Final sign-off by PM or superintendent when all punch items on a project (or section) are closed. Digital signature with timestamp.

### 28.5 Quality Checklists by Trade and Phase

Proactive quality inspections throughout construction, not just final punch.

- **Checklist Templates:** Builder creates checklist templates by trade (framing, plumbing, electrical, drywall, paint, etc.) and by phase (rough-in, trim, final).
- **Configurable Items:** Each checklist contains items with: description, acceptance criteria, pass/fail/N-A options, photo requirement (optional or mandatory), notes field.
- **Phase-Based Triggers:** Checklists can be auto-assigned when a schedule task reaches a certain status. Example: "Framing rough inspection checklist" assigned when framing task marked complete.
- **Inspector Assignment:** Checklists assigned to specific inspectors (superintendent, PM, third-party inspector).
- **Deficiency Auto-Creation:** Failed checklist items automatically generate punch list items with the checklist reference. Pre-populated with trade, location, and deficiency description.
- **Vendor Self-Inspection:** Before requesting builder inspection, vendor completes a self-inspection checklist. Builder sees vendor's self-assessment alongside their own inspection.
- **Historical Analytics:** Track pass rates by trade, by vendor, by inspector over time. Feed into vendor scoring (Module 22).

### 28.6 Warranty Linkage

Seamless transition of unresolved items from construction to warranty.

- **Auto-Warranty Conversion:** At project closeout, any punch items still open beyond a configurable grace period automatically convert to warranty items.
- **Warranty Categorization:** Upon conversion, items are categorized by warranty type (builder 1-year, structural 10-year, manufacturer, etc.) based on trade and scope.
- **Warranty Item Tracking:** Converted items carry their full history (photos, assignment, attempts) into the warranty module.
- **Client Warranty Submission:** Clients can submit new warranty items through the client portal post-closeout. These follow the same photo-documented, assigned, verified workflow.
- **Warranty Reserve Impact:** Punch items marked as "builder responsibility" (not vendor back-charge) draw from warranty reserve budget.

### 28.7 Cost Tracking and Back-Charges

Track the financial impact of every punch item.

- **Responsibility Assignment:** Each punch item records who is financially responsible: vendor (back-charge), builder (warranty), subcontractor (contractual), or shared.
- **Back-Charge Creation:** Generate back-charge records from punch items, deductible from vendor payments. Link to invoicing module.
- **Cost Estimation:** Estimate repair cost per item for items requiring outside correction. Track estimated vs. actual cost.
- **Cumulative Reporting:** Per-project and per-vendor cost of quality reports. "Vendor X's punch items cost $12,400 to resolve on this project."
- **Vendor Score Impact:** Punch item count, severity, and cost feed into vendor performance scoring.

---

## Database Tables

### punch_items
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders (multi-tenant) |
| project_id | uuid | FK to projects |
| item_number | varchar(50) | Auto-generated per builder config |
| title | varchar(300) | Short description |
| description | text | Detailed description |
| status | varchar(30) | open, assigned, in_progress, completed, verified, closed, rejected, warranty |
| priority | varchar(20) | critical, high, medium, low, cosmetic |
| category | varchar(100) | Builder-configurable category |
| trade | varchar(100) | Trade responsible |
| room_area | varchar(100) | Room or area name |
| floor_level | varchar(50) | Floor level |
| floor_plan_id | uuid | FK to documents (floor plan) |
| pin_location | jsonb | {x, y} coordinates on floor plan |
| assigned_vendor_id | uuid | FK to vendors (nullable) |
| assigned_at | timestamptz | When assigned to vendor |
| due_date | timestamptz | Resolution due date |
| completed_at | timestamptz | When vendor marked complete |
| verified_at | timestamptz | When builder verified |
| verified_by | uuid | FK to users |
| closed_at | timestamptz | When closed |
| rejection_count | integer | Number of times rejected |
| last_rejection_reason | text | Most recent rejection reason |
| cost_responsibility | varchar(30) | vendor_backcharge, builder_warranty, shared, none |
| estimated_cost | decimal(10,2) | Estimated repair cost |
| actual_cost | decimal(10,2) | Actual repair cost |
| backcharge_id | uuid | FK to backcharges (nullable) |
| warranty_item_id | uuid | FK to warranty_items (nullable) |
| checklist_item_id | uuid | FK to quality_checklist_items (nullable) |
| source | varchar(30) | walkthrough, checklist, client_portal, daily_log |
| created_by | uuid | FK to users |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last modification |

### punch_item_photos
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| punch_item_id | uuid | FK to punch_items |
| builder_id | uuid | FK to builders |
| photo_stage | varchar(20) | issue, repair, verification, rejection |
| file_url | varchar(500) | Storage URL |
| thumbnail_url | varchar(500) | Thumbnail URL |
| annotations | jsonb | Drawing overlay data |
| gps_latitude | decimal(10,7) | GPS latitude |
| gps_longitude | decimal(10,7) | GPS longitude |
| captured_at | timestamptz | When photo was taken |
| uploaded_by | uuid | FK to users |
| created_at | timestamptz | Record creation |

### quality_checklists
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders |
| project_id | uuid | FK to projects |
| template_id | uuid | FK to quality_checklist_templates |
| name | varchar(200) | Checklist name |
| trade | varchar(100) | Trade |
| phase | varchar(100) | Construction phase |
| room_area | varchar(100) | Room or area (nullable) |
| assigned_to | uuid | FK to users (inspector) |
| status | varchar(30) | pending, in_progress, passed, failed, passed_with_deficiencies |
| started_at | timestamptz | When inspection started |
| completed_at | timestamptz | When inspection finished |
| signed_off_by | uuid | FK to users |
| signed_off_at | timestamptz | Sign-off timestamp |
| deficiency_count | integer | Number of failed items |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last modification |

### quality_checklist_items
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| checklist_id | uuid | FK to quality_checklists |
| builder_id | uuid | FK to builders |
| sort_order | integer | Display order |
| description | varchar(500) | Item description |
| acceptance_criteria | text | What constitutes passing |
| result | varchar(10) | pass, fail, na, null (not yet inspected) |
| photo_required | boolean | Whether photo is mandatory |
| photo_url | varchar(500) | Inspection photo URL (nullable) |
| notes | text | Inspector notes |
| punch_item_id | uuid | FK to punch_items (if deficiency auto-created) |
| inspected_at | timestamptz | When item was inspected |

### quality_checklist_templates
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders |
| name | varchar(200) | Template name |
| trade | varchar(100) | Trade |
| phase | varchar(100) | Construction phase |
| project_type | varchar(50) | new_construction, renovation, etc. |
| items | jsonb | Array of template items |
| auto_trigger_task_status | varchar(50) | Schedule task status that triggers this checklist (nullable) |
| is_vendor_self_inspection | boolean | Whether this is a vendor self-inspection template |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last modification |

### punch_list_signoffs
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders |
| project_id | uuid | FK to projects |
| scope | varchar(50) | full_project, section, room, trade |
| scope_value | varchar(200) | Which section/room/trade |
| total_items | integer | Total items in scope |
| closed_items | integer | Closed items at time of signoff |
| signed_by | uuid | FK to users |
| signature_data | text | Digital signature data |
| signed_at | timestamptz | Signoff timestamp |
| notes | text | Signoff notes |
| created_at | timestamptz | Record creation |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v2/projects/:id/punch-items | Create a punch item |
| GET | /api/v2/projects/:id/punch-items | List punch items with filters |
| GET | /api/v2/punch-items/:id | Get punch item detail |
| PUT | /api/v2/punch-items/:id | Update a punch item |
| POST | /api/v2/punch-items/:id/assign | Assign to vendor |
| POST | /api/v2/punch-items/:id/complete | Vendor marks complete (with photo) |
| POST | /api/v2/punch-items/:id/verify | Builder verifies (accept or reject) |
| POST | /api/v2/punch-items/:id/photos | Upload photo to punch item |
| POST | /api/v2/punch-items/batch-assign | Batch assign items to vendor |
| POST | /api/v2/punch-items/batch-verify | Batch verify items |
| GET | /api/v2/projects/:id/punch-items/floor-plan/:planId | Get items pinned to a floor plan |
| GET | /api/v2/projects/:id/punch-items/summary | Get punch list summary statistics |
| POST | /api/v2/projects/:id/punch-items/signoff | Sign off on punch list scope |
| POST | /api/v2/projects/:id/quality-checklists | Create a quality checklist |
| GET | /api/v2/projects/:id/quality-checklists | List quality checklists |
| GET | /api/v2/quality-checklists/:id | Get checklist detail |
| PUT | /api/v2/quality-checklists/:id/items/:itemId | Update checklist item result |
| POST | /api/v2/quality-checklists/:id/complete | Complete checklist inspection |
| GET | /api/v2/quality-checklist-templates | List checklist templates |
| POST | /api/v2/quality-checklist-templates | Create checklist template |
| GET | /api/v2/vendors/:id/punch-items | Vendor's assigned punch items |
| POST | /api/v2/projects/:id/punch-items/client-submit | Client submits punch item via portal |
| GET | /api/v2/projects/:id/punch-items/cost-report | Punch list cost/back-charge report |

---

## UI Components

- **Punch List Dashboard** — Project-level summary: items by status pie chart, items by trade bar chart, aging report, overdue count.
- **Floor Plan Viewer** — Interactive floor plan with color-coded pins. Tap pin to see item detail. Filter pins by status/trade/vendor.
- **Punch Item Card** — Detailed card view with photo gallery (issue/repair/verification), status timeline, assignment history, and cost fields.
- **Walkthrough Mode** — Streamlined mobile interface for creating punch items rapidly during a walkthrough: photo -> pin -> description -> assign -> next.
- **Vendor Punch View** — Vendor-portal view showing assigned items, grouped by project and priority, with completion workflow.
- **Client Punch Submission** — Guided client interface in portal: take photo -> drop pin -> describe issue -> submit. Simple and non-technical.
- **Checklist Inspector View** — Step-through interface for completing quality checklists: item description, pass/fail buttons, photo capture, notes.
- **Checklist Template Manager** — CRUD for managing checklist templates with drag-and-drop item ordering.
- **Cost of Quality Report** — Per-project and per-vendor report showing punch item costs, back-charges, and trend analysis.
- **Sign-Off Modal** — Digital signature capture with summary of items being signed off and any remaining open items warning.

---

## Dependencies

- **Module 3: Core Data Model** — Project and location context
- **Module 6: Document Storage** — Floor plans, photo storage
- **Module 10: Contact/Vendor Management** — Vendor assignment directory
- **Module 5: Notification Engine** — Assignment notifications, SLA alerts
- **Module 30: Vendor Portal** — Vendor-facing punch item view and completion workflow
- **Module 29: Full Client Portal** — Client punch item submission
- **Module 27: Warranty & Home Care** — Warranty item creation from unresolved punch
- **Module 7: Scheduling** — Checklist auto-trigger from schedule task status
- **Module 11: Basic Invoicing** — Back-charge generation from punch items

---

## Commissioning Process

Systems commissioning and startup verification for project closeout.

- **Commissioning Checklists:** Pre-built and builder-customizable checklists for systems commissioning at project closeout:
  - HVAC balancing verification
  - Plumbing pressure testing
  - Electrical panel verification and labeling
  - Smart home system testing (if applicable)
  - Pool/spa startup procedures (if applicable)
- **Commissioning Reports:** Generate formal commissioning reports documenting test results, settings, and pass/fail status for each system.
- **Completion Milestones:** Track substantial completion and final completion as separate milestones, each with its own associated punch list. Substantial completion triggers client move-in eligibility; final completion triggers retainage release and warranty start date.

---

## Open Questions

1. Should the system support offline punch list creation with sync when connectivity returns? (Critical for field use.)
2. What is the maximum number of photos per punch item? (Proposed: 20 across all stages.)
3. Should AI auto-categorize punch items from photos? (e.g., detect "paint defect" vs. "hardware missing" from image analysis.)
4. How do we handle punch items discovered by third-party inspectors who are not on the platform?
5. Should the system support voice-to-text for punch item descriptions during walkthroughs?
6. What happens to punch items when a project is archived? (Proposed: read-only access for 7 years.)
7. Should clients be able to see ALL punch items or only their submitted items? (Configurable per builder.)
