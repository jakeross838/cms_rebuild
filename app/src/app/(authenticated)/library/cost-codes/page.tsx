import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Cost Codes Library' }

export default function Page() {
  redirect('/cost-codes')
}
