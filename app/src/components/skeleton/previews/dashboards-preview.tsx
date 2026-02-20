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
  Eye,
  Edit,
  Trash2,
  Download,
  Mail,
  Shield,
  Gauge,
  CloudRain,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Calendar,
  Wallet,
  Bell,
  RefreshCw,
  Lock,
  Smartphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  autoRefresh?: number
  sharedWith?: string[]
  embedInPortal?: boolean
  createdAt: string
}

interface DashboardTemplate {
  id: string
  name: string
  description: string
  widgets: string[]
  role: string
  icon: React.ElementType
}

interface WidgetPreview {
  id: string
  name: string
  type: 'kpi' | 'chart' | 'list' | 'table' | 'gauge' | 'feed'
  icon: React.ElementType
  category: string
  size: '1x1' | '2x1' | '2x2'
  requiredPermission?: string
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockDashboards: Dashboard[] = [
  {
    id: '1',
    name: 'Executive Overview',
    description: 'Revenue, margins, cash position, active jobs, AI insights',
    owner: 'Jake Ross',
    visibility: 'personal',
    isDefault: true,
    lastViewed: 'Today 8:00 AM',
    widgets: 8,
    role: 'Owner',
    autoRefresh: 300,
    createdAt: 'Jan 15, 2026',
  },
  {
    id: '2',
    name: 'Operations Daily',
    description: "Today's schedule, crew assignments, deliveries, inspections",
    owner: 'Jake Ross',
    visibility: 'personal',
    isDefault: false,
    lastViewed: 'Yesterday',
    widgets: 6,
    role: 'Operations',
    autoRefresh: 60,
    createdAt: 'Jan 20, 2026',
  },
  {
    id: '3',
    name: 'Financial Dashboard',
    description: 'AR/AP aging, cash flow, profitability by job, draw status',
    owner: 'Jake Ross',
    visibility: 'company',
    isDefault: false,
    lastViewed: '2 days ago',
    widgets: 10,
    sharedWith: ['Sarah Chen', 'Lisa Martinez'],
    createdAt: 'Jan 18, 2026',
  },
  {
    id: '4',
    name: 'Sales Pipeline',
    description: 'Leads, estimates, proposals, conversion rates, win probability',
    owner: 'Jake Ross',
    visibility: 'company',
    isDefault: false,
    lastViewed: '3 days ago',
    widgets: 7,
    createdAt: 'Feb 1, 2026',
  },
  {
    id: '5',
    name: 'Project Status Board',
    description: 'All active jobs with progress, health, and risk scores',
    owner: 'Mike Thompson',
    visibility: 'company',
    isDefault: false,
    lastViewed: 'Today 9:30 AM',
    widgets: 5,
    embedInPortal: false,
    createdAt: 'Feb 5, 2026',
  },
  {
    id: '6',
    name: 'Client Portal View',
    description: 'Project progress, photos, milestones for client embedding',
    owner: 'Jake Ross',
    visibility: 'company',
    isDefault: false,
    lastViewed: '1 week ago',
    widgets: 4,
    embedInPortal: true,
    createdAt: 'Feb 8, 2026',
  },
]

const dashboardTemplates: DashboardTemplate[] = [
  {
    id: '1',
    name: 'Owner/Builder',
    description: 'High-level business metrics and cash position',
    widgets: ['Revenue KPI', 'Profit Margin', 'Cash Flow', 'Active Jobs', 'Approval Queue', 'AI Insights'],
    role: 'owner',
    icon: Shield,
  },
  {
    id: '2',
    name: 'Project Manager',
    description: 'Job tracking, tasks, and pending RFIs',
    widgets: ['My Jobs', 'Tasks Due', 'Schedule Health', 'Budget Health', 'Pending RFIs', 'Daily Logs'],
    role: 'pm',
    icon: ClipboardCheck,
  },
  {
    id: '3',
    name: 'Superintendent',
    description: 'Field operations, weather, and inspections',
    widgets: ['Daily Schedule', 'Inspections', 'Deliveries', 'Weather', 'Punch Items', 'Safety'],
    role: 'superintendent',
    icon: Building2,
  },
  {
    id: '4',
    name: 'Sales',
    description: 'Lead and estimate tracking with AI scoring',
    widgets: ['Leads Pipeline', 'Estimates', 'Pipeline Value', 'Win Rate', 'Follow-ups'],
    role: 'pm',
    icon: TrendingUp,
  },
  {
    id: '5',
    name: 'Accounting',
    description: 'Financial operations and collection tracking',
    widgets: ['AR Aging', 'AP Aging', 'Draws Pending', 'Invoice Queue', 'QB Sync'],
    role: 'office',
    icon: Wallet,
  },
  {
    id: '6',
    name: 'Field Team',
    description: 'Daily work focus with voice log entry',
    widgets: ['Today Tasks', 'Site Photos', 'Daily Log Entry', 'Safety Checklist'],
    role: 'field',
    icon: Camera,
  },
]

const availableWidgets: WidgetPreview[] = [
  { id: '1', name: 'Revenue KPI', type: 'kpi', icon: DollarSign, category: 'Financial', size: '1x1' },
  { id: '2', name: 'Active Jobs', type: 'kpi', icon: Building2, category: 'Jobs', size: '1x1' },
  { id: '3', name: 'Profit Margin', type: 'kpi', icon: TrendingUp, category: 'Financial', size: '1x1' },
  { id: '4', name: 'Tasks Due', type: 'kpi', icon: Clock, category: 'Tasks', size: '1x1' },
  { id: '5', name: 'Revenue Trend', type: 'chart', icon: LineChart, category: 'Financial', size: '2x1' },
  { id: '6', name: 'Job Breakdown', type: 'chart', icon: PieChart, category: 'Jobs', size: '2x1' },
  { id: '7', name: 'Cash Flow', type: 'chart', icon: BarChart3, category: 'Financial', size: '2x1' },
  { id: '8', name: 'Team Activity', type: 'feed', icon: Users, category: 'Team', size: '2x1' },
  { id: '9', name: 'Cash Position', type: 'gauge', icon: Wallet, category: 'Financial', size: '1x1', requiredPermission: 'view_financials' },
  { id: '10', name: 'Weather', type: 'kpi', icon: CloudRain, category: 'Operations', size: '1x1' },
  { id: '11', name: 'Pending Approvals', type: 'list', icon: CheckCircle2, category: 'Approvals', size: '2x1' },
  { id: '12', name: 'Inspection Calendar', type: 'chart', icon: Calendar, category: 'Operations', size: '2x1' },
  { id: '13', name: 'AR Aging', type: 'chart', icon: BarChart3, category: 'Financial', size: '2x1', requiredPermission: 'view_financials' },
  { id: '14', name: 'Alerts Feed', type: 'feed', icon: Bell, category: 'Notifications', size: '2x2' },
  { id: '15', name: 'Schedule Health', type: 'gauge', icon: Gauge, category: 'Operations', size: '1x1' },
  { id: '16', name: 'Photo Feed', type: 'feed', icon: Camera, category: 'Media', size: '2x2' },
]

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function DashboardCard({ dashboard, isSelected, onClick }: { dashboard: Dashboard; isSelected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg border p-4 cursor-pointer transition-all",
        isSelected ? "border-stone-500 ring-2 ring-stone-100" : "border-warm-200 hover:border-warm-300 hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-stone-600" />
          <h4 className="font-medium text-warm-900">{dashboard.name}</h4>
          {dashboard.isDefault && (
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          )}
          {dashboard.embedInPortal && (
            <span className="text-xs bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded font-medium">Portal</span>
          )}
        </div>
        <button className="p-1 hover:bg-warm-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-warm-400" />
        </button>
      </div>
      <p className="text-sm text-warm-500 mb-3">{dashboard.description}</p>
      <div className="flex items-center justify-between text-xs text-warm-500">
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-0.5 rounded font-medium",
            dashboard.visibility === 'personal' ? "bg-stone-100 text-stone-700" :
            dashboard.visibility === 'team' ? "bg-green-100 text-green-700" :
            "bg-purple-100 text-purple-700"
          )}>
            {dashboard.visibility}
          </span>
          <span>{dashboard.widgets} widgets</span>
          {dashboard.autoRefresh && (
            <span className="flex items-center gap-1 text-warm-400">
              <RefreshCw className="h-3 w-3" />
              {dashboard.autoRefresh < 60 ? `${dashboard.autoRefresh}s` : `${dashboard.autoRefresh / 60}m`}
            </span>
          )}
        </div>
        <span>Last viewed: {dashboard.lastViewed}</span>
      </div>
      {dashboard.sharedWith && dashboard.sharedWith.length > 0 && (
        <div className="mt-2 flex items-center gap-1 text-xs text-warm-400">
          <Share2 className="h-3 w-3" />
          Shared with {dashboard.sharedWith.join(', ')}
        </div>
      )}
      {dashboard.role && (
        <div className="mt-2 text-xs text-warm-400">
          <span className="bg-warm-100 text-warm-600 px-1.5 py-0.5 rounded">Role: {dashboard.role}</span>
        </div>
      )}
    </div>
  )
}

function TemplateCard({ template }: { template: DashboardTemplate }) {
  const Icon = template.icon
  return (
    <div className="bg-white rounded-lg border border-warm-200 p-3 hover:border-stone-300 hover:shadow-sm transition-all cursor-pointer">
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-warm-100">
          <Icon className="h-4 w-4 text-warm-600" />
        </div>
        <h5 className="font-medium text-warm-900 text-sm">{template.name}</h5>
      </div>
      <p className="text-xs text-warm-500 mb-2">{template.description}</p>
      <div className="flex flex-wrap gap-1">
        {template.widgets.slice(0, 4).map((widget, i) => (
          <span key={i} className="text-xs bg-warm-100 text-warm-600 px-1.5 py-0.5 rounded">
            {widget}
          </span>
        ))}
        {template.widgets.length > 4 && (
          <span className="text-xs text-warm-400">+{template.widgets.length - 4}</span>
        )}
      </div>
      <div className="mt-2 text-xs text-warm-400">
        Default for: <span className="bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">{template.role}</span>
      </div>
    </div>
  )
}

function WidgetLibrary() {
  const categories = [...new Set(availableWidgets.map(w => w.category))]

  return (
    <div className="bg-white rounded-lg border border-warm-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-warm-900">Widget Library</h4>
        <span className="text-xs text-warm-400">{availableWidgets.length} available</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {categories.map(cat => (
          <span key={cat} className="text-xs bg-warm-100 text-warm-600 px-2 py-0.5 rounded cursor-pointer hover:bg-stone-100 hover:text-stone-700">
            {cat}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {availableWidgets.map(widget => {
          const Icon = widget.icon
          return (
            <div
              key={widget.id}
              className="flex flex-col items-center gap-1 p-2 bg-warm-50 rounded-lg hover:bg-stone-50 hover:border-stone-200 border border-transparent cursor-move transition-colors relative"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Icon className="h-4 w-4 text-warm-600" />
              </div>
              <span className="text-xs text-warm-600 text-center leading-tight">{widget.name}</span>
              <span className="text-xs text-warm-400">{widget.size}</span>
              {widget.requiredPermission && (
                <Lock className="h-2.5 w-2.5 text-warm-400 absolute top-1 right-1" />
              )}
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
          <h4 className="font-semibold text-warm-900">{dashboard.name}</h4>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded font-medium",
            dashboard.visibility === 'personal' ? "bg-stone-100 text-stone-700" :
            dashboard.visibility === 'team' ? "bg-green-100 text-green-700" :
            "bg-purple-100 text-purple-700"
          )}>
            {dashboard.visibility}
          </span>
          {dashboard.autoRefresh && (
            <span className="flex items-center gap-1 text-xs text-warm-400">
              <RefreshCw className="h-3 w-3" />
              Auto-refresh: {dashboard.autoRefresh / 60}m
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
            <Smartphone className="h-4 w-4" />
            Mobile
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
            <Download className="h-4 w-4" />
            PDF
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Widget Grid Preview */}
      <div className="bg-warm-100 rounded-lg p-4 min-h-[300px]">
        <div className="grid grid-cols-4 gap-3">
          {/* KPI Widgets Row */}
          {[
            { label: 'Revenue MTD', value: '$892K', change: '+8.5%', color: 'green', size: '1x1' },
            { label: 'Active Jobs', value: '12', change: '+2', color: 'blue', size: '1x1' },
            { label: 'Profit Margin', value: '14.2%', change: '-0.8%', color: 'amber', size: '1x1' },
            { label: 'Tasks Due Today', value: '8', change: '3 high', color: 'red', size: '1x1' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-lg p-3 shadow-sm relative group">
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                <GripVertical className="h-4 w-4 text-warm-400" />
              </div>
              <div className="text-xs text-warm-500 mb-1">{kpi.label}</div>
              <div className="text-xl font-bold text-warm-900">{kpi.value}</div>
              <div className={cn(
                "text-xs font-medium",
                kpi.color === 'green' ? "text-green-600" :
                kpi.color === 'blue' ? "text-stone-600" :
                kpi.color === 'amber' ? "text-amber-600" :
                "text-red-600"
              )}>
                {kpi.change}
              </div>
              <div className="mt-1">
                <svg viewBox="0 0 60 16" className="w-full h-3">
                  <polyline fill="none" stroke={kpi.color === 'green' ? '#22c55e' : kpi.color === 'blue' ? '#3b82f6' : kpi.color === 'amber' ? '#f59e0b' : '#ef4444'} strokeWidth="1.5" points="0,12 10,10 20,8 30,11 40,6 50,4 60,2" />
                </svg>
              </div>
            </div>
          ))}

          {/* Chart Widgets */}
          <div className="col-span-2 bg-white rounded-lg p-3 shadow-sm relative group">
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
              <GripVertical className="h-4 w-4 text-warm-400" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-warm-900">Revenue Trend</span>
              <div className="flex items-center gap-1">
                <span className="text-xs bg-stone-50 text-stone-600 px-1 py-0.5 rounded">2x1</span>
                <LineChart className="h-4 w-4 text-warm-400" />
              </div>
            </div>
            <div className="h-24 bg-warm-50 rounded flex items-end justify-center gap-1 p-2">
              {[40, 55, 45, 60, 50, 70, 65, 80, 75, 85, 90, 95].map((h, i) => (
                <div
                  key={i}
                  className="w-3 bg-gradient-to-t from-stone-500 to-stone-300 rounded-t"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <div className="col-span-2 bg-white rounded-lg p-3 shadow-sm relative group">
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
              <GripVertical className="h-4 w-4 text-warm-400" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-warm-900">Job Status</span>
              <div className="flex items-center gap-1">
                <span className="text-xs bg-stone-50 text-stone-600 px-1 py-0.5 rounded">2x1</span>
                <PieChart className="h-4 w-4 text-warm-400" />
              </div>
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
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-stone-500 rounded-full" />Pre-Con (3)</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full" />Closeout (2)</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-warm-400 rounded-full" />Warranty (2)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Drop Zone Hint */}
        <div className="mt-4 border-2 border-dashed border-warm-300 rounded-lg p-4 text-center text-warm-400 text-sm">
          Drag widgets here to add to dashboard - widgets occupy 1x1, 2x1, or 2x2 grid cells
        </div>
      </div>

      {/* Widget Library */}
      <WidgetLibrary />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function DashboardsPreview() {
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(mockDashboards[0])
  const [view, setView] = useState<'list' | 'edit'>('list')

  const myDashboards = mockDashboards.filter(d => d.visibility === 'personal')
  const companyDashboards = mockDashboards.filter(d => d.visibility === 'company')

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-warm-900">Custom Dashboards</h3>
            <p className="text-sm text-warm-500">Create personalized views of your business data - drag-and-drop widgets from any module</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-warm-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('list')}
                className={cn(
                  "px-3 py-1.5 text-sm",
                  view === 'list' ? "bg-stone-50 text-stone-600 font-medium" : "text-warm-600 hover:bg-warm-50"
                )}
              >
                Browse
              </button>
              <button
                onClick={() => setView('edit')}
                className={cn(
                  "px-3 py-1.5 text-sm",
                  view === 'edit' ? "bg-stone-50 text-stone-600 font-medium" : "text-warm-600 hover:bg-warm-50"
                )}
              >
                Editor
              </button>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
              <Plus className="h-4 w-4" />
              Create Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-warm-200 px-4 py-2 flex items-center gap-4 text-xs text-warm-500">
        <span>{mockDashboards.length} dashboards</span>
        <span className="text-warm-300">|</span>
        <span>{myDashboards.length} personal</span>
        <span className="text-warm-300">|</span>
        <span>{companyDashboards.length} shared</span>
        <span className="text-warm-300">|</span>
        <span>{availableWidgets.length} widgets available</span>
        <span className="text-warm-300">|</span>
        <span>{dashboardTemplates.length} templates</span>
      </div>

      {view === 'list' ? (
        <div className="p-4 space-y-6">
          {/* My Dashboards */}
          <div>
            <h4 className="text-sm font-semibold text-warm-700 mb-3 flex items-center gap-2">
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
            <h4 className="text-sm font-semibold text-warm-700 mb-3 flex items-center gap-2">
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
            <h4 className="text-sm font-semibold text-warm-700 mb-3 flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-stone-500" />
              ROLE-BASED TEMPLATES
              <span className="text-xs text-warm-400 font-normal">Defaults provided per role - configurable per builder</span>
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {dashboardTemplates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>

          {/* Selected Dashboard Actions */}
          {selectedDashboard && (
            <div className="bg-white rounded-lg border border-warm-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-warm-900">{selectedDashboard.name}</h4>
                  <p className="text-sm text-warm-500">{selectedDashboard.description}</p>
                  <p className="text-xs text-warm-400 mt-1">Created: {selectedDashboard.createdAt} by {selectedDashboard.owner}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
                    <Eye className="h-4 w-4" />
                    Open
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
                    <Copy className="h-4 w-4" />
                    Duplicate
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
                    <Download className="h-4 w-4" />
                    PDF
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
                    <Mail className="h-4 w-4" />
                    Schedule
                  </button>
                  {!selectedDashboard.isDefault && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-600 border border-warm-200 rounded-lg hover:bg-amber-50">
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

      {/* AI Features Panel */}
      <div className="px-4 pb-4">
        <AIFeaturesPanel
          title="AI-Powered Dashboard Features"
          columns={2}
          features={[
            {
              feature: 'Widget Recommendations',
              trigger: 'Real-time',
              insight: 'Suggests relevant widgets based on your role and frequently accessed data.',
              severity: 'info',
              confidence: 88,
            },
            {
              feature: 'Data Refresh',
              trigger: 'On change',
              insight: 'Optimizes data refresh timing to balance performance with data freshness.',
              severity: 'success',
              confidence: 92,
            },
            {
              feature: 'Alert Configuration',
              trigger: 'Daily',
              insight: 'Smart alert thresholds based on historical patterns and business context.',
              severity: 'warning',
              confidence: 85,
            },
            {
              feature: 'Layout Optimization',
              trigger: 'On creation',
              insight: 'Suggests dashboard layouts optimized for your screen size and usage patterns.',
              severity: 'info',
              confidence: 78,
            },
            {
              feature: 'Insight Generation',
              trigger: 'Real-time',
              insight: 'Auto-generates insights from dashboard data to surface trends and anomalies.',
              severity: 'success',
              confidence: 94,
            },
          ]}
        />
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Dashboard Intelligence:</span>
          </div>
          <p className="text-sm text-amber-700">
            Based on your role as Owner/Builder, consider adding a Cash Flow Forecast widget.
            Your Executive Overview dashboard is missing AR Aging which shows 3 overdue invoices ($96K).
            Team members have viewed the Project Status Board 12 times this week - consider promoting to company default.
            The Superintendent template would benefit from a Punch Items widget - 8 open items across active jobs.
            <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">AI-generated</span>
          </p>
        </div>
      </div>
    </div>
  )
}
