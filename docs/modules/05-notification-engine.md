# Module 5: Notification Engine

**Phase:** 1 - Foundation
**Status:** TODO

## Description
Centralized notification system supporting in-app, email, SMS, and push channels. Other modules register notification events and users configure their preferences per channel.

## Key Features
- Multi-channel delivery (in-app, email, SMS, push)
- User notification preferences per event type
- Notification templates with variable substitution
- Real-time in-app notifications via SSE/WebSocket
- Notification grouping and digest mode
- Read/unread tracking and bulk actions
- Retry and delivery status tracking

## Related Gap Items
- Gap items: G-039 through G-045

## Dependencies
- Module 1: Auth & Access (user context)
- Email/SMS service providers

## Notes
- All modules emit events to this engine; it is a cross-cutting concern.
