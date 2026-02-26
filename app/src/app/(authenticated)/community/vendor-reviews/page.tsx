import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Vendor Reviews' }

export default function VendorReviewsPage() {
  redirect('/vendors')
}
