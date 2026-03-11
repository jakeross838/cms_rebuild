'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  FileText,
  Building2,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBatchConfirmExtractions, useBatchRejectExtractions } from '@/hooks/use-invoices'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExtractionRow {
  id: string
  status: string
  confidence_score: number | null
  extracted_data: Record<string, unknown>
  error_message: string | null
  vendor_match_id: string | null
  job_match_id: string | null
  reviewed_by: string | null
  matched_bill_id: string | null
  created_at: string
}

type StatusKey = 'processing' | 'extracted' | 'review' | 'confirmed' | 'failed' | 'pending'

// ---------------------------------------------------------------------------
// Status config (mirrors the server page)
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<StatusKey, { label: string; className: string; icon: typeof Loader2 }> = {
  pending: { label: 'Pending', className: 'bg-stone-100 text-stone-700', icon: FileText },
  processing: { label: 'Processing', className: 'bg-amber-100 text-amber-700', icon: Loader2 },
  extracted: { label: 'Ready', className: 'bg-blue-100 text-blue-700', icon: Eye },
  review: { label: 'Needs Review', className: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  confirmed: { label: 'Confirmed', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700', icon: XCircle },
}

function mapDbStatus(dbStatus: string, reviewedBy?: string | null): StatusKey {
  if (dbStatus === 'completed' && reviewedBy) return 'confirmed'
  if (dbStatus === 'completed') return 'extracted'
  if (dbStatus === 'needs_review') return 'review'
  return (dbStatus as StatusKey) ?? 'pending'
}

function isActionableStatus(status: StatusKey): boolean {
  return status === 'extracted' || status === 'review'
}

function getConfidenceColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}

function getConfidenceBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ExtractionBatchActionsProps {
  extractions: ExtractionRow[]
}

export default function ExtractionBatchActions({ extractions }: ExtractionBatchActionsProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const batchConfirm = useBatchConfirmExtractions()
  const batchReject = useBatchRejectExtractions()

  const isBusy = batchConfirm.isPending || batchReject.isPending

  // Compute which rows are actionable
  const actionableIds = extractions
    .filter((row) => isActionableStatus(mapDbStatus(row.status, row.reviewed_by)))
    .map((row) => row.id)

  const allActionableSelected =
    actionableIds.length > 0 && actionableIds.every((id) => selected.has(id))

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    if (allActionableSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(actionableIds))
    }
  }, [allActionableSelected, actionableIds])

  const clearSelection = useCallback(() => {
    setSelected(new Set())
    setShowRejectInput(false)
    setRejectReason('')
  }, [])

  const handleBatchConfirm = useCallback(async () => {
    if (selected.size === 0) return
    try {
      const result = await batchConfirm.mutateAsync({ extraction_ids: Array.from(selected) }) as { data: { confirmed: number; skipped: number; errors: number } }
      const { confirmed, skipped, errors } = result.data
      toast.success(`Batch confirm complete: ${confirmed} confirmed, ${skipped} skipped, ${errors} errors`)
      clearSelection()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Batch confirm failed')
    }
  }, [selected, batchConfirm, clearSelection, router])

  const handleBatchReject = useCallback(async () => {
    if (selected.size === 0) return
    try {
      const result = await batchReject.mutateAsync({
        extraction_ids: Array.from(selected),
        reason: rejectReason || undefined,
      }) as { data: { rejected: number; errors: number } }
      const { rejected, errors } = result.data
      toast.success(`Batch reject complete: ${rejected} rejected, ${errors} errors`)
      clearSelection()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Batch reject failed')
    }
  }, [selected, rejectReason, batchReject, clearSelection, router])

  return (
    <>
      {/* Batch action bar */}
      {selected.size > 0 && (
        <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
          <span className="text-sm font-medium text-foreground">
            {selected.size} selected
          </span>

          {showRejectInput ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Input
                placeholder="Rejection reason (optional)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="max-w-xs h-8 text-sm"
                disabled={isBusy}
              />
              <Button
                size="sm"
                variant="destructive"
                disabled={isBusy}
                onClick={handleBatchReject}
              >
                {batchReject.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                Reject {selected.size}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowRejectInput(false)}
                disabled={isBusy}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isBusy}
                onClick={handleBatchConfirm}
              >
                {batchConfirm.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                )}
                Confirm All
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                disabled={isBusy}
                onClick={() => setShowRejectInput(true)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject All
              </Button>
            </>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="ml-auto"
            onClick={clearSelection}
            disabled={isBusy}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {extractions.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-base font-medium text-foreground">No extractions found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload invoices to get started
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden sm:grid sm:grid-cols-[40px_1fr_150px_120px_100px_100px_80px] gap-3 px-4 py-2.5 bg-accent/50 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
              <span className="flex items-center justify-center">
                {actionableIds.length > 0 && (
                  <input
                    type="checkbox"
                    checked={allActionableSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-border accent-emerald-600 cursor-pointer"
                    aria-label="Select all actionable extractions"
                  />
                )}
              </span>
              <span>Document</span>
              <span>Vendor</span>
              <span className="text-right">Amount</span>
              <span>Date</span>
              <span>Status</span>
              <span className="text-right">Confidence</span>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
              {extractions.map((row) => {
                const extractedData = (row.extracted_data ?? {}) as Record<string, unknown>
                const meta = (extractedData._meta ?? {}) as Record<string, unknown>
                const status = mapDbStatus(row.status, row.reviewed_by)
                const statusCfg = STATUS_CONFIG[status]
                const StatusIcon = statusCfg.icon
                const confidence = typeof row.confidence_score === 'number' ? row.confidence_score : null
                const filename = (meta.original_filename as string) ?? 'Unknown file'
                const vendorName = (extractedData.vendor_name as string) ?? null
                const amount = typeof extractedData.amount === 'number' ? extractedData.amount : null
                const invoiceDate = (extractedData.invoice_date as string) ?? null
                const invoiceNumber = (extractedData.invoice_number as string) ?? null
                const duplicateCheck = (meta.duplicate_check ?? null) as Record<string, unknown> | null
                const actionable = isActionableStatus(status)
                const isSelected = selected.has(row.id)

                return (
                  <div
                    key={row.id}
                    className={cn(
                      'sm:grid sm:grid-cols-[40px_1fr_150px_120px_100px_100px_80px] gap-3 px-4 py-3 transition-colors',
                      isSelected ? 'bg-emerald-50/50' : 'hover:bg-accent/50',
                    )}
                  >
                    {/* Checkbox */}
                    <div className="flex items-center justify-center">
                      {actionable ? (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(row.id)}
                          className="h-4 w-4 rounded border-border accent-emerald-600 cursor-pointer"
                          aria-label={`Select extraction ${filename}`}
                        />
                      ) : (
                        <span className="w-4" />
                      )}
                    </div>

                    {/* Document — wrapped in link */}
                    <Link
                      href={`/invoices/extractions/${row.id}`}
                      className="min-w-0 col-span-1 sm:col-span-1"
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {filename}
                        </p>
                        {(duplicateCheck?.has_duplicate as boolean) && (
                          <span className="flex-shrink-0 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                            Duplicate
                          </span>
                        )}
                      </div>
                      {invoiceNumber && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          #{invoiceNumber}
                        </p>
                      )}
                    </Link>

                    {/* Vendor */}
                    <Link
                      href={`/invoices/extractions/${row.id}`}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground truncate"
                    >
                      {vendorName ? (
                        <>
                          <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{vendorName}</span>
                        </>
                      ) : (
                        <span className="italic text-muted-foreground/60">No vendor</span>
                      )}
                    </Link>

                    {/* Amount */}
                    <Link
                      href={`/invoices/extractions/${row.id}`}
                      className="text-sm font-mono text-right"
                    >
                      {amount != null ? (
                        <span className="font-medium text-foreground">{formatCurrency(amount)}</span>
                      ) : (
                        <span className="text-muted-foreground/60">&mdash;</span>
                      )}
                    </Link>

                    {/* Date */}
                    <Link
                      href={`/invoices/extractions/${row.id}`}
                      className="text-sm text-muted-foreground"
                    >
                      {invoiceDate ? formatDate(invoiceDate) : '\u2014'}
                    </Link>

                    {/* Status */}
                    <Link href={`/invoices/extractions/${row.id}`}>
                      <span className={cn(
                        'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium',
                        statusCfg.className,
                      )}>
                        <StatusIcon className="h-3 w-3" />
                        {statusCfg.label}
                      </span>
                    </Link>

                    {/* Confidence */}
                    <Link
                      href={`/invoices/extractions/${row.id}`}
                      className="text-right"
                    >
                      {confidence != null ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-10 h-1.5 rounded-full bg-stone-200">
                            <div
                              className={cn('h-full rounded-full', getConfidenceBg(confidence))}
                              style={{ width: `${confidence}%` }}
                            />
                          </div>
                          <span className={cn('text-xs font-medium', getConfidenceColor(confidence))}>
                            {confidence}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">&mdash;</span>
                      )}
                    </Link>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </>
  )
}
