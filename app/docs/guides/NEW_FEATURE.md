# New Feature Development Guide

> This is the step-by-step process for building any new feature. Follow it exactly.

## Overview

Every feature goes through these phases:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  PLAN    │───▶│ DATABASE │───▶│   API    │───▶│    UI    │───▶│  SHIP    │
│          │    │          │    │          │    │          │    │          │
│ ☐ Spec   │    │ ☐ Schema │    │ ☐ Routes │    │ ☐ Comps  │    │ ☐ PR     │
│ ☐ Design │    │ ☐ RLS    │    │ ☐ Tests  │    │ ☐ Tests  │    │ ☐ Review │
│ ☐ Tasks  │    │ ☐ Index  │    │ ☐ Docs   │    │ ☐ A11y   │    │ ☐ Deploy │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

---

## Phase 1: Plan

### 1.1 Create Feature Spec

Before writing any code, create a spec document:

```markdown
# Feature: [Feature Name]

## Problem
What problem does this solve? Who requested it?

## Solution
How will we solve it? High-level approach.

## User Stories
- As a [role], I want to [action] so that [benefit]

## Scope
### In Scope
- List what's included

### Out of Scope
- List what's NOT included (important!)

## Technical Approach
- Database changes needed
- API endpoints needed
- UI components needed

## Open Questions
- Any decisions that need to be made
```

### 1.2 Break Down Tasks

Create a task list with clear deliverables:

```markdown
## Tasks

### Database
- [ ] Create `feature_table` migration
- [ ] Add RLS policies
- [ ] Add indexes

### API
- [ ] GET /api/features (list)
- [ ] POST /api/features (create)
- [ ] GET /api/features/:id
- [ ] PATCH /api/features/:id
- [ ] DELETE /api/features/:id

### UI
- [ ] FeatureList component
- [ ] FeatureForm component
- [ ] FeatureDetail page
- [ ] Add to navigation

### Testing
- [ ] Unit tests for utils
- [ ] API integration tests
- [ ] Component tests
- [ ] E2E test for happy path
```

### 1.3 Create Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/ROSS-123-feature-name
```

---

## Phase 2: Database

### 2.1 Design Schema

Follow [DATABASE_STANDARDS.md](../standards/DATABASE_STANDARDS.md).

```sql
-- migrations/20240115000000_create_features.sql

-- 1. Create table
CREATE TABLE features (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tenant isolation (REQUIRED)
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Business fields
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CONSTRAINT chk_features_status CHECK (status IN ('draft', 'active', 'archived')),

  -- Relationships
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),

  -- Timestamps (REQUIRED)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add indexes
CREATE INDEX idx_features_company_id ON features(company_id);
CREATE INDEX idx_features_status ON features(status);
CREATE INDEX idx_features_company_status ON features(company_id, status);

-- 3. Enable RLS (REQUIRED)
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policy (REQUIRED)
CREATE POLICY tenant_isolation ON features
  FOR ALL
  USING (company_id = get_current_company_id())
  WITH CHECK (company_id = get_current_company_id());

-- 5. Create updated_at trigger
CREATE TRIGGER set_features_updated_at
  BEFORE UPDATE ON features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 6. Add table comment
COMMENT ON TABLE features IS 'Description of what this table stores';
```

### 2.2 Apply Migration

```bash
# Apply to development branch/database
npm run db:migrate

# Generate updated TypeScript types
npm run db:generate
```

### 2.3 Verify

- [ ] Table created with all columns
- [ ] RLS enabled
- [ ] Policies working (test with different users)
- [ ] Indexes created
- [ ] Types generated

---

## Phase 3: API

### 3.1 Create Route Files

Follow [API_STANDARDS.md](../standards/API_STANDARDS.md).

```
src/app/api/features/
├── route.ts           # GET (list), POST (create)
└── [id]/
    └── route.ts       # GET, PATCH, DELETE
```

### 3.2 Implement List Endpoint

```typescript
// src/app/api/features/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
} from '@/lib/api/middleware';
import { createClient } from '@/lib/supabase/server';

// Validation schema
const createFeatureSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
});

// GET /api/features
export const GET = createApiHandler(
  async (req, ctx) => {
    const { companyId } = ctx;
    const { page, limit, offset } = getPaginationParams(req);

    const supabase = await createClient();

    const { data, count, error } = await supabase
      .from('features')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json(
      paginatedResponse(data || [], count || 0, page, limit)
    );
  },
  { rateLimit: 'api' }
);

// POST /api/features
export const POST = createApiHandler(
  async (req, ctx) => {
    const { user, companyId } = ctx;
    const body = await req.json();
    const data = createFeatureSchema.parse(body);

    const supabase = await createClient();

    const { data: feature, error } = await supabase
      .from('features')
      .insert({
        company_id: companyId,
        created_by: user!.id,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: feature }, { status: 201 });
  },
  {
    rateLimit: 'api',
    requiredRoles: ['admin', 'manager'],
    auditAction: 'features.create',
  }
);
```

### 3.3 Implement Single Resource Endpoint

```typescript
// src/app/api/features/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from '@/lib/api/middleware';
import { createClient } from '@/lib/supabase/server';
import { NotFoundError } from '@/lib/errors';

const updateFeatureSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

// Helper to extract ID from URL
function getIdFromUrl(req: NextRequest): string {
  return req.nextUrl.pathname.split('/').pop()!;
}

// GET /api/features/[id]
export const GET = createApiHandler(async (req, ctx) => {
  const { companyId } = ctx;
  const id = getIdFromUrl(req);

  const supabase = await createClient();

  const { data: feature, error } = await supabase
    .from('features')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  if (error || !feature) {
    throw new NotFoundError('Feature');
  }

  return NextResponse.json({ data: feature });
});

// PATCH /api/features/[id]
export const PATCH = createApiHandler(
  async (req, ctx) => {
    const { user, companyId } = ctx;
    const id = getIdFromUrl(req);
    const body = await req.json();
    const data = updateFeatureSchema.parse(body);

    const supabase = await createClient();

    const { data: feature, error } = await supabase
      .from('features')
      .update({ ...data, updated_by: user!.id })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error || !feature) {
      throw new NotFoundError('Feature');
    }

    return NextResponse.json({ data: feature });
  },
  {
    requiredRoles: ['admin', 'manager'],
    auditAction: 'features.update',
  }
);

// DELETE /api/features/[id]
export const DELETE = createApiHandler(
  async (req, ctx) => {
    const { companyId } = ctx;
    const id = getIdFromUrl(req);

    const supabase = await createClient();

    const { error } = await supabase
      .from('features')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  },
  {
    requiredRoles: ['admin'],
    auditAction: 'features.delete',
  }
);
```

### 3.4 Write API Tests

```typescript
// tests/integration/api/features.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET, POST } from '@/app/api/features/route';
// ... test implementation
```

### 3.5 Verify API

- [ ] All endpoints return correct status codes
- [ ] Validation errors return 400 with field details
- [ ] Auth errors return 401/403
- [ ] Rate limiting works
- [ ] Audit logging records actions
- [ ] Integration tests pass

---

## Phase 4: UI

### 4.1 Create Data Hook

```typescript
// hooks/use-features.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Feature {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
}

interface FeaturesResponse {
  data: Feature[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export function useFeatures(params?: { page?: number; status?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.status) searchParams.set('status', params.status);

  return useQuery<FeaturesResponse>({
    queryKey: ['features', params],
    queryFn: async () => {
      const res = await fetch(`/api/features?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch features');
      return res.json();
    },
  });
}

export function useFeature(id: string) {
  return useQuery<{ data: Feature }>({
    queryKey: ['features', id],
    queryFn: async () => {
      const res = await fetch(`/api/features/${id}`);
      if (!res.ok) throw new Error('Failed to fetch feature');
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Feature>) => {
      const res = await fetch('/api/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create feature');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
}

export function useUpdateFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Feature> }) => {
      const res = await fetch(`/api/features/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update feature');
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
      queryClient.invalidateQueries({ queryKey: ['features', id] });
    },
  });
}

export function useDeleteFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/features/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete feature');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
}
```

### 4.2 Create Components

Follow [COMPONENT_STANDARDS.md](../standards/COMPONENT_STANDARDS.md).

```typescript
// components/features/FeatureCard.tsx
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { Feature } from '@/types';

interface FeatureCardProps {
  feature: Feature;
  onClick?: (feature: Feature) => void;
}

export function FeatureCard({ feature, onClick }: FeatureCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(feature)}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="font-semibold">{feature.name}</h3>
        <Badge variant={getStatusVariant(feature.status)}>
          {feature.status}
        </Badge>
      </CardHeader>
      {feature.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {feature.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'active': return 'success';
    case 'draft': return 'secondary';
    case 'archived': return 'outline';
    default: return 'default';
  }
}
```

```typescript
// components/features/FeatureList.tsx
'use client';

import { useFeatures } from '@/hooks/use-features';
import { FeatureCard } from './FeatureCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/ui/pagination';

interface FeatureListProps {
  onFeatureClick?: (feature: Feature) => void;
}

export function FeatureList({ onFeatureClick }: FeatureListProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useFeatures({ page });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.data.length) {
    return (
      <EmptyState
        title="No features"
        description="Create your first feature to get started."
        action={{ label: 'Create Feature', href: '/features/new' }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.data.map((feature) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            onClick={onFeatureClick}
          />
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={data.pagination.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
```

### 4.3 Create Form

```typescript
// components/features/FeatureForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateFeature, useUpdateFeature } from '@/hooks/use-features';

const featureSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']),
});

type FeatureFormData = z.infer<typeof featureSchema>;

interface FeatureFormProps {
  feature?: Feature;
  onSuccess?: () => void;
}

export function FeatureForm({ feature, onSuccess }: FeatureFormProps) {
  const createFeature = useCreateFeature();
  const updateFeature = useUpdateFeature();
  const isEditing = !!feature;

  const form = useForm<FeatureFormData>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      name: feature?.name ?? '',
      description: feature?.description ?? '',
      status: feature?.status ?? 'draft',
    },
  });

  const onSubmit = async (data: FeatureFormData) => {
    try {
      if (isEditing) {
        await updateFeature.mutateAsync({ id: feature.id, data });
      } else {
        await createFeature.mutateAsync(data);
      }
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isSubmitting = createFeature.isPending || updateFeature.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <Input {...field} placeholder="Feature name" />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <Textarea {...field} placeholder="Optional description" />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select {...field}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### 4.4 Create Page

```typescript
// app/(dashboard)/features/page.tsx
import { FeatureList } from '@/components/features/FeatureList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Features</h1>
        <Button asChild>
          <Link href="/features/new">
            <Plus className="w-4 h-4 mr-2" />
            New Feature
          </Link>
        </Button>
      </div>

      <FeatureList />
    </div>
  );
}
```

### 4.5 Write Component Tests

```typescript
// components/features/FeatureCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FeatureCard } from './FeatureCard';

describe('FeatureCard', () => {
  const mockFeature = {
    id: '1',
    name: 'Test Feature',
    description: 'Test description',
    status: 'active' as const,
    createdAt: '2024-01-01',
  };

  it('renders feature name and status', () => {
    render(<FeatureCard feature={mockFeature} />);

    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<FeatureCard feature={mockFeature} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('article'));

    expect(handleClick).toHaveBeenCalledWith(mockFeature);
  });
});
```

### 4.6 Verify UI

- [ ] List page shows data correctly
- [ ] Pagination works
- [ ] Create form validates input
- [ ] Edit form populates existing data
- [ ] Delete confirmation works
- [ ] Loading states shown
- [ ] Error states handled
- [ ] Empty state shown when no data
- [ ] Mobile responsive
- [ ] Keyboard accessible

---

## Phase 5: Ship

### 5.1 Final Checklist

Before creating PR:

**Code Quality:**
- [ ] ESLint passes (`npm run lint`)
- [ ] TypeScript passes (`npm run typecheck`)
- [ ] No console.logs or debug code
- [ ] No TODO comments without tickets

**Testing:**
- [ ] Unit tests pass (`npm run test`)
- [ ] Integration tests pass
- [ ] E2E test for happy path
- [ ] Manual testing completed

**Security:**
- [ ] RLS policies tested
- [ ] Input validation on all endpoints
- [ ] No sensitive data exposed
- [ ] Rate limiting applied

**Documentation:**
- [ ] API endpoints documented
- [ ] Complex logic commented
- [ ] README updated if needed

### 5.2 Create Pull Request

```bash
git push -u origin feature/ROSS-123-feature-name
```

PR should include:
- Clear title with ticket number
- Summary of changes
- Testing instructions
- Screenshots (if UI changes)

### 5.3 Address Review Feedback

- Respond to all comments
- Make requested changes
- Re-request review when ready

### 5.4 Merge and Cleanup

After approval:
```bash
# Merge via GitHub (squash preferred)
# Then cleanup local branch
git checkout develop
git pull origin develop
git branch -d feature/ROSS-123-feature-name
```

### 5.5 Monitor

After deployment:
- Check error tracking
- Monitor performance
- Verify feature works in production

---

## Quick Reference Checklist

Copy this for each feature:

```markdown
## Feature: [Name]

### Plan
- [ ] Spec document created
- [ ] Tasks broken down
- [ ] Branch created

### Database
- [ ] Migration created
- [ ] RLS policies added
- [ ] Indexes added
- [ ] Types generated

### API
- [ ] GET /list endpoint
- [ ] POST /create endpoint
- [ ] GET /[id] endpoint
- [ ] PATCH /[id] endpoint
- [ ] DELETE /[id] endpoint
- [ ] Integration tests

### UI
- [ ] Data hooks created
- [ ] List component
- [ ] Form component
- [ ] Detail page
- [ ] Component tests
- [ ] E2E test

### Ship
- [ ] All tests pass
- [ ] PR created
- [ ] Code reviewed
- [ ] Merged to develop
- [ ] Verified in staging
```
