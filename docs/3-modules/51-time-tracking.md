# Module 51: Time Tracking & Labor Management

**Phase:** 2 - Construction Core
**Status:** TODO
**Last Updated:** 2026-02-20

---

## Overview

Dedicated time tracking and labor management for construction field workers, replacing paper timesheets with GPS-geotagged clock-in/out, per-job per-cost-code time allocation, crew time entry (superintendent mode), configurable overtime rules, break tracking, multi-step approval workflows, payroll integration/export, and real-time job costing integration. Designed mobile-first for field workers with large clock-in/out buttons, offline support with background sync, and one-tap time entry for returning workers.

This module goes BEYOND what Daily Logs (Module 08) captures. Daily Logs record who was on site and general crew hours for the daily record. This module tracks precise clock-in/out times with GPS verification, allocates labor hours to specific cost codes for job costing accuracy, calculates overtime per configurable rules (daily, weekly, double-time, state-specific), enforces break compliance, supports prevailing wage and union rate lookups, generates certified payroll reports, and feeds approved labor costs directly into Module 09 (Budget & Cost Tracking) and Module 11 (Native Accounting).

Key differentiators from generic time tracking:
- **GPS geofencing** validates workers are on-site before allowing clock-in.
- **Photo verification** prevents buddy punching (selfie at clock-in).
- **Superintendent crew entry** allows bulk time entry for an entire crew from one screen.
- **Prevailing wage and union rate support** with automatic rate lookup by trade and classification.
- **Certified payroll report generation** for government and prevailing wage projects.
- **Labor cost posting** to budget lines happens automatically on timesheet approval.

---

## Gap Items Addressed

| GAP # | Description | Priority |
|-------|-------------|----------|
| GAP-400 | GPS-geotagged clock-in/out with geofence validation | High |
| GAP-401 | Photo verification at clock-in to prevent buddy punching | Medium |
| GAP-402 | Per-job, per-cost-code time allocation for accurate job costing | High |
| GAP-403 | Superintendent bulk crew time entry from one screen | High |
| GAP-404 | Configurable overtime rules (daily, weekly, double-time, state-specific) | High |
| GAP-405 | Automatic overtime calculation on timesheet approval with cost preview | High |
| GAP-406 | Break tracking with configurable paid/unpaid rules and compliance alerts | Medium |
| GAP-407 | Multi-step approval workflow (worker -> superintendent -> PM/office) | High |
| GAP-408 | Dispute workflow for rejected time entries | Medium |
| GAP-409 | Payroll export to ADP, Gusto, QuickBooks Payroll with configurable column mapping | High |
| GAP-410 | Prevailing wage support with rate-by-jurisdiction lookup | High |
| GAP-411 | Union rate support with automatic trade/classification rate lookup | Medium |
| GAP-412 | Certified payroll report generation for government projects | High |
| GAP-413 | Labor cost auto-posting to budget lines on timesheet approval | High |
| GAP-414 | Labor burden rate configuration (base + burden) per worker or company default | Medium |
| GAP-415 | Offline clock-in/out with background sync when connected | High |
| GAP-416 | Split time entry when worker moves between job sites mid-day | Medium |
| GAP-417 | Duplicate detection when superintendent entry overlaps mobile self-tracking | Medium |
| GAP-418 | Night shift time entries spanning midnight date boundary handling | Medium |
| GAP-419 | Auto-clock-out rules for forgotten clock-outs | Medium |
| GAP-420 | Hours by worker, job, cost code, trade, period reporting | High |
| GAP-421 | Overtime report showing OT hours and cost impact | Medium |
| GAP-422 | Attendance report: tardiness, absences, patterns | Medium |
| GAP-423 | Labor productivity: hours per unit of work completed | Medium |
| GAP-424 | Estimated vs actual labor hours comparison by cost code | High |

---

## Detailed Requirements

### 51.1 GPS-Geotagged Clock In/Out (GAP-400, GAP-401)

Workers clock in and out from their mobile device. Every punch captures precise location and time data for accountability and compliance.

**Clock-In Flow:**
1. Worker opens app and taps large "Clock In" button on mobile home screen.
2. System captures GPS coordinates (latitude/longitude with accuracy radius).
3. System validates GPS against job site geofence boundary:
   - **Within geofence**: clock-in proceeds normally.
   - **Outside geofence, within buffer zone** (configurable, default 500m): clock-in allowed with warning banner "You are outside the job site boundary."
   - **Outside geofence, beyond buffer zone**: clock-in blocked with message "You must be at the job site to clock in" (if `geofence_required` is enabled in builder config) or allowed with warning flag (if geofence is advisory-only).
4. If `photo_required` is enabled in builder config, worker takes a selfie photo that is stored with the time entry as clock-in verification.
5. Worker selects job (auto-selected if assigned to only one active job) and default cost code (pre-filled from worker's trade/role assignment).
6. Clock-in recorded with timestamp, GPS, photo URL, and entry method (`mobile`).

**Clock-Out Flow:**
1. Worker taps "Clock Out" button.
2. GPS coordinates captured at clock-out location.
3. System calculates total hours (clock-out minus clock-in minus break deductions).
4. Worker reviews hours summary and can add notes before confirming.
5. Time entry transitions to `draft` status ready for submission.

**Offline Support (GAP-415):**
- If device has no connectivity at clock-in/out time, the punch is stored locally on the device with GPS and timestamp.
- Background sync pushes the punch to the server when connectivity is restored.
- Offline punches are flagged in the system as "synced late" with the original device timestamp preserved.
- GPS coordinates captured at time of offline punch (not at sync time).

**Geofence Configuration:**
- Job site geofence defined as a center point (lat/lng) plus radius in meters.
- Geofence can also be defined as a polygon for irregular site boundaries.
- Geofence managed per job in Module 03 (Core Data Model) job record.
- Builder config controls whether geofence is required, advisory, or disabled.

#### Edge Cases & What-If Scenarios

1. **Worker clocks in from a location with poor GPS accuracy:** When GPS accuracy is worse than a configurable threshold (default: 100m), the system records the punch but flags it with a "Low GPS Accuracy" warning. The superintendent sees flagged entries in their review queue. The punch is NOT blocked because construction sites in urban canyons, basements, and steel-framed buildings frequently have degraded GPS. If the builder requires strict geofence enforcement, a secondary validation method is offered: the worker can scan a QR code posted at the site entrance instead.

2. **Worker's phone battery dies mid-shift, cannot clock out:** The system detects an open clock-in with no clock-out by the end of the configurable workday window (default: 12 hours after clock-in). Auto-clock-out rules engage: (a) if `auto_clock_out` is enabled, the system creates a clock-out at the configured default end time (e.g., 5:00 PM) with status `auto_closed` and a note "Auto-closed: no clock-out received," (b) the worker and superintendent are notified the next morning, (c) the worker or superintendent can edit the auto-generated clock-out time before submission, and (d) the time entry is flagged for mandatory superintendent review before approval.

3. **Worker attempts to clock in twice without clocking out:** The system detects an existing open time entry for the worker and prevents a duplicate clock-in. The worker sees a message: "You are already clocked in at [Job Name] since [time]. Clock out first or contact your superintendent." If the original clock-in is from a previous day (forgotten clock-out), the system prompts: "You have an open clock-in from [date]. Would you like to close it now?"

4. **Buddy punching attempt (worker clocks in for a friend):** When photo verification is enabled, the clock-in photo is stored and visible to the superintendent during review. Future enhancement: facial recognition matching against employee profile photo (Phase 2 of this module). For now, photo verification is a deterrent — the superintendent manually reviews clock-in photos when entries seem suspicious. The system flags entries where the clock-in GPS location changes significantly between consecutive punches (e.g., worker "clocked in" at two different sites within 5 minutes).

### 51.2 Per-Job, Per-Cost-Code Time Allocation (GAP-402)

Time can be split across multiple jobs and cost codes within a single day. This is critical for accurate job costing, especially for workers who move between job sites.

**Single-Job Day (Simple Case):**
- Worker clocks in at Job A, works all day, clocks out. All hours allocated to Job A under the worker's default cost code.
- Worker can change the cost code during the shift (e.g., switched from framing to cleanup).

**Multi-Job Day (Split Case):**
- Worker clocks out at Job A, drives to Job B, clocks in at Job B. Two separate time entries.
- Alternatively, superintendent allocates the worker's total day (e.g., 4 hours Job A framing, 4 hours Job B cleanup) using the allocation table.

**Cost Code Allocation:**
- Every time entry has a primary `cost_code_id` from the time entry record.
- For split allocations within a single time entry, the `v2_time_entry_allocations` table allows distributing hours across multiple job/cost-code combinations.
- Sum of allocation hours must equal total entry hours (system validates on save).
- Default cost code assignment configurable per worker role/trade in builder settings (e.g., all electricians default to cost code "260 - Electrical").

#### Edge Cases & What-If Scenarios

1. **Worker clocks in at one job site, drives to another mid-day — split time entry required:** When a worker is clocked in at Job A and needs to go to Job B, the correct workflow is: (a) clock out at Job A (GPS captured at Job A), (b) drive to Job B, (c) clock in at Job B (GPS captured at Job B). This creates two separate time entries with accurate location data. However, if the worker forgets to clock out at Job A and clocks in at Job B, the system detects the conflict: "You are still clocked in at [Job A]. Do you want to (1) Clock out of Job A now and clock in to Job B, or (2) Cancel?" Option 1 creates two entries: Job A clock-out at current time (with a flag noting the GPS is at Job B, not Job A) and Job B clock-in at current time. The superintendent is notified of the split and can adjust the clock-out time for Job A.

2. **Cost code allocation does not sum to total hours:** When a superintendent creates allocations for a time entry that do not sum to the total hours worked, the system prevents saving with an error: "Allocations total [X] hours but the time entry is [Y] hours. Please adjust allocations to match." If allocations are less than total hours, the system offers: "Assign remaining [Z] hours to [default cost code]?"

### 51.3 Crew Time Entry — Superintendent Mode (GAP-403)

Superintendents manage large crews and need to enter time for multiple workers efficiently. The superintendent mode provides a spreadsheet-like interface for bulk time entry.

**Crew Roster:**
- "Quick Roster" defaults to yesterday's crew for this job — superintendent confirms who is on-site today.
- Add/remove workers from roster with search (by name, trade, or employee ID).
- Save roster as a template for recurring crew compositions (e.g., "Framing Crew A").
- Roster grouped by trade: all electricians together, all framers together, all laborers together.

**Bulk Time Entry:**
1. Superintendent sets a default start time and end time for the entire crew (e.g., 7:00 AM - 3:30 PM).
2. System applies default times to all workers in the roster.
3. Superintendent adjusts individual workers as needed (late arrival, early departure, different hours).
4. Cost code defaults to each worker's assigned trade cost code; superintendent can override per worker.
5. Break deductions applied per builder config (e.g., 30 min unpaid lunch auto-deducted).

**Batch Operations:**
- Select multiple workers -> apply same time adjustment (e.g., "these 5 workers left at 2:00 PM").
- Select trade group -> assign different cost code (e.g., "all electricians to cost code 262 - Electrical Rough").
- Copy yesterday's timesheet with adjustments.

#### Edge Cases & What-If Scenarios

1. **Superintendent enters time for worker who was also tracking via mobile — duplicate detection (GAP-417):** When the superintendent submits crew time and a worker already has a mobile-tracked time entry for the same job and date, the system detects the duplicate: (a) the superintendent sees a warning: "[Worker Name] already has a mobile time entry for [date] at [Job Name]: [clock-in] to [clock-out]," (b) the superintendent chooses: "Keep mobile entry" (discards superintendent entry for that worker), "Keep my entry" (marks mobile entry as superseded), or "Merge" (use mobile clock-in time with superintendent clock-out time), (c) the superseded entry is soft-deleted with a reference to the replacement entry for audit, (d) if the worker has not yet submitted their mobile entry, the superintendent's entry takes precedence and the worker is notified: "Your superintendent has entered time for you on [date]."

2. **Superintendent enters time for 50+ workers and the form times out:** The system auto-saves crew time entry every 30 seconds. If connectivity is lost, local draft is preserved. On reconnect, the system detects the draft and offers to resume. Partial submissions are supported — if 30 of 50 workers are saved before a failure, the remaining 20 are preserved as a draft for completion.

### 51.4 Overtime Calculation (GAP-404, GAP-405)

Overtime rules are highly configurable per builder because they vary by state, union contract, and company policy.

**Configurable OT Rules (v2_time_config):**

| Rule | Field | Default | Description |
|------|-------|---------|-------------|
| Daily OT | `ot_daily_threshold` | 8.0 | Hours after which daily OT starts |
| Weekly OT | `ot_weekly_threshold` | 40.0 | Hours after which weekly OT starts |
| Daily Double-Time | `dt_daily_threshold` | 12.0 | Hours after which daily DT starts |
| Consecutive Day DT | `dt_consecutive_day_threshold` | 7 | Nth consecutive day triggers DT |

**State-Specific Rule Examples:**
- **California**: Daily OT after 8 hours, daily DT after 12 hours, weekly OT after 40 hours, 7th consecutive day is all DT.
- **Federal (most states)**: Weekly OT only after 40 hours, no daily OT.
- **Nevada**: Daily OT after 8 hours if worker earns less than 1.5x minimum wage.

**OT Calculation Engine:**
1. When a timesheet is submitted for approval, the system calculates OT automatically:
   - Gather all time entries for the worker for the pay period.
   - Apply daily OT rules first (if configured): hours beyond threshold for each day become OT hours.
   - Apply weekly OT rules: total hours beyond weekly threshold become OT (minus any hours already counted as daily OT to avoid double-counting).
   - Apply DT rules: hours beyond DT threshold become double-time.
   - Apply consecutive day rules: if 7th consecutive day worked, all hours on that day become DT.
2. OT hours populate `hours_ot` and `hours_dt` fields on the time entry.
3. Regular hours populate `hours_regular`.

**OT Preview (GAP-405):**
- Before approval, the approver sees an OT preview showing:
  - Total regular hours, OT hours, DT hours for the period.
  - Cost impact: (OT hours x 1.5x rate) + (DT hours x 2.0x rate) = total labor cost.
  - Comparison to budget: labor cost vs. budgeted labor for the cost code.
- Approver can adjust time entries before approving if OT seems incorrect.

#### Edge Cases & What-If Scenarios

1. **Time entry spans midnight (night shift) — date boundary handling (GAP-418):** When a worker's shift crosses midnight (e.g., clock-in 10:00 PM Monday, clock-out 6:30 AM Tuesday), the system handles the date boundary as follows: (a) the time entry record stores the actual clock-in and clock-out timestamps (no artificial splitting), (b) for daily OT calculation purposes, the system attributes hours to the calendar day on which the clock-in occurred (Monday gets all 8.5 hours in this example), (c) the builder can configure an alternative rule: split hours at midnight (Monday gets 2 hours, Tuesday gets 6.5 hours), (d) for weekly OT calculation, the total weekly hours are unaffected by the split because both days fall in the same work week, (e) if the shift crosses a pay period boundary (e.g., clock-in Friday night, clock-out Saturday morning, and Saturday is in the next pay period), the system splits the entry at midnight for payroll purposes and flags it for superintendent review, and (f) the timesheet weekly view displays night-shift entries on the clock-in date with a visual indicator showing the shift spans two dates.

2. **Prevailing wage project where rates change mid-week (GAP-410):** When a worker is on a prevailing wage project and the prevailing wage rate changes effective Wednesday, the system: (a) looks up the `effective_date` and `end_date` on the `v2_pay_rates` record, (b) applies Rate A to Monday-Tuesday time entries and Rate B to Wednesday-Friday time entries, (c) the timesheet shows a rate-change indicator on Wednesday, (d) the payroll export splits the week into two rate groups with separate line items, (e) the certified payroll report reflects the correct rate for each day, and (f) if the rate change is retroactive (discovered after timesheets are already approved), the system allows re-processing approved entries with the new rate and generates a variance report showing the cost difference.

### 51.5 Break Tracking (GAP-406)

Break rules vary by state and company policy. The system tracks breaks for compliance and accurate pay calculation.

**Configurable Break Rules (v2_time_config):**
- `auto_break_deduct`: boolean — if true, system automatically deducts break time.
- `break_duration_minutes`: integer — default break duration to deduct (e.g., 30, 60).
- `break_paid`: boolean — whether the auto-deducted break is paid or unpaid.
- Additional break rules stored in JSONB for complex configurations.

**Break Tracking Modes:**
1. **Auto-deduct mode**: System automatically deducts configured break duration from total hours. Worker does not need to track breaks manually. This is the simplest mode for builders who just want a standard lunch deduction.
2. **Manual break mode**: Worker taps "Start Break" and "End Break" on their mobile device. Actual break duration recorded. Multiple breaks per shift supported.
3. **Hybrid mode**: Auto-deduct a minimum break, but allow workers to record additional breaks.

**State Compliance Alerts:**
- California: meal break required before 5th hour of work, second meal break before 10th hour. If break is not taken, 1 hour of premium pay owed.
- System alerts the superintendent if a worker's timesheet shows no break on a shift longer than the state-mandated threshold.
- Compliance alerts are informational — they flag potential issues for the superintendent to review, not auto-correct.

#### Edge Cases & What-If Scenarios

1. **Worker takes a shorter break than required by state law:** When a California worker takes a 20-minute lunch instead of the required 30 minutes, the system flags the entry: "Break compliance alert: [Worker Name] took a 20-minute break on a [X]-hour shift. California requires a 30-minute meal break before the 5th hour. Premium pay of 1 hour may apply." The superintendent reviews the flag during approval and can either (a) confirm the worker chose to waive the break (requires worker acknowledgment, stored in the system), or (b) add 1 hour of premium pay to the time entry. The system does not auto-add premium pay because the determination requires human judgment (worker may have had a valid short-break waiver on file).

2. **Auto-deduct break applied to a short shift that should not have a break deduction:** When a worker works a 3-hour shift and auto-deduct is configured to deduct 30 minutes, the system should NOT deduct a break from shifts shorter than a configurable threshold (default: 5 hours). The system checks shift duration before applying auto-deduction: (a) shifts under the threshold get no break deduction, (b) shifts between 5-10 hours get one break deduction, (c) shifts over 10 hours get two break deductions (configurable).

### 51.6 Approval Workflow (GAP-407, GAP-408)

Multi-step approval ensures timesheet accuracy before payroll processing.

**Default Workflow (configurable per builder in v2_time_config):**

| Step | Actor | Action |
|------|-------|--------|
| 1 | Worker | Submits daily or weekly timesheet (`draft` -> `submitted`) |
| 2 | Superintendent | Reviews and approves or rejects (`submitted` -> `approved` or `rejected`) |
| 3 | PM/Office | Final review for payroll processing (`approved` -> `exported`) |

**Submission:**
- Worker reviews their time entries for the day or week and taps "Submit."
- Submission validates: all entries have clock-out times, cost codes assigned, allocations sum correctly.
- Once submitted, the worker cannot edit entries (superintendent must return them).

**Superintendent Review:**
- Review queue shows all submitted timesheets for the superintendent's jobs.
- Side-by-side view: timesheet alongside daily log labor records for cross-reference.
- Bulk approval: select multiple workers and approve in one action.
- Individual adjustment: superintendent can modify hours, cost codes, or allocations before approving.
- Any superintendent modification is logged in the audit trail with the original worker-submitted values preserved.

**Rejection and Dispute (GAP-408):**
- Superintendent rejects a time entry with a required reason note.
- Worker receives notification of rejection with the reason.
- Worker can edit and resubmit the entry.
- Worker can also "dispute" the rejection if they disagree:
  - Dispute escalates to PM/office for resolution.
  - PM sees both the worker's original entry and the superintendent's rejection reason.
  - PM makes final determination (approve as-is, approve with modifications, or uphold rejection).
- Dispute history tracked for pattern analysis (repeated disputes from the same superintendent/worker pair flagged for HR review).

**Batch Approval:**
- Superintendent selects multiple workers -> "Approve All Selected."
- System shows OT preview summary for all selected workers before batch approval.
- If any selected entry has a flag (GPS warning, duplicate detection, break compliance), the system forces individual review for that entry.

#### Edge Cases & What-If Scenarios

1. **Superintendent approves time, then realizes an error after payroll export:** Once a time entry reaches `exported` status, it cannot be modified through normal workflows. To correct an exported entry: (a) PM/office creates an "adjustment entry" — a new time entry of type `adjustment` that references the original entry, (b) the adjustment entry can be positive (add hours) or negative (reduce hours), (c) the adjustment goes through the same approval workflow, (d) on next payroll export, the adjustment is included as a separate line item, (e) the original entry's audit trail shows the linked adjustment, and (f) for certified payroll reports, adjustments appear as corrections on the next period's report with a reference to the original period.

2. **Worker is on two jobs managed by two different superintendents:** When a worker splits their day between Job A (Superintendent X) and Job B (Superintendent Y), each superintendent only sees and approves the time entries for their own job. The PM/office level sees the worker's combined timesheet across all jobs for the week, which is necessary for accurate weekly OT calculation. Weekly OT is calculated at the worker level across all jobs, not per-job. The cost of OT hours is allocated proportionally across the jobs or assigned to the job where the OT hours were actually worked (configurable per builder).

### 51.7 Payroll Integration & Export (GAP-409, GAP-410, GAP-411, GAP-412)

Approved timesheets are exported for payroll processing. The system supports multiple export formats and payroll system integrations.

**Export Formats:**
- **CSV/Excel export**: configurable column mapping to match the builder's payroll system requirements. Builder admin defines which columns appear, column headers, date format, hour format (decimal vs. HH:MM), and sort order.
- **ADP integration**: formatted export matching ADP's import template (employee ID, regular hours, OT hours, DT hours, earnings code, department code).
- **Gusto integration**: API-based push of approved hours (when Gusto API access is configured).
- **QuickBooks Payroll integration**: formatted export or direct sync via Module 16 (QuickBooks Integration).

**Pay Period Alignment:**
- Builder configures pay period type: weekly, bi-weekly, semi-monthly, monthly.
- Pay period start day configurable (e.g., week starts Sunday, bi-weekly starts on specific date).
- Timesheet view and export automatically align to pay period boundaries.
- Workers who start mid-period have pro-rated first period.

**Prevailing Wage Support (GAP-410):**
- Projects flagged as "prevailing wage" in the job record.
- Prevailing wage rates stored in `v2_pay_rates` with `rate_type = 'prevailing'` and linked to the job's jurisdiction.
- When a worker logs time on a prevailing wage project, the system looks up the applicable rate by the worker's trade and classification.
- If no matching rate is found, the system alerts the office: "No prevailing wage rate configured for [trade] [classification] in [jurisdiction]. Time entry cannot be exported until rate is set."
- Prevailing wage rate includes both base rate and fringe benefits breakdown.

**Union Rate Support (GAP-411):**
- Similar to prevailing wage but with `rate_type = 'union'`.
- Union rates may include multiple components: base wage, health/welfare, pension, training fund, vacation.
- Rate lookup by union local, trade, and classification.
- Union rate tables can be bulk-imported from CSV.

**Certified Payroll Reports (GAP-412):**
- Generated for government and prevailing wage projects.
- Report format follows federal WH-347 form layout.
- Includes: contractor info, project info, payroll period, employee name, work classification, hours worked by day, rate of pay, gross amount earned, deductions, net wages.
- Reports generated per project per pay period.
- Reports go through their own review/approval workflow before submission.
- Report status tracked: `draft`, `reviewed`, `submitted`, `accepted`.
- Historical reports stored and accessible for audit (DOL audits may review up to 3 years of records).

#### Edge Cases & What-If Scenarios

1. **Worker works on both a prevailing wage project and a standard project in the same week:** The system maintains separate pay rates per time entry based on the job's rate type. (a) Time entries on the prevailing wage job use the prevailing rate, (b) time entries on the standard job use the worker's standard rate, (c) the payroll export includes both rate types as separate line items with different earnings codes, (d) OT calculation uses the weighted average rate or the rate of the job where OT hours were worked (configurable), and (e) the certified payroll report only includes hours worked on the prevailing wage project.

2. **Payroll export is generated but then a timesheet correction is discovered:** The system prevents re-exporting the same time entries (to avoid double-payment). If a correction is needed after export: (a) create an adjustment entry (per the approval workflow edge case above), (b) the next payroll export includes only the adjustment entries plus any new approved entries, (c) the system maintains an export log showing which entries were included in each export batch with timestamp and exported-by user, and (d) the export log is cross-referenced during payroll reconciliation.

### 51.8 Job Costing Integration (GAP-413, GAP-414)

Approved labor hours automatically flow into Module 09 (Budget & Cost Tracking) as actual labor costs.

**Labor Cost Calculation:**
- `Labor Cost = Hours x Loaded Rate`
- `Loaded Rate = Base Hourly Rate + Burden Rate`
- Burden rate includes: employer payroll taxes, workers' comp insurance, general liability, health insurance contribution, and other employer-paid costs.
- Burden rate configurable per worker (in `v2_pay_rates`) or as a company-wide default percentage in `v2_time_config`.

**Auto-Posting on Approval:**
- When a time entry is approved, the system creates a labor cost record in Module 09:
  - Job ID, cost code, labor hours (regular, OT, DT), labor cost (regular cost + OT premium + DT premium).
  - OT cost = OT hours x base rate x 0.5 (the premium portion; base already counted in regular).
  - DT cost = DT hours x base rate x 1.0 (the premium portion).
- Labor costs appear on the job's budget dashboard in real-time after approval.
- Cost code variance alerts: if labor costs for a cost code exceed the budget by a configurable threshold (default: 10%), the PM is notified.

**Real-Time Visibility:**
- Dashboard widget: "Labor Costs This Week" showing hours and cost by job.
- Budget view: labor cost line items from time tracking are distinguished from other costs (invoices, materials).
- Drill-down: click on a labor cost line item to see the underlying time entries.

#### Edge Cases & What-If Scenarios

1. **Worker's pay rate changes mid-period:** When a worker receives a raise effective Wednesday and has approved time entries from Monday-Tuesday at the old rate and Wednesday-Friday at the new rate, the system: (a) looks up the `effective_date` on `v2_pay_rates` and applies the correct rate per day, (b) labor costs posted to Module 09 reflect the actual rate for each day, (c) if the rate change is retroactive, previously posted labor costs are recalculated and a variance adjustment is posted, and (d) the recalculation creates an audit trail entry showing old cost, new cost, and reason for adjustment.

2. **Labor burden rate is updated after timesheets are already posted to the budget:** The system does NOT retroactively re-calculate historical labor cost postings when the burden rate changes. The new burden rate applies to future approvals only. If the builder needs to restate historical costs (e.g., for year-end accounting), an admin function can trigger a bulk recalculation for a specified date range, which creates adjustment entries in Module 09 with a clear audit trail.

### 51.9 Mobile-First Design (GAP-415)

The time tracking interface is designed for field workers using smartphones, often with gloves, in bright sunlight, and with intermittent connectivity.

**Mobile Home Screen:**
- Large, prominent "Clock In" / "Clock Out" button — minimum 60x60px tap target.
- Current status display: "Clocked in at [Job Name] since [time] — [X] hours so far."
- One-tap time entry for returning workers: "Same as yesterday?" button pre-fills job, cost code, and times from the previous day's entry.
- Quick-switch job button for workers who move between sites.

**Offline Capability:**
- Time entries created and stored locally when offline.
- Background sync service pushes entries when connectivity is restored.
- Conflict resolution: if a superintendent entered time for the worker while the worker was offline, the duplicate detection logic (see 51.3) resolves the conflict on sync.
- Offline indicator clearly shown in the app: "Offline — your time will sync when connected."
- Local storage encrypted for security (time entries contain employee and location data).

**Field-Optimized UX:**
- Large font sizes for outdoor visibility.
- High-contrast color scheme.
- Minimal typing required — dropdowns, pre-filled fields, and voice input where possible.
- Swipe gestures for common actions (swipe to submit, swipe to add a break).
- Works on both iOS and Android via responsive web (progressive web app) or Module 40 (Mobile App) native wrapper.

### 51.10 Reporting (GAP-420 through GAP-424)

Comprehensive labor reporting for project managers, office staff, and executives.

**Hours Reports (GAP-420):**
- Hours by worker: total hours per worker for a date range, broken down by regular/OT/DT.
- Hours by job: total labor hours per job for a date range, broken down by cost code.
- Hours by cost code: total hours across all jobs for a specific cost code.
- Hours by trade: total hours grouped by trade/classification.
- Hours by period: weekly, bi-weekly, monthly summary views.
- All reports filterable by date range, job, worker, trade, cost code, and status.

**Overtime Report (GAP-421):**
- Total OT and DT hours by worker, by job, by period.
- Cost impact: additional cost of OT/DT over regular rate.
- Trends: OT hours trending up or down over time.
- Outliers: workers with significantly higher OT than peers in the same role.
- Budget impact: OT cost vs. budgeted labor by cost code.

**Attendance Report (GAP-422):**
- Tardiness tracking: workers who clock in after the scheduled start time.
- Absence tracking: expected workers who did not clock in (based on crew roster).
- Pattern analysis: workers with recurring tardiness or absences by day of week.
- No-show alerts: if a rostered worker has not clocked in by a configurable time (default: 30 min after scheduled start), superintendent is notified.

**Labor Productivity Report (GAP-423):**
- Hours per unit of work completed (e.g., hours per square foot of framing, hours per linear foot of pipe).
- Requires integration with schedule task completion data from Module 07.
- Comparison across jobs: which jobs are more/less efficient for similar work.
- Comparison across workers: which crews are more productive (used carefully — for process improvement, not punitive tracking).

**Estimated vs. Actual Hours Report (GAP-424):**
- Side-by-side comparison of estimated labor hours (from Module 20 estimates or Module 09 budgets) vs. actual tracked hours.
- Variance by cost code: which cost codes are over/under budget on labor.
- Percentage complete vs. percentage of labor budget consumed.
- Projection: at current burn rate, will the labor budget be exceeded?

---

## Database Tables

### v2_time_entries
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders, multi-tenant |
| worker_id | UUID | FK -> users |
| job_id | UUID | FK -> jobs |
| cost_code_id | UUID | FK -> cost_codes |
| clock_in | TIMESTAMPTZ | Clock-in timestamp |
| clock_out | TIMESTAMPTZ | Clock-out timestamp, nullable (open entry) |
| hours_regular | DECIMAL(5,2) | Calculated regular hours |
| hours_ot | DECIMAL(5,2) | Calculated overtime hours (1.5x) |
| hours_dt | DECIMAL(5,2) | Calculated double-time hours (2.0x) |
| break_minutes | INTEGER | Total break minutes deducted |
| gps_lat_in | DECIMAL(10,7) | Clock-in latitude |
| gps_lng_in | DECIMAL(10,7) | Clock-in longitude |
| gps_lat_out | DECIMAL(10,7) | Clock-out latitude |
| gps_lng_out | DECIMAL(10,7) | Clock-out longitude |
| gps_accuracy_in | DECIMAL(7,2) | GPS accuracy at clock-in (meters) |
| gps_accuracy_out | DECIMAL(7,2) | GPS accuracy at clock-out (meters) |
| photo_url_in | VARCHAR(500) | Clock-in verification photo (Supabase Storage path) |
| entry_method | VARCHAR(20) | 'mobile', 'kiosk', 'manual', 'superintendent' |
| entry_type | VARCHAR(20) | 'regular', 'adjustment' — adjustments reference original |
| original_entry_id | UUID | FK -> v2_time_entries, nullable (for adjustments) |
| status | VARCHAR(20) | 'draft', 'submitted', 'approved', 'rejected', 'exported', 'auto_closed' |
| submitted_at | TIMESTAMPTZ | |
| approved_by | UUID | FK -> users |
| approved_at | TIMESTAMPTZ | |
| rejected_by | UUID | FK -> users |
| rejected_at | TIMESTAMPTZ | |
| rejection_reason | TEXT | Required when status = 'rejected' |
| exported_at | TIMESTAMPTZ | When exported to payroll |
| export_batch_id | UUID | FK -> v2_payroll_exports |
| pay_rate | DECIMAL(8,2) | Rate applied (base hourly rate) |
| pay_rate_type | VARCHAR(20) | 'regular', 'prevailing', 'union' |
| burden_rate | DECIMAL(8,2) | Employer burden rate applied |
| notes | TEXT | Worker or superintendent notes |
| flags | JSONB | System flags: low_gps, off_site, late_sync, duplicate, break_compliance |
| is_offline_entry | BOOLEAN | True if created offline and synced later |
| synced_at | TIMESTAMPTZ | When offline entry synced to server |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | Soft delete |

### v2_time_entry_allocations
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| time_entry_id | UUID | FK -> v2_time_entries |
| builder_id | UUID | FK -> builders, multi-tenant |
| job_id | UUID | FK -> jobs |
| cost_code_id | UUID | FK -> cost_codes |
| hours | DECIMAL(5,2) | Hours allocated to this job/cost code |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### v2_time_config
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders, unique |
| ot_daily_threshold | DECIMAL(4,1) | Hours after which daily OT starts (null = no daily OT) |
| ot_weekly_threshold | DECIMAL(4,1) | Hours after which weekly OT starts (default 40.0) |
| dt_daily_threshold | DECIMAL(4,1) | Hours after which daily DT starts (null = no daily DT) |
| dt_consecutive_day_threshold | INTEGER | Nth consecutive workday triggers DT (null = disabled) |
| auto_break_deduct | BOOLEAN | Auto-deduct break from total hours |
| break_duration_minutes | INTEGER | Break duration to deduct (default 30) |
| break_paid | BOOLEAN | Whether auto-deducted break is paid |
| break_rules | JSONB | Complex break rules (state-specific thresholds, multiple breaks) |
| pay_period_type | VARCHAR(20) | 'weekly', 'bi_weekly', 'semi_monthly', 'monthly' |
| pay_period_start_day | INTEGER | 0=Sunday through 6=Saturday for weekly; date for semi-monthly |
| geofence_required | BOOLEAN | Block clock-in outside geofence (vs. advisory warning) |
| geofence_buffer_meters | INTEGER | Buffer zone beyond geofence boundary (default 500) |
| photo_required | BOOLEAN | Require selfie photo at clock-in |
| auto_clock_out_enabled | BOOLEAN | Auto-close open entries at end of day |
| auto_clock_out_time | TIME | Time to auto-close (e.g., '17:00') |
| auto_clock_out_after_hours | DECIMAL(4,1) | Auto-close after X hours (e.g., 12.0) |
| default_approval_workflow | VARCHAR(20) | 'single' (superintendent only), 'double' (superintendent + PM) |
| night_shift_split_at_midnight | BOOLEAN | Split night shift hours at midnight for daily OT (default false) |
| ot_allocation_method | VARCHAR(20) | 'proportional', 'last_job' — how OT cost is allocated across jobs |
| default_burden_rate_pct | DECIMAL(5,2) | Company-wide default burden rate as percentage (e.g., 35.00 = 35%) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### v2_pay_rates
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders, multi-tenant |
| worker_id | UUID | FK -> users, nullable (null = rate for all workers of this trade) |
| job_id | UUID | FK -> jobs, nullable (null = rate applies to all jobs) |
| rate_type | VARCHAR(20) | 'standard', 'prevailing', 'union' |
| trade | VARCHAR(100) | Trade classification (e.g., 'Electrician', 'Carpenter') |
| classification | VARCHAR(100) | Sub-classification (e.g., 'Journeyman', 'Apprentice') |
| hourly_rate | DECIMAL(8,2) | Base hourly rate |
| burden_rate | DECIMAL(8,2) | Per-hour burden cost (alternative to percentage) |
| fringe_rate | DECIMAL(8,2) | Fringe benefits rate (prevailing/union) |
| jurisdiction | VARCHAR(100) | Jurisdiction for prevailing wage (e.g., 'Los Angeles County') |
| union_local | VARCHAR(100) | Union local number (e.g., 'IBEW Local 11') |
| effective_date | DATE | Rate effective start date |
| end_date | DATE | Rate expiration date, nullable (null = no end) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### v2_time_breaks
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| time_entry_id | UUID | FK -> v2_time_entries |
| builder_id | UUID | FK -> builders, multi-tenant |
| break_start | TIMESTAMPTZ | |
| break_end | TIMESTAMPTZ | Nullable (open break) |
| duration_minutes | INTEGER | Calculated or auto-deducted |
| break_type | VARCHAR(20) | 'meal', 'rest', 'other' |
| is_paid | BOOLEAN | |
| is_auto_deducted | BOOLEAN | True if system auto-deducted, false if worker-tracked |
| created_at | TIMESTAMPTZ | |

### v2_payroll_exports
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders, multi-tenant |
| period_start | DATE | Pay period start |
| period_end | DATE | Pay period end |
| export_format | VARCHAR(50) | 'csv', 'adp', 'gusto', 'quickbooks' |
| file_url | VARCHAR(500) | Generated export file path |
| entry_count | INTEGER | Number of time entries included |
| total_regular_hours | DECIMAL(8,2) | |
| total_ot_hours | DECIMAL(8,2) | |
| total_dt_hours | DECIMAL(8,2) | |
| total_labor_cost | DECIMAL(12,2) | |
| exported_by | UUID | FK -> users |
| exported_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### v2_certified_payroll_reports
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders, multi-tenant |
| job_id | UUID | FK -> jobs |
| period_start | DATE | Report period start |
| period_end | DATE | Report period end |
| report_number | INTEGER | Sequential report number per job |
| status | VARCHAR(20) | 'draft', 'reviewed', 'submitted', 'accepted' |
| reviewed_by | UUID | FK -> users |
| reviewed_at | TIMESTAMPTZ | |
| submitted_at | TIMESTAMPTZ | |
| generated_by | UUID | FK -> users |
| generated_at | TIMESTAMPTZ | |
| file_url | VARCHAR(500) | Generated WH-347 form PDF |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### v2_time_disputes
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| time_entry_id | UUID | FK -> v2_time_entries |
| builder_id | UUID | FK -> builders, multi-tenant |
| disputed_by | UUID | FK -> users (worker) |
| dispute_reason | TEXT | Worker's explanation |
| original_hours | DECIMAL(5,2) | What worker submitted |
| rejected_hours | DECIMAL(5,2) | What superintendent approved/modified to |
| resolution | VARCHAR(20) | 'pending', 'upheld', 'overturned', 'modified' |
| resolved_by | UUID | FK -> users (PM/office) |
| resolved_at | TIMESTAMPTZ | |
| resolution_notes | TEXT | |
| created_at | TIMESTAMPTZ | |

### v2_crew_rosters
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders, multi-tenant |
| job_id | UUID | FK -> jobs |
| name | VARCHAR(255) | Roster name (e.g., 'Framing Crew A') |
| superintendent_id | UUID | FK -> users |
| worker_ids | UUID[] | Array of worker user IDs |
| is_default | BOOLEAN | Use as default roster for this job |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v2/time-entries | List time entries (paginated, filterable by job, worker, date, status) |
| GET | /api/v2/time-entries/:id | Get single time entry with allocations and breaks |
| POST | /api/v2/time-entries | Create time entry (manual entry) |
| PUT | /api/v2/time-entries/:id | Update draft time entry |
| DELETE | /api/v2/time-entries/:id | Soft-delete time entry (draft only) |
| POST | /api/v2/time-entries/clock-in | Clock in with GPS and optional photo |
| POST | /api/v2/time-entries/clock-out | Clock out with GPS |
| POST | /api/v2/time-entries/bulk | Superintendent bulk crew time entry |
| POST | /api/v2/time-entries/:id/break/start | Start a break |
| POST | /api/v2/time-entries/:id/break/end | End a break |
| POST | /api/v2/time-entries/:id/submit | Worker submits time entry for approval |
| POST | /api/v2/time-entries/:id/approve | Superintendent/PM approves time entry |
| POST | /api/v2/time-entries/:id/reject | Reject time entry with reason |
| POST | /api/v2/time-entries/bulk-approve | Batch approve multiple entries |
| POST | /api/v2/time-entries/:id/dispute | Worker disputes rejected entry |
| POST | /api/v2/time-entries/:id/dispute/resolve | PM resolves dispute |
| GET | /api/v2/time-entries/timesheet | Weekly timesheet view for a worker (query: worker_id, week_start) |
| GET | /api/v2/time-entries/crew-timesheet | Weekly crew timesheet for superintendent (query: job_id, week_start) |
| POST | /api/v2/time-entries/export/payroll | Generate payroll export file |
| GET | /api/v2/time-entries/export/history | List past payroll exports |
| GET | /api/v2/time-entries/reports/labor-cost | Labor cost report (query: job_id, cost_code_id, period) |
| GET | /api/v2/time-entries/reports/overtime | Overtime report (query: date_range, worker_id, job_id) |
| GET | /api/v2/time-entries/reports/attendance | Attendance report (query: date_range, job_id) |
| GET | /api/v2/time-entries/reports/productivity | Labor productivity report |
| GET | /api/v2/time-entries/reports/estimated-vs-actual | Budget vs actual labor hours |
| GET | /api/v2/time-config | Get builder's time tracking configuration |
| PUT | /api/v2/time-config | Update builder's time tracking configuration |
| GET | /api/v2/pay-rates | List pay rates (filterable by worker, trade, rate_type) |
| POST | /api/v2/pay-rates | Create pay rate |
| PUT | /api/v2/pay-rates/:id | Update pay rate |
| DELETE | /api/v2/pay-rates/:id | Soft-delete pay rate |
| POST | /api/v2/pay-rates/import | Bulk import pay rates from CSV |
| GET | /api/v2/certified-payroll | List certified payroll reports |
| POST | /api/v2/certified-payroll/generate | Generate certified payroll report for job/period |
| PUT | /api/v2/certified-payroll/:id/review | Review/approve certified payroll report |
| POST | /api/v2/certified-payroll/:id/submit | Submit certified payroll report |
| GET | /api/v2/crew-rosters | List crew rosters for a job |
| POST | /api/v2/crew-rosters | Create crew roster |
| PUT | /api/v2/crew-rosters/:id | Update crew roster |
| DELETE | /api/v2/crew-rosters/:id | Soft-delete crew roster |

---

## UI Components

| Component | Description |
|-----------|-------------|
| ClockInOutButton | Large prominent clock-in/out button for mobile home screen with status display |
| TimeEntryForm | Manual time entry form with job, cost code, times, and notes |
| TimesheetWeeklyView | Weekly timesheet grid showing daily entries for a worker with totals |
| CrewTimesheetView | Superintendent spreadsheet-like bulk entry for entire crew by trade |
| CrewRosterManager | Manage crew rosters: add/remove workers, save templates, quick-roster from yesterday |
| TimeEntryAllocationSplit | Split time across multiple jobs/cost codes with validation |
| OvertimePreviewPanel | OT/DT calculation preview showing hours breakdown and cost impact |
| ApprovalQueue | Superintendent/PM review queue with bulk approve, flag indicators, and daily log cross-ref |
| TimeEntryDisputeForm | Worker dispute submission form with original vs. rejected hours comparison |
| DisputeResolutionPanel | PM dispute resolution interface with timeline and determination actions |
| BreakTracker | Break start/end UI with compliance indicator |
| GPSStatusIndicator | Shows current GPS accuracy, geofence status, and offline status |
| PhotoVerificationCapture | Selfie camera capture for clock-in verification |
| PayrollExportWizard | Step-by-step payroll export: select period, review OT, configure format, export |
| PayrollExportHistory | List of past exports with download links and entry counts |
| CertifiedPayrollGenerator | WH-347 report generation with preview and submit workflow |
| TimeConfigPanel | Builder admin settings for OT rules, breaks, geofence, pay periods, approval workflow |
| PayRateManager | CRUD interface for pay rates by worker, trade, rate type, and effective dates |
| LaborCostDashboardWidget | Dashboard widget showing labor hours and cost by job for current period |
| HoursReport | Filterable report: hours by worker, job, cost code, trade, period |
| OvertimeReport | OT/DT hours and cost impact report with trend charts |
| AttendanceReport | Tardiness and absence tracking with pattern analysis |
| ProductivityReport | Hours per unit of work completed with job and crew comparisons |
| EstimatedVsActualReport | Budget vs. actual labor hours by cost code with variance highlighting |
| MobileTimeShell | Mobile-optimized wrapper with offline queue indicator and large tap targets |

---

## Dependencies

- **Module 03: Core Data Model** -- jobs, users, cost codes, companies (builder_id) for multi-tenancy
- **Module 05: Notification Engine** -- approval notifications, rejection alerts, break compliance reminders, no-show alerts, dispute notifications
- **Module 07: Scheduling** -- schedule task data for labor productivity reporting (hours per unit of work)
- **Module 08: Daily Logs** -- labor data cross-reference during superintendent review (daily log crew hours vs. time entries)
- **Module 09: Budget & Cost Tracking** -- labor cost auto-posting on timesheet approval, budget vs. actual reporting
- **Module 11: Native Accounting (GL/AP/AR) / Native Accounting** -- labor cost journal entries for accounting integration
- **Module 16: QuickBooks Integration** -- QuickBooks Payroll export format and sync
- **Module 20: Estimating Engine** -- estimated labor hours for comparison reporting
- **Module 34: HR & Workforce** -- employee records, trade classifications, certifications, workers' comp class codes
- **Module 40: Mobile App** -- native mobile wrapper for offline-first time tracking, GPS access, camera access
- **External: GPS/Geolocation API** -- device-native location services for geofence validation
- **External: Camera API** -- device camera for photo verification at clock-in

---

## RLS Policies

All tables use Row Level Security with `builder_id` for multi-tenant isolation.

| Table | Policy | Description |
|-------|--------|-------------|
| v2_time_entries | SELECT | Workers see own entries; superintendents see entries for their jobs; PM/office see all for builder |
| v2_time_entries | INSERT | Workers create own entries; superintendents create for workers on their jobs |
| v2_time_entries | UPDATE | Workers update own drafts; superintendents update submitted entries on their jobs; PM/office update approved entries |
| v2_time_entry_allocations | ALL | Same as parent time entry access |
| v2_time_config | SELECT | All authenticated users for their builder |
| v2_time_config | UPDATE | Admin and owner roles only |
| v2_pay_rates | SELECT | PM, office, admin, owner roles |
| v2_pay_rates | INSERT/UPDATE | Admin and owner roles only |
| v2_certified_payroll_reports | SELECT | PM, office, admin, owner roles |
| v2_certified_payroll_reports | INSERT/UPDATE | Office, admin, owner roles |
| v2_time_disputes | SELECT | Involved worker, superintendent, PM, office, admin |
| v2_time_disputes | INSERT | Worker who owns the rejected time entry |
| v2_crew_rosters | SELECT | Superintendent for their jobs; PM/office/admin for all builder jobs |
| v2_crew_rosters | INSERT/UPDATE | Superintendent, PM, admin roles |

---

## Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| v2_time_entries | idx_time_entries_builder | builder_id | Multi-tenant query performance |
| v2_time_entries | idx_time_entries_worker_date | builder_id, worker_id, clock_in | Worker timesheet lookup |
| v2_time_entries | idx_time_entries_job_date | builder_id, job_id, clock_in | Job labor report |
| v2_time_entries | idx_time_entries_status | builder_id, status | Approval queue filtering |
| v2_time_entries | idx_time_entries_cost_code | builder_id, cost_code_id | Cost code reporting |
| v2_time_entries | idx_time_entries_export | builder_id, status, exported_at | Payroll export query |
| v2_time_entry_allocations | idx_allocations_entry | time_entry_id | Join to parent entry |
| v2_time_entry_allocations | idx_allocations_job_cost | builder_id, job_id, cost_code_id | Job costing report |
| v2_pay_rates | idx_pay_rates_lookup | builder_id, worker_id, rate_type, effective_date | Rate lookup |
| v2_pay_rates | idx_pay_rates_trade | builder_id, trade, classification, rate_type | Trade rate lookup |
| v2_certified_payroll_reports | idx_certified_payroll_job | builder_id, job_id, period_start | Report lookup |
| v2_time_disputes | idx_disputes_entry | time_entry_id | Dispute lookup |
| v2_time_breaks | idx_breaks_entry | time_entry_id | Break lookup by entry |
| v2_crew_rosters | idx_rosters_job | builder_id, job_id | Roster lookup by job |

---

## Open Questions

1. Should the geofence boundary be defined per-job as a simple radius or support complex polygons for irregularly-shaped job sites? Polygon support is more accurate but significantly more complex to configure. Recommend starting with center-point + radius and adding polygon support in a later iteration.

2. How should OT be allocated across multiple jobs when a worker splits their day? Options: (a) proportional to hours worked at each job, (b) all OT assigned to the job where the worker exceeded the threshold, (c) all OT assigned to the last job of the day. Each method has different cost implications. The builder should be able to configure this.

3. Should the system support kiosk mode (a shared tablet at the job site entrance) for clock-in/out in addition to individual mobile devices? Kiosk mode would require worker identification (PIN, badge scan, or facial recognition) instead of device-based authentication.

4. For certified payroll reports, should the system support state-specific report formats beyond the federal WH-347 form? Some states (California, New York) have their own certified payroll formats.

5. Should time entries integrate with Module 08 (Daily Logs) bidirectionally — i.e., when a worker clocks in, should that automatically create a labor entry on the day's daily log? Or should the two systems remain loosely coupled with cross-reference reporting only?

6. How should the system handle workers who are employed by a subcontractor but tracked through the general contractor's time system? Should sub-employer workers have a different entity type, or should they be regular users with a "sub-employer" attribute?

7. Should payroll export support real-time API integration with ADP/Gusto from day one, or start with file-based export (CSV) and add API integrations in a future phase? API integrations require OAuth setup and ongoing maintenance. Recommend CSV first.

8. For the labor productivity report (hours per unit of work), what units of work should be supported? This requires close integration with Module 07 schedule tasks that have quantity tracking (e.g., "Install 500 LF of pipe"). Should we require tasks to have quantity fields, or should productivity measurement be optional?

9. Should workers be able to see their own OT calculations in real-time (gamification risk — workers might slow down to hit OT), or should OT only be visible to superintendents and above? Recommend making this configurable per builder.

10. How should the system handle time zone changes? A builder operating in multiple states may have jobs in different time zones. Worker's device time zone vs. job site time zone vs. builder's home office time zone — which governs? Recommend using the job site's time zone for all time entries on that job.
