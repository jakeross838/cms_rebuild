'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, BookOpen, Clock, ExternalLink, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { useTrainingCourse, useUpdateTrainingCourse, useDeleteTrainingCourse } from '@/hooks/use-training'
import { formatStatus, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

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

// ── Page Component ───────────────────────────────────────────────────

export default function TrainingCourseDetailPage() {
  const params = useParams()
  const router = useRouter()

  const courseId = params.id as string
  const { data: response, isLoading: loading, error: fetchError } = useTrainingCourse(courseId)
  const updateCourse = useUpdateTrainingCourse(courseId)
  const deleteCourse = useDeleteTrainingCourse()
  const course = (response as { data: CourseData } | undefined)?.data ?? null

  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    if (course) {
      setFormData({
        title: course.title,
        description: course.description || '',
        course_type: course.course_type || '',
        category: course.category || '',
        difficulty: course.difficulty || '',
        duration_minutes: course.duration_minutes != null ? String(course.duration_minutes) : '',
        content_url: course.content_url || '',
        is_published: course.is_published,
      })
    }
  }, [course])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSave = async () => {
    if (!formData.title.trim()) { toast.error('Title is required'); return }

    setError(null)
    try {
      await updateCourse.mutateAsync({
        title: formData.title,
        description: formData.description || null,
        course_type: formData.course_type || undefined,
        category: formData.category || null,
        difficulty: formData.difficulty || undefined,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes, 10) : null,
        content_url: formData.content_url || null,
        is_published: formData.is_published,
      })
      toast.success('Saved')
      setEditing(false)
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to save')
    }
  }

  const handleConfirmArchive = async () => {
    try {
      setArchiving(true)
      await deleteCourse.mutateAsync(courseId)
      toast.success('Archived')
      router.push('/training')
      router.refresh()
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to archive')
      setArchiving(false)
    }
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
        <p className="text-destructive">{fetchError?.message || 'Course not found'}</p>
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
                <Badge className={getStatusColor(course.difficulty || 'beginner')}>{formatStatus(course.difficulty || 'beginner')}</Badge>
              )}
              {course.is_published ? (
                <Badge className={`${getStatusColor('published')} rounded`}>Published</Badge>
              ) : (
                <Badge className={`${getStatusColor('draft')} rounded`}>Draft</Badge>
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
                <Button onClick={() => setShowArchiveDialog(true)} disabled={archiving} variant="outline" className="text-destructive hover:text-destructive">{archiving ? 'Archiving...' : 'Archive'}</Button>
              </>
            ) : (
              <>
                <Button onClick={() => { setEditing(false); setError(null) }} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={updateCourse.isPending}>
                  {updateCourse.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {fetchError && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{fetchError.message}</div>}

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
                    <p className="font-medium">{course.difficulty ? formatStatus(course.difficulty) : 'N/A'}</p>
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
                        <option key={d} value={d}>{formatStatus(d)}</option>
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
                  <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={4} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
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

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive this course?"
        description="This course will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleConfirmArchive}
      />
    </div>
  )
}
