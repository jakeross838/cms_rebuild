import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Vendor Directory' }

export default function DirectoryVendorsPage() {
  redirect('/vendors')
}
