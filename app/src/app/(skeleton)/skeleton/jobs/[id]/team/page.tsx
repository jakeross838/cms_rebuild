'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function JobTeamPage() {
  return (
    <PageSpec
      title="Job Team"
      phase="Phase 0 - Foundation"
      planFile="views/jobs/TEAM.md"
      description="View and manage the team assigned to this job. See roles, responsibilities, contact information, and current assignments. Coordinate between internal team and subcontractors."
      workflow={['Assign Team', 'Define Roles', 'Communicate', 'Track Performance', 'Adjust as Needed']}
      features={[
        'Team roster',
        'Role assignments',
        'Contact information',
        'Current work assignments',
        'Subcontractor list',
        'Emergency contacts',
        'Communication preferences',
        'Availability status',
        'Skills and certifications',
        'Performance notes',
        'Quick contact actions',
        'Team schedule view',
        'Responsibility matrix',
        'Access permissions',
      ]}
      connections={[
        { name: 'Company Team', type: 'input', description: 'Available employees' },
        { name: 'Vendors', type: 'input', description: 'Subcontractors' },
        { name: 'Schedule', type: 'bidirectional', description: 'Work assignments' },
        { name: 'Daily Logs', type: 'input', description: 'Crew on site' },
        { name: 'Communications', type: 'output', description: 'Team messages' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'team_member_type', type: 'string', required: true, description: 'Employee, Subcontractor, Consultant' },
        { name: 'team_member_id', type: 'uuid', required: true, description: 'Person or company' },
        { name: 'role', type: 'string', required: true, description: 'Role on job' },
        { name: 'responsibilities', type: 'text', description: 'Key responsibilities' },
        { name: 'start_date', type: 'date', description: 'When assigned' },
        { name: 'end_date', type: 'date', description: 'When ending' },
        { name: 'is_primary', type: 'boolean', description: 'Primary contact for role' },
        { name: 'access_level', type: 'string', description: 'System access' },
        { name: 'notes', type: 'text', description: 'Notes' },
      ]}
      aiFeatures={[
        {
          name: 'Team Recommendations',
          description: 'Suggests team members. "Based on job type and schedule, recommend: Mike Smith (PM), Tom Brown (Super). Both available."',
          trigger: 'On job creation'
        },
        {
          name: 'Contact Routing',
          description: 'Routes communications. "Question about electrical? Primary contact: XYZ Electric - John @ (727) 555-1234."',
          trigger: 'On query'
        },
        {
          name: 'Availability Alerts',
          description: 'Monitors conflicts. "Mike Smith assigned to 3 jobs during Feb. May need to reassign or hire."',
          trigger: 'On scheduling'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Team - Smith Residence                          [+ Add Team Member] │
├─────────────────────────────────────────────────────────────────────┤
│ ROSS BUILT TEAM                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 👤 Jake Ross           Owner/Builder                            │ │
│ │    📱 (727) 555-0100   ✉ jake@rossbuilt.com                    │ │
│ │    Responsibilities: Client relations, major decisions          │ │
│ │    [Call] [Text] [Email]                                       │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 👤 Mike Smith          Project Manager                          │ │
│ │    📱 (727) 555-0101   ✉ mike@rossbuilt.com                    │ │
│ │    Responsibilities: Day-to-day management, scheduling          │ │
│ │    Status: On-site today | [Call] [Text] [Email]               │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ SUBCONTRACTORS                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🏢 ABC Lumber          Framing Package                          │ │
│ │    Contact: Tom Brown  📱 (727) 555-1111                       │ │
│ │    On-site: Mon-Fri this week | [Call] [Email]                 │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 🏢 XYZ Electric        Electrical                               │ │
│ │    Contact: John Sparks 📱 (727) 555-2222                      │ │
│ │    Scheduled: Next week | [Call] [Email]                       │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 🏢 Coastal Plumbing    Plumbing                                 │ │
│ │    Contact: Maria Lopez 📱 (727) 555-3333                      │ │
│ │    Scheduled: Starting Feb 5 | [Call] [Email]                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Team: 2 employees + 12 subcontractors | Emergency: (727) 555-HELP  │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
