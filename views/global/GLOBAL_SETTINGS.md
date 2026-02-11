# View Plan: Global & Settings

## Views Covered
- Login
- Dashboard
- Settings - Company
- Settings - Users

---

# LOGIN

## URL
`/login`

## Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                                                                     │
│                        ┌─────────────────┐                          │
│                        │                 │                          │
│                        │    [LOGO]       │                          │
│                        │   ROSS BUILT    │                          │
│                        │                 │                          │
│                        └─────────────────┘                          │
│                                                                     │
│                      CONSTRUCTION MANAGEMENT                        │
│                                                                     │
│                 ┌─────────────────────────────┐                     │
│                 │ Email                       │                     │
│                 └─────────────────────────────┘                     │
│                                                                     │
│                 ┌─────────────────────────────┐                     │
│                 │ Password                    │                     │
│                 └─────────────────────────────┘                     │
│                                                                     │
│                 ☐ Remember me                                       │
│                                                                     │
│                 [          Sign In          ]                       │
│                                                                     │
│                 Forgot your password?                               │
│                                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Features
- Email/password authentication
- "Remember me" for session persistence
- Forgot password flow
- Error messages for invalid credentials
- Rate limiting (5 attempts, then lockout)
- Redirect to intended page after login

## Auth Flow
1. User enters credentials
2. Validate against Supabase Auth
3. Check user role/permissions
4. Create session
5. Redirect to Dashboard or intended URL

## Security
- HTTPS only
- Secure cookie settings
- Session timeout after inactivity (configurable)
- Password requirements: min 8 chars, 1 number, 1 special char

---

# DASHBOARD

## URL
`/` or `/dashboard`

## Purpose
Landing page after login showing company-wide overview.

## Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│  ☰  ROSS BUILT                                    🔔  👤 Jake ▼    │
├───────────────┬─────────────────────────────────────────────────────┤
│               │                                                     │
│  JOB SIDEBAR  │  Dashboard                                          │
│  [Search...]  │                                                     │
│               │  ═══ YOUR WORK ═════════════════════════════════   │
│  ● ACTIVE     │                                                     │
│  Smith Home   │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  Johnson Add  │  │ 📋 Tasks    │ │ 📄 Invoices │ │ 💵 Draws    │   │
│  Williams     │  │             │ │             │ │             │   │
│               │  │ 5 due today │ │ 12 pending  │ │ 2 ready     │   │
│  ● PRE-CON    │  │             │ │ approval    │ │ for review  │   │
│  Davis Reno   │  │ [View →]    │ │ [View →]    │ │ [View →]    │   │
│               │  └─────────────┘ └─────────────┘ └─────────────┘   │
│               │                                                     │
│               │  ═══ ACTIVE JOBS ═══════════════════════════════   │
│               │                                                     │
│               │  ┌─────────────────────────────────────────────────┐│
│               │  │ Job            │ Status        │ Progress      ││
│               │  ├────────────────┼───────────────┼───────────────┤│
│               │  │ Smith Home     │ Active        │ ██████░░ 75%  ││
│               │  │ Johnson Add    │ Active        │ ████░░░░ 50%  ││
│               │  │ Williams       │ Pre-con       │ ██░░░░░░ 25%  ││
│               │  │ Davis Reno     │ Pre-con       │ █░░░░░░░ 10%  ││
│               │  └─────────────────────────────────────────────────┘│
│               │                                                     │
│               │  ═══ RECENT ACTIVITY ═══════════════════════════   │
│               │                                                     │
│               │  10:30 AM - Invoice #1234 approved (Smith Home)     │
│               │  10:15 AM - New lead: Brown Renovation              │
│               │  09:45 AM - Draw #4 submitted for Smith Home        │
│               │  Yesterday - CO #3 signed by client                 │
│               │  ...                                                │
│               │                                                     │
│               │  ═══ QUICK ACTIONS ═════════════════════════════   │
│               │                                                     │
│               │  [+ New Lead] [+ New Job] [Upload Invoice]          │
│               │                                                     │
└───────────────┴─────────────────────────────────────────────────────┘
```

## Sections

### Your Work (Role-Based)
Shows items needing your attention based on role:

**Project Manager:**
- Tasks due today/overdue
- Invoices needing approval
- Change orders pending
- Daily logs not submitted

**Accountant:**
- Invoices needing review
- Draws to process
- Payment due

**Owner:**
- High-value items for approval
- Overall metrics
- Cash flow summary

### Active Jobs
- Quick list of current jobs
- Progress bars
- Click to navigate to job

### Recent Activity
- Company-wide activity feed
- Filterable by job/user
- Click to navigate to item

### Quick Actions
- Most common actions
- Contextual to user role

---

# SETTINGS - COMPANY

## URL
`/settings/company` (from Settings in menu)

## Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│  Settings                                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Company] [Users] [Cost Codes] [Integrations]                      │
│                                                                     │
│  ═══ COMPANY INFORMATION ═══════════════════════════════════════   │
│                                                                     │
│  Company Name                                                       │
│  [Ross Built Construction_______________________________]           │
│                                                                     │
│  Logo                                                               │
│  ┌─────────────┐                                                    │
│  │             │  [Upload New Logo]                                 │
│  │   [LOGO]    │  Recommended: 400x100px, PNG or SVG                │
│  │             │                                                    │
│  └─────────────┘                                                    │
│                                                                     │
│  ═══ CONTACT INFORMATION ═══════════════════════════════════════   │
│                                                                     │
│  Address                                                            │
│  [123 Main Street________________________________]                  │
│  [Austin____________] [TX___] [78701________]                       │
│                                                                     │
│  Phone                          Email                               │
│  [512-555-0100______]          [info@rossbuilt.com_____]           │
│                                                                     │
│  Website                                                            │
│  [https://rossbuilt.com__________________________]                  │
│                                                                     │
│  ═══ DEFAULTS ══════════════════════════════════════════════════   │
│                                                                     │
│  Default Tax Rate                                                   │
│  [8.25___] %                                                        │
│                                                                     │
│  Default Retainage                                                  │
│  [10_____] %                                                        │
│                                                                     │
│  Default Markup                                                     │
│  [20_____] %                                                        │
│                                                                     │
│  Job Number Format                                                  │
│  [YYYY-NNN] (e.g., 2024-015)                                       │
│                                                                     │
│  ═══ APPROVAL THRESHOLDS ═══════════════════════════════════════   │
│                                                                     │
│  Owner approval required for invoices over:                         │
│  [$ 10,000_______]                                                  │
│                                                                     │
│  Owner approval required for POs over:                              │
│  [$ 10,000_______]                                                  │
│                                                                     │
│  ═══ CLOSEOUT CHECKLIST ════════════════════════════════════════   │
│                                                                     │
│  Required Documents (customize for your company):                   │
│  ☑ Certificate of Occupancy                                        │
│  ☑ Final Inspection Report                                         │
│  ☑ Permit Closeout Letters                                         │
│  ☑ HVAC Start-up Report                                            │
│  ☑ As-Built Drawings                                               │
│  ☑ Lien Waivers                                                    │
│  ☑ Warranty Documents                                              │
│  ☐ Final Survey                                                    │
│  [+ Add Document Type]                                              │
│                                                                     │
│                                              [Save Changes]          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Fields
| Field | Type | Notes |
|-------|------|-------|
| company_name | text | Display name |
| logo_url | file | Uploaded logo |
| address, city, state, zip | text | Company address |
| phone | text | Main phone |
| email | text | Main email |
| website | text | Company website |
| default_tax_rate | decimal | Default % |
| default_retainage | decimal | Default % |
| default_markup | decimal | Default % |
| job_number_format | string | Pattern for job numbers |
| owner_approval_threshold | decimal | $ amount |
| closeout_checklist | array | Required doc types |

---

# SETTINGS - USERS

## URL
`/settings/users`

## Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│  Settings                                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Company] [Users] [Cost Codes] [Integrations]                      │
│                                                                     │
│  Users                                              [+ Invite User] │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ User              │ Email               │ Role      │ Status  │ │
│  ├───────────────────┼─────────────────────┼───────────┼─────────┤ │
│  │ Jake Ross         │ jake@rossbuilt.com  │ Owner     │ Active  │ │
│  │                   │                     │           │ [Edit]  │ │
│  ├───────────────────┼─────────────────────┼───────────┼─────────┤ │
│  │ Sarah Johnson     │ sarah@rossbuilt.com │ PM        │ Active  │ │
│  │                   │                     │           │ [Edit]  │ │
│  ├───────────────────┼─────────────────────┼───────────┼─────────┤ │
│  │ Mike Chen         │ mike@rossbuilt.com  │ Accountant│ Active  │ │
│  │                   │                     │           │ [Edit]  │ │
│  ├───────────────────┼─────────────────────┼───────────┼─────────┤ │
│  │ Lisa Park         │ lisa@rossbuilt.com  │ PM        │ Invited │ │
│  │                   │                     │           │ [Resend]│ │
│  └───────────────────┴─────────────────────┴───────────┴─────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Invite User Modal
```
┌─────────────────────────────────────────────────────────────────────┐
│  Invite User                                                 [X]    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Email                                                              │
│  [________________________________]                                 │
│                                                                     │
│  Name                                                               │
│  [________________________________]                                 │
│                                                                     │
│  Role                                                               │
│  [Select role...                                              ▼]    │
│    ○ Owner - Full access, all approvals                            │
│    ○ Project Manager - Job-level access, approvals                  │
│    ○ Accountant - Financial access, invoice processing             │
│    ○ Superintendent - Field operations, daily logs                  │
│    ○ Estimator - Pre-construction, estimates only                   │
│    ○ Admin - Administrative access, no financial                    │
│                                                                     │
│  Assign to Jobs (optional)                                          │
│  [Select jobs...                                              ▼]    │
│    ☑ Smith Home                                                     │
│    ☑ Johnson Addition                                               │
│    ☐ Williams Project                                               │
│    ☐ Davis Renovation                                               │
│                                                                     │
│                                    [Cancel] [Send Invitation]       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Edit User Modal
```
┌─────────────────────────────────────────────────────────────────────┐
│  Edit User - Sarah Johnson                                   [X]    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Name                                                               │
│  [Sarah Johnson_____________________]                               │
│                                                                     │
│  Email                                                              │
│  [sarah@rossbuilt.com______________]                                │
│                                                                     │
│  Role                                                               │
│  [Project Manager                                             ▼]    │
│                                                                     │
│  Status                                                             │
│  ● Active   ○ Inactive                                              │
│                                                                     │
│  Job Assignments                                                    │
│  ☑ Smith Home (PM)                                                  │
│  ☑ Johnson Addition (PM)                                            │
│  ☐ Williams Project                                                 │
│  ☐ Davis Renovation                                                 │
│                                                                     │
│  ─────────────────────────────────────────────────────────────      │
│                                                                     │
│  [Reset Password]   [Deactivate User]                               │
│                                                                     │
│                                    [Cancel] [Save Changes]          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## User Roles & Permissions

| Permission | Owner | PM | Accountant | Super | Estimator |
|------------|-------|-----|------------|-------|-----------|
| View all jobs | ✓ | - | ✓ | - | - |
| View assigned jobs | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create jobs | ✓ | ✓ | - | - | - |
| Create estimates | ✓ | ✓ | - | - | ✓ |
| Approve invoices | ✓ | ✓ | ✓ | - | - |
| Final approval (over threshold) | ✓ | - | - | - | - |
| Process payments | ✓ | - | ✓ | - | - |
| Create draws | ✓ | ✓ | ✓ | - | - |
| Daily logs | ✓ | ✓ | - | ✓ | - |
| Schedule management | ✓ | ✓ | - | ✓ | - |
| View reports | ✓ | ✓ | ✓ | - | - |
| Manage users | ✓ | - | - | - | - |
| Company settings | ✓ | - | - | - | - |

## User Fields
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| email | text | Unique, used for login |
| name | text | Display name |
| role | string | owner, pm, accountant, super, estimator, admin |
| status | string | active, invited, inactive |
| job_assignments | array | Jobs user can access |
| created_at | timestamp | |
| last_login | timestamp | |

---

## API Endpoints

### Auth
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Password reset request |
| POST | `/api/auth/reset-password` | Complete password reset |

### Company Settings
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/settings/company` | Get settings |
| PATCH | `/api/settings/company` | Update settings |
| POST | `/api/settings/company/logo` | Upload logo |

### Users
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/users` | List users |
| POST | `/api/users/invite` | Invite user |
| PATCH | `/api/users/:id` | Update user |
| POST | `/api/users/:id/reset-password` | Admin reset password |
| DELETE | `/api/users/:id` | Deactivate user |

---

## Component Structure

```
app/
├── login/
│   └── page.tsx
├── (authenticated)/
│   ├── layout.tsx         (main app shell)
│   ├── page.tsx           (dashboard)
│   └── settings/
│       ├── layout.tsx     (settings tabs)
│       ├── company/
│       │   └── page.tsx
│       ├── users/
│       │   └── page.tsx
│       ├── cost-codes/
│       │   └── page.tsx   (links to directory)
│       └── integrations/
│           └── page.tsx

components/global/
├── AppShell.tsx
├── Sidebar.tsx
├── TopNav.tsx
├── UserMenu.tsx
├── NotificationBell.tsx
└── ActivityFeed.tsx

components/settings/
├── SettingsTabs.tsx
├── CompanyForm.tsx
├── LogoUpload.tsx
├── UsersList.tsx
├── UserInviteModal.tsx
├── UserEditModal.tsx
└── RoleSelector.tsx
```

---

## Affected By Changes To
- None (settings are root-level configuration)

## Affects
- All views (company branding, user permissions)
- Users (role assignments, permissions)
- Invoices (approval thresholds)
- Cost Codes (default cost code list)
- Proposals (company info on documents)
- QuickBooks (integration settings)
- Notifications (notification preferences)

---

## Mobile Considerations

- View-only settings on mobile (changes require desktop)
- User profile editing (name, phone, photo)
- Password change from mobile
- Notification preferences toggle
- View team members and roles (admin only)
- Quick invite via SMS/email share link
- Two-factor authentication setup via authenticator app
- Push notification settings management
- Session management: view and sign out of other devices
- Light/dark mode toggle
- Biometric login enable/disable
- Offline: Cache user profile and preferences

---

## Revision History
| Date | Change |
|------|--------|
| Initial | Created from batch planning |
