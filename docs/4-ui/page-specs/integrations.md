# View Plan: Third-Party Integrations

## Views Covered
1. Integrations Hub
2. Integration Configuration

---

## Purpose
Connect external tools:
- Accounting (QuickBooks, Xero)
- Project Management (Procore)
- Communication (Slack)
- Payments (Stripe)
- Email (SendGrid)
- SMS (Twilio)

---

## 1. Integrations Hub
URL: /settings/integrations

Display:
- Available integrations
- Connection status
- Last sync time
- Quick actions

Categories:
- Accounting
- Project Management
- Communication
- Payments
- Productivity

---

## 2. Integration Details

### QuickBooks Online
URL: /settings/integrations/quickbooks

Features:
- OAuth connection
- Account mapping
- Sync preferences
- Manual sync trigger
- Sync history

Data Synced:
- Vendors (bidirectional)
- Invoices (export)
- Chart of accounts (import)

### Xero
URL: /settings/integrations/xero

Similar to QuickBooks with Xero-specific mappings

### Procore
URL: /settings/integrations/procore

Features:
- Project linking
- RFI sync
- Submittal sync
- Daily log sync
- Document sharing

### Slack
URL: /settings/integrations/slack

Features:
- Workspace connection
- Channel mapping
- Notification routing
- Message formatting

Notifications:
- Invoice status changes
- Budget alerts
- Schedule changes
- Task assignments

### Stripe (Billing)
URL: /settings/integrations/stripe

Purpose: Platform subscription billing

### SendGrid (Email)
URL: /settings/integrations/sendgrid

Features:
- API key configuration
- Sender verification
- Template sync
- Delivery tracking

### Twilio (SMS)
URL: /settings/integrations/twilio

Features:
- Account credentials
- Phone number setup
- Message templates
- Delivery tracking

---

## AI Integration
URL: /settings/integrations/ai

Configure:
- AI processing preferences
- Confidence thresholds
- Learning feedback
- Cost monitoring

---

## Webhooks
URL: /settings/integrations/webhooks

Features:
- Custom webhook endpoints
- Event subscriptions
- Payload configuration
- Delivery logs
- Retry policies

---

## Database Schema

integrations:
- id UUID
- company_id UUID
- type TEXT
- config JSONB (encrypted)
- status TEXT
- last_sync_at TIMESTAMPTZ
- error_message TEXT
- created_at TIMESTAMPTZ

integration_logs:
- id UUID
- integration_id UUID
- action TEXT
- direction TEXT (import/export)
- entity_type TEXT
- entity_count INTEGER
- status TEXT
- error_details JSONB
- created_at TIMESTAMPTZ

webhooks:
- id UUID
- company_id UUID
- name TEXT
- url TEXT
- events TEXT[]
- secret TEXT
- active BOOLEAN
- last_triggered_at TIMESTAMPTZ

---

## Gap Items Addressed

### From Section 33: Integrations & Data (Items 506-520)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 506 | Public API (REST? GraphQL? Both?) | Requires: API documentation page and API key management in integrations hub |
| 507 | Webhooks for real-time event notifications | Webhooks section covers custom endpoints, event subscriptions, delivery logs, and retry policies |
| 508 | OAuth for third-party integrations | QuickBooks and Procore use OAuth connection; Requires: standardized OAuth flow for all integrations |
| 509 | Integration health monitoring (is sync working? last run? errors?) | Integration Hub shows connection status and last sync time; Requires: error alerting and sync history dashboard |
| 510 | Integration data mapping per tenant (each builder's QuickBooks differs) | QuickBooks section has "Account mapping"; Requires: per-tenant mapping configuration UI |
| 511 | Integration marketplace (pre-built integrations, one-click enable) | Integrations Hub organized by category; Requires: marketplace-style browse/install UX with one-click setup |
| 512 | Handling integrations that go down (queue, retry, notify) | Requires: retry queue with exponential backoff, admin notification on persistent failures |
| 513 | Building department API integrations (auto-submit permits where available) | Requires: permit system integration category with jurisdiction-specific connectors |
| 514 | Bulk data import/export (CSV, Excel, JSON for any entity) | Requires: universal import/export tool in integrations hub, not just per-module export |
| 515 | Zapier/Make integration for unsupported tools | Requires: Zapier/Make trigger and action definitions in the integrations marketplace |
| 516 | Construction camera integration (EarthCam, OpenSpace, Sensera) | Requires: camera integration category with live feed embedding and photo auto-import |
| 517 | Drone service integration (DroneDeploy, Skydio) | Requires: drone survey data import connector |
| 518 | Material delivery tracking integration (UPS, FedEx, freight) | Requires: shipping carrier API connectors for auto-tracking PO deliveries |
| 519 | Equipment rental company integration | Requires: rental company API connector for auto-tracking rental periods and billing |
| 520 | State licensing database integration (auto-verify vendor licenses) | Requires: license verification API connector per state for vendor compliance checks |

### From Section 45: Per-Page Feature Requirements — Settings/Admin (Items 787, 791-792)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 787 | Integration management — connect/disconnect, monitor sync status | Integrations Hub with status indicators and quick actions |
| 791 | Data import/export tools | Requires: dedicated import/export section within integrations hub |
| 792 | API key management for integrations | Requires: API key generation, rotation, and permissions UI |

### From Section 24: Financial Management (Items 431-432)
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 431 | Chart of accounts mapping configurable per builder | QuickBooks account mapping section; Requires: visual mapping interface with auto-suggest |
| 432 | Supporting multiple accounting systems (QB Desktop, QB Online, Sage, Xero, Viewpoint) | QuickBooks and Xero covered; Requires: Sage and Viewpoint connectors on roadmap |

### From Edge Cases (Sections 44, 47, 48)
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 616 | Multiple builders on same subdivision — shared infrastructure | Requires: cross-tenant data sharing integration for shared project scenarios |
| 618 | Joint venture between two builders on platform | Requires: inter-tenant data sharing APIs with permission controls |
| 835 | API rate limiting for integrations (prevent overwhelming third-party services) | Requires: configurable rate limits per integration with queue management |
| 844 | Third-party dependency management (key service changes pricing or goes down) | Integration health monitoring must include dependency status checks and fallback notifications |
| 834 | Data export volume — 5 years of data export performance | Bulk export must handle large datasets with background processing and download links |

### From Section 35: Data Integrity (Items 537-546)
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 543 | Data consistency during integration sync (reconciliation) | Requires: sync conflict resolution UI showing discrepancies between systems |

---

## Revision History
| Date | Change |
|------|--------|
| 2026-02-11 | Added Gap Items Addressed section from gap analysis sections 24, 33, 35, 44-48 |
| Initial | Created from view planning |
