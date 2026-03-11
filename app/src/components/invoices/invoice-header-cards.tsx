'use client'

import {
  CheckCircle2,
  DollarSign,
  Loader2,
  XCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate, formatStatus, cn } from '@/lib/utils'
import type { InvoiceStatus, Invoice as InvoiceFullType } from '@/types/invoice-full'
import {
  INVOICE_STATUS_TRANSITIONS,
  INVOICE_STATUS_CONFIG,
} from '@/types/invoice-full'
import {
  STATUS_PIPELINE,
  PIPELINE_LABELS,
  getDaysUntilDue,
} from '@/components/invoices/invoice-detail-types'

// -- AmountHeroCard ---------------------------------------------------------

interface AmountHeroCardProps {
  invoice: InvoiceFullType
  netAmount: number
}

export function AmountHeroCard({ invoice, netAmount }: AmountHeroCardProps) {
  const dueInfo = getDaysUntilDue(invoice.due_date ?? null)

  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success-bg">
              <DollarSign className="h-6 w-6 text-success-dark" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-3xl font-bold tracking-tight">{formatCurrency(invoice.amount)}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            {invoice.retainage_percent > 0 && (
              <div className="text-center">
                <p className="text-muted-foreground">Net (after {invoice.retainage_percent}% retainage)</p>
                <p className="text-xl font-semibold">{formatCurrency(netAmount)}</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-muted-foreground">Due Date</p>
              <p className="text-lg font-semibold">{formatDate(invoice.due_date) || '--'}</p>
              {dueInfo && (
                <p className={cn('text-xs mt-0.5', dueInfo.className)}>
                  {dueInfo.label}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// -- ApprovalPipelineCard ---------------------------------------------------

interface ApprovalPipelineCardProps {
  currentStatus: InvoiceStatus
}

export function ApprovalPipelineCard({ currentStatus }: ApprovalPipelineCardProps) {
  const isDenied = currentStatus === 'denied'
  const currentPipelineIndex = STATUS_PIPELINE.indexOf(currentStatus)
  const effectivePipelineIndex = currentPipelineIndex >= 0
    ? currentPipelineIndex
    : (currentStatus === 'accountant_pending' || currentStatus === 'owner_pending')
      ? 1
      : -1

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Approval Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        {isDenied ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <XCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">Invoice Denied</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                This invoice was denied. You can reopen it as a draft to restart the workflow.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            {STATUS_PIPELINE.map((status, index) => {
              const isComplete = index < effectivePipelineIndex
              const isCurrent = index === effectivePipelineIndex
              return (
                <div key={status} className="flex items-center">
                  {index > 0 && (
                    <div
                      className={cn(
                        'h-0.5 w-8 sm:w-12 shrink-0',
                        isComplete ? 'bg-emerald-500' : 'bg-border'
                      )}
                    />
                  )}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors',
                        isComplete
                          ? 'bg-emerald-100 text-emerald-700'
                          : isCurrent
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                            : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-[10px] sm:text-xs text-center max-w-[60px] sm:max-w-[80px] leading-tight',
                        isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {PIPELINE_LABELS[status] ?? formatStatus(status)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// -- StatusTransitionButtons ------------------------------------------------

interface StatusTransitionButtonsProps {
  currentStatus: InvoiceStatus
  onStatusChange: (newStatus: InvoiceStatus) => void
  isPending: boolean
}

export function StatusTransitionButtons({ currentStatus, onStatusChange, isPending }: StatusTransitionButtonsProps) {
  const transitions = INVOICE_STATUS_TRANSITIONS[currentStatus] ?? []

  if (transitions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-3">
      {transitions.map((action) => (
        <Button
          key={action.next}
          variant={action.variant === 'destructive' ? 'destructive' : 'default'}
          onClick={() => onStatusChange(action.next)}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : action.variant === 'destructive' ? (
            <XCircle className="h-4 w-4 mr-2" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          {action.label}
        </Button>
      ))}
    </div>
  )
}
