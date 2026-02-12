'use client'

import { useState } from 'react'
import {
  Settings,
  Building2,
  Users,
  Hash,
  ShieldCheck,
  Bell,
  Palette,
  Link,
  CreditCard,
  Download,
  Upload,
  Save,
  Sparkles,
  ChevronRight,
  Mail,
  Phone,
  Globe,
  DollarSign,
  Percent,
  Clock,
  Calendar,
  Key,
  Shield,
  CheckCircle2,
  AlertCircle,
  Zap,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsCategory {
  id: string
  label: string
  description: string
  icon: React.ElementType
  status?: 'configured' | 'needs-attention' | 'not-configured'
  subItems?: string[]
}

const settingsCategories: SettingsCategory[] = [
  {
    id: 'company',
    label: 'Company Profile',
    description: 'Name, logo, address, contact info',
    icon: Building2,
    status: 'configured',
    subItems: ['Basic Info', 'Branding', 'License Info'],
  },
  {
    id: 'users',
    label: 'Users & Teams',
    description: 'Team members, roles, permissions',
    icon: Users,
    status: 'configured',
    subItems: ['Team Members', 'Roles', 'Permissions'],
  },
  {
    id: 'cost-codes',
    label: 'Cost Codes',
    description: 'Default and custom cost codes',
    icon: Hash,
    status: 'configured',
    subItems: ['Default Codes', 'Custom Codes', 'Categories'],
  },
  {
    id: 'approvals',
    label: 'Approval Workflows',
    description: 'Invoice, PO, change order thresholds',
    icon: ShieldCheck,
    status: 'needs-attention',
    subItems: ['Invoice Thresholds', 'PO Thresholds', 'Routing Rules'],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Email, push, SMS preferences',
    icon: Bell,
    status: 'configured',
    subItems: ['Email Alerts', 'Push Notifications', 'SMS Alerts'],
  },
  {
    id: 'portal',
    label: 'Client Portal',
    description: 'Portal branding, permissions',
    icon: Palette,
    status: 'configured',
    subItems: ['Branding', 'Permissions', 'Access'],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'QuickBooks, Calendar, Email',
    icon: Link,
    status: 'configured',
    subItems: ['QuickBooks', 'Calendar', 'Email', 'Storage'],
  },
  {
    id: 'billing',
    label: 'Subscription & Billing',
    description: 'Plan, payments, invoices',
    icon: CreditCard,
    status: 'configured',
    subItems: ['Current Plan', 'Payment Method', 'Invoices'],
  },
  {
    id: 'data',
    label: 'Data Management',
    description: 'Backup, import, export',
    icon: Download,
    status: 'not-configured',
    subItems: ['Backup', 'Import', 'Export', 'Retention'],
  },
  {
    id: 'ai',
    label: 'AI Settings',
    description: 'AI confidence thresholds, features',
    icon: Zap,
    status: 'configured',
    subItems: ['Confidence Thresholds', 'Features', 'Training Data'],
  },
]

interface QuickSetting {
  label: string
  value: string
  editable: boolean
}

const companyQuickSettings: QuickSetting[] = [
  { label: 'Company Name', value: 'Ross Built Construction LLC', editable: true },
  { label: 'Phone', value: '(512) 555-1234', editable: true },
  { label: 'Email', value: 'info@rossbuilt.com', editable: true },
  { label: 'Address', value: '123 Builder Ave, Austin TX 78701', editable: true },
]

const financialQuickSettings: QuickSetting[] = [
  { label: 'Invoice Approval Threshold', value: '$25,000', editable: true },
  { label: 'PO Approval Threshold', value: '$10,000', editable: true },
  { label: 'Default Markup Rate', value: '18%', editable: true },
  { label: 'Default Payment Terms', value: 'Net 30', editable: true },
]

const aiQuickSettings: QuickSetting[] = [
  { label: 'Auto-match Confidence', value: '85%', editable: true },
  { label: 'Cost Code Suggestion', value: 'Enabled', editable: true },
  { label: 'Risk Detection', value: 'Enabled', editable: true },
  { label: 'Smart Scheduling', value: 'Enabled', editable: true },
]

function SettingsCategoryCard({ category, onClick }: { category: SettingsCategory; onClick: () => void }) {
  const Icon = category.icon

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "p-3 rounded-lg",
          category.status === 'configured' ? "bg-blue-100" :
          category.status === 'needs-attention' ? "bg-amber-100" :
          "bg-gray-100"
        )}>
          <Icon className={cn(
            "h-6 w-6",
            category.status === 'configured' ? "text-blue-600" :
            category.status === 'needs-attention' ? "text-amber-600" :
            "text-gray-500"
          )} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900">{category.label}</h4>
            {category.status === 'configured' && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            {category.status === 'needs-attention' && (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
          </div>
          <p className="text-sm text-gray-500 mb-2">{category.description}</p>
          {category.subItems && (
            <div className="flex flex-wrap gap-1">
              {category.subItems.map((item, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  )
}

function QuickSettingsCard({ title, settings, icon: Icon }: { title: string; settings: QuickSetting[]; icon: React.ElementType }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-blue-600" />
        <h4 className="font-medium text-gray-900">{title}</h4>
      </div>
      <div className="space-y-3">
        {settings.map((setting, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-600">{setting.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{setting.value}</span>
              {setting.editable && (
                <button className="text-xs text-blue-600 hover:text-blue-700">Edit</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function IntegrationStatus() {
  const integrations = [
    { name: 'QuickBooks Online', status: 'connected', lastSync: '5 min ago' },
    { name: 'Google Calendar', status: 'connected', lastSync: '2 min ago' },
    { name: 'Gmail', status: 'connected', lastSync: 'Real-time' },
    { name: 'DocuSign', status: 'disconnected', lastSync: null },
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link className="h-5 w-5 text-blue-600" />
          <h4 className="font-medium text-gray-900">Integrations</h4>
        </div>
        <button className="text-xs text-blue-600 hover:text-blue-700">Manage All</button>
      </div>
      <div className="space-y-3">
        {integrations.map((integration, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-700">{integration.name}</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                integration.status === 'connected' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              )}>
                {integration.status === 'connected' ? 'Connected' : 'Not Connected'}
              </span>
              {integration.lastSync && (
                <span className="text-xs text-gray-500">{integration.lastSync}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function UsageStats() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-blue-600" />
        <h4 className="font-medium text-gray-900">Usage This Month</h4>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">847</div>
          <div className="text-xs text-gray-600">AI Analyses</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">156</div>
          <div className="text-xs text-gray-600">Documents Processed</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">5</div>
          <div className="text-xs text-gray-600">Active Users</div>
        </div>
      </div>
    </div>
  )
}

export function SettingsPreview() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Global Settings</h3>
            <p className="text-sm text-gray-500">Company-wide settings and system configuration</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export Config
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Save className="h-4 w-4" />
              Save All Changes
            </button>
          </div>
        </div>
      </div>

      {/* Needs Attention Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">1 setting needs attention</p>
            <p className="text-xs text-amber-700">Approval thresholds have not been reviewed in 90+ days</p>
          </div>
          <button className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700">
            Review Now
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Main Settings Categories */}
          <div className="col-span-2 space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">SETTINGS CATEGORIES</h4>
            {settingsCategories.map(category => (
              <SettingsCategoryCard
                key={category.id}
                category={category}
                onClick={() => setSelectedCategory(category.id)}
              />
            ))}
          </div>

          {/* Quick Settings Sidebar */}
          <div className="space-y-4">
            <QuickSettingsCard
              title="Company Info"
              settings={companyQuickSettings}
              icon={Building2}
            />
            <QuickSettingsCard
              title="Financial Settings"
              settings={financialQuickSettings}
              icon={DollarSign}
            />
            <QuickSettingsCard
              title="AI Configuration"
              settings={aiQuickSettings}
              icon={Zap}
            />
            <IntegrationStatus />
            <UsageStats />
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Settings Intelligence:</span>
          </div>
          <p className="text-sm text-amber-700">
            Based on your company size and invoice volume, consider increasing AI auto-match confidence to 90% for faster processing.
            Your approval thresholds are lower than industry average - you approve 40% more items manually than similar companies.
            Data backup has not been configured - recommend enabling automatic weekly backups.
          </p>
        </div>
      </div>
    </div>
  )
}
