'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { FileText, BookOpen, ChevronRight, Layers, CheckCircle2, Circle, Paintbrush, ChevronDown, ChevronUp } from 'lucide-react'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { cn } from '@/lib/utils'

interface DocFile {
  slug: string
  title: string
  category: string
  phase?: string
  status?: string
  path: string
}

interface GapItem {
  id: string
  category: string
  description: string
  status: string
  priority: string
  module: string
  phase: number
}

interface GapSummary {
  total: number
  specified: number
  prototyped: number
  planned: number
}

const phaseColors: Record<string, string> = {
  '1': 'bg-stone-100 text-stone-800',
  '2': 'bg-green-100 text-green-800',
  '3': 'bg-amber-100 text-amber-800',
  '4': 'bg-purple-100 text-purple-800',
  '5': 'bg-orange-100 text-orange-800',
  '6': 'bg-red-100 text-red-800',
}

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  specified: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  prototyped: { icon: Paintbrush, color: 'text-stone-600', bg: 'bg-stone-50' },
  planned: { icon: Circle, color: 'text-warm-400', bg: 'bg-warm-50' },
}

const priorityColors: Record<string, string> = {
  P0: 'text-red-700 bg-red-100',
  P1: 'text-orange-700 bg-orange-100',
  P2: 'text-amber-700 bg-amber-100',
  P3: 'text-warm-600 bg-warm-100',
}

function getPhaseBadge(phase?: string) {
  if (!phase) return null
  const num = phase.match(/(\d)/)?.[1]
  const color = num ? phaseColors[num] ?? 'bg-warm-100 text-warm-800' : 'bg-warm-100 text-warm-800'
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{phase}</span>
}

type MainTab = 'all' | 'modules' | 'architecture' | 'gaps'
type GapFilter = 'all' | 'specified' | 'prototyped' | 'planned'

export default function DocsIndex() {
  const [docs, setDocs] = useState<DocFile[]>([])
  const [gaps, setGaps] = useState<GapItem[]>([])
  const [gapSummary, setGapSummary] = useState<GapSummary | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<MainTab>('all')
  const [gapFilter, setGapFilter] = useState<GapFilter>('all')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    Promise.all([
      fetch('/api/docs').then(r => r.json()),
      fetch('/api/docs/gaps').then(r => r.json()),
    ])
      .then(([docsData, gapsData]) => {
        setDocs(docsData.docs ?? [])
        setGaps(gapsData.gaps ?? [])
        setGapSummary(gapsData.summary ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredDocs = docs.filter(d => {
    const matchesSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.slug.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'all' || activeCategory === 'gaps' || d.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const filteredGaps = useMemo(() => {
    return gaps.filter(g => {
      const matchesSearch = !search || g.description.toLowerCase().includes(search.toLowerCase()) || g.id.toLowerCase().includes(search.toLowerCase()) || g.category.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = gapFilter === 'all' || g.status === gapFilter
      return matchesSearch && matchesFilter
    })
  }, [gaps, search, gapFilter])

  const gapsByCategory = useMemo(() => {
    const groups: Record<string, GapItem[]> = {}
    for (const g of filteredGaps) {
      if (!groups[g.category]) groups[g.category] = []
      groups[g.category].push(g)
    }
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filteredGaps])

  const modules = filteredDocs.filter(d => d.category === 'modules')
  const architecture = filteredDocs.filter(d => d.category === 'architecture')

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const showDocs = activeCategory !== 'gaps'
  const showGaps = activeCategory === 'gaps'

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse w-48" />
        <div className="h-10 bg-muted rounded animate-pulse" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Planning Docs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {docs.length} spec files{gapSummary ? ` — ${gapSummary.total} gap items tracked` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Modules:</span>
          <span className="font-mono font-bold">{docs.filter(d => d.category === 'modules').length}</span>
          <span className="text-muted-foreground ml-2">Architecture:</span>
          <span className="font-mono font-bold">{docs.filter(d => d.category === 'architecture').length}</span>
        </div>
      </div>

      {/* Search + Filter */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={showGaps ? 'Search gaps by ID, description, or category...' : 'Search docs by name or keyword...'}
        tabs={[
          { key: 'all', label: 'All Docs', count: docs.length },
          { key: 'modules', label: 'Modules', count: docs.filter(d => d.category === 'modules').length },
          { key: 'architecture', label: 'Architecture', count: docs.filter(d => d.category === 'architecture').length },
          { key: 'gaps', label: 'Gap Tracker', count: gapSummary?.total ?? 0 },
        ]}
        activeTab={activeCategory}
        onTabChange={(tab) => { setActiveCategory(tab as MainTab); setSearch('') }}
        resultCount={showGaps ? filteredGaps.length : filteredDocs.length}
        totalCount={showGaps ? gaps.length : docs.length}
      />

      {/* Gap Tracker View */}
      {showGaps && (
        <>
          {/* Summary stats */}
          {gapSummary && (
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => setGapFilter('all')}
                className={cn(
                  'p-3 rounded-lg border text-left transition-colors',
                  gapFilter === 'all' ? 'border-stone-300 bg-stone-50' : 'hover:bg-accent'
                )}
              >
                <div className="text-2xl font-bold">{gapSummary.total}</div>
                <div className="text-xs text-muted-foreground">Total Items</div>
              </button>
              <button
                onClick={() => setGapFilter('specified')}
                className={cn(
                  'p-3 rounded-lg border text-left transition-colors',
                  gapFilter === 'specified' ? 'border-green-300 bg-green-50' : 'hover:bg-accent'
                )}
              >
                <div className="text-2xl font-bold text-green-600">{gapSummary.specified}</div>
                <div className="text-xs text-muted-foreground">Specified</div>
                <div className="text-xs text-green-600 font-medium">{((gapSummary.specified / gapSummary.total) * 100).toFixed(0)}%</div>
              </button>
              <button
                onClick={() => setGapFilter('prototyped')}
                className={cn(
                  'p-3 rounded-lg border text-left transition-colors',
                  gapFilter === 'prototyped' ? 'border-stone-300 bg-stone-50' : 'hover:bg-accent'
                )}
              >
                <div className="text-2xl font-bold text-stone-600">{gapSummary.prototyped}</div>
                <div className="text-xs text-muted-foreground">Prototyped</div>
                <div className="text-xs text-stone-600 font-medium">{((gapSummary.prototyped / gapSummary.total) * 100).toFixed(0)}%</div>
              </button>
              <button
                onClick={() => setGapFilter('planned')}
                className={cn(
                  'p-3 rounded-lg border text-left transition-colors',
                  gapFilter === 'planned' ? 'border-warm-300 bg-warm-50' : 'hover:bg-accent'
                )}
              >
                <div className="text-2xl font-bold text-warm-500">{gapSummary.planned}</div>
                <div className="text-xs text-muted-foreground">Planned</div>
                <div className="text-xs text-warm-500 font-medium">{((gapSummary.planned / gapSummary.total) * 100).toFixed(0)}%</div>
              </button>
            </div>
          )}

          {/* Progress bar */}
          {gapSummary && (
            <div className="space-y-1">
              <div className="h-2 rounded-full bg-warm-200 overflow-hidden flex">
                <div
                  className="bg-green-500 transition-all"
                  style={{ width: `${(gapSummary.specified / gapSummary.total) * 100}%` }}
                />
                <div
                  className="bg-stone-500 transition-all"
                  style={{ width: `${(gapSummary.prototyped / gapSummary.total) * 100}%` }}
                />
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Specified</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-stone-500" /> Prototyped</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warm-300" /> Planned</span>
              </div>
            </div>
          )}

          {/* Grouped gap items */}
          <div className="space-y-2">
            {gapsByCategory.map(([category, items]) => {
              const isExpanded = expandedCategories.has(category)
              const specCount = items.filter(i => i.status === 'specified').length
              const protoCount = items.filter(i => i.status === 'prototyped').length
              const planCount = items.filter(i => i.status === 'planned').length
              return (
                <div key={category} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                    <span className="font-medium text-sm flex-1">{category}</span>
                    <div className="flex items-center gap-2 text-xs">
                      {specCount > 0 && <span className="text-green-600">{specCount} specified</span>}
                      {protoCount > 0 && <span className="text-stone-600">{protoCount} prototyped</span>}
                      {planCount > 0 && <span className="text-warm-500">{planCount} planned</span>}
                      <span className="text-muted-foreground font-mono">({items.length})</span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t divide-y">
                      {items.map(gap => {
                        const cfg = statusConfig[gap.status] ?? statusConfig.planned
                        const Icon = cfg.icon
                        return (
                          <div key={gap.id} className={cn('flex items-start gap-3 px-3 py-2 text-sm', cfg.bg)}>
                            <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', cfg.color)} />
                            <div className="flex-1 min-w-0">
                              <span className="text-muted-foreground font-mono text-xs mr-2">{gap.id}</span>
                              <span>{gap.description}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', priorityColors[gap.priority] ?? 'bg-warm-100 text-warm-600')}>
                                {gap.priority}
                              </span>
                              {gap.phase && (
                                <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', phaseColors[String(gap.phase)] ?? 'bg-warm-100 text-warm-800')}>
                                  P{gap.phase}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {filteredGaps.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No gap items matching your filters
            </div>
          )}
        </>
      )}

      {/* Docs Views */}
      {showDocs && (
        <>
          {/* Architecture Docs */}
          {architecture.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Architecture ({architecture.length})
              </h2>
              <div className="grid gap-2">
                {architecture.map(doc => (
                  <Link
                    key={doc.slug}
                    href={`/skeleton/docs/${doc.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors group"
                  >
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{doc.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">{doc.slug}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Module Docs */}
          {modules.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Modules ({modules.length})
              </h2>
              <div className="grid gap-2">
                {modules.map(doc => (
                  <Link
                    key={doc.slug}
                    href={`/skeleton/docs/${doc.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors group"
                  >
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      {doc.slug.match(/(\d+)/)?.[1]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{doc.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {getPhaseBadge(doc.phase)}
                        {doc.status && (
                          <span className="text-xs text-muted-foreground">{doc.status}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {filteredDocs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No docs matching &quot;{search}&quot;
            </div>
          )}
        </>
      )}
    </div>
  )
}
