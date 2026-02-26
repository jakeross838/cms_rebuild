import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Company Settings' }

export default function CompanySettingsPage() {
  redirect('/settings')
}
