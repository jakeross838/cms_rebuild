# View Plan: Email Marketing

## Views Covered
1. Campaign List
2. Campaign Builder
3. Contact Lists

---

## Purpose
Email marketing for builders:
- Past client newsletters
- New service announcements
- Referral programs
- Seasonal maintenance tips

---

## 1. Campaign List
URL: /marketing/campaigns

Display:
- Campaign name
- Status (draft/scheduled/sent)
- Send date
- Recipients
- Open rate
- Click rate

---

## 2. Campaign Builder
URL: /marketing/campaigns/new

Features:
- Template selection
- Drag-drop editor
- Variable insertion
- Preview mode
- Test send
- Schedule delivery

Templates:
- Monthly newsletter
- New project showcase
- Referral request
- Maintenance reminder
- Holiday greeting

AI Enhancement:
- Subject line suggestions
- Send time optimization
- Content personalization
- A/B testing recommendations

---

## 3. Contact Lists
URL: /marketing/contacts

List Types:
- Past clients
- Active clients
- Prospects
- Vendors
- Custom segments

Features:
- Import/export CSV
- Unsubscribe management
- Bounce handling
- Engagement scoring

---

## Database Schema

campaigns:
- id UUID
- company_id UUID
- name TEXT
- subject TEXT
- content JSONB
- template_id UUID
- contact_list_id UUID
- status TEXT
- scheduled_at TIMESTAMPTZ
- sent_at TIMESTAMPTZ
- stats JSONB

campaign_sends:
- id UUID
- campaign_id UUID
- contact_id UUID
- email TEXT
- status TEXT
- opened_at TIMESTAMPTZ
- clicked_at TIMESTAMPTZ

---

## SendGrid Integration
- Email delivery
- Open/click tracking
- Bounce handling
- Unsubscribe management

---

## Gap Items Addressed

### From Section 39: Marketing & Business Development (Items 569-573)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 569 | Marketing tracking part of platform or external tools (HubSpot, Mailchimp integration) | Campaign List with stats (open rate, click rate) provides in-platform tracking; SendGrid integration for delivery; Requires: optional HubSpot/Mailchimp sync for builders who use external tools |
| 570 | Project portfolio/showcase for marketing (curated photos, specs, testimonials) | Requires: "New project showcase" template with photo gallery pulled from completed project media |
| 571 | Client testimonial/review collection (auto-send at project completion) | Requires: automated campaign trigger at project completion milestone with review request template |
| 572 | Referral program management (track sources, manage fees/gifts) | Contact Lists include "Custom segments"; Requires: referral source tracking fields and referral campaign template |
| 573 | Competitive win/loss analysis | Requires: integration with Lead Pipeline — lost leads tagged with reason, enabling win/loss campaign targeting |

### From Section 30: Notifications (Items 481-485)
| Gap # | Description | Relevance to Email Marketing |
|-------|-------------|------------------------------|
| 481 | Notification types configurable per role per builder | Marketing emails are separate from system notifications; Requires: clear opt-in/opt-out distinction |
| 483 | Notification templates (builder customizes text) | Email Templates section with variable insertion and AI tone adjustment covers this |
| 484 | Notification quiet hours | Requires: send-time scheduling respects quiet hours for marketing emails |
| 485 | Daily digest option vs. real-time | Marketing campaigns should respect digest preferences — never send marketing during system notification digests |

### From Section 8: Customer Support & Help System
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 332-352 | Help system and onboarding | Marketing module needs in-app guidance for first campaign setup; template suggestions for new users |

### From Section 4: White-Labeling & Branding (Items 227-245)
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 227-245 | Builder branding configuration | All marketing emails must use builder's branding (logo, colors, footer) — not platform branding |

### From Edge Cases (Sections 44, 46, 48)
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 605 | Client divorce during construction — dual communication | Contact Lists must support per-contact communication preferences and opt-out per individual |
| 611 | Project featured on TV/magazine — photo approval workflows | Marketing showcase templates need photo approval status checks before publishing |
| 615 | Builder selling the business — comprehensive documentation | Campaign history and contact lists must be exportable as part of business documentation |
| 833 | Email deliverability — automated notifications not going to spam | SendGrid integration with sender verification, SPF/DKIM configuration, and deliverability monitoring |
| 837 | Character set handling — accented characters in names | Email templates must support UTF-8 for Spanish-speaking teams and clients |

### CAN-SPAM & Privacy Compliance
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 5 | Data deletion requests (GDPR, CCPA) | Contact Lists must support individual data deletion and marketing opt-out; unsubscribe links required by law |

---

## Revision History
| Date | Change |
|------|--------|
| 2026-02-11 | Added Gap Items Addressed section from gap analysis sections 4, 5, 8, 30, 39, 44-48 |
| Initial | Created from view planning |
