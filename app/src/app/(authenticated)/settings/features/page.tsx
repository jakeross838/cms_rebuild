'use client'

import { useEffect, useState } from 'react'

import { ToggleLeft, Loader2, Save, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { FeatureFlagKey, SubscriptionPlan } from '@/lib/config/types'

interface FlagData {
  key: FeatureFlagKey
  name: string
  description: string
  category: string
  enabled: boolean
  requiredPlan?: SubscriptionPlan
  available: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  ai: 'AI Features',
  integrations: 'Integrations',
  portals: 'Portals',
  features: 'Features',
  advanced: 'Advanced',
}

const PLAN_BADGE_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  starter: 'bg-blue-100 text-blue-700',
  pro: 'bg-purple-100 text-purple-700',
  enterprise: 'bg-amber-100 text-amber-700',
}

export default function FeaturesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [flags, setFlags] = useState<FlagData[]>([])
  const [companyPlan, setCompanyPlan] = useState<SubscriptionPlan>('free')
  const [originalFlags, setOriginalFlags] = useState<Map<string, boolean>>(new Map())
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/v1/settings/feature-flags')
        if (!res.ok) throw new Error('Failed to load feature flags')
        const data = await res.json()
        setFlags(data.flags)
        setCompanyPlan(data.companyPlan)
        const orig = new Map<string, boolean>()
        for (const f of data.flags) {
          orig.set(f.key, f.enabled)
        }
        setOriginalFlags(orig)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const isDirty = flags.some((f) => f.enabled !== originalFlags.get(f.key))

  const toggleFlag = (key: string) => {
    setFlags((prev) =>
      prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f))
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const changed = flags.filter((f) => f.enabled !== originalFlags.get(f.key))
      const res = await fetch('/api/v1/settings/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flags: changed.map((f) => ({ key: f.key, enabled: f.enabled })),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to save')
      }
      const data = await res.json()
      setFlags(data.flags)
      const orig = new Map<string, boolean>()
      for (const f of data.flags) {
        orig.set(f.key, f.enabled)
      }
      setOriginalFlags(orig)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // Group flags by category
  const grouped = new Map<string, FlagData[]>()
  for (const flag of flags) {
    const existing = grouped.get(flag.category) || []
    existing.push(flag)
    grouped.set(flag.category, existing)
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
            <ToggleLeft className="h-6 w-6" />
            Feature Flags
          </h1>
          <p className="text-muted-foreground mt-1">
            Enable or disable features for your company. Some features require a higher plan.
          </p>
        </div>
        {isDirty ? (
          <div className="flex items-center gap-2">
            {success ? <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Saved</span> : null}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {Array.from(grouped.entries()).map(([category, categoryFlags]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{CATEGORY_LABELS[category] || category}</CardTitle>
            <CardDescription>
              {categoryFlags.filter((f) => f.enabled).length} of {categoryFlags.length} enabled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {categoryFlags.map((flag) => (
                <div key={flag.key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{flag.name}</span>
                      {flag.requiredPlan ? (
                        <span className={cn('text-xs px-1.5 py-0.5 rounded', PLAN_BADGE_COLORS[flag.requiredPlan])}>
                          {flag.requiredPlan}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">{flag.description}</p>
                    {!flag.available ? (
                      <p className="text-xs text-amber-600">Requires {flag.requiredPlan} plan</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={flag.enabled}
                    disabled={!flag.available}
                    onClick={() => toggleFlag(flag.key)}
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors',
                      flag.enabled ? 'bg-primary' : 'bg-muted-foreground/25',
                      !flag.available && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span className={cn(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                      flag.enabled ? 'translate-x-5' : 'translate-x-0'
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
