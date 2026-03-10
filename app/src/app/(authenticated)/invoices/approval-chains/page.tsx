'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

import {
  Plus,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Trash2,
  Pencil,
  Star,
  Power,
  PowerOff,
  GitBranch,
  Clock,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useApprovalChains,
  useCreateApprovalChain,
  useUpdateApprovalChain,
  useDeleteApprovalChain,
} from '@/hooks/use-invoices'
import { cn, formatCurrency } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ChainType = 'invoice' | 'purchase_order' | 'change_order' | 'draw_request'
type RequiredRole = 'owner' | 'admin' | 'pm' | 'superintendent' | 'office'

interface ApprovalStep {
  id?: string
  step_order: number
  step_name: string
  required_role: RequiredRole
  threshold_min: number | null
  threshold_max: number | null
  auto_escalate_hours: number | null
}

interface ApprovalChain {
  id: string
  name: string
  description: string | null
  chain_type: ChainType
  is_default: boolean
  is_active: boolean
  steps: ApprovalStep[]
  created_at: string | null
  updated_at: string | null
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHAIN_TYPE_TABS: { value: ChainType | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'purchase_order', label: 'Purchase Order' },
  { value: 'change_order', label: 'Change Order' },
  { value: 'draw_request', label: 'Draw Request' },
]

const CHAIN_TYPE_OPTIONS: { value: ChainType; label: string }[] = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'purchase_order', label: 'Purchase Order' },
  { value: 'change_order', label: 'Change Order' },
  { value: 'draw_request', label: 'Draw Request' },
]

const ROLE_OPTIONS: { value: RequiredRole; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'pm', label: 'Project Manager' },
  { value: 'superintendent', label: 'Superintendent' },
  { value: 'office', label: 'Office' },
]

const CHAIN_TYPE_BADGE: Record<ChainType, { label: string; className: string }> = {
  invoice: { label: 'Invoice', className: 'bg-blue-50 text-blue-700' },
  purchase_order: { label: 'Purchase Order', className: 'bg-emerald-50 text-emerald-700' },
  change_order: { label: 'Change Order', className: 'bg-amber-50 text-amber-700' },
  draw_request: { label: 'Draw Request', className: 'bg-purple-50 text-purple-700' },
}

const ROLE_LABEL: Record<RequiredRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  pm: 'PM',
  superintendent: 'Supt.',
  office: 'Office',
}

function emptyStep(order: number): ApprovalStep {
  return {
    step_order: order,
    step_name: '',
    required_role: 'pm',
    threshold_min: null,
    threshold_max: null,
    auto_escalate_hours: null,
  }
}

// ---------------------------------------------------------------------------
// Step Builder
// ---------------------------------------------------------------------------

function StepBuilder({
  steps,
  onChange,
}: {
  steps: ApprovalStep[]
  onChange: (steps: ApprovalStep[]) => void
}) {
  function updateStep(index: number, patch: Partial<ApprovalStep>) {
    const next = steps.map((s, i) => (i === index ? { ...s, ...patch } : s))
    onChange(next)
  }

  function removeStep(index: number) {
    const next = steps
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, step_order: i + 1 }))
    onChange(next)
  }

  function moveStep(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= steps.length) return
    const next = [...steps]
    const temp = next[index]
    next[index] = next[target]
    next[target] = temp
    onChange(next.map((s, i) => ({ ...s, step_order: i + 1 })))
  }

  function addStep() {
    onChange([...steps, emptyStep(steps.length + 1)])
  }

  return (
    <div className="space-y-3">
      <Label>Approval Steps</Label>
      {steps.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No steps yet. Add at least one approval step.
        </p>
      )}
      {steps.map((step, index) => (
        <div
          key={index}
          className="rounded-lg border border-border bg-card p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Step {index + 1}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={index === 0}
                onClick={() => moveStep(index, -1)}
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={index === steps.length - 1}
                onClick={() => moveStep(index, 1)}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => removeStep(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`step-name-${index}`}>Step Name</Label>
              <Input
                id={`step-name-${index}`}
                placeholder="e.g. PM Review"
                value={step.step_name}
                onChange={(e) => updateStep(index, { step_name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Required Role</Label>
              <Select
                value={step.required_role}
                onValueChange={(val) =>
                  updateStep(index, { required_role: val as RequiredRole })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`step-min-${index}`}>Threshold Min ($)</Label>
              <Input
                id={`step-min-${index}`}
                type="number"
                min={0}
                placeholder="0"
                value={step.threshold_min ?? ''}
                onChange={(e) =>
                  updateStep(index, {
                    threshold_min: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`step-max-${index}`}>Threshold Max ($)</Label>
              <Input
                id={`step-max-${index}`}
                type="number"
                min={0}
                placeholder="No limit"
                value={step.threshold_max ?? ''}
                onChange={(e) =>
                  updateStep(index, {
                    threshold_max: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`step-escalate-${index}`}>Auto-Escalate (hrs)</Label>
              <Input
                id={`step-escalate-${index}`}
                type="number"
                min={0}
                placeholder="None"
                value={step.auto_escalate_hours ?? ''}
                onChange={(e) =>
                  updateStep(index, {
                    auto_escalate_hours: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addStep}>
        <Plus className="h-4 w-4 mr-1" />
        Add Step
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Steps Visualization
// ---------------------------------------------------------------------------

function StepsVisualization({ steps }: { steps: ApprovalStep[] }) {
  if (!steps || steps.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">No steps configured</p>
    )
  }

  const sorted = [...steps].sort((a, b) => a.step_order - b.step_order)

  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2">
      {sorted.map((step, index) => {
        const thresholdText =
          step.threshold_min != null || step.threshold_max != null
            ? `${step.threshold_min != null ? formatCurrency(step.threshold_min) : '$0'} – ${step.threshold_max != null ? formatCurrency(step.threshold_max) : 'No limit'}`
            : null

        return (
          <div key={step.id ?? index} className="flex items-center">
            {/* Connector line */}
            {index > 0 && (
              <div className="w-6 h-0.5 bg-stone-300 flex-shrink-0" />
            )}

            {/* Step circle + info */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0 min-w-[80px]">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {step.step_order}
              </div>
              <span className="text-xs font-medium text-foreground text-center leading-tight max-w-[100px] truncate">
                {step.step_name || `Step ${step.step_order}`}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {ROLE_LABEL[step.required_role] ?? step.required_role}
              </span>
              {thresholdText && (
                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                  {thresholdText}
                </span>
              )}
              {step.auto_escalate_hours != null && (
                <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {step.auto_escalate_hours}h
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Create / Edit Form Modal
// ---------------------------------------------------------------------------

interface FormState {
  name: string
  description: string
  chain_type: ChainType
  is_default: boolean
  steps: ApprovalStep[]
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  chain_type: 'invoice',
  is_default: false,
  steps: [emptyStep(1)],
}

function chainToForm(chain: ApprovalChain): FormState {
  return {
    name: chain.name,
    description: chain.description ?? '',
    chain_type: chain.chain_type,
    is_default: chain.is_default,
    steps: chain.steps?.length
      ? [...chain.steps].sort((a, b) => a.step_order - b.step_order)
      : [emptyStep(1)],
  }
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ApprovalChainsPage() {
  // Filter state
  const [typeFilter, setTypeFilter] = useState<ChainType | ''>('')
  const [showActive, setShowActive] = useState(true)

  // Modal state
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // -----------------------------------------------------------------------
  // Data hooks
  // -----------------------------------------------------------------------

  const queryParams: { chain_type?: string; is_active?: boolean } = {}
  if (typeFilter) queryParams.chain_type = typeFilter
  queryParams.is_active = showActive

  const { data, isLoading, error } = useApprovalChains(queryParams)
  const createMutation = useCreateApprovalChain()
  const updateMutation = useUpdateApprovalChain(editingId ?? '')
  const deleteMutation = useDeleteApprovalChain(deleteId ?? '')

  const chains: ApprovalChain[] = Array.isArray(data) ? data : (data as { data?: ApprovalChain[] })?.data ?? []

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const openCreate = useCallback(() => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }, [])

  const openEdit = useCallback((chain: ApprovalChain) => {
    setEditingId(chain.id)
    setForm(chainToForm(chain))
    setFormOpen(true)
  }, [])

  const handleSave = useCallback(() => {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      chain_type: form.chain_type,
      is_default: form.is_default,
      steps: form.steps.map((s, i) => ({
        ...s,
        step_order: i + 1,
        step_name: s.step_name.trim() || `Step ${i + 1}`,
      })),
    }

    if (editingId) {
      updateMutation.mutate(payload, {
        onSuccess: () => setFormOpen(false),
      })
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setFormOpen(false),
      })
    }
  }, [form, editingId, createMutation, updateMutation])

  const handleDelete = useCallback(() => {
    if (!deleteId) return
    deleteMutation.mutate(undefined, {
      onSuccess: () => setDeleteId(null),
    })
  }, [deleteId, deleteMutation])


  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Header                                                            */}
      {/* ================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/invoices"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              Approval Chain Templates
            </h1>
          </div>
          <p className="text-muted-foreground">
            Configure multi-step approval workflows for invoices
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Chain
        </Button>
      </div>

      {/* ================================================================= */}
      {/* Filter Tabs                                                       */}
      {/* ================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Chain type tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {CHAIN_TYPE_TABS.map((tab) => (
            <Button
              key={tab.value}
              variant={typeFilter === tab.value ? 'default' : 'outline'}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setTypeFilter(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Active / Inactive toggle */}
        <div className="flex gap-2 ml-auto">
          <Button
            variant={showActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowActive(true)}
          >
            Active
          </Button>
          <Button
            variant={!showActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowActive(false)}
          >
            Inactive
          </Button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Chain Cards                                                       */}
      {/* ================================================================= */}
      <div className="space-y-3">
        {isLoading && (
          <div className="bg-card rounded-lg border border-border text-center py-16">
            <div className="animate-pulse text-muted-foreground">
              Loading approval chains...
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 rounded-lg border border-red-200 text-center py-8 px-4">
            <p className="text-red-700 font-medium">Failed to load approval chains</p>
            <p className="text-red-600 text-sm mt-1">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        )}

        {!isLoading && !error && chains.length === 0 && (
          <div className="bg-card rounded-lg border border-border text-center py-16">
            <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground mb-1">
              No approval chains found
            </p>
            <p className="text-muted-foreground mb-4">
              {typeFilter || !showActive
                ? 'Try adjusting your filters'
                : 'Get started by creating your first approval chain template'}
            </p>
            {!typeFilter && showActive && (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Chain
              </Button>
            )}
          </div>
        )}

        {!isLoading &&
          !error &&
          chains.map((chain) => {
            const typeBadge = CHAIN_TYPE_BADGE[chain.chain_type]

            return (
              <div
                key={chain.id}
                className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left side */}
                  <div className="flex-1 min-w-0">
                    {/* Row 1: Name + badges */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-foreground">
                        {chain.name}
                      </span>
                      {typeBadge && (
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded font-medium',
                            typeBadge.className
                          )}
                        >
                          {typeBadge.label}
                        </span>
                      )}
                      {chain.is_default && (
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Default
                        </span>
                      )}
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded font-medium',
                          chain.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-stone-100 text-stone-500'
                        )}
                      >
                        {chain.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Row 2: Description */}
                    {chain.description && (
                      <p className="text-sm text-muted-foreground mb-2 max-w-xl">
                        {chain.description}
                      </p>
                    )}

                    {/* Row 3: Steps visualization */}
                    <StepsVisualization steps={chain.steps ?? []} />
                  </div>

                  {/* Right side: Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title="Edit"
                      onClick={() => openEdit(chain)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {!chain.is_default && (
                      <SetDefaultButton chainId={chain.id} />
                    )}
                    <ToggleActiveButton
                      chainId={chain.id}
                      isActive={chain.is_active}
                    />
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title="Delete"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(chain.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
      </div>

      {/* ================================================================= */}
      {/* Create / Edit Dialog                                              */}
      {/* ================================================================= */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Approval Chain' : 'New Approval Chain'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the approval chain template configuration.'
                : 'Create a new multi-step approval workflow template.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="chain-name">Name</Label>
              <Input
                id="chain-name"
                placeholder="e.g. Standard Invoice Approval"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="chain-description">Description</Label>
              <Textarea
                id="chain-description"
                placeholder="Describe when this approval chain should be used..."
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Chain type */}
              <div className="space-y-1.5">
                <Label>Chain Type</Label>
                <Select
                  value={form.chain_type}
                  onValueChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      chain_type: val as ChainType,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHAIN_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Is default */}
              <div className="space-y-1.5">
                <Label>&nbsp;</Label>
                <label className="flex items-center gap-2 h-9 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        is_default: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Set as default for this type
                  </span>
                </label>
              </div>
            </div>

            {/* Steps builder */}
            <div className="border-t border-border pt-4">
              <StepBuilder
                steps={form.steps}
                onChange={(steps) =>
                  setForm((prev) => ({ ...prev, steps }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.name.trim() || form.steps.length === 0 || isSaving}
            >
              {isSaving
                ? 'Saving...'
                : editingId
                  ? 'Update Chain'
                  : 'Create Chain'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================= */}
      {/* Delete Confirmation Dialog                                        */}
      {/* ================================================================= */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Approval Chain</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this approval chain template? This
              action cannot be undone. Existing invoices using this chain will not
              be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inline Mutation Buttons (hooks must be called at component top level)
// ---------------------------------------------------------------------------

function SetDefaultButton({ chainId }: { chainId: string }) {
  const mutation = useUpdateApprovalChain(chainId)

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      title="Set as Default"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate({ is_default: true })}
    >
      <Star className="h-3.5 w-3.5" />
    </Button>
  )
}

function ToggleActiveButton({
  chainId,
  isActive,
}: {
  chainId: string
  isActive: boolean
}) {
  const mutation = useUpdateApprovalChain(chainId)

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      title={isActive ? 'Deactivate' : 'Activate'}
      disabled={mutation.isPending}
      onClick={() => mutation.mutate({ is_active: !isActive })}
    >
      {isActive ? (
        <PowerOff className="h-3.5 w-3.5" />
      ) : (
        <Power className="h-3.5 w-3.5" />
      )}
    </Button>
  )
}
