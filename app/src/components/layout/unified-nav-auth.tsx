'use client'

import { useState, useRef, useEffect } from 'react'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import {
  ChevronDown,
  Building2,
  Search,
  Settings,
  LogOut,
  User,
  Menu,
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
import { CommandPalette } from '@/components/command-palette/command-palette'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { TenantSwitcher } from '@/components/layout/TenantSwitcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

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
        aria-haspopup="true"
        aria-expanded={isOpen}
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

      {isOpen ? (
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
      ) : null}
    </div>
  )
}

// ── Direct link nav item ──────────────────────────────────────

function NavLink({ item, resolvedHref }: { item: NavItem; resolvedHref: string }) {
  const pathname = usePathname()

  const isActive =
    resolvedHref === '/dashboard'
      ? pathname === '/dashboard'
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
    // "← Company" link goes back to /jobs (absolute path)
    if (href === '/jobs') return href
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
            resolvedHref={resolveHref(item.href ?? '/dashboard')}
          />
        )
      })}
    </>
  )
}

// ── Settings mega-menu ──────────────────────────────────────

function SettingsMegaMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

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
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Settings & More"
        className={cn(
          'p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors',
          isActive && 'bg-accent text-foreground'
        )}
        title="Settings & More"
      >
        <Settings className="h-5 w-5" />
      </button>

      {isOpen ? (
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
      ) : null}
    </div>
  )
}

// ── Main unified nav (authenticated) ────────────────────────

interface UnifiedNavAuthProps {
  user: {
    name: string
    email?: string
    role: string
  } | null
}

export function UnifiedNavAuth({ user }: UnifiedNavAuthProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Detect job context from path
  const jobIdMatch = pathname.match(/\/jobs\/([^/]+)/)
  const jobId = jobIdMatch ? jobIdMatch[1] : undefined
  const isJobContext = !!jobId

  const jobBase = jobId ? `/jobs/${jobId}` : undefined

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-card border-b border-border/40 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center h-14 px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 mr-4">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground hidden lg:inline">RossOS</span>
        </Link>

        {/* Main Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {isJobContext ? (
            <>
              <NavItemList items={jobNav} jobBase={jobBase} />
              <div className="h-6 w-px bg-border mx-2" />
              <NavItemList items={jobPhaseNav} jobBase={jobBase} />
            </>
          ) : (
            <>
              <NavItemList items={companyNav} />
              <div className="h-6 w-px bg-border mx-2" />
              <NavItemList items={companyJobNav} />
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('open-mobile-sidebar'))}
          className="md:hidden p-2 rounded-md hover:bg-accent text-muted-foreground"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Utility zone */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/60 hover:bg-muted rounded-lg border border-transparent hover:border-border transition-all mr-2"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
            <span className="hidden lg:inline">Search...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground border">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
          <CommandPalette />

          {/* Tenant Switcher */}
          <TenantSwitcher />

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <NotificationBell />

          {/* Settings mega-menu */}
          {!isJobContext && <SettingsMegaMenu />}

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={cn(
                'flex items-center gap-2 p-1.5 hover:bg-accent rounded-lg ml-1 transition-colors',
                showUserMenu && 'bg-accent'
              )}
              aria-label="User menu"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-sm font-semibold text-primary">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </button>

            {showUserMenu ? (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                  onKeyDown={(e) => e.key === 'Escape' && setShowUserMenu(false)}
                  role="button"
                  tabIndex={-1}
                  aria-label="Close menu"
                />
                <div className="absolute right-0 mt-2 w-56 rounded-md bg-popover shadow-lg ring-1 ring-border z-20">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-border">
                      <div className="text-sm font-medium text-foreground">{user?.name}</div>
                      <div className="text-xs text-muted-foreground">{user?.email}</div>
                      <div className="text-xs text-muted-foreground capitalize mt-0.5">{user?.role}</div>
                    </div>
                    <Link
                      href="/settings/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
