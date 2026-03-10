import Link from 'next/link'

import { ArrowLeft } from 'lucide-react'

import { getServerAuth } from '@/lib/supabase/get-auth'

export default async function JobDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { companyId, supabase } = await getServerAuth()

  const { data: job } = await supabase
    .from('jobs')
    .select('name, job_number')
    .eq('id', id)
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .single()

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

      {/* Page content */}
      {children}
    </div>
  )
}
