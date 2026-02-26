import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Legal Compliance' }

export default function Page() {
  redirect('/contracts')
}
