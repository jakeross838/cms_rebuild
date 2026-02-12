# RossOS Mobile App & Offline Mode Strategy

> **Purpose**: Native mobile apps with offline-first architecture for field workers.
>
> **Why Critical**: Construction happens in the field, often with poor connectivity. Field workers need to log daily activities, take photos, and access schedules without reliable internet.

---

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MOBILE & OFFLINE ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│   │   iOS App   │     │ Android App │     │   Web App   │                   │
│   │ (React      │     │ (React      │     │  (Next.js)  │                   │
│   │  Native)    │     │  Native)    │     │             │                   │
│   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘                   │
│          │                   │                   │                          │
│          └───────────────────┼───────────────────┘                          │
│                              │                                              │
│                    ┌─────────▼─────────┐                                    │
│                    │   Shared Logic    │                                    │
│                    │   (TypeScript)    │                                    │
│                    └─────────┬─────────┘                                    │
│                              │                                              │
│          ┌───────────────────┼───────────────────┐                          │
│          │                   │                   │                          │
│   ┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐                   │
│   │ Local DB    │     │ Sync Engine │     │   API       │                   │
│   │ (SQLite/    │     │ (Conflict   │     │ (Supabase)  │                   │
│   │  WatermelonDB)    │  Resolution)│     │             │                   │
│   └─────────────┘     └─────────────┘     └─────────────┘                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 23: Mobile App Foundation

**Priority**: P1 - High demand from field workers
**Timeline**: After Phase 8 or parallel development

### 23.1 Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | React Native + Expo | Code sharing with web, large ecosystem |
| Local DB | WatermelonDB | High-performance, lazy-loading, sync-ready |
| State | Zustand + React Query | Lightweight, offline-compatible |
| Navigation | React Navigation | Industry standard |
| UI Kit | React Native Paper / Tamagui | Cross-platform components |
| Push | Expo Notifications + FCM/APNs | Unified push infrastructure |
| Maps | React Native Maps | Job site locations |
| Camera | Expo Camera + Image Picker | Photo documentation |
| Offline Sync | Custom + WatermelonDB Sync | Conflict resolution |

### 23.2 App Structure

```
mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab navigator
│   │   ├── index.tsx             # Dashboard
│   │   ├── jobs/
│   │   │   ├── index.tsx         # Jobs list
│   │   │   └── [id]/
│   │   │       ├── index.tsx     # Job detail
│   │   │       ├── daily-log.tsx
│   │   │       ├── photos.tsx
│   │   │       ├── schedule.tsx
│   │   │       └── punch-list.tsx
│   │   ├── camera.tsx            # Quick photo capture
│   │   └── profile.tsx
│   └── _layout.tsx               # Root layout
├── components/
│   ├── ui/                       # Shared UI components
│   ├── forms/                    # Form components
│   └── sync/                     # Sync status indicators
├── db/
│   ├── schema.ts                 # WatermelonDB schema
│   ├── models/                   # Model classes
│   └── sync.ts                   # Sync engine
├── hooks/
├── lib/
│   ├── api.ts                    # API client
│   ├── auth.ts                   # Auth helpers
│   └── offline.ts                # Offline utilities
└── stores/                       # Zustand stores
```

### 23.3 Mobile-Specific Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Quick Photo Capture | Camera button always accessible, auto-tag with job/location | P0 |
| Daily Log Entry | Simplified form for field conditions, crews, notes | P0 |
| Punch List Walkthrough | Photo + annotation for each item | P0 |
| Offline Schedule View | Access schedule without connectivity | P0 |
| Push Notifications | New tasks, approvals needed, schedule changes | P0 |
| GPS Job Check-in | Auto-detect arrival at job site | P1 |
| Voice Notes | Dictate notes, transcribe with AI | P1 |
| Barcode/QR Scanning | Material tracking, equipment check-in | P1 |
| Digital Signatures | Client approvals, delivery receipts | P1 |
| Time Tracking | Clock in/out with GPS verification | P1 |

### 23.4 Database Schema - Mobile-Specific

```sql
-- Server-side tables for mobile support

CREATE TABLE mobile_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Device Info
    device_id TEXT NOT NULL,                  -- Unique device identifier
    device_type TEXT NOT NULL,                -- ios, android
    device_name TEXT,
    os_version TEXT,
    app_version TEXT,

    -- Push Notifications
    push_token TEXT,
    push_provider TEXT,                       -- apns, fcm

    -- Status
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, device_id)
);

ALTER TABLE mobile_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mobile_devices_tenant" ON mobile_devices FOR ALL
    USING (company_id = get_current_company_id());
CREATE INDEX idx_mobile_devices_user_id ON mobile_devices(user_id);
CREATE INDEX idx_mobile_devices_push_token ON mobile_devices(push_token);

CREATE TABLE push_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Target
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES mobile_devices(id) ON DELETE CASCADE,

    -- Content
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB,                               -- Custom payload

    -- Categorization
    notification_type TEXT NOT NULL,          -- task, approval, schedule, message, alert
    priority TEXT DEFAULT 'normal',           -- low, normal, high, critical

    -- Reference
    entity_type TEXT,
    entity_id UUID,
    job_id UUID REFERENCES jobs(id),

    -- Delivery Status
    status TEXT DEFAULT 'pending',            -- pending, sent, delivered, failed, read
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    failed_reason TEXT,

    -- Provider Response
    provider_message_id TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE push_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "push_notifications_tenant" ON push_notifications FOR ALL
    USING (company_id = get_current_company_id());
CREATE INDEX idx_push_notifications_user_id ON push_notifications(user_id);
CREATE INDEX idx_push_notifications_status ON push_notifications(status);

CREATE TABLE offline_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES mobile_devices(id) ON DELETE CASCADE,

    -- Sync Info
    sync_type TEXT NOT NULL,                  -- full, incremental, push, pull
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,

    -- Statistics
    records_pulled INT DEFAULT 0,
    records_pushed INT DEFAULT 0,
    conflicts_resolved INT DEFAULT 0,
    errors INT DEFAULT 0,

    -- Details
    tables_synced TEXT[],
    error_details JSONB,

    -- Last Sync Positions
    last_pulled_at TIMESTAMPTZ,
    last_pushed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE offline_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "offline_sync_log_tenant" ON offline_sync_log FOR ALL
    USING (company_id = get_current_company_id());
CREATE INDEX idx_offline_sync_log_device ON offline_sync_log(device_id);

-- Add sync tracking columns to synced tables
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS
    _synced_at TIMESTAMPTZ,
    _local_id TEXT,
    _is_dirty BOOLEAN DEFAULT false;

ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS
    _synced_at TIMESTAMPTZ,
    _local_id TEXT,
    _is_dirty BOOLEAN DEFAULT false;

ALTER TABLE photos ADD COLUMN IF NOT EXISTS
    _synced_at TIMESTAMPTZ,
    _local_id TEXT,
    _is_dirty BOOLEAN DEFAULT false,
    _upload_status TEXT DEFAULT 'pending';     -- pending, uploading, uploaded, failed

ALTER TABLE punch_list_items ADD COLUMN IF NOT EXISTS
    _synced_at TIMESTAMPTZ,
    _local_id TEXT,
    _is_dirty BOOLEAN DEFAULT false;

-- GPS location tracking for time tracking
CREATE TABLE location_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES mobile_devices(id),

    -- Location
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(10, 2),                  -- Meters
    altitude DECIMAL(10, 2),

    -- Context
    event_type TEXT,                          -- check_in, check_out, location_update
    job_id UUID REFERENCES jobs(id),

    -- Metadata
    recorded_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE location_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "location_logs_tenant" ON location_logs FOR ALL
    USING (company_id = get_current_company_id());
CREATE INDEX idx_location_logs_user_recorded ON location_logs(user_id, recorded_at DESC);
```

---

## Phase 24: Offline-First Architecture

**Priority**: P0 for mobile, P2 for web
**Timeline**: Build with Phase 23

### 24.1 Offline Sync Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OFFLINE SYNC FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   USER ACTION                                                                │
│       │                                                                      │
│       ▼                                                                      │
│   ┌─────────────────┐                                                        │
│   │ Write to Local  │  ← Always write locally first                         │
│   │ Database        │                                                        │
│   └────────┬────────┘                                                        │
│            │                                                                 │
│            ▼                                                                 │
│   ┌─────────────────┐     ┌─────────────────┐                               │
│   │ Mark as Dirty   │────▶│ Add to Sync     │                               │
│   │ (_is_dirty=true)│     │ Queue           │                               │
│   └─────────────────┘     └────────┬────────┘                               │
│                                    │                                         │
│                           ┌────────▼────────┐                               │
│                           │ Online?         │                               │
│                           └────────┬────────┘                               │
│                                    │                                         │
│              ┌─────────────────────┼─────────────────────┐                  │
│              │ YES                 │                 NO  │                  │
│              ▼                     │                     ▼                  │
│   ┌─────────────────┐              │          ┌─────────────────┐           │
│   │ Push Changes    │              │          │ Queue for Later │           │
│   │ to Server       │              │          │ (Background)    │           │
│   └────────┬────────┘              │          └─────────────────┘           │
│            │                       │                                         │
│            ▼                       │                                         │
│   ┌─────────────────┐              │                                         │
│   │ Server Accepts  │              │                                         │
│   │ or Rejects      │              │                                         │
│   └────────┬────────┘              │                                         │
│            │                       │                                         │
│   ┌────────┴────────┐              │                                         │
│   │ CONFLICT?       │              │                                         │
│   └────────┬────────┘              │                                         │
│            │                       │                                         │
│   ┌────────┴────────┐              │                                         │
│   │YES          NO  │              │                                         │
│   │                 │              │                                         │
│   ▼                 ▼              │                                         │
│ ┌───────────┐  ┌───────────┐       │                                         │
│ │ Resolve   │  │ Mark as   │       │                                         │
│ │ Conflict  │  │ Synced    │       │                                         │
│ └───────────┘  └───────────┘       │                                         │
│                                    │                                         │
└────────────────────────────────────┴─────────────────────────────────────────┘
```

### 24.2 Conflict Resolution Strategies

| Entity Type | Strategy | Rationale |
|-------------|----------|-----------|
| Daily Logs | **Last Write Wins** with merge | Multiple people rarely edit same log |
| Photos | **Client Wins** | Photos are append-only, never edited |
| Punch List Items | **Server Wins** with notification | Status changes need coordination |
| Schedule Items | **Server Wins** | PM is source of truth |
| Notes | **Create Both** | Keep all notes, let user clean up |
| Time Entries | **Client Wins** | Device has accurate timestamps |

### 24.3 WatermelonDB Schema (Mobile Local DB)

```typescript
// mobile/db/schema.ts
import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
  version: 1,
  tables: [
    // Jobs (read-heavy, sync from server)
    tableSchema({
      name: 'jobs',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'company_id', type: 'string', isIndexed: true },
        { name: 'job_number', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'address_line1', type: 'string', isOptional: true },
        { name: 'city', type: 'string', isOptional: true },
        { name: 'state', type: 'string', isOptional: true },
        { name: 'latitude', type: 'number', isOptional: true },
        { name: 'longitude', type: 'number', isOptional: true },
        { name: 'primary_pm_id', type: 'string', isOptional: true },
        // Sync metadata
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_dirty', type: 'boolean' },
        { name: 'server_updated_at', type: 'number' },
      ],
    }),

    // Daily Logs (write-heavy, created offline)
    tableSchema({
      name: 'daily_logs',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'job_id', type: 'string', isIndexed: true },
        { name: 'company_id', type: 'string', isIndexed: true },
        { name: 'log_date', type: 'number', isIndexed: true },
        // Weather
        { name: 'weather_condition', type: 'string', isOptional: true },
        { name: 'temperature_high', type: 'number', isOptional: true },
        { name: 'temperature_low', type: 'number', isOptional: true },
        // Content
        { name: 'work_performed', type: 'string', isOptional: true },
        { name: 'delays', type: 'string', isOptional: true },
        { name: 'safety_notes', type: 'string', isOptional: true },
        // Status
        { name: 'status', type: 'string' },
        // Sync
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_dirty', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Daily Log Crews
    tableSchema({
      name: 'daily_log_crews',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'daily_log_id', type: 'string', isIndexed: true },
        { name: 'company_id', type: 'string' },
        { name: 'vendor_id', type: 'string', isOptional: true },
        { name: 'trade', type: 'string', isOptional: true },
        { name: 'worker_count', type: 'number' },
        { name: 'hours_worked', type: 'number', isOptional: true },
        { name: 'work_description', type: 'string', isOptional: true },
        // Sync
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_dirty', type: 'boolean' },
      ],
    }),

    // Photos (created offline, uploaded when online)
    tableSchema({
      name: 'photos',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'job_id', type: 'string', isIndexed: true },
        { name: 'company_id', type: 'string', isIndexed: true },
        { name: 'daily_log_id', type: 'string', isOptional: true },
        // Local file
        { name: 'local_uri', type: 'string' },
        { name: 'file_url', type: 'string', isOptional: true },
        { name: 'thumbnail_url', type: 'string', isOptional: true },
        // Metadata
        { name: 'title', type: 'string', isOptional: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'taken_at', type: 'number' },
        { name: 'latitude', type: 'number', isOptional: true },
        { name: 'longitude', type: 'number', isOptional: true },
        { name: 'location_name', type: 'string', isOptional: true },
        { name: 'phase', type: 'string', isOptional: true },
        // Upload status
        { name: 'upload_status', type: 'string' }, // pending, uploading, uploaded, failed
        { name: 'upload_progress', type: 'number', isOptional: true },
        { name: 'upload_error', type: 'string', isOptional: true },
        // Sync
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_dirty', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),

    // Punch List Items
    tableSchema({
      name: 'punch_list_items',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'punch_list_id', type: 'string', isIndexed: true },
        { name: 'job_id', type: 'string', isIndexed: true },
        { name: 'company_id', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'location', type: 'string', isOptional: true },
        { name: 'area', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'priority', type: 'string' },
        { name: 'assigned_vendor_id', type: 'string', isOptional: true },
        { name: 'due_date', type: 'number', isOptional: true },
        { name: 'completed_date', type: 'number', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        // Sync
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_dirty', type: 'boolean' },
        { name: 'server_updated_at', type: 'number', isOptional: true },
      ],
    }),

    // Schedule Items (read-mostly)
    tableSchema({
      name: 'schedule_items',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'job_id', type: 'string', isIndexed: true },
        { name: 'company_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'item_type', type: 'string' },
        { name: 'planned_start', type: 'number', isOptional: true },
        { name: 'planned_end', type: 'number', isOptional: true },
        { name: 'actual_start', type: 'number', isOptional: true },
        { name: 'actual_end', type: 'number', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'percent_complete', type: 'number' },
        { name: 'assigned_vendor_id', type: 'string', isOptional: true },
        { name: 'sort_order', type: 'number' },
        // Sync
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'server_updated_at', type: 'number' },
      ],
    }),

    // Vendors (reference data, read-only on mobile)
    tableSchema({
      name: 'vendors',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'company_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'vendor_type', type: 'string' },
        { name: 'phone', type: 'string', isOptional: true },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'trade_categories', type: 'string', isOptional: true }, // JSON array
        // Sync
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'server_updated_at', type: 'number' },
      ],
    }),

    // Time Entries (created offline)
    tableSchema({
      name: 'time_entries',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'job_id', type: 'string', isIndexed: true },
        { name: 'company_id', type: 'string' },
        { name: 'clock_in', type: 'number' },
        { name: 'clock_out', type: 'number', isOptional: true },
        { name: 'clock_in_latitude', type: 'number', isOptional: true },
        { name: 'clock_in_longitude', type: 'number', isOptional: true },
        { name: 'clock_out_latitude', type: 'number', isOptional: true },
        { name: 'clock_out_longitude', type: 'number', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'status', type: 'string' }, // active, completed, submitted
        // Sync
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_dirty', type: 'boolean' },
      ],
    }),

    // Sync Queue (pending changes)
    tableSchema({
      name: 'sync_queue',
      columns: [
        { name: 'table_name', type: 'string', isIndexed: true },
        { name: 'record_id', type: 'string' },
        { name: 'operation', type: 'string' }, // create, update, delete
        { name: 'payload', type: 'string' }, // JSON
        { name: 'priority', type: 'number' },
        { name: 'attempts', type: 'number' },
        { name: 'last_attempt_at', type: 'number', isOptional: true },
        { name: 'error', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
})
```

### 24.4 Sync Engine Implementation

```typescript
// mobile/db/sync.ts
import { synchronize } from '@nozbe/watermelondb/sync'
import { database } from './database'
import { api } from '../lib/api'

interface SyncConfig {
  tables: string[]
  batchSize: number
  conflictStrategy: 'server_wins' | 'client_wins' | 'last_write_wins'
}

const SYNC_CONFIG: Record<string, SyncConfig> = {
  jobs: {
    tables: ['jobs'],
    batchSize: 100,
    conflictStrategy: 'server_wins',
  },
  daily_logs: {
    tables: ['daily_logs', 'daily_log_crews'],
    batchSize: 50,
    conflictStrategy: 'last_write_wins',
  },
  photos: {
    tables: ['photos'],
    batchSize: 20,
    conflictStrategy: 'client_wins',
  },
  punch_lists: {
    tables: ['punch_list_items'],
    batchSize: 100,
    conflictStrategy: 'server_wins',
  },
  schedule: {
    tables: ['schedule_items'],
    batchSize: 200,
    conflictStrategy: 'server_wins',
  },
  time_entries: {
    tables: ['time_entries'],
    batchSize: 50,
    conflictStrategy: 'client_wins',
  },
}

export async function syncDatabase() {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
      const response = await api.post('/api/mobile/sync/pull', {
        lastPulledAt,
        schemaVersion,
        tables: Object.keys(SYNC_CONFIG),
      })

      return {
        changes: response.data.changes,
        timestamp: response.data.timestamp,
      }
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      // Upload photos first (they're referenced by other records)
      await uploadPendingPhotos()

      // Then push other changes
      await api.post('/api/mobile/sync/push', {
        changes,
        lastPulledAt,
      })
    },
    migrationsEnabledAtVersion: 1,
  })
}

async function uploadPendingPhotos() {
  const photos = await database
    .get('photos')
    .query(Q.where('upload_status', 'pending'))
    .fetch()

  for (const photo of photos) {
    try {
      await photo.update((p) => {
        p.upload_status = 'uploading'
      })

      const uploadResult = await uploadPhotoToStorage(photo.local_uri)

      await photo.update((p) => {
        p.file_url = uploadResult.url
        p.thumbnail_url = uploadResult.thumbnailUrl
        p.upload_status = 'uploaded'
        p.is_dirty = true // Will be synced in pushChanges
      })
    } catch (error) {
      await photo.update((p) => {
        p.upload_status = 'failed'
        p.upload_error = error.message
      })
    }
  }
}

// Background sync
export function startBackgroundSync(intervalMs: number = 30000) {
  let syncInProgress = false

  const sync = async () => {
    if (syncInProgress) return

    const isOnline = await checkConnectivity()
    if (!isOnline) return

    syncInProgress = true
    try {
      await syncDatabase()
    } catch (error) {
      console.error('Background sync failed:', error)
    } finally {
      syncInProgress = false
    }
  }

  // Initial sync
  sync()

  // Periodic sync
  return setInterval(sync, intervalMs)
}
```

### 24.5 Sync API Endpoints

```sql
-- Server-side sync tracking
CREATE TABLE sync_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES mobile_devices(id) ON DELETE CASCADE,

    -- Checkpoint per table
    table_name TEXT NOT NULL,
    last_pulled_at TIMESTAMPTZ,
    last_pushed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(device_id, table_name)
);

CREATE TABLE sync_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES mobile_devices(id),

    -- Conflict Info
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,

    -- Versions
    client_version JSONB NOT NULL,
    server_version JSONB NOT NULL,

    -- Resolution
    resolution TEXT,                          -- server_wins, client_wins, merged, manual
    resolved_version JSONB,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API Endpoints:**
```
POST /api/mobile/sync/pull     -- Get changes since last sync
POST /api/mobile/sync/push     -- Push local changes
POST /api/mobile/sync/status   -- Get sync status
POST /api/mobile/photos/upload -- Upload photo (multipart)
```

---

## Phase 25: Push Notifications

**Priority**: P0 for mobile engagement
**Timeline**: Build with Phase 23

### 25.1 Notification Types

| Type | Trigger | Priority | Actions |
|------|---------|----------|---------|
| **Task Assigned** | New task assigned to user | High | View Task |
| **Approval Needed** | CO, selection, or draw needs approval | High | Approve/Reject |
| **Schedule Change** | Schedule item date changed | Normal | View Schedule |
| **Inspection Scheduled** | Inspection added/changed | High | View Details |
| **Punch Item Added** | New punch list item | Normal | View Item |
| **Photo Tagged** | User tagged in photo | Low | View Photo |
| **Message Received** | New message in thread | Normal | Reply |
| **Daily Log Reminder** | End of day, no log submitted | Normal | Create Log |
| **Insurance Expiring** | Vendor insurance expiring | High | View Vendor |

### 25.2 Push Notification Service

```typescript
// src/lib/push/notification-service.ts
import * as admin from 'firebase-admin'
import * as apn from 'apn'

interface PushPayload {
  userId: string
  title: string
  body: string
  data?: Record<string, any>
  type: string
  priority?: 'low' | 'normal' | 'high'
}

export async function sendPushNotification(payload: PushPayload) {
  const devices = await getActiveDevices(payload.userId)

  const results = await Promise.allSettled(
    devices.map(async (device) => {
      if (device.device_type === 'ios') {
        return sendAPNS(device, payload)
      } else {
        return sendFCM(device, payload)
      }
    })
  )

  // Log results
  await logPushResults(payload, devices, results)

  return results
}

async function sendFCM(device: MobileDevice, payload: PushPayload) {
  const message = {
    token: device.push_token,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: {
      type: payload.type,
      ...payload.data,
    },
    android: {
      priority: payload.priority === 'high' ? 'high' : 'normal',
      notification: {
        channelId: getChannelId(payload.type),
        clickAction: 'OPEN_ACTIVITY',
      },
    },
  }

  return admin.messaging().send(message)
}

async function sendAPNS(device: MobileDevice, payload: PushPayload) {
  const notification = new apn.Notification({
    alert: {
      title: payload.title,
      body: payload.body,
    },
    badge: await getUnreadCount(device.user_id),
    sound: 'default',
    payload: {
      type: payload.type,
      ...payload.data,
    },
    topic: process.env.APNS_BUNDLE_ID,
    pushType: 'alert',
    priority: payload.priority === 'high' ? 10 : 5,
  })

  return apnProvider.send(notification, device.push_token)
}
```

### 25.3 Notification Triggers

```typescript
// src/lib/push/triggers.ts
import { sendPushNotification } from './notification-service'

// Called when a task is assigned
export async function onTaskAssigned(task: Task, assignedUser: User) {
  await sendPushNotification({
    userId: assignedUser.id,
    title: 'New Task Assigned',
    body: `${task.name} on ${task.job.name}`,
    type: 'task_assigned',
    priority: 'high',
    data: {
      taskId: task.id,
      jobId: task.job_id,
    },
  })
}

// Called when approval is needed
export async function onApprovalNeeded(
  entityType: string,
  entity: any,
  approvers: User[]
) {
  for (const approver of approvers) {
    await sendPushNotification({
      userId: approver.id,
      title: 'Approval Needed',
      body: `${entityType}: ${entity.title || entity.name}`,
      type: 'approval_needed',
      priority: 'high',
      data: {
        entityType,
        entityId: entity.id,
        jobId: entity.job_id,
      },
    })
  }
}

// Daily log reminder (scheduled job)
export async function sendDailyLogReminders() {
  const usersWithoutLogs = await getUsersWithoutTodayLog()

  for (const user of usersWithoutLogs) {
    await sendPushNotification({
      userId: user.id,
      title: 'Daily Log Reminder',
      body: 'Don\'t forget to submit your daily log',
      type: 'daily_log_reminder',
      priority: 'normal',
      data: {},
    })
  }
}
```

---

## Implementation Timeline

### Phase 23: Mobile App Foundation (8-10 weeks)

| Week | Tasks |
|------|-------|
| 1-2 | Project setup, Expo config, navigation, auth flow |
| 3-4 | WatermelonDB setup, local schema, basic sync |
| 5-6 | Jobs list/detail, schedule view, offline read |
| 7-8 | Daily log creation, photo capture, offline write |
| 9-10 | Punch list, time tracking, push notifications |

### Phase 24: Offline-First (4-6 weeks)

| Week | Tasks |
|------|-------|
| 1-2 | Sync engine implementation, conflict resolution |
| 3-4 | Background sync, photo upload queue |
| 5-6 | Testing, edge cases, performance optimization |

### Phase 25: Push Notifications (2-3 weeks)

| Week | Tasks |
|------|-------|
| 1 | FCM/APNs setup, device registration |
| 2 | Notification triggers, server-side logic |
| 3 | Rich notifications, action buttons |

---

## Mobile Database Schema Summary

| Table | Purpose | Sync Direction |
|-------|---------|----------------|
| mobile_devices | Device registration | Push only |
| push_notifications | Notification tracking | Push only |
| offline_sync_log | Sync history | Push only |
| sync_checkpoints | Per-device sync state | Pull/Push |
| sync_conflicts | Conflict tracking | Push only |
| location_logs | GPS tracking | Push only |

**New Tables**: 6
**Modified Tables**: 5 (added sync columns)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| App Store Rating | > 4.5 stars |
| Offline Creation Success | > 99% sync without data loss |
| Photo Upload Success | > 98% |
| Sync Latency | < 5 seconds when online |
| Daily Log Completion | +30% vs web-only |
| Field Worker Adoption | > 80% of field staff |

---

*Last Updated: 2026-02-12*
*Version: 1.0*
