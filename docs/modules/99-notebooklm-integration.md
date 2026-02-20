# Module 99: NotebookLM Integration

## Overview

Deep integration between RossOS CMS and Google NotebookLM Enterprise, transforming the construction management platform into an AI-powered research and intelligence system.

**Phase:** 7 (Advanced AI)
**Priority:** P1
**Dependencies:** Modules 1-6 (Core Platform), Module 44 (AI Engine)

---

## Vision

Every project, client, and vendor becomes a "living notebook" that understands context, answers questions, and generates insights. Field crews get audio briefings. PMs ask natural language questions. Executives get AI-synthesized reports.

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           RossOS CMS                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Jobs   │  │ Clients  │  │ Vendors  │  │ Finance  │  │   Docs   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │             │             │             │         │
│       └─────────────┴─────────────┴─────────────┴─────────────┘         │
│                                   │                                      │
│                        ┌──────────▼──────────┐                          │
│                        │  NotebookLM Sync    │                          │
│                        │      Service        │                          │
│                        └──────────┬──────────┘                          │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │   NotebookLM Enterprise API   │
                    │   (Google Cloud)              │
                    ├───────────────────────────────┤
                    │  ┌─────────┐  ┌─────────┐    │
                    │  │Job      │  │Client   │    │
                    │  │Notebooks│  │Notebooks│    │
                    │  └─────────┘  └─────────┘    │
                    │  ┌─────────┐  ┌─────────┐    │
                    │  │Vendor   │  │Company  │    │
                    │  │Intel    │  │Knowledge│    │
                    │  └─────────┘  └─────────┘    │
                    └───────────────────────────────┘
```

### Notebook Types

| Notebook Type | Content | Auto-Created | Use Case |
|---------------|---------|--------------|----------|
| **Job Notebook** | All job docs, logs, photos, communications | When job created | "What's our risk exposure on this project?" |
| **Client Notebook** | All jobs for client, contracts, communications | When client created | "Summarize our history with the Johnsons" |
| **Vendor Notebook** | Performance data, invoices, contracts, issues | When vendor created | "How reliable is ABC Plumbing?" |
| **Estimate Notebook** | Specs, takeoffs, pricing, comparables | When estimate created | "What similar projects can inform this bid?" |
| **Company Knowledge** | SOPs, training, building codes, templates | Manual/Admin | "What's our policy on change order approval?" |
| **Financial Analysis** | Budgets, actuals, cash flow, trends | Monthly auto-gen | "Analyze our profitability trends" |
| **Compliance Hub** | Safety docs, insurance, licenses, certs | Per-project | "Are we compliant for the Smith project?" |

---

## Data Flow

### What Gets Synced to NotebookLM

#### Per Job Notebook
```yaml
Job Data:
  - Job details (name, address, dates, budget, contract type)
  - Contract document (PDF)
  - Scope of work
  - Specifications
  - Plans/drawings (PDF)

Financial:
  - Budget breakdown by cost code
  - All invoices (vendor, amount, status)
  - All purchase orders
  - Change orders (with approval history)
  - Draw requests and schedules
  - Payment history

Field:
  - Daily logs (all entries)
  - Photos (with AI-generated descriptions)
  - Punch list items
  - Inspection reports
  - Safety incidents

Communication:
  - RFIs and responses
  - Submittals
  - Client communications
  - Internal notes

Timeline:
  - Schedule (original and current)
  - Milestone dates
  - Delay logs
  - Weather impacts
```

#### Per Client Notebook
```yaml
Client Profile:
  - Contact information
  - Communication preferences
  - Payment history/patterns

All Jobs:
  - Summary of each project
  - Total contract values
  - Change order history
  - Satisfaction indicators

Contracts:
  - All signed contracts
  - Standard terms used
  - Special provisions

Communications:
  - Email threads
  - Meeting notes
  - Issue escalations
```

#### Per Vendor Notebook
```yaml
Vendor Profile:
  - Trade/specialty
  - Contact info
  - Insurance status
  - License info

Performance:
  - Quality scores per job
  - Schedule adherence
  - Punch list frequency
  - Response times

Financial:
  - Pricing history
  - Invoice patterns
  - Payment terms used
  - Dispute history

All Jobs:
  - Work performed per project
  - Issues encountered
  - Client feedback
```

#### Company Knowledge Base
```yaml
Operations:
  - Standard operating procedures
  - Quality checklists
  - Safety protocols
  - Onboarding materials

Legal/Compliance:
  - Contract templates
  - Insurance requirements
  - Building codes (by jurisdiction)
  - Permit processes

Financial:
  - Pricing guidelines
  - Markup policies
  - Payment terms
  - Collection procedures

Training:
  - Role-specific guides
  - Software tutorials
  - Best practices
  - Lessons learned
```

---

## Database Schema

### New Tables

```sql
-- NotebookLM notebook registry
CREATE TABLE notebooklm_notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- NotebookLM identifiers
  nlm_notebook_id TEXT NOT NULL,           -- Google's notebook ID
  nlm_project_id TEXT NOT NULL,            -- Google Cloud project
  nlm_location TEXT NOT NULL DEFAULT 'us', -- us, eu, global

  -- Link to CMS entity
  entity_type TEXT NOT NULL,               -- job, client, vendor, estimate, company_kb
  entity_id UUID,                          -- NULL for company_kb

  -- Metadata
  display_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',   -- active, syncing, error, archived

  -- Sync tracking
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT,
  last_sync_error TEXT,
  source_count INTEGER DEFAULT 0,

  -- Settings
  auto_sync BOOLEAN DEFAULT true,
  sync_frequency TEXT DEFAULT 'realtime',  -- realtime, hourly, daily
  include_photos BOOLEAN DEFAULT true,
  include_financials BOOLEAN DEFAULT true,

  -- Sharing
  shared_with JSONB DEFAULT '[]',          -- [{user_id, role}]

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, entity_type, entity_id)
);

-- Source documents synced to notebooks
CREATE TABLE notebooklm_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID NOT NULL REFERENCES notebooklm_notebooks(id) ON DELETE CASCADE,

  -- NotebookLM identifiers
  nlm_source_id TEXT,                      -- Google's source ID (after upload)

  -- Source reference
  source_type TEXT NOT NULL,               -- document, daily_log, invoice, photo, etc.
  source_id UUID,                          -- Reference to CMS record
  source_table TEXT,                       -- Table name for reference

  -- Content
  title TEXT NOT NULL,
  content_hash TEXT,                       -- MD5 to detect changes
  content_size_bytes INTEGER,
  mime_type TEXT,

  -- Sync status
  sync_status TEXT NOT NULL DEFAULT 'pending', -- pending, synced, error, deleted
  synced_at TIMESTAMPTZ,
  sync_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query history and caching
CREATE TABLE notebooklm_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  notebook_id UUID REFERENCES notebooklm_notebooks(id),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Query details
  query_text TEXT NOT NULL,
  query_type TEXT DEFAULT 'question',      -- question, summary, audio, comparison

  -- Response
  response_text TEXT,
  response_sources JSONB,                  -- Citations from NotebookLM
  response_confidence FLOAT,

  -- Audio (if generated)
  audio_url TEXT,
  audio_duration_seconds INTEGER,

  -- Metrics
  response_time_ms INTEGER,
  tokens_used INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync queue for background processing
CREATE TABLE notebooklm_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID NOT NULL REFERENCES notebooklm_notebooks(id),

  -- What to sync
  action TEXT NOT NULL,                    -- create_notebook, add_source, update_source, delete_source
  payload JSONB NOT NULL,

  -- Processing
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, processing, completed, failed
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  error_message TEXT,

  -- Scheduling
  priority INTEGER DEFAULT 5,              -- 1=highest, 10=lowest
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Audio briefings generated
CREATE TABLE notebooklm_audio_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  notebook_id UUID REFERENCES notebooklm_notebooks(id),

  -- Briefing details
  title TEXT NOT NULL,
  briefing_type TEXT NOT NULL,             -- daily_standup, project_status, weekly_summary
  entity_type TEXT,
  entity_id UUID,

  -- Content
  script_text TEXT,                        -- Generated script
  audio_url TEXT,                          -- Storage URL
  duration_seconds INTEGER,

  -- Schedule
  auto_generate BOOLEAN DEFAULT false,
  schedule_cron TEXT,                      -- e.g., "0 6 * * 1-5" for weekday 6am
  last_generated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_nlm_notebooks_company ON notebooklm_notebooks(company_id);
CREATE INDEX idx_nlm_notebooks_entity ON notebooklm_notebooks(entity_type, entity_id);
CREATE INDEX idx_nlm_sources_notebook ON notebooklm_sources(notebook_id);
CREATE INDEX idx_nlm_sources_sync ON notebooklm_sources(sync_status) WHERE sync_status != 'synced';
CREATE INDEX idx_nlm_queue_pending ON notebooklm_sync_queue(status, priority, scheduled_for)
  WHERE status = 'pending';
CREATE INDEX idx_nlm_queries_notebook ON notebooklm_queries(notebook_id);
```

---

## API Endpoints

### Notebook Management

```typescript
// Create notebook for entity
POST /api/v1/notebooklm/notebooks
{
  entity_type: 'job' | 'client' | 'vendor' | 'estimate' | 'company_kb',
  entity_id?: string,
  display_name: string,
  settings?: {
    auto_sync: boolean,
    include_photos: boolean,
    include_financials: boolean
  }
}

// Get notebook details
GET /api/v1/notebooklm/notebooks/:id

// List notebooks
GET /api/v1/notebooklm/notebooks?entity_type=job&entity_id=xxx

// Update notebook settings
PATCH /api/v1/notebooklm/notebooks/:id

// Delete notebook
DELETE /api/v1/notebooklm/notebooks/:id

// Trigger manual sync
POST /api/v1/notebooklm/notebooks/:id/sync

// Get sync status
GET /api/v1/notebooklm/notebooks/:id/sync-status
```

### Querying

```typescript
// Ask a question
POST /api/v1/notebooklm/query
{
  notebook_id?: string,        // Specific notebook or...
  entity_type?: string,        // ...query by entity
  entity_id?: string,
  query: string,
  include_sources: boolean     // Return citations
}

// Response
{
  answer: string,
  sources: [
    { title: string, excerpt: string, source_id: string }
  ],
  confidence: number,
  tokens_used: number
}

// Get query history
GET /api/v1/notebooklm/queries?notebook_id=xxx

// Multi-notebook query (cross-reference)
POST /api/v1/notebooklm/query/multi
{
  notebook_ids: string[],
  query: string
}
```

### Audio Briefings

```typescript
// Generate audio briefing
POST /api/v1/notebooklm/audio
{
  notebook_id?: string,
  briefing_type: 'project_status' | 'daily_standup' | 'weekly_summary' | 'custom',
  custom_prompt?: string,
  voice_style?: 'conversational' | 'professional' | 'brief'
}

// Response
{
  audio_url: string,
  duration_seconds: number,
  script: string,
  expires_at: string
}

// Schedule recurring briefing
POST /api/v1/notebooklm/audio/schedule
{
  notebook_id: string,
  briefing_type: string,
  schedule_cron: string,       // "0 6 * * 1-5" = weekdays 6am
  recipients: string[]         // user_ids to notify
}

// List scheduled briefings
GET /api/v1/notebooklm/audio/schedules
```

### Sharing

```typescript
// Share notebook
POST /api/v1/notebooklm/notebooks/:id/share
{
  user_id: string,
  role: 'reader' | 'writer' | 'owner'
}

// Remove share
DELETE /api/v1/notebooklm/notebooks/:id/share/:user_id

// Get shareable link (for client portal)
POST /api/v1/notebooklm/notebooks/:id/link
{
  expires_in: '24h' | '7d' | '30d',
  permissions: ['read', 'query']
}
```

---

## Edge Functions

### Sync Service

```typescript
// supabase/functions/notebooklm-sync/index.ts

import { createClient } from '@supabase/supabase-js'
import { NotebookLMClient } from './notebooklm-client'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const nlm = new NotebookLMClient({
    projectId: Deno.env.get('GOOGLE_CLOUD_PROJECT')!,
    credentials: JSON.parse(Deno.env.get('GOOGLE_CREDENTIALS')!)
  })

  // Get pending sync items
  const { data: queue } = await supabase
    .from('notebooklm_sync_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .order('priority', { ascending: true })
    .limit(10)

  for (const item of queue) {
    try {
      await supabase
        .from('notebooklm_sync_queue')
        .update({ status: 'processing', last_attempt_at: new Date() })
        .eq('id', item.id)

      switch (item.action) {
        case 'create_notebook':
          await handleCreateNotebook(nlm, supabase, item)
          break
        case 'add_source':
          await handleAddSource(nlm, supabase, item)
          break
        case 'update_source':
          await handleUpdateSource(nlm, supabase, item)
          break
        case 'delete_source':
          await handleDeleteSource(nlm, supabase, item)
          break
      }

      await supabase
        .from('notebooklm_sync_queue')
        .update({ status: 'completed', completed_at: new Date() })
        .eq('id', item.id)

    } catch (error) {
      const attempts = item.attempts + 1
      await supabase
        .from('notebooklm_sync_queue')
        .update({
          status: attempts >= item.max_attempts ? 'failed' : 'pending',
          attempts,
          error_message: error.message,
          scheduled_for: new Date(Date.now() + Math.pow(2, attempts) * 60000) // Exponential backoff
        })
        .eq('id', item.id)
    }
  }

  return new Response(JSON.stringify({ processed: queue.length }))
})
```

### Document Formatter

```typescript
// supabase/functions/notebooklm-format/index.ts

// Converts CMS data into NotebookLM-friendly documents

export async function formatJobForNotebook(job: Job): Promise<Document[]> {
  const docs: Document[] = []

  // Job Overview Document
  docs.push({
    title: `Job Overview: ${job.name}`,
    content: `
# ${job.name}

## Project Details
- **Address:** ${job.address}
- **Client:** ${job.client_name}
- **Contract Type:** ${job.contract_type}
- **Contract Value:** ${formatCurrency(job.contract_amount)}
- **Start Date:** ${job.start_date}
- **Target Completion:** ${job.target_completion_date}
- **Status:** ${job.status}

## Scope of Work
${job.scope_of_work}

## Key Contacts
- **Project Manager:** ${job.pm_name}
- **Superintendent:** ${job.super_name}
- **Client Contact:** ${job.client_contact}

## Budget Summary
- **Original Budget:** ${formatCurrency(job.original_budget)}
- **Approved Changes:** ${formatCurrency(job.approved_changes)}
- **Current Budget:** ${formatCurrency(job.current_budget)}
- **Costs to Date:** ${formatCurrency(job.costs_to_date)}
- **Remaining:** ${formatCurrency(job.remaining_budget)}
    `,
    type: 'markdown'
  })

  // Daily Logs as separate document
  if (job.daily_logs?.length) {
    docs.push({
      title: `Daily Logs: ${job.name}`,
      content: job.daily_logs.map(log => `
## ${log.date}
**Weather:** ${log.weather}
**Crew Size:** ${log.crew_count}

### Work Performed
${log.work_performed}

### Issues/Delays
${log.issues || 'None reported'}

### Notes
${log.notes || 'None'}
      `).join('\n\n---\n\n'),
      type: 'markdown'
    })
  }

  // Change Orders
  if (job.change_orders?.length) {
    docs.push({
      title: `Change Orders: ${job.name}`,
      content: formatChangeOrdersDocument(job.change_orders),
      type: 'markdown'
    })
  }

  // Invoices
  if (job.invoices?.length) {
    docs.push({
      title: `Invoice History: ${job.name}`,
      content: formatInvoicesDocument(job.invoices),
      type: 'markdown'
    })
  }

  return docs
}
```

### Webhook Handlers

```typescript
// Trigger sync when data changes

// supabase/functions/notebooklm-webhook/index.ts

Deno.serve(async (req) => {
  const payload = await req.json()
  const { type, table, record, old_record } = payload

  const supabase = createClient(...)

  // Determine which notebook(s) to update
  const notebooks = await findAffectedNotebooks(supabase, table, record)

  for (const notebook of notebooks) {
    // Queue sync job
    await supabase.from('notebooklm_sync_queue').insert({
      notebook_id: notebook.id,
      action: type === 'DELETE' ? 'delete_source' : 'update_source',
      payload: { table, record_id: record.id },
      priority: getPriority(table) // daily_logs = high, invoices = medium, etc.
    })
  }

  return new Response('ok')
})

// Database triggers to call webhook
/*
CREATE OR REPLACE FUNCTION notify_notebooklm_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.notebooklm_webhook_url'),
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END,
      'old_record', CASE WHEN TG_OP = 'UPDATE' THEN OLD ELSE NULL END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notebooklm_daily_logs
AFTER INSERT OR UPDATE OR DELETE ON daily_logs
FOR EACH ROW EXECUTE FUNCTION notify_notebooklm_change();

-- Repeat for: invoices, change_orders, purchase_orders, rfis, submittals, etc.
*/
```

---

## UI Integration

### Job Page - AI Assistant Panel

```tsx
// app/src/components/notebooklm/job-ai-panel.tsx

'use client'

import { useState } from 'react'
import { Send, Mic, Volume2, Sparkles, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface JobAIPanelProps {
  jobId: string
  jobName: string
}

export function JobAIPanel({ jobId, jobName }: JobAIPanelProps) {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const suggestedQuestions = [
    "What's our current budget status?",
    "Summarize recent daily logs",
    "What change orders are pending?",
    "Any safety concerns reported?",
    "What's the critical path status?",
  ]

  const handleAsk = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: query }])

    const response = await fetch('/api/v1/notebooklm/query', {
      method: 'POST',
      body: JSON.stringify({
        entity_type: 'job',
        entity_id: jobId,
        query,
        include_sources: true
      })
    })

    const data = await response.json()
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: data.answer,
      sources: data.sources
    }])
    setQuery('')
    setIsLoading(false)
  }

  const handleGenerateAudio = async () => {
    const response = await fetch('/api/v1/notebooklm/audio', {
      method: 'POST',
      body: JSON.stringify({
        entity_type: 'job',
        entity_id: jobId,
        briefing_type: 'project_status'
      })
    })
    const { audio_url } = await response.json()
    // Play audio or show player
  }

  return (
    <div className="bg-warm-0 border border-warm-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-warm-200 bg-warm-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-stone-600" />
          <span className="font-medium text-warm-800">Project Intelligence</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleGenerateAudio}>
          <Volume2 className="h-4 w-4 mr-1" />
          Audio Briefing
        </Button>
      </div>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <div className="p-4 space-y-2">
          <p className="text-sm text-warm-500">Ask anything about this project:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                className="text-xs px-3 py-1.5 rounded-full bg-stone-50 text-stone-700
                         hover:bg-stone-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="max-h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'text-right' : ''}>
            <div className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
              msg.role === 'user'
                ? 'bg-stone-700 text-white'
                : 'bg-warm-100 text-warm-800'
            }`}>
              {msg.content}
            </div>
            {msg.sources && (
              <div className="mt-2 space-y-1">
                {msg.sources.map((src, j) => (
                  <div key={j} className="flex items-center gap-1 text-xs text-warm-500">
                    <FileText className="h-3 w-3" />
                    <span>{src.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-warm-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask about this project..."
            className="flex-1 px-3 py-2 border border-warm-200 rounded-md
                     focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
          <Button onClick={handleAsk} disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Global Search with AI

```tsx
// Command palette enhancement

// In command palette, add AI query option:
{
  id: 'ai-query',
  name: 'Ask AI',
  icon: Sparkles,
  shortcut: ['ctrl', 'shift', 'a'],
  action: () => openAIQueryModal()
}

// AI Query Modal
function AIQueryModal() {
  return (
    <Dialog>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-stone-600" />
          <span className="font-semibold">Ask AI Anything</span>
        </div>

        <input
          placeholder="e.g., Which projects are over budget?"
          className="w-full px-4 py-3 text-lg border rounded-lg"
          autoFocus
        />

        <div className="space-y-2">
          <p className="text-sm text-warm-500">Search across:</p>
          <div className="flex flex-wrap gap-2">
            <Checkbox label="All Jobs" defaultChecked />
            <Checkbox label="Financial Data" defaultChecked />
            <Checkbox label="Vendors" />
            <Checkbox label="Company Knowledge Base" />
          </div>
        </div>
      </div>
    </Dialog>
  )
}
```

### Dashboard AI Insights Widget

```tsx
// Daily AI insights on dashboard

function AIInsightsWidget() {
  const { data: insights } = useQuery(['ai-insights'], fetchDailyInsights)

  return (
    <div className="bg-warm-0 border border-warm-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-warm-800 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-stone-600" />
          AI Insights
        </h3>
        <span className="text-xs text-warm-400">Updated 2h ago</span>
      </div>

      <div className="space-y-3">
        {insights?.map((insight, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-warm-50 rounded-lg">
            <div className={`w-2 h-2 rounded-full mt-1.5 ${
              insight.type === 'warning' ? 'bg-warning' :
              insight.type === 'success' ? 'bg-success' :
              'bg-info'
            }`} />
            <div>
              <p className="text-sm text-warm-700">{insight.message}</p>
              <p className="text-xs text-warm-500 mt-1">{insight.source}</p>
            </div>
          </div>
        ))}
      </div>

      <Button variant="ghost" className="w-full mt-4">
        <Volume2 className="h-4 w-4 mr-2" />
        Play Morning Briefing
      </Button>
    </div>
  )
}
```

### Client Portal AI

```tsx
// Clients can ask about their project

function ClientPortalAI({ projectId }: { projectId: string }) {
  const allowedQuestions = [
    "What's the current project status?",
    "When is the next milestone?",
    "What selections are pending my approval?",
    "Can I see recent photos?",
    "What's the weather forecast for the site?",
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-stone-600" />
        Ask About Your Project
      </h3>

      <div className="space-y-2">
        {allowedQuestions.map((q) => (
          <button
            key={q}
            className="w-full text-left px-4 py-3 rounded-lg bg-stone-50
                     hover:bg-stone-100 text-stone-700 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <input
          placeholder="Or ask your own question..."
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
    </div>
  )
}
```

---

## Use Cases by Role

### Project Manager

| Action | Command/Query |
|--------|---------------|
| Morning briefing | "Generate audio briefing for my active projects" |
| Budget check | "Which of my projects are over budget by more than 5%?" |
| Change order summary | "Summarize all pending change orders" |
| Vendor issue | "What issues have we had with ABC Plumbing?" |
| Risk assessment | "What are the top risks across my projects?" |
| Client prep | "Prepare me for my meeting with the Johnsons" |

### Superintendent

| Action | Command/Query |
|--------|---------------|
| Daily kickoff | "What's scheduled for today on Project X?" |
| Weather impact | "How will tomorrow's weather affect my schedule?" |
| Material check | "What deliveries are expected this week?" |
| Safety review | "Any safety concerns reported recently?" |
| Punch list | "What punch items need attention?" |

### Office Manager

| Action | Command/Query |
|--------|---------------|
| Invoice status | "Which invoices need my attention?" |
| Vendor payments | "What payments are due this week?" |
| Insurance check | "Which vendors have expiring insurance?" |
| Draw status | "What's the status of our current draws?" |

### Executive

| Action | Command/Query |
|--------|---------------|
| Portfolio overview | "Summarize profitability across all active projects" |
| Cash flow | "What's our cash position for the next 30 days?" |
| Risk report | "What are the top 5 risks across the company?" |
| Performance | "How is our schedule performance trending?" |

### Client (via Portal)

| Action | Command/Query |
|--------|---------------|
| Status update | "What happened on my project this week?" |
| Timeline | "When will the kitchen be complete?" |
| Budget | "How are we tracking against budget?" |
| Next steps | "What do I need to do next?" |

---

## Audio Briefing Templates

### Daily Standup (7am)

```markdown
# Daily Standup - {{date}}

## Weather
Today: {{weather_summary}}
Impact: {{weather_impact}}

## Active Projects
{{#each active_projects}}
### {{name}}
- Today's Focus: {{today_focus}}
- Crew: {{crew_count}} workers
- Key Task: {{key_task}}
- Issues: {{issues_or_none}}
{{/each}}

## Needs Attention
{{attention_items}}

## Schedule Conflicts
{{conflicts_or_none}}
```

### Weekly Summary (Friday 4pm)

```markdown
# Weekly Summary - Week of {{week_start}}

## Accomplishments
{{accomplishments}}

## Financial
- Revenue This Week: {{revenue}}
- Invoices Submitted: {{invoice_count}} (${{invoice_total}})
- Payments Received: {{payments}}

## Next Week Preview
{{next_week_preview}}

## Action Items
{{action_items}}
```

### Project Status (On-demand)

```markdown
# Project Status: {{project_name}}

## Overview
- Completion: {{percent_complete}}%
- Schedule: {{days_ahead_behind}} days {{ahead_or_behind}}
- Budget: {{budget_variance}}% {{over_or_under}}

## Recent Activity
{{recent_activity}}

## Key Milestones
{{upcoming_milestones}}

## Concerns
{{concerns_or_none}}

## Next Steps
{{next_steps}}
```

---

## Configuration & Settings

### Company Settings

```typescript
interface NotebookLMSettings {
  // Connection
  google_cloud_project: string
  service_account_key: string  // Encrypted
  location: 'us' | 'eu' | 'global'

  // Auto-creation
  auto_create_job_notebooks: boolean
  auto_create_client_notebooks: boolean
  auto_create_vendor_notebooks: boolean

  // Sync settings
  default_sync_frequency: 'realtime' | 'hourly' | 'daily'
  include_photos_by_default: boolean
  include_financials_by_default: boolean

  // Audio
  default_voice_style: 'conversational' | 'professional'
  daily_briefing_time: string  // "07:00"
  daily_briefing_recipients: string[]  // user_ids

  // Limits
  max_queries_per_user_per_day: number
  max_audio_minutes_per_month: number

  // Privacy
  exclude_patterns: string[]  // Regex patterns for sensitive content
  redact_financial_details: boolean
}
```

### Per-User Settings

```typescript
interface UserNotebookLMSettings {
  // Preferences
  preferred_query_style: 'concise' | 'detailed'
  audio_speed: 0.75 | 1.0 | 1.25 | 1.5

  // Notifications
  daily_briefing_enabled: boolean
  daily_briefing_time: string
  weekly_summary_enabled: boolean

  // Access
  accessible_notebook_types: ('job' | 'client' | 'vendor' | 'company_kb')[]
}
```

---

## Security & Compliance

### Access Control

```typescript
// Permission checks for NotebookLM operations

const notebookPermissions = {
  // Who can create notebooks
  'notebooklm:notebook:create': ['owner', 'admin', 'pm'],

  // Who can query
  'notebooklm:query:job': ['owner', 'admin', 'pm', 'superintendent', 'office'],
  'notebooklm:query:client': ['owner', 'admin', 'pm'],
  'notebooklm:query:vendor': ['owner', 'admin', 'pm', 'office'],
  'notebooklm:query:financial': ['owner', 'admin'],
  'notebooklm:query:company_kb': ['owner', 'admin', 'pm', 'superintendent', 'office'],

  // Who can generate audio
  'notebooklm:audio:generate': ['owner', 'admin', 'pm', 'superintendent'],

  // Who can configure
  'notebooklm:settings:manage': ['owner', 'admin'],
}

// Data scoping - users only see notebooks for jobs they're assigned to
async function getAccessibleNotebooks(userId: string) {
  const user = await getUser(userId)

  if (['owner', 'admin'].includes(user.role)) {
    return getAllCompanyNotebooks(user.company_id)
  }

  const assignedJobs = await getJobAssignments(userId)
  return getNotebooksForJobs(assignedJobs.map(j => j.job_id))
}
```

### Data Redaction

```typescript
// Before sending to NotebookLM, redact sensitive data

const redactionRules = [
  // SSN patterns
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN REDACTED]' },

  // Bank accounts
  { pattern: /\b\d{8,17}\b/g, replacement: '[ACCOUNT REDACTED]' },

  // Credit cards
  { pattern: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, replacement: '[CARD REDACTED]' },

  // Passwords in configs
  { pattern: /password["']?\s*[:=]\s*["']?[^"'\s]+/gi, replacement: '[PASSWORD REDACTED]' },
]

function redactSensitiveData(content: string): string {
  let redacted = content
  for (const rule of redactionRules) {
    redacted = redacted.replace(rule.pattern, rule.replacement)
  }
  return redacted
}
```

### Audit Logging

```typescript
// Log all NotebookLM operations

await auditLog.create({
  action: 'notebooklm.query',
  user_id: userId,
  resource_type: 'notebook',
  resource_id: notebookId,
  details: {
    query: query.substring(0, 100), // Truncate for privacy
    notebook_type: notebook.entity_type,
    response_tokens: response.tokens_used,
  }
})
```

---

## Cost Management

### Google Cloud Pricing (Estimated)

| Operation | Cost | Monthly Estimate |
|-----------|------|------------------|
| NotebookLM Enterprise | $20/user/month | $200 (10 users) |
| API Calls | ~$0.01/query | $50 (5,000 queries) |
| Storage | $0.02/GB/month | $10 (500GB docs) |
| Audio Generation | $0.10/minute | $100 (1,000 minutes) |
| **Total Estimate** | | **~$360/month** |

### Usage Limits

```typescript
// Enforce usage limits

const usageLimits = {
  queries_per_user_per_day: 100,
  queries_per_company_per_day: 1000,
  audio_minutes_per_company_per_month: 500,
  max_document_size_mb: 50,
  max_sources_per_notebook: 100,
}

async function checkUsageLimits(companyId: string, userId: string, operation: string) {
  const usage = await getUsageStats(companyId, userId)

  if (operation === 'query') {
    if (usage.user_queries_today >= usageLimits.queries_per_user_per_day) {
      throw new Error('Daily query limit reached')
    }
    if (usage.company_queries_today >= usageLimits.queries_per_company_per_day) {
      throw new Error('Company daily query limit reached')
    }
  }

  if (operation === 'audio') {
    if (usage.company_audio_minutes_month >= usageLimits.audio_minutes_per_company_per_month) {
      throw new Error('Monthly audio limit reached')
    }
  }
}
```

---

## Implementation Phases

### Phase 7.1: Foundation (2 weeks)
- [ ] Set up Google Cloud project and credentials
- [ ] Create database tables
- [ ] Implement NotebookLM client wrapper
- [ ] Build sync queue processor
- [ ] Create basic API endpoints

### Phase 7.2: Job Integration (2 weeks)
- [ ] Auto-create notebooks for jobs
- [ ] Sync job documents (contracts, logs, photos)
- [ ] Build Job AI Panel component
- [ ] Implement query API
- [ ] Add to job detail page

### Phase 7.3: Audio Briefings (1 week)
- [ ] Implement audio generation API
- [ ] Create briefing templates
- [ ] Build audio player component
- [ ] Add scheduled briefings
- [ ] Mobile-friendly audio UI

### Phase 7.4: Expanded Coverage (2 weeks)
- [ ] Client notebooks
- [ ] Vendor intelligence notebooks
- [ ] Company knowledge base
- [ ] Cross-notebook queries
- [ ] Dashboard AI insights widget

### Phase 7.5: Client Portal (1 week)
- [ ] Client-facing AI interface
- [ ] Scoped questions/answers
- [ ] Project status audio
- [ ] Secure sharing links

### Phase 7.6: Polish & Scale (1 week)
- [ ] Usage analytics dashboard
- [ ] Cost monitoring
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Documentation

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Query Response Time | < 3 seconds | p95 latency |
| Sync Latency | < 5 minutes | Time from change to NotebookLM |
| User Adoption | 80% of PMs | Weekly active users |
| Query Accuracy | 90% helpful | User feedback |
| Audio Engagement | 50% listen rate | Briefings played / generated |
| Time Saved | 2 hrs/PM/week | User survey |

---

## Related Modules

- **Module 44: AI Engine** - Core AI infrastructure
- **Module 36: Lead Pipeline** - Lead notebooks
- **Module 28: Client Portal** - Client AI access
- **Module 15: Daily Logs** - Field data sync
- **Module 10: Invoices** - Financial data sync

---

*Module 99: NotebookLM Integration — Making construction intelligence conversational*
