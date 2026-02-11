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
