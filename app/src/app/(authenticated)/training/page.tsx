import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { GraduationCap, BookOpen, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

interface CourseRow {
  id: string
  title: string
  description: string | null
  category: string | null
  difficulty: string | null
  duration_minutes: number | null
  is_published: boolean
}

export const metadata: Metadata = { title: 'Training' }

export default async function TrainingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const { data: coursesData, error } = await supabase
    .from('training_courses')
    .select('*')
    .is('deleted_at', null)
    .eq('company_id', companyId)
    .eq('is_published', true)
    .order('title', { ascending: true })

  if (error) throw error
  const courses = (coursesData || []) as CourseRow[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Training
          </h1>
          <p className="text-muted-foreground">{courses.length} courses available</p>
        </div>
        <Link href="/training/new"><Button><Plus className="h-4 w-4 mr-2" />New Course</Button></Link>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Link key={course.id} href={`/training/${course.id}`}>
              <Card className="hover:border-primary/20 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {course.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{course.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    {course.category && <Badge variant="outline" className="text-xs">{course.category}</Badge>}
                    {course.difficulty && <Badge variant="outline" className="text-xs">{course.difficulty}</Badge>}
                    {course.duration_minutes && <span className="text-xs text-muted-foreground">{course.duration_minutes}min</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No training courses available yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
