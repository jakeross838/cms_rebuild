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
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

interface CategoryData {
  id: string
  name: string
  room: string | null
  sort_order: number | null
  pricing_model: string
  allowance_amount: number | null
  deadline: string | null
  lead_time_buffer_days: number | null
  status: string
  designer_access: boolean | null
  notes: string | null
  created_at: string
}

interface CategoryFormData {
  name: string
  room: string
  sort_order: string
  pricing_model: string
  allowance_amount: string
  deadline: string
  lead_time_buffer_days: string
  status: string
  designer_access: boolean
  notes: string
}

const STATUS_OPTIONS = ['pending', 'in_progress', 'selected', 'ordered', 'received', 'installed'] as const
const PRICING_OPTIONS = ['allowance', 'fixed', 'cost_plus', 'no_charge'] as const

export default function SelectionCategoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const categoryId = params.id as string

  const [category, setCategory] = useState<CategoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    room: '',
    sort_order: '',
    pricing_model: 'allowance',
    allowance_amount: '',
    deadline: '',
    lead_time_buffer_days: '',
    status: 'pending',
    designer_access: false,
    notes: '',
  })

  useEffect(() => {
    async function loadCategory() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setLoading(false); return }
      const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      const companyId = profile?.company_id
      if (!companyId) { setError('No company found'); setLoading(false); return }
      setCompanyId(companyId)

      const { data, error: fetchError } = await supabase
        .from('selection_categories')
        .select('*')
        .eq('company_id', companyId)
        .eq('id', categoryId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Selection category not found')
        setLoading(false)
        return
      }

      const d = data as CategoryData
      setCategory(d)
      setFormData({
        name: d.name || '',
        room: d.room || '',
        sort_order: d.sort_order != null ? String(d.sort_order) : '',
        pricing_model: d.pricing_model || 'allowance',
        allowance_amount: d.allowance_amount != null ? String(d.allowance_amount) : '',
        deadline: d.deadline || '',
        lead_time_buffer_days: d.lead_time_buffer_days != null ? String(d.lead_time_buffer_days) : '',
        status: d.status || 'pending',
        designer_access: d.designer_access ?? false,
        notes: d.notes || '',
      })
      setLoading(false)
    }
    loadCategory()
  }, [categoryId, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('selection_categories')
        .update({
          name: formData.name,
          room: formData.room || undefined,
          sort_order: formData.sort_order ? Number(formData.sort_order) : undefined,
          pricing_model: formData.pricing_model,
          allowance_amount: formData.allowance_amount ? Number(formData.allowance_amount) : undefined,
          deadline: formData.deadline || undefined,
          lead_time_buffer_days: formData.lead_time_buffer_days ? Number(formData.lead_time_buffer_days) : undefined,
          status: formData.status,
          designer_access: formData.designer_access,
          notes: formData.notes || undefined,
        })
        .eq('id', categoryId)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setCategory((prev) =>
        prev
          ? {
              ...prev,
              name: formData.name,
              room: formData.room || null,
              sort_order: formData.sort_order ? Number(formData.sort_order) : null,
              pricing_model: formData.pricing_model,
              allowance_amount: formData.allowance_amount ? Number(formData.allowance_amount) : null,
              deadline: formData.deadline || null,
              lead_time_buffer_days: formData.lead_time_buffer_days ? Number(formData.lead_time_buffer_days) : null,
              status: formData.status,
              designer_access: formData.designer_access,
              notes: formData.notes || null,
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

  const handleArchive = async () => {
    const { error: deleteError } = await supabase
      .from('selection_categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', categoryId)
      .eq('company_id', companyId)

    if (deleteError) {
      const errorMessage = 'Failed to archive category'
      setError(errorMessage)
      toast.error(errorMessage)
      return
    }

    toast.success('Archived')
    router.push('/library/selections')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/library/selections" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Selections
        </Link>
        <p className="text-destructive">{error || 'Category not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/library/selections" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Selections
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
              <Badge className={`${getStatusColor(category.status)} rounded`}>{category.status.replace('_', ' ')}</Badge>
            </div>
            <p className="text-muted-foreground">
              {category.pricing_model} pricing {category.room && `\u2022 ${category.room}`}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Category updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader><CardTitle>Category Details</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{category.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Room</p>
                    <p className="font-medium">{category.room || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pricing Model</p>
                    <p className="font-medium">{category.pricing_model.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Allowance</p>
                    <p className="font-medium">{category.allowance_amount != null ? formatCurrency(category.allowance_amount) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-medium">{category.deadline ? formatDate(category.deadline) : 'No deadline'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lead Time Buffer</p>
                    <p className="font-medium">{category.lead_time_buffer_days != null ? `${category.lead_time_buffer_days} days` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Designer Access</p>
                    <p className="font-medium">{category.designer_access ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sort Order</p>
                    <p className="font-medium">{category.sort_order ?? 'Auto'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {category.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{category.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Category
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
                <CardDescription>Update selection category information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="room" className="text-sm font-medium">Room</label>
                    <Input id="room" name="room" value={formData.room} onChange={handleChange} placeholder="e.g., Kitchen, Master Bath" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="pricing_model" className="text-sm font-medium">Pricing Model</label>
                    <select id="pricing_model" name="pricing_model" value={formData.pricing_model} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {PRICING_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="allowance_amount" className="text-sm font-medium">Allowance Amount</label>
                    <Input id="allowance_amount" name="allowance_amount" type="number" step="0.01" value={formData.allowance_amount} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="deadline" className="text-sm font-medium">Deadline</label>
                    <Input id="deadline" name="deadline" type="date" value={formData.deadline} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lead_time_buffer_days" className="text-sm font-medium">Lead Time Buffer (days)</label>
                    <Input id="lead_time_buffer_days" name="lead_time_buffer_days" type="number" value={formData.lead_time_buffer_days} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="sort_order" className="text-sm font-medium">Sort Order</label>
                    <Input id="sort_order" name="sort_order" type="number" value={formData.sort_order} onChange={handleChange} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input id="designer_access" name="designer_access" type="checkbox" checked={formData.designer_access} onChange={handleChange} className="h-4 w-4 rounded border-input" />
                  <label htmlFor="designer_access" className="text-sm font-medium">Allow designer access</label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent>
                <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Additional notes..." />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive selection?"
        description="This selection category will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleArchive}
      />
    </div>
  )
}
