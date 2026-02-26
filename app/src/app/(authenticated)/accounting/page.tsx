import type { Metadata } from 'next'
import Link from 'next/link'

import {
  BookOpen,
  FileInput,
  FileOutput,
  Landmark,
  ArrowRight,
} from 'lucide-react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const accountingSections = [
  {
    title: 'General Ledger',
    description: 'Chart of accounts and journal entries',
    href: '/financial/chart-of-accounts',
    icon: BookOpen,
  },
  {
    title: 'Accounts Payable',
    description: 'Bills, vendor payments, and aging reports',
    href: '/financial/payables',
    icon: FileOutput,
  },
  {
    title: 'Accounts Receivable',
    description: 'Invoices, client payments, and collections',
    href: '/financial/receivables',
    icon: FileInput,
  },
  {
    title: 'Bank Reconciliation',
    description: 'Match transactions and reconcile accounts',
    href: '/financial/bank-reconciliation',
    icon: Landmark,
  },
]

export const metadata: Metadata = { title: 'Accounting' }

export default async function AccountingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Accounting</h1>
        <p className="text-muted-foreground">General Ledger, AP/AR, and Bank Reconciliation</p>
      </div>

      {/* Accounting section cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accountingSections.map((section) => {
          const Icon = section.icon
          return (
            <Link key={section.title} href={section.href}>
              <Card className="h-full hover:border-border transition-colors cursor-pointer">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-primary font-medium">
                    Open
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
