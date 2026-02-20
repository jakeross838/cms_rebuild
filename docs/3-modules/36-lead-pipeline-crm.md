# Module 36: Lead Pipeline & CRM

**Phase:** 5 - Full Platform
**Status:** TODO
**Optional Module:** No -- core module (bridges sales and project management)

---

## Overview

Full-lifecycle lead and preconstruction management from initial inquiry through signed
contract. Covers lead capture from multiple sources, lead scoring and qualification,
nurturing workflows with drip campaigns, consultation and meeting tracking, configurable
pipeline stages, proposal management, conversion to active project, and win/loss
analytics. Designed to replace standalone CRMs (HubSpot, Salesforce) for builders who
want their sales pipeline tightly integrated with estimating, scheduling, and project
management.

The pipeline supports the full spectrum from the builder who gets 2 leads per month
(simple list view) to the builder who gets 50+ leads per month (kanban board with
scoring and automated nurturing). Every stage, scoring criterion, and workflow is
configurable per builder.

---

## Gap Items Addressed

| Gap # | Description | Resolution |
|-------|-------------|------------|
| 236 | Platform-provided lead management vs. CRM integration | Both: native CRM module AND integration with HubSpot/Salesforce for builders who prefer external |
| 237 | Lead source tracking (website, referral, Houzz, social, Parade of Homes) | Configurable lead source list with UTM parameter capture for digital sources |
| 238 | Lead routing for multi-PM builders (round-robin, geographic, project type, workload) | Configurable routing rules engine with multiple assignment strategies |
| 239 | Lead nurturing (drip campaigns, follow-up reminders, status tracking) | Automated nurturing sequences with templated emails and task-based follow-ups |
| 240 | Lead qualification scoring (budget, lot ownership, timeline, financing) | Weighted scoring model with configurable criteria and thresholds |
| 241 | Leads that don't convert -- archive and analytics | Lost lead tracking with reason codes, win/loss analysis, pipeline leakage reports |
| 242 | Scalable UI: 50 leads/month vs. 2 leads/month | Adaptive views: simple list for low volume, kanban + filters for high volume |
| 243 | Lead deduplication (same person, multiple inquiry sources) | Duplicate detection on name, email, phone, address with merge workflow |
| 244 | Lead source ROI tracking (spend vs. conversions vs. contract value) | Source attribution with cost tracking and ROI calculation per source |
| 245 | Configurable stages: lead -> prospect -> preconstruction -> active project | Builder-defined pipeline stages with configurable gates and required fields |
| 246 | Proposals to non-converting leads -- pricing data captured for intelligence | Proposal data retained in analytics even when lead is marked lost |
| 247 | Plan-bid-build workflow (client brings completed plans) | Preconstruction type: plan-bid-build with simplified pipeline (skip design phases) |
| 248 | Design-build workflow (builder manages design phase) | Preconstruction type: design-build with architect/engineer tracking, design milestones |
| 249 | Multi-bid scenarios (client getting bids from 3 builders) | Competitive tracking: known competitors, perceived position, differentiators |
| 250 | Pre-construction agreements (paid planning phase before contract) | Pre-con agreement workflow with separate billing, scope, and milestone tracking |
| 251 | Lot evaluation (soil, flood zone, setbacks, utilities) | Lot due diligence checklist with configurable items and pass/fail/unknown status |
| 252 | Feasibility studies (can we build this on this lot for this budget?) | Feasibility analysis template with preliminary cost ranges and go/no-go recommendation |
| 253 | Scope development iterations (V1 concept -> V2 schematic -> V3 CD estimate) | Version-tracked scope/estimate progression linked to pipeline stage |
| 254 | Design team communication during preconstruction | Meeting log, decision tracker, and direction change history per lead/prospect |
| 255 | Long preconstruction phases (6-18 months for luxury custom) | Timeline tracking with milestone-based stage progression, not just date-based |
| 256 | Preconstruction billing (monthly design fee, hourly consulting, flat fee) | Pre-con invoice generation with configurable billing types per agreement |
| 914 | Networking/event tracking (industry events, builder association meetings, relationships) | Activity type for networking events with relationship tracking and follow-up reminders |
| 915 | Strategic lot tracking (monitor lots for sale matching ideal build profile) | Lot watch list with alerts when matching lots hit the market; links to lot evaluation on lead creation |
| 917 | Competitive intelligence (competitor pricing trends, new starts, marketing activity) | Manual-entry competitive intel log per market area; feeds win/loss analytics |
| 920 | Lead scoring: budget realism (lot ownership, financing pre-approval, budget-to-wish alignment) | Enhanced scoring criteria with budget realism composite score |
| 924 | Dream board capture (client inspiration images, must-have features, lifestyle needs) | Dream board attachment on lead record: images, notes, feature wish list captured during initial conversations |
| 926 | Quick feasibility calculator (configurable formula: lot + wishes + current costs = rough range) | Configurable feasibility formula per builder producing rough cost range from lot, scope, and current cost data |
| 927 | Design team assembly (architect, engineer, interior designer, landscape architect tracking) | Design team roster per lead with contact info, contracts, and deadline tracking |
| 928 | Design milestone tracking (concept -> schematic -> DD -> CD with client review gates) | Design phase milestones with stage-gate client approvals at each transition |
| 929 | Design meeting management (schedule, agenda, attendees, minutes, decisions, action items) | Formal meeting record type for design meetings linked to lead, with decision and action item tracking |
| 930 | Preliminary budget tracking across design iterations | Estimate snapshots at each design milestone; budget delta display showing cost impact of design changes |
| 931 | Preconstruction agreement management (paid planning phase, separate billing) | Enhanced pre-con agreement: separate billing tracking, milestone-based invoicing, scope limitations |
| 932 | Geotechnical report tracking (soil boring results, foundation recommendations, cost implications) | Geotech report status field on lot evaluation with findings summary and cost impact notes |
| 933 | Survey management (boundary, topographic, tree, elevation surveys; who ordered, when received) | Survey tracking per lot: type, ordered date, received date, surveyor contact, results/findings |
| 934 | Environmental assessment tracking (wetlands, protected species, stormwater requirements) | Environmental assessment checklist on lot evaluation with status, findings, and mitigation requirements |
| 935 | HOA/deed restriction checklist (architectural review board requirements, submission deadlines, approval status) | HOA/ARB submission workflow: requirements list, submission date, review period, approval status, conditions |
| 936 | Utility coordination tracker (water, sewer, electric, gas, cable — application status, fees, timeline) | Utility availability and connection tracking per lot with application status, estimated fees, and timeline |
| 937 | Impact fee calculator by jurisdiction (school, transportation, park, fire impact fees) | Impact fee estimator with configurable fee schedules per jurisdiction; auto-populates in feasibility estimate |
| 938 | Design coordination issue log (conflicts between architectural, structural, MEP, interior design) | Design conflict tracker: log conflicts, assign resolution responsibility, track status, link to design revision |
| 950 | Public estimator lead capture (instant budget ranges from website calculator) | Website estimator integration with lead capture gate, estimate snapshot storage, and automated qualification |
| 951 | Estimator-to-estimate accuracy tracking (website estimate vs. detailed estimate) | Compare public estimator ranges to formal estimates for continuous calibration and lead qualification scoring |
| 952 | Estimator lead prioritization (qualified by budget realism before follow-up) | AI-powered budget realism score based on estimator inputs vs. actual historical project costs |

---

## Detailed Requirements

### Public Estimator Integration (Gaps 950-952)

The public estimator on the builder's website allows prospective clients to get instant budget ranges by entering their project parameters (square footage, style, finish level, bedrooms, bathrooms). When they complete the estimate, they must provide contact information to see the final numbers — this creates a highly qualified lead with attached scope data.

#### Estimator Lead Capture
- Public estimator hosted on builder's website (Module 45 Price Intelligence)
- Lead capture gate: contact info required before showing final estimate range
- Estimator data captured and attached to lead record:
  - Square footage
  - Finish level (builder/standard/premium/luxury)
  - Home style (coastal, modern, craftsman, etc.)
  - Bedroom and bathroom counts
  - Estimate range (low-high)
  - Detailed cost breakdown by category
  - Timestamp and session data
- Source attribution: "Website Estimator" with session details
- Auto-assignment: estimator leads can be routed based on finish level, project size, or geographic rules

#### Budget Realism Scoring
- AI-powered scoring based on estimator inputs vs. historical project data:
  - Compare requested finish level to budget range — is the client's expectation realistic?
  - Compare $/SF to completed projects of similar type and finish level
  - Factor in lot complexity indicators (if provided)
- Score feeds into overall lead qualification score (Gap 240)
- Flag leads where budget-to-scope mismatch is significant (e.g., "premium finish expectations at builder-grade budget")
- Automatic notification to PM when high-realism-score leads come in

#### Estimate Comparison & Calibration
- When a formal estimate is created for an estimator-sourced lead:
  - Display the original estimator range alongside the detailed estimate
  - Calculate variance percentage
  - Track estimate accuracy over time for calibration
- Calibration loop: variance data feeds back to Price Intelligence (Module 45) to improve public estimator accuracy
- Reports: estimator-to-estimate variance by category, finish level, and project type

#### Edge Cases
1. **Lead uses estimator multiple times with different parameters.** Store all sessions and show the most recent on the lead card. Allow PM to view full session history. If significantly different project types, suggest creating multiple project interests on the same lead.
2. **Estimator lead already exists in system (duplicate).** Apply standard deduplication (Gap 243) but flag that the existing lead has now used the estimator — merge the estimator data into the existing lead record.
3. **Lead's estimator budget is wildly unrealistic.** Display a tactful "budget realism" indicator to the PM. Do not auto-decline leads, but provide talking points for the initial consultation. Some "unrealistic" leads are simply uninformed and can be educated.

### Lead Capture
- Web form integration: embeddable form for builder's website with configurable fields
- Manual lead entry for phone/walk-in/referral inquiries
- Email parsing: forward inquiry emails to a system address, auto-create lead record
- Third-party source import: Houzz, Zillow, Angi, social media DMs (via integration or manual)
- UTM parameter capture for digital marketing attribution
- Auto-acknowledge: configurable auto-response email/SMS to new leads
- Lead deduplication: check name, email, phone, address at entry; prompt for merge if match found
- Lead assignment: auto-route to PM based on configurable rules or manual assignment

#### Edge Cases & What-If Scenarios

1. **Lead comes from an untracked source.** When a lead arrives through a channel not configured in the lead source list (e.g., a random phone call, a yard sign inquiry, or an informal referral at a social event), the system must handle ad-hoc sources gracefully. Required behavior: (a) an "Other / Manual Entry" source option is always available with a free-text description field, (b) when a new ad-hoc source is used more than a configurable threshold (default: 3 times), the system suggests adding it as a formal source category, (c) the lead source ROI reporting includes an "unattributed" category so builders can see how much pipeline value is not being tracked, and (d) the system allows retroactive source assignment when a lead's origin is discovered later.

2. **Lead has multiple projects they are considering.** The data model must support a single lead contact being associated with multiple potential projects. Required behavior: (a) a lead record can have multiple "project interests" each with its own project type, budget range, timeline, and lot information, (b) each project interest can be at a different pipeline stage independently, (c) scoring applies per project interest (a lead may be hot for one project and cold for another), (d) when a lead converts to a project, only the specific project interest is converted -- other interests remain active in the pipeline, and (e) the pipeline kanban board can display either leads (one card per person) or project interests (one card per potential project) based on builder preference.

### Networking & Event Tracking (Gap 914)
- Track industry events, builder association meetings, Parade of Homes, trade shows
- Log attendees, conversations, and relationships cultivated at each event
- Follow-up task generation from event contacts
- Link networking contacts to lead records when they become prospects
- Event ROI: track which networking activities generate leads and conversions

### Strategic Lot Tracking (Gap 915)
- Lot watch list: define ideal lot criteria (location, size, zoning, price range, topography)
- Alert when matching lots hit the market (MLS integration or manual entry)
- Lot evaluation auto-populates when a watched lot is linked to a new lead
- Track lot acquisition status: available, under contract, sold, off-market
- Map view of watched lots overlaid with builder's current project locations

### Competitive Intelligence (Gap 917)
- Manual-entry competitive intelligence log per market area
- Track competitor activity: new project starts, marketing campaigns, pricing trends, staffing changes
- Competitor profiles: company name, typical project types, price range, reputation, strengths/weaknesses
- Link competitive intel to specific leads where the competitor is also bidding (feeds Gap 249 tracking)
- Quarterly competitive landscape summary report

### Lead Scoring & Qualification
- Weighted scoring model with builder-defined criteria:
  - Budget range (realistic for what they want?)
  - Lot status (owned, under contract, looking)
  - Timeline (ready to start, 6+ months out, just exploring)
  - Financing (pre-approved, cash, needs to sell existing home)
  - Project type (new build, major renovation, addition)
  - Referral source (referred by past client scores higher)
  - Engagement level (responded to follow-up, attended consultation)
  - Budget realism composite (Gap 920): does the client's budget align with what they want? Score based on: lot ownership status, financing pre-approval, budget-to-wish-list alignment, comparable project data
- Score thresholds: hot / warm / cold (configurable per builder)
- Auto-stage advancement when score crosses threshold
- Score recalculation on data changes or engagement events

#### Edge Cases & What-If Scenarios

1. **Lead scoring bias.** The lead scoring model is powerful but could produce biased results if not implemented carefully. Required behavior: (a) the system provides a "scoring audit" view that shows how each lead's score was calculated, with per-criterion breakdowns, (b) builders can adjust scoring weights at any time, with a preview showing how the change would affect current lead rankings, (c) the system tracks scoring accuracy over time: compare scores at each stage to eventual win/loss outcomes, and flag when high-scored leads consistently lose or low-scored leads consistently win (indicating the model needs recalibration), (d) demographic or geographic criteria that could introduce unfair bias are flagged with a warning during scoring configuration, and (e) a periodic "scoring health check" report is available showing score distribution, correlation with conversion rates, and suggested weight adjustments.

### Pipeline Management
- Builder-defined pipeline stages (default: Lead -> Qualified -> Consultation -> Proposal -> Negotiation -> Won/Lost)
- Kanban board view with drag-and-drop stage transitions
- List view with sortable columns and saved filters
- Stage gates: required fields or actions before advancing (e.g., must have budget range before moving to Consultation)
- Pipeline value tracking: expected contract value x probability at each stage
- Pipeline velocity: average days in each stage, overall cycle time
- Stale lead alerts: lead has not advanced stages in configurable number of days
- **Competitive tracking (Gap 249):** When a prospective client is receiving bids from multiple builders, the system must support tracking the competitive landscape:
  - Each lead record can list known competitors (other builders bidding on the same project) with name and any known details.
  - Perceived competitive position: builder rates their position (strong, neutral, weak) with notes on differentiators.
  - Competitive intelligence fields: competitor's estimated price range (if known), competitor's perceived strengths/weaknesses, client's stated decision criteria.
  - Win/loss analysis links competitive data to outcomes: when a lead is marked lost, the winning competitor is recorded along with the reason.
  - Reporting surfaces patterns: which competitors are you losing to most often, and on what criteria (price, schedule, reputation, scope).
  - Competitive data is strictly private to the builder -- never shared across tenants or with any external party.

### Nurturing & Follow-Up
- Automated nurturing sequences: series of emails/tasks triggered by stage or event
- Email templates with merge fields (lead name, project details, builder info)
- Follow-up task creation with due dates and assignment
- Activity logging: calls, emails, meetings, site visits -- manual entry or auto-capture
- Drip campaign management: create, edit, pause, stop campaigns per lead or segment
- Engagement tracking: email opens, link clicks, form submissions (where trackable)

### Consultation & Meeting Tracking
- Consultation scheduling (calendar integration or manual entry)
- Pre-consultation checklist: information to gather before meeting
- Consultation notes and outcomes capture
- Site visit logging with photos and notes
- Dream board capture (Gap 924): log client's inspiration images, must-have features, lifestyle needs, and design preferences during initial conversations; attach images, Pinterest links, and notes; reference during design and selection phases
- Design meeting tracker: date, attendees, decisions made, action items
- Decision log: key decisions during preconstruction with date and who approved
- **Direction change tracking (Gap 254):** When the design team changes direction during preconstruction (e.g., client changes layout preference, architect revises structural approach), the system must capture direction changes as formal records with: the original direction, the new direction, who requested the change, the reason, the date, and the impact on scope/timeline/budget. Direction changes are linked to the relevant scope iteration and displayed in the lead's activity timeline. This history is critical for documenting scope evolution and justifying estimate changes.

### Preconstruction Workflows
- Design-build track: architect selection, design milestones, design review cycles
- Plan-bid-build track: plan receipt, plan review, bid preparation
- Pre-construction agreement management: scope, fee, billing terms, milestones
- Pre-con billing: generate invoices for preconstruction services
- Lot evaluation checklist: soil report, survey, flood zone, setbacks, utilities, HOA restrictions
- Feasibility analysis: preliminary budget range, go/no-go recommendation
- Quick feasibility calculator (Gap 926): configurable formula per builder that takes lot characteristics, desired scope, and current cost data to produce a rough cost range (e.g., "$X-$Y") for early client conversations; formula inputs include: square footage, finish tier, lot complexity, region, and current cost indices
- Scope iterations: V1/V2/V3 estimate versions linked to pipeline progression

### Design Team & Preconstruction Coordination (Gaps 927-938)
- Design team assembly (Gap 927): track architect, structural engineer, interior designer, landscape architect, and other consultants per lead with contact info, contract status, fee structure, and deliverable deadlines
- Design milestone tracking (Gap 928): concept, schematic design, design development, construction documents — each with client review gate; track actual vs planned dates; cannot advance to next design phase without client sign-off
- Design meeting management (Gap 929): formal meeting records with schedule, agenda, attendees, minutes, decisions made, and action items; auto-generate follow-up tasks from action items
- Preliminary budget tracking across design iterations (Gap 930): estimate snapshot at each design milestone; visual display of budget delta between iterations so client sees cost impact of design changes in real time
- Preconstruction agreement management (Gap 931): separate contract for paid design/planning phase with its own billing milestones, scope, and tracking independent from the construction contract
- Geotechnical report tracking (Gap 932): soil boring results, foundation type recommendations, cost implications; linked to lot evaluation; status tracking (ordered, received, reviewed)
- Survey management (Gap 933): boundary survey, topographic survey, tree survey, elevation certificate — each tracked with: surveyor contact, order date, received date, findings summary, document storage
- Environmental assessment tracking (Gap 934): wetlands delineation, protected species surveys, stormwater management requirements, environmental permits; status and findings with mitigation requirements
- HOA/architectural review board checklist (Gap 935): ARB requirements list, submission materials, submission date, review period, approval status, conditions of approval, required modifications
- Utility coordination tracker (Gap 936): water, sewer, electric, gas, cable/internet — application status, connection fees, estimated availability timeline, utility company contacts per lot
- Impact fee calculator (Gap 937): configurable fee schedules by jurisdiction; school impact, transportation impact, park impact, fire impact fees; auto-populates in feasibility estimate and preconstruction budget
- Design coordination issue log (Gap 938): track conflicts between architectural, structural, MEP, and interior design disciplines; assign resolution responsibility; link to design revision when resolved; prevents scope gaps from falling through the cracks
- **Long preconstruction phase support (Gap 255):** Luxury custom homes often have preconstruction phases lasting 6-18 months. The system must support long-duration preconstruction without leads going stale or falling out of tracking:
  - Milestone-based stage progression: pipeline stages advance based on milestone completion (e.g., "Schematic Design Complete," "Design Development Approved," "Construction Documents Issued"), not just elapsed time.
  - Stale lead alerts must be configurable per pipeline stage -- a lead in "Design Development" for 3 months is normal, but a lead in "Initial Consultation" for 3 months is stale.
  - Preconstruction timeline view: Gantt-style visualization of preconstruction milestones with actual vs planned dates.
  - Regular touchpoint reminders: configurable cadence for PM check-ins with the client during long preconstruction (e.g., monthly update meetings automatically scheduled).
  - Activity gap detection: if no activity is recorded on a lead for a configurable period (default: 30 days), the system alerts the assigned PM.

### Conversion to Project
- Won deal triggers project creation workflow
- Data carryover: contact info, project details, lot info, scope, estimates, documents
- Contract generation from templates (links to Module 38)
- Seamless handoff: sales PM to project PM assignment (or same person)
- Post-conversion: lead record archived with full history, linked to active project

### Win/Loss Analytics
- Win/loss tracking with configurable reason codes
- Lost lead reason analysis: too expensive, went with competitor, project cancelled, financing fell through
- Win rate by source, by PM, by project type, by price range
- Lead source ROI: marketing spend per source vs. contracts won
- Pipeline leakage: where are leads falling out and why?
- Revenue attribution: signed contract value traced back to lead source
- Competitive analysis: which competitors are you losing to, and why?

---

## Database Tables

```
leads
  id, builder_id, source, source_detail, utm_source, utm_medium, utm_campaign,
  first_name, last_name, email, phone, address, lot_address,
  project_type, budget_range_low, budget_range_high, timeline,
  lot_status, financing_status, score, stage_id, assigned_to,
  preconstruction_type (design_build|plan_bid_build),
  expected_contract_value, probability_pct, status (active|won|lost|archived),
  lost_reason, lost_competitor, won_project_id,
  created_at, updated_at

pipeline_stages
  id, builder_id, name, sequence_order, probability_default,
  required_fields, gate_conditions, color, is_active

lead_scoring_criteria
  id, builder_id, criterion_name, field_name, value_map,
  weight, is_active

lead_activities
  id, lead_id, activity_type (call|email|meeting|site_visit|note),
  subject, description, performed_by, activity_date, duration_minutes,
  created_at

lead_nurturing_sequences
  id, builder_id, name, trigger_type, trigger_value,
  is_active, created_at

nurturing_steps
  id, sequence_id, step_number, delay_days, action_type (email|task),
  email_template_id, task_template, subject

lead_consultations
  id, lead_id, scheduled_date, location, attendees,
  pre_checklist_complete, notes, outcome, action_items, created_at

lot_evaluations
  id, lead_id, lot_address, soil_report_status, survey_status,
  flood_zone, setbacks, utility_availability, hoa_restrictions,
  environmental_concerns, overall_status, notes, created_at

precon_agreements
  id, lead_id, builder_id, agreement_type (flat_fee|hourly|monthly),
  fee_amount, scope_description, start_date, end_date, status,
  signed_date, document_url, created_at

scope_iterations
  id, lead_id, version_number, description, estimate_id,
  presented_date, client_feedback, status, created_at

lead_source_costs
  id, builder_id, source, period_start, period_end,
  spend_amount, notes, created_at

networking_events
  id, builder_id, event_name, event_type, event_date, location,
  contacts_made, notes, follow_up_tasks, lead_ids_generated, created_at

watched_lots
  id, builder_id, lot_address, criteria_match, price, zoning,
  lot_size, topography, status (available|under_contract|sold|off_market),
  alert_active, notes, created_at

competitor_profiles
  id, builder_id, name, market_area, project_types, price_range,
  reputation_notes, strengths, weaknesses, created_at, updated_at

competitive_intel_log
  id, builder_id, competitor_id, entry_date, intel_type,
  description, source, created_at

dream_boards
  id, lead_id, title, images, must_have_features, lifestyle_needs,
  design_preferences, notes, created_at, updated_at

design_team_members
  id, lead_id, role (architect|engineer|interior_designer|landscape_architect|other),
  contact_id, contract_status, fee_structure, deliverable_deadlines, notes

design_milestones
  id, lead_id, milestone_name, sequence_order, planned_date, actual_date,
  client_approved, client_approved_date, notes, status

design_meetings
  id, lead_id, scheduled_date, location, attendees, agenda,
  minutes, decisions, action_items, created_at

geotech_reports
  id, lot_evaluation_id, status (ordered|received|reviewed),
  surveyor_contact, soil_type, foundation_recommendation,
  cost_implications, document_url, created_at

surveys
  id, lot_evaluation_id, survey_type (boundary|topographic|tree|elevation),
  surveyor_contact, ordered_date, received_date,
  findings_summary, document_url, created_at

environmental_assessments
  id, lot_evaluation_id, assessment_type, status,
  findings, mitigation_requirements, permit_status,
  document_url, created_at

hoa_submissions
  id, lead_id, lot_evaluation_id, hoa_name, requirements,
  submission_date, review_period_end, approval_status,
  conditions, modifications_required, document_url, created_at

utility_coordination
  id, lot_evaluation_id, utility_type (water|sewer|electric|gas|cable),
  provider_name, provider_contact, application_status,
  connection_fee, estimated_timeline, notes, created_at

design_conflicts
  id, lead_id, conflict_description, disciplines_involved,
  assigned_to, resolution, resolved_date, linked_design_revision,
  status (open|in_progress|resolved), created_at

estimator_leads
  id, lead_id, session_id, created_at,
  sqft, finish_level (builder|standard|premium|luxury),
  home_style, bedrooms, bathrooms,
  estimate_low, estimate_high,
  cost_breakdown (jsonb), -- category-level breakdown
  budget_realism_score, -- AI-calculated realism score
  ip_address, user_agent, referrer

estimator_accuracy_tracking
  id, lead_id, estimator_lead_id, estimate_id,
  estimator_low, estimator_high,
  detailed_estimate_total, variance_pct,
  variance_by_category (jsonb),
  created_at
```

---

## API Endpoints

```
GET    /api/v2/leads                              # List leads (filter by stage, source, assigned_to, score)
POST   /api/v2/leads                              # Create lead
GET    /api/v2/leads/:id                          # Lead detail with full history
PATCH  /api/v2/leads/:id                          # Update lead
POST   /api/v2/leads/:id/advance                  # Advance to next stage
POST   /api/v2/leads/:id/convert                  # Convert to project (won)
POST   /api/v2/leads/:id/lose                     # Mark as lost with reason
DELETE /api/v2/leads/:id                          # Archive lead

GET    /api/v2/leads/:id/activities               # Activity history for lead
POST   /api/v2/leads/:id/activities               # Log activity

GET    /api/v2/leads/:id/consultations            # Consultations for lead
POST   /api/v2/leads/:id/consultations            # Schedule consultation

GET    /api/v2/leads/:id/lot-evaluation           # Lot evaluation for lead
PUT    /api/v2/leads/:id/lot-evaluation           # Update lot evaluation

GET    /api/v2/leads/:id/scope-iterations         # Scope versions
POST   /api/v2/leads/:id/scope-iterations         # Create new scope version

GET    /api/v2/pipeline/stages                    # Pipeline stage configuration
PUT    /api/v2/pipeline/stages                    # Update pipeline stages
GET    /api/v2/pipeline/analytics                 # Pipeline analytics (velocity, conversion, leakage)
GET    /api/v2/pipeline/kanban                    # Kanban board data

GET    /api/v2/leads/scoring/criteria             # Scoring criteria config
PUT    /api/v2/leads/scoring/criteria             # Update scoring criteria

GET    /api/v2/leads/sources/roi                  # Lead source ROI report
GET    /api/v2/leads/analytics/win-loss           # Win/loss analysis
GET    /api/v2/leads/analytics/conversion         # Conversion funnel metrics

POST   /api/v2/leads/nurturing/sequences          # Create nurturing sequence
GET    /api/v2/leads/nurturing/sequences          # List sequences

GET    /api/v2/networking-events                   # List networking events
POST   /api/v2/networking-events                   # Log networking event
GET    /api/v2/watched-lots                        # List watched lots
POST   /api/v2/watched-lots                        # Add lot to watch list
PATCH  /api/v2/watched-lots/:id                    # Update watched lot status
GET    /api/v2/competitors                         # List competitor profiles
POST   /api/v2/competitors                         # Create competitor profile
POST   /api/v2/competitors/:id/intel               # Log competitive intelligence entry

GET    /api/v2/leads/:id/dream-board               # Get dream board for lead
PUT    /api/v2/leads/:id/dream-board               # Update dream board
GET    /api/v2/leads/:id/design-team               # Design team roster for lead
POST   /api/v2/leads/:id/design-team               # Add design team member
GET    /api/v2/leads/:id/design-milestones         # Design milestones for lead
POST   /api/v2/leads/:id/design-milestones         # Create design milestone
PATCH  /api/v2/leads/:id/design-milestones/:mid    # Update milestone (approve, complete)
GET    /api/v2/leads/:id/design-meetings           # Design meetings for lead
POST   /api/v2/leads/:id/design-meetings           # Schedule design meeting
GET    /api/v2/leads/:id/design-conflicts          # Design conflicts for lead
POST   /api/v2/leads/:id/design-conflicts          # Log design conflict
PATCH  /api/v2/leads/:id/design-conflicts/:cid     # Resolve design conflict
GET    /api/v2/leads/:id/feasibility               # Quick feasibility estimate
POST   /api/v2/leads/:id/feasibility               # Generate feasibility estimate

# Public Estimator Integration
POST   /api/v2/public/estimator/submit             # Submit estimator with contact info (creates lead)
GET    /api/v2/leads/:id/estimator-sessions        # Get estimator session history for lead
GET    /api/v2/leads/:id/estimator-comparison      # Compare estimator to formal estimate
GET    /api/v2/analytics/estimator-accuracy        # Estimator accuracy report by category/finish level
POST   /api/v2/leads/:id/estimator-calibration     # Trigger calibration update for Price Intelligence
```

---

## Dependencies

| Module | Relationship |
|--------|-------------|
| Module 3: Core Data Model | Project creation on conversion |
| Module 10: Contact/Vendor Management | Contact records shared with vendor/client management |
| Module 20: Estimating Engine | Proposal generation from scope iterations |
| Module 38: Contracts & E-Sign | Contract generation on deal close |
| Module 5: Notification Engine | Follow-up reminders, nurturing email delivery |
| Module 37: Marketing & Portfolio | Lead capture form integration, source tracking |
| Module 7: Scheduling | Consultation calendar integration |
| Module 45: Price Intelligence | Public estimator integration, estimate accuracy calibration, budget realism scoring |

---

## Open Questions

1. Should the platform's native CRM fully replace HubSpot/Salesforce, or always position as "construction CRM" with integration to general CRM?
2. How do we handle leads shared between builder divisions? (Luxury brand vs. production brand)
3. Should nurturing email delivery use the platform's own email infrastructure, or integrate with SendGrid/Mailgun?
4. How do we handle TCPA compliance for SMS-based lead follow-up?
5. Should the kanban board support custom card fields, or is a fixed card layout sufficient?
6. How deep should the preconstruction billing feature go? Simple invoicing, or full accounting integration?
