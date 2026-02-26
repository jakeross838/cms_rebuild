'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface TemplateData {
  id: string
  name: string
  contract_type: string
  is_active: boolean
  is_system: boolean
  description: string | null
  content: string | null
  created_at: string | null
}

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [template, setTemplate] = useState<TemplateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')

  const [formData, setFormData] = useState({
    name: '',
    contract_type: '',
    description: '',
    content: '',
  })

  useEffect(() => {
    async function loadTemplate() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setLoading(false); return }
      const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      const companyId = profile?.company_id
      if (!companyId) { setError('No company found'); setLoading(false); return }
      setCompanyId(companyId)

      const { data, error: fetchError } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('company_id', companyId)
        .eq('id', params.id as string)
        .single()

      if (fetchError || !data) {
        setError('Template not found')
        setLoading(false)
        return
      }

      const t = data as TemplateData
      setTemplate(t)
      setFormData({
        name: t.name,
        contract_type: t.contract_type || '',
        description: t.description || '',
        content: t.content || '',
      })
      setLoading(false)
    }
    loadTemplate()
  }, [params.id, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleArchive = async () => {
    if (!window.confirm('Archive this template? It can be restored later.')) return
    setArchiving(true)
    try {
      const { error: archiveError } = await supabase
        .from('contract_templates')
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq('id', params.id as string)
        .eq('company_id', companyId)
      if (archiveError) throw archiveError
      toast.success('Archived')
      router.push('/library/templates')
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to archive'
      setError(errorMessage)
      toast.error(errorMessage)
      setArchiving(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('contract_templates')
        .update({
          name: formData.name,
          contract_type: formData.contract_type || undefined,
          description: formData.description || null,
          content: formData.content || null,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setTemplate((prev) => prev ? {
        ...prev,
        name: formData.name,
        contract_type: formData.contract_type,
        description: formData.description || null,
        content: formData.content || null,
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
        <Link href="/library/templates" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Templates
        </Link>
        <p className="text-destructive">{error || 'Template not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/library/templates" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Templates
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{template.name}</h1>
              <Badge className={template.is_active ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}>
                {template.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {template.is_system && (
                <Badge variant="outline" className="text-xs">System</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {template.contract_type} template
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
              <button onClick={handleArchive} disabled={archiving} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">{archiving ? 'Archiving...' : 'Archive'}</button>
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
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Contract Type</p>
                    <p className="text-sm font-medium">{template.contract_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">System Template</p>
                    <p className="text-sm font-medium">{template.is_system ? 'Yes' : 'No'}</p>
                  </div>
                </div>
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
                <CardHeader><CardTitle>Template Content</CardTitle></CardHeader>
                <CardContent>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted/50 p-4 rounded-md overflow-auto max-h-96">{template.content}</pre>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Template Information</CardTitle>
                <CardDescription>Update template details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contract_type" className="text-sm font-medium">Contract Type</label>
                    <select id="contract_type" name="contract_type" value={formData.contract_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">Select type...</option>
                      <option value="prime">Prime</option>
                      <option value="subcontract">Subcontract</option>
                      <option value="purchase_order">Purchase Order</option>
                      <option value="service_agreement">Service Agreement</option>
                      <option value="change_order">Change Order</option>
                      <option value="amendment">Amendment</option>
                      <option value="nda">NDA</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium">Template Content</label>
                  <textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={12} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
