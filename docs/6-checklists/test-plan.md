# Test Plan

## Per-Feature Testing Checklist
(Copy the 22-item checklist from the blueprint Part 6, Section 6.1)
- Works on desktop Chrome, Safari, Firefox, Edge
- Works on iOS Safari and Android Chrome
- Works with slow connection (3G simulation)
- Works offline (if applicable)
- Works with 0 records (empty state)
- Works with 1 record
- Works with 1,000 records
- Works with 10,000 records (performance test)
- Tenant A cannot see Tenant B's data
- Unauthorized users are blocked
- Audit log captures the action
- Notifications fire correctly
- Search indexes are updated
- Event bus fires for connected modules
- Data syncs to QuickBooks correctly (if financial)
- Displays correctly in client portal (if client-visible)
- Displays correctly in vendor portal (if vendor-visible)
- Can be exported/printed
- Works with the configuration engine (settings respected)
- Keyboard accessible
- Screen reader friendly

## Platform-Wide Testing Checklist
(Copy the 14-item checklist from blueprint Section 6.2)

## Testing Strategy
- Status: TODO
- Framework: Jest (unit), Playwright (e2e) — to be confirmed
- CI/CD: Not yet configured
- Coverage targets: TBD

## Test Suites by Module
- Status: TODO — No tests written yet
- Note: Skeleton app has no test infrastructure currently
