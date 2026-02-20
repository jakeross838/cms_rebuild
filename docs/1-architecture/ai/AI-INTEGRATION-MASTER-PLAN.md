# BuildDesk AI Integration Master Plan

**Version:** 1.0
**Status:** Planning
**Last Updated:** February 2026

---

## Executive Summary

BuildDesk will integrate multiple AI services, each chosen for specific strengths, orchestrated through a unified AI Gateway. This ensures optimal cost, performance, and capability matching for every use case.

---

## AI Services Inventory

### 1. Google NotebookLM Enterprise

**Primary Use:** Document Intelligence & Contextual Q&A

| Strength | Use Case |
|----------|----------|
| Deep document understanding | Query across 1000s of project documents |
| Source citation | "Where did you get that?" with exact references |
| Audio overview generation | Morning briefings, weekly summaries |
| Multi-document synthesis | Cross-reference contracts, logs, emails |
| Persistent context | Notebook "remembers" all ingested content |

**Limitations:**
- Higher latency (2-5 seconds)
- Rate limited API
- Cost scales with document volume
- Not suitable for real-time chat

**Best For:** Complex queries requiring full project context

---

### 2. Google Gemini (Flash & Pro)

**Primary Use:** Fast General Intelligence

| Model | Strength | Use Case |
|-------|----------|----------|
| **Gemini Flash** | Speed + Cost | Simple queries, classification, routing |
| **Gemini Pro** | Capability | Complex reasoning, code generation |
| **Gemini Pro Vision** | Multimodal | Photo analysis, document OCR |

**Gemini Flash Use Cases:**
- Query classification (simple vs complex)
- Quick summaries from cached context
- Real-time chat responses
- Form field suggestions
- Email draft generation

**Gemini Pro Use Cases:**
- Complex analysis requiring reasoning
- Report generation
- Code/formula generation
- Multi-step planning

**Best For:** High-volume, low-latency operations

---

### 3. Google Cloud Vision AI

**Primary Use:** Image Analysis

| Capability | Use Case |
|------------|----------|
| Object detection | Identify materials, equipment in photos |
| Text extraction (OCR) | Read text from site photos, signs |
| Label detection | Auto-tag photos by content |
| Safe search | Filter inappropriate content |
| Face detection | Blur faces for privacy compliance |

**Best For:** Photo processing pipeline

---

### 4. Google Cloud Document AI

**Primary Use:** Structured Document Extraction

| Processor | Use Case |
|-----------|----------|
| Invoice Parser | Extract vendor, amounts, line items from invoices |
| Receipt Parser | Process expense receipts |
| Form Parser | Extract data from permit applications |
| Contract Parser | Extract key terms, dates, parties |
| ID Parser | Verify licenses, certifications |

**Best For:** Automated data entry from uploaded documents

---

### 5. Google Cloud Speech-to-Text

**Primary Use:** Voice Input

| Feature | Use Case |
|---------|----------|
| Real-time transcription | Voice daily logs in the field |
| Speaker diarization | Multi-person meeting notes |
| Punctuation & formatting | Clean transcripts |
| Industry vocabulary | Construction terminology |
| Noise handling | Job site background noise |

**Best For:** Voice-to-text for field workers

---

### 6. Google Cloud Text-to-Speech

**Primary Use:** Audio Generation

| Feature | Use Case |
|---------|----------|
| Natural voices | Audio briefings that don't sound robotic |
| SSML support | Control pacing, emphasis |
| Multiple voices | Different voices for different content types |
| Streaming | Long briefings without timeout |

**Best For:** Morning briefings, audio summaries

---

### 7. OpenAI Services (Backup/Specialized)

**Primary Use:** Fallback & Specialized Tasks

| Service | Use Case |
|---------|----------|
| **Whisper** | Alternative speech-to-text (better for accents) |
| **GPT-4o** | Fallback LLM if Gemini unavailable |
| **DALL-E** | Generate visualizations (optional) |
| **Embeddings** | Semantic search vectors |

**Best For:** Redundancy and specific capabilities

---

### 8. Anthropic Claude (Backup)

**Primary Use:** Complex Analysis Fallback

| Strength | Use Case |
|----------|----------|
| Long context | Analyze very long documents |
| Careful reasoning | Financial analysis, risk assessment |
| Instruction following | Complex multi-step tasks |

**Best For:** High-stakes analysis requiring careful reasoning

---

### 9. Vector Database (Supabase pgvector)

**Primary Use:** Semantic Search & Similarity

| Feature | Use Case |
|---------|----------|
| Embedding storage | Store document vectors |
| Similarity search | "Find similar projects" |
| Hybrid search | Combine keyword + semantic |
| Filtering | Scope to company, job, date range |

**Best For:** Fast similarity matching before LLM calls

---

## AI Gateway Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AI GATEWAY                                      │
│                        (Supabase Edge Function)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         REQUEST ROUTER                               │    │
│  │                                                                       │    │
│  │   Input: { type, content, context, urgency, user }                   │    │
│  │                                                                       │    │
│  │   1. Authenticate & authorize                                        │    │
│  │   2. Check rate limits                                               │    │
│  │   3. Classify request type                                           │    │
│  │   4. Route to appropriate service                                    │    │
│  │   5. Handle fallbacks                                                │    │
│  │   6. Cache results                                                   │    │
│  │   7. Log for analytics                                               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                    ┌───────────────┼───────────────┐                        │
│                    │               │               │                        │
│                    ▼               ▼               ▼                        │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │   FAST PATH      │ │   SMART PATH     │ │   DEEP PATH      │            │
│  │                  │ │                  │ │                  │            │
│  │ • Cache lookup   │ │ • Vector search  │ │ • NotebookLM     │            │
│  │ • Gemini Flash   │ │ • Gemini Pro     │ │ • Full context   │            │
│  │ • Simple queries │ │ • RAG pipeline   │ │ • Complex Q&A    │            │
│  │                  │ │                  │ │                  │            │
│  │ Latency: <500ms  │ │ Latency: 1-2s    │ │ Latency: 3-8s    │            │
│  │ Cost: $0.001     │ │ Cost: $0.01      │ │ Cost: $0.05      │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Request Classification & Routing

### Classification Model

```typescript
interface AIRequest {
  type: RequestType
  content: string
  context: {
    company_id: string
    job_id?: string
    user_id: string
    user_role: string
  }
  urgency: 'realtime' | 'normal' | 'batch'
  max_latency_ms?: number
  require_sources?: boolean
}

type RequestType =
  | 'chat'           // Conversational query
  | 'search'         // Find specific information
  | 'summarize'      // Generate summary
  | 'extract'        // Extract data from document
  | 'transcribe'     // Voice to text
  | 'generate_audio' // Text to speech
  | 'analyze_image'  // Photo analysis
  | 'classify'       // Categorize content
  | 'suggest'        // Generate suggestions
  | 'draft'          // Write content
```

### Routing Rules

| Request Pattern | Route To | Fallback |
|-----------------|----------|----------|
| Simple factual question | Gemini Flash + Cache | Gemini Pro |
| "What is the status of..." | Gemini Flash + RAG | NotebookLM |
| "Find all references to..." | NotebookLM | Vector Search + Gemini |
| "Summarize the project..." | NotebookLM | Gemini Pro + RAG |
| "When did we discuss..." | NotebookLM | Vector Search |
| Photo upload | Vision AI | - |
| Invoice upload | Document AI | Vision AI + Gemini |
| Voice input | Speech-to-Text | Whisper |
| Audio briefing request | Text-to-Speech | - |
| "Compare these options..." | Gemini Pro | Claude |
| Risk analysis | NotebookLM | Claude |

---

## Service Integration Flows

### Flow 1: Daily Log Voice Entry

```
User speaks into app
        │
        ▼
┌─────────────────┐
│ Speech-to-Text  │ (Google Cloud)
│ • Transcribe    │
│ • Punctuate     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Gemini Flash    │
│ • Structure     │
│ • Extract:      │
│   - Crews       │
│   - Materials   │
│   - Issues      │
│   - Weather     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Database        │
│ • Save log      │
│ • Trigger sync  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ NotebookLM Sync │
│ • Add to job    │
│   notebook      │
└─────────────────┘
```

### Flow 2: Invoice Processing

```
Invoice PDF uploaded
        │
        ▼
┌─────────────────┐
│ Document AI     │
│ • Invoice Parser│
│ • Extract:      │
│   - Vendor      │
│   - Amount      │
│   - Line items  │
│   - Due date    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Gemini Flash    │
│ • Match to PO   │
│ • Flag issues   │
│ • Suggest codes │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Database        │
│ • Create record │
│ • Link to PO    │
│ • Route approve │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ NotebookLM Sync │
│ • Job notebook  │
│ • Vendor notebook│
└─────────────────┘
```

### Flow 3: AI Assistant Query

```
User asks: "Why is electrical over budget?"
        │
        ▼
┌─────────────────┐
│ Query Router    │
│ • Classify:     │
│   COMPLEX       │
│ • Needs context │
│ • Needs sources │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Cache Check     │
│ • Similar query?│
│ • Recent data?  │
│ Result: MISS    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ NotebookLM      │
│ • Query job     │
│   notebook      │
│ • Get sources   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Response        │
│ "Electrical is  │
│  $8K over due   │
│  to:            │
│  1. CO #3 panel │
│     upgrade     │
│  2. Wire price  │
│     increase    │
│                 │
│  Sources:       │
│  - CO #3        │
│  - Invoice #47  │
│  - Daily log    │
│    Jan 15"      │
└─────────────────┘
```

### Flow 4: Morning Briefing Generation

```
Scheduled job: 5:00 AM
        │
        ▼
┌─────────────────┐
│ For each user:  │
│ • Get assigned  │
│   jobs          │
│ • Get pending   │
│   items         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ NotebookLM      │
│ • Query each    │
│   job notebook  │
│ • Get status    │
│ • Get risks     │
│ • Get schedule  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Gemini Pro      │
│ • Synthesize    │
│   into script   │
│ • Natural flow  │
│ • Prioritize    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Text-to-Speech  │
│ • Generate MP3  │
│ • Natural voice │
│ • ~5 minutes    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Storage         │
│ • Save audio    │
│ • Notify user   │
└─────────────────┘
```

### Flow 5: Photo Analysis Pipeline

```
Photo uploaded from site
        │
        ▼
┌─────────────────┐
│ Vision AI       │
│ • Object detect │
│ • Label detect  │
│ • OCR any text  │
│ • Safe search   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Gemini Pro      │
│ Vision          │
│ • Describe      │
│   progress      │
│ • Identify      │
│   phase         │
│ • Note issues   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Classification  │
│ • Client-safe?  │
│ • Quality OK?   │
│ • Duplicate?    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Database        │
│ • Save metadata │
│ • Auto-tag      │
│ • Link to log   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ NotebookLM Sync │
│ • Add descrip-  │
│   tion to       │
│   notebook      │
└─────────────────┘
```

---

## Caching Strategy

### Cache Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CACHE HIERARCHY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Layer 1: Edge Cache (Cloudflare Workers KV)                                │
│  ├── TTL: 5 minutes                                                         │
│  ├── Scope: Exact query match                                               │
│  ├── Hit rate: ~30%                                                         │
│  └── Latency: <10ms                                                         │
│                                                                              │
│  Layer 2: Redis Cache (Upstash)                                             │
│  ├── TTL: 1 hour                                                            │
│  ├── Scope: Semantic similarity (embedding match)                           │
│  ├── Hit rate: ~50%                                                         │
│  └── Latency: <50ms                                                         │
│                                                                              │
│  Layer 3: Precomputed Summaries (Postgres)                                  │
│  ├── TTL: 6 hours (or until data changes)                                   │
│  ├── Scope: Common queries per entity                                       │
│  ├── Examples:                                                              │
│  │   ├── Job status summary                                                 │
│  │   ├── Budget overview                                                    │
│  │   ├── Recent activity digest                                             │
│  │   └── Risk assessment                                                    │
│  └── Latency: <100ms                                                        │
│                                                                              │
│  Layer 4: NotebookLM (Source of Truth)                                      │
│  ├── Always fresh                                                           │
│  ├── Full context                                                           │
│  └── Latency: 2-8s                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Cache Invalidation

| Event | Invalidation Action |
|-------|---------------------|
| Daily log created | Invalidate job summary, activity cache |
| Invoice approved | Invalidate budget cache, vendor cache |
| Schedule updated | Invalidate timeline cache, risk cache |
| Change order approved | Invalidate budget, scope caches |
| Any job data change | Mark job caches stale |

---

## Cost Optimization

### Per-Query Cost Estimates

| Service | Operation | Est. Cost |
|---------|-----------|-----------|
| Gemini Flash | 1K tokens in/out | $0.0001 |
| Gemini Pro | 1K tokens in/out | $0.002 |
| NotebookLM | Query (est.) | $0.03-0.10 |
| Vision AI | Per image | $0.0015 |
| Document AI | Per page | $0.01-0.05 |
| Speech-to-Text | Per minute | $0.016 |
| Text-to-Speech | Per 1M chars | $4.00 |
| Embeddings | Per 1K tokens | $0.0001 |

### Cost Control Mechanisms

```typescript
interface CostControls {
  // Per-company daily limits
  daily_budget_limit: number // e.g., $10/day

  // Tier-based allocation
  tier_limits: {
    starter: { queries_per_day: 50, audio_minutes: 0 }
    professional: { queries_per_day: 200, audio_minutes: 30 }
    premium: { queries_per_day: 500, audio_minutes: 120 }
    enterprise: { queries_per_day: 'unlimited', audio_minutes: 'unlimited' }
  }

  // Smart downgrade
  fallback_rules: {
    if_over_budget: 'use_cache_only'
    if_rate_limited: 'queue_for_batch'
    if_high_latency: 'use_faster_model'
  }
}
```

---

## Database Schema Additions

```sql
-- AI Gateway configuration per company
CREATE TABLE ai_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Feature toggles
  features_enabled JSONB DEFAULT '{
    "notebooklm": true,
    "voice_input": true,
    "audio_briefings": true,
    "photo_analysis": true,
    "document_extraction": true
  }',

  -- Cost controls
  daily_budget_cents INTEGER DEFAULT 1000, -- $10/day
  monthly_budget_cents INTEGER DEFAULT 20000, -- $200/month

  -- Preferences
  preferred_voice TEXT DEFAULT 'en-US-Neural2-J',
  briefing_time TIME DEFAULT '06:00',
  briefing_days TEXT[] DEFAULT ARRAY['mon','tue','wed','thu','fri'],

  -- Usage tracking
  current_month_spend_cents INTEGER DEFAULT 0,
  current_day_spend_cents INTEGER DEFAULT 0,
  last_reset_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI request logging for analytics and debugging
CREATE TABLE ai_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID REFERENCES users(id),

  -- Request details
  request_type TEXT NOT NULL,
  request_content TEXT,
  request_context JSONB,

  -- Routing
  routed_to TEXT NOT NULL, -- 'gemini_flash', 'notebooklm', etc.
  cache_hit BOOLEAN DEFAULT false,
  fallback_used BOOLEAN DEFAULT false,

  -- Response
  response_content TEXT,
  response_sources JSONB,

  -- Performance
  latency_ms INTEGER,
  tokens_in INTEGER,
  tokens_out INTEGER,
  cost_cents DECIMAL(10,4),

  -- Status
  status TEXT DEFAULT 'success', -- 'success', 'error', 'timeout', 'rate_limited'
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics
CREATE INDEX idx_ai_requests_company_date
  ON ai_requests(company_id, created_at DESC);
CREATE INDEX idx_ai_requests_type
  ON ai_requests(request_type, created_at DESC);

-- Precomputed summaries cache
CREATE TABLE ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Cache key
  cache_type TEXT NOT NULL, -- 'job_summary', 'budget_overview', etc.
  entity_type TEXT,
  entity_id UUID,
  query_hash TEXT, -- For exact query caching

  -- Cached content
  content TEXT NOT NULL,
  sources JSONB,

  -- Validity
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  invalidated_at TIMESTAMPTZ,

  -- Metadata
  generation_time_ms INTEGER,
  model_used TEXT
);

CREATE INDEX idx_ai_cache_lookup
  ON ai_cache(company_id, cache_type, entity_id, expires_at)
  WHERE invalidated_at IS NULL;

-- Embedding vectors for semantic search
CREATE TABLE ai_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Source reference
  source_type TEXT NOT NULL, -- 'daily_log', 'email', 'document', etc.
  source_id UUID NOT NULL,
  chunk_index INTEGER DEFAULT 0, -- For long documents split into chunks

  -- Content
  content_text TEXT NOT NULL,
  content_summary TEXT,

  -- Vector (using pgvector)
  embedding vector(768), -- Dimension depends on model

  -- Metadata
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector index for similarity search
CREATE INDEX idx_ai_embeddings_vector
  ON ai_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_ai_embeddings_source
  ON ai_embeddings(company_id, source_type, source_id);
```

---

## Edge Functions Structure

```
supabase/functions/
├── ai-gateway/
│   ├── index.ts           # Main router
│   ├── classifier.ts      # Request classification
│   ├── router.ts          # Service routing logic
│   └── cache.ts           # Cache management
│
├── ai-services/
│   ├── gemini.ts          # Gemini Flash/Pro wrapper
│   ├── notebooklm.ts      # NotebookLM API wrapper
│   ├── vision.ts          # Vision AI wrapper
│   ├── document.ts        # Document AI wrapper
│   ├── speech.ts          # Speech-to-Text wrapper
│   ├── tts.ts             # Text-to-Speech wrapper
│   └── embeddings.ts      # Embedding generation
│
├── ai-pipelines/
│   ├── daily-log-voice.ts # Voice → structured log
│   ├── invoice-process.ts # Invoice → data extraction
│   ├── photo-analyze.ts   # Photo → tags + description
│   ├── briefing-generate.ts # Generate audio briefings
│   └── sync-notebooklm.ts # Sync content to notebooks
│
├── ai-scheduled/
│   ├── morning-briefings.ts  # Daily briefing generation
│   ├── weekly-summaries.ts   # Client summaries
│   ├── insight-generation.ts # Risk/health scoring
│   └── cache-warmup.ts       # Precompute common queries
│
└── ai-webhooks/
    ├── on-log-created.ts     # Trigger on new daily log
    ├── on-invoice-uploaded.ts # Trigger on invoice
    ├── on-photo-uploaded.ts   # Trigger on photo
    └── on-document-uploaded.ts # Trigger on document
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-3)
**Goal:** Core infrastructure and basic AI chat

| Task | Service | Priority |
|------|---------|----------|
| Set up AI Gateway edge function | Supabase | P0 |
| Implement Gemini Flash integration | Google | P0 |
| Create ai_requests logging table | Postgres | P0 |
| Basic AI Assistant Panel (done) | React | P0 |
| Simple query/response flow | All | P0 |
| Rate limiting & cost tracking | Gateway | P0 |

**Deliverable:** Users can ask simple questions and get AI responses

### Phase 2: Document Intelligence (Weeks 4-6)
**Goal:** NotebookLM integration for deep document Q&A

| Task | Service | Priority |
|------|---------|----------|
| NotebookLM API integration | Google | P0 |
| Notebook management (create, sync) | Gateway | P0 |
| Document sync pipeline | Edge Functions | P0 |
| Source citation display | React | P0 |
| Query routing (simple vs complex) | Gateway | P1 |
| Cache layer implementation | Redis | P1 |

**Deliverable:** Users can query across all project documents with sources

### Phase 3: Voice & Audio (Weeks 7-9)
**Goal:** Voice input and audio briefings

| Task | Service | Priority |
|------|---------|----------|
| Speech-to-Text integration | Google | P0 |
| Voice daily log entry | React + Edge | P0 |
| Text-to-Speech integration | Google | P0 |
| Morning briefing generation | Scheduled | P0 |
| Audio player in AI panel | React | P0 |
| Custom briefing requests | Gateway | P1 |

**Deliverable:** Field workers can speak logs, everyone gets audio briefings

### Phase 4: Document Processing (Weeks 10-12)
**Goal:** Automated data extraction from uploads

| Task | Service | Priority |
|------|---------|----------|
| Document AI integration | Google | P0 |
| Invoice parsing pipeline | Edge Functions | P0 |
| Auto-matching to POs | Gemini | P0 |
| Vision AI integration | Google | P1 |
| Photo analysis pipeline | Edge Functions | P1 |
| Auto-tagging system | Gemini | P1 |

**Deliverable:** Invoices auto-populate, photos auto-tag

### Phase 5: Insights & Predictions (Weeks 13-15)
**Goal:** Proactive AI insights throughout the system

| Task | Service | Priority |
|------|---------|----------|
| Insight generation scheduled jobs | Scheduled | P0 |
| Health score calculation | NotebookLM | P0 |
| Risk detection and alerts | Gateway | P0 |
| Insights display in dashboards | React | P0 |
| Prediction models (completion, cash) | Gemini | P1 |
| Anomaly detection | Gateway | P1 |

**Deliverable:** AI proactively surfaces risks and opportunities

### Phase 6: Scale & Optimization (Weeks 16-18)
**Goal:** Production-ready at scale

| Task | Service | Priority |
|------|---------|----------|
| Embedding-based semantic search | pgvector | P0 |
| Cache optimization | Redis | P0 |
| Cost optimization (smart routing) | Gateway | P0 |
| Fallback handling | Gateway | P0 |
| Usage analytics dashboard | React | P1 |
| Multi-region deployment | Infrastructure | P1 |

**Deliverable:** System handles 100K+ users efficiently

---

## API Credentials & Configuration

### Required API Keys

| Service | Key Name | Storage |
|---------|----------|---------|
| Google Cloud | `GOOGLE_CLOUD_API_KEY` | Supabase Secrets |
| NotebookLM | `NOTEBOOKLM_API_KEY` | Supabase Secrets |
| OpenAI (backup) | `OPENAI_API_KEY` | Supabase Secrets |
| Anthropic (backup) | `ANTHROPIC_API_KEY` | Supabase Secrets |
| Upstash Redis | `UPSTASH_REDIS_URL` | Supabase Secrets |

### Environment Configuration

```typescript
// config/ai.ts
export const AI_CONFIG = {
  // Primary services
  gemini: {
    flash_model: 'gemini-1.5-flash',
    pro_model: 'gemini-1.5-pro',
    vision_model: 'gemini-1.5-pro-vision',
  },

  // Timeouts
  timeouts: {
    fast_query: 5000,    // 5 seconds
    normal_query: 15000, // 15 seconds
    deep_query: 30000,   // 30 seconds
    batch_job: 300000,   // 5 minutes
  },

  // Rate limits
  rate_limits: {
    requests_per_minute: 60,
    requests_per_day: 1000,
    notebooklm_per_minute: 10,
  },

  // Cost limits (cents)
  cost_limits: {
    per_query_max: 50,      // $0.50 max per query
    per_day_warning: 500,   // $5 warning threshold
    per_day_hard: 1000,     // $10 hard limit
  },

  // Feature flags
  features: {
    notebooklm_enabled: true,
    voice_input_enabled: true,
    audio_briefings_enabled: true,
    photo_analysis_enabled: true,
    document_extraction_enabled: true,
  }
}
```

---

## Monitoring & Observability

### Metrics to Track

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `ai.request.latency` | Time per request | p99 > 10s |
| `ai.request.error_rate` | Failed requests | > 5% |
| `ai.cache.hit_rate` | Cache effectiveness | < 40% |
| `ai.cost.daily` | Daily spend | > $50 |
| `ai.notebooklm.sync_lag` | Time since last sync | > 1 hour |
| `ai.quota.remaining` | API quota left | < 20% |

### Logging Structure

```typescript
interface AILogEntry {
  timestamp: string
  request_id: string
  company_id: string
  user_id: string

  // Request
  request_type: string
  request_hash: string

  // Routing
  routed_to: string
  cache_status: 'hit' | 'miss' | 'stale'
  fallback_chain: string[]

  // Response
  status: 'success' | 'error' | 'timeout'
  latency_ms: number
  tokens: { in: number, out: number }
  cost_cents: number

  // Error details (if any)
  error?: {
    code: string
    message: string
    retryable: boolean
  }
}
```

---

## Security Considerations

### Data Isolation

```
┌─────────────────────────────────────────────────────────────────┐
│                     SECURITY BOUNDARIES                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Company Isolation                                            │
│     • Each company has separate NotebookLM notebooks            │
│     • RLS policies enforce company_id on all queries            │
│     • No cross-company data in any AI context                   │
│                                                                  │
│  2. User Authorization                                           │
│     • AI respects same permissions as direct data access        │
│     • Can't query jobs user doesn't have access to              │
│     • Audit log of all AI queries                               │
│                                                                  │
│  3. Client Portal Filtering                                      │
│     • Client notebooks exclude:                                  │
│       - Internal costs and margins                              │
│       - Crew issues and HR data                                 │
│       - Vendor pricing                                          │
│       - Internal communications                                 │
│     • Separate notebook with filtered sources                   │
│                                                                  │
│  4. PII Handling                                                 │
│     • Face detection → auto-blur option                         │
│     • SSN/financial data → redacted before AI                   │
│     • GDPR compliance for EU customers                          │
│                                                                  │
│  5. API Security                                                 │
│     • All keys in Supabase Secrets (encrypted)                  │
│     • Keys never exposed to client                              │
│     • Request signing for webhook verification                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Success Metrics

### User Adoption

| Metric | Target (6 months) |
|--------|-------------------|
| Daily active AI users | 60% of all users |
| Queries per user per day | 5+ |
| Audio briefing listen rate | 70% |
| Voice log adoption (field) | 50% |

### Business Impact

| Metric | Target |
|--------|--------|
| Time saved per PM per week | 10+ hours |
| Invoice processing time | -80% |
| Client response time | -70% |
| Estimate accuracy improvement | +15% |

### Technical Performance

| Metric | Target |
|--------|--------|
| Query latency (p50) | < 2s |
| Query latency (p99) | < 8s |
| Cache hit rate | > 50% |
| Error rate | < 1% |
| Cost per query (avg) | < $0.02 |

---

## Summary

This AI integration uses **5+ specialized services** orchestrated through a **unified AI Gateway**:

| Service | Role |
|---------|------|
| **NotebookLM** | Deep document Q&A, source citation |
| **Gemini Flash** | Fast queries, routing, classification |
| **Gemini Pro** | Complex reasoning, synthesis |
| **Vision AI** | Photo analysis, OCR |
| **Document AI** | Invoice/document extraction |
| **Speech-to-Text** | Voice input |
| **Text-to-Speech** | Audio briefings |
| **pgvector** | Semantic search, similarity |
| **Redis** | Caching, rate limiting |

All services communicate through the **AI Gateway** which handles:
- Request classification & routing
- Cost optimization
- Caching at multiple layers
- Fallback handling
- Logging & analytics
- Rate limiting

The system is designed for **100K+ users** with costs controlled through intelligent routing and caching.

---

*BuildDesk AI Integration Master Plan v1.0*
