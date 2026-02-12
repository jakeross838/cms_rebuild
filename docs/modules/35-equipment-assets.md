# Module 35: Equipment & Asset Management

**Phase:** 5 - Full Platform
**Status:** TODO
**Optional Module:** Yes -- relevant for builders with significant equipment fleets

---

## Overview

Equipment and asset management for construction companies covering inventory tracking,
maintenance scheduling, utilization tracking, rental management, GPS location tracking,
and depreciation calculation. Handles both owned equipment (excavators, skid steers,
generators, compressors, laser levels) and rented equipment, providing a unified view of
all equipment deployed across projects with full cost allocation.

For smaller builders who own minimal equipment, this module tracks tools and small assets
(laser levels, power tools, safety equipment). For larger builders with heavy equipment
fleets, it provides full fleet management with maintenance schedules, utilization
analytics, and depreciation tracking for financial reporting.

---

## Gap Items Addressed

| Gap # | Description | Resolution |
|-------|-------------|------------|
| 564 | Equipment tracking as optional module | Feature-flagged per tenant; scales from simple tool tracking to full fleet management |
| 565 | Equipment cost allocation to projects (configurable methods) | Multiple allocation methods: hours used, days on site, flat rate, percentage -- configurable per asset |
| 566 | Rental vs. owned equipment (different cost tracking) | Dual-track system: owned assets with depreciation, rentals with PO/invoice linkage |
| 567 | Equipment maintenance scheduling (service intervals, inspection dates, auto-alerts) | Maintenance schedule engine with hour-based and calendar-based triggers |
| 568 | Equipment depreciation for financial reporting | Multiple depreciation methods: straight-line, MACRS, units of production |

---

## Detailed Requirements

### Equipment Inventory
- Asset registry: name, type, make, model, serial number, year, purchase date, purchase price
- Asset categories: heavy equipment, power tools, hand tools, safety equipment, vehicles, technology
- Asset photos and documentation (manuals, warranty cards, registration)
- QR code / barcode generation per asset for field scanning
- Asset status tracking: available, deployed, maintenance, repair, retired, sold, lost/stolen
- Minimum asset detail for small tools; full detail for major equipment
- Bulk import from CSV/Excel for initial inventory load

### Maintenance Scheduling
- Calendar-based maintenance: schedule service every 90 days, annually, etc.
- Hour-based maintenance: service every 250 operating hours, 500 hours, etc.
- Maintenance types: preventive, corrective, inspection, calibration
- Maintenance task checklists per equipment type (oil change, filter replacement, belt inspection, etc.)
- Service provider tracking: internal mechanic, dealer service, third-party shop
- Maintenance cost tracking: parts, labor, service fees
- Maintenance history log per asset
- Overdue maintenance alerts with escalation
- Pre-trip / pre-use inspection checklists (configurable per equipment type)

### Utilization Tracking
- Equipment deployment log: which project, start date, end date, hours used
- Utilization rate calculation: deployed hours / available hours
- Idle equipment alerts: asset not deployed for configurable number of days
- Utilization reports by asset, by category, by project, by time period
- Cost-per-hour calculation: (annual ownership cost + maintenance) / annual hours used
- Decision support: rent vs. own analysis based on actual utilization data
- Hour meter reading log (manual entry or telematics integration)

### Rental Management
- Rental tracking: vendor, equipment description, rental rate, start date, expected return date
- Rental PO linkage: tie rental to purchase order and project
- Rental cost tracking: daily/weekly/monthly rate, delivery/pickup fees, damage charges
- Rental return reminders (avoid unnecessary rental days)
- Rental invoice reconciliation: compare rental agreement terms to actual invoices
- Off-rent notification workflow: request pickup, confirm return, document condition
- Rental cost comparison: what you are spending on rentals for equipment you could own

### GPS & Location Tracking
- GPS integration for equipped assets (telematics providers: Caterpillar, John Deere, GPS Trackit, etc.)
- Current location display on map view
- Geofence alerts: equipment leaves designated job site
- Location history / breadcrumb trail
- Theft alert: equipment moves outside business hours or outside geofence
- Manual location update for non-GPS assets (field crew checks in equipment location)

### Depreciation & Financial
- Depreciation methods: straight-line, declining balance, MACRS (3, 5, 7, 10 year classes)
- Annual depreciation calculation per asset
- Book value tracking over time
- Depreciation schedule report for accountant / tax preparer
- Salvage value tracking
- Disposal / sale tracking: sale price, gain/loss calculation
- Equipment cost allocation to projects: configurable method per asset
  - Hours used on project x cost-per-hour
  - Days on project x daily rate
  - Flat monthly charge per project
  - Percentage of total project equipment budget
- Project equipment cost reporting feeding into Module 19 financial reports

### Edge Cases & What-If Scenarios

1. **Equipment breakdown on a job site.** When a piece of equipment breaks down during active use on a project, the system must support a rapid response workflow: the field user reports the breakdown (with photos and description), the system automatically creates a corrective maintenance record, and the impact on the project schedule is flagged. If the equipment is critical to in-progress tasks, the system should suggest alternatives -- available owned equipment that can substitute, or rental options from the rental management module. The repair process must be tracked end-to-end: reported, diagnosed, parts ordered, repair in progress, returned to service. Downtime hours and repair costs are captured and attributed to the project and the asset's lifetime cost record.

2. **Lost or stolen tools.** The checkout/check-in system must handle the scenario where an asset is not returned. When a checked-out item passes its expected return date by a configurable threshold (default: 3 days), the system escalates: first an overdue alert to the employee and their supervisor, then a second alert to the admin/owner. If the item cannot be located, the system must support marking it as "lost" or "stolen" with required documentation (date discovered, last known location, circumstances, police report number for theft). Lost/stolen assets are removed from the available inventory, their remaining book value is written off, and the loss is attributed to the project where the asset was last deployed. The system must generate a loss report for insurance claims.

3. **Rent vs. own analysis for informed capital decisions.** The system must make it easy for a builder to see the total cost of renting a particular equipment type over a rolling period (12 months, 24 months) and compare that to the estimated total cost of ownership (purchase price, maintenance, insurance, storage, depreciation). The analysis should be triggered automatically when cumulative rental spend on a category exceeds a configurable threshold (e.g., "You have spent $18,000 renting skid steers in the last 12 months -- a comparable purchase would cost $45,000 with estimated annual operating cost of $8,000"). This decision support tool feeds from actual rental history and maintenance cost data already in the system, not hypothetical estimates.

### Check-Out / Check-In
- Tool and small equipment checkout workflow
- Employee signs out asset (digital signature or mobile scan)
- Expected return date
- Check-in confirmation with condition assessment
- Overdue checkout alerts
- Loss/damage reporting workflow with cost documentation

---

## Database Tables

```
equipment
  id, builder_id, name, category, type, make, model, serial_number,
  year, purchase_date, purchase_price, salvage_value, status,
  depreciation_method, useful_life_years, current_book_value,
  qr_code, photo_urls, notes, is_rental, created_at, updated_at

equipment_deployments
  id, equipment_id, project_id, deployed_by, start_date, end_date,
  hours_used, allocation_method, cost_allocated, notes, created_at

equipment_maintenance_schedules
  id, equipment_id, maintenance_type, frequency_type (calendar|hours),
  interval_value, last_performed_date, last_performed_hours,
  next_due_date, next_due_hours, checklist_template_id

equipment_maintenance_logs
  id, equipment_id, schedule_id, performed_date, performed_by,
  maintenance_type, description, parts_cost, labor_cost,
  service_provider, hours_at_service, notes, document_urls

equipment_hour_readings
  id, equipment_id, reading_date, hours, recorded_by, source (manual|telematics)

equipment_rentals
  id, builder_id, project_id, vendor_id, po_id, equipment_description,
  rental_rate, rate_period (daily|weekly|monthly), start_date,
  expected_return_date, actual_return_date, delivery_fee, pickup_fee,
  total_cost, status, notes, created_at

equipment_gps_locations
  id, equipment_id, latitude, longitude, timestamp, source,
  speed, heading, geofence_status

equipment_geofences
  id, builder_id, project_id, name, boundary_polygon, is_active

equipment_checkouts
  id, equipment_id, checked_out_by, checked_out_at,
  expected_return_date, checked_in_at, checked_in_by,
  condition_out, condition_in, damage_notes, signature_url

equipment_depreciation
  id, equipment_id, year, beginning_value, depreciation_amount,
  ending_value, method, calculated_at
```

---

## API Endpoints

```
GET    /api/v2/equipment                           # List equipment (filter by status, category, project)
POST   /api/v2/equipment                           # Add equipment
GET    /api/v2/equipment/:id                       # Equipment detail
PATCH  /api/v2/equipment/:id                       # Update equipment
GET    /api/v2/equipment/:id/history               # Deployment + maintenance history

POST   /api/v2/equipment/:id/deploy                # Deploy to project
POST   /api/v2/equipment/:id/return                # Return from project
GET    /api/v2/equipment/utilization               # Utilization report

GET    /api/v2/equipment/:id/maintenance            # Maintenance schedule and log
POST   /api/v2/equipment/:id/maintenance            # Log maintenance performed
GET    /api/v2/equipment/maintenance/overdue        # Overdue maintenance alerts

GET    /api/v2/equipment/rentals                   # Active rentals
POST   /api/v2/equipment/rentals                   # Create rental record
PATCH  /api/v2/equipment/rentals/:id               # Update rental (return, extend)

POST   /api/v2/equipment/:id/checkout              # Check out tool/small equipment
POST   /api/v2/equipment/:id/checkin               # Check in tool/small equipment

GET    /api/v2/equipment/:id/gps                   # Current GPS location
GET    /api/v2/equipment/map                       # All equipment on map

GET    /api/v2/equipment/depreciation              # Depreciation schedule report
GET    /api/v2/equipment/cost-allocation/:projectId # Equipment costs allocated to project
```

---

## Dependencies

| Module | Relationship |
|--------|-------------|
| Module 3: Core Data Model | Project context for deployment and cost allocation |
| Module 34: HR & Workforce | Employee assignment for checkouts and deployments |
| Module 20: Purchasing & Procurement | Rental PO linkage |
| Module 5: Notification Engine | Maintenance alerts, rental return reminders, geofence alerts |
| Module 19: Financial Reporting | Depreciation and equipment cost data for financial reports |
| Module 10: Contact/Vendor Management | Rental vendor and service provider tracking |

---

## Open Questions

1. Which telematics providers should be supported at launch? (Cat, Deere, Komatsu, generic GPS trackers?)
2. Should QR codes be printable labels the builder affixes to equipment, or just in-app identifiers?
3. How granular should cost allocation be? Per hour on project, or is daily granularity sufficient?
4. Should the module integrate with equipment dealer portals for maintenance scheduling?
5. How do we handle shared equipment between related builder entities (multiple LLCs)?
6. What is the threshold between "tool" (simple checkout) and "equipment" (full fleet management)? Is this configurable?
