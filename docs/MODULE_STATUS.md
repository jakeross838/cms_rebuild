# Module Status Tracker

> **Single source of truth** for what's done, in-progress, and blocked.
> Agents update this file after completing each module.

## Status Legend

| Column | Values |
|--------|--------|
| **Status** | `not_started` · `in_progress` · `done` · `blocked` |
| **Migration** | `n/a` · `local_only` · `applied` · `needs_update` |
| **API Routes** | `no` · `partial` · `yes` |
| **UI Wired** | `no` · `partial` · `yes` |
| **Tests Pass** | `no` · `partial` · `yes` |
| **Committed** | `no` · commit hash |

---

## Pre-Module Phases

| ID | Phase | Status | Migration | API Routes | UI Wired | Tests Pass | Committed |
|----|-------|--------|-----------|------------|----------|------------|-----------|
| 0C | Foundation Hardening (8 tasks) | done | applied | n/a | n/a | yes | 48271c4 |
| 0D | Code Quality Hardening (8 tasks) | in_progress | n/a | n/a | n/a | no | no |

---

## Phase 1 — Foundation (Modules 01-06)

| ID | Module | Status | Migration | API Routes | UI Wired | Tests Pass | Committed |
|----|--------|--------|-----------|------------|----------|------------|-----------|
| 01 | Auth & Access Control | done | applied | yes | yes | yes | 5e345c8 |
| 02 | Configuration Engine | not_started | local_only | no | no | no | no |
| 03 | Core Data Model | not_started | applied | no | no | no | no |
| 04 | Navigation, Search & Dashboard | not_started | n/a | no | no | no | no |
| 05 | Notification Engine | not_started | applied | no | no | no | no |
| 06 | Document Storage | not_started | applied | no | no | no | no |

---

## Phase 2 — Construction Core (Modules 07-12, 51)

| ID | Module | Status | Migration | API Routes | UI Wired | Tests Pass | Committed |
|----|--------|--------|-----------|------------|----------|------------|-----------|
| 07 | Scheduling & Calendar | not_started | applied | no | no | no | no |
| 08 | Daily Logs | not_started | applied | no | no | no | no |
| 09 | Budget & Cost Tracking | not_started | applied | no | no | no | no |
| 10 | Vendor Management | not_started | applied | no | no | no | no |
| 11 | Native Accounting (GL/AP/AR) | not_started | applied | no | no | no | no |
| 12 | Basic Client Portal | not_started | applied | no | no | no | no |
| 51 | Time Tracking & Labor | not_started | applied | no | no | no | no |

---

## Phase 3 — Financial Power (Modules 13-19, 52)

| ID | Module | Status | Migration | API Routes | UI Wired | Tests Pass | Committed |
|----|--------|--------|-----------|------------|----------|------------|-----------|
| 13 | AI Invoice Processing | not_started | applied | no | no | no | no |
| 14 | Lien Waivers | not_started | applied | no | no | no | no |
| 15 | Draw Requests | not_started | applied | no | no | no | no |
| 16 | QuickBooks Integration | not_started | applied | no | no | no | no |
| 17 | Change Orders | not_started | applied | no | no | no | no |
| 18 | Purchase Orders | not_started | applied | no | no | no | no |
| 19 | Financial Reporting | not_started | applied | no | no | no | no |
| 52 | Inventory & Materials | not_started | applied | no | no | no | no |

---

## Phase 4 — Intelligence (Modules 20-28)

| ID | Module | Status | Migration | API Routes | UI Wired | Tests Pass | Committed |
|----|--------|--------|-----------|------------|----------|------------|-----------|
| 20 | Estimating Engine | not_started | applied | no | no | no | no |
| 21 | Selection Management | not_started | applied | no | no | no | no |
| 22 | Vendor Performance | not_started | applied | no | no | no | no |
| 23 | Price Intelligence | not_started | applied | no | no | no | no |
| 24 | AI Document Processing | not_started | applied | no | no | no | no |
| 25 | Schedule Intelligence | not_started | applied | no | no | no | no |
| 26 | Bid Management | not_started | applied | no | no | no | no |
| 27 | RFI Management | not_started | applied | no | no | no | no |
| 28 | Punch List & Quality | not_started | applied | no | no | no | no |

---

## Phase 5 — Full Platform (Modules 29-40)

| ID | Module | Status | Migration | API Routes | UI Wired | Tests Pass | Committed |
|----|--------|--------|-----------|------------|----------|------------|-----------|
| 29 | Full Client Portal | not_started | applied | no | no | no | no |
| 30 | Vendor Portal | not_started | applied | no | no | no | no |
| 31 | Warranty & Home Care | not_started | applied | no | no | no | no |
| 32 | Permitting & Inspections | not_started | applied | no | no | no | no |
| 33 | Safety & Compliance | not_started | applied | no | no | no | no |
| 34 | HR & Workforce | not_started | applied | no | no | no | no |
| 35 | Equipment & Assets | not_started | applied | no | no | no | no |
| 36 | Lead Pipeline & CRM | not_started | applied | no | no | no | no |
| 37 | Marketing & Portfolio | not_started | applied | no | no | no | no |
| 38 | Contracts & E-Signature | not_started | applied | no | no | no | no |
| 39 | Advanced Reporting | not_started | applied | no | no | no | no |
| 40 | Mobile App | not_started | applied | no | no | no | no |

---

## Phase 6 — Scale & Sell (Modules 41-50)

| ID | Module | Status | Migration | API Routes | UI Wired | Tests Pass | Committed |
|----|--------|--------|-----------|------------|----------|------------|-----------|
| 41 | Onboarding Wizard | not_started | local_only | no | no | no | no |
| 42 | Data Migration | not_started | local_only | no | no | no | no |
| 43 | Subscription Billing | not_started | local_only | no | no | no | no |
| 44 | White-Label & Branding | not_started | local_only | no | no | no | no |
| 45 | API & Marketplace | not_started | local_only | no | no | no | no |
| 46 | Customer Support | not_started | local_only | no | no | no | no |
| 47 | Training Platform | not_started | local_only | no | no | no | no |
| 48 | Template Marketplace | not_started | local_only | no | no | no | no |
| 49 | Platform Analytics | not_started | local_only | no | no | no | no |
| 50 | Marketing Website | not_started | local_only | no | no | no | no |

---

## Summary

| Category | Count |
|----------|-------|
| Done | 2 (Module 01, Phase 0C) |
| In Progress | 0 |
| Not Started | 52 (0D, Modules 02-52) |
| Blocked | 0 |

**Next up:** Phase 0D — Code Quality Hardening (see `docs/AGENT_QUEUE.md`)
