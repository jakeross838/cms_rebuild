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
| 513 | Building department API integrations (auto-submit permits, check status) | Pre-built adapters for municipal permitting APIs (Accela, CityView, etc.) |
| 516 | Construction camera integrations (EarthCam, OpenSpace, Sensera) | Camera platform connectors for auto-import of time-lapse and site photos |
| 517 | Drone service integrations (DroneDeploy, Skydio) | Drone survey data import (orthomosaics, elevation models, progress photos) |
| 519 | Equipment rental company integrations (auto-track rental billing) | Rental platform connectors for start/stop tracking and invoice automation |
| 1086 | Bank feed integration — auto-import transactions for reconciliation | Bank Feed Integrations |
| 1087 | Credit card feed — auto-capture receipts, match to cardholders, route for coding | Credit Card Feed Integrations |
| 1091 | Appliance dealer integration (Ferguson, Yale) — selections, pricing, delivery | Appliance Dealer Integrations |
| 1092 | Title company integration — draw docs, lien waivers, closing docs | Title Company Integrations |
| 1093 | Surveyor integration — receive digital survey data directly | Surveyor Data Integrations |
| 1094 | Energy modeling tools — HERS rating, Manual J/D calculations | Energy Modeling Integrations |
| 1095 | Smart home platform integration (Savant, Control4, Crestron) — specs, pre-wire docs | Smart Home Platform Integrations |
| 1096 | Dumpster/portable toilet vendor — automated scheduling by construction phase | Site Services Integrations |
| 1098 | State contractor licensing databases — auto-verify vendor licenses | License Verification Integrations |
| 1099 | FEMA flood map API — auto-determine flood zone from project address | Geospatial Data Integrations |
| 1100 | NOAA weather API — historical weather for schedule intelligence, real-time forecasts | Weather API Integrations |
| 1101 | Tide data API — for coastal builders, schedule work around tides | Weather API Integrations |
| 1102 | Building code database — ICC codes with jurisdiction-specific amendments | Code Reference Integrations |
| 1103 | Email integration — forward emails to system, auto-file to project/vendor via AI | Email Integration |

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
| Banking | Plaid (bank feeds), credit card feeds |
| Appliances | Ferguson, Yale Appliance, AJ Madison |
| Title | title company document exchange portals |
| Surveying | LandXML, DXF/DWG survey data import |
| Energy | REM/Rate, EnergyGauge, Ekotrope, WUFI |
| Smart Home | Savant, Control4, Crestron, Lutron |
| Site Services | dumpster, portable toilet, temp power providers |
| Licensing | state contractor licensing databases (all 50 states) |
| Geospatial | FEMA flood maps, county GIS, Google Maps/Mapbox |
| Weather | NOAA forecasts, tide data APIs |
| Building Codes | ICC Digital Codes, UpCodes, MuniCode |
| Email | project-specific inbound email routing (IMAP/SMTP) |

Each integration listing includes: description, screenshots, setup guide, permissions required, pricing (free/paid), reviews, install count.

### Financial Feed Integrations (Gaps 1086, 1087)

**Bank Feed Integration (Gap 1086):**
- Auto-import bank transactions for reconciliation against invoiced/paid items
- Supported providers: Plaid (aggregator covering most US banks), MX, Yodlee
- Two-way matching: imported transactions auto-matched to recorded payments by amount, date, and payee name
- Unmatched transactions flagged for manual coding (job, cost code, vendor)
- Builder configures which bank accounts to connect and which projects/cost codes to map
- Daily auto-sync with manual refresh option
- Security: bank credentials stored by the aggregator (Plaid), not by the platform; OAuth-based authentication

**Credit Card Feed Integration (Gap 1087):**
- Auto-capture transactions from company credit/debit cards
- Match transactions to cardholders (each card linked to a platform user)
- Route each transaction for job cost coding: AI suggests job and cost code based on merchant name, amount, and cardholder's active projects
- Integrate with receipt capture (Module 13 Receipt Processing): match uploaded receipt photos to card transactions by amount and date
- Support split coding: single transaction allocated across multiple jobs or cost codes
- Monthly reconciliation report: all card transactions with coding status (coded, pending, disputed)

### Appliance & Specialty Dealer Integrations (Gap 1091)

- Connect to appliance dealer platforms (Ferguson, Yale Appliance, AJ Madison, Pacific Sales) for:
  - Selection catalog browsing within the selections module (Module 21)
  - Real-time pricing and availability lookup
  - Delivery scheduling synced with the project schedule
  - Order status tracking (ordered, shipped, delivered, installed)
- Link appliance selections to budget allowance lines for automatic budget tracking
- Auto-populate appliance specifications (dimensions, utility requirements, warranty info) into the project spec book

### Title Company Integration (Gap 1092)

- Share draw documentation and lien waiver packages with title companies electronically
- Support common title company platforms and portals
- Auto-format draw packages to meet title company requirements (varies by company)
- Receive closing document packages from title companies into the project document repository
- Track title insurance, closing dates, and document completeness status

### Surveyor Data Integration (Gap 1093)

- Receive digital survey data directly from surveyor platforms or standard file formats (DXF, DWG, CSV, LandXML)
- Import boundary surveys, topographic surveys, ALTA surveys, and as-built surveys
- Auto-link survey data to the project record and document repository
- Extract key data points: lot dimensions, setback distances, elevation data, easements, utility locations
- Display survey overlay on site plan within the project dashboard

### Energy Modeling Integrations (Gap 1094)

- Connect to energy modeling tools (REM/Rate, EnergyGauge, Ekotrope, WUFI) for:
  - HERS rating data import (projected and tested ratings)
  - Manual J (heating/cooling load) and Manual D (duct design) calculation results
  - Blower door and duct leakage test results
- Link energy performance data to the permit and inspection tracking module (Module 32)
- Include energy compliance documentation in the O&M manual assembly (Module 28)

### Smart Home Platform Integration (Gap 1095)

- Connect to smart home platforms (Savant, Control4, Crestron, Lutron, Josh.ai) for:
  - System specification documents imported into the project document repository
  - Pre-wire documentation (wire schedules, outlet locations, conduit paths) linked to the electrical scope
  - Equipment lists with pricing fed into the selections and budget modules
  - Installation scheduling synced with the project schedule
- Track smart home system scope as a distinct budget division with its own cost codes

### Site Services Integration (Gap 1096)

- Connect to dumpster and portable toilet providers for automated scheduling based on construction phase:
  - Auto-request dumpster delivery at demolition, framing, drywall, and final clean phases
  - Auto-request portable toilet delivery at project start and removal at substantial completion
  - Track rental periods and auto-allocate costs to the appropriate project and cost code
  - Schedule size changes based on phase (larger dumpster during framing, smaller during finish)
- Support scheduling of other site services: temporary power, temporary fencing, site security

### License & Compliance Verification Integrations (Gap 1098)

- Connect to state contractor licensing databases for real-time license verification:
  - Auto-verify vendor license numbers are active and in good standing
  - Check for disciplinary actions, complaints, or bond claims
  - Monitor license expiration dates and trigger renewal alerts
  - Support all 50 states (licensing databases vary widely in API availability)
- For states without API access: support manual verification with a link to the state licensing board website
- Store verification results in the vendor compliance module (Module 10) with verification date and status

### Geospatial Data Integrations (Gap 1099)

- **FEMA Flood Map API**: auto-determine flood zone designation from project address
  - Display flood zone on project summary (Zone X, AE, VE, etc.)
  - Flag projects in high-risk zones requiring flood insurance and elevated construction
  - Link to FEMA flood map viewer for detailed review
- **County GIS systems**: where available, pull parcel data (lot dimensions, zoning, setbacks, land use)
- **Google Maps / Mapbox**: project location mapping, driving directions for field staff, distance-based vendor search

### Weather & Environmental API Integrations (Gaps 1100, 1101)

- **NOAA Weather API (Gap 1100)**:
  - Historical weather data for schedule intelligence (Section 4.1 of AI Engine Design)
  - Real-time forecasts for daily operations (10-day forecast overlay on schedule)
  - Severe weather alerts pushed to project teams
  - Historical precipitation data for construction delay documentation
- **Tide Data API (Gap 1101)**:
  - For coastal builders: tide schedules integrated into the project schedule
  - Auto-flag concrete pours, foundation work, and waterfront construction that must be scheduled around tidal cycles
  - King tide and storm surge alerts for waterfront project sites

### Building Code Reference Integration (Gap 1102)

- Connect to building code databases (ICC Digital Codes, UpCodes, MuniCode) for:
  - Jurisdiction-specific code lookup from project address
  - Code section references linkable to inspection checklists and RFIs
  - Automatic identification of applicable code amendments by jurisdiction
  - Code change tracking: alert builders when jurisdictions adopt new code editions that affect active projects

### Email Integration (Gap 1103)

- Forward emails to the system via a project-specific email address (e.g., `AMI-103@inbox.rossos.com`)
- AI auto-files emails to the correct project based on: project reference in subject/body, sender's email matched to a vendor or client, and content analysis
- Extract attachments and route through the AI processing layer (invoices, plans, COIs, lien waivers auto-classified and processed)
- Full email thread preserved in the project communication log
- Reply from the platform maintains the email thread
- Support for BCC-based email logging (builder BCCs the platform on outgoing emails)

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

### Edge Cases & What-If Scenarios

1. **Buggy third-party integration causing user problems.** When a third-party integration listed in the marketplace malfunctions (crashes, corrupts data, causes performance degradation, or sends incorrect data), the platform must be able to respond quickly to protect users. The system must support: automatic health monitoring for installed integrations (track error rates, response times, and failure patterns per integration), circuit-breaker pattern that auto-disables an integration after a configurable failure threshold (e.g., 5 consecutive failures), immediate admin kill-switch to disable a faulty integration across all tenants, automatic notification to all builders who have the integration installed ("Integration X has been temporarily disabled due to a known issue"), and a clear incident history per integration visible on its marketplace listing. The developer who built the integration must also be notified immediately to fix the issue.

2. **Popular integration acquired or changes its API.** When a widely-used external service (e.g., an accounting platform, supplier portal, or scheduling tool) is acquired by another company, deprecates its API, or makes breaking changes, the platform must adapt quickly to prevent disruption for builders. The system must maintain an integration health dashboard that tracks API version compatibility and deprecation timelines for all active integrations. When a breaking change is detected or announced, the platform team must be alerted immediately, and affected builders must receive advance notice with a timeline for migration. The integration abstraction layer must support running two versions of an adapter simultaneously during transition periods (old API and new API) so builders can migrate at their own pace within a defined window.

3. **Developer experience quality for ecosystem growth.** A thriving integration ecosystem depends on third-party developers being able to build, test, and publish integrations efficiently. The API and developer portal must provide: comprehensive OpenAPI 3.0 documentation with interactive "Try It" examples for every endpoint, sandbox environments where developers can test against realistic (but fake) data without affecting any tenant, clear and fast app review process with published review criteria and SLA (target: 5 business days from submission to approval/feedback), SDK libraries in popular languages (JavaScript, Python, C#) that are kept up-to-date with API changes, and a developer forum with active platform team participation. Developer satisfaction should be tracked as a metric, and documentation quality should be measured via "Was this helpful?" feedback on every page.

### Construction-Specific Integrations (GAP-513, GAP-516, GAP-517, GAP-519)

The following construction-industry-specific integrations must be prioritized in the integration directory:

- **Building department API integrations** (GAP-513): where municipalities offer electronic permitting APIs (e.g., Accela, CityView, eTRAKiT, OpenGov), the platform must support auto-submission of permit applications and real-time status checking. Required behavior: (a) maintain a registry of known electronic permitting jurisdictions and their API endpoints, (b) support auto-population of permit application fields from project data, (c) poll for permit status updates and reflect them in the permitting module (Module 32), (d) for jurisdictions without APIs, the integration falls back to manual entry with optional email-based status tracking, and (e) the jurisdiction registry is community-maintained -- builders can report new electronic permitting jurisdictions for the platform team to add.
- **Construction camera integrations** (GAP-516): integrate with job site camera systems (EarthCam, OpenSpace, Sensera, TrueLook, OxBlue) to: auto-import time-lapse photos into the project photo gallery, link camera footage to daily log entries by date, provide a live camera feed widget on the project dashboard (where the camera service offers a web embed), and auto-tag imported camera photos using the AI photo tagging engine (Module 24). Camera integrations are data consumers only -- the platform does not control camera hardware.
- **Drone service integrations** (GAP-517): integrate with drone survey platforms (DroneDeploy, Skydio, Pix4D, Propeller Aero) to: auto-import site survey data (orthomosaic maps, elevation models, volumetric measurements) into the project document repository, link drone survey data to specific schedule milestones for progress tracking, overlay drone imagery on site plans for visual progress comparison, and import drone-captured photos into the photo gallery with automatic GPS-based location tagging.
- **Equipment rental company integrations** (GAP-519): integrate with equipment rental platforms (United Rentals, Sunbelt Rentals, BlueLine Rental) to: auto-track rental start/stop dates and billing for cost allocation to projects, receive electronic invoices for rented equipment that feed into the invoice processing pipeline (Module 13), alert PMs when rental periods are approaching end dates to prevent unplanned extensions, and sync rental equipment data with the equipment tracking module (Module 35) for a unified view of owned and rented equipment.

#### Edge Cases & What-If Scenarios

1. **Building department API availability and reliability.** Municipal APIs are notoriously unreliable -- they may go offline without notice, change data formats, or have long response times. The platform must not block the permit workflow when a building department API is unavailable. Required behavior: when an API call fails, the system must queue the request for retry (exponential backoff, max 24 hours), notify the user that the electronic submission failed and provide a manual fallback option, and log all API interactions for debugging jurisdiction-specific issues. The integration must be designed to gracefully degrade -- if the API is down for extended periods, the user can proceed with manual permit tracking without data loss.

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
