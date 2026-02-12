# View Plan: Vendors, Clients, Cost Codes

## Views Covered
- Vendors (List, Detail, Create/Edit)
- Clients (List, Detail, Create/Edit)
- Cost Codes (List, Editor)

---

# VENDORS

## Vendor List View

### URL
`/vendors` (from main menu)

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ Vendors                          [Search...] [Filter] [+ Add Vendor]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Filter: [All Trades ▼] [Active ▼]                                  │
│                                                                     │
│ ┌───────────────────┬──────────────┬──────────────┬───────────────┐ │
│ │ Vendor            │ Trade        │ Contact      │ Status        │ │
│ ├───────────────────┼──────────────┼──────────────┼───────────────┤ │
│ │ ABC Electric      │ Electrician  │ 512-555-0123 │ ● Active      │ │
│ │ XYZ Plumbing      │ Plumber      │ 512-555-0456 │ ● Active      │ │
│ │ Smith Concrete    │ Concrete     │ 512-555-0789 │ ○ Inactive    │ │
│ └───────────────────┴──────────────┴──────────────┴───────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Columns
| Column | Notes |
|--------|-------|
| Name | Vendor company name |
| Trade | Primary trade/service |
| Contact | Primary phone |
| Email | Primary email |
| Address | City, State |
| Status | Active/Inactive |
| Actions | View, Edit, Deactivate |

## Vendor Detail View

### URL
`/vendors/:id`

### Sections
1. **Header**: Name, trade, status
2. **Contact Info**: Phone, email, address
3. **Business Info**: Tax ID, license, insurance expiry
4. **Job History**: Jobs worked on
5. **Financial Summary**: Total invoiced, paid, outstanding
6. **Recent Invoices**: Last 5 invoices
7. **Notes**: Internal notes

## Vendor Fields
| Field | Type | Notes |
|-------|------|-------|
| name | text | Company name |
| trade | text | Electrician, Plumber, etc. |
| contact_name | text | Primary contact |
| phone | text | |
| email | text | |
| address, city, state, zip | text | |
| tax_id | text | EIN/SSN |
| license_number | text | |
| insurance_expiry | date | |
| is_active | boolean | |
| notes | text | |
| w9_file_url | text | Uploaded W9 |

---

# CLIENTS

## Client List View

### URL
`/clients` (from main menu)

### Layout
Similar to vendors, with columns:
- Name
- Email
- Phone
- Jobs (count)
- Portal Access (yes/no)
- Actions

## Client Detail View

### URL
`/clients/:id`

### Sections
1. **Header**: Name, contact info
2. **Jobs**: All jobs for this client
3. **Portal Access**: Enable/disable, reset password
4. **Invoiced/Paid**: Financial summary
5. **Notes**: Internal notes

## Client Fields
| Field | Type | Notes |
|-------|------|-------|
| name | text | Client name |
| email | text | |
| phone | text | |
| address, city, state, zip | text | |
| portal_enabled | boolean | |
| portal_user_id | uuid | Link to portal auth |
| notes | text | |

---

# COST CODES

## Cost Code List View

### URL
`/settings/cost-codes` (from Settings)

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ Cost Codes                                           [+ Add Code]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ [Import Standard CSI] [Export]                                      │
│                                                                     │
│ ┌─────────┬───────────────────────┬───────────────┬───────────────┐ │
│ │ Code    │ Description           │ Category      │ Active        │ │
│ ├─────────┼───────────────────────┼───────────────┼───────────────┤ │
│ │ 01-0000 │ General Conditions    │ General       │ ☑            │ │
│ │ 01-0100 │ Project Management    │ Labor         │ ☑            │ │
│ │ 01-0200 │ Permits & Fees        │ Material      │ ☑            │ │
│ │ 03-0000 │ Concrete              │ Subcontractor │ ☑            │ │
│ │ 03-0100 │ Foundation            │ Subcontractor │ ☑            │ │
│ │ ...     │ ...                   │ ...           │ ...           │ │
│ └─────────┴───────────────────────┴───────────────┴───────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Features
- Import standard CSI MasterFormat codes
- Add custom codes
- Edit descriptions
- Set category (Labor, Material, Subcontractor, Equipment, Other)
- Activate/deactivate codes
- Organize by division

## Cost Code Fields
| Field | Type | Notes |
|-------|------|-------|
| code | text | e.g., "03-0100" |
| name | text | Description |
| division | text | CSI division number |
| category | string | Labor, Material, Sub, Equip, Other |
| is_active | boolean | |
| sort_order | int | Display order |

---

## API Endpoints

### Vendors
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/vendors` | List |
| POST | `/api/vendors` | Create |
| GET | `/api/vendors/:id` | Detail |
| PATCH | `/api/vendors/:id` | Update |

### Clients
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/clients` | List |
| POST | `/api/clients` | Create |
| GET | `/api/clients/:id` | Detail |
| PATCH | `/api/clients/:id` | Update |

### Cost Codes
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/cost-codes` | List |
| POST | `/api/cost-codes` | Create |
| PATCH | `/api/cost-codes/:id` | Update |
| POST | `/api/cost-codes/import` | Import standard |

---

## Component Structure

```
components/vendors/
├── VendorList.tsx
├── VendorDetail.tsx
├── VendorForm.tsx
└── VendorCard.tsx

components/clients/
├── ClientList.tsx
├── ClientDetail.tsx
├── ClientForm.tsx
└── ClientPortalToggle.tsx

components/cost-codes/
├── CostCodeList.tsx
├── CostCodeForm.tsx
└── CostCodeImport.tsx
```

---

## Affected By Changes To
- Company settings (default cost codes, trades)
- Users (created by tracking)
- QuickBooks (synced vendors/clients)

## Affects
- Invoices (vendor selection)
- Purchase Orders (vendor selection)
- Jobs (client assignment)
- Leads (client linking on conversion)
- Budget (cost code categories)
- Estimates (cost code line items)
- Portal access (client portal users)
- QuickBooks sync (entity mapping)

---

## Mobile Considerations

### Vendors
- Card-based list with trade icon, name, phone (tap to call)
- Quick actions: Call, Email, View Details
- Search with voice input
- Add vendor form: camera capture for W9/insurance docs
- Offline: Cache vendor list, queue new vendor creation

### Clients
- Card-based list with name, phone, active jobs count
- Tap phone to call, tap email to compose
- Quick view of client's jobs
- Portal invite via SMS option

### Cost Codes
- Collapsible division groups
- Search/filter by code or name
- View-only on mobile (editing on desktop recommended)
- Quick copy code to clipboard

---

## Gap Items Addressed

### Section 45 — Per-Page Feature Requirements (Vendor Profile Page)
- **#708** Contact information, addresses, key personnel
- **#709** Insurance status with expiration countdown
- **#710** License status with verification link
- **#711** Performance scorecard — visual dashboard of ratings
- **#712** Job history — all projects worked on with performance data per job
- **#713** Financial summary — total spend, average invoice size, payment history
- **#714** Active contracts and POs
- **#715** Open punch items across all jobs
- **#716** Schedule reliability metrics — on-time start %, on-time completion %
- **#717** Bid history — all bids submitted, won/lost, pricing trends
- **#718** Communication log — recent messages, calls, emails
- **#719** Document repository — COI, W-9, contracts, lien waivers
- **#720** Notes and tags — internal notes about the vendor
- **#721** Related vendors — "this is a subsidiary of XYZ Corp"
- **#722** Capacity indicator — how many active jobs they have with you
- **#723** Quick actions: Create PO, Invite to Bid, Send Message, Schedule Meeting

### Section 19 — Vendor & Subcontractor Management
- **#381** Vendors on platform working for multiple builders (builder-specific vs vendor's own profile)
- **#382** Vendor self-registration (vendor signs up, builder approves)
- **#383** Vendor compliance tracking (insurance, license, safety — configurable per builder)
- **#384** Vendor prequalification workflows (configurable questionnaire, docs, approval)
- **#385** Vendor bid management (invitation, submission, comparison through platform)
- **#386** Vendor payment terms (configurable per vendor per builder — Net 30, Net 15, 2/10 Net 30)
- **#387** Vendor rate sheets (standing pricing agreements auto-populate POs)
- **#388** Vendor communication preferences (email, portal, text — configurable)
- **#389** Vendor blacklisting (builder-level, not platform-level)
- **#390** Vendor performance benchmarks (platform-wide anonymous data)
- **#391** Vendor succession (key person leaves — data stays with company)
- **#392** Vendor contract templates (builder-configurable standard subcontract)
- **#393** Vendor onboarding to platform (guided first-time experience)
- **#394** Vendor support responsibility (builder vs platform support team)

### Section 11 — Estimating & Budgeting (Cost Codes)
- **#257** Support for CSI MasterFormat, custom codes, and hybrid cost code systems
- **#258** Configurable cost code hierarchy per builder

### Section 23 — Client Portal & Communication (Client Management)
- **#421** Client portal branding per builder
- **#422** Client portal content control (builder configures what client sees)
- **#429** Logging external communication (calls/texts outside portal)
- **#430** Client portal analytics (login frequency, feature usage)

---

## Additional Requirements from Gap Analysis

### Vendor Detail View Enhancements Needed
1. **Performance scorecard** (#711): Add visual dashboard tab with ratings for quality, timeliness, communication, and budget adherence calculated from project data
2. **Schedule reliability metrics** (#716): Calculate and display on-time start % and on-time completion % from schedule task data across all jobs
3. **Bid history** (#717): New section showing all bids submitted by this vendor, whether won/lost, and pricing trend chart over time
4. **Communication log** (#718): Unified log of messages, calls, and emails related to this vendor across all jobs
5. **Related vendors** (#721): Field to link vendors as parent/subsidiary/affiliated companies
6. **Capacity indicator** (#722): Show count of active jobs this vendor is currently assigned to, with optional max capacity setting
7. **Quick actions bar** (#723): Add prominent quick action buttons at top of vendor detail: Create PO, Invite to Bid, Send Message, Schedule Meeting
8. **Insurance expiration countdown** (#709): Visual countdown with color coding (green > 60 days, yellow 30-60, red < 30) and auto-alert
9. **License verification** (#710): Link to state licensing database for automatic verification where available
10. **Open punch items** (#715): Cross-project view of all unresolved punch items assigned to this vendor

### Vendor List Enhancements Needed
1. **Self-registration flow** (#382): Portal-based vendor registration with builder approval workflow
2. **Prequalification** (#384): Configurable questionnaire and document checklist before vendor is approved
3. **Compliance dashboard** (#383): At-a-glance view of which vendors have expired insurance, missing W-9s, or lapsed licenses
4. **Blacklist/preferred indicators** (#389): Visual tags for preferred, approved, probation, and blacklisted status per builder
5. **Payment terms column** (#386): Display and configure payment terms per vendor (Net 30, 2/10 Net 30, etc.)
6. **Rate sheet link** (#387): Attach standing rate sheets to vendor profile; auto-populate PO line items from rates

### Client Detail View Enhancements Needed
1. **Portal analytics** (#430): Show client engagement metrics — login frequency, last login, features used, time spent
2. **External communication log** (#429): Allow logging phone calls, texts, and in-person conversations that happen outside the portal
3. **Multi-job view**: Show all jobs (past and current) for this client with financial summaries per job
4. **Referral tracking**: Track how this client was referred and whether they have referred others

### Cost Code Enhancements Needed
1. **Hybrid code systems** (#257): Support CSI MasterFormat import, custom codes, and mixed hierarchies simultaneously
2. **Custom hierarchy** (#258): Allow builders to define their own hierarchy structure (Division > Code > Line vs Phase > Trade > Item)
3. **Cost code templates**: Pre-built code sets for different builder types that can be imported and customized
4. **Code mapping**: Map internal cost codes to QuickBooks accounts, vendor categories, and reporting groups

---

## Revision History
| Date | Change |
|------|--------|
| 2026-02-11 | Added Gap Items Addressed and Additional Requirements from gap analysis sections 11, 19, 23, and 45 |
| Initial | Created from batch planning |
