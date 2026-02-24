# Intent Log — RossOS Construction Intelligence Platform

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
