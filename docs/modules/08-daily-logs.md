# Module 8: Daily Logs & Field Operations

**Phase:** 2 - Construction Core
**Status:** TODO
**Last Updated:** 2026-02-11

---

## Overview

Digital daily log entries capturing weather, crew hours, work performed, materials used, site conditions, and field issues. Replaces paper-based field reporting with structured, searchable, legally defensible records. Designed for mobile-first superintendent workflows with one-tap log start, auto-populated fields (weather, scheduled tasks, on-site vendors), voice-to-text narrative entry, and photo integration. Configurable per builder with custom fields, templates by project phase, submission reminders, and review/approval workflows.

---

## Gap Items Addressed

| GAP # | Description | Priority |
|-------|-------------|----------|
| GAP-315 | Configurable required fields per builder | High |
| GAP-316 | Custom fields on daily logs (e.g., safety observations) | High |
| GAP-317 | Daily log templates by project phase (foundation vs. finishes) | Medium |
| GAP-318 | Single PM per job vs. multiple people logging per job | High |
| GAP-319 | Automatic fields: weather auto-populated, scheduled tasks auto-listed | High |
| GAP-320 | Submission reminders (configurable time: 4pm, 6pm, etc.) | Medium |
| GAP-321 | Review workflows (PM submits, Director reviews -- or no review) | Medium |
| GAP-322 | Voice-to-text daily log entry (dictation while driving) | Medium |
| GAP-323 | Photo requirements (minimum X photos per log, configurable) | Medium |
| GAP-324 | Log entries that trigger workflows (delay -> schedule impact analysis) | High |
| GAP-325 | Daily logs as legal documents (immutable after submission, or editable with audit trail) | High |
| 1036 | One-tap daily log start — auto-populates date, weather, project, yesterday's vendors | Enhanced auto-population including yesterday's vendor roster for quick confirmation |
| 1037 | Quick photo capture — snap photo auto-tagged to project, date, location; optional voice note | One-tap photo with auto-tagging and voice note overlay |
| 1038 | Quick issue reporting — photo + voice note + category + urgency → creates issue, assigns, notifies | Streamlined issue creation from photo with voice description |
| 1039 | Material delivery verification — scan packing slip or take photo → match to PO → flag discrepancies | PO-matched delivery verification with photo/scan capture |
| 1040 | Inspection result logging — pass/fail + inspector notes + photos → auto-updates schedule + daily log | Integrated inspection result capture feeding schedule and daily log |
| 1041 | Vendor check-in/check-out — track who's on site and when (optional GPS verification) | Enhanced vendor presence tracking with GPS option |
| 1042 | Quick measurement/note — capture field measurement or decision with photo context | Quick-capture measurement tool with photo and annotation |
| 1043 | Safety observation — quick log of safety concern with photo → routes to safety manager | Safety observation quick-entry with auto-routing |
| 1044 | Client site visit logging — document decisions, questions, concerns raised during client visit | Client visit record type in daily log with decision tracking |
| 1045 | Change directive capture — field decision that will become a change order; document now, formalize later | Field change directive quick-capture linked to Module 17/38 |
| 1046 | Daily log review and submission — review all logs submitted by field staff; approve or request edits | PM log review dashboard for end-of-day review workflow |

---

## Detailed Requirements

### 8.1 One-Tap Daily Log Start (GAP-319)

When a superintendent opens a new daily log, the system auto-populates:

- **Date**: Current date (adjustable for backdating with audit note).
- **Project**: Auto-selected if user is assigned to one project, or last-used project.
- **Weather**: Fetched from weather API for project location (GAP-319). Shows temp high/low, conditions, precipitation, wind. Editable if API data is inaccurate.
- **Scheduled Tasks**: Pulled from Module 7 schedule -- tasks planned for today auto-listed as a checklist.
- **Expected Vendors**: Vendors assigned to today's scheduled tasks auto-listed.
- **Previous Day Summary**: One-line summary of yesterday's log for continuity.

The superintendent taps "Start Log" and immediately sees a pre-filled form ready for updates.

### 8.2 Configurable Fields & Templates (GAP-315, GAP-316, GAP-317)

**Required Fields Configuration** (GAP-315):
- Builder admin configures which fields are required vs. optional per log.
- Minimum required: date, project, weather conditions, work performed narrative.
- Optional sections: labor hours, material deliveries, safety observations, visitor log, equipment on-site.

**Custom Fields** (GAP-316):
- Builders add custom fields to logs: text, number, dropdown, checkbox, date.
- Examples: "Safety Toolbox Talk Conducted" (checkbox), "OSHA Inspector On-Site" (checkbox), "Soil Moisture Reading" (number).
- Custom fields appear in the configured section of the log form.

**Phase Templates** (GAP-317):
- Different log templates for different project phases:
  - Foundation: soil conditions, concrete pours, compaction tests.
  - Framing: lumber deliveries, sheathing progress, truss installation.
  - MEP Rough: inspection readiness, penetration sealing, pressure tests.
  - Finishes: punchlist items, client walkthrough notes, protection measures.
- Template auto-selected based on project's current phase; manually overridable.

### 8.3 Multi-User Logging (GAP-318)

- **Single-user mode**: One PM/superintendent per project creates all logs.
- **Multi-user mode**: Multiple field staff contribute to the same day's log.
  - Each contributor's entries tagged with their name and timestamp.
  - PM/superintendent reviews and consolidates into the official daily log.
  - Conflict resolution: if two users log different weather, system flags for review.
- Builder configures mode per project or globally.

### 8.4 Voice-to-Text Entry (GAP-322)

- Mobile app provides a dictation button for narrative fields (work performed, notes, issues).
- Uses device speech-to-text API (Web Speech API / native).
- Transcribed text appears in the field for review and editing before save.
- Supports dictation while driving (superintendent recaps the day on the way home).
- Punctuation and construction terminology optimization (train/configure speech model hints).

### 8.5 Photo Integration (GAP-323)

- Inline photo capture from mobile camera or gallery upload.
- Photos attached to specific log sections (work performed, deliveries, issues, safety).
- **Minimum photo requirement** (GAP-323): builder configures minimum photos per log (e.g., "at least 4 photos per daily log"). System warns on submission if below threshold.
- Auto-metadata: GPS coordinates, timestamp, device info embedded in photo record.
- Photo annotation: draw on photos to highlight issues (circles, arrows, text).
- Photos feed into Module 29 (Photos & Media) project gallery.

### 8.6 Vendor Check-In/Check-Out

- Vendors/subs check in on arrival and check out on departure (mobile or QR code at site).
- Daily log auto-records vendor presence with arrival/departure times.
- Headcount tracking for site safety compliance.
- Vendor hours can feed into time verification for T&M contracts.
- Check-in triggers: auto-notify PM that vendor arrived, update schedule task status.

### 8.7 Field Issue Reporting (GAP-324)

- Dedicated "Issue" section in daily log for reporting problems discovered in the field.
- Issue fields: description, severity (low/medium/high/critical), trade responsible, photos, suggested resolution.
- **Workflow triggers** (GAP-324):
  - "Delay" issue -> auto-creates schedule impact note on Module 7.
  - "Defect" issue -> auto-creates punch list item on Module 22.
  - "Safety" issue -> auto-creates safety incident on Module 26.
  - "RFI Needed" issue -> auto-creates draft RFI on Module 21.
- Issues tracked to resolution with status updates.

#### Edge Cases & What-If Scenarios

1. **Field issue requiring multi-person escalation:** When a field issue is reported that requires immediate attention from multiple people (e.g., a structural concern requiring the PM, structural engineer, and building inspector), the workflow trigger must support multi-recipient escalation. Required behavior: (a) critical-severity issues automatically notify all project team members with PM role or above, (b) the issue reporter can tag multiple individuals and trades for notification beyond the automatic recipients, (c) each tagged individual receives a notification with a direct link to the issue and the ability to acknowledge or respond, (d) the issue tracks acknowledgment status per recipient (who has seen it, who has responded), (e) if no tagged recipient acknowledges within 1 hour for critical issues, the system escalates to the builder admin, and (f) the issue detail page shows a real-time activity feed of all responses and actions taken, visible to all tagged participants.

### 8.8 Submission & Review Workflow (GAP-320, GAP-321)

**Submission Reminders** (GAP-320):
- Configurable daily reminder time (e.g., 4:00 PM, 5:30 PM, 6:00 PM).
- Push notification and/or SMS to assigned log creator.
- Escalation: if log not submitted by X time, notify PM's supervisor.
- Reminder suppressed on non-work days (per work calendar from Module 7).

#### Edge Cases & What-If Scenarios

1. **Missed daily log — retroactive creation:** When a superintendent forgets to submit a daily log (no draft created, reminder ignored, or absent), the system must allow retroactive log creation with the following constraints: (a) the user can create a log for a past date (up to 7 days back by default, configurable by the builder), (b) retroactive logs are visually marked with a "Late Submission" badge showing the actual creation date vs. the log date, (c) the audit trail records the true creation timestamp, not the log date, (d) the PM and builder admin are notified when a retroactive log is submitted, (e) if the configurable backdating window has passed, only an admin can create the retroactive log, and (f) the daily log list view must show gaps (missing dates) with a visual indicator and a "Create Missing Log" quick action.

**Review Workflow** (GAP-321):
- Configurable per builder:
  - **No review**: log is final upon submission.
  - **Single review**: PM submits, director/owner reviews and approves.
  - **Multi-review**: field super submits, PM reviews, director approves.
- Reviewer can add comments, request edits (sends back to submitter), or approve.
- Approved logs marked with reviewer name and timestamp.

### 8.9 Legal Defensibility & Immutability (GAP-325)

- **After submission**: log entries are immutable. Original content preserved permanently.
- **Amendments**: any post-submission edits create a new amendment record with:
  - Original text preserved.
  - New text with reason for change.
  - Editor identity and timestamp.
  - Full audit trail visible to authorized users.
- **Digital signature**: submitter and reviewer sign-off recorded with timestamp.
- **Export**: daily logs exportable as PDF with all photos, amendments, and signatures for legal proceedings.
- **Retention**: configurable retention period per builder (default: 10 years for statute of limitations coverage).

#### Edge Cases & What-If Scenarios

1. **Log immutability and amendment integrity:** Daily logs serve as legal documents in construction disputes and litigation. The amendment process must maintain absolute integrity. Required behavior: (a) after submission, the `is_immutable` flag is set at the database level and enforced by both application logic and a database trigger that rejects direct UPDATE statements on immutable rows, (b) amendments are stored as separate records in `daily_log_amendments` — the original row is never modified, (c) each amendment requires a mandatory `reason` field (cannot be blank), (d) amendments are attributed to the amending user, not the original submitter, (e) the PDF export must clearly distinguish original content from amendments with visual formatting (e.g., amendments shown in a different color with "AMENDED" label, date, and reason), (f) the system must prevent "amendment stacking" — amending an amendment creates a new amendment referencing the original value, not the previous amendment's value, and (g) an admin must not be able to delete or modify amendment records under any circumstance. If a builder requests amendment deletion for legal reasons, this requires platform admin intervention with a compliance audit trail entry.

### 8.10 Field Quick-Actions (Gaps 1037-1045)

Streamlined mobile-first actions for rapid field data capture during the workday.

**Quick Photo Capture (Gap 1037):**
- One-tap photo from any screen: snap photo, auto-tagged with project, date, GPS location, and current construction phase
- Optional voice note overlay: hold to record voice annotation on the captured photo
- Auto-file to current daily log and project photo gallery simultaneously
- Tag suggestions: room/area, trade, issue type based on project phase and location

**Quick Issue Reporting (Gap 1038):**
- Streamlined issue creation: photo + voice note + category dropdown + urgency level
- One-tap workflow: capture photo, dictate description, select category, assign urgency -> system auto-assigns to responsible party and sends notification
- Categories: defect, delay, safety, material, weather, access, design conflict, other
- Issue auto-creates the appropriate downstream record (punch item, schedule note, RFI, safety observation) based on category

**Material Delivery Verification (Gap 1039):**
- Scan packing slip (camera OCR) or take photo of delivery ticket
- AI matches delivery to existing purchase order: vendor, items, quantities
- Flag discrepancies: wrong items, short quantities, damaged materials, wrong project
- Accept delivery with signature capture or reject with reason and photos
- Accepted deliveries auto-update PO received quantities and trigger cost code booking
- Rejected deliveries auto-notify vendor and purchasing manager

**Inspection Result Logging (Gap 1040):**
- Quick inspection result entry: select inspection from today's scheduled list, record pass/fail
- Inspector name, notes, and photos captured in one flow
- Pass result: auto-updates schedule (dependent tasks become eligible), auto-populates daily log
- Fail result: deficiency list entry, re-inspection scheduling, notification to PM and responsible trade
- Integration with Module 32 (Permitting & Inspections) for formal record keeping

**Quick Measurement/Note (Gap 1042):**
- Capture a field measurement or decision note with photo context
- Annotate directly on the photo with measurements, dimensions, or notes
- Tag to specific room/area and trade for searchability
- Quick-capture notes feed into daily log and are searchable from project search

**Safety Observation (Gap 1043):**
- Quick safety concern entry: photo + description + severity + location
- Auto-routes to designated safety manager or superintendent
- Categories: fall hazard, electrical hazard, housekeeping, PPE violation, excavation, scaffolding, other
- Positive observation option: log good safety practices for recognition
- Safety observations feed into Module 33 (Safety & Compliance) tracking and reporting

**Client Site Visit Logging (Gap 1044):**
- Record when client visits the construction site
- Capture: date/time, who was present, decisions made, questions asked, concerns raised
- Any decisions made during the visit are flagged as requiring formal documentation (change directive, selection confirmation, or meeting minutes)
- Client visit notes auto-populate in daily log and are visible to PM
- Follow-up task auto-generation from client visit action items

**Change Directive Capture (Gap 1045):**
- Field decision quick-capture: when a field decision is made that will require formalization as a change order
- Capture: description of change, who authorized it verbally, photos of conditions requiring change, estimated cost impact
- Change directive saved as a draft linked to the project and daily log
- "Formalize" workflow: one-click conversion to a formal change order in Module 17 or Module 38
- All change directives tracked on a separate dashboard showing formalized vs. pending items

### 8.11 End-of-Day Log Review (Gap 1046)

PM review dashboard for consolidating and approving daily logs from field staff.

- Review queue: all daily logs submitted today across all PM's active projects
- Side-by-side view: daily log content alongside scheduled tasks for the day (verify work matches plan)
- Bulk approval: approve multiple logs in one session
- Edit request: return specific logs to field staff with comments on what needs updating
- Cross-log consistency check: flag discrepancies between logs from the same project (different users logging conflicting information)
- Summary generation: auto-generate end-of-day summary from all approved logs for PM's reference

### 8.12 Superintendent Workflow (Mobile-First)

The daily workflow for a construction superintendent:

1. **Morning**: Open app -> see today's schedule, expected vendors, weather. Tap "Start Today's Log."
2. **Throughout day**: Add photos, note work performed, log material deliveries, record vendor check-ins. Voice dictation for quick notes.
3. **Issue occurs**: Tap "Report Issue" -> capture photo, describe problem, assign severity -> triggers appropriate workflow.
4. **End of day**: Review auto-populated sections, add final narrative, verify photo count meets minimum, tap "Submit."
5. **PM review** (if configured): PM receives notification, reviews log, approves or requests edits.

All interactions optimized for mobile: large tap targets, minimal typing, offline capability with sync when connected.

---

## Database Tables

### daily_logs
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders, multi-tenant |
| project_id | UUID | FK -> projects |
| log_date | DATE | |
| template_id | UUID | FK -> daily_log_templates, nullable |
| status | ENUM | 'draft', 'submitted', 'in_review', 'approved', 'returned' |
| submitted_at | TIMESTAMPTZ | |
| submitted_by | UUID | FK -> users |
| reviewed_at | TIMESTAMPTZ | |
| reviewed_by | UUID | FK -> users |
| review_notes | TEXT | |
| weather_source | ENUM | 'api', 'manual' |
| weather_temp_high_f | DECIMAL(5,1) | |
| weather_temp_low_f | DECIMAL(5,1) | |
| weather_conditions | VARCHAR(100) | |
| weather_precipitation_in | DECIMAL(5,2) | |
| weather_wind_mph | DECIMAL(5,1) | |
| work_performed | TEXT | Main narrative |
| materials_notes | TEXT | |
| safety_notes | TEXT | |
| visitor_notes | TEXT | |
| custom_fields | JSONB | Builder-configured custom field values |
| is_immutable | BOOLEAN | True after submission |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### daily_log_entries
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| daily_log_id | UUID | FK -> daily_logs |
| builder_id | UUID | FK -> builders |
| entry_type | ENUM | 'work', 'material', 'safety', 'visitor', 'issue', 'note' |
| description | TEXT | |
| trade | VARCHAR(100) | |
| created_by | UUID | FK -> users (multi-user support GAP-318) |
| created_at | TIMESTAMPTZ | |

### daily_log_labor
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| daily_log_id | UUID | FK -> daily_logs |
| builder_id | UUID | FK -> builders |
| vendor_id | UUID | FK -> vendors, nullable |
| worker_name | VARCHAR(255) | |
| trade | VARCHAR(100) | |
| hours_worked | DECIMAL(4,1) | |
| arrival_time | TIME | |
| departure_time | TIME | |
| checked_in_via | ENUM | 'manual', 'qr_code', 'geofence' |

### daily_log_photos
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| daily_log_id | UUID | FK -> daily_logs |
| builder_id | UUID | FK -> builders |
| section | ENUM | 'work', 'material', 'safety', 'issue', 'general' |
| file_path | VARCHAR(500) | Storage path |
| thumbnail_path | VARCHAR(500) | |
| caption | TEXT | |
| gps_lat | DECIMAL(10,7) | |
| gps_lng | DECIMAL(10,7) | |
| taken_at | TIMESTAMPTZ | EXIF timestamp |
| uploaded_by | UUID | FK -> users |
| annotations | JSONB | Drawing overlay data |

### daily_log_issues
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| daily_log_id | UUID | FK -> daily_logs |
| builder_id | UUID | FK -> builders |
| description | TEXT | |
| severity | ENUM | 'low', 'medium', 'high', 'critical' |
| trade_responsible | VARCHAR(100) | |
| status | ENUM | 'open', 'in_progress', 'resolved' |
| triggered_entity_type | VARCHAR(50) | 'schedule_task', 'punch_item', 'rfi', 'safety_incident' |
| triggered_entity_id | UUID | FK to the created entity |
| resolved_at | TIMESTAMPTZ | |
| resolved_by | UUID | |

### daily_log_amendments
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| daily_log_id | UUID | FK -> daily_logs |
| builder_id | UUID | FK -> builders |
| field_name | VARCHAR(100) | Which field was amended |
| original_value | TEXT | |
| amended_value | TEXT | |
| reason | TEXT | Required |
| amended_by | UUID | FK -> users |
| amended_at | TIMESTAMPTZ | |

### daily_log_templates
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| name | VARCHAR(255) | e.g., "Foundation Phase Log" |
| phase | VARCHAR(100) | |
| required_fields | JSONB | List of required field names |
| custom_fields_schema | JSONB | Custom field definitions |
| min_photos | INTEGER | Minimum photo requirement |
| sections | JSONB | Which sections are shown/hidden |
| created_at | TIMESTAMPTZ | |

### daily_log_config
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders, unique |
| required_fields | JSONB | Global required fields |
| review_workflow | ENUM | 'none', 'single', 'multi' |
| reminder_time | TIME | e.g., '16:00' |
| reminder_channel | ENUM | 'push', 'sms', 'email', 'all' |
| multi_user_enabled | BOOLEAN | |
| retention_years | INTEGER | Default 10 |
| immutable_after_submit | BOOLEAN | Default true |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/projects/:projectId/daily-logs | List logs for project (paginated, filterable) |
| GET | /api/daily-logs/:logId | Get single log with all entries, photos, labor |
| POST | /api/projects/:projectId/daily-logs | Create new daily log (auto-populates fields) |
| PUT | /api/daily-logs/:logId | Update draft log |
| POST | /api/daily-logs/:logId/submit | Submit log (triggers immutability) |
| POST | /api/daily-logs/:logId/review | Approve or return log |
| POST | /api/daily-logs/:logId/amend | Create amendment on submitted log |
| POST | /api/daily-logs/:logId/entries | Add entry (work, material, note) |
| POST | /api/daily-logs/:logId/labor | Add labor record |
| PUT | /api/daily-logs/labor/:laborId | Update labor record |
| POST | /api/daily-logs/:logId/photos | Upload photo |
| DELETE | /api/daily-logs/photos/:photoId | Remove photo (draft only) |
| POST | /api/daily-logs/:logId/issues | Report field issue |
| PUT | /api/daily-logs/issues/:issueId | Update issue status |
| GET | /api/daily-logs/:logId/export/pdf | Export log as PDF |
| GET | /api/daily-log-templates | List templates for builder |
| POST | /api/daily-log-templates | Create template |
| PUT | /api/daily-log-templates/:templateId | Update template |
| GET | /api/daily-log-config | Get builder's log configuration |
| PUT | /api/daily-log-config | Update builder's log configuration |
| POST | /api/projects/:projectId/vendor-checkin | Vendor check-in |
| POST | /api/projects/:projectId/vendor-checkout | Vendor check-out |
| GET | /api/projects/:projectId/weather/today | Fetch today's weather for log auto-population |

---

## UI Components

| Component | Description |
|-----------|-------------|
| DailyLogForm | Main log entry form with auto-populated sections |
| DailyLogList | Filterable list of logs per project with status badges |
| LogEntrySection | Collapsible section for work, materials, safety, etc. |
| PhotoCaptureGrid | Inline camera capture with gallery grid and annotations |
| VoiceDictationButton | Microphone button for voice-to-text input |
| VendorCheckInWidget | QR code scanner or manual check-in for vendor tracking |
| IssueReportForm | Quick issue entry with severity, photos, workflow trigger |
| LogReviewPanel | Reviewer interface with approve/return/comment actions |
| AmendmentHistory | Timeline view of all amendments with diffs |
| SubmissionReminder | Push notification and in-app reminder component |
| LogTemplateManager | Admin UI for creating/editing log templates |
| LogConfigPanel | Builder admin settings for fields, workflows, reminders |
| DailyLogPDFPreview | Print-ready PDF preview with all content |
| MobileDailyLogShell | Mobile-optimized wrapper with bottom nav and offline queue |

---

## Dependencies

- **Module 3: Core Data Model** -- projects, phases
- **Module 5: Notification Engine** -- submission reminders, review notifications
- **Module 6: Document Storage** -- photo storage and retrieval
- **Module 7: Scheduling** -- auto-populated scheduled tasks, weather data sharing
- **Module 10: Vendor Management** -- vendor check-in/out, labor tracking
- **Module 21: RFI Management** -- issue-to-RFI workflow trigger
- **Module 22: Punch Lists** -- issue-to-punch workflow trigger
- **Module 26: Safety & Compliance** -- issue-to-safety workflow trigger
- **Module 29: Photos & Media** -- photo gallery integration
- **External: Weather API** -- shared with Module 7
- **External: Speech-to-Text API** -- device native or Web Speech API

---

## Open Questions

1. Should daily logs support offline creation with full photo capture, syncing when connectivity returns? (Critical for remote job sites.)
2. What is the maximum practical photo count per daily log before the form becomes unwieldy? (Suggest soft limit of 50 with pagination.)
3. Should voice-to-text support Spanish for bilingual field crews?
4. How should multi-user logs handle conflicting weather entries -- auto-merge, flag for review, or last-write-wins?
5. Should vendor check-in/check-out use GPS geofencing as an option (auto-check-in when phone enters site boundary)?
6. For legal immutability (GAP-325), should we use database-level immutability (row-level security) or application-level enforcement?
7. Should the daily log PDF export include all photos at full resolution or thumbnails with a link to full-size?
