'use client'

import { useState } from 'react'

import {
  AlertTriangle,
  ChevronDown,
  Loader2,
  MessageSquare,
  Minus,
  Plus,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  useInvoiceDisputes,
  useCreateDispute,
  useResolveDispute,
  useDisputeComms,
  useAddDisputeComm,
} from '@/hooks/use-invoices'
import type {
  InvoiceDispute,
  DisputeCommunication,
  DisputeType,
  DisputeReasonCategory,
} from '@/types/invoice-full'
import { DISPUTE_REASON_OPTIONS } from '@/types/invoice-full'
import { formatCurrency, formatDate, formatStatus, getStatusColor, cn } from '@/lib/utils'
import { toast } from 'sonner'

// -- DisputeCard ------------------------------------------------------------

function DisputeCard({
  dispute,
  invoiceId,
  isExpanded,
  onToggle,
}: {
  dispute: InvoiceDispute
  invoiceId: string
  isExpanded: boolean
  onToggle: () => void
}) {
  const resolveMutation = useResolveDispute(invoiceId, dispute.id)
  const { data: commsResponse, isLoading: commsLoading } = useDisputeComms(
    isExpanded ? invoiceId : null,
    isExpanded ? dispute.id : null
  )
  const addCommMutation = useAddDisputeComm(invoiceId, dispute.id)

  const comms = ((commsResponse as { data: DisputeCommunication[] } | undefined)?.data ?? []) as DisputeCommunication[]

  const [resolveNotes, setResolveNotes] = useState('')
  const [showResolve, setShowResolve] = useState(false)
  const [newMessage, setNewMessage] = useState('')

  const isOpen = dispute.status === 'open' || dispute.status === 'in_review' || dispute.status === 'escalated'
  const reasonLabel = DISPUTE_REASON_OPTIONS.find((r) => r.value === dispute.reason_category)?.label ?? formatStatus(dispute.reason_category)

  const handleResolve = async (status: 'resolved_adjusted' | 'resolved_as_is' | 'closed') => {
    try {
      await resolveMutation.mutateAsync({
        status,
        resolution_notes: resolveNotes,
      })
      toast.success('Dispute resolved')
      setShowResolve(false)
      setResolveNotes('')
    } catch {
      toast.error('Failed to resolve dispute')
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    try {
      await addCommMutation.mutateAsync({
        message: newMessage,
        sender_type: 'user',
      })
      setNewMessage('')
      toast.success('Message sent')
    } catch {
      toast.error('Failed to send message')
    }
  }

  return (
    <Card className={cn(isOpen && 'border-amber-200')}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onToggle}>
          <AlertTriangle className={cn('h-5 w-5 shrink-0', isOpen ? 'text-amber-500' : 'text-muted-foreground')} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium">{reasonLabel}</p>
              <Badge className={getStatusColor(dispute.status)}>{formatStatus(dispute.status)}</Badge>
              <Badge variant="outline" className="text-xs">{dispute.dispute_type === 'full' ? 'Full' : 'Partial'}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatCurrency(dispute.disputed_amount)} · Opened {formatDate(dispute.created_at)}
            </p>
          </div>
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t space-y-4">
            <p className="text-sm">{dispute.reason_description}</p>

            {dispute.resolution_notes && (
              <div className="text-sm p-3 bg-muted/50 rounded-md">
                <p className="text-xs font-medium text-muted-foreground mb-1">Resolution Notes</p>
                <p>{dispute.resolution_notes}</p>
              </div>
            )}

            {/* Communication thread */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Communication</p>
              {commsLoading ? (
                <div className="flex justify-center py-3"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
              ) : comms.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No messages yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {comms.map((c) => (
                    <div key={c.id} className={cn('p-2 rounded-md text-sm', c.is_internal ? 'bg-amber-50 border border-amber-100' : 'bg-muted/50')}>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <span className="font-medium">{c.sender?.name ?? formatStatus(c.sender_type)}</span>
                        <span>{formatDate(c.created_at)}</span>
                        {c.is_internal && <Badge className="bg-amber-100 text-amber-700 text-[10px] py-0">Internal</Badge>}
                      </div>
                      <p>{c.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="h-8"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
                />
                <Button size="sm" variant="outline" className="h-8 shrink-0" onClick={handleSendMessage} disabled={!newMessage.trim() || addCommMutation.isPending}>
                  <MessageSquare className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Resolve actions */}
            {isOpen && (
              <div className="space-y-2">
                {!showResolve ? (
                  <Button size="sm" variant="outline" onClick={() => setShowResolve(true)}>
                    Resolve Dispute
                  </Button>
                ) : (
                  <div className="space-y-2 p-3 bg-muted/50 rounded-md">
                    <textarea
                      value={resolveNotes}
                      onChange={(e) => setResolveNotes(e.target.value)}
                      placeholder="Resolution notes..."
                      rows={2}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button size="sm" onClick={() => handleResolve('resolved_adjusted')} disabled={resolveMutation.isPending}>
                        Resolve (Adjusted)
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleResolve('resolved_as_is')} disabled={resolveMutation.isPending}>
                        Resolve (As-Is)
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleResolve('closed')} disabled={resolveMutation.isPending}>
                        Close
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowResolve(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// -- DisputesTab ------------------------------------------------------------

interface DisputesTabProps {
  invoiceId: string
  invoiceAmount: number
}

export function DisputesTab({ invoiceId, invoiceAmount }: DisputesTabProps) {
  const { data: response, isLoading } = useInvoiceDisputes(invoiceId)
  const createMutation = useCreateDispute(invoiceId)

  const disputes = ((response as { data: InvoiceDispute[] } | undefined)?.data ?? []) as InvoiceDispute[]

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [expandedDisputeId, setExpandedDisputeId] = useState<string | null>(null)
  const [newDispute, setNewDispute] = useState({
    dispute_type: 'partial' as DisputeType,
    disputed_amount: '',
    reason_category: 'incorrect_amount' as DisputeReasonCategory,
    reason_description: '',
  })

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        dispute_type: newDispute.dispute_type,
        disputed_amount: parseFloat(newDispute.disputed_amount) || 0,
        reason_category: newDispute.reason_category,
        reason_description: newDispute.reason_description,
      })
      toast.success('Dispute opened')
      setNewDispute({ dispute_type: 'partial', disputed_amount: '', reason_category: 'incorrect_amount', reason_description: '' })
      setShowCreateForm(false)
    } catch {
      toast.error('Failed to open dispute')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{disputes.length} dispute{disputes.length !== 1 ? 's' : ''}</h3>
        <Button size="sm" variant="outline" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? <Minus className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showCreateForm ? 'Cancel' : 'Open Dispute'}
        </Button>
      </div>

      {/* Create dispute form */}
      {showCreateForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Dispute</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <select
                  value={newDispute.dispute_type}
                  onChange={(e) => setNewDispute((p) => ({ ...p, dispute_type: e.target.value as DisputeType }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="partial">Partial</option>
                  <option value="full">Full</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Disputed Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newDispute.disputed_amount}
                  onChange={(e) => setNewDispute((p) => ({ ...p, disputed_amount: e.target.value }))}
                  placeholder={newDispute.dispute_type === 'full' ? invoiceAmount.toString() : '0.00'}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Reason</label>
              <select
                value={newDispute.reason_category}
                onChange={(e) => setNewDispute((p) => ({ ...p, reason_category: e.target.value as DisputeReasonCategory }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {DISPUTE_REASON_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <textarea
                value={newDispute.reason_description}
                onChange={(e) => setNewDispute((p) => ({ ...p, reason_description: e.target.value }))}
                rows={3}
                placeholder="Describe the dispute in detail..."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleCreate} disabled={!newDispute.reason_description || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <AlertTriangle className="h-4 w-4 mr-1" />}
                Open Dispute
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disputes list */}
      {disputes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No disputes have been filed for this invoice.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {disputes.map((dispute) => (
            <DisputeCard
              key={dispute.id}
              dispute={dispute}
              invoiceId={invoiceId}
              isExpanded={expandedDisputeId === dispute.id}
              onToggle={() => setExpandedDisputeId(expandedDisputeId === dispute.id ? null : dispute.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
