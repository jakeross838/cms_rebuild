# Module 25: Schedule Intelligence

**Phase:** 4 - Intelligence
**Status:** TODO
**Priority:** High (differentiator feature)

---

## Overview

AI-driven schedule analysis engine that learns from historical project data to predict task durations, detect delay risks, optimize resource allocation, and adapt schedules for weather and seasonal patterns. This module sits on top of the core scheduling engine (Module 7) and transforms raw schedule data into actionable intelligence. The system improves over time as more projects are completed, making it increasingly valuable for builders who stay on the platform.

---

## Gap Items Addressed

| Gap # | Description | Coverage |
|-------|-------------|----------|
| 291 | Different scheduling methods (Gantt, calendar, Kanban, list) | Intelligence layer works across all view types |
| 292 | Schedule templates that builders reuse | AI-suggested templates from historical patterns |
| 296 | Resource leveling across multiple jobs with shared vendors | Cross-project resource optimization engine |
| 298 | Schedule baselines and drift tracking | Baseline comparison with AI drift prediction |
| 299 | Scheduling contingency/buffer management | AI-calculated buffer recommendations per task |
| 302 | Schedule what-if scenarios | AI-powered scenario modeling with probability outcomes |
| 304 | Schedule recovery after delay | Compression and re-sequencing recommendations |
| 305 | Two-week look-ahead scheduling | AI-generated look-ahead with risk flags |
| 306 | Weather API integration — service, accuracy, granularity | Weather data pipeline with per-trade impact mapping |
| 307 | Weather impact varies by trade | Trade-specific weather sensitivity configuration |
| 308 | Seasonal scheduling intelligence | Regional seasonal pattern learning and enforcement |
| 309 | Weather delay documentation | Auto-generated weather delay logs for contract claims |
| 310 | Hurricane/severe weather preparation | Severe weather alert integration with prep checklists |
| 312 | Extreme heat scheduling (OSHA) | Heat index monitoring with automatic schedule adjustments |
| 313 | Snow/ice days for northern builders | Regional winter day calculations |
| 314 | Wind restrictions for crane operations | Configurable wind threshold alerts |
| 491 | AI per-tenant vs. cross-tenant learning | Anonymized cross-tenant benchmarking with per-tenant fine-tuning |
| 493 | AI accuracy transparency | Confidence scoring on all predictions |
| 494 | AI cold-start for new customers | Industry benchmark fallback for new tenants |
| 496 | AI data requirements threshold | Minimum project count before intelligence activates |
| 500 | AI schedule generation from estimate | Auto-generate schedule from estimate + historical durations |
| 501 | AI suggestions vs. automation (configurable) | Builder-configurable autonomy level |

---

## Detailed Requirements

### 25.1 Historical Duration Learning

The system analyzes completed tasks across all finished projects for a builder to establish expected durations by task type, project type, square footage range, and complexity factors.

- **Data Collection:** Capture planned vs. actual duration for every completed task, tagged with project metadata (type, size, location, season, crew).
- **Duration Model:** Build per-builder statistical models (mean, median, P10/P50/P90) for each task type.
- **Confidence Scoring:** Each prediction includes a confidence level based on sample size and variance. Display "Based on N completed projects" alongside predictions.
- **Cold Start:** New builders get industry-average durations by region until they accumulate 5+ completed projects per task type.
- **Continuous Learning:** Models retrain nightly as new project data flows in. Builders can exclude outlier projects from training data.

### 25.2 Weather-Adjusted Scheduling

Integrate real-time and forecast weather data to proactively adjust schedules for weather-sensitive tasks.

- **Weather API:** Primary: OpenWeatherMap (or equivalent) for 7-day forecast + historical patterns. Fallback: NOAA data for long-range seasonal norms.
- **Trade Sensitivity Matrix:** Configurable per builder. Default mappings: concrete (rain, temp < 35F, temp > 95F), roofing (rain, wind > 25mph, ice), exterior paint (rain, humidity > 85%, temp < 50F), excavation (rain, frozen ground), crane ops (wind > configurable threshold).
- **Proactive Alerts:** 48-hour advance warning when forecast threatens scheduled weather-sensitive tasks. Suggest rescheduling or task swaps.
- **Seasonal Patterns:** Learn from historical regional weather to build long-range schedule probability models. "In Houston, expect 12 rain days in April — pad exterior work accordingly."
- **Weather Delay Documentation:** Auto-log weather events that impact schedule with temperature, precipitation, wind data for contract dispute support.

### 25.3 Resource Leveling Across Active Jobs

Optimize vendor and crew allocation across all active projects for a builder.

- **Vendor Availability Tracking:** Integrate with vendor-provided availability windows and committed schedules.
- **Conflict Detection:** Identify when the same vendor is scheduled on overlapping tasks across different projects. Flag and suggest resolution.
- **Leveling Algorithm:** Redistribute tasks across time to minimize resource conflicts while respecting critical path constraints. Configurable priority: by project priority, by contract deadline, by client importance.
- **Capacity Visualization:** Dashboard showing vendor utilization across all active projects. Identify over-committed and under-utilized vendors.
- **What-If Modeling:** "If I move the Smith project framing to next week, how does that affect my other 4 projects?"

### 25.4 Critical Path Analysis and Risk Prediction

Identify and monitor the critical path through each project, predicting delay risks before they materialize.

- **Auto-Critical-Path:** Calculate critical path from task dependencies and durations. Highlight critical tasks in all schedule views.
- **Risk Scoring:** Each task gets a risk score (0-100) based on: historical on-time rate for that task type, current vendor performance, weather forecast, pending prerequisites (permits, materials, inspections), resource conflicts.
- **Delay Propagation:** When a task slips, automatically calculate downstream impact on all dependent tasks and project completion date.
- **Early Warning System:** Configurable alerts when risk score exceeds threshold (default: 70). Notification to PM and superintendent.
- **Schedule Health Score:** Overall project schedule health metric (0-100) displayed on project dashboard. Weighted combination of critical path slack, risk scores, and baseline drift.

### 25.5 Seasonal Pattern Learning

Build regional and per-builder seasonal models that inform scheduling decisions.

- **Regional Climate Profiles:** Pre-loaded climate profiles by region (Southeast, Northeast, Mountain West, Pacific Northwest, etc.). Customizable per builder's operating area.
- **Productivity Curves:** Learn seasonal productivity patterns. "Framing crews are 15% slower in July in Texas due to heat restrictions."
- **Holiday/Shutdown Calendars:** Configurable per builder and per region. Include standard holidays, builder-specific shutdowns, and regional observances.
- **Seasonal Material Delays:** Learn patterns like "concrete delivery is 2 days slower in winter" from historical PO data.

### 25.6 Auto-Suggested Schedule from Project Type

Generate a draft schedule from project metadata and historical patterns.

- **Template Generation:** Given project type, square footage, and scope, generate a complete draft schedule with AI-estimated durations.
- **Builder-Specific Templates:** Use the builder's own historical data when available. Fall back to platform averages for new builders.
- **Adjustable Confidence:** Show duration ranges (optimistic/likely/pessimistic) and let the PM adjust.
- **Dependency Auto-Wiring:** Automatically set up task dependencies based on standard construction sequencing logic, adjustable per builder's workflow.

---

## Database Tables

### schedule_intelligence_models
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders (multi-tenant) |
| task_type | varchar(100) | Normalized task type identifier |
| project_type | varchar(50) | Project type this model applies to |
| region | varchar(50) | Geographic region |
| sample_count | integer | Number of data points in model |
| mean_duration_days | decimal(6,2) | Average duration |
| median_duration_days | decimal(6,2) | Median duration |
| p10_duration_days | decimal(6,2) | 10th percentile (optimistic) |
| p90_duration_days | decimal(6,2) | 90th percentile (pessimistic) |
| std_deviation | decimal(6,2) | Standard deviation |
| confidence_score | decimal(3,2) | 0.00-1.00 confidence |
| last_trained_at | timestamptz | Last model update |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last modification |

### schedule_weather_events
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders |
| project_id | uuid | FK to projects |
| event_date | date | Date of weather event |
| weather_type | varchar(50) | rain, snow, heat, wind, ice, etc. |
| severity | varchar(20) | low, moderate, severe |
| temperature_high | decimal(5,1) | High temp (F) |
| temperature_low | decimal(5,1) | Low temp (F) |
| precipitation_inches | decimal(4,2) | Precipitation amount |
| wind_speed_mph | decimal(5,1) | Max wind speed |
| tasks_impacted | jsonb | Array of impacted task IDs |
| delay_hours | decimal(5,1) | Actual delay caused |
| auto_logged | boolean | Whether system auto-created this |
| notes | text | Manual notes |
| created_at | timestamptz | Record creation |

### schedule_risk_scores
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders |
| project_id | uuid | FK to projects |
| task_id | uuid | FK to schedule tasks |
| risk_score | integer | 0-100 risk rating |
| risk_factors | jsonb | Breakdown of contributing factors |
| calculated_at | timestamptz | When score was computed |
| weather_component | integer | Weather risk portion (0-100) |
| resource_component | integer | Resource conflict portion (0-100) |
| dependency_component | integer | Dependency risk portion (0-100) |
| history_component | integer | Historical performance portion (0-100) |

### schedule_scenarios
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| builder_id | uuid | FK to builders |
| project_id | uuid | FK to projects |
| name | varchar(200) | Scenario name |
| description | text | Scenario description |
| base_schedule_snapshot | jsonb | Snapshot of original schedule |
| modified_tasks | jsonb | Array of task modifications |
| projected_completion | date | Predicted completion under scenario |
| projected_cost_impact | decimal(12,2) | Cost impact of scenario |
| created_by | uuid | FK to users |
| created_at | timestamptz | Record creation |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v2/projects/:id/schedule/intelligence | Get schedule health score and risk summary |
| GET | /api/v2/projects/:id/schedule/risks | Get all task risk scores for a project |
| GET | /api/v2/projects/:id/schedule/weather-forecast | Get weather impact forecast for next 7 days |
| GET | /api/v2/projects/:id/schedule/critical-path | Get critical path analysis |
| POST | /api/v2/projects/:id/schedule/scenarios | Create a what-if scenario |
| GET | /api/v2/projects/:id/schedule/scenarios | List all scenarios for a project |
| GET | /api/v2/projects/:id/schedule/scenarios/:sid | Get scenario detail with projected impact |
| POST | /api/v2/projects/:id/schedule/auto-generate | Auto-generate schedule from project metadata |
| GET | /api/v2/schedule/resource-leveling | Cross-project resource utilization view |
| POST | /api/v2/schedule/resource-leveling/optimize | Run resource leveling optimization |
| GET | /api/v2/schedule/intelligence/models | Get duration models for the builder |
| POST | /api/v2/schedule/intelligence/retrain | Trigger model retraining |
| GET | /api/v2/projects/:id/schedule/weather-events | Get weather delay log |
| POST | /api/v2/projects/:id/schedule/weather-events | Log a weather event manually |
| GET | /api/v2/projects/:id/schedule/lookahead | Get AI-generated two-week look-ahead |

---

## UI Components

- **Schedule Health Dashboard** — Project-level widget showing health score, risk distribution, critical path summary, and weather alerts.
- **Risk Heatmap** — Visual overlay on Gantt/calendar showing task risk scores by color intensity.
- **Weather Timeline** — 7-day forecast strip above schedule showing weather conditions with trade impact indicators.
- **Resource Leveling View** — Multi-project stacked bar chart showing vendor allocation and conflicts.
- **Scenario Comparison Panel** — Side-by-side comparison of schedule scenarios with delta highlighting.
- **Auto-Schedule Wizard** — Step-by-step wizard for generating a new schedule from project metadata, with AI confidence sliders.
- **Duration Confidence Popover** — On any task, hover to see P10/P50/P90 duration range with sample size and confidence.
- **Weather Delay Log** — Filterable log of all weather events with auto-populated and manual entries.

---

## Dependencies

- **Module 7: Scheduling** — Core schedule data (tasks, dependencies, assignments)
- **Module 8: Daily Logs** — Actual progress data for model training
- **Module 10: Contact/Vendor Management** — Vendor availability and assignment data
- **Module 3: Core Data Model** — Project metadata (type, size, location)
- **Weather API** — OpenWeatherMap or equivalent (requires API key per platform instance)
- **Background Job Runner** — Nightly model retraining, hourly weather data refresh

---

## Open Questions

1. What is the minimum number of completed projects before schedule intelligence activates per task type? (Proposed: 5)
2. Should cross-tenant anonymized data be opt-in or opt-out for model training?
3. How do we handle builders who manually override AI suggestions frequently — should the system adapt or flag?
4. What weather API provider offers the best balance of accuracy, coverage, and cost at scale?
5. Should resource leveling recommendations auto-apply with builder approval, or remain suggestion-only?
6. How do we handle schedule intelligence for renovation projects where task sequencing is less predictable?
7. What is the acceptable latency for real-time risk score recalculation when a task is updated?
