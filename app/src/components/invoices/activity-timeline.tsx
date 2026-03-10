'use client'

import {
  Ban,
  Banknote,
  Bot,
  CheckCircle2,
  Clock,
  FileCheck,
  FolderPlus,
  Pencil,
  Plus,
  Stamp,
  Trash2,
  Upload,
  AlertTriangle,
  X,
} from 'lucide-react'

import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InvoiceActivity {
  id: string
  action: string
  performed_by: string | null
  details: Record<string, unknown> | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Activity config — maps action names to icons, labels, and colors
// ---------------------------------------------------------------------------

const ACTIVITY_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  uploaded: { icon: Upload, label: 'Uploaded', color: 'text-blue-600' },
  created: { icon: Plus, label: 'Created', color: 'text-blue-600' },
  processed: { icon: Bot, label: 'AI Processed', color: 'text-purple-600' },
  coded: { icon: FileCheck, label: 'Cost Coded', color: 'text-indigo-600' },
  approved: { icon: CheckCircle2, label: 'Approved', color: 'text-emerald-600' },
  status_approved: { icon: CheckCircle2, label: 'Approved', color: 'text-emerald-600' },
  denied: { icon: Ban, label: 'Denied', color: 'text-red-600' },
  status_denied: { icon: Ban, label: 'Denied', color: 'text-red-600' },
  status_needs_approval: { icon: AlertTriangle, label: 'Needs Approval', color: 'text-amber-600' },
  status_needs_review: { icon: AlertTriangle, label: 'Needs Review', color: 'text-amber-600' },
  status_in_draw: { icon: FolderPlus, label: 'Added to Draw', color: 'text-cyan-600' },
  status_billed: { icon: FileCheck, label: 'Billed', color: 'text-teal-600' },
  status_paid: { icon: Banknote, label: 'Paid', color: 'text-emerald-600' },
  stamped: { icon: Stamp, label: 'Stamped', color: 'text-orange-600' },
  added_to_draw: { icon: FolderPlus, label: 'Added to Draw', color: 'text-cyan-600' },
  removed_from_draw: { icon: Trash2, label: 'Removed from Draw', color: 'text-amber-600' },
  paid: { icon: Banknote, label: 'Paid', color: 'text-emerald-600' },
  paid_to_vendor: { icon: Banknote, label: 'Payment Recorded', color: 'text-emerald-600' },
  unpaid: { icon: X, label: 'Payment Reversed', color: 'text-red-600' },
  updated: { icon: Pencil, label: 'Updated', color: 'text-stone-600' },
  deleted: { icon: Trash2, label: 'Deleted', color: 'text-red-600' },
  allocation_removed: { icon: Trash2, label: 'Allocation Removed', color: 'text-amber-600' },
  allocation_reassigned: { icon: Pencil, label: 'Allocation Reassigned', color: 'text-blue-600' },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

function getDetailsSummary(activity: InvoiceActivity): string | null {
  const d = activity.details
  if (!d) return null

  if (activity.action === 'processed' || activity.action === 'uploaded') {
    const parts: string[] = []
    if (d.vendorName) parts.push(`Vendor: ${d.vendorName}`)
    if (d.jobName) parts.push(`Job: ${d.jobName}`)
    if (d.confidence) parts.push(`${Math.round((d.confidence as number) * 100)}% confidence`)
    return parts.length > 0 ? parts.join(' · ') : null
  }

  if (d.from && d.to) return `${d.from} → ${d.to}`
  if (d.note) return d.note as string
  if (d.reason) return d.reason as string
  if (d.message) return d.message as string
  if (d.fields && Array.isArray(d.fields)) return `Updated: ${(d.fields as string[]).join(', ')}`

  return null
}

// ---------------------------------------------------------------------------
// ActivityItem
// ---------------------------------------------------------------------------

function ActivityItem({ activity }: { activity: InvoiceActivity }) {
  const config = ACTIVITY_CONFIG[activity.action] || {
    icon: Clock,
    label: activity.action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    color: 'text-stone-500',
  }

  const Icon = config.icon
  const detailsSummary = getDetailsSummary(activity)

  return (
    <div className="flex items-start gap-3 py-2 px-2 rounded hover:bg-accent/50 transition-colors">
      <div className={cn('mt-0.5', config.color)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{config.label}</span>
          <span className="text-xs text-muted-foreground">{timeAgo(activity.created_at)}</span>
        </div>
        {activity.performed_by && (
          <p className="text-xs text-muted-foreground">by {activity.performed_by}</p>
        )}
        {detailsSummary && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{detailsSummary}</p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ActivityTimeline
// ---------------------------------------------------------------------------

interface ActivityTimelineProps {
  activities: InvoiceActivity[]
  maxHeight?: string
  className?: string
}

export function ActivityTimeline({ activities, maxHeight = '12rem', className }: ActivityTimelineProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-medium">Activity</h4>
      </div>

      <div className="space-y-0 overflow-y-auto" style={{ maxHeight }}>
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground py-2 px-2">No activity recorded yet</p>
        )}
      </div>
    </div>
  )
}
