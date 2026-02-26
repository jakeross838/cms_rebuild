'use client'

import { useState } from 'react'

import {
  Plus,
  Sparkles,
  FileText,
  Eye,
  Edit,
  MoreHorizontal,
  Star,
  Clock,
  TrendingUp,
  ChevronRight,
  Download,
  Zap,
  Globe,
  Shield,
  BookOpen,
  ShoppingBag,
  Users,
  Tag,
  Copy,
  Upload,
  Award,
  MapPin,
  CheckSquare,
  ClipboardCheck,
  X,
  GitBranch,
  Ruler,
  UserCheck,
  Target,
  Wand2,
} from 'lucide-react'

import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { cn } from '@/lib/utils'

// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENT TEMPLATES TYPES & DATA
// ══════════════════════════════════════════════════════════════════════════════

type TemplateCategory = 'Contracts' | 'Proposals' | 'Purchase Orders' | 'Change Orders' | 'Subcontracts' | 'Pre-Con Agreements' | 'Letters'
type TemplateSource = 'builder' | 'platform' | 'marketplace'

interface Template {
  id: string
  name: string
  category: TemplateCategory
  description: string
  pages: number
  variables: number
  signatureFields: number
  clauseCount: number
  usageCount: number
  lastUsed: string
  isDefault: boolean
  isFavorite: boolean
  lastUpdated: string
  version: string
  source: TemplateSource
  stateApplicability?: string[]
  contractType?: string
  isLegallyReviewed?: boolean
  reviewedDate?: string
  aiSuggestion?: string
  marketplaceRating?: number
  marketplaceInstalls?: number
  publisherName?: string
  price?: number
  regionTags?: string[]
}

const mockTemplates: Template[] = [
  { id: '1', name: 'Standard Cost-Plus with GMP', category: 'Contracts', description: 'Cost-plus contract with guaranteed maximum price, savings split provisions, and audit rights', pages: 24, variables: 45, signatureFields: 4, clauseCount: 34, usageCount: 128, lastUsed: '2 days ago', isDefault: true, isFavorite: true, lastUpdated: 'Jan 15, 2026', version: '3.2', source: 'builder', stateApplicability: ['SC', 'NC', 'GA'], contractType: 'gmp', isLegallyReviewed: true, reviewedDate: 'Dec 2025', aiSuggestion: 'New SC mechanic lien statute took effect Jan 1, 2026. Update clause 14.3 for compliance.' },
  { id: '2', name: 'Fixed Price Residential', category: 'Contracts', description: 'Lump sum contract for well-defined scopes with clear inclusion/exclusion lists', pages: 18, variables: 38, signatureFields: 3, clauseCount: 28, usageCount: 64, lastUsed: '1 week ago', isDefault: false, isFavorite: true, lastUpdated: 'Dec 10, 2025', version: '2.1', source: 'builder', stateApplicability: ['SC', 'NC'], contractType: 'fixed_price', isLegallyReviewed: true, reviewedDate: 'Nov 2025' },
  { id: '3', name: 'Time & Materials Contract', category: 'Contracts', description: 'T&M billing with weekly invoicing, labor rate schedules, and not-to-exceed cap option', pages: 20, variables: 42, signatureFields: 3, clauseCount: 24, usageCount: 32, lastUsed: '3 weeks ago', isDefault: false, isFavorite: false, lastUpdated: 'Nov 28, 2025', version: '1.4', source: 'builder', contractType: 't_and_m' },
  { id: '4', name: 'Residential Proposal', category: 'Proposals', description: 'Full scope proposal with selections, allowances, payment schedule, and tier comparison', pages: 12, variables: 52, signatureFields: 2, clauseCount: 8, usageCount: 156, lastUsed: 'Today', isDefault: true, isFavorite: true, lastUpdated: 'Jan 18, 2026', version: '4.0', source: 'builder', aiSuggestion: 'Consider adding payment schedule breakdown option. Clients who see draw milestones convert 15% more.' },
  { id: '5', name: 'Standard Subcontract', category: 'Subcontracts', description: 'Trade subcontract with scope attachment, insurance requirements, and warranty pass-through', pages: 14, variables: 36, signatureFields: 4, clauseCount: 26, usageCount: 89, lastUsed: '3 days ago', isDefault: true, isFavorite: true, lastUpdated: 'Jan 5, 2026', version: '2.8', source: 'builder', stateApplicability: ['SC'], isLegallyReviewed: true, reviewedDate: 'Jan 2026' },
  { id: '6', name: 'Pre-Construction Agreement', category: 'Pre-Con Agreements', description: 'Paid design/planning phase agreement with milestone billing and scope limitations', pages: 8, variables: 28, signatureFields: 2, clauseCount: 14, usageCount: 24, lastUsed: '2 weeks ago', isDefault: true, isFavorite: false, lastUpdated: 'Dec 20, 2025', version: '1.2', source: 'builder', contractType: 'precon' },
  { id: '7', name: 'Standard Purchase Order', category: 'Purchase Orders', description: 'PO for material and service orders with delivery terms and acceptance criteria', pages: 2, variables: 28, signatureFields: 1, clauseCount: 8, usageCount: 342, lastUsed: 'Yesterday', isDefault: true, isFavorite: true, lastUpdated: 'Jan 10, 2026', version: '2.0', source: 'builder' },
  { id: '8', name: 'Standard Change Order', category: 'Change Orders', description: 'Change order with scope modification, cost impact, schedule impact, and approval signatures', pages: 4, variables: 35, signatureFields: 2, clauseCount: 6, usageCount: 91, lastUsed: '3 days ago', isDefault: true, isFavorite: true, lastUpdated: 'Jan 12, 2026', version: '2.3', source: 'builder', aiSuggestion: 'New impact fee disclosure requirement added for SC. Include in cost impact section.' },
  { id: '9', name: 'Florida Builder Starter Pack', category: 'Contracts', description: 'FL-specific contracts with right-to-cure, Chapter 558, and hurricane provisions', pages: 28, variables: 52, signatureFields: 4, clauseCount: 42, usageCount: 0, lastUsed: 'Not installed', isDefault: false, isFavorite: false, lastUpdated: 'Jan 20, 2026', version: '1.0', source: 'marketplace', stateApplicability: ['FL'], isLegallyReviewed: true, reviewedDate: 'Jan 2026', marketplaceRating: 4.8, marketplaceInstalls: 234, publisherName: 'RossOS Official', price: 0, regionTags: ['FL', 'Southeast'] },
  { id: '10', name: 'Luxury Custom Home Contract', category: 'Contracts', description: 'Premium contract template for $1M+ custom homes with detailed warranty, allowance, and selection provisions', pages: 32, variables: 68, signatureFields: 5, clauseCount: 48, usageCount: 0, lastUsed: 'Not installed', isDefault: false, isFavorite: false, lastUpdated: 'Feb 1, 2026', version: '2.0', source: 'marketplace', marketplaceRating: 4.9, marketplaceInstalls: 87, publisherName: 'Elite Builder Consulting', price: 149, regionTags: ['National'] },
]

const categories: TemplateCategory[] = ['Contracts', 'Proposals', 'Purchase Orders', 'Change Orders', 'Subcontracts', 'Pre-Con Agreements', 'Letters']

const categoryColors: Record<string, string> = {
  Contracts: 'bg-warm-100 text-warm-700',
  Proposals: 'bg-stone-100 text-stone-700',
  'Purchase Orders': 'bg-green-100 text-green-700',
  'Change Orders': 'bg-sand-100 text-sand-700',
  Subcontracts: 'bg-stone-100 text-stone-700',
  'Pre-Con Agreements': 'bg-stone-100 text-stone-700',
  Letters: 'bg-warm-100 text-warm-700',
}

// ══════════════════════════════════════════════════════════════════════════════
// QUALITY CHECKLISTS TYPES & DATA
// ══════════════════════════════════════════════════════════════════════════════

type QualityTrade = 'Foundation' | 'Framing' | 'Electrical' | 'Plumbing' | 'HVAC' | 'Insulation' | 'Drywall' | 'General' | 'Safety'
type QualityPhase = 'Rough' | 'Pre-Drywall' | 'Final' | 'Walkthrough' | 'Startup'
type QualitySource = 'system' | 'custom' | 'marketplace'

interface QualityTemplate {
  id: string
  name: string
  trade: QualityTrade
  phase: QualityPhase
  itemCount: number
  sectionCount: number
  isSystem: boolean
  rating: number
  cloneCount: number
  ftqRatedItems: number
  ftqTotalItems: number
  conditionalRules: number
  measurementCheckpoints: number
  supervisorApprovals: number
  source: QualitySource
  description: string
  sections: string[]
  sampleItems: string[]
  lastUpdated: string
  version: string
  marketplaceRating?: number
  marketplaceInstalls?: number
  publisherName?: string
  price?: number
}

const mockQualityTemplates: QualityTemplate[] = [
  { id: 'q1', name: 'Pre-Pour Foundation Checklist', trade: 'Foundation', phase: 'Rough', itemCount: 42, sectionCount: 6, isSystem: true, rating: 4.8, cloneCount: 156, ftqRatedItems: 35, ftqTotalItems: 42, conditionalRules: 4, measurementCheckpoints: 12, supervisorApprovals: 2, source: 'system', description: 'Comprehensive foundation inspection checklist covering rebar placement, form alignment, and moisture barriers', sections: ['Site Preparation', 'Footings', 'Rebar & Steel', 'Form Work', 'Utilities', 'Final Review'], sampleItems: ['Verify footing dimensions match plans', 'Check rebar spacing (6" OC max)', 'Inspect form bracing and alignment', 'Confirm utility sleeves installed', 'Verify anchor bolt placement'], lastUpdated: 'Jan 10, 2026', version: '2.4' },
  { id: 'q2', name: 'Framing Rough Inspection', trade: 'Framing', phase: 'Rough', itemCount: 68, sectionCount: 8, isSystem: true, rating: 4.9, cloneCount: 234, ftqRatedItems: 52, ftqTotalItems: 68, conditionalRules: 6, measurementCheckpoints: 18, supervisorApprovals: 1, source: 'system', description: 'Complete framing inspection for walls, floors, and roof systems with structural verification', sections: ['Floor System', 'Wall Framing', 'Headers & Beams', 'Roof Framing', 'Sheathing', 'Hardware', 'Blocking', 'Final Review'], sampleItems: ['Verify stud spacing per plans', 'Check header sizes at openings', 'Inspect hurricane ties/straps', 'Confirm fire blocking installed', 'Verify sheathing nailing pattern'], lastUpdated: 'Jan 15, 2026', version: '3.1' },
  { id: 'q3', name: 'Pre-Drywall Walkthrough', trade: 'General', phase: 'Pre-Drywall', itemCount: 85, sectionCount: 10, isSystem: true, rating: 4.7, cloneCount: 312, ftqRatedItems: 65, ftqTotalItems: 85, conditionalRules: 8, measurementCheckpoints: 15, supervisorApprovals: 3, source: 'system', description: 'Critical pre-drywall inspection covering all trades before closing walls', sections: ['Framing', 'Electrical', 'Plumbing', 'HVAC', 'Insulation', 'Low Voltage', 'Fire Stopping', 'Blocking', 'Windows/Doors', 'Final Sign-off'], sampleItems: ['All rough inspections passed', 'Backing installed for fixtures', 'Air sealing complete at penetrations', 'Insulation grade I installation', 'Photo documentation complete'], lastUpdated: 'Jan 18, 2026', version: '4.0' },
  { id: 'q4', name: 'Electrical Rough-In', trade: 'Electrical', phase: 'Rough', itemCount: 54, sectionCount: 7, isSystem: true, rating: 4.6, cloneCount: 189, ftqRatedItems: 42, ftqTotalItems: 54, conditionalRules: 5, measurementCheckpoints: 8, supervisorApprovals: 1, source: 'system', description: 'Electrical rough inspection for NEC compliance and quality workmanship', sections: ['Panel Location', 'Circuit Runs', 'Box Installation', 'Wire Sizing', 'Grounding', 'Low Voltage', 'Code Review'], sampleItems: ['Panel accessible per NEC 110.26', 'Wire fill compliant in all boxes', 'AFCI/GFCI circuits identified', 'Smoke detector locations verified', 'Service entrance properly secured'], lastUpdated: 'Jan 8, 2026', version: '2.2' },
  { id: 'q5', name: 'Electrical Final', trade: 'Electrical', phase: 'Final', itemCount: 38, sectionCount: 5, isSystem: true, rating: 4.5, cloneCount: 145, ftqRatedItems: 28, ftqTotalItems: 38, conditionalRules: 3, measurementCheckpoints: 4, supervisorApprovals: 1, source: 'system', description: 'Final electrical inspection for trim, devices, and functional testing', sections: ['Device Installation', 'Fixture Mounting', 'Panel Labeling', 'Testing', 'Documentation'], sampleItems: ['All outlets tested and functional', 'GFCI devices trip correctly', 'Panel directory complete and accurate', 'Fixture mounting secure', 'Cover plates installed and aligned'], lastUpdated: 'Jan 5, 2026', version: '1.8' },
  { id: 'q6', name: 'Plumbing Rough-In', trade: 'Plumbing', phase: 'Rough', itemCount: 46, sectionCount: 6, isSystem: true, rating: 4.7, cloneCount: 167, ftqRatedItems: 38, ftqTotalItems: 46, conditionalRules: 4, measurementCheckpoints: 10, supervisorApprovals: 1, source: 'system', description: 'Plumbing rough inspection covering DWV, water lines, and gas piping', sections: ['DWV System', 'Water Supply', 'Gas Piping', 'Venting', 'Testing', 'Code Compliance'], sampleItems: ['Drain slope verified (1/4" per foot min)', 'Water pressure test passed (150 psi)', 'Vent terminations properly located', 'Gas line pressure tested', 'Cleanout access provided'], lastUpdated: 'Jan 12, 2026', version: '2.5' },
  { id: 'q7', name: 'HVAC Startup & Balance', trade: 'HVAC', phase: 'Startup', itemCount: 52, sectionCount: 7, isSystem: true, rating: 4.8, cloneCount: 98, ftqRatedItems: 45, ftqTotalItems: 52, conditionalRules: 6, measurementCheckpoints: 22, supervisorApprovals: 2, source: 'system', description: 'HVAC commissioning checklist with airflow balancing and system verification', sections: ['Equipment Setup', 'Ductwork', 'Airflow Testing', 'Refrigerant Check', 'Controls', 'Balancing', 'Documentation'], sampleItems: ['Equipment serial numbers recorded', 'Static pressure within spec', 'Refrigerant charge verified', 'Thermostat calibrated', 'Airflow CFM at each register'], lastUpdated: 'Jan 20, 2026', version: '3.0' },
  { id: 'q8', name: 'Insulation Inspection', trade: 'Insulation', phase: 'Pre-Drywall', itemCount: 35, sectionCount: 5, isSystem: true, rating: 4.6, cloneCount: 201, ftqRatedItems: 30, ftqTotalItems: 35, conditionalRules: 3, measurementCheckpoints: 8, supervisorApprovals: 1, source: 'system', description: 'Insulation quality inspection for RESNET Grade I installation', sections: ['Attic', 'Walls', 'Floors', 'Air Sealing', 'Documentation'], sampleItems: ['R-value meets or exceeds code', 'No gaps, voids, or compression', 'Proper coverage around obstacles', 'Air barrier continuity verified', 'Grade I installation achieved'], lastUpdated: 'Jan 6, 2026', version: '2.0' },
  { id: 'q9', name: 'Pre-Closing Walkthrough', trade: 'General', phase: 'Walkthrough', itemCount: 120, sectionCount: 14, isSystem: true, rating: 4.9, cloneCount: 423, ftqRatedItems: 95, ftqTotalItems: 120, conditionalRules: 12, measurementCheckpoints: 5, supervisorApprovals: 3, source: 'system', description: 'Comprehensive pre-closing walkthrough covering all systems and finishes', sections: ['Exterior', 'Garage', 'Entry', 'Kitchen', 'Living Areas', 'Bedrooms', 'Bathrooms', 'Laundry', 'HVAC', 'Electrical', 'Plumbing', 'Paint/Drywall', 'Flooring', 'Punch List'], sampleItems: ['All appliances operational', 'Cabinet doors aligned and functional', 'Paint touch-up complete', 'Flooring transitions smooth', 'All systems demonstrated to owner'], lastUpdated: 'Jan 25, 2026', version: '5.2' },
  { id: 'q10', name: '30-Day Walkthrough', trade: 'General', phase: 'Walkthrough', itemCount: 65, sectionCount: 8, isSystem: true, rating: 4.7, cloneCount: 287, ftqRatedItems: 50, ftqTotalItems: 65, conditionalRules: 5, measurementCheckpoints: 0, supervisorApprovals: 1, source: 'system', description: 'Post-occupancy 30-day warranty walkthrough for homeowner items', sections: ['Drywall Settlement', 'Door Adjustments', 'HVAC Performance', 'Plumbing', 'Electrical', 'Exterior', 'Landscaping', 'Homeowner Questions'], sampleItems: ['Drywall cracks documented', 'Door adjustments needed', 'Caulking separations noted', 'HVAC filter instructions reviewed', 'Warranty claim items logged'], lastUpdated: 'Jan 22, 2026', version: '3.3' },
  { id: 'q11', name: 'Daily Safety Checklist', trade: 'Safety', phase: 'Rough', itemCount: 28, sectionCount: 4, isSystem: true, rating: 4.8, cloneCount: 534, ftqRatedItems: 28, ftqTotalItems: 28, conditionalRules: 2, measurementCheckpoints: 0, supervisorApprovals: 1, source: 'system', description: 'Daily jobsite safety inspection for OSHA compliance', sections: ['PPE Compliance', 'Fall Protection', 'Electrical Safety', 'Housekeeping'], sampleItems: ['Hard hats worn in active areas', 'Guardrails in place at openings', 'Extension cords in good condition', 'Materials stored safely', 'First aid kit accessible'], lastUpdated: 'Jan 28, 2026', version: '4.1' },
  { id: 'q12', name: 'Custom Luxury Finishes Checklist', trade: 'General', phase: 'Final', itemCount: 95, sectionCount: 12, isSystem: false, rating: 4.9, cloneCount: 47, ftqRatedItems: 78, ftqTotalItems: 95, conditionalRules: 8, measurementCheckpoints: 6, supervisorApprovals: 2, source: 'marketplace', description: 'Premium finish inspection for luxury custom homes with high-end materials', sections: ['Stone & Tile', 'Custom Millwork', 'Hardware', 'Lighting', 'Appliances', 'Smart Home', 'Audio/Visual', 'Pool/Spa', 'Landscaping', 'Final Details', 'Client Presentation', 'Documentation'], sampleItems: ['Stone seams aligned and minimal', 'Custom millwork finish flawless', 'High-end hardware properly adjusted', 'Lighting scenes programmed', 'Smart home integration tested'], lastUpdated: 'Feb 1, 2026', version: '1.5', marketplaceRating: 4.9, marketplaceInstalls: 47, publisherName: 'Luxury Builder Network', price: 79 },
]

const qualityTradeColors: Record<QualityTrade, string> = { Foundation: 'bg-stone-100 text-stone-700', Framing: 'bg-amber-100 text-amber-700', Electrical: 'bg-amber-100 text-amber-700', Plumbing: 'bg-stone-100 text-stone-700', HVAC: 'bg-stone-100 text-stone-700', Insulation: 'bg-warm-100 text-sand-700', Drywall: 'bg-warm-100 text-warm-700', General: 'bg-warm-100 text-warm-700', Safety: 'bg-red-100 text-red-700' }
const qualityPhaseColors: Record<QualityPhase, string> = { Rough: 'bg-sand-100 text-sand-700', 'Pre-Drywall': 'bg-warm-100 text-warm-700', Final: 'bg-green-100 text-green-700', Walkthrough: 'bg-stone-100 text-stone-700', Startup: 'bg-stone-100 text-stone-700' }
const qualityTrades: QualityTrade[] = ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'HVAC', 'Insulation', 'Drywall', 'General', 'Safety']
const qualityPhases: QualityPhase[] = ['Rough', 'Pre-Drywall', 'Final', 'Walkthrough', 'Startup']

// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENT TEMPLATE COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

function TemplateCard({ template }: { template: Template }) {
  const isMarketplace = template.source === 'marketplace'
  return (
    <div className={cn("bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer", isMarketplace ? "border-stone-200" : "border-warm-200")}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', categoryColors[template.category])}>{template.category}</span>
            {template.isFavorite ? <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> : null}
            {template.isDefault ? <span className="text-xs font-medium text-warm-600 bg-warm-100 px-1.5 py-0.5 rounded">Default</span> : null}
            {template.source === 'platform' && <span className="text-xs font-medium text-stone-600 bg-stone-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Award className="h-3 w-3" />Official</span>}
            {isMarketplace ? <span className="text-xs font-medium text-stone-600 bg-stone-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"><ShoppingBag className="h-3 w-3" />Marketplace</span> : null}
            {template.isLegallyReviewed ? <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-0.5" title={`Reviewed ${template.reviewedDate}`}><Shield className="h-3 w-3" />Reviewed</span> : null}
          </div>
          <h4 className="font-medium text-warm-900">{template.name}</h4>
          <span className="text-[10px] text-warm-400">v{template.version}</span>
        </div>
        <button className="p-1 hover:bg-warm-100 rounded"><MoreHorizontal className="h-4 w-4 text-warm-400" /></button>
      </div>
      <p className="text-sm text-warm-500 mb-3 line-clamp-2">{template.description}</p>
      <div className="flex items-center gap-3 mb-2 text-sm flex-wrap">
        <div className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-warm-400" /><span className="text-warm-600 text-xs">{template.pages}p</span></div>
        <div className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-warm-400" /><span className="text-warm-600 text-xs">{template.variables} vars</span></div>
        <div className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-warm-400" /><span className="text-warm-600 text-xs">{template.clauseCount} clauses</span></div>
        <div className="flex items-center gap-1.5"><Edit className="h-3.5 w-3.5 text-warm-400" /><span className="text-warm-600 text-xs">{template.signatureFields} sig</span></div>
      </div>
      {template.stateApplicability && template.stateApplicability.length > 0 ? <div className="flex items-center gap-1.5 mb-2"><MapPin className="h-3 w-3 text-warm-400" />{template.stateApplicability.map(state => <span key={state} className="text-[10px] px-1 py-0.5 bg-warm-100 text-warm-600 rounded">{state}</span>)}</div> : null}
      {isMarketplace ? <div className="flex items-center gap-3 mb-2 text-xs"><div className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400 fill-amber-400" /><span className="font-medium text-warm-700">{template.marketplaceRating}</span></div><span className="text-warm-400">{template.marketplaceInstalls} installs</span><span className="text-warm-500">by {template.publisherName}</span>{template.price !== undefined && <span className={cn("font-medium", template.price === 0 ? "text-green-600" : "text-warm-900")}>{template.price === 0 ? 'Free' : `$${template.price}`}</span>}</div> : null}
      <div className="flex items-center justify-between pt-3 border-t border-warm-100"><div className="flex items-center gap-2">{!isMarketplace && <><span className="text-xs text-warm-500">Used {template.usageCount}x</span><span className="text-xs text-warm-400">|</span><div className="flex items-center gap-1 text-xs text-warm-500"><Clock className="h-3.5 w-3.5" />{template.lastUsed}</div></>}</div></div>
      {template.aiSuggestion ? <div className="mt-3 p-2 rounded-md bg-amber-50 flex items-start gap-2 text-xs"><Sparkles className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-500" /><span className="text-amber-700">{template.aiSuggestion}</span></div> : null}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-warm-100">
        {isMarketplace ? (<><button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-warm-600 border border-warm-200 rounded hover:bg-warm-50"><Eye className="h-3.5 w-3.5" />Preview</button><button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-stone-600 text-white rounded hover:bg-stone-700"><Download className="h-3.5 w-3.5" />{template.price === 0 ? 'Install' : `Buy $${template.price}`}</button></>) : (<><button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-warm-600 border border-warm-200 rounded hover:bg-warm-50"><Eye className="h-3.5 w-3.5" />Preview</button><button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-warm-600 border border-warm-200 rounded hover:bg-warm-50"><Copy className="h-3.5 w-3.5" />Clone</button><button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-stone-600 text-white rounded hover:bg-stone-700"><Edit className="h-3.5 w-3.5" />Edit</button></>)}
      </div>
    </div>
  )
}

function TemplateRow({ template }: { template: Template }) {
  return (
    <tr className="hover:bg-warm-50">
      <td className="py-3 px-4"><div className="flex items-center gap-2">{template.isFavorite ? <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> : null}<div><div className="font-medium text-warm-900 flex items-center gap-2">{template.name}{template.isDefault ? <span className="text-xs font-medium text-warm-600 bg-warm-100 px-1.5 py-0.5 rounded">Default</span> : null}{template.source === 'marketplace' && <ShoppingBag className="h-3.5 w-3.5 text-stone-600" />}{template.isLegallyReviewed ? <Shield className="h-3.5 w-3.5 text-green-500" /> : null}</div><div className="text-xs text-warm-500">{template.description}</div></div></div></td>
      <td className="py-3 px-4"><span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', categoryColors[template.category])}>{template.category}</span></td>
      <td className="py-3 px-4 text-center text-xs text-warm-600">{template.pages}p</td>
      <td className="py-3 px-4 text-center text-xs text-warm-600">{template.variables}</td>
      <td className="py-3 px-4 text-center text-xs text-warm-600">{template.clauseCount}</td>
      <td className="py-3 px-4 text-center text-xs text-warm-600">{template.usageCount}x</td>
      <td className="py-3 px-4 text-center text-xs text-warm-500">v{template.version}</td>
      <td className="py-3 px-4 text-right text-xs text-warm-500">{template.lastUsed}</td>
      <td className="py-3 px-4"><button className="p-1 hover:bg-warm-100 rounded"><ChevronRight className="h-4 w-4 text-warm-400" /></button></td>
    </tr>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// QUALITY CHECKLIST COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

function QualityTemplateCard({ template, onPreview }: { template: QualityTemplate; onPreview: (template: QualityTemplate) => void }) {
  const isMarketplace = template.source === 'marketplace'
  return (
    <div className={cn("bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer", isMarketplace ? "border-stone-200" : "border-warm-200")}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', qualityTradeColors[template.trade])}>{template.trade}</span>
            <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', qualityPhaseColors[template.phase])}>{template.phase}</span>
            {template.isSystem ? <span className="text-xs font-medium text-stone-600 bg-stone-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Award className="h-3 w-3" />System</span> : null}
            {isMarketplace ? <span className="text-xs font-medium text-stone-600 bg-stone-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"><ShoppingBag className="h-3 w-3" />Marketplace</span> : null}
          </div>
          <h4 className="font-medium text-warm-900">{template.name}</h4>
          <span className="text-[10px] text-warm-400">v{template.version}</span>
        </div>
        <button className="p-1 hover:bg-warm-100 rounded"><MoreHorizontal className="h-4 w-4 text-warm-400" /></button>
      </div>
      <p className="text-sm text-warm-500 mb-3 line-clamp-2">{template.description}</p>
      <div className="flex items-center gap-3 mb-2 text-sm flex-wrap"><div className="flex items-center gap-1.5"><CheckSquare className="h-3.5 w-3.5 text-warm-400" /><span className="text-warm-600 text-xs">{template.itemCount} items</span></div><div className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-warm-400" /><span className="text-warm-600 text-xs">{template.sectionCount} sections</span></div></div>
      <div className="flex items-center gap-2 mb-2"><div className="flex items-center gap-0.5">{[1,2,3,4,5].map(star => <Star key={star} className={cn("h-3 w-3", star <= Math.round(template.rating) ? "text-amber-400 fill-amber-400" : "text-warm-300")} />)}</div><span className="text-xs text-warm-600">{template.rating.toFixed(1)}</span></div>
      <div className="flex items-center gap-1.5 mb-2 text-xs text-warm-500"><Users className="h-3 w-3" /><span>Used by {template.cloneCount} builders</span></div>
      <div className="flex items-center gap-1.5 mb-2 text-xs"><Target className="h-3 w-3 text-green-500" /><span className="text-green-700">FTQ Rated: {template.ftqRatedItems} of {template.ftqTotalItems} items</span></div>
      {isMarketplace && template.marketplaceRating ? <div className="flex items-center gap-3 mb-2 text-xs"><span className="text-warm-400">{template.marketplaceInstalls} installs</span><span className="text-warm-500">by {template.publisherName}</span>{template.price !== undefined && <span className={cn("font-medium", template.price === 0 ? "text-green-600" : "text-warm-900")}>{template.price === 0 ? 'Free' : `$${template.price}`}</span>}</div> : null}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-warm-100"><button onClick={() => onPreview(template)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-warm-600 border border-warm-200 rounded hover:bg-warm-50"><Eye className="h-3.5 w-3.5" />Preview</button><button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-stone-600 text-white rounded hover:bg-stone-700"><Copy className="h-3.5 w-3.5" />{isMarketplace ? (template.price === 0 ? 'Install' : `Buy $${template.price}`) : 'Clone / Use'}</button></div>
    </div>
  )
}

function QualityTemplatePreviewModal({ template, onClose }: { template: QualityTemplate; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-warm-1000 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-start justify-between p-4 border-b border-warm-200">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap"><span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', qualityTradeColors[template.trade])}>{template.trade}</span><span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', qualityPhaseColors[template.phase])}>{template.phase}</span>{template.isSystem ? <span className="text-xs font-medium text-stone-600 bg-stone-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Award className="h-3 w-3" />System</span> : null}</div>
            <h3 className="text-lg font-semibold text-warm-900">{template.name}</h3>
            <p className="text-sm text-warm-500 mt-1">{template.description}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-warm-100 rounded"><X className="h-5 w-5 text-warm-400" /></button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-warm-50 rounded-lg p-2.5 text-center"><div className="text-lg font-bold text-warm-900">{template.itemCount}</div><div className="text-xs text-warm-500">Items</div></div>
            <div className="bg-warm-50 rounded-lg p-2.5 text-center"><div className="text-lg font-bold text-warm-900">{template.sectionCount}</div><div className="text-xs text-warm-500">Sections</div></div>
            <div className="bg-warm-50 rounded-lg p-2.5 text-center"><div className="flex items-center justify-center gap-0.5">{[1,2,3,4,5].map(star => <Star key={star} className={cn("h-3 w-3", star <= Math.round(template.rating) ? "text-amber-400 fill-amber-400" : "text-warm-300")} />)}</div><div className="text-xs text-warm-500">{template.rating.toFixed(1)} Rating</div></div>
            <div className="bg-warm-50 rounded-lg p-2.5 text-center"><div className="text-lg font-bold text-warm-900">{template.cloneCount}</div><div className="text-xs text-warm-500">Builders</div></div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {template.conditionalRules > 0 && <div className="flex items-center gap-2 p-2.5 bg-warm-50 rounded-lg"><GitBranch className="h-4 w-4 text-stone-600" /><div><div className="text-sm font-medium text-warm-700">Conditional Rules</div><div className="text-xs text-stone-600">Contains {template.conditionalRules} branching rules</div></div></div>}
            {template.measurementCheckpoints > 0 && <div className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-lg"><Ruler className="h-4 w-4 text-stone-600" /><div><div className="text-sm font-medium text-stone-700">Measurements</div><div className="text-xs text-stone-600">Contains {template.measurementCheckpoints} checkpoints</div></div></div>}
            {template.supervisorApprovals > 0 && <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-lg"><UserCheck className="h-4 w-4 text-amber-600" /><div><div className="text-sm font-medium text-amber-700">Approvals</div><div className="text-xs text-amber-600">Requires {template.supervisorApprovals} supervisor sign-offs</div></div></div>}
          </div>
          <div className="mb-4"><h4 className="text-sm font-semibold text-warm-900 mb-2">Sections ({template.sectionCount})</h4><div className="flex flex-wrap gap-2">{template.sections.map((section, idx) => <span key={idx} className="text-xs px-2 py-1 bg-warm-100 text-warm-700 rounded">{section}</span>)}</div></div>
          <div><h4 className="text-sm font-semibold text-warm-900 mb-2">Sample Items</h4><ul className="space-y-1.5">{template.sampleItems.map((item, idx) => <li key={idx} className="flex items-start gap-2 text-sm text-warm-600"><CheckSquare className="h-4 w-4 text-warm-400 mt-0.5 flex-shrink-0" /><span>{item}</span></li>)}</ul></div>
        </div>
        <div className="p-4 border-t border-warm-200 flex items-center gap-3"><button onClick={onClose} className="flex-1 px-4 py-2 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">Close</button><button className="flex-1 px-4 py-2 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700 flex items-center justify-center gap-2"><Copy className="h-4 w-4" />Clone Template</button></div>
      </div>
    </div>
  )
}

function QualityFiltersPanel({ activeTrade, setActiveTrade, activePhase, setActivePhase, activeSource, setActiveSource, minRating, setMinRating }: { activeTrade: string; setActiveTrade: (t: string) => void; activePhase: string; setActivePhase: (p: string) => void; activeSource: string; setActiveSource: (s: string) => void; minRating: number; setMinRating: (r: number) => void }) {
  return (
    <div className="bg-white border-b border-warm-200 px-4 py-3">
      <div className="flex items-center gap-6 text-xs">
        <div className="flex items-center gap-2"><span className="text-warm-500 font-medium">Trade:</span><select value={activeTrade} onChange={e => setActiveTrade(e.target.value)} className="text-xs border border-warm-200 rounded px-2 py-1 bg-white"><option value="all">All Trades</option>{qualityTrades.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        <div className="flex items-center gap-2"><span className="text-warm-500 font-medium">Phase:</span><select value={activePhase} onChange={e => setActivePhase(e.target.value)} className="text-xs border border-warm-200 rounded px-2 py-1 bg-white"><option value="all">All Phases</option>{qualityPhases.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
        <div className="flex items-center gap-2"><span className="text-warm-500 font-medium">Source:</span><select value={activeSource} onChange={e => setActiveSource(e.target.value)} className="text-xs border border-warm-200 rounded px-2 py-1 bg-white"><option value="all">All Sources</option><option value="system">System</option><option value="custom">Custom</option><option value="marketplace">Marketplace</option></select></div>
        <div className="flex items-center gap-2"><span className="text-warm-500 font-medium">Rating:</span><select value={minRating} onChange={e => setMinRating(Number(e.target.value))} className="text-xs border border-warm-200 rounded px-2 py-1 bg-white"><option value={0}>Any</option><option value={4}>4+ stars</option><option value={3}>3+ stars</option></select></div>
      </div>
    </div>
  )
}

function CreateNewTemplateSection() {
  return (
    <div className="bg-gradient-to-r from-stone-50 to-indigo-50 border-b border-stone-200 px-4 py-4">
      <h4 className="text-sm font-semibold text-warm-900 mb-3 flex items-center gap-2"><Plus className="h-4 w-4 text-stone-600" />Create New Quality Template</h4>
      <div className="grid grid-cols-4 gap-3">
        <button className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-warm-200 hover:border-stone-300 hover:shadow-sm transition-all"><FileText className="h-5 w-5 text-warm-500" /><span className="text-xs font-medium text-warm-700">Create from Scratch</span></button>
        <button className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-warm-200 hover:border-stone-300 hover:shadow-sm transition-all"><Copy className="h-5 w-5 text-stone-500" /><span className="text-xs font-medium text-warm-700">Clone System Template</span></button>
        <button className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-warm-200 hover:border-stone-300 hover:shadow-sm transition-all"><Upload className="h-5 w-5 text-green-500" /><span className="text-xs font-medium text-warm-700">Import from File</span></button>
        <button className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-warm-200 hover:border-warm-300 hover:shadow-sm transition-all"><Wand2 className="h-5 w-5 text-stone-600" /><span className="text-xs font-medium text-warm-700">AI-Generate Template</span></button>
      </div>
    </div>
  )
}

function QualityChecklistsSection() {
  const [selectedTemplate, setSelectedTemplate] = useState<QualityTemplate | null>(null)
  const [activeTrade, setActiveTrade] = useState('all')
  const [activePhase, setActivePhase] = useState('all')
  const [activeSource, setActiveSource] = useState('all')
  const [minRating, setMinRating] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTemplates = mockQualityTemplates.filter(t => {
    if (activeTrade !== 'all' && t.trade !== activeTrade) return false
    if (activePhase !== 'all' && t.phase !== activePhase) return false
    if (activeSource !== 'all' && t.source !== activeSource) return false
    if (t.rating < minRating) return false
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase()) && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const systemTemplates = mockQualityTemplates.filter(t => t.source === 'system').length
  const customTemplates = mockQualityTemplates.filter(t => t.source === 'custom').length
  const marketplaceTemplates = mockQualityTemplates.filter(t => t.source === 'marketplace').length
  const totalItems = mockQualityTemplates.reduce((sum, t) => sum + t.itemCount, 0)

  return (
    <div className="border-t border-warm-200">
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 text-green-600" /><h3 className="font-semibold text-warm-900">Quality Checklists</h3><span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{mockQualityTemplates.length} templates</span></div>
          <div className="flex items-center gap-2"><input type="text" placeholder="Search quality templates..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="text-sm border border-warm-200 rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent" /><button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-stone-600 text-white rounded-lg hover:bg-stone-700"><Plus className="h-3.5 w-3.5" />New Template</button></div>
        </div>
      </div>
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-stone-50 rounded-lg p-2.5"><div className="flex items-center gap-1.5 text-stone-600 text-xs"><Award className="h-3.5 w-3.5" />System Templates</div><div className="text-lg font-bold text-stone-700 mt-0.5">{systemTemplates}</div></div>
          <div className="bg-warm-50 rounded-lg p-2.5"><div className="flex items-center gap-1.5 text-warm-500 text-xs"><FileText className="h-3.5 w-3.5" />Custom Templates</div><div className="text-lg font-bold text-warm-900 mt-0.5">{customTemplates}</div></div>
          <div className="bg-stone-50 rounded-lg p-2.5"><div className="flex items-center gap-1.5 text-stone-600 text-xs"><ShoppingBag className="h-3.5 w-3.5" />Marketplace</div><div className="text-lg font-bold text-stone-700 mt-0.5">{marketplaceTemplates}</div></div>
          <div className="bg-green-50 rounded-lg p-2.5"><div className="flex items-center gap-1.5 text-green-600 text-xs"><CheckSquare className="h-3.5 w-3.5" />Total Items</div><div className="text-lg font-bold text-green-700 mt-0.5">{totalItems}</div></div>
          <div className="bg-amber-50 rounded-lg p-2.5"><div className="flex items-center gap-1.5 text-amber-600 text-xs"><Target className="h-3.5 w-3.5" />FTQ Coverage</div><div className="text-lg font-bold text-amber-700 mt-0.5">87%</div></div>
        </div>
      </div>
      <QualityFiltersPanel activeTrade={activeTrade} setActiveTrade={setActiveTrade} activePhase={activePhase} setActivePhase={setActivePhase} activeSource={activeSource} setActiveSource={setActiveSource} minRating={minRating} setMinRating={setMinRating} />
      <CreateNewTemplateSection />
      <div className="p-4 grid grid-cols-3 gap-4 max-h-[500px] overflow-y-auto bg-warm-50">{filteredTemplates.map(t => <QualityTemplateCard key={t.id} template={t} onPreview={setSelectedTemplate} />)}{filteredTemplates.length === 0 && <div className="col-span-3 text-center py-12 text-warm-500">No quality templates match your filters</div>}</div>
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <AIFeaturesPanel title="AI Features for Quality Checklists" columns={2} features={[
          { feature: 'Template Recommendations', trigger: 'On project start', insight: 'AI suggests relevant quality checklists based on project type, scope, and regional requirements for your current job.', severity: 'info', action: { label: 'Get Recommendations', onClick: () => {} } },
          { feature: 'Custom Template Generation', trigger: 'On demand', insight: 'AI creates a custom quality checklist from your project specifications, drawings, and scope documents.', severity: 'success', action: { label: 'Generate Template', onClick: () => {} } },
          { feature: 'Template Optimization', trigger: 'Weekly', insight: 'AI analyzes usage patterns and failure rates to suggest improvements and identify redundant or missing items.', severity: 'warning', action: { label: 'View Suggestions', onClick: () => {} } },
          { feature: 'Code Compliance Check', trigger: 'Real-time', insight: 'Ensures your quality templates meet current local building codes and jurisdiction-specific requirements.', severity: 'critical', action: { label: 'Run Compliance Check', onClick: () => {} } },
          { feature: 'Industry Best Practices', trigger: 'On demand', insight: 'Compares your checklists against industry standards (ICC, NAHB, Energy Star) and identifies gaps.', severity: 'info', action: { label: 'Compare Standards', onClick: () => {} } },
        ]} />
      </div>
      {selectedTemplate ? <QualityTemplatePreviewModal template={selectedTemplate} onClose={() => setSelectedTemplate(null)} /> : null}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export function TemplatesPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })
  const [mainSection, setMainSection] = useState<'documents' | 'quality'>('documents')

  const filteredTemplates = sortItems(mockTemplates.filter(t => { if (!matchesSearch(t, search, ['name', 'description', 'category', 'publisherName'])) return false; if (activeTab === 'marketplace') return t.source === 'marketplace'; if (activeTab !== 'all' && t.category !== activeTab) return false; return true }), activeSort as keyof Template | '', sortDirection)

  const builderTemplates = mockTemplates.filter(t => t.source === 'builder').length
  const marketplaceTemplates = mockTemplates.filter(t => t.source === 'marketplace').length
  const legallyReviewed = mockTemplates.filter(t => t.isLegallyReviewed).length
  const totalUsage = mockTemplates.reduce((sum, t) => sum + t.usageCount, 0)
  const withAISuggestions = mockTemplates.filter(t => t.aiSuggestion).length

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <div className="flex items-center gap-1">
          <button onClick={() => setMainSection('documents')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors', mainSection === 'documents' ? 'bg-stone-100 text-stone-700' : 'text-warm-600 hover:bg-warm-100')}><FileText className="h-4 w-4" />Document Templates</button>
          <button onClick={() => setMainSection('quality')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors', mainSection === 'quality' ? 'bg-green-100 text-green-700' : 'text-warm-600 hover:bg-warm-100')}><ClipboardCheck className="h-4 w-4" />Quality Checklists<span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded-full">{mockQualityTemplates.length}</span></button>
        </div>
      </div>

      {mainSection === 'quality' ? <QualityChecklistsSection /> : (
        <>
          <div className="bg-white border-b border-warm-200 px-4 py-3">
            <div className="flex items-center gap-3 mb-3"><h3 className="font-semibold text-warm-900">Document Templates & Marketplace</h3><span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded">{builderTemplates} builder + {marketplaceTemplates} marketplace</span></div>
            <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search templates, publishers..." tabs={[{ key: 'all', label: 'All', count: mockTemplates.length }, ...categories.map(c => ({ key: c, label: c, count: mockTemplates.filter(t => t.category === c).length })), { key: 'marketplace', label: 'Marketplace', count: marketplaceTemplates }]} activeTab={activeTab} onTabChange={setActiveTab} sortOptions={[{ value: 'name', label: 'Name' }, { value: 'usageCount', label: 'Usage' }, { value: 'pages', label: 'Pages' }, { value: 'lastUpdated', label: 'Last Updated' }, { value: 'clauseCount', label: 'Clauses' }, { value: 'marketplaceRating', label: 'Rating' }]} activeSort={activeSort} onSortChange={setActiveSort} sortDirection={sortDirection} onSortDirectionChange={toggleSortDirection} viewMode={viewMode} onViewModeChange={setViewMode} actions={[{ icon: Plus, label: 'New Template', onClick: () => {}, variant: 'primary' }, { icon: Upload, label: 'Publish', onClick: () => {} }]} resultCount={filteredTemplates.length} totalCount={mockTemplates.length} />
          </div>
          <div className="bg-white border-b border-warm-200 px-4 py-3">
            <div className="grid grid-cols-5 gap-3">
              <div className="bg-warm-50 rounded-lg p-2.5"><div className="flex items-center gap-1.5 text-warm-500 text-xs"><FileText className="h-3.5 w-3.5" />Builder Templates</div><div className="text-lg font-bold text-warm-900 mt-0.5">{builderTemplates}</div></div>
              <div className="bg-warm-50 rounded-lg p-2.5"><div className="flex items-center gap-1.5 text-warm-500 text-xs"><TrendingUp className="h-3.5 w-3.5" />Total Usage</div><div className="text-lg font-bold text-warm-900 mt-0.5">{totalUsage}x</div></div>
              <div className="bg-green-50 rounded-lg p-2.5"><div className="flex items-center gap-1.5 text-green-600 text-xs"><Shield className="h-3.5 w-3.5" />Legally Reviewed</div><div className="text-lg font-bold text-green-700 mt-0.5">{legallyReviewed}</div></div>
              <div className="bg-stone-50 rounded-lg p-2.5"><div className="flex items-center gap-1.5 text-stone-600 text-xs"><ShoppingBag className="h-3.5 w-3.5" />Marketplace</div><div className="text-lg font-bold text-stone-700 mt-0.5">{marketplaceTemplates}</div></div>
              <div className={cn('rounded-lg p-2.5', withAISuggestions > 0 ? 'bg-amber-50' : 'bg-warm-50')}><div className={cn('flex items-center gap-1.5 text-xs', withAISuggestions > 0 ? 'text-amber-600' : 'text-warm-500')}><Sparkles className="h-3.5 w-3.5" />AI Suggestions</div><div className={cn('text-lg font-bold mt-0.5', withAISuggestions > 0 ? 'text-amber-700' : 'text-warm-900')}>{withAISuggestions}</div></div>
            </div>
          </div>
          <div className="bg-white border-b border-warm-200 px-4 py-2">
            <div className="flex items-center gap-3 text-xs"><span className="text-warm-500 font-medium">Connections:</span><span className="flex items-center gap-1 px-2 py-0.5 bg-warm-50 text-warm-700 rounded"><FileText className="h-3 w-3" />Contracts (Module 38)</span><span className="flex items-center gap-1 px-2 py-0.5 bg-stone-50 text-stone-700 rounded"><BookOpen className="h-3 w-3" />Estimating (Module 20)</span><span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded"><Globe className="h-3 w-3" />Marketplace (Module 48)</span><span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded"><Tag className="h-3 w-3" />State Compliance</span></div>
          </div>
          {viewMode === 'grid' ? <div className="p-4 grid grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">{filteredTemplates.map(t => <TemplateCard key={t.id} template={t} />)}{filteredTemplates.length === 0 && <div className="col-span-3 text-center py-12 text-warm-500">No templates match your search</div>}</div> : <div className="overflow-x-auto max-h-[500px] overflow-y-auto"><table className="w-full text-sm"><thead className="bg-warm-100 border-b border-warm-200 sticky top-0"><tr><th scope="col" className="text-left py-3 px-4 font-medium text-warm-600">Template</th><th scope="col" className="text-left py-3 px-4 font-medium text-warm-600">Category</th><th scope="col" className="text-center py-3 px-4 font-medium text-warm-600">Pages</th><th scope="col" className="text-center py-3 px-4 font-medium text-warm-600">Variables</th><th scope="col" className="text-center py-3 px-4 font-medium text-warm-600">Clauses</th><th scope="col" className="text-center py-3 px-4 font-medium text-warm-600">Usage</th><th scope="col" className="text-center py-3 px-4 font-medium text-warm-600">Version</th><th scope="col" className="text-right py-3 px-4 font-medium text-warm-600">Last Used</th><th scope="col" className="w-10" /></tr></thead><tbody className="bg-white divide-y divide-warm-100">{filteredTemplates.map(t => <TemplateRow key={t.id} template={t} />)}</tbody></table></div>}
          <div className="bg-warm-50 border-t border-amber-200 px-4 py-3"><div className="flex items-start gap-3"><div className="flex items-center gap-2 flex-shrink-0"><Sparkles className="h-4 w-4 text-amber-600" /><span className="font-medium text-sm text-amber-800">AI Insights:</span></div><div className="flex-1 text-sm text-amber-700 space-y-1"><p>SC mechanic lien statute updated Jan 2026 - 2 templates need clause updates for compliance. Review recommended.</p><p>Standard Cost-Plus with GMP is your most-used contract. Consider publishing to the marketplace to help other SC builders.</p><p>"Florida Builder Starter Pack" is trending in the marketplace (234 installs). Regional packs for your state are available.</p></div></div></div>
          <div className="bg-white border-t border-warm-200 px-4 py-4">
            <AIFeaturesPanel title="AI Features for Templates" columns={2} features={[
              { feature: 'Usage Analytics', trigger: 'Daily', insight: 'Shows most/least used templates to identify which templates drive value and which may need retirement or updates.', severity: 'info', action: { label: 'View Report', onClick: () => {} } },
              { feature: 'Version Tracking', trigger: 'Real-time', insight: 'Identifies outdated template versions and tracks changes across template revisions for compliance auditing.', severity: 'warning', action: { label: 'Review Versions', onClick: () => {} } },
              { feature: 'Customization Suggestions', trigger: 'On change', insight: 'Recommends template improvements based on usage patterns, industry best practices, and successful conversion rates.', severity: 'success', action: { label: 'See Suggestions', onClick: () => {} } },
              { feature: 'Compliance Updates', trigger: 'Real-time', insight: 'Flags templates needing legal updates when state regulations change, ensuring your contracts stay compliant.', severity: 'critical', action: { label: 'Check Compliance', onClick: () => {} } },
              { feature: 'Similar Template Detection', trigger: 'On creation', insight: 'Identifies duplicate or similar templates to reduce redundancy and maintain a clean template library.', severity: 'info', action: { label: 'Find Duplicates', onClick: () => {} } },
            ]} />
          </div>
        </>
      )}
    </div>
  )
}
