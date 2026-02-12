# RossOS Master Execution Plan

> **Purpose**: Step-by-step execution guide for autonomous development of all MVP phases.
>
> **Usage**: Execute tasks in order. Check off each task when complete. Follow dependencies strictly.
>
> **Critical**: Read this ENTIRE document before starting. Each task has exact file paths and acceptance criteria.

---

## Execution Rules

1. **Follow order strictly** - Tasks have dependencies; do not skip ahead
2. **Complete validation before proceeding** - Run `npm run validate` after each section
3. **Commit after each section** - Use format: `feat(phase-X): [section] - description`
4. **Update CONTEXT.md** - After each phase section completion
5. **Test in browser** - After UI tasks, verify functionality works

---

## Pre-Execution Checklist

Before starting, verify:

- [ ] `npm install` completed successfully
- [ ] `.env.local` has valid Supabase credentials
- [ ] `npm run dev` starts without errors
- [ ] Supabase project is accessible
- [ ] Git is initialized and clean

---

## Phase 1: Foundation & Core Data

### Section 1.1: Database Migrations

**Objective**: Create all Phase 1 database tables with RLS policies.

#### Task 1.1.1: Create companies table migration
```
File: supabase/migrations/20240213000001_create_companies.sql
Reference: docs/DATABASE_SCHEMA.md > companies
```
- [ ] Create companies table with all columns
- [ ] Create indexes
- [ ] NO RLS on companies (handled by user's company_id)
- [ ] Apply migration: `npx supabase db push`
- [ ] Verify in Supabase dashboard

#### Task 1.1.2: Create users and user_roles tables
```
File: supabase/migrations/20240213000002_create_users.sql
Reference: docs/DATABASE_SCHEMA.md > users, user_roles
```
- [ ] Create users table with all columns
- [ ] Create user_roles table
- [ ] Enable RLS on both tables
- [ ] Create RLS policies
- [ ] Create indexes
- [ ] Apply migration

#### Task 1.1.3: Create clients table
```
File: supabase/migrations/20240213000003_create_clients.sql
Reference: docs/DATABASE_SCHEMA.md > clients
```
- [ ] Create clients table
- [ ] Enable RLS
- [ ] Create policy
- [ ] Create indexes
- [ ] Apply migration

#### Task 1.1.4: Create contacts and addresses tables
```
File: supabase/migrations/20240213000004_create_contacts_addresses.sql
Reference: docs/DATABASE_SCHEMA.md > contacts, addresses
```
- [ ] Create contacts table (polymorphic)
- [ ] Create addresses table (polymorphic)
- [ ] Enable RLS on both
- [ ] Create policies
- [ ] Create indexes
- [ ] Apply migration

#### Task 1.1.5: Create jobs and job_phases tables
```
File: supabase/migrations/20240213000005_create_jobs.sql
Reference: docs/DATABASE_SCHEMA.md > jobs, job_phases, job_team_members
```
- [ ] Create jobs table
- [ ] Create job_phases table
- [ ] Create job_team_members table
- [ ] Enable RLS on all
- [ ] Create policies
- [ ] Create indexes
- [ ] Apply migration

#### Task 1.1.6: Create notes, tags, entity_tags tables
```
File: supabase/migrations/20240213000006_create_notes_tags.sql
Reference: docs/DATABASE_SCHEMA.md > notes, tags, entity_tags
```
- [ ] Create notes table
- [ ] Create tags table
- [ ] Create entity_tags junction table
- [ ] Enable RLS on all
- [ ] Create policies
- [ ] Create indexes
- [ ] Apply migration

#### Task 1.1.7: Create activity_log table
```
File: supabase/migrations/20240213000007_create_activity_log.sql
Reference: docs/DATABASE_SCHEMA.md > activity_log
```
- [ ] Create activity_log table
- [ ] Enable RLS
- [ ] Create policy
- [ ] Create indexes
- [ ] Apply migration

#### Task 1.1.8: Create helper functions
```
File: supabase/migrations/20240213000008_create_helper_functions.sql
Reference: docs/DATABASE_SCHEMA.md > Helper Functions
```
- [ ] Create get_current_company_id() function
- [ ] Create set_current_company_id() function
- [ ] Create update_updated_at() trigger function
- [ ] Apply triggers to all tables with updated_at
- [ ] Apply migration

#### Task 1.1.9: Generate TypeScript types
```
Command: npm run db:generate
Output: src/types/database.ts
```
- [ ] Run type generation
- [ ] Verify types are correct
- [ ] Commit: `feat(phase-1): database migrations complete`

**Section 1.1 Validation:**
- [ ] All tables exist in Supabase
- [ ] RLS policies are active
- [ ] TypeScript types generated
- [ ] `npm run validate` passes

---

### Section 1.2: Core Library Setup

**Objective**: Create Supabase client, auth utilities, and base API handlers.

#### Task 1.2.1: Create Supabase client utilities
```
File: src/lib/supabase/client.ts
```
```typescript
// Browser client
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```
File: src/lib/supabase/server.ts
```
```typescript
// Server client
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

```
File: src/lib/supabase/middleware.ts
```
```typescript
// Middleware client for auth
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Implementation for session refresh
}
```

- [ ] Create browser client
- [ ] Create server client
- [ ] Create middleware client
- [ ] Export from src/lib/supabase/index.ts

#### Task 1.2.2: Create auth utilities
```
File: src/lib/auth/index.ts
```
- [ ] Create getCurrentUser() - get current authenticated user
- [ ] Create getCurrentCompany() - get user's company
- [ ] Create requireAuth() - middleware helper
- [ ] Create requireRole() - role check helper

#### Task 1.2.3: Create API handler wrapper
```
File: src/lib/api/handler.ts
```
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface HandlerOptions {
  requireAuth?: boolean
  requiredRole?: string[]
  rateLimit?: { requests: number; window: number }
}

export function createApiHandler(
  handler: (req: NextRequest, context: ApiContext) => Promise<NextResponse>,
  options: HandlerOptions = {}
) {
  return async (req: NextRequest) => {
    // 1. Auth check
    // 2. Role check
    // 3. Rate limiting
    // 4. Set company context
    // 5. Call handler
    // 6. Error handling
  }
}
```
- [ ] Create handler wrapper with auth
- [ ] Add rate limiting
- [ ] Add error handling
- [ ] Add request logging

#### Task 1.2.4: Create validation utilities
```
File: src/lib/validation/index.ts
```
- [ ] Create Zod schemas for common types
- [ ] Create validation helper functions
- [ ] Create error formatter

#### Task 1.2.5: Create response utilities
```
File: src/lib/api/response.ts
```
- [ ] Create success response helper
- [ ] Create error response helper
- [ ] Create pagination response helper

- [ ] Commit: `feat(phase-1): core library setup`

**Section 1.2 Validation:**
- [ ] Supabase clients work
- [ ] Auth utilities compile
- [ ] `npm run validate` passes

---

### Section 1.3: Authentication System

**Objective**: Implement login, logout, session management.

#### Task 1.3.1: Create auth middleware
```
File: src/middleware.ts
```
- [ ] Check for session on protected routes
- [ ] Refresh session if needed
- [ ] Redirect to login if no session
- [ ] Skip auth for public routes

#### Task 1.3.2: Create login page
```
File: src/app/(auth)/login/page.tsx
```
- [ ] Create login form component
- [ ] Email/password inputs
- [ ] "Remember me" checkbox
- [ ] Error handling
- [ ] Redirect on success

#### Task 1.3.3: Create signup page
```
File: src/app/(auth)/signup/page.tsx
```
- [ ] Create signup form
- [ ] Email, password, company name
- [ ] Create company on signup
- [ ] Create user linked to company
- [ ] Send verification email

#### Task 1.3.4: Create auth API routes
```
File: src/app/api/auth/login/route.ts
File: src/app/api/auth/logout/route.ts
File: src/app/api/auth/me/route.ts
File: src/app/api/auth/signup/route.ts
```
- [ ] POST /api/auth/login - authenticate user
- [ ] POST /api/auth/logout - clear session
- [ ] GET /api/auth/me - get current user
- [ ] POST /api/auth/signup - register new user/company

#### Task 1.3.5: Create auth context provider
```
File: src/providers/auth-provider.tsx
```
- [ ] Create AuthContext
- [ ] Provide user, company, loading state
- [ ] Auto-refresh session
- [ ] Handle logout

#### Task 1.3.6: Create useAuth hook
```
File: src/hooks/use-auth.ts
```
- [ ] Return user, company, loading
- [ ] Return login, logout functions
- [ ] Return isAuthenticated

- [ ] Commit: `feat(phase-1): authentication system`

**Section 1.3 Validation:**
- [ ] Can signup new account
- [ ] Can login
- [ ] Can logout
- [ ] Protected routes redirect to login
- [ ] Session persists on refresh

---

### Section 1.4: Companies API & UI

**Objective**: Company settings and management.

#### Task 1.4.1: Create company API routes
```
File: src/app/api/companies/[id]/route.ts
```
- [ ] GET /api/companies/:id - get company details
- [ ] PATCH /api/companies/:id - update company

#### Task 1.4.2: Create company settings page
```
File: src/app/(dashboard)/settings/company/page.tsx
```
- [ ] Company info form
- [ ] Logo upload
- [ ] Business details
- [ ] Address
- [ ] Save functionality

#### Task 1.4.3: Create useCompany hook
```
File: src/hooks/use-company.ts
```
- [ ] Fetch company data
- [ ] Update company mutation
- [ ] React Query integration

- [ ] Commit: `feat(phase-1): company management`

---

### Section 1.5: Users API & UI

**Objective**: User management and team invitations.

#### Task 1.5.1: Create users API routes
```
File: src/app/api/users/route.ts
File: src/app/api/users/[id]/route.ts
File: src/app/api/users/invite/route.ts
```
- [ ] GET /api/users - list users (paginated)
- [ ] POST /api/users - create user
- [ ] GET /api/users/:id - get user
- [ ] PATCH /api/users/:id - update user
- [ ] DELETE /api/users/:id - deactivate user
- [ ] POST /api/users/invite - send invitation

#### Task 1.5.2: Create users list page
```
File: src/app/(dashboard)/settings/users/page.tsx
```
- [ ] Users table component
- [ ] Pagination
- [ ] Search/filter
- [ ] Role badges
- [ ] Actions (edit, deactivate)

#### Task 1.5.3: Create user form components
```
File: src/components/users/user-form.tsx
File: src/components/users/invite-form.tsx
```
- [ ] User edit form
- [ ] Role selector
- [ ] Invite form with email

#### Task 1.5.4: Create useUsers hook
```
File: src/hooks/use-users.ts
```
- [ ] Fetch users list
- [ ] Create/update/delete mutations
- [ ] Invite mutation

- [ ] Commit: `feat(phase-1): user management`

---

### Section 1.6: Clients API & UI

**Objective**: Client/homeowner management.

#### Task 1.6.1: Create clients API routes
```
File: src/app/api/clients/route.ts
File: src/app/api/clients/[id]/route.ts
File: src/app/api/clients/[id]/contacts/route.ts
File: src/app/api/clients/[id]/addresses/route.ts
```
- [ ] GET /api/clients - list clients (paginated, filterable)
- [ ] POST /api/clients - create client
- [ ] GET /api/clients/:id - get client with contacts/addresses
- [ ] PATCH /api/clients/:id - update client
- [ ] DELETE /api/clients/:id - soft delete client
- [ ] GET/POST /api/clients/:id/contacts - manage contacts
- [ ] GET/POST /api/clients/:id/addresses - manage addresses

#### Task 1.6.2: Create clients list page
```
File: src/app/(dashboard)/clients/page.tsx
```
- [ ] Clients table
- [ ] Search by name, email
- [ ] Filter by status
- [ ] Pagination
- [ ] Quick actions

#### Task 1.6.3: Create client detail page
```
File: src/app/(dashboard)/clients/[id]/page.tsx
```
- [ ] Client info header
- [ ] Tabs: Overview, Contacts, Jobs, Notes
- [ ] Contact list management
- [ ] Address management
- [ ] Related jobs list

#### Task 1.6.4: Create client form components
```
File: src/components/clients/client-form.tsx
File: src/components/clients/contact-form.tsx
File: src/components/clients/address-form.tsx
```
- [ ] Client create/edit form
- [ ] Contact add/edit form
- [ ] Address add/edit form

#### Task 1.6.5: Create useClients hook
```
File: src/hooks/use-clients.ts
```
- [ ] List, create, update, delete
- [ ] Contact management
- [ ] Address management

- [ ] Commit: `feat(phase-1): client management`

---

### Section 1.7: Jobs API & UI

**Objective**: Project/job management.

#### Task 1.7.1: Create jobs API routes
```
File: src/app/api/jobs/route.ts
File: src/app/api/jobs/[id]/route.ts
File: src/app/api/jobs/[id]/summary/route.ts
File: src/app/api/jobs/[id]/phases/route.ts
File: src/app/api/jobs/[id]/team/route.ts
```
- [ ] GET /api/jobs - list jobs (paginated, filterable)
- [ ] POST /api/jobs - create job
- [ ] GET /api/jobs/:id - get job with details
- [ ] PATCH /api/jobs/:id - update job
- [ ] DELETE /api/jobs/:id - archive job
- [ ] GET /api/jobs/:id/summary - get job summary (financials, progress)
- [ ] GET/POST/PATCH /api/jobs/:id/phases - manage phases
- [ ] GET/POST/DELETE /api/jobs/:id/team - manage team members

#### Task 1.7.2: Create jobs list page (dashboard)
```
File: src/app/(dashboard)/page.tsx (or /jobs/page.tsx)
```
- [ ] Jobs cards or table view
- [ ] Status filter tabs
- [ ] Search
- [ ] Sort options
- [ ] Quick stats (total, active, etc.)

#### Task 1.7.3: Create job detail page
```
File: src/app/(dashboard)/jobs/[id]/page.tsx
```
- [ ] Job header with status
- [ ] Key metrics cards
- [ ] Tab navigation: Overview, Budget, Schedule, Docs, etc.
- [ ] Quick actions

#### Task 1.7.4: Create job overview tab
```
File: src/app/(dashboard)/jobs/[id]/(tabs)/overview/page.tsx
```
- [ ] Job details summary
- [ ] Client info
- [ ] Team members
- [ ] Recent activity
- [ ] Phases progress

#### Task 1.7.5: Create job form components
```
File: src/components/jobs/job-form.tsx
File: src/components/jobs/phase-form.tsx
File: src/components/jobs/team-member-form.tsx
```
- [ ] Job create/edit form
- [ ] Phase management
- [ ] Team member assignment

#### Task 1.7.6: Create useJobs hook
```
File: src/hooks/use-jobs.ts
```
- [ ] List, create, update, delete
- [ ] Phase management
- [ ] Team management
- [ ] Summary fetching

- [ ] Commit: `feat(phase-1): job management`

---

### Section 1.8: Dashboard & Global Search

**Objective**: Main dashboard and search functionality.

#### Task 1.8.1: Create dashboard layout
```
File: src/app/(dashboard)/layout.tsx
```
- [ ] Sidebar navigation
- [ ] Top header with user menu
- [ ] Search bar
- [ ] Notifications indicator
- [ ] Responsive mobile menu

#### Task 1.8.2: Create dashboard home page
```
File: src/app/(dashboard)/page.tsx
```
- [ ] Welcome message
- [ ] Key metrics cards (active jobs, pending invoices, etc.)
- [ ] Recent activity feed
- [ ] Quick actions
- [ ] Jobs overview (cards or table)

#### Task 1.8.3: Create global search API
```
File: src/app/api/search/route.ts
```
- [ ] GET /api/search?q=query
- [ ] Search across jobs, clients, users
- [ ] Return categorized results
- [ ] Limit results per category

#### Task 1.8.4: Create search component
```
File: src/components/search/global-search.tsx
```
- [ ] Command+K shortcut
- [ ] Search input with debounce
- [ ] Results dropdown
- [ ] Keyboard navigation
- [ ] Category grouping

#### Task 1.8.5: Create navigation components
```
File: src/components/layout/sidebar.tsx
File: src/components/layout/header.tsx
File: src/components/layout/user-menu.tsx
```
- [ ] Sidebar with nav links
- [ ] Collapsible sections
- [ ] Active state
- [ ] Header with search
- [ ] User dropdown menu

- [ ] Commit: `feat(phase-1): dashboard and search`

---

### Section 1.9: Notes & Tags System

**Objective**: Universal notes and tagging.

#### Task 1.9.1: Create notes API
```
File: src/app/api/notes/route.ts
File: src/app/api/[entityType]/[entityId]/notes/route.ts
```
- [ ] GET/POST notes for any entity
- [ ] PATCH/DELETE individual notes

#### Task 1.9.2: Create tags API
```
File: src/app/api/tags/route.ts
File: src/app/api/[entityType]/[entityId]/tags/route.ts
```
- [ ] CRUD tags
- [ ] Attach/detach tags from entities

#### Task 1.9.3: Create notes component
```
File: src/components/notes/notes-list.tsx
File: src/components/notes/note-form.tsx
```
- [ ] Notes list for any entity
- [ ] Add note form
- [ ] Edit/delete notes

#### Task 1.9.4: Create tags component
```
File: src/components/tags/tag-selector.tsx
File: src/components/tags/tag-badge.tsx
```
- [ ] Tag selector with autocomplete
- [ ] Create new tag inline
- [ ] Tag display badges

- [ ] Commit: `feat(phase-1): notes and tags`

---

### Section 1.10: Phase 1 Validation & Cleanup

**Objective**: Ensure Phase 1 is complete and stable.

#### Task 1.10.1: Run full validation
- [ ] `npm run lint` - no errors
- [ ] `npm run typecheck` - no errors
- [ ] `npm run build` - builds successfully

#### Task 1.10.2: Test all functionality
- [ ] Signup flow works
- [ ] Login/logout works
- [ ] Company settings save
- [ ] User CRUD works
- [ ] Client CRUD works
- [ ] Job CRUD works
- [ ] Search returns results
- [ ] Notes can be added
- [ ] Tags can be managed

#### Task 1.10.3: Update documentation
- [ ] Update `.claude/CONTEXT.md` with Phase 1 completion
- [ ] Update `.claude/CURRENT_PHASE.md` for Phase 1.5
- [ ] Commit: `feat(phase-1): phase 1 complete`

---

## Phase 1.5: Data Migration System

### Section 1.5.1: Migration Database Setup

#### Task 1.5.1.1: Create migration tables
```
File: supabase/migrations/20240213100001_create_migration_tables.sql
Reference: docs/DATABASE_SCHEMA.md > Phase 1.5: Migration System
```
- [ ] Create migrations table
- [ ] Create migration_batches table
- [ ] Create migration_staging table
- [ ] Create migration_field_mappings table
- [ ] Create migration_cost_code_mappings table
- [ ] Create migration_id_mappings table
- [ ] Enable RLS on all
- [ ] Create indexes
- [ ] Apply migration
- [ ] Regenerate types

### Section 1.5.2: Migration Infrastructure

#### Task 1.5.2.1: Create migration service
```
File: src/lib/migration/migration-service.ts
```
- [ ] Create migration
- [ ] Update status
- [ ] Get progress
- [ ] Rollback migration

#### Task 1.5.2.2: Create file parser utilities
```
File: src/lib/migration/parsers/csv-parser.ts
File: src/lib/migration/parsers/excel-parser.ts
```
- [ ] CSV parsing with header detection
- [ ] Excel parsing (xlsx)
- [ ] Column mapping suggestions

#### Task 1.5.2.3: Create data transformer
```
File: src/lib/migration/transformer.ts
```
- [ ] Apply field mappings
- [ ] Type conversions
- [ ] Data validation
- [ ] Relationship linking

#### Task 1.5.2.4: Create validation engine
```
File: src/lib/migration/validator.ts
```
- [ ] Required field checks
- [ ] Format validation
- [ ] Duplicate detection
- [ ] Foreign key validation

### Section 1.5.3: Source Adapters

#### Task 1.5.3.1: Create Buildertrend adapter
```
File: src/lib/migration/adapters/buildertrend.ts
```
- [ ] Field mappings for all entities
- [ ] Data transformation rules
- [ ] Validation rules

#### Task 1.5.3.2: Create CoConstruct adapter
```
File: src/lib/migration/adapters/coconstruct.ts
```
- [ ] Field mappings
- [ ] Transformations
- [ ] Validation

#### Task 1.5.3.3: Create QuickBooks adapter
```
File: src/lib/migration/adapters/quickbooks.ts
```
- [ ] OAuth2 connection flow
- [ ] API data fetching
- [ ] Field mappings
- [ ] Vendor/customer sync

#### Task 1.5.3.4: Create Excel/CSV universal adapter
```
File: src/lib/migration/adapters/universal.ts
```
- [ ] AI-assisted column detection
- [ ] Template generation
- [ ] Flexible mapping

### Section 1.5.4: Migration API

#### Task 1.5.4.1: Create migration API routes
```
File: src/app/api/migrations/route.ts
File: src/app/api/migrations/[id]/route.ts
File: src/app/api/migrations/[id]/upload/route.ts
File: src/app/api/migrations/[id]/mappings/route.ts
File: src/app/api/migrations/[id]/validate/route.ts
File: src/app/api/migrations/[id]/execute/route.ts
File: src/app/api/migrations/[id]/rollback/route.ts
```
- [ ] All migration endpoints per MIGRATION_STRATEGY.md

### Section 1.5.5: Migration Wizard UI

#### Task 1.5.5.1: Create migration wizard pages
```
File: src/app/(dashboard)/settings/migration/page.tsx
File: src/app/(dashboard)/settings/migration/[id]/page.tsx
```
- [ ] Step 1: Source selection
- [ ] Step 2: File upload / API connection
- [ ] Step 3: Field mapping review
- [ ] Step 4: Validation preview
- [ ] Step 5: Import progress
- [ ] Step 6: Completion summary

#### Task 1.5.5.2: Create migration components
```
File: src/components/migration/source-selector.tsx
File: src/components/migration/file-uploader.tsx
File: src/components/migration/mapping-editor.tsx
File: src/components/migration/validation-results.tsx
File: src/components/migration/progress-tracker.tsx
```
- [ ] All wizard step components

### Section 1.5.6: Migration Validation

- [ ] Test Buildertrend import
- [ ] Test CoConstruct import
- [ ] Test Excel import
- [ ] Test QuickBooks connection
- [ ] Verify data accuracy
- [ ] Test rollback functionality
- [ ] Commit: `feat(phase-1.5): migration system complete`

---

## Phase 2: Financial Management

### Section 2.1: Database Setup

#### Task 2.1.1: Create financial tables
```
File: supabase/migrations/20240214000001_create_financial_tables.sql
Reference: docs/DATABASE_SCHEMA.md > Phase 2
```
- [ ] cost_codes
- [ ] budgets
- [ ] budget_line_items
- [ ] invoices
- [ ] invoice_line_items
- [ ] change_orders
- [ ] change_order_items
- [ ] draws
- [ ] draw_line_items
- [ ] payments
- [ ] payment_allocations
- [ ] All RLS policies
- [ ] All indexes
- [ ] Regenerate types

### Section 2.2: Cost Codes

#### Task 2.2.1: Cost codes API & UI
```
File: src/app/api/cost-codes/route.ts
File: src/app/(dashboard)/settings/cost-codes/page.tsx
```
- [ ] CRUD endpoints
- [ ] Hierarchical display
- [ ] Import from templates
- [ ] Custom code creation

### Section 2.3: Budgets

#### Task 2.3.1: Budget API
```
File: src/app/api/jobs/[id]/budget/route.ts
File: src/app/api/jobs/[id]/budget/summary/route.ts
```
- [ ] Create/update budget
- [ ] Add line items
- [ ] Get summary with actuals

#### Task 2.3.2: Budget UI
```
File: src/app/(dashboard)/jobs/[id]/(tabs)/budget/page.tsx
File: src/components/budget/budget-table.tsx
File: src/components/budget/budget-summary.tsx
```
- [ ] Budget table with cost codes
- [ ] Inline editing
- [ ] Variance calculations
- [ ] Summary cards

### Section 2.4: Invoices

#### Task 2.4.1: Invoice API
```
File: src/app/api/invoices/route.ts
File: src/app/api/invoices/[id]/route.ts
File: src/app/api/invoices/[id]/approve/route.ts
File: src/app/api/jobs/[id]/invoices/route.ts
```
- [ ] Full CRUD
- [ ] Approval workflow
- [ ] Line item management

#### Task 2.4.2: Invoice UI
```
File: src/app/(dashboard)/invoices/page.tsx
File: src/app/(dashboard)/invoices/[id]/page.tsx
File: src/components/invoices/invoice-form.tsx
```
- [ ] Invoice list with filters
- [ ] Invoice detail/edit
- [ ] Approval actions
- [ ] Cost code assignment

### Section 2.5: Change Orders

#### Task 2.5.1: Change order API & UI
```
Similar pattern to invoices
```
- [ ] CRUD endpoints
- [ ] Approval workflow
- [ ] Client signature
- [ ] Budget impact calculation

### Section 2.6: Draws / Pay Applications

#### Task 2.6.1: Draw API
```
File: src/app/api/draws/route.ts
File: src/app/api/draws/[id]/route.ts
File: src/app/api/draws/[id]/generate-aia/route.ts
```
- [ ] Create draw from budget
- [ ] Line item calculations
- [ ] AIA G702/G703 generation

#### Task 2.6.2: Draw UI & AIA Generator
```
File: src/app/(dashboard)/jobs/[id]/(tabs)/draws/page.tsx
File: src/lib/aia/g702-generator.ts
File: src/lib/aia/g703-generator.ts
```
- [ ] Draw creation wizard
- [ ] AIA form preview
- [ ] PDF generation

### Section 2.7: Financial Dashboard

#### Task 2.7.1: Financial dashboard
```
File: src/app/(dashboard)/financials/page.tsx
```
- [ ] Portfolio summary
- [ ] Cash flow chart
- [ ] Pending invoices
- [ ] Over-budget alerts

- [ ] Commit: `feat(phase-2): financial management complete`

---

## Phases 3-8: Continued in EXECUTION_PLAN_EXTENDED.md

> Due to length, detailed tasks for Phases 3-8 are in `docs/EXECUTION_PLAN_EXTENDED.md`
>
> Summary:
> - **Phase 3**: Schedule, Daily Logs, Photos, Inspections, Punch Lists, Safety
> - **Phase 4**: Selections, Allowances, Designer Portal
> - **Phase 5**: Vendors, Bids, Contracts, Insurance, Lien Waivers
> - **Phase 6**: Client Portal
> - **Phase 7**: Reports & Analytics
> - **Phase 8**: Documents, RFIs, Submittals, Messaging

---

## Execution Tracking

Use this checklist to track overall progress:

### MVP Phases
- [ ] Phase 1: Foundation & Core Data
- [ ] Phase 1.5: Data Migration System
- [ ] Phase 2: Financial Management
- [ ] Phase 3: Field Operations & Schedule
- [ ] Phase 4: Selections & Design
- [ ] Phase 5: Vendors & Subcontractors
- [ ] Phase 6: Client Portal
- [ ] Phase 7: Reports & Analytics
- [ ] Phase 8: Documents & Communication

### Post-Phase Checklist (After Each Phase)
- [ ] All database migrations applied
- [ ] All API endpoints functional
- [ ] All UI pages working
- [ ] `npm run validate` passes
- [ ] Browser testing complete
- [ ] Committed with proper message
- [ ] CONTEXT.md updated
- [ ] CURRENT_PHASE.md updated for next phase

---

## File Structure Reference

```
src/
├── app/
│   ├── (auth)/              # Auth pages (login, signup)
│   ├── (dashboard)/         # Protected app pages
│   │   ├── page.tsx         # Dashboard home
│   │   ├── jobs/
│   │   │   ├── page.tsx     # Jobs list
│   │   │   └── [id]/
│   │   │       ├── page.tsx # Job detail
│   │   │       └── (tabs)/  # Job sub-pages
│   │   ├── clients/
│   │   ├── invoices/
│   │   ├── settings/
│   │   └── ...
│   ├── api/                 # API routes
│   │   ├── auth/
│   │   ├── jobs/
│   │   ├── clients/
│   │   ├── invoices/
│   │   └── ...
│   └── layout.tsx
├── components/
│   ├── ui/                  # shadcn components
│   ├── layout/              # Sidebar, header, etc.
│   ├── jobs/                # Job-specific components
│   ├── clients/             # Client components
│   └── ...
├── hooks/                   # React hooks
├── lib/
│   ├── supabase/           # Supabase clients
│   ├── api/                # API utilities
│   ├── auth/               # Auth utilities
│   ├── validation/         # Zod schemas
│   └── migration/          # Migration system
├── providers/              # Context providers
└── types/                  # TypeScript types
```

---

*Last Updated: 2024-02-12*
*Version: 1.0*
