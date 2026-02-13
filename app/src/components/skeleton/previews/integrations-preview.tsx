'use client'

import { useState } from 'react'
import {
  Link,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Settings,
  Eye,
  Unplug,
  Sparkles,
  Clock,
  Calendar,
  Mail,
  CreditCard,
  FileText,
  Cloud,
  MessageSquare,
  Webhook,
  Key,
  Activity,
  ChevronRight,
  TrendingUp,
  Shield,
  Star,
  Download,
  Search,
  Building,
  Camera,
  Plane,
  Truck,
  Thermometer,
  MapPin,
  CloudRain,
  BookOpen,
  Zap,
  Globe,
  Users,
  BarChart3,
  Lock,
  AlertTriangle,
  Server,
  Code,
  ExternalLink,
  ShoppingBag,
  Wifi,
  PauseCircle,
  Play,
  ArrowRightLeft,
  Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'paused'
type IntegrationCategory = 'accounting' | 'calendar' | 'communication' | 'storage' | 'automation' | 'payment' | 'esignature' | 'construction' | 'financial_feeds' | 'suppliers' | 'design' | 'geospatial' | 'weather' | 'building_codes' | 'licensing' | 'energy' | 'smart_home' | 'site_services' | 'crm'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  status: IntegrationStatus
  category: IntegrationCategory
  lastSync?: string
  nextSync?: string
  syncItems?: string[]
  errorMessage?: string
  isInstalled: boolean
  installCount?: number
  avgRating?: number
  reviewCount?: number
  pricing?: 'free' | 'paid' | 'freemium'
  priceMonthly?: number
  isFeatured?: boolean
  healthScore?: number
  errorRate?: number
  circuitBreaker?: 'closed' | 'open' | 'half_open'
}

interface WebhookSubscription {
  id: string
  url: string
  events: string[]
  isActive: boolean
  failureCount: number
  lastDelivered?: string
  deliverySuccessRate: number
}

interface SyncLogEntry {
  id: string
  integration: string
  action: string
  status: 'success' | 'warning' | 'error'
  timestamp: string
  details?: string
}

interface ApiKeyInfo {
  id: string
  name: string
  prefix: string
  scopes: string[]
  lastUsed: string
  rateLimitTier: string
  callsThisMonth: number
}

const connectedIntegrations: Integration[] = [
  {
    id: '1',
    name: 'QuickBooks Online',
    description: 'Two-way accounting sync for customers, vendors, invoices, bills, and payments',
    icon: CreditCard,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    status: 'connected',
    category: 'accounting',
    lastSync: '5 minutes ago',
    nextSync: '25 minutes',
    syncItems: ['Customers', 'Vendors', 'Invoices', 'Bills', 'Payments', 'Chart of Accounts'],
    isInstalled: true,
    healthScore: 99.2,
    errorRate: 0.8,
    circuitBreaker: 'closed',
  },
  {
    id: '2',
    name: 'Google Calendar',
    description: 'Two-way calendar sync for inspections, deliveries, meetings, and milestones',
    icon: Calendar,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    status: 'connected',
    category: 'calendar',
    lastSync: '2 minutes ago',
    nextSync: 'Real-time',
    syncItems: ['Inspections', 'Deliveries', 'Meetings', 'Milestones'],
    isInstalled: true,
    healthScore: 100,
    errorRate: 0,
    circuitBreaker: 'closed',
  },
  {
    id: '3',
    name: 'Gmail',
    description: 'Auto-capture job-related emails to project files. AI-powered auto-filing to correct project/vendor.',
    icon: Mail,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    status: 'connected',
    category: 'communication',
    lastSync: '1 minute ago',
    nextSync: 'Real-time',
    syncItems: ['Client emails', 'Vendor emails', 'Attachments', 'Thread tracking'],
    isInstalled: true,
    healthScore: 98.5,
    errorRate: 1.5,
    circuitBreaker: 'closed',
  },
  {
    id: '4',
    name: 'DocuSign',
    description: 'E-signatures for contracts, change orders, and subcontract agreements with multi-party routing',
    icon: FileText,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    status: 'connected',
    category: 'esignature',
    lastSync: '10 minutes ago',
    nextSync: 'On demand',
    syncItems: ['Contracts', 'Change Orders', 'Subcontracts', 'Envelope status'],
    isInstalled: true,
    healthScore: 100,
    errorRate: 0,
    circuitBreaker: 'closed',
  },
  {
    id: '5',
    name: 'Plaid (Bank Feed)',
    description: 'Auto-import bank transactions for reconciliation. Two-way matching against invoiced/paid items.',
    icon: Building,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    status: 'connected',
    category: 'financial_feeds',
    lastSync: 'Daily at 6 AM',
    nextSync: 'Tomorrow 6 AM',
    syncItems: ['Bank transactions', 'Payment matching', 'Reconciliation'],
    isInstalled: true,
    healthScore: 97.8,
    errorRate: 2.2,
    circuitBreaker: 'closed',
  },
  {
    id: '6',
    name: 'NOAA Weather',
    description: 'Real-time weather forecasts, severe weather alerts, and historical data for schedule intelligence',
    icon: CloudRain,
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-100',
    status: 'connected',
    category: 'weather',
    lastSync: '30 minutes ago',
    nextSync: 'Hourly',
    syncItems: ['10-day forecast', 'Severe alerts', 'Historical data', 'Tide schedules'],
    isInstalled: true,
    healthScore: 100,
    errorRate: 0,
    circuitBreaker: 'closed',
  },
]

const availableIntegrations: Integration[] = [
  {
    id: '10',
    name: 'Stripe',
    description: 'Accept online client payments via credit card, ACH, and wire transfer',
    icon: CreditCard,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    status: 'disconnected',
    category: 'payment',
    isInstalled: false,
    installCount: 1247,
    avgRating: 4.8,
    reviewCount: 89,
    pricing: 'free',
    isFeatured: true,
  },
  {
    id: '11',
    name: 'Xero',
    description: 'Accounting integration with two-way sync for invoices, bills, and contacts',
    icon: CreditCard,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    status: 'disconnected',
    category: 'accounting',
    isInstalled: false,
    installCount: 423,
    avgRating: 4.5,
    reviewCount: 34,
    pricing: 'free',
  },
  {
    id: '12',
    name: 'Dropbox',
    description: 'Sync project documents, plans, and photos to Dropbox folders',
    icon: Cloud,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    status: 'disconnected',
    category: 'storage',
    isInstalled: false,
    installCount: 856,
    avgRating: 4.6,
    reviewCount: 67,
    pricing: 'free',
  },
  {
    id: '13',
    name: 'Zapier',
    description: 'Connect to 5,000+ apps via triggers and actions. No-code automation.',
    icon: Zap,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-100',
    status: 'disconnected',
    category: 'automation',
    isInstalled: false,
    installCount: 2341,
    avgRating: 4.7,
    reviewCount: 156,
    pricing: 'free',
    isFeatured: true,
  },
  {
    id: '14',
    name: 'Chief Architect',
    description: 'Import architectural plans, room specs, and quantities from design files',
    icon: FileText,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
    status: 'disconnected',
    category: 'design',
    isInstalled: false,
    installCount: 312,
    avgRating: 4.4,
    reviewCount: 28,
    pricing: 'paid',
    priceMonthly: 29,
  },
  {
    id: '15',
    name: 'Accela (Building Dept)',
    description: 'Auto-submit permit applications and check status with municipal e-permitting systems',
    icon: Building,
    iconColor: 'text-gray-600',
    iconBg: 'bg-gray-100',
    status: 'disconnected',
    category: 'construction',
    isInstalled: false,
    installCount: 189,
    avgRating: 4.2,
    reviewCount: 22,
    pricing: 'free',
  },
  {
    id: '16',
    name: 'Sensera (Job Cameras)',
    description: 'Auto-import time-lapse photos and live camera feeds to project dashboard',
    icon: Camera,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-100',
    status: 'disconnected',
    category: 'construction',
    isInstalled: false,
    installCount: 267,
    avgRating: 4.6,
    reviewCount: 41,
    pricing: 'free',
  },
  {
    id: '17',
    name: 'DroneDeploy',
    description: 'Import drone surveys: orthomosaics, elevation models, progress photos with GPS tagging',
    icon: Plane,
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-100',
    status: 'disconnected',
    category: 'construction',
    isInstalled: false,
    installCount: 134,
    avgRating: 4.5,
    reviewCount: 18,
    pricing: 'paid',
    priceMonthly: 49,
  },
  {
    id: '18',
    name: 'United Rentals',
    description: 'Track rental start/stop, billing, and receive electronic invoices for rented equipment',
    icon: Truck,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    status: 'disconnected',
    category: 'construction',
    isInstalled: false,
    installCount: 198,
    avgRating: 4.3,
    reviewCount: 29,
    pricing: 'free',
  },
  {
    id: '19',
    name: 'Ferguson Appliances',
    description: 'Browse appliance catalog, real-time pricing, delivery scheduling, and order tracking',
    icon: ShoppingBag,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    status: 'disconnected',
    category: 'suppliers',
    isInstalled: false,
    installCount: 456,
    avgRating: 4.7,
    reviewCount: 52,
    pricing: 'free',
    isFeatured: true,
  },
  {
    id: '20',
    name: 'FEMA Flood Maps',
    description: 'Auto-determine flood zone from project address. Flag high-risk zones requiring elevated construction.',
    icon: MapPin,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    status: 'disconnected',
    category: 'geospatial',
    isInstalled: false,
    installCount: 678,
    avgRating: 4.8,
    reviewCount: 45,
    pricing: 'free',
  },
  {
    id: '21',
    name: 'Ekotrope (Energy)',
    description: 'HERS rating, Manual J/D calculations, blower door results for energy compliance',
    icon: Thermometer,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    status: 'disconnected',
    category: 'energy',
    isInstalled: false,
    installCount: 89,
    avgRating: 4.4,
    reviewCount: 12,
    pricing: 'paid',
    priceMonthly: 19,
  },
  {
    id: '22',
    name: 'Control4 (Smart Home)',
    description: 'Smart home specs, pre-wire docs, equipment lists, and installation scheduling',
    icon: Wifi,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-100',
    status: 'disconnected',
    category: 'smart_home',
    isInstalled: false,
    installCount: 67,
    avgRating: 4.3,
    reviewCount: 8,
    pricing: 'free',
  },
  {
    id: '23',
    name: 'ICC Digital Codes',
    description: 'Jurisdiction-specific building code lookup, amendments, and code change tracking',
    icon: BookOpen,
    iconColor: 'text-gray-600',
    iconBg: 'bg-gray-100',
    status: 'disconnected',
    category: 'building_codes',
    isInstalled: false,
    installCount: 534,
    avgRating: 4.6,
    reviewCount: 38,
    pricing: 'paid',
    priceMonthly: 15,
  },
  {
    id: '24',
    name: 'State License Verify',
    description: 'Auto-verify vendor contractor licenses across all 50 states with expiration monitoring',
    icon: Shield,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    status: 'disconnected',
    category: 'licensing',
    isInstalled: false,
    installCount: 345,
    avgRating: 4.5,
    reviewCount: 27,
    pricing: 'free',
  },
  {
    id: '25',
    name: 'RSMeans Cost Data',
    description: 'Pull regional cost data into estimating module for material and labor pricing',
    icon: BarChart3,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
    status: 'disconnected',
    category: 'suppliers',
    isInstalled: false,
    installCount: 412,
    avgRating: 4.7,
    reviewCount: 33,
    pricing: 'paid',
    priceMonthly: 39,
  },
  {
    id: '26',
    name: 'HubSpot CRM',
    description: 'Lead and contact sync between RossOS pipeline and HubSpot marketing automation',
    icon: Users,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-100',
    status: 'disconnected',
    category: 'crm',
    isInstalled: false,
    installCount: 234,
    avgRating: 4.4,
    reviewCount: 19,
    pricing: 'free',
  },
]

const categoryConfig: Record<IntegrationCategory, { label: string; icon: typeof CreditCard }> = {
  accounting: { label: 'Accounting', icon: CreditCard },
  calendar: { label: 'Calendar', icon: Calendar },
  communication: { label: 'Communication', icon: Mail },
  storage: { label: 'Storage', icon: Cloud },
  automation: { label: 'Automation', icon: Zap },
  payment: { label: 'Payment', icon: CreditCard },
  esignature: { label: 'E-Signature', icon: FileText },
  construction: { label: 'Construction', icon: Building },
  financial_feeds: { label: 'Financial Feeds', icon: Building },
  suppliers: { label: 'Suppliers & Data', icon: ShoppingBag },
  design: { label: 'Design Tools', icon: FileText },
  geospatial: { label: 'Geospatial', icon: MapPin },
  weather: { label: 'Weather', icon: CloudRain },
  building_codes: { label: 'Building Codes', icon: BookOpen },
  licensing: { label: 'Licensing', icon: Shield },
  energy: { label: 'Energy', icon: Thermometer },
  smart_home: { label: 'Smart Home', icon: Wifi },
  site_services: { label: 'Site Services', icon: Truck },
  crm: { label: 'CRM', icon: Users },
}

const recentSyncLog: SyncLogEntry[] = [
  {
    id: '1',
    integration: 'QuickBooks Online',
    action: 'Synced 3 invoices to QBO bills',
    status: 'success',
    timestamp: '5 minutes ago',
  },
  {
    id: '2',
    integration: 'Google Calendar',
    action: 'Created inspection event: Framing - Smith Residence',
    status: 'success',
    timestamp: '15 minutes ago',
  },
  {
    id: '3',
    integration: 'Gmail',
    action: 'Captured email from john@smithfamily.com — AI filed to Smith Residence',
    status: 'success',
    timestamp: '22 minutes ago',
    details: 'Auto-filed via AI: sender matched to client, project reference in subject',
  },
  {
    id: '4',
    integration: 'Plaid (Bank Feed)',
    action: 'Imported 12 transactions. 10 auto-matched, 2 pending manual coding.',
    status: 'warning',
    timestamp: '6 hours ago',
    details: '2 unmatched transactions flagged for job cost coding',
  },
  {
    id: '5',
    integration: 'QuickBooks Online',
    action: 'Vendor sync warning: Duplicate detected',
    status: 'warning',
    timestamp: '1 hour ago',
    details: 'ABC Lumber exists in both systems with different IDs. Auto-resolution available.',
  },
  {
    id: '6',
    integration: 'NOAA Weather',
    action: 'Severe weather alert: Hurricane Watch for Charleston County',
    status: 'error',
    timestamp: '5 hours ago',
    details: 'Alert pushed to all active project teams in affected area',
  },
  {
    id: '7',
    integration: 'DocuSign',
    action: 'Envelope signed: Smith Residence Contract #2026-047',
    status: 'success',
    timestamp: '2 hours ago',
  },
]

const mockWebhooks: WebhookSubscription[] = [
  {
    id: '1',
    url: 'https://api.example.com/webhooks/rossos',
    events: ['project.created', 'invoice.approved', 'schedule.updated'],
    isActive: true,
    failureCount: 0,
    lastDelivered: '2 hours ago',
    deliverySuccessRate: 99.8,
  },
  {
    id: '2',
    url: 'https://hooks.zapier.com/hooks/catch/123456/abc',
    events: ['change_order.created', 'vendor.invoice_submitted'],
    isActive: true,
    failureCount: 1,
    lastDelivered: '45 minutes ago',
    deliverySuccessRate: 97.2,
  },
]

const mockApiKeys: ApiKeyInfo[] = [
  {
    id: '1',
    name: 'Production API Key',
    prefix: 'sk_live_',
    scopes: ['read:projects', 'write:invoices', 'read:vendors', 'read:schedules'],
    lastUsed: '2 minutes ago',
    rateLimitTier: 'Professional (500 req/min)',
    callsThisMonth: 12847,
  },
  {
    id: '2',
    name: 'Reporting Dashboard',
    prefix: 'sk_live_',
    scopes: ['read:projects', 'read:budgets', 'read:reports'],
    lastUsed: 'Yesterday',
    rateLimitTier: 'Professional (500 req/min)',
    callsThisMonth: 3421,
  },
]

function IntegrationCard({ integration, type }: { integration: Integration; type: 'connected' | 'available' }) {
  const Icon = integration.icon

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 transition-all",
      integration.status === 'error' ? "border-red-200" :
      integration.isFeatured ? "border-blue-200 ring-1 ring-blue-100" :
      "border-gray-200 hover:border-gray-300"
    )}>
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-lg", integration.iconBg)}>
          <Icon className={cn("h-6 w-6", integration.iconColor)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-medium text-gray-900">{integration.name}</h4>
            {integration.status === 'connected' && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </span>
            )}
            {integration.status === 'paused' && (
              <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                <PauseCircle className="h-3 w-3" />
                Paused
              </span>
            )}
            {integration.status === 'error' && (
              <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                <XCircle className="h-3 w-3" />
                Error
              </span>
            )}
            {integration.isFeatured && type === 'available' && (
              <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                <Star className="h-3 w-3 fill-blue-400" />
                Featured
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-3">{integration.description}</p>

          {type === 'connected' && integration.syncItems && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Syncing:</p>
              <div className="flex flex-wrap gap-1">
                {integration.syncItems.map((item, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {type === 'connected' && (
            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last sync: {integration.lastSync}
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Next: {integration.nextSync}
              </span>
              {integration.healthScore !== undefined && (
                <span className={cn("flex items-center gap-1", integration.healthScore >= 99 ? "text-green-600" : integration.healthScore >= 95 ? "text-amber-600" : "text-red-600")}>
                  <Activity className="h-3 w-3" />
                  Health: {integration.healthScore}%
                </span>
              )}
              {integration.circuitBreaker && (
                <span className={cn("flex items-center gap-1", integration.circuitBreaker === 'closed' ? "text-green-600" : integration.circuitBreaker === 'open' ? "text-red-600" : "text-amber-600")} title="Circuit breaker status">
                  <Shield className="h-3 w-3" />
                  CB: {integration.circuitBreaker}
                </span>
              )}
            </div>
          )}

          {type === 'available' && (
            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
              {integration.avgRating && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <span className="font-medium text-gray-700">{integration.avgRating}</span>
                  <span>({integration.reviewCount})</span>
                </span>
              )}
              {integration.installCount && (
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {integration.installCount.toLocaleString()} installs
                </span>
              )}
              {integration.pricing && (
                <span className={cn("font-medium", integration.pricing === 'free' ? "text-green-600" : "text-gray-900")}>
                  {integration.pricing === 'free' ? 'Free' : integration.priceMonthly ? `$${integration.priceMonthly}/mo` : 'Paid'}
                </span>
              )}
              <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                {categoryConfig[integration.category]?.label}
              </span>
            </div>
          )}

          {integration.status === 'error' && integration.errorMessage && (
            <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              {integration.errorMessage}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
        {type === 'connected' ? (
          <>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Settings className="h-4 w-4" />
              Configure
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <RefreshCw className="h-4 w-4" />
              Sync Now
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Eye className="h-4 w-4" />
              View Log
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-gray-200 rounded-lg hover:bg-red-50">
              <Unplug className="h-4 w-4" />
              Disconnect
            </button>
          </>
        ) : (
          <>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Eye className="h-4 w-4" />
              Details
            </button>
            <button className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Link className="h-4 w-4" />
              {integration.pricing === 'paid' ? `Install ($${integration.priceMonthly}/mo)` : 'Connect'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function SyncLogItem({ entry }: { entry: SyncLogEntry }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className={cn(
        "p-1 rounded-full mt-0.5",
        entry.status === 'success' ? "bg-green-100" :
        entry.status === 'warning' ? "bg-amber-100" :
        "bg-red-100"
      )}>
        {entry.status === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
        {entry.status === 'warning' && <AlertCircle className="h-3.5 w-3.5 text-amber-600" />}
        {entry.status === 'error' && <XCircle className="h-3.5 w-3.5 text-red-600" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{entry.integration}</span>
          <span className="text-xs text-gray-400">{entry.timestamp}</span>
        </div>
        <p className="text-sm text-gray-600">{entry.action}</p>
        {entry.details && (
          <p className="text-xs text-gray-400 mt-0.5">{entry.details}</p>
        )}
      </div>
    </div>
  )
}

export function IntegrationsPreview() {
  const [activeTab, setActiveTab] = useState<'connected' | 'available' | 'webhooks' | 'api'>('connected')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const { search, setSearch } = useFilterState()

  const filteredAvailable = availableIntegrations.filter(i => {
    if (search && !matchesSearch(i, search, ['name', 'description'])) return false
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false
    return true
  })

  const allCategories = [...new Set(availableIntegrations.map(i => i.category))]

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Integrations & API Marketplace</h3>
            <p className="text-sm text-gray-500">Connect RossOS to your construction business tools</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              {connectedIntegrations.length} Connected
            </span>
            <span className="flex items-center gap-2 text-gray-500">
              <ShoppingBag className="h-4 w-4" />
              {availableIntegrations.length} Available
            </span>
            <span className="flex items-center gap-2 text-blue-500">
              <Globe className="h-4 w-4" />
              {allCategories.length} Categories
            </span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-green-600 text-xs">
              <Activity className="h-3.5 w-3.5" />
              System Health
            </div>
            <div className="text-lg font-bold text-green-700 mt-0.5">99.2%</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-blue-600 text-xs">
              <BarChart3 className="h-3.5 w-3.5" />
              API Calls (Month)
            </div>
            <div className="text-lg font-bold text-blue-700 mt-0.5">16,268</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Server className="h-3.5 w-3.5" />
              Avg Response
            </div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">142ms</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-purple-600 text-xs">
              <Webhook className="h-3.5 w-3.5" />
              Webhooks Active
            </div>
            <div className="text-lg font-bold text-purple-700 mt-0.5">{mockWebhooks.length}</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-amber-600 text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              Sync Warnings
            </div>
            <div className="text-lg font-bold text-amber-700 mt-0.5">{recentSyncLog.filter(e => e.status !== 'success').length}</div>
          </div>
        </div>
      </div>

      {/* Cross-Module Connections */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-500 font-medium">Connections:</span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
            <Lock className="h-3 w-3" />
            Auth & OAuth2 (1)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded">
            <ArrowRightLeft className="h-3 w-3" />
            Core Data Model (3)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
            <CreditCard className="h-3 w-3" />
            Subscription Billing (43)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded">
            <ShoppingBag className="h-3 w-3" />
            Template Marketplace (48)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded">
            <Webhook className="h-3 w-3" />
            Notification Engine (5)
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex items-center gap-4">
          {[
            { id: 'connected', label: 'Connected', count: connectedIntegrations.length },
            { id: 'available', label: 'Marketplace', count: availableIntegrations.length },
            { id: 'webhooks', label: 'Webhooks', count: mockWebhooks.length },
            { id: 'api', label: 'API Access', count: mockApiKeys.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 py-3 border-b-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
              <span className={cn(
                "px-1.5 py-0.5 rounded text-xs",
                activeTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'connected' && (
          <div className="grid grid-cols-1 gap-4">
            {connectedIntegrations.map(integration => (
              <IntegrationCard key={integration.id} integration={integration} type="connected" />
            ))}

            {/* Sync Log */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Recent Sync Activity</h4>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View Full Log
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="divide-y divide-gray-100 max-h-[200px] overflow-y-auto">
                {recentSyncLog.map(entry => (
                  <SyncLogItem key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'available' && (
          <div>
            {/* Search and Filter */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search integrations..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{categoryConfig[cat]?.label || cat}</option>
                ))}
              </select>
            </div>

            {/* Featured */}
            {categoryFilter === 'all' && !search && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-blue-500" />
                  Featured Integrations
                </h4>
                <div className="grid grid-cols-1 gap-3 mb-4">
                  {availableIntegrations.filter(i => i.isFeatured).map(integration => (
                    <IntegrationCard key={integration.id} integration={integration} type="available" />
                  ))}
                </div>
                <hr className="border-gray-200 my-4" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
              {filteredAvailable.filter(i => categoryFilter !== 'all' || search || !i.isFeatured).map(integration => (
                <IntegrationCard key={integration.id} integration={integration} type="available" />
              ))}
              {filteredAvailable.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-400 text-sm">
                  No integrations match your search
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Configure webhook endpoints to receive real-time events. Payloads signed with HMAC-SHA256.</p>
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Webhook className="h-4 w-4" />
                Add Webhook
              </button>
            </div>

            {mockWebhooks.map(webhook => (
              <div key={webhook.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">{webhook.url}</code>
                    {webhook.isActive ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <Play className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        <PauseCircle className="h-3 w-3" /> Paused
                      </span>
                    )}
                  </div>
                  <button className="text-sm text-gray-600 hover:text-gray-800">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {webhook.events.map(event => (
                    <span key={event} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono">{event}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Last delivered: {webhook.lastDelivered}</span>
                  <span>Success rate: {webhook.deliverySuccessRate}%</span>
                  {webhook.failureCount > 0 && (
                    <span className="text-amber-600">Failures: {webhook.failureCount}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
                    <Send className="h-3.5 w-3.5" />
                    Send Test
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
                    <Eye className="h-3.5 w-3.5" />
                    Delivery Log
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Replay Failed
                  </button>
                </div>
              </div>
            ))}

            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-700 text-sm mb-2">Available Event Categories</h4>
              <div className="flex flex-wrap gap-1.5">
                {['projects', 'budgets', 'schedules', 'invoices', 'change_orders', 'vendors', 'documents', 'selections', 'permits', 'rfis', 'punch_items'].map(cat => (
                  <span key={cat} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">{cat}.*</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-4">
            {/* API Keys */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-gray-600" />
                  <h4 className="font-medium text-gray-900">API Keys</h4>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Key className="h-4 w-4" />
                  Generate Key
                </button>
              </div>

              <div className="space-y-3">
                {mockApiKeys.map(apiKey => (
                  <div key={apiKey.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{apiKey.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{apiKey.rateLimitTier}</span>
                        <button className="text-xs text-red-600 hover:text-red-700">Revoke</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono text-gray-800">
                        {apiKey.prefix}{'*'.repeat(24)}
                      </code>
                      <button className="px-3 py-2 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">Copy</button>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>Last used: {apiKey.lastUsed}</span>
                      <span>{apiKey.callsThisMonth.toLocaleString()} calls this month</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {apiKey.scopes.map(scope => (
                        <span key={scope} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">{scope}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OAuth2 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-5 w-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">OAuth2 & Authorized Apps</h4>
              </div>
              <p className="text-sm text-gray-500 mb-3">Third-party apps authorized to access your RossOS data via OAuth2.</p>
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 text-center">
                No third-party apps authorized yet. Apps will appear here when you grant access via OAuth2.
              </div>
            </div>

            {/* API Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">API Usage</h4>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">16,268</div>
                  <div className="text-sm text-gray-500">API Calls (This Month)</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">98.7%</div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">142ms</div>
                  <div className="text-sm text-gray-500">Avg Response Time</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">v2</div>
                  <div className="text-sm text-gray-500">API Version</div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <FileText className="h-4 w-4" />
                  API Documentation
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Code className="h-4 w-4" />
                  SDKs (JS, Python, C#)
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <ExternalLink className="h-4 w-4" />
                  Developer Portal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Integration Intelligence:</span>
          </div>
          <div className="flex-1 text-sm text-amber-700 space-y-1">
            <p>QuickBooks sync detected duplicate vendor "ABC Lumber" - auto-resolution available. Gmail AI auto-filed 23 job-related emails this week.</p>
            <p>Bank feed: 2 unmatched transactions need manual job cost coding. Credit card integration would capture an additional $12K in untracked expenses.</p>
            <p>You manually enter 8 permit statuses/week. Installing the Accela integration could save 2+ hours/week with auto-status checking.</p>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="p-4 border-t border-gray-200">
        <AIFeaturesPanel
          title="Integration AI Features"
          columns={2}
          features={[
            {
              feature: 'Sync Health Monitoring',
              trigger: 'Real-time',
              insight: 'Tracks integration sync status across all connected services. Currently monitoring 6 active integrations with 99.2% overall health score.',
              detail: 'Continuous monitoring of sync operations, latency metrics, and circuit breaker states to ensure reliable data flow between systems.',
              severity: 'success',
              confidence: 99,
            },
            {
              feature: 'Error Pattern Detection',
              trigger: 'On change',
              insight: 'Identifies recurring sync issues. Detected pattern: QuickBooks vendor sync failures occur 3x more often on Mondays due to rate limiting.',
              detail: 'Machine learning analysis of error logs to surface systemic issues and recommend preventive measures before they impact operations.',
              severity: 'warning',
              confidence: 87,
            },
            {
              feature: 'Data Mapping Suggestions',
              trigger: 'On creation',
              insight: 'Recommends field mappings for new integrations. Suggested mapping: RossOS "Project.Client" to Stripe "Customer.name" with 94% accuracy.',
              detail: 'AI analyzes data schemas from both systems to suggest optimal field mappings, reducing manual configuration time by up to 80%.',
              severity: 'info',
              confidence: 94,
            },
            {
              feature: 'Usage Analytics',
              trigger: 'Weekly',
              insight: 'Shows most valuable integrations. QuickBooks saves 12 hrs/week, Gmail auto-filing saves 8 hrs/week. Stripe adoption recommended based on payment patterns.',
              detail: 'Calculates ROI for each integration based on automation savings, error reduction, and workflow efficiency improvements.',
              severity: 'success',
              confidence: 91,
            },
            {
              feature: 'Conflict Resolution',
              trigger: 'Real-time',
              insight: 'Suggests fixes for data conflicts. Found: Vendor "ABC Lumber" exists in both RossOS and QuickBooks with different IDs. Auto-merge available.',
              detail: 'Detects data conflicts across integrated systems and provides intelligent resolution options including merge, override, or manual review.',
              severity: 'warning',
              confidence: 85,
            },
          ]}
        />
      </div>
    </div>
  )
}
