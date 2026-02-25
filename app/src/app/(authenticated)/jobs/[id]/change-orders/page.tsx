import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Plus, FileText } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface ChangeOrder {
  id: string
  co_number: string | null
  title: string | null
  description: string | null
  amount: number | null
  status: string | null
  change_type: string | null
  schedule_impact_days: number | null
  created_at: string | null
  approved_at: string | null
}

export default async function ChangeOrdersPage({
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

  const { data: coData } = await supabase
    .from('change_orders')
    .select('*')
    .eq('job_id', id)
    .order('created_at', { ascending: false })

  const changeOrders = (coData || []) as ChangeOrder[]

  const totalApproved = changeOrders
    .filter((co) => co.status === 'approved')
    .reduce((sum, co) => sum + (co.amount ?? 0), 0)

  const totalPending = changeOrders
    .filter((co) => co.status === 'pending' || co.status === 'draft')
    .reduce((sum, co) => sum + (co.amount ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Change Orders</h2>
          <p className="text-sm text-muted-foreground">{changeOrders.length} change orders</p>
        </div>
        <Link href={`/jobs/${id}/change-orders/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Change Order
          </Button>
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Total COs</p>
            <p className="text-lg font-bold">{changeOrders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Approved Amount</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalApproved)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Pending Amount</p>
            <p className="text-lg font-bold text-amber-600">{formatCurrency(totalPending)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Change orders list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Change Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {changeOrders.length > 0 ? (
            <div className="divide-y divide-border">
              {changeOrders.map((co) => (
                <Link key={co.id} href={`/jobs/${id}/change-orders/${co.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {co.co_number && (
                          <span className="text-sm font-mono text-muted-foreground">{co.co_number}</span>
                        )}
                        <span className="font-medium">{co.title ?? 'Untitled'}</span>
                        <Badge className={getStatusColor(co.status ?? 'draft')}>
                          {(co.status ?? 'draft').replace('_', ' ')}
                        </Badge>
                      </div>
                      {co.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{co.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {co.change_type && <span>{co.change_type.replace('_', ' ')}</span>}
                        {co.created_at && <span>Created {formatDate(co.created_at)}</span>}
                        {co.schedule_impact_days != null && co.schedule_impact_days !== 0 && (
                          <span className="text-amber-600">{co.schedule_impact_days > 0 ? '+' : ''}{co.schedule_impact_days} days</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold font-mono ${(co.amount ?? 0) >= 0 ? 'text-foreground' : 'text-red-600'}`}>
                        {formatCurrency(co.amount)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No change orders yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
