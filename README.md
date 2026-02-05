# MindX Training Project (Week 01 & 02)

Full-stack web application deployed on Azure Kubernetes Service (AKS) with Firebase Authentication, HTTPS support via Cloudflare Tunnel, and comprehensive production and product metrics monitoring.

## Project Overview

This project demonstrates a complete cloud-native application deployment workflow with observability, including:

**Week 1 - Infrastructure & Deployment**:
- Containerized Node.js/TypeScript backend API
- React/TypeScript frontend application
- Kubernetes orchestration on Azure AKS
- Firebase authentication with JWT token validation
- HTTPS access via Cloudflare Tunnel
- CI/CD-ready infrastructure

**Week 2 - Monitoring & Analytics**:
- Production metrics with Azure Application Insights
- Product metrics with Google Analytics 4
- Alert configuration for backend monitoring
- User behavior tracking and analytics
- Comprehensive observability setup

## Live Application

- **Frontend**: https://exec-subject-wesley-make.trycloudflare.com/
- **Backend API**: https://doom-elvis-carries-terrorist.trycloudflare.com/

**Note**: These are temporary Cloudflare Tunnel URLs and may change when pods restart.

## Features

**Application Features**:
- User registration and login with Firebase
- Protected routes requiring authentication
- JWT token validation on backend
- HTTPS/SSL via Cloudflare Tunnel
- Full-stack communication over secure connections

**Infrastructure Features**:
- Kubernetes-native deployment
- Container orchestration with health checks
- Scalable architecture

**Monitoring & Observability** (Week 2):
- Production metrics tracking with Azure Application Insights
- Real-time performance monitoring
- Automated alerts for response time, exceptions, and availability
- Product analytics with Google Analytics 4
- User behavior tracking and event monitoring
- Custom event tracking (login, logout, navigation)

## Architecture

```
Internet
    ↓
Cloudflare Tunnel (HTTPS)
    ↓
Azure Kubernetes Service (AKS)
    ├── Frontend Service (ClusterIP)
    │   └── Frontend Pods (React)
    │       ├── Google Analytics (Product Metrics)
    │       └── User Event Tracking
    │
    └── Backend Service (ClusterIP)
        └── Backend Pods (Express + Firebase Admin)
            ├── Application Insights (Production Metrics)
            ├── Performance Monitoring
            └── Error Tracking
                ↓
            Firebase Authentication
```

### Monitoring Architecture

```
Production Metrics:
Backend API → Application Insights → Azure Monitor
    ├── Request/Response tracking
    ├── Performance metrics
    ├── Exception monitoring
    └── Alert Rules → Email Notifications

Product Metrics:
Frontend App → Google Analytics 4
    ├── Page view tracking
    ├── User session analytics
    ├── Custom event tracking
    └── User behavior insights
```

## Project Reports

**Week 1 - Infrastructure & Deployment**:
- **[REPORT-WEEK01.md](./docs/REPORT-WEEK01.md)** - Week 1 progress report

**Week 2 - Monitoring & Analytics**:
- **[REPORT-WEEK02.md](./docs/REPORT-WEEK02.md)** - Week 2 progress report


## Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- Firebase Admin SDK
- Application Insights SDK
- CORS middleware

### Frontend
- React 18
- TypeScript
- Vite
- Firebase SDK
- react-ga4 (Google Analytics)
- Axios
- React Router

### Infrastructure
- Azure Kubernetes Service (AKS)
- Azure Container Registry (ACR)
- Cloudflare Tunnel
- Docker
- Kubernetes
- Helm

### Monitoring & Analytics
- Azure Application Insights (Production Metrics)
- Azure Monitor (Alerts & Notifications)
- Google Analytics 4 (Product Metrics)
- KQL (Kusto Query Language)

### Authentication
- Firebase Authentication
- JWT tokens

## Project Structure

```
mindx-intern04-week01/
├── api/                          # Backend API application
│   ├── src/                      # Backend source code
│   ├── k8s/                      # Backend Kubernetes manifests
│       ├── deployment.yaml       # Backend deployment manifest
│       ├── service.yaml          # Backend service manifest
│   ├── node_modules/             # Backend dependencies
│   ├── Dockerfile                # Backend container config
│   ├── .dockerignore             # Docker ignore rules for backend
│   ├── package.json              # Backend dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   ├── firebase-service-account.json # Firebase admin credentials (not in git)
│   └── .env                      # Backend environment variables (not in git)
│
├── web/                          # Frontend React application
│   ├── src/                      # React source code
│   ├── k8s/                      # Frontend Kubernetes manifests
│       ├── deployment.yaml       # Frontend deployment manifest
│       ├── service.yaml          # Frontend service manifest
│   ├── public/                   # Static assets
│   ├── node_modules/             # Frontend dependencies
│   ├── Dockerfile                # Frontend container config
│   ├── .dockerignore             # Docker ignore rules for frontend
│   ├── .env                      # Frontend environment variables (not in git)
│   ├── package.json              # Frontend dependencies
│   └── vite.config.ts            # Vite configuration
│
├── infrastructure/               # Infrastructure as Code
│   └── k8s/                      # Kubernetes manifests
│       ├── namespace.yaml        # Dev namespace configuration
│       ├── cloudflare-tunnel.yaml # Cloudflare Tunnel deployments (BE + FE)
│       ├── ingress.yaml          # NGINX Ingress rules (optional)
│       └── letsencrypt-prod.yaml # Let's Encrypt issuer (optional)
│
├── docs/                         # Documentation
│   ├── 01-SETUP-ACR-AND-API-DEPLOYMENT.md
│   ├── 02-DEPLOY-BACKEND-TO-AKS.md
│   ├── 03-SETUP-INGRESS-CONTROLLER.md
│   ├── 04-DEPLOY-FRONTEND-TO-AKS.md
│   ├── 05-FIREBASE-AUTHENTICATION-FLOW.md
│   ├── 06-SETUP-HTTPS-WITH-CLOUDFLARE-TUNNEL.md
│   └── WEEKLY-REPORT-ENG.md      # Weekly report
│
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

## Prerequisites

### Required Tools
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm](https://helm.sh/docs/intro/install/) (for ingress)

### Required Accounts
- Azure subscription with AKS and ACR access
- Firebase project with Authentication enabled
- (Optional) Cloudflare account for persistent tunnels

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd mindx-intern04-week01
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd api
npm install
```

#### Configure Environment Variables
Create `.env` file in `api/` directory:

```bash
PORT=3000
NODE_ENV=development
```

#### Setup Firebase Admin
1. Download Firebase service account JSON from Firebase Console
2. Save as `firebase-service-account.json` in `api/` directory
3. Add to `.gitignore`

#### Run Locally
```bash
npm run dev
```

Backend will be available at `http://localhost:3000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd web
npm install
```

#### Configure Environment Variables
Create `.env` file in `web/` directory:

```bash
VITE_API_URL=your-api
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

#### Run Locally
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Deployment Guide

### Week 1: Infrastructure & Application Deployment

For detailed deployment instructions, refer to the step-by-step guides:

1. **[01-SETUP-ACR-AND-API-DEPLOYMENT.md](./docs/01-SETUP-ACR-AND-API-DEPLOYMENT.md)** - Setup Azure Container Registry and deploy API
2. **[02-DEPLOY-BACKEND-TO-AKS.md](./docs/02-DEPLOY-BACKEND-TO-AKS.md)** - Deploy backend to AKS
3. **[03-SETUP-INGRESS-CONTROLLER.md](./docs/03-SETUP-INGRESS-CONTROLLER.md)** - Setup ingress controller or Cloudflare Tunnel
4. **[04-DEPLOY-FRONTEND-TO-AKS.md](./docs/04-DEPLOY-FRONTEND-TO-AKS.md)** - Deploy frontend to AKS
5. **[05-FIREBASE-AUTHENTICATION-FLOW.md](./docs/05-FIREBASE-AUTHENTICATION-FLOW.md)** - Implement Firebase authentication
6. **[06-SETUP-HTTPS-WITH-CLOUDFLARE-TUNNEL.md](./docs/06-SETUP-HTTPS-WITH-CLOUDFLARE-TUNNEL.md)** - Setup HTTPS with Cloudflare Tunnel

### Week 2: Monitoring & Analytics Setup

For detailed monitoring setup instructions, refer to:

7. **[SET-UP-AZURE-APP-INSIGHT.md](./docs/SET-UP-AZURE-APP-INSIGHT.md)** - Setup Azure Application Insights for production metrics
8. **[SET-UP-GOOGLE-ANALYTICS.md](./docs/SET-UP-GOOGLE-ANALYTICS.md)** - Setup Google Analytics 4 for product metrics

### Quick Deployment Commands

#### Backend Deployment
```bash
# Navigate to backend directory
cd api

# Build and push to ACR
docker build -t <ACR_NAME>.azurecr.io/<API-NAME>:v1.x.x .
az acr login --name <ACR_NAME>
docker push <ACR_NAME>.azurecr.io/<API-NAME>:v1.x.x

# Deploy to AKS (from root directory)
cd ..
kubectl apply -f infrastructure/k8s/namespace.yaml
kubectl apply -f infrastructure/k8s/cloudflare-tunnel.yaml
```

#### Frontend Deployment
```bash
# Navigate to frontend directory
cd web

# Build with environment variables
docker build --no-cache \
  --build-arg VITE_API_URL="<YOUR_API_URL>" \
  --build-arg VITE_FIREBASE_API_KEY="<YOUR_API_KEY>" \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN="<YOUR_AUTH_DOMAIN>" \
  --build-arg VITE_FIREBASE_PROJECT_ID="<YOUR_PROJECT_ID>" \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET="<YOUR_STORAGE_BUCKET>" \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID="<YOUR_SENDER_ID>" \
  --build-arg VITE_FIREBASE_APP_ID="<YOUR_APP_ID>" \
  -t <ACR_NAME>.azurecr.io/<FE-NAME>:v1.x.x .

# Push to ACR
docker push <ACR_NAME>.azurecr.io/<FE-NAME>:v1.x.x

# Deploy to AKS (from root directory)
cd ..
kubectl apply -f infrastructure/k8s/cloudflare-tunnel.yaml
```

#### Setup Cloudflare Tunnels
```bash
# Apply tunnel configuration from manifests
kubectl apply -f infrastructure/k8s/namespace.yaml
kubectl apply -f infrastructure/k8s/cloudflare-tunnel.yaml

# Verify tunnels are running
kubectl get pods -n dev | grep tunnel

# Get tunnel URLs from logs
kubectl -n dev logs deploy/api-tunnel --tail=50 | grep trycloudflare.com
kubectl -n dev logs deploy/fe-tunnel --tail=50 | grep trycloudflare.com
```

**Note**: The `cloudflare-tunnel.yaml` manifest includes both backend and frontend tunnel deployments.

### Automated Deployment Script

For convenience, use the included deployment script:

```bash
# Make script executable
chmod +x deploy-k8s.sh

# Run deployment
./deploy-k8s.sh
```

The script will:
- Verify kubectl connection to AKS cluster
- Apply namespace configuration
- Deploy Cloudflare Tunnels
- Wait for pods to be ready
- Display tunnel URLs automatically
- Optionally apply ingress and Let's Encrypt configs

## API Endpoints

### Public Endpoints
- `GET /` - API information
- `GET /health` - Health check
- `GET /hello?name=YourName` - Hello world

### Authentication Endpoints
- `POST /auth/verify` - Verify Firebase ID token

### Protected Endpoints (Requires Authentication)
- `GET /protected/profile` - Get user profile
- Requires `Authorization: Bearer <FIREBASE_ID_TOKEN>` header

## Monitoring & Observability

### Production Metrics (Azure Application Insights)

**Access Dashboard**:
- Navigate to [Azure Portal](https://portal.azure.com)
- Go to Application Insights → `mindx-app-insights`

**Key Metrics Monitored**:
- **Request Volume**: Total API calls and throughput
- **Response Time**: Average, P50, P90, P95, P99 latencies
- **Error Rate**: Failed requests and exceptions
- **Availability**: Uptime percentage from global health checks
- **Dependencies**: External service calls and performance

**Alert Rules Configured**:
1. **High Response Time Alert**
   - Triggers when average response time > 1 second
   - Severity: Warning (Level 2)
   - Check frequency: Every 1 minute
   - Lookback period: 5 minutes

2. **High Exception Rate Alert**
   - Triggers when exceptions > 10 in 5 minutes
   - Severity: Error (Level 1)
   - Check frequency: Every 1 minute

3. **Availability Alert**
   - Health check endpoint: `/health`
   - Test frequency: Every 5 minutes
   - Test locations: 5 global regions
   - Success criteria: HTTP 200, <30 seconds

**View Logs with KQL**:
```kusto
// Recent requests
requests
| where timestamp > ago(1h)
| order by timestamp desc
| take 10

// Exceptions in the last hour
exceptions
| where timestamp > ago(1h)
| project timestamp, type, outerMessage, problemId
| order by timestamp desc
```

### Product Metrics (Google Analytics 4)

**Access Dashboard**:
- Navigate to [Google Analytics](https://analytics.google.com)
- Select Property: `MindX Frontend App`

**Key Metrics Tracked**:
- **Page Views**: Total page loads and unique page views
- **User Sessions**: Active sessions, session duration
- **Active Users**: Real-time and daily active users
- **Custom Events**:
  - Login events (successful authentication)
  - Logout events (session termination)
  - Navigation events (page transitions)
- **User Demographics**: Geographic location, language
- **Technology**: Device types, browsers, OS

**Key Reports**:
- **Real-time**: Current active users and events
- **Engagement**: Event tracking and page views
- **User Attributes**: Demographics and technology
- **Library**: Custom dashboards and saved reports

**Tracked Events**:
```javascript
// Login Event
trackEvent('User', 'Login', 'Success');

// Logout Event
trackEvent('User', 'Logout', 'Session End');

// Page View (automatic)
trackPageView(location.pathname);
```

### Alert Notifications

**Email Notifications**:
- Alert emails sent to configured email address
- Includes alert details, severity, and affected resources
- Contains links to Azure Portal for investigation

**Alert Action Groups**:
- Name: `email-alerts`
- Scope: Global
- Notification type: Email/SMS/Push/Voice

## Environment Variables

### Backend (api/.env)
```bash
PORT=3000
NODE_ENV=production
FIREBASE_SERVICE_ACCOUNT_PATH=/app/secrets/firebase-service-account.json
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxx;IngestionEndpoint=https://...
```

**Note**: 
- Firebase credentials are mounted via Kubernetes secrets
- Application Insights Connection String is injected via deployment.yaml

### Frontend (web/.env)
```bash
VITE_API_URL=https://your-api-tunnel-url.trycloudflare.com
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Important**: Vite environment variables are **build-time only**. They must be injected via Docker `--build-arg` flags during the build process.

## Common Issues & Troubleshooting

### 1. ImagePullBackOff Error
**Problem**: AKS cannot pull images from ACR

**Solution**: Create imagePullSecrets
```bash
kubectl create secret docker-registry acr-secret \
  --docker-server=<ACR_NAME>.azurecr.io \
  --docker-username=<USERNAME> \
  --docker-password=<PASSWORD> \
  -n dev
```

Add to deployment.yaml:
```yaml
spec:
  imagePullSecrets:
    - name: acr-secret
```

### 2. CORS Errors
**Problem**: Frontend cannot call backend API

**Solution**: Update backend CORS configuration in `src/index.ts`:
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend-url.com'
  ],
  credentials: true
}));
```

### 3. Firebase Invalid API Key
**Problem**: Firebase authentication fails in production

**Solution**: Ensure environment variables are injected at build time:
```bash
docker build --build-arg VITE_FIREBASE_API_KEY="your-key" ...
```

### 4. Tunnel URLs Change After Restart
**Problem**: Cloudflare Tunnel URLs are temporary

**Solutions**:
- Use named tunnels with Cloudflare account (persistent URLs)
- Setup traditional ingress + cert-manager when NSG is configured
- Use FreeDNS for custom domain (see STEP6 documentation)

## Testing

### Backend Tests
```bash
cd api
npm test
```

### Frontend Tests
```bash
cd web
npm test
```

### Manual Testing
```bash
# Test backend API (replace with your tunnel URL)
curl https://your-api-tunnel.trycloudflare.com/health

# Test with authentication
curl -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
  https://your-api-tunnel.trycloudflare.com/protected/profile
```

## Security Notes

- Never commit `.env` files or `firebase-service-account.json`
- Always use HTTPS in production
- Store secrets in Kubernetes Secrets
- Use imagePullSecrets for private container registries
- Implement proper CORS policies
- Validate all Firebase ID tokens on backend


## License

This project is created for educational purposes as part of MindX Training Program.

## Authors

- **Nguyen Ngoc Lan** - Initial work

## Mentors

- Trinh Van Thuan
- Tran Thi Thanh Duyen