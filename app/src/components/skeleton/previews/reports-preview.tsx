'use client'

import {
  FileText,
  Download,
  Calendar,
  Clock,
  Play,
  Mail,
  Settings,
  ChevronRight,
  Sparkles,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Plus,
  History,
  Eye,
  Lock,
  Users,
  Palette,
  Globe,
  Shield,
  Building2,
  BookCheck,
  Timer,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

type ReportCategory = 'financial' | 'operations' | 'tax' | 'client_facing' | 'company_wide' | 'custom'

interface Report {
  id: string
  name: string
  description: string
  lastRun?: string
  category: ReportCategory
  icon: typeof FileText
  audience: 'internal' | 'client' | 'bank' | 'both'
  accessRoles?: string[]
  aiNarrativeAvailable?: boolean
  dataFreshness?: string
  isLocked?: boolean
}

interface ScheduledReport {
  id: string
  reportName: string
  frequency: string
  nextRun: string
  recipients: string[]
  format: 'pdf' | 'excel' | 'both'
  conditionalRule?: string
  isActive: boolean
  lastDeliveryOpened?: boolean
}

interface RecentReport {
  id: string
  reportName: string
  generatedAt: string
  generatedBy: string
  format: 'pdf' | 'excel' | 'csv' | 'word'
  highlights?: string[]
  audience: 'internal' | 'client' | 'bank'
  aiNarrative?: boolean
}

const standardReports: Report[] = [
  // Financial Reports
  {
    id: '1',
    name: 'Work in Progress (WIP)',
    description: 'Over/under billing analysis for all active jobs (cost-to-cost method)',
    lastRun: '2026-02-10',
    category: 'financial',
    icon: BarChart3,
    audience: 'internal',
    accessRoles: ['owner', 'admin', 'office'],
    aiNarrativeAvailable: true,
    dataFreshness: 'Feb 10, 3:45 PM',
    isLocked: true,
  },
  {
    id: '2',
    name: 'Job Cost Summary',
    description: 'Budget vs actual with variance analysis for all jobs',
    lastRun: '2026-02-08',
    category: 'financial',
    icon: DollarSign,
    audience: 'internal',
    aiNarrativeAvailable: true,
    dataFreshness: 'Feb 8, 2:30 PM',
  },
  {
    id: '3',
    name: 'Job Cost Detail',
    description: 'Detailed cost breakdown by job and cost code with committed costs',
    lastRun: '2026-02-05',
    category: 'financial',
    icon: FileText,
    audience: 'internal',
    dataFreshness: 'Feb 5, 10:15 AM',
  },
  {
    id: '4',
    name: 'AP Aging Report',
    description: 'Outstanding payables by aging bucket with early payment discounts',
    lastRun: '2026-02-12',
    category: 'financial',
    icon: TrendingUp,
    audience: 'internal',
    dataFreshness: 'Feb 12, 9:15 AM',
  },
  {
    id: '5',
    name: 'AR Aging Report',
    description: 'Outstanding receivables by aging bucket with collection status',
    lastRun: '2026-02-12',
    category: 'financial',
    icon: PieChart,
    audience: 'internal',
    dataFreshness: 'Feb 12, 9:15 AM',
  },
  {
    id: '6',
    name: 'Income Statement',
    description: 'Revenue, expenses, and net income summary with period comparison',
    lastRun: '2026-01-31',
    category: 'financial',
    icon: BarChart3,
    audience: 'internal',
    accessRoles: ['owner', 'admin'],
    aiNarrativeAvailable: true,
    isLocked: true,
  },
  {
    id: '7',
    name: 'Cash Flow Forecast',
    description: 'Cash inflows/outflows by period with scenario modeling',
    lastRun: '2026-02-01',
    category: 'financial',
    icon: TrendingUp,
    audience: 'internal',
    aiNarrativeAvailable: true,
  },
  {
    id: '8',
    name: 'Profit Margin by Project',
    description: 'Portfolio profitability with gross/net margin and overhead allocation',
    lastRun: '2026-02-08',
    category: 'financial',
    icon: DollarSign,
    audience: 'internal',
    accessRoles: ['owner', 'admin', 'pm'],
    aiNarrativeAvailable: true,
  },
  {
    id: '9',
    name: 'Vendor Payment Summary',
    description: 'Payment history by vendor with 1099 eligibility flag',
    lastRun: '2026-02-10',
    category: 'financial',
    icon: FileText,
    audience: 'internal',
  },
  {
    id: '10',
    name: 'Retainage Report',
    description: 'Retainage held and payable with release date tracking',
    lastRun: '2026-02-05',
    category: 'financial',
    icon: DollarSign,
    audience: 'internal',
  },
  // Tax & Accounting Reports
  {
    id: '11',
    name: '1099 Preparation',
    description: 'Vendor payments above IRS threshold with W-9 status flags',
    lastRun: '2026-01-15',
    category: 'tax',
    icon: FileText,
    audience: 'internal',
    accessRoles: ['owner', 'admin', 'office'],
  },
  {
    id: '12',
    name: 'Sales Tax Report',
    description: 'Sales tax collected and remitted by jurisdiction',
    category: 'tax',
    icon: DollarSign,
    audience: 'internal',
    accessRoles: ['owner', 'admin', 'office'],
  },
  {
    id: '13',
    name: 'Insurance Audit Data',
    description: 'Payroll by class code, subcontractor spend by trade for audit',
    category: 'tax',
    icon: Shield,
    audience: 'internal',
    accessRoles: ['owner', 'admin'],
  },
  // Client-Facing Reports
  {
    id: '14',
    name: 'Owner Budget Report',
    description: 'Client-friendly budget status without internal cost detail',
    lastRun: '2026-02-10',
    category: 'client_facing',
    icon: Building2,
    audience: 'client',
    aiNarrativeAvailable: true,
  },
  {
    id: '15',
    name: 'Monthly Project Update',
    description: 'Progress photos, schedule status, and financial summary for clients',
    lastRun: '2026-02-01',
    category: 'client_facing',
    icon: Calendar,
    audience: 'client',
    aiNarrativeAvailable: true,
  },
  {
    id: '16',
    name: 'Draw Request (AIA G702/G703)',
    description: 'AIA-format Application and Certificate for Payment',
    lastRun: '2026-02-05',
    category: 'client_facing',
    icon: FileText,
    audience: 'bank',
  },
  // Company-Wide Reports
  {
    id: '17',
    name: 'Business Performance Review',
    description: 'Year-over-year comparison with KPI scorecard and trend analysis',
    category: 'company_wide',
    icon: BarChart3,
    audience: 'internal',
    accessRoles: ['owner'],
    aiNarrativeAvailable: true,
  },
  {
    id: '18',
    name: 'Cross-Project Benchmarking',
    description: 'Compare cost/SF, margin %, CO rate across projects',
    lastRun: '2026-02-01',
    category: 'company_wide',
    icon: PieChart,
    audience: 'internal',
    accessRoles: ['owner', 'admin'],
    aiNarrativeAvailable: true,
  },
  {
    id: '19',
    name: 'PM Profitability Ranking',
    description: 'Projects managed, average margin, budget accuracy by PM',
    category: 'company_wide',
    icon: Users,
    audience: 'internal',
    accessRoles: ['owner'],
  },
]

const reportCategoryConfig: Record<ReportCategory, { label: string; color: string }> = {
  financial: { label: 'Financial', color: 'bg-stone-100 text-stone-700' },
  operations: { label: 'Operations', color: 'bg-green-100 text-green-700' },
  tax: { label: 'Tax & Accounting', color: 'bg-warm-100 text-warm-700' },
  client_facing: { label: 'Client-Facing', color: 'bg-sand-100 text-sand-700' },
  company_wide: { label: 'Company-Wide', color: 'bg-stone-100 text-stone-700' },
  custom: { label: 'Custom', color: 'bg-warm-100 text-warm-700' },
}

const audienceConfig: Record<string, { label: string; icon: typeof Eye }> = {
  internal: { label: 'Internal', icon: Eye },
  client: { label: 'Client', icon: Building2 },
  bank: { label: 'Bank/Lender', icon: BookCheck },
  both: { label: 'All Audiences', icon: Globe },
}

const scheduledReports: ScheduledReport[] = [
  {
    id: '1',
    reportName: 'WIP Report',
    frequency: 'Monthly (1st)',
    nextRun: 'Mar 1, 2026',
    recipients: ['jake@rossbuilt.com'],
    format: 'both',
    isActive: true,
    lastDeliveryOpened: true,
  },
  {
    id: '2',
    reportName: 'Cash Flow Forecast',
    frequency: 'Weekly (Mon)',
    nextRun: 'Feb 17, 2026',
    recipients: ['accounting@rossbuilt.com'],
    format: 'pdf',
    isActive: true,
    lastDeliveryOpened: true,
  },
  {
    id: '3',
    reportName: 'Job Cost Detail',
    frequency: 'Monthly (15th)',
    nextRun: 'Feb 15, 2026',
    recipients: ['ops@rossbuilt.com', 'jake@rossbuilt.com'],
    format: 'excel',
    isActive: true,
    lastDeliveryOpened: false,
  },
  {
    id: '4',
    reportName: 'AP/AR Aging',
    frequency: 'Weekly (Fri)',
    nextRun: 'Feb 14, 2026',
    recipients: ['accounting@rossbuilt.com'],
    format: 'pdf',
    isActive: true,
    lastDeliveryOpened: true,
  },
  {
    id: '5',
    reportName: 'Budget Alert',
    frequency: 'Daily',
    nextRun: 'Feb 13, 2026',
    recipients: ['jake@rossbuilt.com'],
    format: 'pdf',
    conditionalRule: 'Only if any cost code > 90% of budget',
    isActive: true,
    lastDeliveryOpened: true,
  },
  {
    id: '6',
    reportName: 'Monthly Client Update',
    frequency: 'Monthly (last day)',
    nextRun: 'Feb 28, 2026',
    recipients: ['clients@rossbuilt.com'],
    format: 'pdf',
    isActive: false,
    lastDeliveryOpened: undefined,
  },
]

const recentReports: RecentReport[] = [
  {
    id: '1',
    reportName: 'AP Aging Report',
    generatedAt: '2026-02-12 09:15 AM',
    generatedBy: 'System (Scheduled)',
    format: 'pdf',
    highlights: ['$165K due this week', '2 invoices need lien waivers'],
    audience: 'internal',
    aiNarrative: false,
  },
  {
    id: '2',
    reportName: 'AR Aging Report',
    generatedAt: '2026-02-12 09:15 AM',
    generatedBy: 'System (Scheduled)',
    format: 'pdf',
    highlights: ['DSO improved to 28 days', '$60K in 31-60 bucket'],
    audience: 'internal',
    aiNarrative: false,
  },
  {
    id: '3',
    reportName: 'WIP Report',
    generatedAt: '2026-02-10 10:30 AM',
    generatedBy: 'Jake Ross',
    format: 'excel',
    highlights: ['Smith Residence overbilled $45K', '2 jobs need attention'],
    audience: 'internal',
    aiNarrative: true,
  },
  {
    id: '4',
    reportName: 'Job Cost Summary',
    generatedAt: '2026-02-08 02:45 PM',
    generatedBy: 'Jake Ross',
    format: 'pdf',
    highlights: ['Overall margin at 14.8%', 'Framing costs trending over'],
    audience: 'internal',
    aiNarrative: true,
  },
  {
    id: '5',
    reportName: 'Monthly Client Update - Smith',
    generatedAt: '2026-02-01 08:00 AM',
    generatedBy: 'System (Scheduled)',
    format: 'pdf',
    highlights: ['On schedule', 'Budget on track'],
    audience: 'client',
    aiNarrative: true,
  },
  {
    id: '6',
    reportName: 'Draw Request G702 - Johnson',
    generatedAt: '2026-02-05 03:30 PM',
    generatedBy: 'Jake Ross',
    format: 'pdf',
    highlights: ['Draw #3: $60,000', 'Retainage: $6,000'],
    audience: 'bank',
    aiNarrative: false,
  },
]

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ReportCard({ report }: { report: Report }) {
  const Icon = report.icon
  const catConfig = reportCategoryConfig[report.category]
  const audConfig = audienceConfig[report.audience]
  const AudIcon = audConfig.icon

  return (
    <div className="bg-white border border-warm-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-stone-50 rounded-lg">
            <Icon className="h-5 w-5 text-stone-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-warm-900">{report.name}</h4>
              {report.isLocked && (
                <span title="Period locked"><Lock className="h-3.5 w-3.5 text-warm-400" /></span>
              )}
            </div>
            <p className="text-sm text-warm-500 mt-0.5">{report.description}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", catConfig.color)}>
                {catConfig.label}
              </span>
              <span className="text-xs text-warm-400 flex items-center gap-1">
                <AudIcon className="h-3 w-3" />
                {audConfig.label}
              </span>
              {report.aiNarrativeAvailable && (
                <span className="text-xs text-stone-600 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI narrative
                </span>
              )}
              {report.accessRoles && (
                <span className="text-xs text-warm-400 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {report.accessRoles.join(', ')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              {report.lastRun && (
                <span className="text-xs text-warm-400">
                  Last run: {formatDate(report.lastRun)}
                </span>
              )}
              {report.dataFreshness && (
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  Data: {report.dataFreshness}
                </span>
              )}
            </div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-warm-300 flex-shrink-0" />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
          <Play className="h-3.5 w-3.5" />
          Generate
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
          <Calendar className="h-3.5 w-3.5" />
          Schedule
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
          <History className="h-3.5 w-3.5" />
          History
        </button>
      </div>
    </div>
  )
}

function ScheduledReportRow({ report }: { report: ScheduledReport }) {
  return (
    <div className={cn(
      "flex items-center justify-between py-2.5 px-3 hover:bg-warm-50 rounded",
      !report.isActive && "opacity-50"
    )}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className={cn("h-4 w-4", report.isActive ? "text-stone-500" : "text-warm-300")} />
          <span className="font-medium text-warm-900 text-sm">{report.reportName}</span>
          {!report.isActive && (
            <span className="text-xs text-warm-400 bg-warm-100 px-1.5 py-0.5 rounded">Paused</span>
          )}
        </div>
        <span className="text-sm text-warm-500">{report.frequency}</span>
        <span className={cn(
          "text-xs px-1.5 py-0.5 rounded font-medium uppercase",
          report.format === 'pdf' ? "bg-red-100 text-red-600" :
          report.format === 'excel' ? "bg-green-100 text-green-600" : "bg-stone-100 text-stone-600"
        )}>
          {report.format === 'both' ? 'PDF+XLS' : report.format}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {report.conditionalRule && (
          <span className="text-xs text-stone-600 flex items-center gap-1" title={report.conditionalRule}>
            <AlertTriangle className="h-3 w-3" />
            Conditional
          </span>
        )}
        <div className="flex items-center gap-1 text-sm text-warm-500">
          <Mail className="h-3.5 w-3.5" />
          <span>{report.recipients.length} recipient{report.recipients.length > 1 ? 's' : ''}</span>
          {report.lastDeliveryOpened !== undefined && (
            <span className={cn(
              "ml-1",
              report.lastDeliveryOpened ? "text-green-500" : "text-warm-400"
            )}>
              {report.lastDeliveryOpened ? '(opened)' : '(not opened)'}
            </span>
          )}
        </div>
        <span className="text-xs text-warm-400">Next: {report.nextRun}</span>
        <button className="p-1 hover:bg-warm-100 rounded">
          <Settings className="h-4 w-4 text-warm-400" />
        </button>
      </div>
    </div>
  )
}

function RecentReportRow({ report }: { report: RecentReport }) {
  const formatColors: Record<string, string> = {
    pdf: "bg-red-100 text-red-600",
    excel: "bg-green-100 text-green-600",
    csv: "bg-warm-100 text-warm-600",
    word: "bg-stone-100 text-stone-600",
  }
  const audInfo = audienceConfig[report.audience]
  const AudIcon = audInfo.icon

  return (
    <div className="flex items-center justify-between py-3 px-3 hover:bg-warm-50 rounded border-b border-warm-100 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-warm-900 text-sm">{report.reportName}</span>
          <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium uppercase", formatColors[report.format] ?? "bg-warm-100 text-warm-600")}>
            {report.format}
          </span>
          <span className="text-xs text-warm-400 flex items-center gap-1">
            <AudIcon className="h-3 w-3" />
            {audInfo.label}
          </span>
          {report.aiNarrative && (
            <span className="text-xs text-stone-600 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI narrative
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-xs text-warm-400">{report.generatedAt}</span>
          <span className="text-xs text-warm-400">by {report.generatedBy}</span>
        </div>
        {report.highlights && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {report.highlights.map((highlight, idx) => (
              <span key={idx} className="text-xs bg-stone-50 text-stone-700 px-2 py-0.5 rounded">
                {highlight}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 ml-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
          <Download className="h-3.5 w-3.5" />
          Download
        </button>
        <button className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-warm-400 hover:text-stone-600 rounded-lg hover:bg-warm-50" title="Regenerate">
          <Play className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function ReportsPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({ defaultTab: 'standard' })

  // Category filter for standard reports
  const categories: ReportCategory[] = ['financial', 'tax', 'client_facing', 'company_wide']
  const activeCategoryFilter = activeSort === 'category' ? sortDirection : ''

  const filteredStandardReports = sortItems(
    standardReports.filter(report => {
      if (!matchesSearch(report, search, ['name', 'description'])) return false
      return true
    }),
    activeSort as keyof Report | '',
    sortDirection,
  )

  const filteredScheduledReports = scheduledReports.filter(report =>
    matchesSearch(report, search, ['reportName', 'frequency']),
  )

  const filteredRecentReports = recentReports.filter(report =>
    matchesSearch(report, search, ['reportName', 'generatedBy']),
  )

  // Group standard reports by category
  const reportsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = filteredStandardReports.filter(r => r.category === cat)
    return acc
  }, {} as Record<ReportCategory, Report[]>)

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">Reports</h3>
              <span className="text-sm text-warm-500">{standardReports.length} standard | {scheduledReports.filter(s => s.isActive).length} scheduled</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Palette className="h-4 w-4" />
              Branding
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Plus className="h-4 w-4" />
              Custom Report
            </button>
          </div>
        </div>
      </div>

      {/* AI Alert - Month End */}
      <div className="bg-stone-50 border-b border-stone-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-stone-600" />
          <span className="text-sm text-stone-700">
            <span className="font-medium">Month-end in 3 days.</span> WIP report due for bank covenant review.
            January period is unlocked - lock before generating final reports.
            <button className="ml-2 underline text-stone-800 hover:text-stone-900">Generate WIP</button>
            <button className="ml-2 underline text-stone-800 hover:text-stone-900">Lock Period</button>
          </span>
        </div>
      </div>

      {/* Branding Status Bar */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-warm-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Palette className="h-3 w-3 text-green-500" />
              Branding: Configured (Logo + Colors)
            </span>
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-amber-500" />
              Period Lock: Jan 2026 = Open | Dec 2025 = Locked
            </span>
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3 text-stone-500" />
              Export: PDF, Excel, CSV, Word
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-stone-600" />
            AI Narratives: {standardReports.filter(r => r.aiNarrativeAvailable).length} reports supported
          </span>
        </div>
      </div>

      {/* Navigation Tabs + Search */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search reports..."
          tabs={[
            { key: 'standard', label: 'Standard Reports', count: standardReports.length },
            { key: 'scheduled', label: 'Scheduled', count: scheduledReports.length },
            { key: 'recent', label: 'Recent', count: recentReports.length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={activeTab === 'standard' ? [
            { value: 'name', label: 'Name' },
            { value: 'lastRun', label: 'Last Run' },
            { value: 'category', label: 'Category' },
            { value: 'audience', label: 'Audience' },
          ] : []}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
        />
      </div>

      {/* Content */}
      <div className="p-4 max-h-[600px] overflow-y-auto">
        {activeTab === 'standard' && (
          <div className="space-y-6">
            {categories.map(cat => {
              const reports = reportsByCategory[cat]
              if (!reports || reports.length === 0) return null
              const catConfig = reportCategoryConfig[cat]
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded font-medium", catConfig.color)}>
                      {catConfig.label}
                    </span>
                    <span className="text-xs text-warm-400">{reports.length} reports</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {reports.map(report => (
                      <ReportCard key={report.id} report={report} />
                    ))}
                  </div>
                </div>
              )
            })}
            {filteredStandardReports.length === 0 && (
              <div className="text-center py-8 text-warm-400 text-sm border-2 border-dashed border-warm-200 rounded-lg">
                No reports match your search
              </div>
            )}
          </div>
        )}

        {activeTab === 'scheduled' && (
          <div className="bg-white rounded-lg border border-warm-200">
            <div className="px-4 py-3 border-b border-warm-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium text-warm-900 text-sm">Scheduled Reports</h4>
                  <span className="text-xs text-warm-400">
                    {scheduledReports.filter(s => s.isActive).length} active | {scheduledReports.filter(s => !s.isActive).length} paused
                  </span>
                </div>
                <button className="text-sm text-stone-600 hover:text-stone-700 font-medium">
                  + Add Schedule
                </button>
              </div>
            </div>
            <div className="p-2">
              {filteredScheduledReports.map(report => (
                <ScheduledReportRow key={report.id} report={report} />
              ))}
              {filteredScheduledReports.length === 0 && (
                <div className="text-center py-8 text-warm-400 text-sm">
                  No scheduled reports match your search
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="bg-white rounded-lg border border-warm-200">
            <div className="px-4 py-3 border-b border-warm-200">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-warm-900 text-sm">Recently Generated Reports</h4>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-warm-400">Last 7 days</span>
                  <span className="text-xs text-warm-400">{recentReports.filter(r => r.aiNarrative).length} with AI narrative</span>
                </div>
              </div>
            </div>
            <div className="p-2">
              {filteredRecentReports.map(report => (
                <RecentReportRow key={report.id} report={report} />
              ))}
              {filteredRecentReports.length === 0 && (
                <div className="text-center py-8 text-warm-400 text-sm">
                  No recent reports match your search
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Report Generator */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <h4 className="font-medium text-warm-900 text-sm mb-3">Quick Generate</h4>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <select className="w-full px-3 py-2 text-sm border border-warm-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-stone-500">
              <option>Select a report...</option>
              {standardReports.map(report => (
                <option key={report.id} value={report.id}>{report.name}</option>
              ))}
            </select>
          </div>
          <select className="px-3 py-2 text-sm border border-warm-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-stone-500">
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Quarter</option>
            <option>YTD</option>
            <option>Custom Range</option>
          </select>
          <select className="px-3 py-2 text-sm border border-warm-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-stone-500">
            <option>All Jobs</option>
            <option>Active Jobs Only</option>
            <option>Select Jobs...</option>
          </select>
          <select className="px-3 py-2 text-sm border border-warm-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-stone-500">
            <option>Internal</option>
            <option>Client-Facing</option>
            <option>Bank/Lender</option>
          </select>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
              <Download className="h-4 w-4" />
              PDF
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Download className="h-4 w-4" />
              Excel
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Download className="h-4 w-4" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Report Recommendations:</span>
          </div>
          <p className="text-sm text-amber-700">
            Based on your activity, consider running the Job Cost Detail report for Smith Residence -
            margin has dropped 4% since last report. The WIP report shows potential overbilling on 2 jobs
            that should be reviewed before month-end. January period is unlocked - lock now to protect financial data.
            Your scheduled reports have been delivered on time - 94% open rate by recipients.
            1 scheduled report (Job Cost Detail) was not opened by recipients last delivery.
          </p>
        </div>
      </div>

      {/* AI Features Panel */}
      <AIFeaturesPanel
        features={[
          {
            feature: 'Report Recommendations',
            insight: 'Suggests relevant reports',
          },
          {
            feature: 'Anomaly Detection',
            insight: 'Highlights unusual data patterns',
          },
          {
            feature: 'Trend Analysis',
            insight: 'Identifies key trends',
          },
          {
            feature: 'Scheduled Delivery',
            insight: 'Automates report distribution',
          },
          {
            feature: 'Custom Insights',
            insight: 'AI-generated report summaries',
          },
        ]}
      />
    </div>
  )
}
