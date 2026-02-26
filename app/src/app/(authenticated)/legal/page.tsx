import Link from 'next/link'

import { Plus, Search, FileCheck, Scale } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'

interface ContractTemplate {
  id: string
  name: string
  description: string | null
  contract_type: string
  is_active: boolean
  is_system: boolean
  created_at: string
}

export default async function LegalCompliancePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('contract_templates')
    .select('*')
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  const [
    { data: templatesData },
    { count: trackingCount },
  ] = await Promise.all([
    query,
    supabase.from('lien_waiver_tracking').select('*', { count: 'exact', head: true })
    .is('deleted_at', null),
  ])

  const templates = (templatesData || []) as ContractTemplate[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Legal & Compliance</h1>
          <p className="text-muted-foreground">{templates.length} templates &bull; {trackingCount ?? 0} lien tracking records</p>
        </div>
        <Link href="/legal/new"><Button><Plus className="h-4 w-4 mr-2" />New Template</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search templates..." defaultValue={params.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Contract Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length > 0 ? (
            <div className="divide-y divide-border">
              {templates.map((tmpl) => (
                <Link key={tmpl.id} href={`/legal/${tmpl.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{tmpl.name}</span>
                        <Badge variant="outline" className="text-xs">{tmpl.contract_type}</Badge>
                        {tmpl.is_system && <Badge variant="outline" className="text-xs">System</Badge>}
                        <Badge className={tmpl.is_active ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}>
                          {tmpl.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {tmpl.description && (
                        <p className="text-sm text-muted-foreground mt-1 ml-6 truncate max-w-lg">{tmpl.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Scale className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {params.search ? 'No templates match your search' : 'No contract templates yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
