import Link from 'next/link'

import { Plus, Search, Landmark } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

interface GLAccount {
  id: string
  account_number: string
  name: string
  account_type: string
  parent_account_id: string | null
  is_active: boolean | null
  is_system: boolean | null
  normal_balance: string
  sub_type: string | null
  description: string | null
}

export default async function ChartOfAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('gl_accounts')
    .select('*')
    .order('account_number', { ascending: true })

  if (params.type) {
    query = query.eq('account_type', params.type)
  }

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,account_number.ilike.%${params.search}%`)
  }

  const { data: accountsData } = await query
  const accounts = (accountsData || []) as GLAccount[]

  const typeGroups = ['asset', 'liability', 'equity', 'revenue', 'expense']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chart of Accounts</h1>
          <p className="text-muted-foreground">{accounts.length} accounts</p>
        </div>
        <Link href="/financial/chart-of-accounts/new"><Button><Plus className="h-4 w-4 mr-2" />Add Account</Button></Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form><Input type="search" name="search" placeholder="Search accounts..." defaultValue={params.search} className="pl-10" /></form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Number</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Name</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Type</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Normal Balance</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {accounts.map((account) => (
                    <tr key={account.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                      <td className="py-2 pr-4 font-mono">
                        <Link href={`/financial/chart-of-accounts/${account.id}`} className="block">{account.account_number}</Link>
                      </td>
                      <td className="py-2 pr-4 font-medium">
                        <Link href={`/financial/chart-of-accounts/${account.id}`} className="block">{account.name}</Link>
                      </td>
                      <td className="py-2 pr-4">
                        <Link href={`/financial/chart-of-accounts/${account.id}`} className="block">
                          <Badge variant="outline" className="text-xs">{account.account_type ?? '—'}</Badge>
                        </Link>
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">
                        <Link href={`/financial/chart-of-accounts/${account.id}`} className="block">{account.normal_balance ?? '—'}</Link>
                      </td>
                      <td className="py-2 pr-4">
                        <Link href={`/financial/chart-of-accounts/${account.id}`} className="block">
                          <Badge variant="outline" className={account.is_active !== false ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}>
                            {account.is_active !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Landmark className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No accounts yet</p>
              <p className="text-sm text-muted-foreground mt-1">Set up your chart of accounts to start tracking financials</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
