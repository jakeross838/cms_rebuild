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
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

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
    // Invoice statuses
    needs_matching: 'bg-sand-100 text-orange-800',
    draft: 'bg-warm-100 text-warm-700',
    pm_pending: 'bg-info-bg text-info-dark',
    accountant_pending: 'bg-warm-100 text-warm-800',
    owner_pending: 'bg-danger-bg text-danger-dark',
    approved: 'bg-success-bg text-success-dark',
    in_draw: 'bg-stone-100 text-teal-800',
    paid: 'bg-warm-200 text-warm-700',
    rejected: 'bg-danger-bg text-danger-dark',
  }
  return colors[status] || 'bg-warm-100 text-warm-700'
}

/** Escape special characters in LIKE/ILIKE patterns to prevent query injection */
export function escapeLike(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&')
}
