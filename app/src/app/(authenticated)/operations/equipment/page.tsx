import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Equipment' }

export default function Page() {
  redirect('/jobs')
}
