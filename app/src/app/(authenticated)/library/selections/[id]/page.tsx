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
import { useSelectionCategory, useUpdateSelectionCategory, useDeleteSelectionCategory } from '@/hooks/use-selections'
import { formatCurrency, formatDate, getStatusColor, formatStatus } from '@/lib/utils'
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

  const categoryId = params.id as string
  const { data: response, isLoading: loading, error: fetchError } = useSelectionCategory(categoryId)
  const updateCategory = useUpdateSelectionCategory(categoryId)
  const deleteCategory = useDeleteSelectionCategory()
  const category = (response as { data: CategoryData } | undefined)?.data ?? null

  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [archiving, setArchiving] = useState(false)
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
    if (category) {
      setFormData({
        name: category.name || '',
        room: category.room || '',
        sort_order: category.sort_order != null ? String(category.sort_order) : '',
        pricing_model: category.pricing_model || 'allowance',
        allowance_amount: category.allowance_amount != null ? String(category.allowance_amount) : '',
        deadline: category.deadline || '',
        lead_time_buffer_days: category.lead_time_buffer_days != null ? String(category.lead_time_buffer_days) : '',
        status: category.status || 'pending',
        designer_access: category.designer_access ?? false,
        notes: category.notes || '',
      })
    }
  }, [category])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSave = async () => {
    setError(null)
    try {
      await updateCategory.mutateAsync({
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
      toast.success('Saved')
      setEditing(false)
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to save')
    }
  }

  const handleArchive = async () => {
    try {
      setArchiving(true)
      await deleteCategory.mutateAsync(categoryId)
      toast.success('Archived')
      router.push('/library/selections')
      router.refresh()
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to archive')
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

  if (!category) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/library/selections" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Selections
        </Link>
        <p className="text-destructive">{fetchError?.message || 'Category not found'}</p>
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
              <Badge className={`${getStatusColor(category.status)} rounded`}>{formatStatus(category.status)}</Badge>
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
                <Button onClick={() => { setEditing(false); setError(null) }} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={updateCategory.isPending}>
                  {updateCategory.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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
                    <p className="font-medium">{formatStatus(category.pricing_model)}</p>
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
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)} disabled={archiving}>
                {archiving ? 'Archiving...' : 'Archive Category'}
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
                        <option key={p} value={p}>{formatStatus(p)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{formatStatus(s)}</option>
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
