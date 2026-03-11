'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import {
  ArrowLeft,
  Sparkles,
  Building2,
  Briefcase,
  Hash,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  ExternalLink,
  X,
  Eye,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MatchExplanationTooltip } from '@/components/invoices/match-explanation-tooltip'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import {
  useExtraction,
  useConfirmExtraction,
  useRejectExtraction,
  DuplicateError,
} from '@/hooks/use-invoices'
import { useVendors } from '@/hooks/use-vendors'
import { useJobs } from '@/hooks/use-jobs'
import { useCostCodes } from '@/hooks/use-cost-codes'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExtractionLineItem {
  description: string
  quantity: number
  unit: string
  unit_price: number
  amount: number
  cost_code_label: string | null
}

interface VendorMatchMeta {
  auto_assigned: boolean
  confidence: number | null
  matched_vendor_id: string | null
  matched_vendor_name: string | null
  suggestions: Array<{ vendor_id: string; vendor_name: string; confidence: number }>
}

interface CostCodeMatchMeta {
  invoice_level: {
    auto_assigned: boolean
    confidence: number | null
    matched_cost_code_id: string | null
    matched_cost_code: string | null
    matched_cost_code_name: string | null
    suggestions: Array<{ cost_code_id: string; code: string; name: string; confidence: number }>
  } | null
  line_item_matches: unknown[]
}

interface DuplicateCheckMeta {
  has_duplicate: boolean
  match_type: string | null
  confidence: number | null
  duplicate_invoice_id: string | null
  duplicate_invoice_number: string | null
  duplicate_amount: number | null
  reason: string | null
}

interface AnomalyCheckMeta {
  has_anomalies: boolean
  risk_level: 'low' | 'medium' | 'high'
  flags: Array<{ type: string; severity: 'warning' | 'error'; message: string }>
}

interface ExtractionRecord {
  id: string
  filename: string | null
  status: string
  confidence: number | null
  vendor_name: string | null
  vendor_id: string | null
  vendor_match: VendorMatchMeta | null
  job_name: string | null
  job_id: string | null
  cost_code_id: string | null
  cost_code_label: string | null
  cost_code_match: CostCodeMatchMeta | null
  invoice_number: string | null
  invoice_date: string | null
  due_date: string | null
  amount: number | null
  description: string | null
  line_items: ExtractionLineItem[]
  field_confidences: Record<string, number>
  file_url: string | null
  duplicate_check: DuplicateCheckMeta | null
  anomaly_check: AnomalyCheckMeta | null
  error_message: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getConfidenceColor(score: number): string {
  if (score >= 0.8) return 'text-emerald-600'
  if (score >= 0.6) return 'text-amber-600'
  return 'text-red-600'
}

function getConfidenceBg(score: number): string {
  if (score >= 0.8) return 'bg-emerald-500'
  if (score >= 0.6) return 'bg-amber-500'
  return 'bg-red-500'
}

function getConfidenceBgLight(score: number): string {
  if (score >= 0.8) return 'bg-emerald-100'
  if (score >= 0.6) return 'bg-amber-100'
  return 'bg-red-100'
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-stone-100 text-stone-700' },
  processing: { label: 'Processing', className: 'bg-amber-100 text-amber-700' },
  extracted: { label: 'Ready for Review', className: 'bg-blue-100 text-blue-700' },
  review: { label: 'Needs Review', className: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmed', className: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ExtractionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const extractionId = params.id as string

  const { data: rawData, isLoading } = useExtraction(extractionId)
  const extraction = (rawData as { data?: ExtractionRecord })?.data ?? rawData as ExtractionRecord | undefined
  const confirmMutation = useConfirmExtraction(extractionId)
  const rejectMutation = useRejectExtraction(extractionId)

  // Reject state
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  // Dropdown data
  const { data: vendorsRaw } = useVendors()
  const { data: jobsRaw } = useJobs()
  const { data: costCodesRaw } = useCostCodes()

  const vendors = ((vendorsRaw as { data?: Array<{ id: string; name: string }> })?.data ?? []) as Array<{ id: string; name: string }>
  const jobs = ((jobsRaw as { data?: Array<{ id: string; name: string; job_number: string | null }> })?.data ?? []) as Array<{ id: string; name: string; job_number: string | null }>
  const costCodes = ((costCodesRaw as { data?: Array<{ id: string; code: string; name: string }> })?.data ?? []) as Array<{ id: string; code: string; name: string }>

  // Form state
  const [corrections, setCorrections] = useState<Record<string, string>>({})
  const [vendorId, setVendorId] = useState('')
  const [jobId, setJobId] = useState('')
  const [costCodeId, setCostCodeId] = useState('')
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateCheckMeta | null>(null)
  const [vendorSearch, setVendorSearch] = useState('')
  const [jobSearch, setJobSearch] = useState('')
  const [costCodeSearch, setCostCodeSearch] = useState('')

  // Pre-populate from AI matches
  const prevIdRef = useRef<string | null>(null)
  if (extraction && prevIdRef.current !== extraction.id) {
    prevIdRef.current = extraction.id
    if (extraction.vendor_match?.matched_vendor_id && !vendorId) {
      setVendorId(extraction.vendor_match.matched_vendor_id)
    } else if (extraction.vendor_id && !vendorId) {
      setVendorId(extraction.vendor_id)
    }
    if (extraction.cost_code_match?.invoice_level?.matched_cost_code_id && !costCodeId) {
      setCostCodeId(extraction.cost_code_match.invoice_level.matched_cost_code_id)
    } else if (extraction.cost_code_id && !costCodeId) {
      setCostCodeId(extraction.cost_code_id)
    }
    if (extraction.duplicate_check?.has_duplicate) {
      setDuplicateWarning(extraction.duplicate_check)
    }
  }

  const updateCorrection = (field: string, value: string) => {
    setCorrections(prev => ({ ...prev, [field]: value }))
  }

  const filteredVendors = vendorSearch
    ? vendors.filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase()))
    : vendors

  const filteredJobs = jobSearch
    ? jobs.filter(j => j.name.toLowerCase().includes(jobSearch.toLowerCase()) || j.job_number?.toLowerCase().includes(jobSearch.toLowerCase()))
    : jobs

  const filteredCostCodes = costCodeSearch
    ? costCodes.filter(c => c.code.toLowerCase().includes(costCodeSearch.toLowerCase()) || c.name.toLowerCase().includes(costCodeSearch.toLowerCase()))
    : costCodes

  const handleConfirm = async (force?: boolean) => {
    setDuplicateWarning(null)
    try {
      await confirmMutation.mutateAsync({
        corrections: Object.keys(corrections).length > 0 ? corrections : undefined,
        vendor_id: vendorId || undefined,
        job_id: jobId || undefined,
        cost_code_id: costCodeId || undefined,
        force,
      })
      router.push('/invoices/extractions')
    } catch (err) {
      if (err instanceof DuplicateError) {
        setDuplicateWarning(err.duplicate)
      }
    }
  }

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync({ reason: rejectReason || undefined })
      router.push('/invoices/extractions')
    } catch {
      // error is displayed by mutation state
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading extraction...</p>
        </div>
      </div>
    )
  }

  if (!extraction) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <p className="text-base font-medium text-foreground">Extraction not found</p>
          <Link href="/invoices/extractions" className="mt-4 inline-block">
            <Button variant="outline" size="sm">Back to Queue</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusCfg = STATUS_LABELS[extraction.status] ?? STATUS_LABELS.pending
  const fieldConfidences = extraction.field_confidences ?? {}
  const isConfirmed = extraction.status === 'confirmed'
  const isFailed = extraction.status === 'failed'
  const isProcessing = extraction.status === 'processing'
  const isActionable = !isConfirmed && !isProcessing

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/invoices/extractions"
            className="mt-1 p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Review Extraction
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-md">
              {extraction.filename ?? 'Unknown file'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs px-2.5 py-1 rounded font-medium', statusCfg.className)}>
            {statusCfg.label}
          </span>
          {extraction.file_url && (
            <a
              href={extraction.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Original
            </a>
          )}
        </div>
      </div>

      {/* Processing state */}
      {isProcessing && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-3" />
          <p className="text-sm font-medium text-amber-800">Extraction in progress...</p>
          <p className="text-sm text-amber-600 mt-1">This page will update automatically when complete.</p>
        </div>
      )}

      {/* Error state */}
      {isFailed && extraction.error_message && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Extraction Failed</p>
            <p className="text-sm text-red-600 mt-0.5">{extraction.error_message}</p>
          </div>
        </div>
      )}

      {/* Duplicate warning */}
      {duplicateWarning && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Potential Duplicate Invoice</p>
              <p className="text-sm text-amber-700 mt-0.5">{duplicateWarning.reason}</p>
              {duplicateWarning.duplicate_invoice_number && (
                <p className="text-xs text-amber-600 mt-1">
                  Matches invoice #{duplicateWarning.duplicate_invoice_number}
                  {duplicateWarning.duplicate_amount != null && ` (${formatCurrency(duplicateWarning.duplicate_amount)})`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
              onClick={() => handleConfirm(true)}
              disabled={confirmMutation.isPending}
            >
              {confirmMutation.isPending && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              Create Anyway
            </Button>
            <Button size="sm" variant="ghost" className="text-amber-700" onClick={() => setDuplicateWarning(null)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Anomaly detection warnings */}
      {extraction.anomaly_check?.has_anomalies && (
        <div className={cn(
          'rounded-lg border p-4 space-y-2',
          extraction.anomaly_check.risk_level === 'high'
            ? 'border-red-300 bg-red-50'
            : 'border-amber-300 bg-amber-50',
        )}>
          <div className="flex items-start gap-2">
            <AlertTriangle className={cn(
              'h-5 w-5 mt-0.5 flex-shrink-0',
              extraction.anomaly_check.risk_level === 'high' ? 'text-red-600' : 'text-amber-600',
            )} />
            <div className="flex-1">
              <p className={cn(
                'text-sm font-medium',
                extraction.anomaly_check.risk_level === 'high' ? 'text-red-800' : 'text-amber-800',
              )}>
                Anomaly Detection — {extraction.anomaly_check.risk_level === 'high' ? 'High' : extraction.anomaly_check.risk_level === 'medium' ? 'Medium' : 'Low'} Risk
              </p>
              <ul className="mt-1 space-y-0.5">
                {extraction.anomaly_check.flags.map((flag, i) => (
                  <li key={i} className={cn(
                    'text-sm flex items-center gap-1.5',
                    flag.severity === 'error'
                      ? 'text-red-700'
                      : 'text-amber-700',
                  )}>
                    <span className={cn(
                      'inline-block h-1.5 w-1.5 rounded-full flex-shrink-0',
                      flag.severity === 'error' ? 'bg-red-500' : 'bg-amber-500',
                    )} />
                    {flag.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main content — two-column on desktop */}
      {!isProcessing && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Document Preview */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Original Document</h2>
            </div>
            {extraction.file_url ? (
              <div className="aspect-[8.5/11] bg-stone-100">
                {extraction.file_url.match(/\.(png|jpg|jpeg|gif|webp)/i) ? (
                  <img
                    src={extraction.file_url}
                    alt="Invoice"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <iframe
                    src={extraction.file_url}
                    className="w-full h-full"
                    title="Invoice PDF"
                  />
                )}
              </div>
            ) : (
              <div className="aspect-[8.5/11] bg-stone-100 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Preview not available</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Extracted Data Form */}
          <div className="space-y-5">
            {/* Confidence */}
            {extraction.confidence != null && (
              <div className="rounded-lg bg-accent/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Overall Confidence</span>
                  <span className={cn('text-sm font-bold', getConfidenceColor(extraction.confidence))}>
                    {Math.round(extraction.confidence * 100)}%
                  </span>
                </div>
                <div className={cn('h-2 w-full rounded-full', getConfidenceBgLight(extraction.confidence))}>
                  <div
                    className={cn('h-full rounded-full transition-all', getConfidenceBg(extraction.confidence))}
                    style={{ width: `${Math.round(extraction.confidence * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Fields */}
            <div className="bg-card rounded-lg border border-border p-4 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Extracted Fields</h3>

              {/* Invoice Number */}
              <FieldRow
                label="Invoice #"
                icon={Hash}
                value={extraction.invoice_number}
                confidence={fieldConfidences.invoice_number}
                correctedValue={corrections.invoice_number}
                onChange={(val) => updateCorrection('invoice_number', val)}
                disabled={isConfirmed}
              />

              {/* Vendor */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Vendor</span>
                  {fieldConfidences.vendor_name != null && (
                    <ConfidenceDot score={fieldConfidences.vendor_name} />
                  )}
                  {extraction.vendor_match?.auto_assigned && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Auto-matched</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Extracted: {extraction.vendor_name || 'Not found'}
                  {extraction.vendor_match?.confidence != null && (
                    <span className="ml-2 text-xs inline-flex items-center gap-1">
                      ({Math.round(extraction.vendor_match.confidence * 100)}% match)
                      {extraction.vendor_match.matched_vendor_name && (
                        <MatchExplanationTooltip
                          type="vendor"
                          confidence={extraction.vendor_match.confidence}
                          extractedText={extraction.vendor_name || 'Unknown'}
                          matchedText={extraction.vendor_match.matched_vendor_name}
                          autoAssigned={extraction.vendor_match.auto_assigned}
                        />
                      )}
                    </span>
                  )}
                </p>
                <Input
                  placeholder="Search vendors..."
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  className="h-7 text-xs"
                  disabled={isConfirmed}
                />
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  disabled={isConfirmed}
                  className="w-full h-8 rounded-md border border-input/60 bg-card px-2 text-sm text-foreground disabled:opacity-50"
                >
                  <option value="">Select vendor...</option>
                  {filteredVendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <FieldRow
                label="Amount"
                icon={DollarSign}
                value={extraction.amount != null ? formatCurrency(extraction.amount) : null}
                confidence={fieldConfidences.amount}
                correctedValue={corrections.amount}
                onChange={(val) => updateCorrection('amount', val)}
                inputType="number"
                placeholder="0.00"
                disabled={isConfirmed}
              />

              {/* Invoice Date */}
              <FieldRow
                label="Invoice Date"
                icon={Calendar}
                value={extraction.invoice_date ? formatDate(extraction.invoice_date) : null}
                confidence={fieldConfidences.date ?? fieldConfidences.invoice_date}
                correctedValue={corrections.invoice_date}
                onChange={(val) => updateCorrection('invoice_date', val)}
                inputType="date"
                disabled={isConfirmed}
              />

              {/* Due Date */}
              <FieldRow
                label="Due Date"
                icon={Calendar}
                value={extraction.due_date ? formatDate(extraction.due_date) : null}
                confidence={fieldConfidences.due_date}
                correctedValue={corrections.due_date}
                onChange={(val) => updateCorrection('due_date', val)}
                inputType="date"
                disabled={isConfirmed}
              />

              {/* Job */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Job</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Extracted: {extraction.job_name || 'Not found'}
                </p>
                <Input
                  placeholder="Search jobs..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="h-7 text-xs"
                  disabled={isConfirmed}
                />
                <select
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  disabled={isConfirmed}
                  className="w-full h-8 rounded-md border border-input/60 bg-card px-2 text-sm text-foreground disabled:opacity-50"
                >
                  <option value="">Select job...</option>
                  {filteredJobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.job_number ? `${j.job_number} - ` : ''}{j.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cost Code */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Cost Code</span>
                  {fieldConfidences.cost_codes != null && (
                    <ConfidenceDot score={fieldConfidences.cost_codes} />
                  )}
                  {extraction.cost_code_match?.invoice_level?.auto_assigned && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Auto-matched</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Extracted: {extraction.cost_code_label || 'Not found'}
                  {extraction.cost_code_match?.invoice_level?.confidence != null && (
                    <span className="ml-2 text-xs inline-flex items-center gap-1">
                      ({Math.round(extraction.cost_code_match.invoice_level.confidence * 100)}% match)
                      {extraction.cost_code_match.invoice_level.matched_cost_code && (
                        <MatchExplanationTooltip
                          type="cost_code"
                          confidence={extraction.cost_code_match.invoice_level.confidence}
                          extractedText={extraction.cost_code_label || 'Unknown'}
                          matchedText={extraction.cost_code_match.invoice_level.matched_cost_code}
                          autoAssigned={extraction.cost_code_match.invoice_level.auto_assigned}
                        />
                      )}
                    </span>
                  )}
                </p>
                <Input
                  placeholder="Search cost codes..."
                  value={costCodeSearch}
                  onChange={(e) => setCostCodeSearch(e.target.value)}
                  className="h-7 text-xs"
                  disabled={isConfirmed}
                />
                <select
                  value={costCodeId}
                  onChange={(e) => setCostCodeId(e.target.value)}
                  disabled={isConfirmed}
                  className="w-full h-8 rounded-md border border-input/60 bg-card px-2 text-sm text-foreground disabled:opacity-50"
                >
                  <option value="">Select cost code...</option>
                  {filteredCostCodes.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              {extraction.description && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Description</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{extraction.description}</p>
                </div>
              )}
            </div>

            {/* Line Items */}
            {extraction.line_items?.length > 0 && (
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">
                    Line Items ({extraction.line_items.length})
                  </h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-accent/50 text-left">
                      <th className="px-3 py-2 font-medium text-muted-foreground">Description</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground text-right">Qty</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground text-right">Unit Price</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {extraction.line_items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-accent/30">
                        <td className="px-3 py-2 text-foreground">
                          <div>{item.description}</div>
                          {item.cost_code_label && (
                            <span className="text-xs font-mono text-muted-foreground">{item.cost_code_label}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right text-muted-foreground font-mono">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-3 py-2 text-right text-muted-foreground font-mono">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-foreground font-mono">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-accent/50 font-medium">
                      <td colSpan={3} className="px-3 py-2 text-right text-foreground">Total</td>
                      <td className="px-3 py-2 text-right text-foreground font-mono">
                        {formatCurrency(extraction.line_items.reduce((sum, i) => sum + i.amount, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Error State */}
            {confirmMutation.isError && !(confirmMutation.error instanceof DuplicateError) && (
              <div className="rounded-md bg-red-50 p-3 flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">
                  {confirmMutation.error instanceof Error
                    ? confirmMutation.error.message
                    : 'Failed to confirm extraction.'}
                </p>
              </div>
            )}
            {rejectMutation.isError && (
              <div className="rounded-md bg-red-50 p-3 flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">
                  {rejectMutation.error instanceof Error
                    ? rejectMutation.error.message
                    : 'Failed to reject extraction.'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {isActionable && (
              <div className="space-y-3 pt-2">
                {showRejectDialog && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
                    <p className="text-sm font-medium text-red-800">Reject this extraction?</p>
                    <Input
                      placeholder="Reason for rejection (optional)"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleReject}
                        disabled={rejectMutation.isPending}
                      >
                        {rejectMutation.isPending && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                        Confirm Reject
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowRejectDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => handleConfirm()}
                    disabled={confirmMutation.isPending || rejectMutation.isPending}
                    className="flex-1"
                  >
                    {confirmMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Confirm & Create Invoice
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={confirmMutation.isPending || rejectMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {isConfirmed && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">Invoice Created</p>
                  <p className="text-xs text-emerald-600">This extraction has been confirmed and an invoice was created.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FieldRow Component
// ---------------------------------------------------------------------------

function FieldRow({
  label,
  icon: Icon,
  value,
  confidence,
  correctedValue,
  onChange,
  inputType = 'text',
  placeholder,
  disabled,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  value: string | null | undefined
  confidence?: number
  correctedValue?: string
  onChange: (val: string) => void
  inputType?: string
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{label}</span>
        {confidence != null && <ConfidenceDot score={confidence} />}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Extracted</p>
          <p className="text-sm text-foreground">
            {value || <span className="text-muted-foreground italic">Not found</span>}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Correction</p>
          <Input
            type={inputType}
            value={correctedValue ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? `Override ${label.toLowerCase()}`}
            className="h-8 text-sm"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ConfidenceDot Component
// ---------------------------------------------------------------------------

function ConfidenceDot({ score }: { score: number }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        getConfidenceColor(score),
      )}
      title={`${Math.round(score * 100)}% confidence`}
    >
      <span className={cn(
        'h-2 w-2 rounded-full',
        score >= 0.8 ? 'bg-emerald-500' : score >= 0.6 ? 'bg-amber-500' : 'bg-red-500',
      )} />
      {Math.round(score * 100)}%
    </span>
  )
}
