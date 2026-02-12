'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, FileText, BookOpen, ChevronRight, Layers } from 'lucide-react'

interface DocFile {
  slug: string
  title: string
  category: string
  phase?: string
  status?: string
  path: string
}

const phaseColors: Record<string, string> = {
  '1': 'bg-blue-100 text-blue-800',
  '2': 'bg-green-100 text-green-800',
  '3': 'bg-yellow-100 text-yellow-800',
  '4': 'bg-purple-100 text-purple-800',
  '5': 'bg-orange-100 text-orange-800',
  '6': 'bg-red-100 text-red-800',
}

function getPhaseBadge(phase?: string) {
  if (!phase) return null
  const num = phase.match(/(\d)/)?.[1]
  const color = num ? phaseColors[num] ?? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{phase}</span>
}

export default function DocsIndex() {
  const [docs, setDocs] = useState<DocFile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<'all' | 'modules' | 'architecture'>('all')

  useEffect(() => {
    fetch('/api/docs')
      .then(r => r.json())
      .then(data => {
        setDocs(data.docs)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = docs.filter(d => {
    const matchesSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.slug.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'all' || d.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const modules = filtered.filter(d => d.category === 'modules')
  const architecture = filtered.filter(d => d.category === 'architecture')

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
            {docs.length} spec files — all gap analysis items integrated
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
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search docs by name or keyword..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex border rounded-md overflow-hidden">
          {(['all', 'modules', 'architecture'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2 text-sm capitalize ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

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

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No docs matching &quot;{search}&quot;
        </div>
      )}
    </div>
  )
}
