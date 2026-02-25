import Link from 'next/link'

import {
  DollarSign,
  Calendar,
  FileText,
  ClipboardList,
  ShoppingCart,
  FolderOpen,
  ArrowLeft,
  Palette,
  Clock,
  Image,
  FileCheck,
  ClipboardCheck,
  Package,
  Send,
  MessageSquare,
  Users,
  Shield,
  CheckSquare,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'

const getJobTabs = (id: string) => [
  { name: 'Overview', href: `/jobs/${id}`, icon: FileText },
  { name: 'Selections', href: `/jobs/${id}/selections`, icon: Palette },
  { name: 'Budget', href: `/jobs/${id}/budget`, icon: DollarSign },
  { name: 'Schedule', href: `/jobs/${id}/schedule`, icon: Calendar },
  { name: 'Daily Logs', href: `/jobs/${id}/daily-logs`, icon: ClipboardList },
  { name: 'Time', href: `/jobs/${id}/time-clock`, icon: Clock },
  { name: 'Photos', href: `/jobs/${id}/photos`, icon: Image },
  { name: 'Permits', href: `/jobs/${id}/permits`, icon: FileCheck },
  { name: 'Inspections', href: `/jobs/${id}/inspections`, icon: ClipboardCheck },
  { name: 'Change Orders', href: `/jobs/${id}/change-orders`, icon: FileText },
  { name: 'POs', href: `/jobs/${id}/purchase-orders`, icon: ShoppingCart },
  { name: 'Inventory', href: `/jobs/${id}/inventory`, icon: Package },
  { name: 'Invoices', href: `/jobs/${id}/invoices`, icon: DollarSign },
  { name: 'Draws', href: `/jobs/${id}/draws`, icon: DollarSign },
  { name: 'Liens', href: `/jobs/${id}/lien-waivers`, icon: FileCheck },
  { name: 'Docs', href: `/jobs/${id}/files`, icon: FolderOpen },
  { name: 'RFIs', href: `/jobs/${id}/rfis`, icon: MessageSquare },
  { name: 'Submittals', href: `/jobs/${id}/submittals`, icon: Send },
  { name: 'Comms', href: `/jobs/${id}/communications`, icon: MessageSquare },
  { name: 'Team', href: `/jobs/${id}/team`, icon: Users },
  { name: 'Punch', href: `/jobs/${id}/punch-list`, icon: CheckSquare },
  { name: 'Warranties', href: `/jobs/${id}/warranties`, icon: Shield },
]

export default async function JobLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: job } = await supabase
    .from('jobs')
    .select('name, job_number')
    .eq('id', id)
    .single()

  const tabs = getJobTabs(id)

  return (
    <div className="space-y-4">
      {/* Job header breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/jobs" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" />
          Jobs
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">
          {job?.job_number ? `${job.job_number} — ` : ''}{job?.name ?? 'Job'}
        </span>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-foreground/20 transition-colors whitespace-nowrap"
          >
            <tab.icon className="h-4 w-4" />
            {tab.name}
          </Link>
        ))}
      </div>

      {/* Page content */}
      {children}
    </div>
  )
}
