'use client'

import { useCallback, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Building2, Check, ChevronDown, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Company {
  id: string
  name: string
  role: string
  isCurrent: boolean
}

interface TenantSwitcherProps {
  className?: string
}

export function TenantSwitcher({ className }: TenantSwitcherProps) {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSwitching, setIsSwitching] = useState(false)

  // Fetch user's companies on mount
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch('/api/v1/auth/companies')
        if (!response.ok) {
          toast.error('Failed to load companies')
          return
        }
        const data = await response.json()
        setCompanies(data.companies || [])
        const current = data.companies?.find((c: Company) => c.isCurrent)
        setCurrentCompany(current || null)
      } catch {
        toast.error('Failed to load companies')
      } finally {
        setIsLoading(false)
      }
    }
    fetchCompanies()
  }, [])

  const handleSwitchCompany = useCallback(async (companyId: string) => {
    if (isSwitching || currentCompany?.id === companyId) {
      setIsOpen(false)
      return
    }

    setIsSwitching(true)
    try {
      const response = await fetch('/api/v1/auth/switch-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      })

      if (!response.ok) {
        toast.error('Failed to switch company')
        return
      }

      // Update local state
      const newCurrent = companies.find((c) => c.id === companyId)
      if (newCurrent) {
        setCurrentCompany(newCurrent)
        setCompanies(
          companies.map((c) => ({
            ...c,
            isCurrent: c.id === companyId,
          }))
        )
      }

      // Close dropdown and refresh the page to reload data with new company context
      setIsOpen(false)
      router.refresh()
    } catch {
      toast.error('Failed to switch company')
    } finally {
      setIsSwitching(false)
    }
  }, [companies, currentCompany?.id, isSwitching, router])

  // Don't render if user only has one company or none
  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 px-3 py-2', className)}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (companies.length <= 1) {
    // Show current company name without dropdown if only one
    if (currentCompany) {
      return (
        <div className={cn('flex items-center gap-2 px-3 py-2', className)}>
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground truncate max-w-[160px]">
            {currentCompany.name}
          </span>
        </div>
      )
    }
    return null
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors disabled:opacity-50"
      >
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground truncate max-w-[160px]">
          {currentCompany?.name || 'Select Company'}
        </span>
        {isSwitching ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isOpen ? <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
            role="button"
            tabIndex={-1}
            aria-label="Close dropdown"
          />

          {/* Dropdown */}
          <div className="absolute left-0 mt-2 w-64 rounded-md bg-background shadow-lg ring-1 ring-border z-20">
            <div className="py-1">
              <div className="px-4 py-2 border-b border-border">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Switch Company
                </div>
              </div>

              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => handleSwitchCompany(company.id)}
                  disabled={isSwitching}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors text-left',
                    company.isCurrent && 'bg-accent/50'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {company.name}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {company.role}
                    </div>
                  </div>
                  {company.isCurrent ? <Check className="h-4 w-4 text-primary flex-shrink-0" /> : null}
                </button>
              ))}
            </div>
          </div>
        </> : null}
    </div>
  )
}
