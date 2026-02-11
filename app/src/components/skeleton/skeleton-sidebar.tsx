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
  UserCircle,
  Truck,
  Clock,
  Mail,
  PieChart,
  Plug,
  FileCheck,
  Shield,
  CreditCard,
  MessageSquare,
  ListTodo,
  Send,
  Bell,
} from 'lucide-react'

interface NavItem {
  name: string
  href?: string
  icon: React.ElementType
  phase?: string
  children?: { name: string; href: string; phase?: string }[]
}

// Construction workflow-based navigation
const navigation: NavItem[] = [
  {
    name: 'Overview',
    href: '/skeleton',
    icon: LayoutDashboard,
    phase: 'All Phases'
  },

  // Pre-Construction (Phase 0)
  {
    name: '1. Pre-Construction',
    icon: HardHat,
    phase: 'Phase 0',
    children: [
      { name: 'Leads Pipeline', href: '/skeleton/leads', phase: 'Phase 0' },
      { name: 'Lead Create', href: '/skeleton/leads/create', phase: 'Phase 0' },
      { name: 'Lead Detail', href: '/skeleton/leads/example', phase: 'Phase 0' },
      { name: 'Estimates', href: '/skeleton/estimates', phase: 'Phase 0' },
      { name: 'Estimate Editor', href: '/skeleton/estimates/editor', phase: 'Phase 0' },
      { name: 'Proposals', href: '/skeleton/proposals', phase: 'Phase 0' },
      { name: 'Contracts', href: '/skeleton/contracts', phase: 'Phase 0' },
    ],
  },

  // Jobs & Execution (Phase 0)
  {
    name: '2. Job Execution',
    icon: Briefcase,
    phase: 'Phase 0',
    children: [
      { name: 'Jobs List', href: '/skeleton/jobs', phase: 'Phase 0' },
      { name: 'Job Create', href: '/skeleton/jobs/create', phase: 'Phase 0' },
      { name: 'Job Dashboard', href: '/skeleton/jobs/example', phase: 'Phase 0' },
      { name: 'Budget', href: '/skeleton/jobs/example/budget', phase: 'Phase 0' },
      { name: 'Schedule', href: '/skeleton/jobs/example/schedule', phase: 'Phase 0' },
      { name: 'Daily Logs', href: '/skeleton/jobs/example/daily-logs', phase: 'Phase 0' },
      { name: 'Photos', href: '/skeleton/jobs/example/photos', phase: 'Phase 0' },
      { name: 'Files & Docs', href: '/skeleton/jobs/example/files', phase: 'Phase 0' },
    ],
  },

  // Financial (Phase 0)
  {
    name: '3. Financial',
    icon: DollarSign,
    phase: 'Phase 0',
    children: [
      { name: 'Invoices', href: '/skeleton/invoices', phase: 'Phase 0' },
      { name: 'Invoice Detail', href: '/skeleton/invoices/example', phase: 'Phase 0' },
      { name: 'Purchase Orders', href: '/skeleton/purchase-orders', phase: 'Phase 0' },
      { name: 'PO Detail', href: '/skeleton/purchase-orders/example', phase: 'Phase 0' },
      { name: 'Draws', href: '/skeleton/draws', phase: 'Phase 0' },
      { name: 'Draw Builder', href: '/skeleton/draws/builder', phase: 'Phase 0' },
      { name: 'Cost of Sales', href: '/skeleton/cost-of-sales', phase: 'Phase 0' },
      { name: 'Reports Hub', href: '/skeleton/reports', phase: 'Phase 0' },
    ],
  },

  // Directory (Phase 0)
  {
    name: '4. Directory',
    icon: Users,
    phase: 'Phase 0',
    children: [
      { name: 'Vendors', href: '/skeleton/vendors', phase: 'Phase 0' },
      { name: 'Vendor Detail', href: '/skeleton/vendors/example', phase: 'Phase 0' },
      { name: 'Clients', href: '/skeleton/clients', phase: 'Phase 0' },
      { name: 'Client Detail', href: '/skeleton/clients/example', phase: 'Phase 0' },
      { name: 'Cost Codes', href: '/skeleton/cost-codes', phase: 'Phase 0' },
    ],
  },

  // Closeout (Phase 0)
  {
    name: '5. Closeout',
    icon: CheckSquare,
    phase: 'Phase 0',
    children: [
      { name: 'Punch Lists', href: '/skeleton/punch-lists', phase: 'Phase 0' },
      { name: 'Final Documents', href: '/skeleton/final-docs', phase: 'Phase 0' },
      { name: 'Warranties', href: '/skeleton/warranties', phase: 'Phase 0' },
    ],
  },

  // Client Portal (Phase 0)
  {
    name: '6. Client Portal',
    icon: UserCircle,
    phase: 'Phase 0',
    children: [
      { name: 'Portal Dashboard', href: '/skeleton/portal', phase: 'Phase 0' },
      { name: 'Project View', href: '/skeleton/portal/project', phase: 'Phase 0' },
      { name: 'Selections', href: '/skeleton/portal/selections', phase: 'Phase 0' },
      { name: 'Documents', href: '/skeleton/portal/documents', phase: 'Phase 0' },
      { name: 'Payments', href: '/skeleton/portal/payments', phase: 'Phase 0' },
    ],
  },

  // Tasks & Communication (Phase 1)
  {
    name: '7. Tasks & Comms',
    icon: MessageSquare,
    phase: 'Phase 1',
    children: [
      { name: 'Todo Lists', href: '/skeleton/todos', phase: 'Phase 1' },
      { name: 'Task Board', href: '/skeleton/todos/board', phase: 'Phase 1' },
      { name: 'Comments', href: '/skeleton/comments', phase: 'Phase 1' },
      { name: 'Notifications', href: '/skeleton/notifications', phase: 'Phase 1' },
    ],
  },

  // Vendor Portal & Bids (Phase 2)
  {
    name: '8. Vendor Collab',
    icon: Truck,
    phase: 'Phase 2',
    children: [
      { name: 'Bid Requests', href: '/skeleton/bids', phase: 'Phase 2' },
      { name: 'Bid Comparison', href: '/skeleton/bids/compare', phase: 'Phase 2' },
      { name: 'Vendor Portal', href: '/skeleton/vendor-portal', phase: 'Phase 2' },
      { name: 'Vendor Dashboard', href: '/skeleton/vendor-portal/dashboard', phase: 'Phase 2' },
    ],
  },

  // Advanced PM (Phase 3)
  {
    name: '9. Advanced PM',
    icon: FileCheck,
    phase: 'Phase 3',
    children: [
      { name: 'RFIs', href: '/skeleton/rfis', phase: 'Phase 3' },
      { name: 'Submittals', href: '/skeleton/submittals', phase: 'Phase 3' },
      { name: 'Templates', href: '/skeleton/templates', phase: 'Phase 3' },
      { name: 'Assemblies', href: '/skeleton/templates/assemblies', phase: 'Phase 3' },
    ],
  },

  // Time & Payments (Phase 4)
  {
    name: '10. Time & Pay',
    icon: Clock,
    phase: 'Phase 4',
    children: [
      { name: 'Time Clock', href: '/skeleton/time-clock', phase: 'Phase 4' },
      { name: 'Time Entries', href: '/skeleton/time-clock/entries', phase: 'Phase 4' },
      { name: 'Online Payments', href: '/skeleton/payments', phase: 'Phase 4' },
      { name: 'Payment Links', href: '/skeleton/payments/links', phase: 'Phase 4' },
    ],
  },

  // Enhanced Portals (Phase 5)
  {
    name: '11. Warranty & Portal',
    icon: Shield,
    phase: 'Phase 5',
    children: [
      { name: 'Warranty Claims', href: '/skeleton/warranty-claims', phase: 'Phase 5' },
      { name: 'Claim Detail', href: '/skeleton/warranty-claims/example', phase: 'Phase 5' },
      { name: 'Enhanced Portal', href: '/skeleton/client-portal-v2', phase: 'Phase 5' },
    ],
  },

  // Advanced Features (Phase 6)
  {
    name: '12. Advanced',
    icon: PieChart,
    phase: 'Phase 6',
    children: [
      { name: 'Email Marketing', href: '/skeleton/email-marketing', phase: 'Phase 6' },
      { name: 'Campaigns', href: '/skeleton/email-marketing/campaigns', phase: 'Phase 6' },
      { name: 'Custom Dashboards', href: '/skeleton/dashboards', phase: 'Phase 6' },
      { name: 'Dashboard Builder', href: '/skeleton/dashboards/builder', phase: 'Phase 6' },
    ],
  },
]

const settingsNav: NavItem[] = [
  {
    name: 'Settings & Integration',
    icon: Settings,
    phase: 'Phase 0+',
    children: [
      { name: 'Global Settings', href: '/skeleton/settings', phase: 'Phase 0' },
      { name: 'QuickBooks', href: '/skeleton/settings/quickbooks', phase: 'Phase 0' },
      { name: 'Integrations Hub', href: '/skeleton/settings/integrations', phase: 'Phase 6' },
    ],
  },
]

export function SkeletonSidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>([
    '1. Pre-Construction',
    '2. Job Execution',
    '3. Financial',
  ])

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const getPhaseColor = (phase?: string) => {
    if (!phase) return 'bg-gray-100 text-gray-600'
    if (phase === 'Phase 0') return 'bg-blue-100 text-blue-700'
    if (phase === 'Phase 1') return 'bg-green-100 text-green-700'
    if (phase === 'Phase 2') return 'bg-purple-100 text-purple-700'
    if (phase === 'Phase 3') return 'bg-orange-100 text-orange-700'
    if (phase === 'Phase 4') return 'bg-pink-100 text-pink-700'
    if (phase === 'Phase 5') return 'bg-cyan-100 text-cyan-700'
    if (phase === 'Phase 6') return 'bg-yellow-100 text-yellow-700'
    return 'bg-gray-100 text-gray-600'
  }

  const NavLink = ({ item }: { item: NavItem }) => {
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
              'text-gray-700 hover:bg-gray-100'
            )}
          >
            <span className="flex items-center gap-2">
              <item.icon className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{item.name}</span>
            </span>
            <div className="flex items-center gap-2">
              <span className={cn('text-[10px] px-1.5 py-0.5 rounded', getPhaseColor(item.phase))}>
                {item.phase}
              </span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </button>
          {isOpen && (
            <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-gray-100 pl-2">
              {item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    'block px-3 py-1.5 text-sm rounded-md transition-colors',
                    isActive(child.href)
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
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
          'flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-md transition-colors',
          active
            ? 'bg-blue-50 text-blue-700 font-medium'
            : 'text-gray-700 hover:bg-gray-100'
        )}
      >
        <span className="flex items-center gap-2">
          <item.icon className={cn('h-4 w-4', active ? 'text-blue-600' : 'text-gray-500')} />
          {item.name}
        </span>
        {item.phase && (
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded', getPhaseColor(item.phase))}>
            {item.phase}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200 flex-shrink-0">
        <Link href="/skeleton" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Ross Built CMS</div>
            <div className="text-xs text-gray-500">Skeleton Preview</div>
          </div>
        </Link>
      </div>

      {/* Phase Legend */}
      <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="text-xs font-medium text-gray-500 mb-2">IMPLEMENTATION PHASES</div>
        <div className="flex flex-wrap gap-1">
          {['Phase 0', 'Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Phase 6'].map((phase) => (
            <span key={phase} className={cn('text-[10px] px-1.5 py-0.5 rounded', getPhaseColor(phase))}>
              {phase}
            </span>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="text-xs font-medium text-gray-400 uppercase px-3 py-2">
          Construction Workflow
        </div>
        {navigation.map((item) => (
          <NavLink key={item.name} item={item} />
        ))}

        <div className="pt-4 mt-4 border-t border-gray-100">
          <div className="text-xs font-medium text-gray-400 uppercase px-3 py-2">
            Configuration
          </div>
          {settingsNav.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </div>
      </nav>

      {/* Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="text-xs text-gray-500 mb-2">Total Views: 112</div>
        <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
          <div className="bg-blue-100 text-blue-700 rounded px-1 py-0.5">P0: 68</div>
          <div className="bg-green-100 text-green-700 rounded px-1 py-0.5">P1: 8</div>
          <div className="bg-purple-100 text-purple-700 rounded px-1 py-0.5">P2: 10</div>
          <div className="bg-orange-100 text-orange-700 rounded px-1 py-0.5">P3: 8</div>
        </div>
        <div className="grid grid-cols-3 gap-1 text-center text-[10px] mt-1">
          <div className="bg-pink-100 text-pink-700 rounded px-1 py-0.5">P4: 6</div>
          <div className="bg-cyan-100 text-cyan-700 rounded px-1 py-0.5">P5: 6</div>
          <div className="bg-yellow-100 text-yellow-700 rounded px-1 py-0.5">P6: 6</div>
        </div>
      </div>
    </aside>
  )
}
