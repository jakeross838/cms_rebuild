import Link from 'next/link'

import { Plus, Search, FileText } from 'lucide-react'

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

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('contract_templates')
    .select('*')
    .order('name', { ascending: true })

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  const [
    { data: templatesData },
    { count: rfiTemplateCount },
    { count: lienTemplateCount },
  ] = await Promise.all([
    query,
    supabase.from('rfi_templates').select('*', { count: 'exact', head: true }),
    supabase.from('lien_waiver_templates').select('*', { count: 'exact', head: true }),
  ])

  const templates = (templatesData || []) as ContractTemplate[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Templates</h1>
          <p className="text-muted-foreground">
            {templates.length} contract templates &bull; {rfiTemplateCount ?? 0} RFI templates &bull; {lienTemplateCount ?? 0} lien waiver templates
          </p>
        </div>
        <Link href="/library/templates/new"><Button><Plus className="h-4 w-4 mr-2" />New Template</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search templates..." defaultValue={params.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length > 0 ? (
            <div className="divide-y divide-border">
              {templates.map((tmpl) => (
                <Link key={tmpl.id} href={`/library/templates/${tmpl.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent transition-colors -mx-6 px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{tmpl.name}</span>
                        <Badge variant="outline" className="text-xs">{tmpl.contract_type}</Badge>
                        {tmpl.is_system && <Badge variant="outline" className="text-xs">System</Badge>}
                        <Badge className={tmpl.is_active ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}>
                          {tmpl.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {tmpl.description && (
                        <p className="text-sm text-muted-foreground mt-1 truncate max-w-lg">{tmpl.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">{params.search ? 'No templates match your search' : 'No templates created yet'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
