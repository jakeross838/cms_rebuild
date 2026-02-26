import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Draws' }

// /draws is a duplicate of /draw-requests — redirect to canonical URL
export default function DrawsPage() {
  redirect('/draw-requests')
}
