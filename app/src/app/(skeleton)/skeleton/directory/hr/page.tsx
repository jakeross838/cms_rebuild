'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { HrWorkforcePreview } from '@/components/skeleton/previews/hr-workforce-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HrWorkforcePage(): React.ReactElement {
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
      {activeTab === 'preview' ? (
        <HrWorkforcePreview />
      ) : (
        <PageSpec
          title="HR & Workforce Management"
          phase="Phase 5 - Full Platform"
          planFile="docs/modules/34-hr-workforce.md"
          description="Complete workforce management — visual org chart, hiring pipeline, training & certification tracking, performance reviews, workload balancer, compensation benchmarking, and team communication tools."
          workflow={['Org chart shows company hierarchy from owner to field workers', 'Hiring pipeline tracks open positions through Posted → Applicants → Interviews → Offer → Hired', 'Training tracker monitors 7+ certifications per employee with expiration alerts', 'Performance reviews scheduled with category-based scoring', 'Workload balancer visualizes capacity by PM/superintendent', 'Compensation benchmarking compares salaries to market averages', 'AI identifies retention risks and suggests redistributions']}
          features={['Visual Org Chart with drag-and-drop reorganization', 'Hiring Pipeline (Kanban-style stages)', 'Training & Certification Tracker with expiration alerts', 'Performance Review System with category scoring', 'Workload Balancer showing hours/week and capacity %', 'Compensation Benchmarking against industry averages', 'Team Communication tools', 'Employee Handbook management']}
          connections={[
            { name: 'Time Tracking', type: 'input', description: 'Hours worked feed into workload analysis' },
            { name: 'Scheduling', type: 'bidirectional', description: 'Capacity data informs job assignment decisions' },
            { name: 'Safety & Compliance', type: 'input', description: 'Certification requirements flow from OSHA/safety module' },
          ]}
          aiFeatures={[
            { name: 'Workload Prediction', description: 'Forecasts team capacity based on upcoming job schedules and historical patterns' },
            { name: 'Retention Risk Scoring', description: 'Flags employees below market compensation or showing overwork patterns' },
            { name: 'Training Compliance', description: 'Auto-alerts when certifications approach expiration with renewal scheduling' },
          ]}
        />
      )}
    </div>
  )
}
