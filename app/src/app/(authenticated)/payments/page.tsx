import type { Metadata } from 'next'
import Link from 'next/link'

import { CreditCard } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { formatCurrency, formatDate, getStatusColor, formatStatus } from '@/lib/utils'

interface PaymentRow {
  id: string
  amount: number
  status: string
  payment_method: string | null
  payment_date: string | null
  reference_number: string | null
  created_at: string
}

export const metadata: Metadata = { title: 'Payments' }

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const { companyId, supabase } = await getServerAuth()

  const { data: paymentsData, count, error } = await supabase
    .from('client_payments')
    .select('*', { count: 'exact' })
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) throw error
  const payments = (paymentsData || []) as PaymentRow[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground">
          {count || 0} payments &middot; {formatCurrency(totalAmount)} total
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Recent Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="divide-y divide-border">
              {payments.map((payment) => (
                <div key={payment.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium font-mono">{formatCurrency(payment.amount)}</span>
                        <Badge className={getStatusColor(payment.status)}>{formatStatus(payment.status)}</Badge>
                        {payment.payment_method && (
                          <Badge variant="outline" className="text-xs">{payment.payment_method}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {payment.payment_date && <span>{formatDate(payment.payment_date)}</span>}
                        {payment.reference_number && <span>Ref: {payment.reference_number}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No payments recorded</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath="/payments" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
