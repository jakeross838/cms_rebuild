import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Meeting Templates' }

export default function MeetingTemplatesPage() {
  redirect('/library/templates')
}
