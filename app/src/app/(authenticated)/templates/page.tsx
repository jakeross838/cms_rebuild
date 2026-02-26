import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Templates' }

export default function Page() {
  redirect('/library/templates')
}
