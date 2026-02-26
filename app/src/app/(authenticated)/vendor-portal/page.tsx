import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Vendor Portal' }

export default function VendorPortalPage() {
  redirect('/vendors')
}
