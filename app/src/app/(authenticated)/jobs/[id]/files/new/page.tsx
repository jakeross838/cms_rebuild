'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function NewFilePage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    filename: '',
    storage_path: '',
    mime_type: 'application/pdf',
    file_size: '',
    document_type: '',
    status: 'active',
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) throw new Error('No company found')

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
      if (!jobCheck) throw new Error('Job not found or access denied')

      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          company_id: companyId,
          job_id: jobId,
          filename: formData.filename,
          storage_path: formData.storage_path,
          mime_type: formData.mime_type,
          file_size: formData.file_size ? parseInt(formData.file_size, 10) : 0,
          document_type: formData.document_type || null,
          status: formData.status,
          uploaded_by: user.id,
        })

      if (insertError) throw insertError

      toast.success('Document added')
      router.push(`/jobs/${jobId}/files`)
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to add document'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/files`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Files
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Document</h1>
        <p className="text-muted-foreground">Add a document reference to this job</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
            <CardDescription>Filename, type, and location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="filename" className="text-sm font-medium">Filename <span className="text-red-500">*</span></label>
              <Input id="filename" name="filename" value={formData.filename} onChange={handleChange} placeholder="e.g., Foundation_Plans_v2.pdf" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="storage_path" className="text-sm font-medium">File URL / Storage Path <span className="text-red-500">*</span></label>
              <Input id="storage_path" name="storage_path" value={formData.storage_path} onChange={handleChange} placeholder="https://example.com/files/document.pdf" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="mime_type" className="text-sm font-medium">MIME Type <span className="text-red-500">*</span></label>
                <select id="mime_type" name="mime_type" value={formData.mime_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="application/pdf">PDF</option>
                  <option value="image/jpeg">JPEG Image</option>
                  <option value="image/png">PNG Image</option>
                  <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word Document</option>
                  <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel Spreadsheet</option>
                  <option value="text/plain">Plain Text</option>
                  <option value="application/zip">ZIP Archive</option>
                  <option value="application/octet-stream">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="file_size" className="text-sm font-medium">File Size (bytes) <span className="text-red-500">*</span></label>
                <Input id="file_size" name="file_size" type="number" value={formData.file_size} onChange={handleChange} placeholder="e.g., 1048576" required min="0" />
              </div>
              <div className="space-y-2">
                <label htmlFor="document_type" className="text-sm font-medium">Document Type</label>
                <select id="document_type" name="document_type" value={formData.document_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select type...</option>
                  <option value="contract">Contract</option>
                  <option value="drawing">Drawing</option>
                  <option value="specification">Specification</option>
                  <option value="permit">Permit</option>
                  <option value="invoice">Invoice</option>
                  <option value="proposal">Proposal</option>
                  <option value="report">Report</option>
                  <option value="photo">Photo</option>
                  <option value="correspondence">Correspondence</option>
                  <option value="insurance">Insurance</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Document status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/jobs/${jobId}/files`}><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding...</> : 'Add Document'}
          </Button>
        </div>
      </form>
    </div>
  )
}
