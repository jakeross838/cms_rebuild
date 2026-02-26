'use client'

import { useEffect, useState } from 'react'

import { Building2, Loader2, Save, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface CompanyProfile {
  id: string
  name: string
  legalName: string | null
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  primaryColor: string | null
  subscriptionTier: string
  subscriptionStatus: string
  trialEndsAt: string | null
}

interface CompanySettings {
  invoiceApprovalThreshold: number
  poApprovalThreshold: number
  defaultMarkupPercent: number
  defaultRetainagePercent: number
  defaultPaymentTerms: string
  fiscalYearStartMonth: number
  timezone: string
  dateFormat: string
  currency: string
  measurementSystem: 'imperial' | 'metric'
  autoMatchConfidence: number
  costCodeSuggestionEnabled: boolean
  riskDetectionEnabled: boolean
  invoiceAutoRouteThreshold: number
  clientPortalEnabled: boolean
  vendorPortalEnabled: boolean
  allowClientPhotoUpload: boolean
  showBudgetToClients: boolean
  emailNotificationsEnabled: boolean
  pushNotificationsEnabled: boolean
  digestFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
}

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Per-tab form state
  const [profile, setProfile] = useState({
    name: '', legalName: '', email: '', phone: '', website: '',
    address: '', city: '', state: '', zip: '', primaryColor: '#2563eb',
  })
  const [financial, setFinancial] = useState({
    invoiceApprovalThreshold: 25000, poApprovalThreshold: 10000,
    defaultMarkupPercent: 18, defaultRetainagePercent: 10,
    defaultPaymentTerms: 'Net 30', fiscalYearStartMonth: 1,
  })
  const [regional, setRegional] = useState<{
    timezone: string
    dateFormat: string
    currency: string
    measurementSystem: 'imperial' | 'metric'
  }>({
    timezone: 'America/Chicago', dateFormat: 'MM/DD/YYYY',
    currency: 'USD', measurementSystem: 'imperial',
  })
  const [ai, setAi] = useState({
    autoMatchConfidence: 85, costCodeSuggestionEnabled: true,
    riskDetectionEnabled: true, invoiceAutoRouteThreshold: 5000,
  })
  const [portal, setPortal] = useState({
    clientPortalEnabled: false, vendorPortalEnabled: false,
    allowClientPhotoUpload: true, showBudgetToClients: false,
  })
  const [notifications, setNotifications] = useState<{
    emailNotificationsEnabled: boolean
    pushNotificationsEnabled: boolean
    digestFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
  }>({
    emailNotificationsEnabled: true, pushNotificationsEnabled: true,
    digestFrequency: 'daily',
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/v1/settings/company')
        if (!res.ok) throw new Error('Failed to load settings')
        const data = await res.json()
        setCompany(data.company)
        setSettings(data.settings)

        // Initialize form state from fetched data
        const c = data.company
        setProfile({
          name: c.name || '', legalName: c.legalName || '',
          email: c.email || '', phone: c.phone || '',
          website: c.website || '', address: c.address || '',
          city: c.city || '', state: c.state || '',
          zip: c.zip || '', primaryColor: c.primaryColor || '#2563eb',
        })

        const s = data.settings
        setFinancial({
          invoiceApprovalThreshold: s.invoiceApprovalThreshold,
          poApprovalThreshold: s.poApprovalThreshold,
          defaultMarkupPercent: s.defaultMarkupPercent,
          defaultRetainagePercent: s.defaultRetainagePercent,
          defaultPaymentTerms: s.defaultPaymentTerms,
          fiscalYearStartMonth: s.fiscalYearStartMonth,
        })
        setRegional({
          timezone: s.timezone,
          dateFormat: s.dateFormat,
          currency: s.currency,
          measurementSystem: s.measurementSystem,
        })
        setAi({
          autoMatchConfidence: s.autoMatchConfidence,
          costCodeSuggestionEnabled: s.costCodeSuggestionEnabled,
          riskDetectionEnabled: s.riskDetectionEnabled,
          invoiceAutoRouteThreshold: s.invoiceAutoRouteThreshold,
        })
        setPortal({
          clientPortalEnabled: s.clientPortalEnabled,
          vendorPortalEnabled: s.vendorPortalEnabled,
          allowClientPhotoUpload: s.allowClientPhotoUpload,
          showBudgetToClients: s.showBudgetToClients,
        })
        setNotifications({
          emailNotificationsEnabled: s.emailNotificationsEnabled,
          pushNotificationsEnabled: s.pushNotificationsEnabled,
          digestFrequency: s.digestFrequency,
        })
      } catch (err) {
        setError((err as Error)?.message || 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const showSuccess = (tab: string) => {
    setSuccess(tab)
    setTimeout(() => setSuccess(null), 3000)
  }

  const saveSection = async (tab: string, payload: Record<string, unknown>) => {
    setSaving(tab)
    setError(null)
    try {
      const res = await fetch('/api/v1/settings/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to save')
      }
      const data = await res.json()
      setCompany(data.company)
      setSettings(data.settings)
      showSuccess(tab)
      toast.success('Settings saved')
    } catch (err) {
      const msg = (err as Error)?.message || 'Failed to save'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          General Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your company profile and configuration
        </p>
      </div>

      {error ? (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="ai">AI & Automation</TabsTrigger>
          <TabsTrigger value="portals">Portals</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Company Name" id="company-name">
                  <Input id="company-name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="Legal Name" id="legal-name">
                  <Input id="legal-name" value={profile.legalName} onChange={(e) => setProfile({ ...profile, legalName: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="Email" id="company-email">
                  <Input id="company-email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="Phone" id="company-phone">
                  <Input id="company-phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="Website" id="company-website">
                  <Input id="company-website" value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="Primary Color">
                  <div className="flex items-center gap-2">
                    <input type="color" value={profile.primaryColor} onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })} className="h-10 w-10 rounded border cursor-pointer" />
                    <Input value={profile.primaryColor} onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })} className="flex-1" />
                  </div>
                </FieldGroup>
                <FieldGroup label="Address" id="company-address">
                  <Input id="company-address" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="City">
                  <Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="State">
                  <Input value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="Zip">
                  <Input value={profile.zip} onChange={(e) => setProfile({ ...profile, zip: e.target.value })} />
                </FieldGroup>
              </div>
              {company ? (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-foreground">Subscription</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Plan: <span className="font-medium capitalize">{company.subscriptionTier}</span>
                    {' '}&middot;{' '}
                    Status: <span className="font-medium capitalize">{company.subscriptionStatus}</span>
                    {company.trialEndsAt ? <> &middot; Trial ends: {new Date(company.trialEndsAt).toLocaleDateString()}</> : null}
                  </p>
                </div>
              ) : null}
            </CardContent>
            <CardFooter className="border-t justify-end gap-2">
              {success === 'profile' ? <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Saved</span> : null}
              <Button onClick={() => saveSection('profile', {
                name: profile.name, legalName: profile.legalName || null,
                email: profile.email || null, phone: profile.phone || null,
                website: profile.website || null, address: profile.address || null,
                city: profile.city || null, state: profile.state || null,
                zip: profile.zip || null, primaryColor: profile.primaryColor,
              })} disabled={saving === 'profile'}>
                {saving === 'profile' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Profile
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Financial Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Invoice Approval Threshold ($)">
                  <Input type="number" value={financial.invoiceApprovalThreshold} onChange={(e) => setFinancial({ ...financial, invoiceApprovalThreshold: Number(e.target.value) })} />
                </FieldGroup>
                <FieldGroup label="PO Approval Threshold ($)">
                  <Input type="number" value={financial.poApprovalThreshold} onChange={(e) => setFinancial({ ...financial, poApprovalThreshold: Number(e.target.value) })} />
                </FieldGroup>
                <FieldGroup label="Default Markup (%)">
                  <Input type="number" value={financial.defaultMarkupPercent} onChange={(e) => setFinancial({ ...financial, defaultMarkupPercent: Number(e.target.value) })} />
                </FieldGroup>
                <FieldGroup label="Default Retainage (%)">
                  <Input type="number" value={financial.defaultRetainagePercent} onChange={(e) => setFinancial({ ...financial, defaultRetainagePercent: Number(e.target.value) })} />
                </FieldGroup>
                <FieldGroup label="Payment Terms">
                  <select value={financial.defaultPaymentTerms} onChange={(e) => setFinancial({ ...financial, defaultPaymentTerms: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                  </select>
                </FieldGroup>
                <FieldGroup label="Fiscal Year Start Month">
                  <select value={financial.fiscalYearStartMonth} onChange={(e) => setFinancial({ ...financial, fiscalYearStartMonth: Number(e.target.value) })} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{new Date(2026, i).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </FieldGroup>
              </div>
            </CardContent>
            <CardFooter className="border-t justify-end gap-2">
              {success === 'financial' ? <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Saved</span> : null}
              <Button onClick={() => saveSection('financial', { settings: financial })} disabled={saving === 'financial'}>
                {saving === 'financial' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Financial
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Regional Tab */}
        <TabsContent value="regional">
          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Timezone">
                  <select value={regional.timezone} onChange={(e) => setRegional({ ...regional, timezone: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="America/New_York">Eastern (America/New_York)</option>
                    <option value="America/Chicago">Central (America/Chicago)</option>
                    <option value="America/Denver">Mountain (America/Denver)</option>
                    <option value="America/Los_Angeles">Pacific (America/Los_Angeles)</option>
                    <option value="America/Anchorage">Alaska (America/Anchorage)</option>
                    <option value="Pacific/Honolulu">Hawaii (Pacific/Honolulu)</option>
                  </select>
                </FieldGroup>
                <FieldGroup label="Date Format">
                  <select value={regional.dateFormat} onChange={(e) => setRegional({ ...regional, dateFormat: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </FieldGroup>
                <FieldGroup label="Currency">
                  <select value={regional.currency} onChange={(e) => setRegional({ ...regional, currency: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="USD">USD ($)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="EUR">EUR (&euro;)</option>
                    <option value="GBP">GBP (&pound;)</option>
                    <option value="AUD">AUD (A$)</option>
                  </select>
                </FieldGroup>
                <FieldGroup label="Measurement System">
                  <select value={regional.measurementSystem} onChange={(e) => setRegional({ ...regional, measurementSystem: e.target.value as 'imperial' | 'metric' })} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="imperial">Imperial (ft, in, lbs)</option>
                    <option value="metric">Metric (m, cm, kg)</option>
                  </select>
                </FieldGroup>
              </div>
            </CardContent>
            <CardFooter className="border-t justify-end gap-2">
              {success === 'regional' ? <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Saved</span> : null}
              <Button onClick={() => saveSection('regional', { settings: regional })} disabled={saving === 'regional'}>
                {saving === 'regional' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Regional
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* AI & Automation Tab */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI & Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Auto-Match Confidence Threshold (0-100)">
                  <Input type="number" min={0} max={100} value={ai.autoMatchConfidence} onChange={(e) => setAi({ ...ai, autoMatchConfidence: Number(e.target.value) })} />
                </FieldGroup>
                <FieldGroup label="Invoice Auto-Route Threshold ($)">
                  <Input type="number" min={0} value={ai.invoiceAutoRouteThreshold} onChange={(e) => setAi({ ...ai, invoiceAutoRouteThreshold: Number(e.target.value) })} />
                </FieldGroup>
                <FieldGroup label="Cost Code Suggestions">
                  <ToggleSwitch checked={ai.costCodeSuggestionEnabled} onChange={(v) => setAi({ ...ai, costCodeSuggestionEnabled: v })} label="Suggest cost codes for line items" />
                </FieldGroup>
                <FieldGroup label="Risk Detection">
                  <ToggleSwitch checked={ai.riskDetectionEnabled} onChange={(v) => setAi({ ...ai, riskDetectionEnabled: v })} label="Detect potential risks in projects" />
                </FieldGroup>
              </div>
            </CardContent>
            <CardFooter className="border-t justify-end gap-2">
              {success === 'ai' ? <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Saved</span> : null}
              <Button onClick={() => saveSection('ai', { settings: ai })} disabled={saving === 'ai'}>
                {saving === 'ai' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save AI Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Portals Tab */}
        <TabsContent value="portals">
          <Card>
            <CardHeader>
              <CardTitle>Portal Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ToggleSwitch checked={portal.clientPortalEnabled} onChange={(v) => setPortal({ ...portal, clientPortalEnabled: v })} label="Enable Client Portal" />
                <ToggleSwitch checked={portal.vendorPortalEnabled} onChange={(v) => setPortal({ ...portal, vendorPortalEnabled: v })} label="Enable Vendor Portal" />
                <ToggleSwitch checked={portal.allowClientPhotoUpload} onChange={(v) => setPortal({ ...portal, allowClientPhotoUpload: v })} label="Allow Client Photo Upload" />
                <ToggleSwitch checked={portal.showBudgetToClients} onChange={(v) => setPortal({ ...portal, showBudgetToClients: v })} label="Show Budget to Clients" />
              </div>
            </CardContent>
            <CardFooter className="border-t justify-end gap-2">
              {success === 'portals' ? <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Saved</span> : null}
              <Button onClick={() => saveSection('portals', { settings: portal })} disabled={saving === 'portals'}>
                {saving === 'portals' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Portal Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ToggleSwitch checked={notifications.emailNotificationsEnabled} onChange={(v) => setNotifications({ ...notifications, emailNotificationsEnabled: v })} label="Email Notifications" />
                <ToggleSwitch checked={notifications.pushNotificationsEnabled} onChange={(v) => setNotifications({ ...notifications, pushNotificationsEnabled: v })} label="Push Notifications" />
                <FieldGroup label="Digest Frequency">
                  <select value={notifications.digestFrequency} onChange={(e) => setNotifications({ ...notifications, digestFrequency: e.target.value as 'realtime' | 'hourly' | 'daily' | 'weekly' })} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </FieldGroup>
              </div>
            </CardContent>
            <CardFooter className="border-t justify-end gap-2">
              {success === 'notifications' ? <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Saved</span> : null}
              <Button onClick={() => saveSection('notifications', { settings: notifications })} disabled={saving === 'notifications'}>
                {saving === 'notifications' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Notifications
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Reusable field wrapper
function FieldGroup({ label, id, children }: { label: string; id?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}

// Toggle switch component
function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
          checked ? 'bg-primary' : 'bg-muted-foreground/25'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
      <span className="text-sm text-foreground">{label}</span>
    </label>
  )
}
