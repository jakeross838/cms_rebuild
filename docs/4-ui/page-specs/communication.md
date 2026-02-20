# View Plan: Communication Hub

## Views Covered
1. Messages Center (Internal Team)
2. Conversation Thread
3. Client Communication Portal
4. Notification Center

---

## Communication Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           COMMUNICATION HUB                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│     INTERNAL                        EXTERNAL                                    │
│     (Team)                          (Clients/Vendors)                           │
│  ┌──────────────┐               ┌──────────────┐    ┌──────────────┐           │
│  │   Messages   │               │ Client Email │    │ Vendor Email │           │
│  │   (In-App)   │               │   (Portal)   │    │   (Direct)   │           │
│  └──────┬───────┘               └──────┬───────┘    └──────┬───────┘           │
│         └──────────────────────────────┴───────────────────┘                    │
│                                        │                                        │
│                        ┌───────────────────────────────┐                        │
│                        │      UNIFIED MESSAGE LOG      │                        │
│                        └───────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Messages Center

### URL
- `/messages`

### Features
- Internal team messaging by job
- @mentions and notifications
- File attachments
- Search across conversations
- Real-time updates via Supabase

---

## 2. Client Communication Portal

### URL
- `/jobs/:id/communications`

### Features
- Email history (sent/received)
- AI-drafted emails with templates
- Portal message log
- Attachment tracking

### AI Enhancements
- Smart email drafting based on job context
- Weekly update auto-generation
- Translation support

---

## 3. Notification Center

### URL
- Header bell icon dropdown

### Notification Types
| Type | Icon | Channels |
|------|------|----------|
| Invoice | 💰 | In-app, Email, Slack |
| Task | 📋 | In-app, Email |
| Schedule | 📆 | In-app, Slack |
| Budget | ⚠️ | In-app, Email, SMS |
| Message | 💬 | In-app |

### Settings
- Per-notification-type channel preferences
- Quiet hours configuration
- Slack workspace connection

---

## Database Schema

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'team', 'job', 'direct'
  job_id UUID REFERENCES jobs(id),
  participants UUID[],
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  mentions UUID[],
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  entity_type TEXT,
  entity_id UUID,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Integration Points
- SendGrid for email delivery
- Twilio for SMS alerts
- Slack webhooks for team notifications
- Supabase Realtime for live messaging

---

## Gap Items Addressed

### Section 23 — Client Portal & Communication
- **#421** Client portal fully branded per builder
- **#424** Client portal notifications configurable (what triggers notification to client)
- **#428** Client messaging (in-portal messaging vs email vs text — builder configurable)
- **#429** Logging external communication (phone calls, texts not made through portal)
- **#430** Client portal analytics (login frequency, feature usage)

### Section 30 — Notifications & Alerts
- **#481** Every notification type configurable per role per builder
- **#482** Notification channels per user (in-app, email, SMS, push — user chooses)
- **#483** Notification templates (builder customizes text of automated messages)
- **#484** Notification quiet hours (no push notifications after 8pm — configurable)
- **#485** Notification for events across multiple projects (daily digest vs real-time per event)

### Section 19 — Vendor & Subcontractor Management
- **#388** Vendor communication preferences (email, portal, text — configurable per vendor)

### Section 32 — AI & Intelligence Engine
- **#505** AI for communication assistance (draft client updates, RFI responses, change order descriptions)

### Section 34 — Search, Navigation & UX
- **#529** Notification center / inbox (central place for all items needing attention)

---

## Additional Requirements from Gap Analysis

### Notification Configuration Enhancements (#481, #482)
The current spec lists notification types but lacks per-role configuration. Needed:
1. **Per-role notification matrix**: Admin UI where builder configures which roles receive which notification types
2. **Per-user channel preferences**: Each user chooses their preferred channel per notification type (e.g., invoice alerts via email, schedule changes via push, messages via in-app only)
3. **Threshold-based notifications**: Configurable triggers (e.g., "notify owner when invoice > $10K", "alert PM when budget line > 80%")
4. **Frequency controls**: Per-notification-type option for immediate, hourly digest, daily digest, or weekly summary

### Notification Templates (#483)
1. **Template editor**: Builder can customize the subject, body, and formatting of automated notification messages
2. **Variable insertion**: Template variables like {{project_name}}, {{vendor_name}}, {{amount}}, {{due_date}}
3. **Per-recipient type templates**: Different template for client-facing notifications vs internal team notifications
4. **Multi-language support**: Template variants for different languages (future, but architecture should support)

### Quiet Hours & Scheduling (#484)
1. **Per-user quiet hours**: Users set their own quiet hours (e.g., no notifications 8pm-7am)
2. **Timezone-aware**: Quiet hours respect user's timezone
3. **Exception override**: Urgent/critical notifications can override quiet hours (configurable)
4. **Weekend settings**: Option to suppress non-urgent notifications on weekends

### Daily/Weekly Digest (#485)
1. **Digest email**: Consolidate all notifications from the day/week into a single summary email
2. **Configurable frequency**: Daily (sent at configurable time) or weekly (sent on configurable day)
3. **Smart grouping**: Group by project, then by type within each project
4. **Priority highlighting**: Urgent items highlighted at top of digest

### External Communication Logging (#429)
1. **Manual log entry**: Quick form to log a phone call, text, or in-person conversation with client or vendor
2. **Fields**: Date, time, contact person, method (phone/text/in-person), summary, follow-up needed (yes/no), linked job
3. **Timeline integration**: External communications appear in the unified communication timeline alongside emails and portal messages
4. **Follow-up reminders**: If follow-up flagged, create a reminder task

### AI Communication Assistant (#505)
1. **Draft client updates**: AI generates weekly client update emails based on daily log data, schedule progress, and upcoming milestones
2. **Draft RFI responses**: AI suggests RFI response based on project context and similar past RFIs
3. **Tone adjustment**: Builder can configure communication tone (professional, friendly, concise)
4. **Review before send**: All AI-drafted messages go through review/edit before sending

### Unified Communication Log
1. **Per-job communication timeline**: Single view showing all communications related to a job — internal messages, client emails, vendor emails, portal messages, logged phone calls — in chronological order
2. **Filter by participant**: Show only communications involving a specific person
3. **Search across communications**: Full-text search across all communication content
4. **Export communication log**: Export full communication history for a job as PDF (useful for disputes/legal)

### Notification Center (#529)
1. **Central inbox**: Bell icon dropdown showing all pending notifications with counts by type
2. **Mark as read/unread**: Manage notification read status
3. **Action from notification**: Click notification to navigate directly to the relevant item
4. **Bulk actions**: Mark all as read, dismiss old notifications
5. **Filter by type**: Filter notification list by category (invoices, schedule, messages, etc.)

---

## Revision History
| Date | Change |
|------|--------|
| 2026-02-11 | Added Gap Items Addressed and Additional Requirements from gap analysis sections 19, 23, 30, 32, and 34 |
| Initial | Created from batch planning |
