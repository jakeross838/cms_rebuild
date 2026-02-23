'use client'

import {
  DatabaseZap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Shield,
  Sparkles,
  CircleDot,
  XCircle,
} from 'lucide-react'

import { cn } from '@/lib/utils'

const migrationSources = [
  { name: 'Buildertrend', status: 'active', icon: '🏗️', description: 'Full project, financial, and schedule data', supported: true },
  { name: 'CoConstruct', status: 'available', icon: '📐', description: 'Projects, selections, and specifications', supported: true },
  { name: 'Excel / CSV', status: 'available', icon: '📊', description: 'Spreadsheet import with field mapping', supported: true },
  { name: 'QuickBooks', status: 'available', icon: '💰', description: 'Chart of accounts, vendors, clients', supported: true },
  { name: 'Procore', status: 'coming', icon: '🔧', description: 'Commercial project management data', supported: false },
  { name: 'Manual Entry', status: 'available', icon: '✏️', description: 'Enter data directly with templates', supported: true },
]

const migrationProgress = [
  { entity: 'Jobs & Projects', total: 48, migrated: 48, status: 'complete', errors: 0 },
  { entity: 'Client Records', total: 62, migrated: 62, status: 'complete', errors: 0 },
  { entity: 'Vendor Directory', total: 85, migrated: 83, status: 'complete', errors: 2 },
  { entity: 'Cost Code Library', total: 120, migrated: 120, status: 'complete', errors: 0 },
  { entity: 'Budget Line Items', total: 2840, migrated: 2156, status: 'in_progress', errors: 4 },
  { entity: 'Invoices & POs', total: 1560, migrated: 0, status: 'pending', errors: 0 },
  { entity: 'Documents & Photos', total: 4200, migrated: 0, status: 'pending', errors: 0 },
  { entity: 'Schedule Tasks', total: 890, migrated: 0, status: 'pending', errors: 0 },
]

const fieldMappings = [
  { source: 'BT: Project Name', target: 'Job Name', confidence: 98, status: 'mapped' },
  { source: 'BT: Project Address', target: 'Job Address', confidence: 96, status: 'mapped' },
  { source: 'BT: Contract Amount', target: 'Original Contract Value', confidence: 94, status: 'mapped' },
  { source: 'BT: Sub/Vendor', target: 'Vendor Name', confidence: 88, status: 'review' },
  { source: 'BT: Category', target: 'Cost Code', confidence: 72, status: 'review' },
  { source: 'BT: Custom Field 1', target: '(Unmapped)', confidence: 0, status: 'unmapped' },
]

const validationResults = [
  { type: 'success', count: 312, message: 'Records passed all validation checks' },
  { type: 'warning', count: 8, message: 'Records with missing optional fields' },
  { type: 'error', count: 6, message: 'Records with data type mismatches' },
]

export default function DataMigrationPage() {
  const totalRecords = migrationProgress.reduce((s, p) => s + p.total, 0)
  const migratedRecords = migrationProgress.reduce((s, p) => s + p.migrated, 0)
  const overallPercent = Math.round((migratedRecords / totalRecords) * 100)
  const totalErrors = migrationProgress.reduce((s, p) => s + p.errors, 0)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-100 rounded-lg">
            <DatabaseZap className="h-6 w-6 text-stone-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Data Migration</h1>
            <p className="text-sm text-muted-foreground">Module 42 -- Import your data from other platforms or spreadsheets</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm border rounded-lg text-muted-foreground hover:bg-accent flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4" /> Retry Failed
          </button>
          <button className="px-4 py-2 text-sm bg-stone-700 text-white rounded-lg hover:bg-stone-600">Resume Migration</button>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold">Migration from Buildertrend</h2>
            <p className="text-sm text-muted-foreground">{migratedRecords.toLocaleString()} of {totalRecords.toLocaleString()} records migrated</p>
          </div>
          <div className="flex items-center gap-4">
            {totalErrors > 0 && <span className="text-sm text-amber-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4" />{totalErrors} errors</span>}
            <div className="text-3xl font-bold text-stone-600">{overallPercent}%</div>
          </div>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-stone-500 rounded-full transition-all" style={{ width: `${overallPercent}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Migration Progress Detail */}
        <div className="col-span-2 space-y-6">
          <div className="bg-card border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Migration Progress by Entity</h3>
            </div>
            <div className="divide-y">
              {migrationProgress.map((item, i) => {
                const pct = item.total > 0 ? Math.round((item.migrated / item.total) * 100) : 0
                return (
                  <div key={i} className="p-4 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {item.status === 'complete' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : item.status === 'in_progress' ? <RefreshCw className="h-5 w-5 text-stone-600 animate-spin" /> : <Clock className="h-5 w-5 text-muted-foreground/40" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.entity}</span>
                        <span className="text-xs text-muted-foreground">{item.migrated.toLocaleString()} / {item.total.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', item.status === 'complete' ? 'bg-green-500' : item.status === 'in_progress' ? 'bg-stone-500' : 'bg-muted-foreground/20')} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    {item.errors > 0 && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{item.errors} errors</span>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Field Mapping Preview */}
          <div className="bg-card border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Field Mapping Preview</h3>
              <p className="text-xs text-muted-foreground mt-0.5">AI-suggested mappings from source to RossOS fields</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-2 px-4 font-medium text-muted-foreground">Source Field</th>
                    <th className="text-center py-2 px-4 font-medium text-muted-foreground" />
                    <th className="text-left py-2 px-4 font-medium text-muted-foreground">Target Field</th>
                    <th className="text-center py-2 px-4 font-medium text-muted-foreground">Confidence</th>
                    <th className="text-center py-2 px-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {fieldMappings.map((m, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="py-2.5 px-4 font-mono text-xs">{m.source}</td>
                      <td className="py-2.5 px-4 text-center"><ArrowRight className="h-4 w-4 text-muted-foreground inline" /></td>
                      <td className="py-2.5 px-4 font-mono text-xs">{m.target}</td>
                      <td className="py-2.5 px-4 text-center">
                        {m.confidence > 0 && (
                          <span className={cn('text-xs font-medium', m.confidence >= 90 ? 'text-green-600' : m.confidence >= 70 ? 'text-amber-600' : 'text-red-600')}>
                            {m.confidence}%
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={cn('text-xs px-2 py-0.5 rounded', m.status === 'mapped' ? 'bg-green-100 text-green-700' : m.status === 'review' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Source Selection */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Migration Sources</h3>
            <div className="space-y-2">
              {migrationSources.map((s, i) => (
                <div key={i} className={cn('flex items-center gap-3 p-2.5 rounded-lg border', s.status === 'active' ? 'border-cyan-300 bg-stone-50' : s.supported ? 'border-transparent bg-muted/30 hover:bg-muted/50 cursor-pointer' : 'border-transparent bg-muted/20 opacity-60')}>
                  <span className="text-lg">{s.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium flex items-center gap-2">
                      {s.name}
                      {s.status === 'active' && <CircleDot className="h-3.5 w-3.5 text-stone-600" />}
                      {s.status === 'coming' && <span className="text-xs text-muted-foreground">Coming Soon</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{s.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Validation Results */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Shield className="h-4 w-4 text-green-600" />Validation Results</h3>
            <div className="space-y-2">
              {validationResults.map((v, i) => (
                <div key={i} className={cn('p-2.5 rounded-lg flex items-center gap-3', v.type === 'success' ? 'bg-green-50' : v.type === 'warning' ? 'bg-amber-50' : 'bg-red-50')}>
                  {v.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : v.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-amber-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                  <div>
                    <div className={cn('text-sm font-bold', v.type === 'success' ? 'text-green-700' : v.type === 'warning' ? 'text-amber-700' : 'text-red-700')}>{v.count}</div>
                    <div className="text-xs text-muted-foreground">{v.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-cyan-50 to-stone-50 border border-stone-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-stone-600 mt-0.5" />
          <div>
            <div className="font-medium text-cyan-800">AI Migration Assistant</div>
            <p className="text-sm text-stone-700 mt-1">6 vendor records had name variations (e.g., &quot;ABC Electric LLC&quot; vs &quot;ABC Electrical&quot;) -- auto-merged into single records. 2 cost code mappings need your review: Buildertrend uses combined &quot;Site Work&quot; while RossOS splits into &quot;Grading&quot; and &quot;Utilities&quot;. Budget migration is 76% complete and on track to finish in ~15 minutes.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
