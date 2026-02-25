import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Plus, Shield } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface LienWaiver {
  id: string
  waiver_type: string | null
  claimant_name: string | null
  amount: number | null
  status: string | null
  through_date: string | null
  received_at: string | null
  created_at: string | null
}

export default async function LienWaiversPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, name')
    .eq('id', id)
    .single()

  if (jobError || !job) {
    notFound()
  }

  const { data: waiverData } = await supabase
    .from('lien_waivers')
    .select('*')
    .eq('job_id', id)
    .order('created_at', { ascending: false })

  const waivers = (waiverData || []) as LienWaiver[]

  const received = waivers.filter((w) => w.status === 'received' || w.status === 'approved').length
  const pending = waivers.filter((w) => w.status === 'requested' || w.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Lien Waivers</h2>
          <p className="text-sm text-muted-foreground">{waivers.length} waivers</p>
        </div>
        <Link href={`/jobs/${id}/lien-waivers/new`}><Button>
          <Plus className="h-4 w-4 mr-2" />
          Request Waiver
        </Button></Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-3"><p className="text-sm text-muted-foreground">Total</p><p className="text-lg font-bold">{waivers.length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-sm text-muted-foreground">Received</p><p className="text-lg font-bold text-green-600">{received}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-sm text-muted-foreground">Pending</p><p className="text-lg font-bold text-amber-600">{pending}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            All Waivers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {waivers.length > 0 ? (
            <div className="divide-y divide-border">
              {waivers.map((waiver) => (
                <div key={waiver.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{waiver.claimant_name ?? 'Unknown'}</span>
                        <Badge className={getStatusColor(waiver.status ?? 'pending')}>{(waiver.status ?? 'pending').replace('_', ' ')}</Badge>
                        {waiver.waiver_type && <Badge variant="outline" className="text-xs">{waiver.waiver_type.replace('_', ' ')}</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {waiver.through_date && <span>Through: {formatDate(waiver.through_date)}</span>}
                        {waiver.received_at && <span>Received: {formatDate(waiver.received_at)}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono">{formatCurrency(waiver.amount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No lien waivers yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
