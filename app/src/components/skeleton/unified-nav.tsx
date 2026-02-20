'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  ChevronRight,
  Building2,
  Bell,
  Search,
  Settings,
  Check,
  LogOut,
  Sun,
  Moon,
  Keyboard,
  User,
  Shield,
  Sparkles,
  Clock,
  AlertTriangle,
  FileCheck,
  FileText,
} from 'lucide-react'
import {
  companyNav,
  companyJobNav,
  companyRightNav,
  jobNav,
  jobPhaseNav,
  type NavItem,
  type NavSubItem,
} from '@/config/navigation'

// ── Dropdown for nav items with sub-items ─────────────────────

function NavDropdown({
  item,
  resolvedItems,
}: {
  item: NavItem
  resolvedItems: NavSubItem[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const isActive = resolvedItems.some(
    (p) => pathname === p.href || pathname.startsWith(p.href + '/')
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-foreground hover:bg-accent'
        )}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.label}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-popover rounded-lg shadow-lg border border-border py-2 z-[100]">
          {resolvedItems.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                'block px-3 py-2 mx-1 rounded-md transition-colors',
                pathname === page.href || pathname.startsWith(page.href + '/')
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent'
              )}
            >
              <div className="font-medium text-sm">{page.name}</div>
              <div className="text-xs text-muted-foreground">{page.description}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Direct link nav item ──────────────────────────────────────

function NavLink({ item, resolvedHref }: { item: NavItem; resolvedHref: string }) {
  const pathname = usePathname()

  const isActive =
    resolvedHref === '/skeleton'
      ? pathname === '/skeleton'
      : pathname === resolvedHref || pathname.startsWith(resolvedHref + '/')

  return (
    <Link
      href={resolvedHref}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-foreground hover:bg-accent'
      )}
    >
      <item.icon className="h-4 w-4" />
      <span>{item.label}</span>
    </Link>
  )
}

// ── Renders a list of NavItems (resolves job-relative hrefs) ──

function NavItemList({ items, jobBase }: { items: NavItem[]; jobBase?: string }) {
  const resolveHref = (href: string) => {
    if (!jobBase) return href
    // "← Company" has a full absolute path back to company view
    if (href.startsWith('/skeleton/')) return href
    // Job-relative paths (like /schedule, /budget) get prepended with jobBase
    // Empty string = job overview
    return jobBase + href
  }

  return (
    <>
      {items.map((item) => {
        if (item.items) {
          const resolved = item.items.map((sub) => ({
            ...sub,
            href: resolveHref(sub.href),
          }))
          return <NavDropdown key={item.label} item={item} resolvedItems={resolved} />
        }
        return (
          <NavLink
            key={item.label}
            item={item}
            resolvedHref={resolveHref(item.href ?? '/skeleton')}
          />
        )
      })}
    </>
  )
}

// ── Settings mega-menu (consolidates Directory, Library, Platform, Settings) ──

function SettingsMegaMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Check if any right nav item is active
  const isActive = companyRightNav.some(section =>
    section.items?.some(item =>
      pathname === item.href || pathname.startsWith(item.href + '/')
    )
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors',
          isActive && 'bg-accent text-foreground'
        )}
        title="Settings & More"
      >
        <Settings className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-[640px] bg-popover rounded-lg shadow-lg border border-border p-4 z-[100]">
          <div className="grid grid-cols-3 gap-6">
            {companyRightNav.map((section) => (
              <div key={section.label}>
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground">
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </div>
                <div className="space-y-0.5">
                  {section.items?.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'block px-2 py-1.5 text-sm rounded-md transition-colors',
                        pathname === item.href || pathname.startsWith(item.href + '/')
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Notification mock data ────────────────────────────────────

interface Notification {
  id: string
  priority: 'critical' | 'high' | 'normal' | 'low'
  type: 'alert' | 'approval' | 'ai_insight' | 'update' | 'reminder'
  title: string
  message: string
  time: string
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    priority: 'critical',
    type: 'alert',
    title: 'Draw #4 payment overdue',
    message: '$185,000 due yesterday. Lender submission affected.',
    time: '5m ago',
    read: false,
  },
  {
    id: '2',
    priority: 'high',
    type: 'approval',
    title: 'Invoice #1087 needs approval',
    message: 'ABC Electric — $12,450 matched to PO-0142.',
    time: '2h ago',
    read: false,
  },
  {
    id: '3',
    priority: 'normal',
    type: 'ai_insight',
    title: 'Cash flow alert detected',
    message: 'Projected shortfall of $45K in 3 weeks across 2 jobs.',
    time: '4h ago',
    read: false,
  },
  {
    id: '4',
    priority: 'normal',
    type: 'update',
    title: 'Framing inspection passed',
    message: 'Smith Residence — Inspector signed off, ready for drywall.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: '5',
    priority: 'high',
    type: 'reminder',
    title: 'COI expires in 15 days',
    message: 'Jones Plumbing — Certificate of Insurance due Feb 28.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: '6',
    priority: 'low',
    type: 'update',
    title: 'Daily log submitted',
    message: 'Harbor View Condos — 8 crew members, 3 photos attached.',
    time: '2 days ago',
    read: true,
  },
]

const priorityDotColor: Record<Notification['priority'], string> = {
  critical: 'bg-red-500',
  high: 'bg-amber-500',
  normal: 'bg-stone-500',
  low: 'bg-warm-400',
}

const notificationIcon: Record<Notification['type'], typeof AlertTriangle> = {
  alert: AlertTriangle,
  approval: FileCheck,
  ai_insight: Sparkles,
  update: FileText,
  reminder: Clock,
}

// ── Notification Dropdown ─────────────────────────────────────

function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors',
          isOpen && 'bg-accent text-foreground'
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-[400px] bg-popover rounded-lg shadow-lg border border-border z-[100]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[380px] overflow-y-auto">
            {notifications.map((notification) => {
              const Icon = notificationIcon[notification.type]
              return (
                <div
                  key={notification.id}
                  className={cn(
                    'flex gap-3 px-4 py-3 border-b border-border last:border-b-0 transition-colors hover:bg-accent/50',
                    !notification.read && 'bg-accent/30'
                  )}
                >
                  {/* Priority dot */}
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <span className={cn('h-2 w-2 rounded-full flex-shrink-0', priorityDotColor[notification.priority])} />
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={cn(
                        'text-sm leading-tight',
                        !notification.read ? 'font-semibold text-foreground' : 'font-medium text-foreground'
                      )}>
                        {notification.title}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5">
            <Link
              href="/skeleton/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs text-stone-600 hover:text-stone-700 font-medium"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Account mock data ─────────────────────────────────────────

const mockCompanies = [
  { id: '1', name: 'Ross Built LLC', current: true },
  { id: '2', name: 'Ross Coastal Homes', current: false },
  { id: '3', name: 'Demo Builder Co', current: false },
]

const systemRoles = [
  { key: 'owner', label: 'Owner', description: 'Full platform access, billing, company settings' },
  { key: 'admin', label: 'Admin', description: 'All features except billing and company deletion' },
  { key: 'pm', label: 'Project Manager', description: 'Manage assigned jobs, budgets, schedules, vendors' },
  { key: 'superintendent', label: 'Superintendent', description: 'Field ops, daily logs, inspections, punch lists' },
  { key: 'office', label: 'Office Staff', description: 'Invoicing, AP/AR, document management, reports' },
  { key: 'field', label: 'Field Crew', description: 'Daily logs, time tracking, photos, safety forms' },
  { key: 'read_only', label: 'Read Only', description: 'View-only access to assigned projects' },
]

// ── Account Dropdown ──────────────────────────────────────────

function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [rolesExpanded, setRolesExpanded] = useState(false)
  const [currentCompany, setCurrentCompany] = useState('1')
  const [currentRole, setCurrentRole] = useState('owner')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 p-1.5 hover:bg-accent rounded-lg ml-1 transition-colors',
          isOpen && 'bg-accent'
        )}
      >
        <div className="h-8 w-8 bg-stone-600 rounded-full flex items-center justify-center">
          <span className="text-xs font-semibold text-white">JR</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-[320px] bg-popover rounded-lg shadow-lg border border-border z-[100]">
          {/* User header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-stone-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-white">JR</span>
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-foreground">Jake Ross</div>
                <div className="text-xs text-muted-foreground truncate">jake@rossbuilt.com</div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium ml-auto flex-shrink-0">
                Owner
              </span>
            </div>
          </div>

          {/* Company switcher */}
          <div className="px-2 py-2 border-b border-border">
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Company
            </div>
            {mockCompanies.map((company) => (
              <button
                key={company.id}
                onClick={() => setCurrentCompany(company.id)}
                className={cn(
                  'flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md transition-colors text-left',
                  company.id === currentCompany
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground hover:bg-accent'
                )}
              >
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="flex-1 truncate">{company.name}</span>
                {company.id === currentCompany && (
                  <Check className="h-4 w-4 text-stone-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Preview As (role picker) */}
          <div className="px-2 py-2 border-b border-border">
            <button
              onClick={() => setRolesExpanded(!rolesExpanded)}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors"
            >
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-left">
                Preview As: <span className="font-medium">{systemRoles.find((r) => r.key === currentRole)?.label}</span>
              </span>
              <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', rolesExpanded && 'rotate-90')} />
            </button>
            {rolesExpanded && (
              <div className="mt-1 ml-2 space-y-0.5">
                {systemRoles.map((role) => (
                  <button
                    key={role.key}
                    onClick={() => setCurrentRole(role.key)}
                    className={cn(
                      'flex items-start gap-2 w-full px-2 py-1.5 text-left rounded-md transition-colors',
                      role.key === currentRole
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{role.label}</div>
                      <div className="text-xs text-muted-foreground">{role.description}</div>
                    </div>
                    {role.key === currentRole && (
                      <Check className="h-4 w-4 text-stone-600 flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="px-2 py-2 border-b border-border">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors"
            >
              {theme === 'light' ? (
                <Sun className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Moon className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="flex-1 text-left">Theme</span>
              <span className="text-xs text-muted-foreground">{theme === 'light' ? 'Light' : 'Dark'}</span>
            </button>
            <button
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors"
            >
              <Keyboard className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-left">Keyboard shortcuts</span>
              <span className="text-xs text-muted-foreground">?</span>
            </button>
          </div>

          {/* Links */}
          <div className="px-2 py-2 border-b border-border">
            <Link
              href="/skeleton/account/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Profile</span>
            </Link>
            <Link
              href="/skeleton/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </Link>
          </div>

          {/* Sign out */}
          <div className="px-2 py-2">
            <button
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main unified nav ──────────────────────────────────────────

export function UnifiedNav() {
  const pathname = usePathname()

  // Parse job ID from pathname since useParams may not work in parent layouts
  const jobIdMatch = pathname.match(/\/skeleton\/jobs\/([^\/]+)/)
  const jobId = jobIdMatch ? jobIdMatch[1] : undefined
  const isJobContext = !!jobId && jobId !== 'page.tsx'

  const jobBase = jobId ? `/skeleton/jobs/${jobId}` : undefined

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="flex items-center h-14 px-4">
        {/* ── Logo ── */}
        <Link href="/skeleton" className="flex items-center gap-2 mr-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-stone-600 to-stone-800 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-foreground">RossOS</span>
        </Link>

        {/* ── Main Navigation ── */}
        <nav className="flex items-center gap-1">
          {isJobContext ? (
            <>
              {/* Job context: Overview, Property + Phase dropdowns */}
              <NavItemList items={jobNav} jobBase={jobBase} />
              <div className="h-6 w-px bg-border mx-2" />
              <NavItemList items={jobPhaseNav} jobBase={jobBase} />
            </>
          ) : (
            <>
              {/* Company context: Dashboard, Sales, Jobs + Operations, Financial */}
              <NavItemList items={companyNav} />
              <div className="h-6 w-px bg-border mx-2" />
              <NavItemList items={companyJobNav} />
            </>
          )}
        </nav>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Utility zone ── */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <div className="relative mr-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-48 pl-9 pr-4 py-1.5 text-sm border border-border rounded-lg bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent focus:bg-background"
            />
          </div>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Settings mega-menu (consolidates Directory, Library, Platform, Settings) */}
          <SettingsMegaMenu />

          {/* User avatar / account menu */}
          <AccountDropdown />

          {/* Skeleton mode badge */}
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full ml-2">
            Skeleton
          </span>
        </div>
      </div>
    </header>
  )
}
