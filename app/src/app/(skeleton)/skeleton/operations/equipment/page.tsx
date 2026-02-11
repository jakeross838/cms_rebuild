'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function EquipmentPage() {
  return (
    <PageSpec
      title="Equipment & Assets"
      phase="Phase 3 - Asset Management"
      planFile="views/operations/EQUIPMENT.md"
      description="Track company equipment, tools, and vehicles. Know where everything is, when it needs maintenance, and manage equipment assignments to jobs. Reduce loss and ensure tools are available when needed."
      workflow={['Add Asset', 'Assign to Job', 'Track Location', 'Schedule Maintenance']}
      features={[
        'Asset inventory with details',
        'Categories: Vehicles, Heavy Equipment, Power Tools, Hand Tools',
        'Current location/job assignment',
        'Checkout/check-in tracking',
        'Maintenance schedules',
        'Service history',
        'Warranty tracking',
        'Insurance/registration (vehicles)',
        'Purchase info and depreciation',
        'QR code labels',
        'Photo documentation',
        'Lost/stolen reporting',
        'Utilization reports',
        'Cost per job allocation',
      ]}
      connections={[
        { name: 'Jobs', type: 'bidirectional', description: 'Equipment assigned to jobs' },
        { name: 'Team', type: 'bidirectional', description: 'Assigned to team members' },
        { name: 'Budget', type: 'output', description: 'Equipment costs allocated' },
        { name: 'Calendar', type: 'output', description: 'Maintenance scheduled' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'name', type: 'string', required: true, description: 'Asset name' },
        { name: 'category', type: 'string', required: true, description: 'Asset type' },
        { name: 'make', type: 'string', description: 'Manufacturer' },
        { name: 'model', type: 'string', description: 'Model' },
        { name: 'serial_number', type: 'string', description: 'Serial number' },
        { name: 'asset_tag', type: 'string', description: 'Internal ID/tag' },
        { name: 'purchase_date', type: 'date', description: 'When purchased' },
        { name: 'purchase_price', type: 'decimal', description: 'Purchase price' },
        { name: 'current_value', type: 'decimal', description: 'Depreciated value' },
        { name: 'current_job_id', type: 'uuid', description: 'Current job assignment' },
        { name: 'current_assignee', type: 'uuid', description: 'Checked out to' },
        { name: 'status', type: 'string', description: 'Available, In Use, Maintenance, Retired' },
        { name: 'last_maintenance', type: 'date', description: 'Last service date' },
        { name: 'next_maintenance', type: 'date', description: 'Next service due' },
        { name: 'warranty_expires', type: 'date', description: 'Warranty expiration' },
        { name: 'notes', type: 'text', description: 'Notes' },
        { name: 'photos', type: 'jsonb', description: 'Asset photos' },
      ]}
      aiFeatures={[
        {
          name: 'Maintenance Predictions',
          description: 'Predicts maintenance needs. "Generator has 500 hours - due for oil change in ~50 hours based on usage."',
          trigger: 'Usage tracking'
        },
        {
          name: 'Utilization Analysis',
          description: 'Tracks asset utilization. "Excavator: 40% utilized. Consider rental vs ownership analysis."',
          trigger: 'Monthly report'
        },
        {
          name: 'Location Tracking',
          description: 'Helps locate equipment. "Laser level last checked out by Mike for Smith job on Jan 15."',
          trigger: 'On search'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Equipment & Assets                                [+ Add Asset]     │
├─────────────────────────────────────────────────────────────────────┤
│ Search: [_______________]  Category: [All ▾]  Status: [All ▾]      │
├─────────────────────────────────────────────────────────────────────┤
│ VEHICLES                                                            │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🚚 2023 Ford F-250 (ROSS-01)                     In Use         │ │
│ │    VIN: 1FT...  | Mileage: 12,450                               │ │
│ │    Location: Smith Residence | Assigned: Mike                   │ │
│ │    Next Service: Feb 15 (oil change @ 15K miles)                │ │
│ │    [View] [Transfer] [Service History]                          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ HEAVY EQUIPMENT                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🏗️ Bobcat S650 Skid Steer (ROSS-10)             Available       │ │
│ │    Hours: 850 | Last Used: Johnson job                          │ │
│ │    ⚠ Maintenance due in 50 hours                                │ │
│ │    [View] [Assign to Job] [Schedule Service]                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ POWER TOOLS                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ DeWalt Laser Level (TOOL-045)                   In Use          │ │
│ │    Checked out: Mike | Job: Smith | Since: Jan 15               │ │
│ │    [Check In] [View History]                                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Total: 45 assets | Value: $285K | ⚠ 3 need maintenance            │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
