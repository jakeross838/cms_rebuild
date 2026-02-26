import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Expense Policies' }

export default function ExpensePoliciesPage() {
  redirect('/settings/general')
}
