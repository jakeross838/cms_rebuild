# Intent Log — Why We Built Each Feature
<!-- This tracks the REASONING behind every feature, pulled from conversations -->
<!-- The brain-tracker reads this to understand multi-layered logic and business rules -->
<!-- Newest entries at top -->

## How to Read This

Each entry captures:
- **Why** — The business problem this solves
- **What** — What we built to solve it
- **How** — The technical flow from user action to result
- **Rules** — Business rules and edge cases discussed
- **Connected to** — Other features this depends on or enhances

---

## Module 06 — Document Storage (2026-02-23)

- **Why** — Module 06 spec requires shared infrastructure for all file/document operations. Construction projects generate enormous volumes of documents — plans, specs, contracts, invoices, COIs, permits, photos. The system needs upload, organized storage, versioning, tagging, access control, and expiration tracking. This is a Phase 1 Foundation module that nearly every downstream module depends on.
- **What** — 9 DB tables (migration applied to Supabase), document types + constants file, Zod validation schemas (10 schemas), storage utility lib (validate, path build, MIME categorize, format), 8 API routes (document CRUD + download + versions + folder CRUD), 40 acceptance tests. V1 foundation scope — defers AI classification, OCR, e-signatures, redaction, email ingestion to later phases.
- **How** — Files uploaded via client → POST metadata to `/api/v2/documents` → record created with storage path `{company}/{job}/{uuid}_{filename}` → initial version created → tags attached. Download via signed URL (1hr expiry) from Supabase Storage. Folders use materialized path pattern for hierarchy. Versions auto-increment. Soft delete only (status='archived'). Blocked extensions prevent malicious uploads.
- **Rules** — (1) Multi-tenant: all queries filter by company_id, RLS on all tables. (2) Soft delete only. (3) Blocked extensions: exe, bat, sh, cmd, ps1, msi, dll, etc. (4) Max file size 500MB. (5) Max 20 simultaneous uploads. (6) Folder deletion blocked if has children or active documents. (7) Document types: 14 categories from invoice through other. (8) Signed URLs expire in 1 hour. (9) Quarantined/deleted documents blocked from download.
- **Connected to** — Module 01 (auth required for all endpoints), Module 03 (job_id references), Module 05 (expiration alerts via notification engine), Module 04 (document search integration future), all future modules (document attachment)

---

## Module 05 — Notification Engine (2026-02-23)

- **Why** — Module 05 spec requires a real-time notification system for construction operations. Users need to be notified about financial events, schedule changes, document uploads, field operations, approvals, and system events. The TopNav had a static bell icon placeholder with no functionality.
- **What** — 6 DB tables (migration applied to Supabase), 16 seed event types, notification types in database.ts, Zod validation schemas, notification service lib, 8 API routes (list, emit, unread-count, read-all, mark-read, archive, settings, preferences), NotificationBell dropdown component, useNotifications React Query hook, 27 acceptance tests. Wired bell into TopNav.
- **How** — Other modules call `emitNotification()` with recipients → creates notification rows + in-app delivery records → bell polls `/api/v2/notifications/unread-count` every 30s → badge shows count → click opens dropdown → fetches paginated list → click notification marks read + navigates. Quiet hours, digest mode, and per-category/channel preferences configurable via settings/preferences APIs.
- **Rules** — (1) Multi-tenant: all queries filter by company_id + user_id. (2) Soft delete only: archive flag, never hard delete. (3) Idempotency key prevents duplicate notifications within same minute window. (4) 6 categories × 4 channels = 24 possible preference combos per user. (5) Critical notifications can bypass quiet hours. (6) Bell badge caps at "99+". (7) Urgency levels: low/normal/high/critical with color-coded dots.
- **Connected to** — Module 01 (auth required), Module 03 (entity references via entity_type/entity_id), TopNav (bell mounted in header), all future modules (emit notifications for their events)

---

## Module 04 — Cmd+K Global Search / Command Palette (2026-02-23)

- **Why** — Module 04 spec requires a keyboard-activated search overlay for fast navigation. Navigation config and dashboard were already done, but the Cmd+K command palette (the main UX differentiator for power users) was missing. The TopNav had a non-functional placeholder `<Input>` for search.
- **What** — 11 new files + 2 modified files. Types, Zod schema, search API endpoint, recent-searches localStorage utility, quick-actions nav-derived utility, 2 React hooks (useSearch, useCommandPalette), 3 command palette components (search-result-item, quick-actions, command-palette), TopNav modification, 21 acceptance tests. Added `cmdk` package (~4KB).
- **How** — Cmd+K or search button click opens Radix Dialog wrapping `cmdk`'s `<Command>` component. Query debounced 250ms, hits `/api/v2/search` which queries jobs/clients/vendors/invoices in parallel with `.ilike()` + `.or()` (same pattern as existing CRUD APIs). Results grouped by entity type. Quick actions derived from all 4 nav config exports. Recent searches stored in localStorage (max 10, deduped). On select: `router.push()` + close + save to recents.
- **Rules** — (1) `shouldFilter={false}` on Command: server-side filtering for entity results, client-side keyword matching for quick actions. (2) Query must be 2-200 chars. (3) Default limit 5 results per entity, max 20. (4) All queries filter by `company_id` (multi-tenant). (5) CommandPalette renders inside TopNav (client component) — no server component boundary issues.
- **Connected to** — Module 01 (auth required for search API), Module 03 (searches across jobs, clients, vendors tables), Nav config (quick actions derived from all nav sections)

---

## Module 02 — Settings UI Pages (2026-02-23)

- **Why** — Module 02 backend (5 API routes, config engine lib, DB tables) was complete but had NO settings UI. Users need to configure company settings, toggle features, customize terminology, set numbering patterns, and manage project phases from the UI.
- **What** — 8 files: SettingsSidebar + layout wrapper + 5 settings pages (general, features, terminology, numbering, phases) + 30 acceptance tests. No new API routes needed.
- **How** — Settings layout wraps all `/settings/*` pages with a sidebar. Each page fetches from existing API routes, provides per-section forms with dirty tracking, and PATCHes changes. Phases page has full CRUD with modal. Feature flags have plan gating and batch save.
- **Rules** — (1) Feature flags: toggle disabled if company plan < required plan. (2) Terminology: override-only — leave empty to use default. (3) Numbering: one entity editable at a time, pattern validated server-side. (4) Phases: system phases locked (no rename/delete), soft delete only.
- **Connected to** — Module 01 (auth/RBAC gates settings access), Module 03+ (all downstream modules consume config values from these settings)

---

## Entries

### 2026-02-23 — Module 03: Core Data Model CRUD APIs
- **Why** — Every Phase 2+ module depends on CRUD endpoints for jobs, clients, vendors, and cost codes. Without them, all pages are stuck on mock data. TypeScript types were out of sync with DB migration columns, causing type errors when connecting real data.
- **What** — Built 8 API route files (4 entity pairs of list+create and get+patch+delete), 4 Zod validation schema files, fixed database.ts types to match actual migration columns, updated test factory for Job type.
- **How** — Followed exact pattern from users CRUD routes. Each endpoint uses `createApiHandler` with auth, rate limiting, Zod validation, and audit logging. Queries scoped to `company_id` via `ctx.companyId`. Soft delete via `deleted_at` timestamp (RLS policies already filter `deleted_at IS NULL`).
- **Rules** — Jobs POST requires owner/admin/pm; PATCH adds superintendent. Clients/vendors POST/PATCH open to any auth user; DELETE restricted. Cost codes locked to owner/admin only. All deletes are soft deletes. No hard deletes.
- **Connected to** — Module 01 (auth/RBAC), Module 02 (config), all Phase 2 modules (scheduling, budgets, vendor management)

### 2026-02-23 — Blueprint (3) Expansion: 8 New Skeleton Pages + 120 Features

**Why:** The user provided `rossos-production-blueprint (3).md` — a 2,302-line document with 600+ features across 12 parts covering AI Accuracy Engine, gap analysis modules, deep self-learning metrics, and more. Many features overlapped with existing pages (Trade Intuition, Plan Analysis, Bidding, Selections, etc.), but 8 major new areas needed dedicated skeleton pages.

**What we built:**
- 8 new skeleton pages with Preview/Spec tabs
- 8 new preview components with full mock data visualizations
- 120 new features in `features.ts` (IDs 348-467, total now 467 across 33 categories)
- Navigation updated with 7 new nav items across 6 sections
- New pages: AI Accuracy Engine, Pre-Construction, Contract & Legal, Business Management, HR & Workforce, Post-Build Lifecycle, Lien Law Compliance, Job Close Accounting

**How it works:**
1. AI Accuracy Engine (`/intelligence/accuracy-engine`) — 6 validation systems, live demo of $37K fireplace error catch, confidence flags, feedback loop
2. Pre-Construction (`/pre-construction`) — Lot feasibility, permits, design review, engineering tracking, pre-con checklist
3. Contract & Legal (`/contracts/legal`) — Template library, AI builder, redline comparison, subcontract generator, lien law dashboard
4. Business Management (`/financial/business-management`) — Company P&L, overhead calculator, break-even, capacity planner, cash flow forecast
5. HR & Workforce (`/directory/hr`) — Org chart, hiring pipeline, certification tracker, performance reviews, workload balancer
6. Post-Build (`/post-build`) — Walkthroughs, seasonal maintenance, referral program, lifetime value, knowledge base
7. Lien Law (`/compliance/lien-law`) — State-specific calendars, NTO generator, waiver automation, retainage tracking, risk dashboard
8. Job Close (`/financial/job-close`) — Close checklist, cost reconciliation, POC accounting, warranty reserve, CPA export

**Business rules discussed:**
- AI Accuracy Engine has 6 validation layers that run on every data entry
- 5 confidence flag levels (Safety Block → Informational) with override learning
- Pre-construction covers everything from contract signing to ground breaking
- Lien law rules are state-specific (FL 45-day NTO, 90-day claim, 10%→5% retainage)
- Job close requires all 8 financial items complete before archiving
- Post-build lifecycle tracks client relationships for years after completion

**Connected to:**
- Feature Registry — all 120 new features visible at Settings > Features
- Navigation — 7 new links across Sales, Pre-Con, Financial, Closeout, Intelligence, Directory, Settings
- All existing intelligence pages — Accuracy Engine validates data flowing to all modules
- Blueprint documents (3) — source specification for all features

---

### 2026-02-23 — Initial Brain Scan / Project Genesis

**Why we built this:**
Ross Built Custom Homes (Anna Maria Island, FL) needed to replace Buildertrend and consolidate all construction management into a single platform. Existing tools were fragmented, lacked the depth needed for luxury coastal construction ($1.5M-$5M+ projects), and could not be customized to match the company's workflows. The decision was made to build RossOS as a multi-tenant SaaS platform capable of serving 10,000+ companies and 1,000,000+ users, turning an internal tool into a product.

**What the user said:**
"This CMS (called RossOS) replaces Buildertrend and consolidates all construction management." The platform must handle the full lifecycle of luxury coastal construction projects — from lead capture and estimating through scheduling, budgeting, daily logs, client communication, vendor management, accounting, warranty, and beyond.

**What we built:**
A comprehensive skeleton UI with 67+ page prototypes covering the planned 52 modules across 6 build phases. The technical foundation includes:
- Next.js 16 (App Router) + Supabase + Tailwind CSS v4 + TypeScript
- Supabase auth wired with SSR client, server client, and middleware
- API middleware framework with rate limiting, auth, RBAC, and audit logging
- Infrastructure scaffolding for cache, monitoring, queue, and rate limiting
- TanStack React Query provider for data fetching
- Error boundaries at the app level
- Core database tables: companies, users, cost_codes, vendors, clients, jobs, job_assignments, audit

**How it works:**
1. Skeleton pages render with mock data to validate UI/UX decisions before real implementation
2. Supabase handles authentication (login/signup flows are functional)
3. Multi-tenant architecture is designed into every layer — all tenant tables require company_id with RLS policies
4. The build follows a strict 6-phase plan, each phase depending on the previous
5. Every feature follows a spec-driven workflow: read spec, write acceptance tests, build, validate

**Business rules discussed:**
- Multi-tenancy is mandatory — every table has company_id, every query filters by company_id, RLS on all tenant tables
- 7 canonical roles: owner > admin > pm > superintendent > office > field > read_only
- Permissions modes: open (v1 default) -> standard -> strict
- Soft delete only — nothing is permanently deleted, all deletes are archive operations with restore capability
- All external data passes through a unified AI processing layer for extraction and normalization
- User-controlled taxonomy — categories, labels, and sort order are always user-defined, never hardcoded
- Full CRUD on every list view (create, read, update, delete, sort, search, bulk actions)
- Data normalization through three-tier matching: exact cache -> fuzzy match -> AI classify

**Edge cases mentioned:**
- Platform must handle 10,000+ companies simultaneously with proper data isolation
- Coastal construction has weather/tide dependencies affecting scheduling
- Projects at this price point ($1.5M-$5M+) require detailed change order and draw request workflows
- Client portal must expose enough information for transparency without overwhelming non-technical homeowners

**Connected to:**
- All 52 modules are interconnected; Phase 1 Foundation (Auth, Config, Core Data, Nav/Search, Notifications, Documents) must be built first
- Supabase is the backbone for auth, database, storage, and real-time features
- The skeleton UI prototypes serve as the design spec for real implementation
- docs/modules/ contains detailed specs for each of the 52 modules
- docs/architecture/ contains 16 system-level architecture documents

**Testing notes:**
- TypeScript compiles clean (tsc --noEmit passes with zero errors)
- No real CRUD endpoints exist yet — all pages use mock data
- Phase 1 implementation is next: start with Module 01 (Auth & Access Control)
- Validation cycle required before every commit: types, acceptance tests, unit tests, integration tests

---

### 2026-02-23 — Feature Registry Skeleton Page

**Why:** The user has a comprehensive list of 205 features across 10 categories that RossOS will offer. They wanted to see WHERE these features would live in the actual software — a visual registry page showing every capability, what it does, and toggles for enabling/disabling. The user explicitly said: "I don't want to actually build anything out yet, I just wanna see where the features would go within the website but have it into the website saying what it does but don't build code behind it yet, I'm gonna execute on all of it later." This is a common pattern in the project — build the skeleton UI first, wire it up later.

**What we built:**
- Feature config file (`src/config/features.ts`) with all 205 features, types, status/effort configs, and onboarding steps
- Feature Registry preview component (`src/components/skeleton/previews/feature-registry-preview.tsx`) with search, filters, category toggles, onboarding walkthrough, stats, and AI panels
- Skeleton page at `/skeleton/company/features` following standard Preview/Spec tab pattern
- Navigation link under Settings > Features in `companyRightNav`

**How it works:**
1. User navigates to Settings > Features in the nav bar
2. Sees 205 features organized into 10 categories with toggle switches
3. Can search by name, description, or category
4. Can filter by status (Ready/Planned/Future) or self-learning AI only
5. Each category has Enable All / Disable All buttons
6. Smart Onboarding walkthrough section shows the 6-step AI-powered setup flow
7. Stats cards show total features, enabled count, self-learning count, ready/planned/future counts
8. AI insights bar and AI Features Panel at bottom

**Connected to:**
- Module 02 (Configuration Engine) — feature flags are part of company configuration
- Module 43 (Subscription Billing) — feature tiers will be tied to subscription plans
- Module 01 (Auth & Access Control) — feature access will be gated by role
- All 52 modules — each module's features appear in this registry

**Business rules discussed:**
- All 205 features should be visible even if not yet built — status badges show readiness
- Self-learning AI features are tagged with a purple badge
- Features default to enabled for "ready" status features
- Categories are collapsible for easy browsing
- This is skeleton only — no real database writes, no API, no feature flag enforcement

---

### 2026-02-23 — Construction Intelligence Skeleton Pages (8 pages)

**Why:** The user provided 3 blueprint files (rossos-production-blueprint.md) containing 480+ production and construction intelligence features organized into: Trade Intuition AI (80 knowledge domains + 7-Layer Thinking Engine), Plan Analysis & Takeoffs, Bidding & Estimating, Selections Experience, Production & Quality, Procurement & Supply Chain, Smart Reports, and Cross-Cutting AI. The user said: "start work on these features and make these features have their own spot in the ui too" — meaning each major section should have its own dedicated skeleton page in the UI, following the same visual prototype pattern as all other 67+ skeleton pages.

**What we built:**
- 8 new skeleton pages under `/skeleton/intelligence/*` with Preview/Spec tabs
- 8 new preview components in `src/components/skeleton/previews/`
- New `companyIntelligenceNav` navigation section with Brain icon and 8 sub-links
- Expanded features.ts from 205 to 347 features with 8 new categories from the blueprint
- Trade Intuition preview includes full 7-Layer Thinking Engine live demo, 80 knowledge domains across 8 categories, confidence/override system, and cross-module intelligence examples
- AI Hub preview includes morning briefings, project health scores, "What If" scenario engine, risk register

**How it works:**
1. User clicks Intelligence in the nav bar dropdown
2. Sees 8 sub-pages: Trade Intuition AI, Plan Analysis, Bidding, Selections, Production, Procurement, Smart Reports, AI Hub
3. Each page has Preview tab (visual mock) and Specification tab (PageSpec with workflow, features, connections, AI features)
4. Trade Intuition is the foundational engine — it powers all other intelligence pages
5. All 142 new features also appear in the Feature Registry at Settings > Features

**Connected to:**
- Feature Registry (`/skeleton/company/features`) — all 142 new features visible there
- All existing skeleton pages — Trade Intuition AI is described as enhancing every module
- Navigation system — new `companyIntelligenceNav` array exported alongside existing nav arrays
- Module specs in docs/modules/ and docs/architecture/ai-engine-design.md

**Business rules discussed:**
- Trade Intuition AI has 80 knowledge domains across 8 categories (10 domains each)
- 7-Layer Thinking Engine validates every AI decision: Prerequisites → Material Validation → Trade Conflict Scan → Downstream Impact → Cost & Budget → Quality & Warranty → Client Communication
- 5 confidence flag levels: Safety Block (red, cannot override), Strong Recommendation (orange, requires documented reason), Suggestion (yellow, one-click dismiss), Learning Nudge (blue, based on history), Informational (white, hover context)
- The system learns from overrides — when you dismiss a suggestion, it records the context and adjusts
- All skeleton only — no real backend, mock data throughout

---

### 2026-02-23 — Feature Flag Wiring Requirements (Future: Module 02)

**Why:** The user asked whether enabling features in the Feature Registry would make them show/hide in the frontend UI. Answer: not yet — toggles are mock only. When Module 02 (Configuration Engine) is built, the Feature Registry must be wired up so toggles actually control what appears in the UI.

**What needs to be built (Module 02 scope):**

1. **Persistent Feature Flag Store**
   - Save enabled/disabled state per company (start with localStorage, migrate to Supabase `company_feature_flags` table)
   - Schema: `company_id, feature_id, enabled (boolean), enabled_at, enabled_by`
   - Default state: all "ready" features enabled, "planned"/"future" disabled
   - Must survive page refresh and work across tabs

2. **`useFeatureFlag()` Hook**
   - `useFeatureFlag('ai-morning-briefing')` → returns `{ enabled: boolean, toggle: () => void }`
   - Reads from the persistent store
   - Used by any component that needs to check if a feature is on/off
   - Memoized, doesn't re-render unless the specific flag changes

3. **`<FeatureGate>` Wrapper Component**
   - `<FeatureGate flag="ai-morning-briefing" fallback={<UpgradeBanner />}>` wraps any feature UI
   - Renders children only if the feature is enabled
   - Optional fallback for disabled state (e.g., "Enable this in Settings > Features")
   - Used on dashboard widgets, page sections, nav items, etc.

4. **Navigation Filtering**
   - `companyIntelligenceNav` items should only appear if their corresponding feature group is enabled
   - Settings > Features link always visible (can't hide the control panel)
   - Job-level nav items filtered by job-relevant feature flags
   - Nav config in `navigation.ts` needs a `featureFlag?: string` field on each NavItem/NavSubItem

5. **Module-Level Page Gating**
   - Each skeleton page wraps content in `<FeatureGate>`
   - Disabled pages show a "This feature is not enabled" state with a link to Settings > Features
   - Prevents direct URL access to disabled features

6. **Feature Registry Integration**
   - Toggle switches in Feature Registry write to the persistent store (not just React state)
   - "Enable All" / "Disable All" per category updates all flags in that category
   - Changes take effect immediately across the entire UI (no page refresh needed)
   - Stats cards reflect real enabled/disabled counts from the store

7. **Feature-to-Route Mapping**
   - Each feature in `features.ts` needs a `routes?: string[]` field mapping to affected pages
   - Each feature needs a `navItems?: string[]` field mapping to nav items it controls
   - This creates the link between "toggle feature X" and "hide/show these UI elements"

**What the user said:**
"just note what needs to be done, so when we do execute on it, it remembers to do all this to make sure the buttons work. I wanna keep it as a skeleton, no actual working buttons."

**Connected to:**
- Module 02 (Configuration Engine) — this IS the feature flag system
- Feature Registry page (`/skeleton/company/features`) — the control panel
- Navigation system (`src/config/navigation.ts`) — filtered by flags
- All 75+ skeleton pages — each gated by their feature flag
- Module 43 (Subscription Billing) — feature tiers will restrict which features can be enabled based on plan

**Testing requirements when built:**
- Toggle feature off → disappears from nav and page renders "not enabled" state
- Toggle feature on → reappears in nav and page renders normally
- Refresh page → toggle state persists
- "Enable All" on a category → all features in that category appear in UI
- Direct URL to disabled feature → shows disabled state, not a 404
- Stats in Feature Registry → accurate count from persistent store

---

### 2026-02-23 — Communication Hub & Learning Metrics Skeleton Pages

**Why:** The user wanted visual skeleton prototypes for both the Universal Communication Hub and the Expanded Self-Learning Engine before the execution phase. "I want this setup properly for the execution phase making all features work together." The user specifically wanted to SEE all 67 tracked metrics in the UI so they could verify coverage.

**What we built:**
- 2 new skeleton pages under `/skeleton/intelligence/*` with Preview/Spec tabs
- 2 new preview components in `src/components/skeleton/previews/`
- 2 new nav items in `companyIntelligenceNav` (total now 10 sub-links)
- Communication Hub preview: 6 connected channels, universal inbox with 6 mock messages from different platforms, AI extraction pipeline demo, two-way sync visualization, on-site recording flow, and channel setup guide
- Learning Metrics preview: All 67 metrics displayed (45 trade in 5 collapsible categories + 12 material + 10 job aggregate), AI maturity progression, 4 training sources, cross-module learning flow, and live learning example

**Connected to:**
- Architecture doc: `docs/architecture/universal-comms-and-learning.md`
- Navigation: `companyIntelligenceNav` in `src/config/navigation.ts`
- All other intelligence pages — Communication Hub feeds data to all AI modules
- Feature Registry — features appear in Settings > Features

---

### 2026-02-23 — Universal Communication Hub & Expanded Self-Learning Engine

**Why:** The user asked how the AI knows when something goes wrong (estimate error, field issue) and how it self-learns. They also asked: can we merge ALL communication platforms (iPhone messages, Gmail, Outlook, on-site conversations) into a single universal system where AI reads everything and updates jobs automatically? Two-way sync so replies go back through the original channel.

**What was designed:**
Full architecture doc created at `docs/architecture/universal-comms-and-learning.md` covering:

1. **Universal Communication Hub** — Every message from any platform (email, SMS, calls, on-site recordings, WhatsApp, Slack, portal) flows into one inbox. AI processes each message: identifies job, classifies type, extracts decisions/action items/dates/money, proposes downstream updates. User confirms. Replies route back through original channel (Gmail reply stays in Gmail thread, SMS reply goes back as SMS).

2. **Expanded Self-Learning Engine** — 45+ metrics per trade instance (up from ~15). 10 financial, 8 schedule, 8 quality, 7 communication, 5 safety, 7 contextual tags. Plus 12 metrics per material. Plus 10 per-job aggregate metrics. All feed back into estimating, scheduling, bidding, and Trade Intuition AI.

3. **On-Site Conversation Recording** — Mobile app has "Record Conversation" button. Audio → Whisper transcription → AI extraction → downstream updates with one-tap confirmation. Game-changer for capturing field decisions.

4. **Two-Way Sync Architecture** — Gmail API, Microsoft Graph (Outlook), Twilio (SMS/Voice), WhatsApp Business API. Each channel has inbound capture + outbound routing. Recipients never know messages came from/through RossOS.

5. **Database Schema** — `universal_messages`, `message_downstream_updates`, `channel_connections`, `trade_performance_metrics` (45 columns), `material_performance` (20+ columns).

6. **Implementation Roadmap** — 5 phases: Foundation → Email → SMS/Voice → Full Hub → Community Learning.

**Key design principle from user:** "You don't force anyone onto a new platform. RossOS wraps AROUND their existing tools."

**Connected to:**
- Module 05 (Notification Engine) — foundation for communication
- Module 12/29 (Client Portal) — portal messaging channel
- Module 30 (Vendor Portal) — vendor messaging channel
- Module 22 (Vendor Performance) — expanded metrics feed scoring
- Module 20 (Estimating) — actual vs estimated learning
- Module 23 (Price Intelligence) — material metrics
- Module 25 (Schedule Intelligence) — duration learning
- Trade Intuition AI — master engine consuming all data
- All intelligence pages — benefit from richer data
