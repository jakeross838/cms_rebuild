# Buildertrend Feature Comparison & Gap Analysis

## Overview

This document compares the RossOS design against Buildertrend, the industry-leading construction management software, to identify missing features and prioritize development.

**Sources:**
- [Buildertrend Product Overview](https://buildertrend.com/product-overview/)
- [Buildertrend Project Management](https://buildertrend.com/project-management/)
- [Buildertrend Financial Tools](https://buildertrend.com/financial-tools/)
- [Buildertrend Communication](https://buildertrend.com/communication/)
- [Buildertrend Sales Process](https://buildertrend.com/sales-process/)

---

## Feature Comparison Matrix

### Legend
- ✅ **Have** - Feature is planned/designed
- ⚠️ **Partial** - Some functionality, needs expansion
- ❌ **Missing** - Not in current design
- 🔄 **Different** - We do it differently (may be better)

---

## 1. SALES & CRM

| Feature | Buildertrend | RossOS | Status |
|---------|--------------|----------------|--------|
| Lead Pipeline (Kanban) | ✓ | ✓ | ✅ Have |
| Lead Activities | ✓ | ✓ | ✅ Have |
| Lead Tasks/Reminders | ✓ | ✓ | ✅ Have |
| Lead Files | ✓ | ✓ | ✅ Have |
| Lead → Job Conversion | ✓ | ✓ | ✅ Have |
| Email Marketing/Campaigns | ✓ | - | ❌ Missing |
| Automated Follow-ups | ✓ | - | ❌ Missing |
| CRM Integrations (HubSpot, Salesforce) | ✓ | - | ❌ Missing |
| Lead Map (Geographic) | ✓ | - | ❌ Missing |
| Lead Source Tracking | ✓ | ✓ | ✅ Have |
| Lead Proposals | ✓ | Via Job | 🔄 Different |

**Notes:** Buildertrend allows proposals directly from leads. Our design creates job first, then estimate/proposal. Our approach is cleaner for job costing.

---

## 2. PRE-CONSTRUCTION

| Feature | Buildertrend | RossOS | Status |
|---------|--------------|----------------|--------|
| Estimates | ✓ | ✓ | ✅ Have |
| Estimate Templates | ✓ | - | ❌ Missing |
| Takeoff (from blueprints) | ✓ | - | ❌ Missing |
| Proposals | ✓ | ✓ | ✅ Have |
| Proposal Templates | ✓ | - | ⚠️ Partial |
| Electronic Signatures | ✓ | ✓ | ✅ Have |
| Specifications (Scope Docs) | ✓ | - | ❌ Missing |
| Spec Templates | ✓ | - | ❌ Missing |
| Bid Management | ✓ | - | ❌ Missing |
| Bid Packages to Subs | ✓ | - | ❌ Missing |
| Bid Comparison | ✓ | - | ❌ Missing |
| Contracts | ✓ | ✓ | ✅ Have |
| Selections | ✓ | ✓ | ✅ Have |
| Allowances | ✓ | ✓ | ✅ Have |

---

## 3. PROJECT MANAGEMENT

| Feature | Buildertrend | RossOS | Status |
|---------|--------------|----------------|--------|
| Schedule (Gantt) | ✓ | ✓ | ✅ Have |
| Schedule (List View) | ✓ | ✓ | ✅ Have |
| Task Dependencies | ✓ | ✓ | ✅ Have |
| Schedule Templates | ✓ | - | ❌ Missing |
| To-Do Lists | ✓ | - | ❌ Missing |
| To-Do Assignments | ✓ | - | ❌ Missing |
| Daily Logs | ✓ | ✓ | ✅ Have |
| Weather in Logs | ✓ | ✓ | ✅ Have |
| Crew Tracking in Logs | ✓ | ✓ | ✅ Have |
| RFIs (Request for Info) | ✓ | - | ❌ Missing |
| Submittals | ✓ | - | ❌ Missing |
| Change Orders | ✓ | ✓ | ✅ Have |
| Photos | ✓ | ✓ | ✅ Have |
| Photo Markup/Annotations | ✓ | - | ⚠️ Partial |

---

## 4. FINANCIAL MANAGEMENT

| Feature | Buildertrend | RossOS | Status |
|---------|--------------|----------------|--------|
| Job Costing Budget | ✓ | ✓ | ✅ Have |
| Budget vs Actual | ✓ | ✓ | ✅ Have |
| Purchase Orders | ✓ | ✓ | ✅ Have |
| PO from Vendor Quotes (AI) | - | ✓ | ✅ Better |
| Bills (Vendor Invoices) | ✓ | ✓ (Invoices) | ✅ Have |
| Invoice AI Processing | - | ✓ | ✅ Better |
| Cost Inbox (Receipt OCR) | ✓ | - | ❌ Missing |
| Client Invoicing/Draws | ✓ | ✓ | ✅ Have |
| AIA G702/G703 Format | ✓ | ✓ | ✅ Have |
| Online Payments | ✓ | - | ❌ Missing |
| Payment Tracking | ✓ | ✓ | ✅ Have |
| QuickBooks Integration | ✓ | ✓ | ✅ Have |
| Xero Integration | ✓ | - | ❌ Missing |

---

## 5. COMMUNICATION

| Feature | Buildertrend | RossOS | Status |
|---------|--------------|----------------|--------|
| Internal Messaging | ✓ | - | ❌ Missing |
| Comments on Items | ✓ | - | ❌ Missing |
| Direct Chat | ✓ | - | ❌ Missing |
| Email Integration | ✓ | - | ❌ Missing |
| Push Notifications | ✓ | ⚠️ Planned | ⚠️ Partial |
| Activity Feed | ✓ | ✓ | ✅ Have |

---

## 6. TIME TRACKING

| Feature | Buildertrend | RossOS | Status |
|---------|--------------|----------------|--------|
| Time Clock | ✓ | - | ❌ Missing |
| GPS Clock-in/out | ✓ | - | ❌ Missing |
| Geofencing | ✓ | - | ❌ Missing |
| Payroll Integration (Gusto) | ✓ | - | ❌ Missing |
| Labor Cost Tracking | ✓ | Via Daily Logs | ⚠️ Partial |

---

## 7. CLIENT PORTAL

| Feature | Buildertrend | RossOS | Status |
|---------|--------------|----------------|--------|
| Portal Dashboard | ✓ | ✓ | ✅ Have |
| Photos | ✓ | ✓ | ✅ Have |
| Selections | ✓ | ✓ | ✅ Have |
| Draws/Invoices | ✓ | ✓ | ✅ Have |
| Draw Approval | ✓ | ✓ | ✅ Have |
| Online Payments | ✓ | - | ❌ Missing |
| Warranty Claims | ✓ | - | ❌ Missing |
| Service Tickets | ✓ | - | ❌ Missing |
| Schedule View | ✓ | - | ❌ Missing |
| Change Orders View | ✓ | - | ⚠️ Partial |
| Documents Access | ✓ | - | ⚠️ Partial |
| E-Signatures | ✓ | ✓ | ✅ Have |

---

## 8. SUB/VENDOR PORTAL

| Feature | Buildertrend | RossOS | Status |
|---------|--------------|----------------|--------|
| Vendor Portal | ✓ | - | ❌ Missing |
| View Schedule | ✓ | - | ❌ Missing |
| Submit Bids | ✓ | - | ❌ Missing |
| View/Sign POs | ✓ | - | ❌ Missing |
| Daily Log Submission | ✓ | - | ❌ Missing |
| Communication | ✓ | - | ❌ Missing |

---

## 9. CLOSEOUT

| Feature | Buildertrend | RossOS | Status |
|---------|--------------|----------------|--------|
| Punch Lists | ✓ | ✓ | ✅ Have |
| Punch Item Assignments | ✓ | ✓ | ✅ Have |
| Warranties | ✓ | ✓ | ✅ Have |
| Warranty Claims | ✓ | - | ❌ Missing |
| Service Appointments | ✓ | - | ❌ Missing |
| Final Documents | ✓ | ✓ | ✅ Have |
| Closeout Checklist | ✓ | ✓ | ✅ Have |

---

## 10. FILES & DOCUMENTS

| Feature | Buildertrend | RossOS | Status |
|---------|--------------|----------------|--------|
| File Storage | ✓ | ✓ | ✅ Have |
| Folder Organization | ✓ | ✓ | ✅ Have |
| File Versioning | ✓ | ✓ | ✅ Have |
| File Sharing | ✓ | ✓ | ✅ Have |
| Plans & Drawings | ✓ | ✓ | ✅ Have |
| Plan Markup | ✓ | - | ❌ Missing |

---

## 11. REPORTS & ANALYTICS

| Feature | Buildertrend | RossOS | Status |
|---------|--------------|----------------|--------|
| Job Profitability | ✓ | ✓ | ✅ Have |
| Budget Variance | ✓ | ✓ | ✅ Have |
| Cash Flow | ✓ | ✓ | ✅ Have |
| P&L Dashboard | ✓ | ✓ | ✅ Have |
| Custom Dashboards | ✓ | - | ❌ Missing |
| Business Insights (Advanced) | ✓ Add-on | - | ❌ Missing |
| Labor Reports | ✓ | - | ⚠️ Partial |
| Schedule Performance | ✓ | ✓ | ✅ Have |

---

## 12. TEMPLATES & SETTINGS

| Feature | Buildertrend | RossOS | Status |
|---------|--------------|----------------|--------|
| Estimate Templates | ✓ | - | ❌ Missing |
| Schedule Templates | ✓ | - | ❌ Missing |
| Proposal Templates | ✓ | - | ⚠️ Partial |
| Spec Templates | ✓ | - | ❌ Missing |
| To-Do Templates | ✓ | - | ❌ Missing |
| User Roles/Permissions | ✓ | ✓ | ✅ Have |
| Company Settings | ✓ | ✓ | ✅ Have |
| Approval Thresholds | ✓ | ✓ | ✅ Have |

---

## Summary Scorecard

| Category | Have | Partial | Missing | Score |
|----------|------|---------|---------|-------|
| Sales & CRM | 6 | 0 | 4 | 60% |
| Pre-Construction | 7 | 1 | 6 | 50% |
| Project Management | 9 | 1 | 5 | 60% |
| Financial | 9 | 0 | 3 | 75% |
| Communication | 2 | 1 | 4 | 29% |
| Time Tracking | 0 | 1 | 4 | 10% |
| Client Portal | 6 | 2 | 4 | 50% |
| Sub/Vendor Portal | 0 | 0 | 6 | 0% |
| Closeout | 5 | 0 | 2 | 71% |
| Files & Documents | 5 | 0 | 1 | 83% |
| Reports | 5 | 1 | 2 | 63% |
| Templates | 2 | 1 | 5 | 25% |
| **OVERALL** | **56** | **8** | **46** | **56%** |

---

## Gap Priority Analysis

### CRITICAL GAPS (High Impact, Frequent Use)

1. **To-Do Lists** - Universal task management
2. **Internal Messaging/Comments** - Communication is core to construction
3. **Sub/Vendor Portal** - Major differentiator for Buildertrend
4. **Bid Management** - Essential for competitive subcontractor pricing
5. **RFIs** - Critical for project documentation

### HIGH PRIORITY GAPS

6. **Time Clock** - Labor cost tracking
7. **Warranty Claims/Service** - Post-construction service
8. **Online Payments** - Cash flow improvement
9. **Templates System** - Efficiency for repeat work
10. **Submittals** - Material approval tracking

### MEDIUM PRIORITY GAPS

11. **Cost Inbox (Receipt OCR)** - Field expense capture
12. **Email Marketing** - Lead nurturing
13. **Schedule Templates** - Project setup efficiency
14. **Custom Dashboards** - Personalized views
15. **Plan Markup** - Drawing annotations

### LOWER PRIORITY GAPS

16. **Xero Integration** - QuickBooks covers most users
17. **CRM Integrations** - Nice to have
18. **Lead Map** - Geographic visualization
19. **Geofencing** - Advanced time tracking
20. **Business Insights** - Advanced analytics

---

## Competitive Advantages (We Have, They Don't)

1. **AI Invoice Processing** - Claude extracts data from vendor invoices
2. **AI PO Creation** - Create POs from vendor quotes automatically
3. **Modern Tech Stack** - Next.js 14+, Supabase, real-time subscriptions
4. **Simpler Pricing** - Not $499-$1099/month like Buildertrend
5. **Custom Built** - Tailored to the builder's exact workflow

---

## Recommended Implementation Phases

### Phase 1: Core Communication (Weeks 1-4)
- To-Do Lists (job & global)
- Comments on all entities
- Activity notifications

### Phase 2: Vendor Collaboration (Weeks 5-8)
- Sub/Vendor Portal (basic)
- Bid Management
- PO Approval workflow for vendors

### Phase 3: Advanced Project Management (Weeks 9-12)
- RFIs
- Submittals
- Templates System

### Phase 4: Time & Money (Weeks 13-16)
- Time Clock with GPS
- Online Payments (Stripe)
- Cost Inbox

### Phase 5: Enhanced Portals (Weeks 17-20)
- Warranty Claims/Service
- Enhanced Client Portal
- Internal Messaging

### Phase 6: Polish & Optimize (Weeks 21-24)
- Custom Dashboards
- Email Marketing
- Advanced Analytics

---

## Next Steps

1. **Prioritize** - Confirm which gaps matter most for the builder
2. **Design** - Create view plans for missing features
3. **Build** - Implement in priority order
4. **Test** - Validate with real projects
5. **Iterate** - Refine based on usage

---

## Revision History

| Date | Change |
|------|--------|
| Initial | Created comprehensive Buildertrend comparison |
