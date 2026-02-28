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
import { useAssembly, useUpdateAssembly, useDeleteAssembly } from '@/hooks/use-estimating'
import { getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

interface AssemblyData {
  id: string
  name: string
  category: string | null
  parameter_unit: string | null
  is_active: boolean
  description: string | null
  created_at: string | null
}

export default function AssemblyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const entityId = params.id as string

  const { data: response, isLoading: loading, error: fetchError } = useAssembly(entityId)
  const updateAssembly = useUpdateAssembly(entityId)
  const deleteAssembly = useDeleteAssembly()
  const assembly = (response as { data: AssemblyData } | undefined)?.data ?? null

  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    parameter_unit: '',
    description: '',
  })

  useEffect(() => {
    if (assembly) {
      setFormData({
        name: assembly.name,
        category: assembly.category || '',
        parameter_unit: assembly.parameter_unit || '',
        description: assembly.description || '',
      })
    }
  }, [assembly])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Name is required'); return }

    try {
      await updateAssembly.mutateAsync({
        name: formData.name,
        category: formData.category || null,
        parameter_unit: formData.parameter_unit || null,
        description: formData.description || null,
      } as Record<string, unknown>)
      toast.success('Saved')
      setEditing(false)
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to save')
    }
  }

  const handleDelete = async () => {
    try {
      setArchiving(true)
      await deleteAssembly.mutateAsync(entityId)
      toast.success('Archived')
      router.push('/library/assemblies')
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

  if (!assembly) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/library/assemblies" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Assemblies
        </Link>
        <p className="text-destructive">{fetchError?.message || 'Assembly not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/library/assemblies" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Assemblies
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{assembly.name}</h1>
              <Badge className={getStatusColor(assembly.is_active ? 'active' : 'archived')}>
                {assembly.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {assembly.category || 'Uncategorized'}{assembly.parameter_unit ? ` — per ${assembly.parameter_unit}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
            ) : (
              <>
                <Button onClick={() => { setEditing(false); setError(null) }} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={updateAssembly.isPending}>
                  {updateAssembly.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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
                <CardTitle>Assembly Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="text-sm font-medium">{assembly.category || 'Uncategorized'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Parameter Unit</p>
                    <p className="text-sm font-medium">{assembly.parameter_unit || 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {assembly.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{assembly.description}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)} disabled={archiving}>
                {archiving ? 'Archiving...' : 'Archive Assembly'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Assembly Information</CardTitle>
                <CardDescription>Update assembly details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Framing, Electrical" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="parameter_unit" className="text-sm font-medium">Parameter Unit</label>
                  <Input id="parameter_unit" name="parameter_unit" value={formData.parameter_unit} onChange={handleChange} placeholder="e.g., sqft, lf, each" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive assembly?"
        description="This assembly will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
