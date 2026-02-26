import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { escapeLike } from '@/lib/utils'
import { Camera } from 'lucide-react'

interface PhotoDocument {
  id: string
  filename: string
  file_size: number | null
  status: string | null
  created_at: string | null
}

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
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
    .select('id, filename, file_size, status, created_at')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .like('mime_type', 'image/%')
    .order('created_at', { ascending: false })
    .limit(50)

  if (params.search) {
    query = query.ilike('filename', `%${escapeLike(params.search)}%`)
  }

  const { data } = await query
  const photos = (data ?? []) as unknown as PhotoDocument[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Photos</h1>
          <p className="text-muted-foreground">Project photos across all jobs</p>
        </div>
        <span className="text-sm text-muted-foreground">{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
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
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Filename</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Size</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Uploaded</th>
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
                    {photo.file_size ? `${(photo.file_size / (1024 * 1024)).toFixed(1)} MB` : '—'}
                  </td>
                  <td className="p-3">
                    {photo.status && (
                      <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {photo.status}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {photo.created_at ? new Date(photo.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
