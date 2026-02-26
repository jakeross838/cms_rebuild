import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'RFI SLA' }

export default function RfiSlaPage() {
  redirect('/rfis')
}
