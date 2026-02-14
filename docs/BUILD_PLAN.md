# RossOS — Autonomous Build Plan
**Generated:** 2026-02-13
**Starting State:** Phase 0B + Module 01 complete, committed, pushed

---

## Current Inventory

### What Exists in the Database
| Table | Migration | Status |
|-------|-----------|--------|
| companies | core_data_model | Deployed |
| users | core_data_model | Deployed |
| cost_codes | core_data_model | Deployed |
| vendors | core_data_model | Deployed |
| clients | core_data_model | Deployed |
| jobs | core_data_model | Deployed |
| job_assignments | core_data_model | Deployed |
| entity_change_log | core_data_model | Deployed |
| entity_snapshots | core_data_model | Deployed |
| roles | auth_module | Deployed |
| auth_audit_log | auth_module | Deployed |
| project_user_roles | auth_module | Deployed |

### What Exists in Code
- Auth system: login/logout/me endpoints, RBAC, permissions engine, AuthProvider
- API middleware: createApiHandler with auth, validation, rate limiting
- Validation: Zod schemas for auth, roles, users, common types
- Hooks: useAuth, usePermissions, useUsers, useRoles, useAuthAuditLog
- Tests: 113 passing (permissions, middleware, acceptance)
- CI/CD: GitHub Actions pipeline
- 67+ skeleton UI pages with mock data

### What Does NOT Exist
- No CRUD APIs for jobs, vendors, clients, cost_codes
- No React Query hooks connecting UI to real data
- No configuration engine tables or APIs
- No global search
- No notification system
- No document/file storage
- All skeleton pages still use mock data

---

## Phase 1 Remaining: Modules 02-06

### Module 02 — Configuration Engine
**Purpose:** Makes the platform configurable per tenant (workflows, cost codes, terminology, numbering, custom fields, feature flags)
**Depends on:** Module 01 (auth/tenant context)

#### 02-A: Configuration DB Migration
**Tables to create:**
- `tenant_configs` — central key/value config store (company + project level)
- `workflow_definitions` — configurable state machines per entity type
- `cost_code_mappings` — old→new code remapping
- `phase_templates` — builder-defined project phase structures
- `terminology_overrides` — tenant-specific display terms
- `numbering_patterns` — configurable document numbering
- `numbering_sequences` — atomic counters per entity type
- `custom_field_definitions` — EAV field definitions
- `custom_field_values` — EAV field values
- `field_requirements` — per-tenant required field overrides
- `feature_flags` — tenant-level feature toggles
- `config_versions` — configuration change history
- `config_templates` — industry starter templates (platform-level)
- `jurisdiction_configs` — jurisdiction-specific config (tax, lien law, etc.)
- `builder_jurisdiction_overrides` — tenant overrides for jurisdiction data
- `user_preferences` — user-level display/UX preferences
- All with RLS on `company_id`, soft delete, audit columns

#### 02-B: Config Resolution Engine
- `resolveConfig(key, { userId, projectId, companyId })` — 4-level hierarchy resolver
- Cache layer with 5-min TTL (invalidate on write)
- `useConfig()` React hook for client-side config access

#### 02-C: Feature Flags API + Hook
- `GET/PATCH /api/v1/features` — list/toggle feature flags
- `useFeatureFlags()` hook with `isEnabled(featureKey)` helper
- Plan-gated feature enforcement

#### 02-D: Terminology Engine
- `GET/PUT /api/v1/terminology` — CRUD terminology overrides
- `t(key)` translation function (server + client)
- ~50 default term keys seeded

#### 02-E: Numbering Engine
- `GET/PUT/POST /api/v1/numbering` — patterns + preview
- `generateNextNumber(entityType, context)` utility
- Atomic sequence management with `SELECT ... FOR UPDATE`

#### 02-F: Custom Fields API
- `GET/POST/PATCH/DELETE /api/v1/custom-fields/:entityType`
- Custom field renderer component
- Dynamic Zod schema extension for tenant field requirements

#### 02-G: Configuration UI + Hooks
- `useTerminology()`, `useNumbering()`, `useCustomFields()`, `useWorkflows()` hooks
- Settings pages connected to real APIs (replace skeleton settings pages)

#### 02-H: Tests
- Unit tests for config resolution, numbering engine, terminology
- Acceptance tests encoding spec requirements

---

### Module 03 — Core Data Model (Enhancement)
**Purpose:** The core tables already exist. This module adds missing patterns: optimistic locking, enhanced audit, data export/import, and CRUD APIs for all core entities.
**Depends on:** Module 01, Module 02

#### 03-A: Schema Enhancement Migration
- Add `version` (optimistic locking) column to: jobs, vendors, clients, cost_codes
- Add `created_by`, `updated_by`, `deleted_at`, `deleted_by` to tables missing them
- Add `import_batches` table for data import tracking
- Add `parent_project_id` to jobs (ADU/child project support)
- Partial indexes for common queries (e.g., `WHERE deleted_at IS NULL`)
- Trigram indexes for search (`pg_trgm` on name/display_name fields)

#### 03-B: Jobs CRUD API
- `GET /api/v1/jobs` — list with pagination, filtering by status/type/PM
- `POST /api/v1/jobs` — create with numbering engine
- `GET /api/v1/jobs/:id` — detail with financial summary
- `PATCH /api/v1/jobs/:id` — update with optimistic locking
- `DELETE /api/v1/jobs/:id` — soft delete
- `GET /api/v1/jobs/:id/assignments` — list team members
- `POST /api/v1/jobs/:id/assignments` — assign team member
- Zod schemas for all inputs

#### 03-C: Vendors CRUD API
- `GET /api/v1/vendors` — list with filtering by trade/status
- `POST /api/v1/vendors` — create
- `GET /api/v1/vendors/:id` — detail with compliance status
- `PATCH /api/v1/vendors/:id` — update
- `DELETE /api/v1/vendors/:id` — soft delete (deactivate)

#### 03-D: Clients CRUD API
- `GET /api/v1/clients` — list
- `POST /api/v1/clients` — create
- `GET /api/v1/clients/:id` — detail
- `PATCH /api/v1/clients/:id` — update
- `DELETE /api/v1/clients/:id` — soft delete

#### 03-E: Cost Codes CRUD API
- `GET /api/v1/cost-codes` — tree structure
- `POST /api/v1/cost-codes` — create
- `PATCH /api/v1/cost-codes/:id` — update
- `DELETE /api/v1/cost-codes/:id` — deactivate
- `POST /api/v1/cost-codes/import` — CSV import with dry-run

#### 03-F: Change History API
- `GET /api/v1/history/:entityType/:entityId` — get change log
- Automatic change logging trigger/utility for audited entities

#### 03-G: React Query Hooks
- `useJobs()`, `useJob(id)`, `useCreateJob()`, `useUpdateJob()`, `useDeleteJob()`
- `useVendors()`, `useVendor(id)`, `useCreateVendor()`, etc.
- `useClients()`, `useClient(id)`, `useCreateClient()`, etc.
- `useCostCodes()`, `useCreateCostCode()`, etc.
- Optimistic updates for mutations

#### 03-H: Connect Skeleton Pages to Real Data
- Replace mock data in authenticated jobs page with `useJobs()`
- Wire jobs/new form to `useCreateJob()`
- Connect dashboard stats to real counts
- Wire up the 3-4 highest-traffic skeleton pages (vendors list, clients list, cost codes)

#### 03-I: Tests
- Unit tests for optimistic locking, change log utility
- Acceptance tests for CRUD operations
- Integration tests for RLS enforcement

---

### Module 04 — Navigation, Search & Dashboard
**Purpose:** Global search (Cmd+K), dashboard widgets, breadcrumbs, project switcher
**Depends on:** Module 03 (data to search/display)

#### 04-A: Search Infrastructure
- `search_index` materialized view with tsvector columns
- Database triggers to populate search_index on entity CRUD
- GIN indexes on search content
- `GET /api/v1/search?q=` — unified search endpoint with entity type grouping

#### 04-B: Command Palette (Cmd+K)
- `CommandPalette` component with keyboard shortcut listener
- Typeahead search (debounced 250ms, min 2 chars)
- Quick actions: "Create Job", "Create Invoice", "Go to Settings"
- Recent items section
- Results grouped by entity type

#### 04-C: Dashboard Widget Framework
- Widget registry pattern (modules register widgets)
- Responsive CSS Grid layout (1x1, 2x1, 2x2 cells)
- `user_dashboard_config` column in user_preferences
- Role-based default widget sets
- Add/remove/reorder via "Customize Dashboard" panel

#### 04-D: Dashboard Widgets (V1)
- Project Status Overview (active/preconstruction/warranty counts)
- My Active Projects (PM-specific)
- Approval Queue (pending approvals count)
- Recent Activity Feed (latest entity_change_log entries)
- Financial Summary (aggregate budget vs actual across jobs)

#### 04-E: Breadcrumbs + Project Switcher
- `Breadcrumbs` component derived from route hierarchy
- Project context selector in top nav
- Recently accessed projects (stored in user_preferences)

#### 04-F: Tests
- Search relevance tests
- Widget rendering tests
- Keyboard shortcut tests

---

### Module 05 — Notification Engine
**Purpose:** Centralized event→notification routing across all channels
**Depends on:** Module 01 (auth), Module 02 (config for per-tenant rules)

#### 05-A: Notification DB Migration
- `notification_event_types` — registered event type definitions
- `builder_notification_config` — per-tenant event type overrides
- `notification_templates` — default + builder-customized templates
- `notifications` — notification instances
- `notification_deliveries` — per-channel delivery tracking
- `user_notification_preferences` — per-user channel preferences

#### 05-B: Notification Service Core
- `notificationService.emit(eventType, payload, context)` — event emission
- Recipient resolution (builder config → role mapping → project membership)
- Channel routing (in-app, email, SMS)
- Template rendering with Handlebars substitution

#### 05-C: In-App Notifications
- `GET /api/v1/notifications` — list with read/unread filter
- `PATCH /api/v1/notifications/:id` — mark read
- `POST /api/v1/notifications/read-all` — mark all read
- NotificationBell component in TopNav
- SSE or polling for real-time delivery
- `useNotifications()` hook

#### 05-D: Email Channel
- SendGrid/Resend adapter
- HTML email templates with builder branding
- Plain-text fallback
- Bounce/delivery webhook handler

#### 05-E: User Notification Preferences
- `GET/PUT /api/v1/notification-preferences` — per-category channel toggles
- Quiet hours support
- Digest mode toggle

#### 05-F: Notification Storm Protection
- Bulk operation detection (>10 events/60s window = batch)
- Per-event-type throttling
- Digest collapsing

#### 05-G: Tests
- Notification routing tests
- Template rendering tests
- Storm protection tests

---

### Module 06 — Document Storage
**Purpose:** File upload, folders, versioning, search, expiration tracking
**Depends on:** Module 01, Module 02, Module 05 (notifications for expiration alerts)

#### 06-A: Document DB Migration
- `documents` — file metadata, version tracking
- `document_folders` — hierarchical folder structure
- `document_versions` — version history per document
- `document_tags` — tagging system
- `document_distributions` — controlled distribution tracking
- `document_search_content` — extracted text for full-text search
- Supabase Storage bucket configuration

#### 06-B: Upload + Storage API
- `POST /api/v1/documents/upload` — multipart upload to Supabase Storage
- `GET /api/v1/documents/:id/download` — signed URL generation
- `DELETE /api/v1/documents/:id` — soft delete
- Thumbnail generation (async)
- Storage quota tracking per tenant

#### 06-C: Folder Management API
- `GET /api/v1/documents/folders` — folder tree
- `POST /api/v1/documents/folders` — create folder
- `PATCH /api/v1/documents/folders/:id` — rename/move
- Folder templates auto-created on new project

#### 06-D: Version Control
- Upload new version → creates version entry, keeps previous
- `GET /api/v1/documents/:id/versions` — version history
- Side-by-side comparison view (V1: images/PDFs only)

#### 06-E: Expiration Tracking
- `GET /api/v1/documents/expiring` — documents expiring within window
- Alert system (90/60/30/14 days + expired)
- Dashboard widget: "Expiring Documents"
- Integrates with notification engine for alerts

#### 06-F: Document Hooks + UI
- `useDocuments(projectId)`, `useUploadDocument()`, `useDocumentVersions()`
- Document browser component (tree view + grid view)
- Upload dropzone component
- Connect to skeleton document pages

#### 06-G: Tests
- Upload/download flow tests
- Folder management tests
- Expiration tracking tests

---

## Execution Order & Dependencies

```
Module 01 (DONE)
    │
    ├── Module 02 (Config Engine)
    │       │
    │       ├── Module 03 (Core Data CRUD + Enhancement)
    │       │       │
    │       │       ├── Module 04 (Search + Dashboard)
    │       │       │
    │       │       └── Module 06 (Document Storage)
    │       │
    │       └── Module 05 (Notifications)
    │
    └───────────────────────────────────────────┘
```

**Recommended build order:**
1. **Module 02** (Config Engine) — every module reads from it
2. **Module 03** (Core Data CRUD) — gives us real data to work with
3. **Module 05** (Notifications) — cross-cutting, other modules emit events
4. **Module 04** (Search + Dashboard) — needs data + notifications wired
5. **Module 06** (Documents) — needs notifications for expiration alerts

---

## Per-Module Estimated Task Breakdown

| Module | Sub-tasks | New Tables | New API Routes | New Hooks | New Tests |
|--------|-----------|------------|----------------|-----------|-----------|
| 02 Config | 8 | 16 | ~25 | 6 | ~40 |
| 03 Core Data | 9 | 1 (import_batches) + alterations | ~20 | 15+ | ~50 |
| 04 Nav/Search | 6 | 1 (search_index view) | ~5 | 4 | ~25 |
| 05 Notifications | 7 | 6 | ~8 | 3 | ~30 |
| 06 Documents | 7 | 6 | ~12 | 4 | ~25 |
| **Total** | **37** | **30+** | **~70** | **32+** | **~170** |

---

## Phase 2+ Overview (Modules 07-50)

After Phase 1 Foundation is complete, the platform has:
- Full auth + RBAC
- Configurable workflows, terminology, numbering, custom fields
- CRUD for all core entities (jobs, vendors, clients, cost codes)
- Global search + dashboard
- Notification engine
- Document storage

Phase 2 (Construction Core) builds on this foundation:
- **Module 07:** Scheduling & Calendar (Gantt, dependencies, weather)
- **Module 08:** Daily Logs (voice-to-text, crew tracking)
- **Module 09:** Budget & Cost Tracking (budget lines, cost codes, variance)
- **Module 10:** Vendor Management (directory, insurance, compliance)
- **Module 11:** Basic Invoicing (processing, approval workflow)
- **Module 12:** Basic Client Portal (client login, project visibility)

Phases 3-6 add financial power, AI intelligence, full platform, and scale features.

---

## Validation Protocol

After each module:
```bash
cd app
npx tsc --noEmit           # Zero type errors
npx vitest run             # All tests pass
npx eslint src/            # No lint errors in new code
```

After each module commit, push to remote.
