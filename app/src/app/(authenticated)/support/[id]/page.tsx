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
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { formatDate, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Support Ticket' }


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

// ── Priority Badge ───────────────────────────────────────────────────

function getPriorityColor(priority: string | null): string {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-700'
    case 'high': return 'bg-red-100 text-red-700'
    case 'medium': return 'bg-amber-100 text-amber-700'
    case 'low': return 'bg-warm-100 text-warm-700'
    default: return 'bg-warm-100 text-warm-700'
  }
}

// ── Page Component ───────────────────────────────────────────────────

export default function SupportTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
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
    async function loadTicket() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('company_id', companyId)
        .eq('id', params.id as string)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Ticket not found')
        setLoading(false)
        return
      }

      const t = data as TicketData
      setTicket(t)
      setFormData({
        subject: t.subject,
        description: t.description || '',
        priority: t.priority || 'medium',
        category: t.category || '',
        status: t.status,
      })
      setLoading(false)
    }
    loadTicket()
  }, [params.id, supabase, companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const updatePayload: Record<string, unknown> = {
        subject: formData.subject,
        description: formData.description || null,
        status: formData.status,
      }
      if (formData.priority) updatePayload.priority = formData.priority
      if (formData.category) updatePayload.category = formData.category

      const { error: updateError } = await supabase
        .from('support_tickets')
        .update(updatePayload as never)
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError
      toast.success('Saved')

      setTicket((prev) => prev ? {
        ...prev,
        subject: formData.subject,
        description: formData.description || null,
        priority: formData.priority || null,
        category: formData.category || null,
        status: formData.status,
      } : prev)
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to save'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    const { error: deleteError } = await supabase
      .from('support_tickets')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id as string)
      .eq('company_id', companyId)

    if (deleteError) {
      setError('Failed to archive ticket')
      toast.error('Failed to archive ticket')
      return
    }
    toast.success('Archived')

    router.push('/support')
    router.refresh()
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
        <p className="text-destructive">{error || 'Ticket not found'}</p>
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
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Ticket updated successfully</div>}

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
                  <Badge className={`${getStatusColor(ticket.status)} rounded`}>{ticket.status.replace('_', ' ')}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-20">Priority</span>
                  <Badge className={`${getPriorityColor(ticket.priority)} rounded`}>{ticket.priority || 'medium'}</Badge>
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
