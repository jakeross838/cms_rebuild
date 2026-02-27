'use client'

import { useEffect, useState, useMemo } from 'react'

import { Languages, Loader2, Save, Search, RotateCcw, CheckCircle } from 'lucide-react'

import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terminology' }


interface Term {
  key: string
  defaultSingular: string
  defaultPlural: string
  description: string
  overrideSingular?: string
  overridePlural?: string
}

export default function TerminologyPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [terms, setTerms] = useState<Term[]>([])
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)

  // Track edits as a map of key -> { singular, plural }
  const [edits, setEdits] = useState<Map<string, { singular: string; plural: string }>>(new Map())

  const fetchTerms = async () => {
    try {
      const res = await fetch('/api/v1/settings/terminology')
      if (!res.ok) throw new Error('Failed to load terminology')
      const data = await res.json()
      setTerms(data.terms)
      setEdits(new Map())
    } catch (err) {
      setError((err as Error)?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTerms()
  }, [])

  const filteredTerms = useMemo(() => {
    if (!search) return terms
    const q = search.toLowerCase()
    return terms.filter(
      (t) =>
        t.key.toLowerCase().includes(q) ||
        t.defaultSingular.toLowerCase().includes(q) ||
        t.defaultPlural.toLowerCase().includes(q) ||
        (t.overrideSingular && t.overrideSingular.toLowerCase().includes(q))
    )
  }, [terms, search])

  const overrideCount = terms.filter((t) => t.overrideSingular || t.overridePlural).length

  const handleEdit = (key: string, field: 'singular' | 'plural', value: string) => {
    setEdits((prev) => {
      const next = new Map(prev)
      const term = terms.find((t) => t.key === key)
      if (!term) return next

      const existing = next.get(key) || {
        singular: term.overrideSingular || term.defaultSingular,
        plural: term.overridePlural || term.defaultPlural,
      }
      next.set(key, { ...existing, [field]: value })
      return next
    })
  }

  const getDisplayValue = (term: Term, field: 'singular' | 'plural'): string => {
    const edit = edits.get(term.key)
    if (edit) return edit[field]
    if (field === 'singular') return term.overrideSingular || ''
    return term.overridePlural || ''
  }

  const isDirty = edits.size > 0

  const handleSave = async () => {
    if (!isDirty) return
    setSaving(true)
    setError(null)
    try {
      const changedTerms = Array.from(edits.entries()).map(([key, val]) => ({
        termKey: key,
        singular: val.singular,
        plural: val.plural,
      }))
      const res = await fetch('/api/v1/settings/terminology', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ terms: changedTerms }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to save')
      }
      const data = await res.json()
      setTerms(data.terms)
      setEdits(new Map())
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      toast.success('Terminology saved')
    } catch (err) {
      const msg = (err as Error)?.message || 'Failed to save'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleResetTerm = async (termKey: string) => {
    try {
      const res = await fetch('/api/v1/settings/terminology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termKey }),
      })
      if (!res.ok) throw new Error('Failed to reset')
      const data = await res.json()
      setTerms(data.terms)
      setEdits((prev) => {
        const next = new Map(prev)
        next.delete(termKey)
        return next
      })
      toast.success('Term reset to default')
    } catch (err) {
      const msg = (err as Error)?.message || 'Failed to reset term'
      setError(msg)
      toast.error(msg)
    }
  }

  const handleResetAll = async () => {
    try {
      const res = await fetch('/api/v1/settings/terminology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error('Failed to reset')
      const data = await res.json()
      setTerms(data.terms)
      setEdits(new Map())
      toast.success('All terminology reset to defaults')
    } catch (err) {
      const msg = (err as Error)?.message || 'Failed to reset'
      setError(msg)
      toast.error(msg)
    }
  }

  const formatKey = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

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
            <Languages className="h-6 w-6" />
            Terminology
          </h1>
          <p className="text-muted-foreground mt-1">
            Customize the terms used throughout RossOS to match your business language
          </p>
        </div>
        <div className="flex items-center gap-2">
          {success ? <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Saved</span> : null}
          {overrideCount > 0 ? (
            <Button variant="outline" size="sm" onClick={() => setShowResetDialog(true)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All
            </Button>
          ) : null}
          {isDirty ? (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search terms..."
            aria-label="Search terms"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {overrideCount} of {terms.length} terms customized
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Term Overrides</CardTitle>
          <CardDescription>
            Leave fields empty to use the default term. Enter a custom value to override.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th scope="col" className="pb-2 pr-4 text-xs font-medium text-muted-foreground">Term</th>
                  <th scope="col" className="pb-2 pr-4 text-xs font-medium text-muted-foreground">Default Singular</th>
                  <th scope="col" className="pb-2 pr-4 text-xs font-medium text-muted-foreground">Default Plural</th>
                  <th scope="col" className="pb-2 pr-4 text-xs font-medium text-muted-foreground">Override Singular</th>
                  <th scope="col" className="pb-2 pr-4 text-xs font-medium text-muted-foreground">Override Plural</th>
                  <th scope="col" className="pb-2 text-xs font-medium text-muted-foreground w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTerms.map((term) => (
                  <tr key={term.key}>
                    <td className="py-2 pr-4 text-sm font-medium text-foreground whitespace-nowrap">
                      {formatKey(term.key)}
                    </td>
                    <td className="py-2 pr-4 text-sm text-muted-foreground">{term.defaultSingular}</td>
                    <td className="py-2 pr-4 text-sm text-muted-foreground">{term.defaultPlural}</td>
                    <td className="py-2 pr-4">
                      <Input
                        className="h-8 text-sm"
                        placeholder={term.defaultSingular}
                        value={getDisplayValue(term, 'singular')}
                        onChange={(e) => handleEdit(term.key, 'singular', e.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <Input
                        className="h-8 text-sm"
                        placeholder={term.defaultPlural}
                        value={getDisplayValue(term, 'plural')}
                        onChange={(e) => handleEdit(term.key, 'plural', e.target.value)}
                      />
                    </td>
                    <td className="py-2">
                      {(term.overrideSingular || term.overridePlural) ? (
                        <Button variant="ghost" size="sm" onClick={() => handleResetTerm(term.key)} aria-label="Reset to default">
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        title="Reset terminology?"
        description="All terminology will be reset to defaults. This cannot be undone."
        confirmLabel="Reset"
        onConfirm={handleResetAll}
      />
    </div>
  )
}
