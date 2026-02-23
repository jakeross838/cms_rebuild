'use client'

import { useState } from 'react'

import {
  TrendingUp,
  DollarSign,
  Building,
  Calendar,
  User,
  Award,
  Target,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Filter,
  Download,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  Calculator,
  Briefcase,
  Users,
  Percent,
  Gift,
  Trophy,
  Star,
  Eye,
  FileText,
} from 'lucide-react'

import { cn } from '@/lib/utils'

// Types
interface JobRevenue {
  id: string
  jobName: string
  clientName: string
  contractValue: number
  costsToDate: number
  revenueRecognized: number
  percentComplete: number
  profit: number
  profitMargin: number
  status: 'active' | 'complete' | 'pending'
  projectManager: string
  startDate: Date
  endDate?: Date
}

interface EmployeeBonus {
  id: string
  employeeName: string
  role: string
  avatar?: string
  baseBonus: number
  performanceMultiplier: number
  revenueShare: number
  totalBonus: number
  status: 'pending' | 'approved' | 'paid'
  period: string
  jobs: { name: string; contribution: number }[]
}

interface BonusFormula {
  id: string
  name: string
  type: 'percentage' | 'fixed' | 'tiered'
  appliesTo: 'project_managers' | 'superintendents' | 'estimators' | 'all'
  basePercentage?: number
  tiers?: { min: number; max: number; rate: number }[]
  conditions: string[]
  active: boolean
}

// Mock data
const mockJobRevenue: JobRevenue[] = [
  {
    id: 'job-1',
    jobName: 'Johnson Kitchen Remodel',
    clientName: 'John & Sarah Johnson',
    contractValue: 125000,
    costsToDate: 62500,
    revenueRecognized: 75000,
    percentComplete: 60,
    profit: 12500,
    profitMargin: 16.7,
    status: 'active',
    projectManager: 'Sarah Chen',
    startDate: new Date('2026-01-15'),
    endDate: new Date('2026-04-30'),
  },
  {
    id: 'job-2',
    jobName: 'Smith Residence',
    clientName: 'Robert Smith',
    contractValue: 450000,
    costsToDate: 180000,
    revenueRecognized: 225000,
    percentComplete: 50,
    profit: 45000,
    profitMargin: 20.0,
    status: 'active',
    projectManager: 'Mike Torres',
    startDate: new Date('2025-11-01'),
    endDate: new Date('2026-06-30'),
  },
  {
    id: 'job-3',
    jobName: 'Downtown Office Renovation',
    clientName: 'TechCorp Inc.',
    contractValue: 275000,
    costsToDate: 261250,
    revenueRecognized: 275000,
    percentComplete: 100,
    profit: 13750,
    profitMargin: 5.0,
    status: 'complete',
    projectManager: 'Sarah Chen',
    startDate: new Date('2025-08-01'),
    endDate: new Date('2025-12-15'),
  },
]

const mockEmployeeBonuses: EmployeeBonus[] = [
  {
    id: 'emp-1',
    employeeName: 'Sarah Chen',
    role: 'Senior Project Manager',
    baseBonus: 2500,
    performanceMultiplier: 1.15,
    revenueShare: 3750,
    totalBonus: 6625,
    status: 'approved',
    period: 'Q4 2025',
    jobs: [
      { name: 'Johnson Kitchen Remodel', contribution: 2250 },
      { name: 'Downtown Office Renovation', contribution: 1500 },
    ],
  },
  {
    id: 'emp-2',
    employeeName: 'Mike Torres',
    role: 'Project Manager',
    baseBonus: 2000,
    performanceMultiplier: 1.20,
    revenueShare: 4500,
    totalBonus: 6900,
    status: 'pending',
    period: 'Q4 2025',
    jobs: [
      { name: 'Smith Residence', contribution: 4500 },
    ],
  },
  {
    id: 'emp-3',
    employeeName: 'David Park',
    role: 'Superintendent',
    baseBonus: 1500,
    performanceMultiplier: 1.10,
    revenueShare: 2250,
    totalBonus: 3900,
    status: 'paid',
    period: 'Q4 2025',
    jobs: [
      { name: 'Smith Residence', contribution: 1250 },
      { name: 'Johnson Kitchen Remodel', contribution: 1000 },
    ],
  },
]

const mockFormulas: BonusFormula[] = [
  {
    id: 'formula-1',
    name: 'PM Revenue Share',
    type: 'tiered',
    appliesTo: 'project_managers',
    tiers: [
      { min: 0, max: 100000, rate: 2 },
      { min: 100001, max: 500000, rate: 3 },
      { min: 500001, max: Infinity, rate: 4 },
    ],
    conditions: ['Job completed on time', 'Profit margin > 10%'],
    active: true,
  },
  {
    id: 'formula-2',
    name: 'Superintendent Bonus',
    type: 'percentage',
    appliesTo: 'superintendents',
    basePercentage: 1.5,
    conditions: ['Zero safety incidents', 'Client satisfaction > 4.5'],
    active: true,
  },
]

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function JobRevenueCard({ job }: { job: JobRevenue }) {
  const isOverBudget = job.costsToDate / job.contractValue > job.percentComplete / 100

  return (
    <div className="bg-warm-0 border border-warm-200 rounded-lg p-4 hover:border-warm-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-warm-800">{job.jobName}</h3>
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded',
              job.status === 'active' ? 'bg-green-100 text-green-700' :
              job.status === 'complete' ? 'bg-blue-100 text-blue-700' :
              'bg-warm-100 text-warm-600'
            )}>
              {job.status}
            </span>
          </div>
          <p className="text-sm text-warm-500">{job.clientName}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-warm-800">{formatCurrency(job.contractValue)}</p>
          <p className="text-xs text-warm-500">Contract Value</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-warm-600">{job.percentComplete}% Complete</span>
          <span className="text-warm-500">{formatCurrency(job.revenueRecognized)} recognized</span>
        </div>
        <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-stone-600 rounded-full"
            style={{ width: `${job.percentComplete}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-warm-100">
        <div>
          <p className="text-xs text-warm-500">Costs to Date</p>
          <p className={cn('text-sm font-medium', isOverBudget ? 'text-red-600' : 'text-warm-700')}>
            {formatCurrency(job.costsToDate)}
          </p>
        </div>
        <div>
          <p className="text-xs text-warm-500">Profit</p>
          <p className={cn('text-sm font-medium', job.profit > 0 ? 'text-green-600' : 'text-red-600')}>
            {formatCurrency(job.profit)}
          </p>
        </div>
        <div>
          <p className="text-xs text-warm-500">Margin</p>
          <p className={cn(
            'text-sm font-medium flex items-center gap-1',
            job.profitMargin >= 15 ? 'text-green-600' :
            job.profitMargin >= 10 ? 'text-amber-600' : 'text-red-600'
          )}>
            {job.profitMargin > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {job.profitMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-warm-100 text-xs text-warm-500">
        <span className="flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          {job.projectManager}
        </span>
        <ChevronRight className="h-4 w-4 text-warm-400" />
      </div>
    </div>
  )
}

function BonusCard({ bonus }: { bonus: EmployeeBonus }) {
  const [expanded, setExpanded] = useState(false)
  const StatusIcon = bonus.status === 'paid' ? CheckCircle : bonus.status === 'approved' ? Clock : AlertCircle
  const statusColor = bonus.status === 'paid' ? 'text-green-600 bg-green-100' :
                      bonus.status === 'approved' ? 'text-blue-600 bg-blue-100' :
                      'text-amber-600 bg-amber-100'

  return (
    <div className="bg-warm-0 border border-warm-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
          <User className="h-5 w-5 text-stone-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-warm-800">{bonus.employeeName}</h3>
              <p className="text-sm text-warm-500">{bonus.role}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-green-600">{formatCurrency(bonus.totalBonus)}</p>
              <span className={cn('text-xs px-1.5 py-0.5 rounded flex items-center gap-1 justify-end', statusColor)}>
                <StatusIcon className="h-3 w-3" />
                {bonus.status}
              </span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="mt-3 pt-3 border-t border-warm-100">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-warm-500 hover:text-warm-700"
            >
              <ChevronRight className={cn('h-3 w-3 transition-transform', expanded && 'rotate-90')} />
              View breakdown
            </button>

            {expanded ? <div className="mt-2 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-warm-600">Base Bonus</span>
                  <span className="text-warm-700">{formatCurrency(bonus.baseBonus)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-warm-600">Performance Multiplier</span>
                  <span className="text-warm-700">&times; {bonus.performanceMultiplier.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-warm-600">Revenue Share</span>
                  <span className="text-warm-700">+ {formatCurrency(bonus.revenueShare)}</span>
                </div>
                <div className="pt-2 border-t border-warm-100">
                  <p className="text-xs text-warm-500 mb-1">Job Contributions:</p>
                  {bonus.jobs.map((job, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-warm-600">{job.name}</span>
                      <span className="text-warm-700">{formatCurrency(job.contribution)}</span>
                    </div>
                  ))}
                </div>
              </div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function FormulaCard({ formula }: { formula: BonusFormula }) {
  return (
    <div className={cn(
      'bg-warm-0 border rounded-lg p-4',
      formula.active ? 'border-warm-200' : 'border-warm-200 opacity-60'
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-stone-600" />
          <h3 className="font-medium text-warm-800">{formula.name}</h3>
        </div>
        <span className={cn(
          'text-xs px-1.5 py-0.5 rounded',
          formula.active ? 'bg-green-100 text-green-700' : 'bg-warm-100 text-warm-500'
        )}>
          {formula.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded capitalize">
          {formula.type}
        </span>
        <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded capitalize">
          {formula.appliesTo.replace('_', ' ')}
        </span>
      </div>

      {formula.type === 'tiered' && formula.tiers ? <div className="space-y-1 mb-3">
          {formula.tiers.map((tier, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-warm-600">
                {formatCurrency(tier.min)} - {tier.max === Infinity ? '∞' : formatCurrency(tier.max)}
              </span>
              <span className="text-warm-700 font-medium">{tier.rate}%</span>
            </div>
          ))}
        </div> : null}

      {formula.type === 'percentage' && formula.basePercentage ? <p className="text-sm text-warm-700 mb-3">
          <span className="font-semibold">{formula.basePercentage}%</span> of project profit
        </p> : null}

      <div className="pt-2 border-t border-warm-100">
        <p className="text-xs text-warm-500 mb-1">Conditions:</p>
        <ul className="space-y-0.5">
          {formula.conditions.map((condition, idx) => (
            <li key={idx} className="text-xs text-warm-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              {condition}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function RevenuePreview() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'bonuses' | 'formulas'>('jobs')
  const [periodFilter, setPeriodFilter] = useState('q4-2025')

  const totalRevenue = mockJobRevenue.reduce((sum, job) => sum + job.revenueRecognized, 0)
  const totalProfit = mockJobRevenue.reduce((sum, job) => sum + job.profit, 0)
  const avgMargin = mockJobRevenue.reduce((sum, job) => sum + job.profitMargin, 0) / mockJobRevenue.length
  const totalBonuses = mockEmployeeBonuses.reduce((sum, bonus) => sum + bonus.totalBonus, 0)

  return (
    <div className="min-h-screen bg-warm-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 font-display flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-stone-600" />
              Revenue & Bonuses
            </h1>
            <p className="text-warm-600 mt-1">Track project revenue, profit margins, and employee bonuses</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-3 py-2 border border-warm-200 rounded-lg text-sm bg-warm-0 focus:outline-none focus:ring-2 focus:ring-stone-300"
            >
              <option value="q4-2025">Q4 2025</option>
              <option value="q1-2026">Q1 2026</option>
              <option value="ytd">Year to Date</option>
            </select>
            <button className="flex items-center gap-2 px-3 py-2 bg-warm-0 border border-warm-200 rounded-lg text-sm text-warm-700 hover:bg-warm-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-warm-0 border border-warm-200 rounded-lg text-sm text-warm-700 hover:bg-warm-50">
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-warm-0 border border-warm-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-warm-500">Total Revenue</span>
              <DollarSign className="h-4 w-4 text-stone-500" />
            </div>
            <p className="text-2xl font-semibold text-warm-800">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              18% vs last quarter
            </p>
          </div>
          <div className="bg-warm-0 border border-warm-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-warm-500">Total Profit</span>
              <BarChart3 className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-semibold text-green-600">{formatCurrency(totalProfit)}</p>
            <p className="text-xs text-warm-500 mt-1">From {mockJobRevenue.length} jobs</p>
          </div>
          <div className="bg-warm-0 border border-warm-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-warm-500">Avg Profit Margin</span>
              <Percent className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-semibold text-blue-600">{avgMargin.toFixed(1)}%</p>
            <p className="text-xs text-warm-500 mt-1">Target: 15%</p>
          </div>
          <div className="bg-warm-0 border border-warm-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-warm-500">Bonuses Pending</span>
              <Gift className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-semibold text-amber-600">{formatCurrency(totalBonuses)}</p>
            <p className="text-xs text-warm-500 mt-1">{mockEmployeeBonuses.length} employees</p>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-800 mb-1">Revenue Intelligence</h3>
              <ul className="space-y-1 text-sm text-green-700">
                <li>• Smith Residence trending to finish $12K under budget - bonus potential for team</li>
                <li>• Q1 2026 pipeline shows $1.2M in signed contracts, 40% above target</li>
                <li>• Recommend adjusting PM bonus tiers based on historical performance data</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-warm-100 rounded-lg p-1 mb-6 w-fit">
          {[
            { key: 'jobs', label: 'Job Revenue', icon: Building },
            { key: 'bonuses', label: 'Employee Bonuses', icon: Trophy },
            { key: 'formulas', label: 'Bonus Formulas', icon: Calculator },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === tab.key
                  ? 'bg-warm-0 text-warm-800 shadow-sm'
                  : 'text-warm-600 hover:text-warm-800'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'jobs' && (
          <div className="grid grid-cols-2 gap-4">
            {mockJobRevenue.map((job) => (
              <JobRevenueCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {activeTab === 'bonuses' && (
          <div className="space-y-4">
            {/* Leaderboard */}
            <div className="bg-warm-0 border border-warm-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-warm-800 mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Top Performers This Quarter
              </h3>
              <div className="flex items-center gap-4">
                {mockEmployeeBonuses.slice(0, 3).map((bonus, idx) => (
                  <div key={bonus.id} className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-stone-500" />
                      </div>
                      <span className={cn(
                        'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                        idx === 0 ? 'bg-amber-400 text-amber-900' :
                        idx === 1 ? 'bg-gray-300 text-gray-700' :
                        'bg-orange-300 text-orange-800'
                      )}>
                        {idx + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-warm-800">{bonus.employeeName}</p>
                      <p className="text-sm text-green-600">{formatCurrency(bonus.totalBonus)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bonus Cards */}
            <div className="grid grid-cols-2 gap-4">
              {mockEmployeeBonuses.map((bonus) => (
                <BonusCard key={bonus.id} bonus={bonus} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'formulas' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-warm-600">Configure how bonuses are calculated for different roles</p>
              <button className="flex items-center gap-2 px-3 py-2 bg-stone-700 text-white rounded-lg text-sm hover:bg-stone-800">
                <Calculator className="h-4 w-4" />
                New Formula
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {mockFormulas.map((formula) => (
                <FormulaCard key={formula.id} formula={formula} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
