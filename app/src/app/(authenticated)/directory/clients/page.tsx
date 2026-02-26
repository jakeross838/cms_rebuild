import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Client Directory' }

export default function DirectoryClientsPage() {
  redirect('/clients')
}
