import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  Plus,
  Search,
  Receipt,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Building2,
  Sparkles,
  Link2,
  ShieldCheck,
  Scale,
  CheckCircle2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { RowActions } from '@/components/ui/row-actions'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { safeOrIlike, formatCurrency, formatDate, cn } from '@/lib/utils'
import {
  INVOICE_STATUS_CONFIG,
  INVOICE_TYPE_CONFIG,
  CONTRACT_TYPE_CONFIG,
} from '@/types/invoice-full'
import type {
  InvoiceStatus,
  InvoiceType,
  ContractType,
  LienWaiverStatus,
} from '@/types/invoice-full'

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Job Invoices' }

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InvoiceRow {
  id: string
  invoice_number: string | null
  amount: number
  status: InvoiceStatus
  invoice_type: InvoiceType
  contract_type: ContractType
  invoice_date: string | null
  due_date: string | null
  description: string | null
  notes: string | null
  retainage_amount: number
  draw_number: number | null
  lien_waiver_status: LienWaiverStatus
  ai_confidence: number | null
  ai_notes: string | null
  is_auto_coded: boolean
  current_approval_step: string | null
  vendors: { name: string } | null
  cost_codes: { code: string; name: string } | null
  purchase_orders: { po_number: string } | null
}

interface StatsInvoice {
  amount: number | null
  status: string | null
  due_date: string | null
  retainage_amount: number | null
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NEEDS_REVIEW_STATUSES = ['draft', 'pm_pending', 'accountant_pending', 'owner_pending']
const OUTSTANDING_STATUSES = ['draft', 'pm_pending', 'accountant_pending', 'owner_pending', 'approved', 'in_draw']

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDueDateLabel(dueDate: string | null): { text: string; className: string } | null {
  if (!dueDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, className: 'bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-xs font-medium' }
  if (days === 0) return { text: 'Due today', className: 'bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-xs font-medium' }
  if (days === 1) return { text: 'Due tomorrow', className: 'bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-xs font-medium' }
  if (days <= 7) return { text: `${days}d`, className: 'bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-xs font-medium' }
  if (days <= 30) return { text: `${days}d`, className: 'bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded text-xs font-medium' }
  return null
}

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

function getLienWaiverBadge(status: LienWaiverStatus): { label: string; className: string } {
  switch (status) {
    case 'received':
      return { label: 'LW: Received', className: 'bg-emerald-50 text-emerald-600' }
    case 'pending':
      return { label: 'LW: Pending', className: 'bg-amber-50 text-amber-600' }
    case 'required':
      return { label: 'LW: Required', className: 'bg-red-50 text-red-600' }
    default:
      return { label: 'LW: N/A', className: 'bg-stone-50 text-stone-400' }
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function JobInvoicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ search?: string; status?: string; page?: string; sort?: string }>
}) {
  const { id: jobId } = await params
  const sparams = await searchParams
  const page = Number(sparams.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const { companyId, supabase } = await getServerAuth()

  const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).is('deleted_at', null).single()
  if (!jobCheck) notFound()

  // Sort configuration
  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    amount: { column: 'amount', ascending: false },
    due_date: { column: 'due_date', ascending: true },
    status: { column: 'status', ascending: true },
    invoice_number: { column: 'invoice_number', ascending: true },
  }
  const sort = sortMap[sparams.sort || ''] || { column: 'created_at', ascending: false }

  // Main query with joins
  let query = supabase
    .from('invoices')
    .select('*, vendors(name), cost_codes(code, name), purchase_orders(po_number)', { count: 'exact' })
    .eq('job_id', jobId)
    .eq('company_id', companyId)
    .is('deleted_at', null)

  if (sparams.search) {
    query = query.or(`invoice_number.ilike.${safeOrIlike(sparams.search)},notes.ilike.${safeOrIlike(sparams.search)},description.ilike.${safeOrIlike(sparams.search)}`)
  }

  // Status filtering
  const statusFilter = sparams.status
  if (statusFilter === 'needs_review') {
    query = query.in('status', NEEDS_REVIEW_STATUSES as unknown as InvoiceStatus[])
  } else if (statusFilter) {
    query = query.eq('status', statusFilter as InvoiceStatus)
  }

  const [mainResult, statsResult] = await Promise.all([
    query.order(sort.column, { ascending: sort.ascending }).range(offset, offset + pageSize - 1),
    supabase.from('invoices').select('amount, status, due_date, retainage_amount').eq('job_id', jobId).eq('company_id', companyId).is('deleted_at', null),
  ])

  if (mainResult.error) throw mainResult.error
  const invoices = (mainResult.data || []) as unknown as InvoiceRow[]
  const count = mainResult.count || 0
  const totalPages = Math.ceil(count / pageSize)
  const allInvoices = (statsResult.data || []) as unknown as StatsInvoice[]
  const stats = computeStats(allInvoices)

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
      icon: stats.overdueCount > 0 ? AlertTriangle : CheckCircle,
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
  // URL builder
  // -----------------------------------------------------------------------

  function buildHref(overrides: Record<string, string | undefined>) {
    const sp = new URLSearchParams()
    const merged = { ...sparams, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v)
    }
    const qs = sp.toString()
    return `/jobs/${jobId}/invoices${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">
            {count.toLocaleString()} invoice{count !== 1 ? 's' : ''}
            {' '}&middot; {formatCurrency(stats.outstandingAmount)} outstanding
          </p>
        </div>
        <Link href={`/invoices/new?job_id=${jobId}`}>
          <Button><Plus className="h-4 w-4 mr-2" />New Invoice</Button>
        </Link>
      </div>

      {/* Stats */}
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

      {/* Filter Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <form>
              <Input type="search" name="search" placeholder="Search invoice #, notes, description..." aria-label="Search invoices" defaultValue={sparams.search} className="pl-10" />
            </form>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {statusTabs.map((tab) => (
              <Link key={tab.value} href={buildHref({ status: tab.value || undefined, page: undefined })}>
                <Button
                  variant={sparams.status === tab.value || (!sparams.status && !tab.value) ? 'default' : 'outline'}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {tab.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground self-center">Sort:</span>
          {sortOptions.map((s) => (
            <Link key={s.value} href={buildHref({ sort: s.value || undefined, page: undefined })}>
              <Button variant={(sparams.sort || '') === s.value ? 'default' : 'outline'} size="sm">{s.label}</Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Invoice Cards */}
      <div className="space-y-3">
        {invoices.length > 0 ? (
          invoices.map((inv) => {
            const statusCfg = INVOICE_STATUS_CONFIG[inv.status] ?? { label: inv.status, color: 'text-stone-700', bgColor: 'bg-stone-100' }
            const typeCfg = INVOICE_TYPE_CONFIG[inv.invoice_type]
            const contractCfg = CONTRACT_TYPE_CONFIG[inv.contract_type]
            const dueLabel = getDueDateLabel(inv.due_date)
            const lienWaiver = getLienWaiverBadge(inv.lien_waiver_status)
            const isCreditMemo = inv.invoice_type === 'credit_memo'
            const isPaidOrDenied = inv.status === 'paid' || inv.status === 'denied'
            const isWarningNote = inv.ai_notes
              ? /overdue|higher|over PO|denied|disputed|warning|missing|exceed/i.test(inv.ai_notes)
              : false

            return (
              <Link
                key={inv.id}
                href={`/jobs/${jobId}/invoices/${inv.id}`}
                className="block bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left side */}
                  <div className="flex-1 min-w-0">
                    {/* Row 1: Invoice number + status + type + contract type + AI badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {inv.invoice_number ? (
                        <span className="font-mono text-sm font-medium text-foreground">
                          {inv.invoice_number}
                        </span>
                      ) : (
                        <span className="font-mono text-sm font-medium text-muted-foreground italic">
                          No invoice #
                        </span>
                      )}
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded font-medium',
                        statusCfg.bgColor,
                        statusCfg.color,
                      )}>
                        {statusCfg.label}
                      </span>
                      {inv.invoice_type !== 'standard' && typeCfg && (
                        <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', typeCfg.color)}>
                          {typeCfg.label}
                        </span>
                      )}
                      {inv.contract_type !== 'lump_sum' && contractCfg && (
                        <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">
                          {contractCfg.abbrev}
                        </span>
                      )}
                      {inv.is_auto_coded && (
                        <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Sparkles className="h-2.5 w-2.5" />
                          AI Coded
                        </span>
                      )}
                      {inv.ai_confidence !== null && inv.ai_confidence < 0.9 && (
                        <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">
                          {Math.round(inv.ai_confidence * 100)}% conf
                        </span>
                      )}
                    </div>

                    {/* Row 2: Vendor */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4 text-muted-foreground/60" />
                      <span className="truncate">
                        {inv.vendors?.name || 'No vendor assigned'}
                      </span>
                      {inv.invoice_date && <span>&middot; {formatDate(inv.invoice_date)}</span>}
                    </div>

                    {/* Row 3: Description preview */}
                    {inv.description && (
                      <p className="text-sm text-muted-foreground mt-2 truncate max-w-xl">
                        {inv.description}
                      </p>
                    )}

                    {/* Row 4: Cross-module badges */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {inv.purchase_orders?.po_number && (
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Link2 className="h-3 w-3" />
                          {inv.purchase_orders.po_number}
                        </span>
                      )}
                      {inv.cost_codes && (
                        <span className="text-xs bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-mono">
                          {inv.cost_codes.code}
                          {inv.cost_codes.name ? ` - ${inv.cost_codes.name}` : ''}
                        </span>
                      )}
                      {inv.draw_number !== null && inv.draw_number > 0 && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                          Draw #{inv.draw_number}
                        </span>
                      )}
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded flex items-center gap-1',
                        lienWaiver.className,
                      )}>
                        <ShieldCheck className="h-3 w-3" />
                        {lienWaiver.label}
                      </span>
                      {inv.retainage_amount > 0 && (
                        <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">
                          Ret: {formatCurrency(inv.retainage_amount)}
                        </span>
                      )}
                      {inv.current_approval_step && !isPaidOrDenied && (
                        <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">
                          {inv.current_approval_step}
                        </span>
                      )}
                    </div>

                    {/* Row 5: AI notes */}
                    {inv.ai_notes && (
                      <div className={cn(
                        'mt-3 p-2 rounded-md flex items-start gap-2 text-sm',
                        isWarningNote ? 'bg-amber-50' : 'bg-stone-50',
                      )}>
                        <Sparkles className={cn(
                          'h-4 w-4 mt-0.5 flex-shrink-0',
                          isWarningNote ? 'text-amber-500' : 'text-stone-500',
                        )} />
                        <span className={cn(
                          isWarningNote ? 'text-amber-700' : 'text-stone-700',
                        )}>
                          {inv.ai_notes}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right side -- Amount, Due date, Actions */}
                  <div className="flex items-start gap-3 ml-4 flex-shrink-0">
                    <div className="text-right">
                      <div className={cn(
                        'text-lg font-bold font-mono',
                        isCreditMemo ? 'text-emerald-700' : isPaidOrDenied ? 'text-muted-foreground' : 'text-foreground',
                      )}>
                        {isCreditMemo
                          ? `(${formatCurrency(Math.abs(inv.amount))})`
                          : formatCurrency(inv.amount)}
                      </div>
                      {inv.retainage_amount > 0 && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Net: {formatCurrency(inv.amount - inv.retainage_amount)}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm mt-1 justify-end">
                        {inv.due_date && (
                          <>
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                            <span className="text-muted-foreground">
                              Due {formatDate(inv.due_date)}
                            </span>
                          </>
                        )}
                        {!isPaidOrDenied && dueLabel && (
                          <span className={dueLabel.className}>
                            {dueLabel.text}
                          </span>
                        )}
                      </div>
                    </div>
                    <RowActions
                      editHref={`/jobs/${jobId}/invoices/${inv.id}`}
                      archiveAction={{ entityId: inv.id, entityType: 'invoices', entityName: 'invoice' }}
                    />
                  </div>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="bg-card rounded-lg border border-border text-center py-16">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground mb-1">No invoices</p>
            <p className="text-muted-foreground mb-4">
              {sparams.search || sparams.status ? 'Try adjusting your filters' : 'No invoices for this job yet'}
            </p>
            <Link href={`/invoices/new?job_id=${jobId}`} className="text-sm font-medium text-primary hover:underline">Create your first invoice</Link>
          </div>
        )}
      </div>

      <ListPagination currentPage={page} totalPages={totalPages} basePath={`/jobs/${jobId}/invoices`} searchParams={sparams as Record<string, string | undefined>} />
    </div>
  )
}
