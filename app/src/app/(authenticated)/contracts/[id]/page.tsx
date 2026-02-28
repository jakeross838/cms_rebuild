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
import { useContract, useUpdateContract, useDeleteContract } from '@/hooks/use-contracts'
import { formatCurrency, formatDate, getStatusColor, formatStatus } from '@/lib/utils'
import { toast } from 'sonner'

interface ContractData {
  id: string
  title: string | null
  contract_number: string | null
  contract_type: string | null
  status: string | null
  contract_value: number | null
  retention_pct: number | null
  start_date: string | null
  end_date: string | null
  description: string | null
  content: string | null
  created_at: string | null
}

const CONTRACT_TYPE_OPTIONS = ['prime', 'subcontract', 'purchase_order', 'service_agreement', 'change_order', 'amendment', 'nda', 'other']

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()

  const contractId = params.id as string
  const { data: response, isLoading: loading, error: fetchError } = useContract(contractId)
  const updateContract = useUpdateContract(contractId)
  const deleteContract = useDeleteContract()
  const contract = (response as { data: ContractData } | undefined)?.data ?? null

  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    contract_number: '',
    contract_type: '',
    contract_value: '',
    retention_pct: '',
    start_date: '',
    end_date: '',
    description: '',
  })

  useEffect(() => {
    if (contract) {
      setFormData({
        title: contract.title || '',
        contract_number: contract.contract_number || '',
        contract_type: contract.contract_type || '',
        contract_value: contract.contract_value?.toString() || '',
        retention_pct: contract.retention_pct?.toString() || '',
        start_date: contract.start_date || '',
        end_date: contract.end_date || '',
        description: contract.description || '',
      })
    }
  }, [contract])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      await updateContract.mutateAsync({
        title: formData.title || undefined,
        contract_number: formData.contract_number || undefined,
        contract_type: formData.contract_type || undefined,
        contract_value: formData.contract_value ? parseFloat(formData.contract_value) : undefined,
        retention_pct: formData.retention_pct ? parseFloat(formData.retention_pct) : undefined,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        description: formData.description || null,
      } as Record<string, unknown>)

      toast.success('Contract updated')
      setEditing(false)
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to save contract')
    }
  }

  const handleDelete = async () => {
    try {
      setArchiving(true)
      await deleteContract.mutateAsync(contractId)
      toast.success('Contract archived')
      router.push('/contracts')
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

  if (!contract) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/contracts" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Contracts
        </Link>
        <p className="text-destructive">{fetchError?.message || 'Contract not found'}</p>
      </div>
    )
  }


  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/contracts" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Contracts
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {contract.title || 'Untitled Contract'}
              </h1>
              {contract.status && (
                <Badge className={getStatusColor(contract.status || 'draft')}>{formatStatus(contract.status || 'draft')}</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {contract.contract_number ? `#${contract.contract_number} — ` : ''}
              Created {formatDate(contract.created_at) || 'Unknown'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
            ) : (
              <>
                <Button onClick={() => { setEditing(false); setError(null) }} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={updateContract.isPending}>
                  {updateContract.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Contract Number</span>
                    <p className="font-medium font-mono">{contract.contract_number || '--'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type</span>
                    <p className="font-medium">{contract.contract_type ? formatStatus(contract.contract_type) : '--'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contract Value</span>
                    <p className="font-medium text-lg">{formatCurrency(contract.contract_value)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Retention</span>
                    <p className="font-medium">{contract.retention_pct != null ? `${contract.retention_pct}%` : '--'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Start Date</span>
                    <p className="font-medium">{formatDate(contract.start_date) || '--'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End Date</span>
                    <p className="font-medium">{formatDate(contract.end_date) || '--'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {contract.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contract.description}</p>
                </CardContent>
              </Card>
            )}

            {contract.content && (
              <Card>
                <CardHeader><CardTitle>Content</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contract.content}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)} disabled={archiving}>
                {archiving ? 'Archiving...' : 'Archive Contract'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Contract Information</CardTitle>
                <CardDescription>Update contract details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title</label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="contract_number" className="text-sm font-medium">Contract Number</label>
                    <Input id="contract_number" name="contract_number" value={formData.contract_number} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contract_type" className="text-sm font-medium">Contract Type</label>
                    <select id="contract_type" name="contract_type" value={formData.contract_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">--</option>
                      {CONTRACT_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{formatStatus(t)}</option>)}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="contract_value" className="text-sm font-medium">Contract Value</label>
                    <Input id="contract_value" name="contract_value" type="number" step="0.01" value={formData.contract_value} onChange={handleChange} placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="retention_pct" className="text-sm font-medium">Retention %</label>
                    <Input id="retention_pct" name="retention_pct" type="number" step="0.01" value={formData.retention_pct} onChange={handleChange} placeholder="0.00" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="start_date" className="text-sm font-medium">Start Date</label>
                    <Input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="end_date" className="text-sm font-medium">End Date</label>
                    <Input id="end_date" name="end_date" type="date" value={formData.end_date} onChange={handleChange} />
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
        title="Archive contract?"
        description="This contract will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
