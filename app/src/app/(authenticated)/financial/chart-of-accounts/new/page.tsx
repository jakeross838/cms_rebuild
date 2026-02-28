'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function NewAccountPage() {
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    account_number: '',
    name: '',
    account_type: 'expense',
    sub_type: '',
    description: '',
    normal_balance: 'debit',
    is_active: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Auto-set normal balance based on account type
  const handleAccountTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accountType = e.target.value
    const debitTypes = ['asset', 'expense', 'cogs']
    const normalBalance = debitTypes.includes(accountType) ? 'debit' : 'credit'
    setFormData((prev) => ({ ...prev, account_type: accountType, normal_balance: normalBalance }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setError(null)
    setLoading(true)

    try {
      if (!authUser || !companyId) throw new Error('Not authenticated')

      if (!formData.account_number.trim()) { setError('Account number is required'); setLoading(false); return }
      if (!formData.name.trim()) { setError('Account name is required'); setLoading(false); return }

      const { error: insertError } = await supabase
        .from('gl_accounts')
        .insert({
          company_id: companyId,
          account_number: formData.account_number,
          name: formData.name,
          account_type: formData.account_type,
          sub_type: formData.sub_type || null,
          description: formData.description || null,
          normal_balance: formData.normal_balance,
          is_active: formData.is_active,
        })

      if (insertError) throw insertError

      toast.success('Account created')
      router.push('/financial/chart-of-accounts')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create account'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/financial/chart-of-accounts" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Chart of Accounts
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Account</h1>
        <p className="text-muted-foreground">Add a new general ledger account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Define the account number, name, and type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="account_number" className="text-sm font-medium">Account Number <span className="text-red-500">*</span></label>
                <Input id="account_number" name="account_number" value={formData.account_number} onChange={handleChange} placeholder="e.g., 1000, 5100" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Account Name <span className="text-red-500">*</span></label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Cash, Materials Expense" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="account_type" className="text-sm font-medium">Account Type <span className="text-red-500">*</span></label>
                <select id="account_type" name="account_type" value={formData.account_type} onChange={handleAccountTypeChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {[
                    { value: 'asset', label: 'Asset' },
                    { value: 'liability', label: 'Liability' },
                    { value: 'equity', label: 'Equity' },
                    { value: 'revenue', label: 'Revenue' },
                    { value: 'expense', label: 'Expense' },
                    { value: 'cogs', label: 'Cost of Goods Sold' },
                  ].map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="sub_type" className="text-sm font-medium">Sub-Type</label>
                <Input id="sub_type" name="sub_type" value={formData.sub_type} onChange={handleChange} placeholder="e.g., Current Asset, Fixed" />
              </div>
              <div className="space-y-2">
                <label htmlFor="normal_balance" className="text-sm font-medium">Normal Balance <span className="text-red-500">*</span></label>
                <select id="normal_balance" name="normal_balance" value={formData.normal_balance} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="debit">Debit</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input id="is_active" name="is_active" type="checkbox" checked={formData.is_active} onChange={handleChange} className="h-4 w-4 rounded border-input" />
              <label htmlFor="is_active" className="text-sm font-medium">Active</label>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="What this account is used for..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/financial/chart-of-accounts"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Account'}
          </Button>
        </div>
      </form>
    </div>
  )
}
