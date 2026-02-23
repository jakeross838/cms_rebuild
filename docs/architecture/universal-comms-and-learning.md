# Universal Communication Hub & Expanded Self-Learning Engine
<!-- Architecture Document — RossOS -->
<!-- Created: 2026-02-23 -->
<!-- Status: APPROVED CONCEPT — Not yet built -->

## Overview

Two interconnected systems that make RossOS the single source of truth for every conversation and every lesson learned on every job.

**Universal Communication Hub**: Every message, email, call, text, and on-site conversation — from ANY platform — flows into RossOS, gets AI-processed, and updates the job automatically. Replies go back through the original channel seamlessly.

**Expanded Self-Learning Engine**: Every trade, every material, every vendor, every job generates 40+ trackable datapoints that compound into increasingly accurate predictions.

---

## Part 1: Universal Communication Hub

### The Problem
Construction communication is scattered across:
- Personal iPhones (iMessage/SMS)
- Gmail / Outlook email
- Phone calls (no record)
- On-site conversations (no record)
- WhatsApp groups
- Text threads with subs
- Slack/Teams (office)
- Paper notes, whiteboards

**Result:** Critical decisions get lost. "I told you about that on Tuesday" has no proof. AI can't learn from conversations it never sees.

### The Solution: One Inbox, Every Channel, Two-Way Sync

```
┌──────────────────────────────────────────────────────────┐
│                   UNIVERSAL INBOX                         │
│                                                          │
│  Every message. Every channel. Tagged to the right job.  │
│  AI extracts decisions, action items, and updates.       │
│  Reply from here → goes back through original channel.   │
└──────────────────────────────────────────────────────────┘
         ↑↓              ↑↓             ↑↓           ↑↓
    ┌─────────┐    ┌──────────┐   ┌──────────┐  ┌─────────┐
    │  Email   │    │ SMS/Text │   │  Phone   │  │ In-App  │
    │Gmail     │    │ iPhone   │   │  Calls   │  │Messages │
    │Outlook   │    │ Android  │   │  Voiceml │  │ RossOS  │
    │Yahoo     │    │ Twilio   │   │  Transcr │  │  Chat   │
    └─────────┘    └──────────┘   └──────────┘  └─────────┘
         ↑↓              ↑↓             ↑↓           ↑↓
    ┌─────────┐    ┌──────────┐   ┌──────────┐  ┌─────────┐
    │ WhatsApp│    │  Slack   │   │ On-Site  │  │ Client  │
    │Business │    │  Teams   │   │Recording │  │ Portal  │
    │  API    │    │ Webhooks │   │Voice→Text│  │ Messages│
    └─────────┘    └──────────┘   └──────────┘  └─────────┘
```

### Channel Integration Details

#### Email (Gmail + Outlook + Any IMAP)
**Inbound:**
- Gmail API / Microsoft Graph API watch for new emails
- Webhook fires when email arrives in connected mailbox
- AI reads email, identifies: which job, which contact, what type
- Email appears in Universal Inbox tagged to correct job
- Attachments auto-filed to job document folder

**Outbound (two-way sync):**
- User replies from RossOS Universal Inbox
- Reply sends via Gmail API / Microsoft Graph as a reply to the original thread
- Recipient sees a normal email reply — they never know it came from RossOS
- Full thread history preserved in both systems

**Setup:**
- Settings > Integrations > Email
- OAuth2 connect (Gmail, Outlook, or IMAP credentials)
- Choose which mailboxes to monitor
- AI auto-learns which emails are job-related vs personal

#### SMS / Text Messages (iPhone + Android)
**The Reality:** Apple does not expose iMessage via API. No one can programmatically read or send iMessages.

**Solution: Twilio Business Numbers**
- Each company gets a Twilio phone number (or port their existing business number)
- All business texts go through this number → captured in RossOS
- Clients and subs text the business number → appears in Universal Inbox
- Reply from RossOS → sends as SMS from that business number
- Works on both iPhone and Android — it's just SMS

**Alternative: Forward-to-Email Bridge**
- For personal phone texts that users want to capture:
- Forward text screenshot or use share sheet → emails to RossOS
- AI extracts content from the forwarded message
- Not real-time, but captures important conversations

**Mobile App Integration:**
- RossOS mobile app can be the primary texting tool
- Sends SMS via Twilio but UI feels like a native messaging app
- Push notifications for new messages
- All messages auto-captured and AI-processed

#### Phone Calls
**Inbound/Outbound via Twilio Voice:**
- Calls through RossOS business number are recorded (with consent notification)
- Real-time transcription via Whisper API or Twilio Transcription
- AI processes transcript after call ends
- Call summary, action items, and decisions extracted
- Tagged to job and contacts automatically

**Manual Logging:**
- "Log a Call" button in mobile app
- Quick form: who, which job, what was discussed
- Optional voice memo that gets transcribed

#### On-Site Conversations & Meetings
**This is the game-changer for construction:**

**Mobile App Recording:**
1. PM walks onto job site, taps "Record Conversation" in RossOS mobile app
2. Has conversation with pool contractor: "Pool permit accepted, released by county, starting excavation Monday"
3. Taps stop recording
4. Audio → Whisper API transcription (< 30 seconds)
5. AI processes transcript:

```
EXTRACTED FROM CONVERSATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Job: Henderson Residence (#2026-018)
People: Josh (ABC Pool Co.), PM Mike Torres
Type: Status Update + Decision

DECISIONS MADE:
  ✓ Pool permit accepted and released by county
  ✓ Pool excavation starting Monday (2026-02-24)

ACTION ITEMS:
  → Update schedule: Add "Pool Excavation" starting Mon 2/24
  → Notify homeowner: Pool phase beginning
  → Verify: ABC Pool Co insurance current before work starts

DOWNSTREAM UPDATES:
  → Schedule: Pool excavation task auto-added
  → Vendor record: ABC Pool Co — permit confirmed
  → Daily log: Auto-entry "Pool permit confirmed per Josh"
  → Budget: Pool line item moved from "pending" to "active"
  → Client portal: Timeline updated for homeowner
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Confirm All]  [Edit]  [Dismiss]
```

6. PM taps "Confirm All" → all downstream systems update automatically
7. If PM edits → AI learns the correction for next time

**Meeting Mode:**
- Longer recordings for office meetings, owner meetings, sub meetings
- AI generates meeting minutes with action items per person
- Each action item becomes a task assigned to the right person
- Meeting summary auto-shared with attendees

#### WhatsApp Business API
- Many subs and international vendors use WhatsApp
- WhatsApp Business API provides two-way messaging
- Messages appear in Universal Inbox
- Replies go back through WhatsApp
- Media (photos, voice messages) captured and filed

#### Slack / Microsoft Teams
- Webhook integration for office team communication
- Channel messages tagged to jobs via #job-henderson or similar
- Important messages forwarded to Universal Inbox
- Not a replacement for Slack — a bridge that captures job-relevant messages

#### Client Portal Messages
- Clients message from their RossOS portal
- Shows up in Universal Inbox for PM
- PM replies from Universal Inbox → client sees it in portal
- OR replies route through email if client prefers

### AI Processing Pipeline (Every Message, Every Channel)

```
ANY MESSAGE ARRIVES (email, text, call, recording, chat)
    │
    ▼
┌─────────────────────────────────────────────────┐
│ STEP 1: IDENTIFICATION                          │
│                                                 │
│ Who sent this?                                  │
│  → Match to contacts directory                  │
│  → Match phone/email to known contacts          │
│  → If unknown: create new contact, ask user     │
│                                                 │
│ Which job?                                      │
│  → Keywords, addresses, project names           │
│  → Contact's active jobs                        │
│  → Recent conversation context                  │
│  → If ambiguous: ask user to tag               │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────┐
│ STEP 2: CLASSIFICATION                          │
│                                                 │
│ What type of message?                           │
│  → Decision (approval, rejection, selection)    │
│  → Question (needs response — creates task)     │
│  → Status update (progress, completion, delay)  │
│  → Request (change order, scheduling, info)     │
│  → Complaint (quality, timeline, communication) │
│  → Financial (pricing, payment, invoice)        │
│  → Approval (sign-off, go-ahead, confirmation)  │
│  → Social (thank you, greeting — no action)     │
│                                                 │
│ Urgency?                                        │
│  → Critical: Safety, legal, financial emergency │
│  → High: Deadline-sensitive, blocking work      │
│  → Normal: Standard communication              │
│  → Low: FYI, no action needed                  │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────┐
│ STEP 3: EXTRACTION                              │
│                                                 │
│ Decisions made:                                 │
│  "Owner approved the Viking appliance upgrade"  │
│  → Change order status: APPROVED                │
│  → Budget: +$8,200 committed                    │
│                                                 │
│ Dates mentioned:                                │
│  "Starting excavation Monday"                   │
│  → Schedule: Add task for Monday 2/24           │
│                                                 │
│ Money mentioned:                                │
│  "$4,200 for the additional electrical"         │
│  → Change order draft: $4,200                   │
│                                                 │
│ Action items:                                   │
│  "Send me the tile samples by Friday"           │
│  → Task: PM to send tile samples, due Friday    │
│                                                 │
│ Approvals:                                      │
│  "Go ahead with the marble counters"            │
│  → Selection: Marble counters → APPROVED        │
│                                                 │
│ Commitments:                                    │
│  "We'll have the crew there at 7am"             │
│  → Vendor commitment logged for tracking        │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────┐
│ STEP 4: DOWNSTREAM UPDATES (with confirmation)  │
│                                                 │
│ AI proposes updates → User confirms or edits:   │
│                                                 │
│ → Schedule: Tasks added/updated                 │
│ → Budget: Line items adjusted                   │
│ → Change Orders: Created or status updated      │
│ → Selections: Marked as approved/rejected       │
│ → Vendor Record: Commitments logged             │
│ → Daily Log: Auto-entry added                   │
│ → Client Portal: Timeline/status updated        │
│ → Tasks: Action items assigned to people        │
│ → RFIs: Questions converted to RFI if needed    │
│ → Punch List: Issues added if quality complaint │
│ → Risk Register: Risks flagged if detected      │
│                                                 │
│ Everything requires user confirmation.           │
│ AI NEVER auto-commits without approval.          │
│ But it does all the work — user just confirms.   │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────┐
│ STEP 5: LEARNING                                │
│                                                 │
│ User confirmed → AI records the pattern         │
│ User edited → AI learns the correction          │
│ User dismissed → AI reduces future confidence   │
│                                                 │
│ Over time:                                      │
│ → Better job tagging (knows Josh = pool guy)    │
│ → Better extraction (knows your terminology)    │
│ → Better urgency detection (knows your style)   │
│ → Better action items (knows your workflow)     │
└─────────────────────────────────────────────────┘
```

### Universal Inbox UI

```
┌─────────────────────────────────────────────────────────────┐
│ Universal Inbox                    🔍 Search  [Compose ▾]  │
├──────────┬──────────────────────────────────────────────────┤
│ FILTERS  │  ┌─ Josh (ABC Pool Co) ──── SMS ──── 10:42am ─┐│
│          │  │ Pool permit accepted, starting Monday.       ││
│ All      │  │ 📌 Henderson Residence  🟢 Confirmed        ││
│ Email    │  │ AI: Schedule updated, owner notified         ││
│ SMS      │  └──────────────────────────────────────────────┘│
│ Calls    │  ┌─ Sarah Chen (Homeowner) ─ Email ── 10:15am ─┐│
│ Meetings │  │ RE: Tile selection for master bath           ││
│ On-Site  │  │ "Go ahead with the Calacatta marble"        ││
│ Portal   │  │ 📌 Chen Residence  ⚡ Decision: Selection    ││
│          │  │ AI: Selection approved, PO ready to send     ││
│ ──────── │  └──────────────────────────────────────────────┘│
│ BY JOB:  │  ┌─ Mike Torres (PM) ──── Recording ── 9:30am ─┐│
│ Henderson│  │ On-site meeting with framing crew            ││
│ Chen     │  │ 📌 Smith Residence  📋 3 action items        ││
│ Smith    │  │ AI: Meeting minutes generated, tasks assigned││
│ Davis    │  └──────────────────────────────────────────────┘│
│          │  ┌─ Tom (Elite Framers) ─── Call ──── 9:05am ──┐│
│ BY TYPE: │  │ Voicemail: "Running 2 hours late, traffic"   ││
│ Decisions│  │ 📌 Smith Residence  ⏰ Schedule impact        ││
│ Questions│  │ AI: Schedule note added, crew notified       ││
│ Updates  │  └──────────────────────────────────────────────┘│
│ Approvals│                                                  │
│ Urgent   │  [Load more...]                                 │
└──────────┴──────────────────────────────────────────────────┘
```

### How Others Connect to It

**For your team (employees):**
1. Download RossOS mobile app
2. Link their email (OAuth2 — one click for Gmail/Outlook)
3. Optionally link their phone via Twilio forwarding
4. All job-related communications auto-captured

**For clients (homeowners):**
1. Receive invite to Client Portal
2. Can message from portal (preferred — everything captured)
3. OR their emails to the PM are captured via PM's linked email
4. Never need to install anything — just use their normal email

**For vendors/subs:**
1. Receive invite to Vendor Portal
2. Can message from portal (everything captured)
3. OR text/email the business Twilio number / company email
4. Their texts and emails auto-captured and tagged to job
5. Never need to change their behavior — RossOS adapts to them

**The key insight: You don't force anyone onto a new platform. RossOS wraps AROUND their existing tools.**

---

## Part 2: Expanded Self-Learning Engine

### Current State: ~15 metrics per trade
### Target State: 40+ metrics per trade, with cross-referencing

### Per-Trade Instance Metrics (Every Time a Trade Works on a Job)

#### Financial Accuracy (10 metrics)
| # | Metric | What It Tracks | Learns |
|---|--------|---------------|--------|
| 1 | Bid vs Actual Cost | Total bid amount vs final invoiced amount | Estimate accuracy per trade |
| 2 | Material Bid vs Actual | Material portion accuracy | Material estimating calibration |
| 3 | Labor Bid vs Actual | Labor portion accuracy | Labor rate calibration |
| 4 | Change Order Frequency | # of COs per trade per job | Scope completeness |
| 5 | Change Order Value | Total CO $ per trade per job | Bid thoroughness |
| 6 | Waste Factor (Est vs Actual) | Estimated waste % vs actual waste % | Waste prediction |
| 7 | Unit Price Accuracy | $/SF, $/LF, $/unit accuracy | Unit cost database |
| 8 | Markup Realization | Planned margin vs actual margin | Pricing strategy |
| 9 | Payment Speed | Days from invoice to payment | Cash flow prediction |
| 10 | Back-charge Frequency | # of back-charges to this sub | Quality cost |

#### Schedule Performance (8 metrics)
| # | Metric | What It Tracks | Learns |
|---|--------|---------------|--------|
| 11 | Estimated Duration vs Actual | Days estimated vs days taken | Duration prediction |
| 12 | Start Date Reliability | Showed up on scheduled day? Y/N | Scheduling buffer needs |
| 13 | Daily Production Rate | Units completed per day | Crew speed |
| 14 | Weather Impact Days | # days lost to weather for this trade | Weather sensitivity |
| 15 | Prerequisite Wait Time | Hours/days waiting for prior trade | Handoff optimization |
| 16 | Overtime Hours | Regular vs overtime hours | True labor cost |
| 17 | Schedule Recovery Rate | How fast they catch up after delay | Recovery planning |
| 18 | Crew Size vs Productivity | More people ≠ more output? | Optimal crew sizing |

#### Quality (8 metrics)
| # | Metric | What It Tracks | Learns |
|---|--------|---------------|--------|
| 19 | First-Time Quality (FTQ) % | Items passing inspection first time | Sub quality prediction |
| 20 | Punch List Items | # of punch items per trade | Expected rework |
| 21 | Callback Rate (1yr) | Warranty callbacks in first year | Long-term quality |
| 22 | Inspection Pass Rate | % of inspections passed first attempt | Code compliance |
| 23 | Rework Events | # of tear-out-and-redo incidents | Serious quality issues |
| 24 | Rework Cost | $ spent on rework | Quality cost impact |
| 25 | Photo Documentation Score | % of work photographed before cover-up | Documentation compliance |
| 26 | Defect Severity | Minor/Moderate/Major/Critical defects | Risk assessment |

#### Communication & Professionalism (7 metrics)
| # | Metric | What It Tracks | Learns |
|---|--------|---------------|--------|
| 27 | Response Time (avg) | Hours to respond to messages | Reliability |
| 28 | Change Order Response Time | Days to return CO pricing | Responsiveness |
| 29 | RFI Turnaround | Days to answer RFIs | Technical responsiveness |
| 30 | Documentation Completeness | Submittals, warranties, certs on file | Professionalism |
| 31 | Meeting Attendance | % of scheduled meetings attended | Engagement |
| 32 | Issue Escalation Rate | % of issues escalated to PM | Self-sufficiency |
| 33 | Client Complaint Rate | # of homeowner complaints about this trade | Client-facing quality |

#### Safety & Compliance (5 metrics)
| # | Metric | What It Tracks | Learns |
|---|--------|---------------|--------|
| 34 | Safety Incidents | # of incidents on their watch | Safety culture |
| 35 | Insurance Current | Auto-tracked COI expiry | Compliance reliability |
| 36 | License Current | Auto-tracked license status | Compliance reliability |
| 37 | OSHA Violations | # of violations observed | Safety risk |
| 38 | Cleanup Score | Job site condition after their work | Professionalism |

#### Contextual Tags (variable)
| # | Tag Type | Examples | Learns |
|---|----------|---------|--------|
| 39 | Project Type | New construction, remodel, addition, commercial | Performance by project type |
| 40 | Complexity | Simple, standard, complex, custom | Skill match |
| 41 | Price Range | $0-500K, $500K-$1M, $1M-$2M, $2M-$5M, $5M+ | Scale capability |
| 42 | Region | Coastal, inland, urban, rural | Regional expertise |
| 43 | Season | Spring, summer, fall, winter | Seasonal patterns |
| 44 | Crew Lead | Which foreman was on this job | Individual performance |
| 45 | Material Brands | Which products they installed | Brand expertise |

### Per-Material Metrics (Every Product/Material Used)

| # | Metric | What It Tracks |
|---|--------|---------------|
| 1 | Price per unit (over time) | Price trend tracking |
| 2 | Lead time (quoted vs actual) | Delivery reliability |
| 3 | Defect rate | Product quality |
| 4 | Return rate | Product fit |
| 5 | Waste factor (est vs actual) | Ordering accuracy |
| 6 | Vendor reliability per material | Best source per product |
| 7 | Regional price variance | Local market intelligence |
| 8 | Seasonal price patterns | Buy timing optimization |
| 9 | Substitution success rate | Alternative track record |
| 10 | Client satisfaction per product | Selection guidance |
| 11 | Warranty claim rate | Long-term durability |
| 12 | Installation difficulty rating | Labor impact |

### Per-Job Aggregate Metrics

| # | Metric | What It Tracks |
|---|--------|---------------|
| 1 | Overall budget accuracy | Estimated total vs actual total |
| 2 | Schedule accuracy | Planned duration vs actual |
| 3 | Change order ratio | CO total / contract value |
| 4 | Client satisfaction score | Post-project survey |
| 5 | Warranty claim count (1yr) | Post-completion quality |
| 6 | Profit margin realized | Planned vs actual margin |
| 7 | Communication volume | Total messages per job |
| 8 | Decision turnaround | Avg days from question to answer |
| 9 | Document completeness | % of required docs on file |
| 10 | AI prediction accuracy | How right was the AI on this job? |

### How All This Data Flows Between AI Agents

```
                    ┌──────────────────────┐
                    │   TRADE INTUITION    │
                    │   (Master Engine)    │
                    │                      │
                    │ Receives ALL metrics │
                    │ from ALL modules     │
                    │ Validates ALL        │
                    │ decisions through    │
                    │ 7 layers             │
                    └──────────┬───────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
   │  ESTIMATING   │  │  SCHEDULING   │  │   BIDDING     │
   │     AI        │  │     AI        │  │     AI        │
   │               │  │               │  │               │
   │ Learns from:  │  │ Learns from:  │  │ Learns from:  │
   │ • Bid vs      │  │ • Duration    │  │ • Vendor      │
   │   actual cost │  │   accuracy    │  │   performance │
   │ • Waste       │  │ • Weather     │  │ • FTQ scores  │
   │   factors     │  │   impact      │  │ • Price       │
   │ • Material    │  │ • Crew speed  │  │   history     │
   │   prices      │  │ • Handoff     │  │ • Scope gap   │
   │ • Labor rates │  │   delays      │  │   patterns    │
   └───────┬───────┘  └───────┬───────┘  └───────┬───────┘
           │                   │                   │
           └───────────────────┼───────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  COMMUNICATION AI    │
                    │                      │
                    │ Processes ALL comms  │
                    │ Extracts decisions   │
                    │ Feeds ALL other AIs  │
                    │ with real-time data  │
                    └──────────────────────┘
```

### Concrete Example: Full Learning Loop

**Job: Henderson Residence — Pool Phase**

1. **Bidding AI** selected ABC Pool Co (scored 87/100, best value from 3 bids)

2. **Communication**: Josh from ABC Pool texts "Permit accepted, starting Monday"
   → AI updates schedule, notifies team, logs to daily log

3. **Field**: Pool excavation starts Monday. Daily log: "Excavation began at 8am, hitting rock at 4ft"
   → **Schedule AI**: Flags potential 2-day delay (rock removal)
   → **Budget AI**: Estimates +$3,500 for rock removal
   → **Trade Intuition**: Checks if rock impacts pool shell design

4. **Communication**: PM calls structural engineer, records conversation
   → AI extracts: "Engineer says rock is fine, excavate around it, no design change"
   → Schedule updated, budget note added, risk downgraded

5. **Completion**: Pool phase finishes 3 days late, $4,100 over bid
   → **Estimating AI**: Updates pool excavation estimate +15% for coastal sites with rock risk
   → **Scheduling AI**: ABC Pool Co duration model updated (add 3 days for coastal)
   → **Bidding AI**: ABC Pool Co score adjusted (schedule -3pts, but handled rock well +2pts)
   → **Vendor Record**: "Rock encountered, handled professionally, 3 day delay, $4,100 over"
   → **Community Learning**: Anonymous pattern shared — coastal pool excavation rock risk

6. **Next coastal pool job**: AI now warns "High probability of subsurface rock based on proximity to Henderson site. Budget +15%, schedule +3 days buffer. ABC Pool Co has experience with this — recommend them."

---

## Part 3: Database Schema Additions

### Communication Tables

```sql
-- Universal message store
CREATE TABLE universal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID REFERENCES jobs(id),

  -- Source channel
  channel TEXT NOT NULL, -- 'email', 'sms', 'call', 'recording', 'portal', 'whatsapp', 'slack', 'internal'
  direction TEXT NOT NULL, -- 'inbound', 'outbound'
  external_id TEXT, -- Original message ID in source system
  thread_id TEXT, -- Conversation thread grouping

  -- People
  sender_contact_id UUID REFERENCES contacts(id),
  sender_name TEXT,
  sender_address TEXT, -- email, phone, etc.
  recipient_addresses JSONB, -- array of recipients

  -- Content
  subject TEXT,
  body TEXT,
  body_html TEXT,
  attachments JSONB, -- [{name, size, type, storage_path}]

  -- AI Processing
  ai_processed BOOLEAN DEFAULT false,
  ai_classification TEXT, -- 'decision', 'question', 'update', 'request', 'approval', etc.
  ai_urgency TEXT DEFAULT 'normal', -- 'critical', 'high', 'normal', 'low'
  ai_extracted_decisions JSONB, -- [{decision, confidence}]
  ai_extracted_actions JSONB, -- [{action, assignee, due_date}]
  ai_extracted_dates JSONB, -- [{date, context}]
  ai_extracted_amounts JSONB, -- [{amount, context}]
  ai_confidence DECIMAL(3,2),
  ai_job_match_confidence DECIMAL(3,2),

  -- User confirmation
  user_confirmed BOOLEAN DEFAULT false,
  user_edited BOOLEAN DEFAULT false,
  user_edits JSONB, -- What the user changed (for learning)

  -- Metadata
  received_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Downstream updates triggered by messages
CREATE TABLE message_downstream_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES universal_messages(id),
  target_module TEXT NOT NULL, -- 'schedule', 'budget', 'change_order', 'selection', etc.
  target_record_id UUID,
  update_type TEXT NOT NULL, -- 'create', 'update', 'status_change'
  update_data JSONB NOT NULL,
  status TEXT DEFAULT 'proposed', -- 'proposed', 'confirmed', 'rejected', 'auto_applied'
  confirmed_by UUID REFERENCES users(id),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Channel connections per user
CREATE TABLE channel_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID NOT NULL REFERENCES users(id),
  channel TEXT NOT NULL, -- 'gmail', 'outlook', 'twilio_sms', 'whatsapp', 'slack'
  credentials_encrypted JSONB, -- OAuth tokens, API keys (encrypted)
  config JSONB, -- Channel-specific settings
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Expanded Learning Tables

```sql
-- Per-trade-instance metrics (every time a trade works on a job)
CREATE TABLE trade_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  trade_category TEXT NOT NULL, -- 'framing', 'electrical', 'plumbing', etc.

  -- Financial Accuracy (10 metrics)
  bid_amount DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  material_bid DECIMAL(12,2),
  material_actual DECIMAL(12,2),
  labor_bid DECIMAL(12,2),
  labor_actual DECIMAL(12,2),
  change_order_count INTEGER DEFAULT 0,
  change_order_total DECIMAL(12,2) DEFAULT 0,
  waste_factor_estimated DECIMAL(5,2),
  waste_factor_actual DECIMAL(5,2),
  backcharge_count INTEGER DEFAULT 0,
  backcharge_total DECIMAL(12,2) DEFAULT 0,

  -- Schedule Performance (8 metrics)
  duration_estimated_days INTEGER,
  duration_actual_days INTEGER,
  start_date_on_time BOOLEAN,
  daily_production_rate DECIMAL(10,2), -- units per day
  weather_impact_days INTEGER DEFAULT 0,
  prerequisite_wait_hours DECIMAL(6,1) DEFAULT 0,
  overtime_hours DECIMAL(6,1) DEFAULT 0,
  crew_size_avg DECIMAL(4,1),

  -- Quality (8 metrics)
  ftq_percentage DECIMAL(5,2), -- first-time quality
  punch_list_items INTEGER DEFAULT 0,
  callback_count_1yr INTEGER DEFAULT 0,
  inspection_pass_rate DECIMAL(5,2),
  rework_events INTEGER DEFAULT 0,
  rework_cost DECIMAL(12,2) DEFAULT 0,
  photo_documentation_score DECIMAL(5,2),
  defect_severity_max TEXT, -- 'minor', 'moderate', 'major', 'critical'

  -- Communication (7 metrics)
  avg_response_time_hours DECIMAL(6,1),
  co_response_time_days DECIMAL(4,1),
  rfi_turnaround_days DECIMAL(4,1),
  documentation_completeness DECIMAL(5,2),
  meeting_attendance_rate DECIMAL(5,2),
  issue_escalation_rate DECIMAL(5,2),
  client_complaint_count INTEGER DEFAULT 0,

  -- Safety (5 metrics)
  safety_incidents INTEGER DEFAULT 0,
  insurance_current BOOLEAN DEFAULT true,
  license_current BOOLEAN DEFAULT true,
  osha_violations INTEGER DEFAULT 0,
  cleanup_score DECIMAL(3,1), -- 1-10

  -- Contextual Tags
  project_type TEXT, -- 'new_construction', 'remodel', 'addition', etc.
  complexity TEXT, -- 'simple', 'standard', 'complex', 'custom'
  price_range TEXT, -- '$0-500K', '$500K-$1M', etc.
  region TEXT,
  season TEXT,
  crew_lead TEXT,
  material_brands JSONB, -- Array of brands used

  -- AI Learning
  ai_predicted_cost DECIMAL(12,2),
  ai_predicted_duration INTEGER,
  ai_predicted_ftq DECIMAL(5,2),
  prediction_accuracy_cost DECIMAL(5,2),
  prediction_accuracy_duration DECIMAL(5,2),
  prediction_accuracy_quality DECIMAL(5,2),

  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Material tracking with expanded metrics
CREATE TABLE material_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID REFERENCES jobs(id),
  material_name TEXT NOT NULL,
  material_canonical_id UUID, -- normalized material reference
  vendor_id UUID REFERENCES vendors(id),

  -- Core metrics
  unit_price DECIMAL(12,4),
  unit_type TEXT, -- 'SF', 'LF', 'EA', 'CY', etc.
  quantity_ordered DECIMAL(12,2),
  quantity_used DECIMAL(12,2),
  waste_percentage DECIMAL(5,2),

  -- Delivery
  lead_time_quoted_days INTEGER,
  lead_time_actual_days INTEGER,
  delivered_on_time BOOLEAN,

  -- Quality
  defect_rate DECIMAL(5,2),
  return_rate DECIMAL(5,2),
  client_satisfaction INTEGER, -- 1-5
  warranty_claims INTEGER DEFAULT 0,
  installation_difficulty INTEGER, -- 1-5

  -- Context
  brand TEXT,
  model TEXT,
  region TEXT,
  season TEXT,
  substitution_for TEXT, -- If this was a substitution, what was the original?
  substitution_success BOOLEAN,

  recorded_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Part 4: Implementation Roadmap

### Phase 1: Foundation (Module 02 + Module 05)
- Feature flag system (controls what's visible)
- Notification engine (in-app alerts)
- Internal messaging (RossOS-to-RossOS chat)
- Basic metric tracking (bid vs actual, duration vs actual)

### Phase 2: Email Integration
- Gmail OAuth2 + Microsoft Graph API
- Inbound email capture and AI processing
- Two-way email sync (reply from RossOS → back to email)
- AI job tagging and decision extraction
- Expanded trade metrics (20+ per instance)

### Phase 3: SMS + Voice
- Twilio phone numbers per company
- SMS two-way sync
- Call recording + Whisper transcription
- On-site conversation recording via mobile app
- Full 45-metric trade tracking

### Phase 4: Full Universal Hub
- WhatsApp Business API
- Slack/Teams bridges
- Client Portal messaging
- Vendor Portal messaging
- Meeting mode with auto-minutes
- Cross-module learning at full capacity

### Phase 5: Community Learning
- Anonymous pattern sharing infrastructure
- Regional benchmarking
- Cold-start → warm-start transition
- Platform-wide anomaly detection

---

## Key Design Principles

1. **Never force anyone onto a new platform** — RossOS wraps around existing tools
2. **AI proposes, human confirms** — No auto-commits without explicit approval
3. **Every correction teaches** — Dismissed, edited, or confirmed all train the AI
4. **Privacy first** — Community learning is always anonymous, always opt-in
5. **Graceful degradation** — System works without any channel connected, gets better with each one
6. **One conversation, many views** — Same thread visible in Universal Inbox, job page, daily log, vendor record
