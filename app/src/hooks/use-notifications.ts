'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface NotificationItem {
  id: string
  company_id: string
  user_id: string
  event_type: string
  category: string
  title: string
  body: string | null
  entity_type: string | null
  entity_id: string | null
  url_path: string | null
  urgency: string
  read: boolean
  read_at: string | null
  archived: boolean
  snoozed_until: string | null
  triggered_by: string | null
  job_id: string | null
  created_at: string
}

interface PaginatedResponse {
  data: NotificationItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

async function fetchNotifications(page = 1): Promise<PaginatedResponse> {
  const res = await fetch(`/api/v2/notifications?page=${page}&limit=20`)
  if (!res.ok) throw new Error('Failed to fetch notifications')
  return res.json()
}

async function fetchUnreadCount(): Promise<number> {
  const res = await fetch('/api/v2/notifications/unread-count')
  if (!res.ok) throw new Error('Failed to fetch unread count')
  const json = await res.json()
  return json.data.count
}

async function markAsRead(id: string): Promise<void> {
  await fetch(`/api/v2/notifications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ read: true }),
  })
}

async function markAllAsRead(): Promise<void> {
  await fetch('/api/v2/notifications/read-all', { method: 'PUT' })
}

async function archiveNotification(id: string): Promise<void> {
  await fetch(`/api/v2/notifications/${id}`, { method: 'DELETE' })
}

export function useNotifications() {
  const queryClient = useQueryClient()

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadCount,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: archiveNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  return {
    notifications: notificationsData?.data ?? [],
    unreadCount,
    isLoading,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate,
    archiveNotification: archiveMutation.mutate,
  }
}
