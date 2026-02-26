'use client'

import {
  Users,
  Briefcase,
  Award,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
  GraduationCap,
  UserPlus,
  ClipboardCheck,
  Sparkles,
  Brain,
  Shield,
  Truck,
  HardHat,
  ArrowRight,
  Target,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ── Types ─────────────────────────────────────────────────────────────

interface OrgPerson {
  name: string
  role: string
  initials: string
  color: string
  jobCount?: number
  children?: OrgPerson[]
}

interface HiringPosition {
  title: string
  stages: {
    posted: boolean
    applicants: number
    interviews: number
    offer: number
    hired: number
  }
  topApplicants: { name: string; date: string; rating: number }[]
}

interface CertRow {
  name: string
  role: string
  osha10: { date: string; status: 'current' | 'expiring' | 'expired' }
  osha30: { date: string; status: 'current' | 'expiring' | 'expired' | 'na' }
  firstAid: { date: string; status: 'current' | 'expiring' | 'expired' }
  forklift: { date: string; status: 'current' | 'expiring' | 'expired' | 'na' }
  fallProtection: { date: string; status: 'current' | 'expiring' | 'expired' }
  leadSafe: { date: string; status: 'current' | 'expiring' | 'expired' | 'na' }
  stateLicense: { date: string; status: 'current' | 'expiring' | 'expired' | 'na' }
}

interface PerformanceReview {
  employee: string
  role: string
  initials: string
  color: string
  status: 'completed' | 'due'
  rating?: number
  summary?: string
  dueDate?: string
  categories?: { name: string; score: number }[]
}

interface WorkloadEntry {
  name: string
  role: string
  activeJobs: number
  totalValue: string
  hoursPerWeek: number
  capacity: number
}

interface CompBenchmark {
  role: string
  yourSalary: string
  marketAvg: string
  variance: string
  direction: 'above' | 'below' | 'at'
  risk?: string
}

// ── Mock Data ─────────────────────────────────────────────────────────

const orgChart: OrgPerson = {
  name: 'Jake Ross',
  role: 'Owner',
  initials: 'JR',
  color: 'bg-amber-100 text-amber-700',
  jobCount: 8,
  children: [
    {
      name: 'Sarah Kim',
      role: 'Project Manager',
      initials: 'SK',
      color: 'bg-blue-100 text-blue-700',
      jobCount: 2,
      children: [
        {
          name: 'Carlos Martinez',
          role: 'Superintendent',
          initials: 'CM',
          color: 'bg-emerald-100 text-emerald-700',
          jobCount: 2,
          children: [
            { name: 'Tony Alvarez', role: 'Field Worker', initials: 'TA', color: 'bg-stone-100 text-stone-700', jobCount: 1 },
            { name: 'Danny Nguyen', role: 'Field Worker', initials: 'DN', color: 'bg-stone-100 text-stone-700', jobCount: 1 },
            { name: 'Leo Cruz', role: 'Field Worker', initials: 'LC', color: 'bg-stone-100 text-stone-700', jobCount: 1 },
          ],
        },
        {
          name: 'Ray Thompson',
          role: 'Superintendent',
          initials: 'RT',
          color: 'bg-emerald-100 text-emerald-700',
          jobCount: 1,
          children: [
            { name: 'Hector Diaz', role: 'Field Worker', initials: 'HD', color: 'bg-stone-100 text-stone-700', jobCount: 1 },
            { name: 'James Park', role: 'Field Worker', initials: 'JP', color: 'bg-stone-100 text-stone-700', jobCount: 1 },
            { name: 'Omar Solis', role: 'Field Worker', initials: 'OS', color: 'bg-stone-100 text-stone-700', jobCount: 1 },
            { name: 'Ben Walker', role: 'Field Worker', initials: 'BW', color: 'bg-stone-100 text-stone-700', jobCount: 1 },
          ],
        },
      ],
    },
    {
      name: 'Mike Chen',
      role: 'Estimator / Admin',
      initials: 'MC',
      color: 'bg-purple-100 text-purple-700',
      jobCount: 3,
    },
  ],
}

const hiringPositions: HiringPosition[] = [
  {
    title: 'Project Manager',
    stages: { posted: true, applicants: 5, interviews: 2, offer: 1, hired: 0 },
    topApplicants: [
      { name: 'Allison Reeves', date: '2026-02-10', rating: 4 },
      { name: 'Marcus Webb', date: '2026-02-12', rating: 5 },
      { name: 'Diana Flores', date: '2026-02-14', rating: 3 },
    ],
  },
  {
    title: 'Field Supervisor',
    stages: { posted: true, applicants: 3, interviews: 1, offer: 0, hired: 0 },
    topApplicants: [
      { name: 'Greg Patterson', date: '2026-02-11', rating: 4 },
      { name: 'Tommy Lin', date: '2026-02-15', rating: 3 },
    ],
  },
]

const certifications: CertRow[] = [
  {
    name: 'Carlos Martinez',
    role: 'Superintendent',
    osha10: { date: '2025-06-15', status: 'current' },
    osha30: { date: '2025-06-15', status: 'current' },
    firstAid: { date: '2026-02-28', status: 'expiring' },
    forklift: { date: '2025-09-10', status: 'current' },
    fallProtection: { date: '2025-11-20', status: 'current' },
    leadSafe: { date: '2025-08-05', status: 'current' },
    stateLicense: { date: '2027-01-01', status: 'current' },
  },
  {
    name: 'Tony Alvarez',
    role: 'Field Worker',
    osha10: { date: '2025-04-20', status: 'current' },
    osha30: { date: '', status: 'na' },
    firstAid: { date: '2025-12-10', status: 'current' },
    forklift: { date: '2026-03-01', status: 'expiring' },
    fallProtection: { date: '2025-08-15', status: 'current' },
    leadSafe: { date: '', status: 'na' },
    stateLicense: { date: '', status: 'na' },
  },
  {
    name: 'Danny Nguyen',
    role: 'Field Worker',
    osha10: { date: '2025-03-10', status: 'current' },
    osha30: { date: '', status: 'na' },
    firstAid: { date: '2025-11-05', status: 'current' },
    forklift: { date: '', status: 'na' },
    fallProtection: { date: '2026-01-15', status: 'expired' },
    leadSafe: { date: '2025-07-20', status: 'current' },
    stateLicense: { date: '', status: 'na' },
  },
  {
    name: 'Ray Thompson',
    role: 'Superintendent',
    osha10: { date: '2025-05-22', status: 'current' },
    osha30: { date: '2025-05-22', status: 'current' },
    firstAid: { date: '2025-10-30', status: 'current' },
    forklift: { date: '2025-10-30', status: 'current' },
    fallProtection: { date: '2025-09-01', status: 'current' },
    leadSafe: { date: '2025-06-15', status: 'current' },
    stateLicense: { date: '2026-03-10', status: 'expiring' },
  },
  {
    name: 'Hector Diaz',
    role: 'Field Worker',
    osha10: { date: '2025-07-14', status: 'current' },
    osha30: { date: '', status: 'na' },
    firstAid: { date: '2025-12-20', status: 'current' },
    forklift: { date: '2025-11-15', status: 'current' },
    fallProtection: { date: '2025-10-10', status: 'current' },
    leadSafe: { date: '', status: 'na' },
    stateLicense: { date: '', status: 'na' },
  },
]

const reviews: PerformanceReview[] = [
  {
    employee: 'Sarah Kim',
    role: 'Project Manager',
    initials: 'SK',
    color: 'bg-blue-100 text-blue-700',
    status: 'completed',
    rating: 4.5,
    summary: 'Exceptional project management. Delivered 2 projects under budget and ahead of schedule. Strong client communication.',
    categories: [
      { name: 'Quality of Work', score: 5 },
      { name: 'Communication', score: 4 },
      { name: 'Reliability', score: 5 },
      { name: 'Leadership', score: 4 },
    ],
  },
  {
    employee: 'Carlos Martinez',
    role: 'Superintendent',
    initials: 'CM',
    color: 'bg-emerald-100 text-emerald-700',
    status: 'due',
    dueDate: '2026-02-28',
    categories: [
      { name: 'Quality of Work', score: 0 },
      { name: 'Communication', score: 0 },
      { name: 'Reliability', score: 0 },
      { name: 'Leadership', score: 0 },
    ],
  },
]

const workload: WorkloadEntry[] = [
  { name: 'Jake Ross', role: 'Owner', activeJobs: 6, totalValue: '$5.2M', hoursPerWeek: 47, capacity: 150 },
  { name: 'Sarah Kim', role: 'PM', activeJobs: 2, totalValue: '$1.4M', hoursPerWeek: 38, capacity: 95 },
]

const compensation: CompBenchmark[] = [
  { role: 'Project Manager', yourSalary: '$85,000', marketAvg: '$92,000', variance: '-8%', direction: 'below' },
  { role: 'Estimator', yourSalary: '$72,000', marketAvg: '$71,000', variance: '+1%', direction: 'above' },
  { role: 'Superintendent', yourSalary: '$68,000', marketAvg: '$77,000', variance: '-12%', direction: 'below', risk: 'Retention risk' },
]

// ── Helper Components ──────────────────────────────────────────────────

function CertStatusBadge({ status }: { status: 'current' | 'expiring' | 'expired' | 'na' }) {
  if (status === 'na') {
    return <span className="text-[10px] text-stone-400">N/A</span>
  }
  const config = {
    current: 'bg-emerald-100 text-emerald-700',
    expiring: 'bg-amber-100 text-amber-700',
    expired: 'bg-red-100 text-red-700',
  }
  const labels = {
    current: 'Current',
    expiring: 'Expiring',
    expired: 'Expired',
  }
  return (
    <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', config[status])}>
      {labels[status]}
    </span>
  )
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3 w-3',
            i < rating ? 'text-amber-500 fill-amber-500' : 'text-stone-200'
          )}
        />
      ))}
    </div>
  )
}

function OrgCard({ person, level = 0 }: { person: OrgPerson; level?: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className={cn(
        'rounded-lg border border-stone-200 bg-white p-3 text-center min-w-[120px] shadow-sm',
        level === 0 && 'border-amber-300 bg-amber-50/50'
      )}>
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold mx-auto',
          person.color
        )}>
          {person.initials}
        </div>
        <div className="text-xs font-medium text-stone-900 mt-1.5">{person.name}</div>
        <div className="text-[10px] text-stone-500">{person.role}</div>
        {person.jobCount !== undefined && (
          <div className="text-[10px] text-stone-400 mt-0.5">{person.jobCount} job{person.jobCount !== 1 ? 's' : ''}</div>
        )}
      </div>
      {person.children && person.children.length > 0 && (
        <>
          <div className="w-px h-4 bg-stone-300" />
          <div className="flex gap-3 flex-wrap justify-center">
            {person.children.map((child) => (
              <OrgCard key={child.name} person={child} level={level + 1} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────

export function HrWorkforcePreview(): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* ── Section 1: Dark Header ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Users className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">HR & Workforce Management</h1>
            <p className="text-sm text-slate-300">
              Org chart, hiring, training, performance reviews, and workload balancing
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {[
            { label: 'Team Size', value: '14' },
            { label: 'Open Positions', value: '2' },
            { label: 'Certifications Expiring', value: '3' },
            { label: 'Avg Tenure', value: '3.2 yrs' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Org Chart ───────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Organization Chart</h2>
          <span className="text-xs text-stone-500">14 team members</span>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px] flex justify-center py-2">
            <OrgCard person={orgChart} />
          </div>
        </div>
      </div>

      {/* ── Section 3: Hiring Pipeline ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-stone-500" />
            <h2 className="text-sm font-semibold text-stone-900">Hiring Pipeline</h2>
            <span className="text-xs text-stone-500">2 open positions</span>
          </div>
        </div>

        <div className="space-y-4">
          {hiringPositions.map((pos) => (
            <div key={pos.title} className="border border-stone-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-stone-900">{pos.title}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                  Active
                </span>
              </div>

              {/* Kanban stages */}
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: 'Posted', value: pos.stages.posted ? 1 : 0, color: 'bg-stone-100 border-stone-200 text-stone-700' },
                  { label: 'Applicants', value: pos.stages.applicants, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                  { label: 'Interviews', value: pos.stages.interviews, color: 'bg-purple-50 border-purple-200 text-purple-700' },
                  { label: 'Offer', value: pos.stages.offer, color: 'bg-amber-50 border-amber-200 text-amber-700' },
                  { label: 'Hired', value: pos.stages.hired, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                ].map((stage, i) => (
                  <div key={stage.label} className="flex flex-col items-center">
                    {i > 0 && (
                      <div className="hidden md:block absolute -left-2">
                        <ArrowRight className="h-3 w-3 text-stone-300" />
                      </div>
                    )}
                    <div className={cn('rounded-lg border p-2 text-center w-full', stage.color)}>
                      <div className="text-lg font-bold">{stage.value}</div>
                      <div className="text-[10px] font-medium">{stage.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top applicants */}
              {pos.topApplicants.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                    Top Applicants
                  </div>
                  {pos.topApplicants.map((app) => (
                    <div
                      key={app.name}
                      className="flex items-center justify-between py-1.5 px-2 bg-stone-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-semibold text-stone-600">
                          {app.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-xs font-medium text-stone-900">{app.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-stone-500">{app.date}</span>
                        <StarRating rating={app.rating} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: Training & Certification Tracker ────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-stone-500" />
            <h2 className="text-sm font-semibold text-stone-900">Training & Certification Tracker</h2>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-[10px] font-medium text-amber-700">3 certifications expiring</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200">
                <th scope="col" className="text-left py-2 px-2 font-semibold text-stone-700">Employee</th>
                <th scope="col" className="text-center py-2 px-2 font-semibold text-stone-700">OSHA 10</th>
                <th scope="col" className="text-center py-2 px-2 font-semibold text-stone-700">OSHA 30</th>
                <th scope="col" className="text-center py-2 px-2 font-semibold text-stone-700">First Aid</th>
                <th scope="col" className="text-center py-2 px-2 font-semibold text-stone-700">Forklift</th>
                <th scope="col" className="text-center py-2 px-2 font-semibold text-stone-700">Fall Prot.</th>
                <th scope="col" className="text-center py-2 px-2 font-semibold text-stone-700">Lead-Safe</th>
                <th scope="col" className="text-center py-2 px-2 font-semibold text-stone-700">State Lic.</th>
              </tr>
            </thead>
            <tbody>
              {certifications.map((cert) => (
                <tr key={cert.name} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="py-2 px-2">
                    <div className="font-medium text-stone-900">{cert.name}</div>
                    <div className="text-[10px] text-stone-500">{cert.role}</div>
                  </td>
                  <td className="text-center py-2 px-2"><CertStatusBadge status={cert.osha10.status} /></td>
                  <td className="text-center py-2 px-2"><CertStatusBadge status={cert.osha30.status} /></td>
                  <td className="text-center py-2 px-2"><CertStatusBadge status={cert.firstAid.status} /></td>
                  <td className="text-center py-2 px-2"><CertStatusBadge status={cert.forklift.status} /></td>
                  <td className="text-center py-2 px-2"><CertStatusBadge status={cert.fallProtection.status} /></td>
                  <td className="text-center py-2 px-2"><CertStatusBadge status={cert.leadSafe.status} /></td>
                  <td className="text-center py-2 px-2"><CertStatusBadge status={cert.stateLicense.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 5: Performance Reviews ─────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardCheck className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Performance Reviews</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <div
              key={review.employee}
              className={cn(
                'rounded-lg border p-4',
                review.status === 'completed'
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-amber-200 bg-amber-50/30'
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold',
                  review.color
                )}>
                  {review.initials}
                </div>
                <div>
                  <div className="text-sm font-medium text-stone-900">{review.employee}</div>
                  <div className="text-[10px] text-stone-500">{review.role}</div>
                </div>
                <div className="ml-auto">
                  {review.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                      <CheckCircle className="h-3 w-3" />
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">
                      <Clock className="h-3 w-3" />
                      Due {review.dueDate}
                    </span>
                  )}
                </div>
              </div>

              {review.status === 'completed' && review.rating && (
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-stone-600">Overall Rating:</span>
                    <span className="text-sm font-bold text-amber-700">{review.rating}/5</span>
                    <StarRating rating={Math.round(review.rating)} />
                  </div>
                  <p className="text-xs text-stone-600 italic">&ldquo;{review.summary}&rdquo;</p>
                </div>
              )}

              {review.categories && (
                <div className="space-y-1.5 mt-3">
                  <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                    Categories
                  </div>
                  {review.categories.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <span className="text-xs text-stone-600 w-28 flex-shrink-0">{cat.name}</span>
                      {review.status === 'completed' ? (
                        <>
                          <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${(cat.score / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-stone-500 w-6 text-right">{cat.score}/5</span>
                        </>
                      ) : (
                        <div className="flex-1 h-1.5 bg-stone-200 rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 6: Workload Balancer ────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Workload Balancer</h2>
        </div>

        <div className="space-y-4">
          {workload.map((person) => (
            <div key={person.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-stone-900">{person.name}</span>
                  <span className="text-xs text-stone-500">({person.role})</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-stone-600">
                  <span>{person.activeJobs} active jobs</span>
                  <span>{person.totalValue}</span>
                  <span>{person.hoursPerWeek} hrs/wk</span>
                  <span className={cn(
                    'px-1.5 py-0.5 rounded font-medium',
                    person.capacity > 100
                      ? 'bg-red-100 text-red-700'
                      : 'bg-emerald-100 text-emerald-700'
                  )}>
                    {person.capacity}%
                  </span>
                </div>
              </div>
              <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    person.capacity > 100 ? 'bg-red-500' : 'bg-emerald-500'
                  )}
                  style={{ width: `${Math.min(person.capacity, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* AI Suggestion */}
        <div className="mt-4 bg-amber-50 rounded-lg border border-amber-200 p-3">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-xs font-medium text-amber-800">AI Suggestion:</span>
              <p className="text-xs text-amber-700 mt-0.5">
                Redistribute workload? Jake is at 150% capacity with 6 active jobs.
                Sarah has bandwidth for 1-2 more projects. Consider reassigning the
                Henderson Residence or Davis Coastal Home.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 7: Compensation Benchmarking ───────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Compensation Benchmarking</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200">
                <th scope="col" className="text-left py-2 px-3 font-semibold text-stone-700">Role</th>
                <th scope="col" className="text-right py-2 px-3 font-semibold text-stone-700">Your Salary</th>
                <th scope="col" className="text-right py-2 px-3 font-semibold text-stone-700">Market Avg</th>
                <th scope="col" className="text-center py-2 px-3 font-semibold text-stone-700">Variance</th>
                <th scope="col" className="text-left py-2 px-3 font-semibold text-stone-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {compensation.map((comp) => (
                <tr key={comp.role} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="py-2.5 px-3 font-medium text-stone-900">{comp.role}</td>
                  <td className="py-2.5 px-3 text-right text-stone-700">{comp.yourSalary}</td>
                  <td className="py-2.5 px-3 text-right text-stone-700">{comp.marketAvg}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-medium',
                      comp.direction === 'below'
                        ? 'bg-red-100 text-red-700'
                        : comp.direction === 'above'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-stone-100 text-stone-700'
                    )}>
                      {comp.direction === 'below' ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : (
                        <TrendingUp className="h-3 w-3" />
                      )}
                      {comp.variance}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {comp.risk ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">
                        <AlertTriangle className="h-3 w-3" />
                        {comp.risk}
                      </span>
                    ) : comp.direction === 'above' ? (
                      <span className="text-[10px] text-emerald-600">Above market</span>
                    ) : (
                      <span className="text-[10px] text-stone-500">Below market</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 8: AI Insights Bar ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 rounded-xl border border-amber-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">HR Intelligence</span>
        </div>
        <p className="text-xs text-amber-700 leading-relaxed">
          14 team members tracked. 3 certifications expiring within 30 days. 2 open positions with
          8 total applicants. Jake Ross is at 150% capacity — redistribution recommended. Superintendent
          compensation is 12% below market average, flagging retention risk.
        </p>
      </div>

      {/* ── Section 9: AI Features Panel ───────────────────────────── */}
      <AIFeaturesPanel
        title="HR & Workforce AI Features"
        columns={2}
        features={[
          {
            feature: 'Workload Prediction',
            insight: 'Forecasts team capacity needs based on upcoming project starts, milestones, and historical patterns.',
            confidence: 89,
            severity: 'success',
          },
          {
            feature: 'Retention Risk Scoring',
            insight: 'Identifies at-risk employees based on compensation gaps, workload, tenure, and market conditions.',
            confidence: 85,
            severity: 'warning',
          },
          {
            feature: 'Training Compliance Alerts',
            insight: '3 certifications expiring within 30 days. Auto-schedules renewal reminders and tracks completion.',
            severity: 'warning',
          },
          {
            feature: 'Hiring Pipeline Analytics',
            insight: 'Tracks time-to-hire, applicant quality scores, and source effectiveness across all open positions.',
            confidence: 92,
            severity: 'success',
          },
          {
            feature: 'Performance Trend Analysis',
            insight: 'Analyzes review scores over time, identifies coaching opportunities and promotion readiness.',
            confidence: 87,
            severity: 'success',
          },
          {
            feature: 'Compensation Insights',
            insight: 'Benchmarks salaries against regional market data. Flags retention risks when pay falls 10%+ below average.',
            severity: 'info',
          },
        ]}
      />
    </div>
  )
}
