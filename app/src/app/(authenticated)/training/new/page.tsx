'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function NewTrainingCoursePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_url: '',
    course_type: 'video',
    category: '',
    difficulty: 'beginner',
    duration_minutes: '',
    is_published: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!formData.title) throw new Error('Title is required')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) throw new Error('No company found')

      const { error: insertError } = await supabase
        .from('training_courses')
        .insert({
          company_id: companyId,
          title: formData.title,
          description: formData.description || null,
          content_url: formData.content_url || null,
          course_type: formData.course_type,
          category: formData.category || null,
          difficulty: formData.difficulty,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes, 10) : null,
          is_published: formData.is_published,
          created_by: user.id,
        })

      if (insertError) throw insertError

      toast.success('Training course created')
      router.push('/training')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create course'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/training" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Training
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Training Course</h1>
        <p className="text-muted-foreground">Create a new training course or module</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>Title, description, and content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Job Setup Basics" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="What this course covers..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label htmlFor="content_url" className="text-sm font-medium">Content URL</label>
              <Input id="content_url" name="content_url" value={formData.content_url} onChange={handleChange} placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Type, difficulty, and visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="course_type" className="text-sm font-medium">Type</label>
                <select id="course_type" name="course_type" value={formData.course_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                  <option value="interactive">Interactive</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="difficulty" className="text-sm font-medium">Difficulty</label>
                <select id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="duration_minutes" className="text-sm font-medium">Duration (min)</label>
                <Input id="duration_minutes" name="duration_minutes" type="number" min="1" value={formData.duration_minutes} onChange={handleChange} placeholder="e.g., 30" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Getting Started, Safety, Finance" />
            </div>
            <div className="flex items-center gap-2">
              <input id="is_published" name="is_published" type="checkbox" checked={formData.is_published} onChange={handleChange} className="h-4 w-4 rounded border-input" />
              <label htmlFor="is_published" className="text-sm font-medium">Publish immediately</label>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/training"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Course'}
          </Button>
        </div>
      </form>
    </div>
  )
}
