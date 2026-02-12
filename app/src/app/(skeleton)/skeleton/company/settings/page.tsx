'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { CompanySettingsPreview } from '@/components/skeleton/previews/company-settings-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CompanySettingsPage() {
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
      {activeTab === 'preview' ? <CompanySettingsPreview /> : <PageSpec
      title="Company Settings"
      phase="Phase 0 - Foundation"
      planFile="views/company/SETTINGS.md"
      description="Configure company-wide settings. Company information, branding, default values, notification preferences, and system configuration. The control center for customizing RossOS to your business."
      workflow={['Review Settings', 'Modify', 'Save', 'Apply']}
      features={[
        'Company profile',
        'Logo and branding',
        'Business information',
        'Default markup rates',
        'Tax settings',
        'Payment terms defaults',
        'Notification preferences',
        'Email templates',
        'Document templates',
        'Numbering sequences',
        'User management',
        'Role permissions',
        'Data backup',
        'Import/export',
      ]}
      connections={[
        { name: 'All Modules', type: 'output', description: 'Apply settings' },
        { name: 'Users', type: 'bidirectional', description: 'User management' },
        { name: 'Integrations', type: 'output', description: 'Connected systems' },
      ]}
      dataFields={[
        { name: 'company_name', type: 'string', required: true, description: 'Company name' },
        { name: 'logo_url', type: 'string', description: 'Company logo' },
        { name: 'address', type: 'jsonb', description: 'Company address' },
        { name: 'phone', type: 'string', description: 'Main phone' },
        { name: 'email', type: 'string', description: 'Main email' },
        { name: 'website', type: 'string', description: 'Website' },
        { name: 'license_number', type: 'string', description: 'Contractor license' },
        { name: 'default_markup', type: 'decimal', description: 'Default markup %' },
        { name: 'default_tax_rate', type: 'decimal', description: 'Default tax rate' },
        { name: 'default_payment_terms', type: 'string', description: 'Default terms' },
        { name: 'fiscal_year_start', type: 'date', description: 'Fiscal year start' },
        { name: 'timezone', type: 'string', description: 'Company timezone' },
      ]}
      aiFeatures={[
        {
          name: 'Setup Assistant',
          description: 'Guides configuration. "Based on your business type, recommend setting default markup to 18% and enabling lien waiver requirements."',
          trigger: 'On initial setup'
        },
        {
          name: 'Optimization Suggestions',
          description: 'Identifies improvements. "Your email templates have low open rates. Consider these improvements..."',
          trigger: 'Periodic review'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Company Settings                                                    │
├─────────────────────────────────────────────────────────────────────┤
│ SECTIONS                                                            │
│ ┌───────────────────┐                                               │
│ │ ▸ Company Profile │ ← Selected                                   │
│ │   Business Info   │                                               │
│ │   Branding        │                                               │
│ │   Defaults        │                                               │
│ │   Notifications   │                                               │
│ │   Templates       │                                               │
│ │   Users & Roles   │                                               │
│ │   Data            │                                               │
│ └───────────────────┘                                               │
├─────────────────────────────────────────────────────────────────────┤
│ COMPANY PROFILE                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Company Name: Ross Built Custom Homes                           │ │
│ │ License #: CGC123456 (Florida)                                  │ │
│ │                                                                 │ │
│ │ Address: 123 Main Street                                        │ │
│ │          Clearwater, FL 33756                                   │ │
│ │                                                                 │ │
│ │ Phone: (727) 555-0100                                          │ │
│ │ Email: info@rossbuilt.com                                      │ │
│ │ Website: www.rossbuilt.com                                     │ │
│ │                                                                 │ │
│ │ Logo: [Ross Built Logo]  [Upload New]                          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ [Save Changes]                                                      │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
