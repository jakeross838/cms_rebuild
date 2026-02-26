import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

import { BarChart3, FileText, DollarSign, Calendar, Camera, ClipboardList } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Job Reports' }

export default async function JobReportsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, name')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (jobError) throw jobError
  if (!job) notFound()

  const reportLinks = [
    { href: `/jobs/${id}/budget`, icon: DollarSign, title: 'Budget Report', description: 'Budget vs actual, cost variance analysis' },
    { href: `/jobs/${id}/schedule`, icon: Calendar, title: 'Schedule Report', description: 'Timeline, milestones, and delays' },
    { href: `/jobs/${id}/daily-logs`, icon: ClipboardList, title: 'Daily Log Summary', description: 'Field activities and crew hours' },
    { href: `/jobs/${id}/photos`, icon: Camera, title: 'Photo Report', description: 'Progress photos by date' },
    { href: `/jobs/${id}/change-orders`, icon: FileText, title: 'Change Order Report', description: 'Approved, pending, and rejected changes' },
    { href: `/jobs/${id}/invoices`, icon: DollarSign, title: 'Invoice Summary', description: 'Billing history and outstanding amounts' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Job Reports
        </h1>
        <p className="text-muted-foreground">{job.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportLinks.map((report) => (
          <Link key={report.href} href={report.href}>
            <Card className="hover:border-primary/20 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <report.icon className="h-4 w-4 text-muted-foreground" />
                  {report.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{report.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
