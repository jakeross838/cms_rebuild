# View Plan: Punch Lists, Final Docs, Warranties

## Views Covered
- Punch Lists (List, Item Detail, Create)
- Final Documents (List, Upload)
- Warranties (List, Detail/Create)

---

# PUNCH LISTS

## Punch List View

### URL
`/jobs/:id/punch-list` (from job nav, Closeout dropdown)

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ Punch List - Smith Residence                      [+ Add Item]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Progress: ████████████████░░░░░░░░  18/24 Complete (75%)           │
│                                                                     │
│ Filter: [All Rooms ▼] [All Trades ▼] [All Status ▼] [Search...]    │
│ View: [List | By Room | By Trade]                                   │
│                                                                     │
│ ═══ KITCHEN (4 items, 2 open) ═════════════════════════════════    │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ☐ #12  Cabinet door alignment      │ ABC Cabinets │ Open       │ │
│ │        Photo attached              │              │ Due: 12/15 │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ ☐ #15  Touch up paint on trim      │ XYZ Painting │ Assigned   │ │
│ │                                    │              │ Due: 12/18 │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ ☑ #08  Faucet installation         │ ABC Plumbing │ Complete   │ │
│ │        Completed 12/10             │              │            │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ ☑ #03  Light fixture centering     │ XYZ Electric │ Complete   │ │
│ │        Completed 12/08             │              │            │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ═══ MASTER BATH (3 items, 1 open) ═════════════════════════════    │
│ ...                                                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Features
- Progress bar showing completion status
- Group by: Room/Area, Trade/Vendor, or flat list
- Filter by status: All, Open, Assigned, Complete
- Bulk actions: Assign vendor, Mark complete
- Print punch list (PDF export)
- Email punch list to vendor(s)

### Punch Item Status Flow
```
Open → Assigned → In Progress → Complete → Verified
                      ↓
                  Rejected (back to In Progress)
```

## Punch Item Detail View

### URL
`/jobs/:id/punch-list/:itemId`

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to Punch List                      [Edit] [Delete]           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ #12 - Cabinet door alignment                           Status: Open │
│ ───────────────────────────────────────────────────────────────────│
│                                                                     │
│ DETAILS                                                             │
│ ─────────                                                           │
│ Location: Kitchen                                                   │
│ Trade: Cabinets                                                     │
│ Vendor: ABC Cabinets                                                │
│ Created: Dec 5, 2024 by Jake Ross                                   │
│ Due: Dec 15, 2024                                                   │
│                                                                     │
│ DESCRIPTION                                                         │
│ ─────────                                                           │
│ Upper cabinet doors on east wall are misaligned. Left door hangs   │
│ approximately 1/4" lower than right door. Needs adjustment.         │
│                                                                     │
│ PHOTOS (2)                                                          │
│ ─────────                                                           │
│ ┌─────────┐ ┌─────────┐                                            │
│ │         │ │         │                    [+ Add Photo]            │
│ │  Photo  │ │  Photo  │                                            │
│ └─────────┘ └─────────┘                                            │
│                                                                     │
│ ACTIVITY                                                            │
│ ─────────                                                           │
│ Dec 10 - Vendor notified via email                                  │
│ Dec 5  - Item created by Jake Ross                                  │
│                                                                     │
│ ADD COMMENT                                                         │
│ [________________________________________________] [Post]           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Actions
- Edit item details
- Change status
- Assign/reassign vendor
- Add photos
- Add comments
- Send notification to vendor

## Punch Item Create/Edit

### URL
`/jobs/:id/punch-list/new` or modal overlay

### Form Fields
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Description | text | Yes | What needs to be fixed |
| Location | text/select | Yes | Room or area |
| Trade | select | No | Trade category |
| Vendor | select | No | Assigned vendor |
| Due Date | date | No | Expected completion |
| Priority | select | No | Low, Medium, High |
| Photos | upload | No | Before photos |
| Notes | text | No | Additional details |

### Punch Item Fields (Database)
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| job_id | uuid | |
| item_number | int | Auto-incrementing per job |
| description | text | |
| location | text | Room/area |
| trade | text | |
| vendor_id | uuid | Assigned vendor |
| status | string | open, assigned, in_progress, complete, verified |
| priority | string | low, medium, high |
| due_date | date | |
| completed_at | timestamp | |
| verified_at | timestamp | |
| verified_by | uuid | |
| photos | array | Photo URLs |
| notes | text | |
| created_by | uuid | |

---

# FINAL DOCUMENTS

## Final Docs List View

### URL
`/jobs/:id/final-docs` (from job nav, Closeout dropdown)

### Purpose
Collect and organize all closeout documents required for project completion.

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ Final Documents - Smith Residence                   [+ Upload]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Closeout Package: 8/12 Required Documents (67%)                     │
│ ████████████░░░░░░░░                                               │
│                                                                     │
│ ═══ REQUIRED DOCUMENTS ════════════════════════════════════════    │
│                                                                     │
│ ┌───────────────────────────────────────────────────────────────┐  │
│ │ Document                    │ Status      │ Uploaded          │  │
│ ├─────────────────────────────┼─────────────┼───────────────────┤  │
│ │ ☑ Certificate of Occupancy  │ Received    │ Dec 10, 2024     │  │
│ │ ☑ Final Inspection Report   │ Received    │ Dec 8, 2024      │  │
│ │ ☑ Mechanical Permit Close   │ Received    │ Dec 5, 2024      │  │
│ │ ☑ Electrical Permit Close   │ Received    │ Dec 5, 2024      │  │
│ │ ☑ Plumbing Permit Close     │ Received    │ Dec 5, 2024      │  │
│ │ ☑ HVAC Start-up Report      │ Received    │ Dec 3, 2024      │  │
│ │ ☑ Appliance Manuals         │ Received    │ Dec 1, 2024      │  │
│ │ ☑ As-Built Drawings         │ Received    │ Nov 28, 2024     │  │
│ │ ☐ Lien Waivers (all subs)   │ Pending     │ -                │  │
│ │ ☐ Final Survey              │ Pending     │ -                │  │
│ │ ☐ Warranty Documents        │ Pending     │ → Warranties tab │  │
│ │ ☐ Owner's Manual            │ Pending     │ -                │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ ═══ ADDITIONAL DOCUMENTS ══════════════════════════════════════    │
│                                                                     │
│ ┌───────────────────────────────────────────────────────────────┐  │
│ │ Landscape Plan              │ Dec 2, 2024  │ [View] [Delete] │  │
│ │ Paint Schedule              │ Nov 15, 2024 │ [View] [Delete] │  │
│ │ Floor Finish Schedule       │ Nov 10, 2024 │ [View] [Delete] │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ [Generate Closeout Package PDF]                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Features
- Checklist of required documents (customizable in settings)
- Track received vs pending
- Upload documents
- Link to warranty documents
- Generate complete closeout package as PDF
- Email closeout package to client

### Required Documents (Default Checklist)
Configurable per company in Settings:
- Certificate of Occupancy
- Final Inspection Report
- Permit Closeout Letters
- HVAC Start-up Report
- Appliance Manuals
- As-Built Drawings
- Lien Waivers
- Final Survey
- Warranty Documents
- Owner's Manual/Binder

## Final Doc Upload

### Modal/Drawer
```
┌─────────────────────────────────────────────────────────────────────┐
│ Upload Document                                              [X]    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Document Type                                                       │
│ [Select document type...                                     ▼]    │
│                                                                     │
│   ○ Certificate of Occupancy                                        │
│   ○ Final Inspection Report                                         │
│   ○ Permit Closeout                                                 │
│   ○ ... (required docs)                                            │
│   ○ Other (custom)                                                  │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │                                                                 │ │
│ │              Drag & drop file here or click to browse           │ │
│ │                                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ Document Name (optional)                                            │
│ [Auto-filled from type________________________________]             │
│                                                                     │
│ Notes                                                               │
│ [________________________________________________]                  │
│                                                                     │
│                                      [Cancel] [Upload]              │
└─────────────────────────────────────────────────────────────────────┘
```

### Final Document Fields
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| job_id | uuid | |
| document_type | string | From checklist or "other" |
| name | text | Display name |
| file_url | text | Storage URL |
| uploaded_at | timestamp | |
| uploaded_by | uuid | |
| notes | text | |
| is_required | boolean | Part of checklist |

---

# WARRANTIES

## Warranties List View

### URL
`/jobs/:id/warranties` (from job nav, Closeout dropdown)

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ Warranties - Smith Residence                       [+ Add Warranty] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Filter: [All Types ▼] [All Status ▼] [Search...]                   │
│                                                                     │
│ ═══ ACTIVE WARRANTIES ═════════════════════════════════════════    │
│                                                                     │
│ ┌───────────────────────────────────────────────────────────────┐  │
│ │ Item                 │ Vendor          │ Expires    │ Status  │  │
│ ├──────────────────────┼─────────────────┼────────────┼─────────┤  │
│ │ HVAC System          │ ABC HVAC        │ Dec 2034   │ Active  │  │
│ │ 10-year parts/labor  │                 │ (10 years) │ [View]  │  │
│ ├──────────────────────┼─────────────────┼────────────┼─────────┤  │
│ │ Roof Shingles        │ XYZ Roofing     │ Dec 2054   │ Active  │  │
│ │ 30-year manufacturer │                 │ (30 years) │ [View]  │  │
│ ├──────────────────────┼─────────────────┼────────────┼─────────┤  │
│ │ Windows              │ Window Co       │ Dec 2044   │ Active  │  │
│ │ Lifetime glass seal  │                 │ (20 years) │ [View]  │  │
│ ├──────────────────────┼─────────────────┼────────────┼─────────┤  │
│ │ Workmanship          │ Ross Built      │ Dec 2025   │ Active  │  │
│ │ 1-year builder       │                 │ (1 year)   │ [View]  │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ ═══ EXPIRING SOON (within 90 days) ════════════════════════════    │
│                                                                     │
│ ┌───────────────────────────────────────────────────────────────┐  │
│ │ ⚠️ Workmanship - Ross Built              │ Expires Dec 2025  │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ ═══ EXPIRED ════════════════════════════════════════════════════   │
│ (none)                                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Features
- Group by: Active, Expiring Soon, Expired
- Sort by expiration date
- Upload warranty documents
- Email warranty info to client
- Set reminders for expiring warranties
- Link to vendor contact info

## Warranty Detail/Create View

### URL
`/jobs/:id/warranties/:id` or modal

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ Warranty - HVAC System                              [Edit] [Delete] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ COVERAGE                                                            │
│ ─────────                                                           │
│ Item: HVAC System - Carrier 24ACC636A003                           │
│ Type: Parts & Labor                                                 │
│ Duration: 10 years                                                  │
│ Start Date: December 15, 2024                                       │
│ Expiration: December 15, 2034                                       │
│                                                                     │
│ PROVIDER                                                            │
│ ─────────                                                           │
│ Vendor: ABC HVAC                                                    │
│ Contact: John Smith                                                 │
│ Phone: 512-555-0123                                                 │
│ Email: service@abchvac.com                                          │
│                                                                     │
│ WARRANTY DETAILS                                                    │
│ ─────────                                                           │
│ [Covers all parts and labor for the complete HVAC system           │
│  including compressor, coils, and air handler. Excludes            │
│  filters and maintenance items. Annual service required to         │
│  maintain warranty coverage.]                                       │
│                                                                     │
│ DOCUMENTS                                                           │
│ ─────────                                                           │
│ 📄 Carrier_Warranty_Certificate.pdf          [View] [Download]     │
│ 📄 Registration_Confirmation.pdf             [View] [Download]     │
│                                         [+ Upload Document]         │
│                                                                     │
│ SERVICE HISTORY                                                     │
│ ─────────                                                           │
│ (Track any warranty claims or service calls here)                   │
│ [+ Log Service Call]                                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Warranty Fields
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | uuid | | |
| job_id | uuid | Yes | |
| item_name | text | Yes | What's covered |
| item_description | text | No | Model/serial numbers |
| warranty_type | string | Yes | Parts, Labor, Parts & Labor, Manufacturer, Workmanship |
| vendor_id | uuid | No | Warranty provider |
| start_date | date | Yes | Usually completion date |
| duration_years | int | No | Alternative to end_date |
| end_date | date | Yes | Expiration |
| coverage_details | text | No | What's covered/excluded |
| documents | array | No | Uploaded warranty docs |
| notes | text | No | |

### Warranty Types
- **Parts Only**: Covers replacement parts
- **Labor Only**: Covers labor to repair
- **Parts & Labor**: Full coverage
- **Manufacturer**: Direct from manufacturer
- **Workmanship**: Builder's warranty on work quality

---

## API Endpoints

### Punch Lists
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/jobs/:id/punch-items` | List all items |
| POST | `/api/jobs/:id/punch-items` | Create item |
| GET | `/api/punch-items/:id` | Get item detail |
| PATCH | `/api/punch-items/:id` | Update item |
| DELETE | `/api/punch-items/:id` | Delete item |
| POST | `/api/punch-items/:id/photos` | Add photo |
| POST | `/api/punch-items/bulk-update` | Bulk status change |

### Final Documents
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/jobs/:id/final-docs` | List documents |
| POST | `/api/jobs/:id/final-docs` | Upload document |
| DELETE | `/api/final-docs/:id` | Delete document |
| GET | `/api/jobs/:id/closeout-package` | Generate PDF |

### Warranties
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/jobs/:id/warranties` | List warranties |
| POST | `/api/jobs/:id/warranties` | Create warranty |
| GET | `/api/warranties/:id` | Get warranty |
| PATCH | `/api/warranties/:id` | Update warranty |
| DELETE | `/api/warranties/:id` | Delete warranty |

---

## Component Structure

```
components/closeout/
├── punch-list/
│   ├── PunchList.tsx
│   ├── PunchItemCard.tsx
│   ├── PunchItemDetail.tsx
│   ├── PunchItemForm.tsx
│   ├── PunchStatusBadge.tsx
│   └── PunchListExport.tsx
│
├── final-docs/
│   ├── FinalDocsList.tsx
│   ├── FinalDocUpload.tsx
│   ├── DocChecklist.tsx
│   └── CloseoutPackageGenerator.tsx
│
└── warranties/
    ├── WarrantiesList.tsx
    ├── WarrantyDetail.tsx
    ├── WarrantyForm.tsx
    └── WarrantyExpirationAlert.tsx
```

---

## Integration Points

### Punch List → Vendors
- Assign punch items to vendors
- Send notification emails
- Track vendor response/completion

### Punch List → Photos
- Photos attached to punch items
- Before/after documentation

### Punch List → Daily Logs
- Log punch list work in daily logs
- Track hours spent on corrections

### Final Docs → Warranties
- Warranty documents link to warranty records
- Complete closeout requires all warranties documented

### Warranties → Client Portal
- Client can view warranty information
- Access warranty documents
- Contact info for service

---

## Affected By Changes To
- Jobs (all items are job-scoped)
- Vendors (punch item assignments, warranty providers)
- Users (assigned items, verification)
- Photos (attached to punch items)
- Files (warranty documents, closeout docs)

## Affects
- Job status (closeout completion → warranty phase)
- Client Portal (warranty info visible)
- Vendor performance (punch item response tracking)
- Files (closeout package generated)
- Activity logs (punch item status changes)
- Reports (closeout metrics)

---

## Mobile Considerations

- **Punch List**: Primary mobile use case - walkthrough entry
- Photo capture with markup/annotation tools
- Voice-to-text for punch item descriptions
- Quick-add with room/area selection wheel
- Assign to vendor from dropdown, auto-notify
- Status update with one-tap toggle
- Before/after photo pairing for completed items
- Client walkthrough mode: simplified view, signature capture
- **Final Docs**: View document checklist with completion status
- Document viewer with pinch-to-zoom
- Camera capture for document uploads
- **Warranties**: Searchable warranty list with filters
- View warranty details and expiration dates
- Tap to call vendor for service
- Push notifications for expiring warranties
- Offline: Cache punch list and warranties, queue updates
- Sync punch item photos when connected

---

## Gap Items Addressed

### From Section 22: Punch Lists & Checklists (Items 411-420)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 411 | Punch list categories configurable (by room, trade, severity) | Group-by toggle (Room/Area, Trade/Vendor, flat list) and Priority field (Low/Medium/High) |
| 412 | Punch list templates by project type | Requires: template system for default punch checklists per project type in Settings |
| 413 | Punch list assignment workflows (assign -> vendor completes -> builder verifies) | Status flow: Open -> Assigned -> In Progress -> Complete -> Verified with vendor notification |
| 414 | Punch list SLAs (resolved within X days, configurable) | Due Date field present; Requires: configurable SLA rules and overdue alerting per builder |
| 415 | Pre-punch / quality checklists during construction (ongoing quality gates) | Requires: separate Quality Checklist feature linked to schedule phases, not just final punch |
| 416 | Punch list integration with warranty (unresolved punch -> warranty item) | Final Docs links to Warranties tab; Requires: automatic conversion of open punch items to warranty items at CO |
| 417 | Punch list photo requirements (before, after, verification) | Photo upload on items with before/after pairing in mobile; Requires: enforced photo requirements per status change |
| 418 | Client punch list submission via portal | Requires: Client Portal punch submission view with simplified form and photo upload |
| 419 | Vendor self-inspection checklists | Requires: vendor-facing checklist templates accessible from Vendor Portal before requesting inspection |
| 420 | Punch list cost tracking (back-charge to responsible vendor) | Requires: cost tracking fields per punch item linking to vendor back-charge invoices |

### From Section 45: Per-Page Feature Requirements — Selections/Daily Log (Items 724-735)
| Gap # | Description | Relevance to This Spec |
|-------|-------------|------------------------|
| 735 | Designer view for selections | N/A to punch, but warranty items may originate from selection defects |

### From Section 27: Warranty & Home Care (Items 465-470)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 465 | Warranty/home care as optional module | Warranties tab exists under Closeout; Requires: module enable/disable toggle in builder settings |
| 466 | Configurable warranty terms per builder (1yr, 2yr, 10yr structural) | Warranty form has duration_years and warranty_type fields; Requires: builder-configurable default terms |
| 467 | Warranty service request routing (builder-configurable) | Service History section with "Log Service Call"; Requires: configurable routing rules for service requests |
| 468 | Home care subscription pricing (varies by builder) | Requires: subscription pricing configuration in builder settings, not currently in spec |
| 469 | Manufacturer vs. builder warranty distinction | Warranty Types include Manufacturer and Workmanship; covers this distinction |
| 470 | Warranty reserve accounting (configurable % set aside) | Requires: financial integration to set aside reserve percentage per project cost in budget module |

### From Edge Cases (Sections 44, 46, 47)
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 599 | Client bankruptcy mid-construction (lien filing, partial billing, close-out) | Closeout docs must support partial close-out workflows and lien filing documentation |
| 601 | Sub fired mid-scope (termination docs, scope reassignment) | Punch items must support vendor reassignment with history preserved |
| 610 | Client self-performs work (warranty exclusions) | Warranty records need "excluded" or "client-responsible" coverage type |
| 797 | Mechanic's lien documentation by state | Final Docs checklist should include state-specific lien waiver requirements |
| 801 | Warranty claim dispute resolution documentation | Warranty Detail needs dispute tracking fields and resolution documentation |
| 874 | Project completion -> warranty start dates set automatically | Requires: automated warranty creation from templates at project completion milestone |

---

## Revision History
| Date | Change |
|------|--------|
| 2026-02-11 | Added Gap Items Addressed section from gap analysis sections 22, 27, 44-48 |
| Initial | Created from batch planning |
