import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'White Label' }

export default function WhiteLabelPage() {
  redirect('/settings/general')
}
