import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Plus, Image, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ search?: string }>
}) {
  const { id: jobId } = await params
  const sp = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
  if (!jobCheck) { notFound() }

  let query = supabase
    .from('job_photos')
    .select('*')
    .eq('job_id', jobId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (sp.search) {
    query = query.or(`title.ilike.%${sp.search}%,description.ilike.%${sp.search}%`)
  }

  const { data: photosData } = await query

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

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search photos..." defaultValue={sp.search} className="pl-10" /></form>
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Link key={photo.id} href={`/jobs/${jobId}/photos/${photo.id}`}>
            <Card className="overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer">
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
            </Link>
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
