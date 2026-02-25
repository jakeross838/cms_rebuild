import Link from 'next/link'

import { Plus, Search, CheckSquare } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface PunchItemRow {
  id: string
  title: string | null
  location: string | null
  room: string | null
  status: string | null
  priority: string | null
  due_date: string | null
  created_at: string | null
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    Low: 'bg-warm-100 text-warm-700',
    Medium: 'bg-info-bg text-info-dark',
    High: 'bg-warning-bg text-warning-dark',
    Urgent: 'bg-danger-bg text-danger-dark',
  }
  return colors[priority] || 'bg-warm-100 text-warm-700'
}

export default async function PunchListPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('punch_items')
    .select('id, title, location, room, status, priority, due_date, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (params.search) {
    query = query.ilike('title', `%${params.search}%`)
  }

  if (params.status) {
    query = query.eq('status', params.status)
  }

  const { data: itemsData } = await query
  const items = (itemsData || []) as PunchItemRow[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Punch List</h1>
          <p className="text-muted-foreground">Track and manage punch list items</p>
        </div>
        <Link href="/punch-list/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Punch Item
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form>
            <Input
              type="search"
              name="search"
              placeholder="Search punch items..."
              defaultValue={params.search}
              className="pl-10"
            />
          </form>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {[
            { value: '', label: 'All' },
            { value: 'Open', label: 'Open' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Verified', label: 'Verified' },
          ].map((filter) => (
            <Link key={filter.value} href={filter.value ? `/punch-list?status=${filter.value}` : '/punch-list'}>
              <Button variant={params.status === filter.value || (!params.status && !filter.value) ? 'default' : 'outline'} size="sm">{filter.label}</Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Location</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Room</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Priority</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-accent transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/punch-list/${item.id}`} className="font-medium text-foreground hover:underline">
                        {item.title || 'Untitled'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.location || '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.room || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge className={`${getStatusColor(item.status ?? 'open')} rounded`}>
                        {item.status || 'Open'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {item.priority && (
                        <Badge className={`${getPriorityColor(item.priority)} rounded`}>
                          {item.priority}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(item.due_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-1">No punch items found</h3>
            <p className="text-muted-foreground mb-4">
              {params.search || params.status
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first punch item'}
            </p>
            <Link href="/punch-list/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Punch Item
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
