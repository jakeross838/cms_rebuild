# User Flow: Daily Field Operations

> **Status: TODO -- Detailed flow not yet documented**

## Overview

This flow describes the daily routine of a field superintendent or project manager using the mobile app to manage on-site activities, from reviewing the day's schedule through submitting a completed daily log.

## High-Level Steps

1. **Open app** -- The field user opens the mobile app (PWA) at the start of the workday.
2. **See today's schedule** -- The dashboard displays today's scheduled tasks, expected deliveries, and planned vendor/sub arrivals.
3. **Start daily log** -- A new daily log is initiated, auto-populated with the date, weather data, and scheduled activities.
4. **Log vendor arrivals** -- As vendors and subcontractors arrive on site, their presence and headcount are recorded.
5. **Take photos** -- Field photos are captured through the app, automatically tagged with date, time, GPS coordinates, and optionally linked to cost codes or schedule tasks.
6. **Log issues** -- Any problems, delays, safety concerns, or quality issues are documented with descriptions and photos.
7. **Verify deliveries** -- Material deliveries are verified against purchase orders, with any discrepancies noted.
8. **Complete daily log** -- All entries for the day are finalized, including a summary of work performed and any notes for the PM.
9. **Submit daily log** -- The completed log is submitted, triggering a notification to the project manager.
10. **PM reviews** -- The project manager reviews the submitted daily log, adds comments if needed, and approves.

## Connections to Other Modules

- **Schedule** -- Today's tasks and milestones drive the daily log auto-population and field activity tracking.
- **Photos** -- Photos taken in the field are stored and linked to the daily log, schedule tasks, and/or cost codes.
- **Purchase Orders** -- Delivery verification cross-references active POs for the project.
- **Issues/RFIs** -- Issues logged in the field may trigger RFIs or be escalated for resolution.
- **Notifications** -- Automatic notifications are sent when logs are submitted, when issues are flagged, and when deliveries arrive.
- **Weather** -- Weather data is auto-fetched and attached to daily logs for delay documentation.

## Pages Involved

| Page Spec | Role in Flow |
|-----------|-------------|
| `schedule-logs-photos` | View schedule, create/edit daily logs, capture and manage photos |
| `job-detail` | Project overview and quick access to today's activity |
| `custom-dashboards` | Field-focused dashboard showing today's schedule and alerts |
