import Link from 'next/link'

import { Plus, Search, Award } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

interface EmployeeCertification {
  id: string
  employee_id: string
  certification_name: string
  certification_type: string | null
  issuing_authority: string | null
  certification_number: string | null
  issued_date: string | null
  expiration_date: string | null
  status: string
  created_at: string
}

export default async function LicensesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('employee_certifications')
    .select('*')
    .order('expiration_date', { ascending: true })

  if (params.search) {
    query = query.or(`certification_name.ilike.%${params.search}%,issuing_authority.ilike.%${params.search}%`)
  }

  const { data: certsData } = await query
  const certs = (certsData || []) as EmployeeCertification[]

  const today = new Date().toISOString().split('T')[0]
  const expired = certs.filter((c) => c.expiration_date && c.expiration_date < today).length
  const active = certs.filter((c) => c.status === 'active').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Licenses & Certifications</h1>
          <p className="text-muted-foreground">{certs.length} certifications &bull; {active} active &bull; {expired} expired</p>
        </div>
        <Link href="/compliance/licenses/new"><Button><Plus className="h-4 w-4 mr-2" />Add Certification</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search certifications..." defaultValue={params.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            All Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {certs.length > 0 ? (
            <div className="divide-y divide-border">
              {certs.map((cert) => (
                <div key={cert.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cert.certification_name}</span>
                        <Badge variant="outline" className="text-xs">{cert.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {cert.issuing_authority && <span>{cert.issuing_authority}</span>}
                        {cert.certification_number && <span> &bull; #{cert.certification_number}</span>}
                        {cert.expiration_date && <span> &bull; Expires {formatDate(cert.expiration_date)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">{params.search ? 'No certifications match your search' : 'No certifications tracked yet'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
