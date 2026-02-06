# Step 4: Setup and Deploy React Web App on AKS

Create a React frontend application that connects to the API from Step 1 and 2. Deploy the web app directly onto the existing AKS cluster and establish communication between frontend and backend services in Kubernetes.

---

## 4.1 Create React Web App

### Initialize project

Navigate to the root directory and create the React app:

```bash
npm create vite@latest web -- --template react-ts
```

### Install dependencies

```bash
cd web
npm install
npm install axios react-router-dom
npm install --save-dev @types/react-router-dom
npm install --save-dev @vitejs/plugin-react
```

### Implement frontend

Code the frontend to integrate with the API using the ingress endpoint from Step 3.

> **Note:** If the API works when accessed directly in the browser but the frontend cannot call it, this is a CORS error. Fix by adding CORS to the backend, then rebuild and push to ACR.

### Fix CORS on Backend

**Install CORS package:**

```bash
npm install cors
npm install --save-dev @types/cors
```

**Update `src/index.ts`** — add CORS middleware to the Express app before routes.

**Rebuild and push backend to ACR:**

```bash
docker build -t mindx-api:v1.1.0 -t mindx-api:latest .
docker run -p 3001:3000 mindx-api:latest
```

Test CORS in a new terminal:

```bash
curl.exe -H "Origin: http://localhost:5173" -I http://localhost:3001/health
```

Push to ACR:

```bash
az acr login --name <ACR_NAME>

docker tag mindx-api:latest <ACR_NAME>.azurecr.io/mindx-api:latest
docker tag mindx-api:latest <ACR_NAME>.azurecr.io/mindx-api:v1.1.0

docker push <ACR_NAME>.azurecr.io/mindx-api:latest
docker push <ACR_NAME>.azurecr.io/mindx-api:v1.1.0

az acr repository show-tags --name <ACR_NAME> --repository mindx-api --output table
```

| Tag | Purpose |
|-----|---------|
| `mindx-api:latest` | Local tag for testing |
| `mindx-api:v1.1.0` | Fixed version for rollback |
| `<ACR_NAME>.azurecr.io/mindx-api:latest` | ACR tag (latest) |
| `<ACR_NAME>.azurecr.io/mindx-api:v1.1.0` | Production / CI-CD tag |

Update `k8s/deployment.yaml` to use the new image version, then apply:

```bash
kubectl apply -f k8s/deployment.yaml
kubectl get pods -n dev
kubectl logs -f deployment/mindx-api -n dev
```

### Update Frontend

- Create `.env` with the API URL
- Create a type declaration file with `/// <reference types="vite/client" />` to support `.env` in TypeScript
- Call the API using the `.env` variable in `api.ts`
- Run the frontend and verify it works

---

## 4.2 Containerize and Push to ACR

Since ACR, Docker, Azure CLI, and push permissions are already set up from Step 1, build and push the React container image.

Open Docker Desktop to start the Docker Engine, then build from the frontend directory:

```bash
docker build -t frontend-app:v1 .
docker images | findstr frontend-app
docker run -p 3000:3000 frontend-app:v1
```

Tag and push to ACR:

```bash
docker tag frontend-app:v1 <ACR_NAME>.azurecr.io/frontend-app:v1
docker tag frontend-app:v1 <ACR_NAME>.azurecr.io/frontend-app:latest

az acr login --name <ACR_NAME>

docker push <ACR_NAME>.azurecr.io/frontend-app:v1
docker push <ACR_NAME>.azurecr.io/frontend-app:latest
```

Verify:

```bash
az acr repository list --name <ACR_NAME> --output table
az acr repository show --name <ACR_NAME> --repository frontend-app
```

---

## 4.3 Create Kubernetes Manifests

Create `deployment.yaml` and `service.yaml` in the `web/k8s/` directory.

- **deployment.yaml** — defines replicas, container image, port, resource limits, and health check probes for the frontend pods.
- **service.yaml** — creates a stable internal ClusterIP endpoint so frontend pods can be accessed consistently within the cluster.

> **Note:** No ConfigMap is needed for the `.env` file. Vite's `VITE_*` variables are build-time only — they are baked into the static bundle during `npm run build`. ConfigMap only affects runtime variables like `process.env` in Node.js.

Validate the manifests:

```bash
kubectl apply --dry-run=client -f k8s/
kubectl apply --dry-run=server -f k8s/
```

---

## 4.4 Deploy React App to AKS from ACR

### Verify cluster state

```bash
kubectl cluster-info
kubectl get nodes
kubectl get deployments
kubectl get services
```

### Deploy

```bash
kubectl apply -f k8s/
kubectl rollout status deployment/frontend-deployment
kubectl get pods -l app=frontend
```

### Verify

```bash
kubectl describe deployment frontend-deployment
kubectl get services
kubectl describe service frontend-service
kubectl logs -l app=frontend --tail=50
kubectl describe pod -l app=frontend
kubectl get all -l app=frontend
```

Test internal access via port forwarding:

```bash
kubectl port-forward service/frontend-service 8081:80
# In a new terminal:
curl http://localhost:8081
```

### Troubleshooting — ImagePullBackOff / AcrPull

**Symptom:** Frontend pod is stuck in `ImagePullBackOff`. `kubectl describe pod` shows `401 Unauthorized` when pulling from ACR.

**Cause:** AKS lost `AcrPull` permission. The `az aks update --attach-acr` command fails due to insufficient Owner permissions.

**Fix:** Create a docker-registry secret using ACR credentials.

```bash
az acr credential show -n <ACR_NAME>

kubectl create secret docker-registry acr-secret \
  --docker-server=<ACR_NAME>.azurecr.io \
  --docker-username=<username> \
  --docker-password=<password>
```

Add `imagePullSecrets` to `deployment.yaml` at the same level as `containers` inside `spec`, then re-apply:

```bash
kubectl apply -f k8s/
kubectl get pods -l app=frontend
```

---

## 4.5 Update Ingress for Full-Stack Routing

Update the existing `k8s/ingress.yaml` — do not create a separate ingress for the frontend. A single file can contain multiple Ingress resources and avoids conflicts.

### Check current ingress

```bash
kubectl get ingress -A
kubectl describe ingress <ingress-name>
kubectl get ingress <ingress-name> -o yaml
```

### Update ingress.yaml

Split into two Ingress resources in one file:

- **API ingress** — uses `rewrite-target: /$2` to strip the `/api` prefix before forwarding to the API service.
- **Frontend ingress** — does **not** use `rewrite-target`, so paths are passed through as-is (e.g., `/assets/index.js` reaches the container unchanged).

> **Why two resources?** The `rewrite-target` annotation applies to the entire Ingress. If both routes share one Ingress with `rewrite-target: /$2`, the frontend catch-all path `/(.*)` has only one capture group, so `$2` is always empty — every request gets rewritten to `/` and returns `index.html`.

### Apply and verify

```bash
kubectl apply --dry-run=client -f k8s/ingress.yaml -n dev
kubectl apply -f k8s/ingress.yaml -n dev
kubectl get ingress -A
```

### Test routes

Replace `<EXTERNAL_IP>` with the actual ingress IP:

```bash
curl http://<EXTERNAL_IP>/
curl http://<EXTERNAL_IP>/api/health
curl http://<EXTERNAL_IP>/api/hello
```

---

## 4.6 Verify Full Stack and Update Repository

### Verify full-stack communication

Open the browser and navigate to `http://<EXTERNAL_IP>`. Confirm:

- The frontend loads correctly (UI is visible)
- The frontend successfully calls the API: open `F12` → `Network` tab → filter by `XHR` → verify requests are going to `/api/*`

### Commit and push

Commit all source code and Kubernetes manifests:

```
web/
├── k8s/
│   ├── deployment.yaml
│   └── service.yaml
├── src/
├── public/
├── Dockerfile
├── .env
├── package.json
├── vite.config.ts
└── tsconfig.json
```

Also include the updated `k8s/ingress.yaml` from the root directory (updated in step 4.5).

```bash
git add .
git commit -m "Step 4: Deploy React frontend on AKS

- Create React app with Vite + TypeScript
- Add CORS to backend, rebuild and push to ACR
- Containerize frontend and push image to ACR
- Create Kubernetes manifests (deployment + service)
- Deploy frontend to AKS
- Update ingress for full-stack routing (API + Frontend)
- Verify frontend-to-backend communication"
git push
```