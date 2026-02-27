import Link from 'next/link'

import { FileCheck, Leaf, Shield } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getServerAuth } from '@/lib/supabase/get-auth'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sustainability' }

export default async function SustainabilityPage() {
  const { companyId, supabase } = await getServerAuth()

  // Count environmental permits for this company
  const { count: envPermitCount } = await supabase
    .from('permits')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('permit_type', 'environmental')
    .is('deleted_at', null)

  const links = [
    {
      title: 'Environmental Permits',
      description: `${envPermitCount ?? 0} environmental permit${(envPermitCount ?? 0) === 1 ? '' : 's'} on file. Manage permits, track renewals, and ensure compliance.`,
      href: '/permits',
      icon: FileCheck,
    },
    {
      title: 'Insurance & Compliance',
      description: 'View insurance policies, coverage details, and compliance documentation.',
      href: '/compliance/insurance',
      icon: Shield,
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Leaf className="h-6 w-6" />
          Sustainability & Compliance
        </h1>
        <p className="text-muted-foreground mt-1">
          Environmental compliance tracking, sustainability metrics, and permit management.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Environmental Permits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{envPermitCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="group">
              <Card className="h-full transition-colors group-hover:border-foreground/20">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
