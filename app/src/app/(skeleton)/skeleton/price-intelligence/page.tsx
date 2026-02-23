'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { PriceIntelligencePreview } from '@/components/skeleton/previews/price-intelligence-preview'
import { cn } from '@/lib/utils'

export default function PriceIntelligencePage() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'preview'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <Eye className="h-4 w-4" />
          UI Preview
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'spec'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Specification
        </button>
      </div>

      {/* Content */}
      {activeTab === 'preview' ? (
        <PriceIntelligencePreview />
      ) : (
        <PageSpec
          title="Material & Labor Price Intelligence"
          phase="Phase 4 - Intelligence"
          planFile="docs/modules/23-price-intelligence.md"
          description="Price tracking and intelligence system that monitors material costs and subcontractor labor pricing over time, detects pricing anomalies, compares supplier pricing, forecasts cost escalation, and quantifies actual savings."
          workflow={['Invoices/Quotes', 'AI Extraction', 'Item Matching', 'Price Database', 'Comparison Engine', 'Alerts & Savings']}
          features={[
            'Material price tracking with category grouping (organic growth from invoices)',
            'Dynamic vendor columns — compare any number of vendors side by side',
            'Unit conversion toggle ($/each, $/sf, $/lf, $/bf)',
            'Confidence scoring (0-100) based on data points, recency, and stability',
            'Price anomaly detection with severity levels (info/warning/alert)',
            'Supplier price comparison with quality-adjusted scoring',
            'Vendor rate sheet management (pre-negotiated pricing)',
            'Quote ingestion (PDF, Excel, CSV) with AI extraction',
            'PO budget gate — blocks overspend and suggests better prices',
            'Material list optimizer (best vendor split with waste factors)',
            'Savings tracking by job, vendor, and category',
            'Spend analytics with AI negotiation insights',
            'Cost escalation forecasting (3/6/12 month)',
            'Subcontractor labor comparison with value scoring',
            'Scope checklist tracking for labor quote normalization',
            'Item normalization with AI + human review queue',
          ]}
          connections={[
            { name: 'Invoices (M11/M13)', type: 'input', description: 'Invoice data feeds material price tracking' },
            { name: 'Purchase Orders (M18)', type: 'input', description: 'PO data feeds price tracking; PO alert system' },
            { name: 'Estimating Engine (M20)', type: 'output', description: 'Primary consumer of price suggestions' },
            { name: 'Vendors (M10)', type: 'input', description: 'Vendor records for supplier comparison' },
            { name: 'Vendor Performance (M22)', type: 'input', description: 'Quality scores for price-to-quality ratio' },
            { name: 'Budget (M9)', type: 'input', description: 'Budget data for PO budget gate' },
            { name: 'Bid Management (M26)', type: 'input', description: 'Labor quotes feed labor pricing' },
          ]}
          dataFields={[
            { name: 'master_items', type: 'table', description: 'Normalized material catalog with standard naming' },
            { name: 'vendor_item_aliases', type: 'table', description: 'Maps vendor descriptions to master items' },
            { name: 'price_history', type: 'table', description: 'Every price point from invoices, quotes, manual entry' },
            { name: 'price_confidence', type: 'table', description: 'Data strength per item/vendor combination' },
            { name: 'purchase_decisions', type: 'table', description: 'Tracks actual vs optimal purchase choices' },
            { name: 'labor_quotes', type: 'table', description: 'Subcontractor quotes with scope tracking' },
            { name: 'labor_price_history', type: 'table', description: 'Normalized labor prices for comparison' },
            { name: 'sub_job_performance', type: 'table', description: 'Post-job ratings and performance metrics' },
          ]}
          aiFeatures={[
            { name: 'Item Normalization', description: 'AI matches vendor descriptions to master catalog items using fuzzy matching and classification.', trigger: 'On every invoice/quote extraction' },
            { name: 'Price Anomaly Detection', description: 'Flags prices that deviate significantly from historical averages with severity levels and explanations.', trigger: 'On invoice/quote receipt, daily scan' },
            { name: 'PO Budget Gate', description: 'Checks PO prices against best known prices and remaining budget. Blocks overspend.', trigger: 'On PO creation or modification' },
            { name: 'Cost Escalation Forecast', description: 'Projects forward expected material costs based on historical trends and seasonal patterns.', trigger: 'Weekly recalculation' },
            { name: 'Negotiation Insights', description: 'Generates vendor-specific negotiation strategies based on spend volume and pricing data.', trigger: 'Monthly analysis' },
            { name: 'Sub Value Scoring', description: 'Scores subcontractors 0-100 balancing price, quality, schedule performance, and callbacks.', trigger: 'On quote receipt, post-job rating' },
          ]}
        />
      )}
    </div>
  )
}
