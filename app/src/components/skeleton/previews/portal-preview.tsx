'use client'

import { useState } from 'react'
import {
  Home,
  Camera,
  FileText,
  CheckSquare,
  DollarSign,
  MessageSquare,
  Calendar,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Clock,
  TrendingUp,
  Bell,
  Shield,
  Eye,
  Paintbrush,
  ArrowRight,
  Star,
  Download,
  PenLine,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

interface PortalMilestone {
  id: string
  name: string
  phase: string
  percentComplete: number
  status: 'completed' | 'in_progress' | 'upcoming'
  date?: string
}

interface PortalSelection {
  id: string
  category: string
  room: string
  status: 'pending' | 'approved' | 'ordered'
  deadline?: string
  daysRemaining?: number
  optionCount: number
  budgetImpact?: string
}

interface PortalChangeOrder {
  id: string
  title: string
  amount: number
  status: 'pending_approval' | 'approved' | 'rejected'
  submittedDate: string
}

interface RecentUpdate {
  id: string
  title: string
  content: string
  date: string
  photoCount: number
}

const mockMilestones: PortalMilestone[] = [
  { id: '1', name: 'Permitting', phase: 'Preconstruction', percentComplete: 100, status: 'completed', date: '2024-08-15' },
  { id: '2', name: 'Foundation & Pilings', phase: 'Foundation', percentComplete: 100, status: 'completed', date: '2024-09-20' },
  { id: '3', name: 'Framing', phase: 'Structure', percentComplete: 100, status: 'completed', date: '2024-10-30' },
  { id: '4', name: 'Windows & Doors', phase: 'Dry-In', percentComplete: 85, status: 'in_progress' },
  { id: '5', name: 'Electrical Rough-In', phase: 'Rough-In', percentComplete: 40, status: 'in_progress' },
  { id: '6', name: 'Plumbing Rough-In', phase: 'Rough-In', percentComplete: 60, status: 'in_progress' },
  { id: '7', name: 'Insulation', phase: 'Insulation', percentComplete: 0, status: 'upcoming' },
  { id: '8', name: 'Drywall', phase: 'Interior', percentComplete: 0, status: 'upcoming' },
]

const mockSelections: PortalSelection[] = [
  { id: '1', category: 'Floor Tile', room: 'Master Bathroom', status: 'pending', deadline: '2025-01-15', daysRemaining: 8, optionCount: 5, budgetImpact: '+$1,200 vs allowance' },
  { id: '2', category: 'Countertops', room: 'Kitchen', status: 'pending', deadline: '2025-01-15', daysRemaining: 8, optionCount: 4, budgetImpact: 'Within allowance' },
  { id: '3', category: 'Light Fixtures', room: 'Great Room', status: 'pending', deadline: '2025-01-20', daysRemaining: 13, optionCount: 6 },
  { id: '4', category: 'Cabinetry', room: 'Kitchen', status: 'approved', optionCount: 3 },
  { id: '5', category: 'Exterior Paint', room: 'Exterior', status: 'ordered', optionCount: 2 },
]

const mockChangeOrders: PortalChangeOrder[] = [
  { id: '1', title: 'Add outdoor shower at pool', amount: 4500, status: 'pending_approval', submittedDate: '2024-12-28' },
  { id: '2', title: 'Upgrade to quartz countertops', amount: 3200, status: 'approved', submittedDate: '2024-12-15' },
]

const mockUpdates: RecentUpdate[] = [
  { id: '1', title: 'Week 18 Progress Update', content: 'Great progress this week! Framing is complete and we passed our framing inspection. Impact windows arrived and installation begins Monday.', date: '2024-12-27', photoCount: 12 },
  { id: '2', title: 'Week 17 Progress Update', content: 'Roof trusses are set and plywood is going on. Exciting to see your home taking shape! Mechanical subs scheduled for next week.', date: '2024-12-20', photoCount: 8 },
]

export function PortalPreview() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const progress = 65
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'photos', label: 'Photos', icon: Camera, badge: 12 },
    { id: 'documents', label: 'Documents', icon: FileText, badge: 15 },
    { id: 'selections', label: 'Selections', icon: CheckSquare, badge: 3, urgent: true },
    { id: 'changes', label: 'Changes', icon: PenLine, badge: 1 },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 1 },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
  ]

  const pendingSelections = mockSelections.filter(s => s.status === 'pending')
  const pendingCOs = mockChangeOrders.filter(co => co.status === 'pending_approval')

  return (
    <div className="bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
      {/* Portal Header - Builder White-Label Branding */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Ross Built</h1>
              <p className="text-sm text-slate-300">Smith Residence -- 1234 Ocean Drive</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-300 hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">4</span>
            </button>
            <div className="text-right">
              <p className="text-sm text-white font-medium">John & Sarah Smith</p>
              <p className="text-xs text-slate-400">Last login: 2 hours ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Hero */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Your Home's Progress</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>Current Phase: Interior Rough-in</span>
            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Construction</span>
          </div>
        </div>

        <div className="max-w-md mx-auto mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-semibold text-blue-600">{progress}%</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span>On Schedule</span>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Est. Completion: March 15, 2025</span>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1 text-gray-500">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-blue-600">85% confidence</span>
          </div>
        </div>

        {/* AI Weekly Summary */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-700">
                "Great progress this week! Framing is complete and all inspections passed. Your beautiful impact windows arrived on schedule and installation begins Monday. Electrical and plumbing rough-in are running concurrently to keep things moving."
              </p>
              <p className="text-xs text-blue-500 mt-1">AI-generated weekly summary -- Dec 27, 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-3 text-sm whitespace-nowrap border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    tab.urgent
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  )}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left">
            <Camera className="h-6 w-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Photos</h3>
            <p className="text-sm text-gray-500">12 curated this week</p>
            <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />AI-selected highlights
            </p>
          </button>
          <button className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left">
            <FileText className="h-6 w-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Documents</h3>
            <p className="text-sm text-gray-500">15 shared files</p>
            <p className="text-xs text-amber-600 mt-1">1 requires acknowledgment</p>
          </button>
          <button className="bg-white rounded-xl p-4 border border-red-200 hover:border-red-300 hover:shadow-sm transition-all text-left">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare className="h-6 w-6 text-red-600" />
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
            <h3 className="font-medium text-gray-900">Selections</h3>
            <p className="text-sm text-red-600">3 pending -- Due Jan 15</p>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left">
            <DollarSign className="h-6 w-6 text-amber-600 mb-2" />
            <h3 className="font-medium text-gray-900">Budget</h3>
            <p className="text-sm text-gray-500">$1.54M of $2.45M contract</p>
            <p className="text-xs text-green-600 mt-1">On track -- 63% invested</p>
          </button>
          <button className="bg-white rounded-xl p-4 border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all text-left">
            <MessageSquare className="h-6 w-6 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Messages</h3>
            <p className="text-sm text-blue-600">1 new from Jake</p>
            <p className="text-xs text-gray-400 mt-1">Read receipt: enabled</p>
          </button>
          <button className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left">
            <Calendar className="h-6 w-6 text-gray-600 mb-2" />
            <h3 className="font-medium text-gray-900">Schedule</h3>
            <p className="text-sm text-gray-500">Next: Window install Mon</p>
          </button>
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="mx-6 mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-gray-500" />
          Milestone Timeline
        </h4>
        <div className="space-y-2">
          {mockMilestones.map(milestone => (
            <div key={milestone.id} className="flex items-center gap-3">
              <div className={cn(
                "w-3 h-3 rounded-full flex-shrink-0",
                milestone.status === 'completed' ? "bg-green-500" :
                milestone.status === 'in_progress' ? "bg-blue-500" :
                "bg-gray-300"
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-sm",
                    milestone.status === 'completed' ? "text-gray-500 line-through" :
                    milestone.status === 'in_progress' ? "text-gray-900 font-medium" :
                    "text-gray-400"
                  )}>{milestone.name}</span>
                  <span className="text-xs text-gray-400">{milestone.phase}</span>
                </div>
                {milestone.status === 'in_progress' && (
                  <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${milestone.percentComplete}%` }}
                    />
                  </div>
                )}
              </div>
              {milestone.status === 'completed' && milestone.date && (
                <span className="text-xs text-gray-400 flex-shrink-0">{new Date(milestone.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              )}
              {milestone.status === 'in_progress' && (
                <span className="text-xs text-blue-600 font-medium flex-shrink-0">{milestone.percentComplete}%</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending Selections Alert */}
      <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <h4 className="font-medium text-red-900">Selections Needed</h4>
              <p className="text-sm text-red-700">{pendingSelections.length} selections due by Jan 15 to stay on schedule</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-1">
            Review Now
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2">
          {pendingSelections.map(sel => (
            <div key={sel.id} className="flex items-center justify-between bg-white rounded-md px-3 py-2 border border-red-100">
              <div>
                <span className="text-sm font-medium text-gray-900">{sel.category}</span>
                <span className="text-xs text-gray-500 ml-2">{sel.room}</span>
              </div>
              <div className="flex items-center gap-3">
                {sel.budgetImpact && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    sel.budgetImpact.includes('+') ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
                  )}>
                    {sel.budgetImpact}
                  </span>
                )}
                <span className="text-xs text-gray-500">{sel.optionCount} options</span>
                {sel.daysRemaining !== undefined && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded font-medium",
                    sel.daysRemaining <= 7 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {sel.daysRemaining}d left
                  </span>
                )}
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Change Order Requiring Approval */}
      {pendingCOs.length > 0 && (
        <div className="mx-6 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <PenLine className="h-5 w-5 text-amber-600" />
            <h4 className="font-medium text-amber-900">Change Order Awaiting Your Approval</h4>
          </div>
          {pendingCOs.map(co => (
            <div key={co.id} className="flex items-center justify-between bg-white rounded-md px-3 py-2 border border-amber-100">
              <div>
                <span className="text-sm font-medium text-gray-900">{co.title}</span>
                <span className="text-xs text-gray-500 ml-2">Submitted {new Date(co.submittedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">+${co.amount.toLocaleString()}</span>
                <button className="text-xs px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700">Review</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Updates Feed */}
      <div className="mx-6 mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          Recent Updates from Your Builder
        </h4>
        <div className="space-y-3">
          {mockUpdates.map(update => (
            <div key={update.id} className="border border-gray-100 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-sm font-medium text-gray-900">{update.title}</h5>
                <span className="text-xs text-gray-400">{new Date(update.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <p className="text-sm text-gray-600">{update.content}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <Camera className="h-3 w-3" />{update.photoCount} photos
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Chat Bot Preview */}
      <div className="mx-6 mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">Have Questions About Your Project?</h4>
            <p className="text-sm text-gray-600 mb-3">
              Ask me anything -- "When will my windows be installed?", "What selections are due?", or "How does the tile upgrade affect my budget?"
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask a question about your home..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                readOnly
              />
              <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                Ask
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences Banner */}
      <div className="mx-6 mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Bell className="h-4 w-4 text-gray-400" />
            <span>Notifications: Email + Push enabled</span>
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Active</span>
          </div>
          <button className="text-xs text-blue-600 hover:underline">Manage Preferences</button>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="mx-6 mb-6">
        <AIFeaturesPanel
          features={[
            {
              title: 'Engagement Analytics',
              description: 'Tracks portal usage',
            },
            {
              title: 'Content Recommendations',
              description: 'Suggests relevant content',
            },
            {
              title: 'Response Tracking',
              description: 'Monitors client responses',
            },
            {
              title: 'Satisfaction Scoring',
              description: 'Predicts client satisfaction',
            },
            {
              title: 'Communication Insights',
              description: 'Analyzes communication patterns',
            },
          ]}
        />
      </div>

      {/* Footer - White-labeled */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>Last updated: 5 minutes ago</span>
            <span className="flex items-center gap-1 text-xs">
              <Eye className="h-3 w-3" />
              Builder can see your activity
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-700">Privacy Policy</button>
            <span>Need help? Contact support@rossbuilt.com</span>
          </div>
        </div>
      </div>
    </div>
  )
}
