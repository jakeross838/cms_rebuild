'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  X,
  Check,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Upload,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────

export interface ApprovalStep {
  id: string
  label: string
  status: 'pending' | 'current' | 'approved' | 'rejected'
  approver?: string
  timestamp?: Date
  comment?: string
}

export interface ApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  steps: ApprovalStep[]
  currentStepId: string
  onApprove: (comment: string) => void
  onReject: (comment: string) => void
  requireComment?: boolean
  isLoading?: boolean
}

// ── Approval Modal ──────────────────────────────────────────────

export function ApprovalModal({
  isOpen,
  onClose,
  title,
  description,
  steps,
  currentStepId,
  onApprove,
  onReject,
  requireComment = false,
  isLoading = false,
}: ApprovalModalProps) {
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleApprove = () => {
    if (requireComment && !comment.trim()) {
      setError('Comment is required')
      return
    }
    onApprove(comment)
  }

  const handleReject = () => {
    if (!comment.trim()) {
      setError('Comment is required when rejecting')
      return
    }
    onReject(comment)
  }

  const currentStepIndex = steps.findIndex(s => s.id === currentStepId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Approval Steps */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                      step.status === 'approved' && 'bg-emerald-100 text-emerald-600',
                      step.status === 'rejected' && 'bg-red-100 text-red-600',
                      step.status === 'current' && 'bg-blue-100 text-blue-600 ring-2 ring-blue-500',
                      step.status === 'pending' && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {step.status === 'approved' ? (
                      <Check className="h-4 w-4" />
                    ) : step.status === 'rejected' ? (
                      <X className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs mt-1 text-center max-w-[80px] truncate">
                    {step.label}
                  </span>
                  {step.approver && (
                    <span className="text-[10px] text-muted-foreground">
                      {step.approver}
                    </span>
                  )}
                </div>

                {/* Connector */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-12 h-0.5 mx-2',
                      index < currentStepIndex ? 'bg-emerald-500' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Comment input */}
        <div className="px-6 py-4">
          <label className="block text-sm font-medium mb-2">
            Comment {requireComment && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={comment}
            onChange={(e) => {
              setComment(e.target.value)
              setError('')
            }}
            placeholder="Add your comment..."
            className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
          />
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <button
            onClick={handleReject}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject'}
          </button>
          <button
            onClick={handleApprove}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Status Transition Button ────────────────────────────────────

export interface StatusTransitionProps {
  currentStatus: string
  nextStatus: string
  onTransition: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md'
  requiresValidation?: boolean
  validationErrors?: string[]
}

export function StatusTransition({
  currentStatus,
  nextStatus,
  onTransition,
  disabled = false,
  variant = 'primary',
  size = 'md',
  requiresValidation = false,
  validationErrors = [],
}: StatusTransitionProps) {
  const [showErrors, setShowErrors] = useState(false)

  const hasErrors = validationErrors.length > 0

  const handleClick = () => {
    if (requiresValidation && hasErrors) {
      setShowErrors(true)
      return
    }
    onTransition()
  }

  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-muted text-foreground hover:bg-muted/80',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size]
        )}
      >
        <span>{currentStatus}</span>
        <ArrowRight className="h-3 w-3" />
        <span>{nextStatus}</span>
      </button>

      {/* Validation errors popover */}
      {showErrors && hasErrors && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg z-10">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Cannot proceed</p>
              <ul className="mt-1 text-xs text-red-600 list-disc list-inside">
                {validationErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
          <button
            onClick={() => setShowErrors(false)}
            className="absolute top-2 right-2 text-red-400 hover:text-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  )
}

// ── Bulk Action Bar ─────────────────────────────────────────────

export interface BulkAction {
  id: string
  label: string
  icon: React.ReactNode
  onClick: (selectedIds: string[]) => void
  variant?: 'default' | 'danger'
}

export interface BulkActionBarProps {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onClearSelection: () => void
  actions: BulkAction[]
  className?: string
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  actions,
  className,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-blue-700">
          {selectedCount} of {totalCount} selected
        </span>
        <button
          onClick={onSelectAll}
          className="text-xs text-blue-600 hover:underline"
        >
          Select all
        </button>
        <button
          onClick={onClearSelection}
          className="text-xs text-blue-600 hover:underline"
        >
          Clear selection
        </button>
      </div>

      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => action.onClick([])} // Pass selected IDs from parent
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              action.variant === 'danger'
                ? 'text-red-600 hover:bg-red-100'
                : 'text-blue-600 hover:bg-blue-100'
            )}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Submission Form Modal ───────────────────────────────────────

export interface FormField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'file' | 'date'
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
}

export interface SubmissionFormProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  fields: FormField[]
  onSubmit: (data: Record<string, string | File>) => void
  submitLabel?: string
  isLoading?: boolean
}

export function SubmissionForm({
  isOpen,
  onClose,
  title,
  description,
  fields,
  onSubmit,
  submitLabel = 'Submit',
  isLoading = false,
}: SubmissionFormProps) {
  const [formData, setFormData] = useState<Record<string, string | File>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    fields.forEach((field) => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  const updateField = (id: string, value: string | File) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
    setErrors((prev) => ({ ...prev, [id]: '' }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-background rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form fields */}
        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {fields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium mb-1.5">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>

              {field.type === 'text' && (
                <input
                  type="text"
                  value={(formData[field.id] as string) || ''}
                  onChange={(e) => updateField(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}

              {field.type === 'textarea' && (
                <textarea
                  value={(formData[field.id] as string) || ''}
                  onChange={(e) => updateField(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}

              {field.type === 'select' && (
                <select
                  value={(formData[field.id] as string) || ''}
                  onChange={(e) => updateField(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {field.type === 'date' && (
                <input
                  type="date"
                  value={(formData[field.id] as string) || ''}
                  onChange={(e) => updateField(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}

              {field.type === 'file' && (
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click or drag to upload
                  </p>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        updateField(field.id, e.target.files[0])
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              )}

              {errors[field.id] && (
                <p className="text-xs text-red-500 mt-1">{errors[field.id]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Progress Steps ──────────────────────────────────────────────

export interface ProgressStep {
  id: string
  label: string
  status: 'completed' | 'current' | 'upcoming'
  description?: string
}

export interface ProgressStepsProps {
  steps: ProgressStep[]
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function ProgressSteps({
  steps,
  orientation = 'horizontal',
  className,
}: ProgressStepsProps) {
  return (
    <div
      className={cn(
        orientation === 'horizontal' ? 'flex items-center' : 'flex flex-col',
        className
      )}
    >
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            'flex items-center',
            orientation === 'vertical' && 'flex-col items-start'
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                step.status === 'completed' && 'bg-emerald-500 text-white',
                step.status === 'current' && 'bg-blue-500 text-white',
                step.status === 'upcoming' && 'bg-muted text-muted-foreground'
              )}
            >
              {step.status === 'completed' ? (
                <Check className="h-3 w-3" />
              ) : (
                index + 1
              )}
            </div>
            <div>
              <span
                className={cn(
                  'text-sm font-medium',
                  step.status === 'upcoming' && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
              {step.description && (
                <p className="text-xs text-muted-foreground">{step.description}</p>
              )}
            </div>
          </div>

          {/* Connector */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                orientation === 'horizontal' ? 'w-8 h-0.5 mx-2' : 'w-0.5 h-6 ml-3 my-1',
                steps[index + 1].status === 'upcoming' ? 'bg-muted' : 'bg-emerald-500'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
