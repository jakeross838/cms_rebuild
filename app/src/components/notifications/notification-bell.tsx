'use client'

import { useState, useRef, useEffect } from 'react'

import {
  Bell,
  Check,
  CheckCheck,
  X,
  DollarSign,
  Calendar,
  FileText,
  HardHat,
  Shield,
  Settings,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import { useNotifications, type NotificationItem } from '@/hooks/use-notifications'
import type { NotificationCategory, NotificationUrgency } from '@/types/database'

const categoryIcons: Record<NotificationCategory, React.ElementType> = {
  financial: DollarSign,
  schedule: Calendar,
  documents: FileText,
  field_operations: HardHat,
  approvals: Shield,
  system: Settings,
}

const urgencyColors: Record<NotificationUrgency, string> = {
  low: 'bg-muted',
  normal: 'bg-blue-500',
  high: 'bg-amber-500',
  critical: 'bg-destructive',
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffMs = now - date
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    archiveNotification,
  } = useNotifications()

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleNotificationClick(notification: NotificationItem) {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    if (notification.url_path) {
      router.push(notification.url_path)
    }
    setOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent transition-colors"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-96 max-h-[480px] rounded-lg bg-background shadow-lg ring-1 ring-border z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            ) : null}
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => {
                const CategoryIcon = categoryIcons[notification.category as NotificationCategory] || Bell
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border/50 last:border-0',
                      !notification.read && 'bg-primary/5'
                    )}
                  >
                    <div className="relative mt-0.5">
                      <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                      {!notification.read ? (
                        <span className={cn('absolute -top-1 -right-1 h-2 w-2 rounded-full', urgencyColors[notification.urgency as NotificationUrgency] || urgencyColors.normal)} />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{notification.title}</div>
                      {notification.body ? (
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.body}</div>
                      ) : null}
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {formatTimeAgo(notification.created_at)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        archiveNotification(notification.id)
                      }}
                      className="mt-0.5 p-1 rounded hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                      title="Dismiss"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </button>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-2">
            <button
              type="button"
              onClick={() => {
                router.push('/notifications')
                setOpen(false)
              }}
              className="text-xs text-primary hover:underline w-full text-center"
            >
              View all notifications
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
