# NotebookLM Scale Architecture

## Critical Questions Addressed

1. **Integration Plan** - How does this connect to everything else?
2. **Two-Way Sync** - Does data flow back from NotebookLM to CMS?
3. **Scale** - What happens with 100,000+ users?

---

## 1. Integration Plan

### Current Module Dependencies

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PHASE 0-6: FOUNDATION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐  │
│  │ Module 1 │   │ Module 5 │   │Module 10 │   │Module 15 │   │Module 36 │  │
│  │   Auth   │   │   Jobs   │   │ Invoices │   │Daily Logs│   │  Leads   │  │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘  │
│       │              │              │              │              │         │
│       └──────────────┴──────────────┴──────────────┴──────────────┘         │
│                                     │                                        │
│                                     ▼                                        │
│                          ┌──────────────────┐                               │
│                          │    Module 44     │                               │
│                          │    AI Engine     │                               │
│                          │  (OCR, ML, NLP)  │                               │
│                          └────────┬─────────┘                               │
│                                   │                                          │
└───────────────────────────────────┼──────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                           PHASE 7: INTELLIGENCE                               │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                      Module 99: NotebookLM                           │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │    │
│   │  │  Sync       │  │  Query      │  │  Audio      │  │  Insights   │ │    │
│   │  │  Engine     │  │  Engine     │  │  Engine     │  │  Engine     │ │    │
│   │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │    │
│   │         │                │                │                │        │    │
│   │         └────────────────┴────────────────┴────────────────┘        │    │
│   │                                   │                                  │    │
│   │                                   ▼                                  │    │
│   │                      ┌─────────────────────┐                        │    │
│   │                      │   FEEDBACK LOOP     │ ◄── Two-way sync       │    │
│   │                      │   (Insights → CMS)  │                        │    │
│   │                      └─────────────────────┘                        │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Integration Roadmap

| Phase | Modules | NotebookLM Integration | Timeline |
|-------|---------|----------------------|----------|
| **0** | Auth, Companies, Users | User context for queries | Complete |
| **0** | Jobs, Clients, Vendors | Entity notebooks created | Phase 7.1 |
| **0** | Invoices, POs, Change Orders | Financial data sync | Phase 7.2 |
| **0** | Daily Logs, Photos | Field data sync | Phase 7.2 |
| **1-2** | Tasks, Communications | Communication context | Phase 7.4 |
| **3-4** | RFIs, Submittals, Time | Extended data sync | Phase 7.4 |
| **5-6** | Warranties, Portals | Client-facing AI | Phase 7.5 |
| **7** | NotebookLM Core | Full integration | Phases 7.1-7.6 |

### Data Flow Integration Points

```typescript
// Every module that creates/updates data triggers NotebookLM sync

// Example: When a daily log is created
// Module 15: Daily Logs
async function createDailyLog(data: DailyLogInput) {
  const log = await db.daily_logs.create(data)

  // Trigger NotebookLM sync
  await notebookSync.queueUpdate({
    entity_type: 'job',
    entity_id: log.job_id,
    source_type: 'daily_log',
    source_id: log.id,
    action: 'add'
  })

  return log
}

// This pattern repeats for ALL data-creating operations
```

---

## 2. Two-Way Sync Architecture

### What Flows Each Direction

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                    CMS ──────────────────────► NotebookLM                   │
│                                                                              │
│   • Job data (specs, scope, dates)              • Stored in notebooks       │
│   • Financial records (invoices, POs, COs)      • Indexed for search        │
│   • Field data (logs, photos, punch)            • Available for queries     │
│   • Communications (RFIs, emails)               • Used for audio gen        │
│   • Documents (contracts, plans)                                            │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                    CMS ◄────────────────────── NotebookLM                   │
│                                                                              │
│   • AI Risk Scores                              • Generated from analysis   │
│   • Budget Anomaly Flags                        • Pattern detection         │
│   • Project Health Scores                       • Cross-project learning    │
│   • Vendor Performance Insights                 • Historical comparison     │
│   • Recommended Actions                         • Best practice matching    │
│   • Generated Summaries                         • Cached for dashboard      │
│   • Trend Analysis                              • Time-series patterns      │
│   • Predictive Alerts                           • Risk forecasting          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Insights That Flow Back to CMS

```sql
-- New table for AI-generated insights stored back in CMS
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- What entity this insight is about
  entity_type TEXT NOT NULL,        -- job, client, vendor, company
  entity_id UUID,

  -- The insight
  insight_type TEXT NOT NULL,       -- risk_score, anomaly, recommendation, summary, prediction
  category TEXT,                    -- budget, schedule, quality, safety, financial
  severity TEXT,                    -- info, low, medium, high, critical

  -- Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  details JSONB,                    -- Structured data specific to insight type

  -- Source
  source TEXT DEFAULT 'notebooklm', -- notebooklm, internal_ml, rule_engine
  confidence FLOAT,                 -- 0.0 to 1.0
  supporting_evidence JSONB,        -- Citations, data points

  -- Lifecycle
  status TEXT DEFAULT 'active',     -- active, acknowledged, resolved, dismissed
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,

  -- Scheduling
  refresh_frequency TEXT,           -- daily, weekly, on_change
  last_refreshed_at TIMESTAMPTZ,
  next_refresh_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insight history for trend tracking
CREATE TABLE ai_insight_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id UUID NOT NULL REFERENCES ai_insights(id),

  -- Snapshot
  value JSONB NOT NULL,             -- The insight value at this point
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-computed summaries cached from NotebookLM
CREATE TABLE ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  entity_type TEXT NOT NULL,
  entity_id UUID,

  summary_type TEXT NOT NULL,       -- daily_status, weekly_report, executive_brief
  content TEXT NOT NULL,

  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_stale BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_entity ON ai_insights(entity_type, entity_id);
CREATE INDEX idx_ai_insights_active ON ai_insights(company_id, status) WHERE status = 'active';
CREATE INDEX idx_ai_summaries_entity ON ai_summaries(entity_type, entity_id);
```

### Two-Way Sync Implementation

```typescript
// supabase/functions/notebooklm-insights-sync/index.ts

/**
 * Periodically queries NotebookLM for insights and stores them in CMS
 * Runs every hour via cron
 */

interface InsightRequest {
  notebook_id: string
  insight_types: ('risk' | 'anomaly' | 'recommendation' | 'summary')[]
}

async function generateAndStoreInsights(request: InsightRequest) {
  const nlm = new NotebookLMClient(credentials)
  const supabase = createClient(url, key)

  // Get notebook details
  const { data: notebook } = await supabase
    .from('notebooklm_notebooks')
    .select('*')
    .eq('nlm_notebook_id', request.notebook_id)
    .single()

  // Query NotebookLM for specific insights
  for (const insightType of request.insight_types) {
    const prompt = getInsightPrompt(insightType, notebook.entity_type)

    const response = await nlm.query({
      notebook_id: request.notebook_id,
      query: prompt,
      response_format: 'structured_json'
    })

    // Parse and store the insight
    const insight = parseInsightResponse(response, insightType)

    await supabase.from('ai_insights').upsert({
      company_id: notebook.company_id,
      entity_type: notebook.entity_type,
      entity_id: notebook.entity_id,
      insight_type: insightType,
      title: insight.title,
      description: insight.description,
      details: insight.details,
      confidence: insight.confidence,
      supporting_evidence: insight.sources,
      last_refreshed_at: new Date(),
      next_refresh_at: getNextRefreshTime(insightType)
    }, {
      onConflict: 'company_id,entity_type,entity_id,insight_type'
    })

    // Store in history for trending
    await supabase.from('ai_insight_history').insert({
      insight_id: insight.id,
      value: insight.details
    })
  }
}

// Insight prompts that extract structured data
function getInsightPrompt(type: string, entityType: string): string {
  const prompts = {
    risk: {
      job: `Analyze this project and identify the top 5 risks. For each risk, provide:
        - Risk category (budget, schedule, quality, safety, vendor, documentation)
        - Severity (low, medium, high, critical)
        - Description
        - Likelihood (percentage)
        - Impact if realized
        - Recommended mitigation
        Return as JSON array.`,

      vendor: `Analyze this vendor's history and identify reliability risks:
        - Payment pattern risks
        - Quality concerns from past projects
        - Schedule adherence issues
        - Insurance/compliance gaps
        Return as JSON with risk_score (0-100) and details.`
    },

    anomaly: {
      job: `Identify any anomalies or unusual patterns in this project:
        - Budget line items significantly different from similar projects
        - Schedule variances that don't match stated reasons
        - Invoice patterns that differ from vendor norms
        - Unusual change order frequency or amounts
        Return as JSON array with anomaly_type, description, and confidence.`
    },

    recommendation: {
      job: `Based on this project's data and similar past projects, provide:
        - 3 actionable recommendations to improve outcomes
        - Potential cost savings opportunities
        - Schedule optimization suggestions
        - Quality improvement areas
        Return as JSON array with priority, recommendation, expected_impact.`
    },

    summary: {
      job: `Generate a concise executive summary of this project:
        - Current status (1-2 sentences)
        - Budget position
        - Schedule position
        - Key accomplishments this period
        - Upcoming milestones
        - Items needing attention
        Return as JSON with sections.`
    }
  }

  return prompts[type]?.[entityType] || prompts[type]?.job
}
```

### Dashboard Integration

```tsx
// The insights flow back and appear in the CMS UI

function JobDashboard({ jobId }: { jobId: string }) {
  // Fetch AI insights for this job
  const { data: insights } = useQuery(
    ['ai-insights', jobId],
    () => fetchInsights({ entity_type: 'job', entity_id: jobId })
  )

  // Fetch AI-generated summary
  const { data: summary } = useQuery(
    ['ai-summary', jobId],
    () => fetchSummary({ entity_type: 'job', entity_id: jobId, type: 'daily_status' })
  )

  return (
    <div className="space-y-6">
      {/* AI-Generated Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-stone-600" />
            AI Status Summary
          </CardTitle>
          <CardDescription>
            Auto-generated {formatRelativeTime(summary?.created_at)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-warm-700">{summary?.content}</p>
        </CardContent>
      </Card>

      {/* Risk Insights */}
      {insights?.filter(i => i.insight_type === 'risk' && i.severity !== 'low').length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              AI-Identified Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights
                .filter(i => i.insight_type === 'risk')
                .sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity])
                .map(risk => (
                  <RiskInsightCard key={risk.id} insight={risk} />
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-stone-600" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights
            .filter(i => i.insight_type === 'recommendation')
            .map(rec => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onAcknowledge={() => acknowledgeInsight(rec.id)}
              />
            ))
          }
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 3. Scale Architecture (100,000+ Users)

### The Challenge

| Metric | At 100K Users | Implications |
|--------|---------------|--------------|
| **Notebooks** | 500K+ (5 per user avg) | Storage, sync volume |
| **Documents** | 10M+ | Massive sync queue |
| **Queries/day** | 500K+ | API rate limits, cost |
| **Audio/month** | 100K+ minutes | $10K+ just for audio |
| **Cost** | $2M+/month | Need tiered approach |

### Multi-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SCALE ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   TIER 1: EDGE CACHE (Cloudflare Workers / Vercel Edge)                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  • Query result caching (TTL: 5-60 min based on data freshness)     │   │
│   │  • Audio file CDN delivery                                           │   │
│   │  • Rate limiting at edge                                             │   │
│   │  • Request deduplication                                             │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                        │
│                                     ▼                                        │
│   TIER 2: APPLICATION CACHE (Redis Cluster)                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  • Query results: 15-min cache for identical queries                 │   │
│   │  • Insight cache: 1-hour cache for AI insights                       │   │
│   │  • Summary cache: 4-hour cache for generated summaries               │   │
│   │  • User session context                                              │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                        │
│                                     ▼                                        │
│   TIER 3: SMART ROUTING                                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  • Small queries → Gemini Flash (cheaper, faster)                    │   │
│   │  • Complex queries → NotebookLM (full context)                       │   │
│   │  • Batch queries → Queue for off-peak processing                     │   │
│   │  • Cross-notebook → Aggregate then query                             │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                        │
│                                     ▼                                        │
│   TIER 4: NOTEBOOK FEDERATION                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  • Regional notebook clusters (US, EU, APAC)                         │   │
│   │  • Company isolation (separate GCP projects per enterprise)          │   │
│   │  • Shared knowledge bases (building codes, best practices)           │   │
│   │  • Hot/warm/cold notebook tiers                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Cost Optimization Strategy

```typescript
// Tiered AI access based on subscription level

interface AITier {
  name: string
  monthlyPrice: number
  features: {
    queriesPerMonth: number
    audioMinutesPerMonth: number
    notebooksPerUser: number
    insightRefreshFrequency: string
    supportedQueryTypes: string[]
  }
}

const aiTiers: AITier[] = [
  {
    name: 'Starter',
    monthlyPrice: 0,  // Included in base subscription
    features: {
      queriesPerMonth: 50,
      audioMinutesPerMonth: 0,
      notebooksPerUser: 1,  // Job notebooks only
      insightRefreshFrequency: 'weekly',
      supportedQueryTypes: ['simple_query']
    }
  },
  {
    name: 'Professional',
    monthlyPrice: 29,
    features: {
      queriesPerMonth: 500,
      audioMinutesPerMonth: 30,
      notebooksPerUser: 5,
      insightRefreshFrequency: 'daily',
      supportedQueryTypes: ['simple_query', 'complex_query', 'cross_reference']
    }
  },
  {
    name: 'Enterprise',
    monthlyPrice: 99,
    features: {
      queriesPerMonth: 5000,
      audioMinutesPerMonth: 300,
      notebooksPerUser: 'unlimited',
      insightRefreshFrequency: 'hourly',
      supportedQueryTypes: ['simple_query', 'complex_query', 'cross_reference', 'batch_analysis', 'custom_training']
    }
  }
]

// At scale pricing model
// 100K users at average $30/user/month AI add-on = $3M revenue
// Costs: ~$1.5M (50% margin on AI features)
```

### Query Optimization

```typescript
// Smart query routing to minimize API costs

class QueryRouter {
  async route(query: QueryRequest): Promise<QueryResponse> {
    // 1. Check edge cache
    const edgeCached = await this.edgeCache.get(query.hash)
    if (edgeCached && !query.forceRefresh) {
      return { ...edgeCached, source: 'edge_cache' }
    }

    // 2. Check Redis cache
    const redisCached = await this.redis.get(`query:${query.hash}`)
    if (redisCached && !query.forceRefresh) {
      // Promote to edge cache
      await this.edgeCache.set(query.hash, redisCached, { ttl: 300 })
      return { ...redisCached, source: 'redis_cache' }
    }

    // 3. Classify query complexity
    const complexity = await this.classifyQuery(query)

    // 4. Route based on complexity
    switch (complexity.level) {
      case 'simple':
        // Use Gemini Flash directly (no notebook needed)
        // Cost: ~$0.001 per query
        return this.geminiFlash.query(query, complexity.context)

      case 'moderate':
        // Use cached notebook summary + Gemini Flash
        // Cost: ~$0.005 per query
        const summary = await this.getNotebookSummary(query.notebook_id)
        return this.geminiFlash.queryWithContext(query, summary)

      case 'complex':
        // Full NotebookLM query
        // Cost: ~$0.02 per query
        return this.notebookLM.query(query)

      case 'batch':
        // Queue for batch processing
        await this.batchQueue.add(query)
        return { status: 'queued', estimated_completion: '15 minutes' }
    }
  }

  async classifyQuery(query: QueryRequest): Promise<QueryClassification> {
    // Use a small model to classify query complexity
    const classification = await this.classifier.classify({
      query: query.text,
      signals: {
        word_count: query.text.split(' ').length,
        has_comparison: /compar|versus|vs|between/i.test(query.text),
        has_aggregation: /total|sum|average|all|every/i.test(query.text),
        has_time_range: /last|this|next|week|month|year/i.test(query.text),
        notebook_size: await this.getNotebookSize(query.notebook_id)
      }
    })

    return classification
  }
}
```

### Database Partitioning

```sql
-- Partition large tables by company for isolation and performance

-- Notebooks partitioned by company
CREATE TABLE notebooklm_notebooks (
  id UUID NOT NULL,
  company_id UUID NOT NULL,
  -- ... other columns
  PRIMARY KEY (company_id, id)
) PARTITION BY HASH (company_id);

-- Create 64 partitions for distribution
CREATE TABLE notebooklm_notebooks_p0 PARTITION OF notebooklm_notebooks
  FOR VALUES WITH (MODULUS 64, REMAINDER 0);
-- ... repeat for p1 through p63

-- Queries partitioned by time for efficient cleanup
CREATE TABLE notebooklm_queries (
  id UUID NOT NULL,
  company_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  -- ... other columns
  PRIMARY KEY (created_at, company_id, id)
) PARTITION BY RANGE (created_at);

-- Monthly partitions, auto-created
CREATE TABLE notebooklm_queries_2026_01 PARTITION OF notebooklm_queries
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
-- Automated partition management via pg_partman
```

### Sync Queue at Scale

```typescript
// Distributed sync processing with worker pools

interface SyncWorkerConfig {
  region: 'us' | 'eu' | 'apac'
  concurrency: number
  priorities: {
    realtime: number    // Max concurrent realtime syncs
    standard: number    // Standard priority
    batch: number       // Batch/backfill operations
  }
}

class DistributedSyncProcessor {
  private workers: Map<string, SyncWorker[]> = new Map()

  constructor(configs: SyncWorkerConfig[]) {
    for (const config of configs) {
      this.workers.set(config.region, this.createWorkerPool(config))
    }
  }

  async processQueue() {
    // Pull from region-specific queues
    for (const [region, workers] of this.workers) {
      const queue = await this.getRegionalQueue(region)

      // Distribute work across worker pool
      await Promise.all(
        workers.map(worker => worker.processNext(queue))
      )
    }
  }

  // Backpressure handling
  async handleBackpressure(region: string) {
    const queueDepth = await this.getQueueDepth(region)

    if (queueDepth > 10000) {
      // Scale up workers
      await this.scaleWorkers(region, 'up')

      // Throttle new syncs
      await this.setSyncThrottle(region, 0.5)

      // Alert operations
      await this.alert({
        severity: 'warning',
        message: `Sync queue depth ${queueDepth} in ${region}`,
        action: 'auto_scaling_triggered'
      })
    }
  }
}
```

### Notebook Lifecycle Management

```typescript
// Manage notebook tiers based on activity

enum NotebookTier {
  HOT = 'hot',       // Active project, real-time sync
  WARM = 'warm',     // Recent project, daily sync
  COLD = 'cold',     // Completed project, on-demand only
  ARCHIVED = 'archived'  // Old project, stored but not in NLM
}

class NotebookLifecycleManager {
  async evaluateAndMigrate() {
    const notebooks = await this.getAllNotebooks()

    for (const notebook of notebooks) {
      const newTier = this.calculateTier(notebook)

      if (newTier !== notebook.current_tier) {
        await this.migrateTier(notebook, newTier)
      }
    }
  }

  calculateTier(notebook: Notebook): NotebookTier {
    const daysSinceQuery = this.daysSince(notebook.last_query_at)
    const daysSinceUpdate = this.daysSince(notebook.last_update_at)
    const jobStatus = notebook.job?.status

    // Active jobs are always hot
    if (jobStatus === 'active' || jobStatus === 'pre_construction') {
      return NotebookTier.HOT
    }

    // Recently completed, still warm
    if (jobStatus === 'completed' && daysSinceUpdate < 30) {
      return NotebookTier.WARM
    }

    // Queried recently stays warm
    if (daysSinceQuery < 14) {
      return NotebookTier.WARM
    }

    // Old completed projects go cold
    if (jobStatus === 'completed' && daysSinceUpdate < 365) {
      return NotebookTier.COLD
    }

    // Very old = archive
    return NotebookTier.ARCHIVED
  }

  async migrateTier(notebook: Notebook, newTier: NotebookTier) {
    switch (newTier) {
      case NotebookTier.HOT:
        // Ensure notebook exists in NLM, enable real-time sync
        await this.ensureNotebookActive(notebook)
        await this.setSyncFrequency(notebook, 'realtime')
        break

      case NotebookTier.WARM:
        // Keep in NLM but reduce sync frequency
        await this.setSyncFrequency(notebook, 'daily')
        break

      case NotebookTier.COLD:
        // Remove from NLM, keep metadata
        // Can be rehydrated on-demand
        await this.deactivateNotebook(notebook)
        await this.storeMetadataOnly(notebook)
        break

      case NotebookTier.ARCHIVED:
        // Full archive - export and remove
        await this.exportToArchive(notebook)
        await this.deleteFromNLM(notebook)
        break
    }

    await this.updateTier(notebook.id, newTier)
  }
}
```

### Regional Distribution

```typescript
// Multi-region deployment for global scale

interface RegionalConfig {
  region: string
  gcpProject: string
  nlmLocation: 'us' | 'eu' | 'global'
  primaryDatabase: string
  readReplicas: string[]
  edgeLocations: string[]
}

const regions: RegionalConfig[] = [
  {
    region: 'north-america',
    gcpProject: 'rossos-nlm-us',
    nlmLocation: 'us',
    primaryDatabase: 'us-central1',
    readReplicas: ['us-east1', 'us-west1'],
    edgeLocations: ['iad', 'lax', 'ord', 'dfw']
  },
  {
    region: 'europe',
    gcpProject: 'rossos-nlm-eu',
    nlmLocation: 'eu',
    primaryDatabase: 'europe-west1',
    readReplicas: ['europe-west2', 'europe-north1'],
    edgeLocations: ['lhr', 'fra', 'ams', 'cdg']
  },
  {
    region: 'asia-pacific',
    gcpProject: 'rossos-nlm-apac',
    nlmLocation: 'global',  // No APAC-specific NLM yet
    primaryDatabase: 'asia-southeast1',
    readReplicas: ['asia-east1', 'australia-southeast1'],
    edgeLocations: ['sin', 'syd', 'nrt', 'hkg']
  }
]

// Route users to nearest region
function getRegionForUser(user: User): RegionalConfig {
  const userCountry = user.company.country_code

  const regionMap: Record<string, string> = {
    'US': 'north-america',
    'CA': 'north-america',
    'MX': 'north-america',
    'GB': 'europe',
    'DE': 'europe',
    'FR': 'europe',
    // ... etc
    'AU': 'asia-pacific',
    'NZ': 'asia-pacific',
    'SG': 'asia-pacific',
    'JP': 'asia-pacific',
  }

  const regionName = regionMap[userCountry] || 'north-america'
  return regions.find(r => r.region === regionName)!
}
```

### Monitoring & Observability

```typescript
// Comprehensive monitoring for scale operations

interface NotebookLMMetrics {
  // Query metrics
  queries_total: Counter
  query_latency_seconds: Histogram
  query_cache_hits: Counter
  query_cache_misses: Counter

  // Sync metrics
  sync_queue_depth: Gauge
  sync_latency_seconds: Histogram
  sync_errors_total: Counter
  sync_documents_processed: Counter

  // Cost metrics
  api_calls_total: Counter
  api_cost_dollars: Counter
  audio_minutes_generated: Counter

  // Notebook metrics
  notebooks_by_tier: Gauge  // Labeled by tier
  notebooks_total: Gauge
  sources_total: Gauge
}

// Alerting rules
const alerts = [
  {
    name: 'SyncQueueBacklog',
    condition: 'sync_queue_depth > 5000',
    severity: 'warning',
    action: 'Scale sync workers'
  },
  {
    name: 'QueryLatencyHigh',
    condition: 'query_latency_seconds:p99 > 10',
    severity: 'warning',
    action: 'Check NLM API status, consider cache warmup'
  },
  {
    name: 'CostSpike',
    condition: 'rate(api_cost_dollars[1h]) > budget_hourly * 2',
    severity: 'critical',
    action: 'Investigate query patterns, consider rate limiting'
  },
  {
    name: 'SyncErrorRate',
    condition: 'rate(sync_errors_total[5m]) / rate(sync_documents_processed[5m]) > 0.05',
    severity: 'warning',
    action: 'Check NLM API errors, review failed documents'
  }
]
```

---

## 4. Implementation Priority

### Phase 7.1 (Foundation) - Updated for Scale

| Task | Scale Consideration |
|------|---------------------|
| GCP setup | Multi-project for regions |
| Database schema | Partitioned tables |
| Sync service | Distributed workers |
| Basic API | Rate limiting, caching |

### Phase 7.2 (Job Integration) - Updated for Scale

| Task | Scale Consideration |
|------|---------------------|
| Auto-create notebooks | Async, queued creation |
| Document sync | Batched, prioritized |
| Query API | Smart routing, caching |
| UI integration | Optimistic updates |

### New Phase 7.7: Scale Operations

| Task | Description |
|------|-------------|
| Multi-region deployment | US, EU, APAC clusters |
| Monitoring dashboard | Real-time metrics |
| Cost management | Usage tracking, alerts |
| Lifecycle automation | Tier migration jobs |
| Performance tuning | Query optimization |

---

## 5. Summary

| Question | Answer |
|----------|--------|
| **Integration Plan** | Module 99 integrates with all data modules via webhook triggers. AI Engine (Module 44) provides ML infrastructure. Phased rollout over 9 weeks. |
| **Two-Way Sync** | Yes! CMS → NLM (documents) and NLM → CMS (insights, summaries, risk scores). New `ai_insights` and `ai_summaries` tables store feedback. |
| **100K+ Users** | Tiered pricing ($0-99/user AI add-on), regional distribution, smart query routing, notebook lifecycle management, aggressive caching. Estimated $3M revenue at $1.5M cost = 50% margin. |

---

*Architecture designed for global scale with construction industry constraints*
