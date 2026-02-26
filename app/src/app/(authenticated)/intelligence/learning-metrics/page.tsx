import Link from 'next/link'
import { redirect } from 'next/navigation'

import {
  TrendingUp,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Users,
  CheckCircle2,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

// ── Page ─────────────────────────────────────────────────────────────

export default async function LearningMetricsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  // ── Parallel data fetching ──
  const [
    totalCoursesRes,
    publishedCoursesRes,
    totalProgressRes,
    completedProgressRes,
    inProgressRes,
  ] = await Promise.all([
    supabase.from('training_courses').select('*', { count: 'exact', head: true })
      .or(`company_id.eq.${companyId},company_id.is.null`).is('deleted_at', null),
    supabase.from('training_courses').select('*', { count: 'exact', head: true })
      .or(`company_id.eq.${companyId},company_id.is.null`).is('deleted_at', null)
      .eq('is_published', true),
    supabase.from('user_training_progress').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId),
    supabase.from('user_training_progress').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).eq('status', 'completed'),
    supabase.from('user_training_progress').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).eq('status', 'in_progress'),
  ])

  const totalCourses = totalCoursesRes.count || 0
  const publishedCourses = publishedCoursesRes.count || 0
  const totalEnrollments = totalProgressRes.count || 0
  const completedEnrollments = completedProgressRes.count || 0
  const inProgressCount = inProgressRes.count || 0
  const completionRate = totalEnrollments > 0
    ? Math.round((completedEnrollments / totalEnrollments) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Learning Metrics
        </h1>
        <p className="text-muted-foreground mt-1">Track AI learning and training progress across your team</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{totalCourses}</p>
                <p className="text-xs text-muted-foreground">{publishedCourses} published</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Enrollments</p>
                <p className="text-2xl font-bold">{totalEnrollments}</p>
                <p className="text-xs text-muted-foreground">{inProgressCount} in progress</p>
              </div>
              <Users className="h-8 w-8 text-purple-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedEnrollments}</p>
                <p className="text-xs text-muted-foreground">courses finished</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
                <p className="text-xs text-muted-foreground">of all enrollments</p>
              </div>
              <GraduationCap className="h-8 w-8 text-amber-500/70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Training Progress Overview
          </CardTitle>
          <CardDescription>
            Team learning metrics and course completion tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalEnrollments > 0 ? (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Overall Completion</span>
                  <span className="text-sm font-medium">{completionRate}%</span>
                </div>
                <div className="h-3 rounded bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded bg-green-500 transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>

              {/* Stats Breakdown */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center p-3 rounded-lg bg-blue-50">
                  <p className="text-xs text-muted-foreground">Not Started</p>
                  <p className="text-lg font-bold text-blue-700">
                    {totalEnrollments - completedEnrollments - inProgressCount}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-50">
                  <p className="text-xs text-muted-foreground">In Progress</p>
                  <p className="text-lg font-bold text-amber-700">{inProgressCount}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-50">
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-lg font-bold text-green-700">{completedEnrollments}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No training enrollments yet. Assign courses to your team to start tracking progress.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/training">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2 bg-blue-100">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Training Platform</p>
                <p className="text-xs text-muted-foreground">Browse courses and manage training</p>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/team">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2 bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Team Directory</p>
                <p className="text-xs text-muted-foreground">View team members and their progress</p>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
