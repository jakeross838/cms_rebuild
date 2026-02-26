import { NextResponse } from 'next/server'

import { readdir, readFile } from 'fs/promises'
import path from 'path'

const DOCS_ROOT = path.resolve(process.cwd(), '..', 'docs')

interface DocFile {
  slug: string
  title: string
  category: string
  phase?: string
  status?: string
  path: string
}

interface Frontmatter {
  title: string
  phase?: string
  status?: string
}

function extractFrontmatter(content: string): Frontmatter {
  const titleMatch = content.match(/^#\s+(.+)/m)
  const phaseMatch = content.match(/\*\*Phase:\*\*\s*(.+)/m)
  const statusMatch = content.match(/\*\*Status:\*\*\s*(.+)/m)
  return {
    title: titleMatch?.[1] ?? 'Untitled',
    phase: phaseMatch?.[1]?.trim(),
    status: statusMatch?.[1]?.trim(),
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (slug) {
    // Prevent path traversal — resolve and verify the path stays inside DOCS_ROOT
    const filePath = path.resolve(DOCS_ROOT, ...slug.split('/'))
    if (!filePath.startsWith(DOCS_ROOT + path.sep) && filePath !== DOCS_ROOT) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }
    try {
      const content = await readFile(filePath, 'utf-8')
      return NextResponse.json({ content, slug })
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
  }

  // Return file listing
  const docs: DocFile[] = []

  const categories = ['modules', 'architecture']
  for (const category of categories) {
    const dir = path.join(DOCS_ROOT, category)
    try {
      const files = await readdir(dir)
      for (const file of files) {
        if (!file.endsWith('.md')) continue
        const filePath = path.join(dir, file)
        const content = await readFile(filePath, 'utf-8')
        const { title, phase, status } = extractFrontmatter(content)
        docs.push({
          slug: `${category}/${file}`,
          title,
          category,
          phase,
          status,
          path: `${category}/${file}`,
        })
      }
    } catch {
      // directory doesn't exist, skip
    }
  }

  // Sort modules by number, architecture alphabetically
  docs.sort((a, b) => {
    if (a.category !== b.category) return a.category === 'architecture' ? -1 : 1
    return a.slug.localeCompare(b.slug, undefined, { numeric: true })
  })

  return NextResponse.json({ docs })
}
