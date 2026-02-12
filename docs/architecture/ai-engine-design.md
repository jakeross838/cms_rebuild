# RossOS - AI Integration Strategy

## Executive Summary

This document outlines how AI is woven throughout the entire construction management system to create an intelligent, self-improving platform that dramatically reduces manual work and provides insights that would be impossible to gather manually.

**Core Philosophy**: AI should be invisible but invaluable - automatically working in the background to reduce friction, catch errors, surface insights, and learn from every interaction.

---

## 1. AI Integration Map

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ROSSOS - AI LAYER                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐          │
│  │ DOCUMENT AI      │    │ FINANCIAL AI     │    │ PROJECT AI       │          │
│  │                  │    │                  │    │                  │          │
│  │ • Invoice OCR    │    │ • Cost Predict   │    │ • Schedule AI    │          │
│  │ • Receipt Scan   │    │ • Budget Anomaly │    │ • Risk Detection │          │
│  │ • Contract Parse │    │ • Cash Flow AI   │    │ • Weather Impact │          │
│  │ • Plan Analysis  │    │ • Vendor Scoring │    │ • Delay Predict  │          │
│  └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘          │
│           │                       │                       │                     │
│           └───────────────────────┼───────────────────────┘                     │
│                                   │                                             │
│                    ┌──────────────▼──────────────┐                              │
│                    │     LEARNING ENGINE         │                              │
│                    │                             │                              │
│                    │  • User Corrections         │                              │
│                    │  • Pattern Recognition      │                              │
│                    │  • Company-Specific Rules   │                              │
│                    │  • Cross-Job Intelligence   │                              │
│                    └──────────────┬──────────────┘                              │
│                                   │                                             │
│           ┌───────────────────────┼───────────────────────┐                     │
│           │                       │                       │                     │
│  ┌────────▼─────────┐    ┌────────▼─────────┐    ┌────────▼─────────┐          │
│  │ COMMUNICATION AI │    │ INSIGHT AI       │    │ AUTOMATION AI    │          │
│  │                  │    │                  │    │                  │          │
│  │ • Smart Replies  │    │ • Dashboard AI   │    │ • Auto-Routing   │          │
│  │ • Email Draft    │    │ • Report Gen     │    │ • Smart Defaults │          │
│  │ • Summary Gen    │    │ • Trend Analysis │    │ • Workflow Rules │          │
│  │ • Translation    │    │ • Benchmarking   │    │ • Batch Process  │          │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Document Intelligence

### 2.1 Invoice Processing (Core Feature)

**Current State**: Upload PDF → AI extracts all data → Creates invoice record

**Enhanced AI Features**:

| Feature | Description | Value |
|---------|-------------|-------|
| **Multi-Invoice Detection** | Detect when PDF contains multiple invoices, auto-split | Saves manual splitting |
| **Duplicate Detection** | Hash-based + AI semantic matching to prevent double-entry | Prevents overpayment |
| **PO Matching** | Auto-match to existing POs by vendor, amount, description | Faster approval |
| **Line Item Extraction** | Parse individual line items with quantities and unit costs | Detailed cost tracking |
| **Cost Code Suggestion** | Based on vendor trade, description keywords, and past invoices | 90% accuracy on allocation |
| **Anomaly Flagging** | Flag unusual amounts, unexpected vendors, or suspicious patterns | Fraud prevention |
| **Handwriting OCR** | Extract handwritten notes, signatures, dates | Complete data capture |

**AI Learning Loop**:
```
Invoice Processed → User Reviews → User Corrects (if needed) → System Learns
                                                                    │
    ┌───────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ LEARNING DATABASE                                               │
│                                                                 │
│ • Vendor Aliases: "ABC Elec" = "ABC Electric Inc"               │
│ • Cost Code Rules: "Electrician" → 26-00-00                     │
│ • Amount Patterns: ABC Electric typical range $5k-$15k          │
│ • Format Recognition: ABC Electric invoice layout               │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Receipt & Expense Processing

**Use Case**: Field crew snaps photo of Home Depot receipt

**AI Capabilities**:
- Extract store, date, items, total
- Categorize items by cost code (lumber → 06-Materials, electrical → 26-Materials)
- Match to job based on items and recent activity
- Flag personal vs. business items
- Combine multiple receipts from same trip

### 2.3 Contract & Document Parsing

**Use Case**: Upload 30-page subcontractor agreement

**AI Capabilities**:
- Extract key terms: amount, dates, scope, insurance requirements
- Identify missing clauses (no lien waiver requirement, etc.)
- Compare to standard templates and flag deviations
- Extract schedule of values for budget import
- Parse insurance certificates for expiration tracking

### 2.4 Plan & Specification Analysis

**Use Case**: Upload architectural plans PDF

**AI Capabilities**:
- Extract room dimensions and square footage
- Identify fixtures and finishes for selection tracking
- Parse electrical panel schedules
- Extract door/window schedules
- Generate initial estimate line items from specifications
- Cross-reference specs with estimate for completeness

---

## 3. Financial Intelligence

### 3.1 Budget Anomaly Detection

**Real-time Monitoring**:
```
┌─────────────────────────────────────────────────────────────────┐
│ BUDGET WATCHDOG AI                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Monitors for:                                                   │
│ ───────────────────────────────────────────────────────────────│
│ • Cost code running over budget (threshold: 90%)                │
│ • Spending velocity exceeding schedule progress                 │
│ • Vendor concentration risk (>30% to single vendor)             │
│ • Missing expected invoices (PO issued, no invoice 30+ days)    │
│ • Retainage calculation errors                                  │
│ • Budget vs. actual trending toward loss                        │
│                                                                 │
│ Actions:                                                        │
│ ───────────────────────────────────────────────────────────────│
│ • Dashboard alerts with severity levels                         │
│ • Email notifications to PM/Owner                               │
│ • Block further POs on over-budget codes (optional)             │
│ • Generate variance report automatically                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Cash Flow Prediction

**AI-Powered Forecasting**:

| Input | AI Processing | Output |
|-------|---------------|--------|
| Historical payment patterns | Learn client payment behavior | Days-to-pay prediction |
| Draw submission schedule | Project approval timeline | Expected income dates |
| PO commitments | Match to typical vendor terms | Expected outflow dates |
| Retainage schedule | Project completion timeline | Retainage release forecast |
| Seasonal patterns | Identify slow payment periods | Adjusted predictions |

**Visualization**:
- 90-day rolling cash flow projection
- "What-if" scenarios (delayed draw, accelerated invoices)
- Alert when projected cash goes negative
- Recommendations to improve cash position

### 3.3 Vendor Performance Scoring

**AI-Calculated Vendor Score**:

```
VENDOR SCORE = weighted average of:

  ┌─────────────────────────────────────────────────────────────┐
  │ Quality Score (25%)                                         │
  │ • Punch item rate per $100k                                 │
  │ • Callback/warranty claims                                  │
  │ • Inspection pass rate                                      │
  ├─────────────────────────────────────────────────────────────┤
  │ Reliability Score (25%)                                     │
  │ • On-time task completion rate                              │
  │ • Schedule adherence                                        │
  │ • Responsiveness to RFIs                                    │
  ├─────────────────────────────────────────────────────────────┤
  │ Cost Score (25%)                                            │
  │ • Actual vs. bid variance                                   │
  │ • Change order frequency                                    │
  │ • Price competitiveness vs. market                          │
  ├─────────────────────────────────────────────────────────────┤
  │ Financial Score (25%)                                       │
  │ • Invoice accuracy                                          │
  │ • Lien waiver compliance                                    │
  │ • Insurance currency                                        │
  └─────────────────────────────────────────────────────────────┘
```

### 3.4 Cost Code Intelligence

**AI-Powered Cost Database**:
- Track actual costs per SF, per unit across all jobs
- Regional and temporal adjustments
- Material price trend tracking
- Labor rate benchmarking
- Automatic estimate suggestion based on historical data

---

## 4. Project Intelligence

### 4.1 Schedule Optimization

**AI Scheduling Assistant**:

| Feature | Description |
|---------|-------------|
| **Auto-Sequencing** | Given tasks, AI suggests optimal order based on dependencies |
| **Resource Leveling** | Identify vendor conflicts across jobs, suggest resequencing |
| **Duration Estimation** | Based on historical data, suggest realistic durations |
| **Critical Path Analysis** | Highlight tasks that impact completion date |
| **Weather Integration** | Auto-adjust outdoor tasks based on forecast |
| **Delay Prediction** | Flag tasks likely to slip based on patterns |

**Weather-Aware Scheduling**:
```
┌─────────────────────────────────────────────────────────────────┐
│ WEATHER AI                                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 10-Day Forecast Integration:                                    │
│                                                                 │
│ Mon   Tue   Wed   Thu   Fri   Sat   Sun   Mon   Tue   Wed      │
│ ☀️    ☀️    🌧️    🌧️    ☀️    ☀️    ☀️    🌧️    ☀️    ☀️       │
│ 75°   78°   65°   62°   70°   72°   74°   68°   71°   73°      │
│                                                                 │
│ Impact Analysis:                                                │
│ ───────────────────────────────────────────────────────────────│
│ ⚠️  Concrete pour scheduled Wed - RECOMMEND RESCHEDULE         │
│ ⚠️  Exterior paint scheduled Thu - RAIN LIKELY                 │
│ ✓  Framing can proceed Mon-Tue                                 │
│ ✓  Interior work unaffected                                    │
│                                                                 │
│ [Auto-Adjust Schedule]  [Notify Affected Vendors]              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Risk Detection

**Proactive Risk Monitoring**:

| Risk Type | AI Detection | Action |
|-----------|--------------|--------|
| **Budget Risk** | Spending trend exceeds budget | Alert + variance report |
| **Schedule Risk** | Critical path tasks delayed | Reschedule suggestions |
| **Vendor Risk** | Key vendor unresponsive | Alternative suggestions |
| **Weather Risk** | Forecast threatens outdoor work | Schedule adjustment |
| **Cash Risk** | Projected shortfall | Draw acceleration recommendation |
| **Quality Risk** | Inspection failures trending up | Quality meeting trigger |
| **Documentation Risk** | Missing lien waivers, insurance | Compliance alerts |

### 4.3 Daily Log Intelligence

**AI-Enhanced Daily Logs**:

| Feature | Description |
|---------|-------------|
| **Voice-to-Log** | Speak notes, AI transcribes and structures |
| **Photo Analysis** | AI describes what's visible in progress photos |
| **Auto-Population** | Pre-fill from schedule (who should be there) |
| **Issue Detection** | Flag mentioned problems for follow-up |
| **Progress Estimation** | Suggest % complete based on description + photos |
| **Weather Auto-Fill** | Pull actual weather data for the day |

**Voice Log Example**:
```
User speaks: "ABC Electric finished rough-in on second floor today,
passed inspection. XYZ Plumbing no-showed again, third time this week.
Need to find replacement. Concrete truck arrived 2 hours late."

AI structures:
┌─────────────────────────────────────────────────────────────────┐
│ DAILY LOG - Nov 15, 2024                                        │
├─────────────────────────────────────────────────────────────────┤
│ Work Completed:                                                 │
│ • ABC Electric - 2nd floor rough-in complete ✓                  │
│ • Electrical inspection - PASSED ✓                              │
│                                                                 │
│ Issues:                                                         │
│ ⚠️ XYZ Plumbing - no-show (3rd occurrence)                      │
│    → Flagged for vendor review                                  │
│    → Suggested action: Find replacement plumber                 │
│                                                                 │
│ ⚠️ Concrete delivery - 2 hour delay                             │
│    → Logged for vendor performance tracking                     │
│                                                                 │
│ [Review & Submit]                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Communication Intelligence

### 5.1 Smart Reply Suggestions

**Context-Aware Responses**:

For RFI received:
```
RFI: "What is the specified countertop material for the master bath?"

AI suggests responses based on:
• Project documents (searches specifications)
• Selection records (checks if chosen)
• Similar past RFIs

Suggested reply:
"Per the interior finish schedule (Sheet A-501), the master bath
countertop is specified as Quartz - Caesarstone #5143 White Attica
with eased edge. Note: The homeowner has approved this selection
as of Oct 15 (see Selection #47)."

[Use This Reply] [Edit] [Dismiss]
```

### 5.2 Email Draft Generation

**AI Email Composer**:

| Trigger | AI Draft |
|---------|----------|
| Draw submitted | "Hi [Client], Draw #3 for $42,500 has been submitted..." |
| Invoice overdue | "Hi [Vendor], Invoice #1234 for $8,500 was due 15 days ago..." |
| Schedule change | "Hi [Vendor], Please note the following schedule change..." |
| Punch list | "Hi [Vendor], The following punch items require attention..." |
| Project complete | "Congratulations! Your project has reached substantial completion..." |

### 5.3 Meeting Summary Generation

**AI Meeting Notes**:
- Upload audio/transcript from site meeting
- AI extracts action items, decisions, attendees
- Automatically creates tasks from action items
- Links decisions to relevant jobs/entities
- Generates formatted meeting minutes

### 5.4 Multi-Language Support

**Translation & Communication**:
- Translate daily logs from Spanish-speaking crews
- Generate vendor communications in their preferred language
- Maintain English record with translated version linked

---

## 6. Automation Intelligence

### 6.1 Smart Routing

**Automatic Workflow Routing**:

```
INVOICE RECEIVED
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│ AI ROUTING ENGINE                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Analyze:                                                        │
│ • Invoice amount: $12,450                                       │
│ • Vendor: ABC Electric                                          │
│ • Job: Smith Residence                                          │
│ • Job PM: John Smith                                            │
│ • Has matching PO: Yes (PO-2024-089)                            │
│ • Within PO amount: Yes (PO = $15,000)                          │
│ • Cost code: 26-00-00 Electrical                                │
│ • Budget status: 78% spent, within tolerance                    │
│                                                                 │
│ Decision:                                                       │
│ ✓ Auto-allocate to cost code 26-00-00                           │
│ ✓ Link to PO-2024-089                                           │
│ ✓ Route to John Smith for PM approval                           │
│ ✗ Skip owner approval (under $25k threshold)                    │
│                                                                 │
│ Route: John Smith (PM) → Accountant → [Ready for Draw]          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Smart Defaults

**Context-Aware Pre-Population**:

| Action | Smart Defaults |
|--------|----------------|
| **New PO** | Pre-fill vendor's typical cost codes, last used job, standard terms |
| **New Invoice** | Suggest job based on vendor's active jobs, pre-fill cost codes |
| **New Task** | Duration from historical average, vendor from budget line |
| **New Draw** | Auto-calculate all lines based on % complete and invoices |
| **New Estimate** | Pull line items from similar past estimates |

### 6.3 Batch Processing

**AI-Powered Bulk Operations**:

| Operation | AI Enhancement |
|-----------|----------------|
| **Month-End Close** | Auto-identify all pending invoices, suggest allocations, generate reports |
| **Draw Preparation** | Pull all approved invoices, calculate SOV, generate G702/G703 |
| **Vendor Payments** | Batch approve invoices, verify lien waivers, generate checks |
| **Insurance Audit** | Check all vendor certificates, flag expired, generate report |
| **Budget Rollup** | Aggregate all job budgets, calculate company-wide P&L |

### 6.4 Predictive Automation

**Anticipatory Actions**:

```
AI observes: Task "Drywall Installation" marked 90% complete

AI triggers:
┌─────────────────────────────────────────────────────────────────┐
│ PREDICTIVE AUTOMATION                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Based on 90% drywall completion, AI anticipates:                │
│                                                                 │
│ ✓ Draft email to painter: "Drywall nearing completion,          │
│   please confirm availability for [date]"                       │
│                                                                 │
│ ✓ Create reminder: "Schedule texture inspection"                │
│                                                                 │
│ ✓ Alert PM: "Verify drywall PO will cover final payment"        │
│                                                                 │
│ ✓ Pre-fill next task: "Texture & Prime" as ready to start       │
│                                                                 │
│ [Review & Approve Actions]                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Insight Generation

### 7.1 Executive Dashboard AI

**AI-Generated Insights**:

```
┌─────────────────────────────────────────────────────────────────┐
│ AI INSIGHTS - This Week                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🔴 CRITICAL                                                     │
│    Smith Residence electrical running 23% over budget           │
│    → 3 change orders not yet approved                           │
│    → Recommend: Schedule owner meeting                          │
│                                                                 │
│ 🟡 WARNING                                                      │
│    Jones Project concrete delayed 4 days by weather             │
│    → Critical path impacted                                     │
│    → Recommend: Notify client of potential 1-week delay         │
│                                                                 │
│ 🟢 POSITIVE                                                     │
│    Williams Build ahead of schedule by 2 weeks                  │
│    → Consider accelerating draw schedule                        │
│    → Potential early completion bonus: $5,000                   │
│                                                                 │
│ 💡 OPPORTUNITY                                                  │
│    5 jobs need exterior paint in next 30 days                   │
│    → Negotiate volume discount with XYZ Painting                │
│    → Estimated savings: $3,200                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Trend Analysis

**Historical Pattern Recognition**:

| Analysis | Insight |
|----------|---------|
| **Seasonal Costs** | "Lumber costs typically rise 15% in Q2 - consider early procurement" |
| **Vendor Patterns** | "ABC Electric averages 8% over bid - factor into estimates" |
| **Job Type Profitability** | "Renovations averaging 18% margin vs 14% for new construction" |
| **Change Order Trends** | "Kitchens average 3.2 change orders - build in contingency" |
| **Payment Patterns** | "Client Jones typically pays 12 days late - adjust cash flow" |

### 7.3 Benchmarking

**Industry & Internal Comparison**:

```
BENCHMARK REPORT - Smith Residence
──────────────────────────────────────────────────────────────────

                    This Job    Your Average    Industry Avg
──────────────────────────────────────────────────────────────────
Cost per SF         $285        $278            $295
Gross Margin        16.2%       15.8%           14.5%
Schedule Variance   +4 days     -2 days         +8 days
Change Order Rate   2.1%        3.4%            4.2%
Punch Items/Unit    12          18              24

INSIGHTS:
• Performing better than your average on punch items (-33%)
• Slightly behind schedule but better than industry
• Change order rate well controlled
• Cost per SF slightly elevated - review framing costs
```

---

## 8. Learning Engine

### 8.1 Company-Specific Training

**What the System Learns**:

| Category | Examples |
|----------|----------|
| **Vendor Aliases** | "ABC Elec" = "ABC Electric" = "ABC Electrical Inc" |
| **Cost Code Mapping** | "Electrician" → 26-00-00, "Plumber" → 22-00-00 |
| **Approval Patterns** | the PM approves invoices under $10k without review |
| **Scheduling Patterns** | This company does framing before electrical rough |
| **Pricing Patterns** | Material markup is typically 15%, labor 35% |
| **Communication Styles** | Email templates, formal vs. informal by recipient |

### 8.2 Cross-Job Intelligence

**Learning Across All Jobs**:

```
┌─────────────────────────────────────────────────────────────────┐
│ CROSS-JOB LEARNING                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ When you create a new estimate, AI can suggest:                 │
│                                                                 │
│ "Based on 12 similar 2,500 SF custom homes you've built:"       │
│                                                                 │
│ • Foundation typically: $45,000 - $52,000                       │
│ • Framing typically: $85,000 - $95,000                          │
│ • Electrical typically: $28,000 - $35,000                       │
│ • HVAC typically: $22,000 - $28,000                             │
│                                                                 │
│ "Watch out for:"                                                │
│ • Concrete costs have risen 12% since your last similar job     │
│ • Your electrician ABC Electric is currently overbooked         │
│ • Last 3 similar jobs had kitchen change orders averaging $8k   │
│                                                                 │
│ [Apply Suggestions to Estimate]                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Correction Tracking

**How Corrections Improve AI**:

```
User uploads invoice
       │
       ▼
AI extracts: Vendor = "ABc Electrical"
       │
       ▼
User corrects: Vendor = "ABC Electric Inc" (existing vendor)
       │
       ▼
System learns:
┌─────────────────────────────────────────────────────────────────┐
│ NEW ALIAS LEARNED                                               │
│                                                                 │
│ "ABc Electrical" → ABC Electric Inc (vendor_id: abc-123)        │
│                                                                 │
│ Confidence: 100% (user confirmed)                               │
│ Apply to future invoices: Yes                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Integration Points

### 9.1 AI Touchpoints by Feature

| Feature | AI Integration Points |
|---------|----------------------|
| **Invoice Upload** | OCR, data extraction, matching, allocation suggestion |
| **PO Creation** | Smart defaults, cost prediction, vendor suggestion |
| **Budget** | Anomaly detection, variance prediction, forecasting |
| **Schedule** | Duration estimation, sequencing, weather adjustment |
| **Daily Logs** | Voice transcription, photo analysis, issue extraction |
| **Draws** | Auto-calculation, completeness validation |
| **Estimates** | Historical pricing, similar job suggestions |
| **Reports** | Insight generation, trend analysis, benchmarking |
| **Search** | Natural language queries, semantic search |
| **Notifications** | Priority scoring, smart batching, timing optimization |

### 9.2 API Structure for AI

```
/api/ai/
├── /process-document
│   ├── POST /invoice      - Extract invoice data from PDF/image
│   ├── POST /receipt      - Extract receipt data
│   ├── POST /contract     - Extract contract terms
│   └── POST /plans        - Analyze construction plans
│
├── /suggest
│   ├── POST /allocations  - Suggest cost code allocations
│   ├── POST /vendor       - Suggest vendor match
│   ├── POST /estimate     - Suggest estimate lines
│   ├── POST /schedule     - Suggest task sequence
│   └── POST /reply        - Suggest email/message reply
│
├── /analyze
│   ├── POST /budget       - Analyze budget health
│   ├── POST /cashflow     - Project cash flow
│   ├── POST /risk         - Assess project risks
│   └── POST /vendor       - Score vendor performance
│
├── /generate
│   ├── POST /report       - Generate report narrative
│   ├── POST /summary      - Summarize meeting/log
│   ├── POST /email        - Draft email
│   └── POST /insights     - Generate dashboard insights
│
└── /learn
    ├── POST /correction   - Record user correction
    ├── POST /alias        - Add vendor/entity alias
    └── GET /stats         - Learning statistics
```

---

## 10. Data Architecture for AI

### 10.1 AI-Specific Tables

```sql
-- AI Learning: Vendor Aliases
ai_vendor_aliases (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies,
  vendor_id uuid REFERENCES vendors,
  alias text NOT NULL,              -- "ABc Electrical"
  source text,                      -- invoice_ocr, user_input
  confidence decimal(3,2),
  created_at timestamptz
)

-- AI Learning: Cost Code Mappings
ai_cost_code_mappings (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies,
  keyword text NOT NULL,            -- "electrician", "wiring"
  cost_code_id uuid REFERENCES cost_codes,
  confidence decimal(3,2),
  usage_count integer DEFAULT 1,
  created_at timestamptz
)

-- AI Processing Log
ai_processing_log (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies,
  entity_type text NOT NULL,        -- invoice, receipt, etc.
  entity_id uuid,
  model_version text,
  input_hash text,                  -- For caching
  extracted_data jsonb,
  confidence_scores jsonb,
  processing_time_ms integer,
  user_corrections jsonb,           -- What was changed
  created_at timestamptz
)

-- AI Insights Cache
ai_insights (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies,
  job_id uuid REFERENCES jobs,      -- Optional, for job-specific
  insight_type text NOT NULL,       -- budget_warning, opportunity, etc.
  severity text,                    -- critical, warning, info, positive
  title text NOT NULL,
  description text,
  data jsonb,                       -- Supporting data
  action_url text,                  -- Link to take action
  dismissed_at timestamptz,
  created_at timestamptz,
  expires_at timestamptz
)

-- Historical Cost Data (for predictions)
ai_cost_history (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies,
  cost_code_id uuid REFERENCES cost_codes,
  job_id uuid REFERENCES jobs,
  unit_type text,                   -- sf, lf, ea, etc.
  unit_cost decimal(10,2),
  total_cost decimal(12,2),
  quantity decimal(10,2),
  recorded_at date,
  metadata jsonb                    -- Job size, location, etc.
)
```

### 10.2 AI Confidence Thresholds

```javascript
const AI_THRESHOLDS = {
  invoice: {
    AUTO_APPROVE: 0.95,      // Auto-accept extraction
    NEEDS_REVIEW: 0.80,      // Show but require confirmation
    LOW_CONFIDENCE: 0.60,    // Flag for manual entry
  },
  vendor_match: {
    AUTO_LINK: 0.90,         // Auto-link to vendor
    SUGGEST: 0.70,           // Suggest but don't auto-link
  },
  cost_code: {
    AUTO_ALLOCATE: 0.85,     // Auto-assign cost code
    SUGGEST: 0.60,           // Suggest options
  },
  schedule: {
    AUTO_ADJUST: 0.90,       // Auto-adjust for weather
    RECOMMEND: 0.70,         // Recommend adjustment
  }
}
```

---

## 11. System Connections Map

### 11.1 How Everything Flows Together

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 DATA FLOW MAP                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   LEAD ─────────► CLIENT ◄────────────────────────────────────┐                 │
│     │               │                                         │                 │
│     │               │                                         │                 │
│     ▼               ▼                                         │                 │
│  ESTIMATE ────► JOB ◄──────────────────────────────────────┐  │                 │
│     │           │ │ │                                      │  │                 │
│     │           │ │ │                                      │  │                 │
│     ▼           │ │ │                                      │  │                 │
│  PROPOSAL       │ │ └──────────────► SCHEDULE              │  │                 │
│     │           │ │                      │                 │  │                 │
│     ▼           │ │                      ▼                 │  │                 │
│  CONTRACT       │ │                   TASKS ◄──────► VENDOR│  │                 │
│     │           │ │                      │                 │  │                 │
│     └───────────┘ │                      ▼                 │  │                 │
│                   │                 DAILY LOGS ◄──► PHOTOS │  │                 │
│                   │                                        │  │                 │
│                   ▼                                        │  │                 │
│              BUDGET ◄──────────────────────────────────────┘  │                 │
│                 │                                             │                 │
│     ┌───────────┼───────────┬───────────────┐                 │                 │
│     │           │           │               │                 │                 │
│     ▼           ▼           ▼               ▼                 │                 │
│    PO ────► INVOICE ───► DRAW ◄─────── CHANGE ORDER           │                 │
│     │           │           │                                 │                 │
│     │           │           │                                 │                 │
│     │           ▼           ▼                                 │                 │
│     │      ALLOCATION    G702/G703                            │                 │
│     │           │           │                                 │                 │
│     │           │           │                                 │                 │
│     └───────────┴───────────┴─────────────► CLIENT PORTAL ────┘                 │
│                             │                                                   │
│                             ▼                                                   │
│                        QUICKBOOKS                                               │
│                                                                                 │
│                                                                                 │
│   CLOSEOUT FLOW:                                                                │
│   ───────────────                                                               │
│   TASKS ────► PUNCH LIST ────► FINAL DOCS ────► WARRANTY ────► PROJECT COMPLETE │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

AI TOUCHPOINTS (marked with 🤖):
─────────────────────────────────
🤖 Lead → Job: AI scores lead quality, suggests follow-up
🤖 Estimate: AI suggests line items from similar jobs
🤖 Contract: AI extracts key terms
🤖 Budget: AI monitors for anomalies
🤖 PO: AI suggests cost codes, predicts costs
🤖 Invoice: AI extracts data, matches vendor/PO
🤖 Allocation: AI suggests cost code breakdown
🤖 Draw: AI validates completeness, calculates amounts
🤖 Schedule: AI optimizes sequence, predicts delays
🤖 Daily Log: AI transcribes voice, analyzes photos
🤖 Punch List: AI extracts items from walkthrough notes
🤖 All: AI generates insights, detects risks, learns patterns
```

---

## 12. Implementation Priority

### Phase 1: Core AI (Sprint 1-4)
1. Invoice OCR and data extraction
2. Vendor matching with learning
3. Cost code suggestion
4. Basic anomaly detection

### Phase 2: Financial AI (Sprint 5-8)
5. Budget monitoring and alerts
6. Cash flow prediction
7. PO/Invoice matching
8. Vendor scoring

### Phase 3: Project AI (Sprint 9-12)
9. Schedule optimization
10. Weather integration
11. Daily log intelligence
12. Risk detection

### Phase 4: Communication AI (Sprint 13-16)
13. Smart reply suggestions
14. Email drafting
15. Meeting summaries
16. Multi-language support

### Phase 5: Advanced AI (Sprint 17-20)
17. Predictive automation
18. Executive insights
19. Benchmarking
20. Advanced learning/personalization

---

## 13. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Invoice processing accuracy | >95% | Fields correctly extracted |
| Time saved per invoice | 5 min | Before/after comparison |
| Cost code suggestion accuracy | >85% | User acceptance rate |
| Budget alerts caught | >90% | Issues flagged vs. occurred |
| User correction rate | <10% | AI outputs requiring edit |
| Schedule prediction accuracy | ±3 days | Predicted vs. actual completion |
| Cash flow prediction accuracy | ±5% | Predicted vs. actual |

---

## 14. Competitive Advantage

This AI integration creates a platform that:

1. **Learns Your Business** - Gets smarter with every invoice, every correction, every job
2. **Reduces Errors** - Catches anomalies humans miss
3. **Saves Time** - Automates tedious data entry and routing
4. **Provides Insights** - Surfaces opportunities and risks proactively
5. **Scales Knowledge** - New employees benefit from accumulated intelligence
6. **Improves Continuously** - Every interaction makes the system better

**The result**: A construction management system that feels like having an experienced back-office team that never sleeps, never forgets, and gets better every day.

---

## Future AI Capabilities

### AI Code Compliance Check
- Upload architectural plans and the system checks them against applicable building codes for the project's jurisdiction and permit date.
- Flags potential code violations (setback encroachments, egress deficiencies, structural span issues) before permit submission to reduce rejection cycles.

### AI Turnover Package Generator
- At project closeout, AI auto-compiles all warranties, equipment manuals, material specifications, and maintenance schedules into a branded homeowner turnover package.
- Generates a digital and print-ready document with table of contents, organized by system (HVAC, plumbing, electrical, appliances, finishes).

### AI Permit Requirement Checker
- Input project address and scope description; AI determines all required permits (building, electrical, plumbing, mechanical, grading, ROW, etc.) for that jurisdiction.
- Cross-references jurisdiction database and historical permit data from similar projects in the same municipality.

### AI Regulatory Engine
- Input project address; AI returns all applicable regulations, building codes, tax rates, mechanic's lien deadlines, insurance minimums, and licensing requirements for that location.
- Accounts for overlapping jurisdictions (city, county, state, HOA) and provides a unified compliance checklist.

### AI Onboarding Configurator
- New tenant describes their business (size, project types, trades, typical contract structure) during onboarding.
- AI pre-configures modules, cost code libraries, workflow rules, approval thresholds, and document templates based on the description, reducing setup time from days to minutes.

### AI Workflow Builder
- Tenant describes their approval or routing process in plain English (e.g., "invoices over $10K need director approval, under $10K just the PM").
- AI translates the description into configured workflow rules with thresholds, routing steps, and escalation paths.

### AI Report Builder
- Natural language query interface for custom reports (e.g., "show me profit margin by trade for 2024" or "which vendors had the most punch items last quarter").
- AI generates the report with appropriate charts, tables, and filters, and saves the query as a reusable report template.

---

*Document created: 2024*
*This document defines the AI strategy for RossOS.*
