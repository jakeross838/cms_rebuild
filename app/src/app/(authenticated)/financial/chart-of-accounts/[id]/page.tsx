'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface AccountData {
  id: string
  company_id: string
  account_number: string
  name: string
  account_type: string
  sub_type: string | null
  parent_account_id: string | null
  is_active: boolean | null
  is_system: boolean | null
  description: string | null
  normal_balance: string
  created_at: string | null
  updated_at: string | null
}

export default function ChartOfAccountsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [account, setAccount] = useState<AccountData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const [formData, setFormData] = useState({
    account_number: '',
    name: '',
    account_type: '',
    sub_type: '',
    normal_balance: '',
    is_active: true,
    description: '',
  })

  useEffect(() => {
    async function loadAccount() {
      const { data, error: fetchError } = await supabase
        .from('gl_accounts')
        .select('*')
        .eq('id', params.id as string)
        .single()

      if (fetchError || !data) {
        setError('Account not found')
        setLoading(false)
        return
      }

      const a = data as AccountData
      setAccount(a)
      setFormData({
        account_number: a.account_number,
        name: a.name,
        account_type: a.account_type,
        sub_type: a.sub_type || '',
        normal_balance: a.normal_balance,
        is_active: a.is_active !== false,
        description: a.description || '',
      })
      setLoading(false)
    }
    loadAccount()
  }, [params.id, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleArchive = async () => {
    if (!window.confirm('Archive this account? It can be restored later.')) return
    setArchiving(true)
    try {
      const { error: archiveError } = await supabase
        .from('gl_accounts')
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq('id', params.id as string)
      if (archiveError) throw archiveError
      router.push('/financial/chart-of-accounts')
    } catch (err) {
      setError((err as Error)?.message || 'Failed to archive')
      setArchiving(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('gl_accounts')
        .update({
          account_number: formData.account_number,
          name: formData.name,
          account_type: formData.account_type,
          sub_type: formData.sub_type || null,
          normal_balance: formData.normal_balance,
          is_active: formData.is_active,
          description: formData.description || null,
        })
        .eq('id', params.id as string)

      if (updateError) throw updateError

      setAccount((prev) =>
        prev
          ? {
              ...prev,
              account_number: formData.account_number,
              name: formData.name,
              account_type: formData.account_type,
              sub_type: formData.sub_type || null,
              normal_balance: formData.normal_balance,
              is_active: formData.is_active,
              description: formData.description || null,
            }
          : prev
      )
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError((err as Error)?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async () => {
    const newActive = !(account?.is_active !== false)
    const action = newActive ? 'activate' : 'deactivate'
    if (!confirm(`${newActive ? 'Activate' : 'Deactivate'} this account?`)) return

    const { error: toggleError } = await supabase
      .from('gl_accounts')
      .update({ is_active: newActive })
      .eq('id', params.id as string)

    if (toggleError) {
      setError(`Failed to ${action} account`)
      return
    }

    setAccount((prev) => prev ? { ...prev, is_active: newActive } : prev)
    setFormData((prev) => ({ ...prev, is_active: newActive }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!account) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/financial/chart-of-accounts" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Chart of Accounts
        </Link>
        <p className="text-destructive">{error || 'Account not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/financial/chart-of-accounts" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Chart of Accounts
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{account.account_number} - {account.name}</h1>
              {account.is_active === false && (
                <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>
              )}
              {account.is_system && (
                <Badge variant="outline" className="text-xs text-blue-700 bg-blue-50">System</Badge>
              )}
            </div>
            <p className="text-muted-foreground capitalize">{account.account_type.replace(/_/g, ' ')} -- Normal {account.normal_balance}</p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
              <button onClick={handleArchive} disabled={archiving} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">{archiving ? 'Archiving...' : 'Archive'}</button>
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Account updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Account Number</dt>
                    <dd className="font-medium">{account.account_number}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Account Name</dt>
                    <dd className="font-medium">{account.name}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Account Type</dt>
                    <dd className="font-medium capitalize">{account.account_type.replace(/_/g, ' ')}</dd>
                  </div>
                  {account.sub_type && (
                    <div>
                      <dt className="text-muted-foreground">Sub Type</dt>
                      <dd className="font-medium capitalize">{account.sub_type.replace(/_/g, ' ')}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-muted-foreground">Normal Balance</dt>
                    <dd className="font-medium capitalize">{account.normal_balance}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <Badge className={`rounded ${account.is_active !== false ? 'bg-success-bg text-success-dark' : 'bg-warm-100 text-warm-700'}`}>
                        {account.is_active !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {account.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{account.description}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                className={account.is_active !== false ? 'text-destructive hover:text-destructive' : ''}
                onClick={handleToggleActive}
              >
                {account.is_active !== false ? 'Deactivate Account' : 'Activate Account'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="account_number" className="text-sm font-medium">Account Number <span className="text-red-500">*</span></label>
                    <Input id="account_number" name="account_number" value={formData.account_number} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Account Name <span className="text-red-500">*</span></label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="account_type" className="text-sm font-medium">Account Type <span className="text-red-500">*</span></label>
                    <select id="account_type" name="account_type" value={formData.account_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="asset">Asset</option>
                      <option value="liability">Liability</option>
                      <option value="equity">Equity</option>
                      <option value="revenue">Revenue</option>
                      <option value="expense">Expense</option>
                      <option value="cost_of_goods_sold">Cost of Goods Sold</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="sub_type" className="text-sm font-medium">Sub Type</label>
                    <Input id="sub_type" name="sub_type" value={formData.sub_type} onChange={handleChange} placeholder="e.g., current_asset" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="normal_balance" className="text-sm font-medium">Normal Balance <span className="text-red-500">*</span></label>
                    <select id="normal_balance" name="normal_balance" value={formData.normal_balance} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="debit">Debit</option>
                      <option value="credit">Credit</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input id="is_active" name="is_active" type="checkbox" checked={formData.is_active} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-input" />
                  <label htmlFor="is_active" className="text-sm font-medium">Active</label>
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
