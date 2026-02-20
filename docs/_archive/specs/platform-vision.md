# RossOS: Construction Intelligence Platform
## Master Vision Document - Synthesized Requirements

> **Goal**: An all-in-one, AI-learning platform for custom home builders that replaces Buildertrend, Procore, and supplements with features from Materio (selections), Adaptive.build (invoice processing), and ReportandGo (live checklists). Everything links. Everything learns.

---

## Executive Summary

RossOS is not just a Construction Management System—it's a **Construction Intelligence Platform** that transforms every piece of data flowing through a builder's business into actionable intelligence. Every invoice, bid, daily log, and client interaction feeds a learning engine that makes estimates more accurate, schedules more reliable, and decisions more informed.

### The Core Problem
- **Data Silos**: Buildertrend, QuickBooks, spreadsheets, and email don't talk to each other
- **Manual Lookups**: Digging through old PDFs to answer "What did we pay for that last time?"
- **Disconnected Intelligence**: Bids get filed and never seen again
- **No Learning Loop**: Past mistakes don't automatically improve future estimates

### The Solution: RossOS
A single source of truth where:
- Every document gets parsed and understood
- Every price becomes a data point
- Every schedule variance improves the next prediction
- Every vendor interaction builds their profile
- Day 1 is useful → Day 100 is smart → Day 1000 is predictive

---

## Business Context

### Target Market
- **Market**: Custom residential builders across the US
- **Location**: Multiple US markets
- **Price Range**: $500K–$5M+ construction cost (varies by market)
- **Project Types**: New construction, major renovations, remodels
- **Optional Regional Features**: Elevated construction, flood zones, hurricane-rated, coastal compliance, seismic, wildfire zones

### Operations Profile
- **Active Jobs**: 5–8 at various stages
- **Preconstruction**: 3–5 in estimating/proposal phase
- **Post-Construction**: Ongoing warranty/home care for completed homes
- **Trade Partners**: 30–50 regular subs
- **Material Suppliers**: 10–15 regular vendors

### Team Structure & Roles
| Role | Access Level |
|------|--------------|
| Company Owners | Full visibility, financial dashboards, high-level approvals |
| Director of Construction | Everything operational—estimates, schedules, budgets, vendor management |
| PM/Superintendent | Job-specific views, daily logs, field tools, RFIs |
| Admin | Invoice processing, document management, client communication |
| Trade/Vendor | Portal access for their scope—schedules, documents, pay apps |
| Client | Portal for selections, approvals, progress photos, budget visibility |

---

## Architectural Principles

1. **Everything Feeds the Intelligence Engine**
   Every document, transaction, and log entry creates data points that improve estimates, schedules, vendor selection, and risk prediction.

2. **Single Source of Truth**
   No more cross-referencing Buildertrend, QuickBooks, spreadsheets, and email. One system.

3. **Progressive Intelligence**
   - Day 1: Useful (basic project management)
   - Day 100: Smart (historical pricing, pattern recognition)
   - Day 1000: Predictive (AI-driven estimates, schedules, and risk)

4. **Builder-First, Not Generic**
   Every screen, workflow, and feature designed for custom home builders. Not adapted from commercial/industrial. Not simplified from enterprise.

5. **Regional Compliance Ready**
   Optional support for flood zones, wind ratings, elevated construction, seismic zones, wildfire zones, FEMA compliance, and premium finish expectations — configurable per market.

---

## Core Pain Points to Solve

### Estimating
| Pain Point | Priority | Solution |
|------------|----------|----------|
| Figuring out labor hours—subs bid inconsistently | Critical | Normalize all bid formats, build $/SF equivalents |
| Chasing vendor quotes for specialty items | High | Auto-request quotes, track response times |
| Material prices change constantly | High | Real-time price intelligence with trend alerts |
| Missing items in takeoffs | Critical | AI completeness checking against similar projects |
| Translating plans into scopes of work | High | Parse PDF/DWG, auto-generate preliminary scopes |

### Accuracy
| Pain Point | Priority | Solution |
|------------|----------|----------|
| Scope creep / missed items | Critical | Track allowances vs. actuals in real-time |
| Material price changes during 12+ month builds | High | Price lock dates, expiration alerts, hedging suggestions |
| Vendor surprises / change orders | High | Historical CO frequency by vendor, flag risk |
| Labor taking longer than expected | Medium | Learn actual durations, adjust future schedules |

### Data Management
| Pain Point | Priority | Solution |
|------------|----------|----------|
| Bids filed and never seen again | Critical | Parse every line item, store for future intelligence |
| None of the systems talk to each other | Critical | Single platform with bi-directional QuickBooks sync |
| Manual price lookups in old invoices | High | Instant search across all historical pricing |

---

## Intelligence Modules

### 1. Cost Intelligence Database

#### Material Price Intelligence
Track at multiple levels simultaneously:
- **Category Level**: "Interior Doors" — for high-level estimating
- **Manufacturer Level**: "TruStile" vs "Masonite" vs "Simpson" — for comparison
- **Model Level**: "TruStile TS3000 3068" — for accurate budgeting
- **Configuration Level**: With hardware, finish, frame — for final pricing

#### Price Data Sources
- **Purchase Prices**: What you actually paid (from invoices)
- **Quoted Prices**: What vendors proposed (even if not accepted)
- **Market Indices**: RSMeans, lumber futures, for context
- **Delta Intelligence**: "Vendor X always comes in 5% under their quote"

#### Volatile Materials (Priority Tracking)
1. Lumber/framing packages (20–30% swings)
2. Windows & doors (long lead times + price increases)
3. Roofing (metal especially—supply chain volatility)
4. Concrete (regional increases, fuel surcharges)
5. Electrical/copper (commodity-driven)
6. Impact glass/hurricane windows (regional specialty)
7. Cabinetry (custom = long lead + volatility)
8. Appliances (model changes, discontinuations)

#### Lead Time Intelligence
- Track quoted vs. actual delivery for every vendor/item
- Auto-calculate required order dates from construction schedule
- Alerts: "Order windows for Job X by [date] or drywall schedule slips"
- Learn patterns: "This vendor's lead times are typically 2 weeks optimistic"

**Critical Lead Times**:
- Custom windows: 16–24 weeks
- Custom cabinetry: 12–18 weeks
- Specialty doors: 8–12 weeks
- Custom metal work: Variable
- Specialty tile: 6–12 weeks

### 2. Labor Intelligence

#### Metrics to Track
| Metric | Description |
|--------|-------------|
| $/SF by trade | Cost per square foot by trade, job type, and complexity |
| Bid vs. Actual | Did the sub's bid match reality? |
| Hours per unit | Where applicable (per fixture, per door, per LF) |
| Crew size vs. production | For daily log analysis |
| Change order frequency | By trade and vendor |

#### Normalization
Convert all bid formats for comparison:
- Lump sum → equivalent $/SF
- Unit pricing → equivalent $/SF
- T&M → tracked for warranty/punch work

**Example**: "If one electrician bids lump sum and another bids per-outlet, calculate equivalent $/SF for comparison"

### 3. Vendor Intelligence

#### Vendor Scorecard Metrics
| Metric | Weight | Description |
|--------|--------|-------------|
| Reliability | High | Shows up when promised, does what they say |
| Quality | High | Minimal callbacks, clean work |
| Communication | Medium | Responsive, proactive about issues |
| Price Competitiveness | Medium | Competitive but not necessarily cheapest |
| Warranty Support | Medium | Stands behind work when issues arise |
| Schedule Impact | High | "When this vendor is late, it cascades to X trades" |
| Safety Record | Medium | Incidents on your jobs |
| Lien Waiver Compliance | Medium | Submit on time? |
| Insurance Currency | Medium | COI always current? |
| Jobsite Cleanliness | Low | Site respect |
| Billing Accuracy | Medium | Do they try to overbill? |

#### Team Intelligence
Track specific crew leads/foremen:
> "John's crew from ABC Electric averages $4.10/SF for rough-in vs. ABC's company average of $4.35/SF"

#### Capacity Tracking
> "Vendor X currently has 3 jobs with you + estimated 5 other jobs—may be stretched thin"

#### Automated Features
- Auto-generate bid packages scoped from plans
- Send bid invitations to recommended vendors
- Track bid status (sent, viewed, responded, declined)
- Side-by-side comparison with historical context
- Flag missing scope items: "Vendor X didn't include permit fees—they usually do"
- Detect pricing anomalies: "ABC Electric is 15% high compared to the Johnson Project"

### 4. Schedule Intelligence

#### Template-Based Scheduling
Start with intelligent templates that auto-adjust:
> "A 3,500 SF custom home typically takes 14 months. Here's the baseline schedule with your preferred vendors' typical durations."

#### Pain Points to Solve
1. Vendors not showing up / delayed starts
2. Inspection delays (varies by jurisdiction)
3. Weather delays (regional: hurricanes, winter storms, fire season, etc.)
4. Client selection delays holding up orders
5. Permit processing times (varies by jurisdiction)
6. Dependency cascades

#### AI Capabilities
- Auto-update from daily log entries
- Integrate weather forecasts → flag at-risk outdoor tasks
- Track inspection scheduling automatically
- Monitor client selection deadlines
- Predict completion dates with confidence intervals:
  > "85% likely to complete by March 15, 95% by April 1"
- Identify schedule float and suggest reordering
- **Tide chart integration** for waterfront jobs (optional regional feature)

#### Granularity
- **Phase Level**: Preconstruction, Foundation, Framing, Dry-in, MEP Rough, Insulation, Drywall, Finishes, Trim, Final
- **Task Level**: Each trade's rough-in, finish, and inspection
- **Daily granularity** (not hourly)
- **Factors**: Job size, complexity, vendor, season, region

### 5. Estimating Intelligence

#### Accuracy Tracking
Track WHERE estimates are off, not just overall:
- By cost code category
- By job type (new vs. renovation, 1-story vs. 2-story)
- By complexity factors

#### AI Features
| Feature | Description |
|---------|-------------|
| Completeness Check | "You're missing [common item] for this project type" |
| Auto-Fill Pricing | Pre-populate with current pricing from database |
| Bias Detection | "Your electrical estimates are typically 8% low" |
| Markup Suggestions | Based on complexity, client type, market conditions |
| Plan Parsing | Read plans, auto-generate preliminary estimates |
| Scope Gap Detection | "No one covering soffit framing—is that in framing or siding scope?" |
| Unusual Item Flags | "This calls for a 22' steel beam—confirm engineer specs" |

#### Assemblies
Auto-updating assemblies that recalculate when component prices change:
- "Bathroom Assembly - Master" = tile, fixtures, plumbing rough/trim, electrical rough/trim, drywall, paint, hardware, glass enclosure, vanity, mirror, accessories
- "Foundation Assembly - Elevated" = pilings, pile caps, grade beams, stem walls, fill, termite treatment, waterproofing

#### The Feedback Loop
> "This is the core feature. The software must get smarter with every job we build."

- Auto-compare estimate line items to actual costs
- Identify systematic biases
- Suggest adjustments to future estimates
- Factor in job characteristics

### 6. Document Intelligence

#### Document Types
- Invoices (PDFs)
- Bids/Quotes
- Construction plans (PDF/DWG)
- Engineering reports
- Permit documents
- Inspection reports
- Lien waivers
- Insurance certificates (COIs)
- Warranty documents
- Client correspondence
- Photos
- AIA pay applications (G702/G703)
- Selection sheets

#### Quote/Bid Processing
- Extract all line items automatically
- Match to cost code structure
- Identify scope gaps (what's NOT included)
- Check vendor insurance/license status
- Generate comparison matrix
- Store for price intelligence
- Flag exclusions: "This vendor excluded [item] they included on last 3 jobs"

#### Contract Analysis
- Lien rights language
- Retainage terms
- Warranty duration and limitations
- Dispute resolution clauses
- Schedule/liquidated damages
- Compare to standard template, highlight deviations

#### Invoice Processing (Adaptive.build-style)
- Auto-match to PO/contract and budget line items
- Two-stage approval workflow (field verify → office approve)
- Track against contract value and change orders
- Partial payment support
- Retainage calculation and tracking
- Lien waiver enforcement
- Sales tax verification (per jurisdiction)
- Auto-classify to QuickBooks cost codes
- Duplicate detection across jobs

### 7. Project Intelligence

#### Real-Time Dashboard
| Metric | Description |
|--------|-------------|
| Budget Status | Contract vs. billed vs. paid vs. remaining |
| Change Orders | Approved, pending, anticipated |
| Schedule Status | Days ahead/behind, critical path items |
| Cash Flow | Next draws due, vendor payments due |
| Outstanding Items | Open RFIs, pending selections, inspections |
| Risk Items | What could go wrong next |
| Client Satisfaction | Communication temperature |
| Documentation | Photos, logs, lien waivers current? |
| **Projected Profitability** | Forecasted profit based on cost to complete |

#### Proactive Alerts
- "Insurance certificate for [vendor] expires in 14 days"
- "Permit #X expires in 30 days—schedule remaining inspections"
- "Client hasn't responded to selection request in 7 days"
- "Retainage on Job X is $45K—release at substantial completion (30 days)"
- "Weather forecast shows 5 rain days—adjust outdoor tasks"
- "You haven't billed the owner in 45 days—prepare draw request"
- "Similar job [Y] had overrun at this phase—watch for [issue]"
- "3 jobs needing TruStile doors in 4 months—consider bulk order"

#### Cross-Job Pattern Recognition
- Vendor combinations that work best together
- Time of year impact on trades
- Client type correlations (referral vs. online leads)
- Site characteristic impacts (urban vs. rural, coastal vs. inland, etc.)
- Scope definition quality vs. overrun correlation

### 8. Client Intelligence

#### Client Profile Metrics
- Selection decision speed
- Communication preferences
- Budget sensitivity level
- Decision influencers (spouse, designer, architect)
- Past referrals given
- Warranty request frequency
- Payment promptness on draws

#### Communication Analysis
- Flag keywords indicating frustration
- Track response times (yours and theirs)
- Identify patterns: "Client emails increase 3x when schedule slips"
- **NOT automated responses**—intelligence to help team communicate better

#### Learned Preferences
- Finish level (luxury vs. practical)
- Design style (modern, coastal, traditional)
- Preferred brands/suppliers
- Communication frequency
- Detail level in updates
- Feeds into selections module for pre-populated options

---

## Feature Modules

### Core Platform (Phase 0: Foundation)

#### Pre-Construction
- Lead intake from website (builder website integration)
- Lead qualification scoring
- Preconstruction workflow: Inquiry → Qualification → Estimate → Proposal → Contract
- Preliminary estimating from minimal inputs
- Proposal generation with professional formatting
- Contract generation from templates
- Seamless transition to active job

#### Jobs & Execution
- Job dashboard with all key metrics
- Phase-based project organization
- Task management with dependencies
- Daily log entry (mobile-first)
- Photo documentation (auto-geotagged, timestamped)
- **Voice-to-text** for logs and notes

#### Financial
- Budget management with cost code structure
- Invoice processing with AI extraction
- Draw request preparation (AIA G702/G703)
- Payment tracking and approval workflow
- Retainage management
- QuickBooks two-way sync
- Cash flow forecasting
- WIP reporting

#### Directory
- Vendor database with full profiles
- Insurance/license expiration tracking
- W-9 and lien waiver management
- Client database with history
- Employee/team management

### Selections Management (Materio-style)

#### Categories
Flooring, tile, countertops, cabinetry, plumbing fixtures, lighting, appliances, hardware, paint colors, exterior finishes, roofing, windows/doors

#### Features
- Allowance tracking: Budget vs. actual selection cost
- Vendor integration: Specs, pricing, availability, lead times
- Visual presentation: Curated options with photos and pricing
- Approval workflow: Client selects → Builder reviews → Generates PO → Tracks order
- Schedule integration: Auto-calculated deadlines
- Change order auto-generation: When selection exceeds allowance
- Designer collaboration portal

#### Integration Impact
> "When a client picks 'Tile A' in the portal, it instantly updates the Budget (Material Cost), the Schedule (Lead Time), and the Scope of Work for the tile setter."

### Live Checklists & Punch Lists (ReportandGo-style)

#### Predefined Checklists by Phase
- Pre-pour checklist (rebar, forms, embeds, inspection)
- Framing checklist (layout, sheathing, hurricane straps, openings)
- MEP rough-in checklist per trade
- Pre-drywall walk checklist
- Final punch list by room

#### Field Features
- Pass/fail/NA per item
- Photo attachment per item
- Responsible party assignment
- Due dates
- Status tracking (open, in-progress, complete, verified)

#### Smart Learning
- "This vendor typically has issues with [X]—add to their checklist"
- Auto-populate from historical punch data

#### Vendor Portal Integration
Vendor sees their punch items, marks complete, builder verifies

### RFI Management

- Create from field with photos and markups
- Route to architect/engineer/client
- Track response times
- Log cost and schedule impact
- Link to change orders when applicable
- Learn: "RFIs about [topic] typically result in $X change orders"

### Change Order Management

- Full lifecycle: Identify → Price → Propose → Negotiate → Approve → Execute → Bill
- Auto-populate pricing from cost intelligence
- Client-facing portal with digital signature
- Running total impact on contract and schedule
- Categorization: Owner-requested, unforeseen condition, design error, code requirement
- Analytics: Frequency and cost by source, trade, project type

### Submittals Management

- Submittal log with routing
- Approval workflow
- Version tracking
- Deadline management
- Link to specifications

### Warranty & Home Care (Post-Construction)

#### Warranty Tracking
- Start dates, durations, coverage by trade and component
- Service request portal: Client submits → Auto-routes to vendor
- Preventive maintenance reminders for homeowner
- Home care subscriptions (recurring service packages)

#### Knowledge Base Per Home
- As-built specs
- Material selections
- Paint colors
- Vendor contacts
- Appliance manuals
- Warranty cards

#### Annual Inspections
Scheduled walk-through with checklist, generate report

### Plan Room / Document Management

- Central repository for all project documents
- Version control on plans (revisions, current set)
- Plan markup and annotation
- Automatic distribution to trades
- OCR and AI parsing
- Cross-job search

### Communication Hub

- Unified message center (team, vendors, clients)
- Thread by job, topic, or trade
- Auto-log as project record
- Client-facing messaging (professional, trackable)
- Configurable notifications by role
- Daily digest option

### Safety & Compliance

- OSHA compliance checklists
- Safety incident logging
- Vendor safety documentation
- Job site inspection schedules
- Weather-related safety alerts
- Insurance claim documentation

### Permitting & Inspection Tracking

- All permits by jurisdiction and type
- Application status monitoring
- Inspection scheduling and results
- Inspector contact info and preferences
- Auto-request based on milestones
- Expiration tracking
- **Regional Special Permits**: FEMA, Army Corps, state environmental agencies, and jurisdiction-specific requirements (configurable per market)

### Time Tracking

- Time clock for field staff
- Integration with payroll
- Productivity tracking
- Job costing for in-house labor

### Mobile-First Field Tools

#### Daily Log Entry
- Weather conditions (auto-populated from API)
- Workforce tracking (who's on site, hours, headcount)
- Work performed narrative
- Material deliveries
- Visitor log
- Safety observations
- Photos (auto-geotagged, timestamped)

#### Key Features
- **Offline capability** (sync when connected—critical for remote job sites)
- Quick capture: Photo → Annotate → Assign → Track
- **Voice-to-text** for logs and notes

### Visual Plan Interaction

> "Upload PDF blueprints. Click a room on the plan to see all associated tasks, costs, and selections for that specific room."

### Weather Integration (Regional)

- Auto-log weather daily (for excusable delays)
- Storm warnings affecting schedule
- **Tide chart integration** for waterfront jobs (optional)
- Regional weather awareness (hurricanes, winter storms, fire season, etc.)

---

## Automation Levels

### Level 2-3: Auto Low-Risk, Suggest High-Risk

#### Auto-Execute (No Human Approval)
- Invoice data extraction
- Cost code classification
- Document filing
- Daily log parsing
- Schedule status updates from logs
- Insurance expiration alerts
- Weather-based schedule flags
- Photo organization
- Lien waiver tracking

#### Suggest (Human Reviews)
- Budget alerts
- Vendor recommendations
- Estimate adjustments
- Schedule optimizations
- Payment scheduling
- Bid comparisons
- Risk flags

#### Human Always Required
- **Payment approvals** (always click the final "Pay" button)
- Client-facing communication (AI drafts, human sends)
- Contract execution
- Change order approval
- Vendor termination
- Final estimate approval
- Draw request submission

---

## Client-Facing Features

### What Clients See
- Real-time budget dashboard (summary level, not vendor costs)
- Live schedule with milestones and predictions
- Photo timeline by phase
- Selection portal with options, prices, lead times
- Approval workflows with digital signatures
- Quality documentation (inspections, certifications)
- Post-completion warranty portal

### What Clients DON'T See
- Vendor scorecards
- Internal profitability
- Markup details
- Cost breakdowns by vendor

### Marketing Differentiators
1. **"Complete cost transparency from estimate to final invoice"** — custom home clients want this
2. **"AI-powered scheduling that predicts and prevents delays"** — everyone hates uncertainty
3. **"Your own project portal with real-time visibility"** — tech-savvy clients expect this

---

## Reporting & Insights

### For Owners/Directors
- Company-wide dashboard: All jobs at a glance
- Cash flow projection across all jobs
- Profitability by job, trade, job type
- Vendor performance rankings
- Pipeline: Leads → Estimates → Contracts → Active → Complete
- WIP (Work in Progress) report

### For Operations/Team
- Daily: What's happening today across all jobs
- Weekly: Schedule look-ahead, deliveries, inspections
- Job-specific: Budget status, change orders, outstanding items
- Punch lists by trade

### For Clients
- Monthly progress report: Photos, schedule, budget summary, milestones
- Selection status: Chosen, pending, late
- Change order log with running total

### For Accountant
- Job cost reports by cost code
- WIP schedule
- Accounts payable aging
- Retainage summary
- 1099 preparation data

### For Bank/Lender
- Draw request packages with documentation
- Project status summary
- Budget vs. actual with variance explanation

### AI-Generated Insights
| Frequency | Content |
|-----------|---------|
| Daily | "Here's what needs your attention today" (prioritized) |
| Weekly | "3 invoices pending ($47K), 2 selections overdue, Vendor X unconfirmed" |
| Monthly | Cost trends, vendor performance shifts, schedule acceleration/deceleration |
| Quarterly | Profitability analysis, estimating accuracy review, vendor relationship health |
| Annual | Year-in-review metrics, pricing trends, capacity planning |

---

## Data Bootstrapping

### Typical Historical Data Sources
- **Daily log entries** from existing PM software (Buildertrend, CoConstruct, Procore, etc.)
- **QuickBooks data**: All invoices, payments, vendor history
- **Existing PM platform**: Budgets, schedules, communications, photos, documents
- **Email archives**: Vendor quotes, bids, correspondence
- **Spreadsheets**: Various tracking and analysis
- **Past estimates and proposals**

### Import Strategy
1. Import everything available to jumpstart AI
2. Prioritize: QuickBooks invoices (pricing), existing budgets (estimate vs. actual), daily logs (schedule)
3. Clean and normalize during import
4. Continue learning from every new document

### Benchmark Data
- RSMeans for baseline context and new categories
- **Primary source**: YOUR data—each builder's costs reflect their specific market and construction type
- Regional adjustments critical—local markets ≠ national averages

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Supabase, PostgreSQL, Edge Functions, Row Level Security |
| AI | Claude API, OCR, Pattern Learning |
| Integrations | QuickBooks (two-way), Stripe, SendGrid, Twilio |
| Mobile | PWA with offline capability |
| Documents | PDF parsing, plan markup, version control |

---

## Success Metrics

### For Each Builder
- Estimating accuracy improves from ±10% to ±5%
- Time to create estimate reduced by 60%
- Schedule prediction accuracy >90%
- Vendor payment processing time reduced by 70%
- Client communication response time tracked and improved
- Zero missed insurance/license expirations

### For the Platform (Marketing)
- 112 views across 7 phases
- Full construction workflow coverage
- Multi-tenant architecture for future growth
- AI features that compound in value over time

---

## Summary

> "RossOS needs to be the 'Operating System' for the business. It consumes data (docs, logs, bids), structures it (database), and outputs intelligence (better estimates, tighter schedules, higher profit). It replaces the fragmented stack of Excel + Dropbox + Email + Mental Math."

The platform is designed to be:
- **Intelligence-first**: Every feature feeds the learning engine
- **Builder-specific**: Not adapted from generic project management
- **Region-aware**: Configurable for any US market's construction realities
- **Progressive**: Gets smarter with every transaction
- **Single-source**: Eliminates data silos permanently

---

*Document Version: 1.0*
*Synthesized from comprehensive planning feedback*
*Last Updated: February 2026*
