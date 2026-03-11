'use client'

import { useState } from 'react'

import {
  ArrowUpCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  Minus,
  UserPlus,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  useInvoiceApprovals,
  useApprovalAction,
} from '@/hooks/use-invoices'
import type { InvoiceApproval } from '@/types/invoice-full'
import { formatCurrency, formatDate, formatStatus, cn } from '@/lib/utils'
import { toast } from 'sonner'

// -- ApprovalStepCard -------------------------------------------------------

function ApprovalStepCard({
  approval,
  invoiceId,
  stepNumber,
  isLast,
  isExpanded,
  onToggle,
  actionNotes,
  setActionNotes,
}: {
  approval: InvoiceApproval
  invoiceId: string
  stepNumber: number
  isLast: boolean
  isExpanded: boolean
  onToggle: () => void
  actionNotes: string
  setActionNotes: (v: string) => void
}) {
  const actionMutation = useApprovalAction(invoiceId, approval.id)
  const isPending = approval.status === 'pending'
  const isActionable = isPending || approval.status === 'delegated' || approval.status === 'escalated'
  const [showDelegate, setShowDelegate] = useState(false)
  const [showEscalate, setShowEscalate] = useState(false)
  const [delegateEmail, setDelegateEmail] = useState('')
  const [escalateReason, setEscalateReason] = useState('')

  const statusIcon = (() => {
    switch (approval.status) {
      case 'approved': return <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      case 'rejected': return <XCircle className="h-5 w-5 text-destructive" />
      case 'pending': return <Clock className="h-5 w-5 text-amber-500" />
      case 'delegated': return <UserPlus className="h-5 w-5 text-blue-500" />
      case 'skipped': return <Minus className="h-5 w-5 text-muted-foreground" />
      case 'escalated': return <ArrowUpCircle className="h-5 w-5 text-orange-500" />
      default: return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  })()

  const statusBadgeColor = (() => {
    switch (approval.status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-amber-100 text-amber-700'
      case 'delegated': return 'bg-blue-100 text-blue-700'
      case 'escalated': return 'bg-orange-100 text-orange-700'
      case 'skipped': return 'bg-stone-100 text-stone-600'
      default: return 'bg-stone-100 text-stone-600'
    }
  })()

  const handleAction = async (action: 'approved' | 'rejected' | 'delegated' | 'escalated') => {
    try {
      const payload: Record<string, unknown> = { action, notes: actionNotes || null }
      if (action === 'delegated') payload.delegated_to = delegateEmail
      if (action === 'escalated') payload.escalation_reason = escalateReason
      await actionMutation.mutateAsync(payload as any)
      const labels: Record<string, string> = { approved: 'approved', rejected: 'rejected', delegated: 'delegated', escalated: 'escalated' }
      toast.success(`Step ${labels[action]}`)
      setActionNotes('')
      setShowDelegate(false)
      setShowEscalate(false)
      setDelegateEmail('')
      setEscalateReason('')
    } catch {
      toast.error(`Failed to perform action`)
    }
  }

  return (
    <div className={cn('relative pl-10 pb-4', isLast && 'pb-0')}>
      {/* Timeline node */}
      <div className={cn(
        'absolute left-2 top-4 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center z-10',
        approval.status === 'approved' ? 'border-emerald-500 bg-emerald-50' :
        approval.status === 'rejected' ? 'border-red-500 bg-red-50' :
        approval.status === 'pending' ? 'border-amber-400 bg-amber-50' :
        approval.status === 'delegated' ? 'border-blue-500 bg-blue-50' :
        approval.status === 'escalated' ? 'border-orange-500 bg-orange-50' :
        'border-stone-300 bg-stone-50'
      )}>
        <span className="text-[9px] font-bold text-muted-foreground">{stepNumber}</span>
      </div>

      <Card className={cn(
        'transition-colors',
        isActionable && 'border-amber-200 bg-amber-50/30',
        approval.status === 'approved' && 'border-emerald-200/60',
        approval.status === 'rejected' && 'border-red-200/60',
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onToggle}>
            {statusIcon}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium">{approval.step_name}</p>
                <span className={cn('text-xs px-2 py-0.5 rounded font-medium', statusBadgeColor)}>
                  {formatStatus(approval.status)}
                </span>
                {approval.required_role && (
                  <span className="text-xs bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                    {formatStatus(approval.required_role)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
                {approval.assigned_user?.name && (
                  <span>Assigned: {approval.assigned_user.name}</span>
                )}
                {approval.action_user?.name && approval.action_at && (
                  <span>
                    {approval.status === 'approved' ? 'Approved' : approval.status === 'rejected' ? 'Rejected' : 'Action'} by {approval.action_user.name} on {formatDate(approval.action_at)}
                  </span>
                )}
                {approval.delegated_to && approval.status === 'delegated' && (
                  <span className="text-blue-600">Delegated to another user</span>
                )}
                {approval.escalated_at && (
                  <span className="text-orange-600">Escalated {formatDate(approval.escalated_at)}</span>
                )}
              </div>
            </div>
            <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform flex-shrink-0', isExpanded && 'rotate-180')} />
          </div>

          {isExpanded && (
            <div className="mt-3 pt-3 border-t space-y-3">
              {/* Action history */}
              {approval.action_notes && (
                <div className="text-sm bg-accent/50 rounded-md p-2.5">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-foreground">{approval.action_notes}</p>
                </div>
              )}
              {approval.escalation_reason && (
                <div className="text-sm bg-orange-50 rounded-md p-2.5">
                  <p className="text-xs font-medium text-orange-600 mb-1">Escalation Reason</p>
                  <p className="text-orange-700">{approval.escalation_reason}</p>
                </div>
              )}

              {/* Threshold info */}
              {(approval.threshold_min != null || approval.threshold_max != null) && (
                <p className="text-xs text-muted-foreground">
                  Applies to invoices
                  {approval.threshold_min != null && ` over ${formatCurrency(approval.threshold_min)}`}
                  {approval.threshold_max != null && ` up to ${formatCurrency(approval.threshold_max)}`}
                </p>
              )}

              {/* Actions for pending/actionable steps */}
              {isActionable && (
                <div className="space-y-3">
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Add notes (optional)..."
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />

                  {/* Primary actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button size="sm" onClick={() => handleAction('approved')} disabled={actionMutation.isPending}>
                      {actionMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleAction('rejected')} disabled={actionMutation.isPending}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <div className="flex-1" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setShowDelegate(!showDelegate); setShowEscalate(false) }}
                      disabled={actionMutation.isPending}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Delegate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setShowEscalate(!showEscalate); setShowDelegate(false) }}
                      disabled={actionMutation.isPending}
                    >
                      <ArrowUpCircle className="h-4 w-4 mr-1" />
                      Escalate
                    </Button>
                  </div>

                  {/* Delegate form */}
                  {showDelegate && (
                    <div className="bg-blue-50 rounded-md p-3 space-y-2">
                      <p className="text-xs font-medium text-blue-700">Delegate to another user</p>
                      <Input
                        type="text"
                        value={delegateEmail}
                        onChange={(e) => setDelegateEmail(e.target.value)}
                        placeholder="User ID or email..."
                        className="bg-background"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" disabled={!delegateEmail || actionMutation.isPending} onClick={() => handleAction('delegated')}>
                          {actionMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                          Confirm Delegate
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowDelegate(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}

                  {/* Escalate form */}
                  {showEscalate && (
                    <div className="bg-orange-50 rounded-md p-3 space-y-2">
                      <p className="text-xs font-medium text-orange-700">Escalate this approval step</p>
                      <textarea
                        value={escalateReason}
                        onChange={(e) => setEscalateReason(e.target.value)}
                        placeholder="Reason for escalation..."
                        rows={2}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" disabled={!escalateReason || actionMutation.isPending} onClick={() => handleAction('escalated')}>
                          {actionMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                          Confirm Escalate
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowEscalate(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// -- ApprovalsTab -----------------------------------------------------------

interface ApprovalsTabProps {
  invoiceId: string
}

export function ApprovalsTab({ invoiceId }: ApprovalsTabProps) {
  const { data: response, isLoading } = useInvoiceApprovals(invoiceId)
  const approvals = ((response as { data: InvoiceApproval[] } | undefined)?.data ?? []) as InvoiceApproval[]

  const [activeApprovalId, setActiveApprovalId] = useState<string | null>(null)
  const [actionNotes, setActionNotes] = useState('')

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  const sortedApprovals = [...approvals].sort((a, b) => a.step_order - b.step_order)
  const approvedCount = sortedApprovals.filter(a => a.status === 'approved').length
  const totalSteps = sortedApprovals.length
  const hasRejection = sortedApprovals.some(a => a.status === 'rejected')

  return (
    <div className="space-y-5">
      {/* Progress summary */}
      {totalSteps > 0 && (
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {hasRejection ? 'Approval Denied' : approvedCount === totalSteps ? 'Fully Approved' : 'Approval Progress'}
            </span>
            <span className="text-sm text-muted-foreground">
              {approvedCount} of {totalSteps} step{totalSteps !== 1 ? 's' : ''} approved
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-stone-200">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                hasRejection ? 'bg-red-500' : approvedCount === totalSteps ? 'bg-emerald-500' : 'bg-amber-500'
              )}
              style={{ width: `${totalSteps > 0 ? (approvedCount / totalSteps) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Visual timeline */}
      {sortedApprovals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No approval steps configured for this invoice.
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Connecting line */}
          {sortedApprovals.length > 1 && (
            <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-border" />
          )}
          <div className="space-y-0">
            {sortedApprovals.map((approval, idx) => (
              <ApprovalStepCard
                key={approval.id}
                approval={approval}
                invoiceId={invoiceId}
                stepNumber={idx + 1}
                isLast={idx === sortedApprovals.length - 1}
                isExpanded={activeApprovalId === approval.id}
                onToggle={() => setActiveApprovalId(activeApprovalId === approval.id ? null : approval.id)}
                actionNotes={activeApprovalId === approval.id ? actionNotes : ''}
                setActionNotes={setActionNotes}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
