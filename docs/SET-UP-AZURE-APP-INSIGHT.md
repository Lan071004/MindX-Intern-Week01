# Azure Application Insights Setup Guide

## Part 1: Create Application Insights Resource

### Step 1: Create App Insights

1. Navigate to Azure Portal → Search for "Application Insights"
2. Click **Create**
3. Fill in the information:
   - **Resource Group**: `resource-group-here` (select existing)
   - **Name**: `mindx-app-insights`
   - **Region**: Japan East (same region as AKS)
   - **Resource Mode**: Workspace-based (recommended)
   - **Log Analytics Workspace**: Create new or select existing
4. Click **Review + Create** → **Create**

### Step 2: Get Connection String

1. After creation, click on the blue resource link `mindx-app-insights`
2. Copy the **Connection String**
3. Save it for later use (example format: `InstrumentationKey=xxx;IngestionEndpoint=...`)

---

## Part 2: Backend Integration

### Add Connection String to Deployment

1. **Update deployment.yaml** in the k8s backend folder:
   - Add environment variable at the `env` level
   - Include `name` and `value` (the connection string from above)

2. **Install Application Insights SDK**:
   ```bash
   npm install applicationinsights --save
   ```

3. **Update index.ts file**:
   Add these 2 LINES AT THE TOP OF THE FILE, before all other imports:
   ```typescript
   import * as appInsights from 'applicationinsights';
   appInsights.setup().start();
   const client = appInsights.defaultClient;
   ```

4. **Build Docker image**:
   ```bash
   docker build -t <<ACR-NAME>>.azurecr.io/<<BE-NAME>>:v1.x.x .
   ```

5. **Login to ACR** (if not already logged in):
   ```bash
   az acr login --name <<ACR-NAME>>
   ```

6. **Push Docker image**:
   ```bash
   docker push <<ACR-NAME>>.azurecr.io/<<BE-NAME>>:v1.x.x .
   ```

7. **Update image version** in deployment.yaml

8. **Apply deployment**:
   ```bash
   kubectl apply -f deployment.yaml
   ```

9. **Check rollout status**:
   ```bash
   kubectl rollout status deployment/<<BE-NAME>> -n dev
   ```

10. **View logs** to confirm App Insights connection:
    ```bash
    kubectl logs -f deployment/<<BE-NAME>> -n dev --tail=50
    ```

---

### Troubleshooting: "crypto is not defined" Error

**Why this error occurs**:
- Application Insights SDK requires Node.js crypto module
- When building Docker image with Alpine Linux + production dependencies only, some dependencies are missing
- Crypto module is not bundled correctly in production build

#### Solution 1: Update Dockerfile

**Problem Dockerfile**:
```dockerfile
RUN npm ci --only=production  # ← Missing dependencies
```

**Fixed Dockerfile**:
```dockerfile
RUN npm ci  # ← Install all dependencies (don't use --production)
```

#### Solution 2: Add Crypto Polyfill

1. Create new file `src/polyfills.ts`
2. Import it in `src/index.ts`
3. Build, push, and deploy again (follow steps above)

#### Solution 3: Downgrade Application Insights SDK

If solutions 1 and 2 don't work:

```bash
# Uninstall current version
npm uninstall applicationinsights

# Install stable version
npm install applicationinsights@2.9.5 --save
```

---

### Testing

11. **Test API**:
    ```bash
    curl https://doom-elvis-carries-terrorist.trycloudflare.com/health
    ```

12. **Check Application Insights** (after 5-10 minutes):
    - Go to Azure Portal → Application Insights → Logs
    - Select KQL (Kusto Query Language) mode
    - Run this query (get 10 most recent requests from the past hour, sorted newest → oldest):
    ```kusto
    requests
    | where timestamp > ago(1h)
    | order by timestamp desc
    | take 10
    ```
    - If you see requests appearing → Success!

---

## Part 3: Set Up Alerts

### Alert 1: Response Time Alert

1. Go to Application Insights → `mindx-app-insights`
2. Sidebar → **Alerts** → **Create** → **Alert rule**
3. **Scope**: Already selected `mindx-app-insights`
4. **Condition**:
   - **Signal name**: Search for "Server response time" or "requests/duration"
   - **Threshold type**: Static
   - **Aggregation type**: Average
   - **Operator**: Greater than
   - **Threshold value**: 1000 (ms = 1 second)
   - **Check frequency**: 1 minute
   - **Lookback period**: 5 minutes

   > **Static Threshold**: Alert triggers when average response time > 1 second within 5 minutes  
   > **Dynamic Threshold**: Alert triggers when response time exceeds dynamic threshold (Azure calculates automatically)

5. **Actions**:
   - Select **Use action group**
   - Click **Create action group**
   - **Subscription**: Select your subscription
   - **Resource group**: `resource-group-here`
   - **Region**: Global (recommended)
   - **Action group name**: `email-alerts`
   - **Display name**: Email Alerts

6. **Notifications**:
   - **Notification type**: Email/SMS message/Push/Voice
   - Check **Email**
   - Enter email: `emailhere@mindx.com.vn` (or your preferred email)
   - **Enable the common alert schema**: Yes
   - Click **OK**
   - **Name**: Email <<NameHere>>

7. Click **Review + create** → **Create**
8. Action group created, return to Alert Rule screen

9. Click **Next: Details**
   - **Severity**: 2 - Warning (or 1 - Error for higher severity)
   - **Alert rule name**: High Response Time Alert
   - **Alert rule description**: Alert when average server response time exceeds 1 second
   - **Enable upon creation**: Check
   - **Automatically resolve alerts**: Check
   - Click **Review + create** → **Create**

---

### Alert 2: Exception/Error Alert

1. Go to Application Insights → `mindx-app-insights`
2. Sidebar → **Alerts** → **Create** → **Alert rule**
3. **Scope**: Already selected `mindx-app-insights`
4. **Condition**:
   - **Signal name**: Search for "Exceptions" or "Failed requests"
   - **Threshold type**: Static
   - **Aggregation type**: Count (or Total)
   - **Operator**: Greater than
   - **Unit**: Count
   - **Threshold value**: 10 (10 exceptions in 5 minutes)
   - **Check frequency**: 1 minute
   - **Lookback period**: 5 minutes

5. **Actions**: Select the `email-alerts` action group created in Alert 1

6. **Details**:
   - **Severity**: 1 - Error
   - **Alert rule name**: High Exception Rate Alert
   - **Alert rule description**: Alert when exception count exceeds 10 in 5 minutes
   - **Enable upon creation**: Check
   - **Automatically resolve alerts**: Check
   - Click **Review + create** → **Create**

7. **Test** to check for exceptions (no exceptions is good; having them means the alert is working):
   ```kusto
   exceptions
   | where timestamp > ago(1h)
   | project timestamp, type, outerMessage, problemId
   | order by timestamp desc
   ```

---

### Alert 3: Availability Alert

1. Go to Application Insights → **Investigate** → **Availability**
2. Click **Add Standard test**
3. Fill in:
   - **Test name**: Backend Health Check
   - **URL**: `https://doom-elvis-carries-terrorist.trycloudflare.com/health` (or your endpoint)
   - **Test frequency**: 5 minutes
   - **Test locations**: Select 3-5 locations (East Asia, Southeast Asia, Japan East, West US, North Europe)
   - **Success criteria**: 
     - HTTP status code: 200
     - Test timeout: 30 seconds

4. **Success criteria**:
   - **Test timeout**: 30 seconds
   - **HTTP status code**: 200
   - **Content match**: (Optional) Leave blank or enter `"status":"ok"`

5. **Alerts**: Check **Enable**
   - Select action group `email-alerts` created earlier

6. Click **Create** → Availability Test + Alert created!

7. **Test the alert**:
   - Temporarily shut down backend:
     ```bash
     kubectl scale deployment/<<BE-NAME>> --replicas=0 -n dev
     ```
   - Wait 10-15 minutes → Check email → You should receive an alert
   - Quick check (without waiting for email):
     - Azure Portal → Application Insights → Availability
     - You should see "backend health check-mindx-app-insights" X Fired
   - Turn it back on:
     ```bash
     kubectl scale deployment/<<BE-NAME>> --replicas=2 -n dev
     ```

---

## Part 4: View Logs & Metrics (No-Code)

### A. View Logs

Use the test queries from Part 3 steps above.

### B. View Performance Metrics

1. Sidebar → **Investigate** → **Performance**
2. View charts:
   - **Operations**: Which APIs are being called?
   - **Dependencies**: Where is this service calling? (DB, external API)
   - **Roles**: Which service/component is generating traffic & metrics?

### C. Metrics Explorer

1. Sidebar → **Monitoring** → **Metrics**
2. **Metric**: Select "Server response time"
3. **Aggregation**: Select "Average"
4. You'll see the chart

### D. Application Map

1. Sidebar → **Application Map**
2. You'll see:

   **Web Node**: Large green circle on the right
   - Green = healthy
   - Web = your backend service
   - 4 instances → 4 pods/instances running (or 4 role instances detected by App Insights)
   - 1.5 ms → Average processing time (very fast)
   - 766 calls → Total requests to backend in the selected time frame

   **Backend Health Check Node**: Circle with globe icon
   - This is the Availability Test you configured
   - Azure periodically calls the endpoint (e.g., /health)
   - 67% = success rate / total tests in 1 hour

   **Arrow from Availability → Web**:
   - Availability test called backend 60 times
   - Average response time ~ 763 ms (Includes: network + Cloudflare Tunnel + backend response)

