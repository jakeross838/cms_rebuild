import Link from 'next/link'

import { Plus, ShieldAlert } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface WarrantyClaimRow {
  id: string
  claim_number: string
  title: string
  status: string
  priority: string | null
  reported_date: string | null
  warranty_id: string | null
  created_at: string
}

export default async function WarrantyClaimsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('warranty_claims')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (params.status) {
    query = query.eq('status', params.status)
  }

  const { data: claimsData } = await query
  const claims = (claimsData || []) as WarrantyClaimRow[]

  const openCount = claims.filter((c) => c.status === 'open' || c.status === 'in_progress').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Warranty Claims</h1>
          <p className="text-muted-foreground">
            {claims.length} claims &middot; {openCount} open
          </p>
        </div>
        <Link href="/warranty-claims/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Claim
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            All Claims
          </CardTitle>
        </CardHeader>
        <CardContent>
          {claims.length > 0 ? (
            <div className="divide-y divide-border">
              {claims.map((claim) => (
                <Link
                  key={claim.id}
                  href={`/warranty-claims/${claim.id}`}
                  className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {claim.claim_number && (
                          <span className="text-xs font-mono text-muted-foreground">{claim.claim_number}</span>
                        )}
                        <span className="font-medium">{claim.title}</span>
                        <Badge className={getStatusColor(claim.status)}>{claim.status.replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {claim.reported_date && <span>Reported: {formatDate(claim.reported_date)}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShieldAlert className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No warranty claims</p>
              <p className="text-sm text-muted-foreground mt-1">All warranties in good standing</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
