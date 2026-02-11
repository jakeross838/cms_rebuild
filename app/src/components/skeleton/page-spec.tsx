'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Database,
  Sparkles,
  Link2,
  FileText,
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
  'Phase 0 - Foundation': { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200' },
  'Phase 1 - Communication': { bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-200' },
  'Phase 2 - Vendor Collaboration': { bg: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-200' },
  'Phase 3 - Advanced PM': { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-200' },
  'Phase 4 - Time & Payments': { bg: 'bg-pink-500', text: 'text-pink-700', border: 'border-pink-200' },
  'Phase 5 - Enhanced Portals': { bg: 'bg-cyan-500', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Phase 6 - Advanced Features': { bg: 'bg-yellow-500', text: 'text-yellow-700', border: 'border-yellow-200' },
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
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', iconColor)} />
          <span className="font-medium text-gray-900">{title}</span>
          {count !== undefined && (
            <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
              {count}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="p-4 border-t border-gray-100">{children}</div>}
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
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('h-2 w-2 rounded-full', phaseStyle.bg)} />
              <span className="text-xs font-medium text-gray-500">{phase}</span>
              {planFile && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs text-gray-400">{planFile}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="mt-1 text-gray-600">{description}</p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-3 text-center">
            <div className="px-3 py-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{features.length}</div>
              <div className="text-xs text-gray-500">Features</div>
            </div>
            <div className="px-3 py-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{aiFeatures.length}</div>
              <div className="text-xs text-gray-500">AI Features</div>
            </div>
            <div className="px-3 py-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{connections.length}</div>
              <div className="text-xs text-gray-500">Connections</div>
            </div>
          </div>
        </div>

        {/* Workflow Position - Inline */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-gray-500 mr-2 whitespace-nowrap">Workflow:</span>
            {workflow.map((step, index) => (
              <div key={step} className="flex items-center">
                <span
                  className={cn(
                    'px-2 py-1 rounded text-xs whitespace-nowrap',
                    step === title
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {step}
                </span>
                {index < workflow.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-gray-300 mx-1 flex-shrink-0" />
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
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Connections */}
        <Section
          title="System Connections"
          icon={Link2}
          iconColor="text-purple-600"
          count={connections.length}
          defaultOpen={true}
        >
          <div className="space-y-3">
            {inputConnections.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 mb-1.5">
                  <ArrowLeft className="h-3 w-3" />
                  Receives from
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {inputConnections.map((conn) => (
                    <span
                      key={conn.name}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
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
                <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 mb-1.5">
                  <ArrowLeftRight className="h-3 w-3" />
                  Two-way sync
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {bidirectionalConnections.map((conn) => (
                    <span
                      key={conn.name}
                      className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs"
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
                className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span className="font-medium text-sm text-gray-900">{feature.name}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
                {feature.trigger && (
                  <p className="mt-2 text-xs text-amber-700 font-medium">
                    Trigger: {feature.trigger}
                  </p>
                )}
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
          iconColor="text-orange-600"
          count={dataFields.length}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-2 pr-4 font-medium text-gray-500 text-xs">FIELD</th>
                  <th className="py-2 pr-4 font-medium text-gray-500 text-xs">TYPE</th>
                  <th className="py-2 pr-4 font-medium text-gray-500 text-xs">REQ</th>
                  <th className="py-2 font-medium text-gray-500 text-xs">DESCRIPTION</th>
                </tr>
              </thead>
              <tbody>
                {dataFields.map((field, index) => (
                  <tr key={index} className="border-b border-gray-50">
                    <td className="py-1.5 pr-4 font-mono text-blue-600 text-xs">{field.name}</td>
                    <td className="py-1.5 pr-4 font-mono text-gray-500 text-xs">{field.type}</td>
                    <td className="py-1.5 pr-4">
                      {field.required ? (
                        <span className="text-red-500 text-xs">Yes</span>
                      ) : (
                        <span className="text-gray-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-1.5 text-gray-600 text-xs">{field.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* ASCII Mockup - Collapsible */}
      {mockupAscii && (
        <Section title="Layout Mockup" icon={Layers} iconColor="text-gray-600">
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
            {mockupAscii}
          </pre>
        </Section>
      )}
    </div>
  )
}
