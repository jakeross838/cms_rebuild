# User Flow: New Project Creation

> **Status: TODO -- Detailed flow not yet documented**

## Overview

This flow describes how a new construction project is created in the system, either from scratch or by converting an existing lead, including initial setup of budget, schedule, team, and notifications.

## High-Level Steps

1. **Navigate to Jobs** -- The user navigates to the Jobs list page from the main navigation.
2. **Click New Job** -- The user initiates the new project creation process.
3. **Enter project info** -- Project details are entered (name, address, type, square footage, etc.), or fields are pre-populated if converting from an existing lead.
4. **Select client** -- An existing client is selected or a new client record is created and associated with the project.
5. **Set contract type and amount** -- The contract type (fixed-price, cost-plus, T&M) and initial contract amount are specified.
6. **Create project** -- The project record is saved, generating a unique job number and creating the project shell.
7. **Set up budget from estimate template** -- A budget is created by importing line items from an approved estimate or by applying a budget template with standard cost codes.
8. **Create schedule from template** -- A project schedule is generated from a schedule template, with tasks, durations, and dependencies pre-configured.
9. **Invite team** -- Team members (PMs, superintendents, admins) are invited to the project with appropriate role-based permissions.
10. **Configure notifications** -- Notification preferences are set for the project, including triggers for budget alerts, schedule milestones, and approval workflows.
11. **Project active** -- The project is marked as active and appears on dashboards, schedules, and financial reports.

## Connections to Other Modules

- **Leads** -- A lead can be converted directly into a new project, carrying over client info, scope notes, and estimate data.
- **Estimates** -- The approved estimate from the preconstruction phase seeds the project budget.
- **Templates** -- Budget templates and schedule templates accelerate project setup with standardized structures.
- **Team/Permissions** -- User roles and permissions are configured per project to control access and approval authority.
- **Notifications** -- Project-level notification rules are established during setup.
- **Client Portal** -- The client portal is activated for the new project, giving the client access to approved documents.

## Pages Involved

| Page Spec | Role in Flow |
|-----------|-------------|
| `job-create` | Enter project details, select client, set contract info |
| `jobs-list` | Navigate to the job creation flow; view all projects |
| `job-detail` | View and manage the newly created project |
| `job-budget` | Set up the project budget from estimate or template |
| `schedule-logs-photos` | Create and configure the project schedule from template |
| `templates` | Select budget and schedule templates during project setup |
