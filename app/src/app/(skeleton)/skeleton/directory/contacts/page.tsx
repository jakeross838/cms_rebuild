'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { ContactsPreview } from '@/components/skeleton/previews/contacts-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ContactsPage() {
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
      {activeTab === 'preview' ? <ContactsPreview /> : <PageSpec
      title="Contacts"
      phase="Phase 1 - Operations"
      planFile="views/directory/CONTACTS.md"
      description="General contact directory for people who aren't clients, vendors, or employees. Track architects, engineers, inspectors, realtors, attorneys, and other professionals you work with regularly."
      workflow={['Add Contact', 'Categorize', 'Link to Projects', 'Maintain Relationships']}
      features={[
        'Contact profiles with multiple methods',
        'Category classification (Architect, Engineer, Inspector, etc.)',
        'Company/firm association',
        'Project associations',
        'Notes and interaction history',
        'Favorite/frequently used contacts',
        'Quick actions (call, email, text)',
        'Business card scanning',
        'Import from phone contacts',
        'Duplicate detection',
        'Contact sharing with team',
        'Birthday/anniversary reminders',
      ]}
      connections={[
        { name: 'Jobs', type: 'bidirectional', description: 'Contacts linked to projects' },
        { name: 'RFIs', type: 'output', description: 'RFIs sent to contacts' },
        { name: 'Submittals', type: 'output', description: 'Submittals routed to contacts' },
        { name: 'Communications', type: 'bidirectional', description: 'Communication log' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'first_name', type: 'string', required: true, description: 'First name' },
        { name: 'last_name', type: 'string', required: true, description: 'Last name' },
        { name: 'company', type: 'string', description: 'Company/firm name' },
        { name: 'title', type: 'string', description: 'Job title' },
        { name: 'category', type: 'string', required: true, description: 'Contact type' },
        { name: 'email', type: 'string', description: 'Email address' },
        { name: 'phone', type: 'string', description: 'Phone number' },
        { name: 'mobile', type: 'string', description: 'Mobile number' },
        { name: 'address', type: 'jsonb', description: 'Business address' },
        { name: 'notes', type: 'text', description: 'Notes' },
        { name: 'is_favorite', type: 'boolean', description: 'Frequently used' },
        { name: 'projects', type: 'uuid[]', description: 'Associated projects' },
      ]}
      aiFeatures={[
        {
          name: 'Duplicate Detection',
          description: 'Identifies potential duplicate contacts during entry.',
          trigger: 'On contact creation'
        },
        {
          name: 'Contact Suggestions',
          description: 'Suggests relevant contacts for project roles. "For architect: John Smith has worked on 5 similar coastal projects."',
          trigger: 'On project setup'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Contacts                                          [+ Add Contact]   │
├─────────────────────────────────────────────────────────────────────┤
│ Search: [_______________]  Category: [All ▾]    [★ Favorites Only] │
├─────────────────────────────────────────────────────────────────────┤
│ ARCHITECTS                                                          │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ★ John Smith, AIA                        ABC Architecture       │ │
│ │   john@abcarch.com | (555) 222-3333                             │ │
│ │   Projects: Smith Residence, Johnson Beach House                │ │
│ │   [Call] [Email] [View Profile]                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ENGINEERS                                                           │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Bob Wilson, PE                           Coastal Engineering    │ │
│ │   bob@coastaleng.com | (555) 444-5555                           │ │
│ │   Specialty: Structural - Coastal/Elevated                      │ │
│ │   [Call] [Email] [View Profile]                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ INSPECTORS                                                          │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ County Building Dept - Tom Davis                                │ │
│ │   tdavis@county.gov | (555) 666-7777                            │ │
│ │   [Call] [Email] [View Profile]                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Total: 35 contacts | Categories: 8 | Favorites: 12                 │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
