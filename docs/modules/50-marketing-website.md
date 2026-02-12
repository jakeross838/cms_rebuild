# Module 50: Marketing Website & Sales Pipeline

**Phase:** 6 - Scale & Sell
**Status:** SPEC COMPLETE
**Covers Gap Items:** 170-172, 179-181 (Section 7: Platform Operations -- public-facing), 569-573 (Section 40: Marketing & Business Development)

---

## Overview

The Marketing Website is the front door to the SaaS business. It handles customer acquisition from first visit to signed subscription. This module covers the public marketing site (landing pages, pricing, features), demo booking, free trial signup, customer testimonials and case studies, blog/content marketing for SEO, conversion tracking and analytics, and the internal sales pipeline for managing leads from "Contact Sales" through to closed Enterprise deals. The marketing website is a separate deployment from the application but deeply integrated with the onboarding and billing systems.

---

## Gap Items Addressed

### Platform Operations -- Public-Facing (Section 7)

| Gap # | Description | How Addressed |
|-------|-------------|---------------|
| 170 | Platform health monitoring -- public perception | Status page link in website footer; uptime badge on pricing page builds trust |
| 171 | Deployment strategy -- marketing site updates | Marketing site on separate CI/CD pipeline; independent of app deployments |
| 172 | Platform updates affecting customer workflows | Changelog/release notes page on marketing site; builds transparency and trust |
| 179 | Release cadence communication | Public release notes page with RSS feed; linked from marketing site |
| 180 | Beta features communication | "Beta Program" page for early adopter signup |
| 181 | Status page for system health | Status page (status.platform.com) linked from marketing site footer |

### Marketing & Business Development (Section 40)

| Gap # | Description | How Addressed |
|-------|-------------|---------------|
| 569 | Marketing tracking -- platform or external tools? | Hybrid: marketing site built with analytics hooks; HubSpot/Mailchimp for email campaigns |
| 570 | Project portfolio/showcase for marketing | Case study pages with project photos, specs, builder testimonials |
| 571 | Client testimonial/review collection | Automated testimonial request at post-onboarding milestone; displayed on marketing site |
| 572 | Referral program management | Referral landing page: unique referral links, tracking, reward status |
| 573 | Competitive win/loss analysis | Sales pipeline captures win/loss reasons; informs marketing messaging |

---

## Detailed Requirements

### Marketing Site Architecture

The marketing site is a **separate application** from the SaaS platform, optimized for:
- Fast page loads (static generation where possible)
- SEO performance
- Conversion optimization
- Independent deployment cadence

**Recommended Tech Stack:** Next.js (static generation + dynamic routes), deployed on Vercel or Cloudflare Pages, with headless CMS (Sanity, Contentful, or Strapi) for content management.

### Page Structure

**Top-Level Pages:**

| Page | Purpose | Key Content |
|------|---------|-------------|
| Home | First impression, value proposition | Hero, feature highlights, testimonials, CTA |
| Features | Detailed feature breakdown | Feature cards by module, screenshots, comparison to competitors |
| Pricing | Plan comparison, conversion | Plan tiers table, feature comparison, FAQ, CTA per tier |
| Demo | Book a live demo | Demo scheduling widget (Calendly/HubSpot), self-guided demo option |
| Case Studies | Social proof | Builder success stories with metrics, photos, quotes |
| Blog | SEO content marketing | Industry articles, product updates, best practices |
| About | Company story and trust | Team, mission, company backstory, construction industry credibility |
| Contact | Sales and support inquiries | Contact form, phone, email, office address |
| Changelog | Release transparency | Versioned release notes with feature descriptions |
| Status | System reliability proof | Link to status.platform.com |
| Referral | Referral program | How it works, unique link generation, reward tracking |
| Beta | Early adopter program | Feature previews, signup form, beta community info |

### Pricing Page (Gap #110)

**Public Pricing Display:**

| | Starter | Professional | Business | Enterprise |
|---|---------|-------------|----------|------------|
| Price | $99/mo | $299/mo | $699/mo | Contact Sales |
| Users | 3 | 10 | 25 | Unlimited |
| Projects | 5 | 20 | Unlimited | Unlimited |
| Modules | Core | Core + Standard | All | All + Custom |
| Support | Email | Email + Chat | Priority | Dedicated CSM |
| API | No | Read-only | Full | Full + Custom |
| White-Label | No | No | Basic | Full |

- Annual pricing toggle (shows 2-month discount)
- Feature comparison matrix (expandable)
- "Most Popular" badge on Professional tier
- FAQ section addressing common pricing questions
- "Contact Sales" for Enterprise leads to sales pipeline

### Demo Booking System

- **Self-Guided Demo**: Interactive product tour (no signup required) using sample data environment
- **Live Demo Booking**: Calendar widget (Calendly or HubSpot Meetings) for scheduling with sales team
- **Pre-Demo Questionnaire**: Company size, current tools, pain points (informs demo customization)
- **Demo Follow-Up**: Automated email sequence post-demo with trial CTA

### Free Trial Signup Flow

1. "Start Free Trial" button on any page
2. Signup form: name, email, company name, phone (optional)
3. Email verification
4. Account provisioned -> redirect to Module 41 Onboarding Wizard
5. Trial tracking in Module 43 (14-day trial, Professional features)
6. Conversion prompts at day 3, 7, 12, 14

### Case Studies & Testimonials (Gaps #570, #571)

- **Case Study Template**: Builder name, company size, challenge, solution, results (with metrics), quote, project photos
- **Testimonial Collection**: Automated email to builders after 90-day onboarding milestone: "Would you recommend us?"
- **Display**: Rotating testimonials on home page, dedicated case studies page, industry-specific filtering
- **Video Testimonials**: Builder video interviews embedded on case study pages

### Edge Cases & What-If Scenarios

1. **Marketing website downtime impact on customer acquisition.** The marketing website is the primary customer acquisition channel. If it goes down, no new trials are started, no demos are booked, and no leads are captured. The marketing site must be hosted on infrastructure that is completely separate from the main application platform (e.g., Vercel, Cloudflare Pages, or a separate AWS region) so that a platform outage does not also take down the marketing site. The marketing site should have its own uptime monitoring, alerting, and incident response. A static fallback page must be configured at the CDN level that displays core messaging and a contact phone number in the event of a total site failure. The marketing site's uptime SLA target should be 99.99%.

2. **Traffic spikes from marketing campaigns or viral content.** When a marketing campaign drives a large amount of traffic (product launch, major blog post goes viral, conference keynote mention, competitive comparison article ranks on Google), the marketing site must handle the spike without degradation. The site architecture must be designed for this: static generation for all content pages (no server-side rendering bottlenecks), CDN caching for all assets, edge-optimized deployment (Vercel/Cloudflare), and auto-scaling for any dynamic endpoints (trial signup, demo booking, contact form). The trial signup and onboarding systems (Module 41, Module 43) must also be tested for surge capacity -- a marketing spike that brings 10x normal signups should not break the provisioning pipeline. Load testing for traffic spikes should be part of the marketing site's pre-launch and pre-campaign checklist.

3. **Marketing message consistency with the actual product.** When the marketing website promises features, workflows, or capabilities that do not match the actual product experience, it creates a trust gap that drives churn during the trial period. The system must have a process for ensuring marketing-product alignment: the marketing team must have access to a product changelog and feature status dashboard, marketing copy must be reviewed against actual feature availability before publishing, and any "coming soon" claims on the marketing site must be linked to the product roadmap (Module 49) with realistic timelines. When a feature that is promoted on the marketing site is still in development, the marketing page must clearly indicate its status ("Coming Q2 2026" rather than implying it is available now). Post-trial churn reasons should be analyzed for "feature not as described" signals that indicate marketing-product misalignment.

### Blog / Content Marketing

- **Content Types**: Industry insights, how-to guides, product updates, customer spotlights
- **SEO Strategy**: Target long-tail keywords: "custom home builder software," "construction management for small builders," "residential builder project management"
- **Publishing Cadence**: 2-4 posts per month
- **Content Management**: Headless CMS with draft/review/publish workflow
- **Social Sharing**: Auto-share to LinkedIn, Facebook; Open Graph meta tags

### Conversion Tracking & Analytics

- **Google Analytics 4**: Page views, sessions, conversion events
- **Conversion Events**: Trial signup, demo booked, pricing page view, contact form submitted
- **UTM Tracking**: Campaign attribution for all marketing channels
- **Heatmaps**: Hotjar or Microsoft Clarity for UX optimization
- **A/B Testing**: Landing page variants tested with Google Optimize or built-in framework
- **Funnel Analysis**: Visit -> Pricing View -> Trial Signup -> Onboarding Complete -> Paid Conversion

### Referral Program (Gap #572)

- Referral landing page explains program
- Logged-in builders get unique referral link from their account settings
- Referred builder gets: first month free (or 20% discount for 6 months)
- Referring builder gets: $100 account credit per converted referral
- Tracking: link click -> signup -> trial -> conversion -> credit applied
- Referral dashboard in builder's account (Module 43)

### Sales Pipeline (Enterprise & High-Touch)

For "Contact Sales" leads and large Enterprise opportunities:

**Pipeline Stages:**
1. Lead Captured (form submission, demo request)
2. Qualified (fit confirmed: company size, budget, timeline)
3. Demo Scheduled
4. Demo Completed
5. Proposal Sent
6. Negotiation
7. Closed Won / Closed Lost

**CRM Integration:**
- Leads synced to HubSpot or Salesforce
- Demo activity tracked
- Deal value and close probability tracked
- Win/loss reason captured (Gap #573) -- informs product and marketing
- Automated nurture sequences for leads not ready to buy

---

## Database Tables

```
marketing_leads
  id              UUID PK
  source          VARCHAR(50)  -- 'website_trial', 'demo_request', 'contact_form', 'referral'
  utm_source      VARCHAR(100) NULL
  utm_medium      VARCHAR(100) NULL
  utm_campaign    VARCHAR(100) NULL
  name            VARCHAR(200)
  email           VARCHAR(200)
  company_name    VARCHAR(200)
  phone           VARCHAR(30) NULL
  company_size    VARCHAR(30) NULL  -- '1-5', '6-20', '21-50', '50+'
  current_tools   VARCHAR(200) NULL
  pipeline_stage  VARCHAR(30)  -- 'captured', 'qualified', 'demo_scheduled', etc.
  assigned_to     UUID NULL FK -> users  -- sales rep
  deal_value      DECIMAL(10,2) NULL
  close_probability INT NULL  -- 0-100
  closed_at       TIMESTAMPTZ NULL
  closed_reason   VARCHAR(30) NULL  -- 'won', 'lost_price', 'lost_features', 'lost_competitor', 'lost_timing'
  competitor_name VARCHAR(100) NULL  -- for win/loss analysis
  notes           TEXT NULL
  crm_id          VARCHAR(100) NULL  -- HubSpot/Salesforce ID
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

marketing_referrals
  id              UUID PK
  referrer_builder_id UUID FK -> builders
  referral_code   VARCHAR(20) UNIQUE
  referred_email  VARCHAR(200) NULL
  referred_builder_id UUID NULL FK -> builders
  status          VARCHAR(20)  -- 'link_created', 'clicked', 'signed_up', 'converted'
  referrer_credit DECIMAL(10,2) NULL
  credit_applied  BOOLEAN DEFAULT false
  clicked_at      TIMESTAMPTZ NULL
  signed_up_at    TIMESTAMPTZ NULL
  converted_at    TIMESTAMPTZ NULL
  created_at      TIMESTAMPTZ

testimonials
  id              UUID PK
  builder_id      UUID FK -> builders
  contact_name    VARCHAR(200)
  contact_title   VARCHAR(100)
  company_name    VARCHAR(200)
  quote_text      TEXT
  rating          INT NULL CHECK (rating BETWEEN 1 AND 5)
  video_url       TEXT NULL
  photo_url       TEXT NULL
  is_approved     BOOLEAN DEFAULT false
  is_featured     BOOLEAN DEFAULT false
  display_on      TEXT[]  -- ['home', 'case_studies', 'pricing']
  collected_at    TIMESTAMPTZ
  created_at      TIMESTAMPTZ

case_studies
  id              UUID PK
  builder_id      UUID FK -> builders NULL  -- NULL if anonymized
  title           VARCHAR(300)
  slug            VARCHAR(200) UNIQUE
  company_name    VARCHAR(200)
  company_size    VARCHAR(50)
  challenge       TEXT
  solution        TEXT
  results         TEXT
  metrics         JSONB  -- {time_saved_pct: 30, cost_reduction_pct: 15}
  quote_text      TEXT
  quote_author    VARCHAR(200)
  photos          TEXT[]
  industry_tags   TEXT[]  -- ['luxury', 'production', 'remodel']
  region_tags     TEXT[]
  is_published    BOOLEAN DEFAULT false
  published_at    TIMESTAMPTZ NULL
  created_at      TIMESTAMPTZ

blog_posts
  id              UUID PK
  title           VARCHAR(300)
  slug            VARCHAR(300) UNIQUE
  excerpt         TEXT
  body_html       TEXT
  author_id       UUID FK -> users
  author_name     VARCHAR(200)
  category        VARCHAR(50)  -- 'industry', 'product', 'how_to', 'customer_spotlight'
  tags            TEXT[]
  featured_image  TEXT NULL
  meta_title      VARCHAR(200)  -- SEO
  meta_description VARCHAR(300)  -- SEO
  is_published    BOOLEAN DEFAULT false
  published_at    TIMESTAMPTZ NULL
  view_count      INT DEFAULT 0
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

conversion_events
  id              UUID PK
  event_type      VARCHAR(50)  -- 'page_view', 'pricing_view', 'trial_signup', 'demo_booked', 'contact_submitted'
  visitor_id      VARCHAR(100)  -- anonymous ID (cookie-based)
  lead_id         UUID NULL FK -> marketing_leads
  page_url        TEXT
  referrer_url    TEXT NULL
  utm_source      VARCHAR(100) NULL
  utm_medium      VARCHAR(100) NULL
  utm_campaign    VARCHAR(100) NULL
  metadata        JSONB
  created_at      TIMESTAMPTZ
  -- high-volume; partitioned by month, 24-month retention
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/marketing/leads` | Capture a new lead (contact form, demo request) |
| POST | `/api/v1/marketing/trial-signup` | Free trial signup (creates account + lead) |
| GET | `/api/v1/marketing/case-studies` | List published case studies |
| GET | `/api/v1/marketing/case-studies/:slug` | Get case study content |
| GET | `/api/v1/marketing/blog` | List published blog posts |
| GET | `/api/v1/marketing/blog/:slug` | Get blog post content |
| GET | `/api/v1/marketing/testimonials` | Get approved testimonials for display |
| POST | `/api/v1/marketing/referral/create` | Generate referral link for builder |
| GET | `/api/v1/marketing/referral/status` | Get referral program status for builder |
| POST | `/api/v1/marketing/conversion-event` | Track a conversion event |
| GET | `/api/v1/marketing/changelog` | Get release notes / changelog |
| GET | `/api/v1/admin/marketing/pipeline` | Sales pipeline dashboard |
| GET | `/api/v1/admin/marketing/pipeline/:id` | Lead details |
| PUT | `/api/v1/admin/marketing/pipeline/:id` | Update lead stage/notes |
| GET | `/api/v1/admin/marketing/funnel` | Conversion funnel analytics |
| GET | `/api/v1/admin/marketing/referrals` | Referral program analytics |
| GET | `/api/v1/admin/marketing/win-loss` | Win/loss analysis report |
| GET | `/api/v1/admin/marketing/channel-roi` | Marketing channel ROI |

---

## Dependencies

- **Module 43: Subscription Billing** -- trial signup creates subscription, referral credits applied
- **Module 41: Onboarding Wizard** -- post-signup redirects to wizard
- **Module 49: Platform Analytics** -- conversion funnel data, marketing ROI
- **HubSpot / Salesforce** -- CRM sync for sales pipeline
- **Calendly / HubSpot Meetings** -- demo scheduling
- **Google Analytics 4** -- web analytics
- **Headless CMS** (Sanity / Contentful / Strapi) -- blog and content management
- **Mailchimp / HubSpot** -- email marketing campaigns
- **Vercel / Cloudflare Pages** -- marketing site hosting (separate from app)

---

## Open Questions

1. Should the marketing site be built with the same tech stack (React/Vite) or a separate stack optimized for SEO (Next.js)?
2. Should blog content be managed in a headless CMS or in a simple database with admin UI?
3. What is the sales team structure -- do we need a full CRM (Salesforce) or can HubSpot Free handle initial volume?
4. Should the self-guided demo use a shared sandbox or spin up a per-visitor demo instance?
5. How do we handle international marketing if we expand beyond the US?
6. Should the referral program be tiered (more referrals = bigger rewards)?
7. What is the content marketing budget and who writes the blog posts -- internal team, freelancers, or AI-assisted?
8. Should we offer a "freemium to paid" path in addition to the time-limited trial?
