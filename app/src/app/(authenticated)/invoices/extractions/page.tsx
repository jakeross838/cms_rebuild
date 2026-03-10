import type { Metadata } from 'next'
import Link from 'next/link'

import {
  Sparkles,
  FileText,
  Building2,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  ArrowLeft,
  Upload,
  BarChart3,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { createServiceClient } from '@/lib/supabase/service'
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

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = { title: 'AI Extractions' }

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

type StatusKey = 'processing' | 'extracted' | 'review' | 'confirmed' | 'failed' | 'pending'

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
// Page
// ---------------------------------------------------------------------------

export default async function ExtractionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string; sort?: string }>
}) {
  const { companyId } = await getServerAuth()
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const limit = 20
  const offset = (page - 1) * limit

  const supabase = createServiceClient()

  // Build query
  let query = supabase
    .from('invoice_extractions' as any)
    .select('*', { count: 'exact' })
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  // Status filter
  if (params.status) {
    if (params.status === 'confirmed') {
      // Confirmed = completed + reviewed_by is set
      query = query.eq('status', 'completed').not('reviewed_by', 'is', null)
    } else if (params.status === 'extracted') {
      // Ready = completed but not yet reviewed
      query = query.eq('status', 'completed').is('reviewed_by', null)
    } else {
      const dbStatus = params.status === 'review' ? 'needs_review' : params.status
      query = query.eq('status', dbStatus)
    }
  }

  const { data, count } = await query.range(offset, offset + limit - 1)
  const extractions = (data ?? []) as ExtractionRow[]
  const total = count ?? 0
  const totalPages = Math.ceil(total / limit)

  // Compute stats — include reviewed_by to distinguish confirmed from ready
  const { data: allData } = await supabase
    .from('invoice_extractions' as any)
    .select('status, confidence_score, reviewed_by')
    .eq('company_id', companyId)
  const all = (allData ?? []) as Array<{ status: string; confidence_score: number | null; reviewed_by: string | null }>

  const processingCount = all.filter(e => e.status === 'processing').length
  const readyCount = all.filter(e => (e.status === 'completed' && !e.reviewed_by) || e.status === 'needs_review').length
  const confirmedCount = all.filter(e => e.status === 'completed' && e.reviewed_by).length
  const failedCount = all.filter(e => e.status === 'failed').length

  const statsCards = [
    { label: 'Processing', value: processingCount, icon: Loader2, bgColor: 'bg-amber-50', textColor: 'text-amber-700', iconColor: 'text-amber-500' },
    { label: 'Ready for Review', value: readyCount, icon: Eye, bgColor: 'bg-blue-50', textColor: 'text-blue-700', iconColor: 'text-blue-500' },
    { label: 'Confirmed', value: confirmedCount, icon: CheckCircle2, bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', iconColor: 'text-emerald-500' },
    { label: 'Failed', value: failedCount, icon: XCircle, bgColor: 'bg-red-50', textColor: 'text-red-700', iconColor: 'text-red-500' },
  ]

  // Active filter tabs
  const filterTabs: Array<{ label: string; value: string | undefined; count: number }> = [
    { label: 'All', value: undefined, count: all.length },
    { label: 'Processing', value: 'processing', count: processingCount },
    { label: 'Ready', value: 'extracted', count: readyCount },
    { label: 'Failed', value: 'failed', count: failedCount },
    { label: 'Confirmed', value: 'confirmed', count: confirmedCount },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/invoices"
            className="mt-1 p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-amber-500" />
              AI Extraction Queue
            </h1>
            <p className="text-muted-foreground">
              Review and approve AI-extracted invoice data
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/invoices/extractions/metrics">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Metrics
            </Button>
          </Link>
          <Link href="/invoices/upload">
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Invoices
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statsCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className={cn('rounded-lg p-3', card.bgColor)}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn('h-3.5 w-3.5', card.iconColor)} />
                <span className={cn('text-xs font-medium truncate', card.textColor)}>
                  {card.label}
                </span>
              </div>
              <div className={cn('text-lg font-bold', card.textColor)}>
                {card.value}
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {filterTabs.map((tab) => {
          const isActive = params.status === tab.value || (!params.status && !tab.value)
          const href = tab.value ? `?status=${tab.value}` : '/invoices/extractions'
          return (
            <Link
              key={tab.label}
              href={href}
              className={cn(
                'px-3 py-2 text-sm font-medium border-b-2 transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
              <span className={cn(
                'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
                isActive ? 'bg-primary/10 text-primary' : 'bg-accent text-muted-foreground',
              )}>
                {tab.count}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Extractions List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {extractions.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-base font-medium text-foreground">No extractions found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {params.status ? 'Try a different filter' : 'Upload invoices to get started'}
            </p>
            {!params.status && (
              <Link href="/invoices/upload" className="mt-4 inline-block">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Invoices
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_150px_120px_100px_100px_80px] gap-3 px-4 py-2.5 bg-accent/50 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
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

                return (
                  <Link
                    key={row.id}
                    href={`/invoices/extractions/${row.id}`}
                    className="block sm:grid sm:grid-cols-[1fr_150px_120px_100px_100px_80px] gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
                  >
                    {/* Document */}
                    <div className="min-w-0">
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
                    </div>

                    {/* Vendor */}
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground truncate">
                      {vendorName ? (
                        <>
                          <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{vendorName}</span>
                        </>
                      ) : (
                        <span className="italic text-muted-foreground/60">No vendor</span>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="text-sm font-mono text-right">
                      {amount != null ? (
                        <span className="font-medium text-foreground">{formatCurrency(amount)}</span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </div>

                    {/* Date */}
                    <div className="text-sm text-muted-foreground">
                      {invoiceDate ? formatDate(invoiceDate) : '—'}
                    </div>

                    {/* Status */}
                    <div>
                      <span className={cn(
                        'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium',
                        statusCfg.className,
                      )}>
                        <StatusIcon className="h-3 w-3" />
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Confidence */}
                    <div className="text-right">
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
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/invoices/extractions?${params.status ? `status=${params.status}&` : ''}page=${page - 1}`}>
                <Button variant="outline" size="sm">Previous</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/invoices/extractions?${params.status ? `status=${params.status}&` : ''}page=${page + 1}`}>
                <Button variant="outline" size="sm">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
