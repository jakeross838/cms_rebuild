import { redirect } from 'next/navigation'

import {
  Globe,
  HelpCircle,
  Image,
  Info,
  MessageCircle,
  Newspaper,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Forums' }

const forumCategories = [
  {
    title: 'General Discussion',
    description: 'Talk about anything construction-related, industry trends, and company updates.',
    icon: Globe,
  },
  {
    title: 'Technical Questions',
    description: 'Get help with building codes, materials, techniques, and engineering challenges.',
    icon: HelpCircle,
  },
  {
    title: 'Project Showcase',
    description: 'Share photos, progress updates, and completed projects with the community.',
    icon: Image,
  },
  {
    title: 'Industry News',
    description: 'Discuss market conditions, regulation changes, and new tools and technology.',
    icon: Newspaper,
  },
]

export default async function ForumsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  if (!profile?.company_id) { redirect('/login') }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Forums
        </h1>
        <p className="text-muted-foreground mt-1">
          Discussion forums for the builder community.
        </p>
      </div>

      {/* Coming soon notice */}
      <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          Full forum functionality -- threads, replies, and real-time discussions -- is coming in the next release.
          Browse the categories below to see what is planned.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {forumCategories.map((category) => {
          const Icon = category.icon
          return (
            <Card key={category.title} className="h-full">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
