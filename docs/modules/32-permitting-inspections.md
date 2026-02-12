# Module 32: Permitting & Inspection Management

**Phase:** 5 - Full Platform
**Status:** TODO
**Optional Module:** No -- core module for all builders

---

## Overview

Multi-jurisdiction permit tracking and inspection management for the full construction
lifecycle. Handles permit applications, fee tracking, inspection scheduling, result
logging, re-inspections, Certificate of Occupancy (CO) tracking, and integration with
daily logs. Since permit types, inspection requirements, and processes vary dramatically
by jurisdiction, the entire module is built on a configurable framework where builders
define their own jurisdiction profiles or select from platform-provided templates.

For builders operating across multiple jurisdictions (common for custom home builders
serving a metro area that spans counties), each project can have its own jurisdiction
configuration without affecting other projects.

---

## Gap Items Addressed

| Gap # | Description | Resolution |
|-------|-------------|------------|
| 471 | Permit types/processes/fees vary by jurisdiction; must be configurable per project location | Jurisdiction profiles with configurable permit types, fee schedules, and process workflows |
| 472 | Inspection type configuration varies by code and jurisdiction | Inspection type library per jurisdiction; builders customize per project |
| 473 | Builders operating in multiple jurisdictions need different rules per project | Per-project jurisdiction assignment from builder's jurisdiction library |
| 474 | Online permit integration for jurisdictions that offer it | API integration layer for supported jurisdictions; manual fallback for all others |
| 475 | Special inspection requirements vary by project scope | Conditional inspection rules: structural threshold triggers, concrete testing, etc. |

---

## Detailed Requirements

### Multi-Jurisdiction Permit Tracking
- Jurisdiction profile library: builders create profiles for each municipality they work in
- Platform-provided jurisdiction templates for common US municipalities (community-contributed over time)
- Per-jurisdiction configuration: permit types, fee schedules, required documents, typical timelines
- Permit application workflow: draft, submitted, under review, approved, issued, expired
- Permit fee tracking with actual vs. estimated and per-project cost allocation
- Permit document storage: application forms, approved plans, stamped drawings, conditions of approval
- Permit expiration tracking with renewal alerts (configurable lead time)
- Permit hold/suspension tracking with reason codes and resolution workflow
- Multi-permit per project support (building, electrical, plumbing, mechanical, grading, ROW, etc.)

### Inspection Scheduling & Management
- Inspection type library per jurisdiction (foundation, framing, rough-in MEP, insulation, drywall, final)
- Configurable inspection sequences with prerequisite enforcement (cannot schedule framing before foundation passes)
- Inspection request workflow: ready to schedule, requested, confirmed, completed
- Calendar integration: inspection dates on project schedule and builder-wide calendar
- Inspector contact management per jurisdiction
- Inspection scheduling via phone log, email, or API (where jurisdiction supports it)
- Batch inspection requests (schedule multiple inspections across projects in one session)

### Result Logging
- Inspection result recording: Pass, Fail, Partial/Conditional, Cancelled, No-Show
- Failure documentation: deficiency list with photos, required corrections, re-inspection scope
- Conditional pass tracking: conditions to satisfy before proceeding
- Correction assignment: auto-create tasks for responsible trade when inspection fails
- Re-inspection scheduling with link to original failure
- Inspector notes and comments capture
- Historical pass/fail rates by trade and inspector (analytics)

### Certificate of Occupancy (CO) Tracking
- CO prerequisites checklist: all required inspections passed, final documents submitted
- CO application status tracking
- Temporary CO (TCO) management with expiration and conditions
- CO document storage and association with project closeout
- CO as project milestone gate: block certain closeout steps until CO is obtained

### Integration with Daily Logs
- Inspection results auto-populate in daily log for the date of inspection
- Daily log entry can reference scheduled inspections
- Failed inspections create action items visible in daily log workflow
- Field superintendent can log informal inspection notes in daily log with link to formal record

### Online Permit Integration
- Abstraction layer for jurisdiction APIs (where available)
- Permit status polling for integrated jurisdictions
- Manual status update for non-integrated jurisdictions
- Notification when permit status changes (approved, comments received, denied)

---

## Database Tables

```
jurisdictions
  id, builder_id, name, state, county, municipality, contact_info,
  online_portal_url, api_integration_type, notes, is_active, created_at

permit_types
  id, jurisdiction_id, name, description, typical_fee, typical_duration_days,
  required_documents, is_active

permits
  id, builder_id, project_id, jurisdiction_id, permit_type_id,
  permit_number, status, applied_date, issued_date, expiration_date,
  fee_estimated, fee_actual, conditions, notes, created_at, updated_at

permit_documents
  id, permit_id, document_type, file_url, uploaded_by, uploaded_at

inspection_types
  id, jurisdiction_id, name, description, sequence_order,
  prerequisite_inspection_type_id, is_special, trigger_conditions

inspections
  id, builder_id, project_id, permit_id, inspection_type_id,
  scheduled_date, scheduled_time, inspector_name, inspector_phone,
  status, result, result_notes, completed_at, created_at, updated_at

inspection_deficiencies
  id, inspection_id, description, photo_urls, responsible_vendor_id,
  correction_task_id, resolved, resolved_at

reinspections
  id, original_inspection_id, inspection_id, scope_notes

co_tracking
  id, builder_id, project_id, type (final_co|temp_co),
  prerequisites_met, applied_date, issued_date, expiration_date,
  conditions, document_url, status
```

---

## API Endpoints

```
GET    /api/v2/jurisdictions                       # Builder's jurisdiction library
POST   /api/v2/jurisdictions                       # Create jurisdiction profile
PUT    /api/v2/jurisdictions/:id                    # Update jurisdiction
GET    /api/v2/jurisdictions/:id/permit-types       # Permit types for jurisdiction
GET    /api/v2/jurisdictions/:id/inspection-types   # Inspection types for jurisdiction

GET    /api/v2/permits                             # List permits (filter by project, status)
POST   /api/v2/permits                             # Create permit record
PATCH  /api/v2/permits/:id                         # Update permit status
POST   /api/v2/permits/:id/documents               # Attach permit document

GET    /api/v2/inspections                         # List inspections (filter by project, date, status)
POST   /api/v2/inspections                         # Schedule inspection
PATCH  /api/v2/inspections/:id                     # Update inspection (result, reschedule)
POST   /api/v2/inspections/:id/deficiencies        # Log deficiency
POST   /api/v2/inspections/:id/reinspect           # Schedule re-inspection

GET    /api/v2/projects/:id/co-tracking            # CO status for project
POST   /api/v2/projects/:id/co-tracking            # Create CO tracking record
PATCH  /api/v2/projects/:id/co-tracking/:coId      # Update CO status
```

---

## Dependencies

| Module | Relationship |
|--------|-------------|
| Module 3: Core Data Model | Project location and context |
| Module 7: Scheduling | Inspection dates on project schedule, CO as milestone gate |
| Module 8: Daily Logs | Inspection results auto-populate daily log entries |
| Module 6: Document Storage | Permit documents, stamped plans, inspection photos |
| Module 5: Notification Engine | Permit expiration alerts, inspection reminders, result notifications |
| Module 10: Contact/Vendor Management | Correction assignment to responsible trade |

---

## Building Code Versioning

Track applicable building code editions per project and jurisdiction.

- **Code Edition Tracking:** Record which building code edition applies to each project, typically determined by permit application date (e.g., IRC 2021 vs. IRC 2024).
- **Code Change Alerts:** When a jurisdiction adopts a new code edition, alert builders with active projects in that jurisdiction about potential impacts.
- **Per-Jurisdiction Code Database:** Maintain a database of code requirements per jurisdiction, including local amendments and special provisions.
- **Inspection Code Linkage:** Link individual inspections to specific code sections being verified, providing clear documentation of compliance basis.

---

## Open Questions

1. Should the platform maintain a shared, community-contributed jurisdiction database, or is each builder's configuration fully private?
2. How do we handle jurisdictions that require in-person permit submission -- is a "manual" workflow sufficient, or do we need print-and-mail integration?
3. What level of permit fee analytics is needed? (Cost per SF, comparison across jurisdictions, fee trend tracking?)
4. Should inspection scheduling integrate with Google Calendar / Outlook, or only the in-app calendar?
5. How do we handle projects that span multiple jurisdictions (e.g., a property on a county/city boundary)?
