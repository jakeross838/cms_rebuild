import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, Search, Shield } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { escapeLike, formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface VendorInsurance {
  id: string
  vendor_id: string
  insurance_type: string
  policy_number: string
  carrier_name: string
  coverage_amount: number | null
  expiration_date: string
  status: string
  verified_at: string | null
}

export const metadata: Metadata = { title: 'Insurance Compliance' }

export default async function InsurancePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  let query = supabase
    .from('vendor_insurance')
    .select('*')
    .is('deleted_at', null)
    .eq('company_id', companyId)
    .order('expiration_date', { ascending: true })

  if (params.search) {
    query = query.or(`carrier_name.ilike.%${escapeLike(params.search)}%,policy_number.ilike.%${escapeLike(params.search)}%`)
  }

  const { data: insuranceData, error } = await query
  if (error) throw error
  const insurance = (insuranceData || []) as VendorInsurance[]

  const today = new Date().toISOString().split('T')[0]
  const expired = insurance.filter((i) => i.expiration_date < today).length
  const expiringSoon = insurance.filter((i) => {
    const thirtyDays = new Date()
    thirtyDays.setDate(thirtyDays.getDate() + 30)
    return i.expiration_date >= today && i.expiration_date <= thirtyDays.toISOString().split('T')[0]
  }).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Insurance</h1>
          <p className="text-muted-foreground">
            {insurance.length} policies &bull; {expired} expired &bull; {expiringSoon} expiring soon
          </p>
        </div>
        <Link href="/compliance/insurance/new"><Button><Plus className="h-4 w-4 mr-2" />Add Policy</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search policies..." aria-label="Search policies" defaultValue={params.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            COIs & Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insurance.length > 0 ? (
            <div className="divide-y divide-border">
              {insurance.map((pol) => (
                <Link key={pol.id} href={`/compliance/insurance/${pol.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{pol.carrier_name}</span>
                        <Badge variant="outline" className="text-xs">{pol.insurance_type}</Badge>
                        <Badge className={getStatusColor(pol.status)}>{pol.status}</Badge>
                        {pol.verified_at && <Badge className="text-green-700 bg-green-100">Verified</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Policy #{pol.policy_number} &bull; Expires {formatDate(pol.expiration_date)}
                      </div>
                    </div>
                    {pol.coverage_amount != null && (
                      <span className="font-medium">{formatCurrency(pol.coverage_amount)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">{params.search ? 'No policies match your search' : 'No insurance policies tracked yet'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
