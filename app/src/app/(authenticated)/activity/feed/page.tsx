import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Activity Feed' }

export default function ActivityFeedPage() {
  redirect('/activity')
}
