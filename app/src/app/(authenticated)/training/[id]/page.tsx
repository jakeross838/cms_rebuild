'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { ArrowLeft, BookOpen, Clock, ExternalLink, Loader2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

// ── Types ────────────────────────────────────────────────────────────

interface CourseData {
  id: string
  title: string
  description: string | null
  course_type: string | null
  category: string | null
  difficulty: string | null
  duration_minutes: number | null
  content_url: string | null
  is_published: boolean
  created_at: string | null
}

// ── Difficulty Badge ─────────────────────────────────────────────────

function getDifficultyColor(difficulty: string | null): string {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-700'
    case 'intermediate': return 'bg-amber-100 text-amber-700'
    case 'advanced': return 'bg-red-100 text-red-700'
    default: return 'bg-warm-100 text-warm-700'
  }
}

// ── Page Component ───────────────────────────────────────────────────

export default function TrainingCourseDetailPage() {
  const params = useParams()
  const supabase = createClient()
  const [course, setCourse] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCourse() {
      const { data, error: fetchError } = await supabase
        .from('training_courses')
        .select('*')
        .eq('id', params.id as string)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Course not found')
        setLoading(false)
        return
      }

      setCourse(data as CourseData)
      setLoading(false)
    }
    loadCourse()
  }, [params.id, supabase])

  // ── Loading State ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // ── Not Found State ──────────────────────────────────────────────

  if (!course) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/training" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Training
        </Link>
        <p className="text-destructive">{error || 'Course not found'}</p>
      </div>
    )
  }

  // ── Format Duration ──────────────────────────────────────────────

  const formattedDuration = course.duration_minutes
    ? `${course.duration_minutes} min`
    : null

  // ── Main Render ──────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/training" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Training
        </Link>
        <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
        <div className="flex items-center gap-2 mt-2">
          {course.difficulty && (
            <Badge className={`${getDifficultyColor(course.difficulty)} rounded`}>{course.difficulty}</Badge>
          )}
          {course.is_published ? (
            <Badge className="bg-green-100 text-green-700 rounded">Published</Badge>
          ) : (
            <Badge className="bg-warm-100 text-warm-700 rounded">Draft</Badge>
          )}
          {formattedDuration && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {formattedDuration}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* ── Course Details ─────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {course.course_type && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-24">Type</span>
                <Badge variant="outline">{course.course_type}</Badge>
              </div>
            )}
            {course.category && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-24">Category</span>
                <Badge variant="outline">{course.category}</Badge>
              </div>
            )}
            {formattedDuration && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-24">Duration</span>
                <span className="text-sm text-muted-foreground">{formattedDuration}</span>
              </div>
            )}
            {course.content_url && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-24">Content</span>
                <a
                  href={course.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Open course material
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Description ───────────────────────────────────────── */}
        {course.description && (
          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{course.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
