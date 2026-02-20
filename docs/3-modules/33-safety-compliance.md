# Module 33: Safety & Compliance

**Phase:** 5 - Full Platform
**Status:** TODO
**Optional Module:** Yes -- configurable per tenant

---

## Overview

Comprehensive job site safety management covering safety observations, incident/accident
reporting, OSHA compliance tracking, employee and vendor certification management,
toolbox talks, corrective actions, and safety scoring. The module integrates with vendor
performance records so that safety violations by subcontractors affect their vendor
scorecard, and with HR/workforce for employee certification tracking.

All checklists, forms, and workflows are builder-configurable because safety requirements
vary by state, by project type, and by builder size. A one-man builder has different
safety documentation needs than a 50-person operation with a dedicated safety director.

---

## Gap Items Addressed

| Gap # | Description | Resolution |
|-------|-------------|------------|
| 459 | Safety requirements vary by state and builder; all forms/workflows must be configurable | Template library with builder-customizable checklists, forms, and workflows |
| 460 | OSHA region-specific requirements | OSHA region tagging on projects; region-specific checklist templates |
| 461 | Builders with own safety staff vs. those without | Scalable complexity: simple mode (basic checklists) vs. full mode (dedicated safety workflows) |
| 462 | Safety training tracking integrated with vendor/employee management | Certification records linked to employee profiles and vendor compliance records |
| 463 | Configurable safety incident investigation workflows | Multi-step investigation workflow with configurable steps, required docs, and approval gates |
| 464 | Safety integration with insurance (EMR calculations) | Incident data feeds EMR worksheet; exportable data for insurance audits |

---

## Detailed Requirements

### Safety Observations
- Field observation entry: positive observations (good practices) and hazard identification
- Photo-required observations for hazard documentation
- Observation categories: fall protection, electrical, excavation, scaffolding, PPE, housekeeping, etc.
- Severity classification: informational, minor hazard, serious hazard, imminent danger
- Immediate corrective action capture (what was done on the spot)
- Observation trending: which categories appear most often, on which projects, by which trades
- Anonymous observation submission option (encourages reporting)

### Incident & Accident Reporting
- Multi-step incident report: initial report (within 1 hour), investigation (within 24 hours), root cause analysis, corrective action plan
- OSHA 300 log auto-population from incident data
- OSHA 301 form generation from incident details
- Injury classification per OSHA standards: first aid, recordable, lost time, fatality
- Near-miss reporting with same categorization (no injury, but captures learning)
- Witness statement collection with digital signature
- Photo and video documentation per incident
- Drug/alcohol testing tracking when required by policy
- Return-to-work tracking for lost-time injuries
- OSHA reporting deadline alerts (8-hour for fatality/hospitalization, 24-hour for amputation/eye loss)

### OSHA Compliance
- OSHA poster and documentation requirements checklist per job site
- OSHA 300A annual summary generation
- OSHA inspection preparation checklist
- Citation tracking and abatement documentation
- Multi-employer worksite doctrine tracking (controlling, creating, exposing, correcting employer roles)
- Silica exposure monitoring log (where applicable)
- Confined space entry permits
- Hot work permits
- Lockout/tagout procedures per project

### Certification & Training Tracking
- Employee certifications: OSHA 10-Hour, OSHA 30-Hour, First Aid/CPR, equipment operator, fall protection
- Vendor/subcontractor certifications: safety program documentation, EMR rating, insurance compliance
- Certification expiration alerts with configurable lead time
- Training session scheduling and attendance tracking (toolbox talks, safety meetings)
- Toolbox talk library with configurable topics and frequency requirements
- Training completion records with digital sign-in sheets
- Auto-block: prevent uncertified workers from being assigned to tasks requiring certification

### Edge Cases & What-If Scenarios

1. **Major safety incident workflow.** When a serious injury, fatality, or major property damage event occurs, the system must support an accelerated, structured workflow that goes beyond the standard incident report. This includes: immediate lockdown mode (restrict who can edit the incident record to prevent tampering), automatic notification to the builder owner and designated safety officer, OSHA reporting deadline countdown (8 hours for fatality/hospitalization, 24 hours for amputation/eye loss) with escalating alerts, witness statement collection with tamper-evident digital signatures, investigation assignment with mandatory root cause analysis before the incident can be marked resolved, and a corrective action plan with follow-up verification. The incident record must be immutable once finalized (append-only amendments permitted) for legal defensibility.

2. **Vendor with poor safety record visibility during hiring decisions.** When a builder is evaluating vendors for a new project or task, the vendor's safety history must be prominently visible -- not buried in a secondary tab. The system must surface safety metrics (incident count, incident severity, OSHA violation history, EMR rating, certification compliance status) directly in the vendor selection and bid comparison workflows (Module 22, Module 20). Vendors with active safety compliance issues (expired certifications, unresolved incidents, EMR above configurable threshold) must display a visible warning badge. Builders can configure whether a poor safety record blocks vendor assignment or is advisory only.

3. **Proactive safety management beyond record-keeping.** The system must go beyond documenting incidents after they happen. Proactive safety features include: safety observation trend analysis that identifies emerging hazard patterns before they result in incidents (e.g., "Fall protection observations have increased 40% this month on Project X"), automated risk assessments based on project characteristics (multi-story, confined space, heavy equipment presence), pre-task safety planning integration with the scheduling module (high-risk tasks trigger safety checklist requirements), and periodic safety score reports that highlight projects or trades trending in the wrong direction. The goal is to shift the platform from reactive documentation to predictive safety intelligence.

### Integration with Vendor Performance
- Safety violations by trade create negative marks on vendor scorecard
- Vendor safety record visible during bid evaluation and vendor selection
- Vendor EMR tracking as part of vendor qualification
- Safety incident costs attributed to responsible vendor when applicable
- Vendor safety compliance status: green (compliant), yellow (expiring), red (non-compliant)

### Safety Scoring & Analytics
- Project safety score: composite of observations, incidents, training compliance, certification status
- Company-wide safety dashboard: incident rates, observation trends, training completion %
- EMR (Experience Modification Rate) calculator from platform data
- TRIR (Total Recordable Incident Rate) calculation per project and company-wide
- DART (Days Away, Restricted, or Transferred) rate tracking
- Benchmarking against industry averages (when sufficient platform data exists)

---

## Database Tables

```
safety_observations
  id, builder_id, project_id, observed_by, observation_type (positive|hazard),
  category, severity, description, corrective_action, photo_urls,
  vendor_id, is_anonymous, created_at

safety_incidents
  id, builder_id, project_id, incident_date, incident_time, location,
  reported_by, incident_type (injury|near_miss|property_damage),
  osha_classification, description, immediate_actions,
  investigation_status, root_cause, corrective_action_plan,
  vendor_id, employee_id, is_osha_reportable, created_at, updated_at

incident_witnesses
  id, incident_id, witness_name, statement, signature_url, statement_date

safety_certifications
  id, builder_id, holder_type (employee|vendor), holder_id,
  certification_type, certification_number, issued_date, expiration_date,
  issuing_authority, document_url, status

toolbox_talks
  id, builder_id, project_id, topic, scheduled_date, conducted_by,
  duration_minutes, notes, document_url, created_at

toolbox_talk_attendance
  id, talk_id, attendee_type (employee|vendor_worker), attendee_name,
  signature_url, company

safety_scores
  id, builder_id, project_id, period_start, period_end,
  observation_score, incident_score, training_score,
  certification_score, composite_score, calculated_at

osha_300_log
  id, builder_id, establishment, year, case_number, employee_name,
  job_title, incident_date, injury_description, classification,
  days_away, days_restricted, created_from_incident_id
```

---

## API Endpoints

```
GET    /api/v2/safety/observations                # List observations (filter by project, type, severity)
POST   /api/v2/safety/observations                # Submit observation
GET    /api/v2/safety/observations/:id            # Observation detail

GET    /api/v2/safety/incidents                   # List incidents
POST   /api/v2/safety/incidents                   # Report incident
GET    /api/v2/safety/incidents/:id               # Incident detail with investigation
PATCH  /api/v2/safety/incidents/:id               # Update investigation status
POST   /api/v2/safety/incidents/:id/witnesses     # Add witness statement

GET    /api/v2/safety/certifications              # List certifications (filter by holder, status)
POST   /api/v2/safety/certifications              # Add certification
PATCH  /api/v2/safety/certifications/:id          # Update certification
GET    /api/v2/safety/certifications/expiring     # Certifications expiring within N days

GET    /api/v2/safety/toolbox-talks               # List toolbox talks
POST   /api/v2/safety/toolbox-talks               # Schedule / log toolbox talk
POST   /api/v2/safety/toolbox-talks/:id/attendance # Record attendance

GET    /api/v2/safety/scores/:projectId           # Safety scores for project
GET    /api/v2/safety/dashboard                   # Company-wide safety dashboard
GET    /api/v2/safety/osha/300-log/:year          # OSHA 300 log for year
GET    /api/v2/safety/osha/300a-summary/:year     # OSHA 300A annual summary
```

---

## Dependencies

| Module | Relationship |
|--------|-------------|
| Module 3: Core Data Model | Project and crew context |
| Module 8: Daily Logs | Safety observations linked to daily log entries |
| Module 10: Contact/Vendor Management | Vendor safety records affect vendor scorecard |
| Module 34: HR & Workforce | Employee certification tracking, training records |
| Module 6: Document Storage | Incident photos, certification documents, training materials |
| Module 5: Notification Engine | Certification expiration alerts, OSHA deadline reminders |

---

## Open Questions

1. Should safety observations be required as part of daily log submission, or independent?
2. How do we handle multi-employer worksite liability tracking when multiple subs are on site?
3. Should the platform provide pre-built OSHA compliance checklists, or are these always builder-created?
4. What is the retention period for safety records? OSHA requires 5 years for 300 logs -- does the platform enforce this?
5. Should safety scores factor into automated vendor selection or just be advisory?
