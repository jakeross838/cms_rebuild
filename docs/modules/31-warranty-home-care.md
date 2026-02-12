# Module 31: Warranty & Home Care

**Phase:** 5 - Full Platform
**Status:** TODO
**Optional Module:** Yes -- builders opt in per subscription tier

---

## Overview

Post-construction warranty management and ongoing home care services. Covers the full
lifecycle from project closeout through warranty expiration: intake of warranty claims,
triage and prioritization, vendor dispatch, scheduled walkthroughs (30-day and 11-month),
cost tracking against warranty reserves, seasonal maintenance reminders, and optional
home care subscription programs that generate recurring revenue for builders.

This module transforms the builder-client relationship from "construction ends at closing"
to a long-term service relationship that drives referrals and differentiates the builder
in a competitive market.

---

## Gap Items Addressed

| Gap # | Description | Resolution |
|-------|-------------|------------|
| 465 | Optional module -- not all builders offer home care | Feature-flagged per tenant; disabled by default |
| 466 | Configurable warranty terms per builder (1yr, 2yr, 10yr structural) | Builder-defined warranty tiers with custom durations per category |
| 467 | Warranty service request routing is builder-configurable | Configurable routing rules: by trade, severity, geography, or round-robin |
| 468 | Home care subscription pricing varies by builder | Builder-defined subscription plans with custom pricing tiers |
| 469 | Manufacturer warranty vs. builder warranty tracking | Dual-track warranty with manufacturer pass-through and builder coverage fields |
| 470 | Warranty reserve accounting (configurable % of project cost) | Reserve calculation at project closeout with draw-down tracking per claim |
| 1016 | Warranty start date documentation — establish start dates for builder, manufacturer, and workmanship warranties | Formal warranty start date record per category with source documentation (CO date, substantial completion date) |
| 1025 | Warranty cost tracking — by vendor, item type, project; feeds future estimating for warranty reserves | Enhanced cost analytics feeding warranty reserve intelligence for future projects |
| 1027 | Home care subscription management — builder offers ongoing maintenance service | Subscription lifecycle management with billing, scheduling, and renewal tracking |

---

## Detailed Requirements

### Warranty Intake & Claims
- Client-facing claim submission form via client portal (photos, description, location in home)
- Builder-side manual claim creation for phone/email reports
- Automatic categorization by system (structural, mechanical, electrical, plumbing, finish, exterior)
- Duplicate detection for claims on the same defect from the same property
- Priority assignment: Emergency (water intrusion, no heat) / Urgent / Standard / Cosmetic
- SLA timer per priority level (configurable: e.g., Emergency = 24hr response, Standard = 5 business days)

#### Edge Cases & What-If Scenarios

1. **Emergency warranty claim.** When a warranty claim is classified as an emergency (e.g., water intrusion, gas leak, no heat in winter, no AC in summer), the system must provide an expedited response path. Required behavior: (a) emergency claims trigger immediate push notifications to the builder's designated emergency contact (not just the warranty coordinator), (b) the SLA clock starts immediately with a 24-hour response target (configurable), (c) if the emergency contact does not acknowledge within 1 hour, the system escalates to the builder principal, (d) the client receives an automated acknowledgment with emergency contact information and expected response time, and (e) emergency claims are flagged on the warranty dashboard with a distinct visual indicator and sorted to the top of any list.

### Triage & Workflow
- Claim review queue with photo previews and property history
- One-click assignment: builder crew, original subcontractor, or third-party vendor
- Determination tracking: covered under warranty, manufacturer issue, homeowner responsibility, goodwill repair
- Approval workflow for claims over configurable cost threshold
- Rejection workflow with templated reason explanations to homeowner

### Vendor Dispatch
- Auto-dispatch to original trade vendor when claim matches their scope
- Vendor notification with claim details, photos, homeowner contact, and access instructions
- Vendor response tracking (accepted, declined, scheduled date)
- Escalation rules when vendor does not respond within configurable window
- Vendor performance tracking for warranty work (response time, fix rate, callback rate)

#### Edge Cases & What-If Scenarios

1. **Vendor disputes warranty claim responsibility.** When a vendor disagrees that a warranty claim is their responsibility (e.g., claims the issue was caused by another trade, homeowner misuse, or normal wear), there must be a clear dispute resolution process. Required behavior: (a) the vendor can flag a dispatched claim as "disputed" through the vendor portal with a written explanation and supporting evidence (photos, contract scope references), (b) disputed claims are escalated to the builder's warranty manager for arbitration, (c) the builder can rule: vendor responsible (with explanation), builder responsible, shared responsibility, or manufacturer responsibility (with pass-through to manufacturer warranty), (d) dispute rulings are documented and become part of the permanent claim record, and (e) disputed claims are paused from SLA tracking during the dispute period but the homeowner is notified of the delay with an estimated resolution timeline.

### Warranty Start Date Documentation (Gap 1016)
- Formal warranty start date record per project capturing:
  - Builder warranty start date (typically CO date or substantial completion date, configurable per builder)
  - Per-category warranty start dates if different (structural may start at foundation completion, systems at rough-in sign-off)
  - Manufacturer warranty start dates per appliance and system (may differ from builder warranty)
  - Workmanship warranty start dates per trade (linked to subcontract warranty terms from Module 38)
- Source documentation for each start date: CO certificate, substantial completion certificate, appliance registration confirmation
- Automatic warranty expiration date calculation from start date and warranty term duration
- Expiration alert schedule: configurable reminders before warranty expiration (e.g., 60 days, 30 days, 7 days)
- Warranty start date record feeds warranty claim eligibility determination (claim received after expiration = not covered)

### Warranty Cost Intelligence (Gap 1025)
- Per-claim cost tracking by vendor, item type, system category, and project
- Historical warranty cost analysis: average warranty cost per project, per square foot, per project type
- Vendor warranty cost ranking: which vendors generate the most warranty cost after project completion
- Warranty reserve intelligence: use historical warranty cost data to recommend warranty reserve percentages for future projects
- Warranty cost trends: are warranty costs increasing or decreasing over time, by category
- Feed warranty cost data back to the estimating engine (Module 20) for more accurate warranty reserve line items in future estimates

### Scheduled Walkthroughs
- Auto-generated 30-day walkthrough task at project closeout
- Auto-generated 11-month walkthrough task (before 1-year warranty expiration)
- Configurable walkthrough schedule (builders can add 6-month, 2-year, etc.)
- Mobile-friendly walkthrough checklist with room-by-room inspection items
- Walkthrough findings auto-create warranty claims with linked photos
- Homeowner co-sign on walkthrough completion (digital signature)

### Cost Tracking
- Warranty reserve calculation at project closeout (configurable % of contract value)
- Per-claim cost entry: labor, materials, vendor invoices
- Reserve draw-down dashboard showing remaining warranty budget per project
- Cost roll-up by category, vendor, project, and time period
- Alert when warranty costs exceed reserve threshold (configurable %)

### Seasonal Reminders & Home Care
- Seasonal maintenance reminder engine (spring HVAC service, fall gutter cleaning, winter pipe protection)
- Configurable reminder templates per region and home type
- Delivery via email, SMS, or push notification (homeowner preference)
- Home care subscription management: plan creation, pricing, billing integration
- Subscription service tracking: scheduled visits, completed work, renewal dates
- Home care visit documentation with photos and notes

#### Edge Cases & What-If Scenarios

1. **Home care subscription management.** The home care subscription service is a recurring revenue opportunity for builders, and the system must make it easy to set up and manage plans. Required behavior: (a) builders can create multiple subscription tiers (e.g., Basic, Premium, Elite) with different service levels and pricing, (b) subscription billing integrates with Stripe or the builder's existing invoicing system (builder-configurable), (c) the system handles subscription lifecycle events: trial periods, renewals, cancellations, payment failures, and plan upgrades/downgrades, (d) automated renewal reminders are sent to homeowners 30 days before renewal with an option to update payment method or cancel, and (e) lapsed subscriptions are flagged but service history is retained for potential re-enrollment.

---

## Database Tables

```
warranty_claims
  id, builder_id, project_id, property_id, submitted_by, category,
  priority, status, description, determination, assigned_vendor_id,
  assigned_crew_id, sla_deadline, resolved_at, resolution_notes,
  created_at, updated_at

warranty_claim_photos
  id, claim_id, photo_url, caption, taken_at

warranty_terms
  id, builder_id, category, duration_months, description, coverage_details

warranty_reserves
  id, builder_id, project_id, reserve_amount, spent_amount,
  reserve_pct, created_at

warranty_costs
  id, claim_id, cost_type (labor|material|vendor), amount,
  vendor_id, description, invoice_ref, created_at

warranty_walkthroughs
  id, builder_id, project_id, type (30day|11month|custom),
  scheduled_date, completed_date, completed_by, homeowner_signature_url,
  status, notes

walkthrough_items
  id, walkthrough_id, room, description, photos, creates_claim_id

home_care_plans
  id, builder_id, name, description, price_monthly, price_annual,
  services_included, is_active

home_care_subscriptions
  id, plan_id, property_id, homeowner_id, start_date, renewal_date,
  status, payment_method_ref

seasonal_reminders
  id, builder_id, region, season, title, message_template,
  delivery_channels, is_active
```

---

## API Endpoints

```
GET    /api/v2/warranty/claims                 # List claims (filterable)
POST   /api/v2/warranty/claims                 # Submit new claim
GET    /api/v2/warranty/claims/:id             # Claim detail
PATCH  /api/v2/warranty/claims/:id             # Update claim (triage, assign, resolve)
POST   /api/v2/warranty/claims/:id/dispatch    # Dispatch to vendor
POST   /api/v2/warranty/claims/:id/photos      # Attach photos
GET    /api/v2/warranty/claims/:id/costs       # Claim cost breakdown
POST   /api/v2/warranty/claims/:id/costs       # Add cost entry

GET    /api/v2/warranty/walkthroughs           # List scheduled walkthroughs
POST   /api/v2/warranty/walkthroughs           # Create walkthrough
PATCH  /api/v2/warranty/walkthroughs/:id       # Complete / update walkthrough
POST   /api/v2/warranty/walkthroughs/:id/items # Add walkthrough finding

GET    /api/v2/warranty/reserves               # Reserve balances by project
GET    /api/v2/warranty/terms                  # Builder warranty terms config
PUT    /api/v2/warranty/terms                  # Update warranty terms

GET    /api/v2/home-care/plans                 # Builder's home care plans
POST   /api/v2/home-care/plans                 # Create plan
GET    /api/v2/home-care/subscriptions         # Active subscriptions
POST   /api/v2/home-care/subscriptions         # Enroll homeowner
GET    /api/v2/home-care/reminders             # Seasonal reminder config
PUT    /api/v2/home-care/reminders             # Update reminders
```

---

## Dependencies

| Module | Relationship |
|--------|-------------|
| Module 3: Core Data Model | Project and property records |
| Module 10: Contact/Vendor Management | Vendor dispatch and homeowner contacts |
| Module 29: Full Client Portal | Client-facing claim submission |
| Module 5: Notification Engine | SLA alerts, seasonal reminders, walkthrough scheduling |
| Module 6: Document Storage | Claim photos and walkthrough documentation |
| Module 19: Financial Reporting | Warranty cost roll-up into financial reports |

---

## Open Questions

1. Should warranty claims be visible to clients in the portal in real time, or only after builder review?
2. How do we handle warranty for homes sold to a second owner? Transfer warranty tracking?
3. Should the home care subscription billing integrate directly with Stripe, or flow through the builder's existing invoicing?
4. What is the data retention policy for warranty records after the warranty period expires?
5. Should the seasonal reminder engine be shared with the client portal notification system or be independent?
