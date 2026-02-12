'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  LayoutDashboard,
  Home,
  Palette,
  FileEdit,
  Calendar,
  ClipboardList,
  Camera,
  FileCheck,
  ClipboardCheck,
  DollarSign,
  ShoppingCart,
  Receipt,
  Landmark,
  FileWarning,
  FolderOpen,
  MessageSquare,
  HelpCircle,
  FileBox,
  Users,
  CheckSquare,
  Shield,
  BarChart3,
} from 'lucide-react'

// Mock job data - in real app would come from context/API
const mockJobs: Record<string, { name: string; client: string; address: string }> = {
  '1': { name: 'Smith Residence', client: 'John & Sarah Smith', address: '123 Ocean Blvd' },
  '2': { name: 'Johnson Beach House', client: 'Mike Johnson', address: '456 Gulf Dr' },
  '3': { name: 'Davis Coastal Home', client: 'Tom & Lisa Davis', address: '789 Bay View' },
}

interface JobNavItem {
  name: string
  href: string
  icon: React.ElementType
}

interface JobNavSection {
  title: string
  items: JobNavItem[]
}

const jobSidebarNav: JobNavSection[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '', icon: LayoutDashboard },
      { name: 'Property', href: '/property', icon: Home },
    ],
  },
  {
    title: 'Pre-Construction',
    items: [
      { name: 'Selections', href: '/selections', icon: Palette },
      { name: 'Change Orders', href: '/change-orders', icon: FileEdit },
    ],
  },
  {
    title: 'Field',
    items: [
      { name: 'Schedule', href: '/schedule', icon: Calendar },
      { name: 'Daily Logs', href: '/daily-logs', icon: ClipboardList },
      { name: 'Photos', href: '/photos', icon: Camera },
      { name: 'Permits', href: '/permits', icon: FileCheck },
      { name: 'Inspections', href: '/inspections', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Financial',
    items: [
      { name: 'Budget', href: '/budget', icon: DollarSign },
      { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
      { name: 'Invoices', href: '/invoices', icon: Receipt },
      { name: 'Draws', href: '/draws', icon: Landmark },
      { name: 'Lien Waivers', href: '/lien-waivers', icon: FileWarning },
    ],
  },
  {
    title: 'Documents',
    items: [
      { name: 'Files', href: '/files', icon: FolderOpen },
      { name: 'RFIs', href: '/rfis', icon: HelpCircle },
      { name: 'Submittals', href: '/submittals', icon: FileBox },
      { name: 'Communications', href: '/communications', icon: MessageSquare },
      { name: 'Team', href: '/team', icon: Users },
    ],
  },
  {
    title: 'Closeout',
    items: [
      { name: 'Punch List', href: '/punch-list', icon: CheckSquare },
      { name: 'Warranties', href: '/warranties', icon: Shield },
    ],
  },
  {
    title: 'Reports',
    items: [
      { name: 'Job Reports', href: '/reports', icon: BarChart3 },
    ],
  },
]

export function JobSidebar() {
  const pathname = usePathname()
  const params = useParams()
  const jobId = params.id as string
  const jobBase = `/skeleton/jobs/${jobId}`

  // Get job info from mock data
  const job = mockJobs[jobId] || { name: `Job ${jobId}`, client: 'Client', address: 'Address' }

  const isActive = (href: string) => {
    const fullPath = jobBase + href
    if (href === '') {
      return pathname === jobBase || pathname === jobBase + '/'
    }
    return pathname === fullPath || pathname.startsWith(fullPath + '/')
  }

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Back to Jobs */}
      <div className="p-4 border-b border-border">
        <Link
          href="/skeleton/jobs"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
      </div>

      {/* Job Info */}
      <div className="p-4 border-b border-border bg-muted/50">
        <h2 className="font-semibold text-foreground truncate">{job.name}</h2>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{job.client}</p>
        <p className="text-xs text-muted-foreground truncate">{job.address}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {jobSidebarNav.map((section) => (
          <div key={section.title} className="mb-4">
            <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={jobBase + item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
                    isActive(item.href)
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
