import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Megaphone, Mail, Star, Users, BarChart3 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

export default async function MarketingPage() {
  const supabase = await createClient()

  // ── Auth & Company ID ──────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) redirect('/login')

  const [
    { count: campaignCount },
    { count: leadCount },
    { count: reviewCount },
    { count: referralCount },
  ] = await Promise.all([
    supabase.from('marketing_campaigns').select('*', { count: 'exact', head: true }).eq('company_id', companyId).is('deleted_at', null),
    supabase.from('marketing_leads').select('*', { count: 'exact', head: true }).eq('company_id', companyId).is('deleted_at', null),
    supabase.from('client_reviews').select('*', { count: 'exact', head: true }).eq('company_id', companyId).is('deleted_at', null),
    supabase.from('marketing_referrals').select('*', { count: 'exact', head: true }).eq('company_id', companyId).is('deleted_at', null),
  ])

  const sections = [
    { href: '/email-marketing', icon: Mail, title: 'Email Campaigns', count: campaignCount || 0, description: 'Create and manage email campaigns' },
    { href: '/leads', icon: Users, title: 'Lead Pipeline', count: leadCount || 0, description: 'Track and manage leads' },
    { href: '/post-build', icon: Star, title: 'Reviews & Testimonials', count: reviewCount || 0, description: 'Client reviews and portfolio' },
    { href: '/marketing', icon: BarChart3, title: 'Referrals', count: referralCount || 0, description: 'Track referral sources' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Megaphone className="h-6 w-6" />
          Marketing
        </h1>
        <p className="text-muted-foreground">Campaigns, leads, and reputation management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:border-primary/20 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <section.icon className="h-4 w-4 text-muted-foreground" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{section.count}</p>
                <p className="text-xs text-muted-foreground">{section.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
