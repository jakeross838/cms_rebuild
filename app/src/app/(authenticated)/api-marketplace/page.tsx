import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { Store, Puzzle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

interface IntegrationRow {
  id: string
  name: string
  description: string | null
  category: string
  logo_url: string | null
  is_featured: boolean
  status: string
}

export const metadata: Metadata = { title: 'API Marketplace' }

export default async function ApiMarketplacePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }

  const { data: listingsData } = await supabase
    .from('integration_listings')
    .select('*')
    .eq('status', 'published')
    .order('name', { ascending: true })

  const listings = (listingsData || []) as IntegrationRow[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Store className="h-6 w-6" />
          Integrations & Marketplace
        </h1>
        <p className="text-muted-foreground">{listings.length} integrations available</p>
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <Card key={listing.id} className="hover:border-primary/20 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Puzzle className="h-4 w-4 text-muted-foreground" />
                  {listing.name}
                  {listing.is_featured && <Badge className="bg-amber-100 text-amber-700 rounded text-xs">Featured</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {listing.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{listing.description}</p>
                )}
                {listing.category && <Badge variant="outline" className="text-xs">{listing.category}</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Store className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No integrations available yet</p>
            <p className="text-sm text-muted-foreground mt-1">Check back later for third-party integrations</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
