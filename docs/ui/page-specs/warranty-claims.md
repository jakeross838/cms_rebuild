# View Plan: Warranty Claims & Management

## Views Covered
1. Warranty List
2. Warranty Detail
3. Warranty Claim Form
4. Warranty Calendar

---

## Purpose
Track warranties and manage claims:
- Product warranties (appliances, materials)
- Workmanship warranties (contractor, sub)
- Claim processing
- Expiration tracking

---

## 1. Warranty List
URL: /jobs/:id/warranties

Filters:
- Active/Expired
- By vendor
- By category
- Expiring soon

Display:
- Item description
- Vendor/manufacturer
- Start/end dates
- Status
- Claims count

---

## 2. Warranty Detail
URL: /jobs/:id/warranties/:warrantyId

Information:
- Item details
- Coverage terms
- Contact information
- Documentation
- Claim history

Attached Documents:
- Original warranty certificate
- Purchase receipts
- Installation records

---

## 3. Warranty Claim Form
URL: /jobs/:id/warranties/:warrantyId/claim

Claim Fields:
- Issue description
- Date discovered
- Photos of issue
- Urgency level
- Requested resolution

Workflow:
Submitted -> Vendor Contacted -> In Progress -> Resolved

---

## 4. Warranty Calendar
URL: /warranties/calendar

Purpose: Visual expiration timeline

Features:
- Color-coded by urgency
- Filter by job
- Expiration alerts
- Renewal reminders

---

## AI Enhancements
- Auto-extract warranty terms from documents
- Predict expiration issues
- Suggest claim language
- Track vendor warranty performance

---

## Notifications
- 90 days before expiration
- 30 days before expiration
- 7 days before expiration
- On expiration

---

## Database Schema

warranties:
- id UUID
- company_id UUID
- job_id UUID
- vendor_id UUID
- item_description TEXT
- category TEXT
- start_date DATE
- end_date DATE
- coverage_terms TEXT
- contact_name TEXT
- contact_phone TEXT
- contact_email TEXT
- documents JSONB
- status TEXT
- created_at TIMESTAMPTZ

warranty_claims:
- id UUID
- warranty_id UUID
- description TEXT
- discovered_date DATE
- photos JSONB
- urgency TEXT
- requested_resolution TEXT
- status TEXT
- resolution_notes TEXT
- resolved_at TIMESTAMPTZ
- created_at TIMESTAMPTZ

---

## Gap Items Addressed

### From Section 27: Warranty & Home Care (Items 465-470)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 465 | Warranty/home care as optional module | Warranty Claims is a standalone view; Requires: module toggle so builders who do not offer home care can disable it |
| 466 | Configurable warranty terms per builder | Warranty Detail shows coverage terms; Requires: builder-level default term templates (1yr workmanship, 2yr systems, 10yr structural, etc.) |
| 467 | Warranty service request routing (builder-configurable) | Claim workflow (Submitted -> Vendor Contacted -> In Progress -> Resolved); Requires: configurable routing rules — who gets notified, who approves, escalation paths |
| 468 | Home care subscription pricing varies by builder | Requires: pricing/subscription tier configuration for home care plans (not yet in spec) |
| 469 | Manufacturer vs. builder warranty tracking | Warranty list filters by category; Requires: explicit warranty_source field distinguishing manufacturer, builder, and extended warranties |
| 470 | Warranty reserve accounting | Requires: integration with Financial module to track warranty reserve fund per project (configurable % of project cost) |

### From Section 45: Per-Page Feature Requirements (Items 769-780 — Reports)
| Gap # | Description | Relevance to Warranty Claims |
|-------|-------------|------------------------------|
| 769 | Report library with pre-built reports | Warranty claims need a "Warranty Status Report" and "Claims by Vendor" report in the report library |
| 771 | Report scheduling and auto-distribution | Auto-generate warranty expiration reports on a monthly schedule for builder review |

### From Section 22: Punch Lists & Checklists (Item 416)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 416 | Unresolved punch items become warranty items | Requires: automated workflow to convert open punch items to warranty claims when project transitions to warranty phase |

### From Edge Cases (Sections 44, 46, 47)
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 601 | Sub fired mid-scope — warranty responsibility transfer | Claims must track which vendor is responsible even after vendor replacement |
| 610 | Client self-performs work — warranty exclusions | Warranty records need exclusion flags for client-performed scope |
| 800 | Construction defect claim workflows by state (FL 558, CA SB800) | Requires: state-specific defect claim workflow templates with statutory notice periods and response deadlines |
| 801 | Warranty claim dispute resolution documentation | Claim form needs dispute status, resolution docs upload, and communication log |
| 802 | Expert witness documentation support | Warranty claims must support organized export of all claim records, photos, and communication for legal proceedings |
| 804 | Contract interpretation disputes | Warranty coverage_terms field must store original contract language for reference during disputes |
| 874 | Project completion -> warranty start dates set automatically | Requires: trigger at project completion to create warranty records from templates with auto-calculated expiration dates |

### AI Enhancement Gaps
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 502 | AI anomaly detection across platform | AI section includes "Predict expiration issues" and "Track vendor warranty performance" |
| 505 | AI communication assistance | AI section includes "Suggest claim language" for drafting claim communications |

---

## Revision History
| Date | Change |
|------|--------|
| 2026-02-11 | Added Gap Items Addressed section from gap analysis sections 22, 27, 44-48 |
| Initial | Created from view planning |
