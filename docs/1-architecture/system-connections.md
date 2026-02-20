# RossOS - System Connections Map

## Executive Summary

This document maps every connection point in the construction management system - showing how data flows between modules, what triggers what, and how AI enhances each interaction. Understanding these connections is critical for building a cohesive, efficient system.

---

## 1. Master Data Flow Diagram

```
                                    ┌─────────────────────────────────────────────────────────────────┐
                                    │                       ROSSOS                            │
                                    │                    SYSTEM CONNECTIONS MAP                       │
                                    └─────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
   │                                              EXTERNAL INTEGRATIONS                                              │
   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
   │  │QuickBooks│  │  Xero    │  │ Procore  │  │  Slack   │  │ Twilio   │  │ SendGrid │  │ Stripe   │              │
   │  │ (Acct)   │  │ (Acct)   │  │ (PM)     │  │ (Notify) │  │ (SMS)    │  │ (Email)  │  │ (Billing)│              │
   │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
   └───────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼───────────────┘
           │              │              │              │              │              │              │
           └──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
                                                       │
                                                       ▼
   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
   │                                              AI PROCESSING LAYER                                                │
   │                                                                                                                 │
   │    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
   │    │  Document OCR   │  │ Entity Extract  │  │ Cost Prediction │  │ Pattern Learn   │  │ Anomaly Detect  │     │
   │    │  (Claude API)   │  │ (Claude API)    │  │ (ML Model)      │  │ (Feedback Loop) │  │ (ML Model)      │     │
   │    └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘     │
   │             └──────────────────────────────────────────┼────────────────────────────────────────┘               │
   │                                                        │                                                        │
   └────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────┘
                                                            │
                                                            ▼
   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
   │                                                                                                                 │
   │     SALES               PRE-CON              EXECUTION           FINANCIAL           CLOSEOUT                  │
   │  ┌──────────┐        ┌──────────┐         ┌──────────┐        ┌──────────┐        ┌──────────┐                 │
   │  │  LEADS   │──────▶ │ESTIMATES │───────▶ │   JOBS   │───────▶│ INVOICES │───────▶│ WARRANTY │                 │
   │  └────┬─────┘        └────┬─────┘         └────┬─────┘        └────┬─────┘        └────┬─────┘                 │
   │       │                   │                    │                   │                   │                        │
   │       ▼                   ▼                    ▼                   ▼                   ▼                        │
   │  ┌──────────┐        ┌──────────┐         ┌──────────┐        ┌──────────┐        ┌──────────┐                 │
   │  │ CLIENTS  │◀───────│PROPOSALS │         │ SCHEDULE │        │   POS    │        │PUNCH LIST│                 │
   │  └──────────┘        └────┬─────┘         └────┬─────┘        └────┬─────┘        └────┬─────┘                 │
   │                           │                    │                   │                   │                        │
   │                           ▼                    ▼                   ▼                   ▼                        │
   │                      ┌──────────┐         ┌──────────┐        ┌──────────┐        ┌──────────┐                 │
   │                      │CONTRACTS │◀────────│DAILY LOGS│        │  DRAWS   │        │FINAL DOCS│                 │
   │                      └────┬─────┘         └────┬─────┘        └──────────┘        └──────────┘                 │
   │                           │                    │                                                                │
   │                           ▼                    ▼                                                                │
   │                      ┌──────────┐         ┌──────────┐        ┌──────────┐        ┌──────────┐                 │
   │                      │  BUDGET  │◀────────│  PHOTOS  │        │  TASKS   │        │  FILES   │                 │
   │                      └──────────┘         └──────────┘        └──────────┘        └──────────┘                 │
   │                                                                                                                 │
   └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                            │
                                                            ▼
   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
   │                                              SHARED SERVICES                                                    │
   │                                                                                                                 │
   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
   │  │ VENDORS  │  │COST CODES│  │TEMPLATES │  │  USERS   │  │  ROLES   │  │ COMMENTS │  │  SEARCH  │              │
   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘              │
   │                                                                                                                 │
   └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Module Connection Matrix

### 2.1 LEADS Module Connections

| Connects To | Trigger | Data Flow | AI Enhancement |
|-------------|---------|-----------|----------------|
| **Clients** | Lead converts | Create client from lead data | Auto-populate from similar clients |
| **Estimates** | User clicks "Create Estimate" | Lead info pre-fills estimate | Suggest estimate template based on lead type |
| **Tasks** | Lead assigned | Create follow-up tasks | AI suggests optimal follow-up timing |
| **Communications** | Any interaction | Log all emails/calls | Auto-summarize communication history |
| **Files** | Documents attached | Store to lead folder | AI categorize document type |
| **Reports** | Pipeline analytics | Aggregate lead metrics | Predict conversion probability |

**Lead → Estimate → Proposal Flow:**
```
Lead Created
    │
    ├──▶ AI extracts project details from lead notes
    │
    ▼
Create Estimate
    │
    ├──▶ AI suggests cost codes based on project type
    ├──▶ AI pulls historical costs for similar projects
    │
    ▼
Generate Proposal
    │
    ├──▶ AI formats proposal using company template
    ├──▶ AI suggests competitive pricing adjustments
    │
    ▼
Send to Client
    │
    ├──▶ Email via SendGrid with tracking
    ├──▶ AI drafts follow-up email schedule
    │
    ▼
Client Signs → Convert to Contract
```

### 2.2 ESTIMATES Module Connections

| Connects To | Trigger | Data Flow | AI Enhancement |
|-------------|---------|-----------|----------------|
| **Leads** | Source reference | Pull lead info | - |
| **Proposals** | Generate proposal | Estimate becomes proposal content | AI formats for client presentation |
| **Contracts** | Client accepts | Proposal becomes contract | Auto-generate contract from template |
| **Budget** | Contract signed | Estimate → Budget lines | AI adjusts for market conditions |
| **Cost Codes** | Line items | Reference cost code hierarchy | Suggest codes based on description |
| **Vendors** | Material lookups | Get vendor pricing | AI finds best vendor for each item |
| **Templates** | Create estimate | Pull template assemblies | Suggest templates based on project type |

**Estimate AI Enhancement Flow:**
```
User Creates Estimate
    │
    ├──▶ AI suggests assemblies based on project type
    │    (e.g., "Custom Home 3000sqft" → Foundation, Framing, etc.)
    │
    ├──▶ AI pulls historical costs from past jobs
    │    - Same cost code
    │    - Same vendor
    │    - Adjusted for inflation
    │
    ├──▶ AI identifies missing scope items
    │    "Similar projects also included: Pool, Landscaping, Irrigation"
    │
    ├──▶ AI suggests markup based on:
    │    - Current backlog
    │    - Project complexity
    │    - Client relationship
    │    - Market conditions
    │
    ▼
Estimate Ready for Review
```

### 2.3 JOBS Module Connections

| Connects To | Trigger | Data Flow | AI Enhancement |
|-------------|---------|-----------|----------------|
| **Contracts** | Job created | Contract linked to job | - |
| **Budget** | Job created | Initialize budget from contract | AI monitors budget vs. actual |
| **Schedule** | Job created | Create schedule template | AI suggests task durations |
| **Invoices** | Invoice uploaded | Link to job | AI extracts job reference |
| **POs** | PO created | Associate with job | Auto-fill job defaults |
| **Daily Logs** | Log submitted | Attach to job | AI summarizes progress |
| **Photos** | Photo uploaded | Organize by job | AI tags photo location/phase |
| **Files** | Document uploaded | Store in job folder | AI categorize document |
| **Tasks** | Task created | Assign to job | AI prioritize based on schedule |
| **Change Orders** | CO created | Track against budget | AI calculate impact |
| **Draws** | Draw created | Compile from invoices | AI verify completeness |
| **Reports** | Dashboard request | Aggregate job metrics | AI identify concerns |
| **Vendors** | Work assigned | Track vendor by job | AI rate vendor performance |
| **Cost Codes** | Cost tracking | Allocate costs | AI detect miscoding |
| **Clients** | Owner association | Client sees portal | - |

**Job Lifecycle Connections:**
```
Contract Signed
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              JOB CREATED                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Auto-Create:                                                               │
│  ├── Budget (from contract/estimate)                                        │
│  ├── Schedule (from template)                                               │
│  ├── File Folders (standard structure)                                      │
│  ├── Task List (initial milestones)                                        │
│  └── Client Portal Access                                                   │
│                                                                             │
│  AI Actions:                                                                │
│  ├── Analyze contract for key dates                                        │
│  ├── Identify similar past projects                                        │
│  ├── Predict potential risks                                               │
│  └── Suggest vendor assignments                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
    │
    ▼
Active Construction
    │
    ├──▶ Daily Logs → AI Progress Analysis
    ├──▶ Invoices → AI Cost Tracking
    ├──▶ Schedule → AI Delay Detection
    ├──▶ Photos → AI Progress Documentation
    │
    ▼
Project Closeout
    │
    ├──▶ Punch List → AI Deficiency Tracking
    ├──▶ Final Docs → AI Compliance Check
    ├──▶ Warranty → AI Expiration Reminders
    │
    ▼
Job Complete
```

### 2.4 INVOICES Module Connections

| Connects To | Trigger | Data Flow | AI Enhancement |
|-------------|---------|-----------|----------------|
| **Jobs** | Invoice uploaded | Link to job | AI extract job reference |
| **Vendors** | Invoice processed | Link to vendor | AI match vendor name |
| **Cost Codes** | Allocation | Distribute amount | AI suggest allocation |
| **POs** | PO matching | Link invoice to PO | AI match PO number |
| **Draws** | Add to draw | Include in payment request | AI verify inclusion |
| **Budget** | Cost tracking | Update actuals | AI compare to budget |
| **Files** | PDF storage | Store stamped PDF | - |
| **Approvals** | Workflow | Route for approval | AI prioritize by due date |
| **QuickBooks/Xero** | Sync | Export to accounting | AI map accounts |
| **Notifications** | Status change | Alert users | AI determine urgency |

**Invoice Processing AI Pipeline:**
```
Invoice Uploaded (PDF/Image)
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI DOCUMENT PROCESSING                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. OCR/Text Extraction                                                     │
│     └── Extract all text from document                                      │
│                                                                             │
│  2. Entity Recognition (Claude API)                                         │
│     ├── Vendor Name → Match to vendor database                              │
│     ├── Invoice Number → Check for duplicates                               │
│     ├── Invoice Date → Parse date format                                    │
│     ├── Due Date → Calculate payment terms                                  │
│     ├── Line Items → Extract descriptions and amounts                       │
│     ├── Total Amount → Validate against line items                          │
│     ├── Job Reference → Match to active jobs                                │
│     └── PO Reference → Match to open POs                                    │
│                                                                             │
│  3. Confidence Scoring                                                      │
│     ├── > 95% → Auto-approve with validation                                │
│     ├── 80-95% → Human review suggested                                     │
│     └── < 80% → Manual entry required                                       │
│                                                                             │
│  4. Cost Code Allocation (AI)                                               │
│     ├── Learn from user corrections                                         │
│     ├── Match line item descriptions to cost codes                          │
│     └── Apply company-specific rules                                        │
│                                                                             │
│  5. PO Matching (AI)                                                        │
│     ├── Match vendor + job + amount range                                   │
│     ├── Validate PO has remaining balance                                   │
│     └── Flag if no matching PO                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
    │
    ▼
Invoice Ready for Approval
    │
    ├──▶ Route based on amount thresholds
    ├──▶ Notify approvers via Slack/Email/SMS
    │
    ▼
Invoice Approved
    │
    ├──▶ PDF Stamped with approval metadata
    ├──▶ Added to next draw
    ├──▶ Sync to QuickBooks/Xero
    │
    ▼
Payment Tracked
```

### 2.5 PURCHASE ORDERS Module Connections

| Connects To | Trigger | Data Flow | AI Enhancement |
|-------------|---------|-----------|----------------|
| **Jobs** | PO created | Link to job | Auto-fill from job |
| **Vendors** | PO created | Assign vendor | AI suggest best vendor |
| **Budget** | PO created | Reserve budget | AI check availability |
| **Cost Codes** | Line items | Allocate costs | AI suggest codes |
| **Invoices** | Invoice matched | Link invoices | AI auto-match |
| **Change Orders** | CO created | Modify PO | Track changes |
| **Files** | PDF generation | Store PO PDF | - |
| **Notifications** | PO issued | Alert vendor | Email/SMS |
| **QuickBooks/Xero** | Sync | Export to accounting | AI map accounts |

**PO → Invoice → Payment Flow:**
```
PO Created
    │
    ├──▶ Budget allocation reserved
    ├──▶ Vendor notified
    │
    ▼
Work Performed
    │
    ├──▶ Daily logs reference PO work
    │
    ▼
Invoice Received
    │
    ├──▶ AI matches to PO
    ├──▶ Validates against PO balance
    ├──▶ Flags if over PO amount
    │
    ▼
Invoice Approved
    │
    ├──▶ PO remaining balance updated
    ├──▶ Cost codes updated
    │
    ▼
Added to Draw
    │
    ├──▶ Invoice included in payment request
    │
    ▼
Draw Funded
    │
    ├──▶ Invoice marked as paid
    ├──▶ PO status updated
    │
    ▼
PO Closed (when fully invoiced)
```

### 2.6 DRAWS Module Connections

| Connects To | Trigger | Data Flow | AI Enhancement |
|-------------|---------|-----------|----------------|
| **Jobs** | Draw created | Link to job | - |
| **Invoices** | Compilation | Include approved invoices | AI verify completeness |
| **Budget** | Draw amount | Track against budget | AI project remaining |
| **Change Orders** | Include COs | Add approved COs | - |
| **Files** | G702/G703 | Generate draw docs | AI format for lender |
| **Notifications** | Status change | Alert stakeholders | - |
| **Lien Releases** | Release required | Generate from vendors | AI track receipt |
| **Retainage** | Calculation | Apply retainage | AI verify terms |

**Draw Compilation AI:**
```
Create New Draw
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AI DRAW COMPILATION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  AI Automatically:                                                          │
│  ├── Collects all approved invoices since last draw                         │
│  ├── Groups by cost code for G702/G703 format                              │
│  ├── Calculates retainage per contract terms                               │
│  ├── Identifies missing lien releases                                       │
│  ├── Flags any invoices exceeding budget lines                             │
│  ├── Suggests stored materials that can be claimed                         │
│  └── Generates cover letter with draw summary                              │
│                                                                             │
│  Validation Checks:                                                         │
│  ├── Total doesn't exceed remaining contract                               │
│  ├── All invoices have proper documentation                                │
│  ├── Change orders are approved and included                               │
│  └── Retainage calculation matches contract                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.7 SCHEDULE Module Connections

| Connects To | Trigger | Data Flow | AI Enhancement |
|-------------|---------|-----------|----------------|
| **Jobs** | Schedule created | Link to job | - |
| **Tasks** | Task management | Sync tasks to schedule | AI optimize sequence |
| **Daily Logs** | Progress update | Update task % complete | AI infer from logs |
| **Vendors** | Work assignment | Track vendor tasks | AI monitor performance |
| **Weather** | Weather data | Adjust schedule | AI predict impact |
| **Budget** | Cash flow | Project payment timing | AI forecast |
| **Notifications** | Deadline approach | Alert stakeholders | AI prioritize |
| **Reports** | Dashboard | Schedule analytics | AI identify risks |

**Schedule AI Optimization:**
```
Schedule Created (from template)
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI SCHEDULE INTELLIGENCE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  AI Optimizes:                                                              │
│  ├── Task durations based on similar past projects                         │
│  ├── Vendor availability and capacity                                       │
│  ├── Weather patterns for the region/season                                │
│  ├── Material lead times                                                   │
│  └── Resource conflicts across jobs                                        │
│                                                                             │
│  AI Monitors:                                                               │
│  ├── Daily log progress vs. schedule                                       │
│  ├── Weather forecast impact                                               │
│  ├── Vendor performance trends                                             │
│  └── Budget burn rate vs. schedule                                         │
│                                                                             │
│  AI Alerts:                                                                 │
│  ├── Task falling behind                                                   │
│  ├── Critical path at risk                                                 │
│  ├── Weather delay predicted                                               │
│  └── Resource conflict detected                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.8 DAILY LOGS Module Connections

| Connects To | Trigger | Data Flow | AI Enhancement |
|-------------|---------|-----------|----------------|
| **Jobs** | Log created | Link to job | - |
| **Schedule** | Progress update | Update task progress | AI infer completion |
| **Photos** | Photos attached | Link to log entry | AI tag and organize |
| **Vendors** | Crew tracking | Track vendor presence | AI verify attendance |
| **Weather** | Weather recorded | Log conditions | Auto-fetch weather |
| **POs** | Material tracking | Track deliveries | AI match to POs |
| **Tasks** | Work performed | Update task status | AI suggest updates |
| **Communications** | Log summary | Share with client | AI generate summary |

**Daily Log AI Processing:**
```
Superintendent Submits Log
    │
    ├── Crew on site (vendors, headcount)
    ├── Work performed (description)
    ├── Materials delivered
    ├── Weather conditions
    ├── Photos taken
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AI LOG INTELLIGENCE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  AI Extracts:                                                               │
│  ├── Tasks worked on (match to schedule)                                   │
│  ├── Progress percentage inferred                                          │
│  ├── Vendors present (match to vendor list)                                │
│  ├── Materials received (match to POs)                                     │
│  └── Issues or delays mentioned                                            │
│                                                                             │
│  AI Actions:                                                                │
│  ├── Update schedule task % complete                                       │
│  ├── Flag weather delays for tracking                                      │
│  ├── Generate client-friendly summary                                      │
│  └── Alert PM to any issues mentioned                                      │
│                                                                             │
│  AI Learning:                                                               │
│  ├── Track vendor productivity over time                                   │
│  ├── Learn task duration patterns                                          │
│  └── Correlate weather impact                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Cross-Module Intelligence

### 3.1 Budget Intelligence Network

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BUDGET INTELLIGENCE NETWORK                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                        ┌──────────────────┐                                 │
│                        │   JOB BUDGET     │                                 │
│                        │   (Central Hub)  │                                 │
│                        └────────┬─────────┘                                 │
│                                 │                                           │
│         ┌───────────────────────┼───────────────────────┐                   │
│         │                       │                       │                   │
│         ▼                       ▼                       ▼                   │
│  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐          │
│  │   ESTIMATE   │        │     POS      │        │  INVOICES    │          │
│  │  (Projected) │        │ (Committed)  │        │  (Actual)    │          │
│  └──────┬───────┘        └──────┬───────┘        └──────┬───────┘          │
│         │                       │                       │                   │
│         └───────────────────────┴───────────────────────┘                   │
│                                 │                                           │
│                                 ▼                                           │
│                    ┌────────────────────────┐                               │
│                    │   AI VARIANCE ENGINE   │                               │
│                    │                        │                               │
│                    │  • Compare Est vs Act  │                               │
│                    │  • Predict final cost  │                               │
│                    │  • Identify overruns   │                               │
│                    │  • Suggest savings     │                               │
│                    └────────────────────────┘                               │
│                                 │                                           │
│         ┌───────────────────────┼───────────────────────┐                   │
│         │                       │                       │                   │
│         ▼                       ▼                       ▼                   │
│  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐          │
│  │   ALERTS     │        │   REPORTS    │        │   INSIGHTS   │          │
│  │              │        │              │        │              │          │
│  │ Budget over  │        │ Cost reports │        │ Save here    │          │
│  │ Cost spike   │        │ Variance     │        │ Risk there   │          │
│  │ Missing PO   │        │ Projections  │        │ Trend watch  │          │
│  └──────────────┘        └──────────────┘        └──────────────┘          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Vendor Performance Network

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VENDOR INTELLIGENCE NETWORK                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                     ┌─────────────────────┐                                 │
│                     │    VENDOR MASTER    │                                 │
│                     │    (Central Hub)    │                                 │
│                     └──────────┬──────────┘                                 │
│                                │                                            │
│    ┌──────────────┬────────────┼────────────┬──────────────┐               │
│    │              │            │            │              │               │
│    ▼              ▼            ▼            ▼              ▼               │
│ ┌──────┐    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│ │ POS  │    │ INVOICES │  │DAILY LOGS│  │ SCHEDULE │  │  SAFETY  │        │
│ │      │    │          │  │          │  │          │  │          │        │
│ │ Vol  │    │ Billing  │  │Attendance│  │ On-time  │  │ Incidents│        │
│ │ Price│    │ Accuracy │  │ Quality  │  │ Delivery │  │ Training │        │
│ └──┬───┘    └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│    │             │             │             │              │               │
│    └─────────────┴─────────────┴─────────────┴──────────────┘               │
│                                │                                            │
│                                ▼                                            │
│                   ┌────────────────────────┐                                │
│                   │ AI VENDOR SCORING      │                                │
│                   │                        │                                │
│                   │ • Price competitiveness│                                │
│                   │ • Quality rating       │                                │
│                   │ • Schedule reliability │                                │
│                   │ • Safety record        │                                │
│                   │ • Payment history      │                                │
│                   │ • Overall score        │                                │
│                   └────────────────────────┘                                │
│                                │                                            │
│           ┌────────────────────┼────────────────────┐                       │
│           │                    │                    │                       │
│           ▼                    ▼                    ▼                       │
│    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                │
│    │  BID SCORING │    │ AUTO-SUGGEST │    │   ALERTS     │                │
│    │              │    │              │    │              │                │
│    │ Include score│    │ Recommend    │    │ Performance  │                │
│    │ in bid eval  │    │ for POs      │    │ declining    │                │
│    └──────────────┘    └──────────────┘    └──────────────┘                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Document Intelligence Network

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DOCUMENT INTELLIGENCE NETWORK                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                       ┌────────────────────┐                                │
│                       │  DOCUMENT UPLOAD   │                                │
│                       │  (Any File Type)   │                                │
│                       └─────────┬──────────┘                                │
│                                 │                                           │
│                                 ▼                                           │
│                    ┌────────────────────────┐                               │
│                    │  AI CLASSIFICATION     │                               │
│                    │                        │                               │
│                    │  What type of doc?     │                               │
│                    │  • Invoice             │                               │
│                    │  • PO                  │                               │
│                    │  • Contract            │                               │
│                    │  • Permit              │                               │
│                    │  • Insurance           │                               │
│                    │  • Plan/Drawing        │                               │
│                    │  • Photo               │                               │
│                    │  • Other               │                               │
│                    └─────────┬──────────────┘                               │
│                              │                                              │
│    ┌─────────────────────────┼─────────────────────────┐                    │
│    │                         │                         │                    │
│    ▼                         ▼                         ▼                    │
│ ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                 │
│ │ INVOICE      │     │ CONTRACT     │     │ INSURANCE    │                 │
│ │ PROCESSOR    │     │ PROCESSOR    │     │ PROCESSOR    │                 │
│ │              │     │              │     │              │                 │
│ │ • Vendor     │     │ • Parties    │     │ • Carrier    │                 │
│ │ • Amount     │     │ • Terms      │     │ • Coverage   │                 │
│ │ • Job        │     │ • Dates      │     │ • Expiration │                 │
│ │ • Cost codes │     │ • Scope      │     │ • Limits     │                 │
│ └──────┬───────┘     └──────┬───────┘     └──────┬───────┘                 │
│        │                    │                    │                          │
│        └────────────────────┴────────────────────┘                          │
│                             │                                               │
│                             ▼                                               │
│                  ┌──────────────────────┐                                   │
│                  │  STRUCTURED DATA     │                                   │
│                  │  → Database          │                                   │
│                  │  → Search Index      │                                   │
│                  │  → Notifications     │                                   │
│                  │  → Workflow Triggers │                                   │
│                  └──────────────────────┘                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Notification & Alert Network

### 4.1 Event → Notification Mapping

| Event | Recipients | Channels | AI Involvement |
|-------|------------|----------|----------------|
| Invoice uploaded | PM, Accountant | In-app, Email | AI determines urgency |
| Invoice approved | Vendor (optional), PM | Email, Slack | - |
| PO over budget | Owner, PM | In-app, SMS, Slack | AI calculates impact |
| Schedule delay | PM, Owner | In-app, Email, Slack | AI predicts cascade |
| Weather alert | PM, Superintendent | SMS, In-app | AI forecasts impact |
| Document expiring | PM, Accountant | In-app, Email | AI 30/14/7 day alerts |
| Draw ready | Owner, PM | In-app, Email | AI compiled draw |
| Payment received | Accountant, PM | In-app | AI reconcile |
| Punch item added | Superintendent, Vendor | In-app, SMS | AI prioritize |
| Task overdue | Assigned user, PM | In-app, Email | AI escalate |
| Budget variance | PM, Owner | In-app, Slack | AI analyze cause |
| Client message | PM | In-app, Email, SMS | AI summarize |
| RFI submitted | PM, Architect | In-app, Email | AI suggest answer |
| Inspection failed | PM, Superintendent | In-app, SMS | AI impact analysis |
| Warranty claim | PM, Vendor | In-app, Email | AI check coverage |

### 4.2 Notification Delivery Flow

```
Event Occurs
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NOTIFICATION ENGINE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Determine Recipients                                                    │
│     ├── Based on role (PM, Owner, Accountant)                              │
│     ├── Based on assignment (Job PM, Task owner)                           │
│     └── Based on preference (notification settings)                         │
│                                                                             │
│  2. AI Priority Scoring                                                     │
│     ├── Urgency level (1-5)                                                │
│     ├── Financial impact                                                   │
│     ├── Schedule impact                                                    │
│     └── Historical response time needed                                    │
│                                                                             │
│  3. Channel Selection (per recipient)                                       │
│     ├── In-app: Always (primary)                                           │
│     ├── Email: If priority >= 3 or user preference                         │
│     ├── SMS: If priority >= 4 or time-sensitive                            │
│     └── Slack: If workspace connected and preference                       │
│                                                                             │
│  4. Delivery & Tracking                                                     │
│     ├── Send via appropriate channel                                        │
│     ├── Track delivery status                                              │
│     ├── Track read/action status                                           │
│     └── Escalate if not addressed                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. External Integration Connections

### 5.1 QuickBooks/Xero Sync Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ACCOUNTING INTEGRATION FLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                     ┌───────────────────┐                                   │
│                     │   ROSSOS  │                                   │
│                     └─────────┬─────────┘                                   │
│                               │                                             │
│     ┌─────────────────────────┼─────────────────────────┐                   │
│     │                         │                         │                   │
│     ▼                         ▼                         ▼                   │
│ ┌──────────┐            ┌──────────┐            ┌──────────┐               │
│ │ VENDORS  │            │ INVOICES │            │COST CODES│               │
│ │          │            │          │            │          │               │
│ │ → Export │            │ → Export │            │ ← Import │               │
│ │ ← Import │            │          │            │ → Export │               │
│ └────┬─────┘            └────┬─────┘            └────┬─────┘               │
│      │                       │                       │                      │
│      └───────────────────────┴───────────────────────┘                      │
│                              │                                              │
│                              ▼                                              │
│                   ┌─────────────────────┐                                   │
│                   │  AI MAPPING ENGINE  │                                   │
│                   │                     │                                   │
│                   │  • Match vendors    │                                   │
│                   │  • Map cost codes   │                                   │
│                   │  • Handle conflicts │                                   │
│                   │  • Learn mappings   │                                   │
│                   └──────────┬──────────┘                                   │
│                              │                                              │
│               ┌──────────────┴──────────────┐                               │
│               │                             │                               │
│               ▼                             ▼                               │
│        ┌──────────────┐             ┌──────────────┐                        │
│        │  QUICKBOOKS  │             │    XERO      │                        │
│        │              │             │              │                        │
│        │ - Bills      │             │ - Bills      │                        │
│        │ - Vendors    │             │ - Contacts   │                        │
│        │ - Accounts   │             │ - Accounts   │                        │
│        │ - Classes    │             │ - Tracking   │                        │
│        └──────────────┘             └──────────────┘                        │
│                                                                             │
│  Sync Trigger: Invoice approved, Vendor created, Cost code added            │
│  AI Handles: Duplicate detection, Account mapping, Conflict resolution      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Procore Sync Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROCORE INTEGRATION FLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                 ROSSOS          ◄──────────►          PROCORE       │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         BIDIRECTIONAL SYNC                           │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  JOBS ◄──────────────────────────────────────────────────► PROJECTS  │   │
│  │  • Name, address, dates                                              │   │
│  │  • Status changes                                                    │   │
│  │  • Contract amount                                                   │   │
│  │                                                                      │   │
│  │  VENDORS ◄─────────────────────────────────────────────────► VENDORS │   │
│  │  • Contact info                                                      │   │
│  │  • License numbers                                                   │   │
│  │  • Insurance status                                                  │   │
│  │                                                                      │   │
│  │  RFIs ◄───────────────────────────────────────────────────────► RFIs │   │
│  │  • Questions and answers                                             │   │
│  │  • Status updates                                                    │   │
│  │  • Attachments                                                       │   │
│  │                                                                      │   │
│  │  SUBMITTALS ◄───────────────────────────────────────────► SUBMITTALS │   │
│  │  • Documents                                                         │   │
│  │  • Approval status                                                   │   │
│  │  • Ball-in-court                                                     │   │
│  │                                                                      │   │
│  │  DAILY LOGS ◄─────────────────────────────────────────────► DAILIES  │   │
│  │  • Crew counts                                                       │   │
│  │  • Weather                                                           │   │
│  │  • Notes                                                             │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Sync Frequency: Real-time webhooks + hourly full sync                      │
│  Conflict Resolution: Most recent wins with audit trail                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Slack Integration Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SLACK INTEGRATION FLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ROSSOS                                         SLACK WORKSPACE     │
│                                                                             │
│  ┌────────────────┐                                ┌──────────────────────┐ │
│  │ Invoice Event  │────────────────────────────────▶│ #invoices channel   │ │
│  │ • Uploaded     │                                 │ "New invoice from   │ │
│  │ • Approved     │                                 │  ABC Plumbing $5k"  │ │
│  │ • Paid         │                                 └──────────────────────┘ │
│  └────────────────┘                                                         │
│                                                                             │
│  ┌────────────────┐                                ┌──────────────────────┐ │
│  │ Schedule Event │────────────────────────────────▶│ #project-updates    │ │
│  │ • Task late    │                                 │ "Framing delayed    │ │
│  │ • Milestone    │                                 │  by 3 days..."      │ │
│  └────────────────┘                                 └──────────────────────┘ │
│                                                                             │
│  ┌────────────────┐                                ┌──────────────────────┐ │
│  │ Budget Event   │────────────────────────────────▶│ #budget-alerts      │ │
│  │ • Over budget  │                                 │ "Electrical 15%     │ │
│  │ • Variance     │                                 │  over budget..."    │ │
│  └────────────────┘                                 └──────────────────────┘ │
│                                                                             │
│  ┌────────────────┐                                ┌──────────────────────┐ │
│  │ Safety Event   │────────────────────────────────▶│ #safety             │ │
│  │ • Incident     │                                 │ "Near miss reported │ │
│  │ • Training     │                                 │  at Smith job..."   │ │
│  └────────────────┘                                 └──────────────────────┘ │
│                                                                             │
│  Configuration: Per-channel event subscriptions with AI formatting          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Data Flow Security & Multi-Tenancy

### 6.1 Data Isolation Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MULTI-TENANT DATA ISOLATION                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                           ┌──────────────────┐                              │
│                           │   API REQUEST    │                              │
│                           └────────┬─────────┘                              │
│                                    │                                        │
│                                    ▼                                        │
│                           ┌──────────────────┐                              │
│                           │  AUTH MIDDLEWARE │                              │
│                           │                  │                              │
│                           │  Extract JWT     │                              │
│                           │  Validate token  │                              │
│                           │  Get company_id  │                              │
│                           └────────┬─────────┘                              │
│                                    │                                        │
│                                    ▼                                        │
│                           ┌──────────────────┐                              │
│                           │    RLS POLICY    │                              │
│                           │                  │                              │
│                           │  ALL queries     │                              │
│                           │  filtered by     │                              │
│                           │  company_id      │                              │
│                           └────────┬─────────┘                              │
│                                    │                                        │
│    ┌───────────────────────────────┼───────────────────────────────┐        │
│    │                               │                               │        │
│    ▼                               ▼                               ▼        │
│ ┌────────────┐              ┌────────────┐              ┌────────────┐      │
│ │ Company A  │              │ Company B  │              │ Company C  │      │
│ │   Data     │              │   Data     │              │   Data     │      │
│ │            │              │            │              │            │      │
│ │ Jobs: 50   │              │ Jobs: 120  │              │ Jobs: 30   │      │
│ │ Users: 8   │              │ Users: 25  │              │ Users: 4   │      │
│ │ Invoices...│              │ Invoices...│              │ Invoices...│      │
│ └────────────┘              └────────────┘              └────────────┘      │
│                                                                             │
│  Guarantee: Company A can NEVER access Company B or C data                  │
│  Enforcement: PostgreSQL RLS + Application-level middleware                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Role-Based Access Within Company

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ROLE-BASED ACCESS CONTROL (RBAC)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ROLE          JOBS    FINANCIAL   ADMIN    FIELD    REPORTS                │
│  ─────────────────────────────────────────────────────────────              │
│  Owner         All     All         All      All      All                    │
│  Admin         All     All         All      All      All                    │
│  Accountant    Read    All         -        -        Financial              │
│  PM            Assigned Read*      -        Assigned Assigned               │
│  Supervisor    Assigned -          -        Assigned Assigned               │
│  Field         Assigned -          -        Own      -                      │
│                                                                             │
│  * PM can view financials for their assigned jobs only                      │
│                                                                             │
│  Permission Checks:                                                         │
│  ├── canViewAllJobs: Only Owner, Admin, Accountant                         │
│  ├── canApproveInvoices: Owner, Admin, Accountant                          │
│  ├── canCreatePO: Owner, Admin, Accountant, PM                             │
│  ├── canSubmitDailyLog: PM, Supervisor, Field                              │
│  ├── canManageUsers: Owner, Admin                                          │
│  └── canViewFinancials: Owner, Admin, Accountant                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. System Connection Summary

### 7.1 Connection Count by Module

| Module | Connects To | Data Points | AI Touchpoints |
|--------|-------------|-------------|----------------|
| Jobs | 15 modules | 50+ fields | 8 |
| Invoices | 11 modules | 30+ fields | 6 |
| Budget | 9 modules | 40+ fields | 5 |
| Schedule | 8 modules | 35+ fields | 7 |
| Vendors | 10 modules | 25+ fields | 4 |
| Daily Logs | 8 modules | 20+ fields | 5 |
| Draws | 6 modules | 15+ fields | 3 |
| POs | 9 modules | 25+ fields | 4 |
| Estimates | 7 modules | 40+ fields | 6 |
| Files | 12 modules | 10+ fields | 3 |

### 7.2 Critical Connection Paths

**Path 1: Lead to Payment (Full Cycle)**
```
Lead → Estimate → Proposal → Contract → Job → Budget → PO → Invoice → Draw → Payment
```

**Path 2: Schedule to Alert**
```
Schedule Task → Daily Log → Progress Update → AI Analysis → Delay Detection → Alert
```

**Path 3: Document to Action**
```
Document Upload → AI Classification → Entity Extraction → Database Update → Notification
```

**Path 4: Budget to Decision**
```
Invoice → Allocation → Budget Update → Variance Detection → Alert → Owner Dashboard
```

### 7.3 AI Enhancement Summary

| AI Component | Modules Enhanced | Key Value |
|--------------|------------------|-----------|
| Document OCR | Invoices, Contracts, Files | 80% manual entry reduction |
| Entity Extraction | Invoices, POs, Contracts | Auto-fill and validation |
| Cost Prediction | Budget, Estimates | Accurate forecasting |
| Anomaly Detection | Budget, Invoices, Schedule | Early warning system |
| Pattern Learning | All modules | Continuous improvement |
| Smart Suggestions | Estimates, POs, Tasks | Faster decision making |
| Auto-Classification | Files, Documents | Instant organization |
| Progress Analysis | Daily Logs, Schedule | Real-time status |

---

## 8. Implementation Priority

### Phase 0 (Foundation)
- Core data models (Jobs, Clients, Vendors, Cost Codes)
- Authentication and multi-tenancy
- Basic CRUD operations

### Phase 1 (Financial Core)
- Invoice processing with AI
- PO management
- Budget tracking
- Draw compilation

### Phase 2 (Operations)
- Schedule management
- Daily logs
- Photo management
- Task tracking

### Phase 3 (Intelligence)
- Full AI integration
- Cross-module analytics
- Predictive features
- Learning engine

### Phase 4 (Integration)
- QuickBooks/Xero sync
- Procore integration
- Slack notifications
- Client portal

### Phase 5 (Advanced)
- Custom dashboards
- Advanced reporting
- Email marketing
- Vendor portal

---

*This document should be referenced when building any new feature to ensure proper connections are established and AI enhancements are included from the start.*
