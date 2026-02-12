'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Building2,
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Receipt,
  ClipboardList,
  Calendar,
  Camera,
  FolderOpen,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  HardHat,
  Wrench,
  DollarSign,
  CheckSquare,
  Shield,
} from 'lucide-react'

interface SidebarProps {
  user: {
    name: string
    role: string
    companies?: {
      name: string
    }
  } | null
}

interface NavItem {
  name: string
  href?: string
  icon: React.ElementType
  children?: { name: string; href: string }[]
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  {
    name: 'Pre-Construction',
    icon: HardHat,
    children: [
      { name: 'Leads', href: '/leads' },
      { name: 'Estimates', href: '/estimates' },
      { name: 'Proposals', href: '/proposals' },
    ],
  },
  {
    name: 'Financial',
    icon: DollarSign,
    children: [
      { name: 'Invoices', href: '/invoices' },
      { name: 'Purchase Orders', href: '/purchase-orders' },
      { name: 'Draws', href: '/draws' },
      { name: 'Change Orders', href: '/change-orders' },
    ],
  },
  {
    name: 'Field',
    icon: Wrench,
    children: [
      { name: 'Schedule', href: '/schedule' },
      { name: 'Daily Logs', href: '/daily-logs' },
      { name: 'Photos', href: '/photos' },
    ],
  },
  {
    name: 'Closeout',
    icon: CheckSquare,
    children: [
      { name: 'Punch Lists', href: '/punch-lists' },
      { name: 'Warranties', href: '/warranties' },
      { name: 'Final Docs', href: '/final-docs' },
    ],
  },
  {
    name: 'Directory',
    icon: Users,
    children: [
      { name: 'Vendors', href: '/vendors' },
      { name: 'Clients', href: '/clients' },
      { name: 'Cost Codes', href: '/cost-codes' },
    ],
  },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Files', href: '/files', icon: FolderOpen },
]

const bottomNav: NavItem[] = [
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>(['Financial', 'Field'])

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const NavLink = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
    const hasChildren = item.children && item.children.length > 0
    const isOpen = openMenus.includes(item.name)
    const active = item.href ? isActive(item.href) : false

    if (hasChildren) {
      return (
        <div>
          <button
            onClick={() => toggleMenu(item.name)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors',
              'text-sidebar-foreground hover:bg-sidebar-accent'
            )}
          >
            <span className="flex items-center gap-3">
              <item.icon className="h-5 w-5 text-muted-foreground" />
              {item.name}
            </span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {isOpen && (
            <div className="ml-8 mt-1 space-y-1">
              {item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    'block px-3 py-2 text-sm rounded-md transition-colors',
                    isActive(child.href)
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-sidebar-accent'
                  )}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        href={item.href!}
        className={cn(
          'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
          active
            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
            : 'text-sidebar-foreground hover:bg-sidebar-accent'
        )}
      >
        <item.icon className={cn('h-5 w-5', active ? 'text-sidebar-primary' : 'text-muted-foreground')} />
        {item.name}
      </Link>
    )
  }

  return (
    <aside className="w-64 bg-sidebar-background border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold text-sidebar-foreground">Ross Built</div>
            <div className="text-xs text-muted-foreground">Construction CMS</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navigation.map((item) => (
          <NavLink key={item.name} item={item} />
        ))}
      </nav>

      {/* Bottom navigation */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {bottomNav.map((item) => (
          <NavLink key={item.name} item={item} />
        ))}
      </div>

      {/* User info */}
      {user && (
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">
                {user.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-sidebar-foreground truncate">
                {user.name}
              </div>
              <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
