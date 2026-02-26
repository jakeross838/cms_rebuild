import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Submit Expense' }

export default function SubmitExpensePage() {
  redirect('/financial/payables/new')
}
