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
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusColor, formatStatus } from '@/lib/utils'
import { toast } from 'sonner'

interface JournalEntryData {
  id: string
  company_id: string
  entry_date: string
  reference_number: string | null
  memo: string | null
  status: string
  source_type: string
  source_id: string | null
  posted_by: string | null
  posted_at: string | null
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

interface JournalLineData {
  id: string
  journal_entry_id: string
  account_id: string
  debit_amount: number | null
  credit_amount: number | null
  memo: string | null
  job_id: string | null
  account_name?: string
  account_number?: string
}

interface AccountLookup {
  id: string
  name: string
  account_number: string
}

export default function JournalEntryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [entry, setEntry] = useState<JournalEntryData | null>(null)
  const [lines, setLines] = useState<JournalLineData[]>([])
  const [accounts, setAccounts] = useState<AccountLookup[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    entry_date: '',
    reference_number: '',
    memo: '',
    status: '',
    source_type: '',
  })

  useEffect(() => {
    async function loadData() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      const [entryRes, linesRes, accountsRes] = await Promise.all([
        supabase
          .from('gl_journal_entries')
          .select('*')
          .eq('id', params.id as string)
          .single(),
        supabase
          .from('gl_journal_lines')
          .select('*')
          .eq('journal_entry_id', params.id as string)
          .order('created_at'),
        supabase.from('gl_accounts').select('id, name, account_number').eq('company_id', companyId).is('deleted_at', null).order('account_number'),
      ])

      if (entryRes.error || !entryRes.data) {
        setError('Journal entry not found')
        setLoading(false)
        return
      }

      const e = entryRes.data as JournalEntryData
      setEntry(e)
      setAccounts((accountsRes.data as AccountLookup[]) || [])

      const accountMap = new Map<string, AccountLookup>()
      ;((accountsRes.data as AccountLookup[]) || []).forEach((a) => accountMap.set(a.id, a))

      const enrichedLines = ((linesRes.data as JournalLineData[]) || []).map((line) => {
        const acct = accountMap.get(line.account_id)
        return {
          ...line,
          account_name: acct?.name || 'Unknown',
          account_number: acct?.account_number || '',
        }
      })
      setLines(enrichedLines)

      setFormData({
        entry_date: e.entry_date,
        reference_number: e.reference_number || '',
        memo: e.memo || '',
        status: e.status,
        source_type: e.source_type,
      })
      setLoading(false)
    }
    loadData()
  }, [params.id, supabase, companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleConfirmArchive = async () => {
    setArchiving(true)
    try {
      const { error: archiveError } = await supabase
        .from('gl_journal_entries')
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq('id', params.id as string)
        .eq('company_id', companyId)
      if (archiveError) throw archiveError
      toast.success('Archived')
      router.push('/financial/journal-entries')
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to archive'
      setError(errorMessage)
      toast.error(errorMessage)
      setArchiving(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('gl_journal_entries')
        .update({
          entry_date: formData.entry_date,
          reference_number: formData.reference_number || null,
          memo: formData.memo || null,
          status: formData.status,
          source_type: formData.source_type,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setEntry((prev) =>
        prev
          ? {
              ...prev,
              entry_date: formData.entry_date,
              reference_number: formData.reference_number || null,
              memo: formData.memo || null,
              status: formData.status,
              source_type: formData.source_type,
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

  const totalDebits = lines.reduce((sum, l) => sum + (l.debit_amount || 0), 0)
  const totalCredits = lines.reduce((sum, l) => sum + (l.credit_amount || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/financial/journal-entries" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Journal Entries
        </Link>
        <p className="text-destructive">{error || 'Journal entry not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/financial/journal-entries" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Journal Entries
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                Journal Entry {entry.reference_number ? `#${entry.reference_number}` : ''}
              </h1>
              <Badge className={`rounded ${getStatusColor(entry.status)}`}>{formatStatus(entry.status)}</Badge>
            </div>
            <p className="text-muted-foreground">{formatDate(entry.entry_date)} -- {formatStatus(entry.source_type)}</p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
              <Button onClick={() => setShowArchiveDialog(true)} disabled={archiving} variant="outline" className="text-destructive hover:text-destructive">{archiving ? 'Archiving...' : 'Archive'}</Button>
              </>
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Journal entry updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader><CardTitle>Entry Details</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Reference Number</dt>
                    <dd className="font-medium">{entry.reference_number || 'None'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Entry Date</dt>
                    <dd className="font-medium">{formatDate(entry.entry_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd><Badge className={`rounded ${getStatusColor(entry.status)}`}>{formatStatus(entry.status)}</Badge></dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Source Type</dt>
                    <dd className="font-medium">{formatStatus(entry.source_type)}</dd>
                  </div>
                  {entry.posted_at && (
                    <div>
                      <dt className="text-muted-foreground">Posted At</dt>
                      <dd className="font-medium">{formatDate(entry.posted_at)}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {entry.memo && (
              <Card>
                <CardHeader><CardTitle>Memo</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.memo}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle>Journal Lines</CardTitle></CardHeader>
              <CardContent>
                {lines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No journal lines</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th scope="col" className="pb-2 font-medium text-muted-foreground">Account</th>
                          <th scope="col" className="pb-2 font-medium text-muted-foreground text-right">Debit</th>
                          <th scope="col" className="pb-2 font-medium text-muted-foreground text-right">Credit</th>
                          <th scope="col" className="pb-2 font-medium text-muted-foreground">Memo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lines.map((line) => (
                          <tr key={line.id} className="border-b last:border-0">
                            <td className="py-2">
                              <span className="text-muted-foreground">{line.account_number}</span>{' '}
                              {line.account_name}
                            </td>
                            <td className="py-2 text-right">{line.debit_amount ? formatCurrency(line.debit_amount) : ''}</td>
                            <td className="py-2 text-right">{line.credit_amount ? formatCurrency(line.credit_amount) : ''}</td>
                            <td className="py-2 text-muted-foreground">{line.memo || ''}</td>
                          </tr>
                        ))}
                        <tr className="font-medium border-t">
                          <td className="py-2">Totals</td>
                          <td className="py-2 text-right">{formatCurrency(totalDebits)}</td>
                          <td className="py-2 text-right">{formatCurrency(totalCredits)}</td>
                          <td className="py-2">
                            {totalDebits !== totalCredits && (
                              <span className="text-destructive text-xs">Out of balance</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Entry Information</CardTitle>
                <CardDescription>Update journal entry details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="reference_number" className="text-sm font-medium">Reference Number</label>
                    <Input id="reference_number" name="reference_number" value={formData.reference_number} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="entry_date" className="text-sm font-medium">Entry Date <span className="text-red-500">*</span></label>
                    <Input id="entry_date" name="entry_date" type="date" value={formData.entry_date} onChange={handleChange} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="draft">Draft</option>
                      <option value="posted">Posted</option>
                      <option value="void">Void</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="source_type" className="text-sm font-medium">Source Type <span className="text-red-500">*</span></label>
                    <select id="source_type" name="source_type" value={formData.source_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="manual">Manual</option>
                      <option value="bill_payment">Bill Payment</option>
                      <option value="invoice">Invoice</option>
                      <option value="adjustment">Adjustment</option>
                      <option value="closing">Closing</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="memo" className="text-sm font-medium">Memo</label>
                  <textarea id="memo" aria-label="Memo" name="memo" value={formData.memo} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive this journal entry?"
        description="This journal entry will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleConfirmArchive}
      />
    </div>
  )
}
