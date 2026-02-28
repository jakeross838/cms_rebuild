'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useWarranty, useUpdateWarranty, useDeleteWarranty } from '@/hooks/use-warranty'
import { formatDate, formatStatus, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────

interface WarrantyData {
  id: string
  title: string
  status: string
  warranty_type: string | null
  start_date: string | null
  end_date: string | null
  description: string | null
  created_at: string
}

interface WarrantyFormData {
  title: string
  status: string
  warranty_type: string
  start_date: string
  end_date: string
  description: string
}

const STATUS_OPTIONS = ['active', 'expired', 'claimed', 'void']

// ── Component ──────────────────────────────────────────────────

export default function WarrantyDetailPage() {
  const params = useParams()
  const router = useRouter()

  const jobId = params.id as string
  const warrantyId = params.warrantyId as string

  const { data: response, isLoading: loading, error: fetchError } = useWarranty(warrantyId)
  const updateWarranty = useUpdateWarranty(warrantyId)
  const deleteWarranty = useDeleteWarranty()
  const warranty = (response as { data: WarrantyData } | undefined)?.data ?? null

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const [formData, setFormData] = useState<WarrantyFormData>({
    title: '',
    status: 'active',
    warranty_type: '',
    start_date: '',
    end_date: '',
    description: '',
  })

  useEffect(() => {
    if (warranty) {
      setFormData({
        title: warranty.title,
        status: warranty.status,
        warranty_type: warranty.warranty_type || '',
        start_date: warranty.start_date || '',
        end_date: warranty.end_date || '',
        description: warranty.description || '',
      })
    }
  }, [warranty])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await updateWarranty.mutateAsync({
        title: formData.title,
        status: formData.status,
        warranty_type: formData.warranty_type || undefined,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        description: formData.description || undefined,
      } as never)
      setSuccess(true)
      setEditing(false)
      toast.success('Updated')
      setTimeout(() => setSuccess(false), 3000)
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
      await deleteWarranty.mutateAsync(warrantyId)
      toast.success('Archived')
      router.push(`/jobs/${jobId}/warranties`)
      router.refresh()
    } catch (err) {
      const msg = (err as Error)?.message || 'Operation failed'
      setError(msg)
      toast.error(msg)
      setArchiving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!warranty) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`/jobs/${jobId}/warranties`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Warranties
        </Link>
        <p className="text-destructive">{error || 'Warranty not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/warranties`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Warranties
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {warranty.title}
              </h1>
              <Badge className={getStatusColor(warranty.status)}>
                {formatStatus(warranty.status)}
              </Badge>
              {warranty.warranty_type && (
                <Badge variant="outline" className="text-xs">{warranty.warranty_type}</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {warranty.start_date ? formatDate(warranty.start_date) : 'No start date'}
              {warranty.end_date ? ` — ${formatDate(warranty.end_date)}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Warranty updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Warranty Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Title</span>
                    <p className="font-medium">{warranty.title}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <p className="font-medium">{formatStatus(warranty.status)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Warranty Type</span>
                    <p className="font-medium">{warranty.warranty_type || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created</span>
                    <p className="font-medium">{formatDate(warranty.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coverage Period</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Start Date</span>
                    <p className="font-medium">{warranty.start_date ? formatDate(warranty.start_date) : 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End Date</span>
                    <p className="font-medium">{warranty.end_date ? formatDate(warranty.end_date) : 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {warranty.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{warranty.description}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)} disabled={archiving}>
                {archiving ? 'Archiving...' : 'Archive Warranty'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Warranty Information</CardTitle>
                <CardDescription>Update warranty details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                    <Input id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Roof Warranty" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{formatStatus(s)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="warranty_type" className="text-sm font-medium">Warranty Type</label>
                  <Input id="warranty_type" name="warranty_type" value={formData.warranty_type} onChange={handleChange} placeholder="e.g., Manufacturer, Workmanship, Extended" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Coverage Period</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="start_date" className="text-sm font-medium">Start Date</label>
                    <Input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="end_date" className="text-sm font-medium">End Date</label>
                    <Input id="end_date" name="end_date" type="date" value={formData.end_date} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardContent>
                <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Warranty coverage details..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive warranty?"
        description="This warranty will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
