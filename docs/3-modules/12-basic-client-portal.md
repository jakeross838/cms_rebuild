# Module 12: Basic Client Portal

**Phase:** 2 - Construction Core
**Status:** TODO
**Last Updated:** 2026-02-11

---

## Overview

A client-facing portal that gives homeowners/clients controlled visibility into their construction project. The portal is white-labeled and fully branded per builder. Builders configure exactly what clients can see -- from project progress and photos to budget visibility and document access. The portal supports selection approvals, messaging, change order review, and e-signatures. Every aspect of content visibility, notification triggers, and communication channels is configurable per builder, supporting the SaaS multi-tenant model where each builder presents a unique branded experience to their clients.

---

## Gap Items Addressed

| Gap # | Description | How Addressed |
|-------|-------------|---------------|
| 421 | Client portal fully branded per builder; customizable layout | White-label engine with logo, colors, fonts, custom domain, layout options |
| 422 | Client portal content control (builder decides what client sees) | Granular visibility settings per builder: toggle each content section on/off |
| 423 | Portal for different project stages (precon, construction, warranty) | Stage-aware portal that shows relevant content per project phase |
| 424 | Client portal notifications (configurable triggers) | Notification rules engine: builder selects which events notify the client |
| 425 | Client approval workflows (selections, COs, draws, e-signature) | In-portal approval actions with integrated e-signature |
| 426 | Client photo gallery (curated, not raw daily logs) | Curated photo gallery with builder-selected images, separate from field photos |
| 427 | Client document access (configurable visibility) | Document sharing controls: per-document and per-category visibility |
| 428 | Client messaging (in-portal, email, text -- builder configurable) | Multi-channel messaging hub with builder-configured defaults |
| 429 | Logging external communication (calls, texts outside portal) | Manual communication log for out-of-portal interactions |
| 430 | Client portal analytics (login frequency, feature usage) | Builder-facing analytics dashboard showing client engagement metrics |

---

## Detailed Requirements

### 1. White-Label Branding

- Builder uploads: logo, favicon, primary color, accent color, background image or color
- Custom portal URL options:
  - Subdomain: `buildername.portal.platform.com`
  - Custom domain: `portal.buildername.com` (CNAME setup instructions provided)
- Builder-customizable portal name (e.g., "Smith Homes Client Hub", "Builder Co Portal")
- Login page branding with builder's logo and colors
- Email notifications sent from builder's configured "from" address (or platform default)
- Footer text and links configurable (privacy policy, terms, contact info)
- Mobile-responsive design inherits branding

#### Edge Cases & What-If Scenarios

1. **White-label branding leaks.** The system must ensure there are no "leaks" of the platform's branding in the client-facing portal. This includes: all email notifications using the builder's from address and branding (never the platform name), all error pages and system-generated messages displaying the builder's brand, no platform logos or links in the footer or metadata, custom domain SSL certificates showing the builder's domain (not the platform), and mobile browser tab titles and favicons using the builder's brand. A pre-launch branding audit checklist must verify zero platform branding is visible to clients.

### 2. Content Visibility Configuration

Builder settings panel with toggles for each content section:

| Section | Toggle | Default |
|---------|--------|---------|
| Project Progress / Milestones | On/Off | On |
| Photo Gallery | On/Off | On |
| Schedule / Timeline | On/Off | On |
| Budget Summary | On/Off | Off |
| Budget Line Items | On/Off | Off |
| Change Orders | On/Off | On |
| Selections | On/Off | On |
| Documents | On/Off | On |
| Daily Log Summary | On/Off | Off |
| Messaging | On/Off | On |
| Draw Requests | On/Off | Off |
| Warranty Requests | On/Off | Off |

- Budget visibility levels: None, Summary Only (total budget vs. spent), Full Detail (every line item)
- Per-project overrides possible (show budget on one project, hide on another)
- "Preview as Client" mode for builder to verify what the client actually sees

### 3. Project Progress and Updates

- Milestone timeline view showing major phases with completion status
- Progress percentage by phase (configurable: auto-calculated from schedule or manually set)
- Weekly/periodic update posts by builder (rich text with photos)
- Update history feed showing all posted updates chronologically
- Builder can schedule update posts (draft now, publish Friday)
- Stage-aware content:
  - **Preconstruction:** Estimate review, selection deadlines, contract status
  - **Construction:** Progress photos, schedule, milestones, change orders
  - **Warranty:** Service request submission, repair scheduling, warranty expiration dates

### 4. Photo Gallery

- Curated photo gallery separate from daily log photos
- Builder selects which photos to publish to client portal
- Photos organized by: date, phase, room/area, or custom album
- Before/after comparison view (side-by-side or slider)
- Photo captions and descriptions by builder
- Client can download photos (configurable: enable/disable)
- Automatic watermarking with builder logo (optional)
- Slideshow/lightbox viewing mode
- Push notification to client when new photos are published

### 5. Selection Approvals

- Client views pending selections with:
  - Description and specifications
  - Options with photos, pricing (if budget visible), and lead times
  - Builder recommendations (optional)
  - Deadline indicator
- Client actions: Approve selection, Request alternatives, Add comment
- Selection approval triggers e-signature capture
- Selection history: all approved, pending, and upcoming selections
- Selection deadline reminders sent to client
- Selection mood boards / room boards (visual grouping by room)
- Allowance tracking visible to client (if budget visibility enabled)

### 6. Budget Visibility

- Configurable by builder per project:
  - **Hidden:** Client sees no financial information
  - **Summary:** Total contract, change orders, current total -- no line items
  - **Detailed:** Full cost breakdown by category (what client agreed to pay, not builder's actual costs)
- Change order financial impact shown in budget context
- Allowance tracking: original allowance, amount used, remaining
- Payment/draw schedule visibility (what has been billed, what is upcoming)
- Important: client budget view shows CONTRACT values, never internal cost/margin data

### 7. Messaging and Communication

- In-portal messaging thread per project (like a chat)
- Message types: text, photo attachment, file attachment, voice memo
- Builder-configurable communication channels:
  - In-portal only
  - In-portal + email notifications
  - In-portal + email + SMS notifications
- Email replies automatically posted back to portal thread (inbound email parsing)
- Read receipts on messages (builder sees when client read it)
- Message templates for common communications (configurable by builder)
- External communication logging: builder staff can log phone calls, in-person meetings, texts that happened outside the portal
- Communication log includes: date, type (call/text/meeting/email), summary, logged by whom
- Urgent message flagging with push notification

#### Edge Cases & What-If Scenarios

1. **Client disputes information shown in the portal.** When a client disagrees with data displayed in the portal (e.g., budget figures, schedule dates, selection records), there must be a clear communication channel for raising disputes. The portal messaging system must support a "dispute" message type that is flagged for priority review by the builder. The builder can then update the contested information, add an explanatory note visible to the client, or respond through the message thread. All disputes and resolutions are logged in the communication history for audit purposes.

### 8. Document Sharing

- Builder controls which documents are visible to client per document and per category
- Document categories: Contracts, Plans/Drawings, Permits, Specifications, Warranties, Insurance, Change Orders, Custom
- Upload documents specifically for client portal (not tied to internal document management)
- Or share existing internal documents to portal with one click
- Document requires-acknowledgment flag (client must click "I have reviewed this")
- E-signature integration for contracts and change orders
- Document version control visible to client (latest version highlighted)
- Automatic document sharing rules (e.g., all signed change orders auto-shared)

#### Edge Cases & What-If Scenarios (continued)

2. **Client shares login credentials with a third party.** When a client shares their credentials with a designer, architect, or family member, the system should handle this gracefully. Rather than shared passwords, the system must support a "guest invite" feature where the client can invite additional users with view-only access to specific portal sections. Guests authenticate with their own credentials and have a limited permission set (view progress, view photos, view selections -- no approval or messaging capability). Builder controls whether guest invitations are allowed. If anomalous login patterns are detected (e.g., simultaneous sessions from different geolocations), the system should alert the builder rather than locking the client out.

### 9. Client Notifications

Builder-configurable notification rules:

| Event | Notify Client? | Channel |
|-------|---------------|---------|
| New photos published | Configurable | Email / Push / SMS |
| Selection deadline approaching | Configurable | Email / Push / SMS |
| New message from builder | Configurable | Email / Push / SMS |
| Change order requires approval | Configurable | Email / Push / SMS |
| Schedule milestone completed | Configurable | Email / Push / SMS |
| New document shared | Configurable | Email / Push / SMS |
| Draw request submitted (if visible) | Configurable | Email / Push / SMS |
| Weekly progress digest | Configurable | Email |

- Notification frequency controls: immediate, daily digest, weekly digest
- Client can adjust their own notification preferences within builder's allowed channels
- Quiet hours setting (no notifications between 9pm and 7am)

### 10. Client Portal Analytics

Builder-facing dashboard showing per-client engagement:

- Last login date/time
- Login frequency (daily, weekly, monthly, never)
- Most viewed sections
- Time spent in portal per session
- Pending actions (unsigned documents, unapproved selections)
- Message response time (average time client takes to reply)
- Engagement score (composite metric)
- Alerts for disengaged clients (hasn't logged in for 2+ weeks with pending actions)

---

## Database Tables

```
v2_portal_branding
  id, builder_id, logo_url, favicon_url, primary_color, accent_color,
  background_image_url, portal_name, custom_domain, subdomain,
  footer_text, footer_links (jsonb), from_email, from_name,
  login_page_message, created_at, updated_at

v2_portal_visibility_settings
  id, builder_id, project_id (null for builder-wide default),
  section_key, is_visible, visibility_level (none|summary|detail),
  created_at, updated_at

v2_portal_notification_rules
  id, builder_id, event_type, is_enabled, channel (email|push|sms),
  frequency (immediate|daily_digest|weekly_digest),
  created_at, updated_at

v2_portal_messages
  id, builder_id, project_id, thread_id,
  sender_type (builder_staff|client), sender_id,
  message_type (text|photo|file|voice),
  content, attachment_url, is_urgent, is_read,
  read_at, created_at

v2_portal_communication_log
  id, builder_id, project_id, client_id,
  comm_type (call|text|meeting|email|other),
  direction (inbound|outbound),
  summary, logged_by, comm_date, created_at

v2_portal_published_photos
  id, builder_id, project_id, photo_id (ref to main photo),
  album_name, caption, sort_order,
  published_by, published_at, created_at

v2_portal_shared_documents
  id, builder_id, project_id, document_id (ref to main doc),
  category, requires_acknowledgment, acknowledged_at,
  acknowledged_by, shared_by, shared_at, created_at

v2_portal_client_activity
  id, builder_id, project_id, client_id,
  activity_type (login|page_view|action),
  section_viewed, action_taken,
  session_duration_seconds, ip_address,
  created_at

v2_portal_update_posts
  id, builder_id, project_id, title, content (rich text),
  photos (jsonb array), status (draft|scheduled|published),
  scheduled_for, published_at, created_by, created_at, updated_at
```

---

## API Endpoints

```
# Portal Branding (builder admin)
GET    /api/v2/portal/branding             # Get branding settings
PUT    /api/v2/portal/branding             # Update branding settings
POST   /api/v2/portal/branding/logo        # Upload logo
POST   /api/v2/portal/branding/favicon     # Upload favicon

# Visibility Settings (builder admin)
GET    /api/v2/portal/visibility           # Get visibility config
PUT    /api/v2/portal/visibility           # Update visibility config
PUT    /api/v2/portal/visibility/:projectId # Project-specific override

# Notification Rules (builder admin)
GET    /api/v2/portal/notifications/rules  # Get notification rules
PUT    /api/v2/portal/notifications/rules  # Update notification rules

# Client-Facing Endpoints (authenticated as client)
GET    /api/v2/portal/projects             # Client's projects list
GET    /api/v2/portal/projects/:id         # Project overview (filtered by visibility)
GET    /api/v2/portal/projects/:id/progress # Milestones and progress
GET    /api/v2/portal/projects/:id/photos  # Curated photo gallery
GET    /api/v2/portal/projects/:id/schedule # Schedule/timeline (if visible)
GET    /api/v2/portal/projects/:id/budget  # Budget view (if visible, filtered by level)
GET    /api/v2/portal/projects/:id/selections # Pending and completed selections
POST   /api/v2/portal/projects/:id/selections/:sid/approve # Approve selection
GET    /api/v2/portal/projects/:id/change-orders # Change orders (if visible)
POST   /api/v2/portal/projects/:id/change-orders/:coid/approve # Approve CO
GET    /api/v2/portal/projects/:id/documents # Shared documents
POST   /api/v2/portal/projects/:id/documents/:did/acknowledge # Acknowledge document
GET    /api/v2/portal/projects/:id/updates # Update posts feed

# Messaging
GET    /api/v2/portal/projects/:id/messages # Message thread
POST   /api/v2/portal/projects/:id/messages # Send message
PUT    /api/v2/portal/projects/:id/messages/:mid/read # Mark as read

# Communication Log (builder staff only)
GET    /api/v2/portal/projects/:id/comm-log # Communication log
POST   /api/v2/portal/projects/:id/comm-log # Log external communication

# Photos (builder staff)
POST   /api/v2/portal/projects/:id/photos/publish # Publish photos to portal
DELETE /api/v2/portal/projects/:id/photos/:pid     # Remove photo from portal

# Update Posts (builder staff)
POST   /api/v2/portal/projects/:id/updates         # Create update post
PUT    /api/v2/portal/projects/:id/updates/:uid     # Edit update post
POST   /api/v2/portal/projects/:id/updates/:uid/publish # Publish draft

# Analytics (builder admin)
GET    /api/v2/portal/analytics            # Client engagement dashboard
GET    /api/v2/portal/analytics/:clientId  # Per-client engagement detail

# Client Notification Preferences
GET    /api/v2/portal/notifications/preferences     # Client's own preferences
PUT    /api/v2/portal/notifications/preferences     # Client updates preferences
```

---

## UI Components

### Builder Admin Views
| Component | Description |
|-----------|-------------|
| PortalBrandingEditor | Logo upload, color pickers, domain config, preview |
| VisibilityConfigPanel | Toggle grid for enabling/disabling portal sections per builder or per project |
| NotificationRulesEditor | Event/channel matrix for configuring client notifications |
| PhotoPublisher | Select from project photos to publish to portal; add captions |
| UpdatePostEditor | Rich text editor for creating project update posts with photo embedding |
| CommLogForm | Form for logging phone calls, meetings, and other external communication |
| PortalAnalyticsDashboard | Client engagement metrics, login tracking, pending action alerts |
| PortalPreviewMode | "View as Client" iframe showing exactly what the client sees |

### Client Portal Views
| Component | Description |
|-----------|-------------|
| ClientLoginPage | Branded login page with builder's logo and colors |
| ClientDashboard | Overview of all client's projects with status summaries |
| ProjectProgressView | Milestone timeline with completion indicators |
| ClientPhotoGallery | Grid/masonry photo layout with lightbox, albums, before/after |
| ClientScheduleView | Simplified milestone timeline (not the full Gantt) |
| ClientBudgetView | Contract summary or detailed breakdown based on visibility level |
| SelectionApprovalView | Pending selections with options, photos, approve/comment actions |
| ChangeOrderReviewView | Change orders with scope, pricing, approve/reject with e-signature |
| DocumentLibrary | Categorized document list with download and acknowledgment |
| MessageThread | Chat-style messaging with attachments and read receipts |
| NotificationPreferences | Client's own notification channel and frequency settings |
| ClientUpdateFeed | Chronological feed of builder's project update posts |

---

## Dependencies

- **Module 1:** Auth & Access (client role with portal-scoped permissions)
- **Module 3:** Core Data Model (project data, milestones, phases)
- **Module 6:** Document Storage (shared documents, photo storage)
- **Module 9:** Budget & Cost Tracking (budget data for client budget view)
- **Module 11:** Native Accounting (GL/AP/AR) (payment/draw visibility)
- **Module 17:** Change Orders (change order review/approval in portal)
- **Module 18:** Selections & Allowances (selection approval workflow)

---

## Open Questions

1. Should clients be able to invite additional users (e.g., spouse, designer, realtor) with the same or restricted access? (Note: gap analysis identifies credential sharing as a risk -- if clients share their login with a designer or architect, the system should allow the client to invite guests with view-only access rather than sharing credentials. See Section 7 edge cases.)
2. What is the authentication mechanism for clients? Same auth system as builder staff, or separate lighter-weight auth (magic link, social login)?
3. Should the portal support a native mobile app wrapper, or is mobile-responsive web sufficient for V1?
4. How do we handle the client whose project is complete -- do they retain portal access indefinitely, for a fixed period, or only during warranty?
5. Should builders be able to use the portal for prospect/lead nurturing (pre-contract), or is it strictly for active clients?
6. How do we handle client portal access during a contract dispute? Can the builder revoke access?
7. Should the portal support multi-language for builders serving non-English-speaking clients?
