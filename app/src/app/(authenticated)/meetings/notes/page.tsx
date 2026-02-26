import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Meeting Notes' }

export default function MeetingNotesPage() {
  redirect('/activity')
}
