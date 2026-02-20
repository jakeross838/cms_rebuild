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
│                        │   BUILDER CO    │                          │
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
│  ☰  BUILDER CO                                    🔔  👤 John ▼    │
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
│  [Builder Co Construction________________________________]           │
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
│  [512-555-0100______]          [info@builderco.com_____]           │
│                                                                     │
│  Website                                                            │
│  [https://builderco.com__________________________]                  │
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
│  │ John Smith        │ john@builderco.com  │ Owner     │ Active  │ │
│  │                   │                     │           │ [Edit]  │ │
│  ├───────────────────┼─────────────────────┼───────────┼─────────┤ │
│  │ Sarah Johnson     │ sarah@builderco.com │ PM        │ Active  │ │
│  │                   │                     │           │ [Edit]  │ │
│  ├───────────────────┼─────────────────────┼───────────┼─────────┤ │
│  │ Mike Chen         │ mike@builderco.com  │ Accountant│ Active  │ │
│  │                   │                     │           │ [Edit]  │ │
│  ├───────────────────┼─────────────────────┼───────────┼─────────┤ │
│  │ Lisa Park         │ lisa@builderco.com  │ PM        │ Invited │ │
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
│  [sarah@builderco.com______________]                                │
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

## Gap Items Addressed

### Section 45 — Per-Page Feature Requirements (Settings / Admin Page)
- **#781** Company profile — name, logo, address, licenses, insurance
- **#782** User management — create, edit, deactivate users and roles
- **#783** Role/permission configuration — custom roles with granular permissions
- **#784** Cost code management — create, edit, organize cost code structure
- **#785** Workflow configuration — approval chains, thresholds, routing rules
- **#786** Notification preferences — what triggers notifications, for which roles, via which channels
- **#787** Integration management — connect/disconnect integrations, monitor sync status
- **#788** Template management — document templates, estimate templates, checklist templates, email templates
- **#789** Custom field management — create/edit custom fields on any entity
- **#790** Billing / subscription management — plan, payment method, usage, invoices
- **#791** Data import/export tools
- **#792** API key management for integrations
- **#793** Audit log viewer — searchable history of all system actions
- **#794** Branding configuration — colors, logo, portal customization
- **#795** Regional settings — timezone, date format, currency, tax configuration
- **#796** Module enable/disable — turn on/off optional modules (home care, HR, equipment)

### Section 1 — SaaS Architecture & Multi-Tenancy
- **#16** Configurable workflow engine (who approves what, at what thresholds, in what order)
- **#17** Custom cost code hierarchies per builder (CSI, custom, hybrid)
- **#18** Builder-defined phase structures
- **#19** Customizable terminology per tenant ("trade partner" vs "subcontractor" vs "vendor")
- **#20** Custom field support on all entities

### Section 9 — User & Access Management
- **#9** Tenant-specific customizations (custom fields, workflows, reports)

### Section 4 — White-Labeling & Branding
- **#794** Branding configuration (colors, logo, portal customization per builder)

### Section 30 — Notifications & Alerts
- **#481** Every notification type configurable per role per builder
- **#482** Notification channels per user (in-app, email, SMS, push)
- **#483** Notification templates customizable per builder
- **#484** Notification quiet hours configurable

### Section 34 — Search, Navigation & UX
- **#524** Customizable navigation (builder rearranges modules in preferred order)
- **#535** Accessibility (WCAG 2.1 AA compliance)
- **#536** Localization architecture (English for V1, Spanish/French future)

### Section 36 — Regulatory, Tax & Insurance
- **#547** Sales tax by state (system must handle all 50 states)
- **#548** Multi-state builders (different tax rules per project location)
- **#549** Tax rate lookups by address (down to zip code level)
- **#550** Tax exemption management (certificates on file)
- **#551** 1099 reporting configuration
- **#553** Insurance requirements by state (minimum coverage, required endorsements)
- **#555** Builder's Risk insurance tracking per project

### Section 41 — Multi-Entity & Company Scaling
- **#574** Builder with multiple LLCs (different entities, related data)
- **#577** Builders operating under different brand names
- **#580** System grows with builder from small to large without platform change

---

## Additional Requirements from Gap Analysis

### Workflow Configuration (#785, #16)
The current spec has basic approval thresholds. Full requirements:
1. **Workflow builder UI**: Visual workflow editor for configuring multi-step approval chains
2. **Configurable triggers**: Set what triggers each workflow (invoice amount, PO value, change order, etc.)
3. **Multi-level routing**: Support 1-step, 2-step, 3-step approval chains with conditional routing based on amount thresholds
4. **Role-based routing**: Route to specific roles (PM > Director > Owner) or specific users
5. **Escalation rules**: Auto-escalate if not approved within configurable time period
6. **Workflow templates**: Pre-built common workflows (invoice approval, CO approval, draw approval)

### Custom Roles & Permissions (#783)
Current spec has fixed roles. Gap requires:
1. **Custom role creation**: Builder creates their own roles beyond the 6 defaults
2. **Granular permissions**: Permission grid with fine-grained control (view/create/edit/delete/approve per module)
3. **Job-level permissions**: Different permissions per job assignment (PM on one job, read-only on another)
4. **Permission inheritance**: Roles can inherit from other roles and add/remove specific permissions
5. **Data-level access**: Control which financial data each role can see (hide profit margins from field staff, etc.)

### Notification Preferences (#786, #481-484)
1. **Notification matrix**: Grid showing notification types vs roles with checkboxes for enabled/disabled
2. **Channel selection per type**: For each notification type, select channels (in-app, email, SMS, push)
3. **Template customization** (#483): Edit notification message templates with variable placeholders
4. **Quiet hours setting** (#484): Configurable per-user quiet hours (no notifications during specified times)
5. **Digest preferences**: Daily/weekly digest option vs real-time per event

### Template Management (#788)
1. **Document templates**: Upload and manage contract templates, proposal templates, letter templates
2. **Estimate templates**: Pre-built estimate structures by project type
3. **Checklist templates**: Configurable checklists for punch lists, inspections, closeout
4. **Email templates**: Customizable templates for automated emails (draw submission, proposal sent, etc.)
5. **Template versioning**: Track changes to templates over time

### Custom Field Management (#789, #20)
1. **Custom field editor**: Create custom fields on any entity (jobs, vendors, clients, invoices)
2. **Field types**: Text, number, date, dropdown, checkbox, file upload, multi-select
3. **Required/optional**: Set whether custom fields are required or optional
4. **Display configuration**: Choose where custom fields appear on forms and detail views
5. **Reporting inclusion**: Custom fields available as columns in reports and exports

### Subscription & Billing (#790)
1. **Plan management**: View current subscription plan, features included, usage limits
2. **Upgrade/downgrade**: Self-service plan changes
3. **Payment method**: Manage credit card or bank account on file
4. **Usage dashboard**: Show current usage vs limits (users, projects, storage, API calls)
5. **Invoice history**: View and download past subscription invoices

### Data Import/Export (#791)
1. **Import wizard**: Step-by-step import for vendors, clients, cost codes, projects from CSV/Excel
2. **Data mapping**: Map import columns to system fields with preview
3. **Full data export**: Export all tenant data in standard formats (CSV, JSON)
4. **Scheduled exports**: Auto-export on a schedule for backup or integration purposes

### API Key Management (#792)
1. **Key generation**: Generate API keys with configurable scope/permissions
2. **Key listing**: View all active API keys with last-used timestamps
3. **Key revocation**: Revoke keys immediately
4. **Rate limit configuration**: Set rate limits per key

### Audit Log (#793)
1. **Searchable log viewer**: Search by user, action type, entity, date range
2. **Action tracking**: Every create, update, delete, approve, reject action logged
3. **Before/after values**: Show what changed (old value > new value)
4. **Export capability**: Export audit log as CSV for compliance

### Branding Configuration (#794)
1. **Logo upload**: Logo for app header, portal, reports, and emails
2. **Color scheme**: Primary and accent colors applied to portal and reports
3. **Portal customization**: Custom welcome message, contact info display, footer text
4. **Email branding**: Logo and colors in automated email notifications

### Regional Settings (#795)
1. **Timezone**: Company-level timezone setting (affects scheduling, notifications)
2. **Date format**: MM/DD/YYYY vs DD/MM/YYYY
3. **Currency**: Default currency (USD for V1, architecture supports others)
4. **Tax configuration** (#547-550): Default tax rate, tax-by-address lookup, exemption certificate storage

### Module Management (#796)
1. **Module toggle**: Enable/disable optional modules (Home Care, HR, Equipment, Safety)
2. **Module descriptions**: Explain what each module adds when considering enabling
3. **Dependency alerts**: Warn if disabling a module affects active data or features
4. **Plan-based availability**: Some modules only available on higher subscription tiers

### Terminology Customization (#19)
1. **Term mapping**: Configurable labels for key concepts (Vendor/Subcontractor/Trade Partner, Job/Project, etc.)
2. **UI-wide application**: Custom terms apply across all screens, reports, and notifications
3. **Default reset**: Option to reset to platform defaults

### Navigation Customization (#524)
1. **Module ordering**: Builder reorders navigation menu items based on their workflow
2. **Pin/unpin modules**: Show or hide modules from main navigation
3. **Quick links**: Configurable quick-access links on dashboard

---

## Revision History
| Date | Change |
|------|--------|
| 2026-02-11 | Added Gap Items Addressed and Additional Requirements from gap analysis sections 1, 4, 9, 30, 34, 36, 41, and 45 |
| Initial | Created from batch planning |
