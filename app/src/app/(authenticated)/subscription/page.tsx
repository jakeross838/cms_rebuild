import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Subscription' }

export default function SubscriptionPage() {
  redirect('/billing')
}
