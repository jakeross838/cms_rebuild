'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import {
  Search,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Menu,
} from 'lucide-react'

import { CommandPalette } from '@/components/command-palette/command-palette'
import { TenantSwitcher } from '@/components/layout/TenantSwitcher'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { ThemeToggle } from '@/components/theme-toggle'
import { createClient } from '@/lib/supabase/client'


interface TopNavProps {
  user: {
    name: string
    email?: string
    role: string
  } | null
}

export function TopNav({ user }: TopNavProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-16 bg-card/95 backdrop-blur supports-backdrop-blur:bg-card/60 border-b border-border/40 flex items-center justify-between px-6 z-10 shadow-sm">
      {/* Left side: Hamburger (mobile) + Tenant switcher + Search */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('open-mobile-sidebar'))}
          className="md:hidden p-2 -ml-2 rounded-md hover:bg-accent text-muted-foreground"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Tenant Switcher */}
        <TenantSwitcher />

        {/* Search trigger */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
          className="max-w-md flex-1"
        >
          <div className="relative flex items-center pl-10 pr-3 h-10 w-full rounded-full bg-muted/60 border-transparent hover:bg-muted text-sm text-muted-foreground transition-all cursor-pointer">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
            <span>Search jobs, invoices, vendors...</span>
            <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground border">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </button>
        <CommandPalette />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationBell />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-medium text-foreground">{user?.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {showUserMenu ? <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
                onKeyDown={(e) => e.key === 'Escape' && setShowUserMenu(false)}
                role="button"
                tabIndex={-1}
                aria-label="Close menu"
              />
              <div className="absolute right-0 mt-2 w-56 rounded-md bg-background shadow-lg ring-1 ring-border z-20">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-border">
                    <div className="text-sm font-medium text-foreground">{user?.name}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </div>
                  <a
                    href="/settings/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </a>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </> : null}
        </div>
      </div>
    </header>
  )
}
