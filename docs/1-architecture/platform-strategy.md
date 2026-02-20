# RossOS - Platform Business Strategy

This document addresses six strategic questions about taking RossOS from an internal tool to a commercial SaaS product. Each section defines concrete plans, milestones, and decision criteria rather than aspirational statements.

---

## GAP-852: Go-to-Market Strategy

### Target Market Definition

**Primary Segment (Launch):**
- Custom residential builders doing $2M-$50M annual revenue
- 5-50 employees
- Currently using spreadsheets, QuickBooks + email, or entry-level tools (Buildertrend, CoConstruct)
- Pain point: financial tracking is disconnected from field operations

**Why This Segment:**
- Ross Built (the founder's company) is in this segment, so the product is built for real workflows
- These builders are large enough to pay $300-$800/month but underserved by enterprise tools (Procore, CMiC)
- Switching cost from spreadsheets/basic tools is low compared to switching from Procore

### Channel Strategy

**Phase 1 — Direct/Referral (Months 1-6 post-launch):**
- Leverage Ross Built's network: builder associations, trade shows, subcontractor referrals
- Target: 10 paying customers through direct outreach and demos
- Pricing: $299/month (Starter, up to 10 users) and $599/month (Pro, up to 30 users)
- Offer 60-day free trial with white-glove onboarding for first 20 customers
- Build case studies from early adopters

**Phase 2 — Content/Inbound (Months 6-18):**
- SEO-optimized content: "construction budget tracking," "AIA billing software," "builder financial management"
- YouTube channel: weekly 5-minute videos showing real construction workflows in RossOS
- Builder forum presence (BuilderOnline, Reddit r/construction, JLC Online)
- Target: 50 cumulative paying customers

**Phase 3 — Partnerships (Months 18-36):**
- Accounting firm partnerships: CPAs who serve builders recommend RossOS as the construction layer on top of QuickBooks
- Lumber yard / supplier partnerships: co-marketing with material suppliers
- Insurance partnerships: builders using RossOS get preferred rates (better documentation = lower risk)
- Target: 200 cumulative paying customers

### Pricing Model

| Plan | Price | Users | Jobs | Features |
|------|-------|-------|------|----------|
| Starter | $299/mo | Up to 10 | Up to 20 active | Core modules (1-12), basic reports |
| Pro | $599/mo | Up to 30 | Unlimited | All modules, AI processing (500 docs/mo), QuickBooks sync |
| Enterprise | $999/mo | Unlimited | Unlimited | White-label, API access, priority support, unlimited AI |

**Add-ons:**
- Additional AI document processing: $0.25/document beyond plan limit
- Client portal branding: $99/mo (custom domain, logo, colors)
- Data migration service: $500-$2,000 one-time (depending on source system)

### Key Metrics to Track
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC) — target < 3 months of subscription revenue
- Net Revenue Retention — target > 110% (expansion revenue from plan upgrades)
- Time to first value — target < 7 days from signup to first invoice processed

---

## GAP-856: Team Composition

### Current State (Pre-Revenue)

**Solo Founder (Jake Ross):**
- Role: Product owner, requirements, QA, business development
- Background: Runs Ross Built (active construction company), built v1 of CMS
- Strength: Knows every construction workflow from daily practice
- Time allocation: 60% construction business, 40% software product

**AI Development Partner (Claude):**
- Role: Architecture, implementation, testing, documentation
- Handles: All code generation, database design, API development, test writing
- Output: Equivalent of 2-3 senior developers based on velocity

### Hiring Plan

**Phase 1 — First Revenue to 20 Customers (Month 0-6):**
- No hires. Jake handles sales, onboarding, and support. Claude handles development.
- Contract out: logo/brand design ($2K-$5K), marketing website ($3K-$5K)

**Phase 2 — 20-50 Customers (Month 6-12):**
- **Hire 1: Customer Success / Support** (full-time, $55K-$70K)
  - Handles onboarding, training, support tickets
  - Frees Jake to focus on sales and product direction
  - Must have construction industry knowledge

**Phase 3 — 50-100 Customers (Month 12-18):**
- **Hire 2: Full-Stack Developer** (full-time, $90K-$120K)
  - Owns bug fixes, customer-requested features, integration work
  - Works alongside Claude for feature development
  - Must be comfortable with AI-assisted development workflow

- **Hire 3: Sales/Marketing** (full-time or senior contractor, $60K-$80K + commission)
  - Owns inbound marketing, content creation, demo pipeline
  - Manages partner relationships (accountants, suppliers)

**Phase 4 — 100+ Customers (Month 18+):**
- Additional developers, QA, support based on revenue and growth rate
- Consider a construction industry advisor (part-time/advisory board)

### Key Principle
Stay lean. One person with AI tooling can maintain this product for 50+ customers. Hire only when a specific bottleneck is measurable (support response time > 4 hours, sales pipeline has > 30 uncontacted leads, bug backlog > 2 weeks).

---

## GAP-857: Funding Model

### Preferred Path: Bootstrapped to Profitability

**Rationale:**
- Construction SaaS has proven unit economics (low churn, high LTV)
- The product is being built at near-zero development cost (no salaries, no contractor fees)
- Jake has operating income from Ross Built to fund initial infrastructure costs
- Bootstrapping preserves 100% ownership and avoids investor pressure to grow faster than the product is ready

**Infrastructure Costs (Monthly):**

| Item | Cost | Notes |
|------|------|-------|
| Supabase Pro | $25/mo | Database, auth, storage |
| Vercel Pro | $20/mo | Hosting, edge functions |
| Anthropic API | $100-$500/mo | AI invoice processing, scales with usage |
| Domain + Email | $15/mo | Google Workspace |
| Monitoring (Sentry) | $26/mo | Error tracking |
| **Total** | **$186-$586/mo** | Scales with customer count |

**Break-Even Analysis:**
- At $299/mo Starter plan: break-even at 2 customers (infrastructure only)
- At $599/mo Pro plan with one employee ($70K/year): break-even at ~12 customers
- With two employees ($160K/year combined): break-even at ~25 customers

**Revenue Milestones:**

| Milestone | Customers | MRR | Significance |
|-----------|-----------|-----|-------------|
| Ramen profitable | 5 | $2,000 | Covers all infrastructure |
| First hire feasible | 15 | $6,000 | Can fund part-time support |
| Sustainable | 30 | $15,000 | Covers 1 FTE + infrastructure |
| Growth mode | 75 | $40,000 | Covers 3 FTEs, marketing budget |
| Series-A-equivalent | 200 | $100,000 | $1.2M ARR, consider strategic options |

### Alternative Path: Strategic Investment

**Only consider external funding if:**
- A competitor with deep pockets enters the custom-residential niche directly
- A strategic partner (QuickBooks, a lumber supply chain) wants to co-develop
- Growth is constrained by sales bandwidth, not product quality

**If pursuing funding:**
- Target: $500K-$1M from construction-industry angels or a vertical SaaS fund
- Use of funds: sales team, marketing, faster enterprise feature development
- Terms: convertible note or SAFE to avoid premature valuation

### What NOT to Do
- Do not raise VC money at pre-revenue. The dilution is not worth it.
- Do not take on debt for software development. The marginal cost of development is near zero.
- Do not offer equity to early customers. Offer discounts or lifetime pricing instead.

---

## GAP-858: Timeline to First External Customer

### Milestone Plan

**Weeks 1-8 (Current Phase): Core Product Completion**
- Complete skeleton UI for all 50 modules
- Implement Phase 1 (Foundation) and Phase 2 (Construction Core) modules with real data
- Ship Module 11 (Native Accounting (GL/AP/AR)) and Module 09 (Budget & Cost Tracking) — these are the "killer features"
- Ross Built uses the system daily as the sole alpha tester

**Weeks 9-16: Financial Modules + Hardening**
- Implement Phase 3 (Financial Power): AI invoicing, draws, QuickBooks sync, change orders
- Complete client portal (basic version)
- Run Ross Built's actual Q2 financials through the system end-to-end
- Fix every issue found during real use
- Begin building marketing website

**Weeks 17-20: Beta Prep**
- Deploy multi-tenant infrastructure (already designed; needs production hardening)
- Set up Stripe billing (Module 43, simplified version)
- Create onboarding wizard (Module 41, simplified version)
- Write 5 help articles covering the most common workflows
- Recruit 3-5 beta builders from Jake's network

**Weeks 21-24: Private Beta**
- 3-5 builders using the system with free access
- Weekly check-in calls to gather feedback
- Fix blocking issues within 24 hours
- Success criteria: at least 2 beta builders process a real draw through the system

**Week 25: First Paying Customer**
- Convert beta builders to paid plans
- Target date: approximately 6 months from today (August 2026)
- Definition of "first customer": a builder who is NOT Ross Built, who pays $299+/month, and who processes at least one real invoice per week

### Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Feature gaps discovered in beta | Prioritize blockers ruthlessly; defer nice-to-haves |
| QuickBooks integration complexity | Ship with CSV export as fallback; QB sync in Phase 3+ |
| Beta builders don't engage | Offer $100 Amazon gift card for completing 4-week trial |
| Performance issues at scale | Load test with synthetic data before beta (10K invoices, 500 jobs) |

---

## GAP-859: Managing Customer Expectations When Product Is Still Being Built

### Transparency Framework

**What Customers See:**

1. **Public Roadmap Page** (accessible from the app):
   - Three columns: "Shipped," "Building Now," "Up Next"
   - Each item has a one-sentence description and estimated quarter
   - No specific dates — only quarters (Q3 2026, Q4 2026, etc.)
   - Updated monthly

2. **Feature Status Badges** (in the app UI):
   - Fully functional features: no badge (they just work)
   - Beta features: blue "Beta" badge in the nav. Tooltip: "This feature is functional but still being refined. Report issues to support."
   - Coming soon features: grayed-out nav items with "Coming [Quarter]" tooltip. Clicking shows a preview screenshot and a "Notify me" button.
   - Never show empty pages or broken features. Either the feature works or it is clearly marked as upcoming.

3. **Release Notes** (in-app notification + email):
   - Bi-weekly summary of new features and improvements
   - Format: "What's new in RossOS — [Date]" with 3-5 bullet points
   - Include one "coming next" teaser

### Sales Honesty Rules

- Never demo a feature that does not work in production.
- If a prospect asks about a feature that is not built, say: "That is on our roadmap for [quarter]. Here is what we have today that covers [X%] of that need."
- If a prospect needs a feature that is 3+ months away, offer: "We can set you up on our waitlist and give you 30 days free when it ships."
- Never promise a delivery date for a specific feature to close a sale.

### Contractual Protections

- Terms of Service include: "RossOS is provided as-is. Feature availability may change. We will provide 30 days notice before removing any feature that a customer actively uses."
- No long-term contracts for the first year. Month-to-month only. Customers can leave at any time.
- This protects both sides: customers are not locked in to an immature product, and Ross is not locked in to features that do not work.

### Feedback Loop

- Every page in the app has a "Feedback" button (bottom-right) that opens a form: text + optional screenshot.
- Feedback is tagged with: user, company, current page URL, browser, and timestamp.
- Jake reviews all feedback weekly. Top 3 requests get a personal response within 48 hours.
- Monthly email to all customers: "You asked, we built" — showing features shipped based on customer feedback.

---

## GAP-860: Support Model as You Scale

### Tier Structure

**Tier 0 — Self-Service (all plans):**
- In-app help center: searchable articles organized by module
- Contextual help: "?" icon on every page links to the relevant article
- Video tutorials: 2-5 minute walkthroughs for each major workflow
- AI-powered search: type a question, get an answer from the knowledge base
- Target: 60% of support needs resolved here

**Tier 1 — Email/Chat Support (all plans):**
- Email: support@rossos.com with 24-hour response SLA (business days)
- In-app chat widget during business hours (8am-6pm ET, Monday-Friday)
- Handled by: Customer Success hire (GAP-856 Phase 2), then expanded support team
- Target response time: < 4 hours during business hours
- Escalation trigger: if unresolved after 2 exchanges, escalate to Tier 2

**Tier 2 — Technical Support (Pro and Enterprise plans):**
- Screen-sharing sessions for complex issues
- Direct access to a named account contact
- Handled by: Customer Success + Developer
- Target resolution: < 24 hours for non-blocking issues, < 4 hours for blocking issues
- Enterprise plan includes priority queue

**Tier 3 — Engineering (internal):**
- Bug fixes and data issues that require code changes
- Handled by: Developer (Jake or hired dev)
- Target: bug fix deployed within 48 hours for critical issues, 1 week for non-critical

### Scaling Triggers

| Metric | Threshold | Action |
|--------|-----------|--------|
| Support tickets/week | > 20 | Hire additional support person |
| Avg response time | > 8 hours | Hire additional support person |
| Tier 2 escalation rate | > 30% | Improve knowledge base, add video content |
| Tier 3 escalation rate | > 10% | Prioritize stability/UX improvements over new features |
| NPS score | < 40 | Freeze feature development, focus entirely on existing customer experience |

### Support Tooling

**Phase 1 (0-20 customers):**
- Shared email inbox (support@rossos.com → Google Groups)
- Spreadsheet tracking for issues
- Cost: $0

**Phase 2 (20-50 customers):**
- Help desk software (Intercom or Crisp): $50-$100/mo
- In-app chat widget
- Basic ticket tracking and SLA monitoring

**Phase 3 (50-200 customers):**
- Full help desk with knowledge base (Intercom): $200-$400/mo
- Customer health scoring: login frequency, feature adoption, support ticket volume
- Proactive outreach for at-risk customers (no login in 14 days → email check-in)
- Onboarding checklist tracking per customer

### Knowledge Base Structure

```
Help Center/
├── Getting Started/
│   ├── Creating Your Account
│   ├── Setting Up Your Company
│   ├── Adding Your First Job
│   └── Inviting Team Members
├── Financial Management/
│   ├── Processing Invoices
│   ├── Creating Draws (AIA Format)
│   ├── Managing Purchase Orders
│   ├── Change Order Workflow
│   └── QuickBooks Integration
├── Field Operations/
│   ├── Daily Logs
│   ├── Photo Documentation
│   ├── Schedule Management
│   └── Punch Lists
├── Client Portal/
│   ├── Inviting Clients
│   ├── Client Selections
│   └── Draw Approvals
├── Administration/
│   ├── User Roles and Permissions
│   ├── Cost Code Setup
│   └── Company Settings
└── Troubleshooting/
    ├── Common Issues
    ├── Browser Compatibility
    └── Mobile Access
```

Each article follows the format:
1. One-sentence summary of what this feature does
2. Step-by-step instructions with screenshots
3. "Common Questions" section at the bottom
4. "Related Articles" links

### Support Cost Model

| Stage | Customers | Support FTEs | Monthly Cost | Cost per Customer |
|-------|-----------|-------------|-------------|-------------------|
| Solo | 1-20 | 0 (Jake) | $0 | $0 |
| First hire | 20-50 | 1 | $5,000 | $100-$250 |
| Growth | 50-100 | 1.5 | $8,000 | $80-$160 |
| Scale | 100-200 | 2.5 | $15,000 | $75-$150 |

Target: support cost per customer decreases as self-service content improves and the product stabilizes. Goal is < $50/customer/month by the time the platform reaches 200 customers.

---

*Document created: 2026-02-13*
*These specifications cover platform business strategy for the RossOS platform. Each item defines concrete plans, metrics, and decision criteria.*
