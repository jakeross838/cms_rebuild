'use client'

import Link from 'next/link'
import {
  Building2,
  HardHat,
  Briefcase,
  DollarSign,
  Users,
  CheckSquare,
  UserCircle,
  MessageSquare,
  Truck,
  FileCheck,
  Clock,
  Shield,
  PieChart,
  Settings,
  ArrowRight,
  Sparkles,
  Database,
  Layers,
  Search,
  PanelRightOpen,
  Target,
  ClipboardCheck,
  Calendar,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Page {
  name: string
  href: string
  description: string
  aiFeatures?: number
  uiPattern?: string
}

interface Category {
  name: string
  icon: React.ElementType
  phase: number
  color: string
  pages: Page[]
}

const categories: Category[] = [
  {
    name: 'Sales Pipeline',
    icon: Target,
    phase: 0,
    color: 'blue',
    pages: [
      { name: 'Leads', href: '/skeleton/leads', description: 'Pipeline view with AI scoring. Click lead opens detail panel.', aiFeatures: 6, uiPattern: 'List + Detail Panel' },
      { name: 'Estimates', href: '/skeleton/estimates', description: 'Selection-based estimating. Pick products, pricing auto-fills.', aiFeatures: 9, uiPattern: 'List + Inline Editor' },
      { name: 'Proposals', href: '/skeleton/proposals', description: 'Show selection options to clients. Tier comparison, upgrades.', aiFeatures: 8, uiPattern: 'List + Generator' },
      { name: 'Contracts', href: '/skeleton/contracts', description: 'Contract templates with e-signature. Status tracking.', uiPattern: 'List + Detail Panel' },
    ],
  },
  {
    name: 'Library',
    icon: Database,
    phase: 0,
    color: 'blue',
    pages: [
      { name: 'Selections Catalog', href: '/skeleton/library/selections', description: 'Master product/material library. Pricing tiers, vendor links.', aiFeatures: 8, uiPattern: 'Tree + Cards' },
      { name: 'Assemblies', href: '/skeleton/library/assemblies', description: 'Reusable estimate templates. Kitchen package, bathroom package.', uiPattern: 'Library + Editor' },
      { name: 'Cost Codes', href: '/skeleton/library/cost-codes', description: 'Cost code library. Drag to reorder. Bulk import/export.', uiPattern: 'Tree + Editor' },
      { name: 'Templates', href: '/skeleton/library/templates', description: 'Document and email templates.', uiPattern: 'Library + Editor' },
    ],
  },
  {
    name: 'Directory',
    icon: Users,
    phase: 0,
    color: 'blue',
    pages: [
      { name: 'Clients', href: '/skeleton/directory/clients', description: 'Client list with intelligence. Preferences and history.', aiFeatures: 8, uiPattern: 'List + Profile Panel' },
      { name: 'Vendors', href: '/skeleton/directory/vendors', description: 'Vendor list with scorecards. Performance tracking.', aiFeatures: 10, uiPattern: 'List + Profile Panel' },
      { name: 'Team', href: '/skeleton/directory/team', description: 'Employee management. Certifications, availability.', uiPattern: 'List + Profile Panel' },
      { name: 'Contacts', href: '/skeleton/directory/contacts', description: 'General contacts directory.', uiPattern: 'List + Detail Panel' },
    ],
  },
  {
    name: 'Operations',
    icon: Calendar,
    phase: 0,
    color: 'green',
    pages: [
      { name: 'Calendar', href: '/skeleton/operations/calendar', description: 'Company-wide calendar. All events in one view.', uiPattern: 'Calendar + Agenda' },
      { name: 'Crew Schedule', href: '/skeleton/operations/crew-schedule', description: 'Resource allocation across jobs.', aiFeatures: 6, uiPattern: 'Resource Grid' },
      { name: 'Equipment', href: '/skeleton/operations/equipment', description: 'Tool and equipment tracking.', uiPattern: 'List + Map' },
      { name: 'Deliveries', href: '/skeleton/operations/deliveries', description: 'Track material deliveries.', aiFeatures: 6, uiPattern: 'List + Calendar' },
    ],
  },
  {
    name: 'Financial',
    icon: DollarSign,
    phase: 0,
    color: 'green',
    pages: [
      { name: 'Dashboard', href: '/skeleton/financial/dashboard', description: 'Financial overview. Cash, AR, AP, margins.', aiFeatures: 6, uiPattern: 'Dashboard + KPIs' },
      { name: 'Accounts Receivable', href: '/skeleton/financial/receivables', description: 'Money owed to you. Aging, collection.', aiFeatures: 8, uiPattern: 'List + Aging' },
      { name: 'Accounts Payable', href: '/skeleton/financial/payables', description: 'Money you owe. Payment scheduling.', aiFeatures: 8, uiPattern: 'List + Scheduling' },
      { name: 'Cash Flow', href: '/skeleton/financial/cash-flow', description: 'Cash flow forecasting.', aiFeatures: 10, uiPattern: 'Chart + Forecast' },
      { name: 'Profitability', href: '/skeleton/financial/profitability', description: 'Job profitability analysis.', aiFeatures: 8, uiPattern: 'Dashboard + Drill-down' },
      { name: 'Reports', href: '/skeleton/financial/reports', description: 'Financial reports. WIP, P&L, etc.', aiFeatures: 6, uiPattern: 'Report Gallery' },
    ],
  },
  {
    name: 'Compliance',
    icon: ClipboardCheck,
    phase: 1,
    color: 'purple',
    pages: [
      { name: 'Insurance', href: '/skeleton/compliance/insurance', description: 'Insurance tracking. COIs, expiration alerts.', aiFeatures: 6, uiPattern: 'List + Alerts' },
      { name: 'Licenses', href: '/skeleton/compliance/licenses', description: 'Licenses and certifications.', aiFeatures: 4, uiPattern: 'List + Expiration' },
      { name: 'Safety', href: '/skeleton/compliance/safety', description: 'Safety management. Incidents, training.', aiFeatures: 6, uiPattern: 'Dashboard + Log' },
    ],
  },
  {
    name: 'Company',
    icon: Building2,
    phase: 0,
    color: 'gray',
    pages: [
      { name: 'Settings', href: '/skeleton/company/settings', description: 'Company configuration.', uiPattern: 'Tabbed Settings' },
      { name: 'Integrations', href: '/skeleton/company/integrations', description: 'QuickBooks, email, calendar connections.', uiPattern: 'Integration Gallery' },
      { name: 'Custom Dashboards', href: '/skeleton/company/dashboards', description: 'Build custom dashboards.', uiPattern: 'Dashboard Builder' },
      { name: 'Email Marketing', href: '/skeleton/company/email-marketing', description: 'Client outreach campaigns.', uiPattern: 'Campaign Builder' },
    ],
  },
  {
    name: 'Jobs',
    icon: Briefcase,
    phase: 0,
    color: 'blue',
    pages: [
      { name: 'All Jobs', href: '/skeleton/jobs', description: 'Job list. Click to enter job context.', aiFeatures: 6, uiPattern: 'Cards + Filter' },
    ],
  },
  {
    name: 'Job Context Views',
    icon: HardHat,
    phase: 0,
    color: 'orange',
    pages: [
      { name: 'Job Overview', href: '/skeleton/jobs/example', description: 'Job dashboard with key metrics.', aiFeatures: 8, uiPattern: 'Dashboard + Actions' },
      { name: 'Budget', href: '/skeleton/jobs/example/budget', description: 'Selection vs actual tracking.', aiFeatures: 10, uiPattern: 'Data Grid + Charts' },
      { name: 'Schedule', href: '/skeleton/jobs/example/schedule', description: 'Gantt chart with dependencies.', aiFeatures: 10, uiPattern: 'Gantt + Calendar' },
      { name: 'Daily Logs', href: '/skeleton/jobs/example/daily-logs', description: 'Voice-to-text entry. AI extraction.', aiFeatures: 10, uiPattern: 'Timeline + Voice' },
      { name: 'Selections', href: '/skeleton/jobs/example/selections', description: 'Job selections tracking.', aiFeatures: 6, uiPattern: 'List + Status' },
      { name: 'Purchase Orders', href: '/skeleton/jobs/example/purchase-orders', description: 'Job POs with budget tracking.', aiFeatures: 8, uiPattern: 'List + Budget' },
      { name: 'Invoices', href: '/skeleton/jobs/example/invoices', description: 'Job invoices with PO matching.', aiFeatures: 10, uiPattern: 'List + Review' },
      { name: 'Draws', href: '/skeleton/jobs/example/draws', description: 'Draw requests for this job.', aiFeatures: 8, uiPattern: 'List + Builder' },
      { name: 'Change Orders', href: '/skeleton/jobs/example/change-orders', description: 'Change order management.', aiFeatures: 8, uiPattern: 'List + Approval' },
      { name: 'RFIs', href: '/skeleton/jobs/example/rfis', description: 'RFI tracking and responses.', aiFeatures: 8, uiPattern: 'List + Thread' },
      { name: 'Submittals', href: '/skeleton/jobs/example/submittals', description: 'Submittal workflow.', aiFeatures: 6, uiPattern: 'List + Workflow' },
      { name: 'Punch List', href: '/skeleton/jobs/example/punch-list', description: 'Punch items by location.', aiFeatures: 6, uiPattern: 'List + Photo Markup' },
      { name: 'Permits', href: '/skeleton/jobs/example/permits', description: 'Permit tracking.', aiFeatures: 6, uiPattern: 'List + Status' },
      { name: 'Inspections', href: '/skeleton/jobs/example/inspections', description: 'Inspection scheduling.', aiFeatures: 8, uiPattern: 'List + Checklist' },
      { name: 'Lien Waivers', href: '/skeleton/jobs/example/lien-waivers', description: 'Lien waiver collection.', aiFeatures: 6, uiPattern: 'List + Compliance' },
      { name: 'Photos', href: '/skeleton/jobs/example/photos', description: 'Photo gallery by phase.', uiPattern: 'Gallery + Lightbox' },
      { name: 'Documents', href: '/skeleton/jobs/example/files', description: 'Document management.', uiPattern: 'File Browser' },
      { name: 'Team', href: '/skeleton/jobs/example/team', description: 'Job team roster.', uiPattern: 'List + Contact' },
      { name: 'Communications', href: '/skeleton/jobs/example/communications', description: 'Job communication history.', aiFeatures: 6, uiPattern: 'Timeline + Search' },
      { name: 'Warranties', href: '/skeleton/jobs/example/warranties', description: 'Product warranties.', aiFeatures: 4, uiPattern: 'List + Expiration' },
    ],
  },
  {
    name: 'Client Portal',
    icon: UserCircle,
    phase: 0,
    color: 'cyan',
    pages: [
      { name: 'Portal', href: '/skeleton/portal', description: 'Client-facing dashboard. Selection picker.', aiFeatures: 8, uiPattern: 'Dashboard + Tabs' },
    ],
  },
]

const colorClasses: Record<string, { bg: string; text: string; badge: string; border: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100', border: 'border-blue-200' },
  green: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100', border: 'border-green-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100', border: 'border-purple-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100', border: 'border-orange-200' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-700', badge: 'bg-pink-100', border: 'border-pink-200' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', badge: 'bg-cyan-100', border: 'border-cyan-200' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100', border: 'border-yellow-200' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100', border: 'border-gray-200' },
}

export default function OverviewPage() {
  const [search, setSearch] = useState('')
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null)

  const totalPages = categories.reduce((sum, cat) => sum + cat.pages.length, 0)
  const totalAIFeatures = categories.reduce(
    (sum, cat) => sum + cat.pages.reduce((s, p) => s + (p.aiFeatures || 0), 0),
    0
  )

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      pages: cat.pages.filter(
        (page) =>
          (selectedPhase === null || cat.phase === selectedPhase) &&
          (search === '' ||
            page.name.toLowerCase().includes(search.toLowerCase()) ||
            page.description.toLowerCase().includes(search.toLowerCase()))
      ),
    }))
    .filter((cat) => cat.pages.length > 0)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">RossOS - System Overview</h1>
            <p className="text-blue-200 text-sm">Developer Reference - All Pages</p>
          </div>
        </div>
        <p className="text-blue-100 mb-4">
          Complete page inventory with Hub & Spoke architecture. Company-level pages for cross-job functions,
          Job-level pages for project-specific work.
        </p>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-300" />
            <span>{totalPages} Pages</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>{totalAIFeatures} AI Features</span>
          </div>
          <div className="flex items-center gap-2">
            <PanelRightOpen className="h-4 w-4 text-green-300" />
            <span>Panel-based UX</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedPhase(null)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedPhase === null ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              All
            </button>
            {[0, 1].map((phase) => (
              <button
                key={phase}
                onClick={() => setSelectedPhase(phase)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedPhase === phase
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                Phase {phase}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {filteredCategories.map((category) => {
          const colors = colorClasses[category.color]
          return (
            <div key={category.name} className={cn('rounded-lg border', colors.border, colors.bg)}>
              <div className="px-4 py-3 border-b border-gray-200/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <category.icon className={cn('h-5 w-5', colors.text)} />
                  <h2 className="font-semibold text-gray-900">{category.name}</h2>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', colors.badge, colors.text)}>
                    Phase {category.phase}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{category.pages.length} pages</span>
              </div>

              <div className="divide-y divide-gray-200/50">
                {category.pages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="flex items-center justify-between px-4 py-3 hover:bg-white/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {page.name}
                        </span>
                        {page.aiFeatures && (
                          <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                            <Sparkles className="h-3 w-3" />
                            {page.aiFeatures} AI
                          </span>
                        )}
                        {page.uiPattern && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {page.uiPattern}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{page.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-4" />
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Architecture Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Hub & Spoke Architecture</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">Company Context (Hub)</h3>
            <p className="text-sm text-blue-700">
              Company-wide views when no job is selected. Sales pipeline, directories, financial dashboard,
              compliance tracking, settings. Accessible via top navigation.
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="font-medium text-orange-900 mb-2">Job Context (Spoke)</h3>
            <p className="text-sm text-orange-700">
              Job-specific views when a job is selected. Budget, schedule, daily logs, photos, documents,
              and all PM functions. Horizontal tabs within job header.
            </p>
          </div>
        </div>
      </div>

      {/* Intelligence Modules */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-600" />
          9 Intelligence Modules
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'Cost Intelligence', desc: 'Historical pricing, market rates' },
            { name: 'Selection Intelligence', desc: 'Catalog pricing, tier recommendations' },
            { name: 'Vendor Intelligence', desc: 'Scorecards, performance metrics' },
            { name: 'Labor Intelligence', desc: 'Productivity, crew optimization' },
            { name: 'Schedule Intelligence', desc: 'Weather, tide, predictions' },
            { name: 'Estimating Intelligence', desc: 'Feedback loop, bias detection' },
            { name: 'Document Intelligence', desc: 'OCR, extraction, classification' },
            { name: 'Project Intelligence', desc: 'Risk scoring, pattern detection' },
            { name: 'Client Intelligence', desc: 'Preferences, communication style' },
          ].map((module) => (
            <div key={module.name} className="bg-white/80 rounded-lg p-3">
              <div className="font-medium text-sm text-gray-900">{module.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{module.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
