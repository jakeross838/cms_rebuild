import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'HR Directory' }

export default function DirectoryHrPage() {
  redirect('/settings/users')
}
