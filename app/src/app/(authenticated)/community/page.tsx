import Link from 'next/link'

import { Award, MessageCircle, Star, Users } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getServerAuth } from '@/lib/supabase/get-auth'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Community' }

const sections = [
  {
    title: 'Forums',
    description: 'Discuss projects, share tips, and ask questions with other builders in the community.',
    href: '/community/forums',
    icon: MessageCircle,
  },
  {
    title: 'Best Practices',
    description: 'Curated guides for safety, quality control, scheduling, budgets, and client communication.',
    href: '/community/best-practices',
    icon: Award,
  },
  {
    title: 'Vendor Reviews',
    description: 'Browse ratings and reviews for vendors, subcontractors, and suppliers.',
    href: '/community/vendor-reviews',
    icon: Star,
  },
]

export default async function CommunityPage() {
  await getServerAuth()

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6" />
          Community
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect with other builders, share knowledge, and learn from the community.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Link key={section.href} href={section.href} className="group">
              <Card className="h-full transition-colors group-hover:border-foreground/20">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
