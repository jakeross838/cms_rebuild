import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Bell, Check } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatStatus, getStatusColor } from '@/lib/utils'

interface NotificationRow {
  id: string
  title: string
  body: string | null
  event_type: string
  urgency: string | null
  read: boolean | null
  url_path: string | null
  created_at: string | null
}

export const metadata: Metadata = { title: 'Notifications' }

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }

  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (params.filter === 'unread') {
    query = query.eq('read', false)
  }

  const { data: notificationsData, count, error } = await query
  if (error) throw error
  const notifications = (notificationsData || []) as NotificationRow[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            {' '}&middot; {count || 0} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { value: 'unread', label: 'Unread Only' },
            { value: '', label: 'All' },
          ].map((f) => {
            const sp = new URLSearchParams()
            if (f.value) sp.set('filter', f.value)
            const qs = sp.toString()
            return (
              <Link key={f.value} href={`/notifications${qs ? `?${qs}` : ''}`}>
                <Button variant={(params.filter || '') === f.value ? 'default' : 'outline'} size="sm">
                  {f.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`py-3 first:pt-0 last:pb-0 -mx-2 px-2 rounded-md transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  {notification.url_path ? (
                    <Link href={notification.url_path} className="block hover:bg-accent/50 -mx-2 px-2 rounded-md">
                      <NotificationContent notification={notification} />
                    </Link>
                  ) : (
                    <NotificationContent notification={notification} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No notifications</p>
              <p className="text-sm text-muted-foreground mt-1">
                {params.filter === 'unread' ? 'All notifications have been read' : "You're all caught up"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath="/notifications" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}

function NotificationContent({ notification }: { notification: NotificationRow }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notification.read ? 'bg-transparent' : 'bg-primary'}`} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{notification.title}</span>
            <Badge variant="outline" className="text-xs">{formatStatus(notification.event_type)}</Badge>
            {notification.urgency === 'high' && (
              <Badge className={`${getStatusColor('urgent')} text-xs rounded`}>Urgent</Badge>
            )}
          </div>
          {notification.body && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{notification.body}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">{formatDate(notification.created_at)}</p>
        </div>
      </div>
      {!notification.read && (
        <Check className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
      )}
    </div>
  )
}
