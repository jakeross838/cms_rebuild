import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, Search, Gavel } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'

interface LienWaiverTracking {
  id: string
  job_id: string
  vendor_id: string | null
  waiver_id: string | null
  expected_amount: number | null
  period_start: string | null
  period_end: string | null
  is_compliant: boolean
  notes: string | null
  created_at: string
}

export const metadata: Metadata = { title: 'Lien Law Compliance' }

export default async function LienLawPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const { data: trackingData, count } = await supabase
    .from('lien_waiver_tracking')
    .select('*', { count: 'exact' })
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  const records = (trackingData || []) as LienWaiverTracking[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const compliant = records.filter((r) => r.is_compliant).length
  const nonCompliant = records.filter((r) => !r.is_compliant).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lien Law Compliance</h1>
          <p className="text-muted-foreground">
            {records.length} tracking records &bull; {compliant} compliant &bull; {nonCompliant} non-compliant
          </p>
        </div>
        <Link href="/compliance/lien-law/new"><Button><Plus className="h-4 w-4 mr-2" />Add Record</Button></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Total Records</p>
            <p className="text-2xl font-bold">{records.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Compliant</p>
            <p className="text-2xl font-bold text-green-600">{compliant}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Non-Compliant</p>
            <p className="text-2xl font-bold text-red-600">{nonCompliant}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Lien Waiver Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          {records.length > 0 ? (
            <div className="divide-y divide-border">
              {records.map((record) => (
                <Link key={record.id} href={`/compliance/lien-law/${record.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={record.is_compliant ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}>
                          {record.is_compliant ? 'Compliant' : 'Non-Compliant'}
                        </Badge>
                        {record.period_start && record.period_end && (
                          <span className="text-sm text-muted-foreground">
                            {formatDate(record.period_start)} — {formatDate(record.period_end)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {record.notes && <span>{record.notes}</span>}
                      </div>
                    </div>
                    {record.expected_amount != null && (
                      <span className="font-medium">{formatCurrency(record.expected_amount)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gavel className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No lien waiver tracking records</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath="/compliance/lien-law" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
