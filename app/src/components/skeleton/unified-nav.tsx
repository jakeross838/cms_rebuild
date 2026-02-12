'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  Building2,
  Bell,
  Search,
  UserCircle,
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
    // "← Company" has an absolute href
    if (href.startsWith('/')) return href
    // empty string = job overview
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

// ── Main unified nav ──────────────────────────────────────────

export function UnifiedNav() {
  const pathname = usePathname()
  const params = useParams()

  const jobId = params.id as string | undefined
  const isJobContext =
    !!jobId && pathname.startsWith(`/skeleton/jobs/${jobId}`)

  const jobBase = jobId ? `/skeleton/jobs/${jobId}` : undefined

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="flex items-center h-14 px-4">
        {/* ── Logo ── */}
        <Link href="/skeleton" className="flex items-center gap-2 mr-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-foreground">RossOS</span>
        </Link>

        {/* ── Left zone ── */}
        <nav className="flex items-center gap-1">
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

        {/* ── Divider ── */}
        <div className="h-6 w-px bg-border mx-3" />

        {/* ── Right zone (support) ── */}
        <nav className="flex items-center gap-1">
          <NavItemList items={companyRightNav} />
        </nav>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Utility zone ── */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-48 pl-9 pr-4 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
          </button>

          {/* User avatar */}
          <button className="flex items-center gap-2 p-1.5 hover:bg-accent rounded-lg">
            <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
            </div>
          </button>

          {/* Skeleton mode badge */}
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
            Skeleton
          </span>
        </div>
      </div>
    </header>
  )
}
