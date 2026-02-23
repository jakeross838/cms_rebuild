'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { ClientsPreview } from '@/components/skeleton/previews/clients-preview'
import { cn } from '@/lib/utils'

export default function ClientsPage() {
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
      {activeTab === 'preview' ? <ClientsPreview /> :
    <PageSpec
      title="Clients"
      phase="Phase 0 - Foundation"
      planFile="views/directory/CLIENTS.md"
      description="Client relationship management with AI-powered intelligence. Track contact information, communication preferences, project history, and learned preferences. The system learns what each client values to personalize their experience."
      workflow={['Add Client', 'Track Projects', 'Learn Preferences', 'Maintain Relationship']}
      features={[
        'Client profiles with full contact info (email, phone, mobile, address)',
        'Multiple contacts per client (spouse, assistant, designer)',
        'Communication preferences: email, phone, text, in-person',
        'Client tiers: standard, premium, luxury',
        'Referral source tracking with attribution',
        'Referral network tracking (who referred whom, lifetime value)',
        'Project history with all past/current/warranty jobs',
        'AI-learned selection preferences (style, brands, materials)',
        'AI decision speed prediction (fast, moderate, deliberate)',
        'AI budget sensitivity analysis (low, moderate, high)',
        'Communication sentiment monitoring',
        'Satisfaction scoring and prediction',
        'Client portal access management and activity tracking',
        'Portal engagement analytics: login frequency, sections viewed',
        'Pending actions tracker (selections, approvals, documents)',
        'VIP/priority tagging',
        'Notes and interaction log',
        'Guest invite management (client can invite view-only users)',
        'Client merge for duplicate detection',
        'Import from CSV or QuickBooks',
        'Warranty period tracking with predicted service needs',
      ]}
      connections={[
        { name: 'Leads', type: 'input', description: 'Converted leads become clients' },
        { name: 'Jobs', type: 'bidirectional', description: 'Client linked to multiple jobs' },
        { name: 'Contracts', type: 'output', description: 'Contracts with clients' },
        { name: 'Invoices/Draws', type: 'output', description: 'Billing and payment tracking' },
        { name: 'Client Portal', type: 'output', description: 'Portal access and engagement analytics' },
        { name: 'Selections', type: 'input', description: 'Selection decisions feed preference learning' },
        { name: 'Communications', type: 'bidirectional', description: 'All communications logged' },
        { name: 'Warranty', type: 'output', description: 'Warranty service requests' },
        { name: 'QuickBooks', type: 'bidirectional', description: 'Synced as customers' },
        { name: 'Client Intelligence', type: 'output', description: 'AI-learned preferences and patterns' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'contact_type', type: 'string', required: true, description: 'client (from contacts table)' },
        { name: 'display_name', type: 'string', required: true, description: 'Computed: company_name or first+last' },
        { name: 'first_name', type: 'string', description: 'First name' },
        { name: 'last_name', type: 'string', description: 'Last name' },
        { name: 'company_name', type: 'string', description: 'Company entity name' },
        { name: 'email', type: 'string', description: 'Primary email' },
        { name: 'phone', type: 'string', description: 'Primary phone' },
        { name: 'mobile', type: 'string', description: 'Mobile phone' },
        { name: 'address', type: 'jsonb', description: 'Mailing address fields' },
        { name: 'client_source', type: 'string', description: 'referral | website | realtor | repeat | social_media' },
        { name: 'referred_by_id', type: 'uuid', description: 'FK to referring contact' },
        { name: 'tags', type: 'string[]', description: 'Flexible categorization tags' },
        { name: 'tier', type: 'string', description: 'standard | premium | luxury' },
        { name: 'communication_preference', type: 'string', description: 'email | phone | text | in-person' },
        { name: 'portal_enabled', type: 'boolean', description: 'Has portal access' },
        { name: 'portal_user_id', type: 'uuid', description: 'Portal auth user' },
        { name: 'total_contract_value', type: 'decimal', description: 'Computed lifetime value' },
        { name: 'referrals_given', type: 'integer', description: 'Number of referrals provided' },
        { name: 'satisfaction_score', type: 'decimal', description: 'Composite satisfaction metric' },
        { name: 'ai_decision_speed', type: 'string', description: 'fast | moderate | deliberate' },
        { name: 'ai_budget_sensitivity', type: 'string', description: 'low | moderate | high' },
        { name: 'ai_style_preferences', type: 'jsonb', description: 'Learned finish/brand/style preferences' },
        { name: 'notes', type: 'text', description: 'Internal notes' },
      ]}
      aiFeatures={[
        {
          name: 'Preference Learning',
          description: 'Learns client preferences from selections and feedback. "Client prefers modern aesthetic, white/gray palette, premium brands (Sub-Zero/Wolf)."',
          trigger: 'Continuous from selection history'
        },
        {
          name: 'Communication Intelligence',
          description: 'Analyzes response times and preferred methods. "Sarah responds within 2 hours to text but 2 days to email. Best contact: text to Sarah."',
          trigger: 'On each communication'
        },
        {
          name: 'Decision Speed Prediction',
          description: 'Learns how quickly clients make decisions. "Client takes average 12 days to approve selections. Send reminder at day 7."',
          trigger: 'From approval history'
        },
        {
          name: 'Satisfaction Prediction',
          description: 'Monitors portal engagement for satisfaction signals. "No portal login in 14 days during active construction -- consider proactive outreach."',
          trigger: 'Continuous monitoring'
        },
        {
          name: 'Referral Attribution',
          description: 'Tracks referral networks. "The Smiths referred Davis and Wilson families (2 closed contracts, $3.2M total). High-value relationship."',
          trigger: 'From lead source tracking'
        },
        {
          name: 'Duplicate Detection',
          description: 'Identifies potential duplicates based on name, email, phone, and address similarities. Suggests merge when confidence is high.',
          trigger: 'On client create'
        },
        {
          name: 'Warranty Prediction',
          description: 'Predicts warranty needs based on selections and system age. "Expect HVAC service (12 months), appliance calls (6-18 months)."',
          trigger: 'Post-completion analysis'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Clients                                          [+ Add Client]     │
├─────────────────────────────────────────────────────────────────────┤
│ Search: [_______________]  Status: [All ▾]  Sort: [Name ▾]         │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 👤 John & Sarah Smith                              ★ VIP        │ │
│ │    john@email.com | (555) 123-4567 | Prefers: Text             │ │
│ │    Projects: 2 ($4.2M total) | Current: Smith Residence        │ │
│ │    Preferences: Modern, Premium tier, Quick decisions          │ │
│ │    [View Profile] [New Project] [Send Message]                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 👤 Robert Johnson                                               │ │
│ │    bob@company.com | (555) 987-6543 | Prefers: Email           │ │
│ │    Projects: 1 ($1.85M) | Current: Johnson Beach House         │ │
│ │    Referred by: Smith | Source: Client referral                │ │
│ │    [View Profile] [New Project] [Send Message]                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Total: 24 clients | Active Projects: 5 | Lifetime Value: $18.5M   │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
