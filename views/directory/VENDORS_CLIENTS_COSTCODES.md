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

## Revision History
| Date | Change |
|------|--------|
| Initial | Created from batch planning |
