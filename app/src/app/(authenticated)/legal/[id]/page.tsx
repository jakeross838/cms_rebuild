'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatStatus} from '@/lib/utils'
import { toast } from 'sonner'

interface ContractTemplateData {
  id: string
  company_id: string
  name: string
  description: string | null
  contract_type: string
  content: string | null
  clauses: unknown
  variables: unknown
  is_active: boolean
  is_system: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export default function ContractTemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [template, setTemplate] = useState<ContractTemplateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [showToggleDialog, setShowToggleDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    contract_type: '',
    description: '',
    content: '',
    is_active: true,
  })

  useEffect(() => {
    async function loadTemplate() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('company_id', companyId)
        .eq('id', params.id as string)
        .single()

      if (fetchError || !data) {
        setError('Contract template not found')
        setLoading(false)
        return
      }

      const t = data as ContractTemplateData
      setTemplate(t)
      setFormData({
        name: t.name,
        contract_type: t.contract_type,
        description: t.description || '',
        content: t.content || '',
        is_active: t.is_active,
      })
      setLoading(false)
    }
    loadTemplate()
  }, [params.id, companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleArchive = async () => {
    setArchiving(true)
    try {
      const { error: archiveError } = await supabase
        .from('contract_templates')
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq('id', params.id as string)
        .eq('company_id', companyId)
      if (archiveError) throw archiveError
      toast.success('Archived')
      router.push('/legal')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to archive'
      setError(errorMessage)
      toast.error(errorMessage)
      setArchiving(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Name is required'); return }
    if (!formData.contract_type) { toast.error('Contract Type is required'); return }
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('contract_templates')
        .update({
          name: formData.name,
          contract_type: formData.contract_type,
          description: formData.description || null,
          content: formData.content || null,
          is_active: formData.is_active,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setTemplate((prev) =>
        prev
          ? {
              ...prev,
              name: formData.name,
              contract_type: formData.contract_type,
              description: formData.description || null,
              content: formData.content || null,
              is_active: formData.is_active,
            }
          : prev
      )
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

  const handleToggleActive = async () => {
    const newActive = !template?.is_active
    const action = newActive ? 'activate' : 'deactivate'

    try {
      const { error: toggleError } = await supabase
        .from('contract_templates')
        .update({ is_active: newActive })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (toggleError) throw toggleError

      setTemplate((prev) => prev ? { ...prev, is_active: newActive } : prev)
      setFormData((prev) => ({ ...prev, is_active: newActive }))
      toast.success(`Template ${action}d`)
    } catch (err) {
      const msg = (err as Error)?.message || `Failed to ${action} template`
      setError(msg)
      toast.error(msg)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/legal" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Contracts
        </Link>
        <p className="text-destructive">{error || 'Template not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/legal" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Contracts
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{template.name}</h1>
              {!template.is_active && (
                <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>
              )}
              {template.is_system && (
                <Badge variant="outline" className="text-xs text-blue-700 bg-blue-50">System</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{formatStatus(template.contract_type)} -- Updated {formatDate(template.updated_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
              <Button onClick={() => setShowArchiveDialog(true)} disabled={archiving} variant="outline" className="text-destructive hover:text-destructive">{archiving ? 'Archiving...' : 'Archive'}</Button>
              </>
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Template updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader><CardTitle>Template Details</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Name</dt>
                    <dd className="font-medium">{template.name}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Contract Type</dt>
                    <dd className="font-medium">{formatStatus(template.contract_type)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <Badge className={`rounded ${template.is_active ? 'bg-success-bg text-success-dark' : 'bg-warm-100 text-warm-700'}`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">System Template</dt>
                    <dd className="font-medium">{template.is_system ? 'Yes' : 'No'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="font-medium">{formatDate(template.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Last Updated</dt>
                    <dd className="font-medium">{formatDate(template.updated_at)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {template.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{template.description}</p>
                </CardContent>
              </Card>
            )}

            {template.content && (
              <Card>
                <CardHeader><CardTitle>Template Body</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-sm whitespace-pre-wrap bg-muted/50 p-4 rounded-md border max-h-96 overflow-y-auto">
                    {template.content}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                className={template.is_active ? 'text-destructive hover:text-destructive' : ''}
                onClick={() => setShowToggleDialog(true)}
              >
                {template.is_active ? 'Deactivate Template' : 'Activate Template'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Template Information</CardTitle>
                <CardDescription>Update contract template details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contract_type" className="text-sm font-medium">Contract Type <span className="text-red-500">*</span></label>
                    <select id="contract_type" name="contract_type" value={formData.contract_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="subcontract">Subcontract</option>
                      <option value="prime_contract">Prime Contract</option>
                      <option value="change_order">Change Order</option>
                      <option value="purchase_order">Purchase Order</option>
                      <option value="service_agreement">Service Agreement</option>
                      <option value="nda">NDA</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input id="is_active" name="is_active" type="checkbox" checked={formData.is_active} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-input" />
                  <label htmlFor="is_active" className="text-sm font-medium">Active</label>
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={2} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium">Template Body</label>
                  <textarea id="content" aria-label="Content" name="content" value={formData.content} onChange={handleChange} rows={12} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono text-xs" placeholder="Enter contract template text..." />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive template?"
        description="This template will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleArchive}
      />

      <ConfirmDialog
        open={showToggleDialog}
        onOpenChange={setShowToggleDialog}
        title="Toggle template status?"
        description={`This will ${template.is_active ? 'deactivate' : 'activate'} the template. ${template.is_active ? 'Inactive templates cannot be used for new contracts.' : 'The template will be available for use again.'}`}
        confirmLabel={template.is_active ? 'Deactivate' : 'Activate'}
        variant={template.is_active ? 'destructive' : 'default'}
        onConfirm={handleToggleActive}
      />
    </div>
  )
}
