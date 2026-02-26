import Link from 'next/link'

import { Plus, Search, BookOpen } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface JournalEntry {
  id: string
  reference_number: string | null
  entry_date: string
  memo: string | null
  status: string
  source_type: string
  created_at: string | null
}

export default async function JournalEntriesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('gl_journal_entries')
    .select('*')
    .is('deleted_at', null)
    .order('entry_date', { ascending: false })

  if (params.search) {
    query = query.or(`reference_number.ilike.%${params.search}%,memo.ilike.%${params.search}%`)
  }

  const { data: entriesData } = await query
  const entries = (entriesData || []) as JournalEntry[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Journal Entries</h1>
          <p className="text-muted-foreground">{entries.length} entries</p>
        </div>
        <Link href="/financial/journal-entries/new"><Button><Plus className="h-4 w-4 mr-2" />New Entry</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search entries..." defaultValue={params.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            All Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length > 0 ? (
            <div className="divide-y divide-border">
              {entries.map((entry) => (
                <Link key={entry.id} href={`/financial/journal-entries/${entry.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {entry.reference_number && <span className="text-sm font-mono text-muted-foreground">{entry.reference_number}</span>}
                        <Badge className={getStatusColor(entry.status)}>{entry.status.replace('_', ' ')}</Badge>
                        <Badge variant="outline" className="text-xs">{entry.source_type}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{formatDate(entry.entry_date)}</span>
                        {entry.memo && <span className="truncate max-w-[300px]">{entry.memo}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No journal entries yet</p>
              <Link href="/financial/journal-entries/new" className="text-sm font-medium text-primary hover:underline">Create your first journal entry</Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
