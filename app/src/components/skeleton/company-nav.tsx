'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  Building2,
  Target,
  Database,
  Users,
  Briefcase,
  DollarSign,
  Shield,
  Settings,
  LayoutDashboard,
  Bell,
  Search,
  UserCircle,
} from 'lucide-react'

interface NavPage {
  name: string
  href: string
  description: string
}

interface NavCategory {
  name: string
  icon: React.ElementType
  pages: NavPage[]
}

// Company-level navigation - organized by business function
const navigation: NavCategory[] = [
  {
    name: 'Sales',
    icon: Target,
    pages: [
      { name: 'Leads', href: '/skeleton/leads', description: 'Pipeline, scoring, follow-ups' },
      { name: 'Estimates', href: '/skeleton/estimates', description: 'Selection-based pricing' },
      { name: 'Proposals', href: '/skeleton/proposals', description: 'Client presentations' },
      { name: 'Contracts', href: '/skeleton/contracts', description: 'E-signature, execution' },
    ],
  },
  {
    name: 'Library',
    icon: Database,
    pages: [
      { name: 'Selections Catalog', href: '/skeleton/library/selections', description: 'Products & materials' },
      { name: 'Assemblies', href: '/skeleton/library/assemblies', description: 'Estimate templates' },
      { name: 'Cost Codes', href: '/skeleton/library/cost-codes', description: 'Budget categories' },
      { name: 'Document Templates', href: '/skeleton/library/templates', description: 'Standard forms' },
    ],
  },
  {
    name: 'Directory',
    icon: Users,
    pages: [
      { name: 'Clients', href: '/skeleton/directory/clients', description: 'Client profiles & intelligence' },
      { name: 'Vendors', href: '/skeleton/directory/vendors', description: 'Subs & suppliers' },
      { name: 'Team', href: '/skeleton/directory/team', description: 'Employees & roles' },
      { name: 'Contacts', href: '/skeleton/directory/contacts', description: 'Other contacts' },
    ],
  },
  {
    name: 'Operations',
    icon: Briefcase,
    pages: [
      { name: 'Jobs', href: '/skeleton/jobs', description: 'All active projects' },
      { name: 'Calendar', href: '/skeleton/operations/calendar', description: 'Company-wide schedule' },
      { name: 'Crew Schedule', href: '/skeleton/operations/crew-schedule', description: 'Resource allocation' },
      { name: 'Equipment', href: '/skeleton/operations/equipment', description: 'Assets & tools' },
      { name: 'Deliveries', href: '/skeleton/operations/deliveries', description: 'Incoming materials' },
    ],
  },
  {
    name: 'Financial',
    icon: DollarSign,
    pages: [
      { name: 'Dashboard', href: '/skeleton/financial/dashboard', description: 'Financial overview' },
      { name: 'Accounts Receivable', href: '/skeleton/financial/receivables', description: 'Client balances' },
      { name: 'Accounts Payable', href: '/skeleton/financial/payables', description: 'Vendor balances' },
      { name: 'Cash Flow', href: '/skeleton/financial/cash-flow', description: 'Forecasting' },
      { name: 'Job Profitability', href: '/skeleton/financial/profitability', description: 'Margin analysis' },
      { name: 'Reports', href: '/skeleton/financial/reports', description: 'Financial reports' },
    ],
  },
  {
    name: 'Compliance',
    icon: Shield,
    pages: [
      { name: 'Insurance', href: '/skeleton/compliance/insurance', description: 'COIs & policies' },
      { name: 'Licenses', href: '/skeleton/compliance/licenses', description: 'Contractor licenses' },
      { name: 'Safety', href: '/skeleton/compliance/safety', description: 'OSHA & incidents' },
    ],
  },
  {
    name: 'Company',
    icon: Settings,
    pages: [
      { name: 'Settings', href: '/skeleton/company/settings', description: 'Configuration' },
      { name: 'Integrations', href: '/skeleton/company/integrations', description: 'QuickBooks, Stripe' },
      { name: 'Dashboards', href: '/skeleton/company/dashboards', description: 'Custom views' },
      { name: 'Email Marketing', href: '/skeleton/company/email-marketing', description: 'Client outreach' },
    ],
  },
]

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

export function CompanyNav() {
  const pathname = usePathname()

  // Check if we're in a job context
  const isInJobContext = pathname.includes('/skeleton/jobs/') && pathname !== '/skeleton/jobs'

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <Link href="/skeleton" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">RossOS</span>
          </Link>

          <div className="h-6 w-px bg-gray-200" />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs, clients, vendors..."
              className="w-64 pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Context indicator */}
          {isInJobContext ? (
            <Link
              href="/skeleton/jobs"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              ← Back to Company
            </Link>
          ) : (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Company View
            </span>
          )}

          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          <button className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg">
            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
              <UserCircle className="h-5 w-5 text-gray-600" />
            </div>
          </button>

          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
            Skeleton Mode
          </span>
        </div>
      </div>

      {/* Navigation dropdowns - only show in company context */}
      {!isInJobContext && (
        <div className="flex items-center gap-1 px-4 py-2 overflow-visible">
          <Link
            href="/skeleton"
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              pathname === '/skeleton'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          {navigation.map((category) => (
            <NavDropdown key={category.name} category={category} />
          ))}
        </div>
      )}
    </header>
  )
}
