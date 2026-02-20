# AI Capabilities Audit

**Purpose:** Compare requested AI features against current documentation to identify gaps.

---

## Summary

| Category | Requested Features | Have | Partial | Missing |
|----------|-------------------|------|---------|---------|
| Conversational AI | 2 | 1 | 1 | 0 |
| Predictive Analytics | 4 | 3 | 1 | 0 |
| Automated Compliance | 2 | 1 | 0 | 1 |
| Lien Waiver AI | 4 | 3 | 1 | 0 |
| **Total** | **12** | **8** | **3** | **1** |

---

## 1. Conversational AI and NLP

### 1.1 AI Project Assistants (Chatbot)
**Request:** Natural language questions like "What are the exact specs for the HVAC system on the Smith project?"

| Status | Location | Details |
|--------|----------|---------|
| ✅ **HAVE** | `3-modules/99-notebooklm-integration.md` | Full NotebookLM integration with natural language Q&A |
| ✅ **HAVE** | `1-architecture/ai/AI-INTEGRATION-MASTER-PLAN.md` | Multi-model AI gateway with Gemini for chat |

**What's Documented:**
- NotebookLM per-job "notebooks" that answer questions across all project docs
- Example queries: "What's our risk exposure?", "How reliable is ABC Plumbing?"
- Google Gemini Flash for real-time chat responses
- Full project context synthesis

**Gap:** None - this is well covered.

---

### 1.2 Voice-to-Text Field Logging
**Request:** Offline-first mobile app with AI voice-to-text for daily logs and safety observations.

| Status | Location | Details |
|--------|----------|---------|
| ✅ **HAVE** | `1-architecture/ai/AI-INTEGRATION-MASTER-PLAN.md` | Google Speech-to-Text integration spec |
| ✅ **HAVE** | `3-modules/40-mobile-app.md` | Offline-first architecture, voice input |
| ⚠️ **PARTIAL** | `3-modules/08-daily-logs.md` | Needs explicit voice-to-log flow |

**What's Documented:**
- Google Cloud Speech-to-Text with construction vocabulary
- Mobile app: "voice-to-text input" mentioned in overview
- Offline-first with IndexedDB sync queue
- PWA + Capacitor native wrapper

**Gap:** Need explicit voice-to-daily-log workflow documented. The components exist but the specific "speak your daily log" flow isn't detailed.

---

## 2. Predictive Analytics

### 2.1 Schedule Forecasting (Delay Prediction)
**Request:** ML to predict schedule delays before they happen.

| Status | Location | Details |
|--------|----------|---------|
| ✅ **HAVE** | `3-modules/25-schedule-intelligence.md` | Full ML schedule intelligence module |
| ✅ **HAVE** | `1-architecture/ai/ai-engine-design.md` | Delay prediction, risk scoring |

**What's Documented:**
- "Schedule Risk Prediction — Based on weather forecast and current pace, there's a 72% chance of missing the drywall deadline"
- Critical path analysis with AI drift prediction
- Weather impact analysis
- Historical duration learning
- SPI-based health scoring

**Gap:** None - comprehensive coverage.

---

### 2.2 Budget Forecasting (Overrun Prediction)
**Request:** ML to predict budget overruns before they happen.

| Status | Location | Details |
|--------|----------|---------|
| ✅ **HAVE** | `1-architecture/ai/ai-engine-design.md` | Budget forecasting section |
| ✅ **HAVE** | `3-modules/23-price-intelligence.md` | Cost prediction engine |

**What's Documented:**
- "Budget Forecasting — Based on current spending rate, this project will finish $23K over budget. Here are the 3 line items driving the overrun."
- Cost-to-complete projection (EAC/CPI)
- Variance anomaly detection
- Material price volatility tracking

**Gap:** None - comprehensive coverage.

---

### 2.3 Automated Bookkeeping
**Request:** AI agents that automate bookkeeping and project setup.

| Status | Location | Details |
|--------|----------|---------|
| ✅ **HAVE** | `3-modules/13-invoice-ai.md` | AI invoice processing |
| ✅ **HAVE** | `1-architecture/ai/document-intelligence.md` | Document extraction |
| ⚠️ **PARTIAL** | - | "Project setup" automation not explicit |

**What's Documented:**
- Invoice OCR with line item extraction
- Cost code auto-assignment
- Vendor name matching/learning
- GL posting suggestions

**Gap:** "Project setup automation" (auto-creating budget from estimate, auto-assigning cost codes) is implied but not explicitly documented as an AI workflow.

---

### 2.4 P&L Forecasting / Profitability Insights
**Request:** Real-time visibility into job costs, labor burdens, and material price volatility.

| Status | Location | Details |
|--------|----------|---------|
| ✅ **HAVE** | `2-features/FEATURE-JOB-COSTING-ENHANCED.md` | Labor burden, overhead allocation |
| ✅ **HAVE** | `3-modules/23-price-intelligence.md` | Material price volatility |
| ✅ **HAVE** | `2-features/FEATURE-COMPLIANCE-BILLING.md` | ASC 606 WIP reporting |

**What's Documented:**
- Real-time gross profit tracking
- Labor burden calculation (FICA, FUTA, SUTA, WC)
- Overhead allocation to jobs
- WIP overbilled/underbilled analysis
- Material price trend alerts

**Gap:** None - comprehensive coverage.

---

## 3. Automated Compliance and Supply Chain

### 3.1 Automated Lien Waivers & Payments
**Request:** Automate lien waiver creation, signature collection, and tie to payment releases.

| Status | Location | Details |
|--------|----------|---------|
| ✅ **HAVE** | `3-modules/14-lien-waivers.md` | Full lien waiver module |
| ✅ **HAVE** | `2-features/FEATURE-COMPLIANCE-BILLING.md` | 4-type waiver system |
| ✅ **HAVE** | `3-modules/38-contracts-esign.md` | E-signature integration |

**What's Documented:**
- State-specific statutory forms (all 50 states)
- 4 waiver types: conditional/unconditional × progress/final
- Auto-trigger waiver requests on invoice approval
- Vendor portal for e-signature
- Payment hold until waiver received
- Reminder/escalation workflow

**Gap:** None - comprehensive coverage.

---

### 3.2 Decarbonization & Green Building
**Request:** Track carbon footprints, suggest low-carbon materials, generate ESG reports.

| Status | Location | Details |
|--------|----------|---------|
| ❌ **MISSING** | - | No sustainability/carbon tracking module |

**What's Documented:**
- Nothing specific to carbon tracking or ESG

**Gap:** This is a missing feature category. Need to add:
- Material carbon footprint tracking
- Low-carbon alternative suggestions
- ESG compliance reporting
- Green building certification support (LEED, ENERGY STAR)

---

## 4. Lien Waiver AI Automation (Detailed)

### 4.1 Intelligent Document Processing (IDP)
**Request:** AI scans documents, extracts vendor name, project details, amounts.

| Status | Location | Details |
|--------|----------|---------|
| ✅ **HAVE** | `1-architecture/ai/AI-INTEGRATION-MASTER-PLAN.md` | Google Document AI |
| ✅ **HAVE** | `3-modules/13-invoice-ai.md` | Invoice data extraction |

**What's Documented:**
- Google Cloud Document AI for structured extraction
- Invoice Parser, Receipt Parser, Contract Parser
- Vendor name learning/matching
- Format recognition without strict templates

**Gap:** Need to extend Document AI to specifically handle **incoming lien waivers** (not just invoices). The capability exists but waiver-specific parsing isn't documented.

---

### 4.2 Document Generation and Templating
**Request:** Store templates, auto-fill data into waivers.

| Status | Location | Details |
|--------|----------|---------|
| ✅ **HAVE** | `3-modules/14-lien-waivers.md` | Full template system |

**What's Documented:**
- Pre-loaded statutory forms for all states
- Auto-fill from project data, vendor details, invoice amounts
- Version control for form updates
- Custom form builder for non-statutory states

**Gap:** None - comprehensive coverage.

---

### 4.3 E-Signatures and Tracking
**Request:** Digital signatures, automated reminders, status dashboard.

| Status | Location | Details |
|--------|----------|---------|
| ✅ **HAVE** | `3-modules/14-lien-waivers.md` | E-sign workflow |
| ✅ **HAVE** | `3-modules/38-contracts-esign.md` | E-signature module |

**What's Documented:**
- E-sign directly in browser (where legal)
- Photo upload for wet-signature jurisdictions
- Automatic reminder schedule (3, 7, 14 days)
- Vendor portal with waiver status dashboard
- Escalation after N reminders

**Gap:** None - comprehensive coverage.

---

### 4.4 Tie Waivers to AP/Payments
**Request:** Payment cannot be released until waiver validated.

| Status | Location | Details |
|--------|----------|---------|
| ✅ **HAVE** | `3-modules/14-lien-waivers.md` | Compliance gate |

**What's Documented:**
- "Compliance gate: configurable payment hold until waiver received"
- Waiver tied to draw request assembly
- Audit trail for every approval

**Gap:** None - comprehensive coverage.

---

## Gaps to Address

### Critical (Missing Entirely)
| Gap | Description | Recommended Action |
|-----|-------------|-------------------|
| **Sustainability/ESG** | Carbon tracking, green materials, ESG reports | Create `FEATURE-SUSTAINABILITY.md` with new module |

### Moderate (Needs Enhancement)
| Gap | Description | Recommended Action |
|-----|-------------|-------------------|
| **Voice-to-Log Workflow** | Speech-to-text exists but flow not detailed | Add section to `3-modules/08-daily-logs.md` |
| **Project Setup Automation** | AI bookkeeping for new projects | Add to `1-architecture/ai/ai-engine-design.md` |
| **Incoming Waiver OCR** | Parse received waivers, not just generate | Add to `3-modules/14-lien-waivers.md` |

---

## Conclusion

**Coverage: 91%** (11 of 12 features documented)

The only entirely missing feature is **Sustainability/ESG tracking**. All other AI capabilities are documented, with a few needing minor enhancements to complete the workflow specifications.

---

*Audit conducted: February 2026*
