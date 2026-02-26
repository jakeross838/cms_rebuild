import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Selections Catalog' }

export default function SelectionsCatalogPage() {
  redirect('/library/selections')
}
