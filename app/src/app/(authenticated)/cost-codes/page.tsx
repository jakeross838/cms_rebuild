import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, Search, Hash } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { escapeLike } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cost Codes' }

interface CostCodeRow {
  id: string
  code: string
  name: string
  division: string | null
  category: string | null
  trade: string | null
  is_active: boolean | null
  sort_order: number | null
}

const categoryColors: Record<string, string> = {
  labor: 'bg-blue-100 text-blue-700',
  material: 'bg-green-100 text-green-700',
  subcontractor: 'bg-purple-100 text-purple-700',
  equipment: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-700',
}

export default async function CostCodesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; division?: string; category?: string; page?: string }>
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


  let query = supabase
    .from('cost_codes')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .eq('company_id', companyId)
    .order('code', { ascending: true })

  if (params.search) {
    query = query.or(`code.ilike.%${escapeLike(params.search)}%,name.ilike.%${escapeLike(params.search)}%`)
  }

  if (params.division) {
    query = query.eq('division', params.division)
  }

  if (params.category) {
    query = query.eq('category', params.category)
  }

  query = query.range(offset, offset + pageSize - 1)

  const { data: codesData, count } = await query
  const codes = (codesData || []) as CostCodeRow[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const categoryFilters = [
    { value: '', label: 'All Categories' },
    { value: 'labor', label: 'Labor' },
    { value: 'material', label: 'Material' },
    { value: 'subcontractor', label: 'Subcontractor' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cost Codes</h1>
          <p className="text-muted-foreground">{count || 0} total cost codes</p>
        </div>
        <Link href="/cost-codes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Cost Code
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form>
            <Input
              type="search"
              name="search"
              placeholder="Search cost codes..."
              aria-label="Search cost codes"
              defaultValue={params.search}
              className="pl-10"
            />
          </form>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categoryFilters.map((filter) => (
            <Link
              key={filter.value}
              href={filter.value ? `/cost-codes?category=${filter.value}` : '/cost-codes'}
            >
              <Button
                variant={params.category === filter.value || (!params.category && !filter.value) ? 'default' : 'outline'}
                size="sm"
              >
                {filter.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Cost codes list */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {codes.length > 0 ? (
          <div className="divide-y divide-border">
            {codes.map((code) => (
              <Link
                key={code.id}
                href={`/cost-codes/${code.id}`}
                className="block p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Hash className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-muted-foreground">
                            {code.code}
                          </span>
                          <span className="font-medium text-foreground">
                            {code.name}
                          </span>
                          {code.category && (
                            <Badge className={`text-xs rounded ${categoryColors[code.category] || categoryColors.other}`}>
                              {code.category}
                            </Badge>
                          )}
                          {!code.is_active && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {code.division || 'No division'} {code.trade ? `• ${code.trade}` : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground mb-1">No cost codes found</p>
            <p className="text-muted-foreground mb-4">
              {params.search || params.category
                ? 'Try adjusting your filters'
                : 'Get started by adding your first cost code'}
            </p>
            <Link href="/cost-codes/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Cost Code
              </Button>
            </Link>
          </div>
        )}
      </div>
      <ListPagination currentPage={page} totalPages={totalPages} basePath="/cost-codes" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
