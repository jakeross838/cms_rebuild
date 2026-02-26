import Link from 'next/link'
import { redirect } from 'next/navigation'

import {
  ShieldCheck,
  Settings,
  Users,
  CreditCard,
  ScrollText,
  Plug,
  LifeBuoy,
  UserCheck,
  Flag,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

// ── Admin Navigation Items ──────────────────────────────────────────

const adminLinks = [
  {
    href: '/settings/general',
    icon: Settings,
    title: 'Company Settings',
    description: 'Manage company profile, branding, and general configuration',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    href: '/hr',
    icon: Users,
    title: 'Team Management',
    description: 'Manage employees, roles, certifications, and workforce',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
  {
    href: '/billing',
    icon: CreditCard,
    title: 'Subscription & Billing',
    description: 'Manage your plan, payment methods, and invoices',
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  {
    href: '/activity/audit-log',
    icon: ScrollText,
    title: 'Audit Log',
    description: 'View all system activity, changes, and user actions',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
  },
  {
    href: '/integrations',
    icon: Plug,
    title: 'Integrations',
    description: 'Connect third-party services and manage API access',
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
  },
  {
    href: '/support',
    icon: LifeBuoy,
    title: 'Support Tickets',
    description: 'Get help, submit tickets, and browse the knowledge base',
    color: 'text-red-600',
    bg: 'bg-red-100',
  },
]

// ── Page ─────────────────────────────────────────────────────────────

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  // ── Parallel data fetching ──
  const [
    totalUsersRes,
    activeUsersRes,
    rolesRes,
    featureFlagsRes,
  ] = await Promise.all([
    // Total users in company
    supabase.from('users').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null),
    // Active users
    supabase.from('users').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null)
      .eq('is_active', true),
    // Roles configured
    supabase.from('roles').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null),
    // Feature flags
    supabase.from('feature_flags').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId),
  ])

  const totalUsers = totalUsersRes.count || 0
  const activeUsers = activeUsersRes.count || 0
  const totalRoles = rolesRes.count || 0
  const totalFeatureFlags = featureFlagsRes.count || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-1">System administration and company management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{activeUsers}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Roles Configured</p>
                <p className="text-2xl font-bold">{totalRoles}</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-purple-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Feature Flags</p>
                <p className="text-2xl font-bold">{totalFeatureFlags}</p>
              </div>
              <Flag className="h-8 w-8 text-amber-500/70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Navigation Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Administration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${item.bg}`}>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{item.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
