# Multi-Tenant AI Architecture for 10,000+ Companies

**Version:** 1.0
**Status:** Planning
**Scale Target:** 10,000 - 100,000 construction companies

---

## Scale Requirements

### Target Numbers

| Metric | Scale |
|--------|-------|
| Companies | 10,000 - 100,000 |
| Users per company (avg) | 8 |
| Total users | 80,000 - 800,000 |
| Active jobs per company (avg) | 12 |
| Total active jobs | 120,000 - 1,200,000 |
| Documents per job (avg) | 500 |
| Total documents | 60M - 600M |
| AI queries per day | 500,000 - 5,000,000 |
| Audio briefings per day | 50,000 - 500,000 |

---

## Multi-Tenant Challenges & Solutions

### Challenge 1: NotebookLM Notebook Limits

**Problem:** NotebookLM has limits on notebooks per account and sources per notebook.

**Solution:** Notebook Pooling Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      NOTEBOOK MANAGEMENT LAYER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Strategy: Tiered Notebook Allocation                                        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ TIER 1: Hot Notebooks (Active Projects)                              │    │
│  │                                                                       │    │
│  │ • Each active job gets dedicated notebook                            │    │
│  │ • ~1.2M active jobs = ~1.2M hot notebooks                           │    │
│  │ • Distributed across multiple Google Cloud projects                  │    │
│  │ • 100 GCP projects × 50,000 notebooks each = 5M capacity            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ TIER 2: Warm Notebooks (Recently Completed)                          │    │
│  │                                                                       │    │
│  │ • Jobs completed < 6 months                                          │    │
│  │ • Consolidated: 10 jobs per notebook                                 │    │
│  │ • Query routing adds job filter                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ TIER 3: Cold Storage (Archived)                                      │    │
│  │                                                                       │    │
│  │ • Jobs > 6 months old                                                │    │
│  │ • Notebooks deleted, embeddings retained                             │    │
│  │ • On-demand notebook recreation (5-10 min)                          │    │
│  │ • Use RAG with embeddings for most queries                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ TIER 4: Company Knowledge Base                                        │    │
│  │                                                                       │    │
│  │ • 1 notebook per company for templates/SOPs                          │    │
│  │ • ~100,000 company KB notebooks                                      │    │
│  │ • Lower query volume, longer TTL                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Challenge 2: Google Cloud Project Limits

**Problem:** Single GCP project has API quotas and limits.

**Solution:** Multi-Project Federation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GOOGLE CLOUD PROJECT FEDERATION                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ GCP Project 001 │  │ GCP Project 002 │  │ GCP Project ... │             │
│  │ Region: US-East │  │ Region: US-West │  │ Region: EU      │             │
│  │                 │  │                 │  │                 │             │
│  │ Companies:      │  │ Companies:      │  │ Companies:      │             │
│  │ 1 - 1,000       │  │ 1,001 - 2,000   │  │ EU customers    │             │
│  │                 │  │                 │  │                 │             │
│  │ Services:       │  │ Services:       │  │ Services:       │             │
│  │ • NotebookLM    │  │ • NotebookLM    │  │ • NotebookLM    │             │
│  │ • Gemini        │  │ • Gemini        │  │ • Gemini        │             │
│  │ • Vision AI     │  │ • Vision AI     │  │ • Vision AI     │             │
│  │ • Document AI   │  │ • Document AI   │  │ • Document AI   │             │
│  │ • Speech/TTS    │  │ • Speech/TTS    │  │ • Speech/TTS    │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│           │                   │                   │                         │
│           └───────────────────┴───────────────────┘                         │
│                               │                                              │
│                               ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    FEDERATION ROUTER                                 │    │
│  │                                                                       │    │
│  │  company_id → project_id mapping                                     │    │
│  │  Load balancing across projects                                      │    │
│  │  Failover handling                                                   │    │
│  │  Quota monitoring per project                                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Challenge 3: Database Scale

**Problem:** Single Postgres can't handle 100K companies efficiently.

**Solution:** Horizontal Partitioning + Read Replicas

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DATABASE ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    SUPABASE CLUSTERS                                 │    │
│  │                                                                       │    │
│  │  Primary Strategy: Hash partitioning by company_id                   │    │
│  │                                                                       │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐         │    │
│  │  │ Shard 0   │  │ Shard 1   │  │ Shard 2   │  │ Shard 3   │         │    │
│  │  │           │  │           │  │           │  │           │         │    │
│  │  │ Companies │  │ Companies │  │ Companies │  │ Companies │         │    │
│  │  │ hash%4=0  │  │ hash%4=1  │  │ hash%4=2  │  │ hash%4=3  │         │    │
│  │  │           │  │           │  │           │  │           │         │    │
│  │  │ ~25K co.  │  │ ~25K co.  │  │ ~25K co.  │  │ ~25K co.  │         │    │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘         │    │
│  │        │              │              │              │                │    │
│  │        └──────────────┴──────────────┴──────────────┘                │    │
│  │                               │                                       │    │
│  │                               ▼                                       │    │
│  │  ┌─────────────────────────────────────────────────────────────┐     │    │
│  │  │                   ROUTING LAYER                              │     │    │
│  │  │                                                               │     │    │
│  │  │  get_shard(company_id) → shard_connection                    │     │    │
│  │  │                                                               │     │    │
│  │  └─────────────────────────────────────────────────────────────┘     │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Read Replicas per Shard:                                                   │
│  • 2 replicas per shard for read scaling                                   │
│  • Automatic failover                                                       │
│  • AI queries route to replicas                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Challenge 4: Noisy Neighbor Problem

**Problem:** One company doing heavy AI usage shouldn't impact others.

**Solution:** Multi-Layer Isolation & Fair Queuing

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      RESOURCE ISOLATION                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Layer 1: Request Queuing                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                       │    │
│  │  Fair Queue per Company                                              │    │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                           │    │
│  │  │Co. A│ │Co. B│ │Co. C│ │Co. D│ │ ... │                           │    │
│  │  │ ▓▓▓ │ │ ▓   │ │ ▓▓  │ │     │ │     │                           │    │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                           │    │
│  │                                                                       │    │
│  │  Round-robin processing ensures no company monopolizes               │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Layer 2: Per-Company Rate Limits                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                       │    │
│  │  Tier-based limits (requests per minute):                            │    │
│  │  • Starter:      10 RPM                                              │    │
│  │  • Professional: 30 RPM                                              │    │
│  │  • Premium:      60 RPM                                              │    │
│  │  • Enterprise:   120 RPM (dedicated capacity)                        │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Layer 3: Circuit Breakers                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                       │    │
│  │  If company exceeds limits:                                          │    │
│  │  1. Queue overflow → return cached results                           │    │
│  │  2. Continued overflow → graceful degradation                        │    │
│  │  3. Sustained abuse → temporary throttle                             │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Layer 4: Enterprise Isolation                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                       │    │
│  │  Enterprise customers get:                                           │    │
│  │  • Dedicated GCP project                                             │    │
│  │  • Dedicated database shard                                          │    │
│  │  • Dedicated NotebookLM quota                                        │    │
│  │  • No shared resources                                               │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Challenge 5: Regional Data Residency

**Problem:** EU companies need data in EU, different regulations.

**Solution:** Regional Deployment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      REGIONAL ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   US Region     │  │   EU Region     │  │  APAC Region    │             │
│  │                 │  │                 │  │                 │             │
│  │ Supabase:       │  │ Supabase:       │  │ Supabase:       │             │
│  │ us-east-1       │  │ eu-central-1    │  │ ap-southeast-1  │             │
│  │                 │  │                 │  │                 │             │
│  │ GCP:            │  │ GCP:            │  │ GCP:            │             │
│  │ us-central1     │  │ europe-west1    │  │ asia-southeast1 │             │
│  │                 │  │                 │  │                 │             │
│  │ Edge:           │  │ Edge:           │  │ Edge:           │             │
│  │ Cloudflare US   │  │ Cloudflare EU   │  │ Cloudflare APAC │             │
│  │                 │  │                 │  │                 │             │
│  │ Companies:      │  │ Companies:      │  │ Companies:      │             │
│  │ ~70,000         │  │ ~20,000         │  │ ~10,000         │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
│  Data Residency Rules:                                                      │
│  • Company data NEVER leaves assigned region                               │
│  • AI processing happens in same region                                    │
│  • Cross-region only for global analytics (anonymized)                     │
│  • GDPR compliance for EU                                                  │
│  • SOC 2 compliance all regions                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Cost Model at Scale

### Per-Company Economics

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    UNIT ECONOMICS (per company/month)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Average Company Profile:                                                   │
│  • 8 users                                                                  │
│  • 12 active jobs                                                          │
│  • 500 documents per job = 6,000 documents                                 │
│  • 50 AI queries per user per day = 400/day = 12,000/month                │
│  • 8 audio briefings per day = 240/month                                   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ COST BREAKDOWN                                                       │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                       │    │
│  │ NotebookLM (12 notebooks × $5/mo est.)           $60.00              │    │
│  │ Gemini Flash (10,000 queries × $0.0001)           $1.00              │    │
│  │ Gemini Pro (2,000 queries × $0.002)               $4.00              │    │
│  │ Document AI (500 pages × $0.02)                  $10.00              │    │
│  │ Vision AI (1,000 images × $0.0015)                $1.50              │    │
│  │ Speech-to-Text (60 min × $0.016)                  $0.96              │    │
│  │ Text-to-Speech (50,000 chars × $0.000004)         $0.20              │    │
│  │ Embeddings (100,000 tokens × $0.0001)             $0.10              │    │
│  │ Redis Cache (shared)                              $0.50              │    │
│  │ Database (shared, per-company allocation)         $2.00              │    │
│  │ ─────────────────────────────────────────────────────────           │    │
│  │ TOTAL COST PER COMPANY                          ~$80/month           │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ PRICING vs COST                                                      │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                       │    │
│  │ Tier          Price      AI Cost    Margin                          │    │
│  │ ────────────────────────────────────────────                        │    │
│  │ Starter       $99/mo     $20/mo     80%     (limited AI)            │    │
│  │ Professional  $199/mo    $50/mo     75%     (standard AI)           │    │
│  │ Premium       $349/mo    $80/mo     77%     (full AI)               │    │
│  │ Enterprise    $999/mo    $150/mo    85%     (dedicated)             │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Platform-Wide Cost at Scale

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PLATFORM COSTS AT 100,000 COMPANIES                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ MONTHLY AI INFRASTRUCTURE COSTS                                      │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                       │    │
│  │ NotebookLM                                                           │    │
│  │   1.2M active notebooks × $5              $6,000,000                │    │
│  │   (with tiering, actual)                  $2,000,000                │    │
│  │                                                                       │    │
│  │ Gemini APIs                                                          │    │
│  │   500M queries/month                        $500,000                │    │
│  │   (with caching, actual)                    $150,000                │    │
│  │                                                                       │    │
│  │ Document/Vision AI                                                   │    │
│  │   50M documents/month                       $500,000                │    │
│  │                                                                       │    │
│  │ Speech/TTS                                                           │    │
│  │   10M minutes speech                        $160,000                │    │
│  │   500M chars TTS                             $50,000                │    │
│  │                                                                       │    │
│  │ Infrastructure                                                       │    │
│  │   Database (4 shards + replicas)            $100,000                │    │
│  │   Redis cluster                              $50,000                │    │
│  │   Edge functions                             $80,000                │    │
│  │   Storage                                   $200,000                │    │
│  │                                                                       │    │
│  │ ─────────────────────────────────────────────────────────           │    │
│  │ TOTAL MONTHLY COST                        ~$3,300,000                │    │
│  │ PER COMPANY                                    ~$33                  │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  With 100,000 companies averaging $250/month:                               │
│  Monthly Revenue: $25,000,000                                               │
│  AI Infrastructure: $3,300,000 (13%)                                        │
│  Gross Margin: 87%                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tenant Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NEW COMPANY ONBOARDING                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Step 1: Company Registration                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Assign to region based on location                                │    │
│  │ • Assign to database shard (hash of company_id)                     │    │
│  │ • Assign to GCP project pool                                        │    │
│  │ • Create company record in assigned shard                           │    │
│  │ • Initialize ai_config with tier defaults                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              │                                               │
│                              ▼                                               │
│  Step 2: AI Initialization (Background)                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Create Company Knowledge Base notebook (empty)                    │    │
│  │ • Seed with default construction templates                          │    │
│  │ • Generate initial embeddings                                       │    │
│  │ • Warm cache with common queries                                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              │                                               │
│                              ▼                                               │
│  Step 3: First Job Created                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Create job notebook in assigned GCP project                       │    │
│  │ • Begin syncing documents as they're added                          │    │
│  │ • AI Assistant becomes available                                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tenant Isolation Verification

```sql
-- Every AI table has company_id and RLS

-- Row Level Security on all AI tables
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_requests_company_isolation" ON ai_requests
  FOR ALL
  USING (company_id = auth.jwt() ->> 'company_id');

-- Same for all AI tables:
-- ai_config, ai_cache, ai_insights, ai_summaries,
-- ai_embeddings, ai_audio_briefings, notebooklm_notebooks, etc.

-- Verify no cross-tenant data leakage
CREATE OR REPLACE FUNCTION verify_tenant_isolation()
RETURNS TABLE(table_name text, violation_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'ai_requests'::text,
    COUNT(*) FILTER (WHERE company_id != auth.jwt() ->> 'company_id')
  FROM ai_requests
  UNION ALL
  SELECT
    'ai_insights'::text,
    COUNT(*) FILTER (WHERE company_id != auth.jwt() ->> 'company_id')
  FROM ai_insights
  -- ... repeat for all tables
  ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## High Availability Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HIGH AVAILABILITY                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  API Layer (99.99% target)                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                       │    │
│  │  Cloudflare Workers (Edge)                                           │    │
│  │  • Global distribution                                               │    │
│  │  • Automatic failover                                                │    │
│  │  • DDoS protection                                                   │    │
│  │  • 99.99% SLA                                                        │    │
│  │                                                                       │    │
│  │  Supabase Edge Functions                                             │    │
│  │  • Multi-region deployment                                           │    │
│  │  • Health checks every 10s                                           │    │
│  │  • Auto-scaling                                                      │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  AI Services (99.9% target)                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                       │    │
│  │  Primary: Google Cloud AI                                            │    │
│  │  Fallback Chain:                                                     │    │
│  │  1. NotebookLM → Gemini Pro + RAG                                   │    │
│  │  2. Gemini → OpenAI GPT-4                                           │    │
│  │  3. Document AI → Vision AI + Gemini                                │    │
│  │  4. Google Speech → OpenAI Whisper                                  │    │
│  │                                                                       │    │
│  │  Cache-First Strategy:                                               │    │
│  │  • If all AI fails, serve cached responses                          │    │
│  │  • "AI temporarily limited" message                                  │    │
│  │  • Never complete outage                                             │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Database (99.99% target)                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                       │    │
│  │  Per Shard:                                                          │    │
│  │  • Primary (write)                                                   │    │
│  │  • 2 Read replicas                                                   │    │
│  │  • Automatic failover < 30s                                          │    │
│  │  • Point-in-time recovery                                            │    │
│  │  • Cross-region backup                                               │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Monitoring at Scale

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MULTI-TENANT MONITORING                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Platform-Level Metrics                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Total active companies                                             │    │
│  │ • Total AI requests/minute                                           │    │
│  │ • Global error rate                                                  │    │
│  │ • Global latency percentiles                                         │    │
│  │ • Infrastructure costs/hour                                          │    │
│  │ • Cache hit rate                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Per-Shard Metrics                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Companies per shard                                                │    │
│  │ • Request volume per shard                                           │    │
│  │ • Database CPU/memory                                                │    │
│  │ • Replication lag                                                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Per-Company Metrics (for support)                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • AI usage vs quota                                                  │    │
│  │ • Error rate for this company                                        │    │
│  │ • Notebook sync status                                               │    │
│  │ • Cost tracking                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Alerting                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Error rate > 5% → Page on-call                                    │    │
│  │ • Latency p99 > 10s → Warning                                       │    │
│  │ • Shard unbalanced > 20% → Auto-rebalance                           │    │
│  │ • Cost spike > 150% → Alert + investigate                           │    │
│  │ • Single company > 10% resources → Noisy neighbor alert             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Additions for Multi-Tenancy

```sql
-- Tenant routing table
CREATE TABLE tenant_routing (
  company_id UUID PRIMARY KEY,

  -- Database routing
  database_shard INTEGER NOT NULL, -- 0, 1, 2, 3, etc.
  database_region TEXT NOT NULL,   -- 'us-east-1', 'eu-central-1', etc.

  -- GCP routing
  gcp_project_id TEXT NOT NULL,    -- Which GCP project for AI
  gcp_region TEXT NOT NULL,

  -- Feature flags
  features JSONB DEFAULT '{}',

  -- Isolation level
  isolation_level TEXT DEFAULT 'shared', -- 'shared', 'dedicated'

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shard health monitoring
CREATE TABLE shard_health (
  shard_id INTEGER PRIMARY KEY,
  region TEXT NOT NULL,
  company_count INTEGER DEFAULT 0,
  request_rate_per_minute INTEGER DEFAULT 0,
  error_rate DECIMAL(5,4) DEFAULT 0,
  latency_p50_ms INTEGER DEFAULT 0,
  latency_p99_ms INTEGER DEFAULT 0,
  cpu_percent DECIMAL(5,2) DEFAULT 0,
  memory_percent DECIMAL(5,2) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- GCP project pool management
CREATE TABLE gcp_project_pool (
  project_id TEXT PRIMARY KEY,
  region TEXT NOT NULL,

  -- Capacity
  notebook_count INTEGER DEFAULT 0,
  notebook_limit INTEGER DEFAULT 50000,

  -- Quota usage
  notebooklm_requests_today INTEGER DEFAULT 0,
  gemini_requests_today INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'full', 'maintenance'

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company AI usage tracking
CREATE TABLE company_ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Period
  period_start DATE NOT NULL,
  period_type TEXT NOT NULL, -- 'daily', 'monthly'

  -- Counts
  notebooklm_queries INTEGER DEFAULT 0,
  gemini_flash_queries INTEGER DEFAULT 0,
  gemini_pro_queries INTEGER DEFAULT 0,
  document_pages INTEGER DEFAULT 0,
  vision_images INTEGER DEFAULT 0,
  speech_minutes DECIMAL(10,2) DEFAULT 0,
  tts_characters INTEGER DEFAULT 0,

  -- Cost
  total_cost_cents INTEGER DEFAULT 0,

  -- Limits
  queries_limit INTEGER,
  cost_limit_cents INTEGER,

  UNIQUE(company_id, period_start, period_type)
);

CREATE INDEX idx_company_ai_usage_lookup
  ON company_ai_usage(company_id, period_type, period_start DESC);
```

---

## Summary: Multi-Tenant Readiness

### YES, this architecture supports 10,000+ companies:

| Challenge | Solution | Status |
|-----------|----------|--------|
| Notebook limits | Tiered pooling + multi-GCP projects | ✅ Designed |
| Database scale | Hash sharding + read replicas | ✅ Designed |
| Noisy neighbors | Fair queuing + rate limits | ✅ Designed |
| Data residency | Regional deployment | ✅ Designed |
| Cost control | Per-company tracking + limits | ✅ Designed |
| High availability | Fallback chains + caching | ✅ Designed |
| Tenant isolation | RLS + separate notebooks | ✅ Designed |
| Onboarding | Automated provisioning | ✅ Designed |

### Key Architectural Decisions:

1. **Hash-based sharding** by company_id across database clusters
2. **Multiple GCP projects** (~100) to distribute AI quotas
3. **Regional deployment** for data residency compliance
4. **Tiered notebooks** (hot/warm/cold) to manage costs
5. **Fair queuing** to prevent noisy neighbor issues
6. **Enterprise isolation** option for large customers
7. **Fallback chains** for high availability

### Next Steps:

1. Implement tenant routing layer
2. Set up multi-region Supabase clusters
3. Create GCP project federation
4. Build shard management tooling
5. Implement usage tracking and billing integration

---

*Multi-Tenant AI Architecture v1.0 - Designed for 100,000+ companies*
