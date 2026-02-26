import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Plus, FolderOpen, FileText, Image, File, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { escapeLike, formatDate } from '@/lib/utils'

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Files' }

interface JobDocument {
  id: string
  filename: string
  mime_type: string
  file_size: number
  document_type: string | null
  uploaded_by: string
  created_at: string | null
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return File
  if (mimeType.startsWith('image/')) return Image
  return FileText
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default async function FilesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const page = Number(sp.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, name')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (jobError || !job) {
    notFound()
  }

  let docsQuery = supabase
    .from('documents')
    .select('*', { count: 'exact' })
    .eq('job_id', id)
    .is('deleted_at', null)

  if (sp.search) {
    docsQuery = docsQuery.ilike('filename', `%${escapeLike(sp.search)}%`)
  }

  const { data: docsData, count, error } = await docsQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)
  if (error) throw error

  const documents = (docsData || []) as JobDocument[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Documents</h2>
          <p className="text-sm text-muted-foreground">{documents.length} files</p>
        </div>
        <Link href={`/jobs/${id}/files/new`}><Button>
          <Plus className="h-4 w-4 mr-2" />
          Upload
        </Button></Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search files..." aria-label="Search files" defaultValue={sp.search} className="pl-10" /></form>
      </div>

      {/* File list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            All Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <div className="divide-y divide-border">
              {documents.map((doc) => {
                const Icon = getFileIcon(doc.mime_type)
                return (
                  <Link key={doc.id} href={`/jobs/${id}/files/${doc.id}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.filename}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        {doc.document_type && <span>{doc.document_type}</span>}
                        <span>{formatFileSize(doc.file_size)}</span>
                        {doc.created_at && <span>{formatDate(doc.created_at)}</span>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No documents yet</p>
              <p className="text-sm text-muted-foreground mt-1">Upload files to organize project documents</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath={`/jobs/${id}/files`} searchParams={sp as Record<string, string | undefined>} />
    </div>
  )
}
