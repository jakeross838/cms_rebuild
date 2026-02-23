'use client'

import {
  Megaphone,
  Star,
  Eye,
  Camera,
  Share2,
  FileText,
  ExternalLink,
  Users,
  Globe,
} from 'lucide-react'

import { cn } from '@/lib/utils'

const portfolioProjects = [
  { name: 'Oceanfront Estate', type: 'New Construction', sqft: '6,200', value: '$2.8M', photos: 48, status: 'Published', featured: true },
  { name: 'Downtown Loft Renovation', type: 'Renovation', sqft: '2,100', value: '$420K', photos: 32, status: 'Published', featured: true },
  { name: 'Lakeside Modern', type: 'New Construction', sqft: '4,800', value: '$1.9M', photos: 56, status: 'Published', featured: false },
  { name: 'Historic Bungalow Restore', type: 'Renovation', sqft: '1,800', value: '$310K', photos: 24, status: 'Draft', featured: false },
  { name: 'Coastal Farmhouse', type: 'New Construction', sqft: '3,400', value: '$1.2M', photos: 41, status: 'Published', featured: true },
]

const reviewSources = [
  { source: 'Google Business', rating: 4.9, count: 87, trend: '+4 this month' },
  { source: 'Houzz', rating: 4.8, count: 42, trend: '+2 this month' },
  { source: 'BuildZoom', rating: 4.7, count: 28, trend: '+1 this month' },
  { source: 'Facebook', rating: 4.8, count: 35, trend: '+3 this month' },
]

const leadSources = [
  { source: 'Google Ads', leads: 24, conversions: 6, cpl: 185, roi: '340%' },
  { source: 'Referrals', leads: 18, conversions: 9, cpl: 0, roi: 'N/A' },
  { source: 'Houzz Profile', leads: 12, conversions: 3, cpl: 42, roi: '520%' },
  { source: 'Website Organic', leads: 15, conversions: 4, cpl: 28, roi: '680%' },
]

const caseStudies = [
  { title: 'Oceanfront Estate: Overcoming Coastal Challenges', status: 'Published', views: 1240 },
  { title: 'Historic Bungalow: Preserving Character with Modern Comfort', status: 'Published', views: 890 },
  { title: 'Lakeside Modern: Energy-Efficient Design in Practice', status: 'Draft', views: 0 },
]

export default function MarketingPortfolioPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-warm-100 rounded-lg">
            <Megaphone className="h-6 w-6 text-warm-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Marketing & Portfolio</h1>
            <p className="text-sm text-muted-foreground">Module 37 -- Showcase projects, manage reviews, track marketing ROI</p>
          </div>
        </div>
        <button className="px-4 py-2 text-sm bg-stone-700 text-white rounded-lg hover:bg-stone-800">+ New Case Study</button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Star className="h-4 w-4 text-amber-500" />Avg Rating</div>
          <div className="text-2xl font-bold mt-1">4.8</div>
          <div className="text-xs text-green-600 mt-1">192 total reviews</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Camera className="h-4 w-4 text-stone-600" />Portfolio Projects</div>
          <div className="text-2xl font-bold mt-1">23</div>
          <div className="text-xs text-muted-foreground mt-1">4 published this quarter</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4 text-green-600" />Leads This Month</div>
          <div className="text-2xl font-bold mt-1">69</div>
          <div className="text-xs text-green-600 mt-1">+12% vs last month</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Globe className="h-4 w-4 text-stone-600" />Website Visitors</div>
          <div className="text-2xl font-bold mt-1">3,842</div>
          <div className="text-xs text-green-600 mt-1">+18% vs last month</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Portfolio Grid */}
        <div className="col-span-2 bg-card border rounded-lg">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Portfolio Projects</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Showcase your best work</p>
            </div>
            <button className="text-sm text-stone-600 hover:text-warm-700 font-medium">View All</button>
          </div>
          <div className="divide-y">
            {portfolioProjects.map((p, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {p.name}
                      {p.featured ? <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Featured</span> : null}
                    </div>
                    <div className="text-xs text-muted-foreground">{p.type} -- {p.sqft} SF -- {p.value}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{p.photos} photos</span>
                  <span className={cn('text-xs px-2 py-0.5 rounded', p.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-warm-100 text-warm-600')}>{p.status}</span>
                  <button className="p-1 hover:bg-muted rounded"><ExternalLink className="h-4 w-4 text-muted-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Review Scores */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" />Review Scores</h3>
            <div className="space-y-3">
              {reviewSources.map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{r.source}</div>
                    <div className="text-xs text-muted-foreground">{r.count} reviews</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-semibold">{r.rating}</span>
                    </div>
                    <div className="text-xs text-green-600">{r.trend}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Stats */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Share2 className="h-4 w-4 text-stone-600" />Social Media</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                <div className="text-lg font-bold">2.4K</div>
                <div className="text-xs text-muted-foreground">Instagram</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                <div className="text-lg font-bold">1.8K</div>
                <div className="text-xs text-muted-foreground">Facebook</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                <div className="text-lg font-bold">680</div>
                <div className="text-xs text-muted-foreground">LinkedIn</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                <div className="text-lg font-bold">42</div>
                <div className="text-xs text-muted-foreground">Posts/Mo</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Source ROI */}
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Lead Source ROI</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Track which channels drive the best leads</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Source</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">Leads</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">Conversions</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">Cost/Lead</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leadSources.map((l, i) => (
                <tr key={i} className="hover:bg-muted/30">
                  <td className="py-2.5 px-4 font-medium">{l.source}</td>
                  <td className="py-2.5 px-4 text-center">{l.leads}</td>
                  <td className="py-2.5 px-4 text-center">{l.conversions}</td>
                  <td className="py-2.5 px-4 text-center">{l.cpl > 0 ? `$${l.cpl}` : 'Free'}</td>
                  <td className="py-2.5 px-4 text-center font-medium text-green-600">{l.roi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Studies */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-stone-600" />Case Studies</h3>
        <div className="space-y-2">
          {caseStudies.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="text-sm font-medium">{c.title}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                  <span className={cn('px-1.5 py-0.5 rounded', c.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-warm-100 text-warm-600')}>{c.status}</span>
                  {c.views > 0 && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{c.views.toLocaleString()} views</span>}
                </div>
              </div>
              <button className="text-sm text-stone-600 hover:text-warm-700">Edit</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
