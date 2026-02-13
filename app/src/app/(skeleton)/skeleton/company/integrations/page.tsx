'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { IntegrationsPreview } from '@/components/skeleton/previews/integrations-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button onClick={() => setActiveTab('preview')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <Eye className="h-4 w-4" />UI Preview
        </button>
        <button onClick={() => setActiveTab('spec')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'spec' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <BookOpen className="h-4 w-4" />Specification
        </button>
      </div>
      {activeTab === 'preview' ? <IntegrationsPreview /> : <PageSpec
      title="Integrations & API Marketplace"
      phase="Phase 6 - Scale & Sell"
      planFile="docs/modules/45-api-marketplace.md"
      description="Public RESTful API with OpenAPI 3.0 documentation, webhook support for real-time events, OAuth2 for third-party app authorization, an integration directory with 20+ categories of pre-built connectors, a developer portal, Zapier/Make connector for no-code automation, vendor network for builder-vendor connections, and construction-specific integrations (building departments, cameras, drones, equipment rental, bank feeds, appliance dealers, energy modeling, smart home, license verification, weather, flood maps, building codes)."
      workflow={['Browse Marketplace', 'Install/Connect', 'Configure Sync', 'Monitor Health', 'Build via API']}
      features={[
        'Public REST API with OpenAPI 3.0 spec and interactive Swagger UI documentation',
        'API authentication: API keys (server-to-server) and OAuth2 authorization code flow (user-facing apps)',
        'Rate limiting tiered by plan: Starter 100/min, Professional 500/min, Business 2000/min, Enterprise custom',
        'URL-based API versioning (/api/v1/, /api/v2/) with 12-month deprecation policy',
        'Webhook system with event-driven subscriptions, HMAC-SHA256 signed payloads, and retry logic',
        'Webhook delivery log with replay capability for failed deliveries',
        'OAuth2 provider: scoped permissions, token refresh, builder-visible authorized app list with revocation',
        'Integration marketplace: browse by 20+ categories, search, one-click install, ratings/reviews',
        'Featured integrations and install counts for discovery',
        'Accounting: QuickBooks Online, QuickBooks Desktop, Xero, Sage, FreshBooks, Viewpoint',
        'Design tools: Chief Architect, AutoCAD, Revit, SketchUp plan import',
        'Calendar: Google Calendar, Outlook Calendar, iCal two-way sync',
        'Communication: Slack, Microsoft Teams, Gmail, Outlook email with AI auto-filing',
        'Storage: Google Drive, Dropbox, OneDrive, Box document sync',
        'Automation: Zapier, Make (Integromat), n8n with triggers, actions, and searches',
        'Payments: Stripe, Square, ACH providers for online client payments',
        'E-signature: DocuSign with multi-party routing, bulk send, envelope tracking',
        'Financial feeds: Plaid bank feeds for transaction reconciliation, credit card feeds with receipt matching',
        'Suppliers: 84 Lumber, ABC Supply, Ferguson appliances with real-time pricing and delivery tracking',
        'Cost data: RSMeans, Craftsman National for regional cost data in estimating',
        'Building department APIs: Accela, CityView, eTRAKiT for permit submission and status',
        'Construction cameras: EarthCam, Sensera, TrueLook for time-lapse import and live feeds',
        'Drone services: DroneDeploy, Skydio for orthomosaics, elevation models, progress photos',
        'Equipment rental: United Rentals, Sunbelt for start/stop tracking and invoice automation',
        'Title company: draw documentation and lien waiver exchange, closing document packages',
        'Surveyor: LandXML, DXF/DWG import with boundary, topo, ALTA, and as-built surveys',
        'Energy modeling: REM/Rate, EnergyGauge, Ekotrope for HERS ratings, Manual J/D calculations',
        'Smart home: Savant, Control4, Crestron, Lutron for specs, pre-wire docs, equipment lists',
        'Site services: dumpster and portable toilet auto-scheduling by construction phase',
        'License verification: state contractor licensing databases for all 50 states with expiration monitoring',
        'Geospatial: FEMA flood maps (auto flood zone), county GIS, Google Maps/Mapbox for project mapping',
        'Weather: NOAA forecasts, severe weather alerts, historical data, tide schedules for coastal builders',
        'Building codes: ICC Digital Codes, UpCodes, MuniCode for jurisdiction-specific code lookup',
        'Email integration: project-specific inbound routing, AI auto-file to project/vendor, thread preservation',
        'Circuit breaker pattern: auto-disable integrations after configurable failure threshold',
        'Integration health monitoring: error rates, response times, failure patterns per integration',
        'Admin kill-switch to disable faulty integrations across all tenants',
        'Developer portal: interactive docs, SDKs (JS, Python, C#), webhook testing, app submission workflow',
        'Revenue sharing for paid integrations (70/30 developer/platform split)',
        'Vendor network: directory searchable by trade, location, rating, insurance, with cross-tenant ratings',
        'Vendor premium listings with featured placement and dispute workflow for reviews',
      ]}
      connections={[
        { name: 'Auth & Access Control', type: 'input', description: 'API authentication, OAuth2 provider, scoped permissions (Module 1)' },
        { name: 'Core Data Model', type: 'bidirectional', description: 'API exposes all core entities (Module 3)' },
        { name: 'Subscription Billing', type: 'input', description: 'API tier rate limits, paid integration billing (Module 43)' },
        { name: 'Template Marketplace', type: 'bidirectional', description: 'Template listings within integration marketplace (Module 48)' },
        { name: 'Notification Engine', type: 'output', description: 'Webhook event dispatch, integration alerts (Module 5)' },
        { name: 'All Modules', type: 'bidirectional', description: 'API endpoints for every module, webhook events for all entity changes' },
        { name: 'Stripe Connect', type: 'output', description: 'Payment processing for paid integrations and developer revenue share' },
        { name: 'Vendor Management', type: 'bidirectional', description: 'Vendor directory, cross-tenant ratings, compliance verification (Module 10)' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'builder_id', type: 'uuid', required: true, description: 'FK to builders (multi-tenant)' },
        { name: 'api_key_hash', type: 'string', description: 'SHA-256 hash of API key' },
        { name: 'api_key_prefix', type: 'string', description: 'First 8 chars for identification' },
        { name: 'scopes', type: 'text[]', description: 'API permission scopes (read:projects, write:invoices, etc.)' },
        { name: 'rate_limit', type: 'integer', description: 'Requests per minute based on plan tier' },
        { name: 'oauth_client_id', type: 'string', description: 'OAuth2 application client ID' },
        { name: 'oauth_client_secret_hash', type: 'string', description: 'OAuth2 client secret hash' },
        { name: 'webhook_url', type: 'string', description: 'Webhook delivery URL' },
        { name: 'webhook_events', type: 'text[]', description: 'Subscribed event types' },
        { name: 'webhook_secret_hash', type: 'string', description: 'HMAC signing secret hash' },
        { name: 'webhook_failure_count', type: 'integer', description: 'Consecutive delivery failures' },
        { name: 'integration_listing_id', type: 'uuid', description: 'FK to marketplace listing' },
        { name: 'listing_slug', type: 'string', description: 'URL-friendly integration identifier' },
        { name: 'listing_category', type: 'string', description: 'Integration category (accounting, construction, etc.)' },
        { name: 'pricing_type', type: 'string', description: 'free, paid, freemium' },
        { name: 'install_count', type: 'integer', description: 'Number of builder installations' },
        { name: 'avg_rating', type: 'decimal', description: 'Average review rating (1-5)' },
        { name: 'install_status', type: 'string', required: true, description: 'active, paused, error, disconnected' },
        { name: 'install_config', type: 'jsonb', description: 'Integration-specific configuration settings' },
        { name: 'last_sync_at', type: 'timestamp', description: 'Last successful sync time' },
        { name: 'health_score', type: 'decimal', description: 'Integration health percentage (error rate, response time)' },
        { name: 'circuit_breaker_status', type: 'string', description: 'closed, open, half_open' },
      ]}
      aiFeatures={[
        {
          name: 'Sync Conflict Resolution',
          description: 'Detects and resolves sync conflicts: "QuickBooks vendor ABC Lumber has different ID than RossOS record. Auto-merge available based on name + EIN match."',
          trigger: 'On sync conflict'
        },
        {
          name: 'Integration Recommendations',
          description: 'Suggests connections based on usage patterns: "You manually enter 8 permit statuses/week. Installing Accela integration could save 2+ hours/week."',
          trigger: 'On usage pattern analysis'
        },
        {
          name: 'Health Monitoring',
          description: 'Proactive health alerts: "QuickBooks error rate increased to 5% in last hour. Circuit breaker at 80% threshold. Investigating API rate limit changes."',
          trigger: 'On health threshold breach'
        },
        {
          name: 'Email Auto-Filing',
          description: 'AI auto-files captured emails to correct project: "Email from john@smithfamily.com filed to Smith Residence based on sender match and subject reference."',
          trigger: 'On email capture'
        },
        {
          name: 'Bank Transaction Coding',
          description: 'Suggests job and cost code for unmatched bank transactions: "Transaction $1,245 from Lowes matches Smith Residence framing materials. Suggest code 06-100."',
          trigger: 'On unmatched transaction'
        },
        {
          name: 'Duplicate Entity Detection',
          description: 'Identifies duplicates across integrated systems: "Vendor ABC Lumber exists in QBO as ABC Lumber Supply. Confidence: 94%. Merge or keep separate?"',
          trigger: 'On sync completion'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Integrations & API Marketplace                                      │
├─────────────────────────────────────────────────────────────────────┤
│ Tabs: Connected (6) | Marketplace (17) | Webhooks (2) | API (2)    │
│ Health: 99.2% | API Calls: 16,268/mo | Avg Response: 142ms         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ CONNECTED INTEGRATIONS                                              │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ QuickBooks Online         ✓ Connected | Health: 99.2% | CB: OK │ │
│ │   Syncing: Customers, Vendors, Invoices, Bills, Payments        │ │
│ │   Last sync: 5 min ago | Next: 25 min                          │ │
│ │   [Configure] [Sync Now] [View Log] [Disconnect]               │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ Plaid (Bank Feed)         ✓ Connected | 2 unmatched txns       │ │
│ │   12 transactions imported, 10 auto-matched                     │ │
│ │   [Configure] [View Unmatched] [Disconnect]                    │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ NOAA Weather              ✓ Connected | Hurricane Watch active  │ │
│ │   10-day forecast, severe alerts, tide schedules                │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ MARKETPLACE (search by 20+ categories)                              │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐    │
│ │ ★ Stripe         │ │ ★ Zapier         │ │ ★ Ferguson       │    │
│ │   Free | 1247    │ │   Free | 2341    │ │   Free | 456     │    │
│ │   ★ 4.8 (89)     │ │   ★ 4.7 (156)    │ │   ★ 4.7 (52)     │    │
│ │   [Connect]      │ │   [Connect]      │ │   [Connect]      │    │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘    │
│                                                                     │
│ WEBHOOKS: 2 active | API KEYS: 2 | OAuth: Ready                   │
├─────────────────────────────────────────────────────────────────────┤
│ AI: Duplicate vendor detected in QBO sync. Bank feed: 2 unmatched.  │
│ Accela would save 2+ hrs/week on permit status checks.              │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
