'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useSupportTicket, useUpdateSupportTicket, useDeleteSupportTicket } from '@/hooks/use-support'
import { formatDate, getStatusColor, formatStatus } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ────────────────────────────────────────────────────────────

interface TicketData {
  id: string
  ticket_number: string | null
  subject: string
  description: string | null
  status: string
  priority: string | null
  category: string | null
  channel: string | null
  created_at: string | null
  updated_at: string | null
}

// ── Page Component ───────────────────────────────────────────────────

export default function SupportTicketDetailPage() {
  const params = useParams()
  const router = useRouter()

  const ticketId = params.id as string
  const { data: response, isLoading: loading, error: fetchError } = useSupportTicket(ticketId)
  const updateTicket = useUpdateSupportTicket(ticketId)
  const deleteTicket = useDeleteSupportTicket()
  const ticket = (response as { data: TicketData } | undefined)?.data ?? null

  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: '',
    category: '',
    status: '',
  })

  useEffect(() => {
    if (ticket) {
      setFormData({
        subject: ticket.subject,
        description: ticket.description || '',
        priority: ticket.priority || 'medium',
        category: ticket.category || '',
        status: ticket.status,
      })
    }
  }, [ticket])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.subject.trim()) { toast.error('Subject is required'); return }

    try {
      const updatePayload: Record<string, unknown> = {
        subject: formData.subject,
        description: formData.description || null,
        status: formData.status,
      }
      if (formData.priority) updatePayload.priority = formData.priority
      if (formData.category) updatePayload.category = formData.category

      await updateTicket.mutateAsync(updatePayload)
      toast.success('Saved')
      setEditing(false)
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to save')
    }
  }

  const handleArchive = async () => {
    try {
      await deleteTicket.mutateAsync(ticketId)
      toast.success('Archived')
      router.push('/support')
      router.refresh()
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to archive')
    }
  }

  // ── Loading State ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // ── Not Found State ──────────────────────────────────────────────

  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/support" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Support
        </Link>
        <p className="text-destructive">{fetchError?.message || 'Ticket not found'}</p>
      </div>
    )
  }

  // ── Main Render ──────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/support" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Support
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{ticket.subject}</h1>
            <p className="text-muted-foreground">
              {ticket.ticket_number ? `#${ticket.ticket_number} \u00b7 ` : ''}Created {formatDate(ticket.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
            ) : (
              <>
                <Button onClick={() => setEditing(false)} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={updateTicket.isPending}>
                  {updateTicket.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {fetchError && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{fetchError.message}</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            {/* ── View Mode ─────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-20">Status</span>
                  <Badge className={`${getStatusColor(ticket.status)} rounded`}>{formatStatus(ticket.status)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-20">Priority</span>
                  <Badge className={getStatusColor(ticket.priority || 'medium')}>{formatStatus(ticket.priority || 'medium')}</Badge>
                </div>
                {ticket.category && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium w-20">Category</span>
                    <Badge variant="outline">{ticket.category}</Badge>
                  </div>
                )}
                {ticket.channel && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium w-20">Channel</span>
                    <span className="text-sm text-muted-foreground">{ticket.channel}</span>
                  </div>
                )}
                {ticket.updated_at && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium w-20">Updated</span>
                    <span className="text-sm text-muted-foreground">{formatDate(ticket.updated_at)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {ticket.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Ticket
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* ── Edit Mode ─────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Information</CardTitle>
                <CardDescription>Update ticket details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject <span className="text-red-500">*</span></label>
                  <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea
                    id="description" aria-label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting">Waiting</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Billing, Bug" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive ticket?"
        description="This ticket will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleArchive}
      />
    </div>
  )
}
