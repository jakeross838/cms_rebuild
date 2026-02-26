'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, BookOpen, Clock, ExternalLink, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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

interface CourseFormData {
  title: string
  description: string
  course_type: string
  category: string
  difficulty: string
  duration_minutes: string
  content_url: string
  is_published: boolean
}

const DIFFICULTY_OPTIONS = ['beginner', 'intermediate', 'advanced'] as const

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
  const router = useRouter()
  const supabase = createClient()
  const [course, setCourse] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    course_type: '',
    category: '',
    difficulty: '',
    duration_minutes: '',
    content_url: '',
    is_published: false,
  })

  useEffect(() => {
    async function loadCourse() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setLoading(false); return }
      const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      const companyId = profile?.company_id
      if (!companyId) { setError('No company found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('training_courses')
        .select('*')
        .eq('company_id', companyId)
        .eq('id', params.id as string)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Course not found')
        setLoading(false)
        return
      }

      const c = data as CourseData
      setCourse(c)
      setFormData({
        title: c.title,
        description: c.description || '',
        course_type: c.course_type || '',
        category: c.category || '',
        difficulty: c.difficulty || '',
        duration_minutes: c.duration_minutes != null ? String(c.duration_minutes) : '',
        content_url: c.content_url || '',
        is_published: c.is_published,
      })
      setLoading(false)
    }
    loadCourse()
  }, [params.id, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('training_courses')
        .update({
          title: formData.title,
          description: formData.description || null,
          course_type: formData.course_type || undefined,
          category: formData.category || null,
          difficulty: formData.difficulty || undefined,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes, 10) : null,
          content_url: formData.content_url || null,
          is_published: formData.is_published,
        })
        .eq('id', params.id as string)

      if (updateError) throw updateError

      setCourse((prev) =>
        prev
          ? {
              ...prev,
              title: formData.title,
              description: formData.description || null,
              course_type: formData.course_type || null,
              category: formData.category || null,
              difficulty: formData.difficulty || null,
              duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes, 10) : null,
              content_url: formData.content_url || null,
              is_published: formData.is_published,
            }
          : prev
      )
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError((err as Error)?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    if (!window.confirm('Archive this course? It can be restored later.')) return
    setArchiving(true)
    const { error: archiveError } = await supabase
      .from('training_courses')
      .update({ deleted_at: new Date().toISOString() } as Record<string, unknown>)
      .eq('id', params.id as string)
    if (archiveError) {
      setError('Failed to archive course')
      setArchiving(false)
      return
    }
    router.push('/training')
    router.refresh()
  }

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
        <div className="flex items-center justify-between">
          <div>
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
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
                <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
                <button onClick={handleArchive} disabled={archiving} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">{archiving ? 'Archiving...' : 'Archive'}</button>
              </>
            ) : (
              <>
                <Button onClick={() => setEditing(false)} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Course updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Title</span>
                    <p className="font-medium">{course.title}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Published</span>
                    <p className="font-medium">{course.is_published ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type</span>
                    <p className="font-medium">{course.course_type || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category</span>
                    <p className="font-medium">{course.category || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Difficulty</span>
                    <p className="font-medium capitalize">{course.difficulty || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration</span>
                    <p className="font-medium">{formattedDuration || 'N/A'}</p>
                  </div>
                </div>
                {course.content_url && (
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-sm font-medium">Content</span>
                    <a href={course.content_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                      Open course material
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {course.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{course.description}</p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>Update course details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                    <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="course_type" className="text-sm font-medium">Course Type</label>
                    <Input id="course_type" name="course_type" value={formData.course_type} onChange={handleChange} placeholder="e.g., Safety, Technical, Onboarding" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Input id="category" name="category" value={formData.category} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="difficulty" className="text-sm font-medium">Difficulty</label>
                    <select id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">Select difficulty...</option>
                      {DIFFICULTY_OPTIONS.map((d) => (
                        <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="duration_minutes" className="text-sm font-medium">Duration (minutes)</label>
                    <Input id="duration_minutes" name="duration_minutes" type="number" min="0" value={formData.duration_minutes} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="content_url" className="text-sm font-medium">Content URL</label>
                    <Input id="content_url" name="content_url" type="url" value={formData.content_url} onChange={handleChange} placeholder="https://..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <div className="flex items-center gap-2">
                  <input id="is_published" name="is_published" type="checkbox" checked={formData.is_published} onChange={handleChange} className="h-4 w-4 rounded border-gray-300" />
                  <label htmlFor="is_published" className="text-sm font-medium">Published</label>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
