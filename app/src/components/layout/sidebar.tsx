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
              'w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
              isOpen ? 'text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            <span className="flex items-center gap-3">
              <item.icon className={cn('h-5 w-5', isOpen ? 'text-primary' : 'text-muted-foreground')} />
              {item.name}
            </span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {isOpen && (
            <div className="ml-9 mt-1 space-y-1 border-l border-border/50 pl-2 py-1">
              {item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    'block px-3 py-2 text-sm rounded-md transition-all',
                    isActive(child.href)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
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
          'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all',
          active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        )}
      >
        <item.icon className={cn('h-5 w-5', active ? 'text-primary' : 'text-muted-foreground')} />
        {item.name}
      </Link>
    )
  }

  return (
    <aside className="w-64 bg-card border-r border-border/40 flex flex-col z-20 shadow-sm">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border/40">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold text-foreground tracking-tight">Ross Built</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Construction</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navigation.map((item) => (
          <NavLink key={item.name} item={item} />
        ))}
      </nav>

      {/* Bottom navigation */}
      <div className="p-3 border-t border-border/40 space-y-1">
        {bottomNav.map((item) => (
          <NavLink key={item.name} item={item} />
        ))}
      </div>

      {/* User info */}
      {user && (
        <div className="p-4 border-t border-border/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="text-sm font-semibold text-primary">
                {user.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
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
