# RossOS - Views Index

This document tracks all views/pages in the system and their planning status.

**Related Documents:**
- [NAVIGATION.md](NAVIGATION.md) - App-wide navigation structure
- [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md) - Database schema and API design

## Status Legend
- ⬜ Not started
- 🟡 In planning (questions asked)
- 🟢 Plan complete
- 🔵 Built

---

## 1. GLOBAL (4 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Login | 🟢 | [views/global/GLOBAL_SETTINGS.md](views/global/GLOBAL_SETTINGS.md) |
| Dashboard | 🟢 | [views/global/GLOBAL_SETTINGS.md](views/global/GLOBAL_SETTINGS.md) |
| Settings - Company | 🟢 | [views/global/GLOBAL_SETTINGS.md](views/global/GLOBAL_SETTINGS.md) |
| Settings - Users | 🟢 | [views/global/GLOBAL_SETTINGS.md](views/global/GLOBAL_SETTINGS.md) |

## 2. JOBS (3 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Job Sidebar (list) | 🟢 | [views/jobs/JOBS_LIST.md](views/jobs/JOBS_LIST.md) |
| Job Create | 🟢 | [views/jobs/JOB_CREATE.md](views/jobs/JOB_CREATE.md) |
| Job Overview | 🟢 | [views/jobs/JOB_DETAIL.md](views/jobs/JOB_DETAIL.md) |

*Note: Job Settings is a modal/panel, not a separate view. See [NAVIGATION.md](NAVIGATION.md)*

## 3. BUDGET (1 view) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Budget Overview (job tab) | 🟢 | [views/jobs/BUDGET.md](views/jobs/BUDGET.md) |

*Note: Budget is read-only, modified via Change Orders. Budget lines come from signed estimate.*

## 3.5 FILES & DOCUMENTS (4 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| File Browser (job tab) | 🟢 | [views/jobs/FILES_DOCUMENTS.md](views/jobs/FILES_DOCUMENTS.md) |
| File Upload | 🟢 | [views/jobs/FILES_DOCUMENTS.md](views/jobs/FILES_DOCUMENTS.md) |
| File Detail/Preview | 🟢 | [views/jobs/FILES_DOCUMENTS.md](views/jobs/FILES_DOCUMENTS.md) |
| Folder Management | 🟢 | [views/jobs/FILES_DOCUMENTS.md](views/jobs/FILES_DOCUMENTS.md) |

*Note: Centralized document management for contracts, permits, plans, submittals, RFIs, vendor docs.*

## 4. INVOICES (4 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Invoices List | 🟢 | [views/financial/INVOICES.md](views/financial/INVOICES.md) |
| Invoice Detail | 🟢 | [views/financial/INVOICES.md](views/financial/INVOICES.md) |
| Invoice Upload (AI) | 🟢 | [views/financial/INVOICES.md](views/financial/INVOICES.md) |
| Invoice Allocation | 🟢 | [views/financial/INVOICES.md](views/financial/INVOICES.md) |

## 5. PURCHASE ORDERS (3 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| PO List | 🟢 | [views/financial/POS_DRAWS_COS.md](views/financial/POS_DRAWS_COS.md) |
| PO Create (AI-assisted) | 🟢 | [views/financial/POS_DRAWS_COS.md](views/financial/POS_DRAWS_COS.md) |
| PO Detail | 🟢 | [views/financial/POS_DRAWS_COS.md](views/financial/POS_DRAWS_COS.md) |

*Note: AI can extract line items from vendor quotes/estimates to create POs*

## 6. DRAWS (3 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Draws List | 🟢 | [views/financial/POS_DRAWS_COS.md](views/financial/POS_DRAWS_COS.md) |
| Draw Editor | 🟢 | [views/financial/POS_DRAWS_COS.md](views/financial/POS_DRAWS_COS.md) |
| Draw PDF Export | 🟢 | [views/financial/POS_DRAWS_COS.md](views/financial/POS_DRAWS_COS.md) |

## 7. CHANGE ORDERS (3 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| CO List | 🟢 | [views/financial/POS_DRAWS_COS.md](views/financial/POS_DRAWS_COS.md) |
| CO Create/Edit | 🟢 | [views/financial/POS_DRAWS_COS.md](views/financial/POS_DRAWS_COS.md) |
| CO Detail | 🟢 | [views/financial/POS_DRAWS_COS.md](views/financial/POS_DRAWS_COS.md) |

## 8. SCHEDULE (3 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Schedule View (Gantt + List) | 🟢 | [views/field/SCHEDULE_LOGS_PHOTOS.md](views/field/SCHEDULE_LOGS_PHOTOS.md) |
| Task Detail/Edit | 🟢 | [views/field/SCHEDULE_LOGS_PHOTOS.md](views/field/SCHEDULE_LOGS_PHOTOS.md) |
| Task Create | 🟢 | [views/field/SCHEDULE_LOGS_PHOTOS.md](views/field/SCHEDULE_LOGS_PHOTOS.md) |

## 9. DAILY LOGS (3 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Daily Logs List | 🟢 | [views/field/SCHEDULE_LOGS_PHOTOS.md](views/field/SCHEDULE_LOGS_PHOTOS.md) |
| Daily Log Entry | 🟢 | [views/field/SCHEDULE_LOGS_PHOTOS.md](views/field/SCHEDULE_LOGS_PHOTOS.md) |
| Daily Log Detail | 🟢 | [views/field/SCHEDULE_LOGS_PHOTOS.md](views/field/SCHEDULE_LOGS_PHOTOS.md) |

## 10. PHOTOS (2 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Photo Gallery | 🟢 | [views/field/SCHEDULE_LOGS_PHOTOS.md](views/field/SCHEDULE_LOGS_PHOTOS.md) |
| Photo Upload | 🟢 | [views/field/SCHEDULE_LOGS_PHOTOS.md](views/field/SCHEDULE_LOGS_PHOTOS.md) |

## 11. PRE-CONSTRUCTION - LEADS (3 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Leads Pipeline | 🟢 | [views/leads/LEADS_PIPELINE.md](views/leads/LEADS_PIPELINE.md) |
| Lead Detail | 🟢 | [views/leads/LEAD_DETAIL.md](views/leads/LEAD_DETAIL.md) |
| Lead Create | 🟢 | [views/leads/LEAD_CREATE.md](views/leads/LEAD_CREATE.md) |

## 12. PRE-CONSTRUCTION - ESTIMATES (3 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Estimates List | 🟢 | [views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md](views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md) |
| Estimate Builder | 🟢 | [views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md](views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md) |
| Estimate → Budget | 🟢 | [views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md](views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md) |

## 13. PRE-CONSTRUCTION - PROPOSALS (3 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Proposals List | 🟢 | [views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md](views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md) |
| Proposal Editor | 🟢 | [views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md](views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md) |
| Proposal Send | 🟢 | [views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md](views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md) |

## 14. PRE-CONSTRUCTION - CONTRACTS (1 view) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Contract (signed proposal) | 🟢 | [views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md](views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md) |

*Note: Contract is the signed proposal view, not a separate creation flow*

## 15. SELECTIONS (2 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Selections List | 🟢 | [views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md](views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md) |
| Selection Detail | 🟢 | [views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md](views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md) |

*Note: Selections are created from allowances in estimates*

## 16. DIRECTORY - VENDORS (3 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Vendors List | 🟢 | [views/directory/VENDORS_CLIENTS_COSTCODES.md](views/directory/VENDORS_CLIENTS_COSTCODES.md) |
| Vendor Detail | 🟢 | [views/directory/VENDORS_CLIENTS_COSTCODES.md](views/directory/VENDORS_CLIENTS_COSTCODES.md) |
| Vendor Create/Edit | 🟢 | [views/directory/VENDORS_CLIENTS_COSTCODES.md](views/directory/VENDORS_CLIENTS_COSTCODES.md) |

## 17. DIRECTORY - CLIENTS (3 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Clients List | 🟢 | [views/directory/VENDORS_CLIENTS_COSTCODES.md](views/directory/VENDORS_CLIENTS_COSTCODES.md) |
| Client Detail | 🟢 | [views/directory/VENDORS_CLIENTS_COSTCODES.md](views/directory/VENDORS_CLIENTS_COSTCODES.md) |
| Client Create/Edit | 🟢 | [views/directory/VENDORS_CLIENTS_COSTCODES.md](views/directory/VENDORS_CLIENTS_COSTCODES.md) |

## 18. COST CODES (2 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Cost Codes List | 🟢 | [views/directory/VENDORS_CLIENTS_COSTCODES.md](views/directory/VENDORS_CLIENTS_COSTCODES.md) |
| Cost Code Editor | 🟢 | [views/directory/VENDORS_CLIENTS_COSTCODES.md](views/directory/VENDORS_CLIENTS_COSTCODES.md) |

## 19. CLOSEOUT - PUNCH LISTS (3 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Punch List (job tab) | 🟢 | [views/closeout/PUNCH_DOCS_WARRANTIES.md](views/closeout/PUNCH_DOCS_WARRANTIES.md) |
| Punch Item Detail | 🟢 | [views/closeout/PUNCH_DOCS_WARRANTIES.md](views/closeout/PUNCH_DOCS_WARRANTIES.md) |
| Punch Item Create | 🟢 | [views/closeout/PUNCH_DOCS_WARRANTIES.md](views/closeout/PUNCH_DOCS_WARRANTIES.md) |

## 20. CLOSEOUT - FINAL DOCS (2 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Final Docs List | 🟢 | [views/closeout/PUNCH_DOCS_WARRANTIES.md](views/closeout/PUNCH_DOCS_WARRANTIES.md) |
| Final Doc Upload | 🟢 | [views/closeout/PUNCH_DOCS_WARRANTIES.md](views/closeout/PUNCH_DOCS_WARRANTIES.md) |

## 21. CLOSEOUT - WARRANTIES (2 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Warranties List | 🟢 | [views/closeout/PUNCH_DOCS_WARRANTIES.md](views/closeout/PUNCH_DOCS_WARRANTIES.md) |
| Warranty Detail/Create | 🟢 | [views/closeout/PUNCH_DOCS_WARRANTIES.md](views/closeout/PUNCH_DOCS_WARRANTIES.md) |

## 22. REPORTS (5 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Reports Hub | 🟢 | [views/reports/REPORTS.md](views/reports/REPORTS.md) |
| Job Profitability Report | 🟢 | [views/reports/REPORTS.md](views/reports/REPORTS.md) |
| Budget Variance Report | 🟢 | [views/reports/REPORTS.md](views/reports/REPORTS.md) |
| Cash Flow Report | 🟢 | [views/reports/REPORTS.md](views/reports/REPORTS.md) |
| P&L Dashboard | 🟢 | [views/reports/REPORTS.md](views/reports/REPORTS.md) |

## 23. CLIENT PORTAL (5 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Portal Login | 🟢 | [views/portal/CLIENT_PORTAL.md](views/portal/CLIENT_PORTAL.md) |
| Portal Dashboard | 🟢 | [views/portal/CLIENT_PORTAL.md](views/portal/CLIENT_PORTAL.md) |
| Portal Photos | 🟢 | [views/portal/CLIENT_PORTAL.md](views/portal/CLIENT_PORTAL.md) |
| Portal Selections | 🟢 | [views/portal/CLIENT_PORTAL.md](views/portal/CLIENT_PORTAL.md) |
| Portal Draws | 🟢 | [views/portal/CLIENT_PORTAL.md](views/portal/CLIENT_PORTAL.md) |

## 24. INTEGRATIONS (2 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| QuickBooks Settings | 🟢 | [views/integrations/QUICKBOOKS.md](views/integrations/QUICKBOOKS.md) |
| QuickBooks Sync Status | 🟢 | [views/integrations/QUICKBOOKS.md](views/integrations/QUICKBOOKS.md) |

---

# PHASE 1-6 VIEWS (44 Additional Views)

## 25. TODO LISTS & TASKS (4 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| My Tasks List | 🟢 | [views/tasks/TODO_LISTS.md](views/tasks/TODO_LISTS.md) |
| Task Detail/Edit | 🟢 | [views/tasks/TODO_LISTS.md](views/tasks/TODO_LISTS.md) |
| Job Tasks Board (Kanban) | 🟢 | [views/tasks/TODO_LISTS.md](views/tasks/TODO_LISTS.md) |
| Task Assignment Modal | 🟢 | [views/tasks/TODO_LISTS.md](views/tasks/TODO_LISTS.md) |

## 26. COMMUNICATION (4 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Messages Center | 🟢 | [views/communication/COMMUNICATION.md](views/communication/COMMUNICATION.md) |
| Conversation Thread | 🟢 | [views/communication/COMMUNICATION.md](views/communication/COMMUNICATION.md) |
| Client Communication Portal | 🟢 | [views/communication/COMMUNICATION.md](views/communication/COMMUNICATION.md) |
| Notification Center | 🟢 | [views/communication/COMMUNICATION.md](views/communication/COMMUNICATION.md) |

## 27. BIDS, RFIs & SUBMITTALS (10 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Bid Package List | 🟢 | [views/bids/BIDS_RFIS_SUBMITTALS.md](views/bids/BIDS_RFIS_SUBMITTALS.md) |
| Bid Package Detail | 🟢 | [views/bids/BIDS_RFIS_SUBMITTALS.md](views/bids/BIDS_RFIS_SUBMITTALS.md) |
| Bid Comparison View | 🟢 | [views/bids/BIDS_RFIS_SUBMITTALS.md](views/bids/BIDS_RFIS_SUBMITTALS.md) |
| RFI List | 🟢 | [views/bids/BIDS_RFIS_SUBMITTALS.md](views/bids/BIDS_RFIS_SUBMITTALS.md) |
| RFI Detail | 🟢 | [views/bids/BIDS_RFIS_SUBMITTALS.md](views/bids/BIDS_RFIS_SUBMITTALS.md) |
| RFI Create/Edit | 🟢 | [views/bids/BIDS_RFIS_SUBMITTALS.md](views/bids/BIDS_RFIS_SUBMITTALS.md) |
| Submittal List | 🟢 | [views/bids/BIDS_RFIS_SUBMITTALS.md](views/bids/BIDS_RFIS_SUBMITTALS.md) |
| Submittal Detail | 🟢 | [views/bids/BIDS_RFIS_SUBMITTALS.md](views/bids/BIDS_RFIS_SUBMITTALS.md) |
| Submittal Create/Edit | 🟢 | [views/bids/BIDS_RFIS_SUBMITTALS.md](views/bids/BIDS_RFIS_SUBMITTALS.md) |
| Document Intelligence Hub | 🟢 | [views/bids/BIDS_RFIS_SUBMITTALS.md](views/bids/BIDS_RFIS_SUBMITTALS.md) |

## 28. VENDOR PORTAL (6 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Vendor Portal Login | 🟢 | [views/vendor-portal/VENDOR_PORTAL.md](views/vendor-portal/VENDOR_PORTAL.md) |
| Vendor Dashboard | 🟢 | [views/vendor-portal/VENDOR_PORTAL.md](views/vendor-portal/VENDOR_PORTAL.md) |
| PO Management (Vendor) | 🟢 | [views/vendor-portal/VENDOR_PORTAL.md](views/vendor-portal/VENDOR_PORTAL.md) |
| Invoice Submission | 🟢 | [views/vendor-portal/VENDOR_PORTAL.md](views/vendor-portal/VENDOR_PORTAL.md) |
| Document Upload (Vendor) | 🟢 | [views/vendor-portal/VENDOR_PORTAL.md](views/vendor-portal/VENDOR_PORTAL.md) |
| Lien Release Management | 🟢 | [views/vendor-portal/VENDOR_PORTAL.md](views/vendor-portal/VENDOR_PORTAL.md) |

## 29. TIME CLOCK (4 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Time Clock (Mobile) | 🟢 | [views/time-clock/TIME_CLOCK.md](views/time-clock/TIME_CLOCK.md) |
| Time Entries List | 🟢 | [views/time-clock/TIME_CLOCK.md](views/time-clock/TIME_CLOCK.md) |
| Timesheet Approval | 🟢 | [views/time-clock/TIME_CLOCK.md](views/time-clock/TIME_CLOCK.md) |
| Labor Reports | 🟢 | [views/time-clock/TIME_CLOCK.md](views/time-clock/TIME_CLOCK.md) |

## 30. TEMPLATES (3 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Template Library | 🟢 | [views/templates/TEMPLATES.md](views/templates/TEMPLATES.md) |
| Template Editor | 🟢 | [views/templates/TEMPLATES.md](views/templates/TEMPLATES.md) |
| Assembly Templates | 🟢 | [views/templates/TEMPLATES.md](views/templates/TEMPLATES.md) |

## 31. PAYMENTS & CASH FLOW (5 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Cash Flow Dashboard | 🟢 | [views/payments/PAYMENTS.md](views/payments/PAYMENTS.md) |
| Accounts Receivable | 🟢 | [views/payments/PAYMENTS.md](views/payments/PAYMENTS.md) |
| Accounts Payable | 🟢 | [views/payments/PAYMENTS.md](views/payments/PAYMENTS.md) |
| Payment Processing | 🟢 | [views/payments/PAYMENTS.md](views/payments/PAYMENTS.md) |
| Bank Reconciliation | 🟢 | [views/payments/PAYMENTS.md](views/payments/PAYMENTS.md) |

## 32. WARRANTY CLAIMS (4 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Warranty List | 🟢 | [views/warranty/WARRANTY_CLAIMS.md](views/warranty/WARRANTY_CLAIMS.md) |
| Warranty Detail | 🟢 | [views/warranty/WARRANTY_CLAIMS.md](views/warranty/WARRANTY_CLAIMS.md) |
| Warranty Claim Form | 🟢 | [views/warranty/WARRANTY_CLAIMS.md](views/warranty/WARRANTY_CLAIMS.md) |
| Warranty Calendar | 🟢 | [views/warranty/WARRANTY_CLAIMS.md](views/warranty/WARRANTY_CLAIMS.md) |

## 33. EMAIL MARKETING (3 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Campaign List | 🟢 | [views/marketing/EMAIL_MARKETING.md](views/marketing/EMAIL_MARKETING.md) |
| Campaign Builder | 🟢 | [views/marketing/EMAIL_MARKETING.md](views/marketing/EMAIL_MARKETING.md) |
| Contact Lists | 🟢 | [views/marketing/EMAIL_MARKETING.md](views/marketing/EMAIL_MARKETING.md) |

## 34. CUSTOM DASHBOARDS (3 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Dashboard Builder | 🟢 | [views/dashboards/CUSTOM_DASHBOARDS.md](views/dashboards/CUSTOM_DASHBOARDS.md) |
| Widget Library | 🟢 | [views/dashboards/CUSTOM_DASHBOARDS.md](views/dashboards/CUSTOM_DASHBOARDS.md) |
| Saved Dashboards | 🟢 | [views/dashboards/CUSTOM_DASHBOARDS.md](views/dashboards/CUSTOM_DASHBOARDS.md) |

## 35. INTEGRATIONS HUB (2 views) ✅
| View | Status | Plan File |
|------|--------|-----------|
| Integrations Hub | 🟢 | [views/integrations/INTEGRATIONS.md](views/integrations/INTEGRATIONS.md) |
| Integration Configuration | 🟢 | [views/integrations/INTEGRATIONS.md](views/integrations/INTEGRATIONS.md) |

---

## TOTAL: 112 views - ALL PLANNED ✅
- Phase 0: 68 views
- Phases 1-6: 44 views

---

## Plan Files Summary

### Phase 0 (Foundation - 68 views)
| Plan File | Views Covered |
|-----------|---------------|
| [views/global/GLOBAL_SETTINGS.md](views/global/GLOBAL_SETTINGS.md) | Login, Dashboard, Company Settings, Users |
| [views/jobs/JOBS_LIST.md](views/jobs/JOBS_LIST.md) | Job Sidebar/List |
| [views/jobs/JOB_CREATE.md](views/jobs/JOB_CREATE.md) | Job Create |
| [views/jobs/JOB_DETAIL.md](views/jobs/JOB_DETAIL.md) | Job Overview |
| [views/jobs/BUDGET.md](views/jobs/BUDGET.md) | Budget Overview |
| [views/jobs/FILES_DOCUMENTS.md](views/jobs/FILES_DOCUMENTS.md) | Files & Documents (4 views) |
| [views/financial/INVOICES.md](views/financial/INVOICES.md) | Invoices (4 views) |
| [views/financial/POS_DRAWS_COS.md](views/financial/POS_DRAWS_COS.md) | POs, Draws, Change Orders (9 views) |
| [views/field/SCHEDULE_LOGS_PHOTOS.md](views/field/SCHEDULE_LOGS_PHOTOS.md) | Schedule, Daily Logs, Photos (8 views) |
| [views/leads/LEADS_PIPELINE.md](views/leads/LEADS_PIPELINE.md) | Leads Pipeline |
| [views/leads/LEAD_DETAIL.md](views/leads/LEAD_DETAIL.md) | Lead Detail |
| [views/leads/LEAD_CREATE.md](views/leads/LEAD_CREATE.md) | Lead Create |
| [views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md](views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md) | Estimates, Proposals, Contracts, Selections (9 views) |
| [views/directory/VENDORS_CLIENTS_COSTCODES.md](views/directory/VENDORS_CLIENTS_COSTCODES.md) | Vendors, Clients, Cost Codes (8 views) |
| [views/closeout/PUNCH_DOCS_WARRANTIES.md](views/closeout/PUNCH_DOCS_WARRANTIES.md) | Punch Lists, Final Docs, Warranties (7 views) |
| [views/reports/REPORTS.md](views/reports/REPORTS.md) | Reports (5 views) |
| [views/portal/CLIENT_PORTAL.md](views/portal/CLIENT_PORTAL.md) | Client Portal (5 views) |
| [views/integrations/QUICKBOOKS.md](views/integrations/QUICKBOOKS.md) | QuickBooks Integration (2 views) |

### Phases 1-6 (Advanced Features - 44 views)
| Plan File | Views Covered | Phase |
|-----------|---------------|-------|
| [views/tasks/TODO_LISTS.md](views/tasks/TODO_LISTS.md) | Tasks & Todo Lists (4 views) | 1 |
| [views/communication/COMMUNICATION.md](views/communication/COMMUNICATION.md) | Communication Hub (4 views) | 2 |
| [views/bids/BIDS_RFIS_SUBMITTALS.md](views/bids/BIDS_RFIS_SUBMITTALS.md) | Bids, RFIs, Submittals (10 views) | 3 |
| [views/vendor-portal/VENDOR_PORTAL.md](views/vendor-portal/VENDOR_PORTAL.md) | Vendor Portal (6 views) | 4 |
| [views/time-clock/TIME_CLOCK.md](views/time-clock/TIME_CLOCK.md) | Time Clock (4 views) | 4 |
| [views/templates/TEMPLATES.md](views/templates/TEMPLATES.md) | Templates Library (3 views) | 5 |
| [views/payments/PAYMENTS.md](views/payments/PAYMENTS.md) | Payments & Cash Flow (5 views) | 5 |
| [views/warranty/WARRANTY_CLAIMS.md](views/warranty/WARRANTY_CLAIMS.md) | Warranty Claims (4 views) | 5 |
| [views/marketing/EMAIL_MARKETING.md](views/marketing/EMAIL_MARKETING.md) | Email Marketing (3 views) | 6 |
| [views/dashboards/CUSTOM_DASHBOARDS.md](views/dashboards/CUSTOM_DASHBOARDS.md) | Custom Dashboards (3 views) | 6 |
| [views/integrations/INTEGRATIONS.md](views/integrations/INTEGRATIONS.md) | Integrations Hub (2 views) | 6 |

---

## Change Log
| Date | Change | Affected Views |
|------|--------|----------------|
| Session 1 | Leads views planned. Key insight: Jobs created early as container (after qualified lead). Estimates happen within job. | Leads (3), Jobs, Estimates |
| Session 1 | Navigation architecture defined. Job-centric sidebar with menu for other areas. | All views |
| Session 1 | Financial views batch planned (Invoices, POs, Draws, Change Orders). Approval workflow defined. | 13 views |
| Session 1 | Pre-construction batch planned (Estimates, Proposals, Contracts, Selections). Allowance → Selection flow defined. | 9 views |
| Session 2 | Completed all remaining views: Field Operations, Directory, Closeout, Reports, Client Portal, Global/Settings, Integrations. | 31 views |
| Session 3 | Created AI Integration Strategy, Database Schema, System Connections Map documents. | Architecture docs |
| Session 3 | Added Phase 1-6 view plans: Tasks, Communication, Bids/RFIs/Submittals, Vendor Portal, Time Clock, Templates, Payments, Warranty Claims, Email Marketing, Custom Dashboards, Integrations Hub. | 44 new views |
