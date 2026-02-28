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
import { useHrCertification, useUpdateHrCertification, useDeleteHrCertification } from '@/hooks/use-hr'
import { formatDate, getStatusColor, formatStatus } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────

interface CertificationData {
  id: string
  employee_id: string
  certification_name: string
  certification_type: string | null
  issuing_authority: string | null
  certification_number: string | null
  issued_date: string | null
  expiration_date: string | null
  status: string
  created_at: string
}

interface CertificationFormData {
  certification_name: string
  certification_type: string
  issuing_authority: string
  certification_number: string
  issued_date: string
  expiration_date: string
  status: string
  employee_id: string
}

const STATUS_OPTIONS = ['active', 'expired', 'revoked', 'pending'] as const

// ── Component ──────────────────────────────────────────────────

export default function LicenseDetailPage() {
  const params = useParams()
  const router = useRouter()

  const certId = params.id as string

  const { data: response, isLoading: loading, error: fetchError } = useHrCertification(certId)
  const updateCert = useUpdateHrCertification(certId)
  const deleteCert = useDeleteHrCertification()
  const cert = (response as { data: CertificationData } | undefined)?.data ?? null

  const [editing, setEditing] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState<CertificationFormData>({
    certification_name: '',
    certification_type: '',
    issuing_authority: '',
    certification_number: '',
    issued_date: '',
    expiration_date: '',
    status: '',
    employee_id: '',
  })

  useEffect(() => {
    if (cert) {
      setFormData({
        certification_name: cert.certification_name,
        certification_type: cert.certification_type || '',
        issuing_authority: cert.issuing_authority || '',
        certification_number: cert.certification_number || '',
        issued_date: cert.issued_date || '',
        expiration_date: cert.expiration_date || '',
        status: cert.status,
        employee_id: cert.employee_id,
      })
    }
  }, [cert])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.certification_name.trim()) { toast.error('Certification name is required'); return }

    try {
      await updateCert.mutateAsync({
        certification_name: formData.certification_name,
        certification_type: formData.certification_type || null,
        issuing_authority: formData.issuing_authority || null,
        certification_number: formData.certification_number || null,
        issued_date: formData.issued_date || null,
        expiration_date: formData.expiration_date || null,
        status: formData.status,
        employee_id: formData.employee_id,
      })
      toast.success('Saved')
      setEditing(false)
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to save'
      toast.error(errorMessage)
    }
  }

  const handleConfirmArchive = async () => {
    try {
      setArchiving(true)
      await deleteCert.mutateAsync(certId)
      toast.success('Archived')
      router.push('/compliance/licenses')
      router.refresh()
    } catch (err) {
      const msg = (err as Error)?.message || 'Operation failed'
      toast.error(msg)
      setArchiving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!cert) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/compliance/licenses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Licenses
        </Link>
        <p className="text-destructive">{fetchError?.message || 'Certification not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/compliance/licenses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Licenses
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{cert.certification_name}</h1>
            <p className="text-muted-foreground">
              {cert.issuing_authority || 'No issuing authority'}
              {cert.certification_number && ` | #${cert.certification_number}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
            ) : (
              <>
                <Button onClick={() => setEditing(false)} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={updateCert.isPending}>
                  {updateCert.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {fetchError && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{fetchError.message}</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Certification Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Certification Name</span>
                    <p className="font-medium">{cert.certification_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <p className="font-medium">
                      <Badge className={`${getStatusColor(cert.status)} rounded`}>{formatStatus(cert.status)}</Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Certification Type</span>
                    <p className="font-medium">{cert.certification_type || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Issuing Authority</span>
                    <p className="font-medium">{cert.issuing_authority || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Certification Number</span>
                    <p className="font-medium">{cert.certification_number ? `#${cert.certification_number}` : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Employee ID</span>
                    <p className="font-medium">{cert.employee_id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Issued Date</span>
                    <p className="font-medium">{cert.issued_date ? formatDate(cert.issued_date) : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expiration Date</span>
                    <p className="font-medium">{cert.expiration_date ? formatDate(cert.expiration_date) : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setShowArchiveDialog(true)} disabled={archiving} variant="outline" className="text-destructive hover:text-destructive">{archiving ? 'Archiving...' : 'Archive'}</Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Certification Information</CardTitle>
                <CardDescription>Update certification details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="certification_name" className="text-sm font-medium">Certification Name <span className="text-red-500">*</span></label>
                    <Input id="certification_name" name="certification_name" value={formData.certification_name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{formatStatus(s)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="certification_type" className="text-sm font-medium">Certification Type</label>
                    <Input id="certification_type" name="certification_type" value={formData.certification_type} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="issuing_authority" className="text-sm font-medium">Issuing Authority</label>
                    <Input id="issuing_authority" name="issuing_authority" value={formData.issuing_authority} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="certification_number" className="text-sm font-medium">Certification Number</label>
                    <Input id="certification_number" name="certification_number" value={formData.certification_number} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="employee_id" className="text-sm font-medium">Employee ID</label>
                    <Input id="employee_id" name="employee_id" value={formData.employee_id} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Dates</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="issued_date" className="text-sm font-medium">Issued Date</label>
                    <Input id="issued_date" name="issued_date" type="date" value={formData.issued_date} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="expiration_date" className="text-sm font-medium">Expiration Date</label>
                    <Input id="expiration_date" name="expiration_date" type="date" value={formData.expiration_date} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive this certification?"
        description="This certification will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleConfirmArchive}
      />
    </div>
  )
}
