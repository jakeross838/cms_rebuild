# Platform Gap Analysis — EXPANDED
## SaaS Construction Management Platform for Custom Home Builders
### Built by Ross Built, Sold to the Industry

> **CRITICAL CONTEXT:** This is NOT just internal software for Ross Built. This is a SaaS product that Ross Built will use AND sell to other custom home builders nationwide. Every feature must be configurable, every workflow must be customizable, and every assumption must be a setting — not a hardcoded value. Ross Built is Customer #1 and the proving ground, but the architecture must support any custom home builder from a $2M/year one-man shop to a $200M/year multi-division operation.

---

# TABLE OF CONTENTS

## PLATFORM & BUSINESS MODEL (NEW)
1. SaaS Architecture & Multi-Tenancy
2. Onboarding & Customer Success
3. Pricing, Billing & Subscription Management
4. White-Labeling & Branding
5. Marketplace & Ecosystem
6. Data Isolation & Privacy
7. Platform Administration & Operations
8. Customer Support & Help System

## CORE CONSTRUCTION MODULES
9. User & Access Management
10. Lead & Preconstruction Pipeline
11. Estimating & Budgeting
12. Contracts & Legal
13. Scheduling & Calendar
14. Daily Logs & Field Operations
15. Document Management
16. Invoice & Payment Processing
17. Change Order Management
18. Selections & Allowances
19. Vendor & Subcontractor Management
20. Purchasing & Procurement
21. RFI Management
22. Punch Lists & Checklists
23. Client Portal & Communication
24. Financial Management & Accounting
25. Reporting & Dashboards

## SPECIALIZED MODULES
26. Safety & Compliance
27. Warranty & Home Care
28. Permitting & Inspections
29. Photos & Media
30. Notifications & Alerts
31. Mobile & Field Experience

## INTELLIGENCE & DATA
32. AI & Intelligence Engine
33. Integrations & Data
34. Search, Navigation & UX
35. Data Integrity & Error Handling

## BUSINESS OPERATIONS
36. Regulatory, Tax & Insurance
37. Human Resources & Workforce
38. Equipment & Asset Management
39. Marketing & Reputation
40. Business Development & Owner Relations

## SCALING & RESILIENCE
41. Multi-Entity & Company Scaling
42. Regional & Geographic Variability
43. Disaster Recovery & Business Continuity

## EDGE CASES & SCENARIOS
44. Unusual Business Scenarios
45. Per-Page Feature Requirements
46. Legal & Dispute Scenarios
47. Financial Edge Cases
48. Technology Edge Cases

---

# 1. SaaS ARCHITECTURE & MULTI-TENANCY

> Every question here represents a decision that, if made wrong, will require a complete rebuild later. These MUST be answered before writing code.

### Core Multi-Tenancy
1. Is data stored in shared tables with tenant_id filtering, or separate databases per customer? (Affects performance, cost, data isolation, and backup/restore granularity)
2. Can a single user belong to multiple tenant accounts? (Builder who owns two companies, or a consultant who works with multiple builders)
3. How do you handle tenant-level feature flags? (Builder A has the estimating module, Builder B doesn't — they're on different plans)
4. What happens when a tenant's subscription lapses? Read-only mode? Full lockout? Grace period? Data retention?
5. How do you handle tenant data deletion requests? (GDPR, CCPA — "delete all my data")
6. Can tenants have sub-tenants? (A builder with multiple divisions that need separate data but shared reporting)
7. How do you handle cross-tenant data? (Anonymous benchmarking — "your electrical costs are 12% above the platform average for your region")
8. What's the tenant provisioning workflow? (New customer signs up → what happens technically? Database setup, default data, sample project?)
9. How do you handle tenant-specific customizations that don't belong in the core product? (Custom fields, custom workflows, custom reports)
10. What's the maximum number of concurrent users per tenant? Per the platform? Load testing targets?
11. How do you handle tenant-level backup and restore? (One customer needs a restore without affecting others)
12. Can tenants export ALL their data at any time? (Critical for customer trust and often legally required)
13. How do you handle tenant data migration FROM another platform? (Buildertrend, CoConstruct, Procore data import)
14. What's the data residency requirement? (Some customers may require data stored in specific geographic regions)
15. How do you handle tenant-level rate limiting? (One heavy user can't degrade performance for everyone)

### Configuration & Customization Engine
16. Every workflow must be configurable — who approves what, at what thresholds, in what order. How is this configuration UI designed?
17. Cost code structures vary wildly between builders. How do you handle custom cost code hierarchies? (CSI, custom, hybrid)
18. Job phases and naming conventions differ. How do you let each builder define their own phase structure?
19. Terminology varies — some say "trade partner," some say "subcontractor," some say "vendor." Can terminology be customized per tenant?
20. Document templates (proposals, contracts, change orders, draw requests) must be fully customizable per tenant. How?
21. Numbering conventions differ — some want CO-001, some want 2024-AMI-CO-001. Configurable numbering schemes?
22. Approval workflows differ — some builders need 3-level approval, others just need the owner to click approve. Configurable?
23. What custom fields can tenants create? (On projects, vendors, clients, line items — any entity?)
24. Can tenants create custom dropdown values? (Project types, client sources, defect categories)
25. Can tenants create custom report templates?
26. Can tenants configure their own dashboard layouts?
27. How do you handle configuration changes mid-project? (Builder restructures cost codes — do existing projects get remapped?)
28. Can tenants set default values per field? (Default markup = 18%, default retainage = 10%)
29. Can tenants configure required fields? (Some want job number required, others don't)
30. Can tenants create conditional logic? ("If project type = renovation, require asbestos survey field")
31. How do you handle configuration versioning? (Roll back a workflow change that broke things)
32. Can tenants clone another tenant's configuration as a starting template? (Industry-standard templates)
33. What's the "out of the box" configuration for a new customer? Does it work for day 1, or require hours of setup?
34. How many configuration options are TOO many? (Complexity budget — if setup takes 40 hours, you'll lose customers)
35. Can configuration be done by the builder, or does it require your team? (Self-service vs. managed setup)

### Regional Variability Built Into Architecture
36. Tax rules vary by state, county, and municipality. The system must support configurable tax rules per jurisdiction.
37. Lien law varies by state — notice requirements, deadlines, waiver forms. Must be configurable.
38. Building codes vary by jurisdiction. Checklists, inspection types, and compliance requirements must be location-aware.
39. Permit types and processes vary by municipality. Must be configurable per jurisdiction.
40. Insurance requirements vary by state. Minimum coverage amounts, required endorsements — configurable.
41. Contract law varies by state. Template contracts must have state-specific language options.
42. Weather patterns vary by region. Scheduling intelligence must account for regional climate.
43. Material pricing varies by region. Intelligence engine must be region-aware.
44. Labor rates vary by region. Cost benchmarks must be region-adjusted.
45. Holidays vary — some regions observe local holidays that affect scheduling.
46. Work hour restrictions vary by municipality. (No construction before 7am in some areas, 8am in others)
47. Environmental regulations vary. (Coastal, wetlands, endangered species — location-specific)
48. Business licensing requirements vary by jurisdiction.
49. Sales tax rules for construction vary by state — some tax materials, some tax labor, some neither.
50. Mechanic's lien procedures and statutory forms vary by state.

---

# 2. ONBOARDING & CUSTOMER SUCCESS

### First-Time Experience
51. What does a new customer see when they first log in? Empty dashboard is overwhelming. Guided setup wizard?
52. How long should it take from "I signed up" to "I'm getting value"? Target: under 1 hour for basic functionality.
53. Can the system generate a sample/demo project so the customer can explore features before entering real data?
54. What's the minimum data entry required before the system is useful? (Company info, first project, first vendor?)
55. How do you handle customers with ZERO historical data vs. customers with 10 years of data to import?
56. What's the onboarding flow for each user ROLE? (Owner setup is different from PM setup is different from admin setup)
57. Is there an interactive tutorial or walkthrough for each module?
58. How do you handle the "I don't have time for setup" customer? Pre-built templates? Concierge setup service?
59. What happens when a customer starts the onboarding wizard but doesn't finish? Resume later? Reminders?
60. How do you handle customers who want to run the old system AND the new system in parallel during transition?

### Data Migration
61. Can you import from Buildertrend? What data maps and what doesn't?
62. Can you import from CoConstruct? BuilderTrend? Procore? JobTread? UDA? Newstar?
63. Can you import from QuickBooks Desktop AND QuickBooks Online?
64. Can you import from Excel/CSV — the "I track everything in spreadsheets" customer?
65. Can you import from email? (Parse vendor quotes from email history)
66. What about importing from Google Sheets, Airtable, or Monday.com?
67. How do you handle data mapping when the source system uses different cost codes, categories, or terminology?
68. How do you handle data quality issues during import? (Duplicates, missing fields, inconsistent formatting)
69. How long does a typical data migration take? Hours? Days? Weeks?
70. Is data migration self-service or does it require your team?
71. Can customers do partial migrations? (Import vendors and budgets but not daily logs)
72. How do you handle imported data that doesn't pass validation? (Log errors, skip, or reject entire import?)
73. Can you import photos and documents from another system? (With metadata intact?)
74. How do you verify migration accuracy? (Reconciliation reports showing source vs. destination counts and totals)
75. What about migrating active projects vs. completed projects? (Different priority and data requirements)

### Customer Training
76. Is training self-service (video library, knowledge base) or instructor-led?
77. Do different roles need different training paths? (Owner vs. PM vs. Field Super vs. Admin)
78. How do you handle ongoing training for new features released after initial onboarding?
79. Is there a certification program? ("Certified Platform Administrator")
80. What about training for the builder's vendors? (They need to use the vendor portal)
81. What about training for the builder's clients? (They need to use the client portal)
82. How do you handle training for non-English speakers? (Spanish-speaking field staff)
83. Is there a sandbox/test environment where customers can practice without affecting real data?
84. How do you track training completion and identify users who need help?
85. What about contextual in-app help? (Click "?" next to any field for an explanation)

### Customer Success & Retention
86. How do you measure customer health? (Login frequency, feature adoption, support tickets, usage trends)
87. What triggers a customer success intervention? (Usage drops off, multiple support tickets, approaching renewal)
88. How do you collect and act on customer feedback? (Feature requests, bugs, usability issues)
89. What's the customer feedback loop for product development? (Voting on features, beta programs, advisory board)
90. How do you handle customers who are "at risk" of churning?
91. What's the process for a customer who wants to cancel? Data export, transition period, exit survey?
92. How do you handle customers outgrowing the platform? (They need features you don't have yet)
93. What about customer community — forum, user groups, annual conference?
94. How do you share best practices between customers? (Without revealing proprietary data)
95. What about case studies — can successful customers share their results?

---

# 3. PRICING, BILLING & SUBSCRIPTION MANAGEMENT

### Pricing Model Gaps
96. What's the pricing structure? Per user? Per project? Per revenue? Flat fee? Tiered?
97. How do you handle the one-man builder who can afford $99/month vs. the $100M builder who can afford $5,000/month?
98. Are modules individually priced? (Base + estimating + selections + home care = build your own plan?)
99. What about per-project pricing for smaller builders? ("I only do 2 houses a year, I don't want a monthly subscription")
100. How do you handle pricing for seasonal businesses? (Builder does 8 months of construction, 4 months off — do they pay year-round?)
101. Is there a free tier or freemium model? What's included?
102. What about annual vs. monthly billing? Discount for annual?
103. How do you handle pricing changes for existing customers? Grandfathered? Transition period?
104. What about usage-based pricing? (Per invoice processed, per AI query, per document stored?)
105. How do you handle pricing for vendor/client portal users? (They're not the paying customer but they use the system)
106. What about pricing for integrations? (QuickBooks sync is included, but ERP integration is premium?)
107. How do you handle enterprise pricing for large builders? Custom contracts, volume discounts?
108. What about a partner/referral program? Discount for referring other builders?
109. How do you handle pricing for add-on services? (Data migration, custom training, dedicated support)
110. What about pricing transparency — is pricing public or "contact us"?

### Billing & Subscription Gaps
111. How do you handle payment failures? (Credit card declined, ACH rejected)
112. What about involuntary churn — subscription cancels due to payment failure, but customer wants to stay?
113. How do you handle subscription upgrades/downgrades mid-billing cycle? Proration?
114. What about trial periods — free trial length, credit card required, conversion workflow?
115. How do you handle billing disputes? ("I was charged for 10 users but I only have 5")
116. What about invoicing for enterprise customers? (They want an invoice, not a credit card charge)
117. How do you handle tax on SaaS subscriptions? (Varies by state — some states tax SaaS, some don't)
118. What about international billing if you expand beyond the US? Currency, tax, regulations?
119. How do you handle refunds? Full, partial, prorated?
120. What about tracking MRR (Monthly Recurring Revenue), churn rate, LTV, CAC for your own business?

---

# 4. WHITE-LABELING & BRANDING

### Customization Per Tenant
121. Can each builder customize the platform with their own logo, colors, and branding?
122. Can the client portal be fully branded to the builder? (Client sees "Smith Builders Portal," not your SaaS brand)
123. Can the vendor portal be branded per builder?
124. Can email notifications be sent from the builder's email domain? (Or at least appear to come from them)
125. Can generated documents (reports, proposals, draw requests) use the builder's branding?
126. Can the builder set a custom subdomain? (app.smithbuilders.com)
127. Can the builder customize the login page?
128. What about mobile app branding? (Can each builder have their own app icon and name? Probably not — but the in-app experience should be branded)
129. Can the builder add custom pages or content? (Their company policies, their standard specifications, their welcome message)
130. How do you handle branding for the builder's client-facing proposals and contracts generated by the system?
131. What level of CSS/theme customization is available? (Just logo + colors? Or full layout control?)
132. Can builders customize automated messages? (Notification text, email templates, portal welcome messages)
133. How do you handle builders who want NO mention of your SaaS brand anywhere? (Full white-label premium tier?)

---

# 5. MARKETPLACE & ECOSYSTEM

### Integration Marketplace
134. Can third-party developers build integrations? (Open API)
135. Is there an app marketplace where builders can discover and install integrations?
136. Can vendors (material suppliers) build integrations to push pricing data into the platform?
137. What about accounting software integrations beyond QuickBooks? (Sage, Xero, FreshBooks, Viewpoint)
138. Can design tool companies integrate? (Chief Architect, AutoCAD, Revit, SketchUp — push plans into the platform)
139. What about material supplier catalogs? (Integrated product databases with pricing, specs, availability)
140. Can building product manufacturers integrate? (TruStile pushes door specs and pricing directly)
141. What about integration with estimation databases? (RSMeans, Craftsman, HomeAdvisor cost data)
142. Can third-party inspection companies integrate? (Push inspection results directly into the platform)
143. What about lender integrations? (Push draw request packages directly to the bank's portal)

### Template & Content Marketplace
144. Can builders share or sell their estimate templates, checklists, and workflows to other platform customers?
145. What about industry-standard templates maintained by your team? (AIA contract templates, standard checklists by phase)
146. Can consultants create and sell templates? (A construction consultant could create a "luxury home checklist pack")
147. What about regional template packs? (Florida-specific templates, Texas-specific templates)
148. Can builders hire your team to create custom templates? (Professional services revenue)

### Vendor Network
149. Can the platform facilitate connections between builders and vendors? ("Find a qualified electrician in Sarasota")
150. What about anonymous vendor benchmarking? ("How does your plumber compare to the platform average for your region?")
151. Can vendors pay for premium listing or visibility? (Careful — this could compromise trust)
152. What about vendor reviews/ratings visible across the platform? (Yelp for construction subs?)
153. Can material suppliers offer platform-exclusive pricing or deals?
154. How do you handle vendor claims on the platform? (Vendor disputes a builder's rating)

---

# 6. DATA ISOLATION & PRIVACY

### Data Security
155. How do you ensure Builder A cannot see Builder B's data? (Tenant isolation testing)
156. What about shared vendors? Builder A and Builder B both use the same plumber — each sees only their own pricing and performance data.
157. How do you handle data that could be competitively sensitive? (Builder A's pricing, markup percentages, vendor relationships)
158. What about employees who move between builders? (PM leaves Builder A, joins Builder B — no data carries over)
159. How do you handle vendors who work for multiple builders on the platform? (One vendor portal login, sees each builder's scope separately)
160. What about data encryption at rest and in transit?
161. How do you handle penetration testing and security audits?
162. What about SOC 2 compliance? (Enterprise customers will require this)
163. How do you handle data breach notification? (Legal requirements vary by state)
164. What about role-based data access within the platform's own team? (Your employees shouldn't browse customer data without reason)
165. How do you handle customer data requests? ("Show me everything you store about my company")
166. What about data anonymization for analytics? (Aggregate data across tenants without revealing individual builder data)
167. How do you handle subpoena or legal requests for customer data?
168. What about data residency requirements? (Government projects may require US-only data storage)
169. How do you handle data retention after a customer cancels? How long is it kept? Can it be recovered?

---

# 7. PLATFORM ADMINISTRATION & OPERATIONS

### Your Own Operations as a SaaS Company
170. How do you monitor platform health? (Uptime, response times, error rates, database performance)
171. What about deployment strategy? (CI/CD, staging environments, feature flags, canary releases, rollback procedures)
172. How do you handle platform updates that affect customer workflows? (Release notes, change notifications, backwards compatibility)
173. What about API versioning? (Don't break existing integrations when you release new versions)
174. How do you handle database migrations on a multi-tenant platform without downtime?
175. What's your incident response process? (Platform goes down at 2am — who gets paged? What's the communication plan?)
176. How do you handle customer-reported bugs vs. feature requests? (Triage, prioritization, communication)
177. What about usage analytics for your own product decisions? (Which features are used most? Where do users drop off?)
178. How do you handle A/B testing of new features?
179. What's the release cadence? (Weekly? Bi-weekly? Monthly? Does it matter by customer tier?)
180. How do you handle beta features? (Opt-in for early adopters, mandatory later?)
181. What about status page for system health? (customers.statuspage.io)
182. How do you handle scheduled maintenance windows? (Communication, timing, minimizing impact)
183. What about auto-scaling during peak usage? (Monday morning, end-of-month invoicing)
184. How do you handle database performance as data grows? (Year 1: 100 projects total. Year 5: 50,000 projects)
185. What about data archiving strategy? (Move old project data to cheaper storage while keeping it accessible)

### Platform Analytics
186. How do you track feature adoption across customers? (Which features are sticky? Which are ignored?)
187. What about usage patterns by role? (PMs use scheduling heavily, admins use invoicing heavily)
188. How do you identify "power users" and learn from their behavior?
189. What about tracking the "aha moment" — what action correlates with long-term retention?
190. How do you measure platform performance per tenant? (Is one customer's usage affecting others?)
191. What about revenue analytics? (MRR, ARR, churn, expansion revenue, LTV:CAC ratio)
192. How do you track customer acquisition cost by channel?
193. What about cohort analysis? (Are customers who signed up in Q1 retaining better than Q3?)
194. How do you track NPS (Net Promoter Score) and customer satisfaction over time?
195. What about competitive intelligence? (Why do customers choose you vs. alternatives? Why do they leave?)

---

# 8. CUSTOMER SUPPORT & HELP SYSTEM

### Support Infrastructure
196. What support channels do you offer? (Chat, email, phone, in-app, knowledge base)
197. How do you handle support tiers? (Self-service → community → email → phone → dedicated CSM)
198. What's the SLA for different issue severities? (P1 system down = 15 min response? P3 feature question = 24 hours?)
199. How do you handle support for the builder's CLIENTS using the client portal? (Do they contact the builder or you?)
200. How do you handle support for VENDORS using the vendor portal? (Same question)
201. What about in-app contextual help? (Click "?" for help on any screen)
202. How do you handle help content localization? (Spanish support for field users)
203. What about video tutorials for each major workflow?
204. How do you handle "how do I..." questions that are really "we need a feature you don't have"?
205. What about a community forum where builders help each other?
206. How do you handle customer feature requests? (Collect, prioritize, communicate roadmap)
207. What about a public product roadmap? (Transparency vs. competitive risk)
208. How do you handle urgent support during nights/weekends? (Builder has a draw request due Monday morning and the system won't generate it)
209. What about support escalation paths? (Tier 1 can't solve it → Tier 2 → Engineering)
210. How do you handle customer training requests that go beyond standard support? (Billable professional services)

---

# 9. USER & ACCESS MANAGEMENT

### Role & Permission Gaps — Multi-Tenant Context
211. Can builders define their own custom roles beyond the defaults? (Not just PM, Super, Admin — but "Assistant PM," "Selection Coordinator," "Warranty Manager")
212. How do you handle permissions that differ by project? (User X is PM on Project A but read-only on Project B)
213. What about permission inheritance? (If you have "Project Manager" permissions, do you automatically get all "Field Super" permissions?)
214. How do you handle the builder who says "everyone should see everything"? (No restrictions — but they should still be available if they change their mind)
215. What about time-limited access? (Consultant gets access for 30 days, then auto-deactivated)
216. How do you handle shared login devices on job sites? (Multiple supers using the same iPad — pin-based switching?)
217. Can the platform owner (builder) see an audit log of who accessed what and when?
218. How do you handle the scenario where a PM is fired and you need to immediately revoke access while preserving their data?
219. What about guest access for one-time document viewing? (Architect needs to see the RFI log but doesn't need a full account)
220. Can you configure IP restrictions by tenant? (Only allow login from office network?)
221. How do you handle SSO integration for larger builders with corporate IT? (Azure AD, Google Workspace, Okta)
222. What about MFA enforcement at the tenant level? (Builder requires all users to have MFA)
223. How do you handle the "forgot password" flow in the field? (Muddy hands, no email access, need in NOW)
224. Can permissions be set at the field level? (User can see the budget total but not individual line items)
225. What about API key management for integration users? (A system user that syncs with QuickBooks)

### External User Access (Vendors, Clients, Design Team)
226. Can a vendor have ONE login that works across multiple builders on the platform? (Plumber works for Builder A and Builder B — one account, two views)
227. How do you handle vendor employees who need different access levels? (Vendor's office manager sees invoices, vendor's foreman sees schedule only)
228. Can the builder control exactly what each vendor sees? (Some builders want full transparency, others show nothing)
229. What about architect/engineer portal access? (Plans, RFIs, submittals — but not financial data)
230. How do you handle interior designer access? (Selections module, maybe budget visibility for their scope)
231. What about real estate agent access during final stages? (Photos, completion timeline, features list)
232. How do you handle client access during warranty vs. during construction? (Different views, different capabilities)
233. Can clients invite their own representatives? (Client gives their attorney access to view documents)
234. What about lender portal access? (Read-only view of draw request status, lien waivers, progress photos)
235. How do you handle inspector access? (Temporary access to inspection-related documents)

---

# 10. LEAD & PRECONSTRUCTION PIPELINE

### Lead Management — Multi-Builder Context
236. Can the platform provide lead management, or should it integrate with CRMs? (HubSpot, Salesforce, etc.)
237. How do builders track where leads come from? (Website, referral, Houzz, social media, Parade of Homes)
238. What about lead routing for multi-PM builders? (Round-robin, geographic, project type, PM workload)
239. How do you handle lead nurturing? (Drip email campaigns, follow-up reminders, status tracking)
240. What about lead qualification scoring? (Budget realism, lot ownership, timeline, financing — configurable scoring)
241. How do you handle leads that don't convert? Archive and analytics — why did they not sign?
242. What about the builder who gets 50 leads/month vs. the builder who gets 2? Scalable UI?
243. How do you handle lead duplication? (Same person inquires through website AND Houzz)
244. What about tracking lead source ROI? ("We spent $5K on Houzz ads and got 3 leads that converted to $4.5M in contracts")
245. How do you handle the transition from "lead" to "prospect" to "preconstruction" to "active project"? Configurable stages?
246. What about proposals/estimates sent to leads who don't convert — is that pricing data still captured for intelligence?

### Preconstruction Gaps — Universal Builder Needs
247. Not all builders do design-build. How do you handle plan-bid-build workflow? (Client brings completed plans)
248. What about design-build workflow? (Builder manages the design phase too — tracking architect/engineer contracts, design milestones)
249. How do you handle multi-bid scenarios? (Client is getting bids from 3 builders — how do you track and compete?)
250. What about pre-construction agreements? (Paid planning/design phase before construction contract — separate billing)
251. How do you handle lot evaluation? (Soil conditions, flood zone, setbacks, utility availability — checklist of due diligence items)
252. What about feasibility studies? ("Can we build what you want on this lot for your budget?" — preliminary analysis before estimating)
253. How do you handle scope development iterations? (V1 concept budget → V2 schematic design estimate → V3 construction document estimate)
254. What about tracking design team communication during preconstruction? (Meetings, decisions, direction changes)
255. How do you handle preconstruction that lasts 6-18 months? (Luxury custom homes have long preconstruction phases)
256. What about preconstruction billing? (Monthly design management fee, hourly consulting, flat fee for estimate)

---

# 11. ESTIMATING & BUDGETING

### Estimate Structure — Multi-Builder Flexibility
257. Different builders use different cost code systems. How do you support CSI MasterFormat, custom codes, and hybrid systems?
258. Can builders define their own estimate hierarchy? (Some: Division → Cost Code → Line Item. Others: Phase → Trade → Item)
259. What about estimate templates by project type that each builder creates for themselves?
260. How do you handle builders who estimate by assembly vs. builders who estimate line by line?
261. What about builders who use unit pricing exclusively? ($/SF for everything)
262. How do you handle builders who use different markup structures? (Flat % on all, tiered by category, per-line markup, built into unit prices)
263. Can estimate formats be configured to match what the builder's clients expect? (Some clients want 10 line items, some want 200)
264. What about estimate approval workflows that vary by builder? (Some need owner sign-off, some let PMs send estimates)
265. How do you handle estimate versioning? (V1, V2, V3 — with comparison showing what changed between versions)
266. What about estimates that need to be presented at different levels of detail? (Client sees summary, builder sees detail)
267. How do you handle "not to exceed" estimates vs. "guaranteed maximum price" vs. "cost plus with estimate"?
268. What about handling estimates for work you haven't received bids on yet? (Placeholder/allowance amounts)
269. How do you handle scope exclusions in estimates? (Tracking what's NOT included is as important as what IS included)
270. What about alternate/option pricing within estimates? (If client chooses X = $50K, if client chooses Y = $75K)
271. How do you handle estimate expiration? (This estimate is valid for 90 days — then what?)

### Budget Tracking — Universal Needs
272. How do you handle the budget when the contract type changes mid-project? (Started cost-plus, converted to GMP)
273. What about tracking committed costs (signed contracts + POs) vs. budgeted costs vs. actual costs?
274. How do you handle cost-to-complete projections? (Based on current spend rate, projected final cost is $X)
275. What about earned value management? (Are you getting value proportional to what you're spending?)
276. How do you handle budget alerts that are configurable per builder? (Some want alerts at 80% of budget line, others at 95%)
277. What about budget templates for different project types? (3,000 SF ranch vs. 5,000 SF two-story — different budget distributions)
278. How do you handle the builder who doesn't budget at all and just tracks actuals? (Minimal system, not full budgeting)
279. What about budget contingency management? (Contingency drawdown tracking, requiring documentation when contingency is used)
280. How do you handle budgets in different formats for different audiences? (Owner sees 10 categories, PM sees 200 lines, bank sees AIA format)

---

# 12. CONTRACTS & LEGAL

### Contract Configuration for Different Builders
281. Different builders use different contract forms. Can they upload and manage their own templates?
282. What about AIA contracts vs. custom contracts vs. state-specific contracts?
283. How do you handle contract clause libraries? (Builders maintain a library of standard clauses they mix and match)
284. What about contract compliance tracking that varies by contract type? (Cost-plus audit rights, GMP savings split, fixed-price scope limits)
285. How do you handle retainage that varies by builder, by trade, and by contract? (10% standard, 5% for preferred vendors, 0% for small contracts)
286. What about tracking subcontract status? (Sent, received, reviewed, countersigned, executed, insurance verified)
287. How do you handle verbal change directives that need to be formalized? ("Builder told sub to proceed — now needs a signed CO")
288. What about tracking warranty obligations per contract? (Different warranty terms for different aspects — structural, systems, finishes)
289. How do you handle contract closeout checklist that varies by builder? (Final lien waiver, warranty letter, as-built docs, O&M manuals)
290. What about tracking client deposits and how they're applied? (Some jurisdictions have rules about construction deposits)

---

# 13. SCHEDULING & CALENDAR

### Schedule Configuration for Different Builders
291. Different builders use different scheduling methods. Support Gantt, calendar, Kanban, list views?
292. What about schedule templates that builders create and reuse? (New home starts with a template, adjusted per job)
293. How do you handle builders who schedule by phase vs. builders who schedule by trade vs. builders who schedule by day?
294. What about scheduling for builders with 1 active job vs. 20 active jobs? (Interface must scale)
295. Can builders configure their standard work week? (M-F, M-Sa, varies by trade)
296. How do you handle scheduling across multiple jobs when vendors are shared? (Resource leveling across a portfolio)
297. What about schedule publishing? (When the schedule is updated, who gets notified and how?)
298. How do you handle schedule baselines? (Original plan vs. current plan — tracking drift)
299. What about scheduling contingency/buffer? (Not all builders use float — but it's a best practice)
300. How do you handle scheduling for phased projects? (Main house Phase 1, pool Phase 2, guest house Phase 3)
301. What about schedule integration with vendor calendars? (Sub says "I'm available starting March 15")
302. How do you handle schedule "what-if" scenarios? (What if we start two weeks late? What if we add a pool?)
303. What about schedule reporting that's suitable for clients? (Simplified milestone view, not 500-task Gantt)
304. How do you handle schedule recovery after a delay? (Compression, fast-tracking, re-sequencing options)
305. What about two-week look-ahead scheduling? (Common in construction — detailed plan for next 2 weeks)

### Weather & External Factors
306. Weather API integration — which service? How accurate? How far out? Regional granularity?
307. How do you handle weather impact that varies by trade? (Concrete can't pour in rain, electrician works inside — same weather, different impact)
308. What about seasonal scheduling intelligence? (Don't schedule exterior paint in July in Houston, or outdoor concrete in January in Michigan)
309. How do you handle weather delay documentation? (Important for contract time extensions)
310. What about hurricane/severe weather preparation checklists triggered by weather forecasts?
311. How do you handle tidal data for coastal builders? (Not applicable for inland builders — feature must be optional)
312. What about extreme heat scheduling? (OSHA guidelines, regional practices — afternoon work restrictions)
313. How do you handle snow/ice days for northern builders? (Not applicable in Florida, critical in Colorado)
314. What about wind restrictions for crane operations? (Threshold varies, must be configurable)

---

# 14. DAILY LOGS & FIELD OPERATIONS

### Daily Log Configuration
315. What fields are required in a daily log? Must be configurable per builder.
316. Can builders add custom fields to daily logs? (Some track safety observations, some don't)
317. What about daily log templates that differ by project phase? (Foundation phase log vs. finishes phase log)
318. How do you handle daily logs for builders who run single PM per job vs. multiple people logging per job?
319. Can daily log templates include automatic fields? (Weather auto-populated, scheduled tasks auto-listed)
320. What about daily log submission reminders? (Configurable time — some want reminders at 4pm, others at 6pm)
321. How do you handle daily log review workflows? (PM submits, Director reviews — or no review required)
322. What about voice-to-text daily log entry? (Super drives home and dictates the log)
323. How do you handle daily log photo requirements? (Some builders require minimum X photos per log)
324. What about daily log entries that trigger workflows? ("Delay reported" → auto-update schedule impact analysis)
325. How do you handle daily logs as legal documents? (Immutable after submission? Or editable with audit trail?)

---

# 15. DOCUMENT MANAGEMENT

### Document Management for SaaS
326. What's the storage allocation per tenant? (And how is overage handled?)
327. How do you handle document templates that are platform-provided vs. builder-created?
328. What about document sharing between tenants? (Builder shares a spec with a vendor who's on the platform)
329. How do you handle document search across all document types? (Full-text search of PDFs, images via OCR)
330. What about document tagging/categorization that's builder-configurable?
331. How do you handle document retention policies? (Configurable per builder — some keep 7 years, some keep forever)
332. What about document redaction? (Redact pricing from plans before sharing with a sub)
333. How do you handle document version comparison? (Diff between plan revision A and B — highlight changes)
334. What about document approval workflows? (Submittals — vendor submits product data → builder reviews → architect approves)
335. How do you handle controlled document distribution? (New plan revision issued → auto-send to all relevant parties, confirm receipt)
336. What about document expiration tracking? (Insurance certificates, licenses — auto-alert before expiration)
337. How do you handle documents that require wet signatures? (Some jurisdictions, some document types)
338. What about integrating with DocuSign, HelloSign, or other e-signature platforms?
339. How do you handle documents received via email? (Forward-to-system email address that auto-files?)
340. What about document folder structure templates? (Pre-built folder structure for each new project — configurable)

---

# 16. INVOICE & PAYMENT PROCESSING

### Invoice Processing — Multi-Builder Context
341. Invoice approval workflows must be fully configurable. (1-step, 2-step, 3-step — threshold-based routing)
342. What about invoice processing for different contract types? (Lump sum contract: % complete billing. T&M contract: verify hours and rates. Unit price: verify quantities)
343. How do you handle invoice coding when different builders use different cost code structures?
344. What about invoice AI that learns per-tenant patterns? (This vendor always codes to these cost codes for THIS builder)
345. How do you handle builders who want to match every invoice to a PO vs. builders who don't use POs?
346. What about progress billing vs. final billing workflows? (Different approval criteria)
347. How do you handle retainage calculation that varies by contract, by vendor, by project? (Configurable rules)
348. What about conditional payment rules? (No payment without current insurance + signed lien waiver — configurable per builder)
349. How do you handle invoice disputes? (Builder disputes an amount — tracking, communication, resolution)
350. What about batch payment recommendations? ("These 15 invoices are approved and due this week — generate payment batch")

### Lien Waiver Management — State-Specific
351. Lien waiver forms vary by state. The system must have state-specific statutory forms.
352. What about states with no statutory lien waiver forms? (Builder-specific forms)
353. How do you handle conditional vs. unconditional waiver tracking by state? (Florida, California, Texas all differ)
354. What about sub-tier lien waiver tracking? (Your sub's supplier needs to provide a waiver too)
355. How do you handle Notice to Owner / Preliminary Notice requirements by state?
356. What about mechanic's lien filing deadlines by state? (Alert system for approaching deadlines)
357. How do you handle lien release/satisfaction documentation?
358. What about electronic vs. wet signature requirements for lien waivers? (Varies by jurisdiction and context)

---

# 17. CHANGE ORDER MANAGEMENT

### Change Order Workflows — Configurable
359. Change order approval chains must be configurable. (PM → Director → Owner at certain thresholds)
360. What about change order numbering formats? (Configurable per builder — CO-001, 2024-AMI-CO-001, etc.)
361. How do you handle change order templates? (Different format for client-facing vs. internal tracking)
362. What about change order markup/fee calculation? (Some charge flat % on COs, some have different markup for overhead vs. profit)
363. How do you handle "allowance change orders"? (Selection exceeds allowance — auto-generated CO? Or manual?)
364. What about tracking change order causes? (Configurable categories: client request, design error, unforeseen condition, code change, etc.)
365. How do you handle change order impact on contract value, schedule, and budget simultaneously?
366. What about change order negotiation tracking? (Proposed, countered, accepted, rejected — communication log)
367. How do you handle change orders that require design changes? (RFI → design revision → change order workflow)
368. What about change order reporting? (Total COs by cause, by trade, by project — for patterns)

---

# 18. SELECTIONS & ALLOWANCES

### Selections — Multi-Builder Configuration
369. Different builders handle selections differently. Some have allowances, some are fixed-price, some are cost-plus. All must be supported.
370. What about selection category configuration? (Builder defines their own categories — not hardcoded)
371. How do you handle selection presentations? (Some builders do "selection meetings," others have clients browse online)
372. What about selection integration with vendor catalogs? (Is this realistic for V1, or a future feature?)
373. How do you handle selections for items with complex configurations? (Cabinetry with 50 decision points — wood species, door style, finish, hardware, accessories)
374. What about selection deadlines that tie to the construction schedule? (Configurable lead time buffers per category)
375. How do you handle selection change requests after ordering? (Cancellation fees, restocking fees, delay impact)
376. What about selection rooms/boards? (Visual grouping of selections by room — like Materio)
377. How do you handle selections for spec homes? (Builder makes selections, no client involvement)
378. What about selections for model homes? (Specific selections for the model, plus upgrade options for buyers)
379. How do you handle multi-home selections? (Developer building 10 homes — some selections are standard, some are per-buyer)
380. What about selection history for repeat clients? (Built their first home with you — preferences carry forward)

---

# 19. VENDOR & SUBCONTRACTOR MANAGEMENT

### Vendor Management — Platform-Wide
381. Vendors may be on the platform working for multiple builders. How is their profile managed? (Builder-specific data vs. vendor's own profile)
382. What about vendor self-registration? (Vendor signs up, builder approves — vs. builder creates vendor account)
383. How do you handle vendor compliance tracking? (Insurance, license, safety — configurable requirements per builder)
384. What about vendor prequalification workflows? (Configurable questionnaire, document requirements, approval process)
385. How do you handle vendor bid management? (Bid invitation, bid submission, bid comparison — all through the platform)
386. What about vendor payment terms? (Configurable per vendor per builder — Net 30, Net 15, 2/10 Net 30)
387. How do you handle vendor rate sheets? (Standing pricing agreements that auto-populate POs)
388. What about vendor communication preferences? (Email, portal, text — configurable per vendor)
389. How do you handle vendor blacklisting? (Builder-level, not platform-level — one builder's bad vendor may be another's preferred)
390. What about vendor performance benchmarks? (Platform-wide anonymous data — "this vendor's performance ranks in the top 20% for your region")
391. How do you handle vendor succession? (Key person leaves the vendor company — historical data stays with the company, not the person)
392. What about vendor contract templates? (Builder-configurable standard subcontract)
393. How do you handle vendor onboarding to the platform? (First time a vendor uses the portal — guided experience)
394. What about vendor support? (Vendor has trouble with the portal — who helps them? The builder or your support team?)

---

# 20. PURCHASING & PROCUREMENT

### Procurement — Configurable Workflows
395. PO approval thresholds must be configurable per builder. ($500 auto-approve, $500-$5K PM approve, $5K+ Director approve)
396. What about PO templates? (Builder-specific formatting, terms, and conditions)
397. How do you handle emergency procurement? (Skip the PO process — log after the fact with override reason)
398. What about procurement aggregation across projects? (Auto-detect: "You need lumber for 3 projects this month — consolidate order?")
399. How do you handle material receiving workflows? (Who confirms delivery? How? Field or office?)
400. What about PO change orders? (Revising a PO after issuance — version tracking)
401. How do you handle procurement lead time management? (From schedule: "Order windows by X date or schedule slips")
402. What about procurement status dashboards? (All open POs, expected deliveries this week, past-due deliveries)

---

# 21. RFI MANAGEMENT

### RFI — Universal Builder Needs
403. RFI workflows must be configurable. (Who can create? Who reviews? Who routes? Who responds?)
404. What about RFI templates by trade? (Common RFIs pre-loaded — "confirm header size at opening XYZ")
405. How do you handle RFI response tracking? (Days open, ball-in-court, overdue alerts — configurable SLA)
406. What about RFI cost/schedule impact tracking? (Each RFI can have associated cost and time impact)
407. How do you handle RFI distribution? (Auto-send to architect, CC the client, log for the record)
408. What about linking RFIs to specific plan locations? (Markup on plans showing where the RFI applies)
409. How do you handle RFI numbering? (Configurable per builder — sequential, prefixed by project, etc.)
410. What about RFI resolution tracking? (Was the RFI answered satisfactorily? Did it lead to a CO?)

---

# 22. PUNCH LISTS & CHECKLISTS

### Punch Lists — Configurable per Builder
411. Punch list categories must be configurable. (Some builders categorize by room, some by trade, some by severity)
412. What about punch list templates by project type? (Different checklist for a renovation vs. new construction)
413. How do you handle punch list assignment workflows? (Assign to vendor → vendor completes → builder verifies → done)
414. What about punch list SLAs? (Must be resolved within X days — configurable)
415. How do you handle pre-punch / quality checklists during construction? (Not just final punch — ongoing quality gates)
416. What about punch list integration with warranty? (Punch item not resolved before CO → becomes warranty item)
417. How do you handle punch list photo requirements? (Before, after, and verification photos)
418. What about client punch list submission? (Client walks through and submits their own punch items via portal)
419. How do you handle vendor self-inspection checklists? (Vendor checks their own work before requesting inspection)
420. What about punch list cost tracking? (Who pays for each fix? Back-charge to responsible vendor?)

---

# 23. CLIENT PORTAL & COMMUNICATION

### Client Portal — White-Labeled per Builder
421. Client portal must be fully branded per builder. How customizable is the layout?
422. What about client portal content control? (Builder decides exactly what the client can see — configurable per builder)
423. How do you handle client portal for different project stages? (Preconstruction: estimate review. Construction: progress tracking. Warranty: service requests)
424. What about client portal notifications? (Configurable — what triggers a notification to the client?)
425. How do you handle client approval workflows through the portal? (Selections, change orders, draws — e-signature)
426. What about client photo gallery? (Curated progress photos — not the raw daily log photos with construction mess)
427. How do you handle client document access? (Which documents are client-visible? Configurable per builder)
428. What about client messaging? (In-portal messaging vs. email vs. text — builder configurable)
429. How do you handle the client who calls/texts instead of using the portal? (Must be able to log external communication)
430. What about client portal analytics? (How often does the client log in? Which features do they use? Is this a high-engagement client?)

---

# 24. FINANCIAL MANAGEMENT & ACCOUNTING

### Financial Configuration — Multi-Builder
431. Chart of accounts mapping must be configurable per builder. (Your cost codes → their QuickBooks accounts)
432. What about supporting multiple accounting systems? (QuickBooks Desktop, QuickBooks Online, Sage, Xero, Viewpoint)
433. How do you handle fiscal year configuration per builder? (Not everyone uses calendar year)
434. What about WIP schedule calculation methods? (Percentage of completion, cost-to-cost, completed contract — varies by builder and their accountant's preference)
435. How do you handle builders with multiple bank accounts? (Operating account, trust account, payroll account)
436. What about tracking owner equity/draws for small builders? (Sole proprietors and S-corps)
437. How do you handle financial reporting currency? (US builders = USD, but if you expand internationally?)
438. What about financial dashboard KPIs that are configurable? (Each builder cares about different metrics)
439. How do you handle financial data that's "accountant-locked"? (Month-end close — no more changes to prior period)
440. What about financial projections? (Revenue forecast, expense forecast, cash flow forecast — across all projects)

### Draw Request / AIA Billing — Configurable
441. Draw request format must be configurable. (AIA G702/G703 is standard but not universal)
442. What about draw request supporting documentation requirements? (Configurable per builder — or per lender)
443. How do you handle draw requests for different contract types? (Fixed-price: % complete × contract. Cost-plus: actual costs + fee)
444. What about stored materials billing? (Material on site but not installed — some lenders allow billing, some don't)
445. How do you handle draw request routing? (Generate → PM review → Director approve → send to client/lender)
446. What about automated draw request generation? (System calculates recommended billing based on schedule progress)
447. How do you handle multiple lenders with different draw requirements on the same project?
448. What about draw request reconciliation? (Draw approved for $150K, but actual disbursement is $142K — tracking the gap)

---

# 25. REPORTING & DASHBOARDS

### Reporting Engine — Multi-Builder
449. Report templates must be customizable per builder. (Each builder wants different reports)
450. What about a report builder that non-technical users can use? (Drag-and-drop report creation)
451. How do you handle report branding? (Builder's logo, colors, layout on every generated report)
452. What about report scheduling and auto-distribution? (Weekly report emailed to owner every Monday at 7am)
453. How do you handle report access control? (Some reports are owner-only, some are for the whole team)
454. What about report export formats? (PDF, Excel, CSV, Word — all supported?)
455. How do you handle comparative reports across projects? (Benchmarking — this project vs. similar projects)
456. What about AI-generated narrative reports? ("This month's summary: 3 projects on track, 1 behind schedule due to weather, 1 over budget on framing...")
457. How do you handle client-facing reports that are different from internal reports? (Same data, different presentation)
458. What about report data that comes from multiple modules? (Budget data + schedule data + photo data = comprehensive project report)

---

# 26-31. SPECIALIZED MODULES

### Safety & Compliance — Configurable
459. Safety requirements vary by state and by builder. All checklists, forms, and workflows must be configurable.
460. What about OSHA region-specific requirements?
461. How do you handle safety documentation for builders who have their own safety staff vs. those who don't?
462. What about safety training tracking that integrates with the platform's vendor/employee management?
463. How do you handle safety incident investigation workflows? (Configurable steps, required documentation)
464. What about safety integration with insurance? (Incident data feeds EMR calculations)

### Warranty & Home Care — Optional Module
465. Not all builders offer home care services. This must be an optional module.
466. What about warranty terms that are configurable per builder? (1 year, 2 years, 10-year structural — varies)
467. How do you handle warranty service request routing that's builder-configurable?
468. What about home care subscription pricing that varies by builder?
469. How do you handle warranty for items covered by manufacturer warranty vs. builder warranty?
470. What about warranty reserve accounting? (Configurable % of project cost set aside)

### Permitting & Inspections — Location-Aware
471. Permit types, processes, and fees vary by jurisdiction. Must be configurable per project location.
472. What about inspection type configuration? (Foundation, framing, MEP rough, insulation, drywall, final — varies by code and jurisdiction)
473. How do you handle builders who operate in multiple jurisdictions? (Different rules per project)
474. What about online permit integration for jurisdictions that offer it? (API where available, manual where not)
475. How do you handle special inspection requirements? (Structural threshold, concrete testing — varies by project scope)

### Photos & Media — Scalable
476. Photo storage needs scale — builder with 50 homes has millions of photos. What's the storage/cost model?
477. What about photo AI auto-tagging? (Recognizes "framing," "plumbing," "electrical" — trained on construction photos)
478. How do you handle photo access control? (Some photos are internal, some for client, some for marketing)
479. What about video support? (Job site walkthrough videos, drone footage — storage and playback)
480. How do you handle photo annotations? (Drawing on photos to highlight issues — across devices)

### Notifications — Configurable
481. Every notification type must be configurable per role per builder. (Builder X wants PM to get invoice alerts. Builder Y doesn't.)
482. What about notification channels per user? (In-app, email, SMS, push — user chooses)
483. How do you handle notification templates? (Builder customizes the text of automated messages)
484. What about notification quiet hours? (No push notifications after 8pm — configurable)
485. How do you handle notification for events across multiple projects? (Daily digest option vs. real-time per event)

### Mobile — Cross-Platform
486. Native iOS app? Native Android app? Progressive web app? React Native? What's the strategy?
487. What about offline mode capabilities? (Which features work offline? What's the sync strategy?)
488. How do you handle mobile-specific features? (Camera integration, barcode scanning, GPS, voice input)
489. What about mobile performance on job sites with poor connectivity? (Data-light mode? Background sync?)
490. How do you handle mobile device management for builders who issue company devices?

---

# 32. AI & INTELLIGENCE ENGINE

### AI — Multi-Tenant Learning
491. Does AI learn per-tenant only, or can it leverage anonymized data across all tenants? (With permission)
492. What about AI model training — is each builder's AI unique, or is it a shared model with per-builder fine-tuning?
493. How do you handle AI accuracy transparency? ("This estimate is based on 47 historical data points — high confidence" vs. "This is based on 3 data points — low confidence")
494. What about AI cold-start for new customers? (Use industry benchmarks + regional data until enough proprietary data accumulates)
495. How do you handle AI feature availability by subscription tier? (Basic plan: no AI. Pro plan: AI suggestions. Enterprise: full AI automation)
496. What about AI data requirements? ("You need at least 10 completed projects before estimate intelligence activates")
497. How do you handle AI recommendations that are clearly wrong? (User feedback loop — "this was wrong because...")
498. What about AI-powered data entry? (Upload a bid → AI extracts all line items → user verifies)
499. How do you handle AI for plan takeoffs? (Upload plans → AI identifies rooms, counts fixtures, calculates areas — HUGE feature but technically very challenging)
500. What about AI for schedule generation? (Given the estimate, auto-generate a schedule based on historical durations)
501. How do you handle AI suggestions vs. AI automation? (Configurable per builder — some want suggestions, some want auto-pilot)
502. What about AI that detects anomalies across the platform? ("Invoice amount is 3x higher than any previous invoice from this vendor for this scope — flag")
503. How do you handle AI transparency? (Can the user ask "why did you recommend this?" and get a clear answer?)
504. What about AI for document classification? (Invoice, bid, contract, lien waiver, COI — auto-sort incoming documents)
505. How do you handle AI for communication assistance? (Draft client updates, draft RFI responses, suggest change order descriptions)

---

# 33. INTEGRATIONS & DATA

### Integration Architecture
506. Is there a public API? (REST? GraphQL? Both?)
507. What about webhooks for real-time event notifications? (Invoice approved → trigger external system)
508. How do you handle OAuth for third-party integrations? (Secure authentication without sharing passwords)
509. What about integration health monitoring? (Is the QuickBooks sync working? When did it last run? Any errors?)
510. How do you handle integration data mapping? (Each builder's QuickBooks is set up differently — mapping must be per-tenant)
511. What about integration marketplace? (Pre-built integrations that builders can enable with a click)
512. How do you handle integrations that go down? (Third-party service unavailable — queue data, retry, notify)
513. What about building department API integrations? (Where available — auto-submit permits, check status)
514. How do you handle bulk data import/export? (CSV, Excel, JSON — for any entity in the system)
515. What about Zapier/Make integration for builders who want to connect tools you don't natively support?
516. How do you handle integration with construction cameras? (EarthCam, OpenSpace, Sensera — live job site video)
517. What about integration with drone services? (DroneDeploy, Skydio — auto-import survey data)
518. How do you handle integration with material delivery tracking? (UPS, FedEx, freight carriers — auto-update delivery status)
519. What about integration with equipment rental companies? (Auto-track rental starts, stops, and billing)
520. How do you handle integration with state licensing databases? (Auto-verify vendor licenses)

---

# 34. SEARCH, NAVIGATION & UX

### UX for Different Builder Sizes
521. How does the UI scale from a 1-person builder to a 50-person builder? (Different needs, different complexity)
522. What about progressive disclosure? (Simple by default, power features available but not overwhelming)
523. How do you handle first-time user experience vs. power user experience? (Different levels of guidance)
524. What about customizable navigation? (Builder rearranges modules in the order they use them most)
525. How do you handle multi-project context switching? (PM working on 5 jobs — quick-switch without losing context)
526. What about global search that works across all projects and all data types?
527. How do you handle keyboard-first navigation for data entry? (Tab through fields without touching the mouse)
528. What about personalized "My Day" views? (What I need to do today across all my projects)
529. How do you handle notification center / inbox? (Central place for all items needing attention)
530. What about recently viewed items? (Quick access to what I was just working on)
531. How do you handle breadcrumb navigation? (Always know where you are: Home > Project X > Budget > Electrical)
532. What about command palette / quick actions? (⌘K to quickly navigate anywhere, create anything)
533. How do you handle empty states? (First project, no data yet — what does the user see? Guidance, not emptiness)
534. What about data density preferences? (Compact view for power users, comfortable view for occasional users)
535. How do you handle accessibility? (WCAG 2.1 AA compliance — screen readers, keyboard navigation, color contrast)
536. What about localization? (English for V1, but architecture must support Spanish, French for future)

---

# 35. DATA INTEGRITY & ERROR HANDLING

### Data Integrity — Multi-Tenant Context
537. How do you prevent data leakage between tenants? (Every query must include tenant_id filter — how is this enforced at the database level?)
538. What about data validation rules that are configurable per builder? (Required fields, format rules, range checks)
539. How do you handle data migration rollback? (Import went wrong — can you undo it?)
540. What about data audit trails? (Who changed what, when, and what was the previous value — for every entity)
541. How do you handle concurrent editing across the platform? (Optimistic locking? Pessimistic locking? Real-time collaboration?)
542. What about referential integrity? (Deleting a vendor doesn't break invoices, POs, and schedule tasks that reference them)
543. How do you handle data consistency during integration sync? (QuickBooks says $10,000, your system says $10,250 — reconciliation)
544. What about data corruption recovery? (Point-in-time restore to any timestamp)
545. How do you handle performance at scale? (Builder with 500 completed projects — budget page still loads fast?)
546. What about database indexing strategy? (As data grows, queries must remain fast)

---

# 36-40. BUSINESS OPERATIONS

### Tax — Multi-State for SaaS Customers
547. Sales tax on construction varies by state. System must handle Florida, Texas, California, Colorado, and all 50 states.
548. What about builders who operate in multiple states? (Different tax rules per project location)
549. How do you handle tax rate lookups by address? (Down to zip code or even parcel level in some states)
550. What about tax exemption management? (Some clients have tax-exempt status — certificates on file)
551. How do you handle 1099 reporting that varies by builder? (Some are S-corps, some are sole proprietors — different reporting)
552. What about payroll tax for builders with W-2 employees? (Or is this purely an accounting system responsibility?)

### Insurance — Multi-State for SaaS Customers
553. Insurance requirements vary by state. Minimum coverage amounts, required endorsements — configurable per builder's location.
554. What about workers' compensation requirements by state? (Different class codes, different rates)
555. How do you handle Builder's Risk insurance tracking per project? (Different policies, different limits, different deductibles)
556. What about tracking additional insured endorsements? (Auto-request from vendors with their COI)
557. How do you handle the annual insurance audit data preparation? (Payroll and sub costs by class code — auto-generate from system data)

### HR & Workforce — Optional Module
558. Is HR a core feature or optional module? (Small builders don't need it, large builders do)
559. What about employee onboarding checklists that are builder-configurable?
560. How do you handle employee certification tracking? (OSHA 10/30, first aid, equipment operator — varies by builder and state)
561. What about employee performance tracking? (Tied to project outcomes — which PMs are most profitable?)
562. How do you handle time tracking for hourly employees? (Clock in/out, GPS verification, overtime calculation)
563. What about labor burden calculation? (Base wage + benefits + taxes + insurance = actual cost per hour — varies by builder)

### Equipment — Optional Module
564. Is equipment tracking a core feature or optional module?
565. What about equipment cost allocation to projects? (Configurable methods — hours used, days on site, flat rate)
566. How do you handle rental vs. owned equipment? (Different cost tracking approaches)
567. What about equipment maintenance scheduling? (Service intervals, inspection dates — auto-alerts)
568. How do you handle equipment depreciation for financial reporting?

### Marketing & Business Development — Optional Module
569. Is marketing tracking part of the platform or handled by external tools? (HubSpot, Mailchimp integration?)
570. What about project portfolio/showcase for marketing purposes? (Curated photos, specs, testimonials)
571. How do you handle client testimonial/review collection? (Auto-send request at project completion)
572. What about referral program management? (Track referral sources, manage referral fees/gifts)
573. How do you handle competitive win/loss analysis? (Why did you get the job? Why didn't you?)

---

# 41-43. SCALING & RESILIENCE

### Multi-Entity — Builders with Complex Structures
574. How do you handle a builder with multiple LLCs? (Ross Built LLC, Ross Development LLC — different entities, related data)
575. What about builders who have a construction company AND a real estate company? (Cross-entity referrals and data sharing)
576. How do you handle builders with multiple offices? (Regional offices with different teams, different vendor relationships)
577. What about builders who operate under different brand names? (Luxury brand + production brand — same company, different client experience)
578. How do you handle mergers/acquisitions? (Builder A acquires Builder B — merge data, migrate users)
579. What about franchise models? (Franchisor provides templates, branding, and training — franchisees operate independently)
580. How do you handle builders transitioning from small to large? (System must grow with them without forcing a platform change)

### Geographic Variability — National Platform
581. Building codes differ by state and jurisdiction. How do you maintain a database of code requirements?
582. What about permit processes that vary by municipality? (Online, in-person, combined — different timelines)
583. How do you handle weather data for all US regions? (Single weather API integration, regional accuracy)
584. What about material availability by region? (Some products available nationally, others are regional)
585. How do you handle regional labor market conditions? (Labor shortage areas, prevailing wage areas)
586. What about natural disaster considerations by region? (Hurricanes: FL, TX. Earthquakes: CA. Tornadoes: OK, KS. Snow: Northeast. Wildfires: CA, CO)
587. How do you handle building on different foundation types? (Slab: TX, FL. Basement: Midwest, Northeast. Crawlspace: Southeast. Piling: Coastal)
588. What about energy code requirements that vary by climate zone?
589. How do you handle builders who work in wildfire zones? (WUI requirements, defensible space, ember-resistant construction)
590. What about builders in high-seismic zones? (Different structural requirements, different inspection requirements)

### Disaster Recovery & Business Continuity
591. What's the RPO (Recovery Point Objective) — how much data can you lose? (Target: 0, realistic: < 1 hour)
592. What's the RTO (Recovery Time Objective) — how long can the system be down? (Target: < 1 hour)
593. How do you handle geographic redundancy? (Data center in one region fails — failover to another)
594. What about disaster recovery testing? (Regular drills — quarterly? annually?)
595. How do you handle communication during platform outages? (Status page, email notification, in-app banner)
596. What about data export for business continuity? (If YOUR company goes under, can builders get their data?)
597. How do you handle platform rollback? (Bad release breaks something — how fast can you revert?)
598. What about incremental backups vs. full backups? (Balance between cost and recovery speed)

---

# 44. UNUSUAL BUSINESS SCENARIOS

### Scenarios That Will Happen to SOME Builder, Eventually
599. Client goes bankrupt mid-construction. System must support lien filing documentation, partial billing, project hold, and eventual close-out.
600. Builder acquires another builder's in-progress project. How do you onboard a project mid-stream?
601. Builder needs to fire a subcontractor mid-scope. System must support contractor replacement workflow — termination documentation, scope reassignment, schedule impact, cost reconciliation.
602. Project paused for 12 months (financing issue). System must handle: vendor contract suspension, permit extensions, schedule restart, cost escalation recalculation.
603. Property sold during construction. Contract assignment, new owner portal access, closing documentation.
604. Architect fired mid-project. New architect onboarding, plan revision management, responsibility transition.
605. Client divorce during construction. Potential dual communication requirements, split decision authority, legal sensitivity.
606. Builder's key employee dies or becomes incapacitated. System must have complete project documentation that someone else can pick up and continue.
607. Material supplier goes bankrupt. Deposit recovery tracking, alternative sourcing, schedule impact, substitution approvals.
608. Building department changes requirements mid-project. Tracking new requirements, additional costs, plan revision cycle.
609. Adjacent property owner sues to stop construction. Legal hold documentation, communication restrictions, project pause workflow.
610. Client wants to self-perform some work. Owner-builder scope tracking, insurance requirements, quality acceptance, warranty exclusions.
611. Project is featured on TV/magazine. Photo approval workflows, NDA management, site visit scheduling.
612. Builder expands into light commercial. System must handle different contract types, prevailing wage, bonding, and reporting requirements.
613. Natural disaster damages an in-progress project. Insurance claim documentation, reconstruction scope, schedule rebuild, client communication.
614. Pandemic causes work stoppage. Force majeure documentation, vendor payment pause, schedule extension, remote management.
615. Builder decides to sell the business. System must produce comprehensive business documentation — active projects, pipeline, vendor relationships, financial history.
616. Multiple builders on the platform work on the same subdivision. How do you handle shared infrastructure costs, common area budgets, and HOA formation?
617. Client wants to build an ADU (accessory dwelling unit) alongside main home. Same project? Separate project? Different permits, possibly different code requirements.
618. Builder takes on a joint venture project with another builder. How does data sharing work? Especially if both are on the platform?
619. Local building code adopts a new edition mid-year. How does the system flag affected active projects and updated inspection requirements?
620. Builder hires a construction manager / owner's rep who needs oversight access to everything.

---

# 45. PER-PAGE FEATURE REQUIREMENTS

> These are the specific interactive features that each screen/page in the application needs. Missing any of these results in a "why can't I just..." moment for users.

### Dashboard Page
621. Configurable widget layout — each user arranges their own dashboard
622. Widget library — choose from available widgets (budget summary, schedule status, alerts, weather, photos, etc.)
623. Filtering across all widgets — select a project to filter everything, or see company-wide
624. Drill-down from any number — click a dollar amount to see the underlying transactions
625. Date range selector — this week, this month, this quarter, custom range
626. Comparison toggle — this period vs. last period, this year vs. last year
627. Refresh button / auto-refresh interval
628. Export dashboard as PDF for reporting
629. "Needs attention" priority queue with dismiss/snooze
630. Quick action buttons — create daily log, create RFI, approve invoice, without navigating away
631. Activity feed — recent actions across all projects by your team
632. KPI sparklines — trending indicators for key metrics

### Project List Page
633. Sortable by any column — name, status, PM, start date, budget, % complete
634. Filterable by multiple criteria simultaneously — status, PM, location, date range, project type
635. Saveable filter presets — "My Active Projects," "Over Budget Projects," "AMI Projects"
636. Shareable filter presets — create a view that the whole team can use
637. Bulk actions — archive multiple projects, reassign PM, update status
638. Customizable columns — choose which columns to display
639. Column resize and reorder
640. Compact vs. card view toggle
641. Map view — see all projects on a map (especially useful for geographic builders)
642. Quick inline editing — change status without opening the project
643. Color coding / tags — visual indicators configurable per builder
644. Favorite/pin projects for quick access
645. Project health indicators — red/yellow/green for budget, schedule, risk
646. Search within the project list

### Project Detail / Overview Page
647. Summary cards: Budget, Schedule, Documents, RFIs, COs, Punch at a glance
648. Project info section: Address, client, PM, contract type, contract amount, key dates
649. Quick navigation to any module within the project
650. Activity timeline — chronological history of everything that's happened on this project
651. Project notes / journal — running notes about the project
652. Team roster — who's assigned to this project and in what role
653. Key milestone tracker — permit, breaking ground, dry-in, CO — with dates
654. Project risk register — identified risks with mitigation plans
655. Project photo carousel — recent photos from daily logs
656. Weather widget for project location
657. Quick stats: Days since start, estimated days remaining, % complete

### Budget Page
658. Expandable/collapsible hierarchy — Division → Code → Line Item
659. Multiple budget views: Original budget, current budget (with COs), committed, actual, projected final
660. Variance column with color coding (under = green, over = red)
661. Percentage indicators — % budget consumed, % work complete
662. Cost-to-complete column — auto-calculated or manually overridable
663. Budget line item notes — explain variances
664. Attached documents per line — linked invoices, POs, bids
665. Filter by trade, phase, cost code, status (over/under budget)
666. Budget history — see budget at any point in time (snapshots)
667. Import/export to Excel
668. Compare to similar projects — benchmark this line against averages
669. Forecast scenarios — "what if concrete costs go up 10%?"
670. Change order impact — visual indicator of original vs. CO-adjusted budget
671. Locked/frozen lines — some budget lines are finalized, others are still estimating
672. Audit trail per line — who changed what, when

### Schedule Page
673. Gantt chart with drag-and-drop task editing
674. Calendar view toggle
675. List view toggle
676. Kanban board toggle (tasks by status: Not Started, In Progress, Complete)
677. Two-week look-ahead view
678. Filter by trade, phase, critical path, status
679. Dependency arrows showing predecessor/successor relationships
680. Resource assignment and resource leveling view
681. Baseline comparison overlay (planned vs. actual)
682. Weather overlay — forecast on the calendar
683. Milestone markers with labels
684. Progress indicators per task — 0%, 25%, 50%, 75%, 100%
685. Task detail panel — click a task to see notes, photos, vendor, duration, predecessors, actual dates
686. Print/export schedule in multiple formats (Gantt, list, calendar)
687. Schedule health indicators — critical path highlighted, at-risk tasks flagged
688. Vendor schedule view — "show me only what ABC Electric needs to do"
689. Client-friendly schedule view — simplified milestones, not 500 tasks
690. Schedule conflict detection — "Task X and Task Y need the same space simultaneously"
691. Bulk schedule operations — shift all tasks by N days, reassign trade

### Invoice / Billing Page
692. Invoice queue — incoming invoices sorted by status (New, Pending Review, Approved, Paid, Disputed)
693. AI-extracted data display with confidence indicators — "85% confident this is $4,250"
694. Side-by-side view — invoice image on left, extracted data on right
695. One-click approval / rejection with required comment on rejection
696. Cost code assignment with smart suggestions
697. Budget impact preview — "approving this invoice will bring Electrical to 87% of budget"
698. Batch approval capability
699. Invoice history per vendor
700. Duplicate detection alerts — "this appears similar to Invoice #X from this vendor"
701. Payment status tracking — approved → scheduled → paid → cleared
702. Lien waiver status indicator per invoice
703. Retainage auto-calculation
704. Link to PO and contract for comparison
705. Aging report — invoices by days outstanding
706. Payment run generation — select approved invoices for batch payment
707. Export to accounting system button

### Vendor Profile Page
708. Contact information, addresses, key personnel
709. Insurance status with expiration countdown
710. License status with verification link
711. Performance scorecard — visual dashboard of ratings
712. Job history — all projects they've worked on, with performance data per job
713. Financial summary — total spend, average invoice size, payment history
714. Active contracts and POs
715. Open punch items across all jobs
716. Schedule reliability metrics — on-time start %, on-time completion %
717. Bid history — all bids submitted, won/lost, pricing trends
718. Communication log — recent messages, calls, emails
719. Document repository — COI, W-9, contracts, lien waivers
720. Notes and tags — internal notes about the vendor
721. Related vendors — "this is a subsidiary of XYZ Corp"
722. Capacity indicator — how many active jobs they have with you
723. Quick actions: Create PO, Invite to Bid, Send Message, Schedule Meeting

### Selection Page (Client-Facing)
724. Visual room-by-room layout — "Kitchen Selections," "Master Bath Selections"
725. Selection cards with photos, descriptions, pricing, lead times
726. Comparison mode — side-by-side options within a category
727. Budget impact real-time calculator — "choosing this option puts you $2,400 over allowance"
728. Approval button with e-signature
729. Status indicators — Not Started, Options Presented, Client Reviewing, Selected, Ordered, Received, Installed
730. Deadline countdown — "Selection needed by [date] to stay on schedule"
731. Inspiration board — client uploads photos of what they like
732. Comment/question thread per selection category
733. History — track all considered options, not just final selection
734. Print/export selection summary
735. Designer view — interior designer can add/recommend options

### Daily Log Page
736. Date selector with calendar navigation
737. Auto-populated weather data
738. Workforce tracker — which vendors on site, how many workers each
739. Work performed narrative — free text with AI-assist
740. Material delivery log
741. Equipment on site
742. Visitor log
743. Safety observations
744. Photo upload with drag-and-drop, bulk upload
745. Carry forward from yesterday — pre-populate with yesterday's vendors/equipment
746. Linked schedule tasks — "work performed today relates to [task X]"
747. Issue/delay reporting with cause categorization
748. Voice-to-text entry option
749. Preview mode — see what the log looks like before submitting
750. Edit history with audit trail after submission
751. Daily log gallery — all photos from this day in a grid
752. Export daily log as PDF
753. Notification confirmation — "daily log submitted, PM notified"

### Document Management Page
754. Folder tree navigation — configurable folder structure per project
755. Drag-and-drop upload with auto-categorization
756. Bulk upload with progress indicator
757. Full-text search across all documents
758. Filter by document type, trade, date, uploaded by
759. Version history per document with comparison tool
760. Document preview without downloading
761. Annotation/markup tools on documents
762. Sharing controls — who can see this document
763. Expiration tracking with alerts (insurance, permits)
764. Download with watermark option
765. Batch operations — move, tag, delete, share multiple documents
766. Recent documents and favorites for quick access
767. Document status indicators — draft, pending review, approved, expired
768. Integration with e-signature platforms

### Reports Page
769. Report library — pre-built reports organized by category
770. Report builder — drag-and-drop custom report creation
771. Report scheduling — auto-generate and email on a schedule
772. Report favorites and recently run
773. Parameter selection — date range, project, vendor, cost code filters before running
774. Export to PDF, Excel, Word, CSV
775. Interactive charts within reports — hover for detail, click to drill down
776. Comparative reporting — select 2+ projects or periods to compare
777. Report templates saveable and shareable within the builder's team
778. Client-formatted report generation — professional layout with builder branding
779. AI-generated narrative summaries within reports
780. Report archiving — save a report snapshot for historical reference

### Settings / Admin Page
781. Company profile — name, logo, address, licenses, insurance
782. User management — create, edit, deactivate users and roles
783. Role/permission configuration — custom roles with granular permissions
784. Cost code management — create, edit, organize cost code structure
785. Workflow configuration — approval chains, thresholds, routing rules
786. Notification preferences — what triggers notifications, for which roles, via which channels
787. Integration management — connect/disconnect integrations, monitor sync status
788. Template management — document templates, estimate templates, checklist templates, email templates
789. Custom field management — create/edit custom fields on any entity
790. Billing / subscription management — plan, payment method, usage, invoices
791. Data import/export tools
792. API key management for integrations
793. Audit log viewer — searchable history of all system actions
794. Branding configuration — colors, logo, portal customization
795. Regional settings — timezone, date format, currency, tax configuration
796. Module enable/disable — turn on/off optional modules (home care, HR, equipment)

---

# 46. LEGAL & DISPUTE SCENARIOS

797. How does the system assist with mechanic's lien documentation by state?
798. What about discovery/litigation hold? (Prevent deletion of any project data during legal proceedings)
799. How do you handle OSHA citation documentation and response tracking?
800. What about construction defect claim workflows by state? (Florida's 558 process, California's SB800)
801. How do you handle warranty claim dispute resolution documentation?
802. What about expert witness documentation support? (Producing organized project records for legal testimony)
803. How do you handle non-compete and non-solicitation tracking? (For employees and vendors)
804. What about contract interpretation disputes? (System stores the contract language and related correspondence for reference)
805. How do you handle government audit preparation? (Prevailing wage, tax, safety — producing organized documentation)

---

# 47. FINANCIAL EDGE CASES

806. Client overpays — refund processing and tracking
807. Vendor underpays a credit — collection and dispute tracking
808. Construction loan with unusual draw structures — configurable draw schedules
809. Multiple funding sources — client pays some, lender funds some, investor funds some
810. Barter arrangements — vendor trades work for other consideration
811. Escrow requirements for deposits — jurisdiction-specific rules
812. Insurance proceeds after damage — tracking, applying to reconstruction costs
813. Cost-plus audit by client — system must support transparent cost documentation and export
814. Progress billing when work is complete but not inspected — billing rules configurable
815. Force majeure financial impact — cost escalation, extended general conditions, remobilization costs
816. Bonus/penalty clauses — milestone tracking with automatic financial calculation
817. Liquidated damages — daily rate calculation when project exceeds completion date
818. Shared costs between projects — configurable allocation methods
819. Year-end financial close processes — preventing changes to closed periods
820. Multi-year project financial reporting — costs span multiple fiscal years
821. Currency conversion for imported materials — exchange rate tracking
822. Contingency drawdown authorization — configurable approval requirements
823. Budget contingency reallocation — moving contingency funds to specific cost codes with documentation
824. Profit margin analysis that accounts for change orders, warranty costs, and general conditions overrun
825. Cash-basis vs. accrual-basis reporting toggle — each builder's accountant has preferences

---

# 48. TECHNOLOGY EDGE CASES

826. System access during multi-day power outage (hurricanes) — mobile app with extensive offline capability
827. Photo metadata discrepancies — camera time vs. phone time vs. server time
828. Large plan set rendering on mobile devices — progressive loading, zoom performance
829. Field connectivity — dead zones on islands, basements, rural areas — robust offline mode
830. Device diversity — old iPads, cheap Android phones, brand-new iPhones — graceful degradation
831. Browser compatibility — Chrome, Safari, Firefox, Edge — consistent experience
832. Print formatting — reports, schedules, budgets must print cleanly on standard paper
833. Email deliverability — automated notifications not going to spam
834. Data export volume — builder wants to export 5 years of data — performance and format considerations
835. API rate limiting for integrations — prevent overwhelming third-party services
836. File format handling — PDFs, DWGs, Excel, Word, images, videos — all need appropriate viewing/processing
837. Character set handling — accented characters in names, addresses (Spanish-speaking teams)
838. Session management across devices — login on phone, continue on desktop seamlessly
839. Deep linking — link in an email goes directly to the specific invoice/task/document
840. Concurrent user performance — 50 users from one builder all logged in simultaneously
841. Search performance — full-text search across millions of documents and records
842. Notification delivery timing — urgent alerts within 30 seconds, not queued for 5 minutes
843. Mobile app update management — force update for critical fixes, optional for features
844. Third-party dependency management — what if a key service (Google Maps, weather API, OCR service) changes pricing or goes down?
845. Data anonymization for demo/sales purposes — show real-looking data without revealing actual customer data

---

# 49. PLATFORM BUSINESS STRATEGY QUESTIONS

> These aren't feature gaps — they're business decisions that affect what gets built.

846. What's the target customer profile? (Revenue range, project count, team size, tech savviness)
847. What's the competitive positioning? ("Buildertrend but with AI" vs. "completely different approach")
848. What's the MVP? (Minimum viable product that's useful enough to sell)
849. What's the build order? (Which modules first? What can wait for V2, V3?)
850. What's the pricing strategy for early adopters? (Discount? Free? Beta access?)
851. How do you balance Ross Built's specific needs with market-wide needs? (Don't over-customize for yourself)
852. What's the go-to-market strategy? (Direct sales, partnerships, marketplace, word of mouth?)
853. How do you handle competitive features that Buildertrend/Procore have but you don't yet? (Gap communication)
854. What's the technology stack decision? (React + Supabase? Something else at scale?)
855. How do you handle the "we need it NOW" features vs. the "this would be cool someday" features?
856. What's the team? (Just Jake coding? Hired developers? Agency? Combination?)
857. What's the funding model? (Bootstrapped? Investor-backed? Revenue-funded from Ross Built?)
858. What's the timeline to first external customer? (6 months? 12 months? 24 months?)
859. How do you handle customer expectations when the product is still being built? (Transparency about roadmap)
860. What's the support model as you scale? (Jake can't support 100 customers personally)

---

# 50. MISSING WORKFLOW CONNECTIONS

> Every piece of data should flow through the system without re-entry. These are the connections between modules that get missed.

861. Estimate line item → Budget line item → PO → Invoice → Payment → Lien waiver → Draw request — FULL CHAIN must be traceable.
862. Plan upload → AI takeoff → Estimate → Bid package → Vendor bid → Bid comparison → Contract → PO → Schedule task — FULL CHAIN.
863. Daily log "delay reported" → Schedule impact calculation → Revised completion date → Client notification — AUTOMATED.
864. Selection made → Budget impact calculated → Change order generated (if over allowance) → Client approval → PO generated → Delivery tracked → Installation scheduled — AUTOMATED.
865. Invoice received → AI extraction → Cost code suggestion → Budget impact calculated → Approval routed → Payment scheduled → Lien waiver requested → Draw request updated — AUTOMATED.
866. Punch item created → Assigned to vendor → Vendor notified → Vendor marks complete → Builder verifies → Photos documented → Item closed — FULL WORKFLOW.
867. Insurance certificate uploaded → Expiration date extracted → Calendar reminder set → Renewal request auto-sent 30 days before expiration — AUTOMATED.
868. Vendor bid received → AI parses line items → Compares to estimate → Compares to other bids → Compares to historical data → Recommendation generated — AUTOMATED.
869. RFI created → Routed to architect → Response received → Cost impact assessed → Change order created (if applicable) → Budget updated → Schedule updated — FULL CHAIN.
870. Client selection → Lead time calculated → Order date calculated → Schedule constraint created → Order reminder triggered → PO generated → Delivery tracked — FULL CHAIN.
871. Failed inspection → Responsible trade identified → Correction assigned → Re-inspection scheduled → Passed → Schedule updated — FULL WORKFLOW.
872. Weather forecast → At-risk tasks identified → Team notified → Schedule auto-adjusted (or suggestion generated) → Daily log auto-populated with weather data — AUTOMATED.
873. Employee certification expiration → Alert generated → Training scheduled → Certification updated → Compliance report updated — AUTOMATED.
874. Project completion → Warranty start dates set → Home care schedule generated → Client portal transitions to warranty mode → Vendor warranty responsibilities documented — AUTOMATED.
875. Change order approved → Contract value updated → Budget updated → Schedule impact applied → Draw request schedule adjusted → Client portal updated — ALL SIMULTANEOUS.

---

# 51. COMPETITIVE FEATURE PARITY

> Features that Buildertrend, Procore, CoConstruct, BuildBook, Adaptive, Materio, and ReportandGo have that must be matched or exceeded.

### Buildertrend Feature Parity
876. To-do lists with assignment and due dates
877. Warranty claim management
878. Internal messaging with job context
879. Customer login/portal
880. Scheduling with Gantt and calendar
881. Budgeting with detailed cost tracking
882. Change order management
883. Selection sheets
884. Photo management
885. Daily log with weather
886. Bid requests to vendors
887. Time clock for employees and subs
888. Lead management CRM
889. Proposals and contracts
890. Financial reporting
891. Lien waiver tracking
892. Mobile app

### Procore Feature Parity (Relevant Features)
893. Drawing management with version control and markup
894. Submittal management
895. Meeting minutes
896. Transmittals
897. Correspondence logs
898. Quality & Safety observations
899. Commissioning workflows
900. BIM coordination (may be out of scope for residential — but high-end custom homes may use it)

### Features That Exceed Current Options
901. AI-powered invoice processing (better than manual entry in Buildertrend)
902. AI-powered estimate generation from plans
903. Vendor intelligence scoring (no one does this well)
904. Material price intelligence database (no one does this)
905. Schedule intelligence that learns from historical data (no one does this)
906. Integrated home care post-construction (no one integrates this with the build platform)
907. True cost intelligence — every document feeding pricing knowledge (no one does this comprehensively)
908. Client selection portal rivaling Materio (in the same platform as project management)
909. Live field checklists rivaling ReportandGo (in the same platform as project management)
910. Invoice processing rivaling Adaptive.build (in the same platform as project management)

---

# GRAND TOTAL: 910 gaps, scenarios, features, and decisions

### Priority Categorization Guide:
- **P0 — Architectural Decision (Must decide before coding):** Items 1-50, 846-860
- **P1 — MVP Required:** Core modules (estimating, budgeting, scheduling, daily logs, invoicing, documents)
- **P2 — Early Advantage:** AI features, intelligence engine, vendor scoring
- **P3 — Competitive Parity:** Features matching Buildertrend/Procore
- **P4 — Differentiation:** Features no one else has (plan AI, price intelligence, home care integration)
- **P5 — Scale Features:** Multi-entity, franchise, marketplace, international
