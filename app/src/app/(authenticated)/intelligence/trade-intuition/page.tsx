import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Star, TrendingUp, Users } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

export default async function TradeIntuitionPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  // ── Query vendor counts ───────────────────────────────────────────
  const { count: vendorsCount } = await supabase
    .from('vendors')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null)

  const { count: ratingsCount } = await supabase
    .from('vendor_ratings')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)

  const stats = [
    { label: 'Active Vendors', value: vendorsCount ?? 0, icon: Users },
    { label: 'Vendor Ratings', value: ratingsCount ?? 0, icon: Star },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trade Intuition</h1>
        <p className="text-muted-foreground">AI predictions for trade performance and pricing insights</p>
      </div>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                  <stat.icon className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Navigation Card ──────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/vendors">
          <Card className="transition-colors hover:bg-muted/50">
            <CardContent className="p-6">
              <div className="flex flex-col items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                  <Users className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-semibold">Vendor Directory</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    View and manage your vendor network, performance scores, and trade analytics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/intelligence/ai-hub">
          <Card className="transition-colors hover:bg-muted/50">
            <CardContent className="p-6">
              <div className="flex flex-col items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                  <TrendingUp className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Insights Hub</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Access AI-powered analytics, cost predictions, and performance benchmarks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
