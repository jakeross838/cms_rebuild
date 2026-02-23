'use client'

import { useState } from 'react'

import {
  ChevronDown,
  ChevronRight,
  Database,
  Sparkles,
  Link2,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
  Check,
  Layers,
} from 'lucide-react'

import { cn } from '@/lib/utils'

interface Connection {
  name: string
  type: 'input' | 'output' | 'bidirectional'
  description: string
}

interface DataField {
  name: string
  type: string
  required?: boolean
  description?: string
}

interface AIFeature {
  name: string
  description: string
  trigger?: string
}

interface PageSpecProps {
  title: string
  phase: string
  description: string
  workflow: string[]
  features: string[]
  connections: Connection[]
  dataFields?: DataField[]
  aiFeatures?: AIFeature[]
  mockupAscii?: string
  planFile?: string
}

const phaseColors: Record<string, { bg: string; text: string; border: string }> = {
  'Phase 0 - Foundation': { bg: 'bg-stone-500', text: 'text-stone-700', border: 'border-stone-200' },
  'Phase 1 - Communication': { bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-200' },
  'Phase 2 - Vendor Collaboration': { bg: 'bg-warm-500', text: 'text-warm-700', border: 'border-warm-200' },
  'Phase 3 - Advanced PM': { bg: 'bg-sand-500', text: 'text-sand-700', border: 'border-sand-200' },
  'Phase 4 - Time & Payments': { bg: 'bg-warm-500', text: 'text-sand-700', border: 'border-warm-200' },
  'Phase 5 - Enhanced Portals': { bg: 'bg-stone-500', text: 'text-stone-700', border: 'border-stone-200' },
  'Phase 6 - Advanced Features': { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200' },
}

function Section({
  title,
  icon: Icon,
  iconColor,
  count,
  defaultOpen = false,
  children,
}: {
  title: string
  icon: React.ElementType
  iconColor: string
  count?: number
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-muted hover:bg-accent transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', iconColor)} />
          <span className="font-medium text-foreground">{title}</span>
          {count !== undefined && (
            <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
              {count}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen ? <div className="p-4 border-t border-border">{children}</div> : null}
    </div>
  )
}

export function PageSpec({
  title,
  phase,
  description,
  workflow,
  features,
  connections,
  dataFields = [],
  aiFeatures = [],
  mockupAscii,
  planFile,
}: PageSpecProps) {
  const phaseStyle = phaseColors[phase] || phaseColors['Phase 0 - Foundation']
  const inputConnections = connections.filter((c) => c.type === 'input')
  const outputConnections = connections.filter((c) => c.type === 'output')
  const bidirectionalConnections = connections.filter((c) => c.type === 'bidirectional')

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Compact Header */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('h-2 w-2 rounded-full', phaseStyle.bg)} />
              <span className="text-xs font-medium text-muted-foreground">{phase}</span>
              {planFile ? <>
                  <span className="text-warm-400">|</span>
                  <span className="text-xs text-muted-foreground">{planFile}</span>
                </> : null}
            </div>
            <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">{title}</h1>
            <p className="mt-1 text-muted-foreground">{description}</p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-3 text-center">
            <div className="px-3 py-2 bg-muted rounded-lg">
              <div className="text-lg font-bold text-foreground">{features.length}</div>
              <div className="text-xs text-muted-foreground">Features</div>
            </div>
            <div className="px-3 py-2 bg-muted rounded-lg">
              <div className="text-lg font-bold text-foreground">{aiFeatures.length}</div>
              <div className="text-xs text-muted-foreground">AI Features</div>
            </div>
            <div className="px-3 py-2 bg-muted rounded-lg">
              <div className="text-lg font-bold text-foreground">{connections.length}</div>
              <div className="text-xs text-muted-foreground">Connections</div>
            </div>
          </div>
        </div>

        {/* Workflow Position - Inline */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-muted-foreground mr-2 whitespace-nowrap">Workflow:</span>
            {workflow.map((step, index) => (
              <div key={step} className="flex items-center">
                <span
                  className={cn(
                    'px-2 py-1 rounded text-xs whitespace-nowrap',
                    step === title
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {step}
                </span>
                {index < workflow.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-muted-foreground mx-1 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout for Core Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Features */}
        <Section
          title="Features"
          icon={Check}
          iconColor="text-green-600"
          count={features.length}
          defaultOpen={true}
        >
          <ul className="space-y-1.5">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Connections */}
        <Section
          title="System Connections"
          icon={Link2}
          iconColor="text-stone-600"
          count={connections.length}
          defaultOpen={true}
        >
          <div className="space-y-3">
            {inputConnections.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 mb-1.5">
                  <ArrowLeft className="h-3 w-3" />
                  Receives from
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {inputConnections.map((conn) => (
                    <span
                      key={conn.name}
                      className="px-2 py-1 bg-stone-50 text-stone-700 rounded text-xs"
                      title={conn.description}
                    >
                      {conn.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {outputConnections.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 mb-1.5">
                  <ArrowRight className="h-3 w-3" />
                  Sends to
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {outputConnections.map((conn) => (
                    <span
                      key={conn.name}
                      className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs"
                      title={conn.description}
                    >
                      {conn.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {bidirectionalConnections.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 mb-1.5">
                  <ArrowLeftRight className="h-3 w-3" />
                  Two-way sync
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {bidirectionalConnections.map((conn) => (
                    <span
                      key={conn.name}
                      className="px-2 py-1 bg-warm-50 text-warm-700 rounded text-xs"
                      title={conn.description}
                    >
                      {conn.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* AI Features - Full Width, Important */}
      {aiFeatures.length > 0 && (
        <Section
          title="AI Intelligence"
          icon={Sparkles}
          iconColor="text-amber-500"
          count={aiFeatures.length}
          defaultOpen={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-3 bg-warm-50 rounded-lg border border-amber-100"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span className="font-medium text-sm text-foreground">{feature.name}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                {feature.trigger ? <p className="mt-2 text-xs text-amber-700 font-medium">
                    Trigger: {feature.trigger}
                  </p> : null}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Data Model - Collapsible */}
      {dataFields.length > 0 && (
        <Section
          title="Data Model"
          icon={Database}
          iconColor="text-sand-600"
          count={dataFields.length}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 font-medium text-muted-foreground text-xs">FIELD</th>
                  <th className="py-2 pr-4 font-medium text-muted-foreground text-xs">TYPE</th>
                  <th className="py-2 pr-4 font-medium text-muted-foreground text-xs">REQ</th>
                  <th className="py-2 font-medium text-muted-foreground text-xs">DESCRIPTION</th>
                </tr>
              </thead>
              <tbody>
                {dataFields.map((field, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="py-1.5 pr-4 font-mono text-stone-600 text-xs">{field.name}</td>
                    <td className="py-1.5 pr-4 font-mono text-muted-foreground text-xs">{field.type}</td>
                    <td className="py-1.5 pr-4">
                      {field.required ? (
                        <span className="text-red-500 text-xs">Yes</span>
                      ) : (
                        <span className="text-warm-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-1.5 text-muted-foreground text-xs">{field.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* ASCII Mockup - Collapsible */}
      {mockupAscii ? <Section title="Layout Mockup" icon={Layers} iconColor="text-warm-600">
          <pre className="bg-warm-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
            {mockupAscii}
          </pre>
        </Section> : null}
    </div>
  )
}
