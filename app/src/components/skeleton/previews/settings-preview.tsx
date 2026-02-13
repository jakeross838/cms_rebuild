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
  Workflow,
  Type,
  LayoutTemplate,
  ToggleRight,
  History,
  MapPin,
  BookText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SettingsCategory {
  id: string
  label: string
  description: string
  icon: React.ElementType
  status?: 'configured' | 'needs-attention' | 'not-configured'
  subItems?: string[]
  module?: string
}

interface QuickSetting {
  label: string
  value: string
  editable: boolean
  moduleRef?: string
}

// ---------------------------------------------------------------------------
// Settings Categories (reflecting unified-data-outputs & Module 02 spec)
// ---------------------------------------------------------------------------

const settingsCategories: SettingsCategory[] = [
  {
    id: 'company',
    label: 'Company Profile',
    description: 'Name, legal name, logo, address, license, EIN',
    icon: Building2,
    status: 'configured',
    subItems: ['Basic Info', 'Branding', 'License Info', 'Regional Settings'],
    module: 'Module 2',
  },
  {
    id: 'users',
    label: 'Users & Teams',
    description: 'Team members, 7 system roles, custom roles, permissions mode',
    icon: Users,
    status: 'configured',
    subItems: ['Team Members', 'System Roles', 'Custom Roles', 'Permission Wizard', 'Permissions Mode'],
    module: 'Module 1',
  },
  {
    id: 'cost-codes',
    label: 'Cost Codes',
    description: 'CSI / custom / hybrid hierarchy, import from CSV',
    icon: Hash,
    status: 'configured',
    subItems: ['Cost Code Tree', 'Import/Export', 'Remapping', 'Templates'],
    module: 'Module 2',
  },
  {
    id: 'workflows',
    label: 'Approval Workflows',
    description: 'Configurable state machines, thresholds, approval chains',
    icon: ShieldCheck,
    status: 'needs-attention',
    subItems: ['Invoice Thresholds', 'PO Thresholds', 'CO Thresholds', 'Draw Routing', 'Selection Approvals'],
    module: 'Module 2',
  },
  {
    id: 'phases',
    label: 'Project Phases',
    description: 'Ordered phase structure with colors and durations',
    icon: Workflow,
    status: 'configured',
    subItems: ['Phase List', 'Colors', 'Default Durations', 'Templates'],
    module: 'Module 2',
  },
  {
    id: 'terminology',
    label: 'Terminology',
    description: 'Custom display terms for your business (e.g., "Trade Partner")',
    icon: Type,
    status: 'configured',
    subItems: ['~50 Configurable Terms', 'Portal Labels', 'Document Labels'],
    module: 'Module 2',
  },
  {
    id: 'numbering',
    label: 'Numbering Sequences',
    description: 'Configurable patterns for jobs, invoices, POs, COs',
    icon: Hash,
    status: 'configured',
    subItems: ['Pattern Syntax', 'Scope (Global / Per-Project)', 'Sequence Counters'],
    module: 'Module 2',
  },
  {
    id: 'custom-fields',
    label: 'Custom Fields',
    description: 'Add fields to any entity type, conditional visibility',
    icon: LayoutTemplate,
    status: 'not-configured',
    subItems: ['Field Types', 'Conditional Logic', 'Required Fields', 'Validation Rules'],
    module: 'Module 2',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Event routing per role, channel preferences, templates',
    icon: Bell,
    status: 'configured',
    subItems: ['Event Types by Module', 'Channel Routing', 'Template Overrides', 'Quiet Hours'],
    module: 'Module 5',
  },
  {
    id: 'portal',
    label: 'Client & Vendor Portals',
    description: 'Portal branding, feature toggles, access configuration',
    icon: Palette,
    status: 'configured',
    subItems: ['Client Portal Features', 'Vendor Access Defaults', 'Portal Branding'],
    module: 'Module 12, 30',
  },
  {
    id: 'templates',
    label: 'Document Templates',
    description: 'Email templates, contracts, proposals, draw requests',
    icon: FileText,
    status: 'configured',
    subItems: ['Email Templates', 'Contract Templates', 'Proposal Templates', 'Checklist Templates'],
    module: 'Module 2',
  },
  {
    id: 'feature-flags',
    label: 'Feature Flags',
    description: 'Enable/disable modules per subscription plan',
    icon: ToggleRight,
    status: 'configured',
    subItems: ['Plan-Gated Features', 'Admin Toggles', 'Beta Features'],
    module: 'Module 2',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'QuickBooks, Calendar, Email, DocuSign connections',
    icon: Link,
    status: 'configured',
    subItems: ['QuickBooks', 'Calendar', 'Email', 'DocuSign', 'Webhooks'],
    module: 'Module 16',
  },
  {
    id: 'billing',
    label: 'Subscription & Billing',
    description: 'Plan, payments, invoices (owner-only)',
    icon: CreditCard,
    status: 'configured',
    subItems: ['Current Plan', 'Payment Method', 'Invoices', 'Usage Metrics'],
    module: 'Module 43',
  },
  {
    id: 'data',
    label: 'Data Management',
    description: 'Backup, import, export, retention, API keys',
    icon: Download,
    status: 'not-configured',
    subItems: ['Backup Config', 'CSV Import', 'Full Export', 'Data Retention', 'API Keys'],
    module: 'Module 3',
  },
  {
    id: 'security',
    label: 'Security & Audit',
    description: 'MFA policy, sessions, IP restrictions, audit log',
    icon: Shield,
    status: 'configured',
    subItems: ['MFA Policy', 'Session Limits', 'Audit Log', 'IP Restrictions'],
    module: 'Module 1',
  },
  {
    id: 'ai',
    label: 'AI Settings',
    description: 'Confidence thresholds, auto-match, feature toggles',
    icon: Zap,
    status: 'configured',
    subItems: ['Confidence Thresholds', 'Auto-Approve Rules', 'Cost Code Suggestion', 'Risk Detection'],
    module: 'AI Engine',
  },
  {
    id: 'versioning',
    label: 'Config History',
    description: 'Version history with rollback (max 50 per section)',
    icon: History,
    status: 'configured',
    subItems: ['Version Log', 'Diff Viewer', 'Rollback'],
    module: 'Module 2',
  },
  {
    id: 'regional',
    label: 'Regional & Jurisdiction',
    description: 'Tax rules, lien law, building codes by location',
    icon: MapPin,
    status: 'configured',
    subItems: ['Tax Config', 'Lien Law', 'Building Codes', 'Work Hours', 'Holidays'],
    module: 'Module 2',
  },
]

const companyQuickSettings: QuickSetting[] = [
  { label: 'Company Name', value: 'Ross Built Construction LLC', editable: true },
  { label: 'Phone', value: '(512) 555-1234', editable: true },
  { label: 'Email', value: 'info@rossbuilt.com', editable: true },
  { label: 'License #', value: 'CGC123456', editable: true },
  { label: 'State', value: 'Florida', editable: true, moduleRef: 'Jurisdiction' },
]

const financialQuickSettings: QuickSetting[] = [
  { label: 'Invoice Approval Threshold', value: '$25,000', editable: true, moduleRef: 'Workflow' },
  { label: 'PO Approval Threshold', value: '$10,000', editable: true, moduleRef: 'Workflow' },
  { label: 'Default Markup Rate', value: '18%', editable: true, moduleRef: 'Defaults' },
  { label: 'Default Retainage', value: '10%', editable: true, moduleRef: 'Defaults' },
  { label: 'Default Payment Terms', value: 'Net 30', editable: true, moduleRef: 'Defaults' },
  { label: 'Permissions Mode', value: 'Open', editable: true, moduleRef: 'Auth' },
]

const aiQuickSettings: QuickSetting[] = [
  { label: 'Auto-match Confidence', value: '85%', editable: true },
  { label: 'Cost Code Suggestion', value: 'Enabled', editable: true },
  { label: 'Risk Detection', value: 'Enabled', editable: true },
  { label: 'Smart Scheduling', value: 'Enabled', editable: true },
  { label: 'Invoice Auto-Route', value: 'Human Review > $5K', editable: true },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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
            {category.module && (
              <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{category.module}</span>
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{setting.label}</span>
              {setting.moduleRef && (
                <span className="text-xs bg-gray-50 text-gray-400 px-1 py-0.5 rounded">{setting.moduleRef}</span>
              )}
            </div>
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
    { name: 'QuickBooks Online', status: 'connected', lastSync: '5 min ago', module: 'Module 16' },
    { name: 'Google Calendar', status: 'connected', lastSync: '2 min ago', module: 'Module 7' },
    { name: 'Gmail (SMTP)', status: 'connected', lastSync: 'Real-time', module: 'Module 5' },
    { name: 'DocuSign', status: 'disconnected', lastSync: null, module: 'Module 38' },
    { name: 'Stripe', status: 'connected', lastSync: 'Real-time', module: 'Module 43' },
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">{integration.name}</span>
              <span className="text-xs bg-gray-50 text-gray-400 px-1 py-0.5 rounded">{integration.module}</span>
            </div>
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
          <div className="text-xs text-gray-600">Docs Processed</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">7</div>
          <div className="text-xs text-gray-600">Active Users</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="text-center p-2 bg-amber-50 rounded-lg">
          <div className="text-lg font-bold text-amber-600">5</div>
          <div className="text-xs text-gray-600">Active Projects</div>
        </div>
        <div className="text-center p-2 bg-teal-50 rounded-lg">
          <div className="text-lg font-bold text-teal-600">23</div>
          <div className="text-xs text-gray-600">Custom Fields</div>
        </div>
      </div>
    </div>
  )
}

function ConfigHierarchyBar() {
  return (
    <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="font-medium">Config Hierarchy:</span>
        <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200">Platform Defaults</span>
        <ChevronRight className="h-3 w-3" />
        <span className="bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-blue-700 font-medium">Company (viewing)</span>
        <ChevronRight className="h-3 w-3" />
        <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200">Project Override</span>
        <ChevronRight className="h-3 w-3" />
        <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200">User Preferences</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function SettingsPreview() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const configuredCount = settingsCategories.filter(c => c.status === 'configured').length
  const totalCategories = settingsCategories.length
  const completionPercent = Math.round((configuredCount / totalCategories) * 100)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Global Settings</h3>
            <p className="text-sm text-gray-500">Company-wide settings and system configuration</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500">Setup Completeness</p>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${completionPercent}%` }} />
                </div>
                <span className="text-xs font-medium text-gray-700">{completionPercent}%</span>
              </div>
            </div>
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

      <ConfigHierarchyBar />

      {/* Needs Attention Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">2 settings need attention</p>
            <p className="text-xs text-amber-700">Approval thresholds not reviewed in 90+ days. Custom fields not configured.</p>
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
            <h4 className="text-sm font-semibold text-gray-700 mb-2">SETTINGS CATEGORIES ({totalCategories})</h4>
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
              title="Financial & Auth Settings"
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
            2 custom field definitions would streamline your project intake workflow.
          </p>
        </div>
      </div>
    </div>
  )
}
