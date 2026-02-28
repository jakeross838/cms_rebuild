'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useJobPhoto, useUpdateJobPhoto, useDeleteJobPhoto } from '@/hooks/use-job-photos'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────

interface PhotoData {
  id: string
  title: string
  description: string | null
  photo_url: string
  category: string | null
  taken_date: string | null
  location: string | null
  notes: string | null
  created_at: string
}

interface PhotoFormData {
  title: string
  description: string
  category: string
  taken_date: string
  location: string
  notes: string
}

// ── Component ──────────────────────────────────────────────────

export default function PhotoDetailPage() {
  const params = useParams()
  const router = useRouter()

  const jobId = params.id as string
  const photoId = params.photoId as string

  const { data: response, isLoading, error: fetchError } = useJobPhoto(photoId)
  const updateMutation = useUpdateJobPhoto(photoId)
  const deleteMutation = useDeleteJobPhoto()

  const photo = (response as { data: PhotoData } | undefined)?.data ?? null

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const [formData, setFormData] = useState<PhotoFormData>({
    title: '',
    description: '',
    category: '',
    taken_date: '',
    location: '',
    notes: '',
  })

  // ── Sync form data from hook response ─────────────────────────
  useEffect(() => {
    if (photo) {
      setFormData({
        title: photo.title,
        description: photo.description || '',
        category: photo.category || '',
        taken_date: photo.taken_date || '',
        location: photo.location || '',
        notes: photo.notes || '',
      })
    }
  }, [photo])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    setError(null)

    try {
      await updateMutation.mutateAsync({
        title: formData.title,
        description: formData.description || null,
        category: formData.category || null,
        taken_date: formData.taken_date || null,
        location: formData.location || null,
        notes: formData.notes || null,
      } as Record<string, unknown>)

      setEditing(false)
      toast.success('Updated')
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to save'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setArchiving(true)
      await deleteMutation.mutateAsync(photoId)
      toast.success('Archived')
      router.push(`/jobs/${jobId}/photos`)
      router.refresh()
    } catch (err) {
      const msg = (err as Error)?.message || 'Operation failed'
      setError(msg)
      toast.error(msg)
      setArchiving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!photo) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`/jobs/${jobId}/photos`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Photos
        </Link>
        <p className="text-destructive">{fetchError?.message || error || 'Photo not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/photos`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Photos
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{photo.title}</h1>
              {photo.category && (
                <Badge className="bg-warm-100 text-warm-700 rounded">{photo.category}</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {photo.taken_date ? `Taken ${formatDate(photo.taken_date)}` : `Uploaded ${formatDate(photo.created_at)}`}
              {photo.location ? ` - ${photo.location}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
            ) : (
              <>
                <Button onClick={() => { setEditing(false); setError(null) }} variant="outline">Cancel</Button>
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

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardContent className="p-0">
                <div className="relative w-full aspect-video bg-muted rounded-t-lg overflow-hidden">
                  <Image
                    src={photo.photo_url}
                    alt={photo.title}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Photo Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category</span>
                    <p className="font-medium">{photo.category || 'Uncategorized'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location</span>
                    <p className="font-medium">{photo.location || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date Taken</span>
                    <p className="font-medium">{photo.taken_date ? formatDate(photo.taken_date) : 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uploaded</span>
                    <p className="font-medium">{formatDate(photo.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {photo.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{photo.description}</p>
                </CardContent>
              </Card>
            )}

            {photo.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{photo.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)} disabled={archiving}>
                {archiving ? 'Archiving...' : 'Archive Photo'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Photo Information</CardTitle>
                <CardDescription>Update photo details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Progress, Interior, Exterior" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">Location</label>
                    <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Kitchen, Master Bath" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="taken_date" className="text-sm font-medium">Date Taken</label>
                  <Input id="taken_date" name="taken_date" type="date" value={formData.taken_date} onChange={handleChange} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent>
                <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive photo?"
        description="This photo will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
