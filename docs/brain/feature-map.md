# Feature Map — RossOS Construction Intelligence Platform

## Module 27: RFI Management (V1 Foundation)

### Database Tables
- **rfis**: Core RFI records. Columns: company_id, job_id, rfi_number (VARCHAR 20), subject (VARCHAR 255), question (TEXT), status (draft/open/pending_response/answered/closed/voided), priority (low/normal/high/urgent), category (design/structural/mechanical/electrical/plumbing/site/finish/general), assigned_to (UUID FK users), due_date (DATE), cost_impact (NUMERIC 15,2 default 0), schedule_impact_days (INT default 0), related_document_id (UUID), created_by (FK users), answered_at (TIMESTAMPTZ), closed_at (TIMESTAMPTZ), closed_by (FK users). Soft delete via deleted_at. RLS enabled.
- **rfi_responses**: Responses to RFIs. Columns: rfi_id (FK rfis CASCADE), company_id, response_text (TEXT), responded_by (FK users), attachments (JSONB default []), is_official (BOOLEAN default false). RLS enabled.
- **rfi_routing**: Routing/assignment chain. Columns: rfi_id (FK rfis CASCADE), company_id, routed_to (FK users), routed_by (FK users), routed_at, status (pending/viewed/responded/forwarded), notes (TEXT). RLS enabled.
- **rfi_templates**: Reusable RFI templates. Columns: company_id, name (VARCHAR 200), category, subject_template (VARCHAR 255), question_template (TEXT), default_priority, is_active (BOOLEAN default true). RLS enabled.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/rfis | List RFIs filtered by job_id/status/priority/category/assigned_to/q. Paginated. |
| POST | /api/v2/rfis | Create RFI. Requires job_id, rfi_number, subject, question. Defaults: draft, normal, general. Returns 201. |
| GET/PUT/DELETE | /api/v2/rfis/:id | CRUD single RFI. Soft delete only draft. Rejects update on closed/voided (403). |
| POST | /api/v2/rfis/:id/open | draft -> open transition. |
| POST | /api/v2/rfis/:id/close | answered -> closed transition. Sets closed_at/closed_by. |
| GET/POST | /api/v2/rfis/:id/responses | List/create responses. Official response auto-sets RFI to answered. |
| GET/PUT/DELETE | /api/v2/rfis/:id/responses/:respId | CRUD single response. |
| GET/POST | /api/v2/rfis/:id/routing | List/create routing assignments. |
| GET/PUT | /api/v2/rfis/:id/routing/:routeId | Get/update routing. |
| GET/POST | /api/v2/rfis/templates | List/create templates. |
| GET/PUT/DELETE | /api/v2/rfis/templates/:id | CRUD template. Delete = is_active=false. |

### Type System
- 4 type unions: RfiStatus (6), RfiPriority (4), RfiCategory (8), RoutingStatus (4)
- 4 interfaces: Rfi, RfiResponse, RfiRouting, RfiTemplate
- 4 constant arrays: RFI_STATUSES, RFI_PRIORITIES, RFI_CATEGORIES, ROUTING_STATUSES

### Validation Schemas (Zod)
- 4 enum schemas + 15 CRUD/workflow schemas covering all operations

---

## Module 26: Bid Management (V1 Foundation)

### Database Tables
- **bid_packages**: Core bid package definition per job. Columns: company_id, job_id, title (VARCHAR 200), description, trade, scope_of_work, bid_due_date (DATE), status (draft/published/closed/awarded/cancelled), documents (JSONB), created_by. Soft delete via deleted_at. RLS enabled.
- **bid_invitations**: Vendor invitations to bid. Columns: company_id, bid_package_id (FK CASCADE), vendor_id, status (invited/viewed/declined/submitted), invited_at, viewed_at, responded_at, decline_reason. RLS enabled.
- **bid_responses**: Vendor bid submissions. Columns: company_id, bid_package_id (FK CASCADE), vendor_id, invitation_id (FK SET NULL), total_amount (NUMERIC 15,2), breakdown (JSONB), notes, attachments (JSONB), submitted_at, is_qualified (BOOLEAN). RLS enabled.
- **bid_comparisons**: Side-by-side comparison records. Columns: company_id, bid_package_id (FK CASCADE), name, comparison_data (JSONB), notes, created_by. RLS enabled.
- **bid_awards**: Award decisions. Columns: company_id, bid_package_id (FK CASCADE), vendor_id, bid_response_id (FK SET NULL), award_amount (NUMERIC 15,2), notes, awarded_by, awarded_at, status (pending/accepted/rejected/withdrawn). RLS enabled.

### Type System
- 3 type unions: BidPackageStatus (5), InvitationStatus (4), AwardStatus (4)
- 5 interfaces: BidPackage, BidInvitation, BidResponse, BidComparison, BidAward
- 3 constant arrays: BID_PACKAGE_STATUSES, INVITATION_STATUSES, AWARD_STATUSES
- 3 enum schemas + 17 CRUD schemas

---


## Module 28: Punch List & Quality Checklists (V1 Foundation)

### Database Tables
- **punch_items**: Core punch list item table. Columns: company_id, job_id, title (VARCHAR 255), description (TEXT), location (VARCHAR 200), room (VARCHAR 100), status (open/in_progress/completed/verified/disputed), priority (low/normal/high/critical), category (structural/electrical/plumbing/hvac/finish/paint/flooring/cabinets/countertops/fixtures/appliances/exterior/landscaping/other), assigned_to (UUID), assigned_vendor_id (UUID), due_date (DATE), completed_at, verified_by (UUID), verified_at, cost_estimate (NUMERIC 15,2), created_by (UUID). Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, status, priority, category, assigned_to, assigned_vendor_id, due_date, compound (company_id, status), (company_id, job_id), deleted_at partial.
- **punch_item_photos**: Photos attached to punch items. Columns: company_id, punch_item_id (FK CASCADE), photo_url (TEXT), caption (VARCHAR 255), photo_type (before/after/issue), uploaded_by (UUID), uploaded_at. RLS enabled. Indexes on company_id, punch_item_id.
- **quality_checklist_templates**: Reusable checklist templates. Columns: company_id, name (VARCHAR 200), description (TEXT), category (TEXT), trade (VARCHAR 100), is_active (BOOLEAN default true), is_system (BOOLEAN default false). RLS enabled. updated_at trigger.
- **quality_checklist_template_items**: Template line items. Columns: company_id, template_id (FK CASCADE), description (TEXT), category (TEXT), sort_order (INT default 0), is_required (BOOLEAN default true). RLS enabled. updated_at trigger.
- **quality_checklists**: Checklist instances. Columns: company_id, job_id, template_id (FK nullable), name (VARCHAR 200), description (TEXT), status (not_started/in_progress/completed/approved), inspector_id (UUID), inspection_date (DATE), location (VARCHAR 200), total_items/passed_items/failed_items/na_items (INT default 0), completed_at, approved_by, approved_at, created_by. Soft delete via deleted_at. RLS enabled. updated_at trigger.
- **quality_checklist_items**: Individual checklist line items. Columns: company_id, checklist_id (FK CASCADE), description (TEXT), result (pass/fail/na/not_inspected), notes (TEXT), photo_url (TEXT), sort_order (INT default 0). RLS enabled. updated_at trigger.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/punch-list | List punch items filtered by job_id/status/priority/category/assigned_to/assigned_vendor_id/q. Paginated. Excludes soft-deleted. |
| POST | /api/v2/punch-list | Create punch item. Requires job_id, title. Defaults: status=open, priority=normal. Returns 201. |
| GET | /api/v2/punch-list/:id | Get punch item with nested photos array. |
| PUT | /api/v2/punch-list/:id | Partial update of punch item fields. |
| DELETE | /api/v2/punch-list/:id | Soft delete. |
| POST | /api/v2/punch-list/:id/complete | Mark as completed. Validates status is open/in_progress (409). |
| POST | /api/v2/punch-list/:id/verify | Verify completed item. Validates status is completed (409). |
| GET | /api/v2/punch-list/:id/photos | List photos for a punch item. |
| POST | /api/v2/punch-list/:id/photos | Add photo. Requires photo_url. Returns 201. |
| DELETE | /api/v2/punch-list/:id/photos/:photoId | Delete photo. |
| GET | /api/v2/quality-checklists | List checklists filtered by job_id/status/template_id/q. Paginated. |
| POST | /api/v2/quality-checklists | Create checklist. Requires job_id, name. Returns 201. |
| GET | /api/v2/quality-checklists/:id | Get checklist with nested items. |
| PUT | /api/v2/quality-checklists/:id | Partial update. |
| DELETE | /api/v2/quality-checklists/:id | Soft delete. |
| POST | /api/v2/quality-checklists/:id/approve | Approve completed checklist. Validates status is completed (409). |
| GET/POST | /api/v2/quality-checklists/:id/items | List/add checklist items. |
| PUT/DELETE | /api/v2/quality-checklists/:id/items/:itemId | Update/delete checklist item. |
| GET/POST | /api/v2/quality-checklists/templates | List/create templates. |
| GET/PUT/DELETE | /api/v2/quality-checklists/templates/:id | CRUD single template. |
| GET/POST | /api/v2/quality-checklists/templates/:id/items | List/add template items. |
| PUT/DELETE | /api/v2/quality-checklists/templates/:id/items/:itemId | Update/delete template item. |

### Type System
- 6 type unions: PunchItemStatus (5), PunchItemPriority (4), PunchItemCategory (14), PhotoType (3), ChecklistStatus (4), ChecklistItemResult (4)
- 6 interfaces: PunchItem, PunchItemPhoto, QualityChecklist, QualityChecklistItem, QualityChecklistTemplate, QualityChecklistTemplateItem
- 6 constant arrays: PUNCH_ITEM_STATUSES, PUNCH_ITEM_PRIORITIES, PUNCH_ITEM_CATEGORIES, PHOTO_TYPES, CHECKLIST_STATUSES, CHECKLIST_ITEM_RESULTS

### Validation Schemas (Zod)
- 6 enum schemas + 19 CRUD schemas covering punch items, photos, checklists, checklist items, templates, and template items

---

## Module 24: AI Document Processing (V1 Foundation)

### Database Tables
- **document_classifications**: AI classification results. 13 document types, confidence_score 0-1, metadata JSONB. Soft delete. RLS.
- **extraction_templates**: Configurable extraction rules per doc type. field_definitions JSONB, is_active, is_system. Soft delete. RLS.
- **document_extractions**: Extracted data from documents. Links to classification and template. Status: pending/processing/completed/failed/review_needed. Soft delete. RLS.
- **document_processing_queue**: Queue for AI processing. Priority 1-5, attempts tracking, error_message. No soft delete. RLS.
- **ai_feedback**: User corrections (correction/confirmation/rejection) linked to extractions. No soft delete. RLS.

### API Endpoints (19 routes under /api/v2/ai-documents/)
- Classifications: GET list, POST create, GET :id
- Extractions: GET list, POST create, GET/PUT :id, GET/POST :id/feedback
- Templates: GET list, POST create, GET/PUT/DELETE :id
- Queue: GET list, POST enqueue, GET/PUT :id, POST :id/cancel (409 if not queued/processing)

### Type System
- 5 type unions: DocumentType(13), ExtractionStatus(5), QueueStatus(5), QueuePriority(1-5), FeedbackType(3)
- 5 interfaces, 5 constant arrays, 5 enum schemas + 14 CRUD schemas

---

## Module 20: Estimating Engine (V1 Foundation)

### Database Tables
- **estimates**: Core estimate header table. Columns: company_id, job_id (nullable FK jobs), name (VARCHAR 255), description (TEXT), status (draft/pending_review/approved/rejected/revised/archived), estimate_type (lump_sum/cost_plus/time_and_materials/unit_price/gmp/design_build), contract_type (nte/gmp/cost_plus/fixed nullable), version (INT default 1), parent_version_id (self-ref UUID nullable), markup_type (flat/tiered/per_line/built_in nullable), markup_pct/overhead_pct/profit_pct (NUMERIC 5,2), subtotal/total (NUMERIC 15,2), valid_until (DATE), notes (TEXT), created_by/approved_by (FK users), approved_at. Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, status, (company_id, status), (company_id, job_id), deleted_at partial, created_at DESC.
- **estimate_sections**: Hierarchical sections within an estimate. Columns: estimate_id (FK estimates CASCADE), company_id, parent_id (self-ref nullable), name (VARCHAR 255), sort_order (INT default 0), subtotal (NUMERIC 15,2). RLS enabled. Indexes on estimate_id, company_id, parent_id.
- **estimate_line_items**: Individual line items per estimate. Columns: estimate_id (FK estimates CASCADE), company_id, section_id (FK estimate_sections nullable), cost_code_id (UUID nullable), assembly_id (UUID nullable), description (TEXT), item_type (line/allowance/exclusion/alternate), quantity (NUMERIC 12,4), unit (VARCHAR 30), unit_cost (NUMERIC 15,2), markup_pct (NUMERIC 5,2), total (NUMERIC 15,2), alt_group (VARCHAR 50), notes (TEXT), sort_order (INT), ai_suggested (BOOLEAN default false), ai_confidence (high/medium/low nullable). RLS enabled. Indexes on estimate_id, company_id, section_id, cost_code_id, assembly_id, item_type.
- **assemblies**: Reusable assembly recipes (grouped line items). Columns: company_id, name (VARCHAR 255), description (TEXT), category (VARCHAR 100), parameter_unit (VARCHAR 30), is_active (BOOLEAN default true). Soft delete via deleted_at. RLS enabled. Indexes on company_id, category, is_active, deleted_at partial.
- **assembly_items**: Component items within an assembly. Columns: assembly_id (FK assemblies CASCADE), company_id, cost_code_id (UUID nullable), description (TEXT), qty_per_unit (NUMERIC 12,4), unit (VARCHAR 30), unit_cost (NUMERIC 15,2), sort_order (INT). RLS enabled. Indexes on assembly_id, company_id, cost_code_id.
- **estimate_versions**: Immutable version snapshots of estimates. Columns: estimate_id (FK estimates CASCADE), company_id, version_number (INT), snapshot_json (JSONB), change_summary (TEXT), created_by (FK users). RLS enabled. Indexes on estimate_id, company_id, (estimate_id, version_number).

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/estimates | List estimates filtered by job_id/status/estimate_type/q. Paginated. Excludes soft-deleted. Search matches name or description via OR ilike. Ordered by created_at desc. |
| POST | /api/v2/estimates | Create new estimate. Requires name. Defaults: status=draft, estimate_type=lump_sum, markup/overhead/profit=0. Sets created_by from auth context. Returns 201. |
| GET | /api/v2/estimates/:id | Get estimate with lines_count, sections_count, and versions array. Verifies company ownership and not soft-deleted. |
| PUT | /api/v2/estimates/:id | Partial update of estimate fields. Only draft or revised estimates can be updated (403 otherwise). |
| DELETE | /api/v2/estimates/:id | Soft delete: sets deleted_at. Only draft estimates can be deleted (403 otherwise). |
| GET | /api/v2/estimates/:id/lines | List line items for an estimate. Filterable by section_id, item_type. Ordered by sort_order asc. Paginated. |
| POST | /api/v2/estimates/:id/lines | Add line item. Only draft or revised estimates (403 otherwise). Sets company_id from context. Returns 201. |
| PUT | /api/v2/estimates/:id/lines/:lineId | Update line item. Only draft or revised estimates (403 otherwise). Partial updates. |
| DELETE | /api/v2/estimates/:id/lines/:lineId | Hard delete line item. Only draft or revised estimates (403 otherwise). |
| GET | /api/v2/estimates/:id/sections | List sections for an estimate. Ordered by sort_order asc. Paginated. |
| POST | /api/v2/estimates/:id/sections | Add section. Only draft or revised estimates (403 otherwise). Returns 201. |
| GET | /api/v2/estimates/:id/versions | List version snapshots. Ordered by version_number desc. Paginated. |
| POST | /api/v2/estimates/:id/versions | Create version snapshot. Requires version_number. Stores snapshot_json and optional change_summary. Returns 201. |
| GET | /api/v2/assemblies | List assemblies filtered by category/is_active/q. Paginated. Excludes soft-deleted. Search matches name or description. Ordered by name asc. |
| POST | /api/v2/assemblies | Create assembly. Requires name. Defaults: is_active=true. Returns 201. |
| GET | /api/v2/assemblies/:id | Get assembly with items_count. Verifies company ownership and not soft-deleted. |
| PUT | /api/v2/assemblies/:id | Update assembly. Verifies ownership. Partial updates. |
| DELETE | /api/v2/assemblies/:id | Soft delete assembly. |
| GET | /api/v2/assemblies/:id/items | List items for an assembly. Ordered by sort_order asc. Paginated. |
| POST | /api/v2/assemblies/:id/items | Add item to assembly. Verifies assembly ownership. Returns 201. |

### Type System
- 6 type unions: EstimateStatus (6 values), EstimateType (6 values), ContractType (4 values), MarkupType (4 values), LineItemType (4 values), AiConfidence (3 values)
- 6 interfaces: Estimate, EstimateSection, EstimateLineItem, Assembly, AssemblyItem, EstimateVersion
- 6 constant arrays with value/label pairs: ESTIMATE_STATUSES, ESTIMATE_TYPES, CONTRACT_TYPES, MARKUP_TYPES, LINE_ITEM_TYPES, AI_CONFIDENCE_LEVELS

### Validation Schemas (Zod)
- 6 enum schemas: estimateStatusEnum, estimateTypeEnum, contractTypeEnum, markupTypeEnum, lineItemTypeEnum, aiConfidenceEnum
- listEstimatesSchema (page/limit/job_id/status/estimate_type/q)
- createEstimateSchema (requires name; defaults: status=draft, estimate_type=lump_sum, markup_pct=0, overhead_pct=0, profit_pct=0)
- updateEstimateSchema (all fields optional including subtotal/total)
- listEstimateSectionsSchema (page/limit, limit defaults to 50)
- createEstimateSectionSchema (requires name; defaults: sort_order=0)
- updateEstimateSectionSchema (all fields optional)
- listEstimateLineItemsSchema (page/limit up to 200; optional section_id, item_type filter)
- createEstimateLineItemSchema (requires description; defaults: item_type=line, quantity=1, unit=each, unit_cost=0, markup_pct=0, total=0, sort_order=0, ai_suggested=false)
- updateEstimateLineItemSchema (all fields optional)
- listEstimateVersionsSchema (page/limit)
- createEstimateVersionSchema (requires version_number; defaults: snapshot_json={})
- listAssembliesSchema (page/limit/category/is_active/q)
- createAssemblySchema (requires name; defaults: is_active=true)
- updateAssemblySchema (all fields optional)
- listAssemblyItemsSchema (page/limit, limit defaults to 50)
- createAssemblyItemSchema (requires description; defaults: qty_per_unit=1, unit=each, unit_cost=0, sort_order=0)
- updateAssemblyItemSchema (all fields optional)

---

## Module 25: Schedule Intelligence (V1 Foundation)

### Database Tables
- **schedule_predictions**: AI-generated schedule predictions per job/task. Columns: company_id, job_id, task_id (nullable), prediction_type (duration/delay/resource/weather/completion), predicted_value (JSONB), confidence_score (NUMERIC 3,2 range 0-1), model_version (VARCHAR 50), is_accepted (BOOLEAN default false), accepted_by (FK users), accepted_at, created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, task_id, prediction_type, (company_id, job_id), deleted_at partial.
- **schedule_weather_events**: Weather events affecting job schedules. Columns: company_id, job_id, event_date (DATE), weather_type (rain/snow/ice/wind/extreme_heat/extreme_cold/hurricane/tornado/flood), severity (minor/moderate/severe/extreme), impact_description (TEXT), affected_tasks (JSONB array), schedule_impact_days (NUMERIC 5,1), temperature_high/temperature_low (NUMERIC 5,1), precipitation_inches (NUMERIC 4,2), wind_speed_mph (NUMERIC 5,1), auto_logged (BOOLEAN), notes (TEXT), created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, event_date, weather_type, severity, (company_id, job_id), deleted_at partial.
- **schedule_risk_scores**: Risk assessment per task/job. Columns: company_id, job_id, task_id (nullable), risk_level (low/medium/high/critical), risk_score (INT 0-100), risk_factors (JSONB), mitigation_suggestions (JSONB array), weather_component/resource_component/dependency_component/history_component (INT 0-100), assessed_at, created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, task_id, risk_level, risk_score, (company_id, job_id), deleted_at partial.
- **schedule_scenarios**: What-if scenario modeling per job. Columns: company_id, job_id, name (VARCHAR 200), description (TEXT), scenario_type (optimistic/pessimistic/most_likely/custom), parameters (JSONB), results (JSONB), projected_completion (DATE), projected_cost_impact (NUMERIC 12,2), created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, scenario_type, (company_id, job_id), created_by, deleted_at partial.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/schedule-intelligence/predictions | List predictions filtered by job_id/task_id/prediction_type/is_accepted. Paginated. Excludes soft-deleted. Ordered by created_at desc. |
| POST | /api/v2/schedule-intelligence/predictions | Create prediction. Requires job_id, prediction_type. Defaults: confidence_score=0, predicted_value={}. Sets created_by from auth context. Returns 201. |
| GET | /api/v2/schedule-intelligence/predictions/:id | Get single prediction by ID. Scoped to company_id, excludes soft-deleted. |
| PUT | /api/v2/schedule-intelligence/predictions/:id | Update prediction fields. When is_accepted=true, sets accepted_by/accepted_at. When is_accepted=false, clears accepted_by/accepted_at. |
| GET | /api/v2/schedule-intelligence/weather-events | List weather events filtered by job_id/weather_type/severity/date_from/date_to. Paginated. Date filters use gte/lte. Ordered by event_date desc. |
| POST | /api/v2/schedule-intelligence/weather-events | Create weather event. Requires job_id, event_date, weather_type, severity. Defaults: schedule_impact_days=0, affected_tasks=[], auto_logged=false. Returns 201. |
| GET | /api/v2/schedule-intelligence/weather-events/:id | Get single weather event by ID. |
| PUT | /api/v2/schedule-intelligence/weather-events/:id | Partial update of weather event fields. |
| DELETE | /api/v2/schedule-intelligence/weather-events/:id | Soft delete: sets deleted_at. Verifies existence first (404 if not found). |
| GET | /api/v2/schedule-intelligence/risk-scores | List risk scores filtered by job_id/task_id/risk_level/min_score. Paginated. Ordered by risk_score desc. |
| POST | /api/v2/schedule-intelligence/risk-scores | Create risk score. Requires job_id, risk_level, risk_score. Defaults: all component scores=0, risk_factors={}, mitigation_suggestions=[]. Returns 201. |
| GET | /api/v2/schedule-intelligence/risk-scores/:id | Get single risk score by ID. |
| PUT | /api/v2/schedule-intelligence/risk-scores/:id | Update risk score. Auto-updates assessed_at on every update. |
| GET | /api/v2/schedule-intelligence/scenarios | List scenarios filtered by job_id/scenario_type. Paginated. Ordered by created_at desc. |
| POST | /api/v2/schedule-intelligence/scenarios | Create scenario. Requires job_id, name. Defaults: scenario_type=custom, parameters={}, results={}. Returns 201. |
| GET | /api/v2/schedule-intelligence/scenarios/:id | Get single scenario by ID. |
| PUT | /api/v2/schedule-intelligence/scenarios/:id | Partial update of scenario fields. |
| DELETE | /api/v2/schedule-intelligence/scenarios/:id | Soft delete scenario. Verifies existence first (404 if not found). |

### Type System
- 5 type unions: PredictionType (5 values), WeatherType (9 values), WeatherSeverity (4 values), RiskLevel (4 values), ScenarioType (4 values)
- 4 interfaces: SchedulePrediction, ScheduleWeatherEvent, ScheduleRiskScore, ScheduleScenario
- 5 constant arrays with value/label pairs: PREDICTION_TYPES, WEATHER_TYPES, WEATHER_SEVERITIES, RISK_LEVELS, SCENARIO_TYPES

### Validation Schemas (Zod)
- 5 enum schemas: predictionTypeEnum, weatherTypeEnum, weatherSeverityEnum, riskLevelEnum, scenarioTypeEnum
- listPredictionsSchema (page/limit/job_id/task_id/prediction_type/is_accepted)
- createPredictionSchema (requires job_id, prediction_type; defaults confidence_score=0, predicted_value={})
- updatePredictionSchema (optional predicted_value/confidence_score/model_version/is_accepted)
- listWeatherEventsSchema (page/limit/job_id/weather_type/severity/date_from/date_to with YYYY-MM-DD validation)
- createWeatherEventSchema (requires job_id, event_date, weather_type, severity; defaults schedule_impact_days=0, affected_tasks=[], auto_logged=false)
- updateWeatherEventSchema (all fields optional)
- listRiskScoresSchema (page/limit/job_id/task_id/risk_level/min_score)
- createRiskScoreSchema (requires job_id, risk_level, risk_score; defaults all components=0, risk_factors={}, mitigation_suggestions=[])
- updateRiskScoreSchema (all fields optional)
- listScenariosSchema (page/limit/job_id/scenario_type)
- createScenarioSchema (requires job_id, name; defaults scenario_type=custom, parameters={}, results={})
- updateScenarioSchema (all fields optional, projected_completion validated as YYYY-MM-DD)

---

## Module 23: Price Intelligence (V1 Foundation)

### Database Tables
- **master_items**: Material catalog. Columns: company_id, name (VARCHAR 255), description (TEXT), category (TEXT, CHECK 14 values: lumber/electrical/plumbing/hvac/roofing/flooring/paint/hardware/concrete/insulation/drywall/fixtures/appliances/other), unit_of_measure (TEXT, CHECK 12 values: each/linear_ft/sq_ft/cu_yd/ton/gallon/bundle/box/sheet/roll/bag/pair), default_unit_price (NUMERIC 12,2 default 0), sku (VARCHAR 100), created_by UUID. Soft delete via deleted_at. RLS enabled. Indexes on company_id, category, deleted_at partial.
- **vendor_item_prices**: Vendor-specific pricing per master item. Columns: company_id, vendor_id UUID, master_item_id (FK master_items CASCADE), unit_price (NUMERIC 12,2), lead_time_days INT, min_order_qty (NUMERIC 10,3), effective_date DATE, notes TEXT. RLS enabled. Indexes on company_id, vendor_id, master_item_id, effective_date DESC.
- **price_history**: Historical price changes. Columns: company_id, master_item_id (FK master_items CASCADE), vendor_id UUID, old_price (NUMERIC 12,2), new_price (NUMERIC 12,2), change_pct (NUMERIC 8,2), recorded_at TIMESTAMPTZ. RLS enabled. Indexes on company_id, master_item_id, vendor_id, recorded_at DESC.
- **labor_rates**: Labor cost tracking by trade/skill. Columns: company_id, trade (VARCHAR 100), skill_level (TEXT, CHECK: apprentice/journeyman/master/foreman), hourly_rate (NUMERIC 10,2), overtime_rate (NUMERIC 10,2), region (VARCHAR 100), notes TEXT, created_by UUID. Soft delete via deleted_at. RLS enabled. Indexes on company_id, trade, skill_level, deleted_at partial.
- **labor_rate_history**: Labor rate changes over time. Columns: company_id, labor_rate_id (FK labor_rates CASCADE), old_rate (NUMERIC 10,2), new_rate (NUMERIC 10,2), change_pct (NUMERIC 8,2), effective_date DATE. RLS enabled. Indexes on company_id, labor_rate_id, effective_date DESC.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/price-intelligence/items | List master items filtered by category/q. Paginated. Sortable by name/category/created_at/updated_at/default_unit_price. Excludes soft-deleted. Searches name, description, sku via OR ilike. |
| POST | /api/v2/price-intelligence/items | Create master item. Requires name. Defaults category=other, unit_of_measure=each, default_unit_price=0. Sets created_by from auth. Returns 201. |
| GET | /api/v2/price-intelligence/items/:id | Get master item with vendor_prices_count. Verifies company ownership and not soft-deleted. |
| PUT | /api/v2/price-intelligence/items/:id | Partial update of item fields. Only includes provided fields. Verifies ownership and not soft-deleted. |
| DELETE | /api/v2/price-intelligence/items/:id | Soft delete: sets deleted_at timestamp. Verifies item exists and not already deleted. |
| GET | /api/v2/price-intelligence/items/:id/prices | List vendor prices for an item. Filterable by vendor_id. Sortable by unit_price/effective_date/created_at. Paginated. Verifies item exists. |
| POST | /api/v2/price-intelligence/items/:id/prices | Add vendor price for item. Requires vendor_id and unit_price (positive). Optional lead_time_days, min_order_qty, effective_date, notes. Verifies item exists. Returns 201. |
| GET | /api/v2/price-intelligence/items/:id/price-history | Get price history for item. Filterable by vendor_id. Sortable by recorded_at/new_price/change_pct. Paginated. Verifies item exists. |
| GET | /api/v2/price-intelligence/labor-rates | List labor rates filtered by trade/skill_level/region/q. Paginated. Sortable by trade/skill_level/hourly_rate/created_at/updated_at. Excludes soft-deleted. Searches trade, region, notes via OR ilike. |
| POST | /api/v2/price-intelligence/labor-rates | Create labor rate. Requires trade and hourly_rate (positive). Defaults skill_level=journeyman. Sets created_by from auth. Returns 201. |
| GET | /api/v2/price-intelligence/labor-rates/:id | Get labor rate with history_count. Verifies company ownership and not soft-deleted. |
| PUT | /api/v2/price-intelligence/labor-rates/:id | Partial update of rate fields. Verifies ownership and not soft-deleted. |
| DELETE | /api/v2/price-intelligence/labor-rates/:id | Soft delete: sets deleted_at timestamp. Verifies rate exists and not already deleted. |
| GET | /api/v2/price-intelligence/labor-rates/:id/history | Get rate change history. Sortable by effective_date/new_rate/change_pct. Paginated. Verifies rate exists. |

### Type System
- 3 type unions: SkillLevel (4 values), UnitOfMeasure (12 values), ItemCategory (14 values)
- 5 interfaces: MasterItem, VendorItemPrice, PriceHistory, LaborRate, LaborRateHistory
- 3 constant arrays with value/label pairs: SKILL_LEVELS (4), UNITS_OF_MEASURE (12), ITEM_CATEGORIES (14)

### Validation Schemas (Zod)
- 3 enum schemas: skillLevelEnum, unitOfMeasureEnum, itemCategoryEnum
- listMasterItemsSchema (page/limit/category/q/sort_by/sort_order)
- createMasterItemSchema (name required; defaults: category=other, unit_of_measure=each, default_unit_price=0)
- updateMasterItemSchema (all fields optional)
- listVendorItemPricesSchema (page/limit/vendor_id/sort_by/sort_order)
- createVendorItemPriceSchema (vendor_id + unit_price required, positive price only, YYYY-MM-DD date validation)
- updateVendorItemPriceSchema (all fields optional)
- listPriceHistorySchema (page/limit/vendor_id/sort_by/sort_order, limit defaults to 50)
- listLaborRatesSchema (page/limit/trade/skill_level/region/q/sort_by/sort_order)
- createLaborRateSchema (trade + hourly_rate required, positive price only; defaults: skill_level=journeyman)
- updateLaborRateSchema (all fields optional)
- listLaborRateHistorySchema (page/limit/sort_by/sort_order, limit defaults to 50)

---

## Module 22: Vendor Performance Scoring (V1 Foundation)

### Database Tables
- **vendor_scores**: Overall composite scores per vendor per builder. Columns: company_id, vendor_id, quality_score (NUMERIC 5,2 0-100), timeliness_score (0-100), communication_score (0-100), budget_adherence_score (0-100), safety_score (0-100), overall_score (0-100), data_point_count (INT), calculation_window_months (INT default 12), manual_adjustment (NUMERIC 5,2 -10 to +10), manual_adjustment_reason (TEXT), calculated_at (TIMESTAMPTZ), created_by (FK users). UNIQUE(company_id, vendor_id). Soft delete via deleted_at. RLS enabled.
- **vendor_score_history**: Score snapshots over time. Columns: company_id, vendor_score_id (FK vendor_scores CASCADE), vendor_id, quality_score, timeliness_score, communication_score, budget_adherence_score, safety_score, overall_score, snapshot_date (DATE), notes (TEXT). RLS enabled.
- **vendor_job_performance**: Per-job performance ratings. Columns: company_id, vendor_id, job_id, trade, quality/timeliness/communication/budget_adherence/safety ratings (0-100 nullable), overall_rating, tasks_on_time, tasks_total, punch_items_count, punch_resolution_avg_days, inspection_pass_rate, bid_amount, final_amount, change_order_count, rating_notes, rated_by. Soft delete. RLS enabled.
- **vendor_warranty_callbacks**: Warranty issue tracking. Columns: company_id, vendor_id, job_id, title, description, severity (minor/moderate/major/critical), status (reported/acknowledged/in_progress/resolved/disputed), reported_date, resolved_date, resolution_notes, resolution_cost, resolution_days, reported_by, resolved_by. Soft delete. RLS enabled.
- **vendor_notes**: Internal notes and tags. Columns: company_id, vendor_id, author_id, title, body, tags (JSONB), is_internal (BOOLEAN). Soft delete. RLS enabled.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/vendor-performance/scores | List scores filtered by vendor_id. Paginated. Sortable. |
| GET | /api/v2/vendor-performance/scores/:vendorId | Get single vendor score. |
| PUT | /api/v2/vendor-performance/scores/:vendorId | Update score dimensions. Partial update. |
| GET | /api/v2/vendor-performance/scores/:vendorId/history | Get score history. Paginated. |
| GET | /api/v2/vendor-performance/job-ratings | List ratings filtered by vendor_id/job_id/trade. |
| POST | /api/v2/vendor-performance/job-ratings | Create rating. Returns 201. |
| GET/PUT/DELETE | /api/v2/vendor-performance/job-ratings/:id | CRUD single rating. |
| GET | /api/v2/vendor-performance/callbacks | List callbacks filtered by vendor_id/job_id/status/severity. |
| POST | /api/v2/vendor-performance/callbacks | Create callback. Returns 201. |
| GET/PUT/DELETE | /api/v2/vendor-performance/callbacks/:id | CRUD single callback. |
| POST | /api/v2/vendor-performance/callbacks/:id/resolve | Resolve callback (409 if already resolved). |
| GET | /api/v2/vendor-performance/notes | List notes filtered by vendor_id. |
| POST | /api/v2/vendor-performance/notes | Create note. Returns 201. |
| PUT/DELETE | /api/v2/vendor-performance/notes/:id | Update/delete single note. |

### Type System
- 3 type unions: ScoreDimension (5), CallbackStatus (5), CallbackSeverity (4)
- 5 interfaces: VendorScore, VendorScoreHistory, VendorJobPerformance, VendorWarrantyCallback, VendorNote
- Constants: SCORE_DIMENSIONS, CALLBACK_STATUSES, CALLBACK_SEVERITIES, SCORE_WEIGHTS (sums to 100), SCORE_WEIGHT_PRESETS (4 presets)

### Validation Schemas (Zod)
- 3 enum schemas: scoreDimensionEnum, callbackStatusEnum, callbackSeverityEnum
- 15 CRUD schemas for scores, history, job-ratings, callbacks, resolve, notes

---

## Module 21: Selection Management (V1 Foundation)

### Database Tables
- **selection_categories**: Builder-defined selection categories per project. Columns: company_id, job_id, name (VARCHAR 255), room (VARCHAR 200), sort_order (INT default 0), pricing_model (allowance/fixed/cost_plus), allowance_amount (NUMERIC 15,2 default 0), deadline (DATE), lead_time_buffer_days (INT default 0), assigned_to (UUID), status (pending/presented/selected/approved/ordered/received/installed/on_hold/cancelled), designer_access (BOOLEAN default false), notes (TEXT), created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, status, room, (company_id, job_id), deleted_at partial.
- **selection_options**: Options within categories with pricing, vendor info, and lead times. Columns: company_id, category_id (FK selection_categories CASCADE), name (VARCHAR 255), description (TEXT), vendor_id (UUID), sku (VARCHAR 100), model_number (VARCHAR 100), unit_price (NUMERIC 15,2), quantity (NUMERIC 10,3), total_price (NUMERIC 15,2), lead_time_days (INT), availability_status (VARCHAR 100), source (builder/designer/client/catalog), is_recommended (BOOLEAN default false), sort_order (INT), created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, category_id, vendor_id, source, deleted_at partial.
- **selections**: Actual selection records linking an option to a job/room. Columns: company_id, category_id (FK selection_categories CASCADE), option_id (FK selection_options CASCADE), job_id, room (VARCHAR 200), selected_by (UUID), selected_at (TIMESTAMPTZ), confirmed_by (UUID), confirmed_at (TIMESTAMPTZ), status (same 9 statuses), change_reason (TEXT), superseded_by (UUID), created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, category_id, option_id, job_id, status, (company_id, job_id), deleted_at partial.
- **selection_history**: Audit trail for selection actions. Columns: company_id, category_id (FK selection_categories CASCADE), option_id (UUID nullable), action (viewed/considered/selected/deselected/changed), actor_id (UUID), actor_role (VARCHAR 50), notes (TEXT), created_at. RLS enabled. Indexes on company_id, category_id, action, created_at DESC.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/selections/categories | List categories filtered by job_id/room/status/pricing_model/q. Paginated. Excludes soft-deleted. Search matches name or room via OR ilike. Ordered by sort_order asc, created_at desc. |
| POST | /api/v2/selections/categories | Create new category. Requires job_id, name. Defaults: status=pending, pricing_model=allowance, allowance_amount=0, sort_order=0, designer_access=false. Sets created_by from auth context. Returns 201. |
| GET | /api/v2/selections/categories/:id | Get category with options_count and selections_count. Verifies company ownership and not soft-deleted. |
| PUT | /api/v2/selections/categories/:id | Partial update of category fields. Only includes provided fields. Verifies ownership via company_id. |
| DELETE | /api/v2/selections/categories/:id | Soft delete: sets deleted_at timestamp. |
| GET | /api/v2/selections/options | List options filtered by category_id/source/is_recommended/q. Paginated. Search matches name, description, sku. |
| POST | /api/v2/selections/options | Create option. Requires category_id, name. Verifies category exists and belongs to company. Defaults: source=builder, unit_price=0, quantity=1, is_recommended=false. Returns 201. |
| GET | /api/v2/selections/options/:id | Get single option by ID. Scoped to company_id. |
| PUT | /api/v2/selections/options/:id | Partial update of option fields. Verifies ownership. |
| DELETE | /api/v2/selections/options/:id | Soft delete option. |
| GET | /api/v2/selections | List selections filtered by job_id/category_id/status/room/q. Paginated. Search matches room or change_reason. |
| POST | /api/v2/selections | Create selection. Requires category_id, option_id, job_id. Verifies both category and option exist and belong to company. Sets selected_by and selected_at from auth context. Records "selected" history entry. Returns 201. |
| GET | /api/v2/selections/:id | Get selection with history array for the category. Verifies company ownership. |
| PUT | /api/v2/selections/:id | Update selection. Records history entry if status or option changed. |
| DELETE | /api/v2/selections/:id | Soft delete selection. |
| GET | /api/v2/selections/:id/history | List history for a selection's category. Verifies selection exists. Paginated, ordered by created_at desc. |

### Type System
- 4 type unions: SelectionStatus (9 values), PricingModel (3 values), OptionSource (4 values), SelectionHistoryAction (5 values)
- 4 interfaces: SelectionCategory, SelectionOption, Selection, SelectionHistory
- 4 constant arrays with value/label pairs: SELECTION_STATUSES, PRICING_MODELS, OPTION_SOURCES, SELECTION_HISTORY_ACTIONS

### Validation Schemas (Zod)
- 4 enum schemas: selectionStatusEnum, pricingModelEnum, optionSourceEnum, selectionHistoryActionEnum
- listSelectionCategoriesSchema (page/limit/job_id/room/status/pricing_model/q)
- createSelectionCategorySchema (requires job_id, name; defaults: pricing_model=allowance, status=pending, allowance_amount=0, sort_order=0, designer_access=false, lead_time_buffer_days=0)
- updateSelectionCategorySchema (all fields optional)
- listSelectionOptionsSchema (page/limit/category_id/source/is_recommended/q)
- createSelectionOptionSchema (requires category_id, name; defaults: source=builder, is_recommended=false, unit_price=0, quantity=1, total_price=0, lead_time_days=0, sort_order=0)
- updateSelectionOptionSchema (all fields optional)
- listSelectionsSchema (page/limit/job_id/category_id/status/room/q)
- createSelectionSchema (requires category_id, option_id, job_id; default status=selected)
- updateSelectionSchema (all fields optional)
- listSelectionHistorySchema (page/limit, limit defaults to 50)

---

## Module 18: Purchase Orders (V1 Foundation)

### Database Tables
- **purchase_orders**: Core PO header table. Columns: company_id, job_id, vendor_id, po_number (VARCHAR 50), title (VARCHAR 255), status (draft/pending_approval/approved/sent/partially_received/received/closed/voided), subtotal/tax_amount/shipping_amount/total_amount (NUMERIC 15,2), budget_id, cost_code_id, delivery_date, shipping_address, terms, notes, approved_by (FK users), approved_at, sent_at, created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, vendor_id, status, po_number, compound indexes on (company_id, status) and (company_id, job_id).
- **purchase_order_lines**: Line items per PO. Columns: po_id (FK purchase_orders CASCADE), description, quantity (NUMERIC 10,3), unit (VARCHAR 20 default 'each'), unit_price (NUMERIC 15,2), amount (NUMERIC 15,2), received_quantity (NUMERIC 10,3 default 0), cost_code_id, sort_order. Indexes on po_id, cost_code_id.
- **po_receipts**: Receipt records when materials are delivered. Columns: po_id (FK purchase_orders), company_id (FK companies), received_date, received_by (FK users), notes, document_id. RLS enabled. Indexes on po_id, company_id.
- **po_receipt_lines**: Individual line items within a receipt. Columns: receipt_id (FK po_receipts CASCADE), po_line_id (FK purchase_order_lines), quantity_received (NUMERIC 10,3), notes. Indexes on receipt_id, po_line_id.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/purchase-orders | List POs filtered by job_id/vendor_id/status/q. Paginated. Excludes soft-deleted. Search matches title or po_number. |
| POST | /api/v2/purchase-orders | Create new PO. Requires job_id, vendor_id, po_number, title. Defaults to draft status. Sets created_by from auth context. |
| GET | /api/v2/purchase-orders/:id | Get PO with nested lines (sorted by sort_order) and receipts (sorted by received_date desc). Includes lines_count and receipts_count. |
| PUT | /api/v2/purchase-orders/:id | Partial update of PO fields. Only includes provided fields in update. Verifies ownership via company_id. |
| DELETE | /api/v2/purchase-orders/:id | Soft delete: sets deleted_at, changes status to voided. |
| POST | /api/v2/purchase-orders/:id/approve | Approve PO. Validates status is draft or pending_approval (409 otherwise). Sets approved_by, approved_at, status=approved. |
| POST | /api/v2/purchase-orders/:id/send | Mark PO as sent. Validates status is approved (409 otherwise). Sets sent_at, status=sent. |
| GET | /api/v2/purchase-orders/:id/lines | List PO lines paginated. Verifies PO ownership. Ordered by sort_order asc. |
| POST | /api/v2/purchase-orders/:id/lines | Add line to PO. Verifies PO ownership. Requires description. |
| PUT | /api/v2/purchase-orders/:id/lines/:lineId | Partial update of line fields. Verifies PO ownership via company_id. |
| DELETE | /api/v2/purchase-orders/:id/lines/:lineId | Hard delete line. Verifies PO ownership. |
| GET | /api/v2/purchase-orders/:id/receipts | List receipts paginated with nested receipt lines. Verifies PO ownership. Ordered by received_date desc. |
| POST | /api/v2/purchase-orders/:id/receipts | Record receipt. Validates PO status is sent/partially_received/approved (409 otherwise). Creates receipt + receipt lines. Updates received_quantity on each PO line. Auto-updates PO status to partially_received or received based on line fulfillment. |

### Type System
- 1 type union: PurchaseOrderStatus (8 values)
- 4 interfaces: PurchaseOrder, PurchaseOrderLine, PoReceipt, PoReceiptLine
- 1 constant array: PO_STATUSES with value/label pairs for UI dropdowns

### Validation Schemas (Zod)
- 1 enum schema: purchaseOrderStatusEnum
- listPurchaseOrdersSchema (page/limit/job_id/vendor_id/status/q)
- createPurchaseOrderSchema (requires job_id, vendor_id, po_number, title; defaults status=draft, amounts=0)
- updatePurchaseOrderSchema (all fields optional)
- createPurchaseOrderLineSchema (requires description; defaults quantity=1, unit=each)
- updatePurchaseOrderLineSchema (all fields optional)
- listPurchaseOrderLinesSchema (page/limit)
- createPoReceiptSchema (requires lines array min 1 with po_line_id + quantity_received)
- listPoReceiptsSchema (page/limit)
- approvePurchaseOrderSchema (optional notes)
- sendPurchaseOrderSchema (optional notes)

---

## Module 17: Change Order Management (V1 Foundation)

### Database Tables
- **change_orders**: Core change order records. Columns: id, company_id, job_id, co_number (varchar 20), title (varchar 255), description (text), change_type (owner_requested/field_condition/design_change/regulatory/allowance/credit), status (draft/pending_approval/approved/rejected/voided), requested_by_type (builder/client/vendor), requested_by_id, amount (numeric 15,2), cost_impact (numeric 15,2), schedule_impact_days (int default 0), approval_chain (jsonb), approved_by, approved_at, client_approved (boolean default false), client_approved_at, document_id, budget_id, created_by, created_at, updated_at, deleted_at (soft delete). RLS enabled. Indexes on company_id, job_id, status, (company_id, co_number), created_at DESC, deleted_at partial.
- **change_order_items**: Line items for cost breakdown on a change order. Columns: id, change_order_id (FK cascade), description (text), cost_code_id, quantity (numeric 10,3 default 1), unit_price (numeric 15,2), amount (numeric 15,2), markup_pct (numeric 5,2 default 0), markup_amount (numeric 15,2 default 0), total (numeric 15,2 default 0), vendor_id, sort_order (int default 0), created_at, updated_at. RLS enabled. Indexes on change_order_id, cost_code_id, vendor_id.
- **change_order_history**: Audit trail for change order state transitions. Columns: id, change_order_id (FK cascade), action (created/submitted/approved/rejected/voided/revised/client_approved), previous_status, new_status, details (jsonb), performed_by, created_at. RLS enabled. Indexes on change_order_id, action.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/change-orders | List change orders filtered by job_id/status/change_type/q. Paginated. Excludes soft-deleted. Searches title and co_number via OR ilike. |
| POST | /api/v2/change-orders | Create new change order in draft status. Records "created" history entry. Returns 201. |
| GET | /api/v2/change-orders/:id | Get change order with items_count and full history array. Verifies company ownership and not soft-deleted. |
| PUT | /api/v2/change-orders/:id | Update change order. Only draft or pending_approval COs can be updated (403 otherwise). Records "revised" history entry with list of updated fields. |
| DELETE | /api/v2/change-orders/:id | Soft delete. Only draft COs can be deleted (403 otherwise). Sets deleted_at timestamp. |
| POST | /api/v2/change-orders/:id/submit | Transition draft -> pending_approval. Validates current status is draft (403 otherwise). Records "submitted" history entry. Optional notes in details. |
| POST | /api/v2/change-orders/:id/approve | Transition pending_approval -> approved. Validates current status is pending_approval (403 otherwise). Sets approved_by, approved_at. Optional client_approved flag. Records "approved" history entry. |
| GET | /api/v2/change-orders/:id/items | List items for a change order. Verifies CO belongs to company. Ordered by sort_order asc. Paginated. |
| POST | /api/v2/change-orders/:id/items | Add item to change order. Only draft or pending_approval COs (403 otherwise). Returns 201. |
| PUT | /api/v2/change-orders/:id/items/:itemId | Update item. Only draft or pending_approval COs (403 otherwise). Partial update. |
| DELETE | /api/v2/change-orders/:id/items/:itemId | Hard delete item. Only draft or pending_approval COs (403 otherwise). |

### Type System
- 4 type unions: ChangeType (6 values), ChangeOrderStatus (5 values), RequesterType (3 values), ChangeOrderHistoryAction (7 values)
- 3 interfaces: ChangeOrder, ChangeOrderItem, ChangeOrderHistory
- 4 constant arrays with value/label pairs: CHANGE_TYPES, CHANGE_ORDER_STATUSES, REQUESTER_TYPES, CHANGE_ORDER_HISTORY_ACTIONS

### Validation Schemas (Zod)
- 4 enum schemas: changeTypeEnum, changeOrderStatusEnum, requesterTypeEnum, changeOrderHistoryActionEnum
- listChangeOrdersSchema (page/limit/job_id/status/change_type/q)
- createChangeOrderSchema (job_id/co_number/title required + optional description/change_type/status/amounts/etc, defaults: status=draft, change_type=owner_requested, amount=0, schedule_impact_days=0)
- updateChangeOrderSchema (all fields optional)
- submitChangeOrderSchema (optional notes)
- approveChangeOrderSchema (optional notes, optional client_approved boolean)
- listChangeOrderItemsSchema (page/limit, limit defaults to 50)
- createChangeOrderItemSchema (description required + optional quantity/unit_price/amount/markup_pct/markup_amount/total/vendor_id/sort_order/cost_code_id, defaults: quantity=1, all amounts=0)
- updateChangeOrderItemSchema (all fields optional)

## Module 16: QuickBooks & Accounting Integration (V1 Foundation)

### Database Tables
- **accounting_connections**: Stores OAuth connection state per provider per company. Columns: provider (quickbooks_online/xero/sage), status (disconnected/connected/syncing/error), encrypted tokens, external company identifiers, sync_direction (push/pull/bidirectional), settings JSONB. UNIQUE constraint on (company_id, provider). Soft delete via deleted_at.
- **sync_mappings**: Links internal entity UUIDs to external system IDs. Supports vendor/client/account/bill/invoice/payment entity types. UNIQUE constraint on (connection_id, entity_type, internal_id). Tracks sync_status (synced/pending/error/conflict) per mapping.
- **sync_logs**: Immutable audit trail of every sync operation. Tracks entities_processed/created/updated/failed counts, sync_type (full/incremental/manual), direction (push/pull), status (started/completed/partial/failed).
- **sync_conflicts**: Records where platform and external data differ. Stores both internal_data and external_data as JSONB plus field_conflicts array. Resolution options: pending/use_internal/use_external/manual/skipped. Tracks resolver and resolution timestamp.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/integrations/connections | List connections filtered by provider/status. Paginated. Excludes soft-deleted. |
| POST | /api/v2/integrations/connections | Create new connection. Checks for duplicate provider per company (409 if exists). Defaults status to disconnected. |
| GET | /api/v2/integrations/connections/:id | Get connection with mapping counts, recent sync logs (last 5), pending conflict count. |
| PUT | /api/v2/integrations/connections/:id | Update connection settings, status, sync_direction. Verifies ownership. |
| DELETE | /api/v2/integrations/connections/:id | Soft delete: clears tokens, sets status=disconnected, sets deleted_at. |
| POST | /api/v2/integrations/connections/:id/sync | Trigger manual sync. Validates connection is not disconnected or already syncing (409). Creates sync_log entry with status=started. Returns 202 with sync_log_id. |
| GET | /api/v2/integrations/mappings | List mappings filtered by connection_id/entity_type/sync_status. Paginated. |
| POST | /api/v2/integrations/mappings | Create mapping. Validates connection ownership. Checks for duplicate (409). Sets initial sync_status=pending. |
| PUT | /api/v2/integrations/mappings/:id | Update external_id, external_name, sync_status, error_message. |
| DELETE | /api/v2/integrations/mappings/:id | Hard delete mapping record. |
| GET | /api/v2/integrations/sync-logs | List sync logs filtered by connection_id/sync_type/direction/status. Ordered by started_at desc. Paginated. |
| GET | /api/v2/integrations/conflicts | List conflicts filtered by connection_id/entity_type/resolution. Paginated. |
| POST | /api/v2/integrations/conflicts/:id/resolve | Resolve conflict. Rejects if already resolved (409). Rejects "pending" as resolution value. Sets resolved_by and resolved_at. |

### Type System
- 9 type unions: AccountingProvider, ConnectionStatus, SyncDirection, SyncEntityType, SyncStatus, SyncLogStatus, SyncLogType, SyncLogDirection, ConflictResolution
- 4 interfaces: AccountingConnection, SyncMapping, SyncLog, SyncConflict
- 9 constant arrays with value/label pairs for UI dropdowns

### Validation Schemas (Zod)
- 9 enum schemas mapping to type unions
- listConnectionsSchema, createConnectionSchema, updateConnectionSchema
- listMappingsSchema, createMappingSchema, updateMappingSchema
- listSyncLogsSchema, triggerSyncSchema (defaults: manual, push)
- listConflictsSchema, resolveConflictSchema (excludes "pending" from valid resolutions)

## Module 19: Financial Reporting (V1 Foundation)

### Database Tables
- **report_definitions**: Stores saved report definitions per company. Columns: name VARCHAR(200), report_type (profit_loss/balance_sheet/cash_flow/wip/job_cost/ar_aging/ap_aging/budget_vs_actual/retainage/custom), description TEXT, config JSONB, is_system BOOLEAN (for system-provided templates), is_active BOOLEAN (soft delete mechanism). Indexes on company_id, (company_id, report_type), (company_id, is_active). RLS enabled.
- **report_snapshots**: Immutable snapshot of a generated report. Links to report_definition_id. Stores period_start/period_end DATE, snapshot_data JSONB (full report output), generated_by UUID, generated_at TIMESTAMPTZ. Indexes on company_id, (company_id, report_definition_id), (company_id, period_start, period_end). RLS enabled.
- **report_schedules**: Configures automatic report generation. Links to report_definition_id. frequency (daily/weekly/monthly/quarterly), day_of_week INT (0-6), day_of_month INT (1-31), recipients JSONB array of {email, name}, is_active BOOLEAN, last_run_at/next_run_at timestamps. Indexes on company_id, (company_id, report_definition_id), (company_id, is_active), next_run_at WHERE is_active=true. RLS enabled.
- **financial_periods**: Tracks fiscal periods with lock status. period_name VARCHAR(50), period_start/period_end DATE, status (open/closed/locked), fiscal_year INT, fiscal_quarter INT (1-4), closed_by UUID, closed_at TIMESTAMPTZ. UNIQUE on (company_id, period_name). Indexes on company_id, (company_id, period_start, period_end), (company_id, status), (company_id, fiscal_year, fiscal_quarter). RLS enabled.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/reports/definitions | List report definitions. Filterable by report_type, is_active, q (name search). Paginated. |
| POST | /api/v2/reports/definitions | Create report definition. Requires name and report_type. Sets created_by to current user. Returns 201. |
| GET | /api/v2/reports/definitions/:id | Get single report definition by ID. Scoped to company_id. |
| PUT | /api/v2/reports/definitions/:id | Update report definition fields (name, report_type, description, config, is_active). Partial updates supported. |
| DELETE | /api/v2/reports/definitions/:id | Soft delete: sets is_active=false. |
| POST | /api/v2/reports/definitions/:id/generate | Generate a report snapshot. Requires period_start/period_end. Verifies definition exists and is active (403 if inactive). Creates report_snapshots row. Returns 201. V1: stores placeholder snapshot data. |
| GET | /api/v2/reports/snapshots | List report snapshots. Filterable by report_definition_id, period_start (gte), period_end (lte). Ordered by generated_at desc. Paginated. |
| GET | /api/v2/reports/snapshots/:id | Get single snapshot by ID. Scoped to company_id. |
| GET | /api/v2/reports/schedules | List report schedules. Filterable by report_definition_id, is_active. Paginated. |
| POST | /api/v2/reports/schedules | Create schedule. Requires report_definition_id, frequency, recipients (min 1). Validates definition exists. Returns 201. |
| PUT | /api/v2/reports/schedules/:id | Update schedule (frequency, day_of_week, day_of_month, recipients, is_active). Partial updates. |
| DELETE | /api/v2/reports/schedules/:id | Hard delete schedule record. |
| GET | /api/v2/financial-periods | List financial periods. Filterable by status, fiscal_year. Ordered by period_start desc. Paginated. |
| POST | /api/v2/financial-periods | Create financial period. Requires period_name, period_start, period_end, fiscal_year. Always created with status=open. Returns 201. |
| GET | /api/v2/financial-periods/:id | Get single financial period by ID. |
| PUT | /api/v2/financial-periods/:id | Update period fields. Rejects if status=locked (403). Partial updates. |
| POST | /api/v2/financial-periods/:id/close | Close a financial period. Rejects if already closed or locked (403). Sets status=closed, closed_by, closed_at. |

### Type System
- 3 type unions: ReportType (10 values), ScheduleFrequency (4 values), PeriodStatus (3 values)
- 5 interfaces: ReportDefinition, ReportSnapshot, ReportSchedule, ReportRecipient, FinancialPeriod
- 3 constant arrays with value/label pairs: REPORT_TYPES (10), SCHEDULE_FREQUENCIES (4), PERIOD_STATUSES (3)

### Validation Schemas (Zod)
- 3 enum schemas: reportTypeEnum, scheduleFrequencyEnum, periodStatusEnum
- listReportDefinitionsSchema, createReportDefinitionSchema, updateReportDefinitionSchema
- generateReportSchema (requires YYYY-MM-DD date range, optional parameters)
- listReportSnapshotsSchema (with UUID validation on report_definition_id)
- listReportSchedulesSchema, createReportScheduleSchema (min 1 recipient, email validation, day_of_week 0-6, day_of_month 1-31), updateReportScheduleSchema
- listFinancialPeriodsSchema, createFinancialPeriodSchema (YYYY-MM-DD dates, fiscal_year 2000-2100, fiscal_quarter 1-4), updateFinancialPeriodSchema
- closeFinancialPeriodSchema (optional notes)
