'use client'

import { useState } from 'react'

import {
  Leaf,
  Recycle,
  TreePine,
  Factory,
  TrendingDown,
  TrendingUp,
  MoreHorizontal,
  Sparkles,
  Building2,
  FileText,
  Award,
  BarChart3,
  Target,
  Zap,
  Droplets,
  Sun,
  Wind,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Download,
  Search,
  Filter,
  ExternalLink,
  Truck,
  Package,
  Scale,
  ArrowRight,
  Info,
  Minus,
  CircleDot,
  Globe,
  BadgeCheck,
} from 'lucide-react'

import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { cn } from '@/lib/utils'

// ── Types ───────────────────────────────────────────────────────────────

interface CarbonMetric {
  label: string
  value: string
  unit?: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  status: 'success' | 'warning' | 'danger' | 'neutral'
  icon: React.ElementType
  description?: string
}

interface ProjectCarbon {
  id: string
  projectName: string
  squareFootage: number
  targetCarbonPerSqft: number
  actualCarbonPerSqft: number
  totalCarbonKg: number
  baselineKg: number
  percentOfTarget: number
  certificationGoal?: string
  status: 'on_track' | 'at_risk' | 'over_target' | 'completed'
  wasteDiversionPct: number
  renewableEnergy?: string
  lastUpdated: string
}

interface MaterialCarbon {
  id: string
  category: string
  materialType: string
  manufacturer?: string
  carbonPerUnit: number
  unit: string
  epdAvailable: boolean
  certifications: string[]
  dataSource: 'manufacturer' | 'epa' | 'industry_average' | 'user_entered'
  hasAlternative: boolean
  alternativeSavingsPct?: number
}

interface GreenCertification {
  id: string
  projectName: string
  certificationType: string
  targetLevel: string
  status: 'planning' | 'registered' | 'in_progress' | 'submitted' | 'certified'
  pointsTargeted: number
  pointsAchieved: number
  pointsPossible: number
  submissionDate?: string
  certificationDate?: string
  verifier?: string
}

interface CertificationCredit {
  id: string
  category: string
  creditCode: string
  creditName: string
  pointsPossible: number
  pointsTargeted: number
  pointsAchieved: number
  status: 'not_started' | 'in_progress' | 'documentation_ready' | 'submitted' | 'achieved' | 'not_pursued'
  responsibleParty?: string
  dueDate?: string
}

interface WasteEntry {
  id: string
  projectName: string
  wasteType: string
  quantity: number
  unit: string
  disposition: 'landfill' | 'recycled' | 'reused_onsite' | 'reused_offsite' | 'donated' | 'composted'
  date: string
  hauler?: string
  cost?: number
  rebate?: number
}

interface RenewableSystem {
  id: string
  projectName: string
  systemType: string
  capacityKw: number
  estimatedAnnualKwh: number
  offsetPct: number
  status: 'planned' | 'installing' | 'commissioned'
  federalCredit: number
  stateIncentives: number
}

interface CarbonAlternative {
  id: string
  standardMaterial: string
  alternativeMaterial: string
  carbonReductionPct: number
  costPremiumPct: number
  recommendationScore: number
  availability: 'readily_available' | 'special_order' | 'limited'
}

// ── Mock Data ───────────────────────────────────────────────────────────

const carbonMetrics: CarbonMetric[] = [
  {
    label: 'Total Carbon Tracked',
    value: '847,250',
    unit: 'kg CO2e',
    change: 'Across 4 active projects',
    status: 'neutral',
    icon: Factory,
  },
  {
    label: 'Avg Carbon Intensity',
    value: '42.3',
    unit: 'kg/sqft',
    change: '-18% vs baseline',
    trend: 'down',
    status: 'success',
    icon: Target,
  },
  {
    label: 'Waste Diverted',
    value: '78%',
    change: '+12% vs industry avg',
    trend: 'up',
    status: 'success',
    icon: Recycle,
  },
  {
    label: 'Local Materials',
    value: '65%',
    change: 'Within 500 mi radius',
    status: 'success',
    icon: Truck,
  },
  {
    label: 'EPD Coverage',
    value: '34%',
    change: '68 materials documented',
    status: 'warning',
    icon: FileText,
  },
  {
    label: 'Active Certifications',
    value: '3',
    change: '2 LEED, 1 ENERGY STAR',
    status: 'success',
    icon: Award,
  },
]

const projectCarbonData: ProjectCarbon[] = [
  {
    id: '1',
    projectName: 'Smith Residence',
    squareFootage: 4200,
    targetCarbonPerSqft: 50,
    actualCarbonPerSqft: 38.5,
    totalCarbonKg: 161700,
    baselineKg: 210000,
    percentOfTarget: 77,
    certificationGoal: 'LEED Silver',
    status: 'on_track',
    wasteDiversionPct: 82,
    renewableEnergy: '12.5 kW Solar PV',
    lastUpdated: 'Today',
  },
  {
    id: '2',
    projectName: 'Johnson Beach House',
    squareFootage: 5800,
    targetCarbonPerSqft: 45,
    actualCarbonPerSqft: 44.2,
    totalCarbonKg: 256360,
    baselineKg: 290000,
    percentOfTarget: 98,
    certificationGoal: 'ENERGY STAR',
    status: 'at_risk',
    wasteDiversionPct: 71,
    renewableEnergy: '8.2 kW Solar PV',
    lastUpdated: 'Yesterday',
  },
  {
    id: '3',
    projectName: 'Harbor View Custom Home',
    squareFootage: 6500,
    targetCarbonPerSqft: 55,
    actualCarbonPerSqft: 42.1,
    totalCarbonKg: 273650,
    baselineKg: 357500,
    percentOfTarget: 77,
    certificationGoal: 'LEED Gold',
    status: 'on_track',
    wasteDiversionPct: 85,
    renewableEnergy: '15 kW Solar + Battery',
    lastUpdated: '2 days ago',
  },
  {
    id: '4',
    projectName: 'Miller Addition',
    squareFootage: 1800,
    targetCarbonPerSqft: 60,
    actualCarbonPerSqft: 52.3,
    totalCarbonKg: 94140,
    baselineKg: 108000,
    percentOfTarget: 87,
    status: 'on_track',
    wasteDiversionPct: 68,
    lastUpdated: '3 days ago',
  },
]

const materialCarbonData: MaterialCarbon[] = [
  {
    id: '1',
    category: 'Concrete',
    materialType: 'Ready-Mix Concrete (4000 PSI)',
    manufacturer: 'CEMEX',
    carbonPerUnit: 410,
    unit: 'kg CO2e/cubic yard',
    epdAvailable: true,
    certifications: ['EPD Verified'],
    dataSource: 'manufacturer',
    hasAlternative: true,
    alternativeSavingsPct: 30,
  },
  {
    id: '2',
    category: 'Concrete',
    materialType: 'Low-Carbon Concrete Mix',
    manufacturer: 'CEMEX',
    carbonPerUnit: 287,
    unit: 'kg CO2e/cubic yard',
    epdAvailable: true,
    certifications: ['EPD Verified', 'LEED Credit'],
    dataSource: 'manufacturer',
    hasAlternative: false,
  },
  {
    id: '3',
    category: 'Steel',
    materialType: 'Structural Steel (Wide Flange)',
    carbonPerUnit: 1.85,
    unit: 'kg CO2e/kg',
    epdAvailable: false,
    certifications: [],
    dataSource: 'industry_average',
    hasAlternative: true,
    alternativeSavingsPct: 45,
  },
  {
    id: '4',
    category: 'Lumber',
    materialType: 'Framing Lumber (SPF)',
    manufacturer: 'Weyerhaeuser',
    carbonPerUnit: 0.45,
    unit: 'kg CO2e/board foot',
    epdAvailable: true,
    certifications: ['FSC Certified', 'EPD Verified'],
    dataSource: 'manufacturer',
    hasAlternative: false,
  },
  {
    id: '5',
    category: 'Insulation',
    materialType: 'Fiberglass Batt (R-30)',
    manufacturer: 'Owens Corning',
    carbonPerUnit: 1.2,
    unit: 'kg CO2e/sqft',
    epdAvailable: true,
    certifications: ['GREENGUARD', 'EPD Verified'],
    dataSource: 'manufacturer',
    hasAlternative: true,
    alternativeSavingsPct: 65,
  },
  {
    id: '6',
    category: 'Insulation',
    materialType: 'Cellulose Insulation (R-30)',
    manufacturer: 'GreenFiber',
    carbonPerUnit: 0.42,
    unit: 'kg CO2e/sqft',
    epdAvailable: true,
    certifications: ['GREENGUARD', 'EPD Verified', '85% Recycled'],
    dataSource: 'manufacturer',
    hasAlternative: false,
  },
  {
    id: '7',
    category: 'Roofing',
    materialType: 'Asphalt Shingles (30-yr)',
    carbonPerUnit: 3.2,
    unit: 'kg CO2e/sqft',
    epdAvailable: false,
    certifications: [],
    dataSource: 'epa',
    hasAlternative: true,
    alternativeSavingsPct: 25,
  },
  {
    id: '8',
    category: 'Drywall',
    materialType: 'Gypsum Board (1/2")',
    manufacturer: 'USG',
    carbonPerUnit: 2.1,
    unit: 'kg CO2e/sqft',
    epdAvailable: true,
    certifications: ['EPD Verified'],
    dataSource: 'manufacturer',
    hasAlternative: false,
  },
]

const greenCertifications: GreenCertification[] = [
  {
    id: '1',
    projectName: 'Smith Residence',
    certificationType: 'LEED',
    targetLevel: 'Silver',
    status: 'in_progress',
    pointsTargeted: 55,
    pointsAchieved: 42,
    pointsPossible: 110,
    verifier: 'USGBC',
  },
  {
    id: '2',
    projectName: 'Harbor View Custom Home',
    certificationType: 'LEED',
    targetLevel: 'Gold',
    status: 'in_progress',
    pointsTargeted: 68,
    pointsAchieved: 51,
    pointsPossible: 110,
    verifier: 'USGBC',
  },
  {
    id: '3',
    projectName: 'Johnson Beach House',
    certificationType: 'ENERGY STAR',
    targetLevel: 'Certified',
    status: 'submitted',
    pointsTargeted: 100,
    pointsAchieved: 100,
    pointsPossible: 100,
    submissionDate: 'Feb 5, 2026',
    verifier: 'EPA',
  },
]

const certificationCredits: CertificationCredit[] = [
  { id: '1', category: 'Location & Transportation', creditCode: 'LT Credit 2', creditName: 'Sensitive Land Protection', pointsPossible: 1, pointsTargeted: 1, pointsAchieved: 1, status: 'achieved' },
  { id: '2', category: 'Sustainable Sites', creditCode: 'SS Credit 2', creditName: 'Landscaping', pointsPossible: 2, pointsTargeted: 2, pointsAchieved: 2, status: 'achieved' },
  { id: '3', category: 'Water Efficiency', creditCode: 'WE Credit 1', creditName: 'Water Metering', pointsPossible: 1, pointsTargeted: 1, pointsAchieved: 1, status: 'achieved' },
  { id: '4', category: 'Water Efficiency', creditCode: 'WE Credit 2', creditName: 'Indoor Water Use Reduction', pointsPossible: 6, pointsTargeted: 4, pointsAchieved: 4, status: 'achieved' },
  { id: '5', category: 'Energy & Atmosphere', creditCode: 'EA Prereq 1', creditName: 'Minimum Energy Performance', pointsPossible: 0, pointsTargeted: 0, pointsAchieved: 0, status: 'achieved' },
  { id: '6', category: 'Energy & Atmosphere', creditCode: 'EA Credit 1', creditName: 'Annual Energy Use', pointsPossible: 29, pointsTargeted: 18, pointsAchieved: 15, status: 'in_progress', dueDate: 'Feb 28' },
  { id: '7', category: 'Materials & Resources', creditCode: 'MR Credit 1', creditName: 'Certified Tropical Wood', pointsPossible: 1, pointsTargeted: 1, pointsAchieved: 1, status: 'achieved' },
  { id: '8', category: 'Materials & Resources', creditCode: 'MR Credit 2', creditName: 'Environmentally Preferable Products', pointsPossible: 4, pointsTargeted: 3, pointsAchieved: 2, status: 'in_progress', responsibleParty: 'Jake Ross', dueDate: 'Mar 15' },
  { id: '9', category: 'Materials & Resources', creditCode: 'MR Credit 3', creditName: 'Construction Waste Management', pointsPossible: 3, pointsTargeted: 3, pointsAchieved: 0, status: 'documentation_ready' },
  { id: '10', category: 'Indoor Environmental Quality', creditCode: 'EQ Credit 2', creditName: 'Combustion Venting', pointsPossible: 2, pointsTargeted: 2, pointsAchieved: 2, status: 'achieved' },
  { id: '11', category: 'Indoor Environmental Quality', creditCode: 'EQ Credit 7', creditName: 'Low-Emitting Products', pointsPossible: 3, pointsTargeted: 2, pointsAchieved: 0, status: 'in_progress', responsibleParty: 'Sarah Johnson' },
]

const wasteTracking: WasteEntry[] = [
  { id: '1', projectName: 'Smith Residence', wasteType: 'Wood', quantity: 2.5, unit: 'tons', disposition: 'recycled', date: 'Feb 8', hauler: 'GreenWaste Inc', rebate: 125 },
  { id: '2', projectName: 'Smith Residence', wasteType: 'Concrete', quantity: 4.2, unit: 'tons', disposition: 'recycled', date: 'Feb 6', hauler: 'RecycleCo', rebate: 210 },
  { id: '3', projectName: 'Smith Residence', wasteType: 'Drywall', quantity: 1.8, unit: 'tons', disposition: 'recycled', date: 'Feb 5', hauler: 'GreenWaste Inc' },
  { id: '4', projectName: 'Johnson Beach House', wasteType: 'Mixed Construction', quantity: 3.1, unit: 'tons', disposition: 'landfill', date: 'Feb 7', hauler: 'County Disposal', cost: 465 },
  { id: '5', projectName: 'Johnson Beach House', wasteType: 'Cardboard', quantity: 0.8, unit: 'tons', disposition: 'recycled', date: 'Feb 4', hauler: 'RecycleCo' },
  { id: '6', projectName: 'Harbor View Custom Home', wasteType: 'Metal', quantity: 1.2, unit: 'tons', disposition: 'recycled', date: 'Feb 3', hauler: 'Scrap Metal Depot', rebate: 480 },
  { id: '7', projectName: 'Harbor View Custom Home', wasteType: 'Wood', quantity: 2.8, unit: 'tons', disposition: 'reused_offsite', date: 'Feb 2', hauler: 'Habitat ReStore' },
]

const renewableSystems: RenewableSystem[] = [
  { id: '1', projectName: 'Smith Residence', systemType: 'Solar PV', capacityKw: 12.5, estimatedAnnualKwh: 16250, offsetPct: 85, status: 'commissioned', federalCredit: 7500, stateIncentives: 2500 },
  { id: '2', projectName: 'Johnson Beach House', systemType: 'Solar PV', capacityKw: 8.2, estimatedAnnualKwh: 10660, offsetPct: 65, status: 'installing', federalCredit: 4920, stateIncentives: 1640 },
  { id: '3', projectName: 'Harbor View Custom Home', systemType: 'Solar PV + Battery', capacityKw: 15.0, estimatedAnnualKwh: 19500, offsetPct: 95, status: 'planned', federalCredit: 12000, stateIncentives: 4000 },
  { id: '4', projectName: 'Harbor View Custom Home', systemType: 'Geothermal', capacityKw: 5.0, estimatedAnnualKwh: 0, offsetPct: 0, status: 'planned', federalCredit: 4500, stateIncentives: 2250 },
]

const carbonAlternatives: CarbonAlternative[] = [
  { id: '1', standardMaterial: 'Standard Concrete (4000 PSI)', alternativeMaterial: 'Low-Carbon Concrete Mix', carbonReductionPct: 30, costPremiumPct: 8, recommendationScore: 5, availability: 'readily_available' },
  { id: '2', standardMaterial: 'Fiberglass Insulation', alternativeMaterial: 'Cellulose Insulation', carbonReductionPct: 65, costPremiumPct: -5, recommendationScore: 5, availability: 'readily_available' },
  { id: '3', standardMaterial: 'Virgin Steel', alternativeMaterial: 'Recycled Steel (95% content)', carbonReductionPct: 45, costPremiumPct: 3, recommendationScore: 4, availability: 'readily_available' },
  { id: '4', standardMaterial: 'Asphalt Shingles', alternativeMaterial: 'Metal Roofing (recycled)', carbonReductionPct: 25, costPremiumPct: 45, recommendationScore: 3, availability: 'readily_available' },
  { id: '5', standardMaterial: 'XPS Foam Insulation', alternativeMaterial: 'Mineral Wool', carbonReductionPct: 80, costPremiumPct: 15, recommendationScore: 4, availability: 'special_order' },
]

// ── Helper Functions ────────────────────────────────────────────────────

function getStatusColor(status: ProjectCarbon['status']): string {
  switch (status) {
    case 'on_track': return 'bg-green-100 text-green-700'
    case 'at_risk': return 'bg-amber-100 text-amber-700'
    case 'over_target': return 'bg-red-100 text-red-700'
    case 'completed': return 'bg-stone-100 text-stone-700'
    default: return 'bg-warm-100 text-warm-700'
  }
}

function getCertStatusColor(status: GreenCertification['status']): string {
  switch (status) {
    case 'certified': return 'bg-green-100 text-green-700'
    case 'submitted': return 'bg-stone-100 text-stone-700'
    case 'in_progress': return 'bg-amber-100 text-amber-700'
    case 'registered': return 'bg-warm-100 text-warm-700'
    case 'planning': return 'bg-warm-50 text-warm-600'
    default: return 'bg-warm-100 text-warm-700'
  }
}

function getCreditStatusColor(status: CertificationCredit['status']): string {
  switch (status) {
    case 'achieved': return 'bg-green-100 text-green-700'
    case 'submitted': return 'bg-stone-100 text-stone-700'
    case 'documentation_ready': return 'bg-stone-50 text-stone-600'
    case 'in_progress': return 'bg-amber-100 text-amber-700'
    case 'not_started': return 'bg-warm-50 text-warm-500'
    case 'not_pursued': return 'bg-warm-100 text-warm-400'
    default: return 'bg-warm-100 text-warm-700'
  }
}

function getDispositionColor(disposition: WasteEntry['disposition']): string {
  switch (disposition) {
    case 'recycled': return 'bg-green-100 text-green-700'
    case 'reused_onsite': return 'bg-green-100 text-green-700'
    case 'reused_offsite': return 'bg-green-100 text-green-700'
    case 'donated': return 'bg-stone-100 text-stone-700'
    case 'composted': return 'bg-green-100 text-green-700'
    case 'landfill': return 'bg-warm-100 text-warm-600'
    default: return 'bg-warm-100 text-warm-700'
  }
}

// ── Sub-components ──────────────────────────────────────────────────────

function MetricCard({ metric }: { metric: CarbonMetric }) {
  const Icon = metric.icon

  return (
    <div className={cn(
      "rounded-lg p-3",
      metric.status === 'success' ? "bg-green-50" :
      metric.status === 'warning' ? "bg-amber-50" :
      metric.status === 'danger' ? "bg-red-50" :
      "bg-warm-50"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className={cn(
          "p-2 rounded-lg",
          metric.status === 'success' ? "bg-green-100" :
          metric.status === 'warning' ? "bg-amber-100" :
          metric.status === 'danger' ? "bg-red-100" :
          "bg-warm-100"
        )}>
          <Icon className={cn(
            "h-5 w-5",
            metric.status === 'success' ? "text-green-600" :
            metric.status === 'warning' ? "text-amber-600" :
            metric.status === 'danger' ? "text-red-600" :
            "text-warm-600"
          )} />
        </div>
        {metric.change ? <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            metric.trend === 'down' ? "text-green-600" :
            metric.trend === 'up' && metric.status === 'success' ? "text-green-600" :
            metric.trend === 'up' && metric.status === 'warning' ? "text-amber-600" :
            "text-warm-600"
          )}>
            {metric.trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {metric.trend === 'down' && <TrendingDown className="h-3 w-3" />}
            {metric.change}
          </div> : null}
      </div>
      <div className="text-2xl font-bold text-warm-900">
        {metric.value}
        {metric.unit ? <span className="text-sm font-normal text-warm-500 ml-1">{metric.unit}</span> : null}
      </div>
      <div className="text-sm text-warm-500">{metric.label}</div>
    </div>
  )
}

function ProjectCarbonCard({ project }: { project: ProjectCarbon }) {
  const progressPct = Math.min(100, project.percentOfTarget)
  const savingsKg = project.baselineKg - project.totalCarbonKg
  const savingsPct = Math.round((savingsKg / project.baselineKg) * 100)

  return (
    <div className="bg-white rounded-lg border border-warm-200 p-4 hover:border-green-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-warm-900">{project.projectName}</h4>
            <span className={cn("text-xs px-2 py-0.5 rounded font-medium", getStatusColor(project.status))}>
              {project.status === 'on_track' ? 'On Track' :
               project.status === 'at_risk' ? 'At Risk' :
               project.status === 'over_target' ? 'Over Target' : 'Completed'}
            </span>
          </div>
          <p className="text-xs text-warm-500 mt-0.5">
            {project.squareFootage.toLocaleString()} sqft
            {project.certificationGoal ? <span className="ml-2 text-green-600">{project.certificationGoal}</span> : null}
          </p>
        </div>
        <button className="p-1 hover:bg-warm-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-warm-400" />
        </button>
      </div>

      {/* Carbon Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-warm-500">Carbon vs Target</span>
          <span className={cn(
            "font-medium",
            project.percentOfTarget <= 85 ? "text-green-600" :
            project.percentOfTarget <= 100 ? "text-amber-600" :
            "text-red-600"
          )}>
            {project.actualCarbonPerSqft} / {project.targetCarbonPerSqft} kg/sqft ({project.percentOfTarget}%)
          </span>
        </div>
        <div className="h-2 bg-warm-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              project.percentOfTarget <= 85 ? "bg-green-500" :
              project.percentOfTarget <= 100 ? "bg-amber-500" :
              "bg-red-500"
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-warm-50 rounded p-2">
          <div className="text-sm font-bold text-warm-900">{(project.totalCarbonKg / 1000).toFixed(1)}t</div>
          <div className="text-xs text-warm-500">Total CO2e</div>
        </div>
        <div className="bg-green-50 rounded p-2">
          <div className="text-sm font-bold text-green-700">-{savingsPct}%</div>
          <div className="text-xs text-green-600">vs Baseline</div>
        </div>
        <div className="bg-green-50 rounded p-2">
          <div className="text-sm font-bold text-green-700">{project.wasteDiversionPct}%</div>
          <div className="text-xs text-green-600">Waste Diverted</div>
        </div>
      </div>

      {/* Renewable Energy */}
      {project.renewableEnergy ? <div className="mt-3 flex items-center gap-2 text-xs text-stone-600 bg-stone-50 rounded px-2 py-1">
          <Sun className="h-3 w-3" />
          {project.renewableEnergy}
        </div> : null}

      <div className="mt-3 flex items-center justify-between text-xs text-warm-400">
        <span>Updated {project.lastUpdated}</span>
        <button className="text-green-600 hover:text-green-700 flex items-center gap-1">
          View Details <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

function MaterialRow({ material }: { material: MaterialCarbon }) {
  return (
    <tr className="border-b border-warm-100 hover:bg-warm-50">
      <td className="px-3 py-2">
        <div className="text-sm font-medium text-warm-900">{material.materialType}</div>
        <div className="text-xs text-warm-500">{material.category}</div>
      </td>
      <td className="px-3 py-2 text-sm text-warm-600">
        {material.manufacturer || <span className="text-warm-400 italic">Various</span>}
      </td>
      <td className="px-3 py-2 text-right">
        <div className="text-sm font-medium text-warm-900">{material.carbonPerUnit}</div>
        <div className="text-xs text-warm-500">{material.unit}</div>
      </td>
      <td className="px-3 py-2 text-center">
        {material.epdAvailable ? (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">EPD</span>
        ) : (
          <span className="text-xs text-warm-400">-</span>
        )}
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {material.certifications.map((cert, i) => (
            <span key={i} className="text-xs bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
              {cert}
            </span>
          ))}
          {material.certifications.length === 0 && (
            <span className="text-xs text-warm-400">None</span>
          )}
        </div>
      </td>
      <td className="px-3 py-2 text-center">
        {material.hasAlternative ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1 w-fit mx-auto">
            <Leaf className="h-3 w-3" />
            -{material.alternativeSavingsPct}%
          </span> : null}
      </td>
    </tr>
  )
}

function CreditRow({ credit }: { credit: CertificationCredit }) {
  return (
    <tr className="border-b border-warm-100 hover:bg-warm-50">
      <td className="px-3 py-2 text-xs text-warm-500">{credit.creditCode}</td>
      <td className="px-3 py-2">
        <div className="text-sm text-warm-900">{credit.creditName}</div>
        <div className="text-xs text-warm-500">{credit.category}</div>
      </td>
      <td className="px-3 py-2 text-center text-sm text-warm-600">
        {credit.pointsAchieved}/{credit.pointsTargeted}
        <span className="text-warm-400 text-xs ml-1">of {credit.pointsPossible}</span>
      </td>
      <td className="px-3 py-2 text-center">
        <span className={cn("text-xs px-2 py-0.5 rounded", getCreditStatusColor(credit.status))}>
          {credit.status === 'achieved' ? 'Achieved' :
           credit.status === 'submitted' ? 'Submitted' :
           credit.status === 'documentation_ready' ? 'Docs Ready' :
           credit.status === 'in_progress' ? 'In Progress' :
           credit.status === 'not_started' ? 'Not Started' : 'Not Pursued'}
        </span>
      </td>
      <td className="px-3 py-2 text-xs text-warm-500">{credit.responsibleParty || '-'}</td>
      <td className="px-3 py-2 text-xs text-warm-500">{credit.dueDate || '-'}</td>
    </tr>
  )
}

function WasteRow({ entry }: { entry: WasteEntry }) {
  const isGreen = entry.disposition !== 'landfill'

  return (
    <tr className="border-b border-warm-100 hover:bg-warm-50">
      <td className="px-3 py-2 text-sm text-warm-900">{entry.projectName}</td>
      <td className="px-3 py-2 text-sm text-warm-600">{entry.wasteType}</td>
      <td className="px-3 py-2 text-sm text-warm-900 text-right">{entry.quantity} {entry.unit}</td>
      <td className="px-3 py-2 text-center">
        <span className={cn("text-xs px-2 py-0.5 rounded capitalize", getDispositionColor(entry.disposition))}>
          {entry.disposition.replace('_', ' ')}
        </span>
      </td>
      <td className="px-3 py-2 text-xs text-warm-500">{entry.hauler || '-'}</td>
      <td className="px-3 py-2 text-xs text-warm-500">{entry.date}</td>
      <td className="px-3 py-2 text-right">
        {entry.rebate ? (
          <span className="text-xs text-green-600 font-medium">+${entry.rebate}</span>
        ) : entry.cost ? (
          <span className="text-xs text-warm-600">-${entry.cost}</span>
        ) : (
          <span className="text-xs text-warm-400">-</span>
        )}
      </td>
    </tr>
  )
}

function AlternativeCard({ alt }: { alt: CarbonAlternative }) {
  return (
    <div className="bg-white rounded-lg border border-green-200 p-4 hover:border-green-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <Leaf className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="text-xs text-warm-500">Replace</div>
            <div className="text-sm font-medium text-warm-700">{alt.standardMaterial}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(alt.recommendationScore)].map((_, i) => (
            <CircleDot key={i} className="h-3 w-3 text-green-500" />
          ))}
          {[...Array(5 - alt.recommendationScore)].map((_, i) => (
            <CircleDot key={i} className="h-3 w-3 text-warm-200" />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 my-2 text-warm-400">
        <ArrowRight className="h-4 w-4" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-green-50 rounded-lg">
          <BadgeCheck className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <div className="text-xs text-green-600">With</div>
          <div className="text-sm font-medium text-green-700">{alt.alternativeMaterial}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-green-50 rounded p-2">
          <div className="text-sm font-bold text-green-700">-{alt.carbonReductionPct}%</div>
          <div className="text-xs text-green-600">Carbon</div>
        </div>
        <div className={cn(
          "rounded p-2",
          alt.costPremiumPct <= 0 ? "bg-green-50" : alt.costPremiumPct <= 10 ? "bg-amber-50" : "bg-red-50"
        )}>
          <div className={cn(
            "text-sm font-bold",
            alt.costPremiumPct <= 0 ? "text-green-700" : alt.costPremiumPct <= 10 ? "text-amber-700" : "text-red-700"
          )}>
            {alt.costPremiumPct > 0 ? '+' : ''}{alt.costPremiumPct}%
          </div>
          <div className={cn(
            "text-xs",
            alt.costPremiumPct <= 0 ? "text-green-600" : alt.costPremiumPct <= 10 ? "text-amber-600" : "text-red-600"
          )}>Cost</div>
        </div>
        <div className="bg-warm-50 rounded p-2">
          <div className="text-sm font-bold text-warm-700 capitalize">{alt.availability.replace('_', ' ')}</div>
          <div className="text-xs text-warm-500">Availability</div>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────

export function SustainabilityPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({ defaultTab: 'dashboard' })
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProject, setSelectedProject] = useState('all')

  const filteredMaterials = sortItems(
    materialCarbonData.filter(mat => {
      if (!matchesSearch(mat, search, ['materialType', 'category', 'manufacturer'])) return false
      if (selectedCategory !== 'all' && mat.category !== selectedCategory) return false
      return true
    }),
    activeSort as keyof MaterialCarbon | '',
    sortDirection,
  )

  const filteredWaste = sortItems(
    wasteTracking.filter(entry => {
      if (!matchesSearch(entry, search, ['projectName', 'wasteType', 'hauler'])) return false
      if (selectedProject !== 'all' && entry.projectName !== selectedProject) return false
      return true
    }),
    activeSort as keyof WasteEntry | '',
    sortDirection,
  )

  // Calculate waste summary
  const totalWaste = wasteTracking.reduce((sum, e) => sum + e.quantity, 0)
  const divertedWaste = wasteTracking.filter(e => e.disposition !== 'landfill').reduce((sum, e) => sum + e.quantity, 0)
  const diversionRate = Math.round((divertedWaste / totalWaste) * 100)

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-warm-900 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Sustainability & ESG
            </h3>
            <p className="text-sm text-warm-500">Carbon tracking, green certifications, waste diversion & ESG reporting</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Package className="h-4 w-4" />
              Material Lookup
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Download className="h-4 w-4" />
              ESG Report
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Recycle className="h-4 w-4" />
              Log Waste
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar with Tabs */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search sustainability data..."
          tabs={[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'projects', label: 'Project Carbon', count: projectCarbonData.length },
            { key: 'materials', label: 'Material Database', count: materialCarbonData.length },
            { key: 'certifications', label: 'Certifications', count: greenCertifications.length },
            { key: 'waste', label: 'Waste Tracking' },
            { key: 'renewable', label: 'Renewable Energy' },
            { key: 'alternatives', label: 'Green Alternatives' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={
            activeTab === 'materials'
              ? [
                  {
                    label: 'All Categories',
                    value: selectedCategory,
                    options: [
                      { value: 'Concrete', label: 'Concrete' },
                      { value: 'Steel', label: 'Steel' },
                      { value: 'Lumber', label: 'Lumber' },
                      { value: 'Insulation', label: 'Insulation' },
                      { value: 'Roofing', label: 'Roofing' },
                      { value: 'Drywall', label: 'Drywall' },
                    ],
                    onChange: setSelectedCategory,
                  },
                ]
              : activeTab === 'waste'
              ? [
                  {
                    label: 'All Projects',
                    value: selectedProject,
                    options: projectCarbonData.map(p => ({ value: p.projectName, label: p.projectName })),
                    onChange: setSelectedProject,
                  },
                ]
              : []
          }
          sortOptions={
            activeTab === 'materials'
              ? [
                  { value: 'carbonPerUnit', label: 'Carbon Impact' },
                  { value: 'category', label: 'Category' },
                  { value: 'materialType', label: 'Material' },
                ]
              : activeTab === 'waste'
              ? [
                  { value: 'date', label: 'Date' },
                  { value: 'quantity', label: 'Quantity' },
                  { value: 'projectName', label: 'Project' },
                ]
              : []
          }
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Download, label: 'Export', onClick: () => {} },
          ]}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* ── Dashboard Tab ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Metrics */}
            <div className="grid grid-cols-6 gap-3">
              {carbonMetrics.map((metric, i) => (
                <MetricCard key={i} metric={metric} />
              ))}
            </div>

            {/* Cross-module connections */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-warm-500">Integrated with:</span>
              {[
                { label: 'Estimating', color: 'bg-stone-50 text-stone-700' },
                { label: 'Selections', color: 'bg-green-50 text-green-700' },
                { label: 'Purchase Orders', color: 'bg-warm-50 text-warm-700' },
                { label: 'Invoices', color: 'bg-sand-50 text-sand-700' },
                { label: 'Client Portal', color: 'bg-stone-50 text-stone-700' },
              ].map(badge => (
                <span key={badge.label} className={cn("text-xs px-2 py-0.5 rounded flex items-center gap-1", badge.color)}>
                  <Leaf className="h-3 w-3" />
                  {badge.label}
                </span>
              ))}
            </div>

            {/* Projects Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-warm-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-warm-500" />
                  Active Projects Carbon Summary
                </h4>
                <button className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1">
                  View All <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {projectCarbonData.map(project => (
                  <ProjectCarbonCard key={project.id} project={project} />
                ))}
              </div>
            </div>

            {/* Bottom Row - Certifications + Waste */}
            <div className="grid grid-cols-2 gap-4">
              {/* Certifications Summary */}
              <div className="bg-white rounded-lg border border-warm-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-warm-900 flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-600" />
                    Green Certifications
                  </h4>
                  <button className="text-xs text-green-600 hover:text-green-700">View Details</button>
                </div>
                <div className="space-y-3">
                  {greenCertifications.map(cert => (
                    <div key={cert.id} className="flex items-center justify-between py-2 border-b border-warm-100 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-warm-900">{cert.projectName}</div>
                        <div className="text-xs text-warm-500">{cert.certificationType} {cert.targetLevel}</div>
                      </div>
                      <div className="text-right">
                        <span className={cn("text-xs px-2 py-0.5 rounded", getCertStatusColor(cert.status))}>
                          {cert.status === 'certified' ? 'Certified' :
                           cert.status === 'submitted' ? 'Submitted' :
                           cert.status === 'in_progress' ? 'In Progress' :
                           cert.status === 'registered' ? 'Registered' : 'Planning'}
                        </span>
                        <div className="text-xs text-warm-500 mt-1">
                          {cert.pointsAchieved}/{cert.pointsTargeted} pts
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Waste Summary */}
              <div className="bg-white rounded-lg border border-warm-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-warm-900 flex items-center gap-2">
                    <Recycle className="h-4 w-4 text-green-600" />
                    Waste Diversion (All Projects)
                  </h4>
                  <button className="text-xs text-green-600 hover:text-green-700">Log Entry</button>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-warm-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-warm-900">{totalWaste.toFixed(1)}t</div>
                    <div className="text-xs text-warm-500">Total Waste</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-green-700">{divertedWaste.toFixed(1)}t</div>
                    <div className="text-xs text-green-600">Diverted</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-green-700">{diversionRate}%</div>
                    <div className="text-xs text-green-600">Diversion Rate</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {['recycled', 'reused_offsite', 'donated', 'landfill'].map(disposition => {
                    const qty = wasteTracking.filter(w => w.disposition === disposition).reduce((s, w) => s + w.quantity, 0)
                    const pct = Math.round((qty / totalWaste) * 100)
                    return (
                      <div key={disposition} className="flex items-center gap-2">
                        <div className="w-24 text-xs text-warm-600 capitalize">{disposition.replace('_', ' ')}</div>
                        <div className="flex-1 h-2 bg-warm-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              disposition === 'landfill' ? "bg-warm-400" : "bg-green-500"
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="w-12 text-xs text-right text-warm-600">{pct}%</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Projects Tab ── */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-2 gap-4">
            {projectCarbonData.map(project => (
              <ProjectCarbonCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/* ── Materials Tab ── */}
        {activeTab === 'materials' && (
          <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-warm-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-warm-500">Material</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-warm-500">Manufacturer</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-warm-500">Carbon Impact</th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-warm-500">EPD</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-warm-500">Certifications</th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-warm-500">Green Alt</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map(mat => (
                  <MaterialRow key={mat.id} material={mat} />
                ))}
              </tbody>
            </table>
            {filteredMaterials.length === 0 && (
              <div className="text-center py-12 text-warm-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-warm-300" />
                <p>No materials found matching your search</p>
              </div>
            )}
          </div>
        )}

        {/* ── Certifications Tab ── */}
        {activeTab === 'certifications' && (
          <div className="space-y-4">
            {greenCertifications.map(cert => (
              <div key={cert.id} className="bg-white rounded-lg border border-warm-200 p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Award className={cn(
                        "h-5 w-5",
                        cert.certificationType === 'LEED' ? "text-green-600" : "text-stone-600"
                      )} />
                      <h4 className="font-medium text-warm-900">{cert.projectName}</h4>
                      <span className={cn("text-xs px-2 py-0.5 rounded font-medium", getCertStatusColor(cert.status))}>
                        {cert.status === 'certified' ? 'Certified' :
                         cert.status === 'submitted' ? 'Submitted' :
                         cert.status === 'in_progress' ? 'In Progress' :
                         cert.status === 'registered' ? 'Registered' : 'Planning'}
                      </span>
                    </div>
                    <p className="text-sm text-warm-500 mt-1">
                      {cert.certificationType} {cert.targetLevel} &middot; Verifier: {cert.verifier}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-warm-900">
                      {cert.pointsAchieved}<span className="text-sm font-normal text-warm-500">/{cert.pointsTargeted} pts</span>
                    </div>
                    <div className="text-xs text-warm-500">{cert.pointsPossible} possible</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="h-3 bg-warm-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(cert.pointsAchieved / cert.pointsTargeted) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-warm-500 mt-1">
                    <span>{Math.round((cert.pointsAchieved / cert.pointsTargeted) * 100)}% of target achieved</span>
                    <span>{cert.pointsTargeted - cert.pointsAchieved} pts remaining</span>
                  </div>
                </div>

                {/* Credits Table */}
                {cert.projectName === 'Smith Residence' && (
                  <div className="border border-warm-100 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-warm-50">
                        <tr>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-warm-500 w-20">Code</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-warm-500">Credit</th>
                          <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-warm-500 w-24">Points</th>
                          <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-warm-500 w-28">Status</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-warm-500 w-24">Owner</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-warm-500 w-20">Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {certificationCredits.map(credit => (
                          <CreditRow key={credit.id} credit={credit} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Waste Tab ── */}
        {activeTab === 'waste' && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-warm-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-warm-900">{totalWaste.toFixed(1)}t</div>
                <div className="text-xs text-warm-500">Total Waste</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-700">{divertedWaste.toFixed(1)}t</div>
                <div className="text-xs text-green-600">Diverted from Landfill</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-700">{diversionRate}%</div>
                <div className="text-xs text-green-600">Diversion Rate</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-700">
                  ${wasteTracking.reduce((s, w) => s + (w.rebate || 0), 0)}
                </div>
                <div className="text-xs text-green-600">Recycling Rebates</div>
              </div>
            </div>

            {/* Waste Table */}
            <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-warm-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-warm-500">Project</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-warm-500">Waste Type</th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-warm-500">Quantity</th>
                    <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-warm-500">Disposition</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-warm-500">Hauler</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-warm-500">Date</th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-warm-500">Cost/Rebate</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWaste.map(entry => (
                    <WasteRow key={entry.id} entry={entry} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Renewable Energy Tab ── */}
        {activeTab === 'renewable' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {renewableSystems.map(system => (
                <div key={system.id} className="bg-white rounded-lg border border-warm-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-2 rounded-lg",
                        system.systemType.includes('Solar') ? "bg-amber-100" :
                        system.systemType.includes('Geothermal') ? "bg-stone-100" :
                        "bg-stone-100"
                      )}>
                        {system.systemType.includes('Solar') ? (
                          <Sun className="h-5 w-5 text-amber-600" />
                        ) : system.systemType.includes('Geothermal') ? (
                          <Globe className="h-5 w-5 text-stone-600" />
                        ) : (
                          <Zap className="h-5 w-5 text-stone-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-warm-900">{system.systemType}</h4>
                        <p className="text-xs text-warm-500">{system.projectName}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded font-medium",
                      system.status === 'commissioned' ? "bg-green-100 text-green-700" :
                      system.status === 'installing' ? "bg-amber-100 text-amber-700" :
                      "bg-warm-100 text-warm-600"
                    )}>
                      {system.status === 'commissioned' ? 'Active' :
                       system.status === 'installing' ? 'Installing' : 'Planned'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-warm-50 rounded p-2 text-center">
                      <div className="text-sm font-bold text-warm-900">{system.capacityKw} kW</div>
                      <div className="text-xs text-warm-500">Capacity</div>
                    </div>
                    <div className="bg-amber-50 rounded p-2 text-center">
                      <div className="text-sm font-bold text-amber-700">{(system.estimatedAnnualKwh / 1000).toFixed(1)}k</div>
                      <div className="text-xs text-amber-600">kWh/year</div>
                    </div>
                    <div className="bg-green-50 rounded p-2 text-center">
                      <div className="text-sm font-bold text-green-700">{system.offsetPct}%</div>
                      <div className="text-xs text-green-600">Energy Offset</div>
                    </div>
                  </div>

                  <div className="border-t border-warm-100 pt-3">
                    <div className="text-xs text-warm-500 mb-1">Incentives</div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-green-600 font-medium">${system.federalCredit.toLocaleString()} Federal</span>
                      <span className="text-green-600 font-medium">${system.stateIncentives.toLocaleString()} State</span>
                      <span className="text-warm-400">|</span>
                      <span className="text-warm-700 font-bold">${(system.federalCredit + system.stateIncentives).toLocaleString()} Total</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-medium text-green-800">Total Renewable Capacity</div>
                    <div className="text-sm text-green-600">Across all projects</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-700">
                    {renewableSystems.reduce((s, r) => s + r.capacityKw, 0).toFixed(1)} kW
                  </div>
                  <div className="text-sm text-green-600">
                    {(renewableSystems.reduce((s, r) => s + r.estimatedAnnualKwh, 0) / 1000).toFixed(0)}k kWh/year estimated
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Alternatives Tab ── */}
        {activeTab === 'alternatives' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-medium text-green-800 text-sm">AI-Powered Green Alternatives</h5>
                  <p className="text-sm text-green-700 mt-1">
                    Based on your material usage patterns, here are recommended substitutions that can reduce your carbon footprint
                    while maintaining quality and performance.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {carbonAlternatives.map(alt => (
                <AlternativeCard key={alt.id} alt={alt} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-green-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-green-600" />
            <span className="font-medium text-sm text-green-800">Sustainability Intelligence:</span>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <p>
              Johnson Beach House is 98% of carbon target - consider low-carbon concrete for remaining foundation work to stay on track.
              Smith Residence achieving 82% waste diversion - 3 pts closer to LEED MR Credit 3.
            </p>
            <p>
              Harbor View using cellulose insulation reduced embodied carbon by 12,400 kg vs fiberglass baseline.
              3 POs this week contain materials with EPD-verified carbon data.
            </p>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="border-t border-warm-200 px-4 py-4 bg-white">
        <AIFeaturesPanel
          title="Sustainability AI Features"
          columns={2}
          features={[
            {
              feature: 'Carbon Footprint Tracking',
              trigger: 'On PO/Invoice',
              insight: 'Automatically calculates embodied carbon from material purchases using EPD data and industry averages.',
              severity: 'success',
              confidence: 89,
            },
            {
              feature: 'Green Alternative Suggestions',
              trigger: 'On Material Entry',
              insight: 'Recommends lower-carbon alternatives when high-impact materials are specified in estimates or POs.',
              severity: 'success',
              confidence: 85,
            },
            {
              feature: 'Certification Credit Tracking',
              trigger: 'Real-time',
              insight: 'Monitors LEED/ENERGY STAR credit progress and alerts when documentation is needed.',
              severity: 'info',
              confidence: 92,
            },
            {
              feature: 'ESG Report Generation',
              trigger: 'On-demand',
              insight: 'Generates client-ready sustainability reports with carbon metrics, waste diversion, and certification status.',
              severity: 'success',
              confidence: 94,
            },
            {
              feature: 'EPD Auto-Lookup',
              trigger: 'On Material Entry',
              insight: 'Searches manufacturer databases for Environmental Product Declarations and auto-populates carbon data.',
              severity: 'info',
              confidence: 78,
            },
            {
              feature: 'Waste Optimization',
              trigger: 'Weekly',
              insight: 'Analyzes waste patterns and suggests material ordering optimizations to reduce construction waste.',
              severity: 'warning',
              confidence: 81,
            },
          ]}
        />
      </div>
    </div>
  )
}
