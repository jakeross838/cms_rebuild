# View Plan: Lead Create

## Overview
- **URL**: `/leads/new`
- **Purpose**: Create a new lead with contact and project information
- **Layout**: Full page form

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to Leads                                     [Cancel] [Save] │
│                                                                     │
│                        Create New Lead                              │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   CONTACT INFORMATION                                               │
│   ─────────────────────                                             │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Lead/Project Name *              Contact Name               │   │
│   │  [________________________]       [________________________] │   │
│   │                                                              │   │
│   │  Email *                          Phone *                    │   │
│   │  [________________________]       [________________________] │   │
│   │  (* at least one required)                                   │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   PROJECT ADDRESS                                                   │
│   ─────────────────                                                 │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Street Address                                              │   │
│   │  [________________________]                                  │   │
│   │                                                              │   │
│   │  City                    State         Zip                   │   │
│   │  [________________]      [____]        [________]            │   │
│   │                                                              │   │
│   │  Lot Info (subdivision, lot #)                               │   │
│   │  [________________________]                                  │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   PROJECT DETAILS                                                   │
│   ─────────────────                                                 │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Project Type                     Estimated Value            │   │
│   │  [New Construction     ▼]         [$________________]        │   │
│   │                                                              │   │
│   │  Source                           Referral From              │   │
│   │  [Referral            ▼]          [________________]         │   │
│   │                                   (shows if source=referral) │   │
│   │                                                              │   │
│   │  Timeline                                                    │   │
│   │  [________________]                                          │   │
│   │                                                              │   │
│   │  Style Preferences                                           │   │
│   │  [                                                        ]  │   │
│   │  [                                                        ]  │   │
│   │  [                                                        ]  │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   NOTES                                                             │
│   ─────                                                             │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  [                                                        ]  │   │
│   │  [                                                        ]  │   │
│   │  [                                                        ]  │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   ASSIGNMENT                                                        │
│   ──────────                                                        │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Assign to                                                   │   │
│   │  [John Smith            ▼]  (defaults to current user)       │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│                                               [Cancel]    [Save]    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Form Fields

### Contact Information
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | text | Yes | Min 2 chars |
| contact_name | text | No | |
| email | email | Conditional | Valid email format |
| phone | tel | Conditional | Valid phone format |

*At least one of email or phone required*

### Project Address
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| address | text | No | |
| city | text | No | |
| state | select | No | US states dropdown |
| zip | text | No | 5 or 9 digit |
| lot_info | text | No | |

### Project Details
| Field | Type | Required | Options |
|-------|------|----------|---------|
| project_type | select | No | New Construction, Renovation, Addition, Remodel, Other |
| estimated_value | currency | No | |
| source | select | No | Referral, Website, Social Media, Direct, Trade Show, Other |
| referral_source | text | No | Shows only if source = Referral |
| timeline | text | No | Free text: "Spring 2025", "ASAP", etc. |
| style_preferences | textarea | No | |

### Notes
| Field | Type | Required |
|-------|------|----------|
| notes | textarea | No |

### Assignment
| Field | Type | Required | Default |
|-------|------|----------|---------|
| assigned_user_id | select | No | Current user |

---

## Behavior

### On Save
1. Validate required fields
2. Create lead with stage = "New"
3. Create activity: "Lead created"
4. Navigate to Lead Detail page

### On Cancel
- Confirm if form has changes
- Navigate back to Leads Pipeline

### Auto-save Draft
- Optional: Save draft to localStorage
- Restore if user returns

---

## Validation Rules

```typescript
const schema = {
  name: required().min(2, "Name must be at least 2 characters"),
  email: email().optional(),
  phone: phone().optional(),
  // Custom: at least one of email or phone
  contactMethod: custom((data) => {
    if (!data.email && !data.phone) {
      return "Email or phone is required";
    }
  }),
  estimated_value: number().positive().optional(),
  zip: regex(/^\d{5}(-\d{4})?$/).optional(),
};
```

---

## API Endpoint

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/leads` | All form fields |

**Response**: Created lead object with ID

---

## Component Structure

```
pages/leads/
└── new/
    └── page.tsx           (Lead Create page)

components/leads/
├── LeadForm.tsx           (Reusable form - used for create AND edit)
├── LeadFormContact.tsx    (Contact section)
├── LeadFormAddress.tsx    (Address section)
├── LeadFormProject.tsx    (Project details section)
└── LeadFormNotes.tsx      (Notes section)
```

---

## Mobile Considerations
- Single column layout on mobile
- Sections stack vertically
- Sticky save/cancel buttons at bottom

---

## Affected By Changes To
- Users (assigned user dropdown)
- Company settings (default values)

## Affects
- Leads list (adds new lead)
- Activity log (creates "Lead created" entry)

---

## Gap Items Addressed

### Section 45: Per-Page Feature Requirements
- No dedicated lead create page in Section 45. Lead capture is covered in Section 10.

### Cross-Section Gap Items (Section 10: Lead & Preconstruction Pipeline)
- GAP-237: Lead source tracking — source field on create form must capture origin (website, referral, Houzz, social media, Parade of Homes, etc.)
- GAP-238: Lead routing — auto-assignment based on rules (round-robin, geographic, project type)
- GAP-240: Lead qualification scoring — initial score calculated at creation based on data provided
- GAP-243: Lead deduplication — check for existing leads with same email/phone/name before creating
- GAP-245: Configurable initial stage — not all leads start as "New" for every builder

### Additional Cross-Section Items
- GAP-23: Custom fields on lead entity — create form must include builder-defined custom fields
- GAP-24: Custom dropdown values — source options, project type options configurable per builder
- GAP-29: Configurable required fields — which fields are required may differ per builder
- GAP-30: Conditional logic — dynamic fields based on selections (e.g., renovation requires existing home details)
- GAP-33: Out-of-box defaults — form should work on day 1 without builder configuration
- GAP-64: Import from CSV/Excel — bulk lead import for builders migrating from spreadsheets
- GAP-65: Import from email — parse lead inquiries from email
- GAP-237: Multiple lead sources need configurable options per builder
- GAP-487: Offline mode — queue lead creation for sync when connected
- GAP-488: Mobile-specific features — camera integration for site photos, GPS for location
- GAP-533: Empty state guidance — helpful prompts for first-time lead creation

## Additional Requirements from Gap Analysis
- Lead deduplication check at creation time (warn if similar lead exists) is not specified (GAP-243)
- Auto-assignment / lead routing rules based on builder configuration are missing (GAP-238)
- Initial qualification score calculation at creation is not covered (GAP-240)
- Custom fields per tenant on the create form are not addressed (GAP-23)
- Configurable required fields per builder are not supported (GAP-29)
- Conditional form logic (dynamic fields based on project type) is missing (GAP-30)
- Configurable source dropdown values per builder are not specified (GAP-24)
- Bulk lead import from CSV/Excel for migration scenarios is not covered (GAP-64)
- Email-to-lead parsing capability is not mentioned (GAP-65)
- Web form integration — leads auto-created from builder's website contact form (GAP-237)
- GPS auto-fill for project address when creating lead on mobile at the lot (GAP-488)

---

## Revision History
| Date | Change |
|------|--------|
| Initial | Created from planning session |
| 2026-02-11 | Added Gap Items Addressed and Additional Requirements from gap analysis |
