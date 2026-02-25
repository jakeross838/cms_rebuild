'use client'

import { useEffect, useState } from 'react'

import {
  Layers,
  Plus,
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Lock,
  X,
  Save,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Phase {
  id: string
  name: string
  description: string | null
  color: string
  defaultDurationDays: number | null
  sortOrder: number
  isActive: boolean
  isSystem: boolean
  milestoneType: string | null
  createdAt: string
  updatedAt: string
}

interface PhaseFormData {
  name: string
  description: string
  color: string
  defaultDurationDays: string
  milestoneType: string
}

const EMPTY_FORM: PhaseFormData = {
  name: '',
  description: '',
  color: '#6366f1',
  defaultDurationDays: '',
  milestoneType: '',
}

export default function PhasesPage() {
  const [phases, setPhases] = useState<Phase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null)
  const [formData, setFormData] = useState<PhaseFormData>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const fetchPhases = async () => {
    try {
      const res = await fetch('/api/v1/settings/phases')
      if (!res.ok) throw new Error('Failed to load phases')
      const data = await res.json()
      setPhases(data.phases)
    } catch (err) {
      setError((err as Error)?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhases()
  }, [])

  const openCreate = () => {
    setEditingPhase(null)
    setFormData(EMPTY_FORM)
    setFormError(null)
    setShowModal(true)
  }

  const openEdit = (phase: Phase) => {
    setEditingPhase(phase)
    setFormData({
      name: phase.name,
      description: phase.description || '',
      color: phase.color,
      defaultDurationDays: phase.defaultDurationDays?.toString() || '',
      milestoneType: phase.milestoneType || '',
    })
    setFormError(null)
    setShowModal(true)
    setOpenDropdown(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)

    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color,
        defaultDurationDays: formData.defaultDurationDays ? Number(formData.defaultDurationDays) : undefined,
        milestoneType: formData.milestoneType || null,
      }

      const url = editingPhase
        ? `/api/v1/settings/phases/${editingPhase.id}`
        : '/api/v1/settings/phases'
      const method = editingPhase ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to save phase')
      }

      setShowModal(false)
      fetchPhases()
    } catch (err) {
      setFormError((err as Error)?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (phaseId: string) => {
    if (!confirm('Are you sure you want to delete this phase?')) return
    setDeletingId(phaseId)
    setOpenDropdown(null)

    try {
      const res = await fetch(`/api/v1/settings/phases/${phaseId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to delete')
      }
      fetchPhases()
    } catch (err) {
      alert((err as Error)?.message || 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const handleMove = async (phase: Phase, direction: 'up' | 'down') => {
    const idx = phases.findIndex((p) => p.id === phase.id)
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= phases.length) return

    const targetPhase = phases[targetIdx]
    setOpenDropdown(null)

    // Swap sort orders
    await Promise.all([
      fetch(`/api/v1/settings/phases/${phase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: targetPhase.sortOrder }),
      }),
      fetch(`/api/v1/settings/phases/${targetPhase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: phase.sortOrder }),
      }),
    ])

    fetchPhases()
  }

  const handleToggleActive = async (phase: Phase) => {
    setOpenDropdown(null)
    await fetch(`/api/v1/settings/phases/${phase.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !phase.isActive }),
    })
    fetchPhases()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Layers className="h-6 w-6" />
            Project Phases
          </h1>
          <p className="text-muted-foreground mt-1">
            Define the phases that projects go through
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Phase
        </Button>
      </div>

      {error ? (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      <div className="bg-card rounded-lg border divide-y">
        {phases.length === 0 ? (
          <div className="p-8 text-center">
            <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No phases defined yet</p>
            <Button onClick={openCreate} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Phase
            </Button>
          </div>
        ) : (
          phases.map((phase, idx) => (
            <div
              key={phase.id}
              className={cn(
                'flex items-center gap-4 p-4',
                !phase.isActive && 'opacity-60'
              )}
            >
              {/* Color swatch */}
              <div
                className="h-8 w-8 rounded shrink-0 border"
                style={{ backgroundColor: phase.color }}
              />

              {/* Phase info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{phase.name}</span>
                  {phase.isSystem ? (
                    <span title="System phase"><Lock className="h-3.5 w-3.5 text-muted-foreground" /></span>
                  ) : null}
                  {!phase.isActive ? (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">Inactive</span>
                  ) : null}
                  {phase.milestoneType ? (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 capitalize">{phase.milestoneType}</span>
                  ) : null}
                </div>
                {phase.description ? (
                  <p className="text-xs text-muted-foreground mt-0.5">{phase.description}</p>
                ) : null}
                {phase.defaultDurationDays ? (
                  <p className="text-xs text-muted-foreground">{phase.defaultDurationDays} days</p>
                ) : null}
              </div>

              {/* Actions dropdown */}
              <div className="relative">
                {deletingId === phase.id ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenDropdown(openDropdown === phase.id ? null : phase.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>

                    {openDropdown === phase.id ? (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenDropdown(null)}
                          onKeyDown={(e) => e.key === 'Escape' && setOpenDropdown(null)}
                          role="button"
                          tabIndex={-1}
                          aria-label="Close menu"
                        />
                        <div className="absolute right-0 mt-1 w-40 bg-background rounded-md shadow-lg border z-20">
                          <div className="py-1">
                            <button
                              onClick={() => openEdit(phase)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            {idx > 0 ? (
                              <button
                                onClick={() => handleMove(phase, 'up')}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent"
                              >
                                <ArrowUp className="h-4 w-4" />
                                Move Up
                              </button>
                            ) : null}
                            {idx < phases.length - 1 ? (
                              <button
                                onClick={() => handleMove(phase, 'down')}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent"
                              >
                                <ArrowDown className="h-4 w-4" />
                                Move Down
                              </button>
                            ) : null}
                            <button
                              onClick={() => handleToggleActive(phase)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent"
                            >
                              {phase.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            {!phase.isSystem ? (
                              <button
                                onClick={() => handleDelete(phase.id)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Phase Modal */}
      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
            onKeyDown={(e) => e.key === 'Escape' && setShowModal(false)}
            role="button"
            tabIndex={-1}
            aria-label="Close modal"
          />

          <div className="relative bg-background rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5" />
                {editingPhase ? 'Edit Phase' : 'Add Phase'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {formError ? (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{formError}</p>
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Foundation"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="h-10 w-10 rounded border cursor-pointer"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Duration (days)</label>
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      value={formData.defaultDurationDays}
                      onChange={(e) => setFormData({ ...formData, defaultDurationDays: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Milestone Type</label>
                  <select
                    value={formData.milestoneType}
                    onChange={(e) => setFormData({ ...formData, milestoneType: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">None</option>
                    <option value="start">Start</option>
                    <option value="completion">Completion</option>
                    <option value="payment">Payment</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingPhase ? 'Saving...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingPhase ? 'Save Changes' : 'Add Phase'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
