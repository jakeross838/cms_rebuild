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
      phase="Phase 1 - Operations"
      planFile="views/directory/TEAM.md"
      description="Employee and team member management. Track roles, permissions, certifications, job assignments, and contact information. Manage who can access what and assign team members to projects."
      workflow={['Add Employee', 'Set Role/Permissions', 'Assign to Jobs', 'Track Certifications']}
      features={[
        'Employee profiles with contact info',
        'Role-based access control',
        'Permission management',
        'Job assignments (current and history)',
        'Certification tracking (OSHA, trade licenses)',
        'Certification expiration alerts',
        'Emergency contact info',
        'Employment documents',
        'Time off tracking',
        'Org chart view',
        'Direct reports hierarchy',
        'Skill/trade assignments',
        'Hourly rate / salary tracking',
        'Performance notes',
      ]}
      connections={[
        { name: 'Jobs', type: 'output', description: 'Team assigned to jobs' },
        { name: 'Time Clock', type: 'bidirectional', description: 'Time entries' },
        { name: 'Daily Logs', type: 'output', description: 'Manpower tracking' },
        { name: 'Crew Schedule', type: 'output', description: 'Scheduling' },
        { name: 'Settings/Permissions', type: 'output', description: 'Access control' },
        { name: 'Compliance/Safety', type: 'bidirectional', description: 'Certifications' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'first_name', type: 'string', required: true, description: 'First name' },
        { name: 'last_name', type: 'string', required: true, description: 'Last name' },
        { name: 'email', type: 'string', required: true, description: 'Work email' },
        { name: 'phone', type: 'string', description: 'Phone number' },
        { name: 'role', type: 'string', required: true, description: 'Job title' },
        { name: 'department', type: 'string', description: 'Department' },
        { name: 'reports_to', type: 'uuid', description: 'Manager' },
        { name: 'hire_date', type: 'date', description: 'Start date' },
        { name: 'hourly_rate', type: 'decimal', description: 'Hourly rate if applicable' },
        { name: 'skills', type: 'string[]', description: 'Skills/trades' },
        { name: 'certifications', type: 'jsonb', description: 'Certs with expiry dates' },
        { name: 'emergency_contact', type: 'jsonb', description: 'Emergency contact info' },
        { name: 'permissions', type: 'jsonb', description: 'Access permissions' },
        { name: 'is_active', type: 'boolean', required: true, description: 'Currently employed' },
        { name: 'avatar_url', type: 'string', description: 'Profile photo' },
      ]}
      aiFeatures={[
        {
          name: 'Certification Alerts',
          description: 'Alerts before certifications expire. "Jake\'s OSHA 30 expires in 45 days. Schedule renewal training."',
          trigger: 'Daily check'
        },
        {
          name: 'Workload Balancing',
          description: 'Identifies overloaded team members. "Sarah has 5 active jobs vs team average of 3. Consider redistribution."',
          trigger: 'On assignment'
        },
        {
          name: 'Skill Matching',
          description: 'Suggests best person for task. "For coastal elevated home: Mike has most experience (8 similar jobs)."',
          trigger: 'On job assignment'
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
