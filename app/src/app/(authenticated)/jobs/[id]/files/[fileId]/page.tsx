'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save, FileText, Image, File } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { formatDate, getStatusColor, formatFileSize } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────

interface DocumentData {
  id: string
  filename: string
  mime_type: string
  file_size: number | null
  document_type: string | null
  uploaded_by: string | null
  created_at: string | null
}

// ── Helpers ──────────────────────────────────────────────────────

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return File
  if (mimeType.startsWith('image/')) return Image
  return FileText
}

// ── Component ──────────────────────────────────────────────────

export default function FileDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const jobId = params.id as string
  const fileId = params.fileId as string

  const [document, setDocument] = useState<DocumentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    filename: '',
    document_type: '',
  })

  useEffect(() => {
    async function loadDocument() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
      if (!jobCheck) { setError('Job not found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', fileId)
        .eq('job_id', jobId)
        .single()

      if (fetchError || !data) {
        setError('File not found')
        setLoading(false)
        return
      }

      const d = data as DocumentData
      setDocument(d)
      setFormData({
        filename: d.filename,
        document_type: d.document_type || '',
      })
      setLoading(false)
    }
    loadDocument()
  }, [fileId, jobId, companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          filename: formData.filename,
          document_type: formData.document_type || null,
        })
        .eq('id', fileId)
        .eq('job_id', jobId)
        .eq('company_id', companyId)

      if (updateError) throw updateError
      toast.success('Saved')

      setDocument((prev) =>
        prev
          ? {
              ...prev,
              filename: formData.filename,
              document_type: formData.document_type || null,
            }
          : prev
      )
      setSuccess(true)
      setEditing(false)
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
      const { error: deleteError } = await supabase
        .from('documents')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', fileId)
        .eq('job_id', jobId)
        .eq('company_id', companyId)

      if (deleteError) {
        setError('Failed to archive file')
        toast.error('Failed to archive file')
        return
      }
      toast.success('Archived')

      router.push(`/jobs/${jobId}/files`)
      router.refresh()
  
    } catch (err) {
      const msg = (err as Error)?.message || 'Operation failed'
      setError(msg)
      toast.error(msg)
    }
}

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!document) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`/jobs/${jobId}/files`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Files
        </Link>
        <p className="text-destructive">{error || 'File not found'}</p>
      </div>
    )
  }

  const Icon = getFileIcon(document.mime_type)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/files`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Files
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {document.filename}
              </h1>
              <p className="text-muted-foreground">
                {formatFileSize(document.file_size)}
                {document.document_type && ` - ${document.document_type}`}
              </p>
            </div>
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">File updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>File Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Filename</span>
                    <p className="font-medium">{document.filename}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Document Type</span>
                    <p className="font-medium">{document.document_type || 'Not categorized'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">MIME Type</span>
                    <p className="font-medium">{document.mime_type || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">File Size</span>
                    <p className="font-medium">{formatFileSize(document.file_size)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uploaded By</span>
                    <p className="font-medium">{document.uploaded_by || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uploaded</span>
                    <p className="font-medium">{document.created_at ? formatDate(document.created_at) : 'Unknown'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive File
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Edit File Details</CardTitle>
                <CardDescription>Update filename and document type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="filename" className="text-sm font-medium">Filename <span className="text-red-500">*</span></label>
                  <Input id="filename" name="filename" value={formData.filename} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="document_type" className="text-sm font-medium">Document Type</label>
                  <Input id="document_type" name="document_type" value={formData.document_type} onChange={handleChange} placeholder="e.g., Contract, Invoice, Plan" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">MIME Type</span>
                    <p className="font-medium">{document.mime_type || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">File Size</span>
                    <p className="font-medium">{formatFileSize(document.file_size)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uploaded By</span>
                    <p className="font-medium">{document.uploaded_by || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uploaded</span>
                    <p className="font-medium">{document.created_at ? formatDate(document.created_at) : 'Unknown'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive file?"
        description="This file will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
