'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { EquipmentPreview } from '@/components/skeleton/previews/equipment-preview'
import { cn } from '@/lib/utils'

const workflow = ['Register Asset', 'Deploy to Job', 'Track Usage/GPS', 'Schedule Maintenance', 'Return/Checkout', 'Depreciate/Dispose']

export default function EquipmentPage() {
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
      {activeTab === 'preview' ? <EquipmentPreview /> : <PageSpec
      title="Equipment & Asset Management"
      phase="Phase 5 - Full Platform (Module 35)"
      planFile="docs/modules/35-equipment-assets.md"
      description="Full equipment and asset management covering inventory tracking with serial numbers and QR codes, deployment to projects, GPS location tracking with geofencing, maintenance scheduling (calendar and hour-based), utilization tracking with cost-per-hour, rental management with PO linkage, checkout/check-in for tools, depreciation calculation (straight-line, MACRS, declining balance), cost allocation to projects, and rent-vs-own decision support. Scales from simple tool tracking to full fleet management."
      workflow={workflow}
      features={[
        'Asset registry: name, type, make, model, serial number, year, photos',
        'Categories: heavy equipment, power tools, hand tools, safety equipment, vehicles, technology',
        'QR code / barcode generation per asset for field scanning',
        'Status tracking: available, deployed, maintenance, repair, retired, sold, lost/stolen',
        'Calendar-based and hour-based maintenance scheduling',
        'Maintenance task checklists per equipment type',
        'Service provider tracking and maintenance cost logging (parts + labor)',
        'Overdue maintenance alerts with escalation',
        'Pre-trip / pre-use inspection checklists (configurable)',
        'Utilization tracking: deployed hours vs available hours',
        'Idle equipment alerts (not deployed for N days)',
        'Cost-per-hour calculation (annual ownership cost + maintenance / annual hours)',
        'Rental tracking: vendor, rate, start/return dates, PO linkage',
        'Rental return reminders and off-rent notification workflow',
        'Rental invoice reconciliation against agreement terms',
        'Rent vs. own analysis from actual rental history and maintenance data',
        'GPS integration with current location on map view',
        'Geofence alerts: equipment leaves designated job site',
        'Theft alert: movement outside business hours or geofence',
        'Tool checkout/check-in with digital signature',
        'Overdue checkout alerts with escalation',
        'Loss/damage reporting with insurance documentation',
        'Depreciation: straight-line, MACRS (3/5/7/10 year), declining balance',
        'Annual depreciation schedule report for accountant/tax',
        'Disposal/sale tracking with gain/loss calculation',
        'Equipment cost allocation to projects (hours, days, flat, percentage)',
        'Bulk import from CSV/Excel for initial inventory load',
        'Equipment breakdown rapid response workflow',
      ]}
      connections={[
        { name: 'Core Data Model (M03)', type: 'input', description: 'Project context for deployment and cost allocation' },
        { name: 'HR & Workforce (M34)', type: 'bidirectional', description: 'Employee assignment for checkouts and deployments' },
        { name: 'Purchase Orders (M18)', type: 'input', description: 'Rental PO linkage' },
        { name: 'Notification Engine (M05)', type: 'output', description: 'Maintenance alerts, rental returns, geofence alerts' },
        { name: 'Financial Reporting (M19)', type: 'output', description: 'Depreciation and equipment cost data' },
        { name: 'Vendor Management (M10)', type: 'input', description: 'Rental vendor and service provider tracking' },
        { name: 'Daily Logs (M08)', type: 'bidirectional', description: 'Equipment on site tracking in daily logs' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'builder_id', type: 'uuid', required: true, description: 'Tenant ID (company_id)' },
        { name: 'name', type: 'string', required: true, description: 'Asset name' },
        { name: 'category', type: 'string', required: true, description: 'heavy_equipment, power_tool, hand_tool, safety, vehicle, technology' },
        { name: 'make', type: 'string', description: 'Manufacturer' },
        { name: 'model', type: 'string', description: 'Model' },
        { name: 'serial_number', type: 'string', description: 'Serial number' },
        { name: 'year', type: 'integer', description: 'Year of manufacture' },
        { name: 'purchase_date', type: 'date', description: 'When purchased' },
        { name: 'purchase_price', type: 'decimal', description: 'Purchase price' },
        { name: 'salvage_value', type: 'decimal', description: 'Estimated salvage value' },
        { name: 'current_book_value', type: 'decimal', description: 'Current depreciated book value' },
        { name: 'depreciation_method', type: 'string', description: 'straight_line | macrs | declining_balance' },
        { name: 'useful_life_years', type: 'integer', description: 'Useful life for depreciation' },
        { name: 'status', type: 'string', required: true, description: 'available, deployed, maintenance, repair, retired, sold, lost_stolen' },
        { name: 'is_rental', type: 'boolean', description: 'Rental vs owned flag' },
        { name: 'qr_code', type: 'string', description: 'QR code identifier' },
        { name: 'photo_urls', type: 'jsonb', description: 'Asset photos' },
        { name: 'gps_enabled', type: 'boolean', description: 'GPS tracking active' },
        { name: 'hour_meter_reading', type: 'integer', description: 'Current hour meter' },
        { name: 'utilization_rate', type: 'decimal', description: 'Deployed/available ratio' },
        { name: 'cost_per_hour', type: 'decimal', description: 'Calculated cost per hour' },
      ]}
      aiFeatures={[
        {
          name: 'Maintenance Predictions',
          description: 'Predicts maintenance needs from hour readings and usage patterns. "Generator at 500 hours - due for oil change in ~50 hours based on 250-hour interval and current usage rate."',
          trigger: 'Hour meter updates + usage tracking'
        },
        {
          name: 'Utilization Analysis',
          description: 'Tracks asset utilization and identifies under/over-utilized equipment. "Bobcat S650 at 40% utilization. Consider rental vs ownership analysis - you spent $14.2K renting skid steers."',
          trigger: 'Monthly report + deployment changes'
        },
        {
          name: 'Rent vs. Own Decision Support',
          description: 'Compares cumulative rental spend to estimated ownership cost. "12-month skid steer rental spend: $14,200. Comparable purchase: $52,000. Annual operating cost: $8,000. Break-even: 2.8 years."',
          trigger: 'When rental spend exceeds configurable threshold'
        },
        {
          name: 'Location & Theft Detection',
          description: 'Monitors GPS-equipped assets for geofence violations and after-hours movement. "Excavator left job site at 11 PM Saturday - potential theft alert."',
          trigger: 'GPS location updates'
        },
        {
          name: 'Checkout Tracking',
          description: 'Monitors tool checkouts for overdue returns and reconciles location. "Laser level checked out 4 weeks ago by Mike Rodriguez. Approaching return date. Confirm still needed."',
          trigger: 'Overdue threshold + periodic check'
        },
        {
          name: 'Equipment Breakdown Response',
          description: 'On breakdown report, suggests available substitutes (owned or rental) and flags schedule impact. "Excavator down at Harbor View. Available sub: Bobcat S650 in yard. Or: Sunbelt has Cat 303 for $350/day."',
          trigger: 'On breakdown report'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Equipment & Assets    8 owned + 1 rented   [Deprec Report] [+ Add] │
├─────────────────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │  8   │ │$184K │ │  2   │ │  5   │ │  1   │ │ 1/$  │ │  4   │ │
│ │Owned │ │Book  │ │Avail │ │Deploy│ │Maint │ │Rental│ │ GPS  │ │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ │
│ Connected: Jobs | HR | Financial | Vendors | POs | Notifications  │
├─────────────────────────────────────────────────────────────────────┤
│ All(9) | Vehicles(2) | Heavy(3) | Tools(4) | Rentals(3) | Maint  │
├─────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────┐ ┌───────────────────────┐                │
│ │ 🚚 Ford F-250 ROSS-01│ │ 🏗️ Bobcat S650 ROSS-10 │                │
│ │ Deployed: Smith Res   │ │ Available | 40% util   │                │
│ │ GPS ✓ Inside geofence │ │ Maint due ~50hrs       │                │
│ │ 92% util | $18.50/hr  │ │ $32.50/hr              │                │
│ │ $65K→$55K (MACRS 5yr) │ │ $52K→$38K              │                │
│ │ [Return] [QR]         │ │ AI: Rent may be better │                │
│ └───────────────────────┘ │ [Deploy] [QR]          │                │
│                           └───────────────────────┘                │
│ RENTALS                                                            │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ Hilti Hammer Drill | Sunbelt | $85/d | 7d | $595 | Active     ││
│ │ Scissor Lift 26ft  | Sunbelt | $450/w| 23d| $1050| OVERDUE    ││
│ └─────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│ 💡 AI: "Bobcat 40% util - rent vs own analysis recommended.       │
│ Scissor lift overdue 9 days ($58/day waste). Generator 50hr maint."│
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
