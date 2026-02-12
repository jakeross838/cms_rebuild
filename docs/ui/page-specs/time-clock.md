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
