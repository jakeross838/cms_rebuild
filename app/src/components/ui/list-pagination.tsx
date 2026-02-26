import Link from 'next/link'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ListPaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  searchParams?: Record<string, string | undefined>
}

export function ListPagination({ currentPage: rawPage, totalPages, basePath, searchParams = {} }: ListPaginationProps) {
  if (totalPages <= 1) return null

  // Clamp currentPage to valid bounds
  const currentPage = Math.max(1, Math.min(rawPage, totalPages))

  const buildHref = (page: number) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== 'page') params.set(key, value)
    }
    if (page > 1) params.set('page', String(page))
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {currentPage > 1 ? (
          <Link href={buildHref(currentPage - 1)}>
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />Previous
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4 mr-1" />Previous
          </Button>
        )}
        {currentPage < totalPages ? (
          <Link href={buildHref(currentPage + 1)}>
            <Button variant="outline" size="sm">
              Next<ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next<ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}
