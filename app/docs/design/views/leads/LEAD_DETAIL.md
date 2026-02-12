# View Plan: Lead Detail

## Overview
- **URL**: `/leads/:id`
- **Purpose**: View and manage a single lead with all related information
- **Layout**: Single page with all sections visible (no tabs)

---

## Layout

### Page Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to Leads          Smith Residence              [Actions ▼]  │
│                          New Construction                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────┬─────────────────────────────┐   │
│ │        HEADER ACTIONS           │       STAGE INDICATOR       │   │
│ │  [Log Call] [Email] [Add Note]  │  ● New → Qualified → ...    │   │
│ │  [Create Task]                  │  [Convert to Job]           │   │
│ └─────────────────────────────────┴─────────────────────────────┘   │
│                                                                     │
│ ┌─────────────────────────────────┬─────────────────────────────┐   │
│ │         LEFT COLUMN             │       RIGHT COLUMN          │   │
│ │                                 │                             │   │
│ │  ┌──────────────────────────┐   │  ┌───────────────────────┐  │   │
│ │  │    CONTACT INFO          │   │  │   ACTIVITY FEED       │  │   │
│ │  │    Name, email, phone    │   │  │   Timeline of all     │  │   │
│ │  │    Address               │   │  │   interactions        │  │   │
│ │  │    [Edit]                │   │  │                       │  │   │
│ │  └──────────────────────────┘   │  │   - Call logged       │  │   │
│ │                                 │  │   - Note added        │  │   │
│ │  ┌──────────────────────────┐   │  │   - Stage changed     │  │   │
│ │  │    PROJECT INFO          │   │  │   - Email sent        │  │   │
│ │  │    Type, value, source   │   │  │                       │  │   │
│ │  │    Timeline, lot info    │   │  └───────────────────────┘  │   │
│ │  │    Style preferences     │   │                             │   │
│ │  │    [Edit]                │   │  ┌───────────────────────┐  │   │
│ │  └──────────────────────────┘   │  │   TASKS / REMINDERS   │  │   │
│ │                                 │  │   - Follow up call    │  │   │
│ │  ┌──────────────────────────┐   │  │   - Send proposal     │  │   │
│ │  │    FILES                 │   │  │   [+ Add Task]        │  │   │
│ │  │    Attachments           │   │  └───────────────────────┘  │   │
│ │  │    [Upload]              │   │                             │   │
│ │  └──────────────────────────┘   │                             │   │
│ │                                 │                             │   │
│ │  ┌──────────────────────────┐   │                             │   │
│ │  │    NOTES                 │   │                             │   │
│ │  │    General notes field   │   │                             │   │
│ │  │    [Edit]                │   │                             │   │
│ │  └──────────────────────────┘   │                             │   │
│ │                                 │                             │   │
│ └─────────────────────────────────┴─────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Header Section

### Breadcrumb
- "Leads" (link back to pipeline) → "Smith Residence"

### Title Area
- Lead name (large)
- Project type (subtitle)
- Stage badge with color

### Actions Menu (dropdown)
- Edit Lead
- Duplicate Lead
- Mark as Lost
- Delete Lead

---

## Quick Actions Bar

### Communication Actions
| Action | Icon | Behavior |
|--------|------|----------|
| Log Call | Phone | Opens modal: date, duration, notes |
| Email | Mail | Opens modal: subject, body (or launches email client) |
| Add Note | Note | Opens inline note input |
| Create Task | Check | Opens task creation modal |

### Stage Progress
- Visual progress indicator showing current stage
- Clickable to change stage
- "Convert to Job" button (prominent when Qualified or later)

---

## Left Column Sections

### Contact Info Card
| Field | Display |
|-------|---------|
| Contact Name | Text |
| Email | Link (mailto:) |
| Phone | Link (tel:) |
| Address | Multi-line |
| City, State, Zip | Single line |

**Actions**: Edit button (opens edit modal)

### Project Info Card
| Field | Display |
|-------|---------|
| Project Type | Text |
| Estimated Value | Currency |
| Source | Text |
| Referral From | Text (if source = referral) |
| Timeline | Text |
| Lot Info | Text |
| Style Preferences | Multi-line text |

**Actions**: Edit button

### Files Section
- List of uploaded files
- File name, type icon, upload date
- Download/delete actions
- Upload button

### Notes Section
- Rich text area for general notes
- Auto-save on blur
- Last updated timestamp

---

## Right Column Sections

### Activity Feed
Chronological timeline (newest first) of:
| Activity Type | Display |
|---------------|---------|
| Call Logged | "Called for 15 min" + notes |
| Email Sent | Subject + preview |
| Note Added | Note text |
| Stage Changed | "Moved from New to Qualified" |
| Task Created | Task name + due date |
| Task Completed | Task name with strikethrough |
| File Uploaded | File name |
| Lead Created | "Lead created" |

Each item shows:
- Icon for type
- Description
- User who did it
- Relative timestamp

### Tasks / Reminders Section
- List of tasks for this lead
- Each task shows: checkbox, title, due date, assigned user
- Overdue tasks highlighted in red
- Completed tasks can be hidden/shown
- "+ Add Task" button

---

## Interactions

### Edit Lead
- Modal with form for all lead fields
- Save updates the page

### Log Call
Modal fields:
- Date/time (default: now)
- Duration (minutes)
- Notes
- Save adds to activity feed

### Add Note
- Inline text input above activity feed
- Submit adds to activity feed

### Create Task
Modal fields:
- Title
- Description (optional)
- Due date
- Assigned user
- Save adds to tasks section + activity feed

### Convert to Job
Dialog:
1. Confirm client creation (or link to existing)
2. Confirm job name (default: lead name)
3. Create job
4. Navigate to new job

### Mark as Lost
Dialog:
- Reason for loss (dropdown: Price, Timing, Competition, Other)
- Notes
- Confirm moves lead to Lost stage

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/leads/:id` | Get lead with activities, tasks, files |
| PATCH | `/api/leads/:id` | Update lead |
| POST | `/api/leads/:id/activities` | Log call, note, email |
| GET | `/api/leads/:id/activities` | Get activity history |
| POST | `/api/leads/:id/tasks` | Create task |
| GET | `/api/leads/:id/tasks` | Get tasks |
| PATCH | `/api/tasks/:id` | Update task |
| POST | `/api/leads/:id/files` | Upload file |
| DELETE | `/api/leads/:id/files/:fileId` | Delete file |
| POST | `/api/leads/:id/convert` | Convert to job |

---

## Component Structure

```
components/leads/
├── LeadDetail.tsx           (Main page container)
├── LeadHeader.tsx           (Title, stage, actions)
├── LeadQuickActions.tsx     (Log call, email, note, task buttons)
├── LeadContactCard.tsx      (Contact info section)
├── LeadProjectCard.tsx      (Project info section)
├── LeadFiles.tsx            (Files section)
├── LeadNotes.tsx            (Notes section)
├── LeadActivityFeed.tsx     (Activity timeline)
├── LeadTasks.tsx            (Tasks list)
├── LeadEditModal.tsx        (Edit form modal)
├── LogCallModal.tsx         (Log call modal)
├── AddTaskModal.tsx         (Create task modal)
└── ConvertToJobDialog.tsx   (Conversion confirmation)
```

---

## Data Requirements

### Activities Table
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| lead_id | uuid | FK |
| user_id | uuid | Who did it |
| type | string | call, email, note, stage_change, task, file |
| data | jsonb | Type-specific data |
| created_at | timestamp | |

### Lead Tasks Table
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| lead_id | uuid | FK |
| title | string | |
| description | text | |
| due_date | date | |
| assigned_user_id | uuid | FK |
| completed | boolean | |
| completed_at | timestamp | |
| created_at | timestamp | |

### Lead Files Table
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| lead_id | uuid | FK |
| name | string | |
| url | string | Storage URL |
| mime_type | string | |
| size | integer | Bytes |
| uploaded_by | uuid | FK |
| uploaded_at | timestamp | |

---

## Affected By Changes To
- Users (assigned user, activity user)
- Files (file storage)

## Affects
- Jobs (creates job on convert)
- Clients (creates client on convert)
- Activities (creates activity records)
- Tasks (creates tasks)

---

## Mobile Considerations

- Collapsible sections for easy scanning
- Tap to call/email client
- Quick action buttons: Call, Email, Add Note, Convert
- Activity timeline with infinite scroll
- Add note with voice dictation
- Photo capture for site visit documentation
- Offline: View cached lead, queue updates

---

## Revision History
| Date | Change |
|------|--------|
| Initial | Created from planning session |
