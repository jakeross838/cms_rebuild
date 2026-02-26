import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Action Items' }

export default function ActionItemsPage() {
  redirect('/punch-lists')
}
