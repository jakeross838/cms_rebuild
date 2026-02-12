# Module 1: Multi-Tenant Authentication & Access

**Phase:** 1 - Foundation
**Status:** TODO

## Description
Provides secure multi-tenant authentication, role-based access control, and session management. Every request is scoped to a `builder_id` ensuring complete data isolation between tenants.

## Key Features
- Multi-tenant login with builder_id scoping
- Role-based access control (Owner, Admin, PM, Field, Client, Vendor)
- JWT token issuance and refresh
- Password reset and email verification flows
- Session management and device tracking
- SSO/OAuth provider support (Google, Microsoft)
- Invitation system for team members
- Audit log of auth events

## Related Gap Items
- Gap items: G-001 through G-010

## Dependencies
- Supabase Auth / PostgreSQL
- Email service for verification/reset

## Notes
- All downstream modules depend on this for auth context and tenant scoping.
