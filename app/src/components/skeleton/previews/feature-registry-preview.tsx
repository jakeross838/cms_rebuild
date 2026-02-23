'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  ChevronDown,
  ChevronRight,
  Brain,
  Sparkles,
  ToggleRight,
  Zap,
  Shield,
  Camera,
  BarChart3,
  Wrench,
  DollarSign,
  Users,
  Smartphone,
  FileText,
  Link,
  Lock,
  Rocket,
  FileCheck,
  Mail,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import {
  FEATURES,
  CATEGORIES,
  ONBOARDING_STEPS,
  statusConfig,
  effortConfig,
  type Feature,
} from '@/config/features'

// ── Category icon map ──────────────────────────────
const categoryIcons: Record<string, React.ElementType> = {
  'Onboarding & Setup': Rocket,
  'Photo & Media': Camera,
  'Activity & Analytics': BarChart3,
  'Self-Learning AI': Brain,
  'Self-Debugging': Shield,
  'Daily Operations': Wrench,
  'Financial': DollarSign,
  'Client Experience': Users,
  'Mobile & Field': Smartphone,
  'Reports & Docs': FileText,
  'Integrations': Link,
  'Security & Admin': Lock,
}

// ── Component ──────────────────────────────────────
export function FeatureRegistryPreview(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selfLearnOnly, setSelfLearnOnly] = useState(false)
  const [enabledFeatures, setEnabledFeatures] = useState<Set<number>>(
    () => new Set(FEATURES.filter(f => f.status === 'ready').map(f => f.id))
  )
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [showOnboarding, setShowOnboarding] = useState(true)

  // ── Derived data ──────────────────────────────────
  const filtered = useMemo(() => {
    return FEATURES.filter(f => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!f.name.toLowerCase().includes(q) && !f.desc.toLowerCase().includes(q) && !f.cat.toLowerCase().includes(q)) {
          return false
        }
      }
      if (statusFilter !== 'all' && f.status !== statusFilter) return false
      if (selfLearnOnly && !f.selfLearn) return false
      return true
    })
  }, [searchQuery, statusFilter, selfLearnOnly])

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, Feature[]> = {}
    for (const cat of CATEGORIES) {
      const items = filtered.filter(f => f.cat === cat)
      if (items.length > 0) groups[cat] = items
    }
    return groups
  }, [filtered])

  const stats = useMemo(() => ({
    total: FEATURES.length,
    enabled: enabledFeatures.size,
    selfLearning: FEATURES.filter(f => f.selfLearn).length,
    ready: FEATURES.filter(f => f.status === 'ready').length,
    planned: FEATURES.filter(f => f.status === 'planned').length,
    future: FEATURES.filter(f => f.status === 'future').length,
  }), [enabledFeatures])

  // ── Handlers ──────────────────────────────────────
  const toggleFeature = (id: number): void => {
    setEnabledFeatures(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleCategory = (cat: string): void => {
    setCollapsedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) {
        next.delete(cat)
      } else {
        next.add(cat)
      }
      return next
    })
  }

  const enableAllInCategory = (cat: string): void => {
    const ids = FEATURES.filter(f => f.cat === cat).map(f => f.id)
    setEnabledFeatures(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.add(id))
      return next
    })
  }

  const disableAllInCategory = (cat: string): void => {
    const ids = FEATURES.filter(f => f.cat === cat).map(f => f.id)
    setEnabledFeatures(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.delete(id))
      return next
    })
  }

  return (
    <div className="space-y-4">
      {/* ── Header ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <ToggleRight className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Feature Registry</h1>
              <p className="text-sm text-slate-400">
                {stats.total} capabilities across {CATEGORIES.length} categories
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-400">{stats.enabled}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Enabled</div>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">{stats.ready}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────── */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: 'Total Features', value: stats.total, icon: Zap, color: 'bg-stone-100 text-stone-600' },
          { label: 'Enabled', value: stats.enabled, icon: ToggleRight, color: 'bg-amber-100 text-amber-600' },
          { label: 'Self-Learning', value: stats.selfLearning, icon: Brain, color: 'bg-purple-100 text-purple-600' },
          { label: 'Ready to Build', value: stats.ready, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
          { label: 'Planned', value: stats.planned, icon: Clock, color: 'bg-amber-100 text-amber-600' },
          { label: 'Future', value: stats.future, icon: Star, color: 'bg-indigo-100 text-indigo-600' },
        ].map(stat => (
          <div key={stat.label} className="flex items-center gap-2 bg-white rounded-lg border border-warm-200 p-3">
            <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', stat.color)}>
              <stat.icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-warm-900">{stat.value}</div>
              <div className="text-[10px] text-warm-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Smart Onboarding Section ───────────── */}
      <div className="bg-white rounded-xl border border-warm-200 overflow-hidden">
        <button
          onClick={() => setShowOnboarding(!showOnboarding)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-warm-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Rocket className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-warm-900">Smart Onboarding Walkthrough</div>
              <div className="text-xs text-warm-500">
                AI-powered setup — get running in under 5 minutes
              </div>
            </div>
          </div>
          {showOnboarding ? (
            <ChevronDown className="h-4 w-4 text-warm-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-warm-400" />
          )}
        </button>

        {showOnboarding && (
          <div className="border-t border-warm-100 px-4 py-4">
            <div className="grid grid-cols-3 gap-3">
              {ONBOARDING_STEPS.map(step => {
                const iconMap: Record<string, React.ElementType> = {
                  FileText: FileText,
                  Link: Link,
                  Mail: Mail,
                  FileCheck: FileCheck,
                  Users: Users,
                  Rocket: Rocket,
                }
                const StepIcon = iconMap[step.icon] ?? FileText
                return (
                  <div
                    key={step.step}
                    className="bg-warm-50 rounded-lg p-3 border border-warm-100"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-700">
                        {step.step}
                      </div>
                      <StepIcon className="h-4 w-4 text-warm-500" />
                      {step.time && (
                        <span className="text-[10px] text-warm-400 ml-auto">{step.time}</span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-warm-800 mb-1">{step.title}</div>
                    <div className="text-[10px] text-warm-500 leading-relaxed">{step.desc}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Search & Filters ───────────────────── */}
      <div className="bg-white rounded-xl border border-warm-200 p-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search 205 features..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-warm-50 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-warm-50 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          >
            <option value="all">All Statuses</option>
            <option value="ready">Ready to Build</option>
            <option value="planned">Planned</option>
            <option value="future">Future</option>
          </select>

          {/* Self-learning toggle */}
          <button
            onClick={() => setSelfLearnOnly(!selfLearnOnly)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors',
              selfLearnOnly
                ? 'bg-purple-50 border-purple-300 text-purple-700'
                : 'bg-warm-50 border-warm-200 text-warm-600 hover:bg-warm-100'
            )}
          >
            <Brain className="h-4 w-4" />
            Self-Learning Only
          </button>

          {/* Result count */}
          <div className="text-xs text-warm-500">
            {filtered.length} of {FEATURES.length}
          </div>
        </div>
      </div>

      {/* ── Feature Categories ─────────────────── */}
      <div className="space-y-3">
        {Object.entries(groupedByCategory).map(([cat, features]) => {
          const CatIcon = categoryIcons[cat] ?? Zap
          const isCollapsed = collapsedCategories.has(cat)
          const enabledCount = features.filter(f => enabledFeatures.has(f.id)).length
          const selfLearnCount = features.filter(f => f.selfLearn).length

          return (
            <div key={cat} className="bg-white rounded-xl border border-warm-200 overflow-hidden">
              {/* Category header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-warm-100">
                <button
                  onClick={() => toggleCategory(cat)}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-warm-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-warm-400" />
                  )}
                  <div className="h-8 w-8 rounded-lg bg-warm-100 flex items-center justify-center">
                    <CatIcon className="h-4 w-4 text-warm-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-warm-900">{cat}</div>
                    <div className="text-[10px] text-warm-500">
                      {features.length} features &middot; {enabledCount} enabled
                      {selfLearnCount > 0 && (
                        <span className="ml-1 text-purple-500">&middot; {selfLearnCount} AI-powered</span>
                      )}
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => enableAllInCategory(cat)}
                    className="px-2 py-1 text-[10px] font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded border border-green-200 transition-colors"
                  >
                    Enable All
                  </button>
                  <button
                    onClick={() => disableAllInCategory(cat)}
                    className="px-2 py-1 text-[10px] font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors"
                  >
                    Disable All
                  </button>
                </div>
              </div>

              {/* Feature cards */}
              {!isCollapsed && (
                <div className="divide-y divide-warm-100">
                  {features.map(feature => {
                    const isEnabled = enabledFeatures.has(feature.id)
                    const sc = statusConfig[feature.status]
                    const ec = effortConfig[feature.effort]

                    return (
                      <div
                        key={feature.id}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3 transition-colors',
                          isEnabled ? 'bg-white' : 'bg-warm-50/50'
                        )}
                      >
                        {/* Toggle */}
                        <button
                          onClick={() => toggleFeature(feature.id)}
                          className={cn(
                            'mt-0.5 relative h-6 w-11 rounded-full transition-colors flex-shrink-0',
                            isEnabled ? 'bg-amber-500' : 'bg-warm-300'
                          )}
                        >
                          <div
                            className={cn(
                              'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                              isEnabled ? 'translate-x-5' : 'translate-x-0.5'
                            )}
                          />
                        </button>

                        {/* Feature info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn(
                              'text-sm font-medium',
                              isEnabled ? 'text-warm-900' : 'text-warm-500'
                            )}>
                              {feature.name}
                            </span>

                            {feature.selfLearn && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-purple-50 text-purple-600 rounded border border-purple-200">
                                <Brain className="h-3 w-3" />
                                Self-Learning
                              </span>
                            )}

                            <span className={cn(
                              'inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded border',
                              sc.bg, sc.color, sc.border
                            )}>
                              {sc.label}
                            </span>

                            <span className={cn('text-[10px] font-medium', ec.color)}>
                              {ec.label}
                            </span>

                            <span className="text-[10px] text-warm-400">
                              Phase {feature.phase}
                            </span>
                          </div>
                          <p className={cn(
                            'text-xs leading-relaxed mt-1',
                            isEnabled ? 'text-warm-600' : 'text-warm-400'
                          )}>
                            {feature.desc}
                          </p>
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

      {/* ── AI Insights Bar ────────────────────── */}
      <div className="bg-warm-50 border border-amber-200 rounded-xl px-4 py-3">
        <div className="flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-amber-800">AI Feature Intelligence: </span>
            <span className="text-amber-700">
              {stats.selfLearning} features use self-learning AI that improves with every interaction.
              {stats.ready} features are ready to build today.
              Enabling all Phase 1 features gives your team immediate access to the core platform.
            </span>
          </div>
        </div>
      </div>

      {/* ── AI Features Panel ──────────────────── */}
      <AIFeaturesPanel
        features={[
          {
            feature: 'Smart Feature Recommendations',
            insight: 'AI analyzes your company size, trade type, and active projects to recommend which features to enable first for maximum impact.',
          },
          {
            feature: 'Usage-Based Suggestions',
            insight: 'After 30 days of use, AI identifies which disabled features would save your team the most time based on actual workflow patterns.',
          },
          {
            feature: 'Self-Learning Dashboard',
            insight: 'Track how AI accuracy improves over time across all self-learning features. See confidence scores rise as the system learns your patterns.',
          },
        ]}
      />
    </div>
  )
}
