'use client'

import { useEffect, useState } from 'react'

import { Hash, Loader2, Save, ChevronDown, ChevronUp, Eye, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface NumberingPatternData {
  entityType: string
  pattern: string
  scope: string
  padding: number
  currentSequence: number
  sampleOutput: string
  resetYearly: boolean
  isCustom: boolean
}

interface PatternToken {
  token: string
  description: string
}

const ENTITY_LABELS: Record<string, string> = {
  job: 'Jobs',
  invoice: 'Invoices',
  purchase_order: 'Purchase Orders',
  change_order: 'Change Orders',
  draw: 'Draw Requests',
  estimate: 'Estimates',
  contract: 'Contracts',
  rfi: 'RFIs',
}

export default function NumberingPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patterns, setPatterns] = useState<NumberingPatternData[]>([])
  const [tokens, setTokens] = useState<PatternToken[]>([])
  const [editingEntity, setEditingEntity] = useState<string | null>(null)
  const [editPattern, setEditPattern] = useState('')
  const [editScope, setEditScope] = useState('global')
  const [editPadding, setEditPadding] = useState(3)
  const [editResetYearly, setEditResetYearly] = useState(false)
  const [previewText, setPreviewText] = useState('')
  const [saving, setSaving] = useState(false)
  const [showTokens, setShowTokens] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/v1/settings/numbering')
        if (!res.ok) throw new Error('Failed to load numbering patterns')
        const data = await res.json()
        setPatterns(data.patterns)
        setTokens(data.patternTokens || [])
      } catch (err) {
        setError((err as Error)?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const startEdit = (p: NumberingPatternData) => {
    setEditingEntity(p.entityType)
    setEditPattern(p.pattern)
    setEditScope(p.scope)
    setEditPadding(p.padding)
    setEditResetYearly(p.resetYearly)
    setPreviewText(p.sampleOutput)
  }

  const cancelEdit = () => {
    setEditingEntity(null)
    setPreviewText('')
  }

  const handlePreview = async () => {
    if (!editingEntity) return
    try {
      const res = await fetch('/api/v1/settings/numbering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: editingEntity }),
      })
      if (res.ok) {
        const data = await res.json()
        setPreviewText(data.preview)
      }
    } catch {
      // Preview is non-critical, ignore errors
    }
  }

  const handleSave = async () => {
    if (!editingEntity) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/settings/numbering', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: editingEntity,
          pattern: editPattern,
          scope: editScope,
          padding: editPadding,
          resetYearly: editResetYearly,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to save')
      }
      const data = await res.json()
      setPatterns(data.patterns)
      setSuccess(editingEntity)
      setTimeout(() => setSuccess(null), 3000)
      setEditingEntity(null)
    } catch (err) {
      setError((err as Error)?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
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
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Hash className="h-6 w-6" />
          Numbering Patterns
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure how sequential numbers are generated for each entity type
        </p>
      </div>

      {error ? (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {/* Token Reference */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setShowTokens(!showTokens)}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Pattern Tokens Reference</CardTitle>
              <CardDescription>Available tokens you can use in numbering patterns</CardDescription>
            </div>
            {showTokens ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {showTokens ? (
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tokens.map((t) => (
                <div key={t.token} className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{t.token}</code>
                  <span className="text-xs text-muted-foreground">{t.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        ) : null}
      </Card>

      {/* Pattern Cards */}
      {patterns.map((p) => {
        const isEditing = editingEntity === p.entityType
        return (
          <Card key={p.entityType}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{ENTITY_LABELS[p.entityType] || p.entityType}</CardTitle>
                  <CardDescription>
                    Pattern: <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{p.pattern}</code>
                    {' '}&middot; Preview: <span className="font-medium">{p.sampleOutput}</span>
                    {success === p.entityType ? <span className="ml-2 text-green-600 inline-flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Saved</span> : null}
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => startEdit(p)}>
                    Edit
                  </Button>
                ) : null}
              </div>
            </CardHeader>

            {isEditing ? (
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Pattern</label>
                      <Input
                        value={editPattern}
                        onChange={(e) => setEditPattern(e.target.value)}
                        placeholder="e.g., JOB-{YYYY}-{###}"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Scope</label>
                      <select
                        value={editScope}
                        onChange={(e) => setEditScope(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="global">Global</option>
                        <option value="per_job">Per Job</option>
                        <option value="per_year">Per Year</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Padding</label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={editPadding}
                        onChange={(e) => setEditPadding(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Reset Yearly</label>
                      <label className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          checked={editResetYearly}
                          onChange={(e) => setEditResetYearly(e.target.checked)}
                          className="h-4 w-4 rounded border-input"
                        />
                        <span className="text-sm text-muted-foreground">Reset sequence to 1 each year</span>
                      </label>
                    </div>
                  </div>

                  {previewText ? (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-xs text-muted-foreground">Preview</p>
                      <p className="text-sm font-mono font-medium">{previewText}</p>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePreview}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <div className="flex-1" />
                    <Button variant="outline" size="sm" onClick={cancelEdit}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}
