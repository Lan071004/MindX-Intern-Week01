import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

import { FirebaseTokenVerifier } from './adapters/outbound/firebase/FirebaseTokenVerifier';
import { VerifyTokenUseCase } from './application/auth/VerifyTokenUseCase';
import { createAuthRouter } from './adapters/inbound/http/routes/authRoutes';
import { createProtectedRouter } from './adapters/inbound/http/routes/protectedRoutes';


// ─── CORS Configuration ─────────────────────────────────────────────────────────────
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Cho phép requests không có origin (như Postman, curl)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8080',
      'http://localhost',
      'http://52.253.121.200',
      'https://exec-subject-wesley-make.trycloudflare.com',
      'https://doom-elvis-carries-terrorist.trycloudflare.com',
    ];

    // Cho phép tất cả Cloudflare Tunnel domains
    if (origin.includes('.trycloudflare.com') || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  // THÊM headers và methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};


// ─── Dependency Injection ─────────────────────────────────────────────────────────────
// Đây là nơi duy nhất biết về Firebase - wire outbound adapter -> use case
const tokenVerifier = new FirebaseTokenVerifier();
const authService = new VerifyTokenUseCase(tokenVerifier);


// ─── Express App ─────────────────────────────────────────────────────────────
export const createApp = (appInsightsClient?: any) => {
  const app = express();

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')); // đăng ký middleware morgan để log mọi HTTP request; nếu NODE_ENV = production thì dùng format 'combined' (log chi tiết gồm IP, method, URL, status, user-agent...), còn nếu không thì dùng format 'dev' (log ngắn gọn, dễ đọc khi phát triển)

    // CUSTOM MIDDLEWARE: Track Request Count (Application Insights)
    if (appInsightsClient) {
      app.use((req: Request, _res: Response, next: NextFunction) => {
       appInsightsClient.trackMetric({
          name: 'RequestCount',
          value: 1,
          properties: {
            endpoint: req.path,
            method: req.method
          }
        });
        next();
      });
    }


// ─── Public Routes ─────────────────────────────────────────────────────────────
// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Hello world endpoint
app.get('/hello', (req: Request, res: Response) => {
  const name = (req.query.name as string) || 'World';
  res.status(200).json({ message: `Hello, ${name}!` });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'API is running',
    endpoints: ['/health', '/hello', '/auth/verify', '/protected/profile'],
  });
});

  
// ─── Feature Routes (inject authService) ────────────────────────────────────
app.use('/api/auth', createAuthRouter(authService));
app.use('/api/protected', createProtectedRouter(authService));


// ─── Error Handler ─────────────────────────────────────────────────────────────
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Track exception trong Application Insights
  if (appInsightsClient) {
    appInsightsClient.trackException({
      exception: err,
      properties: {
        endpoint: req.path,
        method: req.method,
        userAgent: req.headers['user-agent']
      }
    });
  }
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
};