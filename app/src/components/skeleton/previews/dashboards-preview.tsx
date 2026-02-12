'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  Plus,
  Star,
  MoreHorizontal,
  Sparkles,
  GripVertical,
  BarChart3,
  LineChart,
  PieChart,
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  Building2,
  Settings,
  Share2,
  Copy,
  Trash2,
  Eye,
  Edit,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Dashboard {
  id: string
  name: string
  description: string
  owner: string
  visibility: 'personal' | 'team' | 'company'
  isDefault: boolean
  lastViewed: string
  widgets: number
  role?: string
}

interface DashboardTemplate {
  id: string
  name: string
  description: string
  widgets: string[]
}

const mockDashboards: Dashboard[] = [
  {
    id: '1',
    name: 'Executive Overview',
    description: 'Revenue, margins, cash position, active jobs',
    owner: 'Jake',
    visibility: 'personal',
    isDefault: true,
    lastViewed: 'Today 8:00 AM',
    widgets: 8,
    role: 'Owner',
  },
  {
    id: '2',
    name: 'Operations Daily',
    description: "Today's schedule, crew assignments, deliveries",
    owner: 'Jake',
    visibility: 'personal',
    isDefault: false,
    lastViewed: 'Yesterday',
    widgets: 6,
    role: 'Operations',
  },
  {
    id: '3',
    name: 'Financial Dashboard',
    description: 'AR/AP aging, cash flow, profitability by job',
    owner: 'Jake',
    visibility: 'company',
    isDefault: false,
    lastViewed: '2 days ago',
    widgets: 10,
  },
  {
    id: '4',
    name: 'Sales Pipeline',
    description: 'Leads, estimates, proposals, conversion rates',
    owner: 'Jake',
    visibility: 'company',
    isDefault: false,
    lastViewed: '3 days ago',
    widgets: 7,
  },
  {
    id: '5',
    name: 'Project Status Board',
    description: 'All active jobs with progress and health',
    owner: 'Mike',
    visibility: 'company',
    isDefault: false,
    lastViewed: 'Today 9:30 AM',
    widgets: 5,
  },
]

const dashboardTemplates: DashboardTemplate[] = [
  {
    id: '1',
    name: 'Owner/Builder',
    description: 'High-level business metrics',
    widgets: ['Revenue', 'Profit Margin', 'Cash Flow', 'Active Jobs'],
  },
  {
    id: '2',
    name: 'Project Manager',
    description: 'Job tracking and tasks',
    widgets: ['My Jobs', 'Tasks Due', 'Schedule', 'Budget Health'],
  },
  {
    id: '3',
    name: 'Superintendent',
    description: 'Field operations view',
    widgets: ['Daily Schedule', 'Inspections', 'Deliveries', 'Crew'],
  },
  {
    id: '4',
    name: 'Sales',
    description: 'Lead and estimate tracking',
    widgets: ['Leads', 'Estimates', 'Pipeline Value', 'Win Rate'],
  },
  {
    id: '5',
    name: 'Accounting',
    description: 'Financial operations',
    widgets: ['AR Aging', 'AP Aging', 'Draws', 'Invoices'],
  },
  {
    id: '6',
    name: 'Field Team',
    description: 'Daily work focus',
    widgets: ['Today Tasks', 'Site Photos', 'Daily Log', 'Safety'],
  },
]

interface WidgetPreview {
  id: string
  name: string
  type: 'kpi' | 'chart' | 'list' | 'table'
  icon: React.ElementType
}

const availableWidgets: WidgetPreview[] = [
  { id: '1', name: 'Revenue KPI', type: 'kpi', icon: DollarSign },
  { id: '2', name: 'Active Jobs', type: 'kpi', icon: Building2 },
  { id: '3', name: 'Profit Margin', type: 'kpi', icon: TrendingUp },
  { id: '4', name: 'Tasks Due', type: 'kpi', icon: Clock },
  { id: '5', name: 'Revenue Trend', type: 'chart', icon: LineChart },
  { id: '6', name: 'Job Breakdown', type: 'chart', icon: PieChart },
  { id: '7', name: 'Cash Flow', type: 'chart', icon: BarChart3 },
  { id: '8', name: 'Team Activity', type: 'list', icon: Users },
]

function DashboardCard({ dashboard, isSelected, onClick }: { dashboard: Dashboard; isSelected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg border p-4 cursor-pointer transition-all",
        isSelected ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-blue-600" />
          <h4 className="font-medium text-gray-900">{dashboard.name}</h4>
          {dashboard.isDefault && (
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          )}
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-3">{dashboard.description}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-0.5 rounded-full font-medium",
            dashboard.visibility === 'personal' ? "bg-blue-100 text-blue-700" :
            dashboard.visibility === 'team' ? "bg-green-100 text-green-700" :
            "bg-purple-100 text-purple-700"
          )}>
            {dashboard.visibility}
          </span>
          <span>{dashboard.widgets} widgets</span>
        </div>
        <span>Last viewed: {dashboard.lastViewed}</span>
      </div>
      {dashboard.role && (
        <div className="mt-2 text-xs text-gray-400">Role: {dashboard.role}</div>
      )}
    </div>
  )
}

function TemplateCard({ template }: { template: DashboardTemplate }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
      <div className="flex items-center gap-2 mb-1">
        <LayoutDashboard className="h-4 w-4 text-gray-400" />
        <h5 className="font-medium text-gray-900 text-sm">{template.name}</h5>
      </div>
      <p className="text-xs text-gray-500 mb-2">{template.description}</p>
      <div className="flex flex-wrap gap-1">
        {template.widgets.slice(0, 3).map((widget, i) => (
          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
            {widget}
          </span>
        ))}
        {template.widgets.length > 3 && (
          <span className="text-xs text-gray-400">+{template.widgets.length - 3}</span>
        )}
      </div>
    </div>
  )
}

function WidgetLibrary() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-medium text-gray-900 mb-3">Widget Library</h4>
      <div className="grid grid-cols-4 gap-2">
        {availableWidgets.map(widget => {
          const Icon = widget.icon
          return (
            <div
              key={widget.id}
              className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent cursor-move transition-colors"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Icon className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-xs text-gray-600 text-center">{widget.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DashboardEditor({ dashboard }: { dashboard: Dashboard }) {
  return (
    <div className="space-y-4">
      {/* Editor Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="font-semibold text-gray-900">{dashboard.name}</h4>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            dashboard.visibility === 'personal' ? "bg-blue-100 text-blue-700" :
            dashboard.visibility === 'team' ? "bg-green-100 text-green-700" :
            "bg-purple-100 text-purple-700"
          )}>
            {dashboard.visibility}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Widget Grid Preview */}
      <div className="bg-gray-100 rounded-lg p-4 min-h-[300px]">
        <div className="grid grid-cols-4 gap-3">
          {/* KPI Widgets Row */}
          {[
            { label: 'Revenue MTD', value: '$892K', change: '+8.5%', color: 'green' },
            { label: 'Active Jobs', value: '12', change: '+2', color: 'blue' },
            { label: 'Profit Margin', value: '14.2%', change: '-0.8%', color: 'amber' },
            { label: 'Tasks Due Today', value: '8', change: '3 high', color: 'red' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-lg p-3 shadow-sm relative group">
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-xs text-gray-500 mb-1">{kpi.label}</div>
              <div className="text-xl font-bold text-gray-900">{kpi.value}</div>
              <div className={cn(
                "text-xs font-medium",
                kpi.color === 'green' ? "text-green-600" :
                kpi.color === 'blue' ? "text-blue-600" :
                kpi.color === 'amber' ? "text-amber-600" :
                "text-red-600"
              )}>
                {kpi.change}
              </div>
            </div>
          ))}

          {/* Chart Widgets */}
          <div className="col-span-2 bg-white rounded-lg p-3 shadow-sm relative group">
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Revenue Trend</span>
              <LineChart className="h-4 w-4 text-gray-400" />
            </div>
            <div className="h-24 bg-gray-50 rounded flex items-end justify-center gap-1 p-2">
              {[40, 55, 45, 60, 50, 70, 65, 80, 75, 85, 90, 95].map((h, i) => (
                <div
                  key={i}
                  className="w-3 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <div className="col-span-2 bg-white rounded-lg p-3 shadow-sm relative group">
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Job Status</span>
              <PieChart className="h-4 w-4 text-gray-400" />
            </div>
            <div className="h-24 flex items-center justify-center">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="50 100" strokeDashoffset="25" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="30 100" strokeDashoffset="75" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="20 100" strokeDashoffset="5" />
                </svg>
              </div>
              <div className="ml-4 space-y-1 text-xs">
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full" />Active (5)</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full" />Pre-Con (3)</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full" />Closeout (2)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Drop Zone Hint */}
        <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-400 text-sm">
          Drag widgets here to add to dashboard
        </div>
      </div>

      {/* Widget Library */}
      <WidgetLibrary />
    </div>
  )
}

export function DashboardsPreview() {
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(mockDashboards[0])
  const [view, setView] = useState<'list' | 'edit'>('list')

  const myDashboards = mockDashboards.filter(d => d.visibility === 'personal')
  const companyDashboards = mockDashboards.filter(d => d.visibility === 'company')

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Custom Dashboards</h3>
            <p className="text-sm text-gray-500">Create personalized views of your business data</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('list')}
                className={cn(
                  "px-3 py-1.5 text-sm",
                  view === 'list' ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                Browse
              </button>
              <button
                onClick={() => setView('edit')}
                className={cn(
                  "px-3 py-1.5 text-sm",
                  view === 'edit' ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                Editor
              </button>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Create Dashboard
            </button>
          </div>
        </div>
      </div>

      {view === 'list' ? (
        <div className="p-4 space-y-6">
          {/* My Dashboards */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              MY DASHBOARDS
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {myDashboards.map(dashboard => (
                <DashboardCard
                  key={dashboard.id}
                  dashboard={dashboard}
                  isSelected={selectedDashboard?.id === dashboard.id}
                  onClick={() => setSelectedDashboard(dashboard)}
                />
              ))}
            </div>
          </div>

          {/* Company Dashboards */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-500" />
              COMPANY DASHBOARDS
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {companyDashboards.map(dashboard => (
                <DashboardCard
                  key={dashboard.id}
                  dashboard={dashboard}
                  isSelected={selectedDashboard?.id === dashboard.id}
                  onClick={() => setSelectedDashboard(dashboard)}
                />
              ))}
            </div>
          </div>

          {/* Templates */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-blue-500" />
              TEMPLATES
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {dashboardTemplates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>

          {/* Selected Dashboard Actions */}
          {selectedDashboard && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedDashboard.name}</h4>
                  <p className="text-sm text-gray-500">{selectedDashboard.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Eye className="h-4 w-4" />
                    Open
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Copy className="h-4 w-4" />
                    Duplicate
                  </button>
                  {!selectedDashboard.isDefault && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-600 border border-gray-200 rounded-lg hover:bg-amber-50">
                      <Star className="h-4 w-4" />
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          {selectedDashboard && <DashboardEditor dashboard={selectedDashboard} />}
        </div>
      )}

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Dashboard Intelligence:</span>
          </div>
          <p className="text-sm text-amber-700">
            Based on your role as Owner/Builder, consider adding a Cash Flow Forecast widget.
            Your Executive Overview dashboard is missing AR Aging which shows 3 overdue invoices.
            Team members have viewed the Project Status Board 12 times this week - consider adding it to company defaults.
          </p>
        </div>
      </div>
    </div>
  )
}
