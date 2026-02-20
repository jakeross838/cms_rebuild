'use client'

import {
  Rocket,
  CheckCircle2,
  Circle,
  Building2,
  Users,
  CreditCard,
  Settings,
  FileText,
  Upload,
  Palette,
  Shield,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const setupSteps = [
  { id: 1, title: 'Company Profile', description: 'Name, logo, address, license info', icon: Building2, status: 'complete', time: '2 min' },
  { id: 2, title: 'Invite Team Members', description: 'Add PMs, supers, office staff with roles', icon: Users, status: 'complete', time: '3 min' },
  { id: 3, title: 'Cost Code Library', description: 'Import standard codes or customize yours', icon: FileText, status: 'complete', time: '5 min' },
  { id: 4, title: 'Connect QuickBooks', description: 'Link your accounting for 2-way sync', icon: CreditCard, status: 'current', time: '4 min' },
  { id: 5, title: 'Import Vendors', description: 'Upload vendor list or add manually', icon: Upload, status: 'pending', time: '5 min' },
  { id: 6, title: 'Branding & Portal', description: 'Logo, colors, client portal setup', icon: Palette, status: 'pending', time: '3 min' },
  { id: 7, title: 'Set Permissions', description: 'Configure role-based access levels', icon: Shield, status: 'pending', time: '4 min' },
  { id: 8, title: 'Create First Job', description: 'Set up your first project in the system', icon: Settings, status: 'pending', time: '5 min' },
]

const quickStartGuides = [
  { title: 'Processing Your First Invoice', duration: '3 min', category: 'Financial' },
  { title: 'Creating a Budget from Estimate', duration: '5 min', category: 'Financial' },
  { title: 'Setting Up Daily Logs', duration: '2 min', category: 'Field' },
  { title: 'Submitting a Draw Request', duration: '4 min', category: 'Financial' },
  { title: 'Managing Selections with Clients', duration: '4 min', category: 'Client' },
  { title: 'Using the Schedule Builder', duration: '6 min', category: 'Operations' },
]

const sampleDataPreview = [
  { type: 'Jobs', count: 3, description: 'Sample residential projects with budgets' },
  { type: 'Vendors', count: 12, description: 'Common trades pre-loaded' },
  { type: 'Cost Codes', count: 45, description: 'NAHB standard residential codes' },
  { type: 'Templates', count: 8, description: 'Contracts, proposals, POs' },
]

export default function OnboardingWizardPage() {
  const completedSteps = setupSteps.filter(s => s.status === 'complete').length
  const totalSteps = setupSteps.length
  const progressPercent = Math.round((completedSteps / totalSteps) * 100)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-100 rounded-lg">
            <Rocket className="h-6 w-6 text-stone-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Onboarding Wizard</h1>
            <p className="text-sm text-muted-foreground">Module 41 -- Get your company set up and running in under 30 minutes</p>
          </div>
        </div>
        <button className="px-4 py-2 text-sm text-muted-foreground border rounded-lg hover:bg-accent">Skip for Now</button>
      </div>

      {/* Progress Banner */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold">Setup Progress</h2>
            <p className="text-sm text-muted-foreground">{completedSteps} of {totalSteps} steps complete -- estimated {15} minutes remaining</p>
          </div>
          <div className="text-3xl font-bold text-stone-600">{progressPercent}%</div>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-stone-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Setup Steps */}
        <div className="col-span-2 bg-card border rounded-lg">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Setup Checklist</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Complete each step to unlock full functionality</p>
          </div>
          <div className="divide-y">
            {setupSteps.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.id} className={cn('p-4 flex items-center gap-4 transition-colors', step.status === 'current' ? 'bg-stone-50/50' : 'hover:bg-muted/30')}>
                  <div className="flex-shrink-0">
                    {step.status === 'complete' ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : step.status === 'current' ? (
                      <div className="h-6 w-6 rounded-full border-2 border-stone-500 flex items-center justify-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-stone-500" />
                      </div>
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {step.title}
                      {step.status === 'current' && <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">Current</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{step.time}</div>
                  {step.status === 'current' ? (
                    <button className="px-3 py-1.5 text-sm bg-stone-700 text-white rounded-lg hover:bg-stone-800 flex items-center gap-1">
                      Continue <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : step.status === 'pending' ? (
                    <ChevronRight className="h-5 w-5 text-muted-foreground/40" />
                  ) : (
                    <span className="text-xs text-green-600 font-medium">Done</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Start Guides */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Play className="h-4 w-4 text-stone-600" />Quick Start Guides</h3>
            <div className="space-y-2">
              {quickStartGuides.map((guide, i) => (
                <button key={i} className="w-full flex items-center justify-between p-2.5 bg-muted/30 rounded-lg hover:bg-muted/50 text-left">
                  <div>
                    <div className="text-sm font-medium">{guide.title}</div>
                    <div className="text-xs text-muted-foreground">{guide.category} -- {guide.duration}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Sample Data */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-1">Sample Data Preview</h3>
            <p className="text-xs text-muted-foreground mb-3">Pre-loaded data to explore features</p>
            <div className="space-y-2">
              {sampleDataPreview.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">{s.type}</div>
                    <div className="text-xs text-muted-foreground">{s.description}</div>
                  </div>
                  <span className="text-sm font-bold text-stone-600">{s.count}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 px-3 py-2 text-sm border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50">
              Load Sample Data
            </button>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-warm-50 border border-stone-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-stone-600 mt-0.5" />
          <div>
            <div className="font-medium text-stone-800">AI Setup Assistant</div>
            <p className="text-sm text-stone-700 mt-1">Based on your company profile (custom residential builder, 8 employees), I recommend connecting QuickBooks next for seamless financial tracking. Most builders your size complete setup in 25 minutes and see ROI within the first week.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
