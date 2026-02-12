# View Plan: Leads Pipeline

## Overview
- **URL**: `/leads`
- **Purpose**: Manage sales pipeline for potential construction projects
- **View Type**: Kanban board + Table list (toggle between views)

---

## Layout

### Header
- Title: "Leads"
- View toggle: Board | List
- Filters button (opens filter panel)
- "+ New Lead" button

### Board View (Kanban)
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│    NEW      │  QUALIFIED  │  PROPOSAL   │    WON      │
│    (3)      │    (5)      │   SENT (2)  │    (12)     │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │
│ │ Card    │ │ │ Card    │ │ │ Card    │ │ │ Card    │ │
│ └─────────┘ │ └─────────┘ │ └─────────┘ │ └─────────┘ │
│ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │             │
│ │ Card    │ │ │ Card    │ │ │ Card    │ │             │
│ └─────────┘ │ └─────────┘ │ └─────────┘ │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Lead Card (Minimal)
```
┌─────────────────────────┐
│ Smith Residence         │  ← Client name
│ New Construction        │  ← Project type
│ $850,000               │  ← Estimated value
│ ○ Jake R.              │  ← Assigned user (avatar)
└─────────────────────────┘
```

### List View (Table)
| Column | Sortable | Notes |
|--------|----------|-------|
| Name | Yes | Client/project name |
| Project Type | Yes | New construction, renovation, etc. |
| Est. Value | Yes | Currency formatted |
| Stage | Yes | Badge with color |
| Source | Yes | Referral, website, etc. |
| Assigned | Yes | User avatar + name |
| Last Contact | Yes | Relative date |
| Created | Yes | Date added |
| Actions | No | View, Convert, Delete |

---

## Stages

| Stage | Color | Description |
|-------|-------|-------------|
| New | Gray | Just came in, haven't talked yet |
| Qualified | Blue | Talked, they're serious, good fit |
| Proposal Sent | Yellow | Proposal sent, waiting for answer |
| Won | Green | Signed deal (auto-creates job if not exists) |
| Lost | Red | Did not win (hidden by default) |

---

## Filters Panel

| Filter | Type | Options |
|--------|------|---------|
| Stage | Multi-select | New, Qualified, Proposal Sent, Won, Lost |
| Assigned User | Multi-select | List of team members |
| Source | Multi-select | Referral, Website, Direct, Other |
| Project Type | Multi-select | New construction, Renovation, Addition, etc. |
| Est. Value | Range | Min / Max |
| Created Date | Date range | From / To |
| Show Lost | Toggle | Show/hide lost leads (default: hide) |

---

## Interactions

### Drag & Drop (Board View)
- Drag card between columns to change stage
- Auto-saves on drop
- If dragged to "Won" → Prompt: "Create job now?" (if no job linked)

### Card Click
- Opens Lead Detail view (slide-over or navigate)

### New Lead Button
- Opens Lead Create modal/page

### Bulk Actions (List View)
- Select multiple → Change stage, Assign user, Delete

---

## Data Requirements

### Lead Entity Fields
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | uuid | Yes | Primary key |
| company_id | uuid | Yes | Tenant isolation |
| name | string | Yes | Client/project name |
| contact_name | string | No | Primary contact |
| email | string | No | |
| phone | string | No | |
| address | string | No | Project address |
| city | string | No | |
| state | string | No | |
| zip | string | No | |
| project_type | string | No | New construction, renovation, etc. |
| estimated_value | decimal | No | |
| source | string | No | Referral, website, etc. |
| referral_source | string | No | If source=referral, who referred |
| stage | string | Yes | New, Qualified, Proposal Sent, Won, Lost |
| assigned_user_id | uuid | No | FK to users |
| client_id | uuid | No | FK to clients (created when converted) |
| job_id | uuid | No | FK to jobs (when converted) |
| notes | text | No | General notes |
| lot_info | string | No | Lot number, subdivision |
| style_preferences | text | No | Architectural style notes |
| timeline | string | No | When they want to start |
| last_contact_at | timestamp | No | Last activity date |
| lost_reason | string | No | If lost, why |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

---

## Actions

### Convert to Job
**Trigger**: Mark as Won, or explicit "Create Job" action
**Process**:
1. If client doesn't exist → Create client from lead contact info
2. Create job with:
   - name = lead.name
   - client_id = new/existing client
   - address = lead.address
   - phase = "pre_construction"
   - contract_amount = lead.estimated_value (initial)
3. Link job to lead (lead.job_id = new job)
4. Navigate to new job

### Quick Actions
- Edit lead (inline or modal)
- Add note/activity
- Create task/reminder
- Change stage
- Assign user
- Mark as lost (prompts for reason)
- Delete (soft delete with confirmation)

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/leads` | List leads with filters |
| POST | `/api/leads` | Create lead |
| GET | `/api/leads/:id` | Get lead detail |
| PATCH | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Soft delete |
| POST | `/api/leads/:id/convert` | Convert to job |
| POST | `/api/leads/:id/activities` | Add activity/note |

---

## Component Structure

```
pages/leads/
├── page.tsx              (Leads Pipeline page)
└── [id]/
    └── page.tsx          (Lead Detail page)

components/leads/
├── LeadsPipeline.tsx     (Main container with view toggle)
├── LeadsBoard.tsx        (Kanban board view)
├── LeadsList.tsx         (Table view)
├── LeadCard.tsx          (Card for board view)
├── LeadFilters.tsx       (Filter panel)
├── LeadForm.tsx          (Create/edit form)
├── LeadConvertDialog.tsx (Convert to job dialog)
└── LeadActivityFeed.tsx  (Activity/notes list)
```

---

## Affected By Changes To
- Users (assigned user list)
- Clients (auto-create on convert)
- Jobs (create on convert)

## Affects
- Jobs (creates jobs when converted)
- Clients (creates clients when converted)
- Activities (creates activity records)

---

## Open Questions
- None currently

---

## Mobile Considerations

- Kanban board with horizontal swipe between stages
- Card-based lead list with swipe actions (call, email, move stage)
- Tap to call/email from lead card
- Quick add lead with minimal fields
- Voice notes for lead details
- Offline: Cache pipeline, queue stage changes
- Pull-to-refresh pipeline data

---

## Gap Items Addressed

### Section 45: Per-Page Feature Requirements
- No dedicated leads pipeline page in Section 45. Lead management is covered in Sections 10 and 39.

### Cross-Section Gap Items (Section 10: Lead & Preconstruction Pipeline)
- GAP-236: Platform provides lead management vs. CRM integration (HubSpot, Salesforce)
- GAP-237: Track where leads come from — website, referral, Houzz, social media, Parade of Homes
- GAP-238: Lead routing for multi-PM builders — round-robin, geographic, project type, PM workload
- GAP-239: Lead nurturing — drip email campaigns, follow-up reminders, status tracking
- GAP-240: Lead qualification scoring — budget realism, lot ownership, timeline, financing (configurable)
- GAP-241: Leads that don't convert — archive and analytics on why they didn't sign
- GAP-242: Scalable UI for builder who gets 50 leads/month vs. 2 leads/month
- GAP-243: Lead duplication detection — same person inquires through website AND Houzz
- GAP-244: Lead source ROI tracking — "$5K on Houzz ads, 3 leads converted to $4.5M in contracts"
- GAP-245: Configurable stages — lead to prospect to preconstruction to active project
- GAP-246: Proposals/estimates sent to leads who don't convert — pricing data still captured

### Additional Cross-Section Items
- GAP-24: Custom dropdown values per tenant — source options, project types, stage names
- GAP-247: Plan-bid-build workflow — not all leads follow design-build path
- GAP-249: Multi-bid tracking — client getting bids from 3 builders
- GAP-525: Multi-project context switching for pipeline management
- GAP-526: Global search across leads and all data types
- GAP-533: Empty state guidance — first lead, no pipeline data yet
- GAP-534: Data density — compact board for large pipelines, comfortable for small
- GAP-535: WCAG 2.1 AA accessibility for board interactions (drag-and-drop alternatives)
- GAP-569: Marketing tracking integration (HubSpot, Mailchimp) for lead source data
- GAP-572: Referral program management — track referral sources, manage referral fees/gifts
- GAP-573: Competitive win/loss analysis — why the lead was won or lost

## Additional Requirements from Gap Analysis
- Lead routing rules for multi-PM builders (round-robin, geographic, workload-based) are not specified (GAP-238)
- Lead nurturing with drip email campaigns and automated follow-up reminders is not covered (GAP-239)
- Lead qualification scoring with configurable criteria is missing (GAP-240)
- Lead deduplication detection is not specified (GAP-243)
- Lead source ROI tracking and analytics are not covered (GAP-244)
- Configurable pipeline stages beyond the 5 hardcoded stages are not addressed (GAP-245)
- Multi-bid scenario tracking (client getting bids from competitors) is missing (GAP-249)
- CRM integration option (HubSpot, Salesforce) as alternative to built-in lead management (GAP-236)
- Lost lead analytics — aggregate reporting on why leads are lost, by category (GAP-241)
- Proposals/estimates sent to non-converting leads should still capture pricing intelligence (GAP-246)
- Accessibility for drag-and-drop kanban interactions needs keyboard alternative (GAP-535)
- Referral tracking and referral program management are not detailed (GAP-572)

---

## Revision History
| Date | Change |
|------|--------|
| Initial | Created from planning session |
| 2026-02-11 | Added Gap Items Addressed and Additional Requirements from gap analysis |
