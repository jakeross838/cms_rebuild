'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { SafetyPreview } from '@/components/skeleton/previews/safety-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SafetyPage() {
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
      {activeTab === 'preview' ? <SafetyPreview /> : <PageSpec
      title="Safety Management"
      phase="Phase 2 - Compliance"
      planFile="views/compliance/SAFETY.md"
      description="Manage job site safety programs, incident reporting, toolbox talks, and safety training. Track OSHA compliance, maintain safety documentation, and build a culture of safety across all projects."
      workflow={['Plan Safety', 'Document', 'Train', 'Monitor', 'Report']}
      features={[
        'Safety program templates',
        'Site-specific safety plans',
        'Toolbox talk scheduling',
        'Toolbox talk sign-in sheets',
        'Incident reporting',
        'Near-miss tracking',
        'Safety inspection checklists',
        'OSHA log maintenance',
        'Safety training records',
        'PPE compliance tracking',
        'Safety meeting minutes',
        'Corrective action tracking',
        'Safety metrics dashboard',
        'Emergency contact lists',
        'Safety document library',
      ]}
      connections={[
        { name: 'Jobs', type: 'bidirectional', description: 'Job safety plans' },
        { name: 'Daily Logs', type: 'bidirectional', description: 'Safety observations' },
        { name: 'Team', type: 'bidirectional', description: 'Training records' },
        { name: 'Vendors', type: 'input', description: 'Sub safety compliance' },
        { name: 'Document Storage', type: 'output', description: 'Safety docs' },
        { name: 'Calendar', type: 'output', description: 'Safety meetings' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'type', type: 'string', required: true, description: 'Incident, Training, Meeting, Inspection' },
        { name: 'job_id', type: 'uuid', description: 'Related job' },
        { name: 'date', type: 'date', required: true, description: 'Date of record' },
        { name: 'description', type: 'text', description: 'Details' },
        { name: 'severity', type: 'string', description: 'For incidents' },
        { name: 'participants', type: 'jsonb', description: 'Who attended/involved' },
        { name: 'corrective_action', type: 'text', description: 'Actions taken' },
        { name: 'follow_up_date', type: 'date', description: 'Follow-up needed' },
        { name: 'status', type: 'string', description: 'Open, Closed' },
        { name: 'osha_recordable', type: 'boolean', description: 'OSHA 300 log' },
        { name: 'documents', type: 'jsonb', description: 'Attached files' },
        { name: 'created_by', type: 'uuid', description: 'Reported by' },
      ]}
      aiFeatures={[
        {
          name: 'Hazard Identification',
          description: 'Identifies risks from daily logs. "Daily log mentions wet conditions. Recommend: Slip hazard toolbox talk for tomorrow."',
          trigger: 'On daily log entry'
        },
        {
          name: 'Training Gap Analysis',
          description: 'Identifies training needs. "3 crew members on Smith job missing fall protection training. Schedule before next phase."',
          trigger: 'On job staffing'
        },
        {
          name: 'Trend Analysis',
          description: 'Spots safety patterns. "Near-misses up 40% this month. Common factor: afternoon timeframe. Consider fatigue management."',
          trigger: 'Weekly analysis'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Safety Management                              [+ Report Incident]  │
├─────────────────────────────────────────────────────────────────────┤
│ SAFETY DASHBOARD                                                    │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
│ │ Days Without │ │ YTD          │ │ Near Misses  │ │ Training     ││
│ │ Incident     │ │ Incidents    │ │ This Month   │ │ Compliance   ││
│ │     127      │ │      2       │ │      5       │ │     94%      ││
│ │ ✓ Record!    │ │ ▼ -1 vs LY   │ │ ▲ +2 review  │ │ ⚠ 3 gaps     ││
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│ UPCOMING SAFETY ACTIVITIES                                          │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📋 Toolbox Talk - Fall Protection          Tomorrow 7:00 AM     │ │
│ │    Smith Residence | Required: All crew                        │ │
│ │    [View Materials] [Print Sign-In]                            │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 📋 Site Safety Inspection                  Wed 9:00 AM          │ │
│ │    Johnson Beach House | Inspector: Mike Smith                 │ │
│ │    [View Checklist] [Start Inspection]                         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ RECENT NEAR-MISSES (Review Required)                               │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ⚠ Unsecured ladder - Smith Residence - Jan 25                  │ │
│ │   Reported by: Mike Smith | Status: Under Review               │ │
│ │   Corrective action: Ladder securing protocol added            │ │
│ │   [View Details] [Close]                                       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ 💡 AI: "Consider heat safety toolbox talk - forecast 95°F this week"│
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
