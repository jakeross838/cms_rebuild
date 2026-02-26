import Link from 'next/link'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { FolderOpen, Palette, Tag } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Selection Intelligence' }

export default async function SelectionIntelligencePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  // ── Query selection counts ────────────────────────────────────────
  const { count: selectionsCount } = await supabase
    .from('selections')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null)

  const { count: categoriesCount } = await supabase
    .from('selection_categories')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null)

  const stats = [
    { label: 'Total Selections', value: selectionsCount ?? 0, icon: Palette },
    { label: 'Categories', value: categoriesCount ?? 0, icon: Tag },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Selection Intelligence</h1>
        <p className="text-muted-foreground">AI-powered product selection insights and recommendations</p>
      </div>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                  <stat.icon className="h-5 w-5 text-purple-700" />
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
        <Link href="/library/selections">
          <Card className="transition-colors hover:bg-muted/50">
            <CardContent className="p-6">
              <div className="flex flex-col items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                  <FolderOpen className="h-5 w-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="font-semibold">Selection Library</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Browse and manage product selections, spec books, and room-by-room configurations
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
