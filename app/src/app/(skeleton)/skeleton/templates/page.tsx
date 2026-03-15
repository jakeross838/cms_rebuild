'use client'
import dynamic from 'next/dynamic'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { cn } from '@/lib/utils'
const TemplatesPreview = dynamic(() => import('@/components/skeleton/previews/templates-preview').then(mod => mod.TemplatesPreview), { ssr: false })

const constructionWorkflow = [
  'Template Library', 'Clause Assembly', 'Contract Generation', 'E-Signature', 'Marketplace'
]

export default function TemplatesSkeleton() {
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
          title="Document Templates & Marketplace"
          phase="Phase 5 - Full Platform / Phase 6 - Marketplace"
          planFile="views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md"
          description="Contract template management with WYSIWYG editor, variable field placeholders, clause library, state-specific language inserts, and version tracking. Templates support all contract types (cost-plus, GMP, fixed-price, T&M, hybrid) and party types (owner, subcontractor, vendor, pre-con). Includes a marketplace for discovering, installing, and publishing templates with ratings, regional packs, and professional services."
          workflow={constructionWorkflow}
          features={[
            'Template library organized by category (Contracts, Proposals, POs, COs, Subcontracts, Pre-Con Agreements, Letters)',
            'WYSIWYG template editor with variable field placeholders ({{client_name}}, {{project_name}}, etc.)',
            'Clause library with categories, tags, and drag-and-drop clause assembly',
            'State-specific language inserts (mechanic lien, right-to-cure, retainage, deposits)',
            'Contract type templates: Cost-Plus, GMP, Fixed Price, T&M, Hybrid',
            'Party-specific templates: Owner contracts, Subcontracts, Vendor POs, Pre-Con agreements',
            'Version history with diff comparison between template versions',
            'Clone and customize templates',
            'Mark templates as default per category',
            'Legal review tracking with reviewed date and compliance status',
            'Template variable validation against required field list',
            'PDF generation with builder branding, logo, and colors',
            'Signature field placement for multi-party e-signature routing',
            'Template usage analytics (which templates used most, conversion rates)',
            'Template favorites and search across all templates',
            'Import/export templates between builders',
            'Marketplace: browse and install templates from other builders and publishers',
            'Marketplace: one-click installation with customization on install',
            'Marketplace: publisher accounts for consultants and industry experts',
            'Marketplace: ratings, reviews, and install counts',
            'Marketplace: regional template packs (FL hurricane, coastal, mountain, etc.)',
            'Marketplace: pricing tiers (free, paid) with Stripe Connect for publishers',
            'Marketplace: version management and automatic update notifications',
            'Marketplace: professional services listings for custom template creation',
            'Publish builder templates to marketplace with revenue sharing',
          ]}
          connections={[
            { name: 'Contracts & E-Signature', type: 'output', description: 'Templates generate contracts for signing (Module 38)' },
            { name: 'Estimating Engine', type: 'input', description: 'Estimate data populates template variables (Module 20)' },
            { name: 'Template Marketplace', type: 'bidirectional', description: 'Browse, install, and publish templates (Module 48)' },
            { name: 'Document Storage', type: 'output', description: 'Generated PDFs stored (Module 6)' },
            { name: 'DocuSign', type: 'output', description: 'Signature fields map to e-signature routing' },
            { name: 'State Compliance', type: 'input', description: 'State-specific clause requirements' },
            { name: 'White-Label & Branding', type: 'input', description: 'Builder branding for PDF generation (Module 44)' },
            { name: 'Change Orders', type: 'output', description: 'CO templates for scope modifications (Module 17)' },
          ]}
          dataFields={[
            { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
            { name: 'builder_id', type: 'uuid', required: true, description: 'FK to builders (multi-tenant)' },
            { name: 'name', type: 'string', required: true, description: 'Template name' },
            { name: 'category', type: 'string', required: true, description: 'contracts, proposals, purchase_orders, change_orders, subcontracts, precon, letters' },
            { name: 'contract_type', type: 'string', description: 'cost_plus, gmp, fixed_price, t_and_m, hybrid' },
            { name: 'party_type', type: 'string', description: 'owner, subcontractor, vendor, precon' },
            { name: 'body_html', type: 'text', required: true, description: 'Template HTML content with variable placeholders' },
            { name: 'variables', type: 'jsonb', description: 'Declared variable fields with types and defaults' },
            { name: 'clauses', type: 'jsonb', description: 'Ordered list of clause IDs from clause library' },
            { name: 'signature_fields', type: 'jsonb', description: 'Signature placement configuration for e-signature routing' },
            { name: 'page_count', type: 'integer', description: 'Number of pages when rendered' },
            { name: 'state_applicability', type: 'text[]', description: 'State codes where template is applicable' },
            { name: 'version', type: 'string', required: true, description: 'Semantic version number' },
            { name: 'is_default', type: 'boolean', description: 'Default template for this category' },
            { name: 'is_active', type: 'boolean', required: true, description: 'Currently available for use' },
            { name: 'is_legally_reviewed', type: 'boolean', description: 'Has been reviewed by legal counsel' },
            { name: 'reviewed_date', type: 'date', description: 'Date of last legal review' },
            { name: 'usage_count', type: 'integer', description: 'Times used to generate documents' },
            { name: 'source', type: 'string', description: 'builder, platform, marketplace' },
            { name: 'marketplace_listing_id', type: 'uuid', description: 'FK to marketplace listing if installed from marketplace' },
            { name: 'created_by', type: 'uuid', description: 'User who created' },
            { name: 'created_at', type: 'timestamp', required: true, description: 'When created' },
            { name: 'updated_at', type: 'timestamp', required: true, description: 'When last modified' },
          ]}
          aiFeatures={[
            {
              name: 'Clause Recommendations',
              description: 'Recommends clauses based on project type: "Coastal elevated home - recommend adding: Hurricane provisions, pile warranty clause, flood insurance requirements."',
              trigger: 'On template use for contract generation'
            },
            {
              name: 'State Compliance Check',
              description: 'Scans template for state-specific compliance: "New SC mechanic lien statute took effect Jan 2026. Clause 14.3 needs update for compliance."',
              trigger: 'On template edit and periodic review'
            },
            {
              name: 'Variable Completeness',
              description: 'Identifies missing or outdated variable fields: "Template references {{deposit_pct}} but no deposit clause is included. Add deposit provisions?"',
              trigger: 'On template save'
            },
            {
              name: 'Marketplace Suggestions',
              description: 'Recommends marketplace templates: "Florida Builder Starter Pack (234 installs, 4.8 stars) includes FL-specific right-to-cure, Chapter 558, and hurricane provisions you may need."',
              trigger: 'On browse marketplace'
            },
            {
              name: 'Template Optimization',
              description: 'Analyzes usage patterns: "Your Standard Cost-Plus template is used 128 times. Contracts using this template have a 92% sign rate. Consider publishing to marketplace."',
              trigger: 'On template review'
            },
            {
              name: 'Duplicate Detection',
              description: 'Detects overlapping templates: "Fixed Price Residential and Standard Residential share 85% clause overlap. Consider consolidating into one template with conditional sections."',
              trigger: 'On template creation'
            },
          ]}
          mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Document Templates & Marketplace     [+ New Template] [Publish]     │
├─────────────────────────────────────────────────────────────────────┤
│ Tabs: All | Contracts | Proposals | POs | COs | Subcontracts |      │
│       Pre-Con | Letters | Marketplace                                │
├─────────────────────────────────────────────────────────────────────┤
│ Builder: 8 | Marketplace: 2 | Reviewed: 4 | Usage: 926x             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────┐ │
│ │ ★ Standard Cost-Plus │ │ Fixed Price Res.     │ │ T&M Contract │ │
│ │  with GMP            │ │  Default | Reviewed  │ │  v1.4        │ │
│ │  Default | ✓ Reviewed│ │  18p | 38 vars       │ │  20p | 24 cl │ │
│ │  24p | 34 clauses    │ │  SC, NC              │ │  Used 32x    │ │
│ │  SC, NC, GA | v3.2   │ │  Used 64x            │ │              │ │
│ │  Used 128x           │ │                      │ │  [Preview]   │ │
│ │  ⚡ SC lien update   │ │  [Preview][Clone]    │ │  [Clone]     │ │
│ │  [Preview][Clone]    │ │  [Edit]              │ │  [Edit]      │ │
│ │  [Edit]              │ │                      │ │              │ │
│ └──────────────────────┘ └──────────────────────┘ └──────────────┘ │
│                                                                     │
│ ── MARKETPLACE ─────────────────────────────────────────────────    │
│ ┌──────────────────────┐ ┌──────────────────────┐                  │
│ │ 🛒 FL Builder Pack   │ │ 🛒 Luxury Custom     │                  │
│ │  by RossOS Official  │ │  by Elite Consulting  │                  │
│ │  ★ 4.8 | 234 installs│ │  ★ 4.9 | 87 installs │                  │
│ │  FL | Free           │ │  National | $149      │                  │
│ │  [Preview] [Install] │ │  [Preview] [Buy $149] │                  │
│ └──────────────────────┘ └──────────────────────┘                  │
├─────────────────────────────────────────────────────────────────────┤
│ AI: SC mechanic lien statute updated - 2 templates need clause      │
│ updates. "FL Builder Starter Pack" trending (234 installs).         │
└─────────────────────────────────────────────────────────────────────┘
`}
        />
      )}
    </div>
  )
}
