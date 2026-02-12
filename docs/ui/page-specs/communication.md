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
