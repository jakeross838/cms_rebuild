'use client'

import { useState } from 'react'

import {
  Building2,
  User,
  Palette,
  DollarSign,
  Bell,
  FileText,
  Users,
  Database,
  Upload,
  Save,
  Sparkles,
  Mail,
  Phone,
  Globe,
  MapPin,
  Image,
  Hash,
  Percent,
  Calendar,
  Clock,
  ChevronRight,
  Shield,
  Key,
  Lock,
  Settings,
  Workflow,
  BookText,
  LayoutTemplate,
  History,
  AlertTriangle,
  CheckCircle2,
  Info,
  RotateCcw,
  Copy,
  Type,
  ToggleRight,
  ArrowUpDown,
} from 'lucide-react'

import { AIFeaturesPanel } from '@/components/skeleton/ui'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SettingsSection {
  id: string
  label: string
  icon: React.ElementType
  description: string
  status?: 'configured' | 'needs-attention' | 'not-configured'
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'pm' | 'superintendent' | 'office' | 'field' | 'read_only'
  roleLabel: string
  status: 'active' | 'invited' | 'deactivated' | 'expired'
  lastActive: string
  activeJobs: number
  permissions_mode: string
}

interface WorkflowDefinition {
  entityType: string
  label: string
  states: string[]
  approvalThreshold: string
  lastModified: string
}

interface TerminologyOverride {
  termKey: string
  platformDefault: string
  customValue: string
}

interface NumberingPattern {
  entityType: string
  label: string
  pattern: string
  preview: string
  scope: 'global' | 'per_project'
}

interface ConfigVersion {
  id: string
  section: string
  versionNumber: number
  changedBy: string
  changeDescription: string
  createdAt: string
}

interface FeatureFlag {
  key: string
  label: string
  enabled: boolean
  planRequired: string
  description: string
}

// ---------------------------------------------------------------------------
// Settings sections (sidebar nav)
// ---------------------------------------------------------------------------

const settingsSections: SettingsSection[] = [
  { id: 'profile', label: 'Company Profile', icon: Building2, description: 'Name, address, contact, license info', status: 'configured' },
  { id: 'branding', label: 'Branding', icon: Palette, description: 'Logo, colors, portal theme', status: 'configured' },
  { id: 'defaults', label: 'Defaults & Regional', icon: DollarSign, description: 'Markup, tax, payment terms, timezone', status: 'configured' },
  { id: 'workflows', label: 'Approval Workflows', icon: Workflow, description: 'Approval chains, thresholds, routing', status: 'needs-attention' },
  { id: 'cost-codes', label: 'Cost Codes', icon: Hash, description: 'Cost code hierarchy, templates, import', status: 'configured' },
  { id: 'phases', label: 'Project Phases', icon: ArrowUpDown, description: 'Phase structure, colors, durations', status: 'configured' },
  { id: 'terminology', label: 'Terminology', icon: Type, description: 'Custom display terms for your business', status: 'configured' },
  { id: 'numbering', label: 'Numbering Sequences', icon: Hash, description: 'Job, invoice, PO, CO number formats', status: 'configured' },
  { id: 'custom-fields', label: 'Custom Fields', icon: LayoutTemplate, description: 'Additional fields on any entity', status: 'not-configured' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Event routing, channels, templates', status: 'configured' },
  { id: 'templates', label: 'Templates', icon: FileText, description: 'Email & document templates', status: 'configured' },
  { id: 'users', label: 'Users & Roles', icon: Users, description: 'Team access, RBAC, permissions mode', status: 'configured' },
  { id: 'feature-flags', label: 'Feature Flags', icon: ToggleRight, description: 'Enable/disable modules per plan', status: 'configured' },
  { id: 'data', label: 'Data Management', icon: Database, description: 'Backup, import, export, retention', status: 'not-configured' },
  { id: 'security', label: 'Security', icon: Shield, description: 'MFA policy, sessions, audit log', status: 'configured' },
  { id: 'versioning', label: 'Config History', icon: History, description: 'Version history, rollback', status: 'configured' },
]

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'Jake Ross', email: 'jake@rossbuilt.com', role: 'owner', roleLabel: 'Owner', status: 'active', lastActive: 'Now', activeJobs: 5, permissions_mode: 'open' },
  { id: '2', name: 'Mike Smith', email: 'mike@rossbuilt.com', role: 'admin', roleLabel: 'Admin', status: 'active', lastActive: '5 min ago', activeJobs: 0, permissions_mode: 'open' },
  { id: '3', name: 'Sarah Johnson', email: 'sarah@rossbuilt.com', role: 'pm', roleLabel: 'Project Manager', status: 'active', lastActive: '1 hour ago', activeJobs: 3, permissions_mode: 'open' },
  { id: '4', name: 'Tom Wilson', email: 'tom@rossbuilt.com', role: 'superintendent', roleLabel: 'Superintendent', status: 'active', lastActive: 'Yesterday', activeJobs: 2, permissions_mode: 'open' },
  { id: '5', name: 'Lisa Chen', email: 'lisa@rossbuilt.com', role: 'office', roleLabel: 'Office', status: 'active', lastActive: '3 hours ago', activeJobs: 0, permissions_mode: 'open' },
  { id: '6', name: 'Carlos Mendez', email: 'carlos@rossbuilt.com', role: 'field', roleLabel: 'Field', status: 'active', lastActive: '30 min ago', activeJobs: 2, permissions_mode: 'open' },
  { id: '7', name: 'New PM Hire', email: 'newhire@rossbuilt.com', role: 'pm', roleLabel: 'Project Manager', status: 'invited', lastActive: '-', activeJobs: 0, permissions_mode: 'open' },
  { id: '8', name: 'Former Employee', email: 'former@rossbuilt.com', role: 'field', roleLabel: 'Field', status: 'deactivated', lastActive: '2 weeks ago', activeJobs: 0, permissions_mode: 'open' },
]

const mockWorkflows: WorkflowDefinition[] = [
  { entityType: 'change_order', label: 'Change Orders', states: ['draft', 'pending_review', 'approved', 'rejected', 'voided'], approvalThreshold: '$5,000+ requires Owner approval', lastModified: '2026-01-15' },
  { entityType: 'invoice', label: 'Invoices', states: ['received', 'pending_approval', 'approved', 'paid', 'disputed'], approvalThreshold: '$25,000+ requires Owner approval', lastModified: '2026-01-15' },
  { entityType: 'purchase_order', label: 'Purchase Orders', states: ['draft', 'pending_approval', 'approved', 'sent', 'received'], approvalThreshold: '$10,000+ requires Owner approval', lastModified: '2025-11-20' },
  { entityType: 'draw_request', label: 'Draw Requests', states: ['draft', 'pending_review', 'submitted', 'funded', 'rejected'], approvalThreshold: 'All draws require Owner approval', lastModified: '2026-02-01' },
  { entityType: 'selection', label: 'Selections', states: ['pending', 'client_review', 'approved', 'ordered', 'installed'], approvalThreshold: 'Over-allowance requires PM approval', lastModified: '2026-01-10' },
]

const mockTerminology: TerminologyOverride[] = [
  { termKey: 'subcontractor', platformDefault: 'Subcontractor', customValue: 'Trade Partner' },
  { termKey: 'change_order', platformDefault: 'Change Order', customValue: 'Change Order' },
  { termKey: 'punch_list', platformDefault: 'Punch List', customValue: 'Punch List' },
  { termKey: 'draw_request', platformDefault: 'Draw Request', customValue: 'Draw Request' },
  { termKey: 'daily_log', platformDefault: 'Daily Log', customValue: 'Field Report' },
]

const mockNumbering: NumberingPattern[] = [
  { entityType: 'project', label: 'Job Number', pattern: 'J-{YEAR}-{SEQ:3}', preview: 'J-2026-001', scope: 'global' },
  { entityType: 'invoice', label: 'Invoice Number', pattern: 'INV-{SEQ:4}', preview: 'INV-1234', scope: 'global' },
  { entityType: 'purchase_order', label: 'PO Number', pattern: 'PO-{PROJECT_CODE}-{SEQ:2}', preview: 'PO-J2026001-01', scope: 'per_project' },
  { entityType: 'change_order', label: 'CO Number', pattern: 'CO-{PROJECT_CODE}-{SEQ:3}', preview: 'CO-J2026001-001', scope: 'per_project' },
  { entityType: 'rfi', label: 'RFI Number', pattern: 'RFI-{PROJECT_CODE}-{SEQ:3}', preview: 'RFI-J2026001-001', scope: 'per_project' },
]

const mockConfigVersions: ConfigVersion[] = [
  { id: '1', section: 'workflows', versionNumber: 12, changedBy: 'Jake Ross', changeDescription: 'Updated CO approval threshold to $5,000', createdAt: '2026-02-10' },
  { id: '2', section: 'defaults', versionNumber: 8, changedBy: 'Jake Ross', changeDescription: 'Changed default markup from 15% to 18%', createdAt: '2026-02-05' },
  { id: '3', section: 'terminology', versionNumber: 3, changedBy: 'Mike Smith', changeDescription: 'Changed "Subcontractor" to "Trade Partner"', createdAt: '2026-01-20' },
  { id: '4', section: 'numbering', versionNumber: 2, changedBy: 'Jake Ross', changeDescription: 'Added year prefix to job numbers', createdAt: '2026-01-10' },
]

const mockFeatureFlags: FeatureFlag[] = [
  { key: 'estimating', label: 'Estimating Engine', enabled: true, planRequired: 'professional', description: 'Cost database, assemblies, selections-based pricing' },
  { key: 'selections', label: 'Selection Management', enabled: true, planRequired: 'professional', description: 'Product selections, spec books, room-by-room' },
  { key: 'warranty', label: 'Warranty & Home Care', enabled: false, planRequired: 'professional', description: 'Warranty tracking, claims, maintenance schedules' },
  { key: 'client_portal', label: 'Client Portal', enabled: true, planRequired: 'starter', description: 'Client login, project visibility, photo sharing' },
  { key: 'vendor_portal', label: 'Vendor Portal', enabled: true, planRequired: 'professional', description: 'Sub self-service, schedule, documents, invoicing' },
  { key: 'api_access', label: 'API Access', enabled: false, planRequired: 'enterprise', description: 'Public API, third-party integrations' },
  { key: 'custom_reports', label: 'Custom Reports', enabled: true, planRequired: 'professional', description: 'Custom report builder, executive dashboards' },
  { key: 'advanced_permissions', label: 'Advanced Permissions', enabled: false, planRequired: 'enterprise', description: 'Field-level permissions, strict mode' },
]

// ---------------------------------------------------------------------------
// Sub-components: Section Content Renderers
// ---------------------------------------------------------------------------

function CompanyProfileForm() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">Company Name</label>
          <input type="text" defaultValue="Ross Built Custom Homes" className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">Legal Name</label>
          <input type="text" defaultValue="Ross Built Construction LLC" className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">License Number</label>
          <input type="text" defaultValue="CGC123456" className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">EIN</label>
          <input type="text" defaultValue="XX-XXXXXXX" className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-warm-700 mb-1">Address</label>
        <input type="text" defaultValue="123 Main Street" className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 mb-2" />
        <div className="grid grid-cols-3 gap-3">
          <input type="text" defaultValue="Clearwater" placeholder="City" className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" />
          <input type="text" defaultValue="FL" placeholder="State" className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" />
          <input type="text" defaultValue="33756" placeholder="ZIP" className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
            <input type="text" defaultValue="(727) 555-0100" className="w-full pl-10 pr-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
            <input type="email" defaultValue="info@rossbuilt.com" className="w-full pl-10 pr-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">Website</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
            <input type="url" defaultValue="www.rossbuilt.com" className="w-full pl-10 pr-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-warm-700 mb-1">Subscription Plan</label>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-stone-100 text-stone-700 px-2 py-1 rounded font-medium">Professional Plan</span>
          <span className="text-xs text-warm-500">Active since Jan 2026</span>
        </div>
      </div>
    </div>
  )
}

function BrandingForm() {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-warm-700 mb-2">Company Logo</label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-warm-100 rounded-lg flex items-center justify-center border-2 border-dashed border-warm-300">
            <Image className="h-8 w-8 text-warm-400" />
          </div>
          <div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
              <Upload className="h-4 w-4" />
              Upload Logo
            </button>
            <p className="text-xs text-warm-500 mt-2">PNG, JPG up to 2MB. Recommended: 512x512px</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-warm-700 mb-2">Brand Colors</label>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs text-warm-500 mb-1">Primary</label>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-stone-600 border border-warm-200" />
              <input type="text" defaultValue="#2563EB" className="w-24 px-2 py-1 text-sm border border-warm-200 rounded font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-warm-500 mb-1">Secondary</label>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-warm-800 border border-warm-200" />
              <input type="text" defaultValue="#1F2937" className="w-24 px-2 py-1 text-sm border border-warm-200 rounded font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-warm-500 mb-1">Accent</label>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-amber-500 border border-warm-200" />
              <input type="text" defaultValue="#F59E0B" className="w-24 px-2 py-1 text-sm border border-warm-200 rounded font-mono" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-warm-700 mb-2">Client Portal Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {['Light', 'Dark', 'Auto'].map(theme => (
            <button
              key={theme}
              className={cn(
                "p-3 border rounded-lg text-center transition-colors",
                theme === 'Light' ? "border-stone-500 bg-stone-50 text-stone-700" : "border-warm-200 hover:border-warm-300"
              )}
            >
              <span className="text-sm font-medium">{theme}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-warm-700 mb-2">Email Header/Footer</label>
        <div className="p-3 bg-warm-50 rounded-lg border border-warm-200">
          <p className="text-xs text-warm-500">Customize the branding on all outgoing emails and generated documents.</p>
          <button className="mt-2 text-xs text-stone-600 hover:text-stone-700 flex items-center gap-1">
            Configure Email Branding <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

function DefaultsForm() {
  return (
    <div className="space-y-6">
      <h5 className="text-sm font-medium text-warm-500 uppercase tracking-wide">Financial Defaults</h5>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">Default Markup Rate</label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
            <input type="number" defaultValue="18" className="w-full pl-10 pr-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" />
          </div>
          <p className="text-xs text-warm-500 mt-1">Applied to cost estimates</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">Default Retainage</label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
            <input type="number" defaultValue="10" className="w-full pl-10 pr-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" />
          </div>
          <p className="text-xs text-warm-500 mt-1">Standard retainage percentage</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">Default Tax Rate</label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
            <input type="number" defaultValue="7.5" className="w-full pl-10 pr-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" />
          </div>
          <p className="text-xs text-warm-500 mt-1">Florida sales tax (materials only)</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">Default Payment Terms</label>
          <select className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500">
            <option>Net 30</option>
            <option>Net 15</option>
            <option>Net 45</option>
            <option>Due on Receipt</option>
          </select>
        </div>
      </div>

      <h5 className="text-sm font-medium text-warm-500 uppercase tracking-wide pt-4">Regional Settings</h5>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">Timezone</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
            <select className="w-full pl-10 pr-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500">
              <option>America/New_York (EST)</option>
              <option>America/Chicago (CST)</option>
              <option>America/Denver (MST)</option>
              <option>America/Los_Angeles (PST)</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">Currency</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
            <select className="w-full pl-10 pr-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500">
              <option>USD - US Dollar</option>
              <option>CAD - Canadian Dollar</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">Fiscal Year Start</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
            <select className="w-full pl-10 pr-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500">
              <option>January</option>
              <option>April</option>
              <option>July</option>
              <option>October</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">State (Lien Law & Tax)</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
            <select className="w-full pl-10 pr-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500">
              <option>Florida</option>
              <option>Texas</option>
              <option>California</option>
              <option>North Carolina</option>
            </select>
          </div>
          <p className="text-xs text-warm-500 mt-1">Determines lien waiver forms, tax rules, and building code references</p>
        </div>
      </div>
    </div>
  )
}

function WorkflowsSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-warm-500">Configurable approval chains per entity type. Thresholds determine who approves at what dollar amount.</p>
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-medium flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Not reviewed in 90+ days
        </span>
      </div>
      <div className="space-y-3">
        {mockWorkflows.map(wf => (
          <div key={wf.entityType} className="bg-warm-50 rounded-lg border border-warm-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-warm-900">{wf.label}</h5>
              <button className="text-xs text-stone-600 hover:text-stone-700 flex items-center gap-1">
                Edit Workflow <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {wf.states.map((state, i) => (
                <span key={state} className="flex items-center gap-1">
                  <span className="text-xs bg-white px-2 py-0.5 rounded border border-warm-200 text-warm-600">{state}</span>
                  {i < wf.states.length - 1 && <ChevronRight className="h-3 w-3 text-warm-300" />}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-warm-500">
              <span>{wf.approvalThreshold}</span>
              <span>Last modified: {wf.lastModified}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TerminologySection() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-warm-500">
        Customize the display terms used throughout the platform. These apply to the UI, notifications, generated documents, and portals.
        Database values and API field names are unchanged.
      </p>
      <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-warm-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-warm-500 uppercase">Platform Term</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-warm-500 uppercase">Your Display Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-warm-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-200">
            {mockTerminology.map(term => (
              <tr key={term.termKey} className="hover:bg-warm-50">
                <td className="px-4 py-3 text-sm text-warm-500">{term.platformDefault}</td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    defaultValue={term.customValue}
                    className="px-2 py-1 text-sm border border-warm-200 rounded focus:outline-none focus:ring-2 focus:ring-stone-500"
                  />
                </td>
                <td className="px-4 py-3">
                  {term.customValue !== term.platformDefault && (
                    <button className="text-xs text-warm-400 hover:text-warm-600 flex items-center gap-1">
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-warm-400">~50 configurable terms. Changes propagate to the UI, client portal, vendor portal, notifications, and generated documents.</p>
    </div>
  )
}

function NumberingSection() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-warm-500">Define numbering patterns for all document types. Sequences auto-increment per scope (global or per-project).</p>
      <div className="space-y-3">
        {mockNumbering.map(np => (
          <div key={np.entityType} className="bg-warm-50 rounded-lg border border-warm-200 p-4">
            <div className="flex items-center justify-between mb-1">
              <h5 className="font-medium text-sm text-warm-900">{np.label}</h5>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded font-medium",
                np.scope === 'global' ? 'bg-stone-100 text-stone-700' : 'bg-warm-100 text-warm-700'
              )}>
                {np.scope === 'global' ? 'Global Sequence' : 'Per-Project Sequence'}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <code className="text-sm font-mono text-warm-700 bg-white px-2 py-1 rounded border border-warm-200">{np.pattern}</code>
              <span className="text-xs text-warm-400">Preview:</span>
              <span className="text-sm font-medium text-warm-900">{np.preview}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-warm-400">
        Tokens: {'{PREFIX}'}, {'{YEAR}'}, {'{PROJECT_CODE}'}, {'{SEQ:N}'}, {'{MONTH}'}, {'{BUILDER_CODE}'}
      </p>
    </div>
  )
}

function UsersForm() {
  return (
    <div className="space-y-4">
      {/* Permissions Mode Banner */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 flex items-center gap-3">
        <Info className="h-5 w-5 text-stone-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-stone-800">Permissions Mode: Open</p>
          <p className="text-xs text-stone-600">All internal users can see everything. Switch to Standard when you need role-based access control.</p>
        </div>
        <select className="px-2 py-1 text-xs border border-stone-200 rounded bg-white text-stone-700">
          <option>Open (v1 default)</option>
          <option>Standard</option>
          <option>Strict</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-warm-900">Team Members</h4>
          <p className="text-sm text-warm-500">{mockTeamMembers.length} users in your organization</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
          <User className="h-4 w-4" />
          Invite User
        </button>
      </div>

      <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-warm-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-warm-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-warm-500 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-warm-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-warm-500 uppercase">Active Jobs</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-warm-500 uppercase">Last Active</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-warm-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-200">
            {mockTeamMembers.map(member => (
              <tr key={member.id} className="hover:bg-warm-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-stone-700">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-warm-900 text-sm">{member.name}</div>
                      <div className="text-xs text-warm-500">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded font-medium",
                    member.role === 'owner' ? 'bg-warm-100 text-warm-700' :
                    member.role === 'admin' ? 'bg-stone-100 text-stone-700' :
                    member.role === 'pm' ? 'bg-green-100 text-green-700' :
                    member.role === 'superintendent' ? 'bg-amber-100 text-amber-700' :
                    member.role === 'office' ? 'bg-stone-100 text-stone-700' :
                    member.role === 'field' ? 'bg-sand-100 text-sand-700' :
                    'bg-warm-100 text-warm-600'
                  )}>
                    {member.roleLabel}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded font-medium",
                    member.status === 'active' ? "bg-green-100 text-green-700" :
                    member.status === 'invited' ? "bg-amber-100 text-amber-700" :
                    member.status === 'deactivated' ? "bg-red-100 text-red-700" :
                    "bg-warm-100 text-warm-600"
                  )}>
                    {member.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-warm-600">{member.activeJobs}</td>
                <td className="px-4 py-3 text-sm text-warm-500">{member.lastActive}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button className="text-sm text-stone-600 hover:text-stone-700">Edit</button>
                    {member.status === 'invited' && (
                      <button className="text-sm text-warm-400 hover:text-warm-600">Resend</button>
                    )}
                    {member.status === 'active' && member.role !== 'owner' && (
                      <button className="text-sm text-red-400 hover:text-red-600">Deactivate</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-warm-50 rounded-lg">
        <h5 className="font-medium text-warm-900 mb-2">System Roles (7 Canonical)</h5>
        <p className="text-xs text-warm-500 mb-3">Hierarchy: Owner &gt; Admin &gt; PM &gt; Superintendent &gt; Office &gt; Field &gt; Read-Only. Custom roles inherit from these.</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { role: 'Owner', desc: 'Full access + billing', color: 'border-warm-300 bg-warm-50' },
            { role: 'Admin', desc: 'Full access (no billing)', color: 'border-stone-300 bg-stone-50' },
            { role: 'Project Manager', desc: 'Manage projects, budgets', color: 'border-green-300 bg-green-50' },
            { role: 'Superintendent', desc: 'Field leadership', color: 'border-amber-300 bg-amber-50' },
            { role: 'Office', desc: 'Accounting, scheduling', color: 'border-teal-300 bg-stone-50' },
            { role: 'Field', desc: 'Daily logs, photos, tasks', color: 'border-sand-300 bg-sand-50' },
            { role: 'Read-Only', desc: 'View only', color: 'border-warm-300 bg-warm-50' },
            { role: '+ Custom Role', desc: 'Create new role', color: 'border-dashed border-warm-300 bg-white' },
          ].map(r => (
            <div key={r.role} className={cn("p-3 rounded border", r.color)}>
              <div className="font-medium text-sm text-warm-900 mb-1">{r.role}</div>
              <p className="text-xs text-warm-500 mb-1">{r.desc}</p>
              <button className="text-xs text-stone-600 hover:text-stone-700 flex items-center gap-1">
                Edit Permissions <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FeatureFlagsSection() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-warm-500">Enable or disable platform modules. Some features are gated by subscription plan.</p>
      <div className="grid grid-cols-2 gap-3">
        {mockFeatureFlags.map(flag => (
          <div key={flag.key} className="bg-warm-50 rounded-lg border border-warm-200 p-3 flex items-start gap-3">
            <div className={cn(
              "w-10 h-6 rounded-full flex items-center px-0.5 mt-0.5 transition-colors cursor-pointer",
              flag.enabled ? "bg-stone-600 justify-end" : "bg-warm-300 justify-start"
            )}>
              <div className="w-5 h-5 bg-white rounded-full shadow" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-warm-900">{flag.label}</span>
                <span className="text-xs bg-warm-200 text-warm-600 px-1.5 py-0.5 rounded">{flag.planRequired}</span>
              </div>
              <p className="text-xs text-warm-500 mt-0.5">{flag.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConfigVersioningSection() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-warm-500">Every configuration change is versioned. You can roll back to any previous version within the last 50 changes per section.</p>
      <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-warm-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-warm-500 uppercase">Section</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-warm-500 uppercase">Version</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-warm-500 uppercase">Change</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-warm-500 uppercase">Changed By</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-warm-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-warm-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-200">
            {mockConfigVersions.map(version => (
              <tr key={version.id} className="hover:bg-warm-50">
                <td className="px-4 py-3">
                  <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">{version.section}</span>
                </td>
                <td className="px-4 py-3 text-sm font-mono text-warm-600">v{version.versionNumber}</td>
                <td className="px-4 py-3 text-sm text-warm-700">{version.changeDescription}</td>
                <td className="px-4 py-3 text-sm text-warm-600">{version.changedBy}</td>
                <td className="px-4 py-3 text-sm text-warm-500">{version.createdAt}</td>
                <td className="px-4 py-3">
                  <button className="text-xs text-stone-600 hover:text-stone-700 flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" />
                    Rollback
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function CompanySettingsPreview() {
  const [activeSection, setActiveSection] = useState('profile')

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return <CompanyProfileForm />
      case 'branding':
        return <BrandingForm />
      case 'defaults':
        return <DefaultsForm />
      case 'workflows':
        return <WorkflowsSection />
      case 'terminology':
        return <TerminologySection />
      case 'numbering':
        return <NumberingSection />
      case 'users':
        return <UsersForm />
      case 'feature-flags':
        return <FeatureFlagsSection />
      case 'versioning':
        return <ConfigVersioningSection />
      default:
        return (
          <div className="text-center py-12 text-warm-500">
            <div className="text-lg font-medium mb-2">
              {settingsSections.find(s => s.id === activeSection)?.label}
            </div>
            <p className="text-sm">Configuration options for this section</p>
          </div>
        )
    }
  }

  // Stats summary
  const configuredCount = settingsSections.filter(s => s.status === 'configured').length
  const totalSections = settingsSections.length
  const completionPercent = Math.round((configuredCount / totalSections) * 100)

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-warm-900">Company Settings</h3>
            <p className="text-sm text-warm-500">Configure your company and system preferences</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-warm-500">Setup Completeness</p>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-warm-200 rounded-full overflow-hidden">
                  <div className="h-full bg-stone-600 rounded-full" style={{ width: `${completionPercent}%` }} />
                </div>
                <span className="text-xs font-medium text-warm-700">{completionPercent}%</span>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Hierarchy Indicator */}
      <div className="bg-warm-100 border-b border-warm-200 px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-warm-500">
          <span className="font-medium">Config Hierarchy:</span>
          <span className="bg-white px-1.5 py-0.5 rounded border border-warm-200">Platform Defaults</span>
          <ChevronRight className="h-3 w-3" />
          <span className="bg-stone-50 px-1.5 py-0.5 rounded border border-stone-200 text-stone-700 font-medium">Company (editing)</span>
          <ChevronRight className="h-3 w-3" />
          <span className="bg-white px-1.5 py-0.5 rounded border border-warm-200">Project Override</span>
          <ChevronRight className="h-3 w-3" />
          <span className="bg-white px-1.5 py-0.5 rounded border border-warm-200">User Preferences</span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-warm-200 p-4 max-h-[600px] overflow-y-auto">
          <nav className="space-y-1">
            {settingsSections.map(section => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors",
                    activeSection === section.id
                      ? "bg-stone-50 text-stone-700"
                      : "text-warm-600 hover:bg-warm-50"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{section.label}</div>
                  </div>
                  {section.status === 'configured' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />}
                  {section.status === 'needs-attention' && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
                  {section.status === 'not-configured' && <div className="h-3.5 w-3.5 rounded-full border-2 border-warm-300 flex-shrink-0" />}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 bg-white max-h-[600px] overflow-y-auto">
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-warm-900">
              {settingsSections.find(s => s.id === activeSection)?.label}
            </h4>
            <p className="text-sm text-warm-500">
              {settingsSections.find(s => s.id === activeSection)?.description}
            </p>
          </div>
          {renderSectionContent()}
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Settings Intelligence:</span>
          </div>
          <p className="text-sm text-amber-700">
            Based on your business type, consider setting default markup to 18% for custom home builds.
            Your email templates have a 72% open rate - above industry average.
            1 team member invitation has been pending for 7 days - consider resending.
            Approval thresholds have not been reviewed in 90+ days.
          </p>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <AIFeaturesPanel
          title="Company Settings AI Features"
          columns={2}
          features={[
            {
              feature: 'Compliance Check',
              trigger: 'daily',
              insight: 'Verifies regulatory compliance across company settings, license renewals, and insurance requirements.',
              severity: 'success',
              confidence: 92,
            },
            {
              feature: 'Branding Consistency',
              trigger: 'on-change',
              insight: 'Ensures brand alignment across all portals, documents, and communications for consistent presentation.',
              severity: 'info',
              confidence: 88,
            },
            {
              feature: 'Integration Health',
              trigger: 'real-time',
              insight: 'Monitors integrations with QuickBooks, scheduling tools, and third-party services for connectivity issues.',
              severity: 'success',
              confidence: 95,
            },
            {
              feature: 'User Activity',
              trigger: 'weekly',
              insight: 'Tracks user engagement patterns, identifies inactive accounts, and suggests permission optimizations.',
              severity: 'info',
              confidence: 85,
            },
            {
              feature: 'Security Posture',
              trigger: 'real-time',
              insight: 'Assesses security status including MFA adoption, session policies, and access pattern anomalies.',
              severity: 'warning',
              confidence: 78,
            },
          ]}
        />
      </div>
    </div>
  )
}
