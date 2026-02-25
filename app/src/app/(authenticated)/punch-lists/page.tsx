import Link from 'next/link'

import { Plus, Search, CheckSquare } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface PunchItem {
  id: string
  title: string | null
  status: string | null
  priority: string | null
  category: string | null
  location: string | null
  room: string | null
  job_id: string
  due_date: string | null
  created_at: string | null
}

export default async function PunchListsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('punch_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.search) {
    query = query.ilike('title', `%${params.search}%`)
  }

  const { data: itemsData } = await query
  const items = (itemsData || []) as PunchItem[]

  const open = items.filter((i) => i.status === 'open' || i.status === 'in_progress').length
  const completed = items.filter((i) => i.status === 'completed' || i.status === 'verified').length

  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'verified', label: 'Verified' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Punch Lists</h1>
          <p className="text-muted-foreground">{items.length} items • {open} open • {completed} completed</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Item</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form><Input type="search" name="search" placeholder="Search punch items..." defaultValue={params.search} className="pl-10" /></form>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((filter) => (
            <Link key={filter.value} href={filter.value ? `/punch-lists?status=${filter.value}` : '/punch-lists'}>
              <Button variant={params.status === filter.value || (!params.status && !filter.value) ? 'default' : 'outline'} size="sm">{filter.label}</Button>
            </Link>
          ))}
        </div>
      </div>

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{item.title ?? 'Untitled'}</span>
                  <Badge className={getStatusColor(item.status ?? 'open')}>{(item.status ?? 'open').replace('_', ' ')}</Badge>
                  {item.priority && <Badge variant="outline" className="text-xs">{item.priority}</Badge>}
                </div>
                <div className="flex items-center gap-3 ml-6 mt-1 text-xs text-muted-foreground">
                  {item.location && <span>{item.location}</span>}
                  {item.room && <span>{item.room}</span>}
                  {item.category && <span>{item.category}</span>}
                  {item.due_date && <span>Due: {formatDate(item.due_date)}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground mb-1">No punch items found</h3>
          <p className="text-muted-foreground">{params.search || params.status ? 'Try adjusting your filters' : 'All punch items across jobs will appear here'}</p>
        </div>
      )}
    </div>
  )
}
