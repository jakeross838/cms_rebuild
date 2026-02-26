import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Communication History' }

export default function Page() {
  redirect('/communications')
}
