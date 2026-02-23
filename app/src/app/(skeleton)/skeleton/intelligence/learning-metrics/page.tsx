'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { LearningMetricsPreview } from '@/components/skeleton/previews/learning-metrics-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LearningMetricsPage(): React.ReactElement {
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
        <LearningMetricsPreview />
      ) : (
        <PageSpec
          title="Self-Learning Metrics Dashboard"
          phase="Phase 2 - Intelligence"
          planFile="docs/architecture/universal-comms-and-learning.md"
          description="67 metrics tracked across trades, materials, and jobs. Every datapoint feeds back into estimating, scheduling, bidding, and Trade Intuition AI. Shows exactly what the AI learns, how accurate it is, and how it improves over time."
          workflow={['Trade completes work on a job', 'System captures 45 metrics automatically (financial, schedule, quality, communication, safety)', 'Material performance tracked across 12 dimensions', 'Job aggregate metrics calculated (10 dimensions)', 'AI compares predictions to actuals', 'Variance feeds back into all AI modules', 'Accuracy improves with every completed job']}
          features={['45 trade performance metrics per instance', '12 material tracking metrics', '10 job aggregate metrics', '7 contextual tags per trade (project type, complexity, price range, region, season, crew lead, brands)', 'AI Maturity progression (Cold Start → Learning → Calibrated → Expert)', 'Cross-module learning flow visualization', 'Real-time learning event feed', 'Prediction accuracy tracking over time', 'Variance analysis with trend indicators', '4 training source monitoring (Industry, Historical, Corrections, Community)']}
          connections={[
            { name: 'All Job Data', type: 'input', description: 'Budget, schedule, quality, vendor, and communication data from every module' },
            { name: 'Trade Intuition AI', type: 'output', description: 'Feeds calibrated metrics into the 7-Layer Thinking Engine' },
            { name: 'Estimating / Bidding / Scheduling AI', type: 'output', description: 'Variance data recalibrates future predictions' },
          ]}
          aiFeatures={[
            { name: 'Trade Performance Scoring', description: 'Composite vendor score from 45 metrics — financial accuracy, schedule reliability, quality, communication, and safety' },
            { name: 'Anomaly Detection', description: 'Flags metrics that deviate significantly from historical patterns — catches problems before they compound' },
            { name: 'Cross-Module Pattern Detection', description: 'Discovers correlations across modules — e.g., vendors who are slow but have 40% fewer punch items' },
          ]}
        />
      )}
    </div>
  )
}
