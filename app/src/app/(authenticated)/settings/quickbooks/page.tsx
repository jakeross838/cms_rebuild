import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'QuickBooks Integration' }

export default function Page() {
  redirect('/settings')
}
