import type { Metadata } from 'next'
import Link from 'next/link'

import {
  CalendarDays,
  ClipboardCheck,
  Briefcase,
  Calendar,
  Clock,
  ArrowRight,
  FileText,
  Users,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { formatDate, formatStatus, getStatusColor } from '@/lib/utils'

// ── Constants ────────────────────────────────────────────────────────

const PAGE_SIZE = 10

const meetingLinks = [
  {
    href: '/jobs',
    icon: Briefcase,
    title: 'Job Schedule',
    description: 'View and manage job timelines, milestones, and scheduling',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    href: '/meetings/schedule',
    icon: Calendar,
    title: 'Schedule Meeting',
    description: 'Schedule a new meeting with your team or clients',
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  {
    href: '/meetings/notes',
    icon: FileText,
    title: 'Meeting Notes',
    description: 'Browse and search past meeting notes and minutes',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
  {
    href: '/meetings/action-items',
    icon: ClipboardCheck,
    title: 'Action Items',
    description: 'Track follow-up tasks and action items from meetings',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
  },
  {
    href: '/meetings/templates',
    icon: Users,
    title: 'Meeting Templates',
    description: 'Create and manage meeting agenda templates',
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
  },
]

// ── Page ─────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export const metadata: Metadata = { title: 'Meetings' }

export default async function MeetingsPage({ searchParams }: PageProps) {
  const { companyId, supabase } = await getServerAuth()

  const resolvedParams = await searchParams
  const currentPage = Math.max(1, parseInt(resolvedParams.page || '1', 10))
  const offset = (currentPage - 1) * PAGE_SIZE

  // ── Fetch upcoming inspections as "upcoming appointments" ──
  const today = new Date().toISOString().split('T')[0]

  const [inspectionsCountRes, inspectionsRes] = await Promise.all([
    supabase
      .from('permit_inspections')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('scheduled_date', today)
      .neq('status', 'cancelled'),
    supabase
      .from('permit_inspections')
      .select('id, inspection_type, scheduled_date, scheduled_time, status, inspector_name, job_id')
      .eq('company_id', companyId)
      .gte('scheduled_date', today)
      .neq('status', 'cancelled')
      .order('scheduled_date', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1),
  ])

  const totalInspections = inspectionsCountRes.count || 0
  const totalPages = Math.ceil(totalInspections / PAGE_SIZE)

  const inspections = (inspectionsRes.data || []) as {
    id: string
    inspection_type: string
    scheduled_date: string | null
    scheduled_time: string | null
    status: string
    inspector_name: string | null
    job_id: string
  }[]

  // ── Fetch job names for the inspections ──
  const jobIds = [...new Set(inspections.map((i) => i.job_id))]
  let jobMap: Record<string, string> = {}
  if (jobIds.length > 0) {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, name')
      .in('id', jobIds)
    if (jobs) {
      jobMap = Object.fromEntries(jobs.map((j) => [j.id, j.name]))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CalendarDays className="h-6 w-6" />
          Meetings & Schedule
        </h1>
        <p className="text-muted-foreground mt-1">Schedule meetings and manage project appointments</p>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meetingLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${item.bg}`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Upcoming Inspections */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Upcoming Inspections
              {totalInspections > 0 && (
                <Badge variant="secondary" className="ml-1">{totalInspections}</Badge>
              )}
            </CardTitle>
            <Link href="/jobs" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all jobs <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <CardDescription>
            Scheduled permit inspections across all active jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inspections.length > 0 ? (
            <div className="divide-y divide-border">
              {inspections.map((inspection) => (
                <Link
                  key={inspection.id}
                  href={`/jobs/${inspection.job_id}`}
                  className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {inspection.inspection_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {jobMap[inspection.job_id] || 'Unknown Job'}
                        </span>
                        {inspection.inspector_name && (
                          <>
                            <span className="text-xs text-muted-foreground">-</span>
                            <span className="text-xs text-muted-foreground">
                              {inspection.inspector_name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <p className="text-xs font-medium">{formatDate(inspection.scheduled_date)}</p>
                        {inspection.scheduled_time && (
                          <p className="text-xs text-muted-foreground">{inspection.scheduled_time}</p>
                        )}
                      </div>
                      <Badge className={getStatusColor(inspection.status)}>
                        {formatStatus(inspection.status)}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No upcoming inspections scheduled
            </p>
          )}

          <ListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/meetings"
            searchParams={resolvedParams}
          />
        </CardContent>
      </Card>
    </div>
  )
}
