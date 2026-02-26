import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Expenses' }

// No expense_reports table exists yet. Redirect to the closest
// equivalent — Accounts Payable under the financial section.
export default function ExpensesPage() {
  redirect('/financial/payables')
}
