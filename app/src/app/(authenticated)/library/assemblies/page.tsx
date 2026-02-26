import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, Search, Package } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'

interface Assembly {
  id: string
  name: string
  description: string | null
  category: string | null
  is_active: boolean
  parameter_unit: string | null
  created_at: string
}

export default async function AssembliesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  let query = supabase
    .from('assemblies')
    .select('*')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  const { data: assembliesData } = await query
  const assemblies = (assembliesData || []) as Assembly[]

  const active = assemblies.filter((a) => a.is_active).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assemblies</h1>
          <p className="text-muted-foreground">{assemblies.length} assemblies &bull; {active} active</p>
        </div>
        <Link href="/library/assemblies/new"><Button><Plus className="h-4 w-4 mr-2" />New Assembly</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search assemblies..." aria-label="Search assemblies" defaultValue={params.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Estimate Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assemblies.length > 0 ? (
            <div className="divide-y divide-border">
              {assemblies.map((asm) => (
                <Link key={asm.id} href={`/library/assemblies/${asm.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent transition-colors -mx-6 px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{asm.name}</span>
                        {asm.category && <Badge variant="outline" className="text-xs">{asm.category}</Badge>}
                        {asm.parameter_unit && <Badge variant="outline" className="text-xs">per {asm.parameter_unit}</Badge>}
                        <Badge className={asm.is_active ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}>
                          {asm.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {asm.description && (
                        <p className="text-sm text-muted-foreground mt-1 truncate max-w-lg">{asm.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">{params.search ? 'No assemblies match your search' : 'No assemblies created yet'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
