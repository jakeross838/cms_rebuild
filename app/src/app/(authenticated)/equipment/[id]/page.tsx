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
import { formatCurrency, getStatusColor } from '@/lib/utils'

interface EquipmentData {
  id: string
  name: string
  equipment_type: string | null
  status: string | null
  ownership_type: string | null
  make: string | null
  model: string | null
  year: number | null
  serial_number: string | null
  purchase_price: number | null
  daily_rate: number | null
  location: string | null
  description: string | null
  notes: string | null
  created_at: string | null
}

export default function EquipmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [equipment, setEquipment] = useState<EquipmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    equipment_type: '',
    ownership_type: '',
    make: '',
    model: '',
    year: '',
    serial_number: '',
    purchase_price: '',
    daily_rate: '',
    location: '',
    description: '',
    notes: '',
  })

  useEffect(() => {
    async function loadEquipment() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setLoading(false); return }
      const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      const companyId = profile?.company_id
      if (!companyId) { setError('No company found'); setLoading(false); return }
      setCompanyId(companyId)
      const { data, error: fetchError } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', params.id as string)
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Equipment not found')
        setLoading(false)
        return
      }

      const e = data as EquipmentData
      setEquipment(e)
      setFormData({
        name: e.name,
        equipment_type: e.equipment_type || '',
        ownership_type: e.ownership_type || '',
        make: e.make || '',
        model: e.model || '',
        year: e.year != null ? String(e.year) : '',
        serial_number: e.serial_number || '',
        purchase_price: e.purchase_price != null ? String(e.purchase_price) : '',
        daily_rate: e.daily_rate != null ? String(e.daily_rate) : '',
        location: e.location || '',
        description: e.description || '',
        notes: e.notes || '',
      })
      setLoading(false)
    }
    loadEquipment()
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
        .from('equipment')
        .update({
          name: formData.name,
          equipment_type: formData.equipment_type || undefined,
          ownership_type: formData.ownership_type || undefined,
          make: formData.make || null,
          model: formData.model || null,
          year: formData.year ? Number(formData.year) : null,
          serial_number: formData.serial_number || null,
          purchase_price: formData.purchase_price ? Number(formData.purchase_price) : null,
          daily_rate: formData.daily_rate ? Number(formData.daily_rate) : null,
          location: formData.location || null,
          description: formData.description || null,
          notes: formData.notes || null,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setEquipment((prev) => prev ? {
        ...prev,
        name: formData.name,
        equipment_type: formData.equipment_type || null,
        ownership_type: formData.ownership_type || null,
        make: formData.make || null,
        model: formData.model || null,
        year: formData.year ? Number(formData.year) : null,
        serial_number: formData.serial_number || null,
        purchase_price: formData.purchase_price ? Number(formData.purchase_price) : null,
        daily_rate: formData.daily_rate ? Number(formData.daily_rate) : null,
        location: formData.location || null,
        description: formData.description || null,
        notes: formData.notes || null,
      } : prev)
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError((err as Error)?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const { error: deleteError } = await supabase
      .from('equipment')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id as string)
      .eq('company_id', companyId)

    if (deleteError) {
      setError('Failed to archive equipment')
      return
    }

    router.push('/equipment')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!equipment) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/equipment" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Equipment
        </Link>
        <p className="text-destructive">{error || 'Equipment not found'}</p>
      </div>
    )
  }

  const equipmentTypeLabels: Record<string, string> = {
    heavy_machinery: 'Heavy Machinery',
    vehicle: 'Vehicle',
    power_tool: 'Power Tool',
    hand_tool: 'Hand Tool',
    scaffolding: 'Scaffolding',
    safety_equipment: 'Safety Equipment',
    measuring: 'Measuring',
    other: 'Other',
  }

  const ownershipTypeLabels: Record<string, string> = {
    owned: 'Owned',
    leased: 'Leased',
    rented: 'Rented',
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/equipment" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Equipment
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{equipment.name}</h1>
              <Badge className={getStatusColor(equipment.status ?? 'available')}>
                {(equipment.status ?? 'available').replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {[equipment.make, equipment.model, equipment.year].filter(Boolean).join(' ') || 'No make/model'}
              {equipment.equipment_type ? ` — ${equipmentTypeLabels[equipment.equipment_type] || equipment.equipment_type}` : ''}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Equipment updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Equipment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2">{equipment.equipment_type ? (equipmentTypeLabels[equipment.equipment_type] || equipment.equipment_type) : 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ownership:</span>
                    <span className="ml-2">{equipment.ownership_type ? (ownershipTypeLabels[equipment.ownership_type] || equipment.ownership_type) : 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Make:</span>
                    <span className="ml-2">{equipment.make || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Model:</span>
                    <span className="ml-2">{equipment.model || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Year:</span>
                    <span className="ml-2">{equipment.year ?? 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Serial Number:</span>
                    <span className="ml-2 font-mono">{equipment.serial_number || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <span className="ml-2">{equipment.location || 'Not specified'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Purchase Price:</span>
                    <span className="ml-2">{equipment.purchase_price != null ? formatCurrency(equipment.purchase_price) : 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Daily Rate:</span>
                    <span className="ml-2">{equipment.daily_rate != null ? `${formatCurrency(equipment.daily_rate)}/day` : 'Not specified'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {equipment.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{equipment.description}</p>
                </CardContent>
              </Card>
            )}

            {equipment.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{equipment.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Equipment
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Equipment Information</CardTitle>
                <CardDescription>Update equipment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="equipment_type" className="text-sm font-medium">Equipment Type</label>
                    <select id="equipment_type" name="equipment_type" value={formData.equipment_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">Select type...</option>
                      <option value="heavy_machinery">Heavy Machinery</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="power_tool">Power Tool</option>
                      <option value="hand_tool">Hand Tool</option>
                      <option value="scaffolding">Scaffolding</option>
                      <option value="safety_equipment">Safety Equipment</option>
                      <option value="measuring">Measuring</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="ownership_type" className="text-sm font-medium">Ownership Type</label>
                    <select id="ownership_type" name="ownership_type" value={formData.ownership_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">Select...</option>
                      <option value="owned">Owned</option>
                      <option value="leased">Leased</option>
                      <option value="rented">Rented</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">Location</label>
                    <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Warehouse A, Job Site 12" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="make" className="text-sm font-medium">Make</label>
                    <Input id="make" name="make" value={formData.make} onChange={handleChange} placeholder="e.g., Caterpillar, DeWalt" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="model" className="text-sm font-medium">Model</label>
                    <Input id="model" name="model" value={formData.model} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="year" className="text-sm font-medium">Year</label>
                    <Input id="year" name="year" type="number" value={formData.year} onChange={handleChange} placeholder="e.g., 2024" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="serial_number" className="text-sm font-medium">Serial Number</label>
                  <Input id="serial_number" name="serial_number" value={formData.serial_number} onChange={handleChange} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Financial</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="purchase_price" className="text-sm font-medium">Purchase Price ($)</label>
                    <Input id="purchase_price" name="purchase_price" type="number" step="0.01" value={formData.purchase_price} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="daily_rate" className="text-sm font-medium">Daily Rate ($)</label>
                    <Input id="daily_rate" name="daily_rate" type="number" step="0.01" value={formData.daily_rate} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Description & Notes</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                  <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive equipment?"
        description="This equipment will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
