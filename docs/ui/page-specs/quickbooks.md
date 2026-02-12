# View Plan: QuickBooks Integration

## Views Covered
- QuickBooks Settings
- QuickBooks Sync Status

---

# OVERVIEW

## Purpose
Integrate with QuickBooks Online to:
- Sync vendors/customers
- Push invoices for payment tracking
- Push bills (vendor invoices) for AP
- Sync chart of accounts with cost codes
- Track payments

## Integration Approach
- One-way or two-way sync (configurable)
- Background sync jobs
- Manual sync option
- Error handling and retry logic
- Audit trail of all syncs

---

# QUICKBOOKS SETTINGS

## URL
`/settings/integrations/quickbooks`

## Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│  Settings > Integrations                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [QuickBooks] [Other Integrations...]                               │
│                                                                     │
│  ═══ QUICKBOOKS ONLINE ═════════════════════════════════════════   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                                                                 ││
│  │  Status: ✓ Connected                                            ││
│  │  Company: Ross Built Construction LLC                           ││
│  │  Connected: November 15, 2024                                   ││
│  │  Last Sync: December 10, 2024 at 3:45 PM                        ││
│  │                                                                 ││
│  │  [Disconnect QuickBooks]                [View Sync Status →]    ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ═══ SYNC SETTINGS ═════════════════════════════════════════════   │
│                                                                     │
│  AUTOMATIC SYNC                                                     │
│  ─────────────────                                                  │
│  ● Enabled   ○ Disabled                                             │
│                                                                     │
│  Sync Frequency: [Every 15 minutes ▼]                              │
│                                                                     │
│  WHAT TO SYNC                                                       │
│  ─────────────────                                                  │
│                                                                     │
│  Vendors                                                            │
│  ☑ Sync vendors to QuickBooks                                      │
│     Direction: [Two-way ▼]                                         │
│     • Push: New vendors created in CMS → QuickBooks                │
│     • Pull: New vendors in QuickBooks → CMS                        │
│                                                                     │
│  Clients/Customers                                                  │
│  ☑ Sync clients to QuickBooks                                      │
│     Direction: [Two-way ▼]                                         │
│                                                                     │
│  Bills (Vendor Invoices)                                            │
│  ☑ Push approved invoices as bills                                 │
│     When: [On approval ▼]                                          │
│     • Creates bill in QuickBooks when invoice is approved          │
│     • Syncs payment status back                                    │
│                                                                     │
│  Customer Invoices (Draws)                                          │
│  ☑ Push draws as customer invoices                                 │
│     When: [On client approval ▼]                                   │
│     • Creates invoice in QuickBooks when draw is approved          │
│                                                                     │
│  Chart of Accounts                                                  │
│  ☑ Sync chart of accounts with cost codes                          │
│     Direction: [Pull only ▼]                                       │
│     • Maps QuickBooks accounts to cost codes                       │
│                                                                     │
│  ═══ ACCOUNT MAPPING ═══════════════════════════════════════════   │
│                                                                     │
│  Map cost code categories to QuickBooks accounts:                   │
│                                                                     │
│  ┌───────────────────────┬─────────────────────────────────────┐   │
│  │ Cost Code Category    │ QuickBooks Account                  │   │
│  ├───────────────────────┼─────────────────────────────────────┤   │
│  │ Labor                 │ [Job Labor Expense          ▼]     │   │
│  │ Materials             │ [Job Materials Expense      ▼]     │   │
│  │ Subcontractors        │ [Subcontractor Expense      ▼]     │   │
│  │ Equipment             │ [Equipment Expense          ▼]     │   │
│  │ Other                 │ [Other Job Costs            ▼]     │   │
│  └───────────────────────┴─────────────────────────────────────┘   │
│                                                                     │
│  Default Income Account: [Construction Income         ▼]           │
│  Default AP Account:     [Accounts Payable            ▼]           │
│  Default AR Account:     [Accounts Receivable         ▼]           │
│                                                                     │
│  ═══ SYNC JOBS ═════════════════════════════════════════════════   │
│                                                                     │
│  ☑ Create jobs in QuickBooks for each project                      │
│     • Enables job-level profitability tracking in QuickBooks       │
│     • Bills and invoices assigned to QB job                        │
│                                                                     │
│                                              [Save Settings]        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Initial Connection (Not Connected State)
```
┌─────────────────────────────────────────────────────────────────────┐
│  ═══ QUICKBOOKS ONLINE ═════════════════════════════════════════   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                                                                 ││
│  │  ┌─────────────────┐                                            ││
│  │  │                 │                                            ││
│  │  │   [QB LOGO]     │  Connect to QuickBooks Online              ││
│  │  │                 │                                            ││
│  │  └─────────────────┘                                            ││
│  │                                                                 ││
│  │  Sync your vendors, customers, invoices, and payments           ││
│  │  with QuickBooks Online.                                        ││
│  │                                                                 ││
│  │  What you'll need:                                              ││
│  │  • QuickBooks Online account (Plus or Advanced)                 ││
│  │  • Admin access to authorize the connection                     ││
│  │                                                                 ││
│  │             [Connect to QuickBooks]                             ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Connection Flow
1. Click "Connect to QuickBooks"
2. Redirect to Intuit OAuth
3. User logs in to QuickBooks
4. Authorizes Ross Built CMS
5. Redirect back with auth code
6. Exchange for access/refresh tokens
7. Store tokens securely
8. Show connected state

---

# QUICKBOOKS SYNC STATUS

## URL
`/settings/integrations/quickbooks/sync`

## Purpose
View sync history, errors, and manually trigger syncs.

## Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│  QuickBooks Sync Status                                             │
│                                                                     │
│  [← Back to Settings]                           [Sync Now]          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ═══ CURRENT STATUS ════════════════════════════════════════════   │
│                                                                     │
│  ┌──────────────────┬────────────────────────────────────────────┐ │
│  │ Last Sync        │ December 10, 2024 at 3:45 PM              │ │
│  │ Status           │ ✓ Completed successfully                  │ │
│  │ Next Scheduled   │ December 10, 2024 at 4:00 PM              │ │
│  │ Connection       │ ✓ Connected - Token valid                 │ │
│  └──────────────────┴────────────────────────────────────────────┘ │
│                                                                     │
│  ═══ SYNC SUMMARY ══════════════════════════════════════════════   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Entity          │ In CMS   │ In QB    │ Synced   │ Errors      ││
│  ├─────────────────┼──────────┼──────────┼──────────┼─────────────┤│
│  │ Vendors         │ 45       │ 48       │ 45       │ 0           ││
│  │ Clients         │ 28       │ 28       │ 28       │ 0           ││
│  │ Bills           │ 156      │ 156      │ 156      │ 0           ││
│  │ Customer Inv.   │ 24       │ 24       │ 24       │ 0           ││
│  │ Jobs            │ 12       │ 12       │ 12       │ 0           ││
│  └─────────────────┴──────────┴──────────┴──────────┴─────────────┘│
│                                                                     │
│  ═══ RECENT SYNC HISTORY ═══════════════════════════════════════   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Time                    │ Type      │ Status    │ Details      ││
│  ├─────────────────────────┼───────────┼───────────┼──────────────┤│
│  │ Dec 10, 3:45 PM         │ Scheduled │ ✓ Success │ 3 vendors    ││
│  │ Dec 10, 3:30 PM         │ Scheduled │ ✓ Success │ 1 bill       ││
│  │ Dec 10, 3:15 PM         │ Scheduled │ ✓ Success │ No changes   ││
│  │ Dec 10, 3:00 PM         │ Scheduled │ ✓ Success │ 2 bills      ││
│  │ Dec 10, 2:45 PM         │ Manual    │ ✓ Success │ Full sync    ││
│  │ Dec 10, 2:30 PM         │ Scheduled │ ⚠ Warning │ 1 skip       ││
│  │ ...                     │ ...       │ ...       │ ...          ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ═══ PENDING ITEMS ═════════════════════════════════════════════   │
│                                                                     │
│  Items waiting to be synced on next run:                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ • Invoice #1456 from ABC Electric (pending approval)           ││
│  │ • New vendor: XYZ Flooring (just created)                       ││
│  │ • Draw #5 for Smith Home (pending client approval)              ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ═══ ERRORS & WARNINGS ═════════════════════════════════════════   │
│                                                                     │
│  No current errors.                                                 │
│                                                                     │
│  [View Full Error Log]                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Error State Example
```
│  ═══ ERRORS & WARNINGS ═════════════════════════════════════════   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ⚠️ Warning: 1 vendor not synced                                ││
│  │    "John's HVAC" - Name already exists in QuickBooks           ││
│  │    [Resolve: Map to existing | Create with different name]      ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │ ❌ Error: Bill sync failed                                      ││
│  │    Invoice #1234 - Invalid account mapping                      ││
│  │    Account "Misc Expense" not found in QuickBooks               ││
│  │    [Resolve: Update mapping | Skip this bill]                   ││
│  └─────────────────────────────────────────────────────────────────┘│
```

---

## Sync Data Mapping

### Vendors → QuickBooks Vendors
| CMS Field | QB Field |
|-----------|----------|
| name | DisplayName |
| email | PrimaryEmailAddr |
| phone | PrimaryPhone |
| address, city, state, zip | BillAddr |
| tax_id | TaxIdentifier |

### Clients → QuickBooks Customers
| CMS Field | QB Field |
|-----------|----------|
| name | DisplayName |
| email | PrimaryEmailAddr |
| phone | PrimaryPhone |
| address, city, state, zip | BillAddr |

### Invoices → QuickBooks Bills
| CMS Field | QB Field |
|-----------|----------|
| vendor_id | VendorRef |
| invoice_number | DocNumber |
| invoice_date | TxnDate |
| due_date | DueDate |
| total | TotalAmt |
| line items | Line (ItemBasedExpense or AccountBasedExpense) |

### Draws → QuickBooks Invoices
| CMS Field | QB Field |
|-----------|----------|
| client_id | CustomerRef |
| draw_number | DocNumber |
| date | TxnDate |
| total | TotalAmt |
| line items | Line (SalesItemLine) |

### Jobs → QuickBooks Projects/Jobs
| CMS Field | QB Field |
|-----------|----------|
| name | DisplayName |
| client_id | ParentRef (Customer) |
| address | Address |

---

## API Endpoints

### QuickBooks OAuth
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/integrations/quickbooks/connect` | Start OAuth flow |
| GET | `/api/integrations/quickbooks/callback` | OAuth callback |
| POST | `/api/integrations/quickbooks/disconnect` | Disconnect |
| GET | `/api/integrations/quickbooks/status` | Connection status |

### Sync
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/integrations/quickbooks/sync` | Trigger manual sync |
| GET | `/api/integrations/quickbooks/sync/history` | Sync history |
| GET | `/api/integrations/quickbooks/sync/errors` | View errors |
| POST | `/api/integrations/quickbooks/sync/resolve/:id` | Resolve error |

### Settings
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/integrations/quickbooks/settings` | Get settings |
| PATCH | `/api/integrations/quickbooks/settings` | Update settings |
| GET | `/api/integrations/quickbooks/accounts` | List QB accounts |

---

## Database Tables

### qb_connection
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| company_id | uuid | Our company |
| qb_realm_id | text | QuickBooks company ID |
| access_token | text | Encrypted |
| refresh_token | text | Encrypted |
| token_expires_at | timestamp | |
| connected_at | timestamp | |
| connected_by | uuid | User who connected |

### qb_sync_log
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| sync_type | string | scheduled, manual |
| started_at | timestamp | |
| completed_at | timestamp | |
| status | string | success, warning, error |
| entities_synced | int | |
| errors | jsonb | Error details |

### qb_entity_map
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| entity_type | string | vendor, client, job, etc. |
| cms_id | uuid | Our entity ID |
| qb_id | text | QuickBooks entity ID |
| last_synced_at | timestamp | |
| sync_direction | string | push, pull, both |

---

## Component Structure

```
app/settings/integrations/
├── page.tsx                (integrations list)
└── quickbooks/
    ├── page.tsx            (QB settings)
    ├── sync/
    │   └── page.tsx        (sync status)
    └── callback/
        └── page.tsx        (OAuth callback)

components/integrations/
├── QuickBooksConnect.tsx
├── QuickBooksStatus.tsx
├── SyncSettings.tsx
├── AccountMapping.tsx
├── SyncHistory.tsx
├── SyncErrors.tsx
└── EntitySyncStatus.tsx

lib/integrations/
├── quickbooks/
│   ├── client.ts           (API client)
│   ├── oauth.ts            (OAuth flow)
│   ├── sync.ts             (Sync logic)
│   ├── mappers.ts          (Data mapping)
│   └── types.ts            (QB types)
```

---

## Background Jobs

### Scheduled Sync
- Runs every 15 minutes (configurable)
- Checks for new/updated entities
- Pushes/pulls based on settings
- Logs results

### Token Refresh
- Runs before token expiry
- Refreshes access token
- Updates stored token

### Error Retry
- Retries failed syncs
- Exponential backoff
- Max 3 retries per item

---

## Affected By Changes To
- Vendors (synced to QB)
- Clients (synced to QB)
- Invoices (pushed as bills)
- Draws (pushed as customer invoices)
- Jobs (pushed as QB projects)
- Cost Codes (mapped to QB accounts)
- Company settings (OAuth connection)

## Affects
- Vendors (may be created from QB sync)
- Clients (may be created from QB sync)
- Invoice payment status (updated from QB)
- Financial reports (accurate with QB data)

---

## Mobile Considerations

- View-only sync status on mobile
- Push notifications for sync errors
- Quick "Sync Now" button
- Error list with tap to view details
- Connection status indicator in app header
- Settings changes require desktop (OAuth flow)

---

## Gap Items Addressed

### Section 33 — Integrations & Data
- **#506** Public API (REST and/or GraphQL)
- **#507** Webhooks for real-time event notifications (invoice approved > trigger external system)
- **#508** OAuth for third-party integrations (secure authentication)
- **#509** Integration health monitoring (is the sync working? Last run? Errors?)
- **#510** Integration data mapping per-tenant (each builder's QuickBooks is set up differently)
- **#511** Integration marketplace (pre-built integrations builders can enable with a click)
- **#512** Handling integrations that go down (queue data, retry, notify)
- **#514** Bulk data import/export (CSV, Excel, JSON for any entity)
- **#515** Zapier/Make integration for builders who want to connect unsupported tools
- **#520** Integration with state licensing databases (auto-verify vendor licenses)

### Section 24 — Financial Management & Accounting
- **#431** Chart of accounts mapping configurable per builder (cost codes > QuickBooks accounts)
- **#432** Support for multiple accounting systems (QuickBooks Desktop, QBO, Sage, Xero, Viewpoint)
- **#433** Fiscal year configuration per builder
- **#434** WIP schedule calculation methods
- **#439** Financial data "accountant-locked" (month-end close synced with accounting system)
- **#543** Data consistency during integration sync (QuickBooks says $10,000, CMS says $10,250 — reconciliation)

### Section 45 — Per-Page Feature Requirements (Settings/Admin Page)
- **#787** Integration management — connect/disconnect integrations, monitor sync status

---

## Additional Requirements from Gap Analysis

### Multi-Accounting System Support (#432)
The current spec covers QuickBooks Online only. Gap analysis requires architecture to support:
1. **QuickBooks Desktop**: Different sync mechanism (Web Connector or middleware), not real-time API
2. **Sage 100/300**: Common among larger builders; requires different field mapping
3. **Xero**: REST API similar to QBO but different data model
4. **Viewpoint/Spectrum**: Enterprise construction accounting; complex integration
5. **Generic CSV export**: For accounting systems without API integration
6. **Architecture note**: Integration layer should be abstracted so adding a new accounting system only requires a new mapper/adapter, not changes to the sync engine

### Integration Health Monitoring (#509)
1. **Dashboard widget**: Show sync status for all active integrations in a single view
2. **Health indicators**: Green (syncing normally), Yellow (warnings/skipped items), Red (sync failing)
3. **Last sync timestamp**: Per entity type (vendors, bills, invoices)
4. **Error count badge**: Prominent count of unresolved errors requiring attention
5. **Auto-notification**: Email admin when sync fails for more than N consecutive attempts

### Data Reconciliation (#543)
1. **Reconciliation view**: Side-by-side comparison of CMS data vs QuickBooks data per entity
2. **Discrepancy highlighting**: Flag records where amounts, dates, or statuses differ
3. **Resolution workflow**: For each discrepancy, options to: accept CMS value, accept QB value, or manually set correct value
4. **Reconciliation report**: Summary of discrepancies found and resolved per sync period

### Integration Resilience (#512)
1. **Queue system**: When QuickBooks API is unavailable, queue outgoing data and retry automatically
2. **Exponential backoff**: Retry with increasing delays (1 min, 5 min, 15 min, 1 hour)
3. **Manual retry**: Allow admin to manually trigger retry of failed items
4. **Failure notification**: Alert admin when sync items have been queued for more than configurable threshold
5. **Partial sync**: If some items fail, continue syncing remaining items (don't fail entire batch)

### Per-Tenant Data Mapping (#510)
1. **Account mapping UI**: Each builder maps their CMS cost code categories to their specific QuickBooks accounts (already in spec — enhance with per-cost-code granularity, not just category-level)
2. **Class/Location mapping**: Map CMS jobs to QuickBooks Classes or Locations (used for job costing in QB)
3. **Custom field mapping**: Map CMS custom fields to QuickBooks custom fields where supported
4. **Mapping templates**: Pre-built mapping templates for common QuickBooks setups

### Webhook Support (#507)
1. **Outbound webhooks**: Configurable webhooks that fire when events occur in CMS (invoice approved, payment processed, vendor created)
2. **Webhook configuration UI**: Set URL, events to subscribe, authentication method
3. **Delivery log**: Track webhook delivery attempts, successes, and failures
4. **Retry logic**: Auto-retry failed webhook deliveries

### Zapier/Make Integration (#515)
1. **Zapier triggers**: Expose common CMS events as Zapier triggers (new invoice, invoice approved, new vendor, draw submitted)
2. **Zapier actions**: Allow Zapier to create/update entities in CMS (create vendor, update invoice status)
3. **API key management**: Generate API keys for third-party integrations with scope-limited permissions

### Bulk Import/Export (#514)
1. **Import wizard**: Step-by-step import for vendors, clients, cost codes, projects from CSV/Excel
2. **Column mapping**: Map CSV columns to CMS fields during import
3. **Validation preview**: Show preview of data to be imported with error highlighting before committing
4. **Export all data**: Full data export in CSV/JSON for backup or migration purposes

---

## Revision History
| Date | Change |
|------|--------|
| 2026-02-11 | Added Gap Items Addressed and Additional Requirements from gap analysis sections 24, 33, and 45 |
| Initial | Created from batch planning |
