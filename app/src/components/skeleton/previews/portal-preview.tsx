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
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function PortalPreview() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const progress = 65
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'photos', label: 'Photos', icon: Camera, badge: 12 },
    { id: 'documents', label: 'Documents', icon: FileText, badge: 15 },
    { id: 'selections', label: 'Selections', icon: CheckSquare, badge: 3, urgent: true },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 1 },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
  ]

  return (
    <div className="bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
      {/* Portal Header - Builder Branding */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Ross Built</h1>
              <p className="text-sm text-slate-300">Smith Residence</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-300">Welcome, John & Sarah</p>
          </div>
        </div>
      </div>

      {/* Progress Hero */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Your Home's Progress</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>Current Phase: Interior Rough-in</span>
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
        </div>

        {/* AI Summary */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-700">
              "Great progress this week! Framing complete, windows arrived. Electrical rough-in starts Monday."
            </p>
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
          </button>
          <button className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left">
            <FileText className="h-6 w-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Documents</h3>
            <p className="text-sm text-gray-500">15 files</p>
          </button>
          <button className="bg-white rounded-xl p-4 border border-red-200 hover:border-red-300 hover:shadow-sm transition-all text-left">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare className="h-6 w-6 text-red-600" />
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
            <h3 className="font-medium text-gray-900">Selections</h3>
            <p className="text-sm text-red-600">3 pending - Due Jan 15</p>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left">
            <DollarSign className="h-6 w-6 text-amber-600 mb-2" />
            <h3 className="font-medium text-gray-900">Budget</h3>
            <p className="text-sm text-gray-500">On track - Draw #5 due</p>
          </button>
          <button className="bg-white rounded-xl p-4 border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all text-left">
            <MessageSquare className="h-6 w-6 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Messages</h3>
            <p className="text-sm text-blue-600">1 new from Jake</p>
          </button>
          <button className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left">
            <Calendar className="h-6 w-6 text-gray-600 mb-2" />
            <h3 className="font-medium text-gray-900">Schedule</h3>
            <p className="text-sm text-gray-500">View timeline</p>
          </button>
        </div>
      </div>

      {/* Pending Selections Alert */}
      <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <h4 className="font-medium text-red-900">Selections Needed</h4>
              <p className="text-sm text-red-700">3 selections due by Jan 15 to stay on schedule</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-1">
            Review Now
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* AI Chat Bot Preview */}
      <div className="mx-6 mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">Have Questions?</h4>
            <p className="text-sm text-gray-600 mb-3">
              Ask me anything about your project. I can answer questions like "When will my windows be installed?" or "What selections are due?"
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                Ask
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Last updated: 5 minutes ago</span>
          <span>Need help? Contact support@rossbuilt.com</span>
        </div>
      </div>
    </div>
  )
}
