import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Contact Directory' }

export default function DirectoryContactsPage() {
  redirect('/contacts')
}
