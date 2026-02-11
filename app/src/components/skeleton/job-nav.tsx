'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  DollarSign,
  Calendar,
  FileText,
  Camera,
  FolderOpen,
  Palette,
  ShoppingCart,
  Receipt,
  CreditCard,
  FileQuestion,
  ClipboardCheck,
  CheckSquare,
  FileKey,
  Search as SearchIcon,
  FileCheck,
  Users,
  MessageSquare,
  Shield,
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react'

interface JobNavItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: string
}

const jobNavItems: JobNavItem[] = [
  { name: 'Overview', href: '', icon: LayoutDashboard },
  { name: 'Budget', href: '/budget', icon: DollarSign },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Daily Logs', href: '/daily-logs', icon: FileText },
  { name: 'Photos', href: '/photos', icon: Camera },
  { name: 'Documents', href: '/files', icon: FolderOpen },
  { name: 'Selections', href: '/selections', icon: Palette, badge: '3' },
  { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Draws', href: '/draws', icon: CreditCard },
  { name: 'Change Orders', href: '/change-orders', icon: AlertTriangle },
  { name: 'RFIs', href: '/rfis', icon: FileQuestion },
  { name: 'Submittals', href: '/submittals', icon: ClipboardCheck },
  { name: 'Punch List', href: '/punch-list', icon: CheckSquare },
  { name: 'Permits', href: '/permits', icon: FileKey },
  { name: 'Inspections', href: '/inspections', icon: SearchIcon },
  { name: 'Lien Waivers', href: '/lien-waivers', icon: FileCheck },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Communications', href: '/communications', icon: MessageSquare },
  { name: 'Warranties', href: '/warranties', icon: Shield },
]

// Mock job data - in real app this would come from context/API
const mockJob = {
  id: 'smith-residence',
  name: 'Smith Residence',
  client: 'John & Sarah Smith',
  address: '123 Oceanfront Drive',
  status: 'In Progress',
  percentComplete: 65,
  contractValue: 2450000,
  health: 'good' as const,
}

export function JobNav() {
  const pathname = usePathname()
  const params = useParams()
  const jobId = params.id as string

  const baseUrl = `/skeleton/jobs/${jobId}`

  // Determine which nav item is active
  const getIsActive = (item: JobNavItem) => {
    if (item.href === '') {
      return pathname === baseUrl || pathname === baseUrl + '/'
    }
    return pathname === baseUrl + item.href || pathname.startsWith(baseUrl + item.href + '/')
  }

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Job Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/skeleton/jobs"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Jobs
            </Link>

            <div className="h-6 w-px bg-gray-200" />

            <div>
              <h1 className="font-semibold text-gray-900">{mockJob.name}</h1>
              <p className="text-sm text-gray-500">{mockJob.client} • {mockJob.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${mockJob.percentComplete}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">{mockJob.percentComplete}%</span>
            </div>

            {/* Status */}
            <span className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              mockJob.health === 'good' && 'bg-green-100 text-green-700',
              mockJob.health === 'warning' && 'bg-yellow-100 text-yellow-700',
              mockJob.health === 'critical' && 'bg-red-100 text-red-700',
            )}>
              {mockJob.status}
            </span>

            {/* Contract Value */}
            <span className="text-sm font-medium text-gray-700">
              ${(mockJob.contractValue / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>
      </div>

      {/* Job Navigation Tabs */}
      <div className="px-4 overflow-x-auto">
        <nav className="flex items-center gap-1 py-2">
          {jobNavItems.map((item) => {
            const isActive = getIsActive(item)
            return (
              <Link
                key={item.name}
                href={baseUrl + item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
