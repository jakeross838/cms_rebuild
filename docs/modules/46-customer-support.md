# Module 46: Customer Support System

**Phase:** 6 - Scale & Sell
**Status:** SPEC COMPLETE
**Covers Gap Items:** 196-210 (Section 8: Customer Support & Help System)

---

## Overview

The Customer Support System reduces churn by ensuring builders get help exactly when and where they need it. It provides in-app contextual help, a searchable knowledge base, a ticket system with SLA tracking, live chat integration, a community forum, feedback collection for product development, and clear escalation paths from self-service through to engineering. The system also handles the unique challenge of supporting both the direct customer (the builder) and the builder's own users (clients and vendors accessing portals).

---

## Gap Items Addressed

| Gap # | Description | How Addressed |
|-------|-------------|---------------|
| 196 | Support channels: chat, email, phone, in-app, knowledge base | Multi-channel support: in-app widget, email, live chat, phone (Business+), KB |
| 197 | Support tiers: self-service -> community -> email -> phone -> dedicated CSM | Tiered support structure mapped to subscription plans |
| 198 | SLA for different severities | Configurable SLA per severity and plan tier with auto-escalation |
| 199 | Support for builder's clients using client portal | Client portal issues route to builder first; builder can escalate to platform support |
| 200 | Support for vendors using vendor portal | Same as client: vendor contacts builder; builder escalates platform issues |
| 201 | In-app contextual help ("?" on every screen) | Context-aware help widget: click "?" to see relevant articles, tooltips, video for current screen |
| 202 | Help content localization (Spanish for field users) | Knowledge base supports multiple languages; initial: English + Spanish |
| 203 | Video tutorials for each major workflow | Video library embedded in help center, linked from contextual help |
| 204 | "How do I..." questions that are really feature requests | Smart routing: support agent marks ticket as "feature_request" -> routes to product backlog |
| 205 | Community forum where builders help each other | Forum with categories, search, upvoting, "verified answer" tags, staff participation |
| 206 | Customer feature requests: collect, prioritize, communicate roadmap | Feature request portal with voting, status tracking, roadmap visibility |
| 207 | Public product roadmap (transparency vs. competitive risk) | Public roadmap with "Planned / In Progress / Shipped" categories; strategic items kept private |
| 208 | Urgent support during nights/weekends | After-hours support: P1 issues page on-call engineer; P2+ queued for next business day |
| 209 | Support escalation paths | Tier 1 (KB + chat) -> Tier 2 (technical support) -> Tier 3 (engineering) with time-based auto-escalation |
| 210 | Training requests beyond standard support | Professional services referral: complex training requests routed to paid services team |

---

## Detailed Requirements

### In-App Contextual Help (Gap #201)

- Every screen has a "?" icon in the header that opens the help panel
- Help panel shows: relevant KB articles (matched by current URL/module), tooltip definitions, "Watch Video" links
- Tooltip system: hover over any field label to see definition and usage guidance
- First-visit overlay: on first visit to any module, a brief orientation appears (dismissable, "Don't show again")
- Search within help panel returns results from KB, video library, and community forum

### Knowledge Base

- Categorized by module (Estimating, Scheduling, Invoicing, etc.) and by role (Owner, PM, Field, Admin)
- Full-text search with relevance ranking
- Articles support: text, images, annotated screenshots, embedded video, step-by-step guides
- Version-tagged articles: content updates tied to platform release versions
- Localization: English (primary), Spanish (Phase 1), additional languages as needed
- Public-facing KB (for SEO) with gated advanced content (for authenticated users)

### Ticket System

**Ticket Creation:**
- In-app: "Contact Support" button captures current URL, browser info, tenant context automatically
- Email: support@platform.com creates ticket with email parsing
- Auto-categorization based on the module the user was on when submitting

**Ticket Fields:**
- Subject, description, severity (P1-P4), category, attachments, screenshots
- Auto-captured: builder_id, user_id, user_role, current_url, browser/OS, plan_tier

**SLA Matrix:**

| Severity | Free/Starter | Professional | Business | Enterprise |
|----------|-------------|-------------|----------|------------|
| P1 (system down) | 4 hr response | 2 hr response | 1 hr response | 15 min response |
| P2 (major feature broken) | 24 hr | 8 hr | 4 hr | 1 hr |
| P3 (minor issue) | 48 hr | 24 hr | 8 hr | 4 hr |
| P4 (question/enhancement) | Best effort | 48 hr | 24 hr | 8 hr |

**Escalation Rules:**
- SLA breach -> auto-escalate to next tier
- 3+ tickets from same builder in 7 days -> flag for CS review
- P1 after hours -> page on-call engineer via PagerDuty

### Live Chat

- Chat widget integrated in-app (Intercom, Zendesk Chat, or custom)
- Business hours: live agent (for Professional+ plans)
- After hours: chatbot with KB search, creates ticket for follow-up
- Chat transcripts attached to ticket history
- Canned responses for common questions (editable by support team)

### Community Forum (Gap #205)

- Categories matching platform modules
- Builder-to-builder discussions (e.g., "How do you handle...?")
- Upvoting on questions and answers
- "Verified Answer" tag applied by staff or community moderators
- Staff participation flagged with badge
- Searchable from in-app help panel
- Reputation system for active community members

### Feature Request Portal (Gap #206)

- Builders submit feature requests with description and use case
- Other builders vote on requests (one vote per builder per request)
- Status tracking: Submitted -> Under Review -> Planned -> In Progress -> Shipped
- Notification when a voted-on feature ships
- Integration with internal product backlog (one-way sync: portal -> Jira/Linear)

### Feedback Collection (Gap #88, #89)

- Post-ticket CSAT survey (1-5 rating + optional comment)
- Quarterly NPS survey (in-app, 2-question: score + reason)
- Feature-specific micro-surveys ("How useful was this feature?" after first use)
- Feedback aggregated in Module 49 Platform Analytics

### Support for Portal Users (Gaps #199, #200)

- Client portal users see builder's support contact info (from Module 44 branding)
- Vendor portal users see builder's support contact info
- If issue is platform-related (not builder-specific), portal user can submit "Platform Issue" ticket
- Builder's admin can escalate portal user issues to platform support on their behalf

---

## Database Tables

```
support_tickets
  id              UUID PK
  builder_id      UUID FK -> builders
  user_id         UUID FK -> users
  subject         VARCHAR(300)
  description     TEXT
  severity        VARCHAR(5)  -- 'P1', 'P2', 'P3', 'P4'
  category        VARCHAR(50)  -- 'billing', 'scheduling', 'bug', 'feature_request'
  status          VARCHAR(20)  -- 'open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed'
  assigned_to     UUID NULL FK -> support_agents
  escalation_tier INT DEFAULT 1
  source          VARCHAR(20)  -- 'in_app', 'email', 'chat', 'phone'
  context_url     TEXT NULL  -- URL user was on when submitting
  context_metadata JSONB  -- browser, OS, plan tier
  sla_response_by TIMESTAMPTZ
  first_response_at TIMESTAMPTZ NULL
  resolved_at     TIMESTAMPTZ NULL
  csat_rating     INT NULL CHECK (csat_rating BETWEEN 1 AND 5)
  csat_comment    TEXT NULL
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

ticket_messages
  id              UUID PK
  ticket_id       UUID FK -> support_tickets
  sender_type     VARCHAR(10)  -- 'customer', 'agent', 'system'
  sender_id       UUID NULL
  body            TEXT
  attachments     JSONB  -- [{filename, url, size}]
  is_internal     BOOLEAN DEFAULT false  -- internal agent notes
  created_at      TIMESTAMPTZ

support_agents
  id              UUID PK
  user_id         UUID FK -> users
  display_name    VARCHAR(100)
  tier            INT  -- 1, 2, 3
  specialties     TEXT[]  -- ['billing', 'scheduling', 'integrations']
  is_available    BOOLEAN DEFAULT true
  max_active_tickets INT DEFAULT 20

kb_articles
  id              UUID PK
  slug            VARCHAR(200) UNIQUE
  title           VARCHAR(300)
  body_html       TEXT
  category        VARCHAR(50)
  module_tag      VARCHAR(50) NULL  -- maps to platform module for contextual help
  role_tags       TEXT[]  -- ['owner', 'pm', 'field', 'admin']
  language        VARCHAR(5) DEFAULT 'en'
  video_url       TEXT NULL
  view_count      INT DEFAULT 0
  helpful_count   INT DEFAULT 0
  not_helpful_count INT DEFAULT 0
  platform_version VARCHAR(20) NULL  -- version this article applies to
  is_published    BOOLEAN DEFAULT true
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

feature_requests
  id              UUID PK
  title           VARCHAR(300)
  description     TEXT
  submitted_by    UUID FK -> users
  builder_id      UUID FK -> builders
  status          VARCHAR(20)  -- 'submitted', 'under_review', 'planned', 'in_progress', 'shipped', 'declined'
  vote_count      INT DEFAULT 0
  category        VARCHAR(50)
  shipped_in_version VARCHAR(20) NULL
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

feature_request_votes
  id              UUID PK
  request_id      UUID FK -> feature_requests
  builder_id      UUID FK -> builders
  user_id         UUID FK -> users
  created_at      TIMESTAMPTZ
  UNIQUE(request_id, builder_id)

forum_posts
  id              UUID PK
  category        VARCHAR(50)
  title           VARCHAR(300)
  body            TEXT
  author_id       UUID FK -> users
  builder_id      UUID FK -> builders
  is_verified_answer BOOLEAN DEFAULT false
  upvote_count    INT DEFAULT 0
  reply_count     INT DEFAULT 0
  is_pinned       BOOLEAN DEFAULT false
  is_staff_replied BOOLEAN DEFAULT false
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

forum_replies
  id              UUID PK
  post_id         UUID FK -> forum_posts
  body            TEXT
  author_id       UUID FK -> users
  is_staff        BOOLEAN DEFAULT false
  is_verified_answer BOOLEAN DEFAULT false
  upvote_count    INT DEFAULT 0
  created_at      TIMESTAMPTZ

nps_surveys
  id              UUID PK
  builder_id      UUID FK -> builders
  user_id         UUID FK -> users
  score           INT CHECK (score BETWEEN 0 AND 10)
  reason          TEXT NULL
  survey_type     VARCHAR(20)  -- 'quarterly', 'post_onboarding', 'post_ticket'
  created_at      TIMESTAMPTZ
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/support/tickets` | List tickets for current builder |
| POST | `/api/v1/support/tickets` | Create a support ticket |
| GET | `/api/v1/support/tickets/:id` | Get ticket details and messages |
| POST | `/api/v1/support/tickets/:id/messages` | Add message to ticket |
| PUT | `/api/v1/support/tickets/:id/status` | Update ticket status |
| GET | `/api/v1/support/kb/articles` | Search knowledge base articles |
| GET | `/api/v1/support/kb/articles/:slug` | Get article content |
| GET | `/api/v1/support/kb/contextual` | Get articles for current page context |
| POST | `/api/v1/support/kb/articles/:id/feedback` | Rate article helpfulness |
| GET | `/api/v1/support/feature-requests` | List feature requests (with vote counts) |
| POST | `/api/v1/support/feature-requests` | Submit a feature request |
| POST | `/api/v1/support/feature-requests/:id/vote` | Vote for a feature request |
| GET | `/api/v1/support/forum/posts` | List forum posts |
| POST | `/api/v1/support/forum/posts` | Create a forum post |
| POST | `/api/v1/support/forum/posts/:id/replies` | Reply to a post |
| POST | `/api/v1/support/nps` | Submit NPS survey response |
| GET | `/api/v1/admin/support/dashboard` | Platform admin: support metrics dashboard |
| GET | `/api/v1/admin/support/sla-compliance` | Platform admin: SLA compliance report |

---

## Dependencies

- **Module 1: Auth & Access** -- user context for ticket creation, role-based KB filtering
- **Module 5: Notification Engine** -- ticket update notifications, NPS survey delivery
- **Module 44: White-Label** -- builder's support contact info displayed to portal users
- **Module 43: Subscription Billing** -- plan tier determines SLA and support channels
- **Module 49: Platform Analytics** -- support metrics, CSAT trends, NPS tracking
- **PagerDuty** -- P1 after-hours escalation
- **Intercom / Zendesk** -- live chat integration (or custom)

---

## Open Questions

1. Should we build the ticket system in-house or integrate with Zendesk/Intercom/Freshdesk?
2. Should community forum be built-in or use a third-party platform (Discourse, Circle)?
3. What is the staffing model for support? When do we hire dedicated support agents vs. engineering handling support?
4. Should the public product roadmap show specific timelines, or just relative priority?
5. How do we handle support in languages other than English and Spanish?
6. Should P1 after-hours support be included in all plans or only Business/Enterprise?
