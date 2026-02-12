'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Download,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Sparkles,
  AlertCircle,
  Calendar,
  TrendingUp,
  Percent,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Draw {
  id: string
  drawNumber: number
  milestone: string
  amount: number
  percentOfContract: number
  status: 'Scheduled' | 'Submitted' | 'Approved' | 'Paid'
  date: string
  description?: string
  aiNote?: string
}

const mockDraws: Draw[] = [
  {
    id: '1',
    drawNumber: 1,
    milestone: 'Contract Signing',
    amount: 245000,
    percentOfContract: 10,
    status: 'Paid',
    date: 'Oct 15, 2024',
    description: 'Initial deposit upon contract execution',
  },
  {
    id: '2',
    drawNumber: 2,
    milestone: 'Foundation Complete',
    amount: 367500,
    percentOfContract: 15,
    status: 'Paid',
    date: 'Nov 8, 2024',
    description: 'Pilings, grade beams, and slab complete',
  },
  {
    id: '3',
    drawNumber: 3,
    milestone: 'Framing Complete',
    amount: 490000,
    percentOfContract: 20,
    status: 'Approved',
    date: 'Dec 12, 2024',
    description: 'Structural framing and roof sheathing',
    aiNote: 'Approved 2 days faster than average',
  },
  {
    id: '4',
    drawNumber: 4,
    milestone: 'Dried In',
    amount: 367500,
    percentOfContract: 15,
    status: 'Submitted',
    date: 'Jan 5, 2025',
    description: 'Windows, doors, and roofing installed',
    aiNote: 'Pending bank inspection - typically 3-5 days',
  },
  {
    id: '5',
    drawNumber: 5,
    milestone: 'MEP Rough Complete',
    amount: 367500,
    percentOfContract: 15,
    status: 'Scheduled',
    date: 'Feb 1, 2025',
    description: 'Electrical, plumbing, and HVAC rough-in',
  },
  {
    id: '6',
    drawNumber: 6,
    milestone: 'Drywall Complete',
    amount: 245000,
    percentOfContract: 10,
    status: 'Scheduled',
    date: 'Mar 1, 2025',
    description: 'Drywall hung, taped, and finished',
  },
  {
    id: '7',
    drawNumber: 7,
    milestone: 'Final Completion',
    amount: 367500,
    percentOfContract: 15,
    status: 'Scheduled',
    date: 'Apr 15, 2025',
    description: 'Certificate of occupancy and final walkthrough',
  },
]

const statusConfig = {
  Scheduled: {
    color: 'bg-gray-100 text-gray-700',
    icon: Calendar,
  },
  Submitted: {
    color: 'bg-blue-100 text-blue-700',
    icon: Send,
  },
  Approved: {
    color: 'bg-amber-100 text-amber-700',
    icon: CheckCircle2,
  },
  Paid: {
    color: 'bg-green-100 text-green-700',
    icon: DollarSign,
  },
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
  return '$' + value.toFixed(0)
}

function DrawRow({ draw, expanded, onToggle }: { draw: Draw; expanded: boolean; onToggle: () => void }) {
  const StatusIcon = statusConfig[draw.status].icon

  return (
    <>
      <tr
        className={cn(
          "hover:bg-gray-50 cursor-pointer",
          expanded && "bg-blue-50"
        )}
        onClick={onToggle}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            <span className="font-mono text-gray-500">#{draw.drawNumber}</span>
            <span className="font-medium text-gray-900">{draw.milestone}</span>
            {draw.aiNote && (
              <Sparkles className="h-4 w-4 text-amber-500" />
            )}
          </div>
        </td>
        <td className="py-3 px-3 text-right font-medium text-gray-900">{formatCurrency(draw.amount)}</td>
        <td className="py-3 px-3 text-center text-gray-600">{draw.percentOfContract}%</td>
        <td className="py-3 px-3">
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium",
            statusConfig[draw.status].color
          )}>
            <StatusIcon className="h-3.5 w-3.5" />
            {draw.status}
          </div>
        </td>
        <td className="py-3 px-3 text-gray-600">{draw.date}</td>
      </tr>
      {expanded && (
        <tr className="bg-blue-50">
          <td colSpan={5} className="py-3 px-12">
            <div className="space-y-2">
              {draw.description && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Description:</span> {draw.description}
                </div>
              )}
              {draw.aiNote && (
                <div className="flex items-start gap-2 text-sm text-amber-700">
                  <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
                  <span>{draw.aiNote}</span>
                </div>
              )}
              {draw.status === 'Scheduled' && (
                <div className="flex gap-2 mt-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Send className="h-4 w-4" />
                    Submit Draw Request
                  </button>
                </div>
              )}
              {draw.status === 'Approved' && (
                <div className="flex gap-2 mt-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <DollarSign className="h-4 w-4" />
                    Record Payment
                  </button>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function ProgressBar({ draws }: { draws: Draw[] }) {
  const totalAmount = draws.reduce((sum, d) => sum + d.amount, 0)

  const segments = draws.map(draw => ({
    ...draw,
    widthPercent: (draw.amount / totalAmount) * 100,
  }))

  return (
    <div className="space-y-2">
      <div className="flex h-4 rounded-full overflow-hidden bg-gray-200">
        {segments.map((segment) => (
          <div
            key={segment.id}
            className={cn(
              "h-full transition-all",
              segment.status === 'Paid' && "bg-green-500",
              segment.status === 'Approved' && "bg-amber-500",
              segment.status === 'Submitted' && "bg-blue-500",
              segment.status === 'Scheduled' && "bg-gray-300"
            )}
            style={{ width: `${segment.widthPercent}%` }}
            title={`Draw ${segment.drawNumber}: ${segment.milestone} - ${segment.status}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Contract Start</span>
        <span>Final Completion</span>
      </div>
    </div>
  )
}

export function JobDrawsPreview() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['4']))

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const contractAmount = 2450000
  const paidDraws = mockDraws.filter(d => d.status === 'Paid')
  const approvedDraws = mockDraws.filter(d => d.status === 'Approved')
  const completedDraws = [...paidDraws, ...approvedDraws]

  const amountBilled = mockDraws
    .filter(d => d.status === 'Paid' || d.status === 'Approved' || d.status === 'Submitted')
    .reduce((sum, d) => sum + d.amount, 0)

  const amountPaid = paidDraws.reduce((sum, d) => sum + d.amount, 0)
  const amountRemaining = contractAmount - amountPaid
  const percentComplete = (amountPaid / contractAmount) * 100

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Draw Schedule - Smith Residence</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">In Progress</span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Contract: {formatCurrency(contractAmount)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                7 Draws
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add Draw
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Draws Completed
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">
              {paidDraws.length} of {mockDraws.length}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <TrendingUp className="h-4 w-4" />
              Amount Billed
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(amountBilled)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <DollarSign className="h-4 w-4" />
              Amount Remaining
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(amountRemaining)}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Percent className="h-4 w-4" />
              Billing Progress
            </div>
            <div className="text-xl font-bold text-green-700 mt-1">{percentComplete.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span>Paid</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-amber-500 rounded" />
              <span>Approved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span>Submitted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-gray-300 rounded" />
              <span>Scheduled</span>
            </div>
          </div>
        </div>
        <ProgressBar draws={mockDraws} />
      </div>

      {/* Draw Schedule Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Draw / Milestone</th>
              <th className="text-right py-3 px-3 font-medium text-gray-600">Amount</th>
              <th className="text-center py-3 px-3 font-medium text-gray-600">% of Contract</th>
              <th className="text-left py-3 px-3 font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-3 font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {mockDraws.map(draw => (
              <DrawRow
                key={draw.id}
                draw={draw}
                expanded={expandedRows.has(draw.id)}
                onToggle={() => toggleRow(draw.id)}
              />
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2 border-gray-300">
            <tr className="font-semibold">
              <td className="py-3 px-4 text-gray-900">TOTAL</td>
              <td className="py-3 px-3 text-right text-gray-900">{formatCurrency(contractAmount)}</td>
              <td className="py-3 px-3 text-center text-gray-900">100%</td>
              <td colSpan={2} className="py-3 px-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insight:</span>
          </div>
          <p className="text-sm text-amber-700">
            Draw 4 is pending bank inspection. Based on 23 similar projects, submit Draw 5 documentation
            5 days before milestone completion to reduce approval time by 40%. Current pace suggests
            all draws will complete on schedule.
          </p>
        </div>
      </div>
    </div>
  )
}
