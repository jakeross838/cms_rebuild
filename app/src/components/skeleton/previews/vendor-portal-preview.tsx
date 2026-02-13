'use client'

import { useState } from 'react'
import {
  Home,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Upload,
  TrendingUp,
  ChevronRight,
  Shield,
  Receipt,
  Sparkles,
  Package,
  FileCheck,
  Calendar,
  CalendarClock,
  ClipboardList,
  Wrench,
  Camera,
  PenTool,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  XCircle,
  MoreHorizontal,
  Users,
  MapPin,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BuilderRelationshipStatus = 'approved' | 'pending_approval' | 'suspended'
type ComplianceStatus = 'green' | 'yellow' | 'red'
type POStatus = 'pending_acknowledgment' | 'acknowledged' | 'partially_received' | 'complete'
type InvoiceStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'scheduled' | 'paid' | 'rejected'
type LienWaiverStatus = 'pending_signature' | 'signed' | 'verified'
type BidStatus = 'open' | 'submitted' | 'awarded' | 'lost'
type ScheduleAckStatus = 'pending' | 'acknowledged' | 'reschedule_requested'

interface BuilderRelationship {
  id: string
  builderName: string
  status: BuilderRelationshipStatus
  complianceStatus: ComplianceStatus
  activeProjects: number
  paymentTerms: string
  prequalificationStatus: 'not_required' | 'pending' | 'approved' | 'expired'
}

interface VendorPO {
  id: string
  poNumber: string
  projectName: string
  builderName: string
  description: string
  amount: number
  deliveryDate: string
  status: POStatus
  lineItems: number
  changeOrders: number
}

interface VendorInvoice {
  id: string
  invoiceNumber: string
  projectName: string
  builderName: string
  poNumber: string
  amount: number
  retainageHeld: number
  netAmount: number
  status: InvoiceStatus
  submittedAt: string
  paidAt?: string
  paymentRef?: string
  rejectionReason?: string
}

interface VendorBid {
  id: string
  projectName: string
  builderName: string
  scope: string
  dueDate: string
  status: BidStatus
  estimatedValue: number
  documentsCount: number
  questionsCount: number
}

interface VendorScheduleTask {
  id: string
  projectName: string
  builderName: string
  taskDescription: string
  startDate: string
  endDate: string
  dependencies: string[]
  location: string
  acknowledgmentStatus: ScheduleAckStatus
}

interface ComplianceDocument {
  id: string
  type: 'coi' | 'business_license' | 'trade_license' | 'w9' | 'safety_cert' | 'bond' | 'workers_comp'
  fileName: string
  expirationDate?: string
  status: 'current' | 'expiring_soon' | 'expired' | 'missing'
  coverageAmount?: number
  policyNumber?: string
}

interface VendorLienWaiver {
  id: string
  projectName: string
  waiverType: 'conditional_progress' | 'unconditional_progress' | 'conditional_final' | 'unconditional_final'
  amount: number
  throughDate: string
  status: LienWaiverStatus
}

interface PunchItem {
  id: string
  projectName: string
  description: string
  location: string
  photos: number
  status: 'assigned' | 'in_progress' | 'completed'
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockBuilderRelationships: BuilderRelationship[] = [
  {
    id: '1',
    builderName: 'Coastal Custom Homes',
    status: 'approved',
    complianceStatus: 'green',
    activeProjects: 3,
    paymentTerms: 'Net 30',
    prequalificationStatus: 'approved',
  },
  {
    id: '2',
    builderName: 'Palmetto Builders',
    status: 'approved',
    complianceStatus: 'yellow',
    activeProjects: 1,
    paymentTerms: '2/10 Net 30',
    prequalificationStatus: 'not_required',
  },
  {
    id: '3',
    builderName: 'Lowcountry Luxury',
    status: 'pending_approval',
    complianceStatus: 'red',
    activeProjects: 0,
    paymentTerms: '-',
    prequalificationStatus: 'pending',
  },
]

const mockPOs: VendorPO[] = [
  {
    id: '1',
    poNumber: 'PO-2026-1847',
    projectName: 'Smith Residence',
    builderName: 'Coastal Custom Homes',
    description: 'Electrical Rough-in Package',
    amount: 15750,
    deliveryDate: '2026-02-28',
    status: 'pending_acknowledgment',
    lineItems: 12,
    changeOrders: 0,
  },
  {
    id: '2',
    poNumber: 'PO-2026-1823',
    projectName: 'Johnson Waterfront',
    builderName: 'Coastal Custom Homes',
    description: 'HVAC Installation - Main System',
    amount: 22400,
    deliveryDate: '2026-03-15',
    status: 'acknowledged',
    lineItems: 8,
    changeOrders: 1,
  },
  {
    id: '3',
    poNumber: 'PO-2026-1801',
    projectName: 'Davis Custom Home',
    builderName: 'Palmetto Builders',
    description: 'Electrical Service Upgrade',
    amount: 7100,
    deliveryDate: '2026-02-20',
    status: 'partially_received',
    lineItems: 5,
    changeOrders: 0,
  },
]

const mockInvoices: VendorInvoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2026-089',
    projectName: 'Smith Residence',
    builderName: 'Coastal Custom Homes',
    poNumber: 'PO-2026-1847',
    amount: 6200,
    retainageHeld: 620,
    netAmount: 5580,
    status: 'submitted',
    submittedAt: '2026-02-10',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2026-082',
    projectName: 'Johnson Waterfront',
    builderName: 'Coastal Custom Homes',
    poNumber: 'PO-2026-1823',
    amount: 8200,
    retainageHeld: 820,
    netAmount: 7380,
    status: 'approved',
    submittedAt: '2026-02-03',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2026-071',
    projectName: 'Smith Residence',
    builderName: 'Coastal Custom Homes',
    poNumber: 'PO-2026-1801',
    amount: 4150,
    retainageHeld: 415,
    netAmount: 3735,
    status: 'paid',
    submittedAt: '2026-01-20',
    paidAt: '2026-02-08',
    paymentRef: 'ACH-44892',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2026-065',
    projectName: 'Davis Custom Home',
    builderName: 'Palmetto Builders',
    poNumber: 'PO-2026-1801',
    amount: 3500,
    retainageHeld: 350,
    netAmount: 3150,
    status: 'rejected',
    submittedAt: '2026-01-28',
    rejectionReason: 'Missing certified payroll documentation',
  },
  {
    id: '5',
    invoiceNumber: 'INV-2026-058',
    projectName: 'Johnson Waterfront',
    builderName: 'Coastal Custom Homes',
    poNumber: 'PO-2026-1823',
    amount: 12450,
    retainageHeld: 1245,
    netAmount: 11205,
    status: 'paid',
    submittedAt: '2026-01-10',
    paidAt: '2026-01-25',
    paymentRef: 'CHK-10221',
  },
]

const mockBids: VendorBid[] = [
  {
    id: '1',
    projectName: 'Johnson Warehouse Expansion',
    builderName: 'Coastal Custom Homes',
    scope: 'Site excavation, grading, and foundation prep for 15,000 sq ft warehouse',
    dueDate: '2026-02-20',
    status: 'open',
    estimatedValue: 85000,
    documentsCount: 4,
    questionsCount: 2,
  },
  {
    id: '2',
    projectName: 'Beachfront Townhomes Ph 2',
    builderName: 'Palmetto Builders',
    scope: 'Electrical rough-in for 6-unit townhome complex',
    dueDate: '2026-02-25',
    status: 'open',
    estimatedValue: 42000,
    documentsCount: 7,
    questionsCount: 0,
  },
  {
    id: '3',
    projectName: 'Miller Custom Home',
    builderName: 'Coastal Custom Homes',
    scope: 'Full HVAC installation - 4,200 SF custom home',
    dueDate: '2026-01-30',
    status: 'awarded',
    estimatedValue: 28500,
    documentsCount: 3,
    questionsCount: 1,
  },
]

const mockScheduleTasks: VendorScheduleTask[] = [
  {
    id: '1',
    projectName: 'Smith Residence',
    builderName: 'Coastal Custom Homes',
    taskDescription: 'Electrical Rough-in - 2nd Floor',
    startDate: '2026-02-17',
    endDate: '2026-02-21',
    dependencies: ['Framing inspection pass'],
    location: '142 Oak Harbor Dr, Charleston SC',
    acknowledgmentStatus: 'acknowledged',
  },
  {
    id: '2',
    projectName: 'Johnson Waterfront',
    builderName: 'Coastal Custom Homes',
    taskDescription: 'HVAC Ductwork Installation',
    startDate: '2026-02-24',
    endDate: '2026-03-07',
    dependencies: ['Framing complete', 'Plumbing rough-in complete'],
    location: '88 Marsh View Ln, Mt Pleasant SC',
    acknowledgmentStatus: 'pending',
  },
  {
    id: '3',
    projectName: 'Davis Custom Home',
    builderName: 'Palmetto Builders',
    taskDescription: 'Panel Upgrade & Service Entrance',
    startDate: '2026-02-14',
    endDate: '2026-02-15',
    dependencies: ['Meter base installed by utility'],
    location: '310 Folly Rd, James Island SC',
    acknowledgmentStatus: 'reschedule_requested',
  },
]

const mockComplianceDocs: ComplianceDocument[] = [
  {
    id: '1',
    type: 'coi',
    fileName: 'General Liability Insurance 2026.pdf',
    expirationDate: '2026-02-20',
    status: 'expiring_soon',
    coverageAmount: 2000000,
    policyNumber: 'GL-882991',
  },
  {
    id: '2',
    type: 'workers_comp',
    fileName: 'Workers Comp Certificate.pdf',
    expirationDate: '2026-09-15',
    status: 'current',
    coverageAmount: 1000000,
    policyNumber: 'WC-445221',
  },
  {
    id: '3',
    type: 'w9',
    fileName: 'W-9 Form 2026.pdf',
    status: 'current',
  },
  {
    id: '4',
    type: 'trade_license',
    fileName: 'SC Electrical Contractor License.pdf',
    expirationDate: '2027-06-30',
    status: 'current',
    policyNumber: 'EL-29441',
  },
  {
    id: '5',
    type: 'bond',
    fileName: '',
    status: 'missing',
  },
  {
    id: '6',
    type: 'safety_cert',
    fileName: 'OSHA 30 Certificate.pdf',
    expirationDate: '2024-12-01',
    status: 'expired',
  },
]

const mockLienWaivers: VendorLienWaiver[] = [
  {
    id: '1',
    projectName: 'Smith Residence',
    waiverType: 'conditional_progress',
    amount: 6200,
    throughDate: '2026-02-10',
    status: 'pending_signature',
  },
  {
    id: '2',
    projectName: 'Johnson Waterfront',
    waiverType: 'unconditional_progress',
    amount: 12450,
    throughDate: '2026-01-25',
    status: 'signed',
  },
  {
    id: '3',
    projectName: 'Johnson Waterfront',
    waiverType: 'conditional_progress',
    amount: 8200,
    throughDate: '2026-02-03',
    status: 'verified',
  },
]

const mockPunchItems: PunchItem[] = [
  {
    id: '1',
    projectName: 'Davis Custom Home',
    description: 'Outlet cover plate missing in garage',
    location: 'Garage',
    photos: 1,
    status: 'assigned',
  },
  {
    id: '2',
    projectName: 'Smith Residence',
    description: 'GFCI outlet not functioning - master bath',
    location: 'Master Bathroom',
    photos: 2,
    status: 'in_progress',
  },
]

// ---------------------------------------------------------------------------
// Status Config
// ---------------------------------------------------------------------------

const invoiceStatusConfig: Record<InvoiceStatus, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: FileText },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  scheduled: { label: 'Scheduled', color: 'bg-purple-100 text-purple-700', icon: CalendarClock },
  paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
}

const complianceDocTypeLabels: Record<ComplianceDocument['type'], string> = {
  coi: 'Certificate of Insurance',
  business_license: 'Business License',
  trade_license: 'Trade License',
  w9: 'W-9 Form',
  safety_cert: 'Safety Certification',
  bond: 'Bonding Certificate',
  workers_comp: 'Workers Comp',
}

const complianceStatusConfig: Record<ComplianceDocument['status'], { label: string; color: string }> = {
  current: { label: 'Current', color: 'bg-green-100 text-green-700' },
  expiring_soon: { label: 'Expiring Soon', color: 'bg-amber-100 text-amber-700' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700' },
  missing: { label: 'Missing', color: 'bg-red-100 text-red-700' },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const today = new Date()
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VendorPortalPreview() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'schedule', label: 'Schedule', icon: Calendar, badge: 2 },
    { id: 'pos', label: 'Purchase Orders', icon: FileText, badge: mockPOs.filter(p => p.status === 'pending_acknowledgment').length },
    { id: 'invoices', label: 'Invoices', icon: DollarSign, badge: mockInvoices.filter(i => i.status === 'rejected').length, urgent: mockInvoices.some(i => i.status === 'rejected') },
    { id: 'bids', label: 'Bid Requests', icon: Package, badge: mockBids.filter(b => b.status === 'open').length, urgent: true },
    { id: 'lien_waivers', label: 'Lien Waivers', icon: PenTool, badge: mockLienWaivers.filter(l => l.status === 'pending_signature').length },
    { id: 'documents', label: 'Compliance', icon: Shield, badge: mockComplianceDocs.filter(d => d.status !== 'current').length },
    { id: 'punch', label: 'Punch Items', icon: ClipboardList, badge: mockPunchItems.filter(p => p.status !== 'completed').length },
  ]

  // Stats calculations
  const activePOs = mockPOs.filter(p => p.status !== 'complete').length
  const totalPOValue = mockPOs.reduce((sum, p) => sum + p.amount, 0)
  const pendingInvoiceAmount = mockInvoices.filter(i => i.status === 'submitted' || i.status === 'under_review' || i.status === 'approved').reduce((sum, i) => sum + i.netAmount, 0)
  const owedAmount = mockInvoices.filter(i => i.status === 'approved' || i.status === 'scheduled').reduce((sum, i) => sum + i.netAmount, 0)
  const totalPaidYTD = mockInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.netAmount, 0)
  const complianceOk = mockComplianceDocs.filter(d => d.status === 'current').length
  const complianceTotal = mockComplianceDocs.length
  const upcomingTasks = mockScheduleTasks.filter(t => t.acknowledgmentStatus !== 'reschedule_requested').length

  // Action required items
  const actionItems: string[] = []
  const openBids = mockBids.filter(b => b.status === 'open')
  if (openBids.length > 0) {
    actionItems.push(`${openBids.length} Bid Request${openBids.length > 1 ? 's' : ''} due - ${openBids[0].projectName} ${openBids[0].scope.substring(0, 40)}...`)
  }
  const expiringDocs = mockComplianceDocs.filter(d => d.status === 'expiring_soon')
  if (expiringDocs.length > 0) {
    actionItems.push(`Insurance Certificate expires in ${getDaysUntil(expiringDocs[0].expirationDate!)} days - Upload renewal`)
  }
  const pendingAckPOs = mockPOs.filter(p => p.status === 'pending_acknowledgment')
  if (pendingAckPOs.length > 0) {
    actionItems.push(`${pendingAckPOs.length} PO${pendingAckPOs.length > 1 ? 's' : ''} awaiting acknowledgment`)
  }
  const pendingWaivers = mockLienWaivers.filter(l => l.status === 'pending_signature')
  if (pendingWaivers.length > 0) {
    actionItems.push(`${pendingWaivers.length} Lien waiver${pendingWaivers.length > 1 ? 's' : ''} pending signature`)
  }
  const pendingScheduleAcks = mockScheduleTasks.filter(t => t.acknowledgmentStatus === 'pending')
  if (pendingScheduleAcks.length > 0) {
    actionItems.push(`${pendingScheduleAcks.length} schedule task${pendingScheduleAcks.length > 1 ? 's' : ''} need acknowledgment`)
  }
  const rejectedInvoices = mockInvoices.filter(i => i.status === 'rejected')
  if (rejectedInvoices.length > 0) {
    actionItems.push(`${rejectedInvoices.length} invoice${rejectedInvoices.length > 1 ? 's' : ''} rejected - review and resubmit`)
  }
  const missingDocs = mockComplianceDocs.filter(d => d.status === 'missing')
  if (missingDocs.length > 0) {
    actionItems.push(`${missingDocs.length} required compliance document${missingDocs.length > 1 ? 's' : ''} missing`)
  }

  return (
    <div className="bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
      {/* Vendor Portal Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Vendor Portal</h1>
              <p className="text-sm text-blue-100">ABC Electric & Mechanical</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Welcome, James Miller</p>
            <div className="flex items-center gap-2 justify-end mt-0.5">
              <span className="text-xs text-blue-200">Trades: Electrical, HVAC</span>
              <span className="text-blue-400">|</span>
              <span className="text-xs text-blue-200">{mockBuilderRelationships.filter(b => b.status === 'approved').length} Active Builders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Builder Selector */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-2">
        <div className="flex items-center gap-3 text-sm">
          <Building2 className="h-4 w-4 text-blue-600" />
          <span className="text-blue-700 font-medium">Builder Relationships:</span>
          <div className="flex items-center gap-2 flex-wrap">
            {mockBuilderRelationships.map(rel => (
              <span
                key={rel.id}
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1',
                  rel.status === 'approved' ? 'bg-green-100 text-green-700' :
                  rel.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                )}
              >
                <span className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  rel.complianceStatus === 'green' ? 'bg-green-500' :
                  rel.complianceStatus === 'yellow' ? 'bg-amber-500' : 'bg-red-500'
                )} />
                {rel.builderName}
                {rel.status === 'pending_approval' && ' (Pending)'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Required Alert */}
      {actionItems.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">Action Required ({actionItems.length})</h3>
              <ul className="text-sm text-amber-800 space-y-1">
                {actionItems.map((item, idx) => (
                  <li key={idx}>&#x2022; {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-6 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-blue-600 uppercase">Active POs</p>
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">{activePOs}</p>
            <p className="text-xs text-blue-700 mt-1">Value: {formatCurrency(totalPOValue)}</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-orange-600 uppercase">Pending Invoices</p>
              <Receipt className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-900">{mockInvoices.filter(i => ['submitted', 'under_review'].includes(i.status)).length}</p>
            <p className="text-xs text-orange-700 mt-1">{formatCurrency(pendingInvoiceAmount)}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-green-600 uppercase">Owed to You</p>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">{formatCurrency(owedAmount)}</p>
            <p className="text-xs text-green-700 mt-1">Paid YTD: {formatCurrency(totalPaidYTD)}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-purple-600 uppercase">Compliance</p>
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900">{complianceOk}/{complianceTotal}</p>
            <p className="text-xs text-purple-700 mt-1">documents current</p>
          </div>

          <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-200">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-cyan-600 uppercase">Schedule</p>
              <Calendar className="h-4 w-4 text-cyan-600" />
            </div>
            <p className="text-2xl font-bold text-cyan-900">{upcomingTasks}</p>
            <p className="text-xs text-cyan-700 mt-1">upcoming tasks</p>
          </div>

          <div className="bg-rose-50 rounded-lg p-3 border border-rose-200">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-rose-600 uppercase">Bid Requests</p>
              <Package className="h-4 w-4 text-rose-600" />
            </div>
            <p className="text-2xl font-bold text-rose-900">{mockBids.filter(b => b.status === 'open').length}</p>
            <p className="text-xs text-rose-700 mt-1">open invitations</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-3 text-sm whitespace-nowrap border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full font-medium",
                    tab.urgent
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  )}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Dashboard Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="p-6 space-y-6">
          {/* Two-Week Look-Ahead */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Two-Week Look-Ahead</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Full Schedule <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {mockScheduleTasks.map(task => (
                <div key={task.id} className={cn(
                  "bg-white border rounded-lg p-4 hover:border-blue-300 transition-colors",
                  task.acknowledgmentStatus === 'reschedule_requested' ? 'border-amber-300' :
                  task.acknowledgmentStatus === 'pending' ? 'border-blue-300' : 'border-gray-200'
                )}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{task.taskDescription}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {task.projectName}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-xs text-gray-400">{task.builderName}</span>
                      </div>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full font-medium',
                      task.acknowledgmentStatus === 'acknowledged' ? 'bg-green-100 text-green-700' :
                      task.acknowledgmentStatus === 'pending' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    )}>
                      {task.acknowledgmentStatus === 'acknowledged' ? 'Acknowledged' :
                       task.acknowledgmentStatus === 'pending' ? 'Pending Ack' : 'Reschedule Req'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(task.startDate)} - {formatDate(task.endDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {task.location}
                    </span>
                  </div>
                  {task.dependencies.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="font-medium">Dependencies:</span> {task.dependencies.join(', ')}
                    </div>
                  )}
                  {task.acknowledgmentStatus === 'pending' && (
                    <div className="mt-3 flex items-center gap-2">
                      <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        Acknowledge
                      </button>
                      <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">
                        Request Reschedule
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active POs Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Purchase Orders</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {mockPOs.map(po => (
                <div key={po.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{po.poNumber}</h4>
                        {po.changeOrders > 0 && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">{po.changeOrders} CO</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{po.projectName} - {po.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{po.builderName}</p>
                    </div>
                    <span className={cn(
                      'px-3 py-1 text-xs font-medium rounded-full',
                      po.status === 'pending_acknowledgment' ? 'bg-yellow-100 text-yellow-800' :
                      po.status === 'acknowledged' ? 'bg-green-100 text-green-800' :
                      po.status === 'partially_received' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    )}>
                      {po.status === 'pending_acknowledgment' ? 'Pending Ack' :
                       po.status === 'acknowledged' ? 'Acknowledged' :
                       po.status === 'partially_received' ? 'Partially Received' : 'Complete'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-gray-500">Amount</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(po.amount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Due Date</p>
                        <p className="font-semibold text-gray-900">{formatDate(po.deliveryDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Line Items</p>
                        <p className="font-semibold text-gray-900">{po.lineItems}</p>
                      </div>
                    </div>
                    {po.status === 'pending_acknowledgment' ? (
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        Acknowledge
                      </button>
                    ) : (
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bid Requests Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Open Bid Requests</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Bid History <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {mockBids.filter(b => b.status === 'open').map(bid => (
                <div key={bid.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-red-900">{bid.scope}</h4>
                      <div className="flex items-center gap-2 text-sm text-red-700 mt-1">
                        <span>{bid.projectName}</span>
                        <span className="text-red-300">|</span>
                        <span className="text-xs">{bid.builderName}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      Due {formatDate(bid.dueDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-red-700 mb-3">
                    <span>Est. Value: {formatCurrency(bid.estimatedValue)}</span>
                    <span>{bid.documentsCount} documents</span>
                    {bid.questionsCount > 0 && (
                      <span>{bid.questionsCount} Q&A thread{bid.questionsCount > 1 ? 's' : ''}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                      Review & Respond
                    </button>
                    <button className="px-4 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200">
                      Ask Question
                    </button>
                  </div>
                </div>
              ))}
              {/* Show awarded bid */}
              {mockBids.filter(b => b.status === 'awarded').map(bid => (
                <div key={bid.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <h4 className="font-medium text-green-900">{bid.scope}</h4>
                      </div>
                      <p className="text-sm text-green-700 mt-1">{bid.projectName} - {bid.builderName}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Awarded
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Payment Activity */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payment Activity</h3>
            <div className="space-y-2">
              {mockInvoices.slice(0, 4).map(inv => {
                const statusInfo = invoiceStatusConfig[inv.status]
                const StatusIcon = statusInfo.icon
                return (
                  <div key={inv.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{inv.invoiceNumber}</h4>
                        <span className={cn('text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1', statusInfo.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{inv.projectName} - {inv.poNumber}</p>
                      <p className="text-xs text-gray-400">{inv.builderName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(inv.amount)}</p>
                      <p className="text-xs text-gray-500">
                        Retainage: {formatCurrency(inv.retainageHeld)} | Net: {formatCurrency(inv.netAmount)}
                      </p>
                      {inv.paidAt && (
                        <p className="text-xs text-green-600 mt-0.5">Paid {formatDate(inv.paidAt)} - Ref: {inv.paymentRef}</p>
                      )}
                      {inv.rejectionReason && (
                        <p className="text-xs text-red-600 mt-0.5">{inv.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Lien Waivers */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lien Waivers</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {mockLienWaivers.map(waiver => (
                <div key={waiver.id} className={cn(
                  "flex items-center justify-between p-3 bg-white border rounded-lg",
                  waiver.status === 'pending_signature' ? 'border-amber-300' : 'border-gray-200'
                )}>
                  <div className="flex items-center gap-3">
                    <PenTool className={cn(
                      'h-5 w-5',
                      waiver.status === 'pending_signature' ? 'text-amber-600' :
                      waiver.status === 'signed' ? 'text-blue-600' : 'text-green-600'
                    )} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{waiver.projectName}</p>
                      <p className="text-xs text-gray-500">
                        {waiver.waiverType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} - Through {formatDate(waiver.throughDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(waiver.amount)}</span>
                    {waiver.status === 'pending_signature' ? (
                      <button className="px-3 py-1.5 bg-amber-600 text-white text-xs rounded-lg hover:bg-amber-700">
                        Sign Now
                      </button>
                    ) : (
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full font-medium',
                        waiver.status === 'signed' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      )}>
                        {waiver.status === 'signed' ? 'Signed' : 'Verified'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Punch Items */}
          {mockPunchItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Assigned Punch Items</h3>
                <span className="text-sm text-gray-500">{mockPunchItems.filter(p => p.status !== 'completed').length} open</span>
              </div>
              <div className="space-y-2">
                {mockPunchItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ClipboardList className={cn(
                        'h-5 w-5',
                        item.status === 'assigned' ? 'text-amber-600' :
                        item.status === 'in_progress' ? 'text-blue-600' : 'text-green-600'
                      )} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{item.projectName}</span>
                          <span className="text-gray-300">|</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>
                          <span className="text-gray-300">|</span>
                          <span className="flex items-center gap-1"><Camera className="h-3 w-3" />{item.photos} photo{item.photos !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <button className={cn(
                      'px-3 py-1.5 text-xs rounded-lg',
                      item.status === 'assigned' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-green-600 text-white hover:bg-green-700'
                    )}>
                      {item.status === 'assigned' ? 'Start Work' : 'Mark Complete'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Documents Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Documents</h3>
            <div className="space-y-2">
              {mockComplianceDocs.map(doc => {
                const statusInfo = complianceStatusConfig[doc.status]
                return (
                  <div key={doc.id} className={cn(
                    "flex items-center justify-between p-3 bg-white border rounded-lg",
                    doc.status === 'expired' || doc.status === 'missing' ? 'border-red-200' :
                    doc.status === 'expiring_soon' ? 'border-amber-200' : 'border-gray-200'
                  )}>
                    <div className="flex items-center gap-3">
                      {doc.status === 'current' ? (
                        <FileCheck className="h-5 w-5 text-green-600" />
                      ) : doc.status === 'missing' ? (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      ) : (
                        <FileCheck className={cn('h-5 w-5', doc.status === 'expiring_soon' ? 'text-amber-600' : 'text-red-600')} />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{complianceDocTypeLabels[doc.type]}</p>
                        {doc.fileName ? (
                          <p className="text-xs text-gray-500">
                            {doc.fileName}
                            {doc.expirationDate && ` - Expires ${formatDate(doc.expirationDate)}`}
                          </p>
                        ) : (
                          <p className="text-xs text-red-500">Not uploaded</p>
                        )}
                        {doc.policyNumber && (
                          <p className="text-xs text-gray-400">Policy: {doc.policyNumber}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs px-2 py-1 rounded-full font-medium', statusInfo.color)}>
                        {statusInfo.label}
                      </span>
                      {(doc.status === 'expired' || doc.status === 'missing' || doc.status === 'expiring_soon') && (
                        <button className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                          {doc.status === 'missing' ? 'Upload' : 'Renew'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Upload Area */}
            <div className="mt-4 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:bg-blue-100 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-900 mb-1">Upload Documents</h4>
              <p className="text-sm text-blue-700 mb-3">Insurance certificates, W-9, licenses, bonds, or safety certifications</p>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 inline-block">
                Select Files
              </button>
              <p className="text-xs text-blue-600 mt-3">Or drag and drop files here</p>
            </div>
          </div>

          {/* AI Assistant */}
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">AI Portal Assistant</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>&#x2022; Your COI expires in 8 days - uploading a renewal will auto-notify all connected builders</p>
                  <p>&#x2022; Invoice INV-2026-065 was rejected for missing certified payroll - attach document and resubmit</p>
                  <p>&#x2022; Bid for Johnson Warehouse is due in 8 days - 4 documents available for review</p>
                  <p>&#x2022; You have 2 punch items to address on active projects</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">My Schedule - All Projects</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Coastal Custom Homes</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Palmetto Builders</span>
            </div>
          </div>
          {mockScheduleTasks.map(task => (
            <div key={task.id} className={cn(
              "bg-white border rounded-lg p-4",
              task.builderName === 'Coastal Custom Homes' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-emerald-500'
            )}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{task.taskDescription}</h4>
                  <p className="text-sm text-gray-600 mt-1">{task.projectName} ({task.builderName})</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(task.startDate)} - {formatDate(task.endDate)}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{task.location}</span>
                  </div>
                  {task.dependencies.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">Dependencies: {task.dependencies.join(', ')}</p>
                  )}
                </div>
                <span className={cn(
                  'text-xs px-2 py-1 rounded-full font-medium',
                  task.acknowledgmentStatus === 'acknowledged' ? 'bg-green-100 text-green-700' :
                  task.acknowledgmentStatus === 'pending' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                )}>
                  {task.acknowledgmentStatus === 'acknowledged' ? 'Acknowledged' :
                   task.acknowledgmentStatus === 'pending' ? 'Pending' : 'Reschedule'}
                </span>
              </div>
            </div>
          ))}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-amber-700">Conflict detected: Smith Residence and Davis Custom Home tasks overlap on Feb 17. Notify affected builders?</span>
          </div>
        </div>
      )}

      {/* Purchase Orders Tab */}
      {activeTab === 'pos' && (
        <div className="p-6 space-y-3">
          {mockPOs.map(po => (
            <div key={po.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-gray-900">{po.poNumber}</span>
                    {po.changeOrders > 0 && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">{po.changeOrders} CO</span>}
                  </div>
                  <p className="text-sm text-gray-600">{po.description}</p>
                  <p className="text-xs text-gray-400">{po.projectName} - {po.builderName}</p>
                </div>
                <span className={cn(
                  'text-xs px-2 py-1 rounded-full font-medium',
                  po.status === 'pending_acknowledgment' ? 'bg-yellow-100 text-yellow-800' :
                  po.status === 'acknowledged' ? 'bg-green-100 text-green-800' :
                  po.status === 'partially_received' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                )}>
                  {po.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div><span className="text-gray-500">Amount:</span> <span className="font-semibold">{formatCurrency(po.amount)}</span></div>
                <div><span className="text-gray-500">Delivery:</span> <span className="font-semibold">{formatDate(po.deliveryDate)}</span></div>
                <div><span className="text-gray-500">Items:</span> <span className="font-semibold">{po.lineItems}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">My Invoices</h3>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">+ Submit Invoice</button>
          </div>
          {mockInvoices.map(inv => {
            const statusInfo = invoiceStatusConfig[inv.status]
            const StatusIcon = statusInfo.icon
            return (
              <div key={inv.id} className={cn(
                "bg-white border rounded-lg p-4",
                inv.status === 'rejected' ? 'border-red-300' : 'border-gray-200'
              )}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-gray-900">{inv.invoiceNumber}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1', statusInfo.color)}>
                        <StatusIcon className="h-3 w-3" />{statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{inv.projectName} - Against {inv.poNumber}</p>
                    <p className="text-xs text-gray-400">{inv.builderName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(inv.amount)}</p>
                    <p className="text-xs text-gray-500">Retainage: {formatCurrency(inv.retainageHeld)}</p>
                    <p className="text-xs text-gray-500">Net: {formatCurrency(inv.netAmount)}</p>
                  </div>
                </div>
                {inv.rejectionReason && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                    <XCircle className="h-3.5 w-3.5 inline mr-1" />Rejected: {inv.rejectionReason}
                  </div>
                )}
                {inv.paidAt && (
                  <div className="mt-2 text-xs text-green-600">Paid {formatDate(inv.paidAt)} - Ref: {inv.paymentRef}</div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Bids Tab */}
      {activeTab === 'bids' && (
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Bid Invitations</h3>
            <span className="text-sm text-gray-500">{mockBids.filter(b => b.status === 'open').length} open | {mockBids.filter(b => b.status === 'awarded').length} awarded</span>
          </div>
          {mockBids.map(bid => (
            <div key={bid.id} className={cn(
              "bg-white border rounded-lg p-4",
              bid.status === 'open' ? 'border-red-200 bg-red-50/30' :
              bid.status === 'awarded' ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
            )}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{bid.scope}</h4>
                  <p className="text-sm text-gray-600">{bid.projectName} - {bid.builderName}</p>
                </div>
                <span className={cn(
                  'text-xs px-2 py-1 rounded-full font-medium',
                  bid.status === 'open' ? 'bg-red-100 text-red-700' :
                  bid.status === 'awarded' ? 'bg-green-100 text-green-700' :
                  bid.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                )}>
                  {bid.status.replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Est: {formatCurrency(bid.estimatedValue)}</span>
                <span>Due: {formatDate(bid.dueDate)}</span>
                <span>{bid.documentsCount} docs</span>
                {bid.questionsCount > 0 && <span>{bid.questionsCount} Q&A</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lien Waivers Tab */}
      {activeTab === 'lien_waivers' && (
        <div className="p-6 space-y-3">
          <h3 className="font-semibold text-gray-900 mb-2">Lien Waivers</h3>
          {mockLienWaivers.map(waiver => (
            <div key={waiver.id} className={cn(
              "bg-white border rounded-lg p-4",
              waiver.status === 'pending_signature' ? 'border-amber-300' : 'border-gray-200'
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{waiver.projectName}</p>
                  <p className="text-sm text-gray-600">
                    {waiver.waiverType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </p>
                  <p className="text-xs text-gray-500">Through: {formatDate(waiver.throughDate)} | Amount: {formatCurrency(waiver.amount)}</p>
                </div>
                {waiver.status === 'pending_signature' ? (
                  <button className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 flex items-center gap-1">
                    <PenTool className="h-4 w-4" /> Sign Waiver
                  </button>
                ) : (
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full font-medium',
                    waiver.status === 'signed' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  )}>
                    {waiver.status === 'signed' ? 'Signed' : 'Verified'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'documents' && (
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Compliance Documents</h3>
            <div className="flex items-center gap-2">
              {(['green', 'yellow', 'red'] as const).map(status => {
                const count = mockBuilderRelationships.filter(b => b.complianceStatus === status).length
                return (
                  <span key={status} className="flex items-center gap-1 text-xs text-gray-600">
                    <span className={cn('h-2 w-2 rounded-full', status === 'green' ? 'bg-green-500' : status === 'yellow' ? 'bg-amber-500' : 'bg-red-500')} />
                    {count} builder{count !== 1 ? 's' : ''}
                  </span>
                )
              })}
            </div>
          </div>
          {mockComplianceDocs.map(doc => {
            const statusInfo = complianceStatusConfig[doc.status]
            return (
              <div key={doc.id} className={cn(
                "bg-white border rounded-lg p-4",
                doc.status === 'expired' || doc.status === 'missing' ? 'border-red-200' :
                doc.status === 'expiring_soon' ? 'border-amber-200' : 'border-gray-200'
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {doc.status === 'current' ? <FileCheck className="h-5 w-5 text-green-600" /> :
                     doc.status === 'missing' ? <AlertTriangle className="h-5 w-5 text-red-600" /> :
                     <FileCheck className={cn('h-5 w-5', doc.status === 'expiring_soon' ? 'text-amber-600' : 'text-red-600')} />}
                    <div>
                      <p className="font-medium text-gray-900">{complianceDocTypeLabels[doc.type]}</p>
                      {doc.fileName && <p className="text-sm text-gray-500">{doc.fileName}</p>}
                      {doc.expirationDate && <p className="text-xs text-gray-400">Expires: {formatDate(doc.expirationDate)}</p>}
                      {doc.coverageAmount && <p className="text-xs text-gray-400">Coverage: {formatCurrency(doc.coverageAmount)}</p>}
                      {doc.policyNumber && <p className="text-xs text-gray-400">Policy: {doc.policyNumber}</p>}
                    </div>
                  </div>
                  <span className={cn('text-xs px-2 py-1 rounded-full font-medium', statusInfo.color)}>{statusInfo.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Punch Items Tab */}
      {activeTab === 'punch' && (
        <div className="p-6 space-y-3">
          <h3 className="font-semibold text-gray-900 mb-2">Assigned Punch Items</h3>
          {mockPunchItems.map(item => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{item.description}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span>{item.projectName}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{item.location}</span>
                    <span className="flex items-center gap-1"><Camera className="h-3.5 w-3.5" />{item.photos} photo{item.photos !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full font-medium',
                    item.status === 'assigned' ? 'bg-amber-100 text-amber-700' :
                    item.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  )}>
                    {item.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                  <button className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
                    {item.status === 'assigned' ? 'Start' : 'Complete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>Last updated: 2 minutes ago</span>
            <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> (843) 555-0100</span>
            <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> support@rossos.com</span>
          </div>
          <span className="text-xs text-gray-400">English | Espa&ntilde;ol</span>
        </div>
      </div>

      {/* AI Features Panel */}
      <AIFeaturesPanel
        features={[
          {
            feature: 'Engagement Tracking',
            insight: 'Monitors vendor portal usage',
          },
          {
            feature: 'Document Status',
            insight: 'Tracks document submissions',
          },
          {
            feature: 'Compliance Alerts',
            insight: 'Flags compliance issues',
          },
          {
            feature: 'Communication Analysis',
            insight: 'Tracks vendor responsiveness',
          },
          {
            feature: 'Onboarding Progress',
            insight: 'Monitors vendor onboarding completion',
          },
        ]}
      />
    </div>
  )
}
