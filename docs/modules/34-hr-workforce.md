# Module 34: HR & Workforce Management

**Phase:** 5 - Full Platform
**Status:** TODO
**Optional Module:** Yes -- larger builders need it, smaller builders use external HR tools

---

## Overview

Construction-specific workforce management covering time tracking with GPS verification,
timesheet approval workflows, labor burden calculation, certification and license tracking,
crew scheduling, employee onboarding, PTO management, and payroll data export. Designed
for builders with W-2 employees (field superintendents, project managers, laborers, office
staff) who need to track labor costs accurately and maintain compliance with employment
and safety regulations.

This module is NOT a full HRIS replacement. It focuses on the construction-specific needs
that generic HR software handles poorly: GPS-verified time tracking on job sites, labor
burden calculation including workers' comp class codes, crew-to-project assignment, and
certification tracking for trade licenses and safety training.

---

## Gap Items Addressed

| Gap # | Description | Resolution |
|-------|-------------|------------|
| 558 | HR as optional module -- small builders do not need it | Feature-flagged per tenant; integrates with external HR when disabled |
| 559 | Employee onboarding checklists that are builder-configurable | Configurable onboarding templates per role with task assignments |
| 560 | Employee certification tracking (OSHA, first aid, equipment operator) | Certification registry with expiration alerts, ties to Module 33 safety compliance |
| 561 | Employee performance tracking tied to project outcomes | PM profitability tracking, crew productivity metrics, project outcome correlation |
| 562 | Time tracking for hourly employees (clock in/out, GPS, overtime) | GPS-verified clock in/out with geofencing, automatic overtime calculation per state rules |
| 563 | Labor burden calculation (wage + benefits + taxes + insurance = actual cost/hr) | Configurable burden rate calculator with per-employee and per-class-code rates |

---

## Detailed Requirements

### Time Tracking with GPS
- Mobile clock in/out with GPS location capture at each punch
- Geofenced job sites: auto-suggest project based on GPS proximity
- Geofence violation alerts (clocked in but not at job site)
- Photo verification option at clock-in (configurable per builder)
- Break tracking with configurable paid/unpaid break rules per state
- Drive time tracking between job sites (configurable: billable or not)
- Daily time log: project, cost code, hours, description of work
- Split time across multiple projects in a single day
- Offline clock-in with GPS sync when connectivity returns

### Timesheet Approval Workflow
- Weekly timesheet summary generated from daily clock entries
- Employee review and submission step
- Supervisor/PM first-level approval
- Owner/admin final approval (configurable: single or multi-level)
- Rejection with notes and resubmission workflow
- Approval deadline alerts (timesheets due every Monday by noon, etc.)
- Locked timesheets after approval: edits require formal amendment
- Batch approval for supervisors managing multiple crew members
- Overtime flagging: highlight hours exceeding 40/week or 8/day (state-dependent)

### Labor Burden Calculation
- Base wage rate per employee
- Burden rate components (all configurable per builder):
  - FICA / Social Security / Medicare
  - Federal and state unemployment (FUTA/SUTA)
  - Workers' compensation (by class code, by state)
  - Health insurance contribution
  - Retirement / 401k match
  - PTO accrual cost
  - Other benefits (vehicle allowance, phone stipend, etc.)
- Fully burdened hourly rate calculation per employee
- Burden rate by workers' comp class code (different rate for carpenter vs. superintendent)
- Project labor cost = hours x fully burdened rate (feeds financial reporting)
- Annual burden rate review workflow with rate effective dates

### Certification & License Tracking
- Employee certifications: trade licenses, OSHA cards, equipment operator, first aid/CPR
- License details: number, issuing authority, issue date, expiration date, document upload
- Expiration alerts at configurable intervals (90 days, 60 days, 30 days, expired)
- Auto-block: prevent scheduling uncertified employee for tasks requiring certification
- Renewal tracking: reminder, renewal submitted, renewed, lapsed
- Integration with Module 33 (Safety): certifications shared between HR and safety modules
- State license verification integration where APIs exist

### Crew Scheduling
- Crew definition: named groups of employees assigned together
- Crew-to-project assignment with date ranges
- Crew availability calendar: who is on which project, who is available
- Conflict detection: employee double-booked across projects
- Schedule view: by employee (my schedule), by project (who is here), by company (everyone)
- Integration with Module 7 (Scheduling): crew availability affects task scheduling
- PTO and absence visibility on crew schedule

### Employee Onboarding & Management
- Configurable onboarding checklist per role (field, office, management)
- Task assignment: HR tasks, IT tasks, safety training tasks
- Document collection: W-4, I-9, direct deposit, emergency contact
- New hire orientation tracking
- Employee directory with contact info, role, certifications, assigned projects
- PTO accrual tracking with configurable policies
- Employee separation workflow: exit checklist, equipment return, access revocation

### Payroll Data Export
- Timesheet export in configurable format (CSV, QuickBooks, ADP, Gusto, Paychex)
- Export includes: employee ID, hours by type (regular, OT, PTO), project allocation
- Pay period configuration: weekly, biweekly, semi-monthly
- Payroll integration API for supported providers
- Pre-export validation: flag missing timesheets, unapproved hours, discrepancies

---

## Database Tables

```
employees
  id, builder_id, user_id, employee_number, hire_date, termination_date,
  role, department, base_wage, pay_type (hourly|salary), workers_comp_class,
  status (active|inactive|terminated), created_at, updated_at

time_entries
  id, builder_id, employee_id, project_id, cost_code,
  clock_in, clock_out, clock_in_gps, clock_out_gps,
  break_minutes, total_hours, overtime_hours, description,
  photo_verification_url, is_offline_entry, created_at

timesheets
  id, builder_id, employee_id, period_start, period_end,
  total_regular_hours, total_overtime_hours, total_pto_hours,
  status (draft|submitted|approved|rejected|amended),
  submitted_at, approved_by, approved_at, rejection_notes

labor_burden_rates
  id, builder_id, employee_id, workers_comp_class, effective_date,
  base_wage, fica_rate, futa_rate, suta_rate, workers_comp_rate,
  health_insurance, retirement_match, pto_accrual_rate,
  other_benefits, fully_burdened_rate

employee_certifications
  id, builder_id, employee_id, certification_type, certification_number,
  issuing_authority, issued_date, expiration_date, document_url,
  status (active|expiring|expired|renewed), created_at

crews
  id, builder_id, name, supervisor_id, is_active

crew_members
  id, crew_id, employee_id, role_in_crew

crew_assignments
  id, crew_id, project_id, start_date, end_date, notes

onboarding_templates
  id, builder_id, role, name, is_active

onboarding_tasks
  id, template_id, task_name, assigned_to_role, due_days_after_hire,
  is_required, sequence_order

employee_onboarding
  id, employee_id, template_id, start_date, status, completed_at

employee_onboarding_items
  id, onboarding_id, task_id, status, completed_by, completed_at, notes

pto_balances
  id, employee_id, year, pto_type (vacation|sick|personal),
  accrued, used, remaining
```

---

## API Endpoints

```
GET    /api/v2/employees                          # Employee directory
POST   /api/v2/employees                          # Add employee
GET    /api/v2/employees/:id                      # Employee profile
PATCH  /api/v2/employees/:id                      # Update employee

POST   /api/v2/time-entries                       # Clock in / manual entry
PATCH  /api/v2/time-entries/:id                   # Clock out / edit entry
GET    /api/v2/time-entries                       # List time entries (filter by employee, project, date)

GET    /api/v2/timesheets                         # List timesheets (filter by period, status)
POST   /api/v2/timesheets/:id/submit              # Employee submits timesheet
POST   /api/v2/timesheets/:id/approve             # Supervisor approves
POST   /api/v2/timesheets/:id/reject              # Supervisor rejects with notes

GET    /api/v2/labor-burden/:employeeId           # Burden rates for employee
PUT    /api/v2/labor-burden/:employeeId           # Update burden rates

GET    /api/v2/crews                              # List crews
POST   /api/v2/crews                              # Create crew
GET    /api/v2/crews/:id/schedule                 # Crew schedule
POST   /api/v2/crew-assignments                   # Assign crew to project

GET    /api/v2/certifications/employees           # All employee certifications
GET    /api/v2/certifications/expiring            # Expiring certifications

GET    /api/v2/payroll/export                     # Generate payroll export
GET    /api/v2/payroll/export/preview             # Preview export before generating
```

---

## Dependencies

| Module | Relationship |
|--------|-------------|
| Module 1: Auth & Access | Employee user accounts and role assignments |
| Module 3: Core Data Model | Project assignments and cost code structure |
| Module 7: Scheduling | Crew availability affects task scheduling |
| Module 33: Safety & Compliance | Shared certification tracking, safety training records |
| Module 5: Notification Engine | Certification expiration alerts, timesheet reminders |
| Module 19: Financial Reporting | Labor costs feed project financial reports |
| Module 40: Mobile App | GPS-verified clock in/out from the field |

---

## Open Questions

1. Should the platform handle actual payroll processing, or strictly export data to payroll providers?
2. How do we handle employees who work for the builder AND are also subcontractors on some jobs?
3. What overtime rules apply? Federal (40hr/week) or state-specific (CA: 8hr/day)? Configurable per builder location?
4. Should crew scheduling integrate with weather data to auto-suggest rain day rescheduling?
5. How do we handle prevailing wage projects where labor rates differ from the builder's standard rates?
6. What is the minimum GPS accuracy threshold for a valid clock-in location? What happens when GPS is unavailable indoors?
