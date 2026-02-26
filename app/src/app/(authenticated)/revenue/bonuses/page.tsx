import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Bonuses' }

export default function BonusesPage() {
  redirect('/hr')
}
