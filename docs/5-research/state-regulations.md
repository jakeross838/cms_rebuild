# State Regulations & Regional Compliance Reference

> Status: COMPREHENSIVE REFERENCE — Covers all Gap Analysis Section 36 (Regulatory, Tax & Insurance) items 547-557 and Section 42 (Regional & Geographic Variability) items 581-590, plus related items from Sections 16 (Lien Waivers, items 351-358) and 28 (Permitting, items 471-475).

---

## How to Use This Document

Every regulatory requirement the platform must handle is listed here, organized by category and cross-referenced to the gap analysis item number. Each category includes state-by-state variations that must be configurable in the platform. The platform must NEVER hardcode any regulatory value — every threshold, form, deadline, and requirement must be a tenant-level or project-level configuration driven by jurisdiction.

---

## 1. Sales Tax on Construction

> Gap Items: **547**, **548**, **549**, **550**

### Platform Requirements

- **547**: Sales tax on construction varies by state. The system must handle all 50 states, starting with FL, TX, CA, CO.
- **548**: Builders operating in multiple states need per-project tax rules based on project location, not company location.
- **549**: Tax rate lookups must resolve by address — down to zip code or parcel level in some jurisdictions.
- **550**: Tax exemption management — some clients (churches, nonprofits, government) have tax-exempt status; certificates must be stored on file and auto-applied.

### State-by-State Tax Treatment

| State | Materials Taxable? | Labor Taxable? | Notes |
|-------|-------------------|----------------|-------|
| **Florida** | Yes (6% + county surtax up to 2%) | No — labor exempt for real property improvement | Builder is end consumer of materials; pays tax on purchase. No tax on lump-sum construction contracts to owner. |
| **Texas** | Yes (6.25% + local up to 2%) | Lump-sum: builder pays on materials. Separated contract: owner pays on materials, labor exempt | Contract structure determines tax treatment. Must support both contract types. |
| **California** | Yes (7.25% base + district taxes up to ~3.5%) | No — installation labor exempt | Complex district tax overlays; must resolve by precise address. |
| **Colorado** | Yes (2.9% state + local varies widely) | Labor exempt | Some municipalities self-collect; home rule cities have own rules. Extremely fragmented. |
| **Georgia** | Yes (4% + local up to 4%) | No | Straightforward but local rates vary by county. |
| **North Carolina** | Yes (4.75% + local 2-2.75%) | No | County-level local rate variation. |
| **South Carolina** | Yes (6% + local up to 3%) | No | Maximum tax cap of $300 on certain items (vehicles, etc.) — does not apply to construction materials. |
| **Tennessee** | Yes (7% + local up to 2.75%) | No | One of the highest combined rates in the country. |

### Platform Implementation Notes

- Tax rate lookup API integration required (e.g., Avalara, TaxJar) — **549**
- Must support tax exemption certificate upload and auto-application — **550**
- Per-project tax jurisdiction assignment based on project address
- Tax reporting by jurisdiction for builder's filing requirements

---

## 2. Income Tax Reporting (1099 / Payroll)

> Gap Items: **551**, **552**

### Platform Requirements

- **551**: 1099 reporting varies by builder entity type (S-corp, sole proprietor, LLC, partnership). The system must support configurable 1099 thresholds and reporting rules per builder.
- **552**: Payroll tax for builders with W-2 employees — the platform must determine its boundary. At minimum, provide data export for payroll systems; optionally integrate with payroll providers.

### Key Requirements by Entity Type

| Entity Type | 1099 Reporting | Payroll Tax | Platform Role |
|-------------|---------------|-------------|---------------|
| Sole Proprietor | Must issue 1099s to subs > $600 | Self-employment tax; no withholding | Generate 1099 data from vendor payments |
| LLC (single member) | Same as sole proprietor | Same as sole proprietor | Same |
| LLC (multi-member) / Partnership | Must issue 1099s to subs > $600 | Partners take draws, not payroll | Track vendor payments; flag 1099-eligible |
| S-Corporation | Must issue 1099s to subs > $600 | Owner must take "reasonable salary" + payroll | Track vendor payments; integrate with payroll for employee data |
| C-Corporation | Must issue 1099s to subs > $600 | Full payroll requirements | Track vendor payments; payroll integration |

### Platform Implementation Notes

- Track vendor W-9 data (TIN, entity type, address) to determine 1099 eligibility
- Annual 1099 generation report with vendor payment totals by calendar year — **1065** (blueprint)
- Export format compatible with IRS e-file and common payroll systems
- Per-builder configuration for entity type and reporting preferences

---

## 3. Insurance Requirements

> Gap Items: **553**, **554**, **555**, **556**, **557**

### Platform Requirements

- **553**: Insurance requirements vary by state. Minimum coverage amounts and required endorsements must be configurable per builder's location and per project.
- **554**: Workers' compensation requirements differ by state — class codes, rates, exemptions, and thresholds all vary.
- **555**: Builder's Risk insurance must be tracked per project with distinct policies, limits, deductibles, and effective dates.
- **556**: Additional insured endorsements must be trackable; system should auto-request from vendors along with their COI.
- **557**: Annual insurance audit data preparation — the system must auto-generate payroll and subcontractor costs by class code from project data.

### Workers' Compensation by State

| State | WC Required? | Exemption Threshold | Monopolistic State Fund? | Key Notes |
|-------|-------------|---------------------|-------------------------|-----------|
| **Florida** | Yes, for 1+ employees (construction) | Corporate officers can exempt (max 3) | No | Construction has NO employee-count exemption — even 1 employee triggers WC. |
| **Texas** | No — optional | N/A (opt-in state) | No | Non-subscribers face increased liability. Most commercial clients require it anyway. |
| **California** | Yes, for 1+ employees | No exemptions for sole proprietors | State Compensation Insurance Fund (competitive, not monopolistic) | Strict enforcement; heavy penalties for non-compliance. |
| **Colorado** | Yes, for 1+ employees | Sole proprietors and partners exempt | Pinnacol Assurance (competitive state fund) | |
| **Georgia** | Yes, for 3+ employees | 1-2 employees exempt | No | Officers can elect exemption. |
| **North Carolina** | Yes, for 3+ employees | 1-2 employees exempt | No | |
| **South Carolina** | Yes, for 4+ employees | 1-3 employees exempt | No | |
| **Tennessee** | Yes, for 5+ employees (construction) | 1-4 employees exempt | No | Construction-specific threshold is 5, not the general threshold. |

### Builder's Risk Insurance Tracking (Per Project) — **555**

Each project record must include:
- Policy number
- Insurance carrier
- Coverage amount (typically = construction value)
- Deductible amount
- Effective date / expiration date
- Named insured parties
- Covered perils (fire, wind, theft, vandalism, flood — varies by policy)
- Flood coverage (separate policy in flood zones)
- Builder's Risk vs. Installation Floater distinction

### COI & Additional Insured Tracking — **556**

For every vendor/subcontractor on every project:
- General liability COI on file (auto-expire alerts)
- Workers' compensation COI on file
- Auto/vehicle insurance COI (if applicable)
- Additional insured endorsement naming builder and owner
- Waiver of subrogation endorsement
- Per-project vs. blanket additional insured
- Auto-request workflow: system sends COI request to vendor with project-specific requirements

### Annual Insurance Audit Data — **557**

The system must generate:
- Total payroll by workers' compensation class code
- Total subcontractor payments by trade/class code
- Breakdown by project
- Breakdown by time period (quarterly, annual)
- Exclusions (materials-only vendors, equipment rental, etc.)
- Format compatible with common insurance audit worksheets

---

## 4. Lien Waiver Requirements (State-Specific)

> Gap Items: **351**, **352**, **353**, **354**, **355**, **356**, **357**, **358**

### Platform Requirements

- **351**: Lien waiver forms vary by state. The system must have state-specific statutory forms where they exist.
- **352**: States with no statutory forms must support builder-created custom forms.
- **353**: Conditional vs. unconditional waiver tracking must be state-aware.
- **354**: Sub-tier lien waiver tracking — the builder's sub's supplier also needs to provide waivers.
- **355**: Notice to Owner / Preliminary Notice requirements vary by state; system must track filing requirements and deadlines.
- **356**: Mechanic's lien filing deadlines vary by state; alert system for approaching deadlines.
- **357**: Lien release/satisfaction documentation must be generated and tracked.
- **358**: Electronic vs. wet signature requirements for lien waivers vary by jurisdiction.

### Lien Waiver Forms by State

| State | Statutory Forms? | Form Types Required | Key Deadlines | E-Signature? |
|-------|-----------------|--------------------|--------------:|-------------|
| **Florida** | Yes (FL Stat. 713.20) | Conditional Progress, Unconditional Progress, Conditional Final, Unconditional Final | Lien must be filed within 90 days of last work; NTO within 45 days of first work | Yes (with conditions) |
| **Texas** | Yes (TX Property Code Ch. 53) | Conditional Progress, Unconditional Progress, Conditional Final, Unconditional Final | Lien must be filed by 15th of 4th month after last work (varies by claimant type) | Yes |
| **California** | Yes (CA Civil Code 8132-8138) | Conditional Progress, Unconditional Progress, Conditional Final, Unconditional Final | Preliminary Notice within 20 days of first work; lien within 90 days of completion | Yes |
| **Colorado** | No statutory forms | Builder-defined forms | NTO within 10 business days of first work; lien within 6 months | Varies by county |
| **Georgia** | No statutory forms | Builder-defined forms | Lien within 90 days of last work; preliminary notice not required for subs | Yes |
| **North Carolina** | No statutory forms | Builder-defined forms | Lien on funds (subcontractor) within 120 days; Claim of Lien on Real Property within 120 days of last work | Yes |
| **South Carolina** | No statutory forms | Builder-defined forms | Lien within 90 days of last work | Yes |
| **Tennessee** | No statutory forms | Builder-defined forms | Notice of Nonpayment within 90 days; lien within 90 days of last work | Yes |

### Notice to Owner / Preliminary Notice — **355**

| State | Required By | Deadline | Sent To |
|-------|-----------|---------|---------|
| **Florida** | Subcontractors and suppliers who don't have direct contract with owner | Within 45 days of first furnishing labor/materials | Owner (and contractor if sent by sub's sub) |
| **California** | Almost everyone in the chain (except direct contractors to owner) | Within 20 days of first furnishing | Owner, general contractor, construction lender |
| **Texas** | Sub-tier claimants (2nd tier and below) | By 15th of 2nd month after first furnishing | Owner and general contractor |
| **Colorado** | Subcontractors and suppliers | Within 10 business days of first work | Owner |
| **Georgia** | Not required | N/A | N/A |

### Platform Implementation Notes

- State-specific form library with version control (forms change when statutes are amended)
- Automatic deadline calculations based on project state and claimant type
- Sub-tier waiver collection workflow — **354**
- Alert system for approaching lien filing deadlines — **356**
- Document generation for lien releases — **357**
- E-signature integration with fallback to wet signature tracking — **358**
- Per-payment waiver requirement enforcement (configurable: no payment without waiver)

---

## 5. Permitting & Inspections (Jurisdiction-Specific)

> Gap Items: **471**, **472**, **473**, **474**, **475**, **582**

### Platform Requirements

- **471**: Permit types, processes, and fees vary by jurisdiction. Must be configurable per project location.
- **472**: Inspection type configuration must be flexible — foundation, framing, MEP rough, insulation, drywall, final — and varies by code and jurisdiction.
- **473**: Builders operating in multiple jurisdictions need different rules per project.
- **474**: Online permit integration where jurisdictions offer APIs; manual tracking where they don't.
- **475**: Special inspection requirements (structural threshold, concrete testing) vary by project scope and jurisdiction.
- **582**: Permit processes that vary by municipality — online, in-person, combined — with different timelines.

### Common Permit Types

| Permit Type | Typical Jurisdictions | Notes |
|-------------|----------------------|-------|
| Building Permit (overall) | All | Master permit for the project |
| Foundation/Footing | Most | Sometimes combined with building |
| Electrical | All | Often requires licensed electrician to pull |
| Plumbing | All | Often requires licensed plumber to pull |
| Mechanical/HVAC | All | Covers heating, cooling, ventilation |
| Gas | Many | Sometimes separate, sometimes under mechanical |
| Roofing | Many (especially FL, TX) | Wind mitigation requirements in coastal areas |
| Pool/Spa | Where applicable | Separate permit with own inspection sequence — **1001** |
| Fence | Many municipalities | Height and setback restrictions |
| Driveway/Right-of-Way | Many municipalities | Covers work in public ROW |
| Tree Removal | Many municipalities | Protected species, heritage tree ordinances |
| Land Clearing/Grading | Most | Erosion control/SWPPP requirements |
| Demolition | Where applicable | Asbestos survey may be required first |

### Common Inspection Sequence (Configurable per Jurisdiction) — **472**

1. Foundation/footing (before pour)
2. Slab pre-pour / under-slab plumbing
3. Framing / structural
4. Electrical rough-in
5. Plumbing rough-in
6. Mechanical rough-in
7. Insulation (energy code)
8. Drywall (before cover in some jurisdictions)
9. Fire sprinkler (if applicable)
10. Final electrical
11. Final plumbing
12. Final mechanical
13. Final building / Certificate of Occupancy

### Special Inspections — **475**

| Type | When Required | Scope |
|------|--------------|-------|
| Structural steel | When moment frames, steel beams exceed threshold | Welding inspection, bolt torque verification |
| Concrete testing | Most commercial; some residential over threshold | Compressive strength testing, slump testing |
| Soil compaction | When fill is placed for structural support | Proctor testing, density verification |
| Threshold building | FL: buildings > 3 stories or 50 ft | Dedicated threshold inspector required |
| Wind resistance | FL and coastal: high-velocity hurricane zone | Miami-Dade NOA compliance |

### Platform Implementation Notes

- Jurisdiction database with configurable permit types, inspection sequences, and fee schedules
- Per-project jurisdiction assignment based on address
- Online permit portal integration where APIs are available — **474**
- Inspection scheduling with building department calendar integration where possible
- Pass/fail tracking with re-inspection workflow
- Special inspection tracking linked to project scope — **475**

---

## 6. Building Codes & Regional Requirements

> Gap Items: **581**, **583**, **584**, **585**, **586**, **587**, **588**, **589**, **590**

### Platform Requirements

- **581**: Building codes differ by state and jurisdiction. The platform must maintain awareness of code requirements (not a full code database, but enough to drive checklists and inspections).
- **583**: Weather data integration for all US regions via single weather API; must support regional accuracy for scheduling.
- **584**: Material availability by region — some products are nationally available, others are regional.
- **585**: Regional labor market conditions — labor shortage areas, prevailing wage areas.
- **586**: Natural disaster considerations by region must inform project planning and insurance requirements.
- **587**: Foundation type tracking by region — slab (TX, FL), basement (Midwest, Northeast), crawlspace (Southeast), piling (coastal).
- **588**: Energy code requirements vary by climate zone.
- **589**: Wildfire zone (WUI) requirements — defensible space, ember-resistant construction.
- **590**: High-seismic zone requirements — different structural and inspection requirements.

### Building Code Adoption by State

| State | Base Code | Current Edition (typical) | Local Amendments? | Notes |
|-------|-----------|--------------------------|-------------------|-------|
| **Florida** | Florida Building Code (based on IBC/IRC) | 8th Edition (2023) | Yes, by county | Most stringent wind requirements in US; statewide uniformity with local amendments |
| **Texas** | IRC/IBC | 2021 (varies by city) | Yes, by municipality | No statewide residential code — city/county adoption varies |
| **California** | California Building Code (Title 24) | 2022 | Yes, by city | Most stringent energy code (Title 24 Part 6); seismic design critical |
| **Colorado** | IRC/IBC | 2021 (varies) | Yes, by municipality | Wildfire (WUI) requirements in mountain communities |
| **Georgia** | IRC/IBC with GA amendments | 2018 | Limited | Statewide adoption with state-level amendments |
| **North Carolina** | NC Building Code (based on IRC/IBC) | 2018 | No — statewide uniform | One of few states with true statewide uniformity |
| **South Carolina** | IRC/IBC | 2018 | Yes, by municipality | Coastal counties have additional wind requirements |
| **Tennessee** | IRC/IBC | 2018 (varies) | Yes, by municipality | Not all jurisdictions adopt codes; rural areas may have none |

### Regional Natural Disaster Requirements — **586**

| Region | Primary Hazards | Code/Design Impact | Insurance Impact |
|--------|----------------|-------------------|-----------------|
| **Florida / Gulf Coast** | Hurricanes, flooding, storm surge | Wind design (HVHZ in Miami-Dade/Broward), flood elevation, impact-rated openings | Windstorm (Citizens or private), flood (NFIP or private), Builder's Risk with wind |
| **Texas Gulf Coast** | Hurricanes, flooding | Windborne debris region near coast; flood zones | Similar to FL coastal |
| **California** | Earthquakes, wildfires | Seismic design categories D/E; WUI fire-hardening | Earthquake (separate policy), fire (increasingly difficult in WUI) |
| **Colorado Mountains** | Wildfires, snow loads | WUI defensible space; high snow load design | Wildfire exclusion zones; snow load design |
| **Southeast** | Tornadoes, occasional hurricanes | Safe rooms optional; wind design in coastal areas | Standard homeowners usually covers |
| **Northeast** | Snow, ice, nor'easters | Snow load design; frost depth foundations; ice dam prevention | Standard homeowners |
| **Midwest** | Tornadoes | Safe room recommendations; basement construction common | Standard homeowners |

### Foundation Types by Region — **587**

| Foundation Type | Typical Regions | Key Considerations |
|----------------|----------------|--------------------|
| Slab-on-grade | FL, TX, LA, southern states | Soil bearing capacity; pre-tension/post-tension in expansive soils (TX) |
| Crawlspace | Southeast, mid-Atlantic | Moisture management; flood zone compliance; access for MEP |
| Full basement | Midwest, Northeast, mountain areas | Frost depth; waterproofing; egress windows; radon mitigation |
| Deep pilings | Coastal (FL, SC, NC, TX barrier islands) | Pile driving records; elevation certificates; FEMA compliance |
| Auger-cast piles | Coastal and poor-soil areas | Load testing; engineering certification |
| Helical piers | Variable soil conditions; renovation/addition | Torque verification; engineering design |

### Energy Code by Climate Zone — **588**

The IECC divides the US into 8 climate zones. Key requirements scale with zone:

| Climate Zone | Typical States | Wall Insulation | Ceiling Insulation | Foundation Insulation | Window U-Factor |
|-------------|---------------|-----------------|--------------------|-----------------------|-----------------|
| 1 (Very Hot) | South FL, HI | R-13 | R-30 | None | 0.40 |
| 2 (Hot) | FL, TX coast, LA, GA coast | R-13 | R-38 | None | 0.40 |
| 3 (Warm) | TX inland, GA, SC, NC coast, TN | R-20 or R-13+5ci | R-38 | R-5ci | 0.32 |
| 4 (Mixed) | NC mountains, TN east, VA | R-20 or R-13+5ci | R-49 | R-10ci | 0.32 |
| 5 (Cool) | CO front range, midwest | R-20 or R-13+5ci | R-49 | R-15ci | 0.30 |
| 6 (Cold) | CO mountains, northern states | R-20+5ci or R-13+10ci | R-49 | R-15ci | 0.30 |
| 7-8 (Very Cold/Subarctic) | AK, northern MN | R-20+10ci | R-60 | R-20ci | 0.30 |

### Wildfire / WUI Zone Requirements — **589**

For builders in Wildfire-Urban Interface zones:
- Defensible space (typically 100 ft zones with vegetation management)
- Ignition-resistant construction (Class A roof, ember-resistant vents, non-combustible siding within zones)
- Chapter 7A requirements (California specific)
- Colorado WUI code requirements (varies by county/fire district)
- Insurance availability challenges — system should track fire hardening documentation for insurance underwriting

### Seismic Zone Requirements — **590**

| Seismic Design Category | Typical Locations | Key Requirements |
|------------------------|-------------------|------------------|
| A-B (Low) | Most of eastern US | Standard construction; no special requirements |
| C (Moderate) | Parts of SE, intermountain west | Braced cripple walls; anchor bolts; some hold-down requirements |
| D (High) | Coastal CA, parts of OR/WA, Memphis area, Charleston SC | Full seismic detailing; holdowns; shear wall design; special inspection |
| E (Very High) | Near-fault zones in CA | Enhanced D requirements; near-fault design factors |

---

## 7. Contractor Licensing

> Related Gap Items: **520** (license database integration), **560** (employee certification tracking), **1061** (monthly license renewal review)

### Platform Requirements

- Track builder's own license(s) by state with renewal dates and alerts
- Track subcontractor/vendor licenses by state with expiration alerts
- Integration with state licensing databases where APIs exist — **520**
- Configurable license requirements per project jurisdiction

### Licensing Requirements by State

| State | License Required? | Issuing Body | License Types | Reciprocity? |
|-------|------------------|-------------|--------------|-------------|
| **Florida** | Yes — state license required | DBPR / Construction Industry Licensing Board | CGC (General), CBC (Building), CRC (Residential) | Limited (some states) |
| **Texas** | No state license (with exceptions) | N/A (local may require registration) | Electrical, plumbing, HVAC require state license | N/A |
| **California** | Yes — state license required | CSLB | A (General Engineering), B (General Building), C-xx (Specialty) | No |
| **Colorado** | No state license | Local jurisdiction | Varies by city/county | N/A |
| **Georgia** | Yes — state license or registration | GA Secretary of State | Residential Basic, Residential Light Commercial, General Contractor | No |
| **North Carolina** | Yes — state license | NC Licensing Board for GC | Limited, Intermediate, Unlimited (by dollar amount) | No |
| **South Carolina** | Yes — state license | SC LLR - Contractors' Licensing Board | Residential Builder, General Contractor (tiers by dollar amount) | No |
| **Tennessee** | Yes — state license | TN Board for Licensing Contractors | BC-A (unlimited), BC-B ($1.5M limit), BC-b (residential ≤3 stories) | No |

---

## 8. Retainage Laws

> Related Gap Items: **347** (configurable retainage rules)

### Retainage by State

| State | Max Retainage | Release Timing | Notes |
|-------|-------------|----------------|-------|
| **Florida** | 10% until 50% complete, then 5% | Within 30 days of substantial completion or final payment | FL Stat. 715.12 (public); private varies by contract |
| **Texas** | 10% (common practice) | No specific statute for private — contract governs | Public works: retainage capped at 5% once 50% complete |
| **California** | 5% (public); 10% (private typical) | 60 days after completion (public); per contract (private) | Contractors can substitute securities for retainage |
| **Colorado** | No statutory cap (private) | Per contract | Public: varies by entity |
| **Georgia** | No statutory cap | Per contract | Prompt payment act applies |
| **North Carolina** | 5% (public and private) | Per contract; must release within 45 days of completion conditions | |
| **South Carolina** | No statutory cap | Per contract | Prompt Payment Act governs timing |
| **Tennessee** | 5% (public) | Per contract (private) | Public retainage must be held in interest-bearing account |

---

## 9. Prompt Payment Requirements

> Related Gap Items: **348** (conditional payment rules)

### Prompt Payment by State

| State | Payment Deadline (Private) | Payment Deadline (Public) | Penalty for Late Payment |
|-------|--------------------------|-------------------------|-------------------------|
| **Florida** | 30 days from invoice | 25 business days | 1% per month + attorney fees |
| **Texas** | 35 days from invoice (owner to GC); 7 days after receipt (GC to sub) | 30 days | 1.5% per month |
| **California** | 30 days from invoice | 30 days | 2% per month |
| **Colorado** | Per contract | Per contract | Per contract |
| **Georgia** | Per contract | 15 days (GC to sub after payment received) | 1% per month |
| **North Carolina** | Per contract | 7 days after receipt (GC to sub) | 1% per month |
| **South Carolina** | 21 days | 21 days | 1% per month |
| **Tennessee** | Per contract | Per contract | Interest at formula rate |

---

## 10. Regional Material & Labor Considerations

> Gap Items: **584**, **585**

### Material Availability — **584**

The platform should support:
- Regional material availability flags (e.g., certain stone only available in southeast quarries)
- Lead time adjustments by region (coastal areas may have longer lead times for certain materials)
- Regional pricing intelligence — same product costs differently in different markets
- Supply chain disruption tracking by region

### Labor Market Conditions — **585**

- Labor shortage indicators by trade and region
- Prevailing wage requirements for government-funded or quasi-public projects
- Davis-Bacon Act tracking for federal-related projects
- State prevailing wage laws (CA, NY, NJ, etc. have state-level requirements)
- Union vs. non-union market tracking by region
- Seasonal labor availability (e.g., workforce migration patterns in northern states)

---

## 11. Weather & Environmental Data

> Gap Items: **583**, **586**

### Weather Integration — **583**

- Single weather API (e.g., OpenWeatherMap, Weather.gov) covering all US regions
- Daily log auto-population with weather conditions — **319**
- Weather-aware scheduling: flag outdoor tasks when adverse weather is forecast
- Historical weather data for delay documentation and excusable delay claims
- Regional accuracy requirements (microclimate awareness for coastal, mountain areas)

### Environmental Compliance

- SWPPP (Stormwater Pollution Prevention Plan) tracking — **957**
- Wetlands delineation and protected species — **934**
- Tree protection ordinances (vary by municipality) — **956**
- Environmental assessment requirements — **934**
- Noise ordinances and construction hours by jurisdiction
- Air quality restrictions (dust control, burn permits)

---

## Priority States for Launch

### Tier 1 (Must Have at Launch)
1. **Florida** — Builder's home base; complex lien law; strict building code; hurricane requirements
2. **Texas** — Large custom home market; unique tax structure; opt-in WC state
3. **California** — Largest construction market; strictest codes; seismic + fire requirements

### Tier 2 (Within 6 Months)
4. **Georgia** — Growing custom market; moderate complexity
5. **North Carolina** — Significant coastal + mountain custom building
6. **South Carolina** — Growing market; coastal requirements
7. **Tennessee** — Active custom market; moderate regulatory complexity
8. **Colorado** — Mountain/luxury market; WUI requirements

### Tier 3 (Within 12 Months)
9. All remaining states — driven by customer demand and onboarding pipeline

---

## Gap Item Cross-Reference Index

| Gap Item | Description | Section in This Document |
|----------|-------------|------------------------|
| 347 | Configurable retainage rules | 8. Retainage Laws |
| 348 | Conditional payment rules | 9. Prompt Payment Requirements |
| 351 | State-specific statutory lien waiver forms | 4. Lien Waiver Requirements |
| 352 | States without statutory forms | 4. Lien Waiver Requirements |
| 353 | Conditional vs. unconditional waiver tracking | 4. Lien Waiver Requirements |
| 354 | Sub-tier lien waiver tracking | 4. Lien Waiver Requirements |
| 355 | Notice to Owner / Preliminary Notice | 4. Lien Waiver Requirements |
| 356 | Mechanic's lien filing deadlines | 4. Lien Waiver Requirements |
| 357 | Lien release/satisfaction documentation | 4. Lien Waiver Requirements |
| 358 | Electronic vs. wet signature for waivers | 4. Lien Waiver Requirements |
| 471 | Permit types vary by jurisdiction | 5. Permitting & Inspections |
| 472 | Inspection type configuration | 5. Permitting & Inspections |
| 473 | Multi-jurisdiction builders | 5. Permitting & Inspections |
| 474 | Online permit integration | 5. Permitting & Inspections |
| 475 | Special inspection requirements | 5. Permitting & Inspections |
| 520 | State licensing database integration | 7. Contractor Licensing |
| 547 | Sales tax varies by state | 1. Sales Tax on Construction |
| 548 | Multi-state tax rules | 1. Sales Tax on Construction |
| 549 | Tax rate lookup by address | 1. Sales Tax on Construction |
| 550 | Tax exemption management | 1. Sales Tax on Construction |
| 551 | 1099 reporting by entity type | 2. Income Tax Reporting |
| 552 | Payroll tax for W-2 employees | 2. Income Tax Reporting |
| 553 | Insurance requirements by state | 3. Insurance Requirements |
| 554 | Workers' compensation by state | 3. Insurance Requirements |
| 555 | Builder's Risk insurance per project | 3. Insurance Requirements |
| 556 | Additional insured endorsement tracking | 3. Insurance Requirements |
| 557 | Annual insurance audit data | 3. Insurance Requirements |
| 560 | Employee certification tracking | 7. Contractor Licensing |
| 581 | Building codes by jurisdiction | 6. Building Codes & Regional Requirements |
| 582 | Permit processes by municipality | 5. Permitting & Inspections |
| 583 | Weather data for all regions | 11. Weather & Environmental Data |
| 584 | Material availability by region | 10. Regional Material & Labor |
| 585 | Regional labor market conditions | 10. Regional Material & Labor |
| 586 | Natural disaster considerations by region | 6. Building Codes & Regional Requirements |
| 587 | Foundation types by region | 6. Building Codes & Regional Requirements |
| 588 | Energy code by climate zone | 6. Building Codes & Regional Requirements |
| 589 | Wildfire zone (WUI) requirements | 6. Building Codes & Regional Requirements |
| 590 | High-seismic zone requirements | 6. Building Codes & Regional Requirements |
| 1061 | Monthly license renewal review | 7. Contractor Licensing |
| 1065 | Tax preparation support (1099) | 2. Income Tax Reporting |
| 1066 | Insurance audit data preparation | 3. Insurance Requirements |

---

*This document is a living reference. Each section must be validated with legal counsel and updated as statutes change. The platform must include a regulatory update mechanism to push state-specific changes to all affected tenants.*
