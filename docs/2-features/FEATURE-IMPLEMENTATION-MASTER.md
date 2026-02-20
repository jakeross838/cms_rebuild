# BuildDesk Feature Implementation Master Plan

**Based on:** Comprehensive feature specification answers
**Created:** February 2026
**Total Features:** 13 (grouped into 8 implementation modules)

---

## Priority Overview

| Priority | Features | Status |
|----------|----------|--------|
| **1 - Critical** | Schedule Integration, Expense Tracking, Communications | Planning |
| **2 - High** | Activity Log, Revenue/Bonus System, Claude AI | Planning |
| **3 - Medium** | Discussion Capture, Undo, Meeting Templates | Planning |
| **4 - Scale** | Backend Support System | Planning |
| **5 - Future** | Community, Content/Articles | Planning |

---

## Implementation Dependencies

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEPENDENCY GRAPH                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐                                                        │
│  │ History Tracking │ ← Foundation for everything (already planned)        │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │ Activity Log    │────▶│ Undo System     │     │ Communications  │       │
│  └────────┬────────┘     └─────────────────┘     └────────┬────────┘       │
│           │                                               │                 │
│           ▼                                               ▼                 │
│  ┌─────────────────┐                            ┌─────────────────┐        │
│  │ Expense Tracking│                            │Discussion Capture│        │
│  └────────┬────────┘                            └────────┬────────┘        │
│           │                                               │                 │
│           ▼                                               ▼                 │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │ Revenue Tracking│────▶│ Bonus System    │     │ Meeting System  │       │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘       │
│                                                                              │
│  ┌─────────────────┐                                                        │
│  │Schedule Integr. │ ← Receives events from ALL modules                    │
│  └─────────────────┘                                                        │
│                                                                              │
│  ┌─────────────────┐                                                        │
│  │ Claude/Plaude   │ ← Weaves through ALL features                         │
│  └─────────────────┘                                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# PRIORITY 1: CRITICAL FEATURES

---

## Feature 1: Universal Schedule Integration

### Overview
Every module feeds the schedule. Changes propagate. Everything is clickable to source.

### Database Schema

```sql
-- Core schedule tables
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),

  -- Schedule metadata
  name TEXT NOT NULL DEFAULT 'Master Schedule',
  schedule_type TEXT DEFAULT 'master', -- 'master', 'baseline', 'what_if'

  -- Settings
  working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- Mon-Fri
  hours_per_day DECIMAL(4,2) DEFAULT 8,

  -- Critical path
  critical_path_enabled BOOLEAN DEFAULT true,
  auto_recalculate BOOLEAN DEFAULT true,

  -- Dates
  planned_start DATE,
  planned_end DATE,
  actual_start DATE,
  actual_end DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule tasks
CREATE TABLE schedule_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  schedule_id UUID NOT NULL REFERENCES schedules(id),

  -- Task info
  name TEXT NOT NULL,
  description TEXT,

  -- Source linkage (what created this task?)
  source_type TEXT, -- 'manual', 'daily_log', 'change_order', 'inspection', 'delivery', etc.
  source_id UUID,   -- FK to source record
  auto_created BOOLEAN DEFAULT false,

  -- Hierarchy
  parent_id UUID REFERENCES schedule_tasks(id),
  wbs_code TEXT,  -- Work breakdown structure
  sort_order INTEGER DEFAULT 0,

  -- Scheduling
  planned_start DATE,
  planned_end DATE,
  actual_start DATE,
  actual_end DATE,
  duration_days INTEGER,

  -- Progress
  percent_complete DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'complete', 'delayed', 'on_hold'

  -- Critical path
  is_milestone BOOLEAN DEFAULT false,
  is_critical BOOLEAN DEFAULT false,
  total_float_days INTEGER,
  free_float_days INTEGER,

  -- Assignment
  assigned_to UUID REFERENCES users(id),
  assigned_vendor_id UUID REFERENCES vendors(id),
  trade TEXT,

  -- Flags
  has_conflict BOOLEAN DEFAULT false,
  conflict_details JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task dependencies
CREATE TABLE schedule_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  schedule_id UUID NOT NULL REFERENCES schedules(id),

  predecessor_id UUID NOT NULL REFERENCES schedule_tasks(id),
  successor_id UUID NOT NULL REFERENCES schedule_tasks(id),

  -- Dependency type
  dependency_type TEXT NOT NULL DEFAULT 'FS', -- 'FS', 'FF', 'SS', 'SF'
  lag_days INTEGER DEFAULT 0, -- Can be negative for lead time

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule events (from other modules)
CREATE TABLE schedule_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),

  -- Source
  source_type TEXT NOT NULL, -- Module that created this
  source_id UUID NOT NULL,   -- Record ID in source module
  source_action TEXT,        -- 'created', 'updated', 'deleted'

  -- Event data
  event_type TEXT NOT NULL,  -- 'inspection', 'delivery', 'milestone', 'deadline', etc.
  title TEXT NOT NULL,
  description TEXT,

  -- Timing
  event_date DATE,
  event_time TIME,
  duration_hours DECIMAL(4,2),
  all_day BOOLEAN DEFAULT true,

  -- Processing
  auto_create_task BOOLEAN DEFAULT false,
  suggested_task_id UUID REFERENCES schedule_tasks(id),
  task_created BOOLEAN DEFAULT false,
  task_id UUID REFERENCES schedule_tasks(id),

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'processed'
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Module configuration for schedule integration
CREATE TABLE schedule_module_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  module_name TEXT NOT NULL, -- 'daily_logs', 'change_orders', 'inspections', etc.

  -- Behavior
  auto_create_tasks BOOLEAN DEFAULT false,
  suggest_tasks BOOLEAN DEFAULT true,

  -- Defaults
  default_duration_days INTEGER DEFAULT 1,
  default_task_template JSONB,

  UNIQUE(company_id, module_name)
);

-- Indexes
CREATE INDEX idx_schedule_tasks_job ON schedule_tasks(job_id);
CREATE INDEX idx_schedule_tasks_source ON schedule_tasks(source_type, source_id);
CREATE INDEX idx_schedule_tasks_dates ON schedule_tasks(planned_start, planned_end);
CREATE INDEX idx_schedule_events_job ON schedule_events(job_id, status);
CREATE INDEX idx_schedule_dependencies_pred ON schedule_dependencies(predecessor_id);
CREATE INDEX idx_schedule_dependencies_succ ON schedule_dependencies(successor_id);
```

### Event Processing System

```typescript
// types/schedule.ts
interface ScheduleEvent {
  id: string
  jobId: string
  sourceType: 'daily_log' | 'change_order' | 'inspection' | 'delivery' |
              'selection' | 'rfi' | 'permit' | 'material_order' | 'punch_list' |
              'warranty' | 'milestone' | 'manual'
  sourceId: string
  eventType: 'task' | 'milestone' | 'deadline' | 'delivery' | 'inspection'
  title: string
  date: Date
  duration?: number
  autoCreate: boolean
}

interface ConflictResolution {
  type: 'push' | 'compress' | 'resequence' | 'manual'
  affectedTasks: string[]
  suggestedChanges: TaskChange[]
}

// Module event handlers
const moduleHandlers: Record<string, (record: any) => ScheduleEvent[]> = {

  // Change orders create schedule adjustments
  change_orders: (co) => {
    const events: ScheduleEvent[] = []

    if (co.schedule_impact_days) {
      events.push({
        sourceType: 'change_order',
        sourceId: co.id,
        eventType: 'task',
        title: `CO #${co.number}: ${co.title}`,
        date: co.start_date,
        duration: co.schedule_impact_days,
        autoCreate: true, // COs always auto-create
      })
    }

    return events
  },

  // Inspections are critical milestones
  inspections: (inspection) => [{
    sourceType: 'inspection',
    sourceId: inspection.id,
    eventType: 'inspection',
    title: `${inspection.type} Inspection`,
    date: inspection.scheduled_date,
    autoCreate: true, // Inspections always auto-create
  }],

  // Deliveries suggest tasks
  deliveries: (delivery) => [{
    sourceType: 'delivery',
    sourceId: delivery.id,
    eventType: 'delivery',
    title: `Delivery: ${delivery.description}`,
    date: delivery.expected_date,
    autoCreate: false, // Deliveries suggest
  }],

  // Selections have deadlines
  selections: (selection) => [{
    sourceType: 'selection',
    sourceId: selection.id,
    eventType: 'deadline',
    title: `Selection Due: ${selection.category}`,
    date: selection.due_date,
    autoCreate: false,
  }],

  // ... handlers for all modules
}
```

### Critical Path Calculation

```typescript
// lib/schedule/critical-path.ts

interface Task {
  id: string
  duration: number
  predecessors: { taskId: string; type: string; lag: number }[]
  successors: { taskId: string; type: string; lag: number }[]
  earlyStart?: number
  earlyFinish?: number
  lateStart?: number
  lateFinish?: number
  totalFloat?: number
  freeFloat?: number
  isCritical?: boolean
}

export function calculateCriticalPath(tasks: Task[]): Task[] {
  // Forward pass - calculate early start/finish
  const sortedTasks = topologicalSort(tasks)

  for (const task of sortedTasks) {
    task.earlyStart = 0

    for (const pred of task.predecessors) {
      const predTask = tasks.find(t => t.id === pred.taskId)
      if (predTask) {
        const predFinish = calculateDependencyDate(predTask, pred.type, pred.lag)
        task.earlyStart = Math.max(task.earlyStart, predFinish)
      }
    }

    task.earlyFinish = task.earlyStart + task.duration
  }

  // Backward pass - calculate late start/finish
  const projectEnd = Math.max(...tasks.map(t => t.earlyFinish || 0))

  for (const task of sortedTasks.reverse()) {
    task.lateFinish = projectEnd

    for (const succ of task.successors) {
      const succTask = tasks.find(t => t.id === succ.taskId)
      if (succTask) {
        const succStart = succTask.lateStart || projectEnd
        task.lateFinish = Math.min(task.lateFinish, succStart - succ.lag)
      }
    }

    task.lateStart = task.lateFinish - task.duration
    task.totalFloat = task.lateStart - (task.earlyStart || 0)
    task.isCritical = task.totalFloat === 0
  }

  // Calculate free float
  for (const task of tasks) {
    task.freeFloat = task.totalFloat

    for (const succ of task.successors) {
      const succTask = tasks.find(t => t.id === succ.taskId)
      if (succTask) {
        const gap = (succTask.earlyStart || 0) - (task.earlyFinish || 0) - succ.lag
        task.freeFloat = Math.min(task.freeFloat || 0, gap)
      }
    }
  }

  return tasks
}

function calculateDependencyDate(
  predTask: Task,
  depType: string,
  lag: number
): number {
  switch (depType) {
    case 'FS': return (predTask.earlyFinish || 0) + lag
    case 'SS': return (predTask.earlyStart || 0) + lag
    case 'FF': return (predTask.earlyFinish || 0) + lag - predTask.duration
    case 'SF': return (predTask.earlyStart || 0) + lag - predTask.duration
    default: return (predTask.earlyFinish || 0) + lag
  }
}
```

### Conflict Detection & Resolution

```typescript
// lib/schedule/conflicts.ts

interface Conflict {
  type: 'resource' | 'date' | 'dependency' | 'overlap'
  severity: 'warning' | 'error'
  taskIds: string[]
  description: string
  suggestedResolutions: Resolution[]
}

interface Resolution {
  type: 'push' | 'compress' | 'resequence' | 'reassign' | 'split'
  description: string
  impact: {
    tasksAffected: number
    daysImpact: number
    criticalPathImpact: boolean
  }
  apply: () => Promise<void>
}

export async function detectConflicts(
  scheduleId: string,
  changedTaskId?: string
): Promise<Conflict[]> {
  const conflicts: Conflict[] = []

  const tasks = await getScheduleTasks(scheduleId)

  // 1. Check for date conflicts (past due)
  for (const task of tasks) {
    if (task.plannedEnd < new Date() && task.status !== 'complete') {
      conflicts.push({
        type: 'date',
        severity: 'error',
        taskIds: [task.id],
        description: `"${task.name}" is past due`,
        suggestedResolutions: [
          {
            type: 'push',
            description: 'Push to today and adjust dependents',
            impact: await calculatePushImpact(task),
            apply: () => pushTask(task.id, new Date())
          }
        ]
      })
    }
  }

  // 2. Check for resource conflicts (same person, same day)
  const tasksByAssignee = groupBy(tasks, 'assignedTo')
  for (const [assignee, assigneeTasks] of Object.entries(tasksByAssignee)) {
    const overlaps = findOverlappingTasks(assigneeTasks)
    for (const overlap of overlaps) {
      conflicts.push({
        type: 'resource',
        severity: 'warning',
        taskIds: overlap.map(t => t.id),
        description: `${assignee} has overlapping tasks`,
        suggestedResolutions: [
          {
            type: 'resequence',
            description: 'Sequence tasks back-to-back',
            impact: { tasksAffected: overlap.length, daysImpact: 0, criticalPathImpact: false },
            apply: () => resequenceTasks(overlap)
          }
        ]
      })
    }
  }

  // 3. Check for dependency violations
  for (const task of tasks) {
    for (const dep of task.dependencies) {
      const predecessor = tasks.find(t => t.id === dep.predecessorId)
      if (predecessor && !isDependencySatisfied(predecessor, task, dep)) {
        conflicts.push({
          type: 'dependency',
          severity: 'error',
          taskIds: [predecessor.id, task.id],
          description: `"${task.name}" starts before predecessor finishes`,
          suggestedResolutions: [
            {
              type: 'push',
              description: `Push "${task.name}" to after predecessor`,
              impact: await calculatePushImpact(task),
              apply: () => pushTaskAfterPredecessor(task.id, dep)
            }
          ]
        })
      }
    }
  }

  return conflicts
}
```

### UI Components

```tsx
// Schedule views needed:
// 1. Gantt chart (primary)
// 2. Calendar view
// 3. Timeline view (client-facing)
// 4. List view (quick filtering)

// components/schedule/gantt-chart.tsx
// components/schedule/calendar-view.tsx
// components/schedule/timeline-view.tsx
// components/schedule/task-list.tsx
// components/schedule/conflict-resolver.tsx
// components/schedule/event-suggestions.tsx
```

---

## Feature 2: Job Expense Tracking

### Overview
Track all job expenses to understand true job costs. Foundation for profitability and bonuses.

### Database Schema

```sql
-- Expense categories
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  name TEXT NOT NULL,
  code TEXT,
  parent_id UUID REFERENCES expense_categories(id),

  -- Defaults
  default_cost_code_id UUID REFERENCES cost_codes(id),
  requires_receipt BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT true,
  approval_threshold DECIMAL(10,2), -- Above this needs approval

  -- Tax
  is_taxable BOOLEAN DEFAULT true,
  tax_category TEXT, -- For tax reporting

  -- Allocation
  allocate_to_jobs BOOLEAN DEFAULT true,
  allocation_method TEXT DEFAULT 'direct', -- 'direct', 'percentage', 'labor_hours', 'revenue'

  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Source
  expense_type TEXT NOT NULL, -- 'receipt', 'invoice', 'mileage', 'per_diem', 'credit_card', 'manual'
  source_id UUID, -- Link to invoice, receipt, etc.

  -- Core data
  description TEXT NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  vendor_name TEXT, -- Fallback if no vendor record

  -- Categorization
  category_id UUID REFERENCES expense_categories(id),
  cost_code_id UUID REFERENCES cost_codes(id),

  -- Job attribution
  job_id UUID REFERENCES jobs(id),
  job_phase TEXT,

  -- Employee attribution
  employee_id UUID REFERENCES users(id),
  employee_name TEXT,

  -- Amounts
  amount DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(12,2) GENERATED ALWAYS AS (amount + tax_amount) STORED,

  currency TEXT DEFAULT 'USD',

  -- For mileage
  miles DECIMAL(10,2),
  mileage_rate DECIMAL(6,4),

  -- For per diem
  per_diem_days DECIMAL(4,2),
  per_diem_rate DECIMAL(10,2),

  -- Date
  expense_date DATE NOT NULL,

  -- Payment
  payment_method TEXT, -- 'company_card', 'personal', 'check', 'ach'
  card_last_four TEXT,
  reimbursement_status TEXT DEFAULT 'not_applicable', -- 'not_applicable', 'pending', 'approved', 'paid'
  reimbursed_at TIMESTAMPTZ,

  -- Approval
  approval_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'auto_approved'
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Documents
  receipt_url TEXT,
  receipt_extracted_data JSONB, -- AI-extracted data

  -- Sync
  quickbooks_id TEXT,
  synced_to_quickbooks BOOLEAN DEFAULT false,
  synced_at TIMESTAMPTZ,

  -- Flags
  is_billable BOOLEAN DEFAULT false,
  is_overhead BOOLEAN DEFAULT false,

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense receipts (for OCR processing)
CREATE TABLE expense_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  expense_id UUID REFERENCES expenses(id),

  -- File
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,

  -- OCR processing
  ocr_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'complete', 'failed'
  ocr_raw_text TEXT,
  ocr_extracted JSONB, -- Structured extraction
  ocr_confidence DECIMAL(5,4),

  -- AI suggestions
  suggested_vendor TEXT,
  suggested_amount DECIMAL(12,2),
  suggested_date DATE,
  suggested_category_id UUID,
  suggested_job_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mileage logs
CREATE TABLE mileage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  expense_id UUID REFERENCES expenses(id),

  employee_id UUID NOT NULL REFERENCES users(id),
  job_id UUID REFERENCES jobs(id),

  -- Trip details
  trip_date DATE NOT NULL,
  start_location TEXT,
  end_location TEXT,
  purpose TEXT,

  -- Distance
  miles DECIMAL(10,2) NOT NULL,
  odometer_start INTEGER,
  odometer_end INTEGER,

  -- Rate
  mileage_rate DECIMAL(6,4) NOT NULL, -- IRS rate at time of trip
  total_amount DECIMAL(10,2) GENERATED ALWAYS AS (miles * mileage_rate) STORED,

  -- GPS tracking (optional)
  gps_track JSONB,
  gps_verified BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Per diem tracking
CREATE TABLE per_diem_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  expense_id UUID REFERENCES expenses(id),

  employee_id UUID NOT NULL REFERENCES users(id),
  job_id UUID REFERENCES jobs(id),

  -- Period
  entry_date DATE NOT NULL,

  -- Rates (based on location)
  location TEXT,
  lodging_rate DECIMAL(10,2),
  meals_rate DECIMAL(10,2),
  incidentals_rate DECIMAL(10,2),

  -- Actual
  lodging_claimed DECIMAL(10,2) DEFAULT 0,
  meals_claimed DECIMAL(10,2) DEFAULT 0,
  incidentals_claimed DECIMAL(10,2) DEFAULT 0,

  total_claimed DECIMAL(10,2) GENERATED ALWAYS AS (
    lodging_claimed + meals_claimed + incidentals_claimed
  ) STORED,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Overhead allocation
CREATE TABLE overhead_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Total overhead
  total_overhead DECIMAL(12,2) NOT NULL,

  -- Allocation method used
  allocation_method TEXT NOT NULL, -- 'revenue', 'labor_hours', 'direct_cost', 'custom'

  -- Results (per job)
  allocations JSONB NOT NULL, -- [{ job_id, allocated_amount, percentage }]

  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'finalized'
  finalized_at TIMESTAMPTZ,
  finalized_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_expenses_job ON expenses(job_id);
CREATE INDEX idx_expenses_employee ON expenses(employee_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_status ON expenses(approval_status);
CREATE INDEX idx_expenses_category ON expenses(category_id);
```

### Receipt Processing Pipeline

```typescript
// lib/expenses/receipt-processor.ts

interface ReceiptData {
  vendor: string
  amount: number
  tax: number
  date: Date
  items: { description: string; amount: number }[]
  paymentMethod: string
  cardLastFour?: string
}

export async function processReceipt(
  receiptId: string,
  fileUrl: string
): Promise<ReceiptData> {
  // 1. Call Document AI for extraction
  const rawExtraction = await documentAI.process(fileUrl, 'receipt')

  // 2. Parse and structure
  const structured: ReceiptData = {
    vendor: rawExtraction.vendor_name || rawExtraction.merchant_name,
    amount: parseFloat(rawExtraction.subtotal || rawExtraction.total),
    tax: parseFloat(rawExtraction.tax || '0'),
    date: parseDate(rawExtraction.date),
    items: rawExtraction.line_items?.map(item => ({
      description: item.description,
      amount: parseFloat(item.amount)
    })) || [],
    paymentMethod: rawExtraction.payment_method,
    cardLastFour: rawExtraction.card_number?.slice(-4)
  }

  // 3. AI enhancement - suggest categorization
  const suggestions = await gemini.suggest({
    prompt: `Given this receipt from ${structured.vendor} for ${structured.amount},
             suggest: job (from list), category, cost code.
             Company context: ${await getCompanyContext()}`,
    data: structured
  })

  // 4. Update receipt record
  await supabase.from('expense_receipts').update({
    ocr_status: 'complete',
    ocr_extracted: structured,
    suggested_vendor: structured.vendor,
    suggested_amount: structured.amount,
    suggested_date: structured.date,
    suggested_category_id: suggestions.categoryId,
    suggested_job_id: suggestions.jobId,
  }).eq('id', receiptId)

  return structured
}
```

### Approval Workflow

```typescript
// lib/expenses/approval.ts

interface ApprovalRule {
  maxAmount: number
  approver: 'auto' | 'pm' | 'admin' | 'owner'
}

const defaultRules: ApprovalRule[] = [
  { maxAmount: 100, approver: 'auto' },
  { maxAmount: 1000, approver: 'pm' },
  { maxAmount: 5000, approver: 'admin' },
  { maxAmount: Infinity, approver: 'owner' }
]

export async function routeExpenseForApproval(expenseId: string) {
  const expense = await getExpense(expenseId)
  const rules = await getCompanyApprovalRules(expense.companyId)

  const rule = rules.find(r => expense.totalAmount <= r.maxAmount)

  if (rule.approver === 'auto') {
    await approveExpense(expenseId, null, 'auto_approved')
    return
  }

  // Find appropriate approver
  let approverId: string

  switch (rule.approver) {
    case 'pm':
      approverId = await getJobPM(expense.jobId)
      break
    case 'admin':
      approverId = await getCompanyAdmin(expense.companyId)
      break
    case 'owner':
      approverId = await getCompanyOwner(expense.companyId)
      break
  }

  // Create approval request notification
  await createNotification({
    userId: approverId,
    type: 'expense_approval',
    title: `Expense Approval: $${expense.totalAmount}`,
    data: { expenseId, amount: expense.totalAmount }
  })
}
```

---

## Feature 3: Communication System

### Overview
Unified communication hub replacing external tools. All job communication in one place.

### Database Schema

```sql
-- Communication channels
CREATE TABLE communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Scope
  channel_type TEXT NOT NULL, -- 'job', 'company', 'direct', 'group'
  job_id UUID REFERENCES jobs(id),

  -- Channel info
  name TEXT NOT NULL,
  description TEXT,
  topic TEXT, -- 'general', 'financials', 'schedule', 'selections', 'rfi', 'custom'

  -- Participants
  is_private BOOLEAN DEFAULT false,

  -- Settings
  settings JSONB DEFAULT '{}',

  -- External capture
  email_address TEXT, -- Forward emails here to capture

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channel members
CREATE TABLE channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES communication_channels(id),

  -- Member (can be user, client contact, or vendor contact)
  member_type TEXT NOT NULL, -- 'user', 'client', 'vendor', 'external'
  user_id UUID REFERENCES users(id),
  contact_id UUID, -- For external contacts
  email TEXT, -- For external participants

  -- Permissions
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member', 'guest'
  can_post BOOLEAN DEFAULT true,

  -- Notifications
  notification_preference TEXT DEFAULT 'all', -- 'all', 'mentions', 'none'
  muted_until TIMESTAMPTZ,

  -- Tracking
  last_read_at TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,

  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  channel_id UUID NOT NULL REFERENCES communication_channels(id),

  -- Sender
  sender_type TEXT NOT NULL, -- 'user', 'client', 'vendor', 'system', 'ai'
  sender_id UUID,
  sender_name TEXT,
  sender_email TEXT,

  -- Content
  content TEXT NOT NULL,
  content_html TEXT, -- Rich text version

  -- Type
  message_type TEXT DEFAULT 'text', -- 'text', 'file', 'voice', 'system', 'ai_summary'

  -- Reply threading
  parent_id UUID REFERENCES messages(id),
  thread_count INTEGER DEFAULT 0,

  -- Attachments
  attachments JSONB DEFAULT '[]', -- [{ name, url, type, size }]

  -- Source (for captured external messages)
  source TEXT DEFAULT 'app', -- 'app', 'email', 'sms', 'portal'
  source_id TEXT, -- External message ID
  source_data JSONB, -- Original email headers, etc.

  -- Mentions
  mentions UUID[] DEFAULT '{}', -- User IDs mentioned

  -- Actions extracted by AI
  action_items JSONB, -- [{ text, assigned_to, due_date, task_id }]
  decisions JSONB,    -- [{ text, decided_by, decision_date }]

  -- Reactions
  reactions JSONB DEFAULT '{}', -- { "👍": ["user1", "user2"] }

  -- Read tracking
  read_by JSONB DEFAULT '{}', -- { user_id: timestamp }

  -- Editing
  edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  original_content TEXT,

  -- Soft delete
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Direct messages
CREATE TABLE direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Participants (sorted for uniqueness)
  participant_ids UUID[] NOT NULL,

  -- Last activity
  last_message_id UUID REFERENCES messages(id),
  last_message_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, participant_ids)
);

-- Email capture rules
CREATE TABLE email_capture_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Matching
  from_pattern TEXT,      -- Regex for sender
  to_pattern TEXT,        -- Regex for recipient
  subject_pattern TEXT,   -- Regex for subject

  -- Routing
  target_channel_id UUID REFERENCES communication_channels(id),
  target_job_id UUID REFERENCES jobs(id),

  -- Processing
  extract_action_items BOOLEAN DEFAULT true,
  notify_channel BOOLEAN DEFAULT true,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message read receipts (detailed)
CREATE TABLE message_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id),
  user_id UUID NOT NULL REFERENCES users(id),

  read_at TIMESTAMPTZ NOT NULL,
  read_on_device TEXT, -- 'web', 'mobile', 'email'

  UNIQUE(message_id, user_id)
);

-- Indexes
CREATE INDEX idx_messages_channel ON messages(channel_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_channel_members_user ON channel_members(user_id);
CREATE INDEX idx_messages_search ON messages USING gin(to_tsvector('english', content));
```

### Real-time Messaging

```typescript
// lib/communications/realtime.ts

import { RealtimeChannel } from '@supabase/supabase-js'

export function subscribeToChannel(
  channelId: string,
  onMessage: (message: Message) => void,
  onTyping: (user: User) => void,
  onPresence: (users: User[]) => void
): RealtimeChannel {

  const channel = supabase.channel(`messages:${channelId}`)

  // New messages
  channel.on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `channel_id=eq.${channelId}`
    },
    (payload) => onMessage(payload.new as Message)
  )

  // Typing indicators
  channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
    onTyping(payload.user)
  })

  // Presence (who's online)
  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    onPresence(Object.values(state).flat())
  })

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ user: getCurrentUser() })
    }
  })

  return channel
}

// Send typing indicator
export function sendTyping(channel: RealtimeChannel, user: User) {
  channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { user }
  })
}
```

### Email Capture Processing

```typescript
// lib/communications/email-capture.ts

interface InboundEmail {
  from: string
  to: string
  subject: string
  body: string
  html?: string
  attachments: { name: string; content: Buffer }[]
  headers: Record<string, string>
}

export async function processInboundEmail(email: InboundEmail) {
  const company = await findCompanyByEmailDomain(email.to)
  if (!company) return { success: false, reason: 'unknown_recipient' }

  // Find matching capture rule
  const rule = await findMatchingRule(company.id, email)

  // Find or create channel
  let channelId = rule?.targetChannelId

  if (!channelId) {
    // Try to match to a job by subject/content
    const job = await matchEmailToJob(company.id, email)
    if (job) {
      channelId = await getOrCreateJobChannel(job.id, 'email')
    } else {
      // Put in general inbox
      channelId = await getCompanyInboxChannel(company.id)
    }
  }

  // Create message
  const message = await createMessage({
    channelId,
    senderType: 'external',
    senderEmail: email.from,
    senderName: extractName(email.from),
    content: email.body,
    contentHtml: email.html,
    source: 'email',
    sourceData: {
      subject: email.subject,
      messageId: email.headers['message-id'],
      inReplyTo: email.headers['in-reply-to']
    }
  })

  // Process attachments
  for (const attachment of email.attachments) {
    const url = await uploadAttachment(attachment)
    await addAttachmentToMessage(message.id, {
      name: attachment.name,
      url,
      type: getMimeType(attachment.name),
      size: attachment.content.length
    })
  }

  // AI extraction
  if (rule?.extractActionItems) {
    const extracted = await extractActionItems(email.body)
    await updateMessage(message.id, { actionItems: extracted })
  }

  // Notify channel members
  await notifyChannelMembers(channelId, message)

  return { success: true, messageId: message.id }
}
```

---

# PRIORITY 2: HIGH PRIORITY FEATURES

---

## Feature 4: Activity Log

Already documented in `HISTORY-TRACKING-SYSTEM.md` - integrates directly with this.

**Additions needed:**
- Real-time activity feed component
- Activity digest emails (daily/weekly)
- Export functionality
- Admin search interface

---

## Feature 5 & 10: Employee Revenue Tracking + Auto-Calculated Bonuses

### Overview
Unified system tracking revenue attribution, expenses, and calculating bonuses.

### Database Schema

```sql
-- Employee revenue attribution
CREATE TABLE employee_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  employee_id UUID NOT NULL REFERENCES users(id),

  -- Source
  source_type TEXT NOT NULL, -- 'job', 'sale', 'change_order', 'draw'
  source_id UUID NOT NULL,
  job_id UUID REFERENCES jobs(id),

  -- Attribution
  attribution_type TEXT NOT NULL, -- 'primary', 'secondary', 'sales', 'estimating'
  attribution_percentage DECIMAL(5,2) NOT NULL DEFAULT 100,

  -- Amount
  revenue_amount DECIMAL(12,2) NOT NULL,
  attributed_amount DECIMAL(12,2) GENERATED ALWAYS AS (
    revenue_amount * (attribution_percentage / 100)
  ) STORED,

  -- Timing
  revenue_date DATE NOT NULL,
  period_year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM revenue_date)) STORED,
  period_quarter INTEGER GENERATED ALWAYS AS (EXTRACT(QUARTER FROM revenue_date)) STORED,
  period_month INTEGER GENERATED ALWAYS AS (EXTRACT(MONTH FROM revenue_date)) STORED,

  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'reversed', 'adjusted'

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee costs (fully loaded)
CREATE TABLE employee_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  employee_id UUID NOT NULL REFERENCES users(id),

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Cost components
  salary_wages DECIMAL(12,2) DEFAULT 0,
  benefits DECIMAL(12,2) DEFAULT 0,
  payroll_taxes DECIMAL(12,2) DEFAULT 0,
  vehicle_allowance DECIMAL(12,2) DEFAULT 0,
  phone_allowance DECIMAL(12,2) DEFAULT 0,
  tools_equipment DECIMAL(12,2) DEFAULT 0,
  training DECIMAL(12,2) DEFAULT 0,
  overhead_allocation DECIMAL(12,2) DEFAULT 0,
  other_costs DECIMAL(12,2) DEFAULT 0,

  -- Total
  total_cost DECIMAL(12,2) GENERATED ALWAYS AS (
    salary_wages + benefits + payroll_taxes + vehicle_allowance +
    phone_allowance + tools_equipment + training + overhead_allocation + other_costs
  ) STORED,

  -- Rework/warranty deductions
  rework_costs DECIMAL(12,2) DEFAULT 0,
  warranty_costs DECIMAL(12,2) DEFAULT 0,

  -- Final
  fully_loaded_cost DECIMAL(12,2) GENERATED ALWAYS AS (
    salary_wages + benefits + payroll_taxes + vehicle_allowance +
    phone_allowance + tools_equipment + training + overhead_allocation +
    other_costs + rework_costs + warranty_costs
  ) STORED,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bonus formulas (templates)
CREATE TABLE bonus_formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  name TEXT NOT NULL,
  description TEXT,

  -- Applicability
  applies_to_roles TEXT[], -- ['pm', 'estimator', 'superintendent', 'sales']
  is_template BOOLEAN DEFAULT false, -- System templates

  -- Formula configuration
  formula_type TEXT NOT NULL, -- 'simple_percentage', 'tiered', 'team', 'hybrid'

  -- Inputs and weights (which metrics feed into formula)
  inputs JSONB NOT NULL, -- [{ metric: 'net_revenue', weight: 0.5 }, ...]

  -- Thresholds
  thresholds JSONB, -- [{ min_percent: 100, max_percent: 120, bonus_rate: 0.05 }, ...]

  -- Caps and accelerators
  min_bonus DECIMAL(12,2) DEFAULT 0,
  max_bonus DECIMAL(12,2),
  accelerator_threshold DECIMAL(5,2), -- Above this %, multiplier kicks in
  accelerator_multiplier DECIMAL(4,2),

  -- Team component
  team_bonus_weight DECIMAL(5,2) DEFAULT 0, -- % of bonus from team performance

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Available metrics for formulas
CREATE TABLE bonus_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id), -- NULL for system metrics

  metric_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,

  -- Calculation
  calculation_type TEXT NOT NULL, -- 'sql', 'function', 'manual'
  calculation_sql TEXT,
  calculation_function TEXT,

  -- Data type
  data_type TEXT DEFAULT 'decimal', -- 'decimal', 'percentage', 'integer'

  -- For roles
  available_for_roles TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert system metrics
INSERT INTO bonus_metrics (metric_key, name, description, calculation_type, available_for_roles) VALUES
  ('net_revenue', 'Net Revenue', 'Revenue attributed minus fully loaded cost', 'function', ARRAY['pm', 'estimator', 'superintendent', 'sales']),
  ('gross_margin', 'Gross Margin %', 'Gross margin on attributed jobs', 'function', ARRAY['pm', 'estimator']),
  ('schedule_performance', 'Schedule Performance', 'On-time completion rate', 'function', ARRAY['pm', 'superintendent']),
  ('client_satisfaction', 'Client Satisfaction', 'Average client rating', 'function', ARRAY['pm', 'superintendent']),
  ('safety_record', 'Safety Record', 'Incident-free rate', 'function', ARRAY['superintendent']),
  ('win_rate', 'Win Rate', 'Estimate to contract conversion', 'function', ARRAY['estimator', 'sales']),
  ('estimate_accuracy', 'Estimate Accuracy', 'Actual vs estimated variance', 'function', ARRAY['estimator']),
  ('punch_list_efficiency', 'Punch List Efficiency', 'Punch items per job', 'function', ARRAY['superintendent']),
  ('warranty_callback_rate', 'Warranty Callbacks', 'Callback rate per job', 'function', ARRAY['superintendent', 'pm']);

-- Bonus calculations (snapshots)
CREATE TABLE bonus_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  employee_id UUID NOT NULL REFERENCES users(id),

  -- Period
  period_type TEXT NOT NULL, -- 'monthly', 'quarterly', 'annually', 'job'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  job_id UUID REFERENCES jobs(id), -- For job-based bonuses

  -- Formula used
  formula_id UUID REFERENCES bonus_formulas(id),
  formula_snapshot JSONB, -- Copy of formula at calculation time

  -- Inputs
  input_values JSONB NOT NULL, -- { metric_key: value, ... }

  -- Calculation
  base_amount DECIMAL(12,2) NOT NULL,
  individual_component DECIMAL(12,2) DEFAULT 0,
  team_component DECIMAL(12,2) DEFAULT 0,
  accelerator_applied BOOLEAN DEFAULT false,

  -- Result
  calculated_amount DECIMAL(12,2) NOT NULL,
  capped_amount DECIMAL(12,2), -- After cap applied
  final_amount DECIMAL(12,2) NOT NULL,

  -- Approval
  status TEXT DEFAULT 'calculated', -- 'calculated', 'manager_approved', 'admin_approved', 'paid', 'disputed'

  manager_approved_by UUID REFERENCES users(id),
  manager_approved_at TIMESTAMPTZ,
  manager_adjustment DECIMAL(12,2),
  manager_notes TEXT,

  admin_approved_by UUID REFERENCES users(id),
  admin_approved_at TIMESTAMPTZ,
  admin_adjustment DECIMAL(12,2),
  admin_notes TEXT,

  -- Payout
  payout_date DATE,
  payroll_export_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee bonus dashboard (materialized view for performance)
CREATE MATERIALIZED VIEW employee_bonus_dashboard AS
SELECT
  e.id as employee_id,
  e.company_id,
  e.name as employee_name,
  e.role,

  -- YTD Revenue
  COALESCE(SUM(er.attributed_amount) FILTER (
    WHERE er.period_year = EXTRACT(YEAR FROM CURRENT_DATE)
  ), 0) as ytd_revenue,

  -- YTD Cost
  COALESCE(SUM(ec.fully_loaded_cost) FILTER (
    WHERE EXTRACT(YEAR FROM ec.period_start) = EXTRACT(YEAR FROM CURRENT_DATE)
  ), 0) as ytd_cost,

  -- YTD Net
  COALESCE(SUM(er.attributed_amount), 0) - COALESCE(SUM(ec.fully_loaded_cost), 0) as ytd_net,

  -- Coverage ratio
  CASE
    WHEN COALESCE(SUM(ec.fully_loaded_cost), 0) > 0
    THEN COALESCE(SUM(er.attributed_amount), 0) / SUM(ec.fully_loaded_cost) * 100
    ELSE 0
  END as coverage_percentage,

  -- Pending bonus
  COALESCE(SUM(bc.final_amount) FILTER (WHERE bc.status = 'calculated'), 0) as pending_bonus,

  -- Paid bonuses YTD
  COALESCE(SUM(bc.final_amount) FILTER (WHERE bc.status = 'paid'), 0) as paid_bonus_ytd

FROM users e
LEFT JOIN employee_revenue er ON er.employee_id = e.id
LEFT JOIN employee_costs ec ON ec.employee_id = e.id
LEFT JOIN bonus_calculations bc ON bc.employee_id = e.id
WHERE e.is_employee = true
GROUP BY e.id;

CREATE UNIQUE INDEX idx_emp_bonus_dash ON employee_bonus_dashboard(employee_id);
```

### Bonus Calculation Engine

```typescript
// lib/bonuses/calculator.ts

interface BonusCalculation {
  employeeId: string
  periodType: 'monthly' | 'quarterly' | 'annually' | 'job'
  periodStart: Date
  periodEnd: Date
  jobId?: string
}

export async function calculateBonus(calc: BonusCalculation): Promise<BonusResult> {
  const employee = await getEmployee(calc.employeeId)
  const formula = await getFormulaForEmployee(employee)

  // Gather all input metrics
  const inputValues: Record<string, number> = {}

  for (const input of formula.inputs) {
    inputValues[input.metric] = await calculateMetric(
      input.metric,
      calc.employeeId,
      calc.periodStart,
      calc.periodEnd,
      calc.jobId
    )
  }

  // Calculate weighted score
  let weightedScore = 0
  for (const input of formula.inputs) {
    weightedScore += inputValues[input.metric] * input.weight
  }

  // Apply thresholds
  let bonusRate = 0
  for (const threshold of formula.thresholds) {
    if (weightedScore >= threshold.minPercent && weightedScore < threshold.maxPercent) {
      bonusRate = threshold.bonusRate
      break
    }
  }

  // Base calculation
  const employeeCost = await getFullyLoadedCost(calc.employeeId, calc.periodStart, calc.periodEnd)
  const revenue = await getAttributedRevenue(calc.employeeId, calc.periodStart, calc.periodEnd)
  const netContribution = revenue - employeeCost

  let baseAmount = netContribution * bonusRate

  // Individual component
  const individualComponent = baseAmount * (1 - (formula.teamBonusWeight / 100))

  // Team component
  let teamComponent = 0
  if (formula.teamBonusWeight > 0) {
    const teamPerformance = await calculateTeamPerformance(employee, calc)
    teamComponent = baseAmount * (formula.teamBonusWeight / 100) * teamPerformance
  }

  // Apply accelerator
  let acceleratorApplied = false
  if (formula.acceleratorThreshold && weightedScore > formula.acceleratorThreshold) {
    baseAmount *= formula.acceleratorMultiplier
    acceleratorApplied = true
  }

  // Calculate final
  let calculatedAmount = individualComponent + teamComponent

  // Apply min/max
  calculatedAmount = Math.max(calculatedAmount, formula.minBonus || 0)
  const cappedAmount = formula.maxBonus
    ? Math.min(calculatedAmount, formula.maxBonus)
    : calculatedAmount

  // Store calculation
  const result = await supabase.from('bonus_calculations').insert({
    company_id: employee.companyId,
    employee_id: calc.employeeId,
    period_type: calc.periodType,
    period_start: calc.periodStart,
    period_end: calc.periodEnd,
    job_id: calc.jobId,
    formula_id: formula.id,
    formula_snapshot: formula,
    input_values: inputValues,
    base_amount: baseAmount,
    individual_component: individualComponent,
    team_component: teamComponent,
    accelerator_applied: acceleratorApplied,
    calculated_amount: calculatedAmount,
    capped_amount: cappedAmount,
    final_amount: cappedAmount,
    status: 'calculated'
  }).select().single()

  return result.data
}

async function calculateMetric(
  metricKey: string,
  employeeId: string,
  startDate: Date,
  endDate: Date,
  jobId?: string
): Promise<number> {
  const metric = await getMetricDefinition(metricKey)

  switch (metric.calculationType) {
    case 'function':
      return metricFunctions[metricKey](employeeId, startDate, endDate, jobId)

    case 'sql':
      const result = await supabase.rpc(metric.calculationFunction, {
        p_employee_id: employeeId,
        p_start_date: startDate,
        p_end_date: endDate,
        p_job_id: jobId
      })
      return result.data

    default:
      return 0
  }
}

// Metric calculation functions
const metricFunctions: Record<string, MetricFunction> = {
  net_revenue: async (employeeId, start, end) => {
    const revenue = await getAttributedRevenue(employeeId, start, end)
    const cost = await getFullyLoadedCost(employeeId, start, end)
    return revenue - cost
  },

  gross_margin: async (employeeId, start, end) => {
    const jobs = await getAttributedJobs(employeeId, start, end)
    const totalMargin = jobs.reduce((sum, job) =>
      sum + (job.revenue - job.directCost) / job.revenue, 0)
    return (totalMargin / jobs.length) * 100
  },

  schedule_performance: async (employeeId, start, end) => {
    const jobs = await getCompletedJobs(employeeId, start, end)
    const onTime = jobs.filter(j => j.actualEnd <= j.plannedEnd).length
    return (onTime / jobs.length) * 100
  },

  // ... more metric functions
}
```

---

## Feature 8: Claude/Plaude AI Integration

### Overview
"Plaude" is BuildDesk's AI assistant, powered by Claude for complex tasks and Gemini for simple tasks.

### Integration Architecture

```typescript
// lib/ai/plaude.ts

interface PlaudeContext {
  companyId: string
  userId: string
  userRole: string
  currentPage: string
  currentJobId?: string
  selectedRecord?: { type: string; id: string }
}

interface PlaudeRequest {
  message: string
  context: PlaudeContext
  conversationHistory?: Message[]
  capabilities?: ('search' | 'write' | 'analyze' | 'generate')[]
}

interface PlaudeResponse {
  message: string
  actions?: PlaudeAction[]
  sources?: Source[]
  suggestions?: string[]
}

// Main Plaude handler
export async function askPlaude(request: PlaudeRequest): Promise<PlaudeResponse> {
  // 1. Classify the request
  const classification = await classifyRequest(request)

  // 2. Route to appropriate backend
  let response: PlaudeResponse

  switch (classification.complexity) {
    case 'simple':
      // Use Gemini Flash for simple queries
      response = await handleWithGeminiFlash(request, classification)
      break

    case 'moderate':
      // Use NotebookLM if document search needed
      if (classification.needsDocumentSearch) {
        response = await handleWithNotebookLM(request, classification)
      } else {
        response = await handleWithGeminiPro(request, classification)
      }
      break

    case 'complex':
      // Use Claude for complex reasoning
      response = await handleWithClaude(request, classification)
      break
  }

  // 3. Extract any actions the AI suggested
  if (response.message.includes('ACTION:')) {
    response.actions = parseActions(response.message)
  }

  // 4. Log for analytics
  await logPlaudeInteraction(request, response, classification)

  return response
}

// Claude-specific handler for complex tasks
async function handleWithClaude(
  request: PlaudeRequest,
  classification: RequestClassification
): Promise<PlaudeResponse> {

  // Build context from current page/data
  const pageContext = await getPageContext(request.context)

  // Get relevant company data
  const companyContext = await getCompanyContext(request.context.companyId)

  // Build system prompt based on capability needed
  const systemPrompt = buildSystemPrompt(classification.capabilities, {
    role: request.context.userRole,
    company: companyContext,
    page: pageContext
  })

  // Call Claude
  const completion = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      ...request.conversationHistory || [],
      { role: 'user', content: request.message }
    ]
  })

  return {
    message: completion.content[0].text,
    sources: extractSources(completion.content[0].text),
    suggestions: extractSuggestions(completion.content[0].text)
  }
}

// Contextual system prompts by capability
function buildSystemPrompt(
  capabilities: string[],
  context: any
): string {
  let prompt = `You are Plaude, BuildDesk's AI assistant for construction project management.
You're helping a ${context.role} at ${context.company.name}.

Current context:
- Page: ${context.page.name}
- ${context.page.contextData}

`

  if (capabilities.includes('analyze')) {
    prompt += `
You can analyze project data, identify risks, and provide recommendations.
Be specific with numbers and reference actual data from the project.
`
  }

  if (capabilities.includes('write')) {
    prompt += `
You can help draft documents, emails, change order descriptions, and RFI responses.
Match the company's tone and include relevant project details.
`
  }

  if (capabilities.includes('search')) {
    prompt += `
You can search across project documents, communications, and history.
Always cite your sources when referencing specific information.
`
  }

  if (capabilities.includes('generate')) {
    prompt += `
You can generate meeting agendas, reports, and summaries.
Use actual project data and format professionally.
`
  }

  return prompt
}
```

### Plaude Capabilities by Context

```typescript
// lib/ai/plaude-capabilities.ts

// What Plaude can do on each page
const pageCapabilities: Record<string, PlaudeCapability[]> = {
  'job-overview': [
    { name: 'summarize', description: 'Summarize project status' },
    { name: 'identify-risks', description: 'Identify risks and issues' },
    { name: 'generate-update', description: 'Generate client update' },
    { name: 'suggest-actions', description: 'Suggest next actions' },
  ],

  'budget': [
    { name: 'analyze-variance', description: 'Analyze budget variances' },
    { name: 'forecast', description: 'Forecast final cost' },
    { name: 'identify-overruns', description: 'Identify potential overruns' },
    { name: 'compare-jobs', description: 'Compare to similar jobs' },
  ],

  'schedule': [
    { name: 'analyze-delays', description: 'Analyze delay causes' },
    { name: 'suggest-recovery', description: 'Suggest recovery plan' },
    { name: 'predict-completion', description: 'Predict completion date' },
    { name: 'optimize', description: 'Suggest optimizations' },
  ],

  'change-order': [
    { name: 'draft-description', description: 'Draft CO description' },
    { name: 'calculate-impact', description: 'Calculate schedule impact' },
    { name: 'find-precedents', description: 'Find similar past COs' },
    { name: 'justify-cost', description: 'Help justify pricing' },
  ],

  'rfi': [
    { name: 'search-specs', description: 'Search specs for answer' },
    { name: 'draft-response', description: 'Draft response' },
    { name: 'find-precedents', description: 'Find similar RFIs' },
  ],

  'daily-log': [
    { name: 'extract-issues', description: 'Extract issues from log' },
    { name: 'summarize-week', description: 'Summarize week activity' },
    { name: 'identify-patterns', description: 'Identify patterns' },
  ],

  'estimate': [
    { name: 'validate-pricing', description: 'Validate pricing vs history' },
    { name: 'suggest-adjustments', description: 'Suggest adjustments' },
    { name: 'compare-jobs', description: 'Compare to similar projects' },
    { name: 'identify-missing', description: 'Identify missing items' },
  ],
}

// Quick actions Plaude can perform
const quickActions: PlaudeQuickAction[] = [
  {
    trigger: 'generate meeting agenda',
    action: async (context) => {
      const agenda = await generateMeetingAgenda(context.jobId)
      return { type: 'display', content: agenda }
    }
  },
  {
    trigger: 'summarize this week',
    action: async (context) => {
      const summary = await generateWeeklySummary(context.jobId)
      return { type: 'display', content: summary }
    }
  },
  {
    trigger: 'draft client update',
    action: async (context) => {
      const update = await generateClientUpdate(context.jobId)
      return { type: 'draft', content: update, targetModule: 'communications' }
    }
  },
  // ... more quick actions
]
```

### Plaude UI Component

```tsx
// components/plaude/plaude-panel.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, Mic, X, Maximize2, Minimize2 } from 'lucide-react'
import { usePlaude } from '@/hooks/use-plaude'
import { cn } from '@/lib/utils'

export function PlaudePanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState('')
  const { messages, sendMessage, isLoading, capabilities, suggestions } = usePlaude()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-stone-700 text-white rounded-full shadow-lg hover:bg-stone-600 transition-colors z-50"
      >
        <Sparkles className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div className={cn(
      "fixed z-50 bg-warm-0 rounded-xl border border-warm-200 shadow-xl transition-all",
      isExpanded
        ? "inset-4"
        : "bottom-6 right-6 w-96 h-[500px]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200 bg-stone-700 text-white rounded-t-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">Plaude</span>
          <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-white/20 rounded-lg"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Capabilities */}
      {capabilities.length > 0 && messages.length === 0 && (
        <div className="p-4 border-b border-warm-200 bg-warm-50">
          <p className="text-xs text-warm-500 mb-2">On this page, I can help you:</p>
          <div className="flex flex-wrap gap-1.5">
            {capabilities.map((cap) => (
              <button
                key={cap.name}
                onClick={() => setInput(cap.description)}
                className="px-2 py-1 bg-warm-0 border border-warm-200 rounded-full text-xs text-warm-700 hover:border-stone-300"
              >
                {cap.description}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 140px)' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'user' ? (
              <div className="max-w-[80%] bg-stone-700 text-white rounded-xl rounded-tr-sm px-4 py-2">
                <p className="text-sm">{message.content}</p>
              </div>
            ) : (
              <div className="max-w-[90%]">
                <div className="bg-warm-50 rounded-xl rounded-tl-sm px-4 py-3 border border-warm-100">
                  <div className="prose prose-sm max-w-none text-warm-700">
                    {/* Render markdown content */}
                    {message.content}
                  </div>

                  {message.sources && (
                    <div className="mt-2 pt-2 border-t border-warm-200">
                      <p className="text-xs text-warm-500 mb-1">Sources:</p>
                      <div className="space-y-1">
                        {message.sources.map((source, i) => (
                          <a
                            key={i}
                            href={source.url}
                            className="block text-xs text-stone-600 hover:underline"
                          >
                            {source.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {message.actions && (
                    <div className="mt-2 pt-2 border-t border-warm-200 space-y-1">
                      {message.actions.map((action, i) => (
                        <button
                          key={i}
                          onClick={action.execute}
                          className="block w-full text-left px-2 py-1 bg-stone-100 text-stone-700 rounded text-xs hover:bg-stone-200"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-warm-500">
            <div className="animate-pulse">●</div>
            <span className="text-sm">Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-t border-warm-100 bg-warm-50">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => sendMessage(suggestion)}
                className="px-2 py-1 bg-warm-0 border border-warm-200 rounded-full text-xs text-warm-600 hover:border-stone-300"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-warm-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) {
                sendMessage(input)
                setInput('')
              }
            }}
            placeholder="Ask Plaude anything..."
            className="flex-1 px-4 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
          <button className="p-2 text-warm-500 hover:text-warm-700">
            <Mic className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              if (input.trim()) {
                sendMessage(input)
                setInput('')
              }
            }}
            className="p-2 bg-stone-700 text-white rounded-lg hover:bg-stone-600"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

# COMPLIANCE & INDUSTRY STANDARDS (Added February 2026)

Based on comprehensive research into construction industry best practices, accounting standards, and regulatory requirements, the following compliance features have been added:

## Research Documentation
| Document | Description |
|----------|-------------|
| `RESEARCH-FINDINGS-AND-RECOMMENDATIONS.md` | Deep dive into industry standards and gap analysis |
| `FEATURE-COMPLIANCE-BILLING.md` | ASC 606, AIA Billing, Lien Waivers, Davis-Bacon, OSHA |
| `FEATURE-JOB-COSTING-ENHANCED.md` | Overhead allocation, Labor burden, Bonus systems, WIP |
| `FEATURE-RFI-CHANGE-ORDER-ENHANCED.md` | RFI SLA tracking, Change order workflow (PCO→COR→CO) |

---

## Compliance Feature Summary

### 1. ASC 606 Revenue Recognition
- **5-step revenue recognition model** for construction contracts
- **Cost-to-cost percentage of completion** calculations
- **WIP (Work-in-Progress) reporting** with overbilled/underbilled tracking
- **Performance obligation** tracking for complex contracts
- **Variable consideration** handling for incentives and penalties

### 2. AIA G702/G703 Billing System
- **AIA G702 Application for Payment** with all standard fields
- **AIA G703 Schedule of Values** continuation sheet
- **Retainage tracking** with state-specific rules
- **Notarization workflow** for certification
- **Multi-party signature** tracking (Contractor, Architect, Owner)

### 3. State Retainage Compliance
- **State-specific retention rates** (NY 5%, CA 5% effective 2026, TX tiered)
- **Release timing rules** per jurisdiction
- **Public vs private project** distinctions
- **Automatic rule lookups** by project state

### 4. Four-Type Lien Waiver System
- **Conditional Progress Waiver** - for progress payments, conditional on check clearing
- **Unconditional Progress Waiver** - after payment received
- **Conditional Final Waiver** - for final payment, conditional
- **Unconditional Final Waiver** - after final payment cleared
- **State-specific forms** (California Civil Code, Texas Property Code, etc.)
- **Automatic form selection** based on project location

### 5. Davis-Bacon Certified Payroll
- **WH-347 form generation** with all required fields
- **Prevailing wage determination** lookup from SAM.gov
- **Worker classification** validation against wage schedules
- **Fringe benefit tracking** (hourly or annualized)
- **Weekly submission** with certification statement
- **Apprentice rate calculation** based on registered programs

### 6. OSHA 300/301 Log Integration
- **OSHA Form 300 Log** - injury and illness log
- **OSHA Form 301** - incident report details
- **7-day recording requirement** automation
- **Annual summary** (Form 300A) generation
- **Recordable incident tracking** per OSHA definitions

### 7. Enhanced Overhead Allocation
- **Multiple allocation methods**: labor hours, direct costs, revenue, square footage
- **Overhead rate calculation** with historical trending
- **Job-level allocation** with automatic posting
- **Overhead category management** (insurance, rent, admin, etc.)
- **Period-based rate recalculation**

### 8. Labor Burden System
- **Full burden calculation**: FICA, FUTA, SUTA, Workers' Comp, benefits
- **Trade-specific workers' comp rates** by NCCI classification
- **Experience modification rate** (EMR) tracking
- **Employee-specific overrides** for benefits tiers
- **Fully-burdened rate cards** for each employee

### 9. Gross Profit-Based Bonus System
- **Bonuses tied to Gross Profit**, not net revenue (industry best practice)
- **Tiered bonus structures** (e.g., 5% at 20% margin, 10% at 25%)
- **Real-time projection visibility** for employees
- **Team bonus components** with pool distribution
- **Accelerator thresholds** for exceptional performance

### 10. RFI SLA Tracking & Escalation
- **Response time SLAs** configurable per priority level
- **Business day calculation** with holiday exclusions
- **Multi-level escalation** workflow (3 levels)
- **Response metrics** by discipline and party
- **Overdue alerts** with automatic notifications

### 11. Enhanced Change Order Workflow
- **PCO (Potential Change Order)** - identification phase
- **COR (Change Order Request)** - pricing and negotiation
- **CO (Change Order)** - executed contract modification
- **Automatic markup calculation** based on contract terms
- **Approval workflow** with threshold-based routing
- **Time impact** integration with schedule

---

## New Database Tables (Compliance)

| Category | Tables Added |
|----------|-------------|
| ASC 606 / Revenue | 3 tables (contract_accounting, revenue_recognition_periods, performance_obligations) |
| AIA Billing | 3 tables (aia_pay_applications, aia_sov_items, pay_app_signatures) |
| Lien Waivers | 3 tables (lien_waiver_types, lien_waiver_state_forms, lien_waiver_requests) |
| Retainage | 2 tables (retainage_rules, job_retainage) |
| Certified Payroll | 3 tables (wage_determinations, certified_payroll_reports, certified_payroll_entries) |
| OSHA | 2 tables (osha_300_log, osha_301_incidents) |
| Overhead | 4 tables (overhead_categories, overhead_budgets, overhead_rates, job_overhead_allocations) |
| Labor Burden | 4 tables (labor_burden_components, workers_comp_rates, employee_burden_overrides, burdened_labor_rates) |
| Bonus System | 4 tables (bonus_programs, bonus_tiers, employee_bonus_assignments, bonus_calculations) |
| RFI Enhanced | 5 tables (rfi_sla_configs, rfis_enhanced, rfi_escalation_contacts, rfi_activity_log, rfi_comments) |
| Change Orders | 6 tables (change_order_configs, potential_change_orders, change_order_requests, change_orders, change_order_line_items, change_order_approvals) |
| **Total New** | **39 tables** |

---

## UI Previews Added

| Preview | Route | Description |
|---------|-------|-------------|
| AIA Billing | `/skeleton/billing` | G702/G703, retainage, lien waivers |
| Certified Payroll | `/skeleton/certified-payroll` | WH-347, wage determinations, compliance |
| RFI Management | `/skeleton/rfis/sla` | SLA tracking, escalation, metrics |

---

# COMPLETE FEATURE DOCUMENTATION INDEX

All features are fully documented with database schemas, implementation code, and UI components:

## Priority 1 - Critical (Covered in this document)
| Feature | File | Status |
|---------|------|--------|
| Universal Schedule Integration | This document | Spec Complete |
| Job Expense Tracking | This document | Spec Complete |
| Communication System | This document | Spec Complete |

## Priority 2 - High (Covered in this document)
| Feature | File | Status |
|---------|------|--------|
| Activity Log | `HISTORY-TRACKING-SYSTEM.md` | Spec Complete |
| Employee Revenue/Bonus System | This document | Spec Complete |
| Plaude AI Integration | This document + `lib/ai/plaude.ts` | Spec Complete |

## Priority 3 - Medium (Separate Documents)
| Feature | File | Status |
|---------|------|--------|
| Undo System | `FEATURE-UNDO-SYSTEM.md` | Spec Complete |
| Discussion Capture | `FEATURE-DISCUSSION-CAPTURE.md` | Spec Complete |
| Meeting Templates | `FEATURE-MEETINGS.md` | Spec Complete |

## Priority 4 - Scale (Separate Documents)
| Feature | File | Status |
|---------|------|--------|
| Backend Support System | `FEATURE-SUPPORT.md` | Spec Complete |

## Priority 5 - Future (Separate Documents)
| Feature | File | Status |
|---------|------|--------|
| Community Section | `FEATURE-COMMUNITY.md` | Spec Complete |
| Content/Articles | `FEATURE-CONTENT.md` | Spec Complete |

---

# ARCHITECTURE DOCUMENTATION INDEX

| Document | Description |
|----------|-------------|
| `AI-INTEGRATION-MASTER-PLAN.md` | Complete AI services architecture (NotebookLM, Gemini, Claude) |
| `MULTI-TENANT-AI-ARCHITECTURE.md` | Scale to 10,000+ companies |
| `HISTORY-TRACKING-SYSTEM.md` | Universal audit trail and history |

---

# CODEBASE INTEGRATION

## Files Created/Updated

### Hooks
- `app/src/hooks/use-plaude.ts` - Plaude AI integration hook

### Libraries
- `app/src/lib/ai/plaude.ts` - AI routing and utilities
- `app/src/lib/ai/index.ts` - AI module exports

### Components
- `app/src/components/skeleton/previews/ai-assistant-panel.tsx` - Plaude panel (updated)
- `app/src/components/skeleton/skeleton-sidebar.tsx` - Navigation (updated)

---

## Implementation Timeline

| Phase | Duration | Features | Dependencies |
|-------|----------|----------|--------------|
| **Phase 1** | Weeks 1-4 | History Tracking, Activity Log | Foundation |
| **Phase 2** | Weeks 5-8 | Schedule Integration, Expense Tracking | Phase 1 |
| **Phase 3** | Weeks 9-12 | Communications, Revenue/Bonus System | Phase 1, 2 |
| **Phase 4** | Weeks 13-16 | Plaude AI, Discussion Capture | Phase 3 |
| **Phase 5** | Weeks 17-20 | Undo, Meetings, Support System | Phase 1-4 |
| **Phase 6** | Weeks 21-24 | Community, Content | Post-Launch |

---

## Total Database Tables Planned

| Category | Tables |
|----------|--------|
| Schedule | 6 tables |
| Expenses | 7 tables |
| Communications | 7 tables |
| Revenue/Bonuses | 8 tables |
| Undo System | 3 tables |
| Discussions | 4 tables |
| Meetings | 6 tables |
| Support | 8 tables |
| Community | 9 tables |
| Content | 6 tables |
| **Subtotal (Original)** | **64 tables** |
| | |
| **Compliance Features** | |
| ASC 606 / Revenue Recognition | 3 tables |
| AIA Billing | 3 tables |
| Lien Waivers | 3 tables |
| Retainage Compliance | 2 tables |
| Certified Payroll (Davis-Bacon) | 3 tables |
| OSHA 300/301 | 2 tables |
| Overhead Allocation | 4 tables |
| Labor Burden | 4 tables |
| Bonus System (Enhanced) | 4 tables |
| RFI SLA Tracking | 5 tables |
| Change Order Workflow | 6 tables |
| **Subtotal (Compliance)** | **39 tables** |
| | |
| **Sustainability & ESG** | |
| Material Carbon Data | 2 tables |
| Job Carbon Tracking | 2 tables |
| Green Certifications | 2 tables |
| ESG Reporting | 1 table |
| Renewable Energy | 1 table |
| Waste Tracking | 1 table |
| **Subtotal (Sustainability)** | **9 tables** |
| | |
| **GRAND TOTAL** | **112 tables** |

---

## Implementation Timeline (Updated)

| Phase | Duration | Features | Dependencies |
|-------|----------|----------|--------------|
| **Phase 1** | Weeks 1-4 | History Tracking, Activity Log | Foundation |
| **Phase 2** | Weeks 5-8 | Schedule Integration, Expense Tracking | Phase 1 |
| **Phase 3** | Weeks 9-12 | Communications, Revenue/Bonus System | Phase 1, 2 |
| **Phase 4** | Weeks 13-16 | Plaude AI, Discussion Capture | Phase 3 |
| **Phase 5** | Weeks 17-20 | Undo, Meetings, Support System | Phase 1-4 |
| **Phase 6** | Weeks 21-24 | Community, Content | Post-Launch |
| **Phase A (Compliance)** | Weeks 1-4 | ASC 606, AIA Billing, Retainage | Parallel Track |
| **Phase B (Compliance)** | Weeks 5-8 | Lien Waivers, Certified Payroll | Phase A |
| **Phase C (Compliance)** | Weeks 9-12 | OSHA, Overhead, Labor Burden | Phase B |
| **Phase D (Compliance)** | Weeks 13-16 | RFI SLA, Change Orders, Bonus Enhancements | Phase C |

---

*BuildDesk Feature Implementation Master Plan v3.0*
*Last Updated: February 2026*
*Compliance Features Added: February 2026*
