import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Time Clock' }

export default function Page() {
  redirect('/time-clock')
}
