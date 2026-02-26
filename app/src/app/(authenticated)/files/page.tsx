import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { escapeLike } from '@/lib/utils'
import { FolderOpen, FileText, FileImage, File, Search } from 'lucide-react'

interface Document {
  id: string
  filename: string
  mime_type: string | null
  file_size: number | null
  document_type: string | null
  status: string | null
  created_at: string | null
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return File
  if (mimeType.startsWith('image/')) return FileImage
  return FileText
}

export const metadata: Metadata = { title: 'Documents' }

export default async function FilesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  let query = supabase
    .from('documents')
    .select('id, filename, mime_type, file_size, document_type, status, created_at')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (params.search) {
    query = query.ilike('filename', `%${escapeLike(params.search)}%`)
  }
  if (params.type) {
    query = query.eq('document_type', params.type)
  }

  const { data } = await query
  const documents = (data ?? []) as unknown as Document[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Files &amp; Documents</h1>
          <p className="text-muted-foreground">Company-wide document storage</p>
        </div>
        <span className="text-sm text-muted-foreground">{documents.length} file{documents.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form>
          <Input
            type="search"
            name="search"
            placeholder="Search files..."
            aria-label="Search files"
            defaultValue={params.search}
            className="pl-10"
          />
        </form>
      </div>

      {documents.length === 0 ? (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground mb-1">No files uploaded yet</p>
            <p className="text-muted-foreground mb-4">
              Upload files from within a job or use the document storage system
            </p>
            <Link href="/jobs">
              <Button>
                Go to Jobs
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Size</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const Icon = getFileIcon(doc.mime_type)
                return (
                  <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{doc.filename}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{doc.document_type ?? '—'}</td>
                    <td className="p-3 text-sm text-muted-foreground">{formatFileSize(doc.file_size)}</td>
                    <td className="p-3">
                      {doc.status && (
                        <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {doc.status}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
