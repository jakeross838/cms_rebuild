'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Building2,
  ToggleLeft,
  Languages,
  Hash,
  Layers,
  Users,
  Shield,
} from 'lucide-react'

import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/settings/general', label: 'General', icon: Building2 },
  { href: '/settings/features', label: 'Features', icon: ToggleLeft },
  { href: '/settings/terminology', label: 'Terminology', icon: Languages },
  { href: '/settings/numbering', label: 'Numbering', icon: Hash },
  { href: '/settings/phases', label: 'Phases', icon: Layers },
  { href: '/settings/users', label: 'Users', icon: Users },
  { href: '/settings/roles', label: 'Roles', icon: Shield },
]

export function SettingsSidebar() {
  const pathname = usePathname()

  return (
    <nav className="w-56 shrink-0 bg-card rounded-lg border p-2 h-fit">
      <div className="px-3 py-2 mb-1">
        <h2 className="text-sm font-semibold text-foreground">Settings</h2>
      </div>
      <ul className="space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
