'use client'

import { useState } from 'react'

import {
  Check,
  Loader2,
  Minus,
  Plus,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  usePaymentPrereqs,
  useCreatePaymentPrereq,
  useTogglePrereq,
} from '@/hooks/use-invoices'
import type { PaymentPrerequisite } from '@/types/invoice-full'
import { formatDate, formatStatus, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { PREREQ_TYPES } from '@/components/invoices/invoice-detail-types'

// -- PrereqRow --------------------------------------------------------------

function PrereqRow({ prereq, invoiceId }: { prereq: PaymentPrerequisite; invoiceId: string }) {
  const toggleMutation = useTogglePrereq(invoiceId, prereq.id)

  const handleToggle = async () => {
    try {
      await toggleMutation.mutateAsync(!prereq.is_met)
      toast.success(prereq.is_met ? 'Marked as unmet' : 'Marked as met')
    } catch {
      toast.error('Failed to toggle prerequisite')
    }
  }

  const typeLabel = PREREQ_TYPES.find((t) => t.value === prereq.prerequisite_type)?.label ?? formatStatus(prereq.prerequisite_type)

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            disabled={toggleMutation.isPending}
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors',
              prereq.is_met
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-muted-foreground/30 hover:border-muted-foreground/50'
            )}
          >
            {toggleMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : prereq.is_met ? (
              <Check className="h-3.5 w-3.5" />
            ) : null}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn('text-sm font-medium', prereq.is_met && 'line-through text-muted-foreground')}>{prereq.label}</p>
              <Badge variant="outline" className="text-[10px]">{typeLabel}</Badge>
            </div>
            {prereq.met_at && (
              <p className="text-xs text-muted-foreground">Met on {formatDate(prereq.met_at)}</p>
            )}
            {prereq.notes && (
              <p className="text-xs text-muted-foreground mt-0.5">{prereq.notes}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// -- PrerequisitesTab -------------------------------------------------------

interface PrerequisitesTabProps {
  invoiceId: string
}

export function PrerequisitesTab({ invoiceId }: PrerequisitesTabProps) {
  const { data: response, isLoading } = usePaymentPrereqs(invoiceId)
  const createMutation = useCreatePaymentPrereq(invoiceId)

  const prereqs = ((response as { data: PaymentPrerequisite[] } | undefined)?.data ?? []) as PaymentPrerequisite[]

  const [showAddForm, setShowAddForm] = useState(false)
  const [newPrereq, setNewPrereq] = useState({
    prerequisite_type: 'coi' as string,
    label: '',
    notes: '',
  })

  const metCount = prereqs.filter((p) => p.is_met).length

  const handleAdd = async () => {
    try {
      await createMutation.mutateAsync({
        prerequisite_type: newPrereq.prerequisite_type,
        label: newPrereq.label,
        notes: newPrereq.notes || null,
      })
      toast.success('Prerequisite added')
      setNewPrereq({ prerequisite_type: 'coi', label: '', notes: '' })
      setShowAddForm(false)
    } catch {
      toast.error('Failed to add prerequisite')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {prereqs.length} prerequisite{prereqs.length !== 1 ? 's' : ''}
          </h3>
          {prereqs.length > 0 && (
            <Badge className={metCount === prereqs.length ? 'bg-emerald-100 text-emerald-700' : 'bg-warning-bg text-warning-dark'}>
              {metCount}/{prereqs.length} met
            </Badge>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? <Minus className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showAddForm ? 'Cancel' : 'Add Prerequisite'}
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <select
                  value={newPrereq.prerequisite_type}
                  onChange={(e) => setNewPrereq((p) => ({ ...p, prerequisite_type: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {PREREQ_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Label</label>
                <Input
                  value={newPrereq.label}
                  onChange={(e) => setNewPrereq((p) => ({ ...p, label: e.target.value }))}
                  placeholder="e.g., Current COI on file"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
              <Input
                value={newPrereq.notes}
                onChange={(e) => setNewPrereq((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Additional notes..."
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleAdd} disabled={!newPrereq.label || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {prereqs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No payment prerequisites configured.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {prereqs.map((prereq) => (
            <PrereqRow key={prereq.id} prereq={prereq} invoiceId={invoiceId} />
          ))}
        </div>
      )}
    </div>
  )
}
