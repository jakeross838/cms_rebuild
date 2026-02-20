# Module 52: Inventory & Materials Management

**Phase:** 3 - Financial Power
**Status:** TODO
**Last Updated:** 2026-02-20

---

## Overview

End-to-end inventory and materials management for construction companies covering multi-location stock tracking, material catalog management, receiving against purchase orders, inter-location transfers, consumption/usage tracking, reorder point alerts, physical/cycle counting, and barcode/QR scanning. This module tracks consumable construction materials — lumber, pipe, fittings, fasteners, drywall, paint, electrical supplies, plumbing fixtures, concrete, and similar items — across central warehouses, job sites, and service vehicles.

This is distinct from Module 35 (Equipment & Asset Management), which tracks durable assets like excavators, tools, and vehicles. Inventory items are consumed during construction; equipment is deployed and returned. The two modules share a barcode/QR scanning infrastructure but operate on fundamentally different data models and workflows.

Material costs flow into Module 09 (Budget & Cost Tracking) when items are issued/consumed against a job and cost code, creating a direct link between physical inventory movements and project financial performance. Receiving workflows integrate with Module 18 (Purchase Orders) for three-way matching and backorder management. Reorder alerts can auto-generate draft POs to maintain stock levels without manual intervention.

Sage.com provides comprehensive inventory management with central warehouse, job site, and service truck inventory with barcode/RFID tracking. RossOS must achieve feature parity while adding AI-powered consumption forecasting and mobile-first field workflows.

---

## Gap Items Addressed

| Gap # | Description | Coverage |
|-------|-------------|----------|
| 700 | Multi-location inventory tracking (warehouse, job site, vehicle) | Full location hierarchy with transfers, zone/bin granularity |
| 701 | Material catalog with category hierarchy and multiple UOMs | Master item catalog with division > category > item taxonomy |
| 702 | Receiving against PO with partial receipt support | Receipt workflow with quality check, photo documentation, backorder tracking |
| 703 | Inter-location material transfers with approval workflow | Transfer request > approve > ship > receive lifecycle |
| 704 | Material consumption tracking by job and cost code | Issue-to-job workflow with cost code allocation and waste tracking |
| 705 | Reorder point alerts with auto-PO generation | Configurable min stock levels, consumption-rate-based suggestions, draft PO generation |
| 706 | Physical inventory count and cycle count workflows | Full count and rotating cycle count with variance approval workflow |
| 707 | Barcode/QR scanning for receiving, issuing, transfers, and counts | Mobile scanning infrastructure shared with Module 35 |
| 708 | Material cost integration with budget tracking | FIFO/LIFO/weighted average costing, cost variance tracking, COGS journal entries |
| 709 | Job site material planning from estimates | Planned vs. actual consumption comparison, material forecasting from schedule |
| 710 | Vendor-specific pricing and preferred vendor management | Item-vendor relationship with pricing, lead times, and purchase history |
| 711 | Inventory valuation for financial reporting | Configurable cost methods, valuation reports, shrinkage/waste cost attribution |

---

## Detailed Requirements

### 1. Multi-Location Inventory

**Location hierarchy:**
- **Company > Warehouse/Yard > Zone > Bin** — for centralized storage with granular bin-level tracking.
- **Company > Job Site > Area** — for materials delivered to and consumed on active projects.
- **Company > Vehicle** — for service/warranty crew truck inventory.
- **Virtual locations:** "In Transit" (materials between locations), "Returned to Vendor" (materials sent back for credit/exchange).

**Location types:**
- `warehouse` — Central warehouse or storage yard. Primary receiving and distribution point.
- `job_site` — Tied to a specific project (references `v2_projects.id` via `job_id`). Materials here are typically consumed during construction.
- `vehicle` — Assigned to a service truck or crew vehicle. Smaller inventory for field service, warranty work, or emergency repairs.
- `in_transit` — Virtual holding location for materials being transferred. Prevents double-counting during transit.
- `virtual` — Catch-all for non-physical locations (returned to vendor, write-off staging, etc.).

**Location management:**
- Each location has an address (physical locations) or description (virtual locations).
- Locations can be activated/deactivated but never deleted (soft delete per platform convention).
- Parent-child relationships support zone/bin subdivisions within warehouses.
- Job site locations are auto-created when a project is flagged for material tracking and auto-deactivated when the project closes.

#### Edge Cases & What-If Scenarios

1. **Material transferred to a job site that does not exist yet.** A field worker requests materials for a project that is in pre-construction or has not been set up in the system. Required behavior:
   - Transfer creation must validate that the destination `job_id` exists and has an active status (`active`, `in_progress`, or `pre_construction`).
   - If the job is in `draft` or `cancelled` status, the system must block the transfer with a clear error: "Cannot transfer materials to job [name] — job status is [status]. Contact your project manager."
   - If the job exists but has no inventory location yet, the system must auto-create a `job_site` location for that project upon the first approved transfer.
   - If the job does not exist at all, the system must block the transfer. No orphaned inventory is permitted.

2. **Closing a job site with remaining inventory.** When a project is completed or cancelled, materials may still be on site. Required behavior:
   - Before a job can be marked as completed, the system must check for non-zero inventory at the associated job site location.
   - If inventory exists, the system prompts the PM: "Job site [name] has [X] items with total value [$Y]. Transfer to warehouse, transfer to another job, or write off?"
   - Bulk transfer wizard: select all remaining items and transfer to a single destination in one action.
   - Items written off are recorded as `waste` or `shrinkage` transactions with the project's cost code absorbing the cost.
   - The job site location is deactivated (not deleted) after all inventory reaches zero.

### 2. Material Catalog / Item Master

**Master item catalog:**
- Each item has: name, description, SKU (builder-assigned), category, primary unit of measure, secondary UOM, UOM conversion factor, default unit cost, reorder point, reorder quantity, lead time days, barcode, QR code, photo URLs, and active/inactive flag.
- SKUs are unique per builder (not globally). Two builders can have different SKUs for the same physical product.

**Category hierarchy:**
- Three-level taxonomy: **Division > Category > Item**.
- Example: `Electrical > Wire > 12/2 Romex NM-B 250ft`.
- Example: `Plumbing > Copper Pipe > 3/4" Type L 10ft`.
- Example: `Lumber > Framing > 2x4x8 SPF #2`.
- Categories are user-defined (per platform convention — never hardcoded). Builders create and manage their own taxonomy.
- Categories have a `code` field for builders who use numeric coding systems (e.g., `16-100` for electrical wire).
- Sort order is user-controlled within each level.

**Multiple units of measure:**
- Items can have a primary UOM (the unit of inventory tracking) and a secondary UOM (the unit of purchase or field use).
- Conversion factor links the two: "1 box = 250 feet" means `uom_conversion_factor = 250`.
- Example: Wire sold by the box (250 ft/box), tracked by the foot. PO orders 4 boxes; inventory receives 1,000 feet.
- Example: Concrete ordered by the cubic yard, but measured by the ton at delivery. Conversion factor depends on mix density.

**Item photos:**
- Up to 5 photos per item stored as URLs in `photo_urls` (JSONB array).
- Primary photo displayed in list views and mobile scanning results.
- Photos help field crews identify the correct item — critical when items have similar names but different specifications.

**Preferred vendors:**
- Each item can have multiple vendor associations via `v2_item_vendors`.
- One vendor per item is marked as `is_preferred` (the default vendor for new POs).
- Vendor-specific data: vendor SKU, vendor item name, unit cost from that vendor, minimum order quantity, lead time, and last purchased date.
- When creating a PO for an item, the system pre-populates the preferred vendor's pricing and SKU.

**Item aliases / normalization:**
- The same physical product may be called different names by different vendors (e.g., "12/2 NM-B" vs "12-2 Romex" vs "12/2 w/G Non-Metallic").
- The alias system ties variant names to a single canonical item in the catalog.
- When AI processes a vendor invoice or packing slip, it uses the alias registry to resolve vendor-specific names to the builder's canonical item.
- Aliases grow organically: each confirmed match adds a new alias entry. See `docs/architecture/normalization-and-crud.md`.

**Barcode / QR code assignment:**
- Each item can have a standard UPC barcode and/or a custom QR code.
- QR codes can be generated by the system and printed as labels for items that do not have manufacturer barcodes.
- Barcode/QR values are stored on the item record and used for mobile scanning during receiving, issuing, transfers, and counts.
- Support standard UPC-A/UPC-E, EAN-13, Code 128, and QR code formats.

#### Edge Cases & What-If Scenarios

1. **Bulk material measured by different UOMs at different points.** Concrete is ordered in cubic yards, delivered and weighed in tons, and billed by the yard. Gravel is ordered by the ton but delivered and measured by the truckload. Required behavior:
   - Items can define a primary UOM (tracking) and secondary UOM (purchasing) with a conversion factor.
   - For items where the conversion factor is variable (e.g., concrete density varies by mix design), the system allows the conversion factor to be entered at the time of receipt rather than fixed at the item level.
   - Receipt records capture both the ordered quantity (in purchase UOM) and received quantity (in tracking UOM) with the actual conversion factor used.
   - Variance reporting highlights when the actual conversion factor deviates significantly from the default, indicating a potential measurement or delivery issue.

2. **Vendor ships substitute material.** A vendor delivers a different brand or specification than what was ordered. Required behavior:
   - The receiving workflow allows the receiver to flag a line item as "substitute received."
   - Substitute receipt captures: original item ordered, substitute item received, vendor's stated reason, and quality acceptance status (accept, accept with exception, reject).
   - If the substitute matches an existing item in the catalog, the receiver selects it. If it does not, a new item can be created on the spot with the substitute's details.
   - Substitutions are logged on the PO receipt record and flagged in vendor performance tracking (Module 22).
   - The original PO line item shows the substitution in its history for audit purposes.
   - If the substitute has a different cost, the cost variance is captured and routed to the budget.

### 3. Receiving / Material Receipts

**Receive against Purchase Order (Module 18 integration):**
- Receiving starts from an open PO. The receiver selects the PO, sees all line items with ordered vs. previously received quantities, and enters the quantity received in this delivery.
- Each receipt creates a `v2_inventory_transactions` record with `transaction_type = 'receipt'` and `reference_type = 'po'`, linking to the PO via `reference_id`.
- Receipt auto-updates the PO's received quantities (cascading to `v2_purchase_order_items.received_quantity`).

**Partial receipts:**
- A PO for 100 units can be received as 60 now and 40 later. Each partial receipt is a separate receipt record.
- Backordered items (ordered but not yet received) are tracked on the PO and surfaced in the backorder dashboard (Module 18).
- The PO status transitions: `sent` → `partial_delivery` (after first partial receipt) → `fully_received` (when all items received).

**Receipt verification:**
- Mobile workflow: scan the item barcode or QR code, enter quantity received, select condition.
- Desktop workflow: manual entry against PO line items with quantity inputs.
- Packing slip scan: photo of the vendor's packing slip attached to the receipt for verification.

**Quality check on receipt:**
- Each line item receives a quality status: `accepted`, `accepted_with_exception`, or `rejected`.
- Accepted with exception: record the exception (e.g., "minor box damage, contents OK") with optional photo.
- Rejected: item does not enter inventory. Rejection reason and photos are captured. Vendor is notified via Module 18 workflow.
- Rejected quantities do not increase stock. They are tracked as "rejected" on the receipt for vendor dispute purposes.

**Photo documentation:**
- Receivers can take photos of the delivery (truck, pallet, individual items) and attach them to the receipt.
- Photos are stored via Module 06 (Document Storage) and linked to the receipt record.
- Photos tie into Daily Log (Module 08) material delivery verification when the receipt occurs at a job site.

**Cost tracking on receipt:**
- The actual unit cost at time of receipt is captured. This may differ from the PO unit cost due to price adjustments, surcharges, or currency fluctuations.
- Cost variance = receipt unit cost minus PO unit cost. Variances above a configurable threshold are flagged.
- The receipt cost is used for inventory valuation (FIFO, LIFO, or weighted average depending on builder configuration).

#### Edge Cases & What-If Scenarios

1. **Material received but PO not yet entered.** A supplier delivers materials before the office has created a PO (common with rush orders or standing relationships). Required behavior:
   - The system must support "unplanned receipts" — receiving materials without an associated PO.
   - Unplanned receipts require: item selection from catalog (or new item creation), quantity, unit cost, vendor, and receiving location.
   - Unplanned receipts are flagged as `reference_type = 'manual'` with no `reference_id`.
   - The system surfaces unplanned receipts in a "needs PO" queue. The office can retroactively create a PO and link the receipt to it.
   - Until linked, unplanned receipts still increase inventory and are valued at the entered unit cost.
   - Configurable: builders can require PO for all receipts (`require_po_for_receipt = true` in `v2_inventory_config`) or allow unplanned receipts.

2. **Received quantity exceeds PO quantity.** A vendor ships 110 units when the PO specified 100. Required behavior:
   - The system allows over-receipt with a warning: "Received quantity (110) exceeds PO quantity (100) by 10 units (10%)."
   - Over-receipt tolerance is configurable per builder (default: 10%). Within tolerance, the receipt is processed normally with a flag.
   - Over-receipts beyond tolerance require supervisor approval before the receipt can be finalized.
   - The PO line item is updated to reflect the actual received quantity. The committed cost on the budget is adjusted accordingly.
   - The builder can choose to: accept the overage, return the excess to the vendor, or accept and create a credit request.

### 4. Transfers Between Locations

**Transfer lifecycle:**
- `requested` — Field worker or PM requests materials from warehouse or another location.
- `approved` — Warehouse manager or designated approver approves the transfer.
- `in_transit` — Materials are picked, loaded, and en route. Inventory moves from source location to the "In Transit" virtual location.
- `received` — Destination confirms receipt. Inventory moves from "In Transit" to the destination location.
- `cancelled` — Transfer cancelled before shipment. No inventory movement occurs.

**Transfer request workflow:**
- Field crew member submits a transfer request: "Need 200 LF of 12/2 wire and 50 3/4" copper elbows at Job Site Maple Ave."
- Request specifies: items, quantities, from location, to location, needed-by date, and priority (normal, urgent).
- Warehouse approver reviews pending requests, checks stock availability, and approves or rejects with a reason.
- Approved transfers generate a pick list for warehouse staff.

**Transfer documentation:**
- Each transfer records: items, quantities, from/to locations, carrier/driver, date shipped, date received.
- Transfer items track: `quantity_requested`, `quantity_shipped` (may differ from requested if stock insufficient), and `quantity_received` (may differ from shipped if items damaged in transit).
- Discrepancies between shipped and received quantities trigger an in-transit loss investigation.

**Material return workflow:**
- Excess materials at a completed job site can be returned to the warehouse via a return transfer.
- Returns use the same transfer workflow but with `from = job_site` and `to = warehouse`.
- Returned materials are inspected upon receipt at the warehouse and either restocked (if in good condition) or written off (if damaged).

#### Edge Cases & What-If Scenarios

1. **Material damaged during transit between locations.** A transfer of 50 boxes of tile is shipped from the warehouse to a job site, but 5 boxes arrive broken. Required behavior:
   - The receiver enters `quantity_received = 45` against `quantity_shipped = 50`.
   - The 5-unit discrepancy creates an `in_transit_loss` record with: item, quantity lost, estimated cost, suspected cause (damage, theft, miscounted), and photos.
   - The system prompts: "5 units of [item] not received. Record as: (a) Damaged in transit, (b) Shortage — recount at origin, (c) Theft/loss."
   - Damaged items are recorded as a `waste` transaction and the cost is allocated to a configurable cost code (e.g., "General Conditions — Material Handling Loss").
   - The shortage is surfaced to the warehouse so they can investigate and, if necessary, ship replacement material.
   - In-transit loss trends are tracked per carrier/driver and per route for pattern detection.

2. **Transfer requested but source location does not have sufficient stock.** A field worker requests 200 LF of wire but the warehouse only has 120 LF. Required behavior:
   - The approver sees the stock availability when reviewing the request: "Requested: 200 LF. Available at source: 120 LF."
   - Options: (a) Approve partial transfer of 120 LF and notify the requester, (b) Reject and suggest an alternative source location that has stock, (c) Approve 120 LF and auto-generate a PO for the remaining 80 LF from the preferred vendor.
   - If partial transfer is approved, the transfer item shows `quantity_requested = 200`, `quantity_shipped = 120`, and the requester is notified of the shortfall.

### 5. Consumption / Usage Tracking

**Issue materials to a job:**
- "Issue" removes materials from a location's inventory and charges the cost to a specific job + cost code.
- Issue creates a `v2_inventory_transactions` record with `transaction_type = 'issue'`, `reference_type = 'job'`, and references to `job_id` and `cost_code_id`.
- The cost of the issued material (determined by the configured cost method — FIFO, LIFO, or weighted average) is posted to Module 09 (Budget & Cost Tracking) as an actual cost against that cost code.

**Bulk issue:**
- Support issuing multiple items to the same job and cost code in a single transaction.
- Example: "Issue 200 LF of 12/2 wire, 50 outlet boxes, and 100 wire nuts to Job 1234, cost code 16-100 (Electrical Rough-In)."
- Bulk issue generates one transaction per item but groups them under a single batch reference for audit purposes.

**Consumption linked to daily logs:**
- When a superintendent records material usage in a Daily Log (Module 08), the system can optionally create a corresponding inventory issue transaction.
- Linkage is by reference: the daily log entry ID is stored as the `reference_id` on the inventory transaction.
- This provides dual documentation: the daily log records what was used on site, and the inventory system records the stock reduction.

**Waste tracking:**
- Materials that are damaged, expired, or unusable are recorded as `waste` transactions.
- Waste transactions reduce inventory but are categorized separately from productive consumption.
- Each waste entry requires: quantity, reason (damaged, expired, defective, cut-off/remnant, contaminated), and optional photo.
- Waste costs are attributed to the job and cost code where the waste occurred.
- Waste percentage by item, by job, and by trade is tracked for reporting and future estimating accuracy.

**Material usage reports:**
- Usage by job: total materials consumed per project, broken down by item and cost code.
- Usage by cost code: across all projects, how much of each item was consumed under each cost code.
- Usage by item: across all projects and locations, total consumption with trend analysis.
- Usage vs. estimate: compare actual material consumption to the estimated quantities from Module 20 (Estimating Engine).

#### Edge Cases & What-If Scenarios

1. **Material consumed but not tracked in real time.** Field crews use materials throughout the day but only reconcile at the end of the week. Required behavior:
   - The system supports backdated issue transactions. The `performed_at` timestamp can be set to any date in the current or prior period (subject to period locking rules from Module 09).
   - A "weekly reconciliation" workflow allows a superintendent to enter all material usage for the week in one session, selecting items and quantities for each day or for the week as a lump entry.
   - Backdated issues are flagged in the audit trail as "entered after the fact" but are otherwise treated identically to real-time issues.
   - Configurable: builders can require daily material tracking or allow weekly reconciliation.

2. **Same material issued to multiple cost codes on the same job.** A job uses 12/2 wire for both rough-in (cost code 16-100) and finish work (cost code 16-200). Required behavior:
   - Each issue transaction specifies exactly one cost code. To split material across cost codes, the user creates separate issue transactions.
   - The system supports a "split issue" workflow: enter the total quantity consumed, then allocate portions to different cost codes in a single form.
   - Budget impact is calculated per cost code based on the allocated quantity and unit cost.

### 6. Reorder Points & Alerts

**Configurable minimum stock levels:**
- Each item has a `reorder_point` (minimum quantity) and `reorder_quantity` (suggested order quantity) defined at the item level.
- Reorder points can also be set per item per location (e.g., warehouse keeps 500 LF of 12/2 wire, but Truck #3 keeps 100 LF).
- When `quantity_available` at a location falls below the `reorder_point`, a low stock alert is generated via Module 05 (Notification Engine).

**Consumption-rate-based suggestions:**
- The system calculates average daily consumption rate over a configurable lookback period (default: 90 days).
- Suggested reorder quantity = daily consumption rate x lead time days x safety factor (configurable, default: 1.5).
- The suggestion is displayed alongside the manual `reorder_quantity` so the builder can choose which to follow.

**Auto-generate draft Purchase Order:**
- When `auto_reorder_enabled = true` in `v2_inventory_config`, hitting a reorder point auto-generates a draft PO.
- The draft PO uses the preferred vendor for the item, the vendor's unit cost, and the suggested reorder quantity.
- The draft PO is NOT auto-submitted. It goes to the purchasing queue for review and approval (normal PO workflow from Module 18).
- Multiple items below reorder point from the same vendor are consolidated into a single draft PO.

**Lead time tracking:**
- Each item-vendor combination has a `lead_time_days` value (how long from order to delivery).
- The system uses lead time to calculate when to reorder: "Order by [date] to receive by [date] before stock runs out."
- Lead times are updated automatically based on actual PO-to-receipt duration (rolling average).

#### Edge Cases & What-If Scenarios

1. **Seasonal demand spike causes reorder point to be insufficient.** During summer building season, consumption of a material doubles, but the reorder point was set based on annual average. Required behavior:
   - The system tracks seasonal consumption patterns and alerts when current consumption rate exceeds the rate assumed by the reorder point.
   - Alert: "12/2 wire consumption is 2.3x the 90-day average. Current reorder point (500 LF) may be insufficient. Suggested adjustment: 1,150 LF."
   - The builder can accept the suggestion (updating the reorder point) or dismiss it.
   - Seasonal adjustment is optional and configurable per builder.

### 7. Physical Count / Cycle Count

**Full physical inventory count:**
- A full count covers all items at a specific location.
- The count workflow: start count (creates a `v2_inventory_counts` record) → enter counts for each item → review variances → approve adjustments → complete count.
- During an active count, a "count freeze" advisory is displayed to users at that location: "Physical count in progress at [location]. Receiving and issuing are paused until count is complete." (Configurable — some builders allow transactions during a count.)

**Cycle counting:**
- Cycle counting covers a rotating subset of items on a schedule.
- Configurable cycle frequency: count high-value or high-movement items more frequently (e.g., every 30 days) and low-value items less frequently (e.g., every 180 days).
- The system generates a daily or weekly cycle count list based on the schedule and item priority.
- `cycle_count_frequency_days` in `v2_inventory_config` sets the default cycle; individual items can override.

**Count entry via mobile:**
- Mobile workflow: scan item barcode/QR → system displays item name, photo, and current system quantity → counter enters the actual counted quantity.
- Bulk scan mode: continuous scanning for high-volume counting. Scan item, enter quantity, scan next item — no navigation between screens.
- Support offline counting: mobile app caches the count list, allows entry offline, and syncs when connectivity returns.

**Variance report:**
- After count entries are submitted, the system generates a variance report: system quantity vs. counted quantity for each item.
- Variances are classified by magnitude: within tolerance (configurable, default: 2%), minor variance, and significant variance.
- Each variance requires an `adjustment_reason`: `shrinkage`, `damage`, `miscounted`, `theft`, `found`, `unit_of_measure_error`, or `data_entry_error`.

**Adjustment workflow:**
- Variances that require inventory adjustment go through an approval workflow.
- Configurable: `require_approval_for_adjustment` in `v2_inventory_config`. If true, adjustments with variances above a threshold require supervisor approval.
- Approved adjustments create `v2_inventory_transactions` records with `transaction_type = 'adjustment'` and `reference_type = 'count'`.
- Rejected adjustments require a recount.

**Count history and accuracy trending:**
- Each count and its results are stored permanently.
- Accuracy metrics: percentage of items with zero variance, total dollar variance, average variance percentage.
- Accuracy trending over time: is the location getting more or less accurate with each count cycle?
- Locations or items with consistently high variance are flagged for process improvement.

#### Edge Cases & What-If Scenarios

1. **Physical count reveals 0 quantity but system shows positive.** The system says there are 50 boxes of screws, but the counter finds none. Required behavior:
   - The full variance (50 units, 100% discrepancy) is flagged as "significant variance" and requires mandatory approval.
   - The approver must select a reason from the list. "Theft" triggers additional documentation requirements (incident report, notification to management, optional police report reference).
   - The adjustment, once approved, creates a `waste` or `shrinkage` transaction for the full quantity, posting the cost to a configurable loss cost code.
   - The system checks recent transaction history for the item at that location: were there outbound transfers or issues that were not properly recorded? This analysis is presented to the approver as "possible explanations."
   - If the item has been consistently showing variance at this location, the system surfaces the pattern: "This item has had [X] count variances at this location in the last [Y] months, totaling [Z] units."

2. **Count discovers items not in the system.** During a physical count, the counter finds material that is not in the item catalog. Required behavior:
   - The mobile count app supports adding "found items" — items physically present but not in the catalog or not expected at this location.
   - Found items require: photo, description, estimated quantity, and estimated value.
   - Found items are added to a "reconciliation queue" for the inventory manager to either match to an existing catalog item (perhaps under a different name) or create a new catalog entry.
   - Once matched or created, an `adjustment` transaction with reason `found` increases the stock at that location.

### 8. Job Site Material Planning

**Material list from estimate (Module 20 integration):**
- When a project has an approved estimate, the material line items from the estimate are imported as a "planned material list" for that job.
- The planned list shows: item, planned quantity, cost code, and estimated cost.
- As materials are issued to the job, the system tracks planned vs. actual consumption.

**Planned vs. actual comparison:**
- Dashboard view per job: planned quantity vs. actual quantity consumed for each material.
- Variance highlighting: items where actual consumption exceeds planned by more than a configurable threshold (default: 10%).
- Over-consumption alerts notify the PM: "12/2 wire usage on Job [name] is 25% over estimate. Planned: 2,000 LF. Consumed: 2,500 LF."
- Under-consumption may indicate incomplete work or materials stockpiled on site but not yet issued.

**Material forecast:**
- Based on the project schedule (Module 07), the system forecasts which materials will be needed for upcoming tasks.
- Forecast horizon is configurable (default: 2 weeks lookahead).
- Forecast considers: task start dates, estimated material quantities per task (from estimate), and current stock at the job site.
- Items needed but not in stock trigger a "pre-stage" recommendation: transfer from warehouse or generate a PO.

**Pre-staging materials:**
- The system generates transfer requests or POs to ensure materials arrive before they are needed.
- Pre-stage lead time accounts for: vendor lead time (for POs) or internal transfer time (for warehouse transfers).
- A "material readiness" dashboard shows the status of upcoming material needs: green (on hand), yellow (ordered/in transit), red (not yet ordered, needed within lead time window).

### 9. Barcode/QR Scanning

**Mobile scanning infrastructure:**
- The mobile app (Module 40) includes a barcode/QR scanner that integrates with all inventory workflows.
- Camera-based scanning supports: UPC-A, UPC-E, EAN-13, Code 128, Code 39, and QR codes.
- External Bluetooth barcode scanners are supported as HID keyboard input devices.

**Scanning contexts:**
- **Receiving:** Scan item barcode → system matches to catalog item → enter quantity received → select PO line item.
- **Issuing/consuming:** Scan item barcode → enter quantity → select job and cost code → confirm issue.
- **Transfers:** Scan item barcode → enter quantity → select destination location → confirm transfer.
- **Physical counts:** Scan item barcode → system shows expected quantity → enter actual counted quantity.

**Bulk scan mode:**
- For high-volume operations (e.g., receiving a large delivery), bulk scan mode keeps the scanner active.
- Workflow: scan → beep confirmation → quantity entry (defaults to 1, override as needed) → scan next item.
- Running total displayed: "12 items scanned, 47 total units."
- Batch submit at the end to create all transactions at once.

**Barcode generation:**
- For items without manufacturer barcodes, the system generates custom QR codes.
- QR codes encode: `rossos://item/{builder_id}/{item_id}`.
- Labels can be printed via a label printer (Zebra, DYMO, Brother) or exported as PDF for standard printers.
- Batch label printing: select multiple items, generate a sheet of labels.

### 10. Cost Integration

**Material costs to budget (Module 09 integration):**
- When materials are issued to a job + cost code, the cost of the issued materials is posted as an actual cost to Module 09.
- The cost amount is determined by the configured cost method (FIFO, LIFO, or weighted average).
- The journal entry (for Module 11 — Native Accounting) debits the job cost account and credits the inventory asset account.

**Cost methods:**
- **FIFO (First In, First Out):** Oldest inventory is consumed first. The cost of issued items reflects the oldest purchase price.
- **LIFO (Last In, First Out):** Newest inventory is consumed first. The cost reflects the most recent purchase price.
- **Weighted Average:** The average cost of all units on hand is used for each issue. Recalculated after each receipt.
- Cost method is configured per builder in `v2_inventory_config`. All items for that builder use the same method.

**Cost variance tracking:**
- PO cost vs. receipt cost: captured at receiving. Variance = receipt unit cost - PO unit cost.
- Catalog cost vs. actual cost: the item's `default_unit_cost` compared to the actual cost at time of issue.
- Cost variance reports by item, by vendor, by time period.

**Inventory valuation report:**
- Total value of inventory on hand, by location and by item.
- Valuation uses the configured cost method (FIFO, LIFO, or weighted average).
- Used for financial reporting: inventory is an asset on the balance sheet.
- Valuation report is exportable as PDF and CSV for accountants.

**Shrinkage and waste cost attribution:**
- Shrinkage (count variance losses) and waste costs are attributed to appropriate cost codes.
- Configurable: builders choose whether shrinkage costs go to the job where the loss occurred, to a general overhead cost code, or to a dedicated shrinkage cost code.
- Waste costs always attribute to the job and cost code where the waste was recorded.

#### Edge Cases & What-If Scenarios

1. **Same material has different costs at different locations (FIFO/LIFO implications).** Wire purchased at $0.45/ft last month is at the warehouse. Wire purchased at $0.52/ft this week is at Job Site A. A transfer from warehouse to Job Site A mixes the cost layers. Required behavior:
   - Under FIFO: the transferred inventory carries its original cost ($0.45/ft). When issued from Job Site A, the FIFO order is maintained — older (cheaper) stock is consumed first.
   - Under weighted average: the transfer triggers a recalculation of the weighted average cost at the destination location. The new average considers both the existing stock and the transferred stock.
   - The system maintains cost layer detail per location per item in `v2_inventory_stock.unit_cost` (which represents the weighted average for that location) and in individual transaction records (which preserve the actual cost of each receipt).
   - Cost layer reports show the breakdown of inventory value by purchase date/cost for FIFO/LIFO analysis.

2. **Job site returns excess material to warehouse — re-entry at what cost?** After a job completes, 200 LF of wire is returned to the warehouse. It was originally received at $0.45/ft but the current market price is $0.52/ft. Required behavior:
   - Returns are valued at the cost they were issued at, not current market price. This maintains cost continuity and prevents artificial gains/losses.
   - The return transaction creates a credit to the job's cost code at the original issue cost and increases warehouse inventory at that same cost.
   - If the original issue cost is not determinable (e.g., the material was issued via weighted average), the return uses the weighted average cost at the time of issue.
   - The return cost enters the warehouse's cost pool and participates in future FIFO/weighted average calculations.
   - A return does NOT trigger a gain or loss — it simply reverses the original consumption charge.

---

## Database Tables

```sql
-- Material catalog / item master
CREATE TABLE v2_inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  category_id UUID REFERENCES v2_inventory_categories(id),
  unit_of_measure TEXT NOT NULL DEFAULT 'each',
  secondary_uom TEXT,
  uom_conversion_factor DECIMAL(12,4),
  default_unit_cost DECIMAL(12,4) DEFAULT 0,
  reorder_point DECIMAL(12,2),
  reorder_quantity DECIMAL(12,2),
  lead_time_days INTEGER,
  barcode TEXT,
  qr_code TEXT,
  photo_urls JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(builder_id, sku)
);

-- Category hierarchy (Division > Category > Item)
CREATE TABLE v2_inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  parent_id UUID REFERENCES v2_inventory_categories(id),
  name TEXT NOT NULL,
  code TEXT,
  level INTEGER NOT NULL DEFAULT 1
    CHECK (level IN (1, 2, 3)),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory locations (warehouse, job site, vehicle, virtual)
CREATE TABLE v2_inventory_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  name TEXT NOT NULL,
  location_type TEXT NOT NULL DEFAULT 'warehouse'
    CHECK (location_type IN ('warehouse', 'job_site', 'vehicle',
                              'in_transit', 'virtual')),
  parent_location_id UUID REFERENCES v2_inventory_locations(id),
  job_id UUID,                         -- FK -> v2_projects for job_site type
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock levels per item per location
CREATE TABLE v2_inventory_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  item_id UUID NOT NULL REFERENCES v2_inventory_items(id),
  location_id UUID NOT NULL REFERENCES v2_inventory_locations(id),
  quantity_on_hand DECIMAL(12,2) DEFAULT 0,
  quantity_reserved DECIMAL(12,2) DEFAULT 0,
  quantity_available DECIMAL(12,2) GENERATED ALWAYS AS
    (quantity_on_hand - quantity_reserved) STORED,
  unit_cost DECIMAL(12,4) DEFAULT 0,  -- weighted avg cost at this location
  last_count_date TIMESTAMPTZ,
  last_count_quantity DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(builder_id, item_id, location_id)
);

-- All inventory movements (receipt, issue, transfer, adjustment, waste)
CREATE TABLE v2_inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  item_id UUID NOT NULL REFERENCES v2_inventory_items(id),
  location_id UUID NOT NULL REFERENCES v2_inventory_locations(id),
  transaction_type TEXT NOT NULL
    CHECK (transaction_type IN ('receipt', 'issue', 'transfer_out',
                                 'transfer_in', 'adjustment', 'return',
                                 'waste')),
  quantity DECIMAL(12,2) NOT NULL,     -- positive for in, negative for out
  unit_cost DECIMAL(12,4),
  total_cost DECIMAL(14,2),
  reference_type TEXT
    CHECK (reference_type IN ('po', 'job', 'transfer', 'count', 'manual')),
  reference_id UUID,                   -- FK to PO, transfer, count, etc.
  job_id UUID,                         -- FK -> v2_projects for job-related txns
  cost_code_id UUID,                   -- FK -> v2_cost_codes for cost allocation
  batch_id UUID,                       -- groups bulk issues into one batch
  notes TEXT,
  performed_by UUID NOT NULL REFERENCES v2_users(id),
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transfer requests between locations
CREATE TABLE v2_inventory_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  from_location_id UUID NOT NULL REFERENCES v2_inventory_locations(id),
  to_location_id UUID NOT NULL REFERENCES v2_inventory_locations(id),
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'approved', 'in_transit',
                       'received', 'cancelled')),
  priority TEXT DEFAULT 'normal'
    CHECK (priority IN ('normal', 'urgent')),
  needed_by_date DATE,
  requested_by UUID NOT NULL REFERENCES v2_users(id),
  approved_by UUID REFERENCES v2_users(id),
  approved_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  received_by UUID REFERENCES v2_users(id),
  carrier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Line items on a transfer
CREATE TABLE v2_inventory_transfer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES v2_inventory_transfers(id) ON DELETE CASCADE,
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  item_id UUID NOT NULL REFERENCES v2_inventory_items(id),
  quantity_requested DECIMAL(12,2) NOT NULL,
  quantity_shipped DECIMAL(12,2) DEFAULT 0,
  quantity_received DECIMAL(12,2) DEFAULT 0,
  unit_cost DECIMAL(12,4),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory count sessions (full or cycle)
CREATE TABLE v2_inventory_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  location_id UUID NOT NULL REFERENCES v2_inventory_locations(id),
  count_type TEXT NOT NULL DEFAULT 'full'
    CHECK (count_type IN ('full', 'cycle')),
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  started_by UUID NOT NULL REFERENCES v2_users(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES v2_users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual item counts within a count session
CREATE TABLE v2_inventory_count_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  count_id UUID NOT NULL REFERENCES v2_inventory_counts(id) ON DELETE CASCADE,
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  item_id UUID NOT NULL REFERENCES v2_inventory_items(id),
  system_quantity DECIMAL(12,2) NOT NULL,   -- snapshot of system qty at count start
  counted_quantity DECIMAL(12,2),           -- actual counted qty (null until counted)
  variance DECIMAL(12,2) GENERATED ALWAYS AS
    (COALESCE(counted_quantity, 0) - system_quantity) STORED,
  adjustment_status TEXT DEFAULT 'pending'
    CHECK (adjustment_status IN ('pending', 'approved', 'rejected')),
  adjustment_reason TEXT
    CHECK (adjustment_reason IS NULL OR adjustment_reason IN (
      'shrinkage', 'damage', 'miscounted', 'theft', 'found',
      'unit_of_measure_error', 'data_entry_error'
    )),
  approved_by UUID REFERENCES v2_users(id),
  approved_at TIMESTAMPTZ,
  counted_by UUID REFERENCES v2_users(id),
  counted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Item-vendor relationships with pricing
CREATE TABLE v2_item_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  item_id UUID NOT NULL REFERENCES v2_inventory_items(id),
  vendor_id UUID NOT NULL REFERENCES v2_vendors(id),
  vendor_sku TEXT,
  vendor_item_name TEXT,
  unit_cost DECIMAL(12,4),
  is_preferred BOOLEAN DEFAULT FALSE,
  min_order_quantity DECIMAL(12,2),
  lead_time_days INTEGER,
  last_purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(builder_id, item_id, vendor_id)
);

-- Builder-level inventory configuration
CREATE TABLE v2_inventory_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL UNIQUE REFERENCES v2_builders(id),
  cost_method TEXT NOT NULL DEFAULT 'weighted_avg'
    CHECK (cost_method IN ('fifo', 'lifo', 'weighted_avg')),
  auto_reorder_enabled BOOLEAN DEFAULT FALSE,
  cycle_count_frequency_days INTEGER DEFAULT 90,
  require_po_for_receipt BOOLEAN DEFAULT FALSE,
  require_approval_for_adjustment BOOLEAN DEFAULT TRUE,
  adjustment_approval_threshold DECIMAL(12,2) DEFAULT 0,
  over_receipt_tolerance_pct DECIMAL(5,2) DEFAULT 10.0,
  count_freeze_transactions BOOLEAN DEFAULT FALSE,
  shrinkage_cost_code_id UUID,          -- FK -> v2_cost_codes
  waste_cost_attribution TEXT DEFAULT 'job'
    CHECK (waste_cost_attribution IN ('job', 'overhead', 'dedicated')),
  barcode_format TEXT DEFAULT 'qr'
    CHECK (barcode_format IN ('upc', 'ean', 'code128', 'qr')),
  material_tracking_required_for_jobs BOOLEAN DEFAULT FALSE,
  consumption_reconciliation_mode TEXT DEFAULT 'daily'
    CHECK (consumption_reconciliation_mode IN ('daily', 'weekly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Item aliases for normalization (vendor name variants)
CREATE TABLE v2_inventory_item_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  item_id UUID NOT NULL REFERENCES v2_inventory_items(id),
  alias_name TEXT NOT NULL,
  source TEXT DEFAULT 'manual'
    CHECK (source IN ('manual', 'ai_matched', 'vendor_import')),
  vendor_id UUID REFERENCES v2_vendors(id),   -- which vendor uses this name
  confidence DECIMAL(3,2),                     -- AI match confidence (0.00-1.00)
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(builder_id, alias_name)
);

-- In-transit loss records
CREATE TABLE v2_inventory_transit_losses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  transfer_id UUID NOT NULL REFERENCES v2_inventory_transfers(id),
  transfer_item_id UUID NOT NULL REFERENCES v2_inventory_transfer_items(id),
  item_id UUID NOT NULL REFERENCES v2_inventory_items(id),
  quantity_lost DECIMAL(12,2) NOT NULL,
  estimated_cost DECIMAL(12,2),
  loss_reason TEXT NOT NULL
    CHECK (loss_reason IN ('damage', 'shortage', 'theft', 'unknown')),
  carrier TEXT,
  photo_urls JSONB DEFAULT '[]',
  incident_report_reference TEXT,
  investigated_by UUID REFERENCES v2_users(id),
  investigation_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies (all tables)
ALTER TABLE v2_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_inventory_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_inventory_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_inventory_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_inventory_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_inventory_count_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_item_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_inventory_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_inventory_item_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_inventory_transit_losses ENABLE ROW LEVEL SECURITY;

-- RLS policies follow standard pattern: builder_id = get_current_builder_id()
-- Example for v2_inventory_items:
CREATE POLICY "inventory_items_tenant_isolation" ON v2_inventory_items
  USING (builder_id = get_current_builder_id());

-- Indexes for performance
CREATE INDEX idx_inventory_items_builder ON v2_inventory_items(builder_id);
CREATE INDEX idx_inventory_items_category ON v2_inventory_items(category_id);
CREATE INDEX idx_inventory_items_sku ON v2_inventory_items(builder_id, sku);
CREATE INDEX idx_inventory_items_barcode ON v2_inventory_items(barcode);
CREATE INDEX idx_inventory_stock_builder ON v2_inventory_stock(builder_id);
CREATE INDEX idx_inventory_stock_item ON v2_inventory_stock(item_id);
CREATE INDEX idx_inventory_stock_location ON v2_inventory_stock(location_id);
CREATE INDEX idx_inventory_stock_low ON v2_inventory_stock(builder_id, item_id)
  WHERE quantity_available <= 0;
CREATE INDEX idx_inventory_txns_builder ON v2_inventory_transactions(builder_id);
CREATE INDEX idx_inventory_txns_item ON v2_inventory_transactions(item_id);
CREATE INDEX idx_inventory_txns_location ON v2_inventory_transactions(location_id);
CREATE INDEX idx_inventory_txns_job ON v2_inventory_transactions(job_id);
CREATE INDEX idx_inventory_txns_type ON v2_inventory_transactions(transaction_type);
CREATE INDEX idx_inventory_txns_performed ON v2_inventory_transactions(performed_at);
CREATE INDEX idx_inventory_txns_batch ON v2_inventory_transactions(batch_id);
CREATE INDEX idx_inventory_transfers_builder ON v2_inventory_transfers(builder_id);
CREATE INDEX idx_inventory_transfers_status ON v2_inventory_transfers(status);
CREATE INDEX idx_inventory_counts_builder ON v2_inventory_counts(builder_id);
CREATE INDEX idx_inventory_counts_location ON v2_inventory_counts(location_id);
CREATE INDEX idx_item_vendors_builder ON v2_item_vendors(builder_id);
CREATE INDEX idx_item_vendors_item ON v2_item_vendors(item_id);
CREATE INDEX idx_item_vendors_vendor ON v2_item_vendors(vendor_id);
CREATE INDEX idx_item_aliases_builder ON v2_inventory_item_aliases(builder_id);
CREATE INDEX idx_item_aliases_name ON v2_inventory_item_aliases(alias_name);
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| **Item Catalog** | | |
| GET | `/api/v2/inventory/items` | List items (filter by category, active status, search) |
| POST | `/api/v2/inventory/items` | Create new catalog item |
| GET | `/api/v2/inventory/items/:id` | Get item detail with vendor associations and stock summary |
| PATCH | `/api/v2/inventory/items/:id` | Update item |
| POST | `/api/v2/inventory/items/import` | Bulk import items from CSV |
| GET | `/api/v2/inventory/categories` | List category tree |
| POST | `/api/v2/inventory/categories` | Create category |
| PATCH | `/api/v2/inventory/categories/:id` | Update category |
| GET | `/api/v2/inventory/items/:id/aliases` | List aliases for an item |
| POST | `/api/v2/inventory/items/:id/aliases` | Add alias to an item |
| **Stock & Locations** | | |
| GET | `/api/v2/inventory/stock` | Stock levels (filter by location, item, category) |
| GET | `/api/v2/inventory/stock/:itemId/locations` | Stock for one item across all locations |
| GET | `/api/v2/inventory/locations` | List all locations |
| POST | `/api/v2/inventory/locations` | Create location |
| PATCH | `/api/v2/inventory/locations/:id` | Update location |
| **Receiving** | | |
| POST | `/api/v2/inventory/receive` | Receive materials against PO or as unplanned receipt |
| GET | `/api/v2/inventory/receive/unplanned` | List unplanned receipts needing PO linkage |
| POST | `/api/v2/inventory/receive/:id/link-po` | Link an unplanned receipt to a PO |
| **Issuing / Consumption** | | |
| POST | `/api/v2/inventory/issue` | Issue materials to job + cost code |
| POST | `/api/v2/inventory/issue/bulk` | Bulk issue multiple items to same job |
| POST | `/api/v2/inventory/waste` | Record material waste |
| POST | `/api/v2/inventory/return` | Return materials from job to warehouse |
| **Transfers** | | |
| GET | `/api/v2/inventory/transfers` | List transfers (filter by status, location, date) |
| POST | `/api/v2/inventory/transfers` | Create transfer request |
| GET | `/api/v2/inventory/transfers/:id` | Get transfer detail with items |
| PATCH | `/api/v2/inventory/transfers/:id` | Update transfer (approve, ship, receive, cancel) |
| POST | `/api/v2/inventory/transfers/:id/receive` | Confirm receipt at destination |
| POST | `/api/v2/inventory/transfers/:id/loss` | Record in-transit loss |
| **Counts** | | |
| GET | `/api/v2/inventory/counts` | List count sessions |
| POST | `/api/v2/inventory/counts` | Start inventory count at a location |
| GET | `/api/v2/inventory/counts/:id` | Get count detail with item counts |
| POST | `/api/v2/inventory/counts/:id/items` | Enter or update count results |
| POST | `/api/v2/inventory/counts/:id/complete` | Finalize count, generate adjustments |
| GET | `/api/v2/inventory/counts/:id/variance` | Get variance report for a count |
| POST | `/api/v2/inventory/adjustments/:id/approve` | Approve a count adjustment |
| POST | `/api/v2/inventory/adjustments/:id/reject` | Reject adjustment (requires recount) |
| GET | `/api/v2/inventory/counts/cycle-list` | Get today's/this week's cycle count list |
| **Item Vendors** | | |
| GET | `/api/v2/inventory/items/:id/vendors` | List vendors for an item |
| POST | `/api/v2/inventory/items/:id/vendors` | Add vendor association |
| PATCH | `/api/v2/inventory/item-vendors/:id` | Update vendor association |
| DELETE | `/api/v2/inventory/item-vendors/:id` | Remove vendor association |
| **Reports** | | |
| GET | `/api/v2/inventory/reports/valuation` | Inventory valuation by location and item |
| GET | `/api/v2/inventory/reports/usage` | Consumption report by job, cost code, item |
| GET | `/api/v2/inventory/reports/reorder` | Items at or below reorder point |
| GET | `/api/v2/inventory/reports/variance` | Count variance history and accuracy trending |
| GET | `/api/v2/inventory/reports/waste` | Waste/shrinkage report by job, item, reason |
| GET | `/api/v2/inventory/reports/transit-losses` | In-transit loss history |
| GET | `/api/v2/inventory/reports/planned-vs-actual` | Job material plan vs. actual consumption |
| GET | `/api/v2/inventory/reports/forecast` | Material forecast for upcoming schedule tasks |
| **Configuration** | | |
| GET | `/api/v2/inventory/config` | Get builder's inventory configuration |
| PUT | `/api/v2/inventory/config` | Update builder's inventory configuration |
| **Barcode / Labels** | | |
| POST | `/api/v2/inventory/items/:id/generate-qr` | Generate QR code for an item |
| POST | `/api/v2/inventory/labels/print` | Generate printable label sheet for selected items |
| POST | `/api/v2/inventory/scan/lookup` | Look up item by barcode/QR code value |

---

## UI Components

| Component | Description |
|-----------|-------------|
| **InventoryDashboard** | Overview cards: total items, total value, low stock count, pending transfers, active counts. Quick links to common actions. |
| **ItemCatalogList** | Filterable, sortable table of all catalog items with photo thumbnail, SKU, category, stock summary, and status badges. Supports bulk actions (activate, deactivate, export). |
| **ItemDetailPanel** | Full item detail view with tabs: Details, Stock by Location, Vendors, Transaction History, Aliases, Photos. |
| **ItemForm** | Create/edit item form with: basic info, category picker (hierarchical), UOM configuration, cost fields, reorder settings, barcode/QR, and photo upload. |
| **CategoryTreeManager** | Hierarchical tree view for managing the Division > Category > Item taxonomy with drag-and-drop reordering. |
| **StockLevelGrid** | Matrix view: items as rows, locations as columns, quantities in cells. Color-coded: green (above reorder), yellow (near reorder), red (below reorder or zero). |
| **StockByLocationPanel** | For a single item, shows stock at each location with quantity on hand, reserved, available, and last count date. |
| **ReceivingForm** | Mobile-friendly form: select PO, scan/select items, enter quantities, quality check status, photo capture. Supports partial receipt. |
| **UnplannedReceiptForm** | Simplified receiving form for materials without a PO. Item selector, quantity, cost, vendor, and location fields. |
| **TransferRequestForm** | Create transfer: select from/to location, add items with quantities, set priority and needed-by date. Shows stock availability at source. |
| **TransferList** | Filterable table of all transfers with status badges (requested, approved, in transit, received, cancelled) and aging indicators. |
| **TransferDetailPanel** | Full transfer detail with item list, shipped vs. received quantities, discrepancy highlighting, and loss reporting. |
| **IssueToJobForm** | Issue materials: scan/select items, enter quantities, select job from picker, select cost code. Supports bulk issue mode. |
| **WasteEntryForm** | Record waste: item, quantity, reason selector, photo upload, job and cost code assignment. |
| **CountStartWizard** | Start a count session: select location, count type (full/cycle), and generate the item list with system quantities. |
| **CountEntryForm** | Mobile-optimized count entry: scan item → see photo + system qty → enter counted qty. Running tally of items counted vs. total. |
| **VarianceReviewTable** | After count completion: table of all items with system qty, counted qty, variance, and adjustment reason/status. Bulk approve/reject actions. |
| **ReorderAlertList** | Items below reorder point with: item name, current stock, reorder point, suggested order quantity, preferred vendor, and "Generate PO" action. |
| **MaterialPlanningDashboard** | Per-job view: planned materials from estimate vs. actual consumption. Progress bars and variance highlighting. |
| **MaterialForecastPanel** | Upcoming material needs based on schedule, with readiness status (on hand, ordered, not ordered) and pre-stage actions. |
| **BarcodeScannerView** | Full-screen mobile scanner with context selector (receive, issue, transfer, count). Scan results display item details and action form. |
| **LabelPrintDialog** | Select items, choose label format (QR/barcode), preview labels, and print or export as PDF. |
| **InventoryValuationReport** | Summary and detail views of inventory value by location and item, with cost method indicator and export options. |
| **UsageReportBuilder** | Configurable usage report: select date range, group by (job/cost code/item/vendor), and visualization (table/chart). |
| **InventoryConfigPanel** | Builder admin settings: cost method, auto-reorder toggle, count frequency, PO requirement, approval thresholds, barcode format. |
| **ItemVendorManager** | Per-item vendor association management: add/remove vendors, set preferred, edit pricing and lead times. |

---

## Dependencies

| Module | Relationship |
|--------|-------------|
| **Module 3: Core Data Model** | Projects (job sites for locations), cost codes (for consumption cost allocation) |
| **Module 5: Notification Engine** | Low stock alerts, reorder alerts, transfer request/approval notifications, count completion notifications |
| **Module 6: Document Storage** | Receipt photos, waste photos, count documentation, packing slip scans |
| **Module 7: Scheduling** | Material forecast from upcoming tasks, pre-staging lead time calculation |
| **Module 8: Daily Logs** | Material delivery verification, consumption-to-daily-log linkage |
| **Module 9: Budget & Cost Tracking** | Material costs posted as actuals when consumed; waste/shrinkage cost attribution |
| **Module 10: Vendor Management** | Vendor catalog for item-vendor associations, preferred vendors |
| **Module 11: Native Accounting** | Inventory asset valuation, COGS journal entries on consumption, shrinkage write-offs |
| **Module 18: Purchase Orders** | Receive against PO, partial receipt updates PO status, auto-generate draft PO from reorder |
| **Module 20: Estimating Engine** | Material lists from estimates for job site material planning |
| **Module 22: Vendor Performance** | Substitution tracking, delivery accuracy, pricing consistency |
| **Module 35: Equipment & Assets** | Distinct module — materials vs. equipment. Shared barcode scanning infrastructure but separate data models. |
| **Module 40: Mobile App** | Mobile barcode scanning, field receiving, count entry, issue-to-job from the field |

---

## Unusual Business Scenarios — Inventory Edge Cases

### Theft or Vandalism at Job Site (GAP-712)
When materials are stolen from a job site (overnight theft, vandalism), the system must support:
- **Theft reporting workflow:** Field user reports theft with: items believed stolen, estimated quantities, estimated value, discovery date/time, photos of break-in/damage, police report number.
- **Inventory adjustment:** Create `adjustment` transactions with reason `theft` for each stolen item. Adjustments reduce stock at the job site location.
- **Cost attribution:** Theft costs can be attributed to: (a) the job's general conditions cost code, (b) a dedicated "theft/loss" cost code, or (c) a company-level overhead code. Configurable per builder.
- **Insurance claim documentation:** Generate a theft loss report with: item details, quantities, unit costs, total value, receipt/PO documentation proving the items were on site, and photos. Exportable as PDF for insurance filing.
- **Security pattern analysis:** Track theft incidents by location, time of day/week, and items stolen. Surface patterns: "Job Site Maple Ave has had 3 theft incidents in 6 months, totaling $8,400 in losses."
- **Replacement workflow:** Auto-generate a draft PO for replacement materials. Link the replacement PO to the theft incident for cost tracking.

### Vendor Recall of Defective Material (GAP-713)
When a vendor or manufacturer issues a recall for defective material that may be in the builder's inventory or already installed in projects, the system must support:
- **Recall identification:** Search all inventory transactions for the recalled item by: item, vendor, date range (when the defective batch was sold), and lot/batch number (if tracked).
- **Affected inventory:** Identify all locations where the recalled item is currently in stock. Flag this stock as "recalled — do not use" without removing it from inventory counts.
- **Affected projects:** Identify all jobs where the recalled item was issued/consumed. Generate a report: "Recalled item [name] was issued to [X] jobs between [date] and [date], totaling [Y] units."
- **Return workflow:** Generate return-to-vendor transfers for recalled stock. Track the vendor credit for returned materials.
- **Replacement sourcing:** Identify alternative items in the catalog or from other vendors. Generate replacement POs.
- **Cost tracking:** Track the full cost of the recall response: labor for identifying and pulling stock, return shipping, replacement material costs, and any rework costs on affected projects. Attribute to a "vendor recall" cost code for insurance and vendor dispute purposes.

### Material Expiration / Shelf Life (GAP-714)
Some construction materials have a limited shelf life (sealants, adhesives, certain paints, concrete admixtures). The system must support:
- **Expiration date tracking:** Optional `expiration_date` field on receipt records for perishable materials.
- **Expiration alerts:** When materials approach expiration (configurable lead time, default: 30 days), generate an alert: "[Item] at [location] expires on [date]. Quantity: [X]. Value: [$Y]."
- **FEFO (First Expired, First Out):** For perishable items, the system suggests issuing the oldest-expiration stock first, regardless of the builder's general cost method (FIFO/LIFO/weighted avg).
- **Expired material handling:** Expired materials are flagged as "expired — do not use." The builder can: dispose (waste transaction with reason "expired"), return to vendor if within vendor's return window, or override expiration (with documentation and approval) for materials where the builder determines the material is still usable.

---

## Open Questions

1. Should inventory management be a standard module or an optional/premium feature? Many small builders (custom home builders with 5-10 projects/year) may not track material inventory formally.
2. What is the right default cost method? Weighted average is simplest and most common for construction materials. FIFO is more accurate for tax purposes. Should the default be `weighted_avg` with FIFO/LIFO as configuration options?
3. Should lot/batch number tracking be included in V1? This is important for recalls and quality traceability but adds complexity to receiving and issuing workflows.
4. How should the system handle serialized items (items tracked by individual serial number rather than quantity)? This overlaps with Module 35 (Equipment) — is there a clean boundary?
5. Should the barcode scanning infrastructure be shared as a platform service used by both Module 35 (Equipment) and Module 52 (Inventory), or should each module maintain its own scanning logic?
6. How granular should bin-level tracking be? Some warehouses need rack/shelf/bin tracking; others only need location-level. Should bin-level be a V2 feature?
7. Should the system support consignment inventory (vendor-owned materials stored at the builder's warehouse, only paid for when consumed)?
8. For multi-location builders with separate warehouse teams, should transfer approval routing be configurable per location (e.g., Warehouse A manager approves outbound, Job Site PM approves inbound)?
9. What is the offline data sync strategy for mobile count entry? Construction sites often have poor connectivity. How much data should be cached, and what happens with sync conflicts?
10. Should material forecast integrate with weather data (Module 25 — Schedule Intelligence) to adjust for weather-delayed tasks that push out material needs?
