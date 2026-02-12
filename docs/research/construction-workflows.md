# Construction Workflows — Comprehensive Reference

> Status: COMPREHENSIVE REFERENCE — Covers all Blueprint Section 3.1 lifecycle phases (items 911-1027), Section 3.2 daily operations (items 1028-1069), and all related Gap Analysis items from Section 14 (Daily Logs, items 315-325), Section 26 (Safety, items 459-464), Section 28 (Permitting, items 471-475), and Section 31 (Mobile/Field, items 486-490).

---

## How to Use This Document

This document maps every construction workflow the platform must support, from pre-lead marketing through post-construction warranty. Each workflow references specific gap analysis items and blueprint items. Use this to ensure every workflow has corresponding UI screens, API endpoints, and data models in the platform architecture.

---

## Part 1: The Complete Custom Home Build Lifecycle

> Reference: Blueprint Section 3.1 (Items 911-1027) — 14 phases covering the entire project lifecycle.

---

### PHASE 0: Business Development (Items 911-917)

**Purpose**: Everything that happens before a specific lead enters the pipeline. Marketing, reputation, and market intelligence.

| Item | Workflow | Platform Feature Required |
|------|----------|--------------------------|
| 911 | Marketing campaign management | Track ROI by channel (Houzz, website, social, referral, Parade of Homes, print) |
| 912 | Website integration | Lead capture forms that auto-create leads in pipeline |
| 913 | SEO/content tracking | Track which content drives inquiries |
| 914 | Networking/event tracking | Industry events, association meetings, relationship cultivation |
| 915 | Strategic lot tracking | Monitor lots for sale matching ideal build profile |
| 916 | Builder reputation monitoring | Track reviews across Google, Houzz, BBB, Yelp; alert on new reviews |
| 917 | Competitive intelligence | Competitor pricing trends, new starts, marketing activity (manual entry) |

**Related Gap Items**: Section 39 (Marketing, items 569-573) and Section 40 (Business Development, items 569-573) provide SaaS-specific questions for these workflows.

---

### PHASE 1: Lead & Qualification (Items 918-926)

**Purpose**: A prospect has made contact. Qualify them, capture their vision, assess feasibility.

| Item | Workflow | Platform Feature Required |
|------|----------|--------------------------|
| 918 | Multi-channel lead intake | Website, phone, email, referral, Houzz, walk-in -> unified pipeline |
| 919 | Automated lead response | Configurable auto-reply within minutes of inquiry |
| 920 | Lead scoring algorithm | Budget realism, timeline fit, project type match, referral quality |
| 921 | Lead nurturing sequences | Automated email drips configurable per builder |
| 922 | Initial consultation checklist | Configurable question list for first meeting |
| 923 | Consultation notes and follow-up | Discussion log, reactions, next steps, follow-up date |
| 924 | "Dream board" capture | Client inspiration images, must-haves, lifestyle needs |
| 925 | Lot evaluation checklist | Zoning, setbacks, easements, flood zone, soil, utilities, HOA, survey, environment |
| 926 | Quick feasibility calculator | Rough range estimate based on lot + wishes + current costs |

**Workflow Trigger Points**:
- Lead enters pipeline -> auto-response (919)
- Lead scored above threshold -> assign to PM, schedule consultation (920)
- Consultation completed -> feasibility assessment generated (926)
- Qualified lead -> advance to Preconstruction (Phase 2)

---

### PHASE 2: Preconstruction & Design (Items 927-938)

**Purpose**: Design the home, assemble the team, navigate regulatory requirements, establish preliminary budgets.

| Item | Workflow | Platform Feature Required |
|------|----------|--------------------------|
| 927 | Design team assembly | Track architect, engineer, interior designer, landscape architect |
| 928 | Design milestone tracking | Concept -> schematic -> DD -> CDs with client review gates |
| 929 | Design meeting management | Schedule, agenda, attendees, minutes, decisions, action items |
| 930 | Preliminary budget tracking | Estimate updates at each design milestone |
| 931 | Preconstruction agreement | Separate contract for paid design/planning phase |
| 932 | Geotechnical report tracking | Soil boring results, foundation recommendations, cost impact |
| 933 | Survey management | Boundary, topo, tree, elevation surveys |
| 934 | Environmental assessment | Wetlands, protected species, stormwater requirements |
| 935 | HOA/deed restriction checklist | ARB requirements, submission deadlines, approval status |
| 936 | Utility coordination tracker | Water, sewer, electric, gas, internet — application status and fees |
| 937 | Impact fee calculator | By jurisdiction: school, transportation, park, fire impact fees |
| 938 | Design coordination issue log | Conflicts between architectural, structural, MEP, interior design |

**Permitting Workflow Intersection** (Gap Items 471-475, 582):
- **471**: Permit types, processes, and fees vary by jurisdiction — must configure per project location
- **472**: Inspection types are jurisdiction-dependent — system must allow flexible sequences
- **473**: Builders in multiple jurisdictions need per-project rules
- **474**: Online permit integration where APIs exist; manual tracking elsewhere
- **475**: Special inspections (structural threshold, concrete testing) triggered by project scope
- **582**: Permit process method (online, in-person, combined) varies by municipality

---

### PHASE 3: Estimating & Bidding (Items 939-947)

**Purpose**: Distribute plans for bids, level bids, detect scope gaps, present estimate to client.

| Item | Workflow | Platform Feature Required |
|------|----------|--------------------------|
| 939 | Plan set distribution | Track which plan version went to which vendor with read receipts |
| 940 | Bid invitation tracking | Invited, declined, acknowledged, submitted, late |
| 941 | Bid leveling tools | Normalize bids for apples-to-apples comparison |
| 942 | Scope gap detection | AI identifies items no vendor bid covers |
| 943 | Value engineering tracker | Alternative approaches with savings amounts |
| 944 | Allowance strategy builder | Set allowances based on historical intelligence |
| 945 | Estimate presentation builder | Client-facing estimate with configurable detail level |
| 946 | Pre-construction cost tracker | Design fees, engineering, survey, permits — tracked separately |
| 947 | Cost escalation calculator | Estimate material/labor increases if start is delayed |

---

### PHASE 4: Contract & Financing (Items 948-955)

**Purpose**: Execute the construction contract, coordinate financing, set up insurance, kick off.

| Item | Workflow | Platform Feature Required |
|------|----------|--------------------------|
| 948 | Contract type configurator | Cost-plus, GMP, fixed-price, hybrid — different tracking per type |
| 949 | Draw schedule builder | Link payment milestones to schedule milestones |
| 950 | Financing coordination | Loan status, appraisal, lender requirements, inspection schedule |
| 951 | Lender draw format manager | Different lenders require different draw formats |
| 952 | Title company coordination | Title insurance, closing docs, survey requirements |
| 953 | Insurance setup checklist | Builder's Risk per project — policy, coverage, deductible, dates |
| 954 | Notice to Owner management | NTO requirements by state; who filed, deadlines, documentation |
| 955 | Pre-construction meeting | Attendees, agenda template, minutes, project kickoff |

---

### PHASE 5: Site Preparation (Items 956-962)

**Purpose**: Prepare the lot for construction — clear, protect, secure, stage.

| Item | Workflow | Platform Feature Required |
|------|----------|--------------------------|
| 956 | Tree protection plan | Protected trees, fencing requirements, monitoring |
| 957 | Erosion control (SWPPP) | Installation, inspection schedule, maintenance log |
| 958 | Temporary utilities | Temp power, water, portable toilet schedule |
| 959 | Site security | Fencing, locks, cameras, alarms |
| 960 | Waste management | Dumpster delivery, pickup, recycling requirements |
| 961 | Material staging plan | Storage locations, delivery access, crane placement |
| 962 | Neighbor notification | Courtesy notices about construction start, hours, contact |

---

### PHASE 6: Foundation (Items 963-969)

**Purpose**: Build the foundation — type determined by region and design.

| Item | Workflow | Platform Feature Required |
|------|----------|--------------------------|
| 963 | Foundation type tracking | Slab, crawlspace, basement, pilings, auger cast — per project/region |
| 964 | Foundation inspection checklist | Configurable by foundation type and jurisdiction |
| 965 | Concrete supplier coordination | Mix design approval, delivery scheduling, testing |
| 966 | Pile driving coordination | Coastal: pile specs, driving records, load testing |
| 967 | Waterproofing tracking | Material specs, installation docs, warranty registration |
| 968 | Under-slab MEP rough-in | Plumbing, electrical, HVAC before slab pour |
| 969 | Foundation as-built | Verify foundation matches plans; document deviations |

---

### PHASE 7: Structural Framing (Items 970-975)

| Item | Workflow | Platform Feature Required |
|------|----------|--------------------------|
| 970 | Lumber delivery scheduling | Coordinated with framing start; multiple deliveries |
| 971 | Framing progress tracking | Wall framing, trusses, sheathing as sub-tasks |
| 972 | Structural steel tracking | Fabrication lead time, delivery, installation sequence |
| 973 | Window/door schedule | Selection through fabrication, delivery, installation |
| 974 | Rough opening verification | Confirm openings match orders before closing walls |
| 975 | Structural inspection | Schedule with building dept; pre-inspection checklist |

---

### PHASE 8: Dry-In / Building Envelope (Items 976-980)

| Item | Workflow | Platform Feature Required |
|------|----------|--------------------------|
| 976 | Roofing tracking | Underlayment, flashing, finish material |
| 977 | Weather barrier/wrap | Installation documentation and inspection |
| 978 | Window/door installation | Per-unit installation quality checklist |
| 979 | Exterior cladding | Siding, stucco, stone, brick — multi-trade coordination |
| 980 | Flashing/waterproofing details | Critical junction points documented with photos |

---

### PHASE 9: MEP Rough-In (Items 981-988)

| Item | Workflow | Platform Feature Required |
|------|----------|--------------------------|
| 981 | Plumbing rough-in checklist | Fixture locations, pipe sizing, water heater, gas lines |
| 982 | Electrical rough-in checklist | Panel, circuits, fixtures, low-voltage pre-wire |
| 983 | HVAC rough-in checklist | Duct routing, equipment, return air, exhaust |
| 984 | Smart home pre-wire | Network, audio, security, cameras, shades, lighting |
| 985 | Fire sprinkler rough-in | Design, installation, inspection tracking |
| 986 | MEP coordination conflicts | Resolve conflicts between trades |
| 987 | Insulation inspection | R-values by location, quality, vapor barrier |
| 988 | MEP inspection coordination | All trade inspections; pass/fail; re-inspection |

---

### PHASE 10: Interior Finishes (Items 989-998)

| Item | Workflow | Platform Feature Required |
|------|----------|--------------------------|
| 989 | Drywall tracking | Hanging, taping, texture by room/area |
| 990 | Interior paint | Primer, color by room, sheen, touch-up |
| 991 | Tile installation | By room: material, pattern, grout color |
| 992 | Hardwood/flooring | Material, direction, transitions |
| 993 | Cabinet installation | By room; verify against shop drawings; punch |
| 994 | Countertop fabrication/install | Template, fabrication, installation dates |
| 995 | Millwork/trim | Crown, base, casing, built-ins by room |
| 996 | Hardware installation | Door, cabinet, bath accessories |
| 997 | Appliance delivery/install | Model, serial, delivery, install, warranty registration |
| 998 | Fixture installation | Plumbing, lighting, ceiling fans — each tracked |

---

### PHASE 11: Exterior Finishes (Items 999-1008)

| Item | Workflow | Platform Feature Required |
|------|----------|--------------------------|
| 999 | Driveway/walkway | Concrete, pavers; pour/install dates |
| 1000 | Landscaping | Grading, irrigation, planting, sod, mulch, lighting |
| 1001 | Pool/spa construction | Separate permit, contractor, inspection sequence |
| 1002 | Outdoor kitchen/living | Separate scope tracking |
| 1003 | Fencing | Permit, installation, inspection |
| 1004 | Garage door | Order, delivery, installation, programming |
| 1005 | Exterior accessories | Mailbox, house numbers, accessories |
| 1006 | Exterior paint/stain | Body, trim, accents, touch-up |
| 1007 | Gutter/downspout | Installation tracking |
| 1008 | Screen enclosure | If applicable (common in Florida) |

---

### PHASE 12: Final Inspections & Closeout (Items 1009-1019)

| Item | Workflow | Platform Feature Required |
|------|----------|--------------------------|
| 1009 | Pre-final walkthrough | Builder's internal punch list before CO inspection |
| 1010 | Final building inspection | Schedule, attend, document results |
| 1011 | Certificate of Occupancy | Application, inspection, issuance, conditions |
| 1012 | Utility final connections | Meter sets, final connections, service activation |
| 1013 | Final cleaning | Construction clean, detail clean, window clean |
| 1014 | Client orientation | Walk through entire home; demonstrate systems |
| 1015 | O&M manual assembly | Manuals, warranties, paint codes, specs, as-builts |
| 1016 | Warranty start documentation | Start dates for builder, manufacturer, workmanship warranties |
| 1017 | Key/access handover | Keys, remotes, codes, smart home credentials |
| 1018 | Final photography | Professional photos for portfolio and homeowner |
| 1019 | Client satisfaction survey | Post-move-in feedback; configurable timing |

**Permitting Intersection**:
- Final building inspection (1010) is the culminating permitting event — **472** (configurable inspection types)
- Certificate of Occupancy (1011) — the critical milestone that involves **471** (jurisdiction-specific permit processes)

---

### PHASE 13: Warranty & Post-Construction (Items 1020-1027)

| Item | Workflow | Platform Feature Required |
|------|----------|--------------------------|
| 1020 | 30-day walkthrough | Settling items, adjustment needs |
| 1021 | 11-month walkthrough | Comprehensive inspection before 1-year expiration |
| 1022 | Warranty request intake | Client portal for submitting service requests with photos |
| 1023 | Warranty triage | Warranty vs. maintenance vs. homeowner damage decision |
| 1024 | Warranty vendor dispatch | Route to responsible trade; track response and completion |
| 1025 | Warranty cost tracking | By vendor, item type, project — feeds future estimating |
| 1026 | Seasonal maintenance reminders | Automated reminders to homeowner |
| 1027 | Home care subscription | Ongoing maintenance service management |

---

## Part 2: Daily Operations Workflows

> Reference: Blueprint Section 3.2 (Items 1028-1069) — The recurring tasks the platform must make faster.

---

### Morning Routine (6:30-8:00 AM) — Items 1028-1035

| Item | Task | Platform Feature |
|------|------|-----------------|
| 1028 | "My Day" dashboard | Prioritized action items across all projects |
| 1029 | Overnight alert review | Emails, vendor messages, inspection results, weather changes |
| 1030 | Daily cash position | Bank balance, due out today/this week, pending draws |
| 1031 | Schedule review (all jobs) | Who's going where, conflicts, weather issues |
| 1032 | Material delivery schedule | What's arriving today, on which sites |
| 1033 | Inspection schedule | Today's inspections, who's meeting inspector |
| 1034 | Client communication queue | Unresponded messages, scheduled meetings |
| 1035 | Vendor follow-up queue | Outstanding bids, overdue invoices, unanswered RFIs, expired insurance |

---

### Field Operations (8:00 AM - 4:00 PM) — Items 1036-1045

| Item | Task | Platform Feature |
|------|------|-----------------|
| 1036 | One-tap daily log start | Auto-populates date, weather, project, yesterday's vendors |
| 1037 | Quick photo capture | Snap -> auto-tagged to project, date, location; optional voice note |
| 1038 | Quick issue reporting | Photo + voice note + category + urgency -> creates issue, assigns, notifies |
| 1039 | Material delivery verification | Scan packing slip / photo -> match to PO -> flag discrepancies |
| 1040 | Inspection result logging | Pass/fail + notes + photos -> auto-updates schedule + daily log |
| 1041 | Vendor check-in/check-out | Track who's on site; optional GPS verification |
| 1042 | Quick measurement/note | Capture field measurement/decision with photo context |
| 1043 | Safety observation | Quick log with photo -> routes to safety manager |
| 1044 | Client site visit logging | Document decisions, questions, concerns |
| 1045 | Change directive capture | Field decision -> formalize as change order later |

**Mobile/Field Experience Intersection** (Gap Items 486-490):
- **486**: Platform strategy — native iOS, native Android, PWA, or React Native?
- **487**: Offline mode — which features work offline? Sync strategy for items 1036-1045?
- **488**: Mobile-specific features — camera (1037, 1038), barcode scanning (1039), GPS (1041), voice input (1036, 1038)
- **489**: Poor connectivity performance — data-light mode, background sync critical for field operations
- **490**: Mobile device management for builders issuing company devices

---

### End of Day (4:00-6:00 PM) — Items 1046-1050

| Item | Task | Platform Feature |
|------|------|-----------------|
| 1046 | Daily log review/submission | Review field staff logs; approve or request edits |
| 1047 | Invoice processing queue | Review AI-extracted invoices; approve/code/dispute |
| 1048 | Schedule updates | Adjust based on progress; push notifications to trades |
| 1049 | Client update generation | AI drafts updates from logs and photos; PM reviews/sends |
| 1050 | Tomorrow's plan | Review schedule, confirm vendor starts, check deliveries |

---

### Weekly Tasks — Items 1051-1057

| Item | Task | Platform Feature |
|------|------|-----------------|
| 1051 | Cash flow projection review | Updated projections for all active projects |
| 1052 | Budget variance review | Over-budget line items; action plans |
| 1053 | Schedule health review | Critical path analysis; at-risk projects |
| 1054 | Vendor performance review | Underperforming vendors this week |
| 1055 | Draw request preparation | Compile invoices, lien waivers, photos for draw |
| 1056 | Prospect/lead follow-up | Pipeline review; schedule follow-up calls |
| 1057 | Team meeting preparation | Auto-generated agenda from project data |

---

### Monthly Tasks — Items 1058-1064

| Item | Task | Platform Feature |
|------|------|-----------------|
| 1058 | WIP report generation | Over/under billing analysis for accountant |
| 1059 | Profitability review by project | Which jobs making money, which not, why |
| 1060 | Insurance certificate review | Expiring certificates across all vendors |
| 1061 | License renewal review | Expiring licenses for vendors or builder |
| 1062 | Marketing activity review | Leads by source, conversion rates, marketing ROI |
| 1063 | Client satisfaction pulse | Active clients not communicated with recently |
| 1064 | Vendor payment aging review | Payment status, cash flow implications |

---

### Quarterly/Annual Tasks — Items 1065-1069

| Item | Task | Platform Feature |
|------|------|-----------------|
| 1065 | Tax preparation support | 1099 generation, sales tax filing, quarterly estimates |
| 1066 | Insurance audit data | Payroll by class code, sub spend by trade |
| 1067 | Business performance review | Year-over-year comparison, trend analysis, KPI scorecards |
| 1068 | Strategic planning data | Pipeline forecast, capacity planning, market trends |
| 1069 | Employee review data | PM profitability rankings, super quality metrics |

---

## Part 3: Daily Log Configuration

> Reference: Gap Analysis Section 14 (Items 315-325) — Every configurable aspect of daily logs.

The daily log is the central field documentation tool. It must be highly configurable because builders run their operations differently.

| Gap Item | Requirement | Configuration Options |
|----------|------------|----------------------|
| **315** | Required fields in daily log | Configurable per builder — some require weather, hours, visitors; others only narrative |
| **316** | Custom fields | Builder-defined fields (e.g., safety observations, soil conditions, concrete pours) |
| **317** | Phase-specific templates | Different log templates for foundation phase vs. finishes phase vs. site work |
| **318** | Single PM vs. multi-logger | Some builders have one PM per job logging; others have multiple people (super, PM, safety) |
| **319** | Automatic fields | Weather auto-populated, scheduled tasks auto-listed, date/project pre-filled |
| **320** | Submission reminders | Configurable reminder time — 4pm, 5pm, 6pm per builder preference |
| **321** | Review workflows | PM submits -> Director reviews (optional); some builders have no review requirement |
| **322** | Voice-to-text entry | Superintendent drives home and dictates the log; speech-to-text transcription |
| **323** | Photo requirements | Configurable minimum photos per log (e.g., "at least 3 photos required") |
| **324** | Workflow triggers from log entries | "Delay reported" -> auto-update schedule impact analysis; "safety issue" -> safety workflow |
| **325** | Legal document treatment | Immutable after submission? Or editable with full audit trail? Configurable per builder. |

### Daily Log Workflow (Combining Blueprint + Gap Items)

```
Morning:
  1. PM/Super opens daily log (auto-created or one-tap start) [1036, 319]
  2. System auto-populates: date, weather, project, yesterday's vendors [319]
  3. Phase-specific template loads [317]

During the Day:
  4. Photos captured and attached [1037, 323]
  5. Voice notes recorded [322]
  6. Vendor attendance tracked [1041]
  7. Safety observations logged [1043, 324]
  8. Issues documented with photos [1038]
  9. Client visit noted if applicable [1044]
  10. Change directives captured [1045]

End of Day:
  11. PM/Super completes narrative [322 - voice-to-text option]
  12. System validates minimum requirements [315, 323]
  13. Log submitted [320 - reminder if not submitted by deadline]
  14. Review workflow triggered if configured [321]
  15. Workflow triggers fire (delay, safety, etc.) [324]
  16. Log locked per immutability settings [325]
```

---

## Part 4: Safety & Compliance Workflows

> Reference: Gap Analysis Section 26 (Items 459-464) — Safety as a configurable module.

| Gap Item | Requirement | Platform Feature |
|----------|------------|-----------------|
| **459** | Safety requirements vary by state and builder | All checklists, forms, and workflows must be configurable |
| **460** | OSHA region-specific requirements | Template library of OSHA requirements; configurable by region |
| **461** | Safety staffing model variation | Some builders have dedicated safety staff; others rely on PM/super |
| **462** | Safety training tracking | Integrates with vendor/employee management; tracks OSHA 10/30, first aid, equipment certs |
| **463** | Safety incident investigation workflows | Configurable investigation steps: report -> investigate -> root cause -> corrective action -> follow-up |
| **464** | Safety-insurance integration | Incident data feeds Experience Modification Rate (EMR) calculations |

### Safety Workflow Integration with Daily Operations

```
Daily:
  - Safety observation during field visit [1043] -> routes per builder config [461]
  - Daily log can include safety section [316 custom field]
  - Vendor safety compliance checked at check-in [1041]

Incident Occurs:
  1. Quick issue report with safety category [1038]
  2. Incident investigation workflow launches [463]
  3. Required documentation captured (photos, statements, conditions)
  4. Root cause analysis template completed
  5. Corrective action plan created and assigned
  6. Follow-up verification scheduled
  7. Incident data feeds insurance/EMR tracking [464]
  8. OSHA reporting triggered if meets threshold [460]

Ongoing:
  - Training compliance dashboard [462]
  - Vendor safety certification tracking (OSHA 10/30, etc.)
  - Safety inspection checklists by phase [459]
  - Pre-task safety planning (configurable per builder)
```

---

## Part 5: Permitting & Inspection Workflows

> Reference: Gap Analysis Section 28 (Items 471-475) plus **582** from Section 42.

### Permitting Workflow

```
Pre-Construction:
  1. Determine jurisdiction from project address [471, 473]
  2. Load jurisdiction-specific permit requirements [471]
  3. Calculate permit fees [471]
  4. Determine submission method (online API or manual) [474, 582]
  5. Prepare permit application package
  6. Submit application (auto-submit via API where available) [474]
  7. Track review status (auto-check via API where available)
  8. Receive permit; store in project documents
  9. Post permit at job site (reminder)

During Construction:
  10. Load jurisdiction-specific inspection sequence [472]
  11. Schedule inspections at appropriate milestones
  12. Pre-inspection checklist (builder self-check before calling inspector)
  13. Log inspection results: pass/fail with notes and photos [1040]
  14. Re-inspection workflow if failed
  15. Special inspections triggered by project scope [475]

Closeout:
  16. Final inspection request [1010]
  17. Certificate of Occupancy tracking [1011]
  18. Permit closeout documentation
```

### Inspection Type Configuration — **472**

The system must support configurable inspection sequences. Default templates by jurisdiction, with builder override capability:

| Phase | Common Inspections | Notes |
|-------|-------------------|-------|
| Foundation | Footing, pre-pour, post-pour | Varies by foundation type [963-969] |
| Framing | Structural framing, shear wall | [975] |
| MEP Rough | Electrical, plumbing, mechanical (separate inspections) | [988] |
| Insulation | Energy code / insulation | [987] |
| Drywall | Pre-cover (some jurisdictions) | Not universal |
| Final | Electrical final, plumbing final, mechanical final, building final | Sequence varies [1010] |
| Special | Structural steel, concrete test, soil compaction, threshold | Triggered by scope [475] |

---

## Part 6: Mobile & Field Experience

> Reference: Gap Analysis Section 31 (Items 486-490) — Cross-platform field tools.

### Mobile Platform Strategy — **486**

Decision required: Native iOS + Android, React Native, or Progressive Web App (PWA)?

| Approach | Pros | Cons | Offline Support |
|----------|------|------|----------------|
| PWA | Single codebase, instant updates, no app store | Limited device API access, iOS restrictions | Service workers; limited |
| React Native | Near-native performance, single codebase | Bridging complexity, larger binary | AsyncStorage + custom sync |
| Native (iOS + Android) | Best performance, full API access | Two codebases, slower iteration | Full SQLite + sync |
| Hybrid (Capacitor/Ionic) | Web skills, single codebase, native APIs | Performance tradeoffs | SQLite + service workers |

### Offline Capability Requirements — **487**

Critical for job sites with poor or no connectivity. Must support offline for:

| Feature | Offline Priority | Sync Strategy |
|---------|-----------------|---------------|
| Daily log creation/editing | MUST work offline | Queue locally, sync when connected |
| Photo capture | MUST work offline | Store locally, upload in background |
| Checklist completion | MUST work offline | Queue locally, conflict resolution |
| Schedule viewing | SHOULD work offline | Cache last-known schedule |
| Document viewing | SHOULD work offline | Selective offline caching of recent docs |
| Invoice approval | CAN be online-only | Requires up-to-date data |
| Budget viewing | SHOULD work offline | Cache last-known budget |
| Contact/vendor lookup | SHOULD work offline | Cache vendor directory |

### Mobile-Specific Features — **488**

| Feature | Device Capability | Used In |
|---------|------------------|---------|
| Camera (photo/video) | iOS/Android camera API | Daily logs [1037], issues [1038], inspections [1040] |
| Barcode/QR scanning | Camera + barcode library | Material delivery verification [1039], equipment tracking |
| GPS location | Location services | Vendor check-in/out [1041], photo geotagging, time tracking |
| Voice input | Speech-to-text API | Daily log dictation [322, 1036], voice notes [1038] |
| Push notifications | APNs (iOS) / FCM (Android) | Alerts, approvals, schedule changes |
| Haptic feedback | Device vibration API | Confirmation of actions, alerts |
| Biometric auth | Face ID / fingerprint | Secure login on job site |

### Poor Connectivity Handling — **489**

- Data-light mode: text-only views, compressed images, deferred media loading
- Background sync: queue all writes, sync when connection available
- Conflict resolution: last-write-wins with manual resolution for conflicts
- Sync status indicator: show user what's synced and what's pending
- Retry logic: exponential backoff for failed syncs
- Bandwidth estimation: adjust behavior based on connection quality

### Device Management — **490**

For builders who issue company devices:
- MDM (Mobile Device Management) compatibility
- Remote wipe capability for lost/stolen devices
- App configuration profiles
- Usage tracking and compliance

---

## Part 7: Persona-Based Workflow Maps

> Reference: Blueprint Section 3.7 — How different roles interact with the platform daily.

### Jake (Director of Construction / 5-8 Active Jobs)

**Morning (6:30-7:30 AM)**:
- "My Day" dashboard [1028] — all 5-8 jobs at a glance
- Cash position [1030] — can we make payroll? Any draws pending?
- Schedule overview [1031] — which jobs need attention today?
- Alert review [1029] — anything blow up overnight?

**Midday**:
- Job site visits (2-3 per day) — daily log review [1046], photo review
- Client calls from car — voice notes to system [322]
- Vendor negotiation — access bid data on mobile [487]

**Afternoon/Evening**:
- Invoice approvals [1047]
- Schedule adjustments [1048]
- Client updates [1049]
- Tomorrow planning [1050]

**Weekly**: Budget variance [1052], draw prep [1055], team meeting [1057]
**Monthly**: Profitability review [1059], WIP report [1058]

### Field Superintendent (2 Active Jobs)

**Morning (7:00 AM on site)**:
- One-tap daily log start [1036]
- Vendor check-in [1041]
- Review today's scheduled work [1031]

**All Day**:
- Photos throughout the day [1037]
- Safety observations [1043]
- Issue reporting [1038]
- Inspection coordination [1040]
- Material delivery verification [1039]

**End of Day**:
- Complete daily log (voice-to-text while driving) [322]
- Submit for review [321]

### Office Admin / Bookkeeper

**Morning**:
- Invoice processing queue [1047]
- Vendor insurance tracking [1060]
- Lien waiver collection status

**Ongoing**:
- Payment processing
- 1099 data maintenance [551]
- Document filing
- Client communication

### Luxury Homeowner Client (Portal User)

**Weekly check-in**:
- View project progress photos [1037]
- Check schedule status and predicted completion
- Review and approve selections
- Sign change orders digitally
- View budget summary (at permitted detail level)

**Post-construction**:
- Warranty request submission [1022]
- Maintenance reminders [1026]
- Home knowledge base access [1015]

---

## Part 8: Regional Workflow Variations

> Referenced from state-regulations.md and Gap Items 581-590.

### Coastal Construction (FL, SC, NC Outer Banks)

Additional workflow steps:
- FEMA elevation certificate tracking
- Wind mitigation documentation and inspection
- Pile driving records and load testing [966]
- Flood zone compliance verification
- Tide chart integration for scheduling
- Hurricane season awareness (June 1 - Nov 30) and storm prep protocol
- Impact glass/window tracking (HVHZ compliance)

### Mountain Construction (CO, NC Mountains)

Additional workflow steps:
- Snow load engineering verification
- WUI fire-hardening documentation [589]
- Steep slope erosion control
- Limited access/delivery window scheduling
- Altitude-adjusted concrete curing
- Wildlife mitigation (bears, etc.)

### Seismic Zone Construction (CA)

Additional workflow steps:
- Seismic design category determination [590]
- Hold-down and shear wall special inspection
- Foundation bolt inspection
- Structural observation during construction
- Title 24 energy compliance (California-specific)

---

## Gap Item Cross-Reference Index

| Gap Item | Description | Section in This Document |
|----------|-------------|------------------------|
| 315 | Required daily log fields | Part 3: Daily Log Configuration |
| 316 | Custom daily log fields | Part 3: Daily Log Configuration |
| 317 | Phase-specific log templates | Part 3: Daily Log Configuration |
| 318 | Single vs. multi-logger | Part 3: Daily Log Configuration |
| 319 | Automatic fields in daily log | Part 3: Daily Log Configuration |
| 320 | Submission reminders | Part 3: Daily Log Configuration |
| 321 | Review workflows | Part 3: Daily Log Configuration |
| 322 | Voice-to-text entry | Part 3: Daily Log Configuration |
| 323 | Photo requirements | Part 3: Daily Log Configuration |
| 324 | Workflow triggers from logs | Part 3: Daily Log Configuration |
| 325 | Legal document treatment | Part 3: Daily Log Configuration |
| 459 | Safety requirements configurable | Part 4: Safety & Compliance |
| 460 | OSHA region-specific | Part 4: Safety & Compliance |
| 461 | Safety staffing models | Part 4: Safety & Compliance |
| 462 | Safety training tracking | Part 4: Safety & Compliance |
| 463 | Incident investigation workflows | Part 4: Safety & Compliance |
| 464 | Safety-insurance integration | Part 4: Safety & Compliance |
| 471 | Permit types by jurisdiction | Part 5: Permitting & Inspections |
| 472 | Inspection type configuration | Part 5: Permitting & Inspections |
| 473 | Multi-jurisdiction builders | Part 5: Permitting & Inspections |
| 474 | Online permit integration | Part 5: Permitting & Inspections |
| 475 | Special inspection requirements | Part 5: Permitting & Inspections |
| 486 | Mobile platform strategy | Part 6: Mobile & Field Experience |
| 487 | Offline mode capabilities | Part 6: Mobile & Field Experience |
| 488 | Mobile-specific features | Part 6: Mobile & Field Experience |
| 489 | Poor connectivity handling | Part 6: Mobile & Field Experience |
| 490 | Mobile device management | Part 6: Mobile & Field Experience |
| 582 | Permit processes by municipality | Part 5: Permitting & Inspections |
| 911-917 | Business Development phase | Part 1: Phase 0 |
| 918-926 | Lead & Qualification phase | Part 1: Phase 1 |
| 927-938 | Preconstruction & Design phase | Part 1: Phase 2 |
| 939-947 | Estimating & Bidding phase | Part 1: Phase 3 |
| 948-955 | Contract & Financing phase | Part 1: Phase 4 |
| 956-962 | Site Preparation phase | Part 1: Phase 5 |
| 963-969 | Foundation phase | Part 1: Phase 6 |
| 970-975 | Structural Framing phase | Part 1: Phase 7 |
| 976-980 | Dry-In phase | Part 1: Phase 8 |
| 981-988 | MEP Rough-In phase | Part 1: Phase 9 |
| 989-998 | Interior Finishes phase | Part 1: Phase 10 |
| 999-1008 | Exterior Finishes phase | Part 1: Phase 11 |
| 1009-1019 | Final Inspections & Closeout | Part 1: Phase 12 |
| 1020-1027 | Warranty & Post-Construction | Part 1: Phase 13 |
| 1028-1035 | Morning routine | Part 2: Morning Routine |
| 1036-1045 | Field operations | Part 2: Field Operations |
| 1046-1050 | End of day | Part 2: End of Day |
| 1051-1057 | Weekly tasks | Part 2: Weekly Tasks |
| 1058-1064 | Monthly tasks | Part 2: Monthly Tasks |
| 1065-1069 | Quarterly/annual tasks | Part 2: Quarterly/Annual |

---

## TODO: Validation

- [ ] Interview active builders (minimum 3) to validate workflow sequences
- [ ] Document regional variations for coastal, mountain, urban, and rural contexts
- [ ] Map complete inspection sequences for FL, TX, CA jurisdictions
- [ ] Validate offline workflow requirements with field superintendents
- [ ] Confirm daily log immutability requirements with construction attorney
- [ ] Test voice-to-text accuracy with construction-specific terminology

---

*This document is the authoritative workflow reference for platform development. Every screen, API endpoint, and data model should trace back to a workflow described here.*
