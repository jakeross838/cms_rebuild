/**
 * Unified Search API
 *
 * GET /api/v2/search?q=term&types=jobs,clients&limit=5
 * Queries jobs, clients, vendors, invoices in parallel.
 */

import { NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import type { SearchResult, SearchResultGroup, SearchResponse } from '@/types/search'
import { searchQuerySchema } from '@/lib/validation/schemas/search'

interface JobRow { id: string; name: string; job_number: string | null; address: string | null; status: string }
interface ClientRow { id: string; name: string; email: string | null; company_name: string | null }
interface VendorRow { id: string; name: string; email: string | null; trade: string | null; company_name: string | null }
interface InvoiceRow { id: string; invoice_number: string | null; amount: number; status: string }

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = searchQuerySchema.safeParse({
      q: url.searchParams.get('q') ?? undefined,
      types: url.searchParams.get('types') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid search parameters',
          errors: parseResult.error.flatten().fieldErrors,
          requestId: ctx.requestId,
        },
        { status: 400 }
      )
    }

    const { q, types, limit } = parseResult.data
    const companyId = ctx.companyId!
    const supabase = await createClient()
    const term = `%${q}%`

    const entityTypes = types ?? ['jobs', 'clients', 'vendors', 'invoices']

    const queries: Promise<SearchResultGroup>[] = []

    if (entityTypes.includes('jobs')) {
      queries.push(
        (async (): Promise<SearchResultGroup> => {
          const { data, count } = await supabase
            .from('jobs')
            .select('id, name, job_number, address, status', { count: 'exact' })
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .or(`name.ilike.${term},job_number.ilike.${term},address.ilike.${term}`)
            .order('updated_at', { ascending: false })
            .limit(limit) as unknown as { data: JobRow[] | null; count: number | null }

          const results: SearchResult[] = (data ?? []).map((row) => ({
            id: row.id,
            entity_type: 'jobs' as const,
            title: row.name,
            subtitle: row.job_number || row.address || null,
            status: row.status,
            url: `/jobs/${row.id}`,
          }))

          return { entity_type: 'jobs', label: 'Jobs', results, total: count ?? 0 }
        })()
      )
    }

    if (entityTypes.includes('clients')) {
      queries.push(
        (async (): Promise<SearchResultGroup> => {
          const { data, count } = await supabase
            .from('clients')
            .select('id, name, email, company_name', { count: 'exact' })
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .or(`name.ilike.${term},email.ilike.${term},company_name.ilike.${term}`)
            .order('updated_at', { ascending: false })
            .limit(limit) as unknown as { data: ClientRow[] | null; count: number | null }

          const results: SearchResult[] = (data ?? []).map((row) => ({
            id: row.id,
            entity_type: 'clients' as const,
            title: row.name,
            subtitle: row.company_name || row.email || null,
            status: null,
            url: `/clients/${row.id}`,
          }))

          return { entity_type: 'clients', label: 'Clients', results, total: count ?? 0 }
        })()
      )
    }

    if (entityTypes.includes('vendors')) {
      queries.push(
        (async (): Promise<SearchResultGroup> => {
          const { data, count } = await supabase
            .from('vendors')
            .select('id, name, email, trade, company_name', { count: 'exact' })
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .or(`name.ilike.${term},email.ilike.${term},trade.ilike.${term},company_name.ilike.${term}`)
            .order('updated_at', { ascending: false })
            .limit(limit) as unknown as { data: VendorRow[] | null; count: number | null }

          const results: SearchResult[] = (data ?? []).map((row) => ({
            id: row.id,
            entity_type: 'vendors' as const,
            title: row.name,
            subtitle: row.trade || row.company_name || null,
            status: null,
            url: `/vendors/${row.id}`,
          }))

          return { entity_type: 'vendors', label: 'Vendors', results, total: count ?? 0 }
        })()
      )
    }

    if (entityTypes.includes('invoices')) {
      queries.push(
        (async (): Promise<SearchResultGroup> => {
          const { data, count } = await supabase
            .from('invoices')
            .select('id, invoice_number, amount, status', { count: 'exact' })
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .or(`invoice_number.ilike.${term}`)
            .order('updated_at', { ascending: false })
            .limit(limit) as unknown as { data: InvoiceRow[] | null; count: number | null }

          const results: SearchResult[] = (data ?? []).map((row) => ({
            id: row.id,
            entity_type: 'invoices' as const,
            title: row.invoice_number || `Invoice #${row.id.slice(0, 8)}`,
            subtitle: `$${Number(row.amount).toLocaleString()}`,
            status: row.status,
            url: `/invoices/${row.id}`,
          }))

          return { entity_type: 'invoices', label: 'Invoices', results, total: count ?? 0 }
        })()
      )
    }

    const groups = await Promise.all(queries)
    const total = groups.reduce((sum, g) => sum + g.total, 0)

    const response: SearchResponse = { query: q, groups, total }

    return NextResponse.json({ data: response, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
