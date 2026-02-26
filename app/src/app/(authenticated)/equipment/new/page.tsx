'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function NewEquipmentPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    equipment_type: 'power_tool',
    ownership_type: 'owned',
    make: '',
    model: '',
    year: '',
    serial_number: '',
    daily_rate: '',
    purchase_price: '',
    location: '',
    description: '',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) throw new Error('No company found')

      const { error: insertError } = await supabase
        .from('equipment')
        .insert({
          company_id: companyId,
          name: formData.name,
          equipment_type: formData.equipment_type,
          ownership_type: formData.ownership_type,
          status: 'available',
          make: formData.make || null,
          model: formData.model || null,
          year: formData.year ? parseInt(formData.year) : null,
          serial_number: formData.serial_number || null,
          daily_rate: formData.daily_rate ? parseFloat(formData.daily_rate) : null,
          purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
          location: formData.location || null,
          description: formData.description || null,
          notes: formData.notes || null,
          created_by: user.id,
        })

      if (insertError) throw insertError

      toast.success('Equipment added')
      router.push('/equipment')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to add equipment'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/equipment" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Equipment
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Add Equipment</h1>
        <p className="text-muted-foreground">Register a new piece of equipment or tool</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Equipment Details</CardTitle>
            <CardDescription>Name, type, and ownership</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., CAT 320 Excavator" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="equipment_type" className="text-sm font-medium">Type <span className="text-red-500">*</span></label>
                <select id="equipment_type" name="equipment_type" value={formData.equipment_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
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
              <div className="space-y-2">
                <label htmlFor="ownership_type" className="text-sm font-medium">Ownership <span className="text-red-500">*</span></label>
                <select id="ownership_type" name="ownership_type" value={formData.ownership_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="owned">Owned</option>
                  <option value="leased">Leased</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
            <CardDescription>Make, model, and identification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="make" className="text-sm font-medium">Make</label>
                <Input id="make" name="make" value={formData.make} onChange={handleChange} placeholder="Caterpillar" />
              </div>
              <div className="space-y-2">
                <label htmlFor="model" className="text-sm font-medium">Model</label>
                <Input id="model" name="model" value={formData.model} onChange={handleChange} placeholder="320" />
              </div>
              <div className="space-y-2">
                <label htmlFor="year" className="text-sm font-medium">Year</label>
                <Input id="year" name="year" type="number" value={formData.year} onChange={handleChange} placeholder="2024" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="serial_number" className="text-sm font-medium">Serial Number</label>
                <Input id="serial_number" name="serial_number" value={formData.serial_number} onChange={handleChange} placeholder="SN-123456" />
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">Current Location</label>
                <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="Main yard" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="purchase_price" className="text-sm font-medium">Purchase Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="purchase_price" name="purchase_price" type="number" step="0.01" value={formData.purchase_price} onChange={handleChange} placeholder="0.00" className="pl-7" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="daily_rate" className="text-sm font-medium">Daily Rate</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="daily_rate" name="daily_rate" type="number" step="0.01" value={formData.daily_rate} onChange={handleChange} placeholder="0.00" className="pl-7" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Maintenance notes, special handling, etc..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/equipment"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Add Equipment'}
          </Button>
        </div>
      </form>
    </div>
  )
}
