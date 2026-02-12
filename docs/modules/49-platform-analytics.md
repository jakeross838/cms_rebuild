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

### Feature Adoption Analytics

- Feature usage matrix: rows = features, columns = % of tenants using
- Feature activation funnel: discovered -> tried -> adopted -> power user
- Time-to-first-use per feature (from signup)
- Feature correlation with retention ("builders who use scheduling are 3x more likely to retain")
- Feature usage by plan tier (identify upsell opportunities)

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
