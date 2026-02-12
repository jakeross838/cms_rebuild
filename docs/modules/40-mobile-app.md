# Module 40: Mobile App

**Phase:** 5 - Full Platform
**Status:** TODO
**Optional Module:** No -- core platform capability

---

## Overview

Mobile-optimized application for field use covering the PWA vs. native decision,
offline-first architecture, field-optimized UI designed for one-handed operation on job
sites, camera integration for photo documentation, GPS for time tracking and location
verification, barcode/QR scanning, voice-to-text input, and performance optimization for
cellular connections in areas with poor coverage.

The mobile experience is not a scaled-down version of the desktop app. It is a
purpose-built field tool that prioritizes the workflows field personnel actually perform:
daily log entry, photo capture, time clock in/out, punch list inspection, safety
observations, and quick reference to plans and schedules. Features that are primarily
office tasks (estimating, contract drafting, financial reporting) are accessible but not
optimized for mobile.

---

## Gap Items Addressed

| Gap # | Description | Resolution |
|-------|-------------|------------|
| 486 | Native iOS, Native Android, PWA, or React Native -- what is the strategy? | PWA-first with native wrapper (Capacitor) for app store presence and native API access |
| 487 | Offline mode capabilities -- which features work offline, what is the sync strategy? | Offline-first for field workflows; IndexedDB local store with background sync queue |
| 488 | Mobile-specific features: camera, barcode, GPS, voice input | Capacitor native plugins for camera, geolocation, barcode scanner; Web Speech API for voice |
| 489 | Mobile performance on job sites with poor connectivity (data-light mode, background sync) | Aggressive caching, compressed payloads, background sync, data-light mode toggle |
| 490 | Mobile device management for builders issuing company devices | MDM compatibility documentation; no built-in MDM, but support for MobileIron, Jamf, etc. |

---

## Detailed Requirements

### PWA + Native Wrapper Strategy
- **Primary:** Progressive Web App (PWA) accessible via mobile browser
  - Service worker for offline caching and background sync
  - Web app manifest for home screen installation
  - Push notification support via web push API
  - No app store dependency for updates
- **Secondary:** Native wrapper via Capacitor (or similar)
  - Published to Apple App Store and Google Play Store
  - Access to native APIs: camera (full resolution), GPS (background), biometrics, file system
  - Push notifications via APNs / FCM
  - App store presence for discoverability and credibility
- **Shared codebase:** Same React/TypeScript codebase for PWA and native wrapper
- **Update strategy:** PWA updates instantly on reload; native wrapper updates via app store with in-app update prompt

### Offline-First Architecture
- **Offline-capable features** (full functionality without connectivity):
  - Daily log creation and editing
  - Photo capture with metadata (GPS, timestamp, tags)
  - Time clock in/out with GPS
  - Punch list item creation and status updates
  - Safety observation entry
  - Note-taking and voice memos
  - Viewing previously synced project data (schedules, contacts, plans)
- **Online-required features** (graceful degradation when offline):
  - Sending messages and notifications
  - Financial transactions (invoices, payments)
  - Document downloads not previously cached
  - Real-time collaboration features
  - Search across all projects
- **Local storage:** IndexedDB for structured data, Cache API for static assets and documents
- **Sync engine:**
  - Background sync queue: actions taken offline are queued and executed when connectivity returns
  - Conflict resolution: last-write-wins for simple fields; manual merge for complex conflicts (e.g., two people edit same daily log)
  - Sync status indicator: user always knows what has synced and what is pending
  - Retry logic with exponential backoff for failed syncs
  - Sync priority: time-critical items (clock in/out) sync first
- **Pre-caching:** When user opens a project, pre-cache that project's key data for offline use

### Field-Optimized UI
- **One-handed operation:** Primary actions accessible with thumb on a 6" phone screen
  - Bottom navigation bar (not top)
  - Large tap targets (minimum 48x48px, preferred 56x56px)
  - Floating action button (FAB) for primary creation actions
  - Swipe gestures for common actions (swipe to complete, swipe to flag)
- **Glove-friendly:** Large buttons, no precision-required interactions
- **Sunlight-readable:** High contrast mode, dark text on light backgrounds, no thin fonts
- **Minimal typing:** Pre-filled fields, dropdown selections, quick-select options, voice input
- **Context-aware navigation:**
  - Auto-detect current project based on GPS proximity
  - Recent items quick access (last 3 projects, last viewed documents)
  - Role-based home screen: field super sees daily log + schedule; PM sees budget + RFIs
- **Progressive disclosure:** Simple default view with "show more" for detailed entry
- **Orientation:** Portrait-optimized for one-handed use; landscape support for photo review and plan viewing

### Camera Integration
- **Photo capture:** Access device camera directly from any photo-attachment context
  - Daily log photos
  - Punch list documentation
  - Safety observation evidence
  - Progress photos
  - Receipt/invoice capture
- **Auto-metadata:** GPS coordinates, timestamp, compass heading auto-attached to every photo
- **Auto-tagging:** Room/area tag suggested based on GPS location within project site
- **Photo annotation:** Draw on photos to highlight issues (circles, arrows, text overlays)
- **Batch capture:** Take multiple photos in rapid succession, tag and organize afterward
- **Photo quality:** Configurable resolution (high for documentation, compressed for quick notes)
- **Video capture:** Short video clips (30-60 second limit) for walkthrough documentation
- **Document scanning:** Camera-based document scanning with perspective correction (receipts, plan markups, handwritten notes)

### GPS & Location Services
- **Time tracking:** GPS capture at clock in/out for location verification
- **Geofencing:** Auto-detect arrival at job site based on project address
- **Location history:** Breadcrumb trail during work hours (configurable: opt-in per builder)
- **Mileage tracking:** Drive distance between job sites for mileage reimbursement
- **Weather overlay:** Current weather at job site from GPS coordinates
- **Indoor positioning:** Fallback to manual room/floor selection when GPS is unreliable indoors
- **Battery optimization:** GPS accuracy/frequency configurable to balance precision vs. battery life
- **Privacy:** Clear disclosure of location tracking; employee can see their own location data

### Barcode & QR Scanning
- **Equipment checkout:** Scan QR code on tool/equipment to check out or check in
- **Material tracking:** Scan barcode on delivered materials to log receipt
- **Plan reference:** QR codes on printed plans link to digital version for latest revision
- **Safety signage:** QR codes on job site safety signs link to relevant safety procedures
- **Vendor identification:** Scan vendor badge/sticker for quick access to vendor portal

### Voice Input
- **Voice-to-text:** Dictate daily log notes, punch list descriptions, safety observations
- **Web Speech API** for PWA; native speech recognition for Capacitor wrapper
- **Noise tolerance:** Construction site noise filtering (use cloud speech APIs for accuracy)
- **Quick commands:** "New daily log" / "Clock in" / "Take photo" (voice-activated shortcuts)
- **Language support:** English primary, Spanish secondary (field crew language needs)

### Performance Optimization
- **Data-light mode:** Toggle for low-bandwidth conditions
  - Compressed images (thumbnails only, full resolution on demand)
  - Deferred non-essential data loading
  - Text-only mode for critical functions
- **Payload optimization:**
  - Delta sync: only transfer changed data, not full records
  - Compressed API responses (gzip/brotli)
  - Pagination with infinite scroll (not full dataset loads)
- **Asset caching:** Service worker caches static assets aggressively
- **Lazy loading:** Components and data loaded on demand, not at app startup
- **Connection quality detection:** Automatic adjustment of sync frequency and data richness based on connection speed
- **Background sync:** Queued operations processed when connectivity is good, not blocking UI
- **Target performance:** App usable on 3G connection; full functionality on 4G/LTE

### Push Notifications
- **Notification types:** Approval requests, schedule changes, inspection results, safety alerts, message replies
- **Configurable per user:** Choose which notifications to receive as push, email, or both
- **Quiet hours:** No push notifications during off-hours (configurable per user)
- **Action buttons:** Approve/reject directly from notification without opening app
- **Badge count:** Unread notification count on app icon
- **Deep linking:** Tap notification to go directly to relevant screen

### Biometric Authentication
- **Face ID / Touch ID / Fingerprint** for quick app access
- **Session management:** Configurable session duration before re-authentication
- **PIN fallback:** Numeric PIN when biometrics unavailable
- **Secure storage:** Tokens stored in device keychain/keystore

---

## Database Tables

```
offline_sync_queue
  id, user_id, device_id, action_type, entity_type, entity_id,
  payload, status (pending|syncing|synced|conflict|failed),
  created_at, synced_at, retry_count, error_message

device_registrations
  id, user_id, builder_id, device_type (ios|android|pwa),
  device_token, push_token, app_version, os_version,
  last_active_at, is_active, created_at

notification_preferences
  id, user_id, notification_type, channel (push|email|sms|in_app),
  is_enabled, quiet_hours_start, quiet_hours_end

user_locations
  id, user_id, latitude, longitude, accuracy_meters,
  timestamp, source (gps|network|manual), project_id

cached_project_data
  id, user_id, project_id, data_type, data_version,
  cached_at, expires_at

sync_conflicts
  id, user_id, entity_type, entity_id, local_version,
  server_version, conflict_type, resolution, resolved_by, resolved_at
```

Note: Most data tables are shared with the main application. The tables above are
mobile-specific infrastructure tables. Field data captured on mobile (daily logs,
photos, time entries, punch items) is stored in the same tables as desktop-created data.

---

## API Endpoints

```
POST   /api/v2/mobile/sync                        # Batch sync: upload queued changes, download updates
GET    /api/v2/mobile/sync/status                  # Sync queue status for current device
POST   /api/v2/mobile/sync/resolve-conflict        # Resolve a sync conflict

POST   /api/v2/mobile/device/register              # Register device for push notifications
DELETE /api/v2/mobile/device/:deviceId              # Unregister device
PUT    /api/v2/mobile/notifications/preferences     # Update notification preferences

GET    /api/v2/mobile/project/:id/offline-bundle    # Download offline data bundle for project
GET    /api/v2/mobile/project/:id/delta             # Delta sync: changes since last sync timestamp

POST   /api/v2/mobile/photos/batch                 # Batch upload photos with metadata
POST   /api/v2/mobile/voice/transcribe              # Transcribe voice recording to text

GET    /api/v2/mobile/context                      # Context for current user: nearby projects, pending tasks, notifications
```

All other API endpoints (daily logs, time entries, punch lists, safety, etc.) are the
same endpoints used by the desktop application. The mobile app consumes the same API
with mobile-specific headers (X-Device-Type, X-App-Version, X-Connection-Quality) that
allow the server to optimize responses for mobile clients.

---

## Dependencies

| Module | Relationship |
|--------|-------------|
| Module 1: Auth & Access | Mobile authentication, biometric login, session management |
| Module 8: Daily Logs | Primary mobile workflow: daily log creation in the field |
| Module 28: Punch List & Quality | Mobile punch list creation with camera |
| Module 34: HR & Workforce | GPS-verified time tracking from mobile |
| Module 33: Safety & Compliance | Safety observations entered from the field |
| Module 6: Document Storage | Photo uploads, document viewing |
| Module 5: Notification Engine | Push notification delivery |
| Module 35: Equipment & Assets | QR code scanning for equipment checkout |
| Module 7: Scheduling | Schedule viewing and task status updates from the field |

---

## Open Questions

1. Should the native wrapper be Capacitor, React Native, or Expo? Capacitor preserves web codebase; React Native offers better native performance.
2. What is the minimum supported device? (iPhone 8 / Android 8.0? Or newer baselines?)
3. How much local storage can we assume is available? (IndexedDB limits vary by device and browser.)
4. Should we support tablet-optimized layouts, or is phone-only sufficient for V1?
5. How do we handle the transition from PWA to native wrapper? Can users seamlessly migrate their cached data?
6. What is the voice transcription provider? On-device (privacy, no cost, lower accuracy) vs. cloud (higher accuracy, cost per request, connectivity required)?
7. Should location tracking be opt-in per employee, or a builder-wide policy setting?
8. How do we handle MDM (Mobile Device Management) for builders who issue company phones? Do we need specific MDM compliance certifications?
