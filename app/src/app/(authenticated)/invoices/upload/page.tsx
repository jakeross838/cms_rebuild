'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  Building2,
  Briefcase,
  Hash,
  Calendar,
  DollarSign,
  Eye,
  ChevronRight,
  X,
  File,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MatchExplanationTooltip } from '@/components/invoices/match-explanation-tooltip'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import {
  useUploadInvoice,
  useUploadInvoiceBatch,
  useExtractions,
  useExtraction,
  useConfirmExtraction,
  DuplicateError,
  type BatchUploadResultItem,
} from '@/hooks/use-invoices'
import { useVendors } from '@/hooks/use-vendors'
import { useJobs } from '@/hooks/use-jobs'
import { useCostCodes } from '@/hooks/use-cost-codes'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ExtractionStatus = 'pending' | 'processing' | 'extracted' | 'review' | 'confirmed' | 'failed'

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

interface ExtractionRecord {
  id: string
  filename: string
  status: ExtractionStatus
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
  error_message: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Status Badge Config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<ExtractionStatus, { label: string; className: string; animate?: boolean }> = {
  pending: { label: 'Pending', className: 'bg-stone-100 text-stone-700' },
  processing: { label: 'Processing', className: 'bg-amber-100 text-amber-700', animate: true },
  extracted: { label: 'Extracted', className: 'bg-blue-100 text-blue-700' },
  review: { label: 'Needs Review', className: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmed', className: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
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

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/tiff',
]

const ACCEPTED_EXTENSIONS = '.pdf,.png,.jpg,.jpeg,.tiff,.tif'

// ---------------------------------------------------------------------------
// Upload Queue Item
// ---------------------------------------------------------------------------

interface QueueItem {
  file: File
  status: 'queued' | 'uploading' | 'done' | 'error'
  error?: string
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function InvoiceUploadPage() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [selectedExtractionId, setSelectedExtractionId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isProcessingRef = useRef(false)

  // Hooks
  const uploadMutation = useUploadInvoice()
  const batchUploadMutation = useUploadInvoiceBatch()
  const { data: extractionsData, isLoading: extractionsLoading } = useExtractions({ limit: 20 })
  const extractions: ExtractionRecord[] = (extractionsData as { data?: ExtractionRecord[] })?.data ?? (Array.isArray(extractionsData) ? extractionsData as ExtractionRecord[] : [])

  // Auto-poll when any extraction is still processing
  const hasProcessing = extractions.some(e => e.status === 'processing' || e.status === 'pending')
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!hasProcessing) return
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['extractions'] })
    }, 3000)
    return () => clearInterval(interval)
  }, [hasProcessing, queryClient])

  // ---------------------------------------------------------------------------
  // File Handling
  // ---------------------------------------------------------------------------

  const processQueue = useCallback(async (items: QueueItem[]) => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true

    const queuedItems = items.filter(item => item.status === 'queued')

    if (queuedItems.length > 1) {
      // Batch upload: mark all queued items as uploading
      setQueue(prev => prev.map(q =>
        q.status === 'queued' ? { ...q, status: 'uploading' as const } : q
      ))

      try {
        const result = await batchUploadMutation.mutateAsync(
          queuedItems.map(item => item.file)
        )

        // Map batch results back to individual queue items
        setQueue(prev => prev.map(q => {
          if (q.status !== 'uploading') return q
          const batchItem = result.data.items.find(
            (r: BatchUploadResultItem) => r.filename === q.file.name
          )
          if (!batchItem) return { ...q, status: 'done' as const }
          if (batchItem.status === 'error') {
            return { ...q, status: 'error' as const, error: batchItem.error || 'Batch upload failed' }
          }
          return { ...q, status: 'done' as const }
        }))
      } catch (err) {
        // Batch request itself failed — mark all uploading items as error
        const errorMsg = err instanceof Error ? err.message : 'Batch upload failed'
        setQueue(prev => prev.map(q =>
          q.status === 'uploading'
            ? { ...q, status: 'error' as const, error: errorMsg }
            : q
        ))
      }
    } else {
      // Single file: use the original single-file upload
      for (const item of queuedItems) {
        setQueue(prev => prev.map(q =>
          q.file === item.file ? { ...q, status: 'uploading' as const } : q
        ))

        try {
          await uploadMutation.mutateAsync(item.file)
          setQueue(prev => prev.map(q =>
            q.file === item.file ? { ...q, status: 'done' as const } : q
          ))
        } catch (err) {
          setQueue(prev => prev.map(q =>
            q.file === item.file
              ? { ...q, status: 'error' as const, error: err instanceof Error ? err.message : 'Upload failed' }
              : q
          ))
        }
      }
    }

    isProcessingRef.current = false
  }, [uploadMutation, batchUploadMutation])

  const addFiles = useCallback((files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(f => ACCEPTED_TYPES.includes(f.type))
    if (validFiles.length === 0) return

    const newItems: QueueItem[] = validFiles.map(file => ({ file, status: 'queued' as const }))
    setQueue(prev => {
      const updated = [...prev, ...newItems]
      // Start processing after state update
      setTimeout(() => processQueue(updated), 0)
      return updated
    })
  }, [processQueue])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }, [addFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const removeQueueItem = useCallback((file: File) => {
    setQueue(prev => prev.filter(q => q.file !== file))
  }, [])

  const clearCompleted = useCallback(() => {
    setQueue(prev => prev.filter(q => q.status !== 'done' && q.status !== 'error'))
  }, [])

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const statsCards = [
    {
      label: 'Total Extractions',
      value: extractions.length,
      icon: FileText,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      label: 'Processing',
      value: extractions.filter(e => e.status === 'processing' || e.status === 'pending').length,
      icon: Loader2,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
    {
      label: 'Ready for Review',
      value: extractions.filter(e => e.status === 'extracted' || e.status === 'review').length,
      icon: Eye,
      iconColor: 'text-stone-500',
      bgColor: 'bg-stone-50',
      textColor: 'text-stone-700',
    },
    {
      label: 'Confirmed',
      value: extractions.filter(e => e.status === 'confirmed').length,
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
  ]

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Header                                                            */}
      {/* ================================================================= */}
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
              AI Invoice Processing
            </h1>
            <p className="text-muted-foreground">
              Upload invoices for automatic data extraction
            </p>
          </div>
        </div>
        <Link href="/invoices">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            All Invoices
          </Button>
        </Link>
      </div>

      {/* ================================================================= */}
      {/* Stats Bar                                                         */}
      {/* ================================================================= */}
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

      {/* ================================================================= */}
      {/* Main Content: Upload + Queue / Review                             */}
      {/* ================================================================= */}
      <div className={cn(
        'grid gap-6',
        selectedExtractionId ? 'lg:grid-cols-2' : 'grid-cols-1',
      )}>
        {/* Left Column: Upload + Extraction Queue */}
        <div className="space-y-6">
          {/* Upload Area */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Upload Invoices</h2>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-accent/50',
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files)
                  e.target.value = ''
                }}
              />
              <div className="flex flex-col items-center gap-3">
                <div className={cn(
                  'p-3 rounded-full',
                  isDragging ? 'bg-primary/10' : 'bg-stone-100',
                )}>
                  <Upload className={cn(
                    'h-8 w-8',
                    isDragging ? 'text-primary' : 'text-muted-foreground',
                  )} />
                </div>
                <div>
                  <p className="text-base font-medium text-foreground">
                    Drop invoice PDFs here
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse files
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  Browse Files
                </Button>
                <p className="text-xs text-muted-foreground">
                  Supports PDF, PNG, JPEG, TIFF
                </p>
              </div>
            </div>

            {/* Upload Queue */}
            {queue.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Upload Queue ({queue.length})
                  </span>
                  {queue.some(q => q.status === 'done' || q.status === 'error') && (
                    <Button variant="ghost" size="xs" onClick={clearCompleted}>
                      Clear completed
                    </Button>
                  )}
                </div>
                {queue.map((item, idx) => (
                  <div
                    key={`${item.file.name}-${idx}`}
                    className="flex items-center gap-3 rounded-md border border-border p-2.5 bg-card"
                  >
                    <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(item.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    {item.status === 'queued' && (
                      <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                        Queued
                      </span>
                    )}
                    {item.status === 'uploading' && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Uploading
                      </span>
                    )}
                    {item.status === 'done' && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Done
                      </span>
                    )}
                    {item.status === 'error' && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1" title={item.error}>
                        <XCircle className="h-3 w-3" />
                        Failed
                      </span>
                    )}
                    <button
                      onClick={() => removeQueueItem(item.file)}
                      className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Extraction Queue / History */}
          <div className="bg-card rounded-lg border border-border">
            <div className="p-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Extraction History</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Recent AI extractions and their status
              </p>
            </div>

            {extractionsLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading extractions...</p>
              </div>
            ) : extractions.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium text-foreground">No extractions yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload an invoice to get started
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {extractions.map((extraction) => {
                  const statusCfg = STATUS_CONFIG[extraction.status] ?? STATUS_CONFIG.pending
                  const isSelected = selectedExtractionId === extraction.id
                  return (
                    <button
                      key={extraction.id}
                      onClick={() => setSelectedExtractionId(isSelected ? null : extraction.id)}
                      className={cn(
                        'w-full text-left p-4 hover:bg-accent/50 transition-colors',
                        isSelected && 'bg-accent/70',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Row 1: Filename + Status */}
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-sm font-medium text-foreground truncate">
                              {extraction.filename}
                            </span>
                            <span className={cn(
                              'text-xs px-2 py-0.5 rounded font-medium',
                              statusCfg.className,
                              statusCfg.animate && 'animate-pulse',
                            )}>
                              {statusCfg.label}
                            </span>
                          </div>

                          {/* Row 2: Extracted info */}
                          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                            {extraction.vendor_name && (
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5" />
                                {extraction.vendor_name}
                              </span>
                            )}
                            {extraction.amount != null && (
                              <span className="flex items-center gap-1 font-mono">
                                <DollarSign className="h-3.5 w-3.5" />
                                {formatCurrency(extraction.amount)}
                              </span>
                            )}
                            {extraction.invoice_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(extraction.invoice_date)}
                              </span>
                            )}
                          </div>

                          {/* Row 3: Confidence bar */}
                          {extraction.confidence != null && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className={cn('h-1.5 w-24 rounded-full', getConfidenceBgLight(extraction.confidence))}>
                                <div
                                  className={cn('h-full rounded-full transition-all', getConfidenceBg(extraction.confidence))}
                                  style={{ width: `${Math.round(extraction.confidence * 100)}%` }}
                                />
                              </div>
                              <span className={cn('text-xs font-medium', getConfidenceColor(extraction.confidence))}>
                                {Math.round(extraction.confidence * 100)}%
                              </span>
                            </div>
                          )}
                        </div>

                        <ChevronRight className={cn(
                          'h-4 w-4 text-muted-foreground flex-shrink-0 mt-1 transition-transform',
                          isSelected && 'rotate-90',
                        )} />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Review Panel */}
        {selectedExtractionId && (
          <ReviewPanel
            extractionId={selectedExtractionId}
            onClose={() => setSelectedExtractionId(null)}
          />
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Review Panel Component
// ---------------------------------------------------------------------------

function ReviewPanel({
  extractionId,
  onClose,
}: {
  extractionId: string
  onClose: () => void
}) {
  const { data: rawData, isLoading } = useExtraction(extractionId)
  const extraction = (rawData as { data?: ExtractionRecord })?.data ?? rawData as ExtractionRecord | undefined
  const confirmMutation = useConfirmExtraction(extractionId)

  // Load vendors, jobs, cost codes for dropdowns
  const { data: vendorsRaw } = useVendors()
  const { data: jobsRaw } = useJobs()
  const { data: costCodesRaw } = useCostCodes()

  const vendors = ((vendorsRaw as { data?: Array<{ id: string; name: string }> })?.data ?? []) as Array<{ id: string; name: string }>
  const jobs = ((jobsRaw as { data?: Array<{ id: string; name: string; job_number: string | null }> })?.data ?? []) as Array<{ id: string; name: string; job_number: string | null }>
  const costCodes = ((costCodesRaw as { data?: Array<{ id: string; code: string; name: string; division: string }> })?.data ?? []) as Array<{ id: string; code: string; name: string; division: string }>

  // Form state for corrections
  const [corrections, setCorrections] = useState<Record<string, string>>({})
  const [vendorId, setVendorId] = useState('')
  const [jobId, setJobId] = useState('')
  const [costCodeId, setCostCodeId] = useState('')
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateCheckMeta | null>(null)
  const [vendorSearch, setVendorSearch] = useState('')
  const [jobSearch, setJobSearch] = useState('')
  const [costCodeSearch, setCostCodeSearch] = useState('')

  // Pre-populate from AI matches when extraction loads
  const prevExtractionIdRef = useRef<string | null>(null)
  if (extraction && prevExtractionIdRef.current !== extraction.id) {
    prevExtractionIdRef.current = extraction.id
    // Auto-set vendor if AI matched one
    if (extraction.vendor_match?.matched_vendor_id && !vendorId) {
      setVendorId(extraction.vendor_match.matched_vendor_id)
    } else if (extraction.vendor_id && !vendorId) {
      setVendorId(extraction.vendor_id)
    }
    // Auto-set cost code if AI matched one
    if (extraction.cost_code_match?.invoice_level?.matched_cost_code_id && !costCodeId) {
      setCostCodeId(extraction.cost_code_match.invoice_level.matched_cost_code_id)
    } else if (extraction.cost_code_id && !costCodeId) {
      setCostCodeId(extraction.cost_code_id)
    }
    // Show duplicate warning from extraction-time check
    if (extraction.duplicate_check?.has_duplicate) {
      setDuplicateWarning(extraction.duplicate_check)
    }
  }

  const updateCorrection = (field: string, value: string) => {
    setCorrections(prev => ({ ...prev, [field]: value }))
  }

  // Filter dropdowns
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
      onClose()
    } catch (err) {
      if (err instanceof DuplicateError) {
        setDuplicateWarning(err.duplicate)
      }
      // Other errors handled by mutation state
    }
  }

  const handleReject = async () => {
    try {
      await confirmMutation.mutateAsync({
        corrections: { status: 'failed' },
      })
      onClose()
    } catch {
      // Error handled by mutation state
    }
  }

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading extraction...</p>
        </div>
      </div>
    )
  }

  if (!extraction) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm text-foreground font-medium">Extraction not found</p>
        <Button variant="ghost" size="sm" onClick={onClose} className="mt-3">
          Close
        </Button>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[extraction.status] ?? STATUS_CONFIG.pending
  const fieldConfidences = extraction.field_confidences ?? {}

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Review Extraction</h2>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{extraction.filename}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-xs px-2 py-0.5 rounded font-medium',
            statusCfg.className,
          )}>
            {statusCfg.label}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5 max-h-[calc(100vh-16rem)] overflow-y-auto">
        {/* Duplicate Warning Banner */}
        {duplicateWarning && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  Potential Duplicate Invoice
                </p>
                <p className="text-sm text-amber-700 mt-0.5">
                  {duplicateWarning.reason}
                </p>
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
                {confirmMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : null}
                Create Anyway
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-amber-700"
                onClick={() => setDuplicateWarning(null)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Overall Confidence */}
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

        {/* Extracted Fields + Edit Form */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Extracted Data</h3>

          {/* Invoice Number */}
          <FieldRow
            label="Invoice #"
            icon={Hash}
            extractedValue={extraction.invoice_number}
            confidence={fieldConfidences.invoice_number}
            correctedValue={corrections.invoice_number}
            onChange={(val) => updateCorrection('invoice_number', val)}
          />

          {/* Vendor — searchable dropdown with AI match info */}
          <div className="rounded-md border border-border p-3">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Vendor</span>
              {fieldConfidences.vendor_name != null && (
                <ConfidenceDot score={fieldConfidences.vendor_name} />
              )}
              {extraction.vendor_match?.auto_assigned && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                  Auto-matched
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Extracted</p>
                <p className="text-sm text-foreground">
                  {extraction.vendor_name || <span className="text-muted-foreground italic">Not found</span>}
                </p>
                {extraction.vendor_match?.confidence != null && (
                  <p className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                    Match: {Math.round(extraction.vendor_match.confidence * 100)}%
                    {extraction.vendor_match.matched_vendor_name && ` \u2192 ${extraction.vendor_match.matched_vendor_name}`}
                    {extraction.vendor_match.matched_vendor_name && (
                      <MatchExplanationTooltip
                        type="vendor"
                        confidence={extraction.vendor_match.confidence}
                        extractedText={extraction.vendor_name || 'Unknown'}
                        matchedText={extraction.vendor_match.matched_vendor_name}
                        autoAssigned={extraction.vendor_match.auto_assigned}
                      />
                    )}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Assign Vendor</p>
                <Input
                  placeholder="Search vendors..."
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  className="h-7 text-xs mb-1"
                />
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full h-8 rounded-md border border-input/60 bg-card px-2 text-sm text-foreground"
                >
                  <option value="">Select vendor...</option>
                  {filteredVendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Amount */}
          <FieldRow
            label="Amount"
            icon={DollarSign}
            extractedValue={extraction.amount != null ? formatCurrency(extraction.amount) : null}
            confidence={fieldConfidences.amount}
            correctedValue={corrections.amount}
            onChange={(val) => updateCorrection('amount', val)}
            inputType="number"
            placeholder="0.00"
          />

          {/* Invoice Date */}
          <FieldRow
            label="Invoice Date"
            icon={Calendar}
            extractedValue={extraction.invoice_date ? formatDate(extraction.invoice_date) : null}
            confidence={fieldConfidences.date ?? fieldConfidences.invoice_date}
            correctedValue={corrections.invoice_date}
            onChange={(val) => updateCorrection('invoice_date', val)}
            inputType="date"
          />

          {/* Due Date */}
          <FieldRow
            label="Due Date"
            icon={Calendar}
            extractedValue={extraction.due_date ? formatDate(extraction.due_date) : null}
            confidence={fieldConfidences.due_date}
            correctedValue={corrections.due_date}
            onChange={(val) => updateCorrection('due_date', val)}
            inputType="date"
          />

          {/* Job — searchable dropdown */}
          <div className="rounded-md border border-border p-3">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Job</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Extracted</p>
                <p className="text-sm text-foreground">
                  {extraction.job_name || <span className="text-muted-foreground italic">Not found</span>}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Assign Job</p>
                <Input
                  placeholder="Search jobs..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="h-7 text-xs mb-1"
                />
                <select
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="w-full h-8 rounded-md border border-input/60 bg-card px-2 text-sm text-foreground"
                >
                  <option value="">Select job...</option>
                  {filteredJobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.job_number ? `${j.job_number} - ` : ''}{j.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cost Code — searchable dropdown with AI match info */}
          <div className="rounded-md border border-border p-3">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Cost Code</span>
              {fieldConfidences.cost_codes != null && (
                <ConfidenceDot score={fieldConfidences.cost_codes} />
              )}
              {extraction.cost_code_match?.invoice_level?.auto_assigned && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                  Auto-matched
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Extracted</p>
                <p className="text-sm text-foreground">
                  {extraction.cost_code_label || <span className="text-muted-foreground italic">Not found</span>}
                </p>
                {extraction.cost_code_match?.invoice_level?.confidence != null && (
                  <p className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                    Match: {Math.round(extraction.cost_code_match.invoice_level.confidence * 100)}%
                    {extraction.cost_code_match.invoice_level.matched_cost_code &&
                      ` \u2192 ${extraction.cost_code_match.invoice_level.matched_cost_code}`}
                    {extraction.cost_code_match.invoice_level.matched_cost_code && (
                      <MatchExplanationTooltip
                        type="cost_code"
                        confidence={extraction.cost_code_match.invoice_level.confidence}
                        extractedText={extraction.cost_code_label || 'Unknown'}
                        matchedText={extraction.cost_code_match.invoice_level.matched_cost_code}
                        autoAssigned={extraction.cost_code_match.invoice_level.auto_assigned}
                      />
                    )}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Assign Cost Code</p>
                <Input
                  placeholder="Search cost codes..."
                  value={costCodeSearch}
                  onChange={(e) => setCostCodeSearch(e.target.value)}
                  className="h-7 text-xs mb-1"
                />
                <select
                  value={costCodeId}
                  onChange={(e) => setCostCodeId(e.target.value)}
                  className="w-full h-8 rounded-md border border-input/60 bg-card px-2 text-sm text-foreground"
                >
                  <option value="">Select cost code...</option>
                  {filteredCostCodes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          {extraction.description && (
            <div className="rounded-md border border-border p-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Description</span>
              </div>
              <p className="text-sm text-muted-foreground">{extraction.description}</p>
            </div>
          )}
        </div>

        {/* Line Items */}
        {extraction.line_items && extraction.line_items.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Line Items ({extraction.line_items.length})
            </h3>
            <div className="rounded-md border border-border overflow-hidden">
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
                          <span className="text-xs font-mono text-muted-foreground">
                            {item.cost_code_label}
                          </span>
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
          </div>
        )}

        {/* Error State (non-duplicate errors) */}
        {confirmMutation.isError && !(confirmMutation.error instanceof DuplicateError) && (
          <div className="rounded-md bg-red-50 p-3 flex items-start gap-2">
            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">
              {confirmMutation.error instanceof Error
                ? confirmMutation.error.message
                : 'Failed to confirm extraction. Please try again.'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <Button
            onClick={() => handleConfirm()}
            disabled={confirmMutation.isPending || extraction.status === 'confirmed'}
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
            onClick={handleReject}
            disabled={confirmMutation.isPending || extraction.status === 'confirmed' || extraction.status === 'failed'}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Field Row Component
// ---------------------------------------------------------------------------

function FieldRow({
  label,
  icon: Icon,
  extractedValue,
  confidence,
  correctedValue,
  onChange,
  inputType = 'text',
  placeholder,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  extractedValue: string | null | undefined
  confidence?: number
  correctedValue?: string
  onChange: (val: string) => void
  inputType?: string
  placeholder?: string
}) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{label}</span>
        {confidence != null && <ConfidenceDot score={confidence} />}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Extracted</p>
          <p className="text-sm text-foreground">
            {extractedValue || <span className="text-muted-foreground italic">Not found</span>}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Correction</p>
          <Input
            type={inputType}
            value={correctedValue ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? `Override ${label.toLowerCase()}`}
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Confidence Dot Component
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
