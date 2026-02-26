import { redirect } from 'next/navigation'

// No expense_reports table exists yet. Redirect to the closest
// equivalent — Accounts Payable under the financial section.
export default function ExpensesPage() {
  redirect('/financial/payables')
}
