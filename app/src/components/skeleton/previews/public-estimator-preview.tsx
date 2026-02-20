'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '../ui/ai-features-panel'
import {
  Home,
  Ruler,
  Paintbrush,
  Sofa,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  DollarSign,
  Clock,
  Calendar,
  User,
  Mail,
  Phone,
  MessageSquare,
  Download,
  Share2,
  Calculator,
  TrendingUp,
  Building2,
  Bed,
  Bath,
  Car,
  Mountain,
  Sun,
  Waves,
  TreePine,
  Zap,
  Flame,
  Wind,
  Lock,
  ArrowRight,
  Star,
  Target,
  BarChart3,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────

interface EstimatorStep {
  id: number
  name: string
  icon: React.ReactNode
  description: string
}

interface FinishLevel {
  id: string
  name: string
  description: string
  priceMultiplier: number
  color: string
}

interface CategoryBreakdown {
  category: string
  displayName: string
  costLow: number
  costHigh: number
  percentage: number
}

interface EstimatorConfig {
  category: string
  finishLevel: string
  costPerSqftLow: number
  costPerSqftHigh: number
  displayName: string
}

// ── Mock Data ────────────────────────────────────────────────

const estimatorSteps: EstimatorStep[] = [
  { id: 0, name: 'Getting Started', icon: <Home className="h-5 w-5" />, description: 'Tell us about your dream home' },
  { id: 1, name: 'Home Basics', icon: <Ruler className="h-5 w-5" />, description: 'Size and layout' },
  { id: 2, name: 'Style & Exterior', icon: <Paintbrush className="h-5 w-5" />, description: 'Architectural style and finishes' },
  { id: 3, name: 'Interior', icon: <Sofa className="h-5 w-5" />, description: 'Interior selections' },
  { id: 4, name: 'Results', icon: <Sparkles className="h-5 w-5" />, description: 'Your estimate' },
]

const finishLevels: FinishLevel[] = [
  { id: 'builder', name: 'Builder Grade', description: 'Quality materials, value-focused', priceMultiplier: 1.0, color: 'bg-warm-500' },
  { id: 'standard', name: 'Standard', description: 'Upgraded finishes, popular choices', priceMultiplier: 1.15, color: 'bg-stone-500' },
  { id: 'premium', name: 'Premium', description: 'High-end materials, custom details', priceMultiplier: 1.35, color: 'bg-warm-500' },
  { id: 'luxury', name: 'Luxury', description: 'Top-tier everything, no compromises', priceMultiplier: 1.6, color: 'bg-amber-500' },
]

const mockBreakdown: CategoryBreakdown[] = [
  { category: 'site_work', displayName: 'Site Work & Grading', costLow: 18000, costHigh: 24000, percentage: 4 },
  { category: 'concrete', displayName: 'Foundation & Concrete', costLow: 48000, costHigh: 57000, percentage: 10 },
  { category: 'lumber', displayName: 'Lumber & Framing', costLow: 42000, costHigh: 51000, percentage: 9 },
  { category: 'roofing', displayName: 'Roofing', costLow: 15000, costHigh: 21000, percentage: 3 },
  { category: 'windows', displayName: 'Windows & Doors', costLow: 24000, costHigh: 33000, percentage: 5 },
  { category: 'plumbing', displayName: 'Plumbing', costLow: 30000, costHigh: 39000, percentage: 6 },
  { category: 'electrical', displayName: 'Electrical', costLow: 27000, costHigh: 33000, percentage: 5 },
  { category: 'hvac', displayName: 'HVAC', costLow: 27000, costHigh: 33000, percentage: 5 },
  { category: 'insulation', displayName: 'Insulation', costLow: 12000, costHigh: 16500, percentage: 3 },
  { category: 'drywall', displayName: 'Drywall & Paint', costLow: 27000, costHigh: 33000, percentage: 5 },
  { category: 'flooring', displayName: 'Flooring', costLow: 18000, costHigh: 27000, percentage: 4 },
  { category: 'cabinets', displayName: 'Cabinets & Countertops', costLow: 33000, costHigh: 48000, percentage: 7 },
  { category: 'appliances', displayName: 'Appliances', costLow: 13500, costHigh: 21000, percentage: 3 },
  { category: 'fixtures', displayName: 'Fixtures & Hardware', costLow: 18000, costHigh: 27000, percentage: 4 },
  { category: 'exterior', displayName: 'Exterior Finishes', costLow: 30000, costHigh: 39000, percentage: 6 },
  { category: 'landscaping', displayName: 'Landscaping', costLow: 15000, costHigh: 21000, percentage: 3 },
  { category: 'permits', displayName: 'Permits & Fees', costLow: 27000, costHigh: 33000, percentage: 5 },
  { category: 'overhead', displayName: 'Builder Overhead & Profit', costLow: 84000, costHigh: 102000, percentage: 13 },
]

// ── Helper Components ────────────────────────────────────────

function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 flex-1 rounded-full transition-all duration-300',
            i < currentStep ? 'bg-stone-700' : i === currentStep ? 'bg-stone-400' : 'bg-warm-200'
          )}
        />
      ))}
    </div>
  )
}

function StepIndicator({ steps, currentStep }: { steps: EstimatorStep[]; currentStep: number }) {
  return (
    <div className="flex justify-between">
      {steps.map((step, i) => (
        <div key={step.id} className="flex flex-col items-center gap-1">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center transition-all',
              i < currentStep
                ? 'bg-green-500 text-white'
                : i === currentStep
                ? 'bg-stone-700 text-white'
                : 'bg-warm-100 text-warm-400'
            )}
          >
            {i < currentStep ? <Check className="h-4 w-4" /> : step.icon}
          </div>
          <span className={cn('text-[10px]', i === currentStep ? 'text-stone-600 font-medium' : 'text-warm-400')}>
            {step.name}
          </span>
        </div>
      ))}
    </div>
  )
}

function FinishLevelSelector({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {finishLevels.map((level) => (
        <button
          key={level.id}
          onClick={() => onSelect(level.id)}
          className={cn(
            'p-3 rounded-lg border-2 text-left transition-all',
            selected === level.id
              ? 'border-stone-500 bg-stone-50'
              : 'border-warm-200 hover:border-warm-300'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className={cn('w-3 h-3 rounded-full', level.color)} />
            <span className="font-medium text-sm">{level.name}</span>
          </div>
          <p className="text-xs text-warm-500">{level.description}</p>
        </button>
      ))}
    </div>
  )
}

function RunningTotal({ low, high }: { low: number; high: number }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 shadow-lg">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          <span className="text-sm">Estimated Range</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold">${(low / 1000).toFixed(0)}K - ${(high / 1000).toFixed(0)}K</span>
        </div>
      </div>
    </div>
  )
}

function CostBreakdownBar({ breakdown }: { breakdown: CategoryBreakdown[] }) {
  const total = breakdown.reduce((sum, cat) => sum + cat.costHigh, 0)
  const colors = [
    'bg-stone-500', 'bg-green-500', 'bg-amber-500', 'bg-warm-500',
    'bg-warm-500', 'bg-stone-500', 'bg-sand-500', 'bg-stone-500',
    'bg-red-500', 'bg-stone-500', 'bg-lime-500', 'bg-emerald-500',
    'bg-warm-500', 'bg-fuchsia-500', 'bg-warm-500', 'bg-sky-500',
    'bg-yellow-500', 'bg-warm-500'
  ]

  return (
    <div className="space-y-2">
      {/* Stacked bar */}
      <div className="h-8 rounded-lg overflow-hidden flex">
        {breakdown.map((cat, i) => (
          <div
            key={cat.category}
            className={cn(colors[i % colors.length], 'transition-all')}
            style={{ width: `${cat.percentage}%` }}
            title={`${cat.displayName}: ${cat.percentage}%`}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-1">
        {breakdown.slice(0, 9).map((cat, i) => (
          <div key={cat.category} className="flex items-center gap-1">
            <div className={cn('w-2 h-2 rounded-sm', colors[i % colors.length])} />
            <span className="text-[10px] text-warm-600 truncate">{cat.displayName}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LeadCaptureGate({ onSubmit }: { onSubmit: () => void }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-t from-white via-white to-transparent flex flex-col items-center justify-end pb-8">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4 border">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="h-6 w-6 text-stone-600" />
          </div>
          <h3 className="font-semibold text-lg">Unlock Your Full Estimate</h3>
          <p className="text-sm text-warm-500 mt-1">Get your detailed cost breakdown and connect with our team</p>
        </div>
        <div className="space-y-3">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
            <input type="text" placeholder="Your Name" className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
            <input type="email" placeholder="Email Address" className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
            <input type="tel" placeholder="Phone (optional)" className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" />
          </div>
          <button
            onClick={onSubmit}
            className="w-full bg-stone-700 text-white py-2.5 rounded-lg font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
          >
            See My Estimate <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-warm-400 text-center mt-3">
          By submitting, you agree to be contacted about your project. No spam, ever.
        </p>
      </div>
    </div>
  )
}

// ── Main Preview Component ────────────────────────────────────

export function PublicEstimatorPreview() {
  const [currentStep, setCurrentStep] = useState(0)
  const [finishLevel, setFinishLevel] = useState('standard')
  const [showGate, setShowGate] = useState(false)
  const [leadCaptured, setLeadCaptured] = useState(false)
  const [sqft, setSqft] = useState(3000)
  const [bedrooms, setBedrooms] = useState(4)
  const [bathrooms, setBathrooms] = useState(3)

  // Calculate estimates
  const baseCostLow = mockBreakdown.reduce((sum, cat) => sum + cat.costLow, 0)
  const baseCostHigh = mockBreakdown.reduce((sum, cat) => sum + cat.costHigh, 0)
  const multiplier = finishLevels.find(f => f.id === finishLevel)?.priceMultiplier || 1
  const estimateLow = Math.round(baseCostLow * multiplier * (sqft / 3000))
  const estimateHigh = Math.round(baseCostHigh * multiplier * (sqft / 3000))

  return (
    <div className="space-y-6">
      {/* Estimator Interface */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Custom Home Estimator</h2>
                <p className="text-white/60 text-xs">Get an instant estimate for your dream home</p>
              </div>
            </div>
            <span className="text-white/40 text-xs">Powered by AI</span>
          </div>
          <ProgressBar currentStep={currentStep} totalSteps={estimatorSteps.length} />
        </div>

        {/* Step Content */}
        <div className="p-6 min-h-[400px] relative">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-white text-xl font-semibold mb-2">Let's Build Your Dream Home</h3>
                <p className="text-white/60 text-sm">Answer a few questions to get an instant estimate</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 space-y-4">
                <div>
                  <label className="text-white/80 text-sm mb-2 block">What finish level are you considering?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {finishLevels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setFinishLevel(level.id)}
                        className={cn(
                          'p-3 rounded-lg border text-left transition-all',
                          finishLevel === level.id
                            ? 'border-blue-400 bg-stone-500/20'
                            : 'border-white/10 hover:border-white/20'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={cn('w-2 h-2 rounded-full', level.color)} />
                          <span className="text-white text-sm font-medium">{level.name}</span>
                        </div>
                        <p className="text-white/50 text-xs">{level.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-white text-xl font-semibold mb-2">Home Basics</h3>
                <p className="text-white/60 text-sm">Tell us about the size and layout</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 space-y-5">
                {/* Square Footage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white/80 text-sm">Square Footage</label>
                    <span className="text-white font-semibold">{sqft.toLocaleString()} sqft</span>
                  </div>
                  <input
                    type="range"
                    min="1500"
                    max="10000"
                    step="100"
                    value={sqft}
                    onChange={(e) => setSqft(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-white/40 text-xs mt-1">
                    <span>1,500</span>
                    <span>10,000+</span>
                  </div>
                </div>

                {/* Bedrooms & Bathrooms */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/80 text-sm mb-2 block flex items-center gap-2">
                      <Bed className="h-4 w-4" /> Bedrooms
                    </label>
                    <div className="flex gap-2">
                      {[3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          onClick={() => setBedrooms(num)}
                          className={cn(
                            'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                            bedrooms === num
                              ? 'bg-stone-500 text-white'
                              : 'bg-white/10 text-white/60 hover:bg-white/20'
                          )}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/80 text-sm mb-2 block flex items-center gap-2">
                      <Bath className="h-4 w-4" /> Bathrooms
                    </label>
                    <div className="flex gap-2">
                      {[2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => setBathrooms(num)}
                          className={cn(
                            'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                            bathrooms === num
                              ? 'bg-stone-500 text-white'
                              : 'bg-white/10 text-white/60 hover:bg-white/20'
                          )}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Garage */}
                <div>
                  <label className="text-white/80 text-sm mb-2 block flex items-center gap-2">
                    <Car className="h-4 w-4" /> Garage Spaces
                  </label>
                  <div className="flex gap-2">
                    {[2, 3, 4].map((num) => (
                      <button
                        key={num}
                        className="flex-1 py-2 rounded-lg bg-white/10 text-white/60 text-sm hover:bg-white/20 transition-all"
                      >
                        {num}-Car
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-white text-xl font-semibold mb-2">Style & Exterior</h3>
                <p className="text-white/60 text-sm">Choose your architectural style</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Coastal', icon: <Waves className="h-5 w-5" />, selected: true },
                  { name: 'Modern', icon: <Building2 className="h-5 w-5" /> },
                  { name: 'Farmhouse', icon: <TreePine className="h-5 w-5" /> },
                  { name: 'Mediterranean', icon: <Sun className="h-5 w-5" /> },
                ].map((style) => (
                  <button
                    key={style.name}
                    className={cn(
                      'p-4 rounded-xl border text-center transition-all',
                      style.selected
                        ? 'border-blue-400 bg-stone-500/20'
                        : 'border-white/10 hover:border-white/20'
                    )}
                  >
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-2 text-white">
                      {style.icon}
                    </div>
                    <span className="text-white text-sm font-medium">{style.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-white text-xl font-semibold mb-2">Interior Selections</h3>
                <p className="text-white/60 text-sm">Customize your interior finishes</p>
              </div>

              <div className="space-y-3">
                {[
                  { category: 'Flooring', options: ['Tile', 'Hardwood', 'LVP'], selected: 'Hardwood' },
                  { category: 'Countertops', options: ['Laminate', 'Quartz', 'Granite'], selected: 'Quartz' },
                  { category: 'Cabinets', options: ['Stock', 'Semi-Custom', 'Custom'], selected: 'Semi-Custom' },
                ].map((item) => (
                  <div key={item.category} className="bg-white/5 rounded-xl p-4">
                    <label className="text-white/80 text-sm mb-2 block">{item.category}</label>
                    <div className="flex gap-2">
                      {item.options.map((opt) => (
                        <button
                          key={opt}
                          className={cn(
                            'flex-1 py-2 rounded-lg text-xs font-medium transition-all',
                            item.selected === opt
                              ? 'bg-stone-500 text-white'
                              : 'bg-white/10 text-white/60 hover:bg-white/20'
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs mb-3">
                  <Check className="h-3 w-3" /> Estimate Complete
                </div>
                <h3 className="text-white text-2xl font-bold mb-1">
                  ${(estimateLow / 1000).toFixed(0)}K - ${(estimateHigh / 1000).toFixed(0)}K
                </h3>
                <p className="text-white/60 text-sm">
                  For a {sqft.toLocaleString()} sqft {finishLevels.find(f => f.id === finishLevel)?.name} home
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <DollarSign className="h-5 w-5 text-green-400 mx-auto mb-1" />
                  <div className="text-white font-semibold">${Math.round(estimateLow / sqft)}</div>
                  <div className="text-white/50 text-xs">per sqft</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <Clock className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                  <div className="text-white font-semibold">10-12</div>
                  <div className="text-white/50 text-xs">months</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <Calendar className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                  <div className="text-white font-semibold">Q2 2026</div>
                  <div className="text-white/50 text-xs">earliest start</div>
                </div>
              </div>

              {/* Cost Breakdown - Blurred if not captured */}
              <div className={cn('relative', !leadCaptured && 'overflow-hidden')}>
                <div className={cn(!leadCaptured && 'blur-sm pointer-events-none')}>
                  <h4 className="text-white/80 text-sm font-medium mb-3">Cost Breakdown</h4>
                  <CostBreakdownBar breakdown={mockBreakdown} />
                </div>

                {!leadCaptured && <LeadCaptureGate onSubmit={() => setLeadCaptured(true)} />}
              </div>

              {/* Actions */}
              {leadCaptured && (
                <div className="flex gap-3">
                  <button className="flex-1 bg-white/10 text-white py-2.5 rounded-lg text-sm hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" /> Download PDF
                  </button>
                  <button className="flex-1 bg-white/10 text-white py-2.5 rounded-lg text-sm hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Running Total (except on results) */}
          {currentStep < 4 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  <span className="text-xs">Running Estimate</span>
                </div>
                <span className="font-bold">${(estimateLow / 1000).toFixed(0)}K - ${(estimateHigh / 1000).toFixed(0)}K</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="p-4 border-t border-white/10 flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-white/60 hover:text-white disabled:opacity-30 flex items-center gap-1 text-sm"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(estimatorSteps.length - 1, currentStep + 1))}
            disabled={currentStep === estimatorSteps.length - 1}
            className="px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800 disabled:opacity-30 flex items-center gap-1 text-sm"
          >
            {currentStep === estimatorSteps.length - 2 ? 'See Results' : 'Continue'} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Lead Dashboard (Admin View) */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-stone-600" />
            Estimator Leads Dashboard
          </h3>
          <p className="text-sm text-warm-500 mt-1">Leads captured from the public estimator</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-4 border-b bg-warm-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-warm-900">47</div>
            <div className="text-xs text-warm-500">Total Leads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-stone-600">12</div>
            <div className="text-xs text-warm-500">New This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">23%</div>
            <div className="text-xs text-warm-500">Conversion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-stone-600">$14.2M</div>
            <div className="text-xs text-warm-500">Pipeline Value</div>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="divide-y">
          {[
            { name: 'Michael Chen', email: 'michael.chen@email.com', sqft: 4200, estimate: '$890K-$1.1M', status: 'new', level: 'premium', date: '2 hours ago' },
            { name: 'Sarah Williams', email: 'sarah.w@email.com', sqft: 3500, estimate: '$640K-$780K', status: 'contacted', level: 'standard', date: '1 day ago' },
            { name: 'David & Lisa Park', email: 'd.park@email.com', sqft: 5800, estimate: '$1.4M-$1.7M', status: 'qualified', level: 'luxury', date: '3 days ago' },
          ].map((lead, i) => (
            <div key={i} className="p-4 hover:bg-warm-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                  <span className="text-stone-600 font-medium">{lead.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <div className="font-medium text-sm">{lead.name}</div>
                  <div className="text-xs text-warm-500">{lead.email}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-sm">{lead.estimate}</div>
                <div className="text-xs text-warm-500">{lead.sqft.toLocaleString()} sqft • {lead.level}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  lead.status === 'new' ? 'bg-stone-100 text-stone-700' :
                  lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                )}>
                  {lead.status}
                </span>
                <span className="text-xs text-warm-400">{lead.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Features */}
      <AIFeaturesPanel
        title="AI Estimator Intelligence"
        features={[
          {
            feature: 'Dynamic Pricing Engine',
            trigger: 'Real-time',
            insight: 'Estimates calculated using historical pricing data from 847 completed projects. Confidence: High (R² = 0.94).',
            severity: 'info',
            confidence: 94,
          },
          {
            feature: 'Lead Quality Scoring',
            trigger: 'On submission',
            insight: 'Michael Chen scored 87/100 - high intent signals: $1M+ budget, detailed selections, viewed 4 pages before estimate.',
            severity: 'success',
            confidence: 87,
          },
          {
            feature: 'Timeline Intelligence',
            trigger: 'On calculation',
            insight: 'Duration estimate uses crew availability, seasonal factors, and complexity analysis. Premium homes avg 11.2 months.',
            severity: 'info',
            confidence: 89,
          },
          {
            feature: 'Price Trend Alerts',
            trigger: 'Weekly',
            insight: 'Lumber costs trending +3.2% this quarter. Estimates auto-adjusted. Recommend updating client quotes >30 days old.',
            severity: 'warning',
            confidence: 91,
          },
          {
            feature: 'Conversion Optimization',
            trigger: 'Daily',
            insight: 'Leads with "Luxury" selections convert 34% higher. Consider premium upsell prompts in estimator flow.',
            severity: 'success',
            confidence: 82,
          },
        ]}
      />
    </div>
  )
}
