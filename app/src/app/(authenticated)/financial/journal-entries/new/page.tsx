'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────

interface AccountOption {
  id: string
  name: string
  account_number: string
}

interface JournalLine {
  _key: string
  account_id: string
  debit_amount: string
  credit_amount: string
  memo: string
}

// ── Component ──────────────────────────────────────────────────

export default function NewJournalEntryPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<AccountOption[]>([])

  const [formData, setFormData] = useState({
    entry_date: '',
    reference_number: '',
    memo: '',
    status: 'draft',
    source_type: 'manual',
  })

  const [lines, setLines] = useState<JournalLine[]>([
    { _key: crypto.randomUUID(), account_id: '', debit_amount: '', credit_amount: '', memo: '' },
    { _key: crypto.randomUUID(), account_id: '', debit_amount: '', credit_amount: '', memo: '' },
  ])

  useEffect(() => {
    async function loadAccounts() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) return

      const { data } = await supabase
        .from('gl_accounts')
        .select('id, name, account_number')
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('account_number')

      if (data) setAccounts(data as AccountOption[])
    }
    loadAccounts()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLineChange = (index: number, field: keyof JournalLine, value: string) => {
    setLines((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addLine = () => {
    setLines((prev) => [...prev, { _key: crypto.randomUUID(), account_id: '', debit_amount: '', credit_amount: '', memo: '' }])
  }

  const removeLine = (index: number) => {
    if (lines.length <= 2) return
    setLines((prev) => prev.filter((_, i) => i !== index))
  }

  const totalDebits = lines.reduce((sum, l) => sum + (parseFloat(l.debit_amount) || 0), 0)
  const totalCredits = lines.reduce((sum, l) => sum + (parseFloat(l.credit_amount) || 0), 0)
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate lines
    const validLines = lines.filter((l) => l.account_id && (parseFloat(l.debit_amount) > 0 || parseFloat(l.credit_amount) > 0))
    if (validLines.length < 2) {
      setError('At least 2 journal lines with amounts are required')
      return
    }
    if (!isBalanced) {
      setError(`Debits (${formatCurrency(totalDebits)}) must equal credits (${formatCurrency(totalCredits)})`)
      return
    }

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

      // Create the journal entry header
      const { data: entry, error: entryError } = await supabase
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
        .select('id')
        .single()

      if (entryError || !entry) throw entryError || new Error('Failed to create entry')

      // Insert journal lines
      const lineInserts = validLines.map((l) => ({
        journal_entry_id: (entry as { id: string }).id,
        account_id: l.account_id,
        debit_amount: parseFloat(l.debit_amount) || 0,
        credit_amount: parseFloat(l.credit_amount) || 0,
        memo: l.memo || null,
      }))

      const { error: linesError } = await supabase
        .from('gl_journal_lines')
        .insert(lineInserts)

      if (linesError) throw linesError

      toast.success('Journal entry created')
      router.push('/financial/journal-entries')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create journal entry'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/financial/journal-entries" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Journal Entries
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Journal Entry</h1>
        <p className="text-muted-foreground">Create a new general ledger journal entry with line items</p>
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
            <textarea id="memo" aria-label="Memo" name="memo" value={formData.memo} onChange={handleChange} rows={3} placeholder="Describe the purpose of this journal entry..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        {/* Journal Lines */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Journal Lines</CardTitle>
                <CardDescription>Debit and credit entries must balance</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus className="h-4 w-4 mr-1" />Add Line
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th scope="col" className="pb-2 pr-2 font-medium text-muted-foreground">Account <span className="text-red-500">*</span></th>
                    <th scope="col" className="pb-2 pr-2 font-medium text-muted-foreground text-right w-32">Debit</th>
                    <th scope="col" className="pb-2 pr-2 font-medium text-muted-foreground text-right w-32">Credit</th>
                    <th scope="col" className="pb-2 pr-2 font-medium text-muted-foreground w-40">Memo</th>
                    <th scope="col" className="pb-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={line._key} className="border-b last:border-0">
                      <td className="py-2 pr-2">
                        <select
                          aria-label="Account"
                          value={line.account_id}
                          onChange={(e) => handleLineChange(index, 'account_id', e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="">Select account...</option>
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>{a.account_number} — {a.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={line.debit_amount}
                          onChange={(e) => handleLineChange(index, 'debit_amount', e.target.value)}
                          className="text-right"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={line.credit_amount}
                          onChange={(e) => handleLineChange(index, 'credit_amount', e.target.value)}
                          className="text-right"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <Input
                          placeholder="Line memo"
                          value={line.memo}
                          onChange={(e) => handleLineChange(index, 'memo', e.target.value)}
                        />
                      </td>
                      <td className="py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label="Remove line"
                          onClick={() => removeLine(index)}
                          disabled={lines.length <= 2}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-medium">
                    <td className="py-2 pr-2">Totals</td>
                    <td className="py-2 pr-2 text-right font-mono">{formatCurrency(totalDebits)}</td>
                    <td className="py-2 pr-2 text-right font-mono">{formatCurrency(totalCredits)}</td>
                    <td className="py-2 pr-2" colSpan={2}>
                      {totalDebits > 0 || totalCredits > 0 ? (
                        isBalanced ? (
                          <span className="text-green-600 text-xs">Balanced</span>
                        ) : (
                          <span className="text-destructive text-xs">
                            Difference: {formatCurrency(Math.abs(totalDebits - totalCredits))}
                          </span>
                        )
                      ) : null}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/financial/journal-entries"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading || (!isBalanced && (totalDebits > 0 || totalCredits > 0))}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Journal Entry'}
          </Button>
        </div>
      </form>
    </div>
  )
}
