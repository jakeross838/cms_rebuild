import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Email Marketing' }

export default function CompanyEmailMarketingPage() {
  redirect('/marketing')
}
