'use client'

import { useState } from 'react'

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

export const metadata: Metadata = { title: 'New Employee' }


export default function NewEmployeePage() {
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    employee_number: '',
    email: '',
    phone: '',
    hire_date: '',
    employment_type: 'full_time',
    pay_type: 'hourly',
    base_wage: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
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
      if (!authUser || !companyId) throw new Error('Not authenticated')

      if (!formData.first_name.trim()) { setError('First name is required'); setLoading(false); return }
      if (!formData.last_name.trim()) { setError('Last name is required'); setLoading(false); return }
      if (!formData.hire_date) { setError('Hire date is required'); setLoading(false); return }

      const { error: insertError } = await supabase
        .from('employees')
        .insert({
          company_id: companyId,
          first_name: formData.first_name,
          last_name: formData.last_name,
          employee_number: formData.employee_number,
          hire_date: formData.hire_date,
          employment_status: 'active',
          employment_type: formData.employment_type,
          pay_type: formData.pay_type || null,
          base_wage: formData.base_wage ? parseFloat(formData.base_wage) : null,
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
          emergency_contact_name: formData.emergency_contact_name || null,
          emergency_contact_phone: formData.emergency_contact_phone || null,
          notes: formData.notes || null,
          created_by: authUser.id,
        })

      if (insertError) throw insertError

      toast.success('Employee created')
      router.push('/hr')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create employee'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/hr" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to HR
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Add Employee</h1>
        <p className="text-muted-foreground">Add a new team member</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Employee name and contact</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="first_name" className="text-sm font-medium">First Name <span className="text-red-500">*</span></label>
                <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="John" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="last_name" className="text-sm font-medium">Last Name <span className="text-red-500">*</span></label>
                <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Smith" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@company.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="(512) 555-0100" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">Address</label>
              <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St, Austin, TX 78701" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
            <CardDescription>Job and compensation info</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="employee_number" className="text-sm font-medium">Employee Number <span className="text-red-500">*</span></label>
                <Input id="employee_number" name="employee_number" value={formData.employee_number} onChange={handleChange} placeholder="EMP-001" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="hire_date" className="text-sm font-medium">Hire Date <span className="text-red-500">*</span></label>
                <Input id="hire_date" name="hire_date" type="date" value={formData.hire_date} onChange={handleChange} required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="employment_type" className="text-sm font-medium">Type</label>
                <select id="employment_type" name="employment_type" value={formData.employment_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="seasonal">Seasonal</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="pay_type" className="text-sm font-medium">Pay Type</label>
                <select id="pay_type" name="pay_type" value={formData.pay_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="hourly">Hourly</option>
                  <option value="salary">Salary</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="base_wage" className="text-sm font-medium">Base Wage</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="base_wage" name="base_wage" type="number" step="0.01" min="0" value={formData.base_wage} onChange={handleChange} placeholder="0.00" className="pl-7" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="emergency_contact_name" className="text-sm font-medium">Contact Name</label>
                <Input id="emergency_contact_name" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} placeholder="Jane Smith" />
              </div>
              <div className="space-y-2">
                <label htmlFor="emergency_contact_phone" className="text-sm font-medium">Contact Phone</label>
                <Input id="emergency_contact_phone" name="emergency_contact_phone" type="tel" value={formData.emergency_contact_phone} onChange={handleChange} placeholder="(512) 555-0200" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Certifications, skills, or other notes..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/hr"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Add Employee'}
          </Button>
        </div>
      </form>
    </div>
  )
}
