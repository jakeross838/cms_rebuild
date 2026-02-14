'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  ChevronRight,
  Mail,
  Phone,
  Shield,
  Lock,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  LogOut,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────

interface Session {
  id: string
  device: string
  browser: string
  os: string
  location: string
  lastActive: string
  current: boolean
  icon: typeof Monitor
}

// ── Mock Data ─────────────────────────────────────────────────

const notificationCategories = ['Financial', 'Schedule', 'Documents', 'Field Ops', 'Approvals', 'System']
const notificationChannels = ['In-App', 'Email', 'SMS', 'Push']

const notificationPrefs: Record<string, Record<string, boolean>> = {
  Financial: { 'In-App': true, Email: true, SMS: false, Push: true },
  Schedule: { 'In-App': true, Email: true, SMS: true, Push: true },
  Documents: { 'In-App': true, Email: false, SMS: false, Push: false },
  'Field Ops': { 'In-App': true, Email: true, SMS: true, Push: true },
  Approvals: { 'In-App': true, Email: true, SMS: true, Push: true },
  System: { 'In-App': true, Email: true, SMS: false, Push: false },
}

const mockSessions: Session[] = [
  {
    id: '1',
    device: 'Chrome on Windows',
    browser: 'Chrome 122',
    os: 'Windows 11',
    location: 'Charleston, SC',
    lastActive: 'Now',
    current: true,
    icon: Monitor,
  },
  {
    id: '2',
    device: 'iPhone 15',
    browser: 'Safari Mobile',
    os: 'iOS 18.3',
    location: 'Charleston, SC',
    lastActive: '2 hours ago',
    current: false,
    icon: Smartphone,
  },
  {
    id: '3',
    device: 'iPad Pro',
    browser: 'Safari',
    os: 'iPadOS 18.3',
    location: 'Mount Pleasant, SC',
    lastActive: 'Yesterday',
    current: false,
    icon: Tablet,
  },
]

// ── Main Component ────────────────────────────────────────────

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/skeleton" className="hover:text-foreground transition-colors">Account</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Profile</span>
      </nav>

      {/* Header */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-start gap-6">
          <div className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">JR</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground">Jake Ross</h1>
            <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                jake@rossbuilt.com
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                (843) 555-0192
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                Owner
              </span>
              <span className="text-xs text-muted-foreground">Member since January 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-card rounded-lg border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">First Name</label>
              <div className="mt-1 text-sm text-foreground font-medium">Jake</div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Name</label>
              <div className="mt-1 text-sm text-foreground font-medium">Ross</div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
              <div className="mt-1 text-sm text-foreground font-medium">jake@rossbuilt.com</div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</label>
              <div className="mt-1 text-sm text-foreground font-medium">(843) 555-0192</div>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</label>
              <div className="mt-1 text-sm text-foreground font-medium">Owner / General Contractor</div>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-card rounded-lg border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium text-foreground">Password</div>
                <div className="text-xs text-muted-foreground">Last changed 45 days ago</div>
              </div>
            </div>
            <button className="text-xs px-3 py-1.5 rounded bg-accent text-accent-foreground hover:bg-accent/80 transition-colors font-medium">
              Change password
            </button>
          </div>
          <div className="border-t border-border" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium text-foreground">Two-Factor Authentication</div>
                <div className="text-xs text-muted-foreground">Add an extra layer of security to your account</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">Off</span>
              <button className="text-xs px-3 py-1.5 rounded bg-accent text-accent-foreground hover:bg-accent/80 transition-colors font-medium">
                Enable
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-card rounded-lg border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
          <p className="text-xs text-muted-foreground mt-1">Choose how you receive notifications for each category</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                {notificationChannels.map((channel) => (
                  <th key={channel} className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {channel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notificationCategories.map((category, idx) => (
                <tr key={category} className={cn(idx < notificationCategories.length - 1 && 'border-b border-border')}>
                  <td className="px-6 py-3 text-sm font-medium text-foreground">{category}</td>
                  {notificationChannels.map((channel) => (
                    <td key={channel} className="text-center px-4 py-3">
                      <div
                        className={cn(
                          'inline-block h-5 w-9 rounded-full relative transition-colors',
                          notificationPrefs[category][channel] ? 'bg-blue-600' : 'bg-gray-200'
                        )}
                      >
                        <div
                          className={cn(
                            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                            notificationPrefs[category][channel] ? 'translate-x-4' : 'translate-x-0.5'
                          )}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-card rounded-lg border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Active Sessions</h2>
          <p className="text-xs text-muted-foreground mt-1">Manage your active sessions across devices</p>
        </div>
        <div className="divide-y divide-border">
          {mockSessions.map((session) => {
            const Icon = session.icon
            return (
              <div key={session.id} className="flex items-center gap-4 px-6 py-4">
                <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{session.device}</span>
                    {session.current && (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span>{session.browser} / {session.os}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {session.location}
                    </span>
                    <span>Active: {session.lastActive}</span>
                  </div>
                </div>
                {!session.current && (
                  <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded text-red-600 hover:bg-red-50 transition-colors font-medium">
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
