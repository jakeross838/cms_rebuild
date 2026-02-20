'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { InventoryPreview } from '@/components/skeleton/previews/inventory-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const inventoryWorkflow = ['Catalog Setup', 'Receive Materials', 'Issue to Job', 'Track Consumption', 'Reorder']

export default function InventoryPage() {
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
      {activeTab === 'preview' ? <InventoryPreview /> : <PageSpec
      title="Inventory & Materials"
      phase="Phase 3 - Financial Power"
      planFile="views/operations/INVENTORY.md"
      description="Track construction materials and supplies across warehouses, job sites, and vehicles. Manage receiving, transfers, consumption, and reorder points. Monitor stock levels, costs, and waste to keep projects on schedule and on budget."
      workflow={inventoryWorkflow}
      features={[
        'Item catalog with SKU, category, and UOM management',
        'Multi-location inventory (warehouse, job site, vehicle)',
        'Receive materials against purchase orders',
        'Transfer materials between locations',
        'Issue materials to specific jobs and cost codes',
        'Reorder point alerts and auto-PO generation',
        'Stock level monitoring with low/out-of-stock badges',
        'Barcode and QR code scanning for receiving and issuing',
        'Inventory valuation (FIFO, weighted average)',
        'Waste tracking and analysis per job',
        'Material consumption forecasting',
        'Vendor price comparison for reorders',
        'Physical inventory count and reconciliation',
        'Min/max stock level configuration per item',
        'Batch and lot tracking for compliance',
        'Return to vendor workflow',
        'AI-powered reorder prediction',
        'AI cost optimization across vendors',
        'AI waste analysis and cutting pattern suggestions',
      ]}
      connections={[
        { name: 'Purchase Orders', type: 'input', description: 'PO receiving populates inventory' },
        { name: 'Budget & Cost Tracking', type: 'output', description: 'Material costs flow to job budgets' },
        { name: 'Vendors', type: 'input', description: 'Vendor catalog and pricing' },
        { name: 'Equipment & Assets', type: 'bidirectional', description: 'Tool and equipment overlap tracking' },
        { name: 'Daily Logs', type: 'output', description: 'Material usage recorded in daily logs' },
        { name: 'Jobs', type: 'bidirectional', description: 'Job-level material requirements and consumption' },
        { name: 'Estimating', type: 'input', description: 'Material takeoffs feed inventory needs' },
        { name: 'Financial Reporting', type: 'output', description: 'Inventory valuation and COGS' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'company_id', type: 'uuid', required: true, description: 'Tenant company' },
        { name: 'name', type: 'string', required: true, description: 'Item name' },
        { name: 'sku', type: 'string', required: true, description: 'Stock keeping unit' },
        { name: 'description', type: 'text', description: 'Detailed item description' },
        { name: 'category', type: 'string', required: true, description: 'Material category' },
        { name: 'uom', type: 'string', required: true, description: 'Unit of measure (ft, ea, rolls, etc.)' },
        { name: 'unit_cost', type: 'decimal', required: true, description: 'Cost per unit' },
        { name: 'reorder_point', type: 'integer', description: 'Qty threshold triggering reorder alert' },
        { name: 'reorder_qty', type: 'integer', description: 'Default qty for reorder PO' },
        { name: 'preferred_vendor_id', type: 'uuid', description: 'Default vendor for reorders' },
        { name: 'barcode', type: 'string', description: 'Barcode or QR code value' },
        { name: 'is_active', type: 'boolean', required: true, description: 'Active catalog item flag' },
        { name: 'created_at', type: 'timestamp', required: true, description: 'Created timestamp' },
        { name: 'updated_at', type: 'timestamp', required: true, description: 'Last updated timestamp' },
        { name: 'location_id', type: 'uuid', required: true, description: 'Stock location (v2_inventory_stock)' },
        { name: 'item_id', type: 'uuid', required: true, description: 'Reference to catalog item (v2_inventory_stock)' },
        { name: 'qty_on_hand', type: 'decimal', required: true, description: 'Current quantity at location (v2_inventory_stock)' },
        { name: 'qty_reserved', type: 'decimal', description: 'Reserved for scheduled jobs (v2_inventory_stock)' },
        { name: 'qty_available', type: 'decimal', description: 'Available = on_hand - reserved (v2_inventory_stock)' },
        { name: 'last_counted_at', type: 'timestamp', description: 'Last physical count date (v2_inventory_stock)' },
        { name: 'last_received_at', type: 'timestamp', description: 'Last receiving date (v2_inventory_stock)' },
      ]}
      aiFeatures={[
        {
          name: 'Reorder Prediction',
          description: 'Predicts when stock will reach reorder point based on usage velocity. "12/2 Romex will hit reorder point in 5 days at current consumption rate."',
          trigger: 'Daily analysis',
        },
        {
          name: 'Cost Optimization',
          description: 'Compares vendor pricing across suppliers. "PEX fittings 18% cheaper from HD Supply. Switching saves $340/month."',
          trigger: 'On reorder',
        },
        {
          name: 'Waste Analysis',
          description: 'Tracks material waste per job vs industry benchmarks. "Drywall waste 8.2% on Smith Residence (industry avg 5%). Suggests reviewing cutting patterns."',
          trigger: 'Weekly report',
        },
        {
          name: 'Usage Forecasting',
          description: 'Projects material needs across all active jobs. "Based on 3 active projects, lumber consumption spikes 40% next month."',
          trigger: 'Weekly forecast',
        },
        {
          name: 'Transfer Optimization',
          description: 'Suggests transfers between locations to avoid rush orders. "Harbor View has 80 ft surplus copper pipe. Smith Residence needs 200 ft. Transfer saves 2-day lead time."',
          trigger: 'On low stock alert',
        },
      ]}
      mockupAscii={`
+---------------------------------------------------------------------+
| Inventory & Materials                     Total: 12 items | $11.7K   |
+---------------------------------------------------------------------+
| [Total Items] [Total Value] [Low Stock Alerts] [Pending Transfers]   |
|     12            $11.7K         5                   3               |
+---------------------------------------------------------------------+
| Search: [________________]  Location: [All v]  Category: [All v]     |
| [All] [In Stock] [Low Stock] [Out of Stock]                         |
+---------------------------------------------------------------------+
| Item Name              SKU           Cat     Loc     Qty   Status    |
| 12/2 Romex NM-B Wire   ELEC-1202    Elec    WH      2400  In Stock  |
| 2x4x8 SPF Studs        LBR-2048     Lumber  WH      850   In Stock  |
| 1/2" Type L Copper      PLMB-050     Plumb   Smith   120   Low Stock |
| 5/8" Drywall Sheets     DRY-058      DW      WH      240   In Stock  |
| PEX Crimp Rings 3/4"    PLMB-PEX     Plumb   Trk#3   45   Low Stock |
| Concrete Mix 80lb        CONC-080     Conc    Harbor  32    In Stock  |
| 3" PVC DWV Pipe          PLMB-300     Plumb   WH      0    Out Stock |
+---------------------------------------------------------------------+
| AI: Romex running low. Order 5,000 ft by Feb 25. PVC out of stock   |
| for Harbor View rough-in Feb 22. PEX 18% cheaper at HD Supply.      |
+---------------------------------------------------------------------+
`}
    />}
    </div>
  )
}
