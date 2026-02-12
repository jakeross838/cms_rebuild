# Edge Case Catalog

## Purpose
This document catalogs ALL edge case gap items from Sections 44-48 of the expanded gap analysis. Each edge case is mapped to the module(s) that must handle it, ensuring no scenario falls through the cracks during development.

**Source:** `docs/specs/gap-analysis-expanded.md` Sections 44-48 (Items 599-845)

---

## Section 44: Unusual Business Scenarios (Items 599-620)

These are real situations that will eventually happen to some builder on the platform. The system must handle them gracefully rather than requiring manual workarounds.

| Gap # | Scenario | Module(s) Responsible | Priority | Notes |
|-------|----------|----------------------|----------|-------|
| 599 | Client goes bankrupt mid-construction — lien filing, partial billing, project hold, close-out | **Financial**, **Contracts/Legal**, **Closeout**, **Documents** | P2 | Must support lien documentation by state, partial billing freeze, and project hold status |
| 600 | Builder acquires another builder's in-progress project — onboard mid-stream | **Projects**, **Documents**, **Budget**, **Schedule** | P3 | Bulk import of existing project data, mid-project snapshot creation, vendor re-linking |
| 601 | Builder fires subcontractor mid-scope — termination, scope reassignment | **Vendors**, **Punch Lists**, **Schedule**, **POs**, **Vendor Portal** | P2 | Termination documentation, PO closure/credit, scope reassignment to new vendor, schedule impact |
| 602 | Project paused 12+ months (financing issue) — vendor suspension, permit extensions | **Schedule**, **Vendors**, **Permits**, **Budget**, **Time Clock** | P2 | Project "paused" status, cost escalation recalculation on resume, permit extension tracking |
| 603 | Property sold during construction — contract assignment, new owner | **Contracts**, **Client Portal**, **Documents** | P3 | Contract assignment workflow, portal access transfer, closing documentation |
| 604 | Architect fired mid-project — plan revision, responsibility transition | **RFIs**, **Documents**, **Submittals** | P3 | RFI routing updates, plan revision management, new architect onboarding checklist |
| 605 | Client divorce during construction — dual communication, split authority | **Client Portal**, **Notifications**, **Email Marketing** | P3 | Dual contact support, configurable communication preferences, legal sensitivity flags |
| 606 | Builder's key employee dies/incapacitated — documentation continuity | **All Modules** | P1 | All data must be role-accessible (not user-locked), complete audit trails, admin override access |
| 607 | Material supplier goes bankrupt — deposit recovery, alternative sourcing | **Vendors**, **POs**, **Bids**, **Budget**, **Schedule** | P3 | Deposit tracking, emergency re-bid workflow, schedule impact recalculation |
| 608 | Building department changes requirements mid-project | **Permits**, **Budget**, **Schedule**, **Documents** | P2 | Requirement change tracking, cost impact assessment, plan revision cycle management |
| 609 | Adjacent property owner sues to stop construction | **Documents**, **Schedule**, **Notifications** | P3 | Legal hold on project documents, project pause workflow, communication restriction flags |
| 610 | Client wants to self-perform some work | **Contracts**, **Warranties**, **Schedule**, **Insurance** | P3 | Owner-builder scope tracking, warranty exclusion flags, insurance requirement documentation |
| 611 | Project featured on TV/magazine — photo approvals, NDA management | **Photos**, **Documents**, **Email Marketing** | P4 | Photo approval workflow, NDA tracking, site visit scheduling |
| 612 | Builder expands into light commercial — different contract types | **Contracts**, **Templates**, **Budget**, **Compliance** | P3 | Multiple contract type support, prevailing wage tracking, bonding requirements |
| 613 | Natural disaster damages in-progress project | **Insurance**, **Budget**, **Schedule**, **Documents**, **Client Portal** | P2 | Insurance claim documentation, reconstruction scope, schedule rebuild, client communication |
| 614 | Pandemic causes work stoppage — force majeure | **Contracts**, **Vendors**, **Schedule**, **Budget** | P3 | Force majeure documentation, vendor payment pause, schedule extension, remote management tools |
| 615 | Builder decides to sell the business — comprehensive documentation | **All Modules**, **Reports**, **Email Marketing** | P3 | Full business data export — projects, pipeline, vendor relationships, financial history |
| 616 | Multiple builders on same subdivision — shared infrastructure costs | **Budget**, **Vendors**, **Integrations** | P4 | Cross-tenant cost sharing, common area budgets, HOA formation documentation |
| 617 | Client builds ADU alongside main home — same or separate project? | **Projects**, **Permits**, **Budget**, **Schedule** | P3 | Sub-project or linked project support, separate permits, different code requirements |
| 618 | Joint venture with another builder — data sharing | **Integrations**, **Vendor Portal**, **Budget** | P4 | Cross-tenant data sharing APIs, joint project access controls |
| 619 | Local building code adopts new edition mid-year | **Permits**, **Compliance**, **Notifications** | P3 | Code change alerts for affected active projects, updated inspection requirements |
| 620 | Builder hires construction manager / owner's rep — oversight access | **Users/Roles**, **Tasks**, **All Modules** | P2 | Read-only oversight role with access to everything, configurable per project |

---

## Section 45: Per-Page Feature Requirements (Items 621-796)

These are interactive features required on each page. Missing any results in a "why can't I just..." moment. Summarized by page.

### Dashboard Page (Items 621-632)
| Gap # | Feature | Module(s) |
|-------|---------|-----------|
| 621 | Configurable widget layout per user | **Dashboard** |
| 622 | Widget library (budget, schedule, alerts, weather, photos) | **Dashboard** |
| 623 | Cross-widget project filtering | **Dashboard** |
| 624 | Drill-down from any number to underlying transactions | **Dashboard**, **Budget**, **Financial** |
| 625 | Date range selector (week, month, quarter, custom) | **Dashboard** |
| 626 | Comparison toggle (this period vs. last period) | **Dashboard**, **Reports** |
| 627 | Refresh button / auto-refresh interval | **Dashboard** |
| 628 | Export dashboard as PDF | **Dashboard**, **Reports** |
| 629 | "Needs attention" priority queue with dismiss/snooze | **Dashboard**, **Tasks** |
| 630 | Quick action buttons (create daily log, RFI, approve invoice) | **Dashboard** |
| 631 | Activity feed (recent actions across all projects) | **Dashboard**, **Activity Logs** |
| 632 | KPI sparklines for trending indicators | **Dashboard**, **Reports** |

### Project List Page (Items 633-646)
| Gap # | Feature | Module(s) |
|-------|---------|-----------|
| 633 | Sortable by any column | **Projects** |
| 634 | Filterable by multiple criteria simultaneously | **Projects** |
| 635 | Saveable filter presets | **Projects**, **UX** |
| 636 | Shareable filter presets (team-wide views) | **Projects**, **UX** |
| 637 | Bulk actions (archive, reassign PM, update status) | **Projects** |
| 638 | Customizable columns | **Projects**, **UX** |
| 639 | Column resize and reorder | **Projects**, **UX** |
| 640 | Compact vs. card view toggle | **Projects**, **UX** |
| 641 | Map view (see projects on a map) | **Projects**, **Maps Integration** |
| 642 | Quick inline editing | **Projects** |
| 643 | Color coding / tags (configurable per builder) | **Projects**, **Settings** |
| 644 | Favorite/pin projects for quick access | **Projects**, **UX** |
| 645 | Project health indicators (red/yellow/green) | **Projects**, **Budget**, **Schedule** |
| 646 | Search within project list | **Projects**, **Search** |

### Project Detail / Overview Page (Items 647-657)
| Gap # | Feature | Module(s) |
|-------|---------|-----------|
| 647 | Summary cards (Budget, Schedule, Documents, RFIs, COs, Punch) | **Projects** |
| 648 | Project info section (address, client, PM, contract details) | **Projects** |
| 649 | Quick navigation to any module | **Projects**, **UX** |
| 650 | Activity timeline (chronological history) | **Projects**, **Activity Logs** |
| 651 | Project notes / journal | **Projects** |
| 652 | Team roster (assigned users and roles) | **Projects**, **Users** |
| 653 | Key milestone tracker (permit, groundbreaking, dry-in, CO) | **Projects**, **Schedule** |
| 654 | Project risk register | **Projects** |
| 655 | Project photo carousel (recent daily log photos) | **Projects**, **Photos** |
| 656 | Weather widget for project location | **Projects**, **Weather API** |
| 657 | Quick stats (days since start, estimated remaining, % complete) | **Projects**, **Schedule** |

### Budget Page (Items 658-672)
| Gap # | Feature | Module(s) |
|-------|---------|-----------|
| 658 | Expandable/collapsible hierarchy (Division -> Code -> Line) | **Budget** |
| 659 | Multiple budget views (original, current, committed, actual, projected) | **Budget** |
| 660 | Variance column with color coding | **Budget** |
| 661 | Percentage indicators (% consumed, % complete) | **Budget** |
| 662 | Cost-to-complete column (auto-calc or manual override) | **Budget** |
| 663 | Budget line item notes | **Budget** |
| 664 | Attached documents per line (invoices, POs, bids) | **Budget**, **Documents** |
| 665 | Filter by trade, phase, cost code, status | **Budget** |
| 666 | Budget history / snapshots (budget at any point in time) | **Budget** |
| 667 | Import/export to Excel | **Budget** |
| 668 | Compare to similar projects (benchmarking) | **Budget**, **AI** |
| 669 | Forecast scenarios ("what if concrete goes up 10%?") | **Budget**, **AI** |
| 670 | Change order impact visualization | **Budget**, **Change Orders** |
| 671 | Locked/frozen lines (finalized vs. estimating) | **Budget** |
| 672 | Audit trail per line | **Budget**, **Activity Logs** |

### Schedule Page (Items 673-691)
| Gap # | Feature | Module(s) |
|-------|---------|-----------|
| 673 | Gantt chart with drag-and-drop | **Schedule** |
| 674 | Calendar view toggle | **Schedule** |
| 675 | List view toggle | **Schedule** |
| 676 | Kanban board toggle (by status) | **Schedule** |
| 677 | Two-week look-ahead view | **Schedule** |
| 678 | Filter by trade, phase, critical path, status | **Schedule** |
| 679 | Dependency arrows (predecessor/successor) | **Schedule** |
| 680 | Resource assignment and leveling view | **Schedule** |
| 681 | Baseline comparison overlay (planned vs. actual) | **Schedule** |
| 682 | Weather overlay on calendar | **Schedule**, **Weather API** |
| 683 | Milestone markers with labels | **Schedule** |
| 684 | Progress indicators per task (0-100%) | **Schedule** |
| 685 | Task detail panel (notes, photos, vendor, duration) | **Schedule** |
| 686 | Print/export in multiple formats | **Schedule**, **Reports** |
| 687 | Schedule health indicators (critical path, at-risk) | **Schedule** |
| 688 | Vendor schedule view (filter to one vendor) | **Schedule**, **Vendors** |
| 689 | Client-friendly schedule view (simplified milestones) | **Schedule**, **Client Portal** |
| 690 | Schedule conflict detection (same space simultaneously) | **Schedule** |
| 691 | Bulk schedule operations (shift all by N days, reassign) | **Schedule** |

### Invoice / Billing Page (Items 692-707)
| Gap # | Feature | Module(s) |
|-------|---------|-----------|
| 692 | Invoice queue by status | **Invoices** |
| 693 | AI-extracted data with confidence indicators | **Invoices**, **AI** |
| 694 | Side-by-side view (image left, data right) | **Invoices** |
| 695 | One-click approval/rejection with required comment | **Invoices** |
| 696 | Cost code assignment with smart suggestions | **Invoices**, **AI** |
| 697 | Budget impact preview before approval | **Invoices**, **Budget** |
| 698 | Batch approval | **Invoices** |
| 699 | Invoice history per vendor | **Invoices**, **Vendors** |
| 700 | Duplicate detection alerts | **Invoices**, **AI** |
| 701 | Payment status tracking (approved -> scheduled -> paid -> cleared) | **Invoices**, **Payments** |
| 702 | Lien waiver status indicator per invoice | **Invoices**, **Lien Waivers** |
| 703 | Retainage auto-calculation | **Invoices**, **Financial** |
| 704 | Link to PO and contract for comparison | **Invoices**, **POs**, **Contracts** |
| 705 | Aging report (invoices by days outstanding) | **Invoices**, **Reports** |
| 706 | Payment run generation (batch payment) | **Invoices**, **Payments** |
| 707 | Export to accounting system | **Invoices**, **Integrations** |

### Vendor Profile Page (Items 708-723)
| Gap # | Feature | Module(s) |
|-------|---------|-----------|
| 708 | Contact information, addresses, key personnel | **Vendors** |
| 709 | Insurance status with expiration countdown | **Vendors**, **Compliance** |
| 710 | License status with verification link | **Vendors**, **Compliance** |
| 711 | Performance scorecard | **Vendors**, **AI** |
| 712 | Job history with per-job performance | **Vendors** |
| 713 | Financial summary (spend, avg invoice, payment history) | **Vendors**, **Financial** |
| 714 | Active contracts and POs | **Vendors**, **POs** |
| 715 | Open punch items across all jobs | **Vendors**, **Punch Lists** |
| 716 | Schedule reliability metrics | **Vendors**, **Schedule** |
| 717 | Bid history (won/lost, pricing trends) | **Vendors**, **Bids** |
| 718 | Communication log | **Vendors**, **Communications** |
| 719 | Document repository (COI, W-9, contracts, lien waivers) | **Vendors**, **Documents** |
| 720 | Notes and tags (internal) | **Vendors** |
| 721 | Related vendors (subsidiaries) | **Vendors** |
| 722 | Capacity indicator | **Vendors** |
| 723 | Quick actions (Create PO, Invite to Bid, Send Message) | **Vendors** |

### Selection Page — Client-Facing (Items 724-735)
| Gap # | Feature | Module(s) |
|-------|---------|-----------|
| 724 | Visual room-by-room layout | **Selections**, **Client Portal** |
| 725 | Selection cards with photos, pricing, lead times | **Selections** |
| 726 | Comparison mode (side-by-side options) | **Selections** |
| 727 | Budget impact real-time calculator | **Selections**, **Budget** |
| 728 | Approval button with e-signature | **Selections**, **Contracts** |
| 729 | Status indicators (Not Started -> Installed) | **Selections** |
| 730 | Deadline countdown | **Selections**, **Schedule** |
| 731 | Inspiration board (client uploads photos) | **Selections**, **Client Portal** |
| 732 | Comment/question thread per category | **Selections**, **Communications** |
| 733 | History of all considered options | **Selections** |
| 734 | Print/export selection summary | **Selections**, **Reports** |
| 735 | Designer view for interior designer recommendations | **Selections**, **Users/Roles** |

### Daily Log Page (Items 736-753)
| Gap # | Feature | Module(s) |
|-------|---------|-----------|
| 736 | Date selector with calendar navigation | **Daily Logs** |
| 737 | Auto-populated weather data | **Daily Logs**, **Weather API** |
| 738 | Workforce tracker (vendors on site, worker counts) | **Daily Logs**, **Time Clock** |
| 739 | Work performed narrative with AI assist | **Daily Logs**, **AI** |
| 740 | Material delivery log | **Daily Logs**, **POs** |
| 741 | Equipment on site | **Daily Logs**, **Equipment** |
| 742 | Visitor log | **Daily Logs** |
| 743 | Safety observations | **Daily Logs**, **Safety** |
| 744 | Photo upload (drag-and-drop, bulk) | **Daily Logs**, **Photos** |
| 745 | Carry forward from yesterday | **Daily Logs** |
| 746 | Linked schedule tasks | **Daily Logs**, **Schedule** |
| 747 | Issue/delay reporting with cause categorization | **Daily Logs** |
| 748 | Voice-to-text entry | **Daily Logs**, **Mobile** |
| 749 | Preview mode before submitting | **Daily Logs** |
| 750 | Edit history with audit trail after submission | **Daily Logs**, **Activity Logs** |
| 751 | Daily log gallery (all photos in grid) | **Daily Logs**, **Photos** |
| 752 | Export daily log as PDF | **Daily Logs**, **Reports** |
| 753 | Notification confirmation on submission | **Daily Logs**, **Notifications** |

### Document Management Page (Items 754-768)
| Gap # | Feature | Module(s) |
|-------|---------|-----------|
| 754 | Configurable folder tree navigation | **Documents** |
| 755 | Drag-and-drop upload with auto-categorization | **Documents**, **AI** |
| 756 | Bulk upload with progress indicator | **Documents** |
| 757 | Full-text search across all documents | **Documents**, **Search** |
| 758 | Filter by type, trade, date, uploaded by | **Documents** |
| 759 | Version history with comparison tool | **Documents** |
| 760 | Document preview without downloading | **Documents** |
| 761 | Annotation/markup tools | **Documents** |
| 762 | Sharing controls (who can see) | **Documents**, **Permissions** |
| 763 | Expiration tracking with alerts | **Documents**, **Notifications** |
| 764 | Download with watermark option | **Documents** |
| 765 | Batch operations (move, tag, delete, share) | **Documents** |
| 766 | Recent documents and favorites | **Documents**, **UX** |
| 767 | Document status indicators | **Documents** |
| 768 | E-signature platform integration | **Documents**, **Integrations** |

### Reports Page (Items 769-780)
| Gap # | Feature | Module(s) |
|-------|---------|-----------|
| 769 | Report library (pre-built, organized by category) | **Reports** |
| 770 | Report builder (drag-and-drop custom creation) | **Reports** |
| 771 | Report scheduling (auto-generate and email) | **Reports**, **Notifications** |
| 772 | Report favorites and recently run | **Reports**, **UX** |
| 773 | Parameter selection before running | **Reports** |
| 774 | Export to PDF, Excel, Word, CSV | **Reports** |
| 775 | Interactive charts (hover, click to drill down) | **Reports** |
| 776 | Comparative reporting (2+ projects or periods) | **Reports** |
| 777 | Report templates saveable and shareable | **Reports**, **Templates** |
| 778 | Client-formatted reports with builder branding | **Reports**, **Branding** |
| 779 | AI-generated narrative summaries | **Reports**, **AI** |
| 780 | Report archiving (snapshot for historical reference) | **Reports** |

### Settings / Admin Page (Items 781-796)
| Gap # | Feature | Module(s) |
|-------|---------|-----------|
| 781 | Company profile (name, logo, address, licenses, insurance) | **Settings** |
| 782 | User management (create, edit, deactivate) | **Settings**, **Users** |
| 783 | Role/permission configuration (custom roles, granular) | **Settings**, **Permissions** |
| 784 | Cost code management | **Settings**, **Budget** |
| 785 | Workflow configuration (approval chains, thresholds) | **Settings** |
| 786 | Notification preferences (triggers, roles, channels) | **Settings**, **Notifications** |
| 787 | Integration management (connect/disconnect, sync status) | **Settings**, **Integrations** |
| 788 | Template management (documents, estimates, checklists, emails) | **Settings**, **Templates** |
| 789 | Custom field management (on any entity) | **Settings** |
| 790 | Billing / subscription management | **Settings**, **Billing** |
| 791 | Data import/export tools | **Settings**, **Integrations** |
| 792 | API key management | **Settings**, **Integrations** |
| 793 | Audit log viewer (searchable history) | **Settings**, **Activity Logs** |
| 794 | Branding configuration (colors, logo, portal) | **Settings**, **Branding** |
| 795 | Regional settings (timezone, date, currency, tax) | **Settings** |
| 796 | Module enable/disable (optional modules) | **Settings** |

---

## Section 46: Legal & Dispute Scenarios (Items 797-805)

These represent legal situations that require specific system support for documentation and workflow management.

| Gap # | Scenario | Module(s) Responsible | Priority | Notes |
|-------|----------|----------------------|----------|-------|
| 797 | Mechanic's lien documentation by state | **Financial**, **Documents**, **Contracts** | P2 | State-specific lien forms, filing deadline alerts, preliminary notice tracking. Each state has different rules (FL, CA, TX all differ). |
| 798 | Discovery/litigation hold (prevent deletion during legal proceedings) | **Documents**, **All Modules** | P2 | Legal hold flag per project that blocks all delete operations. Must preserve all communications, photos, logs. |
| 799 | OSHA citation documentation and response tracking | **Safety**, **Documents**, **Compliance** | P3 | Citation tracking, response deadlines, corrective action plans, follow-up inspection scheduling. |
| 800 | Construction defect claim workflows by state (FL 558, CA SB800) | **Warranties**, **Documents**, **Contracts** | P2 | State-specific defect claim templates with statutory notice periods, response deadlines, expert inspection scheduling. |
| 801 | Warranty claim dispute resolution documentation | **Warranties**, **Documents** | P2 | Dispute tracking fields, resolution documentation, communication logs, expert reports. |
| 802 | Expert witness documentation support | **Documents**, **Reports**, **All Modules** | P3 | Organized export of complete project records — chronological, searchable, with audit trails for legal testimony. |
| 803 | Non-compete and non-solicitation tracking (employees and vendors) | **HR**, **Vendors**, **Contracts** | P4 | Agreement tracking, expiration dates, restriction scope, violation alerts. |
| 804 | Contract interpretation disputes (store contract language + correspondence) | **Contracts**, **Documents**, **RFIs** | P2 | Immutable contract storage, linked correspondence, version history, interpretation notes. |
| 805 | Government audit preparation (prevailing wage, tax, safety) | **Financial**, **HR**, **Safety**, **Reports** | P3 | Organized documentation export by audit type, configurable per regulatory requirement. |

---

## Section 47: Financial Edge Cases (Items 806-825)

Financial scenarios that standard accounting flows do not cover but construction finance regularly encounters.

| Gap # | Scenario | Module(s) Responsible | Priority | Notes |
|-------|----------|----------------------|----------|-------|
| 806 | Client overpays — refund processing and tracking | **Financial**, **Invoices** | P2 | Overpayment detection, credit memo generation, refund workflow, accounting reconciliation. |
| 807 | Vendor underpays a credit — collection and dispute tracking | **Financial**, **Vendors** | P3 | Credit tracking, collection workflow, dispute documentation. |
| 808 | Construction loan with unusual draw structures | **Financial**, **Draw Requests** | P2 | Configurable draw schedules beyond standard AIA format, multiple disbursement structures. |
| 809 | Multiple funding sources (client, lender, investor) | **Financial**, **Draw Requests** | P3 | Multi-source funding allocation, separate draw requests per source, consolidated reporting. |
| 810 | Barter arrangements (vendor trades work for other consideration) | **Financial**, **Vendors**, **POs** | P4 | Non-monetary transaction tracking, fair market value documentation, tax implications. |
| 811 | Escrow requirements for deposits (jurisdiction-specific) | **Financial**, **Contracts**, **Compliance** | P3 | Escrow account tracking, jurisdiction-specific rules, release conditions. |
| 812 | Insurance proceeds after damage | **Financial**, **Insurance**, **Budget** | P3 | Insurance claim tracking, applying proceeds to reconstruction costs, separate budget tracking. |
| 813 | Cost-plus audit by client — transparent cost documentation | **Financial**, **Reports**, **Documents** | P2 | Comprehensive cost export with supporting documents, organized by cost code for client review. |
| 814 | Progress billing when work complete but not inspected | **Invoices**, **Schedule**, **Time Clock** | P2 | Configurable billing rules — bill on completion vs. bill on inspection pass. |
| 815 | Force majeure financial impact (cost escalation, remobilization) | **Budget**, **Contracts**, **Schedule** | P3 | Extended general conditions calculation, remobilization cost tracking, cost escalation recalculation. |
| 816 | Bonus/penalty clauses — milestone tracking with auto-calculation | **Contracts**, **Schedule**, **Financial** | P3 | Configurable bonus/penalty formulas tied to milestone completion dates, automatic financial calculation. |
| 817 | Liquidated damages — daily rate when project exceeds completion date | **Contracts**, **Schedule**, **Financial** | P2 | LD rate configuration, automatic calculation from schedule, daily accrual tracking. |
| 818 | Shared costs between projects — configurable allocation methods | **Budget**, **Financial** | P3 | Allocation rules (%, equal split, usage-based), cross-project cost distribution with audit trail. |
| 819 | Year-end financial close — preventing changes to closed periods | **Financial**, **Settings** | P2 | Period close functionality, lock date enforcement, close/reopen workflow with authorization. |
| 820 | Multi-year project financial reporting (costs span fiscal years) | **Financial**, **Reports** | P2 | Fiscal year configuration per builder, cross-year reporting, WIP schedule by year. |
| 821 | Currency conversion for imported materials (exchange rates) | **Financial**, **POs** | P4 | Exchange rate tracking, conversion at PO time vs. payment time, gain/loss reporting. |
| 822 | Contingency drawdown authorization | **Budget**, **Financial** | P2 | Configurable approval requirements for contingency access, authorization workflow, remaining balance tracking. |
| 823 | Budget contingency reallocation (move funds to specific cost codes) | **Budget** | P2 | Reallocation workflow with documentation, approval chain, before/after tracking. |
| 824 | Profit margin analysis including COs, warranty costs, GC overrun | **Reports**, **Financial**, **Budget** | P2 | True profit calculation formula: contract + COs - actual costs - warranty costs - GC overrun. |
| 825 | Cash-basis vs. accrual-basis reporting toggle | **Financial**, **Reports** | P2 | Dual reporting basis, configurable per builder (accountant preference), toggle on financial reports. |

---

## Section 48: Technology Edge Cases (Items 826-845)

Technical scenarios that affect reliability, performance, and user experience, especially in construction field conditions.

| Gap # | Scenario | Module(s) Responsible | Priority | Notes |
|-------|----------|----------------------|----------|-------|
| 826 | Multi-day power outage (hurricanes) — extensive offline capability | **Mobile/PWA**, **All Modules** | P1 | Extended offline storage (days not hours), prioritized sync queue, conflict resolution on reconnect. |
| 827 | Photo metadata discrepancies (camera time vs. phone time vs. server time) | **Photos**, **Daily Logs**, **Time Clock** | P2 | Use server time as canonical, store device time as secondary, flag discrepancies in audit log. |
| 828 | Large plan set rendering on mobile devices | **Documents**, **Mobile** | P2 | Progressive tile loading, zoom performance optimization, thumbnail fallback for low-end devices. |
| 829 | Field connectivity dead zones (islands, basements, rural areas) | **Mobile/PWA**, **All Modules** | P1 | Robust offline mode with background sync, data-light mode, queue management for poor connectivity. |
| 830 | Device diversity (old iPads, cheap Android, new iPhones) | **Mobile/PWA**, **UX** | P2 | Graceful degradation, progressive enhancement, minimum device requirements documented. |
| 831 | Browser compatibility (Chrome, Safari, Firefox, Edge) | **Frontend**, **UX** | P1 | Cross-browser testing matrix, consistent experience, polyfills where needed. |
| 832 | Print formatting (reports, schedules, budgets on standard paper) | **Reports**, **Schedule**, **Budget** | P2 | Print CSS, @media print styles, explicit page break handling, landscape/portrait per report type. |
| 833 | Email deliverability (notifications not going to spam) | **Notifications**, **Email Marketing** | P2 | SPF/DKIM/DMARC configuration, SendGrid reputation monitoring, deliverability testing. |
| 834 | Data export volume (5 years of data) — performance considerations | **Integrations**, **Reports** | P3 | Background export jobs, streaming download, chunked processing, format optimization. |
| 835 | API rate limiting for integrations | **Integrations**, **API** | P2 | Per-integration rate limits, queue with backoff, monitoring dashboard, alert on threshold breach. |
| 836 | File format handling (PDFs, DWGs, Excel, Word, images, videos) | **Documents** | P2 | Format-specific viewers, conversion pipeline for preview, download fallback for unsupported formats. |
| 837 | Character set handling (accented characters, Spanish-speaking teams) | **All Modules**, **Database** | P2 | UTF-8 throughout, input validation for all text fields, collation-aware sorting. |
| 838 | Session management across devices (phone -> desktop seamlessly) | **Auth**, **UX** | P2 | Real-time state sync via SSE/WebSocket, consistent session across devices, last-viewed context restoration. |
| 839 | Deep linking (email link directly to specific invoice/task/document) | **All Modules**, **Notifications** | P1 | URL-addressable routes for all entities, notification emails include direct links, auth redirect to target after login. |
| 840 | Concurrent user performance (50 users from one builder) | **Backend**, **Database** | P2 | Connection pooling, query optimization, caching strategy, load testing targets per tenant. |
| 841 | Search performance (full-text across millions of documents) | **Search**, **Documents** | P2 | Search indexing (Elasticsearch or similar), query optimization, result ranking, incremental indexing. |
| 842 | Notification delivery timing (urgent within 30 seconds) | **Notifications**, **Realtime** | P2 | Priority queue for urgent notifications, SSE/WebSocket for real-time, push notification fallback. |
| 843 | Mobile app update management (force update for critical fixes) | **Mobile/PWA** | P3 | Version check on app open, force update for critical versions, optional update prompt for features. |
| 844 | Third-party dependency management (service pricing changes or goes down) | **Integrations**, **Infrastructure** | P3 | Dependency monitoring, fallback services, cost alerting, graceful degradation when services unavailable. |
| 845 | Data anonymization for demo/sales purposes | **Platform Admin**, **Reports** | P4 | Demo data generator, anonymization pipeline for real data, configurable per entity type. |

---

## Cross-Reference: Edge Cases by Module

This reverse index shows which modules carry the most edge case responsibility.

| Module | Edge Case Items | Count |
|--------|----------------|-------|
| **Financial / Budget** | 599, 602, 606, 607, 608, 612, 613, 615, 797, 805, 806-825 | 30+ |
| **Documents** | 599, 600, 604, 606, 608, 609, 611, 613, 798, 802, 804, 754-768 | 25+ |
| **Schedule** | 600, 601, 602, 607, 608, 613, 614, 673-691 | 20+ |
| **Vendors / Vendor Portal** | 601, 607, 610, 616, 618, 708-723, 803 | 20+ |
| **Contracts / Legal** | 599, 603, 604, 610, 612, 614, 797, 800, 804, 805, 816, 817 | 15+ |
| **Mobile / PWA** | 826, 828, 829, 830, 831, 843 | 6 |
| **Notifications** | 605, 609, 619, 833, 842 | 5 |
| **Warranties** | 610, 800, 801 | 3 |
| **Integrations** | 616, 618, 834, 835, 844 | 5 |
| **All Modules** | 606, 615, 798, 837, 839 | 5 (pervasive) |

---

## Implementation Priority Summary

| Priority | Description | Item Count |
|----------|-------------|------------|
| **P1** | Must handle from day one (data integrity, offline, browser compat, deep linking) | ~10 |
| **P2** | Required for production readiness (lien docs, legal holds, financial closes, performance) | ~35 |
| **P3** | Needed for competitive parity (multi-funding, escrow, code changes, disaster recovery) | ~25 |
| **P4** | Differentiation features (barter tracking, currency conversion, anonymization, TV features) | ~8 |

---

## Revision History
| Date | Change |
|------|--------|
| 2026-02-11 | Initial creation — cataloged all edge cases from gap analysis sections 44-48 |
