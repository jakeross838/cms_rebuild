import Link from 'next/link'
import { redirect } from 'next/navigation'

import {
  MessageSquare,
  Bell,
  ArrowRight,
  Activity,
  Mail,
  BellOff,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

// ── Page ─────────────────────────────────────────────────────────────

export default async function CommunicationHubPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  // ── Parallel data fetching ──
  const [
    totalNotificationsRes,
    unreadNotificationsRes,
    recentNotificationsRes,
  ] = await Promise.all([
    supabase.from('notifications').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).eq('user_id', user.id),
    supabase.from('notifications').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).eq('user_id', user.id).eq('read', false),
    supabase.from('notifications').select('id, title, body, category, read, created_at, url_path, urgency')
      .eq('company_id', companyId).eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(5),
  ])

  const totalNotifications = totalNotificationsRes.count || 0
  const unreadCount = unreadNotificationsRes.count || 0

  const recentNotifications = (recentNotificationsRes.data || []) as {
    id: string; title: string; body: string | null; category: string; read: boolean | null
    created_at: string | null; url_path: string | null; urgency: string | null
  }[]

  function getUrgencyColor(urgency: string | null): string {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-amber-100 text-amber-700'
      case 'normal': return 'bg-blue-100 text-blue-700'
      case 'low': return 'bg-slate-100 text-slate-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Communication Hub
        </h1>
        <p className="text-muted-foreground mt-1">AI-managed communications and follow-ups</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/notifications">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Unread</p>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                  <p className="text-xs text-muted-foreground">notifications</p>
                </div>
                <Bell className="h-8 w-8 text-red-500/70" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/notifications">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{totalNotifications}</p>
                  <p className="text-xs text-muted-foreground">all notifications</p>
                </div>
                <Mail className="h-8 w-8 text-blue-500/70" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Read Rate</p>
                <p className="text-2xl font-bold">
                  {totalNotifications > 0
                    ? Math.round(((totalNotifications - unreadCount) / totalNotifications) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">of all notifications</p>
              </div>
              <BellOff className="h-8 w-8 text-green-500/70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Recent Notifications
            </CardTitle>
            <Link href="/notifications" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentNotifications.length > 0 ? (
            <div className="divide-y divide-border">
              {recentNotifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.url_path || '/notifications'}
                  className="block py-2 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!notif.read && <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />}
                        <span className={`text-sm font-medium truncate ${!notif.read ? '' : 'text-muted-foreground'}`}>
                          {notif.title}
                        </span>
                      </div>
                      {notif.body && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{notif.body}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <Badge className={getUrgencyColor(notif.urgency)}>
                        {notif.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(notif.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No notifications yet</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/notifications">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2 bg-blue-100">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-xs text-muted-foreground">View and manage all notifications</p>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/activity">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2 bg-green-100">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Activity Feed</p>
                <p className="text-xs text-muted-foreground">Recent activity across your company</p>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
