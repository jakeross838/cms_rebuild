import type { Metadata } from 'next'
import Link from 'next/link'

import { Users, Building2, Contact, Briefcase, ArrowRight } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Directory' }

const sections = [
  {
    title: 'Clients',
    description: 'Client profiles, contact info, and project history',
    href: '/clients',
    icon: Users,
  },
  {
    title: 'Vendors',
    description: 'Subcontractors, suppliers, and trade partners',
    href: '/vendors',
    icon: Building2,
  },
  {
    title: 'Contacts',
    description: 'Inspectors, architects, engineers, and other contacts',
    href: '/contacts',
    icon: Contact,
  },
  {
    title: 'Team',
    description: 'Employees, roles, and organizational structure',
    href: '/settings/users',
    icon: Briefcase,
  },
]

export default function DirectoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Directory</h1>
        <p className="text-muted-foreground">
          Manage clients, vendors, contacts, and team members
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((section) => {
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
