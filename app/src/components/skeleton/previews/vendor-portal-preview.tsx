'use client'

import { useState } from 'react'
import {
  Home,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Upload,
  TrendingUp,
  ChevronRight,
  Shield,
  Receipt,
  Sparkles,
  Package,
  FileCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function VendorPortalPreview() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'pos', label: 'Purchase Orders', icon: FileText, badge: 3 },
    { id: 'invoices', label: 'Invoices', icon: DollarSign, badge: 2 },
    { id: 'bids', label: 'Bid Requests', icon: Package, badge: 1, urgent: true },
    { id: 'documents', label: 'Documents', icon: FileCheck, badge: 4 },
    { id: 'payments', label: 'Payments', icon: TrendingUp },
  ]

  return (
    <div className="bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
      {/* Vendor Portal Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Vendor Portal</h1>
              <p className="text-sm text-blue-100">ABC Electric & Mechanical</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Welcome, James Miller</p>
            <p className="text-xs text-blue-200">Status: Active Vendor</p>
          </div>
        </div>
      </div>

      {/* Action Required Alert */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 mb-1">Action Required</h3>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• 1 Bid Request due Dec 20 - Johnson Project Foundation Work</li>
              <li>• Insurance Certificate expires in 8 days - Upload renewal</li>
              <li>• 2 POs awaiting acknowledgment</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-blue-600 uppercase">Active POs</p>
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">3</p>
            <p className="text-xs text-blue-700 mt-1">Total Value: $45,250</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-orange-600 uppercase">Pending Invoices</p>
              <Receipt className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-900">2</p>
            <p className="text-xs text-orange-700 mt-1">Amount: $18,500</p>
          </div>

          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-green-600 uppercase">Owed to You</p>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">$8,200</p>
            <p className="text-xs text-green-700 mt-1">Due in 5 days</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-purple-600 uppercase">Compliance</p>
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900">4</p>
            <p className="text-xs text-purple-700 mt-1">Documents uploaded</p>
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
                    "text-xs px-1.5 py-0.5 rounded-full font-medium",
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

      {/* Dashboard Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="p-6 space-y-6">
          {/* Active POs Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Purchase Orders</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">PO-2024-1847</h4>
                    <p className="text-sm text-gray-500">Smith Residence - Electrical Rough-in</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Pending Acknowledgment
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-6">
                    <div>
                      <p className="text-gray-500">Amount</p>
                      <p className="font-semibold text-gray-900">$15,750</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Due Date</p>
                      <p className="font-semibold text-gray-900">Dec 20, 2024</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                    Acknowledge
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">PO-2024-1823</h4>
                    <p className="text-sm text-gray-500">Johnson Project - HVAC Installation</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Acknowledged
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-6">
                    <div>
                      <p className="text-gray-500">Amount</p>
                      <p className="font-semibold text-gray-900">$22,400</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Due Date</p>
                      <p className="font-semibold text-gray-900">Jan 15, 2025</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bid Requests Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Open Bid Requests</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-red-900">Bid Request: Foundation Excavation</h4>
                  <p className="text-sm text-red-700">Johnson Warehouse Expansion</p>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  Due Dec 20
                </span>
              </div>
              <p className="text-sm text-red-800 mb-4">Scope: Site excavation, grading, and foundation prep for 15,000 sq ft warehouse</p>
              <button className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                Review & Respond
              </button>
            </div>
          </div>

          {/* Document Upload Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Documents</h3>
            <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:bg-blue-100 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-900 mb-1">Upload Documents</h4>
              <p className="text-sm text-blue-700 mb-3">Insurance certificates, W-9, licenses, or other compliance docs</p>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 inline-block">
                Select Files
              </button>
              <p className="text-xs text-blue-600 mt-3">Or drag and drop files here</p>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">General Liability Insurance.pdf</p>
                    <p className="text-xs text-gray-500">Uploaded Dec 1 - Expires Mar 15, 2025</p>
                  </div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">W-9 Form.pdf</p>
                    <p className="text-xs text-gray-500">Uploaded Nov 15 - Verified</p>
                  </div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Payment Status Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payment Activity</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Invoice INV-2024-567</h4>
                  <p className="text-sm text-gray-500">Smith Residence - Electrical Labor</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">$6,200</p>
                  <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                    <CheckCircle2 className="h-4 w-4" /> Paid Nov 15
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Invoice INV-2024-551</h4>
                  <p className="text-sm text-gray-500">Johnson Project - HVAC Equipment</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">$8,200</p>
                  <div className="flex items-center gap-1 text-sm text-amber-600 mt-1">
                    <Clock className="h-4 w-4" /> Pending - Due Dec 19
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Invoice INV-2024-528</h4>
                  <p className="text-sm text-gray-500">Smith Residence - Materials</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">$4,150</p>
                  <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                    <CheckCircle2 className="h-4 w-4" /> Paid Nov 8
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Assistant */}
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">AI Assistant Available</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Need help? Ask questions like "What invoices are due?" or "Can you help me prepare an invoice?"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Tab Contents - Simplified */}
      {activeTab !== 'dashboard' && (
        <div className="p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <p className="text-gray-500">Content for this tab would display here</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Last updated: 2 minutes ago</span>
          <span>Support: support@constructionmanager.com</span>
        </div>
      </div>
    </div>
  )
}
