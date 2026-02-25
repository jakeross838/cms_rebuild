import Link from 'next/link'

import {
  DollarSign,
  Calendar,
  FileText,
  ClipboardList,
  ShoppingCart,
  FolderOpen,
  ArrowLeft,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'

const getJobTabs = (id: string) => [
  { name: 'Overview', href: `/jobs/${id}`, icon: FileText },
  { name: 'Budget', href: `/jobs/${id}/budget`, icon: DollarSign },
  { name: 'Schedule', href: `/jobs/${id}/schedule`, icon: Calendar },
  { name: 'Daily Logs', href: `/jobs/${id}/daily-logs`, icon: ClipboardList },
  { name: 'Change Orders', href: `/jobs/${id}/change-orders`, icon: FileText },
  { name: 'Purchase Orders', href: `/jobs/${id}/purchase-orders`, icon: ShoppingCart },
  { name: 'Documents', href: `/jobs/${id}/files`, icon: FolderOpen },
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
