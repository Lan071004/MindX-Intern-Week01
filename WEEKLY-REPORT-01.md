# Weekly Progress Report – MindX Training Week 01 Project

**Timeframe**: Week 1 (26/01/2026 – 02/02/2026)  
**Author**: Nguyen Ngoc Lan  
**Mentors**: Trinh Van Thuan, Tran Thi Thanh Duyen

---

## Overall Progress Overview

| Step | Description | Status | Completion Time |
|------|-------------|--------|-----------------|
| Step 1 | ACR & API Deployment | Completed | Tuesday (27/01) |
| Step 2 | BE AKS Deployment | Completed | Thursday (29/01) |
| Step 3 | Ingress Controller | Completed | Friday (30/01) |
| Step 4 | FE AKS Deployment | Completed | Saturday (31/01) |
| Step 5 | Firebase Authentication | Completed | Sunday (01/02) |
| Step 6 | HTTPS Domain Setup | Completed | Sunday (01/02) |

**Result**: Completed 6/6 steps within the deadline (T+7)

---

## Detailed Timeline

### **Monday (26/01)** – Not Started
- **Reason**: Dental root canal treatment
- **Impact**: Lost 1 working day
- **Risk Assessment**: Identified the risk of insufficient time to complete 6 steps in 7 days

### **Tuesday (27/01)** – Step 1 Completed
- Created Express API with TypeScript
- Containerized the API
- Set up Azure Container Registry
- Built and pushed image to ACR
- Deployed to Azure Web App (optional – for comparison with AKS)
- **Duration**: 1 working day

### **Wednesday (28/01)** – No Progress
- **Reason**: Full-day intensive classes (morning + afternoon + evening)
- **Impact**: Lost an additional working day
- **Total Lost Time**: 2/7 days

### **Thursday (29/01)** – Step 2 Completed
- Created AKS cluster
- Configured kubectl access
- Created Kubernetes manifests (deployment.yaml, service.yaml)
- Deployed API to AKS from ACR
- Verified deployment via port-forward
- **Troubleshooting**: Encountered ImagePullBackOff → Fixed using imagePullSecrets
- **Duration**: 1 working day

### **Friday (30/01)** – Step 3 Completed
- Installed NGINX Ingress Controller via Helm
- Created ingress manifest
- **Issue**: NSG blocking traffic
- **Solution**: Applied Cloudflare Tunnel
- **Duration**: 1 working day

### **Saturday (31/01)** – Step 4 Completed
- Created React app with Vite + TypeScript
- Fixed backend CORS
- Containerized frontend and pushed to ACR
- Deployed frontend to AKS
- Updated ingress for full-stack routing

### **Sunday (01/02)** – Step 5 & 6 Completed
- Implemented Firebase Authentication
- Set up HTTPS via Cloudflare Tunnel

---

## Deliverables

- Full-stack application with 6 completed steps
- Kubernetes manifests
- Documentation (STEP1–6.md)
- Live frontend & backend via HTTPS

---

**Prepared by**: Nguyen Ngoc Lan  
**Date**: 01/02/2026
