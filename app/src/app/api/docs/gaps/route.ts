import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const GAP_FILE = path.resolve(process.cwd(), '..', 'docs', 'checklists', 'gap-tracker.json')

export async function GET() {
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

    return NextResponse.json({ gaps, summary })
  } catch {
    return NextResponse.json({ error: 'Gap tracker not found' }, { status: 404 })
  }
}
