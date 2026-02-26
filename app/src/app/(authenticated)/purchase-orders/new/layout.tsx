import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Purchase Order' }

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
