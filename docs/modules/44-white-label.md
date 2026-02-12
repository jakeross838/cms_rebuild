# Module 44: White-Label & Branding Engine

**Phase:** 6 - Scale & Sell
**Status:** SPEC COMPLETE
**Covers Gap Items:** 121-133 (Section 4: White-Labeling & Branding)

---

## Overview

Every builder using this platform should feel like it is *their* software. The White-Label and Branding Engine allows complete visual customization per tenant: logos, color themes, custom domains, branded emails, branded PDF output, portal branding for clients and vendors, login page customization, terminology overrides, and a full white-label tier where the SaaS brand is completely invisible. This is both a customer satisfaction feature (every builder wants their brand) and a revenue feature (premium white-label pricing).

---

## Gap Items Addressed

| Gap # | Description | How Addressed |
|-------|-------------|---------------|
| 121 | Custom logo, colors, branding per builder | Tenant branding config: logo, primary/secondary/accent colors, favicon |
| 122 | Client portal fully branded to builder | Client portal renders builder's branding; SaaS brand hidden or minimized |
| 123 | Vendor portal branded per builder | Same branding engine applied to vendor portal |
| 124 | Email notifications from builder's domain | Custom email domain support via SPF/DKIM setup; fallback: "via [SaaS]" sender |
| 125 | Generated documents use builder's branding | PDF engine injects builder logo, colors, address, license info into all outputs |
| 126 | Custom subdomain (app.smithbuilders.com) | CNAME subdomain support with automatic SSL provisioning via Let's Encrypt |
| 127 | Login page customization | Builder-branded login page with custom background image, logo, welcome text |
| 128 | Mobile app branding | In-app branding (splash screen, header logo, theme colors); app icon is shared |
| 129 | Custom pages/content (policies, specs, welcome) | Content page editor: builders can create branded pages visible in their portal |
| 130 | Branding on proposals and contracts | Document template engine pulls branding variables into proposal/contract output |
| 131 | CSS/theme customization level | Theme system: logo + colors + fonts (standard); full CSS override (Enterprise) |
| 132 | Custom automated messages | Message template editor: customize all notification text, email templates, portal messages |
| 133 | Full white-label -- zero SaaS brand mention | White-label tier: removes all SaaS branding, "Powered by" footer, support links |

---

## Detailed Requirements

### Branding Configuration

Each builder configures their brand through a visual editor:

- **Logo**: Primary logo (header), icon logo (favicon/mobile), dark variant, light variant
- **Colors**: Primary, secondary, accent, background, text, error, success, warning
- **Typography**: Heading font, body font (from curated list or custom upload on Enterprise)
- **Images**: Login background, portal hero image, email header image
- **Text**: Company name, tagline, portal welcome message, email footer text
- **Contact**: Support email, support phone (shown in builder's portal)

### Custom Domain Support

1. Builder requests custom domain (e.g., `app.smithbuilders.com`)
2. System generates CNAME record instructions
3. Builder configures DNS at their registrar
4. Platform validates DNS propagation
5. Auto-provisions SSL certificate via Let's Encrypt / Cloudflare
6. Subsequent requests to custom domain route to builder's branded instance
7. Renewal and certificate management handled automatically

### Email Branding

**Level 1 (All Plans):**
- Builder's logo in email header
- Builder's colors in email template
- Custom reply-to address (replies go to builder)
- "Sent via [SaaS Platform]" footer

**Level 2 (Business Plan):**
- Custom sender name ("Smith Builders" not "[SaaS Platform]")
- Custom email templates with full content editing
- Remove "Sent via" footer (replaced with builder's footer)

**Level 3 (Enterprise / White-Label):**
- Send from builder's actual domain (requires SPF/DKIM/DMARC setup)
- Zero SaaS branding in any email
- Builder provides their own SMTP or we configure authenticated sending

### PDF / Document Branding

All generated documents (invoices, proposals, change orders, draw requests, reports) pull from branding config:
- Builder logo in header
- Builder address and license numbers in footer
- Builder's color scheme for headings, tables, accents
- Configurable document template layouts per document type
- Builder can upload custom document templates (letterhead PDF overlay)

### Terminology Customization

Builders can override default platform terms:

| Default Term | Example Override |
|-------------|-----------------|
| Subcontractor | Trade Partner |
| Vendor | Supplier |
| Change Order | Change Directive |
| Daily Log | Field Report |
| Punch List | Completion List |
| Allowance | Selection Budget |
| Draw Request | Progress Claim |

Terminology overrides apply across the entire UI, all generated documents, all emails, and all portal interfaces for that builder.

### White-Label Tiers

| Feature | Standard | Business | Enterprise/White-Label |
|---------|----------|----------|----------------------|
| Logo + colors | Yes | Yes | Yes |
| Custom subdomain | No | Yes | Yes |
| Custom email sender | No | Yes | Yes |
| Custom email domain | No | No | Yes |
| Remove SaaS branding | No | Minimal | Complete |
| Custom fonts | No | No | Yes |
| Full CSS override | No | No | Yes |
| Custom login page | No | Yes | Yes |
| Reseller branding | No | No | Yes |

### Mobile Experience

- App theme colors follow builder's branding config
- Splash screen shows builder's logo
- Navigation header uses builder's primary color
- App icon remains shared (cannot customize per-builder on iOS/Android stores)
- PWA manifest dynamically generated with builder's name and colors

---

## Database Tables

```
builder_branding
  id              UUID PK
  builder_id      UUID FK -> builders UNIQUE
  company_name    VARCHAR(200)
  tagline         VARCHAR(300) NULL
  logo_url        TEXT
  logo_icon_url   TEXT NULL
  logo_dark_url   TEXT NULL
  favicon_url     TEXT NULL
  primary_color   VARCHAR(7)  -- '#1A73E8'
  secondary_color VARCHAR(7)
  accent_color    VARCHAR(7)
  bg_color        VARCHAR(7) DEFAULT '#FFFFFF'
  text_color      VARCHAR(7) DEFAULT '#1F2937'
  error_color     VARCHAR(7) DEFAULT '#DC2626'
  success_color   VARCHAR(7) DEFAULT '#16A34A'
  heading_font    VARCHAR(100) DEFAULT 'Inter'
  body_font       VARCHAR(100) DEFAULT 'Inter'
  custom_css      TEXT NULL  -- Enterprise only
  login_bg_image  TEXT NULL
  login_welcome   TEXT NULL
  portal_hero_image TEXT NULL
  portal_welcome  TEXT NULL
  email_header_image TEXT NULL
  email_footer_text TEXT NULL
  support_email   VARCHAR(200) NULL
  support_phone   VARCHAR(30) NULL
  updated_at      TIMESTAMPTZ

builder_custom_domains
  id              UUID PK
  builder_id      UUID FK -> builders
  domain          VARCHAR(253)  -- 'app.smithbuilders.com'
  domain_type     VARCHAR(20)  -- 'subdomain', 'full_domain'
  cname_target    VARCHAR(253)  -- 'tenant-abc.platform.com'
  dns_verified    BOOLEAN DEFAULT false
  ssl_provisioned BOOLEAN DEFAULT false
  ssl_expires_at  TIMESTAMPTZ NULL
  verified_at     TIMESTAMPTZ NULL
  created_at      TIMESTAMPTZ

builder_email_config
  id              UUID PK
  builder_id      UUID FK -> builders UNIQUE
  sender_name     VARCHAR(200) NULL
  reply_to_email  VARCHAR(200) NULL
  custom_domain   VARCHAR(253) NULL  -- 'mail.smithbuilders.com'
  spf_verified    BOOLEAN DEFAULT false
  dkim_verified   BOOLEAN DEFAULT false
  dmarc_verified  BOOLEAN DEFAULT false
  smtp_host       VARCHAR(253) NULL  -- Enterprise custom SMTP
  smtp_port       INT NULL
  smtp_user       VARCHAR(200) NULL
  smtp_pass_enc   TEXT NULL  -- encrypted
  branding_level  INT DEFAULT 1  -- 1=basic, 2=business, 3=whitelabel

builder_terminology
  id              UUID PK
  builder_id      UUID FK -> builders
  default_term    VARCHAR(100)
  custom_term     VARCHAR(100)
  context         VARCHAR(50)  -- 'ui', 'documents', 'emails', 'all'
  UNIQUE(builder_id, default_term)

builder_message_templates
  id              UUID PK
  builder_id      UUID FK -> builders
  template_key    VARCHAR(100)  -- 'invoice_sent', 'schedule_update', 'welcome_client'
  subject         TEXT
  body_html       TEXT
  body_text       TEXT
  variables       JSONB  -- available merge fields for this template
  is_active       BOOLEAN DEFAULT true
  updated_at      TIMESTAMPTZ

builder_content_pages
  id              UUID PK
  builder_id      UUID FK -> builders
  slug            VARCHAR(100)
  title           VARCHAR(200)
  body_html       TEXT
  visibility      VARCHAR(20)  -- 'client_portal', 'vendor_portal', 'internal', 'all'
  sort_order      INT DEFAULT 0
  is_published    BOOLEAN DEFAULT true
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/branding` | Get current builder's branding config |
| PUT | `/api/v1/branding` | Update branding config (logo, colors, fonts) |
| POST | `/api/v1/branding/logo` | Upload logo image |
| GET | `/api/v1/branding/preview` | Preview branding changes before saving |
| POST | `/api/v1/branding/domain` | Request custom domain setup |
| GET | `/api/v1/branding/domain/status` | Check DNS verification and SSL status |
| GET | `/api/v1/branding/email-config` | Get email branding configuration |
| PUT | `/api/v1/branding/email-config` | Update email sender/domain settings |
| POST | `/api/v1/branding/email-config/verify` | Trigger SPF/DKIM/DMARC verification |
| GET | `/api/v1/branding/terminology` | Get custom terminology overrides |
| PUT | `/api/v1/branding/terminology` | Set custom terminology overrides |
| GET | `/api/v1/branding/message-templates` | List message templates |
| PUT | `/api/v1/branding/message-templates/:key` | Update a message template |
| POST | `/api/v1/branding/message-templates/:key/preview` | Preview template with sample data |
| GET | `/api/v1/branding/content-pages` | List custom content pages |
| POST | `/api/v1/branding/content-pages` | Create a content page |
| PUT | `/api/v1/branding/content-pages/:id` | Update a content page |
| GET | `/api/v1/portal/branding/:tenantSlug` | Public: get branding for portal rendering |

---

## Dependencies

- **Module 1: Auth & Access** -- tenant context for branding resolution
- **Module 2: Configuration Engine** -- branding settings stored as tenant config
- **Module 43: Subscription Billing** -- white-label feature gating by plan tier
- **Module 5: Notification Engine** -- email templates use branding config
- **Module 6: Document Storage** -- logo and image asset hosting
- **Cloudflare / Let's Encrypt** -- SSL provisioning for custom domains
- **DNS verification service** -- CNAME, SPF, DKIM, DMARC checks

---

## Open Questions

1. Should we support full custom domain (not just subdomain) for Enterprise? This adds complexity for SSL management.
2. How do we handle branding for the native mobile app icon and name? (App store limitations prevent per-tenant customization.)
3. Should custom CSS override be sandboxed to prevent breaking the layout, or fully open for Enterprise?
4. How do we handle branding consistency when the platform UI is updated? (Custom CSS may break.)
5. Should terminology overrides support pluralization rules automatically, or require both singular and plural entries?
6. Do we allow builders to use their own email delivery service (SendGrid, Mailgun) instead of our shared infrastructure?
