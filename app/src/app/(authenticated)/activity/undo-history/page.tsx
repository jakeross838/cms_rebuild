import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Undo History' }

export default function UndoHistoryPage() {
  redirect('/activity')
}
