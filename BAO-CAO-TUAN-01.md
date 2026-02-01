# Báo cáo tiến độ tuần - MindX Training Week 01 Project

**Thời gian**: Tuần 1 (26/01/2026 - 02/02/2026)  
**Người thực hiện**: Nguyễn Ngọc Lan
**Mentors**: Trịnh Văn Thuận, Trần Thị Thanh Duyên

---

## Tổng quan tiến độ

| Bước | Mô tả | Trạng thái | Thời gian hoàn thành |
|------|-------|------------|---------------------|
| Step 1 | ACR & API Deployment | Hoàn thành | Thứ 3 (27/01) |
| Step 2 | BE AKS Deployment | Hoàn thành | Thứ 5 (29/01) |
| Step 3 | Ingress Controller | Hoàn thành | Thứ 6 (30/01) |
| Step 4 | FE AKS Deployment | Hoàn thành | Thứ 7 (31/01) |
| Step 5 | Firebase Authentication | Hoàn thành | Chủ nhật (01/02) |
| Step 6 | HTTPS Domain Setup | Hoàn thành | Chủ nhật (01/02) |

**Kết quả**: Hoàn thành 6/6 bước trong deadline (T+7)

---

## Timeline chi tiết

### **Thứ 2 (26/01)** - Chưa start
- **Lý do**: Đi chữa tủy răng
- **Ảnh hưởng**: Mất 1 ngày làm việc
- **Đánh giá rủi ro**: Nhận thấy nguy cơ không đủ thời gian hoàn thành 6 bước trong 7 ngày

### **Thứ 3 (27/01)** - Step 1 hoàn thành
- Tạo Express API với TypeScript
- Containerize API
- Setup Azure Container Registry
- Build và push image lên ACR
- Deploy lên Azure Web App (optional - để so sánh với AKS)
- **Thời gian**: 1 ngày làm việc

### **Thứ 4 (28/01)** - Không làm được
- **Lý do**: Học dồn lịch cả ngày (cả ca sáng + chiều + tối)
- **Ảnh hưởng**: Mất thêm 1 ngày làm việc
- **Tổng cộng đã mất**: 2/7 ngày

### **Thứ 5 (29/01)** - Step 2 hoàn thành
- Tạo AKS cluster
- Configure kubectl access
- Tạo Kubernetes manifests (deployment.yaml, service.yaml)
- Deploy API lên AKS từ ACR
- Verify deployment qua port-forward
- **Troubleshooting**: Gặp lỗi ImagePullBackOff → Fix bằng imagePullSecrets
- **Thời gian**: 1 ngày làm việc

### **Thứ 6 (30/01)** - Step 3 hoàn thành
- **Step 3**: Setup Ingress Controller
  - Install NGINX Ingress Controller qua Helm
  - Tạo ingress manifest
  - **Phát hiện vấn đề**: NSG blocking traffic → LoadBalancer có IP nhưng không truy cập được
  - **Giải pháp**: Áp dụng Cloudflare Tunnel theo hướng dẫn của mentor (từ troubleshooting Step 3)
- **Thời gian**: 1 ngày làm việc

### **Thứ 7 (31/01)** - Step 4 hoàn thành
- **Step 4**: Deploy Frontend
  - Tạo React app với Vite + TypeScript
  - Fix CORS ở backend
  - Containerize frontend và push lên ACR
  - Deploy frontend lên AKS
  - Update ingress cho full-stack routing
  - **Troubleshooting**: CORS errors → Đã fix bằng cách update backend CORS config

### **Chủ nhật (01/02)** - Step 5 & 6 hoàn thành

**Rủi ro phát sinh**:
- Cuối tuần không thể liên hệ mentor để xin OpenID credentials, whitelist, và hỗ trợ authentication setup
- Nguy cơ không hoàn thành Step 5 đúng deadline (còn 2 ngày, 2 bước còn lại)

**Phương án xử lý** (theo thứ tự ưu tiên):

1. **Cân đối lại scope** (Đã áp dụng):
   - Thay đổi từ OpenID authentication sang Firebase Authentication (custom method)
   - Lý do: Firebase không cần sự hỗ trợ từ mentor, có thể tự setup hoàn toàn
   - Trade-off: Mất cơ hội học về OpenID integration, nhưng đảm bảo hoàn thành đúng deadline

2. **Tìm thêm sự trợ giúp**: Không cần thiết vì đã chọn giải pháp độc lập

3. **Dời deadline**: Không cần thiết

**Step 5**: Firebase Authentication
- Setup Firebase project
- Implement auth context & components ở frontend
- Install Firebase Admin SDK ở backend
- Create auth middleware
- Rebuild và deploy cả frontend + backend với Firebase
- **Troubleshooting**: 
  - Firebase `invalid-api-key` error → Fix bằng inject trực tiếp Docker build args (Vite env variables are build-time only)
  - CORS errors với Cloudflare Tunnel URLs → Update backend CORS config
- **Thời gian**: 1 ngày

**Step 6**: HTTPS Domain Setup
- **Phát hiện vấn đề**: Làm xong bước 6.1 và 6.2 thì phát hiện NSG vẫn chưa được mở (vấn đề từ Step 3)
- **Giải pháp**: Sử dụng Cloudflare Tunnel thay vì traditional ingress + cert-manager
  - Deploy frontend tunnel
  - Deploy backend tunnel  
  - Update CORS config cho tunnel URLs
  - Rebuild frontend với tunnel URL
- (Optional) Setup custom domain với FreeDNS
- Verify full authentication flow qua HTTPS
- **Thời gian**: 1 ngày

**Kết quả cuối tuần**: Hoàn thành cả 2 bước đúng deadline

---

## Các vấn đề gặp phải & Giải pháp

### 1. **NSG Blocking Traffic** (Step 3 & 6)
**Vấn đề**: Network Security Group chặn traffic, không thể truy cập LoadBalancer từ internet

**Giải pháp**: 
- Áp dụng Cloudflare Tunnel (theo troubleshooting guide từ mentor ở Step 3)
- Tạo outbound tunnel từ AKS → Cloudflare → Internet
- Bypass hoàn toàn NSG restrictions

**Kết quả**: Application accessible qua HTTPS với temporary URLs

### 2. **CORS Errors** (Step 4 & 6)
**Vấn đề**: Frontend không thể gọi API do CORS policy

**Giải pháp**:
- Update backend Express CORS config để cho phép:
  - Localhost (dev)
  - Cloudflare Tunnel domains
  - Pattern matching cho `.trycloudflare.com`
- Rebuild và redeploy backend

**Kết quả**: Frontend-to-backend communication hoạt động qua HTTPS

### 3. **Firebase Environment Variables** (Step 5)
**Vấn đề**: Firebase credentials không được inject vào production build

**Giải pháp**:
- Update Dockerfile với ARG + ENV declarations
- Build với `--build-arg` flags
- Không dùng `.env` file (Vite variables are build-time only)

**Kết quả**: Firebase authentication hoạt động trong production

### 4. **ImagePullBackOff** (Step 2 & 4)
**Vấn đề**: AKS không pull được image từ ACR (401 Unauthorized)

**Giải pháp**:
- Create `imagePullSecrets` với ACR credentials
- Add vào deployment manifests

**Kết quả**: Pods pull images thành công

### 5. **Không có support từ mentor vào cuối tuần** (Step 5)
**Vấn đề**: Không thể xin OpenID credentials và whitelist

**Giải pháp** (Cân đối scope):
- Chuyển sang Firebase Authentication
- Self-service setup, không cần mentor support
- Trade-off: Học Firebase thay vì OpenID

**Kết quả**: Hoàn thành authentication đúng deadline

---

## Bài học kinh nghiệm

### Làm tốt:
1. **Báo rủi ro sớm**: Nhận ra nguy cơ trễ deadline từ Thứ 2 (mất 1 ngày) và Thứ 4 (mất thêm 1 ngày)
2. **Cân đối scope linh hoạt**: Chuyển từ OpenID sang Firebase khi không có support
3. **Tận dụng troubleshooting sẵn có**: Áp dụng Cloudflare Tunnel solution từ Step 3 vào Step 6
4. **Làm việc hiệu quả**: Hoàn thành 2 bước trong 1 ngày (Step 3 + 4 vào Thứ 6)

### Cần cải thiện:
1. **Time estimation**: Đánh giá thấp thời gian cần thiết cho troubleshooting
2. **Dependency planning**: Nên xin OpenID access sớm hơn (không chờ đến cuối tuần)
3. **Risk mitigation**: Nên có backup plan cho authentication method từ đầu tuần

### Áp dụng cho lần sau:
1. **Plan buffer time**: Reserve 1-2 ngày cho unexpected issues
2. **Early communication**: Hỏi mentor về dependencies ngay từ đầu tuần (Thứ 2-3)
3. **Parallel planning**: Chuẩn bị backup solutions cho critical dependencies

---

## Deliverables

### Code Repository
- Full-stack application với 6 steps hoàn chỉnh
- Tất cả Kubernetes manifests
- Documentation cho từng step
- Git history rõ ràng với meaningful commits

### Live Application
- **Frontend**: https://exec-subject-wesley-make.trycloudflare.com/
- **Backend API**: https://doom-elvis-carries-terrorist.trycloudflare.com/
- **Features**:
  - User registration & login (Firebase)
  - Protected routes
  - JWT token validation
  - HTTPS/SSL (via Cloudflare)
  - Full-stack communication

### Documentation
- Step-by-step guides (STEP1-6.md)
- Troubleshooting guides
- Architecture diagrams (optional)

---

## Tổng kết

**Kết quả**: **Hoàn thành 100% yêu cầu trong deadline (T+7)**

**Thời gian thực tế làm việc**: 5/7 ngày
- Mất 2 ngày (Thứ 2: răng, Thứ 4: học)
- Làm việc hiệu quả trong 5 ngày còn lại
- Compensate bằng cách làm 2 bước trong 1 ngày (Thứ 6) và làm cuối tuần

**Phương pháp xử lý deadline**:
1. Nhận diện rủi ro sớm (sau Thứ 4)
2. Cân đối scope (Firebase thay vì OpenID)
3. Tận dụng solutions có sẵn (Cloudflare Tunnel)
4. Không dời deadline

**Đánh giá tổng quan**:
- Dự án hoàn thành đúng hạn
- Tất cả features hoạt động ổn định
- Application accessible qua HTTPS
- Authentication flow hoạt động end-to-end
- Documentation đầy đủ cho reproduction

---

## Kế hoạch tiếp theo

**Nếu có thời gian thêm (optional improvements)**:
1. Migrate từ Cloudflare Tunnel sang traditional ingress + cert-manager (khi NSG được mở)
2. Setup named Cloudflare Tunnels cho persistent URLs
3. Implement refresh token mechanism
4. Add monitoring & logging (Prometheus, Grafana)
5. Setup CI/CD pipeline

**Ưu tiên**: Chờ feedback từ mentor trước khi implement improvements

---

**Người lập**: Nguyễn Ngọc Lan 
**Ngày**: 01/02/2026  
**Mentors review**: Trịnh Văn Thuận, Trần Thị Thanh Duyên