import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Feature Management' }

export default function CompanyFeaturesPage() {
  redirect('/settings/features')
}
