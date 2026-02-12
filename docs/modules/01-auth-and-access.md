# Module 1: Multi-Tenant Authentication & Access Control

**Phase:** 1 - Foundation
**Status:** TODO
**Last Updated:** 2026-02-12

---

## Decisions Log

Decisions made 2026-02-12 after competitive research (Buildertrend) and architecture review:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Canonical internal roles | 7 system roles: owner, admin, pm, superintendent, office, field, read-only | Covers full construction org chart. Superintendent/field split reflects real hierarchy. |
| Custom roles | Builders can create unlimited custom roles inheriting from any system role | Matches Buildertrend capability, but we add per-user overrides (their #1 pain point) |
| Default permissions mode | `open` — everyone sees everything | Small builders (1-5 people) don't want permissions blocking them on day 1 |
| External users (v1) | Vendor + Client only | Lender, architect, designer, inspector, agent deferred to Phase 2+ |
| Project-level role overrides | Table built, not enforced in v1 | Infrastructure ready for when builders hit 10+ active jobs |
| Job status access | Roles can be restricted by job phase (pre_construction, active, warranty, closed) | Adopted from Buildertrend — proven pattern in construction |
| Permission Wizard | Guided setup when adding users/vendors to a job | Adopted from Buildertrend — better UX than raw permissions grid |
| "Preview as" feature | Builder can see exactly what a client/vendor sees | Adopted from Buildertrend — essential for trust |
| Separate portals | Vendors and clients get scoped portal views, not the full app | Cleaner UX, prevents accidental data exposure |
| Vendor access flexibility | Builder-configurable per vendor (unlike Buildertrend's fixed lockdown) | Buildertrend's #2 pain point — trusted subs can't be elevated |
| Per-user permission overrides | Supported via project_user_roles | Buildertrend's #1 pain point — changing a role affects everyone |

### Competitive Advantages Over Buildertrend

1. **Per-user, per-project role overrides** — BT forces you to create a new role for one person's exception
2. **Configurable vendor access** — BT locks all subs to a fixed permission set; we let builders elevate trusted vendors
3. **`resource:action:scope` model** — more granular than BT's View/Add/Edit/Delete grid
4. **Open access mode** — small builders skip all permissions complexity until they need it
5. **Field-level permissions** — BT can't hide specific fields (e.g., budget line items visible but totals hidden)

### What We Adopted From Buildertrend

1. **Permission Wizard** — step-by-step guided setup when adding someone to a job
2. **Job status-based access** — roles restricted by job phase (Pre-Sale, Active, Warranty, Closed)
3. **"Preview as" button** — builder sees exactly what a client/vendor sees
4. **Separate portals** — subs and clients get scoped views, not the full app with hidden features
5. **Org Owner / Admin split** — billing/subscription access separated from feature access

### Deferred to Phase 2+

| Feature | Gap IDs | Reason |
|---------|---------|--------|
| Kiosk/shared device mode | GAP-216 | Complex auth flow, not needed for launch |
| SSO (Google, Azure AD, Okta) | GAP-221 | Enterprise feature, email/password sufficient for v1 |
| MFA enforcement | GAP-222 | Available via Supabase, but not enforced at tenant level yet |
| IP restrictions | GAP-220 | No small builder needs this |
| API key management | GAP-225 | Needed when integrations are built |
| Guest/link-based access | GAP-219 | Nice-to-have, not critical |
| Client delegation | GAP-233 | One level max when implemented; defer entirely for now |
| Lender portal | GAP-234 | Phase 2 external user type |
| Architect/engineer portal | GAP-229 | Phase 2 external user type |
| Designer access | GAP-230 | Phase 2 external user type |
| Inspector access | GAP-235 | Phase 2 external user type |
| Real estate agent access | GAP-231 | Phase 2 external user type |

---

## Overview

This module provides the complete authentication, authorization, and access control layer for the platform. Every request is scoped to a `company_id` (tenant), ensuring absolute data isolation. The module supports internal users (builder employees), external users (vendors, clients, designers, lenders), and platform administrators. It must handle everything from a one-person shop where the owner sees everything, to a 50-person operation with granular per-project, per-field permissions.

This is the first module that must be built because every other module depends on it for identity, tenant context, and permission checks.

---

## Gap Items Addressed

### Section 9: User & Access Management (GAP-211 through GAP-235)

| Gap ID | Description | Sub-topic |
|--------|-------------|-----------|
| GAP-211 | Custom roles beyond defaults (Assistant PM, Selection Coordinator, Warranty Manager) | Role Engine |
| GAP-212 | Permissions that differ by project (PM on Project A, read-only on Project B) | Project-Level Permissions |
| GAP-213 | Permission inheritance (PM inherits Field Super permissions?) | Role Hierarchy |
| GAP-214 | Builder who wants "everyone sees everything" — no restrictions, but available later | Permissive Default Mode |
| GAP-215 | Time-limited access (consultant gets 30 days, then auto-deactivated) | Access Expiry |
| GAP-216 | Shared login devices on job sites (iPad with pin-based user switching) | Kiosk/Shared Device Mode |
| GAP-217 | Audit log of who accessed what and when | Auth Audit Trail |
| GAP-218 | Immediately revoke fired employee access while preserving their data | Emergency Revocation |
| GAP-219 | Guest access for one-time document viewing (architect views RFI log) | Guest/Anonymous Access |
| GAP-220 | IP restrictions configurable per tenant | Network Security Policy |
| GAP-221 | SSO integration (Azure AD, Google Workspace, Okta) | SSO |
| GAP-222 | MFA enforcement at the tenant level | MFA Policy |
| GAP-223 | "Forgot password" flow in the field (no email access, muddy hands) | Field-Friendly Recovery |
| GAP-224 | Field-level permissions (see budget total but not line items) | Granular Data Permissions |
| GAP-225 | API key management for integration users (QuickBooks sync user) | API Authentication |
| GAP-226 | Vendor with ONE login across multiple builders | Cross-Tenant User Accounts |
| GAP-227 | Vendor employees with different access levels (office manager vs. foreman) | External User Roles |
| GAP-228 | Builder controls exactly what each vendor sees | Vendor Visibility Config |
| GAP-229 | Architect/engineer portal access (plans, RFIs, submittals — not financials) | Design Team Access |
| GAP-230 | Interior designer access (selections, maybe budget for their scope) | Designer Access |
| GAP-231 | Real estate agent access during final stages | Agent Access |
| GAP-232 | Client access differs during warranty vs. construction | Lifecycle-Based Access |
| GAP-233 | Clients invite their own representatives (attorney access) | Client Delegation |
| GAP-234 | Lender portal access (draw requests, lien waivers, progress photos) | Lender Access |
| GAP-235 | Inspector access (temporary, inspection-related documents) | Inspector Access |

### Section 6: Data Isolation & Privacy (GAP-155 through GAP-169)

| Gap ID | Description | Sub-topic |
|--------|-------------|-----------|
| GAP-155 | Ensure Builder A cannot see Builder B's data | Tenant Isolation |
| GAP-156 | Shared vendors see only their own pricing/performance per builder | Vendor Data Scoping |
| GAP-157 | Competitively sensitive data protection (pricing, markup, vendor relationships) | Sensitive Data Classification |
| GAP-158 | Employee moving between builders — no data carries over | User Tenant Boundary |
| GAP-159 | Vendors working for multiple builders — one login, separate data views | Cross-Tenant Vendor UX |
| GAP-160 | Data encryption at rest and in transit | Encryption |
| GAP-164 | Platform team role-based data access (employees cannot browse customer data) | Internal Access Controls |

### Section 35: Data Integrity (GAP-537)

| Gap ID | Description | Sub-topic |
|--------|-------------|-----------|
| GAP-537 | Prevent data leakage between tenants at the database level | RLS Enforcement |

### Section 1: SaaS Architecture (GAP-001, GAP-002, GAP-003)

| Gap ID | Description | Sub-topic |
|--------|-------------|-----------|
| GAP-001 | Shared tables with tenant_id filtering vs. separate databases | Multi-Tenant Strategy |
| GAP-002 | Single user belonging to multiple tenant accounts | Cross-Tenant Identity |
| GAP-003 | Tenant-level feature flags | Feature Gating |

### Section 41: Multi-Entity & Scaling (GAP-574 through GAP-580)

| Gap ID | Description | Sub-topic |
|--------|-------------|-----------|
| GAP-574 | Builder with multiple LLCs (separate entities, related data) | Multi-Entity Auth |
| GAP-575 | Builder with construction company AND real estate company | Cross-Entity Auth |
| GAP-576 | Builder with multiple offices (regional teams, different vendors) | Division-Level Auth |
| GAP-577 | Builder operating under different brand names (luxury + production) | Sub-Tenant Branding |
| GAP-578 | Mergers & acquisitions (merge data, migrate users) | M&A Auth Migration |
| GAP-579 | Franchise models (franchisor templates, franchisee independence) | Franchise Auth Model |
| GAP-580 | Builders transitioning from small to large (system grows with them) | Scalable Auth |

See `docs/architecture/multi-tenancy-design.md` Section 12 for full multi-entity architecture.
See `docs/architecture/configuration-engine.md` Section 11 for multi-entity configuration inheritance.

---

## Detailed Requirements

### 1. Multi-Tenant Authentication Flow

**Decision (GAP-001):** Shared tables with `builder_id` column + Row-Level Security (RLS) policies on every table. This is the most cost-effective approach and is already proven in the existing prototype.

- Every authenticated request carries a `builder_id` in the JWT claims
- Supabase RLS policies enforce `builder_id = auth.jwt()->>'builder_id'` on all tables
- No query can execute without a valid tenant context
- Platform admin requests use a separate service role key with explicit tenant override

**Login flow:**
1. User submits email + password (or SSO token)
2. System resolves which tenant(s) the user belongs to (GAP-002)
3. If multiple tenants, user selects which tenant to enter (tenant switcher)
4. JWT issued with `{ user_id, builder_id, role, permissions[] }`
5. Refresh token stored in httpOnly cookie; access token in memory (15-min expiry)
6. All subsequent requests include `Authorization: Bearer <access_token>`

**Session management:**
- Access tokens: 15-minute TTL, refreshed silently
- Refresh tokens: 7-day TTL (configurable per tenant), stored httpOnly/secure
- Device tracking: record device fingerprint, IP, user agent on each login
- Concurrent session limit: configurable per tenant (default: 5 devices)
- Session revocation: immediate via refresh token blocklist in Redis

#### Edge Cases & What-If Scenarios

1. **Tenant migration during M&A (mergers & acquisitions):** When a builder acquires another company or two companies merge, there is no mechanism to migrate tenants — reassigning projects, reconciling roles, merging vendor relationships, and combining historical data. Required behavior:
   - **Phase 2+ implementation** — full M&A migration is complex and not needed for v1, but the data model must not prevent it
   - **Schema requirement** — every tenant-scoped table uses `company_id` FK (already true). No cross-tenant foreign keys. No hardcoded tenant assumptions in application logic
   - **Future migration workflow (design now, build later):** Admin initiates "Merge Company B into Company A." System generates a migration preview: X projects, Y vendors, Z users will be affected. Vendor deduplication matches vendors by EIN/name across both tenants. User deduplication matches users by email across both tenants, prompts for role resolution. Project reassignment updates all Company B projects to Company A `company_id`. Historical data preserved with `migrated_from_company_id` metadata
   - **Prevent blockers now** — avoid storing tenant-specific config in non-tenant-scoped tables. Avoid any `company_id = 1` assumptions in seed data

2. **Builder operating multiple companies (e.g., luxury brand and production brand):** The current model supports a user being in multiple tenants via `user_tenant_memberships`, but the UX must be seamless. The tenant switcher (like Slack workspaces) must clearly show which company context is active, and cross-tenant data must never leak. Ensure no UI element displays data from an inactive tenant context.

3. **Subscription lapse — authentication and access behavior:** When a tenant's subscription lapses (payment failure exhausts dunning sequence, trial expires, or voluntary cancellation), the auth system must enforce the resulting access state. Required behavior:
   - **Grace period (7 days):** Full access continues but an in-app banner warns all users. Only the owner role can update billing.
   - **Read-only mode (day 8-90):** All authenticated users can log in and view data but cannot create, update, or delete any records. API write endpoints return `403 Forbidden` with a `subscription_lapsed` error code. Webhook deliveries are paused.
   - **Full lockout (day 91+):** Login redirects to a "Reactivate your account" page. Only the owner can log in to access billing, data export, and account deletion. All other users see "Your organization's account has been suspended."
   - **Data retention:** Data is preserved for 90 days after full lockout. After 180 total days of non-payment, data is scheduled for deletion per the data retention policy (Module 3 Section 9). Export must be available throughout.

4. **Sub-tenants for multi-division builders:** A builder operating multiple divisions (e.g., luxury custom, production homes, remodeling) that need separate data but shared reporting must be supported through the multi-tenant model. Required behavior:
   - **Phase 1:** Each division is a separate tenant. A user (e.g., the company owner) belongs to all division tenants via `user_tenant_memberships` and uses the tenant switcher. No cross-tenant reporting.
   - **Phase 2+:** Introduce a `parent_builder_id` column on the `builders` table to establish a parent-child tenant relationship. The parent tenant owner gains read-only access to child tenant dashboards via a consolidated "Multi-Division Dashboard." Cross-division reporting aggregates financials, vendor performance, and project counts without exposing individual project details between divisions. Users can be assigned different roles in different divisions.
   - **Schema requirement:** The `builders` table must reserve a nullable `parent_builder_id` FK from day 1 to avoid a migration later.

5. **Tenant provisioning workflow:** When a new customer signs up, the system must execute a deterministic provisioning sequence. Required behavior:
   - Step 1: Create `builders` record with `subscription_status: 'trial'`
   - Step 2: Create `user_tenant_memberships` record linking the signup user as `owner` role
   - Step 3: Apply the selected configuration template (Module 2 Section 12) — cost codes, phases, terminology, defaults, feature flags
   - Step 4: Seed system roles (7 canonical roles) into the `roles` table for this tenant
   - Step 5: Create default numbering patterns, workflow definitions, and field requirements
   - Step 6: Provisioning completes in under 5 seconds; user is redirected to the onboarding wizard (Module 41)
   - **Idempotency:** If provisioning fails mid-sequence, the system must be able to resume from the last completed step without creating duplicates. Each step is tracked in a `provisioning_steps` log.
   - **Monitoring:** Failed provisioning triggers a P1 alert to the platform ops team (Module 49).

### 2. Role Hierarchy & Permissions Engine

**Canonical system roles (GAP-213, GAP-214) — 7 roles, locked, cannot be deleted:**

```
Platform Admin (internal only — RossOS staff)
  |
Owner (org owner — billing, subscription, company deletion)
  |
Admin (full feature access — no billing/subscription)
  |
Project Manager (PM)
  |
Superintendent (field leadership — approves daily logs, manages field workers)
  |
Office (office staff — accounting, selections, scheduling)
  |
Field (field workers — daily logs, photos, time entries, assigned tasks)
  |
Read-Only (observer — view only, no create/edit/delete)
```

**Key distinction (adopted from Buildertrend June 2025 split):** Owner has billing/subscription access. Admin has full feature access but cannot manage billing. This prevents accidental subscription changes.

**Job status access per role:** Each role can be restricted to specific job phases. This controls which jobs appear in their views.

| Role | Pre-Construction | Active | Warranty | Closed |
|---|---|---|---|---|
| Owner | Y | Y | Y | Y |
| Admin | Y | Y | Y | Y |
| PM | Y | Y | Y | configurable |
| Superintendent | N | Y | Y | N |
| Office | Y | Y | Y | Y |
| Field | N | Y | N | N |
| Read-Only | configurable | configurable | configurable | configurable |

**Custom roles (GAP-211):** Builders can create unlimited custom roles. Each custom role:
- Has a name and description
- Inherits from a base system role (gets all its permissions)
- Can add specific permissions beyond the base role
- Can remove specific permissions from the base role
- Changes to a custom role affect all users assigned to it
- Examples: "Selection Coordinator" (inherits office + adds selections:approve:all), "Assistant PM" (inherits pm - removes budgets:approve:all), "Warranty Manager" (inherits office + adds warranty:*:all)

**Permission model (GAP-224):**
- Permissions are defined as `resource:action:scope` triples
- Resources: projects, budgets, invoices, change_orders, schedules, documents, contacts, selections, daily_logs, reports, settings, warranties, time_entries, photos
- Actions: create, read, update, delete, approve, export
- Scope: all, own, assigned, none
- Field-level overrides: specific fields can be hidden/read-only per role (e.g., budget line items hidden but total visible)

**Permissions matrix (system role defaults):**

| Permission | Owner | Admin | PM | Super | Office | Field | Read-Only |
|---|---|---|---|---|---|---|---|
| projects:read:all | Y | Y | Y | assigned | assigned | assigned | assigned |
| projects:create | Y | Y | Y | N | N | N | N |
| projects:delete | Y | Y | N | N | N | N | N |
| budgets:read:all | Y | Y | Y | N | Y | N | N |
| budgets:read:totals_only | Y | Y | Y | Y | Y | Y | Y |
| invoices:read:all | Y | Y | assigned | N | Y | N | N |
| invoices:approve:all | Y | Y | threshold | N | N | N | N |
| change_orders:create | Y | Y | Y | N | N | N | N |
| change_orders:approve | Y | Y | threshold | N | N | N | N |
| daily_logs:create | Y | Y | Y | Y | N | Y | N |
| daily_logs:read:all | Y | Y | Y | assigned | Y | own | N |
| photos:create | Y | Y | Y | Y | N | Y | N |
| schedules:update | Y | Y | Y | N | Y | N | N |
| selections:update | Y | Y | Y | N | Y | N | N |
| time_entries:create | Y | Y | Y | Y | N | Y | N |
| time_entries:read:all | Y | Y | assigned | assigned | Y | own | N |
| documents:read:all | Y | Y | Y | assigned | Y | assigned | assigned |
| reports:read:all | Y | Y | Y | N | Y | N | N |
| settings:update | Y | Y | N | N | N | N | N |
| billing:manage | Y | N | N | N | N | N | N |

**Project-level overrides (GAP-212):** A user's company-wide role can be overridden per project. User X is PM on Project A but read-only on Project B. Stored in a `project_user_roles` junction table. **v1: table exists but not enforced. Company-wide role applies everywhere.**

**"Open access" mode (GAP-214):** A tenant-level setting `permissions_mode: 'open' | 'standard' | 'strict'`.
- **open** (v1 default): All authenticated internal users see everything. No permission checks on features. Simplest mode for small builders.
- **standard**: Role-based permissions enforced as described in the matrix above. Builder flips this on when they're ready.
- **strict**: Standard + field-level overrides + approval chains enforced. For larger operations.

Permissions infrastructure is built from day 1 so switching from `open` to `standard` is a config toggle, not a code change.

**Permission resolution order:**
1. Check `permissions_mode` — if `open`, allow everything for internal users
2. Check project-level role override (`project_user_roles`) — most specific wins
3. Fall back to company-wide role (`user_tenant_memberships.role_id`)
4. Resolve custom role: start with inherited permissions, apply additions, apply removals
5. Check field-level overrides if in `strict` mode

**UI modes for role management:**
- **Simple mode**: Builder picks from the 7 system roles, assigns to users. Done.
- **Advanced mode**: Builder sees a permissions matrix (checkbox grid: View/Add/Edit/Delete per feature area), can create/name custom roles. Copies from existing role as a starting point.

#### Edge Cases & What-If Scenarios

1. **Mid-project role change:** When a user's role changes mid-project (e.g., promoted from Field to Superintendent, or a PM is reassigned), the system must: (a) update permissions immediately on the next request, (b) record the role change in the audit trail with timestamp and changed-by, (c) preserve all data the user created under their previous role, and (d) send a notification to the affected user explaining what changed. If project-level overrides exist (v2+), changing a company-wide role must not silently override project-specific assignments — the admin must be warned if conflicts exist.

2. **Permission mode transition (open to standard to strict):** Switching from `open` to `standard` or `strict` could break existing workflows if users suddenly lose access to data they previously could see. Required behavior:
   - **Impact preview** — before switching modes, show a summary: "12 users will lose access to financial data. 3 users will lose access to vendor contacts. 5 custom workflows will be affected."
   - **Dry-run mode** — run the new permission rules against current user activity for 7 days and generate a report of "would have been blocked" events before actually enforcing
   - **Gradual rollout** — option to enforce new mode for specific roles first (e.g., enforce `standard` for `field` and `read_only` first, then expand to all roles)
   - **Rollback** — within 14 days of mode change, admin can revert to previous mode. After 14 days, rollback requires `owner` approval
   - **Notification** — all affected users receive a notification explaining what changed and linking to a help article

3. **Workflow loop prevention in approval chains:** Approval workflows (COs, invoices, POs, draws) could create infinite loops if configured incorrectly — e.g., User A requires User B's approval, and User B's approval requires User A's approval. Required behavior:
   - **Cycle detection** — when saving an approval workflow configuration, run a directed graph cycle check. Reject configurations that create loops
   - **Max approval chain depth** — configurable limit (default: 5 levels). Workflows exceeding this depth are rejected with a warning
   - **Self-approval prevention** — a user cannot be both the submitter and sole approver of the same record (unless explicitly enabled by admin for single-person companies)
   - **Deadlock detection** — if an approval has been pending for longer than the SLA with no available approver (all approvers are on PTO, deactivated, or conflicted out), escalate to the next role up in the hierarchy
   - **Validation on user deactivation** — when deactivating a user, check if they are the sole approver in any active workflow. Block deactivation until a replacement approver is assigned

### 3. External User Access (GAP-226 through GAP-235)

**Cross-tenant identity (GAP-002, GAP-226):** A single email can be associated with accounts under multiple builders. The `platform_users` table lives at the platform level (not tenant-scoped). A `user_tenant_memberships` junction table maps users to tenants with roles. When a user with multiple memberships logs in, they see a tenant switcher (like Slack workspaces).

#### v1 External Users (Phase 1)

Only **Vendor** and **Client** external users are implemented in v1.

**Vendor Portal (v1):**
Unlike Buildertrend's fixed lockdown, vendor access is **builder-configurable per vendor**. When adding a vendor to a job, a **Permission Wizard** guides the builder through:

| Feature | Default | Builder Can Toggle |
|---|---|---|
| Schedule (their tasks only) | ON | Yes — can expand to all tasks |
| Schedule (all tasks) | OFF | Yes |
| Daily logs (their entries) | ON | Yes |
| Daily logs (all entries) | OFF | Yes |
| Documents (their scope) | ON | Yes — can expand to all docs |
| Photos | ON | Yes |
| Invoices (their own) | ON | Yes |
| POs (their own) | ON | Yes |
| Change orders (their scope) | OFF | Yes |
| RFIs (tagged only) | ON | Yes |
| Internal costs/markup/pricing | OFF | **No — never visible to vendors** |

**Key difference from Buildertrend:** A trusted vendor (e.g., GC's go-to framer who acts like staff) can be given near-internal-user access. The builder controls this, not the platform.

**Client Portal (v1):**
Per-job feature toggles, configured by the builder. Matches Buildertrend's approach with additions:

| Feature | Default | Builder Can Toggle |
|---|---|---|
| Schedule | ON | Yes — can set time horizon (2 weeks, 1 month, all) |
| Budget summary (totals only) | ON | Yes |
| Budget details (line items) | OFF | Yes |
| Invoices | OFF | Yes |
| Daily logs | ON | Yes |
| Photos | ON | Yes |
| Selections | ON | Yes — can allow approve/reject |
| Change orders | ON | Yes — can allow approve/reject |
| Warranty requests | ON (warranty phase) | Yes |
| Documents | ON | Yes |
| Draw schedule | OFF | Yes |

**Vendor Employee Roles (GAP-227):** A vendor company may have multiple employees who need different access levels. The system must support role differentiation within a vendor organization:
- The vendor's primary contact (owner/admin) manages their company's portal users.
- Each vendor employee is assigned a vendor-internal role when added to the portal:
  - **Vendor Admin**: full access to all features the builder has enabled for this vendor (invoices, schedule, documents, daily logs).
  - **Vendor Office**: access to financial features (invoices, POs, lien waivers, payment status) but not field features (daily logs, schedule check-in).
  - **Vendor Field**: access to schedule (their tasks), daily logs (their entries), photos, and documents -- but not financial data (invoices, payment amounts).
- The builder's Permission Wizard controls which features are enabled for the vendor company; vendor-internal roles further restrict within that set.
- A vendor foreman should never see invoice amounts or payment details even if the vendor company has invoice access enabled -- only vendor admin and vendor office roles see financials.

**Client Access Lifecycle (GAP-232):** Client portal access must adapt based on the project's current phase. The system must support phase-based client portal configuration:
- **Pre-construction phase**: client sees selections, estimates (if builder shares), schedule milestones, and documents. No daily log access.
- **Active construction phase**: client sees the full portal feature set as configured by the builder (schedule, photos, daily logs, selections, change orders, budget summary).
- **Warranty phase**: client portal transitions to warranty-specific view: warranty request submission, service history, home manual/documentation, maintenance reminders. Construction-phase features (daily logs, active schedule, change orders) are hidden.
- **Closed phase**: read-only archive access to project documents, photos, selections, and warranty history. No active features.
- Phase transitions are automatic based on the project status field. Builder can override per project if the standard phase mapping does not fit.

**"Preview as" button:** Builder can click "Preview as [Client Name]" to see exactly what the client sees. Essential for trust and debugging access issues.

**Client Guest Access:** Clients can invite guests (family, friends) who only see photos + schedule. No financials, no approvals.

#### Edge Cases & What-If Scenarios

1. **Vendor employee departure:** When a vendor's employee leaves the vendor company, the system must provide a way to deactivate that individual's access without disrupting the vendor company's overall access. The vendor admin (or the builder) must be able to deactivate the departed employee's account immediately. All data created by the departed employee (daily log entries, submitted invoices, uploaded documents) must be preserved and attributed to them. The departed employee's active sessions must be terminated, and their login credentials must be blocked. If the vendor has no remaining active users, the builder should be warned.

2. **Client delegation to spouse or financial advisor:** Deferred to Phase 2 (GAP-233), but when implemented: clients can invite one delegate who inherits a subset of the client's portal permissions (configurable by the builder). Delegation is limited to one level — a delegate cannot further delegate. The builder retains the ability to revoke delegated access at any time. Security requirement: the delegate must create their own platform account (no shared credentials). All delegate actions are logged under the delegate's identity, not the client's.

#### Phase 2+ External Users (deferred)

Full external user type table preserved for future implementation:

| User Type | Default Access | Phase |
|---|---|---|
| Architect/Engineer (GAP-229) | Plans, RFIs, submittals, specs. NO financial data | Phase 2 |
| Interior Designer (GAP-230) | Selections, allowance budgets for their scope | Phase 2 |
| Client - Warranty (GAP-232) | Warranty requests, service history, home manual | Phase 2 |
| Client Representative (GAP-233) | Delegated by client, one level max | Phase 2 |
| Lender (GAP-234) | Draw requests, lien waivers, progress photos (read-only) | Phase 2 |
| Real Estate Agent (GAP-231) | Completion timeline, feature list, photos (read-only) | Phase 3 |
| Inspector (GAP-235) | Inspection-related documents, temporary auto-expiring access | Phase 3 |

**Guest/link-based access (GAP-219):** Deferred to Phase 2. Generate time-limited, scope-limited shareable links. No account required. Tracked via anonymous session ID.

### 4. SSO & MFA (GAP-221, GAP-222)

**SSO providers:**
- Google Workspace (OAuth 2.0 / OIDC)
- Microsoft Azure AD (OAuth 2.0 / OIDC)
- Okta (SAML 2.0 / OIDC)
- Generic SAML 2.0 connector for enterprise customers

**SSO configuration is per-tenant.** Builder A uses Google Workspace, Builder B uses Azure AD, Builder C uses email/password only. Stored in `tenant_sso_configs` table.

**MFA (GAP-222):**
- Tenant-level MFA policy: `mfa_required: 'none' | 'admins_only' | 'all_internal' | 'everyone'`
- Supported methods: TOTP (authenticator app), SMS (fallback), email code (low security option)
- Recovery codes: generated on MFA enrollment, stored hashed
- Grace period: configurable days before MFA enforcement kicks in for new users

**Field-friendly recovery (GAP-223):**
- PIN-based quick login for returning devices (4-6 digit PIN after initial full auth)
- Biometric unlock (Face ID / fingerprint) on mobile via WebAuthn
- SMS code recovery (does not require email access)
- Admin can generate a temporary access code for a field user

### 5. Shared Device / Kiosk Mode (GAP-216)

- Builder enables "shared device" mode for specific devices (e.g., job-site iPad)
- Device registers as a kiosk with a device PIN
- Users switch by entering their personal PIN (4-6 digits) — no full re-authentication
- Auto-lock after configurable idle timeout (default: 5 minutes)
- Kiosk sessions are recorded in the audit trail with device ID

### 6. Time-Limited & Emergency Access (GAP-215, GAP-218)

**Time-limited access (GAP-215):**
- `user_tenant_memberships.expires_at` field
- Cron job runs daily to deactivate expired memberships
- 7-day warning notification before expiry
- Builder admin can extend or revoke at any time

**Emergency revocation (GAP-218):**
- "Deactivate User" action immediately:
  - Invalidates all refresh tokens for that user+tenant
  - Removes from active SSE connections
  - Blocks new login attempts
  - Does NOT delete any data they created (preserves audit trail)
  - Reassigns their active tasks/projects to a specified user (or unassigned)

### 7. API Authentication (GAP-225)

- Integration/service accounts are created per tenant for system-to-system access
- API keys are scoped to specific permissions (e.g., QuickBooks sync only gets invoices:read, invoices:update)
- API keys have configurable expiry and rate limits
- All API key usage is logged in the audit trail
- API keys can be rotated without downtime (old key valid for 24h overlap period)
- Webhook signatures use HMAC-SHA256 with per-tenant secrets

### 8. IP Restrictions (GAP-220)

- Tenant-level setting: `allowed_ip_ranges: CIDR[]`
- Applies only to internal users (not external vendors/clients accessing portals)
- Bypass available for mobile app access (uses device registration instead)
- Logged but not blocked in "audit-only" mode during rollout

### 9. Unusual Business Scenarios — Access Control Edge Cases

#### 9a. Client Divorce During Construction (GAP-605)
When a client couple divorces during an active construction project, the system must support:
- **Dual communication mode:** Builder can flag a project for "split communication," requiring that all portal messages, change order approvals, and selection decisions be sent to and acknowledged by both parties independently.
- **Split decision authority:** Builder configures which decisions require both parties' approval (change orders, selections over a threshold) vs. either party (schedule acknowledgments, photo access).
- **Separate portal logins:** Each party has their own client portal account with independent notification preferences. Neither party can modify the other's settings.
- **Communication isolation:** If directed by builder or legal counsel, messages from Party A are not visible to Party B and vice versa. Builder sees all communication.
- **Legal sensitivity flag:** Project flagged as "legally sensitive" — all communication is logged with enhanced audit trail. No records can be deleted or modified once the flag is set.
- **Attorney access:** If either party's attorney needs portal access, use the guest/delegate access mechanism (Phase 2 GAP-233) with read-only permissions.

#### 9b. Key Employee Death or Incapacitation (GAP-606)
When a builder's key employee (PM, superintendent, owner) dies or becomes incapacitated, the system must ensure project continuity:
- **Complete project documentation:** The system's value proposition is that ALL project knowledge lives in the platform — daily logs, communications, decisions, budgets, schedules, vendor relationships, and pending items. A replacement must be able to pick up any project by reading the platform data alone.
- **Emergency access transfer:** Owner or admin can immediately reassign all of the incapacitated user's projects, tasks, and pending approvals to a replacement user with a single bulk action.
- **Pending item report:** System generates a "handoff report" listing every open item assigned to the affected user: pending approvals, unanswered RFIs, open change orders, upcoming inspections, scheduled vendor commitments, and unfinished daily logs.
- **Communication continuity:** All in-progress email threads, portal messages, and vendor communications are accessible to the replacement user. External parties (clients, architects, vendors) are notified of the new point of contact.
- **Access preservation:** The incapacitated user's account is deactivated (per GAP-218 emergency revocation) but all data they created is permanently preserved and attributed to them.
- **No single point of failure:** System should surface a "bus factor" warning when any user is the sole PM, sole approver, or sole admin on active projects with no backup assigned.

#### 9c. Joint Venture with Another Builder (GAP-618)
When two builders on the platform jointly execute a project, the system must support controlled data sharing:
- **JV project designation:** A project can be flagged as a "joint venture" with a reference to the partner builder's tenant.
- **Shared project view:** Designated users from each builder's tenant can view the JV project data (schedule, budget, daily logs, documents) without full cross-tenant access. This is implemented as a scoped cross-tenant read permission — not a merge of tenants.
- **Data ownership:** One builder is designated as the "managing partner" whose tenant owns the project record. The other builder has configurable read/contribute access.
- **Cost splitting:** Budget line items can be tagged with allocation percentages per JV partner. Reports generate separate cost views per partner.
- **Independent vendor relationships:** Each builder's vendor data (rates, performance scores, internal notes) remains private. Shared vendor interactions on the JV project are logged in the managing partner's project.
- **JV dissolution:** When the JV ends, the non-managing partner's access is revoked. They can export their portion of the project data (their cost allocations, their communications, documents they uploaded) before access is terminated.

#### 9d. Construction Manager / Owner's Rep Access (GAP-620)
When a builder hires a construction manager or owner's representative who needs oversight access:
- **CM/Owner's Rep role:** A new external user type (Phase 2 external user) with near-internal-user access: full read access to schedule, budget, daily logs, RFIs, change orders, submittals, and documents. No create/edit permissions on financial data.
- **Oversight dashboard:** CM/Owner's Rep sees a project-level dashboard with all key metrics — budget health, schedule status, open RFIs, pending approvals, risk indicators — without the ability to modify data.
- **Approval participation:** Builder can optionally add the CM to approval workflows as a reviewer (not approver). Their review is logged but does not gate the workflow.
- **Report access:** CM/Owner's Rep can run and export all project reports, filtered to show contract-level data (not internal margins or vendor pricing unless builder explicitly enables it).
- **Time-limited access:** CM/Owner's Rep access automatically expires at project completion plus a configurable buffer (default: 90 days for warranty period oversight).
- **Audit trail:** All CM/Owner's Rep access and actions are logged separately for the builder's review.

### 9e. Multi-Entity Builder Structures (GAP-574 through GAP-580)

Builders with complex organizational structures (multiple LLCs, multiple offices, multiple brands, franchise operations) require multi-entity support in the authentication and access control layer. The full multi-entity architecture is specified in `docs/architecture/multi-tenancy-design.md` Section 12 and `docs/architecture/configuration-engine.md` Section 11. Key auth-layer requirements:

- **Multiple LLCs** (GAP-574): each LLC is a separate company record with its own `company_id`. A single user (e.g., the owner) belongs to all entities via `user_tenant_memberships` and uses the tenant switcher to move between them. Data isolation is maintained by default; cross-entity data sharing is opt-in. See `multi-tenancy-design.md` Section 12.2.
- **Construction + real estate company** (GAP-575): modeled as two child companies under one parent. Separate data, shared vendor pool optional. Cross-entity referral tracking via a dedicated linkage. See `multi-tenancy-design.md` Section 12.2.
- **Multiple offices** (GAP-576): each office can be a division entity with different teams and vendor relationships, but shared reporting at the parent level. Users with roles in one division cannot see another division's data unless they have memberships in both. See `multi-tenancy-design.md` Section 12.2.
- **Different brand names** (GAP-577): a builder operating luxury and production brands under the same company uses the sub-tenant model (Section 1 edge case 4 above). Each brand is a child tenant with its own branding, client portal appearance, and terminology -- but shared user accounts and optional cross-brand reporting.
- **Mergers & acquisitions** (GAP-578): covered by Section 1 edge case 1 (Tenant migration during M&A) above. The data model must not prevent future M&A migration workflows.
- **Franchise model** (GAP-579): the franchisor is the parent company that provides templates, branding, and locked configuration settings. Franchisees are child companies that operate independently but inherit franchisor-controlled configuration. See `multi-tenancy-design.md` Section 12.4 and `configuration-engine.md` Section 11.
- **Small to large scaling** (GAP-580): the platform must grow with the builder without forcing a platform change. The subscription tier system (starter -> professional -> business -> enterprise) enables progressive feature access. Multi-entity features activate when the builder's organizational complexity demands them. See `multi-tenancy-design.md` Section 12.5.

### 10. Audit Trail (GAP-217, GAP-164)

- Every authentication event logged: login, logout, failed login, password change, MFA change, role change, permission change
- Every data access logged at the API route level (who requested what resource at what time)
- Audit log is append-only, cannot be modified or deleted by any user (including builder owner)
- Platform admin access to customer data requires a justification note (GAP-164)
- Audit log retention: configurable per tenant (default: 2 years, enterprise: unlimited)

---

## Database Tables

```
-- Platform-level (no builder_id)
platform_users (
  id UUID PK,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  mfa_secret_encrypted VARCHAR,
  mfa_recovery_codes_hash VARCHAR[],
  email_verified BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ  -- soft delete
)

-- Tenant membership
user_tenant_memberships (
  id UUID PK,
  user_id UUID FK -> platform_users,
  builder_id UUID FK -> builders,
  role_id UUID FK -> roles,
  status ENUM('active', 'invited', 'deactivated', 'expired'),
  expires_at TIMESTAMPTZ,
  invited_by UUID FK -> platform_users,
  accepted_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,
  deactivated_by UUID FK -> platform_users,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, builder_id)
)

-- Project-level role overrides
project_user_roles (
  id UUID PK,
  user_id UUID FK -> platform_users,
  project_id UUID FK -> projects,
  builder_id UUID FK -> builders,
  role_id UUID FK -> roles,
  granted_by UUID FK -> platform_users,
  created_at TIMESTAMPTZ,
  UNIQUE(user_id, project_id)
)

-- Custom roles per tenant
roles (
  id UUID PK,
  builder_id UUID FK -> builders,
  name VARCHAR,
  description TEXT,
  inherits_from UUID FK -> roles,  -- role inheritance
  is_system BOOLEAN DEFAULT false,  -- system roles cannot be deleted
  permissions JSONB,  -- array of permission strings
  field_overrides JSONB,  -- field-level visibility overrides
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
)

-- SSO configuration per tenant
tenant_sso_configs (
  id UUID PK,
  builder_id UUID FK -> builders,
  provider ENUM('google', 'azure_ad', 'okta', 'saml_generic'),
  client_id VARCHAR,
  client_secret_encrypted VARCHAR,
  metadata_url VARCHAR,
  domain_hint VARCHAR,
  enabled BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- API keys for integrations
api_keys (
  id UUID PK,
  builder_id UUID FK -> builders,
  name VARCHAR,
  key_hash VARCHAR,
  key_prefix VARCHAR(8),  -- for identification
  permissions JSONB,
  rate_limit_per_minute INT DEFAULT 60,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_by UUID FK -> platform_users,
  created_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
)

-- Guest/shareable links
guest_access_links (
  id UUID PK,
  builder_id UUID FK -> builders,
  token_hash VARCHAR,
  resource_type VARCHAR,
  resource_id UUID,
  permissions VARCHAR[],
  expires_at TIMESTAMPTZ,
  max_uses INT,
  use_count INT DEFAULT 0,
  created_by UUID FK -> platform_users,
  created_at TIMESTAMPTZ
)

-- Audit log (append-only)
auth_audit_log (
  id UUID PK,
  builder_id UUID,
  user_id UUID,
  event_type VARCHAR,
  resource_type VARCHAR,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  device_id VARCHAR,
  metadata JSONB,
  created_at TIMESTAMPTZ
)
-- Partitioned by created_at month for performance
```

---

## API Endpoints

```
POST   /api/v1/auth/login                    -- email+password login
POST   /api/v1/auth/login/sso                -- SSO initiation
GET    /api/v1/auth/callback/:provider        -- SSO callback
POST   /api/v1/auth/refresh                   -- refresh access token
POST   /api/v1/auth/logout                    -- invalidate session
POST   /api/v1/auth/forgot-password           -- initiate password reset
POST   /api/v1/auth/reset-password            -- complete password reset
POST   /api/v1/auth/verify-email              -- email verification
POST   /api/v1/auth/mfa/enroll                -- begin MFA enrollment
POST   /api/v1/auth/mfa/verify                -- verify MFA code
POST   /api/v1/auth/switch-tenant             -- switch active tenant context

GET    /api/v1/users                          -- list users in tenant
POST   /api/v1/users/invite                   -- invite user to tenant
GET    /api/v1/users/:id                      -- get user profile
PATCH  /api/v1/users/:id                      -- update user profile
POST   /api/v1/users/:id/deactivate           -- emergency deactivation (GAP-218)
POST   /api/v1/users/:id/reactivate           -- reactivate user

GET    /api/v1/roles                          -- list roles for tenant
POST   /api/v1/roles                          -- create custom role (GAP-211)
PATCH  /api/v1/roles/:id                      -- update role permissions
DELETE /api/v1/roles/:id                       -- delete custom role

GET    /api/v1/projects/:id/members           -- list project members with roles
POST   /api/v1/projects/:id/members           -- add member with role override (GAP-212)
PATCH  /api/v1/projects/:id/members/:userId   -- change project-level role
DELETE /api/v1/projects/:id/members/:userId    -- remove project access

GET    /api/v1/api-keys                       -- list API keys (GAP-225)
POST   /api/v1/api-keys                       -- create API key
DELETE /api/v1/api-keys/:id                    -- revoke API key
POST   /api/v1/api-keys/:id/rotate            -- rotate API key

POST   /api/v1/guest-links                    -- create guest access link (GAP-219)
GET    /api/v1/guest/:token                   -- access resource via guest link

GET    /api/v1/audit-log                      -- query audit log (GAP-217)
GET    /api/v1/settings/security              -- get tenant security settings
PATCH  /api/v1/settings/security              -- update (MFA policy, IP restrictions, etc.)
```

---

## Dependencies

- **Supabase Auth**: base authentication provider (email/password, OAuth)
- **PostgreSQL**: RLS policies for tenant isolation (GAP-537)
- **Redis**: refresh token blocklist, rate limiting, session cache
- **Email service**: verification, password reset, invitation emails
- **SMS provider** (Twilio or similar): MFA SMS codes, field recovery codes

---

## Open Questions

1. **GAP-216 (Kiosk mode):** Should kiosk mode be a Phase 1 requirement or deferred? It adds complexity to the auth flow but is valuable for field adoption.
2. **GAP-233 (Client delegation):** How deep does client delegation go? Can a client's attorney then delegate to their paralegal? Recommend limiting to one level.
3. **GAP-220 (IP restrictions):** Should VPN detection be included, or just static IP/CIDR ranges?
4. **GAP-224 (Field-level permissions):** Implementing true field-level security is expensive. Should we start with column-level visibility in the API response and defer database-level field encryption?
5. **GAP-159 (Cross-tenant vendor):** When a vendor logs in and sees multiple builders, is the UX a tenant switcher (like Slack workspaces) or a unified dashboard showing all builders?
6. **Rate limiting strategy:** Per-user, per-tenant, or both? What are the default limits per plan tier?

