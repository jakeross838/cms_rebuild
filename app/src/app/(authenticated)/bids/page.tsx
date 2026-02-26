import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, Gavel, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface BidPackageRow {
  id: string
  title: string
  description: string | null
  status: string
  bid_due_date: string | null
  scope_of_work: string | null
  job_id: string | null
  created_at: string
}

export default async function BidsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  let query = supabase
    .from('bid_packages')
    .select('*')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (params.search) {
    query = query.ilike('title', `%${params.search}%`)
  }

  if (params.status) {
    query = query.eq('status', params.status)
  }

  const { data: bidsData } = await query
  const bids = (bidsData || []) as BidPackageRow[]

  const openCount = bids.filter((b) => b.status === 'open' || b.status === 'draft').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bid Management</h1>
          <p className="text-muted-foreground">
            {bids.length} bid packages &middot; {openCount} open
          </p>
        </div>
        <Link href="/bids/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Bid Package
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search bids..." defaultValue={params.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Bid Packages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bids.length > 0 ? (
            <div className="divide-y divide-border">
              {bids.map((bid) => (
                <Link
                  key={bid.id}
                  href={`/bids/${bid.id}`}
                  className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{bid.title}</span>
                        <Badge className={getStatusColor(bid.status)}>{bid.status.replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {bid.bid_due_date && <span>Due: {formatDate(bid.bid_due_date)}</span>}
                        {bid.description && (
                          <span className="truncate max-w-[300px]">{bid.description}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gavel className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No bid packages yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create a bid package to start collecting bids</p>
              <Link href="/bids/new" className="text-sm font-medium text-primary hover:underline">Create your first bid package</Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
