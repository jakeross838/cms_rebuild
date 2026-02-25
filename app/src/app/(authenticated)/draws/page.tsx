import Link from 'next/link'

import { Receipt, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface DrawRequestRow {
  id: string
  job_id: string
  draw_number: number | null
  application_date: string | null
  status: string | null
  current_due: number | null
  total_completed: number | null
  contract_amount: number | null
  created_at: string | null
  jobs: { name: string; job_number: string | null } | null
}

export default async function DrawsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('draw_requests')
    .select('id, job_id, draw_number, application_date, status, current_due, total_completed, contract_amount, created_at, jobs(name, job_number)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const { data: drawsData, error } = await query
  const draws = error ? [] : ((drawsData || []) as DrawRequestRow[])

  // Client-side search filter (draw_number is integer, not text)
  const filteredDraws = params.search
    ? draws.filter((d) =>
        d.jobs?.name?.toLowerCase().includes(params.search!.toLowerCase()) ||
        d.jobs?.job_number?.toLowerCase().includes(params.search!.toLowerCase()) ||
        String(d.draw_number).includes(params.search!)
      )
    : draws

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Draw Requests</h1>
        <p className="text-muted-foreground">AIA-format draw requests across all jobs</p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form>
            <Input
              type="search"
              name="search"
              placeholder="Search draw requests..."
              defaultValue={params.search}
              className="pl-10"
            />
          </form>
        </div>
      </div>

      {/* Draws list */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {filteredDraws.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredDraws.map((draw) => (
              <Link
                key={draw.id}
                href={`/jobs/${draw.job_id}/draws`}
                className="block p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            Draw #{draw.draw_number ?? '—'}
                          </span>
                          {draw.status && (
                            <Badge className={getStatusColor(draw.status)}>
                              {draw.status.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {draw.jobs?.job_number ? `${draw.jobs.job_number} - ` : ''}
                          {draw.jobs?.name || 'Unknown job'}
                          {draw.application_date ? ` | Applied ${formatDate(draw.application_date)}` : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="font-medium text-foreground">
                      {formatCurrency(draw.current_due)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      of {formatCurrency(draw.contract_amount)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-1">No draw requests found</h3>
            <p className="text-muted-foreground mb-4">
              {params.search
                ? 'Try adjusting your search'
                : 'Create draw requests from within a job'}
            </p>
            <Link
              href="/jobs"
              className="text-sm font-medium text-primary hover:underline"
            >
              Go to Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
