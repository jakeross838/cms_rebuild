import {
  companyNav,
  companyJobNav,
  companyRightNav,
  companyIntelligenceNav,
  type NavItem,
  type NavSubItem,
} from '@/config/navigation'
import type { QuickAction } from '@/types/search'

const createActions: QuickAction[] = [
  {
    id: 'create-job',
    label: 'Create New Job',
    description: 'Start a new construction job',
    icon: 'Briefcase',
    href: '/jobs/new',
    category: 'create',
    keywords: ['create', 'new', 'job', 'project'],
  },
  {
    id: 'create-client',
    label: 'Add New Client',
    description: 'Add a client to the directory',
    icon: 'Users',
    href: '/clients/new',
    category: 'create',
    keywords: ['create', 'new', 'client', 'customer'],
  },
  {
    id: 'create-vendor',
    label: 'Add New Vendor',
    description: 'Add a vendor or subcontractor',
    icon: 'Building2',
    href: '/vendors/new',
    category: 'create',
    keywords: ['create', 'new', 'vendor', 'sub', 'subcontractor'],
  },
]

function flattenNavItems(sections: NavItem[]): QuickAction[] {
  const actions: QuickAction[] = []

  for (const section of sections) {
    if (section.items) {
      for (const sub of section.items) {
        actions.push({
          id: `nav-${sub.href.replace(/\//g, '-').replace(/^-/, '')}`,
          label: `Go to ${sub.name}`,
          description: sub.description,
          icon: section.label,
          href: sub.href,
          category: 'navigation',
          keywords: [sub.name.toLowerCase(), section.label.toLowerCase(), sub.description.toLowerCase()],
        })
      }
    } else if (section.href) {
      actions.push({
        id: `nav-${section.href.replace(/\//g, '-').replace(/^-/, '')}`,
        label: `Go to ${section.label}`,
        description: `Navigate to ${section.label}`,
        icon: section.label,
        href: section.href,
        category: 'navigation',
        keywords: [section.label.toLowerCase()],
      })
    }
  }

  return actions
}

let _cachedActions: QuickAction[] | null = null

export function getQuickActions(): QuickAction[] {
  if (_cachedActions) return _cachedActions

  const navActions = [
    ...flattenNavItems(companyNav),
    ...flattenNavItems(companyJobNav),
    ...flattenNavItems(companyRightNav),
    ...flattenNavItems(companyIntelligenceNav),
  ]

  _cachedActions = [...createActions, ...navActions]
  return _cachedActions
}

export function filterQuickActions(query: string): QuickAction[] {
  if (!query.trim()) return getQuickActions()
  const lower = query.toLowerCase()
  return getQuickActions().filter((action) =>
    action.keywords.some((kw) => kw.includes(lower)) ||
    action.label.toLowerCase().includes(lower)
  )
}
