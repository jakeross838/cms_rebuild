# Module 21: Selection Management Portal

**Phase:** 4 - Intelligence
**Status:** TODO
**Priority:** High (client engagement driver)

---

## Overview

Manages the entire client selection lifecycle for finishes, fixtures, appliances, and materials in custom home construction. Provides builders with a structured, configurable workflow for defining selection categories, presenting options with rich media, capturing client decisions, tracking budget impacts in real time, and converting approved selections into purchase orders. The client-facing portal is designed to feel premium -- visual, intuitive, and confidence-building for homeowners making hundreds of decisions about their dream home.

---

## Gap Items Addressed

| Gap # | Description | Section |
|-------|-------------|---------|
| 369 | Multi-builder selection model support (allowance, fixed-price, cost-plus) | Configuration |
| 370 | Builder-defined selection categories (not hardcoded) | Configuration |
| 371 | Selection presentation modes (meetings vs. online browsing) | Workflow |
| 372 | Vendor catalog integration (future consideration) | Integration |
| 373 | Complex configuration items (cabinetry with 50+ decision points) | Data Model |
| 374 | Selection deadlines tied to construction schedule with lead time buffers | Schedule Integration |
| 375 | Selection change after ordering (cancellation fees, delays) | Change Management |
| 376 | Selection rooms/boards for visual grouping by room | UI/Presentation |
| 377 | Spec home selections (builder selects, no client) | Workflow Variant |
| 378 | Model home selections with upgrade options for buyers | Workflow Variant |
| 379 | Multi-home selections (developer with 10 homes, standard + per-buyer) | Workflow Variant |
| 380 | Selection history for repeat clients (preferences carry forward) | Data Continuity |
| 724 | Visual room-by-room layout in client portal | UI (Per-Page) |
| 725 | Selection cards with photos, descriptions, pricing, lead times | UI (Per-Page) |
| 726 | Comparison mode (side-by-side options within a category) | UI (Per-Page) |
| 727 | Real-time budget impact calculator ("$2,400 over allowance") | UI (Per-Page) |
| 728 | Approval with e-signature | UI (Per-Page) |
| 729 | Status indicators (Not Started through Installed) | UI (Per-Page) |
| 730 | Deadline countdown tied to schedule | UI (Per-Page) |
| 731 | Inspiration board (client uploads photos) | UI (Per-Page) |
| 732 | Comment/question thread per selection category | UI (Per-Page) |
| 733 | History of all considered options, not just final selection | UI (Per-Page) |
| 734 | Print/export selection summary | UI (Per-Page) |
| 735 | Designer view (interior designer adds/recommends options) | UI (Per-Page) |

---

## Detailed Requirements

### 1. Selection Categories & Configuration

- Builders define their own selection categories per project: Flooring, Countertops, Cabinetry, Plumbing Fixtures, Lighting, Tile, Appliances, Hardware, Paint Colors, etc. (Gap 370).
- Categories are not hardcoded; builders can add, remove, rename, and reorder.
- Each category has configurable properties: allowance amount (if applicable), deadline, responsible party, lead time requirement, and required approval level.
- Support for all pricing models: allowance-based (client has $X to spend), fixed-price (included in contract), and cost-plus (client pays actual cost + markup) (Gap 369).
- Category templates reusable across projects.

### 2. Selection Options & Complex Items

- Each category contains one or more options with: name, description, photos/media, vendor, SKU/model, unit price, quantity, total price, lead time, and availability status (Gap 725).
- Complex configuration support for items like cabinetry: hierarchical sub-selections (wood species > door style > finish > hardware > accessories) with pricing that updates at each decision point (Gap 373).
- Options can be added by the builder, the design team, or imported from vendor catalogs (future) (Gap 372).
- Each option tracks its source (builder-added, designer-recommended, client-requested).

#### Edge Cases & What-If Scenarios

1. **Selected item is discontinued by the manufacturer.** When a previously selected item becomes unavailable (discontinued, backordered indefinitely, or no longer manufactured), the system must: (a) allow the builder or vendor to flag an option as "discontinued" with a reason code, (b) automatically notify the builder and client that the selection is no longer available, (c) present alternative options within the same category (builder pre-selects alternatives or AI suggests based on specs and price range), (d) track the original selection in history with a "discontinued" status, and (e) if a PO was already generated, trigger the change request workflow (Section 7) with the discontinuation as the reason.

### 3. Client Portal Selection Workflow

- **Room-by-room layout**: Selections organized visually by room (Kitchen, Master Bath, Powder Room, etc.) with progress indicators per room (Gap 724, 376).
- **Comparison mode**: Side-by-side option comparison within a category, showing photos, specs, price, and lead time differences (Gap 726).
- **Budget impact calculator**: Real-time display showing allowance amount, selected option cost, and overage/credit. Running total across all selections showing cumulative budget impact (Gap 727).
- **Deadline countdown**: Each category shows days until selection is needed to stay on schedule (Gap 730, 374).
- **Approval flow**: Client selects an option and confirms with e-signature. Builder is notified immediately (Gap 728).
- **Inspiration board**: Clients can upload photos, Pinterest links, or notes about their preferences for each category (Gap 731).
- **Comment threads**: Per-category discussion between client, builder, and designer (Gap 732).
- **Decision history**: All considered options are retained, not just the final selection, with timestamps of when each was viewed/considered (Gap 733).

#### Edge Cases & What-If Scenarios

1. **Budget impact calculator accuracy and transparency.** The real-time budget impact calculator must be accurate and transparent to build trust with the client. Required behavior: (a) clearly show the calculation methodology (allowance amount - selected option cost = overage/credit), (b) display cumulative impact across all categories with a breakdown per category, (c) handle pricing model differences correctly (allowance-based shows overage/credit, cost-plus shows actual cost + markup, fixed-price shows "included" vs "upgrade"), (d) update in real-time as selections are made but clearly label tentative vs. confirmed impacts, and (e) include a "what-if" mode where the client can explore options without committing, seeing the budget impact of different combinations before finalizing.

### 4. Status Tracking

- Selection lifecycle statuses (Gap 729):
  - `not_started` -- Category defined, no options presented yet
  - `options_presented` -- Builder/designer has added options for client review
  - `client_reviewing` -- Client is actively reviewing (opened in portal)
  - `selected` -- Client has made a selection (pending builder confirmation)
  - `confirmed` -- Builder has confirmed the selection
  - `ordered` -- Purchase order generated
  - `received` -- Material/item received on site or at warehouse
  - `installed` -- Item has been installed
  - `change_requested` -- Client wants to change after selection

### 5. Lead Time & Schedule Integration

- Each selection option includes vendor-provided lead time (Gap 374).
- System calculates the latest possible selection date based on: installation date (from schedule) minus lead time minus processing buffer.
- Overdue selections trigger escalating alerts to client, builder, and designer.
- When a selection is late, system shows the schedule impact: "Selecting after [date] will delay [task] by [N] days."
- Selection deadlines auto-update when the construction schedule changes.

### 6. Auto-PO Generation from Selections

- When a selection is confirmed, the system can auto-generate a purchase order to the linked vendor.
- PO includes: item details, quantity, negotiated price, delivery address, required delivery date.
- Builder can configure auto-PO (generate immediately on confirmation) or manual-PO (queue for review).
- PO links back to the selection for traceability.

### 7. Selection Changes After Ordering

- Change request workflow: client requests change > builder evaluates impact > cancellation fee + restocking fee + delay impact calculated > client approves change order > original PO canceled, new PO issued (Gap 375).
- All change costs are tracked and linked to a change order.
- If the change affects the schedule, the schedule impact is shown before client confirms.

#### Edge Cases & What-If Scenarios

1. **Client wants to change a selection after it has been ordered.** The change request workflow must clearly communicate all financial and schedule consequences before the client confirms. Required behavior: (a) system automatically calculates cancellation fees based on vendor return policies (stored per vendor), (b) restocking fees are displayed as a line item, (c) lead time impact for the new selection is calculated against the current schedule, showing the specific tasks that will be delayed, (d) the total cost of the change (cancellation fee + restocking fee + price difference + schedule impact cost) is presented as a single change order for client approval with e-signature, and (e) if the original item has already been delivered or installed, the system flags this and requires builder manual assessment of removal/replacement costs.

### 8. Design Team Collaboration

- Interior designers can be granted portal access with a "designer" role (Gap 735).
- Designers can: add options, recommend options (flagged as "designer recommended"), add notes, upload mood boards, and view client selections.
- Designers cannot approve or place orders.
- Builder controls which categories the designer can access.

### 9. Workflow Variants

- **Spec homes**: Builder makes all selections; no client portal access. Selections still tracked for budget and procurement (Gap 377).
- **Model homes**: Base selections defined by builder; upgrade options defined with price deltas for buyers. Buyer portal shows "included" vs. "upgrade" pricing (Gap 378).
- **Multi-home/developer**: Standard selections defined once, applied to all units. Per-buyer customizations tracked as overrides on the standard set (Gap 379).
- **Repeat clients**: When creating a new project for an existing client, option to import their previous selections as starting preferences (Gap 380).

### 10. Reporting & Export

- Selection summary report: all selections by room with photos, pricing, and status (Gap 734).
- Allowance tracking report: all categories with allowance, selected amount, overage/credit.
- Outstanding selections report: all items still pending, sorted by deadline urgency.
- Export to PDF for client binder; export to Excel for internal tracking.

### 11. Eco-Friendly & Sustainability Integration

For clients interested in green building, selections integrate with the Sustainability/ESG module to surface environmental impact:

- **Eco Badges**: Each selection option can display sustainability badges:
  - 🌿 **Low Carbon** — Below average carbon footprint for this category
  - ♻️ **Recycled Content** — Contains recycled materials (% displayed)
  - 🏠 **Locally Sourced** — Manufactured within configurable radius (default 500 mi)
  - 📜 **EPD Available** — Environmental Product Declaration on file
  - 🏆 **Certified** — FSC, GREENGUARD, Cradle to Cradle, etc.

- **Carbon Footprint Display**: Optional carbon footprint (kg CO2e) shown per option, sourced from `material_carbon_data` table.

- **Green Comparison Mode**: Filter or sort options by eco-rating within a category. Side-by-side comparison includes carbon impact delta.

- **Green Alternative Suggestions**: When a client selects a standard option, AI can suggest lower-carbon alternatives with the same functionality:
  - "Consider FSC-certified oak flooring — 23% lower carbon footprint, similar price."
  - Suggestions pulled from `carbon_alternatives` table.

- **Cumulative Carbon Impact**: Dashboard widget showing total carbon footprint of all confirmed selections vs. baseline for project tier.

- **ESG Selection Summary**: Export includes an optional sustainability section showing:
  - Total carbon footprint of selections
  - % recycled content across selections
  - % locally sourced materials
  - Certifications earned (if pursuing LEED, etc.)

- **Client Eco Preferences**: Clients can set a "sustainability preference" level:
  - **Standard** — No filtering, eco info shown but not prioritized
  - **Eco-Conscious** — Eco badges highlighted, green alternatives suggested
  - **Green Priority** — Eco options sorted first, carbon impact always visible

- **Builder Configuration**: Builders control whether eco features are enabled per project, and can mark projects as "Green Build" to enable full sustainability tracking.

---

## Database Tables

```
v2_selection_categories
  id, builder_id, project_id, name, room, sort_order, pricing_model (allowance|fixed|cost_plus),
  allowance_amount, deadline, lead_time_buffer_days, schedule_task_id, assigned_to,
  status, designer_access, notes, created_at, updated_at

v2_selection_options
  id, category_id, name, description, vendor_id, sku, model_number,
  unit_price, quantity, total_price, lead_time_days, availability_status,
  source (builder|designer|client|catalog), is_recommended, sort_order, created_by, created_at,
  -- Sustainability fields
  material_carbon_data_id, carbon_per_unit, recycled_content_pct, is_locally_sourced,
  local_source_distance_miles, eco_certifications, eco_score

v2_selection_option_media
  id, option_id, file_url, file_type (image|pdf|link), caption, sort_order, created_at

v2_selection_option_configs
  id, option_id, parent_config_id, config_group, config_name, config_value,
  price_impact, sort_order

v2_selections
  id, category_id, option_id, selected_by, selected_at, confirmed_by, confirmed_at,
  signature_url, status, change_reason, superseded_by, created_at

v2_selection_history
  id, category_id, option_id, action (viewed|considered|selected|deselected|changed),
  actor_id, actor_role, notes, created_at

v2_selection_comments
  id, category_id, author_id, author_role (client|builder|designer), body, created_at

v2_selection_inspiration
  id, category_id, uploaded_by, file_url, source_url, caption, created_at

v2_selection_change_requests
  id, selection_id, new_option_id, reason, cancellation_fee, restocking_fee,
  schedule_impact_days, change_order_id, status (requested|evaluated|approved|rejected), created_at

v2_selection_templates
  id, builder_id, name, project_type, categories_json, created_at
```

---

## API Endpoints

```
# Categories
GET    /api/v2/projects/:projectId/selections/categories       # List categories for project
POST   /api/v2/projects/:projectId/selections/categories       # Create category
PUT    /api/v2/selections/categories/:id                       # Update category
DELETE /api/v2/selections/categories/:id                       # Delete category
POST   /api/v2/projects/:projectId/selections/categories/from-template  # Apply template

# Options
GET    /api/v2/selections/categories/:catId/options            # List options in category
POST   /api/v2/selections/categories/:catId/options            # Add option
PUT    /api/v2/selections/options/:id                          # Update option
DELETE /api/v2/selections/options/:id                          # Remove option
POST   /api/v2/selections/options/:id/media                    # Upload media for option
GET    /api/v2/selections/categories/:catId/compare            # Side-by-side comparison data

# Client Selection Actions
POST   /api/v2/selections/categories/:catId/select             # Client selects an option
POST   /api/v2/selections/:id/confirm                          # Builder confirms selection
POST   /api/v2/selections/:id/change-request                   # Client requests change
PUT    /api/v2/selections/change-requests/:id                  # Builder evaluates change request

# Comments & Inspiration
GET    /api/v2/selections/categories/:catId/comments           # List comments
POST   /api/v2/selections/categories/:catId/comments           # Add comment
POST   /api/v2/selections/categories/:catId/inspiration        # Upload inspiration image/link
GET    /api/v2/selections/categories/:catId/inspiration        # List inspiration items

# Budget & Tracking
GET    /api/v2/projects/:projectId/selections/budget-impact    # Full budget impact summary
GET    /api/v2/projects/:projectId/selections/overdue          # Overdue selections with schedule impact
GET    /api/v2/projects/:projectId/selections/status-summary   # Status counts by category

# PO Generation
POST   /api/v2/selections/:id/generate-po                     # Generate PO from confirmed selection

# Export & Reports
GET    /api/v2/projects/:projectId/selections/export/pdf       # PDF selection summary
GET    /api/v2/projects/:projectId/selections/export/excel     # Excel export

# History
GET    /api/v2/selections/categories/:catId/history            # Full decision history

# Templates
GET    /api/v2/selections/templates                            # List builder's templates
POST   /api/v2/selections/templates                            # Create template from project
```

---

## UI Components

| Component | Description |
|-----------|-------------|
| `SelectionDashboard` | Overview of all categories by room with status badges and progress |
| `RoomBoard` | Visual room-based grouping of selections (like Materio boards) |
| `SelectionCategoryCard` | Card showing category name, status, deadline, allowance, selection |
| `OptionCard` | Rich card with photo, description, price, lead time, vendor |
| `OptionComparison` | Side-by-side comparison of 2-4 options in a category |
| `BudgetImpactBar` | Real-time bar showing allowance, selected cost, overage/credit |
| `CumulativeBudgetSummary` | Running total of all selections vs. total allowances |
| `DeadlineCountdown` | Countdown showing days remaining with urgency color coding |
| `InspirationBoard` | Grid of uploaded inspiration photos/links per category |
| `CommentThread` | Threaded discussion per category with role badges |
| `SelectionTimeline` | History view showing all actions on a category |
| `ComplexConfigurator` | Nested sub-selection UI for items like cabinetry |
| `DesignerPanel` | Designer-specific view with recommend/add-option actions |
| `SelectionSummaryPDF` | Print-ready PDF with photos, pricing, and selections |
| `ChangeRequestForm` | Form showing original selection, proposed change, fees, and impact |
| `ClientSelectionPortal` | Full client-facing experience for browsing and selecting |

---

## Dependencies

- **Module 3: Core Data Model** -- project context, cost code linking
- **Module 7: Scheduling** -- deadline calculation from schedule tasks, lead time integration
- **Module 9: Budget & Cost Tracking** -- allowance tracking, budget impact feeds
- **Module 10: Contact/Vendor Management** -- vendor/supplier data for options
- **Module 12: Basic Client Portal** -- client authentication and portal access
- **Module 6: Document Storage** -- photo/media storage for options and inspiration
- **Module 17: Change Order Management** -- selection overage change orders
- **Module 20: Estimating Engine** -- allowance amounts from estimate

---

## Open Questions

1. Should vendor catalog integration (Gap 372) be in V1 scope, or deferred to V2? If V1, which catalog format (API, CSV import, manual)?
2. How should complex configurators (Gap 373) be defined -- builder creates a configuration tree per category, or is this a per-item override?
3. For multi-home selections (Gap 379), should the UI present a matrix view (units as columns, selections as rows) or per-unit views?
4. Should the inspiration board support Pinterest API integration, or just image uploads and URLs?
5. What is the e-signature implementation -- embedded (e.g., signature pad) or integration with DocuSign/HelloSign?
6. How should selection pricing display to clients -- show actual cost, show allowance impact only, or configurable per builder?
