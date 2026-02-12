# RossOS Technical Architecture

> **Purpose**: Technical infrastructure specifications for search, caching, file storage, and PDF generation.
>
> **Stack**: Next.js 14, React 19, Supabase, TypeScript, Vercel
>
> **Last Updated**: 2026-02-12

---

## Table of Contents

1. [Search Infrastructure](#1-search-infrastructure)
2. [Caching Strategy](#2-caching-strategy)
3. [File Storage](#3-file-storage)
4. [PDF Generation](#4-pdf-generation)
5. [Background Jobs](#5-background-jobs)
6. [Real-Time Features](#6-real-time-features)

---

## 1. Search Infrastructure

### 1.1 Search Strategy Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SEARCH ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   PHASE 1 (MVP)                        PHASE 2 (SCALE)                      │
│   ─────────────                        ───────────────                      │
│   PostgreSQL Full-Text Search          Dedicated Search Service             │
│   ┌─────────────────────┐              ┌─────────────────────┐             │
│   │ pg_trgm extension   │              │ Elasticsearch/Typesense │          │
│   │ GIN indexes         │              │ Real-time sync      │             │
│   │ tsvector columns    │              │ Faceted search      │             │
│   └─────────────────────┘              └─────────────────────┘             │
│                                                                              │
│   Scale: <100K records                 Scale: 100K+ records                 │
│   Latency: <200ms                      Latency: <50ms                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Phase 1: PostgreSQL Full-Text Search

#### Enable Extensions

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create text search configuration
CREATE TEXT SEARCH CONFIGURATION english_unaccent (COPY = english);
ALTER TEXT SEARCH CONFIGURATION english_unaccent
  ALTER MAPPING FOR hword, hword_part, word WITH unaccent, english_stem;
```

#### Searchable Tables Configuration

```sql
-- Jobs table with full-text search
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION jobs_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english_unaccent', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english_unaccent', coalesce(NEW.address, '')), 'B') ||
    setweight(to_tsvector('english_unaccent', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english_unaccent', coalesce(NEW.job_number, '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name, address, description, job_number
  ON jobs FOR EACH ROW
  EXECUTE FUNCTION jobs_search_vector_update();

-- GIN index for fast full-text search
CREATE INDEX idx_jobs_search_vector ON jobs USING GIN(search_vector);

-- Trigram index for fuzzy matching
CREATE INDEX idx_jobs_name_trgm ON jobs USING GIN(name gin_trgm_ops);
```

#### Universal Search Function

```sql
-- Universal search across multiple entity types
CREATE OR REPLACE FUNCTION universal_search(
  p_company_id UUID,
  p_query TEXT,
  p_types TEXT[] DEFAULT ARRAY['jobs', 'clients', 'vendors', 'invoices'],
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  entity_type TEXT,
  entity_id UUID,
  title TEXT,
  subtitle TEXT,
  relevance FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH search_results AS (
    -- Jobs
    SELECT
      'job'::TEXT as entity_type,
      j.id as entity_id,
      j.name as title,
      j.address as subtitle,
      ts_rank(j.search_vector, websearch_to_tsquery('english_unaccent', p_query)) as relevance
    FROM jobs j
    WHERE j.company_id = p_company_id
      AND 'jobs' = ANY(p_types)
      AND (
        j.search_vector @@ websearch_to_tsquery('english_unaccent', p_query)
        OR j.name % p_query  -- Trigram similarity
      )

    UNION ALL

    -- Clients
    SELECT
      'client'::TEXT,
      c.id,
      c.name,
      c.email,
      ts_rank(c.search_vector, websearch_to_tsquery('english_unaccent', p_query))
    FROM clients c
    WHERE c.company_id = p_company_id
      AND 'clients' = ANY(p_types)
      AND c.search_vector @@ websearch_to_tsquery('english_unaccent', p_query)

    UNION ALL

    -- Vendors
    SELECT
      'vendor'::TEXT,
      v.id,
      v.name,
      v.trade,
      ts_rank(v.search_vector, websearch_to_tsquery('english_unaccent', p_query))
    FROM vendors v
    WHERE v.company_id = p_company_id
      AND 'vendors' = ANY(p_types)
      AND v.search_vector @@ websearch_to_tsquery('english_unaccent', p_query)

    UNION ALL

    -- Invoices
    SELECT
      'invoice'::TEXT,
      i.id,
      i.invoice_number,
      i.description,
      ts_rank(i.search_vector, websearch_to_tsquery('english_unaccent', p_query))
    FROM invoices i
    WHERE i.company_id = p_company_id
      AND 'invoices' = ANY(p_types)
      AND i.search_vector @@ websearch_to_tsquery('english_unaccent', p_query)
  )
  SELECT * FROM search_results
  ORDER BY relevance DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Search API Endpoint

```typescript
// src/app/api/search/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().min(2).max(100),
  types: z.array(z.enum(['jobs', 'clients', 'vendors', 'invoices'])).optional(),
  limit: z.number().min(1).max(50).optional().default(20),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const validation = searchSchema.safeParse({
    query: searchParams.get('q'),
    types: searchParams.get('types')?.split(','),
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
  });

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid search parameters' }, { status: 400 });
  }

  const { query, types, limit } = validation.data;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user's company_id
  const { data: profile } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) {
    return NextResponse.json({ error: 'No company found' }, { status: 403 });
  }

  const { data, error } = await supabase.rpc('universal_search', {
    p_company_id: profile.company_id,
    p_query: query,
    p_types: types,
    p_limit: limit,
  });

  if (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }

  return NextResponse.json({ results: data });
}
```

### 1.3 Phase 2: Typesense Integration (Future)

```typescript
// src/lib/search/typesense.ts
import Typesense from 'typesense';

const client = new Typesense.Client({
  nodes: [{
    host: process.env.TYPESENSE_HOST!,
    port: 443,
    protocol: 'https',
  }],
  apiKey: process.env.TYPESENSE_API_KEY!,
  connectionTimeoutSeconds: 2,
});

// Schema definition for jobs collection
const jobsSchema = {
  name: 'jobs',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'company_id', type: 'string', facet: true },
    { name: 'name', type: 'string' },
    { name: 'job_number', type: 'string' },
    { name: 'address', type: 'string' },
    { name: 'status', type: 'string', facet: true },
    { name: 'contract_amount', type: 'float', optional: true },
    { name: 'created_at', type: 'int64' },
  ],
  default_sorting_field: 'created_at',
};

export async function searchJobs(companyId: string, query: string, options?: {
  filters?: string;
  sortBy?: string;
  page?: number;
  perPage?: number;
}) {
  return client.collections('jobs').documents().search({
    q: query,
    query_by: 'name,job_number,address',
    filter_by: `company_id:=${companyId}${options?.filters ? ` && ${options.filters}` : ''}`,
    sort_by: options?.sortBy || 'created_at:desc',
    page: options?.page || 1,
    per_page: options?.perPage || 20,
    highlight_full_fields: 'name,address',
  });
}
```

---

## 2. Caching Strategy

### 2.1 Multi-Layer Cache Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CACHING LAYERS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Layer 1: Browser Cache          Layer 2: Edge Cache       Layer 3: DB     │
│   ──────────────────             ─────────────────         ────────────     │
│   ┌─────────────────┐            ┌─────────────────┐       ┌───────────┐   │
│   │ React Query     │            │ Vercel KV       │       │ Supabase  │   │
│   │ (Client State)  │◄──────────▶│ (Redis)         │◄─────▶│ Postgres  │   │
│   │ SWR             │            │                 │       │           │   │
│   └─────────────────┘            └─────────────────┘       └───────────┘   │
│                                                                              │
│   TTL: Session                   TTL: 5-60 seconds         TTL: Permanent   │
│   Scope: Per User                Scope: Per Tenant         Scope: Global    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 React Query Configuration

```typescript
// src/lib/query/provider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: 30 seconds for most queries
        staleTime: 30 * 1000,
        // Cache time: 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry failed requests 2 times
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus for fresh data
        refetchOnWindowFocus: true,
        // Don't refetch on mount if data is fresh
        refetchOnMount: false,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

### 2.3 Query Hook Patterns

```typescript
// src/hooks/use-jobs.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Job } from '@/types/database';

// Query keys factory for consistent cache management
export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (filters: JobFilters) => [...jobKeys.lists(), filters] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
};

interface JobFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useJobs(filters: JobFilters = {}) {
  const supabase = createClient();

  return useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.textSearch('search_vector', filters.search);
      }

      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const start = (page - 1) * limit;

      query = query.range(start, start + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        jobs: data as Job[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useJob(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          client:clients(*),
          phases:job_phases(*),
          budget_items:budget_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute for detail views
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (job: Partial<Job>) => {
      const { data, error } = await supabase
        .from('jobs')
        .insert(job)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all job lists
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Job> & { id: string }) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Update the detail cache
      queryClient.setQueryData(jobKeys.detail(variables.id), data);
      // Invalidate list caches
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}
```

### 2.4 Server-Side Caching with Vercel KV

```typescript
// src/lib/cache/kv.ts
import { kv } from '@vercel/kv';

interface CacheOptions {
  ttl?: number; // seconds
  tags?: string[];
}

// Tenant-scoped cache key helper
function tenantKey(companyId: string, key: string): string {
  return `tenant:${companyId}:${key}`;
}

export async function getFromCache<T>(
  companyId: string,
  key: string
): Promise<T | null> {
  try {
    const cachedValue = await kv.get<T>(tenantKey(companyId, key));
    return cachedValue;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setInCache<T>(
  companyId: string,
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  try {
    const fullKey = tenantKey(companyId, key);
    const ttl = options.ttl || 60; // Default 60 seconds

    await kv.set(fullKey, value, { ex: ttl });

    // Track tags for bulk invalidation
    if (options.tags?.length) {
      for (const tag of options.tags) {
        await kv.sadd(`tag:${companyId}:${tag}`, fullKey);
      }
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function invalidateByTag(
  companyId: string,
  tag: string
): Promise<void> {
  try {
    const tagKey = `tag:${companyId}:${tag}`;
    const keys = await kv.smembers(tagKey);

    if (keys.length > 0) {
      await kv.del(...keys);
      await kv.del(tagKey);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

// Cache-through helper for API routes
export async function withCache<T>(
  companyId: string,
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try cache first
  const cached = await getFromCache<T>(companyId, key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache (non-blocking)
  setInCache(companyId, key, data, options).catch(console.error);

  return data;
}
```

### 2.5 In-Memory Fallback Cache

```typescript
// src/lib/cache/memory.ts
// Used when Vercel KV is not available (local development, fallback)

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxSize = 1000;

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    // Evict oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Cleanup expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export const memoryCache = new MemoryCache();

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => memoryCache.cleanup(), 60 * 1000);
}
```

---

## 3. File Storage

### 3.1 Storage Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FILE STORAGE ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Client Upload                    Storage                  Delivery        │
│   ─────────────                   ─────────                ─────────        │
│   ┌─────────────┐                ┌─────────────┐          ┌─────────────┐  │
│   │ Browser     │   Signed URL   │ Supabase    │   CDN    │ Vercel      │  │
│   │ Direct      │───────────────▶│ Storage     │─────────▶│ Edge        │  │
│   │ Upload      │                │ (S3)        │          │ Network     │  │
│   └─────────────┘                └─────────────┘          └─────────────┘  │
│                                                                              │
│   File Types:                    Buckets:                  Transformations: │
│   - Images (JPEG, PNG, WebP)     - documents (private)     - Resize        │
│   - PDFs                         - photos (private)        - Compress      │
│   - Documents (DOC, XLS)         - public-assets           - Format convert│
│   - CAD files                    - temp-uploads                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Storage Bucket Configuration

```sql
-- Storage bucket policies
-- Note: Run these in Supabase Dashboard or via migration

-- Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('documents', 'documents', false, 52428800, -- 50MB
    ARRAY['application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  ('photos', 'photos', false, 20971520, -- 20MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  ('temp-uploads', 'temp-uploads', false, 104857600, NULL), -- 100MB, any type
  ('public-assets', 'public-assets', true, 5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']);

-- RLS Policies for documents bucket
CREATE POLICY "Users can upload to their company folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can read from their company folder"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete from their company folder"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text FROM users WHERE id = auth.uid()
    )
  );
```

### 3.3 File Upload Component

```typescript
// src/components/file-upload.tsx
'use client';

import { useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  bucket: 'documents' | 'photos' | 'temp-uploads';
  folder?: string;
  maxSize?: number; // bytes
  accept?: Record<string, string[]>;
  onUploadComplete?: (files: UploadedFile[]) => void;
  onError?: (error: Error) => void;
  multiple?: boolean;
}

interface UploadedFile {
  name: string;
  path: string;
  url: string;
  size: number;
  type: string;
}

export function FileUpload({
  bucket,
  folder = '',
  maxSize = 52428800, // 50MB default
  accept,
  onUploadComplete,
  onError,
  multiple = true,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const supabase = createClient();

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    // Generate unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = folder ? `${folder}/${timestamp}-${safeName}` : `${timestamp}-${safeName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL (or signed URL for private buckets)
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      name: file.name,
      path: data.path,
      url: urlData.publicUrl,
      size: file.size,
      type: file.type,
    };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setProgress(0);

    try {
      const uploadedFiles: UploadedFile[] = [];

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const uploaded = await uploadFile(file);
        uploadedFiles.push(uploaded);
        setProgress(((i + 1) / acceptedFiles.length) * 100);
      }

      onUploadComplete?.(uploadedFiles);
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [bucket, folder, onUploadComplete, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept,
    multiple,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
        ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}
      `}
    >
      <input {...getInputProps()} />

      {uploading ? (
        <div>
          <div className="w-full bg-muted rounded-full h-2 mb-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">Uploading... {Math.round(progress)}%</p>
        </div>
      ) : isDragActive ? (
        <p>Drop files here...</p>
      ) : (
        <div>
          <p className="mb-2">Drag & drop files here, or click to select</p>
          <p className="text-sm text-muted-foreground">
            Max file size: {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
      )}
    </div>
  );
}
```

### 3.4 Image Optimization

```typescript
// src/lib/storage/image.ts
import { createClient } from '@/lib/supabase/server';

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'origin' | 'avif' | 'webp';
  resize?: 'cover' | 'contain' | 'fill';
}

export function getOptimizedImageUrl(
  bucket: string,
  path: string,
  options: ImageTransformOptions = {}
): string {
  const supabase = createClient();

  const { data } = supabase.storage.from(bucket).getPublicUrl(path, {
    transform: {
      width: options.width,
      height: options.height,
      quality: options.quality || 80,
      format: options.format || 'webp',
      resize: options.resize || 'cover',
    },
  });

  return data.publicUrl;
}

// Pre-defined image sizes
export const imageSizes = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 300 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 },
  original: {},
} as const;

export function getResponsiveImageUrls(bucket: string, path: string) {
  return {
    thumbnail: getOptimizedImageUrl(bucket, path, imageSizes.thumbnail),
    small: getOptimizedImageUrl(bucket, path, imageSizes.small),
    medium: getOptimizedImageUrl(bucket, path, imageSizes.medium),
    large: getOptimizedImageUrl(bucket, path, imageSizes.large),
    original: getOptimizedImageUrl(bucket, path, imageSizes.original),
  };
}
```

---

## 4. PDF Generation

### 4.1 PDF Generation Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PDF GENERATION ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Template Types          Generation Method          Output                  │
│   ──────────────         ─────────────────          ──────                  │
│                                                                              │
│   1. Simple Forms         React-PDF                  Streamed PDF           │
│      - Invoices           ┌──────────────┐          ┌────────────┐         │
│      - Receipts           │ @react-pdf/  │─────────▶│ Browser    │         │
│      - Change Orders      │ renderer     │          │ Download   │         │
│                           └──────────────┘          └────────────┘         │
│                                                                              │
│   2. Complex Reports      Puppeteer/Playwright      Async Generation        │
│      - AIA G702/G703      ┌──────────────┐          ┌────────────┐         │
│      - Lien Waivers       │ HTML/CSS     │─────────▶│ Storage    │         │
│      - Proposals          │ to PDF       │          │ + Email    │         │
│                           └──────────────┘          └────────────┘         │
│                                                                              │
│   3. Photo Reports        Image Processing          Batched Generation      │
│      - Daily Logs         ┌──────────────┐          ┌────────────┐         │
│      - Progress Photos    │ Sharp +      │─────────▶│ Job Queue  │         │
│      - Punch Lists        │ PDFKit       │          │            │         │
│                           └──────────────┘          └────────────┘         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 React-PDF Invoice Template

```typescript
// src/lib/pdf/templates/invoice.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 120,
    color: '#6b7280',
  },
  value: {
    flex: 1,
    color: '#1a1a1a',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #e5e7eb',
  },
  tableCell: {
    flex: 1,
  },
  tableCellAmount: {
    width: 80,
    textAlign: 'right',
  },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  totalLabel: {
    width: 120,
    textAlign: 'right',
    marginRight: 10,
  },
  totalValue: {
    width: 80,
    textAlign: 'right',
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    paddingTop: 8,
    borderTop: '2px solid #1a1a1a',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logoUrl?: string;
  };
  client: {
    name: string;
    address: string;
    email: string;
  };
  job: {
    name: string;
    address: string;
  };
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

export function InvoicePDF({ data }: { data: InvoiceData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {data.company.logoUrl && (
              <Image src={data.company.logoUrl} style={styles.logo} />
            )}
            <Text style={{ marginTop: 8 }}>{data.company.name}</Text>
            <Text>{data.company.address}</Text>
            <Text>{data.company.phone}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={{ marginTop: 8 }}>#{data.invoiceNumber}</Text>
            <Text>Date: {data.date}</Text>
            <Text>Due: {data.dueDate}</Text>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={{ fontWeight: 'bold' }}>{data.client.name}</Text>
          <Text>{data.client.address}</Text>
          <Text>{data.client.email}</Text>
        </View>

        {/* Project */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project</Text>
          <Text style={{ fontWeight: 'bold' }}>{data.job.name}</Text>
          <Text>{data.job.address}</Text>
        </View>

        {/* Line Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Description</Text>
            <Text style={styles.tableCellAmount}>Qty</Text>
            <Text style={styles.tableCellAmount}>Unit Price</Text>
            <Text style={styles.tableCellAmount}>Amount</Text>
          </View>
          {data.lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.description}</Text>
              <Text style={styles.tableCellAmount}>{item.quantity}</Text>
              <Text style={styles.tableCellAmount}>
                ${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.tableCellAmount}>
                ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              ${data.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax:</Text>
            <Text style={styles.totalValue}>
              ${data.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabel}>Total Due:</Text>
            <Text style={styles.totalValue}>
              ${data.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={[styles.section, { marginTop: 30 }]}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for your business! Payment is due within 30 days.
        </Text>
      </Page>
    </Document>
  );
}
```

### 4.3 PDF Generation API

```typescript
// src/app/api/pdf/invoice/[id]/route.ts
import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { InvoicePDF } from '@/lib/pdf/templates/invoice';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch invoice data
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      job:jobs(*),
      client:clients(*),
      line_items:invoice_line_items(*),
      company:companies(*)
    `)
    .eq('id', params.id)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  // Transform data for PDF template
  const pdfData = {
    invoiceNumber: invoice.invoice_number,
    date: new Date(invoice.invoice_date).toLocaleDateString(),
    dueDate: new Date(invoice.due_date).toLocaleDateString(),
    company: {
      name: invoice.company.name,
      address: invoice.company.address,
      phone: invoice.company.phone,
      email: invoice.company.email,
      logoUrl: invoice.company.logo_url,
    },
    client: {
      name: invoice.client.name,
      address: invoice.client.address,
      email: invoice.client.email,
    },
    job: {
      name: invoice.job.name,
      address: invoice.job.address,
    },
    lineItems: invoice.line_items.map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      amount: item.amount,
    })),
    subtotal: invoice.subtotal,
    tax: invoice.tax_amount,
    total: invoice.total,
    notes: invoice.notes,
  };

  // Generate PDF stream
  const stream = await renderToStream(<InvoicePDF data={pdfData} />);

  // Return PDF response
  return new Response(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Invoice-${invoice.invoice_number}.pdf"`,
    },
  });
}
```

### 4.4 Complex PDF with Puppeteer (Edge Function)

```typescript
// supabase/functions/generate-pdf/index.ts
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

Deno.serve(async (req) => {
  const { templateUrl, data, filename } = await req.json();

  // Launch browser
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  // Navigate to template URL with data
  await page.goto(`${templateUrl}?data=${encodeURIComponent(JSON.stringify(data))}`, {
    waitUntil: 'networkidle0',
  });

  // Generate PDF
  const pdf = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0.5in',
      bottom: '0.5in',
      left: '0.5in',
      right: '0.5in',
    },
  });

  await browser.close();

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}.pdf"`,
    },
  });
});
```

---

## 5. Background Jobs

### 5.1 Job Queue Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKGROUND JOB SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Job Types                    Processing                 Scheduling         │
│   ─────────                   ──────────                 ──────────         │
│   ┌─────────────┐             ┌─────────────┐            ┌─────────────┐   │
│   │ Immediate   │─────────────│ Database    │◄───────────│ Vercel      │   │
│   │ (send email)│             │ Queue       │            │ Cron        │   │
│   ├─────────────┤             │ (job_queue) │            │             │   │
│   │ Scheduled   │─────────────│             │            │ Intervals:  │   │
│   │ (reports)   │             │ Workers:    │            │ - 1 min     │   │
│   ├─────────────┤             │ - Edge Fn   │            │ - 5 min     │   │
│   │ Recurring   │─────────────│ - API Route │            │ - Hourly    │   │
│   │ (backups)   │             │             │            │ - Daily     │   │
│   └─────────────┘             └─────────────┘            └─────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Job Queue Table

```sql
-- Job queue table (from infrastructure setup)
CREATE TABLE IF NOT EXISTS job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  job_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  priority INT DEFAULT 0,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient job processing
CREATE INDEX idx_job_queue_pending ON job_queue(scheduled_for)
  WHERE status = 'pending';
CREATE INDEX idx_job_queue_company ON job_queue(company_id, status);

-- Function to claim a job for processing
CREATE OR REPLACE FUNCTION claim_job(p_job_types TEXT[] DEFAULT NULL)
RETURNS job_queue AS $$
DECLARE
  v_job job_queue;
BEGIN
  UPDATE job_queue
  SET
    status = 'processing',
    started_at = NOW(),
    attempts = attempts + 1,
    updated_at = NOW()
  WHERE id = (
    SELECT id FROM job_queue
    WHERE status = 'pending'
      AND scheduled_for <= NOW()
      AND attempts < max_attempts
      AND (p_job_types IS NULL OR job_type = ANY(p_job_types))
    ORDER BY priority DESC, scheduled_for ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  RETURNING * INTO v_job;

  RETURN v_job;
END;
$$ LANGUAGE plpgsql;
```

### 5.3 Job Types and Handlers

```typescript
// src/lib/jobs/types.ts
export type JobType =
  | 'send_email'
  | 'generate_pdf'
  | 'sync_quickbooks'
  | 'process_import'
  | 'daily_digest'
  | 'cleanup_temp_files'
  | 'generate_report';

export interface JobPayload {
  send_email: {
    to: string;
    template: string;
    data: Record<string, unknown>;
  };
  generate_pdf: {
    template: string;
    data: Record<string, unknown>;
    outputPath: string;
  };
  sync_quickbooks: {
    entityType: 'invoice' | 'customer' | 'vendor';
    entityId: string;
    action: 'create' | 'update' | 'delete';
  };
  process_import: {
    fileUrl: string;
    importType: string;
    mappings: Record<string, string>;
  };
  daily_digest: {
    companyId: string;
    recipientIds: string[];
  };
  cleanup_temp_files: {
    olderThan: string; // ISO date
  };
  generate_report: {
    reportType: string;
    parameters: Record<string, unknown>;
    outputFormat: 'pdf' | 'xlsx' | 'csv';
  };
}

// src/lib/jobs/handlers.ts
import { JobType, JobPayload } from './types';

type JobHandler<T extends JobType> = (
  payload: JobPayload[T],
  context: { jobId: string; companyId: string | null; attempt: number }
) => Promise<unknown>;

const handlers: { [K in JobType]: JobHandler<K> } = {
  send_email: async (payload, context) => {
    const { sendEmail } = await import('@/lib/email');
    return sendEmail(payload.to, payload.template, payload.data);
  },

  generate_pdf: async (payload, context) => {
    const { generatePDF } = await import('@/lib/pdf');
    return generatePDF(payload.template, payload.data, payload.outputPath);
  },

  sync_quickbooks: async (payload, context) => {
    const { syncToQuickBooks } = await import('@/lib/integrations/quickbooks');
    return syncToQuickBooks(payload.entityType, payload.entityId, payload.action);
  },

  process_import: async (payload, context) => {
    const { processImport } = await import('@/lib/import');
    return processImport(payload.fileUrl, payload.importType, payload.mappings);
  },

  daily_digest: async (payload, context) => {
    const { sendDailyDigest } = await import('@/lib/notifications');
    return sendDailyDigest(payload.companyId, payload.recipientIds);
  },

  cleanup_temp_files: async (payload, context) => {
    const { cleanupTempFiles } = await import('@/lib/storage');
    return cleanupTempFiles(new Date(payload.olderThan));
  },

  generate_report: async (payload, context) => {
    const { generateReport } = await import('@/lib/reports');
    return generateReport(payload.reportType, payload.parameters, payload.outputFormat);
  },
};

export async function processJob<T extends JobType>(
  jobType: T,
  payload: JobPayload[T],
  context: { jobId: string; companyId: string | null; attempt: number }
): Promise<unknown> {
  const handler = handlers[jobType];
  if (!handler) {
    throw new Error(`Unknown job type: ${jobType}`);
  }
  return handler(payload, context);
}
```

### 5.4 Job Queue API

```typescript
// src/lib/jobs/queue.ts
import { createClient } from '@/lib/supabase/server';
import { JobType, JobPayload } from './types';

interface EnqueueOptions {
  priority?: number;
  scheduledFor?: Date;
  maxAttempts?: number;
  companyId?: string;
}

export async function enqueueJob<T extends JobType>(
  jobType: T,
  payload: JobPayload[T],
  options: EnqueueOptions = {}
): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('job_queue')
    .insert({
      job_type: jobType,
      payload,
      company_id: options.companyId,
      priority: options.priority || 0,
      scheduled_for: options.scheduledFor?.toISOString() || new Date().toISOString(),
      max_attempts: options.maxAttempts || 3,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getJobStatus(jobId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('job_queue')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) throw error;
  return data;
}
```

### 5.5 Job Worker (Cron Endpoint)

```typescript
// src/app/api/cron/process-jobs/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processJob } from '@/lib/jobs/handlers';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const processedJobs: string[] = [];
  const errors: Array<{ jobId: string; error: string }> = [];

  // Process up to 10 jobs per invocation
  for (let i = 0; i < 10; i++) {
    // Claim a job
    const { data: job, error: claimError } = await supabase
      .rpc('claim_job')
      .single();

    if (claimError || !job) {
      // No more jobs to process
      break;
    }

    try {
      // Process the job
      const result = await processJob(
        job.job_type,
        job.payload,
        {
          jobId: job.id,
          companyId: job.company_id,
          attempt: job.attempts,
        }
      );

      // Mark as completed
      await supabase
        .from('job_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          result,
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      processedJobs.push(job.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Update job with error
      const newStatus = job.attempts >= job.max_attempts ? 'failed' : 'pending';

      await supabase
        .from('job_queue')
        .update({
          status: newStatus,
          error: errorMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      errors.push({ jobId: job.id, error: errorMessage });
    }
  }

  return NextResponse.json({
    processed: processedJobs.length,
    processedJobs,
    errors,
  });
}
```

---

## 6. Real-Time Features

### 6.1 Supabase Realtime Configuration

```typescript
// src/lib/realtime/client.ts
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type SubscriptionCallback<T> = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T | null;
  old: T | null;
}) => void;

export function subscribeToTable<T>(
  table: string,
  callback: SubscriptionCallback<T>,
  filter?: string
): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter,
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as T | null,
          old: payload.old as T | null,
        });
      }
    )
    .subscribe();

  return channel;
}

export function unsubscribe(channel: RealtimeChannel): void {
  const supabase = createClient();
  supabase.removeChannel(channel);
}
```

### 6.2 Real-Time Hook

```typescript
// src/hooks/use-realtime.ts
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeToTable, unsubscribe } from '@/lib/realtime/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeOptions<T> {
  table: string;
  filter?: string;
  queryKey: readonly unknown[];
  onInsert?: (record: T) => void;
  onUpdate?: (record: T, oldRecord: T | null) => void;
  onDelete?: (oldRecord: T) => void;
}

export function useRealtime<T>({
  table,
  filter,
  queryKey,
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeOptions<T>) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    channelRef.current = subscribeToTable<T>(
      table,
      (payload) => {
        // Invalidate query to refetch
        queryClient.invalidateQueries({ queryKey });

        // Call specific handlers
        switch (payload.eventType) {
          case 'INSERT':
            if (payload.new) onInsert?.(payload.new);
            break;
          case 'UPDATE':
            if (payload.new) onUpdate?.(payload.new, payload.old);
            break;
          case 'DELETE':
            if (payload.old) onDelete?.(payload.old);
            break;
        }
      },
      filter
    );

    return () => {
      if (channelRef.current) {
        unsubscribe(channelRef.current);
      }
    };
  }, [table, filter, queryKey, queryClient, onInsert, onUpdate, onDelete]);
}
```

### 6.3 Presence for Collaboration

```typescript
// src/lib/realtime/presence.ts
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceState {
  oderId: string;
  userName: string;
  avatarUrl?: string;
  cursor?: { x: number; y: number };
  lastSeen: string;
}

export function createPresenceChannel(
  roomId: string,
  userState: Omit<PresenceState, 'lastSeen'>
): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase.channel(`presence:${roomId}`, {
    config: {
      presence: { key: userState.userId },
    },
  });

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        ...userState,
        lastSeen: new Date().toISOString(),
      });
    }
  });

  return channel;
}

export function onPresenceSync(
  channel: RealtimeChannel,
  callback: (users: PresenceState[]) => void
) {
  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState<PresenceState>();
    const users = Object.values(state).flat();
    callback(users);
  });
}

export function updatePresence(
  channel: RealtimeChannel,
  updates: Partial<PresenceState>
) {
  channel.track({
    ...updates,
    lastSeen: new Date().toISOString(),
  });
}
```

---

## Summary

This technical architecture document covers:

1. **Search Infrastructure**: PostgreSQL full-text search with pg_trgm for Phase 1, Typesense integration path for Phase 2
2. **Caching Strategy**: React Query client-side, Vercel KV edge cache, with in-memory fallback
3. **File Storage**: Supabase Storage with RLS policies, image optimization, and direct upload
4. **PDF Generation**: React-PDF for simple forms, Puppeteer for complex reports
5. **Background Jobs**: Database-backed queue with Vercel Cron workers
6. **Real-Time Features**: Supabase Realtime for live updates and presence

---

*Last Updated: 2026-02-12*
*Version: 1.0*
