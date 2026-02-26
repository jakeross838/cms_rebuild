import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Team Directory' }

export default function DirectoryTeamPage() {
  redirect('/settings/users')
}
