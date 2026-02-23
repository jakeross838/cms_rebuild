'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { FeatureRegistryPreview } from '@/components/skeleton/previews/feature-registry-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FeaturesPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
      {/* Preview/Spec toggle tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'preview'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <Eye className="h-4 w-4" />
          UI Preview
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'spec'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Specification
        </button>
      </div>

      {activeTab === 'preview' ? (
        <FeatureRegistryPreview />
      ) : (
        <PageSpec
          title="Feature Registry"
          phase="Phase 2 - Configuration"
          planFile="docs/modules/02-configuration-engine.md"
          description="Central registry of all 205 RossOS capabilities. Companies can toggle features on/off, view descriptions, filter by category/status, and see which features use self-learning AI. Supports smart onboarding with AI-powered setup walkthrough."
          workflow={[
            'Admin navigates to Settings > Features',
            'Views all 205 features organized by 10 categories',
            'Searches or filters by status, self-learning, or keyword',
            'Toggles features on/off per company',
            'Uses Enable All / Disable All per category',
            'Reviews Smart Onboarding walkthrough for new setup',
          ]}
          features={[
            '205 toggleable features across 10 categories',
            'Search by name, description, or category',
            'Filter by status (Ready / Planned / Future)',
            'Filter self-learning AI features only',
            'Category-level enable/disable all',
            'Collapsible category sections',
            'Phase indicator per feature (1-3)',
            'Effort sizing (S/M/L/XL)',
            'Smart Onboarding walkthrough section',
            'AI Feature Intelligence panel',
            'Real-time stats dashboard',
          ]}
          connections={[
            { name: 'Company Settings', type: 'input', description: 'Parent page — general company configuration' },
            { name: 'RBAC / Permissions', type: 'input', description: 'Feature access gated by role' },
            { name: 'Subscription Billing', type: 'bidirectional', description: 'Feature tiers tied to plan' },
            { name: 'All Modules', type: 'output', description: 'Feature flags control module visibility' },
          ]}
          dataFields={[
            { name: 'id', type: 'number', description: 'Unique feature identifier' },
            { name: 'cat', type: 'string', description: 'Feature category name' },
            { name: 'name', type: 'string', description: 'Feature display name' },
            { name: 'desc', type: 'string', description: 'Detailed description of what the feature does' },
            { name: 'phase', type: 'number', description: 'Build phase (1-3)' },
            { name: 'status', type: 'enum', description: 'ready | planned | future' },
            { name: 'effort', type: 'enum', description: 'S | M | L | XL' },
            { name: 'selfLearn', type: 'boolean', description: 'Whether this feature uses self-learning AI' },
            { name: 'enabled', type: 'boolean', description: 'Per-company toggle state (stored in company_features table)' },
          ]}
          aiFeatures={[
            { name: 'Smart Feature Recommendations', description: 'AI suggests which features to enable based on company profile' },
            { name: 'Usage-Based Suggestions', description: 'After 30 days, AI identifies which disabled features would save the most time' },
            { name: 'Self-Learning Dashboard', description: 'Track AI accuracy improvements across all self-learning features' },
          ]}
        />
      )}
    </div>
  )
}
