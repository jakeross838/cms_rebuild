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
│   │  [Jake Ross            ▼]  (defaults to current user)        │   │
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

## Revision History
| Date | Change |
|------|--------|
| Initial | Created from planning session |
