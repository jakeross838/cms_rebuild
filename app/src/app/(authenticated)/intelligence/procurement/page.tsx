import Link from 'next/link'
import { redirect } from 'next/navigation'

import {
  ShoppingCart,
  ArrowRight,
  Users,
  FileText,
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import type { Metadata } from 'next'

// ── Page ─────────────────────────────────────────────────────────────

export const metadata: Metadata = { title: 'Procurement' }

export default async function ProcurementPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  // ── Parallel data fetching ──
  const [
    totalPOsRes,
    draftPOsRes,
    approvedPOsRes,
    poAmountsRes,
    vendorsRes,
    recentPOsRes,
  ] = await Promise.all([
    supabase.from('purchase_orders').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null),
    supabase.from('purchase_orders').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null).eq('status', 'draft'),
    supabase.from('purchase_orders').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null).eq('status', 'approved'),
    supabase.from('purchase_orders').select('total_amount')
      .eq('company_id', companyId).is('deleted_at', null),
    supabase.from('vendors').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null),
    supabase.from('purchase_orders').select('id, po_number, title, status, total_amount, vendor_id, created_at')
      .eq('company_id', companyId).is('deleted_at', null)
      .order('created_at', { ascending: false }).limit(5),
  ])

  const totalPOs = totalPOsRes.count || 0
  const draftPOs = draftPOsRes.count || 0
  const approvedPOs = approvedPOsRes.count || 0
  const totalVendors = vendorsRes.count || 0

  const poAmounts = (poAmountsRes.data || []) as { total_amount: number }[]
  const totalPOAmount = poAmounts.reduce((sum, po) => sum + (po.total_amount || 0), 0)

  const recentPOs = (recentPOsRes.data || []) as {
    id: string; po_number: string; title: string; status: string
    total_amount: number; vendor_id: string; created_at: string
  }[]

  // ── Fetch vendor names for recent POs ──
  const vendorIds = [...new Set(recentPOs.map((po) => po.vendor_id))]
  let vendorMap: Record<string, string> = {}
  if (vendorIds.length > 0) {
    const { data: vendors, error: vendorError } = await supabase
      .from('vendors')
      .select('id, name')
      .eq('company_id', companyId)
      .in('id', vendorIds)
      .is('deleted_at', null)
    if (vendorError) throw vendorError
    if (vendors) {
      vendorMap = Object.fromEntries(vendors.map((v) => [v.id, v.name]))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          Procurement Intelligence
        </h1>
        <p className="text-muted-foreground mt-1">AI-optimized purchasing and vendor selection</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Purchase Orders</p>
                <p className="text-2xl font-bold">{totalPOs}</p>
                <p className="text-xs text-muted-foreground">{draftPOs} drafts</p>
              </div>
              <Package className="h-8 w-8 text-blue-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total PO Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPOAmount)}</p>
                <p className="text-xs text-muted-foreground">all purchase orders</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Approved POs</p>
                <p className="text-2xl font-bold">{approvedPOs}</p>
                <p className="text-xs text-muted-foreground">ready to send</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Vendors</p>
                <p className="text-2xl font-bold">{totalVendors}</p>
                <p className="text-xs text-muted-foreground">in directory</p>
              </div>
              <Users className="h-8 w-8 text-purple-500/70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Purchase Orders */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Recent Purchase Orders
            </CardTitle>
            <Link href="/purchase-orders" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentPOs.length > 0 ? (
            <div className="divide-y divide-border">
              {recentPOs.map((po) => (
                <Link key={po.id} href={`/purchase-orders/${po.id}`} className="block py-2 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{po.po_number}</span>
                        <span className="text-sm font-medium">{po.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {vendorMap[po.vendor_id] || 'Unknown Vendor'}
                        </span>
                        <span className="text-xs text-muted-foreground">-</span>
                        <span className="text-xs text-muted-foreground">{formatDate(po.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(po.total_amount)}</span>
                      <Badge className={getStatusColor(po.status)}>
                        {po.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No purchase orders yet</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/purchase-orders">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2 bg-blue-100">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Purchase Orders</p>
                <p className="text-xs text-muted-foreground">Create and manage purchase orders</p>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/vendors">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2 bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Vendor Directory</p>
                <p className="text-xs text-muted-foreground">View and manage vendors</p>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
