# Step 6: Setup HTTPS Domain and SSL Certificate (Cloudflare Tunnel Alternative)

Configure secure HTTPS access for the full-stack application using Cloudflare Tunnel. This alternative approach bypasses the need for traditional ingress/cert-manager setup and provides instant HTTPS without managing SSL certificates.

---

## Overview

This step establishes HTTPS access to your full-stack application using Cloudflare Tunnel as an alternative to traditional ingress controller + cert-manager setup. Cloudflare Tunnel creates outbound connections from your AKS cluster to Cloudflare's edge network, automatically providing HTTPS without exposing your cluster directly to the internet.

**Why Cloudflare Tunnel?**
- No need to configure Network Security Groups (NSG)
- Automatic HTTPS/SSL without cert-manager
- Works even with private AKS clusters
- Suitable for development, testing, and demos

**Limitations:**
- Temporary URLs that change when pods restart
- Not recommended for production use
- Limited to Cloudflare's free tier capabilities

---

## Prerequisites

- Completed Steps 1-5 with working authenticated full-stack application
- kubectl configured to access the AKS cluster
- Frontend and backend services running in AKS
- Basic understanding of Kubernetes deployments

---

## 6.1 Deploy Cloudflare Tunnels for Frontend and Backend

Instead of using traditional ingress with LoadBalancer and SSL certificates, we'll create separate Cloudflare Tunnels for both frontend and backend services.

### Create Backend API Tunnel

Deploy a cloudflared pod that creates an outbound tunnel to Cloudflare, pointing to your internal API service:

```bash
kubectl -n dev create deployment api-tunnel \
  --image=cloudflare/cloudflared:latest \
  -- cloudflared tunnel --no-autoupdate --url http://mindx-api:80
```

Verify the deployment:

```bash
kubectl -n dev get deployment api-tunnel
kubectl -n dev get pods -l app=api-tunnel
```

### Get Backend API Tunnel URL

Wait 10-20 seconds for the tunnel to establish, then retrieve the public URL:

```bash
kubectl -n dev logs deploy/api-tunnel --tail=50 | Select-String "trycloudflare.com"
```

You should see output like:

```
2026-02-01T21:21:47Z INF |  https://doom-elvis-carries-terrorist.trycloudflare.com
```

**Important:** Record this URL - you'll need it for CORS configuration and frontend environment variables.

### Create Frontend Tunnel

Deploy a separate tunnel for the frontend service:

```bash
kubectl -n dev create deployment fe-tunnel \
  --image=cloudflare/cloudflared:latest \
  -- cloudflared tunnel --no-autoupdate --url http://frontend-service:80
```

### Get Frontend Tunnel URL

```bash
kubectl -n dev logs deploy/fe-tunnel --tail=50 | Select-String "https://"
```

Example output:

```
2026-02-01T21:21:47Z INF |  https://exec-subject-wesley-make.trycloudflare.com
```

**Important:** Record this URL - this is your public application URL.

### Verify Both Tunnels

```bash
# Test backend API
curl https://<YOUR-API-TUNNEL-URL>/health

# Test frontend (should return HTML)
curl https://<YOUR-FRONTEND-TUNNEL-URL>/
```

---

## 6.2 Configure CORS for Cloudflare Tunnel URLs

Since frontend and backend are on different domains, you must configure CORS in the backend API.

### Update Backend CORS Configuration

Edit `api/src/index.ts` to allow Cloudflare Tunnel domains:

```typescript
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      // Add your Cloudflare Tunnel URLs here
      'https://<YOUR-FRONTEND-TUNNEL-URL>',
      'https://<YOUR-API-TUNNEL-URL>',
    ];

    // Allow all .trycloudflare.com domains for flexibility
    if (origin.includes('.trycloudflare.com') || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

### Rebuild and Deploy Backend

```bash
cd api

# Build with new CORS configuration
docker build -t <ACR_NAME>.azurecr.io/mindx-api:<NEW_VERSION> .

# Push to ACR
az acr login --name <ACR_NAME>
docker push <ACR_NAME>.azurecr.io/mindx-api:<NEW_VERSION>

# Update deployment
kubectl -n dev set image deployment/api-deployment api=<ACR_NAME>.azurecr.io/mindx-api:<NEW_VERSION>

# Verify rollout
kubectl -n dev rollout status deployment/api-deployment
```

---

## 6.3 Update Frontend with Backend Tunnel URL

The frontend needs to know the backend API's Cloudflare Tunnel URL.

### Update Environment Variables

Update your `.env` file with the backend tunnel URL:

```bash
VITE_API_URL=https://<YOUR-API-TUNNEL-URL>
VITE_FIREBASE_API_KEY=<your-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<your-auth-domain>
VITE_FIREBASE_PROJECT_ID=<your-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<your-storage-bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
VITE_FIREBASE_APP_ID=<your-app-id>
```

### Update Dockerfile to Accept Build Arguments

Ensure your `web/Dockerfile` includes ARG and ENV declarations for all Vite environment variables. Refer to Step 5 documentation for the complete Dockerfile structure.

### Rebuild Frontend with Build Arguments

**Important:** Vite environment variables are **build-time only**. They must be injected during the Docker build process.

```bash
cd web

# Build with all environment variables as build arguments
docker build --no-cache \
  --build-arg VITE_API_URL="https://<YOUR-API-TUNNEL-URL>" \
  --build-arg VITE_FIREBASE_API_KEY="<your-api-key>" \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN="<your-auth-domain>" \
  --build-arg VITE_FIREBASE_PROJECT_ID="<your-project-id>" \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET="<your-storage-bucket>" \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID="<your-sender-id>" \
  --build-arg VITE_FIREBASE_APP_ID="<your-app-id>" \
  -t <ACR_NAME>.azurecr.io/mindx-fe:<NEW_VERSION> .
```

### Push and Deploy Frontend

```bash
# Push to ACR
docker push <ACR_NAME>.azurecr.io/mindx-fe:<NEW_VERSION>

# Update deployment
kubectl -n dev set image deployment/frontend-deployment frontend=<ACR_NAME>.azurecr.io/mindx-fe:<NEW_VERSION>

# Verify rollout
kubectl -n dev rollout status deployment/frontend-deployment
```

---

## 6.4 Verify HTTPS Access and Authentication Flow

### Test HTTPS Endpoints

Both frontend and backend are now accessible via HTTPS automatically through Cloudflare:

```bash
# Test backend API with HTTPS
curl https://<YOUR-API-TUNNEL-URL>/health

# Should return:
# {"status":"ok","uptime":12345.67,"timestamp":"2026-02-01T21:40:39.451Z"}
```

### Test Frontend Application

Open the frontend tunnel URL in your browser:

```
https://<YOUR-FRONTEND-TUNNEL-URL>/
```

### Verify Authentication Flow

1. **Register a new user** — verify user is created in Firebase Console
2. **Login with credentials** — verify token is stored in browser
3. **Check Network tab (F12)** — verify:
   - All requests use HTTPS
   - API calls include `Authorization: Bearer <token>` header
   - No CORS errors in console
   - No mixed content warnings
4. **Test protected routes** — verify authenticated users can access protected pages
5. **Logout** — verify token is cleared

### Check CORS Headers

Open browser DevTools (F12) → Network tab → Select any API request → Check Response Headers:

```
Access-Control-Allow-Origin: https://<YOUR-FRONTEND-TUNNEL-URL>
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
```

---

## 6.5 (Optional) Configure Custom Domain with FreeDNS

While Cloudflare Tunnel provides HTTPS automatically, the tunnel URLs are temporary and change when pods restart. For a more permanent solution, you can use a free DNS service.

### Sign Up for FreeDNS

1. Go to https://freedns.afraid.org/
2. Create a free account
3. Navigate to "Subdomains" → "Add"

### Create CNAME Record

1. Choose a subdomain (e.g., `myapp.mooo.com`)
2. Type: `CNAME`
3. Destination: Your Cloudflare Tunnel URL (without https://)
4. Click "Save"

### Update Application URLs

After DNS propagates (5-15 minutes), you can access your application via the custom domain:

```
https://myapp.mooo.com/
```

**Note:** You'll need to update CORS configuration and rebuild frontend with the new domain if you use this approach.

---

## Troubleshooting

### Issue 1: CORS Errors in Browser Console

**Symptom:**

```
Access to XMLHttpRequest has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present
```

**Cause:** Backend CORS configuration doesn't include frontend Cloudflare Tunnel URL.

**Solution:**

1. Verify frontend tunnel URL is in backend's `allowedOrigins` array
2. Ensure `.trycloudflare.com` pattern is allowed in CORS config
3. Ensure CORS middleware is applied before routes: `app.use(cors(corsOptions));`
4. Rebuild and redeploy backend with updated CORS config
5. Hard refresh browser (Ctrl+Shift+R)

### Issue 2: Firebase Authentication Fails with Invalid API Key

**Symptom:**

```
FirebaseError: Firebase: Error (auth/invalid-api-key)
```

**Cause:** Firebase environment variables were not properly injected during Docker build.

**Solution:**

1. Verify Dockerfile has ARG and ENV declarations for all `VITE_*` variables (see Step 5)
2. Rebuild with `--build-arg` flags for each Firebase config value
3. Do NOT rely on `.env` file alone - it won't be available during Docker build
4. Use `--no-cache` flag to ensure fresh build:
   ```bash
   docker build --no-cache --build-arg VITE_FIREBASE_API_KEY="..." ...
   ```

### Issue 3: Environment Variables Not Applied in Production Build

**Symptom:** Application works locally with `npm run dev` but fails in Docker container.

**Cause:** Vite environment variables are build-time only and must be present during `npm run build`.

**Solution:**

1. Ensure all `VITE_*` variables are declared as ARG in Dockerfile
2. Convert ARG to ENV before running `npm run build`
3. Pass values via `--build-arg` when building Docker image
4. Never rely on runtime environment variables for Vite apps

Example Dockerfile structure:
```dockerfile
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build  # Build uses ENV variables
```

### Issue 4: Tunnel URLs Change After Pod Restart

**Symptom:** Application becomes inaccessible after pod restarts due to new tunnel URLs.

**Cause:** Cloudflare Tunnel generates random URLs for each tunnel instance.

**Solutions:**

1. **Quick fix:** Get new tunnel URLs and rebuild/redeploy with updated environment variables
   ```bash
   kubectl -n dev logs deploy/api-tunnel --tail=50 | Select-String "trycloudflare.com"
   kubectl -n dev logs deploy/fe-tunnel --tail=50 | Select-String "trycloudflare.com"
   ```
2. **Better approach:** Use Cloudflare Tunnel with named tunnels (requires Cloudflare account)
3. **Production approach:** Use traditional ingress with LoadBalancer and cert-manager

### Issue 5: Mixed Content Warnings

**Symptom:** Browser shows warnings about mixing HTTPS and HTTP content.

**Cause:** Some resources are being loaded over HTTP instead of HTTPS.

**Solution:**

1. Ensure `VITE_API_URL` uses `https://` not `http://`
2. Check all asset URLs in code use relative paths or HTTPS
3. Verify no hardcoded HTTP URLs in frontend code

---

## Tunnel Management

### View Tunnel Logs

```bash
# Backend API tunnel
kubectl -n dev logs -f deploy/api-tunnel

# Frontend tunnel
kubectl -n dev logs -f deploy/fe-tunnel
```

### Restart Tunnels (Generates New URLs)

```bash
kubectl -n dev rollout restart deployment/api-tunnel
kubectl -n dev rollout restart deployment/fe-tunnel

# Wait 10-20 seconds, then get new URLs
kubectl -n dev logs deploy/api-tunnel --tail=50 | Select-String "trycloudflare.com"
kubectl -n dev logs deploy/fe-tunnel --tail=50 | Select-String "trycloudflare.com"
```

### Delete Tunnels

```bash
kubectl -n dev delete deployment api-tunnel
kubectl -n dev delete deployment fe-tunnel
```

---

## Success Criteria

- Frontend accessible via HTTPS Cloudflare Tunnel URL
- Backend API accessible via HTTPS Cloudflare Tunnel URL
- No CORS errors in browser console
- Firebase authentication works correctly over HTTPS
- All API calls include proper Authorization headers
- No mixed content warnings
- User registration, login, and logout flow works end-to-end
- Protected routes are properly secured
- Application remains functional across page refreshes

