# Module 49: Platform Analytics & Admin Dashboard

**Phase:** 6 - Scale & Sell
**Status:** SPEC COMPLETE
**Covers Gap Items:** 170-195 (Section 7: Platform Administration & Operations), 591-598 (Section 43: Disaster Recovery & Business Continuity)

---

## Overview

Platform Analytics is the internal command center for the SaaS operator (the platform team). It provides real-time visibility into system health, tenant activity, revenue metrics, feature adoption, churn prediction, deployment management, incident response, and disaster recovery readiness. This module is NOT visible to builder tenants -- it is exclusively for platform administrators and operators. It answers the question: "Is our SaaS business healthy, and where should we focus next?"

---

## Gap Items Addressed

### Platform Administration & Operations (Section 7)

| Gap # | Description | How Addressed |
|-------|-------------|---------------|
| 170 | Monitor platform health (uptime, response times, errors, DB performance) | Real-time ops dashboard: uptime %, p50/p95/p99 latency, error rate, DB connection pool |
| 171 | Deployment strategy (CI/CD, staging, feature flags, canary, rollback) | Deployment tracker: release history, feature flag management, rollback triggers |
| 172 | Platform updates affecting customer workflows | Release management: changelog, customer notification, backwards compatibility checks |
| 173 | API versioning (don't break integrations) | API version dashboard: usage by version, deprecation timeline, breaking change alerts |
| 174 | Database migrations without downtime | Migration tracker: schema change history, zero-downtime migration status, rollback plan |
| 175 | Incident response (platform down at 2am) | Incident management: PagerDuty integration, war room, status page updates, post-mortem log |
| 176 | Customer bugs vs. feature requests triage | Issue triage dashboard: categorize, prioritize, assign, communicate status |
| 177 | Usage analytics for product decisions | Feature usage heatmaps: which features used most, where users drop off, session recordings |
| 178 | A/B testing of new features | A/B test framework: define variants, assign cohorts, measure outcomes, declare winner |
| 179 | Release cadence | Release calendar: scheduled releases, hotfix tracking, per-tier rollout schedule |
| 180 | Beta features (opt-in early adopters) | Beta program management: opt-in list, feature flags, feedback collection, graduation criteria |
| 181 | Status page for system health | Public status page: current status by service, incident history, scheduled maintenance |
| 182 | Scheduled maintenance windows | Maintenance scheduler: set window, notify affected tenants, auto-banner in app |
| 183 | Auto-scaling during peak usage | Auto-scaling metrics: current load, scaling events, capacity headroom, cost impact |
| 184 | Database performance as data grows | DB performance dashboard: table sizes, slow queries, index usage, partition health |
| 185 | Data archiving strategy | Archive dashboard: archive-eligible data by tenant, archive job status, retrieval queue |

### Platform Analytics (Section 7 continued)

| Gap # | Description | How Addressed |
|-------|-------------|---------------|
| 186 | Feature adoption across customers | Feature adoption matrix: % of tenants using each feature, adoption trend over time |
| 187 | Usage patterns by role | Role-based usage: which features each role uses, session duration, action frequency |
| 188 | Identify power users | Power user identification: top 10% by activity, behavior patterns for product learning |
| 189 | Track "aha moment" (action correlated with retention) | Activation analysis: correlate early actions with 90-day retention to identify key moments |
| 190 | Platform performance per tenant | Per-tenant performance: API latency, query time, storage usage, resource consumption |
| 191 | Revenue analytics (MRR, ARR, churn, expansion, LTV:CAC) | Revenue dashboard: real-time MRR/ARR, churn rate, expansion MRR, LTV, CAC by channel |
| 192 | Customer acquisition cost by channel | CAC tracking: marketing spend by channel, signups by channel, conversion rates, cost per acquisition |
| 193 | Cohort analysis (Q1 vs. Q3 retention) | Cohort retention charts: signup cohort vs. retention at 30/60/90/180/365 days |
| 194 | NPS and customer satisfaction tracking | NPS dashboard: score over time, by plan tier, by company size, verbatim analysis |
| 195 | Competitive intelligence | Win/loss tracking: why customers choose us, why they leave, competitor mentions |

### Disaster Recovery & Business Continuity (Section 43)

| Gap # | Description | How Addressed |
|-------|-------------|---------------|
| 591 | RPO (Recovery Point Objective) -- target <1 hour data loss | Backup monitoring: last backup time, backup lag, RPO compliance status |
| 592 | RTO (Recovery Time Objective) -- target <1 hour downtime | Recovery readiness: last DR test result, estimated recovery time, failover status |
| 593 | Geographic redundancy (failover to another region) | Multi-region status: primary/secondary region health, replication lag, failover triggers |
| 594 | Disaster recovery testing (quarterly drills) | DR test calendar: scheduled drills, results history, time-to-recovery measurements |
| 595 | Communication during outages | Incident communication: status page auto-updates, email templates, in-app banner triggers |
| 596 | Data export if platform company fails | Escrow dashboard: latest full export timestamp, export verification, escrow provider status |
| 597 | Platform rollback (bad release revert) | Rollback manager: one-click rollback to previous release, rollback verification checks |
| 598 | Incremental vs. full backups | Backup strategy dashboard: full backup schedule, incremental frequency, storage cost, restore test |

---

## Detailed Requirements

### Ops Dashboard (Real-Time)

**System Health Panel:**
- Uptime percentage (current month, trailing 12 months)
- API response time: p50, p95, p99 (5-minute rolling)
- Error rate: 4xx and 5xx per minute
- Active WebSocket / SSE connections
- Background job queue depth and processing rate

**Infrastructure Panel:**
- CPU, memory, disk utilization per service
- Database connection pool: active, idle, waiting
- Cache hit rate (Redis)
- CDN bandwidth and cache hit ratio
- Auto-scaling event log and current instance count

**Alert Panel:**
- Active alerts with severity (critical, warning, info)
- Alert history with resolution timestamps
- PagerDuty integration status
- On-call schedule and current responder

### Tenant Health Dashboard

**Per-Tenant Metrics:**
- Health score (composite: activity, support tickets, payment status, feature adoption)
- Last login (any user)
- Active users / total users ratio
- Projects active / total
- Storage consumption vs. plan limit
- API usage vs. rate limit
- Payment status: current, past due, suspended

**Tenant List Views:**
- All tenants sorted by health score (lowest first = needs attention)
- At-risk tenants: health score below threshold
- New tenants: signed up in last 30 days (onboarding monitoring)
- High-value tenants: Enterprise and Business tier

**Tenant Actions (Admin):**
- View as tenant (impersonation with audit log)
- Extend trial
- Adjust plan/pricing
- Send targeted communication
- Flag for CS outreach
- Export tenant data
- Suspend / reactivate account

### Revenue Analytics

- **MRR/ARR**: Real-time monthly and annual recurring revenue
- **MRR Breakdown**: New MRR, expansion MRR, contraction MRR, churned MRR
- **Churn**: Gross churn rate, net churn rate, by plan tier, by company size
- **LTV**: Average customer lifetime value, by cohort, by plan tier
- **CAC**: Customer acquisition cost by channel (organic, paid, referral, partner)
- **LTV:CAC Ratio**: Target >3:1
- **Revenue by Plan**: Distribution across tiers
- **Expansion Revenue**: Upgrades, add-ons, usage overage

### Edge Cases & What-If Scenarios

1. **Inaccurate analytics data leading to bad business decisions.** Platform analytics drive critical business decisions (pricing changes, feature investments, support staffing, churn interventions). If the underlying data is inaccurate -- due to tracking bugs, miscounted events, duplicated records, or missing data from certain tenants -- the resulting decisions could be harmful. The system must implement data quality validation: automated consistency checks between analytics data and source-of-truth tables (e.g., MRR calculated from analytics must match MRR calculated from Stripe), anomaly detection on analytics metrics themselves (alert when a metric changes by more than 2 standard deviations without a known cause), and a data quality dashboard that shows completeness, freshness, and consistency scores for each major metric. All analytics dashboards must display the data freshness timestamp and any known data quality issues.

2. **Churn prediction and proactive alerts.** When a tenant's usage patterns indicate they are at risk of churning (declining login frequency, decreasing feature usage, increasing support tickets, payment failures, approaching contract end date without renewal signals), the system must proactively alert the customer success team. A churn risk model must combine multiple signals: engagement score trend (declining over 30 days), support ticket sentiment, payment history, feature adoption breadth, and time-since-last-login. At-risk tenants must be surfaced in a priority queue for the CS team with a risk score, key contributing factors, and recommended intervention actions (e.g., "Schedule a check-in call," "Offer a training session," "Share a relevant case study"). The churn prediction model must be evaluated quarterly against actual churn data to measure and improve its accuracy.

3. **Usage data driving product development priorities.** The platform analytics data is a powerful input for product development decisions, but only if it is systematically translated into actionable insights. The system must support: feature usage correlation with retention (which features are most strongly associated with long-term retention?), feature usage by plan tier (which features drive upgrades?), drop-off analysis (where do users abandon a workflow?), and search/help query analysis (what are users looking for that they cannot find?). These insights must be surfaced in a "Product Intelligence" dashboard accessible to the product team, with the ability to export data for deeper analysis. Feature usage data should be automatically cross-referenced with the feature request portal (Module 46) to validate whether requested features are actually used after shipping.

### Deployment & Release Management (Gap #171, #172, #173, #174, #179)

**CI/CD Pipeline Requirements:**
1. All code changes must pass automated tests (unit, integration, acceptance, e2e) before deployment to any environment.
2. Deployment pipeline: feature branch -> staging -> canary (5% traffic) -> gradual rollout (25%, 50%, 100%) -> complete.
3. Rollback capability: any release can be rolled back to the previous version within 5 minutes via a single admin action. Rollback triggers automatic notification to all on-call personnel.
4. Feature flags: every new feature must be deployable behind a feature flag that can be toggled per tenant or globally without a code deployment.

**Change Management for Customer-Facing Updates (Gap #172):**
1. All releases that change customer-visible behavior must include: a changelog entry with plain-language description, a "What's New" announcement (Module 47), and advance notification for breaking changes (minimum 30 days for deprecations).
2. Breaking changes to existing workflows must provide a backwards-compatible transition period of at least 2 billing cycles.
3. Release notes must be published to the status page and emailed to account owners.

**API Versioning (Gap #173):**
1. API uses URL-based versioning (`/api/v1/`, `/api/v2/`). New versions are introduced when breaking changes are required.
2. Each API version has a minimum 12-month support window after the next version is released.
3. Deprecation notices must appear in API response headers (`Deprecation`, `Sunset`) for deprecated endpoints.
4. API usage by version is tracked so the team knows when it is safe to sunset an old version (zero active consumers).

**Zero-Downtime Database Migrations (Gap #174):**
1. Schema changes must be backwards-compatible with the currently running application version (expand-contract pattern).
2. Migrations run in three phases: expand (add new columns/tables, non-breaking), migrate data (background job), contract (remove old columns after all app servers are on new version).
3. Each migration is tested against a production data snapshot in staging before execution.
4. Migration rollback scripts must exist for every migration and be tested before the forward migration runs.

**Release Cadence (Gap #179):**
1. Standard releases: bi-weekly (every two weeks) on Tuesday.
2. Hotfixes: deployed as needed within 4 hours for P1 issues, same-day for P2.
3. Enterprise customers may opt into a "stable" release channel that receives updates monthly with consolidated changes.

**Beta Feature Management (Gap #180):**
1. Beta features are gated behind feature flags and only visible to opted-in tenants.
2. Opt-in: tenants can enable beta features via Settings > Beta Program (requires admin role).
3. Beta feedback is collected via a dedicated in-app feedback widget attached to each beta feature.
4. Beta graduation criteria: 30+ days in beta, >80% positive feedback, <5 open bugs, performance benchmarks met.
5. Tenants are notified when a beta feature graduates to general availability.

**Status Page & Maintenance (Gap #181, #182):**
1. A public status page displays current status for each service component (API, Database, File Storage, Auth, Email, Webhooks) with real-time incident updates.
2. The status page must be hosted on infrastructure independent from the main platform to remain available during outages.
3. Scheduled maintenance windows must be announced at least 72 hours in advance via status page, email to account owners, and in-app banner.
4. Maintenance windows default to Sunday 2-6am ET. Enterprise customers with 24/7 SLA requirements can negotiate alternate windows.

**Auto-Scaling & Performance (Gap #183, #184):**
1. Application servers auto-scale based on CPU utilization (target: 60%) and request queue depth.
2. Database read replicas scale based on query latency and connection count.
3. Peak usage periods (Monday morning, end-of-month) must be handled without degradation — capacity headroom of at least 2x average load.
4. Database performance monitoring must track: table sizes (alert at 100M+ rows), slow queries (>1s), index usage rates, and connection pool utilization.

**Data Archiving (Gap #185):**
1. Completed project data older than a configurable threshold (default: 2 years) is eligible for archiving.
2. Archived data is moved to cold storage (cheaper tier) but remains queryable via an async retrieval mechanism (results available within 5 minutes).
3. Archive eligibility is determined per-project, not per-tenant. Active projects are never archived regardless of age.
4. Archived data counts against a reduced storage quota (archived storage is not billed at the same rate as active storage).
5. Tenants can restore archived projects to active storage on demand.

### Feature Adoption Analytics

- Feature usage matrix: rows = features, columns = % of tenants using
- Feature activation funnel: discovered -> tried -> adopted -> power user
- Time-to-first-use per feature (from signup)
- Feature correlation with retention ("builders who use scheduling are 3x more likely to retain")
- Feature usage by plan tier (identify upsell opportunities)

### Role-Based Usage Analytics (Gap #187, #188)

1. The system must track feature usage segmented by user role (owner, admin, PM, superintendent, office, field, read-only, vendor, client) to understand how different roles interact with the platform.
2. Role-based usage reports must show: top features per role, average session duration per role, most common workflows per role, and adoption gaps (features available to a role but unused).
3. Power user identification (Gap #188): The system must identify the top 10% most active users across the platform by action frequency, feature breadth, and session engagement. Power user behavior patterns must be analyzed to inform product design (what workflows do power users create that casual users do not?).
4. Power user insights must be available in the Product Intelligence dashboard and exportable for deeper analysis.

### Activation & Retention Analysis (Gap #189)

1. The system must correlate early user actions (first 7 days) with 90-day retention to identify the "aha moment" — the specific action or combination of actions most strongly associated with long-term retention.
2. Activation analysis must track: which features were used in the first session, first day, first week; which onboarding steps were completed; and which milestones were reached.
3. The aha moment definition must be reviewed quarterly as the product evolves, and the onboarding wizard (Module 41) must be updated to route users toward the current highest-correlation actions.
4. Retention cohorts must be segmentable by: signup month, plan tier, company size, construction type, and acquisition channel.

### Revenue & Business Analytics (Gap #191, #192, #193, #194, #195)

1. **Revenue analytics (Gap #191):** The revenue dashboard must display real-time MRR, ARR, net new MRR (new + expansion - contraction - churn), gross and net churn rates, average revenue per account (ARPA), and LTV:CAC ratio. All metrics must be filterable by plan tier, company size, and time period.
2. **Customer acquisition cost (Gap #192):** CAC must be tracked by channel: organic search, paid search, social media, referral program, partner channel, content marketing, and outbound sales. Each new signup must be attributed to a channel. Marketing spend per channel is manually input monthly.
3. **Cohort analysis (Gap #193):** Cohort retention charts must show retention rates at 30, 60, 90, 180, and 365 days for each monthly signup cohort. Cohorts must be comparable side-by-side to identify trends (e.g., "Q3 cohort retains 10% better than Q1 — what changed?").
4. **NPS tracking (Gap #194):** NPS scores must be tracked over time, segmented by plan tier, company size, and months-since-signup. NPS verbatim comments must be categorized and linked to actionable themes. NPS surveys are triggered quarterly and post-support-ticket (Module 46).
5. **Competitive intelligence (Gap #195):** Win/loss tracking must capture: why customers chose us (during onboarding survey), why customers left (during cancellation exit survey), and competitor mentions in support tickets and feature requests. A quarterly competitive intelligence report must be generated summarizing trends.

### A/B Testing Framework

- Define experiment: name, hypothesis, variants, success metric
- Assign tenants to cohorts (random, by attribute, manual)
- Track metric per cohort over experiment duration
- Statistical significance calculation
- Declare winner and auto-roll out (with feature flag)
- Experiment history and learnings database

### Disaster Recovery Dashboard

- **Backup Status**: Last full backup, last incremental, backup size, backup verification status
- **RPO Compliance**: Current replication lag vs. target RPO
- **RTO Readiness**: Last DR test date, measured recovery time, target RTO
- **Multi-Region**: Primary and secondary region health, replication status, failover tested date
- **Rollback**: Current release version, previous version, rollback estimated time, rollback tested date
- **Data Escrow**: Last escrow export date, export verification, escrow provider contact

---

## Database Tables

```
platform_metrics_snapshots
  id              UUID PK
  metric_type     VARCHAR(50)  -- 'api_latency', 'error_rate', 'active_users', 'mrr'
  metric_value    DECIMAL(15,4)
  dimensions      JSONB  -- {region: 'us-east', service: 'api', percentile: 'p95'}
  captured_at     TIMESTAMPTZ
  -- partitioned by captured_at (daily partitions, 90-day retention for raw, rollup for historical)

tenant_health_scores
  id              UUID PK
  builder_id      UUID FK -> builders
  health_score    INT  -- 0-100
  score_components JSONB  -- {activity: 80, payment: 100, adoption: 60, support: 70}
  risk_level      VARCHAR(10)  -- 'healthy', 'watch', 'at_risk', 'critical'
  calculated_at   TIMESTAMPTZ

feature_usage_events
  id              UUID PK
  builder_id      UUID FK -> builders
  user_id         UUID FK -> users
  feature_key     VARCHAR(100)  -- 'scheduling.create_task', 'invoicing.send_invoice'
  event_type      VARCHAR(20)  -- 'page_view', 'action', 'api_call'
  metadata        JSONB
  created_at      TIMESTAMPTZ
  -- high-volume table; partitioned by created_at, archived after 12 months

ab_experiments
  id              UUID PK
  name            VARCHAR(200)
  hypothesis      TEXT
  variants        JSONB  -- [{name: 'control', weight: 50}, {name: 'variant_a', weight: 50}]
  success_metric  VARCHAR(100)
  status          VARCHAR(20)  -- 'draft', 'running', 'concluded'
  started_at      TIMESTAMPTZ NULL
  concluded_at    TIMESTAMPTZ NULL
  winner_variant  VARCHAR(50) NULL
  created_at      TIMESTAMPTZ

ab_experiment_assignments
  id              UUID PK
  experiment_id   UUID FK -> ab_experiments
  builder_id      UUID FK -> builders
  variant         VARCHAR(50)
  assigned_at     TIMESTAMPTZ

incidents
  id              UUID PK
  title           VARCHAR(300)
  severity        VARCHAR(10)  -- 'critical', 'major', 'minor'
  status          VARCHAR(20)  -- 'investigating', 'identified', 'monitoring', 'resolved'
  affected_services TEXT[]
  started_at      TIMESTAMPTZ
  resolved_at     TIMESTAMPTZ NULL
  postmortem_url  TEXT NULL
  status_page_updates JSONB  -- [{timestamp, message}]
  created_at      TIMESTAMPTZ

deployment_releases
  id              UUID PK
  version         VARCHAR(20)
  release_type    VARCHAR(20)  -- 'major', 'minor', 'patch', 'hotfix'
  changelog       TEXT
  deployed_at     TIMESTAMPTZ
  deployed_by     UUID FK -> users
  rollback_to     UUID NULL FK -> deployment_releases
  rolled_back_at  TIMESTAMPTZ NULL
  feature_flags   JSONB  -- flags toggled in this release

dr_test_results
  id              UUID PK
  test_type       VARCHAR(30)  -- 'full_failover', 'backup_restore', 'partial_recovery'
  tested_at       TIMESTAMPTZ
  recovery_time_min INT  -- actual measured recovery time
  rpo_achieved_min  INT  -- actual measured data loss window
  result          VARCHAR(10)  -- 'pass', 'fail', 'partial'
  notes           TEXT
  next_test_due   DATE

backup_status
  id              UUID PK
  backup_type     VARCHAR(20)  -- 'full', 'incremental', 'wal_archive'
  started_at      TIMESTAMPTZ
  completed_at    TIMESTAMPTZ NULL
  size_bytes      BIGINT
  location        VARCHAR(50)  -- 'us-east-1', 'us-west-2'
  verified        BOOLEAN DEFAULT false
  verified_at     TIMESTAMPTZ NULL
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/dashboard/health` | System health overview |
| GET | `/api/v1/admin/dashboard/metrics` | Metrics time-series (filterable by type, range) |
| GET | `/api/v1/admin/tenants` | List all tenants with health scores |
| GET | `/api/v1/admin/tenants/:id` | Detailed tenant view |
| POST | `/api/v1/admin/tenants/:id/impersonate` | Impersonate tenant (audit logged) |
| GET | `/api/v1/admin/revenue` | Revenue dashboard (MRR, ARR, churn, LTV, CAC) |
| GET | `/api/v1/admin/revenue/cohorts` | Cohort retention analysis |
| GET | `/api/v1/admin/features/adoption` | Feature adoption matrix |
| GET | `/api/v1/admin/features/usage/:featureKey` | Feature usage details |
| GET | `/api/v1/admin/experiments` | List A/B experiments |
| POST | `/api/v1/admin/experiments` | Create experiment |
| PUT | `/api/v1/admin/experiments/:id` | Update experiment (start, conclude) |
| GET | `/api/v1/admin/incidents` | List incidents |
| POST | `/api/v1/admin/incidents` | Create incident |
| PUT | `/api/v1/admin/incidents/:id` | Update incident status |
| GET | `/api/v1/admin/releases` | List deployments |
| POST | `/api/v1/admin/releases/:id/rollback` | Trigger rollback |
| GET | `/api/v1/admin/dr/status` | Disaster recovery dashboard |
| GET | `/api/v1/admin/dr/backups` | Backup status and history |
| GET | `/api/v1/admin/dr/tests` | DR test results |
| POST | `/api/v1/admin/dr/tests` | Log a DR test result |
| GET | `/api/v1/admin/nps` | NPS scores and trends |
| GET | `/api/v1/status` | Public: system status page data |

---

## Dependencies

- **Module 1: Auth & Access** -- platform admin role, tenant impersonation
- **Module 43: Subscription Billing** -- revenue data, plan tier info
- **Module 41: Onboarding Wizard** -- onboarding funnel data
- **Module 46: Customer Support** -- support ticket trends, NPS data
- **Infrastructure**: Prometheus/Grafana or Datadog for metrics collection
- **PagerDuty** -- incident alerting
- **Statuspage.io** (or custom) -- public status page
- **PostHog / Mixpanel** (optional) -- event analytics backend
- **AWS Backup / pg_basebackup** -- backup infrastructure

---

## Open Questions

1. Should we build the analytics pipeline in-house (PostHog self-hosted) or use a SaaS analytics tool (Mixpanel, Amplitude)?
2. What is the data retention policy for feature usage events? (Proposed: 12 months raw, indefinite rollups)
3. Should tenant impersonation require two-person approval for SOC 2 compliance?
4. How do we handle the "admin dashboard performance" problem -- querying analytics tables should not affect production DB?
5. What is the disaster recovery testing cadence -- quarterly or semi-annually?
6. Should the public status page be on a separate infrastructure so it stays up when the main platform is down?
7. How do we balance the desire for detailed analytics with user privacy concerns (GDPR, CCPA)?
