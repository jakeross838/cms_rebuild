# Backend Support System Feature Specification

**Priority:** 4 - Scale
**Dependencies:** Communications, Plaude AI
**Status:** Planning

---

## Overview

Admin-only support system where BuildDesk admins can access company dashboards to provide support, with full audit logging of all actions. Supports multi-company view, secure access controls, and AI-assisted diagnostics.

---

## User Stories

1. **As a BuildDesk admin**, I want to view any company's dashboard to help troubleshoot
2. **As an admin**, I want all my support actions logged for compliance
3. **As an admin**, I want AI to help diagnose common issues
4. **As an admin**, I want to impersonate users to see exactly what they see
5. **As a company owner**, I want to see an audit log of any admin access

---

## Database Schema

```sql
-- Support admin roles
CREATE TABLE support_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,

  -- Access level
  role TEXT NOT NULL DEFAULT 'support', -- 'support', 'senior_support', 'admin', 'superadmin'

  -- Permissions
  can_view_companies BOOLEAN DEFAULT true,
  can_impersonate BOOLEAN DEFAULT false,
  can_modify_data BOOLEAN DEFAULT false,
  can_access_billing BOOLEAN DEFAULT false,
  can_manage_admins BOOLEAN DEFAULT false,

  -- Activity
  last_active_at TIMESTAMPTZ,
  total_sessions INTEGER DEFAULT 0,
  total_tickets_resolved INTEGER DEFAULT 0,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ
);

-- Support tickets
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number SERIAL UNIQUE,

  -- Requester
  company_id UUID NOT NULL REFERENCES companies(id),
  requester_id UUID REFERENCES users(id),
  requester_email TEXT NOT NULL,
  requester_name TEXT,

  -- Ticket details
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'bug', 'feature_request', 'question', 'billing', 'account', 'data'

  -- Priority & status
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'waiting_customer', 'waiting_internal', 'resolved', 'closed'

  -- Assignment
  assigned_to UUID REFERENCES support_admins(id),
  assigned_at TIMESTAMPTZ,

  -- Resolution
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES support_admins(id),

  -- SLA tracking
  first_response_at TIMESTAMPTZ,
  first_response_sla_met BOOLEAN,

  -- Satisfaction
  satisfaction_rating INTEGER, -- 1-5
  satisfaction_feedback TEXT,

  -- Context
  url TEXT, -- URL where issue occurred
  browser TEXT,
  device TEXT,
  screenshot_urls TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket messages
CREATE TABLE support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id),

  -- Sender
  sender_type TEXT NOT NULL, -- 'customer', 'support', 'system'
  sender_id UUID,
  sender_name TEXT NOT NULL,

  -- Content
  content TEXT NOT NULL,
  content_html TEXT,

  -- Attachments
  attachments JSONB DEFAULT '[]',

  -- Visibility
  is_internal BOOLEAN DEFAULT false, -- Internal notes not visible to customer

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support access sessions
CREATE TABLE support_access_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  admin_id UUID NOT NULL REFERENCES support_admins(id),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Session details
  reason TEXT NOT NULL, -- Why accessing this company
  ticket_id UUID REFERENCES support_tickets(id),

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- What was accessed
  pages_visited TEXT[] DEFAULT '{}',
  actions_taken INTEGER DEFAULT 0,

  -- Impersonation
  impersonated_user_id UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support action log (detailed audit)
CREATE TABLE support_action_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  session_id UUID NOT NULL REFERENCES support_access_sessions(id),
  admin_id UUID NOT NULL REFERENCES support_admins(id),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Action details
  action_type TEXT NOT NULL, -- 'view', 'search', 'export', 'modify', 'impersonate'
  action_category TEXT NOT NULL, -- 'navigation', 'data_access', 'data_modification', 'user_action'

  -- What was accessed/modified
  resource_type TEXT, -- 'job', 'user', 'invoice', etc.
  resource_id UUID,
  resource_name TEXT,

  -- Before/after for modifications
  previous_value JSONB,
  new_value JSONB,

  -- Context
  page_url TEXT,
  ip_address TEXT,
  user_agent TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company support settings
CREATE TABLE company_support_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id),

  -- Access controls
  allow_support_access BOOLEAN DEFAULT true,
  require_access_approval BOOLEAN DEFAULT false,
  notify_on_access BOOLEAN DEFAULT true,
  notify_emails TEXT[],

  -- Data access restrictions
  restrict_billing_access BOOLEAN DEFAULT false,
  restrict_user_pii BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support access requests (when approval required)
CREATE TABLE support_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  admin_id UUID NOT NULL REFERENCES support_admins(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  ticket_id UUID REFERENCES support_tickets(id),

  reason TEXT NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),

  -- Approval
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'denied', 'expired'
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  denial_reason TEXT,

  -- Expiry
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- Common issues database (for AI diagnostics)
CREATE TABLE support_known_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Issue details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  symptoms TEXT[], -- Common symptoms/errors
  error_codes TEXT[],

  -- Categorization
  category TEXT NOT NULL,
  affected_modules TEXT[],

  -- Resolution
  resolution_steps TEXT NOT NULL,
  resolution_time_estimate TEXT,
  requires_admin_action BOOLEAN DEFAULT false,

  -- AI matching
  embedding vector(1536), -- For semantic search
  keywords TEXT[],

  -- Stats
  occurrence_count INTEGER DEFAULT 0,
  last_occurred_at TIMESTAMPTZ,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_support_tickets_company ON support_tickets(company_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_support_access_admin ON support_access_sessions(admin_id);
CREATE INDEX idx_support_access_company ON support_access_sessions(company_id);
CREATE INDEX idx_support_action_log_session ON support_action_log(session_id);
CREATE INDEX idx_support_action_log_company ON support_action_log(company_id, created_at DESC);
```

---

## Support Dashboard Implementation

```typescript
// lib/support/support-session.ts

interface SupportSession {
  id: string
  adminId: string
  companyId: string
  reason: string
  ticketId?: string
  startedAt: Date
  pagesVisited: string[]
  actionsTaken: number
}

export class SupportSessionManager {
  private session: SupportSession | null = null

  async startSession(params: {
    adminId: string
    companyId: string
    reason: string
    ticketId?: string
  }): Promise<SupportSession> {
    // Check if admin has permission
    const admin = await getAdmin(params.adminId)
    if (!admin || !admin.is_active) {
      throw new Error('Admin not authorized')
    }

    // Check company settings
    const settings = await getCompanySupportSettings(params.companyId)
    if (!settings.allow_support_access) {
      throw new Error('Company has disabled support access')
    }

    if (settings.require_access_approval) {
      // Check for approved request
      const approved = await checkApprovedRequest(params.adminId, params.companyId)
      if (!approved) {
        throw new Error('Access requires company approval')
      }
    }

    // Create session
    const { data: session } = await supabase.from('support_access_sessions').insert({
      admin_id: params.adminId,
      company_id: params.companyId,
      reason: params.reason,
      ticket_id: params.ticketId,
    }).select().single()

    this.session = session

    // Notify company if enabled
    if (settings.notify_on_access) {
      await notifyCompanyOfAccess(params.companyId, admin, params.reason)
    }

    return session
  }

  async logAction(params: {
    actionType: 'view' | 'search' | 'export' | 'modify' | 'impersonate'
    actionCategory: 'navigation' | 'data_access' | 'data_modification' | 'user_action'
    resourceType?: string
    resourceId?: string
    resourceName?: string
    previousValue?: Record<string, unknown>
    newValue?: Record<string, unknown>
    pageUrl?: string
    metadata?: Record<string, unknown>
  }): Promise<void> {
    if (!this.session) {
      throw new Error('No active support session')
    }

    await supabase.from('support_action_log').insert({
      session_id: this.session.id,
      admin_id: this.session.adminId,
      company_id: this.session.companyId,
      action_type: params.actionType,
      action_category: params.actionCategory,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      resource_name: params.resourceName,
      previous_value: params.previousValue,
      new_value: params.newValue,
      page_url: params.pageUrl,
      ip_address: await getClientIP(),
      user_agent: navigator.userAgent,
      metadata: params.metadata,
    })

    // Update session stats
    await supabase.from('support_access_sessions').update({
      pages_visited: [...this.session.pagesVisited, params.pageUrl].filter(Boolean),
      actions_taken: this.session.actionsTaken + 1,
    }).eq('id', this.session.id)
  }

  async endSession(): Promise<void> {
    if (!this.session) return

    const duration = Math.floor((Date.now() - this.session.startedAt.getTime()) / 1000)

    await supabase.from('support_access_sessions').update({
      ended_at: new Date().toISOString(),
      duration_seconds: duration,
    }).eq('id', this.session.id)

    this.session = null
  }
}

// Impersonation
export async function startImpersonation(
  sessionManager: SupportSessionManager,
  userId: string
): Promise<void> {
  const admin = await getCurrentAdmin()
  if (!admin.can_impersonate) {
    throw new Error('Admin cannot impersonate users')
  }

  await sessionManager.logAction({
    actionType: 'impersonate',
    actionCategory: 'user_action',
    resourceType: 'user',
    resourceId: userId,
    metadata: { started: true },
  })

  // Set impersonation context
  await supabase.from('support_access_sessions').update({
    impersonated_user_id: userId,
  }).eq('id', sessionManager.session!.id)
}
```

---

## AI Diagnostics

```typescript
// lib/support/ai-diagnostics.ts

interface DiagnosticResult {
  possibleIssues: KnownIssue[]
  suggestedActions: string[]
  relevantDocs: string[]
  confidence: number
}

export async function diagnoseIssue(
  companyId: string,
  description: string,
  errorLogs?: string[],
  screenshotUrls?: string[]
): Promise<DiagnosticResult> {
  // 1. Search known issues by semantic similarity
  const embedding = await generateEmbedding(description)
  const { data: knownIssues } = await supabase.rpc('search_known_issues', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 5,
  })

  // 2. Analyze error logs if provided
  let logAnalysis: string | undefined
  if (errorLogs?.length) {
    logAnalysis = await analyzeErrorLogs(errorLogs)
  }

  // 3. Get company health indicators
  const healthCheck = await runCompanyHealthCheck(companyId)

  // 4. Use Claude for diagnosis
  const diagnosis = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 2048,
    system: `You are a BuildDesk support AI helping diagnose issues.
You have access to known issues, error logs, and system health data.
Provide specific, actionable diagnostic information.`,
    messages: [{
      role: 'user',
      content: `Diagnose this issue:

DESCRIPTION: ${description}

${knownIssues?.length ? `SIMILAR KNOWN ISSUES:
${knownIssues.map(i => `- ${i.title}: ${i.description}`).join('\n')}` : ''}

${logAnalysis ? `LOG ANALYSIS:
${logAnalysis}` : ''}

SYSTEM HEALTH:
${JSON.stringify(healthCheck, null, 2)}

Provide:
1. Most likely cause
2. Suggested resolution steps
3. Any additional diagnostics needed
4. Confidence level (0-100)`
    }]
  })

  return parseDiagnosticResponse(diagnosis.content[0].text, knownIssues)
}

async function runCompanyHealthCheck(companyId: string): Promise<HealthCheck> {
  const checks = await Promise.all([
    checkDatabaseHealth(companyId),
    checkStorageHealth(companyId),
    checkRecentErrors(companyId),
    checkUserActivity(companyId),
    checkIntegrationStatus(companyId),
  ])

  return {
    database: checks[0],
    storage: checks[1],
    recentErrors: checks[2],
    userActivity: checks[3],
    integrations: checks[4],
  }
}
```

---

## Support Dashboard UI

```tsx
// app/(admin)/support/page.tsx

'use client'

import { useState, useEffect } from 'react'
import {
  Search, Building, Users, AlertCircle, Clock, MessageSquare,
  Eye, Shield, Activity
} from 'lucide-react'

export default function SupportDashboard() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [activeSession, setActiveSession] = useState<SupportSession | null>(null)

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Header */}
      <header className="bg-stone-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6" />
            <h1 className="text-xl font-semibold">BuildDesk Support</h1>
          </div>
          {activeSession && (
            <div className="flex items-center gap-2 px-3 py-1 bg-warning/20 text-warning rounded-full text-sm">
              <Eye className="h-4 w-4" />
              Viewing: {selectedCompany?.name}
            </div>
          )}
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Open Tickets */}
        <aside className="w-80 border-r border-warm-200 bg-warm-0 h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-4 border-b border-warm-200">
            <h2 className="font-semibold text-warm-800">Open Tickets</h2>
          </div>
          <div className="divide-y divide-warm-100">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 hover:bg-warm-50 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-warm-500">#{ticket.ticket_number}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    ticket.priority === 'urgent' ? 'bg-error/10 text-error' :
                    ticket.priority === 'high' ? 'bg-warning/10 text-warning' :
                    'bg-warm-100 text-warm-600'
                  }`}>
                    {ticket.priority}
                  </span>
                </div>
                <p className="text-sm font-medium text-warm-800 truncate">{ticket.subject}</p>
                <p className="text-xs text-warm-500 mt-1">{ticket.requester_name}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Company Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-400" />
              <input
                type="text"
                placeholder="Search companies by name, ID, or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-warm-200 rounded-lg"
              />
            </div>
          </div>

          {/* Company Grid */}
          <div className="grid grid-cols-3 gap-4">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onAccess={() => handleAccessCompany(company)}
              />
            ))}
          </div>
        </main>
      </div>

      {/* Access Modal */}
      {selectedCompany && !activeSession && (
        <AccessModal
          company={selectedCompany}
          onConfirm={handleStartSession}
          onCancel={() => setSelectedCompany(null)}
        />
      )}
    </div>
  )
}

function CompanyCard({ company, onAccess }: { company: Company; onAccess: () => void }) {
  return (
    <div className="bg-warm-0 border border-warm-200 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
          <Building className="h-5 w-5 text-stone-600" />
        </div>
        <div>
          <h3 className="font-medium text-warm-800">{company.name}</h3>
          <p className="text-xs text-warm-500">{company.domain}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div>
          <p className="text-lg font-semibold text-warm-800">{company.user_count}</p>
          <p className="text-xs text-warm-500">Users</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-warm-800">{company.job_count}</p>
          <p className="text-xs text-warm-500">Jobs</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-warm-800">{company.open_tickets}</p>
          <p className="text-xs text-warm-500">Tickets</p>
        </div>
      </div>

      <button
        onClick={onAccess}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-600"
      >
        <Eye className="h-4 w-4" />
        Access Dashboard
      </button>
    </div>
  )
}

function AccessModal({
  company,
  onConfirm,
  onCancel,
}: {
  company: Company
  onConfirm: (reason: string, ticketId?: string) => void
  onCancel: () => void
}) {
  const [reason, setReason] = useState('')
  const [ticketId, setTicketId] = useState('')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-warm-0 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-warm-800 mb-4">Access Company Dashboard</h2>

        <div className="mb-4">
          <p className="text-sm text-warm-600">
            You are about to access <strong>{company.name}</strong>'s dashboard.
            All actions will be logged and visible to the company.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1">
              Reason for access *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe why you need to access this company..."
              className="w-full px-3 py-2 border border-warm-200 rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1">
              Related Ticket (optional)
            </label>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="Ticket #"
              className="w-full px-3 py-2 border border-warm-200 rounded-lg"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onCancel} className="px-4 py-2 text-warm-600">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason, ticketId)}
            disabled={!reason.trim()}
            className="px-4 py-2 bg-stone-700 text-white rounded-lg disabled:opacity-50"
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## Implementation Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | Week 1 | Database schema, admin roles |
| Phase 2 | Week 2 | Session management, action logging |
| Phase 3 | Week 3 | Support dashboard UI |
| Phase 4 | Week 4 | AI diagnostics, known issues |

---

*BuildDesk Feature Specification v1.0*
