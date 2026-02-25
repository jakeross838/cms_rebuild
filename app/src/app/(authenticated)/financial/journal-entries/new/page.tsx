'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function NewJournalEntryPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    entry_date: '',
    reference_number: '',
    memo: '',
    status: 'draft',
    source_type: 'manual',
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

      const { error: insertError } = await supabase
        .from('gl_journal_entries')
        .insert({
          company_id: companyId,
          entry_date: formData.entry_date,
          reference_number: formData.reference_number || null,
          memo: formData.memo || null,
          status: formData.status,
          source_type: formData.source_type,
          created_by: user.id,
        })

      if (insertError) throw insertError

      router.push('/financial/journal-entries')
      router.refresh()
    } catch (err) {
      setError((err as Error)?.message || 'Failed to create journal entry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/financial/journal-entries" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Journal Entries
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Journal Entry</h1>
        <p className="text-muted-foreground">Create a new general ledger journal entry</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        {/* Entry Details */}
        <Card>
          <CardHeader>
            <CardTitle>Entry Details</CardTitle>
            <CardDescription>Basic journal entry information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="entry_date" className="text-sm font-medium">Entry Date <span className="text-red-500">*</span></label>
                <Input id="entry_date" name="entry_date" type="date" value={formData.entry_date} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="reference_number" className="text-sm font-medium">Reference Number</label>
                <Input id="reference_number" name="reference_number" value={formData.reference_number} onChange={handleChange} placeholder="e.g., JE-2026-001" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {['draft', 'posted', 'voided'].map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="source_type" className="text-sm font-medium">Source Type <span className="text-red-500">*</span></label>
                <select id="source_type" name="source_type" value={formData.source_type} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {[
                    { value: 'manual', label: 'Manual' },
                    { value: 'ap_payment', label: 'AP Payment' },
                    { value: 'ar_receipt', label: 'AR Receipt' },
                    { value: 'payroll', label: 'Payroll' },
                  ].map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memo */}
        <Card>
          <CardHeader>
            <CardTitle>Memo</CardTitle>
            <CardDescription>Description of this journal entry</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea id="memo" name="memo" value={formData.memo} onChange={handleChange} rows={4} placeholder="Describe the purpose of this journal entry..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/financial/journal-entries"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Journal Entry'}
          </Button>
        </div>
      </form>
    </div>
  )
}
