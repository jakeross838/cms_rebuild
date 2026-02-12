'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { ClientsPreview } from '@/components/skeleton/previews/clients-preview'
import { Eye, BookOpen } from 'lucide-react'
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
        'Client profiles with contact info',
        'Multiple contacts per client (spouse, assistant)',
        'Communication preferences (email, phone, text)',
        'Project history with all past/current jobs',
        'Selection preferences learned over time',
        'Communication style preferences',
        'Important dates (birthdays, anniversaries)',
        'Referral source tracking',
        'Notes and interaction log',
        'Document storage (signed contracts)',
        'Client portal access management',
        'Satisfaction scores',
        'Referral tracking',
        'VIP/priority flagging',
      ]}
      connections={[
        { name: 'Leads', type: 'input', description: 'Converted leads become clients' },
        { name: 'Jobs', type: 'output', description: 'Jobs linked to clients' },
        { name: 'Contracts', type: 'output', description: 'Contracts with clients' },
        { name: 'Invoices/Draws', type: 'output', description: 'Billing to clients' },
        { name: 'Client Portal', type: 'output', description: 'Portal access' },
        { name: 'Communications', type: 'bidirectional', description: 'All communications logged' },
        { name: 'Email Marketing', type: 'output', description: 'Marketing campaigns' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'name', type: 'string', required: true, description: 'Client name/entity' },
        { name: 'type', type: 'string', description: 'Individual, Couple, Company' },
        { name: 'email', type: 'string', description: 'Primary email' },
        { name: 'phone', type: 'string', description: 'Primary phone' },
        { name: 'address', type: 'jsonb', description: 'Mailing address' },
        { name: 'contacts', type: 'jsonb', description: 'Array of contact persons' },
        { name: 'communication_preference', type: 'string', description: 'Email, Phone, Text' },
        { name: 'source', type: 'string', description: 'How they found you' },
        { name: 'referred_by', type: 'uuid', description: 'Referring client' },
        { name: 'tier', type: 'string', description: 'Standard, Premium, Luxury' },
        { name: 'total_contract_value', type: 'decimal', description: 'Lifetime value' },
        { name: 'projects_count', type: 'integer', description: 'Number of projects' },
        { name: 'preferences', type: 'jsonb', description: 'Learned preferences' },
        { name: 'notes', type: 'text', description: 'Internal notes' },
        { name: 'portal_enabled', type: 'boolean', description: 'Has portal access' },
      ]}
      aiFeatures={[
        {
          name: 'Preference Learning',
          description: 'Learns client preferences from selections and feedback. "Client prefers modern aesthetic, premium materials, quick decisions."',
          trigger: 'Continuous'
        },
        {
          name: 'Communication Intelligence',
          description: 'Analyzes communication patterns. "Client responds fastest to texts, prefers morning contact."',
          trigger: 'On communication'
        },
        {
          name: 'Satisfaction Prediction',
          description: 'Predicts satisfaction based on engagement. "Low portal activity during active construction may indicate dissatisfaction."',
          trigger: 'Continuous monitoring'
        },
        {
          name: 'Referral Likelihood',
          description: 'Scores likelihood to refer. "High satisfaction, referred 2 friends, likely to refer again."',
          trigger: 'Post-project'
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
