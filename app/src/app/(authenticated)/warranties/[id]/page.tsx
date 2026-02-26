'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { formatDate, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

interface WarrantyData {
  id: string
  title: string | null
  warranty_type: string | null
  status: string | null
  start_date: string | null
  end_date: string | null
  coverage_details: string | null
  exclusions: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  description: string | null
  created_at: string | null
}

export default function WarrantyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [warranty, setWarranty] = useState<WarrantyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    warranty_type: '',
    start_date: '',
    end_date: '',
    coverage_details: '',
    exclusions: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    description: '',
  })

  useEffect(() => {
    async function loadWarranty() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setLoading(false); return }
      const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      const companyId = profile?.company_id
      if (!companyId) { setError('No company found'); setLoading(false); return }
      setCompanyId(companyId)

      const { data, error: fetchError } = await supabase
        .from('warranties')
        .select('*')
        .eq('company_id', companyId)
        .eq('id', params.id as string)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Warranty not found')
        setLoading(false)
        return
      }

      const w = data as WarrantyData
      setWarranty(w)
      setFormData({
        title: w.title || '',
        warranty_type: w.warranty_type || '',
        start_date: w.start_date || '',
        end_date: w.end_date || '',
        coverage_details: w.coverage_details || '',
        exclusions: w.exclusions || '',
        contact_name: w.contact_name || '',
        contact_phone: w.contact_phone || '',
        contact_email: w.contact_email || '',
        description: w.description || '',
      })
      setLoading(false)
    }
    loadWarranty()
  }, [params.id, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('warranties')
        .update({
          title: formData.title || undefined,
          warranty_type: formData.warranty_type || undefined,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          coverage_details: formData.coverage_details || null,
          exclusions: formData.exclusions || null,
          contact_name: formData.contact_name || null,
          contact_phone: formData.contact_phone || null,
          contact_email: formData.contact_email || null,
          description: formData.description || null,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setWarranty((prev) => prev ? {
        ...prev,
        title: formData.title || null,
        warranty_type: formData.warranty_type || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        coverage_details: formData.coverage_details || null,
        exclusions: formData.exclusions || null,
        contact_name: formData.contact_name || null,
        contact_phone: formData.contact_phone || null,
        contact_email: formData.contact_email || null,
        description: formData.description || null,
      } : prev)
      toast.success('Warranty updated')
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError((err as Error)?.message || 'Failed to save')
      toast.error('Failed to save warranty')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const { error: deleteError } = await supabase
      .from('warranties')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id as string)
      .eq('company_id', companyId)

    if (deleteError) {
      setError('Failed to archive warranty')
      toast.error('Failed to archive warranty')
      return
    }

    toast.success('Warranty archived')
    router.push('/warranties')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!warranty) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/warranties" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Warranties
        </Link>
        <p className="text-destructive">{error || 'Warranty not found'}</p>
      </div>
    )
  }

  const warrantyTypeLabels: Record<string, string> = {
    general: 'General',
    structural: 'Structural',
    mechanical: 'Mechanical',
    electrical: 'Electrical',
    plumbing: 'Plumbing',
    hvac: 'HVAC',
    roofing: 'Roofing',
    appliance: 'Appliance',
    workmanship: 'Workmanship',
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/warranties" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Warranties
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{warranty.title || 'Untitled Warranty'}</h1>
              <Badge className={getStatusColor(warranty.status ?? 'active')}>
                {(warranty.status ?? 'active').replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {warranty.warranty_type ? (warrantyTypeLabels[warranty.warranty_type] || warranty.warranty_type) : 'No type'}
              {warranty.start_date && warranty.end_date ? ` — ${formatDate(warranty.start_date)} to ${formatDate(warranty.end_date)}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
            ) : (
              <>
                <Button onClick={() => setEditing(false)} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Warranty updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Warranty Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2">{warranty.warranty_type ? (warrantyTypeLabels[warranty.warranty_type] || warranty.warranty_type) : 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className="ml-2">{(warranty.status ?? 'active').replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="ml-2">{warranty.start_date ? formatDate(warranty.start_date) : 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End Date:</span>
                    <span className="ml-2">{warranty.end_date ? formatDate(warranty.end_date) : 'Not specified'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {warranty.coverage_details && (
              <Card>
                <CardHeader><CardTitle>Coverage Details</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{warranty.coverage_details}</p>
                </CardContent>
              </Card>
            )}

            {warranty.exclusions && (
              <Card>
                <CardHeader><CardTitle>Exclusions</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{warranty.exclusions}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Warranty Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2">{warranty.contact_name || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="ml-2">{warranty.contact_phone || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2">{warranty.contact_email || 'Not specified'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {warranty.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{warranty.description}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Warranty
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Warranty Information</CardTitle>
                <CardDescription>Update warranty details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Title</label>
                    <Input id="title" name="title" value={formData.title} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="warranty_type" className="text-sm font-medium">Warranty Type</label>
                    <select id="warranty_type" name="warranty_type" value={formData.warranty_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">Select type...</option>
                      <option value="general">General</option>
                      <option value="structural">Structural</option>
                      <option value="mechanical">Mechanical</option>
                      <option value="electrical">Electrical</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="hvac">HVAC</option>
                      <option value="roofing">Roofing</option>
                      <option value="appliance">Appliance</option>
                      <option value="workmanship">Workmanship</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="start_date" className="text-sm font-medium">Start Date</label>
                    <Input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="end_date" className="text-sm font-medium">End Date</label>
                    <Input id="end_date" name="end_date" type="date" value={formData.end_date} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Coverage</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="coverage_details" className="text-sm font-medium">Coverage Details</label>
                  <textarea id="coverage_details" aria-label="Coverage details" name="coverage_details" value={formData.coverage_details} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="exclusions" className="text-sm font-medium">Exclusions</label>
                  <textarea id="exclusions" aria-label="Exclusions" name="exclusions" value={formData.exclusions} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Warranty Contact</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="contact_name" className="text-sm font-medium">Contact Name</label>
                    <Input id="contact_name" name="contact_name" value={formData.contact_name} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact_phone" className="text-sm font-medium">Contact Phone</label>
                    <Input id="contact_phone" name="contact_phone" type="tel" value={formData.contact_phone} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact_email" className="text-sm font-medium">Contact Email</label>
                    <Input id="contact_email" name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardContent>
                <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive warranty?"
        description="This warranty will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
