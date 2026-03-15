'use client'
import dynamic from 'next/dynamic'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { cn } from '@/lib/utils'
const DashboardsPreview = dynamic(() => import('@/components/skeleton/previews/dashboards-preview').then(mod => mod.DashboardsPreview), { ssr: false })

export default function DashboardsPage() {
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
      phase="Phase 2 - Analytics"
      planFile="views/company/DASHBOARDS.md"
      description="Create and manage custom dashboards for different roles and purposes. Build personalized views of your business data with drag-and-drop widgets and real-time metrics."
      workflow={['Select Template', 'Add Widgets', 'Configure', 'Share', 'Monitor']}
      features={[
        'Dashboard templates',
        'Drag-and-drop widgets',
        'KPI cards',
        'Charts and graphs',
        'Data tables',
        'Real-time updates',
        'Role-based dashboards',
        'Personal dashboards',
        'Team dashboards',
        'Scheduled reports',
        'Export and print',
        'Mobile responsive',
        'Widget library',
        'Custom calculations',
      ]}
      connections={[
        { name: 'All Data Sources', type: 'input', description: 'Pull from any module' },
        { name: 'Users', type: 'output', description: 'User assignments' },
        { name: 'Reports', type: 'output', description: 'Export as reports' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'name', type: 'string', required: true, description: 'Dashboard name' },
        { name: 'description', type: 'text', description: 'Description' },
        { name: 'owner_id', type: 'uuid', required: true, description: 'Creator' },
        { name: 'visibility', type: 'string', description: 'Personal, Team, Company' },
        { name: 'layout', type: 'jsonb', description: 'Widget layout' },
        { name: 'widgets', type: 'jsonb', description: 'Widget configurations' },
        { name: 'refresh_rate', type: 'integer', description: 'Auto-refresh seconds' },
        { name: 'is_default', type: 'boolean', description: 'Default for role' },
        { name: 'role', type: 'string', description: 'Associated role' },
      ]}
      aiFeatures={[
        {
          name: 'Dashboard Suggestions',
          description: 'Recommends widgets. "Based on your role (PM), suggest adding: Active jobs, Overdue tasks, Cash position widgets."',
          trigger: 'On dashboard create'
        },
        {
          name: 'Insight Highlights',
          description: 'Surfaces important data. "Unusual: AR over 60 days up 40%. Adding alert widget to your dashboard."',
          trigger: 'On data change'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Custom Dashboards                              [+ Create Dashboard] │
├─────────────────────────────────────────────────────────────────────┤
│ MY DASHBOARDS                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📊 Executive Overview                    ⭐ Default              │ │
│ │    Revenue, margins, cash position, active jobs                 │ │
│ │    Last viewed: Today 8:00 AM                                   │ │
│ │    [Open] [Edit] [Share] [Set as Default]                      │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 📊 Operations Daily                                              │ │
│ │    Today's schedule, crew assignments, deliveries               │ │
│ │    Last viewed: Yesterday                                       │ │
│ │    [Open] [Edit] [Share]                                        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ COMPANY DASHBOARDS                                                  │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📊 Financial Dashboard                   Shared by: Jake        │ │
│ │ 📊 Sales Pipeline                        Shared by: Jake        │ │
│ │ 📊 Project Status Board                  Shared by: Mike        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ TEMPLATES                                                           │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📋 Owner/Builder    📋 Project Manager    📋 Superintendent    │ │
│ │ 📋 Sales            📋 Accounting         📋 Field Team        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
