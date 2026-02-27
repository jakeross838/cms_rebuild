'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Photo' }


export default function NewPhotoPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    photo_url: '',
    category: 'general',
    taken_date: today,
    location: '',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!authUser || !companyId) throw new Error('Not authenticated')

      if (!formData.photo_url.trim()) { setError('Photo URL is required'); setLoading(false); return }

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
      if (!jobCheck) throw new Error('Job not found or access denied')

      const { error: insertError } = await supabase
        .from('job_photos')
        .insert({
          company_id: companyId,
          job_id: jobId,
          title: formData.title,
          description: formData.description || null,
          photo_url: formData.photo_url,
          category: formData.category || 'general',
          taken_date: formData.taken_date || null,
          taken_by: authUser.id,
          location: formData.location || null,
          notes: formData.notes || null,
          created_by: authUser.id,
        })

      if (insertError) throw insertError

      toast.success('Photo added')
      router.push(`/jobs/${jobId}/photos`)
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to add photo'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/photos`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Photos
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Photo</h1>
        <p className="text-muted-foreground">Add a photo reference to this job</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Photo Details</CardTitle>
            <CardDescription>Title, URL, and classification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Foundation Pour Progress" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Category</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="general">General</option>
                  <option value="progress">Progress</option>
                  <option value="safety">Safety</option>
                  <option value="issue">Issue</option>
                  <option value="inspection">Inspection</option>
                  <option value="before">Before</option>
                  <option value="after">After</option>
                  <option value="drone">Drone</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="photo_url" className="text-sm font-medium">Photo URL <span className="text-red-500">*</span></label>
              <Input id="photo_url" name="photo_url" value={formData.photo_url} onChange={handleChange} placeholder="https://example.com/photo.jpg" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Input id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Brief description of the photo" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Photo Metadata</CardTitle>
            <CardDescription>When and where the photo was taken</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="taken_date" className="text-sm font-medium">Date Taken</label>
                <Input id="taken_date" name="taken_date" type="date" value={formData.taken_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">Location</label>
                <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., South elevation, 2nd floor" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} placeholder="Any additional notes about this photo..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/jobs/${jobId}/photos`}><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding...</> : 'Add Photo'}
          </Button>
        </div>
      </form>
    </div>
  )
}
