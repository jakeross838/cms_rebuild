# Feature Map — RossOS Construction Intelligence Platform

## Module 36: Lead Pipeline & CRM (V1 Foundation)

### Database Tables
- **leads**: Core lead/prospect records. Columns: company_id, first_name (VARCHAR 100), last_name (VARCHAR 100), email (VARCHAR 255), phone (VARCHAR 50), address (TEXT), lot_address (TEXT), source (TEXT default 'other'), source_detail (TEXT), utm_source/utm_medium/utm_campaign (VARCHAR 255), project_type (TEXT), budget_range_low/budget_range_high (NUMERIC 15,2), timeline (TEXT), lot_status (TEXT), financing_status (TEXT), preconstruction_type (design_build/plan_bid_build), status (new/contacted/qualified/proposal_sent/negotiating/won/lost/on_hold), priority (low/normal/high/hot), pipeline_id (FK pipelines), stage_id (FK pipeline_stages), score (INT default 0), assigned_to (UUID), expected_contract_value (NUMERIC 15,2 default 0), probability_pct (NUMERIC 5,2 default 0), lost_reason (TEXT), lost_competitor (TEXT), won_project_id (UUID), created_by (UUID). Soft delete via deleted_at. RLS enabled.
- **lead_activities**: Activity log per lead. Columns: company_id, lead_id (FK leads CASCADE), activity_type (call/email/meeting/note/site_visit/proposal/follow_up), subject (VARCHAR 255), description (TEXT), performed_by (UUID), activity_date (TIMESTAMPTZ), duration_minutes (INT). RLS enabled.
- **lead_sources**: Configurable lead source registry. Columns: company_id, name (VARCHAR 200), description (TEXT), source_type (referral/website/social_media/advertising/trade_show/cold_call/partner/other), is_active (BOOLEAN default true). RLS enabled.
- **pipelines**: Customizable pipeline definitions. Columns: company_id, name (VARCHAR 200), description (TEXT), is_default (BOOLEAN default false), is_active (BOOLEAN default true), created_by (UUID). RLS enabled.
- **pipeline_stages**: Individual stages within a pipeline. Columns: company_id, pipeline_id (FK pipelines CASCADE), name (VARCHAR 200), stage_type (lead/qualified/proposal/negotiation/closed), sequence_order (INT default 0), probability_default (NUMERIC 5,2 default 0), color (VARCHAR 20), is_active (BOOLEAN default true). RLS enabled.

### API Endpoints
- 25 endpoints under /api/v2/crm/ covering leads CRUD, activities CRUD, sources CRUD, pipelines CRUD, pipeline stages CRUD

### Type System
- 6 type unions: LeadStatus (8), LeadSource (8), ActivityType (7), LeadPriority (4), StageType (5), PreconstructionType (2)
- 5 interfaces: Lead, LeadActivity, LeadSourceRecord, Pipeline, PipelineStage
- 6 constant arrays with value/label pairs
- 6 enum schemas + 15 CRUD schemas

---

## Module 39: Advanced Reporting & Custom Report Builder (V1 Foundation)

### Database Tables
- **custom_reports**: User-built report definitions. Columns: company_id, name (VARCHAR 255), description, report_type (standard/custom), data_sources/fields/filters/grouping/sorting/calculated_fields (JSONB), visualization_type (9 types), audience (4 types), status (draft/published/archived), refresh_frequency (4 types), is_template, shared_with, created_by. Soft delete. RLS. 8 indexes.
- **custom_report_widgets**: Widgets within reports. report_id FK CASCADE, widget_type (9), data_source (10), configuration/filters JSONB, sort_order. RLS. 3 indexes.
- **report_dashboards**: Dashboard layouts. layout (4 types), is_default, is_admin_pushed, target_roles, global_filters. Soft delete. RLS. 5 indexes.
- **dashboard_widgets**: Widgets on dashboards. dashboard_id FK CASCADE, position_x/y, width/height, report_id FK SET NULL, refresh_interval_seconds. RLS. 3 indexes.
- **saved_filters**: Reusable filters. context (11 values), filter_config JSONB, is_global. RLS. 4 indexes.

### API Endpoints (23 routes under /api/v2/advanced-reports/)
- Custom Reports: GET list, POST create, GET/PUT/DELETE :id
- Report Widgets: GET/POST :id/widgets, PUT/DELETE :id/widgets/:widgetId
- Dashboards: GET list, POST create, GET/PUT/DELETE :id
- Dashboard Widgets: GET/POST :id/widgets, PUT/DELETE :id/widgets/:widgetId
- Saved Filters: GET list, POST create, GET/PUT/DELETE :id

### Type System
- 8 type unions, 5 interfaces, 8 constant arrays, 8 enum schemas + 15 CRUD schemas

---

## Module 38: Contracts & E-Signature (V1 Foundation)

### Database Tables
- **contracts**: Core contract records with 9-status lifecycle, 8 contract types, soft delete, 12 indexes. RLS enabled.
- **contract_versions**: Immutable version snapshots per contract. CASCADE from contracts. RLS enabled.
- **contract_signers**: Signing parties with role/status tracking, sign order, signature metadata. CASCADE from contracts. RLS enabled.
- **contract_templates**: Reusable contract templates with clause/variable JSONB arrays. Soft delete via is_active. RLS enabled.
- **contract_clauses**: Clause library with category, required flag, sort order. Soft delete via is_active. RLS enabled.

### API Endpoints (13 route files under /api/v2/contracts/)
- Contracts: GET list, POST create, GET/PUT/DELETE by ID, POST send-for-signature
- Versions: GET/POST per contract
- Signers: GET/POST per contract, GET/PUT/DELETE by ID, POST sign, POST decline
- Templates: GET/POST list, GET/PUT/DELETE by ID
- Clauses: GET/POST list, GET/PUT/DELETE by ID

### Type System
- 4 type unions: ContractStatus (9), ContractType (8), SignerStatus (5), SignerRole (6)
- 5 interfaces: Contract, ContractVersion, ContractSigner, ContractTemplate, ContractClause
- 4 constant arrays, 4 enum schemas, 20 CRUD/workflow schemas

---

## Module 40: Mobile App (V1 Foundation)

### Database Tables
- **mobile_devices**: Registered device tracking. Columns: company_id, user_id, device_name (VARCHAR 200), platform (ios/android/web), status (active/inactive/revoked), device_model, os_version, app_version, device_token, last_active_at, last_ip_address, metadata (JSONB), created_by. Soft delete via deleted_at. RLS enabled. 8 indexes.
- **push_notification_tokens**: FCM/APNs/WebPush tokens per device. Columns: company_id, user_id, device_id (FK CASCADE), token (TEXT), provider (fcm/apns/web_push), is_active, last_used_at. RLS enabled. 6 indexes.
- **offline_sync_queue**: Pending offline changes. Columns: company_id, user_id, device_id, action (create/update/delete), entity_type, entity_id, payload (JSONB), status (pending/syncing/synced/conflict/failed), priority (1-10), retry_count, max_retries, error_message, synced_at. RLS enabled. 10 indexes.
- **mobile_app_settings**: Per-user preferences. Columns: company_id, user_id (UNIQUE pair), data_saver_mode, auto_sync, sync_on_wifi_only, photo_quality (low/medium/high), location_tracking, gps_accuracy (low/balanced/high), biometric_enabled, quiet_hours_start/end, push_notifications, offline_storage_limit_mb, theme (light/dark/system), preferences (JSONB). RLS enabled.
- **mobile_sessions**: Session tracking. Columns: company_id, user_id, device_id (FK CASCADE), session_token, status (active/expired/revoked), ip_address, user_agent, started_at, last_activity_at, expires_at, ended_at. RLS enabled. 9 indexes.

### API Endpoints (23 routes under /api/v2/mobile/)
- Devices: GET list, POST create, GET/PUT/DELETE by ID (soft delete + revoke)
- Push Tokens: GET list, POST create, GET/PUT/DELETE by ID (hard delete)
- Sync Queue: GET list, POST create, GET/PUT/DELETE by ID (hard delete)
- Settings: GET (returns defaults if none), PUT (upsert)
- Sessions: GET list, POST create, GET/PUT/DELETE by ID, POST :id/revoke

### Type System
- 9 type unions, 5 interfaces, 9 constant arrays, 9 enum schemas + 16 CRUD schemas

---

## Module 32: Permitting & Inspections (V1 Foundation)

### Database Tables
- **permits**: Core permit records per job. company_id, job_id, permit_number, permit_type (10 types), status (7 statuses), jurisdiction, dates, conditions, notes. Soft delete. RLS. updated_at trigger.
- **permit_inspections**: Inspections per permit. company_id, permit_id (CASCADE), job_id, inspection_type (9 types), status (6 statuses), scheduling info, inspector info, reinspection tracking. RLS. updated_at trigger.
- **inspection_results**: Results per inspection. company_id, inspection_id (CASCADE), result (pass/fail/conditional), deficiencies JSONB, photos JSONB, FTQ tracking, vendor attribution. RLS. updated_at trigger.
- **permit_documents**: Documents per permit. company_id, permit_id (CASCADE), document_type, file_url, file_name, description. RLS.
- **permit_fees**: Fee tracking per permit. company_id, permit_id (CASCADE), description, amount, status (4 statuses), dates, receipt_url. RLS. updated_at trigger.

### API Endpoints (22 routes under /api/v2/permits/)
- Permits: GET list, POST create, GET/PUT/DELETE :id
- Inspections: GET/POST per permit, GET/PUT :inspectionId
- Results: GET/POST per inspection, GET/PUT :resultId
- Documents: GET/POST per permit, GET/DELETE :docId
- Fees: GET/POST per permit, GET/PUT/DELETE :feeId

### Type System
- 6 type unions, 5 interfaces, 6 constant arrays, 6 enum schemas + 15 CRUD schemas

---

## Module 30: Vendor Portal (V1 Foundation)

### Database Tables
- **vendor_portal_settings**: Per-company portal config. UNIQUE(company_id). portal_enabled, allow_self_registration, require_approval, allowed_submission_types/required_compliance_docs (JSONB), auto_approve_submissions, portal_branding/notification_settings (JSONB). Soft delete. RLS.
- **vendor_portal_invitations**: Invite vendors. vendor_name, email, status (pending/accepted/expired/revoked), token, expires_at. Soft delete. RLS.
- **vendor_portal_access**: Per-vendor permissions. UNIQUE(company_id, vendor_id). access_level (full/limited/readonly), 7 boolean flags, allowed_job_ids. Soft delete. RLS.
- **vendor_submissions**: Vendor documents. submission_type (6 types), status (5 statuses), title, amount, file_urls, metadata. Soft delete. RLS.
- **vendor_messages**: Messaging with threading. direction (to_vendor/from_vendor), is_read, parent_message_id. Soft delete. RLS.

### API Endpoints (27 routes)
- Settings: GET/POST/PUT. Invitations: CRUD + revoke. Access: CRUD (409 duplicate). Submissions: CRUD + submit + review. Messages: CRUD + mark read.

### Type System
- 5 type unions, 5 interfaces, 5 constant arrays, 5 enum schemas + 19 CRUD schemas

---

## Module 37: Marketing & Portfolio (V1 Foundation)

### Database Tables
- **portfolio_projects**: Showcase projects for marketing portfolio. status (draft/published/featured/archived), soft delete, RLS.
- **portfolio_photos**: Photos for portfolio projects. photo_type (exterior/interior/before/after/progress/detail), CASCADE from portfolio_projects, RLS.
- **client_reviews**: Testimonials and reviews. source (google/houzz/facebook/yelp/bbb/angi/platform), status (pending/approved/published/rejected), rating 1-5, RLS.
- **marketing_campaigns**: Campaign tracking. campaign_type (email/social/print/referral/event/other), status (draft/active/paused/completed/cancelled), ROI metrics, RLS.
- **campaign_contacts**: Contacts in campaigns. status (pending/sent/opened/clicked/converted/unsubscribed), CASCADE from marketing_campaigns, RLS.

### API Endpoints (21 routes under /api/v2/marketing/)
- Portfolio: GET/POST list, GET/PUT/DELETE :id, GET/POST :id/photos
- Reviews: GET/POST list, GET/PUT :id
- Campaigns: GET/POST list, GET/PUT :id, GET/POST :id/contacts, GET/PUT/DELETE :id/contacts/:contactId

### Type System
- 7 type unions, 5 interfaces, 7 constant arrays, 7 enum schemas + 15 CRUD schemas

---

## Module 34: HR & Workforce Management (V1 Foundation)

### Database Tables
- **departments**: Organizational structure. Columns: company_id, name (VARCHAR 200), description (TEXT), parent_id (self-ref UUID nullable), head_user_id (UUID), is_active (BOOLEAN default true). RLS enabled. Indexes on company_id, parent_id, (company_id, is_active). updated_at trigger.
- **positions**: Job titles/roles. Columns: company_id, title (VARCHAR 200), description (TEXT), department_id (FK departments), pay_grade (VARCHAR 50), is_active (BOOLEAN default true). RLS enabled. Indexes on company_id, department_id, (company_id, is_active). updated_at trigger.
- **employees**: Employee records beyond basic users. Columns: company_id, user_id (UUID), employee_number (VARCHAR 50), first_name (VARCHAR 100), last_name (VARCHAR 100), email (VARCHAR 255), phone (VARCHAR 20), hire_date (DATE), termination_date (DATE), department_id (FK departments), position_id (FK positions), employment_status (active/inactive/terminated/on_leave/probation), employment_type (full_time/part_time/contract/seasonal/temp), base_wage (NUMERIC 12,2), pay_type (hourly/salary), workers_comp_class (VARCHAR 50), emergency_contact_name, emergency_contact_phone, address, notes, created_by. Soft delete via deleted_at. RLS enabled. 9 indexes including compound.
- **employee_certifications**: Licenses, certs, training records. Columns: company_id, employee_id (FK employees CASCADE), certification_name (VARCHAR 255), certification_type (VARCHAR 100), certification_number (VARCHAR 100), issuing_authority (VARCHAR 200), issued_date (DATE), expiration_date (DATE), status (active/expired/pending_renewal/revoked), document_url (TEXT), notes, created_by. RLS enabled. 6 indexes.
- **employee_documents**: HR documents. Columns: company_id, employee_id (FK employees CASCADE), document_type (resume/contract/tax_form/identification/certification/performance_review/disciplinary/other), title (VARCHAR 255), description (TEXT), file_url (TEXT), file_name (VARCHAR 255), file_size_bytes (BIGINT), uploaded_by. RLS enabled. 4 indexes.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/hr/employees | List employees filtered by employment_status/employment_type/department_id/position_id/q. Paginated. Excludes soft-deleted. Searches first_name, last_name, employee_number, email via OR ilike. |
| POST | /api/v2/hr/employees | Create employee. Requires employee_number, first_name, last_name, hire_date. Defaults: active, full_time, hourly, base_wage=0. Returns 201. |
| GET | /api/v2/hr/employees/:id | Get employee with certifications_count and documents_count. |
| PUT | /api/v2/hr/employees/:id | Partial update of employee fields. |
| DELETE | /api/v2/hr/employees/:id | Soft delete: sets deleted_at. |
| GET | /api/v2/hr/certifications | List certifications filtered by employee_id/status/q. Paginated. |
| POST | /api/v2/hr/certifications | Create certification. Requires employee_id, certification_name. Verifies employee exists. Default status=active. Returns 201. |
| GET | /api/v2/hr/certifications/:id | Get single certification. |
| PUT | /api/v2/hr/certifications/:id | Partial update. |
| DELETE | /api/v2/hr/certifications/:id | Hard delete. |
| GET | /api/v2/hr/documents | List documents filtered by employee_id/document_type/q. Paginated. |
| POST | /api/v2/hr/documents | Create document. Requires employee_id, title. Verifies employee exists. Default document_type=other. Returns 201. |
| GET | /api/v2/hr/documents/:id | Get single document. |
| PUT | /api/v2/hr/documents/:id | Partial update. |
| DELETE | /api/v2/hr/documents/:id | Hard delete. |
| GET | /api/v2/hr/departments | List departments filtered by is_active/q. Paginated. Ordered by name asc. |
| POST | /api/v2/hr/departments | Create department. Requires name. Default is_active=true. Returns 201. |
| GET | /api/v2/hr/departments/:id | Get department with employees_count and positions_count. |
| PUT | /api/v2/hr/departments/:id | Partial update. |
| DELETE | /api/v2/hr/departments/:id | Deactivate: sets is_active=false. |
| GET | /api/v2/hr/positions | List positions filtered by department_id/is_active/q. Paginated. Ordered by title asc. |
| POST | /api/v2/hr/positions | Create position. Requires title. Default is_active=true. Returns 201. |
| GET | /api/v2/hr/positions/:id | Get position with employees_count. |
| PUT | /api/v2/hr/positions/:id | Partial update. |
| DELETE | /api/v2/hr/positions/:id | Deactivate: sets is_active=false. |

### Type System
- 5 type unions: EmploymentStatus (5), EmploymentType (5), PayType (2), CertificationStatus (4), DocumentType (8)
- 5 interfaces: Employee, EmployeeCertification, EmployeeDocument, Department, Position
- 5 constant arrays: EMPLOYMENT_STATUSES, EMPLOYMENT_TYPES, PAY_TYPES, CERTIFICATION_STATUSES, DOCUMENT_TYPES

### Validation Schemas (Zod)
- 5 enum schemas + 15 CRUD schemas covering employees, certifications, documents, departments, positions

---

## Module 33: Safety & Compliance (V1 Foundation)

### Database Tables
- **safety_incidents**: Incident/near-miss reports. Columns: company_id, job_id, incident_number (VARCHAR 30), title (VARCHAR 255), description (TEXT), incident_date (DATE), incident_time (TIME), location (VARCHAR 200), severity (near_miss/minor/moderate/serious/fatal), status (reported/investigating/resolved/closed), incident_type (fall/struck_by/caught_in/electrical/chemical/heat/vehicle/other), reported_by (UUID), assigned_to (UUID), injured_party (VARCHAR 255), injury_description (TEXT), witnesses (JSONB), root_cause (TEXT), corrective_actions (TEXT), preventive_actions (TEXT), osha_recordable (BOOLEAN), osha_report_number (VARCHAR 50), lost_work_days (INT), restricted_days (INT), medical_treatment (BOOLEAN), photos (JSONB), documents (JSONB), resolved_at, resolved_by, closed_at, closed_by, created_by. Soft delete via deleted_at. RLS enabled.
- **safety_inspections**: Site safety inspections. Columns: company_id, job_id, inspection_number (VARCHAR 30), title (VARCHAR 255), description (TEXT), inspection_date (DATE), inspection_type (VARCHAR 100 default 'general'), status (scheduled/in_progress/completed/failed), result (pass/fail/conditional nullable), inspector_id (UUID), location (VARCHAR 200), total_items/passed_items/failed_items/na_items (INT), score (NUMERIC 5,2), notes (TEXT), follow_up_required (BOOLEAN), follow_up_date (DATE), follow_up_notes (TEXT), completed_at, completed_by, created_by. Soft delete via deleted_at. RLS enabled.
- **safety_inspection_items**: Individual checklist items per inspection. Columns: inspection_id (FK safety_inspections CASCADE), company_id, description (TEXT), category (VARCHAR 100), result (pass/fail/na/not_inspected), notes (TEXT), photo_url (TEXT), sort_order (INT). RLS enabled.
- **toolbox_talks**: Safety meeting records. Columns: company_id, job_id, title (VARCHAR 255), topic (VARCHAR 200), description (TEXT), talk_date (DATE), talk_time (TIME), duration_minutes (INT), status (scheduled/completed/cancelled), presenter_id (UUID), location (VARCHAR 200), materials (JSONB), notes (TEXT), completed_at, created_by. RLS enabled.
- **toolbox_talk_attendees**: Attendance tracking. Columns: talk_id (FK toolbox_talks CASCADE), company_id, attendee_name (VARCHAR 200), attendee_id (UUID), trade (VARCHAR 100), company_name (VARCHAR 200), signed (BOOLEAN), signed_at, notes (TEXT). RLS enabled.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/safety/incidents | List incidents filtered by job_id/status/severity/incident_type/q. Paginated. Excludes soft-deleted. Searches title and incident_number. |
| POST | /api/v2/safety/incidents | Create incident. Requires job_id, incident_number, title, incident_date. Defaults: severity=near_miss, status=reported, incident_type=other. Returns 201. |
| GET | /api/v2/safety/incidents/:id | Get single incident. |
| PUT | /api/v2/safety/incidents/:id | Update incident. Closed incidents cannot be updated (403). Auto-sets resolved_at/resolved_by and closed_at/closed_by on status transitions. |
| DELETE | /api/v2/safety/incidents/:id | Soft delete incident. |
| GET | /api/v2/safety/inspections | List inspections filtered by job_id/status/result/inspector_id/q. Paginated. Excludes soft-deleted. |
| POST | /api/v2/safety/inspections | Create inspection. Requires job_id, inspection_number, title, inspection_date. Defaults: status=scheduled, inspection_type=general. Returns 201. |
| GET | /api/v2/safety/inspections/:id | Get inspection with items array and items_count. |
| PUT | /api/v2/safety/inspections/:id | Update inspection fields. |
| DELETE | /api/v2/safety/inspections/:id | Soft delete inspection. |
| POST | /api/v2/safety/inspections/:id/complete | Complete inspection. Requires result (pass/fail/conditional). Only scheduled/in_progress inspections (409). Sets completed_at/completed_by. Fail result sets status=failed. |
| GET | /api/v2/safety/inspections/:id/items | List inspection items. Paginated. Ordered by sort_order. |
| POST | /api/v2/safety/inspections/:id/items | Add inspection item. Requires description. Returns 201. |
| PUT | /api/v2/safety/inspections/:id/items/:itemId | Update inspection item. |
| DELETE | /api/v2/safety/inspections/:id/items/:itemId | Delete inspection item. |
| GET | /api/v2/safety/toolbox-talks | List talks filtered by job_id/status/q. Paginated. Searches title and topic. |
| POST | /api/v2/safety/toolbox-talks | Create talk. Requires job_id, title, talk_date. Defaults: status=scheduled. Returns 201. |
| GET | /api/v2/safety/toolbox-talks/:id | Get talk with attendees array and attendees_count. |
| PUT | /api/v2/safety/toolbox-talks/:id | Update talk fields. |
| POST | /api/v2/safety/toolbox-talks/:id/complete | Complete talk. Only scheduled talks (409). Sets completed_at. |
| GET | /api/v2/safety/toolbox-talks/:id/attendees | List attendees. Paginated. |
| POST | /api/v2/safety/toolbox-talks/:id/attendees | Add attendee. Requires attendee_name. Auto-sets signed_at when signed=true. Returns 201. |
| PUT | /api/v2/safety/toolbox-talks/:id/attendees/:attendeeId | Update attendee. |
| DELETE | /api/v2/safety/toolbox-talks/:id/attendees/:attendeeId | Delete attendee. |

### Type System
- 7 type unions: IncidentSeverity (5), IncidentStatus (4), IncidentType (8), InspectionStatus (4), InspectionResult (3), InspectionItemResult (4), TalkStatus (3)
- 5 interfaces: SafetyIncident, SafetyInspection, SafetyInspectionItem, ToolboxTalk, ToolboxTalkAttendee
- 7 constant arrays: INCIDENT_SEVERITIES, INCIDENT_STATUSES, INCIDENT_TYPES, INSPECTION_STATUSES, INSPECTION_RESULTS, INSPECTION_ITEM_RESULTS, TALK_STATUSES

### Validation Schemas (Zod)
- 7 enum schemas + 16 CRUD/workflow schemas covering incidents (list/create/update), inspections (list/create/update/complete), inspection items (list/create/update), toolbox talks (list/create/update/complete), and attendees (list/create/update)

---

## Module 35: Equipment & Asset Management (V1 Foundation)

### Database Tables
- **equipment**: Core equipment/asset records. Columns: company_id, name (VARCHAR 255), description (TEXT), equipment_type (heavy_machinery/vehicle/power_tool/hand_tool/scaffolding/safety_equipment/measuring/other), status (available/assigned/maintenance/out_of_service/retired), ownership_type (owned/leased/rented), make (VARCHAR 100), model (VARCHAR 100), serial_number (VARCHAR 100), year (INT), purchase_date (DATE), purchase_price (NUMERIC 15,2), current_value (NUMERIC 15,2), daily_rate (NUMERIC 10,2), location (VARCHAR 200), notes (TEXT), photo_urls (JSONB), created_by (UUID). Soft delete via deleted_at. RLS enabled. 8 indexes.
- **equipment_assignments**: Job/crew assignment tracking. Columns: company_id, equipment_id (FK equipment CASCADE), job_id (UUID), assigned_to (UUID), assigned_by (UUID), start_date (DATE NOT NULL), end_date (DATE), status (active/completed/cancelled), hours_used (NUMERIC 10,2), notes (TEXT). RLS enabled. 7 indexes.
- **equipment_maintenance**: Maintenance records and schedules. Columns: company_id, equipment_id (FK equipment CASCADE), maintenance_type (preventive/corrective/inspection/calibration), status (scheduled/in_progress/completed/overdue/cancelled), title (VARCHAR 255), description (TEXT), scheduled_date (DATE), completed_date (DATE), performed_by (UUID), service_provider (VARCHAR 200), parts_cost/labor_cost/total_cost (NUMERIC 10,2), notes (TEXT), created_by (UUID). RLS enabled. 7 indexes.
- **equipment_inspections**: Pre-use and periodic inspections. Columns: company_id, equipment_id (FK equipment CASCADE), inspection_type (pre_use/post_use/periodic/safety), result (pass/fail/conditional), inspection_date (DATE default CURRENT_DATE), inspector_id (UUID), checklist (JSONB), deficiencies (TEXT), corrective_action (TEXT), notes (TEXT), created_by (UUID). RLS enabled. 6 indexes.
- **equipment_costs**: Daily rate tracking, fuel, repairs. Columns: company_id, equipment_id (FK equipment CASCADE), job_id (UUID), cost_type (daily_rate/fuel/repair/insurance/transport/other), amount (NUMERIC 12,2), cost_date (DATE default CURRENT_DATE), description (TEXT), vendor_id (UUID), receipt_url (TEXT), notes (TEXT), created_by (UUID). RLS enabled. 7 indexes.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/equipment | List equipment filtered by status/equipment_type/ownership_type/q. Paginated. Excludes soft-deleted. Searches name and serial_number. |
| POST | /api/v2/equipment | Create equipment. Requires name. Defaults: equipment_type=other, status=available, ownership_type=owned. Returns 201. |
| GET | /api/v2/equipment/:id | Get equipment with assignments_count, maintenance_count, costs_count. |
| PUT | /api/v2/equipment/:id | Partial update of equipment fields. |
| DELETE | /api/v2/equipment/:id | Soft delete: sets deleted_at. |
| GET | /api/v2/equipment/:id/assignments | List assignments for equipment filtered by status. Paginated. |
| POST | /api/v2/equipment/:id/assignments | Create assignment. Verifies equipment exists. Returns 201. |
| GET | /api/v2/equipment/assignments/:assignmentId | Get single assignment. |
| PUT | /api/v2/equipment/assignments/:assignmentId | Update assignment. |
| DELETE | /api/v2/equipment/assignments/:assignmentId | Hard delete assignment. |
| GET | /api/v2/equipment/:id/maintenance | List maintenance records filtered by maintenance_type/status. Paginated. |
| POST | /api/v2/equipment/:id/maintenance | Create maintenance record. Verifies equipment exists. Returns 201. |
| GET | /api/v2/equipment/maintenance/:maintenanceId | Get single maintenance record. |
| PUT | /api/v2/equipment/maintenance/:maintenanceId | Update maintenance record. |
| DELETE | /api/v2/equipment/maintenance/:maintenanceId | Hard delete maintenance record. |
| GET | /api/v2/equipment/:id/inspections | List inspections filtered by inspection_type/result. Paginated. |
| POST | /api/v2/equipment/:id/inspections | Create inspection. Verifies equipment exists. Returns 201. |
| GET | /api/v2/equipment/inspections/:inspectionId | Get single inspection. |
| PUT | /api/v2/equipment/inspections/:inspectionId | Update inspection. |
| DELETE | /api/v2/equipment/inspections/:inspectionId | Hard delete inspection. |
| GET | /api/v2/equipment/:id/costs | List costs filtered by cost_type/job_id. Paginated. |
| POST | /api/v2/equipment/:id/costs | Create cost record. Verifies equipment exists. Returns 201. |
| GET | /api/v2/equipment/costs/:costId | Get single cost record. |
| PUT | /api/v2/equipment/costs/:costId | Update cost record. |
| DELETE | /api/v2/equipment/costs/:costId | Hard delete cost record. |

### Type System
- 9 type unions: EquipmentStatus (5), EquipmentType (8), OwnershipType (3), MaintenanceType (4), MaintenanceStatus (5), AssignmentStatus (3), InspectionType (4), InspectionResult (3), CostType (6)
- 5 interfaces: Equipment, EquipmentAssignment, EquipmentMaintenance, EquipmentInspection, EquipmentCost
- 9 constant arrays: EQUIPMENT_STATUSES, EQUIPMENT_TYPES, OWNERSHIP_TYPES, MAINTENANCE_TYPES, MAINTENANCE_STATUSES, ASSIGNMENT_STATUSES, INSPECTION_TYPES, INSPECTION_RESULTS, COST_TYPES

### Validation Schemas (Zod)
- 9 enum schemas: equipmentStatusEnum, equipmentTypeEnum, ownershipTypeEnum, maintenanceTypeEnum, maintenanceStatusEnum, assignmentStatusEnum, inspectionTypeEnum, inspectionResultEnum, costTypeEnum
- listEquipmentSchema (page/limit/status/equipment_type/ownership_type/q)
- createEquipmentSchema (requires name; defaults: equipment_type=other, status=available, ownership_type=owned, purchase_price=0, current_value=0, daily_rate=0, photo_urls=[])
- updateEquipmentSchema (all fields optional)
- listAssignmentsSchema (page/limit/equipment_id/job_id/status)
- createAssignmentSchema (requires equipment_id, start_date; defaults: status=active, hours_used=0)
- updateAssignmentSchema (all fields optional)
- listMaintenanceSchema (page/limit/equipment_id/maintenance_type/status)
- createMaintenanceSchema (requires equipment_id, title; defaults: maintenance_type=preventive, status=scheduled, costs=0)
- updateMaintenanceSchema (all fields optional)
- listInspectionsSchema (page/limit/equipment_id/inspection_type/result)
- createInspectionSchema (requires equipment_id; defaults: inspection_type=pre_use, result=pass, checklist=[])
- updateInspectionSchema (all fields optional)
- listCostsSchema (page/limit/equipment_id/job_id/cost_type)
- createCostSchema (requires equipment_id, amount; defaults: cost_type=daily_rate)
- updateCostSchema (all fields optional)

---

## Module 31: Warranty & Home Care (V1 Foundation)

### Database Tables
- **warranties**: Core warranty records per job/item. Columns: company_id, job_id, title (VARCHAR 255), description (TEXT), warranty_type (structural/mechanical/electrical/plumbing/hvac/roofing/appliance/general/workmanship), status (active/expired/voided/transferred), vendor_id (UUID), start_date (DATE), end_date (DATE), coverage_details (TEXT), exclusions (TEXT), document_id (UUID), contact_name (VARCHAR 200), contact_phone (VARCHAR 50), contact_email (VARCHAR 200), transferred_to (UUID), transferred_at (TIMESTAMPTZ), created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, status, warranty_type, vendor_id, end_date, compound (company_id, status), (company_id, job_id), deleted_at partial.
- **warranty_claims**: Claims filed against warranties. Columns: company_id, warranty_id (FK warranties CASCADE), claim_number (VARCHAR 30), title (VARCHAR 255), description (TEXT), status (submitted/acknowledged/in_progress/resolved/denied/escalated), priority (low/normal/high/urgent), reported_by (UUID), reported_date (DATE default CURRENT_DATE), assigned_to (UUID), assigned_vendor_id (UUID), resolution_notes (TEXT), resolution_cost (NUMERIC 15,2 default 0), resolved_at (TIMESTAMPTZ), resolved_by (UUID), due_date (DATE), photos (JSONB default []), created_by. Soft delete via deleted_at. RLS enabled. Indexes on company_id, warranty_id, status, priority, assigned_to, assigned_vendor_id, (company_id, claim_number), (company_id, status), deleted_at partial.
- **warranty_claim_history**: Audit trail for claim state changes. Columns: claim_id (FK warranty_claims CASCADE), company_id, action (created/acknowledged/assigned/in_progress/resolved/denied/escalated/reopened/note_added), previous_status (TEXT), new_status (TEXT), details (JSONB default {}), performed_by (UUID). RLS enabled. Indexes on claim_id, company_id, action.
- **maintenance_schedules**: Recurring maintenance items per job. Columns: company_id, job_id, title (VARCHAR 255), description (TEXT), frequency (weekly/monthly/quarterly/semi_annual/annual), category (VARCHAR 100), assigned_to (UUID), assigned_vendor_id (UUID), start_date (DATE), end_date (DATE nullable), next_due_date (DATE nullable), estimated_cost (NUMERIC 15,2 default 0), is_active (BOOLEAN default true), notes (TEXT), created_by. Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, frequency, next_due_date, (company_id, job_id), is_active partial, deleted_at partial.
- **maintenance_tasks**: Individual task instances generated from schedules. Columns: company_id, schedule_id (FK maintenance_schedules CASCADE), title (VARCHAR 255), description (TEXT), status (pending/scheduled/completed/overdue/skipped), due_date (DATE), completed_at (TIMESTAMPTZ), completed_by (UUID), actual_cost (NUMERIC 15,2 default 0), notes (TEXT). RLS enabled. Indexes on company_id, schedule_id, status, due_date, (company_id, status).

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/warranties | List warranties filtered by job_id/status/warranty_type/vendor_id/q. Paginated. Excludes soft-deleted. Searches title and contact_name via OR ilike. |
| POST | /api/v2/warranties | Create warranty. Requires job_id, title, start_date, end_date. Defaults: warranty_type=general, status=active. Returns 201. |
| GET | /api/v2/warranties/:id | Get warranty with claims_count. Verifies company ownership and not soft-deleted. |
| PUT | /api/v2/warranties/:id | Partial update. Auto-sets transferred_at when status changes to transferred. |
| DELETE | /api/v2/warranties/:id | Soft delete. |
| GET | /api/v2/warranties/:id/claims | List claims for a warranty. Filtered by status/priority/assigned_to/q. Paginated. Verifies warranty ownership. |
| POST | /api/v2/warranties/:id/claims | Create claim. Requires claim_number, title. Defaults: status=submitted, priority=normal, photos=[]. Records "created" history entry. Returns 201. |
| GET | /api/v2/warranties/:id/claims/:claimId | Get claim with full history array. |
| PUT | /api/v2/warranties/:id/claims/:claimId | Update claim. Records history entry on status change. |
| DELETE | /api/v2/warranties/:id/claims/:claimId | Soft delete claim. |
| POST | /api/v2/warranties/:id/claims/:claimId/resolve | Resolve claim. Validates not already resolved/denied (409). Sets resolved_at, resolved_by. Records history. |
| GET | /api/v2/warranties/:id/claims/:claimId/history | List claim history. Paginated. |
| GET | /api/v2/maintenance-schedules | List schedules filtered by job_id/frequency/is_active/q. Paginated. Ordered by next_due_date asc. |
| POST | /api/v2/maintenance-schedules | Create schedule. Requires job_id, title, start_date. Defaults: frequency=annual, estimated_cost=0, is_active=true. Returns 201. |
| GET | /api/v2/maintenance-schedules/:id | Get schedule with tasks_count. |
| PUT | /api/v2/maintenance-schedules/:id | Partial update. |
| DELETE | /api/v2/maintenance-schedules/:id | Soft delete. |
| GET | /api/v2/maintenance-schedules/:id/tasks | List tasks for schedule. Filtered by status/q. Ordered by due_date asc. |
| POST | /api/v2/maintenance-schedules/:id/tasks | Create task. Requires title, due_date. Defaults: status=pending, actual_cost=0. Returns 201. |
| GET | /api/v2/maintenance-schedules/:id/tasks/:taskId | Get single task. |
| PUT | /api/v2/maintenance-schedules/:id/tasks/:taskId | Update task. |
| DELETE | /api/v2/maintenance-schedules/:id/tasks/:taskId | Hard delete task. |
| POST | /api/v2/maintenance-schedules/:id/tasks/:taskId/complete | Complete task. Validates not already completed/skipped (409). Sets completed_at, completed_by. |

### Type System
- 7 type unions: WarrantyStatus (4), WarrantyType (9), ClaimStatus (6), ClaimPriority (4), ClaimHistoryAction (9), MaintenanceFrequency (5), TaskStatus (5)
- 5 interfaces: Warranty, WarrantyClaim, WarrantyClaimHistory, MaintenanceSchedule, MaintenanceTask
- 7 constant arrays: WARRANTY_STATUSES, WARRANTY_TYPES, CLAIM_STATUSES, CLAIM_PRIORITIES, CLAIM_HISTORY_ACTIONS, MAINTENANCE_FREQUENCIES, TASK_STATUSES

### Validation Schemas (Zod)
- 7 enum schemas: warrantyStatusEnum, warrantyTypeEnum, claimStatusEnum, claimPriorityEnum, claimHistoryActionEnum, maintenanceFrequencyEnum, taskStatusEnum
- listWarrantiesSchema (page/limit/job_id/status/warranty_type/vendor_id/q)
- createWarrantySchema (requires job_id, title, start_date, end_date; defaults: warranty_type=general, status=active)
- updateWarrantySchema (all fields optional, includes transferred_to)
- listWarrantyClaimsSchema (page/limit/warranty_id/status/priority/assigned_to/q)
- createWarrantyClaimSchema (requires warranty_id, claim_number, title; defaults: status=submitted, priority=normal, photos=[])
- updateWarrantyClaimSchema (all fields optional, includes resolution fields)
- resolveWarrantyClaimSchema (optional resolution_notes, resolution_cost default 0)
- listClaimHistorySchema (page/limit, limit defaults to 50)
- listMaintenanceSchedulesSchema (page/limit/job_id/frequency/is_active/q with boolean preprocess)
- createMaintenanceScheduleSchema (requires job_id, title, start_date; defaults: frequency=annual, estimated_cost=0, is_active=true)
- updateMaintenanceScheduleSchema (all fields optional)
- listMaintenanceTasksSchema (page/limit/schedule_id/status/q)
- createMaintenanceTaskSchema (requires schedule_id, title, due_date; defaults: status=pending, actual_cost=0)
- updateMaintenanceTaskSchema (all fields optional)
- completeMaintenanceTaskSchema (optional actual_cost default 0, optional notes)

---

## Module 29: Full Client Portal (V1 Foundation)

### Database Tables
- **client_portal_settings**: Per-company portal configuration. Columns: company_id (UNIQUE), branding (JSONB), custom_domain (VARCHAR 200), feature_flags (JSONB), visibility_rules (JSONB), notification_rules (JSONB), approval_config (JSONB), email_templates (JSONB), footer_text (TEXT), privacy_policy_url (TEXT), terms_of_service_url (TEXT). RLS enabled. updated_at trigger.
- **client_portal_invitations**: Invite clients to the portal. Columns: company_id, job_id, email (VARCHAR 255), client_name (VARCHAR 255), role (VARCHAR 50 default 'client'), status (pending/accepted/expired/revoked), token (VARCHAR 255), invited_by (FK users), accepted_at, accepted_by (FK users), expires_at (TIMESTAMPTZ NOT NULL), message (TEXT). Soft delete via deleted_at. RLS enabled. updated_at trigger. Indexes on company, job, email, status, token, deleted_at partial.
- **client_approvals**: Client approval requests for selections/COs/draws/invoices/schedules. Columns: company_id, job_id, client_user_id (FK users), approval_type (selection/change_order/draw/invoice/schedule), reference_id (UUID), title (VARCHAR 255), description (TEXT), status (pending/approved/rejected/expired), requested_at, responded_at, expires_at, signature_data (TEXT), signature_ip (VARCHAR 45), signature_hash (VARCHAR 64), comments (TEXT), requested_by (FK users). Soft delete via deleted_at. RLS enabled. updated_at trigger. Indexes on company, job, client, status, type, reference, compound (company+job+status), deleted_at partial.
- **client_messages**: Enhanced messaging between builder and client. Columns: company_id, job_id, sender_user_id (FK users), sender_type (client/builder_team), subject (VARCHAR 255), message_text (TEXT), thread_id (UUID), topic (VARCHAR 200), category (general/selections/change_orders/schedule/budget/warranty/other), attachments (JSONB default []), is_external_log (BOOLEAN), external_channel (phone/text/email nullable), read_at, status (sent/read/archived). Soft delete via deleted_at. RLS enabled. updated_at trigger. Indexes on company, job, sender, thread, category, status, created_at DESC, deleted_at partial.
- **client_payments**: Payment records (no processing). Columns: company_id, job_id, client_user_id (FK users nullable), payment_number (VARCHAR 50), amount (NUMERIC 15,2), payment_method (credit_card/ach/check/wire/other), status (pending/processing/completed/failed/refunded), reference_number (VARCHAR 100), description (TEXT), draw_request_id (UUID), invoice_id (UUID), payment_date (DATE), received_at, received_by (FK users), notes (TEXT), created_by (FK users). Soft delete via deleted_at. RLS enabled. updated_at trigger. Indexes on company, job, client, status, method, date, draw, invoice, deleted_at partial.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/client-portal/settings | Get portal settings for current company. Returns single record or null. |
| PUT | /api/v2/client-portal/settings | Upsert portal settings. Validates branding, feature_flags, visibility_rules, etc. |
| GET | /api/v2/client-portal/invitations | List invitations filtered by job_id/status/q. Paginated. Excludes soft-deleted. Searches email and client_name. |
| POST | /api/v2/client-portal/invitations | Create invitation. Requires job_id, email. Auto-generates token and expiration. Returns 201. |
| GET | /api/v2/client-portal/invitations/:id | Get single invitation. |
| PUT | /api/v2/client-portal/invitations/:id | Update invitation (status, client_name, message). Accepting sets accepted_at/accepted_by. |
| DELETE | /api/v2/client-portal/invitations/:id | Soft delete + revoke: sets deleted_at and status=revoked. |
| GET | /api/v2/client-portal/approvals | List approvals filtered by job_id/status/approval_type/client_user_id/q. Paginated. Searches title and description. |
| POST | /api/v2/client-portal/approvals | Create approval request. Requires job_id, client_user_id, approval_type, reference_id, title. Sets requested_by from auth. Returns 201. |
| GET | /api/v2/client-portal/approvals/:id | Get single approval. |
| PUT | /api/v2/client-portal/approvals/:id | Approve/reject. Only pending approvals can change status (409 otherwise). Sets responded_at on approve/reject. Accepts signature_data/ip/hash. |
| GET | /api/v2/client-portal/messages | List messages filtered by job_id/category/status/sender_type/q. Paginated. Searches subject and message_text. |
| POST | /api/v2/client-portal/messages | Create message. Requires job_id, sender_type, message_text. Supports external logging (is_external_log + external_channel). Returns 201. |
| GET | /api/v2/client-portal/messages/:id | Get single message. |
| PUT | /api/v2/client-portal/messages/:id | Update message status (mark read/archived). Sets read_at when status=read. |
| GET | /api/v2/client-portal/payments | List payments filtered by job_id/status/payment_method/q. Paginated. Searches payment_number, description, reference_number. |
| POST | /api/v2/client-portal/payments | Record payment. Requires job_id, amount (>=0). Defaults: payment_method=check, status=pending. Returns 201. |
| GET | /api/v2/client-portal/payments/:id | Get single payment. |

### Type System (extends Module 12)
- 9 type unions: ApprovalStatus (4), ApprovalType (5), MessageStatus (3), MessageSenderType (2), MessageCategory (7), ExternalChannel (3), InvitationStatus (4), PaymentStatus (5), PaymentMethod (5)
- 5 interfaces: ClientPortalSettings, ClientPortalInvitation, ClientApproval, ClientMessage, ClientPayment
- 9 constant arrays: APPROVAL_STATUSES, APPROVAL_TYPES, MESSAGE_STATUSES, MESSAGE_SENDER_TYPES, MESSAGE_CATEGORIES, EXTERNAL_CHANNELS, INVITATION_STATUSES, PAYMENT_STATUSES, PAYMENT_METHODS

### Validation Schemas (Zod, extends Module 12)
- 9 enum schemas: approvalStatusEnum, approvalTypeEnum, messageStatusEnum, messageSenderTypeEnum, messageCategoryEnum, externalChannelEnum, invitationStatusEnum, paymentStatusEnum, paymentMethodEnum
- updateClientPortalSettingsSchema (all JSONB fields optional, custom_domain max 200, URLs validated)
- listClientInvitationsSchema (page/limit/job_id/status/q)
- createClientInvitationSchema (requires job_id, email; defaults: role=client, expires_in_days=7, max 90 days)
- updateClientInvitationSchema (status/client_name/message optional)
- listClientApprovalsSchema (page/limit/job_id/status/approval_type/client_user_id/q)
- createClientApprovalSchema (requires job_id, client_user_id, approval_type, reference_id, title; expires_at YYYY-MM-DD)
- updateClientApprovalSchema (status/comments/signature_data/signature_ip/signature_hash optional)
- listClientMessagesSchema (page/limit/job_id/category/status/sender_type/q)
- createClientMessageSchema (requires job_id, sender_type, message_text; defaults: category=general, is_external_log=false, attachments=[])
- updateClientMessageSchema (status/read_at optional)
- listClientPaymentsSchema (page/limit/job_id/status/payment_method/q)
- createClientPaymentSchema (requires job_id, amount>=0; defaults: payment_method=check, status=pending; payment_date YYYY-MM-DD)

---

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
