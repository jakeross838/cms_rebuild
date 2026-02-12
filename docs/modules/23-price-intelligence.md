# Module 23: Material Price Intelligence

**Phase:** 4 - Intelligence
**Status:** TODO
**Priority:** High (estimating accuracy enabler)

---

## Overview

A price tracking and intelligence system that monitors material costs over time, detects pricing anomalies, compares supplier pricing, forecasts cost escalation, and provides regional pricing context. Feeds directly into the estimating engine to improve cost accuracy and alerts builders to significant market changes that affect their project budgets. Combines internal procurement data (actual prices paid by the builder) with optional external market data to create a comprehensive pricing database that gets smarter with every purchase order and invoice processed.

---

## Gap Items Addressed

| Gap # | Description | Section |
|-------|-------------|---------|
| 387 | Vendor rate sheets (standing pricing agreements auto-populate POs) | Supplier Pricing |
| 491 | AI per-tenant vs. cross-tenant learning (with permission) | Data Strategy |
| 492 | AI model: shared with per-builder fine-tuning | Data Strategy |
| 493 | AI accuracy transparency (confidence based on data points) | Confidence Scoring |
| 494 | AI cold-start with industry benchmarks + regional data | Cold Start |
| 496 | AI data requirements communicated to user | Data Transparency |
| 497 | User feedback loop for wrong AI recommendations | Learning Loop |
| 501 | AI suggestions vs. AI automation (configurable per builder) | Automation Level |
| 502 | AI anomaly detection across platform | Anomaly Detection |
| 503 | AI transparency ("why did you recommend this?") | Explainability |

---

## Detailed Requirements

### 1. Material Price Tracking Over Time

- Every invoice and PO processed in the system captures: material item, quantity, unit price, vendor, date, and project location.
- Prices are normalized by unit of measure (e.g., $/BF for lumber, $/SF for tile, $/LF for pipe).
- Historical price database builds automatically from builder's own transaction data.
- Price timeline visualization showing cost trajectory per material over 3, 6, 12, 24 months.
- Support for tracking commodity-level prices (framing lumber, concrete, copper, steel rebar) as well as product-specific prices (specific tile SKU, specific fixture model).

### 2. Price Anomaly Detection

- When an invoice or bid is received, the system compares the unit price against:
  - This builder's historical average for this material.
  - This vendor's historical pricing for this material.
  - Platform-wide average (anonymized, if opted in).
  - Recent market trend direction.
- Anomalies are flagged with severity levels (Gap 502):
  - **Info**: Price is 10-20% above/below historical average.
  - **Warning**: Price is 20-50% above/below historical average.
  - **Alert**: Price is 50%+ above historical average or significantly below (possible error or quality concern).
- Each flag includes an explanation: "This price is 35% above your 6-month average of $X/unit for this material from this vendor" (Gap 503).
- Users can dismiss flags with a reason ("new product tier," "market increase," "negotiated bulk discount") which feeds the learning model (Gap 497).

### 3. Supplier Price Comparison

- For any material, show a comparison of prices from all vendors who have supplied it.
- Comparison includes: current price, historical average, last-quoted price, lead time, and quality notes.
- Side-by-side vendor comparison for a specific material or bill of materials.
- Price-to-quality ratio: vendors with higher prices but better quality scores (from Module 22) are flagged as "premium" rather than "expensive."
- Support for vendor rate sheets: pre-negotiated pricing agreements that auto-populate PO line items and serve as the baseline for comparison (Gap 387).

### 4. Cost Escalation Forecasting

- Based on historical price trends, project forward the expected cost of materials for upcoming projects.
- Forecasting models:
  - **Linear trend**: Simple linear regression on historical prices.
  - **Seasonal adjustment**: Account for seasonal price patterns (e.g., lumber prices peak in spring).
  - **Market-informed** (future): Incorporate external commodity index data.
- Forecast confidence interval: show range (optimistic, expected, pessimistic) based on data volatility.
- Budget impact projection: "If current trends continue, your framing material costs on [Project X] will be $Y more than estimated."
- Configurable forecast horizon: 3, 6, or 12 months forward.

### 5. Integration with Supplier Portals (Future)

- API integrations with major construction material suppliers for real-time pricing and availability.
- Initial target integrations: lumber yards (84 Lumber, etc.), electrical distributors, plumbing supply houses.
- Auto-update price database when supplier prices change.
- Availability and lead time data feeds.
- This is a Phase 5+ feature; V1 relies entirely on internal transaction data.

### 6. Regional Pricing Variations

- Prices are tagged with geographic context (project zip code or builder metro area).
- Regional price indices: compare a builder's prices against regional averages.
- Cross-region analysis for builders operating in multiple markets.
- Regional data supports the AI cold-start problem: new builders get regional benchmarks before they have their own data (Gap 494).

### 7. AI Data Strategy

- **Per-tenant learning**: Each builder's price data trains their own pricing model. Suggestions are based primarily on their own history (Gap 491).
- **Cross-tenant learning**: With explicit opt-in, anonymized pricing data contributes to a platform-wide model that benefits all builders. Builder data is never individually identifiable (Gap 491, 492).
- **Cold-start strategy**: New builders with fewer than N transactions per material category receive suggestions from the platform-wide model, weighted by region and project type. As proprietary data accumulates, the blend shifts toward per-tenant data (Gap 494).
- **Data requirements transparency**: The system clearly communicates what data is needed: "Price intelligence for [Electrical] is based on 3 invoices. 10+ invoices needed for high-confidence suggestions" (Gap 496).
- **Feedback loop**: When a user corrects or dismisses an AI suggestion, the correction is captured and used to improve future suggestions (Gap 497).

### 8. Automation Levels

- Configurable per builder (Gap 501):
  - **Suggestion mode**: AI provides price suggestions in the estimating module; user accepts, modifies, or ignores.
  - **Auto-fill mode**: AI auto-populates unit prices in new estimates; user reviews and adjusts.
  - **Alert-only mode**: AI monitors prices but only flags anomalies; no proactive suggestions.
- Each builder configures their preferred mode per material category or globally.

### 9. Explainability

- Every AI-generated price suggestion includes an explanation (Gap 503):
  - Data sources used (how many invoices, from which vendors, over what time period).
  - Confidence level (low/medium/high) with clear criteria.
  - Comparison to alternatives: "Vendor A's price is 12% below your average; Vendor B quoted 8% above."
  - Regional context: "This is 5% above the regional average for [metro area]."
- "Why this price?" expandable detail on any AI suggestion.

---

## Database Tables

```
v2_material_prices
  id, builder_id, material_name, material_category, sku, vendor_id,
  unit_price, unit_of_measure, quantity, source_type (invoice|po|bid|rate_sheet|manual),
  source_id, project_id, region_code, recorded_date, created_at

v2_material_catalog
  id, builder_id, name, category, default_unit, description, is_commodity,
  commodity_index_key, created_at

v2_vendor_rate_sheets
  id, builder_id, vendor_id, name, effective_date, expiration_date,
  status (active|expired|superseded), created_at

v2_rate_sheet_items
  id, rate_sheet_id, material_catalog_id, material_name, unit_price,
  unit_of_measure, min_quantity, max_quantity, notes

v2_price_anomalies
  id, builder_id, material_price_id, anomaly_type (high|low|spike|drop),
  severity (info|warning|alert), expected_price, actual_price, deviation_pct,
  explanation, status (open|dismissed|investigated), dismissed_reason,
  dismissed_by, created_at

v2_price_forecasts
  id, builder_id, material_catalog_id, forecast_date, forecast_price_low,
  forecast_price_mid, forecast_price_high, confidence, model_type (linear|seasonal|market),
  data_points_used, generated_at

v2_price_feedback
  id, builder_id, suggestion_type (estimate_price|anomaly_flag|forecast),
  source_id, feedback (accepted|modified|rejected), user_value, user_reason,
  created_by, created_at

v2_regional_price_indices
  region_code, material_category, avg_price, median_price, sample_size,
  period_start, period_end, calculated_at

v2_price_intelligence_config
  id, builder_id, automation_level (suggestion|auto_fill|alert_only),
  forecast_horizon_months, anomaly_threshold_info_pct, anomaly_threshold_warning_pct,
  anomaly_threshold_alert_pct, cross_tenant_opt_in, created_at, updated_at
```

---

## API Endpoints

```
# Material Catalog
GET    /api/v2/materials                             # List builder's material catalog
POST   /api/v2/materials                             # Add material to catalog
PUT    /api/v2/materials/:id                         # Update material
GET    /api/v2/materials/:id/price-history            # Price history for a material

# Price Tracking
GET    /api/v2/prices/trends                         # Price trends (filterable by material, vendor, date range)
GET    /api/v2/prices/compare                        # Supplier price comparison for a material
GET    /api/v2/prices/regional                       # Regional price data for a material

# Rate Sheets
GET    /api/v2/vendors/:id/rate-sheets               # List vendor's rate sheets
POST   /api/v2/vendors/:id/rate-sheets               # Upload/create rate sheet
GET    /api/v2/rate-sheets/:id                       # Get rate sheet with items
PUT    /api/v2/rate-sheets/:id                       # Update rate sheet

# Anomaly Detection
GET    /api/v2/prices/anomalies                      # List all open anomalies
GET    /api/v2/prices/anomalies/:id                  # Get anomaly detail with explanation
PUT    /api/v2/prices/anomalies/:id/dismiss          # Dismiss with reason
POST   /api/v2/prices/check                          # Check a price against historical data (ad-hoc)

# Forecasting
GET    /api/v2/prices/forecast/:materialId           # Get price forecast for a material
GET    /api/v2/prices/forecast/budget-impact/:projectId  # Forecast impact on project budget

# AI Suggestions
POST   /api/v2/prices/suggest                        # Get AI price suggestion for estimate line items
POST   /api/v2/prices/feedback                       # Submit feedback on AI suggestion
GET    /api/v2/prices/explain/:suggestionId          # Get detailed explanation of a suggestion

# Configuration
GET    /api/v2/price-intelligence/config             # Get builder's price intelligence settings
PUT    /api/v2/price-intelligence/config             # Update settings
GET    /api/v2/price-intelligence/data-status         # Data sufficiency status per category
```

---

## UI Components

| Component | Description |
|-----------|-------------|
| `PriceTrendChart` | Line chart showing material price over time with trend line |
| `SupplierComparisonTable` | Side-by-side vendor pricing for a material with quality scores |
| `AnomalyAlertCard` | Card showing flagged price with deviation %, explanation, and dismiss action |
| `AnomalyDashboard` | List of all open anomalies sorted by severity |
| `ForecastChart` | Price forecast with confidence interval (fan chart) |
| `BudgetImpactProjection` | Shows forecasted cost impact on active project budgets |
| `RateSheetManager` | View and edit vendor rate sheets with item pricing |
| `RegionalPriceMap` | Map visualization showing price variation by region |
| `DataSufficiencyIndicator` | Per-category indicator showing data availability and confidence level |
| `AIExplanationPanel` | Expandable detail showing how AI arrived at a price suggestion |
| `PriceFeedbackForm` | Accept/modify/reject AI suggestion with reason capture |
| `PriceIntelligenceSettings` | Builder configuration for automation level, thresholds, opt-in |
| `MaterialPriceWidget` | Inline widget in estimating module showing current intelligence for a line item |
| `CommodityIndexTracker` | Dashboard showing commodity price indices (lumber, copper, concrete) |

---

## Dependencies

- **Module 20: Estimating Engine** -- primary consumer of price suggestions; estimate line items feed price data
- **Module 10: Contact/Vendor Management** -- vendor records for supplier comparison
- **Module 16: Invoice Processing** -- invoice data feeds price tracking
- **Module 20: Purchasing & Procurement** -- PO data feeds price tracking
- **Module 22: Vendor Performance** -- quality scores for price-to-quality ratio
- **External data sources** (future) -- commodity indices, supplier APIs

---

## Open Questions

1. What external commodity data sources should be integrated for V2? (RS Means, commodity futures, supplier APIs)
2. How frequently should price forecasts be recalculated -- daily, weekly, or on-demand only?
3. For cross-tenant benchmarking, what is the minimum anonymity threshold (e.g., at least 5 builders contributing data before a regional average is published)?
4. Should the system track and compare labor rates in addition to material prices, or is labor pricing out of scope for this module?
5. How should we handle material price data quality -- what validation rules prevent bad data (e.g., typos creating a $0.50 entry for a $50 item) from corrupting the model?
6. Should rate sheets support tiered pricing (different price per unit at different quantity breakpoints)?
