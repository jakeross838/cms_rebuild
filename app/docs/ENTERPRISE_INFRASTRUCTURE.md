# RossOS Enterprise Infrastructure

> **Purpose**: Enterprise-grade features required for 10,000+ company scale, SOC 2 compliance, and enterprise sales.
>
> **Priority**: These should be built alongside or immediately after MVP phases.

---

## Overview

The MVP roadmap covers **construction features**. This document covers **platform infrastructure** required to:
- Sell to enterprise customers (SSO, SOC 2, SLAs)
- Scale to 1,000,000+ users (monitoring, reliability)
- Operate legally (GDPR, compliance)
- Generate revenue (billing, subscriptions)
- Support customers (help desk, ticketing)

---

## New Phases (17-22)

```
MVP PHASES (1-8)           ENTERPRISE PHASES (17-22)
─────────────────          ────────────────────────────
Features for               Infrastructure for
BUILDERS                   ROSSOS AS A BUSINESS
```

---

## Phase 17: Enterprise Security

**Priority**: P0 - Required for any enterprise sale
**Timeline**: Build during/after Phase 1

### 17.1 Multi-Factor Authentication (MFA)

```sql
CREATE TABLE user_mfa_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- MFA Type
    mfa_type TEXT NOT NULL,                   -- totp, sms, email, hardware_key

    -- TOTP (Authenticator App)
    totp_secret TEXT,                         -- Encrypted
    totp_verified BOOLEAN DEFAULT false,

    -- SMS
    phone_number TEXT,
    phone_verified BOOLEAN DEFAULT false,

    -- Hardware Key (WebAuthn/FIDO2)
    credential_id TEXT,
    public_key TEXT,
    counter INT DEFAULT 0,

    -- Recovery
    recovery_codes TEXT[],                    -- Encrypted, hashed
    recovery_codes_used INT DEFAULT 0,

    -- Status
    is_enabled BOOLEAN DEFAULT false,
    enabled_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mfa_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    challenge_type TEXT NOT NULL,             -- totp, sms, email
    challenge_code TEXT,                      -- Hashed

    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    attempts INT DEFAULT 0,

    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tasks:**
- [ ] Add MFA settings page in user profile
- [ ] Implement TOTP (Google Authenticator, Authy)
- [ ] Implement SMS fallback (Twilio)
- [ ] Implement recovery codes
- [ ] Add WebAuthn for hardware keys (YubiKey)
- [ ] Force MFA for admin roles
- [ ] Company-level MFA policy enforcement

### 17.2 Single Sign-On (SSO)

```sql
CREATE TABLE sso_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Provider
    provider_type TEXT NOT NULL,              -- saml, oidc
    provider_name TEXT,                       -- okta, azure_ad, google, custom

    -- SAML Configuration
    saml_entity_id TEXT,
    saml_sso_url TEXT,
    saml_slo_url TEXT,
    saml_certificate TEXT,                    -- IdP public certificate
    saml_name_id_format TEXT DEFAULT 'email',

    -- OIDC Configuration
    oidc_client_id TEXT,
    oidc_client_secret TEXT,                  -- Encrypted
    oidc_issuer_url TEXT,
    oidc_authorization_url TEXT,
    oidc_token_url TEXT,
    oidc_userinfo_url TEXT,
    oidc_scopes TEXT[] DEFAULT '{openid,email,profile}',

    -- Attribute Mapping
    attribute_mapping JSONB DEFAULT '{
        "email": "email",
        "first_name": "given_name",
        "last_name": "family_name"
    }',

    -- Settings
    is_enabled BOOLEAN DEFAULT false,
    enforce_sso BOOLEAN DEFAULT false,        -- Block password login
    auto_provision_users BOOLEAN DEFAULT true,
    default_role TEXT DEFAULT 'viewer',
    allowed_domains TEXT[],                   -- Restrict by email domain

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id)
);

CREATE TABLE sso_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sso_configuration_id UUID NOT NULL REFERENCES sso_configurations(id),

    -- Session Info
    session_id TEXT NOT NULL,                 -- IdP session ID
    name_id TEXT,                             -- SAML NameID

    -- Timestamps
    authenticated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,

    -- Metadata
    ip_address INET,
    user_agent TEXT
);
```

**Tasks:**
- [ ] Implement SAML 2.0 authentication
- [ ] Implement OIDC authentication
- [ ] Create SSO configuration UI (admin only)
- [ ] Support Okta, Azure AD, Google Workspace
- [ ] Just-in-time user provisioning
- [ ] SSO-only mode (disable password login)
- [ ] Domain verification for SSO

### 17.3 SCIM User Provisioning

```sql
CREATE TABLE scim_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- SCIM Endpoint
    scim_token TEXT NOT NULL,                 -- Encrypted bearer token
    scim_token_hash TEXT NOT NULL,            -- For validation

    -- Settings
    is_enabled BOOLEAN DEFAULT true,
    sync_groups BOOLEAN DEFAULT true,
    auto_deactivate BOOLEAN DEFAULT true,     -- Deactivate on IdP removal

    -- Statistics
    last_sync_at TIMESTAMPTZ,
    users_synced INT DEFAULT 0,
    groups_synced INT DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id)
);

CREATE TABLE scim_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),

    -- SCIM External ID
    external_id TEXT NOT NULL,

    -- Sync Status
    last_synced_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'active',        -- active, suspended, deleted

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, external_id)
);
```

**Tasks:**
- [ ] Implement SCIM 2.0 endpoints (/scim/v2/Users, /scim/v2/Groups)
- [ ] Create/update/delete users via SCIM
- [ ] Group membership sync
- [ ] Bearer token authentication
- [ ] SCIM compliance testing

### 17.4 Security Policies

```sql
CREATE TABLE security_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Password Policy
    password_min_length INT DEFAULT 8,
    password_require_uppercase BOOLEAN DEFAULT true,
    password_require_lowercase BOOLEAN DEFAULT true,
    password_require_numbers BOOLEAN DEFAULT true,
    password_require_symbols BOOLEAN DEFAULT false,
    password_max_age_days INT,                -- Force rotation
    password_history_count INT DEFAULT 5,     -- Prevent reuse

    -- Session Policy
    session_timeout_minutes INT DEFAULT 480,  -- 8 hours
    session_max_concurrent INT,               -- NULL = unlimited
    session_require_reauth_for TEXT[],        -- Actions requiring reauth

    -- IP Policy
    ip_allowlist_enabled BOOLEAN DEFAULT false,
    ip_allowlist CIDR[],

    -- MFA Policy
    mfa_required_roles TEXT[],                -- Roles that must use MFA
    mfa_required_all BOOLEAN DEFAULT false,

    -- Audit Policy
    audit_retention_days INT DEFAULT 365,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id)
);

CREATE TABLE ip_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),

    ip_address INET NOT NULL,
    user_agent TEXT,
    action TEXT NOT NULL,                     -- login, api_call, etc.
    allowed BOOLEAN NOT NULL,
    reason TEXT,                              -- Why blocked if not allowed

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    user_id UUID REFERENCES users(id),

    event_type TEXT NOT NULL,                 -- login_failed, password_reset, mfa_disabled, etc.
    severity TEXT DEFAULT 'info',             -- info, warning, critical

    ip_address INET,
    user_agent TEXT,

    details JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_created_at ON security_events(created_at DESC);
```

**Tasks:**
- [ ] Company-level security policy settings UI
- [ ] Password policy enforcement
- [ ] Session management (list active sessions, revoke)
- [ ] IP allowlist enforcement
- [ ] Security event logging
- [ ] Security alerts (suspicious activity)

### 17.5 Encryption & Key Management

**Tasks:**
- [ ] Document encryption at rest (Supabase default)
- [ ] Implement field-level encryption for sensitive data
- [ ] API key management (create, revoke, rotate)
- [ ] Webhook signing keys
- [ ] Secrets management (environment variables)

---

## Phase 18: Billing & Subscriptions

**Priority**: P0 - Required to generate revenue
**Timeline**: Build during/after Phase 1

### 18.1 Subscription Management

```sql
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Plan Info
    name TEXT NOT NULL,                       -- Starter, Professional, Enterprise
    code TEXT NOT NULL UNIQUE,                -- starter, professional, enterprise
    description TEXT,

    -- Pricing
    price_monthly DECIMAL(10, 2),
    price_yearly DECIMAL(10, 2),
    price_per_user DECIMAL(10, 2),            -- For seat-based

    -- Limits
    max_users INT,                            -- NULL = unlimited
    max_jobs INT,
    max_storage_gb INT,
    max_api_calls_monthly INT,

    -- Features
    features JSONB NOT NULL DEFAULT '{}',
    /*
    {
        "sso": false,
        "api_access": true,
        "custom_branding": false,
        "priority_support": false,
        "data_export": true
    }
    */

    -- Stripe
    stripe_price_id_monthly TEXT,
    stripe_price_id_yearly TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,           -- Show on pricing page

    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),

    -- Stripe
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,

    -- Status
    status TEXT DEFAULT 'trialing',           -- trialing, active, past_due, canceled, unpaid

    -- Billing Cycle
    billing_interval TEXT DEFAULT 'monthly',  -- monthly, yearly
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,

    -- Trial
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,

    -- Cancellation
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMPTZ,
    cancellation_reason TEXT,

    -- Seats
    quantity INT DEFAULT 1,                   -- Number of seats

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id)
);

CREATE TABLE subscription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,

    -- Stripe
    stripe_subscription_item_id TEXT,
    stripe_price_id TEXT,

    -- Item Details
    item_type TEXT NOT NULL,                  -- base, addon, metered
    description TEXT,
    quantity INT DEFAULT 1,
    unit_amount DECIMAL(10, 2),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),

    -- This is for RossOS billing, not construction invoices
    -- Renamed to billing_invoices in actual implementation

    -- Stripe
    stripe_invoice_id TEXT UNIQUE,

    -- Invoice Details
    invoice_number TEXT,
    status TEXT DEFAULT 'draft',              -- draft, open, paid, void, uncollectible

    -- Amounts
    subtotal DECIMAL(10, 2),
    tax DECIMAL(10, 2),
    total DECIMAL(10, 2),
    amount_paid DECIMAL(10, 2),
    amount_due DECIMAL(10, 2),

    -- Currency
    currency TEXT DEFAULT 'usd',

    -- Dates
    invoice_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,

    -- PDF
    invoice_pdf_url TEXT,
    hosted_invoice_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rename to avoid conflict with construction invoices
ALTER TABLE invoices RENAME TO billing_invoices;

CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Stripe
    stripe_payment_method_id TEXT UNIQUE,

    -- Card Details (non-sensitive)
    type TEXT,                                -- card, bank_account
    brand TEXT,                               -- visa, mastercard, amex
    last_four TEXT,
    exp_month INT,
    exp_year INT,

    -- Status
    is_default BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),

    -- Usage Type
    usage_type TEXT NOT NULL,                 -- api_calls, storage_gb, users

    -- Record
    quantity INT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),

    -- Stripe
    stripe_usage_record_id TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_records_company_timestamp ON usage_records(company_id, timestamp DESC);
```

**Tasks:**
- [ ] Stripe Connect integration
- [ ] Create subscription plans in Stripe
- [ ] Checkout flow (upgrade/downgrade)
- [ ] Billing portal (manage payment methods)
- [ ] Invoice history
- [ ] Usage tracking (API calls, storage, users)
- [ ] Seat limit enforcement
- [ ] Dunning emails (failed payments)
- [ ] Proration handling
- [ ] Free trial to paid conversion

### 18.2 Enterprise Contracts

```sql
CREATE TABLE enterprise_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Contract Details
    contract_number TEXT,
    contract_value DECIMAL(12, 2),
    contract_term_months INT,

    -- Dates
    start_date DATE,
    end_date DATE,
    renewal_date DATE,

    -- Terms
    payment_terms TEXT,                       -- net_30, net_60, annual_upfront
    po_number TEXT,

    -- Status
    status TEXT DEFAULT 'draft',              -- draft, pending, active, expired

    -- Documents
    contract_pdf_url TEXT,
    signed_at TIMESTAMPTZ,
    signed_by TEXT,

    -- Custom Pricing
    custom_pricing JSONB,

    -- Notes
    notes TEXT,

    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tasks:**
- [ ] Enterprise quote generation
- [ ] Custom pricing override
- [ ] Contract management
- [ ] Renewal tracking
- [ ] PO number support

---

## Phase 19: Operations & Reliability

**Priority**: P0 - Required for production stability
**Timeline**: Implement during Phase 1

### 19.1 Application Monitoring

**External Services (No schema needed):**
- [ ] Sentry for error tracking (frontend + backend)
- [ ] Vercel Analytics for web vitals
- [ ] Supabase Dashboard for database metrics

**Tasks:**
- [ ] Set up Sentry project
- [ ] Configure source maps
- [ ] Error boundary components
- [ ] Alert rules (error spike, slow queries)
- [ ] Performance monitoring

### 19.2 Health Checks & Status

```sql
CREATE TABLE system_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    service TEXT NOT NULL,                    -- api, database, storage, auth
    status TEXT NOT NULL,                     -- healthy, degraded, down
    response_time_ms INT,

    details JSONB,

    checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Incident Info
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL,                   -- minor, major, critical

    -- Status
    status TEXT DEFAULT 'investigating',      -- investigating, identified, monitoring, resolved

    -- Timeline
    started_at TIMESTAMPTZ NOT NULL,
    identified_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,

    -- Affected Services
    affected_services TEXT[],

    -- Updates
    updates JSONB DEFAULT '[]',
    /*
    [
        {"timestamp": "...", "status": "investigating", "message": "..."},
        {"timestamp": "...", "status": "identified", "message": "..."}
    ]
    */

    -- Metadata
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scheduled_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title TEXT NOT NULL,
    description TEXT,

    -- Schedule
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,

    -- Affected Services
    affected_services TEXT[],

    -- Status
    status TEXT DEFAULT 'scheduled',          -- scheduled, in_progress, completed, cancelled

    -- Notifications
    notification_sent BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tasks:**
- [ ] Create /api/health endpoint
- [ ] Create /api/ready endpoint (for k8s)
- [ ] Set up status page (Statuspage.io or custom)
- [ ] Incident management workflow
- [ ] Scheduled maintenance notifications
- [ ] Uptime monitoring (Pingdom/UptimeRobot)

### 19.3 Backup & Disaster Recovery

**Tasks:**
- [ ] Document Supabase automatic backups
- [ ] Configure point-in-time recovery
- [ ] Test restore procedures
- [ ] Create disaster recovery runbook
- [ ] Set up cross-region backup (for enterprise)
- [ ] Define RTO/RPO targets

### 19.4 Feature Flags

```sql
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Flag Info
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,

    -- Type
    flag_type TEXT DEFAULT 'boolean',         -- boolean, percentage, variant

    -- Default Value
    default_value JSONB NOT NULL DEFAULT 'false',

    -- Targeting
    targeting_rules JSONB DEFAULT '[]',
    /*
    [
        {"type": "company", "ids": ["uuid1", "uuid2"], "value": true},
        {"type": "percentage", "value": 10, "result": true},
        {"type": "role", "roles": ["admin"], "value": true}
    ]
    */

    -- Status
    is_enabled BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feature_flag_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    value JSONB NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CHECK (company_id IS NOT NULL OR user_id IS NOT NULL)
);
```

**Tasks:**
- [ ] Feature flag evaluation service
- [ ] Admin UI for flag management
- [ ] Per-tenant flag overrides
- [ ] Percentage rollouts
- [ ] Feature flag SDK for frontend

---

## Phase 20: Legal & Compliance

**Priority**: P0 for EU market, P1 for US-only
**Timeline**: Before public launch

### 20.1 GDPR Compliance

```sql
CREATE TABLE data_subject_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),

    -- Request Info
    request_type TEXT NOT NULL,               -- access, erasure, portability, rectification
    email TEXT NOT NULL,
    name TEXT,

    -- Verification
    verified BOOLEAN DEFAULT false,
    verification_token TEXT,
    verification_expires TIMESTAMPTZ,

    -- Status
    status TEXT DEFAULT 'pending',            -- pending, verified, processing, completed, rejected

    -- Dates
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,                     -- 30 days from verification

    -- Response
    response_notes TEXT,
    data_export_url TEXT,                     -- For access/portability

    -- Audit
    processed_by UUID,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    user_id UUID REFERENCES users(id),

    -- Consent Type
    consent_type TEXT NOT NULL,               -- marketing, analytics, cookies, tos, privacy

    -- Record
    consented BOOLEAN NOT NULL,
    consent_version TEXT,                     -- Version of policy consented to

    -- Context
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

    -- Policy
    entity_type TEXT NOT NULL,
    retention_days INT NOT NULL,

    -- Conditions
    condition TEXT,                           -- e.g., "status = 'completed'"

    -- Status
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tasks:**
- [ ] Data subject access request (DSAR) workflow
- [ ] Right to erasure implementation
- [ ] Data export (portability) feature
- [ ] Consent management
- [ ] Cookie banner
- [ ] Privacy policy version tracking
- [ ] Data retention automation

### 20.2 Terms & Policies

```sql
CREATE TABLE legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    document_type TEXT NOT NULL,              -- tos, privacy, dpa, cookie_policy
    version TEXT NOT NULL,

    title TEXT NOT NULL,
    content TEXT NOT NULL,                    -- Markdown

    effective_date DATE NOT NULL,

    is_current BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(document_type, version)
);

CREATE TABLE legal_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id),

    document_id UUID NOT NULL REFERENCES legal_documents(id),

    accepted_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
```

**Tasks:**
- [ ] Terms of Service acceptance tracking
- [ ] Privacy Policy acceptance
- [ ] Version history
- [ ] Force re-acceptance on updates
- [ ] DPA (Data Processing Agreement) signing

### 20.3 Accessibility (WCAG)

**Tasks:**
- [ ] WCAG 2.1 AA audit
- [ ] Screen reader testing
- [ ] Keyboard navigation
- [ ] Color contrast verification
- [ ] Alt text for images
- [ ] Form labels and ARIA
- [ ] Focus management

---

## Phase 21: Support Infrastructure

**Priority**: P1 - Required for customer success
**Timeline**: Before scaling

### 21.1 Help Desk & Ticketing

```sql
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    user_id UUID REFERENCES users(id),

    -- Ticket Info
    ticket_number TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Classification
    category TEXT,                            -- billing, technical, feature_request, bug
    priority TEXT DEFAULT 'normal',           -- low, normal, high, urgent

    -- Status
    status TEXT DEFAULT 'open',               -- open, pending, in_progress, resolved, closed

    -- Assignment
    assigned_to UUID,                         -- Internal support user

    -- SLA
    sla_response_due TIMESTAMPTZ,
    sla_resolution_due TIMESTAMPTZ,
    first_response_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,

    -- Satisfaction
    satisfaction_rating INT,                  -- 1-5
    satisfaction_feedback TEXT,

    -- Metadata
    tags TEXT[],
    custom_fields JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,

    -- Sender
    sender_type TEXT NOT NULL,                -- customer, agent, system
    sender_id UUID,
    sender_name TEXT,
    sender_email TEXT,

    -- Content
    body TEXT NOT NULL,
    body_html TEXT,

    -- Attachments
    attachments JSONB DEFAULT '[]',

    -- Visibility
    is_internal BOOLEAN DEFAULT false,        -- Internal notes

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE support_ticket_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,

    event_type TEXT NOT NULL,                 -- created, assigned, status_changed, etc.
    actor_id UUID,
    actor_type TEXT,                          -- customer, agent, system

    old_value TEXT,
    new_value TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_company ON support_tickets(company_id);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);
```

**Tasks:**
- [ ] Customer ticket submission
- [ ] Email-to-ticket integration
- [ ] Agent dashboard
- [ ] SLA tracking
- [ ] Canned responses
- [ ] Ticket assignment/routing
- [ ] Satisfaction surveys
- [ ] Support analytics

### 21.2 Knowledge Base

```sql
CREATE TABLE kb_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,

    parent_id UUID REFERENCES kb_categories(id),
    sort_order INT DEFAULT 0,

    is_public BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE kb_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES kb_categories(id),

    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,                    -- Markdown
    excerpt TEXT,

    -- Status
    status TEXT DEFAULT 'draft',              -- draft, published, archived
    published_at TIMESTAMPTZ,

    -- SEO
    meta_title TEXT,
    meta_description TEXT,

    -- Analytics
    view_count INT DEFAULT 0,
    helpful_count INT DEFAULT 0,
    not_helpful_count INT DEFAULT 0,

    -- Versioning
    version INT DEFAULT 1,

    -- Author
    author_id UUID,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE kb_article_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,

    helpful BOOLEAN NOT NULL,
    feedback TEXT,

    user_id UUID REFERENCES users(id),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kb_articles_slug ON kb_articles(slug);
CREATE INDEX idx_kb_articles_category ON kb_articles(category_id);
```

**Tasks:**
- [ ] Public knowledge base
- [ ] Search functionality
- [ ] Article feedback
- [ ] Related articles
- [ ] In-app help widget
- [ ] Video tutorials

### 21.3 Announcements & Changelog

```sql
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title TEXT NOT NULL,
    content TEXT NOT NULL,

    -- Type
    announcement_type TEXT DEFAULT 'info',    -- info, warning, maintenance, new_feature

    -- Display
    display_location TEXT DEFAULT 'banner',   -- banner, modal, sidebar
    is_dismissible BOOLEAN DEFAULT true,

    -- Targeting
    target_plans TEXT[],                      -- NULL = all plans
    target_roles TEXT[],                      -- NULL = all roles

    -- Schedule
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE announcement_dismissals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    dismissed_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(announcement_id, user_id)
);

CREATE TABLE changelog_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    version TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,                    -- Markdown

    -- Type
    entry_type TEXT DEFAULT 'feature',        -- feature, improvement, fix, security

    published_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tasks:**
- [ ] In-app announcements
- [ ] Maintenance banners
- [ ] Changelog page
- [ ] What's new modal
- [ ] Email release notes

---

## Phase 22: Admin Back-Office

**Priority**: P1 - Required for internal operations
**Timeline**: Build during Phase 2+

### 22.1 Super Admin Dashboard

```sql
-- This table is for RossOS internal admins, not tenant admins
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,

    -- Role
    admin_role TEXT NOT NULL,                 -- super_admin, support, billing, readonly

    -- Auth
    auth_id UUID,                             -- Supabase Auth

    -- Access
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,

    -- Audit
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES admin_users(id),

    action TEXT NOT NULL,
    target_type TEXT,                         -- company, user, subscription
    target_id UUID,

    details JSONB,
    ip_address INET,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE impersonation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES admin_users(id),
    target_user_id UUID NOT NULL REFERENCES users(id),
    target_company_id UUID NOT NULL REFERENCES companies(id),

    reason TEXT NOT NULL,

    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,

    actions_taken JSONB DEFAULT '[]'
);
```

**Tasks:**
- [ ] Separate admin app (/admin)
- [ ] Admin authentication
- [ ] Tenant list/search
- [ ] Tenant detail view
- [ ] User impersonation ("login as")
- [ ] Subscription management
- [ ] Feature flag management
- [ ] System health dashboard
- [ ] Admin audit logging

### 22.2 Tenant Management

**Tasks:**
- [ ] Company search/filter
- [ ] Company detail view
- [ ] User management per company
- [ ] Subscription override
- [ ] Feature flag per-tenant
- [ ] Data export for tenant
- [ ] Account suspension/termination
- [ ] Bulk operations

### 22.3 Analytics & Reporting

```sql
CREATE TABLE product_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    user_id UUID REFERENCES users(id),

    event_name TEXT NOT NULL,
    event_properties JSONB,

    -- Context
    session_id TEXT,
    page_url TEXT,
    referrer TEXT,

    -- Device
    device_type TEXT,
    browser TEXT,
    os TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_events_company ON product_events(company_id);
CREATE INDEX idx_product_events_name ON product_events(event_name);
CREATE INDEX idx_product_events_created ON product_events(created_at DESC);

-- Partitioning recommended for scale
```

**Tasks:**
- [ ] Product analytics (Mixpanel/Amplitude or custom)
- [ ] Usage dashboards
- [ ] Retention analysis
- [ ] Feature adoption metrics
- [ ] Revenue analytics
- [ ] Churn prediction

---

## Communication Infrastructure

### Email Service Setup (No new phase - integrate during Phase 1)

```sql
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    template_key TEXT NOT NULL UNIQUE,        -- welcome, password_reset, invoice, etc.
    name TEXT NOT NULL,
    description TEXT,

    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,

    -- Variables
    variables JSONB,                          -- Available merge fields

    -- Settings
    from_name TEXT,
    from_email TEXT,
    reply_to TEXT,

    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    user_id UUID REFERENCES users(id),

    template_key TEXT,
    to_email TEXT NOT NULL,
    subject TEXT,

    -- Status
    status TEXT DEFAULT 'queued',             -- queued, sent, delivered, bounced, failed

    -- Provider
    provider TEXT,                            -- sendgrid, postmark, ses
    provider_message_id TEXT,

    -- Events
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,

    -- Error
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_log_company ON email_log(company_id);
CREATE INDEX idx_email_log_status ON email_log(status);
```

**Tasks:**
- [ ] SendGrid/Postmark integration
- [ ] Email template management
- [ ] Transactional emails (welcome, password reset, notifications)
- [ ] Email delivery tracking
- [ ] Bounce handling
- [ ] Unsubscribe management

### Webhook System

```sql
CREATE TABLE webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    url TEXT NOT NULL,
    description TEXT,

    -- Events
    events TEXT[] NOT NULL,                   -- job.created, invoice.paid, etc.

    -- Security
    secret TEXT NOT NULL,                     -- For HMAC signing

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Statistics
    last_triggered_at TIMESTAMPTZ,
    success_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,

    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,

    -- Delivery
    status TEXT DEFAULT 'pending',            -- pending, success, failed
    attempts INT DEFAULT 0,
    next_retry_at TIMESTAMPTZ,

    -- Response
    response_status INT,
    response_body TEXT,
    response_time_ms INT,

    -- Error
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ
);

CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_next_retry ON webhook_deliveries(next_retry_at) WHERE status = 'pending';
```

**Tasks:**
- [ ] Webhook endpoint management UI
- [ ] Event subscription
- [ ] HMAC signature verification
- [ ] Retry logic with backoff
- [ ] Delivery logs
- [ ] Webhook testing tool

---

## Priority Summary

### Must Have Before Enterprise Sales (P0)
| Phase | Feature | Why |
|-------|---------|-----|
| 17.1 | MFA | Security baseline |
| 17.2 | SSO (SAML) | Enterprise IT requirement |
| 18.1 | Stripe Billing | Revenue |
| 19.1 | Error Tracking | Production stability |
| 20.1 | GDPR Basics | EU market |

### Should Have for Growth (P1)
| Phase | Feature | Why |
|-------|---------|-----|
| 17.3 | SCIM | Enterprise IT automation |
| 19.2 | Status Page | Customer trust |
| 20.2 | ToS Tracking | Legal protection |
| 21.1 | Help Desk | Customer support |
| 21.2 | Knowledge Base | Support deflection |
| 22.1 | Admin Dashboard | Operations |

### Nice to Have (P2)
| Phase | Feature | Why |
|-------|---------|-----|
| 17.4 | IP Allowlisting | High-security customers |
| 19.4 | Feature Flags | Safe rollouts |
| 22.3 | Product Analytics | Data-driven decisions |

---

## Database Schema Summary

| Phase | New Tables | Purpose |
|-------|------------|---------|
| 17 | 11 tables | Security (MFA, SSO, SCIM, policies) |
| 18 | 7 tables | Billing (subscriptions, invoices, usage) |
| 19 | 5 tables | Operations (health, incidents, flags) |
| 20 | 5 tables | Legal (GDPR, consent, policies) |
| 21 | 9 tables | Support (tickets, KB, changelog) |
| 22 | 4 tables | Admin (users, audit, impersonation) |
| Comms | 4 tables | Email, webhooks |
| **Total** | **~45 tables** | Enterprise infrastructure |

Combined with MVP (~85 tables), total schema: **~130 tables**

---

*Last Updated: 2026-02-12*
*Version: 1.0*
