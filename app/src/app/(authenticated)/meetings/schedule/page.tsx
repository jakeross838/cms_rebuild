import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Meeting Schedule' }

export default function MeetingSchedulePage() {
  redirect('/jobs')
}
