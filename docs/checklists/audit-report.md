# Planning Documents Audit Report

## Audit Summary

**Documents Reviewed:** 17 plan files + 3 master documents
**Total Views Planned:** 64
**Overall Status:** Comprehensive with some gaps identified

---

## 1. CONSISTENCY ISSUES

### 1.1 Format/Structure Inconsistencies

| Issue | Files Affected | Recommendation |
|-------|----------------|----------------|
| Some files use "Overview" header, others don't | Various | Standardize header format |
| Component structure paths inconsistent (`pages/` vs `app/`) | Multiple | Use `app/` (Next.js App Router standard) |
| ~~Some views missing "Mobile Considerations" section~~ | ~~BUDGET.md, VENDORS_CLIENTS_COSTCODES.md, QUICKBOOKS.md~~ | ~~Add mobile sections~~ FIXED - All 18 files now have Mobile Considerations |
| ~~"Affected By" / "Affects" sections inconsistent~~ | ~~Some files have, some don't~~ | ~~Add to all plan files~~ FIXED - All 18 files now have Affected By/Affects sections |

### 1.2 Status Naming Inconsistencies

**Invoice statuses** (INVOICES.md):
- `needs_matching`, `draft`, `pm_pending`, `accountant_pending`, `owner_pending`, `approved`, `in_draw`, `paid`

**PO statuses** (POS_DRAWS_COS.md):
- `draft`, `pm_pending`, `accountant_pending`, `owner_pending`, `approved`, `sent`, `partially_received`, `completed`, `cancelled`

**Recommendation:** Ensure database schema uses consistent snake_case for all status enums.

---

## 2. MISSING ELEMENTS

### 2.1 Missing Views (Not in plan files)

| Missing Item | Should Be In | Priority | Status |
|--------------|--------------|----------|--------|
| ~~Files/Documents management~~ | ~~JOB_DETAIL mentions it~~ | ~~Medium~~ | DONE - views/jobs/FILES_DOCUMENTS.md |
| ~~Plans (construction drawings)~~ | ~~Referenced in nav~~ | ~~Medium~~ | DONE - Included in Files (Plans & Drawings folder) |
| Notifications list/center | GLOBAL_SETTINGS.md mentions bell icon, no detail | Low | |
| Activity Log viewer (admin) | SYSTEM_DESIGN mentions it, no view plan | Low | |

### 2.2 Missing from SYSTEM_DESIGN.md Database Schema

| Missing Table/Field | Location | Notes |
|---------------------|----------|-------|
| `job_assignments` | Jobs section | Defined in JOBS_LIST.md but not in SYSTEM_DESIGN |
| `portal_users` | Client Portal | Client auth is separate from admin users |
| `proposal_templates` | Proposals | For reusable proposal content |
| `estimate_templates` | Estimates | For reusable line items/assemblies |
| `qb_connection` | Integrations | QuickBooks OAuth tokens |
| `qb_sync_log` | Integrations | Sync history |
| `qb_entity_map` | Integrations | CMS ↔ QB ID mapping |
| `task_dependencies` | Schedule | In SYSTEM_DESIGN but missing from field views |
| `daily_log_crew` | Daily Logs | Crew entries with vendors/workers/hours |
| `daily_log_materials` | Daily Logs | Delivery tracking |
| `punch_item` additional fields | Closeout | item_number, verified_at, verified_by |

### 2.3 Missing API Endpoints

| Missing Endpoint | Plan File | Notes |
|------------------|-----------|-------|
| `POST /api/invoices/:id/match` | INVOICES.md | For manual job/vendor matching |
| `GET /api/jobs/:id/activities` | JOB_DETAIL.md | Activity feed endpoint |
| `POST /api/clients/:id/portal-invite` | VENDORS_CLIENTS_COSTCODES.md | Send portal invite |
| `POST /api/cost-codes/import` | VENDORS_CLIENTS_COSTCODES.md | Already in SYSTEM_DESIGN, confirm consistent |
| `GET /api/reports/labor-hours` | REPORTS.md | Listed but not fully documented |

---

## 3. WORKFLOW GAPS

### 3.1 Lead → Job Conversion

**Current:** Lead converted → Job created → Client created (if new)

**Gap:** No mention of what happens to existing estimates/proposals if lead had them before conversion. LEADS_PIPELINE.md mentions creating job, but estimates happen WITHIN jobs.

**Resolution:** Lead should only have notes/contact info. Estimates start after job is created.

### 3.2 Invoice Rejection Flow - RESOLVED

~~**Gap:** What happens when invoice is rejected?~~

**FIXED:** Added to SYSTEM_DESIGN.md invoices table:
- `rejected_at`, `rejected_by`, `rejection_reason` fields
- Status enum now includes 'rejected'
- Workflow: rejected invoice returns to 'needs_review' for correction

### 3.3 Draw Rejection Flow - RESOLVED

~~**Gap:** Similar to invoices - what happens when client rejects draw?~~

**FIXED:** Added to SYSTEM_DESIGN.md draws table:
- `rejected_at`, `rejected_by`, `rejection_reason` fields
- `approved_by` field (was missing)
- Status enum now includes 'rejected'
- Workflow: rejected draw returns to 'draft' for revision

### 3.4 PO AI-Assisted Creation - RESOLVED

~~**POS_DRAWS_COS.md** header mentions "AI-assisted PO creation from vendor quotes" but no detail.~~

**FIXED:** Added comprehensive "AI-Assisted PO Creation" section:
- Upload vendor quote (PDF/image/text)
- AI extracts vendor, line items, amounts, dates
- Cost code suggestions with confidence scores
- Review/edit before creating PO
- API endpoints for extraction workflow

---

## 4. CROSS-DOCUMENT CONFLICTS

### 4.1 Navigation Structure

**NAVIGATION.md** says:
- Pre-Con dropdown shows if `job.status = pre-construction`
- Closeout dropdown shows if `job.status = completed/warranty`

**JOB_DETAIL.md** shows all tabs always visible:
- "Overview | Budget | Schedule | Invoices | Draws | Photos | Logs | Files | Change Orders | Selections | Punch List"

**Recommendation:** Align these - either always show all sections or conditionally show based on status. Suggest: Show all, but gray out/hide empty sections.

### 4.2 Job Status Values - RESOLVED

~~**SYSTEM_DESIGN.md:** `status`: lead, active, on_hold, completed, cancelled~~

**FIXED:** Updated SYSTEM_DESIGN.md to match JOBS_LIST.md:
- `status`: pre_construction, active, on_hold, completed, warranty, cancelled
- Default changed from 'active' to 'pre_construction'
- Removed 'lead' (leads are separate entity)

### 4.3 Bid/Proposal Confusion - RESOLVED

~~**SYSTEM_DESIGN.md** has separate `bids` and `proposals` tables~~

**FIXED:** Removed `bids` table. Updated workflow in SYSTEM_DESIGN.md:
- Lead → Job (on qualify) → Estimate → Proposal → Contract
- Estimates now require job_id (NOT NULL)
- Lead statuses updated: new, contacted, qualified, converted, lost

---

## 5. COMPLETENESS CHECK

### 5.1 All Views Have Plan Files ✓

| Area | Views | Status |
|------|-------|--------|
| Global | 4 | ✓ |
| Jobs | 4 | ✓ |
| Financial | 13 | ✓ |
| Pre-Con | 9 | ✓ |
| Field Ops | 8 | ✓ |
| Directory | 8 | ✓ |
| Closeout | 7 | ✓ |
| Reports | 5 | ✓ |
| Portal | 5 | ✓ |
| Integrations | 2 | ✓ |

### 5.2 All Major Workflows Documented ✓

| Workflow | Documented |
|----------|------------|
| Lead → Job | ✓ |
| Estimate → Proposal → Contract → Budget | ✓ |
| Invoice Processing (AI + Approval) | ✓ |
| PO Creation & Management | ✓ |
| Draw Creation & Client Approval | ✓ |
| Change Order → Budget Update | ✓ |
| Selection → Variance → CO | ✓ |
| Punch List → Closeout | ✓ |
| Client Portal Access | ✓ |
| QuickBooks Sync | ✓ |

### 5.3 Database Tables Coverage

**In SYSTEM_DESIGN but not detailed in view files:**
- `activity_logs` - No viewer planned (admin feature, low priority)
- `files` - Generic file storage, used throughout
- `notifications` - No list view planned

**In View Files but not in SYSTEM_DESIGN:** (ALL FIXED)
- ~~`job_assignments`~~ - Added
- ~~`portal_users`~~ - Added
- ~~`qb_*` tables~~ - Added (section 5.13)

---

## 6. RECOMMENDED ACTIONS

### High Priority - COMPLETED

1. ~~**Add `job_assignments` table to SYSTEM_DESIGN.md**~~ DONE

2. ~~**Remove `bids` table from SYSTEM_DESIGN.md**~~ DONE - Workflow updated to Lead → Job → Estimate

3. ~~**Update job status enum**~~ DONE - Now: pre_construction, active, on_hold, completed, warranty, cancelled

4. ~~**Add `portal_users` table**~~ DONE - Added to section 5.12

5. ~~**Add QuickBooks tables to SYSTEM_DESIGN.md**~~ DONE - Added section 5.13 with qb_connection, qb_sync_log, qb_entity_map

**Additional Fixes Applied:**
- Fixed estimates table to require job_id (estimates belong to jobs, not leads)
- Fixed lead status enum (new, contacted, qualified, converted, lost)
- Updated data flow diagrams to reflect correct workflow
- Removed Bids pages from page map

### Medium Priority

6. ~~**Add Files/Documents view plan**~~ DONE
   - Created views/jobs/FILES_DOCUMENTS.md (4 views)
   - Added folders and file_shares tables to SYSTEM_DESIGN.md
   - Enhanced files table with versioning, sharing, folder support

7. ~~**Add rejection fields to invoices and draws**~~ DONE
   - Added to invoices: `rejected_at`, `rejected_by`, `rejection_reason`
   - Added to draws: `rejected_at`, `rejected_by`, `rejection_reason`, `approved_by`
   - Updated status enums to include 'rejected'

8. ~~**Document AI-assisted PO creation**~~ DONE
   - Added comprehensive AI-Assisted PO Creation section to POS_DRAWS_COS.md
   - Upload vendor quote → AI extraction → Review → Create PO
   - Includes confidence scoring, cost code mapping, line item extraction

9. ~~**Add Mobile Considerations** to all plan files missing it~~ DONE
   - Added to all 18 view plan files

### Low Priority

10. **Add Notifications view plan** - Bell icon detail page

11. **Add Activity Log admin view** - For audit purposes

12. **Standardize all plan file formats** with consistent sections

---

## 7. TERMINOLOGY GLOSSARY

To ensure consistency, use these terms:

| Term | Definition |
|------|------------|
| Job | A construction project (synonyms: project) |
| Lead | A potential project before becoming a job |
| Client | The customer/homeowner (synonyms: customer) |
| Vendor | Subcontractor or supplier (synonyms: sub, subcontractor) |
| Invoice | Vendor's bill to builder |
| Draw | Builder's bill to client (AIA pay application) |
| Estimate | Internal cost breakdown |
| Proposal | Client-facing quote |
| Contract | Signed proposal |
| Budget | Locked estimate as project budget |
| Allowance | Budget amount for client selection |
| Selection | Client's choice for an allowance item |
| CO | Change Order |
| PO | Purchase Order |
| PM | Project Manager |

---

## 8. NEXT STEPS

1. [x] Update SYSTEM_DESIGN.md with missing tables (job_assignments, portal_users, qb_* tables)
2. [x] Remove bids table from SYSTEM_DESIGN.md (updated workflow: Lead → Job → Estimate)
3. [x] Fix job status enum (pre_construction, active, on_hold, completed, warranty, cancelled)
4. [x] Fix estimates table (belongs to jobs, not leads)
5. [x] Fix lead status enum (new, contacted, qualified, converted, lost)
6. [x] Add Files/Documents view plan (views/jobs/FILES_DOCUMENTS.md)
7. [x] Add rejection workflows to financial documents (invoices + draws)
8. [x] Document AI-assisted PO creation in POS_DRAWS_COS.md
9. [x] Standardize Mobile Considerations across all files (added to all 18 plan files)
10. [x] Add Affected By/Affects sections to all plan files (added to all 18 files)
11. [ ] Review and approve this audit report

---

## Audit Completed

**Date:** Session 2 (continued)
**Auditor:** Claude
**Status:** Critical fixes applied, remaining items are medium/low priority
