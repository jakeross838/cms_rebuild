import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, Search, Palette } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, getStatusColor } from '@/lib/utils'

interface SelectionCategory {
  id: string
  name: string
  status: string
  room: string | null
  pricing_model: string
  allowance_amount: number | null
  deadline: string | null
  sort_order: number | null
  job_id: string
  created_at: string
}

export default async function SelectionsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // ── Auth & Company ID ──────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) redirect('/login')

  let query = supabase
    .from('selection_categories')
    .select('*')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (params.search) {
    query = query.ilike('name', `%${params.search}%`)
  }

  const [
    { data: categoriesData },
    { count: optionCount },
  ] = await Promise.all([
    query,
    supabase.from('selection_options').select('*', { count: 'exact', head: true }).eq('company_id', companyId).is('deleted_at', null),
  ])

  const categories = (categoriesData || []) as SelectionCategory[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Selections Catalog</h1>
          <p className="text-muted-foreground">{categories.length} categories &bull; {optionCount ?? 0} options</p>
        </div>
        <Link href="/library/selections/new"><Button><Plus className="h-4 w-4 mr-2" />Add Category</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search selections..." aria-label="Search selections" defaultValue={params.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <div className="divide-y divide-border">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/library/selections/${cat.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cat.name}</span>
                        <Badge className={getStatusColor(cat.status)}>{cat.status}</Badge>
                        <Badge variant="outline" className="text-xs">{cat.pricing_model}</Badge>
                        {cat.room && <Badge variant="outline" className="text-xs">{cat.room}</Badge>}
                      </div>
                    </div>
                    {cat.allowance_amount != null && (
                      <span className="font-medium">{formatCurrency(cat.allowance_amount)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Palette className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">{params.search ? 'No categories match your search' : 'No selection categories yet'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
