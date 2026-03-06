# Research: Hexagonal Architecture & Test-Driven Development

**Author:** Nguyễn Ngọc Lan  
**Program:** MindX Onboard Training — Week 03  

---

## Table of Contents

1. [Hexagonal Architecture là gì?](#1-hexagonal-architecture-là-gì)
2. [Core Concepts](#2-core-concepts)
3. [Cách Hexagonal Architecture hoạt động](#3-cách-hexagonal-architecture-hoạt-động)
4. [Ưu & Nhược điểm](#4-ưu--nhược-điểm)
5. [Khi nào nên dùng Hexagonal Architecture?](#5-khi-nào-nên-dùng-hexagonal-architecture)
6. [So sánh với các kiến trúc khác](#6-so-sánh-với-các-kiến-trúc-khác)
7. [Test-Driven Development (TDD)](#7-test-driven-development-tdd)
8. [TDD + Hexagonal Architecture: Sức mạnh kết hợp](#8-tdd--hexagonal-architecture-sức-mạnh-kết-hợp)
9. [Áp dụng vào project thực tế](#9-áp-ụng-vào-project-thực-tế)
10. [References](#10-references)

---

## 1. Hexagonal Architecture là gì?

Hexagonal Architecture (còn gọi là **Ports and Adapters**) là một kiến trúc phần mềm được **Alistair Cockburn** giới thiệu vào năm 2005. Mục tiêu cốt lõi là **tách biệt hoàn toàn business logic khỏi các hệ thống bên ngoài** như database, framework, API hay giao diện người dùng.

Tên "Hexagonal" (lục giác) mang tính biểu tượng — hình lục giác thể hiện rằng ứng dụng có thể có nhiều "mặt", mỗi mặt kết nối với một hệ thống bên ngoài khác nhau thông qua các interface được định nghĩa rõ ràng.

**Vấn đề mà Hexagonal Architecture giải quyết:**

Trong các dự án truyền thống, business logic thường bị phân tán và xen lẫn với code của framework, database, hay external service. Hậu quả là:
- Rất khó test vì logic phụ thuộc vào database thật hoặc HTTP server thật
- Thay đổi công nghệ (ví dụ: đổi từ MySQL sang MongoDB) đòi hỏi sửa đổi logic nghiệp vụ
- Code ngày càng khó maintain và mở rộng

Hexagonal Architecture giải quyết điều này bằng cách đặt **domain logic ở trung tâm**, hoàn toàn độc lập, và để các hệ thống bên ngoài kết nối vào thông qua **ports** và **adapters**.

---

## 2. Core Concepts

### 2.1 Domain (Inside the Hexagon)

Lớp trong cùng chứa **business logic và domain models** — đây là trái tim của ứng dụng. Tất cả các rules, calculations, và workflows định nghĩa *ứng dụng làm gì* đều nằm ở đây. Layer này **không biết gì** về database, web framework, hay external API.

```
domain/
├── entities/     ← các đối tượng nghiệp vụ (User, Order, Product...)
├── services/     ← business logic thuần túy
└── errors/       ← domain-level error types
```

### 2.2 Ports (The Interfaces)

Ports là các **entry point và exit point** của ứng dụng — đơn giản là các interface định nghĩa cách thế giới bên ngoài tương tác với domain. Có hai loại:

| Loại | Tên khác | Vai trò | Ví dụ |
|------|----------|---------|-------|
| **Primary Ports** | Inbound / Driving Ports | Cho phép external actors *gọi vào* domain | `IAuthService`, `IOrderService` |
| **Secondary Ports** | Outbound / Driven Ports | Domain *gọi ra* external systems | `ITokenVerifier`, `IUserRepository` |

```typescript
// Primary Port — định nghĩa use case expose ra ngoài
export interface IAuthService {
  verifyToken(token: string): Promise<User>;
}

// Secondary Port — định nghĩa cách domain gọi ra external service
export interface ITokenVerifier {
  verifyToken(token: string): Promise<DecodedToken>;
}
```

### 2.3 Adapters (The Connectors)

Adapters là các **concrete implementations** kết nối thế giới thực với ports. Tương ứng với hai loại port, có hai loại adapter:

| Loại | Tên khác | Vai trò | Ví dụ |
|------|----------|---------|-------|
| **Primary Adapters** | Inbound / Driving Adapters | Nhận request từ ngoài, gọi vào domain | REST Controller, CLI Handler, Event Listener |
| **Secondary Adapters** | Outbound / Driven Adapters | Thực thi các gọi ra external system | Firebase Adapter, PostgreSQL Repository, Email Service |

```typescript
// Secondary Adapter — implements Secondary Port bằng Firebase
export class FirebaseTokenVerifier implements ITokenVerifier {
  async verifyToken(token: string): Promise<DecodedToken> {
    const decoded = await admin.auth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email };
  }
}
```

### 2.4 Application Layer (Use Cases)

Nằm giữa domain và adapters, layer này **orchestrate** các domain objects để thực hiện một use case cụ thể. Use case implements primary port và phụ thuộc vào secondary port — không biết gì về framework hay external services.

```typescript
export class VerifyTokenUseCase implements IAuthService {
  constructor(private readonly tokenVerifier: ITokenVerifier) {}

  async verifyToken(token: string): Promise<User> {
    // Không biết Firebase, không biết Express
    const decoded = await this.tokenVerifier.verifyToken(token);
    return { uid: decoded.uid, email: decoded.email };
  }
}
```

---

## 3. Cách Hexagonal Architecture hoạt động

### Data Flow — Inward (Request)

```
HTTP Request / Event / CLI Input
        ↓
  Primary Adapter          (REST Controller, Middleware)
        ↓
  Primary Port             (IAuthService interface)
        ↓
  Use Case                 (VerifyTokenUseCase)
        ↓
  Domain Logic             (User entity, AuthError)
```

### Data Flow — Outward (Response)

```
  Domain Logic
        ↓
  Secondary Port           (ITokenVerifier interface)
        ↓
  Secondary Adapter        (FirebaseTokenVerifier)
        ↓
  External System          (Firebase Admin SDK)
        ↓
  Response trả về
```

### Ví dụ thực tế: E-commerce

Giả sử bạn xây dựng ứng dụng e-commerce:
- **Domain** chứa logic: *"tính tổng đơn hàng"*, *"áp dụng mã giảm giá"*, *"kiểm tra tồn kho"*
- Khi user đặt hàng qua web, **REST Controller** (primary adapter) nhận HTTP request, convert sang domain command, gọi qua primary port
- Domain cần kiểm tra tồn kho → gọi `IInventoryRepository` (secondary port) → **Database Adapter** thực thi SQL query
- Domain không biết request đến từ web hay mobile app, không biết database là PostgreSQL hay MongoDB

Kết quả: có thể **đổi MySQL sang PostgreSQL**, **thay REST bằng GraphQL**, hoặc **thêm mobile app interface** mà không cần chạm vào business logic.

---

## 4. Ưu & Nhược điểm

### Ưu điểm

**Testability** — Business logic không phụ thuộc external systems, có thể test hoàn toàn bằng mock. Không cần spin up database hay external services cho unit tests. Tests chạy nhanh và reliable hơn.

**Flexibility** — Muốn đổi database? Thay REST bằng GraphQL? Thêm CLI interface? Chỉ cần tạo adapter mới, không cần sửa business logic.

**Technology Independence** — Business logic không bị lock vào bất kỳ framework hay library nào. Khi có công nghệ tốt hơn, có thể migrate mà không cần rewrite domain.

**Clear Boundaries** — Kiến trúc enforce separation of concerns rõ ràng. Developer ngay lập tức biết code thuộc loại nào nên đặt ở đâu.

**Codebase có thể dùng chung** — Domain logic có thể tái sử dụng cho frontend, backend, hay mobile app vì không phụ thuộc platform.

**Hạn chế rủi ro khi chọn công nghệ** — Vì có thể swap adapter bất kỳ lúc nào, áp lực chọn đúng công nghệ ngay từ đầu giảm đi đáng kể.

### Nhược điểm

**Complexity** — Cấu trúc phức tạp hơn, nhiều file và layer hơn so với kiến trúc đơn giản.

**Overhead** — Tốn thời gian setup ban đầu, đặc biệt với dự án nhỏ.

**Learning curve** — Cần thời gian để team hiểu và áp dụng đúng nguyên tắc dependency direction.

---

## 5. Khi nào nên dùng Hexagonal Architecture?

### Nên dùng khi:
- Ứng dụng có **business logic phức tạp** đáng để tổ chức cẩn thận
- Dự án **dài hạn** cần evolve theo thời gian
- Hệ thống cần **nhiều interface** (web, mobile, API, CLI)
- Team theo hướng **TDD** — ports là mock points tự nhiên
- Quyết định công nghệ có thể thay đổi trong tương lai

### Không nên dùng khi:
- Ứng dụng **CRUD đơn giản** không có business logic phức tạp
- **Prototype** hay proof-of-concept ngắn hạn
- **Team nhỏ** chưa quen với kiến trúc phân tầng

---

## 6. So sánh với các kiến trúc khác

### Hexagonal vs Traditional Layered Architecture

| Tiêu chí | Traditional Layered | Hexagonal |
|----------|--------------------|-----------| 
| Dependency direction | Luôn từ trên xuống (UI → Business → Data) | Hướng vào trong (Adapters → Domain) |
| Testability | Khó — các layer phụ thuộc nhau theo chiều dọc | Dễ — domain hoàn toàn independent |
| Technology lock-in | Cao — business logic thường biết về DB/framework | Thấp — chỉ adapters biết về external systems |
| Số interface trong dự án | Thường 1 (web) | Có thể nhiều (web, CLI, event...) |

### Hexagonal vs Clean Architecture

Hai kiến trúc này có **cùng triết lý** — dependency hướng vào trong, domain không phụ thuộc framework — nhưng khác nhau về cách tổ chức:

| Tiêu chí | Hexagonal Architecture | Clean Architecture |
|----------|----------------------|-------------------|
| Người tạo | Alistair Cockburn (2005) | Robert C. Martin / Uncle Bob |
| Hình dạng biểu tượng | Lục giác | Vòng tròn đồng tâm |
| Số layer | 3 phần chính (Domain, Ports, Adapters) | 4–5 layer (Entities, Use Cases, Interface Adapters, Frameworks) |
| Terminology | Ports & Adapters | Use Cases, Gateways, Controllers, Presenters |
| Điểm chung | Domain ở trung tâm, dependency rules giống nhau | ← |

> **Lưu ý:** Clean Architecture chi tiết hơn về cách tổ chức từng layer bên trong, còn Hexagonal tập trung vào ranh giới giữa inside và outside. Trong thực tế, nhiều dự án kết hợp cả hai.

---

## 7. Test-Driven Development (TDD)

### TDD là gì?

**Test-Driven Development (TDD)** là phương pháp phát triển phần mềm trong đó **test được viết trước** khi viết code thực thi. Mục đích chính là tạo ra code rõ ràng, đơn giản và ít lỗi.

> *"Write the test first, then write just enough code to make it pass."*

### Red-Green-Refactor Cycle

TDD vận hành theo vòng lặp lặp đi lặp lại gọi là **Red-Green-Refactor**:

```
        ┌─────────────────────────────┐
        │                             │
        ▼                             │
   🔴 RED                             │
   Viết test → test FAIL              │
   (vì code chưa tồn tại)            │
        │                             │
        ▼                             │
   🟢 GREEN                           │
   Viết đủ code để test PASS          │
   (không cần hoàn hảo)              │
        │                             │
        ▼                             │
   🔵 REFACTOR                        │
   Làm sạch code, giữ test PASS  ────┘
```

### 5 bước thực hành TDD

1. **Tạo test** — Viết unit test cho một chức năng nhỏ chưa tồn tại
2. **Chạy test → FAIL** — Confirm test hoạt động đúng (nếu pass ngay là test sai)
3. **Viết code** — Viết đủ code để pass test, không hơn
4. **Chạy test → PASS** — Confirm code đúng
5. **Refactor** — Làm sạch code, loại bỏ duplication, giữ test pass
6. **Lặp lại** cho chức năng tiếp theo

### TDD vs Traditional Testing

| Tiêu chí | Traditional Testing | TDD |
|----------|--------------------|----|
| Thứ tự | Code trước → Test sau | Test trước → Code sau |
| Code coverage | Thường không đạt 100% | 100% — mọi dòng code đều có test |
| Focus | Thiết kế test case | Production code quality |
| Debugging time | Cao hơn với project lớn | Thấp hơn — lỗi được phát hiện sớm |
| Documentation | Cần viết riêng | Test chính là documentation |

### Công cụ TDD phổ biến

Theo ngôn ngữ/platform:

| Platform | Tools |
|----------|-------|
| JavaScript/TypeScript | Jest, Vitest, Mocha |
| Java | JUnit, TestNG, JMock |
| Python | PyUnit, pytest |
| .NET | NUnit, csUnit |
| PHP | PHPUnit, SimpleTest |
| Ruby | Test::Unit |
| C/C++ | CUnit, cppUnit |

---

## 8. TDD + Hexagonal Architecture: Sức mạnh kết hợp

### Tại sao hai cái này "sinh ra để dành cho nhau"?

Hexagonal Architecture tạo ra **mock points tự nhiên** tại mỗi port interface. Với TDD, điều này cực kỳ có giá trị vì:

**1. Test domain logic hoàn toàn tách biệt**

```typescript
// Test VerifyTokenUseCase mà không cần Firebase thật
const mockTokenVerifier: ITokenVerifier = {
  verifyToken: jest.fn().mockResolvedValue({
    uid: 'user-123',
    email: 'test@example.com'
  })
};

const useCase = new VerifyTokenUseCase(mockTokenVerifier);
const result = await useCase.verifyToken('fake-token');

expect(result.uid).toBe('user-123');
expect(mockTokenVerifier.verifyToken).toHaveBeenCalledWith('fake-token');
```

**2. Test adapter riêng lẻ**

```typescript
// Test FirebaseTokenVerifier với Firebase mock
jest.mock('firebase-admin');

const verifier = new FirebaseTokenVerifier();
const result = await verifier.verifyToken('valid-token');

expect(result.uid).toBeDefined();
```

**3. Test HTTP layer không cần real logic**

```typescript
// Test authMiddleware với mock IAuthService
const mockAuthService: IAuthService = {
  verifyToken: jest.fn().mockResolvedValue({ uid: '123', email: 'test@test.com' })
};

const app = createApp(mockAuthService); // inject mock
const res = await request(app)
  .post('/auth/verify')
  .set('Authorization', 'Bearer valid-token');

expect(res.status).toBe(200);
```

### Tại sao phải tách `server.ts` và `index.ts` khi làm TDD

Đây là một quyết định kiến trúc quan trọng khi áp dụng TDD:

```
index.ts   → app.listen(PORT)  ← KHÔNG import trong test (sẽ mở port thật)
server.ts  → createApp()       ← Import trong test (chỉ tạo Express app)
```

Nếu gộp `app.listen()` vào `server.ts`, mỗi lần chạy test sẽ thực sự mở port → **conflict port** giữa các test suite → CI/CD chạy parallel sẽ fail. Tách ra giúp test file có thể import `createApp()` và tạo app instance mà không block bất kỳ port nào.

---

## 9. Áp dụng vào project thực tế của tôi

```
mindx-intern04-week01/
├── api/                                             # Backend API application
│   ├── src/                                         # Backend source code (Hexagonal Architecture)
│   │   ├── adapters/                                # Connects the domain to the outside world
│   │   │   ├── inbound/                             # Driving adapters — receive requests from outside
│   │   │   │   └── http/
│   │   │   │       ├── middleware/
│   │   │   │       │   ├── authMiddleware.ts        # Parses Bearer token, calls IAuthService, attaches user to request
│   │   │   │       │   └── authMiddleware.test.ts   # Unit test: header validation, 401/500 cases, next() behavior
│   │   │   │       └── routes/
│   │   │   │           ├── authRoutes.ts            # POST /auth/verify-token — token verification
│   │   │   │           ├── authRoutes.test.ts       # Integration test: POST /auth/verify-token via supertest
│   │   │   │           ├── protectedRoutes.ts       # GET /protected/profile — auth-required route
│   │   │   │           └── protectedRoutes.test.ts  # Integration test: GET /protected/profile via supertest
│   │   │   └── outbound/                            # Driven adapters — domain calls out to external services
│   │   │       └── firebase/
│   │   │           ├── firebaseAdmin.ts             # Initializes Firebase Admin SDK (singleton)
│   │   │           └── FirebaseTokenVerifier.ts     # implements ITokenVerifier using Firebase Admin
│   │   ├── application/                             # Use cases — orchestrate business logic
│   │   │   └── auth/
│   │   │       ├── VerifyTokenUseCase.ts            # implements IAuthService, calls ITokenVerifier
│   │   │       └── VerifyTokenUseCase.test.ts       # Unit test: valid token → User, invalid token → AuthError
│   │   ├── domain/                                  # Core — no dependency on any framework
│   │   │   ├── entities/
│   │   │   │   └── User.ts                          # User entity (uid, email, name)
│   │   │   └── errors/
│   │   │       ├── AuthError.ts                     # Domain error types (AuthError, AuthErrorCode)
│   │   │       └── AuthError.test.ts                # Unit test: mapFirebaseError() — all error code mappings
│   │   ├── ports/                                   # Interfaces — contracts between layers
│   │   │   ├── inbound/
│   │   │   │   └── IAuthService.ts                  # Primary port: verifyToken(token) → User
│   │   │   └── outbound/
│   │   │       └── ITokenVerifier.ts                # Secondary port: verifyToken(token) → DecodedToken
│   │   ├── server.ts                                # Composition root: DI wiring + Express app factory
│   │   ├── index.ts                                 # Entry point: boots server, initializes AppInsights
│   │   └── polyfills.ts                             # Crypto polyfill for Alpine Linux (loaded first)
│   ├── k8s/
│   │   ├── deployment.yaml                          # Backend Deployment manifest
│   │   └── service.yaml                             # Backend Service manifest
│   ├── jest.config.js                               # Jest config: preset ts-jest, testEnvironment node
│   ├── Dockerfile                                   # Backend container config
│   ├── .dockerignore                                # Docker ignore rules for backend
│   ├── package.json                                 # Backend dependencies
│   ├── tsconfig.json                                # TypeScript configuration
│   ├── firebase-service-account.json                # Firebase Admin credentials (not in git)
│   └── .env                                         # Backend environment variables (not in git)
│
├── web/                                             # Frontend React application
│   ├── src/                                         # React source code (Hexagonal Architecture)
│   │   ├── domain/                                  # Core — no dependency on Firebase or React
│   │   │   ├── entities/
│   │   │   │   └── User.ts                          # User entity (uid, email, displayName)
│   │   │   └── errors/
│   │   │       ├── AuthError.ts                     # AuthError, AuthErrorCode, mapFirebaseError()
│   │   │       └── AuthError.test.ts                # Unit test: mapFirebaseError() — all Firebase error codes
│   │   ├── ports/                                   # Interfaces — contracts for adapters to implement
│   │   │   ├── IAuthPort.ts                         # login, signUp, logout, getToken, onAuthStateChanged
│   │   │   └── IAnalyticsPort.ts                    # init, trackPageView, trackEvent
│   │   ├── application/                             # Use cases — orchestrate logic, call ports
│   │   │   └── auth/
│   │   │       ├── LoginUseCase.ts                  # Calls IAuthPort.login + tracks analytics
│   │   │       ├── LoginUseCase.test.ts             # Unit test: success/failure, analytics tracking order
│   │   │       ├── SignUpUseCase.ts                 # Calls IAuthPort.signUp + tracks analytics
│   │   │       └── SignUpUseCase.test.ts            # Unit test: success/failure, analytics tracking order
│   │   ├── adapters/                                # Port implementations
│   │   │   ├── inbound/                             # UI layer — React components and pages
│   │   │   │   ├── components/
│   │   │   │   │   ├── authForm/
│   │   │   │   │   │   ├── AuthForm.tsx             # Login/signup form, uses useAuth()
│   │   │   │   │   │   ├── AuthForm.test.tsx        # Component test: render, submit, error display, toggle
│   │   │   │   │   │   └── AuthForm.css
│   │   │   │   │   └── authTest/
│   │   │   │   │       ├── ApiTest.tsx              # Tests API connectivity (health check + root)
│   │   │   │   │       └── ApiTest.css
│   │   │   │   └── pages/
│   │   │   │       ├── home/
│   │   │   │       │   ├── Home.tsx                 # Main page, redirects if not logged in
│   │   │   │       │   └── Home.css
│   │   │   │       └── login/
│   │   │   │           ├── Login.tsx                # Login page, renders AuthForm
│   │   │   │           └── Login.css
│   │   │   └── outbound/                            # External service adapters
│   │   │       ├── firebase/
│   │   │       │   ├── FirebaseAuthAdapter.ts       # implements IAuthPort using Firebase Auth SDK
│   │   │       │   └── firebaseConfig.ts            # Initializes Firebase app + exports auth instance
│   │   │       ├── api/
│   │   │       │   └── apiAdapter.ts                # Axios client + interceptors to auto-attach token
│   │   │       └── analytics/
│   │   │           └── GoogleAnalyticsAdapter.ts    # implements IAnalyticsPort using react-ga4
│   │   ├── context/
│   │   │   └── AuthContext.tsx                      # React context — receives IAuthPort and IAnalyticsPort via props
│   │   ├── setupTests.ts                            # Vitest setup: import @testing-library/jest-dom
│   │   ├── App.tsx                                  # Composition root: initializes adapters, injects into AuthProvider
│   │   ├── App.css
│   │   ├── index.tsx                                # React entry point
│   │   └── index.css                                # Global styles
│   ├── k8s/
│   │   ├── deployment.yaml                          # Frontend Deployment manifest
│   │   └── service.yaml                             # Frontend Service manifest
│   ├── public/                                      # Static assets
│   ├── Dockerfile                                   # Frontend container config
│   ├── .dockerignore                                # Docker ignore rules for frontend
│   ├── .env                                         # Frontend environment variables (not in git)
│   ├── package.json                                 # Frontend dependencies
│   └── vite.config.ts                               # Vite + Vitest configuration
│
├── infrastructure/                                  # Infrastructure as Code
│   └── k8s/
│       ├── namespace.yaml                           # Dev namespace configuration
│       ├── cloudflare-tunnel.yaml                   # Cloudflare Tunnel deployments (BE + FE)
│       ├── ingress.yaml                             # NGINX Ingress rules (optional)
│       └── letsencrypt-prod.yaml                    # Let's Encrypt issuer (optional)
│
├── docs/                                            # Documentation
│   ├── week-01/                                     # Code & deploy completion reports
│   │   ├── REPORT-WEEK01.md
│   │   ├── 01-SETUP-ACR-AND-API-DEPLOYMENT.md
│   │   ├── 02-DEPLOY-BACKEND-TO-AKS.md
│   │   ├── 03-SETUP-INGRESS-CONTROLLER.md
│   │   ├── 04-DEPLOY-FRONTEND-TO-AKS.md
│   │   ├── 05-FIREBASE-AUTHENTICATION-FLOW.md
│   │   └── 06-SETUP-HTTPS-WITH-CLOUDFLARE-TUNNEL.md
│   ├── week-02/                                     # Monitoring completion reports
│   │   ├── REPORT-WEEK02.md
│   │   ├── SETUP-AZURE-APP-INSIGHT.md
│   │   └── SET-UP-GOOGLE-ANALYTICS.md
│   ├── week-04/                                     # Scenario completion reports
│   │   ├── REPORT-WEEK04.md
│   │   ├── SCENARIO-01-LOGIN-ISSUE-COMPLETION-REPORT.md
│   │   ├── SCENARIO-02-PERFORMANCE-PROBLEM-COMPLETION-REPORT.md
│   │   ├── SCENARIO-03-CRITICAL-BUG-COMPLETION-REPORT.md
│   │   ├── SCENARIO-04-FEATURE-REQUEST-COMPLETION-REPORT.md
│   │   ├── SCENARIO-05-MULTI-USER-COMPLETION-REPORT.md
│   │   └── SCENARIO-06-DEADLINE-REQUEST-COMPLETION-REPORT.md
│   └── week-05/                                     # Reporting & automation
│       ├── REPORT-WEEK05.md
│       ├── REPORTING-ANALYSIS-AND-FINDINGS.md
│       ├── AUTOMATION-REPORT.md
│       └── login_issue_automation.py
│
├── .gitignore                                       # Git ignore rules
└── README.md                                        # Project overview
```

### Dependency Injection ở Composition Root

Toàn bộ wiring xảy ra tại một điểm duy nhất — **composition root**:

**Backend (`server.ts`):**
```typescript
// Chỉ server.ts biết về Firebase và use case cụ thể
const tokenVerifier = new FirebaseTokenVerifier();   // outbound adapter
const authService = new VerifyTokenUseCase(tokenVerifier); // use case

export const createApp = () => {
  const app = express();
  app.use('/auth', createAuthRouter(authService));   // inject vào router
  return app;
};
```

**Frontend (`App.tsx`):**
```typescript
// Chỉ App.tsx biết về adapter cụ thể
const authPort = new FirebaseAuthAdapter();
const analyticsPort = new GoogleAnalyticsAdapter();

function App() {
  return (
    <AuthProvider authPort={authPort} analyticsPort={analyticsPort}>
      {/* ... */}
    </AuthProvider>
  );
}
```

---

## 10. References

### Bài viết

- [Hexagonal Architecture là gì và ứng dụng của nó — Viblo](https://viblo.asia/p/hexagonal-architecture-la-gi-va-ung-dung-cua-no-4dbZNR88ZYM)
- [Hexagonal Architecture: Ports and Adapters Explained — Medium](https://medium.com/@tejasrawat_82721/hexagonal-architecture-ports-and-adapters-explained-a-practical-guide-from-concept-to-code-7903053f38f4)
- [Hexagonal Architecture: A Complete Guide — dev.to](https://dev.to/sizan_mahmud0_e7c3fd0cb68/hexagonal-architecture-a-complete-guide-to-building-flexible-and-testable-applications-k1l)
- [Kiến thức cơ bản về TDD — Viblo](http://viblo.asia/p/kien-thuc-co-ban-ve-tdd-test-driven-development-Do754AWLKM6)
- [Test-Driven Development — IBM Think](https://www.ibm.com/think/topics/test-driven-development)
- MindX Hexagonal Architecture slides

### Video

- [Hexagonal Architecture (All You Need to Know)](https://www.youtube.com/watch?v=k_GkYMd8Ouc)
- [Giới thiệu Hexagonal và so sánh với Clean Architecture](https://www.youtube.com/watch?v=gVZM61e-uJw)
- [Hexagonal, Onion & Clean Architecture](https://www.youtube.com/watch?v=JubdZIdLQ4M)