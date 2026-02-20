# Weekly Progress Report – MindX Training Week 04 Project

**Timeframe**: Week 4 (18/02/2026 – 20/02/2026)  
**Author**: Nguyen Ngoc Lan  
**Mentors**: Trinh Van Thuan, Tran Thi Thanh Duyen

---

## Overall Progress Overview

| Task | Description | Status | Completion Time |
| ---- | ----------- | ------ | --------------- |
| Task 1 | Scenario 01: Login Issue (Standard) | Completed | Tuesday (18/02) |
| Task 2 | Scenario 02: Performance Problem (Priority) | Completed | Tuesday (18/02) |
| Task 3 | Scenario 03: Critical Bug (Expedite) | Completed | Wednesday (19/02) |
| Task 4 | Scenario 04: Feature Request (Standard) | Completed | Wednesday (19/02) |
| Task 5 | Scenario 05: Multi-User Issue (Priority) | Completed | Thursday (20/02) |
| Task 6 | Scenario 06: Fixed Deadline Request (Fixed Deadline) | Completed | Thursday (20/02) |

**Result**: Completed 100% of requirements within the deadline (T+3)

---

## Week 4 Acceptance Criteria

- [v] Complete 6 practice scenarios (01-06) in Odoo Helpdesk
- [v] Apply MindX 7-Step Process correctly across all scenarios
- [v] Classify tickets by Class of Service accurately (Standard / Priority / Expedite / Fixed Deadline)
- [v] Demonstrate timely acknowledgement and initial response (< 30 minutes) for all scenarios
- [v] Write professional email drafts for each scenario (ACK / update / resolution / closure)
- [v] Create and update Odoo tickets correctly with proper tags and documentation
- [v] Make proper escalation decisions with full technical context
- [v] Document patterns and reflections per scenario

---

## Detailed Timeline

### **Tuesday (18/02)** – Scenarios 01 & 02: Foundation Level

**Activities**:
* Completed Odoo account setup and Helpdesk configuration (team, stages, tags, customers)
* Executed Scenario 01: Login Issue – Standard classification, 10-minute resolution
* Executed Scenario 02: Performance Problem – Priority classification, 30-minute resolution with Dev Team escalation

**Scenario 01 – Login Issue (Standard):**
* Ticket #00002 created for teacher login failure affecting 1 user
* Class of Service: Standard (< 5 users, non-blocking)
* ACK email sent within 5 minutes
* Investigation completed, password reset applied, user confirmed resolved
* Total resolution time: ~10 minutes
* Key learning: Distinction between Log Notes (internal) and Send Messages (external)

**Scenario 02 – Performance Problem (Priority):**
* Ticket #00003 created for LMS slowdown affecting 15 students in live class
* Class of Service: Priority (5-25 users, blocking active class)
* ACK email with workaround (incognito, email submission) sent within 10 minutes
* Investigation via Azure App Insights: database connection pool at 85%, slow queries identified
* Escalated to Dev Team with full monitoring context
* Dev Team applied query optimization, response time restored to < 3 seconds
* Total resolution time: ~30 minutes
* Key learning: Escalation quality matters more than escalation speed

**Duration**: 1 day (2 scenarios completed)

---

### **Wednesday (19/02)** – Scenarios 03 & 04: Intermediate Level

**Activities**:
* Executed Scenario 03: Critical Bug – Expedite classification, 35-minute resolution with parallel stakeholder management
* Executed Scenario 04: Feature Request – Standard classification, product team forwarding with expectation management

**Scenario 03 – Critical Bug (Expedite):**
* Ticket #00004 created for exam submission system completely down affecting 53 students across 3 classes
* Class of Service: Expedite (> 25 users, critical function 100% down)
* Three parallel actions initiated simultaneously: ACK to CXO, Manager notification, Dev Team alert
* Workaround provided immediately: submit exams via support email
* Investigation via Azure App Insights: database connection pool exhaustion, exception rate 100%, root cause linked to recent deployment
* Dev Team rolled back misconfigured deployment, submission system restored in 15 minutes
* Verified fix across all 3 affected classes (WEB102-HN, DATA101-SG, MOBILE201-HN) before notifying customer
* Email submissions processed separately and tracked to closure
* Total resolution time: ~35 minutes
* Key learning: Expedite requires elimination of sequential thinking – everything runs in parallel

**Scenario 04 – Feature Request (Standard):**
* Ticket #00005 created for CXO feature request (auto PDF progress report + weekly parent email)
* Class of Service: Standard (single user, no urgency, no system impact)
* Recognized as feature request, not a support issue – different handler and different timeline
* ACK email sent acknowledging suggestion value, explaining Product Team evaluation process
* Forwarded to Product Team with full context: feature details, business value, user profile, suggested priority
* Product Team response: technically feasible, added to Q2 backlog, 2 other campuses with similar requests
* Customer updated with evaluation results, no timeline committed
* Ticket closed after Support role completed (forwarded + customer informed + expectation set)
* Key learning: "Not now" communicated well is better than a vague promise

**Duration**: 1 day (2 scenarios completed)

---

### **Thursday (20/02)** – Scenarios 05 & 06: Advanced Level

**Activities**:
* Executed Scenario 05: Multi-User Issue – Priority classification, multi-ticket consolidation, 45-minute resolution
* Executed Scenario 06: Fixed Deadline Request – Fixed Deadline classification, scope clarification workflow, 20-hour execution with 15-hour buffer

**Scenario 05 – Multi-User Issue (Priority):**
* 3 tickets received within 20 minutes (#00006, #00007, #00008) reporting same video playback issue
* Main ticket #00008 created, duplicate tickets #00006 and #00007 closed with cross-reference
* Class of Service: Priority (12 users, blocking lesson content during class)
* Pattern recognized: failure consistent across multi-device + multi-network = server-side issue
* Investigation: Lesson 3 API returning 403 Forbidden on videoAssetId VID-ADV-L3-001, Lessons 1/2/4 unaffected
* Root cause hypothesis: signed URL expired or incorrect permission after content re-upload
* Escalated to Dev/Content Ops with exact asset ID and error code
* Workaround communicated: study Lesson 4 first, return to Lesson 3 after fix
* Dev/Content Ops confirmed: signed URL expired + incorrect permission, new URL generated, permissions corrected
* All 12 students confirmed able to watch Lesson 3, workaround students returned to Lesson 3
* Total resolution time: ~45 minutes
* Key learning: Ticket consolidation saves time for everyone – one investigation instead of three

**Scenario 06 – Fixed Deadline Request (Fixed Deadline):**
* Ticket #00009 created for Director enrollment report request with hard deadline 09:00 AM Day 3
* Class of Service: Fixed Deadline (time-driven, Director-level business impact)
* Scope assessed as AMBIGUOUS – did not commit to timeline before clarification
* ACK email sent with 6 clarifying questions: time period, campus scope, program scope, data fields, output format, breakdown definition
* Director responded with full scope: January 2025, all campuses, all programs, Excel format, breakdown by course name
* Additional requests noted: trend comparison December vs January, top 5 courses
* Scope proposal sent with MVP (guaranteed) + Nice-to-have (best effort) structure
* Data access approval requested from VP/Manager in parallel: enrollment DB (read-only) + revenue DB (aggregate only), no PII
* Both approvals received: Director confirmed scope, VP/Manager approved data access
* Work started Day 2 morning, Day 1 end-of-day progress update sent, Day 2 2:00 PM core report update sent
* Report delivered 6:00 PM Day 2 exactly as committed: 1,250 students, 3.2 billion VND revenue, all campuses and programs, both enhancements completed
* Director confirmed: report ready for meeting, satisfaction HIGH
* Total execution time: 20 hours (of 35 hours available), 15-hour buffer maintained
* Key learning: Fixed Deadline does not mean rush blindly – clarify scope, propose MVP, get approvals, deliver with buffer

**Duration**: 1 day (2 scenarios completed)

---

## Metrics Summary

### Ticket Handling Performance

| Scenario | CoS | ACK Time | Resolution Time | Escalation | Outcome |
| -------- | --- | -------- | --------------- | ---------- | ------- |
| 01 Login Issue | Standard | < 5 min | ~10 min | None | Resolved |
| 02 Performance Problem | Priority | < 10 min | ~30 min | Dev Team | Resolved |
| 03 Critical Bug | Expedite | < 5 min | ~35 min | Dev Team + Manager | Resolved |
| 04 Feature Request | Standard | < 10 min | Same session | Product Team | Forwarded + Closed |
| 05 Multi-User Issue | Priority | < 15 min | ~45 min | Dev/Content Ops | Resolved |
| 06 Fixed Deadline | Fixed Deadline | < 10 min | 20 hours | VP/Manager (approval) | Delivered on time |

### MindX 7-Step Process Compliance

| Step | Applied Consistently |
| ---- | ------------------- |
| 1. Reception (Log ticket < 15 min) | [v] All 6 scenarios |
| 2. Initial Response (ACK < 30 min) | [v] All 6 scenarios |
| 3. Diagnosis (Investigation documented) | [v] All 6 scenarios |
| 4. Resolution (Fix or workaround) | [v] All 6 scenarios |
| 5. Communication (Regular updates) | [v] All 6 scenarios |
| 6. Follow-up (Customer confirmation) | [v] All 6 scenarios |
| 7. Trend Analysis (Pattern documented) | [v] All 6 scenarios |

### Class of Service Application

| CoS | Scenarios | Correct Classification |
| --- | --------- | ---------------------- |
| Standard | 01, 04 | [v] Both correct |
| Priority | 02, 05 | [v] Both correct |
| Expedite | 03 | [v] Correct |
| Fixed Deadline | 06 | [v] Correct |

---

## Key Skills Demonstrated

### Odoo Proficiency
* Ticket creation with all required fields, tags, and priority settings
* Stage management across full lifecycle (New → In Progress → Waiting → Resolved → Closed)
* Log Notes for internal documentation, Send Messages for external communication
* Multi-ticket consolidation and cross-referencing (Scenario 05)

### Escalation Quality
* Escalated to Dev Team with monitoring data, error codes, asset IDs, scope assessment, and root cause hypothesis (Scenarios 02, 03, 05)
* Escalated to Manager in parallel with customer ACK during Expedite incident (Scenario 03)
* Requested data access approval from VP/Manager with specific access conditions documented (Scenario 06)
* All escalations provided receiving team with full context, not assumptions

### Professional Communication
* Total emails sent across all scenarios: 30+ (ACK, investigation updates, escalation notices, resolution, follow-up, closure)
* Vietnamese language used appropriately for Director-level communication (Scenario 06)
* Workarounds provided immediately in ACK before investigation completed (Scenarios 02, 03, 05)
* No over-promises made in any scenario regarding timeline or feature delivery

### Expectation Management
* Feature request: explained evaluation process, committed to no timeline (Scenario 04)
* Fixed Deadline: clarified scope before committing, proposed MVP + nice-to-have structure (Scenario 06)
* Priority incidents: set explicit update cadence (15 minutes) in ACK email (Scenarios 02, 05)
* Expedite: immediate workaround + 10-minute update cadence (Scenario 03)

---

## Observations & Patterns Identified

**Pattern 1: Deployment-related outages (Scenario 03)**
* Exam submission failure caused by database connection pool misconfiguration introduced in deployment
* Recommendation: Add mandatory post-deployment smoke tests for critical functions (exam submission, login, assignment upload) before marking deployment complete

**Pattern 2: Video asset permission issues after content re-upload (Scenario 05)**
* Signed URL expiry and incorrect permission settings after content re-upload cause lesson video failures
* Recommendation: Dev/Content Ops to implement post-upload verification checklist (signed URL validity, permission check, end-to-end playback test)

**Pattern 3: Director report requests without defined scope (Scenario 06)**
* Report requests from Director level consistently lack specific scope definition (time period, metrics, format)
* Recommendation: Create standard enrollment report template and data access pre-approval protocol to reduce turnaround time for recurring requests

**Pattern 4: Workaround effectiveness (All Priority/Expedite scenarios)**
* Specific, actionable workarounds (email submission, skip to Lesson 4, incognito mode) consistently reduced customer anxiety during resolution window
* Workarounds that kept users productive were more effective than generic "please wait" responses

---

**Prepared by**: Nguyen Ngoc Lan  
**Date**: 20/02/2026  
**Status**: Week 4 Completed – Pending Mentor Review  
**Mentors**: Trinh Van Thuan, Tran Thi Thanh Duyen