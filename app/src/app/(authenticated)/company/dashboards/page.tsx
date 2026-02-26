import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Company Dashboards' }

export default function CompanyDashboardsPage() {
  redirect('/dashboards')
}
