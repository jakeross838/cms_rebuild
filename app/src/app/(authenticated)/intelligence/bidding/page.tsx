import Link from 'next/link'

import {
  Gavel,
  ArrowRight,
  Clock,
  CheckCircle2,
  Send,
  FileText,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { formatDate, formatStatus, getStatusColor } from '@/lib/utils'
import type { Metadata } from 'next'

// ── Page ─────────────────────────────────────────────────────────────

export const metadata: Metadata = { title: 'Bidding Intelligence' }

export default async function BiddingPage() {
  const { companyId, supabase } = await getServerAuth()

  // ── Parallel data fetching ──
  const [
    totalBidsRes,
    draftBidsRes,
    publishedBidsRes,
    closedBidsRes,
    responsesRes,
    recentBidsRes,
  ] = await Promise.all([
    supabase.from('bid_packages').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null),
    supabase.from('bid_packages').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null).eq('status', 'draft'),
    supabase.from('bid_packages').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null).eq('status', 'published'),
    supabase.from('bid_packages').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null).eq('status', 'closed'),
    supabase.from('bid_responses').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null),
    supabase.from('bid_packages').select('id, title, status, trade, bid_due_date, updated_at')
      .eq('company_id', companyId).is('deleted_at', null)
      .order('updated_at', { ascending: false }).limit(5),
  ])

  const totalBids = totalBidsRes.count || 0
  const draftCount = draftBidsRes.count || 0
  const publishedCount = publishedBidsRes.count || 0
  const closedCount = closedBidsRes.count || 0
  const totalResponses = responsesRes.count || 0

  const recentBids = (recentBidsRes.data || []) as {
    id: string; title: string; status: string; trade: string | null; bid_due_date: string | null; updated_at: string
  }[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Gavel className="h-6 w-6" />
          Bid Intelligence
        </h1>
        <p className="text-muted-foreground mt-1">AI-powered bid analysis and optimization</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Bid Packages</p>
                <p className="text-2xl font-bold">{totalBids}</p>
              </div>
              <Gavel className="h-8 w-8 text-purple-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">{draftCount}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{publishedCount}</p>
              </div>
              <Send className="h-8 w-8 text-blue-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Responses</p>
                <p className="text-2xl font-bold">{totalResponses}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500/70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Banner */}
      <div className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Gavel className="h-4 w-4 text-amber-700" />
          <p className="text-sm text-amber-900">
            <span className="font-medium">{publishedCount} active</span> bid packages accepting responses
            {closedCount > 0 && <> and <span className="font-medium">{closedCount} closed</span> packages awaiting award</>}
          </p>
        </div>
      </div>

      {/* Recent Bids */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              Recent Bid Packages
            </CardTitle>
            <Link href="/bids" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentBids.length > 0 ? (
            <div className="divide-y divide-border">
              {recentBids.map((bid) => (
                <Link key={bid.id} href={`/bids/${bid.id}`} className="block py-2 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{bid.title}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {bid.trade && <span className="text-xs text-muted-foreground">{bid.trade}</span>}
                        {bid.bid_due_date && (
                          <>
                            {bid.trade && <span className="text-xs text-muted-foreground">-</span>}
                            <span className="text-xs text-muted-foreground">Due: {formatDate(bid.bid_due_date)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(bid.status)}>
                      {formatStatus(bid.status)}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No bid packages yet</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/bids">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2 bg-purple-100">
                <Gavel className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Bid Packages</p>
                <p className="text-xs text-muted-foreground">Create and manage bid packages</p>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/vendors">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2 bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Vendor Directory</p>
                <p className="text-xs text-muted-foreground">Review vendors and their bid history</p>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
