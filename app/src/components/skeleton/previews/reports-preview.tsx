'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ReportType = 'wip' | 'job_cost_summary' | 'job_cost_detail' | 'ap_aging' | 'ar_aging' | 'income_statement' | 'cash_flow'

interface Report {
  id: string
  type: ReportType
  name: string
  description: string
  lastRun?: string
  scheduledRecurrence?: string
  scheduledRecipients?: string[]
  category: 'standard' | 'custom'
  icon: typeof FileText
}

interface ScheduledReport {
  id: string
  reportName: string
  frequency: string
  nextRun: string
  recipients: string[]
}

interface RecentReport {
  id: string
  reportName: string
  generatedAt: string
  generatedBy: string
  format: 'pdf' | 'excel'
  highlights?: string[]
}

const standardReports: Report[] = [
  {
    id: '1',
    type: 'wip',
    name: 'Work in Progress (WIP)',
    description: 'Over/under billing analysis for all active jobs',
    lastRun: '2026-02-10',
    category: 'standard',
    icon: BarChart3,
  },
  {
    id: '2',
    type: 'job_cost_summary',
    name: 'Job Cost Summary',
    description: 'Budget vs actual for all jobs',
    lastRun: '2026-02-08',
    category: 'standard',
    icon: DollarSign,
  },
  {
    id: '3',
    type: 'job_cost_detail',
    name: 'Job Cost Detail',
    description: 'Detailed cost breakdown by job and cost code',
    lastRun: '2026-02-05',
    category: 'standard',
    icon: FileText,
  },
  {
    id: '4',
    type: 'ap_aging',
    name: 'AP Aging Report',
    description: 'Outstanding payables by aging bucket',
    lastRun: '2026-02-12',
    category: 'standard',
    icon: TrendingUp,
  },
  {
    id: '5',
    type: 'ar_aging',
    name: 'AR Aging Report',
    description: 'Outstanding receivables by aging bucket',
    lastRun: '2026-02-12',
    category: 'standard',
    icon: PieChart,
  },
  {
    id: '6',
    type: 'income_statement',
    name: 'Income Statement',
    description: 'Revenue, expenses, and net income summary',
    lastRun: '2026-01-31',
    category: 'standard',
    icon: BarChart3,
  },
  {
    id: '7',
    type: 'cash_flow',
    name: 'Cash Flow Statement',
    description: 'Cash inflows and outflows by period',
    lastRun: '2026-02-01',
    category: 'standard',
    icon: TrendingUp,
  },
]

const scheduledReports: ScheduledReport[] = [
  {
    id: '1',
    reportName: 'WIP Report',
    frequency: 'Monthly (1st)',
    nextRun: 'Mar 1, 2026',
    recipients: ['jake@rossbuilt.com'],
  },
  {
    id: '2',
    reportName: 'Cash Flow',
    frequency: 'Weekly (Mon)',
    nextRun: 'Feb 17, 2026',
    recipients: ['accounting@rossbuilt.com'],
  },
  {
    id: '3',
    reportName: 'Job Cost Detail',
    frequency: 'Monthly (15th)',
    nextRun: 'Feb 15, 2026',
    recipients: ['ops@rossbuilt.com', 'jake@rossbuilt.com'],
  },
  {
    id: '4',
    reportName: 'AP/AR Aging',
    frequency: 'Weekly (Fri)',
    nextRun: 'Feb 14, 2026',
    recipients: ['accounting@rossbuilt.com'],
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
  },
  {
    id: '2',
    reportName: 'AR Aging Report',
    generatedAt: '2026-02-12 09:15 AM',
    generatedBy: 'System (Scheduled)',
    format: 'pdf',
    highlights: ['DSO improved to 28 days', '$60K in 31-60 bucket'],
  },
  {
    id: '3',
    reportName: 'WIP Report',
    generatedAt: '2026-02-10 10:30 AM',
    generatedBy: 'Jake Ross',
    format: 'excel',
    highlights: ['Smith Residence overbilled $45K', '2 jobs need attention'],
  },
  {
    id: '4',
    reportName: 'Job Cost Summary',
    generatedAt: '2026-02-08 02:45 PM',
    generatedBy: 'Jake Ross',
    format: 'pdf',
    highlights: ['Overall margin at 14.8%', 'Framing costs trending over'],
  },
]

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ReportCard({ report }: { report: Report }) {
  const Icon = report.icon

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{report.name}</h4>
            <p className="text-sm text-gray-500 mt-0.5">{report.description}</p>
            {report.lastRun && (
              <p className="text-xs text-gray-400 mt-2">
                Last run: {formatDate(report.lastRun)}
              </p>
            )}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-300" />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Play className="h-3.5 w-3.5" />
          Generate
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
          <Calendar className="h-3.5 w-3.5" />
          Schedule
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
          <History className="h-3.5 w-3.5" />
          History
        </button>
      </div>
    </div>
  )
}

function ScheduledReportRow({ report }: { report: ScheduledReport }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-900 text-sm">{report.reportName}</span>
        </div>
        <span className="text-sm text-gray-500">{report.frequency}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Mail className="h-3.5 w-3.5" />
          <span>{report.recipients.length} recipient{report.recipients.length > 1 ? 's' : ''}</span>
        </div>
        <span className="text-xs text-gray-400">Next: {report.nextRun}</span>
        <button className="p-1 hover:bg-gray-100 rounded">
          <Settings className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
  )
}

function RecentReportRow({ report }: { report: RecentReport }) {
  return (
    <div className="flex items-center justify-between py-3 px-3 hover:bg-gray-50 rounded border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 text-sm">{report.reportName}</span>
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded font-medium uppercase",
            report.format === 'pdf' ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
          )}>
            {report.format}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-xs text-gray-400">{report.generatedAt}</span>
          <span className="text-xs text-gray-400">by {report.generatedBy}</span>
        </div>
        {report.highlights && (
          <div className="flex items-center gap-2 mt-2">
            {report.highlights.map((highlight, idx) => (
              <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                {highlight}
              </span>
            ))}
          </div>
        )}
      </div>
      <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
        <Download className="h-3.5 w-3.5" />
        Download
      </button>
    </div>
  )
}

export function ReportsPreview() {
  const [activeCategory, setActiveCategory] = useState<'standard' | 'scheduled' | 'recent'>('standard')

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Financial Reports</h3>
              <span className="text-sm text-gray-500">{standardReports.length} standard reports</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Plus className="h-4 w-4" />
              Custom Report
            </button>
          </div>
        </div>
      </div>

      {/* AI Alert - Month End */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-700">
            <span className="font-medium">Month-end in 3 days.</span> WIP report due for bank covenant review.
            <button className="ml-2 underline text-blue-800 hover:text-blue-900">Generate now</button>
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveCategory('standard')}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              activeCategory === 'standard'
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            Standard Reports
          </button>
          <button
            onClick={() => setActiveCategory('scheduled')}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
              activeCategory === 'scheduled'
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Calendar className="h-4 w-4" />
            Scheduled ({scheduledReports.length})
          </button>
          <button
            onClick={() => setActiveCategory('recent')}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
              activeCategory === 'recent'
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <History className="h-4 w-4" />
            Recent ({recentReports.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeCategory === 'standard' && (
          <div className="grid grid-cols-2 gap-4">
            {standardReports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}

        {activeCategory === 'scheduled' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 text-sm">Scheduled Reports</h4>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  + Add Schedule
                </button>
              </div>
            </div>
            <div className="p-2">
              {scheduledReports.map(report => (
                <ScheduledReportRow key={report.id} report={report} />
              ))}
            </div>
          </div>
        )}

        {activeCategory === 'recent' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 text-sm">Recently Generated Reports</h4>
                <span className="text-xs text-gray-400">Last 7 days</span>
              </div>
            </div>
            <div className="p-2">
              {recentReports.map(report => (
                <RecentReportRow key={report.id} report={report} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Report Generator */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <h4 className="font-medium text-gray-900 text-sm mb-3">Quick Generate</h4>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Select a report...</option>
              {standardReports.map(report => (
                <option key={report.id} value={report.id}>{report.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
              <option>YTD</option>
              <option>Custom Range</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Jobs</option>
              <option>Active Jobs Only</option>
              <option>Select Jobs...</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="h-4 w-4" />
              PDF
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Report Recommendations:</span>
          </div>
          <p className="text-sm text-amber-700">
            Based on your activity, consider running the Job Cost Detail report for Smith Residence -
            margin has dropped 4% since last report. The WIP report shows potential overbilling on 2 jobs
            that should be reviewed before month-end. Your scheduled reports have been delivered on time -
            94% open rate by recipients.
          </p>
        </div>
      </div>
    </div>
  )
}
