'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { PreConstructionPreview } from '@/components/skeleton/previews/pre-construction-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PreConstructionPage(): React.ReactElement {
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
        <PreConstructionPreview />
      ) : (
        <PageSpec
          title="Pre-Construction Management"
          phase="Phase 2 - Construction Core"
          planFile="docs/modules/32-permitting-inspections.md"
          description="Everything that happens between contract signing and ground breaking — lot feasibility, zoning compliance, HOA/ARB submissions, architect coordination, design reviews, engineering tracking, permits, soil/geotech, utility connections, and the pre-con checklist."
          workflow={['Contract signed — pre-con phase activates', 'Lot/Site Feasibility Engine analyzes buildability (zoning, flood, setbacks, max height)', 'HOA/ARB submission tracked with deadlines and approval status', 'Architect coordination hub manages design revisions and review cycles', 'Engineering tracking (structural, truss, energy, geotech) with deliverable status', 'Permit Application Manager tracks submittals, fees, and timelines', 'Pre-Con Checklist ensures all 12 items complete before mobilization', 'Design Budget Tracker monitors pre-con spending vs budget', 'AI flags risks and predicts permit approval timeline']}
          features={['Lot/Site Feasibility Engine with zoning, flood zone, setback analysis', 'Zoning Compliance checker with local code database', 'HOA/ARB Tracker with submission deadlines and approval workflow', 'Architect Coordination Hub with revision tracking', 'Design Review Workflow with AI-powered markup deduplication', 'Engineering Tracking (structural, truss, energy, geotech)', 'Permit Application Manager with fee calculator', 'Soil/Geotech report tracking', 'Pre-Con Meeting System with agenda templates', 'Pre-Con Checklist (12 items across permits, site, admin, planning)', 'Spec Development workspace', 'Impact Fee Calculator', 'Utility Connection Tracker', 'Site Due Diligence Package', 'Design Budget Tracker with category breakdown']}
          connections={[
            { name: 'Estimating Engine', type: 'input', description: 'Feasibility analysis informs early cost estimates' },
            { name: 'Scheduling', type: 'output', description: 'Permit timelines feed into project schedule' },
            { name: 'Document Storage', type: 'bidirectional', description: 'Stores and retrieves plans, reports, permits' },
          ]}
          aiFeatures={[
            { name: 'Lot Feasibility Analysis', description: 'Analyzes zoning, flood zone, setbacks, and buildable area to score lot viability' },
            { name: 'Permit Timeline Prediction', description: 'Predicts approval timeline based on jurisdiction history and submission completeness' },
            { name: 'Design Review Coordinator', description: 'Deduplicates 23 reviewer markups into 14 actionable items for architect' },
          ]}
        />
      )}
    </div>
  )
}
