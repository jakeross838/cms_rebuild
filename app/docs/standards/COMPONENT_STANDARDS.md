# Component & Styling Standards

> Consistent UI creates professional software. Follow these patterns exactly.

## Table of Contents
- [Component Architecture](#component-architecture)
- [File Structure](#file-structure)
- [Component Patterns](#component-patterns)
- [Props and Types](#props-and-types)
- [State Management](#state-management)
- [Styling with Tailwind](#styling-with-tailwind)
- [Accessibility](#accessibility)
- [Performance](#performance)

---

## Component Architecture

### Component Hierarchy

```
src/components/
├── ui/                    # Base UI primitives (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
│
├── forms/                 # Form components
│   ├── FormField.tsx
│   ├── FormSelect.tsx
│   └── ...
│
├── tables/                # Data table components
│   ├── DataTable.tsx
│   ├── TablePagination.tsx
│   └── ...
│
├── layout/                # Layout components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── ...
│
├── common/                # Shared components
│   ├── LoadingSpinner.tsx
│   ├── ErrorBoundary.tsx
│   ├── EmptyState.tsx
│   └── ...
│
└── [feature]/             # Feature-specific components
    ├── jobs/
    │   ├── JobCard.tsx
    │   ├── JobList.tsx
    │   └── JobForm.tsx
    └── invoices/
        ├── InvoiceCard.tsx
        └── ...
```

### Component Types

| Type | Location | Purpose | Example |
|------|----------|---------|---------|
| UI Primitives | `ui/` | Basic building blocks | Button, Input, Card |
| Composite | `forms/`, `tables/` | Reusable combinations | FormField, DataTable |
| Layout | `layout/` | Page structure | Header, Sidebar |
| Feature | `[feature]/` | Business logic specific | JobCard, InvoiceForm |
| Page | `app/` | Route components | page.tsx files |

---

## File Structure

### Single Component File
```typescript
// components/jobs/JobCard.tsx

// 1. Imports
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Job } from '@/types';

// 2. Types
interface JobCardProps {
  job: Job;
  onClick?: (job: Job) => void;
  variant?: 'default' | 'compact';
}

// 3. Component
export default function JobCard({ job, onClick, variant = 'default' }: JobCardProps) {
  // Hooks first
  const isCompact = variant === 'compact';

  // Event handlers
  const handleClick = () => {
    onClick?.(job);
  };

  // Render
  return (
    <Card
      className={cn('cursor-pointer hover:shadow-md', isCompact && 'p-2')}
      onClick={handleClick}
    >
      <CardHeader>
        <h3 className="font-semibold">{job.name}</h3>
        <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
      </CardHeader>
      {!isCompact && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{job.address}</p>
          <p className="text-sm">{formatCurrency(job.contractAmount)}</p>
        </CardContent>
      )}
    </Card>
  );
}

// 4. Helper functions (if small)
function getStatusVariant(status: string) {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
    draft: 'default',
    active: 'success',
    on_hold: 'warning',
    complete: 'default',
  };
  return variants[status] || 'default';
}
```

### Complex Component with Subcomponents
```
components/jobs/JobCard/
├── index.ts           # Re-exports
├── JobCard.tsx        # Main component
├── JobCardHeader.tsx  # Subcomponent
├── JobCardActions.tsx # Subcomponent
├── types.ts           # Shared types
└── utils.ts           # Helper functions
```

```typescript
// components/jobs/JobCard/index.ts
export { default } from './JobCard';
export { JobCard } from './JobCard';
export type { JobCardProps } from './types';
```

---

## Component Patterns

### Container/Presenter Pattern
```typescript
// Container: Handles data fetching and state
// jobs/JobListContainer.tsx
'use client';

import { useJobs } from '@/hooks/use-jobs';
import { JobList } from './JobList';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';

export default function JobListContainer() {
  const { data: jobs, isLoading, error } = useJobs();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!jobs?.length) return <EmptyState title="No jobs" />;

  return <JobList jobs={jobs} />;
}

// Presenter: Pure rendering, no data fetching
// jobs/JobList.tsx
interface JobListProps {
  jobs: Job[];
  onJobClick?: (job: Job) => void;
}

export function JobList({ jobs, onJobClick }: JobListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} onClick={onJobClick} />
      ))}
    </div>
  );
}
```

### Compound Components
```typescript
// components/ui/tabs.tsx - Compound component pattern
import { createContext, useContext } from 'react';

const TabsContext = createContext<{ activeTab: string; setActiveTab: (tab: string) => void } | null>(null);

export function Tabs({ children, defaultValue }: { children: React.ReactNode; defaultValue: string }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-2 border-b">{children}</div>;
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useContext(TabsContext)!;

  return (
    <button
      className={cn('px-4 py-2', activeTab === value && 'border-b-2 border-primary')}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const { activeTab } = useContext(TabsContext)!;
  if (activeTab !== value) return null;
  return <div className="py-4">{children}</div>;
}

// Usage
<Tabs defaultValue="details">
  <TabsList>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="items">Line Items</TabsTrigger>
  </TabsList>
  <TabsContent value="details">...</TabsContent>
  <TabsContent value="items">...</TabsContent>
</Tabs>
```

### Render Props (When Needed)
```typescript
// components/common/DataFetcher.tsx
interface DataFetcherProps<T> {
  fetcher: () => Promise<T>;
  children: (data: T) => React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?: (error: Error) => React.ReactNode;
}

export function DataFetcher<T>({
  fetcher,
  children,
  loadingFallback = <LoadingSpinner />,
  errorFallback = (error) => <ErrorMessage error={error} />,
}: DataFetcherProps<T>) {
  const { data, isLoading, error } = useQuery({ queryFn: fetcher });

  if (isLoading) return loadingFallback;
  if (error) return errorFallback(error);
  if (!data) return null;

  return children(data);
}
```

---

## Props and Types

### Props Interface Naming
```typescript
// Always: ComponentNameProps
interface ButtonProps { }
interface JobCardProps { }
interface DataTableProps<T> { }
```

### Required vs Optional Props
```typescript
interface JobCardProps {
  // Required props first
  job: Job;

  // Optional props with defaults
  variant?: 'default' | 'compact';
  showActions?: boolean;

  // Event handlers (always optional)
  onClick?: (job: Job) => void;
  onEdit?: (job: Job) => void;
  onDelete?: (job: Job) => void;

  // Style overrides (always optional)
  className?: string;
}

// Destructure with defaults
function JobCard({
  job,
  variant = 'default',
  showActions = true,
  onClick,
  className,
}: JobCardProps) { }
```

### Extending Native Elements
```typescript
// Extend native button props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

function Button({
  variant = 'default',
  size = 'md',
  isLoading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
}
```

### Generic Components
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
}

function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  isLoading,
}: DataTableProps<T>) {
  // Implementation
}
```

---

## State Management

### Local State (useState)
```typescript
// Use for component-specific state
function JobForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
}
```

### Server State (React Query / SWR)
```typescript
// Use for data fetching and caching
// hooks/use-jobs.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useJobs(companyId: string) {
  return useQuery({
    queryKey: ['jobs', companyId],
    queryFn: () => fetchJobs(companyId),
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJob,
    onSuccess: (newJob) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
```

### Form State (React Hook Form)
```typescript
// Use for complex forms
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const jobSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  clientId: z.string().uuid('Select a client'),
  startDate: z.date(),
});

type JobFormData = z.infer<typeof jobSchema>;

function JobForm() {
  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      name: '',
      clientId: '',
    },
  });

  const onSubmit = (data: JobFormData) => {
    // Handle submit
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Global State (Zustand - if needed)
```typescript
// Use sparingly for truly global state
// stores/ui-store.ts
import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

---

## Styling with Tailwind

### Class Organization
```typescript
// Order: layout → sizing → spacing → typography → colors → effects → state
<div className={cn(
  // Layout
  'flex flex-col items-center justify-center',
  // Sizing
  'w-full max-w-md h-screen',
  // Spacing
  'p-6 gap-4',
  // Typography
  'text-sm font-medium',
  // Colors
  'bg-white text-gray-900',
  // Borders
  'border border-gray-200 rounded-lg',
  // Effects
  'shadow-md',
  // States
  'hover:shadow-lg focus:ring-2',
  // Responsive
  'md:p-8 lg:max-w-lg',
  // Conditional
  isActive && 'ring-2 ring-primary'
)}>
```

### Use Design Tokens
```typescript
// ✅ CORRECT - Use semantic tokens
<div className="bg-background text-foreground border-border" />
<button className="bg-primary text-primary-foreground" />
<span className="text-muted-foreground" />

// ❌ WRONG - Hardcoded colors
<div className="bg-white text-gray-900 border-gray-200" />
```

### Component Variants with CVA
```typescript
// lib/utils.ts or component file
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
```

### Responsive Design
```typescript
// Mobile-first approach
<div className="
  flex flex-col        /* Mobile: stack vertically */
  md:flex-row          /* Tablet+: side by side */
  lg:gap-8             /* Desktop: more spacing */
">
  <div className="
    w-full             /* Mobile: full width */
    md:w-1/3           /* Tablet+: 1/3 width */
  ">
    Sidebar
  </div>
  <div className="
    w-full             /* Mobile: full width */
    md:w-2/3           /* Tablet+: 2/3 width */
  ">
    Content
  </div>
</div>
```

### Dark Mode Support
```typescript
// Use dark: prefix for dark mode variants
<div className="bg-white dark:bg-gray-900" />
<span className="text-gray-900 dark:text-gray-100" />

// Better: Use semantic tokens that auto-switch
<div className="bg-background text-foreground" />
```

---

## Accessibility

### Required Practices
```typescript
// 1. Always use semantic HTML
<nav>...</nav>
<main>...</main>
<article>...</article>
<button>...</button>  // Not <div onClick>

// 2. Labels for form inputs
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Or use aria-label
<input aria-label="Search jobs" type="search" />

// 3. Alt text for images
<img src={logo} alt="Company logo" />
<img src={decorative} alt="" role="presentation" />  // Decorative

// 4. Keyboard navigation
<button onKeyDown={(e) => e.key === 'Enter' && handleAction()}>

// 5. Focus management
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => {
  inputRef.current?.focus();
}, []);

// 6. ARIA attributes when needed
<div role="alert" aria-live="polite">Error message</div>
<button aria-expanded={isOpen} aria-controls="dropdown-menu">
```

### Focus Styles
```typescript
// Never remove focus outlines without replacement
// ✅ CORRECT
<button className="focus:outline-none focus:ring-2 focus:ring-primary" />

// ❌ WRONG
<button className="focus:outline-none" />
```

---

## Performance

### Memoization
```typescript
// Use useMemo for expensive computations
const sortedJobs = useMemo(
  () => jobs.sort((a, b) => b.createdAt - a.createdAt),
  [jobs]
);

// Use useCallback for stable function references
const handleSelect = useCallback((job: Job) => {
  setSelected(job);
}, []);

// Use React.memo for pure components that receive objects/arrays
const JobCard = React.memo(function JobCard({ job }: JobCardProps) {
  return <div>{job.name}</div>;
});
```

### Code Splitting
```typescript
// Lazy load heavy components
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart data={data} />
    </Suspense>
  );
}
```

### Image Optimization
```typescript
// Always use Next.js Image component
import Image from 'next/image';

<Image
  src={user.avatar}
  alt={user.name}
  width={40}
  height={40}
  className="rounded-full"
/>
```

### List Virtualization
```typescript
// For long lists (100+ items), use virtualization
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} className="h-[500px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: virtualItem.start,
              height: virtualItem.size,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```
