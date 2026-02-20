# View Plan: Job Create

## Overview
- **URL**: `/jobs/new`
- **Purpose**: Create a new job/project
- **Primary Path**: Usually created from Lead conversion (auto-fills data)
- **Secondary Path**: Direct creation without lead

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to Jobs                                      [Cancel] [Save] │
│                                                                     │
│                         Create New Job                              │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   JOB INFORMATION                                                   │
│   ─────────────────                                                 │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Job Name *                       Job Number                 │   │
│   │  [________________________]       [____________]             │   │
│   │                                   (auto-generate option)     │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   CLIENT                                                            │
│   ──────                                                            │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  ○ Select existing client    ○ Create new client             │   │
│   │                                                              │   │
│   │  [Search clients...                              ▼]          │   │
│   │                                                              │   │
│   │  OR                                                          │   │
│   │                                                              │   │
│   │  Client Name *             Email            Phone            │   │
│   │  [________________]        [___________]    [___________]    │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   PROJECT ADDRESS *                                                 │
│   ─────────────────                                                 │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Street Address                                              │   │
│   │  [________________________]                                  │   │
│   │                                                              │   │
│   │  City *                  State *        Zip                  │   │
│   │  [________________]      [____]         [________]           │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   CONTRACT DETAILS (optional)                                       │
│   ───────────────────────────                                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Contract Amount              Contract Type                  │   │
│   │  [$________________]          [Fixed Price        ▼]         │   │
│   │                                                              │   │
│   │  Start Date                   Target Completion              │   │
│   │  [____________]               [____________]                 │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   TEAM ASSIGNMENT (optional)                                        │
│   ──────────────────────────                                        │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  ┌─────────────────────┬─────────────────────────────────┐  │   │
│   │  │ Role                │ Team Member                      │  │   │
│   │  ├─────────────────────┼─────────────────────────────────┤  │   │
│   │  │ Project Manager     │ [Select user...           ▼]    │  │   │
│   │  │ Superintendent      │ [Select user...           ▼]    │  │   │
│   │  │ [+ Add Role]        │                                  │  │   │
│   │  └─────────────────────┴─────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   NOTES (optional)                                                  │
│   ────────────────                                                  │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  [                                                        ]  │   │
│   │  [                                                        ]  │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│                                               [Cancel]    [Save]    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Form Fields

### Job Information
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | text | Yes | Min 2 chars |
| job_number | text | No | Auto-generate if blank (e.g., "2024-001") |

### Client Selection
| Mode | Fields | Required |
|------|--------|----------|
| Existing | client_id (dropdown with search) | Yes (one mode) |
| New | name, email, phone | Name required |

### Project Address
| Field | Type | Required |
|-------|------|----------|
| address | text | Yes |
| city | text | Yes |
| state | select | Yes |
| zip | text | No |

### Contract Details
| Field | Type | Required | Options |
|-------|------|----------|---------|
| contract_amount | currency | No | |
| contract_type | select | No | Fixed Price, Cost Plus, Time & Materials |
| start_date | date | No | |
| target_completion | date | No | |

### Team Assignment
| Field | Type | Required |
|-------|------|----------|
| assignments | array | No |
| assignments[].role | text/select | - |
| assignments[].user_id | select | - |

Common roles to suggest:
- Project Manager
- Superintendent
- Estimator
- Sales Rep

### Notes
| Field | Type | Required |
|-------|------|----------|
| notes | textarea | No |

---

## From Lead Conversion

When creating a job from a lead, pre-fill:
| Lead Field | Job Field |
|------------|-----------|
| lead.name | job.name |
| lead.address | job.address |
| lead.city | job.city |
| lead.state | job.state |
| lead.zip | job.zip |
| lead.estimated_value | job.contract_amount |
| lead.client_id | job.client_id (if exists) |
| lead contact info | Create new client |

**URL with lead**: `/jobs/new?from_lead={lead_id}`

---

## Behavior

### Job Number Auto-Generation
Format: `{YEAR}-{SEQUENCE}`
Example: `2024-015`
- Check for next available sequence
- Allow manual override

### On Save
1. Validate required fields
2. If new client mode → Create client first
3. Create job with status = "Pre-construction"
4. Create assignments (if any)
5. If from lead → Update lead with job_id
6. Navigate to Job Detail page

### On Cancel
- Confirm if form has changes
- Navigate back to Jobs list (or Lead detail if from lead)

---

## Validation Rules

```typescript
const schema = {
  name: required().min(2, "Name required"),
  address: required("Address required"),
  city: required("City required"),
  state: required("State required"),
  client: custom((data) => {
    if (!data.client_id && !data.new_client_name) {
      return "Client is required";
    }
  }),
  contract_amount: number().positive().optional(),
  target_completion: date().min(data.start_date, "Must be after start date").optional(),
};
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/jobs` | Create job |
| POST | `/api/clients` | Create client (if new) |
| GET | `/api/clients?search=` | Search existing clients |
| GET | `/api/leads/:id` | Get lead data for pre-fill |

### POST /api/jobs Body
```json
{
  "name": "Smith Residence",
  "job_number": "2024-015",
  "client_id": "uuid" | null,
  "new_client": { "name": "...", "email": "...", "phone": "..." } | null,
  "address": "123 Oak St",
  "city": "Austin",
  "state": "TX",
  "zip": "78701",
  "contract_amount": 450000,
  "contract_type": "fixed_price",
  "start_date": "2024-06-01",
  "target_completion": "2024-12-15",
  "assignments": [
    { "role": "Project Manager", "user_id": "uuid" },
    { "role": "Superintendent", "user_id": "uuid" }
  ],
  "notes": "...",
  "from_lead_id": "uuid" | null
}
```

---

## Component Structure

```
pages/jobs/
└── new/
    └── page.tsx               (Job Create page)

components/jobs/
├── JobForm.tsx                (Main form - reused for edit)
├── JobFormInfo.tsx            (Name, job number)
├── JobFormClient.tsx          (Client selection/creation)
├── JobFormAddress.tsx         (Address fields)
├── JobFormContract.tsx        (Contract details)
├── JobFormAssignments.tsx     (Team assignment)
├── ClientSearchSelect.tsx     (Searchable client dropdown)
└── JobNumberGenerator.tsx     (Auto-generate logic)
```

---

## Affected By Changes To
- Clients (selection list)
- Users (assignment list)
- Leads (pre-fill data)
- Company settings (job number format)

## Affects
- Jobs list (adds new job)
- Leads (updates lead.job_id)
- Clients (may create new client)
- Activity log (creates "Job created" entry)

---

## Mobile Considerations

- Step-by-step wizard format (one section per screen)
- Address autocomplete with current location option
- Client search with "Add New" inline
- Photo capture for job site
- Minimal required fields on mobile
- Save as draft and continue on desktop
- Offline: Queue job creation for sync

---

## Gap Items Addressed

### Section 45: Per-Page Feature Requirements
- No dedicated "Job Create" page items in Section 45 — creation is triggered from Project List (GAP-637 bulk actions) and Lead conversion flows.

### Cross-Section Gap Items
- GAP-18: Configurable job phases and naming conventions — phase options on create should be builder-configurable
- GAP-21: Configurable numbering conventions — job number format (e.g., "2024-001" vs. "BC-2024-PRJ-001") must be per-builder
- GAP-23: Custom fields on projects — create form must include any builder-defined custom fields
- GAP-24: Custom dropdown values — project type options should be configurable per tenant
- GAP-29: Configurable required fields — some builders want job number required, others do not
- GAP-30: Conditional logic — e.g., "if project type = renovation, require asbestos survey field"
- GAP-33: Out-of-box defaults for new customers — form should work on day 1 without configuration
- GAP-245: Configurable stages for lead-to-project transition
- GAP-247: Plan-bid-build workflow — client brings completed plans, not all jobs come from leads
- GAP-248: Design-build workflow — builder manages design phase, needs tracking during creation
- GAP-250: Pre-construction agreements — paid planning/design phase before construction contract
- GAP-253: Scope development iterations — create may represent V1 concept that evolves
- GAP-259: Estimate templates by project type — link template during job creation
- GAP-277: Budget templates for different project types — attach budget template at creation
- GAP-291: Support for different scheduling methods — option to attach schedule template
- GAP-292: Schedule templates that builders create and reuse per project type
- GAP-300: Phased projects — ability to define phases at creation (main house, pool, guest house)
- GAP-487: Offline mode — queue job creation for sync when connected
- GAP-533: Empty state guidance — first-time job creation with helpful prompts

## Additional Requirements from Gap Analysis
- Template-based job creation is not specified — ability to create a job from a project template that pre-populates budget lines, schedule tasks, and phase structure (GAP-259, GAP-277, GAP-292)
- Custom fields per tenant are not shown in the create form (GAP-23)
- Configurable required fields are not supported — the form hardcodes which fields are required (GAP-29)
- Conditional field logic is missing — dynamic form fields based on project type or other selections (GAP-30)
- Configurable job number format per builder is not specified beyond "YEAR-SEQUENCE" (GAP-21)
- Pre-construction agreement option — ability to mark job as a pre-construction engagement with separate billing (GAP-250)
- Phased project setup — ability to define multiple phases during creation (GAP-300)
- Design-build vs. plan-bid-build workflow selection at creation time (GAP-247, GAP-248)
- Contract type options should include GMP (Guaranteed Maximum Price) and Not-to-Exceed in addition to Fixed Price, Cost Plus, T&M (GAP-267)
- Budget/schedule template attachment during job creation for rapid project setup (GAP-259, GAP-292)
- Duplicate/clone existing job as a template for new job creation is not mentioned

---

## Revision History
| Date | Change |
|------|--------|
| Initial | Created from planning session |
| 2026-02-11 | Added Gap Items Addressed and Additional Requirements from gap analysis |
