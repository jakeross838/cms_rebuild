'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

type Category = { id: string; name: string; room: string | null }
type Option = { id: string; name: string; category_id: string }

export default function NewSelectionPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [options, setOptions] = useState<Option[]>([])
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([])

  const [formData, setFormData] = useState({
    category_id: '',
    option_id: '',
    room: '',
    status: 'selected',
    change_reason: '',
  })

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) return

      const [categoriesResult, optionsResult] = await Promise.all([
        supabase
          .from('selection_categories')
          .select('id, name, room')
          .eq('company_id', companyId)
          .eq('job_id', jobId)
          .is('deleted_at', null)
          .order('sort_order'),
        supabase
          .from('selection_options')
          .select('id, name, category_id')
          .eq('company_id', companyId)
          .is('deleted_at', null)
          .order('sort_order'),
      ])

      if (categoriesResult.data) setCategories(categoriesResult.data as Category[])
      if (optionsResult.data) setOptions(optionsResult.data as Option[])
    }
    loadData()
  }, [supabase, jobId])

  useEffect(() => {
    if (formData.category_id) {
      setFilteredOptions(options.filter((o) => o.category_id === formData.category_id))
    } else {
      setFilteredOptions([])
    }
    setFormData((prev) => ({ ...prev, option_id: '' }))
  }, [formData.category_id, options])

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

      if (!formData.category_id) throw new Error('Please select a category')
      if (!formData.option_id) throw new Error('Please select an option')

      const { error: insertError } = await supabase
        .from('selections')
        .insert({
          company_id: companyId,
          job_id: jobId,
          category_id: formData.category_id,
          option_id: formData.option_id,
          room: formData.room || null,
          status: formData.status,
          change_reason: formData.change_reason || null,
          selected_by: user.id,
          selected_at: new Date().toISOString(),
          created_by: user.id,
        })

      if (insertError) throw insertError

      router.push(`/jobs/${jobId}/selections`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create selection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/selections`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Selections
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Selection</h1>
        <p className="text-muted-foreground">Record a new product selection for this job</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Selection Details</CardTitle>
            <CardDescription>Category, option, and room</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="category_id" className="text-sm font-medium">Category <span className="text-red-500">*</span></label>
                <select id="category_id" name="category_id" value={formData.category_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select a category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.room ? ` (${c.room})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="option_id" className="text-sm font-medium">Option <span className="text-red-500">*</span></label>
                <select id="option_id" name="option_id" value={formData.option_id} onChange={handleChange} required disabled={!formData.category_id} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50">
                  <option value="">Select an option...</option>
                  {filteredOptions.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="room" className="text-sm font-medium">Room</label>
                <Input id="room" name="room" value={formData.room} onChange={handleChange} placeholder="e.g., Master Bathroom" />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="pending">Pending</option>
                  <option value="presented">Presented</option>
                  <option value="selected">Selected</option>
                  <option value="approved">Approved</option>
                  <option value="ordered">Ordered</option>
                  <option value="received">Received</option>
                  <option value="installed">Installed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea id="change_reason" name="change_reason" value={formData.change_reason} onChange={handleChange} rows={3} placeholder="Reason for selection or change notes..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/jobs/${jobId}/selections`}><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Selection'}
          </Button>
        </div>
      </form>
    </div>
  )
}
