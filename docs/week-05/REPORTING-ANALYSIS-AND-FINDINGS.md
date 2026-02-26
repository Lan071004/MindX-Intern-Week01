# Week 5 – Reporting, Analysis & Findings

**Author:** Nguyen Ngoc Lan
**Date:** 2026-02-26
**Data Source:** Odoo Helpdesk – Week 4 Ticket Data ([Helpdesk Ticket (helpdesk.ticket).xlsx](./Helpdesk%20Ticket%20(helpdesk.ticket).xlsx))
**Total Tickets Analyzed:** 8 

---

## 1. Odoo Reports

### 1.1 Daily Ticket Summary Report
**Group by: Stage**
![Report group by Stage](../images/week5-results/report-group%20by-stage.png)
All 8 tickets from Week 4 have been resolved and closed (Closed).

---

### 1.2 Team Performance Report
**Group by: Assigned to**
![Report group by Assigned to](../images/week5-results/report-group%20by-assign-to.png)
All tickets in Week 4 were handled by a single agent — Nguyen Ngoc Lan.

---

### 1.3 Category Analysis Report
**Group by: Tags**
![Report group by Tags](../images/week5-results/report-group%20by-tags.png)

**LMS is the most frequent category** with 7 tickets.
Tags `video` and `lesson-3` each appear 3 times — indicating a recurring video playback issue.

---

### 1.4 Ticket Volume Trends
**Group by: Create Date (by Day)**
![Report group by Create Date](../images/week5-results/report-group%20by-created-date.png)

Ticket volume increased steadily over the week — Day 3 (Feb 20) had double the tickets compared to Day 1 (Feb 18).

**Trend interpretation:**
- **Feb 18 (Day 1):** Low volume — week started normally.
- **Feb 19 (Day 2):** Volume begins rising — LMS performance issue and login issue appear.
- **Feb 20 (Day 3):** Spike — LMS exam system outage (50+ users) triggers urgent escalation; ad-hoc report request adds pressure & Video playback duplicate tickets accumulate as 3 separate users report the same issue without awareness of each other.

**Systemic vs. one-time classification:**

| Ticket | Type | Rationale |
|---|---|---|
| 00004 – LMS Exam Down | Systemic | Infrastructure instability; no monitoring in place |
| 00003 – LMS Performance | Systemic | Same root infrastructure, recurring risk |
| 00006, 00007, 00008 – Video | Systemic | Duplicate pattern from missing incident broadcast |
| 00002 – Login/Deactivation | Systemic | Triggered monthly by auto-deactivation rule |
| 00009 – Ad-hoc Report | Systemic | Recurs every time management needs data on short notice |
| 00005 – Feature Request | One-time (but signals gap) | Single request, but represents broader automation deficit |

---

## 2. Pattern Analysis

### Recurring Issue #1: Video Playback – Duplicate Tickets (3 tickets – 37%)

| Field | Details |
|---|---|
| Tickets | 00006, 00007, 00008 |
| Priority | 1 High (00008), 2 Medium (00006, 00007) |
| Customers | CXO2 (00008), Nguyễn Thị Hà (00007), Nguyễn Văn A (00006) |
| Users affected | 12 users (ticket 00008) + 2 individual = **14 total** |
| Time spent (est.) | ~1.5 hrs (avg 30 min/ticket) |

**What repeats:** Three tickets filed within the same week, all reporting the identical symptom — Lesson 3 video in class JS-ADV-HN-2412 not loading. Ticket subjects: *"Video bài 3 không chạy – Lớp Advanced JS"*, *"Lesson 3 JS-ADV-HN-2412 loading mãi không xem được"*, *"Video Playback Issue – Lesson 3 Advanced JS (JS-ADV-HN-2412) – 12 users"*.

**Root cause (actual):** The video hosting/CDN for Lesson 3 of JS-ADV-HN-2412 experienced a playback failure. The underlying technical cause (broken CDN link, corrupted file, or hosting outage) was not documented in the ticket data — this needs investigation by the dev/content team. The **contributing process failure** is the absence of an incident notification system: each user discovered the bug independently, assumed it was personal, and filed a separate ticket. There was no broadcast to inform other students.

**Evidence:** All 3 ticket subjects reference the same class code (JS-ADV-HN-2412) and the same lesson (Lesson 3/Bài 3). Ticket 00008 alone reports 12 users affected, confirming this was a shared infrastructure issue, not individual user error.

**Contributing factors:**
- No status page or in-app alert system to broadcast known incidents
- No ticket deduplication or linking mechanism in Odoo workflow
- Students have no way to check if an issue is already being handled

---

### Recurring Issue #2: LMS System Instability (2 tickets – 25%)

| Field | Details |
|---|---|
| Tickets | 00003, 00004 |
| Priority | Urgent (00004), High (00003) |
| Customers | Lê Ngọc A (00004), Nguyễn Thị Hà (00003) |
| Users affected | 50+ students (exam submission), 15 students (performance) = **65+ total** |
| Time spent (est.) | ~2 hrs (avg 60 min/ticket) |

**What repeats / what's systemic:** Two distinct but related LMS failures occurring in the same week — an exam submission outage (00004, Urgent) and a class performance degradation for WEB101-HN-2024 (00003, High). Both affect the same underlying LMS infrastructure and were reported by different users with no connection between tickets.

**Root cause (actual):** LMS infrastructure is under-provisioned or unstable under concurrent user load. The exam submission system going down (ticket 00004) is the most critical symptom — this is not a UI bug but a backend service failure. The performance degradation in ticket 00003 suggests the same server is struggling under load from multiple simultaneous classes.

**Evidence:** Ticket 00004 subject explicitly states "50+ users affected" and is marked Urgent — indicating a production-level outage, not a minor issue. Ticket 00003 affects 15 users in a single class (WEB101-HN-2024), filed separately with no awareness of ticket 00004.

**Contributing factors:**
- No infrastructure monitoring or alerting (outage detected only when users complained)
- No runbook or incident response procedure for LMS outages
- No load testing or capacity planning documentation

**Business impact:** 50+ students unable to submit exam during active session — risk of grade disputes, student complaints, and loss of trust in the platform. Each minute of downtime during exam hours has direct academic and reputational consequences.

---

### Recurring Issue #3: Login / Account Deactivation (1 ticket – 13%)

| Field | Details |
|---|---|
| Tickets | 00002 |
| Priority | Medium |
| Customer | Nguyễn Văn A (Teacher) |
| Users affected | 1 teacher (this occurrence) |
| Time spent (est.) | ~7 min |

**What repeats / what's systemic:** Although only 1 ticket appeared in Week 4, this issue recurs monthly by design — the MindX LMS auto-deactivation rule disables any account inactive for 30 days. A different teacher will trigger this every month without intervention.

**Root cause (actual):** MindX LMS's default user deactivation rule is configured to fire after 30 days of inactivity, with no warning notification sent beforehand. Teachers who teach in cycles (e.g., not assigned to an active class for a month) are deactivated automatically. The account requires manual reactivation by an admin each time.

**Evidence:** Ticket subject: *"Login Issue – Teacher Nguyễn Văn A – LMS Access"*. Root cause confirmed via MindX LMS settings — the auto-deactivation rule is active and does not have a pre-warning email configured.

**Contributing factors:**
- No pre-deactivation warning email sent to user (7-day or 3-day notice)
- No admin alert when a teacher account is deactivated
- Reactivation requires manual admin action — no self-service recovery
- Ticket requires agent time even though the resolution is always the same (reactivate account)

**Business impact:** Teacher loses access without warning — cannot prepare or deliver class. If unresolved before class time, students are affected downstream.

**→ Selected for automation implementation (Days 3–4).** Automation handles 80%+ of cases: detect login-failure ticket → verify account status in HR/Odoo → reactivate automatically → notify user.

---

### Recurring Issue #4: Ad-hoc Reporting Under Deadline (1 ticket – 13%)

| Field | Details |
|---|---|
| Tickets | 00009 |
| Priority | High |
| Customer | Mr. Director |
| Users affected | Director (decision-making) |
| Time spent (est.) | ~2 hrs |

**What repeats / what's systemic:** This ticket type recurs whenever management needs enrollment or performance data on short notice. The subject — *"Fixed Deadline – Enrollment Report for Director Meeting (Due 09:00 Day 3)"* — shows this is a deadline-driven, reactive request, not a planned workflow.

**Root cause (actual):** No scheduled reporting pipeline exists. Enrollment and class performance metrics are stored in Odoo/LMS but are not automatically compiled and delivered to stakeholders. When a Director meeting is called, the only way to get data is to file a support ticket and have the agent manually extract, format, and deliver the report.

**Evidence:** Ticket 00009 is marked High priority with an explicit hard deadline (09:00 Day 3). The agent spent ~2 hours on a task that could be pre-automated. This is the most time-consuming single ticket in the dataset relative to its recurrence value.

**Contributing factors:**
- No scheduled report exports configured in Odoo
- No dashboard or self-service reporting for management
- Agent time consumed by data formatting, not problem-solving

**Business impact:** Director meeting delayed or held without current data if ticket is not resolved on time. Agent productivity blocked for 2 hours on non-technical, repetitive work.

---

### Recurring Issue #5: Feature Request – Automation Gap (1 ticket – 13%)

| Field | Details |
|---|---|
| Tickets | 00005 |
| Priority | Medium |
| Customer | CXO |
| Users affected | CXO + parents (indirect) |
| Time spent (est.) | ~1 hr (scoping/handoff) |

**What's systemic:** This ticket is a one-time request but signals a broader pattern — manual processes that should be automated are generating support demand. Subject: *"Feature Request – Auto PDF Progress Report & Weekly Parent Email"*. The CXO is requesting a workflow that doesn't exist yet, meaning parent communication is currently handled manually or not at all.

**Root cause (actual):** No automation roadmap exists for student progress reporting. Parent communication is a manual or ad-hoc process. The absence of this feature means the CXO must escalate to helpdesk rather than configuring it self-service.

**Evidence:** Ticket filed by CXO (C-level), indicating the gap is significant enough to escalate formally. Similar requests will recur as the organization grows and expects more automated communication.

**Contributing factors:**
- No product backlog for recurring automation requests
- Feature requests enter helpdesk instead of a product management channel
- No self-service automation tools for non-technical stakeholders

---

## 3. Top 5 Recurring Issues – Impact Summary

| # | Issue | Tickets | Users Affected | Time Spent | Business Impact |
|---|---|---|---|---|---|
| 1 | Video Playback – Duplicate Tickets | 3 (37%) | 14+ | ~1.5 hrs | Students blocked from course content; 2 of 3 tickets fully preventable |
| 2 | LMS System Instability | 2 (25%) | 65+ | ~2 hrs | Exam submission failure for 50+ students — direct academic & reputational risk |
| 3 | Login / Account Deactivation | 1 (13%) | 1 teacher/month | ~7 min | Teacher loses LMS access without warning; downstream class disruption |
| 4 | Ad-hoc Reporting Under Deadline | 1 (13%) | Director | ~2 hrs | Decision meetings held without data; 2 hrs agent time on non-technical work |
| 5 | Feature Request – Automation Gap | 1 (13%) | CXO + parents | ~1 hr | Manual parent communication; C-level time wasted on avoidable escalation |
| | **Total** | **8** | **80+** | **~6.6 hrs** | |

---

## 4. Key Findings

1. **37% of tickets are duplicates** (00006, 00007, 00008) — a single incident broadcast would have prevented 2 of 3 tickets; the underlying video CDN/hosting failure still needs investigation by the dev team
2. **LMS instability affected 65+ users** across 2 tickets — the highest impact issue by user count; exam submission failure carries direct academic risk and represents a production-level outage with no monitoring in place
3. **Login Issue** was selected for automation (Days 3–4) — triggers monthly via Odoo auto-deactivation rule, resolution is always identical (reactivate account), automation handles 80%+ of cases
4. **Ticket volume increased day over day** — spike on Day 3 driven by LMS exam outage; the trend is not random but caused by compounding systemic failures that proactive monitoring would have caught earlier
5. **All 8 tickets are systemic or recurring** — none are isolated one-off events; every issue has an identifiable process or infrastructure gap as its root cause

---

## 5. Recommendations & Action Plan

### 5.1 Recommendations by Issue

| # | Issue | True Root Cause | Solution Options | Recommended Solution | Expected Impact |
|---|---|---|---|---|---|
| 1 | Video Playback – Duplicate Tickets | Video CDN/hosting failure for JS-ADV-HN-2412 Lesson 3 + no incident broadcast mechanism | **Option A:** Investigate and fix video hosting issue + implement status banner. **Option B:** Fix video hosting only (no broadcast). **Option C:** Broadcast only (does not fix underlying failure). | **Option A** — Fix root cause AND implement in-app incident broadcast. Link duplicate tickets to single parent incident in Odoo. | Eliminate duplicate tickets (~67% reduction); reduce student frustration |
| 2 | LMS System Instability | Backend service instability under concurrent user load; no monitoring or incident response procedure | **Option A:** Set up uptime monitoring + alert + escalation runbook. **Option B:** Monitoring only (no runbook). **Option C:** Runbook only (reactive, not proactive). | **Option A** — Deploy monitoring (UptimeRobot or equivalent) + create incident runbook with escalation path to dev team. | Detect outages before users report them; reduce resolution time from hours to minutes |
| 3 | Login / Account Deactivation | Odoo auto-deactivation rule fires after 30 days inactivity; no pre-warning email; reactivation is always manual | **Option A:** Automation workflow (detect → reactivate → notify) + pre-warning email. **Option B:** Automation only. **Option C:** Pre-warning email only (no automation). | **Option A (selected)** — Implement automation for immediate resolution + request dev team to add 7-day pre-deactivation warning. | 80%+ cases resolved without agent; teachers warned before losing access |
| 4 | Ad-hoc Reporting Under Deadline | No scheduled reporting pipeline; no management dashboard; manual extraction required per request | **Option A:** Scheduled automated report delivery + self-service dashboard. **Option B:** Scheduled delivery only (no dashboard). **Option C:** Dashboard only (management must pull data themselves). | **Option B** — Schedule weekly/monthly automated Odoo exports delivered to Director and CXO by email. Upgrade to Option A (dashboard) if demand increases. | Eliminate reactive, deadline-driven report tickets; free ~2 hrs/occurrence of agent time |
| 5 | Feature Request – Automation Gap | No automation roadmap; feature requests enter helpdesk instead of product backlog | **Option A:** Create formal product backlog + redirect future requests + scope PDF report feature. **Option B:** Scope and build requested feature only. **Option C:** Redirect requests to backlog only (no action on feature). | **Option A** — Create automation backlog, redirect future feature requests out of helpdesk, and scope PDF progress report as first backlog item. | Reduce feature-request tickets from helpdesk; give CXO a clear channel for automation needs |

---

### 5.2 Prioritized Action Plan

| Priority | Action | Owner | Timeline | Status |
|---|---|---|---|---|
| High | Implement automation workflow for Login / Account Deactivation | Operating Engineer | Days 3–4 (this week) | In Progress |
| High | Investigate and fix video CDN/hosting failure for JS-ADV-HN-2412 Lesson 3 | Dev / Content Team | Week 6 | Proposed |
| High | Deploy LMS uptime monitoring + create incident response runbook | Dev / Infra Team | Week 6 | Proposed |
| Medium | Implement in-app incident broadcast mechanism (status banner) | Dev Team | Week 6–7 | Proposed |
| Medium | Schedule automated enrollment & performance report delivery to Director/CXO | Data / Ops Team | Week 6–7 | Proposed |
| Medium | Request dev team to add 7-day pre-deactivation warning email | Dev Team | Week 7 | Proposed |
| Low | Create automation backlog; redirect feature requests out of helpdesk | Product / Ops | Week 7+ | Proposed |

---

### 5.3 Estimated Ticket Reduction

If all recommendations are implemented, the projected impact on recurring ticket volume is as follows:

| Issue | Tickets This Week | Tickets Preventable | Reduction | Dependency |
|---|---|---|---|---|
| Video Playback – Duplicate Tickets | 3 | 2 | 67% | Fix video hosting + incident broadcast |
| LMS System Instability | 2 | 1 (earlier detection) | 50% | Monitoring + runbook |
| Login / Account Deactivation | 1 | 1 | 100% | Automation workflow |
| Ad-hoc Reporting | 1 | 1 | 100% | Scheduled reports |
| Feature Request | 1 | 0 | 0% | Backlog (no immediate reduction) |
| **Total** | **8** | **5** | **~63%** | |

> **Conclusion:** Implementing the top 4 recommendations could reduce recurring ticket volume by approximately **63%**, freeing ~5.5 hrs/week of agent time for higher-value work. The highest-priority action this week is the Login automation (Days 3–4), which delivers 100% reduction for its category at zero dev cost.