# Module 37: Marketing & Portfolio

**Phase:** 5 - Full Platform
**Status:** TODO
**Optional Module:** Yes -- builders opt in for marketing tools

---

## Overview

Marketing tools for custom home builders: project portfolio curation, photo galleries and
case study generation, client review/testimonial collection, referral tracking, and
marketing campaign ROI measurement. This module takes the rich project data already in the
platform (photos, specs, budgets, timelines) and transforms it into marketing assets that
help builders win new business.

The module bridges internal project data and external-facing marketing. Builders select
which projects, photos, and details to showcase. The platform generates portfolio pages,
case studies, social media content, and manages the review collection workflow that is
critical for local SEO and reputation building.

---

## Gap Items Addressed

| Gap # | Description | Resolution |
|-------|-------------|------------|
| 569 | Marketing tracking in-platform vs. external tools (HubSpot, Mailchimp integration) | Hybrid: native portfolio and review tools, integration with external email/ad platforms |
| 570 | Project portfolio/showcase for marketing (curated photos, specs, testimonials) | Portfolio builder with selectable projects, curated photo galleries, and project highlights |
| 571 | Client testimonial/review collection (auto-send request at project completion) | Automated review request workflow at project completion; collection on Google, Houzz, platform |
| 572 | Referral program management (track sources, manage fees/gifts) | Referral tracking with source attribution, fee/gift management, and referral conversion analytics |
| 573 | Competitive win/loss analysis (why did you get/not get the job?) | Win/loss reason tracking integrated with Module 36 CRM, competitive intelligence dashboard |

---

## Detailed Requirements

### Project Portfolio & Showcase
- Portfolio project selector: choose which completed projects to feature
- Per-project portfolio page: curated photos, project specs, description, testimonial
- Photo curation: select best photos from project's full photo library, set cover image, arrange order
- Before/after photo pairing for renovation and remodel projects
- Project stats display: square footage, bedroom/bath count, build duration, custom features
- Portfolio categories: by project type, style, price range, location (configurable)
- Portfolio ordering: featured projects, newest first, most popular, manual sort
- Public portfolio URL per builder (subdomain or custom domain)
- SEO-optimized portfolio pages with structured data markup
- Responsive design: portfolio looks great on desktop, tablet, and mobile

### Photo Curation & Media
- Photo selection workflow: bulk select from project photo library
- Photo editing basics: crop, rotate, brightness/contrast (no need for full editor)
- Photo watermarking: builder logo overlay (configurable position, opacity)
- Video showcase support: embed walkthrough videos, drone footage
- Virtual tour integration: Matterport, iGuide embed support
- Photo metadata: room, phase, feature tags for filtering
- Hero image selection per project for thumbnails and social sharing

### Case Study Generation
- Case study template with configurable sections:
  - Client challenge / project goals
  - Solution / approach
  - Key features and design decisions
  - Project metrics (budget adherence, timeline, client satisfaction)
  - Photos (cover, process, finished)
  - Client testimonial
- Auto-populated fields from project data (timeline, budget performance, scope)
- Builder writes narrative sections; platform provides the data framework
- Export as PDF for sales presentations
- Publish to portfolio as rich content page
- AI-assisted narrative generation (optional): summarize project data into draft copy

### Review & Testimonial Collection
- Automated review request workflow triggered at configurable project milestones:
  - At substantial completion
  - After 30-day walkthrough
  - At 1-year anniversary
- Multi-channel request delivery: email, SMS, in-app notification via client portal
- Review destination options: Google Business, Houzz, Facebook, platform testimonial
- Direct link generation to builder's Google/Houzz review page
- In-platform testimonial form for builders who want to control the narrative
- Testimonial approval workflow: client submits, builder reviews, builder publishes
- Testimonial display on portfolio pages (text, star rating, client name with permission)
- Review monitoring: aggregate review scores from Google, Houzz, Facebook (read-only)
- Review response drafting assistance

### Referral Tracking & Program
- Referral source tracking on every lead (who referred them?)
- Referral sources: past client, real estate agent, architect, vendor, friend/family
- Referral reward management: gift cards, bonus checks, charity donations, fee payments
- Referral program tiers: one-time gift, percentage of contract, escalating rewards
- Referral conversion tracking: which referrals became clients?
- Referral source leaderboard: which referrers send the most business?
- Automated thank-you communication when referral converts
- Referral program documentation for sharing with potential referrers

### Marketing Campaign ROI
- Campaign tracking: name, channel, dates, budget, target audience
- Lead source attribution: tie leads to campaigns via UTM parameters or manual tagging
- Campaign metrics: leads generated, consultations booked, proposals sent, contracts won
- ROI calculation: campaign cost vs. contract value of won leads attributed to campaign
- Channel comparison: which marketing channels produce the best ROI?
- Integration with Google Analytics for website traffic attribution
- Integration with ad platforms (Google Ads, Facebook Ads) for spend import (future)
- Monthly/quarterly marketing performance report

### Social Media Content
- Project completion auto-generates social media post drafts
- Photo selection for social posts with recommended crops for different platforms
- Hashtag suggestions based on project type and location
- Social media calendar: plan and schedule posts (or export to Buffer/Hootsuite)
- Social engagement tracking (optional, via integration)

---

## Database Tables

```
portfolio_projects
  id, builder_id, project_id, is_featured, display_order,
  title, description, highlights, category, style,
  cover_photo_id, is_published, published_at, slug, created_at

portfolio_photos
  id, portfolio_project_id, photo_id, display_order,
  caption, is_before, is_after, section

portfolio_settings
  id, builder_id, subdomain, custom_domain, logo_url,
  primary_color, secondary_color, about_text,
  contact_info, seo_title, seo_description

case_studies
  id, builder_id, project_id, portfolio_project_id,
  title, challenge, solution, key_features, metrics,
  client_testimonial, cover_photo_id, is_published,
  pdf_url, slug, created_at, updated_at

testimonials
  id, builder_id, project_id, client_name, client_display_name,
  rating, text, source (google|houzz|facebook|platform),
  status (requested|submitted|approved|published|declined),
  requested_at, submitted_at, approved_by, published_at

review_requests
  id, builder_id, project_id, client_id, trigger_milestone,
  delivery_channel, destination, sent_at, completed_at, status

referrals
  id, builder_id, lead_id, referrer_type (client|agent|architect|vendor|other),
  referrer_id, referrer_name, referrer_contact, reward_type,
  reward_amount, reward_status (pending|sent|acknowledged),
  converted, converted_project_id, created_at

marketing_campaigns
  id, builder_id, name, channel, start_date, end_date,
  budget, utm_source, utm_medium, utm_campaign,
  leads_generated, proposals_sent, contracts_won,
  contract_value_won, roi_pct, notes, created_at

social_posts
  id, builder_id, project_id, platform, content,
  photo_ids, hashtags, scheduled_date, posted_at, status
```

---

## API Endpoints

```
GET    /api/v2/portfolio/projects                 # List portfolio projects
POST   /api/v2/portfolio/projects                 # Add project to portfolio
PATCH  /api/v2/portfolio/projects/:id             # Update portfolio project
DELETE /api/v2/portfolio/projects/:id             # Remove from portfolio
PUT    /api/v2/portfolio/projects/:id/photos      # Set portfolio photo selection and order
GET    /api/v2/portfolio/settings                 # Portfolio site settings
PUT    /api/v2/portfolio/settings                 # Update portfolio settings

GET    /api/v2/portfolio/public/:slug             # Public portfolio page (unauthenticated)

GET    /api/v2/case-studies                       # List case studies
POST   /api/v2/case-studies                       # Create case study
PATCH  /api/v2/case-studies/:id                   # Update case study
GET    /api/v2/case-studies/:id/pdf               # Generate PDF export

GET    /api/v2/testimonials                       # List testimonials (filter by status, project)
POST   /api/v2/testimonials/request               # Send review request to client
PATCH  /api/v2/testimonials/:id                   # Approve/publish testimonial
GET    /api/v2/testimonials/dashboard             # Review score aggregation

GET    /api/v2/referrals                          # List referrals
POST   /api/v2/referrals                          # Log referral
PATCH  /api/v2/referrals/:id                      # Update referral (reward, conversion)
GET    /api/v2/referrals/leaderboard              # Top referral sources

GET    /api/v2/marketing/campaigns                # List campaigns
POST   /api/v2/marketing/campaigns                # Create campaign
PATCH  /api/v2/marketing/campaigns/:id            # Update campaign
GET    /api/v2/marketing/campaigns/roi            # Campaign ROI comparison
GET    /api/v2/marketing/channels/performance     # Channel performance summary
```

---

## Dependencies

| Module | Relationship |
|--------|-------------|
| Module 3: Core Data Model | Completed project data for portfolio and case studies |
| Module 6: Document Storage | Project photo library for curation |
| Module 29: Full Client Portal | Review request delivery to clients |
| Module 36: Lead Pipeline & CRM | Lead source attribution, win/loss analysis, campaign tracking |
| Module 5: Notification Engine | Review request delivery, referral thank-you messages |

---

## Open Questions

1. Should the portfolio website be hosted on the platform (subdomain), or generate static files the builder deploys to their own hosting?
2. How do we handle review monitoring without violating Google/Houzz terms of service?
3. Should case study PDF generation use a server-side renderer (Puppeteer) or client-side (react-pdf)?
4. How deep should the social media scheduling go? Native scheduling, or just export/integrate with Buffer/Hootsuite?
5. Should the platform track marketing spend per channel natively, or import from accounting?
6. How do we handle builders who want to showcase projects that were completed before they joined the platform?
