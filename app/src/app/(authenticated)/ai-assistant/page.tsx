import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Bot, Brain, FileSearch, ShoppingCart, Sparkles } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

export default async function AIAssistantPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const features = [
    {
      title: 'AI Intelligence Hub',
      description: 'Central dashboard for all AI-powered insights, anomaly detection, and automated recommendations across your projects',
      href: '/intelligence/ai-hub',
      icon: Brain,
      color: 'amber',
    },
    {
      title: 'Plan Analysis',
      description: 'Upload construction plans and get AI-extracted scope details, material takeoffs, and cost estimates',
      href: '/intelligence/plan-analysis',
      icon: FileSearch,
      color: 'blue',
    },
    {
      title: 'Procurement Intelligence',
      description: 'AI-powered vendor recommendations, price comparisons, and purchase order optimization',
      href: '/intelligence/procurement',
      icon: ShoppingCart,
      color: 'green',
    },
  ]

  const colorMap: Record<string, { bg: string; text: string }> = {
    amber: { bg: 'bg-amber-50', text: 'text-amber-700' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700' },
    green: { bg: 'bg-green-50', text: 'text-green-700' },
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">Your intelligent construction management companion</p>
      </div>

      {/* ── Overview Card ────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
              <Sparkles className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">AI-Powered Construction Intelligence</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                RossOS uses AI across every module to automate data entry, detect anomalies, predict costs,
                and surface insights. All documents, invoices, and field data pass through our AI processing
                layer for extraction, classification, and normalization before storage.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Explore the AI features below to see how intelligence is built into your workflow.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Feature Navigation Cards ─────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {features.map((feature) => {
          const colors = colorMap[feature.color]
          return (
            <Link key={feature.href} href={feature.href}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardContent className="p-6">
                  <div className="flex flex-col items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg}`}>
                      <feature.icon className={`h-5 w-5 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
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
