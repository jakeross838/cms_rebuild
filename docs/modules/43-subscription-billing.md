# Module 43: Subscription Billing & Plan Management

**Phase:** 6 - Scale & Sell
**Status:** SPEC COMPLETE
**Covers Gap Items:** 96-120 (Section 3: Pricing, Billing & Subscription Management)

---

## Overview

This module is the revenue engine for the SaaS business. It handles pricing tier definition, per-user and per-project pricing models, feature gating by plan, trial management, upgrade/downgrade workflows with proration, usage-based billing components, payment processing via Stripe, dunning for failed payments, enterprise invoicing, SaaS tax compliance, and internal revenue metrics (MRR, churn, LTV, CAC). Every pricing decision must be configurable without code changes.

---

## Gap Items Addressed

| Gap # | Description | How Addressed |
|-------|-------------|---------------|
| 96 | Pricing structure: per user, per project, per revenue, flat, tiered? | Configurable pricing engine supports all models; plans define base + per-unit components |
| 97 | One-man builder ($99/mo) vs. $100M builder ($5,000/mo) | Tiered plans: Starter, Professional, Business, Enterprise with volume-based pricing |
| 98 | Modules individually priced? Build-your-own plan? | Module add-on pricing: base platform + optional module bundles |
| 99 | Per-project pricing for small builders | Per-project plan option: pay per active project instead of monthly subscription |
| 100 | Seasonal businesses -- pay year-round? | Seasonal pause option: reduced rate during off-months (keeps data, suspends active features) |
| 101 | Free tier or freemium model? | Free tier: 1 user, 1 project, core features only. Converts to paid on limit hit. |
| 102 | Annual vs. monthly billing, annual discount? | Both billing cycles; annual = 2 months free (16.7% discount) |
| 103 | Pricing changes for existing customers | Grandfathering engine: existing customers keep old pricing for configurable period (default 12 months) |
| 104 | Usage-based pricing (per invoice, per AI query, per GB stored) | Usage meters track consumable resources; overage billing or pre-purchased credit packs |
| 105 | Pricing for vendor/client portal users | Portal users are free; included in builder's plan. Configurable portal user limits per tier. |
| 106 | Pricing for integrations | Standard integrations included; premium integrations (ERP, custom API) are add-ons |
| 107 | Enterprise pricing -- custom contracts, volume discounts | Enterprise tier: custom pricing via sales, contract-based billing, volume discounts |
| 108 | Partner/referral program | Referral tracking: referring builder gets account credit; referred builder gets discount |
| 109 | Pricing for add-on services (migration, training, support) | Professional services catalog with one-time charges added to subscription invoices |
| 110 | Pricing transparency -- public or "contact us"? | Public pricing for Starter/Professional/Business; "Contact Sales" for Enterprise |
| 111 | Payment failures (card declined, ACH rejected) | Dunning sequence: retry 3x over 7 days, email notifications, grace period, then suspend |
| 112 | Involuntary churn -- payment fails but customer wants to stay | Recovery flow: update payment method, instant reactivation within grace period |
| 113 | Upgrade/downgrade mid-cycle proration | Stripe proration: immediate access on upgrade, credit applied; downgrade at cycle end |
| 114 | Trial periods -- length, credit card required, conversion | 14-day free trial, no credit card required. Conversion prompts at day 7, 12, 14. |
| 115 | Billing disputes | Dispute workflow: builder raises dispute, auto-pause collection, admin review, resolution |
| 116 | Enterprise invoicing (invoice, not credit card) | Net-30 invoicing for Enterprise tier via Stripe Invoicing or manual invoice generation |
| 117 | SaaS tax by state | Tax calculation via Stripe Tax or Avalara; automatic nexus detection |
| 118 | International billing (currency, tax, regulations) | Multi-currency support via Stripe; VAT/GST handling for international expansion |
| 119 | Refunds -- full, partial, prorated | Refund engine: full, partial, or prorated refund with reason tracking |
| 120 | MRR, churn rate, LTV, CAC tracking | Revenue dashboard: real-time MRR/ARR, churn by cohort, LTV calculation, CAC by channel |

---

## Detailed Requirements

### Plan Architecture

```
Plan Tiers:
  FREE        - 1 user, 1 active project, core features
  STARTER     - 3 users, 5 projects, + scheduling + selections
  PROFESSIONAL- 10 users, 20 projects, + all modules except premium
  BUSINESS    - 25 users, unlimited projects, + all modules + API access
  ENTERPRISE  - Unlimited, custom pricing, white-label, dedicated support

Per-Unit Add-Ons:
  Additional users:     $15/user/month
  Additional projects:  $10/project/month
  Storage overage:      $5/10GB/month
  AI queries:           $0.05/query (above plan allocation)

Module Add-Ons:
  Warranty Management:  $49/month
  API & Integrations:   $99/month
  Advanced Reporting:   $39/month
  White-Label Branding: $199/month (or included in Enterprise)
```

### Feature Gating

- Plan-level feature flags stored in `plan_features` table
- Middleware checks feature access on every API request: `requireFeature('scheduling')`
- Soft gates (show feature with upgrade prompt) vs. hard gates (404 if not on plan)
- Feature usage counters enforce per-plan limits (users, projects, storage, API calls)

### Trial Management

- 14-day trial starts on signup, no credit card required
- Trial includes Professional-tier features so users experience full value
- In-app trial countdown banner with upgrade CTA
- Conversion prompts: day 3 (value highlight), day 7 (case study), day 12 (urgency), day 14 (last chance)
- Trial expiration: account enters read-only mode. Data preserved for 90 days.
- Trial extension: CS team can grant 7-day extensions via admin panel

### Payment Processing (Stripe)

- Stripe Customer, Subscription, and Invoice objects managed via API
- Payment methods: credit card, ACH/bank transfer (Enterprise), wire transfer (Enterprise custom)
- PCI compliance via Stripe Elements (card data never touches our servers)
- Webhook handlers for: `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`

### Dunning Sequence

1. Payment fails -> retry in 1 day
2. Second failure -> retry in 3 days, email to account owner
3. Third failure -> retry in 7 days, email + in-app banner warning
4. Grace period (7 days after third failure) -> account enters restricted mode
5. No payment after grace -> account suspended (read-only)
6. 90 days with no payment -> account scheduled for deactivation (data export offered)

### Edge Cases & What-If Scenarios

1. **Charge dispute handling.** When a builder disputes a charge (via Stripe chargeback, direct complaint, or in-app dispute form), the system must follow a clear and fair workflow: auto-pause collection on the disputed amount (do not retry the charge), notify the platform billing team immediately, provide the builder with a detailed invoice breakdown showing exactly what was charged and why, capture the builder's dispute reason with supporting context, and track resolution through to completion. For Stripe chargebacks specifically, the system must auto-generate evidence submission (invoice history, usage data, ToS acceptance records) to fight fraudulent chargebacks. The dispute resolution must be time-bounded: resolve within 10 business days or escalate to management. All dispute records are retained for financial audit purposes.

2. **Usage fluctuation and pricing fairness.** Builders whose usage fluctuates significantly (seasonal builders with 20 active projects in summer and 3 in winter, or builders who ramp up for a large project then scale back) need pricing flexibility to avoid feeling overcharged during low-usage periods. The system must support: usage-based billing components that automatically adjust (pay for actual active projects, not a fixed tier), the seasonal pause option (Gap 100) with clear terms, mid-cycle downgrade capability with prorated credit, and transparent usage dashboards showing current consumption vs. plan limits. When a builder's usage consistently falls below their plan for 3+ months, the system should proactively suggest a downgrade to build trust and reduce churn risk.

3. **Dunning sequence effectiveness and recovery optimization.** The dunning sequence (retry schedule + communications for failed payments) is critical for minimizing involuntary churn. The system must go beyond simple automated retries: track recovery rate by dunning step (which step recovers the most payments?), A/B test dunning email copy and timing, support multiple payment method fallbacks (if card A fails, try card B before escalating), include personal outreach from the CS team for high-value accounts (Business and Enterprise tiers) at the second failure, and provide a one-click payment method update flow that does not require logging in. Dunning analytics must be visible in the platform admin dashboard (Module 49) showing recovery rate, average days to recovery, and churn-to-dunning ratio.

### Grandfathering Engine (Gap #103)

When the platform changes pricing (rate increases, plan restructuring, feature reallocation), existing customers must be protected:

1. **Grandfathering period:** Existing subscribers keep their current pricing for a configurable period (default: 12 months from the pricing change date). Stored in `builder_subscriptions.grandfathered_until`.
2. **Advance notice:** Customers receive email notification at least 60 days before grandfathering expires, showing their current price vs. the new price, and explaining what changed.
3. **Opt-in upgrade:** During the grandfathering period, customers can voluntarily switch to the new pricing if the new plan offers better value.
4. **Automatic transition:** When grandfathering expires, the customer is automatically moved to the closest equivalent new plan. If the new plan costs more, a 30-day grace period with the old price applies, and the customer is notified.
5. **Enterprise exception:** Enterprise customers on custom contracts are never auto-transitioned. Their pricing changes only at contract renewal.
6. **Audit trail:** All grandfathering decisions and transitions are logged in `billing_events` for financial reporting.

### Partner & Referral Program (Gap #108)

The referral program incentivizes builders to recommend the platform to other builders:

1. **Referral tracking:** Each builder gets a unique referral link/code. When a referred builder signs up and activates a paid plan, the referrer is credited.
2. **Referrer reward:** Account credit of configurable amount (default: one month of their current plan's base price) applied to their next invoice.
3. **Referred reward:** Referred builder receives a configurable discount on their first billing period (default: 20% off first 3 months).
4. **Credit expiration:** Referral credits expire 12 months after issuance if unused.
5. **Limits:** Maximum referral credits per builder per year: configurable (default: 12 credits, i.e., one free year equivalent).
6. **Fraud prevention:** Self-referrals are detected (same email domain, same IP, same payment method) and blocked. Referred builder must maintain an active paid subscription for at least 60 days before the referrer credit is issued.
7. **Dashboard:** Referrers see their referral link, pending referrals, credited referrals, and total savings in Billing > Referrals.

### Professional Services Pricing (Gap #109)

Add-on professional services that are billable beyond the subscription:

1. **Service catalog:** The system maintains a catalog of professional services: managed data migration, custom training sessions, custom template creation, dedicated onboarding concierge, custom integration development.
2. **Quoting:** Professional services are quoted per-engagement. Quotes are generated by the CS or professional services team via the admin panel and sent to the builder as a one-time invoice.
3. **Billing:** Professional service charges are added as one-time line items on the builder's next subscription invoice (via Stripe Invoice Items) or billed as a separate invoice for larger engagements.
4. **Tracking:** Each professional service engagement is tracked with status (quoted, accepted, in progress, delivered, completed), hours, and deliverables.

### Pricing Transparency (Gap #110)

1. **Public pricing:** Starter, Professional, and Business plan pricing is published on the marketing website with full feature comparison matrix.
2. **Enterprise pricing:** Enterprise tier displays "Contact Sales" with a request form that captures company size, project count, and specific needs.
3. **In-app pricing:** Current plan details and upgrade options are visible in Settings > Billing with transparent pricing for all available plans and add-ons.
4. **No hidden fees:** All usage-based charges (storage overage, AI queries, additional users) must be clearly listed with per-unit pricing on the pricing page and in the billing dashboard.

### Cancellation & Offboarding Process

When a customer wants to cancel their subscription, the system must follow a structured process that respects the builder's data while attempting to retain the customer:

1. **Cancellation initiation:** Only the owner role can initiate cancellation. Navigate to Billing > Cancel Subscription.
2. **Exit survey:** Before confirming, the builder must complete a short exit survey: reason for leaving (dropdown + freeform), where they are going (competitor, spreadsheets, none), what would have kept them (optional).
3. **Retention offers:** Based on the exit reason, the system may present a targeted retention offer: downgrade to a lower tier, seasonal pause (if seasonal business), complimentary training session, temporary discount (configurable by CS team). The builder can accept or decline.
4. **Cancellation confirmation:** If the builder proceeds, cancellation takes effect at the end of the current billing cycle. Access continues until the paid period expires.
5. **Data export prompt:** On cancellation confirmation, the system prominently offers full data export (Module 3 Section 8) and gives a 90-day window to export after access ends.
6. **Post-cancellation access:** After the billing period ends, the account enters read-only mode for 90 days. The owner can log in to export data and view records but cannot create or modify anything.
7. **Data retention and deletion:** Data is retained for 90 days after the billing period ends. After 90 days, data is scheduled for permanent deletion per Module 3 Section 9. The owner receives email warnings at 60 and 80 days.
8. **Reactivation:** At any point during the 90-day retention window, the owner can reactivate by subscribing to a new plan. All data is immediately restored. After data deletion, reactivation starts a fresh account.
9. **Win-back campaigns:** Cancelled accounts are eligible for automated win-back email sequences at 30, 60, and 90 days post-cancellation (configurable by CS team).

### Upgrade/Downgrade Flows

- **Upgrade**: Immediate access to new features. Prorated charge for remainder of billing cycle.
- **Downgrade**: Takes effect at end of current billing cycle. Warning if current usage exceeds new plan limits.
- **Add-on activation**: Immediate, prorated.
- **Add-on removal**: End of billing cycle.

---

## Database Tables

```
subscription_plans
  id              UUID PK
  name            VARCHAR(50)
  slug            VARCHAR(50) UNIQUE
  tier_level      INT  -- 0=free, 1=starter, 2=pro, 3=business, 4=enterprise
  base_price_monthly  DECIMAL(10,2)
  base_price_annual   DECIMAL(10,2)
  max_users       INT NULL  -- NULL = unlimited
  max_projects    INT NULL
  max_storage_gb  INT
  features        JSONB  -- {'scheduling': true, 'api_access': false, ...}
  is_public       BOOLEAN DEFAULT true
  is_active       BOOLEAN DEFAULT true

plan_addons
  id              UUID PK
  name            VARCHAR(100)
  slug            VARCHAR(50) UNIQUE
  addon_type      VARCHAR(20)  -- 'module', 'per_unit', 'usage'
  price_monthly   DECIMAL(10,2)
  unit_label      VARCHAR(30) NULL  -- 'user', 'project', 'GB'
  is_active       BOOLEAN DEFAULT true

builder_subscriptions
  id              UUID PK
  builder_id      UUID FK -> builders UNIQUE
  plan_id         UUID FK -> subscription_plans
  stripe_customer_id     VARCHAR(100)
  stripe_subscription_id VARCHAR(100)
  billing_cycle   VARCHAR(10)  -- 'monthly', 'annual'
  status          VARCHAR(20)  -- 'trialing', 'active', 'past_due', 'suspended', 'canceled'
  trial_ends_at   TIMESTAMPTZ NULL
  current_period_start TIMESTAMPTZ
  current_period_end   TIMESTAMPTZ
  canceled_at     TIMESTAMPTZ NULL
  grandfathered_until TIMESTAMPTZ NULL
  metadata        JSONB

builder_addon_subscriptions
  id              UUID PK
  builder_id      UUID FK -> builders
  addon_id        UUID FK -> plan_addons
  quantity        INT DEFAULT 1
  activated_at    TIMESTAMPTZ
  deactivates_at  TIMESTAMPTZ NULL

usage_meters
  id              UUID PK
  builder_id      UUID FK -> builders
  meter_type      VARCHAR(30)  -- 'users', 'projects', 'storage_gb', 'ai_queries'
  current_value   DECIMAL(15,2)
  plan_limit      DECIMAL(15,2) NULL
  billing_period  VARCHAR(7)  -- '2026-02'
  last_updated    TIMESTAMPTZ

billing_events
  id              UUID PK
  builder_id      UUID FK -> builders
  event_type      VARCHAR(30)  -- 'charge', 'refund', 'credit', 'dispute'
  amount          DECIMAL(10,2)
  currency        VARCHAR(3) DEFAULT 'USD'
  stripe_event_id VARCHAR(100)
  description     TEXT
  created_at      TIMESTAMPTZ

referral_credits
  id              UUID PK
  referrer_builder_id UUID FK -> builders
  referred_builder_id UUID FK -> builders
  credit_amount   DECIMAL(10,2)
  applied_at      TIMESTAMPTZ NULL
  expires_at      TIMESTAMPTZ
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/billing/plans` | List available subscription plans |
| GET | `/api/v1/billing/subscription` | Get current builder's subscription |
| POST | `/api/v1/billing/subscribe` | Create new subscription (plan + billing cycle) |
| PUT | `/api/v1/billing/subscription/upgrade` | Upgrade plan |
| PUT | `/api/v1/billing/subscription/downgrade` | Downgrade plan (end of cycle) |
| POST | `/api/v1/billing/addons` | Activate an add-on |
| DELETE | `/api/v1/billing/addons/:addonId` | Deactivate an add-on |
| GET | `/api/v1/billing/usage` | Get current usage meter values |
| GET | `/api/v1/billing/invoices` | List billing history / invoices |
| POST | `/api/v1/billing/payment-method` | Update payment method (Stripe SetupIntent) |
| POST | `/api/v1/billing/disputes` | Raise a billing dispute |
| POST | `/api/v1/billing/refund` | Process a refund (admin) |
| GET | `/api/v1/admin/billing/mrr` | Platform admin: MRR/ARR dashboard data |
| GET | `/api/v1/admin/billing/churn` | Platform admin: churn analytics |
| POST | `/api/v1/admin/billing/trial-extend/:builderId` | Extend a trial |
| POST | `/api/v1/webhooks/stripe` | Stripe webhook handler |

---

## Dependencies

- **Stripe API** -- payment processing, subscription management, invoicing, tax
- **Module 1: Auth & Access** -- account management, feature gating middleware
- **Module 2: Configuration Engine** -- feature flags per plan
- **Module 49: Platform Analytics** -- revenue metrics, churn tracking
- **Module 41: Onboarding Wizard** -- trial conversion flow
- **Module 44: White-Label** -- white-label pricing tier

---

## Open Questions

1. Should the free tier require email verification or phone verification to prevent abuse?
2. What is the exact pricing for each tier? (Requires market research and competitive analysis)
3. Should we support cryptocurrency payments for Enterprise customers?
4. How do we handle builders who want to pay via check? (Manual invoice + reconciliation)
5. Should seasonal pause be automatic (detect no logins for 60 days) or manual request only?
6. What is the grandfathering period for pricing changes -- 6 months, 12 months, or indefinite?
