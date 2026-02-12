# View Plan: Vendor Portal

## Views Covered
- Vendor Portal Login
- Vendor Dashboard
- Vendor Bids (respond to bid invitations)
- Vendor Schedule (see assigned tasks)
- Vendor POs (view POs, submit invoices)
- Vendor Daily Logs (submit work logs)

---

# OVERVIEW

## Purpose
The Vendor Portal is a separate, simplified interface for vendors/subcontractors to:
- Respond to bid invitations with pricing
- View assigned schedule tasks
- Access purchase orders issued to them
- Submit invoices against POs
- Submit daily work logs and photos
- Manage compliance documents (insurance, W9)

## Access
- Separate URL: `/vendor-portal` or subdomain `vendors.yourbuilder.com`
- Authentication via email/password (invitation-based)
- Multiple users per vendor company
- Vendor sees only their jobs, POs, and bid invitations
- Role-based access within vendor company (admin, user)

## Design Principles
- Clean, professional, contractor-friendly
- Mobile-first (vendors often on job sites)
- Action-oriented (bids, logs, invoices)
- Clear status visibility
- Minimal friction for common tasks
- Builder branding (logo/colors)

---

# DATABASE SCHEMA

## Vendor Portal Users
```sql
CREATE TABLE vendor_portal_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user', -- 'admin', 'user'
    is_active BOOLEAN DEFAULT true,
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Vendor Invitations
```sql
CREATE TABLE vendor_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    invited_by UUID REFERENCES users(id) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Bid Packages
```sql
CREATE TABLE bid_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trade VARCHAR(100),
    scope_of_work TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'sent', 'closed', 'awarded'
    awarded_vendor_id UUID REFERENCES vendors(id),
    awarded_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Bid Package Line Items
```sql
CREATE TABLE bid_package_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_package_id UUID REFERENCES bid_packages(id) NOT NULL,
    cost_code_id UUID REFERENCES cost_codes(id),
    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(10,2),
    unit VARCHAR(20),
    notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Bid Package Vendors (invitations)
```sql
CREATE TABLE bid_package_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_package_id UUID REFERENCES bid_packages(id) NOT NULL,
    vendor_id UUID REFERENCES vendors(id) NOT NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    viewed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(bid_package_id, vendor_id)
);
```

## Bid Responses
```sql
CREATE TABLE bid_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_package_id UUID REFERENCES bid_packages(id) NOT NULL,
    vendor_id UUID REFERENCES vendors(id) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'submitted', 'withdrawn', 'accepted', 'rejected'
    total_amount DECIMAL(12,2),
    notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    submitted_by UUID REFERENCES vendor_portal_users(id),
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bid_package_id, vendor_id)
);
```

## Bid Response Line Items
```sql
CREATE TABLE bid_response_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_response_id UUID REFERENCES bid_responses(id) NOT NULL,
    bid_package_line_id UUID REFERENCES bid_package_lines(id) NOT NULL,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Bid Attachments
```sql
CREATE TABLE bid_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_package_id UUID REFERENCES bid_packages(id),
    bid_response_id UUID REFERENCES bid_responses(id),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    uploaded_by_user UUID REFERENCES users(id),
    uploaded_by_vendor_user UUID REFERENCES vendor_portal_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Vendor Work Logs
```sql
CREATE TABLE vendor_work_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) NOT NULL,
    vendor_id UUID REFERENCES vendors(id) NOT NULL,
    task_id UUID REFERENCES tasks(id),
    po_id UUID REFERENCES purchase_orders(id),
    log_date DATE NOT NULL,
    description TEXT NOT NULL,
    hours_worked DECIMAL(5,2),
    workers_count INT,
    work_completed TEXT,
    issues_reported TEXT,
    materials_used TEXT,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'rejected'
    submitted_at TIMESTAMP WITH TIME ZONE,
    submitted_by UUID REFERENCES vendor_portal_users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    reviewer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Vendor Work Log Photos
```sql
CREATE TABLE vendor_work_log_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_log_id UUID REFERENCES vendor_work_logs(id) NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    taken_at TIMESTAMP WITH TIME ZONE,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    ai_analysis TEXT, -- AI-generated description/verification
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Vendor Invoices
```sql
CREATE TABLE vendor_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) NOT NULL,
    po_id UUID REFERENCES purchase_orders(id),
    job_id UUID REFERENCES jobs(id) NOT NULL,
    invoice_number VARCHAR(100) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'submitted', -- 'submitted', 'under_review', 'approved', 'rejected', 'paid'
    file_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_by UUID REFERENCES vendor_portal_users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    paid_amount DECIMAL(12,2),
    ai_match_confidence DECIMAL(3,2), -- AI confidence score for PO matching
    ai_match_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Vendor Compliance Documents
```sql
CREATE TABLE vendor_compliance_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) NOT NULL,
    doc_type VARCHAR(50) NOT NULL, -- 'w9', 'insurance_coi', 'license', 'bond'
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    expiration_date DATE,
    is_current BOOLEAN DEFAULT true,
    uploaded_by UUID REFERENCES vendor_portal_users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

# VENDOR PORTAL LOGIN

## URL
`/vendor-portal/login`

## Layout
```
+---------------------------------------------------------------------+
|                                                                     |
|                                                                     |
|                        +-------------+                              |
|                        |   [LOGO]    |                              |
|                        |  BUILDER CO |                              |
|                        +-------------+                              |
|                                                                     |
|                     VENDOR PORTAL                                   |
|                                                                     |
|                 +-------------------------+                         |
|                 | Email                   |                         |
|                 +-------------------------+                         |
|                                                                     |
|                 +-------------------------+                         |
|                 | Password                |                         |
|                 +-------------------------+                         |
|                                                                     |
|                 [ ] Remember me                                     |
|                                                                     |
|                 [          Sign In          ]                       |
|                                                                     |
|                 Forgot your password?                               |
|                                                                     |
|                                                                     |
|          -------------------------------------------                |
|                                                                     |
|          Need access? Contact your project manager                  |
|          info@builderco.com | 512-555-0123                          |
|                                                                     |
+---------------------------------------------------------------------+
```

## Features
- Simple email/password login
- "Remember me" checkbox (30-day session)
- Forgot password flow (email reset)
- Builder contact info displayed
- Builder branding (logo, colors)
- Invitation acceptance flow for new users

## Security
- Separate auth system from admin users and client portal
- Rate limiting on login attempts (5 per minute)
- Password requirements (min 8 chars, complexity)
- Session timeout after 4 hours of inactivity
- JWT tokens with refresh mechanism
- Account lockout after 5 failed attempts

## Invitation Flow
```
BUILDER SENDS INVITATION
          |
          v
   EMAIL WITH TOKEN LINK
          |
          v
   VENDOR CLICKS LINK
          |
          v
   ACCEPT INVITATION PAGE
   - Create password
   - Confirm email
   - Accept terms
          |
          v
   ACCOUNT ACTIVATED
```

### Accept Invitation Page
```
+---------------------------------------------------------------------+
|                                                                     |
|                        +-------------+                              |
|                        |   [LOGO]    |                              |
|                        +-------------+                              |
|                                                                     |
|                 Welcome to Builder Co Vendor Portal                 |
|                                                                     |
|   You've been invited to join as a vendor contact for:              |
|                                                                     |
|                 ABC ELECTRIC LLC                                    |
|                                                                     |
|                 +-------------------------+                         |
|                 | your@email.com    [x]   |                         |
|                 +-------------------------+                         |
|                                                                     |
|                 First Name: [John________________]                  |
|                 Last Name:  [Smith_______________]                  |
|                 Phone:      [(512) 555-0100______]                  |
|                                                                     |
|                 +-------------------------+                         |
|                 | Create Password         |                         |
|                 +-------------------------+                         |
|                                                                     |
|                 +-------------------------+                         |
|                 | Confirm Password        |                         |
|                 +-------------------------+                         |
|                                                                     |
|                 [ ] I accept the Terms of Service                   |
|                                                                     |
|                 [      Create Account       ]                       |
|                                                                     |
+---------------------------------------------------------------------+
```

---

# VENDOR DASHBOARD

## URL
`/vendor-portal` or `/vendor-portal/dashboard`

## Layout
```
+---------------------------------------------------------------------+
|  BUILDER CO                           ABC Electric  [Notifications] |
|  VENDOR PORTAL                        John Smith [v]                |
+---------------------------------------------------------------------+
| [Dashboard] [Bids] [Schedule] [POs & Invoices] [Daily Logs]         |
+---------------------------------------------------------------------+
|                                                                     |
|  Welcome back, John!                                                |
|  ABC Electric LLC                                                   |
|                                                                     |
|  ===================================================================|
|  ACTION REQUIRED                                                    |
|  ===================================================================|
|                                                                     |
|  +------------------------+  +------------------------+             |
|  | !  PENDING BIDS        |  | !  UPCOMING WORK       |             |
|  |                        |  |                        |             |
|  | 2 bids due soon        |  | 3 tasks this week      |             |
|  |                        |  |                        |
|  | * Smith Res - Elec     |  | * Mon: Smith Res       |             |
|  |   Due: Dec 15          |  |   Rough-in inspection  |             |
|  | * Jones - Rewire       |  | * Wed: Jones Remodel   |             |
|  |   Due: Dec 18          |  |   Panel upgrade        |             |
|  |                        |  |                        |             |
|  | [View All Bids]        |  | [View Schedule]        |             |
|  +------------------------+  +------------------------+             |
|                                                                     |
|  ===================================================================|
|  FINANCIAL SUMMARY                                                  |
|  ===================================================================|
|                                                                     |
|  +------------------------+  +------------------------+             |
|  | OUTSTANDING POs        |  | INVOICE STATUS         |             |
|  |                        |  |                        |             |
|  | Active POs: 4          |  | Pending Review: 2      |             |
|  | Total Value: $45,200   |  | Approved: $12,500      |             |
|  | Invoiced: $28,750      |  | Paid (30d): $35,200    |             |
|  | Remaining: $16,450     |  |                        |             |
|  |                        |  |                        |             |
|  | [View POs]             |  | [Submit Invoice]       |             |
|  +------------------------+  +------------------------+             |
|                                                                     |
|  ===================================================================|
|  COMPLIANCE STATUS                                                  |
|  ===================================================================|
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | Document              | Status           | Expires    | Action|  |
|  |-----------------------|------------------|------------|-------|  |
|  | Certificate of Ins.   | [*] Current      | Mar 15, 25 |       |  |
|  | W-9                   | [*] On File      | N/A        |       |  |
|  | Contractor License    | [!] Expiring     | Jan 5, 25  |[Upload]| |
|  | Bond Certificate      | [x] Missing      | ---        |[Upload]| |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  ===================================================================|
|  ACTIVE JOBS                                                        |
|  ===================================================================|
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | Smith Residence           123 Oak St       [*] In Progress    |  |
|  | Your Tasks: 5 total | 2 complete | 3 upcoming                 |  |
|  | Open POs: $18,500 | Invoiced: $12,000                         |  |
|  +---------------------------------------------------------------+  |
|  | Jones Kitchen Remodel     456 Main St      [*] In Progress    |  |
|  | Your Tasks: 3 total | 1 complete | 2 upcoming                 |  |
|  | Open POs: $8,200 | Invoiced: $0                               |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  ===================================================================|
|  RECENT ACTIVITY                                                    |
|  ===================================================================|
|                                                                     |
|  Dec 10 - Invoice #1234 approved - Smith Residence                  |
|  Dec 9  - New bid invitation - Johnson Project                      |
|  Dec 8  - Task completed: Rough-in - Smith Residence                |
|  Dec 7  - PO #089 issued - Jones Remodel - $8,200                   |
|                                                                     |
+---------------------------------------------------------------------+
```

## Features
- Summary of pending bids with deadlines
- Upcoming scheduled work
- Financial overview (POs, invoices, payments)
- Compliance document status with upload prompts
- Active jobs overview
- Recent activity feed
- Notification badges for urgent items

## Navigation
Horizontal tab bar:
- Dashboard
- Bids
- Schedule
- POs & Invoices
- Daily Logs
- User menu (Profile, Company Settings, Sign Out)

---

# VENDOR BIDS

## URL
`/vendor-portal/bids`

## Purpose
View bid invitations, prepare and submit bid responses.

## Bid List View
```
+---------------------------------------------------------------------+
|  BUILDER CO                           ABC Electric  [Notifications] |
|  VENDOR PORTAL                        John Smith [v]                |
+---------------------------------------------------------------------+
| [Dashboard] [*Bids*] [Schedule] [POs & Invoices] [Daily Logs]       |
+---------------------------------------------------------------------+
|                                                                     |
|  Bid Invitations                                                    |
|                                                                     |
|  Filter: [All Status v] [All Jobs v]                                |
|                                                                     |
|  === PENDING RESPONSE (2) ==========================================|
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | Smith Residence - Electrical Rough-In                         |  |
|  | ------------------------------------------------------------ |  |
|  | Job: Smith Residence | 123 Oak St, Austin TX                  |  |
|  | Trade: Electrical                                             |  |
|  | Due: December 15, 2024 (5 days)            [!] Due Soon       |  |
|  |                                                               |  |
|  | Scope: Complete electrical rough-in for 3,200 sf custom home  |  |
|  | including 200A service, 42 circuits, low voltage...           |  |
|  |                                                               |  |
|  | [View Details]                        [Start Bid Response]    |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | Jones Remodel - Panel Upgrade                                 |  |
|  | ------------------------------------------------------------ |  |
|  | Job: Jones Kitchen Remodel | 456 Main St                      |  |
|  | Trade: Electrical                                             |  |
|  | Due: December 18, 2024 (8 days)                               |  |
|  |                                                               |  |
|  | [View Details]                        [Start Bid Response]    |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  === SUBMITTED (3) =================================================|
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | [*] Johnson New Build - Electrical Complete    $48,500        |  |
|  |     Submitted: Dec 5, 2024       Status: Under Review         |  |
|  |                                           [View Submission]   |  |
|  +---------------------------------------------------------------+  |
|  | [*] Davis Addition - Electrical              $12,200          |  |
|  |     Submitted: Nov 28, 2024      Status: Accepted!            |  |
|  |                                           [View Submission]   |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  === CLOSED (5) ====================================================|
|  (older bids collapsed)                                             |
|                                                                     |
+---------------------------------------------------------------------+
```

## Bid Detail / Response View
```
+---------------------------------------------------------------------+
|  <- Back to Bids                                                    |
+---------------------------------------------------------------------+
|                                                                     |
|  Smith Residence - Electrical Rough-In                              |
|  ===================================================================|
|                                                                     |
|  JOB INFORMATION                                                    |
|  ---------------                                                    |
|  Job: Smith Residence                                               |
|  Address: 123 Oak Street, Austin, TX 78701                          |
|  Project Manager: John Smith | pm@builderco.com | 512-555-0123     |
|                                                                     |
|  BID DETAILS                                                        |
|  -----------                                                        |
|  Trade: Electrical                                                  |
|  Due Date: December 15, 2024 at 5:00 PM                             |
|  Status: Awaiting Your Response                                     |
|                                                                     |
|  ===================================================================|
|  SCOPE OF WORK                                                      |
|  ===================================================================|
|                                                                     |
|  Complete electrical rough-in for 3,200 sf custom home including:   |
|                                                                     |
|  - 200A main service panel                                          |
|  - 42 circuits per plan                                             |
|  - Dedicated circuits for: kitchen (6), HVAC (2), garage (2)        |
|  - Low voltage rough-in for: CAT6, coax, speaker wire               |
|  - Coordinate with HVAC and plumbing for chase locations            |
|  - All work per 2023 NEC and local amendments                       |
|                                                                     |
|  EXCLUSIONS:                                                        |
|  - Fixtures (owner supplied)                                        |
|  - Permit fees (paid by GC)                                         |
|  - Trenching for underground service                                |
|                                                                     |
|  ===================================================================|
|  ATTACHMENTS                                                        |
|  ===================================================================|
|                                                                     |
|  [PDF] Electrical Plans v2.pdf (2.4 MB)           [Download]        |
|  [PDF] Specifications Section 26.pdf (890 KB)     [Download]        |
|  [PDF] Job Site Photos.zip (15 MB)                [Download]        |
|                                                                     |
|  ===================================================================|
|  YOUR BID RESPONSE                                 Status: Draft    |
|  ===================================================================|
|                                                                     |
|  LINE ITEM PRICING                                                  |
|  +---------------------------------------------------------------+  |
|  | Item                    | Qty  | Unit | Unit Price | Total    |  |
|  |-------------------------|------|------|------------|----------|  |
|  | 200A Service Install    |  1   | LS   | [$8,500  ] | $8,500   |  |
|  | Branch Circuit Rough-in | 42   | EA   | [$285    ] | $11,970  |  |
|  | Dedicated Circuits      | 10   | EA   | [$350    ] | $3,500   |  |
|  | Low Voltage Rough-in    |  1   | LS   | [$2,800  ] | $2,800   |  |
|  | Panel & Breakers        |  1   | LS   | [$4,200  ] | $4,200   |  |
|  | General Labor           | 80   | HR   | [$75     ] | $6,000   |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  Subtotal:                                            $36,970       |
|  Contingency (5%):                                    $1,849        |
|  -----------------------------------------------------------------  |
|  TOTAL BID:                                           $38,819       |
|                                                                     |
|  VALIDITY                                                           |
|  Bid valid for: [30] days from submission                           |
|                                                                     |
|  NOTES / CLARIFICATIONS                                             |
|  +---------------------------------------------------------------+  |
|  | Price assumes standard working hours. Overtime billed at      |  |
|  | 1.5x rate. Price includes standard wire colors per plan.      |  |
|  | Special colors available at additional cost.                  |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  ATTACHMENTS                                        [+ Add File]    |
|  [PDF] ABC_Electric_License.pdf                     [x]             |
|  [PDF] ABC_Electric_Insurance_COI.pdf               [x]             |
|                                                                     |
|  ===================================================================|
|                                                                     |
|  [x] I certify this bid is accurate and I am authorized to submit   |
|      on behalf of ABC Electric LLC                                  |
|                                                                     |
|  [Save Draft]                    [Preview]         [Submit Bid]     |
|                                                                     |
+---------------------------------------------------------------------+
```

## AI-Assisted Bid Preparation

### AI Features
```
+---------------------------------------------------------------+
| AI BID ASSISTANT                                    [?] Help   |
+---------------------------------------------------------------+
|                                                                |
| [*] Analyze scope for completeness                             |
|     AI has identified potential gaps in the scope:             |
|     - No mention of permit coordination timeline               |
|     - Low voltage scope may need clarification                 |
|                                                                |
| [*] Suggest pricing based on history                           |
|     Based on your previous bids for similar scope:             |
|     - Rough-in labor: $280-$320/circuit (you entered $285)     |
|     - Service install: $7,500-$9,000 (you entered $8,500)      |
|     Confidence: High - similar to Johnson Project bid          |
|                                                                |
| [*] Check for missing items                                    |
|     Consider including:                                        |
|     - [ ] Generator interlock ($450-$600)                      |
|     - [ ] Whole house surge protection ($300-$400)             |
|                                                                |
| [ ] Generate bid summary letter                                |
|                                                                |
| [Run AI Analysis]                                              |
+---------------------------------------------------------------+
```

### Bid Comparison (Builder Side Reference)
When multiple vendors submit bids, builder sees:
- Side-by-side line item comparison
- Highlight lowest/highest per line
- Total comparison
- AI analysis of bid quality and completeness

## Bid Statuses
| Status | Color | Description |
|--------|-------|-------------|
| Invited | Blue | Invitation received, not started |
| Draft | Gray | Response in progress |
| Submitted | Yellow | Awaiting builder review |
| Under Review | Purple | Builder reviewing |
| Accepted | Green | You won the bid! |
| Rejected | Red | Not selected |
| Withdrawn | Dark Gray | Vendor withdrew bid |
| Expired | Orange | Deadline passed without response |

---

# VENDOR SCHEDULE

## URL
`/vendor-portal/schedule`

## Purpose
View assigned tasks across all jobs, mark work complete.

## Layout
```
+---------------------------------------------------------------------+
|  BUILDER CO                           ABC Electric  [Notifications] |
|  VENDOR PORTAL                        John Smith [v]                |
+---------------------------------------------------------------------+
| [Dashboard] [Bids] [*Schedule*] [POs & Invoices] [Daily Logs]       |
+---------------------------------------------------------------------+
|                                                                     |
|  Your Schedule                                     [Calendar | List]|
|                                                                     |
|  Filter: [All Jobs v] [All Status v]               [This Week v]    |
|                                                                     |
|  === CALENDAR VIEW =================================================|
|                                                                     |
|           Mon 12/9   Tue 12/10  Wed 12/11  Thu 12/12  Fri 12/13    |
|          +----------+----------+----------+----------+----------+   |
|    8 AM  |Smith Res |          |          |          |          |   |
|          |Rough-in  |          |          |          |          |   |
|          |inspection|          |          |          |          |   |
|          +----------+          +----------+----------+          +   |
|   12 PM  |          |          |Jones     |Jones     |          |   |
|          |          |          |Panel     |Panel     |          |   |
|          |          |          |upgrade   |(cont)    |          |   |
|          +----------+----------+----------+----------+----------+   |
|    4 PM  |          |          |          |          |Smith Res |   |
|          |          |          |          |          |Final walk|   |
|          +----------+----------+----------+----------+----------+   |
|                                                                     |
|  === LIST VIEW =====================================================|
|                                                                     |
|  TODAY - Monday, December 9                                         |
|  +---------------------------------------------------------------+  |
|  | [*] Smith Residence - Rough-in Inspection                     |  |
|  |     8:00 AM - 10:00 AM                                        |  |
|  |     Address: 123 Oak St, Austin TX                            |  |
|  |     Contact: John Smith | 512-555-0123                         |  |
|  |                                                               |  |
|  |     Notes: Inspector arriving at 8am. Ensure all boxes        |  |
|  |     accessible and panel cover off.                           |  |
|  |                                                               |  |
|  |     Status: ( ) Not Started  (*) In Progress  ( ) Complete    |  |
|  |                                                               |  |
|  |     [View Details]    [Log Work]    [Mark Complete]           |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  WEDNESDAY - December 11                                            |
|  +---------------------------------------------------------------+  |
|  | [ ] Jones Remodel - Panel Upgrade                             |  |
|  |     12:00 PM - 5:00 PM                                        |  |
|  |     Address: 456 Main St, Austin TX                           |  |
|  |                                                               |  |
|  |     Requirements:                                              |  |
|  |     - Coordinate with utility for disconnect                  |  |
|  |     - New 200A panel (materials on site)                      |  |
|  |     - Transfer existing circuits                              |  |
|  |                                                               |  |
|  |     Status: ( ) Not Started  ( ) In Progress  ( ) Complete    |  |
|  |                                                               |  |
|  |     [View Details]    [Log Work]                              |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  FRIDAY - December 13                                               |
|  +---------------------------------------------------------------+  |
|  | [ ] Smith Residence - Final Walkthrough                       |  |
|  |     4:00 PM - 5:00 PM                                         |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
+---------------------------------------------------------------------+
```

## Task Detail View
```
+---------------------------------------------------------------------+
|  <- Back to Schedule                                                |
+---------------------------------------------------------------------+
|                                                                     |
|  Smith Residence - Rough-in Inspection                              |
|  ===================================================================|
|                                                                     |
|  JOB INFORMATION                                                    |
|  ---------------                                                    |
|  Job: Smith Residence                                               |
|  Address: 123 Oak Street, Austin, TX 78701                          |
|  PM: John Smith | pm@builderco.com | 512-555-0123                  |
|                                                                     |
|  TASK DETAILS                                                       |
|  ------------                                                       |
|  Date: Monday, December 9, 2024                                     |
|  Time: 8:00 AM - 10:00 AM                                           |
|  Duration: 2 hours                                                  |
|                                                                     |
|  Related PO: PO-2024-089 - $18,500                                  |
|  Budget Line: 26 - Electrical                                       |
|                                                                     |
|  DESCRIPTION                                                        |
|  -----------                                                        |
|  City electrical inspector will be on site at 8am to perform        |
|  rough-in inspection. Please ensure:                                |
|  - All junction boxes accessible                                    |
|  - Panel cover removed                                              |
|  - Wire labels visible                                              |
|  - Someone present to answer questions                              |
|                                                                     |
|  REQUIREMENTS                                                       |
|  ------------                                                       |
|  [x] Pre-inspection checklist completed                             |
|  [ ] Photos taken before inspection                                 |
|  [ ] Inspection passed                                              |
|                                                                     |
|  ATTACHMENTS                                                        |
|  -----------                                                        |
|  [PDF] Electrical_Plans_v2.pdf                        [Download]    |
|  [PDF] Pre_Inspection_Checklist.pdf                   [Download]    |
|                                                                     |
|  ===================================================================|
|  TASK STATUS                                                        |
|  ===================================================================|
|                                                                     |
|  ( ) Not Started    (*) In Progress    ( ) Complete                 |
|                                                                     |
|  Progress: [=========>          ] 50%                               |
|                                                                     |
|  NOTES                                                              |
|  +---------------------------------------------------------------+  |
|  | Inspector arrived on time. Found 2 minor issues:              |  |
|  | 1. Box fill calculation needed for kitchen junction           |  |
|  | 2. Missing nail plate on one stud                             |  |
|  | Will correct and call for re-inspection tomorrow.             |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  [Save Progress]                             [Mark Complete]        |
|                                                                     |
|  ===================================================================|
|  WORK LOG ENTRIES                                                   |
|  ===================================================================|
|                                                                     |
|  Dec 9, 8:00 AM - Arrived on site, prepped for inspection           |
|  Dec 9, 10:30 AM - Inspection complete, corrections needed          |
|                                                                     |
|  [+ Add Work Log Entry]                                             |
|                                                                     |
+---------------------------------------------------------------------+
```

## Schedule Sync

### Sync with Main Schedule
- Tasks assigned to vendor appear automatically
- Real-time updates when PM changes schedule
- Vendor completion status syncs back to main schedule
- Notifications for schedule changes

### Calendar Integration
- Export to iCal/Google Calendar
- Subscribe to calendar feed
- Push notifications for upcoming tasks

---

# VENDOR POs & INVOICES

## URL
`/vendor-portal/purchase-orders`

## Purpose
View POs issued to vendor, track amounts, submit invoices.

## PO List View
```
+---------------------------------------------------------------------+
|  BUILDER CO                           ABC Electric  [Notifications] |
|  VENDOR PORTAL                        John Smith [v]                |
+---------------------------------------------------------------------+
| [Dashboard] [Bids] [Schedule] [*POs & Invoices*] [Daily Logs]       |
+---------------------------------------------------------------------+
|                                                                     |
|  Purchase Orders & Invoices                                         |
|                                                                     |
|  [POs] [Invoices] [Payments]                    [+ Submit Invoice]  |
|                                                                     |
|  Filter: [All Jobs v] [All Status v]            [Search...]         |
|                                                                     |
|  === ACTIVE PURCHASE ORDERS ========================================|
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | PO #     | Job              | Amount    | Invoiced  | Remain  |  |
|  |----------|------------------|-----------|-----------|---------|  |
|  | PO-089   | Smith Residence  | $18,500   | $12,000   | $6,500  |  |
|  |          | Electrical rough-in                                |  |
|  |          | Issued: Nov 15   | Status: Partially Invoiced      |  |
|  |          |                          [View] [Submit Invoice]   |  |
|  +---------------------------------------------------------------+  |
|  | PO-102   | Jones Remodel    | $8,200    | $0        | $8,200  |  |
|  |          | Panel upgrade                                      |  |
|  |          | Issued: Dec 7    | Status: Open                    |  |
|  |          |                          [View] [Submit Invoice]   |  |
|  +---------------------------------------------------------------+  |
|  | PO-098   | Smith Residence  | $4,500    | $4,500    | $0      |  |
|  |          | Electrical materials                               |  |
|  |          | Issued: Nov 20   | Status: Fully Invoiced          |  |
|  |          |                                            [View]  |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  === SUMMARY =======================================================|
|                                                                     |
|  Total Active POs:    $31,200                                       |
|  Total Invoiced:      $16,500                                       |
|  Remaining:           $14,700                                       |
|                                                                     |
+---------------------------------------------------------------------+
```

## PO Detail View
```
+---------------------------------------------------------------------+
|  <- Back to POs                                                     |
+---------------------------------------------------------------------+
|                                                                     |
|  Purchase Order #PO-2024-089                                        |
|  ===================================================================|
|                                                                     |
|  Job: Smith Residence                                               |
|  Address: 123 Oak Street, Austin, TX 78701                          |
|  PM: John Smith | pm@builderco.com                                 |
|                                                                     |
|  PO DETAILS                                                         |
|  ----------                                                         |
|  Issue Date: November 15, 2024                                      |
|  Description: Electrical rough-in per contract scope                |
|  Status: Partially Invoiced                                         |
|                                                                     |
|  ===================================================================|
|  LINE ITEMS                                                         |
|  ===================================================================|
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | Description              | Qty | Unit | Price   | Total      |  |
|  |--------------------------|-----|------|---------|------------|  |
|  | Labor - Rough-in         |  1  | LS   | $12,000 | $12,000    |  |
|  | Materials                |  1  | LS   | $4,500  | $4,500     |  |
|  | Panel & Breakers         |  1  | LS   | $2,000  | $2,000     |  |
|  |--------------------------|-----|------|---------|------------|  |
|  | TOTAL                    |     |      |         | $18,500    |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  ===================================================================|
|  INVOICE SUMMARY                                                    |
|  ===================================================================|
|                                                                     |
|  PO Amount:               $18,500                                   |
|  Invoiced to Date:        $12,000                                   |
|  Remaining:               $6,500                                    |
|                                                                     |
|  INVOICES AGAINST THIS PO:                                          |
|  +---------------------------------------------------------------+  |
|  | Invoice #   | Date     | Amount   | Status    |               |  |
|  |-------------|----------|----------|-----------|               |  |
|  | INV-1234    | Nov 25   | $8,000   | Paid      | [View]        |  |
|  | INV-1267    | Dec 5    | $4,000   | Approved  | [View]        |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  [Download PO PDF]                         [Submit Invoice]         |
|                                                                     |
+---------------------------------------------------------------------+
```

## Submit Invoice View
```
+---------------------------------------------------------------------+
|  Submit Invoice                                             [X]     |
+---------------------------------------------------------------------+
|                                                                     |
|  Invoice Against: PO #PO-2024-089 - Smith Residence                 |
|  Remaining on PO: $6,500                                            |
|                                                                     |
|  ===================================================================|
|  INVOICE DETAILS                                                    |
|  ===================================================================|
|                                                                     |
|  Your Invoice #: [INV-1298__________]                               |
|  Invoice Date:   [12/10/2024________]                               |
|  Invoice Amount: [$6,500.00_________]                               |
|                                                                     |
|  Description:                                                       |
|  +---------------------------------------------------------------+  |
|  | Final billing for electrical rough-in labor and remaining     |  |
|  | materials per PO-089.                                         |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  ===================================================================|
|  INVOICE DOCUMENT                                                   |
|  ===================================================================|
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |                                                               |  |
|  |     +---------------------------------------------+           |  |
|  |     |                                             |           |  |
|  |     |     Drop invoice PDF here                   |           |  |
|  |     |     or click to browse                      |           |  |
|  |     |                                             |           |  |
|  |     +---------------------------------------------+           |  |
|  |                                                               |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  Uploaded: ABC_Electric_INV1298.pdf                    [x] Remove   |
|                                                                     |
|  ===================================================================|
|  AI MATCHING                                          [?] How it works|
|  ===================================================================|
|                                                                     |
|  [*] AI has analyzed your invoice:                                  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | Match Confidence: 94% - High                                  |  |
|  |                                                               |  |
|  | [*] Invoice amount ($6,500) matches PO remaining ($6,500)     |  |
|  | [*] Vendor name matches PO vendor                             |  |
|  | [*] Job reference found in invoice                            |  |
|  | [!] Invoice date after work completion date - please verify   |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|                                                                     |
|  [Cancel]                                     [Submit Invoice]      |
|                                                                     |
+---------------------------------------------------------------------+
```

## Invoice List View (Tab)
```
|  [POs] [*Invoices*] [Payments]                  [+ Submit Invoice]  |
|                                                                     |
|  Filter: [All Status v] [All Jobs v]            [Search...]         |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | Invoice # | Job             | Amount   | Submitted | Status   |  |
|  |-----------|-----------------|----------|-----------|----------|  |
|  | INV-1298  | Smith Residence | $6,500   | Dec 10    | Pending  |  |
|  | INV-1267  | Smith Residence | $4,000   | Dec 5     | Approved |  |
|  | INV-1234  | Smith Residence | $8,000   | Nov 25    | Paid     |  |
|  | INV-1198  | Davis Addition  | $12,200  | Nov 15    | Paid     |  |
|  +---------------------------------------------------------------+  |
```

## Payment History View (Tab)
```
|  [POs] [Invoices] [*Payments*]                                      |
|                                                                     |
|  === PAYMENT HISTORY (Last 12 months) ==============================|
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | Date     | Invoice(s)      | Job             | Amount   | Ref |  |
|  |----------|-----------------|-----------------|----------|-----|  |
|  | Dec 8    | INV-1234        | Smith Residence | $8,000   | 4521|  |
|  | Nov 20   | INV-1198        | Davis Addition  | $12,200  | 4498|  |
|  | Nov 5    | INV-1156, 1157  | Multiple        | $15,000  | 4472|  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  SUMMARY                                                            |
|  Total Paid (12 months):  $145,200                                  |
|  Pending Approval:        $6,500                                    |
|  Approved (Awaiting Pay): $4,000                                    |
|                                                                     |
```

## AI-Powered Invoice Matching

### How It Works
1. Vendor uploads invoice PDF
2. AI extracts: vendor name, amount, invoice #, date, description
3. AI matches against open POs:
   - Exact amount match
   - Vendor match
   - Job/project references
   - Line item correlation
4. Confidence score displayed
5. Anomalies flagged for review

### Anomaly Detection
```
+---------------------------------------------------------------+
| [!] ANOMALIES DETECTED                                        |
+---------------------------------------------------------------+
|                                                               |
| The following items need clarification:                       |
|                                                               |
| 1. Invoice amount ($7,200) exceeds PO remaining ($6,500)      |
|    - Please explain or adjust amount                          |
|                                                               |
| 2. Invoice references "materials" but PO is labor-only        |
|    - May need separate PO for materials                       |
|                                                               |
| 3. Invoice date (Dec 10) is before task completion (Dec 12)   |
|    - Verify dates are correct                                 |
|                                                               |
+---------------------------------------------------------------+
```

---

# VENDOR DAILY LOGS

## URL
`/vendor-portal/daily-logs`

## Purpose
Submit daily work logs for jobs, track hours, upload photos.

## Daily Log List View
```
+---------------------------------------------------------------------+
|  BUILDER CO                           ABC Electric  [Notifications] |
|  VENDOR PORTAL                        John Smith [v]                |
+---------------------------------------------------------------------+
| [Dashboard] [Bids] [Schedule] [POs & Invoices] [*Daily Logs*]       |
+---------------------------------------------------------------------+
|                                                                     |
|  Daily Work Logs                                    [+ New Log]     |
|                                                                     |
|  Filter: [All Jobs v] [This Week v]                [Search...]      |
|                                                                     |
|  === THIS WEEK =====================================================|
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | Dec 10, 2024 - Smith Residence                                |  |
|  | ------------------------------------------------------------ |  |
|  | Work: Rough-in inspection prep, corrections                   |  |
|  | Hours: 6 hrs | Workers: 2                                     |  |
|  | Photos: 8                                                     |  |
|  | Status: [*] Submitted                [View] [Edit]            |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | Dec 9, 2024 - Smith Residence                                 |  |
|  | ------------------------------------------------------------ |  |
|  | Work: Attended rough-in inspection                            |  |
|  | Hours: 3 hrs | Workers: 1                                     |  |
|  | Photos: 4                                                     |  |
|  | Status: [*] Approved                 [View]                   |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | Dec 6, 2024 - Smith Residence                                 |  |
|  | ------------------------------------------------------------ |  |
|  | Work: Completed branch circuit rough-in                       |  |
|  | Hours: 16 hrs | Workers: 2                                    |  |
|  | Photos: 12                                                    |  |
|  | Status: [*] Approved                 [View]                   |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  === LAST WEEK =====================================================|
|  (older logs collapsed)                                             |
|                                                                     |
+---------------------------------------------------------------------+
```

## New/Edit Daily Log View
```
+---------------------------------------------------------------------+
|  Daily Work Log                                      [Save] [Submit]|
+---------------------------------------------------------------------+
|                                                                     |
|  Date: [December 10, 2024  v]                                       |
|  Job: [Smith Residence      v]                                      |
|  Related Task: [Rough-in inspection v] (optional)                   |
|  Related PO: PO-089 (auto-linked from task)                         |
|                                                                     |
|  ===================================================================|
|  WORK PERFORMED                                                     |
|  ===================================================================|
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | Completed corrections from yesterday's inspection:            |  |
|  | - Added nail plates to 3 locations per inspector              |  |
|  | - Recalculated box fill for kitchen junction                  |  |
|  | - Reorganized wires in panel for clarity                      |  |
|  | Ready for re-inspection tomorrow.                             |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  ===================================================================|
|  LABOR                                                              |
|  ===================================================================|
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | Worker          | Hours | Rate     | Notes                    |  |
|  |-----------------|-------|----------|--------------------------|  |
|  | John Smith      | 4     | Standard | Lead electrician         |  |
|  | Mike Johnson    | 2     | Standard | Apprentice               |  |
|  | [+ Add Worker]  |       |          |                          |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  Total Hours: 6 hrs                                                 |
|                                                                     |
|  ===================================================================|
|  MATERIALS USED                                                     |
|  ===================================================================|
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | Item                      | Qty    | Notes                    |  |
|  |---------------------------|--------|--------------------------|  |
|  | Nail plates, steel        | 6      | From truck stock         |  |
|  | Wire nuts, assorted       | 12     |                          |  |
|  | [+ Add Material]          |        |                          |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  ===================================================================|
|  ISSUES / DELAYS                                                    |
|  ===================================================================|
|                                                                     |
|  [x] Report an issue                                                |
|                                                                     |
|  Issue Type: [Inspection Correction v]                              |
|  Description:                                                       |
|  +---------------------------------------------------------------+  |
|  | Inspector noted 3 locations needed nail plates where wires    |  |
|  | pass through studs within 1.25" of face. Corrections made.    |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  Impact: ( ) None  (*) Minor  ( ) Significant  ( ) Schedule Delay   |
|                                                                     |
|  ===================================================================|
|  PHOTOS                                              [+ Add Photos] |
|  ===================================================================|
|                                                                     |
|  +--------+ +--------+ +--------+ +--------+ +--------+ +--------+  |
|  |        | |        | |        | |        | |        | |        |  |
|  | Photo1 | | Photo2 | | Photo3 | | Photo4 | | Photo5 | | Photo6 |  |
|  |        | |        | |        | |        | |        | |        |  |
|  +--------+ +--------+ +--------+ +--------+ +--------+ +--------+  |
|  Panel     Box fill   Nail plate Nail plate Kitchen   Overview     |
|  cleanup   calc       install #1 install #2 junction              |
|                                                                     |
|  ===================================================================|
|  AI PHOTO ANALYSIS                                   [?] How it works|
|  ===================================================================|
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | AI has analyzed your photos:                                  |  |
|  |                                                               |  |
|  | [*] Photo 1: Panel with organized wiring visible              |  |
|  | [*] Photo 2: Box fill calculation sheet                       |  |
|  | [*] Photo 3-4: Nail plates properly installed                 |  |
|  | [*] Photo 5: Kitchen junction box with proper fill            |  |
|  | [*] Photo 6: Overall view of work area                        |  |
|  |                                                               |  |
|  | Work verification confidence: 92% - Corrections documented    |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  ===================================================================|
|                                                                     |
|  [ ] I certify this log accurately represents work performed        |
|                                                                     |
|  [Save Draft]                               [Submit Log]            |
|                                                                     |
+---------------------------------------------------------------------+
```

## AI Features for Daily Logs

### Photo Analysis
```
+---------------------------------------------------------------+
| AI PHOTO ANALYSIS                                              |
+---------------------------------------------------------------+
|                                                                |
| Analyzing 8 photos...                                          |
|                                                                |
| DETECTED:                                                      |
| - Electrical work visible in 6 photos                          |
| - Panel/breaker work in 2 photos                               |
| - Safety equipment visible (hard hat) in 3 photos              |
| - Before/after documentation pattern detected                  |
|                                                                |
| VERIFICATION:                                                  |
| [*] Photos appear to match described work                      |
| [*] Location metadata consistent with job site                 |
| [*] Timestamps align with reported work hours                  |
|                                                                |
| SUGGESTIONS:                                                   |
| - Consider adding close-up of inspection correction #2         |
| - Photo 4 is slightly blurry - may want to retake             |
|                                                                |
+---------------------------------------------------------------+
```

### Anomaly Detection
```
+---------------------------------------------------------------+
| [!] SUBMISSION REVIEW                                          |
+---------------------------------------------------------------+
|                                                                |
| Please review before submitting:                               |
|                                                                |
| 1. Hours reported (16) is above daily average (8)              |
|    - [*] Overtime was worked (verified)                        |
|                                                                |
| 2. No photos uploaded for work performed                       |
|    - [ ] Add photos  [*] No photos needed for this work        |
|                                                                |
| 3. Materials used not linked to PO                             |
|    - These appear to be truck stock materials                  |
|                                                                |
+---------------------------------------------------------------+
```

## Daily Log Statuses
| Status | Color | Description |
|--------|-------|-------------|
| Draft | Gray | Not yet submitted |
| Submitted | Yellow | Awaiting review |
| Approved | Green | Accepted by PM |
| Rejected | Red | Needs revision |

---

## API ENDPOINTS

### Portal Authentication
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/vendor-portal/login` | Vendor login |
| POST | `/api/vendor-portal/logout` | Sign out |
| POST | `/api/vendor-portal/forgot-password` | Request reset |
| POST | `/api/vendor-portal/reset-password` | Reset password |
| POST | `/api/vendor-portal/accept-invitation` | Accept invite |
| GET | `/api/vendor-portal/me` | Get current user |
| PATCH | `/api/vendor-portal/me` | Update profile |

### Vendor User Management (Admin)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/vendors/:id/portal-users` | List vendor users |
| POST | `/api/vendors/:id/portal-users/invite` | Send invitation |
| DELETE | `/api/vendor-portal-users/:id` | Deactivate user |
| PATCH | `/api/vendor-portal-users/:id` | Update user |

### Dashboard
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/vendor-portal/dashboard` | Dashboard summary |
| GET | `/api/vendor-portal/notifications` | Notifications |
| PATCH | `/api/vendor-portal/notifications/:id/read` | Mark read |

### Bids
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/vendor-portal/bids` | List bid invitations |
| GET | `/api/vendor-portal/bids/:id` | Bid package detail |
| GET | `/api/vendor-portal/bids/:id/response` | Get bid response |
| POST | `/api/vendor-portal/bids/:id/response` | Create response |
| PATCH | `/api/vendor-portal/bids/:id/response` | Update response |
| POST | `/api/vendor-portal/bids/:id/response/submit` | Submit bid |
| POST | `/api/vendor-portal/bids/:id/response/withdraw` | Withdraw bid |
| POST | `/api/vendor-portal/bids/:id/attachments` | Upload attachment |

### Schedule
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/vendor-portal/schedule` | Get assigned tasks |
| GET | `/api/vendor-portal/schedule/:taskId` | Task detail |
| PATCH | `/api/vendor-portal/schedule/:taskId/status` | Update status |
| GET | `/api/vendor-portal/schedule/calendar` | Calendar feed |

### Purchase Orders & Invoices
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/vendor-portal/purchase-orders` | List POs |
| GET | `/api/vendor-portal/purchase-orders/:id` | PO detail |
| GET | `/api/vendor-portal/purchase-orders/:id/pdf` | Download PDF |
| GET | `/api/vendor-portal/invoices` | List invoices |
| POST | `/api/vendor-portal/invoices` | Submit invoice |
| GET | `/api/vendor-portal/invoices/:id` | Invoice detail |
| GET | `/api/vendor-portal/payments` | Payment history |

### Daily Logs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/vendor-portal/daily-logs` | List logs |
| POST | `/api/vendor-portal/daily-logs` | Create log |
| GET | `/api/vendor-portal/daily-logs/:id` | Log detail |
| PATCH | `/api/vendor-portal/daily-logs/:id` | Update log |
| POST | `/api/vendor-portal/daily-logs/:id/submit` | Submit log |
| POST | `/api/vendor-portal/daily-logs/:id/photos` | Upload photos |
| DELETE | `/api/vendor-portal/daily-logs/:id/photos/:photoId` | Remove photo |

### Compliance Documents
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/vendor-portal/compliance` | List documents |
| POST | `/api/vendor-portal/compliance` | Upload document |
| DELETE | `/api/vendor-portal/compliance/:id` | Remove document |

### AI Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/vendor-portal/ai/analyze-bid` | Analyze bid scope |
| POST | `/api/vendor-portal/ai/suggest-pricing` | Price suggestions |
| POST | `/api/vendor-portal/ai/match-invoice` | Match invoice to PO |
| POST | `/api/vendor-portal/ai/analyze-photos` | Analyze work photos |
| POST | `/api/vendor-portal/ai/verify-log` | Verify daily log |

---

## COMPONENT STRUCTURE

```
app/vendor-portal/
├── layout.tsx                    (portal shell)
├── login/
│   └── page.tsx
├── accept-invitation/
│   └── page.tsx
├── forgot-password/
│   └── page.tsx
├── reset-password/
│   └── page.tsx
├── page.tsx                      (dashboard)
├── bids/
│   ├── page.tsx                  (bid list)
│   └── [id]/
│       └── page.tsx              (bid detail/response)
├── schedule/
│   ├── page.tsx                  (schedule view)
│   └── [taskId]/
│       └── page.tsx              (task detail)
├── purchase-orders/
│   ├── page.tsx                  (PO list + invoices tabs)
│   ├── [id]/
│   │   └── page.tsx              (PO detail)
│   └── submit-invoice/
│       └── page.tsx              (invoice submission)
├── daily-logs/
│   ├── page.tsx                  (log list)
│   ├── new/
│   │   └── page.tsx              (create log)
│   └── [id]/
│       └── page.tsx              (log detail/edit)
├── compliance/
│   └── page.tsx                  (document management)
└── profile/
    └── page.tsx                  (user profile)

components/vendor-portal/
├── VendorPortalLayout.tsx
├── VendorPortalNav.tsx
├── VendorPortalHeader.tsx
├── VendorPortalFooter.tsx
├── VendorDashboard/
│   ├── ActionRequired.tsx
│   ├── FinancialSummary.tsx
│   ├── ComplianceStatus.tsx
│   ├── ActiveJobs.tsx
│   └── RecentActivity.tsx
├── Bids/
│   ├── BidList.tsx
│   ├── BidCard.tsx
│   ├── BidDetail.tsx
│   ├── BidResponseForm.tsx
│   ├── BidLineItems.tsx
│   ├── BidAttachments.tsx
│   ├── BidStatusBadge.tsx
│   └── BidAIAssistant.tsx
├── Schedule/
│   ├── ScheduleCalendar.tsx
│   ├── ScheduleList.tsx
│   ├── TaskCard.tsx
│   ├── TaskDetail.tsx
│   └── TaskStatusUpdate.tsx
├── PurchaseOrders/
│   ├── POList.tsx
│   ├── POCard.tsx
│   ├── PODetail.tsx
│   ├── POLineItems.tsx
│   └── PODownload.tsx
├── Invoices/
│   ├── InvoiceList.tsx
│   ├── InvoiceSubmitForm.tsx
│   ├── InvoiceUpload.tsx
│   ├── InvoiceAIMatcher.tsx
│   ├── InvoiceStatusBadge.tsx
│   └── PaymentHistory.tsx
├── DailyLogs/
│   ├── DailyLogList.tsx
│   ├── DailyLogCard.tsx
│   ├── DailyLogForm.tsx
│   ├── DailyLogLabor.tsx
│   ├── DailyLogMaterials.tsx
│   ├── DailyLogIssues.tsx
│   ├── DailyLogPhotos.tsx
│   ├── PhotoUpload.tsx
│   ├── PhotoAIAnalysis.tsx
│   └── DailyLogStatusBadge.tsx
├── Compliance/
│   ├── ComplianceList.tsx
│   ├── ComplianceUpload.tsx
│   └── ComplianceStatusBadge.tsx
└── shared/
    ├── NotificationBell.tsx
    ├── UserMenu.tsx
    ├── JobSelector.tsx
    ├── DatePicker.tsx
    ├── FileUpload.tsx
    └── AIConfidenceBadge.tsx
```

---

## ACCESS CONTROL

### Builder Side (Admin)
- Enable/disable vendor portal per vendor
- Invite vendor users
- Manage vendor user roles
- View vendor activity
- Review and approve:
  - Bid responses
  - Submitted invoices
  - Daily work logs
- Send bid invitations
- Issue POs to vendors
- Assign tasks to vendors

### Vendor Side
- **Admin role** (within vendor company):
  - Invite other users
  - Manage company profile
  - View all company activity
  - Submit bids and invoices
- **User role**:
  - View assigned tasks
  - Submit daily logs
  - View POs (read-only)
  - Submit invoices (if permitted)

### Data Access
- Vendors see only:
  - Jobs they're assigned to or invited to bid
  - POs issued to them
  - Their own invoices and payments
  - Tasks assigned to them
  - Bid invitations sent to them
- Cannot see:
  - Other vendor information
  - Job budgets or margins
  - Client information
  - Internal notes
  - Other vendors' bids

---

## AFFECTED BY CHANGES TO

- Jobs (portal shows job data)
- Vendors (portal user linked to vendor)
- Purchase Orders (vendor sees their POs)
- Tasks/Schedule (vendor sees assigned work)
- Invoices (vendor submissions)
- Bid Packages (builder creates, vendor responds)
- Users (builder invites vendors)
- Company Settings (branding, portal settings)

## AFFECTS

- Bids (vendor responses update bid status)
- Invoices (vendor submissions create invoices)
- Daily Logs (vendor logs sync with main logs)
- Schedule (task status updates sync)
- Activity Logs (vendor actions recorded)
- Notifications (builder notified of submissions)
- Compliance (document uploads update vendor record)

---

## MOBILE CONSIDERATIONS

### General
- Mobile-first responsive design
- Touch-friendly controls
- Offline capability for daily logs
- Push notifications for:
  - New bid invitations
  - Bid deadline reminders
  - PO issued
  - Invoice status changes
  - Schedule changes

### Login
- Biometric login (Face ID/Touch ID)
- "Remember me" for quick access
- PIN option for added security

### Dashboard
- Swipe cards for quick actions
- Pull-to-refresh
- Badge counts for pending items

### Bids
- Expandable scope sections
- Download attachments for offline review
- Quick-entry pricing with calculator
- Voice-to-text for notes

### Schedule
- Calendar widget with today highlighted
- Map integration for job site navigation
- One-tap "On my way" notification to PM
- Quick task status toggle

### POs & Invoices
- Camera capture for invoice documents
- Auto-crop and enhance
- Quick amount entry
- Signature capture for receipts

### Daily Logs
- Camera integration for photos
  - Auto GPS tagging
  - Timestamp overlay
  - Before/after mode
- Voice-to-text for descriptions
- Quick worker/hour entry
- Offline mode with sync
- Photo batch upload in background

### Compliance
- Camera capture for documents
- Auto-detect document type
- Expiration reminders

---

## GAP ITEMS ADDRESSED

### From Section 19: Vendor & Subcontractor Management (Items 593-612)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 593-612 | Vendor management workflows | Portal provides vendor self-service for bids, invoices, compliance docs, and daily logs |

### From Section 45: Per-Page Feature Requirements — Vendor Profile (Items 708-723)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 708 | Contact information, addresses, key personnel | Vendor Portal profile page with contact details; multiple users per vendor company |
| 709 | Insurance status with expiration countdown | Compliance Status section shows expiration dates with visual indicators and upload prompts |
| 710 | License status with verification link | Compliance Documents table tracks license with expiration; Requires: auto-verification API integration |
| 711 | Performance scorecard — visual dashboard of ratings | Requires: vendor-visible performance summary (on-time %, quality rating) on dashboard |
| 712 | Job history — all projects worked on with performance per job | Active Jobs section shows current projects; Requires: historical jobs tab with performance data |
| 713 | Financial summary — total spend, average invoice size, payment history | Financial Summary section on dashboard with PO values, invoiced amounts, payment history tab |
| 714 | Active contracts and POs | POs & Invoices section with active PO listing and remaining amounts |
| 715 | Open punch items across all jobs | Requires: punch item section in vendor portal showing items assigned to this vendor |
| 716 | Schedule reliability metrics (on-time start %, completion %) | Requires: vendor-visible reliability score derived from schedule task completion data |
| 717 | Bid history — all bids submitted, won/lost, pricing trends | Bids section with Submitted and Closed tabs; Requires: win/loss statistics and pricing trend chart |
| 718 | Communication log — recent messages, calls, emails | Recent Activity feed on dashboard; Requires: dedicated communication log with full message history |
| 719 | Document repository — COI, W-9, contracts, lien waivers | Compliance Documents section with doc_type categories (w9, insurance_coi, license, bond) |
| 720 | Notes and tags — internal notes about the vendor | Requires: builder-side-only notes not visible in vendor portal; vendor sees their own notes |
| 721 | Related vendors — subsidiary relationships | Requires: vendor company relationship field (parent/subsidiary) |
| 722 | Capacity indicator — how many active jobs with you | Active Jobs section shows job count; Requires: capacity limit configuration and warning |
| 723 | Quick actions (Create PO, Invite to Bid, Send Message, Schedule Meeting) | Dashboard quick actions: View All Bids, View Schedule, Submit Invoice, View POs |

### From Section 20: Purchasing & Procurement
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 613-626 | PO workflows | PO Detail View with line items, invoice summary, and PDF download covers vendor-side PO access |

### From Section 16: Invoice & Payment Processing (Items 341-358)
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 345 | Builders who match every invoice to a PO vs. those who don't | Invoice submission links to PO; Requires: configurable "PO required" vs. "PO optional" per builder |
| 347 | Retainage calculation varies by contract, vendor, project | Requires: retainage display on PO detail showing withheld amounts |
| 348 | Conditional payment rules (no payment without current insurance + signed lien waiver) | Compliance Status blocks indicate missing docs; Requires: payment hold enforcement when compliance is incomplete |
| 351-358 | Lien waiver management by state | Requires: lien waiver submission/signing workflow in vendor portal per invoice payment |

### From Section 14: Daily Logs & Field Operations
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 495-511 | Daily log workflows | Vendor Daily Logs section with work performed, labor, materials, issues, and photos with AI analysis |

### From AI & Intelligence (Section 32)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 498 | AI-powered data entry (upload bid -> AI extracts line items -> verify) | AI Bid Assistant analyzes scope, suggests pricing from history, checks for missing items |
| 502 | AI anomaly detection | Invoice AI Matching with confidence scores and anomaly detection for amount/date/PO mismatches |
| 504 | AI document classification | Compliance doc upload with auto-detect document type; AI photo analysis for daily logs |

### From Edge Cases (Sections 44, 46, 47, 48)
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 601 | Sub fired mid-scope — termination, scope reassignment | Vendor portal access must be revocable; open POs and tasks must transfer to replacement vendor |
| 607 | Material supplier goes bankrupt — deposit recovery | Vendor portal should show deposit/payment history for dispute documentation |
| 610 | Client self-performs work | Vendor portal N/A for self-performed work, but vendor scope reduction must be reflected in POs |
| 616 | Multiple builders on same subdivision | Vendor may work for multiple builders; portal must show jobs grouped by builder |
| 618 | Joint venture between two builders | Vendor may receive POs from either builder in a JV; requires multi-builder context |
| 803 | Non-compete and non-solicitation tracking | Requires: vendor agreement acceptance tracking through portal terms of service |
| 806 | Client overpays — refund processing | Vendor payment history must show credit memos and refund transactions |
| 826 | Multi-day power outage — offline capability | Vendor portal daily logs support offline mode with sync; Requires: extended offline for bid preparation |
| 829 | Field connectivity dead zones | Mobile-first design with offline daily log and photo queue addresses poor connectivity |
| 830 | Device diversity (old iPads, cheap Android phones) | Design Principles: mobile-first, contractor-friendly; Requires: graceful degradation testing across device types |
| 839 | Deep linking — email link to specific PO/bid/task | All views have URL-addressable routes for deep linking from notification emails |

---

## REVISION HISTORY

| Date | Change |
|------|--------|
| 2026-02-11 | Added Gap Items Addressed section from gap analysis sections 14, 16, 19-20, 32, 44-48 |
| Initial | Created vendor portal view plan |
