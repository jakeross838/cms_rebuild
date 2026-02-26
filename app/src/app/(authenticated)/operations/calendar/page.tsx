import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Calendar, Clock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface ScheduleTask {
  id: string
  name: string
  status: string | null
  planned_start: string | null
  planned_end: string | null
  progress_pct: number | null
  is_critical_path: boolean | null
  job_id: string
}

export default async function CompanyCalendarPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const today = new Date().toISOString().split('T')[0]

  const { data: tasksData } = await supabase
    .from('schedule_tasks')
    .select('id, name, status, planned_start, planned_end, progress_pct, is_critical_path, job_id')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .gte('planned_end', today)
    .order('planned_start', { ascending: true })
    .limit(100)

  const tasks = (tasksData || []) as ScheduleTask[]

  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const upcoming = tasks.filter((t) => t.status === 'not_started' || t.status === 'pending').length
  const critical = tasks.filter((t) => t.is_critical_path === true).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Company Calendar</h1>
        <p className="text-muted-foreground">Company-wide schedule across all jobs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Upcoming Tasks</p>
            <p className="text-2xl font-bold">{tasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Not Started</p>
            <p className="text-2xl font-bold text-amber-600">{upcoming}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Critical Path</p>
            <p className="text-2xl font-bold text-red-600">{critical}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
            <div className="divide-y divide-border">
              {tasks.map((task) => (
                <div key={task.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{task.name}</span>
                        {task.status && <Badge className={getStatusColor(task.status)}>{task.status.replace('_', ' ')}</Badge>}
                        {task.is_critical_path && <Badge className="text-red-700 bg-red-100">Critical</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {task.planned_start && formatDate(task.planned_start)}
                        {task.planned_end && ` — ${formatDate(task.planned_end)}`}
                        {(task.progress_pct ?? 0) > 0 && ` • ${task.progress_pct}% complete`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No upcoming tasks scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
