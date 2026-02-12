# Module 45: API & Integration Marketplace

**Phase:** 6 - Scale & Sell
**Status:** SPEC COMPLETE
**Covers Gap Items:** 134-154 (Section 5: Marketplace & Ecosystem)

---

## Overview

The API and Integration Marketplace extends the platform's value through ecosystem effects. It provides a public RESTful API with comprehensive documentation, webhook support for real-time events, OAuth2 for third-party app authorization, an integration directory where builders discover and install pre-built connectors, a developer portal for third-party developers, and a Zapier/Make connector for no-code automation. The marketplace also includes a vendor network for connecting builders with trade partners, and partner program management.

---

## Gap Items Addressed

| Gap # | Description | How Addressed |
|-------|-------------|---------------|
| 134 | Third-party developers build integrations (Open API) | Public REST API with OpenAPI 3.0 spec, API keys, rate limiting |
| 135 | App marketplace for discovering/installing integrations | Integration directory UI with categories, search, one-click install |
| 136 | Vendor/material supplier integrations for pricing data | Supplier API: push catalog and pricing into platform |
| 137 | Accounting integrations beyond QuickBooks (Sage, Xero, FreshBooks, Viewpoint) | Pre-built accounting adapters with two-way sync |
| 138 | Design tool integrations (Chief Architect, AutoCAD, Revit, SketchUp) | Plan import API: push architectural data (rooms, specs, quantities) into platform |
| 139 | Material supplier catalogs (product databases with pricing, specs, availability) | Supplier catalog API with product search and real-time pricing |
| 140 | Building product manufacturer integrations (TruStile, etc.) | Manufacturer product feed: specs, pricing, lead times pushed into selections |
| 141 | Estimation database integrations (RSMeans, Craftsman, HomeAdvisor) | Cost data API: pull regional cost data into estimating module |
| 142 | Third-party inspection company integrations | Inspection results API: push pass/fail/deficiency data into platform |
| 143 | Lender integrations (push draw requests to bank portal) | Lender API: push draw request packages (AIA format) to lending portals |
| 144 | Builders share/sell estimate templates, checklists, workflows | Template marketplace (covered in detail in Module 48) |
| 145 | Industry-standard templates maintained by platform team | Curated template library (Module 48), accessible via marketplace |
| 146 | Consultants create and sell templates | Third-party publisher accounts in marketplace (Module 48) |
| 147 | Regional template packs | Geographic filtering in template marketplace (Module 48) |
| 148 | Builders hire platform team for custom templates | Professional services listing in marketplace |
| 149 | Platform facilitates builder-vendor connections | Vendor directory: searchable by trade, location, rating, availability |
| 150 | Anonymous vendor benchmarking | Aggregated vendor performance metrics (anonymized across tenants) |
| 151 | Vendors pay for premium listing/visibility | Vendor premium placement (opt-in, clearly labeled as "Featured") |
| 152 | Vendor reviews/ratings visible across platform | Cross-tenant vendor ratings with builder-controlled visibility |
| 153 | Material supplier exclusive pricing/deals | Supplier deals hub: platform-negotiated pricing for members |
| 154 | Vendor disputes a builder's rating | Vendor dispute workflow: flag review, mediation, resolution |

---

## Detailed Requirements

### Public API

- **Specification**: OpenAPI 3.0 with interactive documentation (Swagger UI)
- **Authentication**: API keys for server-to-server; OAuth2 authorization code flow for user-facing apps
- **Rate Limiting**: Tiered by plan -- Starter: 100 req/min, Professional: 500, Business: 2000, Enterprise: custom
- **Versioning**: URL-based versioning (`/api/v1/`, `/api/v2/`) with 12-month deprecation policy
- **Pagination**: Cursor-based pagination on all list endpoints
- **Filtering**: Consistent query parameter filtering across all endpoints
- **Error Responses**: RFC 7807 Problem Details format

### Webhook System

- Event-driven webhooks for all major entity changes (created, updated, deleted)
- Configurable per integration: select which events to receive
- Signed payloads (HMAC-SHA256) for verification
- Retry logic: exponential backoff (1min, 5min, 30min, 2hr, 12hr), then disabled after 5 failures
- Webhook delivery log with replay capability
- Event categories: projects, budgets, schedules, invoices, change_orders, vendors, documents

### OAuth2 Provider

- Authorization code flow for third-party apps requesting builder data access
- Scoped permissions: read:projects, write:invoices, read:vendors, etc.
- Token refresh with configurable expiration
- Builder sees authorized apps and can revoke access
- Developer app registration with callback URL validation

### Integration Directory

Pre-built integrations organized by category:

| Category | Integrations |
|----------|-------------|
| Accounting | QuickBooks Online, QuickBooks Desktop, Xero, Sage, FreshBooks, Viewpoint |
| Design | Chief Architect, AutoCAD, Revit, SketchUp |
| Scheduling | Google Calendar, Outlook Calendar, iCal |
| Communication | Slack, Microsoft Teams, Gmail, Outlook |
| Storage | Google Drive, Dropbox, OneDrive, Box |
| Automation | Zapier, Make (Integromat), n8n |
| Lending | Builder Finance, Construction Loan Pro |
| Suppliers | 84 Lumber, ABC Supply, Ferguson |
| Estimation | RSMeans, Craftsman National |
| CRM | HubSpot, Salesforce |
| Payment | Stripe, Square, ACH providers |
| Inspection | third-party inspection platforms |

Each integration listing includes: description, screenshots, setup guide, permissions required, pricing (free/paid), reviews, install count.

### Zapier / Make Connector

- Triggers: new project, invoice approved, schedule updated, change order created, etc.
- Actions: create project, add vendor, create invoice line item, update schedule task, etc.
- Searches: find project, find vendor, find invoice
- Enables no-code automation for builders without developer resources

### Developer Portal

- API documentation with interactive "Try It" console
- SDK downloads (JavaScript, Python, C#)
- Webhook testing tool (send test events to development URL)
- App submission and review process for marketplace listing
- Developer forum and support
- Revenue sharing for paid integrations (70/30 developer/platform split)

### Vendor Network

- Vendor directory searchable by: trade, location (zip + radius), rating, availability, insurance status
- Vendor profiles: services, service area, insurance, license, portfolio photos
- Cross-tenant ratings: aggregated from all builders who've worked with vendor (anonymized sources)
- Vendor premium listing: featured placement, enhanced profile, response guarantee
- Vendor dispute workflow: vendor can flag a review, mediation period, platform decision

---

## Database Tables

```
api_keys
  id              UUID PK
  builder_id      UUID FK -> builders
  name            VARCHAR(100)
  key_hash        VARCHAR(64)  -- SHA-256 of the API key
  key_prefix      VARCHAR(8)   -- first 8 chars for identification
  scopes          TEXT[]       -- ['read:projects', 'write:invoices']
  rate_limit      INT          -- requests per minute
  last_used_at    TIMESTAMPTZ NULL
  expires_at      TIMESTAMPTZ NULL
  is_active       BOOLEAN DEFAULT true
  created_at      TIMESTAMPTZ

oauth_applications
  id              UUID PK
  developer_id    UUID FK -> users
  name            VARCHAR(200)
  description     TEXT
  client_id       VARCHAR(64) UNIQUE
  client_secret_hash VARCHAR(64)
  redirect_uris   TEXT[]
  scopes          TEXT[]
  logo_url        TEXT NULL
  homepage_url    TEXT NULL
  is_published    BOOLEAN DEFAULT false  -- listed in marketplace
  is_approved     BOOLEAN DEFAULT false  -- reviewed by platform team
  install_count   INT DEFAULT 0
  created_at      TIMESTAMPTZ

oauth_authorizations
  id              UUID PK
  builder_id      UUID FK -> builders
  application_id  UUID FK -> oauth_applications
  user_id         UUID FK -> users  -- who authorized
  scopes_granted  TEXT[]
  access_token_hash VARCHAR(64)
  refresh_token_hash VARCHAR(64)
  access_expires_at  TIMESTAMPTZ
  refresh_expires_at TIMESTAMPTZ
  revoked_at      TIMESTAMPTZ NULL
  created_at      TIMESTAMPTZ

webhook_subscriptions
  id              UUID PK
  builder_id      UUID FK -> builders
  url             TEXT
  events          TEXT[]  -- ['project.created', 'invoice.approved']
  secret_hash     VARCHAR(64)  -- for HMAC signing
  is_active       BOOLEAN DEFAULT true
  failure_count   INT DEFAULT 0
  disabled_at     TIMESTAMPTZ NULL
  created_at      TIMESTAMPTZ

webhook_deliveries
  id              UUID PK
  subscription_id UUID FK -> webhook_subscriptions
  event_type      VARCHAR(100)
  payload         JSONB
  response_status INT NULL
  response_body   TEXT NULL
  delivered_at    TIMESTAMPTZ NULL
  next_retry_at   TIMESTAMPTZ NULL
  attempt_count   INT DEFAULT 0

integration_listings
  id              UUID PK
  name            VARCHAR(200)
  slug            VARCHAR(100) UNIQUE
  category        VARCHAR(50)
  description     TEXT
  long_description TEXT
  screenshots     TEXT[]
  setup_guide_url TEXT
  developer_id    UUID FK -> users NULL  -- NULL = platform-maintained
  application_id  UUID FK -> oauth_applications NULL
  pricing_type    VARCHAR(20)  -- 'free', 'paid', 'freemium'
  price_monthly   DECIMAL(10,2) NULL
  install_count   INT DEFAULT 0
  avg_rating      DECIMAL(3,2) DEFAULT 0
  is_featured     BOOLEAN DEFAULT false
  is_active       BOOLEAN DEFAULT true
  created_at      TIMESTAMPTZ

integration_installs
  id              UUID PK
  builder_id      UUID FK -> builders
  listing_id      UUID FK -> integration_listings
  installed_at    TIMESTAMPTZ
  config          JSONB  -- integration-specific settings
  status          VARCHAR(20)  -- 'active', 'paused', 'error'
  last_sync_at    TIMESTAMPTZ NULL

integration_reviews
  id              UUID PK
  listing_id      UUID FK -> integration_listings
  builder_id      UUID FK -> builders
  rating          INT CHECK (rating BETWEEN 1 AND 5)
  review_text     TEXT NULL
  created_at      TIMESTAMPTZ

vendor_directory_profiles
  id              UUID PK
  vendor_id       UUID  -- cross-tenant vendor identifier
  company_name    VARCHAR(200)
  trades          TEXT[]
  service_area    JSONB  -- {zip_codes: [], radius_miles: 50}
  license_number  VARCHAR(100) NULL
  insurance_verified BOOLEAN DEFAULT false
  portfolio_images TEXT[]
  is_premium      BOOLEAN DEFAULT false
  avg_rating      DECIMAL(3,2) DEFAULT 0
  total_reviews   INT DEFAULT 0
  created_at      TIMESTAMPTZ

vendor_cross_tenant_ratings
  id              UUID PK
  vendor_profile_id UUID FK -> vendor_directory_profiles
  builder_id      UUID FK -> builders  -- anonymized in display
  rating          INT CHECK (rating BETWEEN 1 AND 5)
  review_text     TEXT NULL
  is_disputed     BOOLEAN DEFAULT false
  dispute_status  VARCHAR(20) NULL  -- 'open', 'under_review', 'resolved'
  created_at      TIMESTAMPTZ
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/marketplace/integrations` | Browse integration directory |
| GET | `/api/v1/marketplace/integrations/:slug` | Get integration details |
| POST | `/api/v1/marketplace/integrations/:slug/install` | Install an integration |
| DELETE | `/api/v1/marketplace/integrations/:slug/uninstall` | Uninstall |
| POST | `/api/v1/marketplace/integrations/:slug/review` | Leave a review |
| GET | `/api/v1/api-keys` | List API keys for builder |
| POST | `/api/v1/api-keys` | Create a new API key |
| DELETE | `/api/v1/api-keys/:id` | Revoke an API key |
| GET | `/api/v1/webhooks` | List webhook subscriptions |
| POST | `/api/v1/webhooks` | Create webhook subscription |
| PUT | `/api/v1/webhooks/:id` | Update webhook |
| DELETE | `/api/v1/webhooks/:id` | Delete webhook |
| GET | `/api/v1/webhooks/:id/deliveries` | Get delivery log |
| POST | `/api/v1/webhooks/:id/test` | Send test event |
| GET | `/api/v1/oauth/authorize` | OAuth authorization screen |
| POST | `/api/v1/oauth/token` | Exchange code for token |
| POST | `/api/v1/oauth/revoke` | Revoke OAuth token |
| GET | `/api/v1/oauth/authorized-apps` | List authorized third-party apps |
| GET | `/api/v1/vendor-directory` | Search vendor directory |
| GET | `/api/v1/vendor-directory/:id` | Get vendor profile |
| POST | `/api/v1/vendor-directory/:id/review` | Rate a vendor |
| POST | `/api/v1/vendor-directory/:id/dispute` | Dispute a review |
| GET | `/api/v1/developer/apps` | Developer: list my apps |
| POST | `/api/v1/developer/apps` | Developer: register new app |
| POST | `/api/v1/developer/apps/:id/submit` | Developer: submit for marketplace review |

---

## Dependencies

- **Module 1: Auth & Access** -- API authentication, OAuth2 provider
- **Module 3: Core Data Model** -- API exposes all core entities
- **Module 43: Subscription Billing** -- API tier rate limits, paid integrations
- **Module 48: Template Marketplace** -- template listings within marketplace
- **Module 5: Notification Engine** -- webhook event dispatch
- **Stripe Connect** -- payment processing for paid integrations (developer revenue share)

---

## Open Questions

1. Should the API be publicly available at launch, or start as partner-only with a waitlist?
2. What is the revenue share split for paid third-party integrations? (Proposed: 70/30 developer/platform)
3. Should vendor ratings be opt-in per builder, or automatic for all builders?
4. How do we handle vendor privacy across tenants -- can vendors see which builders rated them?
5. Should the Zapier/Make connector be free for all plans or a paid add-on?
6. How do we handle API breaking changes -- strict semver or feature flags?
7. Should we build an iPaaS (integration platform) or rely solely on Zapier/Make for no-code users?
