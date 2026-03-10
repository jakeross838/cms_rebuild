import type { Metadata } from 'next'
import Link from 'next/link'

import {
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Upload,
  Scale,
  Calendar,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InvoiceListCards, type InvoiceCardData } from '@/components/invoices/invoice-list-cards'
import { getServerAuth } from '@/lib/supabase/get-auth'
import {
  safeOrIlike,
  formatCurrency,
  cn,
} from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// InvoiceRow type kept minimal — full typing in InvoiceCardData (client component)
interface InvoiceRow {
  id: string
  amount: number
  status: string
  due_date: string | null
  [key: string]: unknown
}

interface StatsInvoice {
  amount: number | null
  status: string | null
  due_date: string | null
  retainage_amount: number | null
  invoice_type: string | null
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = { title: 'Invoices' }

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NEEDS_REVIEW_STATUSES = ['draft', 'pm_pending', 'accountant_pending', 'owner_pending']
const OUTSTANDING_STATUSES = ['draft', 'pm_pending', 'accountant_pending', 'owner_pending', 'approved', 'in_draw']

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeStats(allInvoices: StatsInvoice[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(today)
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()))

  let pendingCount = 0
  let pendingAmount = 0
  let approvedCount = 0
  let approvedAmount = 0
  let dueThisWeekCount = 0
  let dueThisWeekAmount = 0
  let overdueCount = 0
  let overdueAmount = 0
  let outstandingAmount = 0
  let retainageHeld = 0

  for (const inv of allInvoices) {
    const amount = inv.amount ?? 0
    const status = inv.status ?? ''
    const retainage = inv.retainage_amount ?? 0

    if (OUTSTANDING_STATUSES.includes(status)) {
      outstandingAmount += amount
    }

    if (NEEDS_REVIEW_STATUSES.includes(status)) {
      pendingCount++
      pendingAmount += amount
    }

    if (status === 'approved') {
      approvedCount++
      approvedAmount += amount
    }

    // Retainage: count for all non-denied, non-paid statuses
    if (status !== 'denied' && status !== 'paid' && retainage > 0) {
      retainageHeld += retainage
    }

    if (inv.due_date && OUTSTANDING_STATUSES.includes(status)) {
      const due = new Date(inv.due_date)
      due.setHours(0, 0, 0, 0)

      if (due < today) {
        overdueCount++
        overdueAmount += amount
      } else if (due <= endOfWeek) {
        dueThisWeekCount++
        dueThisWeekAmount += amount
      }
    }
  }

  return {
    pendingCount,
    pendingAmount,
    approvedCount,
    approvedAmount,
    dueThisWeekCount,
    dueThisWeekAmount,
    overdueCount,
    overdueAmount,
    outstandingAmount,
    retainageHeld,
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string; sort?: string; job?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const { companyId, supabase } = await getServerAuth()

  // Sort configuration
  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    created_at: { column: 'created_at', ascending: false },
    amount: { column: 'amount', ascending: false },
    due_date: { column: 'due_date', ascending: true },
    invoice_number: { column: 'invoice_number', ascending: true },
  }
  const sort = sortMap[params.sort || ''] || { column: 'created_at', ascending: false }

  // -----------------------------------------------------------------------
  // Main paginated query with joins
  // -----------------------------------------------------------------------

  // Use (supabase as any) because new columns from migration may not be in generated types yet.
  // Gracefully handle missing columns/joins by selecting only base columns + optional joins.
  let query = (supabase as any)
    .from('invoices')
    .select('*, vendors(name), jobs(name), cost_codes(code, name), purchase_orders(po_number)', { count: 'exact' })
    .eq('company_id', companyId)
    .order(sort.column, { ascending: sort.ascending })

  // Job filtering (from sidebar)
  if (params.job) {
    query = query.eq('job_id', params.job)
  }

  // Status filtering
  const statusFilter = params.status
  if (statusFilter === 'needs_review') {
    query = query.in('status', NEEDS_REVIEW_STATUSES)
  } else if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  // Search filtering (invoice_number, notes)
  if (params.search) {
    query = query.or(
      `invoice_number.ilike.${safeOrIlike(params.search)},notes.ilike.${safeOrIlike(params.search)}`
    )
  }

  query = query.range(offset, offset + pageSize - 1)

  // -----------------------------------------------------------------------
  // Stats query (separate, lightweight — no pagination)
  // -----------------------------------------------------------------------

  let statsQuery = (supabase as any)
    .from('invoices')
    .select('amount, status, due_date, retainage_amount')
    .eq('company_id', companyId)

  if (params.job) {
    statsQuery = statsQuery.eq('job_id', params.job)
  }

  // Fetch selected job name if filtering by job
  const jobNameQuery = params.job
    ? (supabase as any).from('jobs').select('name').eq('id', params.job).single()
    : null

  // Run all queries in parallel
  const [mainResult, statsResult, jobResult] = await Promise.all([
    query,
    statsQuery,
    ...(jobNameQuery ? [jobNameQuery] : [Promise.resolve(null)]),
  ])

  if (mainResult.error) throw mainResult.error
  const invoices = (mainResult.data || []) as unknown as InvoiceRow[]
  const count = mainResult.count || 0
  const totalPages = Math.ceil(count / pageSize)

  const allInvoices = (statsResult.data || []) as unknown as StatsInvoice[]
  const stats = computeStats(allInvoices)
  const selectedJobName = jobResult?.data?.name as string | undefined

  // -----------------------------------------------------------------------
  // Filter / sort configuration
  // -----------------------------------------------------------------------

  const statusTabs = [
    { value: '', label: 'All' },
    { value: 'needs_review', label: 'Needs Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'in_draw', label: 'In Draw' },
    { value: 'paid', label: 'Paid' },
    { value: 'denied', label: 'Denied' },
  ]

  const sortOptions = [
    { value: '', label: 'Newest' },
    { value: 'amount', label: 'Amount' },
    { value: 'due_date', label: 'Due Date' },
    { value: 'invoice_number', label: 'Invoice #' },
  ]

  // -----------------------------------------------------------------------
  // Stats cards
  // -----------------------------------------------------------------------

  const statsCards = [
    {
      label: 'Pending Review',
      count: stats.pendingCount,
      amount: stats.pendingAmount,
      icon: Clock,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
    {
      label: 'Approved / Payable',
      count: stats.approvedCount,
      amount: stats.approvedAmount,
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    {
      label: 'Due This Week',
      count: stats.dueThisWeekCount,
      amount: stats.dueThisWeekAmount,
      icon: Calendar,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      label: 'Overdue',
      count: stats.overdueCount,
      amount: stats.overdueAmount,
      icon: stats.overdueCount > 0 ? AlertTriangle : CheckCircle2,
      iconColor: stats.overdueCount > 0 ? 'text-red-500' : 'text-emerald-500',
      bgColor: stats.overdueCount > 0 ? 'bg-red-50' : 'bg-emerald-50',
      textColor: stats.overdueCount > 0 ? 'text-red-700' : 'text-emerald-700',
    },
    {
      label: 'Retainage Held',
      count: null as number | null,
      amount: stats.retainageHeld,
      icon: Scale,
      iconColor: 'text-stone-500',
      bgColor: 'bg-stone-50',
      textColor: 'text-stone-700',
    },
  ]

  // -----------------------------------------------------------------------
  // URL builder for link-based filtering
  // -----------------------------------------------------------------------

  function buildFilterHref(overrides: Record<string, string | undefined>): string {
    const sp = new URLSearchParams()
    if (overrides.status !== undefined) {
      if (overrides.status) sp.set('status', overrides.status)
    } else if (params.status) {
      sp.set('status', params.status)
    }
    if (overrides.search !== undefined) {
      if (overrides.search) sp.set('search', overrides.search)
    } else if (params.search) {
      sp.set('search', params.search)
    }
    if (overrides.sort !== undefined) {
      if (overrides.sort) sp.set('sort', overrides.sort)
    } else if (params.sort) {
      sp.set('sort', params.sort)
    }
    if (overrides.page !== undefined) {
      if (overrides.page) sp.set('page', overrides.page)
    } else if (params.page) {
      sp.set('page', params.page)
    }
    // Preserve job filter from sidebar
    if (params.job) {
      sp.set('job', params.job)
    }
    const qs = sp.toString()
    return `/invoices${qs ? `?${qs}` : ''}`
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Header                                                            */}
      {/* ================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Invoices
            {selectedJobName && (
              <span className="text-base font-normal text-muted-foreground ml-2">
                — {selectedJobName}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">
            {count.toLocaleString()} invoice{count !== 1 ? 's' : ''}
            {selectedJobName ? ' for this job' : ' total'}
            {' '}&middot; {formatCurrency(stats.outstandingAmount)} outstanding
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/invoices/extractions">
            <Button variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Extractions
            </Button>
          </Link>
          <Link href="/invoices/upload">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload PDF
            </Button>
          </Link>
          <Link href="/invoices/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Stats Bar — 5 cards                                               */}
      {/* ================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statsCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={cn('rounded-lg p-3', card.bgColor)}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn('h-3.5 w-3.5', card.iconColor)} />
                <span className={cn('text-xs font-medium truncate', card.textColor)}>
                  {card.label}
                  {card.count !== null && ` (${card.count})`}
                </span>
              </div>
              <div className={cn('text-lg font-bold', card.textColor)}>
                {formatCurrency(card.amount)}
              </div>
              {card.count !== null && (
                <div className="text-xs text-muted-foreground">
                  {card.count} invoice{card.count !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ================================================================= */}
      {/* Filter Bar — Search + Status Tabs + Sort                          */}
      {/* ================================================================= */}
      <div className="flex flex-col gap-4">
        {/* Search + Status Tabs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <form>
              <Input
                type="search"
                name="search"
                placeholder="Search invoice #, notes, description..."
                aria-label="Search invoices"
                defaultValue={params.search}
                className="pl-10"
              />
            </form>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {statusTabs.map((tab) => (
              <Link key={tab.value} href={buildFilterHref({ status: tab.value, page: undefined })}>
                <Button
                  variant={
                    params.status === tab.value || (!params.status && !tab.value)
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {tab.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground self-center">Sort:</span>
          {sortOptions.map((s) => (
            <Link key={s.value} href={buildFilterHref({ sort: s.value, page: undefined })}>
              <Button
                variant={(params.sort || '') === s.value ? 'default' : 'outline'}
                size="sm"
              >
                {s.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* Invoice Cards                                                     */}
      {/* ================================================================= */}
      <InvoiceListCards
        invoices={invoices as unknown as InvoiceCardData[]}
        search={params.search}
        status={params.status}
      />

      {/* ================================================================= */}
      {/* Pagination                                                        */}
      {/* ================================================================= */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({count} total)
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={buildFilterHref({ page: String(page - 1) })}>
                <Button variant="outline" size="sm">Previous</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={buildFilterHref({ page: String(page + 1) })}>
                <Button variant="outline" size="sm">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
