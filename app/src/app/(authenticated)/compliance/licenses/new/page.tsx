'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New License' }


export default function NewCertificationPage() {
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Dropdown data ──────────────────────────────────────────────
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([])

  const [formData, setFormData] = useState({
    employee_id: '',
    certification_name: '',
    certification_type: '',
    certification_number: '',
    issuing_authority: '',
    issued_date: '',
    expiration_date: '',
    status: 'active',
    notes: '',
  })

  useEffect(() => {
    async function loadDropdowns() {
      if (!companyId) return

      const { data: empsData } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('last_name')

      if (empsData) setEmployees(empsData.map((e) => ({ id: e.id, name: `${e.first_name} ${e.last_name}` })))
    }
    loadDropdowns()
  }, [companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!authUser || !companyId) throw new Error('Not authenticated')

      const { error: insertError } = await supabase
        .from('employee_certifications')
        .insert({
          company_id: companyId,
          employee_id: formData.employee_id,
          certification_name: formData.certification_name,
          certification_type: formData.certification_type || null,
          certification_number: formData.certification_number || null,
          issuing_authority: formData.issuing_authority || null,
          issued_date: formData.issued_date || null,
          expiration_date: formData.expiration_date || null,
          status: formData.status,
          notes: formData.notes || null,
          created_by: authUser.id,
        })

      if (insertError) throw insertError

      toast.success('Certification created')
      router.push('/compliance/licenses')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create certification'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/compliance/licenses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Licenses & Certifications
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Certification</h1>
        <p className="text-muted-foreground">Track an employee license or certification</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        {/* Certification Info */}
        <Card>
          <CardHeader>
            <CardTitle>Certification Details</CardTitle>
            <CardDescription>Employee and certification information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="employee_id" className="text-sm font-medium">Employee <span className="text-red-500">*</span></label>
                <select id="employee_id" name="employee_id" value={formData.employee_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select an employee...</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="certification_name" className="text-sm font-medium">Certification Name <span className="text-red-500">*</span></label>
                <Input id="certification_name" name="certification_name" value={formData.certification_name} onChange={handleChange} placeholder="e.g., OSHA 30, CPR/First Aid" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="certification_type" className="text-sm font-medium">Certification Type</label>
                <Input id="certification_type" name="certification_type" value={formData.certification_type} onChange={handleChange} placeholder="e.g., Safety, License, Training" />
              </div>
              <div className="space-y-2">
                <label htmlFor="certification_number" className="text-sm font-medium">Certification Number</label>
                <Input id="certification_number" name="certification_number" value={formData.certification_number} onChange={handleChange} placeholder="e.g., CERT-12345" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="issuing_authority" className="text-sm font-medium">Issuing Authority</label>
              <Input id="issuing_authority" name="issuing_authority" value={formData.issuing_authority} onChange={handleChange} placeholder="e.g., OSHA, State Board, Red Cross" />
            </div>
          </CardContent>
        </Card>

        {/* Dates & Status */}
        <Card>
          <CardHeader>
            <CardTitle>Dates & Status</CardTitle>
            <CardDescription>Validity period and current status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="issued_date" className="text-sm font-medium">Issued Date</label>
                <Input id="issued_date" name="issued_date" type="date" value={formData.issued_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="expiration_date" className="text-sm font-medium">Expiration Date</label>
                <Input id="expiration_date" name="expiration_date" type="date" value={formData.expiration_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {[
                    { value: 'active', label: 'Active' },
                    { value: 'expired', label: 'Expired' },
                    { value: 'pending_renewal', label: 'Pending Renewal' },
                    { value: 'revoked', label: 'Revoked' },
                  ].map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Additional notes about this certification..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/compliance/licenses"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Add Certification'}
          </Button>
        </div>
      </form>
    </div>
  )
}
