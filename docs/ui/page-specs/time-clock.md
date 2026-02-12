# View Plan: Time Clock & Tracking

## Views Covered
1. Time Clock (Mobile)
2. Time Entries List
3. Timesheet Approval
4. Labor Reports

---

## Purpose
Track field labor hours:
- GPS-verified clock in/out
- Job and cost code assignment
- Break tracking
- Overtime calculation
- Payroll integration

---

## 1. Time Clock (Mobile)
URL: /mobile/timeclock

Layout:
- Large clock in/out button
- Current status display
- Active job selection
- GPS location indicator
- Break button

Features:
- One-tap clock in/out
- GPS verification
- Photo capture option
- Offline mode with sync
- Push notifications

---

## 2. Time Entries List
URL: /time-tracking

Features:
- Date range filter
- Employee filter
- Job filter
- Edit capabilities (admin)
- Export to CSV

Entry Fields:
- Employee
- Date
- Clock In/Out times
- Job
- Cost Code
- Hours (calculated)
- Overtime hours
- Notes

---

## 3. Timesheet Approval
URL: /time-tracking/approve

Workflow:
Submitted -> PM Review -> Approved -> Payroll Export

Features:
- Batch approval
- Exception flagging
- Missing entry alerts
- Overtime warnings

---

## 4. Labor Reports
URL: /reports/labor

Reports:
- Hours by job
- Hours by employee
- Overtime summary
- Cost analysis
- Productivity trends

AI Enhancement:
- Anomaly detection (unusual hours)
- Productivity scoring
- Predictive labor needs

---

## Database Schema

time_entries:
- id UUID
- company_id UUID
- employee_id UUID
- job_id UUID
- cost_code_id UUID
- clock_in TIMESTAMPTZ
- clock_out TIMESTAMPTZ
- clock_in_location POINT
- clock_out_location POINT
- break_minutes INTEGER
- status TEXT (draft/submitted/approved)
- approved_by UUID
- approved_at TIMESTAMPTZ
- notes TEXT

---

## Mobile Considerations
- Works offline with sync queue
- Low battery mode
- Background location tracking
- Quick job switching

---

## Gap Items Addressed

### From Section 37: HR & Workforce (Items 558-563)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 558 | HR as core vs. optional module | Time Clock is separate from HR; Requires: module toggle — time tracking can be enabled independently of full HR |
| 559 | Employee onboarding checklists (builder-configurable) | Requires: onboarding checklist that includes time clock setup, app install, GPS permissions |
| 560 | Employee certification tracking (OSHA 10/30, first aid, equipment operator) | Requires: certification check before clock-in — warn if expired certifications for job-site work |
| 561 | Employee performance tracking tied to project outcomes | Labor Reports include productivity trends and cost analysis; Requires: link hours to project profitability metrics |
| 562 | Time tracking for hourly employees (clock in/out, GPS verification, overtime calculation) | Core feature: GPS-verified clock in/out, break tracking, overtime calculation all present in spec |
| 563 | Labor burden calculation (base wage + benefits + taxes + insurance = actual cost/hour) | Requires: configurable burden rate per employee or per role, applied to time entries for true cost reporting |

### From Section 45: Per-Page Feature Requirements (Items 736-753 — Daily Log)
| Gap # | Description | Relevance to Time Clock |
|-------|-------------|------------------------|
| 738 | Workforce tracker — which vendors on site, how many workers each | Time entries feed the workforce tracker on daily logs; Requires: vendor crew tracking alongside employee time |
| 746 | Linked schedule tasks — work relates to task X | time_entries schema has job_id and cost_code_id; Requires: optional task_id linking |
| 748 | Voice-to-text entry option | Requires: voice-to-text for time entry notes on mobile |

### From Section 36: Tax & Regulatory (Items 547-552)
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 551 | 1099 reporting varies by builder | Time entries for subcontractors vs. employees must be distinguished for tax reporting |
| 552 | Payroll tax for builders with W-2 employees | Timesheet Approval -> Payroll Export flow must generate data compatible with payroll systems |

### From Section 33: Integrations (Items 506-520)
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 514 | Bulk data import/export (CSV, Excel, JSON) | Time Entries List has CSV export; Requires: also support import for historical data migration |

### From Competitive Parity (Section 51)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 887 | Buildertrend: Time clock for employees and subs | Core spec covers employee time clock; Requires: sub time tracking or integration with vendor portal daily logs |

### From Edge Cases (Sections 44, 47, 48)
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 602 | Project paused 12 months — schedule restart | Time tracking must handle project pause/resume with no orphaned active clock-ins |
| 606 | Key employee incapacitated — documentation continuity | Time records must be accessible by PM/admin, not locked to individual user |
| 814 | Progress billing when work complete but not inspected | Time entries serve as evidence of work completion for billing disputes |
| 826 | Multi-day power outage — offline capability | Offline mode with sync queue covers this; Requires: extended offline storage (days, not hours) |
| 829 | Field connectivity dead zones | Offline mode and background sync address poor connectivity |
| 827 | Photo metadata discrepancies (camera time vs. server time) | GPS clock-in timestamps should use server time with device time as fallback, noting discrepancies |

---

## Revision History
| Date | Change |
|------|--------|
| 2026-02-11 | Added Gap Items Addressed section from gap analysis sections 33, 36, 37, 44-48, 51 |
| Initial | Created from view planning |
