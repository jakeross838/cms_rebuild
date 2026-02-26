import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Revenue Formulas' }

export default function RevenueFormulasPage() {
  redirect('/cost-codes')
}
