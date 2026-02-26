import type { Metadata } from 'next'

import { Search, Puzzle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { escapeLike, formatCurrency } from '@/lib/utils'

interface Integration {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  pricing_type: string
  price_monthly: number
  status: string
  is_featured: boolean
  install_count: number
  avg_rating: number
  review_count: number
  developer_name: string | null
}

export const metadata: Metadata = { title: 'Integrations' }

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('integration_listings')
    .select('*')
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('install_count', { ascending: false })

  if (params.category) {
    query = query.eq('category', params.category)
  }

  if (params.search) {
    query = query.or(`name.ilike.%${escapeLike(params.search)}%,description.ilike.%${escapeLike(params.search)}%`)
  }

  const { data: integrationsData } = await query
  const integrations = (integrationsData || []) as Integration[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
        <p className="text-muted-foreground">{integrations.length} available integrations</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search integrations..." aria-label="Search integrations" defaultValue={params.search} className="pl-10" /></form>
      </div>

      {integrations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((int) => (
            <Card key={int.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Puzzle className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{int.name}</span>
                    </div>
                    {int.is_featured && <Badge className="text-amber-700 bg-amber-100 mt-1">Featured</Badge>}
                  </div>
                  <Badge variant="outline" className="text-xs">{int.category}</Badge>
                </div>
                {int.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{int.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{int.install_count} installs</span>
                  {int.avg_rating > 0 && <span>{int.avg_rating.toFixed(1)} ({int.review_count})</span>}
                  <span>{int.pricing_type === 'free' ? 'Free' : `${formatCurrency(int.price_monthly)}/mo`}</span>
                </div>
                {int.developer_name && (
                  <p className="text-xs text-muted-foreground mt-2">by {int.developer_name}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Puzzle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-lg font-medium text-foreground mb-1">No integrations found</p>
          <p className="text-muted-foreground">{params.search ? 'Try a different search' : 'No integrations available yet'}</p>
        </div>
      )}
    </div>
  )
}
