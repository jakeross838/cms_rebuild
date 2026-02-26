import { redirect } from 'next/navigation'

import {
  Award,
  CheckCircle,
  Clock,
  DollarSign,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

const categories = [
  {
    title: 'Safety',
    description: 'OSHA compliance, toolbox talks, incident prevention, and jobsite safety protocols.',
    icon: ShieldCheck,
  },
  {
    title: 'Quality Control',
    description: 'Inspection checklists, punch list management, and defect prevention strategies.',
    icon: CheckCircle,
  },
  {
    title: 'Scheduling',
    description: 'Critical path optimization, weather planning, crew coordination, and milestone tracking.',
    icon: Clock,
  },
  {
    title: 'Budget Management',
    description: 'Cost code best practices, variance analysis, change order workflows, and cash flow planning.',
    icon: DollarSign,
  },
  {
    title: 'Client Communication',
    description: 'Selection management, progress updates, expectation setting, and conflict resolution.',
    icon: MessageSquare,
  },
]

export default async function BestPracticesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  if (!profile?.company_id) { redirect('/login') }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Award className="h-6 w-6" />
          Best Practices
        </h1>
        <p className="text-muted-foreground mt-1">
          Curated guides and proven strategies for construction management.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
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
