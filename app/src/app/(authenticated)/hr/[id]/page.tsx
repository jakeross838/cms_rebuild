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
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface EmployeeData {
  id: string
  first_name: string
  last_name: string
  employee_number: string
  email: string | null
  phone: string | null
  hire_date: string | null
  employment_status: string | null
  employment_type: string | null
  base_wage: number | null
  pay_type: string | null
  workers_comp_class: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  address: string | null
  notes: string | null
  created_at: string | null
}

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [employee, setEmployee] = useState<EmployeeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    employment_status: '',
    employment_type: '',
    base_wage: '',
    pay_type: '',
    workers_comp_class: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    address: '',
    notes: '',
  })

  useEffect(() => {
    async function loadEmployee() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setLoading(false); return }
      const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      const companyId = profile?.company_id
      if (!companyId) { setError('No company found'); setLoading(false); return }
      setCompanyId(companyId)
      const { data, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', params.id as string)
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Employee not found')
        setLoading(false)
        return
      }

      const e = data as EmployeeData
      setEmployee(e)
      setFormData({
        first_name: e.first_name,
        last_name: e.last_name,
        email: e.email || '',
        phone: e.phone || '',
        employment_status: e.employment_status || '',
        employment_type: e.employment_type || '',
        base_wage: e.base_wage != null ? String(e.base_wage) : '',
        pay_type: e.pay_type || '',
        workers_comp_class: e.workers_comp_class || '',
        emergency_contact_name: e.emergency_contact_name || '',
        emergency_contact_phone: e.emergency_contact_phone || '',
        address: e.address || '',
        notes: e.notes || '',
      })
      setLoading(false)
    }
    loadEmployee()
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
        .from('employees')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email || null,
          phone: formData.phone || null,
          employment_status: formData.employment_status || undefined,
          employment_type: formData.employment_type || undefined,
          base_wage: formData.base_wage ? Number(formData.base_wage) : null,
          pay_type: formData.pay_type || null,
          workers_comp_class: formData.workers_comp_class || null,
          emergency_contact_name: formData.emergency_contact_name || null,
          emergency_contact_phone: formData.emergency_contact_phone || null,
          address: formData.address || null,
          notes: formData.notes || null,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setEmployee((prev) => prev ? {
        ...prev,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null,
        phone: formData.phone || null,
        employment_status: formData.employment_status || null,
        employment_type: formData.employment_type || null,
        base_wage: formData.base_wage ? Number(formData.base_wage) : null,
        pay_type: formData.pay_type || null,
        workers_comp_class: formData.workers_comp_class || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        address: formData.address || null,
        notes: formData.notes || null,
      } : prev)
      setSuccess(true)
      setEditing(false)
      toast.success('Saved')
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to save'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const { error: deleteError } = await supabase
      .from('employees')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id as string)
      .eq('company_id', companyId)

    if (deleteError) {
      const errorMessage = 'Failed to archive employee'
      setError(errorMessage)
      toast.error(errorMessage)
      return
    }

    toast.success('Archived')
    router.push('/hr')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/hr" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to HR
        </Link>
        <p className="text-destructive">{error || 'Employee not found'}</p>
      </div>
    )
  }

  const statusLabels: Record<string, string> = {
    active: 'Active',
    inactive: 'Inactive',
    terminated: 'Terminated',
    on_leave: 'On Leave',
  }

  const typeLabels: Record<string, string> = {
    full_time: 'Full Time',
    part_time: 'Part Time',
    contract: 'Contract',
    seasonal: 'Seasonal',
  }

  const payTypeLabels: Record<string, string> = {
    hourly: 'Hourly',
    salary: 'Salary',
    piece_rate: 'Piece Rate',
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/hr" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to HR
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{employee.first_name} {employee.last_name}</h1>
              <Badge className={employee.employment_status === 'active' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}>
                {statusLabels[employee.employment_status ?? ''] || employee.employment_status || 'Unknown'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {employee.employee_number}
              {employee.employment_type ? ` — ${typeLabels[employee.employment_type] || employee.employment_type}` : ''}
              {employee.hire_date ? ` — Hired ${formatDate(employee.hire_date)}` : ''}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Employee updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2">{employee.email || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="ml-2">{employee.phone || 'Not specified'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="ml-2">{employee.address || 'Not specified'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Employee Number:</span>
                    <span className="ml-2 font-mono">{employee.employee_number}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hire Date:</span>
                    <span className="ml-2">{employee.hire_date ? formatDate(employee.hire_date) : 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Base Wage:</span>
                    <span className="ml-2">{employee.base_wage != null ? formatCurrency(employee.base_wage) : 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pay Type:</span>
                    <span className="ml-2">{employee.pay_type ? (payTypeLabels[employee.pay_type] || employee.pay_type) : 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Workers Comp Class:</span>
                    <span className="ml-2">{employee.workers_comp_class || 'Not specified'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2">{employee.emergency_contact_name || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="ml-2">{employee.emergency_contact_phone || 'Not specified'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {employee.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{employee.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Employee
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update employee details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="first_name" className="text-sm font-medium">First Name <span className="text-red-500">*</span></label>
                    <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="last_name" className="text-sm font-medium">Last Name <span className="text-red-500">*</span></label>
                    <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">Address</label>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Employment</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="employment_status" className="text-sm font-medium">Employment Status</label>
                    <select id="employment_status" name="employment_status" value={formData.employment_status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">Select...</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="terminated">Terminated</option>
                      <option value="on_leave">On Leave</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="employment_type" className="text-sm font-medium">Employment Type</label>
                    <select id="employment_type" name="employment_type" value={formData.employment_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">Select...</option>
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="seasonal">Seasonal</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="base_wage" className="text-sm font-medium">Base Wage ($)</label>
                    <Input id="base_wage" name="base_wage" type="number" step="0.01" value={formData.base_wage} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="pay_type" className="text-sm font-medium">Pay Type</label>
                    <select id="pay_type" name="pay_type" value={formData.pay_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">Select...</option>
                      <option value="hourly">Hourly</option>
                      <option value="salary">Salary</option>
                      <option value="piece_rate">Piece Rate</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="workers_comp_class" className="text-sm font-medium">Workers Comp Class</label>
                    <Input id="workers_comp_class" name="workers_comp_class" value={formData.workers_comp_class} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Emergency Contact</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="emergency_contact_name" className="text-sm font-medium">Emergency Contact Name</label>
                    <Input id="emergency_contact_name" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="emergency_contact_phone" className="text-sm font-medium">Emergency Contact Phone</label>
                    <Input id="emergency_contact_phone" name="emergency_contact_phone" type="tel" value={formData.emergency_contact_phone} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent>
                <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive employee?"
        description="This employee will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
