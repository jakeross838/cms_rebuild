# Intent Log — RossOS Construction Intelligence Platform

## 2026-02-23: Module 38 — Contracts & E-Signature V1 Foundation

### Why
Module 38 is the contracts and e-signature system for Phase 5 (Full Platform). Construction projects live and die by contracts -- prime contracts define the builder-client relationship, subcontracts govern trade work, purchase orders authorize material procurement, and change orders modify scope. Every dollar flows through a contract. This V1 builds the core data model for contract lifecycle management: creation, versioning, signer tracking, templates, and a reusable clause library. The actual e-signature integration (DocuSign, HelloSign, Adobe Sign), PDF generation, clause auto-assembly, contract comparison/diff, and automated renewal workflows are V2+ features.

### What was built
- **Migration** (`20260224300010_contracts.sql`): 5 tables with RLS, 30+ indexes, CHECK constraints, updated_at triggers, and FK CASCADE on child tables. contracts stores the core record with 9-status lifecycle (draft/pending_review/sent_for_signature/partially_signed/fully_signed/active/expired/terminated/voided) and 8 contract types (prime/subcontract/purchase_order/service_agreement/change_order/amendment/nda/other). contract_versions stores immutable snapshots. contract_signers tracks signing parties with role/status/order/metadata. contract_templates provides reusable document scaffolding. contract_clauses offers a clause library with categories and required flags.
- **Types** (`types/contracts.ts`): 4 type unions (ContractStatus 9, ContractType 8, SignerStatus 5, SignerRole 6), 5 interfaces, 4 constant arrays with value/label pairs.
- **Validation** (`lib/validation/schemas/contracts.ts`): 4 enum schemas, 20 CRUD/workflow schemas. createContractSchema requires contract_number and title with defaults (draft/prime). Contract value max 9999999999999.99. Retention pct max 99.99.
- **API Routes** (13 route files under `api/v2/contracts/`): Full CRUD for contracts (GET/POST list, GET/PUT/DELETE by ID), send-for-signature workflow, versions (GET/POST), signers (GET/POST list, GET/PUT/DELETE by ID), sign and decline workflows, templates (GET/POST list, GET/PUT/DELETE by ID), clauses (GET/POST list, GET/PUT/DELETE by ID).
- **Tests** (`tests/acceptance/38-contracts.acceptance.test.ts`): 69 pure function tests -- all passing.

### Design decisions
1. **V1 scope**: Core data model and CRUD only. No e-signature provider integration (DocuSign, HelloSign, Adobe Sign). No PDF generation. No clause auto-assembly from templates. No contract comparison/diff. No automated renewal or expiration alerts. No digital signature rendering or certificate verification. Those require external service integrations and complex document processing.
2. **5 V1 tables, mapping to spec**: Built contracts, contract_versions, contract_signers, contract_templates, contract_clauses. Deferred: contract_negotiations (needs real-time collaboration), contract_approvals (needs approval chain engine), contract_amendments (handled by change_order type), signed_documents (needs file storage + e-sig provider).
3. **9 contract statuses with signing lifecycle**: draft -> pending_review -> sent_for_signature -> partially_signed -> fully_signed -> active -> expired/terminated/voided. The signing flow auto-updates contract status when signers complete: if all signed -> fully_signed + executed_at, else partially_signed.
4. **Signer metadata capture**: ip_address, user_agent, signed_at timestamps collected at signing time for legal defensibility, even without a real e-signature provider in V1.
5. **Templates and clauses as separate entities**: Templates hold the document structure with clause/variable JSONB arrays. Clauses are a standalone library with categories, required flags, and sort ordering -- allowing clause reuse across templates.
6. **Soft delete on contracts, deactivation on templates/clauses**: Contracts use deleted_at (legal records should never vanish). Templates and clauses use is_active=false for soft removal (they may be referenced by existing contracts).
7. **company_id on all child tables**: Even contract_versions and contract_signers carry company_id for direct RLS isolation without requiring a join to the parent contract table.
8. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 38 tables yet.

---

## 2026-02-23: Module 32 — Permitting & Inspections V1 Foundation

### Why
Module 32 is the permitting and inspection management system for Phase 5 (Full Platform). Construction projects require building permits, trade permits, and multiple inspections per jurisdiction. Builders need to track permit applications, schedule inspections, record results (pass/fail/conditional), track first-time quality (FTQ), manage permit documents, and monitor fee payments. This V1 builds the core data model for permits, inspections, inspection results, permit documents, and permit fees. The jurisdiction profile system, online permit API integration, CO tracking integration, daily log integration, and analytics dashboards are V2+ features.

### What was built
- **Migration** (`20260224300004_permitting.sql`): 5 tables with RLS, 25+ indexes, CHECK constraints, updated_at triggers, and FK CASCADE on child tables. permits stores core permit records with 10 permit types and 7 statuses. permit_inspections tracks scheduling with 9 inspection types and 6 statuses. inspection_results records pass/fail/conditional outcomes with deficiencies JSONB, photos JSONB, and FTQ/vendor attribution. permit_documents links files to permits. permit_fees tracks fee amounts and payment status.
- **Types** (`types/permitting.ts`): 6 type unions (PermitStatus 7, PermitType 10, InspectionStatus 6, InspectionType 9, InspectionResultType 3, FeeStatus 4), 5 interfaces, 6 constant arrays.
- **Validation** (`lib/validation/schemas/permitting.ts`): 6 enum schemas, 15 CRUD schemas. createPermitSchema requires job_id and permit_number with defaults (permit_type=building, status=draft). createInspectionResultSchema auto-maps result to inspection status update.
- **API Routes** (9 route files under `api/v2/permits/`): Full CRUD for permits (GET/POST list, GET/PUT/DELETE by ID), inspections (GET/POST per permit, GET/PUT by ID), results (GET/POST per inspection, GET/PUT by ID), documents (GET/POST per permit, GET/DELETE by ID), and fees (GET/POST per permit, GET/PUT/DELETE by ID).
- **Tests** (`tests/acceptance/32-permitting.acceptance.test.ts`): 69 pure function tests -- all passing.

### Design decisions
1. **V1 scope**: Core data model and CRUD only. No jurisdiction profile system, no online permit API integration, no CO tracking integration, no daily log integration, no analytics/FTQ dashboards, no automated inspection scheduling, no permit timeline visualization. Those require cross-module data aggregation and external API integrations.
2. **5 V1 tables, deferring spec tables**: Built permits, permit_inspections, inspection_results, permit_documents, permit_fees. Deferred: jurisdiction_profiles (needs external API config), permit_conditions (can be JSONB on permits for V1), inspection_checklists (V2 feature).
3. **inspection_results as separate table**: Results are a separate table (not embedded in permit_inspections) to support multiple results per inspection for FTQ tracking -- an inspection can fail, get reinspected, and pass.
4. **Auto-update inspection status on result recording**: When a result is posted, the API auto-updates the parent inspection's status (pass->passed, fail->failed, conditional->conditional) to avoid requiring a separate API call.
5. **Soft delete on permits only**: Permits use soft delete (deleted_at). Child tables (inspections, results, documents, fees) use CASCADE delete from permits since they have no independent lifecycle.
6. **Permit documents are hard-deletable**: Documents attached to permits are utility references. They can be cleanly removed without audit trail.
7. **company_id on all tables**: Even child tables carry company_id for direct RLS isolation, matching the project-wide pattern.
8. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 32 tables yet.

---

## 2026-02-23: Module 36 — Lead Pipeline & CRM V1 Foundation

### Why
Module 36 is the lead pipeline and CRM system for Phase 5 (Full Platform). It bridges sales and project management by tracking leads from initial inquiry through signed contract. Builders need a construction-specific CRM tightly integrated with estimating, scheduling, and project management rather than relying on generic CRMs like HubSpot or Salesforce. V1 builds the core data model, type system, validation schemas, CRUD API routes, and acceptance tests.

### What was built
- **Migration** (`20260224300008_crm.sql`): 5 tables (leads, lead_activities, lead_sources, pipelines, pipeline_stages) with RLS, 27 indexes, updated_at triggers, CHECK constraints, and FK relationships.
- **Types** (`types/crm.ts`): 6 type unions, 5 interfaces, 6 constant arrays.
- **Validation** (`lib/validation/schemas/crm.ts`): 6 enum schemas, 15 CRUD schemas.
- **API Routes** (9 route files under `api/v2/crm/`): Full CRUD for leads, activities, sources, pipelines, and pipeline stages.
- **Tests** (`tests/acceptance/36-crm.acceptance.test.ts`): 74 pure function tests -- all passing.

### Design decisions
1. V1 scope: Core CRUD only. No lead scoring, nurturing, kanban, email parsing, web forms, deduplication, auto-routing, conversion workflow, win/loss analytics, lot evaluation, preconstruction workflows, competitive tracking, dream boards, design team management, or public estimator integration.
2. 5 V1 tables, deferring 20+ V2 tables from the spec.
3. company_id (not builder_id) per RossOS convention.
4. 8-status lead model with separate customizable pipeline stages overlay.
5. Soft delete on leads only; sources/pipelines use is_active deactivation; activities CASCADE.
6. API routes grouped under /api/v2/crm/ namespace.
7. `as any` casts on Supabase queries for untyped Module 36 tables.

---

## 2026-02-23: Module 34 — HR & Workforce Management V1 Foundation

### Why
Module 34 is the HR & workforce management module for Phase 5 (Full Platform). Construction companies need to track employees beyond basic user accounts -- certifications, employment status, pay rates, emergency contacts, department structure, and position hierarchy. This V1 builds the core data model for employee management, certifications, HR documents, departments, and positions. No payroll processing, no benefits administration, no performance reviews, no training management, no time-off tracking -- those are V2 features. V1 provides the server-side data model that the HR management UI will consume.

### What was built
- **Migration** (`20260224300006_hr_workforce.sql`): 5 tables with RLS, indexes, CHECK constraints, updated_at triggers, FK CASCADE on child tables. departments supports hierarchy via parent_id with self-reference. positions links to departments. employees is the core table with soft delete via deleted_at, 9 indexes including compound. employee_certifications and employee_documents CASCADE from employees.
- **Types** (`types/hr-workforce.ts`): 5 type unions (EmploymentStatus 5 values, EmploymentType 5, PayType 2, CertificationStatus 4, DocumentType 8), 5 interfaces, 5 constant arrays with value/label pairs.
- **Validation** (`lib/validation/schemas/hr-workforce.ts`): 5 enum schemas, 15 CRUD schemas. createEmployeeSchema requires employee_number, first_name, last_name, hire_date. createCertificationSchema and createDocumentSchema verify employee exists before inserting. Boolean preprocess for is_active filters.
- **API Routes** (10 route files under `api/v2/hr/`): Employees CRUD (GET/POST list, GET/PUT/DELETE by ID with soft delete), Certifications CRUD (GET/POST list, GET/PUT/DELETE by ID), Documents CRUD (GET/POST list, GET/PUT/DELETE by ID), Departments CRUD (GET/POST list, GET/PUT/DELETE by ID with deactivate), Positions CRUD (GET/POST list, GET/PUT/DELETE by ID with deactivate).
- **Tests** (`tests/acceptance/34-hr-workforce.acceptance.test.ts`): 69 pure function tests -- all passing.

### Design decisions
1. **V1 scope**: Core employee data model only. No payroll processing, no benefits administration, no performance reviews, no training management, no time-off requests, no org chart visualization, no onboarding workflows. Those are V2+ features requiring significant business logic.
2. **5 V1 tables, mapping to spec**: Built departments (org structure with hierarchy), positions (job titles linked to departments), employees (extends user concept with HR-specific fields), employee_certifications (licenses/certs/training), employee_documents (HR files: resumes, contracts, tax forms, IDs, reviews, disciplinary). Deferred: training_records, time_off_requests, performance_reviews.
3. **Employees vs Users**: employees table has user_id (nullable) linking to the auth users table, but employees can exist without user accounts (e.g., field workers who don't use the software). This separates HR records from system access.
4. **Soft delete on employees only**: employees uses soft delete via deleted_at (preserves historical records for compliance). certifications and documents CASCADE from employees. departments and positions use is_active flag (deactivation, not deletion).
5. **8 document types**: resume, contract, tax_form, identification, certification, performance_review, disciplinary, other. Covers standard HR document categories without over-specifying.
6. **company_id on all tables**: Multi-tenant isolation. Every query filters by company_id. RLS policies enforce this at the database level.
7. **`as any` casts on Supabase queries**: Required because the Supabase client types in database.ts don't include Module 34 tables yet.

---

## 2026-02-23: Module 39 — Advanced Reporting & Custom Report Builder V1 Foundation

### Why
Module 39 is the advanced reporting and custom report builder for Phase 5 (Full Platform). It transforms raw project data across all modules into actionable intelligence through configurable reports and executive dashboards. Builders need custom reports for their specific workflows, clients need curated financial summaries, banks need AIA-format draws, and PMs need schedule/budget variance analysis. This V1 builds the core data model for custom report definitions, widget-based report composition, configurable dashboards, and reusable saved filters. The actual report rendering engine, PDF/Excel export, AI narratives, scheduled delivery, cross-project benchmarking, and client-facing report variants are V2+ features.

### What was built
- **Migration** (`20260224300011_advanced_reporting.sql`): 5 tables with RLS, 24 indexes, CHECK constraints, updated_at triggers, and FK CASCADE on child tables. custom_reports stores report definitions with 9 visualization types, 10 data sources, 4 audiences, 3 statuses, and JSONB fields for data sources/fields/filters/grouping/sorting/calculated fields. custom_report_widgets stores individual widgets within reports. report_dashboards supports 4 layout types with admin-push capability. dashboard_widgets supports grid positioning with report linking and refresh intervals. saved_filters enables reusable filter configs across 11 contexts.
- **Types** (`types/advanced-reporting.ts`): 8 type unions (WidgetType 9, DataSourceType 10, ReportStatus 3, CustomReportType 2, DashboardLayout 4, RefreshFrequency 4, ReportAudience 4, FilterContext 11), 5 interfaces, 8 constant arrays.
- **Validation** (`lib/validation/schemas/advanced-reporting.ts`): 8 enum schemas, 15 CRUD schemas. createCustomReportSchema requires name with defaults (draft/custom/table/internal/manual). Dashboard widget schema enforces width/height 1-12 and refresh_interval max 86400.
- **API Routes** (10 route files under `api/v2/advanced-reports/`): Full CRUD for custom reports (GET/POST list, GET/PUT/DELETE by ID), report widgets (GET/POST list, PUT/DELETE by ID), dashboards (GET/POST list, GET/PUT/DELETE by ID), dashboard widgets (GET/POST list, PUT/DELETE by ID), and saved filters (GET/POST list, GET/PUT/DELETE by ID).
- **Tests** (`tests/acceptance/39-advanced-reporting.acceptance.test.ts`): 77 pure function tests -- all passing.

### Design decisions
1. **V1 scope**: Core data model and CRUD only. No report rendering engine, no PDF/Excel/CSV/Word export, no scheduled delivery, no AI narrative generation, no cross-project benchmarking, no branding/logo, no client-facing report portal, no drag-and-drop builder UI, no custom SQL queries, no data freshness timestamps. Those require external services (PDF generation, email delivery, LLM API) and cross-module data aggregation queries.
2. **5 V1 tables, deferring 5 spec tables**: Built custom_reports, custom_report_widgets, report_dashboards, dashboard_widgets, saved_filters. Deferred: report_branding (needs file upload/storage), report_schedules (needs cron/email), report_deliveries (needs email service), report_exports (needs PDF/Excel engine), benchmark_data (needs cross-tenant data).
3. **Named custom_reports (not report_templates)**: The spec uses "report_templates" but Module 19 (Financial Reporting) already has report_definitions. V1 uses custom_reports to clearly distinguish between the standard report system (Module 19) and the custom builder (Module 39).
4. **Widget-based composition**: Reports and dashboards both use a widget model. Report widgets define the data visualizations within a report. Dashboard widgets can optionally link to a custom_report via report_id (SET NULL on delete).
5. **Soft delete on custom_reports and report_dashboards**: User-facing entities use soft delete (deleted_at). Child widget tables use CASCADE delete from parent since they have no independent lifecycle.
6. **Saved filters are hard-deletable**: Filters are utility configurations without audit requirements. They can be cleanly removed.
7. **company_id on all tables**: Even child tables (custom_report_widgets, dashboard_widgets) carry company_id for direct RLS isolation.
8. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 39 tables yet.

---

## 2026-02-23: Module 40 — Mobile App V1 Foundation

### Why
Module 40 is the mobile app infrastructure for Phase 5 (Full Platform). Mobile is a primary interface for field personnel -- superintendents, foremen, and laborers use mobile devices daily for time tracking, daily logs, photo documentation, punch list inspections, and safety observations. This V1 builds the backend support tables for mobile features: device registration, push notification token management, offline sync queue, per-user mobile preferences, and session management. No React Native code, no offline-first client, no PWA service worker -- those are V2 features. V1 provides the server-side data model that the mobile client will consume.

### What was built
- **Migration** (`20260224300012_mobile_app.sql`): 5 tables with RLS, 36+ indexes, CHECK constraints, updated_at triggers, FK CASCADE on child tables, UNIQUE constraint on settings (company_id, user_id). mobile_devices is the core table with 3 platforms and soft delete. push_notification_tokens and mobile_sessions CASCADE from mobile_devices deletion. offline_sync_queue has priority-based ordering with partial index on pending items. mobile_app_settings stores per-user preferences with sensible defaults.
- **Types** (`types/mobile-app.ts`): 9 type unions (DevicePlatform 3 values, DeviceStatus 3, SyncStatus 5, SyncAction 3, NotificationProvider 3, PhotoQuality 3, GpsAccuracy 3, AppTheme 3, SessionStatus 3), 5 interfaces, 9 constant arrays with value/label pairs.
- **Validation** (`lib/validation/schemas/mobile-app.ts`): 9 enum schemas, 16 CRUD schemas. createMobileDeviceSchema requires user_id and device_name. createSyncQueueItemSchema enforces priority 1-10 and max_retries 1-20. updateMobileSettingsSchema validates quiet_hours with HH:MM regex and offline_storage_limit_mb 50-10000 range.
- **API Routes** (10 route files under `api/v2/mobile/`): Devices CRUD (GET/POST list, GET/PUT/DELETE by ID), Push Tokens CRUD (GET/POST list, GET/PUT/DELETE by ID), Sync Queue CRUD (GET/POST list, GET/PUT/DELETE by ID), Settings (GET/PUT upsert), Sessions CRUD (GET/POST list, GET/PUT/DELETE by ID, POST revoke).
- **Tests** (`tests/acceptance/40-mobile-app.acceptance.test.ts`): 80 pure function tests -- all passing.

### Design decisions
1. **V1 scope**: Backend support tables only. No React Native / Capacitor / PWA code. No offline-first IndexedDB architecture. No service worker. No camera/GPS/barcode integration. No voice-to-text. No deep linking. Those are V2+ features requiring client-side mobile development.
2. **5 V1 tables, mapping to spec**: Built mobile_devices (maps to spec's device_registrations), push_notification_tokens (new, FCM/APNs token management), offline_sync_queue (maps to spec's offline_sync_queue), mobile_app_settings (new, per-user preferences), mobile_sessions (new, multi-device session tracking). Deferred: user_locations (GPS tracking), cached_project_data (offline bundles), sync_conflicts (conflict resolution UI), notification_preferences (handled by Module 5).
3. **Soft delete on devices only**: mobile_devices uses soft delete + status=revoked (supports remote wipe scenario from spec Edge Case 2). push_notification_tokens and mobile_sessions CASCADE from device deletion. offline_sync_queue uses hard delete (transient processing records). mobile_app_settings has no delete (one per user, upsert only).
4. **Settings upsert pattern**: GET returns defaults if no record exists (avoids requiring initialization). PUT creates-or-updates using existence check. UNIQUE(company_id, user_id) prevents duplicates.
5. **Session revoke as separate endpoint**: POST /sessions/:id/revoke is distinct from DELETE (which expires). Revoke is a security action (lost/stolen device), expire is a normal session end. Both validate active-only (409 on inactive).
6. **Priority-based sync queue**: Queue items have priority 1-10 (lower = higher priority). The spec requires time-critical items (clock in/out) to sync first. The queue is sorted by priority ASC, created_at ASC, with a partial index on pending items for efficient dequeuing.
7. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 40 tables yet.

---

## 2026-02-23: Module 30 — Vendor Portal V1 Foundation

### Why
Module 30 is the vendor self-service portal for Phase 5 (Full Platform). This is a key platform differentiator that shifts data entry and document management to vendors while giving them real-time visibility into payment status and schedules. V1 builds the core data model for portal configuration, vendor invitations, granular access control, document submissions (invoices, lien waivers, insurance certs, W-9s, schedule updates, daily reports), and builder-vendor messaging with threading.

### What was built
- **Migration** (`20260224300002_vendor_portal.sql`): 5 tables (vendor_portal_settings, vendor_portal_invitations, vendor_portal_access, vendor_submissions, vendor_messages) with RLS, 35+ indexes, updated_at triggers, CHECK constraints, UNIQUE constraints, and soft delete.
- **Types** (`types/vendor-portal.ts`): 5 type unions, 5 interfaces, 5 constant arrays.
- **Validation** (`lib/validation/schemas/vendor-portal.ts`): 5 enum schemas, 19 CRUD/workflow schemas.
- **API Routes** (13 route files under `api/v2/vendor-portal/`): Settings (GET/POST/PUT), Invitations (GET/POST list, GET/PUT/DELETE by ID, POST revoke), Access (GET/POST list, GET/PUT/DELETE by ID), Submissions (GET/POST list, GET/PUT/DELETE by ID, POST submit, POST review), Messages (GET/POST list, GET/PUT/DELETE by ID, POST mark-read).
- **Tests** (`tests/acceptance/30-vendor-portal.acceptance.test.ts`): 73 pure function tests -- all passing.

### Design decisions
1. **V1 scope**: Core data model, portal config, invitation system, access control, document submissions, and messaging only. No vendor self-registration flow, no bid response submission, no schedule calendar, no PO dashboard, no invoice-against-PO creation, no lien waiver e-signature, no daily log form, no compliance document manager, no punch item viewer, no onboarding wizard. Those require Modules 7 (Scheduling), 8 (Daily Logs), 10 (Vendors), 14 (Lien Waivers), 18 (POs), 20 (Estimating), 26 (Bids), 28 (Punch List).
2. **5 V1 tables, skipping spec tables**: Built vendor_portal_settings, vendor_portal_invitations, vendor_portal_access, vendor_submissions, vendor_messages. Deferred from spec: vendor_portal_accounts, vendor_builder_relationships, vendor_portal_users, vendor_compliance_documents, vendor_invoices, vendor_lien_waivers, vendor_daily_logs, vendor_schedule_acknowledgments. Those complex tables require multiple dependent modules.
3. **company_id on all tables**: Multi-tenant isolation via company_id + RLS. The spec uses builder_id but company_id is the RossOS convention.
4. **Granular boolean permissions on vendor_portal_access**: 7 individual permission flags (can_submit_invoices, can_submit_lien_waivers, etc.) provide fine-grained control over what each vendor can do. The access_level (full/limited/readonly) serves as a quick preset.
5. **Submission as generic document container**: vendor_submissions uses submission_type enum to handle invoices, lien waivers, insurance certs, W-9s, schedule updates, and daily reports through a single table with JSONB metadata. V2 will add dedicated tables for complex submission types.
6. **Message threading via parent_message_id**: Self-referencing FK on vendor_messages enables conversation threads. The direction field distinguishes builder-to-vendor vs vendor-to-builder messages.
7. **Invitation token generation**: Tokens are server-generated UUIDs for security. Configurable expiration (1-90 days, default 30). Only pending invitations can be revoked.
8. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 30 tables yet.

---

## 2026-02-23: Module 37 — Marketing & Portfolio V1 Foundation

### Why
Module 37 is the marketing and portfolio system for Phase 5 (Full Platform). Builders need tools to transform their completed project data into marketing assets -- curated portfolio pages, photo galleries, client testimonials, and campaign tracking with ROI measurement. This module bridges internal project data with external-facing marketing. V1 builds the core data model for 5 tables, type system, validation schemas, CRUD API routes, and acceptance tests.

### What was built
- **Migration** (`20260224300009_marketing.sql`): 5 tables (portfolio_projects, portfolio_photos, client_reviews, marketing_campaigns, campaign_contacts) with RLS, 40+ indexes, updated_at triggers, CHECK constraints, and soft delete on portfolio_projects.
- **Types** (`types/marketing.ts`): 7 type unions (ProjectShowcaseStatus 4 values, PhotoType 6 values, ReviewStatus 4 values, ReviewSource 7 values, CampaignStatus 5 values, CampaignType 6 values, ContactStatus 6 values), 5 interfaces, 7 constant arrays.
- **Validation** (`lib/validation/schemas/marketing.ts`): 7 enum schemas, 15 CRUD schemas covering all operations.
- **API Routes** (7 route files under `api/v2/marketing/`): Portfolio CRUD with photos, Reviews CRUD, Campaigns CRUD with contacts.
- **Tests** (`tests/acceptance/37-marketing.acceptance.test.ts`): 78 pure function tests -- all passing.

### Design decisions
1. **V1 scope**: Core data model and CRUD only. No case study generation, no referral tracking, no review monitoring aggregation, no social media scheduling, no SEO tracking, no content performance analytics, no public portfolio URL, no AI-assisted content generation, no photo editing/watermarking, no video/virtual tour embeds. Those require Modules 5 (Notifications), 6 (Documents), 36 (CRM), external API integrations (Google, Houzz), and AI services.
2. **5 V1 tables, skipping 7 spec tables**: Built portfolio_projects, portfolio_photos, client_reviews, marketing_campaigns, campaign_contacts. Deferred: portfolio_settings (public portfolio config), case_studies (case study content), testimonials/review_requests (spec uses different names, V1 uses client_reviews for simplicity), referrals (referral tracking), social_posts (social media scheduling). These can be added independently.
3. **client_reviews instead of spec's testimonials + review_requests**: The spec defines separate testimonials and review_requests tables. V1 consolidates into a single client_reviews table that covers the full lifecycle (requested -> submitted -> approved -> published). Splitting into separate tables would add complexity without V1 value.
4. **7 review sources (Gap 916)**: Added yelp, bbb, angi to the spec's original google/houzz/facebook/platform to support the reputation monitoring requirement from Gap 916.
5. **Portfolio project enrichment**: Added square_footage, bedrooms, bathrooms, build_duration_days, completion_date, location, custom_features beyond the spec's basic fields. These support the portfolio showcase display requirements without needing a linked job record.
6. **Soft delete on portfolio_projects only**: Portfolio projects use soft delete since they represent published marketing content. Photos CASCADE from projects. Reviews and campaigns don't have soft delete -- they can be status-transitioned (rejected, cancelled) instead.
7. **Campaign ROI tracking**: Added actual_spend alongside budget for real spend tracking, and leads_generated/proposals_sent/contracts_won/contract_value_won for funnel metrics per Gap 911/1062.
8. **Contact status auto-timestamps**: PUT on campaign contacts auto-sets sent_at/opened_at/clicked_at/converted_at based on status transitions, avoiding manual timestamp management.
9. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 37 tables yet.

---

## 2026-02-23: Module 33 — Safety & Compliance V1 Foundation

### Why
Module 33 is the safety and compliance system for Phase 5 (Full Platform). Construction is one of the most dangerous industries -- OSHA requires builders to track incidents, conduct regular safety inspections, and hold toolbox talks (safety meetings). This V1 builds the core data model for incident reporting, site safety inspections with checklist items, and toolbox talks with attendance tracking. No OSHA API integration, no compliance document management, no safety training tracking, no automated hazard detection, no EMR (Experience Modification Rate) calculations -- those are V2+ features.

### What was built
- **Migration** (`20260224300005_safety.sql`): 5 tables (safety_incidents, safety_inspections, safety_inspection_items, toolbox_talks, toolbox_talk_attendees) with RLS, 30+ indexes, updated_at triggers.
- **Types** (`types/safety.ts`): 7 type unions, 5 interfaces, 7 constant arrays.
- **Validation** (`lib/validation/schemas/safety.ts`): 7 enum schemas, 16 CRUD/workflow schemas.
- **API Routes** (11 route files under `api/v2/safety/`): Full CRUD for incidents, inspections + items, toolbox talks + attendees. Workflow transitions: complete inspection, complete talk.
- **Tests** (`tests/acceptance/33-safety.acceptance.test.ts`): 76 pure function tests -- all passing.

### Design decisions
1. **V1 scope**: Core CRUD and simple workflow transitions only. No OSHA API integration (300/300A forms, electronic filing), no compliance document management, no safety training/certification tracking, no automated hazard detection from daily logs/photos, no EMR calculations, no safety analytics dashboards, no drug/alcohol testing records, no JSA/JHA (Job Safety Analysis/Job Hazard Analysis) forms, no confined space permits, no hot work permits.
2. **5 V1 tables**: Built safety_incidents, safety_inspections, safety_inspection_items, toolbox_talks, toolbox_talk_attendees. Deferred: safety_certifications, safety_training_records, osha_logs, hazard_reports, safety_permits, safety_documents, corrective_action_plans.
3. **8 incident types (OSHA "Focus Four" + 4 more)**: fall, struck_by, caught_in, electrical are the OSHA "Fatal Four" categories. Added chemical, heat, vehicle, other to cover the full spectrum of construction hazards.
4. **5 incident severities**: near_miss through fatal, matching OSHA severity classification. Near-miss tracking is critical for preventing future incidents (Heinrich's Triangle).
5. **OSHA recordability fields on incidents**: osha_recordable, osha_report_number, lost_work_days, restricted_days, medical_treatment fields enable OSHA 300 log compliance even without the automated form generation.
6. **Inspection completion sets status based on result**: When completing an inspection, `result: 'fail'` automatically sets `status: 'failed'` while pass/conditional set `status: 'completed'`.
7. **Toolbox talks have no soft delete**: Talks are lightweight meeting records that don't require archival. Attendees CASCADE delete from parent talk.
8. **Soft delete on incidents and inspections**: Both are legal compliance documents that may be referenced in OSHA investigations or insurance claims.
9. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 33 tables yet.

---

## 2026-02-23: Module 35 — Equipment & Asset Management V1 Foundation

### Why
Module 35 is the equipment and asset management system for Phase 5 (Full Platform). Construction companies need to track their equipment inventory (from heavy machinery to hand tools), manage maintenance schedules, record pre-use inspections, assign equipment to jobs/crews, and track all equipment-related costs. This V1 builds the core data model, type system, validation schemas, CRUD API routes, and acceptance tests. Advanced features (GPS tracking, geofencing, depreciation calculations, rent-vs-own analysis, QR codes, telematics integration, checkout/check-in workflow) are V2+.

### What was built
- **Migration** (`20260224300007_equipment.sql`): 5 tables (equipment, equipment_assignments, equipment_maintenance, equipment_inspections, equipment_costs) with RLS, 35 indexes, updated_at triggers, CHECK constraints, and soft delete on equipment.
- **Types** (`types/equipment.ts`): 9 type unions (EquipmentStatus 5, EquipmentType 8, OwnershipType 3, MaintenanceType 4, MaintenanceStatus 5, AssignmentStatus 3, InspectionType 4, InspectionResult 3, CostType 6), 5 interfaces, 9 constant arrays.
- **Validation** (`lib/validation/schemas/equipment.ts`): 9 enum schemas, 15 CRUD schemas covering all entities.
- **API Routes** (10 route files under `api/v2/equipment/`): Full CRUD for equipment (GET/POST list, GET/PUT/DELETE by ID), assignments (GET/POST per equipment, GET/PUT/DELETE by ID), maintenance (GET/POST per equipment, GET/PUT/DELETE by ID), inspections (GET/POST per equipment, GET/PUT/DELETE by ID), and costs (GET/POST per equipment, GET/PUT/DELETE by ID).
- **Tests** (`tests/acceptance/35-equipment.acceptance.test.ts`): 81 pure function tests -- all passing.

### Design decisions
1. **V1 scope**: Core CRUD only. No GPS/geofencing, no depreciation calculations, no rent-vs-own analysis, no QR code generation, no telematics integration, no checkout/check-in workflow, no bulk import, no utilization analytics, no idle alerts. Those require external integrations (GPS providers, barcode libraries) and business logic engines.
2. **5 V1 tables, skipping spec tables**: Built equipment, equipment_assignments, equipment_maintenance, equipment_inspections, equipment_costs. Deferred from spec: equipment_deployments (combined into assignments), equipment_maintenance_schedules (combined into maintenance table), equipment_hour_readings, equipment_rentals, equipment_gps_locations, equipment_geofences, equipment_checkouts, equipment_depreciation.
3. **Simplified equipment_type values**: The spec uses generic categories. V1 uses 8 values covering the spec's asset categories: heavy_machinery, vehicle, power_tool, hand_tool, scaffolding, safety_equipment, measuring, other.
4. **Soft delete on equipment only**: Equipment uses soft delete (deleted_at) since it has financial and audit implications. Child tables (assignments, maintenance, inspections, costs) CASCADE from equipment.
5. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 35 tables yet.
6. **company_id (not builder_id)**: The spec uses builder_id but the RossOS convention uses company_id for multi-tenancy.
7. **Costs separate from assignments**: Equipment costs are tracked independently from assignments because costs can occur even when equipment is not assigned to a job (e.g., insurance, maintenance while idle).

---

## 2026-02-23: Module 31 — Warranty & Home Care V1 Foundation

### Why
Module 31 is the warranty and home care system for Phase 5 (Full Platform). Warranty management is a critical post-construction workflow -- builders need to track warranty coverage per job/item/vendor, manage claims from homeowners, assign repairs to vendors, track resolution costs, and maintain preventive maintenance schedules. This V1 builds the core data model (5 tables), type system, validation schemas, CRUD + workflow API routes (11 route files), and acceptance tests (76 tests). The full features (homeowner portal, IoT integrations, warranty transfer automation, maintenance reminders, vendor warranty scorecard, predictive maintenance, digital warranty books) will be added in V2+.

### What was built
- **Migration** (`20260224300003_warranty.sql`): 5 tables with RLS, 35+ indexes, CHECK constraints, updated_at triggers, and FK CASCADE on child tables. warranties stores coverage per job with 9 warranty types, 4 statuses, vendor/contact info, and transfer tracking. warranty_claims tracks claims with 6 statuses, 4 priorities, resolution tracking, and photo JSONB. warranty_claim_history provides immutable audit trail with 9 action types. maintenance_schedules defines recurring maintenance with 5 frequencies and is_active flag. maintenance_tasks stores individual task instances with completion tracking.
- **Types** (`types/warranty.ts`): 7 type unions (WarrantyStatus 4, WarrantyType 9, ClaimStatus 6, ClaimPriority 4, ClaimHistoryAction 9, MaintenanceFrequency 5, TaskStatus 5), 5 interfaces, 7 constant arrays.
- **Validation** (`lib/validation/schemas/warranty.ts`): 7 enum schemas, 16 CRUD/workflow schemas covering warranties, claims, claim history, maintenance schedules, maintenance tasks, resolve, and complete operations.
- **API Routes** (11 route files under `api/v2/warranties/` and `api/v2/maintenance-schedules/`): Full CRUD for warranties (list, create, get, update, soft delete), claims (list, create, get, update, soft delete, resolve with history), claim history (list), maintenance schedules (list, create, get, update, soft delete), tasks (list, create, get, update, hard delete, complete with status validation).
- **Tests** (`tests/acceptance/31-warranty.acceptance.test.ts`): 76 pure function tests -- all passing.

### Design decisions
1. **V1 scope**: Core CRUD and simple workflows only. No homeowner self-service portal, no IoT sensor integration, no warranty transfer automation, no automated maintenance reminders/notifications, no vendor warranty performance scorecard, no predictive maintenance AI, no digital warranty book PDF generation, no warranty cost analytics. Those require Modules 5 (Notifications), 6 (Documents), 10 (Vendors), 12/29 (Client Portal), 22 (Vendor Performance), and external IoT/AI services.
2. **5 V1 tables, skipping V2 tables**: Built warranties, warranty_claims, warranty_claim_history, maintenance_schedules, maintenance_tasks. Deferred: warranty_documents (needs Module 6), warranty_transfers (automated transfer workflow), warranty_inspections (pre-expiration inspections), maintenance_photos, maintenance_cost_history, homeowner_requests (needs Module 29 portal), warranty_templates (builder templates).
3. **9 warranty types**: structural, mechanical, electrical, plumbing, hvac, roofing, appliance, general, workmanship. Covers all major construction warranty categories.
4. **6 claim statuses**: submitted, acknowledged, in_progress, resolved, denied, escalated. Simplified from the spec's full workflow. V2 will add reopened as a status (currently tracked in history only).
5. **9 claim history actions**: created, acknowledged, assigned, in_progress, resolved, denied, escalated, reopened, note_added. More granular than the claim statuses to capture all audit events.
6. **Maintenance tasks use hard delete**: Tasks are transient scheduling records generated from schedules. They can be safely deleted without audit concerns. Schedules themselves use soft delete.
7. **Resolve endpoint validates not already resolved/denied (409)**: Prevents double-resolution and maintains data integrity. Once resolved, claims can only be reopened via a direct status update.
8. **Complete endpoint validates not already completed/skipped (409)**: Prevents duplicate completion entries and maintains the completed_at/completed_by audit trail.
9. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 31 tables yet.

---

## 2026-02-23: Module 29 — Full Client Portal V1 Foundation

### Why
Module 29 is the full client portal for Phase 5 (Full Platform). It extends the basic client portal (Module 12) into a premium experience with approval workflows, enhanced messaging, client invitations, and payment tracking. The full client portal is a competitive differentiator for builders -- it provides clients with real-time project visibility, financial transparency, selection management, and a centralized communication hub. V1 builds the core data model and CRUD API routes; advanced features (e-signature, real-time budget/schedule dashboards, photo gallery, warranty requests, satisfaction surveys, AI client updates) are V2+.

### What was built
- **Migration** (`20260224300001_full_client_portal.sql`): 5 tables (client_portal_settings, client_portal_invitations, client_approvals, client_messages, client_payments) with RLS, 35+ indexes, updated_at triggers, CHECK constraints, and soft delete on invitations/approvals/messages/payments.
- **Types** (extended `types/client-portal.ts`): 9 new type unions, 5 new interfaces, 9 new constant arrays -- all appended to existing Module 12 types without breaking changes.
- **Validation** (extended `lib/validation/schemas/client-portal.ts`): 9 new enum schemas, 12 new CRUD schemas -- all appended to existing Module 12 schemas.
- **API Routes** (9 route files under `api/v2/client-portal/`): Settings (GET/PUT), Invitations (GET/POST list, GET/PUT/DELETE by ID), Approvals (GET/POST list, GET/PUT by ID), Messages (GET/POST list, GET/PUT by ID), Payments (GET/POST list, GET by ID).
- **Tests** (`tests/acceptance/29-client-portal.acceptance.test.ts`): 81 pure function tests -- all passing.

### Design decisions
1. **V1 scope**: Core data model and CRUD only. No e-signature integration (DocuSign/HelloSign), no real-time budget/schedule dashboards, no curated photo gallery, no warranty request submission, no satisfaction surveys, no AI client update generation, no engagement analytics, no custom domain routing, no payment processing. Those require Modules 6 (Documents), 7 (Scheduling), 9 (Budget), 15 (Draws), 21 (Selections), 27 (Warranty), 31 (Warranty & Home Care), and external service integrations.
2. **5 V1 tables, extending Module 12**: Built client_portal_settings (company-level config), client_portal_invitations (client access management), client_approvals (multi-type approval engine), client_messages (enhanced messaging with topic/category/external logging), client_payments (payment records without processing). Deferred: client_gallery_photos, warranty_requests, client_engagement_analytics, client_message_threads, client_satisfaction_surveys.
3. **company_id on all tables (not builder_id)**: The spec uses builder_id but the RossOS convention uses company_id for multi-tenancy. All RLS policies use `company_id = get_current_company_id()`.
4. **Extended existing Module 12 files**: Types and validation schemas were appended to the existing `client-portal.ts` files rather than creating new files, preserving backward compatibility with Module 12 code.
5. **Settings as upsert**: Portal settings use UNIQUE(company_id) and the PUT endpoint performs an upsert, creating the settings record on first save. This avoids requiring a separate initialization step.
6. **Invitation token generation**: Tokens are generated server-side using `crypto.randomUUID()`. Expiration is calculated from configurable `expires_in_days` (default 7, max 90).
7. **Approval status transitions**: Only pending approvals can be approved/rejected (409 for invalid transitions). The responded_at timestamp is auto-set on approve/reject. Signature data (data/IP/hash) is stored but not validated -- V2 will add e-signature verification.
8. **Enhanced messaging**: Messages support thread_id for conversation grouping, category for topic organization, external logging for non-portal communication (phone/text/email), and read_at tracking. This is separate from Module 12's basic portal_messages table.
9. **Payment records only**: client_payments stores payment records for audit and visibility. No payment processing, no Stripe/Square integration, no automated draw-to-payment linking. Payment status transitions are manual (V2 will add processing integration).
10. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 29 tables yet.

---

## 2026-02-23: Module 27 — RFI Management V1 Foundation

### Why
Module 27 is the RFI management system for Phase 4 (Intelligence). RFIs are the formal mechanism for clarifying design intent, resolving field conflicts, and documenting decisions in construction projects.

### What was built
- **Migration** (`20260224200008_rfi_management.sql`): 4 tables (rfis, rfi_responses, rfi_routing, rfi_templates) with RLS, indexes, updated_at triggers.
- **Types** (`types/rfi-management.ts`): 4 type unions, 4 interfaces, 4 constant arrays.
- **Validation** (`lib/validation/schemas/rfi-management.ts`): 4 enum schemas, 15 CRUD/workflow schemas.
- **API Routes** (10 route files under `api/v2/rfis/`): Full CRUD, workflow transitions, responses, routing, templates.
- **Tests** (`tests/acceptance/27-rfi-management.acceptance.test.ts`): 52 pure function tests.

### Design decisions
1. V1 scope: Core CRUD only. No plan markup, SLA, ball-in-court, external portal, escalation, AI responses.
2. Simplified 6-status model. Official response auto-answers RFI. Template soft delete via is_active.
3. company_id (not builder_id). `as any` casts on Supabase queries.

---

## 2026-02-23: Module 26 — Bid Management V1 Foundation

### Why
Module 26 is the bid management system for Phase 4 (Intelligence). Bid management is a core builder workflow -- builders create bid packages from project scope, distribute invitations to qualified vendors, collect structured bid responses, compare bids side-by-side, and award contracts. This V1 builds the core data model (5 tables), type system, validation schemas, CRUD + workflow API routes (11 route files), and acceptance tests (49 tests). The full features (vendor portal integration, automated bid leveling, AI comparison/anomaly detection, PDF generation, plan set distribution, pre-bid Q&A, bid templates) will be added in V2+.

### What was built
- **Migration** (): 5 tables with RLS, indexes, constraints, and updated_at triggers. bid_packages is the core table with 5 statuses and soft delete. bid_invitations tracks vendor invitations with 4 statuses. bid_responses stores vendor bids with total_amount, breakdown JSONB, and is_qualified flag. bid_comparisons holds side-by-side comparison data. bid_awards records award decisions with 4 statuses. All child tables CASCADE on bid_packages deletion.
- **Types** (): 3 type unions (BidPackageStatus 5 values, InvitationStatus 4 values, AwardStatus 4 values), 5 interfaces, 3 constant arrays with value/label pairs.
- **Validation** (): 3 enum schemas, 17 CRUD/workflow schemas. createBidPackageSchema requires job_id and title with defaults (draft status, empty documents). createBidResponseSchema requires vendor_id and total_amount (positive only). createBidAwardSchema requires vendor_id and award_amount with default pending status.
- **API Routes** (11 route files under ): Full CRUD for bid packages (list, create, get, update, soft delete), workflow transitions (publish draft->published, close published->closed), invitation management (list, create, get, update), response management (list, create, get, update), comparison management (list, create, get, update, delete), and award management (list, create). Awards auto-update bid package status to awarded.
- **Tests** (): 49 pure function tests covering all type unions, interfaces, constants, enum schemas, and CRUD schemas.

### Design decisions
1. **V1 scope**: Core CRUD and simple workflow transitions only. No vendor portal integration, no automated bid leveling/normalization, no AI comparison or anomaly detection, no PDF generation, no plan set distribution, no pre-bid Q&A, no bid templates. Those require Modules 6 (Documents), 10 (Vendors), 20 (Estimating), 30 (Vendor Portal), and AI/ML services.
2. **Simplified status model**: The spec defines more granular statuses. V1 uses 5 bid package statuses (draft/published/closed/awarded/cancelled) and 4 invitation statuses (invited/viewed/declined/submitted). The full negotiation/acknowledgment flow will be added with the vendor portal (Module 30).
3. **5 V1 tables, skipping templates**: Built bid_packages, bid_invitations, bid_responses, bid_comparisons, bid_awards. Deferred: bid_package_templates (builder template library) and bid_clarifications (pre-bid Q&A). These can be added independently.
4. **Soft delete on bid_packages only**: Bid packages use soft delete since they represent legal bid solicitations. Child tables (invitations, responses, comparisons, awards) CASCADE from bid_packages. Comparisons support hard delete since they are analysis artifacts.
5. **Award auto-updates package status**: When an award is created, the API automatically updates the bid package status to 'awarded'. This is a convenience that avoids a separate status update call.
6. ** casts on Supabase queries**: Required because the Supabase client types don't include Module 26 tables yet.

---


## 2026-02-23: Module 25 — Schedule Intelligence V1 Foundation

### Why
Module 25 is the schedule intelligence engine for Phase 4 (Intelligence). It sits on top of the core scheduling engine (Module 7) and transforms raw schedule data into actionable intelligence through AI-driven predictions, weather impact tracking, risk scoring, and scenario modeling. V1 builds the core data model, type system, validation schemas, CRUD API routes, and acceptance tests.

### What was built
- **Migration** (`20260224200006_schedule_intelligence.sql`): 4 tables (schedule_predictions, schedule_weather_events, schedule_risk_scores, schedule_scenarios) with RLS, 25+ indexes, and updated_at triggers.
- **Types** (`types/schedule-intelligence.ts`): 5 type unions, 4 interfaces, 5 constant arrays.
- **Validation** (`lib/validation/schemas/schedule-intelligence.ts`): 5 enum schemas, 12 CRUD schemas.
- **API Routes** (8 route files under `api/v2/schedule-intelligence/`): Full CRUD for predictions, weather events, risk scores, and scenarios.
- **Tests** (`tests/acceptance/25-schedule-intelligence.acceptance.test.ts`): 53 pure function tests -- all passing.

### Design decisions
1. V1 scope: Core CRUD only. No AI/ML engine, weather API, or resource leveling.
2. 4 V1 tables, deferring intelligence_models (no ML pipeline yet).
3. 9 weather types covering all spec gap items (310, 312, 313, 314).
4. 4-level severity (added "extreme" for catastrophic events).
5. Confidence score 0-1 per spec. Risk scores 0-100 per spec.
6. Soft delete on all 4 tables.
7. `as any` casts on Supabase queries for untyped Module 25 tables.

---

## 2026-02-23: Module 28 — Punch List & Quality Checklists V1 Foundation

### Why
Module 28 is the punch list and quality inspection system for Phase 4 (Intelligence). This is a primary field tool used daily by superintendents, PMs, vendors, and clients. Punch lists track deficiency items from walkthroughs through repair and verification. Quality checklists enable proactive inspection during construction. This V1 builds the core data model, type system, validation schemas, CRUD + workflow API routes, and acceptance tests.

### What was built
- **Migration** (`20260224200009_punch_list_quality.sql`): 6 tables (punch_items, punch_item_photos, quality_checklist_templates, quality_checklist_template_items, quality_checklists, quality_checklist_items) with RLS, indexes, updated_at triggers, and FK CASCADE on child tables.
- **Types** (`types/punch-list.ts`): 6 type unions, 6 interfaces, 6 constant arrays.
- **Validation** (`lib/validation/schemas/punch-list.ts`): 6 enum schemas, 19 CRUD/workflow schemas.
- **API Routes** (15 route files under `api/v2/punch-list/` and `api/v2/quality-checklists/`): Full CRUD for punch items, photos, checklists, checklist items, templates, and template items. Workflow transitions: complete, verify, approve.
- **Tests** (`tests/acceptance/28-punch-list.acceptance.test.ts`): 70 pure function tests.

### Design decisions
1. V1 scope: Core CRUD + simple workflows only. No floor plan pinning, photo markup, FTQ scoring, conditional branching, measurement checkpoints, warranty linkage, vendor self-inspection, SLAs, client portal submission, or batch operations.
2. 5 punch statuses (open/in_progress/completed/verified/disputed) simplified from spec's 8.
3. 14 fixed categories as enum (V2 will migrate to user-configurable table).
4. Soft delete on punch_items and quality_checklists; templates use is_active=false.
5. Status-based workflow validation with 409 for invalid transitions.
6. `as any` casts on Supabase queries (tables not yet in database.ts).

---

## 2026-02-23: Module 24 — AI Document Processing V1 Foundation

### Why
Module 24 is the AI-powered document processing system for Phase 4 (Intelligence). It automatically classifies, extracts data from, and routes construction documents (invoices, lien waivers, change orders, plans, etc.) through AI pipelines. Every user correction feeds back into model improvement. This V1 builds the core data model for document classification, data extraction, extraction templates, processing queue, and feedback loop. No actual AI/ML processing, OCR, or background jobs -- those are V2 features requiring cloud AI service integration.

### What was built
- **Migration** (`20260224200005_ai_document_processing.sql`): 5 tables with RLS, 25+ indexes, and updated_at triggers. document_classifications stores AI classification results with 13 document types and 0-1 confidence scores. extraction_templates defines configurable extraction rules per document type. document_extractions stores extracted structured data with 5-status lifecycle. document_processing_queue manages prioritized processing with retry logic. ai_feedback captures user corrections for model improvement.
- **Types** (`types/ai-document-processing.ts`): 5 type unions (DocumentType 13 values, ExtractionStatus 5 values, QueueStatus 5 values, QueuePriority 5 numeric values, FeedbackType 3 values), 5 interfaces, 5 constant arrays with value/label pairs.
- **Validation** (`lib/validation/schemas/ai-document-processing.ts`): 5 enum schemas, 14 CRUD schemas. createClassificationSchema enforces confidence_score 0-1 range. createQueueItemSchema enforces priority 1-5 and max_attempts 1-10. queuePriorityEnum uses z.union of z.literal for numeric priority values.
- **API Routes** (10 route files under `api/v2/ai-documents/`): Full CRUD for classifications (GET list, POST create, GET by ID), extractions (GET list, POST create, GET/PUT by ID, GET/POST feedback), templates (GET list, POST create, GET/PUT/DELETE by ID), and queue (GET list, POST enqueue, GET/PUT by ID, POST cancel). Cancel endpoint validates only queued/processing items can be cancelled (409 otherwise).
- **Tests** (`tests/acceptance/24-ai-document-processing.acceptance.test.ts`): 59 pure function tests covering all type unions, interfaces, constants, enum schemas, and CRUD schemas including edge cases.

### Design decisions
1. **V1 scope**: Core data model and CRUD only. No OCR, NLP, computer vision, background job processing, email ingestion, or model training. Those require cloud AI services (Google Vision, AWS Textract) and a background job queue (V2).
2. **Simplified table schema vs spec**: The spec defines 15+ tables. V1 builds 5 core tables (classifications, extractions, templates, queue, feedback). Deferred: photo_tags, photo_annotations, photo_access, media_files, ai_models, ai_model_tenant_layers, communication_drafts, ai_photo_analysis, ai_defect_detections, ai_measurement_extractions.
3. **13 document types (not 12 from spec)**: Added all types from the task specification: invoice, receipt, lien_waiver, change_order, purchase_order, contract, permit, inspection_report, plan_sheet, specification, submittal, rfi, other. The spec mentions more types (COI, warranty, W-9, daily report) but V1 uses "other" as a catch-all.
4. **Queue has no soft delete**: Queue items are transient processing records. They transition through queued -> processing -> completed/failed/cancelled and don't need archival. This avoids cluttering the queue table.
5. **Feedback has no soft delete**: Feedback records are training signals for AI models. They should never be hidden or "deleted" since that would degrade model accuracy.
6. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 24 tables yet.

---

## 2026-02-23: Module 20 — Estimating Engine V1 Foundation

### Why
Module 20 is the estimating engine for Phase 4 (Intelligence). Estimating is the revenue-enabling foundation of construction management -- every project begins with a cost estimate that drives budgets, contracts, pricing proposals, and downstream financial tracking. The system must be flexible enough to support one-man shops estimating on a napkin and 50-person firms with dedicated estimators using 200-line cost code structures. This V1 builds the core data model (estimates, line items, sections, assemblies, versions), type system, validation schemas, CRUD API routes, and acceptance tests. The AI-powered features (price suggestions, plan takeoffs, schedule generation), bid management, value engineering, budget conversion, carbon tracking, presentation builder, and cost escalation calculator will be added in V2+.

### What was built
- **Migration** (`20260224200001_estimating.sql`): 6 tables with RLS, 25+ indexes, and updated_at triggers. estimates supports 6 statuses, 6 estimate types, 4 contract types, 4 markup types, version tracking, and validity periods. estimate_sections supports hierarchical nesting via parent_id. estimate_line_items supports 4 item types (line/allowance/exclusion/alternate) with AI suggestion tracking. assemblies provides reusable recipe-based estimating. assembly_items are the components of assemblies. estimate_versions stores immutable JSON snapshots.
- **Types** (`types/estimating.ts`): 6 type unions (EstimateStatus 6 values, EstimateType 6 values, ContractType 4 values, MarkupType 4 values, LineItemType 4 values, AiConfidence 3 values), 6 interfaces, 6 constant arrays with value/label pairs.
- **Validation** (`lib/validation/schemas/estimating.ts`): 6 enum schemas, 18 CRUD schemas. createEstimateSchema requires only name with sensible defaults (draft status, lump_sum type, zero markups). Line item schema supports all 4 item types. Version schema requires version_number and defaults snapshot_json to empty object. Assembly schemas support category filtering and is_active boolean preprocessing.
- **API Routes** (9 route files under `api/v2/estimates/` and `api/v2/assemblies/`): Full CRUD for estimates (GET/POST list, GET/PUT/DELETE by ID), line items (GET/POST list, PUT/DELETE by ID), sections (GET/POST list), versions (GET/POST list), assemblies (GET/POST list, GET/PUT/DELETE by ID), and assembly items (GET/POST list). Status-based access control: only draft or revised estimates can be updated/deleted or have lines/sections added.
- **Tests** (`tests/acceptance/20-estimating.acceptance.test.ts`): 64 pure function tests covering all type unions, interfaces, constants, enum schemas, and CRUD schemas including edge cases.

### Design decisions
1. **V1 scope**: Core CRUD and assembly library only. No AI pricing suggestions, plan takeoffs, schedule generation, bid management, value engineering, budget conversion, carbon tracking, presentation builder, cost escalation, allowance strategy, or cost code library management. Those are V2+ features requiring Modules 9 (Budget), 10 (Vendors), 23 (Price Intelligence), 6 (Documents), 7 (Scheduling), and external AI integrations.
2. **6 statuses (not spec's 6)**: draft, pending_review, approved, rejected, revised, archived. Mapped from spec's draft/pending_approval/approved/sent/expired/converted. Renamed pending_approval to pending_review (more accurate for estimates). Dropped "sent" and "expired" (presentation/delivery layer, V2). Dropped "converted" (budget conversion, V2). Added "revised" (for re-editing after rejection) and "archived" (for soft-hiding completed estimates).
3. **6 estimate types**: lump_sum, cost_plus, time_and_materials, unit_price, gmp, design_build. Covers the full range of construction pricing models per the spec.
4. **4 line item types**: line (standard), allowance (unbid placeholder), exclusion (explicitly NOT included, $0), alternate (option pricing). These support the spec's requirements for placeholder/allowance amounts (Gap 268), scope exclusions (Gap 269), and alternate/option pricing (Gap 270).
5. **company_id on all child tables**: estimate_sections, estimate_line_items, assembly_items, and estimate_versions all carry company_id for direct RLS isolation without requiring joins to parent tables.
6. **Soft delete on estimates and assemblies**: Both use deleted_at since they may have downstream references. Child tables (sections, line items, assembly items, versions) use CASCADE delete from parent.
7. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 20 tables yet. This avoids modifying the shared database.ts types file.

---

## 2026-02-23: Module 23 — Price Intelligence V1 Foundation

### Why
Module 23 is the price intelligence system for Phase 4 (Intelligence). It provides the foundation for tracking material costs and labor pricing over time, comparing vendor pricing, and detecting cost anomalies. This is a direct cost savings enabler -- the spec estimates $380K-$540K annual savings for a 10-home/year builder through optimized purchasing decisions. The V1 builds the core data model (material catalog, vendor pricing, price history, labor rates, labor rate history), type system, validation schemas, CRUD API routes, and acceptance tests. The advanced features (AI anomaly detection, quote ingestion pipeline, PO budget gate, material list optimizer, savings tracking, spend analytics, cost forecasting, confidence scoring, regional pricing, cross-tenant benchmarking) will be added in V2+.

### What was built
- **Migration** (`20260224200004_price_intelligence.sql`): 5 tables with RLS, 18 indexes, and updated_at triggers. master_items is the material catalog with 14 categories and 12 units of measure. vendor_item_prices stores vendor-specific pricing with lead time and minimum order quantities. price_history tracks price changes with old/new price and change percentage. labor_rates tracks trade/skill-level rates with hourly and overtime rates. labor_rate_history tracks labor rate changes over time.
- **Types** (`types/price-intelligence.ts`): 3 type unions (SkillLevel 4 values, UnitOfMeasure 12 values, ItemCategory 14 values), 5 interfaces, 3 constant arrays with value/label pairs.
- **Validation** (`lib/validation/schemas/price-intelligence.ts`): 3 enum schemas, 12 CRUD schemas. Price values enforce positive numbers with max 2 decimal places. createMasterItemSchema requires name with sensible defaults (category=other, unit_of_measure=each, default_unit_price=0). createVendorItemPriceSchema requires vendor_id and positive unit_price. createLaborRateSchema requires trade and positive hourly_rate, defaults to journeyman skill level.
- **API Routes** (7 route files under `api/v2/price-intelligence/`): Full CRUD for master items (GET/POST list, GET/PUT/DELETE by ID), vendor item prices (GET/POST per item), price history (GET per item), labor rates (GET/POST list, GET/PUT/DELETE by ID), and labor rate history (GET per rate). All routes verify ownership before operations and support pagination + sorting.
- **Tests** (`tests/acceptance/23-price-intelligence.acceptance.test.ts`): 48 pure function tests covering all type unions, interfaces, constants, enum schemas, and CRUD schemas including edge cases (required fields, defaults, price validation, date format validation, partial updates).

### Design decisions
1. **V1 scope**: Core catalog and pricing data model only. No AI anomaly detection, no quote ingestion pipeline, no PO budget gate system, no material list optimizer, no savings tracking, no spend analytics, no cost forecasting, no confidence scoring, no regional price indices, no cross-tenant benchmarking, no vendor rate sheets. Those require integration with Modules 10 (Vendors), 13 (Invoice Processing), 18 (POs), 20 (Estimating), and external data sources.
2. **5 V1 tables, skipping 7 V2 tables**: Built master_items, vendor_item_prices, price_history, labor_rates, labor_rate_history. Deferred: vendor_item_aliases (AI matching), price_confidence (data strength), purchase_decisions (savings tracking), waste_factors, vendor_quotes (quote ingestion), labor_quotes (scope-based comparison), scope_templates, sub_job_performance, estimate_accuracy.
3. **Simplified category model**: The spec says categories should grow organically from AI processing. V1 uses a fixed CHECK constraint with 14 common categories. This is sufficient for manual data entry and will be expanded to support dynamic categories in V2 when the AI classification pipeline is built.
4. **Positive price validation**: Both createVendorItemPriceSchema and createLaborRateSchema enforce strictly positive prices (no zero, no negative). This prevents data quality issues in the pricing database. The master item default_unit_price allows zero since items may be catalogued before pricing is known.
5. **Soft delete on master_items and labor_rates**: Both core entities use soft delete (deleted_at). Child tables (vendor_item_prices, price_history, labor_rate_history) use CASCADE from parent FK. Price history and rate history are append-only by nature.
6. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 23 tables yet. This avoids modifying the shared database.ts types file.

---

## 2026-02-23: Module 22 — Vendor Performance Scoring V1 Foundation

### Why
Module 22 is the vendor performance scoring system for Phase 4 (Intelligence). Builders need data-driven insights to evaluate trade partners across quality, timeliness, communication, budget adherence, and safety. This V1 builds the core data model for storing composite vendor scores, per-job performance ratings, warranty callback tracking, and internal vendor notes.

### What was built
- **Migration** (`20260224200003_vendor_performance.sql`): 5 tables with RLS, 25+ indexes, updated_at triggers. vendor_scores stores 5-dimension scores (0-100) with composite and manual adjustment. vendor_score_history captures snapshots. vendor_job_performance tracks per-job ratings. vendor_warranty_callbacks tracks warranty issues. vendor_notes stores internal notes.
- **Types** (`types/vendor-performance.ts`): 3 type unions, 5 interfaces, 3 constant arrays, SCORE_WEIGHTS (sums to 100), SCORE_WEIGHT_PRESETS (4 presets).
- **Validation** (`lib/validation/schemas/vendor-performance.ts`): 3 enum schemas, 15 CRUD schemas with 0-100 range validation, manual_adjustment -10 to +10, YYYY-MM-DD date validation.
- **API Routes** (10 route files under `api/v2/vendor-performance/`): Full CRUD for scores, history, job ratings, callbacks (with resolve endpoint), and notes.
- **Tests** (`tests/acceptance/22-vendor-performance.acceptance.test.ts`): 56 pure function tests.

### Design decisions
1. **V1 scope**: Core CRUD only. No automated score calculation, no FTQ dashboards, no AI predictions, no compliance tracking, no benchmarking.
2. **5 V1 tables, skipping 7 V2 tables**: Deferred vendor_score_config, vendor_compliance, vendor_relationships, vendor_status, vendor_benchmarks, vendor_ftq_history, vendor_quality_predictions.
3. **5-dimension scoring with configurable weights**: Quality 30%, Timeliness 25%, Communication 15%, Budget Adherence 20%, Safety 10%.
4. **Manual adjustment +/- 10 points**: Per spec, with required justification.
5. **Soft delete on all user-facing tables**: History uses CASCADE from vendor_scores.
6. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 22 tables yet.

---

## 2026-02-23: Module 21 — Selection Management V1 Foundation

### Why
Module 21 is the selection management portal for Phase 4 (Intelligence). Selections are a critical client engagement driver in custom home construction -- homeowners make hundreds of decisions about finishes, fixtures, appliances, and materials. Builders need a structured system to define categories, present options with pricing and lead times, capture client decisions, and track budget impacts. This V1 builds the core data model, type system, validation schemas, CRUD API routes, and acceptance tests. The full portal experience (client-facing UI, room boards, comparison mode, budget calculator, e-signature approval, inspiration boards, comment threads, PO generation, schedule integration, and design collaboration) will be added in V2+.

### What was built
- **Migration** (`20260224200002_selections.sql`): 4 tables with RLS, 20+ indexes, and updated_at triggers. selection_categories supports 9 lifecycle statuses, 3 pricing models, deadline/lead-time tracking, and designer access control. selection_options stores vendor info, SKU/model number, unit/total pricing, lead time, availability, and source tracking. selections links options to jobs/rooms with confirmation workflow and change tracking. selection_history provides an audit trail of 5 action types (viewed/considered/selected/deselected/changed).
- **Types** (`types/selections.ts`): 4 type unions (SelectionStatus 9 values, PricingModel 3 values, OptionSource 4 values, SelectionHistoryAction 5 values), 4 interfaces, 4 constant arrays with value/label pairs.
- **Validation** (`lib/validation/schemas/selections.ts`): 4 enum schemas, 11 CRUD schemas. Category schema requires job_id and name with sensible defaults (pending status, allowance model, zero amounts). Option schema requires category_id and name. Selection schema requires category_id, option_id, and job_id.
- **API Routes** (7 route files under `api/v2/selections/`): Full CRUD for categories (GET/POST list, GET/PUT/DELETE by ID), options (GET/POST list, GET/PUT/DELETE by ID), selections (GET/POST list, GET/PUT/DELETE by ID), and history (GET by selection ID). Selection creation verifies both category and option ownership before inserting, and records a history entry.
- **Tests** (`tests/acceptance/21-selections.acceptance.test.ts`): 48 pure function tests covering all type unions, interfaces, constants, enum schemas, and CRUD schemas including edge cases (required fields, max lengths, defaults, partial updates, date validation).

### Design decisions
1. **V1 scope**: Core CRUD only. No client portal, room boards, comparison mode, budget calculator, e-signature, inspiration boards, comment threads, PO generation, schedule integration, complex configurators, or design collaboration. Those require Modules 6 (Documents), 7 (Scheduling), 9 (Budget), 12 (Client Portal), 17 (Change Orders), 18 (POs), and 29 (Full Client Portal).
2. **Simplified status model (9 values)**: The spec defines a 9-status lifecycle from Not Started through Installed. V1 maps these as: pending (not started), presented (options shown), selected (client chose), approved (builder confirmed), ordered (PO generated), received (delivered), installed (in place), on_hold, cancelled. This covers the full lifecycle without requiring workflow transitions -- status updates are direct.
3. **4 V1 tables, skipping 6 V2 tables**: Built selection_categories, selection_options, selections, selection_history. Deferred: selection_option_media (needs Module 6 Documents), selection_option_configs (complex configurators), selection_comments (discussion threads), selection_inspiration (uploads), selection_change_requests (needs Module 17), selection_templates (builder templates). These can be added independently without schema changes to V1 tables.
4. **company_id on all tables**: Even selection_history has company_id for RLS isolation, even though it could be derived from the category's company_id. Direct column avoids joins in RLS policies.
5. **Soft delete on categories, options, and selections**: All three user-facing entities use soft delete (deleted_at). History is immutable and uses CASCADE from category deletion, which is acceptable since soft-deleted categories retain their history.
6. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 21 tables yet. This avoids modifying the shared database.ts types file.

---

## 2026-02-23: Module 18 — Purchase Orders V1 Foundation

### Why
Module 18 provides the purchase order lifecycle management for construction projects. This is Phase 3 (Financial Power). POs are central to construction procurement -- they track what is ordered from vendors, at what price, and whether materials have been received. Committed costs from open POs feed directly into budget forecasting and cash flow projections, making this a prerequisite for accurate financial reporting (Module 19).

### What was built
- **Migration** (`20260224100006_purchase_orders.sql`): 4 tables (purchase_orders, purchase_order_lines, po_receipts, po_receipt_lines) with RLS on tenant tables, comprehensive indexes on filter/join columns, proper FK relationships with CASCADE on child line tables. Soft delete via deleted_at on purchase_orders.
- **Types** (`types/purchase-orders.ts`): PurchaseOrderStatus type union (8 values), 4 interfaces matching DB schema, PO_STATUSES constant array for UI dropdowns.
- **Validation** (`lib/validation/schemas/purchase-orders.ts`): 11 Zod schemas covering all CRUD operations. Date fields validated with YYYY-MM-DD regex. Receipt schema requires at least 1 line. Quantity fields are positive-only.
- **API Routes** (7 route files under `api/v2/purchase-orders/`): Full CRUD for POs and lines. Approve/send status transitions with conflict detection (409 for invalid state transitions). Receipt recording auto-updates line received_quantity and PO status (partially_received vs received).
- **Tests** (`tests/acceptance/18-purchase-orders.acceptance.test.ts`): 30 pure function tests covering types, constants, all enum schemas, and all CRUD schemas.

### Design decisions
1. **V1 scope**: Core PO lifecycle only (draft->approve->send->receive->close). No blanket POs, amendments/versioning, three-way matching, or cross-project aggregation -- those are V2 features per the spec.
2. **8 statuses (not 10)**: Simplified from the spec's 10 statuses. Dropped "acknowledged" (optional vendor-side step) and "invoiced" (handled by Module 13 AI Invoice Processing integration). Renamed "cancelled" to "voided" for consistency with accounting terminology.
3. **Soft delete on POs only**: PO header uses soft delete (deleted_at) since POs are legal documents. Line items and receipt lines use CASCADE delete from parent since they have no independent lifecycle.
4. **Receipt auto-updates PO status**: When a receipt is recorded, the API automatically updates received_quantity on each PO line and recalculates whether the PO should be partially_received or received. This saves a second API call.
5. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 18 tables yet. This avoids modifying the shared database.ts types file.

---

## 2026-02-23: Module 17 — Change Order Management V1 Foundation

### Why
Module 17 is the change order management system for Phase 3 (Financial Power). Change orders are central to construction project management -- they track scope changes, approval workflows, cost/schedule impacts, and cascade to contract values, budgets, and draw schedules. This V1 builds the core data model, type system, validation schemas, CRUD + workflow API routes, and acceptance tests. The full lifecycle features (configurable approval chains, client portal e-signatures, negotiation tracking, budget cascade, CO templates, PDF generation, and analytics) will be added in V2.

### What was built
- **Migration** (`20260224100005_change_orders.sql`): 3 tables with RLS and 13 indexes. change_orders is the core table with 6 change types, 5 statuses, requester tracking, amount/cost_impact/schedule_impact fields, approval chain JSONB, client approval tracking, and soft delete. change_order_items stores line-item cost breakdown with quantity, unit_price, markup, and vendor reference. change_order_history provides an immutable audit trail of 7 action types (created/submitted/approved/rejected/voided/revised/client_approved).
- **Types** (`types/change-orders.ts`): 4 type unions (ChangeType 6 values, ChangeOrderStatus 5 values, RequesterType 3 values, ChangeOrderHistoryAction 7 values), 3 interfaces, 4 constant arrays with value/label pairs.
- **Validation** (`lib/validation/schemas/change-orders.ts`): 4 enum schemas, 9 CRUD/workflow schemas. createChangeOrderSchema requires job_id, co_number, title with sensible defaults (draft status, owner_requested type, zero amounts). updateChangeOrderSchema allows partial updates. submitChangeOrderSchema and approveChangeOrderSchema support optional notes. Item schemas support full line-item CRUD with quantity/price/markup fields.
- **API Routes** (6 route files under `api/v2/change-orders/`): Full CRUD for change orders (GET list, POST create, GET/PUT/DELETE by ID), workflow transitions (POST submit draft->pending, POST approve pending->approved), and item management (GET/POST items list, PUT/DELETE items by ID). All routes enforce status-based access control -- only draft COs can be deleted, only draft/pending COs can be updated or have items modified.
- **Tests** (`tests/acceptance/17-change-orders.acceptance.test.ts`): 33 pure function tests covering all type unions, interfaces, constants, enum schemas, and CRUD schemas including edge cases (required fields, max lengths, defaults, partial updates).

### Design decisions
1. **V1 scope**: Core CRUD and simple workflow transitions only. No configurable approval chains, no negotiation state machine, no client portal e-signatures, no budget/contract cascade, no CO templates or PDF generation. Those are V2+ features requiring additional modules (Module 9 Budget, Module 15 Draws, Module 29 Client Portal).
2. **Simplified status model**: The spec defines an 8-status negotiation flow (draft/internal_review/client_presented/negotiation/approved/rejected/withdrawn/voided). V1 uses a 5-status model (draft/pending_approval/approved/rejected/voided) suitable for internal builder workflows. The full negotiation flow will be added when the client portal (Module 29) is built.
3. **History table instead of versions**: The spec has both change_order_versions (snapshot-based) and change_order_approvals (step-based). V1 uses a single change_order_history table with action/previous_status/new_status/details that serves as an audit trail. Full version tracking and multi-step approval workflows will be added in V2.
4. **Soft delete on change_orders only**: Items and history cascade-delete with the parent CO (ON DELETE CASCADE). This is safe because only draft COs can be deleted, and draft COs have no financial implications.
5. **Status-based access control**: PUT and item mutations check the CO status and return 403 if the CO is approved/rejected/voided. DELETE only works on draft COs. This prevents accidental modification of financially-committed change orders.
6. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 17 tables yet. This avoids modifying the shared database.ts types file.

## 2026-02-23: Module 16 — QuickBooks & Accounting Integration V1 Foundation

### Why
Module 16 provides the sync infrastructure for builders who use external accounting systems (QuickBooks Online, Xero, Sage) alongside RossOS. This is Phase 3 (Financial Power) and is marked as OPTIONAL -- it is only needed when a builder wants to keep an external accounting system running in parallel with RossOS native accounting (Module 11).

### What was built
- **Migration** (`20260224100004_quickbooks_integration.sql`): 4 tables with RLS, indexes, constraints. accounting_connections has UNIQUE(company_id, provider) to enforce one connection per provider. sync_mappings has UNIQUE(connection_id, entity_type, internal_id) to prevent duplicate mappings.
- **Types** (`types/integrations.ts`): Complete type system with 9 type unions, 4 interfaces, 9 constant arrays.
- **Validation** (`lib/validation/schemas/integrations.ts`): Zod schemas for all CRUD operations. triggerSyncSchema defaults to manual/push. resolveConflictSchema explicitly excludes "pending" as a valid resolution.
- **API Routes** (8 route files under `api/v2/integrations/`): Full CRUD for connections, mappings, sync-logs, and conflicts. Sync trigger returns 202 Accepted. Conflict resolution prevents re-resolving already-resolved conflicts.
- **Tests** (`tests/acceptance/16-integrations.acceptance.test.ts`): 57 pure function tests covering types, constants, all enum schemas, and all CRUD schemas.

### Design decisions
1. **V1 scope**: Sync infrastructure only. No actual OAuth flow or API calls to QBO/Xero/Sage -- that requires external API keys and background job processing (V2).
2. **Soft delete on connections only**: Connections use soft delete (deleted_at) since they contain historical audit data. Mappings use hard delete since they can be recreated.
3. **Sync trigger returns 202**: The sync endpoint creates a log entry and returns immediately. Actual sync work would be dispatched to a background job queue in V2.
4. **No "pending" in resolveConflictSchema**: Resolving a conflict means choosing a resolution; setting it back to "pending" is not a valid resolution action.
5. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 16 tables yet. This avoids modifying the shared database.ts types file.

## 2026-02-23: Module 19 — Financial Reporting V1 Foundation

### Why
Module 19 is the financial reporting engine for Phase 3 (Financial Power). It provides the foundation for all financial reports -- P&L, balance sheet, cash flow, WIP, job cost, AR/AP aging, budget vs actual, retainage, and custom reports. Builders need to generate, schedule, and snapshot financial data for their accountants, lenders, and internal review. Period locking ensures month-end/quarter-end data integrity. This V1 builds the data model, types, validation, and API routes; the actual report calculation engine will be wired in later phases.

### What was built
- **Migration** (`20260224100007_financial_reporting.sql`): 4 tables with RLS, indexes, constraints. report_definitions supports 10 report types. report_snapshots stores immutable point-in-time report data. report_schedules enables automated delivery with frequency/day/recipient config. financial_periods tracks fiscal periods with open/closed/locked status and UNIQUE on (company_id, period_name).
- **Types** (`types/financial-reporting.ts`): 3 type unions (ReportType with 10 values, ScheduleFrequency with 4 values, PeriodStatus with 3 values), 5 interfaces, 3 constant arrays with value/label pairs.
- **Validation** (`lib/validation/schemas/financial-reporting.ts`): 14 Zod schemas covering all CRUD operations. generateReportSchema requires YYYY-MM-DD dates. createReportScheduleSchema enforces min 1 recipient with email validation. Financial period schemas validate date format, fiscal year range (2000-2100), and quarter range (1-4).
- **API Routes** (10 route files under `api/v2/reports/` and `api/v2/financial-periods/`): Full CRUD for definitions (GET/POST list, GET/PUT/DELETE by ID), report generation (POST generate creates snapshot), snapshots (GET list, GET by ID), schedules (GET/POST list, PUT/DELETE by ID), financial periods (GET/POST list, GET/PUT by ID, POST close).
- **Tests** (`tests/acceptance/19-financial-reporting.acceptance.test.ts`): 41 pure function tests covering types, constants, all enum schemas, all CRUD schemas, and edge cases.

### Design decisions
1. **V1 scope**: Data model and API infrastructure only. Report generation creates a snapshot with placeholder data. The actual calculation engine (P&L aggregation, WIP computation, aging bucket calculation) will be wired in when dependent modules (budgets, invoicing, cost transactions) have real data.
2. **Soft delete via is_active on report_definitions**: Rather than adding a deleted_at column, definitions use is_active=false. This preserves existing snapshots that reference the definition while hiding it from active lists.
3. **Hard delete on schedules**: Schedules can be cleanly removed since they don't have immutable audit requirements. If needed, the schedule can be recreated.
4. **Period close is one-way (open -> closed)**: The close endpoint only transitions from open to closed. Locked status and reopening would be handled by separate admin endpoints in V2. The PUT endpoint prevents updates to locked periods.
5. **Generate validates is_active**: Cannot generate a report from an inactive definition (403). This prevents orphaned snapshots from deactivated report templates.
6. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 19 tables yet.
