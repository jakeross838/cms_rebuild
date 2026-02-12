# Module 47: Training & Certification Platform

**Phase:** 6 - Scale & Sell
**Status:** SPEC COMPLETE
**Covers Gap Items:** 76-85 (Section 2: Customer Training), 57 (Interactive Tutorials)

---

## Overview

The Training Platform is the primary driver of user adoption and reduces support load by enabling self-service learning. It provides a video tutorial library organized by module and role, interactive in-app walkthroughs (guided tours), a certification program with assessments, role-based training paths for owners, PMs, field supers, admins, vendors, and clients, a sandbox environment for practice, feature announcement tours for new releases, multi-language support (Spanish for field staff), and training completion tracking with adoption reporting.

---

## Gap Items Addressed

| Gap # | Description | How Addressed |
|-------|-------------|---------------|
| 57 | Interactive tutorial/walkthrough per module | Step-by-step guided tours overlay on actual UI; triggered on first visit or on demand |
| 76 | Self-service vs. instructor-led training | Both: self-service video library + optional scheduled instructor-led sessions (paid add-on) |
| 77 | Different roles need different training paths | Role-based curricula: Owner Track, PM Track, Field Track, Admin Track, Vendor Track, Client Track |
| 78 | Ongoing training for new features after onboarding | Feature announcement tours: "What's New" triggered on login after release; opt-in changelog |
| 79 | Certification program ("Certified Platform Administrator") | Multi-level certification: Fundamentals, Advanced, Administrator. Timed assessments, digital badges. |
| 80 | Training for builder's vendors (vendor portal) | Vendor training track: short videos covering portal navigation, document upload, scheduling |
| 81 | Training for builder's clients (client portal) | Client training track: 3-minute overview videos for portal features (selections, approvals, photos) |
| 82 | Training for non-English speakers (Spanish field staff) | Video subtitles + dubbed audio in Spanish. KB articles in Spanish. UI walkthrough text in Spanish. |
| 83 | Sandbox/test environment for practice | Sandbox mode: isolated demo data environment per user for hands-on practice without affecting production |
| 84 | Track training completion, identify users needing help | Completion dashboards per user and per builder. Auto-flag users with <50% completion after 30 days. |
| 85 | Contextual in-app help ("?" next to any field) | Tooltip help system linked to KB articles and relevant training videos (shared with Module 46) |

---

## Detailed Requirements

### Video Tutorial Library

- Videos organized by module (Estimating, Scheduling, Invoicing, etc.) and by complexity (Getting Started, Intermediate, Advanced)
- Each video: 2-8 minutes, focused on a single workflow or concept
- Video player: embedded with playback speed control, chapter markers, transcript view
- Searchable by keyword, module, role, difficulty level
- "Watch Later" queue per user
- Completion tracking: video marked as watched after 90% viewed

**Video Categories:**
| Category | Est. Videos | Target Audience |
|----------|------------|-----------------|
| Getting Started | 10-15 | All new users |
| Project Management | 15-20 | PMs, Owners |
| Financial Management | 10-15 | Admins, Owners |
| Field Operations | 8-12 | Field Supers |
| Client Management | 8-10 | PMs, Owners |
| Vendor Management | 8-10 | PMs, Admins |
| Admin & Configuration | 10-15 | Admins, Owners |
| Vendor Portal | 5-8 | Vendors |
| Client Portal | 3-5 | Clients |
| Advanced Features | 10-15 | Power users |

### Interactive Walkthroughs (Guided Tours)

- Step-by-step UI overlays that highlight elements and explain actions
- Triggered automatically on first visit to a module (dismissable, "Don't show again")
- Accessible on demand via "Take a Tour" button on any module
- Tour steps: highlight element, show tooltip with instruction, wait for user action or "Next" click
- Tours adapt to screen size (desktop vs. mobile layout)
- Tour completion tracked per user per module

**Tour Types:**
- **Module tours**: Full walkthrough of a module's core workflow (e.g., "Create Your First Estimate")
- **Feature tours**: Spotlight a specific feature within a module (e.g., "Using the Budget Comparison View")
- **What's New tours**: Highlight new or changed features after a platform update

### Role-Based Training Paths (Curricula)

Each role has a structured learning path with required and optional content:

**Owner Track** (12-15 hours)
1. Platform Overview & Dashboard
2. Company Configuration & Branding
3. Team Setup & Permissions
4. Financial Overview & Reports
5. Client Portal Management
6. Business Intelligence & Analytics

**Project Manager Track** (10-12 hours)
1. Project Setup & Management
2. Estimating & Budgets
3. Scheduling & Calendar
4. Change Order Management
5. Daily Log & Field Communication
6. Client & Vendor Communication

**Field Superintendent Track** (6-8 hours)
1. Mobile App Essentials
2. Daily Logs & Photos
3. Schedule Review & Updates
4. Punch Lists & Inspections
5. Safety Documentation

**Admin Track** (8-10 hours)
1. System Configuration
2. User & Permission Management
3. Invoice Processing & Payments
4. Report Generation
5. Integration Management

**Vendor Track** (2-3 hours)
1. Portal Access & Navigation
2. Viewing Schedules & Scopes
3. Submitting Invoices & Lien Waivers
4. Document Upload & Communication

**Client Track** (1-2 hours)
1. Portal Overview
2. Viewing Progress & Photos
3. Making Selections
4. Approving Change Orders
5. Communication & Documents

### Certification Program

**Certification Levels:**

| Level | Name | Prerequisites | Assessment | Badge |
|-------|------|--------------|------------|-------|
| 1 | Fundamentals | Complete Getting Started track | 30-question quiz, 80% pass | Bronze badge |
| 2 | Advanced User | Level 1 + role track completion | Practical scenario test, 75% pass | Silver badge |
| 3 | Platform Administrator | Level 2 + Admin track | Comprehensive exam (60 questions), 85% pass | Gold badge |

- Timed assessments: 45 minutes for Level 1, 60 minutes for Level 2, 90 minutes for Level 3
- Retake allowed after 7-day waiting period
- Digital badge issued (Credly integration or custom)
- Certificate PDF generated with builder name and date
- Annual recertification required (abbreviated assessment)

### Sandbox Environment (Gap #83)

- Per-user sandbox with isolated demo data (not affecting production)
- Pre-loaded with sample project, vendors, budget, schedule, invoices
- Sandbox resets nightly or on demand
- "Practice Mode" banner visible in sandbox to prevent confusion
- Guided practice exercises: "Try creating a change order in the sandbox"
- Link from training videos directly into sandbox for hands-on practice

### Feature Announcements (Gap #78)

- After each platform release, "What's New" modal appears on first login
- Shows: new features with screenshots/GIFs, changed behaviors, deprecation notices
- "Take a Tour" button launches guided tour of new features
- "What's New" history accessible from help menu
- Opt-out per user (still accessible on demand)
- Release notes feed in help center

### Multi-Language Support (Gap #82)

- Phase 1: English + Spanish
- Video subtitles in both languages (auto-generated + human-reviewed)
- Select videos dubbed in Spanish
- Walkthrough tooltip text translated
- Assessment questions translated
- KB articles translated (priority: field operations content)

---

## Database Tables

```
training_videos
  id              UUID PK
  title           VARCHAR(300)
  description     TEXT
  video_url       TEXT  -- hosted on Vimeo/Wistia/S3
  thumbnail_url   TEXT
  duration_sec    INT
  category        VARCHAR(50)
  module_tag      VARCHAR(50)
  role_tags       TEXT[]
  difficulty      VARCHAR(20)  -- 'beginner', 'intermediate', 'advanced'
  language        VARCHAR(5) DEFAULT 'en'
  transcript      TEXT NULL
  sort_order      INT
  is_published    BOOLEAN DEFAULT true
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

training_paths
  id              UUID PK
  name            VARCHAR(100)  -- 'Owner Track', 'PM Track'
  role_key        VARCHAR(30)
  description     TEXT
  estimated_hours DECIMAL(4,1)
  sort_order      INT
  is_active       BOOLEAN DEFAULT true

training_path_items
  id              UUID PK
  path_id         UUID FK -> training_paths
  item_type       VARCHAR(20)  -- 'video', 'walkthrough', 'assessment', 'article'
  item_id         UUID  -- FK to respective table
  sort_order      INT
  is_required     BOOLEAN DEFAULT true

user_training_progress
  id              UUID PK
  user_id         UUID FK -> users
  builder_id      UUID FK -> builders
  item_type       VARCHAR(20)
  item_id         UUID
  status          VARCHAR(20)  -- 'not_started', 'in_progress', 'completed'
  progress_pct    INT DEFAULT 0
  started_at      TIMESTAMPTZ NULL
  completed_at    TIMESTAMPTZ NULL

guided_tours
  id              UUID PK
  tour_key        VARCHAR(100) UNIQUE  -- 'module_estimating_intro', 'feature_budget_comparison'
  name            VARCHAR(200)
  tour_type       VARCHAR(20)  -- 'module', 'feature', 'whats_new'
  target_module   VARCHAR(50) NULL
  steps           JSONB  -- [{selector, tooltip_text, action_required, position}]
  release_version VARCHAR(20) NULL  -- for 'whats_new' tours
  is_active       BOOLEAN DEFAULT true

user_tour_completions
  id              UUID PK
  user_id         UUID FK -> users
  tour_id         UUID FK -> guided_tours
  completed_at    TIMESTAMPTZ
  dismissed       BOOLEAN DEFAULT false

certifications
  id              UUID PK
  name            VARCHAR(100)
  level           INT  -- 1, 2, 3
  description     TEXT
  prerequisites   UUID[] NULL  -- FK to other certifications
  passing_score   INT  -- percentage
  time_limit_min  INT
  recertification_months INT DEFAULT 12
  is_active       BOOLEAN DEFAULT true

certification_assessments
  id              UUID PK
  certification_id UUID FK -> certifications
  questions       JSONB  -- [{question, options, correct_answer, explanation}]
  version         INT DEFAULT 1

user_certifications
  id              UUID PK
  user_id         UUID FK -> users
  certification_id UUID FK -> certifications
  assessment_score INT
  passed          BOOLEAN
  certified_at    TIMESTAMPTZ NULL
  expires_at      TIMESTAMPTZ NULL
  badge_url       TEXT NULL
  certificate_pdf_url TEXT NULL
  attempt_count   INT DEFAULT 1

sandbox_environments
  id              UUID PK
  user_id         UUID FK -> users
  builder_id      UUID FK -> builders
  status          VARCHAR(20)  -- 'active', 'resetting', 'expired'
  demo_data_version VARCHAR(20)
  last_accessed   TIMESTAMPTZ
  resets_at       TIMESTAMPTZ  -- nightly reset schedule
  created_at      TIMESTAMPTZ
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/training/videos` | List training videos (filterable by category, role, module) |
| GET | `/api/v1/training/videos/:id` | Get video details and transcript |
| POST | `/api/v1/training/videos/:id/progress` | Update video watch progress |
| GET | `/api/v1/training/paths` | List available training paths |
| GET | `/api/v1/training/paths/:id` | Get path details with items and user progress |
| GET | `/api/v1/training/progress` | Get current user's overall training progress |
| GET | `/api/v1/training/progress/team` | Builder admin: team training progress dashboard |
| GET | `/api/v1/training/tours/:tourKey` | Get guided tour steps |
| POST | `/api/v1/training/tours/:tourKey/complete` | Mark tour as completed or dismissed |
| GET | `/api/v1/training/certifications` | List available certifications |
| POST | `/api/v1/training/certifications/:id/start` | Start a certification assessment |
| POST | `/api/v1/training/certifications/:id/submit` | Submit assessment answers |
| GET | `/api/v1/training/certifications/earned` | Get user's earned certifications |
| POST | `/api/v1/training/sandbox/create` | Create or reset sandbox environment |
| GET | `/api/v1/training/sandbox/status` | Get sandbox environment status |
| GET | `/api/v1/training/whats-new` | Get latest "What's New" announcements |
| POST | `/api/v1/training/whats-new/:id/dismiss` | Dismiss a "What's New" announcement |
| GET | `/api/v1/admin/training/adoption` | Platform admin: training adoption metrics |

---

## Dependencies

- **Module 1: Auth & Access** -- user roles for training path assignment
- **Module 46: Customer Support** -- contextual help shared between training and support KB
- **Module 5: Notification Engine** -- training reminders, certification expiration alerts
- **Module 49: Platform Analytics** -- training completion correlated with user retention
- **Module 41: Onboarding Wizard** -- post-onboarding training path assignment
- **Video hosting platform** -- Vimeo Pro, Wistia, or AWS MediaConvert + S3/CloudFront
- **Credly** (optional) -- digital badge management for certifications

---

## Open Questions

1. Should we build the video hosting in-house or use Vimeo/Wistia? (Cost vs. control trade-off)
2. How do we handle custom training content that builders create for their own teams?
3. Should certification badges be shareable on LinkedIn? (Credly integration)
4. What is the sandbox data isolation model -- separate schema, separate database, or data-filtered?
5. Should instructor-led training sessions be bookable through the platform or handled externally?
6. How frequently should guided tours be updated when UI changes? (Automated selector detection?)
7. Should we gamify training with points/leaderboards to increase engagement?
