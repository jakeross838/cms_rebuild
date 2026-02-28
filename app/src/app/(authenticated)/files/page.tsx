import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { safeOrIlike, formatDate, formatStatus, getStatusColor } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
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
  searchParams: Promise<{ search?: string; type?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize

  const { companyId, supabase } = await getServerAuth()

  let query = supabase
    .from('documents')
    .select('id, filename, mime_type, file_size, document_type, status, created_at', { count: 'exact' })
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (params.search) {
    query = query.ilike('filename', `${safeOrIlike(params.search)}`)
  }
  if (params.type) {
    query = query.eq('document_type', params.type)
  }

  const { data, count, error } = await query
  if (error) throw error
  const documents = (data ?? []) as unknown as Document[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Files &amp; Documents</h1>
          <p className="text-muted-foreground">Company-wide document storage</p>
        </div>
        <span className="text-sm text-muted-foreground">{count || 0} file{(count || 0) !== 1 ? 's' : ''}</span>
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
                <th scope="col" className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                <th scope="col" className="text-left p-3 text-sm font-medium text-muted-foreground">Type</th>
                <th scope="col" className="text-left p-3 text-sm font-medium text-muted-foreground">Size</th>
                <th scope="col" className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                <th scope="col" className="text-left p-3 text-sm font-medium text-muted-foreground">Uploaded</th>
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
                        <Badge className={getStatusColor(doc.status)}>
                          {formatStatus(doc.status)}
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {formatDate(doc.created_at) || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ListPagination currentPage={page} totalPages={totalPages} basePath="/files" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
