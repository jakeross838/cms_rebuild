import { NextResponse } from 'next/server'

import { readFile } from 'fs/promises'
import path from 'path'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'

const GAP_FILE = path.resolve(process.cwd(), '..', 'docs', 'checklists', 'gap-tracker.json')

export const GET = createApiHandler(
  async (_req, ctx: ApiContext) => {
    try {
      const raw = await readFile(GAP_FILE, 'utf-8')
      const gaps = JSON.parse(raw) as Array<{
        id: string
        category: string
        description: string
        status: string
        priority: string
        module: string
        phase: number
        depends_on: string[]
        blocks: string[]
      }>

      const summary = {
        total: gaps.length,
        specified: gaps.filter(g => g.status === 'specified').length,
        prototyped: gaps.filter(g => g.status === 'prototyped').length,
        planned: gaps.filter(g => g.status === 'planned').length,
      }

      return NextResponse.json({ gaps, summary, requestId: ctx.requestId })
    } catch {
      return NextResponse.json({ error: 'Gap tracker not found', requestId: ctx.requestId }, { status: 404 })
    }
  },
  { requireAuth: true, requiredRoles: ['owner', 'admin'] }
)
