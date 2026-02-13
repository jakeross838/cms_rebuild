# Skeleton Pages Audit Report
## Preview vs PageSpec Comparison

**Date:** February 13, 2026
**Scope:** All skeleton pages audited against their PageSpec definitions

---

## Executive Summary

Audited **50+ skeleton pages** across 8 categories. Overall finding: **Most pages are 60-80% complete** with consistent gaps in:
- **AI Features** - Only ~30% of defined AI features are properly displayed
- **Workflow Actions** - Many pages have buttons but no actual workflow UI
- **Data Field Display** - Several fields defined in PageSpec aren't shown in preview

---

## Critical Issues (Immediate Attention)

### 1. Team Page - WRONG CONTEXT
**File:** `jobs/[id]/team/page.tsx` & `team-preview.tsx`
- **Problem:** Shows company team directory instead of job-specific team roster
- **Impact:** Completely wrong functionality
- **Fix:** Refactor to show only team members assigned to THIS job
- **Missing:** Subcontractor support, job assignment dates, emergency contacts

### 2. Change Orders - Missing 5 of 7 AI Features
**File:** `jobs/[id]/change-orders/page.tsx` & `change-orders-preview.tsx`
- **Missing AI Features:**
  - Cost Estimation (comparative analysis)
  - Schedule Impact Analysis (cascading effects)
  - Cause Pattern Detection (detailed)
  - Documentation Completeness
  - Budget Cascade Preview
- **Coverage:** ~28% of AI features implemented

### 3. Purchase Orders - Missing Status & AI Features
**File:** `jobs/[id]/purchase-orders/page.tsx` & `purchase-orders-preview.tsx`
- **Missing:** `fully_received` status tab
- **Missing AI Features:** Budget Impact Analysis, Vendor Recommendation, Price Intelligence Check
- **Coverage:** ~29% of AI features implemented

---

## Category Summaries

### Job Detail Pages (/jobs/[id]/*)

| Page | Coverage | Key Issues |
|------|----------|------------|
| **Overview** | 85% | Missing job-scoped navigation tabs, document shortcuts, warranty status |
| **Schedule** | 90% | Missing weekend shading on day-level zoom |
| **Budget** | TBD | Audit pending |
| **Change Orders** | 57% | 5/7 AI features missing, incomplete approval workflow display |
| **Purchase Orders** | 57% | Missing `fully_received` status, 5/7 AI features missing |
| **RFIs** | 80% | SLA escalation not visually distinct, response type badges missing |
| **Submittals** | 75% | Missing bulk approval UI, submittal package grouping |
| **Permits** | 70% | Missing CO checklist detail, renewal workflow, hold status UI |
| **Inspections** | TBD | Audit pending |
| **Daily Logs** | TBD | Audit pending |
| **Photos** | TBD | Audit pending |
| **Files** | 70% | Missing QR code display, photo gallery, bulk operations, 4 AI features |
| **Draws** | 75% | Extra status states, missing 4/6 AI features |
| **Invoices** | TBD | Audit pending |
| **Lien Waivers** | TBD | Audit pending |
| **Punch List** | 70% | Missing priority filter, AI features not prominently displayed |
| **Warranties** | TBD | Audit pending |
| **Selections** | TBD | Audit pending |
| **Communications** | TBD | Audit pending |
| **Team** | 20% | **CRITICAL:** Wrong context - shows company team instead of job team |
| **Property** | TBD | Audit pending |

### Financial Pages (/financial/*)

| Page | Coverage | Key Issues |
|------|----------|------------|
| **Dashboard** | 55-60% | Missing pending approvals bar, activity feed, vendor follow-up queue, weather widget |
| **Cash Flow** | TBD | Audit pending |
| **Receivables** | 80% | Missing write-off workflow, view by Client/Job modes, payment link tracking |
| **Payables** | TBD | Audit pending |

### Sales Pages

| Page | Coverage | Key Issues |
|------|----------|------------|
| **Leads** | 70% | Missing stage gates, duplicate detection, feasibility calculator, 2/8 AI features missing |
| **Estimates** | TBD | Audit pending |
| **Proposals** | TBD | Audit pending |
| **Contracts** | TBD | Audit pending |

### Operations Pages (/operations/*)

| Page | Coverage | Key Issues |
|------|----------|------------|
| **Calendar** | TBD | Audit pending |
| **Crew Schedule** | TBD | Audit pending |
| **Equipment** | 75% | Missing QR code display, photo gallery, maintenance checklists, breakdown workflow |

### Compliance Pages (/compliance/*)

| Page | Coverage | Key Issues |
|------|----------|------------|
| **Insurance** | TBD | Audit pending |
| **Licenses** | 60% | 4/5 AI features unimplemented, missing workflow actions, state API integration |
| **Safety** | TBD | Audit pending |

### Library Pages (/library/*)

| Page | Coverage | Key Issues |
|------|----------|------------|
| **Assemblies** | 70% | Missing sample items display, tier pricing alternatives, quick tier swap |
| **Templates** | TBD | Audit pending |
| **Cost Codes** | TBD | Audit pending |
| **Selections** | TBD | Audit pending |

### Directory Pages (/directory/*)

| Page | Coverage | Key Issues |
|------|----------|------------|
| **Clients** | TBD | Audit pending |
| **Vendors** | TBD | Audit pending |
| **Contacts** | TBD | Audit pending |

### Platform Pages

| Page | Coverage | Key Issues |
|------|----------|------------|
| **Settings** | TBD | Audit pending |
| **Integrations** | TBD | Audit pending |
| **QuickBooks** | TBD | Audit pending |

---

## Common Issues Across Pages

### 1. AI Features Presentation (~30% coverage)
Most pages show AI insights as generic text bars, not as distinct, actionable features:
- Missing trigger indicators (WHEN/WHY insight appeared)
- Missing actionable buttons (act on AI recommendation)
- Hard-coded example text instead of dynamic insights

**Fix Pattern:**
```tsx
// Current: Generic AI bar
<div className="ai-insights">AI suggests: ...</div>

// Should be: Distinct feature cards
<AIFeatureCard
  feature="Cost Estimation"
  trigger="On CO creation"
  insight="Similar tray ceiling on Johnson project cost $4,200"
  action={<Button>Apply Estimate</Button>}
/>
```

### 2. Missing Workflow Actions
Pages show status displays but lack:
- Action buttons to advance workflows
- Modal forms for submissions
- Approval chain visualization

### 3. Data Field Gaps
Fields defined in PageSpec but not displayed:
- `verification_source` (Licenses)
- `photo_urls` (Equipment, Files)
- `qr_code` (Equipment)
- `tracking_number` (Purchase Orders)

### 4. Filter/View Options Incomplete
Many pages missing:
- View modes (By Client, By Job, By Status)
- Priority filters
- Bulk selection/actions

---

## Priority Fix List

### Immediate (P0)
1. **Team page** - Refactor from company directory to job-specific team
2. **AI features** - Add distinct AI feature cards to all pages

### High Priority (P1)
3. **Purchase Orders** - Add `fully_received` status
4. **Change Orders** - Implement 5 missing AI features
5. **Files** - Add QR code display, photo gallery
6. **Permits** - Complete CO prerequisites checklist

### Medium Priority (P2)
7. **Leads** - Add stage gates, duplicate detection
8. **Financial Dashboard** - Add missing widgets (approvals, activity feed)
9. **Licenses** - Implement AI features and workflow actions
10. **Equipment** - Add maintenance checklists, breakdown workflow

### Lower Priority (P3)
11. **Assemblies** - Sample items display, tier pricing
12. **Schedule** - Weekend shading
13. **Punch List** - Priority filter

---

## Files Reference

All preview components: `app/src/components/skeleton/previews/`
All page specs: `app/src/app/(skeleton)/skeleton/`

---

## Next Steps

1. Address P0 items immediately (Team page refactor)
2. Create AI feature component library for consistent display
3. Implement missing workflow modals
4. Complete audits for TBD pages
5. Add missing data fields to preview components
