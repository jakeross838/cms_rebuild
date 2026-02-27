import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays < 0) return formatDate(d)
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  return formatDate(d)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Job statuses
    pre_construction: 'bg-info-bg text-info-dark',
    active: 'bg-success-bg text-success-dark',
    on_hold: 'bg-warning-bg text-warning-dark',
    completed: 'bg-warm-100 text-warm-700',
    warranty: 'bg-warm-100 text-warm-800',
    cancelled: 'bg-danger-bg text-danger-dark',
    // Invoice / financial
    needs_matching: 'bg-sand-100 text-orange-800',
    draft: 'bg-warm-100 text-warm-700',
    pm_pending: 'bg-info-bg text-info-dark',
    accountant_pending: 'bg-warm-100 text-warm-800',
    owner_pending: 'bg-danger-bg text-danger-dark',
    approved: 'bg-success-bg text-success-dark',
    in_draw: 'bg-stone-100 text-teal-800',
    paid: 'bg-warm-200 text-warm-700',
    rejected: 'bg-danger-bg text-danger-dark',
    denied: 'bg-danger-bg text-danger-dark',
    posted: 'bg-success-bg text-success-dark',
    // Workflow statuses
    pending: 'bg-warning-bg text-warning-dark',
    pending_approval: 'bg-warning-bg text-warning-dark',
    submitted: 'bg-info-bg text-info-dark',
    under_review: 'bg-info-bg text-info-dark',
    acknowledged: 'bg-info-bg text-info-dark',
    open: 'bg-info-bg text-info-dark',
    in_progress: 'bg-info-bg text-info-dark',
    answered: 'bg-success-bg text-success-dark',
    resolved: 'bg-success-bg text-success-dark',
    closed: 'bg-warm-100 text-warm-700',
    voided: 'bg-danger-bg text-danger-dark',
    archived: 'bg-warm-100 text-warm-600',
    // Procurement / delivery
    sent: 'bg-info-bg text-info-dark',
    received: 'bg-success-bg text-success-dark',
    partially_received: 'bg-warning-bg text-warning-dark',
    awarded: 'bg-success-bg text-success-dark',
    published: 'bg-info-bg text-info-dark',
    // Permits / inspections
    applied: 'bg-info-bg text-info-dark',
    issued: 'bg-success-bg text-success-dark',
    expired: 'bg-danger-bg text-danger-dark',
    revoked: 'bg-danger-bg text-danger-dark',
    scheduled: 'bg-info-bg text-info-dark',
    passed: 'bg-success-bg text-success-dark',
    failed: 'bg-danger-bg text-danger-dark',
    // Selections / submittals
    selected: 'bg-info-bg text-info-dark',
    confirmed: 'bg-success-bg text-success-dark',
    ordered: 'bg-info-bg text-info-dark',
    installed: 'bg-success-bg text-success-dark',
    approved_as_noted: 'bg-success-bg text-success-dark',
    resubmit: 'bg-warning-bg text-warning-dark',
    // Schedule / tasks
    not_started: 'bg-warm-100 text-warm-600',
    verified: 'bg-success-bg text-success-dark',
    escalated: 'bg-danger-bg text-danger-dark',
    // Priority colors
    low: 'bg-warm-100 text-warm-700',
    normal: 'bg-info-bg text-info-dark',
    high: 'bg-warning-bg text-warning-dark',
    urgent: 'bg-danger-bg text-danger-dark',
  }
  return colors[status] || 'bg-warm-100 text-warm-700'
}

/** Format a snake_case DB status value for display: 'pending_approval' → 'Pending Approval' */
export function formatStatus(status: string | null): string {
  if (!status) return 'Unknown'
  return status.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

/** Escape special characters in LIKE/ILIKE patterns to prevent query injection */
export function escapeLike(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&')
}

/**
 * Build a safely-quoted ILIKE pattern for use in PostgREST .or() filter strings.
 * Escapes LIKE wildcards, then double-quotes the value to prevent PostgREST
 * delimiter injection (commas and dots have special meaning in .or() syntax).
 */
export function safeOrIlike(input: string): string {
  const pattern = `%${escapeLike(input)}%`
  return `"${pattern.replace(/"/g, '\\"')}"`
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Validate that a string is a valid UUID v4 format */
export function isValidUuid(value: string): boolean {
  return UUID_RE.test(value)
}
