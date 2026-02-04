import './polyfills';

import * as appInsights from 'applicationinsights';
appInsights.setup().start();
const client = appInsights.defaultClient; // Lưu client để dùng cho custom tracking

import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import protectedRoutes from './routes/protectedRoutes';

// Initialize Firebase (import để đảm bảo admin init trước khi dùng)
import './config/firebaseConfig';

dotenv.config();

const app = express();

// CORS Configuration
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

// Apply middlewares
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CUSTOM MIDDLEWARE: Track Request Count
app.use((req: Request, res: Response, next: NextFunction) => {
  // Track custom metric: số lượng requests theo endpoint
  client.trackMetric({
    name: 'RequestCount',
    value: 1,
    properties: {
      endpoint: req.path,
      method: req.method
    }
  });
  next();
});

const PORT = process.env.PORT || 3000;

// ─── Public Routes ─────────────────────────────────────────────────────────────
// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
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
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'API is running',
    endpoints: ['/health', '/hello', '/auth/verify', '/protected/profile'],
  });
});

// ─── Auth Routes ───────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);

// ─── Protected Routes ──────────────────────────────────────────────────────────
app.use('/protected', protectedRoutes);

// ─── Error Handler ─────────────────────────────────────────────────────────────
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Track exception trong Application Insights
  client.trackException({
    exception: err,
    properties: {
      endpoint: req.path,
      method: req.method,
      userAgent: req.headers['user-agent']
    }
  });

  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});