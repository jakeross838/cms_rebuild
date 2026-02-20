'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { SustainabilityPreview } from '@/components/skeleton/previews/sustainability-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SustainabilityPage() {
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
      {activeTab === 'preview' ? <SustainabilityPreview /> : <PageSpec
      title="Sustainability & ESG Tracking"
      phase="Phase 6 - Extended Platform"
      planFile="docs/2-features/FEATURE-SUSTAINABILITY-ESG.md"
      description="Comprehensive sustainability tracking for construction projects including carbon footprint monitoring, green building certifications (LEED, ENERGY STAR), waste diversion tracking, renewable energy systems, and ESG reporting. Integrates with estimating for early-stage carbon analysis and selections for eco-friendly material choices."
      workflow={['Set Carbon Target', 'Track Materials', 'Log Waste', 'Monitor Progress', 'Generate Reports', 'Achieve Certification']}
      features={[
        'Material carbon footprint database with EPD (Environmental Product Declaration) data',
        'Carbon tracking per job with targets and actuals (kg CO2e)',
        'Carbon intensity metrics: kg CO2e per square foot',
        'Lifecycle carbon phases: A1-A3 (production), A4 (transport), A5 (construction), B1-B7 (use), C1-C4 (end of life)',
        'AI-powered low-carbon alternative suggestions when high-impact materials specified',
        'Green certification tracking: LEED, ENERGY STAR, NGBS, PHIUS, WELL, Living Building',
        'LEED credit checklist with point tracking and documentation',
        'Construction waste tracking by type and disposition (recycled, reused, landfill)',
        'Waste diversion rate calculation for LEED MR credits',
        'Renewable energy system tracking: solar PV, solar thermal, geothermal, battery storage',
        'Federal and state incentive tracking for renewable systems',
        'ESG report generation: project summary, annual company, client deliverable',
        'Carbon comparison vs baseline and industry benchmarks',
        'Eco badges on selection options: Low Carbon, Recycled Content, Locally Sourced, Certified',
        'Green estimate mode: carbon footprint per line item in estimates',
        'Carbon-cost tradeoff analysis for material substitutions',
        'Client eco preference settings: Standard, Eco-Conscious, Green Priority',
        'EPD auto-lookup from manufacturer databases',
        'Recycled content percentage tracking',
        'Local sourcing percentage (configurable radius)',
      ]}
      connections={[
        { name: 'Estimating Engine (M20)', type: 'bidirectional', description: 'Carbon per line item, green alternatives, eco-mode toggle' },
        { name: 'Selection Management (M21)', type: 'bidirectional', description: 'Eco badges, carbon display, green comparison mode' },
        { name: 'Purchase Orders (M11)', type: 'input', description: 'Auto-calculate carbon from material POs' },
        { name: 'Invoices (M13)', type: 'input', description: 'Verify actual materials match carbon estimates' },
        { name: 'Client Portal (M12)', type: 'output', description: 'Share sustainability metrics with clients' },
        { name: 'Document Storage (M06)', type: 'bidirectional', description: 'EPD documents, certification certificates, ESG reports' },
        { name: 'Vendor Management (M10)', type: 'input', description: 'Vendor certifications (FSC, Cradle to Cradle, etc.)' },
        { name: 'Reporting (M30)', type: 'output', description: 'Carbon metrics in job profitability reports' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'company_id', type: 'uuid', required: true, description: 'Tenant ID' },
        { name: 'job_id', type: 'uuid', description: 'Related project' },
        { name: 'material_category', type: 'string', description: 'concrete, steel, lumber, insulation, etc.' },
        { name: 'material_type', type: 'string', description: 'Specific material type' },
        { name: 'carbon_per_unit', type: 'decimal', description: 'kg CO2e per unit' },
        { name: 'unit', type: 'string', description: 'ton, cubic_yard, board_foot, sqft, etc.' },
        { name: 'a1_a3_production', type: 'decimal', description: 'Raw material + manufacturing carbon' },
        { name: 'a4_transport', type: 'decimal', description: 'Transport to site carbon' },
        { name: 'epd_available', type: 'boolean', description: 'Has Environmental Product Declaration' },
        { name: 'certifications', type: 'jsonb', description: 'FSC, GREENGUARD, Cradle to Cradle, etc.' },
        { name: 'target_carbon_intensity', type: 'decimal', description: 'Target kg CO2e per sqft' },
        { name: 'actual_carbon_to_date', type: 'decimal', description: 'Running total kg CO2e' },
        { name: 'certification_goal', type: 'string', description: 'LEED Silver, ENERGY STAR, Net Zero Ready' },
        { name: 'certification_status', type: 'string', description: 'planning, registered, in_progress, submitted, certified' },
        { name: 'points_targeted', type: 'integer', description: 'LEED points targeted' },
        { name: 'points_achieved', type: 'integer', description: 'LEED points achieved' },
        { name: 'waste_type', type: 'string', description: 'wood, concrete, metal, drywall, mixed, hazardous' },
        { name: 'disposition', type: 'string', description: 'landfill, recycled, reused_onsite, reused_offsite, donated' },
        { name: 'renewable_system_type', type: 'string', description: 'solar_pv, solar_thermal, geothermal, battery_storage' },
        { name: 'capacity_kw', type: 'decimal', description: 'System capacity in kW' },
        { name: 'federal_tax_credit', type: 'decimal', description: 'Federal incentive amount' },
        { name: 'created_at', type: 'timestamp', required: true, description: 'Record creation timestamp' },
      ]}
      aiFeatures={[
        {
          name: 'Carbon Footprint Tracking',
          description: 'Automatically calculates embodied carbon from material purchases using EPD data and industry averages. Updates running project total in real-time.',
          trigger: 'On PO approval / Invoice processing'
        },
        {
          name: 'Green Alternative Suggestions',
          description: 'Recommends lower-carbon alternatives when high-impact materials are specified. "Consider low-carbon concrete mix: 30% carbon reduction, 8% cost premium."',
          trigger: 'On estimate line item entry / PO creation'
        },
        {
          name: 'Certification Credit Tracking',
          description: 'Monitors LEED/ENERGY STAR credit progress and alerts when documentation is needed. Auto-calculates points from waste diversion, energy systems, and material selections.',
          trigger: 'Real-time credit calculation / Documentation deadline'
        },
        {
          name: 'ESG Report Generation',
          description: 'Generates client-ready sustainability reports with carbon metrics, waste diversion rates, and certification status. AI-written executive summary.',
          trigger: 'On-demand / Project milestone'
        },
        {
          name: 'EPD Auto-Lookup',
          description: 'Searches manufacturer databases for Environmental Product Declarations when materials are entered. Auto-populates carbon data from verified EPDs.',
          trigger: 'On material entry / Vendor catalog sync'
        },
        {
          name: 'Waste Optimization',
          description: 'Analyzes waste patterns across projects and suggests material ordering optimizations to reduce construction waste. Identifies recycling opportunities.',
          trigger: 'Weekly analysis / On waste entry'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ 🌿 Sustainability & ESG    [Material Lookup] [ESG Report] [Log]    │
├─────────────────────────────────────────────────────────────────────┤
│ Dashboard | Projects | Materials | Certifications | Waste | Energy │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────┐│
│ │847,250  │ │ 42.3    │ │  78%    │ │  65%    │ │  34%    │ │  3  ││
│ │kg CO2e  │ │ kg/sqft │ │ Waste   │ │ Local   │ │ EPD     │ │Certs││
│ │Tracked  │ │ -18%    │ │Diverted │ │Materials│ │Coverage │ │     ││
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────┘│
│                                                                     │
│ Connected: Estimating | Selections | POs | Invoices | Client Portal│
│                                                                     │
│ PROJECT CARBON SUMMARY                                              │
│ ┌───────────────────────────────────────────────────────────────┐  │
│ │ Smith Residence        4,200 sqft     LEED Silver             │  │
│ │ ████████████░░░░ 77% of target    38.5/50 kg/sqft  ✓ On Track │  │
│ │ 161.7t CO2e   -23% vs baseline   82% waste diverted  12.5kW  │  │
│ ├───────────────────────────────────────────────────────────────┤  │
│ │ Johnson Beach House    5,800 sqft     ENERGY STAR             │  │
│ │ ██████████████░░ 98% of target   44.2/45 kg/sqft   ⚠ At Risk │  │
│ │ 256.4t CO2e   -12% vs baseline   71% waste diverted  8.2kW   │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ CERTIFICATIONS              │ WASTE DIVERSION                       │
│ ┌─────────────────────────┐ │ ┌───────────────────────────────────┐ │
│ │ Smith - LEED Silver     │ │ │ 16.4t Total   12.8t Diverted      │ │
│ │   42/55 pts  In Progress│ │ │ ████████████████░░░ 78%           │ │
│ │ Harbor - LEED Gold      │ │ │ Recycled 52% | Reused 26% | LF 22%│ │
│ │   51/68 pts  In Progress│ │ │ Rebates: $815  Costs: $465        │ │
│ │ Johnson - ENERGY STAR   │ │ └───────────────────────────────────┘ │
│ │   Submitted Feb 5       │ │                                       │
│ └─────────────────────────┘ │                                       │
├─────────────────────────────────────────────────────────────────────┤
│ 💡 AI: "Johnson 98% of target - consider low-carbon concrete for   │
│ remaining work. Smith achieving 82% diversion - 3 pts closer to MR │
│ Credit 3. Harbor cellulose insulation saved 12,400 kg vs baseline."│
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
