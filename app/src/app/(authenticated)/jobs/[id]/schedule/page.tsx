import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Plus, Calendar, CheckCircle2, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { escapeLike, formatDate, getStatusColor } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Schedule' }

interface ScheduleTask {
  id: string
  name: string
  description: string | null
  status: string | null
  phase: string | null
  trade: string | null
  planned_start: string | null
  planned_end: string | null
  actual_start: string | null
  actual_end: string | null
  progress_pct: number | null
  duration_days: number | null
  is_critical_path: boolean | null
  assigned_to: string | null
  sort_order: number | null
}

export default async function SchedulePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const page = Number(sp.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
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

  if (jobError || !job) {
    notFound()
  }

  let tasksQuery = supabase
    .from('schedule_tasks')
    .select('*', { count: 'exact' })
    .eq('job_id', id)
    .is('deleted_at', null)

  if (sp.search) {
    tasksQuery = tasksQuery.or(`name.ilike.%${escapeLike(sp.search)}%,trade.ilike.%${escapeLike(sp.search)}%`)
  }

  const { data: tasksData, count, error } = await tasksQuery
    .order('sort_order', { ascending: true })
    .range(offset, offset + pageSize - 1)
  if (error) throw error

  const tasks = (tasksData || []) as ScheduleTask[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  // Compute summary stats
  const completed = tasks.filter((t) => t.status === 'completed').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const critical = tasks.filter((t) => t.is_critical_path).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Schedule</h2>
          <p className="text-sm text-muted-foreground">{tasks.length} tasks</p>
        </div>
        <Link href={`/jobs/${id}/schedule/new`}><Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button></Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search tasks..." aria-label="Search tasks" defaultValue={sp.search} className="pl-10" /></form>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: tasks.length },
          { label: 'In Progress', value: inProgress },
          { label: 'Completed', value: completed },
          { label: 'Critical Path', value: critical },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/jobs/${id}/schedule/${task.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{task.name}</span>
                      <Badge className={getStatusColor(task.status ?? 'not_started')}>
                        {(task.status ?? 'not started').replace('_', ' ')}
                      </Badge>
                      {task.is_critical_path && (
                        <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200 text-xs">
                          Critical
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {task.trade && <span>{task.trade}</span>}
                      {task.planned_start && (
                        <span>{formatDate(task.planned_start)} → {task.planned_end ? formatDate(task.planned_end) : 'TBD'}</span>
                      )}
                      {task.duration_days != null && <span>{task.duration_days}d</span>}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-24 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${task.progress_pct ?? 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-8 text-right">
                      {task.progress_pct ?? 0}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No schedule tasks yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add tasks to build your project schedule</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath={`/jobs/${id}/schedule`} searchParams={sp as Record<string, string | undefined>} />
    </div>
  )
}
