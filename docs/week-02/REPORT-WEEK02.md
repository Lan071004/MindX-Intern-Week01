# Weekly Progress Report – MindX Training Week 02 Project

**Timeframe**: Week 2 (02/02/2026 – 09/02/2026)  
**Author**: Nguyen Ngoc Lan  
**Mentors**: Trinh Van Thuan, Tran Thi Thanh Duyen

---

## Overall Progress Overview

| Task | Description | Status | Completion Time |
| ---- | ----------- | ------ | --------------- |
| Task 1 | Azure App Insights Setup | Completed | Wednesday (05/02) |
| Task 2 | Google Analytics Setup | Completed | Thursday (06/02) |
| Task 3 | Refine docs based on mentor review | Completed | Friday (07/02) |

**Result**: Completed 100% of requirements within the deadline (T+7)

---

## Week 2 Acceptance Criteria

- [x] Azure App Insights is integrated with the back-end API
- [x] Application logs, errors, and performance metrics are visible in Azure App Insights
- [x] Alerts are setup and tested on Azure
- [x] Google Analytics is integrated with the front-end app
- [x] Key product metrics (e.g., page views, user sessions, events) are tracked in Google Analytics
- [x] Documentation is provided for how to access and interpret both production and product metrics
- [x] All configuration and integration scripts are committed and pushed to the repository

---

## Detailed Timeline

### **Monday (02/02)** – Planning & Research

**Activities**:
* Reviewed Week 2 requirements and acceptance criteria
* Researched Azure Application Insights and Google Analytics 4 (GA4) documentations

**Duration**: Planning day (no code changes)

---

### **Tuesday (03/02)** – Initial Setup Attempts

**Activities**:
* Created Application Insights resource in Azure Portal
* Obtained Connection String for backend integration
* Attempted initial integration with backend API

**Challenges Encountered**:
* Needed to understand KQL (Kusto Query Language) for log queries
* Required careful planning for alert thresholds

**Duration**: 1 day (setup and initial testing)

---

### **Wednesday (04/02)** – Azure App Insights Completed

**Activities**:
* Set up Azure Application Insights resource following [SET-UP-AZURE-APP-INSIGHT.md](./SET-UP-AZURE-APP-INSIGHT.md)
* Integrated Application Insights SDK with backend API
* Configured 3 alert rules: Response Time, Exception Rate, and Availability
* Tested alerts by scaling deployment and verified email notifications

**Issue Encountered**: `crypto is not defined` error
* **Root Cause**: Dockerfile used `npm ci --only=production`, missing crypto dependencies
* **Solution**: Changed to `npm ci` to install all dependencies
* **Result**: App Insights successfully connected and tracking

**Verification**:
* Metrics visible in Azure Portal
* KQL queries returning request data
* Application Map showing backend service and health checks
* All 3 alerts active and firing correctly

**Duration**: 1 full working day

---

### **Thursday (05/02)** – Google Analytics Completed

**Activities**:
* Set up Google Analytics 4 property following [SET-UP-GOOGLE-ANALYTICS.md](./SET-UP-GOOGLE-ANALYTICS.md)
* Integrated react-ga4 with frontend application
* Implemented event tracking for Login, Logout, and Page Views
* Built and deployed with `VITE_GA_MEASUREMENT_ID` environment variable

**Verification**:
* Real-time dashboard showing active users
* Custom events firing correctly (Login, Logout, Navigation)
* User demographics and technology data captured

**Duration**: 1 full working day

---

## Metrics Analysis

### Production Metrics (First 48 Hours)

**Request Volume**:
* Total requests: 766 calls
* Average response time: 1.5ms (backend processing only)
* End-to-end response time: ~763ms (including Cloudflare Tunnel)
* Success rate: >99%

**Availability**:
* Uptime: 67% during initial testing (intentionally scaled down for alert testing)
* Health check frequency: Every 5 minutes
* Test locations: 5 global regions
* Average response time from availability tests: 763ms

**Performance**:
* Backend instances: 4 pods running
* Zero exceptions detected
* Zero failed requests
* All alerts functioning properly

**Observations**:
* Cloudflare Tunnel adds ~760ms latency (acceptable for current use case)
* Backend processing very fast (<2ms average)
* No errors or exceptions in production
* All health checks passing when pods are running

### Product Metrics (First 48 Hours)

**User Engagement**:
* Active users tracked in real-time
* Multiple user sessions recorded
* Login/Logout events successfully captured

**Events Tracked**:
* Page views: All navigation tracked
* Login events: Successful authentication flows
* Logout events: Clean session termination
* Custom events: User interactions

---

**Prepared by**: Nguyen Ngoc Lan  
**Date**: 06/02/2026  
**Status**: Week 2 Completed - Reviewed 
**Mentors**: Trinh Van Thuan, Tran Thi Thanh Duyen