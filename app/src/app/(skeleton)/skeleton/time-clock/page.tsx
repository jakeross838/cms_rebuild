'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { TimeClockPreview } from '@/components/skeleton/previews/time-clock-preview'
import { cn } from '@/lib/utils'

export default function TimeClockSkeleton() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'preview'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <Eye className="h-4 w-4" />
          UI Preview
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'spec'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Specification
        </button>
      </div>

      {activeTab === 'preview' ? (
        <TimeClockPreview />
      ) : (
        <PageSpec
          title="Time Clock & Workforce Management"
          phase="Phase 5 - Full Platform (Module 34)"
          planFile="docs/modules/34-hr-workforce.md"
          description="GPS-enabled time tracking with geofence verification, timesheet approval workflows (single/multi-level), labor burden calculation with full transparency, crew scheduling, payroll data export, break tracking with state-specific rules, overtime calculation, and offline clock-in capability. Tracks labor costs accurately with workers comp class codes and fully burdened hourly rates."
          workflow={['Clock In (GPS)', 'Log Work', 'Break Tracking', 'Clock Out', 'Timesheet Review', 'Approve/Reject', 'Payroll Export']}
          features={[
            'Mobile clock in/out with GPS location capture',
            'Geofenced job sites: auto-suggest project based on proximity',
            'Geofence violation alerts (clocked in but not at job site)',
            'Photo verification option at clock-in (configurable)',
            'Break tracking with configurable paid/unpaid rules per state',
            'Drive time tracking between job sites (billable or not)',
            'Split time across multiple projects in a single day',
            'Offline clock-in with GPS sync when connectivity returns',
            'Weekly timesheet summary from daily clock entries',
            'Multi-level approval workflow (supervisor -> owner/admin)',
            'Rejection with notes and resubmission workflow',
            'Batch approval for supervisors managing multiple crew members',
            'Overtime flagging: 40/week or 8/day (state-dependent)',
            'Locked timesheets after approval (edits require formal amendment)',
            'Timesheet dispute workflow with audit trail',
            'Labor burden calculation: base + FICA + FUTA/SUTA + WC + insurance + retirement + PTO',
            'Fully burdened hourly rate per employee and workers comp class',
            'Burden rate "Show Calculation" transparency view',
            'Crew-to-project assignment with date ranges and conflict detection',
            'Payroll export: CSV, QuickBooks, ADP, Gusto, Paychex formats',
            'Pre-export validation: missing timesheets, unapproved hours',
            'Union/non-union employee support with separate rules',
          ]}
          connections={[
            { name: 'Core Data Model (M03)', type: 'input', description: 'Project assignments and cost code structure' },
            { name: 'Scheduling (M07)', type: 'bidirectional', description: 'Crew availability affects task scheduling' },
            { name: 'Budget & Cost Tracking (M09)', type: 'output', description: 'Labor costs update budget actuals' },
            { name: 'Daily Logs (M08)', type: 'output', description: 'Time data feeds daily log manpower section' },
            { name: 'Financial Reporting (M19)', type: 'output', description: 'Labor costs feed project financial reports' },
            { name: 'Safety & Compliance (M33)', type: 'bidirectional', description: 'Shared certification tracking, training records' },
            { name: 'Notification Engine (M05)', type: 'output', description: 'Certification alerts, timesheet reminders' },
            { name: 'Auth & Access (M01)', type: 'input', description: 'Employee user accounts and role assignments' },
            { name: 'Mobile App (M40)', type: 'input', description: 'GPS-verified clock in/out from the field' },
          ]}
          dataFields={[
            { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
            { name: 'builder_id', type: 'uuid', required: true, description: 'Tenant ID (company_id)' },
            { name: 'employee_id', type: 'uuid', required: true, description: 'FK to employees' },
            { name: 'project_id', type: 'uuid', description: 'FK to projects' },
            { name: 'cost_code', type: 'string', description: 'Cost code assignment' },
            { name: 'clock_in', type: 'timestamp', required: true, description: 'Clock in time' },
            { name: 'clock_out', type: 'timestamp', description: 'Clock out time' },
            { name: 'clock_in_gps', type: 'point', description: 'GPS coordinates at clock in' },
            { name: 'clock_out_gps', type: 'point', description: 'GPS coordinates at clock out' },
            { name: 'geofence_status', type: 'string', description: 'inside | outside | unknown' },
            { name: 'break_minutes', type: 'integer', description: 'Total break time in minutes' },
            { name: 'total_hours', type: 'decimal', description: 'Calculated work hours' },
            { name: 'overtime_hours', type: 'decimal', description: 'Overtime hours' },
            { name: 'photo_verification_url', type: 'string', description: 'Photo at clock in' },
            { name: 'is_offline_entry', type: 'boolean', description: 'Submitted while offline' },
            { name: 'description', type: 'text', description: 'Work description' },
            { name: 'status', type: 'string', required: true, description: 'pending | approved | flagged | rejected | disputed' },
            { name: 'timesheet_id', type: 'uuid', description: 'FK to weekly timesheet' },
            { name: 'base_wage', type: 'decimal', description: 'Employee base hourly rate' },
            { name: 'burdened_rate', type: 'decimal', description: 'Fully burdened hourly rate' },
            { name: 'workers_comp_class', type: 'string', description: 'Workers comp classification code' },
          ]}
          aiFeatures={[
            { name: 'GPS Geofence Verification', description: 'Auto-verifies clock-in location matches job site geofence. Flags entries outside boundary with distance and suggests correct job site.', trigger: 'On clock in/out' },
            { name: 'Anomaly Detection', description: 'Flags unusual time entries: excessive hours (10+), abnormal break patterns, wrong location, inconsistent patterns. "James Thompson 45min break exceeds 30min policy."', trigger: 'On timesheet review' },
            { name: 'Break Compliance', description: 'Monitors state-specific break laws (CA 8hr/day, SC federal 40hr/week) and sends reminders. "4-hour mark approaching for Sarah Chen - break required per CA law."', trigger: 'During shift' },
            { name: 'Cost Code Suggestion', description: 'Suggests cost code based on job phase, worker role, and recent history. "David Nguyen at Johnson Beach House (finish phase) + Finish Carpenter role = FN-300."', trigger: 'On clock in' },
            { name: 'Overtime Projection', description: 'Projects weekly overtime and calculates burdened cost impact. "Lisa Martinez trending to 48h this week. Additional burdened OT cost: $390."', trigger: 'Mid-week analysis' },
            { name: 'Payroll Export Validation', description: 'Pre-validates payroll export for missing timesheets, unapproved hours, and mathematical discrepancies before generating file.', trigger: 'On export request' },
          ]}
          mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Time Clock Management       Week of Feb 10  [Payroll Export] [+]   │
├─────────────────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│ │42.9h │ │  2   │ │ 6.5h │ │  1   │ │ 83%  │ │  2   │           │
│ │Today │ │Clock │ │ OT   │ │Flaggd│ │ GPS  │ │Tmsht │           │
│ │Hours │ │  In  │ │ Week │ │      │ │Verify│ │Pendng│           │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘           │
│ Connected: Budget | Daily Logs | Financial | Scheduling | Payroll │
├─────────────────────────────────────────────────────────────────────┤
│ Team | Entries | Timesheets | Pending Review | AI Insights          │
├─────────────────────────────────────────────────────────────────────┤
│ TEAM OVERVIEW                                                       │
│ ┌──────────────────────────┐ ┌──────────────────────────┐          │
│ │ Marcus Rodriguez  ● Off  │ │ Sarah Chen        ● In   │          │
│ │ Crew Alpha | FR Lead     │ │ Crew Bravo | HVAC        │          │
│ │ 42.5h | OT: 2.5h | 2 job│ │ 40h | OT: 0 | 3 jobs    │          │
│ │ Base: $38 | Burdened: $56│ │ Base: $42 | Burdened: $62│          │
│ │ WC: 5403 - Carpentry     │ │ WC: 5183 - HVAC          │          │
│ └──────────────────────────┘ └──────────────────────────┘          │
│                                                                     │
│ TIMESHEETS (Feb 3-9)                                                │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ Marcus: 40+2.5 OT | $2,389 burdened | Status: Submitted       ││
│ │ Sarah:  40h       | $2,486 burdened | Status: Approved ✓       ││
│ │ Lisa:   40+4 OT   | $1,497 burdened | Status: Rejected ✗      ││
│ └─────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│ 💡 AI: "Lisa trending 48h. Marcus outside geofence (offline).      │
│ 2 timesheets pending Monday deadline."                              │
└─────────────────────────────────────────────────────────────────────┘
`}
        />
      )}
    </div>
  )
}
