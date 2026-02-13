'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { TeamPreview } from '@/components/skeleton/previews/team-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TeamPage() {
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
      {activeTab === 'preview' ? <TeamPreview /> :
    <PageSpec
      title="Team & Employees"
      phase="Phase 1 - Foundation"
      planFile="docs/modules/01-auth-and-access.md, docs/modules/03-core-data-model.md"
      description="Internal team member management with 7 canonical system roles (owner > admin > pm > superintendent > office > field > read_only), custom roles, Permission Wizard, certifications, job assignments, and org hierarchy. Supports permissions mode (open/standard/strict) and project-level role overrides."
      workflow={['Invite User', 'Permission Wizard (guided role setup)', 'Assign to Jobs', 'Track Certifications', 'Deactivate (soft delete)']}
      features={[
        'Employee profiles with contact info, department, reports-to hierarchy',
        '7 canonical system roles (locked): owner, admin, pm, superintendent, office, field, read_only',
        'Custom roles: inherit from system role, add/remove permissions (GAP-211)',
        'Permissions mode: open (v1 default), standard, strict (GAP-214)',
        'Permission Wizard: guided setup when adding users to a job (adopted from Buildertrend)',
        '"Preview as" button: builder sees what client/vendor sees',
        'Project-level role overrides: different role per project (GAP-212, table exists not enforced v1)',
        'Job status access per role: pre_construction, active, warranty, closed',
        'Field-level permissions in strict mode (GAP-224)',
        'Certification tracking with expiration alerts (OSHA 30, trade licenses, First Aid)',
        'Emergency revocation: immediately deactivate user, preserve all data (GAP-218)',
        'Time-limited access: auto-deactivate on expiry date (GAP-215)',
        'Cross-tenant identity: one email across multiple builders (GAP-226)',
        'Emergency contact info, employment documents',
        'Org chart view, direct reports hierarchy',
        'Skill/trade assignments, hourly rate tracking',
        'Bus factor warning: alert when sole PM/approver on active projects',
        'Bulk actions: reassign projects, update roles',
        'Audit trail: role changes logged with timestamp and changed-by (GAP-217)',
      ]}
      connections={[
        { name: 'Module 1 (Auth)', type: 'bidirectional', description: 'RBAC, roles, permissions, JWT claims' },
        { name: 'Module 2 (Config)', type: 'input', description: 'Permissions mode, custom role definitions' },
        { name: 'Module 3 (Core Data)', type: 'bidirectional', description: 'platform_users, user_tenant_memberships' },
        { name: 'Jobs (Projects)', type: 'output', description: 'Team assigned to projects via project_contacts' },
        { name: 'Module 5 (Notifications)', type: 'output', description: 'Role changes, cert expiry alerts' },
        { name: 'Module 8 (Daily Logs)', type: 'output', description: 'Manpower tracking by crew member' },
        { name: 'Module 34 (HR)', type: 'bidirectional', description: 'Certifications, time tracking, scheduling' },
        { name: 'Module 33 (Safety)', type: 'bidirectional', description: 'OSHA compliance, safety certs' },
        { name: 'Vendor Portal', type: 'output', description: 'Vendor employee role management (GAP-227)' },
        { name: 'Audit Log', type: 'output', description: 'All auth events and role changes' },
      ]}
      dataFields={[
        { name: 'user_id', type: 'uuid', required: true, description: 'FK to platform_users' },
        { name: 'builder_id', type: 'uuid', required: true, description: 'Tenant context' },
        { name: 'role_id', type: 'uuid', required: true, description: 'FK to roles table (system or custom)' },
        { name: 'email', type: 'string', required: true, description: 'Work email (unique per platform_users)' },
        { name: 'first_name', type: 'string', required: true, description: 'First name' },
        { name: 'last_name', type: 'string', required: true, description: 'Last name' },
        { name: 'phone', type: 'string', description: 'Phone number' },
        { name: 'status', type: 'string', required: true, description: 'active | invited | deactivated | expired' },
        { name: 'department', type: 'string', description: 'Department / team' },
        { name: 'reports_to', type: 'uuid', description: 'Manager user_id' },
        { name: 'hire_date', type: 'date', description: 'Start date' },
        { name: 'expires_at', type: 'timestamp', description: 'Auto-deactivation date (GAP-215)' },
        { name: 'hourly_rate', type: 'decimal', description: 'Hourly rate if applicable' },
        { name: 'skills', type: 'string[]', description: 'Skills/trades' },
        { name: 'certifications', type: 'jsonb', description: 'Array of {name, expires_at, status}' },
        { name: 'emergency_contact', type: 'jsonb', description: 'Emergency contact info' },
        { name: 'permissions', type: 'jsonb', description: 'resource:action:scope permission strings' },
        { name: 'field_overrides', type: 'jsonb', description: 'Field-level visibility overrides (strict mode)' },
        { name: 'job_status_access', type: 'string[]', description: 'Accessible job phases' },
        { name: 'avatar_url', type: 'string', description: 'Profile photo URL' },
        { name: 'deactivated_at', type: 'timestamp', description: 'When deactivated (GAP-218)' },
        { name: 'deactivated_by', type: 'uuid', description: 'Who deactivated' },
        { name: 'project_user_roles', type: 'jsonb', description: 'Per-project role overrides (v2)' },
      ]}
      aiFeatures={[
        {
          name: 'Certification Alerts',
          description: 'Alerts before certifications expire. "Mike\'s OSHA 30 expires in 33 days. Emily\'s OSHA 10 is expired - immediate action required."',
          trigger: 'Daily check'
        },
        {
          name: 'Workload Balancing',
          description: 'Identifies overloaded team members. "Emily has 4 active jobs vs team average of 2. Consider redistribution for upcoming projects."',
          trigger: 'On assignment'
        },
        {
          name: 'Skill Matching',
          description: 'Suggests best person for task. "For coastal elevated home: Mike has most experience (8 similar jobs)."',
          trigger: 'On job assignment'
        },
        {
          name: 'Bus Factor Warning',
          description: 'Alerts when a user is sole PM, approver, or admin on active projects with no backup assigned.',
          trigger: 'On role change / deactivation'
        },
        {
          name: 'Permission Impact Preview',
          description: 'When switching permissions mode (open to standard), shows impact: "12 users will lose access to financial data."',
          trigger: 'On mode change'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Team                                              [+ Add Employee]  │
├─────────────────────────────────────────────────────────────────────┤
│ View: [List] [Org Chart]    Department: [All ▾]    Status: [Active]│
├─────────────────────────────────────────────────────────────────────┤
│ LEADERSHIP                                                          │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 👤 Jake Ross                                          Owner     │ │
│ │    jake@rossbuilt.com | (555) 100-0001                          │ │
│ │    Active Jobs: 5 | Role: Full Access                           │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ PROJECT MANAGEMENT                                                  │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 👤 Sarah Johnson                            Project Manager     │ │
│ │    sarah@rossbuilt.com | (555) 100-0002                         │ │
│ │    Active Jobs: 3 | Reports to: Jake Ross                       │ │
│ │    Certs: OSHA 30 ✓ | PMP ✓                                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 👤 Mike Thompson                            Project Manager     │ │
│ │    mike@rossbuilt.com | (555) 100-0003                          │ │
│ │    Active Jobs: 2 | Reports to: Jake Ross                       │ │
│ │    Certs: OSHA 30 ⚠ Expires in 30 days                          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Total: 8 employees | ⚠ 2 certifications expiring soon             │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
