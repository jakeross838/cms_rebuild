'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { ContactsPreview } from '@/components/skeleton/previews/contacts-preview'
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
      title="Contacts Directory"
      phase="Phase 1 - Foundation"
      planFile="docs/modules/03-core-data-model.md"
      description="Unified contact directory for all external people and companies: clients, vendors, architects, engineers, designers, lenders, realtors, inspectors, and others. Contacts are linked to projects via the project_contacts junction table with role, is_primary, and contract_amount. Vendor contacts track insurance, W-9, payment terms, and license. Client contacts track source and referral. Tags for flexible user-controlled categorization. Soft delete (archive) with restore capability."
      workflow={['Add Contact', 'Set contact_type', 'Add tags', 'Link to Projects (project_contacts)', 'Track compliance (vendors)', 'Archive (soft delete)']}
      features={[
        '9 contact types: client, vendor, architect, engineer, designer, lender, realtor, inspector, other',
        'Contact profiles with phone, mobile, email, website, address (full address fields)',
        'display_name computed from company_name or first_name + last_name',
        'Company/firm association with company_name field',
        'Project linking via project_contacts junction: role, is_primary, scope_description, contract_amount',
        'Vendor-specific fields: license_number, insurance_expiry, w9_on_file, default_cost_code_id, payment_terms, tax_id',
        'Client-specific fields: client_source (referral/website/realtor/repeat), referred_by_id (FK to contacts)',
        'Tags for flexible user-controlled categorization (string array, never hardcoded)',
        'Favorite/frequently used contacts with toggle',
        'Soft delete (archive) with restore capability -- deleted_at/deleted_by pattern (GAP-542)',
        'Optimistic locking via version column (GAP-541)',
        'Full audit trail: created_at, created_by, updated_at, updated_by (GAP-540)',
        'Notes and interaction history per contact',
        'Quick actions: call, email, view profile',
        'Filter by contact_type, tags, favorites, archived status',
        'Search across name, company, email, title, tags (trigram index for partial match)',
        'Sort by last name, company, type, date added',
        'Bulk actions: tag, archive, export, reassign projects',
        'CSV import with duplicate detection and dry-run validation (GAP-013)',
        'Duplicate detection via fuzzy name + email matching',
        'Insurance expiry alerts for vendor contacts',
        'Contact sharing with team (all contacts visible to all internal roles in open permissions mode)',
      ]}
      connections={[
        { name: 'Module 1 (Auth)', type: 'input', description: 'User identity, builder_id for tenant scoping, role-based access' },
        { name: 'Module 2 (Config)', type: 'input', description: 'Custom field definitions (EAV), terminology overrides, numbering patterns' },
        { name: 'Module 3 (Core Data)', type: 'bidirectional', description: 'contacts table, project_contacts junction, entity_change_log, soft delete' },
        { name: 'Projects', type: 'bidirectional', description: 'Contacts linked to projects via project_contacts (role, is_primary, contract_amount)' },
        { name: 'Module 10 (Vendors)', type: 'bidirectional', description: 'Vendor contacts with insurance, W-9, compliance tracking' },
        { name: 'Module 12 (Client Portal)', type: 'output', description: 'Client contacts get portal access' },
        { name: 'Module 27 (RFIs)', type: 'output', description: 'RFIs routed to architect/engineer contacts' },
        { name: 'Module 32 (Permitting)', type: 'output', description: 'Inspector contacts for inspection scheduling' },
        { name: 'Module 36 (CRM)', type: 'bidirectional', description: 'Lead pipeline feeds new client contacts' },
        { name: 'Module 5 (Notifications)', type: 'output', description: 'Insurance expiry alerts, contact assignment notifications' },
        { name: 'AI Processing Layer', type: 'input', description: 'Duplicate detection, name normalization, contact suggestions' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'builder_id', type: 'uuid', required: true, description: 'Tenant context (RLS enforced)' },
        { name: 'contact_type', type: 'string', required: true, description: 'client | vendor | architect | engineer | designer | lender | realtor | inspector | other' },
        { name: 'company_name', type: 'string', description: 'Company/firm name' },
        { name: 'first_name', type: 'string', description: 'First name' },
        { name: 'last_name', type: 'string', description: 'Last name' },
        { name: 'display_name', type: 'string', required: true, description: 'Computed: company_name or first+last' },
        { name: 'email', type: 'string', description: 'Email address' },
        { name: 'phone', type: 'string', description: 'Office/primary phone' },
        { name: 'mobile', type: 'string', description: 'Mobile phone number' },
        { name: 'address_line1', type: 'string', description: 'Street address line 1' },
        { name: 'address_line2', type: 'string', description: 'Street address line 2' },
        { name: 'city', type: 'string', description: 'City' },
        { name: 'state', type: 'string(2)', description: 'State abbreviation' },
        { name: 'zip', type: 'string(10)', description: 'ZIP code' },
        { name: 'website', type: 'string', description: 'Website URL' },
        { name: 'notes', type: 'text', description: 'Internal notes (never shown to contact)' },
        { name: 'tags', type: 'string[]', description: 'Flexible categorization tags (user-controlled)' },
        { name: 'license_number', type: 'string', description: 'Professional license (vendor/architect/engineer)' },
        { name: 'insurance_expiry', type: 'date', description: 'Vendor insurance expiration date' },
        { name: 'w9_on_file', type: 'boolean', description: 'Whether W-9 is on file (vendor)' },
        { name: 'default_cost_code_id', type: 'uuid', description: 'FK to cost_codes for vendor default' },
        { name: 'payment_terms', type: 'string', description: 'net_30 | net_15 | due_on_receipt (vendor)' },
        { name: 'tax_id', type: 'string', description: 'Tax ID / EIN (vendor, encrypted)' },
        { name: 'client_source', type: 'string', description: 'referral | website | realtor | repeat (client)' },
        { name: 'referred_by_id', type: 'uuid', description: 'FK to contacts (client referral source)' },
        { name: 'created_at', type: 'timestamp', required: true, description: 'Record creation time' },
        { name: 'created_by', type: 'uuid', required: true, description: 'FK to platform_users' },
        { name: 'updated_at', type: 'timestamp', required: true, description: 'Last modification time' },
        { name: 'updated_by', type: 'uuid', required: true, description: 'FK to platform_users' },
        { name: 'deleted_at', type: 'timestamp', description: 'Soft delete timestamp' },
        { name: 'deleted_by', type: 'uuid', description: 'Who archived this contact' },
        { name: 'version', type: 'int', required: true, description: 'Optimistic lock version (GAP-541)' },
        { name: 'project_id (junction)', type: 'uuid', required: true, description: 'FK to projects (project_contacts)' },
        { name: 'contact_id (junction)', type: 'uuid', required: true, description: 'FK to contacts (project_contacts)' },
        { name: 'role (junction)', type: 'string', description: 'Role on project: client, architect, electrical, plumbing, etc.' },
        { name: 'is_primary (junction)', type: 'boolean', description: 'Primary contact for this role on project' },
        { name: 'scope_description (junction)', type: 'text', description: 'Scope of work on this project' },
        { name: 'contract_amount (junction)', type: 'decimal', description: 'Contract amount for this project assignment' },
      ]}
      aiFeatures={[
        {
          name: 'Duplicate Detection',
          description: 'Fuzzy matching on name + email + phone to identify potential duplicates during creation and CSV import. "Gerald Wu (archived) and Wu Designs LLC may reference the same contact."',
          trigger: 'On contact creation / CSV import'
        },
        {
          name: 'Contact Suggestions',
          description: 'Suggests relevant contacts for project roles based on past project similarity. "For architect: John Smith has worked on 5 similar coastal projects. Bob Wilson (engineer) has the most experience with elevated homes."',
          trigger: 'On project setup / team assignment'
        },
        {
          name: 'Insurance Expiry Alerts',
          description: 'Proactive alerts for vendor insurance approaching expiration. "Coastal Plumbing Co. insurance expires March 1 -- request updated COI now to avoid project delays on Davis Addition."',
          trigger: 'Daily check / on project assignment'
        },
        {
          name: 'Relationship Mapping',
          description: 'Identifies contact relationships from project history. "John Smith and Lisa Chen have worked together on 3 projects. Rick Torres and Bob Wilson frequently collaborate on coastal builds."',
          trigger: 'On contact profile view'
        },
        {
          name: 'Name Normalization',
          description: 'Normalizes contact names through the 3-tier matching engine (exact cache, fuzzy match, AI classify). Resolves aliases: "ABC Electric" = "ABC Electrical Services" = "A.B.C. Electric Inc."',
          trigger: 'On contact creation / import'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Contacts Directory                                [+ Add Contact]   │
├─────────────────────────────────────────────────────────────────────┤
│ [All] [Client] [Vendor] [Architect] [Engineer] [Designer] [...]    │
│ Search: [____________________]  [★ Favorites] [Archive: Show]      │
│ Active: 11 | Favorites: 5 | Project Links: 45 | Archived: 1       │
├─────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┬──────────────────────────────┐ │
│ │ ★ John Smith   [Architect]       │ Bob Wilson     [Engineer]    │ │
│ │   ABC Architecture               │   Coastal Engineering       │ │
│ │   john@abcarch.com               │   bob@coastaleng.com        │ │
│ │   (555) 222-3333 | M: 222-3334   │   (555) 444-5555           │ │
│ │   Tags: Preferred, Coastal       │   Tags: Preferred, Struct.  │ │
│ │   License: ARC-2024-1234         │   License: PE-TX-89012     │ │
│ │   5 projects (Primary on 4)      │   8 projects (Primary on 7)│ │
│ │   [Module 3]                     │   [Module 3]                │ │
│ │   [Call] [Email] [View Profile]  │   [Call] [Email] [Profile]  │ │
│ ├──────────────────────────────────┼──────────────────────────────┤ │
│ │ ★ Torres Electrical [Vendor]     │ Lisa Chen     [Designer]    │ │
│ │   rick@torreselectric.com        │   Chen Interior Design     │ │
│ │   Insurance: 2026-08-15 (valid)  │   lisa@chendesign.com      │ │
│ │   W-9: On File | Terms: Net 30   │   Tags: Preferred, Modern  │ │
│ │   3 projects | $147,500 total    │   3 projects               │ │
│ │   [Call] [Email] [View Profile]  │   [Call] [Email] [Profile]  │ │
│ └──────────────────────────────────┴──────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ AI: Coastal Plumbing insurance expires Mar 1 -- request COI now.   │
│ AI: Potential duplicate: Gerald Wu (archived) / Wu Designs LLC      │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
