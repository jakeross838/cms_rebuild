import Link from 'next/link'
import { redirect } from 'next/navigation'

import { CheckSquare, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

interface PunchItemRow {
  id: string
  title: string
  status: string
  priority: string | null
  due_date: string | null
  assigned_to: string | null
  job_id: string | null
  created_at: string
}

export default async function TodosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
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

  const query = supabase
    .from('punch_items')
    .select('*', { count: 'exact' })
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .in('status', ['open', 'in_progress'])
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  const { data: itemsData, count, error } = await query
  if (error) throw error

  const items = (itemsData || []) as PunchItemRow[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CheckSquare className="h-6 w-6" />
            To-Do Items
          </h1>
          <p className="text-muted-foreground">{count || 0} open items</p>
        </div>
        <Link href="/punch-lists/new"><Button><Plus className="h-4 w-4 mr-2" />New Item</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Open Items</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <CheckSquare className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {item.due_date && <span>Due: {formatDate(item.due_date)}</span>}
                        {item.priority && <span className="capitalize">{item.priority}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No open items</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath="/todos" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
