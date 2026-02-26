import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Expense Approvals' }

export default function ExpenseApprovalsPage() {
  redirect('/financial/payables')
}
