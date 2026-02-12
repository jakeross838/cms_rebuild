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

---

## Detailed Requirements

### Lead Capture
- Web form integration: embeddable form for builder's website with configurable fields
- Manual lead entry for phone/walk-in/referral inquiries
- Email parsing: forward inquiry emails to a system address, auto-create lead record
- Third-party source import: Houzz, Zillow, Angi, social media DMs (via integration or manual)
- UTM parameter capture for digital marketing attribution
- Auto-acknowledge: configurable auto-response email/SMS to new leads
- Lead deduplication: check name, email, phone, address at entry; prompt for merge if match found
- Lead assignment: auto-route to PM based on configurable rules or manual assignment

### Lead Scoring & Qualification
- Weighted scoring model with builder-defined criteria:
  - Budget range (realistic for what they want?)
  - Lot status (owned, under contract, looking)
  - Timeline (ready to start, 6+ months out, just exploring)
  - Financing (pre-approved, cash, needs to sell existing home)
  - Project type (new build, major renovation, addition)
  - Referral source (referred by past client scores higher)
  - Engagement level (responded to follow-up, attended consultation)
- Score thresholds: hot / warm / cold (configurable per builder)
- Auto-stage advancement when score crosses threshold
- Score recalculation on data changes or engagement events

### Pipeline Management
- Builder-defined pipeline stages (default: Lead -> Qualified -> Consultation -> Proposal -> Negotiation -> Won/Lost)
- Kanban board view with drag-and-drop stage transitions
- List view with sortable columns and saved filters
- Stage gates: required fields or actions before advancing (e.g., must have budget range before moving to Consultation)
- Pipeline value tracking: expected contract value x probability at each stage
- Pipeline velocity: average days in each stage, overall cycle time
- Stale lead alerts: lead has not advanced stages in configurable number of days

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
- Design meeting tracker: date, attendees, decisions made, action items
- Decision log: key decisions during preconstruction with date and who approved

### Preconstruction Workflows
- Design-build track: architect selection, design milestones, design review cycles
- Plan-bid-build track: plan receipt, plan review, bid preparation
- Pre-construction agreement management: scope, fee, billing terms, milestones
- Pre-con billing: generate invoices for preconstruction services
- Lot evaluation checklist: soil report, survey, flood zone, setbacks, utilities, HOA restrictions
- Feasibility analysis: preliminary budget range, go/no-go recommendation
- Scope iterations: V1/V2/V3 estimate versions linked to pipeline progression

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

---

## Open Questions

1. Should the platform's native CRM fully replace HubSpot/Salesforce, or always position as "construction CRM" with integration to general CRM?
2. How do we handle leads shared between builder divisions? (Luxury brand vs. production brand)
3. Should nurturing email delivery use the platform's own email infrastructure, or integrate with SendGrid/Mailgun?
4. How do we handle TCPA compliance for SMS-based lead follow-up?
5. Should the kanban board support custom card fields, or is a fixed card layout sufficient?
6. How deep should the preconstruction billing feature go? Simple invoicing, or full accounting integration?
