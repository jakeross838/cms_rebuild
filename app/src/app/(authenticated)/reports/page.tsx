import Link from 'next/link'

import {
  BarChart3,
  DollarSign,
  TrendingUp,
  PieChart,
  ArrowRight,
} from 'lucide-react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const reportTypes = [
  {
    title: 'Cash Flow',
    description: 'Track money in and out across all jobs',
    href: '/financial/cash-flow',
    icon: DollarSign,
  },
  {
    title: 'Profitability',
    description: 'Job-level and company-wide profit analysis',
    href: '/financial/profitability',
    icon: TrendingUp,
  },
  {
    title: 'Budget vs Actual',
    description: 'Compare budgeted costs to actual spending',
    href: '/financial/reports',
    icon: BarChart3,
  },
  {
    title: 'WIP Report',
    description: 'Work in progress and earned revenue tracking',
    href: '/financial/reports',
    icon: PieChart,
  },
]

export default async function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Financial and project reports</p>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon
          return (
            <Link key={report.title} href={report.href}>
              <Card className="h-full hover:border-border transition-colors cursor-pointer">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-primary font-medium">
                    View report
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
