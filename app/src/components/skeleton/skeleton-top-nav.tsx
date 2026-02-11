'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  Building2,
  HardHat,
  Briefcase,
  DollarSign,
  Users,
  CheckSquare,
  UserCircle,
  MessageSquare,
  Truck,
  FileCheck,
  Clock,
  Shield,
  PieChart,
  Settings,
  LayoutDashboard,
  Database,
} from 'lucide-react'

interface NavPage {
  name: string
  href: string
  description: string
}

interface NavCategory {
  name: string
  icon: React.ElementType
  phase: string
  pages: NavPage[]
}

// Consolidated navigation - each major function is ONE page
// Detail/create/edit handled via panels/modals within each page
const navigation: NavCategory[] = [
  {
    name: 'Pre-Construction',
    icon: HardHat,
    phase: 'Phase 0',
    pages: [
      { name: 'Leads', href: '/skeleton/leads', description: 'Pipeline with AI scoring, detail panels, quick-add' },
      { name: 'Estimates', href: '/skeleton/estimates', description: 'Selection-based estimates with catalog pricing' },
      { name: 'Proposals', href: '/skeleton/proposals', description: 'Generate and send proposals from estimates' },
      { name: 'Contracts', href: '/skeleton/contracts', description: 'Contract templates with e-signature' },
    ],
  },
  {
    name: 'Catalog',
    icon: Database,
    phase: 'Phase 0',
    pages: [
      { name: 'Selections', href: '/skeleton/selections-catalog', description: 'Product/material library with pricing tiers' },
      { name: 'Assemblies', href: '/skeleton/templates', description: 'Reusable estimate templates and bundles' },
      { name: 'Cost Codes', href: '/skeleton/cost-codes', description: 'Cost code library and hierarchy' },
    ],
  },
  {
    name: 'Jobs',
    icon: Briefcase,
    phase: 'Phase 0',
    pages: [
      { name: 'Jobs', href: '/skeleton/jobs', description: 'All jobs with dashboard drill-down' },
      { name: 'Budget', href: '/skeleton/jobs/example/budget', description: 'Real-time budget tracking per job' },
      { name: 'Schedule', href: '/skeleton/jobs/example/schedule', description: 'Gantt chart with weather/tide' },
      { name: 'Daily Logs', href: '/skeleton/jobs/example/daily-logs', description: 'Voice-to-text field updates' },
      { name: 'Photos', href: '/skeleton/jobs/example/photos', description: 'AI-curated photo gallery' },
      { name: 'Files', href: '/skeleton/jobs/example/files', description: 'Document management' },
    ],
  },
  {
    name: 'Financial',
    icon: DollarSign,
    phase: 'Phase 0',
    pages: [
      { name: 'Invoices', href: '/skeleton/invoices', description: 'OCR processing with detail panels' },
      { name: 'Purchase Orders', href: '/skeleton/purchase-orders', description: 'PO management with vendor intelligence' },
      { name: 'Draws', href: '/skeleton/draws', description: 'Draw requests with builder interface' },
      { name: 'Reports', href: '/skeleton/reports', description: 'AI-powered reporting hub' },
    ],
  },
  {
    name: 'Directory',
    icon: Users,
    phase: 'Phase 0',
    pages: [
      { name: 'Vendors', href: '/skeleton/vendors', description: 'Vendor profiles with scorecards' },
      { name: 'Clients', href: '/skeleton/clients', description: 'Client intelligence profiles' },
    ],
  },
  {
    name: 'Closeout',
    icon: CheckSquare,
    phase: 'Phase 0',
    pages: [
      { name: 'Punch Lists', href: '/skeleton/punch-lists', description: 'Final punch tracking' },
      { name: 'Warranties', href: '/skeleton/warranties', description: 'Warranty tracking and claims' },
    ],
  },
  {
    name: 'Client Portal',
    icon: UserCircle,
    phase: 'Phase 0',
    pages: [
      { name: 'Portal', href: '/skeleton/portal', description: 'Client-facing dashboard with selections' },
    ],
  },
  {
    name: 'Tasks',
    icon: MessageSquare,
    phase: 'Phase 1',
    pages: [
      { name: 'Todos', href: '/skeleton/todos', description: 'Team task management and board view' },
      { name: 'Notifications', href: '/skeleton/notifications', description: 'Alert center' },
    ],
  },
  {
    name: 'Vendor Collab',
    icon: Truck,
    phase: 'Phase 2',
    pages: [
      { name: 'Bids', href: '/skeleton/bids', description: 'Bid requests with comparison tools' },
      { name: 'Vendor Portal', href: '/skeleton/vendor-portal', description: 'Vendor-facing portal' },
    ],
  },
  {
    name: 'Advanced PM',
    icon: FileCheck,
    phase: 'Phase 3',
    pages: [
      { name: 'RFIs', href: '/skeleton/rfis', description: 'RFI tracking with similar search' },
      { name: 'Submittals', href: '/skeleton/submittals', description: 'Submittal tracking' },
    ],
  },
  {
    name: 'Time & Pay',
    icon: Clock,
    phase: 'Phase 4',
    pages: [
      { name: 'Time Clock', href: '/skeleton/time-clock', description: 'Employee time tracking' },
      { name: 'Payments', href: '/skeleton/payments', description: 'Online payment processing' },
    ],
  },
  {
    name: 'Warranty',
    icon: Shield,
    phase: 'Phase 5',
    pages: [
      { name: 'Warranty Claims', href: '/skeleton/warranty-claims', description: 'Post-completion service' },
    ],
  },
  {
    name: 'Advanced',
    icon: PieChart,
    phase: 'Phase 6',
    pages: [
      { name: 'Email Marketing', href: '/skeleton/email-marketing', description: 'Client outreach' },
      { name: 'Dashboards', href: '/skeleton/dashboards', description: 'Custom dashboard builder' },
    ],
  },
  {
    name: 'Settings',
    icon: Settings,
    phase: 'All',
    pages: [
      { name: 'Settings', href: '/skeleton/settings', description: 'System and integration settings' },
    ],
  },
]

const phaseColors: Record<string, string> = {
  'Phase 0': 'bg-blue-100 text-blue-700',
  'Phase 1': 'bg-green-100 text-green-700',
  'Phase 2': 'bg-purple-100 text-purple-700',
  'Phase 3': 'bg-orange-100 text-orange-700',
  'Phase 4': 'bg-pink-100 text-pink-700',
  'Phase 5': 'bg-cyan-100 text-cyan-700',
  'Phase 6': 'bg-yellow-100 text-yellow-700',
  'All': 'bg-gray-100 text-gray-700',
}

function NavDropdown({ category }: { category: NavCategory }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const isActive = category.pages.some(p => pathname === p.href || pathname.startsWith(p.href + '/'))

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // If only one page in category, link directly
  if (category.pages.length === 1) {
    const page = category.pages[0]
    return (
      <Link
        href={page.href}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          pathname === page.href || pathname.startsWith(page.href + '/')
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        )}
      >
        <category.icon className="h-4 w-4" />
        <span>{category.name}</span>
      </Link>
    )
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        )}
      >
        <category.icon className="h-4 w-4" />
        <span>{category.name}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[100]">
          <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded', phaseColors[category.phase])}>
              {category.phase}
            </span>
          </div>
          {category.pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                'block px-3 py-2 mx-1 rounded-md transition-colors',
                pathname === page.href || pathname.startsWith(page.href + '/')
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50'
              )}
            >
              <div className="font-medium text-sm">{page.name}</div>
              <div className="text-xs text-gray-500">{page.description}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function SkeletonTopNav() {
  const pathname = usePathname()

  // Find current page info
  const currentPage = navigation
    .flatMap(cat => cat.pages.map(p => ({ ...p, category: cat.name, phase: cat.phase })))
    .find(p => pathname === p.href || pathname.startsWith(p.href + '/'))

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top bar with logo and current page */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <Link href="/skeleton" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">RossOS</span>
          </Link>

          <div className="h-6 w-px bg-gray-200" />

          <Link
            href="/skeleton"
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 text-sm rounded transition-colors',
              pathname === '/skeleton'
                ? 'text-blue-700 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {currentPage && (
            <div className="flex items-center gap-2 text-sm">
              <span className={cn('px-2 py-0.5 rounded text-xs font-medium', phaseColors[currentPage.phase])}>
                {currentPage.phase}
              </span>
              <span className="text-gray-500">{currentPage.category}</span>
              <span className="text-gray-300">/</span>
              <span className="font-medium text-gray-900">{currentPage.name}</span>
            </div>
          )}
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
            Skeleton Mode
          </span>
          <a href="/" className="text-sm text-blue-600 hover:text-blue-800">
            Exit Preview
          </a>
        </div>
      </div>

      {/* Navigation dropdowns */}
      <div className="flex items-center gap-1 px-4 py-2 overflow-visible">
        {navigation.map((category) => (
          <NavDropdown key={category.name} category={category} />
        ))}
      </div>
    </header>
  )
}
