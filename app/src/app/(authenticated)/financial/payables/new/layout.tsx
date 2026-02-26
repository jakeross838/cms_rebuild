import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Bill' }

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
