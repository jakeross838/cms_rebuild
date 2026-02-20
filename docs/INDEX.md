# BuildDesk Documentation Index

**Last Updated:** February 2026
**Total Active Documentation Files:** ~140 (9 archived)

This index provides a single entry point to all BuildDesk planning and specification documents.

---

## ⚠️ BEFORE PLANNING: Read This First

**`PLANNING-PROCESS.md`** - Mandatory rules for all planning sessions.
- Clean-as-you-go requirements
- 7-step planning checklist
- Document update order
- Anti-patterns to avoid

---

## Quick Navigation

| I Need To... | Go To |
|--------------|-------|
| **Plan new features** | `PLANNING-PROCESS.md` ★ Read first! |
| Understand the overall system | [Architecture](#-architecture) |
| See what features we're building | [Features](#-features) |
| Understand a specific module | [Modules](#-modules-53-files) |
| See UI/page specifications | [UI Specs](#-ui-specifications) |
| Check build progress | [Build Plan](#-build--execution) |
| Understand compliance requirements | [Compliance](#-compliance--industry-standards) |

---

## 📁 Document Structure

```
docs/
├── INDEX.md                    ← YOU ARE HERE
├── PLANNING-PROCESS.md         ★ MANDATORY: Read before planning
├── BUILD_PLAN.md               ← Master 50-module build plan
│
├── 1-architecture/             ← System design (22 files)
│   ├── system-architecture.md
│   ├── data-model.md
│   ├── multi-tenancy-design.md
│   ├── api-spec.md
│   ├── HISTORY-TRACKING-SYSTEM.md
│   ├── ai/                     ← AI-specific architecture (7 files)
│   │   ├── AI-INTEGRATION-MASTER-PLAN.md    ★ Primary AI doc
│   │   ├── MULTI-TENANT-AI-ARCHITECTURE.md
│   │   └── [5 more AI docs]
│   └── [10 more supporting docs]
│
├── 2-features/                 ← Feature specifications (10 files)
│   ├── FEATURE-IMPLEMENTATION-MASTER.md     ★ Primary feature index
│   ├── FEATURE-COMPLIANCE-BILLING.md
│   ├── FEATURE-JOB-COSTING-ENHANCED.md
│   ├── FEATURE-RFI-CHANGE-ORDER-ENHANCED.md
│   └── [6 more feature docs]
│
├── 3-modules/                  ← Module specifications (53 files)
│   ├── 01-auth-and-access.md
│   ├── 02-configuration-engine.md
│   ├── ...through...
│   └── 50-marketing-website.md
│
├── 4-ui/                       ← UI specifications
│   ├── page-specs/            ← 30 page specifications
│   ├── user-flows/            ← 6 user flow diagrams
│   ├── navigation.md
│   └── ux-principles.md
│
├── 5-research/                 ← Research & analysis (5 files)
├── 6-checklists/               ← Build checklists (5 files)
├── 7-specs/                    ← Platform specifications (2 files)
│
├── _tasks/                     ← Active execution tasks
│   └── current_plan.md
│
└── _archive/                   ← Deprecated docs (do not use)
    ├── planning-summary.md
    └── [other archived files]
```

---

## 🏗️ Architecture

### Core Architecture (Start Here)
| Document | Description | Priority |
|----------|-------------|----------|
| `1-architecture/system-architecture.md` | Overall system design | ★★★ |
| `1-architecture/data-model.md` | Database schema design | ★★★ |
| `1-architecture/multi-tenancy-design.md` | RLS and company isolation | ★★★ |
| `1-architecture/api-spec.md` | API design patterns | ★★ |

### AI Architecture (in `1-architecture/ai/`)
| Document | Description | Priority |
|----------|-------------|----------|
| `ai/AI-INTEGRATION-MASTER-PLAN.md` | **Primary AI integration doc** | ★★★ |
| `ai/MULTI-TENANT-AI-ARCHITECTURE.md` | Scaling AI to 10k+ companies | ★★ |
| `ai/ai-engine-design.md` | AI engine internals | ★★ |
| `ai/notebooklm-scale-architecture.md` | NotebookLM integration | ★ |
| `ai/document-intelligence.md` | Document processing AI | ★ |
| `ai/price-intelligence-integration.md` | Price prediction AI | ★ |
| `ai/roles-duties-ai-integration.md` | AI for role management | ★ |

### Supporting Architecture
| Document | Description |
|----------|-------------|
| `1-architecture/HISTORY-TRACKING-SYSTEM.md` | Audit trail and history |
| `1-architecture/configuration-engine.md` | Company settings system |
| `1-architecture/edge-cases.md` | General edge cases |
| `1-architecture/edge-cases-financial.md` | Financial edge cases |
| `1-architecture/infrastructure-operations.md` | DevOps and infrastructure |
| `1-architecture/normalization-and-crud.md` | Database normalization |
| `1-architecture/per-page-standards.md` | Page-level standards |
| `1-architecture/platform-strategy.md` | Product strategy |
| `1-architecture/reporting-data-gaps.md` | Reporting requirements |
| `1-architecture/system-connections.md` | Module interconnections |
| `1-architecture/unified-data-outputs.md` | Data export standards |

---

## ⭐ Features

### Master Feature Index
**`2-features/FEATURE-IMPLEMENTATION-MASTER.md`** is the primary document that indexes all features with:
- Database schemas (103 tables total)
- Implementation code
- UI components
- Timeline estimates

### Feature Specifications
| Document | Covers | Tables |
|----------|--------|--------|
| `FEATURE-COMPLIANCE-BILLING.md` | ASC 606, AIA G702/G703, Lien Waivers, Davis-Bacon, OSHA | 14 |
| `FEATURE-JOB-COSTING-ENHANCED.md` | Overhead, Labor Burden, Gross Profit Bonuses, WIP | 16 |
| `FEATURE-RFI-CHANGE-ORDER-ENHANCED.md` | RFI SLA Tracking, PCO→COR→CO Workflow | 11 |
| `FEATURE-COMMUNITY.md` | Community forums, vendor reviews | 9 |
| `FEATURE-CONTENT.md` | Articles, knowledge base | 6 |
| `FEATURE-DISCUSSION-CAPTURE.md` | Meeting transcription, action items | 4 |
| `FEATURE-MEETINGS.md` | Meeting templates, agendas | 6 |
| `FEATURE-SUPPORT.md` | Backend support system | 8 |
| `FEATURE-UNDO-SYSTEM.md` | Multi-step undo capability | 3 |

---

## 📦 Modules (53 Files)

Located in `3-modules/`. Numbered 01-50 with detailed specifications.

### Foundation (Modules 01-06)
| # | Module | Description |
|---|--------|-------------|
| 01 | Auth and Access | Authentication, RBAC, permissions |
| 02 | Configuration Engine | Company settings, templates |
| 03 | Core Data Model | Jobs, clients, vendors, cost codes |
| 04 | Navigation & Dashboard | UI navigation, search |
| 05 | Notification Engine | Alerts, emails, push |
| 06 | Document Storage | File management, versioning |

### Project Management (Modules 07-19)
| # | Module | Description |
|---|--------|-------------|
| 07 | Scheduling | Gantt, calendar, dependencies |
| 08 | Daily Logs | Field reports, photos |
| 09 | Budget & Cost Tracking | Cost codes, actuals vs budget |
| 10-19 | *[Various PM modules]* | POs, Invoices, Draws, etc. |

### Intelligence (Modules 20-30)
| # | Module | Description |
|---|--------|-------------|
| 20 | Estimating Engine | Takeoffs, assemblies |
| 21 | Selection Management | Client selections |
| 22 | Vendor Performance | Scorecards, ratings |
| 23 | Price Intelligence | Historical pricing, predictions |
| 24 | AI Document Processing | OCR, extraction |
| 25 | Schedule Intelligence | ML optimization |
| 26 | Bid Management | Bidding workflow |
| 27 | RFI Management | Request for information |
| 28-30 | *[Various intelligence]* | ... |

### Platform (Modules 31-50)
| # | Module | Description |
|---|--------|-------------|
| 31 | Warranty & Home Care | Post-construction |
| 32 | Permitting & Inspections | Permit tracking |
| 33 | Safety & Compliance | OSHA, certifications |
| 34 | HR & Workforce | Employee management |
| 35 | Equipment & Assets | Fleet, tools |
| 36-50 | *[Platform modules]* | Marketing, Mobile, API, etc. |

---

## 🎨 UI Specifications

Located in `4-ui/`.

### Page Specs (30 files in `4-ui/page-specs/`)
Detailed specifications for every page including:
- Wireframes/mockups
- Data requirements
- Actions and behaviors
- Component breakdown

### User Flows (6 files in `4-ui/user-flows/`)
| Flow | Description |
|------|-------------|
| `lead-to-project.md` | Lead → Estimate → Contract → Job |
| `change-order.md` | Change order lifecycle |
| `daily-field-operations.md` | Field team daily workflow |
| `draw-request.md` | Draw/billing workflow |
| `invoice-processing.md` | AP workflow |
| `new-project-creation.md` | Job setup flow |

### UI Standards
| Document | Description |
|----------|-------------|
| `4-ui/navigation.md` | Navigation structure |
| `4-ui/ux-principles.md` | UX guidelines |
| `4-ui/views-index.md` | All 112 views indexed |

### UI Preview Components
Located in `app/src/components/skeleton/previews/`:
| Preview | Route | Description |
|---------|-------|-------------|
| `aia-billing-preview.tsx` | `/skeleton/billing` | AIA G702/G703, lien waivers |
| `certified-payroll-preview.tsx` | `/skeleton/certified-payroll` | Davis-Bacon, WH-347 |
| `rfi-management-preview.tsx` | `/skeleton/rfis/sla` | RFI SLA tracking |
| `expenses-preview.tsx` | `/skeleton/expenses` | Expense management |
| `revenue-preview.tsx` | `/skeleton/revenue` | Revenue & bonuses |
| `meetings-preview.tsx` | `/skeleton/meetings` | Meeting management |
| *[and 60+ more previews]* | | |

---

## 🔨 Build & Execution

### Primary Build Documents
| Document | Purpose |
|----------|---------|
| `BUILD_PLAN.md` | **Master 50-module build plan** with phases, dependencies |
| `_tasks/current_plan.md` | Current execution tasks for Claude Code |
| `PLANNING-PROCESS.md` | **Mandatory planning rules** |

### Checklists (in `6-checklists/`)
| Document | Purpose |
|----------|---------|
| `build-phases.md` | Phase completion tracking |
| `dependency-graph.md` | Module dependencies |
| `test-plan.md` | Testing strategy |
| `audit-report.md` | Code audit results |
| `edge-cases.md` | Edge case coverage |

---

## 🔬 Research & Analysis

| Document | Description |
|----------|-------------|
| `RESEARCH-FINDINGS-AND-RECOMMENDATIONS.md` | Industry standards research (ASC 606, Davis-Bacon, etc.) |
| `FTQ360_COMPETITIVE_ANALYSIS.md` | Competitor analysis |
| `gap_analysis.md` | Feature gap analysis |
| `5-research/apps-we-replace.md` | Target market analysis |
| `5-research/competitor-analysis.md` | Detailed competitor breakdown |
| `5-research/construction-workflows.md` | Industry workflow patterns |
| `5-research/marketing-features.md` | Marketing positioning |
| `5-research/state-regulations.md` | State-by-state compliance |

---

## 📋 Compliance & Industry Standards

Based on research in `RESEARCH-FINDINGS-AND-RECOMMENDATIONS.md`:

### Accounting & Billing
- **ASC 606 Revenue Recognition** - 5-step model, cost-to-cost method
- **AIA G702/G703** - Standard pay application forms
- **State Retainage Rules** - NY, CA, TX, etc.

### Payroll & Labor
- **Davis-Bacon Act** - Prevailing wage, WH-347 forms
- **Labor Burden Calculation** - FICA, FUTA, SUTA, Workers' Comp
- **Certified Payroll** - Weekly submission requirements

### Safety & Compliance
- **OSHA 300/301 Logs** - Injury/illness recording
- **Lien Waivers** - 4-type system with state forms

### Project Management
- **RFI SLA Tracking** - Response time compliance
- **Change Order Workflow** - PCO → COR → CO pipeline

---

## 📊 Document Statistics

| Category | Location | Files | Status |
|----------|----------|-------|--------|
| Architecture | `1-architecture/` | 15 | ✅ |
| AI Architecture | `1-architecture/ai/` | 7 | ✅ |
| Features | `2-features/` | 10 | ✅ |
| Modules | `3-modules/` | 53 | ✅ |
| UI Page Specs | `4-ui/page-specs/` | 30 | ✅ |
| UI User Flows | `4-ui/user-flows/` | 6 | ✅ |
| UI Standards | `4-ui/` | 3 | ✅ |
| Research | `5-research/` | 5 | ✅ |
| Checklists | `6-checklists/` | 5 | ✅ |
| Specs | `7-specs/` | 2 | ✅ |
| Root Level | `docs/` | 8 | ✅ |
| **Active Total** | | **~144** | |
| Archived | `_archive/` | 4 | 📦 |

---

## 🗂️ Archived Documents

The following files have been archived to `_archive/` (do not use):

| File | Reason |
|------|--------|
| `planning-summary.md` | Replaced by INDEX.md |
| `specs/gap-analysis-expanded.md` | Redundant with gap_analysis.md |
| `specs/platform-vision.md` | Merged into platform-strategy.md |
| `product/notebooklm-value-proposition.md` | Merged into AI docs |

---

## How to Use This Documentation

### For New Team Members
1. Read `PLANNING-PROCESS.md` for planning rules
2. Read `INDEX.md` (this file) for orientation
3. Read `1-architecture/system-architecture.md` for system overview
4. Read `BUILD_PLAN.md` for current project state

### For Implementation
1. Check `_tasks/current_plan.md` for active tasks
2. Find relevant module in `3-modules/`
3. Check `2-features/FEATURE-IMPLEMENTATION-MASTER.md` for schemas
4. Reference `4-ui/page-specs/` for UI details

### For Planning New Features
1. **READ `PLANNING-PROCESS.md` FIRST** ★
2. Follow the 7-step planning checklist
3. Update existing docs (don't create new scattered files)
4. Update this index if structure changes

---

*BuildDesk Documentation Index v2.0*
*Reorganized: February 2026*
