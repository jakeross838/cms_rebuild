import type { Metadata } from 'next'
import Link from 'next/link'

import { BookOpen, GraduationCap, HeadphonesIcon, Lightbulb } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { getServerAuth } from '@/lib/supabase/get-auth'

export const metadata: Metadata = { title: 'Documentation' }

export default async function DocsPage() {
  const { companyId, supabase } = await getServerAuth()

  // ── Query support and training counts ─────────────────────────────
  const { count: ticketCount } = await supabase
    .from('support_tickets')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null)

  const { count: courseCount } = await supabase
    .from('training_courses')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null)

  const stats = [
    { label: 'Support Tickets', value: ticketCount ?? 0, icon: HeadphonesIcon },
    { label: 'Training Courses', value: courseCount ?? 0, icon: GraduationCap },
  ]

  const links = [
    {
      title: 'Support Center',
      description: 'Submit and track support tickets, browse FAQs, and get help from our team',
      href: '/support',
      icon: HeadphonesIcon,
      color: 'blue',
    },
    {
      title: 'Training Courses',
      description: 'Self-paced courses, certification programs, and video tutorials to master RossOS',
      href: '/training',
      icon: GraduationCap,
      color: 'green',
    },
    {
      title: 'Best Practices',
      description: 'Community-contributed guides, tips, and workflows from experienced builders',
      href: '/community/best-practices',
      icon: Lightbulb,
      color: 'amber',
    },
  ]

  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700' },
    green: { bg: 'bg-green-50', text: 'text-green-700' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700' },
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documentation & Help</h1>
        <p className="text-muted-foreground">Platform documentation, training, and support resources</p>
      </div>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <stat.icon className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Navigation Cards ─────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {links.map((link) => {
          const colors = colorMap[link.color]
          return (
            <Link key={link.href} href={link.href}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardContent className="p-6">
                  <div className="flex flex-col items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg}`}>
                      <link.icon className={`h-5 w-5 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{link.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
                    </div>
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
