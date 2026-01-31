import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

dotenv.config();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Cho phép requests không có origin (như mobile apps hoặc curl)
    if (!origin) return callback(null, true);
    
    // Allowed origins
    const allowedOrigins = [
      'http://localhost:5173',      // Vite dev server
      'http://localhost:3000',      // CRA dev server
      'http://localhost:8080',      // Docker test
      'http://localhost',
      // Thêm domain production của bạn sau khi deploy
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply middlewares
app.use(cors(corsOptions));  // ← Enable CORS
app.use(helmet());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
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
    endpoints: ['/health', '/hello']
  });
});

// Basic error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});