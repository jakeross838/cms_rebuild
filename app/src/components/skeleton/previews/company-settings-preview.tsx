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
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsSection {
  id: string
  label: string
  icon: React.ElementType
  description: string
}

const settingsSections: SettingsSection[] = [
  { id: 'profile', label: 'Company Profile', icon: Building2, description: 'Name, address, contact info' },
  { id: 'branding', label: 'Branding', icon: Palette, description: 'Logo, colors, themes' },
  { id: 'defaults', label: 'Defaults', icon: DollarSign, description: 'Markup, tax, payment terms' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email, push, SMS alerts' },
  { id: 'templates', label: 'Templates', icon: FileText, description: 'Email & document templates' },
  { id: 'users', label: 'Users & Roles', icon: Users, description: 'Team access & permissions' },
  { id: 'data', label: 'Data', icon: Database, description: 'Backup, import, export' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Two-factor, sessions, logs' },
]

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'invited' | 'disabled'
  lastActive: string
}

const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'Jake Ross', email: 'jake@rossbuilt.com', role: 'Owner', status: 'active', lastActive: 'Now' },
  { id: '2', name: 'Mike Smith', email: 'mike@rossbuilt.com', role: 'Project Manager', status: 'active', lastActive: '5 min ago' },
  { id: '3', name: 'Sarah Johnson', email: 'sarah@rossbuilt.com', role: 'Office Manager', status: 'active', lastActive: '1 hour ago' },
  { id: '4', name: 'Tom Wilson', email: 'tom@rossbuilt.com', role: 'Superintendent', status: 'active', lastActive: 'Yesterday' },
  { id: '5', name: 'New PM Hire', email: 'newhire@rossbuilt.com', role: 'Project Manager', status: 'invited', lastActive: '-' },
]

function CompanyProfileForm() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input
            type="text"
            defaultValue="Ross Built Custom Homes"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
          <input
            type="text"
            defaultValue="CGC123456"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input
          type="text"
          defaultValue="123 Main Street"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        />
        <div className="grid grid-cols-3 gap-3">
          <input
            type="text"
            defaultValue="Clearwater"
            placeholder="City"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            defaultValue="FL"
            placeholder="State"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            defaultValue="33756"
            placeholder="ZIP"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              defaultValue="(727) 555-0100"
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              defaultValue="info@rossbuilt.com"
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="url"
              defaultValue="www.rossbuilt.com"
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function BrandingForm() {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <Image className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Upload className="h-4 w-4" />
              Upload Logo
            </button>
            <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB. Recommended: 512x512px</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Brand Colors</label>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Primary</label>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-blue-600 border border-gray-200" />
              <input
                type="text"
                defaultValue="#2563EB"
                className="w-24 px-2 py-1 text-sm border border-gray-200 rounded font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Secondary</label>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-200" />
              <input
                type="text"
                defaultValue="#1F2937"
                className="w-24 px-2 py-1 text-sm border border-gray-200 rounded font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Accent</label>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-amber-500 border border-gray-200" />
              <input
                type="text"
                defaultValue="#F59E0B"
                className="w-24 px-2 py-1 text-sm border border-gray-200 rounded font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Client Portal Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {['Light', 'Dark', 'Auto'].map(theme => (
            <button
              key={theme}
              className={cn(
                "p-3 border rounded-lg text-center transition-colors",
                theme === 'Light' ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"
              )}
            >
              <span className="text-sm font-medium">{theme}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function DefaultsForm() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Markup Rate</label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="number"
              defaultValue="18"
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Applied to cost estimates</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Tax Rate</label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="number"
              defaultValue="7.5"
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Florida sales tax</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Payment Terms</label>
          <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Net 30</option>
            <option>Net 15</option>
            <option>Net 45</option>
            <option>Due on Receipt</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Year Start</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>January</option>
              <option>April</option>
              <option>July</option>
              <option>October</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>America/New_York (EST)</option>
              <option>America/Chicago (CST)</option>
              <option>America/Denver (MST)</option>
              <option>America/Los_Angeles (PST)</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>USD - US Dollar</option>
              <option>CAD - Canadian Dollar</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Numbering Sequences</label>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="block text-xs text-gray-500 mb-1">Job Number Format</label>
            <code className="text-sm font-mono text-gray-800">J-{'{YYYY}'}-{'{###}'}</code>
            <p className="text-xs text-gray-400 mt-1">e.g., J-2026-001</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="block text-xs text-gray-500 mb-1">Invoice Number Format</label>
            <code className="text-sm font-mono text-gray-800">INV-{'{####}'}</code>
            <p className="text-xs text-gray-400 mt-1">e.g., INV-1234</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="block text-xs text-gray-500 mb-1">PO Number Format</label>
            <code className="text-sm font-mono text-gray-800">PO-{'{JOB}'}-{'{##}'}</code>
            <p className="text-xs text-gray-400 mt-1">e.g., PO-J2026001-01</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function UsersForm() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">Team Members</h4>
          <p className="text-sm text-gray-500">{mockTeamMembers.length} users in your organization</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <User className="h-4 w-4" />
          Invite User
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockTeamMembers.map(member => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{member.role}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    member.status === 'active' ? "bg-green-100 text-green-700" :
                    member.status === 'invited' ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-600"
                  )}>
                    {member.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{member.lastActive}</td>
                <td className="px-4 py-3">
                  <button className="text-sm text-blue-600 hover:text-blue-700">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-gray-900 mb-2">Roles & Permissions</h5>
        <div className="grid grid-cols-4 gap-3">
          {['Owner', 'Project Manager', 'Office Manager', 'Field Team'].map(role => (
            <div key={role} className="p-3 bg-white rounded border border-gray-200">
              <div className="font-medium text-sm text-gray-900 mb-1">{role}</div>
              <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Edit Permissions <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

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
      case 'users':
        return <UsersForm />
      default:
        return (
          <div className="text-center py-12 text-gray-500">
            <div className="text-lg font-medium mb-2">
              {settingsSections.find(s => s.id === activeSection)?.label}
            </div>
            <p className="text-sm">Configuration options for this section</p>
          </div>
        )
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Company Settings</h3>
            <p className="text-sm text-gray-500">Configure your company and system preferences</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
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
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">{section.label}</div>
                    <div className="text-xs text-gray-400">{section.description}</div>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 bg-white">
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900">
              {settingsSections.find(s => s.id === activeSection)?.label}
            </h4>
            <p className="text-sm text-gray-500">
              {settingsSections.find(s => s.id === activeSection)?.description}
            </p>
          </div>
          {renderSectionContent()}
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
            Based on your business type, consider setting default markup to 18% for custom home builds.
            Your email templates have a 72% open rate - above industry average.
            1 team member invitation has been pending for 7 days - consider resending.
          </p>
        </div>
      </div>
    </div>
  )
}
