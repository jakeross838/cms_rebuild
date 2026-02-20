# UX Principles

> Target user: A construction superintendent with muddy boots, a cracked phone screen, and 5 minutes between site visits.

## Principle 1: Progressive Disclosure
- Simple by default, power when needed
- New users see simplified views with guided workflows
- As users learn, they unlock more detailed views
- Power features always available but never forced
- Every screen has a "simple" and "detailed" toggle

## Principle 2: Context-Aware Interface
Show what's relevant NOW based on:
- User's role (PM sees different priorities than Owner)
- Time of day (morning = planning view, afternoon = review view)
- Project phase (preconstruction shows different tools than construction)
- Device (desktop = full data, mobile = action-oriented)
- Usage patterns (frequently used features surface first)

## Principle 3: Three-Click Rule for Common Tasks
The 20 most common daily tasks must be completable in 3 clicks or less:
1. Create a daily log
2. Take and upload a photo
3. Approve an invoice
4. Check a project budget
5. View today's schedule
6. Send a vendor message
7. Create a punch list item
8. Log an inspection result
9. Check a delivery status
10. Create an RFI
11. Update a task status
12. Review client portal
13. Generate a report
14. Check cash flow
15. View vendor compliance
16. Create a change order
17. Log a safety observation
18. Schedule an inspection
19. Review and approve a bid
20. Send a client update

## Principle 4: Smart Defaults
Pre-fill everything possible:
- Daily log: auto-populate date, weather, yesterday's vendors on site
- New project: auto-populate from project template
- Invoice: AI suggests cost codes from vendor history
- Schedule: auto-suggest durations from historical data
- Change order: auto-calculate markup from settings
- PO: auto-populate from contract terms
- Lien waiver: auto-fill from payment data

## Principle 5: Never Lose Work
- Auto-save every field change (no "save" button needed)
- Offline mode queues changes for sync
- "Undo" available for every action for 30 days
- Deleted items go to recycle bin, not permanent delete
- Version history on every document and record

## Principle 6: One Place to Look
- Global search that finds ANYTHING (vendor name, invoice number, address, document content)
- "What's happening on [project]?" → one-page comprehensive summary
- "What do I need to do?" → priority-sorted action queue across all projects
- "Where's my money?" → cash position + pending draws + outstanding invoices, one screen

## Principle 7: Beautiful Without Trying
- Auto-formatted reports that look professional without configuration
- Client portal that impresses without builder effort
- Photo galleries that look curated automatically
- Financial reports that are clear to non-accountants
- Proposals that close deals (beautiful templates included)

## Principle 8: Inclusive Design
- Works for tech-savvy PM AND technophobe superintendent
- Works in English AND Spanish (field staff)
- Works on $200 Android AND $1,500 iPhone
- Works on 5" phone AND 27" monitor
- Works for 25-year-old AND 65-year-old
- Works with slow rural internet AND fast city connection
- WCAG 2.1 AA compliant (accessibility)

---

## Implementation Status

| Principle | Current Status | Notes |
|---|---|---|
| Progressive Disclosure | TODO | Need simple/detailed toggle on all views |
| Context-Aware | PARTIAL | Role-based sidebar exists, time/device adaptation TODO |
| Three-Click Rule | TODO | Needs click-path audit for all 20 tasks |
| Smart Defaults | PARTIAL | Some AI auto-fill designed in AI strategy |
| Never Lose Work | TODO | Auto-save, undo, recycle bin not designed |
| One Place to Look | PARTIAL | Global search bar exists, "My Day" TODO |
| Beautiful Without Trying | TODO | Report templates, portal design needed |
| Inclusive Design | TODO | i18n, WCAG audit, responsive testing needed |
