# Weekly Progress Report – MindX Training Week 01 Project

**Timeframe**: Week 1 (26/01/2026 – 02/02/2026)  
**Author**: Nguyen Ngoc Lan  
**Mentors**: Trinh Van Thuan, Tran Thi Thanh Duyen

---

## Overall Progress Overview

| Step   | Description             | Status    | Completion Time  |
| ------ | ----------------------- | --------- | ---------------- |
| Step 1 | ACR & API Deployment    | Completed | Tuesday (27/01)  |
| Step 2 | BE AKS Deployment       | Completed | Thursday (29/01) |
| Step 3 | Ingress Controller      | Completed | Friday (30/01)   |
| Step 4 | FE AKS Deployment       | Completed | Saturday (31/01) |
| Step 5 | Firebase Authentication | Completed | Sunday (01/02)   |
| Step 6 | HTTPS Domain Setup      | Completed | Sunday (01/02)   |

**Result**: Completed 6/6 steps within the deadline (T+7)

---

## Detailed Timeline

### **Monday (26/01)** – Not Started

* **Reason**: Dental root canal treatment
* **Impact**: Lost 1 working day
* **Risk Assessment**: Identified the risk of insufficient time to complete 6 steps in 7 days

### **Tuesday (27/01)** – Step 1 Completed

* Created Express API with TypeScript
* Containerized the API
* Set up Azure Container Registry
* Built and pushed image to ACR
* Deployed to Azure Web App (optional – for comparison with AKS)
* **Duration**: 1 working day

### **Wednesday (28/01)** – No Progress

* **Reason**: Full-day intensive classes (morning + afternoon + evening)
* **Impact**: Lost an additional working day
* **Total Lost Time**: 2/7 days

### **Thursday (29/01)** – Step 2 Completed

* Created AKS cluster
* Configured kubectl access
* Created Kubernetes manifests (deployment.yaml, service.yaml)
* Deployed API to AKS from ACR
* Verified deployment via port-forward
* **Troubleshooting**: Encountered ImagePullBackOff → Fixed using imagePullSecrets
* **Duration**: 1 working day

### **Friday (30/01)** – Step 3 Completed

* **Step 3**: Ingress Controller Setup

  * Installed NGINX Ingress Controller via Helm
  * Created ingress manifest
  * **Issue Identified**: NSG blocking traffic → LoadBalancer had an IP but was inaccessible
  * **Solution**: Applied Cloudflare Tunnel following mentor's troubleshooting guide (from Step 3)
* **Duration**: 1 working day

### **Saturday (31/01)** – Step 4 Completed

* **Step 4**: Frontend Deployment

  * Created React app with Vite + TypeScript
  * Fixed CORS on backend
  * Containerized frontend and pushed to ACR
  * Deployed frontend to AKS
  * Updated ingress for full-stack routing
  * **Troubleshooting**: CORS errors → Fixed by updating backend CORS configuration

### **Sunday (01/02)** – Step 5 & 6 Completed

**Emerging Risks**:

* Unable to contact mentors over the weekend for OpenID credentials, whitelisting, and authentication support
* Risk of not completing Step 5 on time (2 remaining days, 2 remaining steps)

**Mitigation Plan** (priority order):

1. **Scope Adjustment** (Applied):

   * Switched from OpenID authentication to Firebase Authentication (custom method)
   * Reason: Firebase does not require mentor support and can be fully self-configured
   * Trade-off: Lost opportunity to learn OpenID integration, but ensured deadline compliance

2. **Seek Additional Support**: Not required due to independent solution

3. **Extend Deadline**: Not required

---

### **Step 5**: Firebase Authentication

* Set up Firebase project
* Implemented auth context & components on frontend
* Installed Firebase Admin SDK on backend
* Created authentication middleware
* Rebuilt and redeployed frontend & backend with Firebase
* **Troubleshooting**:

  * Firebase `invalid-api-key` error → Fixed by injecting Docker build args directly (Vite env variables are build-time only)
  * CORS errors with Cloudflare Tunnel URLs → Updated backend CORS configuration
* **Duration**: 1 day

### **Step 6**: HTTPS Domain Setup

* **Issue Identified**: After completing steps 6.1 and 6.2, discovered NSG was still not open (issue originating from Step 3)
* **Solution**: Used Cloudflare Tunnel instead of traditional ingress + cert-manager

  * Deployed frontend tunnel
  * Deployed backend tunnel
  * Updated CORS configuration for tunnel URLs
  * Rebuilt frontend with tunnel URL
* (Optional) Set up custom domain using FreeDNS
* Verified full authentication flow over HTTPS
* **Duration**: 1 day

**End-of-Week Result**: Completed both steps within the deadline

---

## Issues Encountered & Solutions

### 1. **NSG Blocking Traffic** (Steps 3 & 6)

**Issue**: Network Security Group blocked traffic, preventing internet access to LoadBalancer

**Solution**:

* Applied Cloudflare Tunnel (based on mentor's Step 3 troubleshooting guide)
* Created outbound tunnel from AKS → Cloudflare → Internet
* Completely bypassed NSG restrictions

**Result**: Application accessible over HTTPS via temporary URLs

### 2. **CORS Errors** (Steps 4 & 6)

**Issue**: Frontend could not call API due to CORS policy

**Solution**:

* Updated backend Express CORS configuration to allow:

  * Localhost (dev)
  * Cloudflare Tunnel domains
  * Pattern matching for `.trycloudflare.com`
* Rebuilt and redeployed backend

**Result**: Frontend-backend communication works over HTTPS

### 3. **Firebase Environment Variables** (Step 5)

**Issue**: Firebase credentials not injected into production build

**Solution**:

* Updated Dockerfile with ARG + ENV declarations
* Built images with `--build-arg` flags
* Avoided `.env` files (Vite variables are build-time only)

**Result**: Firebase authentication works in production

### 4. **ImagePullBackOff** (Steps 2 & 4)

**Issue**: AKS failed to pull images from ACR (401 Unauthorized)

**Solution**:

* Created `imagePullSecrets` with ACR credentials
* Added them to deployment manifests

**Result**: Pods successfully pulled images

### 5. **No Mentor Support During Weekend** (Step 5)

**Issue**: Unable to obtain OpenID credentials and whitelist

**Solution** (Scope Adjustment):

* Switched to Firebase Authentication
* Self-service setup without mentor dependency
* Trade-off: Learned Firebase instead of OpenID

**Result**: Authentication completed on time

---

## Lessons Learned

### What Went Well:

1. **Early Risk Identification**: Detected deadline risk from Monday (lost 1 day) and Wednesday (lost another day)
2. **Flexible Scope Management**: Switched from OpenID to Firebase when support was unavailable
3. **Reusing Proven Solutions**: Applied Cloudflare Tunnel solution from Step 3 to Step 6
4. **High Productivity**: Completed 2 steps in a single day (Steps 3 & 4 on Friday)

### Areas for Improvement:

1. **Time Estimation**: Underestimated time required for troubleshooting
2. **Dependency Planning**: Should have requested OpenID access earlier (not waiting until weekend)
3. **Risk Mitigation**: Should prepare backup authentication methods earlier

### Action Items for Next Projects:

1. **Plan Buffer Time**: Reserve 1–2 days for unexpected issues
2. **Early Communication**: Discuss dependencies with mentors early in the week (Monday–Tuesday)
3. **Parallel Planning**: Prepare backup solutions for critical dependencies

---

## Deliverables

### Code Repository

* Full-stack application with all 6 steps completed
* All Kubernetes manifests
* Documentation for each step
* Clear Git history with meaningful commits

### Live Application

* **Frontend**: [https://exec-subject-wesley-make.trycloudflare.com/](https://exec-subject-wesley-make.trycloudflare.com/)
* **Backend API**: [https://doom-elvis-carries-terrorist.trycloudflare.com/](https://doom-elvis-carries-terrorist.trycloudflare.com/)
* **Features**:

  * User registration & login (Firebase)
  * Protected routes
  * JWT token validation
  * HTTPS/SSL (via Cloudflare)
  * Full-stack communication

### Documentation

* Step-by-step guides (STEP1–6.md)
* Troubleshooting guides
* Architecture diagrams (optional)

---

## Summary

**Result**: **100% requirements completed within the deadline (T+7)**

**Actual Working Time**: 5/7 days

* Lost 2 days (Monday: dental, Wednesday: classes)
* High efficiency during remaining 5 days
* Compensated by completing 2 steps in one day (Friday) and working over the weekend

**Deadline Management Approach**:

1. Early risk identification (after Wednesday)
2. Scope adjustment (Firebase instead of OpenID)
3. Leveraging existing solutions (Cloudflare Tunnel)
4. No deadline extension

**Overall Evaluation**:

* Project completed on time
* All features function stably
* Application accessible via HTTPS
* Authentication flow works end-to-end
* Documentation sufficient for reproduction

---

## Next Plan

**If Additional Time Is Available (Optional Improvements)**:

1. Migrate from Cloudflare Tunnel to traditional ingress + cert-manager (once NSG is opened)
2. Set up named Cloudflare Tunnels for persistent URLs
3. Implement refresh token mechanism
4. Add monitoring & logging (Prometheus, Grafana)
5. Set up CI/CD pipeline

**Priority**: Wait for mentor feedback before implementing improvements

---

**Prepared by**: Nguyen Ngoc Lan  
**Date**: 02/02/2026  
**Mentors Review**: Trinh Van Thuan