# Construction Management Platform: Complete Connection Map

> **Purpose:** Every entity in the system should connect to every other relevant entity. This document maps all connections so nothing exists in isolation. If a connection listed here doesn't exist in the platform, it should.
>
> **How to read:** Each section starts with a SOURCE entity, then lists every other entity it should connect to and WHY.

---

## MASTER ENTITY LIST

For reference, these are all the core data objects in the platform:

1. **Project** — The master container
2. **Lead/Prospect** — Pre-project sales pipeline
3. **Estimate** — Pre-construction pricing
4. **Proposal** — Client-facing budget/scope document
5. **Contract (Owner)** — Agreement with the homeowner
6. **Scope of Work (SOW)** — Detailed work descriptions by trade
7. **Bid Package** — Sent to subs for pricing
8. **Bid/Quote** — Sub's response to a bid package
9. **Subcontractor Agreement** — Contract with a trade partner
10. **Purchase Order (PO)** — Material/equipment orders
11. **Invoice** — Bills from subs/vendors
12. **Pay Application (AIA G702/G703)** — Draws to owner/lender
13. **Change Order (Owner CO)** — Scope/cost changes with owner
14. **Change Order (Sub CO)** — Scope/cost changes with subs
15. **Budget / Cost Codes** — Financial tracking structure
16. **Schedule / Tasks** — Timeline and sequencing
17. **Daily Log** — Field activity documentation
18. **Photo / Media** — Visual documentation
19. **Drawing / Plan Set** — Architectural and engineering documents
20. **RFI** — Request for Information
21. **Submittal** — Product/material approval requests
22. **Selection** — Client finish/fixture choices
23. **Allowance** — Budget allocation for client choices
24. **Checklist** — Quality/process verification lists
25. **Inspection** — Code official and internal inspections
26. **Punch List** — Deficiency tracking
27. **Warranty Item** — Post-completion issues
28. **Home Care Task** — Ongoing maintenance
29. **Contact / Company** — People and organizations
30. **Document / File** — General document storage
31. **Communication / Message** — Conversations and correspondence
32. **Meeting / Meeting Minutes** — Scheduled discussions
33. **Task / Action Item** — Assigned to-dos
34. **Material Takeoff** — Quantity calculations from plans
35. **Lien Waiver** — Payment protection documents
36. **Insurance Certificate** — Coverage documentation
37. **Permit** — Government approvals
38. **Report** — Generated summaries and analytics
39. **Notification / Alert** — System-generated messages
40. **Time Entry** — Labor tracking
41. **Equipment Log** — Tools and equipment tracking
42. **Safety Incident** — Accident/near-miss documentation
43. **Back-Charge** — Charges against subs for deficient work
44. **Credit / Return** — Material returns and credits
45. **Retainage** — Withheld payment amounts
46. **Closeout Package** — Final project documentation bundle
47. **Home Manual** — Owner turnover documentation
48. **Vendor Catalog** — Supplier product/pricing database
49. **Template** — Reusable document/workflow templates

---

## SECTION 1: SCOPE OF WORK (SOW) CONNECTIONS

The SOW is the DNA of the project. Everything traces back to what work was defined.

### SOW → Bid Package
1. Each SOW should auto-generate a bid package for that trade.
2. Bid package should include the full SOW text so subs price the exact scope.
3. SOW exclusions should be highlighted in the bid package so subs know what's NOT included.
4. SOW alternates should be listed as optional bid items.
5. SOW special conditions (coastal, elevated, etc.) should carry into bid requirements.
6. When the SOW is revised, a new bid package version should be triggered.
7. SOW allowance items should be flagged as "allowance — price TBD" in the bid package.
8. SOW references to drawings/specs should be linked in the bid package.

### SOW → Subcontractor Agreement
9. The awarded bid should auto-populate the subcontractor agreement with SOW text.
10. SOW inclusions become the contractual scope in the sub agreement.
11. SOW exclusions become clarifications/exclusions in the sub agreement.
12. SOW quantities should carry into the contract for unit-price verification.
13. SOW special requirements (insurance, licensing) should populate sub agreement exhibits.
14. When a sub CO modifies the scope, the SOW should be updated and versioned.
15. Sub agreement value should trace back to the original SOW estimate line item.
16. SOW payment terms (milestones, % complete, lump sum) should define the sub agreement payment structure.

### SOW → Checklist (PM/Super)
17. Each SOW should auto-generate a quality checklist for that trade's work.
18. SOW specifications should define the checklist acceptance criteria.
19. SOW critical items should be flagged as "must verify" on the checklist.
20. Pre-cover checklists should be generated from SOW items that will be concealed.
21. SOW installation requirements should become checklist line items.
22. SOW-referenced standards (manufacturer specs, code requirements) should link from checklist items.
23. Checklist completion should feed into SOW % complete tracking.
24. Failed checklist items should generate punch list items linked back to the SOW.

### SOW → Schedule
25. Each SOW should have associated schedule activities.
26. SOW dependencies (e.g., "after rough plumbing") should auto-create schedule dependencies.
27. SOW duration estimates should populate default task durations.
28. SOW material lead times should create procurement schedule milestones.
29. SOW inspection requirements should generate inspection tasks in the schedule.
30. When a SOW is added via change order, new schedule activities should be auto-created.
31. SOW phasing (rough, trim, final) should create multiple schedule activities per trade.
32. Schedule delays on SOW-linked tasks should flag the SOW as at-risk.

### SOW → Budget / Cost Code
33. Each SOW should map to one or more cost codes.
34. SOW estimated cost should set the budget amount for that cost code.
35. SOW awarded contract value should update the committed cost in the budget.
36. SOW allowance items should create allowance line items in the budget.
37. SOW change orders should auto-update the budget.
38. Budget actuals should be trackable against the original SOW estimate.
39. SOW unit prices should enable cost tracking by unit ($/SF, $/LF, etc.).
40. Budget variance on SOW items should trigger PM alerts.

### SOW → Estimate
41. SOW should be generated from the estimate's line items.
42. Estimate quantities should carry into the SOW.
43. Estimate assumptions should be documented in the SOW.
44. Estimate alternates should create optional SOW sections.
45. When actuals differ from the estimate, the variance should be visible from the SOW.

### SOW → Drawing / Plan Set
46. Each SOW should reference the specific drawing sheets relevant to that trade.
47. SOW should link to the current revision of referenced drawings.
48. When drawings are revised, affected SOWs should be flagged for review.
49. SOW details should be verifiable against the linked drawings.
50. Drawing details referenced in the SOW should be viewable from the SOW.

### SOW → RFI
51. RFIs should be linkable to specific SOW items.
52. RFI responses that clarify scope should update or annotate the SOW.
53. RFIs that result in scope changes should trigger SOW revisions and potential change orders.
54. Open RFIs on a SOW item should be visible when viewing that SOW.

### SOW → Submittal
55. SOW material specifications should generate a submittal register.
56. Each specified product in the SOW should require a submittal before procurement.
57. Approved submittals should link back to the SOW item they satisfy.
58. Submittal substitutions should trigger SOW updates.

### SOW → Selection
59. SOW allowance items should link to pending client selections.
60. When a selection is made, the SOW allowance should be updated with the actual product.
61. Selection specifications should feed into the SOW for trade reference.
62. Unresolved selections on a SOW should block related procurement.

### SOW → Inspection
63. SOW items requiring inspection should auto-generate inspection milestones.
64. Inspection requirements (structural, MEP, final) should be linked to relevant SOW items.
65. Inspection results should be documented against the SOW item.
66. Failed inspections should create corrective action items linked to the SOW.

### SOW → Punch List
67. Punch list items should trace back to the originating SOW.
68. Punch list items should identify which SOW acceptance criteria weren't met.
69. Punch list resolution should update SOW completion status.
70. Recurring punch list items on similar SOWs should trigger SOW template improvement.

### SOW → Warranty
71. SOW warranty terms should populate the warranty tracking system.
72. Warranty items should trace back to the originating SOW and sub agreement.
73. SOW installation records should be accessible during warranty claim review.
74. Warranty expiration dates should be set based on SOW substantial completion date.

### SOW → Template
75. Completed SOWs from successful projects should feed the SOW template library.
76. SOW templates should be versionable and improvable over time.
77. SOW templates should auto-populate based on project type and characteristics.
78. Lessons learned should annotate SOW templates for future use.

---

## SECTION 2: BID PACKAGE → CONNECTIONS

### Bid Package → Bid/Quote
79. Each bid package should track which subs received it.
80. Sub responses (bids) should be linked to the originating bid package.
81. Bid comparison should normalize responses against the bid package scope.
82. Non-responsive subs should be trackable for follow-up.
83. Bid package addenda should be tracked and confirmed received by bidders.

### Bid Package → Contact/Company (Sub)
84. Bid packages should be routable to subs from the prequalified sub database.
85. Sub bid history should be visible when selecting who to send bid packages to.
86. Sub trade classification should match bid package trade categories.
87. Sub insurance/license status should be verified before sending bid packages.
88. Sub availability/capacity should be visible when selecting bidders.

### Bid Package → Drawing / Plan Set
89. Bid packages should include links to the current plan set.
90. Drawing revisions after bid package distribution should trigger addenda.
91. Bid packages should specify which drawing sheets are relevant to the scope.
92. Plan set version should be documented in the bid package for reference.

### Bid Package → Schedule
93. Bid packages should include the expected construction timeline for the scope.
94. Schedule constraints should be communicated in the bid package.
95. Bid package due dates should appear on the pre-construction schedule.
96. Awarded bid mobilization dates should feed into the construction schedule.

---

## SECTION 3: SUBCONTRACTOR AGREEMENT → CONNECTIONS

### Sub Agreement → Invoice
97. Invoices should be validated against the sub agreement contract value.
98. Invoices should not exceed the remaining contract balance without a flag.
99. Invoice line items should map to sub agreement schedule of values.
100. Invoice approval should verify work completion against sub agreement milestones.
101. Cumulative invoiced amount should be trackable against the sub agreement.
102. Invoice payment terms should default from the sub agreement.

### Sub Agreement → Pay Application (AIA)
103. Sub agreement values should populate the owner pay application line items.
104. Sub invoiced amounts should feed into pay application "work completed" columns.
105. Sub stored materials should carry to the pay application stored materials section.
106. Sub retainage should calculate from the sub agreement retainage terms.
107. Pay application should not include amounts exceeding sub agreement values.

### Sub Agreement → Change Order (Sub CO)
108. Sub change orders should modify the sub agreement contract value.
109. Sub CO history should be visible from the sub agreement.
110. Cumulative sub COs should show revised contract amount.
111. Sub COs should require PM approval and link to owner COs if applicable.
112. Sub CO scope should be added to the SOW and sub agreement exhibits.

### Sub Agreement → Change Order (Owner CO)
113. Owner COs that affect sub scope should trigger sub COs.
114. Owner CO pricing should include sub CO costs plus markup.
115. Owner CO approval should trigger sub CO execution.
116. The margin between owner CO and sub CO should be trackable.

### Sub Agreement → Lien Waiver
117. Lien waivers should be required before sub payments are released.
118. Lien waiver amounts should match invoice payment amounts.
119. Conditional vs. unconditional waivers should be tracked per sub agreement.
120. Final lien waivers should be required before retainage release.
121. Lien waiver status should be visible from the sub agreement dashboard.

### Sub Agreement → Insurance Certificate
122. Sub agreement should require current insurance certificates.
123. Insurance expiration dates should trigger alerts before they lapse.
124. Insurance coverage amounts should be verified against sub agreement requirements.
125. Additional insured endorsements should be tracked per sub agreement.
126. Expired insurance should block invoice payment until renewed.

### Sub Agreement → Retainage
127. Retainage percentage should be defined in the sub agreement.
128. Retainage balance should calculate automatically from invoiced amounts.
129. Retainage release milestones should be defined (substantial completion, final).
130. Retainage release should require final lien waiver and punch list completion.
131. Retainage balance should be visible in the project budget and cash flow forecast.

### Sub Agreement → Back-Charge
132. Back-charges should be deducted from the sub agreement balance.
133. Back-charge documentation (photos, descriptions) should link to the sub agreement.
134. Back-charge notification to the sub should be tracked.
135. Disputed back-charges should be flagged on the sub agreement.
136. Back-charge history should be visible in the sub's performance profile.

### Sub Agreement → Checklist
137. Sub agreement scope should generate trade-specific quality checklists.
138. Checklist completion should be required before signing off on sub work.
139. Failed checklist items should create documented deficiencies against the sub.
140. Checklists should reference sub agreement specifications and standards.

### Sub Agreement → Schedule
141. Sub agreement start/end dates should align with schedule activities.
142. Schedule changes should trigger notifications to affected subs.
143. Sub agreement milestone payments should link to schedule milestones.
144. Sub performance (ahead/behind schedule) should be tracked against the agreement timeline.

### Sub Agreement → Contact/Company (Sub)
145. Sub agreement should link to the sub's company profile with all contact info.
146. Sub agreement history should be visible in the sub's company profile.
147. Sub performance across all agreements should feed into the sub reliability score.
148. Sub agreement terms should be comparable across projects for the same sub.

### Sub Agreement → Warranty
149. Sub agreement warranty terms should populate warranty tracking.
150. Warranty callback costs should be trackable against the sub agreement.
151. Sub agreement warranty duration should set expiration dates.
152. Warranty performance should feed into the sub's reliability score.

### Sub Agreement → Closeout
153. Sub agreement closeout requirements should generate a closeout checklist.
154. Required closeout documents (warranties, O&M manuals, as-builts) should be tracked.
155. Sub retainage release should be contingent on closeout completion.
156. Closeout document status should be visible from the sub agreement.

---

## SECTION 4: BUDGET / COST CODE → CONNECTIONS

### Budget → Estimate
157. Budget should be initialized from the approved estimate.
158. Estimate line items should map 1:1 to budget cost codes.
159. Budget vs. estimate variance should be trackable at any time.
160. Estimate assumptions should be accessible from budget line items for context.

### Budget → Contract (Owner)
161. Budget total should reconcile with the owner contract amount.
162. Owner contract adjustments (COs) should update the budget.
163. Budget categories should align with the owner contract schedule of values.
164. Contract allowance amounts should be tracked in the budget.

### Budget → Sub Agreement
165. Committed costs in the budget should equal the sum of all sub agreements.
166. New sub agreements should auto-update committed costs in the budget.
167. Sub agreement changes should flow through to budget updates.
168. Uncommitted budget amounts should be visible for each cost code.

### Budget → Purchase Order
169. POs should be committed costs against budget line items.
170. PO issuance should update the committed cost in the budget.
171. PO amounts should not exceed the remaining budget without approval.
172. Open POs should be visible as commitments when viewing the budget.

### Budget → Invoice
173. Invoice coding should map to budget cost codes.
174. Invoice payment should update actual costs in the budget.
175. Miscoded invoices should be flagged when they don't match expected cost codes.
176. Invoice amounts exceeding budget line items should trigger alerts.

### Budget → Change Order (Owner CO)
177. Owner COs should add new budget line items or modify existing ones.
178. CO-adjusted budget should show original + approved changes.
179. Pending COs should show as projected but uncommitted budget adjustments.
180. CO impact on overall budget and margin should be calculated instantly.

### Budget → Allowance
181. Allowance budget amounts should be set from the estimate/contract.
182. Selection costs should be compared to allowance budgets.
183. Allowance overages should generate change orders linked to the budget.
184. Remaining allowance balance should be visible in the budget.

### Budget → Pay Application
185. Pay application amounts should be drawn from budget actuals.
186. Pay application line items should map to budget cost codes.
187. Over/under billing should be calculated from budget vs. pay application data.
188. Pay application progress should be verifiable against budget completion percentages.

### Budget → Schedule
189. Budget burn rate should be correlatable to schedule progress.
190. Schedule delays should trigger budget impact analysis (extended general conditions).
191. Earned value (budget × % complete from schedule) should be calculable.
192. Cost-loaded schedule should show budget distribution over time.

### Budget → Report
193. Budget reports should be auto-generated with current data.
194. Variance reports should show original vs. revised vs. actual.
195. Cash flow forecasts should project from budget and schedule data.
196. Profitability reports should calculate from budget data.

### Budget → Projected Final Cost
197. Projected final cost = actuals + committed + estimated remaining.
198. Open POs, pending COs, and remaining allowances should feed projected final cost.
199. Projected final cost should update in real time as data changes.
200. Projected final cost vs. contract value = projected profit/margin.

---

## SECTION 5: SCHEDULE → CONNECTIONS

### Schedule → Daily Log
201. Daily log should auto-populate with today's scheduled activities.
202. Daily log trade attendance should be compared to scheduled trades.
203. Schedule actual start/finish dates should be updatable from daily log entries.
204. Daily log weather delays should auto-adjust the schedule.
205. Daily log notes should be linkable to specific schedule activities.

### Schedule → Checklist
206. Checklists should be triggered when schedule activities reach certain milestones.
207. Pre-start checklists should be required before marking a task as started.
208. Completion checklists should be required before marking a task as complete.
209. Inspection checklists should be linked to inspection schedule activities.
210. Checklist completion should auto-update schedule task status.

### Schedule → Inspection
211. Inspection activities should be on the schedule with dependencies.
212. Inspection scheduling should auto-notify the building department.
213. Failed inspections should push downstream schedule activities.
214. Inspection prerequisites (checklist completion) should be schedule dependencies.
215. Re-inspection dates should auto-populate on the schedule.

### Schedule → Selection
216. Selection deadlines should be schedule activities with lead time buffers.
217. Late selections should show schedule impact on construction activities.
218. Selection-dependent procurement should have schedule activities.
219. Selection finalization should trigger material ordering schedule tasks.
220. Unresolved selections should be flagged as schedule risks.

### Schedule → Procurement / PO
221. Material ordering dates should be calculated from schedule need dates minus lead times.
222. PO delivery dates should feed into the schedule.
223. Late deliveries should auto-flag schedule impacts.
224. Long-lead item procurement should appear on the pre-construction schedule.
225. Material arrival should be a schedule predecessor for installation activities.

### Schedule → Sub Agreement
226. Sub mobilization dates should come from the schedule.
227. Sub demobilization dates should trigger retainage/final billing timelines.
228. Sub milestone payment dates should be linked to schedule milestones.
229. Schedule changes should auto-notify affected subs.
230. Sub crew availability should be a constraint on schedule activities.

### Schedule → Permit
231. Permit application dates should be schedule activities.
232. Permit approval should be a predecessor for construction start.
233. Permit inspection milestones should be on the schedule.
234. Permit expiration dates should trigger renewal activities on the schedule.
235. Permit conditions should create schedule-linked compliance activities.

### Schedule → Photo/Media
236. Photos should auto-tag with the current schedule phase/activity.
237. Photo documentation should be linked to completed schedule activities.
238. Time-lapse generation should be possible from schedule-milestone photos.
239. Progress photos should be schedulable as recurring activities.
240. Pre-cover photo documentation should be linked to pre-inspection schedule activities.

### Schedule → Weather
241. Weather data should auto-populate on the schedule for historical reference.
242. Weather forecasts should flag potential schedule impacts.
243. Rain days should auto-adjust exterior work schedule activities.
244. Wind speed thresholds should flag crane/elevated work restrictions.
245. Temperature thresholds should flag concrete pour and coating restrictions.

### Schedule → Client Communication
246. Weekly schedule updates should auto-generate for client reports.
247. Milestone completions should trigger client notifications.
248. Schedule changes affecting move-in date should trigger immediate client alerts.
249. Client selection deadlines should generate countdown notifications.
250. Schedule look-aheads should be auto-formatted for client consumption.

### Schedule → Resource Loading
251. Schedule should show which trades/crews are needed when.
252. Resource conflicts across projects should be detectable from schedule data.
253. Equipment needs should be derivable from schedule activities.
254. Temporary facility needs (scaffolding, cranes) should be schedule-driven.
255. Labor histograms should be generatable from the schedule.

---

## SECTION 6: DAILY LOG → CONNECTIONS

### Daily Log → Photo/Media
256. Photos taken on a day should auto-attach to that day's log.
257. Daily log photo requirements should prompt for documentation.
258. Photo GPS data should auto-tag location within the project.
259. Photo metadata (time, location) should populate daily log details.
260. Daily log photo gallery should be browsable by date and area.

### Daily Log → Trade Attendance
261. Scheduled trades should auto-populate the daily log attendance section.
262. Actual attendance (who showed up, headcount) should be logged against scheduled.
263. No-shows should be flagged and linked to the sub's reliability score.
264. Trade hours on site should feed into labor tracking.
265. Trade attendance patterns should be analyzable over time.

### Daily Log → Weather
266. Weather data should auto-populate from weather service APIs.
267. Weather conditions should be linked to work impact notes.
268. Weather delays should be categorized and tracked.
269. Historical weather data should feed into future schedule planning.
270. Weather patterns should inform seasonal scheduling optimization.

### Daily Log → Safety
271. Safety observations should be loggable from the daily log.
272. Safety incidents should be escalated from the daily log to incident reports.
273. Toolbox talk documentation should be linked to daily logs.
274. Safety violations should flag the responsible sub.
275. Daily safety conditions (site cleanliness, fall protection) should be checklistable.

### Daily Log → Budget
276. Daily log T&M work notes should feed into T&M cost tracking.
277. Delivery logs should link to PO receiving and budget updates.
278. Equipment usage logs should feed into equipment cost tracking.
279. Waste/damage documentation should trigger budget impact entries.
280. Extra work documentation should support change order justification.

### Daily Log → Inspection
281. Inspection requests should be initiatable from the daily log.
282. Inspection results should be logged in the daily log.
283. Failed inspection notes should feed into corrective action tracking.
284. Inspector comments should be documented in the daily log.
285. Inspection photos should be linkable to daily log entries.

### Daily Log → RFI
286. Field questions captured in the daily log should be convertible to RFIs.
287. RFIs generated from the daily log should link back to the log entry.
288. Daily log field observations that reveal design issues should prompt RFI creation.
289. Daily log notes about unclear details should suggest RFI creation.
290. RFI responses should be linkable from the daily log for field reference.

### Daily Log → AI Auto-Generation
291. Daily log narratives should be auto-generatable from structured data inputs.
292. Photo analysis should suggest daily log content.
293. Trade attendance and weather should auto-compose daily summaries.
294. Historical daily logs should inform AI-generated forecasts.
295. Daily log patterns should feed into schedule accuracy improvements.

---

## SECTION 7: CHANGE ORDER → CONNECTIONS

### Owner CO → Sub CO
296. Owner COs with sub-impacting scope should auto-prompt sub CO creation.
297. Sub CO costs should auto-populate the owner CO cost breakdown.
298. Builder markup on sub COs should be calculated per the owner contract terms.
299. Owner CO approval should trigger sub CO execution.
300. Owner CO rejection should cancel associated sub COs.

### Owner CO → Budget
301. Approved owner COs should auto-update the project budget.
302. Pending owner COs should show as projected budget adjustments.
303. Owner CO contingency usage should be trackable.
304. CO-adjusted budget should maintain audit trail of all changes.
305. CO impact on profit margin should be calculated and displayed.

### Owner CO → Schedule
306. Owner COs with schedule impact should include time extension.
307. CO-driven schedule changes should be documented and linked.
308. CO approval should trigger schedule updates for new/changed work.
309. Schedule impact of pending COs should be modelable.
310. COs due to delays should document the delay cause and impact.

### Owner CO → Contract (Owner)
311. Owner COs should update the total contract value.
312. Running CO log should be accessible from the owner contract.
313. CO percentage of original contract should be tracked.
314. CO approval chain should follow owner contract terms.
315. CO execution should generate contract amendment documentation.

### Owner CO → Pay Application
316. Approved CO amounts should be added to pay application line items.
317. CO work completed should be billable on the next pay application.
318. CO line items should be separately identifiable on the pay application.
319. Pay application should reflect the CO-adjusted contract value.
320. CO retainage should follow pay application retainage terms.

### Owner CO → Selection
321. Selection upgrades that exceed allowances should generate owner COs.
322. CO pricing should show the allowance credit and upgrade cost.
323. Selection-driven COs should link to the specific selection with images/specs.
324. Client should be able to see CO impact before finalizing selection.
325. Selection downgrades should generate credit COs.

### Owner CO → Drawing
326. Design change COs should link to the revised drawings.
327. CO scope descriptions should reference specific drawing details.
328. Drawing revisions triggered by COs should be tracked.
329. CO pricing should be based on the revised drawing scope.
330. ASIs that result in COs should be linked.

### Owner CO → RFI
331. RFIs that result in scope changes should link to the resulting CO.
332. CO justification should reference the originating RFI.
333. RFI responses that add work should auto-prompt CO creation.
334. CO documentation should include the full RFI thread.
335. RFI-driven COs should be categorized separately for analysis.

### Owner CO → Root Cause Tracking
336. Every CO should be categorized by root cause (design change, field condition, client request, code requirement, error/omission).
337. Root cause data should feed into estimating improvement.
338. Root cause trends should be analyzable by project, architect, trade.
339. Root causes should inform SOW template improvements.
340. Root cause analysis should feed into pre-construction risk assessment.

---

## SECTION 8: INVOICE → CONNECTIONS

### Invoice → PO
341. Invoices should be matchable to POs (3-way match: PO → delivery → invoice).
342. Invoice amounts exceeding PO amounts should be flagged.
343. Partial PO invoicing should track remaining PO balance.
344. PO-based invoices should auto-populate from PO data.
345. Invoice line items should map to PO line items.

### Invoice → Sub Agreement
346. Sub invoices should be validated against remaining sub agreement balance.
347. Invoice % complete should be verifiable against actual field completion.
348. Invoice schedule of values should match sub agreement schedule of values.
349. Over-billing should be detectable by comparing invoiced vs. installed.
350. Invoice cumulative total should not exceed sub agreement value + approved COs.

### Invoice → Budget / Cost Code
351. Invoice line items should be coded to budget cost codes.
352. Invoice coding should update budget actuals upon approval.
353. Miscoded invoices should be flagged based on expected cost code.
354. Invoice amounts should be compared to budget line item remaining balance.
355. AI should suggest cost code classification based on invoice content.

### Invoice → Lien Waiver
356. Invoice payment should require a corresponding lien waiver.
357. Lien waiver amount should match the payment amount.
358. Conditional waivers should be required at invoice approval.
359. Unconditional waivers should be required after payment clears.
360. Missing lien waivers should block payment processing.

### Invoice → Pay Application
361. Approved invoices should feed into the pay application calculation.
362. Invoiced amounts should match what's billed on the pay application.
363. Stored materials invoiced but not installed should appear on pay applications.
364. Pay application preparation should show all approved invoices for the period.
365. Pay application vs. invoiced amounts should be reconcilable.

### Invoice → AI Processing
366. Invoice PDFs should be auto-parsed for key data (vendor, amount, date, description).
367. AI should auto-suggest cost code classification.
368. AI should flag duplicate invoices across projects.
369. AI should identify unusual pricing compared to historical data.
370. AI should match invoice vendor to existing vendor database.
371. AI should extract line item details for PO matching.
372. AI should flag invoices that don't match contracted rates.
373. AI should identify missing tax calculations.
374. AI should detect potential fraud patterns.
375. AI should suggest approval routing based on amount and trade.

### Invoice → Retainage
376. Retainage should auto-calculate from invoice amounts per contract terms.
377. Retainage withheld should be tracked as a liability.
378. Retainage invoices should be separate from progress invoices.
379. Retainage release should require closeout completion.
380. Retainage balance should be visible from the invoice history.

---

## SECTION 9: PAY APPLICATION (AIA) → CONNECTIONS

### Pay Application → Budget
381. Pay application should pull current budget data for line items.
382. Pay application % complete should be verifiable against budget actuals.
383. Pay application should show original contract, changes, revised contract, and work to date.
384. Over/under billing should be calculated from pay application vs. budget data.
385. Pay application stored materials should be tracked in the budget.

### Pay Application → Schedule
386. Pay application % complete should correlate with schedule % complete.
387. Schedule milestones should trigger pay application preparation.
388. Lender may require schedule documentation with pay applications.
389. Pay application timing should be on the project schedule.
390. Schedule-based earned value should inform pay application amounts.

### Pay Application → Lien Waiver
391. All sub/vendor lien waivers should be collected before submitting pay application.
392. Lien waiver package should accompany the pay application to the lender.
393. Missing lien waivers should block pay application submission.
394. Lien waiver amounts should reconcile with pay application amounts.
395. Owner lien waiver should be generated with the pay application.

### Pay Application → Inspection / Progress Photo
396. Lender may require inspection report with pay application.
397. Progress photos should accompany pay application as completion evidence.
398. Third-party inspection (if required) should be linked to pay application.
399. Pay application photos should be date-stamped and geotagged.
400. Pay application should include a progress narrative with supporting documentation.

### Pay Application → Contract (Owner)
401. Pay application should reference the owner contract number and terms.
402. Pay application retainage should follow owner contract retainage terms.
403. Pay application cumulative amounts should not exceed contract value + approved COs.
404. Pay application should show the contract balance remaining after the draw.
405. Final pay application should reconcile all contract amounts.

### Pay Application → Lender Requirements
406. Pay application format should match lender requirements.
407. Required supporting documentation should be packaged per lender specs.
408. Draw schedule should align with lender's disbursement schedule.
409. Lender's inspection approval should be tracked against pay applications.
410. Pay application submission deadlines should be on the schedule.

---

## SECTION 10: SELECTION → CONNECTIONS

### Selection → Allowance
411. Each selection should compare to its allowance budget.
412. Selection cost exceeding allowance should auto-calculate the overage.
413. Allowance overage should trigger a change order or client notification.
414. Allowance credit (under-budget selection) should show as a credit.
415. Running allowance balance should update as selections are made.

### Selection → SOW
416. Selection specifications should update the relevant SOW.
417. Selection lead times should inform SOW scheduling.
418. Selection installation requirements should update SOW details.
419. Selection changes after SOW issuance should trigger SOW revisions.
420. SOW should reference approved selections for trade reference.

### Selection → Schedule
421. Selection deadlines should be on the schedule with lead time buffers.
422. Late selections should show schedule impact on related activities.
423. Selection procurement lead times should create schedule activities.
424. Selection delivery dates should be schedule predecessors for installation.
425. Selection deadline countdown should be visible to clients and PMs.

### Selection → PO
426. Finalized selections should generate purchase orders.
427. PO specifications should match the approved selection.
428. Selection changes after PO issuance should trigger PO revisions.
429. Selection delivery tracking should be linked to the PO.
430. Selection returns/exchanges should generate PO modifications.

### Selection → Submittal
431. Selections requiring architect approval should generate submittals.
432. Submittal approval should confirm the selection before procurement.
433. Rejected submittals should re-open the selection for revision.
434. Submittal data sheets should be linked to the selection record.
435. Approved submittals should auto-update selection status to "confirmed."

### Selection → Photo/Media
436. Selection options should include product images for client comparison.
437. Installed selections should be documented with photos.
438. Selection mood boards from the designer should be linked.
439. As-installed photos should be compared to selection specifications.
440. Selection images should be browsable by room and category.

### Selection → Client Portal
441. Selections should be viewable and manageable from the client portal.
442. Selection status (pending, selected, approved, ordered, installed) should be visible.
443. Selection comparison features should allow side-by-side evaluation.
444. Selection cost impact should be transparent to the client.
445. Selection history and reasoning should be documented.

### Selection → Interior Designer
446. Designer should be able to submit selections through the system.
447. Designer's specifications should auto-populate selection records.
448. Designer should see allowance budgets when recommending selections.
449. Designer mood boards should link to specific selections.
450. Designer should be notified when selections need attention.

### Selection → Budget
451. Selection costs should update budget allowance line items.
452. Allowance overages should show as budget adjustments.
453. Total selection impact on budget should be summarizable.
454. Selection pricing should be verifiable against vendor quotes.
455. Selection changes should recalculate budget impact.

---

## SECTION 11: CHECKLIST → CONNECTIONS

### Checklist → SOW
456. Checklists should be auto-generated from SOW specifications.
457. Checklist acceptance criteria should reference SOW requirements.
458. Checklist items should be mappable to SOW line items.
459. Completed checklists should inform SOW completion percentage.
460. Checklist failures should create SOW-linked deficiency items.

### Checklist → Schedule
461. Checklist completion should be a predecessor for schedule milestones.
462. Pre-inspection checklists should be linked to inspection schedule activities.
463. Phase transition checklists should be required before phase advancement.
464. Checklist due dates should align with schedule activity dates.
465. Overdue checklists should flag schedule activities as at risk.

### Checklist → Inspection
466. Pre-inspection checklists should be completed before calling for inspection.
467. Checklist items should align with inspection criteria.
468. Inspection results should inform checklist improvements.
469. Custom checklists should be createable for unique inspection requirements.
470. Checklist sign-off should document who verified and when.

### Checklist → Punch List
471. Failed checklist items should auto-generate punch list entries.
472. Punch list items should reference the failed checklist item.
473. Punch list resolution should update the checklist status.
474. Recurring checklist failures should trigger process improvement flags.
475. Pre-closeout checklists should generate final punch list items.

### Checklist → Sub Agreement
476. Sub-specific checklists should reference sub agreement scope.
477. Checklist failures should be documented against the sub for performance tracking.
478. Sub sign-off on checklists should be captured for documentation.
479. Checklist results should feed into sub reliability scoring.
480. Sub warranty checklists should be linked to the sub agreement warranty terms.

### Checklist → Photo/Media
481. Checklists should require photos for critical verification items.
482. Photo evidence should be attached to specific checklist line items.
483. Before/after photos should be capturable within the checklist workflow.
484. Geotagged photos should verify checklist items were inspected at the right location.
485. Photo-required checklist items should block completion without photos.

### Checklist → Template
486. Checklist templates should be createable from successful project checklists.
487. Templates should be versionable and improvable based on lessons learned.
488. Templates should auto-populate based on project type and trade.
489. Template customization should be allowed per project without affecting the master.
490. Template effectiveness should be measurable by downstream punch list rates.

### Checklist → Code / Regulatory
491. Code-required checklist items should reference specific code sections.
492. Jurisdiction-specific checklists should auto-adjust based on project location.
493. Code changes should trigger checklist template updates.
494. Coastal-specific checklist items should auto-include for coastal projects.
495. Energy code checklists should link to HERS rater requirements.

---

## SECTION 12: INSPECTION → CONNECTIONS

### Inspection → Permit
496. Inspections should be linked to the permit that requires them.
497. Permit inspection sequence should be enforced (foundation before framing, etc.).
498. Inspection results should update permit status.
499. Final inspection should be a prerequisite for certificate of occupancy.
500. Inspection requirements should auto-populate from the permit type.

### Inspection → Schedule
501. Inspection dates should be on the construction schedule.
502. Inspection results should update schedule status (pass = continue, fail = rework).
503. Re-inspection should auto-add to the schedule with appropriate dependencies.
504. Inspection lead time (scheduling with the building department) should be a schedule constraint.
505. Inspection milestones should be linked to pay application timing.

### Inspection → Photo
506. Pre-inspection photos should document readiness.
507. Inspection failure photos should document deficiencies.
508. Inspector comments should be capturable alongside photos.
509. Photo documentation should prove what was inspected before cover-up.
510. Inspection photo requirements should be checklist-driven.

### Inspection → Checklist
511. Pre-inspection checklists should be completed before scheduling inspection.
512. Inspection checklists should include all items the inspector will verify.
513. Checklist completion status should determine inspection readiness.
514. Failed inspection items should feed back into the checklist for corrective action.
515. Inspection-specific checklists should be auto-populated by inspection type.

### Inspection → Sub / Trade
516. Inspection failures should be attributed to the responsible trade.
517. Sub should be notified of inspection results affecting their work.
518. Corrective action from failed inspections should be assigned to the responsible sub.
519. Inspection pass rate should be tracked per sub for reliability scoring.
520. Sub re-work costs from failed inspections should be documentable as back-charges.

### Inspection → Daily Log
521. Inspection scheduling should appear on the daily log.
522. Inspection results should be recorded in the daily log.
523. Inspector name and comments should be documented.
524. Re-inspection scheduling should be noted in the daily log.
525. Inspection-related delays should be logged with reason codes.

---

## SECTION 13: PUNCH LIST → CONNECTIONS

### Punch List → Sub Agreement
526. Punch list items should be assigned to the responsible sub.
527. Punch list completion should be required before sub final payment.
528. Punch list costs (if sub is non-responsive) should be back-chargeable.
529. Sub punch list performance should feed into reliability scoring.
530. Punch list item scope should reference the sub agreement scope.

### Punch List → Photo
531. Punch list items should require a deficiency photo.
532. Punch list resolution should require a completion photo.
533. Before/after photo comparison should be viewable per punch item.
534. Punch list photos should be geotagged and room/location tagged.
535. Client-generated punch items (from walk-through) should allow photo upload.

### Punch List → Checklist
536. Punch list items should trace back to the checklist item that identified them.
537. Punch list patterns should inform checklist improvements.
538. Final walk-through checklists should generate punch list items.
539. Punch list resolution verification should be a checklist activity.
540. Punch list item categories should align with checklist categories.

### Punch List → Schedule
541. Punch list completion should be a predecessor for substantial completion milestone.
542. Punch list work should be schedulable with trade assignments and dates.
543. Punch list completion progress should be trackable against the schedule.
544. Client walk-through for punch list generation should be a schedule activity.
545. Punch list resolution deadline should be on the schedule.

### Punch List → Warranty
546. Punch list items found after substantial completion may become warranty items.
547. The distinction between punch and warranty should be definable by date/milestone.
548. Unresolved punch items should auto-transition to warranty items after a threshold.
549. Punch list item documentation should be accessible during warranty review.
550. Punch list patterns should inform warranty reserve calculations.

### Punch List → Client Portal
551. Clients should be able to submit punch list items with photos.
552. Punch list status should be visible to clients.
553. Completed punch list items should show before/after evidence.
554. Client should be able to confirm punch list resolution.
555. Punch list items should be filterable by room, trade, status, and priority.

### Punch List → Budget
556. Punch list costs (third-party repairs) should be trackable in the budget.
557. Back-charges for punch list work should flow to the budget.
558. Punch list cost trends should feed into future project contingency planning.
559. Excessive punch list costs should be flagged as a project risk.
560. Punch list labor costs should be allocable to responsible cost codes.

### Punch List → Closeout
561. Punch list completion should be a prerequisite for closeout.
562. Punch list resolution documentation should be part of the closeout package.
563. Outstanding punch items should block closeout milestone completion.
564. Punch list sign-off should be part of the closeout checklist.
565. Punch list history should be archived in the closeout package.

---

## SECTION 14: DRAWING → CONNECTIONS

### Drawing → Every Other Entity
566. Drawings should be linkable from SOWs for trade reference.
567. Drawing revisions should flag affected SOWs, RFIs, submittals, and POs.
568. Drawing sheets should be taggable by trade/discipline.
569. Drawing mark-ups should be saveable and shareable.
570. Drawing comparisons (overlay revisions) should highlight changes.
571. Current drawing set should always be accessible from the field.
572. Drawing distribution should be trackable (who received which revision).
573. Drawing details should be referenceable from checklists and inspections.
574. Drawing notes and callouts should be searchable.
575. As-built drawings should be generated from construction documentation.

### Drawing → RFI
576. RFIs should reference specific drawing sheets and details.
577. RFI responses should annotate the drawing with clarifications.
578. Drawing revisions from RFIs should be tracked.
579. RFI mark-ups should be viewable as a layer on the drawing.
580. Multiple RFIs on the same drawing area should be visible together.

### Drawing → Submittal
581. Submittals should reference the drawing specification they satisfy.
582. Approved submittals should be linked to the drawing specification.
583. Drawing spec changes should trigger submittal re-review.
584. Submittal product dimensions should be verifiable against drawing dimensions.
585. Submittal schedules should be generatable from drawing specifications.

### Drawing → Material Takeoff
586. Takeoff quantities should reference specific drawing sheets.
587. Drawing revisions should flag takeoffs for re-measurement.
588. Takeoff measurements should be overlayable on drawings.
589. Drawing scale should be verifiable for takeoff accuracy.
590. Takeoff quantities should be traceable to drawing details.

---

## SECTION 15: CONTACT / COMPANY → CONNECTIONS

### Contact → Everything
591. Contacts should link to all projects they're involved in.
592. Contact roles should determine their access permissions.
593. Contact performance history should aggregate across all projects.
594. Contact insurance/license status should be visible company-wide.
595. Contact communication history should be accessible from any project.
596. Contact payment history should be trackable across projects.
597. Contact reliability score should calculate from multiple data points.
598. Contact specializations should inform bid package routing.
599. Contact availability should be visible during scheduling.
600. Contact preference data should inform vendor selection.

### Sub Contact Reliability Score Inputs
601. On-time schedule performance across projects.
602. Punch list item frequency and resolution speed.
603. Warranty callback frequency and response time.
604. Invoice accuracy and documentation completeness.
605. Safety record (incidents, violations).
606. Communication responsiveness.
607. Quality checklist pass rates.
608. Change order frequency (sub-initiated).
609. Crew size and consistency.
610. Insurance/compliance maintenance.

---

## SECTION 16: PERMIT → CONNECTIONS

### Permit → Everything Affected
611. Permit should link to the project and be trackable on the dashboard.
612. Permit conditions should create compliance tracking items.
613. Permit inspections should feed the inspection schedule.
614. Permit expiration should trigger renewal alerts.
615. Permit fees should be tracked in the budget.
616. Permit application should be a schedule predecessor for construction start.
617. Permit drawings should link to the approved plan set.
618. Permit revision requirements should trigger drawing updates.
619. Permit status should be visible to all project stakeholders.
620. Permit history should be part of the closeout package.
621. Multiple permits (building, electrical, plumbing, mechanical) should be independently tracked.
622. Permit jurisdiction requirements should drive checklist content.
623. Permit conditions specific to coastal/flood zone should be separately tracked.
624. Trade permits pulled by subs should be tracked under the project.
625. Permit close-out (final inspection + CO) should be a project milestone.

---

## SECTION 17: WARRANTY → HOME CARE CONNECTIONS

### Warranty → Home Care
626. Warranty expiration should trigger transition to paid home care services.
627. Warranty item documentation should be accessible in home care records.
628. Home care maintenance should prevent warranty-voiding conditions.
629. Home care inspections should identify warranty-eligible items.
630. Home care contact database should include warranty trade contacts.

### Warranty → Sub
631. Warranty items should be routable to the responsible sub.
632. Sub warranty response time should be tracked.
633. Warranty costs covered by the sub should be documented.
634. Warranty costs absorbed by the builder should be trackable.
635. Sub warranty performance should affect future project awards.

### Warranty → Budget
636. Warranty reserves should be included in project budgets.
637. Actual warranty costs should be tracked against reserves.
638. Warranty cost trends should inform future project pricing.
639. Warranty costs by trade should identify systemic issues.
640. Warranty budget impact should be included in true project profitability.

### Home Care → Client Portal
641. Maintenance schedule should be visible to the homeowner.
642. Service request submission should be available in the client portal.
643. Service history should be documented and viewable.
644. Upcoming maintenance should generate reminders.
645. Home system specifications should be accessible for homeowner reference.

### Home Care → Home Manual
646. Home manual should include all system specifications from construction.
647. Maintenance intervals should be populated from manufacturer recommendations.
648. Paint colors, fixture models, and finish details should carry from selections.
649. Trade contact information should be accessible for service needs.
650. As-built drawings should be accessible from the home manual.

---

## SECTION 18: ESTIMATE → PROJECT LIFECYCLE CONNECTIONS

### Estimate → Proposal
651. Estimate should generate client-facing proposals with appropriate detail.
652. Proposal line items should map to estimate cost codes.
653. Proposal allowances should come from estimate allowance items.
654. Proposal options should come from estimate alternates.
655. Proposal updates should reflect estimate revisions.

### Estimate → Contract (Owner)
656. Approved proposal/estimate should become the owner contract basis.
657. Contract schedule of values should map to estimate categories.
658. Contract allowances should match estimate allowance amounts.
659. Contract exclusions should come from estimate exclusions.
660. Estimate assumptions should be documented in contract exhibits.

### Estimate → Budget
661. Estimate should initialize the project budget.
662. Estimate detail should set budget line item amounts.
663. Estimate vs. budget variance should be trackable throughout the project.
664. Estimate accuracy should be measurable at project completion.
665. Estimate improvement should be data-driven from budget actuals.

### Estimate → Bid Package
666. Estimate line items should generate bid package scopes.
667. Estimate quantities should be included in bid packages for pricing.
668. Estimate assumptions should be documented in bid package notes.
669. Bid results should be comparable to estimate assumptions.
670. Estimate adjustments based on bid results should be trackable.

### Estimate → Historical Data
671. Completed project actuals should feed the historical cost database.
672. Historical cost per SF should inform new estimates.
673. Historical waste factors should calibrate material quantities.
674. Historical durations should inform schedule estimates.
675. Historical change order rates should inform contingency pricing.
676. Historical sub pricing should benchmark new bid evaluations.
677. Historical allowance usage should calibrate future allowance amounts.
678. Historical permit timelines should inform schedule estimates.
679. Historical punch list rates should inform quality planning.
680. Historical warranty costs should inform warranty reserve pricing.

---

## SECTION 19: LEAD/PROSPECT → PROJECT LIFECYCLE

### Lead → Estimate
681. Lead qualification data should inform preliminary budget ranges.
682. Prospect's lot/site data should feed site-specific cost factors.
683. Prospect's design preferences should inform finish level assumptions.
684. Lead conversion should seamlessly create the estimate from prospect data.
685. Lead-stage budget discussions should be documentable.

### Lead → Project
686. Lead conversion should create the project with all prospect data pre-populated.
687. Prospect communication history should carry into the project.
688. Prospect's design aspirations should be documented for the project team.
689. Lead source should be tracked for marketing ROI analysis.
690. Referral credit should be linked to the referring past client.

### Lead → Contact
691. Prospect contact information should feed the contact database.
692. Prospect's architect/designer should be identified and linked.
693. Prospect's lender should be linked for future coordination.
694. Prospect's realtor should be linked for commission tracking.
695. Prospect family members/decision makers should be documented.

### Lead → Sales Pipeline
696. Lead status should be trackable through pipeline stages.
697. Pipeline value should be calculable from preliminary budgets.
698. Win/loss data should inform sales improvement.
699. Pipeline velocity should be measurable.
700. Lead engagement scoring should prioritize follow-up efforts.

---

## SECTION 20: REPORT / ANALYTICS → DATA SOURCES

### Reports Should Pull From:
701. Budget data → Financial reports, cost reports, profitability reports.
702. Schedule data → Progress reports, delay analysis, earned value.
703. Daily log data → Activity reports, weather impact analysis.
704. Invoice data → AP aging, vendor spend analysis, payment cycle reports.
705. Pay application data → Draw history, over/under billing analysis.
706. Change order data → CO trending, root cause analysis, CO rate reports.
707. Punch list data → Quality reports, trade performance, deficiency trends.
708. Sub data → Reliability scoring, spend analysis, availability reports.
709. Selection data → Allowance tracking, decision status, lead time reports.
710. Inspection data → Pass/fail rates, compliance reports.
711. Photo data → Progress documentation, visual timeline.
712. RFI data → Response time analysis, issue trending.
713. Safety data → Incident reports, compliance tracking.
714. Permit data → Status tracking, timeline analysis.
715. Warranty data → Cost analysis, trade performance, issue trending.

### Cross-Project Analytics
716. Portfolio financial dashboard → All project budgets, margins, cash flow.
717. Resource utilization → Trade/PM workload across projects.
718. Estimating accuracy → Estimate vs. actual across completed projects.
719. Trade performance ranking → Reliability scores across all projects.
720. Material cost trending → Price changes over time across all purchases.
721. Schedule performance → Average duration by phase across projects.
722. Change order analysis → Rates and causes across projects.
723. Punch list analysis → Deficiency rates by trade across projects.
724. Client satisfaction → Scores and trends across projects.
725. Warranty cost analysis → Costs by trade and system across projects.

---

## SECTION 21: NOTIFICATION / ALERT CONNECTIONS

### Notifications Triggered By:
726. Budget threshold exceeded on any cost code.
727. Invoice submitted awaiting approval.
728. Invoice overdue for payment.
729. Change order submitted awaiting approval.
730. Change order approved — ready for execution.
731. Selection deadline approaching (7 days, 3 days, overdue).
732. Schedule activity delayed beyond threshold.
733. Inspection scheduled — preparation needed.
734. Inspection failed — corrective action required.
735. Sub insurance expiring within 30 days.
736. Permit expiring — renewal needed.
737. Punch list item assigned.
738. Punch list item overdue.
739. RFI submitted — response needed.
740. RFI response received — review needed.
741. Submittal submitted — review needed.
742. Submittal rejected — resubmission required.
743. Drawing revision published — review needed.
744. Pay application prepared — review and approval needed.
745. Lien waiver missing — payment blocked.
746. Daily log not submitted by end of day.
747. Weather alert affecting scheduled work.
748. Client message received — response needed.
749. Warranty claim submitted — assignment needed.
750. Milestone completed — client notification.
751. Sub no-show — follow-up needed.
752. Material delivery expected today.
753. Material delivery delayed.
754. Contract not yet executed — follow-up needed.
755. Retainage release conditions met.
756. Project projected to exceed budget threshold.
757. Cash flow forecast shows funding gap.
758. Safety incident reported — investigation needed.
759. Closeout document missing — follow-up needed.
760. Client approval needed on pending items.

### Notification Routing Rules:
761. Amount-based routing (COs over $X go to owner, under to PM).
762. Role-based routing (inspections to super, financials to admin).
763. Escalation routing (unacknowledged after X hours goes to next level).
764. Client notifications should be simplified and jargon-free.
765. Sub notifications should include only their scope-relevant items.
766. Architect notifications for design-related items only.
767. Designer notifications for selection-related items only.
768. Lender notifications for draw-related items only.
769. Owner/principal notifications for high-level KPIs and exceptions only.
770. Notification channel preferences (email, SMS, push, in-app) per user.

---

## SECTION 22: TEMPLATE → REUSABILITY CONNECTIONS

### Template Types and What They Generate:
771. SOW templates → New project SOWs by trade.
772. Checklist templates → Phase/trade/inspection checklists.
773. Schedule templates → Project schedules by type and size.
774. Estimate templates → Preliminary budgets by project characteristics.
775. Contract templates → Owner and sub agreements.
776. Bid package templates → Trade-specific bid solicitations.
777. Report templates → Standard report formats.
778. Email/letter templates → Client communications, sub notifications.
779. Meeting agenda templates → Pre-con, weekly, design, closeout meetings.
780. Closeout templates → Required closeout documentation checklists.
781. Punch list category templates → Standard deficiency categories.
782. Home manual templates → Standard owner turnover documents.
783. Home care templates → Maintenance schedules by system type.
784. Daily log templates → Standard daily log format.
785. Safety plan templates → Site-specific safety plans.

### Template Improvement Loop:
786. Completed project data should be analyzed to improve templates.
787. Change order root causes should improve SOW templates (scope gaps).
788. Punch list patterns should improve checklist templates.
789. Schedule variances should improve schedule templates.
790. Estimating accuracy data should improve estimate templates.
791. RFI patterns should improve drawing and specification templates.
792. Warranty issues should improve quality checklist templates.
793. Sub performance data should improve bid evaluation templates.
794. Client feedback should improve communication templates.
795. Best practices from top-performing PMs should standardize templates.

---

## SECTION 23: COMPLETE WORKFLOW CHAINS

These are end-to-end process chains where every step should connect to the next.

### Chain 1: Estimate to Final Cost
796. Estimate → Proposal → Owner Contract → Budget → Cost Tracking → Projected Final Cost → Actual Final Cost → Historical Database → Next Estimate.
797. At every step, the data should flow forward without manual re-entry.
798. Variance should be calculable between any two points in the chain.
799. The chain should be auditable — who changed what and when.
800. Any break in the chain should be detectable and flaggable.

### Chain 2: SOW to Payment
801. SOW → Bid Package → Sub Bid → Sub Agreement → Work Performance → Invoice → Approval → Lien Waiver → Payment → Budget Update → Pay Application.
802. Each step should auto-trigger or prompt the next.
803. Missing steps should block progression (no payment without lien waiver).
804. Financial data should flow through every step without re-entry.
805. The chain should be visible as a status dashboard per sub.

### Chain 3: Drawing to Installation
806. Drawing → SOW Reference → Bid Package → Sub Agreement Scope → Submittal → Approval → PO → Delivery → Checklist Verification → Installation → Inspection → Sign-off.
807. Drawing revisions should cascade through the chain (re-price, re-submit, re-order).
808. Drawing-to-installation traceability should be complete.
809. Any deviation from drawing intent should be documentable.
810. As-built should capture the final installed condition vs. drawing.

### Chain 4: Selection to Installation
811. Allowance Definition → Client Selection → Designer Spec → Budget Impact → CO (if over allowance) → Submittal → Approval → PO → Lead Time Tracking → Delivery → Storage → Installation → Checklist → Photo Documentation.
812. Selection status should be trackable at every step.
813. Bottlenecks in the chain should be identifiable (awaiting client, awaiting approval, awaiting delivery).
814. Schedule impact of each step should be visible.
815. Cost impact should be traceable from allowance to final installed cost.

### Chain 5: Issue to Resolution
816. Field Observation → Daily Log Note → RFI (if design question) OR Punch Item (if deficiency) OR Safety Report (if hazard) → Assignment → Response/Resolution → Documentation → Closeout → Lessons Learned → Template Improvement.
817. Issue type should determine the workflow path.
818. Issue escalation should be automatic if unresolved within threshold.
819. Issue resolution should be documented with evidence.
820. Issue patterns should feed into prevention strategies.

### Chain 6: Lead to Home Care
821. Lead Capture → Qualification → Preliminary Budget → Design → Estimate → Proposal → Contract → Pre-Construction → Construction → Selections → Punch List → Closeout → Warranty → Home Care → Referral → Next Lead.
822. Client data should flow seamlessly through the entire lifecycle.
823. No client information should need to be re-entered at any stage.
824. Client portal access should evolve with the project phase.
825. Post-completion relationship should be maintained through home care.

### Chain 7: Daily Log to Earned Value
826. Daily Log (activities, trades, progress) → Schedule Update → % Complete → Budget Earned Value → Cost Performance Index → Schedule Performance Index → Project Health Dashboard.
827. Daily log entries should auto-feed schedule progress.
828. Progress percentages should auto-calculate earned value.
829. Earned value metrics should auto-generate project health indicators.
830. Health indicators should trigger appropriate notifications.

### Chain 8: Safety Incident to Resolution
831. Incident Observation → Immediate Documentation → Notification to Management → Investigation → Root Cause Analysis → Corrective Action → Follow-up Verification → OSHA Reporting (if required) → Lessons Learned → Safety Plan Update.
832. Incident severity should determine notification routing.
833. Required documentation should be enforced by the workflow.
834. Corrective actions should be assigned and tracked to completion.
835. Incident data should improve safety planning for future projects.

### Chain 9: Permit to Certificate of Occupancy
836. Permit Application → Review Period → Conditions → Revision (if needed) → Permit Issuance → Construction → Required Inspections (sequential) → Re-inspections (if needed) → Final Inspection → CO Application → CO Issuance.
837. Each step should be on the schedule with dependencies.
838. Missing inspections should block subsequent inspections.
839. Permit conditions should be tracked throughout construction.
840. CO issuance should trigger closeout and turnover workflows.

### Chain 10: Invoice Processing Complete Chain
841. Invoice Received → AI Data Extraction → Cost Code Suggestion → PO Matching → Amount Verification → Compliance Check (insurance, lien waiver) → PM Approval → Admin Processing → Payment Scheduling → Check/ACH Generation → Lien Waiver Collection → Budget Update → Pay Application Feed.
842. Each step should log who did what and when.
843. Exceptions at any step should route for manual review.
844. Processing time should be measurable for efficiency tracking.
845. The entire chain should be completable in under 5 minutes for a standard invoice.

---

## SECTION 24: DATA FLOW DIAGRAMS (Conceptual)

### Financial Data Flow
846. Estimate creates → Budget line items.
847. Budget line items receive → Sub agreements (committed costs).
848. Budget line items receive → POs (committed costs).
849. Budget line items receive → Invoices (actual costs).
850. Budget actuals feed → Pay application preparation.
851. Pay application generates → Owner draw request.
852. Owner draw funds → Vendor/sub payments.
853. Payments generate → Lien waiver requirements.
854. All financial data feeds → Projected final cost.
855. Projected final cost vs. contract = → Projected profit/margin.
856. Actual final cost feeds → Historical cost database.
857. Historical database improves → Future estimates.

### Schedule Data Flow
858. Estimate durations create → Schedule template.
859. Schedule template receives → Project-specific adjustments.
860. Schedule activities receive → Trade confirmations.
861. Daily log entries update → Schedule actual progress.
862. Schedule progress feeds → Earned value calculations.
863. Schedule delays trigger → Notification cascade.
864. Schedule milestones trigger → Pay application timing.
865. Schedule completion feeds → Client communication.
866. Actual durations feed → Historical duration database.
867. Historical durations improve → Future schedule templates.

### Quality Data Flow
868. SOW specifications create → Quality checklists.
869. Checklists are completed during → Construction activities.
870. Checklist failures create → Punch list items.
871. Punch list items assign to → Responsible trades.
872. Punch list resolution requires → Photo documentation.
873. Completed punch lists enable → Closeout milestones.
874. Post-closeout issues become → Warranty items.
875. Warranty items route to → Responsible trades.
876. Quality data feeds → Sub reliability scoring.
877. Reliability scores inform → Future trade selection.

### Communication Data Flow
878. System events generate → Notifications.
879. Notifications route to → Appropriate recipients by role.
880. Recipient actions generate → System updates.
881. System updates trigger → Downstream notifications.
882. All communications log → Audit trail.
883. Communication patterns inform → Process improvements.
884. Client communications feed → Satisfaction tracking.
885. Sub communications feed → Reliability scoring.
886. Architect communications feed → Design coordination tracking.
887. Internal communications feed → Team performance metrics.

---

## SECTION 25: CROSS-ENTITY SEARCH & QUERY CONNECTIONS

### Natural Language Query Paths
888. "Show me everything related to the framing trade on the Smith project" → SOW + Sub Agreement + Invoices + Schedule Activities + Daily Logs + Checklists + Punch Items + RFIs + Submittals + Photos.
889. "What's the financial status of the Johnson project?" → Budget + Invoices + POs + Pay Applications + Change Orders + Allowances + Projected Final Cost.
890. "Is ABC Plumbing reliable?" → All projects they've worked on + Schedule adherence + Punch list items + Warranty callbacks + Invoice accuracy + Safety record.
891. "What selection decisions are pending across all projects?" → All open selections + Deadlines + Allowance balances + Schedule impacts.
892. "Show me all coastal compliance items for the beach house" → Permits + Inspections + Checklists + Elevation data + Flood zone requirements + Impact-rated product submittals.
893. "What's driving our change orders?" → CO root cause analysis + Architect correlation + Trade correlation + Project type correlation.
894. "How are our PMs performing?" → Budget variance by PM + Schedule variance by PM + Client satisfaction by PM + CO rates by PM + Punch list rates by PM.
895. "What do we owe and when?" → AP aging + Open POs + Scheduled payments + Retainage balances + Upcoming draws.
896. "What happened on site this week?" → Daily logs + Photos + Inspections + Deliveries + Trade attendance + Weather + Issues.
897. "Is this project ready for closeout?" → Punch list status + Inspection status + Closeout document checklist + Lien waiver status + Retainage status + Warranty setup.

---

## SECTION 26: PERMISSION & VISIBILITY CONNECTIONS

### Who Sees What:
898. Client sees → Budget summary (not detailed cost codes), selections, schedule milestones, photos, change orders, pay application summary, punch list items, their communications.
899. PM sees → Everything on their projects.
900. Admin sees → All financials across all projects, invoices, pay apps, lien waivers, insurance.
901. Owner/Principal sees → Portfolio dashboard, project summaries, KPIs, exceptions, approvals.
902. Superintendent sees → Daily log, schedule, checklists, inspections, drawings, photos, trade contacts.
903. Architect sees → Drawings, RFIs, submittals, schedule (milestones only), site observation reports, COs affecting design.
904. Interior Designer sees → Selections, allowances, schedule (selection deadlines), photos, specifications.
905. Engineer sees → Drawings, RFIs, submittals, inspections (structural), special inspection reports.
906. Sub sees → Their scope, schedule, drawings (their sheets), POs, invoices, payment status, punch items, change orders (their scope), submittals (their scope).
907. Lender sees → Pay applications, progress photos, inspection reports, budget summary, schedule summary, insurance, lien waivers.

### Permission-Based Data Filtering:
908. Each entity should be viewable only by authorized roles.
909. Sensitive financial data (margins, markups) should be hidden from clients and subs.
910. Sub-specific views should filter to only their scope.
911. Client views should use simplified terminology.
912. External users should only see approved/published data.
913. Draft documents should be internal-only until published.
914. Comments/notes should have visibility flags (internal vs. external).
915. Historical data access should be maintained for project participants.
916. Data export should respect permission levels.
917. Audit trails should be accessible to admins and owners only.

---

## SECTION 27: MOBILE / FIELD-SPECIFIC CONNECTIONS

### Field Actions That Update Office Systems:
918. Photo capture → Auto-tags with project, date, GPS, phase; feeds daily log and progress tracking.
919. Checklist completion → Updates schedule, triggers next activity, notifies PM.
920. Daily log entry → Updates schedule progress, triggers client report, logs trade attendance.
921. Punch list creation → Assigns to sub, adds to schedule, notifies PM and sub.
922. Inspection result → Updates schedule, triggers next steps, notifies PM.
923. Material receipt → Updates PO status, verifies quantities, logs delivery in daily log.
924. Safety observation → Creates safety record, notifies safety manager, updates site log.
925. Time entry → Updates labor tracking, feeds cost allocation.
926. RFI from field → Routes to architect/engineer, logs in project, links to drawing.
927. Voice note → Transcribed by AI, added to daily log or action items.

### Office Actions That Push to Field:
928. Schedule change → Notifies field team and affected trades.
929. Drawing revision → Pushes to field with change highlights.
930. RFI response → Notifies field team with answer.
931. PO issued → Notifies field for expected delivery.
932. Inspection scheduled → Notifies super with prep checklist.
933. Client selection made → Notifies PM and relevant trade.
934. Change order approved → Notifies field team of scope change.
935. Weather alert → Notifies field team of potential impact.
936. Safety alert → Pushes to all field personnel.
937. New sub mobilizing → Notifies super with contact info and scope.

---

## SECTION 28: AI-POWERED CONNECTION INTELLIGENCE

### AI Should Automatically:
938. Detect when an invoice doesn't match any open PO and suggest creating one.
939. Identify when a SOW scope gap exists based on drawing analysis.
940. Flag when a sub's pricing is significantly above/below historical norms.
941. Predict schedule delays based on weather forecast and outdoor activity dependencies.
942. Suggest checklist items based on code requirements for the jurisdiction.
943. Identify duplicate data entry across systems.
944. Recommend optimal trade sequencing based on past project performance.
945. Flag when a selection lead time threatens the construction schedule.
946. Predict change order likelihood based on project characteristics.
947. Identify cost code misclassifications based on description patterns.
948. Suggest budget adjustments based on actual spending trends.
949. Generate daily log summaries from photo timestamps and trade attendance data.
950. Identify punch list patterns that indicate systemic quality issues.
951. Predict warranty callback likelihood by system and trade.
952. Recommend procurement timing based on price trend analysis.
953. Flag when a project's burn rate indicates budget overrun.
954. Identify when sub insurance will lapse and pre-generate renewal requests.
955. Suggest RFI responses based on similar past RFIs.
956. Predict client satisfaction risk based on communication patterns and project metrics.
957. Identify when a template should be updated based on recurring issues.

---

## SECTION 29: CLOSEOUT & TURNOVER CONNECTION CHAIN

### Closeout Package Should Contain (Auto-Assembled):
958. Final budget reconciliation → from budget data.
959. All approved change orders → from CO records.
960. All lien waivers (final, unconditional) → from lien waiver tracking.
961. Certificate of occupancy → from permit records.
962. All inspection reports → from inspection records.
963. Warranty documents from all trades → from sub agreements and submittals.
964. O&M manuals for all systems → from submittal records.
965. As-built drawings → from drawing management.
966. Selection specifications by room → from selection records.
967. Paint colors and finishes → from selection records.
968. Appliance manuals and serial numbers → from selection/submittal records.
969. Landscape plan → from drawing management.
970. Survey and elevation certificate → from permit/compliance records.
971. Insurance certificates → from insurance tracking.
972. Final photos → from photo documentation.
973. Emergency contact list → from contact database.
974. Home systems overview → from SOW and submittal data.
975. Maintenance schedule → from manufacturer recommendations in submittals.

### Closeout → Home Care Transition:
976. Closeout substantial completion date → Sets warranty start dates.
977. Closeout system inventory → Creates home care asset list.
978. Closeout trade contacts → Populates home care vendor database.
979. Closeout maintenance recommendations → Creates home care schedule.
980. Closeout selection data → Creates home specification database.
981. Closeout as-builts → Provides reference for future home care work.
982. Closeout photos → Establishes baseline condition documentation.
983. Closeout client satisfaction → Informs home care service approach.

---

## SECTION 30: FEEDBACK LOOPS & CONTINUOUS IMPROVEMENT

### Data That Should Feed Back Into the System:

984. Actual project costs → Estimate template improvement.
985. Actual durations → Schedule template improvement.
986. Change order root causes → SOW template improvement.
987. Punch list patterns → Checklist template improvement.
988. RFI patterns → Drawing/spec clarity improvement.
989. Sub performance → Trade selection improvement.
990. Client feedback → Process improvement.
991. Warranty issues → Quality checklist improvement.
992. Safety incidents → Safety plan improvement.
993. Invoice processing errors → AI model improvement.
994. Budget variances → Estimating accuracy improvement.
995. Schedule variances → Scheduling accuracy improvement.
996. Material waste data → Takeoff accuracy improvement.
997. Allowance usage → Allowance setting improvement.
998. Permit timelines → Schedule planning improvement.
999. Weather delay patterns → Weather buffer improvement.
1000. Communication response times → Notification tuning improvement.

---

## SECTION 31: INTEGRATION CONNECTIONS (External Systems)

### System-to-System Data Flow:
1001. Platform → QuickBooks: Invoices, payments, cost codes, vendor info.
1002. QuickBooks → Platform: Payment confirmations, bank reconciliation.
1003. Platform → Google Drive: Document storage, backup, sharing.
1004. Google Drive → Platform: Drawing uploads, spec documents.
1005. Platform → Email: Notifications, transmittals, correspondence.
1006. Email → Platform: Inbound communications, sub responses.
1007. Platform → Calendar: Meeting schedules, inspection dates, deadlines.
1008. Calendar → Platform: Availability data, scheduling conflicts.
1009. Platform → Weather API: Current conditions, forecasts.
1010. Weather API → Platform: Daily log weather, schedule impact alerts.
1011. Platform → Vendor Portals: POs, pricing requests.
1012. Vendor Portals → Platform: Order confirmations, pricing, availability.
1013. Platform → Permit Portal: Application submission, status checks.
1014. Permit Portal → Platform: Status updates, inspection results.
1015. Platform → E-Signature (DocuSign/etc.): Contracts, COs, approvals.
1016. E-Signature → Platform: Signed document status, completed signatures.
1017. Platform → SMS/Text: Urgent notifications, trade confirmations.
1018. SMS → Platform: Responses, confirmations.
1019. Platform → Bank/Lender Portal: Pay applications, draw requests.
1020. Bank/Lender → Platform: Draw approvals, funding confirmations.

---

## SECTION 32: MISSING CONNECTION DETECTION

### The System Should Flag When:
1021. A budget line item has no committed cost (no sub agreement or PO).
1022. A sub agreement has no associated schedule activities.
1023. A schedule activity has no associated checklist.
1024. A SOW has no associated bid package.
1025. A selection deadline has passed with no selection made.
1026. An inspection is scheduled but the pre-inspection checklist isn't complete.
1027. An invoice references a cost code that doesn't exist in the budget.
1028. A sub has no current insurance certificate on file.
1029. A drawing revision has been issued but affected trades haven't acknowledged it.
1030. A pay application includes amounts for work not verified by schedule progress.
1031. A change order is approved but the budget hasn't been updated.
1032. A PO has been issued but no delivery is scheduled.
1033. A submittal is required but hasn't been submitted.
1034. A lien waiver is missing for a completed payment.
1035. A punch list item has been open longer than the defined threshold.
1036. A closeout document is missing from the required checklist.
1037. A warranty period has expired without a final inspection.
1038. A sub has completed work but hasn't submitted an invoice.
1039. A schedule milestone has passed but the associated pay application hasn't been generated.
1040. An allowance has been fully spent but selections aren't all complete.

---

## SECTION 33: CASCADING IMPACT CONNECTIONS

### When X Changes, What Else Must Update:

1041. **Drawing revision** → Affected SOWs flagged → Affected bid packages re-issued → Affected sub agreements reviewed for scope change → Affected submittals re-reviewed → Affected POs checked → Schedule activities reviewed → RFIs checked for impact → Checklists updated.

1042. **Sub agreement value change** → Budget committed cost updated → Projected final cost recalculated → Margin recalculated → Pay application line item updated → Cash flow forecast updated.

1043. **Schedule delay** → Downstream activities shifted → Critical path recalculated → Milestone dates updated → Client notified → Trades notified → Pay application timing adjusted → General conditions cost recalculated → Selection deadlines adjusted → Inspection dates adjusted.

1044. **Selection change** → Allowance recalculated → CO generated (if over allowance) → Budget updated → SOW updated → PO revised or canceled → Delivery schedule updated → Construction schedule adjusted → Submittal re-submitted → Checklist updated.

1045. **Client scope change request** → CO drafted → Budget impact calculated → Schedule impact calculated → Sub CO created → Drawings revised (if needed) → SOW updated → Checklist updated → All affected parties notified.

1046. **Failed inspection** → Punch items created → Sub notified → Schedule activities added for rework → Re-inspection scheduled → Budget impact assessed → Daily log updated → Client notified (if schedule impact).

1047. **Invoice approval** → Budget actuals updated → Projected final cost recalculated → Payment scheduled → Lien waiver required → Pay application data updated → Cash flow updated → Vendor payment history updated.

1048. **Sub insurance expiration** → Payment blocked → Sub notified → PM alerted → Project risk flagged → Invoice processing paused → Future scheduling flagged.

1049. **Weather delay** → Schedule activities adjusted → Trades notified → Daily log updated → General conditions cost impact → Client updated → Inspection dates moved → Pay application timing adjusted.

1050. **Permit condition added** → Checklist items created → Schedule activities created → Budget impact assessed → Responsible party assigned → Compliance tracking initiated → Inspection requirements updated.

---

## CONNECTION SUMMARY STATISTICS

| Category | Connection Count |
|----------|-----------------|
| SOW Connections | 78 |
| Bid Package Connections | 17 |
| Sub Agreement Connections | 65 |
| Budget/Cost Code Connections | 44 |
| Schedule Connections | 58 |
| Daily Log Connections | 35 |
| Change Order Connections | 45 |
| Invoice Connections | 35 |
| Pay Application Connections | 30 |
| Selection Connections | 45 |
| Checklist Connections | 35 |
| Inspection Connections | 25 |
| Punch List Connections | 35 |
| Drawing Connections | 25 |
| Contact/Company Connections | 20 |
| Permit Connections | 15 |
| Warranty/Home Care Connections | 25 |
| Estimate Connections | 20 |
| Lead/Prospect Connections | 15 |
| Reports/Analytics Connections | 25 |
| Notifications Connections | 45 |
| Templates Connections | 25 |
| Workflow Chains | 50 |
| Data Flow Connections | 40 |
| Permission Connections | 20 |
| Mobile/Field Connections | 20 |
| AI Intelligence Connections | 20 |
| Closeout Connections | 28 |
| Feedback Loops | 17 |
| Integration Connections | 20 |
| Missing Connection Detection | 20 |
| Cascading Impact Connections | 10 |
| **TOTAL** | **~1,050** |

---

## HOW TO USE THIS DOCUMENT

### For Development Prioritization:
- Cross-reference each connection with the Pain Points document to identify which connections solve the most problems.
- Connections in **Workflow Chains** (Section 23) represent the highest-impact integration points — these are the ones users experience as broken workflows.

### For Architecture Design:
- Each connection represents a data relationship that needs to exist in the database schema.
- Cascading impacts (Section 33) represent event-driven automation requirements.
- Missing Connection Detection (Section 32) represents validation rules.

### For QA/Testing:
- Every connection should have a test case.
- Cascading impacts should have integration tests.
- Missing connection detection should have automated monitoring.

### For Feature Validation:
For each connection, ask:
| Status | Meaning |
|--------|---------|
| ✅ Connected | Data flows between these entities |
| 🟡 Manual | Connection exists but requires manual steps |
| ❌ Disconnected | No connection — data silo |
| 🔄 One-way | Data flows one direction but should be bidirectional |
