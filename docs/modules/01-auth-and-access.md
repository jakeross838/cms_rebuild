# Module 1: Multi-Tenant Authentication & Access Control

**Phase:** 1 - Foundation
**Status:** TODO
**Last Updated:** 2026-02-11

---

## Overview

This module provides the complete authentication, authorization, and access control layer for the platform. Every request is scoped to a `builder_id` (tenant), ensuring absolute data isolation. The module supports internal users (builder employees), external users (vendors, clients, designers, lenders), and platform administrators. It must handle everything from a one-person shop where the owner sees everything, to a 50-person operation with granular per-project, per-field permissions.

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

### 2. Role Hierarchy & Permissions Engine

**Default roles (GAP-213, GAP-214):**

```
Platform Admin (internal only)
  |
Builder Owner
  |
Builder Admin
  |
Project Manager
  |
Field Superintendent
  |
Office Staff
  |
Read-Only / Observer
```

**Custom roles (GAP-211):** Builders can create unlimited custom roles. Each role is a named collection of permissions. Custom roles can inherit from a base role and add/remove specific permissions.

**Permission model (GAP-224):**
- Permissions are defined as `resource:action:scope` triples
- Resources: projects, budgets, invoices, change_orders, schedules, documents, contacts, selections, daily_logs, reports, settings
- Actions: create, read, update, delete, approve, export
- Scope: all, own, assigned, none
- Field-level overrides: specific fields can be hidden/read-only per role (e.g., budget line items hidden but total visible)

**Permissions matrix example:**

| Permission | Owner | Admin | PM | Field | Office | Read-Only |
|---|---|---|---|---|---|---|
| projects:read:all | Y | Y | Y | assigned | assigned | assigned |
| budgets:read:all | Y | Y | Y | N | Y | N |
| budgets:read:totals_only | Y | Y | Y | Y | Y | Y |
| invoices:approve:all | Y | Y | threshold | N | N | N |
| change_orders:create | Y | Y | Y | N | N | N |
| settings:update | Y | Y | N | N | N | N |

**Project-level overrides (GAP-212):** A user's role can be overridden per project. User X is PM on Project A but read-only on Project B. Stored in a `project_user_roles` junction table.

**"Open access" mode (GAP-214):** A tenant-level setting `permissions_mode: 'open' | 'standard' | 'strict'`. In "open" mode, all authenticated users see everything. Permissions infrastructure still exists so switching to "standard" later is seamless.

### 3. External User Access (GAP-226 through GAP-235)

**Cross-tenant identity (GAP-002, GAP-226):** A single email can be associated with accounts under multiple builders. The `users` table lives at the platform level (not tenant-scoped). A `user_tenant_memberships` junction table maps users to tenants with roles.

**External user types and their default access patterns:**

| User Type | Default Access | Configurable By Builder (GAP-228) |
|---|---|---|
| Vendor - Office (GAP-227) | Invoices, POs, schedule (their tasks), documents (their scope) | Yes, per vendor |
| Vendor - Field (GAP-227) | Schedule (their tasks), daily logs (their entries), photos | Yes, per vendor |
| Architect/Engineer (GAP-229) | Plans, RFIs, submittals, specs. NO financial data | Yes |
| Interior Designer (GAP-230) | Selections, allowance budgets for their scope | Yes |
| Client - Construction (GAP-232) | Progress photos, schedule, selections, budget summary, change orders, draw schedule | Yes |
| Client - Warranty (GAP-232) | Warranty requests, service history, home manual | Yes |
| Client Representative (GAP-233) | Delegated by client, scoped to what client grants | Client-controlled |
| Lender (GAP-234) | Draw requests, lien waivers, progress photos, inspection reports (read-only) | Yes |
| Real Estate Agent (GAP-231) | Completion timeline, feature list, photos (read-only) | Yes |
| Inspector (GAP-235) | Inspection-related documents, temporary access (auto-expires) | Yes |

**Guest/link-based access (GAP-219):** Generate time-limited, scope-limited shareable links. No account required. Tracked via anonymous session ID. Used for one-off document sharing (architect views RFI log).

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

### 9. Audit Trail (GAP-217, GAP-164)

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
