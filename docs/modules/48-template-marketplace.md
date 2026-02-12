# Module 48: Template Marketplace

**Phase:** 6 - Scale & Sell
**Status:** SPEC COMPLETE
**Covers Gap Items:** 144-148 (Section 5: Template & Content Marketplace)

---

## Overview

The Template Marketplace creates network effects by enabling builders, consultants, and the platform team to share and sell reusable templates. Template types include estimate templates, schedule templates, checklist/punch list templates, contract clause libraries, report templates, workflow configurations, and cost code structures. The marketplace supports free and paid templates, community ratings and reviews, regional template packs, version management, and one-click installation. This is both a value accelerator (new builders start with proven templates) and a revenue opportunity (paid templates, professional services).

---

## Gap Items Addressed

| Gap # | Description | How Addressed |
|-------|-------------|---------------|
| 144 | Builders share/sell estimate templates, checklists, workflows | Publisher accounts for any builder; listing with pricing, preview, install |
| 145 | Industry-standard templates maintained by platform team | Curated "Official" template library with platform-team branding and quality guarantee |
| 146 | Consultants create and sell templates | Consultant publisher accounts with revenue share; verified consultant badge |
| 147 | Regional template packs (Florida-specific, Texas-specific) | Geographic tagging on templates; browse by state/region; regional bundle packs |
| 148 | Builders hire platform team for custom templates | Professional services listing: "Request Custom Template" with quote workflow |

---

## Detailed Requirements

### Template Types

| Template Type | Description | Source Module |
|--------------|-------------|---------------|
| Estimate Template | Pre-built cost code structure with line items, assemblies, and default pricing | Module 20: Estimating |
| Schedule Template | Phase/task structure with durations, dependencies, and resource assignments | Module 7: Scheduling |
| Checklist Template | Inspection checklists, punch lists, quality checklists by phase/trade | Module 22: Punch Lists |
| Contract Template | Contract clauses, full contract documents, state-specific language | Module 12: Contracts |
| Report Template | Custom report layouts with configurable metrics and visualizations | Module 25: Reporting |
| Workflow Template | Approval workflows, notification rules, status progression configs | Module 2: Configuration |
| Cost Code Library | Full cost code hierarchies (CSI, custom, hybrid) | Module 2: Configuration |
| Selection Template | Selection categories, allowance structures, vendor/product catalogs | Module 18: Selections |
| Specification Template | Construction specifications organized by division/section | Module 15: Documents |

### Marketplace Browsing

- **Categories**: Organized by template type (see above)
- **Filters**: Type, region, construction type (custom, production, remodel), price (free/paid), rating, publisher
- **Search**: Full-text search across template name, description, tags, publisher
- **Sort**: Most popular, highest rated, newest, price (low-high / high-low)
- **Featured section**: Staff picks, trending this month, new arrivals

### Template Listing Page

Each template listing includes:
- Title, description, detailed overview
- Publisher info (builder, consultant, or platform team) with publisher rating
- Screenshots/preview of template structure
- Template type, region tags, construction type tags
- Price (free or USD amount)
- Install count, average rating, number of reviews
- Version history with changelog
- Compatibility info (which modules required)
- "Preview" button: see template structure without installing
- "Install" button: one-click add to builder's account

### Template Preview

- Read-only view of template structure (e.g., cost code hierarchy, checklist items, schedule phases)
- For estimate templates: sample line items with placeholder pricing
- For schedule templates: Gantt preview with task durations
- Preview does not require installation or payment

### One-Click Installation

1. Builder clicks "Install" (or "Purchase" for paid)
2. System checks module compatibility (e.g., estimate template requires Estimating module active)
3. For paid templates: payment processed via Stripe (Module 43)
4. Template data copied into builder's account as a new template
5. Builder can customize the installed template (their copy is independent of the original)
6. Notification to publisher: "Your template was installed by [anonymous]"

### Publisher Accounts

**Builder Publishers:**
- Any builder can publish templates they've created
- Templates are reviewed by platform team before listing (quality check)
- Builders set pricing (free or paid)
- Revenue share for paid templates: 70% publisher / 30% platform

**Consultant Publishers:**
- Consultant accounts verified by platform team
- Enhanced publisher profile: bio, credentials, portfolio
- "Verified Consultant" badge on listings
- Can offer template bundles (e.g., "Complete Luxury Home Package")
- Revenue share: 70/30

**Platform Team (Official):**
- "Official" badge on all platform-published templates
- Free templates included with platform subscription
- Premium template packs available as paid add-ons

### Regional Template Packs (Gap #147)

- Templates tagged by applicable region (state, climate zone, or custom region)
- Regional bundles: "Florida Builder Starter Pack" includes FL-specific contracts, checklists, permit templates
- Regional compliance templates: state-specific lien waiver forms, insurance requirements, code checklists
- Builder can filter marketplace by their operating region(s)

### Ratings & Reviews

- 1-5 star rating with written review
- Reviews visible on listing page
- Publisher can respond to reviews
- Verified purchase badge on reviews (only builders who installed can review)
- Flag inappropriate reviews for moderation

### Version Management

- Publishers can update templates (new version)
- Existing installations are NOT auto-updated (builder's copy is independent)
- Notification to installers: "A new version of [template] is available"
- Builder can choose to install update (creates new copy) or keep current version
- Changelog required for each version update

### Professional Services (Gap #148)

- "Request Custom Template" button in marketplace
- Builder submits request: description, template type, budget, timeline
- Request routed to platform professional services team
- Quote generated and sent to builder
- Completed custom template optionally published to marketplace (with builder's consent)

---

## Database Tables

```
marketplace_templates
  id              UUID PK
  publisher_id    UUID FK -> users
  publisher_type  VARCHAR(20)  -- 'builder', 'consultant', 'platform'
  template_type   VARCHAR(30)  -- 'estimate', 'schedule', 'checklist', etc.
  name            VARCHAR(200)
  slug            VARCHAR(200) UNIQUE
  description     TEXT
  long_description TEXT
  screenshots     TEXT[]
  tags            TEXT[]
  region_tags     TEXT[]  -- ['FL', 'TX', 'southeast']
  construction_tags TEXT[]  -- ['custom', 'production', 'remodel']
  price           DECIMAL(10,2) DEFAULT 0  -- 0 = free
  currency        VARCHAR(3) DEFAULT 'USD'
  template_data   JSONB  -- the actual template content
  required_modules TEXT[]  -- ['estimating', 'scheduling']
  version         VARCHAR(20) DEFAULT '1.0.0'
  install_count   INT DEFAULT 0
  avg_rating      DECIMAL(3,2) DEFAULT 0
  review_count    INT DEFAULT 0
  review_status   VARCHAR(20)  -- 'pending', 'approved', 'rejected'
  is_featured     BOOLEAN DEFAULT false
  is_active       BOOLEAN DEFAULT true
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

marketplace_template_versions
  id              UUID PK
  template_id     UUID FK -> marketplace_templates
  version         VARCHAR(20)
  changelog       TEXT
  template_data   JSONB
  published_at    TIMESTAMPTZ

marketplace_installs
  id              UUID PK
  template_id     UUID FK -> marketplace_templates
  template_version VARCHAR(20)
  builder_id      UUID FK -> builders
  installed_by    UUID FK -> users
  installed_at    TIMESTAMPTZ
  payment_id      UUID NULL FK -> billing_events  -- for paid templates

marketplace_reviews
  id              UUID PK
  template_id     UUID FK -> marketplace_templates
  builder_id      UUID FK -> builders
  user_id         UUID FK -> users
  rating          INT CHECK (rating BETWEEN 1 AND 5)
  review_text     TEXT NULL
  publisher_response TEXT NULL
  is_verified_purchase BOOLEAN DEFAULT true
  is_flagged      BOOLEAN DEFAULT false
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

marketplace_publishers
  id              UUID PK
  user_id         UUID FK -> users
  publisher_type  VARCHAR(20)
  display_name    VARCHAR(200)
  bio             TEXT NULL
  credentials     TEXT NULL
  profile_image   TEXT NULL
  is_verified     BOOLEAN DEFAULT false
  total_installs  INT DEFAULT 0
  avg_rating      DECIMAL(3,2) DEFAULT 0
  revenue_share_pct INT DEFAULT 70
  stripe_connect_id VARCHAR(100) NULL  -- for payouts
  created_at      TIMESTAMPTZ

marketplace_bundles
  id              UUID PK
  publisher_id    UUID FK -> marketplace_publishers
  name            VARCHAR(200)
  description     TEXT
  templates       UUID[]  -- FK to marketplace_templates
  bundle_price    DECIMAL(10,2)  -- discounted vs. individual
  region_tags     TEXT[]
  is_active       BOOLEAN DEFAULT true

professional_service_requests
  id              UUID PK
  builder_id      UUID FK -> builders
  requested_by    UUID FK -> users
  template_type   VARCHAR(30)
  description     TEXT
  budget_range    VARCHAR(50) NULL
  timeline        VARCHAR(50) NULL
  status          VARCHAR(20)  -- 'submitted', 'quoted', 'accepted', 'in_progress', 'delivered'
  quote_amount    DECIMAL(10,2) NULL
  quote_details   TEXT NULL
  delivered_at    TIMESTAMPTZ NULL
  created_at      TIMESTAMPTZ
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/marketplace/templates` | Browse templates (with filters, search, sort) |
| GET | `/api/v1/marketplace/templates/:slug` | Get template listing details |
| GET | `/api/v1/marketplace/templates/:slug/preview` | Preview template structure |
| POST | `/api/v1/marketplace/templates/:slug/install` | Install (or purchase + install) template |
| GET | `/api/v1/marketplace/templates/:slug/reviews` | Get reviews for a template |
| POST | `/api/v1/marketplace/templates/:slug/reviews` | Submit a review |
| GET | `/api/v1/marketplace/bundles` | List template bundles |
| GET | `/api/v1/marketplace/bundles/:id` | Get bundle details |
| POST | `/api/v1/marketplace/bundles/:id/install` | Install all templates in a bundle |
| GET | `/api/v1/marketplace/my-installs` | List templates installed by current builder |
| GET | `/api/v1/marketplace/publishers/:id` | Get publisher profile |
| POST | `/api/v1/marketplace/publish` | Submit a template for marketplace review |
| PUT | `/api/v1/marketplace/my-templates/:id` | Update a published template (new version) |
| GET | `/api/v1/marketplace/my-templates` | List my published templates |
| POST | `/api/v1/marketplace/professional-services` | Submit custom template request |
| GET | `/api/v1/marketplace/featured` | Get featured templates |
| GET | `/api/v1/marketplace/categories` | Get template categories with counts |
| GET | `/api/v1/admin/marketplace/pending-reviews` | Platform admin: templates awaiting review |
| PUT | `/api/v1/admin/marketplace/templates/:id/approve` | Platform admin: approve template listing |

---

## Dependencies

- **Module 2: Configuration Engine** -- template definitions for cost codes, workflows
- **Module 20: Estimating Engine** -- estimate template import/export format
- **Module 7: Scheduling** -- schedule template import/export format
- **Module 22: Punch Lists & Checklists** -- checklist template format
- **Module 12: Contracts** -- contract template format
- **Module 43: Subscription Billing** -- paid template payment processing
- **Module 45: API Marketplace** -- marketplace infrastructure shared with integrations
- **Stripe Connect** -- publisher payouts for paid templates

---

## Open Questions

1. Should template pricing have a minimum or maximum? (Prevent $0.01 spam or $10,000 price gouging)
2. How do we handle templates that reference modules the installing builder doesn't have? (Install anyway with warning, or block?)
3. Should publishers be able to see who installed their templates? (Privacy vs. feedback concern)
4. How do we handle template plagiarism? (Builder A copies Builder B's template and publishes as their own)
5. Should regional template packs be automatically recommended based on builder's address?
6. What is the review/approval turnaround SLA for submitted templates?
7. Should we support template subscriptions (publisher updates, installer auto-receives) in addition to one-time installs?
