import Link from 'next/link'

import { Plus, Image } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

interface Photo {
  id: string
  title: string
  description: string | null
  photo_url: string | null
  category: string | null
  taken_date: string | null
  location: string | null
  notes: string | null
  created_at: string | null
}

export default async function JobPhotosPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: jobId } = await params
  const supabase = await createClient()

  const { data: photosData } = await supabase
    .from('job_photos')
    .select('*')
    .eq('job_id', jobId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const photos = (photosData || []) as Photo[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Photos</h1>
          <p className="text-muted-foreground">{photos.length} photos</p>
        </div>
        <Link href={`/jobs/${jobId}/photos/new`}><Button><Plus className="h-4 w-4 mr-2" />Upload Photo</Button></Link>
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="aspect-square bg-muted flex items-center justify-center">
                {photo.photo_url ? (
                  <img src={photo.photo_url} alt={photo.title} className="w-full h-full object-cover" />
                ) : (
                  <Image className="h-8 w-8 text-muted-foreground/50" />
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{photo.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  {photo.category && <Badge variant="outline" className="text-xs">{photo.category}</Badge>}
                  {photo.taken_date ? <span className="text-xs text-muted-foreground">{formatDate(photo.taken_date)}</span>
                    : photo.created_at && <span className="text-xs text-muted-foreground">{formatDate(photo.created_at)}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground mb-1">No photos yet</h3>
          <p className="text-muted-foreground">Upload job site photos to track progress</p>
        </div>
      )}
    </div>
  )
}
