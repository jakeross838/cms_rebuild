'use client'

import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  ArrowDown,
  ArrowUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const priceData = [
  { material: '2x6 SPF #2 Lumber', unit: 'MBF', vendors: [{ name: 'Gulf Lumber', price: 485, trend: 'down' }, { name: 'BuilderFirst', price: 512, trend: 'up' }, { name: 'Coastal Supply', price: 498, trend: 'down' }], bestPrice: 485, confidence: 94 },
  { material: 'Concrete (4000 PSI)', unit: 'CY', vendors: [{ name: 'Redi-Mix Co', price: 165, trend: 'up' }, { name: 'Gulf Concrete', price: 158, trend: 'up' }, { name: 'Coastal Supply', price: 172, trend: 'up' }], bestPrice: 158, confidence: 91 },
  { material: '30-Year Arch Shingles', unit: 'SQ', vendors: [{ name: 'ABC Supply', price: 142, trend: 'down' }, { name: 'BuilderFirst', price: 148, trend: 'down' }, { name: 'Roof Depot', price: 139, trend: 'down' }], bestPrice: 139, confidence: 88 },
  { material: '1/2" Drywall (4x12)', unit: 'Sheet', vendors: [{ name: 'Gulf Lumber', price: 14.85, trend: 'up' }, { name: 'BuilderFirst', price: 15.20, trend: 'up' }, { name: 'Coastal Supply', price: 14.50, trend: 'down' }], bestPrice: 14.50, confidence: 96 },
  { material: 'R-30 Fiberglass Batt', unit: 'SF', vendors: [{ name: 'Insulation Pro', price: 1.12, trend: 'down' }, { name: 'BuilderFirst', price: 1.28, trend: 'up' }, { name: 'Coastal Supply', price: 1.18, trend: 'down' }], bestPrice: 1.12, confidence: 87 },
  { material: '3/4" CDX Plywood', unit: 'Sheet', vendors: [{ name: 'Gulf Lumber', price: 52.40, trend: 'down' }, { name: 'BuilderFirst', price: 55.80, trend: 'up' }, { name: 'Coastal Supply', price: 54.10, trend: 'down' }], bestPrice: 52.40, confidence: 92 },
]

const anomalies = [
  { material: 'Copper Wire (12/2 NM)', message: 'Price up 18% in 30 days - consider locking orders', severity: 'high' },
  { material: 'PVC Pipe (4" DWV)', message: 'Vendor B charging 22% above market average', severity: 'medium' },
  { material: 'Concrete (4000 PSI)', message: 'All vendors trending up - seasonal demand increase', severity: 'low' },
]

const vendorSpend = [
  { vendor: 'Gulf Lumber', spend: 184500, percentage: 32 },
  { vendor: 'BuilderFirst Supply', spend: 142800, percentage: 25 },
  { vendor: 'Coastal Supply Co', spend: 98400, percentage: 17 },
  { vendor: 'ABC Supply', spend: 82100, percentage: 14 },
  { vendor: 'Others (6)', spend: 68200, percentage: 12 },
]

export default function PriceIntelligencePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Material & Labor Price Intelligence</h1>
            <p className="text-sm text-muted-foreground">Module 23 -- Compare prices, track savings, detect anomalies across vendors</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search materials..." className="pl-8 pr-3 py-1.5 text-sm border rounded-lg w-48" />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg text-muted-foreground hover:bg-accent">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingDown className="h-4 w-4 text-green-600" />Savings YTD</div>
          <div className="text-2xl font-bold mt-1">$47,280</div>
          <div className="text-xs text-green-600 mt-1">8.2% below market average</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><AlertTriangle className="h-4 w-4 text-amber-600" />Missed Savings</div>
          <div className="text-2xl font-bold mt-1">$12,450</div>
          <div className="text-xs text-amber-600 mt-1">3 POs placed above best price</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><BarChart3 className="h-4 w-4 text-blue-600" />Materials Tracked</div>
          <div className="text-2xl font-bold mt-1">248</div>
          <div className="text-xs text-muted-foreground mt-1">Across 14 vendors</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4 text-purple-600" />Avg Confidence</div>
          <div className="text-2xl font-bold mt-1">91%</div>
          <div className="text-xs text-muted-foreground mt-1">Price accuracy score</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Price Comparison Table */}
        <div className="col-span-2 bg-card border rounded-lg">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Price Comparison</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time prices from your top vendors</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-2 px-4 font-medium text-muted-foreground">Material</th>
                  <th className="text-left py-2 px-4 font-medium text-muted-foreground">Unit</th>
                  <th className="text-center py-2 px-4 font-medium text-muted-foreground">Vendor A</th>
                  <th className="text-center py-2 px-4 font-medium text-muted-foreground">Vendor B</th>
                  <th className="text-center py-2 px-4 font-medium text-muted-foreground">Vendor C</th>
                  <th className="text-center py-2 px-4 font-medium text-muted-foreground">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {priceData.map((item, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="py-2.5 px-4 font-medium">{item.material}</td>
                    <td className="py-2.5 px-4 text-muted-foreground">{item.unit}</td>
                    {item.vendors.map((v, j) => (
                      <td key={j} className="py-2.5 px-4 text-center">
                        <span className={cn('font-medium', v.price === item.bestPrice && 'text-green-600')}>
                          ${v.price.toLocaleString()}
                        </span>
                        {v.trend === 'up' ? <ArrowUp className="inline h-3 w-3 ml-1 text-red-500" /> : <ArrowDown className="inline h-3 w-3 ml-1 text-green-500" />}
                      </td>
                    ))}
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${item.confidence}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{item.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Vendor Spend */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Vendor Spend Breakdown</h3>
            <div className="space-y-3">
              {vendorSpend.map((v, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{v.vendor}</span>
                    <span className="font-medium">${(v.spend / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${v.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anomaly Alerts */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Anomaly Alerts
            </h3>
            <div className="space-y-2">
              {anomalies.map((a, i) => (
                <div key={i} className={cn('p-2.5 rounded-lg text-xs', a.severity === 'high' ? 'bg-red-50 text-red-700 border border-red-200' : a.severity === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200')}>
                  <div className="font-medium">{a.material}</div>
                  <div className="mt-0.5 opacity-80">{a.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <div className="font-medium text-green-800">AI Price Intelligence</div>
            <p className="text-sm text-green-700 mt-1">Lumber prices dropping 6% this quarter -- lock framing POs now for Smith & Johnson jobs. Copper trending up 18% -- recommend pre-ordering electrical materials for upcoming starts. Your Gulf Lumber relationship saves you 8% vs market on average.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
