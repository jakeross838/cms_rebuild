'use client'

import { useState } from 'react'

import {
  Building2,
  Briefcase,
  Calendar,
  Link2,
  Plus,
  Receipt,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { RowActions } from '@/components/ui/row-actions'
import { InvoiceDetailModal } from '@/components/invoices/invoice-detail-modal'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
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
  PaymentMethod,
} from '@/types/invoice-full'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InvoiceCardData {
  id: string
  invoice_number: string | null
  amount: number
  status: InvoiceStatus
  invoice_type?: InvoiceType
  contract_type?: ContractType
  invoice_date: string | null
  due_date: string | null
  description?: string | null
  notes: string | null
  retainage_amount?: number
  draw_number?: number | null
  lien_waiver_status?: LienWaiverStatus
  ai_confidence?: number | null
  ai_notes?: string | null
  is_auto_coded?: boolean
  current_approval_step?: string | null
  payment_method?: PaymentMethod | null
  paid_date?: string | null
  created_at: string | null
  vendors: { name: string } | null
  jobs: { name: string } | null
  cost_codes?: { code: string; name: string } | null
  purchase_orders?: { po_number: string } | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

interface InvoiceListCardsProps {
  invoices: InvoiceCardData[]
  search?: string
  status?: string
}

export function InvoiceListCards({ invoices, search, status }: InvoiceListCardsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (invoices.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border text-center py-16">
        <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-lg font-medium text-foreground mb-1">No invoices found</p>
        <p className="text-muted-foreground mb-4">
          {search || status
            ? 'Try adjusting your filters or search terms'
            : 'Get started by creating your first invoice'}
        </p>
        {!search && !status && (
          <a href="/invoices/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </a>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {invoices.map((inv) => {
          const statusCfg = INVOICE_STATUS_CONFIG[inv.status] ?? { label: inv.status, color: 'text-stone-700', bgColor: 'bg-stone-100' }
          const invoiceType = inv.invoice_type || 'standard'
          const contractType = inv.contract_type || 'lump_sum'
          const typeCfg = INVOICE_TYPE_CONFIG[invoiceType]
          const contractCfg = CONTRACT_TYPE_CONFIG[contractType]
          const dueLabel = getDueDateLabel(inv.due_date)
          const lienWaiverStatus = inv.lien_waiver_status || 'not_required'
          const lienWaiver = getLienWaiverBadge(lienWaiverStatus)
          const isCreditMemo = invoiceType === 'credit_memo'
          const isPaidOrDenied = inv.status === 'paid' || inv.status === 'denied'
          const isWarningNote = inv.ai_notes
            ? /overdue|higher|over PO|denied|disputed|warning|missing|exceed/i.test(inv.ai_notes)
            : false

          return (
            <div
              key={inv.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(inv.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(inv.id) } }}
              className="block bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow cursor-pointer"
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
                    {invoiceType !== 'standard' && typeCfg && (
                      <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', typeCfg.color)}>
                        {typeCfg.label}
                      </span>
                    )}
                    {contractType !== 'lump_sum' && contractCfg && (
                      <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">
                        {contractCfg.abbrev}
                      </span>
                    )}
                    {inv.is_auto_coded === true && (
                      <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Sparkles className="h-2.5 w-2.5" />
                        AI Coded
                      </span>
                    )}
                    {inv.ai_confidence != null && inv.ai_confidence < 0.9 && (
                      <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">
                        {Math.round((inv.ai_confidence ?? 0) * 100)}% conf
                      </span>
                    )}
                  </div>

                  {/* Row 2: Vendor + Job */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4 text-muted-foreground/60" />
                      <span className="truncate">
                        {inv.vendors?.name || 'No vendor assigned'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4 text-muted-foreground/60" />
                      <span className="truncate">
                        {inv.jobs?.name || 'No job assigned'}
                      </span>
                    </div>
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
                    {inv.draw_number != null && inv.draw_number > 0 && (
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
                    {(inv.retainage_amount ?? 0) > 0 && (
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

                {/* Right side — Amount, Due date, Actions */}
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
                    {(inv.retainage_amount ?? 0) > 0 && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Net: {formatCurrency(inv.amount - (inv.retainage_amount ?? 0))}
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
                        <span className={dueLabel.className}>{dueLabel.text}</span>
                      )}
                      {inv.paid_date && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                          Paid {formatDate(inv.paid_date)}
                        </span>
                      )}
                    </div>
                    {inv.payment_method && inv.status === 'paid' && (
                      <div className="text-xs text-muted-foreground mt-0.5 uppercase">
                        {inv.payment_method}
                      </div>
                    )}
                  </div>
                  <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                    <RowActions
                      editHref={`/invoices/${inv.id}`}
                      archiveAction={{
                        entityId: inv.id,
                        entityType: 'invoices',
                        entityName: 'invoice',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <InvoiceDetailModal
        invoiceId={selectedId}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
      />
    </>
  )
}
