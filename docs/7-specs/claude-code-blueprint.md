# CLAUDE CODE MASTER BLUEPRINT
## Construction SaaS Platform — Complete Processing Methodology
### Version 1.0 | February 2026

---

# PART 1: HOW CLAUDE CODE SHOULD RECEIVE & PROCESS THIS ENTIRE PLAN

---

## 1.1 THE MASTER PROCESSING LOOP

Claude Code should process this platform build using a **Research → Validate → Plan → Build → Test → Connect** loop. Every single gap item, every feature, every workflow gets run through this loop before code is written.

### Step 1: INGEST
```
Claude Code receives:
├── platform-spec-answers.md      (Business requirements / questionnaire)
├── gap-analysis-expanded.md       (910 gap items organized by category)
├── claude-code-blueprint.md       (THIS FILE — processing rules + missing items)
└── Any future spec documents
```

### Step 2: BUILD THE CHECKLIST DATABASE
Claude Code should convert every numbered gap item into a structured checklist entry stored in a tracking file:

```json
{
  "id": "GAP-001",
  "category": "SaaS Architecture & Multi-Tenancy",
  "question": "Is data stored in shared tables with tenant_id filtering, or separate databases per customer?",
  "status": "not_started",
  "decision": null,
  "decision_rationale": null,
  "impacts": [],
  "affected_files": [],
  "priority": "P0",
  "depends_on": [],
  "blocks": [],
  "validated": false,
  "implementation_notes": null
}
```

### Step 3: PROCESS EACH ITEM THROUGH THE VALIDATION LOOP

For EACH checklist item, Claude Code should:

```
1. RESEARCH
   - Does the current codebase/plan already address this? (Search all project files)
   - What do competitors do? (Reference the competitive analysis in this doc)
   - What's the best practice in construction software?
   - What's the best practice in SaaS architecture?
   
2. ANSWER: YES or NO
   - YES = This is handled. Document WHERE and HOW.
   - NO = This is a gap. Proceed to step 3.
   - PARTIAL = Some aspects handled, others not. Document what's missing.

3. IF NO → PLAN THE FIX
   - What module does this belong to?
   - What database tables/columns are needed?
   - What API endpoints are needed?
   - What UI components are needed?
   - What other gap items does this connect to?
   - What's the minimum viable implementation?
   - What's the ideal implementation?

4. IMPACT ANALYSIS
   - What existing files need to change?
   - What new files need to be created?
   - Does this affect the data model?
   - Does this affect any API contracts?
   - Does this affect any UI flows?
   - Does this create a dependency on another gap item?

5. UPDATE ALL AFFECTED FILES
   - Update the data model document
   - Update the API spec document
   - Update the UI wireframe/component list
   - Update the dependency graph
   - Update the build order/priority list
   - Update the testing checklist

6. MARK AS PLANNED
   - Set status to "planned"
   - Record all decisions and rationale
   - List all affected files
```

### Step 4: DEPENDENCY RESOLUTION

After processing all items individually, Claude Code should:

```
1. Build a dependency graph of ALL items
2. Identify circular dependencies and resolve them
3. Identify items that MUST be built first (foundations)
4. Group items into logical build phases
5. Create the final build order
```

### Step 5: GENERATE BUILD PHASES

Output a phased build plan where each phase:
- Has clear entry criteria (what must be done before starting)
- Has clear exit criteria (what must be true when complete)
- Has a defined set of gap items it addresses
- Has a test plan that validates all items in the phase
- Produces a working, deployable increment

---

## 1.2 FILE STRUCTURE CLAUDE CODE SHOULD MAINTAIN

```
project-root/
├── docs/
│   ├── specs/
│   │   ├── platform-spec-answers.md          # Original requirements
│   │   ├── gap-analysis-expanded.md          # 910+ gap items
│   │   └── claude-code-blueprint.md          # THIS FILE
│   ├── architecture/
│   │   ├── system-architecture.md            # High-level architecture decisions
│   │   ├── data-model.md                     # Complete database schema
│   │   ├── api-spec.md                       # All API endpoints
│   │   ├── multi-tenancy-design.md           # Tenant isolation strategy
│   │   ├── configuration-engine.md           # How settings/customization works
│   │   └── ai-engine-design.md              # Intelligence/ML architecture
│   ├── modules/
│   │   ├── 01-auth-and-access.md            # Per-module detailed spec
│   │   ├── 02-lead-pipeline.md
│   │   ├── 03-estimating.md
│   │   ├── ... (one per module)
│   │   └── 48-disaster-recovery.md
│   ├── ui/
│   │   ├── design-system.md                  # Component library / design tokens
│   │   ├── page-specs/                       # Per-page detailed specs
│   │   │   ├── dashboard.md
│   │   │   ├── project-list.md
│   │   │   ├── project-detail.md
│   │   │   └── ... (every page)
│   │   ├── user-flows/                       # Step-by-step user journeys
│   │   │   ├── new-project-creation.md
│   │   │   ├── invoice-processing.md
│   │   │   └── ... (every major flow)
│   │   └── ux-principles.md                  # UX rules for this platform
│   ├── checklists/
│   │   ├── gap-tracker.json                  # Status of all 910+ items
│   │   ├── build-phases.md                   # Phased build plan
│   │   ├── dependency-graph.md               # What depends on what
│   │   └── test-plan.md                      # What to test at each phase
│   └── research/
│       ├── competitor-analysis.md            # What each competitor does
│       ├── apps-we-replace.md                # The 10+ apps we're replacing
│       ├── state-regulations.md              # State-by-state legal requirements
│       └── construction-workflows.md         # Real-world builder workflows
├── src/                                       # Source code (organized by module)
├── tests/                                     # Test suites
└── scripts/                                   # Build/deploy/migration scripts
```

---

## 1.3 RULES FOR CLAUDE CODE WHEN BUILDING

### RULE 1: Never Hardcode What Should Be Configurable
Before writing ANY value into code, ask: "Would a different builder want this to be different?"
- If YES → It's a setting in the configuration engine
- If NO → It can be hardcoded (rare)

**Examples of things that MUST be configurable:**
- Cost code structures and hierarchies
- Approval workflow chains and thresholds
- Required fields on any form
- Terminology (vendor vs. subcontractor vs. trade partner)
- Numbering formats (CO-001 vs. 2024-PRJ-CO-001)
- Tax rates and rules
- Lien waiver forms by state
- Markup and fee calculations
- Document templates
- Notification triggers and recipients
- Portal content and access levels
- Dashboard widgets and layout
- Report templates and scheduling
- Phase names and sequences
- Status labels and workflows

### RULE 2: Every Piece of Data Feeds Intelligence
Every data entry, every transaction, every document should feed the AI intelligence engine. When building ANY feature, ask:
- What can be learned from this data over time?
- How can this data improve predictions for this builder?
- How can anonymized data improve predictions platform-wide?
- What patterns should the AI watch for?

### RULE 3: Everything Connects — No Dead Ends
No module should be an island. Every piece of data should trace back and forward through the full chain:
```
Lead → Estimate → Contract → Budget → Schedule → Daily Log → 
Invoice → Payment → Lien Waiver → Draw Request → Financial Report
```
When building any feature, verify:
- Where does this data come FROM?
- Where does this data flow TO?
- What other modules need to READ this?
- What other modules need to WRITE to this?
- What happens when this data CHANGES?

### RULE 4: Build for the User Who Hates Software
The target user is a construction superintendent with muddy boots, a cracked phone screen, and 5 minutes between site visits. Every feature must be:
- Usable with one hand on a phone
- Completable in under 60 seconds for field tasks
- Obvious without training for basic tasks
- Available offline for field operations
- Forgiving of mistakes (undo everything)

### RULE 5: Tenant Isolation Is Non-Negotiable
Every single database query, every API endpoint, every file access MUST be scoped to the current tenant. There is ZERO tolerance for data leakage between builders.

### RULE 6: Configuration Over Code
When a builder wants something to work differently, the answer should NEVER be "we need to deploy a code change." It should ALWAYS be "change this setting."

### RULE 7: AI Suggests, Humans Decide (By Default)
The AI should suggest, auto-fill, recommend, and flag — but the human always has the final say. Automation levels should be configurable per builder, per feature.

---

# PART 2: THE COMPLETE APP REPLACEMENT MATRIX

> This is the list of applications that custom home builders currently juggle. Our platform must replace ALL of them with better, connected alternatives.

---

## 2.1 APPS BUILDERS CURRENTLY USE (AND WE MUST REPLACE)

| Category | Apps They Use | What They Do | Our Module | Our Advantage |
|----------|--------------|--------------|------------|---------------|
| **Project Management** | Buildertrend, CoConstruct, BuildBook, BuildTools, Procore, ConstructionOnline, 123worx | Scheduling, to-dos, daily logs, documents | Core PM | AI-powered scheduling that learns from history; every log entry feeds intelligence |
| **Accounting** | QuickBooks (Desktop/Online), Sage, Xero, FreshBooks, CHS | AP/AR, payroll, GL, financial reporting | Financial Management + QB Sync | Construction-native job costing that syncs bi-directionally; no double entry |
| **Estimating** | Buildxact, RSMeans, Excel spreadsheets, ProEst, Clear Estimates, PlanSwift | Takeoffs, cost estimating, bid creation | Estimating Engine | AI learns from every completed project to improve estimates; auto-updates material pricing |
| **Invoice Processing** | Adaptive.build, Bill.com, DEXT, Hubdoc, manual entry | Scanning, coding, approving invoices | Invoice AI | Auto-extract, auto-code, auto-route with configurable approval chains |
| **Selections** | Materio, Houzz Pro, spreadsheets, Pinterest boards | Client finish/material selections | Selections Portal | Integrated with budget (real-time allowance impact), schedule (lead times), and procurement (auto-PO) |
| **Punch Lists / QA** | ReportandGo, PunchList Manager, Fieldwire | Field checklists, defect tracking | Quality & Punch | Photo-documented, vendor-assigned, warranty-linked, location-tagged on plans |
| **Lien Waivers** | Built, Levelset, Siteline, manual PDF/fax | Create, send, track, collect waivers | Lien Waiver Engine | State-specific forms auto-generated; tied to invoice/payment/draw chain; no vendor account required |
| **Draw Requests** | Excel, Built, manual AIA forms | Create and submit draws to lenders | Draw Management | Auto-generated from approved invoices; AI calculates recommended billing; lender-formatted packages |
| **CRM / Lead Tracking** | HubSpot, Salesforce, spreadsheets, Houzz | Lead capture, follow-up, pipeline | Lead Pipeline | Construction-specific qualification; auto-estimate from lead data; referral tracking |
| **Client Communication** | Email, text, WhatsApp, phone calls | Updates, approvals, questions | Client Portal | Branded portal with real-time budget/schedule; selection approvals; draw visibility; warranty requests |
| **Document Management** | Google Drive, Dropbox, Box, email attachments | Plans, contracts, COIs, photos | Document Hub | AI auto-categorized; version-controlled; expiration-tracked; plan markup; full-text search |
| **Scheduling** | Microsoft Project, Excel, whiteboards, Buildertrend | Gantt charts, calendars, trade coordination | Schedule Engine | AI learns task durations from history; weather integration; resource leveling across all jobs |
| **Time Tracking** | TSheets/QuickBooks Time, Busybusy, ClockShark | Employee/sub time logging | Time & Labor | GPS-verified; ties to job costing; calculates labor burden; overtime alerts |
| **Fleet / GPS** | Verizon Connect, GPS Trackit, Samsara | Vehicle tracking, mileage, fuel | Fleet Management | Integrated with time allocation; auto-assigns travel time to projects; maintenance alerts |
| **Contracts / E-Sign** | DocuSign, HelloSign, PandaDoc | Contract generation and execution | Contract Engine | Template library with clause builder; state-specific language; integrated with scope/budget |
| **Photo Documentation** | CompanyCam, smartphone cameras, Google Photos | Job site photos | Photo & Media | AI auto-tags by trade/phase/room; ties to daily logs; comparison tools; marketing portfolio |
| **Safety** | iAuditor/SafetyCulture, paper forms | Inspections, incident reports, OSHA | Safety & Compliance | Integrated with vendor performance; certification tracking; auto-OSHA reporting |
| **Warranty** | Spreadsheets, email, Buildertrend warranty module | Post-completion service requests | Warranty & Home Care | Full history from construction; vendor responsibility auto-assigned; subscription home care |
| **Vendor Compliance** | Spreadsheets, email chasing | COI tracking, license verification | Vendor Management | Auto-expiration alerts; one-click renewal requests; compliance blocks payment if expired |
| **Permit Tracking** | Spreadsheets, municipal portals | Application status, inspection scheduling | Permits & Inspections | Multi-jurisdiction tracking; inspection result auto-feeds daily log; CO milestone integration |
| **Material Pricing** | Supplier websites, phone calls, email quotes | Getting current pricing | Price Intelligence | AI monitors pricing trends; alerts on cost increases; historical comparison; auto-updates estimates |
| **Design Collaboration** | Email, Dropbox, Newforma | Plan distribution, RFI management | Design Integration | Plan version control; RFI tied to markup on plans; submittal management; auto-distribution |
| **Reporting** | Excel, custom reports, Buildertrend reports | Financial, project, and management reports | Report Engine | AI-generated narratives; configurable dashboards; real-time data; scheduled auto-delivery |
| **Marketing / Portfolio** | Website CMS, social media, Houzz | Showcasing completed projects | Marketing & Portfolio | Auto-curated from project photos; case study generation; review collection; ROI tracking |
| **Home Automation** | Various (Savant, Control4, Crestron) | Smart home pre-wire and setup | Home Tech Integration | Track pre-wire scope; smart home commissioning checklists; client training documentation |

**TOTAL APPS REPLACED: 25+ individual tools → 1 integrated platform**

---

## 2.2 THE POWER OF CONNECTION (What No One Else Does)

The real value isn't in having all these features — it's in having them **connected** so data flows without re-entry:

### Connection Chains (Every One Must Work End-to-End):

**Chain 1: Lead to Revenue**
```
Website inquiry → Lead captured → Qualification score assigned →
Preliminary estimate auto-generated from similar projects →
Preconstruction agreement signed → Design iterations tracked →
Final estimate from plans → Contract generated → Contract executed →
Project activated → Budget created from estimate → Schedule created →
... (construction happens) ... → Final draw submitted →
Warranty period begins → Home care subscription offered →
Client review requested → Referral program triggered
```

**Chain 2: Plan to Payment**
```
Plans uploaded → AI identifies rooms/areas → Estimating assemblies suggested →
Bid packages generated by trade → Sent to qualified vendors →
Bids received and parsed by AI → Bid comparison auto-generated →
Vendor selected → Subcontract generated with scope from bid →
PO created → Material ordered → Delivery tracked →
Work scheduled → Work performed (logged in daily log) →
Invoice received → AI extracts and codes → Matched to PO/contract →
Budget impact calculated → Approval routed → Payment scheduled →
Lien waiver requested → Lien waiver received →
Draw request line item updated → Payment sent
```

**Chain 3: Problem to Resolution**
```
Issue identified in field (daily log, inspection, punch) →
Responsible trade auto-identified from schedule →
Correction assigned with deadline → Vendor notified →
Vendor acknowledges → Work completed → Photos uploaded →
Verification inspection → Item closed →
Vendor performance score updated → Cost tracked →
Back-charge generated if applicable → Pattern detected for future projects
```

**Chain 4: Change to Cash**
```
Client requests change → RFI created if design clarification needed →
RFI response received → Change order drafted with:
  - Cost impact (material + labor + markup, auto-calculated)
  - Schedule impact (auto-calculated from task dependencies)
  - Specification update →
Client reviews in portal → Client approves with e-signature →
Contract value updated → Budget updated → Schedule updated →
New/revised POs generated → Vendor notified →
Draw request schedule adjusted → Client portal updated with new totals
```

**Chain 5: Intelligence Loop**
```
Every completed project feeds:
  → Actual vs. estimated cost by line item
  → Actual vs. estimated duration by task
  → Vendor performance metrics
  → Material pricing history
  → Weather impact data
  → Change order patterns
  → Inspection pass/fail rates
  → Client satisfaction data

Which improves for the NEXT project:
  → More accurate estimates
  → More realistic schedules
  → Better vendor recommendations
  → Smarter material pricing
  → Weather-adjusted planning
  → Proactive risk identification
  → Better client expectation setting
```

---

# PART 3: EVERYTHING THAT'S MISSING — ADDITIONS TO THE GAP ANALYSIS

> Based on extensive research into what builders actually do daily, competitor analysis, and construction industry workflows, here are the items NOT in the original 910 that MUST be added.

---

## 3.1 THE COMPLETE CONSTRUCTION LIFECYCLE (Every Step the Software Must Track)

The software must track the ENTIRE lifecycle of a custom home project. Here is every step, in order, with what the software must do at each:

### PHASE 0: BUSINESS DEVELOPMENT (Before the Lead)
911. Marketing campaign management — track ROI by channel (Houzz, website, social, referral, Parade of Homes, print)
912. Website integration — lead capture forms that auto-create leads in the pipeline
913. SEO/content tracking — which blog posts, portfolio pages drive inquiries
914. Networking/event tracking — track industry events, builder association meetings, relationships cultivated
915. Strategic lot tracking — monitor lots for sale that match your ideal build profile
916. Builder reputation monitoring — track online reviews across Google, Houzz, BBB, Yelp; alert on new reviews
917. Competitive intelligence — track competitor pricing trends, new starts, marketing activity (manual entry)

### PHASE 1: LEAD & QUALIFICATION
918. Multi-channel lead intake — website form, phone log, email, referral, Houzz message, walk-in → all land in one pipeline
919. Automated lead response — configurable auto-reply acknowledging inquiry within minutes
920. Lead scoring algorithm — budget realism (Do they own a lot? Is financing pre-approved? Is their budget realistic for what they want?), timeline fit, project type match, referral source quality
921. Lead nurturing sequences — automated email drips configurable per builder (monthly newsletter, recent project showcase, educational content)
922. Initial consultation checklist — configurable list of questions for the first meeting (budget, lot, timeline, must-haves, design preferences, previous building experience)
923. Consultation notes and follow-up tracking — what was discussed, what were their reactions, next steps, follow-up date
924. "Dream board" capture — log the client's inspiration images, must-have features, lifestyle needs during initial conversations
925. Lot evaluation checklist — if they have a lot: zoning, setbacks, easements, flood zone, soil conditions, utility availability, HOA restrictions, tree survey, survey availability, environmental concerns
926. Quick feasibility calculator — "Based on your lot, your wishes, and current costs, a rough range is $X-$Y" — configurable formula per builder

### PHASE 2: PRECONSTRUCTION & DESIGN
927. Design team assembly — track architect, engineer, interior designer, landscape architect with contact info, contracts, and deadlines
928. Design milestone tracking — concept → schematic → design development → construction documents, with client review gates at each
929. Design meeting management — schedule, agenda, attendees, minutes, decisions, action items for every design meeting
930. Preliminary budget tracking across design iterations — as design develops, estimate updates at each milestone to keep client informed
931. Preconstruction agreement management — separate contract for paid design/planning phase; track billing against this separately from construction
932. Geotechnical report tracking — soil boring results, foundation recommendations, cost implications
933. Survey management — boundary, topographic, tree, and elevation surveys; track who ordered, when received, results
934. Environmental assessment tracking — wetlands delineation, protected species surveys, stormwater requirements
935. HOA/deed restriction checklist — architectural review board requirements, submission deadlines, approval status
936. Utility coordination tracker — water, sewer, electric, gas, cable/internet — application status, connection fees, timeline
937. Impact fee calculator — by jurisdiction; school impact, transportation impact, park impact, fire impact fees
938. Design coordination issue log — track conflicts between architectural, structural, MEP, and interior design; who needs to resolve what

### PHASE 3: ESTIMATING & BIDDING
939. Plan set distribution management — track which version of plans went to which vendors, with read receipts
940. Bid invitation tracking — who was invited, who declined, who acknowledged, who submitted, who is late
941. Bid leveling tools — normalize bids from different vendors to compare apples to apples (some include dumpster, some don't; some include permit, some don't)
942. Scope gap detection — AI identifies items in the plans that no vendor bid covers (the "who's responsible for this?" gap)
943. Value engineering tracker — alternative approaches that save money without sacrificing quality; track options presented to client with savings amounts
944. Allowance strategy builder — for items not yet selected, set allowance amounts based on intelligence engine (historical data for similar selections at this tier)
945. Estimate presentation builder — generate client-facing estimate at configurable detail level with builder branding
946. Pre-construction cost tracker — design fees, engineering, survey, geotech, permit fees, impact fees — all tracked separately from construction budget
947. Construction cost escalation calculator — if project won't start for 6 months, estimate material/labor cost increases

### PHASE 4: CONTRACT & FINANCING
948. Contract type configurator — cost-plus, GMP, fixed-price, hybrid — each with different tracking requirements
949. Contract milestone/draw schedule builder — link contract payment milestones to construction schedule milestones
950. Financing coordination tracker — construction loan application status, appraisal management, lender requirements, inspection schedule
951. Lender draw format manager — different lenders require different draw formats; store and manage lender-specific templates
952. Title company coordination — track title insurance, closing documents, earnest money, survey requirements
953. Insurance setup checklist — Builder's Risk policy per project; track policy number, coverage amount, deductible, effective dates, premium
954. Notice to Owner management — track NTO requirements by state; who has filed, deadlines, documentation
955. Pre-construction meeting management — attendee list, agenda template, meeting minutes, project kickoff documentation

### PHASE 5: SITE PREPARATION
956. Tree protection plan documentation — which trees are protected, fencing requirements, monitoring during construction
957. Erosion control plan tracking — SWPPP installation, inspection schedule, maintenance log
958. Temporary utilities setup — temporary power, water, portable toilet delivery/service schedule
959. Site security setup — fencing, locks, camera installation, alarm system
960. Dumpster/waste management scheduling — delivery, pickup, recycling requirements
961. Material staging plan — where materials will be stored, delivery access routes, crane placement
962. Neighbor notification management — courtesy notices about construction start, hours, contact information

### PHASE 6: FOUNDATION
963. Foundation type tracking — slab, crawlspace, basement, pilings, auger cast — configurable per project and region
964. Foundation inspection checklist — configurable by foundation type and jurisdiction
965. Concrete supplier coordination — mix design approval, delivery scheduling, testing requirements
966. Pile driving/foundation subcontractor coordination — for coastal elevated construction: pile specifications, driving records, load testing
967. Waterproofing/damp-proofing tracking — material specifications, installation documentation, warranty registration
968. Under-slab MEP rough-in coordination — plumbing, electrical, HVAC duct that must be in before slab pour
969. Foundation survey/as-built — verify foundation matches plans; document any deviations

### PHASE 7: STRUCTURAL FRAMING
970. Lumber/material delivery scheduling — coordinated with framing start; track multiple deliveries
971. Framing progress tracking — wall framing, roof trusses, sheathing, each tracked as sub-tasks
972. Structural steel/engineered beam tracking — fabrication lead time, delivery date, installation sequence
973. Window and door schedule management — order tracking from selection through fabrication, delivery, and installation
974. Rough opening verification — confirm all openings match window/door order before closing walls
975. Structural inspection coordination — schedule with building department; pre-inspection checklist

### PHASE 8: DRY-IN / BUILDING ENVELOPE
976. Roofing material and installation tracking — underlayment, flashing, finish roofing material
977. Exterior wall weather barrier/wrap — installation documentation and inspection
978. Window and door installation tracking — each unit tracked for installation quality checklist
979. Exterior cladding coordination — siding, stucco, stone, brick — multiple trades potentially on exterior simultaneously
980. Flashing and waterproofing details — critical junction points documented with photos

### PHASE 9: MEP ROUGH-IN
981. Plumbing rough-in checklist — fixture locations, pipe sizing, water heater location, gas line routing
982. Electrical rough-in checklist — panel location, circuit layout, fixture boxes, low-voltage pre-wire
983. HVAC rough-in checklist — duct routing, equipment placement, return air, fresh air, exhaust fans
984. Low-voltage/smart home pre-wire — network, audio, security, camera, motorized shades, lighting control
985. Fire sprinkler rough-in — if required: design, installation, inspection tracking
986. MEP coordination conflicts — track and resolve conflicts between plumbing, electrical, HVAC, and structural
987. Insulation inspection checklist — R-values by location, installation quality, vapor barrier
988. MEP rough-in inspection coordination — schedule all trade inspections; track pass/fail; re-inspection if needed

### PHASE 10: INTERIOR FINISHES
989. Drywall tracking — hanging, taping, texture, by room/area
990. Interior paint tracking — primer, color by room, sheen, touch-up tracking
991. Tile installation tracking — by room, material, pattern, grout color
992. Hardwood/flooring installation tracking — material, direction, transition details
993. Cabinet installation checklist — by room; verify against shop drawings; punch list
994. Countertop fabrication and installation — template date, fabrication timeline, installation date
995. Millwork/trim installation — crown, base, casing, built-ins; by room
996. Hardware installation — door hardware, cabinet hardware, bath accessories
997. Appliance delivery and installation tracking — each appliance: model, serial number, delivery date, installation date, warranty registration
998. Fixture installation tracking — plumbing fixtures, light fixtures, ceiling fans — each tracked

### PHASE 11: EXTERIOR FINISHES
999. Driveway and walkway — concrete, pavers, or other; pour/install dates
1000. Landscaping coordination — grading, irrigation, planting, sod, mulch, lighting
1001. Pool/spa construction tracking — if applicable: separate permit, separate contractor, own inspection sequence
1002. Outdoor kitchen/living area — separate scope tracking
1003. Fencing — permit, installation, inspection
1004. Garage door installation — order, delivery, installation, programming
1005. Mailbox, house numbers, exterior accessories
1006. Exterior paint/stain — body, trim, accents; touch-up
1007. Gutter and downspout installation
1008. Screen enclosure — if applicable (common in Florida)

### PHASE 12: FINAL INSPECTIONS & CLOSEOUT
1009. Pre-final inspection walkthrough — builder's internal punch list BEFORE requesting CO inspection
1010. Final building inspection coordination — schedule, attend, document results
1011. Certificate of Occupancy tracking — application, inspection, issuance, conditions
1012. Utility final connections — meter sets, final connections, service activation
1013. Final cleaning coordination — construction clean, detail clean, window clean
1014. Client orientation meeting — walk through entire home demonstrating all systems, features, maintenance requirements
1015. O&M manual assembly — all manuals, warranties, paint codes, material specs, as-built plans compiled for homeowner
1016. Warranty start date documentation — establish start dates for builder warranty, manufacturer warranties, workmanship warranties
1017. Key/access handover log — all keys, garage remotes, gate codes, alarm codes, smart home credentials
1018. Final photography — professional photos for portfolio, marketing, and homeowner record
1019. Client satisfaction survey — post-move-in feedback; configurable timing and questions

### PHASE 13: WARRANTY & POST-CONSTRUCTION
1020. 30-day walkthrough — scheduled follow-up to identify settling items, adjustment needs
1021. 11-month walkthrough — before 1-year warranty expiration; comprehensive inspection
1022. Warranty request intake — client-facing portal for submitting service requests with photos
1023. Warranty triage — is this a warranty item, maintenance, or homeowner damage? Decision workflow
1024. Warranty vendor dispatch — route to responsible trade; track response time and completion
1025. Warranty cost tracking — by vendor, by item type, by project; feeds future estimating for warranty reserves
1026. Seasonal maintenance reminders — automated reminders to homeowner (change HVAC filter, flush water heater, etc.)
1027. Home care subscription management — if builder offers ongoing maintenance service

---

## 3.2 DAILY OPERATIONS THE SOFTWARE MUST SUPPORT

> These are the actual tasks builders do EVERY DAY that the software must make faster and easier.

### Morning Routine (Office — 6:30-8:00 AM)
1028. "My Day" dashboard — everything I need to address today across all projects, sorted by priority
1029. Overnight alert review — what happened since I left yesterday: emails received, vendor messages, inspection results, weather changes
1030. Daily cash position — what's in the bank, what's due out today/this week, what draws are pending
1031. Schedule review across all jobs — who's going where today, any conflicts, any weather issues
1032. Material delivery schedule — what's arriving today on which job sites
1033. Inspection schedule — which inspections are today, who's meeting the inspector
1034. Client communication queue — any client messages needing response; any scheduled client meetings today
1035. Vendor follow-up queue — outstanding bids, overdue invoices, unanswered RFIs, expired insurance

### Field Operations (8:00 AM - 4:00 PM)
1036. One-tap daily log start — auto-populates date, weather, project, yesterday's vendors; just add today's info
1037. Quick photo capture — snap photo → auto-tagged to project, date, and location; optional voice note overlay
1038. Quick issue reporting — photo + voice note + category + urgency → creates issue, assigns, notifies
1039. Material delivery verification — scan packing slip or take photo → match to PO → flag discrepancies
1040. Inspection result logging — pass/fail + inspector notes + photos → auto-updates schedule + daily log
1041. Vendor check-in/check-out — track who's on site and when (optional GPS verification)
1042. Quick measurement/note — capture a field measurement or decision with photo context
1043. Safety observation — quick log of safety concern with photo → routes to safety manager
1044. Client site visit logging — client was on site; document any decisions, questions, concerns raised
1045. Change directive capture — field decision that will become a change order; document now, formalize later

### End of Day (Office — 4:00-6:00 PM)
1046. Daily log review and submission — review all logs submitted by field staff; approve or request edits
1047. Invoice processing queue — review AI-extracted invoices; approve/code/dispute
1048. Schedule updates — adjust based on today's progress; push notifications to affected trades
1049. Client update generation — AI drafts weekly/daily updates based on daily logs and photos; PM reviews and sends
1050. Tomorrow's plan — review schedule for tomorrow; confirm vendor starts; check material deliveries

### Weekly Tasks
1051. Cash flow projection review — updated projections for all active projects
1052. Budget variance review — any line items trending over budget; action plans
1053. Schedule health review — critical path analysis; any projects at risk
1054. Vendor performance review — any vendors underperforming this week
1055. Draw request preparation — compile approved invoices, lien waivers, photos for next draw
1056. Prospect/lead follow-up — pipeline review; schedule follow-up calls/meetings
1057. Team meeting preparation — auto-generated agenda from project data

### Monthly Tasks
1058. WIP (Work in Progress) report generation — for accountant; over/under billing analysis
1059. Profitability review by project — which jobs are making money, which aren't, why
1060. Insurance certificate review — any expiring this month across all vendors
1061. License renewal review — any licenses expiring for vendors or the builder
1062. Marketing activity review — leads by source, conversion rates, marketing spend ROI
1063. Client satisfaction pulse — any active clients who haven't been communicated with recently
1064. Vendor payment aging review — who are we behind on paying? Cash flow implications?

### Quarterly/Annual Tasks
1065. Tax preparation support — 1099 generation, sales tax filing data, quarterly tax estimates
1066. Insurance audit data preparation — payroll by class code, subcontractor spend by trade
1067. Business performance review — year-over-year comparison, trend analysis, KPI scorecards
1068. Strategic planning data — pipeline forecast, capacity planning, market trends
1069. Employee review data — PM profitability rankings, super quality metrics, admin efficiency

---

## 3.3 USER EXPERIENCE REQUIREMENTS (Keeping It User-Friendly)

### UX Principle 1: Progressive Disclosure
```
Simple by default. Power when needed.
- New users see simplified views with guided workflows
- As users learn, they unlock more detailed views
- Power features are always available but never forced
- Every screen has a "simple" and "detailed" toggle
```

### UX Principle 2: Context-Aware Interface
```
Show what's relevant NOW based on:
- User's role (PM sees different priorities than Owner)
- Time of day (morning = planning view, afternoon = review view)
- Project phase (preconstruction shows different tools than construction)
- Device (desktop = full data, mobile = action-oriented)
- Usage patterns (frequently used features surface first)
```

### UX Principle 3: Three-Click Rule for Common Tasks
```
The 20 most common daily tasks must be completable in 3 clicks or less:
1. Create a daily log
2. Take and upload a photo
3. Approve an invoice
4. Check a project budget
5. View today's schedule
6. Send a vendor message
7. Create a punch list item
8. Log an inspection result
9. Check a delivery status
10. Create an RFI
11. Update a task status
12. Review client portal
13. Generate a report
14. Check cash flow
15. View vendor compliance
16. Create a change order
17. Log a safety observation
18. Schedule an inspection
19. Review and approve a bid
20. Send a client update
```

### UX Principle 4: Smart Defaults
```
Pre-fill everything possible:
- Daily log: auto-populate date, weather, yesterday's vendors on site
- New project: auto-populate from project template
- Invoice: AI suggests cost codes from vendor history
- Schedule: auto-suggest durations from historical data
- Change order: auto-calculate markup from settings
- PO: auto-populate from contract terms
- Lien waiver: auto-fill from payment data
```

### UX Principle 5: Never Lose Work
```
- Auto-save every field change (no "save" button needed)
- Offline mode queues changes for sync
- "Undo" available for every action for 30 days
- Deleted items go to recycle bin, not permanent delete
- Version history on every document and record
```

### UX Principle 6: One Place to Look
```
- Global search that finds ANYTHING (vendor name, invoice number, address, document content)
- "What's happening on [project]?" → one-page comprehensive summary
- "What do I need to do?" → priority-sorted action queue across all projects
- "Where's my money?" → cash position + pending draws + outstanding invoices, one screen
```

### UX Principle 7: Beautiful Without Trying
```
- Auto-formatted reports that look professional without configuration
- Client portal that impresses without builder effort
- Photo galleries that look curated automatically
- Financial reports that are clear to non-accountants
- Proposals that close deals (beautiful templates included)
```

### UX Principle 8: Inclusive Design
```
- Works for tech-savvy PM AND technophobe superintendent
- Works in English AND Spanish (field staff)
- Works on $200 Android AND $1,500 iPhone
- Works on 5" phone AND 27" monitor
- Works for 25-year-old AND 65-year-old
- Works with slow rural internet AND fast city connection
- WCAG 2.1 AA compliant (accessibility)
```

---

## 3.4 AI INTELLIGENCE FEATURES (The Competitive Moat)

### What the AI Should Do (That No Competitor Does):

1070. **Estimate Intelligence** — After 10+ completed projects, AI can generate a preliminary estimate from floor plans + finish level within ±15% accuracy
1071. **Schedule Intelligence** — AI predicts realistic durations based on project size, complexity, season, region, and builder's historical performance
1072. **Vendor Matching** — "For this scope on this type of project, these 3 vendors historically perform best for you"
1073. **Price Anomaly Detection** — "This invoice is 40% higher than the last 5 similar invoices from this vendor — review?"
1074. **Budget Forecasting** — "Based on current spending rate, this project will finish $23K over budget. Here are the 3 line items driving the overrun."
1075. **Change Order Prediction** — "Based on 50 similar projects, clients typically add a pool during framing. Proactively discuss?"
1076. **Schedule Risk Prediction** — "Based on weather forecast and current pace, there's a 72% chance of missing the drywall deadline. Recommend: schedule 2-day buffer."
1077. **Document Auto-Classification** — Email attachment or upload → AI identifies: invoice, bid, COI, lien waiver, plan set, permit, inspection report
1078. **Daily Log Intelligence** — AI reads daily logs and detects: potential delays, safety concerns, scope changes, quality issues, vendor problems
1079. **Cash Flow Optimization** — "If you submit Draw #4 by Friday, you'll avoid a cash flow gap next Tuesday. Here's the package ready for review."
1080. **Client Communication Drafting** — AI drafts weekly client updates from daily logs, photos, and schedule data. PM reviews and sends.
1081. **Scope Gap Detection** — Compare all vendor contracts to the complete scope of work → identify items nobody is responsible for
1082. **Photo-Based Progress Assessment** — AI analyzes site photos to estimate construction progress percentage (future feature, high R&D)
1083. **Warranty Prediction** — "Based on historical warranty claims, homes with [this vendor's] plumbing rough-in have 3x more warranty calls. Consider additional inspection."
1084. **Seasonal Pattern Learning** — "October is historically your busiest month for permit delays in [county]. Submit permits 2 weeks earlier."
1085. **Profitability Pattern Analysis** — "Projects where selections are finalized before framing average 8% higher profit margin. Push for earlier selection deadlines."

---

## 3.5 MISSING INTEGRATIONS & EXTERNAL CONNECTIONS

1086. **Bank feed integration** — Auto-import bank transactions for reconciliation against invoiced/paid items
1087. **Credit card feed** — Auto-capture receipts from company cards; match to cardholders; route for job cost coding
1088. **Construction camera integration** — EarthCam, Sensera, Ring cameras — auto-pull time-lapse and live feeds into project dashboard
1089. **Drone service integration** — DroneDeploy, Skydio — import survey data, orthomosaic maps, progress photos
1090. **Material supplier portals** — ABC Supply, 84 Lumber, ProBuild, Ferguson — order status, pricing, delivery tracking
1091. **Appliance dealer integration** — Ferguson, Yale Appliance — selections, pricing, delivery scheduling
1092. **Title company integration** — share draw documentation, lien waiver packages, closing documents
1093. **Surveyor integration** — receive digital survey data directly into the platform
1094. **Energy modeling tools** — HERS rating, Manual J/D calculations
1095. **Smart home platform integration** — Savant, Control4, Crestron — system specifications, pre-wire documentation
1096. **Dumpster/portable toilet vendor** — automated scheduling based on construction phase
1097. **Equipment rental companies** — Sunbelt, United Rentals — auto-track rental periods, costs, delivery/pickup
1098. **State contractor licensing databases** — auto-verify vendor licenses are active and in good standing
1099. **FEMA flood map API** — auto-determine flood zone from project address
1100. **NOAA weather API** — historical weather data for schedule intelligence, real-time forecasts for daily operations
1101. **Tide data API** — for coastal builders; schedule concrete pours and foundation work around tides
1102. **Building code database** — ICC codes with jurisdiction-specific amendments
1103. **Email integration** — forward emails to the system; auto-file to correct project/vendor based on AI analysis
1104. **Calendar sync** — Google Calendar, Outlook, Apple Calendar — two-way sync of inspections, meetings, milestones
1105. **Zapier/Make connector** — for any integration we don't natively support

---

## 3.6 SECURITY, COMPLIANCE & LEGAL REQUIREMENTS

1106. SOC 2 Type II compliance — required for enterprise customers
1107. GDPR compliance framework — if expanding internationally
1108. CCPA compliance — California customers' data rights
1109. State-specific data privacy laws — emerging laws in TX, FL, CO, VA, CT
1110. PCI DSS compliance — if handling payment card data
1111. Data encryption at rest (AES-256) and in transit (TLS 1.3)
1112. Multi-factor authentication — configurable per tenant
1113. Single Sign-On (SSO) — Azure AD, Google Workspace, Okta
1114. IP allowlisting — optional per tenant
1115. Session management — configurable timeout, forced logout, concurrent session limits
1116. Audit logging — every data access, every change, every login; immutable; searchable
1117. Role-based access control (RBAC) — granular to the field level
1118. Data retention policies — configurable per tenant; automated enforcement
1119. Right to erasure — complete data deletion workflow
1120. Penetration testing — quarterly; results documented
1121. Vulnerability scanning — continuous; automated patching
1122. Incident response plan — documented and tested
1123. Business continuity plan — documented and tested
1124. Disaster recovery — RPO < 1 hour, RTO < 4 hours
1125. Data export — complete data export in standard formats at any time (NEVER lock in customers like Buildertrend does)

---

## 3.7 THE "TYPICAL BUILDER'S DAY" TEST

> Every feature should be validated against a real builder's daily workflow. Here are the personas and their daily experiences the platform must optimize:

### Persona 1: Jake (Director of Construction / 5-8 Active Jobs)
- 6:30 AM: Checks "My Day" dashboard on phone from bed — sees today's priorities, overnight alerts, weather
- 7:00 AM: In office — reviews daily cash flow, checks schedule across all jobs, identifies potential issues
- 8:00 AM: On first job site — logs in to this project, reviews what was done yesterday, what's scheduled today
- 8:30 AM: Walks site — takes photos (auto-tagged), notes issue with framing (creates punch item from photo)
- 9:00 AM: Second job site — superintendent shows concern about plumbing rough-in; creates RFI from phone
- 10:00 AM: Back in office — reviews and approves 6 invoices (AI already coded them), processes two vendor bids
- 11:00 AM: Client call — pulls up project dashboard in 3 seconds, discusses budget status, upcoming selections deadline
- 12:00 PM: Third job site — final inspection today; logs pass; CO status auto-updates; warranty tracking activates
- 1:00 PM: Reviews change order request from PM — AI shows budget impact, schedule impact; approves
- 2:00 PM: Draws for two projects — system has assembled all approved invoices, lien waivers, photos; reviews and submits
- 3:00 PM: New lead follow-up — reviews qualification scoring, sends preliminary feasibility estimate
- 4:00 PM: Reviews and sends AI-drafted client updates for 3 projects
- 5:00 PM: Checks end-of-day dashboard — tomorrow's schedule confirmed, no vendor issues outstanding
- **Time saved: 2-3 hours/day** vs. current process

### Persona 2: Field Superintendent (2 Active Jobs)
- 7:00 AM: Opens app → sees today's schedule for both jobs, weather, expected deliveries
- 7:30 AM: Arrives at Job 1 → taps "Start Daily Log" → auto-populates weather and yesterday's info
- 8:00 AM: Vendors arrive → logs vendor check-in (optional quick photo of crew count)
- Throughout day: Takes photos (auto-logged); notes issues (voice to text); logs material deliveries
- 3:30 PM: Completes daily log → adds work performed, issues, delays → submits in 5 minutes
- 4:00 PM: Moves to Job 2 → reviews what happened there today from PM's log
- **Time saved: 45 min/day** on documentation

### Persona 3: Office Admin / Bookkeeper
- 8:00 AM: Reviews invoice queue — AI has extracted and coded 15 overnight invoices; verifies and routes for approval
- 9:00 AM: Checks vendor compliance dashboard — 3 COIs expiring this week; sends one-click renewal requests
- 10:00 AM: Prepares draw #5 for Project PRJ-103 — system has assembled everything; formats for lender
- 11:00 AM: QuickBooks sync review — checks sync status; resolves 2 mapping questions
- 1:00 PM: Updates selection status — marks 5 selections as "ordered"; system auto-updates schedule lead times
- 2:00 PM: Generates weekly report for owners — one click; system pulls all data; branded PDF auto-generated
- 3:00 PM: New vendor setup — vendor self-registered; reviews application; verifies insurance; approves
- **Time saved: 3-4 hours/day** vs. manual data entry and chasing documents

### Persona 4: Luxury Homeowner Client
- Receives weekly AI-generated update with photos and schedule status (no builder effort required)
- Logs into branded portal to review selection deadlines — sees what's overdue, what's upcoming
- Reviews change order in portal — sees cost impact, schedule impact, scope description — approves with e-signature
- Checks budget dashboard — sees original contract, approved changes, current total, percent complete
- Uploads inspiration photos for undecided selections
- Submits question through portal messaging — builder receives notification
- **Experience**: "I always know what's happening with my home without having to call or text"

---

# PART 4: BUILD PRIORITY & PHASE SEQUENCING

---

## 4.1 PHASE 0: ARCHITECTURAL DECISIONS (Before ANY Code)

These must be decided and documented before writing a single line of code:

```
□ Technology stack (language, framework, database, hosting)
□ Multi-tenancy model (shared DB with RLS, schema-per-tenant, or DB-per-tenant)
□ Authentication/authorization architecture (Auth provider, RBAC model)
□ Configuration engine design (how settings are stored and applied)
□ AI/ML architecture (where models run, how they train, how they serve predictions)
□ File storage strategy (S3/equivalent, CDN, organization)
□ API design (REST/GraphQL, versioning strategy, rate limiting)
□ Real-time architecture (WebSockets, SSE, polling — for live updates)
□ Mobile strategy (React Native, PWA, native — impacts everything)
□ Offline strategy (what works offline, how sync works)
□ Search architecture (Postgres full-text, Elasticsearch, Algolia)
□ Event architecture (event bus for connecting modules — Kafka, Redis Streams, etc.)
□ Testing strategy (unit, integration, e2e — frameworks and CI/CD)
□ Data model foundation (core entities, relationships, tenant scoping)
□ CI/CD pipeline design
□ Monitoring and observability stack
```

## 4.2 PHASE 1: FOUNDATION (Months 1-3)

The core platform that everything else builds on:

```
Module 1: Multi-Tenant Authentication & Access
Module 2: Configuration Engine (settings, custom fields, workflows)
Module 3: Core Data Model (projects, contacts, documents, notes)
Module 4: Navigation, Search & Dashboard Framework
Module 5: Notification Engine
Module 6: File/Document Storage & Management
```

**Exit Criteria**: A builder can create an account, set up their company, create a project, invite team members, upload documents, and customize basic settings.

## 4.3 PHASE 2: CONSTRUCTION CORE (Months 3-6)

The features that make it useful for active construction:

```
Module 7: Scheduling (Gantt, calendar, task management)
Module 8: Daily Logs (field reporting, photos, weather)
Module 9: Budget & Cost Tracking (line items, committed costs, actuals)
Module 10: Contact/Vendor Management (profiles, compliance, communication)
Module 11: Native Accounting (GL/AP/AR) (receive, code, approve, track)
Module 12: Basic Client Portal (view-only updates, photos, schedule)
```

**Exit Criteria**: A builder can manage an active construction project — schedule work, log daily activity, track costs, process invoices, and keep clients informed.

## 4.4 PHASE 3: FINANCIAL POWER (Months 6-9)

The money features that make it essential:

```
Module 13: Full Invoice Processing with AI Extraction
Module 14: Lien Waiver Management (state-specific)
Module 15: Draw Request Generation (AIA G702/G703)
Module 16: QuickBooks Integration (bi-directional sync)
Module 17: Change Order Management
Module 18: Purchase Order Management
Module 19: Financial Reporting & Dashboards
```

**Exit Criteria**: A builder can manage complete financial operations — from invoice receipt through payment, lien waiver collection, draw submission, and accounting sync — without using any external financial tools.

## 4.5 PHASE 4: INTELLIGENCE & DIFFERENTIATION (Months 9-12)

The features that make it BETTER than everything else:

```
Module 20: Estimating Engine with Intelligence
Module 21: Selection Management Portal
Module 22: Vendor Performance Scoring
Module 23: Material Price Intelligence
Module 24: AI-Powered Document Processing
Module 25: Schedule Intelligence (learns from history)
Module 26: Bid Management & Comparison
Module 27: RFI Management
Module 28: Punch List & Quality Checklists
```

**Exit Criteria**: The AI actively improves accuracy; the platform replaces Buildertrend, Adaptive, Materio, and ReportandGo in a single system.

## 4.6 PHASE 5: FULL PLATFORM (Months 12-18)

Everything else:

```
Module 29: Full Client Portal (approvals, selections, messaging, documents)
Module 30: Vendor Portal (scope access, invoicing, schedule)
Module 31: Warranty & Home Care
Module 32: Permitting & Inspection Management
Module 33: Safety & Compliance
Module 34: HR & Workforce (time tracking, certifications)
Module 35: Equipment & Asset Management
Module 36: Lead Pipeline & CRM
Module 37: Marketing & Portfolio
Module 38: Contract & E-Signature Integration
Module 39: Advanced Reporting & Custom Report Builder
Module 40: Mobile App (native or PWA polish)
```

## 4.7 PHASE 6: SCALE & SELL (Months 18-24)

SaaS commercialization:

```
Module 41: Onboarding Wizard & Setup Assistant
Module 42: Data Migration Tools (from Buildertrend, CoConstruct, etc.)
Module 43: Subscription Billing & Plan Management
Module 44: White-Label / Branding Engine
Module 45: API & Integration Marketplace
Module 46: Customer Support System (help center, in-app help)
Module 47: Training & Certification Platform
Module 48: Template Marketplace
Module 49: Platform Analytics & Admin Dashboard (your own ops)
Module 50: Marketing Website & Sales Pipeline for the SaaS itself
```

---

# PART 5: CLAUDE CODE PROCESSING COMMANDS

> These are the specific commands/workflows Claude Code should follow when working on this project.

---

## 5.1 Starting a New Module

```
WHEN starting a new module:

1. READ the relevant sections from all three spec documents
2. READ all gap items that map to this module (from gap-tracker.json)
3. READ the dependency graph to understand what this module connects to
4. LIST every entity (database table) this module needs
5. LIST every API endpoint this module needs
6. LIST every UI page/component this module needs
7. LIST every connection to other modules
8. DESIGN the data model FIRST — get the tables/columns right
9. BUILD the API layer SECOND — get the endpoints right
10. BUILD the UI THIRD — only after data and API are solid
11. CONNECT to other modules FOURTH — wire up the data flows
12. TEST against the gap checklist FIFTH — verify every item is addressed
13. UPDATE gap-tracker.json with status changes
```

## 5.2 Processing a Gap Item

```
WHEN processing a gap item:

1. READ the gap item and understand what it's asking
2. SEARCH the existing codebase for any related implementation
3. IF already handled → update status to "complete", document where
4. IF not handled → determine:
   a. Which module owns this?
   b. What's the data model impact?
   c. What's the API impact?
   d. What's the UI impact?
   e. What other gap items are related?
   f. What's the minimum viable implementation?
5. IMPLEMENT the fix
6. VERIFY by re-reading the gap item and confirming it's addressed
7. CHECK for side effects — did fixing this break anything else?
8. UPDATE all documentation
```

## 5.3 Adding a New Feature

```
WHEN adding any feature:

ASK THESE QUESTIONS FIRST:
□ Does this need to be configurable per builder? (Almost always YES)
□ What data does this create that feeds the intelligence engine?
□ What modules does this connect to?
□ Can a field superintendent use this on a phone in 30 seconds?
□ What happens when there's no data yet? (Empty state)
□ What happens at scale? (500 projects, 50 users, 10,000 invoices)
□ What permissions control who can see/do this?
□ Is this tenant-isolated? (MUST be yes)
□ Does this need to work offline?
□ What notifications does this trigger?
□ What does the audit trail look like?
□ How does this appear in search results?
□ Can this be exported/reported on?
```

## 5.4 Database Schema Changes

```
WHEN modifying the data model:

1. ALWAYS include tenant_id on every table (multi-tenancy)
2. ALWAYS include created_at, updated_at, created_by, updated_by (audit)
3. ALWAYS include is_deleted flag (soft delete, never hard delete)
4. CONSIDER: Does this need version history? (If data changes over time and history matters)
5. CONSIDER: Does this need a configuration table? (If different builders need different options)
6. VERIFY: Row-Level Security policy exists for this table
7. VERIFY: Indexes exist for common query patterns
8. VERIFY: Foreign keys are properly defined
9. DOCUMENT: Update data-model.md with changes
10. MIGRATE: Create migration script that works for existing tenants
```

## 5.5 API Endpoint Creation

```
WHEN creating an API endpoint:

1. SCOPE to tenant (req.tenantId must filter all queries)
2. AUTHORIZE by role (check permissions before processing)
3. VALIDATE input (schema validation, business rules)
4. EXECUTE the operation
5. AUDIT LOG the action (who did what, when, to what)
6. EMIT EVENT to the event bus (other modules may need to react)
7. RETURN appropriate response (standardized format)
8. DOCUMENT in api-spec.md
```

## 5.6 UI Component Creation

```
WHEN building UI:

1. MOBILE-FIRST — design for phone, then scale up for desktop
2. LOADING STATES — every data fetch shows a skeleton/spinner
3. EMPTY STATES — every list/view has a helpful empty state
4. ERROR STATES — every operation has clear error handling with recovery suggestions
5. OFFLINE STATES — indicate when offline and what's queued
6. RESPONSIVE — works at 320px to 2560px width
7. ACCESSIBLE — keyboard navigable, screen reader friendly, sufficient contrast
8. FAST — target < 200ms for UI interactions, < 1s for data loads
9. CONSISTENT — use the design system; don't invent new patterns
10. FORGIVING — undo available; confirmation for destructive actions
```

---

# PART 6: COMPREHENSIVE TESTING CHECKLIST

## 6.1 For Every Feature

```
□ Works on desktop Chrome, Safari, Firefox, Edge
□ Works on iOS Safari and Android Chrome
□ Works with slow connection (3G simulation)
□ Works offline (if applicable)
□ Works with 0 records (empty state)
□ Works with 1 record
□ Works with 1,000 records
□ Works with 10,000 records (performance test)
□ Tenant A cannot see Tenant B's data
□ Unauthorized users are blocked
□ Audit log captures the action
□ Notifications fire correctly
□ Search indexes are updated
□ Event bus fires for connected modules
□ Data syncs to QuickBooks correctly (if financial)
□ Displays correctly in client portal (if client-visible)
□ Displays correctly in vendor portal (if vendor-visible)
□ Can be exported/printed
□ Works with the configuration engine (settings respected)
□ Keyboard accessible
□ Screen reader friendly
```

## 6.2 For the Platform Overall

```
□ New customer can sign up and reach value within 1 hour
□ Existing Buildertrend customer can import data
□ All 50 states' lien waiver forms are correct
□ Tax calculations are correct for configurable jurisdictions
□ QuickBooks sync handles all transaction types
□ Platform handles 100 concurrent users without degradation
□ Platform handles 1,000 projects across all tenants
□ Backup and restore works correctly
□ Disaster recovery failover works
□ SSL certificates are valid and auto-renewing
□ No sensitive data in logs or error messages
□ OWASP Top 10 vulnerabilities addressed
□ Rate limiting prevents abuse
□ Data export produces complete, usable data
```

---

# SUMMARY: TOTAL ITEMS FOR CLAUDE CODE TO PROCESS

| Source | Count |
|--------|-------|
| Original Gap Analysis (expanded) | 910 |
| Construction Lifecycle Steps (Phase 0-13) | 117 |
| Daily Operations Support | 42 |
| AI Intelligence Features | 16 |
| Missing Integrations | 20 |
| Security & Compliance | 20 |
| **GRAND TOTAL** | **1,125** |

Plus:
- 50 architectural decisions (Phase 0)
- 7 processing rules for Claude Code
- 23 UX principles
- 22 testing checklist items per feature
- 6 build phases with entry/exit criteria
- 5 persona validation scenarios

**This is the most comprehensive custom home builder software specification ever written. Claude Code should treat this as the single source of truth and process every item systematically before writing code.**
