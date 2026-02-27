'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Hash, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface CostCodeData {
  id: string
  code: string
  name: string
  division: string
  subdivision: string | null
  category: string | null
  trade: string | null
  description: string | null
  is_active: boolean | null
  is_default: boolean | null
  sort_order: number | null
  created_at: string | null
}

export default function CostCodeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [costCode, setCostCode] = useState<CostCodeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    division: '',
    subdivision: '',
    category: 'subcontractor',
    trade: '',
    description: '',
  })

  useEffect(() => {
    async function loadCostCode() {
      if (!companyId) { setError('No company found'); setLoading(false); return }
      const { data, error: fetchError } = await supabase
        .from('cost_codes')
        .select('*')
        .eq('id', params.id as string)
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Cost code not found')
        setLoading(false)
        return
      }

      const c = data as CostCodeData
      setCostCode(c)
      setFormData({
        code: c.code,
        name: c.name,
        division: c.division,
        subdivision: c.subdivision || '',
        category: c.category || 'subcontractor',
        trade: c.trade || '',
        description: c.description || '',
      })
      setLoading(false)
    }
    loadCostCode()
  }, [params.id, supabase, companyId])

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
        .from('cost_codes')
        .update({
          code: formData.code,
          name: formData.name,
          division: formData.division,
          subdivision: formData.subdivision || null,
          category: formData.category,
          trade: formData.trade || null,
          description: formData.description || null,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setCostCode((prev) => prev ? { ...prev, ...formData } : prev)
      toast.success('Saved')
      setSuccess(true)
      setEditing(false)
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
      .from('cost_codes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id as string)
      .eq('company_id', companyId)

    if (deleteError) {
      setError('Failed to archive cost code')
      toast.error('Failed to archive cost code')
      return
    }

    toast.success('Archived')
    router.push('/cost-codes')
    router.refresh()
  }

  const categoryColors: Record<string, string> = {
    labor: 'bg-blue-100 text-blue-700',
    material: 'bg-green-100 text-green-700',
    subcontractor: 'bg-purple-100 text-purple-700',
    equipment: 'bg-amber-100 text-amber-700',
    other: 'bg-gray-100 text-gray-700',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!costCode) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/cost-codes" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Cost Codes
        </Link>
        <p className="text-destructive">{error || 'Cost code not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/cost-codes" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Cost Codes
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg text-muted-foreground">{costCode.code}</span>
              <h1 className="text-2xl font-bold text-foreground">{costCode.name}</h1>
              {costCode.category && (
                <Badge className={`text-xs rounded ${categoryColors[costCode.category] || categoryColors.other}`}>
                  {costCode.category}
                </Badge>
              )}
              {costCode.is_active === false && (
                <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {costCode.division}{costCode.subdivision ? ` — ${costCode.subdivision}` : ''}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Cost code updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Code:</span>
                  <span className="font-mono">{costCode.code}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground ml-7">Division:</span>
                  <span>{costCode.division}</span>
                </div>
                {costCode.subdivision && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground ml-7">Subdivision:</span>
                    <span>{costCode.subdivision}</span>
                  </div>
                )}
                {costCode.trade && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground ml-7">Trade:</span>
                    <span>{costCode.trade}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {costCode.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{costCode.description}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Cost Code
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Cost Code Details</CardTitle>
                <CardDescription>Update code information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="code" className="text-sm font-medium">Code <span className="text-red-500">*</span></label>
                    <Input id="code" name="code" value={formData.code} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="division" className="text-sm font-medium">Division <span className="text-red-500">*</span></label>
                    <Input id="division" name="division" value={formData.division} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subdivision" className="text-sm font-medium">Subdivision</label>
                    <Input id="subdivision" name="subdivision" value={formData.subdivision} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="labor">Labor</option>
                      <option value="material">Material</option>
                      <option value="subcontractor">Subcontractor</option>
                      <option value="equipment">Equipment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="trade" className="text-sm font-medium">Trade</label>
                    <Input id="trade" name="trade" value={formData.trade} onChange={handleChange} />
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
        title="Archive cost code?"
        description="This cost code will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
