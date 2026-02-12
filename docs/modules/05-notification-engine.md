# Module 5: Notification Engine

**Phase:** 1 - Foundation
**Status:** TODO
**Priority:** High -- cross-cutting concern that every other module depends on

---

## Overview

The Notification Engine is the centralized system through which all platform events reach users. Every module emits events (invoice approved, inspection failed, selection deadline approaching) and this engine routes them to the correct recipients via the correct channels based on builder-level configuration and user-level preferences. The system must support in-app real-time notifications, email, SMS, push notifications, and third-party integrations (Slack, webhooks). Because this is a multi-tenant SaaS product, every notification type, template, and routing rule must be configurable per builder -- what Ross Built considers a critical alert may be irrelevant to another builder.

---

## Gap Items Addressed

| Gap # | Summary |
|-------|---------|
| 481 | Every notification type configurable per role per builder |
| 482 | Notification channels per user (in-app, email, SMS, push -- user chooses) |
| 483 | Notification templates customizable per builder |
| 484 | Notification quiet hours (no push after configured time) |
| 485 | Cross-project notification digests vs. real-time per event |

Also references:
| 529 | Notification center / inbox as central attention hub (from Section 34) |
| 521 | UI scaling -- notification volume differs drastically between small and large builders |

---

## Detailed Requirements

### 5.1 Notification Event Model (Gap 481)

**Event Registration**
- Each module registers its notification event types at startup via a declarative schema:
  ```
  {
    event_type: "invoice.approved",
    module: "invoices",
    description: "An invoice has been approved for payment",
    default_channels: ["in_app", "email"],
    default_roles: ["owner", "pm", "accountant"],
    variables: ["invoice_number", "vendor_name", "amount", "project_name", "approved_by"],
    urgency: "normal"  // "low", "normal", "high", "critical"
  }
  ```
- Event types are stored in `notification_event_types` and seeded on deployment.
- New event types from module updates are auto-registered; existing builder overrides are preserved.

**Builder-Level Configuration (Gap 481)**
- Per builder, each event type can be:
  - Enabled or disabled entirely.
  - Routed to specific roles (override default roles).
  - Assigned to specific channels (override default channels).
  - Assigned an urgency override.
- Configuration stored in `builder_notification_config`.
- Admin UI: table of all event types grouped by module, with toggles and dropdowns per role.

**Event Emission**
- Modules emit events via `notificationService.emit(eventType, payload, context)`.
- Context includes: `builder_id`, `project_id`, `triggered_by_user_id`, `entity_type`, `entity_id`.
- The engine resolves recipients based on builder config + role assignments + project membership.

### 5.2 Multi-Channel Delivery (Gap 482)

**Supported Channels**

| Channel | Provider | Latency Target | V1? |
|---------|----------|----------------|-----|
| In-app | SSE / WebSocket (own infrastructure) | < 1 second | Yes |
| Email | SendGrid or AWS SES | < 30 seconds | Yes |
| SMS | Twilio | < 10 seconds | Yes |
| Push (web) | Web Push API (VAPID) | < 5 seconds | Yes |
| Push (mobile) | FCM (Android) / APNs (iOS) | < 5 seconds | Phase 2 |
| Slack | Slack Incoming Webhooks | < 10 seconds | Phase 2 |
| Webhook | Custom HTTP POST | < 10 seconds | Phase 2 |

**Channel Architecture**
- Each channel implemented as a `ChannelAdapter` with a common interface: `send(recipient, renderedMessage, metadata)`.
- Channel adapters are async and run in a background job queue (Bull/BullMQ on Redis).
- Failed deliveries retry with exponential backoff (3 attempts, 1m / 5m / 30m).
- Delivery status tracked per notification per channel: `pending`, `sent`, `delivered`, `failed`, `bounced`.

### 5.3 User Preferences (Gap 482, 484)

**Per-User Channel Preferences**
- Each user configures their preferred channels per event category (not per individual event type -- too granular).
- Categories: Financial, Schedule, Documents, Field Operations, Approvals, System.
- Matrix UI: rows = categories, columns = channels, cells = toggle on/off.
- Default: all categories enabled for in-app; email enabled for Financial and Approvals.

**Quiet Hours (Gap 484)**
- Per-user setting: quiet start time, quiet end time, timezone.
- During quiet hours, push and SMS notifications are held and delivered at quiet-end time.
- In-app and email are unaffected (email is async by nature; in-app queues silently).
- Critical-urgency notifications (e.g., safety incident) bypass quiet hours with a separate user opt-in.
- Builder-level quiet hours can set a floor (e.g., no notifications before 6am or after 10pm regardless of user setting).

**Mute / Snooze**
- Users can mute a specific project's notifications temporarily (1 hour, until tomorrow, until I turn back on).
- Users can snooze an individual notification for a specified duration.

### 5.4 Digest & Batching (Gap 485)

**Digest Options**
- Per-user toggle: real-time delivery vs. digest mode.
- Digest frequencies: hourly, twice daily (9am + 4pm), daily (configurable time).
- Digest groups notifications by project, then by event type within each project.
- Digest delivered via email; in-app shows a "You have a digest ready" indicator.

**Batching Logic**
- If the same event type fires > 5 times within 5 minutes for the same user, auto-batch into a summary: "7 invoices were approved in the last 5 minutes".
- Batch threshold configurable per builder.

**Cross-Project Summary (Gap 485)**
- Users working on 5+ projects receive a daily summary email: key events per project, items needing attention, upcoming deadlines.
- This is the email counterpart to the "My Day" dashboard view (Module 4, Gap 528).

### 5.5 Notification Templates (Gap 483)

**Template System**
- Each event type has a default template per channel (in-app, email subject, email body, SMS, push title, push body).
- Templates use Handlebars-style variable substitution: `{{vendor_name}} submitted invoice {{invoice_number}} for ${{amount}} on {{project_name}}.`
- Builder admins can customize template text for their organization (stored in `builder_notification_templates`).
- Variables are validated against the event type's declared variable list.

**Email Templates**
- HTML email templates with builder branding (logo, colors from white-label settings).
- Responsive email layout (MJML or similar).
- Plain-text fallback auto-generated from HTML.
- Unsubscribe link in every email (maps to user preference toggle for that category).

**Template Previews**
- Admin UI shows a live preview with sample data when editing templates.
- Test send: admin can send a test notification to themselves before saving.

### 5.6 In-App Notification Center (Gap 529)

**Notification Bell / Inbox**
- Bell icon in top nav shows unread count (badge).
- Dropdown panel shows latest 20 notifications with infinite scroll.
- Each notification: icon (by module), title, body snippet, timestamp, read/unread indicator.
- Click notification to navigate to the related entity.
- Bulk actions: mark all as read, clear all.

**Real-Time Delivery**
- In-app notifications delivered via Server-Sent Events (SSE) on existing SSE infrastructure.
- New notification pushes to the client immediately; UI updates without page refresh.
- If SSE connection drops, client reconnects and fetches missed notifications via REST.
- SSE connection respects MAX_SSE_CLIENTS limit (existing infrastructure).

**Notification Filtering**
- Filter by: all, unread, category, project.
- Search within notifications.

### 5.7 Delivery Tracking & Reliability

**Delivery Status**
- Every notification delivery attempt logged in `notification_deliveries`.
- Status flow: `queued` -> `processing` -> `sent` -> `delivered` / `failed` / `bounced`.
- For email: delivery and bounce status updated via SendGrid/SES webhooks.
- For SMS: delivery receipt from Twilio webhook.
- Admin view: delivery report showing success/failure rates per channel.

**Dead Letter Queue**
- After 3 failed attempts, notification moves to dead letter queue.
- Admin alert when dead letter queue exceeds threshold.
- Manual retry available from admin panel.

**Idempotency**
- Each notification has a unique `idempotency_key` (hash of event_type + entity_id + timestamp window).
- Prevents duplicate notifications if the same event is emitted multiple times (e.g., during retry or race condition).

---

## Database Tables

```sql
-- Registered notification event types (seeded by modules)
CREATE TABLE notification_event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL UNIQUE,      -- e.g., 'invoice.approved'
  module TEXT NOT NULL,                  -- e.g., 'invoices'
  description TEXT,
  default_channels TEXT[] DEFAULT '{in_app,email}',
  default_roles TEXT[] DEFAULT '{owner,pm}',
  variables TEXT[] DEFAULT '{}',
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'critical')),
  category TEXT NOT NULL,                -- 'financial', 'schedule', 'documents', etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Builder-level overrides per event type
CREATE TABLE builder_notification_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id),
  event_type_id UUID NOT NULL REFERENCES notification_event_types(id),
  enabled BOOLEAN DEFAULT true,
  channels TEXT[],                       -- override default channels
  roles TEXT[],                          -- override default roles
  urgency TEXT,                          -- override urgency
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(builder_id, event_type_id)
);

-- Builder-level template overrides
CREATE TABLE builder_notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id),
  event_type_id UUID NOT NULL REFERENCES notification_event_types(id),
  channel TEXT NOT NULL,                 -- 'in_app', 'email_subject', 'email_body', 'sms', 'push_title', 'push_body'
  template_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(builder_id, event_type_id, channel)
);

-- User notification preferences
CREATE TABLE user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  builder_id UUID NOT NULL REFERENCES builders(id),
  category TEXT NOT NULL,               -- 'financial', 'schedule', etc.
  channel TEXT NOT NULL,                -- 'in_app', 'email', 'sms', 'push'
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, builder_id, category, channel)
);

-- User quiet hours and digest settings
CREATE TABLE user_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  builder_id UUID NOT NULL REFERENCES builders(id),
  quiet_start TIME,                     -- e.g., '20:00'
  quiet_end TIME,                       -- e.g., '07:00'
  timezone TEXT DEFAULT 'America/New_York',
  digest_mode BOOLEAN DEFAULT false,
  digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('hourly', 'twice_daily', 'daily')),
  digest_time TIME DEFAULT '08:00',
  critical_bypass_quiet BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, builder_id)
);

-- Individual notification records
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id),
  user_id UUID NOT NULL REFERENCES users(id),  -- recipient
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  entity_type TEXT,                     -- 'invoice', 'project', 'rfi', etc.
  entity_id UUID,
  url_path TEXT,                        -- deep link
  urgency TEXT DEFAULT 'normal',
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(idempotency_key)
);
CREATE INDEX idx_notifications_user ON notifications(user_id, builder_id, read, created_at DESC);

-- Delivery tracking per channel
CREATE TABLE notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id),
  channel TEXT NOT NULL,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'sent', 'delivered', 'failed', 'bounced')),
  provider_message_id TEXT,             -- external ID from SendGrid/Twilio
  attempts INT DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_deliveries_status ON notification_deliveries(status, channel);

-- Digest queue (batched notifications waiting for digest delivery)
CREATE TABLE notification_digest_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  builder_id UUID NOT NULL REFERENCES builders(id),
  notification_id UUID NOT NULL REFERENCES notifications(id),
  scheduled_for TIMESTAMPTZ NOT NULL,
  delivered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_digest_scheduled ON notification_digest_queue(scheduled_for, delivered);

-- Project-level mute settings
CREATE TABLE user_project_mutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  builder_id UUID NOT NULL REFERENCES builders(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  muted_until TIMESTAMPTZ,             -- NULL = muted indefinitely until manually unmuted
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, builder_id, project_id)
);
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v2/notifications` | List notifications for current user (paginated, filterable) |
| GET | `/api/v2/notifications/unread-count` | Unread notification count (for bell badge) |
| PUT | `/api/v2/notifications/:id/read` | Mark single notification as read |
| PUT | `/api/v2/notifications/read-all` | Mark all notifications as read |
| PUT | `/api/v2/notifications/:id/snooze` | Snooze notification until specified time |
| DELETE | `/api/v2/notifications/:id` | Dismiss / delete a notification |
| GET | `/api/v2/notifications/preferences` | Get user's channel preferences |
| PUT | `/api/v2/notifications/preferences` | Update user's channel preferences |
| GET | `/api/v2/notifications/settings` | Get user's quiet hours and digest settings |
| PUT | `/api/v2/notifications/settings` | Update quiet hours and digest settings |
| GET | `/api/v2/notifications/mutes` | List user's muted projects |
| POST | `/api/v2/notifications/mutes` | Mute a project |
| DELETE | `/api/v2/notifications/mutes/:project_id` | Unmute a project |
| GET | `/api/v2/admin/notifications/config` | Get builder's notification config (admin) |
| PUT | `/api/v2/admin/notifications/config` | Update builder's notification config (admin) |
| GET | `/api/v2/admin/notifications/templates` | List builder's template overrides (admin) |
| PUT | `/api/v2/admin/notifications/templates/:event_type` | Update template for event type (admin) |
| POST | `/api/v2/admin/notifications/templates/:event_type/test` | Send test notification (admin) |
| GET | `/api/v2/admin/notifications/delivery-report` | Delivery success/failure report (admin) |
| GET | `/api/v2/sse/notifications` | SSE stream for real-time in-app notifications |

---

## Dependencies

| Module | Reason |
|--------|--------|
| Module 1: Auth & Access | User identity, role resolution for recipient determination |
| Module 2: Multi-Tenant Core | `builder_id` on all queries, builder settings for config |
| Module 4: Navigation & Dashboard | Notification bell UI, "My Day" cross-references |
| Redis / BullMQ | Job queue for async channel delivery and digest scheduling |
| SendGrid or AWS SES | Email delivery provider |
| Twilio | SMS delivery provider |
| Web Push (VAPID) | Browser push notification delivery |
| All other modules | Each module emits notification events |

---

## Open Questions

1. **SMS cost model**: SMS has per-message cost. Should SMS be a premium feature limited to higher subscription tiers, or available to all with a monthly SMS credit limit per builder?
2. **Push notification opt-in**: Browser push requires explicit user permission. What is the UX flow to encourage opt-in without being intrusive?
3. **Slack integration scope**: Should Slack integration be per-user (user connects their own Slack) or per-builder (admin sets up a channel for the whole org)? Likely per-builder with channel routing rules.
4. **Webhook for automation**: Should the webhook channel support outgoing webhooks to Zapier/Make/n8n for builders who want to build custom automations? This could be a powerful differentiator.
5. **Notification retention**: How long are notifications kept? Suggested: 90 days in main table, then archived. Delivery logs kept 30 days.
6. **Rate limiting**: Should there be a per-user notification rate limit to prevent notification fatigue from bulk operations (e.g., importing 500 invoices fires 500 "invoice created" notifications)?
