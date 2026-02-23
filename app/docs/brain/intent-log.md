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

## Entries

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
