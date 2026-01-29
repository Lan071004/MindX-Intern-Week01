## Step 2: Deploy Application to Azure Kubernetes Service (AKS)

This guide walks you through deploying the containerized API from Step 1 to Azure Kubernetes Service (AKS).

---

### 1: Install kubectl via Azure CLI

In PowerShell, run:

```powershell
az aks install-cli
```

### 2: Verify kubectl Installation

Check if kubectl is installed correctly:

```powershell
kubectl version --client
```

### 3: Create AKS Cluster

Run the following command to create an AKS cluster:

```powershell
az aks create --name myaks --resource-group mygroup --node-count 1
```

**Note:** If you encounter quota errors, try creating the cluster in a different region:

```powershell
az aks create --name myaks --resource-group mygroup --node-count 1 --location japaneast
```

### 4: Configure AKS Access

Configure kubectl to connect to your AKS cluster:

```powershell
az aks get-credentials --name myaks --resource-group mygroup
```

### 5: Create Kubernetes Manifests

Write Kubernetes manifest files (.yaml) for your API. Reference:
https://kubernetes.io/docs/concepts/overview/working-with-objects/

You need to create **3 files**:

1. **`namespace.yaml`**: Creates the `dev` namespace.
   - You can use the default namespace instead, or declare the namespace directly in other files.

2. **`deployment.yaml`**: **Required** - A Deployment (or equivalent like Pod/ReplicaSet) to run the container. This is the main file.

3. **`service.yaml`**: **Required** - A Service to expose pods within the cluster. Separated for clarity.

### 6: Attach ACR to AKS

Attach your Azure Container Registry to the AKS cluster:

```powershell
az aks update `
  --resource-group <RG_NAME> `
  --name <AKS_NAME> `
  --attach-acr <ACR_NAME>
```

### 7: Get kubectl Credentials

Get kubectl credentials for your AKS cluster:

```powershell
az aks get-credentials `
  --resource-group <RG_NAME> `
  --name <AKS_NAME>
```

Verify connectivity by checking nodes:

```powershell
kubectl get nodes
```

### 8: Apply Manifests

Apply the Kubernetes manifests to deploy the API using the image from ACR. This creates the ClusterIP service and ports (defined in the service file):

```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### 9: Verify Deployment

Run the following commands to verify that ClusterIP and PORT have been created successfully:

```powershell
kubectl get pods -n dev
kubectl get svc -n dev
```

### 10: Test API from Local Machine

Open a new terminal and run the port-forward command:

```powershell
kubectl port-forward -n dev deployment/mindx-api 8080:3000
```

**Keep this terminal open - do not close it.**

### 11: Test API Endpoints

Open another new terminal to test the endpoints:

```powershell
curl.exe http://localhost:8080/health
curl.exe http://localhost:8080/
curl.exe "http://localhost:8080/hello?name=MindX"
```

Expected responses:

- `/health`: `{"status":"ok","uptime":...,"timestamp":"..."}`
- `/`: `{"message":"API is running","endpoints":["/health","/hello"]}`
- `/hello?name=MindX`: `{"message":"Hello, MindX!"}`

---

## Troubleshooting

### Image Pull Errors

If you encounter `ImagePullBackOff` or `401 Unauthorized` errors:

1. Ensure ACR is attached to AKS (Step 29)
2. If role assignment doesn't work, create an `imagePullSecret`:

```powershell
az acr credential show -n <ACR_NAME>
kubectl create secret docker-registry acr-pull `
  --docker-server=<ACR_NAME>.azurecr.io `
  --docker-username <USERNAME> `
  --docker-password <PASSWORD> `
  -n dev
```

Then add `imagePullSecrets` to your `deployment.yaml`:

```yaml
spec:
  template:
    spec:
      imagePullSecrets:
        - name: acr-pull
      containers:
        ...
```

### Port Forward Issues

If port-forward fails, ensure:
- The pod is in `Running` state (`kubectl get pods -n dev`)
- Port 8080 is not already in use on your local machine
- The deployment name matches (`mindx-api`)
