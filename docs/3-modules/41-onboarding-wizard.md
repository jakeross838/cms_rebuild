# Module 41: Onboarding Wizard & Setup Assistant

**Phase:** 6 - Scale & Sell
**Status:** SPEC COMPLETE
**Covers Gap Items:** 51-60, 86-95 (Section 2: Onboarding & Customer Success)

---

## Overview

The Onboarding Wizard is the first experience every new builder has with the platform. It must transform an empty account into a functioning workspace in under one hour. The wizard handles company configuration, team invitations, sample data generation, data import kickoff, and progressive feature reveal -- all while measuring time-to-value and triggering customer success interventions when users stall.

---

## Gap Items Addressed

| Gap # | Description | How Addressed |
|-------|-------------|---------------|
| 51 | First login experience -- empty dashboard is overwhelming | Wizard intercepts first login; dashboard hidden until basic setup complete |
| 52 | Time from signup to value -- target under 1 hour | Wizard tracks elapsed time; streamlined critical path of 6 steps |
| 53 | Sample/demo project so customer can explore features | "Create Sample Project" option seeds realistic demo data (project, budget, schedule, vendors) |
| 54 | Minimum data entry before system is useful | Only company name, address, and one project required; everything else can be deferred |
| 55 | Zero historical data vs. 10 years of data to import | Branching path: "Start Fresh" vs. "Import Existing Data" (links to Module 42) |
| 56 | Onboarding flow per user role | Owner sees full wizard; PMs see project-focused setup; field users see mobile-optimized quick start |
| 57 | Interactive tutorial/walkthrough per module | Post-wizard guided tours triggered on first visit to each module section |
| 58 | "I don't have time for setup" customer | Pre-built industry templates + optional concierge setup service (paid add-on) |
| 59 | Wizard started but not finished -- resume/reminders | Wizard state persisted per user; reminder emails at 24h, 72h, 7d if incomplete |
| 60 | Parallel-run with old system during transition | Wizard offers "Running in Parallel?" mode with comparison checklists and dual-entry guidance |
| 86 | Customer health measurement | Onboarding completion rate, time-to-first-project, feature activation tracked as health signals |
| 87 | Customer success intervention triggers | Stalled onboarding (>48h idle), low feature adoption, repeated errors trigger CS alerts |
| 88 | Customer feedback collection | Post-onboarding NPS survey + per-step satisfaction micro-surveys |
| 89 | Feedback loop for product development | Onboarding friction points auto-tagged and routed to product backlog |
| 90 | At-risk churn identification | Incomplete onboarding after 14 days flags account as at-risk |
| 91 | Cancellation process | Wizard includes "Not Ready?" off-ramp with pause option and data export link |
| 92 | Customers outgrowing the platform | Onboarding captures company size/needs; suggests appropriate plan tier |
| 93 | Customer community | Post-onboarding invitation to community forum and user group |
| 94 | Best practices sharing between customers | Wizard offers "Use Industry Best Practice" config presets from anonymized top performers |
| 95 | Case studies from successful customers | Success stories embedded in wizard as social proof at decision points |

---

## Detailed Requirements

### Wizard Steps (Owner Flow)

1. **Welcome & Account Type** -- Company name, size (annual revenue bracket), number of active projects, primary construction type. Determines recommended plan and feature set.
2. **Company Profile** -- Logo upload, address, phone, license numbers, insurance info. Pre-fills from business registration lookup where possible.
3. **Branding & Preferences** -- Color scheme selection, default markup %, retainage %, cost code system (CSI / custom / import). Links to Module 44 for advanced branding.
4. **Team Setup** -- Invite users by email with role assignment. Bulk invite via CSV. "Skip for now" option with reminder.
5. **First Project** -- Create first real project OR generate sample project with demo data. Project creation captures: name, address, client, estimated value, start date.
6. **Integrations** -- QuickBooks connection prompt, accounting sync setup, email integration. "Skip for now" with reminder.
7. **Data Import** (conditional) -- If user selected "Import Existing Data," routes to Module 42 migration wizard. Otherwise skipped.
8. **Completion & Next Steps** -- Checklist of activated features, links to guided tours, training videos, and support resources.

### Progressive Feature Reveal

- New modules appear as "locked" cards with preview descriptions until the user is ready
- Tooltip-based prompts suggest next features based on usage patterns ("You've created 3 projects -- ready to try Scheduling?")
- Feature activation tracked for customer health scoring (Module 49)

### Edge Cases & What-If Scenarios

1. **User stuck in the onboarding wizard.** If a user gets confused, encounters an error, or does not understand what is being asked at a wizard step, the system must provide immediate help without requiring them to leave the wizard. Every wizard step must include a contextual "Need help?" link that opens either a relevant KB article, a short video walkthrough of that specific step, or a live chat prompt (for plans that include chat support). The wizard must also allow skipping any non-critical step with a clear "Skip for now" option and a promise to remind them later. If a user spends more than 5 minutes on a single step without progressing, the system should proactively offer help via a tooltip or chat prompt. Users who are completely stuck can access a "Restart wizard" option that resets to step 1 without losing already-completed data.

2. **Sample data does not accurately reflect the builder's business.** If the pre-loaded sample project data (budget items, schedule tasks, vendor types, cost codes) does not match the builder's construction type or market, it can create a poor first impression and confuse the user. The system must offer sample data sets tailored to the builder's declared construction type (luxury custom, production, remodel, commercial) and company size. When the builder selects "Create Sample Project" in the wizard, the system should ask 2-3 qualifying questions (project type, approximate value, typical duration) to select the most appropriate sample data set. Sample data must be clearly labeled as "SAMPLE" throughout the UI so users never confuse it with real data. The builder must be able to delete all sample data with a single action when ready to go live.

3. **Optimizing for the "aha moment."** The wizard's primary goal is not data collection -- it is getting the user to the "aha moment" as quickly as possible. The aha moment is the point where the user sees real value (e.g., their first project with a budget and schedule visualized, their first client portal shared, or their first invoice processed). The wizard must be instrumented to track which completion paths correlate most strongly with 90-day retention, and the wizard flow should be continuously optimized (via A/B testing in Module 49) to route users toward those high-correlation actions. Steps that do not contribute to the aha moment should be deferred to post-wizard setup. The target is: aha moment reached within 20 minutes of wizard start.

### Success Milestones

- Account Created (0 min)
- Company Profile Complete (target: 5 min)
- First Team Member Invited (target: 10 min)
- First Project Created (target: 20 min)
- First Integration Connected (target: 30 min)
- "Aha Moment" reached -- defined as: first invoice created, first schedule published, or first client portal shared

### Resume & Recovery

- Wizard state saved after each step completion
- Browser close / session timeout does not lose progress
- Email reminders with deep links to resume at last incomplete step
- Admin can view onboarding funnel to see where users drop off

---

## Database Tables

```
onboarding_sessions
  id              UUID PK
  builder_id      UUID FK -> builders
  user_id         UUID FK -> users
  current_step    INT (1-8)
  steps_completed JSONB  -- {step_1: {completed_at, duration_sec, skipped}, ...}
  started_at      TIMESTAMPTZ
  completed_at    TIMESTAMPTZ NULL
  abandoned_at    TIMESTAMPTZ NULL
  wizard_version  VARCHAR(10)  -- tracks which wizard version was used
  metadata        JSONB  -- company size, construction type, plan recommendation

onboarding_milestones
  id              UUID PK
  builder_id      UUID FK -> builders
  milestone_key   VARCHAR(50)  -- 'first_project', 'first_invoice', 'aha_moment'
  reached_at      TIMESTAMPTZ
  days_from_signup INT

onboarding_reminders
  id              UUID PK
  builder_id      UUID FK -> builders
  user_id         UUID FK -> users
  reminder_type   VARCHAR(30)  -- 'stalled_24h', 'stalled_72h', 'stalled_7d'
  sent_at         TIMESTAMPTZ
  clicked_at      TIMESTAMPTZ NULL
  resumed_at      TIMESTAMPTZ NULL

sample_data_sets
  id              UUID PK
  name            VARCHAR(100)
  description     TEXT
  data_payload    JSONB  -- full sample project with budget, schedule, vendors
  construction_type VARCHAR(50)
  is_active       BOOLEAN DEFAULT true
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/onboarding/status` | Get current onboarding state for authenticated user |
| PUT | `/api/v1/onboarding/step/:stepNumber` | Complete or skip a wizard step |
| POST | `/api/v1/onboarding/sample-project` | Generate sample project with demo data |
| POST | `/api/v1/onboarding/resume` | Resume wizard from last incomplete step |
| GET | `/api/v1/onboarding/milestones` | Get milestone completion status |
| POST | `/api/v1/onboarding/feedback` | Submit onboarding micro-survey response |
| GET | `/api/v1/admin/onboarding/funnel` | Platform admin: onboarding funnel analytics |
| GET | `/api/v1/admin/onboarding/stalled` | Platform admin: list stalled onboarding sessions |

---

## Dependencies

- **Module 1: Auth & Access** -- account creation, user roles for role-specific wizard flows
- **Module 2: Configuration Engine** -- settings seeded during wizard (cost codes, markup, terminology)
- **Module 42: Data Migration** -- import path branching from wizard step 7
- **Module 44: White-Label** -- branding setup in wizard step 3
- **Module 5: Notification Engine** -- reminder emails for stalled onboarding
- **Module 49: Platform Analytics** -- onboarding funnel metrics, milestone tracking

---

## Open Questions

1. Should concierge setup be a built-in paid add-on or handled externally via professional services?
2. What is the maximum sample data set size before it impacts tenant provisioning speed?
3. Should the wizard be entirely skippable for power users who want to self-configure?
4. How do we handle onboarding for users added to an already-configured account (not the initial owner)?
5. Should we offer industry-specific wizard variants (luxury custom, production, remodel)?
