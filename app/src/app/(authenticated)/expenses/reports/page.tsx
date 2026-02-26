import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Expense Reports' }

export default function ExpenseReportsPage() {
  redirect('/financial/reports')
}
