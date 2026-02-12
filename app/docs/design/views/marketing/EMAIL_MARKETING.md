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
