'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface InventoryItem {
  id: string
  name: string
  sku: string | null
  unit_of_measure: string
}

export default function NewInventoryTransactionPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [loadingItems, setLoadingItems] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [companyId, setCompanyId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    item_id: '',
    transaction_type: 'receive',
    quantity: '',
    unit_cost: '',
    notes: '',
  })

  useEffect(() => {
    async function loadItems() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        setLoadingItems(false)
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const resolvedCompanyId = (profile as { company_id: string } | null)?.company_id
      if (!resolvedCompanyId) {
        setError('No company found')
        setLoadingItems(false)
        return
      }

      setCompanyId(resolvedCompanyId)

      const { data, error: fetchError } = await supabase
        .from('inventory_items')
        .select('id, name, sku, unit_of_measure')
        .eq('company_id', resolvedCompanyId)
        .is('deleted_at', null)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (fetchError) {
        setError('Failed to load inventory items')
      } else {
        setItems((data || []) as InventoryItem[])
      }
      setLoadingItems(false)
    }
    loadItems()
  }, [supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (!companyId) throw new Error('No company found')

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
      if (!jobCheck) throw new Error('Job not found or access denied')

      if (!formData.item_id) throw new Error('Please select an inventory item')
      if (!formData.quantity) throw new Error('Please enter a quantity')

      const { error: insertError } = await supabase
        .from('inventory_transactions')
        .insert({
          company_id: companyId,
          item_id: formData.item_id,
          job_id: jobId,
          transaction_type: formData.transaction_type as 'receive' | 'consume' | 'transfer' | 'adjust',
          quantity: parseFloat(formData.quantity),
          unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
          notes: formData.notes || null,
          performed_by: user.id,
        })

      if (insertError) throw insertError

      toast.success('Inventory transaction created')
      router.push(`/jobs/${jobId}/inventory`)
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create transaction'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const selectedItem = items.find((i) => i.id === formData.item_id)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/inventory`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Job Inventory
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Inventory Transaction</h1>
        <p className="text-muted-foreground">Record material received, consumed, transferred, or adjusted</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>Select an item and transaction type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="item_id" className="text-sm font-medium">Inventory Item <span className="text-red-500">*</span></label>
              {loadingItems ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />Loading items...
                </div>
              ) : (
                <select id="item_id" name="item_id" value={formData.item_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select an item...</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}{item.sku ? ` (${item.sku})` : ''} &mdash; {item.unit_of_measure}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="transaction_type" className="text-sm font-medium">Transaction Type <span className="text-red-500">*</span></label>
              <select id="transaction_type" name="transaction_type" value={formData.transaction_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="receive">Receive</option>
                <option value="consume">Consume</option>
                <option value="transfer">Transfer</option>
                <option value="adjust">Adjust</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="quantity" className="text-sm font-medium">
                  Quantity{selectedItem ? ` (${selectedItem.unit_of_measure})` : ''} <span className="text-red-500">*</span>
                </label>
                <Input id="quantity" name="quantity" type="number" step="0.01" min="0" value={formData.quantity} onChange={handleChange} placeholder="0" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="unit_cost" className="text-sm font-medium">Unit Cost ($)</label>
                <Input id="unit_cost" name="unit_cost" type="number" step="0.01" min="0" value={formData.unit_cost} onChange={handleChange} placeholder="0.00" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Additional details about this transaction..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/jobs/${jobId}/inventory`}><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Transaction'}
          </Button>
        </div>
      </form>
    </div>
  )
}
