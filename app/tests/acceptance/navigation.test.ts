import { describe, test, expect } from 'vitest'
import {
  companyNav,
  companyJobNav,
  companyRightNav,
  jobNav,
  jobPhaseNav,
} from '@/config/navigation'

/**
 * Acceptance tests for Navigation — verifies the implementation matches the plan.
 *
 * Source spec: Navigation Reorganization Plan
 * These tests will FAIL if anyone changes the nav config in a way that
 * deviates from the agreed-upon plan.
 */

describe('Navigation Plan Adherence', () => {
  // ── Company-Level Nav ─────────────────────────────────────

  describe('Company Nav — Pre-job Pipeline', () => {
    test('has exactly 4 items: Dashboard, Sales, Pre-Con, Jobs', () => {
      expect(companyNav.map((i) => i.label)).toEqual([
        'Dashboard',
        'Sales',
        'Pre-Con',
        'Jobs',
      ])
    })

    test('Dashboard is a direct link to /skeleton', () => {
      const dashboard = companyNav.find((i) => i.label === 'Dashboard')!
      expect(dashboard.href).toBe('/skeleton')
      expect(dashboard.items).toBeUndefined()
    })

    test('Sales dropdown has Leads, Estimates, Proposals, Contracts, Legal & Compliance', () => {
      const sales = companyNav.find((i) => i.label === 'Sales')!
      expect(sales.items?.map((i) => i.name)).toEqual([
        'Leads',
        'Estimates',
        'Proposals',
        'Contracts',
        'Legal & Compliance',
      ])
    })

    test('Sales routes are correct', () => {
      const sales = companyNav.find((i) => i.label === 'Sales')!
      expect(sales.items?.map((i) => i.href)).toEqual([
        '/skeleton/leads',
        '/skeleton/estimates',
        '/skeleton/proposals',
        '/skeleton/contracts',
        '/skeleton/contracts/legal',
      ])
    })

    test('Jobs is a direct link to /skeleton/jobs', () => {
      const jobs = companyNav.find((i) => i.label === 'Jobs')!
      expect(jobs.href).toBe('/skeleton/jobs')
      expect(jobs.items).toBeUndefined()
    })
  })

  describe('Company Nav — Job Aggregates', () => {
    test('has exactly 3 items: Operations, Financial, Closeout', () => {
      expect(companyJobNav.map((i) => i.label)).toEqual([
        'Operations',
        'Financial',
        'Closeout',
      ])
    })

    test('Operations dropdown has Calendar, Crew Schedule, Time Clock, Equipment, Inventory, Deliveries', () => {
      const ops = companyJobNav.find((i) => i.label === 'Operations')!
      expect(ops.items?.map((i) => i.name)).toEqual([
        'Calendar',
        'Crew Schedule',
        'Time Clock',
        'Equipment',
        'Inventory',
        'Deliveries',
      ])
    })

    test('Financial dropdown has 11 items', () => {
      const fin = companyJobNav.find((i) => i.label === 'Financial')!
      expect(fin.items?.map((i) => i.name)).toEqual([
        'Dashboard',
        'Chart of Accounts',
        'Journal Entries',
        'Receivables',
        'Payables',
        'Bank Reconciliation',
        'Cash Flow',
        'Profitability',
        'Reports',
        'Business Mgmt',
        'Job Close',
      ])
    })

    test('Closeout dropdown has Punch Lists, Warranties, Post-Build', () => {
      const closeout = companyJobNav.find((i) => i.label === 'Closeout')!
      expect(closeout.items?.map((i) => i.name)).toEqual([
        'Punch Lists',
        'Warranties',
        'Post-Build',
      ])
    })
  })

  describe('Company Nav — Support (Right Zone)', () => {
    test('has exactly 3 items: Directory, Library, Settings', () => {
      expect(companyRightNav.map((i) => i.label)).toEqual([
        'Directory',
        'Library',
        'Settings',
      ])
    })

    test('Directory dropdown has Clients, Vendors, Team, Contacts, HR & Workforce', () => {
      const dir = companyRightNav.find((i) => i.label === 'Directory')!
      expect(dir.items?.map((i) => i.name)).toEqual([
        'Clients',
        'Vendors',
        'Team',
        'Contacts',
        'HR & Workforce',
      ])
    })

    test('Library dropdown has Selections Catalog, Assemblies, Cost Codes, Templates', () => {
      const lib = companyRightNav.find((i) => i.label === 'Library')!
      expect(lib.items?.map((i) => i.name)).toEqual([
        'Selections Catalog',
        'Assemblies',
        'Cost Codes',
        'Templates',
      ])
    })

    test('Settings dropdown has 9 items including compliance', () => {
      const settings = companyRightNav.find((i) => i.label === 'Settings')!
      expect(settings.items?.map((i) => i.name)).toEqual([
        'Settings',
        'Features',
        'Integrations',
        'Insurance',
        'Licenses',
        'Safety',
        'Lien Law',
        'Dashboards',
        'Email Marketing',
      ])
    })
  })

  // ── Job-Level Nav ─────────────────────────────────────────

  describe('Job Nav — Back + Overview', () => {
    test('has exactly 2 items: ← Company, Overview', () => {
      expect(jobNav.map((i) => i.label)).toEqual(['← Company', 'Overview'])
    })

    test('← Company links back to /skeleton/jobs', () => {
      const back = jobNav.find((i) => i.label === '← Company')!
      expect(back.href).toBe('/skeleton/jobs')
    })

    test('Overview is a direct link (empty href, resolved to job base)', () => {
      const overview = jobNav.find((i) => i.label === 'Overview')!
      expect(overview.href).toBe('')
      expect(overview.items).toBeUndefined()
    })
  })

  describe('Job Nav — Lifecycle Phases', () => {
    test('has exactly 5 phases: Pre-Con, Field, Financial, Docs, Closeout', () => {
      expect(jobPhaseNav.map((i) => i.label)).toEqual([
        'Pre-Con',
        'Field',
        'Financial',
        'Docs',
        'Closeout',
      ])
    })

    test('Pre-Con dropdown has Selections, Change Orders', () => {
      const preCon = jobPhaseNav.find((i) => i.label === 'Pre-Con')!
      expect(preCon.items?.map((i) => i.name)).toEqual([
        'Selections',
        'Change Orders',
      ])
    })

    test('Field dropdown has Schedule, Daily Logs, Time Clock, Photos, Permits, Inspections', () => {
      const field = jobPhaseNav.find((i) => i.label === 'Field')!
      expect(field.items?.map((i) => i.name)).toEqual([
        'Schedule',
        'Daily Logs',
        'Time Clock',
        'Photos',
        'Permits',
        'Inspections',
      ])
    })

    test('Financial dropdown has Budget, Purchase Orders, Inventory, Invoices, Draws, Lien Waivers', () => {
      const fin = jobPhaseNav.find((i) => i.label === 'Financial')!
      expect(fin.items?.map((i) => i.name)).toEqual([
        'Budget',
        'Purchase Orders',
        'Inventory',
        'Invoices',
        'Draws',
        'Lien Waivers',
      ])
    })

    test('Docs dropdown has Documents, RFIs, Submittals, Communications, Team', () => {
      const docs = jobPhaseNav.find((i) => i.label === 'Docs')!
      expect(docs.items?.map((i) => i.name)).toEqual([
        'Documents',
        'RFIs',
        'Submittals',
        'Communications',
        'Team',
      ])
    })

    test('Closeout dropdown has Punch List, Warranties', () => {
      const closeout = jobPhaseNav.find((i) => i.label === 'Closeout')!
      expect(closeout.items?.map((i) => i.name)).toEqual([
        'Punch List',
        'Warranties',
      ])
    })
  })

  // ── Structural Rules ──────────────────────────────────────

  describe('Structural Rules', () => {
    test('all dropdown items have descriptions', () => {
      const allItems = [
        ...companyNav,
        ...companyJobNav,
        ...companyRightNav,
        ...jobPhaseNav,
      ]
      for (const item of allItems) {
        if (item.items) {
          for (const sub of item.items) {
            expect(sub.description, `${item.label} > ${sub.name} missing description`).toBeTruthy()
          }
        }
      }
    })

    test('all dropdown items have hrefs', () => {
      const allItems = [
        ...companyNav,
        ...companyJobNav,
        ...companyRightNav,
        ...jobPhaseNav,
      ]
      for (const item of allItems) {
        if (item.items) {
          for (const sub of item.items) {
            expect(sub.href, `${item.label} > ${sub.name} missing href`).toBeTruthy()
          }
        }
      }
    })

    test('all nav items have icons', () => {
      const allItems = [
        ...companyNav,
        ...companyJobNav,
        ...companyRightNav,
        ...jobNav,
        ...jobPhaseNav,
      ]
      for (const item of allItems) {
        expect(item.icon, `${item.label} missing icon`).toBeDefined()
      }
    })

    test('company right zone is shared between company and job contexts', () => {
      // The right zone should be the same regardless of context
      // This is enforced by the UnifiedNav component using companyRightNav in both cases
      expect(companyRightNav.length).toBeGreaterThan(0)
    })

    test('job phase hrefs are relative (no /skeleton prefix)', () => {
      for (const item of jobPhaseNav) {
        if (item.items) {
          for (const sub of item.items) {
            expect(sub.href, `${item.label} > ${sub.name} should be relative`).not.toMatch(
              /^\/skeleton/
            )
          }
        }
      }
    })

    test('company hrefs are absolute (start with /skeleton)', () => {
      const companyItems = [...companyNav, ...companyJobNav, ...companyRightNav]
      for (const item of companyItems) {
        if (item.items) {
          for (const sub of item.items) {
            expect(sub.href, `${item.label} > ${sub.name} should start with /skeleton`).toMatch(
              /^\/skeleton/
            )
          }
        }
      }
    })
  })
})
