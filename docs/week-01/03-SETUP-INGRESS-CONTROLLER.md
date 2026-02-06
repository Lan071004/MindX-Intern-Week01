# Step 3: Setup Ingress Controller for API Access

This step configures the ingress controller in the AKS cluster to provide external access to the API service. It establishes external routing and prepares the infrastructure to handle multiple services with appropriate URL-based routing.

## Prerequisites

- Step 2 completed with API deployed to AKS and running internally
- API service accessible via ClusterIP within the cluster
- kubectl configured to access the AKS cluster

## 3.1 Verify Cluster Access and Service Status

### 35. Verify kubectl is configured to access the AKS cluster

```bash
kubectl cluster-info
```

### 36. Verify API service is accessible via ClusterIP within the cluster

```bash
kubectl run curl-test --rm -i --restart=Never --image=curlimages/curl -n dev -- curl -s -w "\nHTTP:%{http_code}" http://mindx-api.dev.svc.cluster.local:80/health
```

## 3.2 Install and Configure Ingress Controller

This section covers installing the NGINX Ingress Controller using Helm.

### Create namespace for ingress

```bash
kubectl create namespace ingress-nginx
```

Verify namespace creation:

```bash
kubectl get ns
```

### Install Helm (if not already installed)

First, check if Chocolatey is installed on your machine:

```bash
choco -v
```

If Chocolatey is available, install Helm (open PowerShell as Administrator):

```bash
choco install kubernetes-helm -y
```

Verify Helm installation:

```bash
helm version
```

### Install Ingress Controller using Helm

Add the ingress-nginx Helm repository:

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
```

Install the ingress controller:

```bash
helm install ingress-nginx ingress-nginx/ingress-nginx `
  --namespace ingress-nginx `
  --set controller.service.type=LoadBalancer
```

Verify the pod is running:

```bash
kubectl get pods -n ingress-nginx
```

Check the service and note the External IP:

```bash
kubectl get svc -n ingress-nginx
```

**Important:** Record the External IP address (e.g., 52.xxx.xxx.200) - you'll need this for testing.

## 3.3 Create and Apply Ingress Manifest

### 38. Create ingress YAML manifest

Ensure your ingress manifest matches the configurations from previous YAML files in the `/k8s` folder.

Apply the ingress configuration:

```bash
kubectl apply -f k8s/ingress.yaml
```

Verify the ingress is created:

```bash
kubectl get ingress -n dev
```

This should display the public address (e.g., 52.xxx.xxx.200).

## 3.4 Test the API

Test the API endpoints using the External IP:

```bash
curl http://52.xxx.xxx.200/api
curl http://52.xxx.xxx.200/api/health
```

## Troubleshooting

### Issue: Cannot access API despite LoadBalancer having IP

If testing fails but:
- Azure LoadBalancer has an IP
- Ingress Controller is running
- Pods and Services are OK

**Root Cause:** Network Security Group (NSG) is blocking traffic.

**Solution:** Contact someone with Owner or Network Contributor role to check and configure NSG settings:
- Verify correct ports are open
- Ensure TCP traffic is allowed
- Confirm source is set to Internet
- Verify destination is set to AKS node subnet
- Check if cluster is public or private

Alternatively, your mentor can check and configure NSG settings for you.

### Alternative Solution: Cloudflare Tunnel (if NSG cannot be modified)

If NSG access is not possible, use a tunnel solution for outbound connectivity.

**How it works:**

Traditional flow (blocked):
```
Internet ─X─> NSG ─X─> AKS
```

New flow with tunnel:
```
AKS ──(outbound HTTPS)──> Cloudflare ──> Internet
```

**Implementation:**
1. Deploy a pod running cloudflared to create an outbound tunnel to Cloudflare
2. Tunnel points to internal Kubernetes Service (api:80)
3. Cloudflare provides a public URL

**Note:** The URL is temporary (changes when pod restarts). This solution is suitable for dev/demo/testing purposes only.

#### Deploy Cloudflare Tunnel

```bash
kubectl -n dev create deployment api-tunnel `
  --image=cloudflare/cloudflared:latest `
  -- cloudflared tunnel --no-autoupdate --url http://mindx-api:80
```

#### Get the public URL

Wait a moment for the system to create the tunnel, then run:

```bash
kubectl -n dev logs deploy/api-tunnel --tail=200
```

Look for a URL like: `https://bytes-amber-preference-since.trycloudflare.com`

#### Test the API via tunnel

```bash
curl https://bytes-amber-preference-since.trycloudflare.com/
curl https://bytes-amber-preference-since.trycloudflare.com/health
```
