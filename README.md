# MindX Training Week 01 Project

Full-stack web application deployed on Azure Kubernetes Service (AKS) with Firebase Authentication and HTTPS support via Cloudflare Tunnel.

## Project Overview

This project demonstrates a complete cloud-native application deployment workflow, including:

- Containerized Node.js/TypeScript backend API
- React/TypeScript frontend application
- Kubernetes orchestration on Azure AKS
- Firebase authentication with JWT token validation
- HTTPS access via Cloudflare Tunnel
- CI/CD-ready infrastructure

## Live Application

- **Frontend**: https://exec-subject-wesley-make.trycloudflare.com/
- **Backend API**: https://doom-elvis-carries-terrorist.trycloudflare.com/

**Note**: These are temporary Cloudflare Tunnel URLs and may change when pods restart.

## Features

- User registration and login with Firebase
- Protected routes requiring authentication
- JWT token validation on backend
- HTTPS/SSL via Cloudflare Tunnel
- Full-stack communication over secure connections
- Kubernetes-native deployment
- Container orchestration with health checks
- Scalable architecture

## Architecture

```
Internet
    ↓
Cloudflare Tunnel (HTTPS)
    ↓
Azure Kubernetes Service (AKS)
    ├── Frontend Service (ClusterIP)
    │   └── Frontend Pods (React)
    │
    └── Backend Service (ClusterIP)
        └── Backend Pods (Express + Firebase Admin)
            ↓
        Firebase Authentication
```

## Project Reports

- **[WEEKLY-REPORT-VIET.md](./WEEKLY-REPORT-VIET.md)** - Vietnamese weekly progress report
- **[WEEKLY-REPORT-ENG.md](./WEEKLY-REPORT-ENG.md)** - English weekly progress report


## Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- Firebase Admin SDK
- CORS middleware

### Frontend
- React 18
- TypeScript
- Vite
- Firebase SDK
- Axios
- React Router

### Infrastructure
- Azure Kubernetes Service (AKS)
- Azure Container Registry (ACR)
- Cloudflare Tunnel
- Docker
- Kubernetes
- Helm

### Authentication
- Firebase Authentication
- JWT tokens

## Project Structure

```
mindx-intern04-week01/
├── k8s/                          # Root Kubernetes manifests
│   ├── deployment.yaml           # Backend API deployment
│   ├── service.yaml              # Backend API service
│   └── ingress.yaml              # Ingress configuration (optional)
│
├── web/                          # Frontend React application
│   ├── k8s/                      # Frontend Kubernetes manifests
│   │   ├── deployment.yaml       # Frontend deployment
│   │   └── service.yaml          # Frontend service
│   ├── src/                      # React source code
│   ├── public/                   # Static assets
│   ├── Dockerfile                # Frontend container config
│   ├── .env                      # Frontend environment variables
│   ├── package.json              # Frontend dependencies
│   └── vite.config.ts            # Vite configuration
│
├── src/                          # Backend API source code
├── node_modules/                 # Backend dependencies
├── Dockerfile                    # Backend container config
├── package.json                  # Backend dependencies
├── tsconfig.json                 # TypeScript configuration
├── firebase-service-account.json # Firebase admin credentials (not in git)
├── .env                          # Backend environment variables (not in git)
│
├── STEP1-ACR-API-DEPLOYMENT.md   # Step 1 documentation
├── STEP2-BE-AKS-DEPLOYMENT.md    # Step 2 documentation
├── STEP3-INGRESS-CONTROLLER.md   # Step 3 documentation
├── STEP4-FE-AKS-DEPLOYMENT.md    # Step 4 documentation
├── STEP5-FIREBASE-AUTH.md        # Step 5 documentation
├── STEP6-SETUP-HTTPS-DOMAIN.md   # Step 6 documentation
├── WEEKLY-REPORT-VIET.md         # Vietnamese weekly report
├── WEEKLY-REPORT-ENG.md          # English weekly report
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
npm install
```

#### Configure Environment Variables
Create `.env` file in root directory:

```bash
PORT=3000
NODE_ENV=development
```

#### Setup Firebase Admin
1. Download Firebase service account JSON from Firebase Console
2. Save as `firebase-service-account.json` in root directory
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

For detailed deployment instructions, refer to the step-by-step guides:

1. **[STEP1-ACR-API-DEPLOYMENT.md](./STEP1-ACR-API-DEPLOYMENT.md)** - Setup Azure Container Registry and deploy API
2. **[STEP2-BE-AKS-DEPLOYMENT.md](./STEP2-BE-AKS-DEPLOYMENT.md)** - Deploy backend to AKS
3. **[STEP3-INGRESS-CONTROLLER.md](./STEP3-INGRESS-CONTROLLER.md)** - Setup ingress controller or Cloudflare Tunnel
4. **[STEP4-FE-AKS-DEPLOYMENT.md](./STEP4-FE-AKS-DEPLOYMENT.md)** - Deploy frontend to AKS
5. **[STEP5-FIREBASE-AUTH.md](./STEP5-FIREBASE-AUTH.md)** - Implement Firebase authentication
6. **[STEP6-SETUP-HTTPS-DOMAIN.md](./STEP6-SETUP-HTTPS-DOMAIN.md)** - Setup HTTPS with Cloudflare Tunnel

### Quick Deployment Commands

#### Backend Deployment
```bash
# Build and push to ACR
docker build -t <ACR_NAME>.azurecr.io/<API-NAME>:v1.x.x .
az acr login --name <ACR_NAME>
docker push <ACR_NAME>.azurecr.io/<API-NAME>:v1.x.x

# Deploy to AKS
kubectl apply -f k8s/
```

#### Frontend Deployment
```bash
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

# Deploy to AKS
kubectl apply -f k8s/
```

#### Setup Cloudflare Tunnels
```bash
# Backend tunnel
kubectl -n dev create deployment api-tunnel \
  --image=cloudflare/cloudflared:latest \
  -- cloudflared tunnel --no-autoupdate --url http://mindx-api:80

# Frontend tunnel
kubectl -n dev create deployment fe-tunnel \
  --image=cloudflare/cloudflared:latest \
  -- cloudflared tunnel --no-autoupdate --url http://frontend-service:80

# Get tunnel URLs
kubectl -n dev logs deploy/api-tunnel --tail=50 | grep trycloudflare.com
kubectl -n dev logs deploy/fe-tunnel --tail=50 | grep trycloudflare.com
```

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

## Environment Variables

### Backend (.env)
```bash
PORT=3000
NODE_ENV=deployment
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/firebase-service-account.json
```

### Frontend (web/.env)
```bash
VITE_API_URL=https://your-api-url
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
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
npm test
```

### Frontend Tests
```bash
cd web
npm test
```

### Manual Testing
```bash
# Test backend API
curl http://localhost:3000/health

# Test with authentication
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/protected/profile
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
