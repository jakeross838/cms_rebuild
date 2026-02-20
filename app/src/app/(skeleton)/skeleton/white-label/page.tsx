'use client'

import {
  Paintbrush,
  Globe,
  Mail,
  Smartphone,
  Eye,
  Palette,
  Type,
  Image,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Monitor,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const colorSwatches = [
  { name: 'Primary', hex: '#1E40AF', label: 'Brand Blue' },
  { name: 'Secondary', hex: '#0F766E', label: 'Teal Accent' },
  { name: 'Background', hex: '#F8FAFC', label: 'Light Gray' },
  { name: 'Text', hex: '#1E293B', label: 'Slate Dark' },
  { name: 'Success', hex: '#16A34A', label: 'Green' },
  { name: 'Warning', hex: '#D97706', label: 'Amber' },
]

const brandingAreas = [
  { area: 'Login Page', status: 'configured', description: 'Custom logo, background, tagline' },
  { area: 'Client Portal', status: 'configured', description: 'Full branding with custom domain' },
  { area: 'Email Templates', status: 'configured', description: 'Logo, colors, footer branding' },
  { area: 'PDF Reports', status: 'partial', description: 'Logo and header configured' },
  { area: 'Mobile App', status: 'pending', description: 'Splash screen and icon' },
  { area: 'Vendor Portal', status: 'pending', description: 'Logo and color scheme' },
]

const portalConfig = {
  domain: 'portal.rossbuiltconstruction.com',
  sslStatus: 'active',
  customLogin: true,
  favicon: 'rossbuilt-favicon.ico',
}

const fontOptions = [
  { name: 'Inter', sample: 'The quick brown fox', selected: true, category: 'Body' },
  { name: 'Plus Jakarta Sans', sample: 'The quick brown fox', selected: true, category: 'Headings' },
  { name: 'JetBrains Mono', sample: 'The quick brown fox', selected: false, category: 'Monospace' },
]

const emailBranding = {
  fromName: 'Ross Built Construction',
  fromEmail: 'updates@rossbuiltconstruction.com',
  replyTo: 'info@rossbuiltconstruction.com',
  footerText: 'Ross Built Construction LLC | Austin, TX | License #12345',
}

export default function WhiteLabelBrandingPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Paintbrush className="h-6 w-6 text-pink-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">White Label & Branding</h1>
            <p className="text-sm text-muted-foreground">Module 44 -- Customize every touchpoint with your brand</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm border rounded-lg text-muted-foreground hover:bg-accent flex items-center gap-1.5">
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button className="px-4 py-2 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700">Save Changes</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Main Branding */}
        <div className="col-span-2 space-y-6">
          {/* Logo & Identity */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Image className="h-4 w-4 text-pink-600" />Logo & Identity</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center mb-2">
                  <Image className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium">Primary Logo</div>
                <div className="text-xs text-muted-foreground">400x120px recommended</div>
                <button className="text-xs text-pink-600 mt-2">Upload</button>
              </div>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-2">
                  <Image className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium">Icon / Favicon</div>
                <div className="text-xs text-muted-foreground">64x64px square</div>
                <button className="text-xs text-pink-600 mt-2">Upload</button>
              </div>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-lg flex items-center justify-center mb-2">
                  <Image className="h-8 w-8 text-slate-400" />
                </div>
                <div className="text-sm font-medium">Dark Mode Logo</div>
                <div className="text-xs text-muted-foreground">Light version for dark bg</div>
                <button className="text-xs text-pink-600 mt-2">Upload</button>
              </div>
            </div>
          </div>

          {/* Color Palette */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Palette className="h-4 w-4 text-pink-600" />Color Palette</h3>
            <div className="grid grid-cols-6 gap-4">
              {colorSwatches.map((c, i) => (
                <div key={i} className="text-center">
                  <div className="w-full aspect-square rounded-lg border-2 border-transparent hover:border-pink-300 cursor-pointer transition-colors mb-2" style={{ backgroundColor: c.hex }} />
                  <div className="text-xs font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.hex}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Type className="h-4 w-4 text-pink-600" />Typography</h3>
            <div className="space-y-3">
              {fontOptions.map((f, i) => (
                <div key={i} className={cn('flex items-center justify-between p-3 rounded-lg border', f.selected ? 'border-pink-200 bg-pink-50/50' : 'border-transparent bg-muted/30')}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{f.name}</span>
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{f.category}</span>
                    </div>
                    <div className="text-muted-foreground text-sm mt-0.5" style={{ fontFamily: f.name }}>{f.sample}</div>
                  </div>
                  {f.selected && <CheckCircle2 className="h-5 w-5 text-pink-600" />}
                </div>
              ))}
            </div>
          </div>

          {/* Email Branding */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Mail className="h-4 w-4 text-pink-600" />Email Branding</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">From Name</label>
                <div className="mt-1 px-3 py-2 bg-muted/30 rounded-lg text-sm">{emailBranding.fromName}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">From Email</label>
                <div className="mt-1 px-3 py-2 bg-muted/30 rounded-lg text-sm">{emailBranding.fromEmail}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Reply-To</label>
                <div className="mt-1 px-3 py-2 bg-muted/30 rounded-lg text-sm">{emailBranding.replyTo}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Footer Text</label>
                <div className="mt-1 px-3 py-2 bg-muted/30 rounded-lg text-sm text-xs">{emailBranding.footerText}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Portal URL */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Globe className="h-4 w-4 text-pink-600" />Portal URL</h3>
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-sm font-mono font-medium flex items-center gap-2">
                {portalConfig.domain}
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />SSL Active
                </span>
                <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded">Custom Domain</span>
              </div>
            </div>
            <button className="w-full mt-3 text-sm text-pink-600 hover:text-pink-700 font-medium">Configure Domain</button>
          </div>

          {/* Branding Areas Status */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Monitor className="h-4 w-4 text-pink-600" />Branding Areas</h3>
            <div className="space-y-2">
              {brandingAreas.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">{b.area}</div>
                    <div className="text-xs text-muted-foreground">{b.description}</div>
                  </div>
                  <span className={cn('text-xs px-2 py-0.5 rounded', b.status === 'configured' ? 'bg-green-100 text-green-700' : b.status === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-warm-100 text-warm-600')}>
                    {b.status === 'configured' ? 'Done' : b.status === 'partial' ? 'Partial' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile App Branding */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Smartphone className="h-4 w-4 text-pink-600" />Mobile App</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-28 bg-muted rounded-xl border-2 flex items-center justify-center">
                <Image className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="text-muted-foreground">App Icon:</span> <span className="text-amber-600">Not set</span></div>
                <div><span className="text-muted-foreground">Splash:</span> <span className="text-amber-600">Not set</span></div>
                <div><span className="text-muted-foreground">Theme:</span> <span className="text-green-600">Brand colors</span></div>
                <button className="text-xs text-pink-600 font-medium">Configure</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-pink-600 mt-0.5" />
          <div>
            <div className="font-medium text-pink-800">Branding Tip</div>
            <p className="text-sm text-pink-700 mt-1">Your color contrast ratios meet WCAG AA standards. The client portal is fully branded but the vendor portal and mobile app still need attention. Consistent branding across all touchpoints increases client trust by 33% on average.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
