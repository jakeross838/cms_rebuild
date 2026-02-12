import { describe, test, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Acceptance tests for Design System Migration
 * Source: Financial dashboard design system adoption plan
 * Validates that the CMS uses shadcn/ui new-york style with neutral palette and dark mode
 */

const appRoot = join(__dirname, '..', '..')
const srcRoot = join(appRoot, 'src')

function readFile(relativePath: string): string {
  return readFileSync(join(appRoot, relativePath), 'utf-8')
}

function fileExists(relativePath: string): boolean {
  return existsSync(join(appRoot, relativePath))
}

describe('Design System Plan Adherence', () => {
  describe('components.json configuration', () => {
    test('components.json exists with correct shadcn config', () => {
      const config = JSON.parse(readFile('components.json'))
      expect(config.style).toBe('new-york')
      expect(config.rsc).toBe(true)
      expect(config.tsx).toBe(true)
      expect(config.tailwind.baseColor).toBe('neutral')
      expect(config.tailwind.cssVariables).toBe(true)
      expect(config.tailwind.config).toBe('')
      expect(config.aliases.ui).toBe('@/components/ui')
      expect(config.aliases.utils).toBe('@/lib/utils')
      expect(config.iconLibrary).toBe('lucide')
    })
  })

  describe('CSS variables and theming', () => {
    test('globals.css imports tw-animate-css', () => {
      const css = readFile('src/app/globals.css')
      expect(css).toContain('@import "tw-animate-css"')
    })

    test('globals.css has dark mode custom variant', () => {
      const css = readFile('src/app/globals.css')
      expect(css).toContain('@custom-variant dark')
    })

    test('globals.css uses neutral primary (not blue)', () => {
      const css = readFile('src/app/globals.css')
      // Old blue primary was 221.2 83.2% 53.3%
      expect(css).not.toContain('221.2 83.2% 53.3%')
      // New neutral primary should be 0 0% 9%
      expect(css).toContain('--primary: 0 0% 9%')
    })

    test('globals.css has .dark class variables', () => {
      const css = readFile('src/app/globals.css')
      expect(css).toContain('.dark {')
      expect(css).toContain('--background: 0 0% 3.9%')
    })

    test('globals.css has chart color tokens', () => {
      const css = readFile('src/app/globals.css')
      expect(css).toContain('--chart-1')
      expect(css).toContain('--chart-2')
      expect(css).toContain('--chart-3')
      expect(css).toContain('--chart-4')
      expect(css).toContain('--chart-5')
    })

    test('globals.css has sidebar tokens', () => {
      const css = readFile('src/app/globals.css')
      expect(css).toContain('--sidebar-background')
      expect(css).toContain('--sidebar-foreground')
      expect(css).toContain('--sidebar-primary')
      expect(css).toContain('--sidebar-accent')
      expect(css).toContain('--sidebar-border')
    })

    test('@theme inline block registers all tokens', () => {
      const css = readFile('src/app/globals.css')
      expect(css).toContain('--color-sidebar-background')
      expect(css).toContain('--color-chart-1')
      expect(css).toContain('--color-primary')
      expect(css).toContain('--color-destructive')
    })
  })

  describe('core UI components exist', () => {
    const components = [
      'src/components/ui/button.tsx',
      'src/components/ui/card.tsx',
      'src/components/ui/badge.tsx',
      'src/components/ui/input.tsx',
      'src/components/ui/dropdown-menu.tsx',
      'src/components/ui/tooltip.tsx',
      'src/components/ui/separator.tsx',
      'src/components/ui/label.tsx',
      'src/components/ui/tabs.tsx',
      'src/components/ui/select.tsx',
      'src/components/ui/dialog.tsx',
      'src/components/ui/sheet.tsx',
    ]

    test.each(components)('%s exists', (component) => {
      expect(fileExists(component)).toBe(true)
    })

    test('Button uses class-variance-authority', () => {
      const button = readFile('src/components/ui/button.tsx')
      expect(button).toContain('class-variance-authority')
      expect(button).toContain('buttonVariants')
    })

    test('Badge uses class-variance-authority', () => {
      const badge = readFile('src/components/ui/badge.tsx')
      expect(badge).toContain('class-variance-authority')
      expect(badge).toContain('badgeVariants')
    })
  })

  describe('dark mode infrastructure', () => {
    test('ThemeProvider component exists', () => {
      expect(fileExists('src/components/theme-provider.tsx')).toBe(true)
      const content = readFile('src/components/theme-provider.tsx')
      expect(content).toContain('next-themes')
      expect(content).toContain('ThemeProvider')
    })

    test('ThemeToggle component exists', () => {
      expect(fileExists('src/components/theme-toggle.tsx')).toBe(true)
      const content = readFile('src/components/theme-toggle.tsx')
      expect(content).toContain('useTheme')
    })

    test('root layout wraps with ThemeProvider', () => {
      const layout = readFile('src/app/layout.tsx')
      expect(layout).toContain('ThemeProvider')
      expect(layout).toContain('suppressHydrationWarning')
      expect(layout).toContain('attribute="class"')
      expect(layout).toContain('enableSystem')
    })
  })

  describe('hardcoded colors removed from theme-dependent UI', () => {
    test('layout files use semantic tokens', () => {
      const files = [
        'src/app/(authenticated)/layout.tsx',
        'src/app/(skeleton)/layout.tsx',
        'src/app/(skeleton)/skeleton/layout.tsx',
      ]
      for (const file of files) {
        const content = readFile(file)
        expect(content).not.toContain('bg-gray-50')
        expect(content).toContain('bg-muted')
      }
    })

    test('login page uses semantic tokens', () => {
      const content = readFile('src/app/login/page.tsx')
      expect(content).not.toContain('bg-blue-600')
      expect(content).toContain('bg-primary')
    })

    test('navigation uses semantic tokens for active states', () => {
      const unified = readFile('src/components/skeleton/unified-nav.tsx')
      expect(unified).not.toContain("'bg-blue-100 text-blue-700'")
      expect(unified).toContain('bg-accent')
      expect(unified).toContain('text-accent-foreground')
    })

    test('sidebar uses sidebar tokens', () => {
      const sidebar = readFile('src/components/layout/sidebar.tsx')
      expect(sidebar).toContain('bg-sidebar-background')
      expect(sidebar).toContain('border-sidebar-border')
      expect(sidebar).toContain('bg-sidebar-accent')
    })

    test('buttons do not have explicit blue overrides', () => {
      const jobs = readFile('src/app/(authenticated)/jobs/page.tsx')
      expect(jobs).not.toContain('bg-blue-600')
      expect(jobs).not.toContain('hover:bg-blue-700')
    })
  })
})
