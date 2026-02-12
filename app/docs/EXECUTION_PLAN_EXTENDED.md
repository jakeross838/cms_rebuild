# RossOS Execution Plan - Phases 3-8

> **Continuation of**: `docs/EXECUTION_PLAN.md`
>
> **Phases Covered**: 3 (Field/Schedule), 4 (Selections), 5 (Vendors), 6 (Client Portal), 7 (Reports), 8 (Documents)

---

## Phase 3: Field Operations & Schedule

### Section 3.1: Database Setup

#### Task 3.1.1: Create schedule tables
```
File: supabase/migrations/20240215000001_create_schedule_tables.sql
```
```sql
-- schedule_templates
-- schedule_items
-- schedule_dependencies
```
- [ ] Create tables with all columns
- [ ] RLS policies
- [ ] Indexes
- [ ] Apply migration

#### Task 3.1.2: Create field operations tables
```
File: supabase/migrations/20240215000002_create_field_tables.sql
```
```sql
-- daily_logs
-- daily_log_entries
-- daily_log_crews
-- photos
-- photo_tags
-- inspections
-- inspection_items
-- punch_lists
-- punch_list_items
-- safety_observations
-- safety_incidents
```
- [ ] Create all tables
- [ ] RLS policies
- [ ] Indexes
- [ ] Apply migration
- [ ] Regenerate types

### Section 3.2: Schedule Management

#### Task 3.2.1: Schedule API
```
File: src/app/api/jobs/[id]/schedule/route.ts
File: src/app/api/schedule-items/[id]/route.ts
File: src/app/api/jobs/[id]/schedule/critical-path/route.ts
File: src/app/api/jobs/[id]/schedule/look-ahead/route.ts
```
- [ ] GET/POST schedule items
- [ ] Update item dates/status
- [ ] Dependencies management
- [ ] Critical path calculation
- [ ] 2-week look-ahead generation

#### Task 3.2.2: Schedule UI
```
File: src/app/(dashboard)/jobs/[id]/(tabs)/schedule/page.tsx
File: src/components/schedule/gantt-chart.tsx
File: src/components/schedule/schedule-table.tsx
File: src/components/schedule/look-ahead.tsx
```
- [ ] Gantt chart visualization
- [ ] Table view alternative
- [ ] Drag-and-drop scheduling
- [ ] Look-ahead report
- [ ] Print/export

#### Task 3.2.3: Schedule templates
```
File: src/app/(dashboard)/settings/schedule-templates/page.tsx
```
- [ ] Template CRUD
- [ ] Apply template to job

### Section 3.3: Daily Logs

#### Task 3.3.1: Daily log API
```
File: src/app/api/jobs/[id]/daily-logs/route.ts
File: src/app/api/daily-logs/[id]/route.ts
```
- [ ] Create daily log
- [ ] Add entries (weather, crews, notes)
- [ ] Auto-weather fetch
- [ ] Photo attachment

#### Task 3.3.2: Daily log UI
```
File: src/app/(dashboard)/jobs/[id]/(tabs)/daily-logs/page.tsx
File: src/components/daily-logs/log-form.tsx
File: src/components/daily-logs/log-entry.tsx
```
- [ ] Daily log list
- [ ] Log creation form (mobile-friendly)
- [ ] Weather auto-fill
- [ ] Crew tracking
- [ ] Photo upload

### Section 3.4: Photos

#### Task 3.4.1: Photo API
```
File: src/app/api/jobs/[id]/photos/route.ts
File: src/app/api/photos/[id]/route.ts
```
- [ ] Upload photos
- [ ] Auto-tagging (date, location)
- [ ] Manual tagging
- [ ] Bulk operations

#### Task 3.4.2: Photo UI
```
File: src/app/(dashboard)/jobs/[id]/(tabs)/photos/page.tsx
File: src/components/photos/photo-gallery.tsx
File: src/components/photos/photo-uploader.tsx
```
- [ ] Gallery view
- [ ] Filter by date/tag
- [ ] Lightbox
- [ ] Batch upload

### Section 3.5: Inspections

#### Task 3.5.1: Inspection API
```
File: src/app/api/jobs/[id]/inspections/route.ts
File: src/app/api/inspections/[id]/route.ts
```
- [ ] Schedule inspection
- [ ] Record results
- [ ] Attach photos
- [ ] Fail/pass workflow

#### Task 3.5.2: Inspection UI
```
File: src/app/(dashboard)/jobs/[id]/(tabs)/inspections/page.tsx
File: src/components/inspections/inspection-form.tsx
File: src/components/inspections/checklist.tsx
```
- [ ] Inspection list
- [ ] Schedule modal
- [ ] Checklist completion
- [ ] Result recording

### Section 3.6: Punch Lists

#### Task 3.6.1: Punch list API
```
File: src/app/api/jobs/[id]/punch-lists/route.ts
File: src/app/api/punch-list-items/[id]/route.ts
```
- [ ] Create punch list
- [ ] Add items with photos
- [ ] Assign to trade
- [ ] Mark complete

#### Task 3.6.2: Punch list UI
```
File: src/app/(dashboard)/jobs/[id]/(tabs)/punch-list/page.tsx
File: src/components/punch-list/item-form.tsx
```
- [ ] Item list with filters
- [ ] Photo documentation
- [ ] Assignment
- [ ] Completion tracking

### Section 3.7: Safety (Basic)

#### Task 3.7.1: Safety API
```
File: src/app/api/jobs/[id]/safety/observations/route.ts
File: src/app/api/jobs/[id]/safety/incidents/route.ts
```
- [ ] Log observation
- [ ] Report incident
- [ ] Attach photos

#### Task 3.7.2: Safety UI
```
File: src/app/(dashboard)/jobs/[id]/(tabs)/safety/page.tsx
```
- [ ] Observation form
- [ ] Incident form
- [ ] History list

- [ ] Commit: `feat(phase-3): field operations complete`

---

## Phase 4: Selections & Design

### Section 4.1: Database Setup

#### Task 4.1.1: Create selection tables
```
File: supabase/migrations/20240216000001_create_selection_tables.sql
```
```sql
-- selection_categories
-- selections
-- selection_options
-- selection_approvals
-- allowances
-- allowance_usage
-- specifications
```
- [ ] Create all tables
- [ ] RLS policies
- [ ] Indexes
- [ ] Apply migration
- [ ] Regenerate types

### Section 4.2: Selection Categories

#### Task 4.2.1: Category API & UI
```
File: src/app/api/selection-categories/route.ts
File: src/app/(dashboard)/settings/selection-categories/page.tsx
```
- [ ] CRUD categories
- [ ] Default categories template
- [ ] Custom categories

### Section 4.3: Selections Management

#### Task 4.3.1: Selections API
```
File: src/app/api/jobs/[id]/selections/route.ts
File: src/app/api/selections/[id]/route.ts
File: src/app/api/selections/[id]/approve/route.ts
```
- [ ] Create selection
- [ ] Add options
- [ ] Set deadline
- [ ] Approval workflow

#### Task 4.3.2: Selections UI
```
File: src/app/(dashboard)/jobs/[id]/(tabs)/selections/page.tsx
File: src/components/selections/selection-board.tsx
File: src/components/selections/option-comparison.tsx
```
- [ ] Selection board by category
- [ ] Option comparison view
- [ ] Deadline tracking
- [ ] Approval status

### Section 4.4: Allowances

#### Task 4.4.1: Allowances API & UI
```
File: src/app/api/jobs/[id]/allowances/route.ts
File: src/components/allowances/allowance-tracker.tsx
```
- [ ] Budget vs actual tracking
- [ ] Usage recording
- [ ] Variance alerts

- [ ] Commit: `feat(phase-4): selections complete`

---

## Phase 5: Vendors & Subcontractors

### Section 5.1: Database Setup

#### Task 5.1.1: Create vendor tables
```
File: supabase/migrations/20240217000001_create_vendor_tables.sql
```
```sql
-- vendors
-- vendor_contacts
-- vendor_categories
-- vendor_documents
-- vendor_ratings
-- bid_packages
-- bids
-- bid_items
-- contracts
-- contract_items
-- contract_changes
-- insurance_policies
-- lien_waivers
-- safety_agreements
```
- [ ] Create all tables
- [ ] RLS policies
- [ ] Indexes
- [ ] Apply migration
- [ ] Regenerate types

### Section 5.2: Vendor Management

#### Task 5.2.1: Vendor API
```
File: src/app/api/vendors/route.ts
File: src/app/api/vendors/[id]/route.ts
File: src/app/api/vendors/[id]/documents/route.ts
File: src/app/api/vendors/[id]/ratings/route.ts
```
- [ ] Full CRUD
- [ ] Document management (insurance, W9, license)
- [ ] Rating system

#### Task 5.2.2: Vendor UI
```
File: src/app/(dashboard)/vendors/page.tsx
File: src/app/(dashboard)/vendors/[id]/page.tsx
File: src/components/vendors/vendor-form.tsx
File: src/components/vendors/document-tracker.tsx
```
- [ ] Vendor directory
- [ ] Detail page
- [ ] Insurance tracking
- [ ] Expiration alerts

### Section 5.3: Bidding

#### Task 5.3.1: Bid package API
```
File: src/app/api/jobs/[id]/bid-packages/route.ts
File: src/app/api/bid-packages/[id]/route.ts
File: src/app/api/bid-packages/[id]/bids/route.ts
```
- [ ] Create bid package
- [ ] Distribute to vendors
- [ ] Receive bids
- [ ] Bid comparison

#### Task 5.3.2: Bidding UI
```
File: src/app/(dashboard)/jobs/[id]/(tabs)/bidding/page.tsx
File: src/components/bidding/bid-comparison.tsx
```
- [ ] Package creation
- [ ] Vendor selection
- [ ] Comparison matrix

### Section 5.4: Contracts

#### Task 5.4.1: Contract API
```
File: src/app/api/jobs/[id]/contracts/route.ts
File: src/app/api/contracts/[id]/route.ts
```
- [ ] Generate from bid
- [ ] Line items
- [ ] Change orders (sub)

#### Task 5.4.2: Contract UI
```
File: src/app/(dashboard)/jobs/[id]/(tabs)/contracts/page.tsx
File: src/components/contracts/contract-form.tsx
```
- [ ] Contract list
- [ ] Detail/edit
- [ ] Generation wizard

### Section 5.5: Lien Waivers & Compliance

#### Task 5.5.1: Compliance API & UI
```
File: src/app/api/contracts/[id]/lien-waivers/route.ts
File: src/components/compliance/lien-waiver-tracker.tsx
File: src/components/compliance/insurance-tracker.tsx
```
- [ ] Lien waiver tracking
- [ ] Insurance certificate management
- [ ] Safety agreement tracking

- [ ] Commit: `feat(phase-5): vendors complete`

---

## Phase 6: Client Portal

### Section 6.1: Database Setup

#### Task 6.1.1: Create portal tables
```
File: supabase/migrations/20240218000001_create_portal_tables.sql
```
```sql
-- client_portal_settings
-- client_portal_access
-- client_notifications
-- approval_requests
```
- [ ] Create tables
- [ ] RLS policies (client-scoped)
- [ ] Apply migration

### Section 6.2: Portal API

#### Task 6.2.1: Client-scoped API
```
File: src/app/api/client/dashboard/route.ts
File: src/app/api/client/budget-summary/route.ts
File: src/app/api/client/schedule/route.ts
File: src/app/api/client/photos/route.ts
File: src/app/api/client/change-orders/route.ts
File: src/app/api/client/selections/route.ts
File: src/app/api/client/messages/route.ts
```
- [ ] All client endpoints
- [ ] Limited data access
- [ ] Approval actions

### Section 6.3: Portal UI

#### Task 6.3.1: Client portal pages
```
File: src/app/(client-portal)/layout.tsx
File: src/app/(client-portal)/page.tsx
File: src/app/(client-portal)/budget/page.tsx
File: src/app/(client-portal)/schedule/page.tsx
File: src/app/(client-portal)/photos/page.tsx
File: src/app/(client-portal)/selections/page.tsx
File: src/app/(client-portal)/messages/page.tsx
```
- [ ] Simplified layout
- [ ] Dashboard overview
- [ ] Budget summary (no line items)
- [ ] Schedule milestones
- [ ] Photo gallery
- [ ] Selection approval
- [ ] Message center

#### Task 6.3.2: Approval workflows
```
File: src/components/client-portal/change-order-approval.tsx
File: src/components/client-portal/selection-approval.tsx
```
- [ ] CO approval with signature
- [ ] Selection approval

- [ ] Commit: `feat(phase-6): client portal complete`

---

## Phase 7: Reports & Analytics

### Section 7.1: Database Setup

#### Task 7.1.1: Create report tables
```
File: supabase/migrations/20240219000001_create_report_tables.sql
```
```sql
-- saved_reports
-- report_schedules
-- dashboard_widgets
-- kpi_definitions
-- kpi_snapshots
```
- [ ] Create tables
- [ ] RLS policies
- [ ] Apply migration

### Section 7.2: Report Engine

#### Task 7.2.1: Report API
```
File: src/app/api/reports/job-financial/[jobId]/route.ts
File: src/app/api/reports/budget-variance/[jobId]/route.ts
File: src/app/api/reports/portfolio-summary/route.ts
File: src/app/api/reports/cash-flow-forecast/route.ts
File: src/app/api/reports/wip/route.ts
```
- [ ] Job financial report
- [ ] Budget variance
- [ ] Portfolio summary
- [ ] Cash flow forecast
- [ ] WIP report

#### Task 7.2.2: Report generation
```
File: src/lib/reports/generators/financial-report.ts
File: src/lib/reports/generators/wip-report.ts
File: src/lib/reports/pdf-generator.ts
File: src/lib/reports/excel-generator.ts
```
- [ ] Data aggregation
- [ ] PDF generation
- [ ] Excel export

### Section 7.3: Dashboards

#### Task 7.3.1: Dashboard pages
```
File: src/app/(dashboard)/reports/page.tsx
File: src/app/(dashboard)/reports/portfolio/page.tsx
File: src/app/(dashboard)/reports/financial/page.tsx
```
- [ ] Report selection
- [ ] Portfolio dashboard
- [ ] Financial dashboard

#### Task 7.3.2: Dashboard components
```
File: src/components/reports/kpi-card.tsx
File: src/components/reports/chart-widgets.tsx
File: src/components/reports/data-table.tsx
```
- [ ] KPI cards
- [ ] Charts (bar, line, pie)
- [ ] Data tables with export

- [ ] Commit: `feat(phase-7): reports complete`

---

## Phase 8: Documents & Communication

### Section 8.1: Database Setup

#### Task 8.1.1: Create document tables
```
File: supabase/migrations/20240220000001_create_document_tables.sql
```
```sql
-- documents
-- document_versions
-- document_folders
-- document_permissions
-- rfis
-- rfi_responses
-- submittals
-- submittal_reviews
-- messages
-- message_threads
-- message_recipients
-- notifications
```
- [ ] Create all tables
- [ ] RLS policies
- [ ] Indexes
- [ ] Apply migration

### Section 8.2: Document Management

#### Task 8.2.1: Document API
```
File: src/app/api/jobs/[id]/documents/route.ts
File: src/app/api/documents/[id]/route.ts
File: src/app/api/documents/[id]/versions/route.ts
```
- [ ] Upload documents
- [ ] Folder management
- [ ] Version control
- [ ] Permission management

#### Task 8.2.2: Document UI
```
File: src/app/(dashboard)/jobs/[id]/(tabs)/documents/page.tsx
File: src/components/documents/file-browser.tsx
File: src/components/documents/version-history.tsx
```
- [ ] File browser
- [ ] Upload interface
- [ ] Version comparison
- [ ] Permissions UI

### Section 8.3: RFIs

#### Task 8.3.1: RFI API
```
File: src/app/api/jobs/[id]/rfis/route.ts
File: src/app/api/rfis/[id]/route.ts
File: src/app/api/rfis/[id]/respond/route.ts
```
- [ ] Create RFI
- [ ] Route to recipient
- [ ] Record response
- [ ] Track aging

#### Task 8.3.2: RFI UI
```
File: src/app/(dashboard)/jobs/[id]/(tabs)/rfis/page.tsx
File: src/components/rfis/rfi-form.tsx
File: src/components/rfis/rfi-thread.tsx
```
- [ ] RFI list
- [ ] Create/respond
- [ ] Status tracking

### Section 8.4: Submittals

#### Task 8.4.1: Submittal API & UI
```
File: src/app/api/jobs/[id]/submittals/route.ts
File: src/app/(dashboard)/jobs/[id]/(tabs)/submittals/page.tsx
```
- [ ] Create submittal
- [ ] Review workflow
- [ ] Approval tracking

### Section 8.5: Messaging

#### Task 8.5.1: Message API
```
File: src/app/api/messages/route.ts
File: src/app/api/messages/[threadId]/route.ts
```
- [ ] Create thread
- [ ] Send messages
- [ ] Mark read

#### Task 8.5.2: Message UI
```
File: src/app/(dashboard)/messages/page.tsx
File: src/components/messages/thread-list.tsx
File: src/components/messages/conversation.tsx
```
- [ ] Inbox view
- [ ] Thread display
- [ ] Compose

### Section 8.6: Notifications

#### Task 8.6.1: Notification system
```
File: src/lib/notifications/notification-service.ts
File: src/app/api/notifications/route.ts
File: src/components/notifications/notification-center.tsx
```
- [ ] Create notifications
- [ ] Real-time delivery
- [ ] Notification center UI
- [ ] Email notifications

- [ ] Commit: `feat(phase-8): documents and communication complete`

---

## MVP Completion Checklist

After Phase 8, verify:

- [ ] All database migrations applied
- [ ] All API endpoints functional
- [ ] All UI pages working
- [ ] Full user flow testing:
  - [ ] Sign up → Set up company
  - [ ] Create client → Create job
  - [ ] Set up budget → Enter invoices
  - [ ] Create schedule → Log daily activity
  - [ ] Manage selections → Track allowances
  - [ ] Manage vendors → Create contracts
  - [ ] Client portal accessible
  - [ ] Generate reports
  - [ ] Manage documents
- [ ] Mobile responsiveness
- [ ] `npm run build` succeeds
- [ ] Performance acceptable (< 3s load times)

### Final Commit
```
git commit -m "feat: MVP v1.0 complete

- Phase 1: Foundation & Core Data
- Phase 1.5: Data Migration System
- Phase 2: Financial Management
- Phase 3: Field Operations & Schedule
- Phase 4: Selections & Design
- Phase 5: Vendors & Subcontractors
- Phase 6: Client Portal
- Phase 7: Reports & Analytics
- Phase 8: Documents & Communication

🎉 Ready for production deployment
"
```

---

*Last Updated: 2024-02-12*
*Version: 1.0*
