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

### Edge Cases & What-If Scenarios

1. **Extended offline period with large sync backlog.** When a user works offline for an extended period (multiple days on a remote job site with no connectivity), the sync queue can accumulate a large backlog of changes -- dozens of daily log entries, hundreds of photos, time tracking records, and punch list updates. The sync engine must handle this gracefully: prioritize sync by data type (time-critical items like clock in/out first, then daily logs, then photos last due to size), provide clear progress indication ("Syncing 47 items -- 12 of 47 complete"), handle partial sync gracefully (if connectivity drops mid-sync, resume where it left off), and manage storage limits (warn the user when local storage is approaching device limits before they lose the ability to capture new data). The system must never silently drop queued items.

2. **Lost or stolen device data wipe.** When a company-issued or personal device with cached project data is lost or stolen, the system must support remote data protection. The builder admin can trigger a remote wipe of all cached application data for a specific device via the admin panel. On next app open (when connectivity is available), the app detects the wipe command and clears all local data (IndexedDB, cached files, saved credentials). The wipe must be logged in the audit trail. For immediate protection, the admin can also revoke the device's session tokens, forcing re-authentication. The system should recommend that builders using company devices pair this with a third-party MDM solution for full device-level wipe capability.

3. **Field worker UX must be purpose-built, not adapted.** The mobile experience for field workers (superintendents, foremen, laborers) must be fundamentally different from the desktop experience, not a responsive adaptation of it. Field workers operate in harsh conditions: bright sunlight, rain, dust, gloves, one hand occupied, frequent interruptions, and limited attention span. The mobile app must prioritize the 5 core field workflows (daily log, photo capture, time clock, punch list, safety observation) with a maximum of 2 taps to start any of them from the home screen. Non-field features (estimating, financial reports, contract management) should be accessible but clearly secondary. The field worker home screen must be configurable per role so that a superintendent sees different quick actions than a laborer. All field-entry forms must support voice input as a first-class input method, not an afterthought.

### Technology Edge Cases — Mobile & Field

These scenarios address real-world technology challenges specific to mobile use on construction job sites.

4. **Multi-day power outage / hurricane scenario (GAP-826).** During extended power outages (hurricanes, natural disasters), the mobile app must function as the primary interface for an extended period. Requirements: (a) the offline-first architecture must support at minimum 7 days of continuous offline use without data loss, (b) battery optimization mode that reduces GPS frequency, disables background sync, and minimizes screen brightness prompts, (c) local storage must accommodate at least 500 photos, 30 daily logs, and 200 time entries before requiring sync, and (d) when power returns, the sync engine must handle the full backlog gracefully (see Edge Case 1).

5. **Photo metadata discrepancies (GAP-827).** Camera timestamps, phone system time, and server time can all differ — especially when devices are in different time zones, have incorrect clock settings, or use cameras with depleted CMOS batteries. The system must: (a) capture all three timestamps (EXIF camera time, device system time, server receive time) for every photo, (b) display a "canonical timestamp" that uses the most reliable source (server time for upload time, EXIF for taken time when available), (c) flag discrepancies greater than 15 minutes between EXIF and device time for manual review, and (d) never silently overwrite EXIF timestamps — preserve original metadata for evidentiary purposes.

6. **Large plan set rendering on mobile (GAP-828).** Construction plan sets can be 100+ sheets, each at high resolution. Mobile rendering must: (a) use progressive loading — show low-resolution overview first, load full resolution on zoom, (b) support tile-based rendering for smooth pan and zoom on large sheets, (c) pre-cache the most recently viewed 5 sheets for offline access, (d) allow downloading full plan sets for offline use with clear storage impact shown to the user ("This plan set will use 2.3 GB"), and (e) maintain acceptable zoom and pan performance (< 100ms response) on devices 3 years old or newer.

7. **Field connectivity — dead zones (GAP-829).** Construction sites frequently have no connectivity — basements, rural areas, islands, mountainous terrain. Beyond the standard offline-first architecture, the system must: (a) detect connectivity loss immediately and switch to offline mode without user action, (b) queue all actions silently and confirm to the user that their work is saved locally, (c) provide a "last synced" indicator that is always visible so the user knows their data currency, (d) support opportunistic sync — if connectivity briefly appears (e.g., walking past a window), sync critical items immediately, and (e) handle the transition between WiFi and cellular gracefully without losing queued items.

8. **Device diversity and graceful degradation (GAP-830).** Field crews use a wide range of devices — old iPads, budget Android phones, and brand-new iPhones. The system must: (a) define minimum supported devices (recommend: iPhone 8+ / Android 8.0+ / iPads from 2018+), (b) detect device capabilities at launch and adjust features accordingly (e.g., disable photo annotation on low-RAM devices), (c) provide a "lite mode" for older devices that disables animations, reduces image quality, and simplifies the UI, (d) test against the 10 most common devices in the construction industry (not just flagship phones), and (e) degrade gracefully when features are unavailable — show a clear message rather than crashing.

9. **Session management across devices (GAP-838).** Users frequently start on their phone in the field and continue on desktop in the office. The system must: (a) support concurrent active sessions on multiple devices (phone + tablet + desktop), (b) sync work-in-progress data across devices in near-real-time (e.g., a daily log started on the phone appears as a draft on the desktop), (c) handle offline edits on one device that conflict with online edits on another (see sync conflict resolution), and (d) allow configurable session policies per builder (e.g., max 3 active sessions per user, auto-logout after 8 hours of inactivity).

10. **Deep linking from notifications and emails (GAP-839).** When a user taps a link in an email or push notification, it must go directly to the specific record — not to the app home screen. Requirements: (a) every entity in the system has a stable, shareable URL that resolves correctly on mobile (deep link) and desktop (web URL), (b) if the user is not logged in, the deep link is preserved through the authentication flow and the user lands on the target page after login, (c) if the user does not have permission to view the linked entity, show a clear "access denied" message rather than a generic 404, and (d) deep links work in both the PWA and the native wrapper.

11. **Mobile app update management (GAP-843).** The system must handle app updates gracefully: (a) the PWA updates automatically on reload — no user action required, (b) the native wrapper checks for updates on launch and prompts the user if an update is available, (c) critical updates (security fixes, breaking API changes) can be force-updated — the app blocks usage until updated, (d) the server must support at minimum the current version and one prior version simultaneously (no instant breaking changes), and (e) update prompts must be non-intrusive for optional updates and blocking only for critical updates.

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
