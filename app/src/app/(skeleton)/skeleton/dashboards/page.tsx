'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { DashboardsPreview } from '@/components/skeleton/previews/dashboards-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Data Sources', 'Widget Selection', 'Dashboard Design', 'Share'
]

export default function DashboardsSkeleton() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button onClick={() => setActiveTab('preview')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <Eye className="h-4 w-4" />UI Preview
        </button>
        <button onClick={() => setActiveTab('spec')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'spec' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <BookOpen className="h-4 w-4" />Specification
        </button>
      </div>
      {activeTab === 'preview' ? <DashboardsPreview /> : <PageSpec
      title="Custom Dashboards"
      phase="Phase 6 - Advanced"
      planFile="views/advanced/DASHBOARDS.md"
      description="Build custom dashboards by dragging and dropping widgets from any data source in the system. Create executive overviews, project manager dashboards, financial summaries, and more. Share dashboards with team members or embed in client portal."
      workflow={constructionWorkflow}
      features={[
        'Dashboard builder with drag-and-drop widget layout (GAP-621)',
        'Widget library from all system modules with category filtering (GAP-622)',
        'Widget sizes: 1x1, 2x1, 2x2 responsive grid cells',
        'Chart types: Bar, Line, Pie, Gauge, Table, KPI cards with sparklines',
        'Real-time data refresh with configurable interval (GAP-627)',
        'Date range filters (global and per-widget) (GAP-625)',
        'Global project filter across all widgets (GAP-623)',
        'Comparison toggle: this period vs last period (GAP-626)',
        'Custom KPI calculations',
        'Role-based default templates: Owner, PM, Superintendent, Sales, Accounting, Field (spec 4.3)',
        'Personal, team, and company visibility levels',
        'Share with team members',
        'Embed specific dashboards in client portal',
        'Export dashboard as PDF with builder branding (GAP-628)',
        'Schedule email reports from dashboards',
        'Mobile-responsive layouts',
        'Widget permission gating - only shows widgets user has access to',
        'Error boundary per widget - graceful fallback on failure (spec 4.3 edge case)',
        'Widget versioning for platform update migration',
        'Favorites and default pinning per user',
      ]}
      connections={[
        { name: 'All Modules', type: 'input', description: 'Data from any system module' },
        { name: 'Reports', type: 'input', description: 'Report data as widgets' },
        { name: 'Client Portal', type: 'output', description: 'Dashboards can be embedded' },
        { name: 'Email', type: 'output', description: 'Scheduled dashboard reports' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'name', type: 'string', required: true, description: 'Dashboard name' },
        { name: 'description', type: 'text', description: 'Dashboard description' },
        { name: 'layout', type: 'jsonb', required: true, description: 'Widget positions and sizes' },
        { name: 'widgets', type: 'jsonb', required: true, description: 'Widget configurations' },
        { name: 'filters', type: 'jsonb', description: 'Global filter settings' },
        { name: 'refresh_interval', type: 'integer', description: 'Auto-refresh seconds' },
        { name: 'is_template', type: 'boolean', description: 'Is a template dashboard' },
        { name: 'created_by', type: 'uuid', description: 'Creator user ID' },
        { name: 'shared_with', type: 'uuid[]', description: 'Users with access' },
        { name: 'is_public', type: 'boolean', description: 'Visible to all users' },
        { name: 'embed_in_portal', type: 'boolean', description: 'Show in client portal' },
        { name: 'portal_job_ids', type: 'uuid[]', description: 'Jobs that see this dashboard' },
      ]}
      aiFeatures={[
        {
          name: 'Smart Widget Suggestions',
          description: 'Suggests relevant widgets based on role: "For project manager dashboard, recommended widgets: Active job status, Budget health by job, Today\'s schedule, Pending approvals."',
          trigger: 'On dashboard creation'
        },
        {
          name: 'Anomaly Highlighting',
          description: 'Automatically highlights unusual data: "Budget widget showing red for Smith job—15% over projected. Click to drill down."',
          trigger: 'Real-time monitoring'
        },
        {
          name: 'Auto-Layout',
          description: 'Suggests optimal widget arrangement: "Based on your widgets, recommended layout: KPIs top row, charts middle, tables bottom for best readability."',
          trigger: 'On widget addition'
        },
        {
          name: 'Insight Generation',
          description: 'Generates narrative insights: "Executive Summary: 5 jobs active, all on schedule. Cash position strong. One vendor payment overdue. Overall project health: Excellent."',
          trigger: 'On dashboard view'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Dashboards                      [+ New Dashboard] [Browse Templates]│
├─────────────────────────────────────────────────────────────────────┤
│ My Dashboards | Shared with Me | Templates                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ★ FAVORITES                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📊 Executive Overview                      Last viewed: Today   │ │
│ │    5 widgets | Auto-refresh: 5 min                              │ │
│ │    [Open] [Edit] [Share] [Schedule Report]                      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ 📁 MY DASHBOARDS                                                    │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 💰 Financial Summary                       Updated: 2 hrs ago   │ │
│ │    Cash flow, AR aging, AP due, Budget vs Actual                │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🏗 Active Projects                         Updated: Live        │ │
│ │    Job status cards, schedule timeline, photo feed              │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ═══════════════ PREVIEW: Executive Overview ══════════════════════ │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                    │
│ │ Active  │ │ Revenue │ │ Margin  │ │ Cash    │                    │
│ │ Jobs: 5 │ │ $4.2M   │ │ 18.5%   │ │ $850K   │                    │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘                    │
│ ┌─────────────────────────┐ ┌─────────────────────────┐            │
│ │ Budget Health by Job    │ │ Schedule Status         │            │
│ │ ████ Smith 95%         │ │ ● On Track: 4           │            │
│ │ ████ Johnson 102% ⚠    │ │ ● At Risk: 1            │            │
│ │ ████ Davis 88%         │ │ ● Behind: 0             │            │
│ └─────────────────────────┘ └─────────────────────────┘            │
├─────────────────────────────────────────────────────────────────────┤
│ AI Insight: "All metrics healthy. Johnson job 2% over budget due   │
│ to approved change order. Cash runway: 45+ days at current pace."  │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
