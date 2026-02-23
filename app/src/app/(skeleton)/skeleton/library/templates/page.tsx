'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { TemplatesPreview } from '@/components/skeleton/previews/templates-preview'
import { cn } from '@/lib/utils'

export default function DocumentTemplatesPage() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
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

      {/* Content */}
      {activeTab === 'preview' ? (
        <TemplatesPreview />
      ) : (
        <PageSpec
          title="Document Templates"
      phase="Phase 0 - Foundation"
      planFile="views/library/DOCUMENT_TEMPLATES.md"
      description="Standard document templates for contracts, proposals, POs, change orders, and other business forms. Customize with your branding and standard terms. Templates auto-populate with project data when generated."
      workflow={['Create Template', 'Add Variables', 'Generate Document', 'Send/Sign']}
      features={[
        'Template categories: Contracts, Proposals, POs, COs, Letters',
        'Rich text editor with formatting',
        'Variable placeholders ({{client_name}}, {{project_address}})',
        'Company branding (logo, colors, fonts)',
        'Conditional sections',
        'Multiple versions/variants',
        'Preview with sample data',
        'PDF generation',
        'E-signature field placement',
        'Template sharing across team',
        'Clone and customize',
        'Version history',
      ]}
      connections={[
        { name: 'Contracts', type: 'output', description: 'Contract documents generated' },
        { name: 'Proposals', type: 'output', description: 'Proposal documents generated' },
        { name: 'Purchase Orders', type: 'output', description: 'PO documents generated' },
        { name: 'Change Orders', type: 'output', description: 'CO documents generated' },
        { name: 'Settings', type: 'input', description: 'Company branding applied' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'name', type: 'string', required: true, description: 'Template name' },
        { name: 'category', type: 'string', required: true, description: 'Template type' },
        { name: 'content', type: 'text', required: true, description: 'Template HTML/content' },
        { name: 'variables', type: 'jsonb', description: 'Available variables' },
        { name: 'is_default', type: 'boolean', description: 'Default for category' },
        { name: 'is_active', type: 'boolean', required: true, description: 'Available for use' },
        { name: 'version', type: 'integer', description: 'Version number' },
      ]}
      aiFeatures={[
        {
          name: 'Smart Variable Suggestions',
          description: 'Suggests relevant variables based on template type.',
          trigger: 'On template editing'
        },
        {
          name: 'Clause Library',
          description: 'Suggests standard clauses based on project type.',
          trigger: 'On template creation'
        },
      ]}
          mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Document Templates                              [+ New Template]    │
├─────────────────────────────────────────────────────────────────────┤
│ Categories: Contracts | Proposals | POs | Change Orders | Letters   │
├─────────────────────────────────────────────────────────────────────┤
│ CONTRACTS                                                           │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ★ Standard Construction Contract                    Default     │ │
│ │   Cost-plus with GMP | 24 pages | Last updated: Jan 15          │ │
│ │   Variables: 45 | Signature fields: 4                           │ │
│ │   [Edit] [Preview] [Clone] [Set Default]                        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Fixed Price Contract                                            │ │
│ │   Lump sum | 18 pages | Last updated: Dec 10                    │ │
│ │   [Edit] [Preview] [Clone]                                      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
`}
        />
      )}
    </div>
  )
}
