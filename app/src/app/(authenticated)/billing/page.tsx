
import { CreditCard, Package, Receipt } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { formatCurrency, formatDate, formatStatus} from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Billing' }

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { companyId, supabase } = await getServerAuth()

  const params = await searchParams
  const pageSize = 25
  const currentPage = Math.max(1, parseInt(params.page || '1', 10) || 1)
  const offset = (currentPage - 1) * pageSize

  const [subscriptionRes, eventsRes] = await Promise.all([
    supabase
      .from('company_subscriptions')
      .select('*')
      .eq('company_id', companyId)
      .limit(1)
      .single(),
    supabase
      .from('billing_events')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1),
  ])

  if (subscriptionRes.error) throw subscriptionRes.error
  if (eventsRes.error) throw eventsRes.error

  const subscription = subscriptionRes.data
  const events = eventsRes.data
  const count = eventsRes.count

  const billingEvents = (events || []) as Array<{
    id: string
    event_type: string
    amount: number | null
    description: string | null
    created_at: string
  }>
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="text-lg font-bold capitalize">{String((subscription as Record<string, unknown>).plan_id || 'Free')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="mt-1">{String((subscription as Record<string, unknown>).status || 'active')}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Billing</p>
                <p className="font-medium">
                  {(subscription as Record<string, unknown>).current_period_end
                    ? formatDate(String((subscription as Record<string, unknown>).current_period_end))
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {billingEvents.length > 0 ? (
            <div className="divide-y divide-border">
              {billingEvents.map((event) => (
                <div key={event.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm font-medium">{formatStatus(event.event_type)}</span>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{formatDate(event.created_at)}</p>
                    </div>
                    {event.amount != null && (
                      <span className="font-mono font-medium">{formatCurrency(event.amount)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No billing events yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={currentPage} totalPages={totalPages} basePath="/billing" />
    </div>
  )
}
