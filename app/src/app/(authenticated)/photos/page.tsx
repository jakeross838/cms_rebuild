import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { safeOrIlike, formatDate, formatFileSize, formatStatus, getStatusColor } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Camera } from 'lucide-react'

interface PhotoDocument {
  id: string
  filename: string
  file_size: number | null
  status: string | null
  created_at: string | null
}

export const metadata: Metadata = { title: 'Photos' }

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize

  const { companyId, supabase } = await getServerAuth()

  let query = supabase
    .from('documents')
    .select('id, filename, file_size, status, created_at', { count: 'exact' })
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .like('mime_type', 'image/%')
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (params.search) {
    query = query.ilike('filename', `${safeOrIlike(params.search)}`)
  }

  const { data, count, error } = await query
  if (error) throw error
  const photos = (data ?? []) as unknown as PhotoDocument[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Photos</h1>
          <p className="text-muted-foreground">Project photos across all jobs &bull; {count || 0} photo{(count || 0) !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/jobs">
          <Button variant="outline">Go to Jobs</Button>
        </Link>
      </div>

      {photos.length === 0 ? (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="text-center py-12">
            <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground mb-1">No photos yet</p>
            <p className="text-muted-foreground mb-4">
              Upload photos from within a job to see them here
            </p>
            <Link
              href="/jobs"
              className="text-sm font-medium text-primary hover:underline"
            >
              Go to Jobs
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th scope="col" className="text-left p-3 text-sm font-medium text-muted-foreground">Filename</th>
                <th scope="col" className="text-left p-3 text-sm font-medium text-muted-foreground">Size</th>
                <th scope="col" className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                <th scope="col" className="text-left p-3 text-sm font-medium text-muted-foreground">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {photos.map((photo) => (
                <tr key={photo.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{photo.filename}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {formatFileSize(photo.file_size)}
                  </td>
                  <td className="p-3">
                    {photo.status && (
                      <Badge className={getStatusColor(photo.status)}>
                        {formatStatus(photo.status)}
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {formatDate(photo.created_at) || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ListPagination currentPage={page} totalPages={totalPages} basePath="/photos" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
