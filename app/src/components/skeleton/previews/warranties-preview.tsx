'use client'

import { useState } from 'react'
import {
  Plus,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  MoreHorizontal,
  Sparkles,
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
  ExternalLink,
  Building2,
  Wrench,
  Zap,
  Droplets,
  Home,
  Thermometer,
  TrendingUp,
  DollarSign,
  ClipboardCheck,
  Users,
  Phone,
  Mail,
  Link2,
  Download,
  Target,
  BarChart3,
  CheckCircle2,
  XCircle,
  Play,
  Award,
  TrendingDown,
  Activity,
  Brain,
  ListChecks,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WarrantyStatus = 'active' | 'expiring_soon' | 'expired'
type WarrantyType = 'builder' | 'manufacturer' | 'workmanship' | 'extended'
type CoverageType = 'full' | 'parts' | 'labor' | 'limited'
type CategoryType = 'appliances' | 'roofing' | 'hvac' | 'plumbing' | 'electrical' | 'structural' | 'windows' | 'exterior' | 'finish'

interface Warranty {
  id: string
  itemName: string
  category: CategoryType
  warrantyType: WarrantyType
  vendor: string
  manufacturer?: string
  startDate: string
  endDate: string
  duration: string
  documentUrl?: string
  status: WarrantyStatus
  daysUntilExpiry?: number
  coverageType: CoverageType
  registrationNumber?: string
  claimContact?: string
  claimPhone?: string
  selectionLink?: string
  costToDate?: number
  claimCount?: number
  aiNote?: string
  // FTQ Quality Tracking fields
  originalConstructionFTQ?: number
  inspectionLink?: string
  repairFTQ?: number
  vendorCallbackRate?: number
}

interface WalkthroughSchedule {
  id: string
  type: '30_day' | '11_month' | '6_month' | '2_year' | 'custom'
  scheduledDate: string
  status: 'scheduled' | 'completed' | 'overdue'
  findingsCount?: number
  completedBy?: string
  homeownerSigned?: boolean
  // FTQ Checklist fields
  checklistId?: string
  checklistName?: string
  checklistCompletion?: number
  checklistFTQ?: number
  totalItems?: number
  passedItems?: number
}

interface WarrantyReserve {
  projectValue: number
  reservePercentage: number
  reserveAmount: number
  spentAmount: number
  remainingAmount: number
  utilizationPercentage: number
}

interface VendorWarrantyCallback {
  vendorName: string
  totalClaims: number
  callbackRate: number
  warrantyFTQ: number
  totalCost: number
  ranking: number
  trend: 'improving' | 'stable' | 'declining'
}

interface ConstructionFTQData {
  overallScore: number
  phaseScores: { phase: string; score: number; vendorName: string }[]
  qualityCorrelation: string
  predictedClaimsRange: { min: number; max: number }
  riskAreas: { area: string; riskLevel: 'high' | 'medium' | 'low'; vendorName: string; originalFTQ: number }[]
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockConstructionFTQ: ConstructionFTQData = {
  overallScore: 94,
  phaseScores: [
    { phase: 'Foundation', score: 97, vendorName: 'Gulf Coast Concrete' },
    { phase: 'Framing', score: 95, vendorName: 'Coastal Framing' },
    { phase: 'Roofing', score: 96, vendorName: 'Gulf Coast Roofing' },
    { phase: 'Plumbing', score: 91, vendorName: 'Jones Plumbing' },
    { phase: 'Electrical', score: 88, vendorName: 'Smith Electric' },
    { phase: 'HVAC', score: 94, vendorName: 'Cool Air HVAC' },
    { phase: 'Windows/Doors', score: 93, vendorName: 'Coastal Windows & Doors' },
    { phase: 'Finishes', score: 92, vendorName: 'Low Country Painting' },
  ],
  qualityCorrelation: 'Projects with 94%+ FTQ historically see 40% fewer warranty claims',
  predictedClaimsRange: { min: 4, max: 8 },
  riskAreas: [
    { area: 'Electrical - Bedroom #2', riskLevel: 'high', vendorName: 'Smith Electric', originalFTQ: 88 },
    { area: 'Plumbing - Master Bath', riskLevel: 'medium', vendorName: 'Jones Plumbing', originalFTQ: 91 },
    { area: 'Windows - Lot 2024-B Units', riskLevel: 'medium', vendorName: 'Coastal Windows & Doors', originalFTQ: 93 },
  ],
}

const mockVendorCallbacks: VendorWarrantyCallback[] = [
  { vendorName: 'Smith Electric', totalClaims: 8, callbackRate: 12.5, warrantyFTQ: 87, totalCost: 2400, ranking: 5, trend: 'declining' },
  { vendorName: 'Jones Plumbing', totalClaims: 5, callbackRate: 6.2, warrantyFTQ: 94, totalCost: 890, ranking: 2, trend: 'stable' },
  { vendorName: 'Cool Air HVAC', totalClaims: 3, callbackRate: 4.1, warrantyFTQ: 96, totalCost: 450, ranking: 1, trend: 'improving' },
  { vendorName: 'Gulf Coast Roofing', totalClaims: 2, callbackRate: 3.8, warrantyFTQ: 98, totalCost: 320, ranking: 1, trend: 'stable' },
  { vendorName: 'Coastal Windows & Doors', totalClaims: 4, callbackRate: 8.3, warrantyFTQ: 91, totalCost: 1250, ranking: 3, trend: 'declining' },
]

const mockRepairFTQScores: Record<string, number> = {
  '1': 96,
  '2': 94,
  '6': 88,
  '7': 85,
  '10': 92,
}

const mockWarranties: Warranty[] = [
  {
    id: '1',
    itemName: 'Central HVAC System - Trane XR17',
    category: 'hvac',
    warrantyType: 'manufacturer',
    vendor: 'Cool Air HVAC',
    manufacturer: 'Trane',
    startDate: '2025-01-15',
    endDate: '2035-01-15',
    duration: '10 years (compressor)',
    documentUrl: '/docs/hvac-warranty.pdf',
    status: 'active',
    coverageType: 'parts',
    registrationNumber: 'TR-4428819-01',
    claimContact: 'Trane Warranty Dept',
    claimPhone: '(800) 555-TRANE',
    costToDate: 0,
    claimCount: 0,
    aiNote: 'Manufacturer warranty includes annual maintenance requirement. Schedule service before Jan 2026 to maintain coverage.',
    originalConstructionFTQ: 94,
    inspectionLink: '/inspections/hvac-rough-in',
  },
  {
    id: '2',
    itemName: 'HVAC Labor & Installation',
    category: 'hvac',
    warrantyType: 'workmanship',
    vendor: 'Cool Air HVAC',
    startDate: '2025-01-15',
    endDate: '2026-01-15',
    duration: '1 year',
    status: 'expiring_soon',
    daysUntilExpiry: 28,
    coverageType: 'labor',
    claimContact: 'Cool Air HVAC',
    claimPhone: '(843) 555-2200',
    costToDate: 0,
    claimCount: 0,
    aiNote: 'Workmanship warranty expires in 28 days. Schedule 11-month walkthrough before expiration to document any issues.',
    originalConstructionFTQ: 94,
    inspectionLink: '/inspections/hvac-final',
  },
  {
    id: '3',
    itemName: 'Standing Seam Metal Roof',
    category: 'roofing',
    warrantyType: 'manufacturer',
    vendor: 'Gulf Coast Roofing',
    manufacturer: 'Galvalume Plus',
    startDate: '2024-06-20',
    endDate: '2054-06-20',
    duration: '30 years',
    documentUrl: '/docs/roof-warranty.pdf',
    status: 'active',
    coverageType: 'limited',
    registrationNumber: 'GP-887221',
    claimContact: 'Galvalume Plus Claims',
    claimPhone: '(800) 555-ROOF',
    costToDate: 0,
    claimCount: 0,
    originalConstructionFTQ: 96,
    inspectionLink: '/inspections/roofing-final',
  },
  {
    id: '4',
    itemName: 'Roofing Installation',
    category: 'roofing',
    warrantyType: 'workmanship',
    vendor: 'Gulf Coast Roofing',
    startDate: '2024-06-20',
    endDate: '2026-06-20',
    duration: '2 years',
    status: 'active',
    daysUntilExpiry: 128,
    coverageType: 'labor',
    claimContact: 'Gulf Coast Roofing',
    claimPhone: '(843) 555-7700',
    costToDate: 0,
    claimCount: 0,
    originalConstructionFTQ: 96,
    inspectionLink: '/inspections/roofing-final',
  },
  {
    id: '5',
    itemName: 'Tankless Water Heater - Rinnai RU199',
    category: 'plumbing',
    warrantyType: 'manufacturer',
    vendor: 'Jones Plumbing',
    manufacturer: 'Rinnai',
    startDate: '2025-03-10',
    endDate: '2037-03-10',
    duration: '12 years (heat exchanger)',
    documentUrl: '/docs/water-heater-warranty.pdf',
    status: 'active',
    coverageType: 'parts',
    registrationNumber: 'RN-55821-HE',
    claimContact: 'Rinnai Technical Support',
    claimPhone: '(800) 555-RINN',
    selectionLink: 'Plumbing > Water Heater > Rinnai RU199',
    costToDate: 0,
    claimCount: 0,
    originalConstructionFTQ: 91,
    inspectionLink: '/inspections/plumbing-final',
  },
  {
    id: '6',
    itemName: 'PGT WinGuard Impact Windows',
    category: 'windows',
    warrantyType: 'manufacturer',
    vendor: 'Coastal Windows & Doors',
    manufacturer: 'PGT Industries',
    startDate: '2025-02-01',
    endDate: '2035-02-01',
    duration: '10 years',
    documentUrl: '/docs/windows-warranty.pdf',
    status: 'active',
    coverageType: 'full',
    registrationNumber: 'PGT-2025-44821',
    claimContact: 'PGT Warranty',
    claimPhone: '(800) 555-WNDW',
    selectionLink: 'Windows & Doors > Impact Windows > PGT WinGuard 770',
    costToDate: 450,
    claimCount: 1,
    aiNote: '1 seal failure claim filed (CLM-2026-078). Same batch as Taylor Estate issue. Monitor other units from lot 2024-B.',
    originalConstructionFTQ: 93,
    inspectionLink: '/inspections/windows-doors',
    repairFTQ: 88,
    vendorCallbackRate: 8.3,
  },
  {
    id: '7',
    itemName: 'Electrical Panel & Wiring',
    category: 'electrical',
    warrantyType: 'workmanship',
    vendor: 'Smith Electric',
    startDate: '2025-02-15',
    endDate: '2026-02-15',
    duration: '1 year',
    status: 'expiring_soon',
    daysUntilExpiry: 3,
    coverageType: 'labor',
    claimContact: 'Smith Electric',
    claimPhone: '(843) 555-3300',
    costToDate: 150,
    claimCount: 1,
    aiNote: 'Workmanship warranty expires in 3 days. 1 claim for outlet not functioning in bedroom #2. Ensure all items resolved before expiration.',
    originalConstructionFTQ: 88,
    inspectionLink: '/inspections/electrical-rough',
    repairFTQ: 85,
    vendorCallbackRate: 12.5,
  },
  {
    id: '8',
    itemName: 'Kitchen Appliance Package - SubZero/Wolf',
    category: 'appliances',
    warrantyType: 'manufacturer',
    vendor: 'Sub-Zero Group',
    manufacturer: 'Sub-Zero / Wolf',
    startDate: '2024-11-01',
    endDate: '2026-11-01',
    duration: '2 years',
    status: 'active',
    daysUntilExpiry: 262,
    coverageType: 'full',
    registrationNumber: 'SZ-WF-2024-88213',
    claimContact: 'Sub-Zero Customer Care',
    claimPhone: '(800) 222-7820',
    selectionLink: 'Kitchen > Appliances > Sub-Zero/Wolf Package',
    costToDate: 0,
    claimCount: 0,
  },
  {
    id: '9',
    itemName: 'Foundation Slab - 10yr Structural',
    category: 'structural',
    warrantyType: 'builder',
    vendor: 'Gulf Coast Concrete',
    startDate: '2024-05-01',
    endDate: '2034-05-01',
    duration: '10 years',
    documentUrl: '/docs/foundation-warranty.pdf',
    status: 'active',
    coverageType: 'limited',
    costToDate: 0,
    claimCount: 0,
    originalConstructionFTQ: 97,
    inspectionLink: '/inspections/foundation',
  },
  {
    id: '10',
    itemName: 'Builder General Warranty',
    category: 'finish',
    warrantyType: 'builder',
    vendor: 'Coastal Custom Homes',
    startDate: '2025-01-15',
    endDate: '2026-01-15',
    duration: '1 year',
    documentUrl: '/docs/builder-warranty.pdf',
    status: 'expiring_soon',
    daysUntilExpiry: 28,
    coverageType: 'full',
    claimContact: 'Warranty Coordinator',
    claimPhone: '(843) 555-1000',
    costToDate: 2840,
    claimCount: 4,
    aiNote: 'Builder 1-year warranty expires in 28 days. 4 claims filed, $2,840 in warranty costs. Schedule 11-month walkthrough immediately.',
    originalConstructionFTQ: 94,
    repairFTQ: 92,
  },
  {
    id: '11',
    itemName: 'Exterior Paint & Siding',
    category: 'exterior',
    warrantyType: 'workmanship',
    vendor: 'Low Country Painting',
    startDate: '2024-12-01',
    endDate: '2024-12-01',
    duration: '2 years',
    status: 'expired',
    coverageType: 'labor',
    costToDate: 0,
    claimCount: 0,
    aiNote: 'Warranty expired. Consider extended protection plan or goodwill repairs for client retention.',
    originalConstructionFTQ: 92,
    inspectionLink: '/inspections/exterior-paint',
  },
]

const mockWalkthroughs: WalkthroughSchedule[] = [
  {
    id: '1',
    type: '30_day',
    scheduledDate: '2025-02-15',
    status: 'completed',
    findingsCount: 3,
    completedBy: 'Mike Johnson',
    homeownerSigned: true,
    checklistId: 'CL-30DAY-001',
    checklistName: '30-Day Warranty Walkthrough Checklist',
    checklistCompletion: 100,
    checklistFTQ: 96,
    totalItems: 45,
    passedItems: 43,
  },
  {
    id: '2',
    type: '11_month',
    scheduledDate: '2025-12-15',
    status: 'scheduled',
    checklistId: 'CL-11MTH-001',
    checklistName: '11-Month Warranty Walkthrough Checklist',
    totalItems: 68,
  },
  {
    id: '3',
    type: '2_year',
    scheduledDate: '2027-01-15',
    status: 'scheduled',
    checklistId: 'CL-2YR-001',
    checklistName: '2-Year Structural Walkthrough Checklist',
    totalItems: 32,
  },
]

const mockReserve: WarrantyReserve = {
  projectValue: 1250000,
  reservePercentage: 1.5,
  reserveAmount: 18750,
  spentAmount: 3440,
  remainingAmount: 15310,
  utilizationPercentage: 18.3,
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: ShieldCheck },
  expiring_soon: { label: 'Expiring Soon', color: 'bg-amber-100 text-amber-700', icon: ShieldAlert },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700', icon: ShieldX },
}

const warrantyTypeConfig: Record<WarrantyType, { label: string; color: string }> = {
  builder: { label: 'Builder', color: 'bg-stone-100 text-stone-700' },
  manufacturer: { label: 'Manufacturer', color: 'bg-purple-100 text-purple-700' },
  workmanship: { label: 'Workmanship', color: 'bg-orange-100 text-orange-700' },
  extended: { label: 'Extended', color: 'bg-teal-100 text-teal-700' },
}

const categoryConfig: Record<CategoryType, { label: string; icon: typeof Wrench; color: string }> = {
  appliances: { label: 'Appliances', icon: Home, color: 'bg-stone-50 text-stone-700' },
  roofing: { label: 'Roofing', icon: Building2, color: 'bg-orange-50 text-orange-700' },
  hvac: { label: 'HVAC', icon: Thermometer, color: 'bg-cyan-50 text-cyan-700' },
  plumbing: { label: 'Plumbing', icon: Droplets, color: 'bg-indigo-50 text-indigo-700' },
  electrical: { label: 'Electrical', icon: Zap, color: 'bg-amber-50 text-amber-700' },
  structural: { label: 'Structural', icon: Building2, color: 'bg-warm-100 text-warm-700' },
  windows: { label: 'Windows', icon: Home, color: 'bg-purple-50 text-purple-700' },
  exterior: { label: 'Exterior', icon: Building2, color: 'bg-emerald-50 text-emerald-700' },
  finish: { label: 'Finish', icon: Wrench, color: 'bg-pink-50 text-pink-700' },
}

const coverageConfig: Record<CoverageType, { label: string; color: string }> = {
  full: { label: 'Full Coverage', color: 'bg-green-50 text-green-700' },
  parts: { label: 'Parts Only', color: 'bg-stone-50 text-stone-700' },
  labor: { label: 'Labor Only', color: 'bg-purple-50 text-purple-700' },
  limited: { label: 'Limited', color: 'bg-warm-100 text-warm-600' },
}

const walkthroughTypeConfig: Record<WalkthroughSchedule['type'], string> = {
  '30_day': '30-Day Walkthrough',
  '6_month': '6-Month Walkthrough',
  '11_month': '11-Month Walkthrough',
  '2_year': '2-Year Walkthrough',
  'custom': 'Custom Walkthrough',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
}

function getFTQColor(score: number): string {
  if (score >= 95) return 'text-green-600'
  if (score >= 90) return 'text-stone-600'
  if (score >= 85) return 'text-amber-600'
  return 'text-red-600'
}

function getFTQBgColor(score: number): string {
  if (score >= 95) return 'bg-green-100 text-green-700'
  if (score >= 90) return 'bg-stone-100 text-stone-700'
  if (score >= 85) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function getRiskColor(level: 'high' | 'medium' | 'low'): string {
  if (level === 'high') return 'bg-red-100 text-red-700'
  if (level === 'medium') return 'bg-amber-100 text-amber-700'
  return 'bg-green-100 text-green-700'
}

// ---------------------------------------------------------------------------
// FTQ Panels
// ---------------------------------------------------------------------------

function ConstructionFTQPanel({ data }: { data: ConstructionFTQData }) {
  return (
    <div className="bg-white border-b border-warm-200 px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-4 w-4 text-stone-600" />
        <span className="text-sm font-medium text-warm-700">FTQ Impact on Warranty</span>
        <span className="text-xs text-warm-500 ml-auto">Construction quality correlation</span>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-gradient-to-br from-stone-50 to-indigo-50 rounded-lg p-3 border border-stone-100">
          <div className="text-xs text-stone-600 mb-1">Original Construction FTQ</div>
          <div className={cn("text-3xl font-bold", getFTQColor(data.overallScore))}>{data.overallScore}%</div>
          <div className="text-xs text-warm-500 mt-1">First Time Quality Score</div>
        </div>
        <div className="bg-warm-50 rounded-lg p-3 border border-warm-200">
          <div className="text-xs text-warm-600 mb-1">Predicted Claims</div>
          <div className="text-2xl font-bold text-warm-800">{data.predictedClaimsRange.min}-{data.predictedClaimsRange.max}</div>
          <div className="text-xs text-warm-500 mt-1">Year 1 estimate</div>
        </div>
        <div className="col-span-2 bg-stone-50 rounded-lg p-3 border border-stone-100">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-stone-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-medium text-stone-700 mb-1">Quality Correlation Insight</div>
              <div className="text-sm text-stone-800">{data.qualityCorrelation}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-medium text-warm-600 mb-2">FTQ by Construction Phase</div>
          <div className="space-y-1.5">
            {data.phaseScores.map((phase, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="w-20 text-warm-600 truncate">{phase.phase}</span>
                <div className="flex-1 bg-warm-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      phase.score >= 95 ? "bg-green-500" :
                      phase.score >= 90 ? "bg-stone-500" :
                      phase.score >= 85 ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${phase.score}%` }}
                  />
                </div>
                <span className={cn("w-10 text-right font-medium", getFTQColor(phase.score))}>{phase.score}%</span>
                <span className="w-24 text-warm-400 truncate">{phase.vendorName}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-warm-600 mb-2">Warranty Risk Areas (from FTQ)</div>
          <div className="space-y-2">
            {data.riskAreas.map((risk, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-warm-50 rounded border border-warm-100">
                <AlertTriangle className={cn(
                  "h-3.5 w-3.5 flex-shrink-0",
                  risk.riskLevel === 'high' ? 'text-red-500' :
                  risk.riskLevel === 'medium' ? 'text-amber-500' : 'text-green-500'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-warm-700 truncate">{risk.area}</div>
                  <div className="text-xs text-warm-500">{risk.vendorName} - FTQ: {risk.originalFTQ}%</div>
                </div>
                <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", getRiskColor(risk.riskLevel))}>
                  {risk.riskLevel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function VendorWarrantyPerformancePanel({ vendors }: { vendors: VendorWarrantyCallback[] }) {
  return (
    <div className="bg-white border-b border-warm-200 px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-medium text-warm-700">Vendor Warranty Performance</span>
        <span className="text-xs text-warm-500 ml-auto">Callback rates & repair quality</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-warm-200">
              <th className="text-left py-2 text-xs font-medium text-warm-500">Vendor</th>
              <th className="text-center py-2 text-xs font-medium text-warm-500">Claims</th>
              <th className="text-center py-2 text-xs font-medium text-warm-500">Callback Rate</th>
              <th className="text-center py-2 text-xs font-medium text-warm-500">Warranty FTQ</th>
              <th className="text-center py-2 text-xs font-medium text-warm-500">Cost</th>
              <th className="text-center py-2 text-xs font-medium text-warm-500">Rank</th>
              <th className="text-center py-2 text-xs font-medium text-warm-500">Trend</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor, idx) => (
              <tr key={idx} className="border-b border-warm-100 hover:bg-warm-50">
                <td className="py-2 font-medium text-warm-700">{vendor.vendorName}</td>
                <td className="py-2 text-center text-warm-600">{vendor.totalClaims}</td>
                <td className="py-2 text-center">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-xs font-medium",
                    vendor.callbackRate <= 5 ? 'bg-green-100 text-green-700' :
                    vendor.callbackRate <= 10 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  )}>
                    {vendor.callbackRate}%
                  </span>
                </td>
                <td className="py-2 text-center">
                  <span className={cn("font-medium", getFTQColor(vendor.warrantyFTQ))}>
                    {vendor.warrantyFTQ}%
                  </span>
                </td>
                <td className="py-2 text-center text-warm-600">{formatCurrency(vendor.totalCost)}</td>
                <td className="py-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {vendor.ranking === 1 && <Award className="h-3.5 w-3.5 text-amber-500" />}
                    <span className={cn(
                      "text-xs font-medium",
                      vendor.ranking <= 2 ? 'text-green-600' :
                      vendor.ranking <= 3 ? 'text-stone-600' : 'text-warm-600'
                    )}>
                      #{vendor.ranking}
                    </span>
                  </div>
                </td>
                <td className="py-2 text-center">
                  {vendor.trend === 'improving' && <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />}
                  {vendor.trend === 'stable' && <Activity className="h-4 w-4 text-stone-500 mx-auto" />}
                  {vendor.trend === 'declining' && <TrendingDown className="h-4 w-4 text-red-500 mx-auto" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function WarrantyPredictionPanel({ ftqData }: { ftqData: ConstructionFTQData }) {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Brain className="h-4 w-4 text-indigo-600" />
          <span className="font-medium text-sm text-indigo-800">AI Warranty Predictions (from FTQ Data):</span>
        </div>
        <div className="grid grid-cols-3 gap-4 flex-1">
          <div className="bg-white/60 rounded-lg p-2 border border-indigo-100">
            <div className="text-xs text-indigo-600 mb-1">Expected Year 1 Claims</div>
            <div className="text-lg font-bold text-indigo-800">{ftqData.predictedClaimsRange.min}-{ftqData.predictedClaimsRange.max}</div>
            <div className="text-xs text-indigo-500">Based on {ftqData.overallScore}% FTQ</div>
          </div>
          <div className="bg-white/60 rounded-lg p-2 border border-indigo-100">
            <div className="text-xs text-indigo-600 mb-1">Highest Risk Vendor</div>
            <div className="text-lg font-bold text-red-600">Smith Electric</div>
            <div className="text-xs text-indigo-500">88% FTQ, 12.5% callback</div>
          </div>
          <div className="bg-white/60 rounded-lg p-2 border border-indigo-100">
            <div className="text-xs text-indigo-600 mb-1">Predicted Warranty Cost</div>
            <div className="text-lg font-bold text-indigo-800">$4,200-$6,800</div>
            <div className="text-xs text-indigo-500">Year 1 estimate</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

function WalkthroughCard({ walkthrough }: { walkthrough: WalkthroughSchedule }) {
  return (
    <div className={cn(
      "flex-1 rounded-lg p-3 border",
      walkthrough.status === 'completed' ? 'bg-green-50 border-green-200' :
      walkthrough.status === 'overdue' ? 'bg-red-50 border-red-200' :
      'bg-stone-50 border-stone-200'
    )}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-warm-700">{walkthroughTypeConfig[walkthrough.type]}</span>
        <span className={cn(
          'text-xs px-1.5 py-0.5 rounded font-medium',
          walkthrough.status === 'completed' ? 'bg-green-100 text-green-700' :
          walkthrough.status === 'overdue' ? 'bg-red-100 text-red-700' :
          'bg-stone-100 text-stone-700'
        )}>
          {walkthrough.status === 'completed' ? 'Done' : walkthrough.status === 'overdue' ? 'Overdue' : 'Scheduled'}
        </span>
      </div>
      <p className="text-sm font-medium text-warm-900">{formatDate(walkthrough.scheduledDate)}</p>

      {/* Checklist Info */}
      {walkthrough.checklistId && (
        <div className="mt-2 pt-2 border-t border-warm-200/50">
          <button className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-700 mb-1">
            <ListChecks className="h-3 w-3" />
            <span className="truncate">{walkthrough.checklistName}</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </button>

          {walkthrough.status === 'completed' && walkthrough.checklistCompletion !== undefined ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-warm-500">
                {walkthrough.passedItems}/{walkthrough.totalItems} items
              </span>
              <span className={cn("font-medium", getFTQColor(walkthrough.checklistFTQ || 0))}>
                FTQ: {walkthrough.checklistFTQ}%
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-warm-500">{walkthrough.totalItems} checklist items</span>
              {walkthrough.status === 'scheduled' && (
                <button className="flex items-center gap-1 text-xs bg-stone-600 text-white px-2 py-0.5 rounded hover:bg-stone-700">
                  <Play className="h-3 w-3" />
                  Start
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {walkthrough.findingsCount !== undefined && (
        <p className="text-xs text-warm-500 mt-1">{walkthrough.findingsCount} findings | {walkthrough.homeownerSigned ? 'Signed' : 'Unsigned'}</p>
      )}
    </div>
  )
}

function WarrantyCard({ warranty }: { warranty: Warranty }) {
  const status = statusConfig[warranty.status]
  const category = categoryConfig[warranty.category]
  const coverage = coverageConfig[warranty.coverageType]
  const wType = warrantyTypeConfig[warranty.warrantyType]
  const StatusIcon = status.icon
  const CategoryIcon = category.icon

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer",
      warranty.status === 'expired' ? "border-red-200" :
      warranty.status === 'expiring_soon' ? "border-amber-200" : "border-warm-200"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-warm-900 truncate">{warranty.itemName}</h4>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-warm-500 mt-0.5">
            <Wrench className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{warranty.vendor}</span>
            {warranty.manufacturer && (
              <>
                <span className="text-warm-300">|</span>
                <span className="truncate text-xs">{warranty.manufacturer}</span>
              </>
            )}
          </div>
        </div>
        <button className="p-1 hover:bg-warm-100 rounded flex-shrink-0">
          <MoreHorizontal className="h-4 w-4 text-warm-400" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={cn("text-xs px-2 py-1 rounded font-medium flex items-center gap-1", status.color)}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
        <span className={cn("text-xs px-2 py-1 rounded font-medium", wType.color)}>
          {wType.label}
        </span>
        <span className={cn("text-xs px-2 py-1 rounded font-medium flex items-center gap-1", category.color)}>
          <CategoryIcon className="h-3 w-3" />
          {category.label}
        </span>
        <span className={cn("text-xs px-2 py-1 rounded font-medium", coverage.color)}>
          {coverage.label}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-warm-600">
            <Calendar className="h-3.5 w-3.5" />
            <span>Start</span>
          </div>
          <span className="text-warm-700">{formatDate(warranty.startDate)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-warm-600">
            <Calendar className="h-3.5 w-3.5" />
            <span>End</span>
          </div>
          <span className={cn(
            "font-medium",
            warranty.status === 'expired' ? "text-red-600" :
            warranty.status === 'expiring_soon' ? "text-amber-600" : "text-warm-700"
          )}>
            {formatDate(warranty.endDate)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-warm-600">
            <Clock className="h-3.5 w-3.5" />
            <span>Duration</span>
          </div>
          <span className="text-warm-700">{warranty.duration}</span>
        </div>
      </div>

      {/* Quality Tracking Section */}
      {(warranty.originalConstructionFTQ || warranty.repairFTQ) && (
        <div className="mb-3 pt-2 border-t border-warm-100">
          <div className="flex items-center gap-1.5 text-xs text-warm-500 mb-2">
            <Target className="h-3 w-3" />
            <span>Quality Tracking</span>
          </div>
          <div className="flex items-center gap-3">
            {warranty.originalConstructionFTQ && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-warm-500">Construction FTQ:</span>
                <span className={cn("text-xs font-medium", getFTQColor(warranty.originalConstructionFTQ))}>
                  {warranty.originalConstructionFTQ}%
                </span>
                {warranty.inspectionLink && (
                  <button className="text-stone-600 hover:text-stone-700">
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
            {warranty.repairFTQ && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-warm-500">Repair FTQ:</span>
                <span className={cn("text-xs font-medium", getFTQColor(warranty.repairFTQ))}>
                  {warranty.repairFTQ}%
                </span>
              </div>
            )}
            {warranty.vendorCallbackRate && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-warm-500">Callback:</span>
                <span className={cn(
                  "text-xs font-medium",
                  warranty.vendorCallbackRate <= 5 ? 'text-green-600' :
                  warranty.vendorCallbackRate <= 10 ? 'text-amber-600' : 'text-red-600'
                )}>
                  {warranty.vendorCallbackRate}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Claim & Cost info */}
      {(warranty.claimCount !== undefined && warranty.claimCount > 0) && (
        <div className="flex items-center gap-3 text-xs text-warm-500 mb-3 pt-2 border-t border-warm-100">
          <span className="flex items-center gap-1">
            <ClipboardCheck className="h-3 w-3" />
            {warranty.claimCount} claim{warranty.claimCount !== 1 ? 's' : ''}
          </span>
          {warranty.costToDate !== undefined && warranty.costToDate > 0 && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {formatCurrency(warranty.costToDate)} cost
            </span>
          )}
        </div>
      )}

      {/* Registration & Contact */}
      <div className="flex items-center justify-between pt-2 border-t border-warm-100">
        <div className="flex items-center gap-3">
          {warranty.documentUrl && (
            <button className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-700">
              <FileText className="h-3.5 w-3.5" />
              <span>Document</span>
            </button>
          )}
          {warranty.selectionLink && (
            <button className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700">
              <Link2 className="h-3.5 w-3.5" />
              <span>Selection</span>
            </button>
          )}
          {warranty.registrationNumber && (
            <span className="text-xs text-warm-400 font-mono">{warranty.registrationNumber}</span>
          )}
        </div>
        {warranty.daysUntilExpiry !== undefined && warranty.status !== 'expired' && (
          <span className={cn(
            "text-xs font-medium",
            warranty.daysUntilExpiry <= 30 ? "text-amber-600" : "text-warm-500"
          )}>
            {warranty.daysUntilExpiry}d remaining
          </span>
        )}
      </div>

      {/* Claim contact */}
      {warranty.claimContact && (
        <div className="mt-2 flex items-center gap-2 text-xs text-warm-400">
          <Phone className="h-3 w-3" />
          <span>{warranty.claimContact}</span>
          {warranty.claimPhone && <span>- {warranty.claimPhone}</span>}
        </div>
      )}

      {warranty.aiNote && (
        <div className={cn(
          "mt-3 p-2 rounded-md flex items-start gap-2",
          warranty.status === 'expired' || warranty.status === 'expiring_soon'
            ? "bg-amber-50"
            : "bg-stone-50"
        )}>
          <Sparkles className={cn(
            "h-3.5 w-3.5 mt-0.5 flex-shrink-0",
            warranty.status === 'expired' || warranty.status === 'expiring_soon'
              ? "text-amber-500"
              : "text-stone-500"
          )} />
          <span className={cn(
            "text-xs",
            warranty.status === 'expired' || warranty.status === 'expiring_soon'
              ? "text-amber-700"
              : "text-stone-700"
          )}>
            {warranty.aiNote}
          </span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function WarrantiesPreview() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({})

  const filteredWarranties = sortItems(
    mockWarranties.filter(warranty => {
      if (!matchesSearch(warranty, search, ['itemName', 'vendor', 'category', 'manufacturer', 'registrationNumber'])) return false
      if (selectedCategory !== 'all' && warranty.category !== selectedCategory) return false
      if (selectedType !== 'all' && warranty.warrantyType !== selectedType) return false
      if (activeTab !== 'all' && warranty.status !== activeTab) return false
      return true
    }),
    activeSort as keyof Warranty | '',
    sortDirection,
  )

  // Stats
  const activeWarranties = mockWarranties.filter(w => w.status === 'active').length
  const expiringIn30Days = mockWarranties.filter(w => w.daysUntilExpiry !== undefined && w.daysUntilExpiry <= 30 && w.status !== 'expired').length
  const totalCoverage = mockWarranties.filter(w => w.status !== 'expired').length
  const totalItems = mockWarranties.length
  const coveragePercentage = Math.round((totalCoverage / totalItems) * 100)
  const totalClaimCost = mockWarranties.reduce((sum, w) => sum + (w.costToDate ?? 0), 0)
  const totalClaimCount = mockWarranties.reduce((sum, w) => sum + (w.claimCount ?? 0), 0)

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...Object.entries(categoryConfig).map(([key, cfg]) => ({ value: key, label: cfg.label })),
  ]

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    ...Object.entries(warrantyTypeConfig).map(([key, cfg]) => ({ value: key, label: cfg.label })),
  ]

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-warm-900">Warranty Binder</h3>
          <span className="text-sm text-warm-500">{totalItems} warranties | {coveragePercentage}% coverage active</span>
          <span className={cn("text-sm px-2 py-0.5 rounded font-medium ml-auto", getFTQBgColor(mockConstructionFTQ.overallScore))}>
            <Target className="h-3 w-3 inline mr-1" />
            Construction FTQ: {mockConstructionFTQ.overallScore}%
          </span>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search warranties, vendors, registration numbers..."
          tabs={[
            { key: 'all', label: 'All', count: mockWarranties.length },
            { key: 'active', label: 'Active', count: mockWarranties.filter(w => w.status === 'active').length },
            { key: 'expiring_soon', label: 'Expiring Soon', count: mockWarranties.filter(w => w.status === 'expiring_soon').length },
            { key: 'expired', label: 'Expired', count: mockWarranties.filter(w => w.status === 'expired').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Categories',
              value: selectedCategory,
              options: categoryOptions.filter(o => o.value !== 'all'),
              onChange: (v) => setSelectedCategory(v),
            },
            {
              label: 'All Types',
              value: selectedType,
              options: typeOptions.filter(o => o.value !== 'all'),
              onChange: (v) => setSelectedType(v),
            },
          ]}
          sortOptions={[
            { value: 'itemName', label: 'Item Name' },
            { value: 'vendor', label: 'Vendor' },
            { value: 'endDate', label: 'Expiration Date' },
            { value: 'category', label: 'Category' },
            { value: 'warrantyType', label: 'Warranty Type' },
            { value: 'daysUntilExpiry', label: 'Days Remaining' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Download, label: 'Export Binder', onClick: () => {} },
            { icon: Plus, label: 'Add Warranty', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredWarranties.length}
          totalCount={mockWarranties.length}
        />
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-6 gap-3">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <ShieldCheck className="h-4 w-4" />
              Active
            </div>
            <div className="text-2xl font-bold text-green-700 mt-1">{activeWarranties}</div>
            <div className="text-xs text-green-600 mt-0.5">covered items</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <ShieldAlert className="h-4 w-4" />
              Expiring 30d
            </div>
            <div className="text-2xl font-bold text-amber-700 mt-1">{expiringIn30Days}</div>
            <div className="text-xs text-amber-600 mt-0.5">need attention</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <TrendingUp className="h-4 w-4" />
              Coverage
            </div>
            <div className="text-2xl font-bold text-stone-700 mt-1">{coveragePercentage}%</div>
            <div className="text-xs text-stone-600 mt-0.5">{totalCoverage} of {totalItems} active</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <ClipboardCheck className="h-4 w-4" />
              Claims
            </div>
            <div className="text-2xl font-bold text-red-700 mt-1">{totalClaimCount}</div>
            <div className="text-xs text-red-600 mt-0.5">{formatCurrency(totalClaimCost)} cost to date</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Reserve
            </div>
            <div className="text-2xl font-bold text-purple-700 mt-1">{formatCurrency(mockReserve.remainingAmount)}</div>
            <div className="text-xs text-purple-600 mt-0.5">{mockReserve.utilizationPercentage}% used</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-indigo-600 text-sm">
              <Target className="h-4 w-4" />
              FTQ Score
            </div>
            <div className={cn("text-2xl font-bold mt-1", getFTQColor(mockConstructionFTQ.overallScore))}>
              {mockConstructionFTQ.overallScore}%
            </div>
            <div className="text-xs text-indigo-600 mt-0.5">construction quality</div>
          </div>
        </div>
      </div>

      {/* FTQ Impact Panel */}
      <ConstructionFTQPanel data={mockConstructionFTQ} />

      {/* Vendor Warranty Performance */}
      <VendorWarrantyPerformancePanel vendors={mockVendorCallbacks} />

      {/* Warranty Prediction Panel */}
      <WarrantyPredictionPanel ftqData={mockConstructionFTQ} />

      {/* Walkthrough Schedule */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <ListChecks className="h-4 w-4 text-warm-600" />
          <span className="text-sm font-medium text-warm-700">Warranty Walkthrough Checklists</span>
          <span className="text-xs text-warm-500 ml-auto">Linked to quality checklists</span>
        </div>
        <div className="flex items-center gap-3">
          {mockWalkthroughs.map(wt => (
            <WalkthroughCard key={wt.id} walkthrough={wt} />
          ))}
        </div>
      </div>

      {/* Warranty Cards */}
      <div className="p-4 grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
        {filteredWarranties.map(warranty => (
          <WarrantyCard key={warranty.id} warranty={warranty} />
        ))}
        {filteredWarranties.length === 0 && (
          <div className="col-span-2 text-center py-8 text-warm-400 text-sm border-2 border-dashed border-warm-200 rounded-lg">
            No warranties found
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Warranty Intelligence:</span>
          </div>
          <div className="space-y-1 text-sm text-amber-700">
            <p>&#x2022; 11-month walkthrough needed within 28 days - 4 builder warranties expiring. Schedule immediately.</p>
            <p>&#x2022; PGT window seal failure matches pattern from lot 2024-B across 2 other projects. Recommend batch inspection.</p>
            <p>&#x2022; Smith Electric has 12.5% callback rate (highest) - consider additional oversight on future electrical work.</p>
            <p>&#x2022; Based on 94% construction FTQ, predicted warranty costs are 40% below industry average.</p>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <AIFeaturesPanel
          title="AI Warranty & FTQ Features"
          columns={2}
          features={[
            {
              feature: 'FTQ-Based Warranty Prediction',
              trigger: 'On completion',
              insight: 'Predicts warranty claims from construction quality',
              detail: 'Analyzes original construction FTQ scores to forecast warranty claim frequency and costs. Higher FTQ = fewer callbacks.',
              severity: 'info',
            },
            {
              feature: 'Vendor Accountability Tracking',
              trigger: 'Real-time',
              insight: 'Links warranty issues to original work quality',
              detail: 'Tracks callback rates, repair FTQ, and warranty costs by vendor. Provides rankings and trend analysis for vendor performance.',
              severity: 'warning',
            },
            {
              feature: 'Repair Quality Monitoring',
              trigger: 'On claim close',
              insight: 'Measures FTQ on warranty repairs',
              detail: 'Ensures warranty repairs meet quality standards. Tracks repair FTQ scores and flags vendors with declining repair quality.',
              severity: 'info',
            },
            {
              feature: 'Expiration Alerts',
              trigger: 'Real-time',
              insight: 'Proactive warranty expiration notifications',
              detail: 'Automatically monitors all warranty end dates and sends alerts 90, 60, 30, and 7 days before expiration.',
              severity: 'warning',
            },
            {
              feature: 'Pattern Detection',
              trigger: 'Weekly',
              insight: 'Identifies recurring warranty issues',
              detail: 'Analyzes claim patterns across projects, products, and vendors. Detects batch defects and systemic quality issues.',
              severity: 'info',
            },
            {
              feature: 'Walkthrough Checklist Integration',
              trigger: 'On schedule',
              insight: 'Links walkthroughs to quality checklists',
              detail: 'Connects warranty walkthroughs to standardized checklists with FTQ scoring. Ensures consistent inspection quality.',
              severity: 'success',
            },
            {
              feature: 'Cost Forecasting',
              trigger: 'Monthly',
              insight: 'Predicts warranty reserve utilization',
              detail: 'Uses FTQ data and historical patterns to forecast warranty costs. Helps optimize reserve allocation.',
              severity: 'info',
            },
            {
              feature: 'Risk Area Identification',
              trigger: 'On analysis',
              insight: 'Highlights areas prone to warranty claims',
              detail: 'Identifies specific locations, systems, or vendors at higher risk based on construction FTQ and historical data.',
              severity: 'warning',
            },
          ]}
        />
      </div>
    </div>
  )
}
