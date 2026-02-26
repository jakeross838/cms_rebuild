'use client'

import {
  Heart,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Users,
  DollarSign,
  Gift,
  Search,
  Sun,
  Snowflake,
  Leaf,
  CloudRain,
  Home,
  Wrench,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Brain,
  ClipboardCheck,
  BookOpen,
  Award,
  ShieldCheck,
  ThermometerSun,
  Paintbrush,
  Droplets,
  Flame,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ── Types ─────────────────────────────────────────────────────────────

interface WalkthroughItem {
  id: string
  title: string
  clientName: string
  date: string
  type: '30-day' | '11-month' | '2-year'
  itemCount?: number
  description: string
  status: 'scheduled' | 'in-progress' | 'completed'
  statusColor: string
}

interface ChecklistItem {
  id: string
  description: string
  resolved: boolean
  note: string
  assignee?: string
  dueDate?: string
}

interface SeasonCard {
  season: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  tasks: string[]
}

interface ClientLifetimeValue {
  name: string
  initials: string
  color: string
  homeValue: string
  referrals: number
  referralValue: string
  additionalValue: string
  totalLifetimeValue: string
  googleRating: number
  extras: string[]
}

interface ReferralEntry {
  referrer: string
  referred: string
  projectValue: string
  status: 'Converted' | 'In Progress' | 'Declined'
  bonusSent: boolean
}

// ── Mock Data ─────────────────────────────────────────────────────────

const walkthroughs: WalkthroughItem[] = [
  {
    id: '1',
    title: '30-Day Walkthrough',
    clientName: 'Smith Residence',
    date: 'Feb 28, 2026',
    type: '30-day',
    itemCount: 5,
    description: '5 items pre-submitted by client',
    status: 'scheduled',
    statusColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: '2',
    title: '11-Month Warranty Walkthrough',
    clientName: 'Johnson Home',
    date: 'Mar 15, 2026',
    type: '11-month',
    description: 'Comprehensive warranty checklist review',
    status: 'scheduled',
    statusColor: 'bg-amber-100 text-amber-700',
  },
  {
    id: '3',
    title: '2-Year Check-in',
    clientName: 'Davis Project',
    date: 'Apr 1, 2026',
    type: '2-year',
    description: 'Maintenance follow-up and relationship touchpoint',
    status: 'scheduled',
    statusColor: 'bg-purple-100 text-purple-700',
  },
]

const checklistItems: ChecklistItem[] = [
  {
    id: '1',
    description: 'Nail pops in garage',
    resolved: true,
    note: 'Normal settling — patched and touched up',
  },
  {
    id: '2',
    description: 'Grout haze on master shower tile',
    resolved: true,
    note: 'Cleaned same day during walkthrough',
  },
  {
    id: '3',
    description: 'Cabinet door alignment in kitchen',
    resolved: true,
    note: 'Adjusted hinges on site — 5 min fix',
  },
  {
    id: '4',
    description: 'Exterior caulk gap at rear window',
    resolved: false,
    note: 'Assigned to painter',
    assignee: 'Tom (Painter)',
    dueDate: 'Mar 5, 2026',
  },
  {
    id: '5',
    description: 'Landscape drainage pooling near patio',
    resolved: false,
    note: 'Monitoring after next rain — may need French drain',
  },
]

const seasonalCards: SeasonCard[] = [
  {
    season: 'Spring',
    icon: Droplets,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    tasks: ['Clean gutters & downspouts', 'Check exterior caulk & paint', 'Inspect roof for winter damage'],
  },
  {
    season: 'Summer',
    icon: Sun,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    tasks: ['Replace HVAC filters', 'Maintain & seal deck', 'Check irrigation system'],
  },
  {
    season: 'Fall',
    icon: Leaf,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    tasks: ['Winterize irrigation', 'Clean dryer vent', 'Check weather stripping'],
  },
  {
    season: 'Winter',
    icon: Snowflake,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    tasks: ['Check heating system', 'Inspect fireplace & chimney', 'Review homeowner insurance'],
  },
]

const clientValues: ClientLifetimeValue[] = [
  {
    name: 'The Smiths',
    initials: 'TS',
    color: 'bg-amber-100 text-amber-700',
    homeValue: '$1.2M',
    referrals: 2,
    referralValue: '$1.95M',
    additionalValue: '',
    totalLifetimeValue: '$3.15M',
    googleRating: 5,
    extras: ['5-star Google review', '2 referrals converted'],
  },
  {
    name: 'The Johnsons',
    initials: 'TJ',
    color: 'bg-blue-100 text-blue-700',
    homeValue: '$950K',
    referrals: 1,
    referralValue: '$800K',
    additionalValue: 'Remodel inquiry',
    totalLifetimeValue: '$1.75M',
    googleRating: 4,
    extras: ['4-star Google review', '1 referral', 'Remodel inquiry submitted'],
  },
  {
    name: 'The Davis Family',
    initials: 'DF',
    color: 'bg-purple-100 text-purple-700',
    homeValue: '$1.8M',
    referrals: 0,
    referralValue: '$0',
    additionalValue: '',
    totalLifetimeValue: '$1.8M',
    googleRating: 5,
    extras: ['5-star Google review', 'No referrals yet — follow up recommended'],
  },
]

const referrals: ReferralEntry[] = [
  { referrer: 'The Smiths', referred: 'Henderson Family', projectValue: '$1.1M', status: 'Converted', bonusSent: true },
  { referrer: 'The Smiths', referred: 'Cooper Residence', projectValue: '$850K', status: 'Converted', bonusSent: true },
  { referrer: 'The Johnsons', referred: 'Patel Home', projectValue: '$800K', status: 'In Progress', bonusSent: false },
  { referrer: 'Chen Residence', referred: 'Watson Build', projectValue: '$450K', status: 'Converted', bonusSent: true },
  { referrer: 'Martinez Family', referred: 'O\'Brien Reno', projectValue: '$220K', status: 'Declined', bonusSent: false },
  { referrer: 'Baker Home', referred: 'Young Residence', projectValue: '$1.3M', status: 'Converted', bonusSent: true },
  { referrer: 'Taylor Build', referred: 'Kim Custom Home', projectValue: '$950K', status: 'In Progress', bonusSent: false },
  { referrer: 'Wilson Reno', referred: 'Adams Project', projectValue: '$380K', status: 'In Progress', bonusSent: false },
]

// ── Component ──────────────────────────────────────────────────────────

export function PostBuildPreview(): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* ── Section 1: Dark Header ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Heart className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Post-Build Client Lifecycle</h1>
            <p className="text-sm text-slate-300">
              Warranty walkthroughs, maintenance programs, referral tracking, and lifetime client value
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {[
            { label: 'Active Home Care', value: '24' },
            { label: 'Upcoming Walkthroughs', value: '3' },
            { label: 'Referrals Generated', value: '8' },
            { label: 'Lifetime Client Value', value: '$3.15M avg' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Walkthrough Schedule ─────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Walkthrough Schedule</h2>
          <span className="text-xs text-stone-500">3 upcoming</span>
        </div>

        <div className="space-y-3">
          {walkthroughs.map((wt, i) => (
            <div key={wt.id} className="flex items-start gap-4">
              {/* Timeline dot and line */}
              <div className="flex flex-col items-center pt-1">
                <div className={cn(
                  'w-3 h-3 rounded-full border-2 flex-shrink-0',
                  wt.type === '30-day' ? 'border-blue-500 bg-blue-500' :
                  wt.type === '11-month' ? 'border-amber-500 bg-amber-500' :
                  'border-purple-500 bg-purple-500'
                )} />
                {i < walkthroughs.length - 1 && (
                  <div className="w-px h-full min-h-[40px] bg-stone-200 mt-1" />
                )}
              </div>

              {/* Card */}
              <div className="flex-1 rounded-lg border border-stone-200 p-3 bg-stone-50/50">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-stone-900">{wt.title}</span>
                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', wt.statusColor)}>
                    {wt.type === '30-day' ? '30-Day' : wt.type === '11-month' ? '11-Month' : '2-Year'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Home className="h-3 w-3 text-stone-400" />
                  <span className="text-xs text-stone-700">{wt.clientName}</span>
                  <span className="text-xs text-stone-400">|</span>
                  <Clock className="h-3 w-3 text-stone-400" />
                  <span className="text-xs text-stone-500">{wt.date}</span>
                </div>
                <p className="text-xs text-stone-500 mt-1">{wt.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 3: 30-Day Walkthrough Demo ─────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-stone-500" />
            <h2 className="text-sm font-semibold text-stone-900">30-Day Walkthrough — Smith Residence</h2>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[10px] font-medium text-emerald-700">3 of 5 resolved</span>
          </div>
        </div>

        <div className="text-xs text-stone-500 mb-3">
          Client pre-submitted 5 items via their portal before the walkthrough
        </div>

        <div className="space-y-2">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                'rounded-lg border p-3',
                item.resolved
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-amber-200 bg-amber-50/30'
              )}
            >
              <div className="flex items-start gap-2">
                {item.resolved ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      'text-xs font-medium',
                      item.resolved ? 'text-stone-900' : 'text-stone-900'
                    )}>
                      {item.description}
                    </span>
                    {item.resolved ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                        Resolved
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">{item.note}</p>
                  {item.assignee && (
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-400">
                      <Wrench className="h-3 w-3" />
                      <span>Assigned to {item.assignee}</span>
                      {item.dueDate && (
                        <>
                          <span>|</span>
                          <Clock className="h-3 w-3" />
                          <span>Due {item.dueDate}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: Seasonal Maintenance Program ────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ThermometerSun className="h-4 w-4 text-stone-500" />
            <h2 className="text-sm font-semibold text-stone-900">Seasonal Maintenance Program</h2>
          </div>
          <span className="text-xs text-stone-500">Auto-sent to homeowners each quarter</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {seasonalCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.season}
                className={cn(
                  'rounded-lg border p-4 space-y-3',
                  card.bgColor,
                  card.borderColor
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn('h-5 w-5', card.color)} />
                  <span className={cn('text-sm font-semibold', card.color)}>{card.season}</span>
                </div>
                <ul className="space-y-1.5">
                  {card.tasks.map((task, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                      <CheckCircle className="h-3 w-3 text-stone-400 mt-0.5 flex-shrink-0" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Section 5: Client Lifetime Value Tracker ────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Client Lifetime Value Tracker</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clientValues.map((client) => (
            <div key={client.name} className="rounded-lg border border-stone-200 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold',
                  client.color
                )}>
                  {client.initials}
                </div>
                <div>
                  <div className="text-sm font-medium text-stone-900">{client.name}</div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-3 w-3',
                          i < client.googleRating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-200'
                        )}
                      />
                    ))}
                    <span className="text-[10px] text-stone-400 ml-1">Google</span>
                  </div>
                </div>
              </div>

              {/* Value breakdown */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Home Value</span>
                  <span className="font-medium text-stone-900">{client.homeValue}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Referrals ({client.referrals})</span>
                  <span className="font-medium text-stone-900">{client.referralValue}</span>
                </div>
                {client.additionalValue && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Additional</span>
                    <span className="font-medium text-stone-500 italic">{client.additionalValue}</span>
                  </div>
                )}
                <div className="border-t border-stone-200 pt-1.5 mt-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-700">Lifetime Value</span>
                    <span className="text-sm font-bold text-amber-700">{client.totalLifetimeValue}</span>
                  </div>
                </div>
              </div>

              {/* Extras */}
              <div className="space-y-1">
                {client.extras.map((extra, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-stone-500">
                    <CheckCircle className="h-2.5 w-2.5 text-stone-400 flex-shrink-0" />
                    {extra}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 6: Referral Program ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Referral Program</h2>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-center">
            <div className="text-xl font-bold text-stone-900">8</div>
            <div className="text-[10px] text-stone-500">Referrals This Year</div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
            <div className="text-xl font-bold text-emerald-700">4 Converted</div>
            <div className="text-[10px] text-emerald-600">$3.2M Pipeline</div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
            <div className="text-xl font-bold text-amber-700">50%</div>
            <div className="text-[10px] text-amber-600">Conversion Rate</div>
          </div>
        </div>

        {/* Referral table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200">
                <th scope="col" className="text-left py-2 px-3 font-semibold text-stone-700">Referrer</th>
                <th scope="col" className="text-left py-2 px-3 font-semibold text-stone-700">Referred Client</th>
                <th scope="col" className="text-right py-2 px-3 font-semibold text-stone-700">Project Value</th>
                <th scope="col" className="text-center py-2 px-3 font-semibold text-stone-700">Status</th>
                <th scope="col" className="text-center py-2 px-3 font-semibold text-stone-700">Bonus</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((ref, i) => (
                <tr key={i} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="py-2 px-3 font-medium text-stone-900">{ref.referrer}</td>
                  <td className="py-2 px-3 text-stone-700">{ref.referred}</td>
                  <td className="py-2 px-3 text-right text-stone-700">{ref.projectValue}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] font-medium',
                      ref.status === 'Converted' ? 'bg-emerald-100 text-emerald-700' :
                      ref.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    )}>
                      {ref.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    {ref.bonusSent ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-[10px] text-stone-400">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 7: Home Maintenance Knowledge Base ──────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Home Maintenance Knowledge Base</h2>
          <span className="text-xs text-stone-500">Personalized per client</span>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            defaultValue="How do I maintain quartz countertops?"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
            readOnly
          />
        </div>

        {/* Mock answer */}
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-800">Personalized Answer — Smith Residence</span>
          </div>
          <div className="space-y-2 text-xs text-stone-700">
            <p>
              Your kitchen features <strong>Caesarstone Calacatta Nuvo</strong> quartz countertops
              (installed Jan 2026, Selection #S-2026-047). Here is how to care for them:
            </p>
            <ul className="space-y-1.5 ml-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Daily cleaning:</strong> Mild soap and warm water with a soft cloth. Avoid abrasive cleaners.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Stain prevention:</strong> Wipe spills immediately. Quartz is non-porous but prolonged exposure to dyes can discolor.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Heat protection:</strong> Always use trivets. Direct heat above 300 degrees F can damage the resin.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Warranty:</strong> Covered under Caesarstone lifetime residential warranty (registered Feb 2026).</span>
              </li>
            </ul>
          </div>
          <div className="mt-3 pt-2 border-t border-amber-200">
            <p className="text-[10px] text-amber-600 italic">
              This answer is personalized based on your actual installed materials and selections from your project.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 8: AI Insights Bar ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 rounded-xl border border-amber-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">Post-Build Intelligence</span>
        </div>
        <p className="text-xs text-amber-700 leading-relaxed">
          24 active home care clients. 3 walkthroughs scheduled this quarter. 8 referrals generated
          with 50% conversion rate ($3.2M pipeline). Average lifetime client value is $3.15M when
          including referrals. Davis Family has no referrals yet — AI recommends a check-in call
          at the 6-month mark to nurture the relationship.
        </p>
      </div>

      {/* ── Section 9: AI Features Panel ───────────────────────────── */}
      <AIFeaturesPanel
        title="Post-Build AI Features"
        columns={2}
        features={[
          {
            feature: 'Walkthrough Scheduling AI',
            insight: 'Auto-schedules 30-day, 11-month, and 2-year walkthroughs based on project completion date. Sends prep checklists to clients.',
            confidence: 96,
            severity: 'success',
          },
          {
            feature: 'Maintenance Prediction',
            insight: 'Predicts maintenance needs based on installed materials, local climate, and building age. Generates personalized seasonal guides.',
            confidence: 88,
            severity: 'success',
          },
          {
            feature: 'Referral Timing Optimization',
            insight: 'Identifies optimal moments to request referrals based on client satisfaction signals and project milestones.',
            confidence: 82,
            severity: 'success',
          },
          {
            feature: 'Client Satisfaction Prediction',
            insight: 'Monitors walkthrough feedback, response times, and engagement to predict satisfaction scores before formal surveys.',
            severity: 'info',
          },
          {
            feature: 'Warranty Pattern Detection',
            insight: 'Identifies recurring warranty issues across projects to improve future construction quality. Currently tracking nail pops and caulk gaps.',
            severity: 'warning',
          },
          {
            feature: 'Lifetime Value Calculation',
            insight: 'Tracks total revenue per client including home build, referrals, remodels, and maintenance contracts. Updates in real-time.',
            confidence: 94,
            severity: 'success',
          },
        ]}
      />
    </div>
  )
}
