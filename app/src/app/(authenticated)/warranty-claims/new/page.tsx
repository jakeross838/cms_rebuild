'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function NewWarrantyClaimPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    reported_date: today,
    due_date: '',
    resolution_notes: '',
  })

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

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) throw new Error('No company found')

      // claim_number generated client-side; warranty_id nullable per spec
      const claimNumber = `WC-${Date.now().toString(36).toUpperCase()}`

      const insertPayload = {
        company_id: companyId,
        claim_number: claimNumber,
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority,
        status: 'Open',
        reported_date: formData.reported_date || undefined,
        due_date: formData.due_date || undefined,
        resolution_notes: formData.resolution_notes || null,
        reported_by: user.id,
        created_by: user.id,
      }

      const { error: insertError } = await supabase
        .from('warranty_claims')
        .insert(insertPayload as never)

      if (insertError) throw insertError

      router.push('/warranty-claims')
      router.refresh()
    } catch (err) {
      setError((err as Error)?.message || 'Failed to create warranty claim')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/warranty-claims" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Warranty Claims
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Warranty Claim</h1>
        <p className="text-muted-foreground">File a new warranty claim</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Claim Details</CardTitle>
            <CardDescription>Describe the warranty issue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Kitchen faucet leak" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the issue in detail..."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="reported_date" className="text-sm font-medium">Reported Date</label>
                <Input id="reported_date" name="reported_date" type="date" value={formData.reported_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="due_date" className="text-sm font-medium">Due Date</label>
                <Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolution Notes</CardTitle>
            <CardDescription>Optional notes about planned resolution</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              id="resolution_notes"
              name="resolution_notes"
              value={formData.resolution_notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any initial notes about how to resolve this claim..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/warranty-claims"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Claim'}
          </Button>
        </div>
      </form>
    </div>
  )
}
