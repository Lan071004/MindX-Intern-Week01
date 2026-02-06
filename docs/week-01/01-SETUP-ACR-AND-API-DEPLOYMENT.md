## Azure Containerized Express API

This project is a production-ready Node.js/TypeScript Express API designed to run as a Docker container and be deployed to **Azure Web App for Containers** using **Azure Container Registry (ACR)**.

### 1. Local development

- **Install dependencies**:

```bash
npm install
```

- **Run in watch/dev mode**:

```bash
npm run dev
```

The API will listen on `http://localhost:3000`.

- **Key endpoints**:
  - `GET /health` – health check
  - `GET /hello` – hello world JSON (`?name=YourName` optional)

### 2. Build for production

```bash
npm run build
npm start
```

### 3. Docker build and run

```bash
docker build -t myapi:latest .
docker run -p 3000:3000 myapi:latest
```

### 4. Azure Container Registry (ACR)

> You need Azure CLI installed and permissions to create/use ACR.

- **Login to Azure**:

```bash
az login
az account set --subscription "<SUBSCRIPTION_ID_OR_NAME>"
```

- **Create ACR (DevOps/permissions may be required)**:

```bash
az acr create --name myregistry --resource-group mygroup --sku Basic --admin-enabled true
```

If this fails due to permissions, ask your DevOps team to create the registry and grant you `AcrPush` or higher role, or share admin credentials.

- **Login Docker to ACR**:

```bash
az acr login --name myregistry
```

### 5. Build and push image to ACR

First, get the ACR login server:

```bash
az acr show --name myregistry --resource-group mygroup --query "loginServer" -o tsv
```

Assume it returns `myregistry.azurecr.io`. Then:

```bash
docker build -t myregistry.azurecr.io/azure-express-api:1.0.0 .
docker push myregistry.azurecr.io/azure-express-api:1.0.0
```

You can verify the image is in ACR:

```bash
az acr repository list --name myregistry -o table
az acr repository show-tags --name myregistry --repository azure-express-api -o table
```

### 6. Azure Web App for Containers

> You need permissions to create an App Service plan and Web App.

- **Create App Service plan**:

```bash
az appservice plan create \
  --name myplan \
  --resource-group mygroup \
  --is-linux \
  --sku B1
```

- **Create Web App using the ACR image**:

```bash
az webapp create \
  --name myapp \
  --resource-group mygroup \
  --plan myplan \
  --deployment-container-image-name myregistry.azurecr.io/azure-express-api:1.0.0
```

If you cannot run the command due to permissions, ask DevOps to create the Web App and give you **App Service Contributor** role.

- **Configure Web App to use ACR auth (if not using anonymous pull)**:

```bash
az webapp config container set \
  --name myapp \
  --resource-group mygroup \
  --docker-registry-server-url https://myregistry.azurecr.io \
  --docker-registry-server-user <ACR_USERNAME> \
  --docker-registry-server-password <ACR_PASSWORD>
```

You can get username/password from:

```bash
az acr credential show --name myregistry -o table
```

### 7. Configure app settings and health

Set the `PORT` (optional, defaults to `3000`) and `WEBSITES_PORT` (for Azure to route traffic):

```bash
az webapp config appsettings set \
  --name myapp \
  --resource-group mygroup \
  --settings PORT=3000 WEBSITES_PORT=3000 NODE_ENV=production
```

### 8. Verify deployment

Once deployed, your app URL is:

```text
https://myapp.azurewebsites.net
```

Check:

- `https://myapp.azurewebsites.net/health`
- `https://myapp.azurewebsites.net/hello`

For logs:

```bash
az webapp log tail --name myapp --resource-group mygroup
```

### 9. Git repository setup

From the project root:

```bash
git init
git add .
git commit -m "feat: initial Azure containerized Express API"
git remote add origin <YOUR_REMOTE_URL>
git push -u origin main
git tag v1.0.0
git push origin v1.0.0
```
