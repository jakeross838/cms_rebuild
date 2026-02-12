# Module 3: Core Data Model

**Phase:** 1 - Foundation
**Status:** TODO

## Description
Defines the foundational database schema including projects, contacts, cost codes, and shared lookup tables. All tables enforce multi-tenant isolation via `builder_id` columns and RLS policies.

## Key Features
- Project entity with full lifecycle tracking
- Contact/company base tables
- Cost code and category structures
- Shared lookup and reference tables
- Row-level security policies on all tables
- Soft delete with audit trails
- Database migrations framework

## Related Gap Items
- Gap items: G-019 through G-028

## Dependencies
- Module 1: Auth & Access (builder_id scoping)
- Module 2: Configuration Engine (custom fields)

## Notes
- This is the schema foundation; nearly every module builds on these tables.
